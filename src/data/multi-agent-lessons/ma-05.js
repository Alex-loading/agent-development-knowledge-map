import { deepFreeze } from '../multi-agent-shared.js';

export const ma05Lesson = deepFreeze({
  id: 'ma-05', moduleId: 'multi-agent-mcp', order: 5,
  title: '每请求版本、能力与旧版兼容',
  summary: '以 MCP 2026-07-28 核对请求 metadata、版本和能力，解释 MRTR 与 2025-11-25 初始化兼容路线。',
  durationMinutes: 29,
  objectives: [
    '检查当前请求的版本、能力和 HTTP header，按具体错误选择下一步',
    '解释旧版初始化的适用范围，以及 MRTR 新请求与 requestState 的处理方式',
  ],
  concepts: ['self-contained request', 'protocolVersion 与 clientCapabilities', 'server/discover', 'Modern 与 Legacy 兼容', 'MRTR 与 requestState', 'HeaderMismatch'],
  explanations: [
    {
      heading: '当前请求带有自己的协议上下文',
      body: '每条 2026-07-28 请求都包含 version 与 capabilities，Server 不能借用同一连接先前的声明。不支持版本、缺少能力和 header 不一致分别返回明确错误，连接本身不代表用户身份。',
      keyPoints: ['缺少必需 metadata 使用 -32602', '不支持版本使用 -32022', '能力不足使用 -32021'],
    },
    {
      heading: '兼容与补充输入都要保留版本含义',
      body: '2025-11-25 使用 initialize 与 initialized。Dual-era 需要根据探测结果决定路线，可识别的 Modern 错误应修正请求。MRTR 补充输入后发送独立请求，采用新 ID 并原样回传 requestState。',
      keyPoints: ['HTTP 400 需要继续检查正文', '初始化流程必须标注 revision', 'requestState 由 Server 验证必要的完整性和业务限制'],
    },
  ],
  exercise: {
    title: '核对一组 MCP 请求条件',
    brief: '使用有限条件的教学核对器，一次改变一个字段，解释结果并记录尚未验证的部分。',
    experiment: 'ma-mcp-request',
    steps: [
      '检查 version 与 capabilities 是否存在，再核对 Server 的支持版本和必需 elicitation 能力',
      '切换 HTTP 条件并修改 header，一次改变一项条件，记录五类结果及对应解释',
      '补充无共同版本、Modern 错误、旧版初始化与 MRTR 新请求的处理记录，注明实验范围',
    ],
    deliverable: '一份包含条件输入、预期类别、实际结果、修改理由、旧版适用范围和 MRTR 处理说明的请求核对记录，并明确 accepted 只代表教学条件通过。',
  },
  quiz: [
    {
      id: 'quiz-ma-05-1',
      prompt: '2026-07-28 请求缺少 clientCapabilities，上一个请求曾经声明过。应如何处理？',
      choices: ['借用上一个请求的声明继续处理', '返回 -32602，要求本次请求携带必需 metadata', '自动切换到 2025-11-25'],
      answerIndex: 1,
      explanation: '当前模型要求每个请求自带版本与能力。即使能力对象为空也需要携带，Server 不能根据连接历史补足缺失字段，缺少必需 metadata 使用 Invalid params。',
    },
    {
      id: 'quiz-ma-05-2',
      prompt: 'HTTP 返回 400，正文是 -32022 且列出了 supported 版本，Dual-era Client 应先做什么？',
      choices: ['只看状态码，立即发送旧版 initialize', '重复完全相同请求直到成功', '识别 Modern 版本错误，按共同支持版本修正或报告不兼容'],
      answerIndex: 2,
      explanation: 'Modern Server 的版本错误也会使用 HTTP 400。可识别的 Modern 错误说明需要处理当前协议条件；是否进入旧版路线必须结合探测证据，不能只看状态码。',
    },
  ],
  interviewQuestionIds: ['iq-ma-05-1', 'iq-ma-05-2', 'iq-ma-05-3'],
  completionCriteria: [
    '能够解释五类教学结果及其限制，并区分协议 capability 与业务授权',
    '能够准确描述两类 revision 的通信前提和 MRTR 的请求身份及状态边界',
  ],
});

export const ma05Interviews = deepFreeze([
  {
    id: 'iq-ma-05-1', lessonId: 'ma-05',
    question: '2026-07-28 为什么要求每个请求带版本和能力，server/discover 又负责什么？',
    shortAnswer: '每个请求直接提供协议上下文，Server 不能依赖连接历史补全版本或能力。server/discover 返回支持版本和服务能力，Server 必须实现，Client 可以选择提前调用。',
    deepDive: ['说明 params._meta 中两个必需字段、空能力对象和缺失 metadata 的 -32602 处理。', '版本不支持时依据 -32022 的 supported 信息判断共同版本，同时核对 SDK 的实际支持范围。'],
    misconceptions: ['要求 Server 实现 discover 就等于要求所有 Client 每次先调用它。'],
    followUps: ['当双方没有共同支持的 revision 时，为什么仅修改日期字符串无法修复兼容问题？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-05-2', lessonId: 'ma-05',
    question: 'Dual-era Client 如何避免把一个 Modern 错误误判成旧版 Server？',
    shortAnswer: 'Client 应检查发现结果与具体错误语义。可识别的 Modern 错误需要修正版本、能力或 header；stdio 的其他错误或合理超时才进入旧版初始化，HTTP 400 还需读取正文。',
    deepDive: ['描述 2025-11-25 的 initialize、版本与能力交换、notifications/initialized 顺序。', '说明旧实现对初始化前的未知方法可能采用不同响应，所以不能仅依赖一个错误码判断兼容路线。'],
    misconceptions: ['HTTP 400 一律意味着只能使用旧版 initialize。'],
    followUps: ['stdio 探测返回 -32022 时，下一条请求应如何选择版本？'],
    frequency: '中', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-05-3', lessonId: 'ma-05',
    question: 'MRTR 收到 input_required 后如何继续，requestState 由谁验证？',
    shortAnswer: 'Client 收集所需输入后，以新 JSON-RPC ID 重新发起原操作，按输入键提供 inputResponses，并原样回传 requestState。Server 要对影响授权或业务的状态实施必要验证。',
    deepDive: ['MRTR 适用于 tools/call、resources/read、prompts/get，Server 只使用当前请求声明可处理的 Client capability。', 'requestState 对 Client 不透明，不能修改或借给并行请求；完整性保护也不能单独保证只使用一次。'],
    misconceptions: ['客户端理解 requestState 内容以后，可以为新操作修改其中字段。'],
    followUps: ['两个员工同时补充工单输入时，应如何避免交换彼此的状态和输入映射？'],
    frequency: '中', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
]);

export const ma05Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma05-legacy-compatibility', sourceIds: ['res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma05-request-context', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma05-legacy-compatibility', sourceIds: ['res-ma-mcp-versioning', 'res-ma-mcp-http'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma05-version-selection', sourceIds: ['res-ma-mcp-versioning', 'res-ma-mcp-discovery', 'res-ma-mcp-basic'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma05-legacy-compatibility', sourceIds: ['res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning', 'res-ma-mcp-stdio', 'res-ma-mcp-http'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma05-mrtr-retries', sourceIds: ['res-ma-mcp-mrtr', 'res-ma-mcp-basic', 'res-ma-mcp-tools'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma05-request-checklist', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma05-mrtr-retries', sourceIds: ['res-ma-mcp-mrtr', 'res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning'] },
]);
