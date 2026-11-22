#!/usr/bin/env node
/**
 * P1 安全与计费契约回归测试（全本地模拟上游，零外部网络依赖）。
 *
 * 覆盖：
 *   1. /v1/judge 默认不落盘公开分享文件（防业务数据泄漏）；share: true 时才写盘且 /api/runs/:id 剥离 userId
 *   2. /v1/judge 并发 TOCTOU 竞态消除：余额仅够 1 次时，并发 6 个请求只成功 1 个、余额绝不为负
 *   3. 上游失败按精确 entryId 退款，不影响并发中已成功的扣费；ledger 记录 key_id 且刷新 last_used_at
 *   4. 单 Key RPM 限频返回 429 rate_limit_exceeded + Retry-After
 *   5. HTTPS / 生产环境强制下发 Secure Cookie；本地 HTTP 不加 Secure
 *   6. POST /api/auth/password 改密并吊销其他设备会话
 *   7. 认证写接口按客户端 IP（优先 X-Real-IP）限频
 *   8. nginx 配置包含 Cloudflare set_real_ip_from、CF-Connecting-IP 及 /topics 裸路径重定向
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { openAccounts } from '../server/accounts.mjs';
import { billableInputTokens, toUpstreamQuestions, cleanQuestions } from '../server/questions.mjs';
import { inputCostMicroUsd } from '../server/plans.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function freePort() {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startPlayground({ dbPath, dataDir, upstreamUrl, extraEnv = {} }) {
  const port = await freePort();
  const child = spawn(process.execPath, ['server/playground.mjs'], {
    cwd: ROOT,
    env: {
      ...process.env,
      JEVCODE_PLAYGROUND_KEY: 'jev_test_local_secret',
      PLAYGROUND_PORT: String(port),
      PLAYGROUND_ACCOUNTS_DB: dbPath,
      PLAYGROUND_DATA: dataDir,
      PLAYGROUND_UPSTREAM: upstreamUrl,
      NODE_ENV: 'test',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const base = `http://127.0.0.1:${port}`;
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d.toString(); });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${base}/health`)).ok) return { base, child };
    } catch {}
    await sleep(50);
  }
  child.kill('SIGTERM');
  throw new Error(`playground failed to start: ${stderr}`);
}

test('P1：/v1/judge 隐私落盘、并发原子预扣防超扣、精确退款与审计字段', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-p1-v1-'));
  const dbPath = path.join(dir, 'acct.db');
  const dataDir = path.join(dir, 'runs');

  // 模拟上游：带 120ms 延迟制造真实并发窗口；state 含 FAIL_ME 时返回 500
  const upPort = await freePort();
  const upstream = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const body = JSON.parse(raw || '{}');
      setTimeout(() => {
        if (String(body.state || '').includes('FAIL_ME')) {
          res.writeHead(500, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ detail: 'simulated failure' }));
          return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ model: 'clavue-jev', answers: { q1: { noul: 0.91 } } }));
      }, 120);
    });
  });
  await new Promise((r) => upstream.listen(upPort, '127.0.0.1', r));

  // 准备两个用户：u1 用于隐私/退款/审计，u2 余额精确压到只够 1 次请求以测并发竞态
  const probeBody = {
    state: 'sensitive customer payload never leak',
    questions: { q1: { type: 'noul', instructions: 'Is this valid?' } },
  };
  const exactTokens = billableInputTokens(probeBody.state, toUpstreamQuestions(cleanQuestions(probeBody.questions, 6)));
  const exactCost = inputCostMicroUsd(exactTokens);

  const a = openAccounts(dbPath);
  const u1 = a.createUser('p1-u1@example.com');
  const { key: k1, record: kr1 } = a.issueKey(u1.id, 'k1');
  const u2 = a.createUser('p1-u2@example.com');
  const { key: k2 } = a.issueKey(u2.id, 'k2');
  // 把 u2 余额精确扣到刚好剩 1 笔 exactCost
  a._db.prepare('INSERT INTO ledger (user_id, ts, cents, kind, ref) VALUES (?, ?, ?, ?, ?)').run(
    u2.id, Date.now(), -(a.balanceMicro(u2.id) - exactCost), 'adjust', 'test',
  );
  assert.equal(a.balanceMicro(u2.id), exactCost);
  a.close();

  const { base, child } = await startPlayground({
    dbPath,
    dataDir,
    upstreamUrl: `http://127.0.0.1:${upPort}/v1/systemone`,
  });

  try {
    // 1. 默认 /v1/judge 不写盘，GET /api/runs/:id 必须 404，且带 Server-Timing 耗时头
    const rPriv = await fetch(`${base}/v1/judge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${k1}` },
      body: JSON.stringify(probeBody),
    });
    assert.equal(rPriv.status, 200);
    assert.match(rPriv.headers.get('server-timing') || '', /upstream;dur=\d+/, '应返回 Server-Timing 上游耗时头');
    const privJson = await rPriv.json();
    assert.match(privJson.id, /^[a-z0-9]{12}$/);
    assert.equal(existsSync(path.join(dataDir, `${privJson.id}.json`)), false, '默认 /v1/judge 不得落盘');
    const getPriv = await fetch(`${base}/api/runs/${privJson.id}`);
    assert.equal(getPriv.status, 404, '未声明 share 的 /v1/judge 记录不得公开读取');

    // 2. 显式 share: true 时落盘，但 GET /api/runs/:id 不得暴露 userId
    const rShare = await fetch(`${base}/v1/judge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${k1}` },
      body: JSON.stringify({ ...probeBody, share: true }),
    });
    assert.equal(rShare.status, 200);
    const shareJson = await rShare.json();
    assert.equal(existsSync(path.join(dataDir, `${shareJson.id}.json`)), true);
    const getShare = await fetch(`${base}/api/runs/${shareJson.id}`);
    assert.equal(getShare.status, 200);
    const pub = await getShare.json();
    assert.equal('userId' in pub, false, '公开 /api/runs/:id 不得暴露 userId');

    // 3. 并发下 1 成功 + 1 上游失败 → 仅失败那笔退款，成功扣费保留，且审计记录 key_id 与 last_used_at
    const [okRes, failRes] = await Promise.all([
      fetch(`${base}/v1/judge`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${k1}` },
        body: JSON.stringify(probeBody),
      }),
      fetch(`${base}/v1/judge`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${k1}` },
        body: JSON.stringify({ ...probeBody, state: 'FAIL_ME trigger upstream error' }),
      }),
    ]);
    assert.equal(okRes.status, 200);
    assert.equal(failRes.status, 502);

    const checkDb = openAccounts(dbPath);
    const entries = checkDb.entries(u1.id).filter((e) => e.kind === 'judge');
    assert.equal(entries.length, 3, '3 次成功留 3 条账，1 次失败已精确退回');
    assert.ok(entries.every((e) => e.key_id === kr1.id), '每条 judge 流水都应记录 key_id');
    assert.ok(checkDb.listKeys(u1.id)[0].last_used_at > 0, 'api_keys.last_used_at 应被刷新');

    // 4. TOCTOU 并发压测：u2 仅够 1 笔余额，同时打 6 个请求 → 恰好 1 个 200、5 个 429，余额=0 不为负
    const burst = await Promise.all(
      Array.from({ length: 6 }, () =>
        fetch(`${base}/v1/judge`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${k2}` },
          body: JSON.stringify(probeBody),
        }),
      ),
    );
    const codes = burst.map((r) => r.status).sort((x, y) => x - y);
    assert.deepEqual(codes, [200, 429, 429, 429, 429, 429], `并发竞态下只应放行 1 笔，实际 ${codes}`);
    assert.equal(checkDb.balanceMicro(u2.id), 0, '余额必须精确归零，绝不能超扣为负');
    checkDb.close();
  } finally {
    child.kill('SIGTERM');
    upstream.close();
    await sleep(150);
    rmSync(dir, { recursive: true, force: true });
  }
});

test('P1：单 Key RPM 限频、认证 IP 限频、Secure Cookie 与改密路由', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-p1-sec-'));
  const dbPath = path.join(dir, 'acct.db');
  const dataDir = path.join(dir, 'runs');

  const upPort = await freePort();
  const upstream = createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ model: 'clavue-jev', answers: { q1: { noul: 0.8 } } }));
  });
  await new Promise((r) => upstream.listen(upPort, '127.0.0.1', r));

  const a = openAccounts(dbPath);
  const u = a.createUser('rpm@example.com');
  const { key } = a.issueKey(u.id, 'rpm');
  a.close();

  const { base, child } = await startPlayground({
    dbPath,
    dataDir,
    upstreamUrl: `http://127.0.0.1:${upPort}/v1/systemone`,
    extraEnv: {
      JEVCODE_PLAYGROUND_KEY: 'jev_test_local_secret',
      PLAYGROUND_V1_RPM: '2',
      PLAYGROUND_AUTH_RPM: '4',
    },
  });

  try {
    // 1. 单 Key RPM 限频（上限 2，第 3 次必须 429 + retry-after）
    const body = { state: 'rate limit probe payload', questions: { q1: { type: 'noul', instructions: 'ok?' } } };
    for (let i = 0; i < 2; i++) {
      const r = await fetch(`${base}/v1/judge`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
      assert.equal(r.status, 200);
    }
    const r3 = await fetch(`${base}/v1/judge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    assert.equal(r3.status, 429);
    assert.ok(Number(r3.headers.get('retry-after')) >= 1);
    assert.equal((await r3.json()).error, 'rate_limit_exceeded');

    // 2. Secure Cookie：HTTPS 反代头下必须带 Secure，普通本地 HTTP 不带
    const cap = await (await fetch(`${base}/api/auth/captcha`)).json();
    const m = cap.question.match(/^(\d+)\s*([+−-])\s*(\d+)/);
    const ans = m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
    const regHttps = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-proto': 'https',
        'x-real-ip': '203.0.113.10',
      },
      body: JSON.stringify({
        email: 'sec@example.com',
        password: 'initial-password-1',
        captchaToken: cap.token,
        captchaAnswer: String(ans),
      }),
    });
    assert.equal(regHttps.status, 201);
    const httpsCookies = regHttps.headers.getSetCookie?.() || [];
    const sessHeader = httpsCookies.find((c) => c.startsWith('jev_session=')) || '';
    const hintHeader = httpsCookies.find((c) => c.startsWith('jev_auth=')) || '';
    assert.match(sessHeader, /;\s*HttpOnly/i, `jev_session 必须为 HttpOnly: ${sessHeader}`);
    assert.match(sessHeader, /;\s*Secure/i, `HTTPS 反代应下发 Secure Cookie，实际: ${sessHeader}`);
    assert.match(hintHeader, /^jev_auth=1;/, `登录/注册应下发 jev_auth=1 提示 Cookie: ${hintHeader}`);
    assert.doesNotMatch(hintHeader, /;\s*HttpOnly/i, 'jev_auth 提示位必须可供前端读取');
    assert.match(hintHeader, /;\s*Secure/i, `HTTPS 下 jev_auth 也应带 Secure: ${hintHeader}`);
    const sess1 = sessHeader.split(';')[0];

    // 第二个会话（本地 HTTP，不含 Secure）
    const loginHttp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.10' },
      body: JSON.stringify({ email: 'sec@example.com', password: 'initial-password-1' }),
    });
    assert.equal(loginHttp.status, 200);
    const httpCookie = (loginHttp.headers.getSetCookie?.() || []).join(';');
    assert.doesNotMatch(httpCookie, /;\s*Secure/i, `本地 HTTP 不应加 Secure，实际: ${httpCookie}`);
    const sess2 = (loginHttp.headers.getSetCookie?.() || [])[0].split(';')[0];

    // 未登录但带陈旧 jev_auth=1 提示位访问 /api/auth/me 时，服务端应主动清掉提示位
    const staleMe = await fetch(`${base}/api/auth/me`, { headers: { cookie: 'jev_auth=1' } });
    assert.equal(staleMe.status, 200);
    const cleared = (staleMe.headers.getSetCookie?.() || []).join(';');
    assert.match(cleared, /jev_auth=;.*Max-Age=0/i, `陈旧提示位应被清理: ${cleared}`);

    // 3. POST /api/auth/password 改密：踢掉其他设备会话，刷新当前会话
    const chg = await fetch(`${base}/api/auth/password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: sess2, 'x-real-ip': '203.0.113.10' },
      body: JSON.stringify({ oldPassword: 'initial-password-1', newPassword: 'rotated-password-2' }),
    });
    assert.equal(chg.status, 200);
    const sessNew = (chg.headers.getSetCookie?.() || []).join(';').split(';')[0];
    assert.ok(sessNew && sessNew !== sess2);
    const meOld = await (await fetch(`${base}/api/auth/me`, { headers: { cookie: sess1 } })).json();
    assert.equal(meOld.user, null, '改密后其他设备旧会话必须失效');
    const meNew = await (await fetch(`${base}/api/auth/me`, { headers: { cookie: sessNew } })).json();
    assert.equal(meNew.user.email, 'sec@example.com');

    // 4. 认证写接口限频（同一 X-Real-IP 203.0.113.10 已发 3 次，第 4 次放行，第 5 次 429）
    const l4 = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.10' },
      body: JSON.stringify({ email: 'sec@example.com', password: 'wrong-password' }),
    });
    assert.equal(l4.status, 401);
    const l5 = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.10' },
      body: JSON.stringify({ email: 'sec@example.com', password: 'wrong-password' }),
    });
    assert.equal(l5.status, 429);
    assert.equal((await l5.json()).error, 'rate_limit_exceeded');
  } finally {
    child.kill('SIGTERM');
    upstream.close();
    await sleep(150);
    rmSync(dir, { recursive: true, force: true });
  }
});

test('P1：nginx 配置启用 Cloudflare real_ip 且覆盖 /topics 裸路径跳转', () => {
  const conf = readFileSync(new URL('../deploy/nginx/jevcode.conf', import.meta.url), 'utf8');
  assert.match(conf, /set_real_ip_from 104\.16\.0\.0\/13;/);
  assert.match(conf, /set_real_ip_from 2400:cb00::\/32;/);
  const cfHeaders = conf.match(/real_ip_header CF-Connecting-IP;/g) ?? [];
  assert.ok(cfHeaders.length >= 2, 'www 与 api 两个 server 块均须启用 CF-Connecting-IP');
  assert.match(conf, /location ~ \^\//);
  assert.match(conf, /\|topics\|/);
});

test('P2/P3：匿名访客跳过 /me、sitemap 默认语言与站点对齐、favicon.ico 合法且 robots 节流商业爬虫', () => {
  const header = readFileSync(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
  assert.match(header, /jev_auth=1/, 'Header.astro 应先检查 jev_auth=1 再发 /api/auth/me');

  const astroCfg = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
  const defaults = astroCfg.match(/defaultLocale:\s*'([^']+)'/g) ?? [];
  assert.equal(defaults.length, 2);
  assert.ok(defaults.every((d) => d.includes("'en'")), `i18n 与 sitemap 的 defaultLocale 均应为 en，实际 ${defaults}`);

  const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url));
  assert.ok(ico.length > 100, 'favicon.ico 不应为空');
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0], 'favicon.ico 应具备合法 ICO 文件头');

  const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /User-agent:\s*SemrushBot[\s\S]*?Crawl-delay:\s*10/);
  assert.match(robots, /User-agent:\s*AhrefsBot[\s\S]*?Crawl-delay:\s*10/);
  assert.match(robots, /User-agent:\s*GPTBot[\s\S]*?Allow:\s*\//);
});
