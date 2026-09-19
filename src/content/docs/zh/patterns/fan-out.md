---
translatedFrom: en
title: 扇出并行
description: 在一次调用里发送大量问题（包括推测性的），再由代码决定哪些是相关的。
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
---

## 这个模式解决什么问题

传统做法是「先分类，再根据分类结果决定下一步问什么」。这需要串行调用：第一次调用返回结果，你才知道第二次该问什么，延迟叠加。

扇出并行反过来：**把可能需要的所有问题一次性发出去**，由你的代码根据分类结果决定忽略哪些。因为模型只读一次 state 然后并行评估所有问题，多问几个问题的边际成本极低。

## 关键机制

这三条事实是扇出模式成立的基础：

1. 模型**只读一次 state**，然后并行评估所有问题。
2. **每个答案相互独立** —— 一个问题的答案不会成为另一个问题的隐藏上下文。
3. 上下文预算是 64k tokens（state + 所有问题），或 32k tokens（state + 最长单个问题）。

第 2 条尤其重要：它保证了把不相关的问题一起发出去不会污染相关问题的答案。

## 例子：工单分流

你要处理客服工单，但不同类型的工单需要完全不同的判断。与其先分类再追问，不如一次问全。

### 第一步：一次请求问出全部判断

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
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

这里 `bug_severity` 和 `has_reproducible_steps` 只在工单是 bug 报告时才有意义；`refund_requested` 只在账单类问题下才有意义。**它们是推测性问题**——但由于多问不产生速度成本，全部前置即可。

### 第二步：用代码路由

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# 无论什么分类，frustration 都有用
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**完整决策树所需的全部信息都来自一次调用。** 推测性问题在无关时被忽略，在相关时省掉了一次往返。

## 设计要点

**先问全，再筛选。** 把「哪些问题值得问」的判断从调用前推迟到调用后。调用前你不知道分类结果，因此无法判断；调用后你有了答案，筛选就是一次普通的分支。

**注意上下文预算。** 64k 是 state 加**所有**问题。如果你要扇出上百个问题（例如给一批文档逐个打分），state 会迅速撑大。这时应该拆成多次请求，或者考虑 [Score 的批量用法](https://docs.typesafe.ai/patterns)。

**区分「推测性」与「冗余」。** 推测性问题是那些**在其他分支下也有明确语义**的问题。如果一个问题的答案在任何分支下你都不会读，那它不叫推测性，叫浪费——虽然成本低，但会让代码变乱。

**配合置信度使用。** 扇出解决了「问什么」，置信度路由解决了「信不信」。两者组合是生产系统的常见形态：参见[置信度路由](/zh/patterns/confidence-routing/)中的语音银行例子。

## 相关

- [问题原语](/zh/primitives/) — 独立性与推测性提问
- [State](/zh/concepts/state/) — 上下文预算与 state 组织
- [置信度路由](/zh/patterns/confidence-routing/) — 第二个决策轴
