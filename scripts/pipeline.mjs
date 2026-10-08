#!/usr/bin/env node
/**
 * 管线调度器：抓取 → Jev 门 1（该不该发/发哪里）→ 提交 → 构建 →
 * Jev 门 2（发布是否合格）→ 部署 → 记录。
 *
 * 两级 Jev 门设计（Jev 轮 9 判定 two_stage 0.95）：
 *   门 1（intake）：变化是否值得发布？
 *   门 2（release）：组装好的 release 是否合格上线？
 *
 * 退出码（cron 依赖它区分「按设计不发布」与「故障」）：
 *   0  正常结束，含门 1 HOLD、累积未达阈值等按设计不发布的路径
 *   1  故障：机制检查失败（build/check/link）或判定后端调用失败
 *   2  门 2 HOLD：内容经判定不值得发布，非故障
 *
 * 用法：node scripts/pipeline.mjs [--dry-run] [--skip-fetch]
 *   --dry-run    跑全流程但不 commit/不 deploy（验证用）
 *   --skip-fetch 跳过抓取（调试门与部署段）
 *
 * 环境变量：
 *   CLAVUE_API_KEYS  本地 clavue-jev 判定 key（逗号分隔，默认后端）
 *   CLAVUE_URL       判定服务地址（默认 https://api.clavue.com/v1/judge）
 *   JUDGE_BACKEND    clavue（默认）| jev（需 TYPESAFE_API_KEY）
 *   GITHUB_TOKEN     可选，抓取限流用
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const DRY = process.argv.includes('--dry-run');
const SKIP_FETCH = process.argv.includes('--skip-fetch');
const PENDING_FILE = '.research/pipeline-state/pending.json';

// 门控后端：默认本地 clavue-jev（Jev 余额 402 时无缝切换）。
//   JUDGE_BACKEND=jev    用 TypeSafe Jev（需 TYPESAFE_API_KEY）
//   JUDGE_BACKEND=clavue 用本地 clavue-jev（需 CLAVUE_API_KEYS，默认）
const JUDGE_BACKEND = process.env.JUDGE_BACKEND ?? 'clavue';
const CLAVUE_URL = process.env.CLAVUE_URL ?? 'https://api.clavue.com/v1/judge';
const CLAVUE_KEYS = (process.env.CLAVUE_API_KEYS ?? '').split(',').filter(Boolean);
if (JUDGE_BACKEND === 'clavue' && CLAVUE_KEYS.length === 0) {
  console.error('缺少 CLAVUE_API_KEYS（本地 judge 后端）');
  process.exit(1);
}
if (JUDGE_BACKEND === 'jev' && !process.env.TYPESAFE_API_KEY) {
  console.error('缺少 TYPESAFE_API_KEY（Jev 后端）');
  process.exit(1);
}
let keyCursor = 0;

const log = [];
const t0 = Date.now();
function say(msg) {
  console.log(`[pipeline] ${msg}`);
  log.push(msg);
}

/** 抓取会写回这些【已跟踪】文件；非发布路径必须全部还原，否则脏工作区
 *  会让 cron 的脏区保护在下一轮永久跳过（自锁死循环，实测复现）。
 *  动态卡片的两个产物同样由抓取阶段写入，必须一起还原。 */
const FETCHED_FILES = [
  'src/data/ecosystem.ts',
  'src/data/community.ts',
  'data/builds/cards.json',
  'public/data/jev-cards.json',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
];
/** 允许进入自动提交的路径。其余工作区改动留在原地，不进这次发布。 */
const STAGE_FILES = [
  'src/data/ecosystem.ts',
  'src/data/community.ts',
  'data/builds/cards.json',
  'public/data/jev-cards.json',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
];
const SIDE_FILES = [
  'src/data/community.ts',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
];
function restoreFetched() {
  if (SKIP_FETCH) return;
  for (const file of FETCHED_FILES) {
    try {
      if (run(`git status --porcelain -- ${file}`).trim()) {
        run(`git checkout -- ${file}`);
        say(`restored ${file}（未发布路径，还原抓取写入）`);
      }
    } catch (err) {
      say(`WARN 还原 ${file} 失败: ${err.message}`);
    }
  }
}

/** 刷新本站自有的动态卡片，返回新增条数。
 *  卡片由 build-jev-cards.mjs 逐条判定（自有产物 + 确实用到 Jev + 标题必须是原文摘录），
 *  这本身就是质量门，所以不再过门 1；失败只告警，不阻塞生态数据发布。 */
