import { deepFreeze } from '../multi-agent-shared.js';

export const ma06Lesson = deepFreeze({
  id: 'ma-06', moduleId: 'multi-agent-mcp', order: 6,
  title: '传输、错误、取消与可选 Tasks',
  summary: '区分 transport、JSON-RPC 和工具结果，处理进度、取消及结果未知，并解释当前 Tasks extension。',
  durationMinutes: 30,
  objectives: [
    '区分三层失败与两种 transport 的当前行为，为取消和重试选择有证据的下一步',
    '解释可选 Tasks 的 handle、状态与取消意图，并将协议 ID 和业务幂等分别处理',
  ],
  concepts: ['JSON-RPC error 与 isError', 'stdio 与 Streamable HTTP', 'progressToken 与取消范围', '请求 ID 与业务幂等', 'Tasks extension 与状态'],
  explanations: [
    {
      heading: '失败层级决定诊断起点',
      body: 'HTTP 状态、JSON-RPC error 和工具 isError 需要分别读取。取消与响应中断不能证明业务未执行，恢复前要确认副作用、权限和可查询证据。',
      keyPoints: ['未知 RPC method 与未知工具名属于不同问题', '普通请求取消依赖 transport', 'JSON-RPC ID 不提供业务去重'],
    },
    {
      heading: '长期任务有独立的状态语义',
      body: 'Tasks 2026-07-28 是可选 Stable extension。Server 可返回 flat task handle，tasks/get 读取状态，tasks/update 提交输入，tasks/cancel 确认取消意图；完成状态仍需检查工具结果。',
      keyPoints: ['声明支持不保证每次都产生 task', 'completed 可能包含 isError: true', 'cancel ack 不能证明已停止'],
    },
  ],
  exercise: {
    title: '编写失败分类与恢复记录',
    brief: '用资料读取和工单写入说明哪些事实已知、哪些仍未知，以及下一步为什么允许执行。',
    steps: [
      '为读取和写入分别列出 transport 中断、JSON-RPC 错误、工具业务错误及所需证据',
      '记录 stdio 与 HTTP 的进度、超时和取消范围，并为结果未知的写入说明查询或幂等条件',
      '加入 Tasks 的 handle、状态、输入与取消记录，解释 completed、failed 和 cancel ack 的含义',
    ],
    deliverable: '一份覆盖两类业务动作、三层失败、普通请求取消及 Task 状态的恢复表，保留已知事实、未知业务状态、授权条件和有证据支持的下一步。',
  },
  quiz: [
    {
      id: 'quiz-ma-06-1',
      prompt: '工单调用收到合法 JSON-RPC result，其中 isError 为 true，怎样解释最准确？',
      choices: ['JSON-RPC 结果已返回，工具报告执行问题，还需根据业务证据处理', '既然是 result 就一定创建成功', '所有这种响应都必须变成 -32601'],
      answerIndex: 0,
      explanation: '工具执行错误可以通过 result 中的 isError 表达。它与 JSON-RPC 方法错误不同，恢复措施需要结合具体业务反馈，合法响应本身不能证明用户目标已经完成。',
    },
    {
      id: 'quiz-ma-06-2',
      prompt: 'tasks/cancel 返回成功后，界面能立即确定什么？',
      choices: ['所有业务变更已经撤销', '任务一定进入 cancelled', '取消意图已被接收，仍需查询状态和实际结果'],
      answerIndex: 2,
      explanation: '当前 Tasks 的成功响应确认取消请求，状态可能稍后才更新，任务也可能完成。取消没有自动撤销业务副作用的能力，应继续依据 task 状态与实际结果展示事实。',
    },
  ],
  interviewQuestionIds: ['iq-ma-06-1', 'iq-ma-06-2', 'iq-ma-06-3'],
  completionCriteria: [
    '能够解释三层失败、当前两种传输及取消竞争，并保留响应未知的业务状态',
    '能够交付包含 Task 状态和幂等条件的恢复表，避免把消息 ID 或取消确认当作业务保证',
  ],
});

export const ma06Interviews = deepFreeze([
  {
    id: 'iq-ma-06-1', lessonId: 'ma-06',
    question: '如何区分 transport、JSON-RPC 和工具执行错误？',
    shortAnswer: '先读 HTTP 等传输结果，再检查 JSON-RPC error 或 result，最后读取工具 isError 和业务产物。未知 RPC method、未知工具名和业务校验失败需要不同诊断，不能统一盲目重试。',
    deepDive: ['未知 RPC method 通常使用 -32601，未知工具名可用 -32602，已识别工具的执行问题通过 isError 结果表达。', '工单提交响应中断时，记录业务状态未知，先查询结果或验证服务的幂等条件，避免重复操作。'],
    misconceptions: ['只要 HTTP 收到响应且 JSON-RPC 有 result，用户目标就已完成。'],
    followUps: ['为什么未知工具名与工具内部业务参数校验失败可能采用不同结果层级？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-06-2', lessonId: 'ma-06',
    question: '当前 stdio 与 HTTP 如何取消普通请求，为什么取消无法保证没有副作用？',
    shortAnswer: '2026-07-28 中，stdio 发送引用 request ID 的取消通知，HTTP 关闭对应 SSE response stream。取消可能与完成同时发生，已经执行的业务动作仍要通过查询或补偿处理。',
    deepDive: ['共享 stdio 通道包含其他请求，终止整个进程会影响更大的范围；HTTP 需要定位本次请求的 stream。', 'Progress 可选且只描述活动请求的进度，最大总时限仍然需要设置，进度和取消都不等于业务验收。'],
    misconceptions: ['发送取消后就可以向用户报告所有外部变更已经撤销。'],
    followUps: ['取消以后收到了迟到响应，记录中应保留哪些事实？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-06-3', lessonId: 'ma-06',
    question: '当前 Tasks 如何表示长期工作，Task 完成与业务成功是什么关系？',
    shortAnswer: '客户端声明可选 Tasks 后，Server 可以返回 flat task handle。tasks/get 的 complete 表示查询响应完成，Task 状态仍需单独读取；completed 也可能包含 isError 工具结果。',
    deepDive: ['input_required 使用 tasks/update 提交输入，tasks/cancel 的 ack 只确认意图，taskId 的使用还受授权、TTL 和保存策略约束。', 'JSON-RPC ID 关联消息，taskId 标识长期任务，业务幂等由执行服务保证；三者无法相互替代。'],
    misconceptions: ['Tasks 的 completed 保证业务操作成功，取消确认保证任务已经停止。'],
    followUps: ['为什么不能把 2025-11-25 的 tasks/result 与嵌套 task 结构直接用于当前 extension？'],
    frequency: '中', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
]);

export const ma06Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma06-layered-failures', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-http', 'res-ma-mcp-stdio', 'res-ma-mcp-cancellation'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma06-tasks-extension', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-basic', 'res-ma-mcp-versioning'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma06-layered-failures', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma06-tasks-extension', sourceIds: ['res-ma-mcp-tasks'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma06-layered-failures', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-http'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma06-progress-cancellation', sourceIds: ['res-ma-mcp-progress', 'res-ma-mcp-cancellation', 'res-ma-mcp-stdio', 'res-ma-mcp-http'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma06-tasks-extension', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-basic'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma06-layered-failures', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-http'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma06-recovery-record', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-cancellation'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma06-tasks-extension', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma06-recovery-record', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-cancellation'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma06-recovery-record', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-cancellation'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma06-recovery-record', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-cancellation'] },
]);
