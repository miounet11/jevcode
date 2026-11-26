# 发布记录

按时间倒序记录修复类与运维类发布，供发布核验与事后追踪。日常内容刷新（`chore(eco)`）不在此列。

## 2026-11-26 — 第六阶段：全球 8 语交互式 AI 架构与配置工作台、GPU 双卡对比器与六大旗舰频道生态闭环（多路 `clavue` CLI 并行开发）

### 改动

- **原创视觉资产（Clavue Image v3.1）**：生成并逐张目视验收 3 张 16:9 无字 WebP 封面图（`public/img/guides/workbench-{hero,export,readiness}.webp`，单张 50–88 KB；其中 `workbench-readiness.webp` 经目视复检重绘消除伪字瑕疵）。
- **全球 8 语交互式工程工作台（`/[lang]/workbench/`）**：新增纯 ESM 浏览器与 Node 同源测算/生成引擎 `src/lib/workbench/generator.mjs`（580 行）、8 语词表 `src/i18n/pages/workbench.ts` 与页面模板 `src/pages/[lang]/workbench/index.astro`，支持 20 场景 × 16 GPU × 6 语言技术栈 × 5 AI Vibe Coding IDE/CLI × 流量规模/安全姿态/2025–2027+ 演进周期实时计算量化可完成度、自动化/升级占比与 `$0.042/1M` 成本节省，并一键切换复制、单文件下载或导出 `bootstrap-jev-stack.sh` 完整四件套启动包（`jevcode.config.yaml`、`AGENTS.md`/`.cursorrules`、可运行程序源码、`verify-jev.mjs`）及 URL 分享深链。
- **GPU 双卡实时对比与六频道深度闭环**：在 `/[lang]/gpus/` 新增任意双卡参数对比面板与工作台深链；升级 `/[lang]/configs/` 与 `/[lang]/vibecoding/` 增加排序、标准 ARIA `role="progressbar"`、持久化步骤勾选清单与工作台深链；修复 4 处德/日/法小语种细节词并加固全部详情页剪贴板异常兜底；首页矩阵升级为均衡 6 卡 3×2 网格，同步接入导航、页脚、`/map/`、`llms.txt`（743 行）、`sitemap-lastmod.mjs`、Nginx 裸路径 302（`workbench`）及 `scripts/test-workbench.mjs`（15 项单测）。

### 验证

- `npm run check`（100 文件 0 错 0 警 0 提示）、`i18n-gaps: 0`、`npm run build`（20,194 页）、`npm test`（355/355）、`npm run test:e2e`（64/64）、`node scripts/preflight.mjs --json` 全绿；全站 20,194 页 HTML 审计 `nestedMain: 0`、`badDD: 0`、`badTypo: 0`、`rawTsLeak: 0`，`vibeProgress: 136/136`、`wbProgress: 8/8`、`gpuCmp: 8/8`。

## 2026-11-26 — 第五阶段：全球 8 语言场景配置与可完成度矩阵、程序开发配置方案与 AI Vibe Coding 全流程教程（`clavue` CLI 开发）

### 改动

- **原创视觉资产（Clavue Image v3.1）**：通过内网 `clavue-img` 新增 6 张 16:9 无字 WebP 封面图（`public/img/guides/configs-{hero,readiness,future}.webp`、`vibecoding-{hero,agents,deploy}.webp`，单张 21–82 KB）并逐张目视验收。
- **场景配置与量化可完成度矩阵（`/[lang]/configs/` + `[slug]`）**：新增 `src/data/configs.ts`、`src/i18n/pages/configs.ts` 与页面模板，涵盖 20 个生产与未来场景配置（边缘防注入防火墙、双系统 LLM 级联路由、8 语 SaaS 工单分诊、CI/CD 发布门禁、RAG 精排防幻觉、自主 Agent 工具沙箱、多租户原子账本限频、支付反欺诈流、GDPR/EU AI Act 合规代理、电商审核、SOC 告警压缩、医疗保守阈值、法务并行初筛、本地 GPU+云弹性溢出、零信任 MCP、高吞吐批处理、游戏/语音亚百毫秒过滤、8 语内容管线，以及 **2026–2027+ 多模态路由与全自主多 Agent 集群治理未来配置**），逐一给出量化可完成度进度条（`completionPct`、`autoHandledPct` / `escalationPct` 拆分）及一键复制当前与未来配置。
- **程序开发配置方案与 AI Vibe Coding 全流程实战教程（`/[lang]/vibecoding/` + `[slug]`）**：新增 `src/data/vibecoding.ts`、`src/i18n/pages/vibecoding.ts` 与页面模板，覆盖 16 套从入门到进阶/未来路线的实操教程（Vibe Coding 契约基础、`AGENTS.md`/`CLAUDE.md`/`.cursorrules`、契约先行规划、Clavue CLI `--write-scope` 多路并行、MCP 工具链、Jev 自动验收门禁、全栈 SaaS 开发配置、8 语 SEO+GEO、双系统网关、防幻觉 RAG、安全 Agent 护栏、Vibe Testing、非 root Systemd 原子部署、Clavue 视觉管线、日志驱动迭代与 **2026–2027+ 通宵蜂群演进路线**），每篇含可完成度指标、3 步实操、可复制 Vibe Prompt、项目配置文件与完整可运行源码。
- **8 语原生本地化与全站集成**：36 个核心条目全部经 `clavue-5.5-fast` 原生本地化至 `en / zh / ja / ko / de / fr / es / pt`（共新增 **304 个**可索引页面，全站突破 **20,185 页**），接入顶部导航、页脚、首页 5 卡视觉矩阵、`/map/`、Nginx 裸路径 302（`configs|vibecoding`）、`sitemap-lastmod.mjs`、`llms.txt` 与 `scripts/test-phase5-matrix.mjs` 回归测试。

