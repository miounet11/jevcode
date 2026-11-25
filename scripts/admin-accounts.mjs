#!/usr/bin/env node
/**
 * 账号运维 CLI：汇总、用户、手工入账、代金券签发 / 列表 / 吊销。
 *
 * 部署到 /opt/jevcode-playground/ 时 accounts.mjs 与本脚本同目录；
 * 仓库里则从 ../server/accounts.mjs 加载。零外部依赖。
 *
 * 用法：
 *   node scripts/admin-accounts.mjs summary [--days=7] [--json] [--db=path]
 *   node scripts/admin-accounts.mjs users [--limit=50] [--json] [--db=path]
 *   node scripts/admin-accounts.mjs credit <email> <cents> [--ref=manual] [--json] [--db=path]
 *   node scripts/admin-accounts.mjs issue-voucher <cents> [--label=...] [--days=90] [--json] [--db=path]
 *   node scripts/admin-accounts.mjs vouchers [--limit=100] [--json] [--db=path]
 *   node scripts/admin-accounts.mjs revoke-voucher <id> [--json] [--db=path]
 *
 * 代金券明文只在签发时打印一次。
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const localAccounts = path.join(here, 'accounts.mjs');
const fallbackAccounts = path.join(here, '..', 'server', 'accounts.mjs');
const accountsPath = existsSync(localAccounts) ? localAccounts : fallbackAccounts;
const { openAccounts, centsToUsd, microUsdToUsd } = await import(pathToFileURL(accountsPath).href);

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq === -1) flags[a.slice(2)] = true;
      else flags[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const cmd = positional[0];
const dbPath = (typeof flags.db === 'string' && flags.db)
  ? flags.db
  : (process.env.PLAYGROUND_ACCOUNTS_DB || '/var/lib/jevcode-accounts/accounts.db');
const asJson = Boolean(flags.json);

let accounts = null;

class Exit extends Error {}

/** 打印错误并中止。自然退出以便管道里的 stdout 刷完。 */
function die(msg) {
  console.error(msg);
  process.exitCode = 1;
  throw new Exit('die');
}

function emit(payload, human) {
  if (asJson) console.log(JSON.stringify(payload));
  else console.log(human);
}

function positiveInt(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) die(`${name} must be a positive integer`);
  return n;
}

function voucherStatus(row, now = Date.now()) {
  if (row.revoked_at != null) return 'revoked';
  if (row.redeemed_at != null) return 'redeemed';
  if (row.expires_at != null && now >= row.expires_at) return 'expired';
  return 'active';
}

function presentVoucher(row, now = Date.now()) {
  return {
    id: row.id,
    prefix: row.prefix,
    cents: row.cents,
    usd: centsToUsd(row.cents),
    label: row.label || '',
    status: voucherStatus(row, now),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    redeemedBy: row.redeemed_by,
    redeemedAt: row.redeemed_at,
    revokedAt: row.revoked_at,
  };
}

const USAGE = `usage: admin-accounts.mjs <summary|users|credit|issue-voucher|vouchers|revoke-voucher> [--db=path] [--json]`;

