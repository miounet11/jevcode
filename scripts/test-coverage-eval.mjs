#!/usr/bin/env node
/**
 * 覆盖评测聚合逻辑验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-coverage-eval.mjs
 *
 * 用构造好的 runCompare 结果做纯计算断言，不依赖真实上游：
 *   - chunk 分批正确
 *   - summarize 命中率按维度汇总正确（含未答/出错不计入分母）
 *   - misses 只挑未命中且能对回语料
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chunk, summarize, renderReport, misses, shouldFail } from './lib/coverage-eval.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 在临时目录里跑 aggregate-coverage.mjs，返回生成的 SUMMARY.md 内容。
 *  该脚本按 cwd 相对读 data/coverage-cases.json、写 docs/coverage-full/SUMMARY.md，
 *  所以用临时 cwd 隔离，不碰真实报表。 */
function runAggregate(rows) {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    mkdirSync(path.join(dir, 'docs/coverage-full'), { recursive: true });
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    writeFileSync(
      path.join(dir, 'data/coverage-cases.json'),
      JSON.stringify(rows.map((r) => ({
        id: r.id,
        accept: [r.expect],
        industry: r.industry ?? 'ecommerce',
        dimension: r.dimension ?? 'urgency',
      }))),
    );
    writeFileSync(
      path.join(dir, '.data/runs/compare-log.jsonl'),
      rows.map((r) => JSON.stringify(r)).join('\n') + '\n',
    );
    const r = execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs')], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 30000,
    });
    return { md: readFileSync(path.join(dir, 'docs/coverage-full/SUMMARY.md'), 'utf8'), out: r };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const peer401 = (id, ts) => ({
  ts,
  id,
  // 401 记录也有 accept：ours 侧是正常作答的，只是对照侧凭据失效
  expect: 'yes',
  ours: { ok: true, choice: 'yes' },
  peer: { ok: false, error: 'HTTP 401 {"error_type":"authentication_error","message":"Cannot authenticate with the provided credentials"}' },
});
// 真实语料 id 唯一；构造样本里同一 id 会有多行（好记录 + 后来的 401），
// cases 只能建一份，否则 byId 会被后一行覆盖，accept 变成 [undefined]。
const peerGood = (id, ts, choice) => ({ ts, id, expect: 'yes', ours: { ok: true, choice }, peer: { ok: true, choice } });


const cases = [
  { id: 'a', accept: ['yes'], industry: 'ecommerce', dimension: 'urgency', tag: 'outage', scene: 'chat', stage: 'intake' },
  { id: 'b', accept: ['no'], industry: 'ecommerce', dimension: 'urgency', tag: 'outage', scene: 'chat', stage: 'intake' },
  { id: 'c', accept: ['yes'], industry: 'fintech', dimension: 'safety', tag: 'security', scene: 'email', stage: 'triage' },
  { id: 'd', accept: ['grant'], industry: 'fintech', dimension: 'safety', tag: 'security', scene: 'email', stage: 'triage' },
];

const ok = (choice) => ({ ok: true, model: 'clavue-jev', choice, ms: 5 });
const err = (e) => ({ ok: false, model: 'clavue-jev', error: e, ms: 5 });

test('chunk 按批大小切分', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2).map((b) => b.length), [2, 2, 1]);
  assert.deepEqual(chunk([], 8), []);
});

test('summarize：命中率按维度汇总，出错不计入分母', () => {
  const results = [
    { id: 'a', ours: ok('yes') },   // 命中
    { id: 'b', ours: ok('yes') },   // 未命中（期望 no）
    { id: 'c', ours: err('timeout') }, // 出错
    { id: 'd', ours: ok('grant') }, // 命中
  ];
  const s = summarize(results, cases, 'ours', ['industry', 'dimension', 'tag']);
  assert.equal(s.totals.total, 4);
  assert.equal(s.totals.answered, 3);
  assert.equal(s.totals.hit, 2);
  assert.equal(s.totals.errors, 1);
  assert.equal(s.totals.accuracy, 2 / 3);

  const ecom = s.byAxis.industry.find((r) => r.key === 'ecommerce');
  assert.equal(ecom.n, 2);
  assert.equal(ecom.answered, 2);
  assert.equal(ecom.hit, 1);
  assert.equal(ecom.accuracy, 0.5);

  const fin = s.byAxis.industry.find((r) => r.key === 'fintech');
  assert.equal(fin.answered, 1, '出错的一条不计入已答');
  assert.equal(fin.accuracy, 1); // 唯一的已答项 d 命中

  const sec = s.byAxis.tag.find((r) => r.key === 'security');
  assert.equal(sec.accuracy, 1);
});

