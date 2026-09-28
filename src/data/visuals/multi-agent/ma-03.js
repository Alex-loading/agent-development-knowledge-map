import { deepFreezeVisual } from '../visual-contract.js';

export const ma03Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-03-overview', kind: 'diagram', role: 'overview',
    title: '上下文从任务需要中选择',
    alt: '任务事实与约束经过选择进入 worker，上下文策略明确，结果返回来源和未解决项。',
    longDescription: '按从左到右的四个区域阅读。第一区域列出任务需要的事实、用户约束和资料版本。第二区域选择相关历史，保留状态时间范围，并说明哪些信息仍需核验。第三区域由 worker 在明确的输入和 state 配置下完成工作，可按需要传入历史，不能假定它自动知道所有主对话。第四区域返回结论、来源和未解决事项，供主 Agent 判断下一步。图表达信息范围，工具执行权限仍需单独检查。',
    caption: '选择性输入需要同时满足信息充分和范围清楚；默认新 state 与显式历史输入各有用途。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-03-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-langchain-subagents', 'res-ma-langchain-multi-agent'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['boundary', 'relationship'],
  },
  {
    id: 'visual-ma-03-detail', kind: 'diagram', role: 'process',
    title: '完成声明进入证据验收',
    alt: '缺引用的 completed 需要补证据，来源冲突需要核验，内容与证据满足要求才记录接受。',
    longDescription: '表格式流程从左到右是 worker 结果、证据检查和验收去向。第一行的 completed 声明缺少有效引用，无法核验，因此进入 needs-evidence。第二行包含互相矛盾的来源，需要检查版本与适用范围，进入 conflict 并安排核验。第三行内容覆盖任务且有有效证据，记录接受理由后进入 accepted。三行是原创教学判断，状态名称由本地设计；manager 还需检查 artifact 是否可访问和未完成项由谁继续处理。',
    caption: '原创验收示例。完成状态与业务接受分开记录，JSON 格式合法不能代替来源和内容检查。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-03-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['relationship', 'failure-mode'],
  },
]);