### 验证

- `npm run check`（98 文件 0 错 0 警 0 提示）、`npm test`、`npm run test:e2e`、`npm run build`、`node scripts/preflight.mjs --json` 全绿；全站 20,185 页 HTML 零嵌套 `<main>`、零双美元符，线上 8 语抽检全 200。

## 2026-11-25 — 第四阶段：全球 8 语言 GPU 显卡配置与未来路线图、全行业实战案例与全语言源码蓝图矩阵

### 改动

- **原创视觉资产（Clavue Image v3.1）**：通过内网 `clavue-img` 生成 8 张 16:9 轻量化无字 WebP 视觉配图（`public/img/guides/*.webp`，单张 20–126 KB），覆盖显卡集群、未来 HBM4 晶圆、全球行业网络、棱镜分流、模块化源码、双系统级联、边缘节点与 RAG 精排。
- **显卡配置、大模型部署、性能基准与未来硬件路线图（`/[lang]/gpus/` + `[slug]`）**：新增 `src/data/gpus.ts`、`src/i18n/pages/gpus.ts` 与页面模板，覆盖 16 款消费级/工作站/数据中心及未来 2026–2027+ 路线图硬件（RTX 4060 Ti 16G / 4090 / 5090 / RTX PRO 6000 96G / Apple M4 Max 128G & M3 Ultra 512G / L4 / L40S / A100 / H100 / H200 / B200 / GB200 NVL72 / AMD MI300X & MI325X / B300 Ultra 288GB & Rubin HBM4 路线图），提供可筛选排序对比矩阵、LLM + Jev 性能基准表与一键复制生产配置（`vLLM` / `SGLang` / `TensorRT-LLM` / `MLX` / `Docker Compose` / `K8s`）。
- **全球 18 行业实战案例库（`/[lang]/industries/` + `[slug]`）**：新增 `src/data/industries.ts`、`src/i18n/pages/industries.ts` 与页面模板，覆盖全球支付反欺诈、医疗分诊、法务合同审查、跨境电商风控、B2B SaaS 多语客服、DevOps/SRE、网络安全 SOC、智能制造、全球物流清关、游戏风控、数字媒体品牌安全、在线教育、保险理赔、电信 5G 运维、汽车车联网、房产科技、新能源电网与航旅应急，提供合规/延迟/省本 KPI、Jev JSON 契约、可运行业务代码与 GPU/源码互链。
- **全语言源码库与端到端开发项目蓝图（`/[lang]/recipes/` + `[slug]`）**：新增 `src/data/recipes.ts`、`src/i18n/pages/recipes.ts` 与页面模板，包含 10 套主流语言/运行时生产客户端（TypeScript/Node.js、Python/FastAPI、Go、Rust、Java/Spring Boot、C#/.NET 9、PHP/Laravel、Ruby/Rails、Cloudflare Workers、Shell/GitHub Actions）与 6 套完整端到端项目蓝图（双系统 LLM 级联路由器、LangGraph 工具护栏、MCP Server、RAG 精排防幻觉门控、多语工单分诊微服务、自建 GPU vLLM+Jev 混合栈），提供完整源码与配套配置文件一键复制。
- **8 语原生本地化与全站集成**：全量 50 个核心条目通过 `clavue-5.5-fast` 原生翻译至 `en`/`zh`/`ja`/`ko`/`de`/`fr`/`es`/`pt` 全部 8 语言（共新增 **424 个**高质量可索引页面），同步接入顶部导航 `Header.astro`、页脚 `Footer.astro`、首页 3 卡视觉展示区 `index.astro`、`map.astro`、Nginx 裸路径 302、`sitemap-lastmod.mjs`、`generate-llms-txt.mjs` 及 `scripts/test-guides-matrix.mjs` 回归门禁。

### 验证

- `npm run check`（90 文件 0 错 0 警 0 提示）、`npm test`、`npm run test:e2e`、`npm run build`、`node scripts/preflight.mjs --json` 全绿；全站近 2 万页 HTML 零双美元符、零嵌套 `<main>`、Sitemap 分片与重型页瘦身全部达标。

