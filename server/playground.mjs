/**
 * Guest judgment playground.
 *
 * Static pages stay on nginx. This process only handles:
 *   POST /api/try     run one judgment, store it, return a share id
 *   GET  /api/runs/:id  read one stored run
 *
 * The member key lives in JEVCODE_PLAYGROUND_KEY and never reaches the browser.
 */
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

const PORT = Number(process.env.PLAYGROUND_PORT || 8790);
const KEY = process.env.JEVCODE_PLAYGROUND_KEY || '';
const UPSTREAM = process.env.PLAYGROUND_UPSTREAM || 'https://api.clavue.com/v1/systemone';
const MODEL = process.env.PLAYGROUND_MODEL || 'clavue-jev';
const DATA = process.env.PLAYGROUND_DATA || '/var/www/jevcode/shared/runs';
const HOUR_LIMIT = 20;
const MAX_STATE = 4000;
const MAX_QUESTIONS = 6;
// 账号账本：未配置时服务照常跑，只是没有 key 鉴权（保留匿名 IP 限频）。
// 配置后，带 key 的请求走账号额度，不带 key 的仍走匿名限频。
const ACCOUNTS_DB = process.env.PLAYGROUND_ACCOUNTS_DB || '';

let accounts = null;
let auth = null;
let otp = null;
if (ACCOUNTS_DB) {
  const { openAccounts } = await import('./accounts.mjs');
  const { withSessions } = await import('./auth.mjs');
  accounts = openAccounts(ACCOUNTS_DB);
  auth = withSessions(accounts);

  // 验证码登录：需要一条发信通道。没有通道就不启用该功能（端点返回 503），
  // 但密码登录照常可用——不能因为邮件没配就把整个账号体系拖down。
  const { makeMailer } = await import('./mailer.mjs');
  let mailer = null;
  try {
    mailer = makeMailer();
  } catch (err) {
    console.error(`[mail] 通道配置有误，验证码登录已禁用：${err.message}`);
  }
  if (mailer) {
    const { withOtp } = await import('./otp.mjs');
    otp = withOtp(accounts, {
      deliver: (email, code) => mailer.send(email, code),
    });
    console.log(`[mail] 验证码通道：${mailer.name}`);
  } else {
    console.log('[mail] 未配置发信通道，验证码登录不可用（密码登录不受影响）');
  }
}

const hits = new Map();

const SESSION_COOKIE = 'jev_session';

/** 从 Cookie 头取会话 token */
function sessionToken(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === SESSION_COOKIE) return decodeURIComponent(v.join('='));
  }
  return '';
}

/** 会话 Cookie。HttpOnly + SameSite=Lax：前端脚本读不到，跨站请求不带上。 */
function setSessionCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  res.setHeader('set-cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
}

