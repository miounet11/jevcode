#!/usr/bin/env node
/**
 * 内容质量校验的回归测试（零依赖，node:test）。
 * 用法：node --test scripts/test-content-check.mjs
 *
 * 判定语义用纯函数直测（collectFindings / diffBaseline），
 * 退出码与输出格式必须真跑子进程——搜源码只能证明「写了 process.exit」。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BODY_LIMITS,
  bodyLimits,
  collectFindings,
  diffBaseline,
  evaluate,
  indexableLangs,
  TERM_FIELDS,
} from './content-check.mjs';

const SCRIPT = fileURLToPath(new URL('./content-check.mjs', import.meta.url));
const LANGS = ['zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];

/** 每语言一套互不相同的词，避免构造数据自带 identical-translation。 */
const WORDS = {
  zh: { industry: '软件服务', scene: '聊天', tag: '缺陷', dimension: '优先级', stage: '受理' },
  ja: { industry: 'SaaS', scene: 'チャット', tag: 'バグ', dimension: '優先度', stage: '受付' },
  ko: { industry: 'SaaS', scene: '채팅', tag: '버그', dimension: '우선순위', stage: '접수' },
  de: { industry: 'SaaS', scene: 'Chat', tag: 'Fehler', dimension: 'Priorität', stage: 'Annahme' },
  fr: { industry: 'SaaS', scene: 'Chat', tag: 'bogue', dimension: 'priorité', stage: 'réception' },
  es: { industry: 'SaaS', scene: 'Chat', tag: 'error', dimension: 'prioridad', stage: 'recepción' },
  pt: { industry: 'SaaS', scene: 'Chat', tag: 'bug', dimension: 'prioridade', stage: 'receção' },
};

const buildTerms = () => {
  const table = {};
  const slugs = { industry: 'saas', scene: 'chat', tag: 'bug', dimension: 'priority', stage: 'intake' };
  for (const field of TERM_FIELDS) {
    table[field] = {
      [slugs[field]]: Object.fromEntries(LANGS.map((l) => [l, WORDS[l][field]])),
    };
  }
  return table;
};

const TERMS = buildTerms();

function row(over = {}) {
  return {
    id: 'b1',
    industry: 'saas',
    scene: 'chat',
    tag: 'bug',
    dimension: 'priority',
    stage: 'intake',
    context: 'User reports a crash after the latest update.',
    question: 'Is this worth escalating now?',
    choices: ['yes', 'no'],
    published: '2026-10-20',
    ...over,
  };
}

const TEXT = {
  zh: { context: '用户反馈更新后崩溃。', question: '这值得立刻升级处理吗？' },
  ja: { context: '更新後にクラッシュしたと報告。', question: '今すぐエスカレーションすべきか？' },
  ko: { context: '업데이트 후 충돌한다고 보고했습니다.', question: '지금 바로 에스컬레이션해야 합니까?' },
  de: { context: 'Nutzer meldet Absturz nach dem Update.', question: 'Sollte das sofort eskaliert werden?' },
  fr: { context: "L'utilisateur signale un plantage après la mise à jour.", question: 'Faut-il escalader tout de suite ?' },
  es: { context: 'El usuario reporta un fallo tras la actualización.', question: '¿Conviene escalarlo ahora mismo?' },
  pt: { context: 'O utilizador reporta falha após a atualização.', question: 'Vale a pena escalar já?' },
};

/** 全 7 语言都有译文的 i18n；over 里的词条覆盖单条用例。 */
const mkI18n = (id = 'b1', over = {}) => ({
  [id]: Object.fromEntries(
    LANGS.map((l) => [l, { ...TEXT[l], choices: ['yes', 'no'], ...(over[l] ?? {}) }]),
  ),
});

const baseline = (keys) => ({ keys: new Set(keys), updated: '2026-10-23' });
const kinds = (list) => list.map((x) => x.kind).sort();