## 2026-11-25 — 第三阶段：基于线上日志的 Sitemap 分片、重型页瘦身、API 自发现、转化补齐与流量日报

### 改动

- **Sitemap 分片与 IndexNow 多文件读取**：`astro.config.mjs` 为 `@astrojs/sitemap` 增加 `entryLimit: 3000`，将此前单文件 **19.0 MB（线上耗时 1.14s）** 的 `sitemap-0.xml` 拆分为多份轻量分片；`scripts/indexnow-submit.mjs` 升级 `readSitemapEntries()` 自动合并全部 `dist/sitemap-*.xml`（排除 `sitemap-index.xml`）；`deploy/nginx/jevcode.conf` 补齐 `application/xml` gzip 压缩。
- **API 自发现与非搜索爬虫节流**：`server/playground.mjs` 新增免鉴权 `GET /v1/models`（OpenAI 兼容模型清单）与 `GET /` 服务发现文档（同步在 `deploy/nginx/jevcode.conf` 的 `api.jevcode.ai` 放行 `location = /`），`/v1/judge`、`/v1/me`、`/v1/usage` 继续严格 Bearer 鉴权；`public/robots.txt` 对线上高频非搜索爬虫（`ElevenlabsCrawler` / `SERankingBacklinksBot` / `ShapBot` / `RiverBot`）增设 `Crawl-delay: 10`，同时继续完整放行搜索引擎与 AI 答案引擎。
- **重型页面全量瘦身**：`src/pages/[lang]/jev/category/[category].astro` 与 `page/[page].astro` 引入 60 条分页，将 472 条的 `other-list` 从 **~706 KB 降至 ~105 KB/页**（8 语分页文案与 `check-jev-i18n.mjs`、`categorySchema` 同步更新）；`src/pages/[lang]/community.astro` 服务端对 327 张卡片做 220 字干净摘要截断；`src/pages/[lang]/ecosystem.astro` 移除 211 行重复内联 `data-search` 属性改由客户端惰性索引。
- **高流量落地页转化补齐**：为真实访客活跃的 `/[lang]/compare/`（`src/pages/[lang]/compare.astro`、`src/i18n/pages/compare.ts`）与全部 4,744 个 `/[lang]/jev/[slug]` 详情页（`src/pages/[lang]/jev/[slug].astro`、`src/i18n/pages/jev-cta.ts`）补充 8 语言「免费领 `$5.00` API 密钥 / 在线试跑」转化入口与分类页内链。
- **生产流量日报 CLI 与 systemd 内核级沙箱加固**：新增零依赖 `scripts/traffic-report.mjs`（聚合 Nginx 访问日志、搜索/AI 爬虫与真实浏览器会话、非扫描 404/5xx 及 `accounts.db` 漏斗数据，支持 `--json` 与 `--feishu`）并纳入 `deploy/sync-server-scripts.sh` 与 VPS 每日定时任务；`deploy/jevcode-playground.service` 补齐 `PrivateDevices`、`ProtectHome`、`ProtectKernel*`、`CapabilityBoundingSet=` 等内核级沙箱加固。

### 验证

- `npm run check`、`node scripts/i18n-gaps.mjs`、`npm run build`、`npm test`、`npm run test:e2e`、`node scripts/preflight.mjs --json` 全绿；线上验证分片 Sitemap、`/v1/models`、`api.jevcode.ai/`、重型页瘦身结果、非 root 深度沙箱与 `traffic-report.mjs` 实跑。

## 2026-11-25 — 第二阶段：预付充值码变现、一方漏斗统计、/jev/ 瘦身 90% 与非 root 运维加固

### 改动

