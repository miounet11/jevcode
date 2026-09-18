# JevCode 内容撰写规范

所有文档必须遵守本规范，以保证站点风格统一、事实准确。

## 事实来源（唯一允许的来源）

- `.research/_extracted.json` — TypeSafe 官方文档全文（已抓取，key 为文件名，如 `primitives_choice`、`patterns_fan-out`）
- `.research/categories/*.md` — awesome-jev 生态案例分类清单
- `.research/awesome-jev-yibie.md` — 生态总清单

**严禁编造。** 不要发明 API 参数、字段名、模型名、价格、限制、SDK 方法。任何不在上述来源中的事实性内容都不得写入。如果不确定，就省略。

已知事实锚点（可直接引用，勿改动）：

- API 端点：`POST https://api.typesafe.ai/v1/systemone`
- 认证：`Authorization: Bearer <API_KEY>`
- 模型 ID：`jev-1.13.0`，别名 `jev-latest`（SDK 默认）
- 上下文：64k tokens/请求；`state` + 最长单个问题 32k
- 输入：仅文本。字符串、JSON 对象、文本数组。不支持图像/音频/视频
- 费率：$42 / Btok（输入计费，输出免费）
- 限流：250,000 tokens/秒；1,200 请求/分钟。超限返回 `429`，响应带 `retry-after`
- Python SDK：包名 `typesafe-sdk`，导入 `from typesafe_sdk import ...`，含 `TypeSafeClient` / `AsyncTypeSafeClient`
- JS SDK：包名 `@typesafe-ai/sdk`，需 Node.js 20+，导入 `import { choice, TypeSafeClient } from "@typesafe-ai/sdk"`
- 三类问题：`choice`、`score`、`noul`
- 答案字段：Choice → `choice` / `probabilities` / `confidence`；Score → `score` / `legend` / `probabilities` / `confidence`；Noul → `noul`（无 `confidence`）
- Python SDK 响应访问：`response.nouls["x"].noul`、`response.choices["x"].choice`、`response.scores["x"].score`
- JS SDK 响应访问：`response.answers.category.choice`

## 文件位置与命名

- 中文：`src/content/docs/zh/<slug>.md`
- 英文：`src/content/docs/en/<slug>.md`
- 每种语言的 slug 必须**完全对应**（英文版是中文版的翻译，不是重写）

## Frontmatter（必须完整）

```yaml
---
title: 页面标题
description: 一句话摘要，60-120 字，用于 meta description 和列表页
section: start | concepts | primitives | patterns | sdk | cases
order: 数字，同 section 内升序
tags: ['tag1', 'tag2']
source: docs.typesafe.ai/primitives/choice
---
```

`source` 填对应的官方文档路径；如果是社区聚合内容，填 `awesome-jev`。

## 写作风格

- 中文版：简体中文，术语保留英文原词（如 Choice、Score、Noul、state、confidence、probabilities），首次出现时给出中文解释。
- 英文版：与中文版结构完全一致，不是逐字直译，但信息量必须对等。
- 用「你」称呼读者，用「模型」称呼 Jev，不用「它很棒」这类营销腔。
- 每个页面 800-2500 字（中文按字符计），结构：先讲清概念，再给可运行示例，最后给实践建议。
- 代码块必须标语言：```json / ```python / ```ts / ```bash / ```http
- 表格用于对比，不要滥用。

## 内部链接

- 中文页面内的站内链接统一写 `/zh/<slug>/`，英文写 `/en/<slug>/`
- 只链接到本规范「页面清单」中存在的 slug，不要链接不存在的页面

## 页面清单（本批要写的）

### concepts
- `concepts/system-one` — System One 是什么、与 System Two 的分工
- `concepts/state` — state 的形态与预处理（文本/JSON/数组、非文本要转换）
- `concepts/confidence` — confidence 与 probabilities、阈值随风险缩放、Noul 无 confidence

### primitives
- `primitives/choice` — Choice 的 criteria 写法、返回值、典型用法
- `primitives/score` — Score 的 criteria 数组、legend、分数可落在两档之间
- `primitives/noul` — Noul 的措辞技巧、criteria 的 true/false 描述
- `primitives/advanced` — 措辞、criteria 边界、推测性提问等进阶技巧

### patterns
- `patterns/index` — 模式总览（引用下面四个）
- `patterns/intent-routing` — 意图路由
- `patterns/confidence-routing` — 置信度路由
- `patterns/composite-scoring` — 组合评分
- `patterns/fan-out` — 扇出并行

### sdk
- `sdk/index` — SDK 总览与选择
- `sdk/python` — Python SDK
- `sdk/javascript` — JS/TS SDK
- `sdk/agent-skill` — 给 AI 编码代理用的 skill

### cases
- `cases/use-case-map` — 按行业/场景组织的能力地图（基于官方 use-case-map 文档）
