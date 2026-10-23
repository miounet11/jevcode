#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextBriefSources, checkJudgedBatch, backfillJudgments, briefHeading, localizeTerm, localizedBrief } from './lib/daily-briefs.mjs';

const TERMS = {
  industry: { saas: { ja: 'SaaS' } },
  scene: { chat: { ja: 'チャット' } },
  tag: { outage: {} },
  dimension: { urgency: { ja: '緊急度' } },
};

const row = (id, extra = {}) => ({
  id,
  industry: 'ecommerce',
  dimension: 'urgency',
  tag: 'sla-breach',
  scene: 'support-ticket',
  stage: 'intake',
  context: 'Ticket: buyer reports the order is failing right now and needs it fixed today.',
  question: 'Does this message convey urgency that should jump the queue?',
  choices: ['yes', 'no'],
  accept: ['yes'],
  ...extra,
});

test('跳过已发布、过短和选项不足的条目，并停在上限', () => {
  const coverage = [
    row('cov-ecommerce-urgency-01'),
    row('note-not-a-case'),
    row('cov-ecommerce-urgency-02', { context: 'short' }),
    row('cov-ecommerce-urgency-03', { choices: ['only'] }),
    row('cov-ecommerce-urgency-04', { accept: ['maybe', 'yes'] }),
    row('cov-ecommerce-urgency-05'),
  ];
  const picked = nextBriefSources(coverage, ['cov-ecommerce-urgency-01'], 1);
  assert.equal(picked.length, 1);
  assert.equal(picked[0].id, 'cov-ecommerce-urgency-04');
  assert.deepEqual(picked[0].accept, ['yes']);
  assert.equal('judgment' in picked[0], false);
});

test('批次跨行业跨维度轮转，不再按语料分块顺序取', () => {
  const industries = ['ecommerce', 'fintech', 'banking'];
  const dims = ['urgency', 'intent', 'safety'];
  const coverage = [];
  for (const industry of industries) {
    for (const dimension of dims) {
      for (let i = 1; i <= 8; i += 1) {
        coverage.push(row(`cov-${industry}-${dimension}-0${i}`, { industry, dimension }));
      }
    }
  }
  const picked = nextBriefSources(coverage, [], 6);
  assert.equal(picked.length, 6);
  assert.equal(new Set(picked.map((x) => x.industry)).size, industries.length);
  assert.equal(new Set(picked.map((x) => x.dimension)).size, dims.length);
});

test('连续多批仍不重复，且能覆盖全部条目', () => {
  const industries = ['ecommerce', 'fintech'];
  const dims = ['urgency', 'intent'];
  const coverage = [];
  for (const industry of industries) {
    for (const dimension of dims) {
      for (let i = 1; i <= 3; i += 1) coverage.push(row(`cov-${industry}-${dimension}-0${i}`, { industry, dimension }));
    }
  }
  const seen = [];
  for (let batch = 0; batch < 3; batch += 1) {
    seen.push(...nextBriefSources(coverage, seen, 4).map((x) => x.id));
  }
  assert.equal(seen.length, 12);
  assert.equal(new Set(seen).size, 12);
});

test('不从语料以外的字段补内容', () => {
  const picked = nextBriefSources([row('cov-ecommerce-urgency-09', { score: 0.99, prose: 'invented' })], [], 5);
  assert.deepEqual(Object.keys(picked[0]).sort(), [
    'accept', 'choices', 'context', 'dimension', 'id', 'industry', 'question', 'scene', 'stage', 'tag',
  ]);
});

test('判定全部成功且达标时放行', () => {
  const rows = [
    { accept: ['yes'], judgment: { choice: 'yes' } },
    { accept: ['no'], judgment: { choice: 'no' } },
  ];
  const v = checkJudgedBatch(rows, { minAccuracy: 0.8 });
  assert.equal(v.pass, true);
  assert.equal(v.accuracy, 1);
});

test('准确率低于阈值时整批拦截', () => {
  const rows = [
    { accept: ['yes'], judgment: { choice: 'no' } },
    { accept: ['yes'], judgment: { choice: 'yes' } },
  ];
  const v = checkJudgedBatch(rows, { minAccuracy: 0.8 });
  assert.equal(v.pass, false);
  assert.equal(v.reason, 'below-threshold');
  assert.equal(v.accuracy, 0.5);
});

