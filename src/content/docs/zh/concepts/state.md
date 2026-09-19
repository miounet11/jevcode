---
translatedFrom: en
title: State（状态）
description: State 是你要模型评估的内容。理解它的三种形态、如何组织上下文，以及语言支持上的限制。
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
---

## State 是什么

**State** 是你要求 System One 模型评估的内容。它可能是一条客服消息、一段文本，或者你应用的当前状态。你把它放在 API 请求的 `state` 字段里，和你想问的问题一起传进去。

每次请求用**一个 state** 评估**一个或多个问题**。所有问题看到相同的 state，并且**独立**求值。你可以在一个请求里混合 [Choice](/zh/primitives/choice/)、[Score](/zh/primitives/score/) 和 [Noul](/zh/primitives/noul/) 问题。

## 三种形态

### 字符串

最简单的 state 就是一个普通字符串：

```python
state = "My card was charged twice."
```

适合场景简单、只需要一段文本的情况。

### 对象

当决策需要比较多个部分时，用对象把相关信息放在一起，每个部分有描述性的名字：

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

注意这是**一个** state，尽管它同时包含了一段对话、一个订单和一条政策。规范建议：**大多数请求用对象**，这样每一部分都有描述性名称，相互关系保持清晰。

### 数组

适合消息序列或记录序列：

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| 格式 | 适用 | 示例 |
| :--- | :--- | :--- |
| String | 一条消息、一篇文章、一段文本 | `"My card was charged twice."` |
| Object | 命名字段、相关记录、应用状态 | 见上方 JSON |
| Array | 消息或记录的序列 | 见上方数组 |

## 把内容与问题分开

这是使用 Jev 时最重要的心智模型之一：

- **State 装内容和支撑事实。** 退款请求、订单记录、退款政策都放进 state。
- **问题定义要做的判断。** 「用户是否要求退款」「政策是否支持退款」是问题。

不要把判断逻辑写进 state 里。state 应该是你把材料摆到专家面前时会呈现的东西——就像向一组专家陈述材料，然后请他们各自做出判断。

## 语言支持

Jev 接受**纯文本**。state 必须是字符串、JSON 对象或文本数组。

- **不支持** 图片、音频、视频。
- 非文本输入需要先预处理成文本或结构化字段，再作为 state 传入。
- **Jev 的主要训练语言是英语。** 其他语言（包括中日韩文字）可以接受，但目前准确率较低。

最后一条对中文用户尤其重要：如果你的业务涉及中文内容，建议先用真实数据做准确率验证，再决定关键路径是否上线。对于高风险决策，考虑在 state 中补充英文摘要，或者在低置信度时转人工。

## 预算与限制

- 单请求上下文 64k tokens：覆盖 `state` 加**所有**问题。
- 32k tokens：覆盖 `state` 加**最长的那一个**问题。
- 模型只读一次 state，然后并行评估所有问题。所以把多个问题打包进一个请求，几乎没有额外延迟成本——参见[扇出模式](/zh/patterns/fan-out/)。
- 准确率会随 state 增长而变化，官方在 `Jev 1.13 jaggedness` 一节里有专门讨论。

## 相关

- [问题原语](/zh/primitives/) — 如何用 instructions 和 criteria 组织问题
- [置信度](/zh/concepts/confidence/) — 用返回值控制行为
- [API 参考](https://docs.typesafe.ai/api) — 请求 schema
