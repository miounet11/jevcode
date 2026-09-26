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

# 棘轮：连续未成功发布的轮数。
# SKIPPED 是 exit 0、不写 ALERT，于是 9-21~9-24 连续 4 天跳过无人察觉，内容
# 4 天没更新。成功发布即归零，累积到阈值升级为 ALERT——「只许变好」得有人盯着。
STREAK_FILE="$LOG_DIR/.publish-streak"
STREAK_ALERT_AT="${STREAK_ALERT_AT:-3}"

# 干跑（--dry-run）是人工验证路径，不该计入棘轮：跑一次手动验证就把「连续未
# 发布」少算一轮，指标就失真了（实测 2026-09-26：手动干跑把计数从 1 顶到 2）。
IS_DRY=0
for a in "$@"; do
  if [[ "$a" == "--dry-run" ]]; then IS_DRY=1; fi
done

streak_bump() {
  local n=0
  if [[ -f "$STREAK_FILE" ]]; then
    n="$(tr -dc '0-9' < "$STREAK_FILE" 2>/dev/null)" || n=0
  fi
  n=$(( ${n:-0} + 1 ))
  echo "$n" > "$STREAK_FILE"
  echo "$n"
}

streak_reset() { echo 0 > "$STREAK_FILE"; }

# 本轮是否真的发布出去了：管线成功发布时会写 released 事件
# （注意文件名用 UTC 日期，与 writeLog 的 toISOString().slice(0,10) 对齐）
published_today() {
  grep -q '"stage":"released"' "$LOG_DIR/$(date -u +%F).jsonl" 2>/dev/null
}

streak_check() {
  if [[ "$IS_DRY" == "1" ]]; then
    echo "[cron] 干跑，棘轮不计"
    return 0
  fi
  local n
  n="$(streak_bump)"
  echo "[cron] 连续未发布第 $n 轮"
  if [[ "$n" -ge "$STREAK_ALERT_AT" ]]; then
    mark ALERT "连续 $n 轮未成功发布：内容已 $n 天未更新"
  fi
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
  streak_check
  exit 0
fi

# 运行超时护栏：成功一轮实测约 3.7 分钟（released elapsed_ms=223074），但抓取
# 退到未认证限额时会死等（见上方 token 注释「实测卡 10 分钟以上」，9-25 正是靠
# 人肉终止才停下）。macOS 无 timeout 命令、系统 bash 为 3.2（无 wait -n），
# 故用后台 + 轮询实现；超时按 timeout(1) 约定记退出码 124。
PIPELINE_TIMEOUT="${PIPELINE_TIMEOUT:-900}"
set +e
node scripts/pipeline.mjs "$@" &
PIPE_PID=$!
WAITED=0
TIMED_OUT=0
while kill -0 "$PIPE_PID" 2>/dev/null; do
  if [[ "$WAITED" -ge "$PIPELINE_TIMEOUT" ]]; then
    echo "[cron] 运行超过 ${PIPELINE_TIMEOUT}s，向管线（pid $PIPE_PID）发送 SIGTERM"
    kill -TERM "$PIPE_PID" 2>/dev/null
    sleep 10
    if kill -0 "$PIPE_PID" 2>/dev/null; then
      echo "[cron] 仍未退出，发送 SIGKILL"
      kill -KILL "$PIPE_PID" 2>/dev/null
    fi
    TIMED_OUT=1
    break
  fi
  sleep 5
  WAITED=$((WAITED + 5))
done
wait "$PIPE_PID"
code=$?
set -e
if [[ "$TIMED_OUT" == "1" ]]; then
  code=124
fi

# 门 2 HOLD（退出码 2）是「按设计不发布」，不是故障：与故障分开处理，不写
# 「管线失败」ALERT——否则「内容不值得发」和「build 挂了」长得一样，告警就
# 没人信了。与门 1 HOLD 用 exit 0 的处理对齐，同样计入棘轮。
if [[ "$code" -eq 2 ]]; then
  HOLD_MARK="$LOG_DIR/HOLD-G2-$(date -u +%F).txt"
  {
    echo "门 2 HOLD：本轮内容经判定不值得发布（非故障）"
    echo "时间：$(date -u +%FT%TZ)"
    echo "查看：tail -50 $LOG_DIR/cron.log"
  } > "$HOLD_MARK"
  echo "[cron] 门 2 HOLD，标记写入 $HOLD_MARK"
  streak_check
  echo "===== cycle end（门 2 HOLD）====="
  exit 0
fi

# 失败可见：非零退出时写醒目告警文件（cron 日志默认没人看）
if [[ "$code" -ne 0 ]]; then
  ALERT="$LOG_DIR/ALERT-$(date -u +%F).txt"
  {
    if [[ "$TIMED_OUT" == "1" ]]; then
      echo "管线运行超时（>${PIPELINE_TIMEOUT}s）被终止"
      echo "时间：$(date -u +%FT%TZ)"
    else
      echo "管线失败 $(date -u +%FT%TZ) 退出码 $code"
    fi
    echo "查看：tail -50 $LOG_DIR/cron.log"
  } > "$ALERT"
  echo "[cron] 管线失败（退出码 $code），告警写入 $ALERT"
  streak_check
  echo "===== cycle failed ====="
  exit "$code"
fi

# 棘轮：只有真的发出去了才归零（退出码 0 也可能是 HOLD/累积，不算发布）
if published_today; then
  streak_reset
  echo "[cron] 本轮已发布，棘轮归零"
else
  streak_check
fi
echo "===== cycle end ====="
