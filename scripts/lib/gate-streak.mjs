/**
 * 门 1（量级门）连续 HOLD 计数。
 *
 * 之前用「当天 HOLD 文件里的行数」当轮数，而文件按 UTC 日期新建，跨天后必然
 * 从 1 重新开始，连续失败看起来永远像偶发。这里改成跨天持久的状态文件。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DEFAULT_FILE = '.research/pipeline-state/gate1-streak.json';

function readState(file) {
  try {
    const state = JSON.parse(readFileSync(file, 'utf8'));
    return { streak: Number(state.streak) || 0, ...state };
  } catch {
    return { streak: 0 };
  }
}

function ensureDir(file) {
  const dir = file.slice(0, file.lastIndexOf('/'));
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** 记一轮 HOLD，返回累计轮数。 */
export function bumpGate1Streak(file = DEFAULT_FILE, now = new Date()) {
  const state = readState(file);
  const next = { streak: (Number(state.streak) || 0) + 1, last_hold: now.toISOString() };
  ensureDir(file);
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  return next.streak;
}

/** 发布成功，归零。文件不存在时不动，避免凭空造状态。 */
export function resetGate1Streak(file = DEFAULT_FILE, now = new Date()) {
  if (!existsSync(file)) return 0;
  const state = readState(file);
  if (!state.streak) return 0;
  writeFileSync(file, `${JSON.stringify({ streak: 0, last_reset: now.toISOString() }, null, 2)}\n`);
  return state.streak;
}

export function readGate1Streak(file = DEFAULT_FILE) {
  return readState(file).streak;
}