function refreshBuilds() {
  const file = 'data/builds/cards.json';
  const countOf = () => (existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')).cards ?? []).length : 0);
  const before = countOf();
  try {
    run('node scripts/fetch-jev-builds.mjs');
    run(`node scripts/build-jev-cards.mjs --limit=${process.env.BUILDS_LIMIT ?? '200'}`);
  } catch (err) {
    say(`WARN 动态卡片刷新失败（不阻塞生态发布）: ${String(err.message).slice(0, 200)}`);
    return 0;
  }
  const after = countOf();
  say(`builds: +${after - before} cards (total ${after})`);
  return after - before;
}

/** X 指标与新推文。失败只告警，不让生态抓取一起中止。 */
function refreshCommunity() {
  try {
    const out = run('node scripts/fetch-community-x.mjs');
    say(`community: ${String(out).trim().split('\n').pop()}`);
  } catch (err) {
    const tail = `${err.stdout ?? ''}\n${err.stderr ?? ''}`.trim().split('\n').slice(-6).join(' | ');
    say(`WARN X 社区刷新失败（不阻塞生态发布）: ${tail.slice(0, 400)}`);
  }
}

/** 实验室补充场景并记录 clavue-jev 的选项。失败只告警。 */
function refreshLab() {
  try {
    say(`lab supplement: ${String(run('node scripts/supplement-lab.mjs')).trim()}`);
  } catch (err) {
    say(`WARN 实验室补充失败（不阻塞生态发布）: ${String(err.stdout || err.message).slice(0, 240)}`);
  }
  try {
    say(`lab record: ${String(run('node scripts/record-lab.mjs')).trim()}`);
  } catch (err) {
    say(`WARN 实验室记录失败（不阻塞生态发布）: ${String(err.stdout || err.message).slice(0, 240)}`);
  }
}

function porcelainPaths() {
  return run('git status --porcelain').split('\n').map((line) => {
    if (!line.trim()) return '';
    let file = line.slice(3);
    if (file.includes(' -> ')) file = file.slice(file.lastIndexOf(' -> ') + 4);
    if (file.startsWith('"') && file.endsWith('"')) file = file.slice(1, -1);
    return file;
  }).filter(Boolean);
}

function hasSideContent() {
  const paths = new Set(porcelainPaths());
  return SIDE_FILES.some((file) => paths.has(file));
}

function checkoutFiles(files) {
  for (const file of files) {
    try {
      if (run(`git status --porcelain -- ${file}`).trim()) {
        run(`git checkout -- ${file}`);
        say(`restored ${file}`);
      }
    } catch (err) {
      say(`WARN 还原 ${file} 失败: ${err.message}`);
    }
  }
}

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

/** 门控后端抽象：对外统一返回 Jev 风格的 answers（每问 noul/choice/score）。
 *  内部按 JUDGE_BACKEND 分流到 TypeSafe Jev 或本地 clavue-jev。 */
async function judge(state, questions) {
  if (JUDGE_BACKEND === 'jev') {
    return judgeViaJev(state, questions);
  }
  try {
    return await judgeViaClavue(state, questions);
  } catch (err) {
    // 本地 clavue key 全部 401 时，日更不能停在门上。TypeSafe 是仓库里已经
    // 配置的另一条判定，只在 clavue 明确拒绝 token 时顶上，并写进日志。
    if (!/401/.test(String(err.message)) || !process.env.TYPESAFE_API_KEY) throw err;
    say('WARN clavue judge 401，本轮改用 TypeSafe 判定');
    return judgeViaJev(state, questions);
  }
}

async function judgeViaJev(state, questions) {
  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, model: 'jev-latest', questions }),
  });
  if (!res.ok) throw new Error(`jev HTTP ${res.status}`);
  return (await res.json()).answers;
}

async function clavueOnce(question, context, choices) {
  const key = CLAVUE_KEYS[keyCursor % CLAVUE_KEYS.length];
  keyCursor += 1;
  const res = await fetch(CLAVUE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context, choices }),
  });
  if (res.status === 401) throw new Error('clavue 401（token 无效）');
  if (!res.ok) throw new Error(`clavue HTTP ${res.status}`);
  return res.json();
}

