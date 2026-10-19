/**
 * pending 状态文件的读取。
 *
 * 关键约定：「文件不存在」与「文件存在但损坏」必须区分。
 *
 * 早期实现把两者都当成空批次。文件损坏时（写入被截断、磁盘满、手工编辑出错），
 * 管线会以为没有待发布内容，发布成功后 savePending 用空对象覆盖原文件，
 * 累积的仓库批次就永久丢了——这正是 10-13~10-17 那批 148 个仓库遇到的同类风险。
 */

import { existsSync, readFileSync } from 'node:fs';

export class PendingCorruptError extends Error {
  constructor(file, cause) {
    super(`${file} 解析失败，拒绝按空批次继续: ${cause?.message ?? cause}`);
    this.name = 'PendingCorruptError';
    this.file = file;
  }
}

/**
 * 读取 pending 状态。
 * @param {string} file
 * @param {{ exists?: (p: string) => boolean, read?: (p: string) => string }} deps
 * @returns {{ last_release: string|null, pending: Record<string, unknown> }}
 * @throws {PendingCorruptError} 文件存在但无法解析
 */
export function loadPendingState(file, deps = {}) {
  const exists = deps.exists ?? existsSync;
  const read = deps.read ?? ((p) => readFileSync(p, 'utf8'));

  if (!exists(file)) return { last_release: null, pending: {} };

  const raw = read(file);
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new PendingCorruptError(file, err);
  }
}