- **预付充值码变现与一方无 Cookie 转化漏斗**：`server/accounts.mjs` 幂等迁移新增 `vouchers`（仅存 `sha256(code)` 散列）与 `funnel_daily` 表，提供 `issueVoucher`、`BEGIN IMMEDIATE` 原子兑换 `redeemVoucher`、`listVouchers`、`revokeVoucher`、`listUsers`、`recordEvent`、`funnelSummary`；`server/playground.mjs` 新增 `GET /api/auth/capabilities` 与受限频保护的 `POST /api/auth/redeem`，并在关键转化路径（`try_run` / `compare_run` / `register_ok` / `login_ok` / `key_created` / `v1_judge_ok` / `voucher_redeemed`）记录按日按语种聚合的无 PII 计数；新增运维 CLI `scripts/admin-accounts.mjs`（支持 `summary` / `users` / `credit` / `issue-voucher` / `vouchers` / `revoke-voucher`）。
- **前端充值、自动能力探测 OTP 与可选统计埋点**：`src/pages/[lang]/account.astro` 与 `src/i18n/pages/account.ts` 补齐 8 语言预付充值码兑换区块（兑换后即时刷新余额与流水）；`src/i18n/pages/pricing.ts` 补充 8 语言额度充值说明；`src/pages/[lang]/login.astro` 与 `src/i18n/pages/login.ts` 基于 `/api/auth/capabilities` 渐进增强，仅当服务端开启邮件通道（`otpEnabled: true`）时自动露出验证码登录，默认零噪音；`src/layouts/BaseLayout.astro` 增加构建期可选 `PUBLIC_CF_BEACON_TOKEN` 挂钩（未配时零外部脚本注入）。
- **性能瘦身与管线日志降噪**：`src/pages/[lang]/jev/index.astro`、`src/lib/seo/schema.ts` 与 `src/lib/content/jev-copy.ts` 将 `/[lang]/jev/` 枢纽页改为 11 大类分组 + 每类精选 6 条高证据度条目 + 分类全量入口，HTML 体积从 **917 KB 降至 95.8 KB（-89.3%）**，593 条词条仍由各分类页完整承载；新增 `scripts/lib/build-log.mjs` 并在 `scripts/pipeline.mjs` 接入，过滤 `cron.log` 中每次约 19,400 行路由逐页刷屏（失败时保留尾部原始输出）；`deploy/sync-server-scripts.sh` 纳入 `prune-runs.mjs` 与 `admin-accounts.mjs`。
- **生产非 root 加固与过期分享清理**：`deploy/jevcode-playground.service` 切换为专用系统用户 `User=jevcode` / `Group=jevcode`，开启 `PrivateTmp=true`、`ProtectSystem=strict` 与最小化 `ReadWritePaths=/var/lib/jevcode-accounts /var/www/jevcode/shared/runs`；VPS 同步执行 `prune-runs.mjs --days=30` 清理过期分享记录并接入 `/etc/cron.d/jevcode-prune-runs` 每日自动清理与 `/etc/logrotate.d/jevcode` 日志轮转，同时将 `/etc/cron.d/jevcode-backup` 统一至 `jevcode` 用户防止 WAL 权限冲突；同步更新 `deploy/ACCOUNTS-DEPLOY.md`。

### 验证

- `npm run check`：`0 errors, 0 warnings, 0 hints`；`npm test`：**322 / 322 通过**（`fail 0`）；`npm run test:e2e`：**64 / 64 通过**；`node scripts/preflight.mjs --json` 全绿。
- 生产核验：`jevcode-playground` 进程属主为 `jevcode:jevcode`；`/api/auth/capabilities`、`POST /api/auth/redeem`、`/api/try`、`/en/jev/`（~96 KB）、`/en/account/` 充值 UI 及 `admin-accounts.mjs summary` 全部通过，过期 runs 文件已回收。

## 2026-11-25 — 全面验收修复与 13 站友链接入（grok build 开发 + Jev 双轮门控验收）

### 改动

- **友链生态扩展与页脚重排**：`src/data/site.ts` 新增 13 个经实测 HTTPS 200 的高质量友链（`https://www.xntou.cn/` 星网数科 · 加盟选择专家、`https://www.lawshen.cn/` 律肃审、秒搭、GrokHome、OpenAICN、RooHome、Qwen Code、Qwen3 Coder、New API、妙唱、可圈可点、因评、Socrates，全站共 23 条友链）；`src/components/Footer.astro` 与 `src/styles/global.css` 改为三栏主体 + 独立全宽折行 `.footer__friends` 友链行，保留 `rel="friend noopener noreferrer"` 豁免 `nofollow`；`scripts/test-seo-gate.mjs` 补充友链完整性与无 `nofollow` 回归测试。
- **P0 交互功能修复**：修复 `src/pages/[lang]/lab.astro` 因 `typeof answer.confidence === 'number'` 优先于 `answer.choice` 导致所有选择题结果被吞的故障；修复 `src/pages/[lang]/try.astro` 与 `src/i18n/pages/try.ts` 缺失选择题置信度条、8 语言硬编码中文「免费试用」、未转义 `innerHTML` 及缺失 HTTP 429 提示，并补齐一键复制分享链接按钮；修复 `src/pages/[lang]/builds.astro` 来源链接 `href="syndication + Jev judgment"` 404 死链。
- **分享页 SEO 与渲染加固**：`server/playground.mjs` 的 `sharePage` 新增 `<meta name="robots" content="noindex, nofollow">`，补齐 `choice` 数值置信度条与独立 `confidence` 渲染，并在 `scripts/test-playground-security.mjs` 补充端到端单测。
- **转化文案与多语言一致性**：修复 `src/pages/[lang]/pricing.astro` 与 `src/pages/[lang]/api.astro` 全 8 语言（16 页）双美元符 `$$5.00` / `$$0.042` 错误，并将 `/pricing/` 注册按钮指向 `/login/?mode=register`、对齐 `/api/` 响应示例；修正 `src/i18n/ui.ts` 7 种非中文 `home.models.promo` 不实「free for one month」描述及 `de`/`fr` 导航词。
- **P0 翻译门禁自愈与基线清零**：强化 `scripts/translate-briefs.py` 三次重试递进温度（0 / 0.25 / 0.45）、多候选安全提取与已有合格译文保护；补齐 `src/data/briefs-i18n.json` 全部 48 条缺失译文并收紧 `scripts/content-check-baseline.json` 至 `[]`（`0 硬问题 / 0 软问题`）。
- **SEO / 无障碍合规与运维脚本**：消除全部 14 个页面模板的嵌套 `<main>` 地标违规；新增 `src/i18n/pages/topics.ts` 修复 `/topics/` 全 8 语言重复品牌标题（`76 topics | JevCode | JevCode`）及 `/topics/[topic]` 面包屑/返回链接；消除 `src/pages/[lang]/briefs/[id].astro` QAPage JSON-LD 8 语言硬编码中文 `（可接受：...）`；清理 `src/layouts/BaseLayout.astro` 最后一个 `ts(6133)` hint；新增 `scripts/prune-runs.mjs` 过期分享文件清理工具及单元测试。