test('summarize：全出错时 accuracy 为 null', () => {
  const results = [{ id: 'a', ours: err('x') }];
  const s = summarize(results, cases, 'ours', ['industry']);
  assert.equal(s.totals.accuracy, null);
  assert.equal(s.byAxis.industry.find((r) => r.key === 'ecommerce').accuracy, null);
});

test('misses：只挑未命中的已答题，并对回语料字段', () => {
  const results = [
    { id: 'a', ours: ok('yes') },
    { id: 'b', ours: ok('yes') },   // 未命中
    { id: 'c', ours: err('x') },    // 出错，不算 miss
  ];
  const m = misses(results, cases, 'ours');
  assert.equal(m.length, 1);
  assert.equal(m[0].id, 'b');
  assert.deepEqual(m[0].expected, ['no']);
  assert.equal(m[0].got, 'yes');
  assert.equal(m[0].industry, 'ecommerce');
});

test('misses：limit 生效', () => {
  const results = cases.map((c) => ({ id: c.id, ours: ok('zzz') }));
  assert.equal(misses(results, cases, 'ours', 2).length, 2);
});

test('丢题计入分母：只收到部分结果不会把命中率算成满分', () => {
  // 8 条语料，只回了 2 条且都命中。裸遍历 results 会得到 100%，是错的。
  const many = Array.from({ length: 8 }, (_, i) => ({
    id: `c${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const partial = [
    { id: 'c0', ours: ok('yes') },
    { id: 'c1', ours: ok('yes') },
  ];
  const s = summarize(partial, many, 'ours', ['industry']);
  assert.equal(s.totals.total, 8, '分母应是语料条数 8');
  assert.equal(s.totals.missing, 6, '未收到结果的 6 条应记为丢题');
  assert.equal(s.totals.answered, 2);
  assert.equal(s.totals.accuracy, 1, '命中率仍按已答算，但 missing 必须暴露');
  assert.equal(s.byAxis.industry.find((r) => r.key === 'e').missing, 6, '丢题要进维度 bucket');
});

test('shouldFail：一批都没成必须判失败（旧实现 total=0 会误判为成功）', () => {
  const s = summarize([], cases, 'ours', ['industry']);
  assert.equal(s.totals.total, cases.length);
  assert.equal(s.totals.missing, cases.length);
  assert.equal(shouldFail(s, 0.5), true, '全部丢题应判失败');
  // 空语料也视为失败，避免「没跑任何东西」被当成功
  assert.equal(shouldFail(summarize([], [], 'ours', ['industry']), 0.5), true);
});

test('shouldFail：少量丢题且多数命中时不判失败', () => {
  const many = Array.from({ length: 8 }, (_, i) => ({
    id: `d${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const results = many.map((c) => ({ id: c.id, ours: ok('yes') }));
  assert.equal(shouldFail(summarize(results, many, 'ours', ['industry']), 0.5), false);
});

test('renderReport 出现丢题时给出显式警示', () => {
  const many = Array.from({ length: 4 }, (_, i) => ({
    id: `m${i}`, accept: ['yes'], industry: 'e', dimension: 'u', tag: 't', scene: 's', stage: 'g',
  }));
  const s = summarize([{ id: 'm0', ours: ok('yes') }], many, 'ours', ['industry']);
  const md = renderReport(s, { sample: many.length });
  assert.match(md, /丢题/, '应出现丢题字样');
  assert.match(md, /⚠️/, '应给出警示');
  assert.match(md, /分母 4/, '应显示分母为语料条数');
});

test('renderReport 含总数与各维度小节', () => {
  const results = [{ id: 'a', ours: ok('yes') }];
  const s = summarize(results, cases, 'ours', ['industry', 'dimension']);
  const md = renderReport(s, { generatedAt: 'T', model: 'clavue-jev', sample: 1 });
  assert.match(md, /总命中率/);
  assert.match(md, /## industry/);
  assert.match(md, /## dimension/);
});

// ---------------- aggregate-coverage.mjs ----------------

const industryRow = (md) => md.split('\n').find((l) => l.startsWith('| ecommerce'));
// 行尾多一个空管道（`| 0 | 0 |` 收尾），统一按首尾管道切列再比，避免误匹配 0.0%
const cols = (row) => row.split('|').slice(1, -1).map((s) => s.trim());

test('聚合：对照侧 401 整行作废，头部标注剔除条数', () => {
  const { md, out } = runAggregate([
    { ...peerGood('a', '2026-10-05T00:00:00Z', 'yes'), expect: 'yes' },
    peer401('b', '2026-10-05T00:00:01Z'),
  ]);
  assert.match(md, /已剔除对照侧 401 的 1 条/, '应标注剔除条数');
  assert.match(out, /覆盖 1 条/, '401 那条的 ours 侧也整行不计，不进分母');
  // ours 1/1 命中；peer 只剩 a 这条有效记录，也命中 → 两侧都是 1/1
  assert.deepEqual(cols(industryRow(md)).slice(1), ['100.0%', '1', '1', '0', '100.0%', '1', '0']);
});

test('聚合：只有 401 的日志 → 整行作废后该行业各计数为 0，不留 peer 出错', () => {
  const { md } = runAggregate([peer401('a', '2026-10-05T00:00:00Z')]);
  assert.match(md, /已剔除对照侧 401 的 1 条/);
  // 关键：401 整行不计，所以既不进分母，也不该被算成普通 peer 出错
  assert.deepEqual(cols(industryRow(md)).slice(1), ['0.0%', '0', '0', '0', '0.0%', '0', '0']);
});

test('聚合：更早的好记录不被更新的 401 行连坐丢弃（修复凭据后重跑同一批）', () => {
  // 这是本轮修的核心缺陷：先取最新再删 401，会把同一 id 上更早的
  // 有效 peer 结果一起扔掉，等于凭空损失已跑完的算力。
  const { md, out } = runAggregate([
    { ...peerGood('a', '2026-10-05T00:00:00Z', 'yes'), expect: 'yes' },
    peer401('a', '2026-10-05T01:00:00Z'), // 重启漏 .env 后同 id 跑出的 401
  ]);
  assert.match(out, /覆盖 1 条/, '好记录应保留，不该被 401 顶掉');
  assert.deepEqual(cols(industryRow(md)).slice(1), ['100.0%', '1', '1', '0', '100.0%', '1', '0']);
});

test('聚合：同 id 多次 401 只计一次剔除，好记录不受影响', () => {
  const { md, out } = runAggregate([
    { ...peerGood('a', '2026-10-05T00:00:00Z', 'yes'), expect: 'yes' },
    peer401('a', '2026-10-05T00:00:00Z'),
    peer401('a', '2026-10-05T02:00:00Z'),
  ]);
  assert.match(md, /已剔除对照侧 401 的 1 条/, '同一 id 多次 401 只计一次');
  assert.match(out, /覆盖 1 条/);
  assert.deepEqual(cols(industryRow(md)).slice(1), ['100.0%', '1', '1', '0', '100.0%', '1', '0']);
});

test('聚合：--log 支持 ", " 分隔（从 SUMMARY 数据源行复制重跑不 ENOENT）', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-multi-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    mkdirSync(path.join(dir, 'docs/coverage-full'), { recursive: true });
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    const cases = ['a', 'b'].map((id) => ({ id, accept: ['yes'], industry: 'ecommerce', dimension: 'urgency' }));
    writeFileSync(path.join(dir, 'data/coverage-cases.json'), JSON.stringify(cases));
    for (const id of ['a', 'b']) {
      writeFileSync(
        path.join(dir, `.data/runs/compare-log-${id}.jsonl`),
        JSON.stringify({ ts: '2026-10-05T00:00:00Z', id, ours: { ok: true, choice: 'yes' }, peer: { ok: true, choice: 'yes' } }) + '\n',
      );
    }
    // 复现真实 SUMMARY.md 里的格式：逗号 + 空格
    const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs'),
      '--log', '.data/runs/compare-log-a.jsonl, .data/runs/compare-log-b.jsonl'], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    assert.match(out, /覆盖 2 条/, '两个日志都应被读到');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('聚合：省略 --log 时自动发现全部 compare-log*.jsonl，且跳过 quarantine', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-auto-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    mkdirSync(path.join(dir, 'docs/coverage-full'), { recursive: true });
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    writeFileSync(path.join(dir, 'data/coverage-cases.json'), JSON.stringify(
      ['a', 'b', 'c'].map((id) => ({ id, accept: ['yes'], industry: 'ecommerce', dimension: 'urgency' })),
    ));
    const row = (id) => JSON.stringify({ ts: '2026-10-05T00:00:00Z', id, ours: { ok: true, choice: 'yes' }, peer: { ok: true, choice: 'yes' } });
    writeFileSync(path.join(dir, '.data/runs/compare-log-1.jsonl'), row('a') + '\n');
    writeFileSync(path.join(dir, '.data/runs/compare-log-2.jsonl'), row('b') + '\n');
    // 401 污染文件已改名 quarantine-*，自动发现不得把它算进来
    writeFileSync(path.join(dir, '.data/runs/quarantine-compare-log-401-polluted.jsonl'), row('c') + '\n');
    const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs')], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    const md = readFileSync(path.join(dir, 'docs/coverage-full/SUMMARY.md'), 'utf8');
    assert.match(out, /覆盖 2 条/, '应只发现两个 compare-log，quarantine 被排除');
    assert.doesNotMatch(md, /compare-log-1\.jsonl, \.data\/runs\/compare-log-2\.jsonl, \.data\/runs\/quarantine/, '数据源不应含 quarantine 文件');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('聚合：语料进度 + 残值行业逐个点名，不只丢一句通用警示', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-prog-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    mkdirSync(path.join(dir, 'docs/coverage-full'), { recursive: true });
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    // ecommerce 10 条语料全答；travel 10 条语料只答 1 条（应被点名）
    const cases = [];
    for (const ind of ['ecommerce', 'travel']) {
      for (let i = 0; i < 10; i++) cases.push({ id: `${ind[0]}${i}`, accept: ['yes'], industry: ind, dimension: 'urgency' });
    }
    writeFileSync(path.join(dir, 'data/coverage-cases.json'), JSON.stringify(cases));
    const answered = cases.filter((c) => c.industry === 'ecommerce' || c.id === 't0');
    const rows = answered.map((c) => JSON.stringify({ ts: '2026-10-05T00:00:00Z', id: c.id, ours: { ok: true, choice: 'yes' }, peer: { ok: true, choice: 'yes' } }));
    writeFileSync(path.join(dir, '.data/runs/compare-log-a.jsonl'), rows.join('\n') + '\n');
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs')], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    const md = readFileSync(path.join(dir, 'docs/coverage-full/SUMMARY.md'), 'utf8');
    assert.match(md, /语料进度：11 \/ 20 条已答（1 \/ 2 行业已答≥90%）/, '应给出条数与行业数两个口径的进度，且写明阈值口径');
    assert.match(md, /以下 1 个行业已答不足应有 90%/, '应给出残值行业数量');
    assert.match(md, /`travel`/, '应逐个点名残值行业');
    assert.doesNotMatch(md, /`ecommerce`/, '跑齐的行业不该被点名');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('聚合：.data/runs 目录不存在时给友好提示并非零退出，不抛原始 ENOENT 栈', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-nodir-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    writeFileSync(path.join(dir, 'data/coverage-cases.json'), JSON.stringify(
      [{ id: 'a', accept: ['yes'], industry: 'ecommerce', dimension: 'urgency' }],
    ));
    // 故意不建 .data/runs
    let err = '';
    let code = 0;
    try {
      execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs')], { cwd: dir, encoding: 'utf8', timeout: 30000, stdio: 'pipe' });
    } catch (e) {
      code = e.status;
      err = (e.stderr || '') + (e.stdout || '');
    }
    assert.equal(code, 1, '应为退出码 1');
    assert.match(err, /目录不存在/, '应说明目录缺失');
    assert.doesNotMatch(err, /ENOENT/, '不应把原始 ENOENT 栈抛给用户');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('聚合：进度文案写明 90% 阈值口径，残值行业不得被读成已跑齐', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-agg-wording-'));
  try {
    mkdirSync(path.join(dir, 'data'), { recursive: true });
    mkdirSync(path.join(dir, 'docs/coverage-full'), { recursive: true });
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    // travel 10 条语料只答 9 条：未达 100% 但已过 90% 阈值，两个口径都要如实反映
    const cases = [];
    for (const ind of ['ecommerce', 'travel']) {
      for (let i = 0; i < 10; i++) cases.push({ id: `${ind[0]}${i}`, accept: ['yes'], industry: ind, dimension: 'urgency' });
    }
    writeFileSync(path.join(dir, 'data/coverage-cases.json'), JSON.stringify(cases));
    const rows = cases.filter((c) => c.industry === 'ecommerce' || c.id !== 't9')
      .map((c) => JSON.stringify({ ts: '2026-10-05T00:00:00Z', id: c.id, ours: { ok: true, choice: 'yes' }, peer: { ok: true, choice: 'yes' } }));
    writeFileSync(path.join(dir, '.data/runs/compare-log-a.jsonl'), rows.join('\n') + '\n');
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/aggregate-coverage.mjs')], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    const md = readFileSync(path.join(dir, 'docs/coverage-full/SUMMARY.md'), 'utf8');
    assert.match(md, /语料进度：19 \/ 20 条已答（2 \/ 2 行业已答≥90%）/, '进度须区分「已答条数」与「行业过 90% 阈值」两个口径');
    assert.doesNotMatch(md, /行业已跑齐/, '不得用「已跑齐」描述阈值口径，容易把 19/20 读成完成');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('备份：分片两行业的文件名必须都带行业，不能只取 industries[0]', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bak-'));
  try {
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    const rows = [];
    for (const ind of ['realestate', 'recruiting']) {
      for (let i = 0; i < 2; i++) {
        rows.push(JSON.stringify({ ts: '2026-10-05T00:00:00Z', id: `cov-${ind}-x${i}`, ours: { ok: true, choice: 'a' } }));
      }
    }
    const log = path.join(dir, '.data/runs/compare-log-v2.jsonl');
    writeFileSync(log, rows.join('\n') + '\n');
    const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts/backup-shard.mjs'), log, 'realestate', 'recruiting'],
      { cwd: dir, encoding: 'utf8', timeout: 30000 });
    const files = readdirSync(path.join(dir, '.data/runs')).filter((f) => f.startsWith('compare-log-') && f.endsWith('-backup.jsonl'));
    assert.equal(files.length, 1, '应只产出一个备份文件');
    assert.equal(files[0], 'compare-log-realestate-recruiting-backup.jsonl', '两个行业都要进文件名');
    assert.match(out, /已备份 4 条/, '应报告实际条数');
    const saved = readFileSync(path.join(dir, '.data/runs', files[0]), 'utf8').split('\n').filter(Boolean);
    assert.equal(saved.length, 4, '两个行业的数据都应写入');
    // 自动发现正则不能被新命名破坏
    assert.match(files[0], /^compare-log.*\.jsonl$/, '新文件名须仍匹配 aggregate 的自动发现通配');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('备份：同分片重跑文件名稳定（排序后 join），不产生重复文件', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-bak2-'));
  try {
    mkdirSync(path.join(dir, '.data/runs'), { recursive: true });
    const log = path.join(dir, '.data/runs/compare-log-v2.jsonl');
    writeFileSync(log, JSON.stringify({ ts: '2026-10-05T00:00:00Z', id: 'cov-saas-a0', ours: { ok: true, choice: 'a' } }) + '\n');
    // 两种参数顺序都应落到同一个文件
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/backup-shard.mjs'), log, 'saas', 'streaming'], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/backup-shard.mjs'), log, 'streaming', 'saas'], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    const files = readdirSync(path.join(dir, '.data/runs')).filter((f) => f.endsWith('-backup.jsonl'));
    assert.equal(files.length, 1, '参数顺序不同不应产生第二个文件');
    assert.equal(files[0], 'compare-log-saas-streaming-backup.jsonl');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
