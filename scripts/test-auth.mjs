#!/usr/bin/env node
/**
 * 注册登录层验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-auth.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openAccounts } from '../server/accounts.mjs';
import {
  withSessions, hashPassword, verifyPassword, passwordProblem, emailProblem,
} from '../server/auth.mjs';

const fresh = () => {
  const a = openAccounts(':memory:');
  return { a, auth: withSessions(a) };
};

test('口令 hash 可验证，且同口令两次 hash 不同（盐随机）', () => {
  const h1 = hashPassword('correct horse battery');
  const h2 = hashPassword('correct horse battery');
  assert.notEqual(h1, h2, '两次 hash 应不同');
  assert.equal(verifyPassword('correct horse battery', h1), true);
  assert.equal(verifyPassword('correct horse battery', h2), true);
  assert.equal(verifyPassword('wrong password!!', h1), false);
});

test('verifyPassword 对畸形输入不抛异常、一律返回 false', () => {
  for (const bad of [null, undefined, '', 'garbage', 'scrypt$1$2$3', 'bcrypt$a$b$c$d$e']) {
    assert.equal(verifyPassword('x', bad), false, `输入 ${String(bad)}`);
  }
});

test('伪造的空/短哈希不得通过任意口令（防认证绕过）', () => {
  // 空哈希会让 expected 与 scrypt 结果都是零长 buffer，timingSafeEqual 判等
  // → 任意口令通过。这条曾真实存在，靠长度校验挡住。
  const forged = [
    'scrypt$32768$8$1$$',              // 空盐空哈希
    'scrypt$32768$8$1$c2FsdA$',        // 空哈希
    'scrypt$32768$8$1$$aGFzaA',        // 空盐
    'scrypt$32768$8$1$c2FsdA$aGFzaA',  // 哈希长度不足
  ];
  for (const f of forged) {
    assert.equal(verifyPassword('any-password-at-all', f), false, `伪造记录应被拒: ${f}`);
    assert.equal(verifyPassword('', f), false, `空口令也不得通过: ${f}`);
  }
  // 正规 hash 不受影响
  const good = hashPassword('correct horse');
  assert.equal(verifyPassword('correct horse', good), true);
  assert.equal(verifyPassword('wrong horse', good), false);
});

test('注册 → 登录 → 会话可用', () => {
  const { auth } = fresh();
  const reg = auth.register('User@Example.com', 'a-good-password');
  assert.equal(reg.ok, true);
  assert.equal(reg.user.email, 'user@example.com', '邮箱应归一化为小写');

  const login = auth.login('user@example.com', 'a-good-password');
  assert.equal(login.ok, true);
  assert.ok(login.token.length > 20);

  const sess = auth.resolveSession(login.token);
  assert.equal(sess.user.id, reg.user.id);
  assert.equal(sess.expiresAt > Date.now(), true);
});

test('登录失败原因不区分「账号不存在」与「密码错误」（防邮箱枚举）', () => {
  const { auth } = fresh();
  auth.register('real@example.com', 'a-good-password');
  const noSuch = auth.login('ghost@example.com', 'a-good-password');
  const wrongPw = auth.login('real@example.com', 'a-wrong-password');
  assert.equal(noSuch.ok, false);
  assert.equal(wrongPw.ok, false);
  assert.equal(noSuch.reason, wrongPw.reason, '两种失败必须给出同一原因');
});

test('重复注册被拒，且不会创建第二个用户', () => {
  const { a, auth } = fresh();
  assert.equal(auth.register('dup@example.com', 'a-good-password').ok, true);
  const again = auth.register('dup@example.com', 'another-password');
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'email already registered');
  assert.equal(a.getUserByEmail('dup@example.com').id,
               a.getUserByEmail('dup@example.com').id);
});

test('弱密码与畸形邮箱被拒', () => {
  const { auth } = fresh();
  assert.equal(auth.register('x@example.com', 'short').ok, false);
  assert.equal(auth.register('not-an-email', 'a-good-password').ok, false);
  assert.notEqual(passwordProblem('1234567'), null);
  assert.equal(passwordProblem('12345678'), null);
  assert.notEqual(emailProblem('a@b'), null);
  assert.equal(emailProblem('a@b.co'), null);
});

test('登出后会话失效；重复登出返回 false', () => {
  const { auth } = fresh();
  auth.register('out@example.com', 'a-good-password');
  const { token } = auth.login('out@example.com', 'a-good-password');
  assert.equal(auth.resolveSession(token).user.email, 'out@example.com');
  assert.equal(auth.logout(token), true);
  assert.equal(auth.resolveSession(token), null);
  assert.equal(auth.logout(token), false);
});

test('会话过期后失效（注入时间，不睡眠）', () => {
  const { auth } = fresh();
  const t0 = 1_800_000_000_000;
  auth.register('exp@example.com', 'a-good-password', t0);
  const { token, expiresAt } = auth.login('exp@example.com', 'a-good-password', t0);
  assert.equal(auth.resolveSession(token, t0 + 1000).user.email, 'exp@example.com');
  assert.equal(auth.resolveSession(token, expiresAt + 1), null, '过期后应失效');
});

test('改密需旧密码正确；改密后其他会话被踢掉', () => {
  const { auth } = fresh();
  auth.register('chg@example.com', 'first-password');
  const s1 = auth.login('chg@example.com', 'first-password').token;
  const s2 = auth.login('chg@example.com', 'first-password').token;

  const bad = auth.changePassword(
    auth.resolveSession(s1).user.id, 'wrong-old-password', 'second-password');
  assert.equal(bad.ok, false);

  const good = auth.changePassword(
    auth.resolveSession(s1).user.id, 'first-password', 'second-password');
  assert.equal(good.ok, true);
  assert.equal(good.revokedSessions, 2, '两个会话都应失效');

  assert.equal(auth.resolveSession(s1), null);
  assert.equal(auth.resolveSession(s2), null);
  assert.equal(auth.login('chg@example.com', 'first-password').ok, false, '旧密码不能再登录');
  assert.equal(auth.login('chg@example.com', 'second-password').ok, true);
});

test('会话 token 明文不落库（只存 sha256）', () => {
  const { a, auth } = fresh();
  auth.register('hash@example.com', 'a-good-password');
  const { token } = auth.login('hash@example.com', 'a-good-password');
  const rows = a._db.prepare('SELECT hash FROM sessions').all();
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].hash, token);
  assert.equal(rows[0].hash.length, 64);
});

test('会话与账号余额打通：注册送 $5，消费可查', () => {
  const { a, auth } = fresh();
  auth.register('quota@example.com', 'a-good-password');
  const { token, user } = auth.login('quota@example.com', 'a-good-password');
  assert.equal(auth.resolveSession(token).user.id, user.id);
  assert.equal(a.balance(user.id).cents, 500, '注册应送 $5');
  assert.equal(a.balance(user.id).microUsd, 5_000_000);
  a.chargeInputTokens(user.id, 1000);
  assert.equal(a.balance(user.id).microUsd, 5_000_000 - 42, '1000 个输入 token 扣 42 微美元');
  assert.equal(a.balance(user.id).usd, '4.999958');
});
