import test from 'node:test';
import assert from 'node:assert/strict';

import { contextRagMemory } from '../src/data/context-rag-memory.js';

const lessonIds = Array.from({ length: 8 }, (_, index) =>
  `context-${String(index + 1).padStart(2, '0')}`,
);

const lessonTitles = [
  '信息层次与上下文生命周期',
  'Context Engineering 与预算分配',
  'Conversation State、Transcript 与摘要',
  'Retrieval Corpus、Chunk 与索引',
  'Sparse、Dense 与 Hybrid Retrieval',
  'Reranking、去重与证据打包',
  '长期记忆的写入、召回与遗忘',
  'RAG 与记忆综合设计及故障定位',
];

const resourceUrls = [
  'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
  'https://aclanthology.org/2024.tacl-1.9/',
  'https://developers.openai.com/api/docs/guides/compaction',
  'https://developers.openai.com/api/docs/guides/embeddings',
  'https://aclanthology.org/2020.emnlp-main.550/',
  'https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/',
  'https://www.anthropic.com/engineering/contextual-retrieval',
  'https://developers.openai.com/api/docs/guides/retrieval',
  'https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html',
  'https://developers.openai.com/api/docs/guides/citation-formatting',
  'https://aclanthology.org/2023.emnlp-main.398/',
  'https://openreview.net/forum?id=wCu6T5xFjeJ',
  'https://aclanthology.org/2024.eacl-demo.16/',
  'https://docs.langchain.com/oss/python/concepts/memory',
  'https://openreview.net/forum?id=1i6ZCvflQJ',
  'https://arxiv.org/abs/2310.08560',
  'https://ojs.aaai.org/index.php/AAAI/article/view/29946',
  'https://github.com/xiaowu0162/LongMemEval',
  'https://developers.openai.com/api/docs/guides/your-data',
  'https://github.com/langchain-ai/rag-from-scratch',
  'https://github.com/datawhalechina/llm-universe',
  'https://github.com/datawhalechina/all-in-rag',
  'https://github.com/datawhalechina/hello-agents',
  'https://wakeup-jin.github.io/Practical-Guide-to-Context-Engineering/',
  'https://huggingface.co/learn/agents-course/unit3/agentic-rag/agentic-rag',
  'https://ragflow.com.cn/docs',
  'https://www.bilibili.com/video/BV1Sb421E74u/',
  'https://www.youtube.com/watch?v=lVdajtNpaGI',
];

const interviewTitles = [
  'prompt context、conversation state、corpus、checkpoint、长期记忆有什么区别？',
  'Context engineering 与 prompt engineering 有何区别？',
  '一条知识如何从源文档进入模型上下文？',
  '如何管理有限 context window？',
  '滑窗、摘要和 retrieval 应怎么选？',
  'Context 越长效果一定越好吗？',
  'Transcript、conversation state、summary 的区别？',
  '如何安全压缩长会话？',
  '用户修改了先前事实，状态如何更新？',
  '如何设计 chunking？',
  'Corpus 如何处理版本和失效？',
  'source document、retrieval unit、citation unit 有何不同？',
  'Sparse、dense、hybrid retrieval 怎么选？',
  'top-k、threshold 和 metadata filter 如何配合？',
  'Query rewrite 有什么价值和风险？',
  '为什么需要 reranker？',
  '为什么需要去重和多样性？',
  'RAG 中有引用为什么仍会答错？',
  '什么是长期记忆，什么时候写？',
  'Semantic、episodic、procedural memory 怎么理解？',
  '如何处理冲突、过期和删除？',
  'RAG 答错时如何诊断？',
  'RAG、fine-tuning 和长期记忆如何选？',
  '请设计上下文、RAG 与记忆架构。',
];

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

