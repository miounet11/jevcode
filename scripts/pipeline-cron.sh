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

# 告警：cron 日志默认没人看，失败必须留下显眼痕迹
# 区分「真失败」（ALERT-*）与「按设计跳过」（SKIPPED-*），避免告警疲劳
mark() {
  local prefix="$1" msg="$2"
  local f="$LOG_DIR/$prefix-$(date -u +%F).txt"
  {
    echo "$msg"
    echo "时间：$(date -u +%FT%TZ)"
    echo "查看：tail -50 $LOG_DIR/cron.log"
  } > "$f"
  echo "[cron] $prefix 写入 $f"
}

echo "===== $(date -u +%FT%TZ) cron cycle ====="

# 前置检查必须早于 source .env：set -e 下 source 缺失文件会直接中止，
# 导致后面的告警分支永远走不到（实测：exit 1 但无 ALERT，故障静默）。
for bin in node npm git gh; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "[cron] 致命：找不到 $bin（PATH=$PATH）"
    FAILED=1
  fi
done
if [[ ! -f .env ]]; then
  echo "[cron] 致命：.env 不存在"
  FAILED=1
fi
if [[ "${FAILED:-0}" == "1" ]]; then
  echo "[cron] 前置检查未通过，中止本轮"
  mark ALERT "管线前置检查失败：缺少依赖或 .env"
  exit 1
fi

# 环境变量（.env 已确认存在）
set -a
source .env
set +a
# GitHub token：cron 脱离 GUI 会话时，gh 的 keychain 凭据可能读不到，
# 旧写法用 `|| true` 把失败静默吞掉，抓取就退到未认证的 60/h 限额死等（实测卡 10 分钟以上）。
# 这里显式告警，并且把失败当作失败处理，不静默继续。
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  export GITHUB_TOKEN="$(gh auth token 2>/dev/null || true)"
fi
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "[cron] 告警：GITHUB_TOKEN 为空（gh auth token 未能取得凭据）"
  echo "[cron]       抓取将受 60/h 未认证限额限制，211 个仓库必然触发限流。"
  mark ALERT "GITHUB_TOKEN 缺失：抓取会因未认证限额而长时间阻塞"
  exit 1
fi
# 令牌可用性预检：确认额度足够覆盖一轮抓取，避免跑到一半卡在限流等待。
CORE_REMAIN="$(curl -sS -m 15 -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/rate_limit 2>/dev/null \
  | python3 -c 'import json,sys;print(json.load(sys.stdin)["resources"]["core"]["remaining"])' 2>/dev/null || echo unknown)"
echo "[cron] GitHub core 剩余额度：$CORE_REMAIN"
if [[ "$CORE_REMAIN" != "unknown" && "$CORE_REMAIN" -lt 500 ]]; then
  echo "[cron] 告警：GitHub 剩余额度不足（$CORE_REMAIN）"
  mark ALERT "GitHub 额度不足：$CORE_REMAIN"
  exit 1
fi

if [[ "${JUDGE_BACKEND:-clavue}" == "jev" ]]; then
  if [[ -z "${TYPESAFE_API_KEY:-}" ]]; then
    echo "[cron] 致命：TYPESAFE_API_KEY 未设置（JUDGE_BACKEND=jev）"
    mark ALERT "管线前置检查失败：TYPESAFE_API_KEY 未设置"
    exit 1
  fi
else
  if [[ -z "${CLAVUE_API_KEYS:-}" ]]; then
    echo "[cron] 致命：CLAVUE_API_KEYS 未设置（本地 judge 后端）"
    mark ALERT "管线前置检查失败：CLAVUE_API_KEYS 未设置"
    exit 1
  fi
fi

# 只在干净工作区跑（避免把手工未提交改动卷进自动发布）
if [[ -n "$(git status --porcelain)" ]]; then
  echo "[cron] 工作区不干净，跳过本轮（避免卷入手工改动）"
  mark SKIPPED "管线跳过整轮：工作区不干净（存在未提交改动）"
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
