# JevCode

**Jev 技术解决方案与最佳实践** — [www.jevcode.ai](https://www.jevcode.ai)

[![Astro](https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![i18n](https://img.shields.io/badge/i18n-8%20languages-2dd4bf)](#多语言)

![JevCode 首页主图](./public/img/hero/pareto.webp)

Jev 是 TypeSafe 的 System One 决策模型：你给它**状态 + 类型化问题**，它返回**可直接进代码的决策**（带置信度），不是聊天文案。

| 原语 | 做什么 | 典型用途 |
| :--- | :--- | :--- |
| **Choice** | 从互斥选项里选一个 | 意图路由、工单分派、动作选择 |
| **Score** | 按量纲打分 | 相关性排序、质量评估、风险分级 |
| **Noul** | 是/否概率 | 校验、断言核查、Agent 护栏 |

> 本站是 **实践与文档聚合**（8 语言），官方模型与 API 仍以 [TypeSafe](https://typesafe.ai/) / [docs.typesafe.ai](https://docs.typesafe.ai/) 为准。

## 快速入口

- 中文站：https://www.jevcode.ai/zh/
- English：https://www.jevcode.ai/en/
- 认识 Jev：https://www.jevcode.ai/zh/introduction/
- 5 分钟上手：https://www.jevcode.ai/zh/quickstart/
- 问题原语：https://www.jevcode.ai/zh/primitives/
- 架构模式：https://www.jevcode.ai/zh/patterns/
- 社区生态：https://www.jevcode.ai/zh/ecosystem/

## 配图一览

文档站配有原创示意图（全部同时提供 WebP 与 PNG 回退）：

| 图 | 用途 |
| :--- | :--- |
| `public/img/hero/pareto.webp` | 首页主图：成本 / 质量权衡 |
| `public/img/docs/architecture.webp` | 架构总览 |
| `public/img/docs/primitives.webp` | 三种问题原语 |
| `public/img/docs/intent-routing.webp` | 意图路由 |
| `public/img/docs/confidence.webp` | 置信度分流 |
| `public/img/docs/composite-scoring.webp` | 组合评分 |
| `public/img/docs/fan-out.webp` | 扇出并行 |
| `public/img/docs/state.webp` | 状态分层 |
| `public/img/docs/sdk.webp` | SDK 语言绑定 |
| `public/img/og.png` | 社交预览图（1200×630） |

## 多语言

站点提供 8 种语言的界面与文档；某篇文档在目标语言缺失时，会自动回退到默认语言并在页面顶部提示。

| 语言 | 入口 | 语言 | 入口 |
| :--- | :--- | :--- | :--- |
| 简体中文 | [`/zh/`](https://www.jevcode.ai/zh/) | English | [`/en/`](https://www.jevcode.ai/en/) |
| 日本語 | [`/ja/`](https://www.jevcode.ai/ja/) | 한국어 | [`/ko/`](https://www.jevcode.ai/ko/) |
| Deutsch | [`/de/`](https://www.jevcode.ai/de/) | Français | [`/fr/`](https://www.jevcode.ai/fr/) |
| Español | [`/es/`](https://www.jevcode.ai/es/) | Português | [`/pt/`](https://www.jevcode.ai/pt/) |

> 中文与英文为人工撰写；其余语言由本地模型翻译，frontmatter 带 `translatedFrom: zh` 标记，
> 仅经结构与构建校验，**未经人工逐篇校对**。欢迎通过 PR 修正术语与措辞；
> 存在歧义时以中文 / 英文原文及官方文档为准。

## 内容结构

```
src/content/docs/<lang>/
├── introduction.md          # 认识 Jev
├── quickstart.md            # 5 分钟上手
├── concepts/                # 状态、置信度、System One
├── primitives/              # choice / score / noul
├── patterns/                # 意图路由、置信度路由、组合评分、扇出
├── sdk/                     # Python / JavaScript / Agent Skill
└── cases/                   # 生态与案例地图
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产出到 dist/
```

Node 20+ 推荐。部署脚本见 [`deploy/`](./deploy/)。

## 仓库结构

```
src/content/docs/{zh,en,ja,ko,de,fr,es,pt}/  # 文档正文
src/i18n/ui.ts        # 界面文案与语言表
src/data/site.ts      # 侧边栏分组、首页卡片
src/data/images.ts    # 配图清单与页面映射
src/pages/            # Astro 路由（含 language fallback）
deploy/               # nginx / 发布 / 回滚
```

## 和官方的关系

- 官方产品：TypeSafe / Jev API
- 本仓库：中文优先的解决方案站 + 模式 / 案例整理，方便工程落地
- 不替代官方 docs；有冲突以官方为准

## License

文档与站点代码以本仓库为准；TypeSafe / Jev 商标与模型归原厂所有。
