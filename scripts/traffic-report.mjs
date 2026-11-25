#!/usr/bin/env node
/**
 * nginx jevcode_timing 流量摘要。零外部依赖。
 * node scripts/traffic-report.mjs [--log=] [--api-log=] [--db=] [--days=1] [--json] [--feishu]
 */
import { existsSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const LINE = /^(\S+) \S+ \S+ \[(\d{2}\/\w{3}\/\d{4}):[^\]]+\] "(\S+) (\S+) [^"]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" rt=([\d.-]+) urt=(\S+)/;
const MONTH = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const SCAN = /\.php|wp-|\.env|\.git|xmlrpc|phpmyadmin|actuator|cgi-bin|druid/i;
const SEO = /ElevenlabsCrawler|SERankingBacklinksBot|ShapBot|RiverBot|SemrushBot|AhrefsBot|MJ12bot|DotBot/i;
const CATS = ['search_google', 'search_bing', 'search_other', 'ai_openai', 'ai_anthropic', 'ai_perplexity', 'ai_other', 'seo_scraper', 'other_bot', 'browser'];

export function parseTimingLine(line) {
  const m = LINE.exec(line);
  if (!m) return null;
  return {
    ip: m[1], day: m[2], method: m[3], path: m[4],
    status: Number(m[5]), bytes: Number(m[6]), referer: m[7], ua: m[8],
    rt: Number(m[9]), urt: m[10],
  };
}

export function classifyUserAgent(ua) {
  const s = ua || '';
  if (SEO.test(s)) return 'seo_scraper';
  if (/googlebot|google-inspection|adsbot-google|mediapartners-google|storebot-google/i.test(s)) return 'search_google';
  if (/bingbot|msnbot/i.test(s)) return 'search_bing';
  if (/baiduspider|yandex|duckduckbot|slurp|sogou|(?:^|[^a-z])applebot(?!-extended)/i.test(s)) return 'search_other';
  if (/gptbot|chatgpt|oai-searchbot|openai/i.test(s)) return 'ai_openai';
  if (/anthropic|claudebot|claude-user|claude-/i.test(s)) return 'ai_anthropic';
  if (/perplexity/i.test(s)) return 'ai_perplexity';
  if (/ccbot|bytespider|amazonbot|meta-external|cohere|diffbot|youbot|applebot-extended|timpibot/i.test(s)) return 'ai_other';
  if (/bot|crawler|spider|scrapy/i.test(s)) return 'other_bot';
  return 'browser';
}

function dayUtc(day) {
  const m = /^(\d{2})\/(\w{3})\/(\d{4})$/.exec(day);
  if (!m || MONTH[m[2]] == null) return null;
  return Date.UTC(Number(m[3]), MONTH[m[2]], Number(m[1]));
}

function inWindow(day, days, now) {
  if (!days) return true;
  const t = dayUtc(day);
  if (t == null) return false;
  const today = Date.parse(`${new Date(now).toISOString().slice(0, 10)}T00:00:00.000Z`);
  return t >= today - (days - 1) * 86400000 && t <= today;
}

function topN(map, n = 10) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
    .map(([key, count]) => ({ path: key, count }));
}

export function analyzeTrafficLogs(lines, { days = 0, now = Date.now() } = {}) {
  const status = { s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 };
  const categories = Object.fromEntries(CATS.map((k) => [k, 0]));
  const ips = new Set();
  const engaged = new Set();
  const pages = new Map();
  const refs = new Map();
  const misses = new Map();
  let slow = 0;
  let maxRt = 0;
  let apiCalls = 0;
  let total = 0;

  for (const line of lines) {
    const row = typeof line === 'string' ? parseTimingLine(line) : line;
    if (!row || !inWindow(row.day, days, now)) continue;
    total += 1;
    ips.add(row.ip);
    const bucket = row.status < 300 ? 's2xx' : row.status < 400 ? 's3xx' : row.status < 500 ? 's4xx' : 's5xx';
    if (status[bucket] != null) status[bucket] += 1;
    const cat = classifyUserAgent(row.ua);
    categories[cat] = (categories[cat] || 0) + 1;
    const pathname = row.path.split('?')[0];
    pages.set(pathname, (pages.get(pathname) || 0) + 1);
    if (pathname.startsWith('/api/') || pathname === '/api') apiCalls += 1;
    if (row.rt >= 0.5) {
      slow += 1;
      if (row.rt > maxRt) maxRt = row.rt;
    }
    if (row.status === 404 && !SCAN.test(pathname)) misses.set(pathname, (misses.get(pathname) || 0) + 1);
    const internal = /jevcode\.ai/i.test(row.referer || '');
    if (row.referer && row.referer !== '-' && !internal) refs.set(row.referer, (refs.get(row.referer) || 0) + 1);
    if (cat === 'browser' && (pathname === '/site.webmanifest' || pathname.startsWith('/api/') || internal)) {
      engaged.add(row.ip);
    }
  }

  return {
    total, status, uniqueIps: ips.size, categories, engagedBrowserIps: engaged.size,
    topPages: topN(pages), topReferrers: topN(refs), top404s: topN(misses),
    slowRequests: { count: slow, maxRt }, apiCalls,
  };
}

