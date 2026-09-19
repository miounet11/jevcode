---
translatedFrom: en
title: 置信度路由
description: 把置信度当作第二个决策轴。答案告诉你「是什么」，置信度告诉你「是否该执行」。
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
---

## 这个模式解决什么问题

答案和置信度是**两个独立的信息维度**。只根据答案做分支，等于丢掉了模型告诉你的一半信息。

置信度路由的做法是：先拿答案，再用置信度决定这个答案是否足够可靠到可以执行。这是构建既可靠又安全的系统的基础。

## 例子：语音银行指令

设想你在构建一个语音银行界面，让用户用语音操作账户。你当然希望意图识别置信度越高越好，但**不同动作的风险不同，因此需要不同的置信度门槛**。

### 第一步：确定用户意图

一次 Choice 调用得到意图，候选包括 `check_balance`、`approve_transfer` 等。

### 第二步：按置信度路由

```python
action = response.answers["intent"]

# 任何动作，置信度低于 0.6 都转人工
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # 低风险。0.6 的置信度就够了。
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # 高风险，但置信度也高。执行。
        ...
    else:
        # 高风险，置信度中等。先确认。
        ask_user_to_confirm(account_id)
```

## 为什么门槛必须分档

看这段代码里的三个门槛：

| 门槛 | 作用 |
| :--- | :--- |
| `< 0.6` 一律拦截 | 模型自报不确定时，**任何**动作都不执行 |
| `check_balance` 门槛 0.6 | 只读操作，做错了可以恢复 |
| `approve_transfer` 门槛 0.85 | 涉及资金，做错了不可逆 |

这就是「阈值随风险缩放」的工程化表达。**如果整个系统只用一个统一阈值，你要么在低风险动作上过度打扰用户，要么在高风险动作上不够谨慎。**

## 设计要点

**先设硬下限，再设动作门槛。** 硬下限（例中的 0.6）拦截模型自报的「确实不确定」，这是安全网。动作门槛在此之上按风险分级。

**让门槛成为显式配置，而不是散落的魔法数字。** 把每个动作的阈值集中定义在一处，便于审计和调整。当业务方问「为什么这笔转账要人工确认」时，你能指向一个具体的数字。

**不要用置信度替代业务校验。** 置信度是模型的自我评估，不是业务规则的替代品。金额上限、权限检查这类确定性规则仍然要写在代码里。

**用真实数据校准阈值。** 官方明确提醒：正确的阈值取决于你的领域和模型在你的用例上的表现。从保守阈值开始，用你自己的数据测试，根据观察结果调整。

## 什么时候不该用

如果某个决策**做错了也没有后果**（例如给日志打标签），加置信度门槛只会增加复杂度和人工成本。置信度路由的价值与决策的不可逆程度成正比。

## 相关

- [置信度](/zh/concepts/confidence/) — confidence 与 probabilities 的关系
- [意图路由](/zh/patterns/intent-routing/) — 通常与置信度路由配合使用
- [组合评分](/zh/patterns/composite-scoring/) — 排序场景下的置信度处理
