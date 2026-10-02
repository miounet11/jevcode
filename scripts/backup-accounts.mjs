#!/usr/bin/env node
/**
 * 账号库备份：对活动中的 SQLite 做一致性快照。
 *
 * 用法：
 *   node scripts/backup-accounts.mjs [库路径] [备份目录]
 * 缺省从 PLAYGROUND_ACCOUNTS_DB 取库路径，备份目录缺省 /var/backups/jevcode-accounts。
 *
 * 为什么不用 cp：
 *   账号库是 WAL 模式，主文件可能只有几 KB，绝大部分数据在 -wal 里。
 *   直接 cp accounts.db 会漏掉 WAL 中尚未 checkpoint 的数据。这里用
 *   `VACUUM INTO` 让 SQLite 自己导出一份自洽的单文件快照，对活动库安全。
 *
 * 为什么不用 sqlite3 命令行：
 *   生产机没装 sqlite3。node:sqlite 是 Node 内置，无需额外依赖。
 *
 * 退出码：成功 0；库不存在、快照失败、快照校验不通过均为非 0，便于 cron/监控识别。
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, statSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';

const src = process.argv[2] || process.env.PLAYGROUND_ACCOUNTS_DB || '';
const outDir = process.argv[3] || process.env.BACKUP_DIR || '/var/backups/jevcode-accounts';
const keep = Number(process.env.BACKUP_KEEP || 14);

function die(msg) {
  console.error(`[backup] 失败：${msg}`);
  process.exit(1);
}

if (!src) die('未指定库路径，且 PLAYGROUND_ACCOUNTS_DB 未设置');
if (!existsSync(src)) die(`库文件不存在：${src}`);

mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
const dst = path.join(outDir, `accounts-${stamp}.db`);

let srcCount;
try {
  const db = new DatabaseSync(src, { readOnly: true });
  srcCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  // 目标文件必须不存在，VACUUM INTO 会拒绝覆盖
  if (existsSync(dst)) die(`目标文件已存在：${dst}`);
  db.exec(`VACUUM INTO '${dst.replace(/'/g, "''")}'`);
  db.close();
} catch (err) {
  die(`生成快照出错：${err && err.message ? err.message : err}`);
}

// 校验：快照可读、完整、行数与源库一致
try {
  const b = new DatabaseSync(dst, { readOnly: true });
  const ic = b.prepare('PRAGMA integrity_check').get().integrity_check;
  const c = b.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  b.close();
  if (ic !== 'ok') die(`快照完整性校验未通过：${ic}`);
  if (c !== srcCount) die(`快照行数不符：源 ${srcCount}，备份 ${c}`);
  console.log(`[backup] 完成：${dst}（users=${c}，size=${statSync(dst).size}B）`);
} catch (err) {
  die(`校验快照出错：${err && err.message ? err.message : err}`);
}

// 轮转：只保留最近 keep 份
try {
  const files = readdirSync(outDir)
    .filter((f) => /^accounts-\d{8}T\d{6}Z\.db$/.test(f))
    .sort()
    .map((f) => path.join(outDir, f));
  for (const f of files.slice(0, Math.max(0, files.length - keep))) {
    unlinkSync(f);
    console.log(`[backup] 清理旧备份：${path.basename(f)}`);
  }
} catch (err) {
  console.error(`[backup] 轮转告警：${err && err.message ? err.message : err}`);
}

process.exit(0);
