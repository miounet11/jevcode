#!/usr/bin/env node
/**
 * 验证码门禁：起一个「配置了签名密钥」的服务实例，验证注册确实被验证码挡住。
 *
 * 为什么单独一个文件：test-auth-flow.mjs 故意不配 KEY（保持本地可跑），
 * 而验证码只在配了 KEY 时才强制。要证明强制生效，必须另起一个带 KEY 的实例。
 *
 * 用法：node scripts/test-captcha.mjs
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PORT = 8795;
const KEY = 'captcha-test-key';
const dir = mkdtempSync(path.join(tmpdir(), 'jev-captcha-'));
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0;
const ok = (n, c, extra = '') => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n} ${extra}`); } };

const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_ACCOUNTS_DB: path.join(dir, 'acct.db'),
    PLAYGROUND_DATA: path.join(dir, 'runs'),
    JEVCODE_PLAYGROUND_KEY: KEY,
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

const post = (p, body) => fetch(base + p, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body ?? {}),
});

/** 取一道题并算出正确答案 */
async function solve() {
  const r = await fetch(`${base}/api/auth/captcha`);
  const c = await r.json();
  const m = String(c.question).match(/^(\d+) ([+−]) (\d+) = \?$/);
  const a = Number(m[1]), b = Number(m[3]);
  return { ...c, answer: m[2] === '+' ? a + b : a - b };
}

try {
  if (!(await waitUp())) {
    console.log('服务未启动：', serverErr.slice(0, 400));
    process.exit(1);
  }
  console.log(`服务已启动 :${PORT}（已配 KEY，验证码应强制）\n`);

  console.log('验证码下发');
  {
    const r = await fetch(`${base}/api/auth/captcha`);
    const c = await r.json();
    ok('GET /api/auth/captcha → 200', r.status === 200, `得到 ${r.status}`);
    ok('返回 question', typeof c.question === 'string' && c.question.includes('='), JSON.stringify(c.question));
    ok('返回 token', typeof c.token === 'string' && c.token.includes('.'), String(c.token).slice(0, 24));
  }

  console.log('\n注册门禁');
  {
    const no = await post('/api/auth/register', { email: 'a@example.com', password: 'a-good-password' });
    ok('不带验证码 → 400', no.status === 400, `得到 ${no.status}`);

    const c = await solve();
    const wrong = await post('/api/auth/register', {
      email: 'a@example.com', password: 'a-good-password',
      captchaToken: c.token, captchaAnswer: String(c.answer + 1),
    });
    ok('验证码答错 → 400', wrong.status === 400, `得到 ${wrong.status}`);

    const forged = await post('/api/auth/register', {
      email: 'a@example.com', password: 'a-good-password',
      captchaToken: '9999999999999.AAAA', captchaAnswer: String(c.answer),
    });
    ok('伪造 token → 400', forged.status === 400, `得到 ${forged.status}`);

    const good = await solve();
    const created = await post('/api/auth/register', {
      email: 'a@example.com', password: 'a-good-password',
      captchaToken: good.token, captchaAnswer: String(good.answer),
    });
    const b = await created.json().catch(() => ({}));
    ok('正确验证码 → 201', created.status === 201, `得到 ${created.status} ${JSON.stringify(b)}`);
    ok('确实建号', b.user && b.user.email === 'a@example.com', JSON.stringify(b.user));

    // 同一 token 重放：签名只绑定答案+过期，答案不变时 token 可复用。
    // 这是刻意的取舍（无状态、无 session 存储），此处把行为记录下来，
    // 避免日后误以为是漏洞。真正的防重放要靠一次性 nonce 存储。
    const replay = await post('/api/auth/register', {
      email: 'b@example.com', password: 'a-good-password',
      captchaToken: good.token, captchaAnswer: String(good.answer),
    });
    ok('token 在有效期内可复用（无状态设计，已知取舍）', replay.status === 201, `得到 ${replay.status}`);
  }
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
