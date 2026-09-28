import { deepFreezeVisual } from '../visual-contract.js';

export const ma05Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-05-overview', kind: 'diagram', role: 'overview',
    title: '每个请求携带自己的版本与能力',
    alt: '请求 metadata 含 protocolVersion 与 clientCapabilities，Server 独立检查必需字段、支持版本和所需能力。',
    longDescription: '左侧框表示一条 MCP 2026-07-28 请求，其 params._meta 明确携带完整的 protocolVersion 与 clientCapabilities 字段名，能力对象即使为空也必须存在。箭头通向右侧 Server 检查框，框内依次列出必需 metadata、版本支持和本次能力三项条件。下方三张卡说明缺字段对应 -32602、不支持版本对应 -32022、缺少所需能力对应 -32021。图形不代表完整校验程序，也没有包括业务授权与所有 schema 规则；核心结论是连接历史不能为当前请求补全声明。',
    caption: '图示为当前规范的三个请求条件；业务授权与完整消息校验另行验证。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-05-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['mechanism', 'boundary'],
  },
  {
    id: 'visual-ma-05-detail', kind: 'diagram', role: 'comparison',
    title: '两类 revision 使用不同通信前提',
    alt: '2026-07-28 每请求带 metadata；2025-11-25 先 initialize，再 initialized，然后按协商版本通信。',
    longDescription: '左侧路线使用 MCP 2026-07-28，先显示可选的 server/discover 预查，再通过虚线连接每请求携带版本和能力的业务请求。文字明确 Client 也可以直接发送业务请求，Server 必须提供 discover。右侧路线使用 2025-11-25，依次经过 initialize、notifications/initialized 和按协商版本通信。底部共同说明 Dual-era 探测：可识别的 Modern 错误需要修正当前请求；stdio 的其他错误或合理超时才进入旧版路线，HTTP 400 还需检查正文。两条路线的版本标签避免把不同前提合成一个流程。',
    caption: '兼容判断需要具体响应证据；HTTP 400 本身无法说明只能使用旧版。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-05-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning', 'res-ma-mcp-discovery', 'res-ma-mcp-stdio', 'res-ma-mcp-http'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['process', 'decision'],
  },
]);
