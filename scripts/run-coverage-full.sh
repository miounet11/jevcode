#!/bin/zsh
# 全量 7680 条覆盖评测：40 行业每 2 个一行分片，串行跑 20 段。
# 每段 384 条 = 48 批，90s 间隔约 71 分钟；总预算约 24 小时。
# 前置：本地 playground 跑在 127.0.0.1:8790，且 .env 已加载（对照 key 可用）。
set -e
mkdir -p docs/coverage-full
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry adtech --industry aerospace --sleep 90000 --out docs/coverage-full/adtech.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry automotive --industry banking --sleep 90000 --out docs/coverage-full/automotive.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry construction --industry crm --sleep 90000 --out docs/coverage-full/construction.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry cybersecurity --industry devtools --sleep 90000 --out docs/coverage-full/cybersecurity.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry ecommerce --industry edtech --sleep 90000 --out docs/coverage-full/ecommerce.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry education --industry energy --sleep 90000 --out docs/coverage-full/education.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry fintech --industry gaming --sleep 90000 --out docs/coverage-full/fintech.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry government --industry healthcare --sleep 90000 --out docs/coverage-full/government.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry hospitality --industry hr --sleep 90000 --out docs/coverage-full/hospitality.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry insurance --industry legal --sleep 90000 --out docs/coverage-full/insurance.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry logistics --industry manufacturing --sleep 90000 --out docs/coverage-full/logistics.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry marketing --industry marketplace --sleep 90000 --out docs/coverage-full/marketing.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry media --industry nonprofit --sleep 90000 --out docs/coverage-full/media.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry paas --industry pharma --sleep 90000 --out docs/coverage-full/paas.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry realestate --industry recruiting --sleep 90000 --out docs/coverage-full/realestate.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry restaurant --industry retail --sleep 90000 --out docs/coverage-full/restaurant.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry saas --industry streaming --sleep 90000 --out docs/coverage-full/saas.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry supplychain --industry telecom --sleep 90000 --out docs/coverage-full/supplychain.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry telehealth --industry travel --sleep 90000 --out docs/coverage-full/telehealth.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry university --industry utilities --sleep 90000 --out docs/coverage-full/university.md
echo "全量分片评测完成"
