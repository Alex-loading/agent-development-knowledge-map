const node = (id, label, x, y, width, height, kind, secondary) => ({
  id, label, x, y, width, height, kind, ...(secondary ? { secondary } : {}),
});

const edge = (id, from, to, points, label, labelAt, kind = 'flow') => ({
  id, from, to, points, kind, ...(label ? { label, labelAt } : {}),
});

const value = (id, label, metric, x, width) => ({
  id, label, value: metric, text: `${label} ${metric}`, x, y: 525, width, height: 40,
});

const scenes = [
  {
    id: 'visual-backend-01-overview', type: 'sequence', topology: 'client-api-provider-tools-storage',
    title: 'AI API 的五层责任边界', subtitle: '消息越过宿主边界时，身份、版本、能力与证据必须显式传递。',
    nodes: [
      node('client', 'CLIENT', 58, 178, 156, 48, 'actor'),
      node('api', 'AI API', 290, 178, 156, 48, 'actor'),
      node('provider', 'PROVIDER', 522, 178, 156, 48, 'actor'),
      node('tools', 'TOOLS', 754, 178, 156, 48, 'actor'),
      node('storage', 'STORAGE', 986, 178, 156, 48, 'actor'),
    ],
    edges: [
      edge('request', 'client', 'api', [[136, 270], [368, 270]], 'REQUEST', [252, 250], 'request'),
      edge('inference', 'api', 'provider', [[368, 320], [600, 320]], 'INFERENCE', [484, 300]),
      edge('authorized-call', 'api', 'tools', [[368, 370], [832, 370]], 'AUTHORIZED CALL', [600, 350]),
      edge('persist-evidence', 'api', 'storage', [[368, 420], [1064, 420]], 'PERSIST EVIDENCE', [716, 400], 'commit'),
    ],
    values: [
      value('request-value', 'requestId', 'req_42', 64, 250), value('model-value', 'model', 'v7', 330, 250),
      value('prompt-value', 'prompt', 'v12', 596, 250), value('tool-schema-value', 'tool schema', 'v3', 862, 274),
    ],
    actors: ['client', 'api', 'provider', 'tools', 'storage'],
    messages: ['request', 'inference', 'authorized-call', 'persist-evidence'],
  },
  {
    id: 'visual-backend-01-detail', type: 'protocol', topology: 'schema-capability-error-protocol',
    title: '结构化契约与错误回路', subtitle: '请求先校验能力与 schema，再允许 provider/tool 产生可提交结果。',
    nodes: [
      node('schema', 'SCHEMA', 54, 270, 158, 82, 'request', 'VALID / INVALID'),
      node('capability', 'CAPABILITY', 282, 270, 158, 82, 'gate', 'model / tool'),
      node('execute', 'EXECUTE', 510, 270, 158, 82, 'service', 'provider / tool'),
      node('usage', 'USAGE', 738, 270, 158, 82, 'host', 'token / cost'),
      node('error', 'ERROR ENVELOPE', 966, 270, 158, 82, 'result', 'code + reqId'),
    ],
    edges: [
      edge('schema-valid', 'schema', 'capability', [[212, 311], [282, 311]], 'VALID', [247, 245]),
      edge('capability-execute', 'capability', 'execute', [[440, 311], [510, 311]], 'SUPPORTED', [475, 245]),
      edge('execute-usage', 'execute', 'usage', [[668, 311], [738, 311]], 'ACCOUNT', [703, 245]),
      edge('schema-invalid', 'schema', 'error', [[133, 352], [133, 430], [1045, 430], [1045, 352]], 'INVALID', [360, 412], 'error'),
      edge('capability-error', 'capability', 'error', [[361, 352], [361, 390], [930, 390], [930, 330], [966, 330]], 'UNAVAILABLE', [760, 372], 'error'),
    ],
    values: [value('http', 'HTTP', '422', 64, 330), value('code', 'code', 'invalid_schema', 410, 330), value('usage', 'usage', '3.4k tokens', 756, 380)],
    states: ['VALID', 'INVALID'],
    stages: ['schema', 'capability', 'execute', 'usage', 'error'],
  },
  {
    id: 'visual-backend-02-overview', type: 'timeline', topology: 'typed-sse-lifecycle',
    title: 'Typed SSE 的可恢复生命周期', subtitle: '传输事件沿时间轴前进；断线、取消意图与业务终态分别取证。',
    nodes: [
      node('created', 'CREATED', 45, 265, 130, 70, 'event', 'STREAMING'),
      node('delta', 'DELTA #1', 230, 265, 130, 70, 'event', 'seq 1'),
      node('heartbeat', 'HEARTBEAT', 415, 265, 130, 70, 'event', 'keepalive'),
      node('disconnect', 'DISCONNECT', 600, 265, 130, 70, 'warning', 'DISCONNECTED'),
      node('cancel', 'CANCEL REQUEST', 785, 265, 130, 70, 'warning', 'CANCELLED'),
      node('terminal', 'TERMINAL', 970, 265, 130, 70, 'terminal', 'COMPLETED'),
    ],
    edges: [
      edge('created-delta', 'created', 'delta', [[175, 300], [230, 300]], 'event 1', [202, 232]),
      edge('delta-heartbeat', 'delta', 'heartbeat', [[360, 300], [415, 300]], 'idle', [387, 232]),
      edge('heartbeat-disconnect', 'heartbeat', 'disconnect', [[545, 300], [600, 300]], 'network', [572, 232]),
      edge('disconnect-resume', 'disconnect', 'delta', [[665, 265], [665, 190], [295, 190], [295, 265]], 'RESUME CURSOR 17', [480, 170], 'recovery'),
      edge('disconnect-cancel', 'disconnect', 'cancel', [[730, 300], [785, 300]], 'CANCEL', [757, 232]),
      edge('delta-terminal', 'delta', 'terminal', [[295, 335], [295, 455], [1035, 455], [1035, 335]], 'EXPLICIT TERMINAL', [850, 437], 'terminal'),
    ],
    values: [value('ttft', 'TTFT', '420 ms', 64, 330), value('buffer', 'BUFFER', '0 B', 410, 330), value('cursor', 'LAST EVENT', '17', 756, 380)],
    states: ['STREAMING', 'DISCONNECTED', 'CANCELLED', 'COMPLETED'],
    events: ['created', 'delta', 'heartbeat', 'disconnect', 'cancel', 'terminal'],
    axisY: 300,
  },
  {
    id: 'visual-backend-02-detail', type: 'split', topology: 'transport-mode-decision-matrix',
    title: '同步、SSE 与后台 Job 的三路契约', subtitle: '同一权威状态机投影成完整响应、增量事件或可恢复任务。',
    nodes: [
      node('sync-entry', 'SYNC JSON', 80, 185, 180, 64, 'lane', 'SHORT · DEADLINE'),
      node('sync-exit', 'FULL RESULT', 920, 185, 180, 64, 'outcome', 'single response'),
      node('sse-entry', 'SSE', 80, 300, 180, 64, 'lane', 'INCREMENTAL'),
      node('sse-exit', 'CURSOR 17', 920, 300, 180, 64, 'outcome', 'PARTIAL'),
      node('job-entry', 'ASYNC POLLING', 80, 415, 180, 64, 'lane', 'DURABLE · jobId'),
      node('job-exit', 'JOB SNAPSHOT', 920, 415, 180, 64, 'outcome', 'RESUME / POLL'),
    ],
    edges: [
      edge('sync-path', 'sync-entry', 'sync-exit', [[260, 217], [920, 217]], 'WAIT FOR TERMINAL', [590, 198]),
      edge('sse-path', 'sse-entry', 'sse-exit', [[260, 332], [920, 332]], 'STREAM + EXPLICIT TERMINAL', [590, 313]),
      edge('job-path', 'job-entry', 'job-exit', [[260, 447], [920, 447]], 'PERSIST + RESUME', [590, 428]),
    ],
    values: [value('sync-limit', 'short', '≤ 15 s', 64, 330), value('sse-cursor', 'event cursor', '17', 410, 330), value('job-id', 'jobId', 'job_42', 756, 380)],
    states: ['SHORT', 'INCREMENTAL', 'DURABLE'],
    lanes: ['sync-json', 'sse', 'async-polling'],
  },
  {
    id: 'visual-backend-03-overview', type: 'envelope', topology: 'shared-capacity-deadline-envelope',
    title: '共享容量与 Deadline 包络', subtitle: '并发、队列、token、供应商限额和重试共同消费受限预算。',
    nodes: [
      node('admission', 'ADMISSION', 100, 285, 170, 76, 'entry', 'estimate work'),
      node('queue', 'BOUNDED QUEUE', 360, 285, 170, 76, 'queue', 'age 1.1 s'),
      node('provider', 'PROVIDER', 620, 285, 170, 76, 'service', 'rate limit'),
      node('load-shed', 'LOAD SHED', 880, 285, 170, 76, 'terminal', 'BUDGET EXHAUSTED'),
    ],
    edges: [
      edge('admit-queue', 'admission', 'queue', [[270, 323], [360, 323]], 'ACCEPT', [315, 255]),
      edge('queue-provider', 'queue', 'provider', [[530, 323], [620, 323]], 'WITHIN BUDGET', [575, 255]),
      edge('admission-shed', 'admission', 'load-shed', [[185, 361], [185, 440], [965, 440], [965, 361]], 'REJECT', [380, 422], 'reject'),
      edge('provider-retry', 'provider', 'admission', [[705, 285], [705, 155], [80, 155], [80, 323], [100, 323]], 'RETRY SHARES BUDGET', [500, 173], 'retry'),
    ],
    values: [
      value('concurrency', 'CONCURRENCY', '12 / 16', 64, 250), value('tokens', 'TOKENS', '64k / 80k', 330, 250),
      value('deadline', 'DEADLINE', '3.2 s', 596, 250), value('retry', 'RETRY', '1 / 2', 862, 274),
    ],
    states: ['WITHIN BUDGET', 'BUDGET EXHAUSTED'],
    budgets: ['concurrency', 'tokens', 'deadline', 'retry'],
    budgetFrames: [
        { id: 'deadline-envelope', label: 'DEADLINE 3.2 s', x: 58, y: 170, width: 1084, height: 305 },
        { id: 'capacity-envelope', label: 'SHARED CAPACITY', x: 78, y: 205, width: 1044, height: 235 },
      ],
    flow: ['admission', 'queue', 'provider', 'load-shed'],
  },
  {
    id: 'visual-backend-03-detail', type: 'decision', topology: 'admission-control-exits',
    title: '准入控制的四个确定出口', subtitle: '剩余 deadline、队列年龄、租户权重与依赖健康共同决定出口。',
    nodes: [
      node('request', 'REQUEST', 475, 235, 200, 120, 'decision', 'budget + health'),
      node('accept', 'ACCEPT', 70, 415, 160, 66, 'outcome', 'slot available'),
      node('queue', 'BOUNDED QUEUE', 330, 415, 160, 66, 'outcome', 'bounded wait'),
      node('degrade', 'DEGRADE', 670, 415, 160, 66, 'warning', 'smaller model'),
      node('reject', 'REJECT', 930, 415, 160, 66, 'terminal', '429 / 503'),
    ],
    edges: [
      edge('to-accept', 'request', 'accept', [[490, 335], [490, 375], [150, 375], [150, 415]], 'CAPACITY', [300, 355]),
      edge('to-queue', 'request', 'queue', [[540, 355], [540, 395], [410, 395], [410, 415]], 'WAIT', [550, 375]),
      edge('to-degrade', 'request', 'degrade', [[610, 355], [610, 395], [750, 395], [750, 415]], 'FALLBACK', [680, 375]),
      edge('to-reject', 'request', 'reject', [[675, 295], [1120, 295], [1120, 448], [1090, 448]], 'OVERLOAD', [850, 277], 'reject'),
    ],
    values: [value('age', 'queue age', '1.1 s', 64, 330), value('retry-after', 'Retry-After', '2 s', 410, 330), value('weight', 'tenant weight', '3', 756, 380)],
    states: ['CAPACITY', 'WAIT', 'FALLBACK', 'OVERLOAD'],
    branches: ['accept', 'queue', 'degrade', 'reject'],
  },
  {
    id: 'visual-backend-04-overview', type: 'state-machine', topology: 'durable-job-state-machine',
    title: '耐久 Job 状态机', subtitle: '提交、租约、checkpoint、取消与终态都有合法边和版本守卫。',
    nodes: [
      node('submitted', 'SUBMITTED', 55, 185, 150, 72, 'state'), node('queued', 'QUEUED', 270, 185, 150, 72, 'state'),
      node('leased', 'LEASED', 485, 185, 150, 72, 'state', 'LEASE EXPIRED'), node('running', 'RUNNING', 700, 185, 150, 72, 'state'),
      node('succeeded', 'SUCCEEDED', 930, 185, 160, 72, 'terminal'), node('dlq', 'DLQ', 485, 405, 150, 72, 'terminal'),
      node('failed', 'FAILED', 700, 405, 150, 72, 'terminal', 'RETRY / STOP'), node('cancelled', 'CANCELLED', 930, 405, 160, 72, 'terminal'),
    ],
    edges: [
      edge('submit', 'submitted', 'queued', [[205, 221], [270, 221]], 'persist', [237, 165]),
      edge('lease', 'queued', 'leased', [[420, 221], [485, 221]], 'lease 30 s', [452, 165]),
      edge('start', 'leased', 'running', [[635, 221], [700, 221]], 'start', [667, 165]),
      edge('succeed', 'running', 'succeeded', [[850, 221], [930, 221]], 'version guard', [890, 165], 'terminal'),
      edge('fail', 'running', 'failed', [[775, 257], [775, 405]], 'permanent', [835, 332], 'terminal'),
      edge('retry', 'failed', 'queued', [[775, 477], [775, 500], [345, 500], [345, 257]], 'RETRYABLE', [560, 500], 'retry'),
      edge('dead-letter', 'failed', 'dlq', [[700, 441], [635, 441]], 'PERMANENT', [667, 385], 'terminal'),
      edge('cancel', 'queued', 'cancelled', [[345, 185], [345, 182], [1120, 182], [1120, 441], [1090, 441]], 'cancel intent', [1050, 330], 'terminal'),
    ],
    values: [value('lease-value', 'LEASE', '30 s', 64, 330), value('checkpoint', 'CHECKPOINT', '68%', 410, 330), value('attempt', 'ATTEMPT', '2', 756, 380)],
    states: ['submitted', 'queued', 'leased', 'running', 'succeeded', 'failed', 'cancelled', 'dlq'],
    terminalStates: ['succeeded', 'failed', 'cancelled', 'dlq'],
    transitions: ['submit', 'lease', 'start', 'succeed', 'fail', 'retry', 'cancel', 'dead-letter'],
  },
  {
    id: 'visual-backend-04-detail', type: 'matrix', topology: 'replayable-control-external-effect-split',
    title: '可重放控制与外部副作用矩阵', subtitle: 'journal/checkpoint 可重放控制决定；外部 effect 必须另行取证与对账。',
    nodes: [
      node('journal', 'JOURNAL', 70, 200, 220, 70, 'cell', 'CONTROL PLANE'),
      node('checkpoint', 'CHECKPOINT', 340, 200, 220, 70, 'cell', 'cursor 184'),
      node('replay', 'REPLAY CONTROL', 70, 380, 220, 70, 'cell', 'REPLAYABLE'),
      node('effect', 'EXTERNAL EFFECT', 650, 200, 220, 70, 'cell', 'NOT REPLAYABLE'),
      node('reconcile', 'RECONCILE', 920, 200, 220, 70, 'cell', 'proof receipt_9'),
      node('dlq', 'DLQ', 920, 380, 220, 70, 'cell', 'manual recovery'),
    ],
    edges: [
      edge('journal-checkpoint', 'journal', 'checkpoint', [[290, 235], [340, 235]], 'APPEND', [315, 175]),
      edge('checkpoint-replay', 'checkpoint', 'replay', [[450, 270], [450, 330], [180, 330], [180, 380]], 'REPLAYABLE', [315, 312]),
      edge('checkpoint-effect', 'checkpoint', 'effect', [[560, 235], [650, 235]], 'NOT REPLAYABLE', [605, 175]),
      edge('effect-reconcile', 'effect', 'reconcile', [[870, 235], [920, 235]], 'QUERY PROOF', [895, 175]),
      edge('reconcile-dlq', 'reconcile', 'dlq', [[1030, 270], [1030, 380]], 'NO PROOF', [1090, 325], 'terminal'),
    ],
    values: [value('journal-value', 'cursor', '184', 64, 330), value('effect-value', 'effect', 'mail:42', 410, 330), value('proof-value', 'proof', 'receipt_9', 756, 380)],
    columns: ['CONTROL PLANE', 'EXTERNAL WORLD'],
    rows: ['REPLAYABLE', 'NOT REPLAYABLE', 'RECOVERY PROOF'],
  },
  {
    id: 'visual-backend-05-overview', type: 'layers', topology: 'authoritative-storage-cache-layers',
    title: '权威存储与可重建加速层', subtitle: '事务事实、对象、向量索引与缓存按所有权、恢复源和删除语义分层。',
    nodes: [
      node('postgres', 'POSTGRESQL', 140, 175, 920, 48, 'authority', 'AUTHORITATIVE · job / ACL / version'),
      node('object-storage', 'OBJECT STORAGE', 140, 260, 920, 48, 'durable', 'DURABLE OBJECT · source pointer'),
      node('vector-store', 'VECTOR STORE', 140, 345, 920, 48, 'derived', 'REBUILDABLE · tenant + version'),
      node('redis', 'REDIS', 140, 430, 920, 48, 'cache', 'EVICTABLE · TTL + namespace'),
    ],
    edges: [
      edge('postgres-object', 'postgres', 'object-storage', [[600, 223], [600, 260]], 'OBJECT POINTER', [710, 243], 'ownership'),
      edge('postgres-vector', 'postgres', 'vector-store', [[140, 199], [110, 199], [110, 369], [140, 369]], 'REBUILD INDEX', [220, 327], 'derive'),
      edge('postgres-redis', 'postgres', 'redis', [[1060, 199], [1090, 199], [1090, 454], [1060, 454]], 'INVALIDATE', [1000, 412], 'derive'),
    ],
    values: [value('tenant', 'TENANT', 'acme', 64, 250), value('acl', 'ACL', 'v9', 330, 250), value('cache-version', 'CACHE', 'v12', 596, 250), value('ttl', 'TTL', '300 s', 862, 274)],
    ownership: ['authoritative', 'durable-object', 'rebuildable-index', 'evictable-cache'],
  },
  {
    id: 'visual-backend-05-detail', type: 'cache', topology: 'versioned-cache-aside-stampede-control',
    title: '版本化 Cache-aside 与击穿保护', subtitle: '读取先校验租户/版本；miss 由 singleflight 有界回源，写后发布失效。',
    nodes: [
      node('read', 'READ v12', 55, 250, 160, 78, 'entry', 'tenant acme · HIT'),
      node('cache-miss', 'CACHE MISS', 270, 250, 170, 78, 'cache', 'MISS'),
      node('singleflight', 'SINGLEFLIGHT', 620, 250, 190, 78, 'gate', 'one origin read'),
      node('postgres', 'POSTGRESQL', 870, 250, 170, 78, 'authority', 'ACL v9 · truth'),
      node('fill', 'FILL TTL', 870, 410, 170, 64, 'event', 'TTL 300 s'),
    ],
    edges: [
      edge('read-miss', 'read', 'cache-miss', [[215, 289], [270, 289]], 'MISS', [242, 225]),
      edge('miss-singleflight', 'cache-miss', 'singleflight', [[440, 289], [620, 289]], 'MISS', [530, 225]),
      edge('singleflight-postgres', 'singleflight', 'postgres', [[810, 289], [870, 289]], 'COALESCED', [840, 225]),
      edge('postgres-fill', 'postgres', 'fill', [[955, 328], [955, 410]], 'VERSION v12', [1040, 370]),
      edge('fill-read', 'fill', 'read', [[870, 442], [135, 442], [135, 328]], 'HIT v12', [500, 424], 'feedback'),
      edge('read-hit', 'read', 'fill', [[215, 300], [230, 300], [230, 385], [830, 385], [830, 432], [870, 432]], 'HIT v12', [530, 367], 'hit'),
    ],
    values: [value('cache-tenant', 'TENANT', 'acme', 64, 330), value('cache-acl', 'ACL', 'v9', 410, 330), value('cache-ttl', 'TTL', '300 s', 756, 380)],
    states: ['HIT', 'MISS', 'COALESCED'],
    operations: ['read', 'cache-miss', 'singleflight', 'postgres', 'fill'],
  },
  {
    id: 'visual-backend-06-overview', type: 'ledger', topology: 'idempotent-at-least-once-ledger',
    title: '至少一次投递的幂等账本', subtitle: '重复交付是协议输入；提交点、确认点与真实副作用分别留证。',
    nodes: [
      node('outbox', 'OUTBOX', 55, 250, 160, 86, 'record', 'intent committed'),
      node('broker', 'BROKER', 280, 250, 160, 86, 'transport', 'at-least-once'),
      node('inbox', 'INBOX', 505, 250, 160, 86, 'record', 'dedupe messageId'),
      node('effect-ledger', 'EFFECT LEDGER', 730, 250, 170, 86, 'authority', 'UNKNOWN OUTCOME'),
      node('reconcile', 'RECONCILE', 965, 250, 170, 86, 'outcome', 'PROOF / DUPLICATE'),
    ],
    edges: [
      edge('publish', 'outbox', 'broker', [[215, 293], [280, 293]], 'publish', [247, 220]),
      edge('deliver', 'broker', 'inbox', [[440, 293], [505, 293]], 'AT LEAST ONCE', [472, 220]),
      edge('dedupe', 'inbox', 'effect-ledger', [[665, 293], [730, 293]], 'IDEMPOTENCY KEY', [697, 220]),
      edge('prove', 'effect-ledger', 'reconcile', [[900, 293], [965, 293]], 'QUERY PROOF', [932, 220]),
      edge('redelivery', 'broker', 'inbox', [[360, 336], [360, 410], [585, 410], [585, 336]], 'REDELIVERY', [472, 392], 'redelivery'),
      edge('unknown-reconcile', 'inbox', 'reconcile', [[625, 336], [625, 450], [1050, 450], [1050, 336]], 'DUPLICATE / UNKNOWN', [835, 432], 'ambiguous'),
    ],
    values: [value('ledger-key', 'KEY', 'report:42', 64, 330), value('ledger-attempt', 'ATTEMPT', '2', 410, 330), value('ledger-outcome', 'OUTCOME', 'AMBIGUOUS', 756, 380)],
    states: ['DUPLICATE', 'UNKNOWN OUTCOME'],
    records: ['outbox', 'inbox', 'effect-ledger', 'reconcile'],
  },
  {
    id: 'visual-backend-06-detail', type: 'delivery', topology: 'delivery-failure-recovery-matrix',
    title: '投递、未知结果与恢复动作', subtitle: 'relay、consumer 与远端 effect 的故障点不同，恢复先查询证据再重试。',
    nodes: [
      node('outbox', 'OUTBOX', 70, 185, 170, 76, 'record', 'PERMANENT'),
      node('broker', 'BROKER', 340, 185, 170, 76, 'transport', 'at-least-once'),
      node('consumer', 'CONSUMER', 610, 185, 170, 76, 'worker', 'RECOVERED'),
      node('effect', 'REMOTE EFFECT', 880, 185, 190, 76, 'external', 'AMBIGUOUS → QUERY'),
      node('reconcile', 'RECONCILE', 880, 405, 190, 68, 'outcome', 'FAILED / STOP'),
    ],
    edges: [
      edge('relay', 'outbox', 'broker', [[240, 223], [340, 223]], 'relay', [290, 165]),
      edge('redelivery', 'broker', 'consumer', [[510, 223], [610, 223]], 'messageId', [560, 165]),
      edge('execute', 'consumer', 'effect', [[780, 223], [880, 223]], 'idempotency key', [830, 165]),
      edge('effect-reconcile', 'effect', 'reconcile', [[975, 261], [975, 405]], 'AMBIGUOUS · QUERY', [1070, 333], 'ambiguous'),
      edge('effect-retry', 'effect', 'consumer', [[920, 261], [920, 350], [695, 350], [695, 261]], 'RETRYABLE · BACKOFF', [807, 332], 'retry'),
    ],
    values: [value('delivery-budget', 'budget', '1 / 2', 64, 330), value('delivery-hit', 'dedupe', 'hit', 410, 330), value('delivery-manual', 'manual', 'reconcile', 756, 380)],
    states: ['RECOVERED', 'RECONCILE', 'FAILED', 'RETRYABLE', 'AMBIGUOUS', 'PERMANENT', 'BACKOFF', 'QUERY', 'STOP'],
    hops: ['outbox', 'broker', 'consumer', 'effect', 'reconcile'],
  },
  {
    id: 'visual-backend-07-overview', type: 'signal-flow', topology: 'lifecycle-observability-flow',
    title: '生命周期与可观测证据流', subtitle: '接流、摘流、排空与停止的事实流向日志、trace、metric 和 eval。',
    nodes: [
      node('starting', 'STARTING', 70, 185, 170, 64, 'state'), node('ready', 'READY', 340, 185, 170, 64, 'state'),
      node('draining', 'DRAINING', 610, 185, 170, 64, 'state'), node('stopped', 'STOPPED', 880, 185, 170, 64, 'terminal'),
      node('log', 'LOG', 70, 410, 170, 64, 'signal', 'discrete facts'), node('trace', 'TRACE', 340, 410, 170, 64, 'signal', 'request path'),
      node('metric', 'METRIC', 610, 410, 170, 64, 'signal', 'bounded labels'), node('eval', 'EVAL', 880, 410, 170, 64, 'signal', 'quality event'),
    ],
    edges: [
      edge('starting-ready', 'starting', 'ready', [[240, 217], [340, 217]], 'SERVING', [290, 165]),
      edge('ready-draining', 'ready', 'draining', [[510, 217], [610, 217]], 'SIGTERM', [560, 165]),
      edge('draining-stopped', 'draining', 'stopped', [[780, 217], [880, 217]], 'NOT SERVING', [830, 165]),
      edge('ready-log', 'ready', 'log', [[365, 249], [365, 330], [155, 330], [155, 410]], 'state fact', [260, 312]),
      edge('ready-trace', 'ready', 'trace', [[405, 249], [405, 410]], 'requestId', [500, 285]),
      edge('ready-metric', 'ready', 'metric', [[445, 249], [445, 350], [695, 350], [695, 410]], 'bounded', [570, 332]),
      edge('ready-eval', 'ready', 'eval', [[485, 185], [485, 182], [1120, 182], [1120, 390], [965, 390], [965, 410]], 'quality', [1090, 330]),
    ],
    values: [value('signal-model', 'MODEL', 'v7', 64, 250), value('signal-prompt', 'PROMPT', 'v12', 330, 250), value('signal-tool', 'TOOL', 'v3', 596, 250), value('signal-cost', 'COST', '¥0.18', 862, 274)],
    states: ['SERVING', 'NOT SERVING'],
    signals: ['log', 'trace', 'metric', 'eval'],
  },
  {
    id: 'visual-backend-07-detail', type: 'observability', topology: 'bounded-cardinality-observability',
    title: '关联身份与高基数边界', subtitle: '逐请求身份进入 log/trace；受控版本才进入聚合 metric 与 evaluation。',
    nodes: [
      node('request-id', 'requestId → TRACE', 80, 175, 250, 58, 'identity', 'HIGH CARDINALITY'), node('trace', 'TRACE', 850, 175, 250, 58, 'channel', 'per-request identity'),
      node('job-id', 'jobId → LOG', 80, 255, 250, 58, 'identity', 'HIGH CARDINALITY'), node('log', 'LOG', 850, 255, 250, 58, 'channel', 'structured fact'),
      node('model-version', 'model v7 → METRIC', 80, 335, 250, 58, 'version', 'BOUNDED CARDINALITY'), node('metric', 'METRIC', 850, 335, 250, 58, 'channel', 'bounded enum'),
      node('prompt-version', 'prompt v12 → EVAL', 80, 415, 250, 58, 'version', 'BOUNDED CARDINALITY'), node('eval', 'EVAL', 850, 415, 250, 58, 'channel', 'golden + online'),
    ],
    edges: [
      edge('request-to-trace', 'request-id', 'trace', [[330, 204], [850, 204]], 'PER REQUEST', [590, 186]),
      edge('job-to-log', 'job-id', 'log', [[330, 284], [850, 284]], 'attempt + state', [590, 266]),
      edge('model-to-metric', 'model-version', 'metric', [[330, 364], [850, 364]], 'BOUNDED', [590, 346]),
      edge('prompt-to-eval', 'prompt-version', 'eval', [[330, 444], [850, 444]], 'quality join', [590, 426]),
    ],
    values: [value('obs-ttft', 'p95 TTFT', '620 ms', 64, 330), value('obs-tokens', 'tokens', '3.4k', 410, 330), value('obs-score', 'eval score', '0.91', 756, 380)],
    states: ['HIGH CARDINALITY', 'BOUNDED CARDINALITY'],
    correlations: ['request-to-trace', 'job-to-log', 'model-to-metric', 'prompt-to-eval'],
  },
  {
    id: 'visual-backend-08-overview', type: 'matrix', topology: 'deployment-diagnosis-matrix',
    title: '部署故障诊断矩阵', subtitle: '容量、延迟、质量与安全使用不同信号、缓解动作和回滚门。',
    nodes: [
      node('d-h-class', 'CLASS', 70, 175, 240, 52, 'header'), node('d-h-signal', 'PRIMARY SIGNAL', 310, 175, 390, 52, 'header'), node('d-h-action', 'FIRST ACTION', 700, 175, 430, 52, 'header'),
      node('d-overloaded-class', 'OVERLOADED', 70, 227, 240, 62, 'cell'), node('d-overloaded-signal', 'queue age / 429', 310, 227, 390, 62, 'cell'), node('d-overloaded-action', 'SHED / SCALE', 700, 227, 430, 62, 'cell'),
      node('d-slow-class', 'SLOW', 70, 289, 240, 62, 'cell'), node('d-slow-signal', 'TTFT / p99', 310, 289, 390, 62, 'cell'), node('d-slow-action', 'FAILOVER / DEGRADE', 700, 289, 430, 62, 'cell'),
      node('d-wrong-class', 'WRONG', 70, 351, 240, 62, 'cell'), node('d-wrong-signal', 'eval regression', 310, 351, 390, 62, 'cell'), node('d-wrong-action', 'ROLLBACK PROMPT / MODEL', 700, 351, 430, 62, 'cell'),
      node('d-unsafe-class', 'UNSAFE', 70, 413, 240, 62, 'cell'), node('d-unsafe-signal', 'policy violation', 310, 413, 390, 62, 'cell'), node('d-unsafe-action', 'STOP TRAFFIC / ISOLATE', 700, 413, 430, 62, 'cell'),
    ],
    edges: [
      edge('d-overloaded-link', 'd-overloaded-signal', 'd-overloaded-action', [[700, 258], [710, 258]]),
      edge('d-slow-link', 'd-slow-signal', 'd-slow-action', [[700, 320], [710, 320]]),
      edge('d-wrong-link', 'd-wrong-signal', 'd-wrong-action', [[700, 382], [710, 382]]),
      edge('d-unsafe-link', 'd-unsafe-signal', 'd-unsafe-action', [[700, 444], [710, 444]]),
    ],
    values: [value('canary', 'CANARY', '5%', 64, 330), value('rollback', 'ROLLBACK', 'v41', 410, 330), value('region', 'REGION', 'cn-east-1', 756, 380)],
    states: ['SCALE', 'FAILOVER', 'ROLLBACK', 'STOP'],
    columns: ['FAILURE', 'SIGNAL', 'ACTION'],
    rows: ['OVERLOADED', 'SLOW', 'WRONG', 'UNSAFE'],
  },
  {
    id: 'visual-backend-08-detail', type: 'deployment', topology: 'stateless-api-stateful-worker-deployment',
    title: '无状态 API 与有状态 Worker 发布拓扑', subtitle: 'API、队列、worker、provider 与区域数据边界独立扩缩并沿证据链诊断。',
    nodes: [
      node('stateless-api', 'STATELESS API', 55, 270, 170, 82, 'service', 'CANARY 5%'),
      node('queue', 'QUEUE', 280, 270, 160, 82, 'queue', 'schema v42'),
      node('stateful-worker', 'STATEFUL WORKER', 495, 270, 190, 82, 'worker', 'LEASE · ROLLBACK'),
      node('provider', 'PROVIDER', 740, 270, 170, 82, 'external', 'FAILOVER'),
      node('regional-data', 'REGIONAL DATA', 965, 270, 180, 82, 'authority', 'regional boundary'),
    ],
    edges: [
      edge('api-enqueue', 'stateless-api', 'queue', [[225, 311], [280, 311]], '202 / jobId', [252, 238]),
      edge('queue-lease', 'queue', 'stateful-worker', [[440, 311], [495, 311]], 'LEASE', [467, 238]),
      edge('worker-provider', 'stateful-worker', 'provider', [[685, 311], [740, 311]], 'deadline', [712, 238]),
      edge('worker-data', 'stateful-worker', 'regional-data', [[590, 352], [590, 410], [1055, 410], [1055, 352]], 'regional boundary', [825, 392]),
      edge('provider-failover', 'provider', 'stateful-worker', [[825, 270], [825, 155], [590, 155], [590, 270]], 'FAILOVER', [707, 173], 'failover'),
    ],
    values: [value('deploy-canary', 'canary', '5%', 64, 330), value('deploy-schema', 'schema', 'v42', 410, 330), value('deploy-rollback', 'rollback', 'v41', 756, 380)],
    zones: ['edge', 'work', 'provider', 'regional-data'],
    zoneFrames: [
        { id: 'stateless-zone', label: 'EDGE / STATELESS', x: 45, y: 175, width: 410, height: 300 },
        { id: 'stateful-zone', label: 'WORK / STATEFUL', x: 475, y: 175, width: 680, height: 300 },
      ],
    diagnostics: ['canary', 'failover', 'rollback'],
  },
];

function deepFreeze(valueToFreeze) {
  if (valueToFreeze && typeof valueToFreeze === 'object' && !Object.isFrozen(valueToFreeze)) {
    for (const child of Object.values(valueToFreeze)) deepFreeze(child);
    Object.freeze(valueToFreeze);
  }
  return valueToFreeze;
}

export const backendEngineeringScenes = deepFreeze(scenes);
const scenesById = new Map(backendEngineeringScenes.map((entry) => [entry.id, entry]));

export function getBackendEngineeringScene(id) {
  return scenesById.get(id) ?? null;
}
