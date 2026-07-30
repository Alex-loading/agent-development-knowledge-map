export const PRIMARY_SOURCE_FAMILIES = Object.freeze([
  'feishu-harness-101',
  'javaguide-ai',
]);

const RETRIEVED_AT = '2026-07-30';

function createPrimaryReference({
  id,
  title,
  canonicalUrl,
  sourceFamily,
  publisherOrAuthor,
  contentHash,
  updatedAt = null,
  mediaDecision,
}) {
  return Object.freeze({
    id,
    title,
    canonicalUrl,
    sourceFamily,
    sourceTier: 'primary-narrative',
    publisherOrAuthor,
    bodyAccess: 'full',
    retrievedAt: RETRIEVED_AT,
    updatedAt,
    contentHash,
    mediaDecision,
  });
}

const feishuReference = (metadata) => createPrimaryReference({
  ...metadata,
  sourceFamily: 'feishu-harness-101',
  publisherOrAuthor: 'Harness 101',
  mediaDecision: 'permission-review-required',
});

const JAVAGUIDE_UPDATED_AT = Object.freeze({
  'https://javaguide.cn/ai/': '2026-07-19',
  'https://javaguide.cn/ai/ai-core-concepts.html': '2026-07-19',
  'https://javaguide.cn/ai/interview-questions/ai-interview-guide.html': '2026-05-18',
  'https://javaguide.cn/ai/interview-questions/llm-interview-questions.html': '2026-05-18',
  'https://javaguide.cn/ai/interview-questions/agent-interview-questions.html': '2026-05-18',
  'https://javaguide.cn/ai/interview-questions/rag-interview-questions.html': '2026-05-18',
  'https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html': '2026-05-18',
  'https://javaguide.cn/ai/llm-basis/llm-operation-mechanism.html': '2026-07-06',
  'https://javaguide.cn/ai/llm-basis/llm-api-engineering.html': '2026-07-06',
  'https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html': '2026-06-16',
  'https://javaguide.cn/ai/llm-basis/llm-evaluation.html': '2026-07-19',
  'https://javaguide.cn/ai/agent/agent-basis.html': '2026-06-07',
  'https://javaguide.cn/ai/agent/agent-memory.html': '2026-05-21',
  'https://javaguide.cn/ai/agent/prompt-engineering.html': '2026-06-16',
  'https://javaguide.cn/ai/agent/context-engineering.html': '2026-06-25',
  'https://javaguide.cn/ai/agent/skills.html': '2026-07-06',
  'https://javaguide.cn/ai/agent/mcp.html': '2026-05-21',
  'https://javaguide.cn/ai/agent/harness-engineering.html': '2026-05-21',
  'https://javaguide.cn/ai/agent/workflow-graph-loop.html': '2026-05-18',
  'https://javaguide.cn/ai/agent/loop-engineering.html': '2026-06-17',
  'https://javaguide.cn/ai/rag/rag-basis.html': '2026-05-25',
  'https://javaguide.cn/ai/rag/rag-document-processing.html': '2026-06-16',
  'https://javaguide.cn/ai/rag/rag-vector-store.html': '2026-05-25',
  'https://javaguide.cn/ai/rag/rag-knowledge-update.html': '2026-05-18',
  'https://javaguide.cn/ai/rag/graphrag.html': '2026-06-16',
  'https://javaguide.cn/ai/rag/rag-optimization.html': '2026-06-16',
  'https://javaguide.cn/ai/system-design/ai-application-architecture.html': '2026-06-16',
  'https://javaguide.cn/ai/system-design/llm-gateway.html': '2026-06-16',
  'https://javaguide.cn/ai/system-design/ai-voice.html': '2026-06-16',
  'https://javaguide.cn/ai/interview-questions/': '2026-05-27',
  'https://javaguide.cn/ai/llm-basis/': '2026-05-27',
  'https://javaguide.cn/ai/agent/': '2026-06-17',
  'https://javaguide.cn/ai/rag/': '2026-05-27',
  'https://javaguide.cn/ai/system-design/': '2026-06-16',
});

const javaGuideReference = (metadata) => createPrimaryReference({
  ...metadata,
  sourceFamily: 'javaguide-ai',
  publisherOrAuthor: 'JavaGuide',
  updatedAt: JAVAGUIDE_UPDATED_AT[metadata.canonicalUrl] ?? null,
  mediaDecision: 'asset-level-review-required',
});

