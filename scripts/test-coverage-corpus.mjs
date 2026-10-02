#!/usr/bin/env node
/**
 * 覆盖语料验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-coverage-corpus.mjs
 *
 * 保证 data/coverage-cases.json 这份语料是「真的能用」的：
 *   - 每条都符合 JEV 的 cleanCompareItems 契约（否则评测时会被静默丢弃）
 *   - id 唯一、accept ⊆ choices
 *   - 四个维度都铺满：40 行业 × 24 类型 × 12 载体 × 8 环节
 *   - manifest 的计数与语料实际计数一致
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanCompareItems } from '../server/compare.mjs';
import { INDUSTRIES, DIMENSIONS, TAGS, SCENES, STAGES } from './lib/coverage-taxonomy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cases = JSON.parse(readFileSync(path.join(ROOT, 'data/coverage-cases.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'data/coverage-manifest.json'), 'utf8'));

test('语料非空且总量等于 manifest.total', () => {
  assert.ok(Array.isArray(cases) && cases.length > 0, '语料应为非空数组');
  assert.equal(cases.length, manifest.total, 'manifest.total 应与语料条数一致');
});

test('每条都通过 JEV 的 cleanCompareItems 契约', () => {
  const bad = [];
  for (const c of cases) {
    const ok = cleanCompareItems([{ id: c.id, context: c.context, question: c.question, choices: c.choices }]);
    if (!ok) bad.push(c.id);
  }
  assert.equal(bad.length, 0, `有 ${bad.length} 条不合契约，例如：${bad.slice(0, 5).join(', ')}`);
});

test('id 全局唯一', () => {
  const seen = new Set();
  const dup = [];
  for (const c of cases) {
    if (seen.has(c.id)) dup.push(c.id);
    seen.add(c.id);
  }
  assert.equal(dup.length, 0, `重复 id：${dup.slice(0, 5).join(', ')}`);
});

test('accept 非空且都落在 choices 内', () => {
  const bad = cases.filter((c) => !Array.isArray(c.accept) || c.accept.length === 0
    || !c.accept.every((a) => c.choices.includes(a)));
  assert.equal(bad.length, 0, `accept 越界的用例：${bad.slice(0, 5).map((c) => c.id).join(', ')}`);
});

test('五个维度全部铺满', () => {
  const uniq = (k) => new Set(cases.map((c) => c[k]));
  assert.equal(uniq('industry').size, INDUSTRIES.length, '应覆盖全部行业');
  assert.equal(uniq('dimension').size, DIMENSIONS.length, '应覆盖全部判定类型');
  assert.equal(uniq('tag').size, TAGS.length, '应覆盖全部 tag');
  assert.equal(uniq('scene').size, SCENES.length, '应覆盖全部载体形态');
  assert.equal(uniq('stage').size, STAGES.length, '应覆盖全部环节');
});

test('每个行业 × 每个类型都有用例（无空洞）', () => {
  const grid = new Set(cases.map((c) => `${c.industry}|${c.dimension}`));
  const missing = [];
  for (const ind of INDUSTRIES) {
    for (const dim of DIMENSIONS) {
      if (!grid.has(`${ind[0]}|${dim.id}`)) missing.push(`${ind[0]}|${dim.id}`);
    }
  }
  assert.equal(missing.length, 0, `缺失组合：${missing.slice(0, 5).join(', ')}`);
});

test('每个 tag 都在多个不同行业中至少出现一次（横切而非绑定单一行业）', () => {
  const tagIndustries = {};
  for (const c of cases) {
    (tagIndustries[c.tag] ||= new Set()).add(c.industry);
  }
  const thin = TAGS.map((t) => t[0]).filter((t) => (tagIndustries[t]?.size || 0) < 2);
  assert.equal(thin.length, 0, `横切面过窄的 tag：${thin.join(', ')}`);
});

test('manifest 各维度计数与语料一致', () => {
  const countBy = (k) => {
    const m = {};
    for (const c of cases) m[c[k]] = (m[c[k]] || 0) + 1;
    return m;
  };
  for (const axis of ['industry', 'dimension', 'tag', 'scene', 'stage']) {
    assert.deepEqual(manifest.axes[axis], countBy(axis), `${axis} 计数不一致`);
  }
});
