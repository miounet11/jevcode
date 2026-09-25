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

// 未认证时限额是 60/h，本项目有 200+ 仓库，必然触发限流并长时间阻塞。
// 实测：无 token 的 cron 轮到抓取阶段挂起 10 分钟以上，CPU 几乎为 0，看上去像卡死。
// 这里提前说清楚，并限制整轮等待预算，避免静默挂一小时。
if (!TOKEN) {
  console.error('警告：未设置 GITHUB_TOKEN，将受 60/h 未认证限额限制（本轮仓库数远超该额度）');
}

/** 整轮限流等待预算。超过就失败退出，而不是无限期挂着。 */
const RATE_LIMIT_WAIT_BUDGET_MS = Number(process.env.RATE_LIMIT_WAIT_BUDGET_MS ?? 90_000);
let waitedMs = 0;

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
      // rate limit：等 reset 或退避，但整轮等待有上限，避免无限期挂着
      const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0);
      const proposed = reset ? Math.min(Math.max(reset * 1000 - Date.now(), 1000), 3600_000) : attempt * 5000;
      const remaining = RATE_LIMIT_WAIT_BUDGET_MS - waitedMs;
      if (remaining <= 0) {
        throw new Error(
          `${repo}: 限流等待超出预算（已等 ${Math.round(waitedMs / 1000)}s / 上限 ${RATE_LIMIT_WAIT_BUDGET_MS / 1000}s）`
          + `${TOKEN ? '' : '；未设置 GITHUB_TOKEN，限额仅 60/h'}`,
        );
      }
      const wait = Math.min(proposed, remaining);
      waitedMs += wait;
      console.error(`  ${repo}: 限流，等 ${Math.round(wait / 1000)}s（累计 ${Math.round(waitedMs / 1000)}s）`);
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
/** 取某个 repo 的项目块文本（从 repo: 行到下一个项目对象或数组结尾）。
 *  不能用 `[^}]*?` 之类的粗略正则：块内的 desc/decisionPoint 自带 `}`，会失配。 */
function blockOf(text, repo) {
  const start = text.indexOf(`repo: "${repo}"`) >= 0
    ? text.indexOf(`repo: "${repo}"`)
    : text.indexOf(`repo: '${repo}'`);
  if (start < 0) return '';
  const next = text.indexOf('\n  {', start);
  return text.slice(start, next < 0 ? text.length : next);
}

// 已记录为归档的仓库集合。归档是【一次性事件】：若每轮都上报，
// accumulate() 会把它写成 force:true，而 trigger 判定中 kind==='archived' 恒真，
// 于是 trigger 永远为真、+10% 累积阈值形同虚设，每轮都白跑一次门 1 判定。
// 实测：0xNatoshi/jev-codex-router 归档后，连跑两次 fetch 都重复出现在 changes 里。
const archivedKnown = new Set(repos.filter((repo) => /archived: true/.test(blockOf(src, repo))));

const results = [];
for (const repo of repos) {
  const j = await fetchOne(repo);
  if (j.gone) {
    changes.push({ repo, kind: 'gone' });
    results.push(null);
    continue;
  }
  results.push(j);
  if (j.archived && !archivedKnown.has(repo)) changes.push({ repo, kind: 'archived' });
}

// 与现有值 diff（stars/forks），逐 repo 查找（贪婪一次性匹配会错位）
const oldMap = {};
for (const repo of repos) {
  const m = src.match(new RegExp(`repo: ['"]${esc(repo)}['"],[\\s\\S]*?\\n    stars: (\\d+),\\s*\\n    forks: (\\d+)`));
  if (m) oldMap[repo] = { stars: Number(m[1]), forks: Number(m[2]) };
}

const data = repos.map((repo, i) => ({ repo, ...oldMap[repo], fresh: results[i] }));
let updated = 0;
let archivedMarked = 0;
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

  // 归档状态必须落盘，否则下一轮又当成「新归档」重复上报（见 archivedKnown 注释）。
  if (d.fresh.archived && !archivedKnown.has(d.repo)) {
    const blockRe = new RegExp(`(repo: ['"]${esc(d.repo)}['"],[\\s\\S]*?\\n    category: [^\\n]+\\n)`);
    const marked = out.replace(blockRe, '$1    archived: true,\n');
    if (marked !== out) {
      out = marked;
      archivedMarked++;
    }
    archivedKnown.add(d.repo);
  }
}
writeFileSync('src/data/ecosystem.ts', out);
console.log(JSON.stringify({ repo_count: repos.length, files_updated: 1, stat_entries_updated: updated, archived_marked: archivedMarked, changes }, null, 2));
