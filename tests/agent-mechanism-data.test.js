import test from 'node:test';
import assert from 'node:assert/strict';

import { resourcePlatform } from '../src/core/filters.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';

const expectedLessonIds = Array.from({ length: 8 }, (_, index) =>
  `agent-${String(index + 1).padStart(2, '0')}`,
);

const expectedLessonTitles = [
  'Agent、Workflow 与普通 LLM 应用',
  '目标、约束与任务状态',
  '工具调用与 Agent–Computer Interface',
  'Agent Loop 与 ReAct',
  '规划、任务分解与重规划',
  '失败恢复、反思与外部验证',
  '上下文与工作记忆',
  '单 Agent 综合设计与面试压力测试',
];

const expectedResourceUrls = new Map([
  ['res-agent-anthropic-effective', 'https://www.anthropic.com/engineering/building-effective-agents'],
  ['res-agent-openai-guide', 'https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/'],
  ['res-agent-berkeley-course', 'https://llmagents-learning.org/f24'],
  ['res-agent-hf-course', 'https://github.com/huggingface/agents-course'],
  ['res-agent-ms-course', 'https://github.com/microsoft/ai-agents-for-beginners'],
  ['res-agent-hello-agents', 'https://github.com/datawhalechina/hello-agents'],
  ['res-agent-dlai-agentic', 'https://www.deeplearning.ai/courses/agentic-ai'],
  ['res-agent-lilian-weng', 'https://lilianweng.github.io/posts/2023-06-23-agent/'],
  ['res-agent-lihongyi', 'https://www.youtube.com/watch?v=M2Yg1kwPpts'],
  ['res-agent-datawhale-bili', 'https://www.bilibili.com/video/BV1Sb421E74u/'],
  ['res-agent-disney-planner-bili', 'https://www.bilibili.com/video/BV1ix4y117zo/'],
  ['res-agent-ms-tool-video', 'https://www.youtube.com/watch?v=vieRiPRx-gI'],
  ['res-agent-ms-plan-video', 'https://www.youtube.com/watch?v=kPfJ2BrBCMY'],
  ['res-agent-react-paper', 'https://arxiv.org/abs/2210.03629'],
  ['res-agent-tot-paper', 'https://arxiv.org/abs/2305.10601'],
  ['res-agent-plan-solve', 'https://arxiv.org/abs/2305.04091'],
  ['res-agent-rewoo', 'https://arxiv.org/abs/2305.18323'],
  ['res-agent-toolformer', 'https://arxiv.org/abs/2302.04761'],
  ['res-agent-openai-function', 'https://developers.openai.com/api/docs/guides/function-calling'],
  ['res-agent-anthropic-tools', 'https://www.anthropic.com/engineering/writing-tools-for-agents'],
  ['res-agent-coala', 'https://arxiv.org/abs/2309.02427'],
  ['res-agent-reflexion', 'https://arxiv.org/abs/2303.11366'],
  ['res-agent-self-refine', 'https://arxiv.org/abs/2303.17651'],
  ['res-agent-no-self-correct', 'https://arxiv.org/abs/2310.01798'],
  ['res-agent-critic', 'https://arxiv.org/abs/2305.11738'],
  ['res-agent-agentbench', 'https://arxiv.org/abs/2308.03688'],
  ['res-agent-tau-bench', 'https://arxiv.org/abs/2406.12045'],
  ['res-agent-douyin-claude-code', 'https://www.douyin.com/video/7529703060969508130'],
]);

