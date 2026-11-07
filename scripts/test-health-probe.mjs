#!/usr/bin/env node
/**
 * 健康探测脚本的本地验收：启动一个可控的 HTTP 服务，覆盖四种情形。
 * 用法：node scripts/test-health-probe.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PROBE = path.join(ROOT, 'deploy/health-probe.sh');

function probe(url, attempts = 3, delay = 0) {
  return new Promise((resolve) => {
    execFile('bash', [PROBE, url, String(attempts), String(delay)], { cwd: ROOT, timeout: 60000 },
      (err, stdout, stderr) => resolve({ code: err ? (err.code ?? 1) : 0, stdout, stderr }));
  });
}

/** 起一个按 hits 序列应答的服务，返回 { url, close, hits } */
async function startServer(script) {
  let hits = 0;
  const srv = createServer((req, res) => {
    const status = script(hits++, req);
    res.writeHead(status);
    res.end(String(status));
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const { port } = srv.address();
  return {
    base: `http://127.0.0.1:${port}`,
    hits: () => hits,
    close: () => new Promise((r) => srv.close(r)),
  };
}

test('健康探测：首次 503、下次 200 时判定成功，且真的重试了', async () => {
  const srv = await startServer((n) => (n === 0 ? 503 : 200));
  try {
    const r = await probe(`${srv.base}/flaky`, 3, 0);
    assert.equal(r.code, 0, `应恢复成功，实际退出 ${r.code}：${r.stderr}`);
    assert.equal(r.stdout, '200');
    assert.equal(srv.hits(), 2, `应探测 2 次，实际 ${srv.hits()}`);
    assert.match(r.stderr, /第 2 次探测恢复 200/);
  } finally {
    await srv.close();
  }
});

test('健康探测：持续 500 时重试次数有界并最终失败', async () => {
  const srv = await startServer(() => 500);
  try {
    const r = await probe(`${srv.base}/dead`, 3, 0);
    assert.equal(r.code, 1, `持续 5xx 应失败，实际 ${r.code}`);
    assert.equal(r.stdout, '500');
    assert.equal(srv.hits(), 3, `应正好探测 3 次，实际 ${srv.hits()}`);
    assert.match(r.stderr, /重试 3 次后仍失败/);
  } finally {
    await srv.close();
  }
});

test('健康探测：404 是真实故障，不重试', async () => {
  const srv = await startServer(() => 404);
  try {
    const r = await probe(`${srv.base}/missing`, 3, 0);
    assert.equal(r.code, 1);
    assert.equal(r.stdout, '404');
    assert.equal(srv.hits(), 1, `4xx 不应重试，实际探测 ${srv.hits()} 次`);
    assert.match(r.stderr, /不可重试/);
  } finally {
    await srv.close();
  }
});

test('健康探测：连接错误按 000 处理并重试', async () => {
  // 先占一个端口再关掉，拿到「一定会被拒绝」的地址。
  const srv = await startServer(() => 200);
  const deadUrl = `${srv.base}/gone`;
  await srv.close();
  const r = await probe(deadUrl, 2, 0);
  assert.equal(r.code, 1, `连不上应失败，实际 ${r.code}`);
  // 曾经的 bug：`curl ... || echo 000` 会把两个 000 拼成 `000000`。
  assert.equal(r.stdout, '000', `连接错误应记单个 000，实际 ${r.stdout}`);
  assert.doesNotMatch(r.stderr, /000000/, '不应出现拼接出的 000000');
  assert.match(r.stderr, /重试 2 次后仍失败/);
});

test('健康探测：缺参数时退出 2 并给出用法', async () => {
  const r = await new Promise((resolve) => {
    execFile('bash', [PROBE], { cwd: ROOT }, (err, stdout, stderr) =>
      resolve({ code: err ? (err.code ?? 1) : 0, stdout, stderr }));
  });
  assert.equal(r.code, 2);
  assert.match(r.stderr, /用法/);
});
