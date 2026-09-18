#!/usr/bin/env bash
# JevCode 服务器初始化脚本
# 目标：23.95.243.52 (Ubuntu 24.04)
#
# 用法（在服务器上以 root 运行）：
#   bash bootstrap.sh
#
# 做的事：
#   1. 创建站点目录结构
#   2. 安装 certbot 与 Cloudflare DNS 插件
#   3. 用 DNS-01 校验签发 Let's Encrypt 证书
#   4. 安装完整 HTTPS nginx 配置
#
# 前置条件：
#   - Cloudflare API Token 已写入 ~/.secrets/certbot/cloudflare.ini
#   - www.jevcode.ai 与 jevcode.ai 的 DNS 记录已指向本机（橙云代理可开）

set -euo pipefail

SITE_DOMAIN="www.jevcode.ai"
ALT_DOMAIN="jevcode.ai"
REMOTE_ROOT="/var/www/jevcode"
CF_CREDS="$HOME/.secrets/certbot/cloudflare.ini"
CONF_SRC="/tmp/jevcode.conf"

log() { printf '\033[36m[bootstrap]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请以 root 运行"

# ---------- 1. 目录结构 ----------
log "创建目录结构..."
mkdir -p "${REMOTE_ROOT}"/{releases,shared}
mkdir -p /var/www/certbot

if [ ! -L "${REMOTE_ROOT}/current" ]; then
  mkdir -p "${REMOTE_ROOT}/releases/placeholder"
  echo "JevCode 部署占位页" > "${REMOTE_ROOT}/releases/placeholder/index.html"
  ln -sfn "${REMOTE_ROOT}/releases/placeholder" "${REMOTE_ROOT}/current"
  log "已创建占位版本"
fi

# ---------- 2. certbot 与 DNS 插件 ----------
if ! command -v certbot >/dev/null 2>&1; then
  log "安装 certbot..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq certbot python3-certbot-dns-cloudflare
fi

# ---------- 3. 证书 ----------
if [ ! -d "/etc/letsencrypt/live/${SITE_DOMAIN}" ]; then
  [ -f "$CF_CREDS" ] || die "缺少 Cloudflare 凭证：$CF_CREDS
请在 Cloudflare 创建 Edit zone DNS 权限的 API Token，然后写入：
  mkdir -p ~/.secrets/certbot
  cat > $CF_CREDS <<INI
dns_cloudflare_api_token = <你的_TOKEN>
INI
  chmod 600 $CF_CREDS"

  log "通过 Cloudflare DNS-01 校验申请证书..."
  certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials "$CF_CREDS" \
    --dns-cloudflare-propagation-seconds 30 \
    -d "${SITE_DOMAIN}" -d "${ALT_DOMAIN}" \
    --non-interactive --agree-tos \
    --email "admin@${ALT_DOMAIN}" \
    || die "证书申请失败。请检查 API Token 权限（需 Zone:DNS:Edit）与 DNS 记录"
else
  log "证书已存在，跳过签发"
fi

# ---------- 4. nginx 配置 ----------
[ -f "$CONF_SRC" ] || die "找不到 ${CONF_SRC}，请先上传 deploy/nginx/jevcode.conf 到该路径"

log "安装 nginx 站点配置..."
cp "$CONF_SRC" /etc/nginx/sites-available/jevcode.conf
ln -sfn /etc/nginx/sites-available/jevcode.conf /etc/nginx/sites-enabled/jevcode.conf
nginx -t
systemctl reload nginx

# ---------- 5. 自动续期 ----------
log "配置自动续期..."
if systemctl list-unit-files | grep -q certbot.timer; then
  systemctl enable --now certbot.timer
  log "已启用 certbot.timer"
else
  (crontab -l 2>/dev/null | grep -v certbot; \
   echo "0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -
  log "已配置 crontab 续期"
fi

log "初始化完成"
log "现在可以在本地运行 ./deploy/deploy.sh 部署站点"
