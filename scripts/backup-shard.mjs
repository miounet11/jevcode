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

const outFile = `.data/runs/compare-log-${industries[0]}-backup.jsonl`;
fs.writeFileSync(outFile, filtered.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`已备份 ${filtered.length} 条到 ${outFile}`);
