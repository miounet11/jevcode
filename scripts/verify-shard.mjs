// 分片终版独立核算：从 compare-log 重算指定分片的命中/出错，打印供与报表对照
// 用法: node scripts/verify-shard.mjs automotive banking
import fs from 'fs';

const industries = process.argv.slice(2);
if (!industries.length) {
  console.error('用法: node scripts/verify-shard.mjs <industry1> [industry2 ...]');
  process.exit(1);
}
const logArg = process.env.COMPARE_LOG || '.data/runs/compare-log.jsonl';
const logPaths = logArg.split(',');
const cases = JSON.parse(fs.readFileSync('data/coverage-cases.json', 'utf8'));
const byId = new Map(cases.map(c => [c.id, c]));
// 与 aggregate-coverage.mjs 同语义：多日志按每行 ts 取时间最新（与 eval-coverage 逐题重写一致）
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
const prefixes = industries.map(i => 'cov-' + i);
const shard = [...seen.entries()].filter(([id]) => prefixes.some(p => id.startsWith(p)));
let oursHit = 0, oursErr = 0, peerHit = 0, peerErr = 0;
const miss = [];
for (const [id, e] of shard) {
  const c = byId.get(id);
  if (e.ours?.ok) {
    if (c.accept.includes(e.ours.choice)) oursHit++;
    else miss.push(`${id.replace('cov-' + c.industry + '-', '')} ${c.accept.join('/')}->${e.ours.choice} p=${(e.ours.p ?? 0).toFixed(2)} [${c.scene}]`);
  } else oursErr++;
  // 口径与报表对齐：答错只扣命中率（不计出错），出错=ok:false 或字段缺失
  if (e.peer?.ok) {
    if (c.accept.includes(e.peer.choice)) peerHit++;
  } else peerErr++;
}
console.log(JSON.stringify({
  industries,
  已答: shard.length,
  应有: byId.size ? industries.reduce((s, i) => s + cases.filter(c => c.industry === i).length, 0) : 0,
  ours: { 命中: oursHit, 出错: oursErr, 命中率: (oursHit / Math.max(shard.length, 1) * 100).toFixed(1) + '%' },
  peer: { 命中: peerHit, 出错: peerErr, 命中率: (peerHit / Math.max(shard.length, 1) * 100).toFixed(1) + '%' },
}, null, 1));
console.log('\nours miss ' + miss.length + ' 条:');
for (const m of miss) console.log('  ' + m);
