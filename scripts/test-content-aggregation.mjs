import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildTrafficEntries,
  collectPublished,
  aggregateByTopic,
  coverageItems,
  projectItems,
  briefItems,
  compareContentItems,
  AI_SOFTWARE_DOWNLOADS,
  DOWNLOAD_CATEGORY,
  getDownloadCategory,
  getPrimaryDownloadRecommendations,
  listDownloadSoftware,
} from '../src/lib/content.ts';
import { COVERAGE_ENTRIES } from '../src/lib/content/registry.ts';
import { projects } from '../src/data/ecosystem.ts';
import { LOCALES } from '../src/lib/routing/domains.ts';

const briefs = JSON.parse(readFileSync(new URL('../src/data/daily-briefs.json', import.meta.url), 'utf8'));
const i18n = JSON.parse(readFileSync(new URL('../src/data/briefs-i18n.json', import.meta.url), 'utf8'));

const dirty = [
  { slug: '', title: 'x', locale: 'en', kind: 'brief', topic: 't' },
  { slug: 'a', title: '', locale: 'en', kind: 'brief', topic: 't' },
  { slug: 'a', title: 'A', locale: 'en', kind: 'brief', topic: 't', published: false },
  { slug: 'a', title: 'A', locale: 'en', kind: 'brief', topic: 't', updatedAt: '2026-01-01' },
  { slug: 'a', title: 'A dup', locale: 'en', kind: 'brief', topic: 't', updatedAt: '2026-02-01' },
];

test('collectPublished 过滤无 slug、无标题、未发布与重复项', () => {
  const out = collectPublished(dirty);
  assert.equal(out.length, 1);
  // 文档约定：同一 (locale, kind, slug) 只保留第一条，不按 updatedAt 抢新。
  assert.equal(out[0].updatedAt, '2026-01-01');
});

test('collectPublished 支持语言、主题、关键词、日期、类型与数量筛选', () => {
  const out = collectPublished(dirty, {
    locale: 'en',
    topic: 't',
    keyword: 'A',
    since: '2026-01-15',
    kinds: ['brief'],
    limit: 1,
  });
  assert.equal(out.length, 1);
  assert.equal(collectPublished(dirty, { locale: 'zh' }).length, 0);
  assert.equal(collectPublished(dirty, { keyword: 'zzz' }).length, 0);
});

test('compareContentItems 按更新时间降序稳定排序', () => {
  const a = { slug: 'b', title: 'B', locale: 'en', kind: 'brief', topic: 't', updatedAt: '2026-02-01' };
  const b = { slug: 'a', title: 'A', locale: 'en', kind: 'brief', topic: 't', updatedAt: '2026-03-01' };
  assert.deepEqual([a, b].sort(compareContentItems).map((x) => x.slug), ['a', 'b']);
});

test('aggregateByTopic 按规模降序聚合并给出主题最新时间', () => {
  const groups = aggregateByTopic([
    { slug: 'a', title: 'A', locale: 'en', kind: 'brief', topic: 'x', updatedAt: '2026-01-01' },
    { slug: 'b', title: 'B', locale: 'en', kind: 'brief', topic: 'x', updatedAt: '2026-03-01' },
    { slug: 'c', title: 'C', locale: 'en', kind: 'brief', topic: 'y' },
  ]);
  assert.deepEqual(groups.map((g) => [g.topic, g.count]), [['x', 2], ['y', 1]]);
  assert.equal(groups[0].updatedAt, '2026-03-01');
  assert.equal(groups[1].updatedAt, '');
});

function allItems() {
  const out = [];
  for (const locale of LOCALES) {
    out.push(...coverageItems(COVERAGE_ENTRIES, locale));
    out.push(...projectItems(projects, locale));
    out.push(...briefItems(briefs, locale, i18n));
  }
  return out;
}

