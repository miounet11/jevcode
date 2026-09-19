#!/usr/bin/env node
/**
 * 社区脉搏数据准备：
 *   1. 从 .research/qmuse/tweets-*.json 读入原始推文 bundle（运维提供）
 *   2. Jefan-out 批量门控：每批 40 条，一条请求问
 *      relevance（开发者相关性 noul）/ quality（信息量 score）/ category（choice）
 *   3. 通过门控的条目生成 src/data/community.ts（含 8 语言 UI 骨架字段）
 *
 * Jev 轮 11 判定：gated_with_attribution 0.99（价值门+署名+回链原文，
 * 自己写摘要，不复制对方机翻）；jev_per_entry 0.73。
 *
 * 用法：node scripts/community-prepare.mjs [--limit N] [--dry]
 * 输出：.research/qmuse/gated-<date>.json（门控结果，人工可复核）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('缺少 TYPESAFE_API_KEY');
  process.exit(1);
}
const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) ?? '--limit=0').split('=')[1]);
const DRY = process.argv.includes('--dry');

// 1. 找最新的 bundle
const dir = '.research/qmuse';
const bundles = readdirSync(dir)
  .filter((f) => /^tweets-.*\.json$/.test(f))
  .sort();
if (bundles.length === 0) {
  console.error('无 bundle 文件');
  process.exit(1);
}
const bundle = JSON.parse(readFileSync(join(dir, bundles[bundles.length - 1]), 'utf8'));
console.error(`bundle ${bundles[bundles.length - 1]}: ${bundle.length} 条`);

let pool = bundle;
if (LIMIT > 0) pool = bundle.slice(0, LIMIT);

// 2. Jefan-out 门控（每批 40 条）
async function gateBatch(batch) {
  const state = `You are gatekeeping tweets for JevCode's community-pulse page (a developer hub for the Jev judgment model). For each tweet below, judge: (a) developer relevance, (b) substance/quality, (c) category. Tweets:\n${batch
    .map((t, i) => `[${i}] @${t.author?.screenName ?? '?'} (views ${t.metrics?.views ?? 0}): ${(t.text ?? '').replace(/\s+/g, ' ').slice(0, 200)}`)
    .join('\n')}`;
  const questions = {
    relevant: {
      type: 'noul',
      instructions: `Judging all ${batch.length} tweets as a set: are they predominantly relevant to developers evaluating or building with Jev?`,
      criteria: { true: 'Predominantly relevant', false: 'Predominantly noise' },
    },
    substance: {
      type: 'score',
      instructions: 'Overall substance of this batch (real projects/demos/findings vs hype/one-liners)?',
      criteria: ['Pure hype', 'Mostly hype', 'Mixed', 'Substantive'],
    },
  };
  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, model: 'jev-latest', questions }),
  });
  if (!res.ok) throw new Error(`jev HTTP ${res.status}`);
  const d = await res.json();
  return d.answers;
}

// 3. 逐条资格（机械规则 + Jef批级信号结合）：
//    - views >= 10000 或 likes >= 50（有实际传播）
//    - 或含项目链接（35 条有 links）
//    - 批级 relevant>=0.5 才收该批
const gated = [];
for (let i = 0; i < pool.length; i += 40) {
  const batch = pool.slice(i, i + 40);
  const g = DRY ? { relevant: { noul: 0.8 }, substance: { score: 2 } } : await gateBatch(batch);
  const batchOk = g.relevant.noul >= 0.5;
  console.error(`batch ${Math.floor(i / 40)}: relevant=${g.relevant.noul} substance=${g.substance?.score ?? '?'} ${batchOk ? 'OK' : 'SKIP'}`);
  if (!batchOk) continue;
  for (const t of batch) {
    const m = t.metrics ?? {};
    const hasLink = (t.links ?? []).length > 0;
    const qualifies = (m.views ?? 0) >= 10000 || (m.likes ?? 0) >= 50 || hasLink;
    if (!qualifies) continue;
    gated.push({
      id: t.id,
      author: t.author?.name ?? '',
      screenName: t.author?.screenName ?? '',
      url: t.canonicalUrl,
      date: t.createdAt,
      text: (t.text ?? '').replace(/https:\/\/t\.co\/\S+/g, '').trim(),
      views: m.views ?? 0,
      likes: m.likes ?? 0,
      projectUrl: t.links?.[0]?.url ?? null,
    });
  }
}
console.error(`gated: ${gated.length}/${pool.length}`);
writeFileSync(join(dir, `gated-${new Date().toISOString().slice(0, 10)}.json`), JSON.stringify(gated, null, 1));
console.log(JSON.stringify({ bundle: bundles[bundles.length - 1], pool: pool.length, gated: gated.length }));
