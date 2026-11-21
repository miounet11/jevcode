# 发布记录

按时间倒序记录修复类与运维类发布，供发布核验与事后追踪。日常内容刷新（`chore(eco)`）不在此列。

## 2026-11-21 — P1 安全、计费准确性与 Nginx 真实 IP 加固

### 改动

- **消除 `/v1/judge` 与 `/api/try` 并发超扣竞态（TOCTOU）**：`server/accounts.mjs` 新增 `BEGIN IMMEDIATE` 原子预扣 `reserveInputTokens()` 与按精确行 id 退款 `refundEntry(entryId)`；`server/playground.mjs` 改为先预扣再调上游、失败精确回退。
- **审计字段幂等迁移**：为 `ledger` 补 `key_id` 列及索引 `idx_ledger_key`，为 `api_keys` 补 `last_used_at` 列并在 `resolveKey()` 自动刷新；兼容存量老库自动迁移。
- **修复 `/v1/judge` 默认落盘隐私风险**：程序化 `/v1/judge` 默认不再写入公开可读的 `/var/www/jevcode/shared/runs/`（仅显式 `share: true` 才落盘），且 `GET /api/runs/:id` 剥离内部 `userId`。
- **认证与限频加固**：`server/auth.mjs` 补充基于 libuv 线程池的异步 `scrypt` 方法（`registerAsync` / `loginAsync` / `changePasswordAsync`），避免高并发登录阻塞事件循环；注册后直接签发会话避免重复计算两次 scrypt；接入 `POST /api/auth/password` 改密接口；会话 Cookie 在生产/HTTPS 反代下强制带 `Secure`；新增有界自动清理滑动窗口限频器（单 Key `/v1/judge` RPM 默认 120、认证写接口 IP RPM 默认 30，并替换无界内存 Map）。
- **Nginx 还原 Cloudflare 真实 IP + `/topics` 裸路径跳转**：`deploy/nginx/jevcode.conf` 在 `www` 与 `api` 两个 `server` 块中配置全部 Cloudflare IPv4/IPv6 `set_real_ip_from` 与 `real_ip_header CF-Connecting-IP`，并补齐 `/topics` 裸路径 302；`playground.mjs` 优先读取 nginx 覆写的 `X-Real-IP`。
- **后端同步脚本与测试**：新增 `deploy/sync-playground.sh` 与 `scripts/test-playground-security.mjs`，更新 `deploy/ACCOUNTS-DEPLOY.md`。

### 验证

- `npm test`：**309 / 309 通过**（`fail 0`）；`npm run test:e2e`：**64 通过 / 0 失败**；`npm run check`：`0 errors`。
- 同步至生产 `23.95.243.52` 并重载 nginx 后，验证 `/health`、`/api/auth/me`、`/topics/` 302、数据库迁移与 `jevcode-timing.log` 真实客户端 IP。

## 2026-11-21 — 解除连续 9 天停更自锁：去重复构建、超时自愈、消告警刷屏与内容坏值清理

### 现象

- 2026-11-13 09:30 cron 在 `[deploy] 解包并切换软链...` 阶段击穿 900s 超时护栏（退出码 124），跳过发布后探针、未清 `pending`、未提交 IndexNow（但远端软链实际已切至 `20261113-014009`）。
- 2026-11-14 09:30 cron 跑完 `fetch-ecosystem.mjs` 后在支线抓取阶段再次击穿 900s 超时（退出码 124），被 `SIGTERM` 按组强杀，未执行 `restoreFetched()`，在工作区留下 `M src/data/ecosystem.ts`。
- 2026-11-15 ~ 11-21 连续 7 天因工作区脏文件触发 `pipeline-guard.mjs` 退出 2，整轮跳过并连写 `ALERT`（棘轮累积至第 9 轮）。
- 伴随问题：
  - `.research/pipeline-logs/cron.log` 无轮转，且 `astro.config.mjs` 的冗余 `i18n.fallback` 每次构建产生约 12.7 万条 `Could not render` 路由冲突告警，日志膨胀至 **529 MB**（338 万行）。
  - 本机 `daily-report.mjs` crontab 未加载 `.env`，`FEISHU_WEBHOOK` 始终为空，日报每日静默落盘不发飞书。
  - 11-13 提交带入 `briefs-i18n.json` 坏值（`zh` 缺 `cov-devtools-safety-01`、43 条 `ja` `question` 189 字符提示词回显、36 条 `zh` `question` 提示词回显及 19 条多语种回显/拒答），导致 `content-check` 与 `npm test` 持续标红。

