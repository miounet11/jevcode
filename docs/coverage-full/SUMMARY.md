# JEV 全量覆盖评测总表

- 生成时间：2026-10-05T00:20:27.029Z
- 数据源：.data/runs/compare-log-shard1-adtech-backup.jsonl, .data/runs/compare-log-shard2-automotive-backup.jsonl, .data/runs/compare-log-shard3-construction-backup.jsonl, .data/runs/compare-log-shard12-full.jsonl, .data/runs/compare-log-shard5-pre-retry-backup.jsonl, .data/runs/compare-log-shard6-education-backup.jsonl, .data/runs/compare-log-shard7-fintech-backup.jsonl, .data/runs/compare-log-shard8-government-backup.jsonl, .data/runs/compare-log-hospitality-backup.jsonl, .data/runs/compare-log-norotate.jsonl
- 语料：7680 条 / 40 行业
- 总命中：**ours 87.9%**（3088/3515，出错 0）| peer 81.7%（2870/3515，出错 451）
- ⚠ 已答不足应有 90% 的行业行为日志轮转残值，以 docs/coverage-full/<行业>.md 分片报表为准

## industry

| 行业 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adtech | 86.5% | 166 | 192 | 0 | 93.8% | 180 | 0 |
| aerospace | 85.9% | 165 | 192 | 0 | 93.2% | 179 | 0 |
| automotive | 87.5% | 168 | 192 | 0 | 93.2% | 179 | 0 |
| banking | 85.4% | 164 | 192 | 0 | 92.2% | 177 | 0 |
| construction | 85.9% | 165 | 192 | 0 | 94.8% | 182 | 0 |
| crm | 88.5% | 170 | 192 | 0 | 93.8% | 180 | 0 |
| cybersecurity ⚠ | 84.5% | 87 | 103 | 0 | 89.3% | 92 | 0 |
| devtools | 90.1% | 173 | 192 | 0 | 92.2% | 177 | 0 |
| ecommerce | 87.0% | 167 | 192 | 0 | 93.8% | 180 | 0 |
| edtech | 88.5% | 170 | 192 | 0 | 93.2% | 179 | 2 |
| education | 88.5% | 170 | 192 | 0 | 93.2% | 179 | 0 |
| energy | 88.0% | 169 | 192 | 0 | 93.2% | 179 | 1 |
| fintech | 87.0% | 167 | 192 | 0 | 93.8% | 180 | 0 |
| gaming | 88.5% | 170 | 192 | 0 | 94.3% | 181 | 0 |
| government | 87.0% | 167 | 192 | 0 | 81.8% | 157 | 24 |
| healthcare | 88.5% | 170 | 192 | 0 | 94.3% | 181 | 0 |
| hospitality | 87.0% | 160 | 184 | 0 | 0.0% | 0 | 184 |
| hr | 88.0% | 169 | 192 | 0 | 0.0% | 0 | 192 |
| insurance ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| legal ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| logistics ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| manufacturing ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| marketing ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| marketplace ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| media ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| nonprofit ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| paas ⚠ | 84.6% | 11 | 13 | 0 | 38.5% | 5 | 8 |
| pharma ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| realestate ⚠ | 93.0% | 40 | 43 | 0 | 7.0% | 3 | 40 |
| recruiting ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| restaurant ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| retail ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| saas ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| streaming ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| supplychain ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| telecom ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| telehealth ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| travel ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| university ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| utilities ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |

## dimension

| 维度 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| actionability | 92.8% | 141 | 152 | 0 | 50.0% | 76 | 24 |
| billing-dispute | 96.4% | 160 | 166 | 0 | 83.1% | 138 | 25 |
| category | 78.5% | 128 | 163 | 0 | 89.6% | 146 | 17 |
| compliance | 95.8% | 138 | 144 | 0 | 81.9% | 118 | 24 |
| content-moderation | 79.2% | 114 | 144 | 0 | 86.8% | 125 | 16 |
| data-access | 91.0% | 131 | 144 | 0 | 88.9% | 128 | 16 |
| escalation | 82.4% | 112 | 136 | 0 | 87.5% | 119 | 17 |
| financial-advice | 86.1% | 143 | 166 | 0 | 86.1% | 143 | 16 |
| fraud | 76.6% | 98 | 128 | 0 | 88.3% | 113 | 10 |
| intent | 98.7% | 150 | 152 | 0 | 81.6% | 124 | 28 |
| language | 94.9% | 129 | 136 | 0 | 88.2% | 120 | 16 |
| medical-triage | 77.8% | 112 | 144 | 0 | 88.2% | 127 | 17 |
| next-action | 84.7% | 122 | 144 | 0 | 79.9% | 115 | 22 |
| pii | 100.0% | 136 | 136 | 0 | 78.7% | 107 | 17 |
| priority | 76.5% | 104 | 136 | 0 | 72.1% | 98 | 17 |
| quality | 92.4% | 133 | 144 | 0 | 66.7% | 96 | 16 |
| risk-level | 70.8% | 102 | 144 | 0 | 69.4% | 100 | 16 |
| routing | 99.3% | 135 | 136 | 0 | 86.0% | 117 | 17 |
| safety | 74.3% | 113 | 152 | 0 | 84.2% | 128 | 24 |
| sentiment | 99.3% | 135 | 136 | 0 | 88.2% | 120 | 16 |
| spam | 88.2% | 120 | 136 | 0 | 81.6% | 111 | 24 |
| topic | 69.4% | 100 | 144 | 0 | 75.7% | 109 | 16 |
| toxicity | 100.0% | 159 | 159 | 0 | 89.9% | 143 | 16 |
| urgency | 100.0% | 173 | 173 | 0 | 86.1% | 149 | 24 |

## miss 模板（ours 未命中，按频次降序）

| 模板 | miss 数 | 涉及行业 |
| --- | ---: | ---: |
| topic | 44 | 18 |
| risk-level | 42 | 18 |
| safety | 39 | 19 |
| category | 35 | 18 |
| priority | 32 | 17 |
| medical-triage | 32 | 18 |
| fraud | 30 | 16 |
| content-moderation | 30 | 18 |
| escalation | 24 | 16 |
| financial-advice | 23 | 16 |
| next-action | 22 | 17 |
| spam | 16 | 12 |
| data-access | 13 | 12 |
| quality | 11 | 8 |
| actionability | 11 | 8 |
| language | 7 | 7 |
| compliance | 6 | 6 |
| billing-dispute | 6 | 6 |
| intent | 2 | 2 |
| sentiment | 1 | 1 |
| routing | 1 | 1 |