test('context RAG and memory exposes eight ordered substantive lessons and sixteen quizzes', () => {
  assert.equal(contextRagMemory.id, 'context-rag-memory');
  assert.equal(contextRagMemory.title, '上下文、RAG 与记忆');
  assert.equal(
    contextRagMemory.summary,
    '把会话状态、检索语料与长期记忆投影成来源清楚、预算有界的模型上下文。',
  );
  assert.equal(contextRagMemory.lessons.length, 8);
  assert.deepEqual(contextRagMemory.lessons.map(({ id }) => id), lessonIds);
  assert.deepEqual(contextRagMemory.lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(contextRagMemory.lessons.map(({ title }) => title), lessonTitles);
  assert.equal(contextRagMemory.lessons.flatMap(({ quiz }) => quiz).length, 16);

  for (const lesson of contextRagMemory.lessons) {
    assert.equal(lesson.moduleId, contextRagMemory.id, lesson.id);
    assert.ok(lesson.summary.length >= 20, lesson.id);
    assert.ok(lesson.durationMinutes >= 20, lesson.id);
    assert.ok(lesson.objectives.length >= 2, lesson.id);
    assert.ok(lesson.concepts.length >= 3, lesson.id);
    assert.ok(lesson.objectives.every((item) => item.length >= 8), `${lesson.id}: objectives`);
    assert.ok(lesson.concepts.every((item) => item.length >= 2), `${lesson.id}: concepts`);
    assert.ok(lesson.explanations.length >= 2, lesson.id);
    for (const section of lesson.explanations) {
      assert.ok(section.heading.length >= 2, `${lesson.id}: heading`);
      assert.ok(section.body.length >= 60, `${lesson.id}: body`);
      assert.ok(section.keyPoints.length >= 2, `${lesson.id}: keyPoints`);
      assert.ok(section.keyPoints.every((point) => point.length >= 8), `${lesson.id}: key point`);
    }
    assert.ok(lesson.resourceIds.length >= 2, lesson.id);
    assert.ok(lesson.exercise.title.length >= 2, lesson.id);
    assert.ok(lesson.exercise.brief.length >= 15, lesson.id);
    assert.equal(lesson.exercise.steps.length, 2, lesson.id);
    assert.ok(lesson.exercise.steps.every((step) => step.length >= 10), `${lesson.id}: steps`);
    assert.ok(lesson.exercise.deliverable.length >= 10, lesson.id);
    assert.equal(lesson.quiz.length, 2, lesson.id);
    assert.equal(lesson.interviewQuestionIds.length, 3, lesson.id);
    assert.equal(lesson.completionCriteria.length, 2, lesson.id);
    assert.ok(
      lesson.completionCriteria.every((criterion) => criterion.length >= 10),
      `${lesson.id}: completion criteria`,
    );
    for (const item of lesson.quiz) {
      assert.ok(item.id, lesson.id);
      assert.ok(item.prompt.length >= 8, item.id);
      assert.ok(item.choices.length >= 2, item.id);
      assert.ok(Number.isInteger(item.answerIndex), item.id);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < item.choices.length, item.id);
      assert.ok(item.explanation.length >= 15, item.id);
    }
  }
});

test('only lessons two, five and seven map the specified experiments', () => {
  assert.deepEqual(
    contextRagMemory.lessons
      .filter(({ exercise }) => exercise.experiment)
      .map(({ id, exercise }) => [id, exercise.experiment]),
    [
      ['context-02', 'context-router'],
      ['context-05', 'hybrid-retrieval'],
      ['context-07', 'memory-lifecycle'],
    ],
  );
});

test('resources are the exact 28 verified HTTPS entries with complete metadata', () => {
  assert.equal(contextRagMemory.resources.length, 28);
  assert.deepEqual(contextRagMemory.resources.map(({ url }) => url), resourceUrls);
  for (const resource of contextRagMemory.resources) {
    assert.match(resource.id, /^res-context-/);
    assert.equal(new URL(resource.url).protocol, 'https:', resource.id);
    assert.equal(resource.verifiedAt, '2026-07-21', resource.id);
    for (const field of ['id', 'title', 'url', 'source', 'language', 'type', 'difficulty', 'stage', 'value']) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
    assert.match(resource.value, /学习用途[：:]/, `${resource.id}: learning use`);
    assert.match(resource.value, /证据边界[：:]/, `${resource.id}: evidence boundary`);
    if (resource.type.includes('视频')) assert.ok(resource.platform, `${resource.id}: platform`);
  }
});

