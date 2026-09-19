---
title: HTTP API 参考
description: 直接调用 TypeSafe 评估端点：请求结构、noul / choice / score 三类问题、响应形状与错误处理。
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
---

## 端点

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

把 `state` 交给一组带类型的 `questions`，拿回一一对应的 `answers`。

## 请求体

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | 是 | 待评估的内容。纯文本用字符串；聊天记录、业务记录、应用当前状态等用结构化数据 |
| `model` | string | 是 | 处理请求的模型。用 `jev-latest`，TypeSafe 的旗舰模型；其他模型与别名见官方 Models 页 |
| `questions` | map&lt;string, Question&gt; | 是 | 问题映射 |

`questions` 的 key 由你命名，对应的答案会以**同一个 key** 返回。该 key 不会发给底层模型，也不参与推理——可以放心用业务语义命名（`department`、`is_urgent`）。

## 三类问题

`Question` 由 `type` 字段决定，共三种。三者都共享 `type` 与 `instructions`，各自追加自己的 `criteria`。

`instructions` 的类型是 `string | object | array`。

### noul — 是/否判断

一个是/否问题。**返回答案为「是」的概率**。

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria` 可选，用来说明「是」和「否」分别指什么：

| 键 | 说明 |
| :--- | :--- |
| `true` | 取值为「是」（接近 1）时的含义 |
| `false` | 取值为「否」（接近 0）时的含义 |

### choice — 从选项中选择

从你定义的一组选项中选一个，返回被选中的选项**以及完整的概率分布**。

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria` 必填，类型为 `map<string, string | null>`：选项名映射到评分标准描述。若某个选项不需要额外说明，值可写 `null`。

### score — 按量表打分

沿你定义的标准给 `state` 打分，返回**各等级的加权值**。

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` 必填，是一个**有序数组**，元素为各等级的描述。至少要给两个等级。

## 响应体

每个问题返回一个答案，key 与你提供的 id 相同。

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `model` | string | 执行本次评估的模型 |
| `answers` | map&lt;string, Answer&gt; | 每个问题一个答案，key 与 `questions` 一致 |
| `usage` | object | 本次请求的 token 用量：`input_tokens`、`output_tokens` |

### 各类型答案

每个答案都带 `type`，与对应问题的类型一致。`choice` 与 `score` 的答案还带 `confidence`（0 到 1），由该答案的概率分布推导而来（见官方 Confidence 页）。

**noul 答案**

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `noul` | number | 是/否的答案，取值 0（否）到 1（是） |

```json
{ "type": "noul", "noul": 0.92 }
```

**choice 答案**

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `choice` | string | 概率最高的选项 |
| `probabilities` | map&lt;string, number&gt; | 每个选项的概率，合计为 1 |
| `confidence` | number | 模型的确定程度，由概率推导 |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**score 答案**

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `score` | number | 各等级的加权结果，**可能落在两个等级之间** |
| `legend` | map&lt;string, string&gt; | 等级序号映射回其描述 |
| `probabilities` | map&lt;string, number&gt; | 每个等级（字符串 key）的概率，合计为 1 |
| `confidence` | number | 模型的确定程度，由概率推导 |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

注意 `score` 与 `probabilities` 的关系：三个等级的概率分别是 0.05 / 0.3 / 0.65，加权得到 `score` 为 1.6。所以 `score` 不必是整数——这正是它区别于 `choice` 的地方：`choice` 只给一个离散选项，`score` 能表达「介于两者之间」。

## 错误

错误使用标准 HTTP 状态码，响应体是描述问题原因的 JSON。

| 状态码 | 含义 |
| :--- | :--- |
| `401 Unauthorized` | API key 缺失或无效。检查 `Authorization` 请求头 |
| `422 Unprocessable Entity` | 请求体未通过校验，例如缺少必填字段或问题格式有误。响应体会指出出错的字段 |
| `429 Too Many Requests` | 超出速率限制。稍后重试 |
| `529 Overloaded` | TypeSafe 暂时过载。稍后重试 |

### 处理限流

收到 `429` 或 `529` 时，**用指数退避重试**，不要立即重试。若使用官方 SDK，其默认重试策略已自动处理，无需额外代码。
