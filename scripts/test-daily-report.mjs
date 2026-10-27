#!/usr/bin/env node
/**
 * 日报脚本的回归测试（零依赖，node:test）。
 * 用法：node --test scripts/test-daily-report.mjs
 *
 * summarize / streakWithoutRelease 是纯函数，直测即可；
 * 这两个函数都出过实质 bug（连续未发布天数恒为 0），所以不能只测「能跑」。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, streakWithoutRelease, buildReport } from './daily-report.mjs';

test('summarize 统计发布轮次、清理数与门2 得分', () => {
  const r = summarize([
    { stage: 'gate1' },
    { stage: 'gate2', gate2: { release_ready: { noul: 0.776 }, risk: { score: 1 } } },
    { stage: 'released', cleared: 106 },
    { stage: 'released', cleared: 4 },
  ]);
  assert.equal(r.released, 2);
  assert.equal(r.cleared, 110);
  assert.equal(r.gate2Score, 0.776);
  assert.equal(r.risk, 1);
  assert.equal(r.failures, 0);
});

test('summarize 取最后一轮 gate2 的得分', () => {
  const r = summarize([
    { stage: 'gate2', gate2: { release_ready: { noul: 0.5 } } },
    { stage: 'gate2', gate2: { release_ready: { noul: 0.9 } } },
  ]);
  assert.equal(r.gate2Score, 0.9);
});

test('summarize 认出失败与 HOLD', () => {
  const r = summarize([{ stage: 'deploy-failed' }, { stage: 'HOLD' }, { stage: 'hold-gate2' }]);
  assert.equal(r.failures, 1);
  assert.equal(r.lastFailure, 'deploy-failed');
  assert.equal(r.holds, 2);
});

test('连续未发布天数从目标日往前数，遇到发布即停', () => {
  const dates = ['2026-10-24', '2026-10-25', '2026-10-26'];
  const has = (d) => d === '2026-10-24';
  // 10-25、10-26 都空，往回数到 10-27 是 2 天。
  assert.equal(streakWithoutRelease('2026-10-27', dates, has), 2);
  assert.equal(streakWithoutRelease('2026-10-26', dates, has), 1);
  assert.equal(streakWithoutRelease('2026-10-25', dates, has), 0);
  // 目标日当天不参与计算。
  assert.equal(streakWithoutRelease('2026-10-24', dates, has), 0);
});

test('连续未发布天数在中间有发布时只数到最后一次发布为止', () => {
  const dates = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'];
  const has = (d) => d === '2026-10-21';
  assert.equal(streakWithoutRelease('2026-10-23', dates, has), 1);
});

test('buildReport 在整天没有日志时明确说 cron 没跑', () => {
  const r = buildReport({ date: '2026-10-27', today: '2026-10-27', records: null, dates: [] });
  assert.match(r.text, /没有管线日志/);
  assert.equal(r.ok, false);
});

test('buildReport 在发布日给出轮次与得分', () => {
  const r = buildReport({
    date: '2026-10-27',
    today: '2026-10-27',
    records: [
      { stage: 'gate2', gate2: { release_ready: { noul: 0.776 }, risk: { score: 1 } } },
      { stage: 'released', cleared: 106 },
    ],
    dates: [],
  });
  assert.match(r.text, /发布轮次：1/);
  assert.match(r.text, /0\.776/);
  assert.equal(r.ok, true);
});

test('buildReport 在未发布日说明卡在哪一步', () => {
  const r = buildReport({
    date: '2026-10-26',
    today: '2026-10-26',
    records: [{ stage: 'deploy-failed' }],
    dates: ['2026-10-26'],
  });
  assert.match(r.text, /发布轮次：0/);
  assert.match(r.text, /deploy-failed/);
  assert.equal(r.ok, false);
});
