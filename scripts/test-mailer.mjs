#!/usr/bin/env node
/**
 * 发信通道（mailer）验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-mailer.mjs
 *
 * 锁定的契约（deploy/ACCOUNTS-DEPLOY.md「上线前必须做的三件事」第 1 条）：
 *   production 且未配发信通道时，makeMailer() 必须不可发信——
 *   返回 null（graceful），而不是退回 console 通道把验证码打进生产日志。
 *
 * 背景：生产 env 若漏设 NODE_ENV=production，makeMailer 会误判为非生产，
 * 在无 MAIL_TRANSPORT 时退回 console，导致 /api/auth/otp/* 返回 200 且
 * 验证码明文进日志。本测试是这条护栏的回归网。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeMailer } from '../server/mailer.mjs';

/** 抓取 fn 执行期间写入 console 的所有内容 */
function captureConsole(fn) {
  const lines = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => lines.push(a.join(' '));
  console.error = (...a) => lines.push(a.join(' '));
  try {
    return { result: fn(), lines };
  } finally {
    console.log = origLog;
    console.error = origErr;
  }
}

const SECRET = 'CODE_751814';

test('production 且未配通道 → 返回 null（不可发信）', () => {
  const m = makeMailer({ NODE_ENV: 'production' });
  assert.equal(m, null, 'production 下无通道必须返回 null，不能有可用通道');
});

test('production 任何未配通道的形态 → 都拿不到会打印验证码的 mailer', async () => {
  // 枚举生产下所有"半配/未配"形态。规则：允许抛错或返回 null（即拿不到可用
  // 通道），但只要拿到带 send 的对象，就必须真的调一次并断言它不打印验证码。
  // 这样若有人把 isProd 判错、让它在生产退回 console 通道，本测试会变红。
  const prodConfigs = [
    { NODE_ENV: 'production' },                              // 完全没配
    { NODE_ENV: 'production', MAIL_TRANSPORT: '' },          // 空串
    { NODE_ENV: 'production', MAIL_TRANSPORT: 'webhook' },   // 缺 URL
    { NODE_ENV: 'production', MAIL_TRANSPORT: 'smtp' },      // 缺 URL
    { NODE_ENV: 'production', MAIL_TRANSPORT: 'console' },   // 明确要求 console
  ];

  for (const cfg of prodConfigs) {
    let m = null;
    let threw = false;
    const ctor = captureConsole(() => {
      try { m = makeMailer(cfg); } catch { threw = true; }
    });

    // 构造期本就不得出现验证码
    assert.equal(
      [...ctor.lines].some((l) => l.includes(SECRET)),
      false,
      `构造 ${JSON.stringify(cfg)} 时泄露了验证码`
    );

    if (threw || m === null) continue; // 拿不到通道，天然无泄露

    // 拿到了通道：必须真的用一次，并证明它不打印验证码
    assert.equal(typeof m.send, 'function', `${JSON.stringify(cfg)} 返回的对象应带 send`);
    const used = await captureConsole(() => m.send('prod@example.com', SECRET));
    assert.equal(
      used.lines.some((l) => l.includes(SECRET)),
      false,
      `${JSON.stringify(cfg)} 的 send 把验证码写进了日志`
    );
  }
});

test('production + MAIL_TRANSPORT=console → 抛错拒绝启动（不静默退回 console）', () => {
  assert.throws(
    () => makeMailer({ NODE_ENV: 'production', MAIL_TRANSPORT: 'console' }),
    /console is not allowed in production/i
  );
});

test('production + webhook/smtp 缺 URL → 抛错（不假装可用）', () => {
  assert.throws(() => makeMailer({ NODE_ENV: 'production', MAIL_TRANSPORT: 'webhook' }), /MAIL_WEBHOOK_URL/);
  assert.throws(() => makeMailer({ NODE_ENV: 'production', MAIL_TRANSPORT: 'smtp' }), /SMTP_URL/);
});

test('开发环境（非 production）未配通道 → console 通道可用，便于本地验证', () => {
  const m = makeMailer({ NODE_ENV: 'development' });
  assert.ok(m, '开发环境应返回 console 通道');
  assert.equal(m.name, 'console');
});

test('开发环境 console 通道 send 打印验证码（仅限开发，是允许行为）', async () => {
  const m = makeMailer({ NODE_ENV: 'development' });
  const { lines } = captureConsole(() => m.send('dev@example.com', SECRET));
  assert.ok(lines.some((l) => l.includes(SECRET)), '开发环境应把验证码打到日志以便自测');
});
