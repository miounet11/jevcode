#!/usr/bin/env node
/**
 * i18n 内容缺口检查器。
 *
 * 用法：
 *   node scripts/i18n-gaps.mjs                # 人类可读清单
 *   node scripts/i18n-gaps.mjs --json         # 机器可读 JSON
 *   node scripts/i18n-gaps.mjs --template ja  # 为目标语言打印待翻译文件的 frontmatter 模板
 *
 * 规则：以 en 内容为基准（回退源），对每个文档文件检查目标语言是否缺失。
 * 退出码：有缺口时返回 1（便于 CI 卡点），无缺口返回 0。
 */

import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = 'src/content/docs';
/** 目标语言（en 是回退源、zh 已全量，不在此列） */
const TARGET_LANGS = ['ja', 'ko', 'de', 'fr', 'es', 'pt'];

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const templateLang = args.find((a) => !a.startsWith('--'));

function listDir(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** 递归收集 en 下的 .md 相对路径 */
function collect(dir = DOCS + '/en', prefix = '') {
  const out = [];
  for (const d of listDir(dir)) {
    if (d.isDirectory()) out.push(...collect(join(dir, d.name), prefix + d.name + '/'));
    else if (d.name.endsWith('.md')) out.push(prefix + d.name);
  }
  return out;
}

const enFiles = collect().sort();
const gaps = [];
for (const f of enFiles) {
  const missing = TARGET_LANGS.filter((l) => !existsSync(join(DOCS, l, f)));
  if (missing.length > 0) gaps.push({ file: f, missing_langs: missing });
}

const totalMissing = gaps.reduce((n, g) => n + g.missing_langs.length, 0);

if (asJson) {
  console.log(JSON.stringify({ base: 'en', target_langs: TARGET_LANGS, en_files: enFiles.length, gap_files: gaps.length, total_missing: totalMissing, gaps }, null, 2));
} else if (templateLang) {
  if (!TARGET_LANGS.includes(templateLang)) {
    console.error(`未知目标语言 ${templateLang}，可选：${TARGET_LANGS.join(' ')}`);
    process.exit(2);
  }
  const todo = gaps.filter((g) => g.missing_langs.includes(templateLang));
  console.error(`目标语言 ${templateLang}：${todo.length} 个文件待翻译。生成的骨架已写入 stdout（可重定向保存）。\n`);
  for (const g of todo) {
    const src = join(DOCS, 'en', g.file);
    const raw = readFileSync(src, 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    let body = { title: '', description: '', section: 'cases', order: 0, tags: [], source: '' };
    if (fm) {
      for (const line of fm[1].split('\n')) {
        const m = line.match(/^(title|description|section|order|source):\s*(.*)$/);
        if (m) body[m[1]] = m[2].replace(/^["']|["']$/g, '');
        const t = line.match(/^tags:\s*\[(.*)\]$/);
        if (t) body.tags = t[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      }
    }
    console.log(`# ===== src/content/docs/${templateLang}/${g.file} =====`);
    console.log('---');
    console.log(`title: ""`);
    console.log(`description: ""`);
    console.log(`section: ${body.section}`);
    console.log(`order: ${body.order}`);
    console.log(`tags: [${body.tags.join(', ')}]`);
    if (body.source) console.log(`source: "${body.source}"`);
    console.log('translatedFrom: en');
    console.log('---');
    console.log('');
    console.log(`<!-- 翻译 en/${g.file} 的正文到这里 -->`);
    console.log('');
  }
  console.error(`\n提示：翻译完成后运行 node scripts/i18n-gaps.mjs 确认缺口归零。`);
} else {
  console.log(`i18n 缺口（基准 en，目标 ${TARGET_LANGS.join('/')}）：`);
  console.log(`  en 文件总数：${enFiles.length}`);
  console.log(`  有缺口的文件：${gaps.length}`);
  console.log(`  缺失翻译数：${totalMissing}`);
  console.log('');
  for (const g of gaps) {
    console.log(`  ${g.file}  →  缺 ${g.missing_langs.join(' ')}`);
  }
  console.log('');
  console.log(`生成翻译骨架：node scripts/i18n-gaps.mjs --template <lang>`);
}

process.exit(gaps.length > 0 ? 1 : 0);
