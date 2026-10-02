#!/usr/bin/env node
/**
 * 运维脚本验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-ops-scripts.mjs
 *
 * 覆盖两个 CLI 脚本，它们此前没有任何自动化回归网：
 *   - scripts/backup-accounts.mjs ：WAL 一致性备份
 *   - scripts/healthcheck.mjs     ：服务/端点巡检与告警
 *
 * 两者都是「未配就静默出问题」的脚本，所以测试重点在失败路径与退出码。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { createServer } from 'node:http';
import { openAccounts } from '../server/accounts.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 跑一个脚本，返回 { code, out } */
function run(script, args = [], env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [script, ...args], {
      cwd: ROOT,
      env: { ...process.env, ...env },
      timeout: 30000,
    }, (err, stdout, stderr) => {
      resolve({ code: err ? (err.code ?? 1) : 0, out: `${stdout}${stderr}` });
    });
  });
}

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

// ---------------- backup-accounts.mjs ----------------

test('备份：WAL 库数据完整落入快照，可被 openAccounts 读回', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bk-'));
  try {
    const db = path.join(dir, 'accounts.db');
    const a = openAccounts(db);
    for (let i = 0; i < 30; i++) a.createUser(`bk${i}@example.com`);
    a.close();

    const out = path.join(dir, 'out');
    const r = await run('scripts/backup-accounts.mjs', [], {
      PLAYGROUND_ACCOUNTS_DB: db, BACKUP_DIR: out,
    });
    assert.equal(r.code, 0, `应成功，实际退出 ${r.code}：${r.out}`);

    const files = readdirSync(out).filter((f) => /^accounts-\d{8}T\d{6}Z\.db$/.test(f));
    assert.equal(files.length, 1, `应产出 1 份快照，实际 ${files.length}`);

    const b = openAccounts(path.join(out, files[0]));
    const n = b._db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
    assert.equal(n, 30, '快照里的用户数应与源库一致');
    assert.equal(b.getUserByEmail('bk7@example.com').email, 'bk7@example.com');
    b.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('备份：库不存在 → 非零退出', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bk-'));
  try {
    const r = await run('scripts/backup-accounts.mjs', [], {
      PLAYGROUND_ACCOUNTS_DB: path.join(dir, 'nope.db'), BACKUP_DIR: path.join(dir, 'out'),
    });
    assert.equal(r.code, 1, `库不存在应退出 1，实际 ${r.code}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('备份：未指定库路径 → 非零退出', async () => {
  const r = await run('scripts/backup-accounts.mjs', [], {
    PLAYGROUND_ACCOUNTS_DB: '', BACKUP_DIR: '/tmp/jev-bk-never',
  });
  assert.equal(r.code, 1, `未指定库路径应退出 1，实际 ${r.code}`);
});

test('备份：源不是合法库 → 非零退出', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bk-'));
  try {
    const bad = path.join(dir, 'bad.db');
    writeFileSync(bad, 'not a database');
    const r = await run('scripts/backup-accounts.mjs', [], {
      PLAYGROUND_ACCOUNTS_DB: bad, BACKUP_DIR: path.join(dir, 'out'),
    });
    assert.equal(r.code, 1, `坏库应退出 1，实际 ${r.code}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('备份：轮转按 BACKUP_KEEP 只留指定份数', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bk-'));
  try {
    const db = path.join(dir, 'accounts.db');
    openAccounts(db).close();
    const out = path.join(dir, 'out');
    // 文件名精确到秒，靠 sleep 保证唯一
    for (let i = 0; i < 3; i++) {
      const r = await run('scripts/backup-accounts.mjs', [], {
        PLAYGROUND_ACCOUNTS_DB: db, BACKUP_DIR: out, BACKUP_KEEP: '2',
      });
      assert.equal(r.code, 0, r.out);
      await sleep(1100);
    }
    const files = readdirSync(out).filter((f) => f.startsWith('accounts-'));
    assert.equal(files.length, 2, `BACKUP_KEEP=2 应只剩 2 份，实际 ${files.length}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------- healthcheck.mjs ----------------

test('巡检：全部健康 → 退出 0 且不产生告警', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":true}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '', // 关掉 systemd 检查（测试机无这些单元）
      HEALTHCHECK_BACKUP_DIR: '', // 与测试机无关，关掉备份新鲜度检查
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
    });
    assert.equal(r.code, 0, `应退出 0，实际 ${r.code}：${r.out}`);
    assert.match(r.out, /OK/, '健康时应打印 OK');
  } finally {
    srv.close();
  }
});

test('巡检：端点不可达 → 退出 1', async () => {
  const r = await run('scripts/healthcheck.mjs', [], {
    HEALTHCHECK_UNITS: '',
    HEALTHCHECK_HTTP: 'http://127.0.0.1:9/nope',
  });
  assert.equal(r.code, 1, `故障应退出 1，实际 ${r.code}`);
});

test('巡检：HEALTHCHECK_UNITS= 空串表示不检查单元（不被默认值覆盖）', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_BACKUP_DIR: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
    });
    assert.match(r.out, /units=0/, `应报告 units=0，实际：${r.out}`);
  } finally {
    srv.close();
  }
});

test('巡检：配了 ALERT_WEBHOOK_URL 时告警真的被 POST 出去', async () => {
  const got = [];
  const port = await freePort();
  const srv = createServer((req, res) => {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => { got.push({ method: req.method, url: req.url, body: b }); res.writeHead(200); res.end('ok'); });
  });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_HTTP: 'http://127.0.0.1:9/nope',
      ALERT_WEBHOOK_URL: `http://127.0.0.1:${port}/hook`,
    });
    assert.equal(r.code, 1, '有故障时仍应退出 1');
    assert.equal(got.length, 1, '接收器应收到 1 次告警');
    assert.equal(got[0].method, 'POST');
    const payload = JSON.parse(got[0].body);
    assert.ok(Array.isArray(payload.failures) && payload.failures.length >= 1, '告警体应含 failures');
    assert.match(payload.text, /异常/);
  } finally {
    srv.close();
  }
});

test('巡检：备份新鲜 → 通过（退出 0）', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  const bk = mkdtempSync(path.join(tmpdir(), 'jev-hcbk-'));
  try {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z').replace('Z', ''); // YYYYMMDDTHHMMSS
    writeFileSync(path.join(bk, `accounts-${stamp}Z.db`), 'x');
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
      HEALTHCHECK_BACKUP_DIR: bk,
    });
    assert.equal(r.code, 0, `新鲜备份应退出 0，实际 ${r.code}：${r.out}`);
    assert.match(r.out, /backup<=/, '健康输出应带上备份检查状态');
  } finally {
    srv.close(); rmSync(bk, { recursive: true, force: true });
  }
});

