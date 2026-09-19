# TypeSafe System One API — 实测记录

本文件是**实测**结果，不是文档转述。凡与 `.research/api.md`（官方文档抓取）不一致处，
以本文件的实测为准，并已注明差异。

- 端点：`POST https://api.typesafe.ai/v1/systemone`
- 鉴权：`Authorization: Bearer <API_KEY>`，`Content-Type: application/json`
- 模型别名：`jev-latest`（实测解析为 `jev-1.13.0`）、`jev-preview`
- 粗延迟：单请求 2–5 秒（客户端实测，含网络）

## 三种题型：实测请求 / 响应

### Noul（是/否）

```json
{"state":"Help! My payouts have been failing for 3 days.","model":"jev-latest",
 "questions":{"is_urgent":{"type":"noul","instructions":"Does this convey urgency?"}}}
```

```json
{"model":"jev-1.13.0",
 "answers":{"is_urgent":{"type":"noul","noul":0.95}},
 "usage":{"input_tokens":283,"output_tokens":23}}
```

### Choice（单选）

```json
{"state":"Help! My payouts have been failing for 3 days.","model":"jev-latest",
 "questions":{"dept":{"type":"choice","instructions":"Which team should handle this?",
   "criteria":{"billing":"Payments, invoicing, refunds","technical":"Bugs, outages","sales":"Pricing"}}}}
```

```json
{"model":"jev-1.13.0",
 "answers":{"dept":{"type":"choice","choice":"billing","confidence":0.82,
   "probabilities":{"billing":0.88,"sales":0.0,"technical":0.12}}},
 "usage":{"input_tokens":340,"output_tokens":38}}
```

### Score（分级评分）

**`criteria` 是数组，不是 map。** 这一点文档写对了（`.research/api.md` 的 `criteria` 标为 `array`），
但很容易踩，实测传 map 会 422。

```json
{"state":"Help! My payouts have been failing for 3 days.","model":"jev-latest",
 "questions":{"frustration":{"type":"score","instructions":"How frustrated is the customer?",
   "criteria":["Calm","Frustrated","Very angry"]}}}
```

```json
{"model":"jev-1.13.0",
 "answers":{"frustration":{"type":"score","score":1.03,"confidence":0.95,
   "legend":{"0":"Calm","1":"Frustrated","2":"Very angry"},
   "probabilities":{"0":0.0,"1":0.97,"2":0.03}}},
 "usage":{"input_tokens":312,"output_tokens":19}}
```

注意 `score` 是**概率加权的连续值**，可以落在两级之间（`1.03` 不在整数上），
`legend` 负责把级号映射回描述。

## 一次请求问多个问题

三种题型可以混在同一个 `questions` map 里一次问完，实测 200 并各自返回对应答案：

```json
"questions":{
  "urgent":{"type":"noul","instructions":"Is this urgent?","criteria":{"true":"Time-sensitive","false":"Can wait"}},
  "intent":{"type":"choice","instructions":"What does the user want?","criteria":{"refund":null,"status":null,"cancel":null}},
  "anger":{"type":"score","instructions":"How angry?","criteria":["Calm","Annoyed","Furious"]}}
```

`state` 也可以是结构化对象，不只字符串：

```json
"state":{"messages":[{"role":"user","content":"I was charged twice"},
                     {"role":"assistant","content":"Sorry about that"}]}
```

## 边界行为（实测）

| 情况 | 结果 |
| :--- | :--- |
| `noul` 只给 `instructions`、不给 `criteria` | 200，`criteria` 可选 |
| `choice` 的选项值为 `null` | 200，`null` 表示该选项无需额外说明 |
| `score` 只给 1 个 level | 200（**文档称至少 2 级，实际未强制**） |
| `state` 为空字符串 `""` | 200，仍返回答案 |
| 题型非法（`"bogus"`） | 400 `{"detail":{"error_type":"api_usage_error","message":"Invalid request."}}` |
| 题目既无 `criteria` 也无 `instructions` | 400 `{"detail":"Noul question must have criteria or instructions: x"}` |
| `questions` 为空 map | 422，`Dictionary should have at least 1 item` |

### 与官方文档的差异（值得回写上游）

1. **Score 最少级数**：文档写"至少两级"，实测 1 级也返回 200。
2. **错误形状不统一**：非法题型返回**嵌套** `{"detail":{"error_type",...,"message"}}`，
   而缺字段/参数校验返回**扁平** `{"detail":"..."}` 或 `{"detail":[{"type":...}]}`。
   调用方要同时处理三种形状。
3. `criteria` 可选性的措辞：文档把 `choice.criteria` 标为 `required`，但传 `null` 值合法。

## 模型清单

`GET https://api.typesafe.ai/v1/models`（同一个 Bearer 头）实测返回：

```json
{"models":[
  {"name":"jev-latest","description":"The latest iteration of TypeSafe's System One Model: Jev","release_date":"2026-09-10T18:38:01Z"},
  {"name":"jev-preview","description":"A preview version of `jev-latest`","release_date":"2026-09-10T18:39:06Z"}]}
```

`/models`（无 `/v1`）和 `/v1/systemone/models` 均 404。

定价与限额见 `.research/models.md`：Jev 1.13 为 `$42/Btok`（即 `$0.042/Mtok`），
按**输入**计费、输出免费；限额 250,000 tokens/s、1,200 req/min；上下文 64k（`state` 32k + 最长问题）。
