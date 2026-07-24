import test from 'node:test';
import assert from 'node:assert/strict';

import { backendEngineering } from '../src/data/backend-engineering.js';
import { backendEngineeringNotes } from '../src/data/backend-engineering-notes.js';

const VERIFIED_AT = '2026-07-24';
const lessonIds = Array.from({ length: 8 }, (_, index) =>
  `backend-${String(index + 1).padStart(2, '0')}`,
);
const lessonTitles = [
  'AI 服务边界与 API 契约',
  '同步、SSE 流式响应与取消',
  '并发、Deadline 与准入控制',
  '异步任务、队列与 Worker',
  'PostgreSQL、Redis 与缓存正确性',
  '重试、幂等与投递语义',
  '生命周期、健康检查与可观测性',
  '部署、扩容与综合故障诊断',
];
const resourceUrls = [
  'https://spec.openapis.org/oas/v3.1.2.html',
  'https://www.rfc-editor.org/rfc/rfc9110.html',
  'https://www.rfc-editor.org/rfc/rfc6585.html',
  'https://html.spec.whatwg.org/multipage/server-sent-events.html',
  'https://asgi.readthedocs.io/en/latest/specs/www.html',
  'https://asgi.readthedocs.io/en/latest/specs/lifespan.html',
  'https://docs.python.org/3/library/asyncio-task.html',
  'https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/',
  'https://prometheus.io/docs/practices/instrumentation/',
  'https://developers.openai.com/api/docs/guides/streaming-responses',
  'https://developers.openai.com/api/docs/guides/background',
  'https://developers.openai.com/api/docs/guides/rate-limits',
  'https://fastapi.tiangolo.com/tutorial/server-sent-events/',
  'https://fastapi.tiangolo.com/deployment/docker/',
  'https://docs.celeryq.dev/en/stable/userguide/tasks.html',
  'https://docs.celeryq.dev/en/stable/userguide/optimizing.html',
  'https://redis.io/docs/latest/develop/reference/eviction/',
  'https://redis.io/docs/latest/develop/use-cases/semantic-cache/',
  'https://www.postgresql.org/docs/current/tutorial-transactions.html',
  'https://research.google/pubs/the-tail-at-scale/',
  'https://www.sosp.org/2001/papers/welsh.pdf',
  'https://arxiv.org/abs/1806.04075',
  'https://research.google/pubs/millwheel-fault-tolerant-stream-processing-at-internet-scale/',
  'https://www.usenix.org/conference/osdi24/presentation/agrawal',
  'https://sre.google/sre-book/addressing-cascading-failures/',
  'https://docs.vllm.ai/en/latest/design/arch_overview/',
  'https://docs.vllm.ai/en/stable/serving/openai_compatible_server/',
  'https://docs.ray.io/en/latest/serve/advanced-guides/dyn-req-batch.html',
  'https://github.com/datawhalechina/llm-universe',
];
const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validRoles = new Set(['core', 'cross-check', 'extension']);

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: 公开课程数据及嵌套值必须冻结`);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

test('AI backend engineering exposes eight ordered lessons, sixteen quizzes and stable IDs', () => {
  assert.equal(backendEngineering.id, 'backend-engineering');
  assert.equal(backendEngineering.title, 'AI 后端工程');
  assert.equal(
    backendEngineering.summary,
    '把多个客户端与 Agent run 组织成可流式、可异步、可恢复、可观测并能部署扩容的 AI 服务。',
  );
  assert.deepEqual(backendEngineering.lessons.map(({ id }) => id), lessonIds);
  assert.deepEqual(backendEngineering.lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(backendEngineering.lessons.map(({ title }) => title), lessonTitles);
  assert.equal(backendEngineering.lessons.flatMap(({ quiz }) => quiz).length, 16);

  for (const lesson of backendEngineering.lessons) {
    assert.equal(lesson.moduleId, backendEngineering.id, lesson.id);
    assert.ok(lesson.summary.length >= 20, lesson.id);
    assert.ok(lesson.durationMinutes >= 90 && lesson.durationMinutes <= 125, lesson.id);
    assert.ok(lesson.objectives.length >= 2, lesson.id);
    assert.ok(lesson.concepts.length >= 3, lesson.id);
    assert.ok(lesson.explanations.length >= 2, lesson.id);
    assert.ok(lesson.resourceIds.length >= 2, lesson.id);
    assert.equal(lesson.exercise.steps.length, 2, lesson.id);
    assert.ok(lesson.exercise.deliverable.length >= 10, lesson.id);
    assert.equal(lesson.quiz.length, 2, lesson.id);
    assert.equal(lesson.interviewQuestionIds.length, 3, lesson.id);
    assert.equal(lesson.completionCriteria.length, 2, lesson.id);
    for (const explanation of lesson.explanations) {
      assert.ok(explanation.heading.length >= 4, lesson.id);
      assert.ok(explanation.body.length >= 80, lesson.id);
      assert.ok(explanation.keyPoints.length >= 2, lesson.id);
    }
    for (const quiz of lesson.quiz) {
      assert.match(quiz.id, new RegExp(`^quiz-${lesson.id}-[12]$`), quiz.id);
      assert.ok(quiz.prompt.length >= 10, quiz.id);
      assert.ok(quiz.choices.length >= 3, quiz.id);
      assert.ok(Number.isInteger(quiz.answerIndex), quiz.id);
      assert.ok(quiz.answerIndex >= 0 && quiz.answerIndex < quiz.choices.length, quiz.id);
      assert.ok(quiz.explanation.length >= 20, quiz.id);
    }
  }
});

test('the course publishes exactly 29 verified resources with complete evidence cards', () => {
  assert.equal(backendEngineering.resources.length, 29);
  assert.deepEqual(backendEngineering.resources.map(({ url }) => url), resourceUrls);

  for (const resource of backendEngineering.resources) {
    assert.match(resource.id, /^res-backend-/);
    assert.equal(new URL(resource.url).protocol, 'https:', resource.id);
    assert.equal(resource.verifiedAt, VERIFIED_AT, resource.id);
    for (const field of [
      'id',
      'title',
      'url',
      'source',
      'language',
      'type',
      'difficulty',
      'stage',
      'value',
    ]) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
    assert.match(resource.value, /学习用途[：:]/, resource.id);
    assert.match(resource.value, /证据边界[：:]/, resource.id);

    const { evidence } = resource;
    assert.ok(evidence, `${resource.id}: evidence`);
    assert.ok(validAuthorities.has(evidence.authority), resource.id);
    assert.ok(validRoles.has(evidence.role), resource.id);
    assert.ok(evidence.coverage.length >= 1, resource.id);
    assert.ok(evidence.coverage.every((item) => item.trim().length >= 8), resource.id);
    assert.ok(evidence.limitations.length >= 25, resource.id);
    assert.equal(evidence.verifiedAt, VERIFIED_AT, resource.id);
  }

  const byId = new Map(backendEngineering.resources.map((resource) => [resource.id, resource]));
  assert.match(byId.get('res-backend-fastapi-containers').evidence.limitations, /Dockerfile Reference.*未单列/);
  assert.equal(byId.get('res-backend-datawhale').evidence.role, 'extension');
  assert.match(byId.get('res-backend-datawhale').evidence.limitations, /学习导航.*不承担.*核心主张/);
  assert.match(byId.get('res-backend-tail-at-scale').evidence.limitations, /实验|工作负载/);
  assert.match(byId.get('res-backend-dagor').evidence.limitations, /微信|WeChat/);
  assert.match(byId.get('res-backend-sarathi').evidence.limitations, /硬件|GPU|模型/);
});

test('lesson references resolve resources and interviews in both directions with full resource usage', () => {
  const resourceIds = new Set(backendEngineering.resources.map(({ id }) => id));
  const interviewIds = new Set(backendEngineering.interviewQuestions.map(({ id }) => id));
  const usedResourceIds = new Set();
  const referencedInterviewIds = [];

  for (const lesson of backendEngineering.lessons) {
    for (const id of lesson.resourceIds) {
      assert.ok(resourceIds.has(id), `${lesson.id}: unknown resource ${id}`);
      usedResourceIds.add(id);
    }
    for (const id of lesson.interviewQuestionIds) {
      assert.ok(interviewIds.has(id), `${lesson.id}: unknown interview ${id}`);
      referencedInterviewIds.push(id);
    }
  }
  assert.deepEqual(usedResourceIds, resourceIds, '29 项资源都应被至少一课使用');
  assert.equal(new Set(referencedInterviewIds).size, 24);

  for (const question of backendEngineering.interviewQuestions) {
    const lesson = backendEngineering.lessons.find(({ id }) => id === question.lessonId);
    assert.ok(lesson, question.id);
    assert.ok(lesson.interviewQuestionIds.includes(question.id), question.id);
  }
});

test('interview bank contains exactly three substantive questions per lesson', () => {
  assert.equal(backendEngineering.interviewQuestions.length, 24);
  for (const lessonId of lessonIds) {
    const questions = backendEngineering.interviewQuestions.filter(
      ({ lessonId: ownerId }) => ownerId === lessonId,
    );
    assert.equal(questions.length, 3, lessonId);
    assert.deepEqual(
      questions.map(({ id }) => id),
      [1, 2, 3].map((number) => `iq-${lessonId}-${number}`),
    );
  }
  for (const question of backendEngineering.interviewQuestions) {
    assert.ok(question.question.length >= 10, question.id);
    assert.ok(question.shortAnswer.length >= 40, question.id);
    assert.ok(question.deepDive.length >= 2, question.id);
    assert.ok(question.misconceptions.length >= 1, question.id);
    assert.ok(question.followUps.length >= 1, question.id);
    assert.ok(question.roles.includes('后端工程'), question.id);
  }
});

test('all eight lessons publish distinct source-grounded knowledge notes', async () => {
  assert.deepEqual(Object.keys(backendEngineeringNotes), lessonIds);
  assert.equal(new Set(Object.values(backendEngineeringNotes)).size, 8);
  const resourcesById = new Map(backendEngineering.resources.map((resource) => [resource.id, resource]));

  for (const lesson of backendEngineering.lessons) {
    const suffix = lesson.id.slice(-2);
    const module = await import(`../src/data/backend-engineering-notes/${lesson.id}.js`);
    const note = module[`backend${suffix}Note`];
    assert.equal(note, backendEngineeringNotes[lesson.id], lesson.id);
    assert.equal(lesson.knowledgeNote, note, lesson.id);
    assert.ok(Number.isInteger(note.readingMinutes)
      && note.readingMinutes >= 20 && note.readingMinutes <= 30, lesson.id);
    assert.ok(note.introduction.length >= 100, lesson.id);
    assert.ok(note.sections.length >= 4 && note.sections.length <= 7, lesson.id);
    assertUnique(note.sections.map(({ id }) => id), `${lesson.id}: section IDs`);

    const bodyLength = [
      note.introduction,
      ...note.sections.flatMap(({ paragraphs }) => paragraphs),
      note.nextStep,
    ].reduce((total, value) => total + value.trim().length, 0);
    assert.ok(bodyLength >= 3000 && bodyLength <= 7500,
      `${lesson.id}: 笔记正文应为 3000–7500 字符，当前 ${bodyLength}`);

    for (const section of note.sections) {
      assert.match(section.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${lesson.id}:${section.id}`);
      assert.ok(section.title.length >= 4, `${lesson.id}:${section.id}`);
      assert.ok(section.paragraphs.length >= 2 && section.paragraphs.length <= 4,
        `${lesson.id}:${section.id}`);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 80),
        `${lesson.id}:${section.id}: paragraphs`);
      assert.ok(section.keyPoints.length >= 2, `${lesson.id}:${section.id}: keyPoints`);
      assert.ok(section.sourceIds.length >= 1, `${lesson.id}:${section.id}: sourceIds`);
      assert.ok(section.sourceIds.every((id) => lesson.resourceIds.includes(id)),
        `${lesson.id}:${section.id}: lesson sources`);
      assert.ok(section.sourceIds.every((id) => resourcesById.get(id)?.evidence),
        `${lesson.id}:${section.id}: evidence`);
      assert.ok(section.sourceIds.some((id) => resourcesById.get(id).evidence.role !== 'extension'),
        `${lesson.id}:${section.id}: extension cannot carry assessed claims alone`);
    }
    assert.ok(note.misconceptions.length >= 4 && note.misconceptions.length <= 6, lesson.id);
    assert.ok(note.misconceptions.every(({ claim, correction }) =>
      claim.length >= 10 && correction.length >= 25), lesson.id);
    assert.ok(note.recap.length >= 5, lesson.id);
    assert.ok(note.nextStep.length >= 80, lesson.id);
  }
  assertDeepFrozen(backendEngineeringNotes, 'backendEngineeringNotes');
});

