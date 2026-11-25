#!/usr/bin/env node
/**
 * 清理对照运行记录：只删除目录里超过保留天数的 `[a-z0-9]{12}.json`。
 *
 * 用法：
 *   node scripts/prune-runs.mjs [--dir=/var/www/jevcode/shared/runs] [--days=30] [--dry-run] [--json]
 *
 * compare-log.jsonl、其它文件和子目录一律不动。
 */

import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RUN_FILE = /^[a-z0-9]{12}\.json$/;
const DEFAULT_DIR = '/var/www/jevcode/shared/runs';
const DAY_MS = 86400_000;

/**
 * @param {{ dir: string, maxAgeDays?: number, dryRun?: boolean, now?: number }} opts
 * @returns {{ scanned: number, deleted: number, kept: number, freedBytes: number }}
 */
export function pruneRuns({ dir, maxAgeDays = 30, dryRun = false, now = Date.now() }) {
  const cutoff = now - maxAgeDays * DAY_MS;
  let scanned = 0;
  let deleted = 0;
  let kept = 0;
  let freedBytes = 0;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isFile() || !RUN_FILE.test(ent.name)) continue;
    scanned += 1;
    const full = path.join(dir, ent.name);
    const st = statSync(full);
    if (st.mtimeMs < cutoff) {
      freedBytes += st.size;
      deleted += 1;
      if (!dryRun) unlinkSync(full);
    } else {
      kept += 1;
    }
  }
  return { scanned, deleted, kept, freedBytes };
}

function parseArgs(argv) {
  const opts = { dir: DEFAULT_DIR, maxAgeDays: 30, dryRun: false, json: false };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--json') opts.json = true;
    else if (arg.startsWith('--dir=')) opts.dir = arg.slice('--dir='.length);
    else if (arg.startsWith('--days=')) opts.maxAgeDays = Number(arg.slice('--days='.length));
    else {
      console.error(`未知参数：${arg}`);
      process.exit(2);
    }
  }
  if (!opts.dir) {
    console.error('未指定目录');
    process.exit(2);
  }
  if (!Number.isFinite(opts.maxAgeDays) || opts.maxAgeDays < 0) {
    console.error(`无效的 --days：${opts.maxAgeDays}`);
    process.exit(2);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(opts.dir)) {
    console.error(`目录不存在：${opts.dir}`);
    process.exit(1);
  }
  const result = pruneRuns({
    dir: opts.dir,
    maxAgeDays: opts.maxAgeDays,
    dryRun: opts.dryRun,
  });
  if (opts.json) {
    console.log(JSON.stringify({ ...result, dryRun: opts.dryRun, dir: opts.dir, maxAgeDays: opts.maxAgeDays }));
    return;
  }
  const verb = opts.dryRun ? '将删除' : '已删除';
  console.log(
    `prune-runs: 扫描 ${result.scanned}，${verb} ${result.deleted}，保留 ${result.kept}，释放 ${result.freedBytes} 字节` +
      (opts.dryRun ? '（dry-run）' : ''),
  );
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main();
