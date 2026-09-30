/**
 * 简单的算术验证码 —— 防机器批量注册用，不做严肃的 bot 对抗。
 *
 * 设计取舍：
 * - 无状态：不存 session、不发 cookie。答案藏在 HMAC 签名里，服务端只验签，
 *   nginx 多实例或重启都不会丢状态。
 * - 题目刻意朴素（两位数加减法），目标是挡住脚本化批量注册，而不是挡住人。
 *   真正的机器人防线应上 Turnstile / reCAPTCHA，那属独立一步。
 * - 用 playground 的 JEVCODE_PLAYGROUND_KEY 当签名密钥：它只存在于服务端，
 *   与浏览器零接触；未配置时验证码整体不可用（宁可退化也不放行机器注册）。
 */

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/** 验证码有效期：题目下发后多久内必须提交 */
const TTL_MS = 10 * 60 * 1000;

const b64u = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest();
}

/** 生成一道题：返回给浏览器的问题文案与不透明 token。 */
export function issueCaptcha(secret, at = Date.now()) {
  const a = randomInt(2, 20);
  const b = randomInt(1, 20);
  // 一半概率加法、一半减法；减法保证结果非负，避免负数让用户困惑
  const plus = randomInt(0, 2) === 0;
  const [x, y] = plus || a >= b ? [a, b] : [b, a];
  const answer = plus ? x + y : x - y;
  const expires = at + TTL_MS;

  const payload = `${answer}.${expires}`;
  const token = `${expires}.${b64u(sign(payload, secret))}`;
  return {
    question: `${x} ${plus ? '+' : '−'} ${y} = ?`,
    token,
    expiresAt: expires,
  };
}

/**
 * 校验用户答案。
 * @returns {boolean} 仅当答案正确且未过期时为 true
 */
export function verifyCaptcha(secret, token, answer, at = Date.now()) {
  if (!secret || typeof token !== 'string' || typeof answer !== 'string') return false;

  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expires = Number(token.slice(0, dot));
  const sigB64 = token.slice(dot + 1);
  if (!Number.isFinite(expires) || expires < at) return false;

  // 用户答案是 0..40 的整数；非整数一律拒绝
  const n = Number(answer.trim());
  if (!Number.isInteger(n)) return false;

  const expected = sign(`${n}.${expires}`, secret);
  let given;
  try {
    given = Buffer.from(sigB64, 'base64url');
  } catch {
    return false;
  }
  // 长度不等时 timingSafeEqual 会抛错，先挡掉
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
