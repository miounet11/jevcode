#!/usr/bin/env node
/**
 * 自建 Jev 动态卡片。
 *
 * 源头是公开帖子原文，不是 jev.openchamber.dev 的成品分类。
 * 1. 从既有 id 清单或 --ids 取帖子 id。
 * 2. 用 syndication 拉原文、作者、时间和语言。
 * 3. 用 Jev 一次判定：是否在展示用 Jev 做出的东西、标题、分类、用途。
 *    标题必须是原文里的连续摘录，对不上就丢弃。
 *
 * 用法：
 *   node scripts/build-jev-cards.mjs --limit 5
 *   node scripts/build-jev-cards.mjs --ids 2102850740527964492,2102578703666413804
 *
 * 需要 TYPESAFE_API_KEY。原始帖子写到 data/builds/raw/，判定写到 data/builds/cards.json。
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('缺少 TYPESAFE_API_KEY');
  process.exit(1);
}

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const [key, inline] = argv[i].replace(/^--/, '').split('=');
  const value = inline ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
  args[key] = value;
}
const limit = Number(args.limit ?? 5);
if (!Number.isInteger(limit) || limit < 1) {
  console.error('--limit 必须是正整数');
  process.exit(1);
}
const rawDir = new URL('../data/builds/raw/', import.meta.url);
const outFile = new URL('../data/builds/cards.json', import.meta.url);
// 页面在浏览器里按需取这份，只含通过判定的卡片。卡片详情留在 data/builds/。
const publicFile = new URL('../public/data/jev-cards.json', import.meta.url);
mkdirSync(rawDir, { recursive: true });

const CATEGORIES = [
  'Research & data',
  'Dev tools',
  'Games & real time',
  'Tools & apps',
  'Content & growth',
  'Triage & routing',
  'Safety & moderation',
  'Agents & browsers',
  'Trading & markets',
  'Ops & infrastructure',
];
const USES = [
  'Code generation',
  'Research assistant',
  'Game logic',
  'Content drafting',
  'Support triage',
  'Moderation',
  'Browser control',
  'Market analysis',
  'Data extraction',
  'Other',
];

function idsFromCandidates() {
  if (args.ids) return String(args.ids).split(',').map((id) => id.trim()).filter(Boolean);
  const file = new URL('../data/builds/candidates.json', import.meta.url);
  if (!existsSync(file)) {
    throw new Error('缺少 data/builds/candidates.json，先跑 node scripts/fetch-jev-builds.mjs');
  }
  return JSON.parse(readFileSync(file, 'utf8')).cards.map((card) => card.id);
}

/**
 * 原文里的 &amp; / &gt; 等实体先解码，否则标题既难看，也对不上原文。
 * 落盘存的也是解码后的文本，保证「判定所用文本」与「存档文本」是同一份，
 * 卡片标题可以直接在存档里逐字对上。
 */
function withDecodedText(tweet) {
  return { ...tweet, text: decodeEntities(tweet.text) };
}

async function fetchTweet(id) {
  const file = new URL(`${id}.json`, rawDir);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const response = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=0`, {
    headers: { 'user-agent': 'jevcode-source' },
  });
  if (!response.ok) throw new Error(`tweet ${id} HTTP ${response.status}`);
  const tweet = withDecodedText(await response.json());
  writeFileSync(file, JSON.stringify(tweet));
  return tweet;
}

async function judge(tweet) {
  const text = String(tweet.text ?? '').trim();
  // 帖子长度差异大；窗口太短会让长帖的标题行落在窗口之外，被判成 none。
  const state = text.slice(0, 1800);
  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      state,
      model: 'jev-latest',
      questions: {
        artifact: {
          type: 'noul',
          instructions: 'Does the author present an artifact of their own in this post?',
          criteria: {
            true: 'The post names or links the author\'s own product, tool, demo, repo, or measured result.',
            false: 'The post is only a reaction, quote, or news item without the author\'s own artifact.',
          },
        },
        uses_jev: {
          type: 'noul',
          instructions: 'Does that artifact use Jev or System One?',
          criteria: {
            true: 'The post says the artifact is powered by, built with, or measured on Jev or System One.',
            false: 'Jev is absent, or it is only the topic of discussion rather than a component of the artifact.',
          },
        },
        title: {
          type: 'choice',
          instructions: 'Which line is a verbatim excerpt that states what was built? Choose none if no such excerpt exists.',
          criteria: Object.fromEntries([...new Set(state.split('\n').map((line) => line.trim()).filter((line) => line.length >= 8 && line.length <= 140)), 'none'].map((line) => [line, null])),
        },
        category: {
          type: 'choice',
          instructions: 'Which category best fits the thing being shown?',
          criteria: Object.fromEntries(CATEGORIES.map((item) => [item, null])),
        },
        usecase: {
          type: 'choice',
          instructions: 'Which use fits the thing being shown?',
          criteria: Object.fromEntries(USES.map((item) => [item, null])),
        },
      },
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`jev HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(value) {
  return String(value ?? '').replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    }
    return Object.hasOwn(NAMED, code.toLowerCase()) ? NAMED[code.toLowerCase()] : match;
  });
}

