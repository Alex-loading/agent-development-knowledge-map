import { deepFreeze } from '../multi-agent-shared.js';

export const ma03Lesson = deepFreeze({
  id: 'ma-03', moduleId: 'multi-agent-mcp', order: 3,
  title: '上下文隔离与结果验收',
  summary: '选择每个 worker 所需信息，保持消息结构有效，并用来源与业务证据验收合并结果。',
  durationMinutes: 28,
  objectives: ['为任务选择必要上下文，说明新 state、历史输入和持久状态的作用', '根据任务覆盖、来源和未解决项验收结果，明确缺证据的处理责任'],
  concepts: ['context isolation', '选择性历史输入', '消息配对', 'artifact 引用', '结果验收', '来源与版本冲突'],
  explanations: [
    { heading: '上下文选择同时关心充分性与成本', body: '默认新 state、显式历史输入与持久化配置各有语义。只传简短任务可能漏掉约束，完整历史可能带入无关或过期信息；输入应依据当前任务选择。', keyPoints: ['必要事实带来源', '动态状态标明时间范围', '历史过滤保持调用和回应关联'] },
    { heading: '完成状态需要独立验收', body: 'manager 核查输出覆盖、来源支持、artifact 可访问性和未解决项，分别处理重复、冲突与信息缺失，再形成最终回复。', keyPoints: ['JSON 合法不能证明业务正确', '重复来源不算独立证据', '缺项保留下一责任人'] },
  ],
  exercise: {
    title: '设计一份维修调查交接材料',
    brief: '为政策 worker 准备选择性输入与返回格式，并用缺证据和冲突样例检查验收规则。',
    steps: ['准备任务所需事实、用户限制、来源版本和状态时间范围，说明保留及省略哪些历史', '编写含结论、证据位置、artifact 引用和未解决项的返回样例；若含工具历史，检查调用与回应配对', '分别验收完成但缺依据、两份政策结论冲突的结果，记录需要补充的证据、交付影响与下一责任人'],
    deliverable: '一份委托输入、worker 返回样例与逐项验收表，能复核来源、消息结构、未解决问题和最终接受理由。',
  },
  quiz: [
    { id: 'quiz-ma-03-1', prompt: 'worker 需要继续主 Agent 已做了一半的调查。怎样决定输入？', choices: ['只给角色名称，它会自动继承全部事实', '把所有历史长期复制，永远无需更新', '传入必要事实、已尝试方法、有效约束和来源，并说明状态时间范围'], answerIndex: 2, explanation: '上下文由实际输入策略决定。接续任务需要保留相关的先前工作，同时检查过期状态、无关信息和必要约束。' },
    { id: 'quiz-ma-03-2', prompt: 'worker 返回 completed，但预约结论只有过期文档支持。manager 应如何处理？', choices: ['要求有效证据并保留未解决项，再决定能否进入最终建议', '完成状态优先，直接发布结论', '再叫一个 worker 引用同一文档就会可靠'], answerIndex: 0, explanation: '完成声明不证明来源适用。manager 应核对文档版本、任务条件和证据缺口，重复同一来源无法消除这项问题。' },
  ],
  interviewQuestionIds: ['iq-ma-03-1', 'iq-ma-03-2', 'iq-ma-03-3'],
  completionCriteria: ['能够保持工具调用与回应配对，并解释摘要需要保留的条件、来源和未完成项', '能够交付可复核的结果验收表，保留来源、重复、冲突、未完成项和处理责任'],
});

export const ma03Interviews = deepFreeze([
  { id: 'iq-ma-03-1', lessonId: 'ma-03', question: '怎样设计子 Agent 的上下文输入？', shortAnswer: '从任务所需事实和约束出发，选择相关历史、来源与状态时间范围，明确是否继承历史或维持自己的 state。', deepDive: ['隔离调用减少无关信息，但可能重复已经完成的调查；接续任务应传入先前方法与结果。', '输入不足会漏掉条件，完整历史也可能增加成本并携带过期信息；应记录选择理由和重新核验责任。'], misconceptions: ['子 Agent 自动知道主对话全部事实。'], followUps: ['上午读取的工单状态如何交给下午开始工作的 worker？'], frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-03-2', lessonId: 'ma-03', question: 'handoff 历史裁剪为什么不能只看文本长度？', shortAnswer: '还要保持调用与回应的结构关联，并保留下一参与者所需的条件、来源和未完成项。', deepDive: ['LangChain 示例用 tool_call_id 关联 tool call 与 ToolMessage，删除一侧可能产生无效历史。', '只传 handoff 消息对的示例假设没有其他并行调用；存在多个调用时必须根据实际消息结构处理。'], misconceptions: ['最短摘要必然是最好的交接。'], followUps: ['结构有效的消息为什么仍可能缺少业务所需证据？'], frequency: '中', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-03-3', lessonId: 'ma-03', question: 'manager 如何合并多个 worker 的结果？', shortAnswer: '先核查任务覆盖、来源与适用条件，识别重复、冲突和缺项，再接受有证据部分并为未解决项指定核验动作与责任。', deepDive: ['相同结论可能来自同一来源；新旧版本或不同地区条件也可能导致结论冲突，必须回查原文。', '结果汇集只是数据流步骤，completed、JSON 格式或 manager 自信都不能代替业务验收；不可访问的 artifact 需要补充。'], misconceptions: ['多份相同回答天然构成独立证据。'], followUps: ['一个 worker 未返回时，最终回复应记录哪些影响？'], frequency: '高', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
]);

export const ma03Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma03-context-input', sourceIds: ['res-ma-langchain-subagents', 'res-ma-langchain-multi-agent'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma03-result-acceptance', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma03-task-envelope', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma03-result-acceptance', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma03-task-envelope', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma03-history-validity', sourceIds: ['res-ma-langchain-handoffs', 'res-ma-langchain-subagents', 'res-ma-research-system'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma03-merge-conflicts', sourceIds: ['res-ma-research-system', 'res-ma-langgraph-workflows', 'res-ma-langchain-subagents'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma03-task-envelope', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma03-handoff-package', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma03-handoff-package', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma03-handoff-package', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents', 'res-ma-langchain-handoffs'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma03-history-validity', sourceIds: ['res-ma-langchain-handoffs', 'res-ma-langchain-subagents', 'res-ma-research-system'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma03-merge-conflicts', sourceIds: ['res-ma-research-system', 'res-ma-langgraph-workflows', 'res-ma-langchain-subagents'] },
]);
