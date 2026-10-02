# JEV 覆盖清单

由 `scripts/gen-coverage-catalog.mjs` 生成，请勿手改。改维度请改 `scripts/lib/coverage-taxonomy.mjs` 后重跑 `npm run coverage:gen`。

## 规模

- 语料总量：**7680** 条（`data/coverage-cases.json`）
- 行业 40 × 判定类型 24 × 模板 8 = 7680
- 附加轴：tag 16、载体 12、环节 8，轮转铺满

## 用法

```bash
# 重新生成全量语料 + 本清单
npm run coverage:gen

# 抽样 200 条（可复现，用于真实评测，控制耗时与额度）
node scripts/gen-coverage-cases.mjs --sample 200   # -> data/coverage-sample.json
```

每条用例字段：`id / industry / dimension / tag / scene / stage / context / question / choices / accept`。
`accept` 是正确选项，可直接作为判分依据（JEV 的 `/api/compare` 与 `/v1/judge` 都用同一契约）。

## 行业（industry）

共 40 个行业，横跨电商、金融、医疗、制造、公共部门等。

| # | id | 名称 |
| --- | --- | --- |
| 1 | `ecommerce` | E-commerce |
| 2 | `fintech` | Fintech |
| 3 | `banking` | Banking |
| 4 | `insurance` | Insurance |
| 5 | `healthcare` | Healthcare |
| 6 | `pharma` | Pharma |
| 7 | `telehealth` | Telehealth |
| 8 | `education` | Education |
| 9 | `edtech` | EdTech |
| 10 | `university` | Higher Ed |
| 11 | `saas` | SaaS |
| 12 | `paas` | Cloud / PaaS |
| 13 | `cybersecurity` | Cybersecurity |
| 14 | `devtools` | DevTools |
| 15 | `gaming` | Gaming |
| 16 | `media` | Media |
| 17 | `streaming` | Streaming |
| 18 | `adtech` | AdTech |
| 19 | `marketing` | Marketing |
| 20 | `crm` | CRM |
| 21 | `logistics` | Logistics |
| 22 | `supplychain` | Supply Chain |
| 23 | `manufacturing` | Manufacturing |
| 24 | `automotive` | Automotive |
| 25 | `aerospace` | Aerospace |
| 26 | `energy` | Energy |
| 27 | `utilities` | Utilities |
| 28 | `telecom` | Telecom |
| 29 | `realestate` | Real Estate |
| 30 | `construction` | Construction |
| 31 | `legal` | Legal |
| 32 | `hr` | HR |
| 33 | `recruiting` | Recruiting |
| 34 | `government` | Government |
| 35 | `nonprofit` | Nonprofit |
| 36 | `travel` | Travel |
| 37 | `hospitality` | Hospitality |
| 38 | `restaurant` | Restaurant |
| 39 | `retail` | Retail |
| 40 | `marketplace` | Marketplace |

## 判定类型（dimension）

每种类型有固定问句与候选集，8 条模板。

| # | id | 名称 |
| --- | --- | --- |
| 1 | `urgency` | Does this message convey urgency that should jump the queue? |
| 2 | `intent` | What is the primary intent of this message? |
| 3 | `safety` | Does this content pose a safety risk requiring immediate review? |
| 4 | `compliance` | Does this require a compliance or regulatory review before proceeding? |
| 5 | `billing-dispute` | Is this a billing dispute that needs a refund decision? |
| 6 | `priority` | What priority should this ticket receive? |
| 7 | `sentiment` | What is the sentiment of this message? |
| 8 | `language` | Which language is this message written in? |
| 9 | `pii` | Does this message contain personally identifiable information? |
| 10 | `toxicity` | Should this message be flagged for toxic or abusive content? |
| 11 | `fraud` | Does this pattern suggest fraud requiring investigation? |
| 12 | `spam` | Is this message spam or unsolicited bulk content? |
| 13 | `escalation` | Should this be escalated to a senior or on-call team? |
| 14 | `routing` | Which team should handle this ticket? |
| 15 | `category` | Which category best fits this ticket? |
| 16 | `risk-level` | What risk level does this issue carry? |
| 17 | `next-action` | What is the best next action? |
| 18 | `quality` | Does this support reply meet quality standards? |
| 19 | `medical-triage` | What triage level does this health-related message indicate? |
| 20 | `financial-advice` | Is this a request for personalized financial advice? |
| 21 | `data-access` | Should this data access request be granted? |
| 22 | `content-moderation` | What moderation action is appropriate? |
| 23 | `topic` | What is the topic of this message? |
| 24 | `actionability` | Is this message actionable as written? |

## 横切关切（tag）

与行业正交，用于筛出「同一类风险在各行业的表现」。

| # | id | 名称 |
| --- | --- | --- |
| 1 | `sla-breach` | SLA breach |
| 2 | `refund` | Refund |
| 3 | `data-loss` | Data loss |
| 4 | `security` | Security |
| 5 | `privacy` | Privacy |
| 6 | `accessibility` | Accessibility |
| 7 | `localization` | Localization |
| 8 | `performance` | Performance |
| 9 | `regression` | Regression |
| 10 | `outage` | Outage |
| 11 | `chargeback` | Chargeback |
| 12 | `churn-risk` | Churn risk |
| 13 | `deadline` | Deadline |
| 14 | `auto-renewal` | Auto-renewal |
| 15 | `third-party` | Third-party dependency |
| 16 | `audit-trail` | Audit trail |

## 载体形态（scene）

题面被包进对应形态的壳里，模拟真实入口。

| # | id | 名称 |
| --- | --- | --- |
| 1 | `support-ticket` | Support ticket |
| 2 | `chat` | Live chat |
| 3 | `email` | Inbound email |
| 4 | `review` | Public review |
| 5 | `alert` | Monitoring alert |
| 6 | `log` | Log entry |
| 7 | `transcript` | Call transcript |
| 8 | `form` | Web form submission |
| 9 | `sms` | SMS |
| 10 | `api-payload` | API payload |
| 11 | `note` | Internal note |
| 12 | `social` | Social post |

## 环节（stage）

模拟 JEV 在一次业务流转中的介入位置。

| # | id | 名称 |
| --- | --- | --- |
| 1 | `intake` | Intake |
| 2 | `triage` | Triage |
| 3 | `routing` | Routing |
| 4 | `response` | Response |
| 5 | `escalation` | Escalation |
| 6 | `qa` | QA |
| 7 | `audit` | Audit |
| 8 | `follow-up` | Follow-up |
