import test from 'node:test';
import assert from 'node:assert/strict';

import { filterInterviewQuestions, filterResources } from '../src/core/filters.js';
import { scoreQuiz } from '../src/core/quiz.js';
import {
  estimateContextBudget,
  normalizeAttention,
  sampleDistribution,
} from '../src/core/experiments.js';
import {
  buildKnowledgeNodes,
  getDueInterviewQuestions,
  getNextLesson,
  getRecentActivity,
} from '../src/core/view-models.js';

test('resource filters combine with AND and leave source data untouched', () => {
  const resources = [
    {
      id: 'github-zh',
      language: '中文',
      source: 'Datawhale',
      type: 'GitHub 课程',
      difficulty: '入门',
      stage: '基础',
    },
    {
      id: 'video-zh',
      language: '中文',
      platform: 'Bilibili',
      source: '讲师',
      type: '视频',
      difficulty: '入门',
      stage: '基础',
    },
    {
      id: 'github-en',
      language: '英文',
      source: 'Datawhale',
      type: 'GitHub 课程',
      difficulty: '进阶',
      stage: '实作',
    },
  ];
  const snapshot = structuredClone(resources);

  const result = filterResources(resources, {
    language: '中文',
    source: 'Datawhale',
    type: 'GitHub 课程',
    difficulty: '入门',
    stage: '基础',
  });

  assert.deepEqual(result.map(({ id }) => id), ['github-zh']);
  assert.notEqual(result, resources);
  assert.deepEqual(resources, snapshot);
});

test('resource platform filter matches platform and all defaults are inclusive', () => {
  const resources = [
    { id: 'youtube', platform: 'YouTube', source: 'Author' },
    { id: 'source-platform', source: 'YouTube' },
  ];

  assert.deepEqual(
    filterResources(resources, { platform: 'YouTube' }).map(({ id }) => id),
    ['youtube', 'source-platform'],
  );
  assert.deepEqual(filterResources(resources, { language: 'all' }), resources);
  assert.notEqual(filterResources(resources), resources);
});

test('interview filters combine role membership, frequency and mastery status', () => {
  const questions = [
    { id: 'q1', roles: ['Agent 开发', '后端工程'], frequency: '高', difficulty: '基础' },
    { id: 'q2', roles: ['Agent 开发'], frequency: '中', difficulty: '基础' },
    { id: 'q3', roles: ['AI 应用'], frequency: '高', difficulty: '进阶' },
  ];

  const result = filterInterviewQuestions(
    questions,
    { role: 'Agent 开发', frequency: '高', difficulty: '基础', status: 'reviewing' },
    { q1: 'reviewing', q2: 'mastered' },
  );

  assert.deepEqual(result.map(({ id }) => id), ['q1']);
  assert.notEqual(result, questions);
});

test('interview filters treat missing mastery state as unseen', () => {
  const questions = [{ id: 'q1', roles: [] }, { id: 'q2', roles: [] }];
  assert.deepEqual(
    filterInterviewQuestions(questions, { status: 'unseen' }, { q2: 'mastered' })
      .map(({ id }) => id),
    ['q1'],
  );
});

test('quiz scoring returns totals, rounded percent and source explanations', () => {
  const quiz = [{ id: 'one', answerIndex: 1, explanation: '第二项才满足条件。' }];
  const snapshot = structuredClone(quiz);

  assert.deepEqual(scoreQuiz(quiz, [1]), {
    correct: 1,
    total: 1,
    percent: 100,
    results: [{ correct: true, explanation: '第二项才满足条件。' }],
  });
  assert.deepEqual(quiz, snapshot);
  assert.deepEqual(scoreQuiz([], []), { correct: 0, total: 0, percent: 0, results: [] });
});

test('context budget reports transparent arithmetic and overflow', () => {
  assert.deepEqual(
    estimateContextBudget({ system: 100, history: 300, retrieval: 500, output: 200, limit: 1200 }),
    { used: 1100, remaining: 100, percent: 92, overflow: false },
  );
  assert.deepEqual(
    estimateContextBudget({ system: 1, history: 2, retrieval: 3, output: 4, limit: 0 }),
    { used: 10, remaining: -10, percent: 0, overflow: true },
  );
});

test('attention weights are clamped, normalized and copied', () => {
  const weights = [1, 1, 2];
  assert.deepEqual(normalizeAttention(weights), [0.25, 0.25, 0.5]);
  assert.deepEqual(normalizeAttention([-2, 0]), [0.5, 0.5]);
  assert.deepEqual(normalizeAttention([]), []);
  assert.deepEqual(weights, [1, 1, 2]);
});

