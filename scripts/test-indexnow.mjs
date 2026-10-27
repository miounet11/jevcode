#!/usr/bin/env node
/**
 * IndexNow 增量提交回归（零依赖，node:test）。
 * 用法：node --test scripts/test-indexnow.mjs
 *
 * 判定写错的后果是静默的：白推全量会挤占配额，漏推真实变更会让页面
 * 永远不被重爬。两边都不会抛错，所以必须有回归网。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitemapEntries, selectChanged, nextState } from './lib/indexnow.mjs';

const xml = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://x/a/</loc><lastmod>2026-10-01T00:00:00.000Z</lastmod></url>
  <url><loc>https://x/b/</loc><lastmod>2026-10-02T00:00:00.000Z</lastmod></url>
  <url><loc>https://x/c/</loc></url>
</urlset>`;

test('解析 sitemap：取 loc 与 lastmod，缺失 lastmod 记为 null', () => {
  const e = parseSitemapEntries(xml);
  assert.equal(e.length, 3);
  assert.deepEqual(e[0], { loc: 'https://x/a/', lastmod: '2026-10-01T00:00:00.000Z' });
  assert.equal(e[2].lastmod, null);
});

test('解析空 sitemap 不抛错', () => {
  assert.deepEqual(parseSitemapEntries('<urlset></urlset>'), []);
});

test('只有 lastmod 变化的 URL 才重推', () => {
  const e = parseSitemapEntries(xml);
  const prev = { 'https://x/a/': '2026-10-01T00:00:00.000Z' };
  const changed = selectChanged(e, prev);
  const locs = changed.map((x) => x.loc);
  assert.ok(!locs.includes('https://x/a/'), '未变更的不该重推');
  assert.ok(locs.includes('https://x/b/'), '新出现/已变更的要推');
});

test('缺 lastmod 的 URL 每次都推，不能因为判不出变化就永久跳过', () => {
  const e = parseSitemapEntries(xml);
  const prev = { 'https://x/c/': '' };
  const changed = selectChanged(e, prev).map((x) => x.loc);
  assert.ok(changed.includes('https://x/c/'));
});

test('forceAll 全量重推，用于首次上线或状态文件丢失自愈', () => {
  const e = parseSitemapEntries(xml);
  // 状态与当前完全一致时，仍会选中没有 lastmod 的那条（无法判断是否变化）
  const prev = Object.fromEntries(e.filter((x) => x.lastmod).map((x) => [x.loc, x.lastmod]));
  assert.equal(selectChanged(e, prev).length, 1);
  assert.equal(selectChanged(e, prev, { forceAll: true }).length, 3);
});

test('状态只记录提交成功的 URL：失败批次下次仍会重推', () => {
  const e = parseSitemapEntries(xml);
  const prev = {};
  // 只成功推了 a，b 的批次失败
  const next = nextState(prev, e, ['https://x/a/']);
  assert.equal(next['https://x/a/'], '2026-10-01T00:00:00.000Z');
  assert.equal(next['https://x/b/'], undefined);
  // b 下一轮仍被选中
  assert.ok(selectChanged(e, next).some((x) => x.loc === 'https://x/b/'));
});

test('已从 sitemap 消失的 URL 从状态里清理，避免文件无限增长', () => {
  const e = parseSitemapEntries(xml);
  const prev = {
    'https://x/a/': '2026-10-01T00:00:00.000Z',
    'https://x/gone/': '2026-01-01T00:00:00.000Z',
  };
  const next = nextState(prev, e, []);
  assert.equal(next['https://x/gone/'], undefined);
  assert.equal(next['https://x/a/'], '2026-10-01T00:00:00.000Z');
});
