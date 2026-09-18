#!/usr/bin/env bash
# 安装 Cloudflare Origin Certificate 到源站
#
# 用法（本地执行）：
#   ./deploy/install-origin-cert.sh <证书文件路径> <私钥文件路径>
#
# 例：
#   ./deploy/install-origin-cert.sh ~/Downloads/jevcode.crt ~/Downloads/jevcode.key
#
# 安装后源站即使用 Cloudflare 签发的证书，可将 Cloudflare SSL 模式
# 设为 Full (strict)。证书有效期 15 年，无需续期。

set -euo pipefail

CERT_FILE="${1:-}"
KEY_FILE="${2:-}"

SSH_HOST="${JEVCODE_SSH_HOST:-root@23.95.243.52}"
SSH_PORT="${JEVCODE_SSH_PORT:-22}"
SSH_KEY="${JEVCODE_SSH_KEY:-$HOME/.ssh/id_ed25519}"

log() { printf '\033[36m[cert]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ -n "$CERT_FILE" ] && [ -n "$KEY_FILE" ] || die "用法：$0 <证书文件> <私钥文件>"
[ -f "$CERT_FILE" ] || die "证书文件不存在：$CERT_FILE"
[ -f "$KEY_FILE" ]  || die "私钥文件不存在：$KEY_FILE"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20 -p "$SSH_PORT")
[ -f "$SSH_KEY" ] && SSH_OPTS+=(-i "$SSH_KEY")

# ---------- 校验证书与私钥是否匹配 ----------
log "校验证书与私钥..."
CERT_MOD="$(openssl x509 -noout -modulus -in "$CERT_FILE" | openssl md5)"
KEY_MOD="$(openssl rsa -noout -modulus -in "$KEY_FILE" 2>/dev/null | openssl md5)"
[ "$CERT_MOD" = "$KEY_MOD" ] || die "证书与私钥不匹配"

log "证书信息："
openssl x509 -noout -subject -issuer -dates -ext subjectAltName -in "$CERT_FILE" | sed 's/^/    /'

# ---------- 上传 ----------
log "上传到服务器..."
scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
  "$KEY_FILE" "$SSH_HOST:/etc/nginx/ssl/jevcode.key.new"
scp -P "$SSH_PORT" -o StrictHostKeyChecking=accept-new ${SSH_KEY:+-i "$SSH_KEY"} \
  "$CERT_FILE" "$SSH_HOST:/etc/nginx/ssl/jevcode.crt.new"

# ---------- 备份、替换、重载 ----------
log "替换证书并重载 nginx..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /etc/nginx/ssl

# 备份自签证书，便于回滚
[ -f jevcode.crt ] && cp jevcode.crt jevcode.crt.selfsigned.bak
[ -f jevcode.key ] && cp jevcode.key jevcode.key.selfsigned.bak

chmod 600 jevcode.key.new
chmod 644 jevcode.crt.new
mv -f jevcode.key.new jevcode.key
mv -f jevcode.crt.new jevcode.crt

nginx -t
systemctl reload nginx

echo "已安装的源站证书："
openssl x509 -noout -subject -issuer -dates -in /etc/nginx/ssl/jevcode.crt | sed 's/^/  /'
REMOTE

log "完成"
log "现在可在 Cloudflare 控制台把 SSL/TLS 模式设为 Full (strict)"
log "回滚：ssh $SSH_HOST 'cd /etc/nginx/ssl && mv jevcode.crt.selfsigned.bak jevcode.crt && mv jevcode.key.selfsigned.bak jevcode.key && systemctl reload nginx'"
