# 数据来源与许可

本目录的数据来自 [v-modal/awesome-jev-tools](https://github.com/v-modal/awesome-jev-tools)。

## 使用范围（重要）

该仓库**未声明任何许可证**（GitHub API `license: null`）。因此本站仅把它当作
**发现索引**使用，具体是：

- ✅ 使用：仓库地址（`owner/repo` 形式的链接），以及每个条目的**分类线索**（用于归类）
- ❌ 不使用：该仓库的条目**描述文字**、README 正文、分类页正文

站内生态页中，每个项目的描述文字均来自**自有来源**：

1. **仓库作者自述**——各项目自己的 GitHub `description`（事实性定位，非复制他人汇编）
2. **[logicrw/awesome-jev-projects](https://github.com/logicrw/awesome-jev-projects)**
   （MIT License, Copyright (c) 2026 logicrw）——其人工复核的 4 语言 summary 与
   「Jev 在这里做什么」决策点，见 `../awesome-jev-projects/ATTRIBUTION.md`

清单发布方的名称、许可状态与地址已作为一条生态条目收录在站内（`curated` 分类），
这是对来源的正常署名，不涉及正文复制。

## 目录内容

| 文件 | 说明 |
| :--- | :--- |
| `README.md` | 该清单 README 的快照（用于解析条目与核对收录标准，正文不入站） |
| `entries.json` | 由 README 解析出的条目（仅取 `url` 与 `category` 字段入站） |
| `candidate-meta.json` | 候选仓库的 GitHub 元数据（stars/forks/language/license/topics/description） |
| `readme-verification.json` | 各候选仓库 README 的 Jev 证据评分（用于筛选，不存储正文） |
| `absorb-selected.json` | 最终入选清单，由 `scripts/select-awesome-tools.py` 生成 |

数据快照：2026-09-21，候选中 134 个 GitHub 仓库，入选 100 个。

## 筛选口径

候选仓库必须至少满足其一：

- **tier A**：同时被 logicrw/awesome-jev-projects 人工复核（有 4 语言摘要与 Jev 决策点）
- **tier B**：仓库作者自述中明确提及 Jev / TypeSafe / System One

已归档仓库、站内已收录仓库、作者自述未提及 Jev 的仓库一律不收。
抓取脚本：`scripts/select-awesome-tools.py` + `scripts/absorb-awesome-tools.mjs`。
