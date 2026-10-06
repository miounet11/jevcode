/**
 * 为 sitemap 注入 lastmod。
 *
 * 原理：@astrojs/sitemap 的 serialize(item) 逐条调用，item 只有 url。
 * 这里把 URL 映射回仓库源文件（content 文档 / i18n 文案 / data 数据 /
 * 页面模板），取 git 最后提交时间（比文件 mtime 可靠：checkout 会刷新 mtime）。
 * 映射不到的 URL 退回整个仓库最新提交时间——保证每个 URL 都有 lastmod。
 *
 * 用法：astro.config.mjs 里 sitemap({ serialize: lastmodSerialize })
 * 产物：sitemap-0.xml 每个条目带 <lastmod>，爬虫按此调度重爬。
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

/** 语言前缀集合，用于识别 URL 形态 */
const LANGS = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];

/** URL 路径 → 仓库源文件的映射规则（按顺序第一个命中生效） */
const ROUTES = [
  // 文档内容页：/{lang}/cases|concepts|patterns|primitives|sdk/<slug>/
  { re: /^\/([a-z]{2})?\/?(cases|concepts|patterns|primitives|sdk)\/([a-z0-9-]+)\/?$/, file: (m) => `src/content/docs/${m[1] || 'en'}/${m[2]}/${m[3]}.md` },
  // 各独立页面：/{lang}/<page>/
  { re: /^\/([a-z]{2})?\/?(compare|ecosystem|lab|map|playground|pricing|scenes|try|builds|api|community|introduction|quickstart)\/?$/, file: (m) => `src/pages/${m[1] ? `[lang]/${m[2]}.astro` : `${m[2]}.astro`}` },
  // 语言首页：/{lang}/
  { re: /^\/([a-z]{2})\/?$/, file: () => 'src/pages/[lang]/index.astro' },
];

const repoRoot = path.resolve(import.meta.dirname, '..');

/** git log 取某路径最后提交时间；从未提交过则返回 null */
function gitTime(relPath) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim() || null;
  } catch {
    return null;
  }
}

let repoLatest = null;
function repoLatestTime() {
  if (repoLatest === null) {
    repoLatest = gitTime('.') ?? new Date().toISOString();
  }
  return repoLatest;
}

const cache = new Map();
function lastmodFor(pathname) {
  if (cache.has(pathname)) return cache.get(pathname);
  let result = null;
  for (const { re, file } of ROUTES) {
    const m = pathname.match(re);
    if (m) {
      const f = file(m);
      result = gitTime(f);
      break;
    }
  }
  const value = result ?? repoLatestTime();
  cache.set(pathname, value);
  return value;
}

/** sitemap 插件的 serialize 钩子：item = { url, ... } */
export function lastmodSerialize(item) {
  const u = new URL(item.url);
  const pathname = u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`;
  return { ...item, lastmod: lastmodFor(pathname) };
}