test('干净数据没有任何问题', () => {
  const { hard, soft } = collectFindings({
    briefs: [row()],
    i18n: mkI18n(),
    terms: TERMS,
    today: new Date('2026-10-23T00:00:00Z'),
  });
  assert.deepEqual(hard, []);
  assert.deepEqual(soft, []);
});

test('空字段、重复 id 都是硬问题', () => {
  const { hard } = collectFindings({
    briefs: [row({ id: 'b1', scene: '' }), row({ id: 'b1' })],
    i18n: mkI18n(),
    terms: TERMS,
  });
  assert.ok(kinds(hard).includes('empty-field'), '缺少场景 slug 应报 empty-field');
  assert.ok(kinds(hard).includes('duplicate-id'), '重复 id 应报 duplicate-id');
});

test('标题重复是硬问题（会产出多个同 title 的可索引页）', () => {
  const { hard } = collectFindings({
    briefs: [row({ id: 'b1' }), row({ id: 'b2' })],
    i18n: mkI18n('b1'),
    terms: TERMS,
  });
  const dup = hard.filter((h) => h.kind === 'duplicate-title');
  // 8 种语言各报一条：每个语言的标题都会重复。
  assert.equal(dup.length, 8, `应每语言各报 1 条，实际 ${dup.length}`);
  assert.match(dup[0].detail, /（b1 与 b2）/);
});

test('缺译文是硬问题，且区分「整条缺失」与「只缺一块」', () => {
  const missing = collectFindings({ briefs: [row()], i18n: {}, terms: TERMS });
  assert.equal(missing.hard.filter((h) => h.kind === 'missing-i18n').length, LANGS.length);

  const broken = mkI18n();
  broken.b1.zh = { context: '只有正文', question: '', choices: ['yes', 'no'] };
  const partial = collectFindings({ briefs: [row()], i18n: broken, terms: TERMS });
  assert.deepEqual(
    partial.hard.map((h) => h.kind),
    ['partial-i18n'],
  );
});

test('译文选项数与英文不一致是硬问题', () => {
  // 其余语言跟着英文变成 3 项，只有 zh 没跟上——只该报 zh。
  const aligned = Object.fromEntries(LANGS.map((l) => [l, { choices: ['yes', 'no', 'unsure'] }]));
  const { hard } = collectFindings({
    briefs: [row({ choices: ['yes', 'no', 'unsure'] })],
    i18n: mkI18n('b1', { ...aligned, zh: { choices: ['yes', 'no'] } }),
    terms: TERMS,
  });
  assert.deepEqual(
    hard.map((h) => [h.kind, h.key]),
    [['choice-count', 'zh:b1']],
  );
});

test('发布日期非法或晚于今天是硬问题', () => {
  const today = new Date('2026-10-23T00:00:00Z');
  const bad = collectFindings({ briefs: [row({ published: '2026/10/20' })], i18n: mkI18n(), terms: TERMS, today });
  assert.deepEqual(kinds(bad.hard), ['bad-published']);
  const future = collectFindings({ briefs: [row({ published: '2026-10-24' })], i18n: mkI18n(), terms: TERMS, today });
  assert.deepEqual(kinds(future.hard), ['future-published']);
});

test('译文与英文逐字相同记为软问题（静默回退不阻断发布）', () => {
  const { hard, soft } = collectFindings({
    briefs: [row()],
    i18n: mkI18n('b1', { zh: { question: row().question } }),
    terms: TERMS,
  });
  assert.deepEqual(hard, []);
  assert.deepEqual(
    soft.map((s) => s.key),
    ['zh:b1:question'],
  );
});

test('术语有条目但缺该语言译名记为软问题；缺整个条目是硬问题', () => {
  // 不能删 industry 的译名：可索引语言集就是从 industry 推出来的，删了 pt 会连语言一起消失。
  const partialTerms = buildTerms();
  delete partialTerms.tag.bug.pt;
  const noLang = collectFindings({ briefs: [row()], i18n: mkI18n(), terms: partialTerms });
  assert.deepEqual(
    noLang.soft.map((s) => s.key),
    ['pt:tag:bug'],
  );

  const noEntry = collectFindings({ briefs: [row({ industry: 'fintech' })], i18n: mkI18n(), terms: TERMS });
  assert.deepEqual(kinds(noEntry.hard), ['term-missing-entry']);
});

