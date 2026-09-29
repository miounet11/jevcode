/**
 * 计费口径 —— 单独成文件，让前端页面也能安全引用。
 *
 * 不放在 accounts.mjs 里的原因：那个模块会 import node:sqlite，前端构建
 * （astro 的 prerender）不该被拖进 Node 内置数据库模块。
 *
 * 当前口径（按用户要求刻意保持简单）：
 *   注册即送 $5 额度，账号+密码即可，不验邮箱；按次扣费，用完为止。
 *   后续要加套餐、月订阅、按量充值，改这一处即可。
 */

/** 注册赠送额度，单位：美分 */
export const SIGNUP_CREDIT_CENTS = 500;

/** 每次判定的扣费，单位：美分 */
export const JUDGE_PRICE_CENTS = 1;

/** 美分转美元字符串，用于展示 */
export function centsToUsd(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

/** $5 能跑多少次判定 */
export const SIGNUP_JUDGMENTS = Math.floor(SIGNUP_CREDIT_CENTS / JUDGE_PRICE_CENTS);

/**
 * 套餐展示元数据。当前只有免费档（注册即送），付费档待定价。
 * priceUsdPerMonth 为 null 表示价格未定。
 */
export const PLAN_META = {
  free: { priceUsdPerMonth: null, pricePending: true, note: 'signup credit' },
  paid: { priceUsdPerMonth: null, pricePending: true },
};
