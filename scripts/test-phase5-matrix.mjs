#!/usr/bin/env node
/**
 * Phase 5 场景配置 / Vibe 编程双目录质量门（零依赖，node:test）。
 * 用法：node --test scripts/test-phase5-matrix.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const { SCENARIO_CONFIGS } = await import('../src/data/configs.ts');
const { VIBE_TUTORIALS } = await import('../src/data/vibecoding.ts');

const LANGS = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'];
const NON_EN = LANGS.filter((lang) => lang !== 'en');

function localizedFields(node, trail, out) {
  if (!node || typeof node !== 'object') return;
  const keys = Object.keys(node);
  if (keys.length > 0 && keys.every((key) => LANGS.includes(key)) && LANGS.every((lang) => typeof node[lang] === 'string')) {
    out.push({ trail, value: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => localizedFields(item, `${trail}[${index}]`, out));
    return;
  }
  for (const [key, value] of Object.entries(node)) localizedFields(value, `${trail}.${key}`, out);
}

function fieldsOf(record, label) {
  const out = [];
  localizedFields(record, label, out);
  return out;
}

// 少数教程文案会「引用」双美元符号本身（如 "no double $$" 这条禁令），
// 那是刻意的教学内容而非模板残留 bug。剥掉这些明确引用后再检测游离的 $$。
function hasStrayDollar(text) {
  return text
    .replace(/`\$\$`/g, '')
    .replace(/\b(?:double|zero|no)\s+\$\$/gi, '')
    .includes('$$');
}

test('场景配置达到条目下限，覆盖 future_roadmap 且百分比自洽', () => {
  assert.ok(SCENARIO_CONFIGS.length >= 20, `SCENARIO_CONFIGS ${SCENARIO_CONFIGS.length}`);
  assert.ok(SCENARIO_CONFIGS.some((row) => row.maturity === 'future_roadmap'));
  for (const row of SCENARIO_CONFIGS) {
    assert.ok(row.completionPct >= 1 && row.completionPct <= 100, `${row.slug} completionPct=${row.completionPct}`);
    assert.equal(row.autoHandledPct + row.escalationPct, 100, `${row.slug} 自动处理与升级占比不等于 100`);
  }
});

test('Vibe 教程达到条目下限，覆盖 roadmap 且每篇结构完整', () => {
  assert.ok(VIBE_TUTORIALS.length >= 16, `VIBE_TUTORIALS ${VIBE_TUTORIALS.length}`);
  assert.ok(VIBE_TUTORIALS.some((row) => row.track === 'roadmap'));
  for (const row of VIBE_TUTORIALS) {
    assert.equal(row.steps.length, 3, `${row.slug} 步骤数 ${row.steps.length}`);
    for (const field of ['vibePrompt', 'configCode', 'programCode']) {
      assert.equal(typeof row[field], 'string', `${row.slug}.${field} 非字符串`);
      assert.ok(row[field].trim().length > 0, `${row.slug}.${field} 为空`);
    }
  }
});

test('双目录所有本地化字段 8 语非空、无 $$，非英文不是整条照抄英文', () => {
  const records = [
    ...SCENARIO_CONFIGS.map((row) => [row.slug, row]),
    ...VIBE_TUTORIALS.map((row) => [row.slug, row]),
  ];
  for (const [slug, record] of records) {
    const fields = fieldsOf(record, slug);
    assert.ok(fields.length > 0, `${slug} 没有本地化字段`);
    for (const { trail, value } of fields) {
      for (const lang of LANGS) {
        assert.equal(typeof value[lang], 'string', `${trail}.${lang} 非字符串`);
        assert.ok(value[lang].trim().length > 0, `${trail}.${lang} 为空`);
        assert.equal(hasStrayDollar(value[lang]), false, `${trail}.${lang} 含 $$`);
      }
    }
    for (const lang of NON_EN) {
      const copied = fields.every(({ value }) => value[lang] === value.en);
      assert.equal(copied, false, `${slug} 的 ${lang} 与 en 完全相同`);
    }
  }
});

test('所有 heroImage 都是 public 下真实存在的 RIFF/WEBP', () => {
  const images = new Set([
    ...SCENARIO_CONFIGS.map((row) => row.heroImage),
    ...VIBE_TUTORIALS.map((row) => row.heroImage),
  ]);
  assert.ok(images.size > 0);
  for (const href of images) {
    assert.match(href, /^\/img\/.+\.webp$/, href);
    const buf = readFileSync(path.join(root, 'public', href));
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', href);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', href);
  }
});

test('Vibe 教程的 relatedConfigSlug 都指向真实场景配置', () => {
  const slugs = new Set(SCENARIO_CONFIGS.map((row) => row.slug));
  for (const row of VIBE_TUTORIALS) {
    assert.ok(slugs.has(row.relatedConfigSlug), `${row.slug} -> ${row.relatedConfigSlug}`);
  }
});

test('裸路径 302 正则覆盖 configs 与 vibecoding', () => {
  const conf = readFileSync(path.join(root, 'deploy/nginx/jevcode.conf'), 'utf8');
  const line = conf.split('\n').find((row) => row.includes('location ~ ^/(jev|compare|'));
  assert.ok(line, '找不到裸路径 location');
  assert.match(line, /configs/);
  assert.match(line, /vibecoding/);
});
