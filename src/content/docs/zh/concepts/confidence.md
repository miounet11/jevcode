---
translatedFrom: en
title: 置信度
description: confidence 是从概率分布推导出的统计量。理解它与 probabilities 的关系，以及如何让阈值随风险缩放。
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
---

## 两个字段的关系

所有 Choice 和 Score 答案都带一个 `probabilities` 属性，表示在各个选项（Choice）或各个档位（Score）上的**概率分布**。

这个分布的**形状**告诉你模型有多确定：集中在某个结果上意味着答案确定，摊得很开意味着不确定。

`confidence` 属性把这个形状压缩成 0 到 1 之间的一个数，让你不用自己做数学就能直接设阈值。

> **注意**：Noul 答案**不带** `confidence`，它本身就是 0 到 1 的概率值。

## 分布形状的含义

- **Choice 置信度低**，通常意味着没有任何一个选项明显胜过其他选项。
- **Score 置信度低**，通常意味着档位定义有歧义、是多维的，或者 state 里的信息不足以判断。

## 「我不知道」是有用的信号

如果一个智能系统——无论是人还是机器——无法诚实表达不确定性，这个系统就无法被信任。

置信度给了模型一个内置机制来说「这个我不确定」。这让你的代码可以针对不同的确定性程度实现不同行为，这是构建真正可靠的系统的基础。

## 三条分支

一个实用的起点是把置信度分成三段，每段对应不同的系统行为：

- **高置信度**：自动执行。模型判断明确，无需人工介入。
- **中置信度**：谨慎推进。模型给出了合理答案但不确定。视上下文，可以让用户确认、标记待审、或先收集更多信息。
- **低置信度**：不要执行。转人工、请求澄清，或回退到其他系统。模型在告诉你它信息不足，或者这个问题不适合它。

**边界画在哪里，取决于风险有多大。**

## 阈值随风险缩放

这是最关键的一条实践原则：**置信度阈值不是一个数字。**

同一个系统里，不同动作应该按「做错的后果」设定不同的门槛。

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # 模型确实不确定。不要猜。
    route_to_human(user_message)

elif action.choice == "check_balance":
    # 低风险。显示错屏幕是可以恢复的。
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # 高风险 + 高置信度。带确认地执行。
        confirm_then_execute(account_id)
    else:
        # 高风险 + 中等置信度。先验证。
        ask_user_to_confirm(account_id)
```

这段代码里有三个不同的门槛，各自对应不同的风险等级：

| 动作 | 风险 | 门槛 |
| :--- | :--- | :--- |
| 低于 0.5 一律拦截 | — | 硬下限，捕捉模型自认不确定的情况 |
| `check_balance` | 低，只读且可恢复 | 0.5 以上即可自动执行 |
| `approve_transfer` | 高，涉及资金 | 需要 > 0.9，且仍需用户确认 |

`0.5` 这个下限拦截了模型自报的「确实不确定」。在它之上，执行一个破坏性操作所需的门槛远高于只读操作。**你的代码编码了你的风险容忍度。**

> **注意**：正确的阈值取值取决于你的领域和模型在你的用例上的实际表现。从保守阈值开始，用你自己的数据测试，然后根据观察结果调整。

## 可以自己定义度量

官方提供的 `confidence` 是一个适配大多数用例的便利度量，但你并没有被它的定义锁死。取决于你在评估什么，别的度量可能更适合你——这正是 `probabilities` 也一并返回的原因：你有完整分布，可以自己算。

例如，两个候选选项之间的概率差（margin）在某些场景下比集中的程度更能反映「是否该自动执行」。或者你可以只看 top-1 概率，忽略其余。选择权在你。

## 相关

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) — 带 confidence 的两种原语
- [Noul](/zh/primitives/noul/) — 不带 confidence，本身就是概率
- [置信度路由模式](/zh/patterns/confidence-routing/) — 把置信度用作流水线路由信号