export function formatTrafficReport(report) {
  const s = report.status;
  const lines = [
    `请求 ${report.total}，独立 IP ${report.uniqueIps}，互动浏览器 IP ${report.engagedBrowserIps}`,
    `状态 2xx ${s.s2xx} / 3xx ${s.s3xx} / 4xx ${s.s4xx} / 5xx ${s.s5xx}`,
    `API ${report.apiCalls}，慢请求 ${report.slowRequests.count}（最慢 ${report.slowRequests.maxRt}s）`,
    `分类 ${CATS.map((k) => `${k} ${report.categories[k] || 0}`).join('，')}`,
  ];
  const page = (rows) => rows.map((r) => `${r.count} ${r.path}`).join('；') || '无';
  lines.push(`热门 ${page(report.topPages)}`);
  lines.push(`来源 ${page(report.topReferrers)}`);
  lines.push(`404 ${page(report.top404s)}`);
  if (report.accounts) {
    const a = report.accounts;
    lines.push(`账号 用户 ${a.users}，有效 key ${a.activeKeys}，用过 ${a.usedKeys}，消费 $${a.spentUsd}，券 ${a.vouchers}`);
    const funnelEntries = Object.entries(a.funnel || {}).filter(([, v]) => v > 0);
    if (funnelEntries.length) {
      lines.push(`漏斗 ${funnelEntries.map(([k, v]) => `${k} ${v}`).join('，')}`);
    }
  }
  return lines.join('\n');
}

function readLog(file) {
  if (!file || !existsSync(file)) return [];
  const buf = readFileSync(file);
  const text = file.endsWith('.gz') ? gunzipSync(buf).toString('utf8') : buf.toString('utf8');
  return text.split(/\n/).filter(Boolean);
}

function readLogWithRotated(file, days) {
  const out = [...readLog(file)];
  if (days > 1 && file && !file.endsWith('.gz')) {
    out.push(...readLog(`${file}.1`));
    for (let i = 2; i <= Math.min(days, 14); i++) {
      out.push(...readLog(`${file}.${i}.gz`));
    }
  }
  return out;
}

function flagMap(argv) {
  const flags = {};
  for (const a of argv) {
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq === -1) flags[a.slice(2)] = true;
    else flags[a.slice(2, eq)] = a.slice(eq + 1);
  }
  return flags;
}

async function attachAccounts(report, dbPath, days) {
  if (!dbPath || !existsSync(dbPath)) return;
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const n = (sql) => Number(db.prepare(sql).get().c);
    const hasTable = (name) => Boolean(db.prepare("SELECT 1 AS c FROM sqlite_master WHERE type='table' AND name=?").get(name));
    const spentMicro = n('SELECT COALESCE(SUM(-cents), 0) AS c FROM ledger WHERE cents < 0');
    const winDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 1)));
    const since = new Date(Date.now() - (winDays - 1) * 86400000).toISOString().slice(0, 10);
    const funnel = {};
    if (hasTable('funnel_daily')) {
      for (const row of db.prepare('SELECT event, SUM(count) AS total FROM funnel_daily WHERE day >= ? GROUP BY event ORDER BY event').all(since)) {
        funnel[row.event] = Number(row.total);
      }
    }
    report.accounts = {
      users: n('SELECT COUNT(*) AS c FROM users'),
      activeKeys: n('SELECT COUNT(*) AS c FROM api_keys WHERE revoked_at IS NULL'),
      usedKeys: n('SELECT COUNT(*) AS c FROM api_keys WHERE last_used_at IS NOT NULL'),
      spentUsd: Number((spentMicro / 1_000_000).toFixed(6)),
      vouchers: hasTable('vouchers') ? n('SELECT COUNT(*) AS c FROM vouchers') : 0,
      funnel,
    };
  } finally {
    db.close();
  }
}

async function main() {
  const flags = flagMap(process.argv.slice(2));
  const days = flags.days == null ? 1 : Number(flags.days);
  const winDays = Number.isFinite(days) ? days : 1;
  const lines = [
    ...readLogWithRotated(flags.log || '/var/log/nginx/jevcode-timing.log', winDays),
    ...readLogWithRotated(flags['api-log'] || '/var/log/nginx/jevcode-api-timing.log', winDays),
  ];
  const report = analyzeTrafficLogs(lines, { days: winDays });
  const dbPath = typeof flags.db === 'string' ? flags.db : process.env.PLAYGROUND_ACCOUNTS_DB;
  await attachAccounts(report, dbPath, winDays);
  const text = formatTrafficReport(report);
  if (flags.feishu && process.env.FEISHU_WEBHOOK) {
    const notify = fileURLToPath(new URL('./notify-feishu.mjs', import.meta.url));
    const r = spawnSync(process.execPath, [notify, '流量日报', text], { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }
  console.log(flags.json ? JSON.stringify(report) : text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
