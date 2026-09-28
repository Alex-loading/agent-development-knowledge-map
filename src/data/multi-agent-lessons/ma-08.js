import { deepFreeze } from '../multi-agent-shared.js';

export const ma08Lesson = deepFreeze({
  id: 'ma-08', moduleId: 'multi-agent-mcp', order: 8,
  title: '多 Agent 与 MCP 集成验收',
  summary: '将协作、协议、权限和质量成本证据组织成可复查的验收包，并明确教学实验与真实系统验证的边界。',
  durationMinutes: 29,
  objectives: ['设计覆盖协作产物、版本与 transport、授权与缓存隔离的正常和异常验收案例。', '用同一任务范围比较质量、端到端耗时和全部成本，交付含证据及未覆盖范围的验收包。'],
  concepts: ['task / trial / outcome', '版本与实现矩阵', 'MCP Inspector', '授权上下文与 private 缓存', '质量成本比较', '验收证据与回归维护'],
  explanations: [
    { heading: '接口正确只是完整验收的一组证据', body: '请求结构与工具 schema 可以正确，同时业务资料、权限或最终资源状态仍有问题。验收需把协作、协议、权限和质量成本分别验证，再形成整体结论。', keyPoints: ['保留最终状态证据', '按版本检查真实实现', '正常与异常案例同时覆盖'] },
    { heading: '比较方案要保持任务和成本口径一致', body: '相同任务与资料范围下，比较质量、端到端耗时及全部 worker 和重试投入；教学调度与权限计算只说明给定机制，真实环境仍需实际执行。', keyPoints: ['独立初始环境', '统计全部参与者', '记录未运行和未覆盖范围'] },
  ],
  exercise: {
    title: '交付星桥资料助手验收包',
    brief: '汇总前七课材料，组织正常与异常案例，并将三个教学实验的结论与实际项目仍需验证的内容分别注明。',
    steps: ['写出业务成功条件、协作分工、资料与输出范围，记录协议、SDK、transport、扩展和授权配置。', '组织正常调用、协议错误、权限拒绝及跨用户 private 缓存案例，记录三个教学实验的预期、实际结果和真实接口待验证范围。', '在相同任务范围比较单 Agent 与协作方案的质量、时间和全部成本，写出验收判断、证据缺口及回归维护责任。'],
    deliverable: '一份验收包，含系统与版本说明、案例输入及预期实际结果、接口与业务状态证据、质量成本比较、明确结论、未覆盖范围和回归维护计划。',
  },
  quiz: [
    { id: 'quiz-ma-08-1', prompt: '用户甲读取的资源结果为 private，TTL 尚未过期。用户乙请求相同 URI，应怎样处理？', choices: ['相同 URI 足够，直接共享甲的结果。', '只要工具标注 readOnlyHint 就可以共享。', '按乙的授权上下文处理，不能跨上下文复用甲的 private 缓存。'], answerIndex: 2, explanation: 'private 缓存明确限制授权上下文；TTL 仅提供新鲜度提示，URI 相同和只读描述都不能代替隔离及访问控制。' },
    { id: 'quiz-ma-08-2', prompt: 'Inspector 调用成功，两个 worker 返回了摘要，但缺少最终报告核对及 worker 成本记录。怎样写验收结论？', choices: ['接口和部分协作证据已具备，补充业务结果与全部成本后再判断完整验收。', '调用成功已经证明可发布。', 'worker 数量大于一已经证明优于单 Agent。'], answerIndex: 0, explanation: '接口、协作结果、业务状态和成本回答不同问题。未运行或缺少的检查需要明确记录，不能被调用成功替代。' },
  ],
  interviewQuestionIds: ['iq-ma-08-1', 'iq-ma-08-2', 'iq-ma-08-3'],
  completionCriteria: ['能提交包含正常、异常、权限和缓存隔离案例的验收矩阵，并记录真实版本与 transport。', '能用完整证据解释验收判断，汇总全部成本并明确教学限制、未覆盖范围和回归责任。'],
});

export const ma08Interviews = deepFreeze([
  { id: 'iq-ma-08-1', lessonId: 'ma-08', question: '如何验收一个由多个 Agent 和 MCP 服务组成的企业资料助手？', shortAnswer: '先定义业务成功与约束，再分别验证协作产物、真实协议版本与 transport、权限隔离以及质量成本；用调用轨迹解释过程，用最终资源状态判断结果。', deepDive: ['系统说明包含 worker 输入输出、资料范围和合并责任；版本表同时写协议、SDK 及扩展，避免把 Current 规范等同于全部实现支持。', 'Inspector 提供真实接口调试证据，最终报告是否可信、导出是否授权仍需业务状态检查；所有未运行项都应显式记录。'], misconceptions: ['把一次 tools/call 成功直接写成端到端验收通过。'], followUps: ['教学请求核对器通过后，还需补充哪些真实验证？'], frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-08-2', lessonId: 'ma-08', question: 'MCP 缓存如何影响跨用户的权限验收？', shortAnswer: 'private 结果只能在相同授权上下文复用，缓存标识还包含方法与影响结果的参数；相同 URI 或未过期 TTL 均不能证明另一用户有权获得该内容。', deepDive: ['为两个用户准备相同 URI 的案例，核对结果所属上下文、实际内容以及访问控制，验证缓存不会旁通资源权限。', 'TTL 是新鲜度提示，相关通知可以提前使缓存失效；public 标记允许共享时，服务器仍须正确判断可见范围并执行原语访问控制。'], misconceptions: ['认为只读操作或缓存命中天然不会泄露私人资料。'], followUps: ['如何验证缓存更新后仍保持授权上下文隔离？'], frequency: '中', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-08-3', lessonId: 'ma-08', question: '怎样证明多 Agent 方案值得额外的协调与计算成本？', shortAnswer: '在相同任务和资料范围下比较单 Agent 基线与协作方案，分别统计质量、端到端耗时以及所有 worker、工具和重试成本，再依据项目自定条件判断收益是否值得投入。', deepDive: ['让各次 trial 从独立环境开始，按任务结果、证据准确性与覆盖程度评分，避免只奖励固定调用顺序或更多 worker。', '厂商文章的效果比例和课程固定时长实验都受各自条件限制，真实项目需实际测量，并把未覆盖范围和新失败转为后续回归。'], misconceptions: ['只统计负责人 token，或用并行调度缩短的时间推导模型质量一定提升。'], followUps: ['如果质量提升但正常任务误拒增加，验收材料应怎样呈现？'], frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
]);

export const ma08Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-research-system', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-auth', 'res-ma-mcp-caching'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma08-quality-cost', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma08-isolation-cases', sourceIds: ['res-ma-mcp-caching'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma08-tool-evidence', sourceIds: ['res-ma-mcp-inspector', 'res-ma-anthropic-evals'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals', 'res-ma-mcp-versioning'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma08-isolation-cases', sourceIds: ['res-ma-mcp-caching'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma08-quality-cost', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-research-system', 'res-ma-mcp-versioning', 'res-ma-mcp-auth'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-mcp-http', 'res-ma-mcp-caching', 'res-ma-mcp-auth', 'res-ma-anthropic-evals'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma08-quality-cost', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals', 'res-ma-mcp-versioning', 'res-ma-mcp-auth'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-auth', 'res-ma-mcp-caching', 'res-ma-anthropic-evals'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma08-acceptance-package', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals'] },
]);
