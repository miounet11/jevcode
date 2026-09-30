#!/usr/bin/env node
/**
 * 验证码登录端到端：起真实服务，走真 HTTP。
 *
 * 用法：node scripts/test-otp-flow.mjs
 *
 * 服务在开发模式下用 console 通道发码（打印到 stdout），本脚本从服务输出里
 * 抓出真实验证码再回填——这样验证的是完整链路（签发→投递→校验→建会话），
 * 而不是直接调内部函数。
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PORT = 8797;
const dir = mkdtempSync(path.join(tmpdir(), 'jev-otpflow-'));
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0, skipped = 0;
const ok = (n, c, extra = '') => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n} ${extra}`); } };
const skip = (n, why) => { skipped++; console.log(`  ○ ${n} — ${why}`); };

let serverOut = '';
const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    NODE_ENV: 'development',
    MAIL_TRANSPORT: 'console',
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_ACCOUNTS_DB: path.join(dir, 'acct.db'),
    PLAYGROUND_DATA: path.join(dir, 'runs'),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.on('data', (d) => { serverOut += d.toString(); });
child.stderr.on('data', (d) => { serverOut += d.toString(); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return true; } catch {}
    await sleep(100);
  }
  return false;
}

/** 从服务输出里抓最近一次发给该邮箱的验证码 */
function codeFor(email) {
  const re = new RegExp(`\\[mail:console\\] to=${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} code=(\\d{6})`, 'g');
  let m, last = null;
  while ((m = re.exec(serverOut))) last = m[1];
  return last;
}

let cookie = '';
const setCookieFrom = (res) => {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of sc) {
    const kv = c.split(';')[0];
    if (kv.startsWith('jev_session=')) cookie = kv;
  }
};
const post = async (p, body) => {
  const r = await fetch(base + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  setCookieFrom(r);
  return r;
};
const get = (p) => fetch(base + p, { headers: cookie ? { cookie } : {} });

const EMAIL = 'otp-flow@example.com';

try {
  if (!(await waitUp())) {
    console.log('服务未启动：', serverOut.slice(0, 500));
    process.exit(1);
  }
  console.log(`服务已启动 :${PORT}`);
  if (!/验证码通道/.test(serverOut) && !/mail\]/.test(serverOut)) {
    skip('全部用例', '服务未启用发信通道');
    throw new Error('no mailer');
  }
  console.log('');

  console.log('请求发码');
  {
    const r = await post('/api/auth/otp/request', { email: EMAIL });
    const b = await r.json().catch(() => ({}));
    ok('发码 → 200', r.status === 200, `得到 ${r.status} ${JSON.stringify(b)}`);
    ok('返回 expiresAt', typeof b.expiresAt === 'number' && b.expiresAt > Date.now());

    await sleep(80); // 等 stdout 落盘
    ok('服务日志里出现 6 位码', !!codeFor(EMAIL), `日志片段: ${serverOut.slice(-200)}`);

    const bad = await post('/api/auth/otp/request', { email: 'not-an-email' });
    ok('非法邮箱 → 400', bad.status === 400, `得到 ${bad.status}`);
  }

  console.log('\n立即重发应被限流');
  {
    const r = await post('/api/auth/otp/request', { email: EMAIL });
    ok('30 秒内重发 → 429', r.status === 429, `得到 ${r.status}`);
    ok('429 带 retry-after', !!r.headers.get('retry-after'), r.headers.get('retry-after') || '');
  }

  console.log('\n错码应被拒且不建号');
  {
    await sleep(60);
    const real = codeFor(EMAIL);
    const wrong = real === '000000' ? '111111' : '000000';
    const r = await post('/api/auth/otp/verify', { email: EMAIL, code: wrong });
    ok('错码 → 401', r.status === 401, `得到 ${r.status}`);
    const me = await get('/api/auth/me');
    ok('错码后仍未登录', me.status === 401, `得到 ${me.status}`);
  }

  console.log('\n正确码登录（首次自动建号）');
  {
    const code = codeFor(EMAIL);
    if (!code) { skip('验码登录', '未能从日志取到码'); throw new Error('no code'); }
    const r = await post('/api/auth/otp/verify', { email: EMAIL, code });
    const b = await r.json().catch(() => ({}));
    ok('验码 → 200', r.status === 200, `得到 ${r.status} ${JSON.stringify(b).slice(0, 140)}`);
    ok('标记为首次建号', b.created === true, String(b.created));
    ok('返回注册赠送 $5', b.credit && b.credit.cents === 500, JSON.stringify(b.credit));
    ok('下发会话 Cookie', !!cookie, cookie.slice(0, 24));

    const me = await get('/api/auth/me');
    const mb = await me.json().catch(() => ({}));
    ok('会话可用，/me → 200', me.status === 200, `得到 ${me.status}`);
    ok('/me 返回该邮箱', mb.user && mb.user.email === EMAIL, JSON.stringify(mb.user));
  }

  console.log('\n重放同一码应失败');
  {
    const code = codeFor(EMAIL);
    const r = await post('/api/auth/otp/verify', { email: EMAIL, code });
    ok('同码第二次 → 401', r.status === 401, `得到 ${r.status}`);
  }

  console.log('\n已登录仍可用 key 走判定（跨路径一致性）');
  {
    const kr = await post('/api/keys', { label: 'otp-flow' });
    const kb = await kr.json().catch(() => ({}));
    ok('签发 key → 201', kr.status === 201, `得到 ${kr.status}`);
    if (kr.status === 201 && kb.key) {
      const jr = await fetch(`${base}/v1/judge`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${kb.key}` },
        body: JSON.stringify({
          state: 'otp flow cross-path check',
          questions: { q1: { type: 'noul', instructions: 'Relevant?' } },
        }),
      });
      if (jr.status === 503 || jr.status === 502) skip('用 key 判定 → 200', `上游不可用 (${jr.status})`);
      else {
        const jb = await jr.json().catch(() => ({}));
        ok('用 key 判定 → 200', jr.status === 200, `得到 ${jr.status}`);
        ok('余额已按输入 token 扣减',
          jb.credit && jb.credit.microUsd < 5_000_000 && jb.credit.microUsd > 0,
          JSON.stringify(jb.credit));
      }
    }
  }

  console.log('\n登出');
  {
    const r = await post('/api/auth/logout');
    ok('登出 → 200', r.status === 200, `得到 ${r.status}`);
    const me = await get('/api/auth/me');
    ok('登出后 /me → 401', me.status === 401, `得到 ${me.status}`);
  }
} catch (e) {
  if (!/no mailer|no code/.test(String(e.message))) {
    console.log('异常：', e.message);
    fail++;
  }
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail} / 跳过 ${skipped}`);
process.exit(fail === 0 ? 0 : 1);
