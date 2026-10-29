#!/usr/bin/env node
/**
 * 扩充 /jev 覆盖语料的候选池：从 GitHub code search 找「README 里提到 Jev/TypeSafe」的仓库，
 * 把新仓库追加进 data/jev/shortlist.json。
 *
 * 只负责发现候选，不判断质量。真正的过滤在 gen-jev-claims.mjs 里：逐条回源抓 raw 文件、
 * 核对行号仍在、行文本仍含关键词，对不上就不写入。因此这里宁可多收，不可漏收。
 *
 * 去重按 repo 全名（大小写不敏感）：已在 shortlist 里的仓库不重复追加，
 * 已进 registry（callsites/claims 或人工登记的 curated）的也不再追加。
 *
 * 用法：
 *   node scripts/discover-jev-candidates.mjs [--dry] [--max=200]
 * 输出：data/jev/shortlist.json 追加新条目；--dry 只打印不写盘。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const TOKEN = process.env.GITHUB_TOKEN ?? '';
const DRY = process.argv.includes('--dry');
const MAX = Number((process.argv.find((a) => a.startsWith('--max=')) ?? '--max=200').split('=')[1]);

const SHORTLIST = 'data/jev/shortlist.json';
/**
 * 只认真正指向这个模型的写法。
 *
 * 不能裸匹配 `typesafe`：那是 Scala 生态的 Typesafe 公司（Akka / Play /
 * typesafe-config），与 Jev 无关，实测一条查询能带出 3.5 万条命中。因此要求
 * 域名 formsafe.ai 或独立的 jev 词。`jev` 本身也有同名噪音，由下游逐条回源
 * 核对行号与上下文来兜底。
 */
const KEY = /typesafe\.ai|\bjev\b/i;
const NEG = /not affiliated|unaffiliated|independent project|no relation|unrelated|instead of|without jev|alternative to/i;

/**
 * code search 的关键词组合。
 *
 * 单个 `jev in:file` 会命中大量同名噪音（jev 也是常见人名/缩写），因此每个查询都
 * 再叠加一个上下文词，把范围收窄到「跟这个模型有关的 README」。
 */
const QUERIES = [
  '"api.typesafe.ai" in:file filename:README.md',
  'typesafe.ai in:file filename:README.md',
  '"system one" typesafe in:file filename:README.md',
];

const headers = {
  Accept: 'application/vnd.github.text-match+json',
  'User-Agent': 'jevcode-discover-candidates',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function search(q) {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=100`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[candidates] ${q} → HTTP ${res.status} ${body.slice(0, 120)}`);
    return [];
  }
  const d = await res.json();
  console.error(`[candidates] ${q} → ${d.total_count ?? '?'} total, ${(d.items ?? []).length} fetched`);
  return d.items ?? [];
}

/**
 * 在 raw 文件里定位命中行，回填真实行号。
 *
 * code search 的 text_matches 只给片段，不给绝对行号；没有行号，生成器就只能
 * 按「整行文本完全相同」去猜，而真实 README 里同一句话的缩进/换行各不相同，
 * 猜不中就静默丢弃。这里直接抓 raw、按片段逐行找，找到才认为这条候选成立。
 */
async function locateLine(candidate) {
  const url = `https://raw.githubusercontent.com/${candidate.repo}/${candidate.branch}/${candidate.file}`;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const lines = (await res.text()).split('\n');
    const idx = lines.findIndex((l) => l.trim() === candidate.text);
    if (idx < 0) return null;
    if (!KEY.test(lines[idx]) || NEG.test(lines[idx])) return null;
    return { ...candidate, line: idx + 1 };
  } catch {
    return null;
  }
}

/** 已收录的 repo：shortlist 里的 + registry 里人工登记的。 */
function knownRepos() {
  const known = new Set();
  if (existsSync(SHORTLIST)) {
    for (const item of JSON.parse(readFileSync(SHORTLIST, 'utf8'))) {
      known.add(String(item.repo).toLowerCase());
    }
  }
  const curated = readFileSync('src/lib/content/registry.ts', 'utf8');
  for (const m of curated.matchAll(/repoUrl: 'https:\/\/github\.com\/([^']+)'/g)) {
    known.add(m[1].toLowerCase());
  }
  return known;
}

const known = knownRepos();
const found = new Map();

for (const q of QUERIES) {
  for (const item of await search(q)) {
    const repo = item.repository?.full_name;
    if (!repo) continue;
    if (known.has(repo.toLowerCase())) continue;
    // text_matches 给出命中片段的精确行号，正是 gen 脚本需要的字段。
    for (const match of item.text_matches ?? []) {
      const fragment = match.fragment ?? '';
      if (!KEY.test(fragment) || NEG.test(fragment)) continue;
      const lineText = fragment.split('\n').find((l) => KEY.test(l) && l.trim());
      if (!lineText) continue;
      // text_matches 只给片段、不给绝对行号；先记 0，由 gen 脚本按全文重新定位。
      found.set(repo.toLowerCase(), {
        repo,
        name: item.repository.name,
        file: item.path,
        branch: item.repository.default_branch ?? 'main',
        line: 0,
        text: lineText.trim(),
      });
      break;
    }
  }
}

// 回填行号：定位不到的候选无法产生可核验的 evidenceUrl，直接丢弃。
const located = [];
for (const candidate of [...found.values()].slice(0, MAX)) {
  const ok = await locateLine(candidate);
  if (ok) located.push(ok);
}
const added = located;
console.log(`[candidates] 新候选 ${added.length} 个（已排除 ${known.size} 个已收录；${found.size} 个片段中 ${found.size - located.length} 个未能定位行号）`);
for (const a of added.slice(0, 20)) console.log(`  ${a.repo}  ${a.file}#L${a.line}`);

if (!DRY && added.length) {
  const list = JSON.parse(readFileSync(SHORTLIST, 'utf8'));
  const merged = [...list, ...added].sort((a, b) => String(a.repo).localeCompare(String(b.repo)));
  writeFileSync(SHORTLIST, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`[candidates] 写入 ${SHORTLIST}：${list.length} → ${merged.length}`);
}
