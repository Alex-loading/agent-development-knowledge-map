function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function fixture(visualId, labels, values = [], stepLabels = null) {
  return {
    id: visualId.replace(/^visual-/, 'fixture-'),
    visualId,
    labels,
    values,
    ...(stepLabels ? { stepLabels } : {}),
  };
}

function inventoryFixture(visualId, assessedOutcomes, cognitiveQuestion, storyboard) {
  return { visualId, assessedOutcomes, cognitiveQuestion, storyboard };
}

export const agentHarnessVisualFixtures = deepFreeze([
  fixture('visual-harness-01-control-system', ['MODEL PROPOSES', 'HARNESS CONTROLS', 'SANDBOX EXECUTES', 'EVIDENCE RETURNS']),
  fixture(
    'visual-harness-01-tool-transcript',
    ['RUN run-42', 'ATTEMPT 2', 'STEP 3', 'SESSION sbx-7', 'CALL call-9', 'OBSERVATION'],
    [],
    {
      'assets/visuals/agent-harness/harness-01-tool-transcript-step-1.svg': [
        'STEP 1 · PROPOSAL',
        'RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9',
        'MODEL PROPOSAL',
      ],
      'assets/visuals/agent-harness/harness-01-tool-transcript-step-2.svg': [
        'STEP 2 · EXECUTION',
        'RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9 · SESSION sbx-7',
        'HOST EXECUTION',
      ],
      'assets/visuals/agent-harness/harness-01-tool-transcript-step-3.svg': [
        'STEP 3 · OBSERVATION',
        'RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9 · SESSION sbx-7',
        'OBSERVATION',
        'Harness uses the observation to continue, wait or stop',
      ],
    },
  ),
  fixture('visual-harness-01-stop-guard', ['RUNNING', 'CONTINUE', 'WAIT', 'FAILED', 'COMPLETED', 'CANCELLED']),
  fixture('visual-harness-02-state-journal', ['IMMUTABLE EVENTS', 'PURE REDUCER', 'PROJECTION', 'CHECKPOINT', 'REPLAY']),
  fixture('visual-harness-02-checkpoint-gap', ['INTENT', 'REMOTE EFFECT', 'COMPLETION EVENT', 'CHECKPOINT', 'CRASH GAP']),
  fixture('visual-harness-02-versioned-resume', ['ACQUIRE LEASE', 'COMPARE VERSIONS', 'MIGRATE', 'BLOCK', 'REPLAY', 'VERIFY']),
  fixture('visual-harness-03-tool-governance', ['TOOL DEFINITION', 'MODEL DECISION', 'HOST REGISTRY', 'POLICY', 'ADAPTER', 'RESULT']),
  fixture('visual-harness-03-control-gates', ['1 SCHEMA', '2 AUTHORIZATION', '3 APPROVAL', '4 RUNTIME VALIDATION', 'REJECT', 'EXECUTE']),
  fixture('visual-harness-03-approval-resume', ['NORMALIZE INTENT', 'PERSIST DIGEST', 'AWAIT APPROVAL', 'REACQUIRE LEASE', 'REVALIDATE', 'EXECUTE']),
  fixture('visual-harness-04-sandbox-boundary', ['UNTRUSTED CODE', 'CAPABILITY GATES', 'SANDBOX', 'FILES', 'PROCESS', 'NETWORK', 'EVIDENCE']),
  fixture('visual-harness-04-isolation-stack', ['PROCESS', 'CONTAINER', 'gVisor', 'MICROVM', 'SHARED KERNEL', 'SEPARATE KERNEL']),
  fixture('visual-harness-04-vfs-session', ['SESSION A', 'SESSION B', 'FILES', 'GIT', 'BASH', 'SECRET REF', 'VERIFIED ARTIFACT']),
  fixture('visual-harness-05-bounded-run', ['OPEN LOOP', 'CLOSED LOOP', 'RUN BUDGET', 'TIME', 'STEPS', 'TOKENS', 'COST', 'SIDE EFFECTS']),
  fixture('visual-harness-05-deadline-cancel', ['TIMEOUT', 'DEADLINE', 'CANCEL', 'COMPENSATE', 'NOT ROLLBACK']),
  fixture('visual-harness-05-retry-budget', ['SHARED RETRY OWNER', 'ATTEMPT 1', 'ATTEMPT 2', 'ATTEMPT 3', 'STOP GUARD'], [3, 2, 1]),
  fixture('visual-harness-06-idempotent-recovery', ['ONE INTENT', 'STABLE KEY', 'ATTEMPT A', 'ATTEMPT B', 'REMOTE OPERATION', 'RECONCILE']),
  fixture('visual-harness-06-side-effect-journal', ['LOCAL JOURNAL', 'REMOTE SYSTEM', 'PENDING', 'UNKNOWN', 'SUCCEEDED', 'QUERY EVIDENCE']),
  fixture('visual-harness-06-evidence-decision', ['ACQUIRE LEASE', 'SKIP', 'RETRY', 'RECONCILE', 'MANUAL', 'FAIL']),
  fixture('visual-harness-07-orchestration-map', ['WORKFLOW', 'GRAPH', 'LOOP', 'PARALLEL', 'PIPELINE', 'ORCHESTRATION', 'MODEL JUDGMENT']),
  fixture('visual-harness-07-queue-lease', ['RECEIVE', 'VISIBILITY LEASE', 'CHECKPOINT', 'COMPLETE FACT', 'ACK', 'REDELIVERY', 'FENCE OLD WORKER']),
  fixture('visual-harness-07-backpressure', ['NORMAL', 'SOFT 70', 'HARD 90', 'SLOW', 'DEGRADE', 'REJECT', 'STAGED RECOVERY'], [70, 90]),
  fixture('visual-harness-08-long-horizon-handoff', ['ACTIVE CONTEXT', 'OFFLOADED EVIDENCE', 'AWAITING APPROVAL', 'BLOCKED', 'FAILED', 'CANCELLED', 'ALLOWED NEXT ACTION']),
  fixture('visual-harness-08-progressive-disclosure', ['COMPACT CATALOG', 'Install.md', 'SELECTED SKILL', 'LIFECYCLE HOOK', 'APPROVAL CHECKPOINT']),
  fixture('visual-harness-08-handoff-evidence', ['GOAL', 'STATE', 'EVENT CURSOR', 'APPROVALS', 'SIDE EFFECT LEDGER', 'ARTIFACT MANIFEST', 'HASH', 'NEXT ACTION']),
]);

