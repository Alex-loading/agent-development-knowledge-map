import test from 'node:test';
import assert from 'node:assert/strict';

import {
  contextRagMemory,
  createContextInterviewQuestion,
} from '../src/data/context-rag-memory.js';

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

const noteExpectations = new Map([
  ['context-01', { exportName: 'context01Note', minMinutes: 30, maxMinutes: 38, minLength: 4200 }],
  ['context-02', { exportName: 'context02Note', minMinutes: 32, maxMinutes: 40, minLength: 4400 }],
  ['context-03', { exportName: 'context03Note', minMinutes: 34, maxMinutes: 42, minLength: 4600 }],
  ['context-04', { exportName: 'context04Note', minMinutes: 35, maxMinutes: 45, minLength: 4800 }],
  ['context-05', { exportName: 'context05Note', minMinutes: 36, maxMinutes: 45, minLength: 5000 }],
  ['context-06', { exportName: 'context06Note', minMinutes: 38, maxMinutes: 45, minLength: 5200 }],
  ['context-07', { exportName: 'context07Note', minMinutes: 38, maxMinutes: 45, minLength: 5200 }],
  ['context-08', { exportName: 'context08Note', minMinutes: 40, maxMinutes: 45, minLength: 5400 }],
]);

const resourceUrls = [
  'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
  'https://aclanthology.org/2024.tacl-1.9/',
  'https://developers.openai.com/api/docs/guides/compaction',
  'https://developers.openai.com/api/docs/guides/embeddings',
  'https://aclanthology.org/2020.emnlp-main.550/',
  'https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/',
  'https://www.anthropic.com/engineering/contextual-retrieval',
  'https://arxiv.org/abs/1901.04085',
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
  'https://ragflow.io/docs/v0.26.4/',
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
  '源文档怎样经过摄取管线成为可搜索且可引用的索引？',
  'Sparse、dense、hybrid retrieval 怎么选，RRF 怎样避免混加分数尺度？',
  'top-k、threshold 和 metadata filter 如何配合？',
  '怎样选择 ANN 配置而不只追求更高 recall？',
  '为什么需要 reranker？',
  '为什么需要去重和多样性？',
  '怎样证明 evidence packet 中的工具结果真实可回源，且引用支持答案主张？',
  '什么是长期记忆，什么时候写？',
  'Semantic、episodic、procedural memory 怎么理解？',
  '如何区分 relevance decay、TTL expiry、supersession 和 deletion？',
  'RAG 答错时如何诊断？',
  'GraphRAG 何时作为检索分支，知识更新何时增量处理或全量重建？',
  '请设计上下文、RAG 与记忆架构，并说明 RAG、fine-tuning、长期记忆的职责。',
];

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

