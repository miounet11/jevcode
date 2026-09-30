/**
 * 计费口径。与 jev-1.13.0 的公开价一致：只按输入 token 计费，输出免费。
 * 每十亿输入 token $42，即每百万 $0.042。
 *
 * 1 美分存不下单次调用。账本内部用微美元：1 USD = 1_000_000。
 * 这个文件不引用 Node API，Astro 页面可以 import。
 */

/** 每百万输入 token 的美元价格 */
export const INPUT_USD_PER_MILLION = 0.042;

/** 输出不计费 */
export const OUTPUT_USD_PER_MILLION = 0;

/** 注册赠送，对外仍以美分为单位（$5 = 500 美分） */
export const SIGNUP_CREDIT_CENTS = 500;

/** 1 美分 = 10000 微美元 */
export const MICROUSD_PER_CENT = 10_000;

/** 注册赠送，微美元 */
export const SIGNUP_CREDIT_MICROUSD = SIGNUP_CREDIT_CENTS * MICROUSD_PER_CENT;

/**
 * 输入 token 的费用，单位微美元。
 * 1000 token = 42 微美元 = $0.000042。有 token 时至少 1 微美元。
 */
export function inputCostMicroUsd(tokens) {
  const n = Math.floor(Number(tokens));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(1, Math.ceil((n * 42) / 1000));
}

/** 这笔余额还能覆盖多少输入 token */
export function inputTokensLeft(microUsd) {
  const micro = Math.floor(Number(microUsd) || 0);
  if (micro <= 0) return 0;
  return Math.floor((micro * 1000) / 42);
}

/** 美分转美元字符串 */
export function centsToUsd(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

/**
 * 微美元转美元字符串。去掉尾随 0，至少保留两位。
 * 5_000_000 → "5.00"，42 → "0.000042"，4_999_958 → "4.999958"。
 */
export function microUsdToUsd(microUsd) {
  const n = Number(microUsd || 0) / 1_000_000;
  const negative = Object.is(n, -0) || n < 0;
  const abs = Math.abs(n);
  let text = abs.toFixed(6).replace(/0+$/, '');
  if (text.endsWith('.')) text += '00';
  else if (text.length - text.indexOf('.') - 1 < 2) text = abs.toFixed(2);
  return negative ? `-${text}` : text;
}

/** $5 按公开单价能覆盖的输入 token。扣光这一笔后余额为 0。 */
export const SIGNUP_INPUT_TOKENS = inputTokensLeft(SIGNUP_CREDIT_MICROUSD);

export const PLAN_META = {
  meter: 'input_tokens',
  inputUsdPerMillion: INPUT_USD_PER_MILLION,
  outputUsdPerMillion: OUTPUT_USD_PER_MILLION,
  signupCreditCents: SIGNUP_CREDIT_CENTS,
};