function clearSessionCookie(res) {
  res.setHeader('set-cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

/** 当前登录用户；未登录返回 null */
function currentUser(req) {
  if (!auth) return null;
  const t = sessionToken(req);
  if (!t) return null;
  const s = auth.resolveSession(t);
  return s ? { user: s.user, session: s } : null;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function allow(ip) {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => t > windowStart);
  if (list.length >= HOUR_LIMIT) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

function send(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(raw);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function sharePage(lang, run) {
  const zh = lang === 'zh';
  const title = zh ? '一次判定结果' : 'A judgment result';
  const bars = Object.entries(run.answers || {}).map(([name, answer]) => {
    if (typeof answer?.noul === 'number') {
      const pct = Math.round(answer.noul * 100);
      return `<div class="bar"><div><span>${escapeHtml(name)}</span><b>${pct}%</b></div><i><em style="width:${pct}%"></em></i></div>`;
    }
    if (answer?.choice) return `<p><b>${escapeHtml(name)}</b> → ${escapeHtml(answer.choice)}</p>`;
    return '';
  }).join('');
  return `<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | JevCode</title><style>
    body{margin:0;background:#0b0d12;color:#e7edf5;font:16px/1.5 ui-sans-serif,system-ui,sans-serif}
    main{max-width:760px;margin:0 auto;padding:64px 24px}
    h1{font-size:clamp(32px,5vw,52px);letter-spacing:-.04em;margin:8px 0 18px}
    .state{color:#a9b4c4;white-space:pre-wrap}
    .bar div{display:flex;justify-content:space-between;gap:12px}
    i{display:block;height:8px;border-radius:99px;background:#1c212b;overflow:hidden;margin:6px 0 14px}
    em{display:block;height:100%;background:#2dd4bf}
    a{color:#5eead4}
  </style></head><body><main>
    <p>${escapeHtml(run.model || '')}</p>
    <h1>${title}</h1>
    <p class="state">${escapeHtml(run.state)}</p>
    ${bars}
    <p><a href="/${escapeHtml(lang)}/try/">${zh ? '自己试一次' : 'Try your own'}</a></p>
  </main></body></html>`;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64_000) throw new Error('body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function cleanQuestions(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const out = {};
  for (const [name, spec] of Object.entries(input).slice(0, MAX_QUESTIONS)) {
    if (!/^[a-z][a-z0-9_]{0,40}$/.test(name)) continue;
    if (!spec || typeof spec !== 'object') continue;
    const type = spec.type;
    const instructions = String(spec.instructions || '').slice(0, 400);
    if (!instructions) continue;
    if (type === 'noul' || type === 'confidence') {
      out[name] = { type, instructions };
    } else if (type === 'choice' && Array.isArray(spec.options)) {
      const options = spec.options.map((o) => String(o).slice(0, 80)).filter(Boolean).slice(0, 8);
      if (options.length >= 2) out[name] = { type, instructions, options };
    }
  }
  return Object.keys(out).length ? out : null;
}

async function judge(state, questions) {
  const response = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, state, questions }),
    signal: AbortSignal.timeout(40_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error('upstream');
    err.status = response.status;
    err.detail = payload.detail || payload.code || 'judgment failed';
    throw err;
  }
  return payload;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (req.method === 'GET' && url.pathname === '/health') {
      send(res, 200, { ok: true, configured: Boolean(KEY) });
      return;
    }

    const pageMatch = url.pathname.match(/^\/(en|zh|ja|ko|de|fr|es|pt)\/r\/([a-z0-9]{12})\/?$/);
    if (req.method === 'GET' && pageMatch) {
      try {
        const raw = await readFile(path.join(DATA, `${pageMatch[2]}.json`), 'utf8');
        const html = sharePage(pageMatch[1], JSON.parse(raw));
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(html);
      } catch {
        send(res, 404, { error: 'not found' });
      }
      return;
    }

    const runMatch = url.pathname.match(/^\/api\/runs\/([a-z0-9]{12})$/);
    if (req.method === 'GET' && runMatch) {
      try {
        const raw = await readFile(path.join(DATA, `${runMatch[1]}.json`), 'utf8');
        send(res, 200, JSON.parse(raw));
      } catch {
        send(res, 404, { error: 'not found' });
      }
      return;
    }

    // ---- 正式 API（api.jevcode.ai）：只认 API key，不认 Cookie ----
    // 与 /api/try 的分工：/api/try 是网页试用（Cookie 或匿名限频），
    // /v1/* 是给程序调用的正式接口，必须带 Bearer key，且响应形态与上游一致。
    if (url.pathname.startsWith('/v1/')) {
      if (!KEY) {
        send(res, 503, { error: 'service_unavailable', message: 'judgment backend is not configured' });
        return;
      }
      if (!accounts) {
        send(res, 503, { error: 'service_unavailable', message: 'accounts are not configured' });
        return;
      }

      // 认证：只接受 Bearer key（不接受会话 Cookie）
      const authHeader = req.headers.authorization || '';
      const presented = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!presented) {
        res.writeHead(401, {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Bearer realm="jevcode"',
          'cache-control': 'no-store',
        });
        res.end(JSON.stringify({
          error: 'unauthorized',
          message: 'Missing API key. Send it as: Authorization: Bearer jev_...',
        }));
        return;
      }
      const resolved = accounts.resolveKey(presented);
      if (!resolved) {
        res.writeHead(401, {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Bearer realm="jevcode"',
          'cache-control': 'no-store',
        });
        res.end(JSON.stringify({
          error: 'invalid_api_key',
          message: 'The API key is invalid or revoked.',
        }));
        return;
      }
      const userId = resolved.user.id;

      if (req.method === 'GET' && url.pathname === '/v1/me') {
        send(res, 200, {
          user: { id: userId, email: resolved.user.email, plan: resolved.user.plan },
          credit: accounts.balance(userId),
          spentCents: accounts.spentCents(userId),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/v1/usage') {
        send(res, 200, {
          credit: accounts.balance(userId),
          spentCents: accounts.spentCents(userId),
          entries: accounts.entries(userId, 200),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/v1/judge') {
        const body = await readBody(req);
        const state = String(body.state || '').trim().slice(0, MAX_STATE);
        const questions = cleanQuestions(body.questions);
        if (state.length < 8 || !questions) {
          send(res, 400, {
            error: 'invalid_request',
            message: 'state (min 8 chars) and at least one valid question are required',
          });
          return;
        }

        const quota = accounts.consume(userId, 1);
        if (!quota.ok) {
          res.writeHead(429, {
            'content-type': 'application/json; charset=utf-8',
            'retry-after': '60',
            'cache-control': 'no-store',
          });
          res.end(JSON.stringify({
            error: 'quota_exceeded',
            message: quota.reason,
            credit: quota.balance || null,
          }));
          return;
        }

        let result;
        try {
          result = await judge(state, questions);
        } catch (err) {
          // 上游失败要退回额度，不能让用户白扣
          accounts.refund(userId, 1);
          // 上游的 4xx/5xx 一律折算成 502：对外只表达「判定后端暂不可用」，
          // 不透传上游状态码（曾把上游 500 原样透出，用户以为是我们挂了）。
          const upstream = err && err.message === 'upstream';
          send(res, upstream ? 502 : 500, {
            error: upstream ? 'upstream_unavailable' : 'request_failed',
            message: upstream
              ? (err.detail || 'judgment backend is temporarily unavailable')
              : 'internal error',
            credit: accounts.balance(userId),
          });
          return;
        }

        const id = randomBytes(9).toString('base64url').slice(0, 12).toLowerCase();
        const record = {
          id,
          createdAt: new Date().toISOString(),
          state,
          questions,
          answers: result.answers || {},
          model: result.model || MODEL,
          userId,
        };
        await mkdir(DATA, { recursive: true });
        await writeFile(path.join(DATA, `${id}.json`), JSON.stringify(record));

        // 响应形态与上游一致（model + answers），额外附 id 与 remaining 便于对账
        send(res, 200, {
          id,
          model: record.model,
          answers: record.answers,
          credit: accounts.balance(userId),
        });
        return;
      }

      send(res, 404, { error: 'not_found', message: `No such endpoint: ${url.pathname}` });
      return;
    }

    // ---- 账号：注册 / 登录 / 登出 / 我是谁 ----
    if (url.pathname.startsWith('/api/auth/')) {
      if (!auth) {
        send(res, 503, { error: 'accounts are not configured' });
        return;
      }

      // 验证码登录：请求发码
      if (req.method === 'POST' && url.pathname === '/api/auth/otp/request') {
        if (!otp) {
          send(res, 503, { error: 'code_login_unavailable', message: 'email delivery is not configured' });
          return;
        }
        const b = await readBody(req);
        const r = await otp.request(String(b.email || ''));
        if (!r.ok) {
          // 「太频繁」给 429 并带重试秒数，其余按 400（不区分邮箱是否存在）
          if (r.reason === 'too soon') {
            const secs = Math.max(1, Math.ceil((r.retryAfterMs || 0) / 1000));
            res.writeHead(429, {
              'content-type': 'application/json; charset=utf-8',
              'retry-after': String(secs),
              'cache-control': 'no-store',
            });
            res.end(JSON.stringify({ error: 'too_many_requests', message: `Please wait ${secs}s before requesting another code.` }));
            return;
          }
          if (r.reason === 'too many requests') {
            send(res, 429, { error: 'too_many_requests', message: 'Too many codes requested for this address. Try again later.' });
            return;
          }
          if (/delivery failed/.test(r.reason)) {
            send(res, 502, { error: 'delivery_failed', message: 'Could not send the code. Try again shortly.' });
            return;
          }
          send(res, 400, { error: 'invalid_request', message: r.reason });
          return;
        }
        send(res, 200, { ok: true, expiresAt: r.expiresAt });
        return;
      }

      // 验证码登录：验证码换会话（首次自动建号）
      if (req.method === 'POST' && url.pathname === '/api/auth/otp/verify') {
        if (!otp) {
          send(res, 503, { error: 'code_login_unavailable', message: 'email delivery is not configured' });
          return;
        }
        const b = await readBody(req);
        const r = otp.loginWithCode(String(b.email || ''), String(b.code || ''), auth);
        if (!r.ok) {
          send(res, 401, { error: 'invalid_code', message: 'The code is invalid or has expired.' });
          return;
        }
        setSessionCookie(res, r.token, r.expiresAt);
        send(res, 200, {
          user: { id: r.user.id, email: r.user.email, plan: r.user.plan },
          credit: accounts.balance(r.user.id),
          created: r.created,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/register') {
        const b = await readBody(req);
        const r = auth.register(String(b.email || ''), String(b.password || ''));
        if (!r.ok) {
          send(res, 400, { error: r.reason });
          return;
        }
        const login = auth.login(String(b.email || '').trim().toLowerCase(), String(b.password || ''));
        if (!login.ok) {
          send(res, 500, { error: 'registered but login failed' });
          return;
        }
        setSessionCookie(res, login.token, login.expiresAt);
        send(res, 201, {
          user: { id: r.user.id, email: r.user.email, plan: r.user.plan },
          credit: accounts.balance(r.user.id),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/login') {
        const b = await readBody(req);
        const r = auth.login(String(b.email || ''), String(b.password || ''));
        if (!r.ok) {
          // 统一 401，不区分账号不存在与密码错误
          send(res, 401, { error: r.reason });
          return;
        }
        setSessionCookie(res, r.token, r.expiresAt);
        send(res, 200, {
          user: { id: r.user.id, email: r.user.email, plan: r.user.plan },
          credit: accounts.balance(r.user.id),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
        auth.logout(sessionToken(req));
        clearSessionCookie(res);
        send(res, 200, { ok: true });
        return;
      }

      // 消费明细：单独端点，避免 /me 每次都拖一串流水
      if (req.method === 'GET' && url.pathname === '/api/auth/ledger') {
        const me = currentUser(req);
        if (!me) {
          send(res, 401, { error: 'not signed in' });
          return;
        }
        send(res, 200, {
          credit: accounts.balance(me.user.id),
          spentCents: accounts.spentCents(me.user.id),
          entries: accounts.entries(me.user.id, 100),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/auth/me') {
        const me = currentUser(req);
        if (!me) {
          send(res, 401, { error: 'not signed in' });
          return;
        }
        send(res, 200, {
          user: { id: me.user.id, email: me.user.email, plan: me.user.plan },
          credit: accounts.balance(me.user.id),
          keys: accounts.listKeys(me.user.id).map((k) => ({
            id: k.id, prefix: k.prefix, label: k.label,
            createdAt: k.created_at, revokedAt: k.revoked_at,
          })),
        });
        return;
      }

      send(res, 404, { error: 'not found' });
      return;
    }

    // ---- 控制台：签发 / 吊销 API key（需登录）----
    if (req.method === 'POST' && url.pathname === '/api/keys') {
      if (!auth) {
        send(res, 503, { error: 'accounts are not configured' });
        return;
      }
      const me = currentUser(req);
      if (!me) {
        send(res, 401, { error: 'not signed in' });
        return;
      }
      const b = await readBody(req);
      const label = String(b.label || '').slice(0, 64);
      const { key, record } = accounts.issueKey(me.user.id, label);
      send(res, 201, {
        // 明文 key 只在此出现一次，服务端只留 sha256
        key,
        id: record.id,
        prefix: record.prefix,
        label: record.label,
        notice: 'Store this key now. It cannot be shown again.',
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/keys/revoke') {
      if (!auth) {
        send(res, 503, { error: 'accounts are not configured' });
        return;
      }
      const me = currentUser(req);
      if (!me) {
        send(res, 401, { error: 'not signed in' });
        return;
      }
      const b = await readBody(req);
      const id = String(b.id || '');
      // 只能吊销自己的 key
      const mine = accounts.listKeys(me.user.id).some((k) => k.id === id);
      if (!mine) {
        send(res, 404, { error: 'no such key for this account' });
        return;
      }
      send(res, 200, { ok: accounts.revokeKey(id) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/try') {
      if (!KEY) {
        send(res, 503, { error: 'playground key is not configured' });
        return;
      }
      const ip = clientIp(req);
      const body = await readBody(req);
      const state = String(body.state || '').trim().slice(0, MAX_STATE);
      const questions = cleanQuestions(body.questions);
      if (state.length < 8 || !questions) {
        send(res, 400, { error: 'state and at least one valid question are required' });
        return;
      }

      // 鉴权三路：会话 Cookie（网页登录）→ Bearer API key（程序调用）→ 匿名 IP 限频。
      // 前两者走账号额度（跨 IP 生效，换 IP 刷不掉），第三条保持试用可用。
      let userId = null;
      const session = currentUser(req);
      // 注意别命名为 auth：会遮蔽模块级的 auth（withSessions 返回值）。
      const authHeader = req.headers.authorization || '';
      const presented = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

      if (session) {
        userId = session.user.id;
      } else if (presented) {
        const resolved = accounts ? accounts.resolveKey(presented) : null;
        if (!resolved) {
          send(res, 401, { error: 'invalid api key' });
          return;
        }
        userId = resolved.user.id;
      }

      if (userId) {
        const quota = accounts.consume(userId, 1);
        if (!quota.ok) {
          res.writeHead(429, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          });
          res.end(JSON.stringify({ error: quota.reason, credit: quota.balance || null }));
          return;
        }
      } else if (!allow(ip)) {
        send(res, 429, { error: 'hourly limit reached' });
        return;
      }

      // 判定失败要把额度退回去——否则上游抖动会白扣用户的次数。
      let result;
      try {
        result = await judge(state, questions);
      } catch (err) {
        if (userId && accounts) accounts.refund(userId, 1);
        throw err;
      }

      const id = randomBytes(9).toString('base64url').slice(0, 12).toLowerCase();
      const record = {
        id,
        createdAt: new Date().toISOString(),
        state,
        questions,
        answers: result.answers || {},
        model: result.model || MODEL,
        // 归属用户（匿名则为 null），供用量审计与后续计费对账
        userId,
      };
      await mkdir(DATA, { recursive: true });
      await writeFile(path.join(DATA, `${id}.json`), JSON.stringify(record));
      const payload = { ...record };
      if (userId && accounts) payload.credit = accounts.balance(userId) || {};
      send(res, 200, payload);
      return;
    }

    send(res, 404, { error: 'not found' });
  } catch (err) {
    // 上游故障一律以 502 上报，别把上游的 5xx 原样透传成我们自己的 5xx——
    // 那会让用户以为是我们挂了，而不是判定后端暂时不可用。
    // 上游的 4xx（如 key 失效）也不该原样透传，那暴露的是我们与上游的关系。
    const upstream = err && err.message === 'upstream';
    const status = upstream ? 502 : 500;
    send(res, status, {
      error: upstream ? 'upstream_unavailable' : 'request_failed',
      // 详情只在 5xx 给出，且透传上游的说明，便于用户判断是否该重试
      detail: upstream ? (err.detail || 'judgment backend is temporarily unavailable') : undefined,
    });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`playground listening on 127.0.0.1:${PORT}`);
});
