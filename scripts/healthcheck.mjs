#!/usr/bin/env node
/**
 * 上线自检 / 告警：关键服务与端点的可用性巡检。
 *
 * 用法：
 *   node scripts/healthcheck.mjs
 *
 * 检查项：
 *   - systemd 单元是否 active（jevcode-playground、jevcode-intake、nginx）
 *   - 本机 HTTP 健康端点（playground :8790/health、intake :8787/api/health）
 *   - 公网端点 https://www.jevcode.ai/api/health
 *
 * 告警出口（按序优先）：
 *   ALERT_WEBHOOK_URL  设了就 POST 一份 JSON（适配 Slack/飞书/自建等）
 *   否则写入 stderr / syslog，适合 cron 的 MAILTO 或 journalctl 采集
 *
 * 退出码：全部正常 0；任一失败非 0（便于 cron/监控识别）。
 * 设计：只报「失败」，正常时静默（不产生噪音），避免告警疲劳。
 */

// 未设置该变量时用默认清单；显式置空（HEALTHCHECK_UNITS=）表示不检查该类项。
const splitCsv = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);

const UNIT_NAMES = process.env.HEALTHCHECK_UNITS === undefined
  ? ['jevcode-playground', 'jevcode-intake', 'nginx']
  : splitCsv(process.env.HEALTHCHECK_UNITS);

const HTTP_TARGETS = process.env.HEALTHCHECK_HTTP === undefined
  ? ['http://127.0.0.1:8790/health', 'http://127.0.0.1:8787/api/health', 'https://www.jevcode.ai/api/health']
  : splitCsv(process.env.HEALTHCHECK_HTTP);

const TIMEOUT_MS = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 8000);
const HOST = process.env.HEALTHCHECK_HOST || 'jevcode';

const failures = [];

async function checkUnit(name) {
  const { execFile } = await import('node:child_process');
  return await new Promise((resolve) => {
    execFile('systemctl', ['is-active', name], { timeout: TIMEOUT_MS }, (err, stdout) => {
      const state = String(stdout || '').trim();
      if (state !== 'active') failures.push({ kind: 'systemd', target: name, detail: state || (err && err.message) || 'unknown' });
      resolve();
    });
  });
}

async function checkHttp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) failures.push({ kind: 'http', target: url, detail: `HTTP ${res.status}` });
  } catch (err) {
    failures.push({ kind: 'http', target: url, detail: `请求失败：${err && err.message ? err.message : err}` });
  }
}

async function sendAlert(payload) {
  const url = process.env.ALERT_WEBHOOK_URL;
  const text = `[${HOST}] 巡检发现 ${payload.failures.length} 项异常：\n` +
    payload.failures.map((f) => `- ${f.kind} ${f.target}：${f.detail}`).join('\n');

  if (!url) {
    // 没有 webhook：写 stderr（cron 会按 MAILTO 发信，或由 journal 采集）
    console.error(text);
    return { delivered: false, channel: 'stderr' };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, host: HOST, at: payload.at, failures: payload.failures }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[healthcheck] 告警投递失败 HTTP ${res.status}\n${text}`);
      return { delivered: false, channel: 'webhook', status: res.status };
    }
    return { delivered: true, channel: 'webhook' };
  } catch (err) {
    console.error(`[healthcheck] 告警投递异常：${err && err.message ? err.message : err}\n${text}`);
    return { delivered: false, channel: 'webhook', error: String(err) };
  }
}

async function main() {
  await Promise.all([
    ...UNIT_NAMES.map(checkUnit),
    ...HTTP_TARGETS.map(checkHttp),
  ]);

  if (failures.length === 0) {
    console.log(`[healthcheck] OK（units=${UNIT_NAMES.length} http=${HTTP_TARGETS.length}）`);
    process.exit(0);
  }

  const payload = { at: new Date().toISOString(), failures };
  const r = await sendAlert(payload);
  console.error(`[healthcheck] ${failures.length} 项异常（告警通道=${r.channel}${r.delivered ? ' 已投递' : ' 未投递'}）`);
  process.exit(1);
}

main();
