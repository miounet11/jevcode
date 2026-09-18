---
title: Noul
description: Noul 让模型评估一个是/否问题，返回答案为「是」的概率。它本身就是 0 到 1 的数值，不带单独的 confidence。
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
---

## 什么时候用

当答案是**是或否**时，用 Noul。例如：

- 这条消息是在要求退款吗
- 这份简历提到分布式系统经验了吗
- 这条评论包含个人身份信息吗

如果答案是一组选项之一，用 [Choice](/zh/primitives/choice/)；如果是某个谱上的位置，用 [Score](/zh/primitives/score/)。

典型问题示例：

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## 参数

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| `type` | 是 | 必须是 `"noul"` |
| `instructions` | 是 | 要评估的是/否问题或陈述 |
| `criteria` | 否 | 可选的 `{ true, false }` 描述，澄清「是」和「否」各代表什么 |

`criteria` 是可选的。`instructions` 对大多数 Noul 问题已经足够；只有当「是」与「否」之间的边界比较微妙时，才用它来钉死两个结果的含义。**建议两种写法都试一遍**，看哪种在你的数据上效果更好。

## 请求示例

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## 返回值

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

`noul` 取值 0 到 1，表示答案为**「是」**的概率。代码里需要硬决策时，通常把它按阈值转成布尔值。

## Noul 不返回单独的 confidence

这是 Noul 与另外两个原语的重要差别：**Noul 本身就是概率**，所以没有额外的 `confidence` 字段。

- 接近 1：强烈的「是」
- 接近 0：强烈的「否」
- 接近 0.5：是与否概率相近

## 措辞决定一切

**让高概率对应「是」。** 官方建议把问题写成这样，使返回值含义无歧义。如果写成「Is this not urgent?」，那么 0.9 意味着「不紧急」，读代码的人很容易搞反。写成「Is this urgent?」，0.9 就是紧急。

**定义一个清晰的判断标准。** 以「Is the candidate strong in Python?」为例：必须先定义什么叫「strong」。定义不清会让概率难以解释。

**0.5 不等于「中等水平」。** 这是最常见的误用：0.5 表示模型无法区分是或否，而不是「一半的水平」。要衡量技能的深浅程度，应该用 [Score](/zh/primitives/score/) 在定义好的档位上打分。

**可以把指令写成待评估真伪的陈述句。** 除了疑问句，你也可以把指令写成一个陈述句让模型评估其真实性。例如对于「客户在要求退款」这件事，写成陈述句时，接近 1 的值表示该陈述为真。**两种措辞都值得用你自己的数据试一遍。**

## 相关

- [Choice](/zh/primitives/choice/) — 无序的固定选项
- [Score](/zh/primitives/score/) — 有序量纲上的评分
- [置信度](/zh/concepts/confidence/) — 为什么 Noul 没有 confidence
- [Noul 在护栏中的应用](https://docs.typesafe.ai/patterns) — 官方模式库