const expectedInterviewQuestions = [
  'LLM、Agent、Workflow 有什么区别？',
  '什么时候不应该使用 Agent？',
  '最小 Agent 必须有哪些组成部分？',
  '怎样把模糊用户请求转成 Agent 可执行任务？',
  'Agent 如何判断任务完成？',
  '工作状态和聊天历史有什么区别？',
  'LLM 的 function calling 是怎么工作的？',
  '如何设计可靠的工具 schema？',
  '为什么工具返回结果必须带回模型？',
  '请手写一个最小 Agent loop。',
  'ReAct 与普通 chain-of-thought 有何区别？',
  'Agent 为什么会陷入无限工具调用？',
  'ReAct 和 plan-and-execute 如何选择？',
  '怎样判断任务分解是否合理？',
  '为什么不能让 Agent 永远遵循初始计划？',
  'Agent 的工具调用失败后应该怎么办？',
  'Reflection 真能提高 Agent 可靠吗？',
  '如何避免 Agent 反复执行同一失败动作？',
  'Agent 的 state、memory、context 有什么区别？',
  '上下文窗口快满时怎么处理？',
  '为什么要区分 Agent belief 和工具 observation？',
  '请设计一个能调用工具完成多步任务的 Agent。',
  '不用框架能否实现 Agent？框架提供了什么？',
  'Agent 机制与 Harness、RAG、MCP、多 Agent 的边界是什么？',
];

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} 不应重复`);
}

test('Agent mechanism contains eight ordered complete lessons', () => {
  assert.equal(agentMechanism.id, 'agent-mechanism');
  assert.equal(agentMechanism.title, 'Agent 机制');
  assert.match(agentMechanism.summary, /目标.*状态.*动作.*观察.*终止/);
  assert.deepEqual(agentMechanism.lessons.map(({ id }) => id), expectedLessonIds);
  assert.deepEqual(agentMechanism.lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(agentMechanism.lessons.map(({ title }) => title), expectedLessonTitles);

  for (const lesson of agentMechanism.lessons) {
    assert.equal(lesson.moduleId, agentMechanism.id, lesson.id);
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
    assert.equal(lesson.interviewQuestionIds.length, 3, lesson.id);
  }
});

test('only the three specified lessons expose interactive experiments', () => {
  const experiments = agentMechanism.lessons
    .filter((lesson) => lesson.experimentId)
    .map(({ id, experimentId }) => [id, experimentId]);
  assert.deepEqual(experiments, [
    ['agent-03', 'tool-contract'],
    ['agent-04', 'agent-loop'],
    ['agent-05', 'plan-recovery'],
  ]);
});

test('every quiz item has a valid answer and explanation', () => {
  for (const lesson of agentMechanism.lessons) {
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

test('course has exactly 28 fixed, fully described and platform-resolvable resources', () => {
  assert.equal(agentMechanism.resources.length, 28);
  assert.deepEqual(
    new Map(agentMechanism.resources.map(({ id, url }) => [id, url])),
    expectedResourceUrls,
  );

  for (const resource of agentMechanism.resources) {
    assert.match(resource.url, /^https:\/\//, resource.id);
    assert.equal(resource.verifiedAt, '2026-07-20', resource.id);
    for (const field of ['id', 'title', 'source', 'language', 'type', 'difficulty', 'stage', 'value']) {
      assert.ok(resource[field], `${resource.id}: ${field}`);
    }
    assert.ok(resourcePlatform(resource), `${resource.id}: platform`);
  }

  const byId = new Map(agentMechanism.resources.map((resource) => [resource.id, resource]));
  assert.equal(resourcePlatform(byId.get('res-agent-hf-course')), 'GitHub');
  assert.equal(resourcePlatform(byId.get('res-agent-lihongyi')), 'YouTube');
  assert.equal(resourcePlatform(byId.get('res-agent-datawhale-bili')), 'Bilibili');
  assert.equal(resourcePlatform(byId.get('res-agent-react-paper')), 'arXiv');
  assert.equal(resourcePlatform(byId.get('res-agent-douyin-claude-code')), '抖音');
  assert.match(byId.get('res-agent-douyin-claude-code').value, /仅作.*实作补充.*不作为机制事实依据/);

  for (const resource of agentMechanism.resources.filter(({ type }) => type === '论文')) {
    assert.match(resource.value, /论文在其评测设定中/);
  }
  for (const id of ['res-agent-anthropic-effective', 'res-agent-openai-guide', 'res-agent-anthropic-tools']) {
    assert.match(byId.get(id).value, /工程经验/);
  }
  assert.match(byId.get('res-agent-openai-function').value, /API.*语义/);
  assert.ok(agentMechanism.resources.some(({ type }) => type.includes('官方课程')));
  assert.ok(agentMechanism.resources.some(({ type }) => type.includes('社区补充')));
});

test('lesson references resolve to all resources and interviews in both directions', () => {
  const resourceIds = new Set(agentMechanism.resources.map(({ id }) => id));
  const referencedResourceIds = new Set(agentMechanism.lessons.flatMap(({ resourceIds: ids }) => ids));
  const interviewById = new Map(agentMechanism.interviewQuestions.map((question) => [question.id, question]));
  const referencedInterviewIds = new Set(
    agentMechanism.lessons.flatMap(({ interviewQuestionIds }) => interviewQuestionIds),
  );

  for (const lesson of agentMechanism.lessons) {
    assert.ok(lesson.resourceIds.length >= 2, lesson.id);
    assert.ok(lesson.resourceIds.every((id) => resourceIds.has(id)), lesson.id);
    assert.ok(lesson.interviewQuestionIds.every((id) => interviewById.has(id)), lesson.id);
    assert.ok(
      lesson.interviewQuestionIds.every((id) => interviewById.get(id).lessonId === lesson.id),
      `${lesson.id}: interview ownership`,
    );
  }
  assert.ok(agentMechanism.resources.every(({ id }) => referencedResourceIds.has(id)));
  assert.ok(agentMechanism.interviewQuestions.every(({ id }) => referencedInterviewIds.has(id)));
});

test('interview bank has exactly three substantive questions per lesson', () => {
  const validRoles = new Set(['Agent 开发', 'AI 应用', '后端工程']);
  const validFrequencies = new Set(['高', '中', '补充']);
  const validDifficulties = new Set(['基础', '进阶', '深挖']);
  const expectedIds = expectedLessonIds.flatMap((lessonId) => {
    const lessonNumber = lessonId.slice(-2);
    return [1, 2, 3].map((number) => `iq-agent-${lessonNumber}-${number}`);
  });

  assert.equal(agentMechanism.interviewQuestions.length, 24);
  assert.deepEqual(agentMechanism.interviewQuestions.map(({ id }) => id), expectedIds);
  assert.deepEqual(agentMechanism.interviewQuestions.map(({ question }) => question), expectedInterviewQuestions);

  for (const lessonId of expectedLessonIds) {
    assert.equal(
      agentMechanism.interviewQuestions.filter(({ lessonId: owner }) => owner === lessonId).length,
      3,
      lessonId,
    );
  }
  for (const question of agentMechanism.interviewQuestions) {
    assert.ok(expectedLessonIds.includes(question.lessonId), question.id);
    assert.ok(question.shortAnswer.length > 20, question.id);
    assert.match(question.shortAnswer, /^判断标准/, question.id);
    assert.ok(question.deepDive.length >= 2, question.id);
    assert.ok(question.deepDive.every((point) => point.length >= 15), question.id);
    assert.ok(question.misconceptions.length >= 1, question.id);
    assert.ok(question.misconceptions.every((item) => item.length >= 10), question.id);
    assert.ok(question.followUps.length >= 1, question.id);
    assert.ok(question.followUps.every((item) => item.length >= 8), question.id);
    assert.ok(question.roles.length >= 1, question.id);
    assert.ok(question.roles.every((role) => validRoles.has(role)), question.id);
    assert.ok(validFrequencies.has(question.frequency), question.id);
    assert.ok(validDifficulties.has(question.difficulty), question.id);
  }
});

test('all curriculum identifiers are unique within and across collections', () => {
  const lessonIds = agentMechanism.lessons.map(({ id }) => id);
  const resourceIds = agentMechanism.resources.map(({ id }) => id);
  const quizIds = agentMechanism.lessons.flatMap(({ quiz: items }) => items.map(({ id }) => id));
  const interviewIds = agentMechanism.interviewQuestions.map(({ id }) => id);
  assertUnique(lessonIds, 'lesson id');
  assertUnique(resourceIds, 'resource id');
  assertUnique(quizIds, 'quiz id');
  assertUnique(interviewIds, 'interview id');
  assertUnique([...lessonIds, ...resourceIds, ...quizIds, ...interviewIds], 'course id');
});
