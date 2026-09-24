#!/usr/bin/env node
/**
 * 采集 jev.openchamber.dev 公开 cards.json，只当候选 id 来源。
 *
 * 这不是本站产出，也不参与页面渲染：build-jev-cards.mjs 读它取候选 id，
 * 再用公开原文和 Jev 重新判定，产出本站自己的 data/builds/cards.json。
 * 只保留公开字段的 id 与少量元数据，丢弃头像、视频、互动数。
 * 输出写到 data/builds/candidates.json（已 gitignore），不进 public/。
 *
 * 用法：node scripts/fetch-jev-builds.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://jev.openchamber.dev/data/cards.json';
// 候选清单不回进 public/：镜像不是本站产出，也不该被部署。
// 它只用来给 build-jev-cards.mjs 提供候选 id。
const OUT = new URL('../data/builds/candidates.json', import.meta.url);

const response = await fetch(SOURCE, { headers: { 'user-agent': 'jevcode-builds-mirror' } });
if (!response.ok) {
  throw new Error(`fetch ${SOURCE} failed: ${response.status}`);
}
const payload = await response.json();
const sourceCards = Array.isArray(payload.cards) ? payload.cards : [];

/**
 * 按码点截断。按 UTF-16 下标切会从 emoji 中间切开，留下孤立代理项，
 * JSON.stringify 写出 \ud83d 这种半对转义，vite 的 JSON 解析器会拒绝，构建即失败。
 */
const cut = (value, limit) => Array.from(String(value ?? '')).slice(0, limit).join('');

const cards = [];
for (const card of sourceCards) {
  const url = typeof card.url === 'string' ? card.url : '';
  if (!url.startsWith('https://x.com/')) continue;
  const art = card.art && typeof card.art === 'object' ? card.art : {};
  const link = typeof art.u === 'string' && art.u.startsWith('http') ? art.u : '';
  const title = cut(String(card.t ?? '').replace(/\s+/g, ' ').trim(), 140);
  const flat = String(card.x ?? '').replace(/\s+/g, ' ').trim();
  const excerpt = Array.from(flat).length > 180 ? `${cut(flat, 177).trimEnd()}…` : flat;
  if (!title || !excerpt) continue;
  cards.push({
    id: String(card.id ?? ''),
    sn: cut(card.sn, 40),
    name: cut(card.name, 80),
    t: title,
    x: excerpt,
    cat: String(card.cat ?? ''),
    u: String(card.u ?? ''),
    lang: String(card.lang ?? ''),
    d: String(card.d ?? ''),
    url,
    link,
  });
}

if (cards.length < 1000) {
  throw new Error(`refusing to write a short snapshot: ${cards.length} cards`);
}

const count = (key) => {
  const totals = new Map();
  for (const card of cards) totals.set(card[key], (totals.get(card[key]) ?? 0) + 1);
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
};

const out = {
  source: SOURCE,
  updated: payload.meta?.updated ?? '',
  analysed: payload.meta?.analysed ?? 0,
  authors: payload.meta?.authors ?? 0,
  repos: payload.meta?.repos ?? 0,
  total: cards.length,
  categories: count('cat'),
  usecases: count('u'),
  cards,
};

mkdirSync(new URL('../data/builds/', import.meta.url), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`wrote ${cards.length} candidate ids to data/builds/candidates.json`);
