#!/usr/bin/env node
/**
 * 新仓库发现：从 GitHub 搜索与 Jev 相关的公开仓库，过滤出尚未收录的候选。
 *
 * 机械相关性过滤（Jev 是判断模型且余额有限，此处不调用 Jev，用确定性规则）：
 *   - 仓库 topics 含 jev / typesafe-ai / system-one-models，或
 *   - description 提及 Jev / TypeSafe / System One
 * 然后排除已收录仓库，按 stars 降序输出候选清单。
 *
 * 用法：node scripts/discover-repos.mjs [--min-stars N] [--json]
 * 输出：新候选仓库 JSON（含 full_name / stars / desc / language / license / topics / archived / url）
 */

import { readFileSync } from 'node:fs';

const MIN_STARS = Number((process.argv.find((a) => a.startsWith('--min-stars=')) ?? '--min-stars=10').split('=')[1]);
const AS_JSON = process.argv.includes('--json');
const TOKEN = process.env.GITHUB_TOKEN ?? '';

// 已收录仓库
const src = readFileSync('src/data/ecosystem.ts', 'utf8');
const known = new Set([...src.matchAll(/repo: '([^']+)'/g)].map((m) => m[1].toLowerCase()));

const QUERIES = [
  'topic:jev',
  'topic:typesafe-ai',
  'topic:system-one-models',
  'typesafe jev',
  'jev structured output',
];

const seen = new Map();
for (const q of QUERIES) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'jevcode-discover',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    console.error(`[discover] ${q} → HTTP ${res.status}`);
    continue;
  }
  const d = await res.json();
  for (const r of d.items ?? []) {
    seen.set(r.full_name.toLowerCase(), r);
  }
  console.error(`[discover] ${q} → ${d.total_count ?? '?'} total, ${(d.items ?? []).length} fetched`);
}

// 机械相关性过滤
function isJevRelated(r) {
  const topics = (r.topics ?? []).map((t) => t.toLowerCase());
  if (topics.some((t) => ['jev', 'typesafe-ai', 'system-one-models', 'system-one-model'].includes(t))) return true;
  const hay = `${r.description ?? ''} ${r.name ?? ''}`.toLowerCase();
  return /\bjev\b|typesafe|system one/.test(hay);
}

// 明确排除「与 Jev 无关」的误报（description 明确撇清）
function isDisclaimed(r) {
  const hay = `${r.description ?? ''}`.toLowerCase();
  return /not affiliated with (jev|typesafe)|independent.{0,20}(jev|typesafe)|unrelated to (jev|typesafe)/.test(hay);
}

const candidates = [...seen.values()]
  .filter((r) => !known.has(r.full_name.toLowerCase()))
  .filter(isJevRelated)
  .filter((r) => !isDisclaimed(r))
  .filter((r) => (r.stargazers_count ?? 0) >= MIN_STARS)
  .filter((r) => !r.archived)
  .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));

const out = candidates.map((r) => ({
  full_name: r.full_name,
  url: r.html_url,
  stars: r.stargazers_count,
  forks: r.forks_count,
  language: r.language,
  license: r.license?.spdx_id ?? null,
  topics: r.topics ?? [],
  description: r.description ?? '',
  pushed_at: r.pushed_at,
}));

if (AS_JSON) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\n发现 ${out.length} 个新候选（已排除 ${known.size} 个已收录）：\n`);
  for (const c of out) {
    console.log(`  ${c.full_name.padEnd(40)} ${String(c.stars).padStart(6)}★  ${c.language ?? '-'}  ${c.license ?? '-'}`);
    console.log(`      ${c.description.slice(0, 90)}`);
  }
}
