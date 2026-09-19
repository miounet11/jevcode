---
translatedFrom: en
title: Python SDK
description: 安装 typesafe-sdk，用同步或异步客户端调用 System One API。
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
---

## 安装

```bash
# 用 uv
uv add typesafe-sdk

# 或用 pip
pip install typesafe-sdk
```

然后设置环境变量（在 [console](https://console.typesafe.ai/) 创建 key）：

```bash
export TYPESAFE_API_KEY="sk-..."
```

客户端会自动读取这个环境变量，并默认调用 `jev-latest`。

## 异步客户端（推荐）

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

注意三点：

1. `state` 可以直接传字符串、字典或列表，SDK 会处理序列化。
2. 三类问题用 `Noul(...)` / `Choice(...)` / `Score(...)` 构造，`type` 字段由 SDK 自动填。
3. **响应按问题类型分组** —— `response.nouls`、`response.choices`、`response.scores`，各自用问题名索引。

## 问题构造器

| 构造器 | 参数 | 说明 |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` 可选，`{ true, false }` | 是/否概率 |
| `Choice(instructions, criteria)` | `criteria` 是 `{ 选项: 描述或 None }` | 从固定选项选一个 |
| `Score(instructions, criteria)` | `criteria` 是**有序数组** | 在有序档位上打分 |

## 同步客户端

如果所在环境不方便用 async，还有同步版本：

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="I was charged twice.",
    questions={"billing": Noul(instructions="Is this about billing?")},
)

print(response.nouls["billing"].noul)
```

## 错误与重试

SDK 默认按退避策略重试，并尊重服务端返回的 `retry-after` 头。这一点比直接调 HTTP API 省事很多——限流是动态调整的，官方明确说明限制可能随时变化。

## 相关

- [Python SDK 完整 API 参考](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [5 分钟上手](/zh/quickstart/)
- [扇出并行](/zh/patterns/fan-out/) — 一次问出多个问题