test('each source class states its matching evidence boundary', () => {
  const boundaryByType = new Map([
    ['官方文档', /当前产品或框架实现.*接口和版本会变化.*不代表跨产品或框架标准/],
    ['研究论文', /研究结论绑定论文的实验或评测设定.*不可外推为所有语料、模型或业务的结论/],
    ['工程文章', /厂商工程经验.*不代表可普适复现的收益或系统保证/],
    ['评测仓库', /评测任务与数据集.*不代表生产环境中的记忆质量/],
    ['代码课程', /依赖与接口版本会更新.*不承担生产质量或安全保证/],
    ['开源课程', /依赖与接口版本会更新.*不承担生产质量或安全保证/],
    ['公开课程', /依赖与接口版本会更新.*不承担生产质量或安全保证/],
    ['公开指南', /依赖与接口版本会更新.*不承担生产质量或安全保证/],
    ['公开视频', /用于建立直觉与学习导航.*不作为.*权威证据/],
  ]);

  for (const resource of contextRagMemory.resources) {
    const matcher = boundaryByType.get(resource.type);
    assert.ok(matcher, `${resource.id}: unexpected type ${resource.type}`);
    assert.match(resource.value, matcher, `${resource.id}: ${resource.type}`);
  }
});

test('lesson references resolve resources and interviews in both directions', () => {
  const resources = new Set(contextRagMemory.resources.map(({ id }) => id));
  const referencedResources = new Set(contextRagMemory.lessons.flatMap(({ resourceIds }) => resourceIds));
  const interviews = new Map(contextRagMemory.interviewQuestions.map((item) => [item.id, item]));
  const referencedInterviews = new Set(
    contextRagMemory.lessons.flatMap(({ interviewQuestionIds }) => interviewQuestionIds),
  );

  for (const lesson of contextRagMemory.lessons) {
    assert.ok(lesson.resourceIds.every((id) => resources.has(id)), lesson.id);
    assert.ok(lesson.interviewQuestionIds.every((id) => interviews.has(id)), lesson.id);
    assert.ok(
      lesson.interviewQuestionIds.every((id) => interviews.get(id).lessonId === lesson.id),
      `${lesson.id}: interview ownership`,
    );
  }
  assert.ok(contextRagMemory.resources.every(({ id }) => referencedResources.has(id)));
  assert.ok(contextRagMemory.interviewQuestions.every(({ id }) => referencedInterviews.has(id)));
});

test('interview bank contains exactly three complete qualitative questions for every lesson', () => {
  const validRoles = new Set(['Agent 开发', 'AI 应用', '后端工程']);
  const validFrequencies = new Set(['高', '中', '补充']);
  const validDifficulties = new Set(['基础', '进阶', '深挖']);
  const expectedIds = lessonIds.flatMap((lessonId) =>
    [1, 2, 3].map((number) => `iq-${lessonId}-${number}`),
  );
  assert.equal(contextRagMemory.interviewQuestions.length, 24);
  assert.deepEqual(contextRagMemory.interviewQuestions.map(({ id }) => id), expectedIds);
  assert.deepEqual(contextRagMemory.interviewQuestions.map(({ question }) => question), interviewTitles);

  for (const lessonId of lessonIds) {
    const expectedLessonQuestionIds = [1, 2, 3].map((number) => `iq-${lessonId}-${number}`);
    assert.deepEqual(
      contextRagMemory.interviewQuestions
        .filter(({ lessonId: id }) => id === lessonId)
        .map(({ id }) => id),
      expectedLessonQuestionIds,
      `${lessonId}: stable interview IDs`,
    );
  }
  for (const item of contextRagMemory.interviewQuestions) {
    assert.ok(item.shortAnswer.length >= 20, item.id);
    assert.ok(item.deepDive.length >= 2, item.id);
    assert.ok(item.misconceptions.length >= 1, item.id);
    assert.ok(item.followUps.length >= 1, item.id);
    assert.ok(item.deepDive.every((point) => point.length >= 15), `${item.id}: deepDive`);
    assert.ok(item.misconceptions.every((point) => point.length >= 10), `${item.id}: misconceptions`);
    assert.ok(item.followUps.every((point) => point.length >= 8), `${item.id}: followUps`);
    assert.ok(validFrequencies.has(item.frequency), `${item.id}: frequency`);
    assert.doesNotMatch(item.frequency, /\d|%/, `${item.id}: qualitative frequency`);
    assert.ok(validDifficulties.has(item.difficulty), `${item.id}: difficulty`);
    assert.ok(item.roles.length >= 1, item.id);
    assert.ok(item.roles.every((role) => validRoles.has(role)), `${item.id}: roles`);
  }
});

test('quiz identifiers are stable within and owned by their lessons', () => {
  for (const lesson of contextRagMemory.lessons) {
    assert.deepEqual(
      lesson.quiz.map(({ id }) => id),
      [1, 2].map((number) => `quiz-${lesson.id}-${number}`),
      `${lesson.id}: stable quiz IDs`,
    );
  }
});

