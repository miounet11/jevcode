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
import {
  openAccounts, SIGNUP_CREDIT_CENTS, SIGNUP_CREDIT_MICROUSD, centsToUsd,
  inputCostMicroUsd, SIGNUP_INPUT_TOKENS,
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
