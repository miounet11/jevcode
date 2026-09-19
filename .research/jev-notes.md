# Jev 迭代决策记录（fan-out 实测）

三轮 fan-out 评估，每轮一个请求、多个原子问题。模型 `jev-latest`（jev-1.13.0）。
所有请求 JSON 见会话 /tmp；本文件只记结论与置信度。

## 轮 1 — 站点方向基线

| 问题 | 判定 |
|---|---|
| 受众是开发者 | **0.95** 是 |
| 搜索功能高价值 | 0.86 |
| 交互式示例高价值 | 0.81 |
| 原创分析文章高价值 | 0.62 |
| 对比页高价值 | 0.62 |
| 最大缺口 | **interactivity 0.75**（其次 findability 0.16） |
| 机翻内容损害可信度 | 1.63/3（略偏 Moderate） |

结论：受众明确是开发者；「体验类」缺口最大。

## 轮 2 — 迭代主题选择

| 问题 | 判定 |
|---|---|
| 迭代主题 | **experience 0.94**（findability 0.06，trust/content 0） |
| 基建 vs 内容权重 | **3.03/4 Mostly infra**（confidence 0.92） |
| Playground 实现方式 | **mocked_samples 置信度 1.0**（serverless_proxy 0，完全排除） |
| 搜索价值 | 0.65；信任修补 0.54；对比文章 0.33；i18n 修补 0.34 |

结论：本轮做「体验基建」，playground 用预录真实响应、纯静态、零密钥风险。

## 轮 3 — Playground 设计

| 问题 | 判定 |
|---|---|
| 场景数量 | **5 个**（3 原语 + 2 管线案例），five 0.80 |
| 关联 case 文档 | 0.58，弱倾向关联 |
| 最佳 UI 表达 | **生成式输出 vs Jev 类型化判定并排对比**，gen_vs_judge 0.89 |
| 输入可编辑 | 0.57，接近五五开 → 保守处理：编辑后明确标注响应为缓存样本 |
| 导航位置 | **顶部导航**，top_nav 0.69（hero_cta 0.27） |
| 诚实标注缓存样本 | **0.85 关键**，必须显式标注 |

## 汇总决策

本轮迭代（体验基建）：

1. **Playground 页**（`/[lang]/playground/`）：5 个场景（noul/choice/score 三个原语
   + composite/fan-out 两个管线案例），每场景展示「生成式模型会怎么写 vs Jev 返回
   什么」并排对比，概率条 + 数值，附「响应为预录真实样本」标注。
2. **场景尾部链接对应 cookbook 文档**（弱关联决策，成本极低顺手做）。
3. **顶部导航加入 Playground 入口**（全部 8 语言）。
4. 输入可编辑，但响应不变时打上「cached sample」标记，不假装实时推理。

暂缓：搜索（下轮做）、对比文章系列、i18n 边角修补。

## 成本记录

三轮共 input ~3.4k tokens + 自测若干，合计不足 $0.001（$42/Btok）。
fan-out 模式下单轮决策 1 次请求、2–5 秒返回。

## 轮 4–6 — 迭代 2 与循环控制（2026-09-19 深夜）

### 轮 4（部署与迭代 2 主题）
- deploy_now **0.81** → 已执行：release `20260919-154519` 上线并验证 200
- iteration2：search 0.50 vs content 0.48（conf 0.34）——真持平，未强行裁决
- search tech：pagefind **0.95**（fuse.js 0.03）
- content_gap：cookbook_i18n **0.94**

### 轮 5（打破僵局）
- tie_break：**search_first 0.87**
- pagefind UI：static_modal 0.68（header 全页搜索模态）
- cookbook 范围：all_18_all_6 0.89（若做）
- 机翻免审发布：0.37（不认可）
- 发布节奏：per-iteration 1.61/3
- loop_continue 0.55

执行：pagefind 搜索已实现、验证、发布 `20260919-155831`（线上索引实测命中 zh 3/3、en 3/3）。

### 轮 6（停止/继续裁决）
- continue_now **0.25 —— Jev 明确说不继续**
- bulk_translation_risk **3.17/4 High**（conf 0.85）：一次性发布 108 个免审机翻文件风险高
- 若要做：staged_1_lang 0.53（先一种语言 18 个文件）而非 36 文件一批
- 质量门槛：full_review 0.46 / spot_check 0.42 —— 倾向人工审核，**今晚不做**
- session_complete_after_this **0.65**：stage 1 后即收
- 当前 release 评价：**2.0/3 Solid release**（conf 0.81）