### 验证

- `npm run check`：`0 errors, 0 warnings, 0 hints`，`jev-i18n` 全通；`node scripts/i18n-gaps.mjs`：0 缺口。
- `npm test`：**315 / 315 通过**（`fail 0`）；`npm run test:e2e`：**64 通过 / 0 失败**。
- `npm run build` & `node scripts/preflight.mjs --json`：`19,402` 页构建完成、`check-seo` 双向一致、`content-check` 硬 0 / 软 0、全站 19,401 HTML 零 `$$` / 零重复品牌标题 / 零嵌套 `<main>` / 23 条友链零 `nofollow`。

## 2026-11-22 — P2/P3 体验转化与 SEO 细节优化

### 改动

- **匿名访客跳过无谓 `/api/auth/me` 请求**：`server/playground.mjs` 在签发 `HttpOnly` 会话 Cookie 时同步下发无敏感信息的非 HttpOnly 提示位 `jev_auth=1`（登出及过期 `/me` 自动清理）；`src/components/Header.astro` 仅在存在 `jev_auth=1` 时请求 `/api/auth/me`，消除 99%+ 匿名浏览触发的后端打点。
- **账户页「建 Key 即首调」激活引导 + 改密表单**：`src/pages/[lang]/account.astro` 与 `src/i18n/pages/account.ts` 新增自定义 Key 备注、`最近使用（lastUsedAt）`列、新建 Key 后直接展示带当前明文 Key 的 `curl` / `Python` 首调代码及「用这把密钥试跑一次」页内实测按钮（`credentials: 'omit'` 走真实 Bearer Key 鉴权并展示实测耗时与响应），并补齐页内「修改密码」表单（对接 `POST /api/auth/password`）；顺带修正日语「残り额度」错字为「残りクレジット」。
- **接口耗时可观测性**：`/v1/judge` 与 `/api/try` 响应头新增 `Server-Timing: upstream;dur=<ms>`；实测 VPS 至 `api.clavue.com/v1/judge` 网络握手 <0.1s、热态单问判定 ~0.82s，此前 10–15s 尖刺系上游大输入/多问排队推理耗时。
- **SEO / GEO 细节收口**：`astro.config.mjs` 的 `@astrojs/sitemap` `defaultLocale` 由 `'zh'` 统一为 `'en'`（与 `i18n.defaultLocale`、`BaseLayout` `x-default` 及 nginx `/` → `/en/` 一致）；由 `public/favicon-32.png` 生成标准 `public/favicon.ico` 消除 404 榜首；`public/robots.txt` 对占回源 80%+ 压力的高频商业外链爬虫（`SemrushBot` / `AhrefsBot`）设置 `Crawl-delay: 10` 并屏蔽 `MJ12bot` / `DotBot`，继续完整放行搜索引擎与 AI 答案引擎。

### 验证

- `npm test` / `npm run test:e2e` / `npm run check` / `npm run build` 全绿；同步后端并执行 `./deploy/deploy.sh --skip-build` 全量上线验证。

## 2026-11-21 — P1 安全、计费准确性与 Nginx 真实 IP 加固

### 改动

