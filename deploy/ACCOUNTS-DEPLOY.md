# 账号体系部署说明

会员/额度/API Key 三个能力都在 `server/playground.mjs` 里（同源，共用会话 Cookie），
新增了这些端点：

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/auth/register` | POST | 注册，成功后自动登录并下发会话 |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/logout` | POST | 登出 |
| `/api/auth/me` | GET | 当前用户 + 额度 + Key 列表 |
| `/api/keys` | POST | 签发 API Key（明文只返回一次） |
| `/api/keys/revoke` | POST | 吊销自己的 Key |

## 上线前必须做的两件事

### 1. 在 env 文件里加账号库路径

`/etc/jevcode/playground.env` 增加一行：

```
PLAYGROUND_ACCOUNTS_DB=/var/lib/jevcode-accounts/accounts.db
```

**不加的后果**：服务照常跑，但 `/api/auth/*` 与 `/api/keys` 一律返回
`503 accounts are not configured`，网页上登录/注册全部失败。

目录要先建好并给运行用户写权限（service 里没配 `User=`，即以 root 运行）：

```bash
install -d -m 0750 /var/lib/jevcode-accounts
```

改完需要重启：

```bash
systemctl restart jevcode-playground
systemctl status jevcode-playground
```

### 2. 重载 nginx（新 location 才生效）

`deploy/nginx/jevcode.conf` 新增了 `/api/auth/` 与 `/api/keys` 两个 location。
该文件是白名单式的——`location /api/` 把其余路径一律 `return 404`，不加这两条的话
新端点上线即 404。

```bash
nginx -t && systemctl reload nginx
```

`nginx -t` 必须通过再 reload，否则 nginx 会拒绝加载。

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

预期：第一条 `401`，第二条 `201` 且返回 `remaining.day = 25`。

若第一条是 `404` → nginx 没 reload。
若第一条是 `503` → env 里没配 `PLAYGROUND_ACCOUNTS_DB`。

## 数据与备份

单个 SQLite 文件（WAL 模式）。备份直接复制即可，注意连同 `-wal`、`-shm`：

```bash
sqlite3 /var/lib/jevcode-accounts/accounts.db ".backup /root/accounts-$(date +%F).db"
```

口令是 scrypt 散列、会话与 API Key 只存 sha256——库泄露不等于凭据泄露。

## 尚未实现

- 邮箱验证、找回密码（需要发信能力）
- 支付与订阅生命周期（`PLANS.paid` 目前是占位额度，价格未定）
- 额度超额后的按量充值
- 管理端（查看用户、手工调额）
