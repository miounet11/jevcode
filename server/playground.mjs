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

const hits = new Map();

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

    if (req.method === 'POST' && url.pathname === '/api/try') {
      if (!KEY) {
        send(res, 503, { error: 'playground key is not configured' });
        return;
      }
      const ip = clientIp(req);
      if (!allow(ip)) {
        send(res, 429, { error: 'hourly limit reached' });
        return;
      }
      const body = await readBody(req);
      const state = String(body.state || '').trim().slice(0, MAX_STATE);
      const questions = cleanQuestions(body.questions);
      if (state.length < 8 || !questions) {
        send(res, 400, { error: 'state and at least one valid question are required' });
        return;
      }
      const result = await judge(state, questions);
      const id = randomBytes(9).toString('base64url').slice(0, 12).toLowerCase();
      const record = {
        id,
        createdAt: new Date().toISOString(),
        state,
        questions,
        answers: result.answers || {},
        model: result.model || MODEL,
      };
      await mkdir(DATA, { recursive: true });
      await writeFile(path.join(DATA, `${id}.json`), JSON.stringify(record));
      send(res, 200, record);
      return;
    }

    send(res, 404, { error: 'not found' });
  } catch (err) {
    const status = err.status && err.status < 500 ? 502 : 500;
    send(res, status, { error: err.detail || 'request failed' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`playground listening on 127.0.0.1:${PORT}`);
});
