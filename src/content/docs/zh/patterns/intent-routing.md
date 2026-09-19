---
translatedFrom: en
title: 意图路由
description: 分类进来的请求，把每一个路由到最合适的处理器：确定性逻辑、专用 LLM，或人工。
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
---

## 这个模式解决什么问题

不是每个用户请求都需要同一种处理器。有些用一次数据库查询就能回答；有些需要带领域上下文的 LLM；还有些必须人工处理。

TypeSafe 可以放在所有这些处理器**前面**，充当一层快速、廉价的分类器，决定该调用哪一个。

**核心成本动机**：与其把每条消息都送进昂贵的 LLM 去判断它是什么类型的请求，不如先分类，再按类型路由。

## 例子：客服路由

设想一个客服系统，消息进来后需要被路由到正确的处理器。

### 第一步：分类意图与复杂度

一次请求里同时问出意图、复杂度和几个辅助判断：

```json
{
  "questions": {
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
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

### 第二步：按分类结果路由

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # 确定性逻辑就够：查数据库
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # 需要领域上下文：交给带知识库的 LLM
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # 高风险：转人工
    route_to_human_agent(state)
```

## 为什么先分类能省钱

关键在于**把昂贵的处理留给真正需要它的请求**。

假设 70% 的客服消息是 `order_status` 这类可以用一次数据库查询解决的。如果所有消息都先送进大模型，你为这 70% 支付了大模型的成本，而它们本不需要。先做一次廉价的 Choice 分类，就能把这部分流量引走。

这里用到的正是[扇出模式](/zh/patterns/fan-out/)：分类、严重度、是否要求退款、情绪等判断一次问全，因为多问不产生速度成本。

## 设计要点

**分类输出要直接可用。** `intent.choice` 的值应该能直接作为路由表的键，不需要再做字符串处理。

**分类的粒度决定系统的复杂度。** 类别太少，路由没有区分度；类别太多，每个类别的样本变少，准确率下降。从 4–6 个类别开始。

**推测性判断一起发。** 上例里的 `bug_severity` 和 `has_reproducible_steps` 只在部分意图下有意义，`refund_requested` 只在退款场景有意义。全部前置发出，成本几乎为零。这正是[扇出并行](/zh/patterns/fan-out/)的价值。

**配合置信度做二次门控。** 如果 `intent.confidence` 偏低，说明分类本身不可靠，此时不应盲目路由，而应该转人工或请求澄清。详见[置信度路由](/zh/patterns/confidence-routing/)。

**保留兜底类别。** 给分类加上 `other` 之类的选项，让不匹配任何处理器类型的请求有处可去，而不是被硬塞进最接近的一类。

## 相关

- [Choice](/zh/primitives/choice/) — 本模式的基础原语
- [扇出并行](/zh/patterns/fan-out/) — 一次问出所有辅助判断
- [置信度路由](/zh/patterns/confidence-routing/) — 分类不可靠时怎么办
- [组合评分](/zh/patterns/composite-scoring/) — 需要排序时的补充模式
