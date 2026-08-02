function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) freeze(nested);
    Object.freeze(value);
  }
  return value;
}

export const backendEngineeringVisualFixtures = freeze({
  apiBoundary: {
    visualId: 'visual-backend-01-overview',
    topology: 'client-api-provider-tools-storage',
    labels: ['CLIENT', 'AI API', 'PROVIDER', 'TOOLS', 'STORAGE'],
    renderedValues: ['requestId req_42', 'model v7', 'prompt v12', 'tool schema v3'],
  },
  sseLifecycle: {
    visualId: 'visual-backend-02-overview',
    topology: 'typed-sse-lifecycle',
    labels: ['CREATED', 'DELTA #1', 'HEARTBEAT', 'DISCONNECT', 'CANCEL REQUEST', 'TERMINAL'],
    renderedValues: ['TTFT 420 ms', 'BUFFER 0 B', 'LAST EVENT 17'],
  },
  capacityDeadline: {
    visualId: 'visual-backend-03-overview',
    topology: 'shared-capacity-deadline-envelope',
    labels: ['ADMISSION', 'QUEUE', 'PROVIDER', 'LOAD SHED'],
    renderedValues: ['CONCURRENCY 12 / 16', 'TOKENS 64k / 80k', 'DEADLINE 3.2 s', 'RETRY 1 / 2'],
  },
  queueState: {
    visualId: 'visual-backend-04-overview',
    topology: 'durable-job-state-machine',
    labels: ['SUBMITTED', 'QUEUED', 'LEASED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'DLQ'],
    renderedValues: ['LEASE 30 s', 'CHECKPOINT 68%', 'ATTEMPT 2'],
  },
  storageCache: {
    visualId: 'visual-backend-05-overview',
    topology: 'authoritative-storage-cache-layers',
    labels: ['POSTGRESQL', 'OBJECT STORAGE', 'VECTOR STORE', 'REDIS'],
    renderedValues: ['TENANT acme', 'ACL v9', 'CACHE v12', 'TTL 300 s'],
  },
  idempotentDelivery: {
    visualId: 'visual-backend-06-overview',
    topology: 'idempotent-at-least-once-ledger',
    labels: ['OUTBOX', 'BROKER', 'INBOX', 'EFFECT LEDGER', 'RECONCILE'],
    renderedValues: ['KEY report:42', 'ATTEMPT 2', 'OUTCOME AMBIGUOUS'],
  },
  observability: {
    visualId: 'visual-backend-07-overview',
    topology: 'lifecycle-observability-flow',
    labels: ['STARTING', 'READY', 'DRAINING', 'STOPPED', 'LOG', 'TRACE', 'METRIC', 'EVAL'],
    renderedValues: ['MODEL v7', 'PROMPT v12', 'TOOL v3', 'COST ¥0.18'],
  },
  deploymentDiagnosis: {
    visualId: 'visual-backend-08-overview',
    topology: 'deployment-diagnosis-matrix',
    labels: ['OVERLOADED', 'SLOW', 'WRONG', 'UNSAFE'],
    renderedValues: ['CANARY 5%', 'ROLLBACK v41', 'REGION cn-east-1'],
  },
});
