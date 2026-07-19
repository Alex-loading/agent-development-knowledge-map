import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultProgress,
  markLessonComplete,
  recordQuizResult,
  resetModuleProgress,
  setInterviewStatus,
  summarizeProgress,
  toggleReviewQueue,
} from '../src/core/progress.js';

test('createDefaultProgress returns the initial LLM foundation state', () => {
  assert.deepEqual(createDefaultProgress('llm-foundation'), {
    version: 1,
    currentModuleId: 'llm-foundation',
    currentLessonId: 'llm-01',
    completedLessonIds: [],
    quizResults: {},
    interviewStatusById: {},
    reviewQueue: [],
    lastVisitedAt: null,
  });
});

test('markLessonComplete deduplicates lessons and setInterviewStatus records mastery', () => {
  const initial = createDefaultProgress('llm-foundation');
  const afterFirstCompletion = markLessonComplete(initial, 'llm-01');
  const afterDuplicateCompletion = markLessonComplete(afterFirstCompletion, 'llm-01');
  const updated = setInterviewStatus(afterDuplicateCompletion, 'llm-q-01', 'mastered');

  assert.deepEqual(updated.completedLessonIds, ['llm-01']);
  assert.deepEqual(updated.interviewStatusById, { 'llm-q-01': 'mastered' });
  assert.deepEqual(initial.completedLessonIds, []);
  assert.deepEqual(initial.interviewStatusById, {});
});

test('summarizeProgress separately calculates lesson and interview completion', () => {
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01', 'llm-02'],
    interviewStatusById: {
      'llm-q-01': 'mastered',
      'llm-q-02': 'learning',
    },
  };

  assert.deepEqual(summarizeProgress(state, 8, 4), {
    lessonsCompleted: 2,
    lessonPercent: 25,
    interviewsMastered: 1,
    interviewPercent: 25,
  });
});

test('summarizeProgress de-duplicates and clamps counts when only numeric totals are known', () => {
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01', 'llm-01', 'stale-a', 'stale-b'],
    interviewStatusById: {
      'iq-1': 'mastered',
      'iq-2': 'mastered',
      stale: 'mastered',
    },
  };

  assert.deepEqual(summarizeProgress(state, 2, 2), {
    lessonsCompleted: 2,
    lessonPercent: 100,
    interviewsMastered: 2,
    interviewPercent: 100,
  });
});

test('summarizeProgress intersects persisted IDs with current lesson and question scopes', () => {
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01', 'llm-01', 'stale-lesson'],
    interviewStatusById: {
      'iq-current': 'mastered',
      'iq-stale': 'mastered',
    },
  };

  assert.deepEqual(summarizeProgress(
    state,
    [{ id: 'llm-01' }, { id: 'llm-02' }],
    ['iq-current', 'iq-other'],
  ), {
    lessonsCompleted: 1,
    lessonPercent: 50,
    interviewsMastered: 1,
    interviewPercent: 50,
  });
});

test('toggleReviewQueue immutably adds unique questions in order and removes existing ones', () => {
  const initial = {
    ...createDefaultProgress('llm-foundation'),
    reviewQueue: ['iq-1', 'iq-1'],
  };
  const snapshot = structuredClone(initial);

  const added = toggleReviewQueue(initial, 'iq-2');
  const removed = toggleReviewQueue(added, 'iq-1');

  assert.deepEqual(added.reviewQueue, ['iq-1', 'iq-2']);
  assert.deepEqual(removed.reviewQueue, ['iq-2']);
  assert.notEqual(added, initial);
  assert.notEqual(added.reviewQueue, initial.reviewQueue);
  assert.deepEqual(initial, snapshot);
});

test('recordQuizResult stores a defensive result copy by lesson id without mutating input', () => {
  const initial = createDefaultProgress('llm-foundation');
  const result = {
    correct: 1,
    total: 2,
    percent: 50,
    results: [{ correct: true, explanation: '解释' }],
    completedAt: '2026-07-20T10:00:00.000Z',
  };

  const updated = recordQuizResult(initial, 'llm-03', result);
  result.results[0].correct = false;

  assert.deepEqual(updated.quizResults['llm-03'], {
    correct: 1,
    total: 2,
    percent: 50,
    results: [{ correct: true, explanation: '解释' }],
    completedAt: '2026-07-20T10:00:00.000Z',
  });
  assert.deepEqual(initial.quizResults, {});
  assert.notEqual(updated.quizResults, initial.quizResults);
});

test('progress operations defend missing collections and preserve unrelated fields without mutating input', () => {
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: undefined,
    quizResults: undefined,
    interviewStatusById: undefined,
    reviewQueue: undefined,
    unrelatedApplicationState: { theme: 'paper' },
  };
  const snapshot = structuredClone(state);

  const completed = markLessonComplete(state, 'llm-01');
  const interviewed = setInterviewStatus(completed, 'iq-1', 'reviewing');
  const queued = toggleReviewQueue(interviewed, 'iq-1');
  const quizzed = recordQuizResult(queued, 'llm-01', {
    correct: 0, total: 1, percent: 0, results: [],
  });

  assert.deepEqual(quizzed.completedLessonIds, ['llm-01']);
  assert.deepEqual(quizzed.interviewStatusById, { 'iq-1': 'reviewing' });
  assert.deepEqual(quizzed.reviewQueue, ['iq-1']);
  assert.deepEqual(quizzed.quizResults['llm-01'].results, []);
  assert.deepEqual(quizzed.unrelatedApplicationState, { theme: 'paper' });
  assert.deepEqual(state, snapshot);
});

test('resetModuleProgress returns the exact clean module state', () => {
  const dirty = {
    ...createDefaultProgress('another-module', 'old-lesson'),
    completedLessonIds: ['old-lesson'],
    quizResults: { 'old-lesson': { correct: 1, total: 1 } },
    reviewQueue: ['iq-1'],
    unrelatedApplicationState: true,
  };

  assert.deepEqual(
    resetModuleProgress(dirty, 'llm-foundation', 'llm-02'),
    createDefaultProgress('llm-foundation', 'llm-02'),
  );
});
