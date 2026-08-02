function node(id, label, x, y, width = 200, height = 88, kind = 'stage') {
  return { id, label, x, y, width, height, kind };
}

function edge(id, from, to, points, label = undefined, labelAt = undefined, kind = 'forward') {
  return {
    id,
    from,
    to,
    points,
    ...(label ? { label } : {}),
    ...(labelAt ? { labelAt } : {}),
    kind,
  };
}

function graphScene(id, title, subtitle, type, topology, nodes, edges) {
  return {
    id,
    title,
    subtitle,
    type,
    topology,
    nodes,
    edges,
  };
}

const scenes = [
  graphScene(
    'visual-agent-01-boundary-spectrum',
    '决策权落在哪里？',
    '固定路径与模型选路构成连续谱；权限始终由宿主划定。',
    'spectrum',
    'decision-authority-continuum',
    [
      node('model', 'MODEL\n生成候选', 60, 260, 180),
      node('app', 'APP\n确定性调用', 340, 260, 180),
      node('workflow', 'WORKFLOW\n预设分支', 620, 260, 180),
      node('agent', 'AGENT\n边界内选路', 900, 260, 180, 88, 'controlled'),
    ],
    [
      edge('model-app', 'model', 'app', [[240, 304], [340, 304]], 'OUTPUT', [290, 224]),
      edge('app-workflow', 'app', 'workflow', [[520, 304], [620, 304]], 'ORCHESTRATE', [570, 224]),
      edge('workflow-agent', 'workflow', 'agent', [[800, 304], [900, 304]], 'AUTHORIZE', [850, 224]),
    ],
  ),
  graphScene(
    'visual-agent-01-action-feedback-loop',
    '最小行动闭环',
    '状态只有在可信 observation 到达后才能更新。',
    'loop',
    'directed-action-feedback',
    [
      node('goal-state', 'GOAL + STATE\n当前可信事实', 60, 240, 210),
      node('decide', 'DECIDE\n候选动作', 330, 240, 210),
      node('host-act', 'HOST ACT\n校验并执行', 600, 240, 210, 88, 'host'),
      node('observation', 'OBSERVATION\n证据回填', 870, 240, 210, 88, 'evidence'),
    ],
    [
      edge('state-decide', 'goal-state', 'decide', [[270, 284], [330, 284]], 'READ', [300, 205]),
      edge('decide-act', 'decide', 'host-act', [[540, 284], [600, 284]], 'PROPOSE', [570, 205]),
      edge('act-observe', 'host-act', 'observation', [[810, 284], [870, 284]], 'EXECUTE', [840, 205]),
      edge(
        'observe-state',
        'observation',
        'goal-state',
        [[975, 328], [975, 480], [165, 480], [165, 328]],
        'TRUSTED FEEDBACK',
        [570, 480],
        'feedback',
      ),
    ],
  ),
  graphScene(
    'visual-agent-02-task-contract',
    '把意图编译成任务契约',
    '成功标准与停止条件先于执行。',
    'decision',
    'task-contract-gates',
    [
      node('intent', 'INTENT\n用户意图', 60, 220, 190),
      node('contract', 'CONTRACT\n目标 + 约束', 320, 220, 210),
      node('success', 'SUCCESS\n证据谓词', 600, 220, 210, 88, 'evidence'),
      node('termination', 'TERMINATION\n出口判定', 880, 220, 220, 88, 'decision'),
      node('done', 'DONE\n证据满足', 710, 410, 170, 78, 'outcome'),
      node('blocked', 'BLOCKED\n缺条件 / 需交接', 940, 410, 190, 78, 'blocked'),
    ],
    [
      edge('intent-contract', 'intent', 'contract', [[250, 264], [320, 264]], 'COMPILE', [285, 185]),
      edge('contract-success', 'contract', 'success', [[530, 264], [600, 264]], 'BIND', [565, 185]),
      edge('success-termination', 'success', 'termination', [[810, 264], [880, 264]], 'CHECK', [845, 185]),
      edge('termination-done', 'termination', 'done', [[950, 308], [950, 365], [795, 365], [795, 410]], 'TRUE', [875, 365]),
      edge('termination-blocked', 'termination', 'blocked', [[1030, 308], [1030, 410]], 'UNKNOWN', [1090, 360]),
    ],
  ),
  graphScene(
    'visual-agent-02-state-event-log',
    '计划、状态机与事件日志',
    '自然语言计划可改；状态机控制；event log 负责耐久取证。',
    'state-machine',
    'event-sourced-recovery',
    [
      node('plan', 'PLAN\n可修订建议', 50, 220, 180),
      node('state-machine', 'STATE MACHINE\n合法迁移', 280, 220, 210, 88, 'decision'),
      node('event-log', 'EVENT LOG\n追加事实', 540, 220, 200, 88, 'evidence'),
      node('checkpoint', 'CHECKPOINT\n游标 + 版本', 790, 220, 210, 88, 'host'),
      node('recovery', 'RECOVERY\n重放并核验', 455, 420, 220, 82, 'controlled'),
    ],
    [
      edge('plan-state', 'plan', 'state-machine', [[230, 264], [280, 264]], 'CONSTRAIN', [255, 185]),
      edge('state-event', 'state-machine', 'event-log', [[490, 264], [540, 264]], 'APPEND', [515, 185]),
      edge('event-checkpoint', 'event-log', 'checkpoint', [[740, 264], [790, 264]], 'CURSOR', [765, 185]),
      edge('checkpoint-recovery', 'checkpoint', 'recovery', [[895, 308], [895, 370], [565, 370], [565, 420]], 'RESUME', [750, 370]),
      edge(
        'recovery-state',
        'recovery',
        'state-machine',
        [[455, 461], [390, 461], [390, 308]],
        'REPLAY',
        [330, 400],
        'feedback',
      ),
    ],
  ),
  graphScene(
    'visual-agent-03-tool-protocol',
    '工具调用不是执行证明',
    '候选调用必须穿过宿主授权并以 observation 闭环。',
    'protocol',
    'host-authorized-tool-call',
    [
      node('definition', 'DEFINITION\nSchema + capability', 50, 220, 220),
      node('selection', 'SELECTION\n候选参数', 320, 220, 200),
      node('host', 'AUTH + EXEC\n宿主边界', 570, 220, 210, 88, 'host'),
      node('observation', 'OBSERVATION\ncallId + 结果', 830, 220, 220, 88, 'evidence'),
      node('state', 'STATE UPDATE\n仅吸收可信证据', 830, 420, 220, 82, 'controlled'),
    ],
    [
      edge('definition-selection', 'definition', 'selection', [[270, 264], [320, 264]], 'DISCOVER', [295, 185]),
      edge('selection-host', 'selection', 'host', [[520, 264], [570, 264]], 'VALIDATE', [545, 185]),
      edge('host-observation', 'host', 'observation', [[780, 264], [830, 264]], 'CORRELATE', [805, 185]),
      edge('observation-state', 'observation', 'state', [[940, 308], [940, 420]], 'EVIDENCE', [1020, 365]),
    ],
  ),
  graphScene(
    'visual-agent-03-skills-mcp-boundary',
    'Skills、MCP 与 Agent 的边界',
    '知识封装、互操作协议与控制循环解决不同问题。',
    'layers',
    'responsibility-boundary-stack',
    [
      node('skills', 'SKILLS · 操作知识与渐进披露', 180, 175, 840, 64, 'layer'),
      node('agent-loop', 'AGENT LOOP · 决定何时以及为何调用', 180, 270, 840, 64, 'controlled'),
      node('mcp', 'MCP · 工具发现与能力互操作协议', 180, 365, 840, 64, 'protocol'),
      node('host', 'HOST · 授权、执行、审计与停止权', 180, 460, 840, 64, 'host'),
    ],
    [
      edge('skills-agent', 'skills', 'agent-loop', [[600, 239], [600, 270]], 'INFORM', [700, 254]),
      edge('agent-mcp', 'agent-loop', 'mcp', [[600, 334], [600, 365]], 'SELECT', [700, 349]),
      edge('mcp-host', 'mcp', 'host', [[600, 429], [600, 460]], 'REQUEST', [700, 444]),
    ],
  ),
  graphScene(
    'visual-agent-04-react-cycle',
    '可公开审计的 ReAct 循环',
    '记录决策摘要与证据，不要求泄露 private chain-of-thought。',
    'loop',
    'directed-react-feedback',
    [
      node('reason', 'REASON\n可公开决策摘要', 60, 240, 210),
      node('action', 'ACTION\n结构化候选', 330, 240, 210),
      node('observation', 'OBSERVATION\n环境证据', 600, 240, 210, 88, 'evidence'),
      node('state', 'STATE\n受证据更新', 870, 240, 210, 88, 'controlled'),
    ],
    [
      edge('reason-action', 'reason', 'action', [[270, 284], [330, 284]], 'PROPOSE', [300, 205]),
      edge('action-observation', 'action', 'observation', [[540, 284], [600, 284]], 'HOST ACT', [570, 205]),
      edge('observation-state', 'observation', 'state', [[810, 284], [870, 284]], 'ABSORB', [840, 205]),
      edge(
        'state-reason',
        'state',
        'reason',
        [[975, 328], [975, 480], [165, 480], [165, 328]],
        'NEXT CYCLE',
        [570, 480],
        'feedback',
      ),
    ],
  ),
  graphScene(
    'visual-agent-04-bounded-loop',
    '有界循环的确定性出口',
    '每轮先检查完成、阻塞与预算，再决定继续或停止。',
    'decision',
    'bounded-loop-exits',
    [
      node('guard', 'GUARD\n完成？阻塞？预算？', 60, 220, 220, 92, 'decision'),
      node('act', 'ACT\n预留预算后执行', 360, 220, 220, 92, 'host'),
      node('ledger', 'BUDGET LEDGER\nMAX ROUNDS 4\nTOOL CALLS 8 · TIME 90s', 820, 210, 280, 112, 'evidence'),
      node('continue', 'CONTINUE', 60, 430, 180, 72, 'controlled'),
      node('stop', 'STOP', 280, 430, 180, 72, 'outcome'),
      node('blocked', 'BLOCKED', 500, 430, 180, 72, 'blocked'),
      node('budget', 'BUDGET EXHAUSTED', 720, 430, 220, 72, 'blocked'),
    ],
    [
      edge('guard-act', 'guard', 'act', [[280, 266], [360, 266]], 'READY', [320, 190]),
      edge('act-ledger', 'act', 'ledger', [[580, 266], [820, 266]], 'DEBIT', [700, 230]),
      edge('act-continue', 'act', 'continue', [[470, 312], [470, 380], [150, 380], [150, 430]], 'MORE WORK', [320, 380]),
      edge('guard-stop', 'guard', 'stop', [[130, 312], [130, 350], [370, 350], [370, 430]], 'DONE', [270, 350]),
      edge('guard-blocked', 'guard', 'blocked', [[210, 312], [210, 330], [590, 330], [590, 430]], 'NO PRECONDITION', [470, 330]),
      edge('guard-budget', 'guard', 'budget', [[60, 266], [20, 266], [20, 550], [830, 550], [830, 502]], 'LIMIT HIT', [620, 550]),
      edge(
        'continue-guard',
        'continue',
        'guard',
        [[60, 466], [35, 466], [35, 300], [60, 300]],
        undefined,
        undefined,
        'feedback',
      ),
    ],
  ),
  graphScene(
    'visual-agent-05-planning-modes',
    '规划模式按不确定性升级',
    '关键事实越晚出现，越需要在线重规划或显式依赖图。',
    'planning-graph',
    'uncertainty-escalation',
    [
      node('task', 'TASK\n依赖与不确定性', 50, 270, 200, 88, 'decision'),
      node('direct', 'DIRECT\n一步可证', 330, 170, 190),
      node('plan', 'PLAN-THEN-ACT\n低变化路径', 330, 370, 210),
      node('replan', 'REPLAN\n观察驱动', 650, 170, 190, 88, 'controlled'),
      node('graph', 'WORKFLOW GRAPH\n显式依赖', 650, 370, 210, 88, 'protocol'),
      node('verified', 'VERIFIED EXIT\n统一验收', 950, 270, 190, 88, 'evidence'),
    ],
    [
      edge('task-direct', 'task', 'direct', [[250, 290], [285, 290], [285, 214], [330, 214]], 'STABLE', [285, 235]),
      edge('task-plan', 'task', 'plan', [[250, 338], [285, 338], [285, 414], [330, 414]], 'KNOWN', [290, 390]),
      edge('direct-verified', 'direct', 'verified', [[425, 170], [425, 155], [920, 155], [920, 290], [950, 290]], 'ONE STEP', [710, 155]),
      edge('plan-replan', 'plan', 'replan', [[540, 395], [600, 395], [600, 214], [650, 214]], 'NEW FACTS', [600, 315]),
      edge('plan-graph', 'plan', 'graph', [[540, 435], [650, 435]], 'DURABLE', [595, 475]),
      edge('replan-verified', 'replan', 'verified', [[840, 200], [880, 200], [880, 314], [950, 314]]),
      edge('graph-verified', 'graph', 'verified', [[860, 435], [900, 435], [900, 338], [950, 338]]),
    ],
  ),
  graphScene(
    'visual-agent-05-orchestration-graph',
    '编排图表达依赖、并行与汇合',
    '仅独立分支并行；join 对共享状态与证据做统一核验。',
    'dag',
    'parallel-fork-join',
    [
      node('decompose', 'DECOMPOSE\n任务拆分', 50, 270, 200),
      node('branch-a', 'BRANCH A\n独立取证', 350, 180, 200),
      node('branch-b', 'BRANCH B\n独立执行', 350, 370, 200),
      node('join', 'JOIN\n2 INPUTS 对账', 690, 270, 200, 88, 'decision'),
      node('validate', 'VALIDATE\n共同状态 + 证据', 970, 270, 180, 88, 'evidence'),
    ],
    [
      edge('decompose-a', 'decompose', 'branch-a', [[250, 294], [300, 294], [300, 224], [350, 224]], '2 PARALLEL BRANCHES', [420, 157]),
      edge('decompose-b', 'decompose', 'branch-b', [[250, 334], [300, 334], [300, 414], [350, 414]]),
      edge('a-join', 'branch-a', 'join', [[550, 224], [620, 224], [620, 294], [690, 294]], 'JOIN INPUT 1', [620, 190]),
      edge('b-join', 'branch-b', 'join', [[550, 414], [640, 414], [640, 334], [690, 334]], 'JOIN INPUT 2', [640, 440]),
      edge('join-validate', 'join', 'validate', [[890, 314], [970, 314]], 'CONSISTENT', [930, 240]),
    ],
  ),
  graphScene(
    'visual-agent-06-correction-ladder',
    '纠错阶梯',
    'Reflection 只能提出修订；独立验证决定接受还是拒绝。',
    'ladder',
    'retry-replan-reflect-validate',
    [
      node('failure', 'FAILURE\n分类', 40, 260, 150),
      node('retry', 'RETRY\nATTEMPT 1 → ATTEMPT 2\nMAX RETRIES 2', 225, 240, 210, 128, 'controlled'),
      node('replan', 'REPLAN\n换路径', 475, 260, 170),
      node('reflect', 'REFLECT\n形成修订假设', 685, 260, 190),
      node('validate', 'VALIDATE\n独立外部证明', 915, 260, 200, 88, 'evidence'),
      node('accept', 'ACCEPT', 815, 440, 140, 70, 'outcome'),
      node('reject', 'REJECT', 1010, 440, 140, 70, 'blocked'),
    ],
    [
      edge('failure-retry', 'failure', 'retry', [[190, 304], [225, 304]], 'TRANSIENT', [208, 205]),
      edge('retry-replan', 'retry', 'replan', [[435, 304], [475, 304]], 'STILL FAILS', [455, 205]),
      edge('replan-reflect', 'replan', 'reflect', [[645, 304], [685, 304]], 'SUMMARIZE', [665, 205]),
      edge('reflect-validate', 'reflect', 'validate', [[875, 304], [915, 304]], 'PROPOSE', [895, 205]),
      edge('validate-accept', 'validate', 'accept', [[975, 348], [975, 395], [885, 395], [885, 440]], 'PROVED', [930, 395]),
      edge('validate-reject', 'validate', 'reject', [[1055, 348], [1055, 440]], 'NOT PROVED', [1100, 395]),
    ],
  ),
  graphScene(
    'visual-agent-06-durable-recovery',
    '耐久恢复属于 Harness',
    '未知副作用先 reconciliation，不能盲目重试。',
    'state-machine',
    'reconciliation-recovery',
    [
      node('failure', 'FAILURE\n超时 / 崩溃', 50, 260, 190),
      node('checkpoint', 'CHECKPOINT\n动作 ID + 状态', 320, 260, 210, 88, 'host'),
      node('reconcile', 'RECONCILE\n查询副作用证据', 610, 260, 220, 88, 'evidence'),
      node('resume', 'RESUME\n已发生 / 幂等', 930, 170, 190, 78, 'outcome'),
      node('blocked', 'BLOCKED\n结果仍未知', 930, 290, 190, 78, 'blocked'),
      node('handoff', 'HANDOFF\n人工处置', 930, 410, 190, 78, 'controlled'),
    ],
    [
      edge('failure-checkpoint', 'failure', 'checkpoint', [[240, 304], [320, 304]], 'PERSIST', [280, 260]),
      edge('checkpoint-reconcile', 'checkpoint', 'reconcile', [[530, 304], [610, 304]], 'QUERY', [570, 260]),
      edge('reconcile-resume', 'reconcile', 'resume', [[830, 285], [875, 285], [875, 209], [930, 209]], 'KNOWN', [875, 245]),
      edge('reconcile-blocked', 'reconcile', 'blocked', [[830, 325], [880, 325], [880, 329], [930, 329]], 'UNKNOWN', [880, 355]),
      edge('blocked-handoff', 'blocked', 'handoff', [[1025, 368], [1025, 410]], 'ESCALATE', [1100, 390]),
    ],
  ),
  graphScene(
    'visual-agent-07-context-layers',
    '上下文对象分层',
    '本轮 context 是投影视图，不等于 transcript、state 或长期存储。',
    'layers',
    'context-projection-stack',
    [
      node('transcript', 'TRANSCRIPT · 原始交互事件', 140, 165, 920, 60, 'layer'),
      node('state', 'STATE · 结构化当前事实', 140, 245, 920, 60, 'controlled'),
      node('scratchpad', 'SCRATCHPAD · 临时工作，不作事实证据', 140, 325, 920, 60, 'layer'),
      node('evidence', 'RETRIEVED EVIDENCE · 来源 + 版本', 140, 405, 920, 60, 'evidence'),
      node('context', 'CONTEXT · 本轮按权限与预算装配的投影', 140, 485, 920, 60, 'host'),
    ],
    [
      edge('transcript-state', 'transcript', 'state', [[600, 225], [600, 245]], 'REDUCE', [1105, 235]),
      edge('state-scratch', 'state', 'scratchpad', [[600, 305], [600, 325]], 'GUIDE', [1105, 315]),
      edge('scratch-evidence', 'scratchpad', 'evidence', [[600, 385], [600, 405]], 'QUERY', [1105, 395]),
      edge('evidence-context', 'evidence', 'context', [[600, 465], [600, 485]], 'SELECT', [1105, 475]),
    ],
  ),
  graphScene(
    'visual-agent-07-provenance-budget',
    '压缩与外置保留来源',
    '摘要、检索证据与长期记忆必须保留版本和回取指针。',
    'flow',
    'provenance-preserving-projection',
    [
      node('evidence', 'EVIDENCE\nsource + version', 50, 240, 210, 88, 'evidence'),
      node('budget', 'BUDGET\n选择 + 压缩', 320, 240, 200),
      node('offload', 'OFFLOAD\n稳定指针', 580, 240, 200, 88, 'host'),
      node('context', 'CONTEXT\n可追溯投影', 850, 240, 210, 88, 'controlled'),
      node('retrieve', 'AUTHORIZED RETRIEVAL\nhash + ACL 核验', 580, 430, 250, 80, 'protocol'),
    ],
    [
      edge('evidence-budget', 'evidence', 'budget', [[260, 284], [320, 284]], 'RANK', [290, 205]),
      edge('budget-offload', 'budget', 'offload', [[520, 284], [580, 284]], 'COMPRESS', [550, 205]),
      edge('offload-context', 'offload', 'context', [[780, 284], [850, 284]], 'POINTER', [815, 205]),
      edge('offload-retrieve', 'offload', 'retrieve', [[680, 328], [680, 430]], 'ON DEMAND', [780, 380]),
      edge('retrieve-context', 'retrieve', 'context', [[830, 470], [955, 470], [955, 328]], 'VERIFIED', [900, 500]),
    ],
  ),
  graphScene(
    'visual-agent-08-end-to-end',
    '单 Agent 端到端控制面',
    '目标、工具、状态、验证与终止共同组成可上线闭环。',
    'control-loop',
    'validated-agent-control-loop',
    [
      node('contract', 'CONTRACT\n目标 + 约束', 60, 240, 210),
      node('loop', 'AGENT LOOP\n状态 + 候选动作', 330, 240, 210, 88, 'controlled'),
      node('tools', 'TOOLS\n最小权限执行', 600, 240, 210, 88, 'host'),
      node('validator', 'VALIDATOR\n完成证据裁决', 870, 240, 210, 88, 'evidence'),
      node('done', 'DONE\n显式终止', 870, 440, 210, 74, 'outcome'),
    ],
    [
      edge('contract-loop', 'contract', 'loop', [[270, 284], [330, 284]], 'DRIVE', [300, 205]),
      edge('loop-tools', 'loop', 'tools', [[540, 284], [600, 284]], 'CALL', [570, 205]),
      edge('tools-validator', 'tools', 'validator', [[810, 284], [870, 284]], 'OBSERVE', [840, 205]),
      edge('validator-done', 'validator', 'done', [[975, 328], [975, 440]], 'PROVED', [1050, 385]),
      edge(
        'validator-loop',
        'validator',
        'loop',
        [[900, 328], [900, 390], [435, 390], [435, 328]],
        'CONTINUE',
        [640, 390],
        'feedback',
      ),
    ],
  ),
  {
    id: 'visual-agent-08-pressure-matrix',
    title: '上线前压力矩阵',
    subtitle: '故障必须落到可观察、可恢复、可评测的控制出口。',
    type: 'matrix',
    topology: 'failure-control-exit-matrix',
    columns: [
      { id: 'failure', label: 'FAILURE', width: 210 },
      { id: 'signal', label: 'SIGNAL', width: 245 },
      { id: 'control', label: 'CONTROL', width: 260 },
      { id: 'exit', label: 'EXIT', width: 320 },
    ],
    rows: [
      { id: 'tool', cells: ['TOOL FAILURE', 'ERROR + CALL ID', 'RETRY / RECONCILE', 'RECOVERED / BLOCKED'] },
      { id: 'ambiguous', cells: ['AMBIGUOUS SUCCESS', 'MISSING PROOF', 'VALIDATE', 'BLOCKED'] },
      { id: 'stale', cells: ['STALE CONTEXT', 'VERSION MISMATCH', 'REFRESH', 'REPLAN'] },
      { id: 'unauthorized', cells: ['UNAUTHORIZED ACTION', 'POLICY DENY', 'REJECT', 'STOP'] },
      { id: 'loop', cells: ['LOOP EXHAUSTED', 'ROUND 4 / 4', 'CHECKPOINT', 'HANDOFF'] },
      { id: 'drift', cells: ['VERSION DRIFT', 'CONTRACT CHANGED', 'MIGRATE', 'REGRESSION TEST'] },
    ],
  },
];

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const agentMechanismScenes = deepFreeze(scenes);

const agentMechanismScenesById = new Map(
  agentMechanismScenes.map((entry) => [entry.id, entry]),
);

export function getAgentMechanismScene(id) {
  return agentMechanismScenesById.get(id);
}
