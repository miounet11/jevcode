/**
 * 从覆盖语料里挑下一批还没发过的案例。
 * 只保留语料里已有的字段，不补写判定。
 */

/**
 * 语料按行业分块、块内按维度分块。顺序直接取用会让连续几天都落在同一个
 * 行业，所以按「维度 × 行业」的对角线重排：每一步里每个行业取不同维度，
 * 一天的批次就能同时覆盖多个行业和多个题目。
 * 同组内保持语料原有顺序，只做重排，不增删字段。
 */
function orderByRotation(coverage) {
  const industries = [];
  const dims = [];
  const buckets = new Map();
  for (const row of coverage ?? []) {
    const industry = String(row?.industry ?? '');
    const dimension = String(row?.dimension ?? '');
    const key = `${industry}\u0000${dimension}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      if (!industries.includes(industry)) industries.push(industry);
      if (!dims.includes(dimension)) dims.push(dimension);
    }
    buckets.get(key).push(row);
  }
  if (!industries.length || !dims.length) return coverage ?? [];
  const depth = Math.max(...[...buckets.values()].map((rows) => rows.length));
  const out = [];
  for (let step = 0; step < depth * dims.length; step += 1) {
    for (let i = 0; i < industries.length; i += 1) {
      const dimension = dims[(step + i) % dims.length];
      const rows = buckets.get(`${industries[i]}\u0000${dimension}`);
      const take = rows?.shift();
      if (take) out.push(take);
    }
  }
  return out;
}

/**
 * @param {any[]} coverage
 * @param {Iterable<string>} existingIds
 * @param {number} [limit]
 */
export function nextBriefSources(coverage, existingIds, limit = 50) {
  const seen = new Set(existingIds ?? []);
  const cap = Number.isInteger(limit) && limit > 0 ? limit : 50;
  const out = [];
  for (const row of orderByRotation(coverage)) {
    if (out.length >= cap) break;
    const id = String(row?.id ?? '');
    if (!id.startsWith('cov-') || seen.has(id)) continue;
    const choices = Array.isArray(row.choices)
      ? row.choices.filter((choice) => typeof choice === 'string' && choice.trim()).map((choice) => choice.trim()).slice(0, 8)
      : [];
    const context = String(row.context ?? '').trim();
    const question = String(row.question ?? '').trim();
    if (choices.length < 2 || context.length < 8 || context.length > 4000 || !question) continue;
    const accept = Array.isArray(row.accept)
      ? row.accept.filter((choice) => typeof choice === 'string' && choices.includes(choice.trim())).map((choice) => choice.trim())
      : [];
    seen.add(id);
    out.push({
      id,
      industry: String(row.industry ?? '').trim(),
      dimension: String(row.dimension ?? '').trim(),
      tag: String(row.tag ?? '').trim(),
      scene: String(row.scene ?? '').trim(),
      stage: String(row.stage ?? '').trim(),
      context,
      question,
      choices,
      accept,
    });
  }
  return out;
}

/**
 * 整批判定的准入门槛。
 *
 * 早期版本只看「有判定且命中 accept 的比例」。当整批调用都失败时，有判定的
 * 条数为 0，比例算不出来，门槛就被静默跳过——50 篇没有判定的内容照常写入。
 * 这里把「没判定」本身也当成不合格：配置了 key 却一篇都没判出来，说明判定
 * 链路坏了，不该把结果发出去。
 *
 * @returns {{ pass: boolean, accuracy: number|null, reason: string|null }}
 */
export function checkJudgedBatch(rows, { minAccuracy = 0.8, expectJudgment = true } = {}) {
  const list = rows ?? [];
  // 空批次是「语料已发完」，不是「判定链路坏了」。调用方在 sources 为空时本就
  // 提前退出；这里显式区分，避免调用顺序变动后被误报成 no-judgment 而整批失败。
  if (!list.length) return { pass: true, accuracy: null, reason: 'empty' };
  const claimed = list.filter((row) => row?.judgment?.choice);
  if (!claimed.length) {
    if (!expectJudgment) return { pass: true, accuracy: null, reason: null };
    return { pass: false, accuracy: null, reason: 'no-judgment' };
  }
  const hits = claimed.filter((row) => (row.accept ?? []).includes(row.judgment.choice)).length;
  const accuracy = hits / claimed.length;
  if (accuracy < minAccuracy) {
    return { pass: false, accuracy, reason: 'below-threshold' };
  }
  return { pass: true, accuracy, reason: null };
}

/** 历史遗留的空判定条目，按原顺序取前 limit 条用于回填。 */
export function selectBackfillTargets(rows, limit = 5) {
  const cap = Number.isInteger(limit) && limit > 0 ? limit : 5;
  return (rows ?? []).filter((row) => !row?.judgment?.choice).slice(0, cap);
}

/**
 * 回填历史遗留的空判定，原地写回 rows，返回成功条数。
 * judge 由调用方注入，失败（返回 null）的条目保持原样，不写半成品。
 */
export async function backfillJudgments(rows, { limit = 5, judge } = {}) {
  let filled = 0;
  for (const row of selectBackfillTargets(rows, limit)) {
    const judgment = await judge(row);
    if (!judgment) continue;
    row.judgment = judgment;
    filled += 1;
  }
  return filled;
}

/** 站点语言里可直接译的语种；en 是语料原文。 */
const LOCALIZED_LANGS = new Set(['zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt']);

/**
 * 取某字段的本地化 slug：术语表里有就用译名，否则回退英文原 slug。
 * table 形如 briefTerms（field -> slug -> lang -> word）。
 */
export function localizeTerm(field, slug, lang, table) {
  const raw = slug == null ? '' : String(slug).trim();
  if (!raw || !LOCALIZED_LANGS.has(lang)) return raw;
  const t = table?.[field]?.[raw]?.[lang];
  return typeof t === 'string' && t.trim() ? t.trim() : raw;
}

/**
 * 按语言拼简报标题。
 *
 * 译名只替换 slug，不改分隔符与字段顺序，各语言站点因此产出可区分的
 * <title>/h1，同时仍保留 slug 形态便于人工比对。
 */
export function briefHeading(row, lang = 'en', table) {
  // 字段顺序固定：industry · scene · tag · dimension，与英文标题一致。
  return ['industry', 'scene', 'tag', 'dimension']
    .map((field) => localizeTerm(field, row?.[field], lang, table))
    .filter(Boolean)
    .join(' · ');
}

/** 该 id 在该语言下是否已有译文；没有的正文保持英文原文。 */
export function hasLocalizedBrief(briefId, lang, map) {
  if (!LOCALIZED_LANGS.has(lang)) return false;
  const entry = map?.[briefId]?.[lang];
  return Boolean(entry?.context && entry?.question);
}

/**
 * 取某语言下应渲染的正文：context / question / choices。
 * 缺译文时返回英文原文，由调用方决定是否 noindex。
 */
export function localizedBrief(row, lang, map) {
  const entry = hasLocalizedBrief(row?.id, lang, map) ? map[row.id][lang] : null;
  return {
    context: entry?.context ?? row?.context ?? '',
    question: entry?.question ?? row?.question ?? '',
    choices: entry?.choices ?? row?.choices ?? [],
    localized: Boolean(entry),
  };
}
