/**
 * 校验 /jev 的多语言覆盖。
 *
 * 这层门禁存在的理由：`jevCopy()` 与 `categoryLabel()` 在缺项时静默回退英文，
 * 页面不会报错、构建也会通过，但用户看到的是英文——这类退化只能靠检查发现。
 *
 * 检查项：
 *   1. 界面文案（枢纽/分类/条目）在 8 种语言下都非空；
 *   2. 分类名在 8 种语言下都非空，且不是英文回退；
 *   3. 验证标签解释在 8 种语言下都非空；
 *   4. 分类名与标签解释在同一语言内不得完全重复（重复说明漏翻）。
 *
 * 用法：node scripts/check-jev-i18n.mjs
 */

import { CATEGORIES, categoryLabel, VERIFICATION_LABELS } from '../src/lib/content/registry.ts';
import { jevCopy, verificationMeaning } from '../src/lib/content/jev-copy.ts';

const LANGS = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

// ---- 1. 界面文案 ----
const SECTIONS = {
  hub: ['title', 'evidence', 'reviewed', 'labels', 'empty'],
  category: ['evidence', 'labels', 'back'],
  entry: [
    'evidence', 'labels', 'decision', 'category', 'language',
    'added', 'reviewed', 'repo', 'back', 'labelsNote',
  ],
};

for (const lang of LANGS) {
  const copy = jevCopy(lang);
  for (const [section, keys] of Object.entries(SECTIONS)) {
    for (const key of keys) {
      const value = copy[section]?.[key];
      if (typeof value !== 'string' || !value.trim()) {
        fail(`ui.${section}.${key}`, `${lang} 为空或缺失`);
      }
    }
  }
  // lead 是函数，必须能对任意计数产出非空串
  for (const section of ['hub', 'category']) {
    const lead = copy[section]?.lead;
    for (const n of [0, 1, 408]) {
      const out = typeof lead === 'function' ? lead(n) : undefined;
      if (typeof out !== 'string' || !out.trim()) {
        fail(`ui.${section}.lead`, `${lang} 在 count=${n} 时为空`);
      }
    }
  }
}

// ---- 2. 分类名 ----
for (const category of CATEGORIES) {
  const seen = new Map();
  for (const lang of LANGS) {
    const label = categoryLabel(category, lang);
    if (!label?.trim()) fail(`category.${category}`, `${lang} 为空`);
    // 非英文语言与英文完全相同，说明走的是回退分支
    if (lang !== 'en' && label === categoryLabel(category, 'en')) {
      fail(`category.${category}`, `${lang} 仍是英文回退（"${label}"）`);
    }
    if (seen.has(label)) {
      fail(`category.${category}`, `${lang} 与 ${seen.get(label)} 文案相同（"${label}"）`);
    }
    seen.set(label, lang);
  }
}

// ---- 3. 验证标签解释 ----
for (const label of VERIFICATION_LABELS) {
  const seen = new Map();
  for (const lang of LANGS) {
    const meaning = verificationMeaning(label, lang);
    if (!meaning?.trim()) fail(`label.${label}`, `${lang} 为空`);
    if (lang !== 'en' && meaning === verificationMeaning(label, 'en')) {
      fail(`label.${label}`, `${lang} 仍是英文回退`);
    }
    if (seen.has(meaning)) {
      fail(`label.${label}`, `${lang} 与 ${seen.get(meaning)} 文案相同`);
    }
    seen.set(meaning, lang);
  }
}

if (errors.length) {
  console.error(`jev-i18n: ${errors.length} 处未本地化或不一致`);
  for (const line of errors) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(
  `jev-i18n: ${LANGS.length} 种语言 × (界面文案 + ${CATEGORIES.length} 分类 + ${VERIFICATION_LABELS.length} 标签) 全部非空且非英文回退`,
);
