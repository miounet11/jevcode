---
translatedFrom: en
title: 5 分钟上手
description: 拿到 API key，用 cURL 或 SDK 跑通第一次 Jev 调用，并理解返回值结构。
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
---

## 第一步：在 Playground 里试

打开 [Playground](https://console.typesafe.ai/playground) 并登录，把任意文本粘贴为 **state**：

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

然后添加一个 Noul 问题：

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

你会立刻拿到一个 0 到 1 之间的数值。接近 1 表示模型认为答案是「是」。

Playground 的价值在于**快速试错**：混合 Noul、Choice、Score 三类问题，一次调用同时看到所有结果，确认问题措辞是否达到预期。

## 第二步：拿到 API key

在 [dashboard](https://console.typesafe.ai/settings/keys) 创建 key，然后设置环境变量：

```bash
export TYPESAFE_API_KEY="sk-..."
```

## 第三步：调用 API

所有模型都由同一个端点提供服务：

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

最小可运行的 cURL 示例：

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## 第四步：用 SDK（推荐）

SDK 会默认从环境变量读取 `TYPESAFE_API_KEY`，并默认调用 `jev-latest`。

### Python

```bash
pip install typesafe-sdk     # 或 uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # 需要 Node.js 20+
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

TS SDK 的一大优势是**答案类型由问题自动推导**：传入的 `questions` 决定了返回值的类型，编译期就能发现字段名写错。

## 返回值长什么样

每个答案的类型由问题的 `type` 决定：

| 类型 | 返回字段 | 含义 |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | 选中的选项、各选项概率分布、置信度 |
| `score` | `score` / `legend` / `probabilities` / `confidence` | 分数位置（可落在两档之间）、档位说明、概率分布、置信度 |
| `noul` | `noul` | 答案为「是」的概率，本身不含 `confidence` |

关键约束：**答案永远落在你给定的选项内**。模型返回的是你定义的选项上的概率分布，不会产生集合外的值，所以代码里不需要写解析器恢复语义。

## 常见坑

- **状态里的 `state` 只读一次**：模型先读一次 state，然后并行评估所有问题。所以趁早把多个问题打包进同一个请求，几乎没有额外延迟成本。
- **非文本输入要先转换**：图片、音频、视频需要先转成文本或结构化字段再作为 state 传入。
- **超限返回 429**：官方 SDK 默认按退避重试并尊重 `retry-after` 头；直接调 HTTP API 需要自己实现。

## 下一步

- [Choice 原语](/zh/primitives/choice/) — 分类与路由的基础
- [Score 原语](/zh/primitives/score/) — 打分与排序
- [Noul 原语](/zh/primitives/noul/) — 校验与护栏
- [置信度](/zh/concepts/confidence/) — 用置信度控制系统行为
