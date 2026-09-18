# JevCode 部署说明

## 现状

| 项 | 值 |
| :--- | :--- |
| **服务器** | `23.95.243.52`（RackNerd，Ubuntu 24.04 LTS，10 核 / 7.8G / 144G） |
| **SSH** | `root@23.95.243.52:22`，已配置密钥登录（`~/.ssh/id_ed25519`） |
| **域名** | `www.jevcode.ai`（Cloudflare 代理，已上线）；`jevcode.ai` 裸域待解析 |
| **站点根** | `/var/www/jevcode/current` |
| **Web 服务器** | nginx 1.24.0（注意：不支持 `http2 on;` 语法，需用 `listen 443 ssl http2`） |
| **边缘证书** | Cloudflare 自动管理（LE 签发，自动续期） |
| **源站证书** | `/etc/nginx/ssl/jevcode.{crt,key}`，当前自签，待换 Origin 证书 |

## 上线状态

`https://www.jevcode.ai` 已可访问，44 个页面全部 200。HTTP 自动 301 跳转 HTTPS。

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

## 证书

站点走 Cloudflare 代理，涉及**两段 TLS**，各自独立：

```
用户 ←─①─→ Cloudflare ←─②─→ 源站 (23.95.243.52)
     边缘证书           源站证书
```

### ① 边缘证书（用户侧）

由 **Cloudflare 自动管理**，无需任何操作：

- 当前为 Cloudflare Universal SSL，Let's Encrypt 签发，`CN=jevcode.ai`
- 覆盖 `jevcode.ai` 和 `*.jevcode.ai`
- 自动续期

### ② 源站证书（Cloudflare 回源侧）

源站证书路径固定为：

```
/etc/nginx/ssl/jevcode.crt
/etc/nginx/ssl/jevcode.key
```

**当前为自签证书**，因此 Cloudflare 的 SSL/TLS 模式必须设为 **Full**（不能是 strict，因为自签证书无法通过校验）。

**推荐升级为 Cloudflare Origin Certificate**，这样可以使用 Full (strict)：

1. Cloudflare 控制台 → 选择 `jevcode.ai` 域名 → **SSL/TLS** → **Origin Server**
2. **Create Certificate**，Hostnames 填 `www.jevcode.ai` 和 `jevcode.ai`
3. 有效期选 15 年，创建后复制 **Certificate** 和 **Private Key**
4. 保存成本地文件，然后运行：

```bash
./deploy/install-origin-cert.sh ~/Downloads/jevcode.crt ~/Downloads/jevcode.key
```

脚本会校验证书与私钥匹配、备份原自签证书、替换并 reload nginx。

5. 回到 Cloudflare，把 **SSL/TLS → Overview** 的加密模式改为 **Full (strict)**

Origin Certificate 由 Cloudflare 签发，有效期 15 年，无需续期。

### 为何不用 certbot + Let's Encrypt

站点走 Cloudflare 代理（橙云），HTTP-01 校验会被 Cloudflare 拦截，必须用 DNS-01 校验（需 Cloudflare API Token）。同时 LE 证书有效期仅 90 天需持续续期。Origin Certificate 更简单且免维护。

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
