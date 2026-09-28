import { deepFreeze } from '../multi-agent-shared.js';

export const ma07Lesson = deepFreeze({
  id: 'ma-07', moduleId: 'multi-agent-mcp', order: 7,
  title: '认证授权与执行边界',
  summary: '区分协议能力、HTTP 授权和业务许可，用用户、委托、资源、audience 与具体确认计算行动边界。',
  durationMinutes: 28,
  objectives: ['说明 PRM、scope、audience 与 HTTP/stdio 的职责边界，定位授权检查的执行位置。', '根据用户与委托权限、资源归属和具体确认判断动作是否允许，并记录每层允许或拒绝的原因。'],
  concepts: ['Protected Resource Metadata', 'token audience', 'confused deputy', 'token passthrough', '最小权限与 complete mediation', '委托动作交集'],
  explanations: [
    { heading: '协议能力与业务许可分别管理', body: 'capabilities 描述功能支持，OAuth 描述受保护服务的授权流程，具体用户能否操作某份资料还取决于业务访问控制。HTTP 与 stdio 的凭据来源不同。', keyPoints: ['先确定 transport', '验证 token 的目标', '每次执行检查资源与动作'] },
    { heading: '委托范围可以小于用户权限', body: '研究 worker 只接收完成当前任务所需的动作。课程策略在用户与委托动作交集之外继续检查租户、HTTP audience 和 export 的资源动作确认，分别报告每个条件。', keyPoints: ['用户权限不自动全部继承', '确认绑定资源和动作', '教学计算不实现 OAuth 验签'] },
  ],
  exercise: {
    title: '制作逐层授权证据表',
    brief: '使用委托权限实验比较正常阅读和四类拒绝条件，再切换 HTTP 与 stdio；全部输入与计算仅用于教学。',
    steps: ['记录用户与委托动作集合、请求资源和 transport，为正常阅读与委托不含 export 的两例写出预期。', '分别改变资源租户、HTTP audience 与 export 确认的资源或动作，记录逐层判断，再对照 stdio 分支。', '补充多个条件同时失败的案例，复核所有拒绝原因，说明真实系统还需实现的 token 验证、下游权限及本地进程控制。'],
    deliverable: '一份授权证据表，含各例输入、预期、逐层实际结果、最终许可判断、HTTP/stdio 差异及教学模型的未覆盖范围。',
    experiment: 'ma-delegated-permissions',
  },
  quiz: [
    { id: 'quiz-ma-07-1', prompt: '资料 MCP server 收到一个带 read scope、面向日历服务的有效 HTTP token，应该怎样处理？', choices: ['read scope 已足够，应允许读取资料。', '检查并拒绝错误 audience，业务访问仍需独立授权。', '把 token 原样转给资料库，让下游决定。'], answerIndex: 1, explanation: 'scope 表达许可范围，audience 限制目标接收者。MCP server 必须拒绝发给其他服务的 token，token passthrough 也被禁止。' },
    { id: 'quiz-ma-07-2', prompt: '用户允许 read/export，worker 只被委托 read。资源租户正确，也存在当前导出确认；改用 stdio 后能否 export？', choices: ['不能，委托动作仍不包含 export。', '能，stdio 会取消全部授权条件。', '能，用户导出确认会自动扩大 worker 委托集合。'], answerIndex: 0, explanation: 'stdio 分支使本实验的 HTTP audience 与 scope 检查不适用；身份、用户、委托、资源和敏感动作确认继续分别生效。' },
  ],
  interviewQuestionIds: ['iq-ma-07-1', 'iq-ma-07-2', 'iq-ma-07-3'],
  completionCriteria: ['能解释 HTTP 的 PRM、scope 与 audience，并说明 stdio 运行环境的权限责任。', '能提交含正常、单条件拒绝和多条件拒绝的逐层授权表，明确委托交集与确认绑定规则。'],
});

