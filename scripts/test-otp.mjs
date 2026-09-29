#!/usr/bin/env node
/**
 * 邮箱验证码（OTP）验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-otp.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openAccounts } from '../server/accounts.mjs';
import { withSessions } from '../server/auth.mjs';
import { withOtp } from '../server/otp.mjs';

/** 建一套完整的依赖，并捕获「发出去的信」以便断言 */
function fresh() {
  const a = openAccounts(':memory:');
  const auth = withSessions(a);
  const outbox = [];
  const otp = withOtp(a, {
    deliver: async (email, code, meta) => { outbox.push({ email, code, meta }); },
  });
  return { a, auth, otp, outbox };
}

const lastCode = (outbox) => outbox[outbox.length - 1].code;

test('签发后发信，码为 6 位数字', async () => {
  const { otp, outbox } = fresh();
  const r = await otp.request('u@example.com');
  assert.equal(r.ok, true);
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].email, 'u@example.com');
  assert.match(lastCode(outbox), /^\d{6}$/);
  assert.ok(r.expiresAt > Date.now());
});

test('码明文不落库（只存 sha256 + salt）', async () => {
  const { a, otp, outbox } = fresh();
  await otp.request('h@example.com');
  const code = lastCode(outbox);
  const rows = a._db.prepare('SELECT hash, salt FROM otp_codes').all();
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].hash, code);
  assert.equal(rows[0].hash.length, 64);
  assert.ok(rows[0].salt.length > 0, 'salt 不能为空');
});

test('正确码可验证，且只能消费一次（防重放）', async () => {
  const { otp, outbox } = fresh();
  await otp.request('v@example.com');
  const code = lastCode(outbox);

  assert.equal(otp.verify('v@example.com', code).ok, true);
  assert.equal(otp.verify('v@example.com', code).ok, false, '同一码不能用第二次');
});

test('错的码验不过，且失败原因与「无有效码」一致（防枚举）', async () => {
  const { otp, outbox } = fresh();
  await otp.request('e@example.com');
  const right = lastCode(outbox);
  const wrong = right === '000000' ? '111111' : '000000';

  const badCode = otp.verify('e@example.com', wrong);
  const noCode = otp.verify('nobody@example.com', wrong);
  assert.equal(badCode.ok, false);
  assert.equal(noCode.ok, false);
  assert.equal(badCode.reason, noCode.reason);
});

test('连错 5 次后作废，即使随后给对的码也无效', async () => {
  const { otp, outbox } = fresh();
  await otp.request('a@example.com');
  const right = lastCode(outbox);
  const wrong = right === '000000' ? '111111' : '000000';

  for (let i = 0; i < 5; i++) {
    assert.equal(otp.verify('a@example.com', wrong).ok, false);
  }
  assert.equal(otp.attemptsLeft('a@example.com'), 0);
  assert.equal(otp.verify('a@example.com', right).ok, false, '超限后对的码也应无效');
});

test('过期后失效（注入时间，不睡眠）', async () => {
  const { otp, outbox, auth } = fresh();
  const t0 = 1_800_000_000_000;
  await otp.request('exp@example.com', t0);
  const code = lastCode(outbox);
  const { CODE_TTL_MS } = otp._limits;

  assert.equal(otp.verify('exp@example.com', code, t0 + 1000).ok, true);
  // 重新发一次再测过期（上面已消费）
  await otp.request('exp@example.com', t0 + CODE_TTL_MS + 1);
  const code2 = lastCode(outbox);
  assert.equal(otp.verify('exp@example.com', code2, t0 + CODE_TTL_MS * 2 + 1).ok, false);
});

test('重新发码会作废旧码', async () => {
  const { otp, outbox } = fresh();
  const { MIN_RESEND_MS } = otp._limits;
  const t0 = 1_800_000_000_000;

  await otp.request('r@example.com', t0);
  const first = lastCode(outbox);
  await otp.request('r@example.com', t0 + MIN_RESEND_MS + 1);
  const second = lastCode(outbox);

  assert.notEqual(first, second);
  assert.equal(otp.verify('r@example.com', first, t0 + MIN_RESEND_MS + 2).ok, false, '旧码应作废');
  assert.equal(otp.verify('r@example.com', second, t0 + MIN_RESEND_MS + 2).ok, true, '新码应有效');
});

