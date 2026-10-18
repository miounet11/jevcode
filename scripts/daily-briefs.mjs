#!/usr/bin/env node
/**
 * 每天从覆盖语料取下一批案例，写成 src/data/daily-briefs.json。
 * 有 CLAVUE_API_KEYS 时逐条调用 clavue-jev，只记下返回的选项。
 * 调用失败仍保留这篇，judgment 为空，不编造选项。
 *
 * 用法：node scripts/daily-briefs.mjs
 * 环境变量 DAILY_BRIEFS：本轮篇数，默认 50。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { nextBriefSources, checkJudgedBatch, backfillJudgments } from './lib/daily-briefs.mjs';

const COVERAGE = 'data/coverage-cases.json';
const OUT = 'src/data/daily-briefs.json';
const LIMIT = Number(process.env.DAILY_BRIEFS ?? 50);
/** 判定命中语料 accept 的最低比例。低于此值整批不发，避免把错答案挂上站。 */
const MIN_ACCURACY = Number(process.env.BRIEFS_MIN_ACCURACY ?? 0.8);

async function judgeViaClavue(brief, key) {
  const url = process.env.CLAVUE_URL ?? 'https://api.clavue.com/v1/judge';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: brief.question,
      context: brief.context,
      choices: brief.choices,
    }),
  });
  if (!res.ok) return { status: res.status };
  const body = await res.json();
  return {
    status: 200,
    choice: typeof body.choice === 'string' ? body.choice : null,
    model: 'clavue-jev',
  };
}

async function judgeOne(brief) {
  const keys = (process.env.CLAVUE_API_KEYS ?? '').split(',').map((key) => key.trim()).filter(Boolean);
  if (!keys.length) return { missingKey: true };
  const result = await judgeViaClavue(brief, keys[0]);
  if (result.status === 200) return result;
  throw new Error(`clavue HTTP ${result.status}`);
}

const coverage = JSON.parse(readFileSync(COVERAGE, 'utf8'));
const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
const sources = nextBriefSources(coverage, existing.map((row) => row.id), LIMIT);

const published = new Date().toISOString().slice(0, 10);
let missingKey = false;

/** 判定单条，返回要写进数据的 judgment；失败返回 null，不编造选项。 */
async function judgeRow(row) {
  if (missingKey) return null;
  try {
    const result = await judgeOne(row);
    if (result.missingKey) {
      missingKey = true;
      console.error('[daily-briefs] WARN 无 CLAVUE_API_KEYS，本轮只发语料，不写调用结果');
      return null;
    }
    if (!result.choice || !row.choices.includes(result.choice)) return null;
    return { ok: true, choice: result.choice, model: result.model, ts: new Date().toISOString() };
  } catch (err) {
    console.error(`[daily-briefs] WARN ${row.id}: ${err.message}`);
    return null;
  }
}

const added = [];
for (const source of sources) {
  added.push({ ...source, published, judgment: await judgeRow(source) });
}
const judged = added.filter((row) => row.judgment).length;

// 历史遗留的空判定（某轮 API 故障留下的）不会自己恢复，这里每轮少量回填。
// 不设上限的话，一次积压几十条会把同一轮的额度和耗时打满。
const BACKFILL_LIMIT = Number(process.env.BRIEFS_BACKFILL ?? 5);
const backfilled = await backfillJudgments(existing, { limit: BACKFILL_LIMIT, judge: judgeRow });

let accuracy = null;
if (sources.length) {
  // 没有 key 时脚本按设计只发语料、不写判定，此时不套用准入门槛；
  // 配了 key 却一篇都没判出来，说明判定链路坏了，整批不写。
  const verdict = checkJudgedBatch(added, {
    minAccuracy: MIN_ACCURACY,
    expectJudgment: !missingKey,
  });
  accuracy = verdict.accuracy;
  if (!verdict.pass) {
    const why = verdict.reason === 'no-judgment'
      ? '本轮没有任何一条判定成功（判定链路异常）'
      : `本轮判定准确率 ${(accuracy * 100).toFixed(1)}% 低于 ${(MIN_ACCURACY * 100).toFixed(0)}%`;
    console.error(`[daily-briefs] WARN ${why}，${added.length} 篇不写入`);
    console.log(JSON.stringify({ added: 0, backfilled: 0, total: existing.length, judged, accuracy }));
    process.exit(1);
  }
}

if (!added.length && !backfilled) {
  console.log(JSON.stringify({ added: 0, backfilled: 0, total: existing.length, judged: 0 }));
  process.exit(0);
}

writeFileSync(OUT, `${JSON.stringify(existing.concat(added), null, 2)}\n`);
console.log(JSON.stringify({ added: added.length, backfilled, total: existing.length + added.length, judged, accuracy }));
if (added.length && added.length < LIMIT) {
  console.error(`[daily-briefs] WARN 本轮只有 ${added.length} 篇，语料里没剩下更多合格条目`);
}
