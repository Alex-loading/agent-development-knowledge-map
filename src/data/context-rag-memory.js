import { contextRagMemoryNotes } from './context-rag-memory-notes.js';
import { contextRagMemoryOutcomeRegistry } from './context-rag-memory-outcomes.js';
import { createPrimaryReferenceBinding } from './primary-reference-bindings.js';

const VERIFIED_AT = '2026-07-23';
const PRIMARY_VERIFIED_AT = '2026-07-30';

const officialBoundary = '证据边界：该资料描述当前产品或框架实现，接口和版本会变化，不代表跨产品或框架标准。';
const researchBoundary = '证据边界：研究结论绑定论文的实验或评测设定，不可外推为所有语料、模型或业务的结论。';
const engineeringBoundary = '证据边界：这是厂商工程经验，不代表可普适复现的收益或系统保证。';
const benchmarkBoundary = '证据边界：评测任务与数据集限定了结果含义，不代表生产环境中的记忆质量。';
const courseBoundary = '证据边界：项目依赖与接口版本会更新，示例只作学习导航，不承担生产质量或安全保证。';
const videoBoundary = '证据边界：视频用于建立直觉与学习导航，不作为实现细节、效果数字或系统保证的权威证据。';

const resourceCatalog = [
  { id: 'res-context-anthropic-engineering', title: 'Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', source: 'Anthropic', language: '英文', type: '工程文章', difficulty: '进阶', stage: '上下文工程', value: '学习用途：理解上下文选择、压缩、隔离和工具结果管理的工程框架；' + engineeringBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-lost-middle', title: 'Lost in the Middle', url: 'https://aclanthology.org/2024.tacl-1.9/', source: 'TACL', language: '英文', type: '研究论文', difficulty: '进阶', stage: '长上下文边界', value: '学习用途：分析信息位置与长上下文利用效果之间的关系；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-compaction', title: 'Compaction', url: 'https://developers.openai.com/api/docs/guides/compaction', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '进阶', stage: '会话压缩', value: '学习用途：对照长会话压缩与状态续接的产品接口；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-openai-embeddings', title: 'Vector embeddings', url: 'https://developers.openai.com/api/docs/guides/embeddings', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: 'Embedding', value: '学习用途：理解文本向量作为语义检索表示的用途；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-dpr', title: 'Dense Passage Retrieval', url: 'https://aclanthology.org/2020.emnlp-main.550/', source: 'EMNLP', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'Dense Retrieval', value: '学习用途：理解双编码器稠密召回的训练目标与实验方式；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-rrf', title: 'Reciprocal Rank Fusion', url: 'https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/', source: 'Google Research', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'Hybrid Retrieval', value: '学习用途：学习不依赖原始分数尺度的排序融合方法；' + researchBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-contextual-retrieval', title: 'Introducing Contextual Retrieval', url: 'https://www.anthropic.com/engineering/contextual-retrieval', source: 'Anthropic', language: '英文', type: '工程文章', difficulty: '进阶', stage: '检索增强', value: '学习用途：观察为 chunk 补充文档上下文的检索设计；' + engineeringBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-bert-reranker', title: 'Passage Re-ranking with BERT', url: 'https://arxiv.org/abs/1901.04085', source: 'arXiv', language: '英文', type: '研究论文', difficulty: '进阶', stage: 'Reranking', value: '学习用途：理解用查询与候选段落联合编码进行第二阶段重排的研究方法；' + researchBoundary, verifiedAt: VERIFIED_AT },
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
  { id: 'res-context-ragflow', title: 'RAGFlow 文档', url: 'https://ragflow.io/docs/v0.26.4/', source: 'RAGFlow', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: 'RAG 工程', value: '学习用途：对照文档解析、知识库和检索配置的产品实践；' + officialBoundary, verifiedAt: VERIFIED_AT },
  { id: 'res-context-bilibili', title: '【精剪版】Datawhale开源大模型入门课-第四节-大模型应用开发实践-RAG与Agent-02-检索增强生成：原理、实践和应用场景', url: 'https://www.bilibili.com/video/BV1Sb421E74u/', source: '二次元的Datawhale', language: '中文', type: '公开视频', difficulty: '入门', stage: 'RAG 入门', value: '学习用途：通过演示建立 RAG 数据流的直觉；' + videoBoundary, verifiedAt: VERIFIED_AT, platform: 'Bilibili' },
  { id: 'res-context-youtube', title: '【生成式人工智慧與機器學習導論2025】第2講：上下文工程—AI Agent背後的關鍵技術', url: 'https://www.youtube.com/watch?v=lVdajtNpaGI', source: 'Hung-yi Lee', language: '中文', type: '公开视频', difficulty: '入门到进阶', stage: '上下文工程', value: '学习用途：从课程讲解建立长上下文与上下文工程的直觉；' + videoBoundary, verifiedAt: VERIFIED_AT, platform: 'YouTube' },
];

const evidenceByResourceId = {
  'res-context-anthropic-engineering': {
    authority: 'official',
    role: 'core',
    coverage: ['上下文选择、压缩、隔离、工具结果管理与按需加载的工程原则'],
    limitations: '厂商工程文章不定义本课程的五层对象、context manifest 字段或确定性预算与溢出契约，也不能保证跨模型复现收益。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-lost-middle': {
    authority: 'academic',
    role: 'core',
    coverage: ['长上下文中相关信息位置对模型利用效果的影响'],
    limitations: '结论受论文所测模型、任务、上下文长度与输入构造限制，不能推出所有模型或业务都具有相同的位置效应。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-openai-compaction': {
    authority: 'official',
    role: 'core',
    coverage: ['OpenAI 会话压缩接口、压缩后状态续接与长会话管理方式'],
    limitations: '仅说明 OpenAI 当前产品接口，不证明压缩无损，也不定义跨供应商通用的 transcript、canonical state 或摘要契约。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-openai-embeddings': {
    authority: 'official',
    role: 'core',
    coverage: ['OpenAI embedding 的向量表示用途及语义检索接入方式'],
    limitations: '产品文档不证明特定 embedding 在本课程语料上优于词法检索，也不覆盖 chunk 版本、权限与引用跨度治理。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-dpr': {
    authority: 'academic',
    role: 'core',
    coverage: ['双编码器稠密段落检索的训练目标、召回流程与论文实验'],
    limitations: '论文结果绑定开放域问答数据集、负样本和评测设置，不能外推为 dense retrieval 在所有领域都优于 sparse retrieval。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-rrf': {
    authority: 'academic',
    role: 'core',
    coverage: ['Reciprocal Rank Fusion 依据名次融合多路排序结果的方法'],
    limitations: 'RRF 是 rank fusion 排名融合方法，不是使用 query-document 交互信号重新打分的 reranker，也不保证在所有语料上提升效果。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-contextual-retrieval': {
    authority: 'official',
    role: 'core',
    coverage: ['BM25、embedding、混合检索、上下文化 chunk 与 reranking 管线'],
    limitations: '文中召回失败率改善来自 Anthropic 指定语料、模型和评测配置，不可外推为通用收益；也不建立引用正确性保证。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-bert-reranker': {
    authority: 'academic',
    role: 'core',
    coverage: ['passage re-ranking with BERT', 'query 与 passage 联合编码后对首阶段候选重新评分'],
    limitations: '论文结论绑定其 2019 年模型、候选集和 TREC/MS MARCO 实验；reranker 不能找回首阶段未召回的段落。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-openai-retrieval': {
    authority: 'official',
    role: 'core',
    coverage: ['OpenAI vector store、检索查询、排序选项与属性过滤接口'],
    limitations: '接口语义随产品版本变化，不能当作跨向量库标准；文档也不提供适用于任意语料的 threshold 与 top-k 最优值。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-rag-paper': {
    authority: 'academic',
    role: 'core',
    coverage: ['参数化生成模型与外部非参数知识索引结合的原始 RAG 研究设定'],
    limitations: '论文架构与结论受其 Wikipedia、任务和模型设置限制，不直接证明课程中的过滤、证据包、引用或记忆治理契约。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-openai-citations': {
    authority: 'official',
    role: 'cross-check',
    coverage: ['将 OpenAI 文件标注转换为用户可读引用的产品格式'],
    limitations: '引用格式与回源链接不证明对应 claim 被证据蕴含，也不覆盖 citation correctness、completeness 或跨产品格式。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-alce': {
    authority: 'academic',
    role: 'core',
    coverage: ['长文本生成中的引用正确性、引用完整性与答案质量评测'],
    limitations: '评测定义、数据与自动评价方法限定了指标含义，不能把高分直接解释为生产答案全部真实或无遗漏。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-beir': {
    authority: 'academic',
    role: 'core',
    coverage: ['异构检索数据集上的零样本 sparse、dense 与相关方法比较'],
    limitations: 'BEIR 的任务集合和公开语料不能替代目标业务的真实查询、权限过滤、时效和成本评测，排名也不是普适结论。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-ragas': {
    authority: 'academic',
    role: 'core',
    coverage: ['将检索上下文质量与生成回答质量分开评估的 RAGAS 指标思路'],
    limitations: '论文指标与评估模型有特定假设，不能单独证明事实正确性，也不能替代人工 claim-to-source 核验。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-langchain-memory': {
    authority: 'official',
    role: 'cross-check',
    coverage: ['LangGraph 线程级短期状态、跨会话长期 store、namespace 与记忆更新时机'],
    limitations: '这是 LangChain/LangGraph 的框架模型，不是通用记忆标准；不直接规定 confidence、TTL、supersession 或物理删除保证。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-coala': {
    authority: 'academic',
    role: 'core',
    coverage: ['语言 agent 的工作记忆、长期记忆及 semantic、episodic、procedural 组织框架'],
    limitations: '这是认知架构分析框架，不证明具体模型具有等同人类的记忆机制，也不提供生产存储、隔离或删除接口保证。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-memgpt': {
    authority: 'academic',
    role: 'core',
    coverage: ['通过分层存储与显式换入换出扩展有效上下文的 MemGPT 架构'],
    limitations: '论文系统和实验不能当作所有 agent 的标准实现，分层内存方法也不自动满足隐私、权限与生命周期治理要求。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-memorybank': {
    authority: 'academic',
    role: 'cross-check',
    coverage: ['长期对话记忆的形成、更新、检索与遗忘建模实验'],
    limitations: '研究设定和遗忘机制绑定论文系统及评测，不足以定义业务记忆的 TTL、用户删除权或跨主体隔离契约。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-longmemeval': {
    authority: 'academic',
    role: 'core',
    coverage: ['跨会话信息检索、时间推理、知识更新与长期记忆任务评测'],
    limitations: '仓库任务和数据集只衡量指定能力，不代表生产环境中的记忆质量、隐私合规、删除传播或主体隔离。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-openai-data': {
    authority: 'official',
    role: 'cross-check',
    coverage: ['OpenAI API 数据保留、存储与可用控制选项的当前产品说明'],
    limitations: '产品数据政策具有账户、端点、地区和时间边界，不能外推为应用自身的长期记忆删除、备份擦除或合规证明。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-rag-scratch': {
    authority: 'official',
    role: 'extension',
    coverage: ['LangChain maintainer notebooks 对 indexing、retrieval 与 generation 的教学拆解'],
    limitations: '仓库主分支无稳定发布与依赖锁定，示例不是生产规范，也不覆盖文档版本、权限、失效和完整检索控制策略。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-llm-universe': {
    authority: 'community',
    role: 'cross-check',
    coverage: ['中文知识库问答课程中的文档处理、向量检索与生成示例'],
    limitations: '社区课程依赖和接口会变化，示例用于学习导航，不能作为当前产品语义、生产安全或效果数字的核心证据。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-all-in-rag': {
    authority: 'community',
    role: 'cross-check',
    coverage: ['中文开源课程中的文档解析、检索组件与 RAG 评测实践'],
    limitations: '社区仓库覆盖面不等于各组件均获独立验证，代码版本和示例结果不能外推为特定业务的生产保证。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-hello-agents': {
    authority: 'community',
    role: 'cross-check',
    coverage: ['中文 Agent 教程中 RAG 与记忆在应用流程里的接入示例'],
    limitations: '课程示例不定义通用 memory semantics，也不证明其中的写入、召回、过期和删除策略满足生产治理要求。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-practical-guide': {
    authority: 'community',
    role: 'extension',
    coverage: ['中文上下文工程案例对信息组织、压缩与检索策略的学习导航'],
    limitations: '公开指南用于解释和复习，不是框架规范或原始实验来源；案例结论不能取代官方接口与学术证据。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-hf-agentic-rag': {
    authority: 'official',
    role: 'extension',
    coverage: ['Hugging Face 官方课程中由 agent 决定是否调用检索工具的 Agentic RAG 示例'],
    limitations: '页面正文和示例只支持基本工具接入，不覆盖 sparse/dense/hybrid 选择、过滤阈值、完整故障树或生产质量保证。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-ragflow': {
    authority: 'official',
    role: 'cross-check',
    coverage: ['RAGFlow v0.26.4 的文档解析、chunk 配置、检索测试、引用与知识库产品流程'],
    limitations: 'RAGFlow 的产品实现不等于通用 RAG 规范；版本化文档也不证明返回引用必然正确、完整或支持答案主张。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-bilibili': {
    authority: 'community',
    role: 'extension',
    coverage: ['视频标题、作者、发布日期 2024-07-02、时长 15:58 与页面元数据'],
    limitations: '页面字幕为空或未取得字幕正文，因此不能用该视频支撑 RAG 机制、实现细节、效果数字或 assessed outcomes。',
    verifiedAt: VERIFIED_AT,
  },
  'res-context-youtube': {
    authority: 'expert',
    role: 'extension',
    coverage: ['讲者、课程标题、发布日期等公开视频元数据'],
    limitations: '未稳定取得字幕正文，故只作专家课程导航，不能据此声明课程具体论点、实现细节或跨模型效果结论。',
    verifiedAt: VERIFIED_AT,
  },
};

const verificationResources = resourceCatalog.map((resource) => ({
  ...resource,
  evidence: evidenceByResourceId[resource.id],
}));

function primaryBinding({
  id,
  canonicalSourceId,
  stage,
  difficulty = '进阶',
  learningUse,
  role = 'core',
  coverage,
  limitations,
}) {
  return createPrimaryReferenceBinding({
    id,
    canonicalSourceId,
    stage,
    difficulty,
    value: `学习用途：${learningUse}；覆盖范围：${coverage.join('、')}；证据边界：${limitations}`,
    evidence: {
      authority: 'expert',
      role,
      learningUse,
      coverage,
      limitations,
      verifiedAt: PRIMARY_VERIFIED_AT,
    },
  });
}

const primaryResources = [
  primaryBinding({
    id: 'res-context-primary-feishu-company-brain',
    canonicalSourceId: 'primary-feishu-company-brain',
    stage: '组织知识系统',
    learningUse: '把 RAG 从向量检索扩展为包含摄取、权限、时效、引用和治理的 Company Brain 运行环',
    coverage: ['Company Brain、知识摄取、权限、时效、引用与治理'],
    limitations: '正文提供组织知识系统的工程叙事与作者观察，不代表任何产品实现、权限控制、安全或合规保证；访问控制、更新传播与质量必须由所选系统验证。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-context-offloading',
    canonicalSourceId: 'primary-feishu-context-offloading',
    stage: '上下文外置',
    learningUse: '解释把可恢复细节移到外部状态，并在活动上下文保留稳定引用、检索线索与恢复入口',
    coverage: ['Context offloading、外部状态、恢复引用、活动上下文'],
    limitations: '正文包含产品相关教学观察，不代表当前产品或协议的稳定实现；外置状态也不保证权限隔离、持久化、完整回取或提示注入安全。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-microcompact',
    canonicalSourceId: 'primary-feishu-microcompact',
    stage: '上下文压缩',
    learningUse: '区分消息、工具结果和会话摘要层的压缩位置，并比较各层丢失细节和恢复能力',
    coverage: ['Context compaction、Microcompact、工具结果消隐、摘要检查点'],
    limitations: '正文含逆向观察与日期敏感的产品细节，不代表 Claude Code 或其他产品的公开稳定协议；压缩是否触发、保留哪些字段和能否恢复必须由当前官方资料与实测核验。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-agentfs',
    canonicalSourceId: 'primary-feishu-virtual-filesystem',
    stage: 'AgentFS 与外部状态',
    learningUse: '用 Agent 文件系统理解记忆与产物外置时的 namespace、引用、来源、清理和宿主责任',
    coverage: ['AgentFS、虚拟文件系统、namespace、外部状态、产物引用'],
    limitations: '正文提供虚拟文件系统的工程观察，不代表 AgentFS 产品实现或安全边界；文件抽象不等于 sandbox、持久记忆、权限隔离或删除保证。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-prompt-memory',
    canonicalSourceId: 'primary-feishu-claude-ai-memory',
    stage: '提示词与记忆结构',
    learningUse: '把观测到的提示词和记忆结构作为日期化案例，用来区分活动上下文、产品记忆与隐藏状态',
    coverage: ['Claude.AI 提示词结构、记忆观察、活动上下文与持久状态边界'],
    limitations: '正文属于逆向观察和教学分析，不代表 Claude.AI 当前产品实现或公开协议；隐藏状态可能缺失，存储、权限、删除和召回行为需由当前官方产品资料验证。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-beyond-model',
    canonicalSourceId: 'primary-feishu-beyond-model',
    stage: '模型外部系统',
    learningUse: '说明上下文选择、状态、存储、权限和恢复属于模型外部宿主系统的责任',
    coverage: ['模型外部状态、控制面、存储、权限与恢复责任'],
    limitations: '正文提供责任边界的教学叙事与作者观察，不代表所有产品采用相同实现，也不构成权限、安全或可靠性保证。',
  }),
  primaryBinding({
    id: 'res-context-primary-feishu-tool-truth',
    canonicalSourceId: 'primary-feishu-tool-truth',
    stage: '工具结果与来源',
    learningUse: '区分模型看到的工具 transcript 与宿主保存的真实执行结果、调用身份和来源证据',
    coverage: ['工具 transcript、调用身份、执行结果、来源与宿主记录'],
    limitations: '正文提供工具调用的教学观察，不代表当前产品或工具协议的稳定实现；消息字段、执行权限和结果真实性必须由宿主与官方协议验证。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-memory',
    canonicalSourceId: 'primary-javaguide-agent-memory',
    stage: 'Agent 记忆',
    learningUse: '建立短期与长期记忆、情景与语义信息、写入更新和记忆演化的课程骨架',
    coverage: ['Agent memory 分类、写入、更新、召回、遗忘与演化'],
    limitations: '文章提供体系化教学框架，不代表模型具有人类认知记忆，也不定义任何产品的持久化、隐私、删除或召回质量保证。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-context',
    canonicalSourceId: 'primary-javaguide-context-engineering',
    stage: 'Context Engineering',
    learningUse: '区分 prompt 与 context，并把指令、历史、工具结果、检索证据和状态组织进有限输入预算',
    coverage: ['Prompt 与 Context 区别、上下文组件、预算、选择、压缩与隔离'],
    limitations: '文章提供上下文工程的教学体系，不代表统一行业标准；窗口上限、缓存、压缩与产品行为需由当前官方资料验证。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-rag',
    canonicalSourceId: 'primary-javaguide-rag-basis',
    stage: 'RAG 基础',
    learningUse: '以摄取、索引、检索、上下文组装、生成和评估阶段建立 RAG 主干',
    coverage: ['RAG 基础、索引、检索、生成、评估与系统边界'],
    limitations: '文章提供体系化教学叙事，不是通用架构或质量保证；算法效果与工程参数必须由论文、官方实现资料和目标语料评测核验。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-document-processing',
    canonicalSourceId: 'primary-javaguide-rag-document-processing',
    stage: '文档摄取与切分',
    learningUse: '从解析、清洗、结构识别到 chunk 和多模态处理建立可追溯摄取管线',
    coverage: ['文档解析、清洗、结构切分、语义切分、parent-child chunk 与元数据'],
    limitations: '文章给出文档处理方法综述，不代表任意解析器或多模态工具的产品实现；切分质量依赖文档类型、问题分布与评测。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-vector-store',
    canonicalSourceId: 'primary-javaguide-rag-vector-store',
    stage: '向量索引与数据库',
    learningUse: '理解向量索引算法和向量数据库分别承担的召回、过滤、更新与运维责任',
    coverage: ['向量索引、ANN、向量数据库、召回延迟、过滤与更新权衡'],
    limitations: '文章提供算法与产品类型综述，不代表任何索引在本语料上的性能保证；召回、延迟、内存和更新成本依赖数据、硬件、实现与参数。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-rag-optimization',
    canonicalSourceId: 'primary-javaguide-rag-optimization',
    stage: '检索与重排优化',
    learningUse: '按召回、融合、重排、去重、上下文打包和生成阶段定位并优化 RAG',
    coverage: ['Hybrid retrieval、query rewrite、reranking、去重、多样性与上下文优化'],
    limitations: '文章提供系统调优叙事，不代表配方或收益可跨语料复现；必须先定位失败阶段，再用目标查询集和受控实验验证。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-rag-update',
    canonicalSourceId: 'primary-javaguide-rag-knowledge-update',
    stage: '知识更新',
    learningUse: '把文档身份、内容哈希、版本、去重、删除传播、增量更新与全量重建放入同一生命周期',
    coverage: ['知识库更新、版本控制、内容哈希、去重、删除与重建'],
    limitations: '文章提供更新策略的教学框架，不代表具体存储拓扑的事务或一致性保证；阈值、传播延迟和重建条件必须由系统实测。',
  }),
  primaryBinding({
    id: 'res-context-primary-javaguide-graphrag',
    canonicalSourceId: 'primary-javaguide-graphrag',
    stage: 'GraphRAG',
    learningUse: '识别关系密集和全局问题何时值得引入实体关系图、社区摘要与图检索',
    coverage: ['GraphRAG、实体关系、社区摘要、局部与全局查询、向量检索边界'],
    limitations: '文章提供 GraphRAG 体系化教学，不代表它自动优于向量检索；收益取决于图构建质量、语料结构、查询类型、成本与评测。',
  }),
];

const resources = [
  ...verificationResources,
  ...primaryResources,
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
  const id = 'context-' + suffix;
  return {
    id,
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
    knowledgeNote: contextRagMemoryNotes[id],
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
    resourceIds: [
      'res-context-anthropic-engineering',
      'res-context-lost-middle',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
      'res-context-primary-feishu-prompt-memory',
      'res-context-primary-feishu-beyond-model',
    ],
    exercise: { title: '绘制五层信息地图', brief: '把一组系统指令、消息、文档、运行游标和用户偏好放入正确层次。', steps: ['逐项标记作用域、所有者、生命周期、来源和能否直接进入本轮 prompt', '为可投影项写选择条件；为外置 transcript、工具产物和文档写稳定引用、权限、哈希、回取与 unavailable 处理'], deliverable: '一张五层分类表、一份本轮 context manifest 和一条可验证的外置回取记录。' },
    quizzes: [
      quiz('context-01-1', '哪一项最准确描述 checkpoint？', ['跨会话用户偏好库', '特定 run 的控制位置与恢复提交点', '本轮全部检索证据'], 1, 'Checkpoint 服务运行恢复，不等于长期记忆，也不会自动进入 prompt context。'),
      quiz('context-01-2', '把 transcript 或工具产物外置后，怎样才算可安全恢复？', ['只记一个临时文件名', '保留稳定引用、内容哈希、权限检查与 unavailable 失败状态', '默认它会永久存在并自动进入 prompt'], 1, 'Offloading 只降低活动窗口占用；恢复仍要验证引用、内容身份、权限与不可用分支。'),
    ],
    completionCriteria: ['能用作用域与生命周期准确区分五类信息对象', '能解释每个上下文条目的来源、投影、排除原因和外置细节的受控回取边界'],
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
    resourceIds: [
      'res-context-anthropic-engineering',
      'res-context-lost-middle',
      'res-context-openai-compaction',
      'res-context-practical-guide',
      'res-context-youtube',
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
      'res-context-primary-feishu-microcompact',
    ],
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
    resourceIds: [
      'res-context-openai-compaction',
      'res-context-langchain-memory',
      'res-context-coala',
      'res-context-openai-data',
      'res-context-primary-feishu-microcompact',
      'res-context-primary-feishu-prompt-memory',
      'res-context-primary-javaguide-memory',
    ],
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
    resourceIds: [
      'res-context-openai-embeddings',
      'res-context-dpr',
      'res-context-openai-retrieval',
      'res-context-rag-paper',
      'res-context-rag-scratch',
      'res-context-llm-universe',
      'res-context-primary-javaguide-rag',
      'res-context-primary-javaguide-document-processing',
      'res-context-primary-feishu-company-brain',
    ],
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
    objectives: ['根据查询和语料特征选择 sparse、dense 或 hybrid retrieval', '联合评测 ANN recall、尾延迟、内存、更新成本，并用 filter、threshold、top-k 和 query rewrite 控制候选'],
    concepts: ['Sparse retrieval', 'Dense retrieval', 'Hybrid retrieval', 'ANN tradeoff', 'Metadata filter', 'Query rewrite'],
    explanations: [
      { heading: '召回器的优势来自不同信号', body: 'Sparse retrieval 对产品编号、专有名词和原词匹配透明有效；dense retrieval 擅长语义改写，却可能错过稀有精确词。dense 不一定优于 sparse，领域漂移、语言和 embedding 选择都会改变结果；hybrid 可用 RRF 等方法融合不同排序而不假定原始分数同尺度。Dense 通道采用 ANN 时还要在同一目标查询集和硬件上联合报告 recall、p95 latency、内存与更新成本，不能只调高搜索深度后宣布“效果更好”。', keyPoints: ['方法选择应由查询类型与离线评测支持', '混合检索保留互补信号但仍需稳定的融合规则', 'ANN 配置要同时验收召回、尾延迟、内存和更新路径'] },
      { heading: '过滤与改写都会改变可召回集合', body: 'Metadata filter 应在排序前限制权限、版本、语言和时间范围；threshold 控制最低相关性，top-k 控制候选数量。Query rewrite 能补全缩写或拆分意图，也可能引入用户未表达的假设，所以必须记录原查询、改写结果和各阶段候选，区分语料不存在、漏召、误过滤和排序靠后。', keyPoints: ['无结果不只意味着 corpus 没有答案', '改写与过滤应可回放，避免把召回错误藏在最终列表中'] },
    ],
    resourceIds: [
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
    ],
    exercise: { title: '运行混合检索诊断', brief: '在固定小语料和硬件上比较 sparse、dense、hybrid 与三组 ANN 配置，并定位候选消失的阶段。', steps: ['应用版本、部门和语言过滤，记录 sparse/dense 分数、RRF 名次、threshold、top-k，以及 ANN recall@10、p95 latency、内存和更新成本', '保留原查询并执行受控 query rewrite，比较每次 trace，分别标记不存在、未召回、被过滤、排序靠后和改写偏移'], deliverable: '一份可回放 retrieval trace、一张 ANN 联合权衡表和包含 query rewrite 风险的选择说明。', experiment: 'hybrid-retrieval' },
    quizzes: [
      quiz('context-05-1', '包含精确产品编号的查询通常先重视哪种信号？', ['Sparse 词法匹配', '随机向量', '只用生成模型猜测'], 0, '精确编号和稀有词通常适合词法召回，但仍应通过真实数据验证。'),
      quiz('context-05-2', '比较 ANN 配置时为什么不能只看 recall@10？', ['更高 recall 会自动降低全部成本', '还要在同一查询集与硬件上联合检查 p95 latency、内存和更新成本', 'ANN 不需要任何真实查询评测'], 1, '搜索更深可能提高召回，也会改变尾延迟、资源占用和更新路径；课程数字只是合成 fixture，生产配置必须复测。'),
    ],
    completionCriteria: ['能按查询特征解释 sparse、dense 与 hybrid 的选择并计算 RRF 名次贡献', '能用同一评测切片联合比较 ANN recall、p95 latency、内存和更新成本，并通过 trace 定位过滤、阈值、排序与 query rewrite 问题'],
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
    resourceIds: [
      'res-context-rrf',
      'res-context-bert-reranker',
      'res-context-contextual-retrieval',
      'res-context-rag-paper',
      'res-context-openai-citations',
      'res-context-alce',
      'res-context-ragas',
      'res-context-ragflow',
      'res-context-primary-javaguide-rag-optimization',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-tool-truth',
    ],
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
    summary: '为跨会话信息建立准入、作用域、来源、相关性衰减、冲突、过期和删除策略，而不是自动永久保存聊天。',
    objectives: ['设计长期记忆 admission policy 与作用域隔离规则', '区分 relevance decay、TTL expiry、supersession、deletion，并处理召回后的上下文投影'],
    concepts: ['Semantic memory', 'Episodic memory', 'Procedural memory', 'Admission policy', 'Relevance decay', 'TTL', 'Supersession'],
    explanations: [
      { heading: '记忆类型是应用建模标签', body: 'Semantic/profile memory 表达相对稳定的事实或偏好，episodic memory 表达一次经历及其时间，procedural memory 表达可复用流程。它们是应用层分类，不证明模型内部拥有相同机制。写入前应判断用户意图、稳定性、敏感性、主体、scope、来源和置信度，不能把每条聊天自动保存为永久记忆。', keyPoints: ['显式保存请求与系统推断应采用不同准入门槛', '敏感、一次性或低置信度信息通常应拒绝或缩短 TTL'] },
      { heading: '长期记忆必须拥有完整生命周期', body: '长期记忆必须可更新、可过期、可删除。Relevance decay 只是让仍有效但逐渐陈旧的记录在排序中降权，不会自动令其失效；TTL expiry 到点后停止召回；supersession 让已接受的新值取代旧值；deletion 则按主体或政策要求阻断使用。重复写入应 no-op，召回还要校验 subject、scope、有效期、来源与相关性，并让当前显式输入优先于旧记忆。', keyPoints: ['召回的是经策略筛选的投影，不是整库记忆', 'Decay 改变相关性排序，TTL、supersession 和 deletion 分别改变有效状态或使用许可', '纠正、过期和删除都要留下受控的生命周期结果与原因'] },
    ],
    resourceIds: [
      'res-context-langchain-memory',
      'res-context-coala',
      'res-context-memgpt',
      'res-context-memorybank',
      'res-context-longmemeval',
      'res-context-openai-data',
      'res-context-hello-agents',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
    ],
    exercise: { title: '模拟个人助理记忆生命周期', brief: '为显式偏好、一次性行程、敏感字段、重复观察和用户纠正决定写入、衰减、失效与召回。', steps: ['按 admission policy 执行 reject、store、no-op 或 supersede，并记录 provenance、confidence、scope 和 TTL', '推进时间，分别应用合成 relevance decay、TTL expiry 与 delete，再从不同 subject/scope 召回；核对 decay 只影响有效候选排序，而 expired、superseded、deleted 与越权记录不会投影'], deliverable: '一份记忆事件日志、含 decay score 与生命周期状态的有效记录表，以及本轮 memory projection。', experiment: 'memory-lifecycle' },
    quizzes: [
      quiz('context-07-1', '一条候选记忆 salience 很高时，哪种处理正确？', ['直接永久保存并跳过用户同意', '仍先检查 consent、sensitivity、subject、scope 与 confidence，再输出带原因的准入动作', '把 salience 当成事实置信度'], 1, 'Salience 只帮助安排候选审查和相关性优先级，不能替代 consent、权限、敏感性或 confidence。'),
      quiz('context-07-2', 'Relevance decay 与 TTL expiry 的关键区别是什么？', ['Decay 让仍有效记录降权，TTL 到期则停止有效召回', '两者都会立刻物理擦除所有备份', 'Decay 会自动创建 superseding 新值'], 0, 'Relevance decay 调整有效候选的排序分数；TTL expiry 改变可召回状态，supersession 与 deletion 又是另外两类生命周期动作。'),
    ],
    completionCriteria: ['能为不同信息给出可解释的记忆准入与作用域决定', '能用 trace 区分 relevance decay、TTL expiry、supersession、deletion，并证明失效、删除和跨主体隔离在召回时生效'],
  }),
  lesson({
    order: 8,
    title: 'RAG 与记忆综合设计及故障定位',
    summary: '把状态、语料、检索、证据和记忆串成可追溯架构，并沿数据流定位回答错误所在层。',
    objectives: ['设计来源清楚、预算有界且记忆有生命周期的综合架构，并区分 RAG、fine-tuning 与长期记忆职责', '按查询类型选择 GraphRAG 分支、按变更类型选择增量更新或全量重建，并沿 source 到 answer 定位故障'],
    concepts: ['Layered diagnosis', 'Data provenance', 'Staleness', 'Retrieval evaluation', 'Generation faithfulness'],
    explanations: [
      { heading: '综合架构保持层间契约', body: '源文档经摄取、版本化、chunk 和索引生成候选，再经过滤、融合、重排、去重和打包形成 evidence packet；会话状态与长期记忆分别投影后，与指令和当前请求共同进入 prompt context。每一箭头都记录输入版本、输出 ID、预算、排除原因和 sourceRef。', keyPoints: ['状态、RAG 与记忆通过投影汇合但不混成同一存储', '端到端追踪要能从答案回到 evidence span 与源版本'] },
      { heading: '故障定位从分层反证开始', body: 'RAG 答错时依次检查源文档是否存在且有效、chunk 是否保留语义、候选是否召回、filter 是否误删、rerank 是否降权、打包是否超限、记忆是否冲突，以及生成是否忠实使用证据。RAG 适合动态外部知识，fine-tuning 更适合行为和稳定模式，长期记忆适合主体相关且可治理的跨会话信息。', keyPoints: ['先定位信息在哪一层消失，再调整具体组件', '检索指标、引用检查和生成忠实性需要分开观察'] },
    ],
    resourceIds: [
      'res-context-ragas',
      'res-context-longmemeval',
      'res-context-rag-scratch',
      'res-context-llm-universe',
      'res-context-all-in-rag',
      'res-context-hello-agents',
      'res-context-hf-agentic-rag',
      'res-context-ragflow',
      'res-context-bilibili',
      'res-context-youtube',
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag-update',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-javaguide-rag',
    ],
    exercise: { title: '设计并诊断政策助理', brief: '为企业政策助理画出上下文、RAG、fine-tuning 与记忆职责，并诊断一组错误回答。', steps: ['定义 source、chunk、candidate、GraphRAG 分支、evidence packet、state、memory projection、prompt 和 citation 的接口，并给动态政策、稳定行为与个人偏好分配职责', '针对内容变化与 parser/schema 变化分别演练增量更新和全量重建，再对未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆和不忠实生成逐层给出证据与修复'], deliverable: '一张含职责矩阵和 GraphRAG/update 边界的综合架构图、一份分层故障树和可执行验收清单。' },
    quizzes: [
      quiz('context-08-1', 'RAG 回答错误时首先应怎样诊断？', ['立刻扩大所有 top-k', '沿 source 到 answer 分层检查信息在哪一步失真或消失', '直接改成长期记忆'], 1, '分层 trace 能区分摄取、检索、打包、记忆冲突和生成忠实性问题。'),
      quiz('context-08-2', '何时更适合启用 GraphRAG 并触发全量重建？', ['精确条款查询且正文未变时', '跨实体全局问题，且 parser、chunk schema 或图 schema 已变化时', '只要 top-k 小于十就自动启用并重建'], 1, 'GraphRAG 面向关系密集或全局问题；内容局部变化可增量更新，而 parser、chunk/graph schema 变化通常需要全量重建并重新核验 source span。'),
    ],
    completionCriteria: ['能交付层次清楚、区分 RAG/fine-tuning/memory 且所有投影均可回源的综合架构', '能解释 GraphRAG 路由与增量/全量更新边界，并用分层证据区分检索、打包、记忆与生成故障'],
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
  interviewSpec('iq-context-04-3', 'context-04', '源文档怎样经过摄取管线成为可搜索且可引用的索引？', '依次执行 acquire、parse、normalize、chunk、metadata、embed、index，并在每阶段传递 documentId、version、ACL、hash 与 source span；source document、retrieval unit、citation unit 保持不同身份但可稳定映射。', ['每个派生阶段应保存输入输出 ID、版本和失败状态，使 index 可重建而 source 身份不丢失。', 'Retrieval unit 服务候选召回，citation unit 通常用更精确的原文范围支持主张。'], '把向量记录同时当作完整源文档、全部摄取过程和精确引用。', '哪个阶段最容易丢失表格 span，怎样用契约检测？', '中', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-05-1', 'context-05', 'Sparse、dense、hybrid retrieval 怎么选，RRF 怎样避免混加分数尺度？', '精确词和编号偏 sparse，语义改写可用 dense，异构查询可 hybrid；RRF 用各通道的 1/(k+rank) 名次贡献融合，不直接相加 BM25 与 cosine 原始分数，最终选择仍由真实查询集评测。', ['Dense 不一定优于 sparse，领域与语言会改变表现。', '应能用给定 k 和两路名次计算融合分数，同时说明 RRF 不等于语义 reranker。'], '默认把 dense 当作所有查询的最优方案，或直接相加不同通道原始分数。', '当 k=60 时，怎样计算同一文档在两路排名中的 RRF 贡献？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-05-2', 'context-05', 'top-k、threshold 和 metadata filter 如何配合？', '先用 metadata filter 限制合法候选，再按相关性 threshold 去除弱匹配，最后用 top-k 控制进入后续阶段的数量。', ['次序变化会让结果语义不同，应在 trace 中记录。', 'Top-k 不是最终上下文数量，后面还有重排与预算打包。'], '无结果时只盲目提高 top-k，不检查过滤和阈值。', '权限 filter 与版本 filter 应在哪一层强制？', '高', '进阶', ['Agent 开发', '后端工程']),
  interviewSpec('iq-context-05-3', 'context-05', '怎样选择 ANN 配置而不只追求更高 recall？', '在同一查询切片、语料版本和硬件上联合比较 recall@k、p95 latency、内存与更新成本，再按服务目标选择配置；更深搜索不是免费的通用最优。', ['报告应注明索引类型、构建参数、查询参数、硬件、数据规模与更新时间。', '课程图中的三组数字是合成 fixture，不是供应商 benchmark，生产决策必须复测。'], '只看平均延迟或 recall 单项，就把教学 fixture 外推为生产最优配置。', '如何设计同时约束 recall@10 和 p95 latency 的验收切片？', '中', '深挖', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-1', 'context-06', '为什么需要 reranker？', '首阶段检索以高召回和低成本产生候选，reranker 用更强的查询—文档交互信号改善有限候选的最终顺序。', ['Reranker 不能找回首阶段完全漏掉的文档。', '重排质量与延迟、候选数和领域数据有关。'], '认为 reranker 能修复不存在于候选集的事实。', '候选数扩大时如何权衡 rerank 成本与召回？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-2', 'context-06', '为什么需要去重和多样性？', '重叠 chunk 和同文档旧版本会重复占用预算；去重与多样性选择让有限证据覆盖更多独立来源、方面和冲突观点。', ['去重键应包含 document、version 和 span 语义。', '多样性不能牺牲关键高相关证据，需要明确目标。'], '认为 top-ranked 列表天然没有重复且覆盖全面。', '相邻片段既重复又互补时怎样合并？', '中', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-06-3', 'context-06', '怎样证明 evidence packet 中的工具结果真实可回源，且引用支持答案主张？', '宿主保存真实 observation、callId 与结果 hash，packet 再绑定 sourceId/version/span 和 citationId；最后逐 claim 检查所指 span 的支持、完整性与冲突，不能把模型生成的工具 transcript 或链接存在当作证明。', ['结构 provenance 证明证据身份和调用链，citation correctness/completeness 与 generation faithfulness 仍要分别核验。', '检索内容可能过期、无关或被模型曲解，因此答案带引用仍可能错误。'], '看到工具输出文本或引用标记就把答案视为已验证事实。', '如何为一个数字建立 observation-to-call-to-span-to-claim 核对表？', '高', '深挖', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-1', 'context-07', '什么是长期记忆，什么时候写？', '长期记忆是跨会话、绑定主体和作用域、经准入策略保存并可治理的信息；稳定且未来有用的显式偏好比一次闲聊更适合写入。', ['写入判断考虑意图、稳定性、敏感性、来源、置信度和 TTL。', '不是每条 transcript 都应自动成为永久记忆。'], '把完整聊天历史等同于长期记忆库。', '一次性行程与长期饮食禁忌应分别怎样处理？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-2', 'context-07', 'Semantic、episodic、procedural memory 怎么理解？', 'Semantic/profile 表达相对稳定事实，episodic 表达带时间的经历，procedural 表达可复用流程；它们是应用建模标签。', ['同一信息可因产品目的落入不同类别，需写清使用规则。', '这些标签不证明底层模型具有人类式记忆机制。'], '把论文分类名当作模型内部能力的确定事实。', '用户偏好和一次成功工作流分别属于哪类？', '中', '进阶', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-07-3', 'context-07', '如何区分 relevance decay、TTL expiry、supersession 和 deletion？', 'Decay 只降低仍有效记录的相关性排序；TTL 到点后停止有效召回；supersession 用新值取代旧值并保留来源链；deletion 按主体或政策要求阻断使用并传播到索引、缓存与投影。', ['当前显式输入应优先于逐渐降权或冲突的长期记忆投影，decay 不能替代纠正。', '删除语义要说明逻辑不可召回与物理备份清理的边界；四类动作都要有独立 trace。'], '把衰减分数降到零等同于完成删除，或让过期记录继续参与随机召回。', '怎样证明某条记录只是降权、已经过期、被新值取代或被删除？', '高', '深挖', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-08-1', 'context-08', 'RAG 答错时如何诊断？', '沿 source、chunk、candidate、filter、rank、evidence packet、prompt、memory 和 answer 逐层找出信息消失、过期、冲突或被曲解的位置。', ['每层需要稳定 ID、版本和排除原因才能反证。', '不要用一个端到端分数掩盖检索与生成的不同故障。'], '一遇到错误就改 prompt 或无界扩大 top-k。', '给出语料中存在但未出现在答案里的排查顺序。', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']),
  interviewSpec('iq-context-08-2', 'context-08', 'GraphRAG 何时作为检索分支，知识更新何时增量处理或全量重建？', '精确条款或局部语义查询通常先走 sparse/dense/hybrid，跨实体关系或全局聚合问题才考虑 GraphRAG；正文局部变化可增量更新受影响单元，parser、chunk、embedding 或 graph schema 变化需要全量重建。', ['两条分支都必须继承 ACL、sourceVersion、delete propagation 与 source span，并进入共同证据核验。', 'GraphRAG 收益依赖图构建和查询分布，不是向量检索的自动替代品。'], '把 GraphRAG 当成所有查询的默认替代品，或在 schema 变化后只更新一个旧向量。', '怎样用 query slice 和版本覆盖核对证明路由与重建选择正确？', '高', '基础', ['Agent 开发', 'AI 应用']),
  interviewSpec('iq-context-08-3', 'context-08', '请设计上下文、RAG 与记忆架构，并说明 RAG、fine-tuning、长期记忆的职责。', '设计应把动态可引用知识交给版本化 RAG，把稳定行为模式留给 fine-tuning，把主体相关且可治理的信息交给长期记忆；会话 state、这些投影与证据按预算汇入 prompt，并保留端到端 trace。', ['说明 source/index 更新、记忆写入/过期/删除、权限、引用和失败降级。', '验收要分别覆盖职责分配、召回、证据支持、生成忠实性和记忆生命周期。'], '只画向量数据库到模型的一条线，或用训练参数保存频繁变化的政策事实。', '当旧记忆与最新政策证据冲突时如何决胜并记录？', '高', '深挖', ['Agent 开发', 'AI 应用', '后端工程']),
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

const sourceImpactClaims = [
  {
    id: 'prompt-stuffing-is-context-engineering',
    lessonId: 'context-01',
    sectionId: 'projection-pipeline',
    statement: '把所有可用文本直接塞进提示词不等于上下文工程；投影还必须管理来源、选择、预算、失效和排除原因。',
    sourceIds: [
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
      'res-context-anthropic-engineering',
    ],
  },
  {
    id: 'fixed-context-ratio-is-universal',
    lessonId: 'context-02',
    sectionId: 'context-engineering-budget',
    statement: '上下文预算需要显式分桶与输出预留，但任何固定比例都只是工作负载配置，不能当作跨模型和任务的普适最优值。',
    sourceIds: [
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
      'res-context-anthropic-engineering',
    ],
  },
  {
    id: 'summary-is-canonical-source-of-truth',
    lessonId: 'context-03',
    sectionId: 'summary-is-lossy',
    statement: '会话摘要是带覆盖范围和来源指针的有损派生视图，不应覆盖 transcript 或 canonical conversation state 成为唯一事实源。',
    sourceIds: [
      'res-context-primary-feishu-microcompact',
      'res-context-primary-feishu-prompt-memory',
      'res-context-openai-compaction',
    ],
  },
  {
    id: 'vector-database-is-complete-rag',
    lessonId: 'context-04',
    sectionId: 'separate-source-retrieval-and-citation-units',
    statement: '向量数据库只承载检索表示和索引能力的一部分，完整 RAG 还需要源文档治理、摄取、切分、版本、权限、证据打包与引用。',
    sourceIds: [
      'res-context-primary-javaguide-rag',
      'res-context-primary-javaguide-document-processing',
      'res-context-rag-paper',
    ],
  },
  {
    id: 'dense-retrieval-always-dominates',
    lessonId: 'context-05',
    sectionId: 'start-with-complementary-retrieval-signals',
    statement: 'Dense retrieval 不会在所有查询和语料上稳定优于 sparse；精确词法与语义信号应按真实查询切片评测并以明确规则融合。',
    sourceIds: [
      'res-context-primary-javaguide-vector-store',
      'res-context-primary-javaguide-rag-optimization',
      'res-context-beir',
    ],
  },
  {
    id: 'retrieval-success-guarantees-grounding',
    lessonId: 'context-06',
    sectionId: 'build-an-evidence-packet-and-citation-manifest',
    statement: '候选被召回或答案带有引用都不保证生成忠实；证据包必须保留真实观察、版本和 span，并逐条核对 claim 支持关系。',
    sourceIds: [
      'res-context-primary-javaguide-rag-optimization',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-tool-truth',
      'res-context-openai-citations',
    ],
  },
  {
    id: 'transcript-is-long-term-memory',
    lessonId: 'context-07',
    sectionId: 'separate-memory-from-history',
    statement: 'Transcript 记录历史事件，长期记忆只保存经准入、绑定主体和作用域且可更新删除的跨会话信息，两者不能直接等同。',
    sourceIds: [
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
      'res-context-coala',
    ],
  },
  {
    id: 'graphrag-replaces-vector-retrieval',
    lessonId: 'context-08',
    sectionId: 'separate-five-system-objects',
    statement: 'GraphRAG 适合关系密集或全局性查询，但它是可选检索分支，不会自动替代 sparse、dense、hybrid 或原文证据核验。',
    sourceIds: [
      'res-context-primary-javaguide-graphrag',
      'res-context-primary-javaguide-rag',
      'res-context-primary-feishu-company-brain',
      'res-context-ragas',
    ],
  },
];

export function resolveSourceImpactClaim(targetId) {
  if (typeof targetId !== 'string' || !targetId.startsWith('claim:')) {
    throw new TypeError('source-impact claim target must start with claim:');
  }
  const claimId = targetId.slice('claim:'.length);
  const claim = sourceImpactClaims.find(({ id }) => id === claimId);
  if (!claim) {
    throw new RangeError(`Unknown source-impact claim: ${targetId}`);
  }
  return claim;
}

function sourceImpactClaimTarget(claimId) {
  const targetId = `claim:${claimId}`;
  resolveSourceImpactClaim(targetId);
  return targetId;
}

const sourceImpactAudit = [
  {
    decisionId: 'impact-context-01-context-projection',
    lessonId: 'context-01',
    resourceId: 'res-context-primary-javaguide-context',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('prompt-stuffing-is-context-engineering'),
    contribution: 'corrected',
    summary: '把“上下文工程就是把更多文本塞入提示词”修正为有来源、预算和失效规则的投影系统。',
    rationale: '该体系化叙事用于建立课程主干，具体窗口、压缩和产品行为仍需官方资料与目标模型实测。',
  },
  {
    decisionId: 'impact-context-02-budget-boundary',
    lessonId: 'context-02',
    resourceId: 'res-context-primary-feishu-context-offloading',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('fixed-context-ratio-is-universal'),
    contribution: 'deepened',
    summary: '把上下文预算深化为固定指令、历史、工具结果、检索证据、草稿和输出预留的显式分桶。',
    rationale: '来源支持外置和活动上下文边界，但课程拒绝把任何分桶数字提升为跨模型的通用最优比例。',
  },
  {
    decisionId: 'impact-context-03-lossy-summary',
    lessonId: 'context-03',
    resourceId: 'res-context-primary-feishu-microcompact',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('summary-is-canonical-source-of-truth'),
    contribution: 'corrected',
    summary: '把流畅摘要从“新事实源”降级为带事件游标、已知遗漏和原文回取入口的有损派生视图。',
    rationale: '文章中的产品观察具有日期和逆向边界，课程只采用压缩层次，不宣称当前产品协议或无损恢复。',
  },
  {
    decisionId: 'impact-context-04-rag-pipeline',
    lessonId: 'context-04',
    resourceId: 'res-context-primary-javaguide-document-processing',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('vector-database-is-complete-rag'),
    contribution: 'deepened',
    summary: '把向量存储前后的 acquire、parse、normalize、chunk、metadata、embed 和 index 串成可追溯管线。',
    rationale: '教学综述用于组织处理阶段，具体解析器能力、切分参数和质量收益仍必须在目标文档与查询集验证。',
  },
  {
    decisionId: 'impact-context-05-retrieval-signals',
    lessonId: 'context-05',
    resourceId: 'res-context-primary-javaguide-rag-optimization',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('dense-retrieval-always-dominates'),
    contribution: 'corrected',
    summary: '把“稠密检索必然更强”修正为按查询切片比较 sparse、dense、hybrid 与融合规则。',
    rationale: '来源提供优化导航而非跨语料收益保证，课程用 BEIR 等研究边界和本地评测约束方法选择。',
  },
  {
    decisionId: 'impact-context-06-evidence-grounding',
    lessonId: 'context-06',
    resourceId: 'res-context-primary-feishu-tool-truth',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('retrieval-success-guarantees-grounding'),
    contribution: 'deepened',
    summary: '把证据包深化为同时保留宿主真实 observation、callId、结果哈希、版本与精确 span 的清单。',
    rationale: '工具 transcript 的教学观察不构成执行真实性或协议保证，因此课程要求宿主记录并逐 claim 核验。',
  },
  {
    decisionId: 'impact-context-07-memory-boundary',
    lessonId: 'context-07',
    resourceId: 'res-context-primary-javaguide-memory',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('transcript-is-long-term-memory'),
    contribution: 'corrected',
    summary: '把长期记忆从聊天历史集合收紧为经准入、绑定主体与 scope、拥有过期更正删除能力的信息。',
    rationale: '记忆分类只作为应用建模标签，不支持人类认知类比，也不证明产品隐私、隔离或删除承诺。',
  },
  {
    decisionId: 'impact-context-08-graphrag-boundary',
    lessonId: 'context-08',
    resourceId: 'res-context-primary-javaguide-graphrag',
    scope: 'claim',
    targetId: sourceImpactClaimTarget('graphrag-replaces-vector-retrieval'),
    contribution: 'corrected',
    summary: '把 GraphRAG 从向量检索替代品修正为面向关系密集与全局问题的可选候选生成分支。',
    rationale: 'GraphRAG 收益依赖图构建、语料和查询类型，最终政策主张仍须回到有效源版本和精确 span。',
  },
];

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
  sourceImpactClaims,
  sourceImpactAudit,
  outcomeRegistry: contextRagMemoryOutcomeRegistry,
});
