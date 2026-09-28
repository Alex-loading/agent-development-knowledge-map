import { deepFreeze } from '../multi-agent-shared.js';

export const ma01Lesson = deepFreeze({
  id: 'ma-01', moduleId: 'multi-agent-mcp', order: 1,
  title: '多 Agent 适用条件与任务依赖',
  summary: '从单 Agent 基线识别真实限制，依据依赖、共享状态和质量成本证据决定是否协作。',
  durationMinutes: 27,
  objectives: ['根据 baseline 的具体失败提出有范围的多 Agent 采用假设', '制定保持条件可比的质量成本检查，并形成可审查的采用决定'],
  concepts: ['single-agent baseline', '任务依赖', '共享写入', '专业分工', '协作成本', '质量与等待时间'],
  explanations: [
    { heading: '分工需要独立工作与清楚责任', body: '多个执行参与者可以分别探索资料，但必须明确输入、输出、依赖和共享状态。角色数量与模型调用次数都不能直接证明协作的价值。', keyPoints: ['先定位 baseline 失败', '以数据依赖判断并行空间', '明确角色输入和输出'] },
    { heading: '新增协作需要完整的比较证据', body: '在同一任务集、工具条件与可比预算下，同时记录质量、总资源使用和等待时间。不同任务结构可能出现不同方向的结果，结论应保留适用范围。', keyPoints: ['统计全部参与者成本', '等待时间与费用分别解释', '未运行的收益保持待验证'] },
  ],
  exercise: {
    title: '编写企业知识助手协作决策记录',
    brief: '比较简单政策问答、独立资料调查和顺序工单更新，给出可验证的协作采用理由。',
    steps: ['为三个请求写出 baseline、具体限制和成功条件，标明哪些只是待验证假设', '列出各任务输入、输出、前置结果和共享写入对象，说明哪些工作允许并行', '设计同任务与可比预算的质量成本比较表，写出采用范围、停止条件和证据缺口'],
    deliverable: '一份包含三类请求、任务依赖表、角色边界、质量成本比较方法及待验证事项的协作决策记录。',
  },
  quiz: [
    { id: 'quiz-ma-01-1', prompt: '两个 worker 的任务名称不同，但都需要先读取另一方尚未完成的结果。应怎样判断并行机会？', choices: ['先梳理真实输入依赖，不能仅凭角色名安排同时执行', '给它们使用不同模型就会消除依赖', '增加第三个 worker 后无需等待'], answerIndex: 0, explanation: '开始条件由所需信息与状态决定。不同名称或模型不能生成尚不存在的前置结果，必须明确依赖后再选择执行方式。' },
    { id: 'quiz-ma-01-2', prompt: '候选方案回答更快，但使用的总 token 更多。哪项解释最合理？', choices: ['结果一定错误，因为提速必然省 token', '分别记录等待时间与总资源成本，再结合任务质量和预算判断', '只统计最终回复模型的 token 即可'], answerIndex: 1, explanation: '并行可能缩短等待，同时增加总体资源使用。比较需要覆盖所有参与者及委托、汇总等成本，并检查质量是否满足要求。' },
  ],
  interviewQuestionIds: ['iq-ma-01-1', 'iq-ma-01-2', 'iq-ma-01-3'],
  completionCriteria: ['能够从 baseline 失败、任务依赖和角色边界解释采用或暂不采用多 Agent 的理由', '能够同时解释质量、总费用与等待时间，并明确比较条件和尚缺证据'],
});

export const ma01Interviews = deepFreeze([
  { id: 'iq-ma-01-1', lessonId: 'ma-01', question: '怎样判断一个企业知识助手需要多 Agent？', shortAnswer: '先建立单 Agent baseline 并定位具体限制，再检查是否存在可独立完成且能汇总的工作，以及质量收益是否值得新增协调成本。', deepDive: ['复杂度、角色数量和工具数量只能提供调查线索；资料缺失或成功规则含糊应先处理。', '需要明确每个参与者持有什么信息、决定哪些行动以及把结果交给谁，再用本地任务验证采用假设。'], misconceptions: ['问题复杂就应该增加 Agent。'], followUps: ['如果漏项来自政策文档过期，为什么分工可能无法解决？'], frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-01-2', lessonId: 'ma-01', question: '如何识别可以并行的任务与必须顺序执行的工作？', shortAnswer: '列出输入、输出、前置结果与共享写入对象；独立工作可以同时推进，依赖尚未产生的结果或存在未解决写入冲突时需要限制执行。', deepDive: ['政策与渠道可以分别调查，汇总需要等待两项证据；工单创建还要满足当前场景的前置状态和确认条件。', '不同上下文不会自动提供资源互斥，两个 worker 修改同一对象时需要明确的执行规则。'], misconceptions: ['角色名称不同即可独立并行。'], followUps: ['大量任务需要持续共享同一状态时，单一主要控制者有什么优势？'], frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-01-3', lessonId: 'ma-01', question: '怎样证明协作收益，避免只报告一个好看的成功率？', shortAnswer: '保持任务、工具、资料与预算条件可比，逐例比较成功与关键失败，并同时统计所有参与者的 token、调用、费用和等待时间。', deepDive: ['简单请求、独立调查与顺序状态任务应分别报告，平均提高不能覆盖某类任务退化。', '更高预算下的结果需要注明变化条件；论文经验阈值不能替代本地测量，缺少样本或成本记录时保留待验证。'], misconceptions: ['等待缩短就能证明总成本下降。'], followUps: ['如果只在独立调查上有收益，你会怎样限定采用范围？'], frequency: '高', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
]);

export const ma01Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma01-baseline-question', sourceIds: ['res-ma-effective-agents', 'res-ma-langchain-multi-agent'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma01-comparison-evidence', sourceIds: ['res-ma-agent-scaling-science', 'res-ma-research-system'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma01-dependency-graph', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma01-coordination-cost', sourceIds: ['res-ma-research-system', 'res-ma-langchain-multi-agent'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma01-baseline-question', sourceIds: ['res-ma-effective-agents', 'res-ma-langchain-multi-agent'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma01-dependency-graph', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma01-comparison-evidence', sourceIds: ['res-ma-agent-scaling-science', 'res-ma-research-system'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma01-baseline-question', sourceIds: ['res-ma-effective-agents', 'res-ma-langchain-multi-agent'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma01-dependency-graph', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma01-decision-record', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system', 'res-ma-agent-scaling-science'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma01-decision-record', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system', 'res-ma-agent-scaling-science'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma01-decision-record', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma01-comparison-evidence', sourceIds: ['res-ma-agent-scaling-science', 'res-ma-research-system'] },
]);