/**
 * 切字符串必须按码点，不能按 UTF-16 下标：emoji 是两个码元，
 * 从中间切开会留下孤立代理项，JSON.stringify 会写成 \ud83d 这种半对转义，
 * vite 的 JSON 解析器会直接拒绝，构建就挂了。
 */
function slicePoints(value, limit) {
  return Array.from(String(value ?? '')).slice(0, limit).join('');
}

/** 兜底：清掉任何残留的孤立代理项。 */
function stripLoneSurrogates(value) {
  return String(value ?? '').replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    '',
  );
}

function excerpt(text, title) {
  const flat = stripLoneSurrogates(text.replace(/\s+/g, ' ').trim());
  const at = title && title !== 'none' ? flat.toLowerCase().indexOf(title.toLowerCase()) : -1;
  const start = at >= 0 ? at : 0;
  const slice = slicePoints(flat.slice(start), 180);
  return slice.length < flat.length - start ? `${slice.trimEnd()}…` : slice;
}

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
function dateOnly(createdAt) {
  const value = String(createdAt ?? '');
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const [, month, day, , year] = value.split(' ');
  if (!MONTHS[month] || !day || !year) return '';
  return `${year}-${MONTHS[month]}-${day.padStart(2, '0')}`;
}

const existing = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : { cards: [] };
if (!Array.isArray(existing.rejected)) existing.rejected = [];
const seen = new Set([
  ...existing.cards.map((card) => card.id),
  ...existing.rejected.map((card) => card.id),
]);
const ids = idsFromCandidates().filter((id) => !seen.has(id)).slice(0, limit);

for (const id of ids) {
  let tweet;
  let judged;
  try {
    tweet = await fetchTweet(id);
    judged = await judge(tweet);
  } catch (error) {
    console.log(`error ${id} ${error.message}`);
    process.exitCode = 1;
    break;
  }
  const answers = judged.answers ?? {};
  const artifact = Number(answers.artifact?.noul ?? 0);
  const usesJev = Number(answers.uses_jev?.noul ?? 0);
  const isBuild = artifact >= 0.8 && usesJev >= 0.8;
  const title = answers.title?.choice ?? 'none';
  const text = String(tweet.text ?? '');
  // 句子太短（如 "I created a"）不是可用的标题，即使出现在原文里也丢弃。
  const titleInText = title !== 'none' && title.trim().length >= 16 && text.toLowerCase().includes(title.toLowerCase());
  const cardDate = dateOnly(tweet.created_at);
  if (!isBuild || !titleInText || !cardDate) {
    existing.rejected.push({
      id,
      artifact,
      uses_jev: usesJev,
      title,
      title_in_text: titleInText,
      date: cardDate,
    });
    console.log(`skip ${id} artifact=${artifact.toFixed(3)} uses_jev=${usesJev.toFixed(3)} title_in_text=${titleInText} date=${cardDate || 'missing'}`);
    continue;
  }
  existing.cards.push({
    id,
    sn: tweet.user?.screen_name ?? '',
    name: tweet.user?.name ?? '',
    t: title,
    x: excerpt(text, title),
    cat: answers.category?.choice ?? '',
    u: answers.usecase?.choice ?? '',
    lang: tweet.lang ?? '',
    d: cardDate,
    url: `https://x.com/${tweet.user?.screen_name ?? 'i'}/status/${id}`,
    source: 'syndication+jev',
  });
  console.log(`keep ${id} ${title}`);
}

existing.updated = new Date().toISOString();
existing.total = existing.cards.length;
writeFileSync(outFile, JSON.stringify(existing, null, 2));

const count = (key) => {
  const totals = new Map();
  for (const card of existing.cards) totals.set(card[key], (totals.get(card[key]) ?? 0) + 1);
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
};
writeFileSync(publicFile, JSON.stringify({
  source: 'syndication + Jev judgment',
  updated: existing.updated,
  total: existing.total,
  authors: new Set(existing.cards.map((card) => card.sn)).size,
  categories: count('cat'),
  usecases: count('u'),
  cards: existing.cards,
}));
console.log(`cards ${existing.total}`);
