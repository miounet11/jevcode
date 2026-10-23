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
  collectFindings,
  diffBaseline,
  evaluate,
  indexableLangs,
  MIN_BODY_CHARS,
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
  assert.ok(MIN_BODY_CHARS >= 4);
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
  const real = JSON.parse(readFileSync(new URL('./content-check-baseline.json', import.meta.url), 'utf8'));
  const dir = mkdtempSync(join(tmpdir(), 'content-check-'));
  const stale = join(dir, 'stale.json');
  writeFileSync(
    stale,
    JSON.stringify({ version: 1, updated: '2026-01-01', keys: [...real.keys, 'de:industry:gone-slug'] }),
  );
  const r = spawnSync(process.execPath, [SCRIPT, `--baseline=${stale}`], { encoding: 'utf8' });
  assert.equal(r.status, 0, `存量的多余 key 不该失败，实际 ${r.status}\n${r.stdout}`);
  assert.match(r.stdout, /NOTE 基线里有 1 条已修复/);
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

test('管线只在内容校验失败时记录，不阻断发布', () => {
  const src = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  // 硬拦会让翻译没跟上就停掉日更（10-18~10-22 连续停更的教训）。
  assert.match(src, /contentReport = 'issues'/);
  assert.doesNotMatch(src, /if \(!buildOk \|\| !checkOk \|\| contentReport/);
});
