import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultProgress,
  markLessonComplete,
  setInterviewStatus,
  summarizeProgress,
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
