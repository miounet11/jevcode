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

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  hash        TEXT NOT NULL UNIQUE,
  prefix      TEXT NOT NULL,
  label       TEXT,
  created_at  INTEGER NOT NULL,
  revoked_at  INTEGER
);
-- 账目流水：正数为入账，负数为消费。cents 列的单位是微美元。
CREATE TABLE IF NOT EXISTS ledger (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  ts          INTEGER NOT NULL,
  cents       INTEGER NOT NULL,
  kind        TEXT NOT NULL,
  ref         TEXT
);
CREATE TABLE IF NOT EXISTS schema_meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_keys_hash ON api_keys(hash);
`;

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

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
  migrateLedgerUnit(db);

  const qUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
  const qUserById = db.prepare('SELECT * FROM users WHERE id = ?');
  const qKeyByHash = db.prepare('SELECT * FROM api_keys WHERE hash = ?');
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

  /** 记一笔账。金额是微美元。正数入账、负数消费。 */
  function record(userId, microUsd, kind, ref = null, at = Date.now()) {
    db.prepare('INSERT INTO ledger (user_id, ts, cents, kind, ref) VALUES (?, ?, ?, ?, ?)')
      .run(userId, at, microUsd, kind, ref);
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
     * 按输入 token 扣费。余额不够则整笔拒绝，不写账。
     * 调用方应在上游成功后再扣，失败不必走 refund。
     */
    chargeInputTokens(userId, tokens, at = Date.now()) {
      if (!qUserById.get(userId)) return { ok: false, reason: 'no-such-user' };
      const n = Math.floor(Number(tokens));
      const cost = inputCostMicroUsd(n);
      const microUsd = balanceMicro(userId);
      if (microUsd < cost) {
        return { ok: false, reason: 'insufficient_credit', balance: presentBalance(microUsd) };
      }
      if (cost > 0) record(userId, -cost, 'judge', String(n), at);
      return { ok: true, balance: this.balance(userId), cost };
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
        'SELECT ts, cents, kind, ref FROM ledger WHERE user_id = ? ORDER BY ts DESC, id DESC LIMIT ?'
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

    /** 用明文 key 换用户；未注册或已吊销返回 null */
    resolveKey(key) {
      if (typeof key !== 'string' || !key) return null;
      const row = qKeyByHash.get(sha256(key));
      if (!row || row.revoked_at) return null;
      const user = qUserById.get(row.user_id);
      return user ? { user, keyId: row.id } : null;
    },

    revokeKey(keyId, at = Date.now()) {
      const info = db.prepare('UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
        .run(at, keyId);
      return info.changes > 0;
    },

    listKeys(userId) {
      return db.prepare(
        'SELECT id, prefix, label, created_at, revoked_at FROM api_keys WHERE user_id = ? ORDER BY created_at'
      ).all(userId);
    },

    close: () => db.close(),
    _db: db,
  };
}
