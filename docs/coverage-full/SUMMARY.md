# JEV 全量覆盖评测总表

- 生成时间：2026-10-05T14:11:45.921Z
- 数据源：.data/runs/compare-log-hospitality-backup.jsonl, .data/runs/compare-log-insurance-backup.jsonl, .data/runs/compare-log-logistics-backup.jsonl, .data/runs/compare-log-marketing-backup.jsonl, .data/runs/compare-log-media-backup.jsonl, .data/runs/compare-log-paas-backup.jsonl, .data/runs/compare-log-realestate-recruiting-backup.jsonl, .data/runs/compare-log-restaurant-retail-backup.jsonl, .data/runs/compare-log-shard1-adtech-backup.jsonl, .data/runs/compare-log-shard12-full.jsonl, .data/runs/compare-log-shard2-automotive-backup.jsonl, .data/runs/compare-log-shard3-construction-backup.jsonl, .data/runs/compare-log-shard4-cybersecurity-devtools-live.jsonl, .data/runs/compare-log-shard5-pre-retry-backup.jsonl, .data/runs/compare-log-shard6-education-backup.jsonl, .data/runs/compare-log-shard7-fintech-backup.jsonl, .data/runs/compare-log-shard8-government-backup.jsonl, .data/runs/compare-log-shard9-hospitality-backup.jsonl, .data/runs/compare-log-shard9-hospitality-rerun-backup.jsonl, .data/runs/compare-log-v2.jsonl, .data/runs/compare-log.jsonl
- 语料：7680 条 / 40 行业
- 总命中：**ours 85.1%**（5402/6345，出错 144）| peer 91.9%（5833/6345，出错 83）
- 语料进度：6345 / 7680 条已答（29 / 40 行业已答≥90%）

- ⚠ 以下 11 个行业已答不足应有 90%，为日志轮转残值，以 docs/coverage-full/<行业>.md 分片报表为准：`cybersecurity` `logistics` `marketing` `media` `streaming` `supplychain` `telecom` `telehealth` `travel` `university` `utilities`

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
| streaming ⚠ | 12.5% | 21 | 168 | 144 | 93.5% | 157 | 1 |
| supplychain ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| telecom ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| telehealth ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| travel ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| university ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| utilities ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |

## dimension

| 维度 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| actionability | 93.2% | 246 | 264 | 0 | 59.8% | 158 | 1 |
| billing-dispute | 92.3% | 240 | 260 | 8 | 96.5% | 251 | 3 |
| category | 73.5% | 202 | 275 | 8 | 98.9% | 272 | 2 |
| compliance | 91.5% | 227 | 248 | 8 | 98.8% | 245 | 0 |
| content-moderation | 79.5% | 210 | 264 | 0 | 96.6% | 255 | 1 |
| data-access | 88.2% | 240 | 272 | 8 | 98.9% | 269 | 0 |
| escalation | 79.9% | 211 | 264 | 8 | 98.9% | 261 | 3 |
| financial-advice | 82.4% | 229 | 278 | 8 | 91.7% | 255 | 6 |
| fraud | 72.0% | 190 | 264 | 8 | 95.1% | 251 | 2 |
| intent | 97.9% | 235 | 240 | 0 | 98.3% | 236 | 4 |
| language | 92.9% | 249 | 268 | 8 | 99.6% | 267 | 1 |
| medical-triage | 75.7% | 206 | 272 | 8 | 99.3% | 270 | 2 |
| next-action | 83.1% | 226 | 272 | 8 | 88.6% | 241 | 14 |
| pii | 97.1% | 264 | 272 | 8 | 91.2% | 248 | 3 |
| priority | 71.5% | 186 | 260 | 8 | 81.2% | 211 | 1 |
| quality | 88.2% | 240 | 272 | 8 | 73.5% | 200 | 1 |
| risk-level | 66.5% | 181 | 272 | 8 | 75.0% | 204 | 1 |
| routing | 96.2% | 254 | 264 | 8 | 97.3% | 257 | 2 |
| safety | 72.5% | 177 | 244 | 0 | 100.0% | 244 | 0 |
| sentiment | 96.2% | 254 | 264 | 8 | 93.9% | 248 | 16 |
| spam | 85.2% | 225 | 264 | 8 | 93.2% | 246 | 16 |
| topic | 72.0% | 190 | 264 | 0 | 84.5% | 223 | 2 |
| toxicity | 97.1% | 270 | 278 | 8 | 97.8% | 272 | 1 |
| urgency | 100.0% | 250 | 250 | 0 | 99.6% | 249 | 1 |

## miss 模板（ours 未命中，按频次降序）

| 模板 | miss 数 | 涉及行业 |
| --- | ---: | ---: |
| risk-level | 83 | 33 |
| topic | 74 | 33 |
| safety | 67 | 31 |
| priority | 66 | 32 |
| fraud | 66 | 32 |
| category | 65 | 33 |
| medical-triage | 58 | 33 |
| content-moderation | 54 | 32 |
| escalation | 45 | 31 |
| financial-advice | 41 | 29 |
| next-action | 38 | 31 |
| spam | 31 | 25 |
| data-access | 24 | 20 |
| quality | 24 | 19 |
| actionability | 18 | 14 |
| compliance | 13 | 12 |
| billing-dispute | 12 | 12 |
| language | 11 | 11 |
| intent | 5 | 5 |
| routing | 2 | 2 |
| sentiment | 2 | 2 |
