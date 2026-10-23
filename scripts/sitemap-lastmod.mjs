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
import { existsSync, readFileSync } from 'node:fs';
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

const DOC_RE = /^\/([a-z]{2})\/(cases|concepts|patterns|primitives|sdk)\/([a-z0-9-]+)\/$/;
const ROOT_DOC_RE = /^\/([a-z]{2})\/(introduction|quickstart)\/$/;

/** 已本地化的语言：与页面里 localizedLangs 的口径一致。 */
let briefLangs = null;
function localizedBriefLangs() {
  if (briefLangs) return briefLangs;
  try {
    const terms = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/brief-terms.json'), 'utf8'));
    briefLangs = new Set(Object.values(terms.industry ?? {}).flatMap((v) => Object.keys(v)));
  } catch {
    briefLangs = new Set();
  }
  return briefLangs;
}

/**
 * 简报 URL 是否该进 sitemap：与页面 noindex 判定保持一致。
 * 列表页跟着它链接的详情页走；详情页看该 id 是否真有该语言译文。
 */
function briefLocalized(lang, pathname) {
  if (lang === 'en' || lang === 'zh') return true;
  if (!localizedBriefLangs().has(lang)) return false;
  const id = pathname.match(/^\/([a-z]{2})\/briefs\/([a-z0-9-]+)\/$/)?.[2];
  if (!id) return true; // 列表页 / 分页页，语言本身已本地化
  try {
    const map = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/briefs-i18n.json'), 'utf8'));
    const entry = map[id]?.[lang];
    return Boolean(entry?.context && entry?.question);
  } catch {
    return false;
  }
}

/**
 * sitemap filter。缺源文件的语言页不进 sitemap：它们只是英文回退，
 * 仍带着自己的 canonical 会把同一篇文档拆成 8 个「刚更新」的 URL。
 * community 详情只留 en/zh。login / account / 404 不收录。
 * @param {string} page
 */
export function sitemapInclude(page) {
  let pathname = page;
  try {
    pathname = new URL(page).pathname;
  } catch {
    /* 调用方已经传入路径 */
  }
  if (!pathname.endsWith('/')) pathname = `${pathname}/`;
  // 根路径是跳转兜底页（nginx 直接 302，其他托管由 meta refresh 接手），
  // 页面本身是 noindex，收进 sitemap 就是自相矛盾。
  if (pathname === '/') return false;
  if (pathname.includes('/login') || pathname.includes('/account') || pathname.includes('/404')) {
    return false;
  }
  const community = pathname.match(/^\/([a-z]{2})\/community\/\d+\/$/);
  if (community && community[1] !== 'en' && community[1] !== 'zh') return false;
  // 简报页：有译文的语言已改成可索引，sitemap 必须跟着放开，
  // 否则会出现「可索引页面不在 sitemap」的漏收录。
  const brief = pathname.match(/^\/([a-z]{2})\/briefs\//);
  if (brief) return briefLocalized(brief[1], pathname);
  const doc = pathname.match(DOC_RE);
  if (doc) {
    return existsSync(path.join(repoRoot, 'src/content/docs', doc[1], doc[2], `${doc[3]}.md`));
  }
  const rootDoc = pathname.match(ROOT_DOC_RE);
  if (rootDoc) {
    return existsSync(path.join(repoRoot, 'src/content/docs', rootDoc[1], `${rootDoc[2]}.md`));
  }
  return true;
}

/** sitemap 插件的 serialize 钩子：item = { url, ... } */
export function lastmodSerialize(item) {
  const u = new URL(item.url);
  const pathname = u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`;
  return { ...item, lastmod: lastmodFor(pathname) };
}
