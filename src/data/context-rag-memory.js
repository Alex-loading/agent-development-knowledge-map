const VERIFIED_AT = '2026-07-21';

const officialBoundary = '证据边界：该资料描述当前产品或框架实现，接口和版本会变化，不代表跨产品或框架标准。';
const researchBoundary = '证据边界：研究结论绑定论文的实验或评测设定，不可外推为所有语料、模型或业务的结论。';
const engineeringBoundary = '证据边界：这是厂商工程经验，不代表可普适复现的收益或系统保证。';
const benchmarkBoundary = '证据边界：评测任务与数据集限定了结果含义，不代表生产环境中的记忆质量。';
const courseBoundary = '证据边界：项目依赖与接口版本会更新，示例只作学习导航，不承担生产质量或安全保证。';
const videoBoundary = '证据边界：视频用于建立直觉与学习导航，不作为实现细节、效果数字或系统保证的权威证据。';

const resources = [
  { id: 'res-context-anthropic-engineering', title: 'Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', source: 'Anthropic', language: '英文', type: '工程文章', difficulty: '进阶', stage: '上下文工程', value: '学习用途：理解上下文选择、压缩、隔离和工具结果管理的工程框架；' + engineeringBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-lost-middle', title: 'Lost in the Middle', url: 'https://aclanthology.org/2024.tacl-1.9/', source: 'TACL', language: '英文', type: '研究论文', difficulty: '进阶', stage: '长上下文边界', value: '学习用途：分析信息位置与长上下文利用效果之间的关系；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-compaction', title: 'Compaction', url: 'https://developers.openai.com/api/docs/guides/compaction', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '进阶', stage: '会话压缩', value: '学习用途：对照长会话压缩与状态续接的产品接口；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-embeddings', title: 'Vector embeddings', url: 'https://developers.openai.com/api/docs/guides/embeddings', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: 'Embedding', value: '学习用途：理解文本向量作为语义检索表示的用途；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-dpr', title: 'Dense Passage Retrieval', url: 'https://aclanthology.org/2020.emnlp-main.550/', source: 'EMNLP', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'Dense Retrieval', value: '学习用途：理解双编码器稠密召回的训练目标与实验方式；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-rrf', title: 'Reciprocal Rank Fusion', url: 'https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/', source: 'Google Research', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'Hybrid Retrieval', value: '学习用途：学习不依赖原始分数尺度的排序融合方法；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-contextual-retrieval', title: 'Introducing Contextual Retrieval', url: 'https://www.anthropic.com/engineering/contextual-retrieval', source: 'Anthropic', language: '英文', type: '工程文章', difficulty: '进阶', stage: '检索增强', value: '学习用途：观察为 chunk 补充文档上下文的检索设计；' + engineeringBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-retrieval', title: 'Retrieval', url: 'https://developers.openai.com/api/docs/guides/retrieval', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '检索管线', value: '学习用途：对照向量存储、搜索与属性过滤的产品接口；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-rag-paper', title: 'Retrieval-Augmented Generation', url: 'https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html', source: 'NeurIPS', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'RAG 基础', value: '学习用途：理解参数化生成与外部非参数知识结合的原始研究设定；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-citations', title: 'Citation formatting', url: 'https://developers.openai.com/api/docs/guides/citation-formatting', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门', stage: '引用呈现', value: '学习用途：学习把文件标注转换为用户可读引用的实现方式；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-alce', title: 'Enabling Large Language Models to Generate Text with Citations', url: 'https://aclanthology.org/2023.emnlp-main.398/', source: 'EMNLP', language: '英文', type: '研究论文', difficulty: '进阶', stage: '引用评测', value: '学习用途：区分引用完整性、正确性与答案质量的评测维度；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-beir', title: 'BEIR benchmark', url: 'https://openreview.net/forum?id=wCu6T5xFjeJ', source: 'OpenReview', language: '英文', type: '研究论文', difficulty: '进阶', stage: '检索评测', value: '学习用途：比较不同检索方法在异构数据集上的零样本表现；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-ragas', title: 'RAGAS', url: 'https://aclanthology.org/2024.eacl-demo.16/', source: 'EACL', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'RAG 评测', value: '学习用途：认识将检索上下文与生成回答分开评估的思路；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-langchain-memory', title: 'Memory overview', url: 'https://docs.langchain.com/oss/python/concepts/memory', source: 'LangChain', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '记忆建模', value: '学习用途：对照短期状态与长期记忆的框架概念；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-coala', title: 'Cognitive Architectures for Language Agents', url: 'https://openreview.net/forum?id=1i6ZCvflQJ', source: 'TMLR / OpenReview', language: '英文', type: '研究论文', difficulty: '深挖', stage: '记忆架构', value: '学习用途：用认知架构视角组织工作、情景、语义与程序性记忆；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-memgpt', title: 'MemGPT', url: 'https://arxiv.org/abs/2310.08560', source: 'arXiv', language: '英文', type: '研究论文', difficulty: '深挖', stage: '分层记忆', value: '学习用途：研究用分层存储和显式管理扩展有效上下文的思路；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-memorybank', title: 'MemoryBank', url: 'https://ojs.aaai.org/index.php/AAAI/article/view/29946', source: 'AAAI', language: '英文', type: '研究论文', difficulty: '深挖', stage: '记忆更新', value: '学习用途：观察长期对话记忆的形成、更新和遗忘建模；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-longmemeval', title: 'LongMemEval', url: 'https://github.com/xiaowu0162/LongMemEval', source: 'GitHub', language: '英文', type: '评测仓库', difficulty: '进阶', stage: '长期记忆评测', value: '学习用途：认识跨会话记忆检索、时间推理和知识更新任务；' + benchmarkBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-data', title: 'Your data', url: 'https://developers.openai.com/api/docs/guides/your-data', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '数据边界', value: '学习用途：核对托管数据、保留与控制选项的产品说明；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-rag-scratch', title: 'RAG from scratch', url: 'https://github.com/langchain-ai/rag-from-scratch', source: 'LangChain GitHub', language: '英文', type: '代码课程', difficulty: '入门到进阶', stage: 'RAG 实作', value: '学习用途：按 notebook 拆解索引、检索、生成与评估步骤；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-llm-universe', title: 'LLM Universe', url: 'https://github.com/datawhalechina/llm-universe', source: 'Datawhale', language: '中文', type: '开源课程', difficulty: '入门到进阶', stage: 'RAG 实作', value: '学习用途：用中文材料练习知识库问答的完整链路；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-all-in-rag', title: 'All in RAG', url: 'https://github.com/datawhalechina/all-in-rag', source: 'Datawhale', language: '中文', type: '开源课程', difficulty: '进阶', stage: 'RAG 工程', value: '学习用途：扩展检索、解析与评测组件的工程视野；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-hello-agents', title: 'Hello Agents', url: 'https://github.com/datawhalechina/hello-agents', source: 'Datawhale', language: '中文', type: '开源课程', difficulty: '入门到进阶', stage: 'Agent 记忆', value: '学习用途：结合 Agent 应用观察 RAG 与记忆的接入位置；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-practical-guide', title: '上下文工程实践指南', url: 'https://wakeup-jin.github.io/Practical-Guide-to-Context-Engineering/', source: 'Practical Guide to Context Engineering', language: '中文', type: '公开指南', difficulty: '入门到进阶', stage: '上下文工程', value: '学习用途：用中文案例复习上下文组织与压缩策略；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-hf-agentic-rag', title: 'Agentic RAG', url: 'https://huggingface.co/learn/agents-course/unit3/agentic-rag/agentic-rag', source: 'Hugging Face', language: '英文', type: '公开课程', difficulty: '进阶', stage: 'Agentic RAG', value: '学习用途：观察 Agent 如何决定检索与检查证据；' + courseBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-ragflow', title: 'RAGFlow 中文文档', url: 'https://ragflow.com.cn/docs', source: 'RAGFlow', language: '中文', type: '官方文档', difficulty: '入门到进阶', stage: 'RAG 工程', value: '学习用途：对照文档解析、知识库和检索配置的产品实践；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-bilibili', title: 'Datawhale RAG 入门视频', url: 'https://www.bilibili.com/video/BV1Sb421E74u/', source: 'Datawhale / Bilibili', language: '中文', type: '公开视频', difficulty: '入门', stage: 'RAG 入门', value: '学习用途：通过演示建立 RAG 数据流的直觉；' + videoBoundary, verifiedAt: VERIFIED_AT, platform: 'Bilibili' },
  { id: 'res-context-youtube', title: '李宏毅 2025 上下文工程课程', url: 'https://www.youtube.com/watch?v=lVdajtNpaGI', source: 'Hung-yi Lee / YouTube', language: '中文', type: '公开视频', difficulty: '入门到进阶', stage: '上下文工程', value: '学习用途：从课程讲解建立长上下文与上下文工程的直觉；' + videoBoundary, verifiedAt: VERIFIED_AT, platform: 'YouTube' },
];

function quiz(id, prompt, choices, answerIndex, explanation) {
  return {
    id: 'quiz-' + id,
    prompt,
    choices,
    answerIndex,
    explanation,
  };
}

function lesson({ order, title, summary, objectives, concepts, explanations, resourceIds, exercise, quizzes, completionCriteria }) {
  const suffix = String(order).padStart(2, '0');
  return {
    id: 'context-' + suffix,
    moduleId: 'context-rag-memory',
    order,
    title,
    summary,
    durationMinutes: 40,
    objectives,
    concepts,
    explanations,
    resourceIds,
    exercise,
    quiz: quizzes,
    interviewQuestionIds: [1, 2, 3].map((number) => 'iq-context-' + suffix + '-' + number),
    completionCriteria,
  };
}

const lessons = [
  lesson({
    order: 1,
    title: '信息层次与上下文生命周期',
    summary: '先划清五类信息对象的作用域、生命周期与投影关系，避免把所有持久数据混称为记忆。',
    objectives: ['区分 prompt context、conversation state、corpus、checkpoint 与长期记忆', '说明各层信息通过什么选择策略进入单次模型调用'],
    concepts: ['Prompt context', 'Conversation state', 'Retrieval corpus', 'Checkpoint', 'Long-term memory'],
    explanations: [
      { heading: '五层对象解决不同问题', body: 'prompt context 是一次调用真正可见的输入；conversation state 保存当前会话的消息、事实和约束；corpus 保存跨调用源文档；checkpoint 保存特定 run 的控制位置与恢复信息；长期记忆保存跨会话且经策略准入的信息。checkpoint 不等于长期记忆，持久化也不会让内容自动进入模型。', keyPoints: ['作用域和用途比存储介质更能定义对象', '持久化对象仍需经过选择与投影才能进入 prompt'] },
      { heading: '上下文是一份有来源的临时清单', body: '每次组装应记录来源层、版本、选择原因、token 成本和排除原因。conversation state、检索 chunk 与长期记忆只把必要投影送入调用，原始 corpus 文档和 run checkpoint 默认不直接投影，从而同时控制预算、隐私和指令边界。', keyPoints: ['模型看见的是投影结果而不是全部后端状态', '来源与排除理由让上下文组装可以审计和诊断'] },
    ],
    resourceIds: ['res-context-anthropic-engineering', 'res-context-lost-middle', 'res-context-practical-guide'],
    exercise: { title: '绘制五层信息地图', brief: '把一组系统指令、消息、文档、运行游标和用户偏好放入正确层次。', steps: ['逐项标记作用域、所有者、生命周期、来源和能否直接进入本轮 prompt', '为可投影项写选择条件，为不可投影项写明确原因和替代引用方式'], deliverable: '一张五层分类表和一份本轮 context manifest。' },
    quizzes: [
      quiz('context-01-1', '哪一项最准确描述 checkpoint？', ['跨会话用户偏好库', '特定 run 的控制位置与恢复提交点', '本轮全部检索证据'], 1, 'Checkpoint 服务运行恢复，不等于长期记忆，也不会自动进入 prompt context。'),
      quiz('context-01-2', 'Corpus 中的原始文档何时进入模型上下文？', ['持久化后自动进入', '经过检索、选择和证据投影后', '只要创建了索引就进入'], 1, 'Corpus 是后端知识源，只有被选择的证据投影才进入本次模型调用。'),
    ],
    completionCriteria: ['能用作用域与生命周期准确区分五类信息对象', '能解释每个上下文条目的来源、投影方式和排除原因'],
  }),
  lesson({
    order: 2,
    title: 'Context Engineering 与预算分配',
    summary: '把上下文视为受预算约束的组装系统，为输出、硬约束、状态、证据和记忆明确分配空间。',
    objectives: ['设计包含输入上限、输出预留和分层配额的上下文预算', '在超限时按优先级排除并显式报告不可组装情况'],
    concepts: ['Context manifest', 'Token budget', 'Output reserve', 'Priority', 'Projection policy'],
    explanations: [
      { heading: 'Context engineering 管理完整信息系统', body: 'prompt engineering 主要优化指令表达，context engineering 还负责来源发现、状态选择、检索、记忆投影、预算、排序和失效处理。组装前先从总窗口扣除输出预留，再纳入 system instruction 与当前请求等 required 项，最后按策略选择状态和证据。', keyPoints: ['预算先为输出和硬约束留空间', '每一层都要有稳定排序、配额与排除原因'] },
      { heading: '长窗口不是可靠性保证', body: 'Context 越长并不一定越好：无关、冲突和位置不利的信息会稀释有效证据，也会增加成本。required 项自身超限时应返回不可组装错误，而不是静默截断硬约束；普通超限则记录 budget-exceeded 并保留可复查的 manifest。', keyPoints: ['窗口容量与模型有效使用信息的能力不是同一指标', '超限行为必须确定、显式且不破坏硬约束'] },
    ],
    resourceIds: ['res-context-anthropic-engineering', 'res-context-lost-middle', 'res-context-openai-compaction', 'res-context-practical-guide', 'res-context-youtube'],
    exercise: { title: '组装预算有界的上下文', brief: '为一轮包含硬约束、会话状态、检索证据和偏好的调用分配有限预算。', steps: ['计算输出预留与可用输入预算，标记 required、priority、tokenCost 和 sourceRef', '分别处理刚好装满、普通超限和 required 超限，核对 included 与 excluded 原因'], deliverable: '一份确定排序、预算守恒且带排除原因的 context manifest。', experiment: 'context-router' },
    quizzes: [
      quiz('context-02-1', 'Context engineering 比 prompt engineering 多关注什么？', ['只修改措辞', '信息来源、选择、预算、排序和生命周期', '只增加示例数量'], 1, 'Context engineering 管理模型实际获得信息的全链路，不只优化提示词文本。'),
      quiz('context-02-2', 'Required 内容本身超过输入预算时应如何处理？', ['静默截断系统约束', '明确返回不可组装并请求缩减或调整预算', '随机删除一半内容'], 1, '硬约束不能在无告警情况下截断，调用方需要收到明确失败与原因。'),
    ],
    completionCriteria: ['能为一次调用计算输入预算并解释各层配额', '能稳定处理边界与超限且不静默删除 required 信息'],
  }),
  lesson({
    order: 3,
    title: 'Conversation State、Transcript 与摘要',
    summary: '把原始会话历史、当前规范状态和有损摘要分开管理，使纠正和压缩都可追溯。',
    objectives: ['区分 transcript、canonical conversation state 与 summary 的职责', '在用户纠正旧事实后更新当前状态并保留来源关系'],
    concepts: ['Transcript', 'Canonical state', 'Summary', 'Sliding window', 'Supersession'],
    explanations: [
      { heading: '三种表示不能互相冒充', body: 'Transcript 是按顺序保存的原始消息证据；conversation state 是从事件归并出的当前可操作事实、约束和未决项；summary 是为了降低成本而生成的有损派生物。摘要可能遗漏否定、时间和来源，因此不能反过来覆盖原始 transcript 或被当作完整事实库。', keyPoints: ['原始历史负责取证，规范状态负责当前决策', 'summary 是有损压缩，必须保留回取 transcript 的指针'] },
      { heading: '压缩必须处理纠正与冲突', body: '滑窗适合保留最近措辞，摘要适合浓缩连续叙事，retrieval 适合按需找回久远细节。用户修改先前事实时，新值以 supersedes 指向旧值并成为当前状态，旧事件仍保留时间和来源；压缩器还要保存硬约束、未决承诺、工具失败与不确定项。', keyPoints: ['选择滑窗、摘要或 retrieval 取决于任务所需证据形态', '更新当前值不等于抹去历史来源和冲突记录'] },
    ],
    resourceIds: ['res-context-openai-compaction', 'res-context-langchain-memory', 'res-context-coala', 'res-context-openai-data'],
    exercise: { title: '压缩一段含纠正的长会话', brief: '把含偏好修改、工具失败和未决承诺的 transcript 转成可继续工作的状态。', steps: ['提取 canonical facts、约束、未决项、来源消息和 supersession 关系', '生成明确标注不确定性的摘要，并为被省略细节保留 transcript 回取指针'], deliverable: '一份 canonical state、一个有损摘要和一张来源映射表。' },
    quizzes: [
      quiz('context-03-1', 'Summary 与 conversation state 的关键区别是什么？', ['Summary 必然完整', 'Summary 是有损叙述，state 表达当前可操作事实与约束', 'State 不需要来源'], 1, '摘要服务压缩而会丢失信息，规范状态服务当前决策并应保留来源。'),
      quiz('context-03-2', '用户纠正旧事实后应怎样处理？', ['删除全部历史', '新值 supersede 旧值并保留两者来源与时间', '同时把新旧值都当当前真值'], 1, '当前状态采用最新有效值，同时保留可审计的更正链。'),
    ],
    completionCriteria: ['能从 transcript 生成带来源的规范状态和有损摘要', '能正确表示事实纠正、冲突、未决项与历史回取路径'],
  }),
  lesson({
    order: 4,
    title: 'Retrieval Corpus、Chunk 与索引',
    summary: '从版本化源文档建立可检索、可过滤、可回源的 chunk 和索引，同时保持对象边界清楚。',
    objectives: ['设计兼顾语义完整、召回粒度和引用回源的 chunking 策略', '区分 source document、retrieval unit、citation unit、embedding 与 index'],
    concepts: ['Source document', 'Chunk', 'Metadata', 'Embedding', 'Index', 'Citation span'],
    explanations: [
      { heading: 'Corpus、index 与检索单元各司其职', body: 'Corpus 是版本化源文档及其治理元数据的集合；chunk 是检索候选单元；citation unit 是答案可精确指向的原文 span；embedding 是表示；index 是加速查找的派生结构。index 不是 corpus 本身，重建索引不能替代源文档、版本和权限记录。', keyPoints: ['源文档是可追溯事实载体，索引只是可重建投影', '检索粒度与引用粒度可以不同但必须建立映射'] },
      { heading: 'Chunking 是带结构的取舍', body: '过小 chunk 容易丢掉标题、定义和上下文，过大 chunk 会降低匹配精度并浪费预算，过度 overlap 则制造重复证据。应依据标题、段落、表格和代码边界切分，继承 documentId、version、department、language、validFrom 和 source span，并在新版本发布后让旧版本失效。', keyPoints: ['切分边界要尊重文档结构和回答所需语义', '版本、权限与失效元数据必须随 chunk 进入索引'] },
    ],
    resourceIds: ['res-context-openai-embeddings', 'res-context-dpr', 'res-context-openai-retrieval', 'res-context-rag-paper', 'res-context-rag-scratch', 'res-context-llm-universe'],
    exercise: { title: '为异构文档设计 chunk schema', brief: '为 FAQ、产品手册和制度文档制定可检索且能准确引用的切分方案。', steps: ['确定结构边界、目标大小、overlap、标题继承和 retrieval/citation unit 映射', '加入版本、失效、部门、语言、权限和 source span，并演练文档更新后的重建流程'], deliverable: '一份 chunk schema、三类切分示例和版本失效流程。' },
    quizzes: [
      quiz('context-04-1', 'Index 与 corpus 的关系是什么？', ['Index 就是唯一源文档', 'Index 是从 corpus 派生的检索结构', '两者都只保存摘要'], 1, 'Corpus 保留源文档和治理事实，index 是可重建的检索投影。'),
      quiz('context-04-2', 'Chunk 过度 overlap 的主要风险是什么？', ['完全无法检索', '重复候选挤占排序和上下文预算', '自动提升引用忠实性'], 1, '大量重叠会生成近重复证据，降低结果多样性并浪费 token。'),
    ],
    completionCriteria: ['能为不同文档结构选择合理 chunk 与引用边界', '能让索引中的每个单元回溯到有效源文档版本和 span'],
  }),
  lesson({
    order: 5,
    title: 'Sparse、Dense 与 Hybrid Retrieval',
    summary: '比较词法、语义与混合召回，在过滤、阈值和 top-k 之间建立可解释的候选生成流程。',
    objectives: ['根据查询和语料特征选择 sparse、dense 或 hybrid retrieval', '用 metadata filter、threshold、top-k 和 query rewrite 控制候选'],
    concepts: ['Sparse retrieval', 'Dense retrieval', 'Hybrid retrieval', 'Metadata filter', 'Query rewrite'],
    explanations: [
      { heading: '召回器的优势来自不同信号', body: 'Sparse retrieval 对产品编号、专有名词和原词匹配透明有效；dense retrieval 擅长语义改写，却可能错过稀有精确词。dense 不一定优于 sparse，领域漂移、语言和 embedding 选择都会改变结果；hybrid 可用 RRF 等方法融合不同排序而不假定原始分数同尺度。', keyPoints: ['方法选择应由查询类型与离线评测支持', '混合检索保留互补信号但仍需稳定的融合规则'] },
      { heading: '过滤与改写都会改变可召回集合', body: 'Metadata filter 应在排序前限制权限、版本、语言和时间范围；threshold 控制最低相关性，top-k 控制候选数量。Query rewrite 能补全缩写或拆分意图，也可能引入用户未表达的假设，所以必须记录原查询、改写结果和各阶段候选，区分语料不存在、漏召、误过滤和排序靠后。', keyPoints: ['无结果不只意味着 corpus 没有答案', '改写与过滤应可回放，避免把召回错误藏在最终列表中'] },
    ],
    resourceIds: ['res-context-dpr', 'res-context-rrf', 'res-context-contextual-retrieval', 'res-context-openai-retrieval', 'res-context-beir', 'res-context-rag-scratch', 'res-context-all-in-rag', 'res-context-hf-agentic-rag'],
    exercise: { title: '运行混合检索诊断', brief: '在固定小语料中比较 sparse、dense 和 hybrid，并定位候选消失的阶段。', steps: ['应用版本、部门和语言过滤，记录 sparse/dense 分数、融合名次、threshold 与 top-k', '改写查询并比较 trace，分别标记不存在、未召回、被过滤和排序靠后的原因'], deliverable: '一份可回放 retrieval trace 和三种方法的选择说明。', experiment: 'hybrid-retrieval' },
    quizzes: [
      quiz('context-05-1', '包含精确产品编号的查询通常先重视哪种信号？', ['Sparse 词法匹配', '随机向量', '只用生成模型猜测'], 0, '精确编号和稀有词通常适合词法召回，但仍应通过真实数据验证。'),
      quiz('context-05-2', 'Query rewrite 的主要风险是什么？', ['查询会自动加密', '改写可能加入原意之外的假设并造成错召', '必然让 top-k 变大'], 1, '改写能提升可召回性，也可能偏离用户意图，因此需要保留原查询和 trace。'),
    ],
    completionCriteria: ['能按查询特征解释 sparse、dense 与 hybrid 的选择', '能通过阶段 trace 定位过滤、阈值、排序和改写问题'],
  }),
  lesson({
    order: 6,
    title: 'Reranking、去重与证据打包',
    summary: '把高召回候选变成版本正确、覆盖多样、预算有界并能精确引用的 evidence packet。',
    objectives: ['说明 reranker、去重和多样性选择各自解决的问题', '构建带 source、version 与 span 的预算有界证据包'],
    concepts: ['Reranker', 'Deduplication', 'Diversity', 'Evidence packet', 'Citation manifest'],
    explanations: [
      { heading: '首阶段候选不是最终上下文', body: '第一阶段检索追求较高召回，reranker 再用更强的查询—文档相关性信号调整顺序。随后要按 documentId、version 和 span 合并近重复内容，并在不同来源之间保留多样性；否则同一文档的重叠 chunk 会占满预算，掩盖相互独立或相互冲突的证据。', keyPoints: ['Reranker 优化候选次序但不能创造 corpus 中不存在的事实', '去重和多样性共同提高有限证据预算的覆盖率'] },
      { heading: '证据存在不代表回答忠实', body: 'Evidence packet 应包含 chunk 文本、sourceRef、documentId、version、span 和选择分数，并按 token budget 打包。检索到相关证据不保证生成忠实，模型仍可能曲解或越界；引用也不自动证明对应 claim，必须检查每个主张是否被所指 span 支持，并分别评估检索与生成。', keyPoints: ['Citation manifest 解决回源，不自动解决蕴含与完整性', '故障定位要分别观察候选、打包结果、引用映射和最终主张'] },
    ],
    resourceIds: ['res-context-rrf', 'res-context-contextual-retrieval', 'res-context-rag-paper', 'res-context-openai-citations', 'res-context-alce', 'res-context-ragas', 'res-context-ragflow'],
    exercise: { title: '打包可引用证据', brief: '把混合召回候选经过重排、版本去重和多样性选择装入固定预算。', steps: ['执行固定 rerank，移除旧版本与近重复 chunk，并记录每次排除原因', '按预算选择互补证据，生成唯一 source/version/span 的 citation manifest 并逐条核对 claim'], deliverable: '一个 evidence packet、排除清单和 claim-to-citation 核对表。' },
    quizzes: [
      quiz('context-06-1', '为什么第一阶段 top-k 不宜直接全部塞入 prompt？', ['候选可能重复、旧版或相关性不足', '模型不能读取文本', '引用只支持单个 chunk'], 0, '候选生成强调召回，仍需重排、版本处理、去重、多样性和预算打包。'),
      quiz('context-06-2', '有引用的答案是否一定正确？', ['是，链接存在即可', '否，引用可能不支持对应主张或遗漏关键证据', '是，只要来自官方文档'], 1, '引用提供回源线索，但仍需验证主张与证据之间的支持关系。'),
    ],
    completionCriteria: ['能把候选稳定转换为去重且多样的 evidence packet', '能逐条验证 citation span 是否支持答案中的对应主张'],
  }),
  lesson({
    order: 7,
    title: '长期记忆的写入、召回与遗忘',
    summary: '为跨会话信息建立准入、作用域、来源、冲突、过期和删除策略，而不是自动永久保存聊天。',
    objectives: ['设计长期记忆 admission policy 与作用域隔离规则', '处理重复、纠正、过期、删除和召回后的上下文投影'],
    concepts: ['Semantic memory', 'Episodic memory', 'Procedural memory', 'Admission policy', 'TTL', 'Supersession'],
    explanations: [
      { heading: '记忆类型是应用建模标签', body: 'Semantic/profile memory 表达相对稳定的事实或偏好，episodic memory 表达一次经历及其时间，procedural memory 表达可复用流程。它们是应用层分类，不证明模型内部拥有相同机制。写入前应判断用户意图、稳定性、敏感性、主体、scope、来源和置信度，不能把每条聊天自动保存为永久记忆。', keyPoints: ['显式保存请求与系统推断应采用不同准入门槛', '敏感、一次性或低置信度信息通常应拒绝或缩短 TTL'] },
      { heading: '长期记忆必须拥有完整生命周期', body: '长期记忆必须可更新、可过期、可删除：重复写入应 no-op，用户纠正生成 supersedes 关系，TTL 到期停止召回，删除后本轮与后续投影都不可出现。召回还要校验 subject、scope、有效期、来源与相关性，并让当前显式输入优先于旧记忆，避免陈旧偏好覆盖用户新要求。', keyPoints: ['召回的是经策略筛选的投影，不是整库记忆', '纠正、过期和删除都要留下受控的生命周期结果与原因'] },
    ],
    resourceIds: ['res-context-langchain-memory', 'res-context-coala', 'res-context-memgpt', 'res-context-memorybank', 'res-context-longmemeval', 'res-context-openai-data', 'res-context-hello-agents'],
    exercise: { title: '模拟个人助理记忆生命周期', brief: '为显式偏好、一次性行程、敏感字段、重复观察和用户纠正决定写入与召回。', steps: ['按 admission policy 执行 reject、store、no-op 或 supersede，并记录 provenance、confidence、scope 和 TTL', '推进时间、执行删除并从不同 subject/scope 召回，检查 expired、deleted 与越权记录不会投影'], deliverable: '一份记忆事件日志、有效记录表和本轮 memory projection。', experiment: 'memory-lifecycle' },
    quizzes: [
      quiz('context-07-1', '哪类聊天内容应该自动永久写入长期记忆？', ['所有消息', '没有任何类别应无条件自动永久写入', '每次工具输出'], 1, '长期记忆写入需要明确的准入、作用域、敏感性与生命周期策略。'),
      quiz('context-07-2', '用户纠正已保存偏好时应怎样处理？', ['忽略新值', '新记录 supersede 旧值并阻止旧值继续召回', '同时随机召回新旧值'], 1, '纠正关系保留来源历史，同时保证当前有效投影只使用新值。'),
    ],
    completionCriteria: ['能为不同信息给出可解释的记忆准入与作用域决定', '能证明更新、过期、删除和跨主体隔离在召回时生效'],
  }),
  lesson({
    order: 8,
    title: 'RAG 与记忆综合设计及故障定位',
    summary: '把状态、语料、检索、证据和记忆串成可追溯架构，并沿数据流定位回答错误所在层。',
    objectives: ['设计来源清楚、预算有界且记忆有生命周期的综合架构', '沿 source 到 answer 的链路定位缺失、陈旧、冲突与不忠实故障'],
    concepts: ['Layered diagnosis', 'Data provenance', 'Staleness', 'Retrieval evaluation', 'Generation faithfulness'],
    explanations: [
      { heading: '综合架构保持层间契约', body: '源文档经摄取、版本化、chunk 和索引生成候选，再经过滤、融合、重排、去重和打包形成 evidence packet；会话状态与长期记忆分别投影后，与指令和当前请求共同进入 prompt context。每一箭头都记录输入版本、输出 ID、预算、排除原因和 sourceRef。', keyPoints: ['状态、RAG 与记忆通过投影汇合但不混成同一存储', '端到端追踪要能从答案回到 evidence span 与源版本'] },
      { heading: '故障定位从分层反证开始', body: 'RAG 答错时依次检查源文档是否存在且有效、chunk 是否保留语义、候选是否召回、filter 是否误删、rerank 是否降权、打包是否超限、记忆是否冲突，以及生成是否忠实使用证据。RAG 适合动态外部知识，fine-tuning 更适合行为和稳定模式，长期记忆适合主体相关且可治理的跨会话信息。', keyPoints: ['先定位信息在哪一层消失，再调整具体组件', '检索指标、引用检查和生成忠实性需要分开观察'] },
    ],
    resourceIds: ['res-context-ragas', 'res-context-longmemeval', 'res-context-rag-scratch', 'res-context-llm-universe', 'res-context-all-in-rag', 'res-context-hello-agents', 'res-context-hf-agentic-rag', 'res-context-ragflow', 'res-context-bilibili', 'res-context-youtube'],
    exercise: { title: '设计并诊断政策助理', brief: '为企业政策助理画出上下文、RAG 与记忆架构，并诊断一组错误回答。', steps: ['定义 source、chunk、candidate、evidence packet、state、memory projection、prompt 和 citation 的接口', '针对未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆和不忠实生成逐层给出证据与修复'], deliverable: '一张综合架构图、一份分层故障树和可执行验收清单。' },
    quizzes: [
      quiz('context-08-1', 'RAG 回答错误时首先应怎样诊断？', ['立刻扩大所有 top-k', '沿 source 到 answer 分层检查信息在哪一步失真或消失', '直接改成长期记忆'], 1, '分层 trace 能区分摄取、检索、打包、记忆冲突和生成忠实性问题。'),
      quiz('context-08-2', '什么时候更适合长期记忆而不是 RAG corpus？', ['保存某用户可治理的跨会话偏好', '保存所有公共产品手册', '替代模型行为训练'], 0, '主体相关、经准入且可更新删除的跨会话信息适合长期记忆。'),
    ],
    completionCriteria: ['能交付层次清楚且所有投影均可回源的综合架构', '能用分层证据区分检索、打包、记忆与生成故障'],
  }),
];

function interviewSpec(
  id,
  lessonId,
  question,
  shortAnswer,
  deepDive,
  misconception,
  followUp,
  frequency,
  difficulty,
  roles,
) {
  return {
    id,
    lessonId,
    question,
    shortAnswer,
    deepDive,
    misconceptions: [misconception],
    followUps: [followUp],
    frequency,
    difficulty,
    roles,
  };
}

const interviewSpecs = [
  interviewSpec('iq-context-01-1', 'context-01', 'prompt context、conversation state、corpus、checkpoint、长期记忆有什么区别？', 'prompt context 是本轮可见输入，state 是当前会话状态，corpus 是外部知识源，checkpoint 是 run 恢复点，长期记忆是跨会话且经治理的信息。', ['五者用作用域、生命周期、所有者和是否直接投影来区分。', 'checkpoint 不等于长期记忆，corpus 和 memory 也都不会自动进入 prompt。'], '把所有持久数据都叫记忆，并假设模型随时能看见。', '请为五类对象各举一个不应直接进入 prompt 的字段。', '高', '基础', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-01-2', 'context-01', 'Context engineering 与 prompt engineering 有何区别？', 'Prompt engineering 主要优化指令表达；context engineering 管理来源发现、状态、检索、记忆、预算、排序、压缩与失效的完整系统。', ['同一提示词在不同证据选择和排序下会得到不同质量。', '上下文工程需要可观测的 manifest，而不只是最终拼接字符串。'], '认为 context engineering 只是把 prompt 写得更长。', '哪些上下文选择应由宿主确定而不是交给模型猜测？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-01-3', 'context-01', '一条知识如何从源文档进入模型上下文？', '源文档经解析、版本化、切分、索引、查询召回、过滤、重排、去重和预算打包后，作为带来源的证据投影进入本轮上下文。', ['每一步都应保留 document、version、span 和排除原因。', '进入上下文后仍需检查生成是否忠实使用证据。'], '认为创建向量索引后全部文档已经进入模型窗口。', '如何证明答案中的一个数字来自哪个源版本和 span？', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-02-1', 'context-02', '如何管理有限 context window？', '先预留输出，纳入硬约束与当前请求，再按分层预算、优先级、相关性和时效选择状态、证据与记忆，并记录排除原因。', ['Required 项超限应显式失败，不可静默截断。', '应以任务质量和可追溯性评估预算，而不只追求填满窗口。'], '把窗口填得越满视为上下文管理越成功。', '证据预算与会话状态预算冲突时如何制定策略？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-02-2', 'context-02', '滑窗、摘要和 retrieval 应怎么选？', '滑窗保留最近原话，摘要压缩连续叙事，retrieval 按需找回远处细节；实际系统可组合，并保留 transcript 作为证据底座。', ['硬约束和用户纠正不应仅依赖可能遗漏它们的摘要。', '选择取决于时间局部性、精确措辞需求和可回取性。'], '认为一种策略可以无损替代另外两种。', '法律措辞必须逐字保留时你会怎样组合三者？', '高', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-02-3', 'context-02', 'Context 越长效果一定越好吗？', '不一定；无关、重复、冲突和位置不利的信息会稀释有效证据、增加成本，模型也未必同等利用窗口各位置内容。', ['窗口容量只是上限，不是有效上下文质量指标。', '应通过受控评测比较选择策略，而非外推单篇研究结果。'], '认为支持更大窗口就可以取消检索、压缩和排序。', '怎样设计实验判断更多上下文是在帮助还是干扰？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-03-1', 'context-03', 'Transcript、conversation state、summary 的区别？', 'Transcript 是原始消息序列，state 是归并后的当前事实与约束，summary 是为节省预算生成的有损叙述。', ['State 应能指回来源事件并表达 supersession。', 'Summary 不能作为唯一审计记录，也不能无条件覆盖 transcript。'], '把摘要当成无损且唯一的会话真相。', '三者不一致时应如何确定当前有效值？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-03-2', 'context-03', '如何安全压缩长会话？', '先提取硬约束、当前事实、纠正链、未决承诺、失败和来源指针，再生成明确标注不确定性的摘要并保留可回取 transcript。', ['压缩应版本化，能比较前后遗漏和冲突。', '高风险事实可保留结构化状态或原文 span，而不是只留摘要。'], '只让模型自由总结后删除全部历史。', '如何检测摘要遗漏了用户的否定条件？', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-03-3', 'context-03', '用户修改了先前事实，状态如何更新？', '把新事实写成当前有效值，用 supersedes 关联旧事实，保留双方来源与时间，并让后续摘要和记忆投影停止使用旧值。', ['冲突不能靠覆盖写隐藏，诊断仍需要历史证据。', '显式当前输入应优先于旧状态或长期记忆。'], '删除旧消息导致无法解释状态为什么变化。', '多个来源同时声称最新值时如何决胜？', '高', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-04-1', 'context-04', '如何设计 chunking？', '按文档结构和回答所需语义选择边界与大小，适度 overlap，并让每个 chunk 继承标题、版本、权限、语言和 source span。', ['过小会丢上下文，过大会降低定位精度并浪费预算。', 'Retrieval unit 与 citation unit 可不同，但必须可映射。'], '只按固定字符数切分且不保留标题和版本。', '表格、代码和 FAQ 各自适合怎样的边界？', '高', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-04-2', 'context-04', 'Corpus 如何处理版本和失效？', '源文档保留稳定 ID 与版本，chunk 继承有效期和状态；发布新版本时旧版停止进入默认检索，但仍可按审计策略回溯。', ['索引重建必须与源版本和权限变更协调。', '删除或撤权要传播到 chunk、缓存与服务索引。'], '只更新数据库正文却保留旧向量继续召回。', '索引更新失败时怎样防止新旧版本混答？', '高', '进阶', ['Agent 开发', '后端工程']),
  interviewSpec('iq-context-04-3', 'context-04', 'source document、retrieval unit、citation unit 有何不同？', 'Source document 是治理与版本载体，retrieval unit 是候选召回粒度，citation unit 是能精确支持主张的原文范围。', ['三者可以一对多，关键是保留稳定映射。', 'Citation unit 通常需要比检索 chunk 更精确地定位 span。'], '把一个向量记录同时当作完整源文档和精确引用。', '合并相邻 chunk 后引用范围应如何保存？', '中', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-05-1', 'context-05', 'Sparse、dense、hybrid retrieval 怎么选？', '精确词和编号偏 sparse，语义改写可用 dense，异构查询常用 hybrid；最终选择应以真实语料和查询集评测。', ['Dense 不一定优于 sparse，领域与语言会改变表现。', 'Hybrid 融合需要处理分数尺度或使用基于名次的方法。'], '默认把 dense 当作所有查询的最优方案。', '怎样构建覆盖编号、同义改写和多语言的评测集？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-05-2', 'context-05', 'top-k、threshold 和 metadata filter 如何配合？', '先用 metadata filter 限制合法候选，再按相关性 threshold 去除弱匹配，最后用 top-k 控制进入后续阶段的数量。', ['次序变化会让结果语义不同，应在 trace 中记录。', 'Top-k 不是最终上下文数量，后面还有重排与预算打包。'], '无结果时只盲目提高 top-k，不检查过滤和阈值。', '权限 filter 与版本 filter 应在哪一层强制？', '高', '进阶', ['Agent 开发', '后端工程']),
  interviewSpec('iq-context-05-3', 'context-05', 'Query rewrite 有什么价值和风险？', '改写可补全缩写、拆分复合问题和生成同义表达，但也可能加入未表达假设、偏离意图或放大敏感信息。', ['保留原查询、改写版本和每次候选便于比较。', '高风险检索可要求约束模板或用户确认。'], '认为改写后的查询必然比原查询更准确。', '怎样评估 rewrite 提升了召回却损害了精度？', '中', '深挖', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-1', 'context-06', '为什么需要 reranker？', '首阶段检索以高召回和低成本产生候选，reranker 用更强的查询—文档交互信号改善有限候选的最终顺序。', ['Reranker 不能找回首阶段完全漏掉的文档。', '重排质量与延迟、候选数和领域数据有关。'], '认为 reranker 能修复不存在于候选集的事实。', '候选数扩大时如何权衡 rerank 成本与召回？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-2', 'context-06', '为什么需要去重和多样性？', '重叠 chunk 和同文档旧版本会重复占用预算；去重与多样性选择让有限证据覆盖更多独立来源、方面和冲突观点。', ['去重键应包含 document、version 和 span 语义。', '多样性不能牺牲关键高相关证据，需要明确目标。'], '认为 top-ranked 列表天然没有重复且覆盖全面。', '相邻片段既重复又互补时怎样合并？', '中', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-3', 'context-06', 'RAG 中有引用为什么仍会答错？', '引用只给出回源线索；检索内容可能过期或无关，模型也可能曲解证据、把一个引用挂到不被支持的 claim 上或遗漏反例。', ['需分别检查检索相关性、citation correctness、completeness 和生成忠实性。', '格式正确的链接不等于语义支持关系成立。'], '看到引用标记就把答案视为已验证事实。', '如何逐句建立 claim-to-span 核对表？', '高', '深挖', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-1', 'context-07', '什么是长期记忆，什么时候写？', '长期记忆是跨会话、绑定主体和作用域、经准入策略保存并可治理的信息；稳定且未来有用的显式偏好比一次闲聊更适合写入。', ['写入判断考虑意图、稳定性、敏感性、来源、置信度和 TTL。', '不是每条 transcript 都应自动成为永久记忆。'], '把完整聊天历史等同于长期记忆库。', '一次性行程与长期饮食禁忌应分别怎样处理？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-2', 'context-07', 'Semantic、episodic、procedural memory 怎么理解？', 'Semantic/profile 表达相对稳定事实，episodic 表达带时间的经历，procedural 表达可复用流程；它们是应用建模标签。', ['同一信息可因产品目的落入不同类别，需写清使用规则。', '这些标签不证明底层模型具有人类式记忆机制。'], '把论文分类名当作模型内部能力的确定事实。', '用户偏好和一次成功工作流分别属于哪类？', '中', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-3', 'context-07', '如何处理冲突、过期和删除？', '新值用 supersedes 关联旧值，TTL 或有效期控制召回，删除事件立即阻止投影，并把传播范围覆盖索引、缓存与服务层。', ['当前显式输入应优先于可能陈旧或冲突的长期记忆投影。', '删除语义要说明逻辑不可召回与物理备份清理的边界。'], '覆盖写或软删除后仍让旧记录参与召回。', '怎样证明删除后旧偏好不再出现在 prompt？', '高', '深挖', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-08-1', 'context-08', 'RAG 答错时如何诊断？', '沿 source、chunk、candidate、filter、rank、evidence packet、prompt、memory 和 answer 逐层找出信息消失、过期、冲突或被曲解的位置。', ['每层需要稳定 ID、版本和排除原因才能反证。', '不要用一个端到端分数掩盖检索与生成的不同故障。'], '一遇到错误就改 prompt 或无界扩大 top-k。', '给出语料中存在但未出现在答案里的排查顺序。', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-08-2', 'context-08', 'RAG、fine-tuning 和长期记忆如何选？', '动态外部知识优先 RAG，稳定行为模式可考虑 fine-tuning，主体相关且需跨会话治理的信息适合长期记忆；三者可组合。', ['选择取决于变化频率、可追溯性、主体作用域和更新成本。', 'Fine-tuning 不适合作为频繁更新事实的唯一数据库。'], '认为三者互斥，或用训练参数保存所有最新事实。', '企业政策与个人偏好应如何分别建模？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-08-3', 'context-08', '请设计上下文、RAG 与记忆架构。', '设计应分离会话状态、版本化 corpus、检索管线和长期记忆，通过有来源、预算有界的投影汇入 prompt，并保留端到端 trace。', ['说明写入、更新、过期、删除、权限、引用和失败降级。', '验收要分别覆盖召回、证据支持、生成忠实性和记忆生命周期。'], '只画向量数据库到模型的一条线，没有状态、版本或治理。', '当旧记忆与最新政策证据冲突时如何决胜并记录？', '高', '深挖', ['Agent 开发', 'AI 应用', '后端工程']),
];

export function createContextInterviewQuestion(spec) {
  return {
    id: spec.id,
    lessonId: spec.lessonId,
    question: spec.question,
    shortAnswer: spec.shortAnswer,
    deepDive: [...spec.deepDive],
    misconceptions: [...spec.misconceptions],
    followUps: [...spec.followUps],
    frequency: spec.frequency,
    difficulty: spec.difficulty,
    roles: [...spec.roles],
  };
}

const interviewQuestions = interviewSpecs.map(createContextInterviewQuestion);

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  return Object.freeze(value);
}

export const contextRagMemory = deepFreeze({
  id: 'context-rag-memory',
  title: '上下文、RAG 与记忆',
  summary: '把会话状态、检索语料与长期记忆投影成来源清楚、预算有界的模型上下文。',
  lessons,
  resources,
  interviewQuestions,
});
