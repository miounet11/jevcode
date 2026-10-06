#!/usr/bin/env node
/**
 * IndexNow 提交：把 sitemap 里的 URL 推给 Bing/Yandex/Seznam（对 Google 无效）。
 *
 * 工作方式：
 *   1. 密钥文件 public/<KEY>.txt 内容就是 KEY 本身（IndexNow 协议要求，
 *      搜索引擎会回源验证 https://www.jevcode.ai/<KEY>.txt）。
 *   2. 从 dist/sitemap-0.xml 读取全部 URL，按 1 万条一批 POST 到 api.indexnow.org。
 *   3. 返回 200/202 视为提交成功。
 *
 * 首次使用：node scripts/indexnow-submit.mjs --init   生成密钥文件（需提交进仓库）
 * 日常提交：node scripts/indexnow-submit.mjs          （build 之后跑）
 *
 * 密钥落盘在 .indexnow-key，不进 git；密钥文件本体进 git（部署后线上可验证）。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const KEY_FILE = path.join(ROOT, '.indexnow-key');
const HOST = 'www.jevcode.ai';

function die(msg) {
  console.error(`[indexnow] ${msg}`);
  process.exit(1);
}

function getKey() {
  if (existsSync(KEY_FILE)) {
    const key = readFileSync(KEY_FILE, 'utf8').trim();
    if (/^[a-f0-9]{32}$/.test(key)) return key;
  }
  // 无密钥则生成一个（首次 --init 或忘带 --init 都能自愈）
  const key = randomBytes(16).toString('hex');
  writeFileSync(KEY_FILE, `${key}\n`);
  console.log(`[indexnow] 生成新密钥：${key}`);
  return key;
}

const key = getKey();
const keyFile = path.join(ROOT, 'public', `${key}.txt`);
if (!existsSync(keyFile)) {
  writeFileSync(keyFile, `${key}\n`);
  console.log(`[indexnow] 已写 public/${key}.txt（提交进仓库并部署后生效）`);
}

if (process.argv.includes('--init')) {
  console.log('[indexnow] 初始化完成。记得：1) git add public/<key>.txt 并部署 2) 把 key 文件部署到线上后再首次提交');
  process.exit(0);
}

// ---- 读 sitemap ----
const sitemapPath = path.join(ROOT, 'dist', 'sitemap-0.xml');
if (!existsSync(sitemapPath)) die('dist/sitemap-0.xml 不存在，先 npm run build');
const locs = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (!locs.length) die('sitemap 里没有 URL');

console.log(`[indexnow] 待提交 ${locs.length} 个 URL，密钥 ${key}`);

// ---- 分批提交 ----
const BATCH = 10_000;
let okBatches = 0;
for (let i = 0; i < locs.length; i += BATCH) {
  const chunk = locs.slice(i, i + BATCH);
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: chunk,
  });
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body,
  });
  if (res.status === 200 || res.status === 202) {
    okBatches++;
    console.log(`[indexnow] 批次 ${Math.floor(i / BATCH) + 1}: ${chunk.length} 条 → ${res.status} OK`);
  } else {
    console.error(`[indexnow] 批次 ${Math.floor(i / BATCH) + 1}: HTTP ${res.status} ${await res.text().catch(() => '')}`);
  }
}

if (okBatches === 0) die('全部批次提交失败');
console.log(`[indexnow] 完成：${okBatches} 批成功`);
