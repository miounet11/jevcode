#!/usr/bin/env node
/**
 * 覆盖评测聚合逻辑验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-coverage-eval.mjs
 *
 * 用构造好的 runCompare 结果做纯计算断言，不依赖真实上游：
 *   - chunk 分批正确
 *   - summarize 命中率按维度汇总正确（含未答/出错不计入分母）
 *   - misses 只挑未命中且能对回语料
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunk, summarize, renderReport, misses } from './lib/coverage-eval.mjs';

const cases = [
  { id: 'a', accept: ['yes'], industry: 'ecommerce', dimension: 'urgency', tag: 'outage', scene: 'chat', stage: 'intake' },
  { id: 'b', accept: ['no'], industry: 'ecommerce', dimension: 'urgency', tag: 'outage', scene: 'chat', stage: 'intake' },
  { id: 'c', accept: ['yes'], industry: 'fintech', dimension: 'safety', tag: 'security', scene: 'email', stage: 'triage' },
  { id: 'd', accept: ['grant'], industry: 'fintech', dimension: 'safety', tag: 'security', scene: 'email', stage: 'triage' },
];

const ok = (choice) => ({ ok: true, model: 'clavue-jev', choice, ms: 5 });
const err = (e) => ({ ok: false, model: 'clavue-jev', error: e, ms: 5 });

test('chunk 按批大小切分', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2).map((b) => b.length), [2, 2, 1]);
  assert.deepEqual(chunk([], 8), []);
});

test('summarize：命中率按维度汇总，出错不计入分母', () => {
  const results = [
    { id: 'a', ours: ok('yes') },   // 命中
    { id: 'b', ours: ok('yes') },   // 未命中（期望 no）
    { id: 'c', ours: err('timeout') }, // 出错
    { id: 'd', ours: ok('grant') }, // 命中
  ];
  const s = summarize(results, cases, 'ours', ['industry', 'dimension', 'tag']);
  assert.equal(s.totals.total, 4);
  assert.equal(s.totals.answered, 3);
  assert.equal(s.totals.hit, 2);
  assert.equal(s.totals.errors, 1);
  assert.equal(s.totals.accuracy, 2 / 3);

  const ecom = s.byAxis.industry.find((r) => r.key === 'ecommerce');
  assert.equal(ecom.n, 2);
  assert.equal(ecom.answered, 2);
  assert.equal(ecom.hit, 1);
  assert.equal(ecom.accuracy, 0.5);

  const fin = s.byAxis.industry.find((r) => r.key === 'fintech');
  assert.equal(fin.answered, 1, '出错的一条不计入已答');
  assert.equal(fin.accuracy, 1); // 唯一的已答项 d 命中

  const sec = s.byAxis.tag.find((r) => r.key === 'security');
  assert.equal(sec.accuracy, 1);
});

test('summarize：全出错时 accuracy 为 null', () => {
  const results = [{ id: 'a', ours: err('x') }];
  const s = summarize(results, cases, 'ours', ['industry']);
  assert.equal(s.totals.accuracy, null);
  assert.equal(s.byAxis.industry.find((r) => r.key === 'ecommerce').accuracy, null);
});

test('misses：只挑未命中的已答题，并对回语料字段', () => {
  const results = [
    { id: 'a', ours: ok('yes') },
    { id: 'b', ours: ok('yes') },   // 未命中
    { id: 'c', ours: err('x') },    // 出错，不算 miss
  ];
  const m = misses(results, cases, 'ours');
  assert.equal(m.length, 1);
  assert.equal(m[0].id, 'b');
  assert.deepEqual(m[0].expected, ['no']);
  assert.equal(m[0].got, 'yes');
  assert.equal(m[0].industry, 'ecommerce');
});

test('misses：limit 生效', () => {
  const results = cases.map((c) => ({ id: c.id, ours: ok('zzz') }));
  assert.equal(misses(results, cases, 'ours', 2).length, 2);
});

test('renderReport 含总数与各维度小节', () => {
  const results = [{ id: 'a', ours: ok('yes') }];
  const s = summarize(results, cases, 'ours', ['industry', 'dimension']);
  const md = renderReport(s, { generatedAt: 'T', model: 'clavue-jev', sample: 1 });
  assert.match(md, /总命中率/);
  assert.match(md, /## industry/);
  assert.match(md, /## dimension/);
});