try {
  if (!cmd || flags.help) die(USAGE);

  try {
    accounts = openAccounts(dbPath);
  } catch (err) {
    if (err instanceof Exit) throw err;
    die(`failed to open accounts db: ${err && err.message ? err.message : err}`);
  }

  const db = accounts._db;

  if (cmd === 'summary') {
    const days = flags.days == null ? 7 : positiveInt(flags.days, '--days');
    const users = Number(db.prepare('SELECT COUNT(*) AS c FROM users').get().c);
    const activeKeys = Number(db.prepare(
      'SELECT COUNT(*) AS c FROM api_keys WHERE revoked_at IS NULL'
    ).get().c);
    const usedKeys = Number(db.prepare(
      'SELECT COUNT(*) AS c FROM api_keys WHERE last_used_at IS NOT NULL'
    ).get().c);
    const granted = Number(db.prepare(
      'SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE cents > 0'
    ).get().c);
    const topup = Number(db.prepare(
      "SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE kind = 'topup'"
    ).get().c);
    const spent = Number(db.prepare(
      'SELECT COALESCE(SUM(-cents), 0) AS c FROM ledger WHERE cents < 0'
    ).get().c);
    const now = Date.now();
    const vouchers = db.prepare(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN redeemed_at IS NULL AND revoked_at IS NULL
           AND (expires_at IS NULL OR expires_at > ?) THEN 1 ELSE 0 END), 0) AS active,
         COALESCE(SUM(CASE WHEN redeemed_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS redeemed,
         COALESCE(SUM(CASE WHEN revoked_at IS NOT NULL AND redeemed_at IS NULL THEN 1 ELSE 0 END), 0) AS revoked,
         COALESCE(SUM(CASE WHEN redeemed_at IS NULL AND revoked_at IS NULL
           AND expires_at IS NOT NULL AND expires_at <= ? THEN 1 ELSE 0 END), 0) AS expired
       FROM vouchers`
    ).get(now, now);
    const funnel = accounts.funnelSummary(days, now);
    const payload = {
      users,
      keys: { active: activeKeys, used: usedKeys },
      usd: {
        granted: microUsdToUsd(granted),
        topup: microUsdToUsd(topup),
        spent: microUsdToUsd(spent),
      },
      vouchers: {
        total: Number(vouchers.total),
        active: Number(vouchers.active),
        redeemed: Number(vouchers.redeemed),
        revoked: Number(vouchers.revoked),
        expired: Number(vouchers.expired),
      },
      funnel: { days: funnel.days, since: funnel.since, totals: funnel.totals },
    };
    const lines = [
      `users: ${payload.users}`,
      `api keys: ${payload.keys.active} active, ${payload.keys.used} used`,
      `granted: $${payload.usd.granted}`,
      `topup: $${payload.usd.topup}`,
      `spent: $${payload.usd.spent}`,
      `vouchers: ${payload.vouchers.total} total, ${payload.vouchers.active} active, ${payload.vouchers.redeemed} redeemed, ${payload.vouchers.revoked} revoked, ${payload.vouchers.expired} expired`,
      `funnel (${payload.funnel.days}d since ${payload.funnel.since}):`,
    ];
    const events = Object.entries(payload.funnel.totals);
    if (events.length === 0) lines.push('  (none)');
    else for (const [event, count] of events) lines.push(`  ${event}: ${count}`);
    emit(payload, lines.join('\n'));
  } else if (cmd === 'users') {
    const limit = flags.limit == null ? 50 : positiveInt(flags.limit, '--limit');
    const rows = accounts.listUsers(limit).map((u) => ({
      id: u.id,
      email: u.email,
      plan: u.plan,
      createdAt: new Date(u.created_at).toISOString(),
      balanceUsd: microUsdToUsd(u.balanceMicroUsd),
      spentUsd: microUsdToUsd(u.spentMicroUsd),
      activeKeys: u.activeKeys,
      balanceMicroUsd: u.balanceMicroUsd,
      spentMicroUsd: u.spentMicroUsd,
    }));
    const human = rows.length === 0
      ? 'no users'
      : ['email\tplan\tbalance_usd\tspent_usd\tactive_keys\tcreated',
        ...rows.map((u) => `${u.email}\t${u.plan}\t${u.balanceUsd}\t${u.spentUsd}\t${u.activeKeys}\t${u.createdAt}`),
      ].join('\n');
    emit(rows, human);
  } else if (cmd === 'credit') {
    const email = String(positional[1] || '').trim();
    const cents = positiveInt(positional[2], 'cents');
    if (!email) die('credit requires <email> <cents>');
    const user = accounts.getUserByEmail(email) || accounts.getUserByEmail(email.toLowerCase());
    if (!user) die(`no such user: ${email}`);
    const ref = typeof flags.ref === 'string' && flags.ref ? flags.ref : 'manual';
    const balance = accounts.credit(user.id, cents, 'topup', ref);
    if (!balance) die(`no such user: ${email}`);
    const payload = {
      ok: true,
      email: user.email,
      creditedCents: cents,
      creditedUsd: centsToUsd(cents),
      ref,
      balance,
    };
    emit(payload, `credited ${email} $${payload.creditedUsd} (ref ${ref}); balance $${balance.usd}`);
  } else if (cmd === 'issue-voucher') {
    const cents = positiveInt(positional[1], 'cents');
    const label = typeof flags.label === 'string' ? flags.label : '';
    const days = flags.days == null ? 90 : positiveInt(flags.days, '--days');
    const at = Date.now();
    const expiresAt = at + days * 86400000;
    const { code, record } = accounts.issueVoucher(cents, { label, expiresAt, at });
    const warning = 'This code is shown only once. Store it now; it cannot be shown again.';
    const payload = {
      warning,
      code,
      id: record.id,
      prefix: record.prefix,
      cents: record.cents,
      usd: record.usd,
      label: record.label,
      expiresAt: record.expiresAt,
    };
    emit(payload, `WARNING: ${warning}\ncode: ${code}\nprefix: ${record.prefix}\ncents: ${record.cents} ($${record.usd})\nexpires: ${new Date(record.expiresAt).toISOString()}`);
  } else if (cmd === 'vouchers') {
    const limit = flags.limit == null ? 100 : positiveInt(flags.limit, '--limit');
    const now = Date.now();
    const rows = accounts.listVouchers(limit).map((row) => presentVoucher(row, now));
    const human = rows.length === 0
      ? 'no vouchers'
      : ['status\tprefix\tusd\tlabel\tid\tcreated',
        ...rows.map((v) => `${v.status}\t${v.prefix}\t${v.usd}\t${v.label}\t${v.id}\t${new Date(v.createdAt).toISOString()}`),
      ].join('\n');
    emit(rows, human);
  } else if (cmd === 'revoke-voucher') {
    const id = String(positional[1] || '').trim();
    if (!id) die('revoke-voucher requires <id>');
    const ok = accounts.revokeVoucher(id);
    if (!ok) die(`could not revoke voucher (missing, redeemed, or already revoked): ${id}`);
    emit({ ok: true, id }, `revoked ${id}`);
  } else {
    die(USAGE);
  }
} catch (err) {
  if (!(err instanceof Exit)) {
    console.error(err && err.message ? err.message : String(err));
    process.exitCode = 1;
  }
} finally {
  try { accounts?.close(); } catch { /* ignore */ }
}
