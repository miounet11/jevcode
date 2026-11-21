#!/bin/bash
# 每日管线日报 cron 包装：加载 .env（含 FEISHU_WEBHOOK）后执行 daily-report.mjs。
#
# 此前 crontab 直接调 `node scripts/daily-report.mjs`，没有 source .env，
# 导致 FEISHU_WEBHOOK 始终为空、日报天天只打本地日志不发飞书。
#
# 安装：bash scripts/pipeline-cron.sh --install

set -uo pipefail

REPO="/Volumes/MobileDrive/devpc/jevcode"
export PATH="/Library/Developer/CommandLineTools/usr/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || exit 1

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

exec node scripts/daily-report.mjs "$@"
