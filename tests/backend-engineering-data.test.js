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
  'https://www.columbia.edu/~ks20/stochastic-I/stochastic-I-LL.pdf',
  'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
  'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html',
  'https://people.eecs.berkeley.edu/~prabal/teaching/eecs582-w12/readings/chubby.pdf',
  'https://docs.docker.com/build/building/best-practices/',
  'https://vsis-www.informatik.uni-hamburg.de/getDoc.php/publications/569/Coordinated_Omission_in_NoSQL_Database_Benchmarking-Friedrich.pdf',
  'https://docs.vllm.ai/projects/spyre/en/latest/user_guide/performance.html',
  'https://pkg.go.dev/golang.org/x/sync/singleflight',
];
const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validRoles = new Set(['core', 'cross-check', 'extension']);
const assessmentFields = [
  ['objectives', 2],
  ['quiz', 2],
  ['interviewQuestionIds', 3],
  ['exercise.steps', 2],
  ['completionCriteria', 2],
];

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

function resolveAssessmentField(lesson, fieldPath) {
  const match = /^(objectives|quiz|interviewQuestionIds|exercise\.steps|completionCriteria)\[(\d+)\]$/
    .exec(fieldPath);
  assert.ok(match, `${lesson.id}: unsupported coverage field path ${fieldPath}`);
  const [, collection, rawIndex] = match;
  const index = Number(rawIndex);
  const value = collection === 'exercise.steps'
    ? lesson.exercise.steps[index]
    : lesson[collection][index];
  assert.notEqual(value, undefined, `${lesson.id}: unresolved coverage field ${fieldPath}`);
  if (collection === 'interviewQuestionIds') {
    const question = backendEngineering.interviewQuestions.find(({ id }) => id === value);
    assert.ok(question, `${lesson.id}: unresolved interview ${value}`);
    return question;
  }
  return value;
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

test('the course publishes exactly 37 verified resources with complete evidence cards', () => {
  assert.equal(backendEngineering.resources.length, 37);
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

  const requiredEvidence = {
    'res-backend-little-law': {
      authority: 'academic',
      role: 'core',
      coverage: /L\s*=\s*λW|长期均值/,
      limitations: /存在.*有限|p95|p99/,
    },
    'res-backend-aws-idempotent-apis': {
      authority: 'official',
      role: 'core',
      coverage: /client request ID|same ID|different intent|late arrival|unknown outcome/i,
      limitations: /厂商|标准/,
    },
    'res-backend-aws-transactional-outbox': {
      authority: 'official',
      role: 'core',
      coverage: /dual write|outbox|relay|重复/i,
      limitations: /AWS.*exactly-once|普适.*exactly-once/i,
    },
    'res-backend-chubby': {
      authority: 'academic',
      role: 'cross-check',
      coverage: /sequencer|generation|stale/i,
      limitations: /broker|统一规范/,
    },
    'res-backend-docker-build-best-practices': {
      authority: 'official',
      role: 'core',
      coverage: /USER|non-root|build cache/i,
      limitations: /版本|实现/,
    },
    'res-backend-coordinated-omission': {
      authority: 'academic',
      role: 'cross-check',
      coverage: /closed|synchronous|intended arrivals|coordinated omission/i,
      limitations: /数据库|实验/,
    },
    'res-backend-vllm-performance-tpot': {
      authority: 'official',
      role: 'cross-check',
      coverage: /TTFT|ITL|TPOT|E2EL/,
      limitations: /Spyre|通用/,
    },
    'res-backend-go-singleflight': {
      authority: 'official',
      role: 'core',
      coverage: /duplicate function call suppression|同一 key.*只执行一次|等待.*共享结果/i,
      limitations: /Go x\/sync.*进程内.*分布式锁.*跨实例去重/i,
    },
  };
  for (const [id, expected] of Object.entries(requiredEvidence)) {
    const resource = byId.get(id);
    assert.ok(resource, id);
    assert.equal(resource.evidence.authority, expected.authority, id);
    assert.equal(resource.evidence.role, expected.role, id);
    assert.match(resource.evidence.coverage.join(' '), expected.coverage, id);
    assert.match(resource.evidence.limitations, expected.limitations, id);
  }
});

test('lesson references resolve resources and interviews in both directions with full resource usage', () => {
  const resourceIds = new Set(backendEngineering.resources.map(({ id }) => id));
  const interviewIds = new Set(backendEngineering.interviewQuestions.map(({ id }) => id));
  const usedResourceIds = new Set();
  const noteUsedResourceIds = new Set();
  const referencedInterviewIds = [];

  for (const lesson of backendEngineering.lessons) {
    for (const id of lesson.resourceIds) {
      assert.ok(resourceIds.has(id), `${lesson.id}: unknown resource ${id}`);
      usedResourceIds.add(id);
    }
    for (const id of lesson.knowledgeNote.sections.flatMap(({ sourceIds }) => sourceIds)) {
      noteUsedResourceIds.add(id);
    }
    for (const id of lesson.interviewQuestionIds) {
      assert.ok(interviewIds.has(id), `${lesson.id}: unknown interview ${id}`);
      referencedInterviewIds.push(id);
    }
  }
  assert.deepEqual(usedResourceIds, resourceIds, '37 项资源都应被至少一课使用');
  assert.deepEqual(noteUsedResourceIds, resourceIds, '37 项资源都应被至少一篇笔记直接使用');
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
    assert.ok(note.tests, `${lesson.id}: missing tests audit`);
    assert.deepEqual(
      Object.keys(note.tests).sort(),
      ['status', 'commands', 'results'].sort(),
      `${lesson.id}: tests audit fields`,
    );
    assert.equal(note.tests.status, 'passed', lesson.id);
    assert.deepEqual(
      note.tests.commands,
      ['node --test tests/backend-engineering-data.test.js', 'npm test'],
      lesson.id,
    );
    assert.equal(note.tests.results.length, note.tests.commands.length, lesson.id);
    for (const result of note.tests.results) {
      assert.deepEqual(
        Object.keys(result).sort(),
        ['command', 'exitCode', 'summary'].sort(),
        `${lesson.id}: test result fields`,
      );
      assert.ok(note.tests.commands.includes(result.command), `${lesson.id}: ${result.command}`);
      assert.equal(result.exitCode, 0, `${lesson.id}: ${result.command}`);
      assert.match(result.summary, /通过|pass/i, `${lesson.id}: ${result.command}`);
    }
    assertUnique(note.tests.results.map(({ command }) => command), `${lesson.id}: test results`);
  }
  assertDeepFrozen(backendEngineeringNotes, 'backendEngineeringNotes');
});

