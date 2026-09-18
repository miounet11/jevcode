# JevCode 部署说明

## 现状

- **站点**：Astro 7 静态站，44 个页面（zh/en 各 20 篇文档 + 首页 + 404）
- **目标服务器**：`155.94.154.13`（Ubuntu，已有 nginx/1.24.0）
- **域名**：`www.jevcode.ai`（Cloudflare 托管 DNS，已解析——CDN 回源指向服务器）
- **裸域**：`jevcode.ai` 尚未解析

## 部署架构

采用**发布目录 + 软链原子切换**：

```
/var/www/jevcode/
├── releases/
│   ├── 20260918-161000/     ← 每次部署一个新目录
│   ├── 20260918-152000/     ← 保留最近 5 个
│   └── placeholder/         ← 首次部署前的占位
├── shared/
│   └── previous_release     ← 上一个版本路径，用于回滚
└── current -> releases/20260918-161000/   ← nginx 指向这里
```

**为什么这么做**：切换 `current` 软链是原子操作，部署过程中站点不会出现半成品状态；出问题把软链指回上一个版本即可，秒级回滚。

## 首次部署

### 1. 确认前置条件

- DNS：`www.jevcode.ai` 已解析到 `155.94.154.13`
- 服务器 80 端口可从公网访问（certbot 校验需要）
- 本机能 SSH 到服务器

> **注意 SSH 访问**：服务器只开放了 80/443，22 端口对本机不通。这通常是云厂商安全组或服务器防火墙的白名单限制。需要先把你的出口 IP 加入白名单，或确认 SSH 端口号。

### 2. 上传配置并初始化

```bash
# 上传 nginx 配置
scp deploy/nginx/jevcode.conf root@155.94.154.13:/tmp/jevcode.conf

# 在服务器上运行初始化（创建目录、装 nginx 配置、签证书）
ssh root@155.94.154.13 'bash -s' < deploy/bootstrap.sh
```

`bootstrap.sh` 会：
1. 创建 `/var/www/jevcode/{releases,shared}` 和一个占位版本
2. 安装 nginx 站点配置（证书不存在时先用 HTTP-only 版本，供 certbot 校验）
3. 用 certbot 申请 `www.jevcode.ai` + `jevcode.ai` 的证书
4. 切换到完整 HTTPS 配置，并配置自动续期

### 3. 部署站点

```bash
./deploy/deploy.sh
```

## 日常部署

```bash
./deploy/deploy.sh
```

流程：本地构建 → 打包上传 `/tmp` → 服务器解包到新 release → 原子切换软链 → 清理旧版本（保留最近 5 个）→ `nginx -t && systemctl reload nginx`。

## 回滚

```bash
ssh root@155.94.154.13 '
  ln -sfn $(cat /var/www/jevcode/shared/previous_release) /var/www/jevcode/current.tmp &&
  mv -Tf /var/www/jevcode/current.tmp /var/www/jevcode/current &&
  systemctl reload nginx'
```

或者直接指向某个具体版本：

```bash
ssh root@155.94.154.13 '
  ln -sfn /var/www/jevcode/releases/20260918-152000 /var/www/jevcode/current.tmp &&
  mv -Tf /var/www/jevcode/current.tmp /var/www/jevcode/current &&
  systemctl reload nginx'
```

## 可配置的环境变量

`deploy.sh` 支持以下覆盖：

| 变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `JEVCODE_SSH_HOST` | `root@155.94.154.13` | SSH 目标 |
| `JEVCODE_SSH_PORT` | `22` | SSH 端口 |
| `JEVCODE_SSH_KEY` | `~/.ssh/id_ed25519` | 私钥路径 |
| `JEVCODE_REMOTE_ROOT` | `/var/www/jevcode` | 服务器上的站点根目录 |

## 注意事项

**Cloudflare 代理。** `www.jevcode.ai` 走 Cloudflare，这意味着：
- 源站证书只需对 Cloudflare 有效，certbot 签 Let's Encrypt 即可
- Cloudflare 侧的 SSL 模式建议设为 **Full (strict)**，避免回源明文
- 站点更新后可能需要在 Cloudflare 控制台清除缓存，否则 HTML 更新不立即生效
- 如果你希望 certbot 的 HTTP 校验通过，需要确保 Cloudflare 对 `/.well-known/acme-challenge/` 不拦截（默认放行）

**裸域 `jevcode.ai` 尚未解析。** 如果要启用裸域跳转到 www，需要先在 Cloudflare 添加 A 记录指向 `155.94.154.13`（或 CNAME 到 www）。

**certbot 邮箱。** `bootstrap.sh` 里用的是 `admin@jevcode.ai` 占位，首次运行前请改成你的真实邮箱。
