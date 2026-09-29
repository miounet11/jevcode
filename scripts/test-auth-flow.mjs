#!/usr/bin/env node
/**
 * 端到端：起真实服务，走真 HTTP 验证注册/登录/会话/API Key 全链路。
 *
 * 用法：node scripts/test-auth-flow.mjs
 * 需要 JEVCODE_PLAYGROUND_KEY 才能跑到判定环节（否则相关断言标记跳过）。
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PORT = 8794;
const dir = mkdtempSync(path.join(tmpdir(), 'jev-authflow-'));
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0, skipped = 0;
const ok = (n, c, extra = '') => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n} ${extra}`); } };
const skip = (n, why) => { skipped++; console.log(`  ○ ${n} — ${why}`); };

const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_ACCOUNTS_DB: path.join(dir, 'acct.db'),
    PLAYGROUND_DATA: path.join(dir, 'runs'),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverErr = '';
child.stdout.on('data', () => {});
child.stderr.on('data', (d) => { serverErr += d.toString(); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return true; } catch {}
    await sleep(100);
  }
  return false;
}

/** 简易 cookie jar：服务端只发一个会话 cookie */
let cookie = '';
const setCookieFrom = (res) => {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of sc) {
    const kv = c.split(';')[0];
    if (kv.startsWith('jev_session=')) cookie = kv;
  }
};
const post = async (p, body, extraHeaders = {}) => {
  const r = await fetch(base + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...extraHeaders },
    body: JSON.stringify(body ?? {}),
  });
  setCookieFrom(r);
  return r;
};
const get = async (p, extraHeaders = {}) => {
  const r = await fetch(base + p, { headers: { ...(cookie ? { cookie } : {}), ...extraHeaders } });
  setCookieFrom(r);
  return r;
};

const EMAIL = 'flow@example.com';
const PASSWORD = 'a-good-password';

