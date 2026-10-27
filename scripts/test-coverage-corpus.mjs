#!/usr/bin/env node
/**
 * 覆盖语料验收测试（零依赖，node:test）。
 * 用法：node --test scripts/test-coverage-corpus.mjs
 *
 * 保证 data/coverage-cases.json 这份语料是「真的能用」的：
 *   - 每条都符合 JEV 的 cleanCompareItems 契约（否则评测时会被静默丢弃）
 *   - id 唯一、accept ⊆ choices
 *   - 四个维度都铺满：60 行业 × 24 类型 × 12 载体 × 8 环节
 *   - manifest 的计数与语料实际计数一致
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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

test('context 全局唯一：不同行业不得渲染出完全相同题面', () => {
  // 模板缺占位符、或两个行业共用同一个词位，都会让数十条用例变成同一句话。
  // 这类重复不会让任何检查失败，却会在站点上生成一批重复内容页。
  const seen = new Map();
  const dup = [];
  for (const c of cases) {
    if (seen.has(c.context)) dup.push(`${c.id} == ${seen.get(c.context)}`);
    else seen.set(c.context, c.id);
  }
  assert.equal(dup.length, 0, `重复题面 ${dup.length} 组，例如：${dup.slice(0, 3).join(' | ')}`);
});

test('每个模板都带占位符，否则 60 个行业会渲染成同一句话', () => {
  const bare = [];
  for (const dim of DIMENSIONS) {
    for (const [tpl] of dim.templates) {
      if (!/\{(subject|artifact|actor|metric|risk)\}/.test(tpl)) bare.push(`${dim.id}: ${tpl}`);
    }
  }
  assert.equal(bare.length, 0, `无占位符模板：${bare.slice(0, 3).join(' | ')}`);
});

test('模板不得写死 a/an 冠词，否则元音开头的词位会产出 "a order"', () => {
  // 词表里以元音开头的词位不少（order / appointment / applicant / investor…），
  // 模板里写死 "a {actor}" 就会渲染成 "a applicant"。判据只看模板，
  // 不依赖某个行业当前恰好用什么词，新增行业时仍然有效。
  const bad = [];
  for (const dim of DIMENSIONS) {
    for (const [tpl] of dim.templates) {
      if (/\b[Aa]n?\s+\{(subject|artifact|actor|metric|risk)\}/.test(tpl)) bad.push(`${dim.id}: ${tpl}`);
    }
  }
  assert.equal(bad.length, 0, `写死冠词：${bad.slice(0, 3).join(' | ')}`);
});

test('渲染结果里没有 a/an 与元音词位的错误搭配', () => {
  // 词位来自 INDUSTRIES 的 [key, label, subject, artifact, actor, metric, risk]。
  const VOWEL_STARTS = INDUSTRIES
    .flatMap((ind) => ind.slice(2))
    .filter((w) => typeof w === 'string')
    .filter((w) => /^[aeiou]/i.test(w));
  const uniq = [...new Set(VOWEL_STARTS)].map((w) => w.replace(/\s+/g, '\\s+'));
  assert.ok(uniq.length > 0, '应当存在元音开头的词位，否则这条判据无效');
  const re = new RegExp(`\\b[Aa]n?\\s+(?:${uniq.join('|')})\\b`);
  const bad = cases.filter((c) => re.test(c.context));
  assert.equal(bad.length, 0, `冠词搭配错误 ${bad.length} 条，例如：${bad.slice(0, 3).map((c) => c.id).join(', ')}`);
});

test('全量分片脚本覆盖语料里的每一个行业', () => {
  // 分片脚本是生成产物，语料扩容后如果不重新生成，新增行业会被静默漏评，
  // 而脚本照常 exit 0，看起来像「全量已跑完」。
  const shPath = path.join(ROOT, 'scripts/run-coverage-full.sh');
  assert.ok(existsSync(shPath), '缺少 scripts/run-coverage-full.sh，请先跑 gen-coverage-full-plan.mjs');

  const sh = readFileSync(shPath, 'utf8');
  const planned = new Set([...sh.matchAll(/--industry (\S+)/g)].map((m) => m[1]));
  const actual = [...new Set(cases.map((c) => c.industry))];

  const missing = actual.filter((i) => !planned.has(i));
  assert.equal(missing.length, 0, `分片脚本漏掉 ${missing.length} 个行业：${missing.join(', ')}`);

  const stale = [...planned].filter((i) => !actual.includes(i));
  assert.equal(stale.length, 0, `分片脚本含语料中不存在的行业：${stale.join(', ')}`);
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
