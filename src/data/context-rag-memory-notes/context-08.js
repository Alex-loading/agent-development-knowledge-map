const sections = Object.freeze([
  Object.freeze({
    id: 'separate-five-system-objects',
    title: '先分清五类对象再画架构',
    paragraphs: Object.freeze([
      '企业政策助理同时使用多种持久数据，但它们不是同一种“记忆”。RAG corpus 保存可版本化、可授权、能回到源文档的外部政策知识；conversation state 保存当前会话仍有效的目标、约束与待办；checkpoint 保存一次 run 恢复执行所需的位置和中间状态；long-term memory 保存绑定主体与 scope、经准入且可治理的跨会话信息；prompt context 只是上述对象在本轮经过选择后的有限投影。持久化不代表模型自动可见，只有进入 manifest 的投影才占用本轮窗口。',
      'Fine-tuning 改变模型参数或行为模式，RAG 在推理时查找动态外部知识。课程采用的选择边界是：频繁变化、需要引用和撤权的企业政策优先进入 RAG；相对稳定的表达风格或行为模式才可能考虑 fine-tuning；“某用户希望默认看中文”这类主体相关且要更新删除的信息进入长期记忆。三者可以组合，但不能用 fine-tuning 充当最新政策数据库，也不能把公共手册复制到每个用户的记忆空间。',
      'State 与 checkpoint 也不能互换。State 回答“现在任务事实是什么”，例如用户正在询问上海办公室的差旅政策；checkpoint 回答“这个 run 从哪个步骤安全恢复”，可能包含检索游标和已完成工具调用。长期记忆则回答“跨会话是否有获准复用的信息”。综合设计先为每类对象写 owner、subject/tenant、version、retention、read condition 与 projection rule，再画数据流，避免一条“向量库到模型”的线掩盖状态和治理。',
      'GraphRAG 是对关系型或全局性查询的一条可选检索分支：当问题需要跨实体、跨文档聚合关系时，可以从版本化图结构生成候选或社区摘要；精确条款、关键词、向量相似度和原文引用仍可能走 sparse、dense 或 hybrid 路径。它不是“替换向量检索”的开关，更不能跳过权限、版本、evidence packet 与 claim-to-span 核验。',
    ]),
    keyPoints: Object.freeze([
      'Corpus、state、checkpoint、long-term memory 与 prompt context 的所有者和生命周期不同。',
      '动态可引用知识用 RAG，稳定行为模式才考虑 fine-tuning，主体相关信息才进入长期记忆。',
      '持久数据只有经过有界投影进入 prompt 才会被模型看到。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '这是设计选择，不是互斥分类',
      body: 'RAG、fine-tuning、state 与长期记忆可以组合；关键是按变化频率、可追溯性、主体作用域和更新成本分配职责。',
    }),
    sourceIds: Object.freeze([
      'res-context-ragas',
      'res-context-longmemeval',
      'res-context-ragflow',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'contract-source-through-index',
    title: '从 source 到 index 保留身份与版本',
    paragraphs: Object.freeze([
      '第一段契约从 source 开始。Source record 至少保存 sourceId、documentId、sourceVersion、effectiveFrom/To、tenant、accessPolicyRef、contentHash、canonicalUri 与状态，并明确 sourceOwner=政策发布与合规团队，由它确认正文、权限和生效期。Ingest 接收明确 sourceId/version，输出 ingestRunId、parserVersion、normalizedArtifactId、ingestedAt、status 和 rejectionReason，同时记录 ingestOwner=数据摄取服务团队，负责解析运行、失败重放与规范化产物。若文件损坏、权限元数据缺失或版本已撤销，应形成可查询的 rejected 结果，而不是让“没出现在索引”变成无解释空白。',
      'Chunk 层把规范化文档切成 retrieval unit，但保留 documentId、sourceVersion、chunkId、ordinal、headingPath、sourceSpan、language、access labels 与 content hash，并写入 chunkOwner=内容处理与切分团队。ChunkId 不能仅由数组位置临时生成，否则重建索引后引用无法比较；source span 让候选最终能映射回精确 citation unit。表格、FAQ 和政策条款可以采用不同边界，但每次切分都要记录 chunkPolicyVersion，重叠片段也要能识别共同来源，避免同一条款重复占满证据预算。',
      'Index 层输出 indexName/indexVersion、entryId、chunkId、sourceVersion、representationType、embeddingOrAnalyzerVersion、indexedAt，并明确 indexOwner=检索平台团队，负责构建、发布、回滚与版本一致性。发布新政策时，旧 sourceVersion、旧 chunks 和旧 index entries 必须按生效规则停止进入默认检索；若重建失败，系统宁可明确降级到已知一致的版本，也不能静默混用新正文与旧向量。RAGFlow 的版本化产品文档可以交叉观察解析、chunk、检索测试和知识库流程，但它描述的是该产品实现，不定义所有系统的接口或引用保证。',
      '更新流程用稳定 documentId、contentHash 与 sourceVersion 判断新增、修改、撤权和删除：增量路径只重算受影响的 normalized artifact、chunks、向量或图边，并发布新的 indexVersion；全量重建用于解析器、切分或表示版本变化。无论哪条路径，删除和权限变更都必须传播到 chunk、向量、图索引、缓存与服务别名；发布前做源版本到索引版本的覆盖核对，发布失败则回滚到一致快照，不能把“部分更新成功”当作新版本已生效。',
    ]),
    keyPoints: Object.freeze([
      'Source、ingest、chunk、index 每层都输出稳定 ID、版本、owner、状态与失败原因。',
      'Chunk 继承源版本、权限和 source span，retrieval unit 与 citation unit 可不同但必须可映射。',
      '索引发布与源版本失效要协调，不能让新正文和旧表示静默混答。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-08-graphrag-update-boundary', afterParagraph: 3 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-ragflow',
      'res-context-ragas',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag-update',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'contract-retrieve-through-pack',
    title: '把 retrieve、filter、rerank 与 pack 分层',
    paragraphs: Object.freeze([
      'Retrieve 输入 requestId、queryId、原始查询、可选 rewriteId、tenant/subject、允许的 corpusVersion、语言、时间点和权限上下文，输出 candidateSetId 与候选 chunkIds，并记录 retrieveOwner=检索服务团队。每个候选保留检索通道、原始分数或名次、indexVersion 和 queryVariant；没有结果也要记录是索引无候选还是调用失败。Query rewrite 不能替代原查询，trace 必须保留两者，才能判断同义扩展提升了召回，还是添加未表达假设导致意图漂移。',
      'Filter 是授权与有效性决策，不只是相关性清理。它接收 candidateSetId，逐项检查 tenant、access labels、document status、sourceVersion、effective time、language 与业务 metadata，输出 filteredSetId、included candidateIds、excluded candidateId/reason，并写入 filterOwner=权限与政策执行团队。权限和撤权应在可控服务层强制；当结果突然归零，工程师先查看 unauthorized、stale-version、not-effective 或 metadata-mismatch，而不是无界提高 top-k 绕过过滤。',
      'Rerank 接收过滤后的候选与 queryId，输出 rankedSetId、rankerVersion、新 rank、score、降权理由与 rerankOwner=搜索排序团队；它只能重新排列首阶段已经召回的内容，不能找回缺失文档。Pack 再由 packOwner=上下文编排团队按 token budget、去重、多样性和来源版本形成 evidencePacketId，保存 included chunk/span、排除原因与 used/remaining budget。相关候选可能因 duplicate、superseded-version、low-rank 或 budget-exceeded 未进入包，因此 candidate 出现不等于模型最终看见。',
      '关系型问题若启用 GraphRAG，retrieve trace 还要保存 graphVersion、entity/relation IDs、community 或路径摘要的来源文档，以及为什么该 query 被路由到图分支；这些候选之后仍进入相同的权限过滤、重排和预算打包。图摘要若无法映射回当前有效 source span，只能作为导航或候选生成信号，不能直接承担最终政策主张。',
    ]),
    keyPoints: Object.freeze([
      'Retrieve 保存原查询、改写、索引版本和多路候选身份，空结果也必须可解释。',
      'Filter 输出逐项授权、版本、时效与 metadata 排除原因，不能靠扩大 top-k 绕过。',
      'Rerank 只重排已有候选，pack 再按去重、多样性和预算形成 evidence packet。',
    ]),
    sourceIds: Object.freeze([
      'res-context-ragflow',
      'res-context-ragas',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag',
    ]),
  }),
  Object.freeze({
    id: 'project-state-and-memory',
    title: '让 state 与 memory 通过独立投影汇合',
    paragraphs: Object.freeze([
      'State projection 输入 conversationId、stateVersion 与 currentTurnId，输出 stateProjectionId、有效目标、当前实体、硬约束、未决问题以及这些字段对应的 eventIds，并记录 stateProjectionOwner=会话状态服务团队。它不直接复制全部 transcript，也不把 checkpoint 的内部执行对象塞入 prompt。若用户在本轮纠正地点或政策范围，stateVersion 应通过 supersession 指向新值；生成端读取的是当前有效投影，同时仍可从 eventId 回溯为什么发生变化。',
      'Memory projection 输入 authenticated subject、scope、queryId、policyVersion 和当前时间，输出 memoryProjectionId、included memoryIds/sourceRefs、excluded reasons，并记录 memoryProjectionOwner=长期记忆治理团队。它先排除过期、删除、被取代、越权和不相关记录，再受独立预算约束。长期记忆只能提供主体相关偏好或经批准的跨会话事实，不能用“用户以前这么说”覆盖最新企业政策；若旧记忆与本轮明确输入冲突，本轮输入优先，trace 记录 conflict 与胜出规则。',
      '两种投影与 evidence packet 在 prompt manifest 中汇合，但仍保留分区：instruction、current request、state projection、retrieval evidence、memory projection 各有 itemId、sourceRef、version、priority、tokenCost、owner 与 included/excluded reason。这样可以单独撤回错误 memory，而不破坏公共 corpus；也可以重新检索新政策，而不抹掉会话目标。LongMemEval 提供跨会话检索、时间推理和知识更新的评测视角，但公开任务不证明生产隐私、删除传播或租户隔离。',
    ]),
    keyPoints: Object.freeze([
      'State projection 来源于会话事件与当前版本，memory projection 来源于跨会话准入记录。',
      '当前明确输入和最新有效政策优先于陈旧或冲突的长期记忆。',
      'Prompt manifest 保留分区、来源、版本、owner、预算与排除原因，投影汇合但存储不混同。',
    ]),
    sourceIds: Object.freeze([
      'res-context-longmemeval',
      'res-context-ragas',
      'res-context-ragflow',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'generate-and-verify-citations',
    title: '从 prompt manifest 到 claim 与 citation',
    paragraphs: Object.freeze([
      'Generate 输入 promptManifestId、instructionVersion、requestId、stateProjectionId、evidencePacketId、memoryProjectionId、modelId/version 和 generationConfigId，输出 answerId、answerVersion、finish status、生成 trace 与 generateOwner=生成编排团队。模型看到的是这个确定的上下文快照，而不是直接连接所有存储。若 required instruction 或关键证据因预算未能打包，编排器应显式失败或降级，不能静默截断后让模型猜测政策答案。',
      'Citation 层把 answer 拆成可核对 claimIds，并为需要外部依据的主张建立 citationId、claimId、sourceId、sourceVersion、chunkId、sourceSpan、evidencePacketId 与 citationOwner=引用验证团队。格式正确的链接只证明回源路径存在，不证明 span 语义上支持主张；同一段也可能只支持金额条件，却不支持模型补出的适用地区。核验要分别检查 citation correctness、citation completeness 与 generation faithfulness，并标记 unsupported、partial-support 或 conflicting-evidence。',
      'RAGAS 把检索上下文与生成回答分开评估，为分层指标提供研究入口，但具体指标依赖其定义、评估模型和数据假设，不能单独证明事实正确。企业验收还需要人工 claim-to-span 样本、政策 owner 的有效性确认，以及失败回放。答案展示 source/version 与可读标题，内部 trace 保存稳定 id；若引用源已撤销，旧 answer 的审计记录可保留，但新请求不得继续把失效版本当作当前证据。',
    ]),
    keyPoints: Object.freeze([
      'Generate 消费版本化 prompt manifest，并输出可重放的 answerId 与模型配置。',
      'Citation 把 claim 映射到 source/version/chunk/span，链接存在不等于语义支持成立。',
      '检索质量、引用正确与完整、生成忠实性需要分别评估，不能压成一个端到端分数。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '有引用仍可能答错',
      body: '候选可能过期，pack 可能遗漏反例，模型也可能越过证据；必须逐条检查 claim 与 span 的支持关系。',
    }),
    sourceIds: Object.freeze([
      'res-context-ragas',
      'res-context-ragflow',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'diagnose-by-layered-falsification',
    title: '沿数据流做分层反证',
    paragraphs: Object.freeze([
      '当政策答案错误，先提出可被日志证伪的问题，而不是立即改 prompt。Source 层检查正确条款是否存在、由谁负责、在请求时间是否有效；ingest 检查目标 version 是否成功解析；chunk 检查关键条件是否被截断且 span 是否可回源；index 检查对应 entry 是否发布到查询使用的 indexVersion。若信息在某层已不存在，后续扩大 top-k、换模型或加记忆都不能修复根因。',
      '若索引中存在，再沿 retrieve、filter、rerank、pack 检查。候选集中没有目标 chunk 是漏召或 query/rewrite 问题；候选出现但 filteredSet 没有，则用 excluded reason 判断权限、版本、时效或 metadata 是否误删；filtered 有而 ranked 太低，检查 ranker 与候选规模；ranked 有而 packet 没有，检查去重、预算和多样性。每一步用输入输出 ID 做集合差，不靠“看起来相关”的最终答案猜测。',
      '若 evidence packet 已含正确 span，再检查 state 与 memory 是否带来错误地点、角色或旧偏好，prompt manifest 是否发生优先级冲突，最后逐 claim 比较答案与证据。Packet 正确而 answer 越界属于 generation faithfulness；引用指错 span 属于 citation mapping；公共政策正确但个性化语言错误可能是 memory projection；只有一个端到端分数无法区分这些故障。诊断面板必须把 ingestion、retrieval、rerank、packing、generation、memory-write 和 freshness 分开呈现；修复应落在首次失真层，并用同一 request trace 回放证明信息不再在那里消失。',
    ]),
    keyPoints: Object.freeze([
      '诊断顺序是 source、ingest、chunk、index、retrieve、filter、rerank、pack、state/memory、generate、cite。',
      '每层用稳定输入输出 ID、版本和排除原因做集合差与反证。',
      '修复首次失真层；扩大 top-k 或改 prompt 不能替代摄取、版本、权限与忠实性诊断。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-08-layered-diagnosis', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-ragas',
      'res-context-ragflow',
      'res-context-longmemeval',
      'res-context-primary-javaguide-rag-update',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-javaguide-rag',
    ]),
  }),
  Object.freeze({
    id: 'deliver-policy-assistant-capstone',
    title: '交付政策助理架构、故障树与验收清单',
    paragraphs: Object.freeze([
      'Capstone 选择一个具体问题，例如员工询问当前差旅报销政策并要求按个人语言偏好回答。架构图逐层标注 source、ingest、chunk、index、retrieve、filter、rerank、pack、state projection、memory projection、generate 与 cite；每条箭头写输入 ID、输出 ID、版本、owner、预算或排除原因。公共政策归政策 owner 和版本化 corpus，当前部门与问题归 conversation state，语言偏好归可治理 memory，run 恢复位置归 checkpoint；四者不能合并成一个向量 namespace。',
      '故障树至少演练七条分支：未摄取时 ingestRun 显示 failed/rejected；旧版本时 sourceVersion 与 indexVersion 不一致；漏召时目标 chunk 不在 candidateSet；误过滤时 excluded reason 指向错误 metadata 或授权规则；打包丢失时目标在 rankedSet 但因预算等原因不在 evidencePacket；错误记忆时旧 memoryId 出现在 projection 并与当前输入冲突；不忠实生成时 packet 已有正确 span 而 claim 仍越界。每条分支都给检测证据、责任 owner、局部修复和回归断言。',
      '验收清单分开测 retrieval、evidence、generation 与 memory lifecycle：目标政策版本能被授权查询召回；packet 中 span 真正覆盖问题条件；每个外部 claim 都能映射到当前 source version；模型不添加未支持条件；过期、删除或越权 memory 不进入 projection；当前输入与最新政策按规则胜出。再测试依赖失败、空召回和关键证据超预算时的显式降级。社区课程可以帮助复现组件流程，公开视频只作导航，尤其没有稳定字幕正文的媒体不能承担这些关键接口或保证，也不进入本章 sourceIds。',
    ]),
    keyPoints: Object.freeze([
      '架构图逐层标注输入输出 ID、版本、owner、预算和排除原因，并分离 corpus、state、checkpoint 与 memory。',
      '故障树覆盖未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆和不忠实生成。',
      '验收分别衡量召回、证据支持、生成忠实性和记忆生命周期，并验证显式降级。',
    ]),
    sourceIds: Object.freeze([
      'res-context-ragas',
      'res-context-longmemeval',
      'res-context-ragflow',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag-update',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-javaguide-rag',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '企业政策、当前会话、run checkpoint 和用户偏好都是持久数据，可以放进同一个向量库统一处理。',
    correction: '四类对象的 owner、版本、生命周期、权限与投影条件不同；它们可以在 prompt 汇合，但不能混成同一存储语义。',
  }),
  Object.freeze({
    claim: 'RAG 答错时先把 top-k 调大并重写 prompt，通常就能覆盖所有故障。',
    correction: '未摄取、旧索引、误授权过滤、预算丢失和错误记忆不会被无界 top-k 正确修复；应先定位首次失真层。',
  }),
  Object.freeze({
    claim: '候选列表里出现正确 chunk，就说明模型最终一定看到了这段证据。',
    correction: '候选还会经过过滤、重排、去重和预算打包；只有进入指定 evidencePacket 与 prompt manifest 才对本轮可见。',
  }),
  Object.freeze({
    claim: '答案带有格式正确的引用链接，就可以把整段答案视为已验证事实。',
    correction: '链接只提供回源；仍要逐 claim 检查 citation span 是否正确、证据是否完整以及生成是否忠实。',
  }),
  Object.freeze({
    claim: 'Fine-tuning 最适合保存频繁更新的政策事实，RAG 和长期记忆可以因此删除。',
    correction: '课程把动态可引用知识交给 RAG，把稳定行为模式留给 fine-tuning，把主体相关且可治理的信息交给长期记忆；三者可组合。',
  }),
  Object.freeze({
    claim: '公开视频标题和讲者身份足以证明课程中的具体机制、接口和效果结论。',
    correction: '没有稳定取得字幕或等价正文的视频只能作学习导航，不能支撑关键机制、数字或生产保证，因此本章不把它们列为 section 来源。',
  }),
]);

export const context08Note = Object.freeze({
  readingMinutes: 44,
  overviewVisualId: 'visual-context-08-integrated-flow',
  overviewVisualSectionId: 'separate-five-system-objects',
  introduction: '前七课分别建立了上下文预算、会话 state、版本化 corpus、混合召回、evidence packet 与长期记忆生命周期；最后一课要把它们组合成一个能诊断的企业政策助理。真正的难点不是画出“文档—向量库—模型”三格图，而是为 source、ingest、chunk、index、retrieve、filter、rerank、pack、state projection、memory projection、generate 与 cite 建立层间契约：每层都有输入输出 ID、版本、owner、预算和排除原因。本章先分清 RAG、fine-tuning、state、checkpoint 与 long-term memory 的职责，再沿政策数据流定义可追溯接口，最后用分层反证定位未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆和不忠实生成，交付架构图、故障树与可执行验收清单。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Corpus、conversation state、checkpoint、long-term memory 和 prompt context 是不同对象，持久化不等于自动可见。',
    '动态且需引用的政策优先 RAG，稳定行为模式才考虑 fine-tuning，主体相关信息进入可治理记忆。',
    'Source、ingest、chunk 与 index 每层保留稳定 ID、版本、owner、权限、状态和失败原因。',
    'Retrieve 保存原查询与候选来源，filter 保存逐项排除原因，rerank 与 pack 分别负责次序和预算选择。',
    'State projection 与 memory projection 独立生成，在 prompt manifest 汇合但不混合底层存储。',
    '当前输入和最新有效政策优先于旧记忆，个人偏好不能覆盖公共规则。',
    'Generate 消费确定版本的 manifest，citation 再把 answer claim 映射回 source/version/chunk/span。',
    '检索质量、citation correctness、citation completeness 与 generation faithfulness 必须分开观测。',
    '分层诊断从 source 到 cite 寻找首次失真位置，不能用一个端到端分数或无界 top-k 掩盖原因。',
    '政策助理故障树至少覆盖未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆与不忠实生成。',
    'Capstone 以架构图、故障树和验收清单交付，每条接口都有 owner，每条排除和降级都有机器可读证据。',
    '社区材料与无稳定正文的视频只能补充学习导航，不能承担关键机制、效果数字或生产保证。',
  ]),
  nextStep: '完成这张综合架构后，学习重点从“会调用一个向量数据库”转为“能证明一条信息如何进入、为何被排除、最终是否被忠实使用”。后续工程化应把本章接口真正落到 trace、metric、log、版本发布和回归数据集：按 owner 监控 ingest 失败、索引陈旧、过滤误删、rerank 漂移、pack 超限、memory 冲突、unsupported claim 与删除传播，并定期用真实政策查询和人工 claim-to-span 样本复验。任何产品或模型升级都应携带版本并重跑分层验收，而不是把一次演示成功当成长期质量保证。',
});
