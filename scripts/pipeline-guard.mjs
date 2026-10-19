#!/usr/bin/env node
/**
 * 日更前的脏区判断。
 *
 * cron 不能用「git status 非空就整轮跳过」：评测产物会把工作区永远弄脏，
 * 日更就停摆。这里只拦会跟着 `git add` 进入发布的路径。
 *
 *   - `.data/`：已跟踪的修改和未跟踪文件都忽略
 *   - `docs/coverage-full/`：只忽略未跟踪（??）；已跟踪文件的修改仍拦住
 *   - 其余路径（含 src/、public/）都拦住
 *
 * CLI：从 stdin 读 porcelain（cron 传入）；stdin 是终端时自己跑 git status。
 * 退出码 0 = 可以跑；2 = 有拦住的路径（stdout 逐行列出）；1 = git 失败。
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {string} porcelain `git status --porcelain` 原文 */
export function blockingDirty(porcelain) {
  const blocking = [];
  for (const raw of String(porcelain).split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim()) continue;
    const status = line.slice(0, 2);
    const rest = line.slice(3);
    // 重命名要同时看两端：只取目标侧会让 `src/x.ts -> .data/x.ts` 逃过检查，
    // 而源文件的删除是会跟着发布走的。
    const paths = rest.includes(' -> ')
      ? [rest.slice(0, rest.lastIndexOf(' -> ')), rest.slice(rest.lastIndexOf(' -> ') + 4)]
      : [rest];
    const unquote = (p) => (p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1) : p);
    const exempt = paths.map(unquote).every((file) => {
      if (file.startsWith('.data/')) return true;
      if (status === '??' && file.startsWith('docs/coverage-full/')) return true;
      return false;
    });
    if (exempt) continue;
    blocking.push(line);
  }
  return blocking;
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  let porcelain = '';
  if (process.stdin.isTTY) {
    try {
      porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
    } catch (err) {
      console.error(`[pipeline-guard] git status 失败: ${err.message}`);
      process.exit(1);
    }
  } else {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    porcelain = Buffer.concat(chunks).toString('utf8');
  }
  const blocking = blockingDirty(porcelain);
  if (blocking.length) {
    process.stdout.write(`${blocking.join('\n')}\n`);
    process.exit(2);
  }
  process.exit(0);
}
