#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextBriefSources, checkJudgedBatch, backfillJudgments, briefHeading } from './lib/daily-briefs.mjs';

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
