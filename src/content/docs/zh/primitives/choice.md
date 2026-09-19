---
translatedFrom: en
title: Choice
description: Choice 从一组固定选项中选出一个。答案是选中项、每个选项的概率以及置信度。
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
---

## 什么时候用

当答案落在**一组固定的、互斥的选项**中时，用 Choice。例如：

- 哪个团队处理这张工单
- 商品属于哪个品类
- 这段代码是用什么语言写的

如果答案是某个连续谱上的位置，用 [Score](/zh/primitives/score/)；如果只是是/否，用 [Noul](/zh/primitives/noul/)。

典型问题示例：

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `type` | 是 | 必须是 `"choice"` |
| `instructions` | 是 | 问题本身，说明要做的判断 |
| `criteria` | 是 | 选项定义。对象形式 `{ 选项名: 描述 }`，描述可为 `null` |

`instructions` 和 `criteria` 里的每一项都可以是**字符串、对象或数组**。从字符串开始；当某个选项需要多种指引（覆盖什么、不覆盖什么、举几个例子）时，改用对象。

## 请求示例

按部门给客服工单分类：

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## 返回值

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| 字段 | 含义 |
| :--- | :--- |
| `choice` | 选中的选项名 |
| `probabilities` | 每个选项上的概率分布 |
| `confidence` | 该分布集中程度的汇总值，0 到 1 |

`probabilities` 是你自己定义更有用的度量所需的原始材料——详见[置信度](/zh/concepts/confidence/)。

## 使用要点

**始终提供兜底选项。** 加一个 `other` 或 `none of the above`，让模型在其余选项都不合适时有话可说，而不是被迫选一个最不差的。这能显著降低边缘情况的误判。

**选项描述要写「边界」。** 描述的价值在于划清「包含什么」和「不包含什么」。上例中 `billing` 写的是「Charges, invoices, payment problems」，而不是笼统的「钱相关的事」。

**选项名够清楚时，描述可以直接传 `null`。** 比如语气三分类 `{ "calm": null, "frustrated": null, "angry": null }`——选项名本身已经无歧义，多余的描述反而可能引入噪声。

**推测性问题没有额外成本。** 下面这个更复杂的例子里，`return_reason` 只在 `department` 是 `returns` 时才有意义，`shipping_issue` 只在 `shipping` 时才有意义。但把它们全部前置放进同一个请求不会拖慢速度——模型并行评估所有问题。这类问题叫**推测性问题**（speculative questions）。

**深层级分类要用链式调用。** 如果要对文档做深层级或大分类体系的归类，把 Choice 问题逐层串联。官方有一份 cookbook 讲如何在 Choice 的概率上跑 beam search：每层保留最好的 K 条候选路径，而不是贪心地只选一条。

## 相关

- [Score](/zh/primitives/score/) — 有序量纲上的评分
- [Noul](/zh/primitives/noul/) — 是/否概率
- [意图路由模式](/zh/patterns/intent-routing/) — Choice 最常见的生产用法
- [置信度](/zh/concepts/confidence/) — 用 `probabilities` 和 `confidence` 控制行为
