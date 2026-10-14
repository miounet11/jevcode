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
import { nextBriefSources } from './lib/daily-briefs.mjs';

const COVERAGE = 'data/coverage-cases.json';
const OUT = 'src/data/daily-briefs.json';
const LIMIT = Number(process.env.DAILY_BRIEFS ?? 50);

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
if (!sources.length) {
  console.log(JSON.stringify({ added: 0, total: existing.length, judged: 0 }));
  process.exit(0);
}

const published = new Date().toISOString().slice(0, 10);
let judged = 0;
let missingKey = false;
const added = [];
for (const source of sources) {
  let judgment = null;
  if (!missingKey) {
    try {
      const result = await judgeOne(source);
      if (result.missingKey) {
        missingKey = true;
        console.error('[daily-briefs] WARN 无 CLAVUE_API_KEYS，本轮只发语料，不写调用结果');
      } else if (result.choice && source.choices.includes(result.choice)) {
        judgment = {
          ok: true,
          choice: result.choice,
          model: result.model,
          ts: new Date().toISOString(),
        };
        judged += 1;
      }
    } catch (err) {
      console.error(`[daily-briefs] WARN ${source.id}: ${err.message}`);
    }
  }
  added.push({ ...source, published, judgment });
}

writeFileSync(OUT, `${JSON.stringify(existing.concat(added), null, 2)}\n`);
console.log(JSON.stringify({ added: added.length, total: existing.length + added.length, judged }));
if (added.length < LIMIT) {
  console.error(`[daily-briefs] WARN 本轮只有 ${added.length} 篇，语料里没剩下更多合格条目`);
}