async function judgeViaClavue(state, questions) {
  const answers = {};
  for (const [name, q] of Object.entries(questions)) {
    let question, choices;
    if (q.type === 'noul') {
      // noul → yes/no，取 "yes" 概率
      question = q.instructions;
      choices = ['no', 'yes'];
    } else {
      // choice / score → 选项列表
      question = q.instructions;
      choices = Array.isArray(q.criteria) ? q.criteria : Object.keys(q.criteria);
    }
    const r = await clavueOnce(question, state, choices);
    if (q.type === 'noul') {
      answers[name] = { type: 'noul', noul: r.probabilities?.['yes'] ?? (r.choice === 'yes' ? 1 : 0) };
    } else {
      const choice = r.choice;
      const idx = Array.isArray(q.criteria) ? q.criteria.indexOf(choice) : Object.keys(q.criteria).indexOf(choice);
      if (q.type === 'score') {
        answers[name] = { type: 'score', score: idx, confidence: r.probabilities?.[choice] ?? 1, legend: Object.fromEntries(choices.map((c, i) => [i, c])), probabilities: Object.fromEntries(choices.map((c, i) => [i, r.probabilities?.[c] ?? 0])) };
      } else {
        answers[name] = { type: 'choice', choice, confidence: r.probabilities?.[choice] ?? 1, probabilities: r.probabilities ?? {} };
      }
    }
  }
  return answers;
}

// ---------- 门 1：intake ----------
// 批量策略（Jev 轮 10：batch_by_magnitude，阈值 +10%/仓库）：
// 单日小增量累积到 pending 状态，任一仓库相对变化 ≥10% 或新增仓库才触发发布评估。
const MAGNITUDE_THRESHOLD = 0.1; // +10%

function loadPending() {
  try {
    return JSON.parse(readFileSync(PENDING_FILE, 'utf8'));
  } catch {
    return { last_release: null, pending: {} };
  }
}

function savePending(p) {
  const dir = '.research/pipeline-state';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(PENDING_FILE, JSON.stringify(p, null, 2));
}

/** 把本日 fetch diff 并入 pending，返回是否到达发布量级 */
function accumulate(fetchReport, pending) {
  for (const c of fetchReport.changes) {
    if (c.kind === 'gone' || c.kind === 'archived') {
      pending.pending[c.repo] = { kind: c.kind, force: true };
      continue;
    }
    // "446 -> 603" 解析
    const m = (c.stars ?? '').match(/(\d+) -> (\d+)/);
    if (!m) continue;
    const [, oldS, newS] = m.map(Number);
    const rel = (newS - oldS) / Math.max(oldS, 1);
    const prev = pending.pending[c.repo] ?? { base: oldS, current: oldS };
    prev.current = newS;
    prev.rel = (prev.current - prev.base) / Math.max(prev.base, 1);
    pending.pending[c.repo] = prev;
  }
  const trigger = Object.entries(pending.pending).some(
    ([, v]) => (v.kind === 'gone' || v.kind === 'archived' || v.force || (v.rel ?? 0) >= MAGNITUDE_THRESHOLD)
  );
  return trigger;
}

async function gate1(fetchReport, pending, trigger) {
  const pendingSummary = Object.entries(pending.pending)
    .map(([repo, v]) => `${repo}: ${(v.rel * 100).toFixed(1)}%${v.kind ? ` (${v.kind})` : ''}`)
    .join('; ');
  return judge(
    `Site JevCode ecosystem refresh, daily cycle. Today's fetch saw ${fetchReport.changes.length} changed repos. Accumulated pending batch since last release: ${pendingSummary}. The site shows these numbers on the /{lang}/ecosystem/ page with a 'data as of <date>' stamp. Code-level trigger (any repo >= +10% change or a repo gone/archived) is currently ${trigger ? 'REACHED' : 'NOT reached'}. Decide whether to publish the accumulated batch now.`,
    {
      worth_publishing: {
        type: 'noul',
        instructions: 'Considering the accumulated batch and code trigger together, is it worth publishing to production now?',
        criteria: { true: 'Yes: publish the accumulated batch now', false: 'No: keep accumulating' },
      },
    }
  );
}

