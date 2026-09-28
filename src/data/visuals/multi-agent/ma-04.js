import { deepFreezeVisual } from '../visual-contract.js';

export const ma04Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-04-overview', kind: 'diagram', role: 'overview',
    title: 'Host 管理上下文，Client 分别连接 Server',
    alt: '一个 Host 管理完整对话及两个 Client，两个 Client 分别连接制度和工单 Server。',
    longDescription: '从左向右阅读。左侧大框代表企业资料助手 Host，内部包含上下文与授权控制，以及制度 Client 和工单 Client。Host 将本次工作所需的信息交给对应 Client。两条独立连接分别通向右侧制度 Server 与工单 Server，每条连接都显示请求和结果两个方向。Server 提供各自能力，Host 控制跨服务的信息流。图中两个 Server 只说明两个能力接入点，无法据此判断自主 Agent 数量；实际身份、授权和数据隔离仍需要实现证据。',
    caption: '按 MCP 2026-07-28 表达角色责任；连接数量无法证明 Agent 数量。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-04-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-architecture'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['relationship', 'boundary'],
  },
  {
    id: 'visual-ma-04-detail', kind: 'diagram', role: 'comparison',
    title: '三类原语各有发现与使用方法',
    alt: 'Tools、Resources、Prompts 分别通过 list 发现，再通过 call、read、get 获得能力结果、上下文或消息模板。',
    longDescription: '图形由上到下分为三行，每行从左向右阅读。Tools 一行先标明 model-controlled，再由 tools/list 通向 tools/call，右端为可调用能力的执行结果。Resources 一行标明 application-driven，由 resources/list 通向 resources/read，右端为指定 URI 的内容。Prompts 一行标明 user-controlled，由 prompts/list 通向 prompts/get，右端为按参数取得的消息模板。箭头强调目录发现以后还需要具体操作。三种设计定位没有限定唯一界面，目录可见与操作获准仍需分别验证。',
    caption: '原语的产物与方法相互对应；list 不等于读取正文或执行工具。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-04-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['process', 'relationship'],
  },
]);
