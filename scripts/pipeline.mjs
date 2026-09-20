#!/usr/bin/env node
/**
 * 管线调度器：抓取 → Jev 门 1（该不该发/发哪里）→ 提交 → 构建 →
 * Jev 门 2（发布是否合格）→ 部署 → 记录。
 *
 * 两级 Jev 门设计（Jev 轮 9 判定 two_stage 0.95）：
 *   门 1（intake）：变化是否值得发布？发布到哪个位置？
 *   门 2（release）：组装好的 release 是否合格上线？
 *
 * 用法：node scripts/pipeline.mjs [--dry-run] [--skip-fetch]
 *   --dry-run    跑全流程但不 commit/不 deploy（验证用）
 *   --skip-fetch 跳过抓取（调试门与部署段）
 *
 * 环境变量：TYPESAFE_API_KEY（必需）、GITHUB_TOKEN（可选，抓取限流用）。
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const DRY = process.argv.includes('--dry-run');
const SKIP_FETCH = process.argv.includes('--skip-fetch');
const PENDING_FILE = '.research/pipeline-state/pending.json';
const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('缺少 TYPESAFE_API_KEY');
  process.exit(1);
}

const log = [];
const t0 = Date.now();
function say(msg) {
  console.log(`[pipeline] ${msg}`);
  log.push(msg);
}

/** 抓取会写回这个【已跟踪】文件；非发布路径必须还原，否则脏工作区
 *  会让 cron 的脏区保护在下一轮永久跳过（自锁死循环，实测复现）。 */
const FETCHED_FILE = 'src/data/ecosystem.ts';
function restoreFetched() {
  if (SKIP_FETCH) return;
  try {
    if (run(`git status --porcelain -- ${FETCHED_FILE}`).trim()) {
      run(`git checkout -- ${FETCHED_FILE}`);
      say(`restored ${FETCHED_FILE}（未发布路径，还原抓取写入）`);
    }
  } catch (err) {
    say(`WARN 还原 ${FETCHED_FILE} 失败: ${err.message}`);
  }
}

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

async function jev(state, questions) {
  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, model: 'jev-latest', questions }),
  });
  if (!res.ok) throw new Error(`jev HTTP ${res.status}`);
  return (await res.json()).answers;
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
  return jev(
    `Site JevCode ecosystem refresh, daily cycle. Today's fetch saw ${fetchReport.changes.length} changed repos. Accumulated pending batch since last release: ${pendingSummary}. The site shows these numbers on the /{lang}/ecosystem/ page with a 'data as of <date>' stamp. Code-level trigger (any repo >= +10% change or a repo gone/archived) is currently ${trigger ? 'REACHED' : 'NOT reached'}. Decide whether to publish the accumulated batch now.`,
    {
      worth_publishing: {
        type: 'noul',
        instructions: 'Considering the accumulated batch and code trigger together, is it worth publishing to production now?',
        criteria: { true: 'Yes: publish the accumulated batch now', false: 'No: keep accumulating' },
      },
      placement: {
        type: 'choice',
        instructions: 'Where does this update belong?',
        criteria: { ecosystem_page: 'The ecosystem page only', also_homepage: 'Ecosystem page plus homepage stats if shown', defer: 'Nowhere yet, hold' },
      },
    }
  );
}

// ---------- 门 2：release ----------
async function gate2(buildOk, checkOk, linkReport, changes) {
  return jev(
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
if (!SKIP_FETCH) {
  const out = run('node scripts/fetch-ecosystem.mjs');
  fetchReport = JSON.parse(out.slice(out.indexOf('{')));
  say(`fetch: ${fetchReport.repo_count} repos, ${fetchReport.changes.length} changes`);
}

// 2. 门 1（含批量累积）
if (fetchReport.changes.length === 0 && !SKIP_FETCH) {
  say('gate1: no changes, nothing to do');
  restoreFetched();
  writeLog('skipped-no-changes');
  process.exit(0);
}
const pending = loadPending();
const trigger = accumulate(fetchReport, pending);
savePending(pending);
say(`pending batch: ${Object.keys(pending.pending).length} repos, trigger=${trigger}`);
if (!trigger) {
  say('gate1: below magnitude threshold, accumulating');
  restoreFetched();
  writeLog('accumulating', { pending });
  process.exit(0);
}
const g1 = await gate1(fetchReport, pending, trigger);
const worth = g1.worth_publishing.noul >= 0.5;
const placement = g1.placement.choice;
say(`gate1: worth=${g1.worth_publishing.noul} placement=${placement}`);
writeLog('gate1', { fetchReport, pending, trigger, gate1: g1 });
if (!worth || placement === 'defer') {
  say('gate1: HOLD — not publishing this cycle');
  restoreFetched();
  process.exit(0);
}

// 3. 提交
const dirty = run('git status --porcelain').trim();
if (!dry_has_changes(dirty)) {
  say('no uncommitted changes after fetch; nothing to release');
  restoreFetched();
  process.exit(0);
}
if (!DRY) {
  run('git add -A');
  run('git commit -m "chore(eco): 生态数据自动刷新 (' + new Date().toISOString().slice(0, 10) + ')" --quiet');
  say('committed');
}

// 4. 构建 + 检查
let buildOk = false;
let checkOk = false;
let linkReport = 'not run';
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
  } catch {
    checkOk = false;
  }
  linkReport = await linkCheck();
}

say(`build=${buildOk} check=${checkOk} links=${linkReport}`);

// 5. 门 2
if (!buildOk || !checkOk) {
  say('gate2 skipped: mechanical gates failed');
  restoreFetched();
  writeLog('gate2-skipped-mech-fail', { buildOk, checkOk });
  process.exit(1);
}
const changes = run('git log -1 --stat --oneline').trim().split('\n').slice(0, 5).join('; ');
const g2 = await gate2(buildOk, checkOk, linkReport, changes);
const ready = g2.release_ready.noul >= 0.5;
say(`gate2: ready=${g2.release_ready.noul} risk=${g2.risk.score}/3 (conf ${g2.risk.confidence})`);
writeLog('gate2', { gate2: g2 });

if (!ready) {
  say('gate2: HOLD — release blocked by Jev');
  restoreFetched();
  process.exit(1);
}

// 6. 部署
if (DRY) {
  say('dry-run: would deploy now');
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
