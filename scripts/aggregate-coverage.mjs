// 全量覆盖评测聚合报表：读 compare-log（可多个，逗号分隔），按当前语料（14400 条）出总表
// 用法: node scripts/aggregate-coverage.mjs [--log .data/runs/compare-log.jsonl,.data/runs/compare-log-shard1-adtech-backup.jsonl]
// 省略 --log 时自动发现 .data/runs/compare-log*.jsonl（不传参数即得全量，漏备份不会再静默少算）
// 多日志时按每行 ts 字段取时间最新的行（不依赖文件顺序；无 ts 字段的行视为最早）
import fs from 'fs';
import { corpusFingerprint } from './lib/coverage-eval.mjs';

const args = process.argv.slice(2);
// 从 SUMMARY.md 的「数据源」行复制回来重跑时，分隔符是 ", "，必须 trim，
// 否则路径带前导空格直接 ENOENT。
const parseLogs = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
const RUNS_DIR = '.data/runs';
// 目录可能整个不存在（全新 checkout、只跑过 --dry）。readdirSync 会抛原始
// ENOENT 栈，把下面那句友好提示变成不可达代码，所以先判存在再读。
const discovered = fs.existsSync(RUNS_DIR)
  ? fs.readdirSync(RUNS_DIR).filter(f => /^compare-log.*\.jsonl$/.test(f)).sort()
  : [];
const logPaths = args.includes('--log')
  ? parseLogs(args[args.indexOf('--log') + 1])
  // 401 污染文件已改名为 quarantine-*，不匹配此通配，不会被算进来
  : discovered.map(f => RUNS_DIR + '/' + f);
if (logPaths.length === 0) {
  console.error('未找到任何 compare-log*.jsonl'
    + (fs.existsSync(RUNS_DIR) ? '' : '（' + RUNS_DIR + ' 目录不存在）')
    + '，请传 --log 或先跑 eval-coverage');
  process.exit(1);
}
const cases = JSON.parse(fs.readFileSync('data/coverage-cases.json', 'utf8'));
const byId = new Map(cases.map(c => [c.id, c]));
// 对照侧 401 = 凭据没生效（重启 playground 未 source .env），这类记录整行作废。
// 不能只看 peer.ok：ours 侧仍有效，但 peer 命中率会因此被系统性低估。
// 关键：在「挑最新一条」之前就跳过 401。若先取最新再删，同一 id 上更早的
// 好记录会被更新的 401 行连坐丢弃（修复凭据后重跑同一批就会命中这个坑）。
const isPeerAuthBroken = (e) => typeof e?.peer?.error === 'string' && /\b401\b|authentication_error/.test(e.peer.error);
const peerAuthBrokenIds = new Set();
const currentCorpus = corpusFingerprint(cases).fingerprint;
// 记录属于哪一版语料。老日志没有 corpus 字段（无法追溯），新日志有。
// 这决定「缺题」的真实原因：同一指纹下缺 = 日志被轮转裁掉；
// 指纹不同或缺字段 = 这条当时还不存在，必须重跑——两者处置相反。
const staleCorpusIds = new Set();
let unversioned = 0;
const seen = new Map();
for (const lp of logPaths) {
  for (const line of fs.readFileSync(lp, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (!e.id || !byId.has(e.id)) continue;
      if (isPeerAuthBroken(e)) { peerAuthBrokenIds.add(e.id); continue; }
      const prev = seen.get(e.id);
      const ts = e.ts ? Date.parse(e.ts) : 0;
      const prevTs = prev?.ts ? Date.parse(prev.ts) : -1;
      if (ts >= prevTs) seen.set(e.id, e);
    } catch {}
  }
}
for (const [, e] of seen) {
  if (!e.corpus) unversioned++;
  else if (e.corpus !== currentCorpus) staleCorpusIds.add(e.id);
}
const peerAuthBroken = peerAuthBrokenIds.size;

const stat = (pred) => {
  let n = 0, hit = 0, err = 0, pHit = 0, pErr = 0;
  for (const [id, e] of seen) {
    const c = byId.get(id);
    if (!pred(c, id)) continue;
    n++;
    if (e.ours?.ok) c.accept.includes(e.ours.choice) ? hit++ : 0; else err++;
    // 口径与报表对齐：答错只扣命中率（不计出错），出错=ok:false 或字段缺失
    if (e.peer?.ok) { if (c.accept.includes(e.peer.choice)) pHit++; } else pErr++;
  }
  const rate = (h) => (h / Math.max(n, 1) * 100).toFixed(1) + '%';
  return { n, hit, err, rate: rate(hit), pHit, pErr, pRate: rate(pHit) };
};

const row = (label, s) => '| ' + label + ' | ' + s.rate + ' | ' + s.hit + ' | ' + s.n + ' | ' + s.err + ' | ' + s.pRate + ' | ' + s.pHit + ' | ' + s.pErr + ' |';

const all = stat(() => true);
const expectPerInd = (ind) => cases.filter(c => c.industry === ind).length;
const industries = [...new Set(cases.map(c => c.industry))].sort();

