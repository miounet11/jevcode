# JEV 全量覆盖评测总表

- 生成时间：2026-10-08T19:55:06.646Z
- 数据源：.data/runs/compare-log-hospitality-backup.jsonl, .data/runs/compare-log-insurance-backup.jsonl, .data/runs/compare-log-logistics-backup.jsonl, .data/runs/compare-log-marketing-backup.jsonl, .data/runs/compare-log-media-backup.jsonl, .data/runs/compare-log-paas-backup.jsonl, .data/runs/compare-log-realestate-recruiting-backup.jsonl, .data/runs/compare-log-restaurant-retail-backup.jsonl, .data/runs/compare-log-saas-streaming-backup.jsonl, .data/runs/compare-log-shard1-adtech-backup.jsonl, .data/runs/compare-log-shard12-full.jsonl, .data/runs/compare-log-shard2-automotive-backup.jsonl, .data/runs/compare-log-shard3-construction-backup.jsonl, .data/runs/compare-log-shard4-cybersecurity-devtools-live.jsonl, .data/runs/compare-log-shard5-pre-retry-backup.jsonl, .data/runs/compare-log-shard6-education-backup.jsonl, .data/runs/compare-log-shard7-fintech-backup.jsonl, .data/runs/compare-log-shard8-government-backup.jsonl, .data/runs/compare-log-shard9-hospitality-backup.jsonl, .data/runs/compare-log-shard9-hospitality-rerun-backup.jsonl, .data/runs/compare-log-supplychain-telecom-backup.jsonl, .data/runs/compare-log-telehealth-travel-backup.jsonl, .data/runs/compare-log-university-utilities-backup.jsonl, .data/runs/compare-log-v2.jsonl, .data/runs/compare-log.jsonl
- 语料：7680 条 / 40 行业
- 总命中：**ours 84.1%**（6298/7491，出错 256）| peer 90.7%（6797/7491，出错 179）
- 语料进度：7491 / 7680 条已答（36 / 40 行业已答≥90%）

- ⚠ 以下 4 个行业已答不足应有 90%，为日志轮转残值，以 docs/coverage-full/<行业>.md 分片报表为准：`cybersecurity` `logistics` `marketing` `media`

## industry

| 行业 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adtech | 86.5% | 166 | 192 | 0 | 93.8% | 180 | 0 |
| aerospace | 85.9% | 165 | 192 | 0 | 93.2% | 179 | 0 |
| automotive | 87.5% | 168 | 192 | 0 | 93.2% | 179 | 0 |
| banking | 85.4% | 164 | 192 | 0 | 92.2% | 177 | 0 |
| construction | 85.9% | 165 | 192 | 0 | 94.8% | 182 | 0 |
| crm | 88.5% | 170 | 192 | 0 | 93.8% | 180 | 0 |
| cybersecurity ⚠ | 87.3% | 137 | 157 | 0 | 92.4% | 145 | 0 |
| devtools | 90.1% | 173 | 192 | 0 | 92.2% | 177 | 0 |
| ecommerce | 87.0% | 167 | 192 | 0 | 93.8% | 180 | 0 |
| edtech | 88.5% | 170 | 192 | 0 | 93.2% | 179 | 2 |
| education | 88.5% | 170 | 192 | 0 | 93.2% | 179 | 0 |
| energy | 88.0% | 169 | 192 | 0 | 93.2% | 179 | 1 |
| fintech | 87.0% | 167 | 192 | 0 | 93.8% | 180 | 0 |
| gaming | 88.5% | 170 | 192 | 0 | 94.3% | 181 | 0 |
| government | 87.0% | 167 | 192 | 0 | 81.8% | 157 | 24 |
| healthcare | 88.5% | 170 | 192 | 0 | 94.3% | 181 | 0 |
| hospitality | 86.5% | 166 | 192 | 0 | 93.2% | 179 | 1 |
| hr | 88.0% | 169 | 192 | 0 | 88.0% | 169 | 12 |
| insurance | 86.1% | 149 | 173 | 0 | 92.5% | 160 | 1 |
| legal | 84.4% | 162 | 192 | 0 | 91.7% | 176 | 2 |
| logistics ⚠ | 86.0% | 135 | 157 | 0 | 90.4% | 142 | 0 |
| manufacturing | 85.4% | 164 | 192 | 0 | 90.1% | 173 | 3 |
| marketing ⚠ | 85.3% | 128 | 150 | 0 | 90.7% | 136 | 1 |
| marketplace | 85.4% | 164 | 192 | 0 | 92.7% | 178 | 2 |
| media ⚠ | 87.3% | 117 | 134 | 0 | 89.6% | 120 | 1 |
| nonprofit | 88.5% | 170 | 192 | 0 | 93.8% | 180 | 0 |
| paas | 88.5% | 170 | 192 | 0 | 90.1% | 173 | 6 |
| pharma | 85.4% | 164 | 192 | 0 | 83.3% | 160 | 15 |
| realestate | 85.9% | 165 | 192 | 0 | 93.2% | 179 | 0 |
| recruiting | 89.6% | 172 | 192 | 0 | 91.1% | 175 | 6 |
| restaurant | 85.9% | 165 | 192 | 0 | 92.2% | 177 | 1 |
| retail | 85.9% | 165 | 192 | 0 | 93.2% | 179 | 0 |
| saas | 87.5% | 168 | 192 | 0 | 91.1% | 175 | 4 |
| streaming | 10.9% | 21 | 192 | 168 | 92.7% | 178 | 1 |
| supplychain | 45.8% | 88 | 192 | 88 | 89.6% | 172 | 2 |
| telecom | 88.0% | 169 | 192 | 0 | 89.6% | 172 | 6 |
| telehealth | 86.5% | 166 | 192 | 0 | 91.1% | 175 | 1 |
| travel | 88.5% | 170 | 192 | 0 | 91.7% | 176 | 4 |
| university | 88.5% | 170 | 192 | 0 | 61.5% | 118 | 66 |
| utilities | 84.9% | 163 | 192 | 0 | 83.3% | 160 | 17 |

