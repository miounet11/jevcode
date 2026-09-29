/**
 * 会话与密码 —— 注册登录的底座。
 *
 * 设计取舍：
 * - 密码用 scrypt（Node 内置 crypto，无外部依赖）。参数按内存成本显式给，
 *   不用默认值，避免不同 Node 版本默认值漂移导致旧 hash 验不过。
 * - 会话是随机 token，库中只存 sha256。与 API key 同一原则：明文只在签发时
 *   出现一次。会话带过期时间，可单条吊销。
 * - 不做邮箱验证/找回密码：那需要发信能力，属独立一步。表结构已留 email 唯一
 *   约束，后续加验证只需加字段。
 */

import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

/** scrypt 参数：N=2^15, r=8, p=1 → 约 32MB 内存/次，兼顾安全与单机可用 */
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64 };

const b64 = (buf) => buf.toString('base64url');
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/** 口令 hash 格式：scrypt$N$r$p$salt$hash，参数随 hash 落盘，便于日后升级 */
export function hashPassword(password, saltBuf) {
  const salt = saltBuf || randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 128 * SCRYPT.N * SCRYPT.r * 2,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${b64(salt)}$${b64(hash)}`;
}

/** 常量时间比对，避免按字符提前返回泄漏信息 */
export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, hashB64] = parts;
  let expected;
  try {
    expected = Buffer.from(hashB64, 'base64url');
  } catch {
    return false;
  }
  let actual;
  try {
    actual = scryptSync(password, Buffer.from(saltB64, 'base64url'), expected.length, {
      N: Number(N), r: Number(r), p: Number(p), maxmem: 128 * Number(N) * Number(r) * 2,
    });
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** 密码强度：至少 8 位。不强制复杂度，避免逼出可预测的变体。 */
export function passwordProblem(password) {
  if (typeof password !== 'string') return 'password must be a string';
  if (password.length < 8) return 'password must be at least 8 characters';
  if (password.length > 200) return 'password is too long';
  return null;
}

/** 邮箱格式：只做基本形状校验，真实验证靠发信（未实现） */
export function emailProblem(email) {
  if (typeof email !== 'string') return 'email must be a string';
  const v = email.trim();
  if (v.length < 3 || v.length > 254) return 'email length is invalid';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email format is invalid';
  return null;
}

/**
 * 在账本之上叠加会话能力。
 * @param {object} accounts openAccounts() 的返回值
 */
export function withSessions(accounts, { sessionTtlMs = 30 * 24 * 60 * 60 * 1000 } = {}) {
  const db = accounts._db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      user_id     TEXT PRIMARY KEY REFERENCES users(id),
      password    TEXT NOT NULL,
      updated_at  INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      hash        TEXT NOT NULL UNIQUE,
      created_at  INTEGER NOT NULL,
      expires_at  INTEGER NOT NULL,
      revoked_at  INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_hash ON sessions(hash);
  `);

  const qCred = db.prepare('SELECT * FROM credentials WHERE user_id = ?');
  const qSess = db.prepare('SELECT * FROM sessions WHERE hash = ?');
  const qUserById = db.prepare('SELECT * FROM users WHERE id = ?');

  return {
    /**
     * 注册。邮箱重复或密码不合规则拒绝，不会创建半个用户。
     * @returns {{ok:true,user:object}|{ok:false,reason:string}}
     */
    register(email, password, at = Date.now()) {
      const eBad = emailProblem(email);
      if (eBad) return { ok: false, reason: eBad };
      const pBad = passwordProblem(password);
      if (pBad) return { ok: false, reason: pBad };
      const norm = email.trim().toLowerCase();
      if (accounts.getUserByEmail(norm)) return { ok: false, reason: 'email already registered' };

      const user = accounts.createUser(norm, 'free', at);
      db.prepare('INSERT INTO credentials (user_id, password, updated_at) VALUES (?, ?, ?)')
        .run(user.id, hashPassword(password), at);
      return { ok: true, user };
    },

    /** 登录。账号不存在与密码错误返回同一原因，避免枚举邮箱。 */
    login(email, password, at = Date.now()) {
      const bad = { ok: false, reason: 'invalid email or password' };
      if (typeof email !== 'string' || typeof password !== 'string') return bad;
      const user = accounts.getUserByEmail(email.trim().toLowerCase());
      if (!user) return bad;
      const cred = qCred.get(user.id);
      if (!cred || !verifyPassword(password, cred.password)) return bad;

      const { token, expiresAt } = this.issueSession(user.id, at);
      return { ok: true, token, expiresAt, user };
    },

    /**
     * 只签发会话，不校验口令。给 OTP 等无密码流程用。
     * 调用方必须自己先完成身份校验；这个函数本身不做任何鉴权。
     */
    issueSession(userId, at = Date.now()) {
      if (!qUserById.get(userId)) throw new Error('no such user');
      const token = randomBytes(32).toString('base64url');
      const id = randomUUID();
      const expiresAt = at + sessionTtlMs;
      db.prepare(
        'INSERT INTO sessions (id, user_id, hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id, userId, sha256(token), at, expiresAt);
      return { token, expiresAt };
    },

    /** 校验会话 token；过期或已吊销返回 null */
    resolveSession(token, at = Date.now()) {
      if (typeof token !== 'string' || !token) return null;
      const row = qSess.get(sha256(token));
      if (!row || row.revoked_at || row.expires_at <= at) return null;
      const user = qUserById.get(row.user_id);
      return user ? { user, sessionId: row.id, expiresAt: row.expires_at } : null;
    },

    logout(token, at = Date.now()) {
      if (typeof token !== 'string' || !token) return false;
      const info = db.prepare(
        'UPDATE sessions SET revoked_at = ? WHERE hash = ? AND revoked_at IS NULL'
      ).run(at, sha256(token));
      return info.changes > 0;
    },

    /** 改密：旧会话全部失效（换密码应当踢掉其他设备） */
    changePassword(userId, oldPassword, newPassword, at = Date.now()) {
      const cred = qCred.get(userId);
      if (!cred || !verifyPassword(oldPassword, cred.password)) {
        return { ok: false, reason: 'current password is incorrect' };
      }
      const pBad = passwordProblem(newPassword);
      if (pBad) return { ok: false, reason: pBad };
      db.prepare('UPDATE credentials SET password = ?, updated_at = ? WHERE user_id = ?')
        .run(hashPassword(newPassword), at, userId);
      const info = db.prepare(
        'UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL'
      ).run(at, userId);
      return { ok: true, revokedSessions: Number(info.changes) };
    },
  };
}
