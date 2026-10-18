#!/usr/bin/env node
/**
 * 门 1 连续 HOLD 计数的回归测试。
 * 用法：node --test scripts/test-gate-streak.mjs
 *
 * 关键约定：计数必须跨天累计，不能因为 HOLD 文件按日期新建就每天从 1 开始。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { bumpGate1Streak, resetGate1Streak, readGate1Streak } from './lib/gate-streak.mjs';

function withState(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-streak-'));
  try {
    return fn(path.join(dir, 'gate1-streak.json'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('跨天连续 HOLD 会累加，不因日期变化重置', () => withState((file) => {
  assert.equal(bumpGate1Streak(file, new Date('2026-10-14T09:30:00Z')), 1);
  assert.equal(bumpGate1Streak(file, new Date('2026-10-15T09:30:00Z')), 2);
  assert.equal(bumpGate1Streak(file, new Date('2026-10-16T09:30:00Z')), 3);
  assert.equal(readGate1Streak(file), 3);
}));

test('发布成功后归零，下一轮从 1 开始', () => withState((file) => {
  bumpGate1Streak(file);
  bumpGate1Streak(file);
  assert.equal(readGate1Streak(file), 2);
  resetGate1Streak(file);
  assert.equal(readGate1Streak(file), 0);
  assert.equal(bumpGate1Streak(file), 1);
}));

test('状态文件不存在时归零不报错，也不凭空创建', () => withState((file) => {
  assert.equal(resetGate1Streak(file), 0);
  assert.equal(readGate1Streak(file), 0);
}));

test('状态文件损坏时从 0 重新计数', () => withState((file) => {
  bumpGate1Streak(file);
  writeFileSync(file, '{broken');
  assert.equal(readGate1Streak(file), 0);
  assert.equal(bumpGate1Streak(file), 1);
}));