test('配了 key 却整批没有判定时不静默放行', () => {
  const rows = [{ accept: ['yes'], judgment: null }, { accept: ['no'], judgment: null }];
  const v = checkJudgedBatch(rows, { minAccuracy: 0.8, expectJudgment: true });
  assert.equal(v.pass, false);
  assert.equal(v.reason, 'no-judgment');
  assert.equal(v.accuracy, null);
});

test('未配置 key 时按设计只发语料，不套用准入门槛', () => {
  const rows = [{ accept: ['yes'], judgment: null }];
  const v = checkJudgedBatch(rows, { minAccuracy: 0.8, expectJudgment: false });
  assert.equal(v.pass, true);
  assert.equal(v.accuracy, null);
});

test('恰好等于阈值时放行（不是严格大于）', () => {
  const rows = [];
  for (let i = 0; i < 8; i += 1) rows.push({ accept: ['yes'], judgment: { choice: 'yes' } });
  for (let i = 0; i < 2; i += 1) rows.push({ accept: ['yes'], judgment: { choice: 'no' } });
  const v = checkJudgedBatch(rows, { minAccuracy: 0.8 });
  assert.equal(v.accuracy, 0.8);
  assert.equal(v.pass, true);
});

test('空批次视为语料发完，不误判为判定链路故障', () => {
  for (const expectJudgment of [true, false]) {
    const v = checkJudgedBatch([], { minAccuracy: 0.8, expectJudgment });
    assert.equal(v.pass, true, `expectJudgment=${expectJudgment} 时空批次不应拦截`);
    assert.equal(v.reason, 'empty');
    assert.equal(v.accuracy, null);
  }
  // undefined / null 也应安全
  assert.equal(checkJudgedBatch(undefined).pass, true);
  assert.equal(checkJudgedBatch(null).pass, true);
});

test('回填只处理空判定条目，失败的保持原样', async () => {
  const rows = [
    { id: 'a', judgment: { choice: 'yes' } },
    { id: 'b', judgment: null },
    { id: 'c', judgment: { ok: false } },
    { id: 'd', judgment: null },
  ];
  const calls = [];
  const filled = await backfillJudgments(rows, {
    limit: 10,
    judge: async (row) => {
      calls.push(row.id);
      return row.id === 'c' ? null : { ok: true, choice: 'yes' };
    },
  });
  assert.equal(filled, 2);
  assert.deepEqual(calls, ['b', 'c', 'd'], '已判定的 a 不应被再次调用');
  assert.equal(rows[0].judgment.choice, 'yes');
  assert.equal(rows[2].judgment.ok, false, '回填失败时不得覆盖原有记录');
  assert.equal(rows[1].judgment.choice, 'yes');
  assert.equal(rows[3].judgment.choice, 'yes');
});

test('回填受 limit 限制，避免一轮打满额度', async () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({ id: `r${i}`, judgment: null }));
  let calls = 0;
  const filled = await backfillJudgments(rows, {
    limit: 3,
    judge: async () => { calls += 1; return { ok: true, choice: 'yes' }; },
  });
  assert.equal(calls, 3);
  assert.equal(filled, 3);
  assert.equal(rows.filter((r) => r.judgment).length, 3);
});

test('sources 非空但一条判定都没成功时，门槛拦截而非放行', () => {
  // 复现 daily-briefs.mjs 的调用方式：配了 key、批次非空、judge 全失败
  const added = [
    { accept: ['yes'], judgment: null },
    { accept: ['no'], judgment: null },
  ];
  const v = checkJudgedBatch(added, { minAccuracy: 0.8, expectJudgment: true });
  assert.equal(added.length > 0, true, '批次非空才会走到门槛');
  assert.equal(v.pass, false);
  assert.equal(v.reason, 'no-judgment');
});

