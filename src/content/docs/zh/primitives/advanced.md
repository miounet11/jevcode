---
translatedFrom: en
title: 结构化问题
description: instructions 与 criteria 都接受 JSON 结构。System One 模型被训练来理解结构，善用它可以显著提升复杂判断的准确性。
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
---

## 结构可以用在哪里

以下字段都接受 `string`、`object`、`array` 或 `null`：

| 字段 | 适用于 |
| :--- | :--- |
| `instructions` | Choice、Score、Noul |
| `criteria` 的值（Choice 的选项描述） | Choice |
| `criteria` 的条目（Score 的档位描述） | Score |
| `criteria.true` / `criteria.false` | Noul |

**System One 模型被训练来理解结构。** 这不是一个需要绕过的限制，而是一个应该主动利用的能力。

## 什么时候该用结构化写法

- **当它能提升清晰度时。** 一个问题包含多个部分时，用 JSON 把各部分放进具名键里，可读性远好于把它们拼成一段模板字符串。
- **当问题需要支撑数据时。** schema、分类体系、数据库行本来就是 JSON。整体传进去，或者只传相关子字段，而不是序列化成字符串再塞给模型。

## 结构化 instructions：一个可复用的字段描述

一个常见的模式是：用一个 `field` 对象描述**被检查的字段**，然后让多个问题通过键引用它。

看这个发票核验的例子。state 是一段发票文本：

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

然后**同一个 `field` 形状**驱动了四类不同的判断——一个验证数值的 Noul、一个从候选中挑值的 Choice、两个把值放到量纲上的 Score：

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

这个例子的价值在于展示了**结构的复用性**：`field` 里声明名字、类型、单位、描述，然后每个问题只需要说明「要做什么判断」。对于结构化抽取场景，这比给每个问题写一段独立的自然语言提示要稳得多，因为字段的语义只定义了一次。

`customer_name` 那个 Choice 也值得注意：选项是一组**容易混淆的近似字符串**（Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam）。这类「从相似候选中挑出正确的一个」是 Choice 的典型强项，用 Noul 逐个判断会既慢又容易不一致。

## 结构化 Score 档位

Score 的 `criteria` 数组里每一项都可以是对象，用来给档位附加更多信息（例如数值区间、示例）。

## 结构化 Noul criteria

Noul 的 `criteria` 是可选的。当是/否边界比较微妙时，结构化的 `true` 和 `false` 描述让你能在两侧各给出定义和例子，把边界钉死。

## 层级分类：链式 Choice

要在深层分类体系上做归类，**逐层链式调用 Choice**，而不是一次性把整个分类树塞进一个问题的选项里。

做法是：第一层问顶层部门，选项是各部门，值是该部门**子树**的结构。看 `probabilities` 判断分裂是否足够接近——如果接近，就两条分支都探索。

一旦某个部门被选定，下一层就以该部门的子节点为选项、以它们的子树为值，如此重复直到叶子节点。在代码里，这可以是对嵌套字典的一次循环，每个问题的 `criteria` 就是当前节点。

官方有一份 Hierarchical Classification cookbook，展示了类似的树遍历，包括在概率接近时用 beam search 保留多条候选路径的策略。

> **提示**：子树可能变得很大。如果某个分支太大，把值裁剪为它的直接子节点加少量叶子样本。

## 相关

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) / [Noul](/zh/primitives/noul/)
- [扇出模式](/zh/patterns/fan-out/) — 把大量问题打包进一次请求
- [如何构建 System One 系统](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — 官方完整工作流
