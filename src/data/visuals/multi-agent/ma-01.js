import { deepFreezeVisual } from '../visual-contract.js';

export const ma01Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-01-overview', kind: 'diagram', role: 'overview',
    title: '多 Agent 采用判断从基线开始',
    alt: '从 baseline 具体限制，经过任务依赖和质量成本比较，形成有适用范围的采用决定。',
    longDescription: '从左到右阅读四个相连区域。第一区域记录单 Agent baseline 已经出现的失败，区分资料、提示和工作范围问题。第二区域检查输入依赖与共享状态，寻找可以独立推进的工作。第三区域比较同一任务条件下的质量、总资源使用和等待时间。第四区域形成采用、继续试验或保留简单方案的决定，并保留适用范围与尚缺证据。箭头表示设计判断的顺序，图中没有把任务复杂度直接换算为 Agent 数量。',
    caption: '原创判断流程：任务结构与可测收益共同决定采用范围，角色数量本身不构成改进证据。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-01-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-effective-agents', 'res-ma-langchain-multi-agent'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['decision', 'tradeoff'],
  },
  {
    id: 'visual-ma-01-detail', kind: 'diagram', role: 'mechanism',
    title: '独立调查与顺序工单有不同依赖',
    alt: '准备任务后，政策与渠道调查并行，汇总等待两份结果，后续工单按状态与确认顺序处理。',
    longDescription: '先阅读左侧的任务准备，它确定员工问题与资料版本。箭头分别进入上方政策检索 A 和下方渠道检索 B，两条路径表示可独立推进的只读调查。两份结果共同进入中间的证据合并，只有必要结果齐备才继续。右侧展示后续工单流程，按读取当前状态、确认、创建的顺序进行。图把信息依赖与业务前置条件连在一起，说明增加 worker 不能取消必须等待的结果，也没有为共享写入提供自动保护。',
    caption: '原创维修调查案例。只读分工可并行；后续业务步骤仍需满足自己的前置条件。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-01-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-effective-agents', 'res-ma-research-system'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['relationship', 'boundary'],
  },
]);
