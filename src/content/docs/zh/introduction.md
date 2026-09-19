---
translatedFrom: en
title: 认识 Jev
description: Jev 是 TypeSafe 的旗舰模型，也是第一个 System One 模型。它把非结构化状态和类型化问题变成软件可以直接使用的类型化决策。
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
---

## 一句话理解

Jev 不是聊天模型。你给它**状态**（state）和**类型化问题**（typed questions），它返回**类型化决策**（typed decisions）——一个选项、一个分数或一个布尔概率，每个都带**置信度**。

这个定位决定了它和对话式模型的根本差别：

| 维度 | 对话模型 | Jev |
| :--- | :--- | :--- |
| 输出 | 自由文本 | 固定 schema 的结构化结果 |
| 用途 | 生成、对话、推理链 | 分类、路由、打分、校验、护栏 |
| 集成方式 | 解析模型输出 | 直接消费返回值，无需正则解析 |
| 置信度 | 通常没有 | 每个答案都带 |
| 延迟 | 秒级、随输出长度增长 | 低且稳定 |

## 为什么需要「决策层」

把 LLM 接进业务系统时，最常见的痛点是：模型输出一段自然语言，你得写解析器、处理边界情况、猜它对不对。Jev 把这一层抽象掉了——问题本身声明了输出类型，模型必须按 schema 回答。

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

返回值就是 `billing` / `technical` / `sales` 之一，外加一个置信度。没有解析，没有兜底格式。

## 三种问题原语

所有决策都归结为三类问题。这是 Jev 的核心抽象，理解它们就理解了整个系统：

- **[Choice](/zh/primitives/choice/)** — 从一组互斥候选中选一个。用于意图识别、工单路由、动作选择。
- **[Score](/zh/primitives/score/)** — 按量纲或评分标准打分。用于相关性排序、质量评估、风险分级。
- **[Noul](/zh/primitives/noul/)** — 回答一个是/否问题，返回答案为「是」的概率。用于内容校验、断言核查、护栏。

一次请求里可以混合这三类问题。模型只读取一次状态，然后并行评估所有问题。

## System One 的定位

System One 是一类专门为「做出软件可直接使用的快速结构化决策」而构建的模型。Jev 是这一类的第一个模型。它和 System Two 式的推理模型不是替代关系，而是分工：

- **System One**：高频、低延迟、结构化的判断。它们是业务流水线里的if/else升级版。
- **System Two**：需要多步推理、长链思考的复杂任务。

实践中常见做法是在流水线里大量使用 System One 做快速分流，只在真正需要深度推理时才升级到更强模型，从而把成本和延迟压下来。

## 下一步

- [5 分钟上手](/zh/quickstart/) — 拿到 API key 并跑通第一次调用
- [核心概念](/zh/concepts/system-one/) — 理解 System One 与状态模型
- [架构模式](/zh/patterns/) — 看生产环境怎么组织这些调用
