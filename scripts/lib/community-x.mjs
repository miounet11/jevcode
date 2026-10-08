/**
 * 社区脉搏的纯函数：刷新浏览/点赞、去重新推、渲染 community.ts 条目。
 * 不读网络、不写文件。scripts/fetch-community-x.mjs 负责调用 X API。
 */

/** @param {Record<string, unknown> | undefined} pm */
export function metricsOf(pm) {
  let views;
  for (const key of ['impression_count', 'impressions', 'views']) {
    const value = pm?.[key];
    if (typeof value === 'number') {
      views = value;
      break;
    }
    if (value && typeof value === 'object' && typeof value.count === 'number') {
      views = value.count;
      break;
    }
  }
  const likes = pm?.like_count ?? pm?.likes;
  return {
    views: Number.isInteger(views) ? views : undefined,
    likes: Number.isInteger(likes) ? likes : undefined,
  };
}

/**
 * 按现有条目的 views/likes 行原位替换。缺字段或对不上的 id 保持原文。
 * @param {string} src
 * @param {{ id: string, views: number, likes: number }[]} updates
 */
export function applyMetrics(src, updates) {
  let out = String(src);
  for (const update of updates ?? []) {
    const id = String(update?.id ?? '');
    if (!/^\d+$/.test(id)) continue;
    if (!Number.isInteger(update.views) || update.views < 0) continue;
    if (!Number.isInteger(update.likes) || update.likes < 0) continue;
    const re = new RegExp(
      `(id: "${id}",[\\s\\S]*?\\n    views: )\\d+(,\\s*\\n    likes: )\\d+(,)`,
    );
    out = out.replace(re, `$1${update.views}$2${update.likes}$3`);
  }
  return out;
}

/** @param {string} src */
export function extractIds(src) {
  return [...String(src).matchAll(/id: "(\d+)"/g)].map((match) => match[1]);
}

/**
 * X recent search 响应 → 扁平推文。作者对不上的条目不带 username，后续会被丢掉。
 * @param {any} payload
 */
export function tweetsFromSearch(payload) {
  const users = new Map(
    (payload?.includes?.users ?? []).map((user) => [user.id, user]),
  );
  const tweets = [];
  for (const tweet of payload?.data ?? []) {
    const user = users.get(tweet.author_id) ?? {};
    const metrics = metricsOf(tweet.public_metrics);
    tweets.push({
      id: tweet.id,
      text: tweet.text,
      username: user.username,
      name: user.name,
      created_at: tweet.created_at,
      views: metrics.views,
      likes: metrics.likes,
    });
  }
  return tweets;
}

/**
 * 去掉已有 id，最多留下 limit 条。缺正文或用户名的不要。
 * @param {string[]} existingIds
 * @param {any[]} incoming
 * @param {number} [limit]
 */
export function mergeTweets(existingIds, incoming, limit = 8) {
  const seen = new Set((existingIds ?? []).map(String));
  const cap = Number.isInteger(limit) && limit > 0 ? limit : 8;
  const added = [];
  for (const raw of incoming ?? []) {
    if (added.length >= cap) break;
    const id = String(raw?.id ?? '');
    if (!/^\d+$/.test(id) || seen.has(id)) continue;
    const text = String(raw.text ?? '').replace(/\s+/g, ' ').trim();
    const username = String(raw.username ?? raw.screenName ?? '').replace(/^@/, '').trim();
    const name = String(raw.name ?? raw.author ?? username).trim();
    if (!text || !/^[A-Za-z0-9_]{1,15}$/.test(username)) continue;
    const created = raw.created_at ?? raw.date;
    const date = created && !Number.isNaN(new Date(created).getTime())
      ? new Date(created).toISOString()
      : new Date().toISOString();
    seen.add(id);
    added.push({
      id,
      author: name.slice(0, 80) || username,
      screenName: username,
      url: `https://x.com/${username}/status/${id}`,
      date,
      text: text.slice(0, 280),
      views: Number.isInteger(raw.views) && raw.views >= 0 ? raw.views : 0,
      likes: Number.isInteger(raw.likes) && raw.likes >= 0 ? raw.likes : 0,
      projectUrl: null,
    });
  }
  return added;
}

/** @param {{ id: string, author: string, screenName: string, url: string, date: string, text: string, views: number, likes: number }} entry */
export function renderEntry(entry) {
  return `  {
    id: ${JSON.stringify(entry.id)},
    author: ${JSON.stringify(entry.author)},
    screenName: ${JSON.stringify(entry.screenName)},
    url: ${JSON.stringify(entry.url)},
    date: ${JSON.stringify(entry.date)},
    text: ${JSON.stringify(entry.text)},
    views: ${entry.views},
    likes: ${entry.likes},
    projectUrl: null,
  }`;
}

/**
 * 把新条目插到 pulseEntries 数组结尾。不删除已有推文。
 * @param {string} src
 * @param {ReturnType<typeof mergeTweets>} entries
 */
export function insertEntries(src, entries) {
  if (!entries?.length) return src;
  const at = src.lastIndexOf('\n];');
  if (at < 0) throw new Error('community.ts: 找不到 pulseEntries 结尾');
  const before = src.slice(0, at);
  const needsComma = /}\s*$/.test(before);
  const block = entries.map(renderEntry).join(',\n');
  return `${before}${needsComma ? ',' : ''}\n${block}${src.slice(at)}`;
}
