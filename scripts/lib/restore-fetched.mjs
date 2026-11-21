#!/usr/bin/env node
/**
 * 异常中止（超时 124 或未捕获崩溃）后的工作区自愈。
 *
 * 管线在开始前已通过 pipeline-guard.mjs 确认工作区干净（无会进入发布的改动）。
 * 一旦运行中途被 run-with-timeout.sh 按组 SIGTERM/SIGKILL 终止，pipeline.mjs
 * 来不及跑 restoreFetched() / dropThisCycleCommit()，会留下脏的抓取文件
 * （如 2026-11-14 的 M src/data/ecosystem.ts），进而触发脏区保护导致后续每天
 * 永久 SKIPPED 自锁（11-15~11-21 连续 7 天）。
 *
 * 这里只做严格有界的还原：
 *   1. 若传入 --pre-head 且当前 HEAD 恰好比它多 1 笔「未推送到 origin/main 的
 *      chore(eco): 生态数据自动刷新」提交，撤销该半成品提交；已推送的提交绝不动。
 *   2. 只还原 FETCHED_FILES 白名单里被改脏的已跟踪文件，绝不碰白名单外的手工改动。
 *
 * 用法：node scripts/lib/restore-fetched.mjs [--pre-head=<sha>]
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FETCHED_FILES } from './pipeline-files.mjs';
import { dropLastCommit } from './cycle-commit.mjs';

const CYCLE_SUBJECT_PREFIX = 'chore(eco): 生态数据自动刷新';

function defaultGit(cwd) {
  return (args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * 还原白名单里所有已变脏的抓取文件。
 * @param {{ cwd?: string, files?: string[], run?: (args: string[]) => string }} options
 * @returns {string[]} 实际被还原的文件路径列表
 */
export function restoreFetchedFiles(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const files = options.files ?? FETCHED_FILES;
  const run = options.run ?? defaultGit(cwd);
  const restored = [];

  for (const file of files) {
    let status = '';
    try {
      status = String(run(['status', '--porcelain', '--', file]) ?? '').trim();
    } catch {
      continue;
    }
    if (!status) continue;
    try {
      run(['checkout', '--', file]);
      restored.push(file);
    } catch {
      // 单文件还原失败不中断其余文件清理
    }
  }
  return restored;
}

/**
 * 中止后的完整恢复：必要时撤销未推送的本轮自动提交，再还原抓取文件。
 * @param {{ cwd?: string, preRunHead?: string, remoteRef?: string, files?: string[], run?: (args: string[]) => string }} options
 * @returns {{ droppedCommit: boolean, restored: string[], note?: string }}
 */
export function recoverAbortedCycle(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const preRunHead = (options.preRunHead ?? '').trim();
  const remoteRef = options.remoteRef ?? 'origin/main';
  const run = options.run ?? defaultGit(cwd);

  let droppedCommit = false;
  let note;

  if (preRunHead) {
    try {
      const head = String(run(['rev-parse', 'HEAD'])).trim();
      if (head && head !== preRunHead) {
        let parent = '';
        try {
          parent = String(run(['rev-parse', 'HEAD~1'])).trim();
        } catch {
          parent = '';
        }
        const subject = String(run(['log', '-1', '--format=%s', 'HEAD'])).trim();
        let alreadyOnRemote = false;
        try {
          run(['merge-base', '--is-ancestor', head, remoteRef]);
          alreadyOnRemote = true;
        } catch {
          alreadyOnRemote = false;
        }

        if (parent === preRunHead && subject.startsWith(CYCLE_SUBJECT_PREFIX) && !alreadyOnRemote) {
          const r = dropLastCommit({ cwd, run });
          droppedCommit = r.dropped;
          if (!r.dropped) note = `drop failed: ${r.reason}`;
        } else if (alreadyOnRemote) {
          note = 'commit already pushed, kept';
        }
      }
    } catch (err) {
      note = `head check skipped: ${err?.message ?? String(err)}`;
    }
  }

  const restored = restoreFetchedFiles({ cwd, files: options.files, run });
  return { droppedCommit, restored, ...(note ? { note } : {}) };
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const preArg = process.argv.slice(2).find((a) => a.startsWith('--pre-head='));
  const preRunHead = preArg ? preArg.slice('--pre-head='.length) : '';
  const result = recoverAbortedCycle({ preRunHead });
  if (result.droppedCommit) {
    console.log('[cron-recover] 已撤销本轮未推送的自动提交');
  }
  if (result.restored.length > 0) {
    console.log(`[cron-recover] 已还原抓取写入（防止下轮脏区自锁）：${result.restored.join(', ')}`);
  }
  if (result.note) {
    console.log(`[cron-recover] ${result.note}`);
  }
}
