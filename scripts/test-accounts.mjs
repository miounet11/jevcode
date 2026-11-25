#!/usr/bin/env node
/**
 * 账号与额度账本的验收测试（零依赖，node:test）。
 *
 * 口径：注册送 $5。按输入 token 计费，1000 token = 42 微美元。
 * 账本列里存的是微美元。旧库的美分只乘 10000 一次。
 *
 * 用法：node --test scripts/test-accounts.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  openAccounts, SIGNUP_CREDIT_CENTS, SIGNUP_CREDIT_MICROUSD, centsToUsd,
  inputCostMicroUsd, SIGNUP_INPUT_TOKENS, FUNNEL_EVENTS, MICROUSD_PER_CENT,
} from '../server/accounts.mjs';

const fresh = () => openAccounts(':memory:');

test('注册赠送 $5', () => {
  const a = fresh();
  const u = a.createUser('x@example.com');
  const b = a.balance(u.id);
  assert.equal(b.cents, SIGNUP_CREDIT_CENTS);
  assert.equal(b.cents, 500);
  assert.equal(b.usd, '5.00');
  assert.equal(b.microUsd, SIGNUP_CREDIT_MICROUSD);
  assert.equal(b.inputTokensLeft, SIGNUP_INPUT_TOKENS);
  assert.equal(b.judgmentsLeft, SIGNUP_INPUT_TOKENS);
  a.close();
});

test('centsToUsd 格式正确', () => {
  assert.equal(centsToUsd(0), '0.00');
  assert.equal(centsToUsd(5), '0.05');
  assert.equal(centsToUsd(500), '5.00');
  assert.equal(centsToUsd(12345), '123.45');
});

test('重复 email 幂等，且不重复赠送额度', () => {
  const a = fresh();
  const u1 = a.createUser('x@example.com');
  const u2 = a.createUser('x@example.com');
  assert.equal(u1.id, u2.id);
  assert.equal(a.balance(u1.id).microUsd, SIGNUP_CREDIT_MICROUSD, '不能赠送两次');
  a.close();
});

test('签发 key 后可用明文换回用户，库里不留明文', () => {
  const a = fresh();
  const u = a.createUser('k@example.com');
  const { key, record } = a.issueKey(u.id, 'cli');
  assert.match(key, /^jev_/);
  assert.equal(a.resolveKey(key).user.id, u.id);
  const row = a._db.prepare('SELECT hash FROM api_keys WHERE id = ?').get(record.id);
  assert.notEqual(row.hash, key);
  assert.equal(row.hash.length, 64);
  a.close();
});

test('非法或吊销的 key 换不到用户', () => {
  const a = fresh();
  const u = a.createUser('r@example.com');
  const { key, record } = a.issueKey(u.id);
  assert.equal(a.resolveKey('jev_nope'), null);
  assert.equal(a.resolveKey(''), null);
  assert.equal(a.resolveKey(undefined), null);
  assert.equal(a.revokeKey(record.id), true);
  assert.equal(a.resolveKey(key), null);
  assert.equal(a.revokeKey(record.id), false, '重复吊销应返回 false');
  a.close();
});

test('扣费：1000 个输入 token 扣 42 微美元', () => {
  const a = fresh();
  const u = a.createUser('c@example.com');
  const r = a.chargeInputTokens(u.id, 1000);
  assert.equal(r.ok, true);
  assert.equal(r.cost, 42);
  assert.equal(r.balance.microUsd, SIGNUP_CREDIT_MICROUSD - 42);
  assert.equal(r.balance.cents, 500, '不足 1 美分，整数分不变');
  assert.equal(r.balance.usd, '4.999958');
  a.close();
});

test('余额耗尽后拒绝，且不再扣钱', () => {
  const a = fresh();
  const u = a.createUser('e@example.com');
  const all = a.balance(u.id).inputTokensLeft;
  assert.equal(a.chargeInputTokens(u.id, all).ok, true);
  assert.equal(a.balance(u.id).microUsd, 0);
  assert.equal(a.balance(u.id).cents, 0);
  const denied = a.chargeInputTokens(u.id, 1);
  assert.equal(denied.ok, false);
  assert.equal(denied.reason, 'insufficient_credit');
  assert.equal(a.balance(u.id).microUsd, 0, '拒绝时不得写账');
  a.close();
});

test('超出余额的扣费整笔拒绝', () => {
  const a = fresh();
  const u = a.createUser('b@example.com');
  const r = a.chargeInputTokens(u.id, SIGNUP_INPUT_TOKENS + 1);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'insufficient_credit');
  assert.equal(a.balance(u.id).microUsd, SIGNUP_CREDIT_MICROUSD, '不得部分扣减');
  a.close();
});

test('退款：删掉最近一笔判定，余额回到赠送额', () => {
  const a = fresh();
  const u = a.createUser('ref@example.com');
  assert.equal(a.chargeInputTokens(u.id, 1000).ok, true);
  assert.equal(a.balance(u.id).microUsd, SIGNUP_CREDIT_MICROUSD - 42);
  assert.equal(a.refund(u.id), true);
  assert.equal(a.balance(u.id).microUsd, SIGNUP_CREDIT_MICROUSD, '退款后应回到赠送额');
  assert.equal(a.refund(u.id), false, '无对应扣减时不应退款');
  a.close();
});

test('退款后额度可继续使用', () => {
  const a = fresh();
  const u = a.createUser('ref2@example.com');
  a.chargeInputTokens(u.id, a.balance(u.id).inputTokensLeft);
  assert.equal(a.balance(u.id).microUsd, 0);
  assert.equal(a.chargeInputTokens(u.id, 1).ok, false, '已用尽');
  assert.equal(a.refund(u.id), true);
  assert.equal(a.chargeInputTokens(u.id, 1000).ok, true, '退回后应可用');
  a.close();
});

test('手工入账按美分换算成微美元', () => {
  const a = fresh();
  const u = a.createUser('top@example.com');
  a.chargeInputTokens(u.id, 1000);
  const after = a.credit(u.id, 1000, 'topup', 'test-ref');
  assert.equal(after.microUsd, SIGNUP_CREDIT_MICROUSD - 42 + 10_000_000);
  assert.equal(after.usd, '14.999958');
  assert.equal(after.cents, 1500, '不足 1 美分的零头四舍五入，不把 $14.999958 显示成 $14.99');
  a.close();
});

test('入账金额必须是正整数', () => {
  const a = fresh();
  const u = a.createUser('v@example.com');
  for (const bad of [0, -5, 1.5, NaN]) {
    assert.throws(() => a.credit(u.id, bad), /positive integer/, `金额 ${bad}`);
  }
  a.close();
});

test('流水可查，且能算出累计消费', () => {
  const a = fresh();
  const u = a.createUser('led@example.com');
  a.chargeInputTokens(u.id, 3000);
  a.credit(u.id, 200, 'topup');
  const entries = a.entries(u.id);
  assert.ok(entries.length >= 3, `流水至少 3 条，实际 ${entries.length}`);
  assert.ok(entries[0].ts >= entries[entries.length - 1].ts, '最新应在前');
  assert.equal(inputCostMicroUsd(3000), 126);
  assert.equal(a.spentMicroUsd(u.id), 126);
  assert.equal(a.spentCents(u.id), 0, '不足 1 美分');
  a.close();
});

test('不存在的用户：balance 为 null，扣费明确报错', () => {
  const a = fresh();
  assert.equal(a.balance('nope'), null);
  assert.deepEqual(a.chargeInputTokens('nope', 1000), { ok: false, reason: 'no-such-user' });
  a.close();
});

test('余额与 key 按用户隔离', () => {
  const a = fresh();
  const u1 = a.createUser('a@example.com');
  const u2 = a.createUser('b@example.com');
  const k1 = a.issueKey(u1.id).key;
  a.chargeInputTokens(u1.id, 7000);
  assert.equal(a.balance(u1.id).microUsd, SIGNUP_CREDIT_MICROUSD - inputCostMicroUsd(7000));
  assert.equal(a.balance(u2.id).microUsd, SIGNUP_CREDIT_MICROUSD, 'u2 不该看到 u1 的消费');
  assert.equal(a.resolveKey(k1).user.id, u1.id);
  assert.equal(a.listKeys(u2.id).length, 0);
  a.close();
});

test('持久化：重建连接后用户、key、余额都在，且不会再次迁移', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-acct-'));
  const file = path.join(dir, 'acct.db');

  const a1 = openAccounts(file);
  const u = a1.createUser('p@example.com');
  const { key } = a1.issueKey(u.id);
  a1.chargeInputTokens(u.id, 4000);
  a1.close();

  const a2 = openAccounts(file);
  assert.equal(a2.getUserByEmail('p@example.com').id, u.id);
  assert.equal(a2.resolveKey(key).user.id, u.id);
  assert.equal(a2.balance(u.id).microUsd, SIGNUP_CREDIT_MICROUSD - inputCostMicroUsd(4000));
  assert.equal(a2.balance(u.id).cents, 500, '再次打开不能把微美元再乘 10000');
  a2.close();
  rmSync(dir, { recursive: true, force: true });
});

test('旧美分账本只迁移一次', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const { DatabaseSync } = await import('node:sqlite');
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-old-'));
  const file = path.join(dir, 'acct.db');
  const userId = 'old-user';

  const raw = new DatabaseSync(file);
  raw.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ts INTEGER NOT NULL,
      cents INTEGER NOT NULL,
      kind TEXT NOT NULL,
      ref TEXT
    );
  `);
  raw.prepare('INSERT INTO users (id, email, plan, created_at) VALUES (?, ?, ?, ?)').run(
    userId, 'old@example.com', 'free', 1
  );
  raw.prepare('INSERT INTO ledger (user_id, ts, cents, kind, ref) VALUES (?, ?, ?, ?, ?)').run(
    userId, 1, 500, 'signup_credit', null
  );
  raw.prepare('INSERT INTO ledger (user_id, ts, cents, kind, ref) VALUES (?, ?, ?, ?, ?)').run(
    userId, 2, -3, 'judge', null
  );
  raw.close();

  const a = openAccounts(file);
  assert.equal(a.balance(userId).microUsd, 497 * 10_000);
  assert.equal(a.balance(userId).cents, 497);
  assert.equal(a.balance(userId).usd, '4.97');
  a.close();

  const again = openAccounts(file);
  assert.equal(again.balance(userId).microUsd, 4_970_000, '第二次打开不能再乘');
  again.close();
  rmSync(dir, { recursive: true, force: true });
});

test('原子预扣与精确行退款：记录 key_id、刷新 last_used_at、不误删并发扣费', () => {
  const a = fresh();
  const u = a.createUser('res@example.com');
  const { key, record } = a.issueKey(u.id, 'svc');
  const t1 = 1_800_000_000_000;
  const resolved = a.resolveKey(key, t1);
  assert.equal(resolved.keyId, record.id);
  const listed = a.listKeys(u.id);
  assert.equal(listed[0].last_used_at, t1, 'resolveKey 应刷新 last_used_at');

  const r1 = a.reserveInputTokens(u.id, 1000, { keyId: record.id, at: t1 + 1 });
  const r2 = a.reserveInputTokens(u.id, 2000, { keyId: record.id, at: t1 + 2 });
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  assert.notEqual(r1.entryId, r2.entryId);

  // 撤销较早的 r1，较晚的 r2 必须完好保留
  assert.equal(a.refundEntry(r1.entryId), true);
  assert.equal(a.refundEntry(r1.entryId), false, '重复退款应返回 false');
  assert.equal(a.balance(u.id).microUsd, SIGNUP_CREDIT_MICROUSD - inputCostMicroUsd(2000));
  const entries = a.entries(u.id);
  const judgeRow = entries.find((e) => e.kind === 'judge');
  assert.equal(judgeRow.key_id, record.id, 'ledger 应记录消费对应的 key_id');
  a.close();
});

test('旧表结构缺 key_id / last_used_at 时自动幂等迁移', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const { DatabaseSync } = await import('node:sqlite');
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-mig-'));
  const file = path.join(dir, 'acct.db');

  const raw = new DatabaseSync(file);
  raw.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL);
    CREATE TABLE api_keys (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, hash TEXT NOT NULL UNIQUE, prefix TEXT NOT NULL, label TEXT, created_at INTEGER NOT NULL, revoked_at INTEGER);
    CREATE TABLE ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, ts INTEGER NOT NULL, cents INTEGER NOT NULL, kind TEXT NOT NULL, ref TEXT);
    CREATE TABLE schema_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
    INSERT INTO schema_meta (k, v) VALUES ('ledger_unit', 'microusd');
  `);
  raw.close();

  const a = openAccounts(file);
  const u = a.createUser('mig@example.com');
  const { key, record } = a.issueKey(u.id, 'old');
  assert.equal(a.resolveKey(key, 123456).keyId, record.id);
  assert.equal(a.listKeys(u.id)[0].last_used_at, 123456);
  const r = a.reserveInputTokens(u.id, 1000, { keyId: record.id });
  assert.equal(r.ok, true);
  assert.equal(a.entries(u.id)[0].key_id, record.id);
  a.close();
  rmSync(dir, { recursive: true, force: true });
});

test('代金券：签发只存哈希，兑换入账，重放/过期/吊销/坏码都不双倍入账', () => {
  const a = fresh();
  const u = a.createUser('voucher@example.com');
  const before = a.balanceMicro(u.id);

  assert.throws(() => a.issueVoucher(0), /positive integer/);
  assert.throws(() => a.issueVoucher(1.5), /positive integer/);
  assert.throws(() => a.issueVoucher(100, { expiresAt: Date.now() - 1000 }), /expiresAt/);

  const { code, record } = a.issueVoucher(250, { label: 'x'.repeat(120), at: 1_700_000_000_000 });
  assert.match(code, /^jev_v_[A-Za-z0-9_-]+$/);
  assert.equal(record.prefix, code.slice(0, 12));
  assert.equal(record.cents, 250);
  assert.equal(record.usd, '2.50');
  assert.equal(record.label.length, 80);
  const stored = a._db.prepare('SELECT * FROM vouchers WHERE id = ?').get(record.id);
  assert.equal(stored.hash, createHash('sha256').update(code).digest('hex'));
  assert.equal(JSON.stringify(stored).includes(code), false, '库里不能留下完整明文');

  const listed = a.listVouchers();
  assert.equal(listed[0].id, record.id);
  assert.equal('hash' in listed[0], false);
  assert.equal(listed[0].prefix, record.prefix);

  const ok = a.redeemVoucher(u.id, `  ${code}  `);
  assert.equal(ok.ok, true);
  assert.equal(ok.creditedCents, 250);
  assert.equal(ok.creditedUsd, centsToUsd(250));
  assert.equal(ok.prefix, record.prefix);
  assert.equal(a.balanceMicro(u.id), before + 250 * MICROUSD_PER_CENT);
  assert.equal(ok.balance.microUsd, before + 250 * MICROUSD_PER_CENT);
  const topups = a.entries(u.id).filter((e) => e.kind === 'topup' && String(e.ref).startsWith('voucher:'));
  assert.equal(topups.length, 1);
  assert.equal(topups[0].ref, `voucher:${record.prefix}`);

  const replay = a.redeemVoucher(u.id, code);
  assert.deepEqual(replay, { ok: false, reason: 'already_redeemed' });
  assert.equal(a.balanceMicro(u.id), before + 250 * MICROUSD_PER_CENT, '重放不能再次入账');
  assert.equal(a.revokeVoucher(record.id), false, '已兑换的券不能吊销');

  const expired = a.issueVoucher(100, { expiresAt: 5_000, at: 1_000 });
  const exp = a.redeemVoucher(u.id, expired.code, 5_000);
  assert.equal(exp.ok, false);
  assert.equal(exp.reason, 'expired');

  const revoked = a.issueVoucher(80);
  assert.equal(a.revokeVoucher(revoked.record.id), true);
  assert.equal(a.revokeVoucher(revoked.record.id), false);
  assert.equal(a.redeemVoucher(u.id, revoked.code).reason, 'revoked');

  assert.equal(a.redeemVoucher(u.id, 'jev_v_not-a-real-code').reason, 'not_found');
  assert.equal(a.redeemVoucher(u.id, '   ').reason, 'invalid_code');
  assert.equal(a.redeemVoucher('missing-user', code).reason, 'no_such_user');
  assert.equal(a.balanceMicro(u.id), before + 250 * MICROUSD_PER_CENT);

  const users = a.listUsers();
  assert.equal(users[0].email, 'voucher@example.com');
  assert.equal(users[0].balanceMicroUsd, before + 250 * MICROUSD_PER_CENT);
  assert.equal(users[0].activeKeys, 0);
  assert.equal('hash' in users[0], false);
  a.close();
});

test('用户列表按创建时间倒序，并带余额、消费与有效 key 数', () => {
  const a = fresh();
  const older = a.createUser('older@example.com', 'free', 1_000);
  const newer = a.createUser('newer@example.com', 'free', 2_000);
  a.issueKey(newer.id, 'live');
  const revoked = a.issueKey(newer.id, 'dead');
  a.revokeKey(revoked.record.id);
  a.reserveInputTokens(older.id, 1000, { at: 3_000 });
  const rows = a.listUsers();
  assert.deepEqual(rows.map((u) => u.email), ['newer@example.com', 'older@example.com']);
  assert.equal(rows[0].activeKeys, 1);
  assert.equal(rows[0].plan, 'free');
  assert.equal(rows[0].balanceMicroUsd, SIGNUP_CREDIT_MICROUSD);
  assert.equal(rows[0].spentMicroUsd, 0);
  assert.equal(rows[1].spentMicroUsd, inputCostMicroUsd(1000));
  assert.equal(rows[1].balanceMicroUsd, SIGNUP_CREDIT_MICROUSD - inputCostMicroUsd(1000));
  a.close();
});

test('漏斗计数：白名单、语言清洗、按 UTC 日聚合，窗口含今天', () => {
  const a = fresh();
  assert.equal(a.recordEvent('drop_table'), false);
  assert.equal(a.recordEvent(''), false);
  const now = Date.parse('2026-11-25T15:00:00.000Z');
  for (const event of FUNNEL_EVENTS) {
    assert.equal(a.recordEvent(event, 'en', now), true);
  }
  assert.equal(a.recordEvent('try_run', 'en', now), true);
  assert.equal(a.recordEvent('try_run', 'ZH', now), true, '非小写两位语言记为 unknown');
  assert.equal(a.recordEvent('try_run', 'eng', now), true);
  assert.equal(a.recordEvent('login_ok', 'ja', Date.parse('2026-11-10T00:00:00.000Z')), true);

  const summary = a.funnelSummary(7, now);
  assert.equal(summary.days, 7);
  assert.equal(summary.since, '2026-11-19');
  assert.equal(summary.totals.try_run, 4, '2 次 en + ZH + eng，都落在 11-25');
  assert.equal(summary.totals.login_ok, 1, '窗口内只有 11-25 那次，11-10 在窗外');
  assert.equal(summary.totals.register_ok, 1);
  assert.equal(summary.byDay.at(-1).day, '2026-11-25');
  assert.equal(summary.byDay.at(-1).events.try_run, 4);
  assert.equal(summary.byDay.some((d) => d.day === '2026-11-10'), false);

  const wide = a.funnelSummary(30, now);
  assert.equal(wide.since, '2026-10-27');
  assert.equal(wide.totals.login_ok, 2);

  a._db.exec('PRAGMA query_only = ON');
  assert.equal(a.recordEvent('try_run', 'en', now), false, '只读库失败时静默返回 false');
  a.close();
});
