# 每日内容节奏

2026-10-14 记下。要求是：用合理的方式，每天获取合适的内容并发布。

源站 `23.95.243.52` 只收静态文件。生成和判定留在这台 Mac。密钥留在本机 `.env`，不搬到服务器。

## 每天已经在发的

本机 crontab `30 9 * * *` 跑 `scripts/pipeline-cron.sh`。

1. 抓生态星标、X 社区脉搏、实验室记录。卡片有新增才进入发布。
2. 合适才发出去。星标相对增量未到 +10% 时，只发社区、实验室和新卡片。门 1 认为生态批次不值得发，批次留在 `.research/pipeline-state/pending.json`，侧路内容仍发。门 2 不合格则不部署。
3. `src/`、`public/` 以及其它未忽略的未提交文件会让整轮跳过。`.data/`、未跟踪的 `docs/coverage-full/`、以及 `.cursor/` 不挡。
4. 发出去的路径：白名单提交 → `git push origin main` → `./deploy/deploy.sh` → `scripts/indexnow-submit.mjs`。IndexNow 只通知 Bing、Yandex、Seznam。

## 每天至少 50 篇

`scripts/daily-briefs.mjs` 在日更抓取之后运行。它从 `data/coverage-cases.json` 取还没发过的 50 条，追加到 `src/data/daily-briefs.json`，页面在 `/<lang>/briefs/<id>/`。

一篇只用语料里已有的字段：行业、维度、场景、状态原句、问题、选项、语料接受的选项。有 `CLAVUE_API_KEYS` 时逐条调用 clavue-jev，只记下返回且落在选项里的结果。调用失败就留空，不编造选项。

en 和 zh 进 sitemap。另外六种语言照样生成，但 noindex，避免薄页占爬取预算。

语料约 7680 条。每天 50 篇大约够 153 天。没有剩余合格条目时，脚本记 `added: 0`，当天不重复发布旧篇。

关键词长文不进这 50 篇，也不由雷达自动写。

## 关键词长文怎么算合适

[new-term-radar](https://github.com/miounet11/new-term-radar) 只做选词入口，不接进 `scripts/pipeline.mjs`。

合格的一篇长文要同时满足：

- 是会长期被搜的通用词，能写成 `choice`、`confidence` 或 `noul`。
- 请求是 `POST https://api.jevcode.ai/v1/judge`。`state` 为 8 到 4000 个字符，问题最多 6 道。`choice` 用 `options` 或 `criteria`。
- 响应只写本站 API 已有的字段：`choice` 返回 `{ "choice" }`，`confidence` 返回 `{ "noul" }`。示例数字标明是字段形状，不是测出来的准确率，阈值由调用方自己定。
- 不编造跑分，不写机构背书。公开项目只作索引。
- 八种语言一起发。en 与 zh 人工写。ja、ko、de、fr、es、pt 标 `translatedFrom: en`。
- 模板是 `src/content/docs/en/cases/llm-router.md`。这篇已随 `fe75d6b` 发布，源站版本 `20261014-130836`。

雷达配置若要跑：`known_terms` 先写入已经有页的词（structured output、content moderation、kev、llm router、choice、noul、confidence）。`topics` 限在判定相关：moderation、triage、routing、classification、guardrail、structured output、eval。专名只有能写成可核对的对照时才单开一页。
