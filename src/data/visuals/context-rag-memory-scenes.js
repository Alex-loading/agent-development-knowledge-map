import { contextRagMemoryTeachingOutcomeRegistry } from '../context-rag-memory-outcomes.js';
import { deepFreezeVisual } from './visual-contract.js';

function annotation(
  visualId,
  assessedOutcomes,
  outcomeCriteria,
  cognitiveQuestion,
  storyboard,
  semanticRefs,
) {
  return {
    fixtureId: `fixture-${visualId.replace(/^visual-/, '')}`,
    assessedOutcomes,
    assessedCoverage: contextRagMemoryTeachingOutcomeRegistry.visuals[visualId],
    outcomeCriteria,
    cognitiveQuestion,
    storyboard,
    semanticRefs,
  };
}

function flow(nodes, edges) {
  return {
    type: 'flow',
    nodes: nodes.map(([id, label, options = {}]) => ({ id, label, ...options })),
    edges: edges.map(([id, from, to, options = {}]) => ({ id, from, to, ...options })),
  };
}

function table(columns, rows, options = {}) {
  return {
    type: 'table',
    columns: columns.map(([id, label]) => ({ id, label })),
    rows: rows.map(([id, cells]) => ({ id, cells })),
    ...options,
  };
}

function chart(xAxis, yAxis, series, options = {}) {
  return {
    type: 'chart',
    xAxis,
    yAxis,
    series: series.map(([id, label, points]) => ({
      id,
      label,
      points: points.map(([pointId, pointLabel, value, pointOptions = {}]) => ({
        id: pointId,
        label: pointLabel,
        value,
        ...pointOptions,
      })),
    })),
    ...options,
  };
}

function decision(decisions, outcomes, edges, options = {}) {
  return {
    type: 'decision',
    decisions: decisions.map(([id, label, level, column = 0]) => ({
      id,
      label,
      level,
      column,
    })),
    outcomes: outcomes.map(([id, label, level, column = 0]) => ({
      id,
      label,
      level,
      column,
    })),
    edges: edges.map(([id, from, to, condition]) => ({
      id,
      from,
      to,
      condition,
    })),
    ...options,
  };
}

function record(visualId, scene, details, steps = undefined) {
  return {
    visualId,
    scene,
    annotation: annotation(visualId, ...details),
    ...(steps ? { steps } : {}),
  };
}

