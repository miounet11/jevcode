/**
 * 生态数据的保鲜计算。
 *
 * 门 1 的 worth 分数在同一批数据上实测抖动于 0.001~0.473，而阈值是 0.5，
 * 判定几乎不可能越过，页面上的 "data as of" 会无限期停在旧日期。陈旧天数
 * 是可以确定的事实，所以用确定性护栏兜底，而不是继续指望分数越线。
 */

/** 距上次生态发布的整天数；无法确定时返回 null。 */
export function ecoStaleDays(lastRelease, now = Date.now()) {
  if (!lastRelease) return null;
  const ms = now - new Date(lastRelease).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.floor(ms / 86400000));
}

/** 是否已超过容忍天数。基准未知时不拦截（没有依据）。 */
export function isEcoStale(lastRelease, limitDays, now = Date.now()) {
  const days = ecoStaleDays(lastRelease, now);
  if (days === null) return { stale: false, days: null };
  return { stale: days >= limitDays, days };
}
