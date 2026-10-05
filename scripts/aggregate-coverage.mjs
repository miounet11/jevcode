// 全量覆盖评测聚合报表：读 compare-log（可多个，逗号分隔），输出 7680 条总表
// 用法: node scripts/aggregate-coverage.mjs [--log .data/runs/compare-log.jsonl,.data/runs/compare-log-shard1-adtech-backup.jsonl]
// 多日志时按每行 ts 字段取时间最新的行（不依赖文件顺序；无 ts 字段的行视为最早）
import fs from 'fs';

const args = process.argv.slice(2);
const logArg = args.includes('--log') ? args[args.indexOf('--log') + 1] : '.data/runs/compare-log.jsonl';
const logPaths = logArg.split(',');
const cases = JSON.parse(fs.readFileSync('data/coverage-cases.json', 'utf8'));
const byId = new Map(cases.map(c => [c.id, c]));
const seen = new Map();
for (const lp of logPaths) {
  for (const line of fs.readFileSync(lp, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (!e.id || !byId.has(e.id)) continue;
      const prev = seen.get(e.id);
      const ts = e.ts ? Date.parse(e.ts) : 0;
      const prevTs = prev?.ts ? Date.parse(prev.ts) : -1;
      if (ts >= prevTs) seen.set(e.id, e);
    } catch {}
  }
}

// 对照侧 401 = 凭据没生效（重启 playground 未 source .env），这类记录整行作废。
// 不能只看 peer.ok：ours 侧仍有效，但 peer 命中率会因此被系统性低估。
const isPeerAuthBroken = (e) => typeof e.peer?.error === 'string' && /\b401\b|authentication_error/.test(e.peer.error);
let peerAuthBroken = 0;
for (const [, e] of seen) if (isPeerAuthBroken(e)) peerAuthBroken++;
for (const [id, e] of [...seen]) if (isPeerAuthBroken(e)) seen.delete(id);

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
// 各行业应有 192 条；日志被 playground 轮转裁剪（400KB 保 300 行）后，
// 覆盖不全的行业行会以残值出现（如 cybersecurity 28/192），直接入表会误导。
// 这里对已答 < 90% 应有的行业行标注 ⚠，并在头部说明以该分片报表为准。
const expectPerInd = (ind) => cases.filter(c => c.industry === ind).length;
const lines = [
  '# JEV 全量覆盖评测总表',
  '',
  '- 生成时间：' + new Date().toISOString(),
  '- 数据源：' + logPaths.join(', '),
  '- 语料：' + cases.length + ' 条 / ' + new Set(cases.map(c => c.industry)).size + ' 行业',
  '- 总命中：**ours ' + all.rate + '**（' + all.hit + '/' + all.n + '，出错 ' + all.err + '）| peer ' + all.pRate + '（' + pHit0(all) + '/' + all.n + '，出错 ' + all.pErr + '）',
  '- ⚠ 已答不足应有 90% 的行业行为日志轮转残值，以 docs/coverage-full/<行业>.md 分片报表为准',
  peerAuthBroken ? '- ⚠ 已剔除对照侧 401 的 ' + peerAuthBroken + ' 条记录（凭据未生效，整行不计）' : '',
  '',
  '## industry',
  '',
  '| 行业 | ours 命中率 | ours 命中 | 已答 | 出错 | peer 命中率 | peer 命中 | peer 出错 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
];
function pHit0(s) { return s.pHit; }

const industries = [...new Set(cases.map(c => c.industry))].sort();
for (const ind of industries) {
  const s = stat(c => c.industry === ind);
  const flag = s.n < expectPerInd(ind) * 0.9 ? ' ⚠' : '';
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
