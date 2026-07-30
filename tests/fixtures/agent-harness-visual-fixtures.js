function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function fixture(visualId, labels, values = []) {
  return {
    id: visualId.replace(/^visual-/, 'fixture-'),
    visualId,
    labels,
    values,
  };
}

export const agentHarnessVisualFixtures = deepFreeze([
  fixture('visual-harness-01-control-system', ['MODEL PROPOSES', 'HARNESS CONTROLS', 'SANDBOX EXECUTES', 'EVIDENCE RETURNS']),
  fixture('visual-harness-01-tool-transcript', ['RUN run-42', 'ATTEMPT 2', 'STEP 3', 'SESSION sbx-7', 'CALL call-9', 'OBSERVATION']),
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