- **消除 `/v1/judge` 与 `/api/try` 并发超扣竞态（TOCTOU）**：`server/accounts.mjs` 新增 `BEGIN IMMEDIATE` 原子预扣 `reserveInputTokens()` 与按精确行 id 退款 `refundEntry(entryId)`；`server/playground.mjs` 改为先预扣再调上游、失败精确回退。
- **审计字段幂等迁移**：为 `ledger` 补 `key_id` 列及索引 `idx_ledger_key`，为 `api_keys` 补 `last_used_at` 列并在 `resolveKey()` 自动刷新；兼容存量老库自动迁移。
- **修复 `/v1/judge` 默认落盘隐私风险**：程序化 `/v1/judge` 默认不再写入公开可读的 `/var/www/jevcode/shared/runs/`（仅显式 `share: true` 才落盘），且 `GET /api/runs/:id` 剥离内部 `userId`。
- **认证与限频加固**：`server/auth.mjs` 补充基于 libuv 线程池的异步 `scrypt` 方法（`registerAsync` / `loginAsync` / `changePasswordAsync`），避免高并发登录阻塞事件循环；注册后直接签发会话避免重复计算两次 scrypt；接入 `POST /api/auth/password` 改密接口；会话 Cookie 在生产/HTTPS 反代下强制带 `Secure`；新增有界自动清理滑动窗口限频器（单 Key `/v1/judge` RPM 默认 120、认证写接口 IP RPM 默认 30，并替换无界内存 Map）。
- **Nginx 还原 Cloudflare 真实 IP + `/topics` 裸路径跳转**：`deploy/nginx/jevcode.conf` 在 `www` 与 `api` 两个 `server` 块中配置全部 Cloudflare IPv4/IPv6 `set_real_ip_from` 与 `real_ip_header CF-Connecting-IP`，并补齐 `/topics` 裸路径 302；`playground.mjs` 优先读取 nginx 覆写的 `X-Real-IP`。
- **后端同步脚本与测试**：新增 `deploy/sync-playground.sh` 与 `scripts/test-playground-security.mjs`，更新 `deploy/ACCOUNTS-DEPLOY.md`。

### 验证

- `npm test`：**309 / 309 通过**（`fail 0`）；`npm run test:e2e`：**64 通过 / 0 失败**；`npm run check`：`0 errors`。
- 同步至生产 `23.95.243.52` 并重载 nginx 后，验证 `/health`、`/api/auth/me`、`/topics/` 302、数据库迁移与 `jevcode-timing.log` 真实客户端 IP。

## 2026-11-21 — 解除连续 9 天停更自锁：去重复构建、超时自愈、消告警刷屏与内容坏值清理

### 现象

- 2026-11-13 09:30 cron 在 `[deploy] 解包并切换软链...` 阶段击穿 900s 超时护栏（退出码 124），跳过发布后探针、未清 `pending`、未提交 IndexNow（但远端软链实际已切至 `20261113-014009`）。
- 2026-11-14 09:30 cron 跑完 `fetch-ecosystem.mjs` 后在支线抓取阶段再次击穿 900s 超时（退出码 124），被 `SIGTERM` 按组强杀，未执行 `restoreFetched()`，在工作区留下 `M src/data/ecosystem.ts`。
- 2026-11-15 ~ 11-21 连续 7 天因工作区脏文件触发 `pipeline-guard.mjs` 退出 2，整轮跳过并连写 `ALERT`（棘轮累积至第 9 轮）。
- 伴随问题：
  - `.research/pipeline-logs/cron.log` 无轮转，且 `astro.config.mjs` 的冗余 `i18n.fallback` 每次构建产生约 12.7 万条 `Could not render` 路由冲突告警，日志膨胀至 **529 MB**（338 万行）。
  - 本机 `daily-report.mjs` crontab 未加载 `.env`，`FEISHU_WEBHOOK` 始终为空，日报每日静默落盘不发飞书。
  - 11-13 提交带入 `briefs-i18n.json` 坏值（`zh` 缺 `cov-devtools-safety-01`、43 条 `ja` `question` 189 字符提示词回显、36 条 `zh` `question` 提示词回显及 19 条多语种回显/拒答），导致 `content-check` 与 `npm test` 持续标红。

### 根因

1. **双重构建**：`scripts/pipeline.mjs` 阶段 4 已运行完整 `npm run build`（18,122 页约 2.5–3 分钟），阶段 6 调 `./deploy/deploy.sh` 时后者无条件再跑一遍 `npm run build`，直接吃掉近 6 分钟预算。
2. **超时无自愈**：`run-with-timeout.sh` 强杀进程组后，`pipeline-cron.sh` 失败分支没有清理本轮写入的白名单抓取文件，导致单次超时永久自锁。
3. **支线抓取无超时**：`fetch-jev-builds.mjs` / `build-jev-cards.mjs` 的 `fetch()` 与 `pipeline.mjs` 中可选支线 `execSync` 均无超时限制，单点挂死会拖垮整轮 900s 预算。
4. **译文校验松于内容门禁**：`scripts/translate-briefs.py` 此前只按 `BODY_MAX * 1.5` 校验长度（未按 `question` 单独限制），且只匹配英文逗号分隔的 `"TypeSafe, System One"`，漏掉中文顿号、破折号列表回显及 `KI-Assistent` 拒答。

### 改动

