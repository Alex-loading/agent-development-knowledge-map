import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FILTER_ALL,
  filterInterviewQuestions,
  filterResources,
} from '../src/core/filters.js';
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
import { llmFoundation } from '../src/data/llm-foundation.js';

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

test('resource platform filter prefers platform metadata and never treats creator source as platform', () => {
  const resources = [
    { id: 'youtube', platform: 'YouTube', source: 'Author' },
    { id: 'source-platform', source: 'YouTube' },
  ];

  assert.deepEqual(
    filterResources(resources, { platform: 'YouTube' }).map(({ id }) => id),
    ['youtube'],
  );
  assert.deepEqual(filterResources(resources, { language: 'all' }), resources);
  assert.deepEqual(filterResources(resources, { language: FILTER_ALL }), resources);
  assert.notEqual(filterResources(resources), resources);
});

test('resource platform filter recognizes GitHub, Bilibili and YouTube in real content', () => {
  for (const platform of ['GitHub', 'Bilibili', 'YouTube']) {
    const results = filterResources(llmFoundation.resources, { platform });
    assert.ok(results.length > 0, `${platform} 应命中真实资源`);
    assert.ok(
      results.every((resource) =>
        resource.platform === platform
        || resource.type?.includes(platform)
        || new URL(resource.url).hostname.toLowerCase().includes(platform.toLowerCase())),
      `${platform} 不能混入不相关来源`,
    );
  }
});

