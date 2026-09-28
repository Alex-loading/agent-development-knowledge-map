import { deepFreeze } from '../../multi-agent-shared.js';

export const ma07Visuals = deepFreeze([
  {
    id: 'visual-ma-07-overview', kind: 'diagram', role: 'overview',
    title: '一次调用的授权责任',
    alt: '用户许可经 host 委托范围、服务身份验证和执行端访问控制共同约束；外部材料不能修改许可。',
    longDescription: '从左向右阅读上方四个框。用户许可规定可申请的动作，host 进一步限定当前 worker 的委托范围，MCP 服务验证身份及适用的 HTTP token 目标，执行端检查具体动作、资源和确认后给出允许或拒绝。下方的工具描述与外部材料通过虚线进入 host，只提供待分析的输入；协议 capabilities 通过虚线进入服务，只表达功能支持。这两类描述信息都无法单独扩大用户许可。图中的职责划分是课程应用示例，真实系统需在相应执行位置实现检查。',
    caption: '用户、委托与执行条件分别管理。capabilities 和外部文本无法单独提供业务授权。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-07-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools', 'res-ma-mcp-auth', 'res-ma-owasp-agency'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['boundary', 'relationship'],
  },
  {
    id: 'visual-ma-07-detail', kind: 'diagram', role: 'decision',
    title: '委托权限逐层求交',
    alt: '身份、用户与委托动作、资源、HTTP 凭据及具体确认共同决定许可；stdio 的 HTTP audience/scope 项不适用。',
    longDescription: '从左向右查看五组条件，合计七项判断：身份有效且用户允许请求动作，worker 的委托范围包含动作，资源租户符合允许范围，HTTP token 的 audience 正确且 scope 包含动作，export 确认绑定当前资源与动作。各组判断汇入下方的合并节点，任何必需项失败都会拒绝。图中用户拥有 read 和 export，worker 只有 read，所以导出在委托层被拒绝。切换 stdio 时将 HTTP audience 与 scope 项标为不适用，身份和业务条件继续生效。本图为课程自拟策略，不包含 token 验签或真实 OAuth 流程。',
    caption: '教学策略：全部必需条件共同决定许可，每层独立报告原因。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-07-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security', 'res-ma-owasp-agency'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['boundary', 'failure-mode'],
  },
]);
