/**
 * 撤销本轮产物提交。
 *
 * 管线在门 2 之前就提交了数据，而 restoreFetched() 只能还原「未提交」的写入。
 * 门 2 HOLD 时这批数据其实已经进了历史，下一轮又在它之上追加：2026-10-19
 * 三轮 HOLD 加一轮成功，同一天累积了 200 篇（应为 50）。
 *
 * 这里把撤销动作做成只依赖 git 的纯操作，便于用临时仓库真实验证。
 */

import { execFileSync } from 'node:child_process';

/**
 * 撤销最近一次提交，但保留工作区内容。
 * @param {{ cwd?: string, run?: (args: string[]) => void }} options
 * @returns {{ dropped: boolean, reason?: string }}
 */
export function dropLastCommit(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const run = options.run ?? ((args) => execFileSync('git', args, { cwd, stdio: 'pipe' }));
  try {
    run(['reset', '--soft', 'HEAD~1']);
    run(['reset', 'HEAD', '--', '.']);
    return { dropped: true };
  } catch (err) {
    return { dropped: false, reason: err?.message ?? String(err) };
  }
}
