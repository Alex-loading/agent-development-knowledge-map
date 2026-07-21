import test from 'node:test';
import assert from 'node:assert/strict';

import { modules } from '../src/data/modules.js';
import { agentHarness } from '../src/data/agent-harness.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';
import { contextRagMemory } from '../src/data/context-rag-memory.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { llmFoundationNotes } from '../src/data/llm-foundation-notes.js';

const expectedLessonIds = Array.from({ length: 8 }, (_, index) =>
  `llm-${String(index + 1).padStart(2, '0')}`,
);
const noteExpectations = new Map([
  ['llm-01', { minMinutes: 20, maxMinutes: 30, minLength: 3000 }],
  ['llm-02', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['llm-03', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['llm-04', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-05', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-06', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-07', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['llm-08', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
]);
const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validRoles = new Set(['core', 'cross-check', 'extension']);

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: 公开课程数据及其嵌套结构必须被冻结`);
  for (const [key, nestedValue] of Object.entries(value)) {
    assertDeepFrozen(nestedValue, `${label}.${key}`, seen);
  }
}

test('module catalog starts with four active modules and exposes planned dependencies', () => {
  const moduleIds = new Set(modules.map((module) => module.id));
  assert.deepEqual(
    modules.slice(0, 4).map(({ id, status }) => ({ id, status })),
    [
      { id: 'llm-foundation', status: 'active' },
      { id: 'agent-mechanism', status: 'active' },
      { id: 'agent-harness', status: 'active' },
      { id: 'context-rag-memory', status: 'active' },
    ],
  );
  assert.deepEqual(
    modules.find(({ id }) => id === 'context-rag-memory').prerequisites,
    ['llm-foundation', 'agent-mechanism'],
  );
  assert.equal(modules.slice(4).length, 4);
  assert.ok(modules.slice(4).every((module) => module.status === 'planned'));
  assert.ok(modules.every((module) => Array.isArray(module.prerequisites)));
  assert.ok(
    modules.every((module) => module.prerequisites.every((id) => moduleIds.has(id))),
    '模块先修项必须指向已知模块',
  );
  assert.ok(modules.every((module) => Number.isFinite(module.estimatedHours)));
  assert.ok(
    modules.every(
      (module) =>
        module.summary.length >= 10 &&
        ['课程', '资源', '练习', '面试高频'].every((item) =>
          module.promisedContent.includes(item),
        ),
    ),
  );
});

test('module content promises are isolated and prerequisite graph is acyclic', () => {
  assert.equal(
    new Set(modules.map((module) => module.promisedContent)).size,
    modules.length,
    '模块不能共享同一个可变 promisedContent 数组',
  );
  assert.ok(modules.every((module) => Object.isFrozen(module.promisedContent)));

  const byId = new Map(modules.map((module) => [module.id, module]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visited.has(id)) return;
    assert.ok(!visiting.has(id), `模块依赖不能成环：${id}`);
    visiting.add(id);
    for (const prerequisiteId of byId.get(id).prerequisites) visit(prerequisiteId);
    visiting.delete(id);
    visited.add(id);
  };
  modules.forEach((module) => visit(module.id));
});

test('LLM foundation contains exactly eight ordered lessons', () => {
  assert.equal(llmFoundation.id, 'llm-foundation');
  assert.deepEqual(
    llmFoundation.lessons.map((lesson) => lesson.id),
    expectedLessonIds,
  );
  assert.deepEqual(
    llmFoundation.lessons.map((lesson) => lesson.order),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.ok(llmFoundation.lessons.every((lesson) => lesson.moduleId === llmFoundation.id));
});

test('every lesson has substantive teaching, practice and completion material', () => {
  for (const lesson of llmFoundation.lessons) {
    assert.ok(lesson.title.length >= 4, lesson.id);
    assert.ok(lesson.summary.length >= 20, lesson.id);
    assert.ok(lesson.durationMinutes >= 20, lesson.id);
    assert.ok(lesson.objectives.length >= 2, lesson.id);
    assert.ok(lesson.concepts.length >= 3, lesson.id);
    assert.ok(lesson.explanations.length >= 2, lesson.id);
    for (const section of lesson.explanations) {
      assert.ok(section.heading.length >= 2, `${lesson.id}: explanation heading`);
      assert.ok(section.body.length >= 60, `${lesson.id}: explanation body`);
      assert.ok(section.keyPoints.length >= 2, `${lesson.id}: explanation key points`);
    }
    assert.ok(lesson.exercise.title.length >= 2, lesson.id);
    assert.ok(lesson.exercise.brief.length >= 15, lesson.id);
    assert.ok(lesson.exercise.steps.length >= 2, lesson.id);
    assert.ok(lesson.exercise.deliverable.length >= 10, lesson.id);
    assert.ok(lesson.quiz.length >= 2, lesson.id);
    assert.ok(lesson.completionCriteria.length >= 2, lesson.id);
  }
});

test('every LLM lesson has a source-grounded long-form knowledge note', () => {
  const resourcesById = new Map(
    llmFoundation.resources.map((resource) => [resource.id, resource]),
  );
  assert.deepEqual(Object.keys(llmFoundationNotes), expectedLessonIds, '笔记注册表必须覆盖且只覆盖八节 LLM 课程');
  assert.deepEqual(
    llmFoundation.lessons.filter((lesson) => lesson.knowledgeNote).map((lesson) => lesson.id),
    expectedLessonIds,
    '八节 LLM 课程都必须提供 knowledgeNote',
  );
  assert.equal(new Set(Object.values(llmFoundationNotes)).size, expectedLessonIds.length,
    '每节 LLM 课程必须使用不同的 knowledgeNote 对象');

  for (const lesson of llmFoundation.lessons) {
    const expectation = noteExpectations.get(lesson.id);
    const note = lesson.knowledgeNote;
    assert.ok(expectation, `${lesson.id}: 必须有知识笔记发布要求`);
    assert.ok(note, `${lesson.id}: 必须提供 knowledgeNote`);
    assert.equal(note, llmFoundationNotes[lesson.id], `${lesson.id}: knowledgeNote 必须引用注册表中的同一对象`);
    assert.ok(typeof note.introduction === 'string' && note.introduction.length > 0, `${lesson.id}: introduction 不能为空`);
    assert.ok(typeof note.nextStep === 'string' && note.nextStep.length > 0, `${lesson.id}: nextStep 不能为空`);
    assert.ok(Array.isArray(note.sections), `${lesson.id}: sections 必须为数组`);

    const sectionIds = note.sections.map(({ id }) => id);
    const bodyLength = note.introduction.length
      + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length
      + note.nextStep.length;
    assert.ok(note.readingMinutes >= expectation.minMinutes && note.readingMinutes <= expectation.maxMinutes,
      `${lesson.id}: 阅读时长应为 ${expectation.minMinutes}–${expectation.maxMinutes} 分钟`);
    assert.ok(note.sections.length >= 5 && note.sections.length <= 7, `${lesson.id}: 应包含 5–7 个递进章节`);
    assertUnique(sectionIds, `${lesson.id}: knowledgeNote section id`);
    assert.ok(bodyLength >= expectation.minLength && bodyLength <= 9000,
      `${lesson.id}: 正文长度应为 ${expectation.minLength}–9000 字符，当前为 ${bodyLength}`);

    const lessonResourceIds = new Set(lesson.resourceIds);
    for (const section of note.sections) {
      assert.match(section.id ?? '', /^[a-z0-9-]+$/, `${lesson.id}: section id 必须为 kebab-case`);
      assert.ok(typeof section.title === 'string' && section.title.trim().length >= 4,
        `${lesson.id}:${section.id}: title 至少需要 4 个非空字符`);
      assert.ok(Array.isArray(section.paragraphs) && section.paragraphs.length >= 2 && section.paragraphs.length <= 4,
        `${lesson.id}:${section.id}: 需要 2–4 个正文段落`);
      assert.ok(section.paragraphs.every((paragraph) => typeof paragraph === 'string' && paragraph.length >= 60),
        `${lesson.id}:${section.id}: 每个正文段落至少需要 60 个字符`);
      assert.ok(Array.isArray(section.keyPoints) && section.keyPoints.length >= 2,
        `${lesson.id}:${section.id}: 至少需要 2 个要点`);
      assert.ok(section.keyPoints.every((keyPoint) => typeof keyPoint === 'string' && keyPoint.trim().length > 0),
        `${lesson.id}:${section.id}: 每个要点必须是非空字符串`);
      assert.ok(Array.isArray(section.sourceIds) && section.sourceIds.length >= 1,
        `${lesson.id}:${section.id}: 至少需要 1 个来源`);
      assert.ok(section.sourceIds.every((id) => resourcesById.has(id)),
        `${lesson.id}:${section.id}: sourceIds 必须全部存在于全局资源库`);
      assert.ok(section.sourceIds.every((id) => lessonResourceIds.has(id)),
        `${lesson.id}:${section.id}: sourceIds 必须全部属于 lesson.resourceIds`);
    }
    assert.ok(Array.isArray(note.misconceptions) && note.misconceptions.length >= 4 && note.misconceptions.length <= 6,
      `${lesson.id}: 需要 4–6 个常见误区`);
    assert.ok(note.misconceptions.every((misconception) => (
      typeof misconception?.claim === 'string' && misconception.claim.trim().length > 0
      && typeof misconception.correction === 'string' && misconception.correction.trim().length > 0
    )), `${lesson.id}: 每个误区必须具有非空 claim 和 correction`);
    assert.ok(Array.isArray(note.recap) && note.recap.length >= 5, `${lesson.id}: recap 至少需要 5 个回顾要点`);
    assert.ok(note.recap.every((item) => typeof item === 'string' && item.trim().length > 0),
      `${lesson.id}: 每个 recap 项必须是非空字符串`);
  }
});

test('all 28 LLM resources provide complete evidence cards', () => {
  assert.equal(llmFoundation.resources.length, 28, 'LLM 课程必须维护 28 份资源');
  for (const resource of llmFoundation.resources) {
    assert.ok(resource.evidence, `${resource.id}: 必须提供 evidence 来源卡`);
    assert.ok(validAuthorities.has(resource.evidence.authority), `${resource.id}: evidence.authority 值无效`);
    assert.ok(validRoles.has(resource.evidence.role), `${resource.id}: evidence.role 值无效`);
    assert.ok(Array.isArray(resource.evidence.coverage) && resource.evidence.coverage.length >= 1,
      `${resource.id}: evidence.coverage 不能为空`);
    assert.ok(typeof resource.evidence.limitations === 'string' && resource.evidence.limitations.length >= 15,
      `${resource.id}: evidence.limitations 至少需要 15 个字符`);
  }
});

test('other active module courses retain explanation fallback without knowledge notes', () => {
  for (const course of [agentMechanism, agentHarness, contextRagMemory]) {
    for (const lesson of course.lessons) {
      assert.equal(lesson.knowledgeNote, undefined, `${course.id}:${lesson.id}: 不应启用 knowledgeNote`);
      assert.ok(
        Array.isArray(lesson.explanations) && lesson.explanations.length >= 2,
        `${course.id}:${lesson.id}: 必须保留 explanations 作为 fallback`,
      );
    }
  }
});

test('LLM foundation export is deeply frozen', () => {
  const lessonEight = llmFoundation.lessons.find(({ id }) => id === 'llm-08');
  const resource = llmFoundation.resources.find(({ id }) => id === 'res-openai-evals');

  for (const lesson of llmFoundation.lessons) {
    assert.ok(lesson.knowledgeNote, `${lesson.id}: 冻结验证前必须提供 knowledgeNote`);
    assertDeepFrozen(lesson.knowledgeNote, `${lesson.id}.knowledgeNote`);
  }
  for (const candidate of llmFoundation.resources) {
    assert.ok(candidate.evidence, `${candidate.id}: 冻结验证前必须提供 evidence`);
    assertDeepFrozen(candidate.evidence, `${candidate.id}.evidence`);
  }
  assertDeepFrozen(llmFoundation, 'llmFoundation');

  assert.throws(() => {
    resource.evidence.coverage[0] = '被篡改的覆盖范围';
  }, TypeError);
  assert.throws(() => {
    lessonEight.knowledgeNote.recap.push('被篡改的回顾要点');
  }, TypeError);
});

test('every quiz item is answerable and explained', () => {
  for (const lesson of llmFoundation.lessons) {
    for (const item of lesson.quiz) {
      assert.ok(item.id);
      assert.ok(item.prompt.length >= 8, item.id);
      assert.ok(item.choices.length >= 2, item.id);
      assert.ok(Number.isInteger(item.answerIndex), item.id);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < item.choices.length, item.id);
      assert.ok(item.explanation.length >= 15, item.id);
    }
  }
});

test('lesson resource and interview references resolve in both directions', () => {
  const resourceIds = new Set(llmFoundation.resources.map((resource) => resource.id));
  const referencedResourceIds = new Set(
    llmFoundation.lessons.flatMap((lesson) => lesson.resourceIds),
  );
  const interviewIds = new Set(
    llmFoundation.interviewQuestions.map((question) => question.id),
  );
  const interviewsById = new Map(
    llmFoundation.interviewQuestions.map((question) => [question.id, question]),
  );
  const referencedInterviewIds = new Set(
    llmFoundation.lessons.flatMap((lesson) => lesson.interviewQuestionIds),
  );

  for (const lesson of llmFoundation.lessons) {
    assert.ok(lesson.resourceIds.length >= 2, lesson.id);
    assert.ok(lesson.resourceIds.every((id) => resourceIds.has(id)), lesson.id);
    assert.ok(lesson.interviewQuestionIds.length >= 3, lesson.id);
    assert.ok(lesson.interviewQuestionIds.every((id) => interviewIds.has(id)), lesson.id);
    assert.ok(
      lesson.interviewQuestionIds.every(
        (id) => interviewsById.get(id).lessonId === lesson.id,
      ),
      `${lesson.id}: 面试题必须归属引用它的课时`,
    );
  }
  assert.ok(
    llmFoundation.interviewQuestions.every((question) => referencedInterviewIds.has(question.id)),
  );
  assert.ok(
    llmFoundation.resources.every((resource) => referencedResourceIds.has(resource.id)),
    '每项资源都应映射到至少一个相关课时',
  );
});

test('resources are curated HTTPS entries with verification metadata', () => {
  assert.ok(llmFoundation.resources.length >= 18);
  assert.ok(llmFoundation.resources.length <= 30);
  for (const resource of llmFoundation.resources) {
    assert.match(resource.url, /^https:\/\//, resource.id);
    assert.match(resource.verifiedAt, /^2026-07-(15|21|22)$/, `${resource.id}: verifiedAt 格式或允许日期无效`);
    assert.ok(resource.verifiedAt <= '2026-07-22', `${resource.id}: verifiedAt 不得晚于 2026-07-22`);
    for (const field of ['source', 'language', 'type', 'difficulty', 'stage', 'value']) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
  }
});

test('curated resources include verified video, eval and security primary sources', () => {
  const byId = new Map(llmFoundation.resources.map((resource) => [resource.id, resource]));
  const karpathyYoutube = byId.get('res-karpathy-build-gpt');
  assert.ok(
    llmFoundation.resources.some((resource) => resource.type.includes('YouTube')),
    '资源库至少包含一项可筛选的 YouTube 资源',
  );
  assert.ok(karpathyYoutube, '必须保留 Karpathy 官方 Build GPT 视频');
  assert.equal(karpathyYoutube.url, 'https://www.youtube.com/watch?v=kCc8FmEb1nY');
  assert.equal(karpathyYoutube.source, 'Andrej Karpathy');
  assert.match(karpathyYoutube.type, /YouTube/);
  assert.equal(karpathyYoutube.platform, 'YouTube');
  assert.equal(karpathyYoutube.verifiedAt, '2026-07-15');
  assert.ok(
    ['llm-03', 'llm-04'].some((lessonId) =>
      llmFoundation.lessons
        .find((lesson) => lesson.id === lessonId)
        .resourceIds.includes(karpathyYoutube.id),
    ),
  );

  const lessonEight = llmFoundation.lessons.find((lesson) => lesson.id === 'llm-08');
  for (const resourceId of ['res-openai-evals', 'res-owasp-prompt-injection']) {
    assert.ok(byId.has(resourceId), resourceId);
    assert.ok(lessonEight.resourceIds.includes(resourceId), resourceId);
  }
});

test('interview bank covers every lesson with substantive reusable answers', () => {
  const validRoles = new Set(['Agent 开发', 'AI 应用', '后端工程']);
  const validFrequencies = new Set(['高', '中', '补充']);
  const validDifficulties = new Set(['基础', '进阶', '深挖']);
  assert.ok(llmFoundation.interviewQuestions.length >= 24);

  for (const lessonId of expectedLessonIds) {
    assert.ok(
      llmFoundation.interviewQuestions.filter((question) => question.lessonId === lessonId)
        .length >= 3,
      lessonId,
    );
  }
  for (const question of llmFoundation.interviewQuestions) {
    assert.ok(expectedLessonIds.includes(question.lessonId), question.id);
    assert.ok(question.question.length >= 6, question.id);
    assert.ok(question.shortAnswer.length > 20, question.id);
    assert.ok(question.deepDive.length >= 2, question.id);
    assert.ok(question.misconceptions.length >= 1, question.id);
    assert.ok(question.followUps.length >= 1, question.id);
    assert.ok(question.roles.length >= 1, question.id);
    assert.ok(question.roles.every((role) => validRoles.has(role)), question.id);
    assert.ok(validFrequencies.has(question.frequency), question.id);
    assert.ok(validDifficulties.has(question.difficulty), question.id);
  }
});

test('all public data identifiers are unique', () => {
  assertUnique(modules.map((module) => module.id), 'module id');
  assertUnique(llmFoundation.lessons.map((lesson) => lesson.id), 'lesson id');
  assertUnique(llmFoundation.resources.map((resource) => resource.id), 'resource id');
  assertUnique(
    llmFoundation.lessons.flatMap((lesson) => lesson.quiz.map((item) => item.id)),
    'quiz id',
  );
  assertUnique(
    llmFoundation.interviewQuestions.map((question) => question.id),
    'interview id',
  );
});