// 行业状态一次算完，作为唯一真源。
//
// 早先这里只定义「评过但不足 90%」一个数组，另加零记录数组，达标数却用
// industries.length - 残值数 反推，于是零记录行业被算成达标。改一处分类、
// 漏掉另一个消费方，是这类错误的典型形态。现在三个集合都从同一次分类产生，
// 谁也不靠减法推。
const status = new Map(industries.map((ind) => [ind, stat(c => c.industry === ind)]));
const byStatus = { complete: [], residual: [], neverRun: [] };
for (const ind of industries) {
  const s = status.get(ind);
  const expected = expectPerInd(ind);
  // n === 0 与「评过但被轮转裁掉」处置完全不同：残值只需翻分片报表核对；
  // 从未评过必须补跑，否则这批行业会永久缺席，而总表看起来只是「跑得慢」。
  if (s.n === 0) byStatus.neverRun.push(ind);
  else if (s.n < expected * 0.9) byStatus.residual.push(ind);
  else byStatus.complete.push(ind);
}
const { complete, residual, neverRun } = byStatus;
// 断言三类互斥且并为全集：分类若有遗漏，这里必须炸，而不是静默少算。
if (complete.length + residual.length + neverRun.length !== industries.length) {
  throw new Error(`行业分类不完整：${complete.length}+${residual.length}+${neverRun.length} != ${industries.length}`);
}
const lines = [
  '# JEV 全量覆盖评测总表',
  '',
  '- 生成时间：' + new Date().toISOString(),
  '- 数据源：' + logPaths.join(', '),
  '- 语料：' + cases.length + ' 条 / ' + industries.length + ' 行业',
  // 可比性凭证：聚合结果是跨多个分片日志拼出来的，没有指纹就无法判断
  // 它与任何一份分片报表是否评的是同一批题。
  '- 语料指纹：`' + corpusFingerprint(cases).fingerprint + '`',
  '- 总命中：**ours ' + all.rate + '**（' + all.hit + '/' + all.n + '，出错 ' + all.err + '）| peer ' + all.pRate + '（' + all.pHit + '/' + all.n + '，出错 ' + all.pErr + '）',
  // 行业口径必须带阈值写明：residual 是按「已答 < 90% 应有」筛的，
  // 若写成「已跑齐」，157/192 这类残值行业会被读成已完成——正是这张表要防的误读。
  '- 语料进度：' + answeredCount() + ' / ' + cases.length + ' 条已答（' + industriesAtLeast90() + ' / ' + industries.length + ' 行业已答≥90%）',
  peerAuthBroken ? '- ⚠ 已剔除对照侧 401 的 ' + peerAuthBroken + ' 条记录（凭据未生效，整行不计）' : '',
  neverRun.length
    ? '- ⚠ 以下 ' + neverRun.length + ' 个行业**从未评测**（日志里 0 条记录），必须补跑；它们的命中率在总表里不代表真实水平：' + neverRun.map((i) => '`' + i + '`').join(' ')
    : '',
  residual.length
    ? '- ⚠ 以下 ' + residual.length + ' 个行业已答不足应有 90%，未跑齐，以 docs/coverage-full/<行业>.md 分片报表为准：' + residual.map((i) => '`' + i + '`').join(' ')
    : '',
  // 缺题原因必须分开说：旧语料下的记录不能算「日志被轮转裁掉」，
  // 那会把「新增题目从没评过」误诊成「评测过但日志丢了」。
  staleCorpusIds.size
    ? '- ⚠ 已答记录中有 ' + staleCorpusIds.size + ' 条来自**旧版语料**（指纹不符），说明这些题目在评测之后才加入语料；它们仍需补跑，不能当作日志轮转残值。'
    : '',
  unversioned
    ? '- ⚠ 有 ' + unversioned + ' 条记录**未标语料指纹**（旧格式日志），无法判断其对应语料版本；缺题原因只能按「需重跑」处理。'
    : '',
  residual.length || neverRun.length
    ? ''
    : '- ✓ 全部分片已跑齐，报表与语料口径一致',
  '',
  '## industry',
  '',
  '| 行业 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
];
// seen 的每个 id 都来自语料（读循环里已按 byId 过滤），所以条目数即已答条数
function answeredCount() {
  let n = 0;
  for (const [, e] of seen) n++;
  return n;
}
function industriesAtLeast90() {
  // 直接取分类结果，不做减法：减法一旦漏掉某一类，就会把从未评过的行业算成达标。
  return complete.length;
}

const completeSet = new Set(complete);
for (const ind of industries) {
  const s = status.get(ind);
  // 零记录不能渲染成 0.0%：那读起来像「全答错了」，实际是「没评过」。
  const flag = completeSet.has(ind) ? '' : s.n === 0 ? ' ⚠ 未评测' : ' ⚠';
  lines.push(row(ind + flag, s));
}
lines.push('', '## dimension', '', '| 维度 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
const dims = [...new Set(cases.map(c => c.dimension))].sort();
for (const d of dims) {
  const s = stat(c => c.dimension === d);
  lines.push(row(d, s));
}
// ours miss 按模板聚合：维度名-序号 归并（同一模板跨行业复用），供修复线优先级参考
const missTop = {};
for (const [id, e] of seen) {
  const c = byId.get(id);
  if (!e.ours?.ok) continue;
  if (c.accept.includes(e.ours.choice)) continue;
  const k = id.replace(/^cov-[a-z0-9]+-/, '').replace(/-\d+$/, '');
  if (!missTop[k]) missTop[k] = { n: 0, inds: new Set() };
  missTop[k].n++; missTop[k].inds.add(c.industry);
}
const missArr = Object.entries(missTop).sort((a, b) => b[1].n - a[1].n);
lines.push('', '## miss 模板（ours 未命中，按频次降序）', '', '| 模板 | miss 数 | 涉及行业 |', '| --- | ---: | ---: |');
for (const [k, v] of missArr) lines.push('| ' + k + ' | ' + v.n + ' | ' + v.inds.size + ' |');
fs.writeFileSync('docs/coverage-full/SUMMARY.md', lines.join('\n') + '\n');
console.log('已写 docs/coverage-full/SUMMARY.md，覆盖', all.n, '条');
