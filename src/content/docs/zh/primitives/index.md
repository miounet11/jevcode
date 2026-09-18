---
title: 问题原语总览
description: Choice、Score、Noul 三类类型化问题，它们各自返回什么，以及如何选择。
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
---

## 原语是成对出现的

TypeSafe 的原语是你在代码里组合的小型类型化构件。它们成对出现：

- **问题（question）**：定义一个让 System One 模型对 **state** 做出的判断。
- **答案（answer）**：模型返回的类型化值。

你在代码里组合这些答案来做决策。共有三种问题类型，各自返回不同形状的答案。

| 类型 | 回答什么 | 返回 |
| :--- | :--- | :--- |
| [Choice](/zh/primitives/choice/) | 这些选项里选哪个？ | `choice`, `probabilities`, `confidence` |
| [Score](/zh/primitives/score/) | 落在哪一档？ | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/zh/primitives/noul/) | 这是真的吗？ | `noul`（0 到 1） |

你可以只问一个问题，也可以一次发送多个。每个问题独立求值。

## 如何选择原语

选择原语的关键是看**决策的形态**，而不是看业务领域：

- **候选集是有限且互斥的** → Choice。例如工单分类、意图识别、动作选择。
- **存在有序的量纲或质量梯度** → Score。例如相关性、严重程度、满意度。
- **只需要一个是/否判断，且允许模糊** → Noul。例如「这条内容是否违规」「用户是否在要求退款」。

一个常见的错误是用 Score 做本该用 Choice 的事。如果档位之间没有真正的序关系（比如「账单 / 技术 / 销售」），用 Choice；强行用 Score 会引入虚假的序数语义，让后续阈值判断失去意义。

反过来，如果确实存在连续梯度，用 Score 比用多个 Noul 拼装更省事，因为 Score 一次就给出完整分布。

## 答案的两个关键性质

**每个答案都被约束在你提供的选项内。** 模型返回的是你给的选项或档位上的概率分布，永远不会产生集合外的值。这意味着代码里不需要从生成的散文里恢复取值——这是 Jev 与「让 LLM 输出 JSON 再解析」最本质的区别。

**每个答案相互独立。** 一个问题的答案不会成为另一个问题的隐藏上下文。这条约束保证了：

- 问题的评估顺序不影响结果；
- 可以安全地一次性问很多问题（包括那些只在某些分支下才有意义的问题），而不必担心相互污染；
- 每个答案的语义可以单独测试和验证。

第二条性质带来一个非常实用的推论：**推测性提问（speculative questions）几乎免费**。比如工单场景里，`bug_severity` 只在工单是 bug 报告时才有意义，`refund_requested` 只在账单类问题下才有意义。但把它们全部前置放进同一个请求，不会带来速度损失——模型并行评估全部问题，你只在需要时读取对应答案。

## 一次问多个问题

```json
{
  "intent": {
    "type": "choice",
    "instructions": "The primary intent of this customer message",
    "criteria": {
      "order_status": "Asking about an existing order",
      "product_question": "Asking about a product before buying",
      "return_exchange": "Wants to return or exchange something",
      "complaint": "Unhappy about an experience"
    }
  },
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

一次调用返回三个独立答案，代码按 `intent` 分流后，再从已经拿到的结果里读取需要的字段。

## 进阶

- [原语进阶用法](/zh/primitives/advanced/) — criteria 的写法、措辞技巧、边界处理
- [扇出模式](/zh/patterns/fan-out/) — 如何把大量问题打包进一次请求
- [置信度](/zh/concepts/confidence/) — 用 `confidence` 与 `probabilities` 控制行为
