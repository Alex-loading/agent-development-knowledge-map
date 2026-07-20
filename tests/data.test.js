import test from 'node:test';
import assert from 'node:assert/strict';

import { modules } from '../src/data/modules.js';
import { llmFoundation } from '../src/data/llm-foundation.js';

const expectedLessonIds = Array.from({ length: 8 }, (_, index) =>
  `llm-${String(index + 1).padStart(2, '0')}`,
);

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

test('module catalog starts with three active modules and exposes planned dependencies', () => {
  const moduleIds = new Set(modules.map((module) => module.id));
  assert.deepEqual(
    modules.slice(0, 3).map(({ id, status }) => ({ id, status })),
    [
      { id: 'llm-foundation', status: 'active' },
      { id: 'agent-mechanism', status: 'active' },
      { id: 'agent-harness', status: 'active' },
    ],
  );
  assert.equal(modules.slice(3).length, 5);
  assert.ok(modules.slice(3).every((module) => module.status === 'planned'));
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

test('LLM first lesson has a source-grounded long-form knowledge note pilot', () => {
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');
  const note = lesson.knowledgeNote;
  assert.ok(note, 'llm-01 必须提供 knowledgeNote 试点');
  assert.ok(
    typeof note.introduction === 'string' && note.introduction.length > 0,
    'llm-01: knowledgeNote.introduction 不能为空',
  );
  assert.ok(Array.isArray(note.sections), 'llm-01: knowledgeNote.sections 必须为数组');
  assert.ok(
    typeof note.nextStep === 'string' && note.nextStep.length > 0,
    'llm-01: knowledgeNote.nextStep 不能为空',
  );

  const lessonResourceIds = new Set(lesson.resourceIds);
  const sectionIds = note.sections.map(({ id }) => id);
  const bodyLength = note.introduction.length
    + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length
    + note.nextStep.length;

  assert.ok(
    note.readingMinutes >= 20 && note.readingMinutes <= 30,
    'llm-01: knowledgeNote 阅读时长应为 20–30 分钟',
  );
  assert.ok(
    note.sections.length >= 6 && note.sections.length <= 7,
    'llm-01: knowledgeNote 应包含 6–7 个递进章节',
  );
  assert.equal(
    new Set(sectionIds).size,
    sectionIds.length,
    'llm-01: knowledgeNote section id 不应重复',
  );
  assert.ok(
    bodyLength >= 3000 && bodyLength <= 5500,
    `llm-01: knowledgeNote 正文长度应为 3000–5500 字符，当前为 ${bodyLength}`,
  );

  for (const section of note.sections) {
    assert.match(section.id ?? '', /^[a-z0-9-]+$/, 'section id 必须为 kebab-case');
    assert.ok(
      typeof section.title === 'string' && section.title.length >= 4,
      `${section.id}: title 至少 4 个字符`,
    );
    assert.ok(
      Array.isArray(section.paragraphs) && section.paragraphs.length >= 2,
      `${section.id}: 至少需要 2 个正文段落`,
    );
    assert.ok(
      section.paragraphs.every(
        (paragraph) => typeof paragraph === 'string' && paragraph.length >= 60,
      ),
      `${section.id}: 每个正文段落至少需要 60 个字符`,
    );
    assert.ok(
      Array.isArray(section.keyPoints) && section.keyPoints.length >= 2,
      `${section.id}: 至少需要 2 个要点`,
    );
    assert.ok(
      Array.isArray(section.sourceIds) && section.sourceIds.length >= 1,
      `${section.id}: 至少需要 1 个来源`,
    );
    assert.ok(
      section.sourceIds.every((id) => lessonResourceIds.has(id)),
      `${section.id}: sourceIds 必须全部属于 llm-01.resourceIds`,
    );
  }

  assert.ok(
    Array.isArray(note.misconceptions) && note.misconceptions.length >= 3,
    'llm-01: 至少需要 3 个常见误区',
  );
  assert.ok(
    Array.isArray(note.recap) && note.recap.length >= 5,
    'llm-01: recap 至少需要 5 个回顾要点',
  );
});

test('LLM first lesson resources all provide complete evidence cards', () => {
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');
  const resourcesById = new Map(
    llmFoundation.resources.map((resource) => [resource.id, resource]),
  );
  const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
  const validRoles = new Set(['core', 'cross-check', 'extension']);

  assert.equal(lesson.resourceIds.length, 7, 'llm-01 应关联且核验 7 份学习资料');
  assert.equal(
    new Set(lesson.resourceIds).size,
    7,
    'llm-01 的 7 份学习资料必须使用不同 resource id',
  );
  for (const resourceId of lesson.resourceIds) {
    const resource = resourcesById.get(resourceId);
    assert.ok(resource, `${resourceId}: 必须存在于资源库`);
    assert.ok(resource.evidence, `${resourceId}: 必须提供 evidence 来源卡`);
    assert.ok(
      validAuthorities.has(resource.evidence.authority),
      `${resourceId}: evidence.authority 值无效`,
    );
    assert.ok(
      validRoles.has(resource.evidence.role),
      `${resourceId}: evidence.role 值无效`,
    );
    assert.ok(
      Array.isArray(resource.evidence.coverage) && resource.evidence.coverage.length >= 1,
      `${resourceId}: evidence.coverage 不能为空`,
    );
    assert.ok(
      typeof resource.evidence.limitations === 'string'
        && resource.evidence.limitations.length >= 15,
      `${resourceId}: evidence.limitations 至少需要 15 个字符`,
    );
  }
});

test('knowledge note remains an llm-01-only pilot with explanation fallback elsewhere', () => {
  assert.deepEqual(
    llmFoundation.lessons
      .filter((lesson) => lesson.knowledgeNote)
      .map((lesson) => lesson.id),
    ['llm-01'],
    '当前只有 llm-01 应启用 knowledgeNote 试点',
  );

  for (const lesson of llmFoundation.lessons.filter(({ id }) => id !== 'llm-01')) {
    assert.equal(lesson.knowledgeNote, undefined, `${lesson.id}: 不应提前启用 knowledgeNote`);
    assert.ok(
      Array.isArray(lesson.explanations) && lesson.explanations.length >= 2,
      `${lesson.id}: 必须保留 explanations 作为 fallback`,
    );
  }
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
    assert.equal(resource.verifiedAt, '2026-07-15', resource.id);
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
