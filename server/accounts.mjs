/**
 * 账号与额度账本。
 *
 * 余额不走「当前值」字段，而是按事件行累加（充值为正、消费为负）。
 * ledger.cents 这个列名是历史遗留：单位已是微美元（1 USD = 1_000_000）。
 * 旧库在第一次打开时把原美分乘 10000，并用 schema_meta.ledger_unit 保证只做一次。
 *
 * 扣费与 jev-1.13.0 相同：只按输入 token，每百万 $0.042，输出免费。
 * credit() 的金额参数仍是美分，写入时换算成微美元。
 */

import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  SIGNUP_CREDIT_CENTS, SIGNUP_CREDIT_MICROUSD, MICROUSD_PER_CENT,
  centsToUsd, microUsdToUsd, inputCostMicroUsd, inputTokensLeft, PLAN_META,
  INPUT_USD_PER_MILLION, OUTPUT_USD_PER_MILLION, SIGNUP_INPUT_TOKENS,
} from './plans.mjs';

export {
  SIGNUP_CREDIT_CENTS, SIGNUP_CREDIT_MICROUSD, MICROUSD_PER_CENT,
  centsToUsd, microUsdToUsd, inputCostMicroUsd, inputTokensLeft, PLAN_META,
  INPUT_USD_PER_MILLION, OUTPUT_USD_PER_MILLION, SIGNUP_INPUT_TOKENS,
};

