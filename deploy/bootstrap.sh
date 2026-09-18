#!/usr/bin/env bash
# 服务器首次初始化脚本
# 在服务器上以 root 运行：bash bootstrap.sh
#
# 做的事：
#   1. 创建站点目录结构
#   2. 安装并配置 nginx 站点
#   3. 申请 Let's Encrypt 证书
#
# 前置条件：
#   - nginx 已安装（本机 155.94.154.13 上已有 nginx/1.24.0）
#   - www.jevcode.ai 的 DNS 已解析到本机公网 IP
#   - 80 端口可从公网访问（certbot 需要）

set -euo pipefail

SITE_DOMAIN="www.jevcode.ai"
ALT_DOMAIN="jevcode.ai"
REMOTE_ROOT="/var/www/jevcode"
CONF_SRC="/tmp/jevcode.conf"

log() { printf '\033[36m[bootstrap]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请以 root 运行"

# ---------- 1. 目录结构 ----------
log "创建目录结构..."
mkdir -p "${REMOTE_ROOT}"/{releases,shared}
mkdir -p /var/www/certbot

# ---------- 2. 首次部署前需要有个可访问的目录，否则 nginx root 不存在会 403 ----------
if [ ! -L "${REMOTE_ROOT}/current" ]; then
  mkdir -p "${REMOTE_ROOT}/releases/placeholder"
  echo "JevCode 部署占位页" > "${REMOTE_ROOT}/releases/placeholder/index.html"
  ln -sfn "${REMOTE_ROOT}/releases/placeholder" "${REMOTE_ROOT}/current"
  log "已创建占位版本"
fi

# ---------- 3. nginx 站点配置 ----------
if [ ! -f "$CONF_SRC" ]; then
  die "找不到 ${CONF_SRC}，请先把 deploy/nginx/jevcode.conf 上传到该路径"
fi

log "安装 nginx 站点配置..."
# 首次安装时证书还不存在，先写一份只有 80 端口的临时配置，否则 nginx -t 会失败
if [ ! -d "/etc/letsencrypt/live/${SITE_DOMAIN}" ]; then
  log "证书尚未签发，先安装 HTTP-only 配置以便 certbot 校验"
  cat > /etc/nginx/sites-available/jevcode.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SITE_DOMAIN} ${ALT_DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root ${REMOTE_ROOT}/current;
        try_files \$uri \$uri/index.html \$uri/ =404;
    }
}
EOF
else
  cp "$CONF_SRC" /etc/nginx/sites-available/jevcode.conf
fi

ln -sfn /etc/nginx/sites-available/jevcode.conf /etc/nginx/sites-enabled/jevcode.conf
nginx -t
systemctl reload nginx

# ---------- 4. 证书 ----------
if [ ! -d "/etc/letsencrypt/live/${SITE_DOMAIN}" ]; then
  log "申请 Let's Encrypt 证书..."

  if ! command -v certbot >/dev/null 2>&1; then
    log "安装 certbot..."
    apt-get update -qq
    apt-get install -y -qq certbot python3-certbot-nginx
  fi

  certbot certonly --webroot -w /var/www/certbot \
    -d "${SITE_DOMAIN}" -d "${ALT_DOMAIN}" \
    --non-interactive --agree-tos \
    --email "admin@${ALT_DOMAIN}" \
    || die "证书申请失败。请确认 DNS 已解析到本机、80 端口可从公网访问"

  log "证书已签发，切换到 HTTPS 配置"
  cp "$CONF_SRC" /etc/nginx/sites-available/jevcode.conf
  nginx -t
  systemctl reload nginx

  # 自动续期
  log "配置自动续期..."
  systemctl enable --now certbot.timer 2>/dev/null || {
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -
  }
else
  log "证书已存在，跳过签发"
fi

log "初始化完成"
log "现在可以在本地运行 ./deploy/deploy.sh 部署站点"