### 根因

1. **双重构建**：`scripts/pipeline.mjs` 阶段 4 已运行完整 `npm run build`（18,122 页约 2.5–3 分钟），阶段 6 调 `./deploy/deploy.sh` 时后者无条件再跑一遍 `npm run build`，直接吃掉近 6 分钟预算。
2. **超时无自愈**：`run-with-timeout.sh` 强杀进程组后，`pipeline-cron.sh` 失败分支没有清理本轮写入的白名单抓取文件，导致单次超时永久自锁。
3. **支线抓取无超时**：`fetch-jev-builds.mjs` / `build-jev-cards.mjs` 的 `fetch()` 与 `pipeline.mjs` 中可选支线 `execSync` 均无超时限制，单点挂死会拖垮整轮 900s 预算。
4. **译文校验松于内容门禁**：`scripts/translate-briefs.py` 此前只按 `BODY_MAX * 1.5` 校验长度（未按 `question` 单独限制），且只匹配英文逗号分隔的 `"TypeSafe, System One"`，漏掉中文顿号、破折号列表回显及 `KI-Assistent` 拒答。

### 改动

- `deploy/deploy.sh` & `scripts/pipeline.mjs`：支持 `--skip-build` / `SKIP_BUILD=1`，管线部署复用阶段 4 已校验的 `dist/`；并为 `refreshBuilds/Community/Lab/Briefs/Jev` 增加单步超时。
- `scripts/fetch-jev-builds.mjs` & `scripts/build-jev-cards.mjs`：为 `fetch()` 补充 `AbortSignal.timeout`。
- `scripts/lib/restore-fetched.mjs` & `scripts/pipeline-cron.sh`：失败/超时分支自动还原 `FETCHED_FILES` 白名单脏文件（若存在未推送的本轮自动提交一并撤销，绝不碰白名单外手工改动或已推送提交）；增加 `rotate_log`（>5MB 自动 `copytruncate + gzip` 保留 3 份）。
- `scripts/daily-report-cron.sh` & `scripts/pipeline-cron.sh --install`：日报改走包装脚本加载 `.env`，并纳入 `--install` 统一管理。
- `astro.config.mjs`：移除冗余的 `i18n.fallback`（全站多语言及文档回退已在 `[lang]/[...slug].astro` 显式生成），消除每次构建 ~12.7 万条 `Could not render` 告警。
- `scripts/translate-briefs.py` & `src/data/briefs-i18n.json`：按字段对齐 `QUESTION_MAX` / `BODY_MAX`、拦截多格式提示词回显与模型拒答，并修复存量 1 条缺译 + 98 条回显/拒答坏值。
- `scripts/test-ops-scripts.mjs`：补 4 条回归用例覆盖跳过构建、超时自愈三场景、日志轮转/日报 `.env` 接入与网络超时保护。

### 验证

- `node scripts/lib/restore-fetched.mjs` 实测还原 `src/data/ecosystem.ts`。
- 压缩截断 529 MB `cron.log`（保留末 2,000 行于 `cron.log.1.gz`）并重装本机 3 条 crontab 任务。
- `npm run build`：退出 0，总耗时 **115s**，`Could not render` 告警 **0** 条，`18121 pages (18101 indexable, 20 noindex), sitemap 18101`，`check-seo: OK`。
- `node scripts/content-check.mjs`：`硬问题 0，软问题 0`；`npm test`：**303 / 303 通过（fail 0）**；`npm run check`：0 errors。


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