test('标题补上 dimension 后，全语料 7680 条不重复', () => {
  const rows = [];
  for (const industry of ['ecommerce', 'fintech']) {
    for (const scene of ['chat', 'email']) {
      for (const tag of ['refund', 'security']) {
        for (const dimension of ['urgency', 'intent']) {
          rows.push(row(`${industry}-${scene}-${tag}-${dimension}`, { industry, scene, tag, dimension }));
        }
      }
    }
  }
  const headings = rows.map((r) => briefHeading(r));
  assert.equal(new Set(headings).size, rows.length);
  assert.equal(headings[0], 'ecommerce · chat · refund · urgency');
});

test('标题缺字段时不留空段', () => {
  assert.equal(briefHeading({ industry: 'saas', scene: '', tag: 'outage', dimension: 'priority' }), 'saas · outage · priority');
  assert.equal(briefHeading({ industry: 'saas' }), 'saas');
});

test('同一天已发够时不再追加（按天幂等）', () => {
  const script = readFileSync(new URL('./daily-briefs.mjs', import.meta.url), 'utf8');
  // 2026-10-19 三次 HOLD 后成功一轮，同日累积 200 篇；这里从源头禁止重复写入。
  assert.match(script, /const alreadyToday = existing\.filter\(\(row\) => row\.published === published\)\.length/);
  assert.match(script, /if \(alreadyToday >= LIMIT\)/);
  assert.match(script, /reason: 'already-published-today'/);
  // 剩余额度要扣掉今天已发的部分，否则同日补跑会超额
  assert.match(script, /LIMIT - alreadyToday/);
});

test('英文标题不受语言参数影响（en 是语料原文）', () => {
  const r = row('a', { industry: 'saas', scene: 'chat', tag: 'outage', dimension: 'urgency' });
  assert.equal(briefHeading(r), briefHeading(r, 'en', TERMS));
});

test('各语言站点标题按术语表产出不同文本', () => {
  const r = row('a', { industry: 'saas', scene: 'chat', tag: 'outage', dimension: 'urgency' });
  assert.equal(briefHeading(r, 'ja', TERMS), 'SaaS · チャット · outage · 緊急度');
  // 术语表里没有的语言仍回退英文原 slug，不产出空段
  assert.equal(briefHeading(r, 'ko', TERMS), 'saas · chat · outage · urgency');
});

test('localizeTerm 保留未登记的 slug', () => {
  assert.equal(localizeTerm('tag', 'brand-new-slug', 'ja', TERMS), 'brand-new-slug');
  assert.equal(localizeTerm('tag', 'outage', 'ja', TERMS), 'outage');
  assert.equal(localizeTerm('tag', undefined, 'ja', TERMS), '');
});

test('localizedBrief 取该语言译文，缺失时回退英文原文并标记未本地化', () => {
  const r = row('b', { context: 'Ticket: order broken.', question: 'Urgent?', choices: ['yes', 'no'] });
  const map = { b: { ja: { context: 'チケット：注文が壊れています。', question: '緊急ですか？', choices: ['yes', 'no'] } } };
  const ja = localizedBrief(r, 'ja', map);
  assert.equal(ja.context, 'チケット：注文が壊れています。');
  assert.equal(ja.localized, true);

  const ko = localizedBrief(r, 'ko', map);
  assert.equal(ko.context, 'Ticket: order broken.');
  assert.equal(ko.localized, false);
});

