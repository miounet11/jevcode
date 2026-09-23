#!/usr/bin/env node
/**
 * 生态数据抓取：从 GitHub API 刷新 src/data/ecosystem.ts 中所有仓库的
 * stars / forks / language / license / topics / archived 状态。
 *
 * 用法：node scripts/fetch-ecosystem.mjs [--check]
 *   --check 只输出 diff（shell-friendly），不写文件
 *
 * 依赖：GITHUB_TOKEN 环境变量（无 token 也能跑，但限额 60/h）。
 */

import { readFileSync, writeFileSync } from 'node:fs';

const CHECK = process.argv.includes('--check');
const TOKEN = process.env.GITHUB_TOKEN;

const src = readFileSync('src/data/ecosystem.ts', 'utf8');
// 吸收条目用双引号、原始条目用单引号，两种都要认，否则漏刷大部分仓库
// 同时按 url 排掉非 GitHub 条目：生态页也收录 HuggingFace 模型与站点，
// 其 repo 字段存的是 HF id 或域名。对这些发 GitHub API 会 404（被误报 gone），
// 更糟的是同名 GitHub 仓库存在时会静默把别人的 stars 写进来——实测 YannQi/R-4B
// 撞上了论文仓库 yannqi/R-4B（MLLM，与 Jev 判定无关），stars 被写成 141。
const all = [...src.matchAll(/repo: ['"]([^'"]+)['"],\s*\n\s*url: ['"]([^'"]+)['"]/g)];
const repos = all.filter(([, , url]) => url.startsWith('https://github.com/')).map(([, repo]) => repo);
const nonGh = all.filter(([, , url]) => !url.startsWith('https://github.com/')).map(([, repo]) => repo);
console.error(`发现 ${repos.length} 个 GitHub 仓库`);
if (nonGh.length) {
  // 这些条目的 stars 是快照值，本脚本不刷新——改由人工在收录时更新
  console.error(`跳过 ${nonGh.length} 个非 GitHub 条目（stars 为手动快照）：${nonGh.join(', ')}`);
}

async function fetchOne(repo, attempt = 1) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'jevcode-pipeline',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (res.status === 404) return { repo, gone: true };
  if (res.status === 403 || res.status === 429) {
    if (attempt <= 3) {
      // rate limit：等 reset 或退避
      const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0);
      const wait = reset ? Math.min(Math.max(reset * 1000 - Date.now(), 1000), 3600_000) : attempt * 5000;
      console.error(`  ${repo}: 限流，等 ${Math.round(wait / 1000)}s`);
      await new Promise((r) => setTimeout(r, wait));
      return fetchOne(repo, attempt + 1);
    }
    throw new Error(`${repo}: rate limited after retries`);
  }
  if (!res.ok) throw new Error(`${repo}: HTTP ${res.status}`);
  return res.json();
}

// repo 名可含正则元字符（omg.dev、jev.nvim 的点号），不转义会错配到别的条目
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const changes = [];
const results = [];
for (const repo of repos) {
  const j = await fetchOne(repo);
  if (j.gone) {
    changes.push({ repo, kind: 'gone' });
    results.push(null);
    continue;
  }
  results.push(j);
  if (j.archived) changes.push({ repo, kind: 'archived' });
}

// 与现有值 diff（stars/forks），逐 repo 查找（贪婪一次性匹配会错位）
const oldMap = {};
for (const repo of repos) {
  const m = src.match(new RegExp(`repo: ['"]${esc(repo)}['"],[\\s\\S]*?\\n    stars: (\\d+),\\s*\\n    forks: (\\d+)`));
  if (m) oldMap[repo] = { stars: Number(m[1]), forks: Number(m[2]) };
}

const data = repos.map((repo, i) => ({ repo, ...oldMap[repo], fresh: results[i] }));
let updated = 0;
for (const d of data) {
  if (!d.fresh) continue;
  if (d.stars !== d.fresh.stargazers_count || d.forks !== d.fresh.forks_count) {
    changes.push({
      repo: d.repo,
      kind: 'stats',
      stars: `${d.stars ?? '?'} -> ${d.fresh.stargazers_count}`,
      forks: `${d.forks ?? '?'} -> ${d.fresh.forks_count}`,
    });
  }
}

if (CHECK || changes.length === 0) {
  console.log(JSON.stringify({ repo_count: repos.length, changes }, null, 2));
  process.exit(0);
}

// 写回 ecosystem.ts：逐 repo 更新 stars/forks + dataAsOf 日期戳
let out = src;
const today = new Date().toISOString().slice(0, 10);
const dateRe = /export const dataAsOf = '[^']*'/;
if (dateRe.test(out)) {
  out = out.replace(dateRe, `export const dataAsOf = '${today}'`);
} else {
  out = out.replace("import type { Lang } from '../i18n/ui';", `import type { Lang } from '../i18n/ui';\n\n/** 数据快照日期（fetch-ecosystem.mjs 自动维护） */\nexport const dataAsOf = '${today}';`);
}
for (const d of data) {
  if (!d.fresh || d.gone) continue;
  const re = new RegExp(`(repo: ['"]${esc(d.repo)}['"],[\\s\\S]*?\\n    stars: )\\d+(,\\s*\\n    forks: )\\d+(,)`);
  const next = out.replace(re, `$1${d.fresh.stargazers_count}$2${d.fresh.forks_count}$3`);
  if (next !== out) updated++;
  out = next;
}
writeFileSync('src/data/ecosystem.ts', out);
console.log(JSON.stringify({ repo_count: repos.length, files_updated: 1, stat_entries_updated: updated, changes }, null, 2));
