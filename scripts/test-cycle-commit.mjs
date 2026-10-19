#!/usr/bin/env node
/**
 * 撤销本轮提交的真实验证。
 * 用法：node --test scripts/test-cycle-commit.mjs
 *
 * 用临时 git 仓库实际执行，而不是断言源码文本：这个函数一旦失效，
 * 门 2 HOLD 的数据会留在历史里并在下一轮叠加（2026-10-19 累积 200 篇）。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { dropLastCommit } from './lib/cycle-commit.mjs';

function makeRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-cycle-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe', encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  writeFileSync(path.join(dir, 'base.txt'), 'base\n');
  git('add', '.');
  git('commit', '-qm', 'base');
  return { dir, git };
}

test('撤销最近一次提交，工作区内容保留', () => {
  const { dir, git } = makeRepo();
  try {
    writeFileSync(path.join(dir, 'payload.json'), '{"briefs":50}\n');
    git('add', '.');
    git('commit', '-qm', 'chore: cycle data');
    assert.equal(git('log', '--oneline').trim().split('\n').length, 2);

    const result = dropLastCommit({ cwd: dir });
    assert.equal(result.dropped, true);

    // 提交没了
    assert.equal(git('log', '--oneline').trim().split('\n').length, 1);
    assert.equal(git('log', '-1', '--format=%s').trim(), 'base');
    // 内容还在工作区，且已从索引撤出（unpublished 的东西不挂在暂存区）
    assert.equal(readFileSync(path.join(dir, 'payload.json'), 'utf8'), '{"briefs":50}\n');
    const status = git('status', '--porcelain');
    assert.match(status, /^\?\? payload\.json$/m, `实际状态: ${status}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('只有一次提交时不破坏仓库，返回失败而非抛出', () => {
  const { dir, git } = makeRepo();
  try {
    const result = dropLastCommit({ cwd: dir });
    assert.equal(result.dropped, false);
    assert.ok(result.reason);
    // 原有提交仍在
    assert.equal(git('log', '-1', '--format=%s').trim(), 'base');
    assert.equal(existsSync(path.join(dir, 'base.txt')), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('连续撤销不会波及更早的提交', () => {
  const { dir, git } = makeRepo();
  try {
    for (const name of ['a', 'b']) {
      writeFileSync(path.join(dir, `${name}.json`), '{}\n');
      git('add', '.');
      git('commit', '-qm', `cycle ${name}`);
    }
    assert.equal(dropLastCommit({ cwd: dir }).dropped, true);
    assert.equal(dropLastCommit({ cwd: dir }).dropped, true);
    assert.equal(git('log', '-1', '--format=%s').trim(), 'base');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