test('the curriculum states all required context, retrieval, citation and memory boundaries', () => {
  const copy = JSON.stringify(contextRagMemory);
  assert.match(copy, /checkpoint.*不(?:等于|是).*长期记忆/i);
  assert.match(copy, /summary.*有损/i);
  assert.match(copy, /index.*不(?:等于|是).*corpus/i);
  assert.match(copy, /dense.*不(?:总是|一定).*sparse/i);
  assert.match(copy, /检索.*不(?:等于|保证).*生成.*忠实/);
  assert.match(copy, /引用.*不(?:等于|自动证明|保证).*claim|引用.*不(?:等于|自动证明|保证).*主张/i);
  assert.match(copy, /长期记忆.*(?:更新|纠正).*(?:过期|失效).*删除/);
});

test('all lesson, resource, quiz, interview and experiment identifiers are globally unique', () => {
  const lessons = contextRagMemory.lessons.map(({ id }) => id);
  const resources = contextRagMemory.resources.map(({ id }) => id);
  const quizzes = contextRagMemory.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id));
  const interviews = contextRagMemory.interviewQuestions.map(({ id }) => id);
  const experiments = contextRagMemory.lessons
    .map(({ exercise }) => exercise.experiment)
    .filter(Boolean);
  assertUnique(lessons, 'lesson ids');
  assertUnique(resources, 'resource ids');
  assertUnique(quizzes, 'quiz ids');
  assertUnique(interviews, 'interview ids');
  assertUnique(experiments, 'experiment ids');
  assertUnique([...lessons, ...resources, ...quizzes, ...interviews, ...experiments], 'global ids');
});

test('context RAG and memory recursively freezes every nested value', () => {
  const snapshot = structuredClone(contextRagMemory);
  const visited = new Set();
  const assertDeepFrozen = (value, path) => {
    if (value === null || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    assert.equal(Object.isFrozen(value), true, path);
    for (const [key, nested] of Object.entries(value)) assertDeepFrozen(nested, `${path}.${key}`);
  };

  assertDeepFrozen(contextRagMemory, 'contextRagMemory');
  assert.throws(() => { contextRagMemory.title = 'changed'; }, TypeError);
  assert.throws(() => { contextRagMemory.lessons.push({}); }, TypeError);
  assert.throws(() => { contextRagMemory.resources.push({}); }, TypeError);
  assert.throws(() => { contextRagMemory.interviewQuestions.push({}); }, TypeError);

  for (const lesson of contextRagMemory.lessons) {
    assert.throws(() => { lesson.title = 'changed'; }, TypeError, lesson.id);
    for (const field of ['objectives', 'concepts', 'explanations', 'resourceIds', 'quiz', 'interviewQuestionIds', 'completionCriteria']) {
      assert.throws(() => { lesson[field].push('changed'); }, TypeError, `${lesson.id}.${field}`);
    }
    assert.throws(() => { lesson.exercise.title = 'changed'; }, TypeError, `${lesson.id}.exercise`);
    assert.throws(() => { lesson.exercise.steps.push('changed'); }, TypeError, `${lesson.id}.exercise.steps`);
    for (const explanation of lesson.explanations) {
      assert.throws(() => { explanation.body = 'changed'; }, TypeError, `${lesson.id}.explanation`);
      assert.throws(() => { explanation.keyPoints.push('changed'); }, TypeError, `${lesson.id}.keyPoints`);
    }
    for (const item of lesson.quiz) {
      assert.throws(() => { item.prompt = 'changed'; }, TypeError, item.id);
      assert.throws(() => { item.choices.push('changed'); }, TypeError, `${item.id}.choices`);
    }
  }
  for (const resource of contextRagMemory.resources) {
    assert.throws(() => { resource.value = 'changed'; }, TypeError, resource.id);
  }
  for (const item of contextRagMemory.interviewQuestions) {
    assert.throws(() => { item.shortAnswer = 'changed'; }, TypeError, item.id);
    for (const field of ['deepDive', 'misconceptions', 'followUps', 'roles']) {
      assert.throws(() => { item[field].push('changed'); }, TypeError, `${item.id}.${field}`);
    }
  }
  assert.deepEqual(contextRagMemory, snapshot);
});
