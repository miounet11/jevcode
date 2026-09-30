/** 把一道选择题同时送给 clavue-jev 和 jev-1.13.0。密钥只留在服务端。 */

import { appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const OURS = 'clavue-jev';
export const PEER = 'jev-1.13.0';

let caseIndex = {};
try {
  caseIndex = JSON.parse(readFileSync(new URL('./case-index.json', import.meta.url), 'utf8'));
} catch {
  caseIndex = {};
}

export const COMPARE_MAX = 8;

const ID_RE = /^[a-z0-9][a-z0-9_-]{0,48}$/;

export function cleanCompareItems(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > COMPARE_MAX) return null;
  const items = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null;
    const id = String(raw.id || '');
    const context = String(raw.context || '').trim().slice(0, 2000);
    const question = String(raw.question || '').trim().slice(0, 400);
    const choices = Array.isArray(raw.choices)
      ? raw.choices.map((choice) => String(choice).trim().slice(0, 80)).filter(Boolean).slice(0, 12)
      : [];
    if (!ID_RE.test(id) || context.length < 8 || question.length < 8) return null;
    if (choices.length < 2 || choices.length > 12 || new Set(choices).size !== choices.length) return null;
    items.push({ id, context, question, choices });
  }
  return items;
}

function pickProbs(choices, raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const choice of choices) {
    const value = Number(raw[choice]);
    if (Number.isFinite(value)) out[choice] = Math.round(value * 10000) / 10000;
  }
  return out;
}

export function readOmniRow(row, choices, ms) {
  if (!row || typeof row.choice !== 'string') {
    return { ok: false, model: OURS, error: 'bad_response', ms };
  }
  return {
    ok: true,
    model: OURS,
    choice: row.choice,
    probabilities: pickProbs(choices, row.probabilities),
    ms,
  };
}

