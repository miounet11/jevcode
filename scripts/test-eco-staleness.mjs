#!/usr/bin/env node
/**
 * 生态保鲜护栏的回归测试。
 * 用法：node --test scripts/test-eco-staleness.mjs
 *
 * 背景：门 1 的 worth 在同一批数据上抖动于 0.001~0.473，阈值 0.5 几乎不可能越过，
 * 站点 "data as of" 会无限期停在旧日期。陈旧天数作为确定事实用于兜底。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecoStaleDays, isEcoStale } from './lib/eco-staleness.mjs';

const NOW = new Date('2026-10-18T09:00:00+08:00').getTime();

test('按整天向下取整计算陈旧天数', () => {
  assert.equal(ecoStaleDays('2026-10-18T08:00:00+08:00', NOW), 0);
  assert.equal(ecoStaleDays('2026-10-17T09:00:00+08:00', NOW), 1);
  assert.equal(ecoStaleDays('2026-10-15T10:00:00+08:00', NOW), 2);
});

test('达到阈值即判为陈旧（含等于）', () => {
  assert.equal(isEcoStale('2026-10-15T09:00:00+08:00', 3, NOW).stale, true);
  assert.equal(isEcoStale('2026-10-16T09:00:00+08:00', 3, NOW).stale, false);
  assert.equal(isEcoStale('2026-10-13T09:00:00+08:00', 3, NOW).stale, true);
});

test('基准缺失或非法时不拦截（没有依据就不强制发布）', () => {
  for (const bad of [null, undefined, '', 'not-a-date']) {
    const r = isEcoStale(bad, 3, NOW);
    assert.equal(r.stale, false, `基准 ${JSON.stringify(bad)} 不应判为陈旧`);
    assert.equal(r.days, null);
  }
});

test('未来时间不会算出负数', () => {
  assert.equal(ecoStaleDays('2026-10-20T09:00:00+08:00', NOW), 0);
});
