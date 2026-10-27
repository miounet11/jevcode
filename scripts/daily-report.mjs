#!/usr/bin/env node
/**
 * 每日管线日报：把「今天发了什么」推一条到飞书。
 *
 * 只做失败告警时，正常运转的日更是完全沉默的——连续几天不发也没人察觉，
 * 10-18~10-22 就是这样静默停更的。日报的意义在于给出一个每天都有的信号：
 * 今天发了，发了多少；没发，卡在哪一步、连续几轮了。
 *
 * 用法：node scripts/daily-report.mjs [--date=YYYY-MM-DD] [--dry]
 * 环境变量：FEISHU_WEBHOOK（未配置时打到 stdout，退出码仍为 0）
 * 退出码：0 正常（无论日报内容是好是坏）；1 读取日志失败
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const LOG_DIR = fileURLToPath(new URL('../.research/pipeline-logs/', import.meta.url));
const BRIEFS = fileURLToPath(new URL('../src/data/daily-briefs.json', import.meta.url));

/** 从 jsonl 里按 stage 取每一轮的结果。 */
export function summarize(records) {
  const byStage = (name) => records.filter((r) => r.stage === name);
  const released = byStage('released');
  const gate2 = byStage('gate2');
  const holds = records.filter((r) => /^hold/i.test(r.stage ?? ''));
  const failures = records.filter((r) => /fail|error/i.test(r.stage ?? ''));
  const lastGate2 = gate2[gate2.length - 1];
  return {
    released: released.length,
    holds: holds.length,
    failures: failures.length,
    cleared: released.reduce((n, r) => n + (Number(r.cleared) || 0), 0),
    gate2Score: lastGate2?.gate2?.release_ready?.noul ?? null,
    risk: lastGate2?.gate2?.risk?.score ?? null,
    lastFailure: failures[failures.length - 1]?.stage ?? null,
  };
}

/**
 * 连续未发布天数：从今天往回数，直到遇到有 released 的那天。
 * 判定「未发布」用「当天有日志但没有 released」，而不是「当天没有日志」——
 * 后者也包括 cron 没跑，那是另一类故障，不该混成同一个数字。
 */
export function streakWithoutRelease(date, dateList, hasRelease) {
  // 从 date 的前一天往回数。dateList 是升序的，所以倒着走；
  // 遇到第一个有发布的日子就停，那之前连续空了多少天就是多少天。
  let n = 0;
  const earlier = dateList.filter((d) => d < date).sort().reverse();
  for (const d of earlier) {
    if (hasRelease(d)) break;
    n += 1;
  }
  return n;
}

function readDay(date) {
  const file = join(LOG_DIR, `${date}.jsonl`);
  if (!existsSync(file)) return null;
  const records = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      records.push(JSON.parse(t));
    } catch {
      // 半行 JSON（进程被杀）不该让日报整体失败。
    }
  }
  return records;
}

function allDates() {
  try {
    return readdirSync(LOG_DIR)
      .map((f) => /^(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(f)?.[1])
      .filter(Boolean)
      .sort();
  } catch {
    return [];
  }
}

export function buildReport({ date, today, records, dates }) {
  if (records === null) {
    return { title: `日更日报 ${date}`, text: '今天没有管线日志——cron 没跑，或日志目录不可写。', ok: false };
  }
  const s = summarize(records);
  const streak = today
    ? streakWithoutRelease(date, dates, (d) => {
        const r = readDay(d);
        return Boolean(r && r.some((x) => x.stage === 'released'));
      })
    : 0;

  let totalBriefs = null;
  try {
    totalBriefs = JSON.parse(readFileSync(BRIEFS, 'utf8')).length;
  } catch {
    // 统计不到就不显示，不影响日报本身。
  }

  const lines = [];
  lines.push(`发布轮次：${s.released}`);
  if (s.released === 0) {
    if (s.lastFailure) lines.push(`卡在：${s.lastFailure}`);
    else if (s.holds > 0) lines.push(`卡在：HOLD（${s.holds} 次）`);
    else lines.push('卡在：未见释放记录');
    if (streak > 0) lines.push(`连续未发布：${streak} 天`);
  } else {
    lines.push(`清理 pending：${s.cleared}`);
    if (s.gate2Score !== null) {
      lines.push(`门2 得分：${s.gate2Score.toFixed(3)}${s.risk !== null ? `，风险等级 ${s.risk}` : ''}`);
    }
  }
  if (s.failures > 0) lines.push(`失败次数：${s.failures}`);
  if (totalBriefs !== null) lines.push(`简报总量：${totalBriefs}`);

  return {
    title: `日更日报 ${date}`,
    text: lines.join('\n'),
    ok: s.released > 0,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1];
  const dry = args.includes('--dry');
  const today = new Date().toISOString().slice(0, 10);
  const date = dateArg ?? today;

  const records = readDay(date);
  const report = buildReport({ date, today, records, dates: allDates() });

  const body = report.text;
  if (dry || !process.env.FEISHU_WEBHOOK) {
    console.log(`[daily-report] ${report.title}\n${body}`);
    if (!process.env.FEISHU_WEBHOOK) console.error('[daily-report] 未配置 FEISHU_WEBHOOK，仅打印');
    return;
  }
  const { spawnSync } = await import('node:child_process');
  const notify = fileURLToPath(new URL('./notify-feishu.mjs', import.meta.url));
  const r = spawnSync(process.execPath, [notify, report.title, body], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
