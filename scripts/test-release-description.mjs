#!/usr/bin/env node
/**
 * 门 2 发布描述的回归测试。
 * 用法：node --test scripts/test-release-description.mjs
 *
 * 这段文本直接决定门 2 的 ready 分：换成如实描述后，同一批数据从
 * 0.219 升到 0.758。因此不能只断言源码里出现了某个函数名。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeReleaseFiles, readVolumeStats } from './lib/release-description.mjs';

const fakeFs = (map) => (path) => {
  if (!(path in map)) throw new Error(`ENOENT ${path}`);
  return map[path];
};

test('按类别如实列出文件，并带数据规模', () => {
  const files = [
    'src/data/ecosystem.ts',
    'src/data/daily-briefs.json',
    'src/pages/[lang]/briefs.astro',
    'scripts/pipeline.mjs',
    'package.json',
  ];
  const readFile = fakeFs({
    'src/data/daily-briefs.json': JSON.stringify([{}, {}, {}]),
    'src/data/lab-records.json': JSON.stringify({ a: 1 }),
  });
  const text = describeReleaseFiles(files, { readFile });

  assert.match(text, /Scheduled release covering 5 file\(s\)\./);
  assert.match(text, /Data refresh \(2\): ecosystem\.ts, daily-briefs\.json\./);
  // lab-records.json 不在本轮文件列表里，按设计不计入（避免把无关文件算进来）
  assert.match(text, /Current data volume: briefs=3\./);
  assert.doesNotMatch(text, /labRecords/);
  assert.match(text, /Pipeline\/script updates \(1\): pipeline\.mjs\./);
  assert.match(text, /Page\/i18n updates \(1\): pages\/\[lang\]\/briefs\.astro\./);
  assert.match(text, /Other \(1\): package\.json\./);
});

test('不写「没有逻辑变更」这类在带脚本修复时不成立的断言', () => {
  const files = ['src/data/ecosystem.ts', 'scripts/pipeline.mjs'];
  const text = describeReleaseFiles(files, { readFile: fakeFs({}) });
  assert.doesNotMatch(text, /No application logic/i);
  assert.doesNotMatch(text, /no logic changes/i);
});

test('读不到数据文件时跳过该项，不编造数字', () => {
  const files = ['src/data/daily-briefs.json'];
  const text = describeReleaseFiles(files, { readFile: fakeFs({}) });
  assert.doesNotMatch(text, /Current data volume/);
  assert.match(text, /Data refresh \(1\)/);
});

test('空文件列表不报数据规模，也不抛异常', () => {
  // 无待发布文件时，工作区里的数字不是本轮产生的，不能拿来当发布内容
  const readFile = fakeFs({ 'src/data/daily-briefs.json': JSON.stringify([1, 2, 3]) });
  const text = describeReleaseFiles([], { readFile });
  assert.equal(text, 'Scheduled release with no file changes.');
  assert.doesNotMatch(text, /Current data volume/);
});

test('未提供 readFile 时不统计数据量，也不崩', () => {
  const text = describeReleaseFiles(['src/data/daily-briefs.json']);
  assert.match(text, /Data refresh \(1\)/);
  assert.doesNotMatch(text, /Current data volume/);
});

test('只统计本轮涉及的数据文件，不把无关文件算进来', () => {
  const stats = readVolumeStats(['src/data/ecosystem.ts', 'src/data/daily-briefs.json'], fakeFs({
    'src/data/lab-records.json': JSON.stringify([1, 2, 3, 4, 5]),
    'src/data/daily-briefs.json': JSON.stringify([1, 2]),
  }));
  assert.deepEqual(stats, ['briefs=2']);
});
