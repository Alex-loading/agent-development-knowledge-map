import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProgress } from '../src/core/progress.js';
import { createProgressStore } from '../src/core/storage.js';

test('persists and reloads valid progress', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const store = createProgressStore(storage);
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01', 'stale-lesson'],
    quizResults: {
      'llm-01': {
        correct: 1,
        total: 2,
        percent: 50,
        results: [{ correct: true, explanation: '有效解释', selectedIndex: 1 }],
        completedAt: '2026-07-20T10:00:00.000Z',
      },
    },
    interviewStatusById: { 'stale-question': 'reviewing' },
    reviewQueue: ['stale-question'],
  };

  store.save(state);

  assert.deepEqual(store.load(), state);
});

test('returns defaults for corrupt storage', () => {
  const storage = {
    getItem: () => '{broken',
    setItem() {},
    removeItem() {},
  };
  const store = createProgressStore(storage);

  assert.deepEqual(store.load(), createDefaultProgress('llm-foundation'));
});

test('returns exact defaults for structurally invalid nested progress records', () => {
  const invalidStates = [
    { quizResults: { 'llm-01': null } },
    { completedLessonIds: ['llm-01', 2] },
    { reviewQueue: ['iq-llm-01-1', null] },
    { quizResults: { 'llm-01': { correct: 1, total: 2, percent: 50, results: null } } },
    { quizResults: { 'llm-01': { correct: 1, total: 2, percent: 50, results: [{ correct: 'yes', explanation: '错误类型' }] } } },
    { quizResults: { 'llm-01': { correct: 1, total: 2, percent: 50, results: [{ correct: true, explanation: 42 }] } } },
    { quizResults: { 'llm-01': { correct: 1, total: 2, percent: 50, results: [], completedAt: 1 } } },
    { interviewStatusById: { 'iq-llm-01-1': 'unknown' } },
  ];
  const defaults = createDefaultProgress('llm-foundation');

  for (const invalid of invalidStates) {
    const storage = {
      getItem: () => JSON.stringify({ ...defaults, ...invalid }),
      setItem() {},
      removeItem() {},
    };
    const store = createProgressStore(storage);

    assert.deepEqual(store.load(), defaults);
    assert.equal(store.mode(), 'local');
  }
});

test('falls back to memory when storage throws', () => {
  const storage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
    removeItem() {},
  };
  const store = createProgressStore(storage);
  const state = {
    ...createDefaultProgress('llm-foundation'),
    currentLessonId: 'llm-03',
  };

  store.save(state);

  assert.equal(store.load().currentLessonId, 'llm-03');
  assert.equal(store.mode(), 'memory');
});

test('reset removes only the Agent Learner progress key', () => {
  const values = new Map([
    ['agent-learner:progress:v1', JSON.stringify(createDefaultProgress('llm-foundation'))],
    ['unrelated:application:key', 'keep-me'],
  ]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };

  createProgressStore(storage).reset();

  assert.equal(values.has('agent-learner:progress:v1'), false);
  assert.equal(values.get('unrelated:application:key'), 'keep-me');
});
