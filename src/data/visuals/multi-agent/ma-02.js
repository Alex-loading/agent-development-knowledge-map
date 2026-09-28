import { deepFreezeVisual } from '../visual-contract.js';

export const ma02Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-02-overview', kind: 'diagram', role: 'overview',
    title: '沿返回路径识别回复责任',
    alt: '上行 specialist 返回 manager 再回复；下行 handoff 后由当前 specialist 回复并继续处理用户消息。',
    longDescription: '图分上下两条控制流。上行从 manager 的委托开始，specialist 完成有边界的工作后将结果返回 manager，由 manager 综合后回复用户。下行从入口 Agent 发起 handoff，控制权进入当前 specialist，随后由它向用户回复；用户下一条消息也返回当前 specialist。两行说明调用外形相近时，应通过返回目标与后续责任区分机制。图采用 OpenAI 的回复责任视角，LangChain 还允许单 Agent 根据状态切换配置。',
    caption: '按最终回复与后续消息的责任区分模式；不同框架的 handoff 实现范围需要明确标注。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-02-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-openai-orchestration', 'res-ma-langchain-handoffs', 'res-ma-langchain-subagents'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['comparison', 'relationship'],
  },
  {
    id: 'visual-ma-02-detail', kind: 'diagram', role: 'comparison',
    title: '相同任务，三种调度结果',
    alt: 'prepare 2 后检索 A 4 与 B 6，再 synthesize 3、verify 2；一个 worker 17，两个独立 worker 13，共享写入时 17。',
    longDescription: '从上方任务依赖图开始。prepare 持续两个时间单位，然后检索 A 持续四个、检索 B 持续六个；两项结果汇入 synthesize 的三个时间单位，之后 verify 再用两个。下方三张配置卡分别显示一个 worker 的总时长十七、两个独立 worker 的十三，以及两个 worker 共享写入对象时的十七。所有配置总任务工作量都是十七。共享写入采用串行规则；这些数字仅描述给定任务与约束，不预测真实模型质量、网络时间或资源费用。',
    caption: '固定教学时间模型。更多 worker 无法跳过前置依赖；共享写入按模型规则限制并行。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-02-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['mechanism', 'tradeoff'],
  },
]);
