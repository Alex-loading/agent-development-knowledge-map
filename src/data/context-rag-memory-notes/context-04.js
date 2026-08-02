const sections = Object.freeze([
  Object.freeze({
    id: 'separate-source-retrieval-and-citation-units',
    title: '先分开源文档、检索单元与引用单元',
    paragraphs: Object.freeze([
      '上一课把 transcript、canonical state 与摘要分开，是为了避免有损表示冒充原始证据；进入 RAG 后也要做同样的对象分离。Source document（源文档）是治理、版本与权限的载体，例如一份完整员工手册；retrieval unit（检索单元）是搜索系统返回候选的粒度，通常是 chunk；citation unit（引用单元）则是能精确支持答案中某条主张的原文范围。三者可以一对多，却不能因为都存进同一个向量库就被视为同一对象。',
      '摄取管线必须逐阶段留下身份：acquire 取得原件与访问范围，parse 提取文本和结构，normalize 统一编码但保留变换记录，chunk 生成检索单元，metadata 绑定版本、ACL 和 span，embed 产生表示，index 建立可搜索派生结构。JavaGuide 的 RAG 基础与文档处理文章给出这条主干，原始 RAG 与 DPR 论文核验检索进入生成的研究边界；任何阶段失败都不能由下游向量库自动补救。',
      '一个向量记录若同时冒充三种单元，会造成两类典型错误。第一，更新整份手册时无法判断哪些旧 chunk 应失效；第二，答案只引用一个很大的 chunk，读者仍不知道其中哪一句支持主张。正确做法是让 retrieval unit 保留到 source document 的稳定映射，再让 citation unit 指向更精确的页码、段落、字符或结构路径。这样召回粒度可以为搜索优化，引用粒度仍能为审计优化。',
      '对象分离还决定测试方式。Source document 测版本、所有者和权限是否正确；retrieval unit 测查询能否召回及候选是否重复；citation unit 测给定 claim 能否落到精确原文。若把三类测试压成“向量库返回结果”，即使端到端回答偶然正确，也无法发现是源版本错误、切分丢义还是引用范围过宽。',
    ]),
    keyPoints: Object.freeze([
      '源文档负责版本与治理，检索单元负责召回，引用单元负责精确支持主张。',
      '三种单元可以一对多，但必须通过稳定 ID、版本与 span 建立可回溯映射。',
      '本课 schema 是工程练习合同，不是 RAG 或 DPR 论文规定的跨系统标准。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '书、索引卡与引文不是同一件物品',
      body: '源文档像一本受版本管理的书，retrieval unit 像用于找书中主题的索引卡，citation unit 像答案脚注指向的确切段落；索引卡有用，但不能替代原书或精确引文。',
    }),
    sourceIds: Object.freeze([
      'res-context-rag-paper',
      'res-context-dpr',
      'res-context-openai-embeddings',
      'res-context-primary-javaguide-rag',
      'res-context-primary-javaguide-document-processing',
    ]),
  }),
  Object.freeze({
    id: 'chunk-by-structure-and-answer-needs',
    title: '按结构与回答需要设计切分',
    paragraphs: Object.freeze([
      'Chunking（切分）要解决的是“一个候选包含多少足以判断相关性的语义”。过小的片段可能只留下代词、结论或表格单元而丢掉标题与条件；过大的片段则把多个主题混在一起，降低定位精度并占用更多上下文预算。适度 overlap 可以保留跨边界语义，但重叠过多会产生近重复候选，使同一来源反复占据 top-k。因而 chunk 大小、边界和 overlap 是相互制约的实验变量，不是越大或越多越安全。',
      '四类常见策略回答不同问题。Fixed chunk 按字符或 token 提供可复现实验基线；structural chunk 沿标题、FAQ、表格或代码边界切分；semantic chunk 依据语义转折选择边界，但结果依赖模型与阈值；parent-child chunk 用小子块召回、再恢复含标题和上下文的父块。没有一种策略普遍最优，选择必须同时比较召回、重复、引用定位、父块恢复成本与目标问题。',
      '固定字符数或固定 token 数只应作为可复现实验的基线。例如在同一份评测集上建立“固定长度、无结构”和“结构感知、有限 overlap”两套索引，比较召回、重复率、引用定位和上下文成本；这里的任何具体 chunk_size 都只是该轮实验配置，不是来自来源的普适推荐。若结构切分反而漏掉跨段定义，应调整父标题继承、相邻窗口或父子单元映射，而不是把所有文档永久改成一个更大的固定值。',
      '切分失败要回到具体边界诊断：FAQ 命中问题却丢失答案，说明问答对被拆开；表格返回数字却没有单位，说明表头继承失败；代码只返回调用处而没有函数定义，说明 retrieval unit 与任务所需语义不匹配；政策引用遗漏例外，说明条款与限制条件被切断。不同症状需要不同结构修复，不能统一用更大 overlap 掩盖。',
    ]),
    keyPoints: Object.freeze([
      '切分依据回答所需语义和文档结构，大小与 overlap 必须在真实查询上评测。',
      'FAQ、政策、表格和代码需要不同边界，且都要保存解释片段所需的标题或结构上下文。',
      '固定 chunk 大小只能充当受控实验设置，不能写成跨语料最佳实践。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-04-chunk-strategies', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-rag-scratch',
      'res-context-llm-universe',
      'res-context-dpr',
      'res-context-primary-javaguide-document-processing',
    ]),
  }),
  Object.freeze({
    id: 'treat-embeddings-and-indexes-as-derived-artifacts',
    title: '把 embedding 与 index 当作可重建派生物',
    paragraphs: Object.freeze([
      'Embedding（向量表示）把文本映射为数值向量，使语义相近的查询与片段可以通过相似度被找到；index（索引）则组织这些表示或词项，以便高效搜索。二者都不是 corpus 本身：corpus 保存源文档、治理事实与有效版本，embedding 和 index 是由某个解析器、切分配置、模型与参数生成的派生物。OpenAI embedding 与 retrieval 文档能说明其当前产品里的表示、vector store、搜索和属性过滤接口，但接口语义不能外推为所有向量库的标准。',
      '索引记录至少应能回答“由什么生成”。本课练习建议记录 source document 版本、chunker 配置版本、embedding 模型标识、向量维度或兼容性标识、索引构建批次和创建时间；这些字段是为重建与诊断设计的课程合同。仅保存向量而丢弃源版本，更新后就无法判断旧向量是否仍有效；仅保存源文档而不记录构建配置，则难以复现同一候选集合或比较两次索引差异。',
      '更换 embedding 模型、切分规则或过滤字段时，应把它视作创建新派生版本，而不是在原索引中无标记混写。迁移可以先构建新索引并用固定查询集对照，再切换默认读路径；如果新构建失败，旧索引仍只能服务其明确有效的源版本，不能把已经撤权或失效的内容继续返回。这里强调的是“源是权威、索引可重建”的工程原则，不声称任何具体厂商都自动实现了完整迁移协议。',
      '为每次构建保存 manifest 还能区分“内容变化”和“表示变化”。同一 source version 在不同 embedding 或 chunker 下产生不同候选，不应被误判为源文档被修改；同一索引配置处理了新 source version，也必须能定位新增、替换和失效单元。回归查询应同时记录构建 manifest 与候选 IDs，使排名差异可以追到明确输入。',
    ]),
    keyPoints: Object.freeze([
      'Embedding 是文本表示，index 是搜索加速结构，二者都不是源文档事实载体。',
      '索引应记录源版本、切分配置、表示模型和构建批次，以便重建与差异诊断。',
      '表示或切分规则变化应产生可区分的新派生版本，不能无标记混写。',
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-embeddings',
      'res-context-openai-retrieval',
      'res-context-dpr',
      'res-context-primary-javaguide-rag',
      'res-context-primary-javaguide-document-processing',
    ]),
  }),
  Object.freeze({
    id: 'propagate-version-permission-and-validity',
    title: '让版本、权限与有效期随 chunk 传播',
    paragraphs: Object.freeze([
      '可检索不等于当前可用。企业政策可能已有新版，部门手册可能只允许特定群组读取，促销规则可能只在一段时间内有效；若这些约束只留在源系统而没有进入检索路径，相关性排序会把陈旧或越权内容当作好候选。本课要求 chunk 继承 documentId、version、permission scope、validFrom、validTo、language 与状态，并在查询阶段先形成合法候选域。OpenAI retrieval 文档中的属性过滤可作为产品接口参照，但不能证明所有后端都采用相同语法或强制顺序。',
      '发布新版时，要把“新内容可检索”和“旧内容停止默认召回”视为同一个变更的两面。稳健流程先登记新 source version，生成并验证对应 chunks 与索引，再切换有效指针；随后让旧版从默认候选域退出，同时按审计政策保留可回溯记录。若只更新正文数据库而旧向量仍在服务索引中，系统可能同时返回互相冲突的版本；若先删除旧索引而新构建失败，则可能出现知识空窗。',
      '权限撤销和删除也需要传播到缓存、派生索引与服务层，不能只修改展示页面。验证方法不是看管理后台是否显示“已删除”，而是用原先可命中的查询，从不同 subject 与 scope 发起检索，确认被撤权 chunk 不再进入候选，并检查 trace 中记录了过滤原因。物理备份如何清理属于更广的数据治理问题；本课只要求默认检索与引用路径不再暴露失效或越权版本。',
    ]),
    keyPoints: Object.freeze([
      '版本、权限、语言、有效期和状态必须进入检索约束，而不能只存在源系统。',
      '新版发布要协调新索引就绪与旧版退出，避免混答或知识空窗。',
      '撤权和失效需通过不同主体的实际检索与 trace 验证，不能只看控制台状态。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-04-version-acl-delete', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-retrieval',
      'res-context-rag-paper',
      'res-context-primary-javaguide-document-processing',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'preserve-source-spans-through-transformations',
    title: '在每次变换后保住 source span',
    paragraphs: Object.freeze([
      'Source span 是片段在源文档中的可定位范围，可以用页码、段落 ID、字符区间、表格坐标或代码行区间表达。它的目的不是给 chunk 增加装饰字段，而是让系统能从答案反向检查：该候选来自哪一版文档的哪一处，展示的文字是否经过清洗，引用范围是否真的支持主张。若 OCR、HTML 清洗或表格展开改变了文本，仅保存处理后字符串会失去与原件的稳定联系。',
      '摄取管线可同时保存 raw source reference、normalized text span 与 transformation record。切分后每个 retrieval unit 指向一个或多个 source spans；若相邻 chunk 在后续阶段合并，新的候选保留组成 span 的有序集合，而不是伪造一个跨越无关内容的大范围。citation unit 可以从 retrieval unit 中进一步收窄，但不得指向候选之外的来源。该映射是本课为了完成引用回源练习提出的工程约束，原始 RAG 与 DPR 论文并未规定这一数据模型。',
      'Span 验证应进入摄取测试。对 FAQ 检查问题和答案是否仍成对；对表格检查表头、单位与目标单元格能否共同定位；对代码检查文件、符号和行区间是否对应同一 source version；对政策检查条款、例外与上级标题能否回到原文。任何无法回源的 chunk 即使相似度很高，也只能作为待修复候选，不能承担精确引用。',
    ]),
    keyPoints: Object.freeze([
      'Source span 必须跨清洗、切分、合并与引用收窄保留稳定映射。',
      '相邻片段合并时保留组成 spans，不能用一个虚假连续范围掩盖中间内容。',
      '无法回源的高相似候选不能承担 citation unit，需回到摄取管线修复。',
    ]),
    sourceIds: Object.freeze([
      'res-context-rag-paper',
      'res-context-openai-retrieval',
      'res-context-primary-javaguide-document-processing',
    ]),
  }),
  Object.freeze({
    id: 'build-and-diagnose-a-versioned-corpus',
    title: '贯穿案例：为三类文档建立可回源 corpus',
    paragraphs: Object.freeze([
      '练习场景包含 FAQ、产品手册和公司制度。先建立 source document 表：每项拥有稳定 documentId、version、owner、permission scope、language、validFrom、validTo、status 与原件引用。FAQ 以问答对为主单元；手册沿章节、步骤和警告切分，并继承产品型号与标题；制度按章、条、款及例外条件切分。每个 chunk 保存 chunkId、source version、结构路径、source spans、切分配置版本和文本摘要哈希，retrieval unit 与更细 citation unit 通过 span 映射连接。',
      '然后建立两组实验索引：结构感知方案与固定大小基线。使用同一批覆盖原词、改写、表格字段和跨段条件的查询，记录命中 chunk、源版本、重复候选、引用范围与 token 成本。固定大小只是这一轮对照配置；若它在某类查询上表现更好，也只能说明该查询集与配置下的结果。选择方案时同时检查语义完整、召回粒度、引用精度和成本，而不是只比较一个相似度。',
      '最后演练版本与权限故障：发布制度 v2 后故意让一个 v1 chunk 留在索引，撤销某部门权限却保留缓存，再制造一次新索引构建失败。诊断顺序是 source 状态、chunk 继承字段、派生版本、过滤 trace、候选 sourceRef 与 span。交付的 chunk schema 应让每个索引单元回到有效源版本；版本失效流程应说明何时启用新索引、何时退出旧版、如何验证撤权，以及失败时如何阻止新旧混答。',
    ]),
    keyPoints: Object.freeze([
      '贯穿案例用 FAQ、手册与制度验证结构边界、元数据继承和 retrieval/citation 映射。',
      '结构感知与固定大小方案必须在同一查询集上比较，结论只属于该实验。',
      '版本、权限或索引构建失败要沿 source、chunk、index、filter 与 span 逐层诊断。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '交付物检查顺序',
      body: '先审 source document 治理字段，再审 chunk 结构和 span，然后审 embedding/index 构建版本，最后用查询验证有效版本、权限过滤和精确引用。',
    }),
    sourceIds: Object.freeze([
      'res-context-openai-embeddings',
      'res-context-openai-retrieval',
      'res-context-dpr',
      'res-context-rag-paper',
      'res-context-rag-scratch',
      'res-context-llm-universe',
      'res-context-primary-javaguide-rag',
      'res-context-primary-javaguide-document-processing',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '向量索引就是 corpus，索引中存在的文本可以替代源文档与版本记录。',
    correction: '索引是由源文档、切分配置和表示模型产生的可重建派生物；治理、权限、有效期和精确回源仍依赖 source document。',
  }),
  Object.freeze({
    claim: '所有文档使用同一个固定 chunk_size，就能得到稳定且最优的检索效果。',
    correction: '固定大小只能作为受控实验基线；FAQ、表格、代码和政策的结构不同，必须在真实查询上比较语义完整、重复、引用与成本。',
  }),
  Object.freeze({
    claim: 'Overlap 越大越不会丢上下文，因此无需考虑重复候选和预算。',
    correction: 'Overlap 会保留跨边界信息，也会制造近重复 chunk；过多重复会挤占 top-k 和上下文预算，需通过评测选择。',
  }),
  Object.freeze({
    claim: '检索 chunk 与 citation unit 必须完全相同，否则引用就不可信。',
    correction: '两者可以采用不同粒度，只要 citation unit 能稳定映射到检索候选及源版本，并精确指向支持主张的 span。',
  }),
  Object.freeze({
    claim: '发布新版本时只更新正文数据库即可，旧向量是否仍可召回并不重要。',
    correction: '旧派生索引会继续返回陈旧内容；新版本发布必须协调 chunk、索引、缓存和默认有效指针，并用查询验证旧版已退出。',
  }),
]);

export const context04Note = Object.freeze({
  readingMinutes: 41,
  overviewVisualId: 'visual-context-04-ingestion-pipeline',
  overviewVisualSectionId: 'separate-source-retrieval-and-citation-units',
  introduction: '前三课已经说明模型本轮看到的是经过选择的上下文投影，而不是后台全部状态。本章把这条原则延伸到 RAG 摄取端：从一份受版本、权限和有效期治理的 source document 出发，区分用于搜索的 retrieval unit 与用于证明主张的 citation unit；再把结构切分、embedding 和 index 放回它们应有的位置。你将用 FAQ、产品手册和制度文档完成一套 chunk schema，比较结构感知与固定大小实验，保留 document、version、permission、validity 和 source span，并演练索引更新失败、旧版残留和权限撤销。目标不是记住一个 chunk_size，而是能解释每个检索单元怎样生成、为何有效、谁能看到，以及如何回到原文。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Source document 是治理与版本载体，retrieval unit 是召回粒度，citation unit 是精确支持主张的原文范围。',
    'Chunking 要按回答所需语义和文档结构设计，大小与 overlap 是需要在真实查询上评测的变量。',
    '固定字符或 token 大小只能作为可复现实验基线，不能外推成跨语料最佳配置。',
    'Embedding 是表示，index 是搜索派生结构；二者都不能替代 corpus、源版本和权限事实。',
    'Chunk 必须继承版本、权限、语言、有效期和状态，过滤后才形成合法候选域。',
    'Source span 要穿过清洗、切分、合并和引用收窄，无法回源的 chunk 不能承担精确引用。',
    '新版发布、撤权和删除要传播到索引与缓存，并以实际查询和 trace 验证旧内容不再默认召回。',
  ]),
  nextStep: '下一课将从已经治理好的 corpus 与 chunk 出发，比较 sparse、dense 和 hybrid retrieval 如何产生候选。请保留本章的 document/version/span、权限和有效期字段：它们会先进入 metadata filter，再与词法分数、向量相似度、threshold、top-k 和 query rewrite 的 trace 合并。只有摄取端对象边界清楚，下一课才可能判断“答案不存在、没有召回、被过滤或只是排序靠后”究竟发生在哪一层。',
});
