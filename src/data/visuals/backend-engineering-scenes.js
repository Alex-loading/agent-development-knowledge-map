function cardLayout(labels) {
  const columns = labels.length <= 5 ? labels.length : Math.ceil(labels.length / 2);
  const width = labels.length <= 5 ? Math.min(190, Math.floor(1040 / columns)) : Math.floor(1040 / columns);
  const gap = labels.length <= 5 ? 28 : 18;
  const totalWidth = columns * width + (columns - 1) * gap;
  const startX = Math.round((1200 - totalWidth) / 2);
  return labels.map((label, index) => ({
    id: `card-${index + 1}`,
    label,
    x: startX + (index % columns) * (width + gap),
    y: labels.length <= 5 ? 240 : 205 + Math.floor(index / columns) * 145,
    width,
    height: labels.length <= 5 ? 104 : 92,
    kind: index === 0 ? 'entry' : index === labels.length - 1 ? 'outcome' : 'stage',
  }));
}

function scene({ id, title, subtitle, type, topology, labels, values, connect = false }) {
  const cards = cardLayout(labels);
  const edges = connect && labels.length <= 5
    ? cards.slice(1).map((card, index) => ({
      id: `edge-${index + 1}`,
      from: cards[index].id,
      to: card.id,
      points: [
        [cards[index].x + cards[index].width, cards[index].y + cards[index].height / 2],
        [card.x, card.y + card.height / 2],
      ],
    }))
    : [];
  return { id, title, subtitle, type, topology, cards, edges, values };
}

