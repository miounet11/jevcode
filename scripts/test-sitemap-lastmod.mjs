#!/usr/bin/env node
/**
 * sitemap lastmod 序列化回归（零依赖，node:test）。
 * 用法：node --test scripts/test-sitemap-lastmod.mjs
 *
 * lastmodSerialize 是 astro.config.mjs 里 sitemap 插件的 serialize 钩子，
 * 映射错了不会报错、只会产出错误的 lastmod——静默失败，必须有回归网。
 *
 * 覆盖：
 *  1) 文档内容页 → 对应 content/docs/<lang>/<section>/<slug>.md 的 git 时间
 *  2) 独立页面与语言首页 → 对应 src/pages 模板的 git 时间
 *  3) community 详情页等映射不到的 URL → 回退仓库最新提交时间
 *  4) 每个条目都产出合法 ISO 时间且保留原有字段
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const { lastmodSerialize, sitemapInclude } = await import('./sitemap-lastmod.mjs');

const gitTime = (p) =>
  execFileSync('git', ['log', '-1', '--format=%cI', '--', p]).toString().trim();

const iso = (s) => !Number.isNaN(new Date(s).getTime());
const url = (p) => `https://www.jevcode.ai${p}`;

test('文档内容页映射到对应 md 的 git 时间', () => {
  const item = lastmodSerialize({ url: url('/en/sdk/javascript/') });
  assert.equal(item.lastmod, gitTime('src/content/docs/en/sdk/javascript.md'));
});

test('多语言文档页各映射到各语言文件（缺失时回退仓库最新时间）', () => {
  const zh = lastmodSerialize({ url: url('/zh/patterns/intent-routing/') });
  const en = lastmodSerialize({ url: url('/en/patterns/intent-routing/') });
  // zh 文件存在 → 用 zh 文件自己的时间
  assert.equal(zh.lastmod, gitTime('src/content/docs/zh/patterns/intent-routing.md'));
  // 结构合法即可，en 与 zh 允许不同（各自文件独立提交）
  assert.ok(iso(en.lastmod) && iso(zh.lastmod));
});

test('独立页面映射到页面模板的 git 时间', () => {
  const item = lastmodSerialize({ url: url('/en/playground/') });
  assert.equal(item.lastmod, gitTime('src/pages/[lang]/playground.astro'));
});

test('语言首页映射到 [lang]/index.astro', () => {
  const item = lastmodSerialize({ url: url('/zh/') });
  assert.equal(item.lastmod, gitTime('src/pages/[lang]/index.astro'));
});

test('生态实体页用条目自己的 updated，不用整文件时间', () => {
  const entity = lastmodSerialize({ url: url('/zh/ecosystem/yibie--awesome-jev/') });
  // 条目级日期：只有这个仓库的数据变了它才算「刚更新」
  const src = readFileSync(new URL('../src/data/ecosystem.ts', import.meta.url), 'utf8');
  const own = src
    .match(/repo: 'yibie\/awesome-jev'[\s\S]*?\n    updated: '([^']+)'/)?.[1];
  assert.ok(own, 'ecosystem.ts 应带 updated 字段');
  assert.equal(entity.lastmod, `${own}T00:00:00+00:00`);
  // 与整文件时间不同，避免一次刷新把 1688 个页面全标成新
  assert.notEqual(entity.lastmod, gitTime('src/data/ecosystem.ts'));
});

test('生态分类页跟随 ecosystem.ts 整文件时间', () => {
  const category = lastmodSerialize({ url: url('/de/ecosystem/category/agent/') });
  assert.equal(category.lastmod, gitTime('src/data/ecosystem.ts'));
  assert.notEqual(category.lastmod, gitTime('.'));
});

test('community 详情页等未映射 URL 回退仓库最新提交时间', () => {
  const repoLatest = gitTime('.');
  const a = lastmodSerialize({ url: url('/en/community/2101000339948282090/') });
  const b = lastmodSerialize({ url: url('/ja/nonexistent-section/x/') });
  assert.equal(a.lastmod, repoLatest);
  assert.equal(b.lastmod, repoLatest);
});

test('serialize 保留原字段且 lastmod 是合法 ISO', () => {
  const item = lastmodSerialize({ url: url('/en/compare/'), changefreq: 'weekly' });
  assert.equal(item.changefreq, 'weekly');
  assert.ok(iso(item.lastmod));
});

test('结尾无斜杠的 URL 也能匹配', () => {
  const withSlash = lastmodSerialize({ url: url('/en/sdk/python/') });
  const noSlash = lastmodSerialize({ url: url('/en/sdk/python') });
  assert.equal(noSlash.lastmod, withSlash.lastmod);
});

test('sitemap 丢掉没有源 markdown 的语言 URL', () => {
  assert.equal(sitemapInclude(url('/zh/cases/content-moderation/')), false);
  assert.equal(sitemapInclude(url('/en/cases/content-moderation/')), true);
  assert.equal(sitemapInclude(url('/zh/cases/jev-alternatives/')), true);
  assert.equal(sitemapInclude(url('/ja/community/2101000339948282090/')), false);
  assert.equal(sitemapInclude(url('/en/community/2101000339948282090/')), true);
  // ja 已有案例译文：简报 URL 与 noindex 口径一致，进 sitemap
  assert.equal(sitemapInclude(url('/ja/briefs/cov-ecommerce-urgency-01/')), true);
  assert.equal(sitemapInclude(url('/en/briefs/cov-ecommerce-urgency-01/')), true);
  assert.equal(sitemapInclude(url('/zh/briefs/')), true);
  assert.equal(sitemapInclude(url('/en/login/')), false);
});