const records = [
  record(
    'visual-context-01-object-map',
    flow(
      [
        ['state', 'CONVERSATION STATE'],
        ['corpus', 'RETRIEVAL CORPUS'],
        ['memory', 'LONG-TERM MEMORY'],
        ['checkpoint', 'CHECKPOINT'],
        ['prompt', 'PROMPT CONTEXT'],
        ['blocked', 'NOT DIRECTLY VISIBLE'],
      ],
      [
        ['state-prompt', 'state', 'prompt', { label: 'SELECTED PROJECTION' }],
        ['corpus-prompt', 'corpus', 'prompt', { label: 'EVIDENCE' }],
        ['memory-prompt', 'memory', 'prompt', { label: 'GOVERNED RECALL' }],
        ['checkpoint-blocked', 'checkpoint', 'blocked', { label: 'RECOVERY ONLY', kind: 'excluded' }],
      ],
    ),
    [
      ['quiz-context-01-1', 'iq-context-01-1'],
      '能按 owner、scope、lifecycle 与投影条件区分五类对象。',
      '五类信息为何不能都叫 memory？关系总览图。',
      '五个对象围绕 prompt；state、corpus evidence 与 memory 只有经选择的投影进入窗口，checkpoint 明确落入非直接可见分支。',
      [
        { type: 'edge', from: 'state', to: 'prompt' },
        { type: 'edge', from: 'corpus', to: 'prompt' },
        { type: 'edge', from: 'memory', to: 'prompt' },
        { type: 'edge', from: 'checkpoint', to: 'blocked' },
      ],
    ],
  ),
  record(
    'visual-context-01-projection-lifecycle',
    flow(
      [
        ['sources', 'SOURCE OBJECTS'],
        ['validity', 'VALIDITY'],
        ['permission', 'PERMISSION'],
        ['relevance', 'RELEVANCE'],
        ['budget', 'TOKEN BUDGET'],
        ['manifest', 'CONTEXT MANIFEST'],
        ['excluded', 'EXCLUDED REASONS'],
      ],
      [
        ['sources-validity', 'sources', 'validity'],
        ['validity-permission', 'validity', 'permission'],
        ['permission-relevance', 'permission', 'relevance'],
        ['relevance-budget', 'relevance', 'budget'],
        ['budget-manifest', 'budget', 'manifest', { label: 'INCLUDED' }],
        ['validity-excluded', 'validity', 'excluded', { label: 'INVALID', kind: 'excluded' }],
        ['permission-excluded', 'permission', 'excluded', { label: 'DENIED', kind: 'excluded' }],
        ['budget-excluded', 'budget', 'excluded', { label: 'OVER BUDGET', kind: 'excluded' }],
      ],
    ),
    [
      ['iq-context-01-3'],
      '能从 prompt item 反向追踪到状态事件或源版本，并解释排除原因。',
      '后端对象怎样变成本轮输入？投影流程图。',
      '对象依次通过有效性、权限、相关性与预算门，included 进入 manifest，invalid、denied 与 over-budget 分别进入 excluded reasons。',
      [
        { type: 'edge', from: 'sources', to: 'validity' },
        { type: 'edge', from: 'budget', to: 'manifest' },
        { type: 'edge', from: 'permission', to: 'excluded' },
      ],
    ],
  ),
  record(
    'visual-context-01-offloading-boundary',
    flow(
      [
        ['active', 'ACTIVE CONTEXT'],
        ['pointer', 'RECOVERY POINTER'],
        ['boundary', 'READ BOUNDARY'],
        ['external', 'EXTERNAL STATE'],
        ['unavailable', 'UNAVAILABLE'],
      ],
      [
        ['active-pointer', 'active', 'pointer'],
        ['pointer-boundary', 'pointer', 'boundary', { label: 'URI + HASH + ACL' }],
        ['boundary-external', 'boundary', 'external', { label: 'AUTHORIZED READ' }],
        ['boundary-unavailable', 'boundary', 'unavailable', { label: 'FAILED VERIFY', kind: 'excluded' }],
      ],
    ),
    [
      ['quiz-context-01-2'],
      '能说明外置细节的引用、权限、回取和 unavailable 失败边界。',
      '哪些内容留在活动上下文，哪些可外置？边界图。',
      '活动上下文只留最小集与恢复指针；指针携带 URI、hash 与 ACL 穿过 read boundary，核验失败明确转入 unavailable。',
      [
        { type: 'edge', from: 'active', to: 'pointer' },
        { type: 'edge', from: 'boundary', to: 'external' },
        { type: 'edge', from: 'boundary', to: 'unavailable' },
      ],
    ],
  ),
  record(
    'visual-context-02-token-budget',
    chart(
      { id: 'bucket', label: 'CONTEXT BUCKET' },
      { id: 'tokens', label: 'TOKENS', min: 0, max: 8192 },
      [
        ['allocation', 'ALLOCATED TOKENS', [
          ['fixed', 'I_fixed', 1024],
          ['history', 'H_recent', 1536],
          ['tools', 'T_results', 768],
          ['evidence', 'R_evidence', 2048],
          ['scratch', 'S_scratch', 512],
          ['output', 'O_reserve', 1536],
          ['remaining', 'remaining', 768],
        ]],
      ],
      { totalLabel: 'W = 8192', mode: 'bars' },
    ),
    [
      ['iq-context-02-1'],
      '能用守恒式核对输入分桶与输出预留，而不把 fixture 比例当通用值。',
      '8192 token 怎样分给六类内容？预算条图。',
      '一条具名 series 把六个预算桶与 remaining 绑定到各自数值，纵轴上限固定 8192，并明确总窗口 W=8192。',
      [
        { type: 'series', id: 'allocation' },
        { type: 'point', series: 'allocation', id: 'output' },
        { type: 'point', series: 'allocation', id: 'remaining' },
      ],
    ],
  ),
  record(
    'visual-context-02-overflow-strategies',
    table(
      [
        ['strategy', 'STRATEGY'],
        ['keeps', 'KEEPS'],
        ['loss', 'LOSS'],
        ['recovery', 'RECOVERY'],
      ],
      [
        ['selection', { strategy: 'SELECTION', keeps: 'HIGH VALUE ITEMS', loss: 'LOW-PRIORITY DETAIL', recovery: 'MANIFEST' }],
        ['compression', { strategy: 'COMPRESSION', keeps: 'NARRATIVE', loss: 'EXACT DETAIL', recovery: 'SOURCE POINTER' }],
        ['offloading', { strategy: 'OFFLOADING', keeps: 'ACTIVE MINIMUM', loss: 'IMMEDIATE ACCESS', recovery: 'AUTHORIZED READ' }],
        ['reset', { strategy: 'RESET', keeps: 'NEW TASK', loss: 'CONTINUITY', recovery: 'CHECKPOINT' }],
      ],
    ),
    [
      ['iq-context-02-2'],
      '能比较 selection、compression、offloading、reset 的损失与恢复条件。',
      '超限时四类策略各牺牲什么？比较表。',
      '四个策略逐行绑定保留对象、损失与恢复入口，避免把策略名画成没有可比维度的卡片。',
      [
        { type: 'cell', row: 'selection', column: 'loss' },
        { type: 'cell', row: 'compression', column: 'recovery' },
        { type: 'cell', row: 'offloading', column: 'loss' },
        { type: 'cell', row: 'reset', column: 'recovery' },
      ],
    ],
  ),
  record(
    'visual-context-02-injection-loss-guard',
    decision(
      [
        ['trust', 'TRUSTED INSTRUCTION SOURCE?', 0, 0],
        ['required', 'REQUIRED COST ≤ INPUT BUDGET?', 1, 0],
        ['detail', 'HIGH-RISK DETAIL PRESENT?', 2, 0],
      ],
      [
        ['exclude', 'EXCLUDE', 1, 1],
        ['unassemblable', 'UNASSEMBLABLE', 2, 1],
        ['include', 'INCLUDE', 3, 0],
        ['retrieve', 'RETRIEVE ORIGINAL', 3, 1],
      ],
      [
        ['trust-required', 'trust', 'required', 'YES'],
        ['trust-exclude', 'trust', 'exclude', 'NO'],
        ['required-detail', 'required', 'detail', 'YES'],
        ['required-unassemblable', 'required', 'unassemblable', 'NO'],
        ['detail-include', 'detail', 'include', 'YES'],
        ['detail-retrieve', 'detail', 'retrieve', 'NO'],
      ],
    ),
    [
      ['quiz-context-02-2'],
      '能在 required 超限、提示注入或压缩缺失高风险字段时选择显式失败或回取。',
      '组装器何时 include、exclude、fail 或回取？决策树。',
      '来源边界、requiredCost 与细节核验依次形成 YES/NO 分支，最终落到 include、exclude、unassemblable 或 retrieve-original。',
      [
        { type: 'edge', from: 'trust', to: 'exclude' },
        { type: 'edge', from: 'required', to: 'unassemblable' },
        { type: 'edge', from: 'detail', to: 'retrieve' },
      ],
    ],
  ),
  record(
    'visual-context-03-event-state-summary',
    flow(
      [
        ['events', 'TRANSCRIPT EVENTS'],
        ['reducer', 'REDUCER'],
        ['state', 'CANONICAL STATE'],
        ['summary', 'LOSSY SUMMARY'],
        ['pointers', 'SOURCE POINTERS'],
      ],
      [
        ['events-reducer', 'events', 'reducer'],
        ['reducer-state', 'reducer', 'state', { label: 'CURRENT FACTS' }],
        ['events-summary', 'events', 'summary', { label: 'LOSSY DERIVATION' }],
        ['state-pointers', 'state', 'pointers'],
        ['summary-pointers', 'summary', 'pointers'],
      ],
    ),
    [
      ['quiz-context-03-1', 'iq-context-03-1'],
      '能区分事件证据、当前规范状态和有损摘要的职责。',
      'Transcript、state、summary 如何派生又不互相冒充？三层图。',
      '事件经 reducer 生成 canonical state，并另行派生 lossy summary；两条派生链都保留 source pointers 回到事件证据。',
      [
        { type: 'edge', from: 'events', to: 'reducer' },
        { type: 'edge', from: 'events', to: 'summary' },
        { type: 'edge', from: 'summary', to: 'pointers' },
      ],
    ],
  ),
  record(
    'visual-context-03-compaction-loss',
    chart(
      { id: 'phase', label: 'COMPACTION PHASE' },
      { id: 'tokens', label: 'TOKENS', min: 0, max: 1200 },
      [
        ['token-count', 'TOKEN COUNT', [
          ['before', 'BEFORE', 1200, { note: '5 HIGH-RISK FIELDS' }],
          ['checkpoint', 'CHECKPOINT', 420, { note: '3 RETAINED · 2 LOST' }],
          ['verify', 'VERIFY', 420, { note: 'SOURCE POINTER / UNAVAILABLE' }],
        ]],
      ],
      { mode: 'line', totalLabel: 'LOSS IS EXPLICIT · RECOVERY IS VERIFIED' },
    ),
    [
      ['iq-context-03-2'],
      '能量化压缩前后信息损失，并用 source pointer 核验数字、否定与工具状态。',
      '压缩删掉了什么，怎样恢复核验？三步趋势图。',
      'token-count series 从 1200 降到 420；checkpoint 绑定 3 retained 与 2 lost，verify 绑定 source pointer 和 unavailable 分支。',
      [
        { type: 'point', series: 'token-count', id: 'before' },
        { type: 'point', series: 'token-count', id: 'checkpoint' },
        { type: 'point', series: 'token-count', id: 'verify' },
      ],
    ],
    {
      'assets/visuals/context-rag-memory/context-03-compaction-loss-step-1.svg': flow(
        [['before', 'STEP 1 · BEFORE'], ['tokens', '1200 TOKENS'], ['fields', '5 HIGH-RISK FIELDS']],
        [['before-tokens', 'before', 'tokens'], ['tokens-fields', 'tokens', 'fields']],
      ),
      'assets/visuals/context-rag-memory/context-03-compaction-loss-step-2.svg': flow(
        [['checkpoint', 'STEP 2 · CHECKPOINT'], ['tokens', '420 TOKENS'], ['loss', '3 RETAINED · 2 LOST']],
        [['checkpoint-tokens', 'checkpoint', 'tokens'], ['tokens-loss', 'tokens', 'loss']],
      ),
      'assets/visuals/context-rag-memory/context-03-compaction-loss-step-3.svg': decision(
        [['verify', 'SOURCE POINTER AVAILABLE?', 0, 0]],
        [['retrieve', 'RETRIEVE ORIGINAL', 1, 0], ['unavailable', 'UNAVAILABLE', 1, 1]],
        [['verify-retrieve', 'verify', 'retrieve', 'YES'], ['verify-unavailable', 'verify', 'unavailable', 'NO']],
      ),
    },
  ),
  record(
    'visual-context-03-recoverability-chain',
    flow(
      [
        ['event-17', 'EVENT e17'],
        ['old', 'OLD FACT'],
        ['event-24', 'CORRECTION e24'],
        ['new', 'NEW FACT'],
        ['summary', 'SUMMARY VIEW'],
        ['projection', 'CURRENT PROJECTION'],
      ],
      [
        ['event17-old', 'event-17', 'old'],
        ['old-new', 'old', 'new', { label: 'supersededBy' }],
        ['event24-new', 'event-24', 'new'],
        ['new-summary', 'new', 'summary'],
        ['new-projection', 'new', 'projection', { label: 'CURRENT' }],
        ['old-projection', 'old', 'projection', { label: 'EXCLUDED', kind: 'excluded' }],
      ],
    ),
    [
      ['quiz-context-03-2', 'iq-context-03-3'],
      '能用 supersession 保留新旧事实来源且只投影当前值。',
      '一次用户纠正怎样贯穿 event、state 和 summary？机制链。',
      'e17 旧事实与 e24 纠正分别连接旧值和新值；supersededBy 保留历史关系，current projection 纳入新值并排除旧值。',
      [
        { type: 'edge', from: 'old', to: 'new' },
        { type: 'edge', from: 'new', to: 'projection' },
        { type: 'edge', from: 'old', to: 'projection' },
      ],
    ],
  ),
  record(
    'visual-context-04-ingestion-pipeline',
    flow(
      [
        ['acquire', 'ACQUIRE'],
        ['parse', 'PARSE'],
        ['normalize', 'NORMALIZE'],
        ['chunk', 'CHUNK'],
        ['metadata', 'METADATA'],
        ['embed', 'EMBED'],
        ['index', 'INDEX'],
      ],
      [
        ['acquire-parse', 'acquire', 'parse'],
        ['parse-normalize', 'parse', 'normalize'],
        ['normalize-chunk', 'normalize', 'chunk'],
        ['chunk-metadata', 'chunk', 'metadata', { label: 'documentId · version · ACL · span' }],
        ['metadata-embed', 'metadata', 'embed'],
        ['embed-index', 'embed', 'index'],
      ],
    ),
    [
      ['iq-context-04-3'],
      '能列出摄取七阶段并保持 documentId、version、ACL、hash 与 span。',
      '原件怎样成为可搜索且可引用的派生索引？管线总览。',
      'acquire 到 index 七阶段按序连接；跨行的 CHUNK→METADATA 仍是显式 edge，并携带 documentId、version、ACL 与 span。',
      [
        { type: 'edge', from: 'acquire', to: 'parse' },
        { type: 'edge', from: 'chunk', to: 'metadata' },
        { type: 'edge', from: 'embed', to: 'index' },
      ],
    ],
  ),
  record(
    'visual-context-04-chunk-strategies',
    table(
      [
        ['strategy', 'STRATEGY'],
        ['boundary', 'BOUNDARY'],
        ['recall', 'RECALL'],
        ['context', 'CONTEXT'],
        ['citation', 'CITATION'],
      ],
      [
        ['fixed', { strategy: 'FIXED · 256', boundary: 'TOKEN COUNT', recall: 'FINE', context: 'FRAGILE', citation: 'PRECISE' }],
        ['structural', { strategy: 'STRUCTURAL', boundary: 'HEADING / TABLE', recall: 'BALANCED', context: 'PRESERVED', citation: 'MAPPABLE' }],
        ['semantic', { strategy: 'SEMANTIC', boundary: 'TOPIC SHIFT', recall: 'QUERY-ALIGNED', context: 'COHERENT', citation: 'VARIABLE' }],
        ['parent-child', { strategy: 'PARENT-CHILD · 48', boundary: 'CHILD + PARENT', recall: 'FINE + BROAD', context: 'RECOVERABLE', citation: 'CHILD SPAN' }],
      ],
    ),
    [
      ['iq-context-04-1'],
      '能按召回、重复、上下文与引用定位比较四种切分策略。',
      '同一文档用四种 chunking 会发生什么？比较表。',
      '固定、结构、语义和父子块逐行绑定 boundary、recall、context 与 citation 指标，不把策略名称当作无关系卡片。',
      [
        { type: 'cell', row: 'fixed', column: 'context' },
        { type: 'cell', row: 'structural', column: 'boundary' },
        { type: 'cell', row: 'semantic', column: 'recall' },
        { type: 'cell', row: 'parent-child', column: 'citation' },
      ],
    ],
  ),
  record(
    'visual-context-04-version-acl-delete',
    flow(
      [
        ['source-v3', 'SOURCE v3'],
        ['revoke-v2', 'REVOKE v2'],
        ['chunks', 'CHUNKS'],
        ['index', 'VECTOR INDEX'],
        ['cache', 'CACHE'],
        ['alias', 'SERVICE ALIAS'],
        ['gate', 'PUBLISH GATE'],
      ],
      [
        ['v3-chunks', 'source-v3', 'chunks', { label: 'VERSION + ACL' }],
        ['v2-chunks', 'revoke-v2', 'chunks', { label: 'TOMBSTONE' }],
        ['chunks-index', 'chunks', 'index'],
        ['index-cache', 'index', 'cache'],
        ['cache-alias', 'cache', 'alias'],
        ['alias-gate', 'alias', 'gate', { label: 'CONSISTENT SNAPSHOT' }],
      ],
    ),
    [
      ['quiz-context-04-2', 'iq-context-04-2'],
      '能证明新版本发布与旧版本撤权传播到 chunk、index、cache 和 alias。',
      '正文更新为何还不是索引更新？传播流程图。',
      'SOURCE v3 与 REVOKE v2 分别以 version/ACL 和 tombstone 进入 chunks，再按 index、cache、alias 到 publish gate 的顺序传播。',
      [
        { type: 'edge', from: 'source-v3', to: 'chunks' },
        { type: 'edge', from: 'revoke-v2', to: 'chunks' },
        { type: 'edge', from: 'cache', to: 'alias' },
        { type: 'edge', from: 'alias', to: 'gate' },
      ],
    ],
  ),
  record(
    'visual-context-05-hybrid-signals',
    flow(
      [
        ['query', 'QUERY · ZX-17 ENERGY SAVER'],
        ['sparse', 'SPARSE'],
        ['dense', 'DENSE'],
        ['exact', 'EXACT TERM'],
        ['semantic', 'SEMANTIC MATCH'],
        ['fusion', 'HYBRID FUSION'],
      ],
      [
        ['query-sparse', 'query', 'sparse', { label: 'ZX-17' }],
        ['query-dense', 'query', 'dense', { label: 'ENERGY SAVER' }],
        ['sparse-exact', 'sparse', 'exact'],
        ['dense-semantic', 'dense', 'semantic'],
        ['exact-fusion', 'exact', 'fusion'],
        ['semantic-fusion', 'semantic', 'fusion'],
      ],
    ),
    [
      ['quiz-context-05-1', 'iq-context-05-1'],
      '能说明编号查询与语义改写为何需要互补候选通道。',
      'Sparse 和 dense 分别看见查询的哪部分？分支融合图。',
      'ZX-17 精确词分支进入 sparse/exact-term，energy-saver 语义分支进入 dense/semantic-match，两路再汇入 hybrid fusion。',
      [
        { type: 'edge', from: 'query', to: 'sparse' },
        { type: 'edge', from: 'query', to: 'dense' },
        { type: 'edge', from: 'exact', to: 'fusion' },
        { type: 'edge', from: 'semantic', to: 'fusion' },
      ],
    ],
  ),
  record(
    'visual-context-05-rrf-fusion',
    table(
      [
        ['document', 'DOCUMENT'],
        ['sparseRank', 'SPARSE RANK'],
        ['denseRank', 'DENSE RANK'],
        ['sparseContribution', '1/(60+sparse)'],
        ['denseContribution', '1/(60+dense)'],
        ['total', 'RRF TOTAL'],
      ],
      [
        ['doc-a', { document: 'doc-A', sparseRank: 1, denseRank: '—', sparseContribution: '0.0164', denseContribution: '0.0000', total: '0.0164' }],
        ['doc-b', { document: 'doc-B', sparseRank: 2, denseRank: 1, sparseContribution: '0.0161', denseContribution: '0.0164', total: '0.0325' }],
        ['doc-c', { document: 'doc-C', sparseRank: '—', denseRank: 2, sparseContribution: '0.0000', denseContribution: '0.0161', total: '0.0161' }],
      ],
      { k: 60, footer: 'doc-B = 1/(60+2) + 1/(60+1) = 0.0325' },
    ),
    [
      ['iq-context-05-1'],
      '能按 k=60 计算名次贡献，且不混加不同尺度的原始分数。',
      '两路名次怎样用 RRF 合并？逐文档计算表。',
      'doc-A、doc-B、doc-C 分别绑定 sparse/dense rank、两路倒数贡献与 total；footer 展开 doc-B 的 0.0325 算式。',
      [
        { type: 'cell', row: 'doc-b', column: 'sparseRank' },
        { type: 'cell', row: 'doc-b', column: 'denseRank' },
        { type: 'cell', row: 'doc-b', column: 'total' },
      ],
    ],
  ),
  record(
    'visual-context-05-ann-tradeoff',
    table(
      [
        ['configuration', 'CONFIGURATION'],
        ['recall', 'RECALL@10'],
        ['p95', 'P95 LATENCY'],
        ['memory', 'MEMORY'],
        ['update', 'UPDATE COST'],
      ],
      [
        ['fast', { configuration: 'FAST', recall: '0.82', p95: '18 ms', memory: '1.0×', update: '4 min' }],
        ['balanced', { configuration: 'BALANCED', recall: '0.91', p95: '34 ms', memory: '1.4×', update: '7 min' }],
        ['deep', { configuration: 'DEEP', recall: '0.96', p95: '61 ms', memory: '2.1×', update: '12 min' }],
      ],
      { footer: 'SYNTHETIC FIXTURE · SAME QUERY SLICE AND HARDWARE' },
    ),
    [
      ['quiz-context-05-2', 'iq-context-05-3'],
      '能共同比较 ANN recall、p95 latency、内存与更新成本。',
      '更深 ANN 搜索带来哪些联动代价？指标绑定表。',
      'FAST、BALANCED、DEEP 三行分别绑定 recall@10、p95 latency、memory 与 update cost；每个值只属于对应配置和指标列。',
      [
        { type: 'cell', row: 'fast', column: 'recall' },
        { type: 'cell', row: 'balanced', column: 'p95' },
        { type: 'cell', row: 'deep', column: 'memory' },
        { type: 'cell', row: 'deep', column: 'update' },
      ],
    ],
  ),
  record(
    'visual-context-06-candidate-evidence-pipeline',
    chart(
      { id: 'stage', label: 'PIPELINE STAGE' },
      { id: 'items', label: 'ITEM COUNT', min: 0, max: 20 },
      [
        ['candidate-count', 'REMAINING ITEMS', [
          ['candidates', 'CANDIDATES', 20],
          ['filtered', 'FILTERED', 14],
          ['reranked', 'RERANKED', 8],
          ['deduped', 'DEDUPED', 6],
          ['packed', 'PACKED', 4, { note: 'EVIDENCE PACKET' }],
        ]],
      ],
      { mode: 'line' },
    ),
    [
      ['quiz-context-06-1', 'iq-context-06-1'],
      '能解释候选在哪一层被过滤、重排、去重或预算排除。',
      '20 个候选怎样变成 4 条证据？漏斗趋势图。',
      'candidate-count series 按 20→14→8→6→4 绑定候选、过滤、重排、去重和打包阶段，packed 点明确标注 evidence packet。',
      [
        { type: 'point', series: 'candidate-count', id: 'candidates' },
        { type: 'point', series: 'candidate-count', id: 'filtered' },
        { type: 'point', series: 'candidate-count', id: 'packed' },
      ],
    ],
  ),
  record(
    'visual-context-06-rerank-dedup-diversity',
    table(
      [
        ['candidate', 'CANDIDATE'],
        ['before', 'BEFORE RANK'],
        ['after', 'AFTER RANK'],
        ['decision', 'DEDUP / DIVERSITY'],
        ['coverage', 'COVERAGE'],
      ],
      [
        ['a', { candidate: 'A', before: 1, after: 3, decision: 'KEEP', coverage: 'AMOUNT' }],
        ['b', { candidate: 'B', before: 2, after: 1, decision: 'KEEP', coverage: 'EXCEPTION' }],
        ['c', { candidate: 'C', before: 3, after: 2, decision: 'DUPLICATE · DROP', coverage: 'OVERLAP' }],
        ['d', { candidate: 'D', before: 4, after: 4, decision: 'SUPERSEDED · DROP', coverage: 'OLD VERSION' }],
        ['e', { candidate: 'E', before: 5, after: 5, decision: 'KEEP', coverage: 'APPROVAL' }],
      ],
    ),
    [
      ['iq-context-06-1', 'iq-context-06-2'],
      '能区分 rerank、版本去重和方面多样性的不同作用。',
      '排序变化后为何仍需去重和多样性？前后比较表。',
      '每个候选绑定 before/after rank、dedup decision 与 coverage；duplicate 和 superseded-version 分别排除，保留 amount、exception、approval。',
      [
        { type: 'cell', row: 'b', column: 'after' },
        { type: 'cell', row: 'c', column: 'decision' },
        { type: 'cell', row: 'd', column: 'decision' },
        { type: 'cell', row: 'e', column: 'coverage' },
      ],
    ],
  ),
  record(
    'visual-context-06-provenance-packing',
    flow(
      [
        ['observation', 'HOST OBSERVATION'],
        ['call', 'callId · call-9'],
        ['hash', 'RESULT HASH · 8f31'],
        ['source', 'SOURCE v4 · SPAN 18–27'],
        ['packet', '1500 TOKEN EVIDENCE PACKET'],
        ['citation', 'CITATION MANIFEST'],
      ],
      [
        ['observation-call', 'observation', 'call'],
        ['call-hash', 'call', 'hash'],
        ['hash-source', 'hash', 'source'],
        ['source-packet', 'source', 'packet'],
        ['packet-citation', 'packet', 'citation', { label: 'citationId' }],
      ],
    ),
    [
      ['quiz-context-06-2', 'iq-context-06-3'],
      '能把 citationId 映射到真实 observation、callId、hash、source version 与 span。',
      '证据包怎样同时保留工具真相和引用来源？来源链。',
      '宿主 observation 依次绑定 call-9、result hash 8f31、source v4 span 18–27、1500-token packet 和 citation manifest。',
      [
        { type: 'edge', from: 'observation', to: 'call' },
        { type: 'edge', from: 'hash', to: 'source' },
        { type: 'edge', from: 'packet', to: 'citation' },
      ],
    ],
  ),
  record(
    'visual-context-07-memory-lifecycle',
    flow(
      [
        ['candidate', 'CANDIDATE EVENT'],
        ['admission', 'ADMISSION'],
        ['active', 'ACTIVE MEMORY'],
        ['projection', 'BOUNDED PROJECTION'],
        ['superseded', 'SUPERSEDED'],
        ['expired', 'EXPIRED'],
        ['deleted', 'DELETED'],
      ],
      [
        ['candidate-admission', 'candidate', 'admission'],
        ['admission-active', 'admission', 'active', { label: 'STORE' }],
        ['active-projection', 'active', 'projection', { label: 'SUBJECT + SCOPE' }],
        ['active-superseded', 'active', 'superseded'],
        ['active-expired', 'active', 'expired'],
        ['active-deleted', 'active', 'deleted'],
      ],
    ),
    [
      ['quiz-context-07-1', 'iq-context-07-1'],
      '能把候选准入、active ledger、bounded recall 与三类失效串成生命周期。',
      '长期记忆从哪里来，又怎样停止召回？生命周期图。',
      'candidate 经过 admission 写入 active memory，经 subject/scope bounded projection 使用；active 可分支到 superseded、expired 或 deleted。',
      [
        { type: 'edge', from: 'candidate', to: 'admission' },
        { type: 'edge', from: 'active', to: 'projection' },
        { type: 'edge', from: 'active', to: 'deleted' },
      ],
    ],
  ),
  record(
    'visual-context-07-admission-conflict',
    decision(
      [
        ['scope', 'SUBJECT + SCOPE VALID?', 0, 0],
        ['sensitivity', 'SENSITIVITY ALLOWED?', 1, 0],
        ['consent', 'CONSENT PRESENT?', 2, 0],
        ['confidence', 'CONFIDENCE ≥ 0.70?', 3, 0],
        ['conflict', 'EXISTING VALUE?', 4, 0],
      ],
      [
        ['reject', 'REJECT', 1, 1],
        ['store', 'STORE', 5, 0],
        ['no-op', 'NO-OP', 5, 1],
        ['supersede', 'SUPERSEDE', 5, 2],
      ],
      [
        ['scope-sensitivity', 'scope', 'sensitivity', 'YES'],
        ['scope-reject', 'scope', 'reject', 'NO'],
        ['sensitivity-consent', 'sensitivity', 'consent', 'YES'],
        ['sensitivity-reject', 'sensitivity', 'reject', 'NO'],
        ['consent-confidence', 'consent', 'confidence', 'YES'],
        ['consent-reject', 'consent', 'reject', 'NO'],
        ['confidence-conflict', 'confidence', 'conflict', 'YES'],
        ['confidence-reject', 'confidence', 'reject', 'NO'],
        ['conflict-store', 'conflict', 'store', 'NONE'],
        ['conflict-noop', 'conflict', 'no-op', 'UNCHANGED'],
        ['conflict-supersede', 'conflict', 'supersede', 'CORRECTED'],
      ],
      { actionSummary: 'REJECT · STORE · NO-OP · SUPERSEDE' },
    ),
    [
      ['quiz-context-07-1', 'iq-context-07-1'],
      '能把 salience 与 consent、confidence、sensitivity 和 scope 分开裁决。',
      '什么候选可以 store、reject、no-op 或 supersede？治理决策树。',
      'subject/scope、sensitivity、consent、confidence 逐级作为治理 decision；existing-value 分支再区分 none、unchanged 和 corrected，落到四类 action。',
      [
        { type: 'edge', from: 'scope', to: 'reject' },
        { type: 'edge', from: 'consent', to: 'confidence' },
        { type: 'edge', from: 'conflict', to: 'no-op' },
        { type: 'edge', from: 'conflict', to: 'supersede' },
      ],
    ],
  ),
  record(
    'visual-context-07-decay-delete',
    chart(
      { id: 'time', label: 'LIFECYCLE EVENT' },
      { id: 'relevance', label: 'RELEVANCE', min: 0, max: 1 },
      [
        ['relevance', 'SYNTHETIC RELEVANCE', [
          ['fresh', 'FRESH', 1],
          ['aged', 'AGED', 0.65],
          ['stale', 'STALE', 0.2],
        ]],
        ['state-boundaries', 'STATE BOUNDARIES', [
          ['ttl', 'TTL EXPIRED', 0, { note: 'STOP RECALL' }],
          ['superseded', 'SUPERSEDED', 0, { note: 'USE NEW VALUE' }],
          ['delete', 'DELETE PROPAGATION', 0, { note: 'STORE · INDEX · CACHE · PROJECTION' }],
        ]],
      ],
      { mode: 'line', footer: 'SYNTHETIC FIXTURE · NOT A UNIVERSAL DECAY CURVE' },
    ),
    [
      ['quiz-context-07-2', 'iq-context-07-3'],
      '能区分 relevance decay、TTL、supersession、delete 及其传播承诺。',
      '记忆变旧、过期、更正和删除有什么不同？双 series 时间线。',
      'relevance series 绑定 1.00→0.65→0.20；state-boundaries series 分别绑定 TTL stop-recall、superseded use-new-value 与 delete 的 store/index/cache/projection 传播。',
      [
        { type: 'point', series: 'relevance', id: 'fresh' },
        { type: 'point', series: 'relevance', id: 'stale' },
        { type: 'point', series: 'state-boundaries', id: 'ttl' },
        { type: 'point', series: 'state-boundaries', id: 'delete' },
      ],
    ],
  ),
  record(
    'visual-context-08-integrated-flow',
    flow(
      [
        ['source', 'SOURCE'],
        ['ingestion', 'INGESTION'],
        ['retrieval', 'RETRIEVAL'],
        ['evidence', 'EVIDENCE'],
        ['state', 'STATE PROJECTION'],
        ['memory', 'MEMORY PROJECTION'],
        ['prompt', 'PROMPT'],
        ['answer', 'ANSWER + CITATION'],
      ],
      [
        ['source-ingestion', 'source', 'ingestion'],
        ['ingestion-retrieval', 'ingestion', 'retrieval'],
        ['retrieval-evidence', 'retrieval', 'evidence'],
        ['evidence-prompt', 'evidence', 'prompt'],
        ['state-prompt', 'state', 'prompt'],
        ['memory-prompt', 'memory', 'prompt'],
        ['prompt-answer', 'prompt', 'answer'],
        ['answer-source', 'answer', 'source', { label: 'CITATION SPAN', kind: 'reference' }],
      ],
    ),
    [
      ['iq-context-08-3'],
      '能画出 source 到 answer 的 owners、versions、projections 与反向 citation。',
      'RAG、state 与 memory 怎样汇合而不混存？综合流图。',
      'source 经 ingestion、retrieval、evidence 进入 prompt；state 和 memory 独立投影汇入 prompt，answer citation 再反向连接 source span。',
      [
        { type: 'edge', from: 'source', to: 'ingestion' },
        { type: 'edge', from: 'state', to: 'prompt' },
        { type: 'edge', from: 'memory', to: 'prompt' },
        { type: 'edge', from: 'answer', to: 'source' },
      ],
    ],
  ),
  record(
    'visual-context-08-graphrag-update-boundary',
    table(
      [
        ['case', 'CASE'],
        ['query', 'QUERY / CHANGE'],
        ['route', 'ROUTE / UPDATE'],
        ['gate', 'REQUIRED GATE'],
      ],
      [
        ['lookup', { case: 'QUERY', query: 'LOOKUP QUERY', route: 'SPARSE + DENSE', gate: 'ACL + SOURCE SPAN' }],
        ['relationship', { case: 'QUERY', query: 'RELATIONSHIP QUERY', route: 'GRAPHRAG', gate: 'ACL + SOURCE SPAN' }],
        ['content', { case: 'UPDATE', query: 'CONTENT CHANGE', route: 'INCREMENTAL UPDATE', gate: 'VERSION COVERAGE' }],
        ['schema', { case: 'UPDATE', query: 'PARSER / GRAPH SCHEMA', route: 'FULL REBUILD', gate: 'SOURCE SPAN GATE' }],
      ],
    ),
    [
      ['quiz-context-08-2', 'iq-context-08-2'],
      '能按查询类型选择 GraphRAG 分支，并按变更类型选择增量更新或全量重建。',
      'GraphRAG 何时用，更新何时重建？边界矩阵。',
      'lookup 与 relationship query 分别绑定 sparse+dense 与 GraphRAG；content change 与 schema change 分别绑定 incremental update 与 full rebuild，并共享 ACL/source-span gates。',
      [
        { type: 'cell', row: 'lookup', column: 'route' },
        { type: 'cell', row: 'relationship', column: 'route' },
        { type: 'cell', row: 'content', column: 'route' },
        { type: 'cell', row: 'schema', column: 'route' },
      ],
    ],
  ),
  record(
    'visual-context-08-layered-diagnosis',
    decision(
      [
        ['ingestion', 'INGESTION OK?', 0, 0],
        ['retrieval', 'RETRIEVAL CONTAINS TARGET?', 1, 0],
        ['rerank', 'RERANK RETAINS TARGET?', 2, 0],
        ['packing', 'PACKING RETAINS TARGET?', 3, 0],
        ['generation', 'GENERATION USES EVIDENCE?', 4, 0],
        ['memory', 'MEMORY CONFLICT?', 5, 0],
        ['freshness', 'SOURCE FRESH?', 6, 0],
      ],
      [
        ['first-distortion', 'PACKING · FIRST DISTORTION', 3, 1],
        ['pass', 'TRACE PASSES', 7, 0],
      ],
      [
        ['ingestion-retrieval', 'ingestion', 'retrieval', 'YES'],
        ['retrieval-rerank', 'retrieval', 'rerank', 'YES · 20'],
        ['rerank-packing', 'rerank', 'packing', 'YES · 8'],
        ['packing-distortion', 'packing', 'first-distortion', 'NO · 4'],
        ['packing-generation', 'packing', 'generation', 'YES'],
        ['generation-memory', 'generation', 'memory', 'YES'],
        ['memory-freshness', 'memory', 'freshness', 'NO CONFLICT'],
        ['freshness-pass', 'freshness', 'pass', 'YES'],
      ],
    ),
    [
      ['quiz-context-08-1', 'iq-context-08-1'],
      '能沿七层集合差找到首次失真点，而不是无界扩大 top-k。',
      '正确证据在哪一层首次消失？分层决策树。',
      'ingestion、retrieval、rerank、packing、generation、memory-write、freshness 逐层判断；fixture 在 packing 的 NO·4 分支标记 first distortion。',
      [
        { type: 'edge', from: 'ingestion', to: 'retrieval' },
        { type: 'edge', from: 'rerank', to: 'packing' },
        { type: 'edge', from: 'packing', to: 'first-distortion' },
        { type: 'edge', from: 'freshness', to: 'pass' },
      ],
    ],
  ),
];

