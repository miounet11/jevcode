---
title: 能力地图与生态案例
description: 按场景组织的 Jev 能力地图，附真实生产项目案例。看别人在什么场景下用了哪类原语。
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
---

## 怎么用这张地图

先找到与你业务最接近的场景，看该场景下别人用什么原语、解决什么问题，然后把它套用到你自己的文档和动作上。

下面每个场景给出：**解决什么问题** → **用什么原语** → **真实项目**。

> 想看**按类别整理的完整项目索引**（附 star 数与语言标签），见[社区生态项目](/zh/ecosystem/)。

## 分类与路由

**问题**：请求进来后需要判断它属于哪一类，再分派到不同处理链路。

**原语**：Choice（分类），置信度用于门控。

**真实项目**：

- [Notra](https://github.com/usenotra/notra) — 营销分析：生产环境的 GEO 平台，用 `NOTRA_JEV_CLASSIFIERS` 开关把品牌可见性分类器从 LLM 迁移到 Jev 的布尔决策上，阈值 0.5。
- [jev-router](https://github.com/gargpratyush/jev-router) — 开发工具：让 Jev 在候选模型中选择，从而把 Claude Code 的任务路由到最便宜且能胜任的模型。
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — LLM 基础设施：基于 LiteLLM 的开源路由器，用 Jev 决策选择由哪个模型服务每个请求。
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — 编码代理：为 Pi 编码代理加上按请求自动路由模型的能力，通过 Jev 在 Vercel AI Gateway 上做决策。
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — 编码代理：本地代理，用 Jev 决策为每条消息选择 Claude 模型和推理强度，同时保持主聊天缓存不被污染。

> **观察**：模型路由是这个场景下最密集的应用方向。共同模式是「用一次廉价的 Choice 决策，替代一次昂贵的模型调用或人工判断」。

## 评分与排序

**问题**：需要对一组项目按相关性、质量或多维标准排序。

**原语**：Score，配合[组合评分](/zh/patterns/composite-scoring/)合并多维度。

**真实项目**：

- [jev-bfs](https://github.com/komikat/jev-bfs) — 搜索工具：通过让 Jev 给每个维基百科页面的出站链接排序，找出英文维基两个条目之间的链接路径，而由 Python 控制搜索过程。
- [Jev Search](https://github.com/superagents-lab/jev-search) — 网页搜索：用 Jev 的 Noul 判断给 Search1API 的结果标题和摘要打相关性分数。

## 校验与护栏

**问题**：AI 或代理产生的工作、工具调用、输入输出需要被检查后才能推进。

**原语**：Noul（是/否判断），阈值转布尔。

**真实项目**：

- [jev-review](https://github.com/devagrawal09/jev-review) — 软件工程：分阶段的代码审查工作流和本地看板，Jev 在每个审查阶段把关，通过后变更才能推进。
- [pi-jev](https://github.com/y0usaf/pi-jev) — 代理安全：为 Pi 编码代理加上可度量的工具调用闸门，风险调用在执行前先经 Jev 检查。
- [OpenWork](https://github.com/different-ai/openwork) — 工程工作流：把 Jev 接入其 eval testkit 作为验证裁判，让代理产出的工作由类型化裁决把关，而不是文本模型。
- [jev-guard](https://github.com/leepokai/jev-guard) — 代理安全：面向 Claude Code、Codex、Pi 和 ACP 代理的提示注入与危险动作防护，由 Jev 决定拦截什么。

## 智能体决策

**问题**：代理每一步该做什么，需要一个快速、类型化、可解释的判断层。

**原语**：Choice（选择动作），Score/Noul 辅助。

**真实项目**：

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — 浏览器自动化：browser-use 的超快代理，由 Jev 决定每一步动作和点击哪个元素，只在需要输入文本时才调用语言模型。
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — 编码代理：把 System One 判断暴露为五个 Pi 工具，让模型做窄范围的语义判断，而代码和用户保留对阈值、权重和动作的控制。
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — 编码代理：把封闭的编码代理判断发给 Jev，让裁决保持类型化、廉价、且跨运行可比。
- [limpet](https://github.com/noplan-inc/limpet) — 编码代理：Stop hook，通过用 Jev 判断自然语言的完成条件，防止代理过早收工。
- [robo-harness](https://github.com/grmkris/robo-harness) — 机器人：SO-101 机械臂工作台，由 Jev 决策运行器从类型化候选动作中挑选有界的关节步进，并受预算约束。

## 内容审核与合规

**问题**：判断内容是否违规、是否包含敏感信息、是否符合政策。

**原语**：Noul。

真实项目收录较少（这一方向尚在早期），但典型形态与护栏场景一致：把「是否包含个人身份信息」「是否违反政策」这类问题写成 Noul，按阈值转布尔后进入确定性流程。

## 数据标注与评估

**问题**：给数据集打标签，或者评估模型输出质量。

**原语**：全部三类。

**真实项目**：

- 见「评分与排序」与「校验与护栏」中的评估类项目（如 OpenWork 的 eval testkit 用法）。

## 游戏与仿真

**问题**：在实时环境中，每一帧或每个决策点都需要快速判断。

**原语**：Choice（动作选择）。

**真实项目**：

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — 见上。
- [jev-drone](https://github.com/RomanSlack/jev-drone) — 机器人仿真：MuJoCo 中仅用摄像头的自主无人机，把 Jev 判断模型放进控制回路，频率 2.5 Hz。
- [tsai-sc](https://github.com/phyous/tsai-sc) — 游戏：通过键鼠驱动原版星际争霸共享版，每次决策记录 Jev 的动作概率。

> **观察**：这类场景对延迟最敏感。`jev-drone` 的 2.5 Hz 控制回路说明 Jev 的延迟已经能进入实时控制链路。

## 基础模型研究

**问题**：复现或研究 System One 这类「一次前向传播输出类型化决策」的模型形态。

**真实项目**：

- [decider](https://github.com/Mapika/decider) — 开放模型：用 Qwen3.5-2B 微调复现 System One 形态，一次前向传播输出带校准概率的类型化决策。
- [openjev](https://github.com/zhihz/openjev) — 开放研究：独立的本地预览，从上下文、问题和候选答案出发回答双语的概率问题，受 TypeSafe Jev 启发。
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — 开放研究：RLCD 训练的 Qwen2.5-1B demo，探索用开源并行约束解码作为 Jev 的替代方案。

## 基础设施与 SDK

**问题**：把 Jev 接进现有技术栈。

**真实项目**：

- 见 [awesome-jev 的 Infra / SDKs / Integrations 分类](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md)，收录了各类语言绑定、代理集成和网关适配。

## 官方能力地图的四个方向

TypeSafe 官方把用例归纳为四个大方向，值得在构思场景时对照：

**AI 自动化软件** — 把 AI 与可靠软件交错编排，使其能在后台跑上百万次而无需人类副驾。**代码掌握控制流，TypeSafe 处理语义决策和语言理解。**

**实时应用** — 前沿智能达到实时速度（150ms），意味着 AI 的决策可以快于人类感知，足以被编程进游戏或嵌入 UI。

**大数据上的 AI Map Reduce** — 成本降低 100 倍意味着可以处理巨型数据集：在巨大语料上检索相关信息、分类海量代理轨迹、抽取特征用于预测。

**通用 AI 校验** — 校验任何其他 AI 的输入提示、抽取结果、推理轨迹、工具调用。检测越狱、引用错误、幻觉等错误模式，成本只是实际 LLM 调用的一小部分。

## 相关

- [架构模式](/zh/patterns/) — 这些案例背后的通用模式
- [问题原语](/zh/primitives/) — 选择原语的方法
- [awesome-jev 完整清单](https://github.com/yibie/awesome-jev) — 持续更新的社区项目列表
