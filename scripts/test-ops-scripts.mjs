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
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { blockingDirty } from './pipeline-guard.mjs';
import { applyMetrics, insertEntries, mergeTweets, tweetsFromSearch } from './lib/community-x.mjs';
import { nextScenarios } from './lib/lab-supplement.mjs';
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

test('日更脏区判断忽略 .data 和未跟踪的 coverage-full，拦住 src', () => {
  const porcelain = [
    ' M .data/runs/compare-log-hospitality-backup.jsonl',
    '?? .data/runs/foo.jsonl',
    '?? docs/coverage-full/extra.md',
    ' M docs/coverage-full/SUMMARY.md',
    ' M src/data/ecosystem.ts',
  ].join('\n');
  const blocking = blockingDirty(porcelain);
  assert.equal(blocking.some((line) => line.includes('.data/')), false);
  assert.equal(blocking.some((line) => line.includes('docs/coverage-full/extra.md')), false);
  assert.ok(blocking.some((line) => line.includes('docs/coverage-full/SUMMARY.md')));
  assert.ok(blocking.some((line) => line.includes('src/data/ecosystem.ts')));
});

test('社区指标原位替换，新推文去重并封顶', () => {
  const src = [
    'export const pulseEntries = [',
    '  {',
    '    id: "1",',
    '    views: 10,',
    '    likes: 2,',
    '  },',
    '];',
    '',
  ].join('\n');
  const updated = applyMetrics(src, [{ id: '1', views: 11, likes: 3 }]);
  assert.match(updated, /views: 11/);
  assert.match(updated, /likes: 3/);
  const incoming = tweetsFromSearch({
    data: [
      { id: '1', text: 'dup', author_id: 'u1', created_at: '2026-10-01T00:00:00.000Z', public_metrics: { impression_count: 5, like_count: 1 } },
      { id: '2', text: 'Jev update', author_id: 'u2', created_at: '2026-10-02T00:00:00.000Z', public_metrics: { impression_count: 9, like_count: 4 } },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: String(10 + i),
        text: `post ${i}`,
        author_id: 'u2',
        created_at: '2026-10-03T00:00:00.000Z',
        public_metrics: { impression_count: 1, like_count: 1 },
      })),
    ],
    includes: { users: [{ id: 'u1', name: 'Ann', username: 'ann' }, { id: 'u2', name: 'Bo', username: 'bo' }] },
  });
  const added = mergeTweets(['1'], incoming, 8);
  assert.equal(added.length, 8);
  assert.equal(added.some((tweet) => tweet.id === '1'), false);
  assert.equal(added[0].id, '2');
  assert.equal(added[0].screenName, 'bo');
  const inserted = insertEntries(updated, added.slice(0, 1));
  assert.match(inserted, /id: "2"/);
  assert.equal(inserted.match(/id: "2"/g).length, 1);
});

