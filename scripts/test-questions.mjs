#!/usr/bin/env node
/**
 * 选择题转译与输入 token 估算。
 * 用法：node --test scripts/test-questions.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { billableInputTokens, cleanQuestions, toUpstreamQuestions } from '../server/questions.mjs';
import {
  INPUT_USD_PER_MILLION, SIGNUP_CREDIT_MICROUSD, SIGNUP_INPUT_TOKENS,
  inputCostMicroUsd, inputTokensLeft, microUsdToUsd,
} from '../server/plans.mjs';

test('公开价与 $5 能覆盖的 token', () => {
  assert.equal(INPUT_USD_PER_MILLION, 0.042);
  assert.equal(SIGNUP_INPUT_TOKENS, 119_047_619);
  assert.equal(inputCostMicroUsd(SIGNUP_INPUT_TOKENS), SIGNUP_CREDIT_MICROUSD);
  assert.equal(inputTokensLeft(SIGNUP_CREDIT_MICROUSD), SIGNUP_INPUT_TOKENS);
  assert.equal(inputCostMicroUsd(1000), 42);
  assert.equal(inputCostMicroUsd(1), 1);
  assert.equal(inputCostMicroUsd(0), 0);
});

test('微美元展示', () => {
  assert.equal(microUsdToUsd(0), '0.00');
  assert.equal(microUsdToUsd(5_000_000), '5.00');
  assert.equal(microUsdToUsd(42), '0.000042');
  assert.equal(microUsdToUsd(4_999_958), '4.999958');
  assert.equal(microUsdToUsd(10_000), '0.01');
  assert.equal(microUsdToUsd(100_000), '0.10');
  assert.equal(microUsdToUsd(-42), '-0.000042');
});

test('options 收成 criteria，已有 criteria 优先', () => {
  const cleaned = cleanQuestions({
    m1: { type: 'choice', instructions: 'Pick', options: ['yes', 'yes', ' no '] },
    m2: { type: 'choice', instructions: 'Pick', criteria: { yes: 'do it', no: 'skip' }, options: ['a', 'b'] },
    q: { type: 'noul', instructions: 'Relevant?' },
  });
  assert.deepEqual(cleaned.m1.options, ['yes', 'no']);
  assert.equal(cleaned.m1.criteria, undefined);
  assert.deepEqual(cleaned.m2.criteria, { yes: 'do it', no: 'skip' });
  assert.equal(cleaned.m2.options, undefined);

  const upstream = toUpstreamQuestions(cleaned);
  assert.deepEqual(upstream.m1, { type: 'choice', instructions: 'Pick', criteria: { yes: 'yes', no: 'no' } });
  assert.deepEqual(upstream.m2.criteria, { yes: 'do it', no: 'skip' });
  assert.deepEqual(upstream.q, cleaned.q);
  assert.equal(upstream.m1.options, undefined);
});

test('不够两个选项的 choice 被丢掉', () => {
  assert.equal(cleanQuestions({
    m1: { type: 'choice', instructions: 'Pick', options: ['only'] },
  }), null);
});

test('token 按 UTF-8 字节向上取整，且用转译后的 questions', () => {
  const questions = toUpstreamQuestions(cleanQuestions({
    m1: { type: 'choice', instructions: 'Pick', options: ['yes', 'no'] },
  }));
  const state = 'abcdefgh';
  const text = `${state}\n${JSON.stringify(questions)}`;
  const expect = Math.max(1, Math.ceil(Buffer.byteLength(text, 'utf8') / 4));
  assert.equal(billableInputTokens(state, questions), expect);
  assert.ok(expect >= 1);
});
