# JevCode 部署说明

## 现状

| 项 | 值 |
| :--- | :--- |
| **服务器** | `23.95.243.52`（RackNerd，Ubuntu 24.04 LTS，10 核 / 7.8G / 144G） |
| **SSH** | `root@23.95.243.52:22`，已配置密钥登录（`~/.ssh/id_ed25519`） |
| **域名** | `www.jevcode.ai`（Cloudflare 代理）、`jevcode.ai`（裸域） |
| **站点根** | `/var/www/jevcode/current` |
| **Web 服务器** | nginx 1.24.0 |
| **证书** | Let's Encrypt，Cloudflare DNS-01 校验 |

服务器上已有其他站点，本配置用显式 `server_name` 精确匹配，不与之冲突：

- `xiaoshuo` → `:80` default_server（`server_name _`）→ 反代 `127.0.0.1:8788`
- `manhua-kaifa` → `:18765` → 反代 `127.0.0.1:8765`

## 部署架构

采用**发布目录 + 软链原子切换**：

```
/var/www/jevcode/
├── releases/
│   ├── 20260918-082229/     ← 每次部署一个新目录
│   └── placeholder/         ← 首次部署前的占位
├── shared/
│   └── previous_release     ← 上一个版本路径，用于回滚
└── current -> releases/20260918-082229/   ← nginx 指向这里
```

切换 `current` 软链是原子操作，部署过程中站点不会出现半成品状态；出问题把软链指回上一个版本即可，秒级回滚。

## 首次部署（已完成）

1. 上传构建产物到 `/var/www/jevcode/releases/<时间戳>`
2. 创建 `current` 软链
3. 安装 nginx 配置（HTTP-only，等待证书）
4. 用 DNS-01 校验签发证书
5. 切换为完整 HTTPS 配置

## 证书签发

因为 `www.jevcode.ai` 走 Cloudflare 代理（橙云），HTTP-01 校验会被 Cloudflare 拦截，所以采用 **DNS-01 校验**。

### 创建 Cloudflare API Token

1. Cloudflare 控制台 → 右上角头像 → **My Profile** → **API Tokens**
2. **Create Token** → 使用 **Edit zone DNS** 模板
3. Permissions：`Zone` → `DNS` → `Edit`
4. Zone Resources：`Include` → `Specific zone` → `jevcode.ai`
5. 创建并复制 Token（仅显示一次）

### 写入服务器凭证

```bash
ssh root@23.95.243.52
mkdir -p ~/.secrets/certbot
cat > ~/.secrets/certbot/cloudflare.ini <<'INI'
dns_cloudflare_api_token = <你的_TOKEN>
INI
chmod 600 ~/.secrets/certbot/cloudflare.ini
```

### 签发

```bash
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 30 \
  -d www.jevcode.ai -d jevcode.ai \
  --non-interactive --agree-tos \
  --email admin@jevcode.ai
```

## 日常部署

```bash
./deploy/deploy.sh
```

流程：本地构建 → 打包上传 `/tmp` → 服务器解包到新 release → 原子切换软链 → 清理旧版本（保留最近 5 个）→ `nginx -t && systemctl reload nginx`。

## 回滚

```bash
ssh root@23.95.243.52 '
  ln -sfn $(cat /var/www/jevcode/shared/previous_release) /var/www/jevcode/current.tmp &&
  mv -Tf /var/www/jevcode/current.tmp /var/www/jevcode/current &&
  systemctl reload nginx'
```

或指向具体版本：

```bash
ssh root@23.95.243.52 '
  ln -sfn /var/www/jevcode/releases/20260918-082229 /var/www/jevcode/current.tmp &&
  mv -Tf /var/www/jevcode/current.tmp /var/www/jevcode/current &&
  systemctl reload nginx'
```

## 可配置的环境变量

`deploy.sh` 支持以下覆盖：

| 变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `JEVCODE_SSH_HOST` | `root@23.95.243.52` | SSH 目标 |
| `JEVCODE_SSH_PORT` | `22` | SSH 端口 |
| `JEVCODE_SSH_KEY` | `~/.ssh/id_ed25519` | 私钥路径 |
| `JEVCODE_REMOTE_ROOT` | `/var/www/jevcode` | 服务器上的站点根目录 |

## Cloudflare 注意事项

**回源地址。** `www.jevcode.ai` 的 A 记录必须指向 `23.95.243.52`。若仍指向旧服务器会出现 **521 源站不可达**。

**SSL 模式。** 建议设为 **Full (strict)**。源站使用 Let's Encrypt 有效证书，满足 strict 要求。

**缓存。** 站点更新后如遇 HTML 未更新，在 Cloudflare 控制台清除缓存，或使用开发模式。nginx 已对 HTML 设置 `must-revalidate`，但 Cloudflare 边缘仍可能缓存。

**DNS-01 不受代理影响。** DNS 校验写入 TXT 记录，因此即使橙云开启也能正常签发。

**裸域 `jevcode.ai`。** 需要单独添加 A 记录指向 `23.95.243.52`，否则裸域跳转 www 的配置不会生效。

## 安全建议

- 服务器 root 密码已在对话中明文出现，建议尽快改密：`passwd root`
- 考虑禁用密码登录，仅保留密钥（确认密钥可用后再操作）：
  ```
  # /etc/ssh/sshd_config
  PasswordAuthentication no
  PermitRootLogin prohibit-password
  ```
  然后 `systemctl restart ssh`
