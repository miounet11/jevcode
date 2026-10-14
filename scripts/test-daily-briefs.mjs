#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextBriefSources } from './lib/daily-briefs.mjs';

const row = (id, extra = {}) => ({
  id,
  industry: 'ecommerce',
  dimension: 'urgency',
  tag: 'sla-breach',
  scene: 'support-ticket',
  stage: 'intake',
  context: 'Ticket: buyer reports the order is failing right now and needs it fixed today.',
  question: 'Does this message convey urgency that should jump the queue?',
  choices: ['yes', 'no'],
  accept: ['yes'],
  ...extra,
});

test('跳过已发布、过短和选项不足的条目，并停在上限', () => {
  const coverage = [
    row('cov-ecommerce-urgency-01'),
    row('note-not-a-case'),
    row('cov-ecommerce-urgency-02', { context: 'short' }),
    row('cov-ecommerce-urgency-03', { choices: ['only'] }),
    row('cov-ecommerce-urgency-04', { accept: ['maybe', 'yes'] }),
    row('cov-ecommerce-urgency-05'),
  ];
  const picked = nextBriefSources(coverage, ['cov-ecommerce-urgency-01'], 1);
  assert.equal(picked.length, 1);
  assert.equal(picked[0].id, 'cov-ecommerce-urgency-04');
  assert.deepEqual(picked[0].accept, ['yes']);
  assert.equal('judgment' in picked[0], false);
});

test('不从语料以外的字段补内容', () => {
  const picked = nextBriefSources([row('cov-ecommerce-urgency-09', { score: 0.99, prose: 'invented' })], [], 5);
  assert.deepEqual(Object.keys(picked[0]).sort(), [
    'accept', 'choices', 'context', 'dimension', 'id', 'industry', 'question', 'scene', 'stage', 'tag',
  ]);
});