export const contextRagMemoryScenes = deepFreezeVisual(records);

const sceneLookup = Object.fromEntries(
  contextRagMemoryScenes.map((sceneRecord) => [sceneRecord.visualId, sceneRecord]),
);

export const contextRagMemoryScenesById = deepFreezeVisual({
  size: contextRagMemoryScenes.length,
  get(visualId) {
    return sceneLookup[visualId];
  },
  keys() {
    return Object.keys(sceneLookup)[Symbol.iterator]();
  },
});

function visibleSceneLabels(scene) {
  if (scene.type === 'flow') return scene.nodes.map(({ label }) => label);
  if (scene.type === 'table') {
    return [
      ...scene.columns.map(({ label }) => label),
      ...scene.rows.flatMap(({ cells }) => Object.values(cells).map(String)),
      ...(scene.footer ? [scene.footer] : []),
    ];
  }
  if (scene.type === 'chart') {
    return [
      ...scene.series.flatMap(({ label, points }) => [
        label,
        ...points.flatMap((point) => [
          point.label,
          ...(point.note ? [point.note] : []),
        ]),
      ]),
      ...(scene.totalLabel ? [scene.totalLabel] : []),
      ...(scene.footer ? [scene.footer] : []),
    ];
  }
  return [
    ...scene.decisions.map(({ label }) => label),
    ...scene.outcomes.map(({ label }) => label),
    ...(scene.actionSummary ? [scene.actionSummary] : []),
  ];
}

