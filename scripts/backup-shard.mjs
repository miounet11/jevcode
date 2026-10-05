#!/usr/bin/env node
// 分片数据备份：从 compare-log 按行业过滤，写入独立备份文件
// 用法: node scripts/backup-shard.mjs <log-file> <industry1> [industry2 ...]
import fs from 'fs';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('用法: node scripts/backup-shard.mjs <log-file> <industry1> [industry2 ...]');
  process.exit(1);
}

const [logFile, ...industries] = args;
const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n').map(JSON.parse);
const filtered = lines.filter(e => e.id && industries.some(ind => e.id.startsWith(`cov-${ind}-`)));

if (filtered.length === 0) {
  console.error(`警告：${logFile} 中没有 ${industries.join('/')} 数据`);
  process.exit(1);
}

// 文件名必须带上全部行业：原来只取 industries[0]，分片 realestate+recruiting
// 会全部写进 compare-log-realestate-backup.jsonl，recruiting 既没进文件名、
// 也没被单独备份，排查时按名找会以为丢数据。排序保证同分片重跑同名可覆盖。
// 仍匹配 aggregate-coverage.mjs 的 /^compare-log.*\.jsonl$/，自动发现不受影响。
const outFile = `.data/runs/compare-log-${[...industries].sort().join('-')}-backup.jsonl`;
fs.writeFileSync(outFile, filtered.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`已备份 ${filtered.length} 条到 ${outFile}（${industries.join('/')}）`);
