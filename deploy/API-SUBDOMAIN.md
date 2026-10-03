# api.jevcode.ai 上线说明

`api.jevcode.ai` 是给程序调用的正式接口子域。用户注册后用 API Key 在这里调判定，
不经过 www 的页面路由。

## 接口

| 端点 | 方法 | 说明 |
|---|---|---|
| `/v1/judge` | POST | 判定。带 `Authorization: Bearer jev_...` |
| `/v1/me` | GET | 账号与剩余额度 |
| `/v1/usage` | GET | 近 30 天用量与事件明细 |
| `/api/auth/*` | POST/GET | 注册、登录、登出、当前用户（供 SDK 取会话） |
| `/health` | GET | 健康检查 |

调用示例：

```bash
curl -X POST https://api.jevcode.ai/v1/judge \
  -H "Authorization: Bearer jev_xxxxxxxx" \
  -H 'content-type: application/json' \
  -d '{
    "state": "要判断的上下文，至少 8 个字符",
    "questions": {
      "q1": { "type": "noul", "instructions": "这件事相关吗？" }
    }
  }'
```

响应：

```json
{
  "id": "abc123def456",
  "model": "clavue-jev-4b",
  "answers": { "q1": { "noul": 0.98 } },
  "credit": {
    "cents": 490,
    "usd": "4.900026",
    "microUsd": 4900026,
    "inputTokensLeft": 116667285,
    "judgmentsLeft": 116667285
  }
}
```

### 题型限制（实测）

**只有 `noul` 题型会返回答案。** `choice` 题型会让上游返回
`The decision head returned no answers.`，本服务会转成 4xx/5xx 且**不扣费**——
扣费只发生在上游成功之后。
在题型问题解决前，对外文档只承诺 `noul`。

### 额度与计费

- 按输入 token 计费：每百万 $0.042，输出免费；注册即送 $5
- 余额不够覆盖本次输入时返回 `429`（`error: "quota_exceeded"`），带 `retry-after`，响应体含 `credit`
- 判定失败（上游错误）不扣费——扣费发生在上游成功之后，不会白扣
- 上游 rate limit 为 5r/s，**不随套餐提升**——要扩需改上游服务端配置

## 上线三步（在服务器上执行）

### 1. 重签证书，SAN 必须包含 api.jevcode.ai

当前 `/etc/nginx/ssl/jevcode.crt` 是 Cloudflare Origin Certificate，SAN 只有
`www.jevcode.ai` 与 `jevcode.ai`。Cloudflare 是 **Full (strict)** 模式，会校验
回源主机名——不补 SAN，`api.jevcode.ai` 回源直接报 **526**。

去 Cloudflare 面板重新签发：**SSL/TLS → Origin Server → Create Certificate**，
Hostnames 里同时填三个：

```
www.jevcode.ai
jevcode.ai
api.jevcode.ai
```

把新证书与私钥覆盖到 `/etc/nginx/ssl/jevcode.crt` 和 `/etc/nginx/ssl/jevcode.key`。

### 2. Cloudflare DNS 加 api 记录并开启代理

**DNS → Records → Add record**：

- Type: `A`
- Name: `api`
- IPv4: `23.95.243.52`（源站）
- Proxy status: **Proxied（橙云）** ← 必须开启，否则没有边缘证书

### 3. 部署配置并重载

```bash
# 上传新的 nginx 配置到 /etc/nginx/sites-available/jevcode.conf
nginx -t && systemctl reload nginx
```

`nginx -t` 必须通过再 reload——否则 nginx 会拒绝加载，现有站点也会受影响。

## 验证

从**公网**打（不要在服务器本地打，本地是另一条链路）：

```bash
# 应 401（缺 key）而不是 404 / 526 / 301
curl -sS -o /dev/null -w '%{http_code}\n' https://api.jevcode.ai/v1/me

# 健康检查
curl -sS https://api.jevcode.ai/health
```

预期第一条 `401`。若得到：

| 现象 | 原因 |
|---|---|
| `526` | 证书 SAN 不含 api.jevcode.ai，或 CF 未开代理 |
| `404` | nginx 配置没生效（忘记 reload，或 server_name 写错） |
| `301` 跳到 www | CF 的 api 记录没设为 Proxied，请求落到了裸域块 |
| `503` | 服务端没配 `PLAYGROUND_ACCOUNTS_DB`，见 ACCOUNTS-DEPLOY.md |

然后拿一个真实 key 走完整判定：

```bash
KEY=jev_你的key
curl -sS -X POST https://api.jevcode.ai/v1/judge \
  -H "Authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d '{"state":"上线验证用的一段上下文","questions":{"q1":{"type":"noul","instructions":"相关吗？"}}}'
```

预期 `200` 且 `credit.usd` 比上一次减少（按本次输入 token 计费）。

## 安全说明

- `/v1/*` 只认 Bearer key，**不接受会话 Cookie**——避免 CSRF 与计费口径混淆
- API Key 明文只在签发时返回一次，服务端只存 sha256
- 该子域不提供任何静态页面，`location /` 直接返回 404
- 限流复用 `jevcode_intake` zone（5r/s，burst 40）
