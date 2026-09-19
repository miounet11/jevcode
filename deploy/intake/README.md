# JevCode 内容投递接口（intake）

供采集器（如 grok bot）把挖掘到的原始内容投递进来。**本接口只负责收下并落盘**，
LLM 整理与发布是独立的下游步骤。

```
采集器 ──POST──> /api/intake ──落盘──> inbox/*.json ──> .pipeline/ingest.py ──> 草稿 ──> 人工审核 ──> 发布
```

## 端点

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| `POST` | `/api/intake` | Bearer | 投递，body 为单个对象或对象数组 |
| `GET` | `/api/health` | 无 | 存活探测 |

基址：`https://www.jevcode.ai`

## 鉴权

```
Authorization: Bearer <token>
```

token 由运维通过服务器环境变量 `JEVCODE_INTAKE_TOKEN` 注入，**不写入仓库**。
未配置 token 时服务拒绝启动。

## 请求体

单条对象，或对象数组（一次最多 200 条）。

```json
{
  "source": {
    "kind": "x",
    "url": "https://x.com/SUOHA_AI/status/2100835307016905109",
    "author": "梭哈.AI",
    "title": "很多人没看懂爆火的 JEV 是什么"
  },
  "lang": "zh",
  "raw": "抓取到的正文原文……",
  "notes": "可选：采集器的补充说明",
  "tags": ["introduction", "video"],
  "idempotencyKey": "可选：自定义幂等键"
}
```

### 字段

| 字段 | 必填 | 约束 |
|---|---|---|
| `source.kind` | ✅ | `x` \| `github` \| `web` \| `manual` \| `paper` |
| `source.url` | ✅ | `http(s)://` 开头 |
| `raw` | ✅ | 原始正文，≤ 200000 字符 |
| `source.title` | | ≤ 500 字符 |
| `source.author` | | ≤ 200 字符 |
| `notes` | | ≤ 2000 字符 |
| `tags` | | 字符串数组，≤ 32 个，每个 ≤ 64 字符 |
| `lang` | | 语言提示，如 `zh` / `en` |
| `idempotencyKey` | | 缺省时按 `source.url` 计算 |

### 幂等

同一来源 URL 重复投递不会产生重复条目：响应中该条 `duplicate: true`。
采集器可重试而无需担心重复。

## 响应

`202 Accepted`（至少一条成功）或 `400`（全部失败）：

```json
{
  "ok": true,
  "accepted": 2,
  "duplicates": 1,
  "errors": [ { "index": 3, "error": "source.url must be a valid http(s) URL" } ],
  "keys": [ { "key": "a1b2…", "duplicate": false } ]
}
```

| 状态码 | 含义 |
|---|---|
| `202` | 已接收 |
| `400` | body 非法 / 全部条目校验失败 |
| `401` | token 缺失或错误 |
| `404` | 路径错误 |
| `413` | body > 512 KB 或条目数 > 200 |
| `429` | 触发限流 |

## 安全边界

本服务被刻意做成最小攻击面：

- **不解析**投递内容（不碰 HTML/Markdown），**不渲染模板**，**不执行**任何输入
- **无出站网络请求**
- 只把 JSON 写入 `inbox/`，文件名是 `sha256(幂等键)[:32].json`，不含用户可控路径成分
- 先写 `.part` 再原子改名，下游不会读到半截文件
- 绑定 `127.0.0.1`，仅经 nginx 反代暴露；已设请求体上限与限流

## 采集器示例

```bash
curl -sS -X POST https://www.jevcode.ai/api/intake \
  -H "Authorization: Bearer $JEVCODE_INTAKE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '[{
    "source": {"kind":"github","url":"https://github.com/elvisun/newsjack","author":"elvisun","title":"newsjack"},
    "lang": "en",
    "raw": "…README 正文…",
    "tags": ["agents","skills"]
  }]'
```

## 处理与发布

投递后内容进入 `inbox/`，由 `.pipeline/ingest.py` 整理。该步骤不自动发布：
生成的草稿需人工审核后才会进入 `src/content/docs/`。这是有意的——采集内容
未经审核直接上线会带来事实错误与版权风险。
