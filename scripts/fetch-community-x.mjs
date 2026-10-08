#!/usr/bin/env node
/**
 * 社区脉搏刷新：更新已有推文的 views/likes，并按上限补入 X 近期相关推文。
 *
 * 用法：node scripts/fetch-community-x.mjs [--check]
 *   --check 只输出 JSON，不写文件
 *
 * Token：X_BEARER_TOKEN，否则 .pipeline/x_token.txt（gitignored）。不要打印 token。
 *
 * 新推文：GET /2/tweets/search/recent。有 CLAVUE_API_KEYS 时逐条问是否与
 * Jev / TypeSafe / clavue / noul 相关；没有判定 key 时只刷新指标、不写入新推文。
 * 搜索 400/403 只告警，已有指标仍会刷新。单轮最多新增 8 条，不删除已下线的旧推文。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  applyMetrics,
  extractIds,
  insertEntries,
  mergeTweets,
  metricsOf,
  tweetsFromSearch,
} from './lib/community-x.mjs';

const SRC = 'src/data/community.ts';
const SEARCH_QUERY = '(Jev OR jev) (TypeSafe OR typesafe OR clavue OR noul) -is:retweet';
const NEW_CAP = 8;

function loadToken() {
  if (process.env.X_BEARER_TOKEN) return process.env.X_BEARER_TOKEN.trim();
  const file = '.pipeline/x_token.txt';
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  return '';
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function xGet(token, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'jevcode-pipeline' },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 180) }; }
  return { status: res.status, body, remaining: res.headers.get('x-rate-limit-remaining') };
}

async function relevantByClavue(tweet, key) {
  const url = process.env.CLAVUE_URL ?? 'https://api.clavue.com/v1/judge';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Is this post about Jev, TypeSafe, clavue, or noul?',
      context: String(tweet.text ?? '').slice(0, 500),
      choices: ['no', 'yes'],
    }),
  });
  if (!res.ok) return { status: res.status, ok: false };
  const body = await res.json();
  const yes = body.probabilities?.yes ?? (body.choice === 'yes' ? 1 : 0);
  return { status: 200, ok: yes >= 0.5 };
}

async function relevantByTypesafe(tweet) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) return { status: 0, ok: false };
  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: String(tweet.text ?? '').slice(0, 500),
      model: process.env.TYPESAFE_MODEL || 'jev-latest',
      questions: {
        about: {
          type: 'choice',
          instructions: 'Is this post about Jev, TypeSafe, clavue, or noul?',
          criteria: {
            yes: 'The post is about Jev, TypeSafe, clavue, or noul',
            no: 'The post is about something else',
          },
        },
      },
    }),
  });
  if (!res.ok) return { status: res.status, ok: false };
  const body = await res.json();
  return { status: 200, ok: body.answers?.about?.choice === 'yes' };
}

/** 有判定才放行。clavue key 被拒绝时改用已配置的 TypeSafe，仍不写入未判定推文。 */
async function keepRelevant(tweets) {
  const keys = (process.env.CLAVUE_API_KEYS ?? '').split(',').map((key) => key.trim()).filter(Boolean);
  if (!keys.length && !process.env.TYPESAFE_API_KEY) {
    return { kept: [], warn: 'no judge key; refreshed metrics only, new posts not added' };
  }
  const kept = [];
  let warn = null;
  let useTypesafe = keys.length === 0;
  for (const tweet of tweets) {
    if (kept.length >= NEW_CAP) break;
    let result;
    if (!useTypesafe) {
      result = await relevantByClavue(tweet, keys[0]);
      if (result.status === 401 && process.env.TYPESAFE_API_KEY) {
        useTypesafe = true;
        warn = 'clavue judge 401; gated new posts with TypeSafe';
        result = await relevantByTypesafe(tweet);
      }
    } else {
      result = await relevantByTypesafe(tweet);
    }
    if (result.status !== 200) {
      return { kept, warn: warn ?? `judge HTTP ${result.status || 'unavailable'}; stopped adding new posts` };
    }
    if (result.ok) kept.push(tweet);
  }
  return { kept, warn };
}

export async function refreshCommunity({ token, check = false, src = readFileSync(SRC, 'utf8') } = {}) {
  const report = {
    tweet_count: 0,
    metrics_updated: 0,
    added: 0,
    warn: null,
    wrote: false,
  };
  if (!token) {
    report.warn = 'missing X bearer token';
    return report;
  }
  const ids = extractIds(src);
  const uniqueIds = [...new Set(ids)];
  report.tweet_count = uniqueIds.length;
  if (uniqueIds.length !== ids.length) {
    report.warn = 'duplicate ids in community.ts';
    return report;
  }

  const fresh = [];
  for (const chunk of chunks(uniqueIds, 100)) {
    const url = `https://api.twitter.com/2/tweets?ids=${chunk.join(',')}&tweet.fields=public_metrics`;
    const res = await xGet(token, url);
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 400) {
      report.warn = `metrics HTTP ${res.status}`;
      return report;
    }
    for (const tweet of res.body?.data ?? []) {
      const metrics = metricsOf(tweet.public_metrics);
      if (metrics.views === undefined || metrics.likes === undefined) continue;
      fresh.push({ id: String(tweet.id), views: metrics.views, likes: metrics.likes });
    }
  }

  let next = applyMetrics(src, fresh);
  report.metrics_updated = fresh.filter((row) => {
    const before = src.match(new RegExp(`id: "${row.id}",[\\s\\S]*?\\n    views: (\\d+),\\s*\\n    likes: (\\d+),`));
    return before && (Number(before[1]) !== row.views || Number(before[2]) !== row.likes);
  }).length;

  const params = new URLSearchParams({
    query: SEARCH_QUERY,
    max_results: '10',
    'tweet.fields': 'created_at,public_metrics',
    expansions: 'author_id',
    'user.fields': 'name,username',
  });
  const search = await xGet(token, `https://api.twitter.com/2/tweets/search/recent?${params}`);
  let incoming = [];
  if (search.status === 400 || search.status === 403 || search.status >= 400) {
    report.warn = `search HTTP ${search.status}; metrics still applied`;
  } else {
    const gated = await keepRelevant(tweetsFromSearch(search.body));
    incoming = mergeTweets(extractIds(next), gated.kept, NEW_CAP);
    if (gated.warn) report.warn = gated.warn;
  }
  if (incoming.length) {
    next = insertEntries(next, incoming);
    report.added = incoming.length;
  }
  report.wrote = next !== src;
  if (report.wrote && !check) writeFileSync(SRC, next);
  return report;
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const token = loadToken();
  const report = await refreshCommunity({
    token,
    check: process.argv.includes('--check'),
  });
  console.log(JSON.stringify(report));
  if (!token || report.warn === 'missing X bearer token' || report.warn === 'duplicate ids in community.ts' || /^metrics HTTP /.test(report.warn ?? '')) {
    process.exit(1);
  }
}