function visibleSceneValues(scene) {
  if (scene.type === 'chart') {
    return scene.series.flatMap(({ points }) => points.map(({ value }) => value));
  }
  if (scene.type === 'table') {
    return scene.rows.flatMap(({ cells }) => (
      Object.values(cells).filter((value) => typeof value === 'number')
    ));
  }
  return [];
}

export const contextRagMemoryVisualFixtures = deepFreezeVisual(
  contextRagMemoryScenes.map((sceneRecord) => ({
    id: sceneRecord.annotation.fixtureId,
    visualId: sceneRecord.visualId,
    labels: visibleSceneLabels(sceneRecord.scene),
    values: visibleSceneValues(sceneRecord.scene),
    ...(sceneRecord.steps ? {
      stepLabels: Object.fromEntries(
        Object.entries(sceneRecord.steps).map(([assetPath, scene]) => [
          assetPath,
          visibleSceneLabels(scene),
        ]),
      ),
    } : {}),
  })),
);

export const contextRagMemoryVisualInventoryFixtures = deepFreezeVisual(
  contextRagMemoryScenes.map(({ visualId, annotation: sceneAnnotation }) => ({
    visualId,
    assessedOutcomes: sceneAnnotation.assessedOutcomes,
    assessedCoverage: sceneAnnotation.assessedCoverage,
    outcomeCriteria: sceneAnnotation.outcomeCriteria,
    cognitiveQuestion: sceneAnnotation.cognitiveQuestion,
    storyboard: sceneAnnotation.storyboard,
  })),
);