- `deploy/deploy.sh` & `scripts/pipeline.mjs`：支持 `--skip-build` / `SKIP_BUILD=1`，管线部署复用阶段 4 已校验的 `dist/`；并为 `refreshBuilds/Community/Lab/Briefs/Jev` 增加单步超时。
- `scripts/fetch-jev-builds.mjs` & `scripts/build-jev-cards.mjs`：为 `fetch()` 补充 `AbortSignal.timeout`。
- `scripts/lib/restore-fetched.mjs` & `scripts/pipeline-cron.sh`：失败/超时分支自动还原 `FETCHED_FILES` 白名单脏文件（若存在未推送的本轮自动提交一并撤销，绝不碰白名单外手工改动或已推送提交）；增加 `rotate_log`（>5MB 自动 `copytruncate + gzip` 保留 3 份）。
- `scripts/daily-report-cron.sh` & `scripts/pipeline-cron.sh --install`：日报改走包装脚本加载 `.env`，并纳入 `--install` 统一管理。
- `astro.config.mjs`：移除冗余的 `i18n.fallback`（全站多语言及文档回退已在 `[lang]/[...slug].astro` 显式生成），消除每次构建 ~12.7 万条 `Could not render` 告警。
- `scripts/translate-briefs.py` & `src/data/briefs-i18n.json`：按字段对齐 `QUESTION_MAX` / `BODY_MAX`、拦截多格式提示词回显与模型拒答，并修复存量 1 条缺译 + 98 条回显/拒答坏值。
- `scripts/test-ops-scripts.mjs`：补 4 条回归用例覆盖跳过构建、超时自愈三场景、日志轮转/日报 `.env` 接入与网络超时保护。

### 验证

- `node scripts/lib/restore-fetched.mjs` 实测还原 `src/data/ecosystem.ts`。
- 压缩截断 529 MB `cron.log`（保留末 2,000 行于 `cron.log.1.gz`）并重装本机 3 条 crontab 任务。
- `npm run build`：退出 0，总耗时 **115s**，`Could not render` 告警 **0** 条，`18121 pages (18101 indexable, 20 noindex), sitemap 18101`，`check-seo: OK`。
- `node scripts/content-check.mjs`：`硬问题 0，软问题 0`；`npm test`：**303 / 303 通过（fail 0）**；`npm run check`：0 errors。


## 2026-11-07 — 超时护栏按进程组终止（`a2ffbeb`）

### 现象

- 2026-11-06、11-07 两轮 cron 均无 `released` 事件，棘轮连续报「未成功发布」；11-07 写入 `ALERT-2026-11-07.txt`（退出码 124）。
- 同时线上站点实际已是新版本——发布记录与线上状态并存且互相矛盾。
- 11-06 日志尾部可直观点看到矛盾的成因：`[cron] 运行超过 900s，向管线（pid 30580）发送 SIGTERM` 之后，`[deploy] 解包并切换软链...` 仍在继续，并以 `[deploy] 部署完成` 收尾。
- 伴随表现：`pending` 积压 115 repos，`eco_last_release` 停在 11-04，IndexNow 停止提交（差集 1529 条 URL）。

### 根因

`scripts/pipeline-cron.sh` 的 900s 超时护栏只对管线主进程 `kill -TERM "$PIPE_PID"`。管线此时已 fork 出 `./deploy/deploy.sh`（其下还有 `ssh` / `rsync` / `curl`），主进程被终止不影响这棵子树，deploy 继续上传、切换 `current` 软链并 `systemctl reload nginx`。

于是 cron 以 124 记「管线失败」，线上却换了版本：既不是「没发布」，也不是「发布成功」，两边事实对不上。

### 改动

- 新增 `scripts/run-with-timeout.sh`：用 `set -m` 让子命令自成进程组，超时向**整组**发 `SIGTERM` → 等 10s → `SIGKILL`，并等待整组回收；退出码按 `timeout(1)` 约定保留 124。
  - 安全保护一：仅当子进程确为组长（`pgid == pid`）且组号不等于自身组号时才按组发信号，否则退回单 pid，避免误杀 cron 自身所在进程组。
  - 安全保护二：`SIGKILL` 后复核存活，仍存活则输出 `ERROR ... 需人工清理`，不假装已回收。
- `scripts/pipeline-cron.sh`：改调用护栏，`TIMED_OUT` 由退出码 124 判定。门 2 HOLD、失败告警、棘轮计数、飞书推送分支均保持原样。
- `scripts/test-ops-scripts.mjs`：新增 5 条回归，覆盖孙进程回收、退出码透传、缺参数退出 2、cron 接入形态、同组保护与 SIGKILL 后复核留痕。

### 验证

- 有效性对照：用只杀单 pid 的旧实现在同一用例下复现泄漏（`ALIVE=YES`），新护栏同用例 `RESULT=GRANDCHILD_REAPED` 且 `GUARD_RC=124`，证明回归用例能抓住该缺陷。
- `node --test scripts/test-ops-scripts.mjs` → 退出码 0，`fail 0`。
- `npm test` → `tests 291 / pass 291 / fail 0`。
- `npm run check` → 退出码 0。

### 后续观察项

- 超时终止后主机上不得残留 `deploy.sh`、`rsync` 或 `ssh` 子进程；若出现 `ERROR SIGKILL 后仍有进程存活`，按需人工清理。
- 下一轮 cron 应重新出现 `released` 事件，`eco_last_release` 前移，说明发布链路恢复闭环。
- `pending` 不再持续增长并随发布回落；若仍上涨，说明存在护栏之外的第二处中断。
- IndexNow 差集应在下一次成功发布后收敛。

