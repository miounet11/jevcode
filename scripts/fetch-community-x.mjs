#!/usr/bin/env node
/**
 * 社区脉搏数据刷新：从 X API v2 批量刷新 src/data/community.ts 的 views / likes。
 *
 * 用法：node scripts/fetch-community-x.mjs [--check]
 *   --check 只输出 diff（JSON），不写文件
 *
 * Token：环境变量 X_BEARER_TOKEN 优先，否则读 .pipeline/x_token.txt（gitignored）。
 *
 * 省配额设计：批量端点 GET /2/tweets?ids=a,b,c（≤100 id/次），
 * 144 条推文全量刷新只需 2 次调用；单条 GET 是 450/15min，批量同理，远够用。
 * 只取 tweet.fields=public_metrics，不 expansions、不 user fields，最小响应体。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const CHECK = process.argv.includes('--check');
const SRC = 'src/data/community.ts';

function loadToken() {
  if (process.env.X_BEARER_TOKEN) return process.env.X_BEARER_TOKEN.trim();
  const p = '.pipeline/x_token.txt';
  if (existsSync(p)) return readFileSync(p, 'utf8').trim();
  console.error('错误：未找到 token（设 X_BEARER_TOKEN 或写 .pipeline/x_token.txt）');
  process.exit(1);
}

const TOKEN = loadToken();

// 提取全部推文 id（条目 id 与 url 中的 status id 一致，已验证 144/144）
const src = readFileSync(SRC, 'utf8');
const ids = [...src.matchAll(/id: "(\d+)"/g)].map((m) => m[1]);
if (ids.length === 0) {
  console.error('错误：community.ts 中未提取到任何 id');
  process.exit(1);
}
const uniqueIds = [...new Set(ids)];
if (uniqueIds.length !== ids.length) {
  console.error(`错误：id 有重复（${ids.length} 条中出现 ${uniqueIds.length} 个唯一值），中止以防错写`);
  process.exit(1);
}
console.error(`发现 ${uniqueIds.length} 条推文`);

// 批量拉取，100 id/次
function chunks(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** public_metrics 里的浏览量字段名历经改动（impressions/impression_count/views），
 *  全部兜住，取第一个存在的数值。 */
function viewsOf(pm) {
  for (const k of ['impression_count', 'impressions', 'views']) {
    const v = pm?.[k];
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object' && typeof v.count === 'number') return v.count;
  }
  return undefined;
}

const fresh = new Map(); // id -> { views, likes }
const gone = new Set(); // 已删除/不可见的 id
let remainingHeader = null;

for (const chunk of chunks(uniqueIds, 100)) {
  const url = `https://api.twitter.com/2/tweets?ids=${chunk.join(',')}&tweet.fields=public_metrics`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'jevcode-pipeline' },
  });
  remainingHeader = res.headers.get('x-rate-limit-remaining');
  if (res.status === 401 || res.status === 403) {
    console.error(`错误：token 无效或无权限（HTTP ${res.status}）`);
    process.exit(1);
  }
  if (res.status === 429) {
    const reset = Number(res.headers.get('x-rate-limit-reset') ?? 0);
    console.error(`错误：429 限流${reset ? `，重置于 ${new Date(reset * 1000).toISOString()}` : ''}。批量刷新仅 2 次调用，等窗口重置即可。`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`错误：HTTP ${res.status} ${await res.text().catch(() => '')}`);
    process.exit(1);
  }
  const j = await res.json();
  for (const t of j.data ?? []) {
    const pm = t.public_metrics ?? {};
    fresh.set(t.id, { views: viewsOf(pm), likes: pm.like_count ?? pm.likes });
  }
  // 不在 data 里的 id 即已删除/不可见（响应 errors 数组会说明），跳过不写
  for (const e of j.errors ?? []) {
    if (e.resource_id) gone.add(e.resource_id);
  }
}

console.error(`API 返回 ${fresh.size} 条，不可见/已删除 ${gone.size} 条；本轮剩余配额 x-rate-limit-remaining: ${remainingHeader}`);
if (gone.size) console.error(`不可见 id：${[...gone].join(', ')}`);

// 与现值 diff：按 id 定位块，块内唯一 views/likes 行原位替换
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const changes = [];
const updates = []; // { id, views, likes }
for (const id of uniqueIds) {
  if (gone.has(id)) continue;
  const f = fresh.get(id);
  if (!f || f.views === undefined || f.likes === undefined) {
    console.error(`警告：id ${id} 缺 metrics，跳过`);
    continue;
  }
  const re = new RegExp(`(id: "${esc(id)}",[\\s\\S]*?\\n    views: )(\\d+)(,\\s*\\n    likes: )(\\d+)(,)`);
  const m = src.match(re);
  if (!m) {
    console.error(`警告：id ${id} 未匹配到条目块，跳过`);
    continue;
  }
  const oldViews = Number(m[2]);
  const oldLikes = Number(m[4]);
  if (oldViews !== f.views || oldLikes !== f.likes) {
    changes.push({ id, views: `${oldViews} -> ${f.views}`, likes: `${oldLikes} -> ${f.likes}` });
    updates.push({ id, views: f.views, likes: f.likes });
  }
}

if (CHECK || changes.length === 0) {
  console.log(JSON.stringify({ tweet_count: uniqueIds.length, changed: changes.length, changes }, null, 2));
  process.exit(0);
}

let out = src;
for (const u of updates) {
  const re = new RegExp(`(id: "${esc(u.id)}",[\\s\\S]*?\\n    views: )\\d+(,\\s*\\n    likes: )\\d+(,)`);
  out = out.replace(re, `$1${u.views}$2${u.likes}$3`);
}
writeFileSync(SRC, out);
console.log(JSON.stringify({ tweet_count: uniqueIds.length, files_updated: 1, entries_updated: updates.length, changes }, null, 2));