function assertDeepFrozenValue(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: 公开数据及其嵌套结构必须被冻结`);
  for (const [key, nestedValue] of Object.entries(value)) {
    assertDeepFrozenValue(nestedValue, `${label}.${key}`, seen);
  }
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

for (const lessonId of lessonIds) {
  test(`${lessonId} publishes a complete source-grounded knowledge note file`, async () => {
    const lesson = contextRagMemory.lessons.find(({ id }) => id === lessonId);
    const expectation = noteExpectations.get(lessonId);
    const noteModule = await import(`../src/data/context-rag-memory-notes/${lessonId}.js`);
    const note = noteModule[expectation.exportName];
    const resourcesById = new Map(
      contextRagMemory.resources.map((resource) => [resource.id, resource]),
    );
    const lessonResourceIds = new Set(lesson.resourceIds);

    assert.ok(note, `${lessonId}: 必须导出 ${expectation.exportName}`);
    assertDeepFrozenValue(note, `${lessonId}.knowledgeNote`);
    assert.ok(Number.isInteger(note.readingMinutes)
      && note.readingMinutes >= expectation.minMinutes
      && note.readingMinutes <= expectation.maxMinutes,
    `${lessonId}: 阅读时长应为 ${expectation.minMinutes}–${expectation.maxMinutes} 分钟`);
    assert.ok(typeof note.introduction === 'string' && note.introduction.trim().length >= 80,
      `${lessonId}: introduction 至少需要 80 个字符`);
    assert.ok(Array.isArray(note.sections)
      && note.sections.length >= 5 && note.sections.length <= 7,
    `${lessonId}: 应包含 5–7 个递进章节`);
    assertUnique(note.sections.map(({ id }) => id), `${lessonId}: section ids`);

    const bodyLength = [
      note.introduction,
      ...note.sections.flatMap(({ paragraphs }) => paragraphs),
      note.nextStep,
    ].reduce((total, value) => total + value.trim().length, 0);
    assert.ok(bodyLength >= expectation.minLength && bodyLength <= 9000,
      `${lessonId}: 正文长度应为 ${expectation.minLength}–9000 字符，当前为 ${bodyLength}`);

    for (const section of note.sections) {
      assert.match(section.id ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        `${lessonId}: section id 必须为 kebab-case`);
      assert.ok(typeof section.title === 'string' && section.title.trim().length >= 4,
        `${lessonId}:${section.id}: title 至少需要 4 个字符`);
      assert.ok(Array.isArray(section.paragraphs)
        && section.paragraphs.length >= 2 && section.paragraphs.length <= 4,
      `${lessonId}:${section.id}: 需要 2–4 个正文段落`);
      assert.ok(section.paragraphs.every((paragraph) => (
        typeof paragraph === 'string' && paragraph.trim().length >= 60
      )), `${lessonId}:${section.id}: 每个正文段落至少需要 60 个字符`);
      assert.ok(Array.isArray(section.keyPoints) && section.keyPoints.length >= 2,
        `${lessonId}:${section.id}: 至少需要两个要点`);
      assert.ok(section.keyPoints.every((point) => (
        typeof point === 'string' && point.trim().length >= 8
      )), `${lessonId}:${section.id}: keyPoints 必须是实质性文本`);
      assert.ok(Array.isArray(section.sourceIds) && section.sourceIds.length >= 1,
        `${lessonId}:${section.id}: 至少需要一个来源`);
      assert.ok(section.sourceIds.every((id) => lessonResourceIds.has(id)),
        `${lessonId}:${section.id}: sourceIds 必须属于当前课资源`);
      assert.ok(section.sourceIds.every((id) => resourcesById.get(id)?.evidence),
        `${lessonId}:${section.id}: sourceIds 必须具有 evidence`);
      assert.ok(section.sourceIds.some((id) => resourcesById.get(id).evidence.role !== 'extension'),
        `${lessonId}:${section.id}: 章节不能只由 extension 来源承担`);
    }

    assert.ok(Array.isArray(note.misconceptions)
      && note.misconceptions.length >= 4 && note.misconceptions.length <= 6,
    `${lessonId}: 需要 4–6 个常见误区`);
    assert.ok(note.misconceptions.every(({ claim, correction }) => (
      typeof claim === 'string' && claim.trim().length >= 10
      && typeof correction === 'string' && correction.trim().length >= 20
    )), `${lessonId}: misconception 必须包含实质 claim/correction`);
    assert.ok(Array.isArray(note.recap) && note.recap.length >= 5,
      `${lessonId}: recap 至少需要 5 项`);
    assert.ok(note.recap.every((item) => typeof item === 'string' && item.trim().length >= 8),
      `${lessonId}: recap 必须是实质性文本`);
    assert.ok(typeof note.nextStep === 'string' && note.nextStep.trim().length >= 60,
      `${lessonId}: nextStep 至少需要 60 个字符`);
  });
}

test('Context RAG and Memory note registry exactly matches all eight lesson files', async () => {
  const { contextRagMemoryNotes } = await import('../src/data/context-rag-memory-notes.js');

  assert.deepEqual(Object.keys(contextRagMemoryNotes), lessonIds);
  assert.equal(new Set(Object.values(contextRagMemoryNotes)).size, lessonIds.length,
    '每课必须使用不同的 knowledgeNote 对象');
  assertDeepFrozenValue(contextRagMemoryNotes, 'contextRagMemoryNotes');
});

test('context-07 lifecycle walkthrough explicitly executes reject and no-op events', async () => {
  const { context07Note } = await import(
    '../src/data/context-rag-memory-notes/context-07.js'
  );
  const copy = JSON.stringify(context07Note);

  assert.match(copy, /action=reject/,
    'context-07 必须用实验事件实际产生 reject，而不只在概念列表中提及');
  assert.match(copy, /action=no-op/,
    'context-07 必须用实验事件实际产生 no-op，而不只在概念列表中提及');
});

test('context-08 assigns an explicit owner to every source-to-citation layer', async () => {
  const { context08Note } = await import(
    '../src/data/context-rag-memory-notes/context-08.js'
  );
  const copy = JSON.stringify(context08Note);

  for (const ownerField of [
    'sourceOwner',
    'ingestOwner',
    'chunkOwner',
    'indexOwner',
    'retrieveOwner',
    'filterOwner',
    'rerankOwner',
    'packOwner',
    'stateProjectionOwner',
    'memoryProjectionOwner',
    'generateOwner',
    'citationOwner',
  ]) {
    assert.match(copy, new RegExp(ownerField),
      `context-08 必须逐层给出 ${ownerField}`);
  }
});

test('resources preserve the exact 29 verified entries and append 15 primary narratives', () => {
  const legacyResources = contextRagMemory.resources.filter(
    ({ sourceTier }) => sourceTier !== 'primary-narrative',
  );
  const primaryResources = contextRagMemory.resources.filter(
    ({ sourceTier }) => sourceTier === 'primary-narrative',
  );
  assert.equal(contextRagMemory.resources.length, 44);
  assert.equal(legacyResources.length, 29);
  assert.equal(primaryResources.length, 15);
  assert.deepEqual(legacyResources.map(({ url }) => url), resourceUrls);
  for (const resource of contextRagMemory.resources) {
    assert.match(resource.id, /^res-context-/);
    assert.equal(new URL(resource.url).protocol, 'https:', resource.id);
    assert.equal(
      resource.verifiedAt,
      resource.sourceTier === 'primary-narrative' ? '2026-07-30' : '2026-07-23',
      resource.id,
    );
    for (const field of ['id', 'title', 'url', 'source', 'language', 'type', 'difficulty', 'stage', 'value']) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
    assert.match(resource.value, /学习用途[：:]/, `${resource.id}: learning use`);
    assert.match(resource.value, /证据边界[：:]/, `${resource.id}: evidence boundary`);
    if (resource.type.includes('视频')) assert.ok(resource.platform, `${resource.id}: platform`);
  }
});

test('all 44 Context RAG and Memory resources provide complete evidence cards', () => {
  const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
  const validRoles = new Set(['core', 'cross-check', 'extension']);
  const byId = new Map(contextRagMemory.resources.map((resource) => [resource.id, resource]));

  for (const resource of contextRagMemory.resources) {
    const { evidence } = resource;
    assert.ok(evidence, `${resource.id}: 必须提供 evidence 来源卡`);
    assert.ok(validAuthorities.has(evidence.authority),
      `${resource.id}: evidence.authority 值无效`);
    assert.ok(validRoles.has(evidence.role), `${resource.id}: evidence.role 值无效`);
    assert.ok(Array.isArray(evidence.coverage) && evidence.coverage.length >= 1,
      `${resource.id}: evidence.coverage 不能为空`);
    assert.ok(evidence.coverage.every((item) => (
      typeof item === 'string' && item.trim().length > 0
    )), `${resource.id}: evidence.coverage 必须只包含非空字符串`);
    assert.ok(typeof evidence.limitations === 'string'
      && evidence.limitations.trim().length >= 15,
    `${resource.id}: evidence.limitations 至少需要 15 个字符`);
    if (evidence.verifiedAt !== undefined) {
      assert.equal(
        evidence.verifiedAt,
        resource.sourceTier === 'primary-narrative' ? '2026-07-30' : '2026-07-23',
        `${resource.id}: evidence.verifiedAt 必须记录本轮正文核验日期`);
    }
  }

  const rrf = byId.get('res-context-rrf');
  assert.equal(rrf.evidence.authority, 'academic');
  assert.equal(rrf.evidence.role, 'core');
  assert.match(rrf.evidence.limitations, /rank fusion.*不是.*rerank/i);

  const reranker = byId.get('res-context-bert-reranker');
  assert.equal(reranker.evidence.authority, 'academic');
  assert.equal(reranker.evidence.role, 'core');
  assert.match(reranker.evidence.coverage.join(' '), /passage re-?ranking|query.*passage/i);

  const ragflow = byId.get('res-context-ragflow');
  assert.equal(ragflow.url, 'https://ragflow.io/docs/v0.26.4/');
  assert.equal(ragflow.evidence.authority, 'official');
  assert.equal(ragflow.evidence.role, 'cross-check');
  assert.match(ragflow.evidence.limitations, /产品实现.*不(?:等于|代表).*通用/i);

  const bilibili = byId.get('res-context-bilibili');
  assert.equal(
    bilibili.title,
    '【精剪版】Datawhale开源大模型入门课-第四节-大模型应用开发实践-RAG与Agent-02-检索增强生成：原理、实践和应用场景',
  );
  assert.equal(bilibili.source, '二次元的Datawhale');
  assert.equal(bilibili.evidence.authority, 'community');
  assert.equal(bilibili.evidence.role, 'extension');
  assert.match(bilibili.evidence.coverage.join(' '), /标题|作者|时长|元数据/);
  assert.match(bilibili.evidence.coverage.join(' '), /2024-07-02.*15:58/);
  assert.match(bilibili.evidence.limitations, /字幕.*空|未取得.*字幕/);

  const youtube = byId.get('res-context-youtube');
  assert.equal(
    youtube.title,
    '【生成式人工智慧與機器學習導論2025】第2講：上下文工程—AI Agent背後的關鍵技術',
  );
  assert.equal(youtube.source, 'Hung-yi Lee');
  assert.equal(youtube.evidence.authority, 'expert');
  assert.equal(youtube.evidence.role, 'extension');
  assert.match(youtube.evidence.limitations, /字幕正文.*未.*取得|未稳定取得.*字幕/);

  for (const id of [
    'res-context-llm-universe',
    'res-context-all-in-rag',
    'res-context-hello-agents',
  ]) {
    assert.equal(byId.get(id).evidence.authority, 'community', `${id}: authority`);
    assert.equal(byId.get(id).evidence.role, 'cross-check', `${id}: role`);
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
    ['一级参考资料', /证据边界[：:].{15,}/],
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

test('editing interview copy preserves its declared identity and ownership', () => {
  const original = structuredClone(contextRagMemory.interviewQuestions[0]);
  const revised = createContextInterviewQuestion({
    ...original,
    question: '请重新说明五类上下文对象的边界。',
  });

  assert.equal(revised.id, original.id);
  assert.equal(revised.lessonId, original.lessonId);
  assert.equal(revised.question, '请重新说明五类上下文对象的边界。');
  assert.notEqual(revised.question, original.question);
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
    assert.throws(() => { resource.evidence.coverage.push('changed'); }, TypeError,
      `${resource.id}.evidence.coverage`);
    assert.throws(() => { resource.evidence.limitations = 'changed'; }, TypeError,
      `${resource.id}.evidence.limitations`);
  }
  for (const item of contextRagMemory.interviewQuestions) {
    assert.throws(() => { item.shortAnswer = 'changed'; }, TypeError, item.id);
    for (const field of ['deepDive', 'misconceptions', 'followUps', 'roles']) {
      assert.throws(() => { item[field].push('changed'); }, TypeError, `${item.id}.${field}`);
    }
  }
  assert.deepEqual(contextRagMemory, snapshot);
});