try {
  if (!(await waitUp())) {
    console.log('服务未启动：', serverErr.slice(0, 400));
    process.exit(1);
  }
  console.log(`服务已启动 :${PORT}\n`);

  console.log('注册');
  {
    const r = await post('/api/auth/register', { email: EMAIL, password: PASSWORD });
    const b = await r.json().catch(() => ({}));
    ok('注册成功 → 201', r.status === 201, `得到 ${r.status} ${JSON.stringify(b)}`);
    ok('返回用户信息', b.user && b.user.email === EMAIL, JSON.stringify(b.user));
    ok('返回注册赠送 $5', b.credit && b.credit.cents === 500, JSON.stringify(b.credit));
    ok('下发会话 Cookie', !!cookie, `cookie=${cookie.slice(0, 24)}`);
    const raw = r.headers.getSetCookie ? r.headers.getSetCookie().join(';') : '';
    ok('Cookie 为 HttpOnly（前端脚本读不到）', /HttpOnly/i.test(raw), raw);
  }

  console.log('\n注册边界');
  {
    const dup = await post('/api/auth/register', { email: EMAIL, password: PASSWORD });
    ok('重复注册 → 400', dup.status === 400, `得到 ${dup.status}`);
    const weak = await post('/api/auth/register', { email: 'w@example.com', password: 'short' });
    ok('弱密码 → 400', weak.status === 400, `得到 ${weak.status}`);
  }

  console.log('\n登录');
  {
    cookie = '';
    const me1 = await get('/api/auth/me');
    ok('无 Cookie 访问 /me → 401', me1.status === 401, `得到 ${me1.status}`);

    const bad = await post('/api/auth/login', { email: EMAIL, password: 'wrong-password' });
    ok('密码错误 → 401', bad.status === 401, `得到 ${bad.status}`);

    const ghost = await post('/api/auth/login', { email: 'nobody@example.com', password: PASSWORD });
    const gb = await ghost.json().catch(() => ({}));
    const bb = await (await post('/api/auth/login', { email: EMAIL, password: 'wrong-password' })).json().catch(() => ({}));
    ok('账号不存在与密码错误返回同一原因（防枚举）', gb.error === bb.error, `${gb.error} vs ${bb.error}`);

    const okL = await post('/api/auth/login', { email: EMAIL, password: PASSWORD });
    const lb = await okL.json().catch(() => ({}));
    ok('正确密码 → 200', okL.status === 200, `得到 ${okL.status}`);
    ok('登录后拿到余额', lb.credit && typeof lb.credit.cents === 'number', JSON.stringify(lb.credit));
  }

  console.log('\n会话');
  {
    const me = await get('/api/auth/me');
    const b = await me.json().catch(() => ({}));
    ok('带 Cookie → 200', me.status === 200, `得到 ${me.status}`);
    ok('/me 返回邮箱', b.user && b.user.email === EMAIL);
  }

  console.log('\n消费明细 /api/auth/ledger');
  {
    const r = await get('/api/auth/ledger');
    const b = await r.json().catch(() => ({}));
    ok('ledger → 200', r.status === 200, `得到 ${r.status}`);
    ok('返回余额 $5', b.credit && b.credit.cents === 500, JSON.stringify(b.credit));
    ok('注册赠送入账一笔', Array.isArray(b.entries) && b.entries.some(
      (e) => e.kind === 'signup_credit' && e.cents === 500), JSON.stringify(b.entries));
    ok('累计消费为 0', b.spentCents === 0, String(b.spentCents));

    const out = await fetch(`${base}/api/auth/ledger`);
    ok('未登录访问 ledger → 401', out.status === 401, `得到 ${out.status}`);
  }

  console.log('\nAPI Key 控制台');
  let issuedKey = '';
  {
    const r = await post('/api/keys', { label: 'e2e' });
    const b = await r.json().catch(() => ({}));
    ok('签发 key → 201', r.status === 201, `得到 ${r.status}`);
    ok('key 明文只出现一次', typeof b.key === 'string' && b.key.startsWith('jev_'), String(b.key).slice(0, 12));
    ok('key 带前缀与提示', b.prefix && /cannot be shown again/i.test(b.notice || ''));
    issuedKey = b.key || '';

    const me = await get('/api/auth/me');
    const mb = await me.json().catch(() => ({}));
    ok('列表里能看到刚签发的 key', (mb.keys || []).some((k) => k.id === b.id));

    const unauth = await fetch(`${base}/api/keys`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    });
    ok('未登录签发 → 401', unauth.status === 401, `得到 ${unauth.status}`);
  }

  console.log('\n用 key 走判定（额度扣减）');
  {
    const body = { state: 'auth flow e2e probe', questions: { q1: { type: 'noul', instructions: 'Relevant?' } } };
    const r = await fetch(`${base}/api/try`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${issuedKey}` },
      body: JSON.stringify(body),
    });
    const b = await r.json().catch(() => ({}));
    if (r.status === 503) skip('key 判定 → 200', '未配置 JEVCODE_PLAYGROUND_KEY');
    else if (r.status === 502 || b.error === 'upstream') skip('key 判定 → 200', '上游判定不可达');
    else {
      ok('key 判定 → 200', r.status === 200, `得到 ${r.status} ${JSON.stringify(b).slice(0, 120)}`);
      ok('响应带 credit', b.credit && typeof b.credit.cents === 'number', JSON.stringify(b.credit));

      const me = await get('/api/auth/me');
      const mb = await me.json().catch(() => ({}));
      ok('余额已扣到 499 美分', mb.credit && mb.credit.cents === 499, JSON.stringify(mb.credit));
    }
  }

  console.log('\n吊销 key');
  {
    const me = await get('/api/auth/me');
    const mb = await me.json().catch(() => ({}));
    const kid = (mb.keys || [])[0] && mb.keys[0].id;
    const r = await post('/api/keys/revoke', { id: kid });
    ok('吊销成功', r.status === 200, `得到 ${r.status}`);

    const body = { state: 'after revoke probe', questions: { q1: { type: 'noul', instructions: 'Relevant?' } } };
    const tries = await fetch(`${base}/api/try`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${issuedKey}` },
      body: JSON.stringify(body),
    });
    // 503 = 服务端没配上游 key，此时根本走不到鉴权分支；判成失败会误导
    // （曾因忘记 source .env 而误报红），按跳过处理才是诚实的。
    if (tries.status === 503) skip('吊销后 key → 401', '未配置 JEVCODE_PLAYGROUND_KEY');
    else ok('吊销后 key → 401', tries.status === 401, `得到 ${tries.status}`);

    const other = await post('/api/keys/revoke', { id: 'not-my-key' });
    ok('吊销他人的 key → 404', other.status === 404, `得到 ${other.status}`);
  }

  console.log('\n登出');
  {
    const r = await post('/api/auth/logout');
    ok('登出 → 200', r.status === 200, `得到 ${r.status}`);
    const me = await get('/api/auth/me');
    ok('登出后 /me → 401', me.status === 401, `得到 ${me.status}`);
  }
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail} / 跳过 ${skipped}`);
process.exit(fail === 0 ? 0 : 1);