test('实验室补充不重复已有场景，也不把 cov- 写进对照题库', () => {
  const coverage = [
    { id: 'cov-a', context: 'hello world context', question: 'Q?', choices: ['yes', 'no'], accept: ['yes'] },
    { id: 'cov-b', context: 'second context here', question: 'Q2?', choices: ['a', 'b', 'c'], accept: ['a'] },
    { id: 'builtin', context: 'not a coverage id', question: 'q', choices: ['a', 'b'], accept: ['a'] },
  ];
  const out = nextScenarios(coverage, new Set(['builtin', 'cov-a']), 4);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 'cov-b');
  assert.equal(out[0].questions.answer.type, 'choice');
  assert.deepEqual(out[0].questions.answer.options, ['a', 'b', 'c']);
  const index = JSON.parse(readFileSync(new URL('../server/case-index.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(index).some((key) => key.startsWith('cov-')), false);
});

test('intake 监听 8791，nginx 不再把 intake 反代到 8787', () => {
  const py = readFileSync(new URL('../deploy/intake/server.py', import.meta.url), 'utf8');
  const example = readFileSync(new URL('../deploy/intake/intake.env.example', import.meta.url), 'utf8');
  const nginx = readFileSync(new URL('../deploy/nginx/jevcode.conf', import.meta.url), 'utf8');
  const health = readFileSync(new URL('./healthcheck.mjs', import.meta.url), 'utf8');
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(py, /JEVCODE_INTAKE_PORT", "8791"/);
  assert.match(example, /JEVCODE_INTAKE_PORT=8791/);
  assert.match(health, /127\.0\.0\.1:8791\/api\/health/);
  assert.doesNotMatch(health, /8787/);
  assert.doesNotMatch(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8787/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8791/);
  assert.doesNotMatch(pipeline, /git add -A/);
  assert.match(pipeline, /src\/data\/community\.ts/);
  assert.match(pipeline, /src\/data\/lab-supplement\.json/);
  assert.match(pipeline, /src\/data\/lab-records\.json/);
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

test('门 1 HOLD 时不丢弃生态 pending 批次', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  // 此前发布收尾无条件 p.pending = {}，门 1 HOLD 的批次被丢掉，pending 只涨不落。
  assert.match(pipeline, /const cleared = publishEco \? Object\.keys\(p\.pending\)\.length : 0/);
  assert.match(pipeline, /if \(publishEco\) p\.pending = \{\};/);
  assert.match(pipeline, /pending batch kept/);
  assert.doesNotMatch(pipeline, /\nconst cleared = Object\.keys\(p\.pending\)\.length;\np\.pending = \{\};/);
});

test('门 1 计数跨天持久，HOLD 分支不再按当天文件行数计数', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(pipeline, /bumpGate1Streak\(GATE1_STREAK_FILE\)/);
  assert.doesNotMatch(pipeline, /prevHold\.split\('\\n'\)\.filter/);
});

test('门 1 陈旧超限时跳过 judge，直接发布', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(pipeline, /isEcoStale\(lastEcoRelease\(pending\), ECO_STALE_DAYS\)/);
  assert.match(pipeline, /gate1-stale-override/);
  // 护栏分支必须绕过 gate1 调用，否则分数仍会抖动
  assert.match(pipeline, /if \(stale\) \{[\s\S]{0,400}?g1 = \{ worth_publishing: \{ noul: 1 \}/);
  // 陈旧天数是确定事实，要进 judge 的输入
  assert.match(pipeline, /async function gate1\(fetchReport, pending, trigger, staleDays\)/);
  assert.match(pipeline, /already \$\{staleDays\} day\(s\) old/);
});

test('eco_last_release 只在生态真正发布时更新', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(pipeline, /if \(publishEco\) \{\s*p\.eco_last_release = new Date\(\)\.toISOString\(\);/);
});

test('成功发布后清理旧 ALERT，避免告警堆积', () => {
  const cron = readFileSync(new URL('./pipeline-cron.sh', import.meta.url), 'utf8');
  // ALERT 只在连续失败时写入；成功后不清理会一路累积，无法判断哪条仍有效
  assert.match(cron, /if published_today; then\s*\n\s*streak_reset/);
  assert.match(cron, /rm -f \.research\/pipeline-logs\/ALERT-\*\.txt/);
  // 清理必须在成功分支内，失败时不得删除当前告警
  const failBranch = cron.slice(cron.indexOf('else', cron.indexOf('if published_today')));
  assert.doesNotMatch(failBranch.slice(0, 200), /rm -f \.research\/pipeline-logs\/ALERT/);
});

test('链接检查剥离查询串，不把 ?mode=register 误报成断链', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  // /en/login/?mode=register 的真实文件是 dist/en/login/index.html，
  // 只剥 # 会让 8 个语言各报一条假断链，进而拖低门 2 的 ready 分。
  assert.match(pipeline, /m\[1\]\.split\('#'\)\[0\]\.split\('\?'\)\[0\]/);
});

test('门 2 收到的是真实分类描述，而不是原始 git log --stat', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  // 直接传 `git log -1 --stat` 时模型只看到变更面积，实测 ready 长期 0.15~0.22
  assert.doesNotMatch(pipeline, /: run\('git log -1 --stat --oneline'\)/);
  assert.match(pipeline, /: describeRelease\(\)/);
  // 描述基于整轮待发布范围（origin/main..HEAD），不是最后一笔提交
  assert.match(pipeline, /git diff --name-only origin\/main\.\.HEAD/);
  // 必须如实分类，不得写「没有逻辑变更」这类在带脚本修复时不成立的断言
  assert.doesNotMatch(pipeline, /No application logic, layout, routing, or dependency changes/);
  assert.match(pipeline, /Pipeline\/script updates/);
  assert.match(pipeline, /Data refresh/);
});

test('门 2 HOLD / 构建失败时撤销本轮提交', () => {
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  // 提交发生在门 2 之前，restoreFetched 只能还原未提交的写入；
  // 不撤销会让 HOLD 的数据留在历史里，下次再追加一批（2026-10-19 累积 200 篇）。
  assert.match(pipeline, /function dropThisCycleCommit\(\)/);
  // 实际的 git 撤销动作在 lib 里（由 test-cycle-commit.mjs 用临时仓库真实验证），
  // 这里只确认管线调用的是它。
  assert.match(pipeline, /dropLastCommit\(\)/);
  const hold = pipeline.slice(pipeline.indexOf("say('gate2: HOLD"));
  assert.match(hold.slice(0, 200), /dropThisCycleCommit\(\)/);
  const mech = pipeline.slice(pipeline.indexOf('gate2 skipped: mechanical gates failed'));
  assert.match(mech.slice(0, 200), /dropThisCycleCommit\(\)/);
  const fail = pipeline.slice(pipeline.indexOf('gate2 FAILED'));
  assert.match(fail.slice(0, 200), /dropThisCycleCommit\(\)/);
});
