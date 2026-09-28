import { deepFreeze } from '../multi-agent-shared.js';

export const ma04Lesson = deepFreeze({
  id: 'ma-04',
  moduleId: 'multi-agent-mcp',
  order: 4,
  title: 'MCP 角色与 tools、resources、prompts',
  summary: '用企业资料助手说明 Host、Client、Server 的职责，区分发现目录、读取内容、取得模板和执行工具。',
  durationMinutes: 27,
  objectives: [
    '画出 Host、Client 与 Server 的关系，说明上下文与安全责任及其验证范围',
    '为 tools、resources、prompts 选择发现和使用方法，写出输入、产物与业务边界',
  ],
  concepts: ['Host、Client、Server', '三类原语与控制方式', '发现目录与具体操作', 'inputSchema 与 outputSchema', '服务身份与内容信任'],
  explanations: [
    {
      heading: '角色关系说明连接与责任',
      body: 'Host 管理模型应用、上下文与授权流程，每个 Client 对应一个 Server。服务数量无法说明 Agent 数量；接入图还应标出业务数据位置与执行权限的验证方。',
      keyPoints: ['一个 Host 可以管理多个 Client', 'Server 可以本地或远程运行', '角色分工需要实际实现证据'],
    },
    {
      heading: '按产物选择原语和方法',
      body: 'Tool 提供可调用能力，Resource 提供上下文数据，Prompt 提供消息模板。list 只完成发现，call、read、get 才取得具体产物；schema 说明结构，权限和业务结果仍需验证。',
      keyPoints: ['三类原语各有发现与使用方法', 'model-controlled 等术语没有限定唯一界面', '模板选择与动作授权分别记录'],
    },
  ],
  exercise: {
    title: '制作企业资料助手接入目录',
    brief: '围绕制度读取与工单操作，交付能让另一位工程师继续验证的角色图和原语目录。',
    steps: [
      '画出一个 Host 与制度、工单两组 Client 和 Server，标出上下文、数据与安全责任',
      '为 Tool、Resource、Prompt 各写一个用途，填写 list 与具体使用方法、输入和产物',
      '为每项能力补充身份、授权、同名处理和内容信任边界，记录 revision 与 SDK 待查项',
    ],
    deliverable: '一份包含角色关系图、三类原语目录、明确方法和产物、服务身份及授权边界的接入说明，并区分规范设计与实际运行证据。',
  },
  quiz: [
    {
      id: 'quiz-ma-04-1',
      prompt: '资料助手创建两个 Client，分别连接制度和工单 Server，可以据此确定什么？',
      choices: ['一定拥有两个自主 Agent', '存在两个服务连接，Agent 数量还需查看应用设计', '两个 Server 必须运行在同一台机器'],
      answerIndex: 1,
      explanation: 'Client 与 Server 的对应关系说明接入结构。Agent 的目标、决策和协作由应用设计决定，服务数量与部署位置都不能替它作出判断。',
    },
    {
      id: 'quiz-ma-04-2',
      prompt: '员工需要阅读目录中某个制度 URI 的正文，应该选择哪个操作？',
      choices: ['resources/read', 'prompts/list', '仅查看 resources/list 就认定正文已读取'],
      answerIndex: 0,
      explanation: 'resources/list 帮助发现资源，resources/read 才读取指定 URI 的内容。读取仍需满足实际授权条件，资源出现在目录里不能替代正文和权限检查。',
    },
  ],
  interviewQuestionIds: ['iq-ma-04-1', 'iq-ma-04-2', 'iq-ma-04-3'],
  completionCriteria: [
    '能够解释 Host、Client、Server 的责任，并指出连接数量无法证明 Agent 数量',
    '能够用接入目录区分发现和使用，说明 schema、内容信任与业务授权的作用范围',
  ],
});

