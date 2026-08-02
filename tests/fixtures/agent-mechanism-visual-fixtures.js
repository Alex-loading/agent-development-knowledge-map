function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export const agentMechanismVisualFixtures = deepFreeze({
  loopBudget: {
    visualId: 'visual-agent-04-bounded-loop',
    labels: ['CONTINUE', 'STOP', 'BLOCKED', 'BUDGET EXHAUSTED'],
    values: {
      maxRounds: 4,
      maxToolCalls: 8,
      timeSeconds: 90,
    },
    renderedValues: ['MAX ROUNDS 4', 'TOOL CALLS 8', 'TIME 90s'],
  },
  dependencyGraph: {
    visualId: 'visual-agent-05-orchestration-graph',
    labels: ['DECOMPOSE', 'BRANCH A', 'BRANCH B', 'JOIN', 'VALIDATE'],
    values: {
      parallelBranches: 2,
      joinInputs: 2,
    },
    renderedValues: ['2 PARALLEL BRANCHES', '2 INPUTS'],
  },
  correctionState: {
    visualId: 'visual-agent-06-correction-ladder',
    labels: ['RETRY', 'REPLAN', 'REFLECT', 'VALIDATE', 'ACCEPT', 'REJECT'],
    values: {
      maxRetries: 2,
      retryStates: ['ATTEMPT 1', 'ATTEMPT 2'],
    },
    renderedValues: ['MAX RETRIES 2', 'ATTEMPT 1', 'ATTEMPT 2'],
  },
  pressureMatrix: {
    visualId: 'visual-agent-08-pressure-matrix',
    columns: ['FAILURE', 'SIGNAL', 'CONTROL', 'EXIT'],
    rows: [
      ['TOOL FAILURE', 'ERROR + CALL ID', 'RETRY / RECONCILE', 'RECOVERED / BLOCKED'],
      ['AMBIGUOUS SUCCESS', 'MISSING PROOF', 'VALIDATE', 'BLOCKED'],
      ['STALE CONTEXT', 'VERSION MISMATCH', 'REFRESH', 'REPLAN'],
      ['UNAUTHORIZED ACTION', 'POLICY DENY', 'REJECT', 'STOP'],
      ['LOOP EXHAUSTED', 'ROUND 4 / 4', 'CHECKPOINT', 'HANDOFF'],
      ['VERSION DRIFT', 'CONTRACT CHANGED', 'MIGRATE', 'REGRESSION TEST'],
    ],
  },
});
