/**
 * 从覆盖语料里挑下一批还没发过的案例。
 * 只保留语料里已有的字段，不补写判定。
 */

/**
 * @param {any[]} coverage
 * @param {Iterable<string>} existingIds
 * @param {number} [limit]
 */
export function nextBriefSources(coverage, existingIds, limit = 50) {
  const seen = new Set(existingIds ?? []);
  const cap = Number.isInteger(limit) && limit > 0 ? limit : 50;
  const out = [];
  for (const row of coverage ?? []) {
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
