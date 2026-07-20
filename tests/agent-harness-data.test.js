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

const resourceUrls = [
  'https://openai.github.io/openai-agents-python/running_agents/',
  'https://openai.github.io/openai-agents-python/human_in_the_loop/',
  'https://openai.github.io/openai-agents-python/tools/',
  'https://openai.github.io/openai-agents-python/ref/run_state/',
  'https://docs.langchain.com/oss/python/langgraph/persistence',
  'https://docs.langchain.com/oss/python/langgraph/interrupts',
  'https://docs.langchain.com/oss/python/langgraph/fault-tolerance',
  'https://docs.temporal.io/workflow-execution',
  'https://docs.temporal.io/workflow-execution/event',
  'https://docs.temporal.io/encyclopedia/retry-policies',
  'https://learn.microsoft.com/en-us/azure/azure-functions/durable/programming-model-overview',
  'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
  'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/',
  'https://sre.google/sre-book/addressing-cascading-failures/',
  'https://sre.google/sre-book/handling-overload/',
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
  'https://www.bilibili.com/video/BV1HfHgzuEPn/',
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

test('resources are the exact 28 verified HTTPS entries with complete metadata', () => {
  assert.equal(agentHarness.resources.length, 28);
  assert.deepEqual(agentHarness.resources.map(({ url }) => url), resourceUrls);
  for (const resource of agentHarness.resources) {
    assert.match(resource.id, /^res-harness-/);
    assert.match(resource.url, /^https:\/\//, resource.id);
    assert.equal(resource.verifiedAt, '2026-07-20', resource.id);
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
    'res-harness-bilibili',
    'res-harness-douyin',
  ]) {
    assert.match(byId.get(id).value, /(?:学习导航|演示).*不承担.*可靠性.*安全性.*结论/, id);
  }
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
