#!/usr/bin/env node
/**
 * 端到端：起真实 playground 服务，验证 API key 鉴权与额度扣减。
 *
 * 用法：node scripts/test-playground-quota.mjs
 *
 * 会真实调用上游判定（消耗真实额度），但只调用必要的次数。
 * 上游不可达时相关断言会跳过而不是误报失败。
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openAccounts, SIGNUP_CREDIT_CENTS } from '../server/accounts.mjs';

const PORT = 8793;
const dir = mkdtempSync(path.join(tmpdir(), 'jev-pg-'));
const dbPath = path.join(dir, 'acct.db');
const dataDir = path.join(dir, 'runs');
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0, skipped = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; console.log(`  ✘ ${name} ${extra}`); }
};
const skip = (name, why) => { skipped++; console.log(`  ○ ${name} — ${why}`); };

// 预备：建用户 + 签发 key
const ledger = openAccounts(dbPath);
const user = ledger.createUser('e2e@example.com');
const { key } = ledger.issueKey(user.id);
ledger.close();

const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_ACCOUNTS_DB: dbPath,
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
    try {
      const r = await fetch(`${base}/health`);
      if (r.ok) return true;
    } catch {}
    await sleep(100);
  }
  return false;
}

const call = (body, headers = {}) =>
  fetch(`${base}/api/try`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const validBody = {
  state: 'end to end quota verification probe',
  questions: { q1: { type: 'noul', instructions: 'Is this relevant?' } },
};

try {
  if (!(await waitUp())) {
    console.log('服务未能启动：', serverErr.slice(0, 400));
    process.exit(1);
  }
  console.log(`服务已启动 :${PORT}\n`);

  // 上游判定是否可达：不可达时判定会失败并退回额度，扣减类断言应跳过而非误报失败。
  let upstreamUp = false;

  console.log('鉴权');
  {
    const r = await call(validBody, { authorization: 'Bearer jev_totally_invalid' });
    ok('伪造 key → 401', r.status === 401, `得到 ${r.status}`);

    const r2 = await call(validBody, { authorization: 'Bearer ' + key });
    const body2 = await r2.json().catch(() => ({}));
    if (r2.status === 502 || body2.error === 'upstream') {
      skip('有效 key → 200', '上游判定不可达');
      skip('响应带 credit', '上游判定不可达');
      skip('响应记录归属用户', '上游判定不可达');
    } else {
      upstreamUp = true;
      ok('有效 key → 200', r2.status === 200, `得到 ${r2.status} ${JSON.stringify(body2).slice(0,120)}`);
      ok('响应带 credit', body2.credit && typeof body2.credit.cents === 'number',
         JSON.stringify(body2.credit));
      ok('响应记录归属用户', body2.userId === user.id);
    }
  }

  console.log('\n额度扣减');
  {
    const l2 = openAccounts(dbPath);
    const used = l2.balance(user.id).cents;
    if (upstreamUp) {
      ok('余额已随调用扣减（500→499 美分）', used === 499, `实际余额 ${used}`);
    } else {
      // 上游不可用时判定失败已退回额度，余额应保持 500——这条顺带验证了退款路径。
      ok('上游失败后退回额度（余额仍为 500）', used === 500, `实际余额 ${used}`);
    }
    l2.close();
  }

  console.log('\n额度耗尽');
  {
    // 直接把剩余额度一次性用光，再打一次应被拒
    const l3 = openAccounts(dbPath);
    const left = l3.balance(user.id).judgmentsLeft;
    if (left > 0) l3.consume(user.id, left);
    const after = l3.balance(user.id).cents;
    l3.close();

    const r = await call(validBody, { authorization: 'Bearer ' + key });
    const b = await r.json().catch(() => ({}));
    ok('额度用尽 → 429', r.status === 429, `得到 ${r.status}`);
    ok('拒绝原因可读', /insufficient_credit/.test(b.error || ''), b.error);
    ok('用尽后未误扣', after === 0, `余额 ${after}`);
  }

  console.log('\n匿名路径不受影响');
  {
    const r = await call(validBody); // 无 key
    const b = await r.json().catch(() => ({}));
    if (r.status === 502) skip('无 key → 仍可用（走 IP 限频）', '上游不可达');
    else ok('无 key → 仍可用（走 IP 限频）', r.status === 200, `得到 ${r.status}`);
  }
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail} / 跳过 ${skipped}`);
process.exit(fail === 0 ? 0 : 1);
