#!/usr/bin/env node
/**
 * 用覆盖语料对 JEV 做批量评测，输出各维度命中率报表。
 *
 * 用法：
 *   node scripts/eval-coverage.mjs --base https://www.jevcode.ai [选项]
 *
 * 选项：
 *   --base URL        评测目标，默认 http://127.0.0.1:8790
 *   --cases PATH      语料文件，默认 data/coverage-sample.json
 *   --limit N         最多评多少条（默认全量；分批按 COMPARE_MAX=8）
 *   --tag X           只看某 tag（可重复）
 *   --dimension X     只看某判定类型（可重复）
 *   --industry X      只看某行业（可重复）
 *   --sleep MS        批间隔，默认 90000（避开比较频控 40 批/小时）
 *   --dry             不发请求，只打印将评测的条数与维度分布
 *   --out PATH        报表输出，默认 docs/coverage-report.md
 *   --max-fail R      丢题+出错占比超过 R 即判失败并非零退出，默认 0.5
 *
 * 退避：命中 429（频控）时等待 retry 后重试该批，最多 3 次。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chunk, summarize, renderReport, misses, shouldFail } from './lib/coverage-eval.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const a = { base: 'http://127.0.0.1:8790', cases: 'data/coverage-sample.json', limit: 0, sleep: 90000, dry: false, out: 'docs/coverage-report.md', maxFail: 0.5, tag: [], dimension: [], industry: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === '--base') a.base = next();
    else if (k === '--cases') a.cases = next();
    else if (k === '--limit') a.limit = Number(next());
    else if (k === '--sleep') a.sleep = Number(next());
    else if (k === '--max-fail') a.maxFail = Number(next());
    else if (k === '--out') a.out = next();
    else if (k === '--dry') a.dry = true;
    else if (k === '--tag') a.tag.push(next());
    else if (k === '--dimension') a.dimension.push(next());
    else if (k === '--industry') a.industry.push(next());
    else { console.error(`未知参数：${k}`); process.exit(2); }
  }
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = parseArgs(process.argv.slice(2));

let cases = JSON.parse(readFileSync(path.join(ROOT, args.cases), 'utf8'));
if (args.tag.length) cases = cases.filter((c) => args.tag.includes(c.tag));
if (args.dimension.length) cases = cases.filter((c) => args.dimension.includes(c.dimension));
if (args.industry.length) cases = cases.filter((c) => args.industry.includes(c.industry));
if (args.limit > 0) cases = cases.slice(0, args.limit);

if (cases.length === 0) {
  console.error('筛选后没有用例可评测');
  process.exit(2);
}

console.log(`将评测 ${cases.length} 条（base=${args.base}）`);

if (args.dry) {
  const dist = (k) => {
    const m = {};
    for (const c of cases) m[c[k]] = (m[c[k]] || 0) + 1;
    return m;
  };
  console.log('industry:', Object.keys(dist('industry')).length, '个行业');
  console.log('dimension:', Object.keys(dist('dimension')).length, '个类型');
  console.log('tag:', Object.keys(dist('tag')).length, '个 tag');
  process.exit(0);
}

async function runBatch(batch) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`${args.base}/api/compare`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: batch.map((c) => ({ id: c.id, context: c.context, question: c.question, choices: c.choices })) }),
      signal: AbortSignal.timeout(60000),
    });
    if (res.status === 429) {
      const wait = 60000 * attempt;
      console.error(`  频控 429，等待 ${wait / 1000}s 后重试（第 ${attempt} 次）`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text.slice(0, 160)}`);
    }
    const payload = await res.json();
    return payload.results || [];
  }
  throw new Error('重试 3 次仍被频控');
}

const batches = chunk(cases, 8);
const allResults = [];
for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  try {
    const results = await runBatch(batch);
    allResults.push(...results);
    console.log(`  批 ${i + 1}/${batches.length} 完成（${results.length} 条）`);
  } catch (err) {
    console.error(`  批 ${i + 1} 失败：${err.message}`);
  }
  if (i < batches.length - 1 && args.sleep > 0) await sleep(args.sleep);
}

const axes = ['industry', 'dimension', 'tag', 'scene', 'stage'];
const summaryOurs = summarize(allResults, cases, 'ours', axes);
const summaryPeer = summarize(allResults, cases, 'official', axes);

const meta = { generatedAt: new Date().toISOString(), model: 'clavue-jev', sample: cases.length };
let report = renderReport(summaryOurs, meta);
report += '\n\n---\n\n## 对照：jev-1.13.0（如配置）\n\n';
report += renderReport(summaryPeer, { ...meta, model: 'jev-1.13.0' });

const missList = misses(allResults, cases, 'ours', 100);
if (missList.length) {
  report += '\n\n## 未命中样例（最多 100 条）\n\n';
  report += '| id | 行业 | 类型 | tag | 期望 | 实际 |\n| --- | --- | --- | --- | --- | --- |\n';
  for (const m of missList) {
    report += `| ${m.id} | ${m.industry} | ${m.dimension} | ${m.tag} | ${m.expected.join('/')} | ${m.got} |\n`;
  }
}

// path.resolve 能正确处理绝对路径（--out /tmp/x 不会被拼到仓库下）
const outPath = path.resolve(ROOT, args.out);
if (!existsSync(path.dirname(outPath))) mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, report);
console.log(`\n报表已写出 ${args.out}`);
const t = summaryOurs.totals;
console.log(`总命中率（ours）: ${t.accuracy == null ? '—' : (t.accuracy * 100).toFixed(1) + '%'}`);
console.log(`  命中 ${t.hit} / 已答 ${t.answered} / 出错 ${t.errors} / 丢题 ${t.missing} / 语料 ${t.total}`);

// 丢题 + 出错占比过高即判失败（分母是语料条数，所以「一批都没成」也会非零退出）
if (shouldFail(summaryOurs, args.maxFail)) {
  console.error(`评测失败：丢题 ${t.missing} + 出错 ${t.errors} 超过阈值`);
  process.exit(1);
}