const scenes = [
  scene({
    id: 'visual-backend-01-overview', title: 'AI API 的五层责任边界',
    subtitle: '候选调用穿过宿主边界；每次运行绑定身份、版本、能力与用量。',
    type: 'sequence', topology: 'client-api-provider-tools-storage', connect: true,
    labels: ['CLIENT', 'AI API', 'PROVIDER', 'TOOLS', 'STORAGE'],
    values: ['requestId req_42', 'model v7', 'prompt v12', 'tool schema v3'],
  }),
  scene({
    id: 'visual-backend-01-detail', title: '结构化契约与错误回路',
    subtitle: 'schema、capability、usage 与 error envelope 必须在 API 边界闭合。',
    type: 'protocol', topology: 'schema-capability-error-protocol', connect: true,
    labels: ['SCHEMA', 'CAPABILITY', 'EXECUTE', 'USAGE', 'ERROR ENVELOPE'],
    values: ['HTTP 422', 'code invalid_schema', 'usage 3.4k tokens'],
  }),
  scene({
    id: 'visual-backend-02-overview', title: 'Typed SSE 的可恢复生命周期',
    subtitle: '传输事件、断线信号与业务终态分别记录。',
    type: 'timeline', topology: 'typed-sse-lifecycle',
    labels: ['CREATED', 'DELTA #1', 'HEARTBEAT', 'DISCONNECT', 'CANCEL REQUEST', 'TERMINAL'],
    values: ['TTFT 420 ms', 'BUFFER 0 B', 'LAST EVENT 17'],
  }),
  scene({
    id: 'visual-backend-02-detail', title: '同步、SSE 与异步轮询的选择矩阵',
    subtitle: '持续时间、增量体验与恢复需求共同决定传输方式。',
    type: 'matrix', topology: 'transport-mode-decision-matrix',
    labels: ['SYNC JSON', 'SSE', 'ASYNC POLLING', 'DEADLINE', 'PARTIAL', 'RESUME'],
    values: ['short ≤ 15 s', 'event cursor 17', 'jobId job_42'],
  }),
  scene({
    id: 'visual-backend-03-overview', title: '共享容量与 Deadline 包络',
    subtitle: '接受、排队、重试和拒绝消费同一份受限容量。',
    type: 'envelope', topology: 'shared-capacity-deadline-envelope', connect: true,
    labels: ['ADMISSION', 'QUEUE', 'PROVIDER', 'LOAD SHED'],
    values: ['CONCURRENCY 12 / 16', 'TOKENS 64k / 80k', 'DEADLINE 3.2 s', 'RETRY 1 / 2'],
  }),
  scene({
    id: 'visual-backend-03-detail', title: '准入控制的四个确定出口',
    subtitle: '剩余预算与队列年龄决定 accept、queue、degrade 或 reject。',
    type: 'decision', topology: 'admission-control-exits',
    labels: ['REQUEST', 'ACCEPT', 'BOUNDED QUEUE', 'DEGRADE', 'REJECT'],
    values: ['queue age 1.1 s', 'Retry-After 2 s', 'tenant weight 3'],
  }),
  scene({
    id: 'visual-backend-04-overview', title: '耐久 Job 状态机',
    subtitle: '客户端状态、worker lease、checkpoint 与死信各有证据。',
    type: 'state-machine', topology: 'durable-job-state-machine',
    labels: ['SUBMITTED', 'QUEUED', 'LEASED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'DLQ'],
    values: ['LEASE 30 s', 'CHECKPOINT 68%', 'ATTEMPT 2'],
  }),
  scene({
    id: 'visual-backend-04-detail', title: '可重放控制与不可重放副作用',
    subtitle: 'journal 恢复控制面；effect ledger 对账外部世界。',
    type: 'split', topology: 'replayable-control-external-effect-split',
    labels: ['JOURNAL', 'CHECKPOINT', 'REPLAY CONTROL', 'EXTERNAL EFFECT', 'RECONCILE', 'DLQ'],
    values: ['cursor 184', 'effect mail:42', 'proof receipt_9'],
  }),
  scene({
    id: 'visual-backend-05-overview', title: '权威存储与可重建加速层',
    subtitle: '事务事实、对象、向量索引和缓存承担不同所有权。',
    type: 'layers', topology: 'authoritative-storage-cache-layers',
    labels: ['POSTGRESQL', 'OBJECT STORAGE', 'VECTOR STORE', 'REDIS'],
    values: ['TENANT acme', 'ACL v9', 'CACHE v12', 'TTL 300 s'],
  }),
  scene({
    id: 'visual-backend-05-detail', title: '版本化 Cache-aside 与击穿保护',
    subtitle: '硬隔离、TTL、失效事件和 singleflight 共同守住正确性。',
    type: 'cache', topology: 'versioned-cache-aside-stampede-control', connect: true,
    labels: ['READ v12', 'CACHE MISS', 'SINGLEFLIGHT', 'POSTGRESQL', 'FILL TTL'],
    values: ['tenant acme', 'ACL v9', 'TTL 300 s'],
  }),
  scene({
    id: 'visual-backend-06-overview', title: '至少一次投递的幂等账本',
    subtitle: '重复是协议输入；unknown outcome 必须先查询再恢复。',
    type: 'ledger', topology: 'idempotent-at-least-once-ledger', connect: true,
    labels: ['OUTBOX', 'BROKER', 'INBOX', 'EFFECT LEDGER', 'RECONCILE'],
    values: ['KEY report:42', 'ATTEMPT 2', 'OUTCOME AMBIGUOUS'],
  }),
  scene({
    id: 'visual-backend-06-detail', title: '失败分类与恢复动作',
    subtitle: 'retryable、ambiguous 与 permanent 不能共用同一重试分支。',
    type: 'matrix', topology: 'delivery-failure-recovery-matrix',
    labels: ['RETRYABLE', 'AMBIGUOUS', 'PERMANENT', 'BACKOFF', 'QUERY', 'STOP'],
    values: ['budget 1 / 2', 'dedupe hit', 'manual reconcile'],
  }),
  scene({
    id: 'visual-backend-07-overview', title: '生命周期与可观测证据流',
    subtitle: '接流、摘流、排空和停止由日志、trace、metric 与 eval 共同解释。',
    type: 'signal-flow', topology: 'lifecycle-observability-flow',
    labels: ['STARTING', 'READY', 'DRAINING', 'STOPPED', 'LOG', 'TRACE', 'METRIC', 'EVAL'],
    values: ['MODEL v7', 'PROMPT v12', 'TOOL v3', 'COST ¥0.18'],
  }),
  scene({
    id: 'visual-backend-07-detail', title: '版本维度与高基数边界',
    subtitle: '逐请求身份进入日志/trace；受控版本进入聚合 metric 与评测。',
    type: 'observability', topology: 'bounded-cardinality-observability',
    labels: ['requestId → TRACE', 'jobId → LOG', 'model v7 → METRIC', 'prompt v12 → EVAL'],
    values: ['p95 TTFT 620 ms', 'tokens 3.4k', 'eval score 0.91'],
  }),
  scene({
    id: 'visual-backend-08-overview', title: '部署诊断四象限',
    subtitle: '容量、延迟、质量与安全必须用不同信号和回滚动作处理。',
    type: 'matrix', topology: 'deployment-diagnosis-matrix',
    labels: ['OVERLOADED', 'SLOW', 'WRONG', 'UNSAFE'],
    values: ['CANARY 5%', 'ROLLBACK v41', 'REGION cn-east-1'],
  }),
  scene({
    id: 'visual-backend-08-detail', title: '无状态 API 与有状态 Worker 发布拓扑',
    subtitle: '独立扩缩、兼容迁移、provider failover 与区域边界共同决定恢复。',
    type: 'deployment', topology: 'stateless-api-stateful-worker-deployment', connect: true,
    labels: ['STATELESS API', 'QUEUE', 'STATEFUL WORKER', 'PROVIDER', 'REGIONAL DATA'],
    values: ['canary 5%', 'schema v42', 'rollback v41'],
  }),
];

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export const backendEngineeringScenes = deepFreeze(scenes);
const scenesById = new Map(backendEngineeringScenes.map((entry) => [entry.id, entry]));

export function getBackendEngineeringScene(id) {
  return scenesById.get(id) ?? null;
}
