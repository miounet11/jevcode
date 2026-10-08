import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { clearingMoves, hasMatch, makePuzzle, swap } from '../src/lib/match3.mjs';
import { buildRecord, cleanCompareItems, readOfficial, readOmniRow, runCompare } from '../server/compare.mjs';

const sample = {
  id: 'urgency-001',
  context: 'Production checkout has been down for 20 minutes.',
  question: 'Does this message convey urgency?',
  choices: ['yes', 'no'],
};

test('case-index does not contain coverage corpus ids', () => {
  const index = JSON.parse(readFileSync(new URL('../server/case-index.json', import.meta.url), 'utf8'));
  const keys = Object.keys(index);
  assert.ok(keys.length > 0);
  assert.equal(keys.some((key) => key.startsWith('cov-')), false);
});

test('cleanCompareItems accepts a choice question and rejects duplicates', () => {
  assert.equal(cleanCompareItems([sample])?.length, 1);
  assert.equal(cleanCompareItems([{ ...sample, choices: ['yes', 'yes'] }]), null);
  assert.equal(cleanCompareItems([{ ...sample, id: 'Bad Id' }]), null);
  assert.equal(cleanCompareItems([]), null);
  assert.equal(cleanCompareItems(Array.from({ length: 9 }, (_, i) => ({ ...sample, id: `urgency-${i}` }))), null);
});

test('readers keep only probabilities for the offered choices', () => {
  const omni = readOmniRow({ choice: 'yes', probabilities: { yes: 0.91234, no: 0.08, extra: 1 } }, ['yes', 'no'], 12);
  assert.equal(omni.ok, true);
  assert.equal(omni.choice, 'yes');
  assert.equal(omni.probabilities.yes, 0.9123);
  assert.equal(omni.probabilities.extra, undefined);
  assert.equal(omni.model, 'clavue-jev');

  const official = readOfficial(
    { model: 'jev-1.13', answers: { pick: { choice: 'no', confidence: { yes: 0.2, no: 0.8 } } } },
    ['yes', 'no'],
    90,
  );
  assert.equal(official.choice, 'no');
  assert.equal(official.model, 'jev-1.13.0');
  assert.equal(official.ms, 90);
});

test('match-3 puzzles start clean and every accepted swap clears', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const puzzle = makePuzzle(seed);
    if (!puzzle) continue;
    assert.equal(hasMatch(puzzle.board, puzzle.w, puzzle.h), false);
    assert.ok(puzzle.accept.length >= 1 && puzzle.accept.length <= 3);
    assert.ok(puzzle.accept.every((label) => puzzle.choices.includes(label)));
    assert.equal(puzzle.choices.includes('no swap'), true);
    const moves = clearingMoves(puzzle.board, puzzle.w, puzzle.h);
    for (const label of puzzle.accept) {
      const move = moves.find((item) => item.label === label);
      assert.ok(move, label);
      assert.equal(hasMatch(swap(puzzle.board, move.a, move.b), puzzle.w, puzzle.h), true);
    }
  }
});

test('runCompare isolates a down official backend from a healthy omni batch', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('omni')) {
      return {
        ok: true,
        json: async () => ({ rows: [{ choice: 'yes', probabilities: { yes: 0.7, no: 0.3 } }], ms: 18 }),
      };
    }
    throw new Error('connection refused');
  };
  const [row] = await runCompare([sample], {
    omniUrl: 'http://omni/v1/judge',
    officialUrl: 'https://official/v1/systemone',
    officialKey: 'test-key',
    officialModel: 'jev-latest',
    fetchImpl,
  });
  assert.equal(row.ours.ok, true);
  assert.equal(row.ours.choice, 'yes');
  assert.equal(row.official.ok, false);
  assert.equal(row.official.error, 'unreachable');
});

test('buildRecord writes a narration under the public names', () => {
  const record = buildRecord(sample, {
    id: sample.id,
    ours: { ok: true, model: 'clavue-jev', choice: 'yes', probabilities: { yes: 1, no: 0 }, ms: 30 },
    official: { ok: true, model: 'jev-1.13.0', choice: 'no', probabilities: { yes: 0.2, no: 0.8 }, ms: 90 },
  });
  assert.match(record.narration.zh, /clavue-jev/);
  assert.match(record.narration.zh, /jev-1\.13\.0/);
  assert.doesNotMatch(record.narration.zh, /官方|jev-omni|TypeSafe/);
  assert.match(record.narration.en, /disagree/i);
});

test('runCompare does not call TypeSafe when no key is configured', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return { ok: true, json: async () => ({ rows: [{ choice: 'no', probabilities: { no: 0.9, yes: 0.1 } }], ms: 9 }) };
  };
  const [row] = await runCompare([sample], {
    omniUrl: 'http://omni/v1/judge',
    officialUrl: 'https://official/v1/systemone',
    officialKey: '',
    fetchImpl,
  });
  assert.equal(calls, 1);
  assert.equal(row.official.error, 'not_configured');
});
