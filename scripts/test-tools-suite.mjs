#!/usr/bin/env node
/**
 * Phase 8 · Visual Tools 质量门（零依赖，node:test）。
 * 用法：node --test scripts/test-tools-suite.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  NAME_RE,
  estimateBillableTokens,
  validateSchemaDraft,
  computeCascadeFlow,
  computeThresholdCurve,
  summarizeBatchResults,
  analyzeVibeWaves,
  computeLatencyWaterfall,
  buildSdkSnippet,
  computeRoiProjection,
  PROMPT_SAFETY_VECTORS,
  scoreSafetyMatrixPoint,
  computeCreditRunway,
} from '../src/lib/tools/engines.mjs';
import { cleanQuestions, toUpstreamQuestions, billableInputTokens } from '../server/questions.mjs';
import { inputTokensLeft, SIGNUP_CREDIT_MICROUSD } from '../server/plans.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const LANGS = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];
const EXPECTED_SLUGS = [
  'schema-studio', 'cascade-flow', 'threshold-lab', 'batch-matrix',
  'vibe-gate-builder', 'latency-budget', 'curl-sdk-studio', 'cost-calculator',
  'prompt-gate-tester', 'credit-runway',
];
const SAMPLE_QUESTIONS = {
  needs_human: { type: 'noul', instructions: 'Does this request need a human agent?' },
  queue: { type: 'choice', instructions: 'Target queue', options: ['billing', 'technical', 'sales'] },
};

test('validateSchemaDraft: 合法 schema 通过，非法字段名与空选项被拒绝', () => {
  const state = 'A verified customer asks for a copy of their VAT invoice.';
  const valid = validateSchemaDraft(state, SAMPLE_QUESTIONS);
  assert.equal(valid.ok, true, JSON.stringify(valid.errors));
  assert.equal(valid.questionCount, 2);
  assert.ok(valid.tokens > 0);
  assert.match(valid.usdFormatted, /^\$\d+\.\d{2}$/);
  assert.equal(validateSchemaDraft('short', SAMPLE_QUESTIONS).ok, false);
  assert.equal(validateSchemaDraft(state, { 'Bad-Name': { type: 'noul', instructions: 'x' } }).ok, false);
  assert.equal(NAME_RE.test('needs_human'), true);
  assert.equal(NAME_RE.test('Bad-Name'), false);
  const emptyOption = {
    queue: { type: 'choice', instructions: 'Target queue', options: ['billing', '  '] },
  };
  assert.equal(validateSchemaDraft(state, emptyOption).ok, false);
  assert.equal(validateSchemaDraft(state, {}).ok, false);
});

test('estimateBillableTokens: 与 server/questions.mjs 的清洗/上游转换与计费口径一致', () => {
  const state = 'Invoice copy request with an order number and a billing question.';
  const cleaned = cleanQuestions(SAMPLE_QUESTIONS);
  const upstream = toUpstreamQuestions(cleaned);
  assert.ok(cleaned);
  assert.deepEqual(Object.keys(cleaned).sort(), ['needs_human', 'queue']);
  assert.deepEqual(upstream.queue.criteria, {
    billing: 'billing', technical: 'technical', sales: 'sales',
  });
  assert.equal(validateSchemaDraft(state, cleaned).ok, true);
  assert.equal(estimateBillableTokens(state, SAMPLE_QUESTIONS), estimateBillableTokens(state, cleaned));
  assert.ok(estimateBillableTokens(state, cleaned) > 0);
  assert.equal(billableInputTokens(state, cleaned), estimateBillableTokens(state, cleaned));
  assert.ok(billableInputTokens(state, upstream) >= billableInputTokens(state, cleaned));
  assert.equal(estimateBillableTokens('', {}), 1);
});

test('computeCascadeFlow: 四条分支合计 100%，月节省非负，YAML 可导出', () => {
  const r = computeCascadeFlow({ monthlyRequests: 250_000, avgInputTokens: 900, cacheHitPct: 35 });
  assert.equal(r.pctTotal, 100);
  assert.equal(r.cachePct + r.jevBypassPct + r.local8bPct + r.frontierEscPct, 100);
  assert.equal(r.branches.length, 4);
  assert.ok(r.monthlySavingsUsd >= 0);
  assert.ok(r.frontierOnlyUsd >= r.hybridUsd);
  assert.match(r.exportYaml, /^cascade:/);
  assert.match(r.exportYaml, /monthlySavingsUsd:/);
  assert.match(r.exportYaml, /id: (cache_hit|jev_auto|local_8b|frontier_escalated)/);
  assert.match(read('src/lib/tools/engines.mjs'), /clavue-jev/);
});

test('computeThresholdCurve: 21 个点、百分比落在 0..100、严格姿态降低自动处理率', () => {
  const balanced = computeThresholdCurve({ posture: 'balanced' });
  const strict = computeThresholdCurve({ posture: 'strict' });
  assert.equal(balanced.curve.length, 21);
  assert.equal(balanced.curve[0].threshold, 0);
  assert.equal(balanced.curve[20].threshold, 1);
  for (const p of [...balanced.curve, ...strict.curve]) {
    for (const key of ['autoHandledPct', 'falsePassPct', 'humanLoadPct', 'precisionPct']) {
      assert.ok(p[key] >= 0 && p[key] <= 100, `${key}=${p[key]}`);
    }
  }
  assert.ok(strict.curve[10].autoHandledPct < balanced.curve[10].autoHandledPct);
  assert.equal(strict.posture, 'strict');
  assert.ok(balanced.current.greyBandPct > 0);
});

test('summarizeBatchResults: 统计自动/升级/错误三类并产出合法 CSV 与 JSON', () => {
  const rows = [
    { id: '1', label: 'a', status: 'pass', verdict: 'pass', upstreamMs: 120 },
    { id: '2', label: 'b', status: 'escalated', verdict: 'escalate', upstreamMs: 240 },
    { id: '3', label: 'c', status: 'error', verdict: 'error', upstreamMs: 60 },
    { id: '4', label: 'd', status: 'auto', verdict: 'pass', upstreamMs: 180 },
  ];
  const r = summarizeBatchResults(rows, { escalateAtOrAbove: 0.75 });
  assert.equal(r.total, 4);
  assert.equal(r.autoCount, 2);
  assert.equal(r.escalatedCount, 1);
  assert.equal(r.errorCount, 1);
  assert.equal(r.passRatePct, 50);
  assert.match(r.csv, /^id,label,status,upstreamMs,verdict,decisionChoice,riskScore,routeLane\n/);
  assert.equal(r.csv.trim().split('\n').length, 5);
  const json = JSON.parse(r.json);
  assert.equal(json.total, 4);
  assert.equal(json.ceiling, 0.75);
  assert.equal(json.rows.length, 4);
});

test('analyzeVibeWaves: 识别重叠 --write-scope 前缀，干净批次可并行并发出 clavue CLI', () => {
  const overlap = analyzeVibeWaves([
    { name: 'w3a', scopes: ['src/components/tools'] },
    { name: 'w4b', scopes: ['src/components/tools/LiveToolsCanvas.astro'] },
  ]);
  assert.equal(overlap.isClean, false);
  assert.ok(overlap.conflicts.length > 0);
  assert.match(overlap.cliScript, /clavue --wave/);
  assert.match(overlap.agentsSnippet, /Scope conflicts/);
  const clean = analyzeVibeWaves([
    { name: 'w3a', scopes: ['src/components/tools'] },
    { name: 'w4b', scopes: ['scripts/test-tools-suite.mjs', 'package.json'] },
  ]);
  assert.equal(clean.isClean, true);
  assert.equal(clean.conflicts.length, 0);
  assert.equal(clean.parallelBatches, 2);
  assert.match(clean.cliScript, /clavue --wave "\$wave" & done; wait/);
});

test('computeLatencyWaterfall: 加权 P95 不高于纯前沿基线，SLA 临界值正确切换', () => {
  const r = computeLatencyWaterfall({ edgeMs: 12, jevMs: 42, cacheMs: 5, local8bMs: 140, frontierMs: 900, cachePct: 30, localPct: 45 });
  assert.ok(r.weightedP95 <= r.baselineFrontierP95);
  assert.ok(r.savedMs >= 0);
  const at = computeLatencyWaterfall({ slaMs: r.weightedP95 });
  const below = computeLatencyWaterfall({ slaMs: r.weightedP95 - 1 });
  assert.equal(at.slaPass, true);
  assert.equal(below.slaPass, false);
});

test('buildSdkSnippet: 8 种语言均非空、含公共端点与模型、无硬编码密钥与 $$数字', () => {
  const ids = ['curl', 'typescript', 'python', 'go', 'rust', 'java', 'csharp', 'php'];
  for (const id of ids) {
    const s = buildSdkSnippet(id);
    assert.equal(s.langId, id);
    assert.ok(s.filename.length > 0 && s.language.length > 0);
    assert.ok(s.code.length > 40, id);
    assert.equal(s.snippet, s.code);
    assert.ok(s.code.includes('https://api.jevcode.ai/v1/judge'), id);
    assert.ok(s.code.includes('clavue-jev'), id);
    assert.ok(s.code.includes('JEVCODE_API_KEY'), id);
    assert.doesNotMatch(s.code, /\$\$\d/);
    assert.doesNotMatch(s.code, /sk-[A-Za-z0-9]{16,}/);
    assert.doesNotMatch(s.code, /\b(?:api[_-]?key|token)\s*[:=]\s*["'][A-Za-z0-9]{24,}["']/i);
  }
  assert.equal(buildSdkSnippet('unknown').langId, 'curl');
});

test('computeRoiProjection: 12 个月累计单调递增且年度节省为正', () => {
  const r = computeRoiProjection({ monthlyRequests: 100_000, avgInputTokens: 800, bypassPct: 60, frontierUsdPerM: 12, monthlyGrowthPct: 8 });
  assert.equal(r.months.length, 12);
  for (let i = 0; i < 12; i += 1) {
    assert.equal(r.months[i].month, i + 1);
    assert.ok(r.months[i].frontierCumUsd > 0);
    assert.ok(r.months[i].hybridCumUsd > 0);
    if (i > 0) {
      assert.ok(r.months[i].frontierCumUsd >= r.months[i - 1].frontierCumUsd);
      assert.ok(r.months[i].hybridCumUsd >= r.months[i - 1].hybridCumUsd);
      assert.ok(r.months[i].savedCumUsd >= r.months[i - 1].savedCumUsd);
    }
  }
  assert.ok(r.annualSavingsUsd > 0);
  assert.ok(r.roiMultiple > 1);
});

test('PROMPT_SAFETY_VECTORS 与 scoreSafetyMatrixPoint: 8 个向量与整数 0..100 评分', () => {
  assert.equal(PROMPT_SAFETY_VECTORS.length, 8);
  assert.equal(new Set(PROMPT_SAFETY_VECTORS.map((v) => v.id)).size, 8);
  for (const v of PROMPT_SAFETY_VECTORS) {
    assert.ok(v.state.length > 20 && v.label && v.category && v.expectedVerdict);
    const p = scoreSafetyMatrixPoint({ risk: 0.87, confidence: 0.92, verdict: v.expectedVerdict }, v);
    assert.equal(p.riskPct, 87);
    assert.equal(p.confidencePct, 92);
    assert.equal(p.matchedExpected, true);
    assert.ok(Number.isInteger(p.riskPct) && p.riskPct >= 0 && p.riskPct <= 100);
    assert.ok(Number.isInteger(p.confidencePct) && p.confidencePct >= 0 && p.confidencePct <= 100);
  }
  const edge = scoreSafetyMatrixPoint({ risk: 500, confidence: -3 }, PROMPT_SAFETY_VECTORS[0]);
  assert.ok(edge.riskPct >= 0 && edge.riskPct <= 100);
  assert.ok(edge.confidencePct >= 0 && edge.confidencePct <= 100);
  const live = scoreSafetyMatrixPoint(
    { answers: { risk: { noul: 0.96 }, route: { choice: 'escalate', confidence: { pass: 0.04, escalate: 0.96 } } } },
    PROMPT_SAFETY_VECTORS[0],
  );
  assert.deepEqual(live, { riskPct: 96, confidencePct: 96, choice: 'escalate', verdict: 'escalate', matchedExpected: true });
});

test('computeCreditRunway: $5 对应 119,047,619 输入 token 并返回 4 个里程碑', () => {
  const expected = inputTokensLeft(5_000_000);
  assert.equal(SIGNUP_CREDIT_MICROUSD, 5_000_000);
  assert.equal(expected, 119_047_619);
  const r = computeCreditRunway({ creditUsd: 5, dailyRequests: 1000, avgInputTokens: 800 });
  assert.equal(r.totalTokens, expected);
  assert.equal(r.milestones.length, 4);
  assert.deepEqual(r.milestones.map((m) => m.day), [5, 25, 100, 500]);
  assert.ok(r.totalCalls > 0 && r.runwayDays > 0);
  assert.equal(computeCreditRunway({ creditUsd: 5, dailyRequests: 0 }).runwayDays, 0);
});

test('src/data/tools.ts: 10 件工具匹配 Jev Top 10 slug，8 语文案齐全', () => {
  const source = read('src/data/tools.ts');
  const slugs = [...source.matchAll(/\n\s+slug: '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(slugs, EXPECTED_SLUGS);
  const fields = [...source.matchAll(/\n    (title|tagline|summary|highlights): \{([\s\S]*?)\n    \},/g)];
  assert.ok(fields.length >= 40, `localized fields=${fields.length}`);
  for (const [, name, body] of fields) {
    for (const lang of LANGS) {
      assert.match(body, new RegExp(`\\n\\s{6}${lang}:`, 'm'), `${name}.${lang}`);
    }
  }
});

test('src/i18n/pages/tools.ts: 每个导出对象都覆盖 8 种语言', () => {
  const source = read('src/i18n/pages/tools.ts');
  const blocks = [...source.matchAll(/export const \w+: Localized<[^;]+> = \{([\s\S]*?)\n\};/g)];
  assert.ok(blocks.length >= 30, `exported objects=${blocks.length}`);
  for (const [i, block] of blocks.entries()) {
    for (const lang of LANGS) {
      assert.match(block[1], new RegExp(`\\n  ${lang}:`, 'm'), `block ${i}.${lang}`);
    }
  }
});

test('三张 WebP 配图存在，RIFF/WEBP 魔数正确且大于 10 KB', () => {
  for (const name of ['hero', 'live', 'sim']) {
    const rel = `public/img/guides/tools-${name}.webp`;
    assert.equal(existsSync(path.join(ROOT, rel)), true, rel);
    const buf = readFileSync(path.join(ROOT, rel));
    assert.equal(buf.toString('ascii', 0, 4), 'RIFF', rel);
    assert.equal(buf.toString('ascii', 8, 12), 'WEBP', rel);
    assert.ok(statSync(path.join(ROOT, rel)).size > 10 * 1024, rel);
  }
});

test('engines.mjs 浏览器安全：零 node: 导入、零 questions.mjs 导入', () => {
  const source = read('src/lib/tools/engines.mjs');
  assert.doesNotMatch(source, /from\s+['"]node:/);
  assert.doesNotMatch(source, /import\(['"]node:/);
  assert.doesNotMatch(source, /from\s+['"][^'"]*questions\.mjs['"]/);
  assert.doesNotMatch(source, /import\(\s*['"][^'"]*questions\.mjs/);
  const runtimeSource = source.replaceAll('process.env.JEVCODE_API_KEY', '');
  assert.doesNotMatch(runtimeSource, /\bBuffer\b|\bprocess\./);
});

const ASTRO_FILES = [
  'src/components/tools/LiveToolsCanvas.astro',
  'src/components/tools/SimToolsCanvas.astro',
  'src/pages/[lang]/tools/index.astro',
  'src/pages/[lang]/tools/[slug].astro',
];
for (const rel of ASTRO_FILES) {
  test(`${rel}: 含 SVG、无 innerHTML / <main / define:vars 泄漏`, (t) => {
    const abs = path.join(ROOT, rel);
    if (!existsSync(abs)) { t.skip(`${rel} 尚未落盘`); return; }
    const source = readFileSync(abs, 'utf8');
    if (rel.includes('[slug]')) {
      assert.match(source, /SimToolsCanvas|LiveToolsCanvas/);
    } else {
      assert.match(source, /<svg\b/);
    }
    assert.doesNotMatch(source, /innerHTML/);
    assert.doesNotMatch(source, /<main\b/);
    assert.doesNotMatch(source, /define:vars/);
  });
}

test('基础设施将 tools 接入 8 语：nginx 302、sitemap、llms.txt、ui.ts', () => {
  const nginx = read('deploy/nginx/jevcode.conf');
  assert.match(nginx, /location ~ \^\/\(jev\|compare\|[^\n]*tools[^\n]*\)\(\/\|\$\)/);
  assert.match(nginx, /return 302 \/en\$request_uri/);

  const sitemap = read('scripts/sitemap-lastmod.mjs');
  assert.match(sitemap, /tools\(\\\/\.\*\)\?\$.*src\/data\/tools\.ts/);
  const llms = read('scripts/generate-llms-txt.mjs');
  assert.match(llms, /tools:\s*\{[^\n]*\ben:/);
  assert.match(llms, /'workbench', 'tools'\]/);
  assert.match(llms, /\/en\/tools\//);

  const ui = read('src/i18n/ui.ts');
  const blocks = [...ui.matchAll(/^  (en|zh|ja|ko|de|fr|es|pt): \{([\s\S]*?)\n  \},/gm)];
  assert.equal(blocks.length, 8);
  for (const [, lang, body] of blocks) {
    assert.match(body, /'nav\.tools':/, `nav.tools.${lang}`);
    assert.match(body, /'home\.matrix\.toolsDesc':/, `matrix.toolsDesc.${lang}`);
  }
});