export function readOfficial(payload, choices, ms) {
  const answers = payload && payload.answers;
  const answer = answers && (answers.pick || Object.values(answers)[0]);
  if (!answer || typeof answer.choice !== 'string') {
    return { ok: false, model: PEER, error: 'bad_response', ms };
  }
  const distribution = answer.probabilities && typeof answer.probabilities === 'object'
    ? answer.probabilities
    : (answer.confidence && typeof answer.confidence === 'object' ? answer.confidence : {});
  return {
    ok: true,
    model: PEER,
    choice: answer.choice,
    probabilities: pickProbs(choices, distribution),
    ms,
  };
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

export async function runCompare(items, deps) {
  const fetchImpl = deps.fetchImpl;
  const timeoutMs = deps.timeoutMs || 40_000;
  const oursPromise = (async () => {
    const started = Date.now();
    try {
      const response = await fetchImpl(deps.omniUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rows: items.map((item) => ({
            question: item.question,
            context: item.context,
            choices: item.choices,
          })),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const payload = await readJson(response);
      const ms = Number(payload.ms) || Date.now() - started;
      if (!response.ok || !Array.isArray(payload.rows) || payload.rows.length !== items.length) {
        const error = payload.error || `HTTP ${response.status}`;
        return items.map(() => ({ ok: false, model: OURS, error: String(error).slice(0, 180), ms }));
      }
      return items.map((item, index) => readOmniRow(payload.rows[index], item.choices, ms));
    } catch (err) {
      const ms = Date.now() - started;
      return items.map(() => ({
        ok: false,
        model: OURS,
        error: String(err && err.name === 'TimeoutError' ? 'timeout' : 'unreachable').slice(0, 180),
        ms,
      }));
    }
  })();

  const officialPromise = Promise.all(items.map(async (item) => {
    const started = Date.now();
    if (!deps.officialKey) {
      return { ok: false, model: PEER, error: 'not_configured', ms: 0 };
    }
    try {
      const response = await fetchImpl(deps.officialUrl, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${deps.officialKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: deps.officialModel || 'jev-latest',
          state: item.context,
          questions: {
            pick: {
              type: 'choice',
              instructions: item.question,
              criteria: Object.fromEntries(item.choices.map((choice) => [choice, choice])),
            },
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const payload = await readJson(response);
      const ms = Date.now() - started;
      if (!response.ok) {
        const detail = payload.detail || payload.error || payload.message || '';
        const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
        return { ok: false, model: PEER, error: `HTTP ${response.status} ${text}`.slice(0, 180), ms };
      }
      return readOfficial(payload, item.choices, ms);
    } catch (err) {
      return {
        ok: false,
        model: PEER,
        error: err && err.name === 'TimeoutError' ? 'timeout' : 'unreachable',
        ms: Date.now() - started,
      };
    }
  }));

  const [ours, official] = await Promise.all([oursPromise, officialPromise]);
  return items.map((item, index) => ({ id: item.id, ours: ours[index], official: official[index] }));
}

function slim(side) {
  if (!side?.ok) return { ok: false, ms: Number(side?.ms) || 0, error: String(side?.error || 'error').slice(0, 80) };
  const probability = side.probabilities?.[side.choice];
  return {
    ok: true,
    choice: side.choice,
    ms: Number(side.ms) || 0,
    p: typeof probability === 'number' ? probability : null,
  };
}

function sentence(name, side, hit, zh) {
  if (!side?.ok) return zh ? `${name} 这次没有给出选择` : `${name} did not answer`;
  const pct = typeof side.p === 'number' ? (zh ? `，把握 ${Math.round(side.p * 100)}%` : `, ${Math.round(side.p * 100)}%`) : '';
  const mark = hit == null ? '' : hit ? (zh ? '，命中' : ', hit') : (zh ? '，未命中' : ', miss');
  const ms = Math.round(side.ms);
  return zh
    ? `${name} 用 ${ms} 毫秒选择了「${side.choice}」${pct}${mark}`
    : `${name} chose “${side.choice}” in ${ms} ms${pct}${mark}`;
}

export function narrate(entry) {
  const agree = entry.ours?.ok && entry.peer?.ok
    ? (entry.ours.choice === entry.peer.choice
      ? { zh: '两边一致。', en: 'They agree.' }
      : { zh: '两边不一致。', en: 'They disagree.' })
    : { zh: '', en: '' };
  return {
    zh: `${entry.title}。${sentence(OURS, entry.ours, entry.oursHit, true)}。${sentence(PEER, entry.peer, entry.peerHit, true)}。${agree.zh}`.trim(),
    en: `${entry.title}. ${sentence(OURS, entry.ours, entry.oursHit, false)}. ${sentence(PEER, entry.peer, entry.peerHit, false)}. ${agree.en}`.trim(),
  };
}

export function buildRecord(item, result) {
  const known = caseIndex[item.id];
  const entry = {
    ts: new Date().toISOString(),
    id: item.id,
    title: known?.title || (item.id === 'match3-live' ? '消消乐现场' : item.id),
    ours: slim(result.ours),
    peer: slim(result.official),
    oursHit: null,
    peerHit: null,
  };
  if (known && entry.ours.ok) entry.oursHit = known.accept.includes(entry.ours.choice);
  if (known && entry.peer.ok) entry.peerHit = known.accept.includes(entry.peer.choice);
  entry.narration = narrate(entry);
  return entry;
}

export async function appendRecords(logPath, records) {
  if (!records.length) return;
  await mkdir(path.dirname(logPath), { recursive: true });
  await appendFile(logPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
  const info = await stat(logPath);
  if (info.size < 400_000) return;
  const raw = await readFile(logPath, 'utf8');
  const kept = raw.trim().split('\n').filter(Boolean).slice(-300);
  await writeFile(logPath, `${kept.join('\n')}\n`);
}

export async function readRecent(logPath, limit) {
  try {
    const raw = await readFile(logPath, 'utf8');
    return raw.trim().split('\n').filter(Boolean).slice(-limit).reverse().flatMap((line) => {
      try {
        const entry = JSON.parse(line);
        return entry?.narration ? [entry] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
