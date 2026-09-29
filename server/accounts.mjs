/**
 * 账号与额度账本 —— 会员体系的地基。
 *
 * 回答两个服务端必须知道的问题：谁在用、还能用多少次。
 *
 * 存储用 node:sqlite（Node 22.5+ 内置，零外部依赖）。额度按「事件行」记录、
 * 查询时按时间窗汇总：不需要定时翻滚任务，窗口天然滑动，重启不丢。
 *
 * 计费口径参考 clavue.com 实测结构（日/周/月三窗、可多轨），但默认值只落实
 * 用户明确给出的「每人 25」；付费档留占位，定价定下来后改 PLANS 一处即可。
 */

import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/** 时间窗长度（毫秒） */
export const WINDOWS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

/**
 * 套餐额度。null = 该窗口不限。
 * free.day = 25 是用户明确给出的口径；其余为占位，待定价决策。
 */
export const PLANS = {
  free: { day: 25, week: null, month: null },
  paid: { day: 500, week: null, month: null },
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
CREATE TABLE IF NOT EXISTS usage_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  ts          INTEGER NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'judge',
  n           INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_usage_user_ts ON usage_events(user_id, ts);
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
  const qUsedSince = db.prepare(
    'SELECT COALESCE(SUM(n), 0) AS used FROM usage_events WHERE user_id = ? AND ts >= ?'
  );

  const planOf = (user) => PLANS[user.plan] || PLANS.free;

  /** 各窗口已用量 */
  function usage(userId, at = Date.now()) {
    const out = {};
    for (const [name, span] of Object.entries(WINDOWS)) {
      out[name] = Number(qUsedSince.get(userId, at - span).used);
    }
    return out;
  }

  /** 各窗口剩余量；不限的窗口不出现在结果里 */
  function remaining(userId, at = Date.now()) {
    const user = qUserById.get(userId);
    if (!user) return null;
    const plan = planOf(user);
    const used = usage(userId, at);
    const out = {};
    for (const [name, limit] of Object.entries(plan)) {
      if (limit == null) continue;
      out[name] = Math.max(0, limit - used[name]);
    }
    return out;
  }

  /** 桶最紧的那个窗口，用于拒绝时给出可读原因 */
  function tightest(userId, at) {
    const rem = remaining(userId, at) || {};
    let best = null;
    for (const [name, left] of Object.entries(rem)) {
      if (best === null || left < rem[best]) best = name;
    }
    return best;
  }

  /**
   * 扣减额度。先算再写，任一窗口不足即整体拒绝（不会部分扣）。
   * @param {number} [at] 仅供测试注入时间，业务调用不要传
   */
  function consume(userId, n = 1, at = Date.now()) {
    const rem = remaining(userId, at);
    if (rem === null) return { ok: false, reason: 'no-such-user' };
    const win = tightest(userId, at);
    if (win !== null && rem[win] < n) {
      return { ok: false, reason: `quota-exhausted:${win}`, remaining: rem };
    }
    db.prepare('INSERT INTO usage_events (user_id, ts, n) VALUES (?, ?, ?)').run(userId, at, n);
    return { ok: true, remaining: remaining(userId, at) };
  }

  return {
    /** 建用户；email 已存在则返回既有用户（幂等） */
    createUser(email, plan = 'free', at = Date.now()) {
      const found = qUserByEmail.get(email);
      if (found) return found;
      const id = randomUUID();
      db.prepare('INSERT INTO users (id, email, plan, created_at) VALUES (?, ?, ?, ?)').run(
        id, email, plan, at
      );
      return qUserById.get(id);
    },

    getUser: (id) => qUserById.get(id) || null,
    getUserByEmail: (email) => qUserByEmail.get(email) || null,

    /**
     * 签发 API Key。明文只在此返回一次，库里只存 sha256 与前缀。
     * @returns {{key: string, record: object}}
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

    /**
     * 退还一次扣减（判定失败时用，避免用户白扣）。
     * 只删最近一条匹配的用量行，不回退超出实际扣减的数量。
     */
    refund(userId, n = 1) {
      const row = db.prepare(
        'SELECT id, n FROM usage_events WHERE user_id = ? AND n >= ? ORDER BY ts DESC, id DESC LIMIT 1'
      ).get(userId, n);
      if (!row) return false;
      if (row.n === n) {
        db.prepare('DELETE FROM usage_events WHERE id = ?').run(row.id);
      } else {
        db.prepare('UPDATE usage_events SET n = n - ? WHERE id = ?').run(n, row.id);
      }
      return true;
    },

    usage,
    remaining,
    consume,
    /** 某窗口内的事件明细，供用量页展示 */
    events: (userId, since) =>
      db.prepare('SELECT ts, kind, n FROM usage_events WHERE user_id = ? AND ts >= ? ORDER BY ts DESC')
        .all(userId, since),
    close: () => db.close(),
    _db: db,
  };
}
