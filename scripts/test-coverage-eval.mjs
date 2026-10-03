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
import { chunk, summarize, renderReport, misses, shouldFail } from './lib/coverage-eval.mjs';

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

test('丢题计入分母：只收到部分结果不会把命中率算成满分', () => {
  // 8 条语料，只回了 2 条且都命中。裸遍历 results 会得到 100%，是错的。
  const many = Array.from({ length: 8 }, (_, i) => ({
    id: `c${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const partial = [
    { id: 'c0', ours: ok('yes') },
    { id: 'c1', ours: ok('yes') },
  ];
  const s = summarize(partial, many, 'ours', ['industry']);
  assert.equal(s.totals.total, 8, '分母应是语料条数 8');
  assert.equal(s.totals.missing, 6, '未收到结果的 6 条应记为丢题');
  assert.equal(s.totals.answered, 2);
  assert.equal(s.totals.accuracy, 1, '命中率仍按已答算，但 missing 必须暴露');
  assert.equal(s.byAxis.industry.find((r) => r.key === 'e').missing, 6, '丢题要进维度 bucket');
});

test('shouldFail：一批都没成必须判失败（旧实现 total=0 会误判为成功）', () => {
  const s = summarize([], cases, 'ours', ['industry']);
  assert.equal(s.totals.total, cases.length);
  assert.equal(s.totals.missing, cases.length);
  assert.equal(shouldFail(s, 0.5), true, '全部丢题应判失败');
  // 空语料也视为失败，避免「没跑任何东西」被当成功
  assert.equal(shouldFail(summarize([], [], 'ours', ['industry']), 0.5), true);
});

test('shouldFail：少量丢题且多数命中时不判失败', () => {
  const many = Array.from({ length: 8 }, (_, i) => ({
    id: `d${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const results = many.map((c) => ({ id: c.id, ours: ok('yes') }));
  assert.equal(shouldFail(summarize(results, many, 'ours', ['industry']), 0.5), false);
});

test('renderReport 出现丢题时给出显式警示', () => {
  const many = Array.from({ length: 4 }, (_, i) => ({
    id: `m${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const s = summarize([{ id: 'm0', ours: ok('yes') }], many, 'ours', ['industry']);
  const md = renderReport(s, { sample: many.length });
  assert.match(md, /丢题/, '应出现丢题字样');
  assert.match(md, /⚠️/, '应给出警示');
  assert.match(md, /分母 4/, '应显示分母为语料条数');
});

test('renderReport 含总数与各维度小节', () => {
  const results = [{ id: 'a', ours: ok('yes') }];
  const s = summarize(results, cases, 'ours', ['industry', 'dimension']);
  const md = renderReport(s, { generatedAt: 'T', model: 'clavue-jev', sample: 1 });
  assert.match(md, /总命中率/);
  assert.match(md, /## industry/);
  assert.match(md, /## dimension/);
});
