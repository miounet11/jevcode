/**
 * 邮箱验证码（OTP）登录 —— 对标 typesafe.ai 的登录方式。
 *
 * 参考界面用的是 ?otp=true&email=... 这种无密码流程：填邮箱 → 收 6 位码 →
 * 填码即登录。本模块只负责「发码、验码、建会话」，发信通道做成可插拔的
 * deliver 回调——当前项目没有 SMTP 凭据，硬编码某家服务没有意义。
 *
 * 安全设计：
 * - 码用 crypto.randomInt（不用 Math.random），6 位十进制
 * - 库里只存 sha256(code + salt)，不存明文；salt 每次签发随机
 * - 单码最多试 5 次，超了作废（防 6 位码被暴力穷举）
 * - 有效期 10 分钟；签发新码会作废旧码（同一邮箱同时只有一个有效码）
 * - 全局每秒最多签发 2 次同一邮箱、每小时最多 6 次（防邮件轰炸）
 */

import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MIN_RESEND_MS = 30 * 1000;      // 同邮箱两次发码最小间隔
const MAX_PER_HOUR = 6;               // 同邮箱每小时最多发码次数

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/**
 * 在账本之上叠加 OTP 能力。
 * @param {object} accounts openAccounts() 的返回值
 * @param {{deliver: (email: string, code: string, meta: object) => Promise<void>}} opts
 *        deliver 抛异常则本次签发失败（不落库），避免用户收到 200 却收不到信。
 */
export function withOtp(accounts, { deliver } = {}) {
  const db = accounts._db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id          TEXT PRIMARY KEY,
      email       TEXT NOT NULL,
      hash        TEXT NOT NULL,
      salt        TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      expires_at  INTEGER NOT NULL,
      attempts    INTEGER NOT NULL DEFAULT 0,
      consumed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email, created_at);
  `);

  const qLast = db.prepare(
    'SELECT created_at FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1'
  );
  const qRecentCount = db.prepare(
    'SELECT COUNT(*) AS c FROM otp_codes WHERE email = ? AND created_at >= ?'
  );
  const qLive = db.prepare(
    `SELECT * FROM otp_codes
      WHERE email = ? AND consumed_at IS NULL AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1`
  );

  const normalize = (email) => String(email || '').trim().toLowerCase();

  return {
    /**
     * 签发验证码并投递。
     * @returns {{ok:true, expiresAt:number}|{ok:false, reason:string, retryAfterMs?:number}}
     */
    async request(email, at = Date.now()) {
      const addr = normalize(email);
      if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
        return { ok: false, reason: 'invalid email' };
      }

      const last = qLast.get(addr);
      if (last && at - last.created_at < MIN_RESEND_MS) {
        return {
          ok: false,
          reason: 'too soon',
          retryAfterMs: MIN_RESEND_MS - (at - last.created_at),
        };
      }
      if (Number(qRecentCount.get(addr, at - 60 * 60 * 1000).c) >= MAX_PER_HOUR) {
        return { ok: false, reason: 'too many requests' };
      }

      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const salt = randomBytes(16).toString('base64url');
      const expiresAt = at + CODE_TTL_MS;

      // 先投递再落库：投递失败就当作没发过，用户可以立刻重试
      if (typeof deliver !== 'function') {
        return { ok: false, reason: 'no delivery channel configured' };
      }
      try {
        await deliver(addr, code, { expiresAt, ttlMs: CODE_TTL_MS });
      } catch (err) {
        return { ok: false, reason: `delivery failed: ${err && err.message ? err.message : 'unknown'}` };
      }

      // 同一邮箱同时只保留一个有效码
      db.prepare('UPDATE otp_codes SET consumed_at = ? WHERE email = ? AND consumed_at IS NULL')
        .run(at, addr);
      db.prepare(
        'INSERT INTO otp_codes (id, email, hash, salt, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(randomUUID(), addr, sha256(code + salt), salt, at, expiresAt);

      return { ok: true, expiresAt };
    },

    /**
     * 校验验证码。成功即消费掉（不能重放）。
     * 无论邮箱是否存在都返回同样的失败原因，避免枚举注册用户。
     * @returns {{ok:true, email:string}|{ok:false, reason:string}}
     */
    verify(email, code, at = Date.now()) {
      const addr = normalize(email);
      const bad = { ok: false, reason: 'invalid or expired code' };
      if (!addr || typeof code !== 'string') return bad;
      const cleaned = code.replace(/\s+/g, '');
      if (!/^\d{6}$/.test(cleaned)) return bad;

      const row = qLive.get(addr, at);
      if (!row) return bad;
      if (row.attempts >= MAX_ATTEMPTS) {
        db.prepare('UPDATE otp_codes SET consumed_at = ? WHERE id = ?').run(at, row.id);
        return bad;
      }

      const expected = Buffer.from(row.hash, 'hex');
      const actual = Buffer.from(sha256(cleaned + row.salt), 'hex');
      const match = expected.length === actual.length && timingSafeEqual(expected, actual);

      if (!match) {
        db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id);
        return bad;
      }

      db.prepare('UPDATE otp_codes SET consumed_at = ? WHERE id = ?').run(at, row.id);
      return { ok: true, email: addr };
    },

    /**
     * 验码并建会话：首次登录自动建账号（无密码流程的必然要求）。
     * @returns {{ok:true, token:string, expiresAt:number, user:object, created:boolean}
     *          |{ok:false, reason:string}}
     */
    loginWithCode(email, code, auth, at = Date.now()) {
      const v = this.verify(email, code, at);
      if (!v.ok) return v;
      const addr = v.email;
      let user = accounts.getUserByEmail(addr);
      let created = false;
      if (!user) {
        user = accounts.createUser(addr, 'free', at);
        created = true;
      }
      const session = auth.issueSession(user.id, at);
      return { ok: true, ...session, user, created };
    },

    /** 当前是否有有效码（供测试与排查用，不暴露码本身） */
    hasLiveCode(email, at = Date.now()) {
      return !!qLive.get(normalize(email), at);
    },

    /** 剩余尝试次数，-1 表示无有效码 */
    attemptsLeft(email, at = Date.now()) {
      const row = qLive.get(normalize(email), at);
      return row ? Math.max(0, MAX_ATTEMPTS - row.attempts) : -1;
    },

    _limits: { CODE_TTL_MS, MAX_ATTEMPTS, MIN_RESEND_MS, MAX_PER_HOUR },
  };
}
