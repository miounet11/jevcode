#!/usr/bin/env node
/**
 * 从 v-modal/awesome-jev-tools 吸收公开项目数据，合并进本站生态页。
 *
 * 数据源（已抓取到 .research/awesome-jev-tools/）：
 *   - entries.json            该清单 README 解析出的 212 条条目（含 152 个 GitHub 仓库）
 *   - candidate-meta.json     候选仓库的 GitHub API 元数据（stars/forks/language/license/topics）
 *   - readme-verification.json 每个候选仓库 README 的 Jev 证据评分
 *   - absorb-selected.json    入选清单（tier A/B），由 scripts/select-awesome-tools.py 生成
 *
 * 分级：
 *   - tier A：同时被 logicrw/awesome-jev-projects 人工复核（有 4 语言 summary + Jev 决策点）
 *   - tier B：本站自行核对 README/GitHub 描述中的 Jev 使用证据
 *
 * 去重键为 owner/repo（小写）。已收录、已归档、明显与 Jev 无关的条目一律跳过。
 *
 * 用法：node scripts/absorb-awesome-tools.mjs [--dry] [--file=路径]
 */

import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const SEL_FILE =
  (process.argv.find((a) => a.startsWith('--file=')) ?? '--file=.research/awesome-jev-tools/absorb-selected.json').split('=')[1];

const ECO = 'src/data/ecosystem.ts';
const LANGS = ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];

/** 源分类（两套体系：logicrw 的 taxonomy + awesome-jev-tools 的分类页）→ 本站 category key */
const CATEGORY_MAP = {
  // logicrw taxonomy
  'SDK & Decision Frameworks': 'tooling',
  'SDK & Integrations': 'tooling',
  'Evaluation & Observability': 'tooling',
  'MCP & Integrations': 'integration',
  'Integrations & bridges': 'integration',
  'Browser & OS Action': 'agent',
  'High-Frequency & Simulation': 'agent',
  'Routing & Cost Optimization': 'tooling',
  'Security & Guardrails': 'integration',
  'Context GC & Filter': 'tooling',
  'Domain & Vertical Tools': 'agent',
  'CLI & Pipelines': 'tooling',
  'Data & Search': 'integration',
  'Codebase & Graph Pathfinding': 'agent',
  'Creative Tools': 'agent',
  'Decision Tools': 'tooling',
  'Voice & Conversation': 'agent',
  'Classification & Taxonomy': 'research',
  // awesome-jev-tools 分类页
  'Infra / SDKs / Integrations': 'integration',
  'Agent Decisions': 'agent',
  'Classification & Routing': 'tooling',
  'Verification & Guardrails': 'integration',
  'Calibration & Research': 'research',
  'Scoring & Ranking': 'tooling',
  'Evaluation & Benchmarking': 'research',
  'Game & Simulation': 'agent',
  'Finance & Trading': 'agent',
  'Content Moderation': 'integration',
  'Data Labeling & Curation': 'tooling',
  'Compliance & Legal': 'integration',
  'Scientific Pipelines': 'research',
};

const toTs = (s) => JSON.stringify(String(s ?? ''));

/**
 * GitHub API 在「未能匹配到已知许可证」时把 license 回成哨兵值 NOASSERTION，
 * 它不是许可证名称。生态页把 license 当 tag 直接渲染（src/pages/[lang]/ecosystem.astro），
 * 原样写入用户看到的就是字面量 "NOASSERTION"。归一到 null：宁可不显示。
 */
const normalizeLicense = (v) => (!v || v === 'NOASSERTION' ? null : v);
/** 归一后再转 TS 字面量，避免把哨兵值写进数据文件 */
const licenseTs = (v) => {
  const n = normalizeLicense(v);
  return n ? toTs(n) : 'null';
};

const eco = readFileSync(ECO, 'utf8');
const known = new Set([...eco.matchAll(/repo:\s*['"]([^'"]+)['"]/g)].map((m) => m[1].toLowerCase()));

const selected = JSON.parse(readFileSync(SEL_FILE, 'utf8'));

const blocks = [];
const skipped = [];
for (const x of selected) {
  const repo = x.repo;
  if (!repo || known.has(repo.toLowerCase())) {
    skipped.push(repo);
    continue;
  }
  // tier A 用参考站 4 语言 summary；tier B 只有英文，其余语言留空待 translate-ecosystem.py 补译
  const d = x.desc ?? {};
  const base = (d.en ?? d.zh ?? '').trim();
  if (!base) {
    skipped.push(`${repo} (无简介)`);
    continue;
  }
  const desc = {
    zh: d.zh || base,
    en: base,
    ja: d.ja || base,
    ko: d.ko || base,
    de: base,
    fr: base,
    es: base,
    pt: base,
  };
  const dp = x.dp ?? {};
  const decisionPoint = dp.en || dp.zh ? dp : null;

  const cat = CATEGORY_MAP[x.srcCat] ?? 'tooling';
  const lines = [
    '  {',
    `    repo: ${toTs(repo)},`,
    `    url: ${toTs(x.url ?? `https://github.com/${repo}`)},`,
    '    desc: {',
    ...LANGS.map((l) => `      ${l}: ${toTs(desc[l])},`),
    '    },',
  ];
  if (decisionPoint) {
    lines.push('    decisionPoint: {', ...LANGS.map((l) => `      ${l}: ${toTs(dp[l] ?? dp.en ?? '')},`), '    },');
  }
  lines.push(
    `    stars: ${x.stars ?? 0},`,
    `    forks: ${x.forks ?? 0},`,
    `    language: ${x.language ? toTs(x.language) : 'null'},`,
    `    license: ${licenseTs(x.license)},`,
    `    topics: ${JSON.stringify(x.topics ?? [])},`,
    `    category: ${toTs(cat)},`,
    '  },'
  );
  blocks.push({ repo, stars: x.stars ?? 0, block: lines.join('\n') });
}

console.error(`入选 ${selected.length} 条，跳过 ${skipped.length} 条（已收录/无简介）`);
if (DRY) {
  for (const b of blocks) console.log(`  ${b.repo}  ${b.stars}★`);
  process.exit(0);
}
if (blocks.length === 0) {
  console.error('无新增，跳过写入');
  process.exit(0);
}

const marker = '\n];\n\n/** 按分类分组';
if (!eco.includes(marker)) {
  console.error('未找到 projects 数组结尾标记');
  process.exit(1);
}
// projects 数组内按 stars 降序，新条目插到末尾后由页面自行按分类+stars 排序
writeFileSync(ECO, eco.replace(marker, '\n' + blocks.map((b) => b.block).join('\n') + marker));
console.error(`已写入 ${blocks.length} 个项目到 ${ECO}`);
