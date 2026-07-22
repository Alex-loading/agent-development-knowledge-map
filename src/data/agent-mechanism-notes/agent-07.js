const sections = Object.freeze([
  Object.freeze({
    id: 'information-carriers-and-lifecycles',
    title: '五种信息载体不是五个同义词：先按职责和生命周期分层',
    paragraphs: Object.freeze([
      '上一课要求先保存失败证据再恢复；当运行延长到二十轮，这些证据若只塞在聊天历史里，下一轮模型既难找到当前约束，也容易把旧计划当成现状。Transcript 是用户、模型与工具消息的原始交互序列，适合复盘“当时说了什么”；append-only event log 是只追加的结构化事实流，记录动作、观察、状态迁移和控制器决定，适合重放“系统怎样走到这里”。两者都是历史记录，却都不应直接充当当前状态。',
      'Working state 是从事件归约得到的当前可计算快照，例如任务契约版本、当前步骤、预算、未决副作用和终止状态；working memory 是当前单任务跨调用持续读写的短期信息集合，包括仍有效的事实、假设、计划、观察索引和产物指针；per-call context 则是为了某一次模型调用，从约束、状态和相关记录临时组装出的有限输入。Artifact pointer 只保存外部产物的 ID、版本、类型、访问边界与摘要，不把报告、网页或日志全文复制进状态。',
      'CoALA 把工作记忆描述为可跨语言模型调用维持当前感知、目标与中间信息的组件，并把环境反馈接回决策过程；Lilian Weng 的综述也用短期/长期记忆和上下文窗口解释 Agent 的信息问题。这些来源提供概念地图，不规定上述生产分层、字段或存储介质；五层职责与指针格式是本课程为可审计单 Agent 运行给出的工程综合。判断一个字段放哪里，要问它是否需要原样追溯、是否参与当前计算、是否跨下一次调用保留，以及本轮是否真的值得消耗 token。',
    ]),
    keyPoints: Object.freeze([
      'Transcript 保存原始交互，event log 保存结构化变化，working state 是可重建快照；三者不能混为一份不断膨胀的历史。',
      'Working memory 面向当前任务的短期持续信息，per-call context 只是某次调用实际装入的有限视图，artifact pointer 代替全文复制。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '账本、余额与随身清单',
      body: '事件日志像不可擦除的账本，状态像由账本算出的余额，工作记忆像任务期间维护的清单，本轮 context 则是出门前从清单里挑出的必要项目；类比只解释职责，不代表具体存储实现。',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-lilian-weng', 'res-agent-hello-agents']),
  }),
  Object.freeze({
    id: 'epistemic-records-and-provenance',
    title: '把“知道”拆成事实、假设、观察、belief 与 decision',
    paragraphs: Object.freeze([
      'Fact 是已通过当前任务认可的证据与验证规则支持、在注明范围和有效期内可用于决策的命题；assumption 是为了推进而暂时采用且允许被推翻的前提；unknown 是尚无足够证据回答的问题；observation 是工具或环境返回的原始或结构化信号；belief 是 Agent 根据一项或多项 observation 形成、仍可能错误或过期的内部判断；decision 则是控制器基于当时状态选择的动作或终止分支。语气确定不改变类别，模型写下“供应商合规”仍只是 belief，直到获准来源和验证器满足事实门。',
      '每条 observation 至少携带 observationId、sourceRef、observedAt、sourceVersion、integrityStatus 与原始证据指针；每条 fact 或 belief 携带 statement、version、derivedFrom、confidence、validUntil 和 validatorProvenance。confidence 表示当前证据下的认识强度，不能覆盖权限、有效期或 validator 结果；validUntil 到期、sourceVersion 改变或支持证据冲突时，条目转为 stale/contested，完成谓词不能继续把它当已验证事实。validatorProvenance 要记录验证器 ID、版本、输入证据与 PASS/FAIL/UNKNOWN，而不是只留下“已检查”。',
      '两个 observation 冲突时，不按“最新文本”或模型偏好直接覆盖：先保留两条原记录，比较来源权限、对象版本、时间范围与验证状态，把 belief 标成 contested，再选择获准的独立查询或人工裁决。外部网页或 artifact pointer 指向的内容也只是待验证输入；检索成功只证明“取回了内容”，不证明内容里的陈述为事实。CoALA 支撑环境反馈进入工作记忆和决策的一般机制，分类、版本、置信度、有效期与 validator provenance 字段均是课程综合，不是论文提出的生产 schema。',
    ]),
    keyPoints: Object.freeze([
      'Observation 是带来源的外部信号，belief 是可错的内部判断，fact 还须通过任务定义的证据和验证门；语气不能改变认识类别。',
      '版本、来源、置信度、有效期与 validator provenance 共同决定一条记录能否参与当前决策，冲突必须保留并触发再验证。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '指针可解析不等于内容可信',
      body: '成功打开 artifact 或网页只能生成 observation；只有来源获准、版本有效且验证器通过，相关命题才可升级为当前任务中的 fact。',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-lilian-weng']),
  }),
  Object.freeze({
    id: 'event-replay-and-derived-state',
    title: '事件只追加，状态可重建：让重启后的 Agent 仍是同一个运行',
    paragraphs: Object.freeze([
      'Event log 为每条事件记录稳定 eventId、sequence、type、actor、payloadRef、schemaVersion、previousHash 与 hash。宿主先追加请求、observation、验证、预算、契约修订和终止事件，再由确定性 reducer 归约 working state；摘要只能成为带 provenance 的派生事件。同一 eventId 幂等消费，sequence 缺口或 previousHash 不连续立即返回 BLOCKED_EVENT_INTEGRITY，且不得把违规事件写入状态。进程重启则校验 snapshot 后重放剩余事件。',
      '课程综合状态 schema JSON：{"runId":"run-supplier-17","taskContract":{"previous":{"version":2,"hardConstraints":["EU-data-residency"],"permissions":["supplier.search.read","ticket.read","ticket.update"],"validThroughEvent":16},"current":{"version":3,"hardConstraints":["read-only-research","EU-data-residency","do-not-contact-suppliers"],"permissions":["supplier.search.read","ticket.read","request-status.read"],"changeProvenance":{"eventId":"evt-17","actor":"user","reason":"revoke-ticket-update"}}},"control":{"status":"running","planVersion":4,"stepVersion":2,"budgets":{"turnsRemaining":6,"toolCallsRemaining":3,"tokensRemaining":4200}},"pendingSideEffect":{"stableIntent":"ticket-42-close-v1","authorizedByContractVersion":2,"requestEventId":"evt-16","status":"UNKNOWN_OUTCOME","reconcileBeforeAct":true,"allowedNow":["request-status.read","ticket.read"],"actAllowed":false},"knowledge":{"facts":[{"id":"f-b-eu","version":2,"derivedFrom":["obs-18"],"confidence":0.98,"validUntil":"2026-07-23T00:00:00Z"}],"contestedBeliefs":[{"id":"b-a-eu","version":4,"derivedFrom":["obs-8","obs-13"],"confidence":0.62,"status":"contested"}],"qualifiedObservations":[{"id":"obs-18","sourceRef":"supplier-registry","sourceVersion":"2026-07-22","integrityStatus":"verified"}],"validatorProvenance":{"validatorId":"policy-eu","version":"5","result":"PASS","evidenceIds":["obs-18"]},"unknowns":["supplier-a-current-certification"]},"artifactPointers":[{"artifactId":"board-9","version":5,"uri":"artifact://run-supplier-17/board-9?v=5","contentHash":"sha256:demo"}],"eventCursor":20,"summary":{"version":4,"coversThroughEvent":20,"derivedFrom":["evt-1..evt-20"],"generator":"summary-policy-2"}}。v2 在第 16 轮前明确授权一次 ticket.update 并持久化请求；v3 撤权后 current permissions 全为只读，旧 pending 只可对账、不可新 act。字段均为课程综合。',
    ]),
    keyPoints: Object.freeze([
      '原始事件只追加，状态由确定性 reducer 派生；snapshot 只是带版本与哈希的重放加速点，不能成为另一份真相。',
      '同一 eventId 幂等消费、完整重放与快照后增量重放必须得到等价状态；摘要版本或 provenance 无效就拒绝装入。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '可解析事件完整性 fixture 与 expected',
      body: '{"fixtures":[{"case":"normal","seed":{"sequence":0,"lastHash":"GENESIS"},"events":[{"eventId":"evt-1","sequence":1,"previousHash":"GENESIS","hash":"h1"},{"eventId":"evt-2","sequence":2,"previousHash":"h1","hash":"h2"}]},{"case":"duplicate","seed":{"sequence":0,"lastHash":"GENESIS"},"events":[{"eventId":"evt-1","sequence":1,"previousHash":"GENESIS","hash":"h1"},{"eventId":"evt-2","sequence":2,"previousHash":"h1","hash":"h2"},{"eventId":"evt-2","sequence":2,"previousHash":"h1","hash":"h2"}]},{"case":"sequence-gap","seed":{"sequence":0,"lastHash":"GENESIS"},"events":[{"eventId":"evt-1","sequence":1,"previousHash":"GENESIS","hash":"h1"},{"eventId":"evt-3","sequence":3,"previousHash":"h1","hash":"h3"}]},{"case":"wrong-previous-hash","seed":{"sequence":0,"lastHash":"GENESIS"},"events":[{"eventId":"evt-1","sequence":1,"previousHash":"GENESIS","hash":"h1"},{"eventId":"evt-2","sequence":2,"previousHash":"WRONG","hash":"h2"}]}],"expected":[{"case":"normal","result":"OK","sequence":2,"applied":2,"duplicatesIgnored":0},{"case":"duplicate","result":"OK","sequence":2,"applied":2,"duplicatesIgnored":1},{"case":"sequence-gap","result":"BLOCKED_EVENT_INTEGRITY","sequence":1,"applied":1,"duplicatesIgnored":0},{"case":"wrong-previous-hash","result":"BLOCKED_EVENT_INTEGRITY","sequence":1,"applied":1,"duplicatesIgnored":0}]}',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-hello-agents']),
  }),
  Object.freeze({
    id: 'context-assembly-and-invariant-gates',
    title: 'Context assembly 是有拒绝权的编译过程，不是自由摘要',
    paragraphs: Object.freeze([
      'Context assembler 先读取可信系统指令和 task contract，再加入当前控制状态、required invariants、最近且相关的合格 observation、未决冲突、当前计划步骤和 artifact pointers，最后才在剩余 token 预算内加入带 provenance 的历史摘要与少量 transcript 片段。它要同时计算固定预留、候选块 token、来源新鲜度和决策价值；输出除模型消息外还应保存 manifest，列出每个块的 sourceRef、version、tokenEstimate、includedReason、omittedReason 与 assemblerVersion，才能回答“模型这一轮为什么看见这些内容”。',
      'Required invariants JSON：["taskContract.previous","taskContract.current","control.status","control.budgets","control.planVersion","control.stepVersion","pendingSideEffect.status","pendingSideEffect.stableIntent","pendingSideEffect.authorizedByContractVersion","pendingSideEffect.reconcileBeforeAct","pendingSideEffect.actAllowed","knowledge.unknowns","knowledge.contestedBeliefs","knowledge.qualifiedObservations","knowledge.validatorProvenance","artifactPointers"]。这 16 个 path 在 state 与压缩 context 中使用同名投影；其中 current 还必须含 version、hardConstraints、permissions 与 changeProvenance。缺任何一项都 fail closed，不能让摘要抹掉撤权、旧授权 pending、预算、版本、观察或产物指针。列表与拒绝门均为课程综合。',
      '超限时按层裁剪：P0 系统安全、任务契约、权限、预算、pending、当前版本和终止条件不可删除；P1 最新合格 observation、冲突、unknown、当前步骤与验证来源保留结构化摘要；P2 早期决策、已完成步骤和 transcript 只留事件范围与 retrieval pointer；P3 寒暄、重复解释和废弃候选首先移除。若 P0+P1 已超过窗口，不得继续压缩到含义改变，而应缩小任务、分阶段调用、请求澄清或 blocked/handoff。Token 预算是安全约束，不是让摘要器获得删改硬约束的许可。',
    ]),
    keyPoints: Object.freeze([
      'Context assembly 按可信优先级组合当前决策所需信息，并输出可审计 manifest；摘要只是低于原始证据的派生输入。',
      '预算裁剪只能先删重复和低价值历史，永远不能删除 task contract、权限、预算、pending side effect、版本与 validator provenance。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '装不下时允许停止',
      body: '当不可变约束与当前证据本身超过窗口，正确结果是拆分任务或受控终止，而不是生成一份看似顺畅却改变权限和副作用语义的摘要。',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-lilian-weng', 'res-agent-hello-agents']),
  }),
  Object.freeze({
    id: 'twenty-turn-compression-walkthrough',
    title: '二十轮供应商与工单轨迹：从全文堆叠到最小可继续上下文',
    paragraphs: Object.freeze([
      '教学轨迹的 1–14 轮完成供应商搜索与冲突标记；15 轮生成 evidence board。v2 task contract 当时含 ticket.update，宿主在第 16 轮获授权持久化 stableIntent=ticket-42-close-v1 并发出一次写请求，响应丢失后记 UNKNOWN_OUTCOME。第 17 轮用户发布 v3：新增 read-only-research、do-not-contact-suppliers，并以 evt-17 撤销 ticket.update；旧 pending 不能假装消失，但从此只许调用只读 request-status/rowVersion 对账，不得再 act。18 轮验证供应商 B，19 轮保留冲突，20 轮继续对账。压缩输入 JSON：{"runId":"run-supplier-17","eventRange":"evt-1..evt-20","contractHistory":{"previousVersion":2,"writeAuthorizedThroughEvent":16,"stableIntentPersistedAt":"evt-16","currentVersion":3,"permissionChangeProvenance":"evt-17","currentPermissions":["supplier.search.read","ticket.read","request-status.read"]},"pending":{"status":"UNKNOWN_OUTCOME","authorizedByContractVersion":2},"estimatedTokens":15120,"contextBudget":5200,"mustContinueAt":"reconcile-ticket-42"}。轮次与 token 仅为教学夹具。',
      '压缩输出 JSON：{"taskContract":{"previous":{"version":2,"hardConstraints":["EU-data-residency"],"permissions":["supplier.search.read","ticket.read","ticket.update"],"validThroughEvent":16},"current":{"version":3,"hardConstraints":["read-only-research","EU-data-residency","do-not-contact-suppliers"],"permissions":["supplier.search.read","ticket.read","request-status.read"],"changeProvenance":{"eventId":"evt-17","actor":"user","reason":"revoke-ticket-update"}}},"control":{"status":"running","planVersion":4,"stepVersion":2,"budgets":{"turnsRemaining":6,"toolCallsRemaining":3,"tokensRemaining":4200}},"pendingSideEffect":{"stableIntent":"ticket-42-close-v1","authorizedByContractVersion":2,"status":"UNKNOWN_OUTCOME","reconcileBeforeAct":true,"actAllowed":false},"knowledge":{"unknowns":["supplier-a-current-certification"],"contestedBeliefs":[{"id":"b-a-eu","sources":["obs-8","obs-13"]}],"qualifiedObservations":[{"id":"obs-18","sourceRef":"supplier-registry","sourceVersion":"2026-07-22"}],"validatorProvenance":{"validatorId":"policy-eu","version":"5","result":"PASS"}},"artifactPointers":[{"uri":"events://run-supplier-17?from=1&to=20","integrity":"sha256:demo-events"},{"uri":"artifact://run-supplier-17/board-9?v=5","integrity":"sha256:demo-board"}],"summary":{"version":4,"derivedFrom":["evt-1..evt-20"],"generator":"summary-policy-2"},"manifest":{"tokenBudget":5200,"estimatedTokens":3870,"omitted":["chitchat","draft-v1..v3"]}}。它与 state 共享全部 16 条 invariant path，current permissions 只有只读能力；旧授权只解释 pending 来源，不恢复写权限。',
      '复核时分别输出事件索引、state、working memory 和 context：v2→v3 的权限变化有 provenance，pending 关联第 16 轮旧授权与同一 stable intent，当前 actAllowed=false，唯一后续是只读 reconcile；计划版本、预算、冲突 belief、合格 observation、验证来源与两个指针都未丢失。解析 events:// 或 artifact:// 只产生新 observation，外部正文通过验证前不得写入 facts。删除的是可回取寒暄和旧 draft，不是证据责任。',
    ]),
    keyPoints: Object.freeze([
      '二十轮案例压缩后仍须保留新增硬约束、合格 observation、冲突 belief、预算、计划版本和 UNKNOWN_OUTCOME 对账出口。',
      'Retrieval pointer 保存地址、版本与完整性信息；按需回取生成新的 observation，而不是把外部内容未经验证复制成 fact。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '压缩的是表示，不是证据责任',
      body: '从约一万五千 token 降到教学预算内，不意味着删掉原始记录；event range 与 artifact pointer 仍让审计者可以回取支持或反驳每项判断的证据。',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-hello-agents', 'res-agent-lilian-weng']),
  }),
  Object.freeze({
    id: 'semantic-probes-and-module-boundary',
    title: '用拒绝性 probe 验收，并把长期记忆问题留给后续模块',
    paragraphs: Object.freeze([
      '拒绝性 probe 不评价摘要是否“读起来不错”，而是解析正文 fixture：用 path resolver 检查 state 与 context 的 16 个 invariant，并逐个删除关键路径；运行合法撤权后的 pending 路由、摘要版本/provenance、pointer 认识类别和 token 裁剪。P0+P1 为 3800 而预算只有 3500 时必须返回 BLOCKED_CONTEXT_INVARIANTS_OVER_BUDGET 且 actAllowed=false，不能 overflow 后继续调用。',
      '本课边界是单 Agent 单次任务内的短期运行状态与本轮上下文：定义哪些信息必须持续、如何追溯和何时拒绝压缩。CoALA 的情景、语义、程序记忆分类和 Berkeley 课程导航可帮助建立后续学习地图，但这里不展开跨会话身份、长期记忆写入治理、向量或关键词检索策略、RAG 相关性排序、遗忘与删除政策。下一课会先用本章输出完成单 Agent 端到端设计；更后的 Context 工程模块再回答如何选择、检索和治理大规模外部上下文与长期记忆。',
    ]),
    keyPoints: Object.freeze([
      '验收必须覆盖全部 invariant、合法撤权历史、旧或无 provenance 摘要、事件完整性、外部内容误升事实与预算阻塞。',
      '本课只治理单任务短期状态和 per-call context；长期记忆、RAG 检索与跨会话治理只定义接口，不在此提前展开。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '可解析 assembly fixture 与 expected',
      body: '{"fixtures":[{"case":"pending-after-permission-revocation","stateRef":"compressed-output","currentPermissions":["supplier.search.read","ticket.read","request-status.read"],"pendingAuthorizedByContractVersion":2},{"case":"missing-hard-constraint","removePath":"taskContract.current.hardConstraints"},{"case":"missing-pending","removePath":"pendingSideEffect.status"},{"case":"stale-summary","summaryVersion":3,"currentSummaryVersion":4},{"case":"summary-without-provenance","summaryDerivedFrom":[]},{"case":"normal-trim","budget":4300,"blocks":[{"priority":"P0","tokens":1700},{"priority":"P1","tokens":2100},{"priority":"P2","tokens":1900},{"priority":"P3","tokens":700}]},{"case":"invariants-over-budget","budget":3500,"blocks":[{"priority":"P0","tokens":1700},{"priority":"P1","tokens":2100}]},{"case":"resolved-retrieval-pointer","uri":"artifact://run-supplier-17/board-9?v=5"}],"expected":[{"case":"pending-after-permission-revocation","result":"RECONCILE_ONLY","actAllowed":false},{"case":"missing-hard-constraint","result":"REJECT_MISSING_INVARIANT","actAllowed":false},{"case":"missing-pending","result":"REJECT_MISSING_INVARIANT","actAllowed":false},{"case":"stale-summary","result":"REJECT_STALE_OR_UNTRACEABLE_SUMMARY","actAllowed":false},{"case":"summary-without-provenance","result":"REJECT_STALE_OR_UNTRACEABLE_SUMMARY","actAllowed":false},{"case":"normal-trim","result":"TRIM_P3_THEN_P2_KEEP_P0_P1","kept":["P0","P1"],"actAllowed":false},{"case":"invariants-over-budget","result":"BLOCKED_CONTEXT_INVARIANTS_OVER_BUDGET","actAllowed":false},{"case":"resolved-retrieval-pointer","result":"OBSERVATION_ONLY","factPromoted":false}]}',
    }),
    sourceIds: Object.freeze(['res-agent-coala', 'res-agent-lilian-weng', 'res-agent-berkeley-course']),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Transcript 足够完整，所以可以直接当作 Agent 的当前 state。',
    correction: 'Transcript 适合追溯原始交互，却包含重复、旧计划和未验证文本；当前 state 应由结构化事件确定性归约，并可从日志重建。',
  }),
  Object.freeze({
    claim: '上下文窗口快满时，删除最早一半消息通常最安全。',
    correction: '时间早晚不等于决策价值。硬约束、权限、预算、pending、版本和验证来源必须固定保留，低价值重复历史才先裁剪。',
  }),
  Object.freeze({
    claim: '工具返回或检索到的内容都是客观事实，可以直接写入 facts。',
    correction: '工具输出首先是带来源与版本的 observation；它可能过期、冲突或不可信，只有通过任务认可的验证门才可升级为有效范围内的 fact。',
  }),
  Object.freeze({
    claim: '摘要已经覆盖全部内容，就可以删除 event log 和原始 artifact。',
    correction: '摘要是可过期的派生视图，必须带版本、事件范围和 provenance；原日志与产物保留追溯、重放、冲突检查和人工接管能力。',
  }),
  Object.freeze({
    claim: '只要 summary 更短，任何字段都能换成自然语言概括。',
    correction: '控制字段有精确语义；stable intent、pending 状态、预算、planVersion、stepVersion 和 validator provenance 被概括或遗漏会导致重复副作用、迟到写入或伪完成。',
  }),
  Object.freeze({
    claim: 'CoALA 给出了可以直接照搬到生产系统的统一 memory schema。',
    correction: 'CoALA 是概念架构与文献综述，不规定本章的事件、快照、摘要、优先级或拒绝门；这些实现结构均明确属于课程综合。',
  }),
]);

export const agent07Note = Object.freeze({
  readingMinutes: 34,
  introduction: '前六课已经产生任务契约、版本化计划、工具 observation、pending 副作用、恢复预算与验证证据；本章解决长轨迹中“什么必须保存、什么只在本轮可见”。你将区分 transcript、只追加事件、可重建状态、短期工作记忆与 per-call context，给事实、belief 和观察加来源与版本，并把二十轮供应商/工单案例压缩成仍可安全继续的最小输入。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Transcript 保存原始消息，append-only event log 保存结构化变化，working state 是事件归约出的当前快照。',
    'Working memory 在单任务内跨调用维持短期信息；per-call context 只是一次模型调用实际装入的预算化视图。',
    'Fact、assumption、unknown、observation、belief 与 decision 必须分开；模型语气不能把 belief 变成 fact。',
    'Observation、fact 与 belief 应记录版本、来源、时间、置信度、有效期及 validator provenance，冲突时保留原证据并重新验证。',
    '事件同 ID 幂等消费，完整重放与 snapshot 后增量重放须得到等价 state；snapshot 和 summary 都只是派生缓存。',
    'Task contract、硬约束、权限、预算、pending side effect、stable intent、planVersion、stepVersion 与验证来源属于 required invariants。',
    'Context 超预算时先裁剪寒暄、重复解释和可回取旧历史；若不可变约束本身装不下，就拆任务或受控终止。',
    'Artifact 与 event range 使用带版本和完整性信息的 retrieval pointer；回取内容先成为 observation，不能直接写成事实。',
    '二十轮案例保留新增约束、冲突 belief、未知项、当前预算和副作用对账出口，删除的只是低价值表示。',
    '旧 summary、无 provenance 摘要、缺硬约束或缺 pending 的 context 都必须拒绝；本课的 schema 与 probe 是课程综合。',
    '本章只覆盖单 Agent 单任务短期状态与本轮上下文，不展开长期记忆治理、RAG 检索或跨会话个性化。',
  ]),
  nextStep: '下一课把前七课拼成一个只读仓库诊断 Agent：task contract、状态与工作上下文、工具 schema、循环、计划、恢复和终止会进入同一份可审查设计；本章的 event replay、required invariants、retrieval pointers 与 context manifest 将负责证明它在长轨迹和进程重启后仍能安全继续。',
});
