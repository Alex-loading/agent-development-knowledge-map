function scene(id, title, subtitle, labels, edgeLabels) {
  const nodes = labels.map((label, index) => ({
    id: `${id}-node-${index + 1}`,
    label,
    x: 60 + index * 285,
    y: 270,
    width: 200,
    height: 104,
  }));
  const edges = edgeLabels.map((label, index) => ({
    id: `${id}-edge-${index + 1}`,
    from: nodes[index].id,
    to: nodes[index + 1].id,
    label,
  }));
  return { id, title, subtitle, nodes, edges };
}

const sceneSpecs = [
  ['visual-agent-01-boundary-spectrum', '决策权落在哪里？', '固定路径与模型选路构成连续谱；权限始终由宿主划定。', ['MODEL\n生成候选', 'APP\n确定性调用', 'WORKFLOW\n预设分支', 'AGENT\n边界内选路'], ['输出', '编排', '授权动作']],
  ['visual-agent-01-action-feedback-loop', '最小行动闭环', '状态只有在可信 observation 到达后才能更新。', ['GOAL + STATE', 'DECIDE\n候选动作', 'HOST ACT\n校验执行', 'OBSERVE\n证据回填'], ['读取', '授权', '更新']],
  ['visual-agent-02-task-contract', '把意图编译成任务契约', '成功标准与停止条件先于执行。', ['INTENT\n用户意图', 'CONTRACT\n目标与约束', 'SUCCESS\n证据谓词', 'TERMINATION\n出口'], ['编译', '绑定', '检查']],
  ['visual-agent-02-state-event-log', '计划、状态机与事件日志', '自然语言计划可改；状态机控制；event log 负责耐久取证。', ['PLAN\n可修订建议', 'STATE MACHINE\n当前阶段', 'EVENT LOG\n不可变变化', 'RECOVERY\n重放恢复'], ['约束', '追加', '重建']],
  ['visual-agent-03-tool-protocol', '工具调用不是执行证明', '候选调用必须穿过宿主授权并以 observation 闭环。', ['DEFINITION\nSchema', 'SELECTION\n候选参数', 'AUTH + EXEC\n宿主执行', 'OBSERVATION\n结果证据'], ['发现', '校验', '关联']],
  ['visual-agent-03-skills-mcp-boundary', 'Skills、MCP 与 Agent 的边界', '知识封装、互操作协议与控制循环解决不同问题。', ['SKILLS\n操作知识', 'MCP\n能力互操作', 'HOST\n权限执行', 'AGENT LOOP\n何时调用'], ['暴露', '授权', '编排']],
  ['visual-agent-04-react-cycle', '可公开审计的 ReAct 循环', '记录决策摘要与证据，不要求泄露 private chain-of-thought。', ['REASON\n决策摘要', 'ACTION\n结构化候选', 'OBSERVATION\n环境证据', 'STATE\n受证据更新'], ['提出', '执行', '吸收']],
  ['visual-agent-04-bounded-loop', '有界循环的出口', '每轮先检查完成、阻塞、预算与人工交接。', ['CHECK\n终止优先', 'DECIDE\n单/多/并行', 'ACT\n预算预留', 'STOP\n显式原因'], ['继续', '限权', '完成或退出']],
  ['visual-agent-05-planning-modes', '规划模式按不确定性升级', '越晚才能获得关键事实，越需要在线重规划。', ['DIRECT\n一步可证', 'PLAN-THEN-ACT\n低变化', 'REPLAN\n观察驱动', 'GRAPH\n显式依赖'], ['复杂度+', '不确定性+', '耐久性+']],
  ['visual-agent-05-orchestration-graph', '编排图表达依赖与委派', '并行只用于无依赖分支；汇合点验证共同状态。', ['DECOMPOSE\n任务拆分', 'DEPENDENCY\n先后关系', 'PARALLEL\n独立分支', 'JOIN + VALIDATE\n汇合核验'], ['建图', '调度', '对账']],
  ['visual-agent-06-correction-ladder', '纠错阶梯', 'Reflection 只能提出修订；独立验证决定是否接受。', ['RETRY\n同策略', 'REPLAN\n换路径', 'REFLECT\n提出假设', 'VALIDATE\n外部证明'], ['仍失败', '总结', '接受/拒绝']],
  ['visual-agent-06-durable-recovery', '耐久恢复属于 Harness', '未知副作用先 reconciliation，不能盲目重试。', ['FAILURE\n分类', 'CHECKPOINT\n持久状态', 'RECONCILE\n副作用对账', 'RESUME / HANDOFF\n受控出口'], ['记录', '核验', '恢复']],
  ['visual-agent-07-context-layers', '上下文对象分层', '本轮 context 是投影视图，不等于 transcript 或长期记忆。', ['TRANSCRIPT\n原始交互', 'STATE\n当前事实', 'SCRATCHPAD\n临时工作', 'CONTEXT\n本轮投影'], ['归约', '选择', '装配']],
  ['visual-agent-07-provenance-budget', '压缩与外置保留来源', '摘要、检索证据与长期记忆必须保留版本和回取指针。', ['EVIDENCE\nsource + version', 'BUDGET\n选择与压缩', 'OFFLOAD\n稳定指针', 'CONTEXT\n可追溯投影'], ['排序', '外置', '引用']],
  ['visual-agent-08-end-to-end', '单 Agent 端到端控制面', '目标、工具、状态、验证与终止共同组成可上线闭环。', ['CONTRACT\n目标约束', 'LOOP\n状态与动作', 'TOOLS\n最小权限', 'VALIDATOR\n完成证据'], ['驱动', '调用', '裁决']],
  ['visual-agent-08-pressure-matrix', '上线前压力矩阵', '故障必须落到可观察、可恢复、可评测的控制出口。', ['FAILURE\n工具/漂移', 'AMBIGUITY\n成功不明', 'BOUNDARY\n越权/陈旧', 'OUTCOME\n恢复/阻塞'], ['诊断', '核验', '处置']],
];

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const agentMechanismScenes = deepFreeze(
  sceneSpecs.map((spec) => scene(...spec)),
);

const agentMechanismScenesById = new Map(
  agentMechanismScenes.map((entry) => [entry.id, entry]),
);

export function getAgentMechanismScene(id) {
  return agentMechanismScenesById.get(id);
}
