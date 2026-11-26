#!/usr/bin/env node
/**
 * Phase 6 · AI Stack & Config Workbench 全量质量门（零依赖，node:test）。
 * 用法：node --test scripts/test-workbench.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { estimateWorkbench, generateArtifacts, STACKS, IDES, buildDryRunContract, evaluateDryRunResult, parseServerTimingMs, SCENARIO_DRY_RUNS } from '../src/lib/workbench/generator.mjs';
import { INPUT_USD_PER_MILLION } from '../server/plans.mjs';
import { cleanQuestions, toUpstreamQuestions } from '../server/questions.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

const LANGS = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];

const BASE_INPUT = {
  scenario: { slug: 'payment-retry', completionPct: 90, autoHandledPct: 75 },
  gpu: { vramGb: 32, name: 'RTX 5090' },
  monthlyRequests: 5_000_000,
  avgInputTokens: 600,
};

// ---------- estimateWorkbench ----------

test('估算结果处于合法区间：完成度 [45,99] 且自动化率与升级率之和为 100', () => {
  const scenarios = [
    {},
    BASE_INPUT,
    { ...BASE_INPUT, horizon: '2026-2027', posture: 'regulated' },
    { ...BASE_INPUT, horizon: '2025-2026', posture: 'strict' },
    { ...BASE_INPUT, scenario: { ...BASE_INPUT.scenario, completionPct: 5, autoHandledPct: 0 } },
    { ...BASE_INPUT, scenario: { ...BASE_INPUT.scenario, completionPct: 200, autoHandledPct: 100 } },
  ];
  for (const input of scenarios) {
    const est = estimateWorkbench(input);
    assert.ok(est.completionPct >= 45 && est.completionPct <= 99, `completionPct=${est.completionPct}`);
    assert.equal(est.autoHandledPct + est.escalationPct, 100, '自动化率与升级率不等于 100');
  }
});

test('jevMonthlyUsd 严格按 $0.042 / 1M 输入 token 计价（误差 < 0.01）', () => {
  for (const input of [BASE_INPUT, { ...BASE_INPUT, monthlyRequests: 12_345_678, avgInputTokens: 1234 }]) {
    const est = estimateWorkbench(input);
    const expected = (est.monthlyInputTokens / 1_000_000) * INPUT_USD_PER_MILLION;
    assert.ok(
      Math.abs(est.jevMonthlyUsd - expected) < 0.01,
      `jevMonthlyUsd=${est.jevMonthlyUsd} expected=${expected}`,
    );
  }
});

test('节省额非负且节省比例处于 [0,100]', () => {
  for (const input of [BASE_INPUT, { ...BASE_INPUT, horizon: '2026-2027' }, { ...BASE_INPUT, monthlyRequests: 10_000 }]) {
    const est = estimateWorkbench(input);
    assert.ok(est.monthlySavingsUsd >= 0, `monthlySavingsUsd=${est.monthlySavingsUsd}`);
    assert.ok(est.savingsPct >= 0 && est.savingsPct <= 100, `savingsPct=${est.savingsPct}`);
  }
});

test('2026-2027 完成度不低于 2025-2026，future_roadmap 显著更高', () => {
  const now = estimateWorkbench({ ...BASE_INPUT, horizon: '2025-2026' });
  const future = estimateWorkbench({ ...BASE_INPUT, horizon: '2026-2027' });
  assert.ok(future.completionPct >= now.completionPct, `${future.completionPct} < ${now.completionPct}`);

  const roadmapNow = estimateWorkbench({
    ...BASE_INPUT,
    horizon: '2025-2026',
    scenario: { ...BASE_INPUT.scenario, maturity: 'future_roadmap' },
  });
  const roadmapFuture = estimateWorkbench({
    ...BASE_INPUT,
    horizon: '2026-2027',
    scenario: { ...BASE_INPUT.scenario, maturity: 'future_roadmap' },
  });
  assert.ok(
    roadmapFuture.completionPct - roadmapNow.completionPct >= 8,
    `future_roadmap 提升不足：${roadmapNow.completionPct} -> ${roadmapFuture.completionPct}`,
  );
});

test('regulated 姿态的自动化占比低于 balanced', () => {
  const balanced = estimateWorkbench({ ...BASE_INPUT, posture: 'balanced' });
  const regulated = estimateWorkbench({ ...BASE_INPUT, posture: 'regulated' });
  assert.ok(
    regulated.autoHandledPct < balanced.autoHandledPct,
    `regulated=${regulated.autoHandledPct} balanced=${balanced.autoHandledPct}`,
  );
});

test('gpuFit 按显存与请求量给出 cluster_scale / local_fit / hybrid_recommended', () => {
  assert.equal(estimateWorkbench({ ...BASE_INPUT, gpu: { vramGb: 80 } }).gpuFit, 'cluster_scale');
  assert.equal(estimateWorkbench({ ...BASE_INPUT, gpu: { vramGb: 128 } }).gpuFit, 'cluster_scale');
  assert.equal(
    estimateWorkbench({ ...BASE_INPUT, gpu: { vramGb: 32 }, monthlyRequests: 5_000_000 }).gpuFit,
    'local_fit',
  );
  assert.equal(estimateWorkbench({ ...BASE_INPUT, gpu: { vramGb: 16 } }).gpuFit, 'hybrid_recommended');
});

// ---------- generateArtifacts ----------

const ARTIFACT_FIELDS = [
  'jevConfigYaml',
  'agentRulesFilename',
  'agentRulesMd',
  'starterFilename',
  'starterCode',
  'verifierFilename',
  'verifierCode',
  'bootstrapFilename',
  'bootstrapScript',
];

// 针对真实密钥形态，避免把规则文案里的禁用示例「`jev_live_` literals」误判为硬编码密钥。
const SECRET_PATTERNS = [
  { name: 'sk-', re: /sk-[A-Za-z0-9_-]{12,}/ },
  { name: '123321', re: /123321/ },
  { name: 'jev_live_', re: /jev_live_[A-Za-z0-9_-]{12,}/ },
];
const DOUBLE_DOLLAR_DIGIT = /\$\$\d/;

function allArtifacts() {
  const out = [];
  for (const stack of STACKS) {
    for (const ide of IDES) {
      out.push({
        label: `${stack.id}/${ide.id}`,
        artifacts: generateArtifacts({ ...BASE_INPUT, stack: stack.id, ide: ide.id }),
      });
    }
  }
  return out;
}

test('6 技术栈 × 5 IDE 全部产出非空产物，并含 judge 端点与 clavue-jev 模型', () => {
  assert.equal(STACKS.length, 6);
  assert.equal(IDES.length, 5);
  const combos = allArtifacts();
  assert.equal(combos.length, 30);
  for (const { label, artifacts } of combos) {
    for (const field of ARTIFACT_FIELDS) {
      assert.equal(typeof artifacts[field], 'string', `${label}.${field} 非字符串`);
      assert.ok(artifacts[field].trim().length > 0, `${label}.${field} 为空`);
    }
    const bundle = ARTIFACT_FIELDS.map((field) => artifacts[field]).join('\n');
    assert.ok(bundle.includes('https://api.jevcode.ai/v1/judge'), `${label} 缺少 judge 端点`);
    assert.ok(bundle.includes('clavue-jev'), `${label} 缺少 clavue-jev 模型`);
  }
});

test('全部产物零硬编码密钥形态、零 $$ 后跟数字的模板残留', () => {
  for (const { label, artifacts } of allArtifacts()) {
    for (const field of ARTIFACT_FIELDS) {
      const text = artifacts[field];
      for (const { name, re } of SECRET_PATTERNS) {
        assert.equal(re.test(text), false, `${label}.${field} 含硬编码密钥模式 ${name}`);
      }
      assert.equal(DOUBLE_DOLLAR_DIGIT.test(text), false, `${label}.${field} 含 $$ 数字残留`);
    }
  }
});

test('bootstrap 脚本以 bash shebang 开头并使用单引号 heredoc 写入全部四份产物', () => {
  for (const { label, artifacts } of allArtifacts()) {
    const script = artifacts.bootstrapScript;
    assert.ok(script.startsWith('#!/usr/bin/env bash'), `${label} 缺 bash shebang`);
    const heredocs = script.match(/<<'JEV_/g) || [];
    assert.ok(heredocs.length >= 4, `${label} 单引号 heredoc 数量 ${heredocs.length} < 4`);
  }
});

// ---------- Phase 6 WebP 配图 ----------

test('三张 Phase 6 WebP 配图存在、magic bytes 正确且均大于 10 KB', () => {
  for (const name of ['hero', 'export', 'readiness']) {
    const rel = `public/img/guides/workbench-${name}.webp`;
    const buf = readFileSync(path.join(root, rel));
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', `${rel} 缺 RIFF`);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', `${rel} 缺 WEBP`);
    assert.ok(buf.length > 10 * 1024, `${rel} 仅 ${buf.length} 字节`);
  }
});

// ---------- 八语覆盖 ----------

const workbenchI18n = await import('../src/i18n/pages/workbench.ts');
const uiI18n = await import('../src/i18n/ui.ts');

test('workbench.ts 每个本地化字段都覆盖全部 8 语且非空', () => {
  const entries = Object.entries(workbenchI18n);
  assert.ok(entries.length > 20, `workbench 导出字段仅 ${entries.length} 个`);
  for (const [name, value] of entries) {
    assert.ok(value && typeof value === 'object', `workbench.${name} 非本地化对象`);
    for (const lang of LANGS) {
      assert.equal(typeof value[lang], 'string', `workbench.${name}.${lang} 非字符串`);
      assert.ok(value[lang].trim().length > 0, `workbench.${name}.${lang} 为空`);
    }
  }
});

test('ui.ts 覆盖 8 语的 workbench 导航与首页描述，且无过时的 Three catalogs 文案', () => {
  assert.deepEqual(Object.keys(uiI18n.ui).sort(), [...LANGS].sort());
  for (const lang of LANGS) {
    assert.ok(uiI18n.ui[lang]['nav.workbench']?.trim(), `ui.${lang}.nav.workbench 缺失`);
    assert.ok(uiI18n.ui[lang]['home.matrix.workbenchDesc']?.trim(), `ui.${lang}.home.matrix.workbenchDesc 缺失`);
  }
  assert.equal(read('src/i18n/ui.ts').includes('Three catalogs'), false, '存在过时的 Three catalogs 文案');
});

// ---------- 回归检查 ----------

test('回归：场景配置与文案中无历史遗留错译', () => {
  const configs = read('src/data/configs.ts');
  assert.equal(configs.includes('Zukonfiguration'), false, 'configs.ts 含 Zukonfiguration');
  assert.equal(configs.includes('級联ルーター'), false, 'configs.ts 含 級联ルーター');
  assert.equal(
    read('src/i18n/pages/configs.ts').includes('Maturity de complétion'),
    false,
    'configs i18n 含 Maturity de complétion',
  );
});

// ---------- 可访问性与页面结构 ----------

test('五个关键页面均含 role="progressbar" 且不含 <main 标签', () => {
  const pages = [
    'src/pages/[lang]/workbench/index.astro',
    'src/pages/[lang]/vibecoding/index.astro',
    'src/pages/[lang]/vibecoding/[slug].astro',
    'src/pages/[lang]/configs/index.astro',
    'src/pages/[lang]/configs/[slug].astro',
  ];
  for (const rel of pages) {
    const src = read(rel);
    assert.ok(src.includes('role="progressbar"'), `${rel} 缺 role="progressbar"`);
    assert.equal(/<main\b/.test(src), false, `${rel} 含 <main 标签`);
  }
});

// ---------- 部署与 SEO 接入 ----------

test('nginx 裸路径重定向与 SEO 脚本均已接入 workbench', () => {
  const conf = read('deploy/nginx/jevcode.conf');
  const line = conf.split('\n').find((row) => row.includes('location ~ ^/(jev|compare|'));
  assert.ok(line, '找不到裸路径 location 正则');
  assert.match(line, /workbench/, '裸路径正则未覆盖 workbench');
  assert.ok(read('scripts/generate-llms-txt.mjs').includes('workbench'), 'generate-llms-txt.mjs 未接入 workbench');
  assert.ok(read('scripts/sitemap-lastmod.mjs').includes('workbench'), 'sitemap-lastmod.mjs 未接入 workbench');
});

// ---------- Phase 7 · Live Dry-Run 契约与策略裁决 ----------

test('buildDryRunContract 覆盖 configs.ts 全部 20 个场景且常规/高风险样本合法且相异', () => {
  const configsSrc = read('src/data/configs.ts');
  const slugs = [...configsSrc.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(slugs.length, 20, `预期 20 个场景 slug，实测 ${slugs.length}`);
  for (const slug of slugs) {
    const c = buildDryRunContract({ scenario: { slug }, posture: 'balanced', horizon: '2025-2026' });
    assert.equal(c.scenarioSlug, slug);
    assert.ok(c.normalState.length >= 20 && c.normalState.length <= 1000, `${slug} normalState 长度异常`);
    assert.ok(c.riskState.length >= 20 && c.riskState.length <= 1000, `${slug} riskState 长度异常`);
    assert.notEqual(c.normalState, c.riskState, `${slug} normalState 与 riskState 相同`);
  }
});

test('buildDryRunContract 问题结构 100% 通过 cleanQuestions 与 toUpstreamQuestions 校验', () => {
  const c = buildDryRunContract({ scenario: { slug: 'edge-api-abuse-firewall' }, posture: 'strict', horizon: '2026-2027' });
  const cleaned = cleanQuestions(c.questions);
  assert.ok(cleaned, 'cleanQuestions 返回 null');
  assert.deepEqual(Object.keys(cleaned), ['decision', 'risk_score', 'route_lane']);
  const upstream = toUpstreamQuestions(cleaned);
  assert.ok(upstream.decision.criteria && Object.keys(upstream.decision.criteria).length === 2);
  assert.ok(upstream.route_lane.criteria && Object.keys(upstream.route_lane.criteria).length >= 2);
  assert.equal(upstream.risk_score.type, 'noul');
});

test('balanced -> strict -> regulated 策略阈值逐级收紧且与 YAML 完全对齐', () => {
  const b = buildDryRunContract({ posture: 'balanced' });
  const s = buildDryRunContract({ posture: 'strict' });
  const r = buildDryRunContract({ posture: 'regulated' });
  assert.ok(b.thresholds.autoAllowBelow > s.thresholds.autoAllowBelow && s.thresholds.autoAllowBelow > r.thresholds.autoAllowBelow);
  assert.ok(b.thresholds.escalateAtOrAbove > s.thresholds.escalateAtOrAbove && s.thresholds.escalateAtOrAbove > r.thresholds.escalateAtOrAbove);
  const yaml = generateArtifacts({ scenario: { slug: 'edge-api-abuse-firewall' }, posture: 'regulated' }).jevConfigYaml;
  assert.ok(yaml.includes(`auto_allow_below: ${r.thresholds.autoAllowBelow}`));
  assert.ok(yaml.includes(`escalate_at_or_above: ${r.thresholds.escalateAtOrAbove}`));
});

test('evaluateDryRunResult 正确判定放行与三种升级触发分支', () => {
  const c = buildDryRunContract({ scenario: { slug: 'edge-api-abuse-firewall' }, posture: 'balanced' });
  const pass = evaluateDryRunResult({
    answers: {
      decision: { choice: 'auto_handle', confidence: 0.92 },
      risk_score: { noul: 0.12 },
      route_lane: { choice: 'edge_cache', confidence: 0.90 },
    },
  }, c);
  assert.equal(pass.verdict, 'auto_handled');
  assert.deepEqual(pass.triggers, ['policy_pass']);

  const escChoice = evaluateDryRunResult({
    answers: { decision: { choice: 'escalate', confidence: 0.95 }, risk_score: { noul: 0.2 } },
  }, c);
  assert.equal(escChoice.verdict, 'escalated');
  assert.ok(escChoice.triggers.includes('choice_escalate'));

  const escRisk = evaluateDryRunResult({
    answers: { decision: { choice: 'auto_handle', confidence: 0.95 }, risk_score: { noul: 0.88 } },
  }, c);
  assert.equal(escRisk.verdict, 'escalated');
  assert.ok(escRisk.triggers.includes('risk_threshold'));

  const escLowConf = evaluateDryRunResult({
    answers: { decision: { choice: 'auto_handle', confidence: 0.40 }, risk_score: { noul: 0.20 } },
  }, c);
  assert.equal(escLowConf.verdict, 'escalated');
  assert.ok(escLowConf.triggers.includes('low_confidence'));
});

test('parseServerTimingMs 正确解析 upstream 耗时并兜底异常输入', () => {
  assert.equal(parseServerTimingMs('upstream;dur=74.2'), 74);
  assert.equal(parseServerTimingMs('cache;desc="hit", upstream;dur=120.6'), 121);
  assert.equal(parseServerTimingMs(''), null);
  assert.equal(parseServerTimingMs(null), null);
  assert.equal(parseServerTimingMs('upstream;dur=abc'), null);
});

test('workbench/index.astro 接入 /api/try、不含 innerHTML 且不含 <main', () => {
  const src = read('src/pages/[lang]/workbench/index.astro');
  assert.ok(src.includes('/api/try'), '缺少 /api/try 调用');
  assert.ok(src.includes('data-dryrun'), '缺少 data-dryrun 容器');
  assert.equal(src.includes('innerHTML'), false, 'workbench/index.astro 不应使用 innerHTML');
  assert.equal(/<main\b/.test(src), false, 'workbench/index.astro 含嵌套 <main');
});

test('generator.mjs 保持浏览器安全：零 Node 内置模块与服务端模块引用', () => {
  const src = read('src/lib/workbench/generator.mjs');
  const runtimeCode = src.split('function buildVerifier')[0];
  assert.equal(/node:/.test(runtimeCode), false, 'generator.mjs 不得引用 node:* 模块');
  assert.equal(src.includes('questions.mjs'), false, 'generator.mjs 不得引用 server/questions.mjs');
});
