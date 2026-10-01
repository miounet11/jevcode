#!/usr/bin/env node
/**
 * 生产路由层护栏：production 且未配发信通道时，验证码登录整体不可用。
 *
 * 用法：node --test scripts/test-mailer-production.mjs
 *
 * 为什么单独一层：
 *   scripts/test-mailer.mjs 锁的是 makeMailer 的单元契约（返回 null / 抛错）。
 *   但「不可发信时 /api/auth/otp/* 返回失败而非 200」的责任在每个调用点上，
 *   单元测试覆盖不到。本文件起真实服务，从 HTTP 层验证这条路由语义，
 *   并确认验证码不会出现在服务 stdout/stderr（deploy/ACCOUNTS-DEPLOY.md
 *   「上线前必须做的三件事」第 1 条描述的故障形态）。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import net from 'node:net';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'jev-mailprod-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 找一个真正空闲的端口：避免固定端口被陈旧实例占用而静默连错服务 */
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

/** 起一个 playground 服务，返回 { base, out, waitUp, post, stop } */
async function startServer(extraEnv) {
  const port = await freePort();
  const state = { out: '', exited: false, code: null };

  const child = spawn(process.execPath, ['server/playground.mjs'], {
    env: {
      ...process.env,
      PLAYGROUND_PORT: String(port),
      PLAYGROUND_ACCOUNTS_DB: path.join(dir, `acct-${port}.db`),
      PLAYGROUND_DATA: path.join(dir, `runs-${port}`),
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => { state.out += d.toString(); });
  child.stderr.on('data', (d) => { state.out += d.toString(); });
  child.on('exit', (code) => { state.exited = true; state.code = code; });

  const base = `http://127.0.0.1:${port}`;
  state.base = base;

  // 必须同时满足：子进程打出了自己的 listening 行 + /health 可达。
  // 只看 /health 会在端口被别的实例占用时误判，从而测到错误的进程。
  state.waitUp = async () => {
    const listening = new RegExp(`listening on 127\\.0\\.0\\.1:${port}`);
    for (let i = 0; i < 60; i++) {
      if (state.exited) return false;
      if (listening.test(state.out)) {
        try { if ((await fetch(`${base}/health`)).ok) return true; } catch {}
      }
      await sleep(100);
    }
    return false;
  };

  state.post = (p, body) => fetch(base + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  state.stop = async () => {
    child.kill('SIGTERM');
    await sleep(200);
  };
  return state;
}

test('production 无通道：otp 请求/验码均 503，服务输出不含验证码', async () => {
  const s = await startServer({ NODE_ENV: 'production', MAIL_TRANSPORT: '' });
  try {
    assert.ok(await s.waitUp(), `服务未就绪（exited=${s.exited}）输出：${s.out.slice(0, 400)}`);

    const req = await s.post('/api/auth/otp/request', { email: 'prod@example.com' });
    const reqBody = await req.json().catch(() => ({}));
    assert.equal(req.status, 503, `otp/request 应 503，得到 ${req.status}`);
    assert.equal(reqBody.error, 'code_login_unavailable');

    const ver = await s.post('/api/auth/otp/verify', { email: 'prod@example.com', code: '123456' });
    assert.equal(ver.status, 503, `otp/verify 应 503，得到 ${ver.status}`);

    assert.equal(
      /\[mail:console\]/.test(s.out),
      false,
      `验证码通道不应启用，输出里却出现发码行：${s.out.slice(0, 300)}`
    );
    assert.equal(/\bcode=\d{6}\b/.test(s.out), false, '服务输出泄露了验证码');
  } finally {
    await s.stop();
  }
});

test('对照：开发模式（未设 NODE_ENV）otp 请求走 console 通道返回 200', async () => {
  // 这不是缺陷，而是「生产必须显式设 NODE_ENV=production」的动机依据：
  // 一旦 NODE_ENV 缺失，服务会像开发环境一样把验证码打到日志。
  const s = await startServer({ NODE_ENV: '', MAIL_TRANSPORT: 'console' });
  try {
    assert.ok(await s.waitUp(), `服务未就绪（exited=${s.exited}）输出：${s.out.slice(0, 400)}`);
    const req = await s.post('/api/auth/otp/request', { email: 'dev@example.com' });
    assert.equal(req.status, 200, `开发模式 otp/request 应 200，得到 ${req.status}`);
    assert.equal(
      /\[mail:console\] to=dev@example\.com code=\d{6}/.test(s.out),
      true,
      '开发模式应把验证码打到日志（这正是生产必须设 NODE_ENV=production 的原因）'
    );
  } finally {
    await s.stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
