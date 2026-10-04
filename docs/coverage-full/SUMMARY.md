# JEV 全量覆盖评测总表

- 生成时间：2026-10-04T14:44:51.736Z
- 数据源：.data/runs/compare-log-shard1-adtech-backup.jsonl, .data/runs/compare-log-shard2-automotive-backup.jsonl, .data/runs/compare-log-shard3-construction-backup.jsonl, .data/runs/compare-log-shard12-full.jsonl, .data/runs/compare-log-shard5-pre-retry-backup.jsonl, .data/runs/compare-log-shard6-education-backup.jsonl, .data/runs/compare-log-shard7-fintech-backup.jsonl, .data/runs/compare-log-shard8-government-backup.jsonl, .data/runs/compare-log.jsonl
- 语料：7680 条 / 40 行业
- 总命中：**ours 88.0%**（2743/3118，出错 0）| peer 92.9%（2897/3118，出错 27）
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
| hospitality ⚠ | 100.0% | 5 | 5 | 0 | 100.0% | 5 | 0 |
| hr ⚠ | 100.0% | 20 | 20 | 0 | 100.0% | 20 | 0 |
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
| actionability | 94.5% | 121 | 128 | 0 | 59.4% | 76 | 0 |
| billing-dispute | 97.2% | 141 | 145 | 0 | 97.2% | 141 | 1 |
| category | 79.9% | 119 | 149 | 0 | 99.3% | 148 | 1 |
| compliance | 95.0% | 114 | 120 | 0 | 98.3% | 118 | 0 |
| content-moderation | 79.7% | 102 | 128 | 0 | 97.7% | 125 | 0 |
| data-access | 91.4% | 117 | 128 | 0 | 100.0% | 128 | 0 |
| escalation | 82.5% | 99 | 120 | 0 | 99.2% | 119 | 1 |
| financial-advice | 86.2% | 131 | 152 | 0 | 95.4% | 145 | 0 |
| fraud | 75.8% | 91 | 120 | 0 | 94.2% | 113 | 2 |
| intent | 99.3% | 135 | 136 | 0 | 97.1% | 132 | 4 |
| language | 95.0% | 114 | 120 | 0 | 100.0% | 120 | 0 |
| medical-triage | 78.1% | 100 | 128 | 0 | 99.2% | 127 | 1 |
| next-action | 83.6% | 107 | 128 | 0 | 89.8% | 115 | 6 |
| pii | 100.0% | 120 | 120 | 0 | 89.2% | 107 | 1 |
| priority | 77.5% | 93 | 120 | 0 | 81.7% | 98 | 1 |
| quality | 91.4% | 117 | 128 | 0 | 75.0% | 96 | 0 |
| risk-level | 71.1% | 91 | 128 | 0 | 78.1% | 100 | 0 |
| routing | 100.0% | 120 | 120 | 0 | 97.5% | 117 | 1 |
| safety | 75.0% | 96 | 128 | 0 | 100.0% | 128 | 0 |
| sentiment | 99.2% | 119 | 120 | 0 | 100.0% | 120 | 0 |
| spam | 87.5% | 105 | 120 | 0 | 92.5% | 111 | 8 |
| topic | 68.0% | 87 | 128 | 0 | 85.2% | 109 | 0 |
| toxicity | 100.0% | 145 | 145 | 0 | 100.0% | 145 | 0 |
| urgency | 100.0% | 159 | 159 | 0 | 100.0% | 159 | 0 |
