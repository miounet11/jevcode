---
title: Agent Skill
description: 把 TypeSafe skill 装进 Claude Code、Codex 等编码代理，让它获得 API 的完整上下文，而不是靠猜。
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
---

## 这个 skill 解决什么问题

TypeSafe 的 agent skill 给你的 AI 编码代理提供 TypeSafe API 的完整上下文：三类[问题类型](/zh/primitives/)、架构[模式](/zh/patterns/)，以及组织评估的最佳实践。

**为什么需要它**：没有 skill 的代理会凭猜测编写请求和响应字段，产生看着合理但实际不存在的 API 调用。这是编码代理集成新 API 时最常见的失败模式。

## 安装

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### 其他代理

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

安装时按提示选择你的代理。**默认安装到项目本地**，加 `-g` 可全局安装。

### 让代理自己装

把这段提示直接粘给你的编码代理：

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

也可以手动安装：把 GitHub 上 `skills/typesafe-ai` 整个目录（**包含它的 reference 文件**）复制到代理的 skills 目录。

> **只选一种安装方式**，避免出现重复副本。

## 更新

Claude Code 插件：

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

然后重启 Claude Code 或运行 `/reload-plugins`。要启用自动更新：打开 `/plugin`，选择 **Marketplaces → typesafe-ai → Enable auto-update**。

skills.sh 安装的用 `npx skills update`。手动复制的则用 GitHub 最新版本整体替换 skill 目录。

## 好用的提示词

在提示里点名 skill（「use the TypeSafe skill」）在任何代理里都有效。用 Claude Code 插件时也可以直接调用 `/typesafe:typesafe-ai`。

**寻找改造机会**：

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**用真实 API key 做实验**：

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**找对标的 cookbook**：

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## 与代理协作的原则

官方给出的四条原则值得照做：

1. **先讨论，再动手。** 用上面的提示词和代理对话，把方向聊清楚。
2. **先审方案再实现。** 确认方案合理之后再让它写代码。
3. **把常量集中在一处。** 问题和阈值应该定义在单个文件里，便于审阅。**代理写问题的能力不强**，要预期与它协作修改，而不是一次到位。
4. **不要接受未经检验的断言。** 鼓励代理验证自己的假设。

## 常见问题

### 代理没有使用 skill

Claude Code 插件下直接调用 `/typesafe:typesafe-ai`；其他代理里明确说「use the TypeSafe skill」。如果仍不加载，确认安装器选对了代理，然后重启。

### 路由行为不符合预期

检查问题和阈值。可能是阈值设得太高（漏报）或太低（误报）。也可能需要把问题写得更具体。

### 到处都在用置信度阈值

如果你只是要**选出最好的选项**，那直接选置信度最高的那个就够了，不需要设阈值。如果你心里有具体的统计算法，那你需要的应该是 `probabilities` 而不是 `confidence`。

### TypeSafe 代码难以审阅

需要人工审阅的核心是**问题定义**和**阈值常量**。把它们集中定义在单个代码文件里，避免审阅时到处翻找。

### 代理编造了请求或响应字段

通常是 skill 过期导致的。按上面的方式更新后重试。

## 相关

- [SDK 总览](/zh/sdk/) — Python 与 JS SDK
- [问题原语](/zh/primitives/) — 代理需要理解的三种问题
- [置信度](/zh/concepts/confidence/) — 阈值该怎么设