test('术语表不含照抄 slug / CJK 站点写英文的坏值', () => {
  const terms = JSON.parse(readFileSync(new URL('../src/data/brief-terms.json', import.meta.url), 'utf8'));
  const cjk = new Set(['zh', 'ja', 'ko']);
  const bad = [];
  for (const [field, slugs] of Object.entries(terms)) {
    for (const [slug, langs] of Object.entries(slugs)) {
      const words = new Set(slug.toLowerCase().split(/[\s-]+/));
      for (const [lang, value] of Object.entries(langs)) {
        const flat = value.toLowerCase().split(/[\s-]+/);
        if (cjk.has(lang) && /^[\x00-\x7F]+$/.test(value)) bad.push([field, slug, lang, value]);
        else if (lang === 'ko' && !/[\uAC00-\uD7A3]/.test(value)) bad.push([field, slug, lang, value]);
        // 只抓「多词 slug 被拆成空格照抄」（"support ticket" 之类）。
        // 单词同形不算错：德语 Compliance、法语 incident、西语 no 本来就这么写。
        else if (words.size > 1 && flat.every((w) => words.has(w))) bad.push([field, slug, lang, value]);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('管线发布白名单含案例译文，且日更后紧跟翻译步骤', async () => {
  // 直接断言白名单本身，而不是在 pipeline.mjs 源码里搜字符串：
  // 字符串写在注释或无关代码里同样会被正则命中。
  const pipeline = readFileSync(new URL('./pipeline.mjs', import.meta.url), 'utf8');
  const { STAGE_FILES, SIDE_FILES } = await import('./lib/pipeline-files.mjs');
  // 译文不进白名单，语言站点就永远拿不到日更增量。
  for (const file of ['src/data/briefs-i18n.json', 'src/data/brief-terms.json', 'src/data/brief-terms.ts']) {
    assert.ok(STAGE_FILES.includes(file), `${file} 不在发布白名单里`);
    assert.ok(SIDE_FILES.includes(file), `${file} 不在有改动即发布的判断里`);
  }

  // 抓取阶段写回的文件必须在还原白名单里，否则 HOLD 退出时留下脏文件，
  // cron 的脏区保护下一轮就永久拦下这一轮。
  const { FETCHED_FILES } = await import('./lib/pipeline-files.mjs');
  for (const file of ['src/data/briefs-i18n.json', 'src/data/brief-terms.json', 'src/data/brief-terms.ts']) {
    assert.ok(FETCHED_FILES.includes(file), `${file} 不在还原白名单里`);
  }

  // 还原的前提是这些文件真的由抓取阶段的翻译步骤写入，而不是手工维护。
  const py = readFileSync(new URL('./translate-briefs.py', import.meta.url), 'utf8');
  for (const file of ['src/data/briefs-i18n.json', 'src/data/brief-terms.json', 'src/data/brief-terms.ts']) {
    assert.ok(py.includes(file), `翻译脚本没有写出 ${file}`);
  }
  // 翻译步骤必须在抓取阶段里（restoreFetched 只在抓取时生效）。
  const fetchIdx = pipeline.indexOf('if (!SKIP_FETCH) {');
  assert.ok(fetchIdx > -1);
  const refreshIdx = pipeline.indexOf('refreshBriefs();');
  assert.ok(refreshIdx > fetchIdx, 'refreshBriefs 不在抓取阶段里，翻译产物就不会被还原');

  // 翻译必须在案例发布之后跑，否则新案例没有译文。
  const briefIdx = pipeline.indexOf('node scripts/daily-briefs.mjs');
  const trIdx = pipeline.indexOf('python3 scripts/translate-briefs.py --lang=all');
  assert.ok(briefIdx > -1 && trIdx > -1);
  assert.ok(trIdx > briefIdx, '翻译步骤没有跟在案例发布之后');
});

test('选择项按语言本地化，键仍是英文 slug', () => {
  // 选项是判分用的键，翻译不能改键；展示层查术语表拿本地化词。
  const terms = {
    choice: { yes: { ja: 'はい', de: 'Ja' }, no: { ja: 'いいえ' } },
  };
  assert.equal(localizeTerm('choice', 'yes', 'ja', terms), 'はい');
  assert.equal(localizeTerm('choice', 'no', 'ja', terms), 'いいえ');
  // 没登记的选项回退原 slug，不产出空段
  assert.equal(localizeTerm('choice', 'escalate', 'ja', terms), 'escalate');
  // 英文站保持原样
  assert.equal(localizeTerm('choice', 'yes', 'en', terms), 'yes');
});

test('每个选项在每个目标语言下都有译文', () => {
  // 只查键存在会把「登记了但没译完」判成通过；这里逐语言核对。
  const briefs = JSON.parse(readFileSync(new URL('../src/data/daily-briefs.json', import.meta.url), 'utf8'));
  const terms = JSON.parse(readFileSync(new URL('../src/data/brief-terms.json', import.meta.url), 'utf8'));
  const LANGS = ['zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];
  const missing = [];
  for (const row of briefs) {
    for (const choice of row.choices ?? []) {
      for (const lang of LANGS) {
        const value = terms.choice?.[choice]?.[lang];
        if (typeof value !== 'string' || !value.trim()) missing.push(`${choice}/${lang}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});
