/**
 * IndexNow 增量提交的纯逻辑：解析 sitemap、算出哪些 URL 需要重推。
 *
 * 抽出来的原因：判定错了不会报错，只会要么白推全量（挤占配额）、
 * 要么漏推真实变更（页面永远不被重爬）——两种都是静默失败，必须有回归网。
 */

/**
 * 从 sitemap XML 里取出 { loc, lastmod }。
 * @param {string} xml
 * @returns {Array<{loc: string, lastmod: string | null}>}
 */
export function parseSitemapEntries(xml) {
  const out = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    out.push({ loc, lastmod: block[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? null });
  }
  return out;
}

/**
 * 挑出与上次提交状态不一致的条目。
 *
 * - lastmod 为 null 的条目每次都重推：没有时间戳就无法判断「是否变了」，
 *   宁可多推一次，也不能让改了内容的页面永远不被通知。
 * - forceAll 时全推（首次上线、状态文件丢失后的自愈）。
 *
 * @param {Array<{loc: string, lastmod: string | null}>} entries
 * @param {Record<string, string>} prev 上次提交时记录的 loc → lastmod
 * @param {{ forceAll?: boolean }} [opts]
 * @returns {Array<{loc: string, lastmod: string | null}>}
 */
export function selectChanged(entries, prev, { forceAll = false } = {}) {
  if (forceAll) return [...entries];
  return entries.filter((e) => e.lastmod === null || prev[e.loc] !== e.lastmod);
}

/**
 * 提交成功后更新状态：只记录真的推成功的 URL，并清掉已从 sitemap 消失的。
 *
 * 只记成功的那批很重要——失败批次保持「与上次不同」，下次才会重推。
 *
 * @param {Record<string, string>} prev
 * @param {Array<{loc: string, lastmod: string | null}>} entries 当前 sitemap 全量
 * @param {string[]} submitted 本次提交成功的 loc
 * @returns {Record<string, string>}
 */
export function nextState(prev, entries, submitted) {
  const lastmodOf = new Map(entries.map((e) => [e.loc, e.lastmod]));
  const next = {};
  // 只保留仍然存在的 URL 的旧状态
  for (const [loc, lm] of Object.entries(prev)) {
    if (lastmodOf.has(loc)) next[loc] = lm;
  }
  for (const loc of submitted) {
    const lm = lastmodOf.get(loc);
    if (lm) next[loc] = lm;
    else delete next[loc];
  }
  return next;
}
