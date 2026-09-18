#!/usr/bin/env bash
# JevCode 部署脚本
# 用法：./deploy/deploy.sh
#
# 做的事：
#   1. 本地构建
#   2. 打包 dist 并通过 scp 上传到服务器
#   3. 在服务器上原子切换到新版本（软链切换，失败可秒回滚）
#   4. 重载 nginx
#
# 前置条件：
#   - 本地能 SSH 到服务器（密钥已配置）
#   - 服务器已装 nginx，且有 /var/www/jevcode 目录
#   - nginx 站点配置已按 deploy/nginx/jevcode.conf 部署

set -euo pipefail

# ---------- 配置 ----------
SSH_HOST="${JEVCODE_SSH_HOST:-root@23.95.243.52}"
SSH_PORT="${JEVCODE_SSH_PORT:-22}"
SSH_KEY="${JEVCODE_SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_ROOT="${JEVCODE_REMOTE_ROOT:-/var/www/jevcode}"
KEEP_RELEASES=5

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20 -p "$SSH_PORT")
if [ -f "$SSH_KEY" ]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

RELEASE_ID="$(date -u +%Y%m%d-%H%M%S)"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARBALL="/tmp/jevcode-${RELEASE_ID}.tar.gz"

log() { printf '\033[36m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

# ---------- 1. 构建 ----------
log "构建站点..."
cd "$LOCAL_DIR"
npm run build
[ -f dist/index.html ] || die "构建产物缺失：dist/index.html"

# ---------- 2. 打包 ----------
log "打包 ${RELEASE_ID}..."
tar -czf "$TARBALL" -C dist .

# ---------- 3. 上传 ----------
log "上传到 ${SSH_HOST}:${REMOTE_ROOT}/releases/${RELEASE_ID}..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "mkdir -p ${REMOTE_ROOT}/releases/${RELEASE_ID} ${REMOTE_ROOT}/shared"
scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
  "$TARBALL" "$SSH_HOST:/tmp/"
# 同时上传 nginx 配置，供 bootstrap.sh 首次初始化使用
scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
  "$LOCAL_DIR/deploy/nginx/jevcode.conf" "$SSH_HOST:/tmp/jevcode.conf"

# ---------- 4. 解包并原子切换 ----------
log "解包并切换软链..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd ${REMOTE_ROOT}/releases/${RELEASE_ID}
tar -xzf /tmp/jevcode-${RELEASE_ID}.tar.gz
rm -f /tmp/jevcode-${RELEASE_ID}.tar.gz

# 备份当前指向，便于回滚
if [ -L ${REMOTE_ROOT}/current ]; then
  readlink ${REMOTE_ROOT}/current > ${REMOTE_ROOT}/shared/previous_release || true
fi

# 原子切换
ln -sfn ${REMOTE_ROOT}/releases/${RELEASE_ID} ${REMOTE_ROOT}/current.new
mv -Tf ${REMOTE_ROOT}/current.new ${REMOTE_ROOT}/current

# 权限
chown -R www-data:www-data ${REMOTE_ROOT}/releases/${RELEASE_ID} 2>/dev/null || true
find ${REMOTE_ROOT}/releases/${RELEASE_ID} -type d -exec chmod 755 {} \;
find ${REMOTE_ROOT}/releases/${RELEASE_ID} -type f -exec chmod 644 {} \;

# 清理旧版本，只保留最近 ${KEEP_RELEASES} 个
cd ${REMOTE_ROOT}/releases
ls -1dt */ 2>/dev/null | tail -n +$(( ${KEEP_RELEASES} + 1 )) | xargs -r rm -rf

echo "当前版本: \$(readlink ${REMOTE_ROOT}/current)"
REMOTE

# ---------- 5. 重载 nginx ----------
log "校验并重载 nginx..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" "nginx -t && systemctl reload nginx"

rm -f "$TARBALL"
log "部署完成：${RELEASE_ID}"
log "回滚命令：ssh ${SSH_HOST} 'ln -sfn \$(cat ${REMOTE_ROOT}/shared/previous_release) ${REMOTE_ROOT}/current && systemctl reload nginx'"
