#!/bin/bash
# 超时护栏：在独立进程组里运行一条命令，超时时向整组发信号并等待回收。
#
# 为什么必须按「进程组」而不是「pid」终止：管线会 fork ./deploy/deploy.sh，
# deploy 下面还有 ssh / rsync / curl。只 SIGTERM 主进程时，已 fork 出去的
# deploy 会继续跑完、切换线上软链并重载 nginx，于是 cron 记「管线失败」、
# 线上却是新版本，发布记录与线上状态对不上（2026-11-06、11-07 连续两轮）。
#
# 安全约束：只有子进程自己就是组长、且组号不等于本脚本所在进程组时，才按组发
# 信号。否则退回只杀 pid——宁可不彻底，也不能把 cron 自己所在的组杀掉。
#
# 用法：run-with-timeout.sh <timeout-seconds> <command> [args...]
# 退出码：命令自身的退出码；超时按 timeout(1) 约定返回 124。
set -uo pipefail

if [[ "$#" -lt 2 ]]; then
  echo "[timeout-guard] 用法: run-with-timeout.sh <timeout-seconds> <command> [args...]" >&2
  exit 2
fi

TIMEOUT="$1"
shift

OWN_PGID="$(ps -o pgid= -p $$ 2>/dev/null | tr -d '[:space:]')"

# 作业控制让后台任务自成一个进程组（bash 3.2 也有；不依赖 setsid）。
set -m
"$@" &
CHILD_PID=$!
set +m

CHILD_PGID="$(ps -o pgid= -p "$CHILD_PID" 2>/dev/null | tr -d '[:space:]')"

# 只有「子进程是组长」且「组号不是本脚本的组」才按组发信号。
SIGNAL_GROUP=0
if [[ -n "$CHILD_PGID" && "$CHILD_PGID" == "$CHILD_PID" && "$CHILD_PGID" != "$OWN_PGID" ]]; then
  SIGNAL_GROUP=1
else
  echo "[timeout-guard] WARN 无法确认独立进程组（child pgid=${CHILD_PGID:-?} own pgid=${OWN_PGID:-?}），退回只终止 pid" >&2
fi

# 发信号：按组时连带 deploy/ssh 等孙进程一起终止。
signal_tree() {
  local sig="$1"
  if [[ "$SIGNAL_GROUP" == "1" ]]; then
    kill -"$sig" -"$CHILD_PGID" 2>/dev/null
  fi
  # 无论是否按组，都补一发单 pid：组模式漏掉时至少有主进程被请求退出。
  kill -"$sig" "$CHILD_PID" 2>/dev/null
}

tree_alive() {
  kill -0 "$CHILD_PID" 2>/dev/null && return 0
  [[ "$SIGNAL_GROUP" == "1" ]] && kill -0 -"$CHILD_PGID" 2>/dev/null && return 0
  return 1
}

WAITED=0
while kill -0 "$CHILD_PID" 2>/dev/null; do
  if [[ "$WAITED" -ge "$TIMEOUT" ]]; then
    echo "[timeout-guard] 运行超过 ${TIMEOUT}s，终止（pid ${CHILD_PID}，pgid ${CHILD_PGID:-?}，按组=${SIGNAL_GROUP}）" >&2
    signal_tree TERM
    # 等整组退出：只 wait 主进程会漏掉仍在跑的 deploy.sh。
    GRACE=0
    while tree_alive && [[ "$GRACE" -lt 10 ]]; do
      sleep 1
      GRACE=$((GRACE + 1))
    done
    if tree_alive; then
      echo "[timeout-guard] 尚未退出，发送 SIGKILL（已等待 ${GRACE}s）" >&2
      signal_tree KILL
      sleep 2
      # SIGKILL 之后复核：仍存活必须留痕，不能假装已回收。
      if tree_alive; then
        echo "[timeout-guard] ERROR SIGKILL 后仍有进程存活（pid ${CHILD_PID}，pgid ${CHILD_PGID:-?}），需人工清理" >&2
      else
        echo "[timeout-guard] 已强制回收整组" >&2
      fi
    else
      echo "[timeout-guard] 已回收整组（SIGTERM，等待 ${GRACE}s）" >&2
    fi
    wait "$CHILD_PID" 2>/dev/null
    exit 124
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

wait "$CHILD_PID"
exit $?