test('三个适配器把真实数据映射为非空标题与稳定路径', () => {
  const items = allItems();
  assert.equal(items.length, (COVERAGE_ENTRIES.length + projects.length + briefs.length) * LOCALES.length);
  assert.ok(items.every((item) => item.slug.trim() && item.title.trim() && item.path.startsWith(`/${item.locale}/`)));
  assert.ok(items.every((item) => item.updatedAt === undefined || /^\d{4}-\d{2}-\d{2}$/.test(item.updatedAt)));
  assert.ok(items.some((item) => item.kind === 'coverage'));
  assert.ok(items.some((item) => item.kind === 'project'));
  assert.ok(items.some((item) => item.kind === 'brief'));
});

test('briefItems 有译文用译文，无译文回退英文原文', () => {
  const row = briefs[0];
  const translated = briefItems([row], 'de', i18n)[0];
  const fallback = briefItems([row], 'de')[0];
  assert.equal(translated.title, i18n[row.id].de.question);
  assert.equal(fallback.title, row.question);
  assert.equal(fallback.description, row.context);
});

test('buildTrafficEntries 输出可序列化、可去重、可排序且确定性', () => {
  const items = allItems();
  const options = { locale: 'en', minItems: 3 };
  const entries = buildTrafficEntries(items, options);
  assert.ok(entries.length > 0);
  assert.equal(JSON.stringify(entries), JSON.stringify(buildTrafficEntries(items, options)));
  assert.equal(JSON.parse(JSON.stringify(entries)).length, entries.length);
  assert.equal(new Set(entries.map((e) => e.slug)).size, entries.length);
  assert.ok(entries.every((e) => e.canonical.startsWith('https://www.jevcode.ai/en/topics/')));
  assert.ok(entries.every((e) => e.title.trim() && e.description.trim() && e.keywords.length > 0));
  assert.ok(entries.every((e) => e.keywords.includes(e.topic.toLowerCase())));
  assert.ok(entries.every((e) => e.relatedCount >= 3 && e.related.length > 0 && e.related.length <= 12));
  assert.ok(entries.every((e) => e.related.every((r) => r.published !== false && r.title.trim() && r.slug.trim())));
  assert.ok(entries.every((e, i) => i === 0 || entries[i - 1].relatedCount >= e.relatedCount));
});

test('buildTrafficEntries 不带 locale 时按默认语言聚合，不混入其他语言内容', () => {
  const items = allItems();
  const entries = buildTrafficEntries(items, { minItems: 3 });
  assert.ok(entries.length > 0);
  assert.ok(entries.every((e) => e.locale === 'en'));
  assert.ok(entries.every((e) => e.related.every((r) => r.locale === 'en')));
  assert.ok(entries.every((e) => e.canonical.startsWith('https://www.jevcode.ai/en/topics/')));
});

test('buildTrafficEntries 每种语言各自生成入口', () => {
  const items = allItems();
  for (const locale of LOCALES) {
    const entries = buildTrafficEntries(items, { locale, minItems: 3 });
    assert.ok(entries.length > 0, `${locale} 应有入口`);
    assert.ok(entries.every((e) => e.canonical.startsWith(`https://www.jevcode.ai/${locale}/topics/`)));
  }
});

test('下载分类有 3 个主推荐，顺序固定，official 地址与需求一致', () => {
  assert.equal(AI_SOFTWARE_DOWNLOADS.length, 3);
  assert.deepEqual(AI_SOFTWARE_DOWNLOADS.map((s) => s.id), [...DOWNLOAD_CATEGORY.primaryIds]);
  const official = AI_SOFTWARE_DOWNLOADS.map((s) => s.downloads.official);
  assert.deepEqual(official.map((l) => l.url), [
    'https://imux.app/download',
    'https://clavue.com/download',
    'https://clavue.com/clavuebot/download',
  ]);
  assert.ok(official.every((l) => l.verified));
  for (const software of AI_SOFTWARE_DOWNLOADS) {
    assert.equal(software.category, 'ai-software-downloads');
    assert.equal(software.recommended, true);
    assert.equal(software.site, 'all');
    assert.deepEqual(Object.keys(software.downloads), ['official', 'desktop', 'cli', 'mirror', 'fallback']);
    for (const channel of ['desktop', 'cli', 'mirror', 'fallback']) {
      assert.equal(software.downloads[channel].verified, false);
      assert.ok(software.downloads[channel].url.startsWith(software.downloads.official.url));
    }
  }
});

