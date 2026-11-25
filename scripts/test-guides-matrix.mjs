#!/usr/bin/env node
/**
 * GPU / 行业 / 源码三份目录的质量门（零依赖，node:test）。
 * 用法：node --test scripts/test-guides-matrix.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const { GPU_PROFILES } = await import('../src/data/gpus.ts');
const { INDUSTRY_CASES } = await import('../src/data/industries.ts');
const { CODE_RECIPES } = await import('../src/data/recipes.ts');

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

test('三份目录达到条目下限，并覆盖 roadmap 与两种源码', () => {
  assert.ok(GPU_PROFILES.length >= 15, `GPU_PROFILES ${GPU_PROFILES.length}`);
  assert.ok(GPU_PROFILES.some((row) => row.tier === 'roadmap'));
  assert.ok(INDUSTRY_CASES.length >= 18, `INDUSTRY_CASES ${INDUSTRY_CASES.length}`);
  assert.ok(CODE_RECIPES.length >= 16, `CODE_RECIPES ${CODE_RECIPES.length}`);
  assert.ok(CODE_RECIPES.some((row) => row.kind === 'language'));
  assert.ok(CODE_RECIPES.some((row) => row.kind === 'blueprint'));
});

test('每个本地化字段 8 语非空且不含 $$，非英文不是整条照抄英文', () => {
  const records = [
    ...GPU_PROFILES.map((row) => [row.slug, row]),
    ...INDUSTRY_CASES.map((row) => [row.slug, row]),
    ...CODE_RECIPES.map((row) => [row.slug, row]),
  ];
  for (const [slug, record] of records) {
    const fields = fieldsOf(record, slug);
    assert.ok(fields.length > 0, `${slug} 没有本地化字段`);
    for (const { trail, value } of fields) {
      for (const lang of LANGS) {
        assert.equal(typeof value[lang], 'string');
        assert.ok(value[lang].trim().length > 0, `${trail}.${lang} 为空`);
        assert.equal(value[lang].includes('$$'), false, `${trail}.${lang} 含 $$`);
      }
    }
    for (const lang of NON_EN) {
      const copied = fields.every(({ value }) => value[lang] === value.en);
      assert.equal(copied, false, `${slug} 的 ${lang} 与 en 完全相同`);
    }
  }
});

test('heroImage 都是 public 下的 RIFF/WEBP', () => {
  const images = new Set([
    ...GPU_PROFILES.map((row) => row.heroImage),
    ...INDUSTRY_CASES.map((row) => row.heroImage),
    ...CODE_RECIPES.map((row) => row.heroImage),
  ]);
  assert.ok(images.size > 0);
  for (const href of images) {
    assert.match(href, /^\/img\/.+\.webp$/);
    const file = path.join(root, 'public', href);
    const buf = readFileSync(file);
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', href);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', href);
  }
});

test('显卡与源码交叉链接都指向真实 slug', () => {
  const gpus = new Set(GPU_PROFILES.map((row) => row.slug));
  const recipes = new Set(CODE_RECIPES.map((row) => row.slug));
  for (const row of INDUSTRY_CASES) {
    assert.ok(gpus.has(row.recommendedGpuSlug), row.recommendedGpuSlug);
    assert.ok(recipes.has(row.recommendedRecipeSlug), row.recommendedRecipeSlug);
  }
  for (const row of CODE_RECIPES) {
    assert.ok(gpus.has(row.relatedGpuSlug), row.relatedGpuSlug);
  }
});

test('裸路径 302 覆盖 gpus、industries、recipes', () => {
  const conf = readFileSync(path.join(root, 'deploy/nginx/jevcode.conf'), 'utf8');
  const line = conf.split('\n').find((row) => row.includes('location ~ ^/(jev|compare|'));
  assert.ok(line, '找不到裸路径 location');
  assert.match(line, /gpus/);
  assert.match(line, /industries/);
  assert.match(line, /recipes/);
});
