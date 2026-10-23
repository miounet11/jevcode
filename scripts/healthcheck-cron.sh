#!/bin/bash
# 每日巡检：站点可用性与「日更是否还在发」。
#
# 与 pipeline-cron.sh 分开，理由见 pipeline-cron.sh 的 HEALTH_LINE 注释：
# 管线自身挂掉时，附着其后的巡检不会执行，而这恰恰是最该被发现的情况。
#
# 安装：bash scripts/pipeline-cron.sh --install（同时装上本任务）

set -uo pipefail

REPO="/Volumes/MobileDrive/devpc/jevcode"
LOG_DIR="$REPO/.research/pipeline-logs"
export PATH="/Library/Developer/CommandLineTools/usr/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || exit 1
mkdir -p "$LOG_DIR"

echo "===== $(date -u +%FT%TZ) healthcheck ====="

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

FAILED=0

# 1) 服务与端点。本机是 macOS，没有 systemd，也没有跑 playground/intake，
#    所以清单由 .env 显式给出（见 .env 的 HEALTHCHECK_* 段）。
if ! node scripts/healthcheck.mjs; then
  FAILED=1
fi

# 2) 日更是否还在发。healthcheck 只看「服务活着」，看不出发不出去——
#    10-18~10-22 连续 5 天整轮跳过，站点一直是 200，没有任何告警。
#    这里按最新一份案例的发布日期判断：超过 STALE_DAYS 天就报。
# 日更是每日任务，停 2 天就说明至少漏了一轮，该报。默认 3 天会把「昨天没发、
# 今天还没到点」也算正常，实测 10-19 的内容在 10-22 恰好卡在边界上没报出来。
STALE_DAYS="${BRIEF_STALE_DAYS:-2}"
latest="$(node -e '
const b=require("./src/data/daily-briefs.json");
const d=b.map(x=>x.published).sort();
process.stdout.write(d[d.length-1] ?? "");
' 2>/dev/null || true)"

if [[ -z "$latest" ]]; then
  echo "[healthcheck] 无法读取案例发布日期"
  node scripts/notify-feishu.mjs "日更检查失败：读不到案例数据" \
    "src/data/daily-briefs.json 无法解析出 published 字段。
工作目录：$REPO" || true
  FAILED=1
else
  age_days="$(node -e '
const latest=process.argv[1];
const t=Date.parse(latest+"T00:00:00Z");
process.stdout.write(String(Math.floor((Date.now()-t)/86400000)));
' "$latest")"
  echo "[healthcheck] 最新案例 ${latest}，距今 ${age_days} 天（阈值 ${STALE_DAYS} 天）"
  if [[ "$age_days" -gt "$STALE_DAYS" ]]; then
    node scripts/notify-feishu.mjs "日更已停 ${age_days} 天" \
      "最新案例仍停在 ${latest}，超过 ${STALE_DAYS} 天阈值。
常见原因：
1. 工作区有未提交改动 → cron 整轮跳过（看 .research/pipeline-logs/SKIPPED-*.txt）
2. build/测试失败 → 看 ALERT-*.txt 与 cron.log
3. 判定服务（CLAVUE_URL）不可用
排查：tail -50 $LOG_DIR/cron.log" || true
    FAILED=1
  fi
fi

# 3) 内容质量。前面两条只能回答「有没有在发」，回答不了「发出来的东西对不对」：
#    标题重复会让两个页面抢同一个 title，译文缺失会静默回退英文并 noindex。
#    这里用 --json 拿结构化结果，失败原因直接进飞书，不用人再登机器翻日志。
CONTENT_JSON="$(node scripts/content-check.mjs --json 2>/dev/null || true)"
if [[ -z "$CONTENT_JSON" ]]; then
  echo "[healthcheck] content-check 没有输出（脚本异常）"
  node scripts/notify-feishu.mjs "内容校验脚本异常" \
    "node scripts/content-check.mjs --json 无输出。
工作目录：$REPO
排查：node scripts/content-check.mjs 看报错" || true
  FAILED=1
else
  CONTENT_SUMMARY="$(printf '%s' "$CONTENT_JSON" | node scripts/lib/content-summary.mjs 2>/dev/null || true)"

  if [[ "$CONTENT_SUMMARY" == "OK" ]]; then
    echo "[healthcheck] 内容校验通过"
  else
    echo "[healthcheck] 内容校验未通过"
    node scripts/notify-feishu.mjs "内容质量校验未通过" \
      "$CONTENT_SUMMARY

工作目录：$REPO
排查：node scripts/content-check.mjs
修完存量缺口可跑 --update-baseline 收紧基线" || true
    FAILED=1
  fi
fi

if [[ "$FAILED" == "0" ]]; then
  echo "[healthcheck] 全部正常"
  exit 0
fi
echo "[healthcheck] 有异常，已尝试推送飞书"
exit 1
