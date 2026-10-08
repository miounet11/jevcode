#!/usr/bin/env node
/**
 * api.jevcode.ai 的 /v1/* 正式接口端到端测试。
 *
 * 用法：node scripts/test-api-v1.mjs
 *
 * 设计契约：
 *   - /v1/* 只认 Bearer API key，不接受会话 Cookie
 *   - choice 的 options 会在服务端收成 criteria 再转发
 *   - 按输入 token 计费，上游成功后才扣；失败不扣
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openAccounts } from '../server/accounts.mjs';

const PORT = 8796;
const dir = mkdtempSync(path.join(tmpdir(), 'jev-v1-'));
const dbPath = path.join(dir, 'acct.db');
const base = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0, skipped = 0;
const ok = (n, c, extra = '') => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n} ${extra}`); } };
const skip = (n, why) => { skipped++; console.log(`  ○ ${n} — ${why}`); };

const ledger = openAccounts(dbPath);
const user = ledger.createUser('v1@example.com');
const { key } = ledger.issueKey(user.id, 'v1-test');
// 退款路径要一个额度干净的用户：refund 只按整行匹配，用满后再退不干净
const user2 = ledger.createUser('v1-refund@example.com');
const { key: key2 } = ledger.issueKey(user2.id, 'v1-refund');
ledger.close();

const child = spawn(process.execPath, ['server/playground.mjs'], {
  env: {
    ...process.env,
    // /v1/* 在没有 JEVCODE_PLAYGROUND_KEY 时直接 503（真实部署由 systemd env
    // 提供）。测试自给自足：没有就造一把，别依赖本机 shell。
    JEVCODE_PLAYGROUND_KEY: process.env.JEVCODE_PLAYGROUND_KEY || 'jev_test_key_not_a_real_secret',
    PLAYGROUND_PORT: String(PORT),
    PLAYGROUND_ACCOUNTS_DB: dbPath,
    PLAYGROUND_DATA: path.join(dir, 'runs'),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverErr = '';
child.stdout.on('data', () => {});
child.stderr.on('data', (d) => { serverErr += d.toString(); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return true; } catch {}
    await sleep(100);
  }
  return false;
}

const H = (k) => (k ? { authorization: `Bearer ${k}` } : {});
const post = (p, body, k) => fetch(base + p, {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...H(k) },
  body: JSON.stringify(body),
});
const get = (p, k) => fetch(base + p, { headers: H(k) });

const goodBody = {
  state: 'v1 endpoint contract verification',
  questions: { q1: { type: 'noul', instructions: 'Is this relevant?' } },
};

try {
  if (!(await waitUp())) {
    console.log('服务未启动：', serverErr.slice(0, 400));
    process.exit(1);
  }
  console.log(`服务已启动 :${PORT}\n`);

  console.log('鉴权（只认 Bearer key）');
  {
    const noKey = await post('/v1/judge', goodBody);
    const nb = await noKey.json().catch(() => ({}));
    ok('无 key → 401', noKey.status === 401, `得到 ${noKey.status}`);
    ok('401 带 www-authenticate', /Bearer/i.test(noKey.headers.get('www-authenticate') || ''));
    ok('错误信息说明如何传 key', /Authorization: Bearer/i.test(nb.message || ''), nb.message);

    const badKey = await post('/v1/judge', goodBody, 'jev_not_a_real_key');
    ok('假 key → 401', badKey.status === 401, `得到 ${badKey.status}`);

    // 关键：会话 Cookie 不得被接受
    const viaCookie = await fetch(`${base}/v1/judge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'jev_session=whatever' },
      body: JSON.stringify(goodBody),
    });
    ok('会话 Cookie 不能当 key 用 → 401', viaCookie.status === 401, `得到 ${viaCookie.status}`);
  }

  console.log('\n请求校验');
  {
    const short = await post('/v1/judge', { state: 'x', questions: goodBody.questions }, key);
    ok('state 过短 → 400', short.status === 400, `得到 ${short.status}`);

    const noQ = await post('/v1/judge', { state: 'long enough state' }, key);
    ok('无 question → 400', noQ.status === 400, `得到 ${noQ.status}`);

    // 文档承诺「超过 4000 字符会被拒绝」。上限按字符计，不是字节：
    // 4000 个日文假名是 12000 字节，仍须放行。
    // 本地校验通过后请求会打到上游；上游不可用时返回 502，同样证明它越过了校验。
    const exact = await post('/v1/judge', {
      state: 'あ'.repeat(4000),
      questions: goodBody.questions,
    }, key);
    ok('state 恰好 4000 字符 → 未被本地校验拒绝（非 400）', exact.status !== 400, `得到 ${exact.status}`);

    const over = await post('/v1/judge', {
      state: 'あ'.repeat(4001),
      questions: goodBody.questions,
    }, key);
    ok('state 超过 4000 字符 → 400', over.status === 400, `得到 ${over.status}`);

    // 超长必须被拒绝而非静默截断：拒绝时不应扣费。
    const l0 = openAccounts(dbPath);
    const bal0 = l0.balance(user.id).microUsd;
    l0.close();
    await post('/v1/judge', { state: 'あ'.repeat(4001), questions: goodBody.questions }, key);
    const l1 = openAccounts(dbPath);
    const bal1 = l1.balance(user.id).microUsd;
    l1.close();
    ok('超长被拒后未扣费', bal1 === bal0, `前 ${bal0} 后 ${bal1}`);

    const notFound = await post('/v1/nope', {}, key);
    ok('未知路径 → 404', notFound.status === 404, `得到 ${notFound.status}`);
  }

  console.log('\n/v1/me 与 /v1/usage');
  {
    const me = await get('/v1/me', key);
    const mb = await me.json().catch(() => ({}));
    ok('/v1/me → 200', me.status === 200, `得到 ${me.status}`);
    ok('返回注册赠送 $5', mb.credit && mb.credit.cents === 500, JSON.stringify(mb.credit));

    const us = await get('/v1/usage', key);
    const ub = await us.json().catch(() => ({}));
    ok('/v1/usage → 200', us.status === 200, `得到 ${us.status}`);
    ok('usage 含 entries 数组', Array.isArray(ub.entries));
  }

  console.log('\n/v1/judge 判定（真实上游）');
  let judgedId = '';
  {
    const r = await post('/v1/judge', goodBody, key);
    const b = await r.json().catch(() => ({}));

    if (r.status === 503) {
      skip('/v1/judge → 200', '服务端未配上游 key');
    } else if (r.status === 502) {
      skip('/v1/judge → 200', `上游不可达: ${b.message || ''}`);
    } else {
      ok('/v1/judge → 200', r.status === 200, `得到 ${r.status} ${JSON.stringify(b).slice(0, 140)}`);
      ok('响应含 answers(q1.noul 为数字)',
         typeof b.answers?.q1?.noul === 'number', JSON.stringify(b.answers));
      ok('响应含 model', typeof b.model === 'string', String(b.model));
      ok('响应含 id', typeof b.id === 'string' && b.id.length === 12, String(b.id));
      ok('响应 credit 已按输入 token 扣减',
         b.credit && b.credit.microUsd < 5_000_000 && b.credit.microUsd > 0,
         JSON.stringify(b.credit));
      judgedId = b.id || '';

      const me = await get('/v1/me', key);
      const mb = await me.json();
      ok('库里已扣微美元', mb.credit && mb.credit.microUsd < 5_000_000 && mb.credit.microUsd > 0,
         JSON.stringify(mb.credit));
    }
  }

  console.log('\n额度耗尽与退款');
  {
    // 直接打满额度，验证 429 与 retry-after
    const l = openAccounts(dbPath);
    const left = l.balance(user.id).inputTokensLeft;
    if (left > 0) l.chargeInputTokens(user.id, left);
    l.close();

    const r = await post('/v1/judge', goodBody, key);
    const b = await r.json().catch(() => ({}));
    ok('额度用尽 → 429', r.status === 429, `得到 ${r.status}`);
    ok('429 带 retry-after', !!r.headers.get('retry-after'), r.headers.get('retry-after') || '');
    ok('错误码为 quota_exceeded', b.error === 'quota_exceeded', String(b.error));

    const me = await get('/v1/me', key);
    const mb = await me.json();
    ok('用尽后余额为 0', mb.credit && mb.credit.cents === 0, JSON.stringify(mb.credit));
  }

  console.log('\n上游失败必须退款');
  {
    // 用独立用户（额度干净），以必然失败的 choice 题型触发上游报错，
    // 验证额度被退回。若上游对 choice 的行为变了，本段整体跳过。
    const l = openAccounts(dbPath);
    const before = l.balance(user2.id).microUsd;
    l.close();

    const r = await post('/v1/judge', {
      state: 'refund path verification probe',
      questions: { q1: { type: 'choice', instructions: 'Pick one', options: ['a', 'b'] } },
    }, key2);
    const b = await r.json().catch(() => ({}));

    if (r.status === 200) {
      skip('上游失败 → 非 200 并退款', '上游对 choice 题型未报错，无法触发该路径');
    } else if (r.status === 503) {
      skip('上游失败 → 非 200 并退款', '上游未配置，无法触发');
    } else {
      const l2 = openAccounts(dbPath);
      const after = l2.balance(user2.id).microUsd;
      l2.close();
      ok('上游失败返回错误', r.status >= 400, `得到 ${r.status}`);
      ok('失败后额度已退回（用量未增加）', after === before, `前 ${before} 后 ${after}`);
    }
  }
} finally {
  child.kill('SIGTERM');
  await sleep(200);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n通过 ${pass} / 失败 ${fail} / 跳过 ${skipped}`);
process.exit(fail === 0 ? 0 : 1);
