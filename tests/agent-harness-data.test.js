import test from 'node:test';
import assert from 'node:assert/strict';

import { agentHarness } from '../src/data/agent-harness.js';

const lessonIds = Array.from({ length: 8 }, (_, index) =>
  `harness-${String(index + 1).padStart(2, '0')}`,
);

const lessonTitles = [
  'Harness 与宿主 Runner',
  'Run State、Event Log 与 Checkpoint',
  '工具注册、权限与人工审批',
  'Sandbox、隔离与资源边界',
  'Budget、Timeout、Retry 与 Cancel',
  '幂等副作用与安全 Resume',
  '并发、队列与背压',
  'Blocked、HITL、Handoff 与运行产物',
];

const noteExpectations = new Map([
  ['harness-01', { minMinutes: 30, maxMinutes: 35, minLength: 4200 }],
  ['harness-02', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['harness-03', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['harness-04', { minMinutes: 35, maxMinutes: 45, minLength: 5000 }],
  ['harness-05', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['harness-06', { minMinutes: 40, maxMinutes: 45, minLength: 5200 }],
  ['harness-07', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['harness-08', { minMinutes: 35, maxMinutes: 45, minLength: 5000 }],
]);
const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validEvidenceRoles = new Set(['core', 'cross-check', 'extension']);

const resourceUrls = [
  'https://openai.github.io/openai-agents-python/running_agents/',
  'https://developers.openai.com/api/docs/guides/agents/sandboxes',
  'https://openai.github.io/openai-agents-python/human_in_the_loop/',
  'https://openai.github.io/openai-agents-python/tools/',
  'https://openai.github.io/openai-agents-python/ref/run_state/',
  'https://docs.langchain.com/oss/python/langgraph/persistence',
  'https://docs.langchain.com/oss/python/langgraph/interrupts',
  'https://docs.langchain.com/oss/python/langgraph/fault-tolerance',
  'https://docs.temporal.io/workflow-execution',
  'https://docs.temporal.io/workflow-execution/event',
  'https://docs.temporal.io/encyclopedia/retry-policies',
  'https://learn.microsoft.com/en-us/azure/durable-task/common/programming-model-overview',
  'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
  'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/',
  'https://sre.google/sre-book/addressing-cascading-failures/',
  'https://sre.google/sre-book/handling-overload/',
  'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html',
  'https://gvisor.dev/docs/architecture_guide/intro/',
  'https://docs.docker.com/engine/security/seccomp/',
  'https://docs.docker.com/engine/containers/resource_constraints/',
  'https://docs.docker.com/engine/security/rootless/',
  'https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md',
  'https://www.nist.gov/news-events/news/2025/08/lessons-learned-consortium-tool-use-agent-systems',
  'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/',
  'https://github.com/datawhalechina/Agent-Learning-Hub',
  'https://github.com/agentscope-ai/agentscope-runtime',
  'https://huggingface.co/learn/agents-course/zh-CN/unit2/smolagents/code_agents',
  'https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter6/%E7%AC%AC%E5%85%AD%E7%AB%A0%20%E6%A1%86%E6%9E%B6%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5.md',
  'https://jingxuan.douyin.com/m/video/7646732508339457334',
];

const interviewTitles = [
  'Agent Harness 与 Agent 本身有什么区别？',
  '请设计一个 Agent run 的生命周期状态机。',
  'Runner 的 lifecycle hooks 应如何设计？',
  'Run state、event log、checkpoint 有什么区别？',
  'Checkpoint 应该多频繁保存？',
  '进程重启后怎样安全恢复一个 run？',
  '如何设计工具注册表？',
  '认证、授权和人工审批分别解决什么？',
  '为什么审批后还要重新验证工具调用？',
  'Container 与 sandbox 是一回事吗？',
  '如何给代码执行 Agent 做最小权限设计？',
  'Sandbox 的资源预算怎么设置？',
  'Timeout、deadline 和 cancellation 有何区别？',
  '哪些错误应该重试？',
  '如何设计运行预算？',
  '什么是幂等，Agent 为什么特别需要它？',
  '副作用成功但 checkpoint 失败，怎样恢复？',
  '能否保证 exactly-once 工具执行？',
  '并发与并行有什么区别，Agent Harness 为什么要限并发？',
  '怎样用队列运行长任务？',
  '什么是背压，队列满了怎么办？',
  'Blocked、failed、cancelled 应如何区分？',
  '如何实现长时间人工审批的 pause/resume？',
  'Handoff bundle 和运行产物应包含什么？',
];

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

test('Agent Harness exposes eight ordered substantive lessons and sixteen quizzes', () => {
  assert.equal(agentHarness.id, 'agent-harness');
  assert.equal(agentHarness.title, 'Agent Harness');
  assert.equal(
    agentHarness.summary,
    '把 Agent loop 放进可约束、可暂停、可恢复并能安全处理副作用的宿主执行系统。',
  );
  assert.deepEqual(agentHarness.lessons.map(({ id }) => id), lessonIds);
  assert.deepEqual(agentHarness.lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(agentHarness.lessons.map(({ title }) => title), lessonTitles);
  assert.equal(agentHarness.lessons.flatMap(({ quiz }) => quiz).length, 16);

  for (const lesson of agentHarness.lessons) {
    assert.equal(lesson.moduleId, agentHarness.id, lesson.id);
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

test('every Harness lesson has a source-grounded long-form knowledge note', async () => {
  const { agentHarnessNotes } = await import('../src/data/agent-harness-notes.js');
  const resourcesById = new Map(agentHarness.resources.map((resource) => [resource.id, resource]));

  assert.deepEqual(Object.keys(agentHarnessNotes), lessonIds,
    '笔记注册表必须覆盖且只覆盖八节 Harness 课程');
  assert.deepEqual(
    agentHarness.lessons.filter((lesson) => lesson.knowledgeNote).map((lesson) => lesson.id),
    lessonIds,
    '八节 Harness 课程都必须提供 knowledgeNote',
  );
  assert.equal(new Set(Object.values(agentHarnessNotes)).size, lessonIds.length,
    '每节 Harness 课程必须使用不同的 knowledgeNote 对象');

  for (const lesson of agentHarness.lessons) {
    const expectation = noteExpectations.get(lesson.id);
    const note = lesson.knowledgeNote;
    assert.ok(expectation, `${lesson.id}: 必须有知识笔记发布要求`);
    assert.ok(note, `${lesson.id}: 必须提供 knowledgeNote`);
    assert.equal(note, agentHarnessNotes[lesson.id],
      `${lesson.id}: knowledgeNote 必须引用注册表中的同一对象`);
    assert.ok(typeof note.introduction === 'string' && note.introduction.trim().length > 0,
      `${lesson.id}: introduction 不能为空`);
    assert.ok(typeof note.nextStep === 'string' && note.nextStep.trim().length > 0,
      `${lesson.id}: nextStep 不能为空`);
    assert.ok(Array.isArray(note.sections), `${lesson.id}: sections 必须为数组`);

    const sectionIds = note.sections.map(({ id }) => id);
    const bodyLength = [
      note.introduction,
      ...note.sections.flatMap(({ paragraphs }) => paragraphs),
      note.nextStep,
    ].reduce((total, value) => total + value.trim().length, 0);
    assert.ok(Number.isInteger(note.readingMinutes)
      && note.readingMinutes >= expectation.minMinutes
      && note.readingMinutes <= expectation.maxMinutes,
    `${lesson.id}: 阅读时长应为 ${expectation.minMinutes}–${expectation.maxMinutes} 分钟`);
    assert.ok(note.sections.length >= 5 && note.sections.length <= 7,
      `${lesson.id}: 应包含 5–7 个递进章节`);
    assertUnique(sectionIds, `${lesson.id}: knowledgeNote section id`);
    assert.ok(bodyLength >= expectation.minLength && bodyLength <= 9000,
      `${lesson.id}: 正文长度应为 ${expectation.minLength}–9000 字符，当前为 ${bodyLength}`);

    const lessonResourceIds = new Set(lesson.resourceIds);
    const lessonEvidenceIds = new Set(
      lesson.resourceIds.filter((id) => resourcesById.get(id)?.evidence),
    );
    for (const section of note.sections) {
      assert.match(section.id ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        `${lesson.id}: section id 必须为 kebab-case`);
      assert.ok(typeof section.title === 'string' && section.title.trim().length >= 4,
        `${lesson.id}:${section.id}: title 至少需要 4 个非空字符`);
      assert.ok(Array.isArray(section.paragraphs)
        && section.paragraphs.length >= 2 && section.paragraphs.length <= 4,
      `${lesson.id}:${section.id}: 需要 2–4 个正文段落`);
      assert.ok(section.paragraphs.every((paragraph) => (
        typeof paragraph === 'string' && paragraph.trim().length >= 60
      )), `${lesson.id}:${section.id}: 每个正文段落至少需要 60 个字符`);
      assert.ok(Array.isArray(section.keyPoints) && section.keyPoints.length >= 2,
        `${lesson.id}:${section.id}: 至少需要 2 个要点`);
      assert.ok(section.keyPoints.every((keyPoint) => (
        typeof keyPoint === 'string' && keyPoint.trim().length > 0
      )), `${lesson.id}:${section.id}: 每个要点必须是非空字符串`);
      assert.ok(Array.isArray(section.sourceIds) && section.sourceIds.length >= 1,
        `${lesson.id}:${section.id}: 至少需要 1 个来源`);
      assert.ok(section.sourceIds.every((id) => resourcesById.has(id)),
        `${lesson.id}:${section.id}: sourceIds 必须全部存在于全局资源库`);
      assert.ok(section.sourceIds.every((id) => lessonResourceIds.has(id)),
        `${lesson.id}:${section.id}: sourceIds 必须全部属于 lesson.resourceIds`);
      assert.ok(section.sourceIds.every((id) => lessonEvidenceIds.has(id)),
        `${lesson.id}:${section.id}: sourceIds 必须全部属于当前 lesson 的有效 evidence set`);
    }
    assert.ok(Array.isArray(note.misconceptions)
      && note.misconceptions.length >= 4 && note.misconceptions.length <= 6,
    `${lesson.id}: 需要 4–6 个常见误区`);
    assert.ok(note.misconceptions.every((misconception) => (
      typeof misconception?.claim === 'string' && misconception.claim.trim().length > 0
      && typeof misconception.correction === 'string' && misconception.correction.trim().length > 0
    )), `${lesson.id}: 每个误区必须具有非空 claim 和 correction`);
    assert.ok(Array.isArray(note.recap) && note.recap.length >= 5,
      `${lesson.id}: recap 至少需要 5 个回顾要点`);
    assert.ok(note.recap.every((item) => typeof item === 'string' && item.trim().length > 0),
      `${lesson.id}: 每个 recap 项必须是非空字符串`);
  }

  assertDeepFrozen(agentHarnessNotes, 'agentHarnessNotes');
});

test('all 29 Harness resources provide complete evidence cards', () => {
  assert.equal(agentHarness.resources.length, 29, 'Harness 课程必须维护 29 份最终资源');
  for (const resource of agentHarness.resources) {
    const { evidence } = resource;
    assert.ok(evidence, `${resource.id}: 必须提供 evidence 来源卡`);
    assert.ok(validAuthorities.has(evidence.authority), `${resource.id}: evidence.authority 值无效`);
    assert.ok(validEvidenceRoles.has(evidence.role), `${resource.id}: evidence.role 值无效`);
    assert.ok(Array.isArray(evidence.coverage) && evidence.coverage.length >= 1,
      `${resource.id}: evidence.coverage 不能为空`);
    assert.ok(evidence.coverage.every((item) => typeof item === 'string' && item.trim().length > 0),
      `${resource.id}: evidence.coverage 必须只包含非空字符串`);
    assert.ok(typeof evidence.limitations === 'string' && evidence.limitations.trim().length >= 15,
      `${resource.id}: evidence.limitations 至少需要 15 个字符`);
    assert.equal(evidence.verifiedAt, '2026-07-23',
      `${resource.id}: 必须记录本轮正文或元数据核验日期`);
    assertDeepFrozen(evidence, `${resource.id}.evidence`);
  }

  const byId = new Map(agentHarness.resources.map((resource) => [resource.id, resource]));
  assert.equal(byId.get('res-harness-openai-sandboxes').evidence.role, 'core');
  assert.match(byId.get('res-harness-openai-sandboxes').evidence.coverage.join(' '),
    /控制面|control plane.*执行面|compute/i);
  assert.equal(byId.get('res-harness-aws-sqs-visibility').evidence.role, 'core');
  assert.match(byId.get('res-harness-aws-sqs-visibility').evidence.coverage.join(' '),
    /visibility|不可见.*删除|delete.*redelivery|重新可见/i);
  assert.equal(byId.has('res-harness-bilibili'), false,
    '标题、作者、简介和正文均无法核验的 Bilibili 候选不得留在正式 registry');

  const douyin = byId.get('res-harness-douyin');
  assert.equal(douyin.title, '十分钟拆解Agent Skill如何让AI稳定执行任务');
  assert.equal(douyin.source, '老傅1024');
  assert.equal(douyin.evidence.authority, 'community');
  assert.equal(douyin.evidence.role, 'extension');
  assert.match(douyin.evidence.coverage.join(' '), /标题|作者|日期|时长|简介|元数据/);
  assert.match(douyin.evidence.limitations, /字幕|正文/);
});

test('the lifecycle lesson uses the complete normative run state vocabulary', () => {
  const lifecycleLesson = agentHarness.lessons[0];
  const lifecycleCopy = JSON.stringify(lifecycleLesson.explanations);
  const requiredStates = [
    'created',
    'queued',
    'running',
    'awaiting_approval',
    'retry_wait',
    'blocked',
    'succeeded',
    'failed',
    'cancelled',
    'timed_out',
  ];

  for (const state of requiredStates) assert.match(lifecycleCopy, new RegExp(`\\b${state}\\b`), state);
  assert.doesNotMatch(lifecycleCopy, /\b(?:paused|completed)\b/);
});

test('only lessons one, six and seven map the specified experiments', () => {
  assert.deepEqual(
    agentHarness.lessons
      .filter(({ exercise }) => exercise.experiment)
      .map(({ id, exercise }) => [id, exercise.experiment]),
    [
      ['harness-01', 'run-lifecycle'],
      ['harness-06', 'retry-resume'],
      ['harness-07', 'queue-backpressure'],
    ],
  );
});

test('resources are the exact 29 verified HTTPS entries with complete metadata', () => {
  assert.equal(agentHarness.resources.length, 29);
  assert.deepEqual(agentHarness.resources.map(({ url }) => url), resourceUrls);
  for (const resource of agentHarness.resources) {
    assert.match(resource.id, /^res-harness-/);
    assert.match(resource.url, /^https:\/\//, resource.id);
    assert.equal(resource.verifiedAt, '2026-07-23', resource.id);
    for (const field of ['id', 'title', 'url', 'source', 'language', 'type', 'difficulty', 'stage', 'value']) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
    if (resource.type.includes('视频')) assert.ok(resource.platform, `${resource.id}: platform`);
  }
});

test('every resource states both its learning use and the evidence boundary for its source class', () => {
  const byId = new Map(agentHarness.resources.map((resource) => [resource.id, resource]));
  for (const resource of agentHarness.resources) {
    assert.match(resource.value, /学习用途[：:]/, `${resource.id}: learning use`);
    assert.match(resource.value, /证据边界[：:]/, `${resource.id}: evidence boundary`);
  }

  for (const id of [
    'res-harness-openai-running',
    'res-harness-openai-sandboxes',
    'res-harness-openai-hitl',
    'res-harness-openai-tools',
    'res-harness-openai-run-state',
  ]) {
    assert.match(byId.get(id).value, /当前.*SDK.*实现语义.*不(?:是|代表).*跨框架标准/i, id);
  }
  for (const id of [
    'res-harness-langgraph-persistence',
    'res-harness-langgraph-interrupts',
    'res-harness-langgraph-fault-tolerance',
  ]) {
    assert.match(byId.get(id).value, /具体.*(?:checkpoint|replay).*语义.*不可外推/i, id);
  }
  for (const id of [
    'res-harness-temporal-execution',
    'res-harness-temporal-event',
    'res-harness-temporal-retry',
    'res-harness-azure-durable',
  ]) {
    assert.match(byId.get(id).value, /不保证.*外部副作用.*exactly-once/i, id);
  }
  for (const id of [
    'res-harness-aws-idempotent',
    'res-harness-aws-timeouts',
    'res-harness-sre-cascading',
    'res-harness-sre-overload',
  ]) {
    assert.match(byId.get(id).value, /工程经验.*不(?:是|构成).*普适定律/, id);
  }
  for (const id of [
    'res-harness-gvisor',
    'res-harness-docker-seccomp',
    'res-harness-docker-resources',
    'res-harness-docker-rootless',
    'res-harness-firecracker',
    'res-harness-nist-tool-use',
    'res-harness-owasp-agency',
  ]) {
    assert.match(byId.get(id).value, /(?:机制边界|安全原则).*不证明.*具体配置.*绝对安全/, id);
  }
  for (const id of [
    'res-harness-agent-learning-hub',
    'res-harness-agentscope-runtime',
    'res-harness-smolagents-code',
    'res-harness-hello-agents-framework',
    'res-harness-douyin',
  ]) {
    assert.match(byId.get(id).value, /(?:学习导航|演示).*不承担.*可靠性.*安全性.*结论/, id);
  }
  assert.match(byId.get('res-harness-aws-sqs-visibility').value,
    /Amazon SQS.*具体实现语义.*不(?:是|代表).*统一协议.*不保证.*exactly-once/i);
});

test('lesson references resolve resources and interviews in both directions', () => {
  const resources = new Set(agentHarness.resources.map(({ id }) => id));
  const referencedResources = new Set(agentHarness.lessons.flatMap(({ resourceIds }) => resourceIds));
  const interviews = new Map(agentHarness.interviewQuestions.map((item) => [item.id, item]));
  const referencedInterviews = new Set(
    agentHarness.lessons.flatMap(({ interviewQuestionIds }) => interviewQuestionIds),
  );

  for (const lesson of agentHarness.lessons) {
    assert.ok(lesson.resourceIds.every((id) => resources.has(id)), lesson.id);
    assert.ok(lesson.interviewQuestionIds.every((id) => interviews.has(id)), lesson.id);
    assert.ok(
      lesson.interviewQuestionIds.every((id) => interviews.get(id).lessonId === lesson.id),
      `${lesson.id}: interview ownership`,
    );
  }
  assert.ok(agentHarness.resources.every(({ id }) => referencedResources.has(id)));
  assert.ok(agentHarness.interviewQuestions.every(({ id }) => referencedInterviews.has(id)));
});

test('interview bank contains exactly three complete questions for every lesson', () => {
  const validRoles = new Set(['Agent 开发', 'AI 应用', '后端工程']);
  const validFrequencies = new Set(['高', '中', '补充']);
  const validDifficulties = new Set(['基础', '进阶', '深挖']);
  const expectedIds = lessonIds.flatMap((lessonId) =>
    [1, 2, 3].map((number) => `iq-${lessonId}-${number}`),
  );
  assert.equal(agentHarness.interviewQuestions.length, 24);
  assert.deepEqual(agentHarness.interviewQuestions.map(({ id }) => id), expectedIds);
  assert.deepEqual(agentHarness.interviewQuestions.map(({ question }) => question), interviewTitles);

  for (const lessonId of lessonIds) {
    assert.equal(agentHarness.interviewQuestions.filter(({ lessonId: id }) => id === lessonId).length, 3);
  }
  for (const item of agentHarness.interviewQuestions) {
    assert.ok(item.shortAnswer.length >= 20, item.id);
    assert.ok(item.deepDive.length >= 2, item.id);
    assert.ok(item.misconceptions.length >= 1, item.id);
    assert.ok(item.followUps.length >= 1, item.id);
    assert.ok(item.deepDive.every((point) => point.length >= 15), `${item.id}: deepDive`);
    assert.ok(item.misconceptions.every((point) => point.length >= 10), `${item.id}: misconceptions`);
    assert.ok(item.followUps.every((point) => point.length >= 8), `${item.id}: followUps`);
    assert.ok(validFrequencies.has(item.frequency), `${item.id}: frequency`);
    assert.ok(validDifficulties.has(item.difficulty), `${item.id}: difficulty`);
    assert.ok(item.roles.length >= 1, item.id);
    assert.ok(item.roles.every((role) => validRoles.has(role)), `${item.id}: roles`);
  }
});

test('the curriculum preserves the five required factual boundaries', () => {
  const copy = JSON.stringify(agentHarness);
  assert.match(copy, /Checkpoint.*不(?:等于|是).*长期.*[Mm]emory|checkpoint.*不(?:等于|是).*长期.*memory/);
  assert.match(copy, /durable execution.*不(?:等于|保证).*exactly-once/i);
  assert.match(copy, /timeout.*不(?:等于|代表).*cancel.*rollback/i);
  assert.match(copy, /container.*不(?:等于|是).*绝对安全.*sandbox/i);
  assert.match(copy, /prompt.*guardrail.*不(?:等于|是).*宿主.*授权/i);
});

test('all lesson, resource, quiz and interview identifiers are globally unique', () => {
  const lessons = agentHarness.lessons.map(({ id }) => id);
  const resources = agentHarness.resources.map(({ id }) => id);
  const quizzes = agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id));
  const interviews = agentHarness.interviewQuestions.map(({ id }) => id);
  assertUnique(lessons, 'lesson ids');
  assertUnique(resources, 'resource ids');
  assertUnique(quizzes, 'quiz ids');
  assertUnique(interviews, 'interview ids');
  assertUnique([...lessons, ...resources, ...quizzes, ...interviews], 'global ids');
});

test('Agent Harness recursively freezes every lesson, resource and interview value', () => {
  const snapshot = structuredClone(agentHarness);
  const visited = new Set();
  const assertDeepFrozen = (value, path) => {
    if (value === null || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    assert.equal(Object.isFrozen(value), true, path);
    for (const [key, nested] of Object.entries(value)) assertDeepFrozen(nested, `${path}.${key}`);
  };

  assertDeepFrozen(agentHarness, 'agentHarness');
  assert.throws(() => { agentHarness.title = 'changed'; }, TypeError);
  assert.throws(() => { agentHarness.lessons.push({}); }, TypeError);
  assert.throws(() => { agentHarness.resources.push({}); }, TypeError);
  assert.throws(() => { agentHarness.interviewQuestions.push({}); }, TypeError);

  for (const lesson of agentHarness.lessons) {
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
  for (const resource of agentHarness.resources) {
    assert.throws(() => { resource.value = 'changed'; }, TypeError, resource.id);
  }
  for (const item of agentHarness.interviewQuestions) {
    assert.throws(() => { item.shortAnswer = 'changed'; }, TypeError, item.id);
    for (const field of ['deepDive', 'misconceptions', 'followUps', 'roles']) {
      assert.throws(() => { item[field].push('changed'); }, TypeError, `${item.id}.${field}`);
    }
  }
  assert.deepEqual(agentHarness, snapshot);
});