export const primaryReferences = Object.freeze([
  feishuReference({
    id: 'primary-feishu-harness-101',
    title: 'Harness 101 🔥🔥🔥',
    canonicalUrl: 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe',
    contentHash: 'sha256:5d0a01bc21ddf4f4b0b0c280f4ad7bda210419af07e63ad326ac3a1f8c5b73a4',
  }),
  feishuReference({
    id: 'primary-feishu-react-loop',
    title: 'Harness 101：从 ReAct Loop 讲起',
    canonicalUrl: 'https://my.feishu.cn/wiki/N94ZwtUv4iVsUtkvWAYchNKWnhb',
    contentHash: 'sha256:6bfe7ed505a5ee114020ed02f9e1a788ecba035f1039ad5e7a5b3b03a1e68d0e',
  }),
  feishuReference({
    id: 'primary-feishu-beyond-model',
    title: 'Harness 101：模型之外的全部',
    canonicalUrl: 'https://my.feishu.cn/wiki/Y5jYww4MLiL1ulkwTL6cf6Drnbc',
    contentHash: 'sha256:7856ac71e241f10e38aaa4efaa51ff21ccdf972ede7e861037da702080cdf999',
  }),
  feishuReference({
    id: 'primary-feishu-loop-engineering-intro',
    title: 'Harness 101：从零认识 Loop Engineering',
    canonicalUrl: 'https://my.feishu.cn/wiki/SzR6wH3cXi87PPk01NbcaI1EnAc',
    contentHash: 'sha256:ad31fd3ffccb95865499afae49f86b0fb5e2f6379def7ca2241af28b94b39f2f',
  }),
  feishuReference({
    id: 'primary-feishu-react-orchestration',
    title: 'Harness 101：Loop Engineering—从 ReAct 到 Orchestration',
    canonicalUrl: 'https://my.feishu.cn/wiki/ToaRw8BAUiAyFFkR3EAc05atnsg',
    contentHash: 'sha256:60a0939949de68a6a0a1cc19cbebe1a4e81cb63483bda3b10070929bc9b93e3d',
  }),
  feishuReference({
    id: 'primary-feishu-dynamic-workflow',
    title: 'Harness 101：复刻Dynamic Workflow(含代码)',
    canonicalUrl: 'https://my.feishu.cn/wiki/TM25wR9ozih8yRkaAVKcFjP1nMq',
    contentHash: 'sha256:0209049db9253366e960da649d2f8b4bd1c89393063aaabcb3e2437597e3cec5',
  }),
  feishuReference({
    id: 'primary-feishu-agent-version-drifting',
    title: 'Harness 101：Agent Version Drifting',
    canonicalUrl: 'https://my.feishu.cn/wiki/XLBWwHi4gipKOpk9R3Bc5KrJnye',
    contentHash: 'sha256:a841c094ff30af4cb4b8e58a8d461bb71f87ed12297f0ad413c6cd6a4f3dee12',
  }),
  feishuReference({
    id: 'primary-feishu-tool-truth',
    title: 'Harness 101：工具的真相',
    canonicalUrl: 'https://my.feishu.cn/wiki/IiZpwiYOziJnfEknS4FcfJDCnib',
    contentHash: 'sha256:108e33a4d832ed4dfddb943fea6686028f86c543244b9152833850e773da1d50',
  }),
  feishuReference({
    id: 'primary-feishu-company-brain',
    title: 'Harness 101：Company Brain',
    canonicalUrl: 'https://my.feishu.cn/wiki/OAagwqqaUi3bxwkHAjYc6TFsnoY',
    contentHash: 'sha256:fcfaf3584ccc31126228a139ba6d600aa63cd7108231fb00ff8f22cc7e23a643',
  }),
  feishuReference({
    id: 'primary-feishu-context-offloading',
    title: 'Harness 101：Context Offloading 机制',
    canonicalUrl: 'https://my.feishu.cn/wiki/NDeHwSStnilQ83kX0awcQxUlnld',
    contentHash: 'sha256:dce31b32d9b7a9bb3afb1d92af7c3e7f6df36da99c2b109470a8d12f639439de',
  }),
  feishuReference({
    id: 'primary-feishu-microcompact',
    title: 'Harness 101：Claude Code 的三种上下文压缩与 Microcompact 的秘密',
    canonicalUrl: 'https://my.feishu.cn/wiki/YSlhwnb5pia6q6kGnU0ckXSZnWe',
    contentHash: 'sha256:dfbba4554ec93b34bc68aa09120706547b85ace52117777d7e38349339e94f97',
  }),
  feishuReference({
    id: 'primary-feishu-virtual-filesystem',
    title: 'Harness 101：写给 Agent 的虚拟文件系统',
    canonicalUrl: 'https://my.feishu.cn/wiki/EJ3TwSP8UinTPmkE08icTvhNneg',
    contentHash: 'sha256:b2c612ad00c2e190e3ed319e8d68e15bd3e1c56038e7017671167bd5f119bb83',
  }),
  feishuReference({
    id: 'primary-feishu-claude-code-tools',
    title: 'Harness 101：Claude Code Agent 里的常用工具一览',
    canonicalUrl: 'https://my.feishu.cn/wiki/RI28wA2FIiHtork7dE5ckxDJnCb',
    contentHash: 'sha256:d12d94b561c10a9e410761e813fa56dc41f7e8409a0ad507415a1b04bb0dd63b',
  }),
  feishuReference({
    id: 'primary-feishu-claude-ai-memory',
    title: 'Harness 101：Claude.AI 提示词与记忆结构解析',
    canonicalUrl: 'https://my.feishu.cn/wiki/YxcxwO0f5iyJIXkCooscCtZKnVg',
    contentHash: 'sha256:c85b2574090b71f286b79bfc8fc1fc996eddcf03b46ab7f8e770fd2e82977b42',
  }),
  feishuReference({
    id: 'primary-feishu-autonomous-evolution',
    title: 'Harness 101：从 for 循环到自治系统的进化之路',
    canonicalUrl: 'https://my.feishu.cn/wiki/OU0mw8Pfaik3Kqk3JUxcT660nwf',
    contentHash: 'sha256:c05d7c010de13cd64d3e485615866c2f0e2f8f46b8c4a04ab54d11b08514c37b',
  }),
  feishuReference({
    id: 'primary-feishu-agent-install-md',
    title: 'Harness 101：专为 Agent 设计的 Install.md',
    canonicalUrl: 'https://my.feishu.cn/wiki/USSRwjtlvidcD5knMrOcPDMSnIg',
    contentHash: 'sha256:53e99224a7245121d5aaf00897948f98a93c43fbec80bc78170513ccb6f15bb2',
  }),
  javaGuideReference({
    id: 'primary-javaguide-ai',
    title: 'AI 应用开发知识体系：大模型、Agent、RAG、MCP、Prompt 工程与系统设计 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/',
    contentHash: 'sha256:9d605402a7595ed0c179060850ac760a184640fa922a224bcf60fd42813392f4',
  }),
  javaGuideReference({
    id: 'primary-javaguide-ai-core-concepts',
    title: 'AI 核心概念总览：LLM、Agent、RAG、MCP、Skills 与 ReAct | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/ai-core-concepts.html',
    contentHash: 'sha256:2dda1752898a44746affcc137cabfe3e546067c3428e1a29b1e2d298fa1feb7a',
  }),
  javaGuideReference({
    id: 'primary-javaguide-ai-interview-guide',
    title: '2026 大模型面试题 | Agent 面试题 | RAG 面试题 | AI 应用开发面试指南（含答案与图解） | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/ai-interview-guide.html',
    contentHash: 'sha256:22228787b8cff9312bc293c9f000e3a8f5e372d6bcd23d03919489cd02309a82',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-interview',
    title: '大模型基础面试题总结 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/llm-interview-questions.html',
    contentHash: 'sha256:a70d1314689370ea8c5eb0e9be4be9d88dc9f2495fffdc3c15fb85f7039108ab',
  }),
  javaGuideReference({
    id: 'primary-javaguide-agent-interview',
    title: 'AI Agent 面试题总结 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/agent-interview-questions.html',
    contentHash: 'sha256:01321bb29a45b968a3bbfe03616a17a1cdfea6232c177377888a423e6e4d20ab',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-interview',
    title: 'RAG 面试题总结 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/rag-interview-questions.html',
    contentHash: 'sha256:c86af0ab2d63200733e57f59a5ec192e904876f6989f2fc3d7d37054e95ac1ab',
  }),
  javaGuideReference({
    id: 'primary-javaguide-system-design-interview',
    title: 'AI 系统设计面试题总结 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html',
    contentHash: 'sha256:db0eb98c25ea9963f407b8750ab0028fbc158a1399c4c47944ae069a894b1409',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-operation-mechanism',
    title: 'LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-operation-mechanism.html',
    contentHash: 'sha256:b455187b2811dc46013f357bfbe6054f8a7400c941f998065199724d68645bec',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-api-engineering',
    title: '大模型 API 调用工程实践：流式输出、重试、限流与结构化返回 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-api-engineering.html',
    contentHash: 'sha256:1a818d2eedab226106cf572fd3f46fd940823e67d3acc9976e2009173db33cb3',
  }),
  javaGuideReference({
    id: 'primary-javaguide-structured-output-function-calling',
    title: '大模型结构化输出：从 JSON 契约到 Function Calling 落地 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html',
    contentHash: 'sha256:8a17de81462fe01a5d9317d2eb60c14395ef90eaf071e0c9d7e40bdf01c9d3a8',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-evaluation',
    title: 'AI 应用评测体系：从 Golden Set 构建到线上灰度闭环 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-evaluation.html',
    contentHash: 'sha256:9ae5f2ba3c6a788a3ba469a5b1ab9d5e5a925d44a4cab0a607970606c06a5c6d',
  }),
  javaGuideReference({
    id: 'primary-javaguide-agent-basis',
    title: 'AI Agent 核心概念：Agent Loop、Plan-and-Execute、A2A、Agentic Workflows、Tools 注册 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/agent-basis.html',
    contentHash: 'sha256:717f9e3270daea12f7eb1739d901a1ff7ff34673b9f28284d352cd3c7b88648e',
  }),
  javaGuideReference({
    id: 'primary-javaguide-agent-memory',
    title: 'AI Agent 记忆系统：短期记忆、长期记忆与记忆演化机制 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/agent-memory.html',
    contentHash: 'sha256:4de5e311cacc5489d2c7e7941df0daac81aa367ec67c9197a5595b5bdcea391f',
  }),
  javaGuideReference({
    id: 'primary-javaguide-prompt-engineering',
    title: '大模型提示词工程（Prompt Engineering）是什么？提示词技巧有哪些？ | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/prompt-engineering.html',
    contentHash: 'sha256:19cc95a0e037fc5c5185f18650fe5c384ee8b98238238f90b87abba54db34ab1',
  }),
  javaGuideReference({
    id: 'primary-javaguide-context-engineering',
    title: '上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？ | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/context-engineering.html',
    contentHash: 'sha256:e1f5b245c1c4572560b28cf1296a4b638868e0bc92025e77aac43d1919b993fa',
  }),
  javaGuideReference({
    id: 'primary-javaguide-agent-skills',
    title: 'Agent Skills 是什么？和 Prompt、MCP 到底差在哪？ | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/skills.html',
    contentHash: 'sha256:38e0acf2fabca276973cd87b557d81ed04d6e657b01218ada08c375342a7d384',
  }),
  javaGuideReference({
    id: 'primary-javaguide-mcp',
    title: '什么是 Model Context Protocol (MCP)？和 Function Calling、Agent 什么关系？ | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/mcp.html',
    contentHash: 'sha256:10897babc2ca6cdd9b17bc23c171fbbbf6bc418d52e2239276d5bb9378f91080',
  }),
  javaGuideReference({
    id: 'primary-javaguide-harness-engineering',
    title: '一文搞懂 Harness Engineering：六层架构、上下文管理与一线团队实战 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/harness-engineering.html',
    contentHash: 'sha256:b59d08d453a12b675570440aca2215c5000556a3afae685507d7b48450200c11',
  }),
  javaGuideReference({
    id: 'primary-javaguide-workflow-graph-loop',
    title: 'AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/workflow-graph-loop.html',
    contentHash: 'sha256:2bdc8a876539f13511f05a2360d193c69967e81f231cb6997e6ba4e42c4d722b',
  }),
  javaGuideReference({
    id: 'primary-javaguide-loop-engineering',
    title: 'Loop Engineering 是什么？为什么说它是新瓶装旧酒？ | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/loop-engineering.html',
    contentHash: 'sha256:312ab6b4c9f8d9e88aa6a14b16cfc59241c5eee1bc64c707d2087316f1afd0f1',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-basis',
    title: '万字详解 RAG 基础概念 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-basis.html',
    contentHash: 'sha256:e41a7f69cfca9e6e4f6c82d7947f6d2cbf7116cb52a0f2359df34aea7ca523a9',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-document-processing',
    title: 'RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-document-processing.html',
    contentHash: 'sha256:07b9c497287e1acf625de6aceba8882421cc719664d3221efe95bf9e379a4bb3',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-vector-store',
    title: '万字详解 RAG 向量索引算法和向量数据库 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-vector-store.html',
    contentHash: 'sha256:fa0258d35ac3cd77bae629f4a912bd961c493eb7f9251f1925a7d95b4095d942',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-knowledge-update',
    title: 'RAG 知识库文档如何更新：增量更新、版本控制、去重与全量重建 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-knowledge-update.html',
    contentHash: 'sha256:d2bd2cc901616ddae10302e8ad10b6d0deaeb50c3ea7fd0b93a75b70dcfa8bc1',
  }),
  javaGuideReference({
    id: 'primary-javaguide-graphrag',
    title: '万字详解 GraphRAG：为什么只靠向量检索撑不起复杂知识问答 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/graphrag.html',
    contentHash: 'sha256:e2d42676ab691fae30817b00020b21c80ffe23a747622293155f931a27510851',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-optimization',
    title: '万字详解 RAG 优化：从召回、重排到上下文工程的系统调优 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-optimization.html',
    contentHash: 'sha256:36465e1e3d26baeb1b9b71eb085db59e247f91ed93d3bab54f94790ab723898d',
  }),
  javaGuideReference({
    id: 'primary-javaguide-ai-application-architecture',
    title: 'AI 应用系统设计：从 Prompt Demo 到生产级架构 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/ai-application-architecture.html',
    contentHash: 'sha256:51adde598c47fd208c8d5b646beac687ba09ef7b1d775c7fca4670f728aa614e',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-gateway',
    title: '大模型网关详解：多模型路由、Fallback、限流与成本控制 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/llm-gateway.html',
    contentHash: 'sha256:06bb8f6bc68f898066b7670313c2e24aaaa5c9221e855968eb57f5da823b5e0a',
  }),
  javaGuideReference({
    id: 'primary-javaguide-ai-voice',
    title: 'AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/ai-voice.html',
    contentHash: 'sha256:907793ce18306621f8544e1dc1e1ed9ffd6ce02be304c377f772a0e4ff48b183',
  }),
  javaGuideReference({
    id: 'primary-javaguide-interview-index',
    title: 'AI 应用开发面试题专题 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/',
    contentHash: 'sha256:83eeb882c76d687b3e338242ef992065a06c8f64a4c2f70bc8d722e7708174d5',
  }),
  javaGuideReference({
    id: 'primary-javaguide-llm-index',
    title: '大模型基础专题：运行机制、API 调用、结构化输出与评测 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/',
    contentHash: 'sha256:656e20d1c25c702a2df71a71dd85d46c2d5a050bd800de4efdb54f1d28817f6d',
  }),
  javaGuideReference({
    id: 'primary-javaguide-agent-index',
    title: 'AI Agent 专题：Agent Loop、Memory、Prompt、Context、MCP 与 Skills | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/agent/',
    contentHash: 'sha256:7e074a3eb27d46a773b335bb54180cc8266774720374971df72a6680d96f685b',
  }),
  javaGuideReference({
    id: 'primary-javaguide-rag-index',
    title: 'RAG 专题：文档处理、向量数据库、GraphRAG、检索优化与知识库更新 | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/rag/',
    contentHash: 'sha256:80c5ff69ef82f33e08cc6e196092c0d3cad06225cbe855eea5ed0b0acddb7ea2',
  }),
  javaGuideReference({
    id: 'primary-javaguide-system-design-index',
    title: 'AI 系统设计专题：生产级架构、模型网关、评测治理与语音 Agent | JavaGuide',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/',
    contentHash: 'sha256:12d1287062dff5086ba8b6b542e89290e7da547cb1d96fe89e0503d96ffa5854',
  }),
]);

const primaryReferencesById = new Map(
  primaryReferences.map((source) => [source.id, source]),
);

export function getPrimaryReference(id) {
  if (typeof id !== 'string') return null;
  return primaryReferencesById.get(id) ?? null;
}