export const ma04Interviews = deepFreeze([
  {
    id: 'iq-ma-04-1', lessonId: 'ma-04',
    question: 'Host、Client、Server 分别负责什么，为什么连接多个 Server 不能证明使用了多 Agent？',
    shortAnswer: 'Host 管理模型应用、上下文和 Client，每个 Client 对应一个 Server。Server 提供能力，Agent 是否拥有独立目标与决策需要从应用设计中确认。',
    deepDive: ['说明企业资料助手如何为制度和工单分别管理 Client，并由 Host 控制跨服务上下文。', '检查数据、身份和授权责任的实际实现；仅有角色名称无法证明隔离与最小访问已经实现。'],
    misconceptions: ['把 Server 数量直接当成 Agent 数量。'],
    followUps: ['如果两个 Server 都有 search，Host 应如何让调用目标保持明确？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-04-2', lessonId: 'ma-04',
    question: 'tools、resources、prompts 如何选择，发现后还需要哪些操作？',
    shortAnswer: 'Tools 提供可调用能力，Resources 提供上下文数据，Prompts 提供用户可选择的消息模板。发现后分别通过 tools/call、resources/read、prompts/get 获得具体产物。',
    deepDive: ['以制度读取、材料核对模板和工单创建说明三类原语，并解释 model-controlled、application-driven、user-controlled 的设计定位。', '目录可以为空，也可能随授权条件变化；列出能力不能证明已经读取内容或执行动作。'],
    misconceptions: ['把 list 的目录结果视为所有正文和执行结果。'],
    followUps: ['Prompt 由 Server 定义，用户选择它是否足以授权其中所有工具动作？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-ma-04-3', lessonId: 'ma-04',
    question: '工具 schema 和 annotations 能证明哪些内容，还需要什么验证？',
    shortAnswer: 'schema 约束输入和结构化输出的形态，annotations 提供行为提示；二者都不能代替资源授权、内容来源与业务验收，来自不可信 Server 的 annotations 也需要保留信任边界。',
    deepDive: ['说明 inputSchema、outputSchema 与 structuredContent 的对应关系，并注明当前 revision 允许任意 JSON 值的结构化结果。', '即使 schema 合法、工具自称只读，也要检查实际接口、资源归属和执行条件，判断能否满足用户目标。'],
    misconceptions: ['参数通过 schema 校验就一定有权执行。'],
    followUps: ['资源正文提出新的工具动作时，Host 应先验证哪些条件？'],
    frequency: '中', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
]);

export const ma04Coverage = deepFreeze([
  { fieldPath: 'objectives[0]', sectionId: 'ma04-integration-roles', sourceIds: ['res-ma-mcp-architecture'] },
  { fieldPath: 'objectives[1]', sectionId: 'ma04-primitive-selection', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
  { fieldPath: 'quiz[0]', sectionId: 'ma04-integration-roles', sourceIds: ['res-ma-mcp-architecture'] },
  { fieldPath: 'quiz[1]', sectionId: 'ma04-discovery-to-use', sourceIds: ['res-ma-mcp-resources'] },
  { fieldPath: 'interviewQuestionIds[0]', sectionId: 'ma04-integration-roles', sourceIds: ['res-ma-mcp-architecture'] },
  { fieldPath: 'interviewQuestionIds[1]', sectionId: 'ma04-discovery-to-use', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
  { fieldPath: 'interviewQuestionIds[2]', sectionId: 'ma04-host-trust', sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools'] },
  { fieldPath: 'exercise.steps[0]', sectionId: 'ma04-integration-roles', sourceIds: ['res-ma-mcp-architecture'] },
  { fieldPath: 'exercise.steps[1]', sectionId: 'ma04-discovery-to-use', sourceIds: ['res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
  { fieldPath: 'exercise.steps[2]', sectionId: 'ma04-integration-inventory', sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
  { fieldPath: 'exercise.deliverable', sectionId: 'ma04-integration-inventory', sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
  { fieldPath: 'completionCriteria[0]', sectionId: 'ma04-integration-roles', sourceIds: ['res-ma-mcp-architecture'] },
  { fieldPath: 'completionCriteria[1]', sectionId: 'ma04-integration-inventory', sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools', 'res-ma-mcp-resources', 'res-ma-mcp-prompts'] },
]);
