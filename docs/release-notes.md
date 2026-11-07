# 发布记录

按时间倒序记录修复类与运维类发布，供发布核验与事后追踪。日常内容刷新（`chore(eco)`）不在此列。

## 2026-11-07 — 超时护栏按进程组终止（`a2ffbeb`）

### 现象

- 2026-11-06、11-07 两轮 cron 均无 `released` 事件，棘轮连续报「未成功发布」；11-07 写入 `ALERT-2026-11-07.txt`（退出码 124）。
- 同时线上站点实际已是新版本——发布记录与线上状态并存且互相矛盾。
- 11-06 日志尾部可直观点看到矛盾的成因：`[cron] 运行超过 900s，向管线（pid 30580）发送 SIGTERM` 之后，`[deploy] 解包并切换软链...` 仍在继续，并以 `[deploy] 部署完成` 收尾。
- 伴随表现：`pending` 积压 115 repos，`eco_last_release` 停在 11-04，IndexNow 停止提交（差集 1529 条 URL）。

### 根因

`scripts/pipeline-cron.sh` 的 900s 超时护栏只对管线主进程 `kill -TERM "$PIPE_PID"`。管线此时已 fork 出 `./deploy/deploy.sh`（其下还有 `ssh` / `rsync` / `curl`），主进程被终止不影响这棵子树，deploy 继续上传、切换 `current` 软链并 `systemctl reload nginx`。

于是 cron 以 124 记「管线失败」，线上却换了版本：既不是「没发布」，也不是「发布成功」，两边事实对不上。

### 改动

- 新增 `scripts/run-with-timeout.sh`：用 `set -m` 让子命令自成进程组，超时向**整组**发 `SIGTERM` → 等 10s → `SIGKILL`，并等待整组回收；退出码按 `timeout(1)` 约定保留 124。
  - 安全保护一：仅当子进程确为组长（`pgid == pid`）且组号不等于自身组号时才按组发信号，否则退回单 pid，避免误杀 cron 自身所在进程组。
  - 安全保护二：`SIGKILL` 后复核存活，仍存活则输出 `ERROR ... 需人工清理`，不假装已回收。
- `scripts/pipeline-cron.sh`：改调用护栏，`TIMED_OUT` 由退出码 124 判定。门 2 HOLD、失败告警、棘轮计数、飞书推送分支均保持原样。
- `scripts/test-ops-scripts.mjs`：新增 5 条回归，覆盖孙进程回收、退出码透传、缺参数退出 2、cron 接入形态、同组保护与 SIGKILL 后复核留痕。

### 验证

- 有效性对照：用只杀单 pid 的旧实现在同一用例下复现泄漏（`ALIVE=YES`），新护栏同用例 `RESULT=GRANDCHILD_REAPED` 且 `GUARD_RC=124`，证明回归用例能抓住该缺陷。
- `node --test scripts/test-ops-scripts.mjs` → 退出码 0，`fail 0`。
- `npm test` → `tests 291 / pass 291 / fail 0`。
- `npm run check` → 退出码 0。

### 后续观察项

- 超时终止后主机上不得残留 `deploy.sh`、`rsync` 或 `ssh` 子进程；若出现 `ERROR SIGKILL 后仍有进程存活`，按需人工清理。
- 下一轮 cron 应重新出现 `released` 事件，`eco_last_release` 前移，说明发布链路恢复闭环。
- `pending` 不再持续增长并随发布回落；若仍上涨，说明存在护栏之外的第二处中断。
- IndexNow 差集应在下一次成功发布后收敛。
