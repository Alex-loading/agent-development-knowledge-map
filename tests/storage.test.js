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
    completedLessonIds: ['llm-01'],
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
