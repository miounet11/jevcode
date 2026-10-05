#!/bin/bash
# 协调版驱动器：跑剩余分片，每分片完成后立即备份
set -u
START=${1:-11}
INDUSTRIES=(adtech aerospace automotive banking construction crm cybersecurity devtools ecommerce edtech education energy fintech gaming government healthcare hospitality hr insurance legal logistics manufacturing marketing marketplace media nonprofit paas pharma realestate recruiting restaurant retail saas streaming supplychain telecom telehealth travel university utilities)
TOTAL=${#INDUSTRIES[@]}
for ((i=(START-1)*2; i<TOTAL; i+=2)); do
  A=${INDUSTRIES[i]}
  B=${INDUSTRIES[i+1]}
  SHARD=$(( i/2+1 ))
  if pgrep -f "eval-coverage.mjs.*--industry $A " >/dev/null 2>&1; then
    echo "分片 $SHARD ($A + $B) 已有进程在跑，退出避免重复"; exit 1
  fi
  echo "=== 分片 $SHARD/20: $A + $B 开始 $(date -u +%FT%TZ) ==="
  node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry "$A" --industry "$B" --sleep 90000 --out "docs/coverage-full/$A.md" || { echo "分片 $SHARD 失败，停止"; exit 1; }
  echo "=== 分片 $SHARD/20 完成 $(date -u +%FT%TZ) ==="
  # 立即备份：从 compare-log-v2.jsonl 过滤该分片行业
  node scripts/backup-shard.mjs .data/runs/compare-log-v2.jsonl "$A" "$B" || echo "警告：分片 $SHARD 备份失败"
done
echo "全部分片完成 $(date -u +%FT%TZ)"
