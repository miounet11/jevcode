/**
 * 每日案例选题池的健康度判定。
 *
 * 语料是静态的（60 行业 × 24 维度 × 10 模板 = 14400 条），而管线每天发 50 条。
 * 池子见底时 nextBriefSources 只是返回更少条目，脚本照常 exit 0——
 * 从外部看「管线正常」，实际上站点已经停止增长。这种失败没有任何报错，
 * 只能靠余量本身告警，所以判据放在这里单独可测。
 */

/** 低于这个天数就应当在日报里报警，留出补语料的时间。 */
export const LOW_DAYS_THRESHOLD = 30;

/**
 * @param {{ remaining: number, perDay: number }} input
 * @returns {{ daysLeft: number, level: 'ok'|'low'|'empty', message: string }}
 */
export function assessPool({ remaining, perDay }) {
  const per = Number.isFinite(perDay) && perDay > 0 ? perDay : 50;
  const left = Math.max(0, Number.isFinite(remaining) ? remaining : 0);
  const daysLeft = Math.floor(left / per);

  if (left <= 0) {
    return {
      daysLeft: 0,
      level: 'empty',
      message: `选题池已耗尽：今天将发布 0 篇（预期 ${per} 篇）。必须补 data/coverage-cases.json。`,
    };
  }
  if (daysLeft < LOW_DAYS_THRESHOLD) {
    return {
      daysLeft,
      level: 'low',
      message: `选题池余量 ${left} 条，约 ${daysLeft} 天（每天 ${per} 篇）后耗尽，请补语料。`,
    };
  }
  return {
    daysLeft,
    level: 'ok',
    message: `选题池余量 ${left} 条，约 ${daysLeft} 天。`,
  };
}
