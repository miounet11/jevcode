#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { openAccounts } from '../server/accounts.mjs';
import { readSitemapEntries } from './indexnow-submit.mjs';
import {
  parseTimingLine, classifyUserAgent, analyzeTrafficLogs, formatTrafficReport,
} from './traffic-report.mjs';

const day = new Date().toISOString().slice(0, 10);
const [y, mo, d] = day.split('-');
const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(mo) - 1];
const stamp = `${d}/${mon}/${y}`;

function line({ ip = '1.1.1.1', method = 'GET', path: p = '/', status = 200, bytes = 10, ref = '-', ua = 'Mozilla/5.0', rt = '0.01', urt = '-' } = {}) {
  return `${ip} - - [${stamp}:12:00:00 +0000] "${method} ${p} HTTP/1.1" ${status} ${bytes} "${ref}" "${ua}" rt=${rt} urt=${urt}`;
}

test('parseTimingLine 解析 nginx timing 行', () => {
  const row = parseTimingLine(line({ path: '/a?x=1', status: 404, rt: '1.25', ua: 'Mozilla/5.0 Chrome' }));
  assert.equal(row.ip, '1.1.1.1');
  assert.equal(row.day, stamp);
  assert.equal(row.method, 'GET');
  assert.equal(row.path, '/a?x=1');
  assert.equal(row.status, 404);
  assert.equal(row.rt, 1.25);
  assert.equal(parseTimingLine('nope'), null);
});

test('classifyUserAgent 覆盖搜索、AI、SEO 与浏览器', () => {
  assert.equal(classifyUserAgent('Mozilla Googlebot/2.1'), 'search_google');
  assert.equal(classifyUserAgent('Mozilla bingbot/2.0'), 'search_bing');
  assert.equal(classifyUserAgent('Mozilla YandexBot/3.0'), 'search_other');
  assert.equal(classifyUserAgent('Mozilla GPTBot/1.0'), 'ai_openai');
  assert.equal(classifyUserAgent('ClaudeBot/1.0'), 'ai_anthropic');
  assert.equal(classifyUserAgent('PerplexityBot/1.0'), 'ai_perplexity');
  assert.equal(classifyUserAgent('Bytespider'), 'ai_other');
  for (const name of ['ElevenlabsCrawler', 'SERankingBacklinksBot', 'ShapBot', 'RiverBot', 'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot']) {
    assert.equal(classifyUserAgent(name), 'seo_scraper');
  }
  assert.equal(classifyUserAgent('SomeCrawler/1'), 'other_bot');
  assert.equal(classifyUserAgent('Mozilla/5.0 Chrome'), 'browser');
});

test('analyzeTrafficLogs 汇总互动 IP、404 与慢请求', () => {
  const lines = [
    line({ ip: '9.9.9.9', path: '/site.webmanifest', ua: 'Mozilla/5.0' }),
    line({ ip: '9.9.9.9', path: '/api/judge', ua: 'Mozilla/5.0', rt: '0.8' }),
    line({ ip: '8.8.8.8', path: '/blog', ua: 'Mozilla/5.0', ref: 'https://www.jevcode.ai/' }),
    line({ ip: '7.7.7.7', path: '/missing', status: 404, ua: 'Mozilla/5.0' }),
    line({ ip: '7.7.7.7', path: '/wp-login.php', status: 404, ua: 'Mozilla/5.0' }),
    line({ ip: '6.6.6.6', path: '/', ua: 'Googlebot/2.1', status: 301 }),
    line({ path: '/old', day: '01/Jan/2020' }).replace(stamp, '01/Jan/2020'),
  ];
  const report = analyzeTrafficLogs(lines, { days: 1 });
  assert.equal(report.total, 6);
  assert.equal(report.uniqueIps, 4);
  assert.equal(report.status.s2xx, 3);
  assert.equal(report.status.s3xx, 1);
  assert.equal(report.status.s4xx, 2);
  assert.equal(report.engagedBrowserIps, 2);
  assert.equal(report.apiCalls, 1);
  assert.equal(report.slowRequests.count, 1);
  assert.equal(report.slowRequests.maxRt, 0.8);
  assert.deepEqual(report.top404s, [{ path: '/missing', count: 1 }]);
  assert.match(formatTrafficReport(report), /互动浏览器 IP 2/);
  assert.match(formatTrafficReport(report), /404 1 \/missing/);
});

test('CLI --json 读临时日志与账号库，gzip 日志可解析', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'traffic-'));
  try {
    const log = path.join(dir, 't.log');
    const gz = path.join(dir, 'api.log.gz');
    writeFileSync(log, `${line({ path: '/' })}\n`);
    writeFileSync(gz, gzipSync(`${line({ path: '/api/x', ip: '2.2.2.2' })}\n`));
    const db = path.join(dir, 'a.db');
    const accounts = openAccounts(db);
    accounts.createUser('t@example.com');
    accounts.close();
    const r = spawnSync(process.execPath, [
      'scripts/traffic-report.mjs', `--log=${log}`, `--api-log=${gz}`, `--db=${db}`, '--days=1', '--json',
    ], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const report = JSON.parse(r.stdout);
    assert.equal(report.total, 2);
    assert.equal(report.apiCalls, 1);
    assert.equal(report.accounts.users, 1);
    assert.equal(report.accounts.activeKeys, 0);
    assert.equal(typeof report.accounts.spentUsd, 'number');
    assert.equal(report.accounts.vouchers, 0);
    assert.ok(report.accounts.funnel);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readSitemapEntries 合并分片并忽略 sitemap-index', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'smap-'));
  try {
    writeFileSync(path.join(dir, 'sitemap-index.xml'), '<url><loc>https://x/index</loc></url>');
    writeFileSync(path.join(dir, 'sitemap-1.xml'), '<url><loc>https://x/b</loc><lastmod>2026-01-02</lastmod></url>');
    writeFileSync(path.join(dir, 'sitemap-0.xml'), '<url><loc>https://x/a</loc></url>');
    const entries = readSitemapEntries(dir);
    assert.deepEqual(entries.map((e) => e.loc), ['https://x/a', 'https://x/b']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('sync-server-scripts.sh 包含 traffic-report', () => {
  const sh = readFileSync(new URL('../deploy/sync-server-scripts.sh', import.meta.url), 'utf8');
  assert.match(sh, /scripts\/traffic-report\.mjs/);
});
