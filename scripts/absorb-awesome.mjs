#!/usr/bin/env node
/**
 * 从 logicrw/awesome-jev-projects 吸收公开项目数据，合并进本站生态页。
 *
 * 数据源：.research/awesome-jev-projects/projects.json（MIT，已附 ATTRIBUTION）
 * 映射规则：
 *   - 只收 star >= MIN_STARS 且本站尚未收录的项目
 *   - 参考站 4 语言（zh/en/ja/ko）summary → 本站 desc；de/fr/es/pt 用 en 兜底
 *   - jevDecisionPoint（"Jev 在这里做什么"）→ decisionPoint，同样 4+4 兜底
 *   - category 英文 → 本站 category key（手动映射表）
 *   - 保留 stars/forks/language/license/url
 *
 * 用法：node scripts/absorb-awesome.mjs [--min-stars N] [--dry]
 *  --dry  只打印将写入的条目数与清单，不写 ecosystem.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';

const MIN_STARS = Number((process.argv.find((a) => a.startsWith('--min-stars=')) ?? '--min-stars=100').split('=')[1]);
const DRY = process.argv.includes('--dry');

const ECO = 'src/data/ecosystem.ts';
const ref = JSON.parse(readFileSync('.research/awesome-jev-projects/projects.json', 'utf8'));
const eco = readFileSync(ECO, 'utf8');
const known = new Set([...eco.matchAll(/repo: '([^']+)'/g)].map((m) => m[1].toLowerCase()));

// 参考站分类 → 本站 category key
const CATEGORY_MAP = {
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
};

const LANGS = ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];
const FIELD_SUFFIX = { zh: '', en: 'En', ja: 'Ja', ko: 'Ko' };

function repoOf(x) {
  const m = (x.url ?? '').match(/github\.com\/([^/]+\/[^/]+)/);
  return m ? m[1] : null;
}

function pick4(field, x) {
  const out = {};
  for (const l of ['zh', 'en', 'ja', 'ko']) {
    out[l] = x[field + FIELD_SUFFIX[l]] ?? x[field + FIELD_SUFFIX.en] ?? '';
  }
  // de/fr/es/pt 用 en 兜底
  for (const l of ['de', 'fr', 'es', 'pt']) out[l] = out.en;
  return out;
}

function toTsStr(s) {
  return JSON.stringify(String(s ?? ''));
}

const newProjects = [];
for (const x of ref) {
  const repo = repoOf(x);
  if (!repo) continue;
  if (known.has(repo.toLowerCase())) continue;
  if ((x.stars ?? 0) < MIN_STARS) continue;
  const category = CATEGORY_MAP[x.category] ?? 'tooling';
  const desc = pick4('plainSummary', x);
  const decisionPoint = pick4('jevDecisionPoint', x);
  // 关键字段必须非空
  if (!desc.en && !desc.zh) continue;

  const lines = [
    `  {`,
    `    repo: ${toTsStr(repo)},`,
    `    url: ${toTsStr(x.url)},`,
    `    desc: {`,
    ...LANGS.map((l) => `      ${l}: ${toTsStr(desc[l] ?? desc.en)},`),
    `    },`,
    `    decisionPoint: {`,
    ...LANGS.map((l) => `      ${l}: ${toTsStr(decisionPoint[l] ?? decisionPoint.en)},`),
    `    },`,
    `    stars: ${x.stars ?? 0},`,
    `    forks: ${x.forks ?? 0},`,
    `    language: ${x.language ? toTsStr(x.language) : 'null'},`,
    `    license: ${x.license ? toTsStr(x.license) : 'null'},`,
    `    topics: ${JSON.stringify(x.tags ?? x.topics ?? [])},`,
    `    category: ${toTsStr(category)},`,
    `  },`,
  ];
  newProjects.push({ repo, stars: x.stars ?? 0, block: lines.join('\n') });
}

newProjects.sort((a, b) => b.stars - a.stars);
console.error(`吸收 ${newProjects.length} 个项目（star>=${MIN_STARS}，去重后）`);

if (DRY) {
  for (const p of newProjects) console.log(`  ${p.repo}  ${p.stars}★`);
  process.exit(0);
}

if (newProjects.length === 0) {
  console.error('无新增，跳过写入');
  process.exit(0);
}

// 在 projects 数组的 `];` 前插入
const blocks = newProjects.map((p) => p.block).join('\n');
const marker = '\n];\n\n/** 按分类分组';
if (!eco.includes(marker)) {
  console.error('未找到 projects 数组结尾标记');
  process.exit(1);
}
const out = eco.replace(marker, '\n' + blocks + marker);
writeFileSync(ECO, out);
console.error(`已写入 ${newProjects.length} 个项目到 ${ECO}`);
