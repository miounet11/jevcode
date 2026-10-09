// 本地验证 pagefind 索引：node scripts/test-search.mjs（需先起 dist 的本地 HTTP 服务）
// 用 data: URL 动态载入 pagefind.js（node 不支持 blob: ESM）。
//
// 关键：pagefind 1.5 的 createInstance() 强制 language=detectLanguage()，
// 而 detectLanguage() 在 node 里（无 document）恒为 "unknown"，
// findIndex("unknown") 会回退到 page_count 最大的语言索引（当前是 en），
// 中文查询于是永远 0 命中——这是测试环境的假象，浏览器里 html lang=zh-CN
// 正常命中 zh-cn 索引（已用真浏览器验证：置信度→置信度路由）。
// 因此这里在 import 前伪造最小 document，让 pagefind 读到 html lang="zh-CN"。
// 注意只伪造 document，不伪造 window：否则 pagefind 会把绝对 basePath
// 与 window.location.origin 合成，fetch 相对路径直接失败。

const base = process.env.PF_BASE ?? 'http://127.0.0.1:4178';

globalThis.document = { querySelector: () => ({ getAttribute: () => 'zh-CN' }), currentScript: null };

const { b64 } = await import('./lib/b64.mjs');
const res = await fetch(`${base}/pagefind/pagefind.js`);
const code = await res.text();
const moduleUrl = `data:text/javascript;base64,${b64(code)}`;
const pagefindMod = await import(moduleUrl);
const pagefind = await pagefindMod.createInstance({ basePath: `${base}/pagefind/` });

let ok = true;
const cases = [
  ['zh', ['置信度', 'autoformat', '护栏']],
  ['en', ['confidence', 'fan-out', 'routing']],
];
for (const [lang, queries] of cases) {
  for (const q of queries) {
    try {
      const r = await pagefind.search(q);
      const top = r.results[0] ? (await r.results[0].data()).meta.title : '(none)';
      console.log(`[${lang}] ${q} -> ${r.results.length} results, top: ${top}`);
      if (r.results.length === 0) ok = false;
    } catch (err) {
      console.log(`[${lang}] ${q} -> ERR ${String(err.message).slice(0, 80)}`);
      ok = false;
    }
  }
}
console.log(ok ? 'SEARCH OK' : 'SEARCH FAIL');
process.exit(ok ? 0 : 1);
