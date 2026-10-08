/**
 * 从覆盖语料里挑实验室还没有的场景。
 * 只产出实验室表单需要的字段，不把 cov- id 写进 server/case-index.json。
 */

/**
 * @param {any[]} coverage
 * @param {Set<string> | string[]} existingIds 内置场景和已补充场景
 * @param {number} [limit]
 */
export function nextScenarios(coverage, existingIds, limit = 4) {
  const seen = existingIds instanceof Set ? new Set(existingIds) : new Set(existingIds ?? []);
  const cap = Number.isInteger(limit) && limit > 0 ? limit : 4;
  const out = [];
  for (const row of coverage ?? []) {
    if (out.length >= cap) break;
    const id = String(row?.id ?? '');
    if (!id.startsWith('cov-') || seen.has(id)) continue;
    const choices = Array.isArray(row.choices)
      ? row.choices.filter((choice) => typeof choice === 'string' && choice.trim()).slice(0, 8)
      : [];
    const state = String(row.context ?? '').trim();
    const question = String(row.question ?? '').trim();
    if (choices.length < 2 || state.length < 8 || !question) continue;
    seen.add(id);
    out.push({
      id,
      state,
      questions: {
        answer: {
          type: 'choice',
          instructions: question,
          options: choices,
        },
      },
    });
  }
  return out;
}
