#!/usr/bin/env node
/**
 * llms-full.txt 回归（零依赖，node:test）。
 * 用法：node --test scripts/test-llms-full.mjs
 *
 * 这个文件是给 AI 一次性抓取的全量正文，出错不会让构建失败，
 * 只会让模型读到缺段或失控膨胀的内容——所以要有回归网。
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLlmsFullTxt } from './generate-llms-txt.mjs';

const inputs = {
  briefs: [
    {
      id: 'case-1',
      industry: 'ecommerce',
      dimension: 'urgency',
      scene: 'support-ticket',
      context: 'Buyer says it is urgent.',
      question: 'Is this urgent?',
      choices: ['yes', 'no'],
      accept: ['yes'],
      published: '2026-10-14',
    },
  ],
  briefMap: { 'case-1': { question: 'Is this urgent?', context: 'Buyer says it is urgent.' } },
  docsByLang: {
    en: [{ slug: 'introduction', title: 'JevCode', body: '## The home of Jev\n\nJevCode is where Jev lives.' }],
    zh: [{ slug: 'introduction', title: 'JevCode 中文', body: '不应该出现在全量文本里' }],
  },
  ecosystem: {
    projects: [
      {
        repo: 'a/b',
        slug: 'a--b',
        category: 'tooling',
        language: 'Python',
        license: 'MIT',
        stars: 10,
        forks: 2,
        desc: { en: 'A test project.', zh: '测试项目' },
      },
    ],
    categories: [{ key: 'tooling', title: { en: 'Tooling' }, lead: { en: 'Tools.' }, count: 1 }],
  },
};

test('包含三大段落：文档、生态、案例', () => {
  const text = buildLlmsFullTxt(inputs);
  assert.match(text, /# Docs \(en\)/);
  assert.match(text, /# Ecosystem projects/);
  assert.match(text, /# Ecosystem categories/);
  assert.match(text, /# Daily judgment cases/);
});

test('只收英文正文，不把 8 种语言全并入', () => {
  const text = buildLlmsFullTxt(inputs);
  assert.match(text, /JevCode is where Jev lives/);
  assert.doesNotMatch(text, /不应该出现在全量文本里/);
});

test('每条记录都带可点击的页面 URL', () => {
  const text = buildLlmsFullTxt(inputs);
  assert.match(text, /URL: https:\/\/www\.jevcode\.ai\/en\/introduction\//);
  assert.match(text, /URL: https:\/\/www\.jevcode\.ai\/en\/ecosystem\/a--b\//);
  assert.match(text, /URL: https:\/\/www\.jevcode\.ai\/en\/briefs\/case-1\//);
});

test('长代码块被裁剪，避免全量文本膨胀到不可用', () => {
  const code = Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n');
  const text = buildLlmsFullTxt(
    {
      ...inputs,
      docsByLang: { en: [{ slug: 'x', title: 'X', body: `intro\n\n\`\`\`python\n${code}\n\`\`\`\n` }] },
    },
    { maxCodeLines: 5 },
  );
  assert.match(text, /more lines\)/);
  assert.doesNotMatch(text, /line 39/);
  assert.match(text, /line 0/);
});

test('短代码块原样保留，不做无谓裁剪', () => {
  const text = buildLlmsFullTxt(
    {
      ...inputs,
      docsByLang: { en: [{ slug: 'x', title: 'X', body: '```js\nconst a = 1;\n```' }] },
    },
    { maxCodeLines: 5 },
  );
  assert.match(text, /const a = 1;/);
  assert.doesNotMatch(text, /more lines\)/);
});

test('空输入不抛错，仍产出合法头部', () => {
  const text = buildLlmsFullTxt({ briefs: [], briefMap: {}, docsByLang: {}, ecosystem: null });
  assert.match(text, /^# JevCode — full text/);
});