### 循环结论
Jev 判定：本轮会话在两个已验证的发布后**收尾**。
机翻 cookbook 留作下个会话，按 staged_1_lang（ja 先行 18 文件）
+ 人工抽查 2–3 篇的质量门槛推进，不批量免审发布。

## 轮 7–8 — 会话 2：信任修补与工具化（2026-09-20）

### 轮 7（本会话做什么）
- 约束修正：Jev 是判断模型，**不能生成译文**，机翻 cookbook 需外部工具 → 轮 6 计划改道
- work_this_session：**prep_and_trust 0.99**（缺口检查器 + 信任修补）
- 翻译骨架有用 0.83；机翻横幅价值 0.73；fallback 边角修补 0.55（暂缓）
- continue_after_done 0.41（做完即收）
- release_bar **1.65/4**：build + check + link check + 线上抽查

### 执行
- `scripts/i18n-gaps.mjs`：清单/JSON/骨架三模式，缺口 **19 文件 × 6 语言 = 114 条**
  （18 cases + sdk/http-api），exit 1 可作 CI 卡点
- 信任修补：zh 官方文档译文 21 处补 `translatedFrom: en`；
  use-case-map 溯源修正（**zh 原创，en 是译本**）
- Release `20260919-165044` 上线

### 轮 8（验收与收尾）
- release_verified **0.83** ✓
- loop_close **0.84** ✓ —— 循环关闭
- final_quality_concern：other 0.42（低置信）→ 逐项自查：
  og:title/description/image/url 全齐；robots.txt 无 pagefind 屏蔽；
  git push 完成——无遗留 other
- next_session_priority：**comparison_articles 0.55**（对比文章系列）
  超过 translations_ja 0.37 —— 下会话先写「Jev vs 生成式栈」对比系列
- session_success **2.95/3 Highly productive**（conf 0.95）

### 发布门槛全过（本轮）
astro check 0/0/0 · 16025 内链零断 · 线上 zh/quickstart 机翻标注正确渲染 ·
en/use-case-map 200 · 工作区干净 · 已推送 origin/main

## 轮 9–12 — 自动化管线与社区脉搏（2026-09-20）

### 轮 9（自动化架构）
- 调度 vps_cron 0.46 vs gha-pr 0.42（低置信）→ 实选本机 cron（零迁移成本）
- 阶段 stars_plus_detect 0.74；**two_stage 双门 0.95**；daily 0.88；branch_pr 0.63

### 轮 10（批量与门槛）
- **batch_by_magnitude 0.62**：小增量累积，任一仓库 +10% 触发
- 阈值 +10%（score 1.64≈2/4，低置信 0.25，保守取高档）
- date_stamp 1.0（生态页日期戳）；auto_deploy 0.51（放行）
- 门 1 改为评估「累积批次+过期」而非单日 delta

### 轮 11（QMuse 复刻，用户需求）
- **gated_with_attribution 0.99**：创意可复刻，表达不复刻
- 自己写摘要 **own_summaries 1.0**：绝不复制对方机翻（有严重误译）
- jev_per_entry 0.73 价值门；community_page 0.68 独立页
- 法律风险自评 **Low 0.80**

### 轮 12（验收）
- release_verified 0.56（弱通过）；hype 过滤可接受 0.70
- loop_close 0.54 —— 关闭（弱多数）
- cron 依赖本机风险 1.81/3（Moderate，53% 概率）：批次会累积，错过无害
- 推文内容责任 0.91/4 Low
- **下会话优先级：pipeline_vps 0.83** —— 管线迁 VPS/GHA 保常开

### 执行记录
- scripts/fetch-ecosystem.mjs + pipeline.mjs（双 Jev 门）+ pipeline-cron.sh
  （每日 09:30 已装 crontab，脏工作区保护，--install/--uninstall）
- 实测：6 仓库 0.3%-2.3% 增量正确累积不发布；生态数据手动刷新一次
- 生态页 dataAsOf 日期戳自动维护
- 社区脉搏页 /{lang}/community/：202 条提取 → Jev 6 批门控 → 143 条收录
  （署名+原推回链+项目链接，4 分类自动归组），8 语言导航
- Release 20260919-165044（信任修补+i18n 工具）、20260919-185434（社区页）
- 验证：astro check 0/0/0 · 16522 内链零断 · 线上 zh/en/pt 200

### 下会话（Jev 已排定）
1. **pipeline_vps 0.83**：管线迁 VPS 或 GHA（常开可靠性）
2. comparison_articles 0.55、community_polish 0.17、cookbook_ja 0
