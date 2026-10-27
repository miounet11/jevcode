#!/usr/bin/env bash
# 把仓库里的运维脚本同步到服务器的 /opt/jevcode-playground/。
#
# 为什么要这个脚本：healthcheck / notify-feishu / daily-report 这三个脚本跑在
# 服务器上，但 deploy.sh 只上传 dist/，从不回传它们。此前一直是手工 scp，
# 结果服务器上那份 10-02 的 healthcheck 又旧又对（把端口硬编码成了 8787，
# 那是 strata-api 的端口），巡检报了整整一个月的假警，而没人发现它跑的是旧版。
#
# 用法：
#   ./deploy/sync-server-scripts.sh            # 同步并校验
#   ./deploy/sync-server-scripts.sh --dry-run  # 只显示会改什么
#
# 环境变量与 deploy.sh 保持一致（JEVCODE_SSH_HOST / _PORT / _KEY）。
set -euo pipefail

SSH_HOST="${JEVCODE_SSH_HOST:-root@23.95.243.52}"
SSH_PORT="${JEVCODE_SSH_PORT:-22}"
SSH_KEY="${JEVCODE_SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_DIR="${JEVCODE_REMOTE_SCRIPTS:-/opt/jevcode-playground}"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20
          -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -p "$SSH_PORT")
if [ -f "$SSH_KEY" ]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

# 服务器上实际跑着的那几个。加新脚本时在这里补一行，别只改 cron——
# 漏掉同步就是下一份「跑了半年的旧版」。
FILES=(
  scripts/healthcheck.mjs
  scripts/notify-feishu.mjs
  scripts/daily-report.mjs
)

log()  { printf '\033[36m[sync]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[warn]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

for f in "${FILES[@]}"; do
  [ -f "$LOCAL_DIR/$f" ] || die "本地缺文件：$f"
done

# 先看远端现状，避免「同步了但没生效」时无从判断。
log "远端 ${SSH_HOST}:${REMOTE_DIR}"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "mkdir -p ${REMOTE_DIR}"

changed=0
for f in "${FILES[@]}"; do
  local_sum=$(md5sum "$LOCAL_DIR/$f" 2>/dev/null | awk '{print $1}' \
    || md5 -q "$LOCAL_DIR/$f")
  remote_sum=$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
    "md5sum ${REMOTE_DIR}/$(basename "$f") 2>/dev/null | awk '{print \$1}'" || true)

  if [ "$local_sum" = "$remote_sum" ]; then
    log "  一致 $(basename "$f")"
    continue
  fi

  changed=$((changed + 1))
  if [ "$DRY_RUN" -eq 1 ]; then
    log "  会更新 $(basename "$f")（远端 ${remote_sum:-缺失}）"
    continue
  fi

  log "  更新 $(basename "$f")（远端 ${remote_sum:-缺失}）"
  # 先备份再覆盖：改坏了能原地退回，不必从仓库翻历史。
  if [ -n "$remote_sum" ]; then
    ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
      "cp -a ${REMOTE_DIR}/$(basename "$f") ${REMOTE_DIR}/$(basename "$f").bak-\$(date -u +%Y%m%dT%H%M%SZ)"
  fi
  scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
    "$LOCAL_DIR/$f" "$SSH_HOST:$REMOTE_DIR/" >/dev/null
done

if [ "$DRY_RUN" -eq 1 ]; then
  log "dry-run：${changed} 个文件待更新"
  exit 0
fi

# 传完逐个回读校验。scp 返回 0 但文件不完整的情况在这条链路上见过了
# （deploy.sh 上传 dist 时就踩过），所以只认 md5 对得上。
log "回读校验..."
bad=0
for f in "${FILES[@]}"; do
  local_sum=$(md5sum "$LOCAL_DIR/$f" 2>/dev/null | awk '{print $1}' \
    || md5 -q "$LOCAL_DIR/$f")
  remote_sum=$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
    "md5sum ${REMOTE_DIR}/$(basename "$f") 2>/dev/null | awk '{print \$1}'" || true)
  if [ "$local_sum" != "$remote_sum" ]; then
    warn "  校验失败 $(basename "$f")：本地 $local_sum / 远端 ${remote_sum:-缺失}"
    bad=$((bad + 1))
  fi
done
[ "$bad" -eq 0 ] || die "${bad} 个文件校验失败"

log "同步完成：${changed} 个文件更新"

# 改完立刻确认新版本真能跑。脚本能传上去但跑不起来（依赖缺失、语法错）
# 比不传更糟——cron 会安静地每 5 分钟失败一次。
if [ "$changed" -gt 0 ]; then
  log "试跑 healthcheck..."
  if ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
    "set -a; [ -f /etc/jevcode-healthcheck.env ] && . /etc/jevcode-healthcheck.env; set +a; \
     node ${REMOTE_DIR}/healthcheck.mjs" >/dev/null 2>&1; then
    log "  healthcheck 通过"
  else
    warn "  healthcheck 未通过（可能是磁盘/端点真有异常，也可能是一次性告警），请手动确认："
    warn "  node ${REMOTE_DIR}/healthcheck.mjs"
  fi
fi
