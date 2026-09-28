// Questions are editorial prompts, grouped by the existing lesson boundaries.
// Sources remain external; answers, PDFs and access codes are not redistributed.
const VERIFIED_AT = '2026-09-17';

export const interviewSupplementSources = Object.freeze({
  xiaolin: Object.freeze({
    name: '小林面试笔记',
    url: 'https://www.xiaolincoding.com/project/xiaolinnote.html',
  }),
  yuque: Object.freeze({
    name: '图灵面试题（语雀）',
    url: 'https://www.yuque.com/aaron-wecc3/dhluml/foho2nsutnn37gw3',
    accessNote: '原文可能需要访问码',
  }),
});

function xiaolin(path, topic) {
  return Object.freeze({
    providerId: 'xiaolin',
    title: `小林 · ${topic}`,
    url: `https://xiaolinnote.com/ai/${path}`,
    verifiedAt: VERIFIED_AT,
    verification: 'page',
    format: '面试题',
  });
}

function yuque(slug, topic, { verification = 'catalog', format = '专题题单' } = {}) {
  return Object.freeze({
    providerId: 'yuque',
    title: `语雀 · ${topic}`,
    url: `https://www.yuque.com/aaron-wecc3/dhluml/${slug}`,
    verifiedAt: VERIFIED_AT,
    verification,
    format,
  });
}

function harnessSection(anchor, topic) {
  return yuque(`lasegy25krvdct8f#${anchor}`, topic, { verification: 'page', format: '延伸阅读' });
}

