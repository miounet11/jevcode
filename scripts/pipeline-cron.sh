#!/bin/bash
# JevCode 每日管线：抓取生态数据 → Jev 门 1 → 构建/检查 → Jev 门 2 → 发布。
# 安装：bash scripts/pipeline-cron.sh --install   （写入当前用户 crontab）
# 手动：bash scripts/pipeline-cron.sh [extra args]
#
# Jev 轮 9/10 决策：daily 频率（0.91）；batch_by_magnitude 累积（+10% 阈值）；
# 本机 cron（机器常开、已具备全部凭据与部署能力；VPS/GHA 需额外搬运密钥，
# Jev 对调度位置的判定置信度低（vps 0.46 vs gha-pr 0.42），故选零迁移成本的本机）。

set -euo pipefail

REPO="/Volumes/MobileDrive/devpc/jevcode"
LOG_DIR="$REPO/.research/pipeline-logs"
# macOS cron 的默认 PATH 只有 /usr/bin:/bin，找不到 homebrew 装的 node/npm/gh。
# 显式补全，并额外兜底常见安装位置（Intel mac 为 /usr/local/bin）。
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
CRON_LINE="30 9 * * * cd $REPO && PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin bash scripts/pipeline-cron.sh >> $LOG_DIR/cron.log 2>&1"

if [[ "${1:-}" == "--install" ]]; then
  # 幂等安装
  (crontab -l 2>/dev/null | grep -vF "$REPO" ; echo "$CRON_LINE") | crontab -
  echo "已安装每日 09:30 管线任务："
  crontab -l | grep "$REPO"
  exit 0
fi

if [[ "${1:-}" == "--uninstall" ]]; then
  crontab -l 2>/dev/null | grep -vF "$REPO" | crontab -
  echo "已移除"
  exit 0
fi

cd "$REPO"
mkdir -p "$LOG_DIR"

echo "===== $(date -u +%FT%TZ) cron cycle ====="

# 环境变量
set -a
source .env
set +a
export GITHUB_TOKEN="${GITHUB_TOKEN:-$(gh auth token 2>/dev/null || true)}"

# 前置检查：cron 环境下缺依赖会静默失败，这里显式报错
for bin in node npm git gh; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "[cron] 致命：找不到 $bin（PATH=$PATH）"
    FAILED=1
  fi
done
if [[ ! -f .env ]] || [[ -z "${TYPESAFE_API_KEY:-}" ]]; then
  echo "[cron] 致命：.env 缺失或 TYPESAFE_API_KEY 未设置"
  FAILED=1
fi
if [[ "${FAILED:-0}" == "1" ]]; then
  echo "[cron] 前置检查未通过，中止本轮"
  exit 1
fi

# 只在干净工作区跑（避免把手工未提交改动卷进自动发布）
if [[ -n "$(git status --porcelain)" ]]; then
  echo "[cron] 工作区不干净，跳过本轮（避免卷入手工改动）"
  exit 0
fi

# 失败可见：非零退出时写醒目告警文件（cron 日志默认没人看）
set +e
node scripts/pipeline.mjs "$@"
code=$?
set -e
if [[ "$code" -ne 0 ]]; then
  ALERT="$LOG_DIR/ALERT-$(date -u +%F).txt"
  {
    echo "管线失败 $(date -u +%FT%TZ) 退出码 $code"
    echo "查看：tail -50 $LOG_DIR/cron.log"
  } > "$ALERT"
  echo "[cron] 管线失败（退出码 $code），告警写入 $ALERT"
  echo "===== cycle failed ====="
  exit "$code"
fi
echo "===== cycle end ====="