test('temperature softmax is stable and top-p marks the smallest nucleus prefix', () => {
  const candidates = [
    { token: 'A', logit: 2 },
    { token: 'B', logit: 1 },
    { token: 'C', logit: 0 },
  ];
  const result = sampleDistribution(candidates, 1, 0.8);

  assert.deepEqual(result.map(({ token }) => token), ['A', 'B', 'C']);
  assert.ok(Math.abs(result.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-12);
  assert.ok(result.filter(({ inNucleus }) => inNucleus)
    .reduce((sum, item) => sum + item.probability, 0) >= 0.8);
  assert.equal(result.at(-1).inNucleus, false);
  assert.deepEqual(candidates, [
    { token: 'A', logit: 2 },
    { token: 'B', logit: 1 },
    { token: 'C', logit: 0 },
  ]);
});

test('sampling preserves original order for equal logits and handles invalid controls', () => {
  const result = sampleDistribution(
    [{ token: 'first', logit: 1 }, { token: 'second', logit: 1 }],
    Number.NaN,
    Number.POSITIVE_INFINITY,
  );
  assert.deepEqual(result.map(({ token }) => token), ['first', 'second']);
  assert.ok(result.every(({ inNucleus }) => inNucleus));
});

test('next lesson is first incomplete, final when complete, and null when empty', () => {
  const lessons = [{ id: 'l1', title: 'One' }, { id: 'l2', title: 'Two' }];
  const next = getNextLesson(lessons, { completedLessonIds: ['l1'] });

  assert.deepEqual(next, lessons[1]);
  assert.notEqual(next, lessons[1]);
  assert.deepEqual(getNextLesson(lessons, { completedLessonIds: ['l1', 'l2'] }), lessons[1]);
  assert.equal(getNextLesson([], { completedLessonIds: [] }), null);
});

test('knowledge nodes distinguish complete, current, available and locked lessons', () => {
  const lessons = [
    { id: 'l1', order: 1, title: 'One', prerequisites: [] },
    { id: 'l2', order: 2, title: 'Two', prerequisites: ['l1'] },
    { id: 'l3', order: 3, title: 'Three', prerequisites: ['l1'] },
    { id: 'l4', order: 4, title: 'Four', prerequisites: ['l2', 'l3'] },
  ];

  assert.deepEqual(buildKnowledgeNodes(lessons, { completedLessonIds: ['l1'] }), [
    { id: 'l1', order: 1, title: 'One', status: 'complete', prerequisiteIds: [] },
    { id: 'l2', order: 2, title: 'Two', status: 'current', prerequisiteIds: ['l1'] },
    { id: 'l3', order: 3, title: 'Three', status: 'available', prerequisiteIds: ['l1'] },
    { id: 'l4', order: 4, title: 'Four', status: 'locked', prerequisiteIds: ['l2', 'l3'] },
  ]);
});

test('knowledge nodes infer a sequential path when prerequisites are omitted', () => {
  const lessons = [{ id: 'l1', order: 1, title: 'One' }, { id: 'l2', order: 2, title: 'Two' }];
  assert.deepEqual(buildKnowledgeNodes(lessons, { completedLessonIds: [] }), [
    { id: 'l1', order: 1, title: 'One', status: 'current', prerequisiteIds: [] },
    { id: 'l2', order: 2, title: 'Two', status: 'locked', prerequisiteIds: ['l1'] },
  ]);
});

test('due interview questions prioritize queue order, append reviewing, and de-duplicate', () => {
  const questions = [{ id: 'q1', question: 'One' }, { id: 'q2', question: 'Two' }, { id: 'q3', question: 'Three' }];
  const result = getDueInterviewQuestions(questions, {
    reviewQueue: ['q2', 'missing', 'q2'],
    interviewStatusById: { q1: 'reviewing', q2: 'reviewing', q3: 'mastered' },
  });

  assert.deepEqual(result.map(({ id }) => id), ['q2', 'q1']);
  assert.notEqual(result[0], questions[1]);
});

test('recent activity has stable typed entries without invented timestamps', () => {
  const progress = {
    lastVisitedAt: '2026-07-19T10:00:00.000Z',
    completedLessonIds: ['l1'],
    quizResults: { qz1: { correct: 1, total: 2 } },
  };
  const snapshot = structuredClone(progress);
  const activity = getRecentActivity(progress);

  assert.deepEqual(activity, [
    { type: 'visit', timestamp: '2026-07-19T10:00:00.000Z' },
    { type: 'lesson-completed', lessonId: 'l1' },
    { type: 'quiz-completed', quizId: 'qz1', result: { correct: 1, total: 2 } },
  ]);
  activity[2].result.correct = 0;
  assert.deepEqual(progress, snapshot);
});
