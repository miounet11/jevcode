#!/bin/bash
# 发布后健康探测：对单个 URL 做有界重试，只重试「连接错误」和「服务端异常」。
#
# 为什么需要重试：nginx reload 期间会有一瞬间没有 worker 接连接，curl 拿到的是
# 连接错误（http_code=000）。单次探测会把「已经部署成功、只是撞上 reload 窗口」
# 记成失败，进而触发自动回滚，把新版本换掉——发布状态和线上事实再次对不上。
#
# 为什么只重试 000 和 5xx：
#   - 404/403 这类 4xx 是真实故障（路由缺失、权限没跟上），重试只是把失败推迟；
#   - 3xx 说明配置与预期不符，同样不该靠重试掩盖。
# 重试必须有界：部署本身有 900s 预算，无限等待会把「失败」变成「卡住」。
#
# 用法：health-probe.sh <url> [attempts] [base-delay-seconds]
# 环境变量：HEALTH_PROBE_ATTEMPTS / HEALTH_PROBE_BASE_DELAY / HEALTH_PROBE_TIMEOUT
# 退出码：最终探测到 200 记 0，否则记 1。最终 http_code 打印到 stdout。
set -uo pipefail

if [[ "$#" -lt 1 ]]; then
  echo "[health-probe] 用法: health-probe.sh <url> [attempts] [base-delay-seconds]" >&2
  exit 2
fi

URL="$1"
ATTEMPTS="${2:-${HEALTH_PROBE_ATTEMPTS:-3}}"
BASE_DELAY="${3:-${HEALTH_PROBE_BASE_DELAY:-1}}"
CURL_TIMEOUT="${HEALTH_PROBE_TIMEOUT:-15}"

is_retryable() {
  case "$1" in
    000) return 0 ;;
    5??) return 0 ;;
    *) return 1 ;;
  esac
}

attempt=1
code=""
while :; do
  # 不能用 `$(curl ... || echo 000)`：连接失败时 curl 自身仍会输出 `000`，
  # 再追加一个 `000` 就拼成 `000000`（2026-11-07 deploy 校验失败正是这个形态），
  # 后续的 5xx 判断与日志都会失真。改为先取 curl 退出码，再决定是否需要兜底。
  if raw=$(curl -s -o /dev/null -w '%{http_code}' -m "$CURL_TIMEOUT" "$URL" 2>/dev/null); then
    code="$raw"
  else
    code="${raw:-000}"
  fi
  [[ -n "$code" ]] || code=000
  # 防御历史脏值：无论来源如何，只要不是 3 位状态码就按连接错误处理。
  [[ "$code" =~ ^[0-9]{3}$ ]] || code=000

  if [[ "$code" == "200" ]]; then
    [[ "$attempt" -eq 1 ]] || echo "[health-probe] ${URL} 第 ${attempt} 次探测恢复 200" >&2
    printf '%s' "$code"
    exit 0
  fi

  if ! is_retryable "$code"; then
    echo "[health-probe] ${URL} -> HTTP ${code}（不可重试，立即判定失败）" >&2
    printf '%s' "$code"
    exit 1
  fi

  if [[ "$attempt" -ge "$ATTEMPTS" ]]; then
    echo "[health-probe] ${URL} -> HTTP ${code}，重试 ${ATTEMPTS} 次后仍失败" >&2
    printf '%s' "$code"
    exit 1
  fi

  # 指数退避，封顶 8s：只有 2~3 次重试时总等待仍是个位数秒级。
  delay=$((BASE_DELAY * (1 << (attempt - 1))))
  [[ "$delay" -le 8 ]] || delay=8
  echo "[health-probe] ${URL} -> HTTP ${code}，${delay}s 后第 $((attempt + 1)) 次探测" >&2
  [[ "$delay" -gt 0 ]] && sleep "$delay"
  attempt=$((attempt + 1))
done
