import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { resourcePlatform } from '../src/core/filters.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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

const agentNoteExpectations = new Map([
  ['agent-01', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['agent-02', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['agent-03', { minMinutes: 30, maxMinutes: 40, minLength: 4500 }],
  ['agent-04', { minMinutes: 30, maxMinutes: 40, minLength: 4500 }],
  ['agent-05', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['agent-06', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['agent-07', { minMinutes: 30, maxMinutes: 35, minLength: 4200 }],
  ['agent-08', { minMinutes: 35, maxMinutes: 40, minLength: 5000 }],
]);
const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validEvidenceRoles = new Set(['core', 'cross-check', 'extension']);

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
  ['res-agent-datawhale-bili', 'https://www.bilibili.com/video/BV17i421Y7L6/'],
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

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: 公开课程数据及其嵌套结构必须被冻结`);
  for (const [key, nestedValue] of Object.entries(value)) {
    assertDeepFrozen(nestedValue, `${label}.${key}`, seen);
  }
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

test('every Agent mechanism lesson has a source-grounded long-form knowledge note', () => {
  const resourcesById = new Map(
    agentMechanism.resources.map((resource) => [resource.id, resource]),
  );
  assert.deepEqual(
    agentMechanism.lessons.filter((lesson) => lesson.knowledgeNote).map((lesson) => lesson.id),
    expectedLessonIds,
    '八节 Agent 课程都必须提供 knowledgeNote',
  );
  assert.equal(
    new Set(agentMechanism.lessons.map((lesson) => lesson.knowledgeNote)).size,
    expectedLessonIds.length,
    '每节 Agent 课程必须使用不同的 knowledgeNote 对象',
  );

  for (const lesson of agentMechanism.lessons) {
    const expectation = agentNoteExpectations.get(lesson.id);
    const note = lesson.knowledgeNote;
    assert.ok(expectation, `${lesson.id}: 必须有知识笔记发布要求`);
    assert.ok(note, `${lesson.id}: 必须提供 knowledgeNote`);
    assert.ok(typeof note.introduction === 'string' && note.introduction.trim().length > 0,
      `${lesson.id}: introduction 不能为空`);
    assert.ok(typeof note.nextStep === 'string' && note.nextStep.trim().length > 0,
      `${lesson.id}: nextStep 不能为空`);
    assert.ok(Array.isArray(note.sections), `${lesson.id}: sections 必须为数组`);

    const sectionIds = note.sections.map(({ id }) => id);
    const bodyLength = note.introduction.length
      + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length
      + note.nextStep.length;
    assert.ok(
      Number.isInteger(note.readingMinutes)
        && note.readingMinutes >= expectation.minMinutes
        && note.readingMinutes <= expectation.maxMinutes,
      `${lesson.id}: 阅读时长应为 ${expectation.minMinutes}–${expectation.maxMinutes} 分钟`,
    );
    assert.ok(note.sections.length >= 5 && note.sections.length <= 7,
      `${lesson.id}: 应包含 5–7 个递进章节`);
    assertUnique(sectionIds, `${lesson.id}: knowledgeNote section id`);
    assert.ok(bodyLength >= expectation.minLength && bodyLength <= 9000,
      `${lesson.id}: 正文长度应为 ${expectation.minLength}–9000 字符，当前为 ${bodyLength}`);

    const lessonResourceIds = new Set(lesson.resourceIds);
    for (const section of note.sections) {
      assert.match(section.id ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        `${lesson.id}: section id 必须为 kebab-case`);
      assert.ok(typeof section.title === 'string' && section.title.trim().length >= 4,
        `${lesson.id}:${section.id}: title 至少需要 4 个非空字符`);
      assert.ok(Array.isArray(section.paragraphs)
        && section.paragraphs.length >= 2 && section.paragraphs.length <= 4,
      `${lesson.id}:${section.id}: 需要 2–4 个正文段落`);
      assert.ok(section.paragraphs.every((paragraph) => (
        typeof paragraph === 'string' && paragraph.length >= 60
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
});

test('only the three specified lessons expose interactive experiments', () => {
  const experiments = agentMechanism.lessons
    .filter((lesson) => lesson.exercise.experiment)
    .map((lesson) => [lesson.id, lesson.exercise.experiment]);
  assert.deepEqual(experiments, [
    ['agent-03', 'tool-contract'],
    ['agent-04', 'agent-loop'],
    ['agent-05', 'plan-recovery'],
  ]);
  for (const lesson of agentMechanism.lessons) {
    assert.equal(Object.hasOwn(lesson, 'experimentId'), false, lesson.id);
    if (!['agent-03', 'agent-04', 'agent-05'].includes(lesson.id)) {
      assert.equal(lesson.exercise.experiment, undefined, lesson.id);
    }
  }
});

test('Agent course data is deeply frozen against representative mutations', () => {
  const lesson = agentMechanism.lessons[2];
  const explanation = lesson.explanations[0];
  const quizItem = lesson.quiz[0];
  const resource = agentMechanism.resources[0];
  const interview = agentMechanism.interviewQuestions[0];
  const representativeValues = [
    agentMechanism,
    agentMechanism.lessons,
    agentMechanism.resources,
    agentMechanism.interviewQuestions,
    lesson,
    lesson.objectives,
    lesson.explanations,
    explanation,
    explanation.keyPoints,
    lesson.exercise,
    lesson.exercise.steps,
    lesson.quiz,
    quizItem,
    quizItem.choices,
    resource,
    interview,
    interview.deepDive,
  ];
  for (const value of representativeValues) assert.equal(Object.isFrozen(value), true);

  for (const candidate of agentMechanism.resources) {
    assert.ok(candidate.evidence, `${candidate.id}: 冻结验证前必须提供 evidence`);
    assertDeepFrozen(candidate.evidence, `${candidate.id}.evidence`);
  }
  for (const candidate of agentMechanism.lessons) {
    assert.ok(candidate.knowledgeNote, `${candidate.id}: 冻结验证前必须提供 knowledgeNote`);
    assertDeepFrozen(candidate.knowledgeNote, `${candidate.id}.knowledgeNote`);
  }
  assertDeepFrozen(agentMechanism, 'agentMechanism');

  const snapshot = structuredClone(agentMechanism);
  assert.throws(() => { agentMechanism.title = '被篡改'; }, TypeError);
  assert.throws(() => { agentMechanism.lessons.push(lesson); }, TypeError);
  assert.throws(() => { lesson.exercise.steps[0] = '被篡改'; }, TypeError);
  assert.throws(() => { quizItem.choices.push('被篡改'); }, TypeError);
  assert.throws(() => { resource.title = '被篡改'; }, TypeError);
  assert.throws(() => { interview.deepDive.pop(); }, TypeError);
  assert.deepEqual(agentMechanism, snapshot);
});

test('tool contract exercise and release guide publish the same five validation scenarios', async () => {
  const lesson = agentMechanism.lessons.find(({ id }) => id === 'agent-03');
  const exerciseCopy = `${lesson.exercise.brief} ${lesson.exercise.steps.join(' ')} ${lesson.exercise.deliverable}`;
  const readme = await read('README.md');
  const guideLine = readme.split('\n').find((line) => line.includes('`tool-contract`')) ?? '';

  for (const copy of [exerciseCopy, guideLine]) {
    assert.match(copy, /五类/);
    assert.match(copy, /合法/);
    assert.match(copy, /缺(?:少|参)/);
    assert.match(copy, /枚举/);
    assert.match(copy, /额外字段/);
    assert.match(copy, /高风险|审批/);
  }
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
  const datawhaleAgentLesson = byId.get('res-agent-datawhale-bili');
  assert.equal(resourcePlatform(datawhaleAgentLesson), 'Bilibili');
  assert.equal(datawhaleAgentLesson.url, 'https://www.bilibili.com/video/BV17i421Y7L6/');
  assert.match(datawhaleAgentLesson.title, /Agent|大模型智能体/);
  assert.equal(datawhaleAgentLesson.source, '二次元的Datawhale');

  const lihongyiAgentLesson = byId.get('res-agent-lihongyi');
  assert.equal(
    lihongyiAgentLesson.title,
    '【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理 (AI如何透過經驗調整行為、使用工具和做計劃)',
  );
  assert.equal(lihongyiAgentLesson.source, 'Hung-yi Lee');

  const disneyPlanner = byId.get('res-agent-disney-planner-bili');
  assert.equal(disneyPlanner.title, '【AI智能体】十分钟手搓迪士尼排队规划Agent');
  assert.equal(disneyPlanner.source, '同济子豪兄');

  const microsoftToolLesson = byId.get('res-agent-ms-tool-video');
  assert.equal(microsoftToolLesson.title, 'What Is the Agent Tool Use Design Pattern?');
  assert.equal(microsoftToolLesson.source, 'Microsoft Developer');
  const microsoftPlanLesson = byId.get('res-agent-ms-plan-video');
  assert.equal(microsoftPlanLesson.title, 'What Is the AI Agent Planning Design Pattern?');
  assert.equal(microsoftPlanLesson.source, 'Microsoft Developer');
  assert.equal(resourcePlatform(byId.get('res-agent-react-paper')), 'arXiv');
  assert.equal(resourcePlatform(byId.get('res-agent-douyin-claude-code')), '抖音');
  assert.match(byId.get('res-agent-douyin-claude-code').value, /仅作.*实作补充.*不作为机制事实依据/);

  const coala = byId.get('res-agent-coala');
  assert.doesNotMatch(coala.value, /评测设定/);
  assert.match(coala.value, /概念架构|文献综述/);

  for (const resource of agentMechanism.resources.filter(
    ({ id, type }) => type === '论文' && id !== coala.id,
  )) {
    assert.match(resource.value, /论文在其评测设定中/);
  }
  for (const id of ['res-agent-anthropic-effective', 'res-agent-openai-guide', 'res-agent-anthropic-tools']) {
    assert.match(byId.get(id).value, /工程经验/);
  }
  assert.match(byId.get('res-agent-openai-function').value, /API.*语义/);
  assert.ok(agentMechanism.resources.some(({ type }) => type.includes('官方课程')));
  assert.ok(agentMechanism.resources.some(({ type }) => type.includes('社区补充')));
});

test('all 28 Agent resources provide complete evidence cards', () => {
  assert.equal(agentMechanism.resources.length, 28, 'Agent 课程必须维护 28 份资源');
  for (const resource of agentMechanism.resources) {
    const { evidence } = resource;
    assert.ok(evidence, `${resource.id}: 必须提供 evidence 来源卡`);
    assert.ok(validAuthorities.has(evidence.authority), `${resource.id}: evidence.authority 值无效`);
    assert.ok(validEvidenceRoles.has(evidence.role), `${resource.id}: evidence.role 值无效`);
    assert.ok(Array.isArray(evidence.coverage) && evidence.coverage.length >= 1,
      `${resource.id}: evidence.coverage 不能为空`);
    assert.ok(evidence.coverage.every((item) => typeof item === 'string' && item.trim().length > 0),
      `${resource.id}: evidence.coverage 必须只包含非空字符串`);
    assert.ok(typeof evidence.limitations === 'string' && evidence.limitations.length >= 15,
      `${resource.id}: evidence.limitations 至少需要 15 个字符`);
    assert.match(evidence.verifiedAt ?? '', /^2026-07-(20|21|22)$/,
      `${resource.id}: evidence.verifiedAt 必须是允许的真实核验日期`);
    assert.ok(evidence.verifiedAt <= '2026-07-22',
      `${resource.id}: evidence.verifiedAt 不得晚于发布日`);
  }
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