### 复跑结果（2026-11-08 09:30 cron）

当日 09:30 那轮 cron 自然跑通，四个观察项中前三项已由实测数据确认：

- `gate1-stale-override` / `gate1` 255s → `gate2` 389s → **`released` 719s**，全程在 900s 预算内，未触发超时护栏。
- `pending` 由 115 回落至 **0**，`last_release` 与 `eco_last_release` 同步前移到 `2026-11-08T01:42:01.413Z`——发布会话真正走完了闭环，不再出现「cron 记失败、线上已换版」的错位。
- 提交 `63b4e63 chore(eco): 生态数据自动刷新 (2026-11-08)` 正常入库。
- 主机上无残留 `deploy.sh` / `rsync` / `ssh` 子进程（`ps` 复核）。
- 线上抽测 `/en/`、`/en/briefs/`、`/en/topics/ai-software-downloads/`、`/zh/topics/ai-software-downloads/` 均返回 `code=200 rc=0`，健康探测脚本在真实 nginx 上按预期工作。
- **有界重试在真实部署中命中**：`cron.log` 记 `https://www.jevcode.ai/de/briefs/cov-ecommerce-escalation-02/ -> HTTP 000，1s 后第 2 次探测` → `第 2 次探测恢复 200` → `发布后校验通过` → `部署完成：20261108-013633`。即 reload 瞬断确实发生过，但不再被误判为失败、不再触发自动回滚。
- IndexNow 差集同步收敛：`sitemap` 17141 条 URL 全部在 `.indexnow-state.json` 中留有记录，待提交 **0**。

## 2026-11-11 — 未提交文件触发脏区前置检查，日更连续 3 轮跳过（`59fe1c9`）

### 现象

- 11-08 复跑成功后，11-09 / 11-10 / 11-11 三天 09:30 cron 均**整轮跳过**，三天无 `2026-11-{09,10,11}.jsonl`（爬虫根本没启动），无 `chore(eco)` 提交。
- 内容停在 11-08：`briefs` / `briefs-i18n` 均为 900，数据文件最后写入 11-08 09:33。
- 棘轮「连续未发布第 1/2/3 轮」，11-11 写入 `ALERT-2026-11-11.txt`「连续 3 轮未成功发布：内容已 3 天未更新」，飞书已投递；巡检同时报「最新案例 2026-11-08，距今 3 天（阈值 2 天）」。
- GitHub core 额度 4950 / 4998 / 4983，充足，非限流。

### 根因

工作区存在 ` M scripts/test-health-probe.mjs`——上一轮为验证「首次连接错误 `000` 后恢复」新增的测试用例（本身 `6 tests / 6 pass / 0 fail`），但只跑了测试、没有提交。

`scripts/pipeline-cron.sh:204-225` 的前置检查把 `git status --porcelain` 交给 `scripts/pipeline-guard.mjs`；该文件属于「会进入发布的改动」，guard 返回 2，于是整轮 `exit 0` 跳过并写 `SKIPPED-*.txt`。管线不会自行清理工作区，因此只要文件不提交，每轮都会重复跳过——这是设计上的保守保护（避免把手工改动发布出去），不是新的代码缺陷。

与 11-06/11-07 的超时护栏事故无关，`a2ffbeb` / `8a86ca1` 的修复在 11-08 已被真实部署验证有效。

### 处置与验证

- commit `59fe1c9` 提交该测试文件，工作区恢复干净。
- `node --test scripts/test-health-probe.mjs` → `6 pass / 0 fail`；`npm test` → `299 pass / 0 fail`（退出码 0）。
- `git status --porcelain` → 0 行；按 cron 真实路径复算 `git status --porcelain | node scripts/pipeline-guard.mjs` → `GUARD_RC=0`（此前为 2），11-12 09:30 不会再被拦。
- `ALERT-2026-11-11.txt` 与 `SKIPPED-11-{09,10,11}.txt` 保留为历史记录；cron 下一轮成功发布时会「棘轮归零，旧告警已清理」。历史 3 天不自动补发。

### 观察项

- 11-12 09:30 应重新出现 `released` 事件、`chore(eco)` 提交、`pending` 回落与 IndexNow 提交；若仍跳过，说明存在第二处脏区或 guard 之外的新阻塞。
- 流量数据：仓库内**无** GA / gtag / Plausible / Umami 埋点，`.env` 无流量凭据，`deploy/nginx/jevcode.conf` 的 5 处 `access_log` 均为 `jevcode_timing` 计时日志且静态/接口 location 设 `access_log off`，本地无访问日志文件。PV / UV / 来源 / 搜索点击需到 VPS `/var/log/nginx/jevcode-*.log` 或 Search Console 查询；本地只能给收录面代理指标（`dist` 17161 页、sitemap 页面 URL 17140、IndexNow 已记录 17141 待提交 0、`llms.txt` 688 行）。
