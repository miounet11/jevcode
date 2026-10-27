#!/bin/zsh
# 全量 14400 条覆盖评测：60 行业每 2 个一行分片，串行跑 30 段。
# 每段约 480 条 = 60 批，90s 间隔约 90 分钟；总预算约 45 小时。
# 前置：本地 playground 跑在 127.0.0.1:8790，且 .env 已加载（对照 key 可用）。
set -e
mkdir -p docs/coverage-full
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry adtech --industry aerospace --sleep 90000 --out docs/coverage-full/adtech.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry agriculture --industry automotive --sleep 90000 --out docs/coverage-full/agriculture.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry banking --industry biotech --sleep 90000 --out docs/coverage-full/banking.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry construction --industry crm --sleep 90000 --out docs/coverage-full/construction.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry crypto --industry cybersecurity --sleep 90000 --out docs/coverage-full/crypto.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry dental --industry devtools --sleep 90000 --out docs/coverage-full/dental.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry ecommerce --industry edtech --sleep 90000 --out docs/coverage-full/ecommerce.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry education --industry energy --sleep 90000 --out docs/coverage-full/education.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry fintech --industry fitness --sleep 90000 --out docs/coverage-full/fintech.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry foodbev --industry gaming --sleep 90000 --out docs/coverage-full/foodbev.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry government --industry healthcare --sleep 90000 --out docs/coverage-full/government.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry hospitality --industry hr --sleep 90000 --out docs/coverage-full/hospitality.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry insurance --industry legal --sleep 90000 --out docs/coverage-full/insurance.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry lending --industry logistics --sleep 90000 --out docs/coverage-full/lending.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry manufacturing --industry maritime --sleep 90000 --out docs/coverage-full/manufacturing.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry marketing --industry marketplace --sleep 90000 --out docs/coverage-full/marketing.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry media --industry nonprofit --sleep 90000 --out docs/coverage-full/media.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry paas --industry payments --sleep 90000 --out docs/coverage-full/paas.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry payroll --industry pharma --sleep 90000 --out docs/coverage-full/payroll.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry pharmacy --industry procurement --sleep 90000 --out docs/coverage-full/pharmacy.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry realestate --industry recruiting --sleep 90000 --out docs/coverage-full/realestate.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry restaurant --industry retail --sleep 90000 --out docs/coverage-full/restaurant.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry rideshare --industry robotics --sleep 90000 --out docs/coverage-full/rideshare.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry saas --industry semiconductor --sleep 90000 --out docs/coverage-full/saas.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry streaming --industry supplychain --sleep 90000 --out docs/coverage-full/streaming.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry tax --industry telecom --sleep 90000 --out docs/coverage-full/tax.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry telehealth --industry transit --sleep 90000 --out docs/coverage-full/telehealth.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry travel --industry university --sleep 90000 --out docs/coverage-full/travel.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry utilities --industry veterinary --sleep 90000 --out docs/coverage-full/utilities.md
node scripts/eval-coverage.mjs --cases data/coverage-cases.json --industry warehouse --industry wealth --sleep 90000 --out docs/coverage-full/warehouse.md
echo "全量分片评测完成"