test('every derived resource platform option can filter the same real data', () => {
  for (const platform of ['Hugging Face', '3Blue1Brown', 'arXiv']) {
    const results = filterResources(llmFoundation.resources, { platform });
    assert.ok(results.length > 0, `${platform} 派生平台选项不应产生空筛选`);
  }
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

test('context budget rejects negative, non-finite and overflowing numeric budgets', () => {
  const valid = { system: 1, history: 2, retrieval: 3, output: 4, limit: 20 };
  for (const [field, value] of [
    ['system', -1],
    ['history', Number.NaN],
    ['retrieval', Number.POSITIVE_INFINITY],
    ['limit', -1],
  ]) {
    assert.throws(() => estimateContextBudget({ ...valid, [field]: value }), RangeError);
  }
  assert.throws(
    () => estimateContextBudget({
      system: Number.MAX_VALUE,
      history: Number.MAX_VALUE,
      retrieval: 0,
      output: 0,
      limit: Number.MAX_VALUE,
    }),
    RangeError,
  );
});

test('attention weights are clamped, normalized and copied', () => {
  const weights = [1, 1, 2];
  assert.deepEqual(normalizeAttention(weights), [0.25, 0.25, 0.5]);
  assert.deepEqual(normalizeAttention([-2, 0]), [0.5, 0.5]);
  assert.deepEqual(normalizeAttention([]), []);
  assert.deepEqual(weights, [1, 1, 2]);
});

test('attention normalization stays finite for very large weights', () => {
  const result = normalizeAttention([Number.MAX_VALUE, Number.MAX_VALUE]);
  assert.ok(result.every(Number.isFinite));
  assert.ok(Math.abs(result[0] - 0.5) < 1e-12);
  assert.ok(Math.abs(result[1] - 0.5) < 1e-12);
  assert.ok(Math.abs(result.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
});

test('attention clamps negative scores and gives an equal distribution to every-zero input', () => {
  const clamped = normalizeAttention([-4, 2, -1, 6]);
  const allZero = normalizeAttention([0, -3, 0, Number.NaN]);

  assert.deepEqual(clamped, [0, 0.25, 0, 0.75]);
  assert.deepEqual(allZero, [0.25, 0.25, 0.25, 0.25]);
  assert.ok(Math.abs(clamped.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
  assert.ok(Math.abs(allZero.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
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

test('sampling remains finite for extreme logits and tiny positive temperature', () => {
  const result = sampleDistribution([
    { token: 'max', logit: Number.MAX_VALUE },
    { token: 'zero', logit: 0 },
    { token: 'min', logit: -Number.MAX_VALUE },
  ], Number.MIN_VALUE, 0.9);

  assert.ok(result.every(({ probability }) => Number.isFinite(probability)));
  assert.ok(Math.abs(result.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-12);
  assert.equal(result[0].token, 'max');
  assert.equal(result[0].probability, 1);
});

test('sampling clamps temperature to the inclusive teaching range', () => {
  const candidates = [
    { token: 'A', logit: 2 },
    { token: 'B', logit: 1 },
    { token: 'C', logit: 0 },
  ];

  assert.deepEqual(
    sampleDistribution(candidates, -100, 1),
    sampleDistribution(candidates, 0.05, 1),
  );
  assert.deepEqual(
    sampleDistribution(candidates, 100, 1),
    sampleDistribution(candidates, 2, 1),
  );
});

test('sampling clamps top-p to the inclusive teaching range', () => {
  const candidates = Array.from({ length: 40 }, (_, index) => ({
    token: `T${index}`,
    logit: 1,
  }));
  const nucleusSize = (items) => items.filter(({ inNucleus }) => inNucleus).length;

  assert.equal(
    nucleusSize(sampleDistribution(candidates, 1, -3)),
    nucleusSize(sampleDistribution(candidates, 1, 0.05)),
  );
  assert.equal(nucleusSize(sampleDistribution(candidates, 1, 0.05)), 2);
  assert.equal(
    nucleusSize(sampleDistribution(candidates, 1, 3)),
    nucleusSize(sampleDistribution(candidates, 1, 1)),
  );
  assert.equal(nucleusSize(sampleDistribution(candidates, 1, 1)), 40);
});

test('sampling keeps equal-logit input order and normalized finite probabilities at finite extremes', () => {
  const candidates = [
    { token: 'first', logit: Number.MAX_VALUE },
    { token: 'second', logit: Number.MAX_VALUE },
    { token: 'third', logit: -Number.MAX_VALUE },
  ];
  const result = sampleDistribution(candidates, 0.05, 1);

  assert.deepEqual(result.map(({ token }) => token), ['first', 'second', 'third']);
  assert.ok(result.every(({ probability }) => Number.isFinite(probability)));
  assert.ok(Math.abs(result.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-12);
});

test('top-p stops at a cumulative boundary without admitting the next tied candidate', () => {
  const result = sampleDistribution([
    { token: 'first', logit: Math.log(0.6) },
    { token: 'second', logit: Math.log(0.2) },
    { token: 'third', logit: Math.log(0.2) },
  ], 1, 0.8);

  assert.deepEqual(result.map(({ token }) => token), ['first', 'second', 'third']);
  assert.deepEqual(result.map(({ inNucleus }) => inNucleus), [true, true, false]);
});

test('top-p one includes zero-probability candidates produced by finite-logit underflow', () => {
  const result = sampleDistribution([
    { token: 'dominant', logit: Number.MAX_VALUE },
    { token: 'underflow-one', logit: 0 },
    { token: 'underflow-two', logit: -Number.MAX_VALUE },
  ], 0.05, 1);

  assert.ok(result.every(({ probability }) => Number.isFinite(probability)));
  assert.ok(result.slice(1).every(({ probability }) => probability === 0));
  assert.deepEqual(result.map(({ inNucleus }) => inNucleus), [true, true, true]);
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

test('guided navigation skips locked lessons and selects the first eligible branch', () => {
  const lessons = [
    { id: 'a', order: 1, title: 'A', prerequisites: [] },
    { id: 'b', order: 2, title: 'B', prerequisites: ['c'] },
    { id: 'c', order: 3, title: 'C', prerequisites: ['a'] },
  ];
  const progress = { completedLessonIds: ['a'] };

  assert.deepEqual(getNextLesson(lessons, progress), lessons[2]);
  assert.deepEqual(buildKnowledgeNodes(lessons, progress), [
    { id: 'a', order: 1, title: 'A', status: 'complete', prerequisiteIds: [] },
    { id: 'b', order: 2, title: 'B', status: 'locked', prerequisiteIds: ['c'] },
    { id: 'c', order: 3, title: 'C', status: 'current', prerequisiteIds: ['a'] },
  ]);
});

test('next lesson chooses the first eligible incomplete lesson and returns final lesson after completion', () => {
  const lessons = [
    { id: 'a', order: 1, title: 'A', prerequisites: [] },
    { id: 'b', order: 2, title: 'B', prerequisites: ['missing'] },
    { id: 'c', order: 3, title: 'C', prerequisites: ['a'] },
    { id: 'd', order: 4, title: 'D', prerequisites: ['a'] },
  ];

  assert.deepEqual(getNextLesson(lessons, { completedLessonIds: ['a'] }), lessons[2]);
  assert.deepEqual(
    getNextLesson(lessons, { completedLessonIds: lessons.map(({ id }) => id) }),
    lessons[3],
  );
});

test('knowledge nodes return fresh records and fresh prerequisite arrays on every build', () => {
  const lessons = [
    { id: 'a', order: 1, title: 'A', prerequisites: [] },
    { id: 'b', order: 2, title: 'B', prerequisites: ['a'] },
  ];
  const first = buildKnowledgeNodes(lessons, { completedLessonIds: [] });
  const second = buildKnowledgeNodes(lessons, { completedLessonIds: [] });

  first.forEach((node, index) => {
    assert.notEqual(node, second[index]);
    assert.notEqual(node.prerequisiteIds, second[index].prerequisiteIds);
    assert.notEqual(node.prerequisiteIds, lessons[index].prerequisites);
  });
});

test('next lesson is null when every incomplete lesson is locked', () => {
  const lessons = [{ id: 'blocked', title: 'Blocked', prerequisites: ['missing'] }];
  assert.equal(getNextLesson(lessons, { completedLessonIds: [] }), null);
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
