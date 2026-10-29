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

# ServerAliveInterval：这条链路实测会静默断开连接，长传和大批次会莫名中断。
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20
          -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -p "$SSH_PORT")
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

# 20MB 的包在这条链路上实测反复断传（留下半包占着远端 /tmp）。
# 优先用可续传的 rsync；没有 rsync 才退回 scp 整包重传。
# 两种情况都以“远端字节数 == 本地字节数”为准，不认工具退出码。
REMOTE_TARBALL="/tmp/jevcode-${RELEASE_ID}.tar.gz"
remote_size() {
  ssh "${SSH_OPTS[@]}" "$SSH_HOST" "wc -c < $REMOTE_TARBALL 2>/dev/null || echo 0" | tr -d ' '
}

upload_tarball() {
  if command -v rsync >/dev/null 2>&1; then
    log "  rsync --partial（断点可续）"
    # rsync 会在收尾阶段偶发断连并返回非零，但文件其实已完整送达。
    # 不看退出码，改看远端实际大小；不全则再续传一次。
    local attempt
    for attempt in 1 2 3; do
      rsync -e "ssh ${SSH_OPTS[*]}" --partial --inplace --timeout=180 \
        "$TARBALL" "$SSH_HOST:$REMOTE_TARBALL" || true
      [ "$(remote_size)" = "$(wc -c < "$TARBALL" | tr -d ' ')" ] && return 0
      log "  第 ${attempt} 次未传完（远端 $(remote_size) 字节），续传..."
      sleep 2
    done
    return 1
  else
    log "  scp（无 rsync，整包重传）"
    local attempt
    for attempt in 1 2 3; do
      scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
        "$TARBALL" "$SSH_HOST:$REMOTE_TARBALL" && return 0
      log "  scp 第 ${attempt} 次失败，重试..."
      sleep 3
    done
    return 1
  fi
}
upload_tarball || die "上传失败：${TARBALL}（远端 $(remote_size) 字节，期望 $(wc -c < "$TARBALL" | tr -d ' ')）"

# 同时上传 nginx 配置，供 bootstrap.sh 首次初始化使用。
# 小文件也重试：这条链路实测会在收尾阶段断开，一次失败不该中断整次发布。
scp_small() {
  local attempt
  for attempt in 1 2 3; do
    scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new \
      -o ServerAliveInterval=15 -o ServerAliveCountMax=6 ${SSH_KEY:+-i "$SSH_KEY"} \
      "$@" && return 0
    log "  小文件上传第 ${attempt} 次失败，重试..."
    sleep 2
  done
  return 1
}
NGINX_CONF_UPLOADED=0
if scp_small "$LOCAL_DIR/deploy/nginx/jevcode.conf" "$SSH_HOST:/tmp/jevcode.conf"; then
  NGINX_CONF_UPLOADED=1
else
  log "WARN nginx 配置上传失败，本次不更新站点配置"
fi

# ---------- 4. 解包并原子切换 ----------
log "解包并切换软链..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd ${REMOTE_ROOT}/releases/${RELEASE_ID}
tar -xzf ${REMOTE_TARBALL}
rm -f ${REMOTE_TARBALL}

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

# ---------- 5. 应用并重载 nginx ----------
# 只上传到 /tmp 是不够的：sites-available 里的配置只在 bootstrap.sh 时被复制过一次，
# 之后仓库里的 nginx 改动永远不会生效，而 /tmp 里的旧副本还会在下次 bootstrap 时
# 把线上配置覆盖回去。这里每次都装一遍再重载，保证仓库是唯一事实来源。
if [ "$NGINX_CONF_UPLOADED" = "1" ]; then
  log "安装并重载 nginx 配置..."
  ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
CONF=/etc/nginx/sites-available/jevcode.conf
cp "$CONF" "${CONF}.prev"
cp /tmp/jevcode.conf "$CONF"
ln -sfn "$CONF" /etc/nginx/sites-enabled/jevcode.conf
# 语法不过就退回上一版，避免把站点留在起不来的配置上
if ! nginx -t; then
  cp "${CONF}.prev" "$CONF"
  nginx -t
  echo "NGINX_CONF_REJECTED"
  exit 1
