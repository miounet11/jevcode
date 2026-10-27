#!/usr/bin/env node
/**
 * 选题池健康度回归（零依赖，node:test）。
 * 用法：node --test scripts/test-brief-pool.mjs
 *
 * 池子见底是静默失败：脚本照常 exit 0，只是每天少发几篇、最后变成 0 篇。
 * 这条判据是唯一能提前发现它的地方。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessPool, LOW_DAYS_THRESHOLD } from './lib/brief-pool.mjs';

test('余量充足时返回 ok 并给出剩余天数', () => {
  const r = assessPool({ remaining: 7230, perDay: 50 });
  assert.equal(r.level, 'ok');
  assert.equal(r.daysLeft, 144);
});

test('余量低于阈值时返回 low，提示补语料', () => {
  // 29 天 < 30 天阈值，应触发 low
  const r = assessPool({ remaining: 29 * 50, perDay: 50 });
  assert.equal(r.level, 'low');
  assert.equal(r.daysLeft, 29);
  assert.match(r.message, /请补语料/);
  assert.ok(r.daysLeft < LOW_DAYS_THRESHOLD);
});

test('刚好达到阈值时仍算 ok（阈值是「低于才告警」）', () => {
  const r = assessPool({ remaining: LOW_DAYS_THRESHOLD * 50, perDay: 50 });
  assert.equal(r.level, 'ok');
  assert.equal(r.daysLeft, LOW_DAYS_THRESHOLD);
});

test('余量为 0 时返回 empty，并点名会发布 0 篇', () => {
  const r = assessPool({ remaining: 0, perDay: 50 });
  assert.equal(r.level, 'empty');
  assert.match(r.message, /发布 0 篇/);
});

test('余量为负（异常输入）按耗尽处理，不返回负数天数', () => {
  const r = assessPool({ remaining: -10, perDay: 50 });
  assert.equal(r.level, 'empty');
  assert.equal(r.daysLeft, 0);
});

test('perDay 缺失时退回默认 50，不会算出 Infinity', () => {
  const r = assessPool({ remaining: 500, perDay: 0 });
  assert.equal(r.daysLeft, 10);
  assert.ok(Number.isFinite(r.daysLeft));
});
