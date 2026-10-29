/**
 * 生成「README 自述」类覆盖条目。
 *
 * 这批条目的证据强度只有 readme-claim：上游 README 自己说用了 Jev / TypeSafe，
 * 但没有核到调用点。因此断言只复述证据行原文，不替上游判断它真的接进去了。
 *
 * 生成流程会逐条回源核对：抓取 raw 文件，确认 #Lnn 行仍存在且文本仍包含
 * jev/typesafe 关键词，核对不通过的不写入。产物是受版本控制的 TS 文件，
 * 由 npm run jev:check 在 CI 里再次独立复核。
 *
 * 用法：node scripts/gen-jev-claims.mjs
 */

import { writeFileSync } from 'node:fs';

const SHORTLIST = '/tmp/jev-shortlist.json';
const OUT = 'src/lib/content/registry-claims.ts';

const KEY = /\b(typesafe|jev)\b/i;
const NEG = /not affiliated|unaffiliated|independent project|no relation|unrelated|instead of|without jev|alternative to/i;

function slugify(repo) {
  return repo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 只做能由证据行本身支撑的分类；判不出来就归 other-list，
 * 不再把未识别的内容塞进 application（那会让该分类失去意义）。
 */
function categoryOf(text) {
  const t = text.toLowerCase();
  if (/sdk\b|client library|client for|library for|rest client/.test(t)) return 'sdk-client';
  if (/plugin|claude code|coding agent|mcp server|agent skill/.test(t)) return 'agent-tooling';
  if (/spring|django|rails|next\.?js|nuxt|fastapi|langchain/.test(t)) return 'framework-integration';
  if (/benchmark|evaluation|paper|dataset|ablation/.test(t)) return 'benchmark-research';
  if (/playground|demo site|sandbox/.test(t)) return 'demo-playground';
  if (/local implementation|self-host|open-source implementation|reimplements?/.test(t)) return 'jev-like-model';
  if (/game|simulation|emulator/.test(t)) return 'game-simulation';
  if (/browser|computer use|android|desktop automation/.test(t)) return 'browser-computer-use';
  if (/list of|awesome|collection of/.test(t)) return 'other-list';
  // application 也必须是正向判据命中的结果，不能当兜底。
  if (/\bapp\b|application|dashboard|web app|cli tool|service for|\btool for\b/.test(t)) {
    return 'application';
  }
  return 'other-list';
}

/** 证据行里去掉 Markdown/HTML 装饰，留可读的陈述。 */
function clean(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/^[-*>#\d.\s]+/, '')
    .replace(/\*\*|`|__/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function verify(item) {
  const url = `https://raw.githubusercontent.com/${item.repo}/${item.branch}/${item.file}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let text;
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) return null;
      text = await res.text();
    } catch {
      if (attempt === 1) return null;
      continue;
    }

    const lines = text.split('\n');
    const at = lines[item.line - 1] ?? '';
    if (at.trim() === item.text.trim() && KEY.test(at) && !NEG.test(at)) return item;
    if (at.trim() !== item.text.trim()) {
      // 行号漂移：在全文里重新定位同一条陈述。
      const idx = lines.findIndex((l) => l.trim() === item.text.trim());
      if (idx >= 0 && KEY.test(lines[idx])) {
        return { ...item, line: idx + 1 };
      }
    }
    return null;
  }
  return null;
}

const { readFileSync } = await import('node:fs');
const shortlist = JSON.parse(readFileSync(SHORTLIST, 'utf8'));

const verified = [];
const queue = [...shortlist];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) continue;
      if (NEG.test(item.text)) continue;
      const ok = await verify(item);
      if (ok) verified.push(ok);
    }
  }),
);

verified.sort((a, b) => a.repo.localeCompare(b.repo));

const seen = new Set();
const rows = [];
for (const item of verified) {
  const slug = slugify(item.repo);
  if (!slug || seen.has(slug)) continue;
  seen.add(slug);
  const quote = clean(item.text).slice(0, 220);
  const [owner, name] = item.repo.split('/');
  rows.push({
    slug,
    name: `${owner}/${name}`,
    repoUrl: `https://github.com/${item.repo}`,
    quote,
    evidenceUrl: `https://github.com/${item.repo}/blob/${item.branch}/${item.file}#L${item.line}`,
    category: categoryOf(item.text),
  });
}

const body = rows
  .map(
    (r) => `  {
    slug: '${r.slug}',
    name: '${r.name.replace(/'/g, "\\'")}',
    repoUrl: '${r.repoUrl}',
    assertion: {
      zh: 'README 自述：${r.quote.replace(/'/g, "\\'")}',
      en: 'README states: ${r.quote.replace(/'/g, "\\'")}',
    },
    evidenceUrl: '${r.evidenceUrl}',
    verification: ['readme-claim'],
    category: '${r.category}',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },`,
  )
  .join('\n');

const output = `/**
 * 自动生成，请勿手改。重跑：node scripts/gen-jev-claims.mjs
 *
 * 这批条目全部只有 readme-claim 一级证据：上游 README 自述使用 Jev / TypeSafe，
 * 本仓库未核到调用点。断言是对证据行原文的复述，不额外推断。
 *
 * 生成时已逐条回源核对行号与文本；npm run jev:check 在 CI 中再次独立复核。
 * 证据升级（核到调用点）后应移入 registry.ts 并改标签。
 */
import type { CoverageEntry } from './registry';

const REVIEWED_AT = '2026-10-29';

export const CLAIM_ENTRIES: CoverageEntry[] = [
${body}
];
`;

writeFileSync(OUT, output);
console.log(`gen-jev-claims: 输入 ${shortlist.length} 条，核对通过 ${verified.length} 条，写入 ${rows.length} 条`);