test('listDownloadSoftware 支持 locale / site / recommendedOnly / source 过滤', () => {
  assert.equal(listDownloadSoftware().length, 3);
  assert.deepEqual(listDownloadSoftware({ locale: 'zh' }).map((s) => s.locale), ['zh', 'zh', 'zh']);
  assert.equal(listDownloadSoftware({ locale: 'bogus' })[0].locale, 'en');
  assert.equal(listDownloadSoftware({ site: 'any-site' }).length, 3);
  assert.equal(listDownloadSoftware({ recommendedOnly: true }).length, 3);
  assert.equal(listDownloadSoftware({ source: 'primary' }).length, 3);
  const none = listDownloadSoftware({ site: 'x', source: 'partner' });
  assert.equal(none.length, 0);
  assert.ok(AI_SOFTWARE_DOWNLOADS.every((s) => s.recommended));
});

test('getPrimaryDownloadRecommendations 保持推荐顺序且可 JSON 序列化', () => {
  const primary = getPrimaryDownloadRecommendations();
  assert.deepEqual(primary.map((s) => s.id), ['imux', 'clavue', 'clavuebot']);
  assert.ok(primary.every((s) => s.recommended));
  assert.equal(JSON.parse(JSON.stringify(primary)).length, 3);
});

test('getDownloadCategory 每种语言给出标题、描述、canonical 与关键词', () => {
  for (const locale of LOCALES) {
    const meta = getDownloadCategory({ locale });
    assert.equal(meta.id, 'ai-software-downloads');
    assert.equal(meta.locale, locale);
    assert.ok(meta.title.trim() && meta.description.trim() && meta.label.trim());
    assert.equal(meta.path, `/${locale}/topics/ai-software-downloads/`);
    assert.equal(meta.canonical, `https://www.jevcode.ai/${locale}/topics/ai-software-downloads/`);
    assert.deepEqual(meta.primaryIds, ['imux', 'clavue', 'clavuebot']);
    assert.equal(meta.updatedAt, '2026-11-05');
    for (const word of ['AI 软件下载', '头部 AI 工具', 'imux', 'Clavue', 'ClavueBot']) {
      assert.ok(meta.keywords.includes(word));
    }
  }
  assert.equal(getDownloadCategory({ locale: 'bogus' }).locale, 'en');
});

test('buildTrafficEntries 追加下载分类且不覆盖既有主题入口', () => {
  const items = allItems();
  const withDownload = buildTrafficEntries(items, { locale: 'en', minItems: 3 });
  const download = withDownload.find((e) => e.topic === 'ai-software-downloads');
  assert.ok(download, '应追加下载分类入口');
  assert.equal(download.slug, 'ai-software-downloads');
  assert.equal(download.canonical, 'https://www.jevcode.ai/en/topics/ai-software-downloads/');
  assert.equal(download.relatedCount, 3);
  assert.deepEqual(download.related.map((r) => r.slug), ['imux', 'clavue', 'clavuebot']);
  assert.deepEqual(download.related.map((r) => r.href), [
    'https://imux.app/download',
    'https://clavue.com/download',
    'https://clavue.com/clavuebot/download',
  ]);
  assert.ok(download.related.every((r) => !r.path));
  assert.equal(download.label, getDownloadCategory({ locale: 'en' }).label);
  assert.equal(download.updatedAt, getDownloadCategory({ locale: 'en' }).updatedAt);
  assert.ok(download.keywords.includes('AI 软件下载'));
  assert.ok(download.keywords.includes('头部 AI 工具'));
  assert.ok(withDownload.some((e) => e.topic === 'ecommerce'));
  assert.equal(new Set(withDownload.map((e) => e.slug)).size, withDownload.length);

  const other = buildTrafficEntries(items, { locale: 'en', topic: 'ecommerce', minItems: 3 });
  assert.ok(!other.some((e) => e.topic === 'ai-software-downloads'));
  for (const locale of LOCALES) {
    const entries = buildTrafficEntries(items, { locale, minItems: 3 });
    assert.equal(entries.filter((e) => e.topic === 'ai-software-downloads').length, 1);
  }
});