export const ma07Interviews = deepFreeze([
  { id: 'iq-ma-07-1', lessonId: 'ma-07', question: 'MCP 的 capabilities、OAuth scope 与 token audience 各回答什么问题？', shortAnswer: 'capabilities 表达协议功能支持，scope 表达授权范围，audience 表达 token 的目标接收服务；三者通过后仍需检查具体用户对资源和动作的业务许可。', deepDive: ['先识别 transport。HTTP 的受保护服务通过 PRM 发现 AS，再验证 issuer 与 token；stdio 从运行环境取得凭据，不套用该 HTTP 授权流程。', '服务器公布工具或返回正确 schema 不能代替访问控制，执行端必须继续验证当前资源、动作与身份。'], misconceptions: ['把协议功能声明当作用户许可，或把 read scope 当作跨服务通行条件。'], followUps: ['为什么针对另一个服务的有效 token 必须拒绝？'], frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-07-2', lessonId: 'ma-07', question: '如何防止多 Agent 委托扩大用户或 worker 的行动范围？', shortAnswer: '由可信应用状态保存用户与委托范围，在执行端同时检查动作交集、资源归属和具体确认；对话、工具描述或 peer Agent 的文字不能自行扩大这些许可。', deepDive: ['用户有 export 只表明用户层条件满足；worker 本次委托只有 read 时，export 仍被拒绝。资源和确认条件另行检查。', '敏感确认应与具体资源和动作关联，授权表同时验证正常任务、单条件拒绝及多个条件失败，避免只证明全拒绝。'], misconceptions: ['认为主管发出的所有消息或模型生成的同意文字都能更新下游权限。'], followUps: ['切换到 stdio 后哪些判断继续生效？'], frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
  { id: 'iq-ma-07-3', lessonId: 'ma-07', question: 'MCP 代理的 confused deputy 风险与 token passthrough 有何区别？', shortAnswer: 'confused deputy 可使代理借自身关系为未获相应同意的客户端行动；token passthrough 则涉及接收其他目标的 token 并原样转送，两者需要各自的目标与客户端边界检查。', deepDive: ['安全资料中的特定 confused deputy 场景包含静态上游 client ID、动态加入的客户端以及已有上游 consent，需要在上游流程前取得逐客户端同意。', 'audience 验证防止 token 在错误接收方使用，逐客户端同意管理代理替谁行动；两项控制都不能替代资源级业务许可。'], misconceptions: ['认为只完成一次 OAuth 登录，就可以把同意和 token 共享给所有客户端。'], followUps: ['本地 MCP server 的进程权限还需要哪些独立控制？'], frequency: '中', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'] },
]);

export const ma07Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma07-discovery-identity', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-discovery', 'res-ma-mcp-auth-security'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma07-delegation-policy', sourceIds: ['res-ma-mcp-auth', 'res-ma-owasp-agency'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma07-audience-proxy', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma07-delegation-policy', sourceIds: ['res-ma-mcp-auth', 'res-ma-owasp-agency'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma07-discovery-identity', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-discovery', 'res-ma-mcp-auth-security'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma07-delegation-policy', sourceIds: ['res-ma-owasp-agency', 'res-ma-mcp-auth'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma07-audience-proxy', sourceIds: ['res-ma-mcp-auth-security', 'res-ma-mcp-security'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma07-permission-evidence', sourceIds: ['res-ma-owasp-agency', 'res-ma-mcp-auth'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma07-delegation-policy', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security', 'res-ma-owasp-agency'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma07-permission-evidence', sourceIds: ['res-ma-mcp-security', 'res-ma-owasp-agency'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma07-permission-evidence', sourceIds: ['res-ma-mcp-auth', 'res-ma-owasp-agency'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma07-discovery-identity', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-discovery'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma07-permission-evidence', sourceIds: ['res-ma-mcp-auth', 'res-ma-owasp-agency'] },
]);
