#!/usr/bin/env node
/**
 * 从 data/coverage-cases.json 给实验室补最多 4 个还没有的场景。
 * 写入 src/data/lab-supplement.json。不碰 server/case-index.json。
 *
 * 用法：node scripts/supplement-lab.mjs
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { nextScenarios } from './lib/lab-supplement.mjs';

const COVERAGE = 'data/coverage-cases.json';
const SUPPLEMENT = 'src/data/lab-supplement.json';
const LAB = 'src/pages/[lang]/lab.astro';

function builtinIds() {
  const source = readFileSync(LAB, 'utf8');
  const frontmatter = source.split('---')[1] ?? '';
  return [...frontmatter.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
}

const coverage = JSON.parse(readFileSync(COVERAGE, 'utf8'));
const existing = existsSync(SUPPLEMENT) ? JSON.parse(readFileSync(SUPPLEMENT, 'utf8')) : [];
const ids = new Set([...builtinIds(), ...existing.map((item) => item.id)]);
const more = nextScenarios(coverage, ids, 4);
if (!more.length) {
  console.log(JSON.stringify({ added: 0, total: existing.length }));
} else {
  const next = existing.concat(more);
  writeFileSync(SUPPLEMENT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(JSON.stringify({ added: more.length, total: next.length, ids: more.map((item) => item.id) }));
}
