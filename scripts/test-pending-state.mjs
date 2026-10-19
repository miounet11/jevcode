#!/usr/bin/env node
/**
 * pending 状态读取的回归测试。
 * 用法：node --test scripts/test-pending-state.mjs
 *
 * 核心约定：文件不存在可以当空批次；文件存在但损坏必须失败。混为一谈会让
 * 损坏的数据被当成「没有待发布内容」，随后被空对象覆盖，累积批次永久丢失。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPendingState, PendingCorruptError } from './lib/pending-state.mjs';

const fake = (content) => ({
  exists: () => true,
  read: () => content,
});

test('文件不存在时返回空批次（首次运行）', () => {
  const state = loadPendingState('/nope.json', { exists: () => false, read: () => { throw new Error('不应被调用'); } });
  assert.deepEqual(state, { last_release: null, pending: {} });
});

test('正常文件原样返回', () => {
  const payload = { last_release: '2026-10-19T00:00:00Z', pending: { 'a/b': { rel: 0.3 } } };
  const state = loadPendingState('/x.json', fake(JSON.stringify(payload)));
  assert.deepEqual(state, payload);
});

test('损坏文件抛 PendingCorruptError，而不是返回空批次', () => {
  for (const broken of ['{broken', '', '{"pending":']) {
    assert.throws(
      () => loadPendingState('/x.json', fake(broken)),
      PendingCorruptError,
      `内容 ${JSON.stringify(broken)} 应被判定为损坏`,
    );
  }
});

test('损坏状态不会被误读成 0 个待发布仓库', () => {
  let result;
  try {
    result = loadPendingState('/x.json', fake('{broken'));
  } catch (err) {
    assert.ok(err instanceof PendingCorruptError);
    assert.match(err.message, /解析失败/);
    return;
  }
  assert.fail(`损坏文件被当成有效状态: ${JSON.stringify(result)}`);
});
