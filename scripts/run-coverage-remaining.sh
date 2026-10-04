#!/bin/bash
# 全量覆盖评测顺序驱动器（段 1-2 已另行执行，本脚本从指定起始段续跑）
# 用法: bash scripts/run-coverage-remaining.sh <起始段号，默认 3>
set -u
START=${1:-3}
INDUSTRIES=(adtech aerospace automotive banking construction crm cybersecurity devtools ecommerce edtech education energy fintech gaming government healthcare hospitality hr insurance legal logistics manufacturing marketing marketplace media nonprofit paas pharma realestate recruiting restaurant retail saas streaming supplychain telecom telehealth travel university utilities)
TOTAL=${#INDUSTRIES[@]}
# 段号从 1 计；数组每段占 2 个行业，索引 = (段号-1)*2
for ((i=(START-1)*2; i<TOTAL; i+=2)); do
  A=${INDUSTRIES[i]}
  B=${INDUSTRIES[i+1]}
  SHARD=$(( i/2+1 ))
  # 防重入：该段若已有 eval-coverage 在跑则直接退出，避免双跑覆盖报表
  if pgrep -f "eval-coverage.mjs.*--industry $A " >/dev/null 2>&1 || pgrep -f "eval-coverage.mjs.*--industry $A --industry" >/dev/null 2>&1; then
    echo "分片 $SHARD ($A + $B) 已有进程在跑，退出避免重复"; exit 1
  fi
  echo "=== 分片 $SHARD/20: $A + $B 开始 $(date -u +%FT%TZ) ==="
  node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry "$A" --industry "$B" --sleep 90000 --out "docs/coverage-full/$A.md" || { echo "分片 $SHARD 失败，停止"; exit 1; }
  echo "=== 分片 $SHARD/20 完成 $(date -u +%FT%TZ) ==="
done
echo "全部分片完成 $(date -u +%FT%TZ)"