## dimension

| 维度 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| actionability | 91.3% | 292 | 320 | 8 | 59.1% | 189 | 5 |
| billing-dispute | 90.4% | 273 | 302 | 16 | 96.0% | 290 | 4 |
| category | 73.2% | 232 | 317 | 8 | 96.8% | 307 | 8 |
| compliance | 89.9% | 266 | 296 | 16 | 96.3% | 285 | 8 |
| content-moderation | 77.5% | 248 | 320 | 8 | 95.9% | 307 | 3 |
| data-access | 88.8% | 284 | 320 | 8 | 98.8% | 316 | 0 |
| escalation | 81.1% | 253 | 312 | 8 | 97.8% | 305 | 7 |
| financial-advice | 82.2% | 263 | 320 | 8 | 90.3% | 289 | 11 |
| fraud | 70.2% | 219 | 312 | 16 | 93.9% | 293 | 3 |
| intent | 95.5% | 275 | 288 | 8 | 98.6% | 284 | 4 |
| language | 91.1% | 288 | 316 | 16 | 99.7% | 315 | 1 |
| medical-triage | 76.3% | 244 | 320 | 8 | 96.9% | 310 | 10 |
| next-action | 83.4% | 267 | 320 | 8 | 87.8% | 281 | 18 |
| pii | 95.0% | 304 | 320 | 16 | 90.6% | 290 | 4 |
| priority | 69.5% | 214 | 308 | 16 | 78.9% | 243 | 8 |
| quality | 88.1% | 282 | 320 | 8 | 73.4% | 235 | 2 |
| risk-level | 66.9% | 214 | 320 | 8 | 73.8% | 236 | 4 |
| routing | 96.8% | 302 | 312 | 8 | 96.5% | 301 | 4 |
| safety | 70.5% | 206 | 292 | 8 | 99.3% | 290 | 1 |
| sentiment | 94.2% | 294 | 312 | 16 | 91.7% | 286 | 26 |
| spam | 85.6% | 267 | 312 | 8 | 91.7% | 286 | 24 |
| topic | 69.7% | 223 | 320 | 8 | 83.4% | 267 | 9 |
| toxicity | 95.0% | 304 | 320 | 16 | 94.4% | 302 | 13 |
| urgency | 97.3% | 284 | 292 | 8 | 99.3% | 290 | 2 |

## miss 模板（ours 未命中，按频次降序）

| 模板 | miss 数 | 涉及行业 |
| --- | ---: | ---: |
| risk-level | 98 | 39 |
| topic | 89 | 39 |
| safety | 78 | 36 |
| priority | 78 | 37 |
| fraud | 77 | 37 |
| category | 77 | 39 |
| medical-triage | 68 | 39 |
| content-moderation | 64 | 38 |
| escalation | 51 | 35 |
| financial-advice | 49 | 35 |
| next-action | 45 | 37 |
| spam | 37 | 29 |
| quality | 30 | 23 |
| data-access | 28 | 24 |
| actionability | 20 | 15 |
| compliance | 14 | 13 |
| billing-dispute | 13 | 13 |
| language | 12 | 12 |
| intent | 5 | 5 |
| routing | 2 | 2 |
| sentiment | 2 | 2 |
