const sections = Object.freeze([
  Object.freeze({
    id: 'turn-recalled-items-into-evidence-candidates',
    title: '把召回结果视为候选而非证据结论',
    paragraphs: Object.freeze([
      '上一课的 sparse、dense 与 hybrid retrieval 追求在可控成本下尽量不漏掉相关内容，输出的是 candidates（候选），不是可以原样塞进 Prompt 的最终证据。候选可能来自旧版本、与其他片段高度重叠、只在表面上相关，或多条都重复同一观点。若直接采用首阶段 top-k，同一文档的重叠 chunks 会挤占预算，真正互补或冲突的来源反而没有位置。',
      '本课管线依次处理 candidate provenance、reranking、版本选择、近重复与相邻 span、来源多样性、token 预算和 citation manifest。每一步都要保留输入候选、输出顺序、分数或判定、排除原因和 sourceRef。原始 RAG 研究支撑外部检索知识进入生成的基本架构，Anthropic 的 contextual retrieval 文章展示候选后接 reranker 的工程流程；二者都不自动提供本课完整证据包合同。',
      '贯穿案例继续使用企业政策助理。查询“差旅住宿上限及例外审批”召回到政策 v1、v2 的多个重叠片段、FAQ 转述和财务部门说明。正确目标不是选一个最高分文本，而是先保证有效版本，合并相邻且互补的 span，保留能独立支持“上限”和“例外”两类主张的来源，再在预算内生成可回源清单。',
      '阶段合同还要阻止下游绕过上游决定。被版本规则排除的候选不能因 reranker 高分重新进入，未被 evidence packet 接纳的文本也不能由生成器临时取用。每个阶段只消费上一阶段显式输出，并保留完整候选审计记录；这样答案缺失某条证据时，才能确定它在召回、版本、去重、预算还是生成阶段消失。',
    ]),
    keyPoints: Object.freeze([
      '首阶段 top-k 是高召回候选，不是最终 Prompt 证据。',
      '候选到证据包之间还需重排、版本、去重、多样性、预算和引用映射。',
      '每次选择与排除都保留 sourceRef 和原因，才能定位证据在哪一步消失。',
    ]),
    sourceIds: Object.freeze([
      'res-context-rag-paper',
      'res-context-contextual-retrieval',
    ]),
  }),
  Object.freeze({
    id: 'distinguish-rank-fusion-from-bert-reranking',
    title: '区分 RRF 融合与 BERT reranking',
    paragraphs: Object.freeze([
      'RRF 在上一课把多路检索列表按名次融合，使用的是各候选已经获得的 rank；它不读取 query 与 passage 的完整交互，也不重新判断段落中的具体语义。BERT passage reranker 则把查询与候选段落作为联合输入，对有限候选重新评分，使模型可以观察词语之间更细的交互。前者是 rank fusion，后者才是 query-passage reranking，二者处在不同阶段、使用不同信号。',
      'BERT reranker 只能重排输入候选。若正确政策从未被 sparse、dense 或 hybrid 召回，reranker 无法从 corpus 中凭空找回；候选数量扩大可能提高进入重排的召回机会，也会增加计算、延迟和噪声。论文结果绑定其 2019 年模型、候选与 TREC/MS MARCO 设置，因此本课只采用“联合编码后重排候选”的机制，不把论文数字外推为企业政策语料的收益。',
      'Trace 应分别记录 retrievalRank、fusionScore、rerankerScore 与 rerankedPosition，避免一个名为 score 的字段混淆阶段。若候选在 RRF 后已靠前，却被 reranker 降到预算线外，应检查 query-passage 领域适配和候选文本；若候选在进入 reranker 前就不存在，应回到召回与过滤。这样的阶段反证比盲目更换模型更快。',
      '重排评测需冻结首阶段候选集，分别观察正确文档的排序变化、进入预算线的比例、延迟和失败切片。若同时更换召回器与 reranker，就无法归因改善来自哪一层。候选文本还应采用与线上一致的标题和上下文化方式，否则离线分数只反映另一种输入格式，不能证明部署后的排序行为。',
    ]),
    keyPoints: Object.freeze([
      'RRF 根据已有名次做 rank fusion；BERT reranker 联合建模 query 与 passage 后重新评分。',
      'Reranker 不能修复首阶段完全漏召，候选数量还要权衡召回、延迟和成本。',
      'Retrieval、fusion 与 reranking 的名次和分数必须分字段记录。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '融合不是重排模型',
      body: 'RRF 问“多张榜单共同把谁排得高”，BERT reranker 问“给定查询，这个候选段落究竟有多相关”；前者不能代替后者，后者也不能创造缺失候选。',
    }),
    sourceIds: Object.freeze([
      'res-context-rrf',
      'res-context-bert-reranker',
      'res-context-contextual-retrieval',
    ]),
  }),
  Object.freeze({
    id: 'deduplicate-by-version-and-span-semantics',
    title: '按版本与 span 语义去重',
    paragraphs: Object.freeze([
      'Deduplication（去重）不是简单比较文本是否完全相同。政策 v1 与 v2 可能只改了一个金额，却不能被当作可互换重复；同一 v2 的相邻 chunks 可能共享 overlap，内容高度相似但分别包含规则与例外。去重键因此至少考虑 documentId、version、source span 与规范化内容指纹，并先依据有效版本规则排除默认不应参与回答的旧版。',
      '相邻 span 既可能重复也可能互补。若两个片段来自同一有效版本、范围重叠且合并后仍保持连续语义，可以生成一个组合候选，保留原始 chunkIds 和有序 sourceSpans；若中间跨过无关条款，则不能用一个大连续范围伪装。合并后的 citation unit 仍应能收窄到支持具体 claim 的子 span，而不是让整段文档承担所有主张。',
      '排除清单要区分 stale-version、exact-duplicate、overlap-merged 与 semantic-near-duplicate。对于语义近似但来自独立来源的内容，不应只因文字相近就删除，因为它可能提供独立佐证；对于同一来源的旧版复述，即使 reranker 分数高，也不能绕过版本治理。去重的目标是减少预算浪费，同时保留版本正确性和证据独立性。',
    ]),
    keyPoints: Object.freeze([
      '去重键要包含 document、version、span 与内容语义，不能只比较字符串。',
      '相邻 span 合并保留原始 IDs 和有序 spans，citation unit 仍可进一步收窄。',
      '独立来源的近似证据与同来源旧版重复必须区别处理。',
    ]),
    sourceIds: Object.freeze([
      'res-context-contextual-retrieval',
      'res-context-ragflow',
      'res-context-rag-paper',
    ]),
  }),
  Object.freeze({
    id: 'select-diverse-evidence-under-a-budget',
    title: '在预算内保留互补与冲突证据',
    paragraphs: Object.freeze([
      'Diversity（多样性）要求有限 evidence packet 覆盖回答所需的不同方面、独立来源和已知冲突，而不是让最高相关的同类片段占满空间。它不等于为了来源数量而牺牲关键证据：先满足必需 claim 的最低支持，再在剩余预算里选择增加新信息的候选。政策案例至少需要住宿上限、适用范围和例外审批三个方面，三段重复上限无法替代缺失的例外条款。',
      '预算选择可把候选描述为 tokenCost、coveredClaims、sourceGroup、version、rerankerScore 与 conflictFlag，再按确定性规则打包。本课不规定一种通用优化算法，而要求记录 included/excluded、选择理由和累计 token。若一个高分长 chunk 只增加已覆盖内容，而两个较短片段分别补足适用范围与审批责任，后者可能更适合当前任务；这一选择必须能由 manifest 解释。',
      '冲突证据不能通过去重静默消失。若有效政策与部门 FAQ 给出不同上限，证据包应同时保留、标记来源与时间，并让回答说明冲突或按治理优先级选择，而不是让 reranker 分数代替权威判断。预算不足时优先保留直接、有效且能支持必需 claim 的 span，并明确报告哪些方面因预算被排除。',
    ]),
    keyPoints: Object.freeze([
      '多样性服务 claim 覆盖、独立来源和冲突可见性，不是机械增加来源数量。',
      '预算选择记录 tokenCost、覆盖方面、来源组、版本、分数与排除理由。',
      '有效来源冲突应显式保留和解释，不能被去重或排序静默抹去。',
    ]),
    sourceIds: Object.freeze([
      'res-context-alce',
      'res-context-contextual-retrieval',
      'res-context-ragflow',
    ]),
  }),
  Object.freeze({
    id: 'build-an-evidence-packet-and-citation-manifest',
    title: '生成 evidence packet 与 citation manifest',
    paragraphs: Object.freeze([
      'Evidence packet（证据包）是本轮准备交给生成模型的、预算有界且可回源的证据集合。每项至少包含 evidenceId、chunk text、documentId、version、sourceSpans、sourceRef、选择阶段的分数或名次、tokenCost 和选择理由。Citation manifest（引用清单）则把可展示引用标识映射到 evidenceId 与精确 span，使生成后的 claim 可以回到选中的有效源，而不是临时拼接一个看似可信的链接。',
      'OpenAI citation formatting 文档能支撑当前产品中把文件标注转成用户可读引用的实现方式，RAGFlow v0.26.4 展示产品里的引用与 chunk 元数据；二者都不证明引用语义正确。本课 manifest 是跨本练习各阶段的工程合同：citationId 必须唯一，引用范围必须属于已入包 evidence，合并片段保留组成 spans，旧版本和预算排除项不得在生成阶段重新出现。',
      '打包后先做结构验证：所有 sourceRef 可解析，版本当前有效，span 落在对应源文档范围内，token 总和不超过预算，citationId 无重复，每个必需回答方面至少有一个候选支持。结构通过仍不等于答案正确，它只证明生成模型拿到一组可追溯输入；下一步还要逐条检查主张与引用之间的支持关系。',
    ]),
    keyPoints: Object.freeze([
      'Evidence packet 保存文本、源版本、spans、分数、成本与选择理由。',
      'Citation manifest 建立 citationId 到入包证据及精确 span 的唯一映射。',
      '结构可回源只解决追踪，不自动解决主张蕴含、覆盖完整或事实真实。',
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-citations',
      'res-context-ragflow',
      'res-context-alce',
    ]),
  }),
  Object.freeze({
    id: 'separate-citation-quality-dimensions',
    title: '分开 citation presence、correctness、completeness 与 factuality',
    paragraphs: Object.freeze([
      'Citation presence 只问答案是否放置了引用标记；citation correctness 问被指向的证据是否真的支持对应 claim；citation completeness 问需要证据的主张是否都获得了支持。三者不能互相替代：一段答案可以每句都有链接却全部错挂，也可以少量引用都正确但遗漏关键金额来源。ALCE 的研究明确区分引用正确性、完整性与答案质量，为逐句核对提供了证据基础。',
      'Factuality（事实性）还要单独检查答案主张是否真实、时效正确且没有越过证据。正确引用某份旧政策，只能证明答案忠实复述了旧内容，不能证明它是当前事实；引用支持“普通城市上限”，也不能推出“所有城市和例外情形都相同”。因此事实性还依赖源版本、权限、有效期、冲突处理和必要的外部验证，不能由 citation presence 或格式正确代替。',
      'Claim-to-citation 表逐条记录 claimId、答案文本、citationIds、support verdict、缺失证据和事实状态。对“住宿上限为 X，特殊地区需 Y 审批”至少拆成金额、适用条件与审批要求三个可核对 claim；一个 span 若只支持金额，就不能同时标为完整支持审批要求。核对者还要搜索证据包中是否存在被答案忽略的反例或限制。',
      '自动判定与人工判定分歧时，保存两者理由而不是只留最终标签。Correctness 的争议可能来自隐含蕴含，completeness 的争议可能来自哪些主张需要引用，factuality 的争议则可能来自外部事实或时间。建立少量双人复核样本和裁决规则，可以发现 evaluator 在否定、数字与条件范围上的系统性误差。',
    ]),
    keyPoints: Object.freeze([
      'Presence 是有标记，correctness 是引用支持 claim，completeness 是所有需证据主张得到覆盖。',
      'Factuality 还受源版本、有效期、冲突和外部事实影响，不能由引用格式推出。',
      '逐句 claim-to-citation 表应拆分复合主张并记录支持、缺失与反例。',
    ]),
    sourceIds: Object.freeze([
      'res-context-alce',
      'res-context-openai-citations',
      'res-context-ragas',
    ]),
  }),
  Object.freeze({
    id: 'evaluate-with-ragas-and-diagnose-the-full-case',
    title: '贯穿案例：评测并诊断完整证据链',
    paragraphs: Object.freeze([
      'RAGAS 提供把检索上下文与生成回答分开评估的思路，但其指标依赖 evaluator 的模型、提示、输入格式与假设。Evaluator 可能误判否定、数字、领域术语或隐含条件，因此分数不是事实证明。评测记录必须保存 evaluator 标识、版本、提示或配置、输入证据与输出理由，并用人工标注样本校准；模型或提示变化后，前后分数不能默认直接比较。',
      '政策案例从 hybrid candidates 开始：先确认 v2 为当前有效版本；BERT reranker 对 query-passage 候选重排；旧 v1 标记 stale-version；同一条款重叠 chunks 合并并保留 spans；再选择上限、适用范围、例外审批和一个独立说明，在 token 预算内生成 evidence packet。随后生成答案与 citation manifest，并建立 claim-to-citation 表，分别记录 presence、correctness、completeness 和 factuality。',
      '故障演练包含四种情况：正确 v2 未进入候选，必须回到召回而非责怪 reranker；v1 被高分保留，属于版本治理失败；多个重叠 chunk 占满预算，属于去重与多样性失败；答案引用了 v2 但把例外扩大到所有情形，属于 citation correctness 或 factuality 失败。交付物应含 rerank trace、排除清单、evidence packet、唯一 source/version/span manifest、逐条核对表和 evaluator 边界，能够证明每个错误发生在哪一层。',
    ]),
    keyPoints: Object.freeze([
      'RAGAS 指标依赖 evaluator 模型、提示与配置，必须保存版本并用人工样本校准。',
      '贯穿流程从候选、重排、版本、去重、多样性和预算走到 manifest 与逐句核对。',
      '召回、版本、打包与生成错误有不同证据，不能用一个端到端分数掩盖。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '验收不是“答案带链接”',
      body: '验收应证明候选没有首阶段漏失、有效版本被保留、重复未挤占预算、每个 citation 可回到精确 span、每个 claim 获得正确且足够的支持，并记录 evaluator 的限制。',
    }),
    sourceIds: Object.freeze([
      'res-context-bert-reranker',
      'res-context-contextual-retrieval',
      'res-context-alce',
      'res-context-ragas',
      'res-context-ragflow',
      'res-context-openai-citations',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'RRF 已经是 reranker，所以候选融合后无需再考虑 query-passage 交互。',
    correction: 'RRF 是基于既有名次的 rank fusion；BERT reranker 才联合建模 query 与 passage，两者信号、成本和故障边界不同。',
  }),
  Object.freeze({
    claim: 'Reranker 能从整个 corpus 找回首阶段完全漏掉的正确文档。',
    correction: 'Reranker 只能重新排序输入候选；文档未进入候选时必须回到摄取、召回、过滤或候选深度阶段诊断。',
  }),
  Object.freeze({
    claim: '文本相似的 chunk 都应删除，只保留 reranker 分数最高的一条。',
    correction: '需先区分旧版本、重叠 span、互补相邻内容和独立来源；机械删除可能丢失例外条件、冲突或独立佐证。',
  }),
  Object.freeze({
    claim: '答案只要存在引用标记，就已经证明每个主张正确而且证据完整。',
    correction: 'Presence、correctness、completeness 与 factuality 是不同维度；链接可能错挂、漏引、引用旧版或支持范围小于答案主张。',
  }),
  Object.freeze({
    claim: 'RAGAS 给出高分就可以取消人工 claim-to-source 核验。',
    correction: 'RAGAS 依赖 evaluator 模型、提示和假设，可能误判领域内容；需保存配置、用人工样本校准并保留逐句核对。',
  }),
  Object.freeze({
    claim: '多样性就是平均选择不同文档，相关性和必需 claim 覆盖可以放在其次。',
    correction: '多样性服务互补方面、独立来源和冲突可见性；必须先保证关键 claim 的直接有效证据，再利用剩余预算扩展覆盖。',
  }),
]);

export const context06Note = Object.freeze({
  readingMinutes: 44,
  introduction: '上一课交付的是高召回、可回放的候选列表，本章把它转换成真正可交给生成模型的 evidence packet。你将先把 RRF rank fusion 与 BERT query-passage reranker 明确分开，再按 document、version 与 source span 处理旧版、重复和相邻互补片段；随后在 token 预算内选择覆盖不同 claim、独立来源和冲突观点的证据，并生成唯一的 citation manifest。最后用政策助理案例逐句区分 citation presence、correctness、completeness 与 factuality，说明为什么“有引用”仍可能答错，以及为什么 RAGAS 分数受 evaluator 模型、提示和版本约束，不能取代人工 claim-to-source 核验。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '首阶段 top-k 只是高召回候选，进入 Prompt 前还要重排、版本处理、去重、多样性和预算打包。',
    'RRF 是按既有名次融合列表的 rank fusion；BERT reranker 联合建模 query 与 passage 后重新评分。',
    'Reranker 不能找回首阶段完全漏掉的文档，候选深度还要权衡召回、延迟和成本。',
    '去重要区分旧版本、完全重复、重叠 span、互补相邻内容和独立来源近似证据。',
    '多样性优先保证必需 claim，再利用剩余预算覆盖互补方面、独立来源和冲突。',
    'Evidence packet 保存文本、source、version、span、分数、成本与选择理由，citation manifest 建立唯一回源映射。',
    'Citation presence、correctness、completeness 与 factuality 必须分开检查，有链接不等于主张被支持。',
    'RAGAS 依赖 evaluator 模型、提示和配置，需保存版本、人工校准并保留逐句 claim-to-source 表。',
  ]),
  nextStep: '下一课会把注意力从外部 corpus 转到跨会话长期记忆。请保留本章的版本选择、provenance、有效期、排除原因和精确 span 思维：长期记忆同样不能把所有历史自动写入并无条件召回，而要有 subject、scope、admission、confidence、TTL、supersession 与删除规则。RAG 证据包回答“本轮从外部知识选了什么”，memory projection 则回答“哪些主体相关记录经治理后进入本轮”，二者会在最终综合架构中汇合但不能混成同一存储。发生冲突时也必须保留两条投影各自的来源、时间、决胜理由与验收证据，且可复查。',
});
