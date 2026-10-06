#!/usr/bin/env node
/**
 * 回归：run id 与分享页路由必须闭环。
 *
 * 背景：旧实现 randomBytes(9).toString('base64url') 会产出 '-'/'_'，
 * 而 /{lang}/r/{id} 与 /api/runs/{id} 都按 [a-z0-9]{12} 匹配，
 * 约 32% 的 try 结果分享链接永久 404（生产实测 105 个文件里 35 个）。
 *
 * 本测试不依赖上游判定服务：
 *  1) 单测 runId 字符集与长度（直接从源码提取，防止实现漂移）；
 *  2) e2e：手工落盘一个 run 文件，起真实服务，验证两种路由都 200；
 *  3) e2e：落盘一个带 '-'/'_' 的旧式 id，确认路由仍按设计拒绝（404）。
 *
 * 用法：node scripts/test-run-id-share.mjs
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const PORT = 8795;
const dir = mkdtempSync(path.join(tmpdir(), 'jev-runid-'));
const dataDir = path.join(dir, 'runs');
mkdirSync(dataDir, { recursive: true });
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; console.log(`  ✘ ${name} ${extra}`); }
};

// ---- 1) 单测：从源码提取 runId 并验证输出形态 ----
{
  const src = await readFile(new URL('../server/playground.mjs', import.meta.url), 'utf8');
  const m = src.match(/function runId\(\) \{[\s\S]*?\n\}/);
  if (!m) { console.error('未在 server/playground.mjs 找到 runId()'); process.exit(1); }
  // 函数体只依赖模块级 randomBytes，通过参数注入后可直接执行
  const fn = new Function('randomBytes', `${m[0]}; return runId;`)(randomBytes);
  let bad = 0, badLen = 0;
  for (let i = 0; i < 20000; i++) {
    const id = fn();
    if (!/^[a-z0-9]+$/.test(id)) bad++;
    if (id.length !== 12) badLen++;
  }
  ok('runId 输出全部为 [a-z0-9]（2 万次采样）', bad === 0, `非法 ${bad} 次`);
  ok('runId 长度恒为 12', badLen === 0, `非 12 位 ${badLen} 次`);
}

// ---- 2) e2e：起服务验证分享页路由 ----
const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_DATA: dataDir,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverErr = '';
child.stdout.on('data', () => {});
child.stderr.on('data', (d) => { serverErr += d.toString(); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitUp() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`${base}/health`); if (r.ok) return true; } catch {}
    await sleep(100);
  }
  return false;
}

try {
  if (!(await waitUp())) {
    console.error('服务未能启动：', serverErr.slice(0, 400));
    process.exit(1);
  }

  // 新式合法 id：落盘后分享页与 /api/runs 都应 200
  const goodId = 'r1d2e3f4g5h6';
  writeFileSync(path.join(dataDir, `${goodId}.json`),
    JSON.stringify({ id: goodId, createdAt: new Date().toISOString(), state: 'regression probe state text', questions: {}, answers: {}, model: 'clavue-jev', userId: null }));
  const r1 = await fetch(`${base}/en/r/${goodId}/`);
  ok('合法 id → 分享页 200', r1.status === 200, `得到 ${r1.status}`);
  const r2 = await fetch(`${base}/api/runs/${goodId}`);
  ok('合法 id → /api/runs 200', r2.status === 200, `得到 ${r2.status}`);

  // 旧式坏 id（含 -/_）：路由按 [a-z0-9] 设计性拒绝
  const badId = 'bad-id_xyz12';
  writeFileSync(path.join(dataDir, `${badId}.json`),
    JSON.stringify({ id: badId, createdAt: new Date().toISOString(), state: 'legacy probe state text', questions: {}, answers: {}, model: 'clavue-jev', userId: null }));
  const r3 = await fetch(`${base}/en/r/${badId}/`);
  ok('含 -/_ 的旧 id → 分享页 404（路由设计如此）', r3.status === 404, `得到 ${r3.status}`);

  // 12 位长度校验：11 位与 13 位都应拒绝
  const shortId = 'short11id1';
  writeFileSync(path.join(dataDir, `${shortId}.json`), JSON.stringify({ id: shortId }));
  const r4 = await fetch(`${base}/en/r/${shortId}/`);
  ok('长度不足 12 → 404', r4.status === 404, `得到 ${r4.status}`);
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