test('coverage matrix resolves every assessed field to a real section and evidence source', () => {
  const resourcesById = new Map(backendEngineering.resources.map((resource) => [resource.id, resource]));
  assert.ok(backendEngineering.coverageMatrix, 'missing coverageMatrix');
  assert.deepEqual(Object.keys(backendEngineering.coverageMatrix), lessonIds);

  for (const lesson of backendEngineering.lessons) {
    const entries = backendEngineering.coverageMatrix[lesson.id];
    const expectedPaths = assessmentFields.flatMap(([field, count]) =>
      Array.from({ length: count }, (_, index) => `${field}[${index}]`));
    assert.deepEqual(entries.map(({ fieldPath }) => fieldPath).sort(), expectedPaths.sort(), lesson.id);
    assertUnique(entries.map(({ fieldPath }) => fieldPath), `${lesson.id}: coverage paths`);

    const noteSections = new Map(lesson.knowledgeNote.sections.map((section) => [section.id, section]));
    for (const entry of entries) {
      const assessedValue = resolveAssessmentField(lesson, entry.fieldPath);
      assert.ok(assessedValue, `${lesson.id}:${entry.fieldPath}`);
      const section = noteSections.get(entry.sectionId);
      assert.ok(section, `${lesson.id}:${entry.fieldPath}: unknown section ${entry.sectionId}`);
      assert.ok(entry.sourceIds.length >= 1, `${lesson.id}:${entry.fieldPath}: sourceIds`);
      for (const sourceId of entry.sourceIds) {
        assert.ok(section.sourceIds.includes(sourceId),
          `${lesson.id}:${entry.fieldPath}: ${sourceId} must ground ${entry.sectionId}`);
        assert.ok(lesson.resourceIds.includes(sourceId),
          `${lesson.id}:${entry.fieldPath}: ${sourceId} must belong to lesson`);
        assert.ok(resourcesById.has(sourceId),
          `${lesson.id}:${entry.fieldPath}: unknown source ${sourceId}`);
      }
      assert.ok(entry.sourceIds.some((id) => resourcesById.get(id).evidence.role !== 'extension'),
        `${lesson.id}:${entry.fieldPath}: assessed fields cannot use extension-only evidence`);
    }
  }
});

test('coverage matrix binds central claims to matching primary evidence', () => {
  assert.ok(backendEngineering.coverageMatrix, 'missing coverageMatrix');
  const rules = [
    {
      lessonId: 'backend-01',
      fieldPath: 'interviewQuestionIds[2]',
      claim: /幂等|idempot/i,
      sourceIds: ['res-backend-aws-idempotent-apis'],
    },
    {
      lessonId: 'backend-03',
      fieldPath: 'objectives[0]',
      claim: /Little|L\s*=\s*λW/i,
      sourceIds: ['res-backend-little-law'],
    },
    {
      lessonId: 'backend-03',
      fieldPath: 'exercise.steps[0]',
      claim: /到达率|并发|负载/,
      sourceIds: ['res-backend-coordinated-omission'],
    },
    {
      lessonId: 'backend-04',
      fieldPath: 'completionCriteria[1]',
      claim: /崩溃|恢复|对账/,
      sourceIds: ['res-backend-chubby'],
    },
    {
      lessonId: 'backend-05',
      fieldPath: 'exercise.steps[0]',
      claim: /singleflight|并发.*回源/i,
      sourceIds: ['res-backend-go-singleflight'],
    },
    {
      lessonId: 'backend-06',
      fieldPath: 'objectives[0]',
      claim: /幂等/,
      sourceIds: ['res-backend-aws-idempotent-apis'],
    },
    {
      lessonId: 'backend-06',
      fieldPath: 'interviewQuestionIds[2]',
      claim: /outbox/i,
      sourceIds: ['res-backend-aws-transactional-outbox'],
    },
    {
      lessonId: 'backend-08',
      fieldPath: 'objectives[0]',
      claim: /负载测试|TTFT|尾延迟/,
      sourceIds: ['res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'],
    },
    {
      lessonId: 'backend-08',
      fieldPath: 'objectives[1]',
      claim: /部署|发布|扩展/,
      sourceIds: ['res-backend-docker-build-best-practices'],
    },
  ];

  for (const rule of rules) {
    const lesson = backendEngineering.lessons.find(({ id }) => id === rule.lessonId);
    const entry = backendEngineering.coverageMatrix[rule.lessonId]
      .find(({ fieldPath }) => fieldPath === rule.fieldPath);
    assert.ok(entry, `${rule.lessonId}:${rule.fieldPath}`);
    assert.match(JSON.stringify(resolveAssessmentField(lesson, rule.fieldPath)), rule.claim);
    for (const sourceId of rule.sourceIds) {
      assert.ok(entry.sourceIds.includes(sourceId),
        `${rule.lessonId}:${rule.fieldPath} must use matching evidence ${sourceId}`);
    }
  }
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