test('发码限流：间隔太短被拒并给出重试时间', async () => {
  const { otp } = fresh();
  const t0 = 1_800_000_000_000;
  assert.equal((await otp.request('l@example.com', t0)).ok, true);
  const again = await otp.request('l@example.com', t0 + 1000);
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'too soon');
  assert.ok(again.retryAfterMs > 0);
});

test('发码限流：每小时上限', async () => {
  const { otp } = fresh();
  const { MIN_RESEND_MS, MAX_PER_HOUR } = otp._limits;
  let t = 1_800_000_000_000;
  let sent = 0;
  for (let i = 0; i < MAX_PER_HOUR; i++) {
    const r = await otp.request('cap@example.com', t);
    if (r.ok) sent++;
    t += MIN_RESEND_MS + 1;
  }
  assert.equal(sent, MAX_PER_HOUR, `一小时内最多发 ${MAX_PER_HOUR} 次`);
  const over = await otp.request('cap@example.com', t);
  assert.equal(over.ok, false);
  assert.equal(over.reason, 'too many requests');
});

test('投递失败时不落库，且用户可以立刻重试', async () => {
  const a = openAccounts(':memory:');
  const auth = withSessions(a);
  let fail = true;
  const otp = withOtp(a, {
    deliver: async () => { if (fail) throw new Error('smtp down'); },
  });

  const r = await otp.request('d@example.com');
  assert.equal(r.ok, false);
  assert.match(r.reason, /delivery failed/);
  assert.equal(a._db.prepare('SELECT COUNT(*) c FROM otp_codes').get().c, 0, '失败不应落库');

  fail = false;
  assert.equal((await otp.request('d@example.com')).ok, true, '失败后应能立刻重试');
});

test('非法邮箱被拒', async () => {
  const { otp } = fresh();
  for (const bad of ['', 'not-an-email', 'a@b', null, undefined]) {
    const r = await otp.request(bad);
    assert.equal(r.ok, false, `输入 ${String(bad)} 应被拒`);
  }
});

test('未配置投递通道时明确报错，而不是静默成功', async () => {
  const a = openAccounts(':memory:');
  const otp = withOtp(a, {});
  const r = await otp.request('n@example.com');
  assert.equal(r.ok, false);
  assert.match(r.reason, /no delivery channel/);
});

test('验码登录：首次自动建账号，再次登录复用同一账号', async () => {
  const { a, auth, otp, outbox } = fresh();
  const t0 = 1_800_000_000_000;

  await otp.request('new@example.com', t0);
  const first = otp.loginWithCode('new@example.com', lastCode(outbox), auth, t0 + 1);
  assert.equal(first.ok, true);
  assert.equal(first.created, true);
  assert.equal(first.user.email, 'new@example.com');
  assert.equal(first.user.plan, 'free');
  assert.ok(auth.resolveSession(first.token, t0 + 2), '应拿到可用会话');
  assert.equal(a.remaining(first.user.id).day, 25, '新账号应有 25 额度');

  const { MIN_RESEND_MS } = otp._limits;
  const t1 = t0 + MIN_RESEND_MS + 1;
  await otp.request('new@example.com', t1);
  const second = otp.loginWithCode('new@example.com', lastCode(outbox), auth, t1 + 1);
  assert.equal(second.ok, true);
  assert.equal(second.created, false, '第二次不应再建账号');
  assert.equal(second.user.id, first.user.id, '应是同一个用户');
});

test('验码登录：码不对则无会话，也不建账号', async () => {
  const { a, auth, otp } = fresh();
  const r = otp.loginWithCode('ghost@example.com', '123456', auth);
  assert.equal(r.ok, false);
  assert.equal(a.getUserByEmail('ghost@example.com'), null, '不该建账号');
  assert.equal(a._db.prepare('SELECT COUNT(*) c FROM sessions').get().c, 0);
});

test('邮箱大小写与空格归一化：同一账号', async () => {
  const { auth, otp, outbox } = fresh();
  const t0 = 1_800_000_000_000;
  await otp.request('  Mixed@Example.COM  ', t0);
  assert.equal(outbox[0].email, 'mixed@example.com', '投递地址应已归一化');
  const r = otp.loginWithCode('MIXED@example.com  ', lastCode(outbox), auth, t0 + 1);
  assert.equal(r.ok, true);
  assert.equal(r.user.email, 'mixed@example.com');
});
