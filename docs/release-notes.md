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

### 复跑结果（2026-11-08 09:30 cron）

当日 09:30 那轮 cron 自然跑通，四个观察项中前三项已由实测数据确认：

- `gate1-stale-override` / `gate1` 255s → `gate2` 389s → **`released` 719s**，全程在 900s 预算内，未触发超时护栏。
- `pending` 由 115 回落至 **0**，`last_release` 与 `eco_last_release` 同步前移到 `2026-11-08T01:42:01.413Z`——发布会话真正走完了闭环，不再出现「cron 记失败、线上已换版」的错位。
- 提交 `63b4e63 chore(eco): 生态数据自动刷新 (2026-11-08)` 正常入库。
- 主机上无残留 `deploy.sh` / `rsync` / `ssh` 子进程（`ps` 复核）。
- 线上抽测 `/en/`、`/en/briefs/`、`/en/topics/ai-software-downloads/`、`/zh/topics/ai-software-downloads/` 均返回 `code=200 rc=0`，健康探测脚本在真实 nginx 上按预期工作。
- **有界重试在真实部署中命中**：`cron.log` 记 `https://www.jevcode.ai/de/briefs/cov-ecommerce-escalation-02/ -> HTTP 000，1s 后第 2 次探测` → `第 2 次探测恢复 200` → `发布后校验通过` → `部署完成：20261108-013633`。即 reload 瞬断确实发生过，但不再被误判为失败、不再触发自动回滚。
- IndexNow 差集同步收敛：`sitemap` 17141 条 URL 全部在 `.indexnow-state.json` 中留有记录，待提交 **0**。

## 2026-11-11 — 未提交文件触发脏区前置检查，日更连续 3 轮跳过（`59fe1c9`）

### 现象

- 11-08 复跑成功后，11-09 / 11-10 / 11-11 三天 09:30 cron 均**整轮跳过**，三天无 `2026-11-{09,10,11}.jsonl`（爬虫根本没启动），无 `chore(eco)` 提交。
- 内容停在 11-08：`briefs` / `briefs-i18n` 均为 900，数据文件最后写入 11-08 09:33。
- 棘轮「连续未发布第 1/2/3 轮」，11-11 写入 `ALERT-2026-11-11.txt`「连续 3 轮未成功发布：内容已 3 天未更新」，飞书已投递；巡检同时报「最新案例 2026-11-08，距今 3 天（阈值 2 天）」。
- GitHub core 额度 4950 / 4998 / 4983，充足，非限流。

### 根因

工作区存在 ` M scripts/test-health-probe.mjs`——上一轮为验证「首次连接错误 `000` 后恢复」新增的测试用例（本身 `6 tests / 6 pass / 0 fail`），但只跑了测试、没有提交。

`scripts/pipeline-cron.sh:204-225` 的前置检查把 `git status --porcelain` 交给 `scripts/pipeline-guard.mjs`；该文件属于「会进入发布的改动」，guard 返回 2，于是整轮 `exit 0` 跳过并写 `SKIPPED-*.txt`。管线不会自行清理工作区，因此只要文件不提交，每轮都会重复跳过——这是设计上的保守保护（避免把手工改动发布出去），不是新的代码缺陷。

与 11-06/11-07 的超时护栏事故无关，`a2ffbeb` / `8a86ca1` 的修复在 11-08 已被真实部署验证有效。

### 处置与验证

- commit `59fe1c9` 提交该测试文件，工作区恢复干净。
- `node --test scripts/test-health-probe.mjs` → `6 pass / 0 fail`；`npm test` → `299 pass / 0 fail`（退出码 0）。
- `git status --porcelain` → 0 行；按 cron 真实路径复算 `git status --porcelain | node scripts/pipeline-guard.mjs` → `GUARD_RC=0`（此前为 2），11-12 09:30 不会再被拦。
- `ALERT-2026-11-11.txt` 与 `SKIPPED-11-{09,10,11}.txt` 保留为历史记录；cron 下一轮成功发布时会「棘轮归零，旧告警已清理」。历史 3 天不自动补发。

### 观察项

- 11-12 09:30 应重新出现 `released` 事件、`chore(eco)` 提交、`pending` 回落与 IndexNow 提交；若仍跳过，说明存在第二处脏区或 guard 之外的新阻塞。
- 流量数据：仓库内**无** GA / gtag / Plausible / Umami 埋点，`.env` 无流量凭据，`deploy/nginx/jevcode.conf` 的 5 处 `access_log` 均为 `jevcode_timing` 计时日志且静态/接口 location 设 `access_log off`，本地无访问日志文件。PV / UV / 来源 / 搜索点击需到 VPS `/var/log/nginx/jevcode-*.log` 或 Search Console 查询；本地只能给收录面代理指标（`dist` 17161 页、sitemap 页面 URL 17140、IndexNow 已记录 17141 待提交 0、`llms.txt` 688 行）。
