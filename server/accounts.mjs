/**
 * 账号与额度账本 —— 会员体系的地基。
 *
 * 回答两个服务端必须知道的问题：谁在用、还剩多少钱。
 *
 * 口径（刻意保持简单）：注册送 $5，账号+密码即可，按次扣费，用完为止。
 * 存储用 node:sqlite（Node 22.5+ 内置，零外部依赖）。
 *
 * 余额不走「当前值」字段，而是**按事件行累加**（充值为正、消费为负）。
 * 这样账目可审计、可对账，也不会因为并发写把余额写花；余额查询是
 * SUM 聚合，量级在这（单机、每用户几百行）完全够用。
 */

import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  SIGNUP_CREDIT_CENTS, JUDGE_PRICE_CENTS, centsToUsd, SIGNUP_JUDGMENTS, PLAN_META,
} from './plans.mjs';

export { SIGNUP_CREDIT_CENTS, JUDGE_PRICE_CENTS, centsToUsd, SIGNUP_JUDGMENTS, PLAN_META };

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
-- 账目流水：正数为入账（注册赠送、充值），负数为消费
CREATE TABLE IF NOT EXISTS ledger (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  ts          INTEGER NOT NULL,
  cents       INTEGER NOT NULL,
  kind        TEXT NOT NULL,
  ref         TEXT
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_keys_hash ON api_keys(hash);
`;

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

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

  const qUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
  const qUserById = db.prepare('SELECT * FROM users WHERE id = ?');
  const qKeyByHash = db.prepare('SELECT * FROM api_keys WHERE hash = ?');
  const qBalance = db.prepare(
    'SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE user_id = ?'
  );

  /** 余额（美分） */
  function balanceCents(userId) {
    return Number(qBalance.get(userId).c);
  }

  /** 记一笔账。正数入账、负数消费，由调用方决定符号。 */
  function record(userId, cents, kind, ref = null, at = Date.now()) {
    db.prepare('INSERT INTO ledger (user_id, ts, cents, kind, ref) VALUES (?, ?, ?, ?, ?)')
      .run(userId, at, cents, kind, ref);
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
      record(id, SIGNUP_CREDIT_CENTS, 'signup_credit', null, at);
      return qUserById.get(id);
    },

    getUser: (id) => qUserById.get(id) || null,
    getUserByEmail: (email) => qUserByEmail.get(email) || null,

    /** 余额（美分） */
    balanceCents,

    /** 面向展示的余额信息 */
    balance(userId) {
      const user = qUserById.get(userId);
      if (!user) return null;
      const cents = balanceCents(userId);
      return {
        cents,
        usd: centsToUsd(cents),
        judgmentsLeft: Math.floor(cents / JUDGE_PRICE_CENTS),
      };
    },

    /**
     * 扣一次判定费。余额不足即拒绝，不写账。
     * 判定失败时调用 refund 退回。
     */
    consume(userId, n = 1, at = Date.now()) {
      if (!qUserById.get(userId)) return { ok: false, reason: 'no-such-user' };
      const cost = JUDGE_PRICE_CENTS * n;
      const cents = balanceCents(userId);
      if (cents < cost) {
        return { ok: false, reason: 'insufficient_credit', balance: this.balance(userId) };
      }
      record(userId, -cost, 'judge', null, at);
      return { ok: true, balance: this.balance(userId) };
    },

    /**
     * 退还最近一笔判定费（上游失败时用，避免用户白扣）。
     * @returns {boolean} 是否真的退到
     */
    refund(userId, n = 1) {
      const cost = JUDGE_PRICE_CENTS * n;
      const row = db.prepare(
        "SELECT id, cents FROM ledger WHERE user_id = ? AND kind = 'judge' AND cents <= ? ORDER BY ts DESC, id DESC LIMIT 1"
      ).get(userId, -cost);
      if (!row) return false;
      if (row.cents === -cost) {
        db.prepare('DELETE FROM ledger WHERE id = ?').run(row.id);
      } else {
        db.prepare('UPDATE ledger SET cents = cents + ? WHERE id = ?').run(cost, row.id);
      }
      return true;
    },

    /** 手工入账（充值/补偿用） */
    credit(userId, cents, kind = 'topup', ref = null, at = Date.now()) {
      if (!qUserById.get(userId)) return false;
      if (!Number.isInteger(cents) || cents <= 0) throw new Error('credit must be a positive integer');
      record(userId, cents, kind, ref, at);
      return this.balance(userId);
    },

    /** 某用户的流水，新的在前 */
    entries: (userId, limit = 100) =>
      db.prepare(
        'SELECT ts, cents, kind, ref FROM ledger WHERE user_id = ? ORDER BY ts DESC, id DESC LIMIT ?'
      ).all(userId, limit),

    /** 累计消费（美分） */
    spentCents(userId) {
      return Math.abs(Number(db.prepare(
        "SELECT COALESCE(SUM(cents), 0) AS c FROM ledger WHERE user_id = ? AND cents < 0"
      ).get(userId).c));
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
