#!/usr/bin/env node
/**
 * llms.txt 与 sitemap 双向一致性的回归（零依赖，node:test）。
 * 用法：node --test scripts/test-seo-gate.mjs
 *
 * 借 yyds-bot 两条硬门禁的口径：
 *  - llms-txt：agent 要能直接读到站点结构，而不是爬 HTML 推断
 *  - sitemap-bidirectional：sitemap 与可索引页面必须互相覆盖
 *
 * 覆盖：
 *  1) llms.txt 七种非英文语言 + 英文都有一节，且标题层级正确
 *  2) llms.txt 只列真实存在且有译文的案例（与 noindex 口径一致）
 *  3) diffSitemap 两个方向都能抓出差异
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLlmsTxt, loadDocs, LANGS } from './generate-llms-txt.mjs';

const LLMS_LANGS = LANGS.map((l) => l.code);
import { diffSitemap, checkLlmsLinks, checkBriefIndexability } from './check-seo.mjs';

const read = (rel) => JSON.parse(readFileSync(new URL(`../src/data/${rel}`, import.meta.url), 'utf8'));

const briefs = read('daily-briefs.json');
const briefI18n = read('briefs-i18n.json');
const terms = read('brief-terms.json');

const txt = buildLlmsTxt({ briefs, briefMap: briefI18n, terms, docsByLang: loadDocs() });

test('llms.txt 覆盖全部 8 种站点语言', () => {
  for (const lang of LLMS_LANGS) {
    assert.ok(txt.includes(`## `) && txt.includes(`(/${lang}/)`), `缺少 ${lang} 小节`);
  }
  assert.equal(LLMS_LANGS.length, 8);
  // 每种语言恰好一个二级标题
  for (const lang of LLMS_LANGS) {
    const hits = txt.split('\n').filter((line) => line.includes(`(/${lang}/)`)).length;
    assert.equal(hits, 1, `${lang} 小节重复`);
  }
});

test('llms.txt 声明可索引规则，供 agent 判断哪些页面值得抓', () => {
  // 引言块里的换行会带 "> " 前缀，跨行匹配
  assert.match(txt, /indexable only when its\s*>?\s*body is actually translated/);
  assert.match(txt, /Canonical host: https:\/\/www\.jevcode\.ai/);
});

test('llms.txt 里的案例链接都指向真实存在的 id', () => {
  const ids = new Set(briefs.map((row) => row.id));
  const links = [...txt.matchAll(/\]\(https:\/\/www\.jevcode\.ai\/([a-z]{2})\/briefs\/([a-z0-9-]+)\/\)/g)];
  assert.ok(links.length > 0, '没有案例链接');
  for (const [, , id] of links) assert.ok(ids.has(id), `未知 id: ${id}`);
});

test('llms.txt 不给没有译文的语言列案例', () => {
  // 每个语言小节里，案例链接数不能超过该语言有译文的条数
  const sections = txt.split(/^## /m).slice(1);
  for (const section of sections) {
    const lang = section.match(/\(\/([a-z]{2})\/\)/)?.[1];
    if (!lang) continue;
    const links = (section.match(/\/briefs\/[a-z0-9-]+\//g) ?? []).length;
    const localized = lang === 'en'
      ? briefs.length
      : briefs.filter((row) => briefI18n[row.id]?.[lang]?.context).length;
    assert.ok(links <= localized, `${lang}: 列了 ${links} 条，实际只有 ${localized} 条有译文`);
  }
});

test('diffSitemap 能抓出「可索引但不在 sitemap」', () => {
  const pages = [
    { url: 'https://x/a/', indexable: true },
    { url: 'https://x/b/', indexable: true },
    { url: 'https://x/c/', indexable: false },
  ];
  const sitemap = new Set(['https://x/a/', 'https://x/c/']);
  const { missing, extra } = diffSitemap(pages, sitemap);
  // b 可索引却缺席；c 是 noindex 却进了 sitemap
  assert.deepEqual(missing, ['https://x/b/']);
  assert.deepEqual(extra, ['https://x/c/']);
});

test('diffSitemap 对一致的两侧返回空差异', () => {
  const pages = [
    { url: 'https://x/a/', indexable: true },
    { url: 'https://x/c/', indexable: false },
  ];
  const { missing, extra } = diffSitemap(pages, new Set(['https://x/a/']));
  assert.deepEqual(missing, []);
  assert.deepEqual(extra, []);
});

test('术语表与 llms.txt 语言集合一致（站点语言只有这 8 个）', () => {
  const termLangs = new Set(Object.values(terms.industry ?? {}).flatMap((v) => Object.keys(v)));
  for (const lang of termLangs) assert.ok(LLMS_LANGS.includes(lang), `术语表多了 ${lang}`);
});

test('checkLlmsLinks 抓出断链与 noindex 推荐', () => {
  const text = [
    '- [ok](https://x/a/)',
    '- [gone](https://x/missing/)',
    '- [hidden](https://x/c/)',
  ].join('\n');
  const pages = [
    { url: 'https://x/a/', indexable: true },
    { url: 'https://x/c/', indexable: false },
  ];
  const { broken, noindex } = checkLlmsLinks(text, pages, 'https://x');
  assert.deepEqual(broken, ['https://x/missing/']);
  assert.deepEqual(noindex, ['https://x/c/']);
});

test('llms.txt 不推荐没有列表页的章节（concepts/cases 是纯目录）', () => {
  // 这两个路径没有 index.md，指向它们会 404；由 check-seo 在构建后兜住。
  assert.doesNotMatch(txt, /\/concepts\/\)/);
  assert.doesNotMatch(txt, /\/cases\/\)\s*$/m);
  for (const section of ['patterns', 'sdk', 'lab', 'compare']) {
    assert.match(txt, new RegExp(`/${section}/`), `缺少 ${section} 入口`);
  }
});

test('llms.txt 收录文档条目，且只收该语言自己有的', () => {
  const docs = loadDocs();
  assert.ok((docs.en?.length ?? 0) > 0);
  // 有文档的语言都在 llms.txt 里有条目（用字符串包含，避免正则转义失真）
  for (const [lang, list] of Object.entries(docs)) {
    if (!list.length) continue;
    // 每语言只列前 docsPerLang 条，断言前缀即可
    assert.ok(txt.includes(`/${lang}/${list[0].slug}/`), `${lang} 的首条文档没有进 llms.txt`);
  }
});

test('缺少 dist/ 时 check-seo 必须失败而不是静默跳过', () => {
  // 静默跳过会让这道门在 CI 或单独运行时「假成功」，等于没有门禁。
  // 这里真跑一次子进程：搜源码只能证明「写了 process.exit(1)」，不能证明
  // 那条分支真的被执行到——分支被挪进 never 的分支里同样会通过正则断言。
  const r = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./check-seo.mjs', import.meta.url)), '--dist=.no-such-dist-for-test'],
    { encoding: 'utf8' },
  );
  assert.equal(r.status, 1, `缺 dist 时应退出 1，实际 ${r.status}`);
  assert.match(r.stderr, /FAIL/);
});

test('案例页可索引性：没译文却 index 会被抓（sitemap 双向检查抓不到）', () => {
  const site = 'https://www.jevcode.ai/';
  const briefs = [{ id: 'b1' }];
  // de 没有译文，但页面标成可索引 → 等于把英文原文在 /de/ 下再收录一次。
  const pages = [
    { url: new URL('/de/briefs/b1/', site).href, indexable: true },
    { url: new URL('/zh/briefs/b1/', site).href, indexable: true },
  ];
  const { wronglyIndexable, wronglyNoindex } = checkBriefIndexability(pages, {
    briefs,
    briefI18n: {},
    site,
  });
  assert.deepEqual(wronglyIndexable, ['https://www.jevcode.ai/de/briefs/b1/']);
  assert.deepEqual(wronglyNoindex, []);
});

test('案例页可索引性：有译文却 noindex 会被抓（翻译白做）', () => {
  const site = 'https://www.jevcode.ai/';
  const pages = [{ url: new URL('/de/briefs/b1/', site).href, indexable: false }];
  const { wronglyIndexable, wronglyNoindex } = checkBriefIndexability(pages, {
    briefs: [{ id: 'b1' }],
    briefI18n: { b1: { de: { context: 'Kontext', question: 'Frage?' } } },
    site,
  });
  assert.deepEqual(wronglyNoindex, ['https://www.jevcode.ai/de/briefs/b1/']);
  assert.deepEqual(wronglyIndexable, []);
});

test('案例页可索引性：en/zh 恒可索引，不需要译文', () => {
  const site = 'https://www.jevcode.ai/';
  const pages = ['en', 'zh'].map((lang) => ({
    url: new URL(`/${lang}/briefs/b1/`, site).href,
    indexable: true,
  }));
  const { wronglyIndexable, wronglyNoindex } = checkBriefIndexability(pages, {
    briefs: [{ id: 'b1' }],
    briefI18n: {},
    site,
  });
  assert.deepEqual(wronglyIndexable, []);
  assert.deepEqual(wronglyNoindex, []);
});

test('案例页可索引性：真实数据与构建产物零不一致', () => {
  // 纯函数在构造数据上通过还不够——这里用仓库里的真实 src/data 复核一遍。
  // dist 缺席时跳过（单独跑测试不该强制先 build）。
  const dist = fileURLToPath(new URL('../dist', import.meta.url));
  if (!existsSync(dist)) return;
  const pages = [];
  for (const lang of ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt']) {
    for (const row of briefs) {
      const file = join(dist, lang, 'briefs', row.id, 'index.html');
      if (!existsSync(file)) continue;
      const robots = readFileSync(file, 'utf8').match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1] ?? '';
      pages.push({
        url: new URL(`/${lang}/briefs/${row.id}/`, 'https://www.jevcode.ai/').href,
        indexable: !/noindex/i.test(robots),
      });
    }
  }
  assert.ok(pages.length > 0, 'dist 存在却一条案例页也没扫到');
  const { wronglyIndexable, wronglyNoindex } = checkBriefIndexability(pages, {
    briefs,
    briefI18n,
    site: 'https://www.jevcode.ai/',
  });
  assert.deepEqual(wronglyIndexable, []);
  assert.deepEqual(wronglyNoindex, []);
});