fi
rm -f "${CONF}.prev"
systemctl reload nginx
echo "NGINX_CONF_APPLIED"
REMOTE
else
  log "校验并重载 nginx（沿用线上已有配置）..."
  ssh "${SSH_OPTS[@]}" "$SSH_HOST" "nginx -t && systemctl reload nginx"
fi

# ---------- 6. 发布后校验 + 自动回滚 ----------
# nginx -t 只证明配置语法对，不证明新版本真的能服务：软链指错、权限没跟上、
# 构建产物缺文件，这些在 nginx -t 里全是绿的，要等用户 404 才发现。
# 10-26 那轮 deploy-failed 就是这么过去的。这里按 sitemap 实采，任何一条不是
# 200 就切回上一版本——回滚成本和人工介入成本都不低，自动做掉更划算。
log "发布后校验..."
VERIFY_URL="${JEVCODE_VERIFY_URL:-https://www.jevcode.ai}"
VERIFY_SAMPLE="${JEVCODE_VERIFY_SAMPLE:-12}"

verify_remote() {
  local urls
  # 从新版本的 sitemap 里抽样，而不是硬编码几个页面：硬编码的路径在站点
  # 改版后仍然返回 200，什么也证明不了。
  urls=$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" \
    "head -c 2000000 ${REMOTE_ROOT}/releases/${RELEASE_ID}/sitemap-0.xml 2>/dev/null \
      || find ${REMOTE_ROOT}/releases/${RELEASE_ID} -maxdepth 1 -name 'sitemap*.xml' -exec cat {} +" \
    | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
    | awk -v n="$VERIFY_SAMPLE" 'NR % 97 == 1' | head -n "$VERIFY_SAMPLE" || true)

  if [ -z "$urls" ]; then
    log "WARN sitemap 里取不到 URL，跳过发布后校验"
    return 0
  fi

  local path bad=0 code
  # 用 while read 而不是 for url in $urls：后者依赖词分割，URL 里一旦出现
  # 空格或被 shell 选项改动就会整行当成一个地址。按行读没有这类隐含假设。
  while IFS= read -r url; do
    [ -n "$url" ] || continue
    # 只校验本站路径：sitemap 里可能混着别的域名，拿去打会得到无关结果。
    path=$(printf '%s' "$url" | sed -E "s#^https?://[^/]+##")
    [ -n "$path" ] || path="/"
    code=$(curl -s -o /dev/null -w '%{http_code}' -m 15 "${VERIFY_URL}${path}" || echo 000)
    if [ "$code" != "200" ]; then
      log "  FAIL ${path} -> HTTP ${code}"
      bad=$((bad + 1))
    fi
  done <<< "$urls"
  [ "$bad" -eq 0 ] || { log "  ${bad} 个 URL 未返回 200"; return 1; }
  return 0
}

if ! verify_remote; then
  PREV=$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" "cat ${REMOTE_ROOT}/shared/previous_release 2>/dev/null || true")
  if [ -n "$PREV" ] && [ "$PREV" != "${REMOTE_ROOT}/releases/${RELEASE_ID}" ]; then
    log "校验失败，自动回滚到 ${PREV}"
    # ln -sfn 对「指向目录的软链」就是原子替换，不需要 mv -T 中转。
    # 多那一层只有 GNU mv 支持，本地验证脚本在 macOS 上直接报 illegal option。
    ssh "${SSH_OPTS[@]}" "$SSH_HOST" "ln -sfn ${PREV} ${REMOTE_ROOT}/current && nginx -t && systemctl reload nginx"
    rm -f "$TARBALL"
    die "发布校验失败，已回滚到 ${PREV}（本次版本留在 releases/${RELEASE_ID} 供排查）"
  fi
  rm -f "$TARBALL"
  die "发布校验失败，且没有可回滚的上一版本（当前线上是 ${RELEASE_ID}，需人工处理）"
fi
log "发布后校验通过"

rm -f "$TARBALL"
log "部署完成：${RELEASE_ID}"
log "回滚命令：ssh ${SSH_HOST} 'ln -sfn \$(cat ${REMOTE_ROOT}/shared/previous_release) ${REMOTE_ROOT}/current && systemctl reload nginx'"
