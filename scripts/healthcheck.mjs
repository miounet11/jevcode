#!/usr/bin/env node
/**
 * 上线自检 / 告警：关键服务与端点的可用性巡检。
 *
 * 用法：
 *   node scripts/healthcheck.mjs
 *
 * 检查项：
 *   - systemd 单元是否 active（jevcode-playground、jevcode-intake、nginx）
 *   - 本机 HTTP 健康端点（playground :8790/health、intake :8791/api/health）
 *   - 公网端点 https://www.jevcode.ai/api/health
 *   - 账号库备份新鲜度（最新快照是否在 BACKUP_MAX_AGE_MIN 分钟内）
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

// systemd 只在 Linux 上有。在 macOS 上保留默认清单只会得到 3 条 ENOENT，
// 每天推送假告警——巡检一旦开始说谎，真故障就没人信了。
const UNIT_NAMES = process.env.HEALTHCHECK_UNITS === undefined
  ? (process.platform === 'linux' ? ['jevcode-playground', 'jevcode-intake', 'nginx'] : [])
  : splitCsv(process.env.HEALTHCHECK_UNITS);

const HTTP_TARGETS = process.env.HEALTHCHECK_HTTP === undefined
  ? ['http://127.0.0.1:8790/health', 'http://127.0.0.1:8791/api/health', 'https://www.jevcode.ai/api/health']
  : splitCsv(process.env.HEALTHCHECK_HTTP);

const TIMEOUT_MS = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 8000);
const HOST = process.env.HEALTHCHECK_HOST || 'jevcode';

// 备份目录与新鲜度阈值。显式置空（HEALTHCHECK_BACKUP_DIR=）表示不检查该项。
const BACKUP_DIR = process.env.HEALTHCHECK_BACKUP_DIR === undefined
  ? '/var/backups/jevcode-accounts'
  : process.env.HEALTHCHECK_BACKUP_DIR;
const BACKUP_MAX_AGE_MIN = Number(process.env.HEALTHCHECK_BACKUP_MAX_AGE_MIN || 180);
const BACKUP_GLOB_RE = /^accounts-(\d{8}T\d{6})Z\.db$/;

const failures = [];

/**
 * 判断某项真实状态，返回失败描述；正常返回 null。
 *
 * macOS 上没有 systemctl，直接跑会得到 ENOENT——那是「检查手段不存在」，
 * 不是「服务挂了」。把它当失败会让每天巡检固定推 3 条假告警，告警就没人看了。
 */
export function unitFailure(state, errMessage) {
  if (state === 'active') return null;
  if (/ENOENT/.test(String(errMessage || '')) || state === 'unsupported') return 'unsupported';
  return state || errMessage || 'unknown';
}

async function checkUnit(name) {
  const { execFile } = await import('node:child_process');
  const platformSupported = process.platform === 'linux';
  if (!platformSupported) return; // 非 systemd 平台不检查这一类，由调用方按平台决定清单
  return await new Promise((resolve) => {
    execFile('systemctl', ['is-active', name], { timeout: TIMEOUT_MS }, (err, stdout) => {
      const detail = unitFailure(String(stdout || '').trim(), err && err.message);
      if (detail && detail !== 'unsupported') {
        failures.push({ kind: 'systemd', target: name, detail });
      }
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

async function checkBackup() {
  // 备份 cron 静默坏掉时，光看目录「有文件」不够——要确认最新一份足够新。
  const { readdirSync } = await import('node:fs');
  const target = `备份目录 ${BACKUP_DIR}`;
  let files;
  try {
    files = readdirSync(BACKUP_DIR);
  } catch (err) {
    failures.push({ kind: 'backup', target, detail: `无法读取目录：${err && err.message ? err.message : err}` });
    return;
  }

  const stamps = files
    .map((f) => BACKUP_GLOB_RE.exec(f))
    .filter(Boolean)
    .map((m) => {
      const s = m[1]; // YYYYMMDDTHHMMSS
      const t = Date.UTC(
        Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)),
        Number(s.slice(9, 11)), Number(s.slice(11, 13)), Number(s.slice(13, 15)),
      );
      return t;
    })
    .filter((t) => Number.isFinite(t));

  if (stamps.length === 0) {
    failures.push({ kind: 'backup', target, detail: '目录里没有任何快照文件' });
    return;
  }

  const newest = Math.max(...stamps);
  const ageMin = (Date.now() - newest) / 60000;
  if (ageMin > BACKUP_MAX_AGE_MIN) {
    failures.push({
      kind: 'backup', target,
      detail: `最新快照已过期：${Math.round(ageMin)} 分钟前（阈值 ${BACKUP_MAX_AGE_MIN} 分钟）`,
    });
  }
}

async function sendAlert(payload) {
  // 飞书机器人要吃 msg_type/content.text，和 Slack 的 {text} 不同形。
  // 走 notify-feishu.mjs 统一出口，避免两处各写一套格式。
  const feishu = process.env.FEISHU_WEBHOOK;
  if (feishu) {
    const { execFile } = await import('node:child_process');
    const text = payload.failures.map((f) => `- ${f.kind} ${f.target}：${f.detail}`).join('\n');
    return await new Promise((resolve) => {
      execFile(
        process.execPath,
        ['scripts/notify-feishu.mjs', `巡检发现 ${payload.failures.length} 项异常`, text],
        { env: process.env, timeout: TIMEOUT_MS },
        (err) => resolve(err
          ? { delivered: false, channel: 'feishu', error: String(err.message ?? err) }
          : { delivered: true, channel: 'feishu' }),
      );
    });
  }

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
    ...(BACKUP_DIR ? [checkBackup()] : []),
  ]);

  if (failures.length === 0) {
    const backupNote = BACKUP_DIR ? ` backup<=${BACKUP_MAX_AGE_MIN}min` : ' backup=off';
    console.log(`[healthcheck] OK（units=${UNIT_NAMES.length} http=${HTTP_TARGETS.length}${backupNote}）`);
    process.exit(0);
  }

  const payload = { at: new Date().toISOString(), failures };
  const r = await sendAlert(payload);
  console.error(`[healthcheck] ${failures.length} 项异常（告警通道=${r.channel}${r.delivered ? ' 已投递' : ' 未投递'}）`);
  process.exit(1);
}

// 被测试 import 时不能自动跑：main() 会真的发起网络请求并以 process.exit(1)
// 结束，把整个测试进程带走（实测：只因导入 unitFailure 就让整套测试失败）。
if (import.meta.url === `file://${process.argv[1]}`) main();