// [stable ID, lesson ID, paraphrased practice question, original sources]
const specsByModule = {
  'llm-foundation': [
    ['llm-definition', 'llm-01', '通用语言模型与传统 NLP 任务模型的能力边界有何区别？', [
      xiaolin('llm/what_is_llm.html', 'LLM 与传统 NLP'),
    ]],
    ['llm-loss', 'llm-02', '损失函数如何把预测误差变成训练信号？', [
      yuque('afagmtefqn64ogol', '损失函数', { verification: 'page', format: 'PDF 题单' }),
    ]],
    ['llm-scaling', 'llm-02', '如何理解模型规模、训练数据与能力提升之间的关系？', [
      xiaolin('llm/scaling_law_emergence.html', 'Scaling Law 与涌现'),
    ]],
    ['llm-tokenizer', 'llm-03', '分词器怎样把文本变成模型输入？不同分词方式会带来什么影响？', [
      xiaolin('llm/tokenizer.html', 'Tokenizer'),
    ]],
    ['llm-position', 'llm-03', '模型怎样表示词序？比较不同位置编码方案的取舍。', [
      xiaolin('llm/position_encoding.html', '位置编码'),
    ]],
    ['llm-transformer', 'llm-04', '从数据流解释 Transformer，并区分 Encoder 与 Decoder 的职责。', [
      xiaolin('llm/transformer_architecture.html', 'Transformer 架构'),
    ]],
    ['llm-attention-efficiency', 'llm-04', 'MQA、GQA 与 Flash Attention 分别针对注意力计算的什么瓶颈？', [
      xiaolin('llm/mha_mqa_gqa_flash_attention.html', '注意力优化'),
      yuque('qc16ct7uilro93zx', 'Attention 进阶'),
    ]],
    ['llm-moe', 'llm-04', 'MoE 如何选择专家？稀疏激活与稠密模型有什么不同？', [
      xiaolin('llm/moe.html', '混合专家模型'),
    ]],
    ['llm-training', 'llm-05', '一个语言模型从预训练到可用于对话，需要经过哪些训练阶段？', [
      xiaolin('llm/llm_training.html', '训练流程'),
    ]],
    ['llm-finetuning', 'llm-05', '全参数微调、PEFT 与提示学习怎样选择？', [
      xiaolin('llm/finetuning.html', '微调方法'),
      yuque('xvr7mk4f0mv5xt2i', 'Prompting 与参数高效学习', { verification: 'page', format: '面试题' }),
    ]],
    ['llm-lora', 'llm-05', 'LoRA 为什么能减少训练开销？应用时还需要权衡什么？', [
      xiaolin('llm/lora.html', 'LoRA'),
    ]],
    ['llm-post-training', 'llm-05', 'SFT、偏好优化与强化学习在后训练中分别解决什么问题？', [
      xiaolin('llm/post_training.html', 'Post-Training'),
      yuque('sg3vsy8co2gu700u', 'RLHF'),
    ]],
    ['llm-preference', 'llm-05', 'DPO 与 PPO 的训练信号和实现成本有什么差异？', [
      xiaolin('llm/dpo_vs_ppo.html', 'DPO / PPO'),
      yuque('axsk3zggus0zd5u2', 'PPO'),
    ]],
    ['llm-tool-training', 'llm-05', '工具调用能力如何从训练数据中学到？训练与宿主执行如何分工？', [
      xiaolin('tools/2_llm_tool_learning.html', '工具调用能力学习'),
      xiaolin('tools/3_fc_training.html', 'Function Call 训练'),
    ]],
    ['llm-decoding', 'llm-06', '比较贪心、束搜索与采样：生成任务不同，解码策略如何变化？', [
      xiaolin('llm/decoding_strategies.html', '解码策略'),
    ]],
    ['llm-sampling', 'llm-06', 'Temperature、Top-P、Top-K 如何共同影响输出分布？', [
      xiaolin('llm/temperature_top_p_top_k.html', '采样参数'),
    ]],
    ['llm-cache', 'llm-06', 'KV Cache 与 Prompt Caching 各自复用了什么计算？', [
      xiaolin('llm/kv_cache_prompt_caching.html', '推理缓存'),
    ]],
    ['llm-quantization', 'llm-06', '模型量化节省哪些资源？如何验证精度和速度的取舍？', [
      xiaolin('llm/quantization.html', '量化选型'),
    ]],
    ['llm-prompt', 'llm-07', '如何把业务要求写成可验证的提示，并评估提示修改的效果？', [
      xiaolin('llm/prompt_engineering.html', 'Prompt 工程'),
      yuque('xvr7mk4f0mv5xt2i', 'Prompt Engineering', { verification: 'page', format: '面试题' }),
    ]],
    ['llm-cot', 'llm-07', '分步推理提示适用于哪些任务？为什么仍需要验证输出？', [
      xiaolin('llm/cot.html', 'CoT 的作用与局限'),
    ]],
    ['llm-hallucination', 'llm-08', '模型输出流畅却事实错误时，怎样分析原因并降低风险？', [
      xiaolin('llm/hallucination.html', '幻觉与缓解'),
    ]],
    ['llm-evaluation', 'llm-08', '如何选择模型评测指标，让结果反映实际业务需求？', [
      xiaolin('llm/evaluation_metrics.html', '能力评测'),
    ]],
    ['llm-model-selection', 'llm-08', '怎样用项目评测、成本与延迟说明模型选型理由？', [
      xiaolin('llm/model_selection.html', '模型选型'),
    ]],
  ],
  'agent-mechanism': [
    ['agent-boundary', 'agent-01', '如何判断一个应用需要 Agent、固定工作流，还是一次模型调用？', [
      xiaolin('agent/1_whatisagent.html', 'Agent 与模型'),
      xiaolin('agent/3_workflow_tools.html', 'Workflow / Agent / Tools'),
      xiaolin('agent/4_patterns.html', '设计范式'),
    ]],
    ['agent-components', 'agent-02', '搭建一个 Agent 时，如何连接目标、状态、工具与决策模块？', [
      xiaolin('agent/2_components.html', '核心组件'),
      yuque('dglul2pucg43vrxo', 'Agent 搭建与框架', { verification: 'page', format: '面试题' }),
    ]],
    ['agent-tool-cycle', 'agent-03', '从模型提出工具调用到收到执行结果，完整链路是什么？', [
      xiaolin('tools/1_function_calling.html', 'Function Calling'),
    ]],
    ['agent-mcp-boundary', 'agent-03', 'Function Calling 与 MCP 各自负责哪一层？接入工具时如何配合？', [
      xiaolin('tools/4_what_is_mcp.html', 'MCP 概念'),
      xiaolin('tools/6_mcp_vs_fc.html', 'MCP 与 Function Calling'),
      xiaolin('tools/7_fc_vs_mcp_usage.html', '工具接入场景'),
    ]],
    ['agent-skills', 'agent-03', 'Skill、工具调用与 MCP 的职责如何区分？', [
      xiaolin('tools/9_skill.html', 'Skill'),
      xiaolin('tools/10_mcp_vs_skill.html', 'MCP 与 Skill'),
      xiaolin('tools/11_fc_skill_mcp.html', '三者的协作关系'),
      yuque('wg3cex8o6749nimo', 'Agent Skill 实践'),
    ]],
    ['agent-mcp-compatibility', 'agent-03', '模型不能稳定生成工具调用时，MCP 宿主需要处理哪些兼容问题？', [
      xiaolin('tools/8_reasoning_no_mcp.html', '模型能力与 MCP 接入'),
    ]],
    ['agent-react', 'agent-04', '以一个具体任务说明 ReAct 中推理、行动和观察如何循环。', [
      xiaolin('agent/5_react.html', 'ReAct 实现'),
      yuque('wo9pmvvk9cmdqnsk#bd6c56ad', 'ReAct 案例', { verification: 'page', format: '面试题' }),
    ]],
    ['agent-pattern-choice', 'agent-05', 'ReAct、先规划后执行与 Reflection 分别适合怎样的任务？', [
      xiaolin('agent/6_three_patterns.html', '三种范式选型'),
    ]],
    ['agent-planning', 'agent-05', '如何把复杂目标拆成可执行步骤，并根据新观察调整计划？', [
      xiaolin('agent/7_tasksplit.html', '任务拆分'),
      xiaolin('agent/14_planning.html', '规划能力'),
    ]],
    ['agent-reflection', 'agent-06', '反思机制如何帮助纠错？如何判断反思真的改善了结果？', [
      xiaolin('agent/15_reflection.html', '反思机制'),
    ]],
  ],
  'agent-harness': [
    ['harness-framework-choice', 'harness-01', '手写运行循环与采用框架如何取舍？需要自己承担哪些运行职责？', [
      xiaolin('agent/13_handcode.html', '手写 Agent 与框架'),
      yuque('dglul2pucg43vrxo', 'Agent 框架选型', { verification: 'page', format: '面试题' }),
    ]],
    ['harness-responsibility', 'harness-01', 'Harness 怎样约束并验证 Agent 的执行？', [
      harnessSection('c2cce142', 'Harness 的职责'),
    ]],
    ['harness-persistence', 'harness-02', '跨会话继续任务时，哪些进度和产物需要持久化？', [
      harnessSection('8973145c', '运行进度持久化'),
    ]],
    ['harness-permissions', 'harness-03', '为什么不同任务角色应获得不同的工具权限？', [
      harnessSection('75e355eb', '角色与受限工具'),
    ]],
    ['harness-isolation', 'harness-04', '自动执行代码时，怎样限定开发环境与外部系统的边界？', [
      harnessSection('da633b1a', '隔离开发环境案例'),
    ]],
    ['harness-budget', 'harness-05', '长任务如何限制时间与验证成本，避免持续运行却没有有效进展？', [
      harnessSection('c4b873ae', '长任务与验证预算'),
    ]],
    ['harness-handoff', 'harness-08', 'Agent 交接任务时，应提供哪些完成证据与继续执行所需的信息？', [
      harnessSection('48d26382', '长任务会话交接'),
    ]],
  ],
  'context-rag-memory': [
    ['context-rag-purpose', 'context-01', '哪些知识问题适合用 RAG 解决？它的能力边界在哪里？', [
      xiaolin('rag/2_rag_problems.html', 'RAG 的用途'),
    ]],
    ['context-rag-finetune', 'context-01', '外部知识变化时，如何在检索增强与微调之间选择？', [
      xiaolin('rag/3_rag_vs_finetune.html', 'RAG 与微调'),
    ]],
    ['context-budget', 'context-02', '为什么上下文不能无限堆积？如何按任务需要分层加载信息？', [
      harnessSection('c1a92e98', '分层上下文与按需加载'),
    ]],
    ['context-compression', 'context-03', '长对话可以怎样压缩？如何权衡压缩率与信息保留？', [
      xiaolin('agent/12_memcompress.html', '记忆压缩'),
    ]],
    ['context-chunking', 'context-04', '文档应按什么粒度切块？块大小与重叠怎样影响后续检索？', [
      xiaolin('rag/4_chunking.html', 'Chunking'),
      yuque('hnxpiga5sk54su0s', '文本分块', { verification: 'page', format: 'PDF 题单' }),
    ]],
    ['context-semantic-boundary', 'context-04', '切分破坏语义完整性时，可以怎样保留上下文关系？', [
      xiaolin('rag/5_semantic_cuts.html', '语义边界'),
    ]],
    ['context-pdf', 'context-04', 'PDF 文档进入知识库前，需要处理哪些解析质量问题？', [
      yuque('og9ie1qfc3z250h6', 'PDF 解析'),
    ]],
    ['context-tables', 'context-04', '含表格的文档如何保留行列语义并支持检索？', [
      yuque('vogpr2x2zonn4rte', '表格识别'),
    ]],
    ['context-updates', 'context-04', '知识库持续更新时，如何处理新增、修改与删除的内容？', [
      xiaolin('rag/19_dynamic_update.html', '知识库动态更新'),
    ]],
    ['context-embedding', 'context-05', 'Embedding 模型选型应该怎样结合业务语料验证？', [
      xiaolin('rag/6_embedding.html', 'Embedding 选型与评估'),
      xiaolin('rag/7_embedding_algos.html', 'Embedding 方法'),
    ]],
    ['context-vector-store', 'context-05', '向量索引与数据库选型需要考虑哪些约束？', [
      xiaolin('rag/8_vectordb.html', '向量数据库选型'),
    ]],
    ['context-vector-performance', 'context-05', '数据规模增长后，怎样定位向量检索的性能瓶颈？', [
      xiaolin('rag/9_vectordb_practice.html', '向量数据库实践'),
    ]],
    ['context-hybrid', 'context-05', '词法与向量召回有什么互补性？多路结果如何融合？', [
      xiaolin('rag/11_retrieval_types.html', '关键词与向量检索'),
      xiaolin('rag/13_multi_retrieval.html', '多路召回'),
      yuque('gw77y74hsesa3vrs', 'RAG Fusion'),
    ]],
    ['context-query-rewrite', 'context-05', '查询改写如何改善召回？如何避免改写偏离用户意图？', [
      xiaolin('rag/12_query_rewrite.html', 'Query Rewrite'),
    ]],
    ['context-retrieval-optimization', 'context-05', '检索结果不理想时，应该从哪些环节逐步优化？', [
      xiaolin('rag/14_retrieval_opt.html', '检索优化'),
      yuque('hic9v8oovd7ki61z', 'RAG 优化题单'),
    ]],
    ['context-rerank', 'context-06', '召回之后为什么还需要重排？重排与向量相似度排序有何不同？', [
      yuque('nbwig4qsg27oe70s', 'Rerank 模型', { verification: 'page', format: 'PDF 题单' }),
    ]],
    ['context-grounding', 'context-06', '检索到相关资料后，怎样降低生成答案偏离证据的风险？', [
      xiaolin('rag/17_hallucination.html', 'RAG 幻觉'),
    ]],
    ['context-memory-design', 'context-07', 'Agent 的短期状态与长期记忆分别保存什么信息？', [
      xiaolin('agent/8_memory.html', '记忆模块设计'),
    ]],
    ['context-memory-storage', 'context-07', '长期记忆按什么粒度存储，又怎样选择性召回？', [
      xiaolin('agent/9_memory_storage.html', '记忆存储与使用'),
      yuque('hybkp8q9hqhfsuoz', '长期记忆优化'),
    ]],
    ['context-rag-pipeline', 'context-08', '从文档入库到带引用的答案，完整 RAG 链路如何设计？', [
      xiaolin('rag/1_whatisrag.html', 'RAG 全流程'),
      xiaolin('rag/10_online_workflow.html', '在线查询流程'),
      yuque('kzmglpe7q1r28iw6#qBLmb', 'RAG 流程详解', { verification: 'page', format: '面试题' }),
    ]],
    ['context-advanced-rag', 'context-08', '基础 RAG 不够用时，怎样判断是否需要更复杂的检索流程？', [
      xiaolin('rag/15_advanced_paradigms.html', '进阶 RAG 范式'),
      yuque('eyr0nqhftgv7y2tg', 'Agentic RAG'),
    ]],
    ['context-graph-rag', 'context-08', '什么样的问题需要显式关系信息？图检索何时能补充向量检索？', [
      xiaolin('rag/16_graph_db.html', '图数据库增强检索'),
      yuque('sw8kcvhv7srici10', 'Graph RAG'),
    ]],
    ['context-rag-evaluation', 'context-08', '怎样分别评估召回、证据质量与最终答案？', [
      xiaolin('rag/18_evaluation.html', 'RAG 效果评估'),
      yuque('rm48hecz8y2gmkup', 'RAG 评测题单'),
    ]],
    ['context-rag-diagnosis', 'context-08', 'RAG 项目落地失败时，如何用案例说明瓶颈、改进与验证结果？', [
      xiaolin('rag/20_hardest_parts.html', '落地难点'),
      yuque('tb6mmdxw679ogdnh', 'RAG 痛点与方案'),
    ]],
  ],
  'backend-engineering': [
    ['backend-gateway', 'backend-01', '模型网关在统一接入、路由与服务治理中承担什么职责？', [
      xiaolin('tools/16_llm_gateway.html', '大模型网关'),
    ]],
    ['backend-stream-transport', 'backend-02', '文本流式交互选择 SSE 还是 WebSocket？需要权衡哪些限制？', [
      xiaolin('tools/14_sse_vs_websocket.html', 'SSE / WebSocket'),
    ]],
    ['backend-realtime-media', 'backend-02', '实时语音交互为什么会考虑 WebRTC？它与 WebSocket 的取舍是什么？', [
      xiaolin('tools/15_webrtc_vs_ws.html', '实时媒体传输'),
    ]],
    ['backend-observability', 'backend-07', '怎样让日志与指标帮助定位 Agent 应用运行中的问题？', [
      harnessSection('15c8f189', '日志与指标接入'),
    ]],
    ['backend-model-serving', 'backend-08', '模型服务框架如何结合硬件、并发与延迟需求选型？', [
      xiaolin('llm/deployment_frameworks.html', '模型部署框架'),
    ]],
  ],
};

export const interviewSupplementsByModule = Object.freeze(Object.fromEntries(
  Object.entries(specsByModule).map(([moduleId, specs]) => [
    moduleId,
    Object.freeze(specs.map(([id, lessonId, question, sources]) => Object.freeze({
      id: `supplement-${id}`,
      moduleId,
      lessonId,
      question,
      kind: sources.every(({ format }) => format === '延伸阅读') ? 'reading-prompt' : 'interview-topic',
      sources: Object.freeze(sources),
    }))),
  ]),
));

const EMPTY_SUPPLEMENTS = Object.freeze([]);

export function getInterviewSupplements(moduleId) {
  return Object.hasOwn(interviewSupplementsByModule, moduleId)
    ? interviewSupplementsByModule[moduleId]
    : EMPTY_SUPPLEMENTS;
}