/** 一方漏斗允许写入的事件名。其它名字一律丢弃，避免把任意字符串灌进聚合表。 */
export const FUNNEL_EVENTS = Object.freeze([
  'try_run', 'compare_run', 'register_ok', 'login_ok', 'key_created', 'v1_judge_ok', 'voucher_redeemed',
]);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  hash         TEXT NOT NULL UNIQUE,
  prefix       TEXT NOT NULL,
  label        TEXT,
  created_at   INTEGER NOT NULL,
  revoked_at   INTEGER,
  last_used_at INTEGER
);
-- 账目流水：正数为入账，负数为消费。cents 列的单位是微美元。
CREATE TABLE IF NOT EXISTS ledger (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  ts          INTEGER NOT NULL,
  cents       INTEGER NOT NULL,
  kind        TEXT NOT NULL,
  ref         TEXT,
  key_id      TEXT
);
CREATE TABLE IF NOT EXISTS schema_meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_keys_hash ON api_keys(hash);
-- 预付代金券。库里只存明文的 sha256；prefix 供对账，不能反推完整码。
CREATE TABLE IF NOT EXISTS vouchers (
  id          TEXT PRIMARY KEY,
  hash        TEXT NOT NULL UNIQUE,
  prefix      TEXT NOT NULL,
  cents       INTEGER NOT NULL,
  label       TEXT,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER,
  redeemed_by TEXT REFERENCES users(id),
  redeemed_at INTEGER,
  revoked_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_vouchers_hash ON vouchers(hash);
-- 零 PII 的一方漏斗日聚合。day 为 UTC YYYY-MM-DD。
CREATE TABLE IF NOT EXISTS funnel_daily (
  day   TEXT NOT NULL,
  event TEXT NOT NULL,
  lang  TEXT NOT NULL DEFAULT 'unknown',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event, lang)
);
`;

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/** 为存量老库补齐审计列（ledger.key_id 与 api_keys.last_used_at），幂等执行。 */
function migrateAuditColumns(db) {
  const hasCol = (table, col) =>
    db.prepare(`PRAGMA table_info(${table})`).all().some((row) => row.name === col);
  if (!hasCol('ledger', 'key_id')) {
    db.exec('ALTER TABLE ledger ADD COLUMN key_id TEXT');
  }
  if (!hasCol('api_keys', 'last_used_at')) {
    db.exec('ALTER TABLE api_keys ADD COLUMN last_used_at INTEGER');
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_ledger_key ON ledger(key_id, ts)');
}

/** 旧账本的整数是美分。乘 10000 变成微美元，只做一次。 */
function migrateLedgerUnit(db) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const unit = db.prepare("SELECT v FROM schema_meta WHERE k = 'ledger_unit'").get();
    if (!unit) {
      db.prepare('UPDATE ledger SET cents = cents * ?').run(MICROUSD_PER_CENT);
      db.prepare("INSERT INTO schema_meta (k, v) VALUES ('ledger_unit', 'microusd')").run();
    } else if (unit.v !== 'microusd') {
      throw new Error(`unknown ledger unit: ${unit.v}`);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/**
 * 打开（或创建）账本。
 * @param {string} dbPath SQLite 文件路径；目录不存在会自动建
 */
export function openAccounts(dbPath) {
  if (dbPath !== ':memory:') mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  migrateAuditColumns(db);
  migrateLedgerUnit(db);

  const qUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
  const qUserById = db.prepare('SELECT * FROM users WHERE id = ?');
  const qKeyByHash = db.prepare('SELECT * FROM api_keys WHERE hash = ?');
  const qTouchKey = db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?');
  const qBalance = db.prepare(
    'SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE user_id = ?'
  );

  /** 余额，微美元（列名仍是 cents） */
  function balanceMicro(userId) {
    return Number(qBalance.get(userId).c);
  }

  function presentBalance(microUsd) {
    const tokens = inputTokensLeft(microUsd);
    return {
      cents: Math.round(microUsd / MICROUSD_PER_CENT),
      usd: microUsdToUsd(microUsd),
      microUsd,
      inputTokensLeft: tokens,
      judgmentsLeft: tokens,
    };
  }

  /** 记一笔账。金额是微美元。正数入账、负数消费。返回行 id。 */
  function record(userId, microUsd, kind, ref = null, at = Date.now(), keyId = null) {
    const info = db.prepare(
      'INSERT INTO ledger (user_id, ts, cents, kind, ref, key_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, at, microUsd, kind, ref, keyId);
    return Number(info.lastInsertRowid);
  }

  return {
    /** 建用户并赠送注册额度；email 已存在则返回既有用户（幂等，不重复赠送） */
    createUser(email, plan = 'free', at = Date.now()) {
      const found = qUserByEmail.get(email);
      if (found) return found;
      const id = randomUUID();
      db.prepare('INSERT INTO users (id, email, plan, created_at) VALUES (?, ?, ?, ?)').run(
        id, email, plan, at
      );
      record(id, SIGNUP_CREDIT_MICROUSD, 'signup_credit', null, at);
      return qUserById.get(id);
    },

    getUser: (id) => qUserById.get(id) || null,
    getUserByEmail: (email) => qUserByEmail.get(email) || null,

    /** 余额，微美元 */
    balanceMicro,

    /**
     * 面向展示的余额。cents 四舍五入到美分，避免一次不足 1 美分的调用
     * 把 $5.00 显示成 $4.99。精确值看 usd / microUsd。
     */
    balance(userId) {
      const user = qUserById.get(userId);
      if (!user) return null;
      return presentBalance(balanceMicro(userId));
    },

    /**
     * 原子预扣输入 token 费用（BEGIN IMMEDIATE），消除并发请求下的 TOCTOU 超扣竞态。
     * 上游调用失败时调用方应按返回的 entryId 调 refundEntry() 精确回退。
     */
    reserveInputTokens(userId, tokens, { keyId = null, at = Date.now() } = {}) {
      db.exec('BEGIN IMMEDIATE');
      try {
        if (!qUserById.get(userId)) {
          db.exec('ROLLBACK');
          return { ok: false, reason: 'no-such-user' };
        }
        const n = Math.floor(Number(tokens));
        const cost = inputCostMicroUsd(n);
        const microUsd = balanceMicro(userId);
        if (microUsd < cost) {
          db.exec('ROLLBACK');
          return { ok: false, reason: 'insufficient_credit', balance: presentBalance(microUsd) };
        }
        const entryId = cost > 0 ? record(userId, -cost, 'judge', String(n), at, keyId) : null;
        db.exec('COMMIT');
        return { ok: true, entryId, cost, balance: presentBalance(microUsd - cost) };
      } catch (err) {
        try { db.exec('ROLLBACK'); } catch { /* ignore */ }
        throw err;
      }
    },

    /**
     * 按精确账目行 id 撤销一笔判定扣费（并发安全，不会误删其他请求的扣费）。
     * @returns {boolean}
     */
    refundEntry(entryId) {
      if (entryId == null) return false;
      const info = db.prepare(
        "DELETE FROM ledger WHERE id = ? AND kind = 'judge' AND cents < 0"
      ).run(entryId);
      return info.changes > 0;
    },

    /**
     * 按输入 token 扣费（原子事务）。余额不够则整笔拒绝，不写账。
     */
    chargeInputTokens(userId, tokens, at = Date.now(), keyId = null) {
      return this.reserveInputTokens(userId, tokens, { keyId, at });
    },

    /**
     * 删掉最近一笔判定扣费（整行）。没有可退的行则返回 false。
     * @returns {boolean}
     */
    refund(userId) {
      const row = db.prepare(
        "SELECT id FROM ledger WHERE user_id = ? AND kind = 'judge' AND cents < 0 ORDER BY ts DESC, id DESC LIMIT 1"
      ).get(userId);
      if (!row) return false;
      db.prepare('DELETE FROM ledger WHERE id = ?').run(row.id);
      return true;
    },

    /**
     * 手工入账。cents 是美分（人看的美元分），入库时换成微美元。
     */
    credit(userId, cents, kind = 'topup', ref = null, at = Date.now()) {
      if (!qUserById.get(userId)) return false;
      if (!Number.isInteger(cents) || cents <= 0) throw new Error('credit must be a positive integer');
      record(userId, cents * MICROUSD_PER_CENT, kind, ref, at);
      return this.balance(userId);
    },

    /** 某用户的流水，新的在前。cents 列是微美元，展示前要换算。 */
    entries: (userId, limit = 100) =>
      db.prepare(
        'SELECT ts, cents, kind, ref, key_id FROM ledger WHERE user_id = ? ORDER BY ts DESC, id DESC LIMIT ?'
      ).all(userId, limit),

    /** 累计消费，微美元 */
    spentMicroUsd(userId) {
      return Math.abs(Number(db.prepare(
        "SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE user_id = ? AND cents < 0"
      ).get(userId).c));
    },

    /** 累计消费折成美分，不足 1 美分为 0 */
    spentCents(userId) {
      return Math.floor(this.spentMicroUsd(userId) / MICROUSD_PER_CENT);
    },

    /**
     * 签发 API Key。明文只在此返回一次，库里只存 sha256 与前缀。
     */
    issueKey(userId, label = '', at = Date.now()) {
      if (!qUserById.get(userId)) throw new Error('no such user');
      const key = `jev_${randomBytes(24).toString('base64url')}`;
      const id = randomUUID();
      db.prepare(
        'INSERT INTO api_keys (id, user_id, hash, prefix, label, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, userId, sha256(key), key.slice(0, 12), label, at);
      return { key, record: { id, userId, prefix: key.slice(0, 12), label, createdAt: at } };
    },

    /** 用明文 key 换用户并刷新 last_used_at；未注册或已吊销返回 null */
    resolveKey(key, at = Date.now()) {
      if (typeof key !== 'string' || !key) return null;
      const row = qKeyByHash.get(sha256(key));
      if (!row || row.revoked_at) return null;
      const user = qUserById.get(row.user_id);
      if (!user) return null;
      try {
        qTouchKey.run(at, row.id);
      } catch {
        // 只读打开等极端情形不阻断鉴权
      }
      return { user, keyId: row.id };
    },

    revokeKey(keyId, at = Date.now()) {
      const info = db.prepare('UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
        .run(at, keyId);
      return info.changes > 0;
    },

    listKeys(userId) {
      return db.prepare(
        'SELECT id, prefix, label, created_at, revoked_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at'
      ).all(userId);
    },

    /**
     * 签发预付代金券。明文 code 只在返回值里出现一次，库里只存 sha256。
     * cents 为美分；expiresAt 为毫秒时间戳或 null。
     */
    issueVoucher(cents, { label = '', expiresAt = null, at = Date.now() } = {}) {
      if (!Number.isInteger(cents) || cents <= 0) {
        throw new Error('voucher cents must be a positive integer');
      }
      if (!(expiresAt == null || (Number.isFinite(expiresAt) && expiresAt > at))) {
        throw new Error('voucher expiresAt must be null or a future timestamp');
      }
      const code = `jev_v_${randomBytes(18).toString('base64url')}`;
      const id = randomUUID();
      const prefix = code.slice(0, 12);
      const cleanLabel = String(label || '').slice(0, 80);
      const exp = expiresAt ?? null;
      db.prepare(
        'INSERT INTO vouchers (id, hash, prefix, cents, label, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, sha256(code), prefix, cents, cleanLabel, at, exp);
      return {
        code,
        record: {
          id,
          prefix,
          cents,
          usd: centsToUsd(cents),
          label: cleanLabel,
          createdAt: at,
          expiresAt: exp,
        },
      };
    },

    /**
     * 兑换代金券。检查、标记、入账放在同一个 IMMEDIATE 事务里，重放不会双倍入账。
     */
    redeemVoucher(userId, rawCode, at = Date.now()) {
      const code = String(rawCode || '').trim();
      if (!code) return { ok: false, reason: 'invalid_code' };

      const rollback = (result) => {
        db.exec('ROLLBACK');
        return result;
      };

      db.exec('BEGIN IMMEDIATE');
      try {
        if (!qUserById.get(userId)) return rollback({ ok: false, reason: 'no_such_user' });
        const row = db.prepare('SELECT * FROM vouchers WHERE hash = ?').get(sha256(code));
        if (!row) return rollback({ ok: false, reason: 'not_found' });
        if (row.revoked_at != null) return rollback({ ok: false, reason: 'revoked' });
        if (row.redeemed_at != null) return rollback({ ok: false, reason: 'already_redeemed' });
        if (row.expires_at != null && at >= row.expires_at) return rollback({ ok: false, reason: 'expired' });

        const info = db.prepare(
          'UPDATE vouchers SET redeemed_by = ?, redeemed_at = ? WHERE id = ? AND redeemed_at IS NULL AND revoked_at IS NULL'
        ).run(userId, at, row.id);
        if (info.changes !== 1) {
          throw new Error('voucher redeem did not update exactly one row');
        }
        record(userId, row.cents * MICROUSD_PER_CENT, 'topup', `voucher:${row.prefix}`, at);
        db.exec('COMMIT');
        return {
          ok: true,
          voucherId: row.id,
          prefix: row.prefix,
          creditedCents: row.cents,
          creditedUsd: centsToUsd(row.cents),
          balance: presentBalance(balanceMicro(userId)),
        };
      } catch (err) {
        try { db.exec('ROLLBACK'); } catch { /* 未开始或已结束 */ }
        throw err;
      }
    },

    /** 代金券列表，新的在前。不返回 hash。 */
    listVouchers(limit = 100) {
      const n = Number.isInteger(limit) && limit > 0 ? limit : 100;
      return db.prepare(
        `SELECT id, prefix, cents, label, created_at, expires_at, redeemed_by, redeemed_at, revoked_at
         FROM vouchers ORDER BY created_at DESC LIMIT ?`
      ).all(n);
    },

    /** 吊销尚未兑换的券。已兑换或已吊销返回 false。 */
    revokeVoucher(id, at = Date.now()) {
      const info = db.prepare(
        'UPDATE vouchers SET revoked_at = ? WHERE id = ? AND redeemed_at IS NULL AND revoked_at IS NULL'
      ).run(at, id);
      return info.changes > 0;
    },

    /** 用户列表，新的在前。余额与消费为微美元，activeKeys 不含已吊销的 key。 */
    listUsers(limit = 100) {
      const n = Number.isInteger(limit) && limit > 0 ? limit : 100;
      return db.prepare(
        `SELECT u.id, u.email, u.plan, u.created_at,
                COALESCE((SELECT SUM(cents) FROM ledger WHERE user_id = u.id), 0) AS balanceMicroUsd,
                COALESCE((SELECT SUM(CASE WHEN cents < 0 THEN -cents ELSE 0 END) FROM ledger WHERE user_id = u.id), 0) AS spentMicroUsd,
                (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id AND revoked_at IS NULL) AS activeKeys
         FROM users u
         ORDER BY u.created_at DESC
         LIMIT ?`
      ).all(n).map((row) => ({
        id: row.id,
        email: row.email,
        plan: row.plan,
        created_at: row.created_at,
        balanceMicroUsd: Number(row.balanceMicroUsd),
        spentMicroUsd: Number(row.spentMicroUsd),
        activeKeys: Number(row.activeKeys),
      }));
    },

    /**
     * 记一条零 PII 漏斗事件。非法事件名返回 false。
     * 只读库或写入失败时吞掉错误，遥测不能拖垮请求。
     */
    recordEvent(event, lang = 'unknown', at = Date.now()) {
      if (!FUNNEL_EVENTS.includes(event)) return false;
      const cleanLang = /^[a-z]{2}$/.test(lang) ? lang : 'unknown';
      const day = new Date(at).toISOString().slice(0, 10);
      try {
        db.prepare(
          `INSERT INTO funnel_daily (day, event, lang, count) VALUES (?, ?, ?, 1)
           ON CONFLICT(day, event, lang) DO UPDATE SET count = count + 1`
        ).run(day, event, cleanLang);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * 最近 days 天（含今天）的漏斗汇总。since 为窗口起始 UTC 日期。
     * totals / byDay.events 按事件名累加，不区分语言。
     */
    funnelSummary(days = 7, now = Date.now()) {
      const n = Number.isInteger(days) && days > 0 ? days : 7;
      const todayStart = Date.parse(`${new Date(now).toISOString().slice(0, 10)}T00:00:00.000Z`);
      const since = new Date(todayStart - (n - 1) * 86400000).toISOString().slice(0, 10);
      const rows = db.prepare(
        'SELECT day, event, count FROM funnel_daily WHERE day >= ? ORDER BY day ASC'
      ).all(since);
      const totals = {};
      const byDayMap = new Map();
      for (const row of rows) {
        const count = Number(row.count);
        totals[row.event] = (totals[row.event] || 0) + count;
        if (!byDayMap.has(row.day)) byDayMap.set(row.day, {});
        const events = byDayMap.get(row.day);
        events[row.event] = (events[row.event] || 0) + count;
      }
      const byDay = [...byDayMap.entries()].map(([day, events]) => ({ day, events }));
      return { days: n, since, totals, byDay };
    },

    close: () => db.close(),
    _db: db,
  };
}