export const agentHarnessVisualInventoryFixtures = deepFreeze([
  inventoryFixture('visual-harness-01-control-system', ['quiz-harness-01-1', 'iq-harness-01-1'], 'Harness 怎样把模型提议变成受控执行？课程总览控制面图。', 'Read 模型提议 → Runner → Policy → Runtime → Sandbox → Evidence；双线边界区分提议与执行权。Fixture freezes all visible state labels.'),
  inventoryFixture('visual-harness-01-tool-transcript', ['iq-harness-01-1', 'iq-harness-01-3'], '一次工具调用怎样跨 run、attempt、step、session 和 callId 保持身份？三步累积图。', 'Step 1 proposal, step 2 host execution, step 3 observation and next decision; each step preserves prior identifiers. Fixture freezes transcript labels and values.'),
  inventoryFixture('visual-harness-01-stop-guard', ['quiz-harness-01-2', 'iq-harness-01-2'], 'continue 与 stop 怎样由状态、预算和证据共同裁决？状态门图。', 'Running enters guard; evidence, budget, approval and cancellation produce continue, wait, fail, complete, or cancel branches. Fixture freezes state labels.'),
  inventoryFixture('visual-harness-02-state-journal', ['quiz-harness-02-1', 'iq-harness-02-1'], 'event、projection、checkpoint 各保存什么？课程总览分层图。', 'Immutable facts feed reducer projections; checkpoint stores cursor and versions; recovery replays from facts. Fixture freezes layer labels.'),
  inventoryFixture('visual-harness-02-checkpoint-gap', ['quiz-harness-02-2', 'iq-harness-02-2'], '崩溃发生在事件提交与 checkpoint 之间时怎样恢复？时间线。', 'Intent → effect evidence → completion event → checkpoint; crash markers expose two gaps and replay choices. Fixture freezes event order.'),
  inventoryFixture('visual-harness-02-versioned-resume', ['quiz-harness-02-2', 'iq-harness-02-3'], '新 worker 怎样在版本漂移后安全接管？恢复门图。', 'Acquire lease → compare model/prompt/tool/reducer versions → migrate or block → replay → verify projection. Fixture freezes gates and outcomes.'),
  inventoryFixture('visual-harness-03-tool-governance', ['iq-harness-03-1'], 'Tool Definition、模型决策与宿主 registry 怎样分工？课程总览泳道图。', 'Discovery catalog → model proposal → host registry lookup → policy → adapter/MCP boundary → result. Fixture freezes boundaries.'),
  inventoryFixture('visual-harness-03-control-gates', ['quiz-harness-03-1', 'iq-harness-03-2'], 'Schema、authorization、approval、runtime validation 为什么不能合并？四门管线。', 'Proposed call crosses four numbered gates; every gate has an explicit rejection branch. Fixture freezes gate labels.'),
  inventoryFixture('visual-harness-03-approval-resume', ['quiz-harness-03-2', 'iq-harness-03-3'], '批准绑定什么，恢复时又必须重验什么？暂停恢复图。', 'Normalize intent → persist digest → wait → decision → reacquire lease → revalidate → execute or re-request. Fixture freezes resume states.'),
  inventoryFixture('visual-harness-04-sandbox-boundary', ['quiz-harness-04-1', 'iq-harness-04-1'], '不可信代码从哪里进入，哪些能力必须被隔离？课程总览威胁边界图。', 'Untrusted code enters sandbox; filesystem, process, network, secrets and resources cross explicit capability gates; evidence exits separately. Fixture freezes zones.'),
  inventoryFixture('visual-harness-04-isolation-stack', ['quiz-harness-04-1', 'iq-harness-04-1'], 'Process、container、gVisor 与 microVM 提供哪些不同边界？比较栈。', 'Four columns compare kernel boundary, startup, density and remaining host controls without claiming absolute safety. Fixture freezes comparison labels.'),
  inventoryFixture('visual-harness-04-vfs-session', ['quiz-harness-04-2', 'iq-harness-04-2'], 'VFS provider 怎样按 session 和 capability 暴露最小文件面？会话隔离图。', 'Session A and B each receive scoped Files/Git/Bash capabilities; secrets remain references; artifact export crosses a verification gate. Fixture freezes scope labels.'),
  inventoryFixture('visual-harness-05-bounded-run', ['iq-harness-05-3'], 'open loop 与 closed loop 怎样共享硬预算与停止证据？课程总览图。', 'Both loop forms feed the same hierarchical time, step, token, cost and side-effect ledger; neither rank implies reliability. Fixture freezes budgets.'),
  inventoryFixture('visual-harness-05-deadline-cancel', ['quiz-harness-05-1', 'iq-harness-05-1'], 'timeout、deadline、cancel 与 rollback 的方向和效果有何不同？时间轴。', 'Local timeout, end-to-end deadline, cancellation propagation and independent compensation are shown as distinct events. Fixture freezes ordering.'),
  inventoryFixture('visual-harness-05-retry-budget', ['quiz-harness-05-2', 'iq-harness-05-2'], '重试怎样消耗共享预算并避免层层放大？预算漏斗。', 'Three retry layers collapse into one owner and one attempt ledger with backoff, jitter, deadline and stop guard. Fixture freezes attempt counts.'),
  inventoryFixture('visual-harness-06-idempotent-recovery', ['quiz-harness-06-2', 'iq-harness-06-1'], 'intent、attempt、key 与 checkpoint 怎样共同决定安全重放？课程总览图。', 'One intent owns one stable key across multiple attempts; journal and remote operation converge through reconciliation. Fixture freezes identity labels.'),
  inventoryFixture('visual-harness-06-side-effect-journal', ['quiz-harness-06-1', 'iq-harness-06-2'], 'unknown outcome 出现时账本里应有哪些证据？双时间线。', 'Local intent/journal/checkpoint and remote operation timelines diverge at response loss, then reconnect through query evidence. Fixture freezes states.'),
  inventoryFixture('visual-harness-06-evidence-decision', ['quiz-harness-06-1', 'iq-harness-06-3'], 'skip、retry、reconcile、manual、fail 分别需要什么证据？决策树。', 'Lease and evidence checks lead to five named outcomes; version mismatch blocks automatic replay. Fixture freezes decisions.'),
  inventoryFixture('visual-harness-07-orchestration-map', ['iq-harness-07-1'], 'workflow、graph、loop、parallel、pipeline 与 orchestration 怎样组合？课程总览地图。', 'Six control structures surround a shared orchestrator; model judgment enters only at semantic decision nodes. Fixture freezes structure labels.'),
  inventoryFixture('visual-harness-07-queue-lease', ['quiz-harness-07-1', 'iq-harness-07-2'], 'receive、visibility、checkpoint、ack 与 redelivery 的顺序是什么？队列生命周期图。', 'Receive → lease → checkpoint/extend → completion fact → ack; lease expiry branches to redelivery and fencing. Fixture freezes states.'),
  inventoryFixture('visual-harness-07-backpressure', ['quiz-harness-07-2', 'iq-harness-07-3'], 'soft/hard watermark 怎样把容量压力传回 producer？水位控制图。', 'Queue depth and oldest age cross soft then hard thresholds, triggering slow, degrade, reject, shed and staged recovery. Fixture freezes thresholds.'),
  inventoryFixture('visual-harness-08-long-horizon-handoff', ['quiz-harness-08-1', 'iq-harness-08-1'], '长任务如何停、卸载上下文并保留恢复入口？课程总览图。', 'Active context offloads evidence and artifacts, then records waiting/blocked/failed/cancelled with allowed next actions. Fixture freezes states.'),
  inventoryFixture('visual-harness-08-progressive-disclosure', ['quiz-harness-08-1', 'iq-harness-08-2'], 'Install.md、Skill 与 Hook 怎样按需加载并强制边界？渐进披露图。', 'Compact catalog → Install contract → selected Skill → lifecycle Hook → approval checkpoint; irrelevant detail remains unloaded. Fixture freezes layers.'),
  inventoryFixture('visual-harness-08-handoff-evidence', ['quiz-harness-08-2', 'iq-harness-08-3'], '陌生接管者如何从 bundle 验证状态与产物？证据包图。', 'Bundle links goal, state, event cursor, approvals, side-effect ledger, artifact manifest, hashes and next action; takeover verifies each reference. Fixture freezes fields.'),
]);
