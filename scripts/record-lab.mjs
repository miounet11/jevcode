#!/usr/bin/env node
/**
 * 给还没有记录的实验室补充场景调用 clavue-jev，把选项写入
 * src/data/lab-records.json。失败只告警，退出码仍为 0，不挡住生态发布。
 * 不把这些请求打到公开 /api/compare。
 *
 * 用法：node scripts/record-lab.mjs
 * 需要 CLAVUE_API_KEYS（管线会先 source .env）。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SUPPLEMENT = 'src/data/lab-supplement.json';
const RECORDS = 'src/data/lab-records.json';

async function judgeViaClavue(scenario, key) {
  const question = scenario.questions?.answer;
  const url = process.env.CLAVUE_URL ?? 'https://api.clavue.com/v1/judge';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: question.instructions,
      context: scenario.state,
      choices: question.options,
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

async function judgeViaTypesafe(scenario) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) return { status: 0 };
  const question = scenario.questions?.answer;
  const criteria = {};
  for (const option of question.options ?? []) criteria[option] = option;
  const res = await fetch(process.env.TYPESAFE_SYSTEMONE_URL || 'https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: scenario.state,
      model: process.env.TYPESAFE_MODEL || 'jev-latest',
      questions: {
        answer: { type: 'choice', instructions: question.instructions, criteria },
      },
    }),
  });
  if (!res.ok) return { status: res.status };
  const body = await res.json();
  const choice = body.answers?.answer?.choice;
  return {
    status: 200,
    choice: typeof choice === 'string' ? choice : null,
    model: typeof body.model === 'string' ? body.model : 'jev-1.13.0',
  };
}

let warnedFallback = false;

async function judgeChoice(scenario) {
  const keys = (process.env.CLAVUE_API_KEYS ?? '').split(',').map((key) => key.trim()).filter(Boolean);
  if (keys.length) {
    const clavue = await judgeViaClavue(scenario, keys[0]);
    if (clavue.status === 200) return clavue;
    if (clavue.status !== 401) throw new Error(`clavue HTTP ${clavue.status}`);
    if (!warnedFallback) console.error('[lab-record] WARN clavue judge 401，改用 TypeSafe 记录');
  } else if (!warnedFallback) {
    console.error('[lab-record] WARN 无 CLAVUE_API_KEYS，改用 TypeSafe 记录');
  }
  warnedFallback = true;
  const typesafe = await judgeViaTypesafe(scenario);
  if (typesafe.status === 200) return typesafe;
  if (!keys.length && typesafe.status === 0) return { missingKey: true };
  throw new Error(`typesafe HTTP ${typesafe.status || 'unavailable'}`);
}

const supplement = existsSync(SUPPLEMENT) ? JSON.parse(readFileSync(SUPPLEMENT, 'utf8')) : [];
const records = existsSync(RECORDS) ? JSON.parse(readFileSync(RECORDS, 'utf8')) : [];
const recorded = new Set(records.map((row) => row.id));
const pending = supplement.filter((item) => item?.id && !recorded.has(item.id)).slice(0, 4);

if (!pending.length) {
  console.log(JSON.stringify({ recorded: 0, total: records.length }));
  process.exit(0);
}

let wrote = 0;
for (const scenario of pending) {
  try {
    const result = await judgeChoice(scenario);
    if (result.missingKey) {
      console.error('[lab-record] WARN 无 CLAVUE_API_KEYS，本轮不写记录');
      break;
    }
    records.push({
      id: scenario.id,
      ts: new Date().toISOString(),
      ok: Boolean(result.choice),
      choice: result.choice,
      model: result.model ?? null,
    });
    wrote += 1;
  } catch (err) {
    console.error(`[lab-record] WARN ${scenario.id}: ${err.message}`);
    records.push({
      id: scenario.id,
      ts: new Date().toISOString(),
      ok: false,
      choice: null,
    });
    wrote += 1;
  }
}

if (wrote) writeFileSync(RECORDS, `${JSON.stringify(records, null, 2)}\n`);
console.log(JSON.stringify({ recorded: wrote, total: records.length }));
