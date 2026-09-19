---
translatedFrom: en
title: System One 模型
description: System One 是一类为「快速、结构化决策」而构建的模型。Jev 是第一个，它的输出可以被软件直接消费。
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
---

## 定义

System One 模型是一类专门构建来**做出软件可以直接使用的快速结构化决策**的 AI 模型。Jev 是 TypeSafe 的旗舰模型，也是第一个 System One 模型。

它们要解决的核心问题是：传统语言模型输出自由文本，而软件需要的是确定类型的值。System One 把这个转换过程内化到模型里——问题声明输出类型，模型按约束返回。

## 与 System Two 的分工

这个命名借用了认知科学里的双系统理论，含义很直接：

| | System One | System Two |
| :--- | :--- | :--- |
| 特征 | 快速、直觉、专注 | 缓慢、审慎、多步 |
| 典型任务 | 判断、分类、打分、校验 | 复杂推理、长链规划 |
| 延迟 | 低且可预测 | 较高，随思考长度增长 |
| 输出 | 类型化、受约束 | 自由文本 |
| 成本 | 低 | 高 |

它们不是替代关系。生产系统里的典型做法是让 System One 承担绝大多数高频判断，只在真正需要深度推理时才升级到 System Two 或转人工。

## 一个完整例子：退款请求

官方文档给出的流程很好地说明了这两层怎么配合：

1. **构造 state** — 把客服消息、相关交易记录、退款政策打包成一个 state。
2. **并行提问** — 同时问三个独立问题：用户是否要求退款、证据是否显示存在重复扣款、政策是否支持退款。
3. **在代码里组合** — 把三个答案与确定性的业务检查结合起来，然后路由到执行或人工复核。

注意第 2 步里问题的**独立性**：三个问题互不干扰，可以一次发出。这是能够把它们打包进单个请求的前提。

## 为什么类型化输出如此关键

因为 System One 模型返回的是**类型化、受约束的输出而非自由文本**，你的代码可以直接检查和组合这些答案，构成可预测的工作流。

对比一下两种集成方式的代码复杂度：

```python
# 传统方式：需要解析、校验、处理格式异常
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # 脆弱，边界情况多

# System One：值本身就是类型化的
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

后者的返回值是定义域内的确定类型——Choice 只会是你给的选项之一，Score 只会落在你给的档位区间，Noul 永远是 0 到 1 的浮点数。

## 置信度：让模型能说「我不确定」

System One 模型的答案还带 [confidence](/zh/concepts/confidence/)，因此你可以决定何时直接执行、何时升级到人工或推理模型。这是构建可信系统的基础——**如果一个系统无法诚实表达不确定性，它就无法被信任**。

## 如何调用

通过客户端 [SDK](/zh/sdk/) 或 HTTP API 调用：

```http
POST https://api.typesafe.ai/v1/systemone
```

请求中的 `model` 字段选择具体模型。默认别名是 `jev-latest`。

## 延伸阅读

- [State](/zh/concepts/state/) — 如何组织传给模型的上下文
- [问题原语](/zh/primitives/) — 三类类型化问题
- [架构模式](/zh/patterns/) — 生产环境怎么组织这些调用
- [如何构建 System One 系统](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — 官方完整工作流指南
