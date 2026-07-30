const sections = Object.freeze([
  Object.freeze({
    id: 'start-with-complementary-retrieval-signals',
    title: '先把 sparse 与 dense 看成互补信号',
    paragraphs: Object.freeze([
      '上一课已经把有效源版本切成可回源的 retrieval units，本课要回答“查询怎样找到候选”。Sparse retrieval（稀疏检索）主要依据查询与文档中的词项匹配，适合产品编号、法规条款号、专有名词和原词可见的场景；dense retrieval（稠密检索）把查询与段落编码成向量，利用表示空间中的相近关系寻找语义相关内容。两者观察的是不同信号，因此选择题不是“哪一个永远更强”，而是“当前查询和语料需要保留哪些互补证据”。',
      'DPR 的双编码器研究说明了稠密段落召回如何训练与评测，但它的开放域问答数据、负样本与模型设置限制了结论；BEIR 在异构数据集上比较多种检索方法，恰好提醒我们跨任务排名会变化。因而 dense 不一定优于 sparse，sparse 也不等于落后方案。编号查询若被向量表示模糊化，词法信号可能更可靠；同义改写或自然语言描述若与文档措辞差异很大，dense 可能补回 sparse 漏掉的候选。',
      'Hybrid retrieval（混合检索）不是把两个分数随手相加，而是保留多路候选后按明确规则融合。它适合真实查询同时包含精确实体与语义描述的情况，例如“型号 ZX-17 的节能模式为什么在夜间关闭”。ZX-17 需要词法命中，后半句可能需要语义匹配。工程后果是 trace 必须保留每一路候选、原始名次、融合结果和排除原因，否则最终列表无法说明某个文档究竟由哪种信号找回。',
      'Dense 路径通常依赖 approximate nearest neighbor（ANN，近似最近邻）索引，用减少精确比较换取更低延迟和更高吞吐；索引类型、搜索深度与参数会同时改变 recall、latency、内存和更新成本。向量数据库只承载表示、ANN、过滤与运维中的一部分，不等于完整 RAG：采集、版本、ACL、融合、重排、证据打包、生成和评测仍在其外部。方法选择必须记录质量、尾延迟与故障回退。',
    ]),
    keyPoints: Object.freeze([
      'Sparse 擅长精确词项，dense 擅长语义近似，两者优势由查询和语料决定。',
      'DPR 与 BEIR 的结论绑定实验设置，不能支持 dense 在所有领域都优于 sparse。',
      'Hybrid 要保留多路候选与融合 trace，而不是只输出一个无法解释的最终分数。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '像同时查字面索引与主题索引',
      body: '词法检索像按书名、编号和原词查目录，稠密检索像按主题意思找相近段落；混合检索让两张索引都发言，再由明确规则合并。',
    }),
    sourceIds: Object.freeze([
      'res-context-dpr',
      'res-context-beir',
      'res-context-contextual-retrieval',
      'res-context-primary-javaguide-vector-store',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
  Object.freeze({
    id: 'evaluate-methods-on-real-query-slices',
    title: '用真实查询切片决定方法',
    paragraphs: Object.freeze([
      '方法选择要从查询切片开始，而不是从供应商默认值开始。可以把评测查询按精确编号、罕见实体、同义改写、缩写、多语言、复合问题和时间限定分组，并为每个查询标出可接受的源版本与相关片段。对 sparse、dense 和 hybrid 分别记录候选召回、合法过滤后的命中、重复率、延迟和后续 token 成本。只有同一 corpus、同一查询集和同一判定标准下的比较，才说明某种方法在该业务切片中的表现。',
      '公开 benchmark 提供的是评测思路和受限结果，不是生产排行榜。BEIR 的异构任务能支持“跨领域表现会变化”，却不能代替企业内部缩写、权限、语言和时效约束；Anthropic 的 contextual retrieval 文章展示 BM25、embedding、混合检索与 reranking 的组合，也明确要求在自身用例中评估。文中任何改善数字都绑定其语料、模型和指标，本课不把它复制成你系统的预期收益。',
      '若 hybrid 在总体指标上更好，也要检查分组退化。例如融合可能提升同义改写的召回，却让精确编号在有限 top-k 中被语义相似内容挤出；多语言 embedding 可能改善一组查询，却在某个部门术语上失真。发布决策应写清获益切片、退化切片、成本与回退条件，而不是只报一个平均分。这样面试中“怎么选”才能回答为可验证决策，而非技术偏好。',
      '相关性标注也要可审查。每个查询应列出必须命中的有效 source spans、可接受的辅助片段、明确不相关项和权限不可见项；标注者分歧需要记录并复核。否则所谓 recall 可能把旧版或越权文档算作正确命中，precision 也可能把互补证据错判为噪声。评测集本身应版本化，新增查询不能与旧报告无标记混算。',
    ]),
    keyPoints: Object.freeze([
      '评测集要覆盖编号、实体、改写、缩写、多语言、复合问题和时间条件。',
      '公开论文与厂商数字只属于其报告设置，生产选择必须在目标 corpus 和查询上复验。',
      '总体指标之外还要检查查询切片退化、延迟与上下文成本。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-05-ann-tradeoff', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-beir',
      'res-context-dpr',
      'res-context-contextual-retrieval',
      'res-context-all-in-rag',
      'res-context-primary-javaguide-vector-store',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
  Object.freeze({
    id: 'fuse-ranks-without-mixing-score-scales',
    title: '用 RRF 融合名次而非混淆分数尺度',
    paragraphs: Object.freeze([
      'Sparse 分数与 dense 相似度通常不在同一尺度：一个可能受词频、文档长度与查询词影响，另一个来自向量距离或相似度。未经校准就直接相加，会让数值范围较大的一路主导结果。Reciprocal Rank Fusion（RRF，倒数名次融合）绕开原始分数尺度，按每个候选在各排序列表中的名次累积贡献。其形式可写为 RRF(d)=Σᵢ 1/(k+rankᵢ(d))，其中 rankᵢ(d) 是文档 d 在第 i 路列表中的名次，k 是实验配置中的平滑常量。',
      '公式的工程含义是：多路都排在前面的候选会累积较高融合分，只在一路靠前的候选仍能保留贡献；没有进入某一路候选列表的文档，不会凭融合被创造出来。k、每路候选深度、是否加权以及并列名次处理都应写进实验配置。任何具体 k 或 top-k 数字只能描述一次可复现实验，不能被写成 RRF 论文对所有语料的最佳推荐。',
      'RRF 是 rank fusion，不是 reranker。它利用既有名次合并多路列表，不读取 query 与 passage 的完整交互，也不会像下一课的 BERT reranker 那样对候选重新建模评分。若首阶段两路都漏掉正确文档，RRF 无法修复；若正确文档已进入候选但融合后靠后，可以检查各路深度、名次和 k。把两种机制分清，才能判断故障发生在召回、融合还是后续重排。',
      '若选择分数加权而非 RRF，就必须先在固定查询集上做 score calibration，证明 BM25、向量相似度和其他信号映射后的含义可比较；语料或 embedding 变化后还要重校。融合 trace 最好保留每个候选的来源列表、rank、校准版本、平滑参数和最终排序，才能区分 sparse 深度不足、dense 噪声与融合偏置。',
    ]),
    keyPoints: Object.freeze([
      '不同检索器的原始分数尺度不可默认直接相加，RRF 通过名次贡献规避这一假设。',
      'RRF 参数和候选深度属于实验配置，所有数字都必须绑定具体查询集和结果。',
      'RRF 是 rank fusion 而不是 reranker，不能恢复所有首阶段都漏掉的文档。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-05-rrf-fusion', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-rrf',
      'res-context-dpr',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
  Object.freeze({
    id: 'order-filter-threshold-and-top-k-explicitly',
    title: '明确 filter、threshold 与 top-k 的顺序',
    paragraphs: Object.freeze([
      'Metadata filter（元数据过滤）先规定哪些候选有资格参与检索，例如 subject 的权限、有效版本、语言、部门与时间范围；threshold（相关性阈值）再拒绝低于某种匹配标准的结果；top-k 则限制送入下一阶段的候选数量。三者解决的问题不同：filter 是合法候选域，threshold 是最低相关性门槛，top-k 是数量与成本边界。OpenAI retrieval 文档能支撑当前 vector store 的搜索、排序选项和属性过滤接口，但不能被外推成所有后端的执行顺序或最佳参数。',
      '顺序会改变结果语义。若先取很小的 top-k 再做权限过滤，前排候选一旦被删掉，合法但稍后的位置可能永远没有机会进入；若 threshold 应用于未经校准的 sparse 与 dense 原始分数，同一个数值不具有相同含义；若版本过滤遗漏，旧版高相关内容会占据候选。课程建议在进入排序前强制权限和有效版本边界，再在每路检索及融合后记录相应阈值与数量限制，但具体实现仍要按后端能力验证。',
      '无结果时不能只提高 top-k。先检查过滤前候选数、各 filter 命中与拒绝原因、分数或名次分布、threshold 通过数和 top-k 截断位置。若正确文档在过滤前存在而因权限被拒绝，提高 top-k 是越权风险；若它低于阈值，扩大 k 仍无效；若它排在 k 之后，才说明候选深度值得实验。可观测顺序把“没有答案”拆成可修复的具体阶段。',
      'Threshold 也需要按阶段和方法校准。Sparse 分数、向量相似度与融合分没有天然共同单位，不能复制同一个阈值；语料更新或 embedding 更换后，分布还可能漂移。实验应保存通过率、正确候选附近的分布和空结果比例，并把阈值版本写进 trace。若改阈值，只能报告该评测集上的质量与成本变化，而不是宣称得到通用相关性界线。',
    ]),
    keyPoints: Object.freeze([
      'Filter 定义合法域，threshold 定义最低相关性，top-k 定义候选数量与成本。',
      '先截断再过滤可能丢失合法候选，跨检索器共用同一原始分数阈值也可能语义错误。',
      '无结果时沿过滤前候选、拒绝原因、阈值和截断位置诊断，不能盲目扩大 top-k。',
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-retrieval',
      'res-context-contextual-retrieval',
      'res-context-primary-javaguide-vector-store',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
  Object.freeze({
    id: 'rewrite-queries-with-an-auditable-contract',
    title: '把 query rewrite 变成可审计变换',
    paragraphs: Object.freeze([
      'Query rewrite（查询改写）是在检索前对用户输入做受控变换，可补全领域缩写、生成同义表达、把复合问题拆成子查询或添加已经明确的会话约束。它的价值是缩小用户措辞与 corpus 措辞的距离；风险是引入用户没有表达的假设、改变时间或否定条件、泄露敏感上下文，甚至让检索围绕模型臆测而不是原问题。改写因此不是“自动优化”，而是一个需要输入、输出、策略版本与失败状态的管线阶段。',
      '每次检索至少保留 originalQuery、rewriteId、rewrittenQuery、使用的显式上下文、生成原因和各版本候选。对于“ZX-17 夜间模式为什么关闭”，安全改写可以展开经词典确认的产品别名；若系统擅自加上“因为节能法规”，就已经添加未验证因果。高风险领域可使用规则模板、允许字段或用户确认，且原查询始终作为对照路径。Hugging Face 的 Agentic RAG 页面只支撑 agent 可决定是否调用检索工具，不足以证明任意自主改写策略安全。',
      '评估 rewrite 要同时看召回与精度。若改写后正确文档进入候选，但无关文档大量增加并挤占后续预算，不能只说召回提升；若原查询有精确编号，改写删除编号，即使语义更顺畅也可能损害最可靠信号。实验报告应逐查询列出原始与改写候选差异、最终命中、误召类型和是否改变用户意图，并为失败提供回退到原查询或合并两路候选的策略。',
      '复合问题拆分还要维护合并语义。两个子查询分别命中“住宿上限”和“例外审批”时，最终候选必须保留它们来自同一问题的关系；若一个子查询无结果，系统不能只回答另一半却假装完整。Trace 应记录 parentQuery、subQuery、每路状态和合并规则，使遗漏、冲突或重复能被定位到具体分支。',
    ]),
    keyPoints: Object.freeze([
      'Query rewrite 可补全与拆分，也可能加入假设、改变条件或泄露不必要上下文。',
      '原查询、改写查询、策略版本和两路候选必须保留，以便比较与回放。',
      '评估需同时观察召回、精度、意图保持和预算，不能只看正确文档是否出现。',
    ]),
    sourceIds: Object.freeze([
      'res-context-contextual-retrieval',
      'res-context-hf-agentic-rag',
      'res-context-openai-retrieval',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
  Object.freeze({
    id: 'run-a-hybrid-retrieval-trace',
    title: '贯穿案例：运行并诊断混合检索',
    paragraphs: Object.freeze([
      '贯穿实验使用上一课的版本化政策 corpus，查询集包含精确条款号、产品编号、同义改写、跨语言描述和复合问题。先固定一轮实验配置：合法版本、部门与语言 filter；sparse 与 dense 各自候选深度；RRF 的 k；融合后 threshold 与 top-k；是否启用 rewrite。这里出现的每个数字都必须写在实验 manifest 中，只能解释该语料、查询集和配置的结果，不得升级为生产默认或来源建议。',
      '对每个查询输出可回放 trace：original 与 rewritten query；filter 前文档范围和被拒绝数量；sparse 候选及词法分数；dense 候选及相似度；每路 rank；RRF 分项与融合名次；threshold 拒绝项；top-k 截断项。然后给结果标注四类原因：source 中不存在答案；答案存在但未被任何召回器找到；候选被权限、版本、语言或时间 filter 移除；候选存在但排序在截断线之后。四类故障需要不同修复，不能都归因于“向量库不好”。',
      '案例诊断一条“旧版政策为何仍出现”：先证实新版 source 存在，再查看旧版是否在合法候选域；若版本 filter 漏配，属于被治理边界放行，不是排序问题。另一条编号查询正确文档只在 sparse 前排而 dense 漏掉，hybrid 仍可通过 RRF 保留；若融合后被截断，则调候选深度或 k 进行新实验。最终交付包括 trace、方法选择说明、各查询切片结果和参数边界，足以回答三道访谈题并完成现有 hybrid-retrieval 练习。',
    ]),
    keyPoints: Object.freeze([
      '实验 manifest 绑定所有参数与数字，结果只能解释该 corpus、查询集和配置。',
      'Trace 必须保留原查询、改写、filter、两路候选、RRF 分项、阈值与截断。',
      '诊断区分不存在、未召回、被过滤和排序靠后四类原因，并为每类选择不同修复。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '四类失败不能共用一个按钮',
      body: '不存在要补语料，未召回要改召回器或切分，被过滤要核对治理规则，排序靠后才考虑融合、候选深度或后续重排。',
    }),
    sourceIds: Object.freeze([
      'res-context-dpr',
      'res-context-rrf',
      'res-context-contextual-retrieval',
      'res-context-openai-retrieval',
      'res-context-beir',
      'res-context-rag-scratch',
      'res-context-all-in-rag',
      'res-context-hf-agentic-rag',
      'res-context-primary-javaguide-vector-store',
      'res-context-primary-javaguide-rag-optimization',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Dense retrieval 理解语义，所以在所有查询和领域都一定优于 sparse retrieval。',
    correction: 'DPR 与 BEIR 的结果受任务和数据限制；精确编号、罕见实体和领域漂移都可能让 sparse 保留关键优势，必须按真实查询切片评测。',
  }),
  Object.freeze({
    claim: 'Sparse 与 dense 的原始分数都表示相关性，可以不校准就直接相加。',
    correction: '两路分数尺度与生成机制不同，直接相加可能被某一路数值范围支配；可使用明确校准或 RRF 等基于名次的融合。',
  }),
  Object.freeze({
    claim: 'RRF 是一种强 reranker，会读取 query 与 passage 并修复首阶段所有漏召。',
    correction: 'RRF 是 rank fusion，只根据已有列表名次累积贡献；所有召回器都漏掉的文档不会被融合创造，query-passage 重排属于下一阶段。',
  }),
  Object.freeze({
    claim: '无结果时只要不断增大 top-k，正确答案最终一定会出现。',
    correction: '答案可能不在 source、未被召回、被合法 filter 删除或低于 threshold；只有候选存在且排在截断线后时，扩大深度才可能有效。',
  }),
  Object.freeze({
    claim: 'Query rewrite 一定比原查询准确，可以只保存改写后的文本和候选。',
    correction: '改写可能加入假设、删除精确实体或改变否定与时间条件；必须保留原查询、策略版本和两路候选，评估意图保持、召回与精度。',
  }),
]);

export const context05Note = Object.freeze({
  readingMinutes: 42,
  overviewVisualId: 'visual-context-05-hybrid-signals',
  overviewVisualSectionId: 'start-with-complementary-retrieval-signals',
  introduction: '上一课交付了版本正确、权限清楚且可回源的 chunks，本章把它们送入候选生成管线。你将先比较 sparse 的精确词项信号与 dense 的语义表示信号，再用 hybrid retrieval 保留互补候选；随后理解 RRF 公式为何按名次融合、为何不能把不同检索器的原始分数随手相加，以及它为什么不是 reranker。工程部分把 metadata filter、threshold、top-k 与 query rewrite 放进可回放 trace，并用政策查询实验严格区分四类失败：source 不存在、答案未召回、候选被过滤、候选只是在排序中靠后。所有参数和数字只属于明确实验，不会被写成跨语料最佳值。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Sparse 保留精确词项信号，dense 提供语义近似信号，优劣取决于查询切片与目标语料。',
    'DPR、BEIR 与厂商文章中的结果受实验限定，生产选择必须在真实 corpus 和查询集上复验。',
    'Hybrid retrieval 合并互补候选，必须保留每一路候选、名次、融合贡献和排除原因。',
    'RRF 公式按倒数名次累积贡献，规避直接混合不同原始分数尺度；它是 rank fusion，不是 reranker。',
    'Metadata filter 定义合法候选域，threshold 定义最低匹配，top-k 控制进入后续阶段的数量。',
    'Query rewrite 是可审计变换，需保留原查询、改写、策略版本和候选差异，并同时评估召回与精度。',
    '检索失败要区分 source 不存在、未召回、被过滤和排序靠后，四类原因对应不同修复。',
  ]),
  nextStep: '下一课将接收本章的高召回候选，而不是把 top-k 直接塞进 Prompt。我们会比较 RRF 名次融合与 BERT query-passage reranker 的机制边界，再处理旧版本、重叠 span、来源多样性和 token 预算，最终生成可逐条回源的 evidence packet 与 citation manifest。请保留本章的候选来源、每路名次、过滤原因和融合 trace，因为 reranker 只能调整已经进入候选集的文档，无法修复 source 不存在或首阶段完全漏召。进入下一阶段前还要冻结本轮实验 manifest，避免召回配置变化被误判为 reranker 的效果。',
});
