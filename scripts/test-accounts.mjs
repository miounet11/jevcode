#!/usr/bin/env node
/**
 * 账号与额度账本的验收测试（零依赖，node:test）。
 *
 * 口径：注册送 $5（500 美分），每次判定扣 1 美分，用完为止。
 *
 * 用法：node --test scripts/test-accounts.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  openAccounts, SIGNUP_CREDIT_CENTS, JUDGE_PRICE_CENTS, centsToUsd,
} from '../server/accounts.mjs';

const fresh = () => openAccounts(':memory:');

test('注册赠送 $5', () => {
  const a = fresh();
  const u = a.createUser('x@example.com');
  const b = a.balance(u.id);
  assert.equal(b.cents, SIGNUP_CREDIT_CENTS);
  assert.equal(b.cents, 500);
  assert.equal(b.usd, '5.00');
  assert.equal(b.judgmentsLeft, 500);
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
  assert.equal(a.balance(u1.id).cents, SIGNUP_CREDIT_CENTS, '不能赠送两次');
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

test('扣费：每判定扣 1 美分，余额随之下降', () => {
  const a = fresh();
  const u = a.createUser('c@example.com');
  const r = a.consume(u.id);
  assert.equal(r.ok, true);
  assert.equal(r.balance.cents, SIGNUP_CREDIT_CENTS - JUDGE_PRICE_CENTS);
  assert.equal(r.balance.judgmentsLeft, 499);
  a.close();
});

test('余额耗尽后拒绝，且不再扣钱', () => {
  const a = fresh();
  const u = a.createUser('e@example.com');
  for (let i = 0; i < 500; i++) {
    assert.equal(a.consume(u.id).ok, true, `第 ${i + 1} 次应通过`);
  }
  assert.equal(a.balance(u.id).cents, 0);
  const denied = a.consume(u.id);
  assert.equal(denied.ok, false);
  assert.equal(denied.reason, 'insufficient_credit');
  assert.equal(a.balance(u.id).cents, 0, '拒绝时不得写账');
  a.close();
});

test('批量扣费超余额时整体拒绝，不部分扣', () => {
  const a = fresh();
  const u = a.createUser('b@example.com');
  a.consume(u.id, 499);
  assert.equal(a.balance(u.id).cents, 1);
  const r = a.consume(u.id, 5);
  assert.equal(r.ok, false);
  assert.equal(a.balance(u.id).cents, 1, '不得部分扣减');
  a.close();
});

test('退款：失败的判定不白扣', () => {
  const a = fresh();
  const u = a.createUser('ref@example.com');
  assert.equal(a.consume(u.id, 1).ok, true);
  assert.equal(a.balance(u.id).cents, 499);
  assert.equal(a.refund(u.id, 1), true);
  assert.equal(a.balance(u.id).cents, 500, '退款后应回到 500');
  assert.equal(a.refund(u.id, 1), false, '无对应扣减时不应退款');
  a.close();
});

test('退款后额度可继续使用（用满→退一次→又能用）', () => {
  const a = fresh();
  const u = a.createUser('ref2@example.com');
  a.consume(u.id, 500);
  assert.equal(a.balance(u.id).cents, 0);
  assert.equal(a.consume(u.id, 1).ok, false, '已用尽');
  a.refund(u.id, 1);
  assert.equal(a.consume(u.id, 1).ok, true, '退回一次后应可用');
  a.close();
});

test('手工入账（充值）可增加余额', () => {
  const a = fresh();
  const u = a.createUser('top@example.com');
  a.consume(u.id, 100);
  assert.equal(a.balance(u.id).cents, 400);
  const after = a.credit(u.id, 1000, 'topup', 'test-ref');
  assert.equal(after.cents, 1400);
  assert.equal(after.usd, '14.00');
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
  a.consume(u.id, 3);
  a.credit(u.id, 200, 'topup');
  const entries = a.entries(u.id);
  assert.ok(entries.length >= 3, `流水至少 3 条，实际 ${entries.length}`);
  assert.ok(entries[0].ts >= entries[entries.length - 1].ts, '最新应在前');
  assert.equal(a.spentCents(u.id), 3 * JUDGE_PRICE_CENTS);
  a.close();
});

test('不存在的用户：balance 为 null，consume 明确报错', () => {
  const a = fresh();
  assert.equal(a.balance('nope'), null);
  assert.deepEqual(a.consume('nope'), { ok: false, reason: 'no-such-user' });
  a.close();
});

test('余额与 key 按用户隔离', () => {
  const a = fresh();
  const u1 = a.createUser('a@example.com');
  const u2 = a.createUser('b@example.com');
  const k1 = a.issueKey(u1.id).key;
  a.consume(u1.id, 7);
  assert.equal(a.balance(u1.id).cents, 493);
  assert.equal(a.balance(u2.id).cents, 500, 'u2 不该看到 u1 的消费');
  assert.equal(a.resolveKey(k1).user.id, u1.id);
  assert.equal(a.listKeys(u2.id).length, 0);
  a.close();
});

test('持久化：重建连接后用户、key、余额都在', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-acct-'));
  const file = path.join(dir, 'acct.db');

  const a1 = openAccounts(file);
  const u = a1.createUser('p@example.com');
  const { key } = a1.issueKey(u.id);
  a1.consume(u.id, 4);
  a1.close();

  const a2 = openAccounts(file);
  assert.equal(a2.getUserByEmail('p@example.com').id, u.id);
  assert.equal(a2.resolveKey(key).user.id, u.id);
  assert.equal(a2.balance(u.id).cents, 496);
  a2.close();
  rmSync(dir, { recursive: true, force: true });
});
