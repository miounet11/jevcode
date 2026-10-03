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
  const resultById = new Map(results.map((r) => [r.id, r]));
  const buckets = Object.fromEntries(axes.map((a) => [a, new Map()]));
  // total 以语料为准，不是以收到的结果为准：否则「丢题」会被排除在分母外，
  // 报表会把丢题渲染成满分，掩盖真实故障。
  const totals = { total: cases.length, missing: 0, answered: 0, hit: 0, errors: 0 };

  for (const c of cases) {
    const r = resultById.get(c.id);
    const s = r ? r[side] : null;

    // 没有结果（整批失败、被服务端丢弃）算丢题；有结果但未 ok 算出错。
    const missing = !r || !s;
    const answered = Boolean(s && s.ok);
    const isHit = answered && c.accept.includes(s.choice);

    if (missing) totals.missing++;
    else if (answered) totals.answered++;
    else totals.errors++;
    if (isHit) totals.hit++;

    // 无论丢题/出错/答对都要落进 bucket：否则该取值会从报表里消失，
    // 恰好掩盖最该被注意的失败项。
    for (const axis of axes) {
      const key = c[axis];
      if (key === undefined) continue;
      const m = buckets[axis];
      const b = m.get(key) || { n: 0, missing: 0, answered: 0, errors: 0, hit: 0 };
      b.n++;
      if (missing) b.missing++;
      else if (answered) { b.answered++; if (isHit) b.hit++; }
      else b.errors++;
      m.set(key, b);
    }
  }

  const out = {};
  for (const axis of axes) {
    out[axis] = [...buckets[axis].entries()]
      .map(([key, b]) => ({
        key,
        n: b.n,
        missing: b.missing,
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

/**
 * 评测是否应判失败：丢题 + 出错占比超过阈值即为失败。
 * 分母用 total（= 语料条数），所以「一批都没成」也会判失败，不会因为
 * total 为 0 而误判为成功。
 */
export function shouldFail(summary, threshold = 0.5) {
  const total = summary.totals.total;
  if (!total) return true; // 没有任何语料被评到，视为失败
  const bad = summary.totals.missing + summary.totals.errors;
  return bad > total * threshold;
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
  const t = summary.totals;
  lines.push(`- 总命中率：**${pct(t.accuracy)}**（命中 ${t.hit} / 已答 ${t.answered} / 出错 ${t.errors} / 丢题 ${t.missing ?? 0}，分母 ${t.total}）`);
  if (t.missing) {
    lines.push('');
    lines.push(`> ⚠️ 有 ${t.missing} 条未拿到结果（丢题）。命中率只按已答计算，不代表全部语料。`);
  }
  lines.push('');
  for (const [axis, rows] of Object.entries(summary.byAxis)) {
    lines.push(`## ${axis}`);
    lines.push('');
    lines.push('| 取值 | 命中率 | 命中 | 已答 | 出错 | 丢题 |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
    for (const r of rows) {
      lines.push(`| ${r.key} | ${pct(r.accuracy)} | ${r.hit} | ${r.answered} | ${r.errors} | ${r.missing ?? 0} |`);
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
