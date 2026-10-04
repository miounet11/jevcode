# JEV 全量覆盖评测总表

- 生成时间：2026-10-04T15:34:17.860Z
- 数据源：.data/runs/compare-log-shard1-adtech-backup.jsonl, .data/runs/compare-log-shard2-automotive-backup.jsonl, .data/runs/compare-log-shard3-construction-backup.jsonl, .data/runs/compare-log-shard12-full.jsonl, .data/runs/compare-log-shard5-pre-retry-backup.jsonl, .data/runs/compare-log-shard6-education-backup.jsonl, .data/runs/compare-log-shard7-fintech-backup.jsonl, .data/runs/compare-log-shard8-government-backup.jsonl, .data/runs/compare-log.jsonl
- 语料：7680 条 / 40 行业
- 总命中：**ours 87.9%**（2954/3360，出错 0）| peer 92.6%（3112/3360，出错 41）
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
| hospitality ⚠ | 89.3% | 67 | 75 | 0 | 88.0% | 66 | 8 |
| hr | 88.0% | 169 | 192 | 0 | 90.6% | 174 | 6 |
| insurance ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| legal ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| logistics ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| manufacturing ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| marketing ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| marketplace ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| media ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| nonprofit ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| paas ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| pharma ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| realestate ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
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
| actionability | 94.1% | 128 | 136 | 0 | 58.8% | 80 | 0 |
| billing-dispute | 96.9% | 154 | 159 | 0 | 96.9% | 154 | 1 |
| category | 79.5% | 124 | 156 | 0 | 99.4% | 155 | 1 |
| compliance | 95.6% | 130 | 136 | 0 | 98.5% | 134 | 0 |
| content-moderation | 79.4% | 108 | 136 | 0 | 97.8% | 133 | 0 |
| data-access | 91.2% | 124 | 136 | 0 | 100.0% | 136 | 0 |
| escalation | 82.0% | 105 | 128 | 0 | 99.2% | 127 | 1 |
| financial-advice | 86.2% | 137 | 159 | 0 | 95.6% | 152 | 0 |
| fraud | 76.6% | 98 | 128 | 0 | 91.4% | 117 | 6 |
| intent | 98.6% | 142 | 144 | 0 | 97.2% | 140 | 4 |
| language | 94.9% | 129 | 136 | 0 | 100.0% | 136 | 0 |
| medical-triage | 77.9% | 106 | 136 | 0 | 99.3% | 135 | 1 |
| next-action | 84.6% | 115 | 136 | 0 | 90.4% | 123 | 6 |
| pii | 100.0% | 136 | 136 | 0 | 89.7% | 122 | 1 |
| priority | 76.5% | 104 | 136 | 0 | 77.2% | 105 | 9 |
| quality | 91.9% | 125 | 136 | 0 | 75.0% | 102 | 0 |
| risk-level | 70.6% | 96 | 136 | 0 | 77.2% | 105 | 0 |
| routing | 99.2% | 127 | 128 | 0 | 97.7% | 125 | 1 |
| safety | 74.3% | 107 | 144 | 0 | 100.0% | 144 | 0 |
| sentiment | 99.3% | 135 | 136 | 0 | 99.3% | 135 | 1 |
| spam | 87.5% | 112 | 128 | 0 | 93.0% | 119 | 8 |
| topic | 69.1% | 94 | 136 | 0 | 84.6% | 115 | 1 |
| toxicity | 100.0% | 152 | 152 | 0 | 100.0% | 152 | 0 |
| urgency | 100.0% | 166 | 166 | 0 | 100.0% | 166 | 0 |

## miss 模板（ours 未命中，按频次降序）

| 模板 | miss 数 | 涉及行业 |
| --- | ---: | ---: |
| topic | 42 | 17 |
| risk-level | 40 | 17 |
| safety | 37 | 18 |
| priority | 32 | 17 |
| category | 32 | 17 |
| fraud | 30 | 16 |
| medical-triage | 30 | 17 |
| content-moderation | 28 | 17 |
| escalation | 23 | 15 |
| financial-advice | 22 | 15 |
| next-action | 21 | 16 |
| spam | 16 | 12 |
| data-access | 12 | 11 |
| quality | 11 | 8 |
| actionability | 8 | 6 |
| language | 7 | 7 |
| compliance | 6 | 6 |
| billing-dispute | 5 | 5 |
| intent | 2 | 2 |
| sentiment | 1 | 1 |
| routing | 1 | 1 |
