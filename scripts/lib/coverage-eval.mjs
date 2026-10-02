/**
 * 覆盖语料评测：把 runCompare 的结果按维度汇总成命中率报表。
 *
 * 这里只做纯计算（分批判定由调用方注入），便于用假 runCompare 做单元测试，
 * 不依赖真实上游。
 */

/** 把数组切成每批最多 size 个 */
export function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * 对一批结果按某个维度汇总命中率。
 * @param {Array} results  runCompare 的返回：[{ id, ours, official }]
 * @param {Array} cases    与 results 一一对应的语料条目（含 accept 与维度字段）
 * @param {string} side    'ours' | 'official'
 * @param {string[]} axes  要汇总的维度名
 */
export function summarize(results, cases, side, axes) {
  const byId = new Map(cases.map((c) => [c.id, c]));
  const buckets = Object.fromEntries(axes.map((a) => [a, new Map()]));
  const totals = { total: 0, answered: 0, hit: 0, errors: 0 };

  for (const r of results) {
    const c = byId.get(r.id);
    if (!c) continue;
    const s = r[side];
    totals.total++;
    const answered = Boolean(s && s.ok);
    const isHit = answered && c.accept.includes(s.choice);

    if (answered) totals.answered++; else totals.errors++;
    if (isHit) totals.hit++;

    // 无论是否答对都要落进 bucket：否则「全部出错」的取值会从报表里消失，
    // 恰好掩盖最该被注意的失败项。
    for (const axis of axes) {
      const key = c[axis];
      if (key === undefined) continue;
      const m = buckets[axis];
      const b = m.get(key) || { answered: 0, hit: 0, errors: 0, n: 0 };
      b.n++;
      if (answered) { b.answered++; if (isHit) b.hit++; } else { b.errors++; }
      m.set(key, b);
    }
  }

  const out = {};
  for (const axis of axes) {
    out[axis] = [...buckets[axis].entries()]
      .map(([key, b]) => ({
        key,
        n: b.n,
        answered: b.answered,
        errors: b.errors,
        hit: b.hit,
        accuracy: b.answered ? b.hit / b.answered : null,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
  return {
    totals: {
      ...totals,
      accuracy: totals.answered ? totals.hit / totals.answered : null,
    },
    byAxis: out,
  };
}

/** 把汇总渲染成 Markdown 报表 */
export function renderReport(summary, meta = {}) {
  const pct = (x) => (x == null ? '—' : `${(x * 100).toFixed(1)}%`);
  const lines = [];
  lines.push(`# JEV 覆盖评测报表`);
  lines.push('');
  if (meta.generatedAt) lines.push(`- 生成时间：${meta.generatedAt}`);
  if (meta.model) lines.push(`- 被测模型：${meta.model}`);
  if (meta.sample != null) lines.push(`- 语料条数：${meta.sample}`);
  lines.push(`- 总命中率：**${pct(summary.totals.accuracy)}**（命中 ${summary.totals.hit} / 已答 ${summary.totals.answered} / 出错 ${summary.totals.errors}）`);
  lines.push('');
  for (const [axis, rows] of Object.entries(summary.byAxis)) {
    lines.push(`## ${axis}`);
    lines.push('');
    lines.push('| 取值 | 命中率 | 命中 | 已答 | 出错 |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const r of rows) {
      lines.push(`| ${r.key} | ${pct(r.accuracy)} | ${r.hit} | ${r.answered} | ${r.errors} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** 从结果里挑出未命中的题，便于人工复核 */
export function misses(results, cases, side, limit = 50) {
  const byId = new Map(cases.map((c) => [c.id, c]));
  const out = [];
  for (const r of results) {
    const c = byId.get(r.id);
    const s = r[side];
    if (!c || !s || !s.ok) continue;
    if (!c.accept.includes(s.choice)) {
      out.push({
        id: r.id, industry: c.industry, dimension: c.dimension, tag: c.tag,
        scene: c.scene, stage: c.stage,
        context: c.context, question: c.question,
        expected: c.accept, got: s.choice,
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}
