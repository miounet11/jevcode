#!/usr/bin/env bash
# 把仓库里的 server/ 后端脚本同步到服务器的 /opt/jevcode-playground/，校验并重启服务。
#
# 为什么要独立脚本：deploy.sh 只部署 dist/ 与 nginx 配置，sync-server-scripts.sh
# 只同步 cron 巡检/日报脚本，server/*.mjs 此前依赖手工 scp，容易与仓库版本漂移。
#
# 用法：
#   ./deploy/sync-playground.sh            # 同步、回读校验、重启并探活
#   ./deploy/sync-playground.sh --dry-run  # 仅列出与远端的差异
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

FILES=(
  server/accounts.mjs
  server/auth.mjs
  server/captcha.mjs
  server/case-index.json
  server/compare.mjs
  server/mailer.mjs
  server/otp.mjs
  server/plans.mjs
  server/playground.mjs
  server/questions.mjs
)

log()  { printf '\033[36m[sync-pg]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[warn]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

for f in "${FILES[@]}"; do
  [ -f "$LOCAL_DIR/$f" ] || die "本地缺文件：$f"
done

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
changed=0
log "远端 ${SSH_HOST}:${REMOTE_DIR}"
for f in "${FILES[@]}"; do
  local_sum=$(md5sum "$LOCAL_DIR/$f" 2>/dev/null | awk '{print $1}' || md5 -q "$LOCAL_DIR/$f")
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
  if [ -n "$remote_sum" ]; then
    ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
      "mkdir -p ${REMOTE_DIR}/bak-${STAMP} && cp -a ${REMOTE_DIR}/$(basename "$f") ${REMOTE_DIR}/bak-${STAMP}/"
  fi
  scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
    "$LOCAL_DIR/$f" "$SSH_HOST:$REMOTE_DIR/" >/dev/null
done

if [ "$DRY_RUN" -eq 1 ]; then
  log "dry-run：${changed} 个文件待更新"
  exit 0
fi

if [ "$changed" -eq 0 ]; then
  log "无文件变动，无需重启"
  exit 0
fi

log "回读校验..."
for f in "${FILES[@]}"; do
  local_sum=$(md5sum "$LOCAL_DIR/$f" 2>/dev/null | awk '{print $1}' || md5 -q "$LOCAL_DIR/$f")
  remote_sum=$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
    "md5sum ${REMOTE_DIR}/$(basename "$f") 2>/dev/null | awk '{print \$1}'" || true)
  [ "$local_sum" = "$remote_sum" ] || die "校验失败 $(basename "$f")：本地 $local_sum / 远端 ${remote_sum:-缺失}"
done

log "重启 jevcode-playground 并探活..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
systemctl restart jevcode-playground
sleep 1
systemctl is-active --quiet jevcode-playground
curl -fsS -m 5 http://127.0.0.1:8790/health
echo ""
REMOTE
log "同步与重启完成（备份目录：${REMOTE_DIR}/bak-${STAMP}）"
