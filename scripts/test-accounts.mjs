#!/usr/bin/env node
/**
 * 账号与额度账本的验收测试（零依赖，node:test）。
 *
 * 用法：node --test scripts/test-accounts.mjs   或   node scripts/test-accounts.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openAccounts, PLANS, WINDOWS } from '../server/accounts.mjs';

const fresh = () => openAccounts(':memory:');

test('建用户，重复 email 幂等', () => {
  const a = fresh();
  const u1 = a.createUser('x@example.com');
  const u2 = a.createUser('x@example.com');
  assert.equal(u1.id, u2.id);
  assert.equal(a.getUserByEmail('x@example.com').id, u1.id);
  a.close();
});

test('签发 key 后可用明文换回用户，库里不留明文', () => {
  const a = fresh();
  const u = a.createUser('k@example.com');
  const { key, record } = a.issueKey(u.id, 'cli');
  assert.match(key, /^jev_/);
  assert.equal(a.resolveKey(key).user.id, u.id);
  assert.equal(record.prefix, key.slice(0, 12));
  // 库里存的不是明文
  const row = a._db.prepare('SELECT hash FROM api_keys WHERE id = ?').get(record.id);
  assert.notEqual(row.hash, key);
  assert.equal(row.hash.length, 64); // sha256 hex
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

test('免费档默认 25：用满第 25 次后拒绝，且不会部分扣减', () => {
  const a = fresh();
  const u = a.createUser('q@example.com');
  const limit = PLANS.free.day;
  assert.equal(limit, 25);

  for (let i = 1; i <= limit; i++) {
    const r = a.consume(u.id);
    assert.equal(r.ok, true, `第 ${i} 次应通过`);
  }
  const denied = a.consume(u.id);
  assert.equal(denied.ok, false);
  assert.equal(denied.reason, 'quota-exhausted:day');
  assert.equal(a.usage(u.id).day, limit, '拒绝时不得写入用量');

  // 批量请求超限也必须整体拒绝，不能扣一部分
  const batch = a.consume(u.id, 5);
  assert.equal(batch.ok, false);
  assert.equal(a.usage(u.id).day, limit);
  a.close();
});

test('窗口滑动：旧用量出窗后额度恢复', () => {
  const a = fresh();
  const u = a.createUser('w@example.com');
  const t0 = 1_800_000_000_000;
  for (let i = 0; i < PLANS.free.day; i++) assert.equal(a.consume(u.id, 1, t0).ok, true);
  assert.equal(a.consume(u.id, 1, t0).ok, false, '同一时刻应已用满');

  // 跨过一天后，旧事件出窗
  const t1 = t0 + WINDOWS.day + 1;
  assert.equal(a.usage(u.id, t1).day, 0);
  assert.equal(a.consume(u.id, 1, t1).ok, true, '出窗后应恢复');
  a.close();
});

test('remaining 反映各窗口，且不出现不限的窗口', () => {
  const a = fresh();
  const u = a.createUser('rem@example.com');
  a.consume(u.id, 3);
  const rem = a.remaining(u.id);
  assert.equal(rem.day, 22);
  assert.equal('week' in rem, false, 'null 限额的窗口不应出现');
  a.close();
});

test('不存在的用户：remaining 为 null，consume 明确报错', () => {
  const a = fresh();
  assert.equal(a.remaining('nope'), null);
  assert.deepEqual(a.consume('nope'), { ok: false, reason: 'no-such-user' });
  a.close();
});

test('退款：失败的判定不白扣额度', () => {
  const a = fresh();
  const u = a.createUser('ref@example.com');
  const before = a.usage(u.id).day;

  // 扣一次、模拟上游失败、退回
  assert.equal(a.consume(u.id, 1).ok, true);
  assert.equal(a.usage(u.id).day, before + 1);
  assert.equal(a.refund(u.id, 1), true);
  assert.equal(a.usage(u.id).day, before, '退款后应回到原始用量');

  // 退到不足时保留原行并递减，且不会退成负数
  assert.equal(a.consume(u.id, 3).ok, true);
  assert.equal(a.refund(u.id, 3), true);
  assert.equal(a.usage(u.id).day, before);
  assert.equal(a.refund(u.id, 1), false, '无对应扣减时不应退款');
  a.close();
});

test('退款后额度可继续使用（用满→退一次→又能用）', () => {
  const a = fresh();
  const u = a.createUser('ref2@example.com');
  for (let i = 0; i < PLANS.free.day; i++) a.consume(u.id, 1);
  assert.equal(a.consume(u.id, 1).ok, false, '已用满');
  a.refund(u.id, 1);
  assert.equal(a.consume(u.id, 1).ok, true, '退回一次后应可用');
  a.close();
});

test('用量与 key 按用户隔离', () => {
  const a = fresh();
  const u1 = a.createUser('a@example.com');
  const u2 = a.createUser('b@example.com');
  const k1 = a.issueKey(u1.id).key;
  a.consume(u1.id, 7);
  assert.equal(a.usage(u1.id).day, 7);
  assert.equal(a.usage(u2.id).day, 0, 'u2 不应看到 u1 的用量');
  assert.equal(a.resolveKey(k1).user.id, u1.id);
  assert.equal(a.listKeys(u2.id).length, 0);
  a.close();
});

test('持久化：重建连接后用户、key、用量都在', async () => {
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
  assert.equal(a2.usage(u.id).day, 4);
  a2.close();
  rmSync(dir, { recursive: true, force: true });
});