test('正文过短只在软问题里报，不会因占位符卡住整轮发布', () => {
  const { hard, soft } = collectFindings({
    briefs: [row()],
    i18n: mkI18n('b1', { zh: { question: '嗯' } }),
    terms: TERMS,
  });
  assert.deepEqual(hard, []);
  assert.deepEqual(
    soft.map((s) => s.key),
    ['zh:b1:question'],
  );
});

test('长度阈值按语言校准：同长度文本在 zh 合格、在 de 判过短', () => {
  // 这是「共用阈值」和「按语言校准」能区分开的唯一判据：同一段 11 字符的译文
  // 放到中文里属于正常短句（实测中文最短 11），放到德文里则是残缺。
  const eleven = 'Kurz genug.'.slice(0, 11);
  assert.equal([...eleven].length, 11);
  assert.ok(bodyLimits('zh', 'question').min < 11, 'zh 的下界应低于 11');
  assert.ok(bodyLimits('de', 'question').min > 11, 'de 的下界应高于 11');

  const zh = collectFindings({
    briefs: [row()],
    i18n: mkI18n('b1', { zh: { question: eleven } }),
    terms: TERMS,
  });
  assert.deepEqual(zh.soft.filter((s) => s.kind === 'body-too-short'), []);

  const de = collectFindings({
    briefs: [row()],
    i18n: mkI18n('b1', { de: { question: eleven } }),
    terms: TERMS,
  });
  assert.deepEqual(
    de.soft.filter((s) => s.kind === 'body-too-short').map((s) => s.key),
    ['de:b1:question'],
  );
});

test('每种站点语言都有长度阈值，缺了要报硬问题', () => {
  for (const lang of ['en', ...LANGS]) {
    assert.ok(BODY_LIMITS[lang], `${lang} 缺校准阈值`);
    for (const field of ['question', 'context']) {
      const { min, max } = BODY_LIMITS[lang][field];
      assert.ok(min > 0 && min < max, `${lang}.${field} 阈值不合理：${min}..${max}`);
    }
  }
  // 阈值随字符密度递增：中文下界必须明显低于德文。
  assert.ok(BODY_LIMITS.zh.question.min < BODY_LIMITS.de.question.min);

  // 语言出现在数据里但没校准 → 必须硬失败，不能静默套用别国阈值。
  const unknownTerms = buildTerms();
  for (const entry of Object.values(unknownTerms.industry)) entry.xx = 'X';
  const { hard } = collectFindings({ briefs: [row()], i18n: mkI18n(), terms: unknownTerms });
  assert.ok(
    hard.some((h) => h.kind === 'missing-limits' && h.key === 'lang:xx'),
    `未校准语言应报 missing-limits，实际：${JSON.stringify(hard)}`,
  );
});

test('正文超长按该语言上界报，不会跨语言误判', () => {
  const long = 'x'.repeat(200);
  const { soft } = collectFindings({
    briefs: [row()],
    i18n: mkI18n('b1', { zh: { question: long } }),
    terms: TERMS,
  });
  const tooLong = soft.filter((s) => s.kind === 'body-too-long').map((s) => s.key);
  assert.deepEqual(tooLong, ['zh:b1:question'], '200 字符超过 zh 的 120 上界');
});

test('可索引语言集合与术语表 industry 的语言一致', () => {
  assert.deepEqual(indexableLangs(TERMS), ['de', 'es', 'fr', 'ja', 'ko', 'pt', 'zh']);
  assert.equal(indexableLangs(TERMS).length, 7, '站点另有 en 原文，共 8 种语言');
});

