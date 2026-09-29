# 账号体系部署说明

会员/额度/API Key 都在 `server/playground.mjs` 里。分两组端点：

**网页侧（www.jevcode.ai，同源，走会话 Cookie）**

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/auth/register` | POST | 注册，成功后自动登录并下发会话 |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/logout` | POST | 登出 |
| `/api/auth/me` | GET | 当前用户 + 额度 + Key 列表 |
| `/api/auth/ledger` | GET | 余额、累计消费与消费流水 |
| `/api/keys` | POST | 签发 API Key（明文只返回一次） |
| `/api/keys/revoke` | POST | 吊销自己的 Key |

**程序侧（api.jevcode.ai，只认 Bearer Key，不认 Cookie）**

| 端点 | 方法 | 说明 |
|---|---|---|
| `/v1/judge` | POST | 跑一次判定，扣 1 美分 |
| `/v1/me` | GET | 当前用户、余额、累计消费 |
| `/v1/usage` | GET | 余额、累计消费与最近流水 |

计费口径：注册即送 **$5（500 美分）**，每次判定扣 **1 美分**，用完为止。
余额由账本 `SUM(cents)` 算出，不是存储字段。

## 上线前必须做的三件事

### 1. 在 env 文件里加账号库路径

`/etc/jevcode/playground.env` 增加一行：

```
PLAYGROUND_ACCOUNTS_DB=/var/lib/jevcode-accounts/accounts.db
```

**不加的后果**：服务照常跑，但 `/api/auth/*`、`/api/keys` 与 `/v1/*` 一律
返回 `503 accounts are not configured`，登录/注册/API 调用全部失败。

目录要先建好并给运行用户写权限（service 里没配 `User=`，即以 root 运行）：

```bash
install -d -m 0750 /var/lib/jevcode-accounts
```

### 2. 重载 nginx

`deploy/nginx/jevcode.conf` 里 www 侧新增了 `/api/auth/` 与 `/api/keys`
（原有 `location /api/` 是白名单式的，其余路径一律 `return 404`）。

```bash
nginx -t && systemctl reload nginx
```

`nginx -t` 必须通过再 reload，否则 nginx 会拒绝加载。

### 3. 让 api.jevcode.ai 可用（三段都做完才通）

`api.jevcode.ai` 走 Cloudflare，任一段缺失都会 521/522 或 TLS 失败：

1. **CF DNS**：给 `api` 加 A 记录指向源站 IP，**必须开 Proxied**（橙色云）。
2. **CF Origin 证书**：SAN 必须包含 `api.jevcode.ai`，否则 Full 模式回源
   TLS 握手失败。Cloudflare → SSL/TLS → Origin Server → Create Certificate，
   Hostnames 填 `api.jevcode.ai`，装到源站并让该 server 块指向它。
3. **origin 的 server 块**：`deploy/nginx/jevcode.conf` 里的 `api.jevcode.ai`
   server 块随 nginx 一起部署。

## 验证部署是否成功

从公网打（不要在服务器本地打，本地是另一条链路）：

```bash
# 未登录应为 401，而不是 404 或 503
curl -sS -o /dev/null -w '%{http_code}\n' https://www.jevcode.ai/api/auth/me

# 注册一个测试账号
curl -sS -X POST https://www.jevcode.ai/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","password":"a-good-password"}'
```

预期：第一条 `401`，第二条 `201` 且返回 `credit.cents = 500`。

若第一条是 `404` → nginx 没 reload。
若第一条是 `503` → env 里没配 `PLAYGROUND_ACCOUNTS_DB`。

程序侧验证（先签发一个 Key）：

```bash
curl -sS https://api.jevcode.ai/v1/me -H "Authorization: Bearer jev_..."
```

未带 Key 应 `401`；带合法 Key 应 `200` 并返回 `credit.cents`。

## 数据与备份

单个 SQLite 文件（WAL 模式）。备份直接复制即可，注意连同 `-wal`、`-shm`：

```bash
sqlite3 /var/lib/jevcode-accounts/accounts.db ".backup /root/accounts-$(date +%F).db"
```

口令是 scrypt 散列、会话与 API Key 只存 sha256——库泄露不等于凭据泄露。

## 验证码登录（可选）

发信通道靠 `MAIL_TRANSPORT` / SMTP 相关 env 配置；没配则 `/api/auth/otp/*`
返回 `503 code_login_unavailable`，**密码登录不受影响**。产品流程不使用验证码登录。

## 尚未实现

- 邮箱验证、找回密码
- 支付与订阅生命周期（付费档价格未定，`PLAN_META.paid` 是占位）
- 额度用完后的按量充值（`accounts.credit()` 已具备入账能力，缺支付打通）
- 管理端（查看用户、手工调额）