// ---------- 门 2：release ----------
async function gate2(buildOk, checkOk, linkReport, changes) {
  return judge(
    `JevCode release readiness. Build: ${buildOk}. Type check: ${checkOk}. Internal links: ${linkReport}. Changes in release: ${changes}. Deploy is an atomic symlink switch with instant rollback. Decide: is this release coherent and safe to go live?`,
    {
      release_ready: {
        type: 'noul',
        instructions: 'Is this release ready to deploy to production?',
        criteria: { true: 'Yes: all gates passed and changes are coherent', false: 'No: hold and investigate' },
      },
      risk: {
        type: 'score',
        instructions: 'How risky is deploying this release?',
        criteria: ['Safe routine data update', 'Low risk', 'Moderate risk', 'High risk'],
      },
    }
  );
}

// ---------- 主流程 ----------
say(`start dry=${DRY} skipFetch=${SKIP_FETCH}`);

// 1. 抓取
let fetchReport = { repo_count: 0, changes: [] };
let buildsAdded = 0;
if (!SKIP_FETCH) {
  const out = run('node scripts/fetch-ecosystem.mjs');
  fetchReport = JSON.parse(out.slice(out.indexOf('{')));
  say(`fetch: ${fetchReport.repo_count} repos, ${fetchReport.changes.length} changes`);
  // 动态卡片独立于生态门控：每条都由 build-jev-cards.mjs 判定过（自有产物 +
  // 确实用到 Jev + 标题必须是原文摘录），自身即质量门，不再过门 1。
  buildsAdded = refreshBuilds();
  refreshCommunity();
  refreshLab();
}

// 2. 门 1（含批量累积）
// 星标没有跨过阈值时，社区指标、新推文和实验室补充仍要发布。
// 星标文件和「只改了 updated 时间戳」的卡片不跟着这路出去。
let publishEco = false;
const sideReady = () => buildsAdded > 0 || hasSideContent();
if (fetchReport.changes.length === 0 && !SKIP_FETCH && !sideReady()) {
  say('gate1: no changes, nothing to do');
  restoreFetched();
  writeLog('skipped-no-changes');
  process.exit(0);
}
const skipGate1 = !SKIP_FETCH && fetchReport.changes.length === 0 && sideReady();
if (skipGate1) {
  say(`gate1: skipped (side updates only, builds +${buildsAdded}) — 直接构建`);
} else {
  const pending = loadPending();
  const trigger = accumulate(fetchReport, pending);
  savePending(pending);
  say(`pending batch: ${Object.keys(pending.pending).length} repos, trigger=${trigger}`);
  if (!trigger) {
    if (!sideReady()) {
      say('gate1: below magnitude threshold, accumulating');
      restoreFetched();
      writeLog('accumulating', { pending });
      process.exit(0);
    }
    say('gate1: below magnitude; publishing community/lab/builds only');
    writeLog('accumulating-side', { pending, buildsAdded });
  } else {
    let g1;
    try {
      g1 = await gate1(fetchReport, pending, trigger);
    } catch (err) {
      if (!sideReady()) {
        say(`gate1 FAILED (${err.message}) — 还原抓取写入`);
        restoreFetched();
        process.exit(1);
      }
      say(`WARN gate1 FAILED (${err.message})；生态批次留下，社区/实验室继续`);
      g1 = null;
    }
    if (g1) {
      const worth = g1.worth_publishing.noul >= 0.5;
      say(`gate1: worth=${g1.worth_publishing.noul}`);
      writeLog('gate1', { fetchReport, pending, trigger, backend: JUDGE_BACKEND, gate1: g1 });
      if (!worth) {
        say('gate1: HOLD — ecosystem batch stays pending');
        const holdFile = `.research/pipeline-logs/HOLD-${new Date().toISOString().slice(0, 10)}.txt`;
        const prevHold = existsSync(holdFile) ? readFileSync(holdFile, 'utf8') : '';
        const streak = prevHold.split('\n').filter((line) => line.startsWith('本轮 HOLD')).length + 1;
        writeFileSync(holdFile, `${prevHold}本轮 HOLD #${streak} ` +
          `worth=${g1.worth_publishing.noul.toFixed(3)} ` +
          `backend=${JUDGE_BACKEND} pending=${Object.keys(pending.pending).length} trigger=${trigger}\n`);
        say(`gate1: 连续 HOLD 第 ${streak} 轮，标记写入 ${holdFile}`);
        if (!sideReady()) {
          restoreFetched();
          process.exit(0);
        }
        say('gate1 HOLD; publishing community/lab/builds only');
      } else {
        publishEco = true;
      }
    }
  }
}

