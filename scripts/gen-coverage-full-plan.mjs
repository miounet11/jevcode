// 生成全量 7680 条覆盖评测的分片执行脚本。
// 40 行业每 2 个一行分片，串行 20 段；每段 384 条 = 48 批，90s 间隔约 71 分钟。
// 用法：zsh scripts/run-coverage-full.sh   （报表写到 docs/coverage-full/<首行业>.md）
import { writeFileSync, mkdirSync } from 'node:fs';
import all from '../data/coverage-cases.json' with { type: 'json' };

const inds = [...new Set(all.map((c) => c.industry))].sort();
const lines = [
  '#!/bin/zsh',
  '# 全量 7680 条覆盖评测：40 行业每 2 个一行分片，串行跑 20 段。',
  '# 每段 384 条 = 48 批，90s 间隔约 71 分钟；总预算约 24 小时。',
  '# 前置：本地 playground 跑在 127.0.0.1:8790，且 .env 已加载（对照 key 可用）。',
  'set -e',
  'mkdir -p docs/coverage-full',
];
for (let i = 0; i < inds.length; i += 2) {
  const pair = inds.slice(i, i + 2);
  const flags = pair.map((p) => `--industry ${p}`).join(' ');
  lines.push(`node scripts/eval-coverage.mjs --cases data/coverage-cases.json ${flags} --sleep 90000 --out docs/coverage-full/${pair[0]}.md`);
}
lines.push('echo "全量分片评测完成"');
mkdirSync('scripts', { recursive: true });
writeFileSync('scripts/run-coverage-full.sh', lines.join('\n') + '\n', { mode: 0o755 });
console.log(`已生成 scripts/run-coverage-full.sh，共 ${(inds.length / 2) | 0} 段，覆盖 ${inds.length} 个行业`);