test('巡检：备份过期 → 退出 1 且报 backup 项', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  const bk = mkdtempSync(path.join(tmpdir(), 'jev-hcbk-'));
  try {
    const old = new Date(Date.now() - 200 * 60000).toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z').replace('Z', '');
    writeFileSync(path.join(bk, `accounts-${old}Z.db`), 'x');
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
      HEALTHCHECK_BACKUP_DIR: bk,
    });
    assert.equal(r.code, 1, `过期备份应退出 1，实际 ${r.code}`);
    assert.match(r.out, /backup/, '应报告 backup 异常');
    assert.match(r.out, /过期/, '应说明快照已过期');
  } finally {
    srv.close(); rmSync(bk, { recursive: true, force: true });
  }
});

test('巡检：备份目录为空 → 退出 1', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  const bk = mkdtempSync(path.join(tmpdir(), 'jev-hcbk-'));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
      HEALTHCHECK_BACKUP_DIR: bk,
    });
    assert.equal(r.code, 1, `空备份目录应退出 1，实际 ${r.code}`);
    assert.match(r.out, /没有任何快照/, '应说明目录里没有快照');
  } finally {
    srv.close(); rmSync(bk, { recursive: true, force: true });
  }
});

test('巡检：HEALTHCHECK_BACKUP_DIR= 置空表示关闭备份检查', async () => {
  const port = await freePort();
  const srv = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((r) => srv.listen(port, '127.0.0.1', r));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${port}/health`,
      HEALTHCHECK_BACKUP_DIR: '',
    });
    assert.equal(r.code, 0, `关闭备份检查应退出 0，实际 ${r.code}`);
    assert.match(r.out, /backup=off/, '应显示备份检查已关闭');
  } finally {
    srv.close();
  }
});

test('巡检：健康时不投递告警（避免告警疲劳）', async () => {
  const got = [];
  const healthPort = await freePort();
  const hookPort = await freePort();
  const h = createServer((_, res) => { res.writeHead(200); res.end('{}'); });
  const hook = createServer((req, res) => { let b = ''; req.on('data', (d) => { b += d; }); req.on('end', () => { got.push(b); res.writeHead(200); res.end('ok'); }); });
  await new Promise((r) => h.listen(healthPort, '127.0.0.1', r));
  await new Promise((r) => hook.listen(hookPort, '127.0.0.1', r));
  try {
    const r = await run('scripts/healthcheck.mjs', [], {
      HEALTHCHECK_UNITS: '',
      HEALTHCHECK_BACKUP_DIR: '',
      HEALTHCHECK_HTTP: `http://127.0.0.1:${healthPort}/health`,
      ALERT_WEBHOOK_URL: `http://127.0.0.1:${hookPort}/hook`,
    });
    assert.equal(r.code, 0);
    assert.equal(got.length, 0, '健康时不应投递任何告警');
  } finally {
    h.close(); hook.close();
  }
});