// 3. 提交。只暂存白名单里这一轮真正要发的文件。
if (!publishEco) checkoutFiles(['src/data/ecosystem.ts']);
if (buildsAdded === 0) checkoutFiles(['data/builds/cards.json', 'public/data/jev-cards.json']);
const stage = porcelainPaths().filter((file) => STAGE_FILES.includes(file));
if (!stage.length) {
  say('no whitelisted changes to release');
  restoreFetched();
  process.exit(0);
}
if (!DRY) {
  for (const file of stage) run(`git add -- ${file}`);
  const stamp = new Date().toISOString().slice(0, 10);
  run(`git commit -m ${JSON.stringify(`chore(eco): 生态数据自动刷新 (${stamp}): ${stage.join(', ')}`)} --quiet`);
  say(`committed ${stage.join(', ')}`);
}

// 4. 构建 + 检查
let buildOk = false;
let checkOk = false;
let linkReport = 'not run';
let i18nReport = 'not run';
try {
  run('npm run build', { stdio: 'inherit' });
  buildOk = true;
} catch {
  buildOk = false;
}
if (buildOk) {
  try {
    // 注意不能用 tail -3：astro check 末尾是 0 errors / 0 warnings / 0 hints + 空行，
    // tail -3 会恰好切掉 "- 0 errors" 行导致永远 check=false（实测踩坑）。
    const checkOut = run('npm run check 2>&1');
    checkOk = /- 0 errors/.test(checkOut) && !/error ts\(/.test(checkOut);
    if (!checkOk) say(`check tail:\n${checkOut.split('\n').slice(-40).join('\n')}`);
  } catch (err) {
    checkOk = false;
    const blob = `${err.stdout ?? ''}\n${err.stderr ?? ''}`;
    say(`check tail:\n${blob.split('\n').slice(-40).join('\n')}`);
  }
  linkReport = await linkCheck();
  // i18n 完整性：i18n-gaps.mjs 退出码 1 表示有缺口（它本就是为 CI 卡点写的）。
  // 但这里只记录与告警、不阻断发布——en 是回退源，缺翻译只会静默回退成英文、
  // 页面不破损，翻译没跟上不该停掉生态数据刷新。
  try {
    run('node scripts/i18n-gaps.mjs');
    i18nReport = 'ok';
  } catch {
    i18nReport = 'gaps';
  }
}

say(`build=${buildOk} check=${checkOk} links=${linkReport} i18n=${i18nReport}`);
if (i18nReport === 'gaps') {
  say('i18n: 存在翻译缺口（en 为回退源，页面不破损）；运行 node scripts/i18n-gaps.mjs 看清单');
}

// 5. 门 2
if (!buildOk || !checkOk) {
  say('gate2 skipped: mechanical gates failed');
  restoreFetched();
  writeLog('gate2-skipped-mech-fail', { buildOk, checkOk, i18nReport });
  process.exit(1);
}
// 发布内容描述。必须区分干跑与真实模式：
// 干跑不提交，`git log -1` 返回的是【上一次】提交，于是门 2 评的是别的东西
// （实测：干跑把上一个管线提交流当成发布内容，ready=0.41 误判为不连贯；
//  换成真实的生态刷新描述后 ready=0.77~0.83 通过）。
// 干跑改为直接描述待发布的未提交改动。
const changes = DRY
  ? (() => {
      // 用 name-only 列文件名，避免解析 porcelain：它的行首有状态列，
      // 一旦被 trim 掉，按固定宽度切片就会切进文件名（实测切出 "cripts/..."）。
      // 必须比 HEAD 而不是默认的「工作区 vs 索引」：后者看不见已 git add 的改动，
      // 一旦有暂存文件，预览会谎报 "no pending changes"（实测确认）。
      // 只统计会真正进发布的路径：.data/ 与未跟踪的 docs/coverage-full/ 是评测
      // 产物，guard 豁免它们，STAGE_FILES 也不含它们——把 51 个噪音文件塞进
      // 描述会让门 2 把「1456 files changed」误判为 High risk / not ready
      // （2026-10-09 干跑实测 ready=0.0008，同描述去掉噪音后 ready=0.987）。
      const modified = run('git diff --name-only HEAD -- .').trim();
      const untracked = run('git ls-files --others --exclude-standard -- .').trim();
      const files = [...modified.split('\n'), ...untracked.split('\n')]
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((file) => !file.startsWith('.data/') && !file.startsWith('docs/coverage-full/'));
      if (!files.length) return 'dry-run: no pending changes';
      const stat = run('git diff --stat HEAD -- src/data data/builds public/data src').trim().split('\n').slice(-1)[0] ?? '';
      return `dry-run preview of ${files.length} pending file(s): ${files.slice(0, 4).join(', ')}${files.length > 4 ? ', …' : ''}${stat ? '; ' + stat : ''}`;
    })()
  : run('git log -1 --stat --oneline').trim().split('\n').slice(0, 5).join('; ');
let g2;
try {
  g2 = await gate2(buildOk, checkOk, linkReport, changes);
} catch (err) {
  say(`gate2 FAILED (${err.message}) — 还原抓取写入`);
  restoreFetched();
  process.exit(1);
}
const ready = g2.release_ready.noul >= 0.5;
say(`gate2: ready=${g2.release_ready.noul} risk=${g2.risk.score}/3 (conf ${g2.risk.confidence})`);
writeLog('gate2', { gate2: g2, i18nReport });

if (!ready) {
  say('gate2: HOLD — release blocked by Jev');
  restoreFetched();
  // 退出码 2 =「按设计不发布」，与 1（机制/API 故障）区分开：cron 侧据此不再
  // 写成「管线失败」ALERT。此前二者混用 exit 1，告警分不清是内容不值得发还是
  // 管线坏了（实测两轮干跑门 2 均 HOLD，按旧逻辑会连报「失败」）。
  process.exit(2);
}

// 6. 部署
if (DRY) {
  say('dry-run: would deploy now');
  // 干跑是非发布路径，必须和 HOLD 路径一样还原抓取写入。
  // 否则每次干跑都在工作区留下脏改动，把下一轮 cron 的脏区保护永久触发（自锁）。
  restoreFetched();
  writeLog('dry-run-end');
  process.exit(0);
}
run('git push origin main', { stdio: 'inherit' });
run('./deploy/deploy.sh', { stdio: 'inherit' });
say('deployed');

// 发布成功：清空 pending 批次，记录发布时间
const p = loadPending();
const cleared = Object.keys(p.pending).length;
p.pending = {};
p.last_release = new Date().toISOString();
savePending(p);
say(`pending batch cleared (${cleared} repos)`);
writeLog('released', { cleared });
try {
  const out = run('node scripts/indexnow-submit.mjs');
  say(`indexnow: ${String(out).trim().split('\n').slice(-3).join(' | ')}`);
} catch (err) {
  say(`WARN IndexNow 提交失败（不回滚已发布版本）: ${String(err.stdout || err.message).slice(0, 240)}`);
}

// ---------- helpers ----------
function dry_has_changes(d) {
  return d.length > 0;
}

async function linkCheck() {
  // 复用发布门槛：全量内链检查
  const script = `
    const os = require('os');
  `;
  const out = run(`node -e "
    const fs = require('fs'), path = require('path');
    let total = 0, broken = 0;
    const walk = (d) => {
      for (const f of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) { if (!/pagefind|_astro/.test(f.name)) walk(p); }
        else if (f.name.endsWith('.html')) {
          const html = fs.readFileSync(p, 'utf8');
          for (const m of html.matchAll(/href=\\"(\\/[^\\"]*)\\"/g)) {
            const href = m[1].split('#')[0];
            if (/\\.(svg|png|webp|webmanifest|ico|css|js|txt|xml|woff2)$/.test(href)) continue;
            total++;
            const t = 'dist' + (href.endsWith('/') ? href : href + '/');
            if (!fs.existsSync(t + 'index.html') && !fs.existsSync('dist' + href)) broken++;
          }
        }
      }
    };
    walk('dist');
    console.log(total + ' links, ' + broken + ' broken');
  "`);
  return out.trim();
}

function writeLog(stage, data) {
  const dir = '.research/pipeline-logs';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const entry = {
    ts: new Date().toISOString(),
    stage,
    dry: DRY,
    elapsed_ms: Date.now() - t0,
    ...(data ?? {}),
  };
  const file = `${dir}/${new Date().toISOString().slice(0, 10)}.jsonl`;
  const prev = existsSync(file) ? readFileSync(file, 'utf8') : '';
  writeFileSync(file, prev + JSON.stringify(entry) + '\n');
}