test('curriculum preserves the central protocol and evidence boundaries', () => {
  const copy = JSON.stringify(backendEngineering);
  for (const pattern of [
    /OpenAPI.*不会自动保证.*兼容|OpenAPI.*不.*可靠/,
    /created.*delta.*completed.*error.*cancelled/,
    /断线.*取消.*副作用/,
    /L\s*=\s*λW.*不是.*p95|Little.*不是.*尾延迟/,
    /Redis.*非权威.*可重建/,
    /readiness.*liveness.*startup/,
    /至少一次.*幂等|at-least-once.*idempot/i,
    /项目实现.*不(?:等于|代表).*通用规范/,
  ]) {
    assert.match(copy, pattern);
  }
});

test('all lesson, resource, quiz and interview identifiers are unique and data is deeply frozen', () => {
  const lessonIdsInCourse = backendEngineering.lessons.map(({ id }) => id);
  const resourceIds = backendEngineering.resources.map(({ id }) => id);
  const quizIds = backendEngineering.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id));
  const interviewIds = backendEngineering.interviewQuestions.map(({ id }) => id);

  assertUnique(lessonIdsInCourse, 'lesson IDs');
  assertUnique(resourceIds, 'resource IDs');
  assertUnique(quizIds, 'quiz IDs');
  assertUnique(interviewIds, 'interview IDs');
  assertUnique(
    [...lessonIdsInCourse, ...resourceIds, ...quizIds, ...interviewIds],
    'all backend curriculum IDs',
  );
  assertDeepFrozen(backendEngineering, 'backendEngineering');
});
