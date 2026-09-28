import { deepFreeze } from '../multi-agent-shared.js';

export const ma02Lesson = deepFreeze({
  id: 'ma-02', moduleId: 'multi-agent-mcp', order: 2,
  title: '编排、委托与控制权',
  summary: '选择 manager 调用、handoff 与任务编排方式，并用固定时长验证依赖和共享写入约束。',
  durationMinutes: 28,
  objectives: ['根据回复责任选择 manager-as-tools 或 handoff，并明确工作边界', '复算固定任务的开始结束时间，解释依赖、worker 数量和教学模型限制'],
  concepts: ['回复责任', 'manager-as-tools', 'handoff', 'orchestrator-workers', '依赖调度', '共享写入', '后台任务状态'],
  explanations: [
    { heading: '调用形式之外还要追踪控制权', body: 'manager 调用 specialist 后继续综合结果，handoff 改变后续行为或当前分支的回复责任。不同框架的 handoff 定义范围不同，应明确实际状态和实现方式。', keyPoints: ['标明最终回复人', '工具触发不等于相同语义', '委托包含工作范围和结束条件'] },
    { heading: '执行名额受依赖与资源关系限制', body: '固定五任务模型中，一个 worker 总时长 17；两个独立 worker 为 13；两项检索共享写入时按串行规则恢复为 17。总工作量和真实模型效果需要分别解释。', keyPoints: ['逐项核查前置结果', '共享写入可以要求串行', '模型只计算给定时间与约束'] },
  ],
  exercise: {
    title: '推演控制权与依赖调度',
    brief: '为企业维修调查写出责任关系，再比较一个 worker、两个独立 worker 和共享写入三种配置。',
    steps: ['分别说明 manager 调用与 handoff 后的执行者、返回目标、回复责任人，并写一份有边界的委托说明', '将实验设为一个 worker 与两个独立 worker，逐项记录开始结束时间并复算总时长 17 与 13', '保持两个 worker 并启用共享写入，解释总时长 17 的原因，补充后台状态与失败去向以及模型限制'],
    deliverable: '一份控制权和委托说明、三张可复算的任务时间表，以及对总工作量、共享写入、失败处理和时间模型适用范围的解释。',
    experiment: 'ma-dependency-scheduling',
  },
  quiz: [
    { id: 'quiz-ma-02-1', prompt: '政策 specialist 返回调查结果，主 Agent 再综合并向用户回复。这最符合哪种责任安排？', choices: ['每次 tool call 都自动转移后续回复责任', '只要使用两个模型就必然是 handoff', 'manager-as-tools，主 Agent 保留外层回复责任'], answerIndex: 2, explanation: '关键在结果回到谁以及谁继续负责回复。此处 specialist 完成有边界的工作并返回结果，主 Agent 继续综合。' },
    { id: 'quiz-ma-02-2', prompt: '固定实验选择两个 worker，但检索 A 与 B 写入同一对象并要求互斥。总时长是多少？', choices: ['13，因为两个 worker 必然并行', '17，因为两项检索需要按资源规则串行', '9，因为汇总与核验可以提前开始'], answerIndex: 1, explanation: 'prepare 2、A 4、B 6、synthesize 3、verify 2 按共享写入与依赖规则执行，总时长为 17；额外 worker 不能绕过资源约束。' },
  ],
  interviewQuestionIds: ['iq-ma-02-1', 'iq-ma-02-2', 'iq-ma-02-3'],
  completionCriteria: ['能够为每条调用或 handoff 指明下一执行者、回复责任及完成和失败出口', '能够复算 17、13、17 三种配置，逐项验证依赖，并说明这些数值不能证明真实模型提速'],
});

export const ma02Interviews = deepFreeze([
  { id: 'iq-ma-02-1', lessonId: 'ma-02', question: 'manager-as-tools 与 handoff 应怎样区分？', shortAnswer: '看控制权和回复责任：manager 调用返回后继续综合，handoff 改变当前分支的后续行为或回复负责人，并需要保持活动状态。', deepDive: ['两种机制都可通过 tool call 触发，表面调用格式不足以判断责任。', 'OpenAI 文档强调 specialist 接管回复；LangChain 文档还包括单 Agent 的状态驱动配置切换，课程必须注明实现定义。'], misconceptions: ['handoff 一定代表启动了一个新进程。'], followUps: ['用户下一条消息应该交给谁，系统需要记录什么？'], frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-02-2', lessonId: 'ma-02', question: '固定 parallelization 与 orchestrator-workers 的关键差别是什么？', shortAnswer: '前者事先知道独立工作项，后者根据输入动态产生并委托工作项，再汇集结果；两者都需要清楚的输入输出和预算。', deepDive: ['每次查询政策和渠道可采用固定工作项；涉及多少地区要先调查时，可以由 orchestrator 生成计划。', '动态分配仍需限制职责重叠、参与者数量和停止条件，避免无边界搜索与重复工作。'], misconceptions: ['动态创建 worker 就不需要事先设计责任范围。'], followUps: ['委托说明需要哪些内容才能减少重复和遗漏？'], frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-02-3', lessonId: 'ma-02', question: '为什么增加 worker 不一定降低完成时间？', shortAnswer: '任务仍受前置依赖、最长路径与资源约束限制。固定模型中两个独立 worker 已达到 13 的最长路径下限，共享写入则要求串行并恢复到 17。', deepDive: ['两项检索在准备完成后才能开始，汇总要等两项都结束，核验再等待汇总。', '总工作量始终为 17，模型未计网络、派发和模型随机性；真实质量与成本需要另行测量。'], misconceptions: ['独立上下文保证共享对象可以同时写入。'], followUps: ['实际系统把两份结果写入独立 artifact 后，还需要明确什么合并规则？'], frequency: '高', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
]);

export const ma02Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma02-control-ownership', sourceIds: ['res-ma-openai-orchestration', 'res-ma-langchain-handoffs', 'res-ma-langchain-subagents'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma02-scheduling-model', sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma02-control-ownership', sourceIds: ['res-ma-openai-orchestration', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma02-shared-write', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma02-control-ownership', sourceIds: ['res-ma-openai-orchestration', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma02-pattern-selection', sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows', 'res-ma-research-system'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma02-scheduling-model', sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma02-delegation-brief', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents', 'res-ma-openai-orchestration', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma02-scheduling-model', sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma02-shared-write', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma02-lifecycle-control', sourceIds: ['res-ma-langchain-subagents', 'res-ma-research-system', 'res-ma-openai-orchestration'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma02-lifecycle-control', sourceIds: ['res-ma-langchain-subagents', 'res-ma-research-system', 'res-ma-openai-orchestration'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma02-shared-write', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
]);
