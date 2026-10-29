/**
 * 尝试把 `readme-claim` 升级为 `call-site-verified`。
 *
 * 判定必须严格：只有源码里出现真正指向 Jev 的 API 特征才升级，
 * 单凭仓库名或目录名带 "jev" 不算。检测不到就原样保留 readme-claim，
 * 绝不把「没找到」当成「没有调用」。
 *
 * 输出 src/lib/content/registry-callsites.json：
 *   { "<slug>": { file, line, text } }
 * 供 registry 在构建期合并进对应条目。
 *
 * 用法：node scripts/verify-jev-callsites.mjs [--limit N]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
// 直接读原始数组：COVERAGE_ENTRIES 已被本脚本的输出升级过，
// 用它筛 readme-claim 会漏掉已升级条目，导致重复运行时数据被清空。
import { CLAIM_ENTRIES } from '../src/lib/content/registry-claims.ts';
import { CURATED_ENTRIES } from '../src/lib/content/registry.ts';

const OUT = new URL('../src/lib/content/registry-callsites.ts', import.meta.url);

/**
 * 强特征：命中必须是「真的在调 Jev」的代码形状。
 *
 * 刻意排除以下看起来相关、实则不构成调用点的写法：
 *   - 模型常量 `'jev-latest'`、版本号 `"jev-1.13.0"`（只是配置字符串）
 *   - 字典键 `"jev": ...`
 *   - 仓库名/目录名里带 jev
 * 这些在人工抽样中全部是误判，宁可漏判也不虚报。
 */
const STRONG = [
  // 明确的端点
  /api\.typesafe\.ai\/v\d/i,
  /['"`]\/v1\/(system[_-]?one|evaluate)['"`]/i,
  // 明确的请求/响应类型
  /\bSystemOne(Request|Response|Client|Endpoint)\b/,
  // 明确的方法调用
  /\.\s*system[_-]?one\s*\(/i,
  /\bsystem[_-]?one\s*\(\s*[^)]*questions?/i,
  /\bevaluate\s*\(\s*[^)]*questions?/i,
  // 官方 SDK 的真实导入
  /^\s*(import|from|use|require)\b[^;]*typesafe[-_]?(ai|sdk)/i,
  /require\(['"]@typesafe-ai\//i,
];

/** 明确不是调用点的行：文档字符串、纯类型/对象声明、注释。 */
const NOT_A_CALL = [
  /^\s*("""|''')/,
  /^\s*(object|class|interface|type|struct|enum|module|namespace)\s+\w+\s*[:{]/,
  /^\s*(\/\/|#|\*|--|<!--)/,
];

/** 这些路径里的命中不算：文档、依赖、测试夹具、示例数据。 */
const SKIP_PATH =
  /(^|\/)(node_modules|vendor|dist|build|\.git|fixtures?|__tests__|testdata|examples?|docs?|\.agents|third_party|benchmarks?)\//i;

/** 只有真实源码扩展名才算；配置文件、依赖清单的命中一律不算调用点。 */
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|kts|scala|rb|cs|swift|zig|php|lua|ex|exs|dart|jl|r|m|mm|c|cc|cpp|h|hpp)$/i;

/** 出现在这些文件名或行首结构里的命中，只是声明依赖，不是调用。 */
const SKIP_LINE = /^\s*(import\s+type|#include|\/\/|\*|--)/i;
const DECL_ONLY = /\b(keywords|dependencies|devDependencies|description|name)\b\s*[:=]/i;

function findCallSite(files) {
  for (const [path, body] of files) {
    if (SKIP_PATH.test(path) || !SOURCE_EXT.test(path)) continue;
    // 测试文件里的命中可能是夹具，降低可信度，跳过。
    if (/(^|\/)(test|tests|spec|__mocks__)(\/|$)|(_test|\.test|\.spec)\./i.test(path)) continue;
    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const raw = lines[i];
      const line = raw.trim();
      if (line.length < 10 || line.length > 400) continue;
      if (SKIP_LINE.test(raw)) continue;
      if (DECL_ONLY.test(line) && !/\(|\)|=/.test(line)) continue;
      if (NOT_A_CALL.some((re) => re.test(raw))) continue;
      if (!STRONG.some((re) => re.test(line))) continue;
      return { file: path, line: i + 1, text: line.slice(0, 300) };
    }
  }
  return null;
}

/** 极简 tar 解析：只取普通文件内容，够用即可，不引入依赖。 */
function readTarGz(buf) {
  const tar = gunzipSync(buf);
  const files = [];
  for (let off = 0; off + 512 <= tar.length; ) {
    const block = tar.subarray(off, off + 512);
    if (block.every((b) => b === 0)) break;
    const name = block.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const size = parseInt(block.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8) || 0;
    const type = block.subarray(156, 157).toString('utf8');
    const prefix = block.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
    const full = prefix ? `${prefix}/${name}` : name;
    const start = off + 512;
    if (type === '0' || type === '') {
      if (size > 0 && size < 400_000) {
        files.push([full, tar.subarray(start, start + size).toString('utf8')]);
      }
    }
    off = start + Math.ceil(size / 512) * 512;
  }
  return files;
}

async function fetchTarball(repo) {
  for (const ref of ['main', 'master']) {
    try {
      const res = await fetch(`https://codeload.github.com/${repo}/tar.gz/${ref}`, {
        headers: { 'user-agent': 'jevcode-cov' },
        signal: AbortSignal.timeout(40_000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 40 * 1024 * 1024) return null; // 超大仓库跳过，避免内存与时长失控
      const files = readTarGz(buf);
      if (files) {
        files.ref = ref;
        // 顶层目录名由仓库作者决定，可能是 `repo-ref`，也可能完全不同的名字
        // （如 kunobi-jev 的实际目录是 kunobi-decision-main）。取第一条文件路径的
        // 首段，而不是猜 `<repo>-<ref>`。
        files.top = files[0]?.[0]?.split('/')[0] ?? null;
      }
      return files;
    } catch {
      /* 换下一个 ref */
    }
  }
  return null;
}

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

const targets = [...CURATED_ENTRIES, ...CLAIM_ENTRIES]
  .filter((e) => e.verification.includes('readme-claim'))
  .slice(0, limit);
const result = {};
let upgraded = 0;
let checked = 0;

const CONCURRENCY = 8;
const queue = [...targets];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;
      const repo = entry.repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
      const files = await fetchTarball(repo);
      checked += 1;
      if (!files) continue;
      const hit = findCallSite(files);
      if (hit) {
        // tarball 内路径带顶层目录，GitHub blob 链接不需要它；
        // 顶层目录名不一定是 `<repo>-<ref>`，按实际首段剥离。
        const top = files.top;
        const file =
          top && hit.file.startsWith(`${top}/`) ? hit.file.slice(top.length + 1) : hit.file;
        result[entry.slug] = { ...hit, file, ref: files.ref ?? 'main' };
        upgraded += 1;
      }
    }
  }),
);

// 写成 TS 模块而非 JSON：Node 直接跑 .ts 与 Astro/Vite 都能导入，
// JSON 需要 import assertion，两边行为不一致。
await writeFile(
  OUT,
  `// 由 scripts/verify-jev-callsites.mjs 生成，请勿手改。\n` +
    `export interface CallSite { file: string; line: number; text: string; ref: string }\n` +
    `export const CALL_SITES: Record<string, CallSite> = ${JSON.stringify(result, null, 2)};\n`,
);

console.log(
  `jev-callsites: 检查 ${checked} 条，源码命中 ${upgraded} 条，其余保留 readme-claim（未找到 ≠ 不存在）`,
);