test('基线棘轮：新增软问题失败，存量不算，修掉的只提示', () => {
  const briefs = [row()];
  const i18n = mkI18n('b1', { zh: { question: row().question, context: row().context } });
  const findings = collectFindings({ briefs, i18n, terms: TERMS });
  assert.equal(findings.soft.length, 2);

  const same = evaluate({ briefs, i18n, terms: TERMS, baseline: baseline(findings.soft.map((s) => s.key)) });
  assert.equal(same.ok, true, '基线内的问题不该失败');
  assert.deepEqual(same.added, []);

  const fewer = evaluate({
    briefs,
    i18n,
    terms: TERMS,
    baseline: baseline([...findings.soft.map((s) => s.key), 'zh:b1:gone']),
  });
  assert.equal(fewer.ok, true);
  assert.deepEqual(fewer.fixed, ['zh:b1:gone']);

  const none = evaluate({ briefs, i18n, terms: TERMS, baseline: baseline([]) });
  assert.equal(none.ok, false, '基线为空时任何软问题都是回归');
  assert.equal(none.added.length, 2);
});

test('没有基线时只报告不失败（首次接入不炸管线）', () => {
  const { added, firstRun } = diffBaseline(['a', 'b'], null);
  assert.deepEqual(added, []);
  assert.equal(firstRun, true);
});

