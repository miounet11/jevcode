/**
 * 套餐额度定义 —— 单独成文件，让前端页面也能安全引用。
 *
 * 不放在 accounts.mjs 里的原因：那个模块会 import node:sqlite，前端构建
 * （astro 的 prerender）不该被拖进 Node 内置数据库模块。
 *
 * 定价口径参考 clavue.com 实测结构（日/周/月三窗），但这里只落实用户
 * 明确给出的「免费每人 25/日」；付费档为占位，定价定下来后改这一处即可。
 */

/** 时间窗长度（毫秒） */
export const WINDOWS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

/**
 * 各档位各窗口的额度。null = 该窗口不限。
 * free.day = 25 是用户明确给出的口径；paid 为占位，待定价决策。
 */
export const PLANS = {
  free: { day: 25, week: null, month: null },
  paid: { day: 500, week: null, month: null },
};

/** 展示用元数据，前端 /pricing 读取 */
export const PLAN_META = {
  free: { priceUsdPerMonth: 0, pricePending: false },
  paid: { priceUsdPerMonth: null, pricePending: true },
};
