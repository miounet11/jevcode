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

/**
 * 简报标题。
 *
 * industry · scene · tag 在同一批次内唯一，但全语料只有 3840 种组合对应 7680
 * 条案例，跨批次重复出现时会出现同名页面。补上 dimension 后 7680 条全唯一，
 * 且仍然可读。
 */
export function briefHeading(row) {
  return [row.industry, row.scene, row.tag, row.dimension]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' · ');
}