test('CLI：正常数据退出 0；--json 的 stdout 必须是纯 JSON', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0, `应退出 0，实际 ${r.status}\n${r.stdout}\n${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.briefs > 0);
  assert.deepEqual(parsed.hard, []);
});

test('CLI：新增软问题必须退出 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'content-check-'));
  const empty = join(dir, 'baseline.json');
  writeFileSync(empty, JSON.stringify({ version: 1, updated: '2026-10-23', keys: [] }));
  const r = spawnSync(process.execPath, [SCRIPT, `--baseline=${empty}`], { encoding: 'utf8' });
  assert.equal(r.status, 1, `空基线应退出 1，实际 ${r.status}\n${r.stdout}`);
  assert.match(r.stdout, /FAIL soft-regression/);
});

test('CLI：基线里已修复的多余 key 只提示，不失败', () => {
  // 基线用「当前真实软问题 + 1 条不存在的 key」现造，而不是拿仓库里那份基线做
  // 加法：仓库基线会随数据收紧或残留，写成「+1 条已修复」就会被存量污染
  // （实测仓库基线里躺着 6 条已修复的 key，断言就崩了）。
  const live = spawnSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  const current = JSON.parse(live.stdout).soft.map((s) => s.key);
  const dir = mkdtempSync(join(tmpdir(), 'content-check-'));
  const stale = join(dir, 'stale.json');
  writeFileSync(
    stale,
    JSON.stringify({ version: 1, updated: '2026-01-01', keys: [...current, 'de:industry:gone-slug'] }),
  );
  const r = spawnSync(process.execPath, [SCRIPT, `--baseline=${stale}`], { encoding: 'utf8' });
  assert.equal(r.status, 0, `存量的多余 key 不该失败，实际 ${r.status}\n${r.stdout}`);
  assert.match(r.stdout, /NOTE 基线里有 1 条已修复/);
});

test('CLI：退出 1 时 --json 的 stdout 必须完整（管道缓冲不截断）', () => {
  // 这条锁的是一个真实踩过的坑：content-check 曾用 process.exit(1) 退出，进程
  // 立即终止会丢弃未刷出的 stdout，管道在 64KB 处截断，调用方 preflight 只能
  // 读到半个 JSON，把「内容有硬问题」误报成「输出无法解析」。
  //
  // 构造同时满足「退出 1」和「输出 > 64KB」的输入：基线里塞 5000 条不存在的
  // key（fixed 撑大输出），又不含任何真实软问题（added 非空 → 退出 1）。
  const live = spawnSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  const current = JSON.parse(live.stdout).soft.map((s) => s.key);
  assert.ok(current.length > 0, '当前数据应存在存量软问题，否则这条用例构造不出退出 1');

  const dir = mkdtempSync(join(tmpdir(), 'content-check-'));
  const big = join(dir, 'big.json');
  const bogus = Array.from({ length: 5000 }, (_, i) => `de:industry:gone-slug-${i}`);
  writeFileSync(big, JSON.stringify({ version: 1, updated: '2026-01-01', keys: bogus }));

  const r = spawnSync(process.execPath, [SCRIPT, '--json', `--baseline=${big}`], { encoding: 'utf8' });
  assert.equal(r.status, 1, `空基线应退出 1，实际 ${r.status}`);
  assert.ok(r.stdout.length > 64 * 1024, `输出应超过管道缓冲，实际 ${r.stdout.length} 字节`);
  // 截断时这里会抛 Unterminated string / Unexpected end of JSON input。
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.added.length, current.length);
  assert.equal(parsed.fixed.length, bogus.length);
});

test('CLI：仓库里的基线文件是有效的 JSON 且已排序', () => {
  const raw = JSON.parse(readFileSync(new URL('./content-check-baseline.json', import.meta.url), 'utf8'));
  assert.equal(raw.version, 1);
  assert.ok(Array.isArray(raw.keys));
  assert.deepEqual(raw.keys, [...raw.keys].sort(), '基线应保持排序，便于 review diff');
});

test('告警摘要：通过时为 OK，新增软问题让摘要模块也退出 1', () => {
  const summaryPath = fileURLToPath(new URL('./lib/content-summary.mjs', import.meta.url));
  const okRun = spawnSync(process.execPath, [summaryPath], {
    input: JSON.stringify({ ok: true, hard: [], added: [] }),
    encoding: 'utf8',
  });
  assert.equal(okRun.status, 0);
  assert.equal(okRun.stdout.trim(), 'OK');

  const badRun = spawnSync(process.execPath, [summaryPath], {
    input: JSON.stringify({
      ok: false,
      hard: [{ kind: 'duplicate-title', key: 'en:x', detail: 'en 的标题重复：「a」' }],
      added: ['de:x:context'],
    }),
    encoding: 'utf8',
  });
  assert.equal(badRun.status, 1, '有新增软问题时摘要模块应退出 1');
  assert.match(badRun.stdout, /duplicate-title: 1/);
  assert.match(badRun.stdout, /de:x:context/);
});

test('告警摘要：无法解析时显式报错，不能静默当成通过', () => {
  const summaryPath = fileURLToPath(new URL('./lib/content-summary.mjs', import.meta.url));
  const r = spawnSync(process.execPath, [summaryPath], { input: 'not json', encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /PARSE_ERROR/);
});

test('巡检脚本调用内容校验并推飞书', () => {
  const sh = readFileSync(new URL('./healthcheck-cron.sh', import.meta.url), 'utf8');
  assert.match(sh, /content-check\.mjs --json/);
  assert.match(sh, /scripts\/lib\/content-summary\.mjs/);
  assert.match(sh, /内容质量校验未通过/);
});

test('管线走统一入口 preflight，两项结果都进发布报告且不阻断发布', () => {
  const src = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(src, /node scripts\/preflight\.mjs --json/, '管线必须调用统一入口');
  // 硬拦会让翻译没跟上就停掉日更（10-18~10-22 连续停更的教训）。
  assert.doesNotMatch(src, /if \(!buildOk \|\| !checkOk \|\| (contentReport|seoReport)/);
  // 发布成功那条记录必须带上两项结论，否则事后查不出「发布了什么质量的版本」。
  assert.match(src, /writeLog\('released', \{[^}]*contentReport[^}]*seoReport/);
});

test('preflight 输出两项结论，可用 --json 交给管线解析', () => {
  const r = spawnSync(process.execPath, ['scripts/preflight.mjs', '--json', '--no-seo'], {
    encoding: 'utf8',
  });
  const parsed = JSON.parse(r.stdout);
  assert.equal(typeof parsed.ok, 'boolean');
  assert.equal(typeof parsed.content.ok, 'boolean');
  assert.equal(parsed.content.hard, 0, '当前数据不应有硬问题');
});

test('preflight：preflight 自己崩掉时管线不能把两项当成通过', () => {
  const src = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  assert.match(src, /contentReport = 'preflight-error'/);
  assert.match(src, /seoReport = 'preflight-error'/);
});
