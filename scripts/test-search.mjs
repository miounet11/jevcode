// 本地验证 pagefind 索引：node scripts/test-search.mjs（需先起 dist 的本地 HTTP 服务）
// 用 data: URL 动态载入 pagefind.js（node 不支持 blob: ESM）
import { b64 } from './lib/b64.mjs';

const base = process.env.PF_BASE ?? 'http://127.0.0.1:4178';
const res = await fetch(`${base}/pagefind/pagefind.js`);
const code = await res.text();
const moduleUrl = `data:text/javascript;base64,${b64(code)}`;
const pagefind = await import(moduleUrl);
await pagefind.options?.({ basePath: `${base}/pagefind/` });

let ok = true;
const cases = [
  ['zh', ['置信度', 'autoformat', '护栏']],
  ['en', ['confidence', 'fan-out', 'routing']],
];
for (const [lang, queries] of cases) {
  for (const q of queries) {
    const r = await pagefind.search(q, { locale: lang });
    const top = r.results[0] ? (await r.results[0].data()).meta.title : '(none)';
    console.log(`[${lang}] ${q} -> ${r.results.length} results, top: ${top}`);
    if (r.results.length === 0) ok = false;
  }
}
console.log(ok ? 'SEARCH OK' : 'SEARCH FAIL');
process.exit(ok ? 0 : 1);
