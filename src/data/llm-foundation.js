import { llmFoundationNotes } from './llm-foundation-notes.js';
import { createPrimaryReferenceBinding } from './primary-reference-bindings.js';

const VERIFIED_AT = '2026-07-15';
const LLM_01_VERIFIED_AT = '2026-07-21';
const WAVE_01_VERIFIED_AT = '2026-07-22';
const WAVE_02_VERIFIED_AT = '2026-07-22';
const PRIMARY_VERIFIED_AT = '2026-07-30';

const legacyResources = [
  {
    id: 'res-ms-ai', title: 'AI for Beginners', url: 'https://github.com/microsoft/AI-For-Beginners', source: 'Microsoft', language: '多语言', type: 'GitHub 课程', difficulty: '入门', stage: '基础认知', value: '用完整课程区分 AI、机器学习与深度学习，并配有可运行练习。', verifiedAt: LLM_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'cross-check', verifiedAt: LLM_01_VERIFIED_AT,
      coverage: ['AI 与机器学习的范围关系', '语言建模与自监督预训练', '条件生成与零样本、少样本使用', '损失、梯度下降优化与参数更新', '训练误差和验证误差、过拟合与泛化边界'],
      limitations: '神经网络章节只支撑课程级的损失、梯度优化和训练/验证最小机制，不构成大模型训练系统保证；LLM 章节还含过时且未可靠归因的模型参数表及拟人表达，不用于当前模型规格或现代 Agent 机制。',
    },
  },
  {
    id: 'res-ms-genai', title: 'Generative AI for Beginners', url: 'https://github.com/microsoft/generative-ai-for-beginners', source: 'Microsoft', language: '多语言', type: 'GitHub 课程', difficulty: '入门', stage: '应用基础', value: '从生成式 AI 概念走向提示、检索和应用构建，适合开发者主线学习。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['生成式 AI 与 LLM 基础', 'tokenizer、embedding 与自回归生成', '模型、服务与应用的边界', '上下文预算、RAG 与应用评测', '预训练、SFT、微调与部署的目标边界', 'Prompt 设计、结构化输出与应用评测', 'Agent 衔接与生产应用迭代'],
      limitations: '“生成式 AI 是深度学习子集”等表述是面向现代主流系统的简化分类；本模块只用实际访问的课程正文支撑 tokenization、embedding、训练阶段、Prompt、RAG 与评测，Foundry 流程、接口示例和模型清单具有平台与时间边界，不能当作通用唯一实现。',
    },
  },
  {
    id: 'res-ms-agents', title: 'AI Agents for Beginners', url: 'https://github.com/microsoft/ai-agents-for-beginners', source: 'Microsoft', language: '多语言', type: 'GitHub 课程', difficulty: '入门', stage: 'Agent 衔接', value: '完成 LLM 基础后继续学习 Agent 模式、工具和多智能体实践。', verifiedAt: LLM_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'cross-check', verifiedAt: LLM_01_VERIFIED_AT,
      coverage: ['Agent 与裸 LLM 的边界', '环境、工具、知识、记忆和行动组件', '开放式多步骤任务的适用性'],
      limitations: '不覆盖 LLM 训练、tokenization 或推理机制；经典智能体分类与现代 LLM Agent 工程并列出现，Microsoft Foundry 与 Agent Framework 选型也不代表唯一实现。',
    },
  },
  {
    id: 'res-hf-llm', title: 'Hugging Face LLM Course', url: 'https://huggingface.co/learn/llm-course/chapter1/1', source: 'Hugging Face', language: '多语言', type: '官方课程', difficulty: '入门到进阶', stage: '模型全链路', value: '覆盖 Transformer、tokenizer、推理、微调、数据与局限，章节结构清楚。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['LLM 与 Transformer 基础', 'tokenization、输入 embedding 与上下文化表示', '位置相关表示与上下文限制', '自监督预训练、SFT 与参数高效微调', '使用已训练模型推理', 'logits、生成、prefill、decode 与 KV Cache', '偏见、数据与资源限制'],
      limitations: '不能单独支撑完整的 AI、机器学习、深度学习领域层级，也不覆盖应用团队的完整职责；不同模型的 tokenizer、位置表示、训练配方、窗口与推理接口仍须查对应模型和服务，本模块不把某一教学实现推广成所有模型保证。',
    },
  },
  {
    id: 'res-hf-agents', title: 'Hugging Face Agents Course', url: 'https://huggingface.co/learn/agents-course/zh-CN/unit0/introduction', source: 'Hugging Face', language: '中文', type: '官方课程', difficulty: '入门到进阶', stage: 'Agent 衔接', value: '以中文课程连接 LLM、工具、框架、Agentic RAG、观测与评测。', verifiedAt: WAVE_02_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_02_VERIFIED_AT,
      coverage: ['消息、工具、解析器与执行边界', '模型输出解析与结构校验', 'trace、token、成本、延迟和错误可观测性', '离线评测、线上反馈、重试与 fallback'],
      limitations: '课程以 smolagents 与 OpenTelemetry 等具体框架和观测实现为例，接口与行为具有版本边界；成功解析不等于权限合法、事实正确或业务有效，生产系统仍需独立授权、业务校验和降级。',
    },
  },
  {
    id: 'res-karpathy', title: 'Neural Networks: Zero to Hero', url: 'https://github.com/karpathy/nn-zero-to-hero', source: 'Andrej Karpathy', language: '英文', type: 'GitHub + 视频', difficulty: '进阶', stage: '原理实作', value: '从反向传播手写到 tokenizer 与 GPT，代码和直觉紧密对应。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['训练循环与计算依赖', 'micrograd 标量自动微分、链式法则和梯度累加', '参数更新与梯度清理的教学实现', '训练和验证损失的诊断思路'],
      limitations: '核心正文来自课程仓库与 micrograd 教学实现，只用于说明标量计算图和最小训练闭环，不代表生产张量框架或分布式训练系统；Transformer 与推理课程在 llm-04、llm-06 只作为扩展路线，本轮未取得 Build GPT 视频可核验字幕，未把视频当作机制正文。',
    },
  },
  {
    id: 'res-karpathy-build-gpt', title: "Let's build GPT: from scratch, in code, spelled out.", url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', source: 'Andrej Karpathy', platform: 'YouTube', language: '英文', type: 'YouTube 视频', difficulty: '进阶', stage: 'Transformer 实作', value: '跟随原作者从 bigram 语言模型逐步实现自注意力、Transformer 块与一个小型 GPT。', verifiedAt: VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'extension', verifiedAt: VERIFIED_AT,
      coverage: ['视频身份、作者与从 bigram 到 GPT 教学路线的元数据，作为课后实作入口'],
      limitations: '本轮只核验视频页面和课程元数据，没有取得可核验字幕或逐字正文，因此不用于支撑 token、上下文、Attention 或 Transformer 的任何关键机制。',
    },
  },
  {
    id: 'res-rasbt', title: 'LLMs from Scratch', url: 'https://github.com/rasbt/LLMs-from-scratch', source: 'Sebastian Raschka', language: '英文', type: 'GitHub 教材', difficulty: '进阶', stage: '模型实作', value: '逐章实现数据处理、Attention、GPT、预训练、微调与 LoRA。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['tokenization、输入 embedding 与位置表示', 'Q、K、V 与缩放点积注意力', '多头、因果掩码与 GPT-like decoder block', 'GPT-like Pre-Norm 教学实现', '预训练、分类与指令微调、LoRA 实作', 'logits、temperature、top-k 与生成循环', '自回归推理与 KV Cache 教学实现'],
      limitations: '这是面向学习者的 GPT-like 代码与教材，不代表所有模型采用相同 tokenizer、位置机制、训练配方、采样接口、缓存布局、尺寸或归一化放置；Pre-Norm 实现不能反向改写原始 Transformer 论文的 Post-Norm 架构。',
    },
  },
  {
    id: 'res-happy-llm', title: 'Happy-LLM：从零开始构建大模型', url: 'https://github.com/datawhalechina/happy-llm', source: 'Datawhale', language: '中文', type: 'GitHub 教材', difficulty: '入门到进阶', stage: '中文主线', value: '中文系统讲解 NLP、Transformer、训练、微调并提供动手实现。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'community', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['中文解释多头注意力、因果掩码与 Transformer 组成', '残差、归一化与逐位置前馈网络的教学交叉核验', '预训练、SFT、偏好优化、LoRA 与参数高效微调的中文交叉核验'],
      limitations: '这是社区二手教材，用于中文解释和交叉核验，不能替代原始论文、训练方法原典或具体模型实现；其中示例架构、训练流程与参数不应推广为所有现代 LLM 的保证。',
    },
  },
  {
    id: 'res-llm-universe', title: 'LLM Universe：动手学大模型应用开发', url: 'https://github.com/datawhalechina/llm-universe', source: 'Datawhale', language: '中文', type: 'GitHub 课程', difficulty: '入门', stage: '应用开发', value: '面向 Python 开发者讲 API、Prompt、RAG、评估和应用落地。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'community', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['Prompt 设计、少样本示例与输入组织', 'RAG 的文档切分、检索与生成链路', '应用评估与检索问答实验', '检索相关性、答案忠实度和对照评测的工程提示'],
      limitations: '本模块只把实际访问的 Prompt、RAG 与应用评测正文作为中文交叉核验；社区实现、依赖版本与示例结果不代表检索一定相关、答案一定忠实或方法适用于所有模型和业务。',
    },
  },
  {
    id: 'res-hello-agents', title: 'Hello-Agents：从零开始构建智能体', url: 'https://github.com/datawhalechina/hello-agents', source: 'Datawhale', language: '中文', type: 'GitHub 教材', difficulty: '进阶', stage: 'Agent 衔接', value: '在基础模块之后，以自研框架理解 Agent 原理、范式与多智能体。', verifiedAt: LLM_01_VERIFIED_AT,
    evidence: {
      authority: 'community', role: 'cross-check', verifiedAt: LLM_01_VERIFIED_AT,
      coverage: ['Agent 不等于裸 LLM', '工具调用与行动闭环', '模型选型和应用验证路径'],
      limitations: '这是社区二手教材，适合中文解释和工程交叉核验；框架实现、模型示例与其他时敏内容不能替代模型厂商或 SDK 官方语义。',
    },
  },
  {
    id: 'res-openai-cookbook', title: 'OpenAI Cookbook', url: 'https://github.com/openai/openai-cookbook', source: 'OpenAI', language: '英文', type: 'GitHub 示例', difficulty: '入门到进阶', stage: '应用实践', value: '官方 API 示例与指南，适合核对结构化输出、评测和生产实践。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['tiktoken 文本计数与 API 请求计数边界', 'embedding 问答与检索实验', '长输入处理和长文分块摘要', 'RAG、摘要与应用评测的迭代闭环', '结构化输出、校验与评测示例', 'token、成本、延迟与失败记录的实验方法'],
      limitations: '示例面向 OpenAI API 与其核验时版本，完整请求还可能包含消息、工具和其他协议开销；摘要是有损转换，检索候选也不保证相关或正确。OpenAI Docs 只用于协同核对时敏 API 语义，未把独立文档主张伪归因给 Cookbook；API 字段、模型支持与示例结果都不能当成其他版本、模型和任务的通用保证。',
    },
  },
  {
    id: 'res-openai-evals', title: 'OpenAI Evals', url: 'https://github.com/openai/evals', source: 'OpenAI', language: '英文', type: 'GitHub 框架', difficulty: '进阶', stage: '评测实践', value: '官方开源评测框架与基准注册表，用于学习如何构建、运行和管理面向具体用例的 Evals。', verifiedAt: WAVE_02_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_02_VERIFIED_AT,
      coverage: ['版本化评测数据集、参考答案与 rubric', 'basic、model-graded 与其他 grader 组合', 'meta-eval、可复现运行与评测迭代'],
      limitations: '仓库框架、注册表和模板随版本演进，不能据此推断所有评测服务具有同一接口；model grader 不是 gold truth，需用人工标签和 meta-eval 校准，也不等同于生产系统的完整发布门禁。',
    },
  },
  {
    id: 'res-openai-agents', title: 'OpenAI Agents SDK', url: 'https://github.com/openai/openai-agents-python', source: 'OpenAI', language: '英文', type: 'GitHub SDK', difficulty: '进阶', stage: 'Agent 衔接', value: '用官方实现理解 Agent、工具、交接、护栏、会话和追踪。', verifiedAt: LLM_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'extension', verifiedAt: LLM_01_VERIFIED_AT,
      coverage: ['LLM、instructions 与 tools 的应用编排', '可选 handoffs、guardrails、sessions 与 tracing 组件', '敏感工具配置 needs_approval 后暂停调用并等待人批准或拒绝'],
      limitations: '审批语义只适用于 OpenAI Agents SDK 中配置了 needs_approval 或 require approval 的工具调用，guardrails 不是权限系统；该资料不支撑模型训练机制，也不代表所有 Agent 框架都自动具备人工审批。',
    },
  },
  {
    id: 'res-tiktoken', title: 'tiktoken', url: 'https://github.com/openai/tiktoken', source: 'OpenAI', language: '英文', type: 'GitHub 工具', difficulty: '进阶', stage: 'Token 实验', value: '实际观察 BPE tokenizer 的编码、解码和 token 预算。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['BPE 编码、token ID、解码与本地文本计数', '按指定 encoding 比较文本切分和 token 用量'],
      limitations: '本地纯文本编码只覆盖传入字符串，不自动计入聊天消息角色、边界标记、工具定义或其他 API 包装；模型到 encoding 的映射和完整计数口径须按目标服务版本核验。',
    },
  },
  {
    id: 'res-anthropic-agents', title: 'Building Effective Agents', url: 'https://www.anthropic.com/engineering/building-effective-agents', source: 'Anthropic', language: '英文', type: '官方博客', difficulty: '进阶', stage: '系统设计', value: '用工作流与 Agent 的区分理解何时需要自治，以及如何从简单组合开始。', verifiedAt: WAVE_02_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'cross-check', verifiedAt: WAVE_02_VERIFIED_AT,
      coverage: ['优先采用满足需求的最简单设计', 'workflow 与 agent 的适用边界', 'routing、evaluator-optimizer 等模式', '复杂度换取质量、成本和延迟的工程权衡'],
      limitations: '文章提供厂商工程经验与模式建议，不支撑 OWASP Prompt Injection 威胁细节，也不构成跨模型、跨框架的普遍 benchmark；具体实现仍需用本项目评测和风险门槛验证。',
    },
  },
  {
    id: 'res-stanford-cs336', title: 'Stanford CS336: Language Modeling from Scratch', url: 'https://cs336.stanford.edu/', source: 'Stanford University', language: '英文', type: '大学课程', difficulty: '深挖', stage: '训练系统', value: '从数据、tokenizer、Transformer 到分布式训练与评估，适合深入路线。', verifiedAt: WAVE_02_VERIFIED_AT,
    evidence: {
      authority: 'academic', role: 'core', verifiedAt: WAVE_02_VERIFIED_AT,
      coverage: ['训练数据抽取、过滤、精确与模糊去重', 'PII 处理、质量过滤阈值与数据分布影响', 'SFT、偏好优化与 DPO 的目标边界', '偏好偏差、训练退化与回归评测'],
      limitations: '课程与实验用于建立训练系统和数据治理机制，不构成生产训练结果保证；它不覆盖 LoRA 或 RAG 的完整选型，也不能把课程中的具体模型、数据量和算力设置泛化为其他系统。',
    },
  },
  {
    id: 'res-google-ml', title: 'Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course/', source: 'Google for Developers', language: '英文', type: '官方课程', difficulty: '入门', stage: '机器学习基础', value: '通过可视化与练习补齐损失、梯度、泛化等机器学习基本概念。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['线性与非线性模型', '损失函数与梯度下降', '学习率对收敛、震荡和发散的影响', '训练、验证、过拟合和泛化诊断'],
      limitations: '课程支撑通用机器学习训练机制和诊断，不等于大型语言模型训练系统规范；训练损失与验证指标仍是业务目标的代理，不能单独证明生产可发布。',
    },
  },
  {
    id: 'res-fastai', title: 'Practical Deep Learning for Coders', url: 'https://course.fast.ai/', source: 'fast.ai', language: '英文', type: '开放课程', difficulty: '入门到进阶', stage: '深度学习实践', value: '以项目驱动方式建立训练模型与诊断模型的工程直觉。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['批次训练、损失与优化的项目实践', '学习率选择、训练曲线与验证集诊断', '从训练指标到实际任务检查的工程直觉'],
      limitations: '项目式课程用于实践交叉核验，具体库默认值、训练配方和 API 具有版本边界；它不证明某套激活、学习率或训练指标适合所有模型与业务。',
    },
  },
  {
    id: 'res-d2l-zh', title: '动手学深度学习', url: 'https://zh.d2l.ai/', source: 'Dive into Deep Learning', language: '中文', type: '交互教材', difficulty: '入门到进阶', stage: '深度学习基础', value: '中文教材与可运行代码并重，适合查补张量、优化、注意力和 Transformer。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'academic', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['张量形状、线性层与激活函数', '损失归约、计算图、链式法则与反向传播', '优化器、学习率与梯度累积边界', '训练、验证与泛化诊断'],
      limitations: '教材示例用于解释通用深度学习机制，具体框架代码会随版本变化；zero-grad 与梯度累积是框架和训练循环语义，不能写成微积分定律，也不构成生产 LLM 训练保证。',
    },
  },
  {
    id: 'res-3b1b-nn', title: '3Blue1Brown 神经网络专题', url: 'https://www.3blue1brown.com/topics/neural-networks', source: '3Blue1Brown', language: '英文', type: '可视化课程', difficulty: '入门', stage: '直觉建立', value: '用高质量动画建立梯度、反向传播、Embedding 与 Transformer 直觉。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['神经网络前向计算的可视化直觉', '梯度与反向传播的局部敏感度', '链式法则把损失影响传回参数'],
      limitations: '可视化课程用于建立直觉和交叉核验，不替代张量框架、优化器或验证集的完整工程语义；动画类比不能证明全局最优或生产质量。',
    },
  },
  {
    id: 'res-3b1b-transformer', title: 'Transformers, the tech behind LLMs', url: 'https://www.3blue1brown.com/lessons/gpt/', source: '3Blue1Brown', language: '英文', type: '视频图文', difficulty: '入门', stage: 'Transformer 直觉', value: '从输入向量到输出概率，直观串起 decoder-only Transformer。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['token 向量、位置线索与上下文化表示', 'decoder-only Transformer 从输入表示到输出分布的直觉链路'],
      limitations: '图文材料用于表示与 decoder-only 数据流的直觉核验，不能据此断言所有模型的位置实现、上下文限制或内部维度相同，也不提供 RAG 检索可靠性保证。',
    },
  },
  {
    id: 'res-3b1b-attention', title: 'Attention in transformers, step-by-step', url: 'https://www.3blue1brown.com/lessons/attention/', source: '3Blue1Brown', language: '英文', type: '视频图文', difficulty: '进阶', stage: 'Attention 直觉', value: '逐步可视化 Q、K、V 与信息更新，适合配合交互实验。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['Q、K、V 的查询、匹配与 Value 聚合直觉', '注意力权重和上下文化表示更新', '缩放点积与多头注意力的可视化解释'],
      limitations: '图文可视化用于解释计算流程，不证明某个头具有固定人类语义；注意力权重本身也不是最终输出的充分因果解释，更不能替代任务干预与评测。',
    },
  },
  {
    id: 'res-attention-paper', title: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', source: 'Vaswani 等', language: '英文', type: '论文', difficulty: '深挖', stage: '架构原典', value: 'Transformer 原始论文，适合在具备直觉后核对公式与架构动机。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'academic', role: 'core', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['Q、K、V 与缩放点积注意力公式', '多头注意力、因果 decoder mask 与逐位置前馈网络', '残差、LayerNorm 和 encoder-decoder Transformer 原始架构'],
      limitations: '论文描述 2017 年 encoder-decoder Transformer 与 Post-Norm 结构，报告结果受其任务和设置约束；不能将其静默泛化为现代 GPT decoder-only、Pre-Norm 或任意服务实现。',
    },
  },
  {
    id: 'res-limu-transformer', title: 'Transformer《动手学深度学习 v2》', url: 'https://www.bilibili.com/video/BV1Kq4y1H7FL/', source: '跟李沐学AI', language: '中文', type: 'Bilibili 视频', difficulty: '进阶', stage: 'Transformer 实作', value: '从架构讲解进入多头注意力与 Transformer 代码，适合配合 D2L 教材。', verifiedAt: WAVE_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'cross-check', verifiedAt: WAVE_01_VERIFIED_AT,
      coverage: ['通过关联的 D2L 等价正文交叉核验多头注意力、残差、归一化与 Transformer 实作'],
      limitations: '本轮未取得 Bilibili 视频字幕或逐字正文，只访问了该课程关联的 D2L 等价正文；因此不把视频本身当作已读正文，也不据此推断讲者在视频中的额外主张。',
    },
  },
  {
    id: 'res-wangmutou-transformer', title: '以卷积类比串联词嵌入、Attention 与 Transformer', url: 'https://www.bilibili.com/video/BV1XH4y1T76e/', source: '王木头学科学', language: '中文', type: 'Bilibili 视频', difficulty: '入门', stage: 'Transformer 直觉', value: '用个人类比串联词嵌入、位置与 Attention；类比用于建立直觉，不应理解为 Attention 与 CNN 在架构上等价。', verifiedAt: VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'extension', verifiedAt: VERIFIED_AT,
      coverage: ['视频身份、主题和以卷积类比解释 embedding、位置与 Attention 的元数据，作为课后扩展入口'],
      limitations: '本轮只取得视频与作者元数据，没有可核验字幕或正文，因此不用于支撑 token、位置表示、Attention 或 Transformer 的关键机制；卷积类比也不能推出 Attention 与 CNN 架构等价。',
    },
  },
  {
    id: 'res-owasp-prompt-injection', title: 'LLM Prompt Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html', source: 'OWASP', language: '英文', type: '官方安全指南', difficulty: '进阶', stage: '安全实践', value: '系统梳理直接与间接提示注入、工具风险，以及输入隔离、最小权限、监控和人工确认等纵深防御。', verifiedAt: WAVE_02_VERIFIED_AT,
    evidence: {
      authority: 'official', role: 'core', verifiedAt: WAVE_02_VERIFIED_AT,
      coverage: ['直接与间接 Prompt Injection', 'RAG poisoning 与工具调用操纵', '指令和不可信数据分离、输入输出校验', '最小权限、人工确认、监控日志与纵深防御', 'guardrail 与单层过滤的失效边界'],
      limitations: '指南中的正则、代码片段和风险阈值是防御示范，不是跨语言通用检测器；每一层都可能被绕过，控制选择必须结合本系统资产、入口、权限和副作用威胁模型。',
    },
  },
  {
    id: 'res-zomi-bili', title: '大模型整体架构与全流程介绍', url: 'https://www.bilibili.com/video/BV1a34y137zi/', source: 'ZOMI酱', language: '中文', type: 'Bilibili 视频', difficulty: '入门到进阶', stage: '全局补充', value: '从 AI 系统视角串联数据、训练、微调、推理、部署与应用环节。', verifiedAt: LLM_01_VERIFIED_AT,
    evidence: {
      authority: 'expert', role: 'extension', verifiedAt: LLM_01_VERIFIED_AT,
      coverage: ['视频身份与主题元数据，仅作为课后扩展入口'],
      limitations: '已核验作者身份和视频元数据，但字幕为空且页面访问返回 412，未读取到视频正文，因此不用于支撑本章任何关键事实；同作者图文也不是该视频逐字稿。',
    },
  },
];

function primaryBinding({
  id,
  canonicalSourceId,
  stage,
  learningUse,
  coverage,
  limitations,
  role = 'core',
}) {
  return createPrimaryReferenceBinding({
    id,
    canonicalSourceId,
    stage,
    difficulty: '入门到进阶',
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
    id: 'res-llm-primary-javaguide-ai',
    canonicalSourceId: 'primary-javaguide-ai',
    stage: 'AI 应用开发地图',
    learningUse: '用一张知识地图把模型、Agent、RAG、Prompt、MCP 与生产应用放回各自责任层',
    coverage: ['AI 应用开发知识体系、模型与应用边界、LLM 学习路线'],
    limitations: '文章提供体系化教学导航，不代表统一行业标准；架构、公式、模型能力与产品行为仍由论文、官方资料和目标系统实测核验。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-core-concepts',
    canonicalSourceId: 'primary-javaguide-ai-core-concepts',
    stage: '核心概念',
    learningUse: '建立 LLM、Agent、RAG、MCP、Skills 与 ReAct 的相互关系，并避免把模型和运行时混成一个对象',
    coverage: ['LLM 核心概念、模型与 Agent runtime 边界、RAG 与工具位置'],
    limitations: '文章提供概念综述，不构成模型架构、协议或运行时实现的规范；时敏接口、安全和能力主张必须另行核验。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-mechanism',
    canonicalSourceId: 'primary-javaguide-llm-operation-mechanism',
    stage: 'LLM 运行机制',
    learningUse: '以 token、上下文窗口、注意力、采样和生成链路串起模型从输入到下一 token 的运行主干',
    coverage: ['Token 与 ID、上下文窗口、Transformer 机制、logits 与采样参数'],
    limitations: '文章用于组织教学叙事，不替代 Transformer 原论文、训练教材或具体服务文档；架构变体、公式细节和 API 行为必须按对应权威来源核验。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-prompt',
    canonicalSourceId: 'primary-javaguide-prompt-engineering',
    stage: 'Prompt 工程',
    learningUse: '把 Prompt 从措辞技巧提升为包含指令、输入、示例、输出和失败行为的可评测契约',
    coverage: ['Prompt 组成、message role、few-shot、约束与迭代评测'],
    limitations: '文章提供工程方法综述，不保证某种提示模板跨模型有效，也不能把自然语言层级当成权限或安全边界。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-api',
    canonicalSourceId: 'primary-javaguide-llm-api-engineering',
    stage: 'API 工程',
    learningUse: '把模型调用放进流式返回、超时、重试、限流、可观测和版本化的服务链路中',
    coverage: ['LLM API、message role、流式输出、超时重试、限流与可观测性'],
    limitations: '文章给出跨厂商工程模式，不代表任何服务的当前字段、重试语义或限流保证；实现必须查目标 API 官方文档。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-structured-output',
    canonicalSourceId: 'primary-javaguide-structured-output-function-calling',
    stage: '结构化输出',
    learningUse: '从 JSON 语法、Schema 到 function calling 串起 parse、validate、repair、retry 与业务校验',
    coverage: ['结构化输出、JSON Schema、Function Calling、解析校验与失败处理'],
    limitations: '文章提供实现导航，不代表合法 JSON 等于语义正确，也不保证各模型都严格遵循 Schema；权限、业务不变量与副作用必须由可信代码控制。',
  }),
  primaryBinding({
    id: 'res-llm-primary-javaguide-evaluation',
    canonicalSourceId: 'primary-javaguide-llm-evaluation',
    stage: '评测体系',
    learningUse: '从 Golden Set、rubric、离线回归、模型裁判、人工复核到线上灰度建立完整评测闭环',
    coverage: ['评测数据集、rubric、offline eval、model grader、human review 与线上监测'],
    limitations: '文章提供评测体系主干，不定义本项目的阈值或 gold truth；模型裁判必须经人工标签校准，线上安全和隐私仍需独立控制。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-prompt-memory',
    canonicalSourceId: 'primary-feishu-claude-ai-memory',
    stage: 'Prompt 与记忆观察',
    learningUse: '用日期化产品观察区分活动上下文、transcript、产品记忆与持久状态，而不把逆向结果当作模型事实',
    coverage: ['Claude.AI 提示词结构观察、活动上下文、transcript 与产品记忆边界'],
    limitations: '正文属于作者的逆向观察和教学分析，不代表 Claude.AI 当前产品实现、通用 LLM 事实或公开稳定协议；存储、权限、删除与召回行为需由当前官方资料核验。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-context-offloading',
    canonicalSourceId: 'primary-feishu-context-offloading',
    stage: 'Context Offloading',
    learningUse: '理解有限活动上下文如何把可恢复细节外置，并保留引用、检索线索和恢复入口',
    coverage: ['Context offloading、活动上下文、外部状态与恢复引用'],
    limitations: '正文提供作者的教学观察，不代表通用模型记忆机制、产品协议或持久化保证；外置内容的权限、完整性与恢复必须由宿主系统验证。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-version-drifting',
    canonicalSourceId: 'primary-feishu-agent-version-drifting',
    stage: '版本漂移',
    learningUse: '把模型、Prompt、工具 Schema、评测集和宿主版本作为一个可复现系统元组管理',
    coverage: ['Agent Version Drifting、模型与 Prompt 版本、工具 Schema、回归评测'],
    limitations: '正文提供作者的 Agent 工程观察，不代表模型或产品版本变化的通用规律，也不保证 seed 能跨版本复现；漂移必须以固定评测和实际运行记录验证。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-tool-truth',
    canonicalSourceId: 'primary-feishu-tool-truth',
    stage: '工具真值边界',
    learningUse: '区分模型生成的工具提议、对话中的 tool transcript 与宿主实际执行和保存的 observation',
    coverage: ['工具定义、tool call、tool result、宿主 observation 与执行真实性'],
    limitations: '正文提供作者的工具调用教学观察，不代表通用工具协议、产品实现或执行事实；权限、参数、结果真实性和副作用由宿主系统核验。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-claude-tools',
    canonicalSourceId: 'primary-feishu-claude-code-tools',
    stage: 'Claude Code 工具边界',
    learningUse: '把 Claude Code 常用工具当作特定实现案例，观察模型之外的能力暴露与控制边界',
    coverage: ['Claude Code 工具观察、能力暴露、工具参数与宿主边界'],
    limitations: '正文属于作者对 Claude Code 的产品观察和教学整理，不代表通用 LLM 工具集、当前产品协议或安全保证；工具能力必须按当前官方资料与本地实测确认。',
  }),
  primaryBinding({
    id: 'res-llm-primary-feishu-beyond-model',
    canonicalSourceId: 'primary-feishu-beyond-model',
    stage: '模型之外',
    learningUse: '明确模型只产生候选，状态、权限、工具执行、验证、监控与恢复属于模型外部系统',
    coverage: ['model-outside-model、状态、工具、权限、验证、观测与恢复'],
    limitations: '正文提供作者的系统责任边界教学叙事，不代表通用产品架构或模型事实，也不构成权限、安全、可靠性和恢复保证。',
  }),
];

const resources = [
  ...legacyResources,
  ...primaryResources,
];

const quiz = (id, prompt, choices, answerIndex, explanation, conceptTags) => ({
  id,
  prompt,
  choices,
  answerIndex,
  explanation,
  conceptTags: [...conceptTags],
});

const lessons = [
  {
    id: 'llm-01', moduleId: 'llm-foundation', order: 1, title: 'AI、机器学习与 LLM', durationMinutes: 70,
    summary: '先建立领域地图，分清模型如何学习、如何被调用，以及 Agent 开发者真正需要深入到哪一层。',
    objectives: ['解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系', '区分训练和推理，以及应用开发和模型开发的职责边界'],
    concepts: ['人工智能', '机器学习', '深度学习', '生成模型', '训练与推理', '应用开发'],
    explanations: [
      { heading: '从能力目标到实现方法', body: '人工智能描述让机器表现出感知、预测、决策或生成能力的目标；机器学习是其中从数据中拟合规律的方法，深度学习又是以多层神经网络为主的一类机器学习方法。生成模型学习数据分布并产生新内容，LLM 则是以语言建模为核心、参数规模和数据规模较大的生成模型。这个层级关系能避免把所有 AI 都等同于聊天机器人。', keyPoints: ['概念是包含关系而不是同义词', 'LLM 是生成模型的一类，不代表全部 AI'] },
      { heading: '开发者站在哪一层', body: '训练阶段通过数据、损失函数与优化算法更新参数；推理阶段固定参数，根据输入逐 token 计算输出。模型开发关注数据、架构、训练效率和对齐，应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。Agent 开发通常从可靠调用现成模型开始，再根据证据决定是否需要检索、微调或更换模型。', keyPoints: ['训练改变参数，推理使用参数', '先用评测定位瓶颈，再选择技术手段'] },
    ],
    resourceIds: ['res-ms-ai', 'res-ms-genai', 'res-hf-llm', 'res-zomi-bili', 'res-ms-agents', 'res-hello-agents', 'res-openai-agents', 'res-llm-primary-javaguide-ai', 'res-llm-primary-javaguide-core-concepts'],
    knowledgeNote: llmFoundationNotes['llm-01'],
    exercise: { title: '画出自己的 AI 学习边界', brief: '用一张关系图说明领域层级，再为一个资料助理 Agent 选择应用开发路线。', steps: ['画出 AI→机器学习→深度学习，以及生成模型→LLM 的关系并补充交叉说明', '列出训练一个基础模型与调用模型构建 Agent 各自至少四项工作', '写下未来两周只做应用开发时要学与暂缓学的内容'], deliverable: '一张概念关系图和一份不超过 300 字的 Agent 应用开发学习路径。' },
    quiz: [
      quiz('quiz-llm-01-1', '下面哪项最准确地描述 LLM 与深度学习的关系？', ['两者完全等价', 'LLM 通常是基于深度学习的生成模型', '深度学习只是 LLM 的推理接口', 'LLM 包含所有机器学习方法'], 1, 'LLM 通常建立在深度神经网络之上，但深度学习还包括视觉、语音等许多模型。', ['field-map', 'model-boundary']),
      quiz('quiz-llm-01-2', 'Agent 应用出现事实错误时，第一步更合理的做法是什么？', ['立刻从头训练模型', '增加所有上下文', '建立可复现样例并定位错误来源', '把温度固定为 1'], 2, '先用样例和评测判断是知识、检索、提示还是模型能力问题，才能选择成本合适的修复手段。', ['application-diagnosis']),
    ],
    interviewQuestionIds: ['iq-llm-01-1', 'iq-llm-01-2', 'iq-llm-01-3'],
    completionCriteria: ['能不看资料画出核心概念关系', '能用训练、推理、应用开发三个视角解释自己的学习范围'],
  },
  {
    id: 'llm-02', moduleId: 'llm-foundation', order: 2, title: '神经网络与反向传播', durationMinutes: 100,
    summary: '沿一次参数更新追踪张量、线性层、激活、损失、梯度和优化器，理解模型为何能从数据中学习。',
    objectives: ['描述前向计算、损失计算、反向传播与参数更新的因果链', '理解梯度含义并识别学习率、激活与数据带来的训练问题'],
    concepts: ['张量', '线性层', '激活函数', '损失函数', '梯度', '优化器'],
    explanations: [
      { heading: '前向计算把参数变成预测', body: '张量是带形状的数值数组，批次、序列、特征等维度决定运算语义。线性层对输入做加权组合并加偏置，激活函数引入非线性，使多层网络不只是一个大线性变换。前向计算最终得到预测，损失函数再把预测与目标之间的差距压缩成可优化的标量，但损失值本身不告诉我们每个参数该如何改变。', keyPoints: ['形状是理解张量计算的第一线索', '损失把任务目标转成优化信号'] },
      { heading: '反向传播分配责任', body: '反向传播应用链式法则，从损失沿计算图反向计算每个参数对损失的局部影响，也就是梯度。优化器利用梯度与学习率更新参数，然后下一批数据重新前向计算。梯度不是“正确答案”，而是当前点附近使损失变化最快的方向；学习率过大可能震荡，过小则学习缓慢，因此训练是一段需要监控的迭代过程。', keyPoints: ['反向传播计算梯度，优化器执行更新', '梯度是局部信息，训练效果还受数据与超参数影响'] },
    ],
    resourceIds: ['res-karpathy', 'res-google-ml', 'res-d2l-zh', 'res-3b1b-nn', 'res-fastai', 'res-llm-primary-javaguide-mechanism'],
    knowledgeNote: llmFoundationNotes['llm-02'],
    exercise: { title: '讲清一次参数更新', brief: '任选一个二分类小例子，不依赖公式堆砌，用自己的话串起一轮学习。', steps: ['给出输入、参数、预测与真实标签，并说明损失为何变大或变小', '从损失反推某个权重的梯度方向，再说明优化器如何修改它', '补充学习率过大和过小时分别可能观察到什么'], deliverable: '一段 200–400 字说明，必须包含前向、损失、梯度和参数更新。' },
    quiz: [
      quiz('quiz-llm-02-1', '反向传播直接产生的核心结果是什么？', ['新的训练数据', '每个相关参数的梯度', '最终部署接口', '固定的正确答案'], 1, '反向传播沿计算图使用链式法则计算梯度，参数修改由优化器随后完成。', ['training-cycle', 'backpropagation', 'optimizer']),
      quiz('quiz-llm-02-2', '多层网络若完全没有非线性激活，主要会怎样？', ['一定无法计算梯度', '多层线性变换仍可合并为一个线性变换', '参数数量自动变成零', '损失函数不再需要'], 1, '线性变换的复合仍是线性变换，网络难以表达复杂的非线性关系。', ['activation']),
    ],
    interviewQuestionIds: ['iq-llm-02-1', 'iq-llm-02-2', 'iq-llm-02-3'],
    completionCriteria: ['能从输入到更新完整口述一次训练迭代', '能解释梯度、学习率和激活函数各自解决什么问题'],
  },
  {
    id: 'llm-03', moduleId: 'llm-foundation', order: 3, title: 'Token、Embedding 与上下文', durationMinutes: 90,
    summary: '理解文本如何变成 token 和向量、位置如何进入表示，并能用预算意识设计上下文。',
    objectives: ['解释 tokenization、embedding、位置表示和上下文窗口的连接方式', '估算提示与输出的 token 预算并说明截断策略的影响'],
    concepts: ['Tokenization', 'Embedding', '上下文窗口', '位置编码', 'Token 预算'],
    explanations: [
      { heading: '文本不是直接进入模型', body: 'Tokenizer 按词表与合并规则把文本编码为 token ID；token 可能是词、子词、标点或字节片段，并不等同于自然语言中的“一个词”。Embedding 表把离散 ID 映射为连续向量，训练过程让可用于预测的相似性和关系体现在向量空间中。模型仍需位置相关信息来区分相同 token 在不同顺序中的作用。', keyPoints: ['字符数、单词数与 token 数不能简单画等号', 'Embedding 是可学习表示，不是字典释义'] },
      { heading: '上下文是一项有限预算', body: '上下文窗口容纳系统指令、历史消息、检索材料、工具结果和待生成内容，超出限制会报错或触发截断策略。即便没有超限，堆入无关或互相冲突的信息也可能稀释有效信号。应用要记录各部分 token 用量，给输出留余量，并根据任务采用摘要、检索、分段或状态化存储，而不是把全部历史无条件拼接。', keyPoints: ['窗口上限不等于有效利用能力', '预算设计同时影响质量、成本和延迟'] },
    ],
    resourceIds: ['res-tiktoken', 'res-hf-llm', 'res-rasbt', 'res-3b1b-transformer', 'res-wangmutou-transformer', 'res-karpathy-build-gpt', 'res-openai-cookbook', 'res-ms-genai', 'res-llm-universe', 'res-llm-primary-javaguide-mechanism', 'res-llm-primary-javaguide-prompt', 'res-llm-primary-feishu-prompt-memory', 'res-llm-primary-feishu-context-offloading'],
    knowledgeNote: llmFoundationNotes['llm-03'],
    exercise: { title: 'Token 与上下文预算实验', brief: '比较中英文、代码和重复历史的 token 数，设计一个不超预算的客服 Agent 输入。', steps: ['用 tokenizer 记录同义中英文句子、JSON 和代码片段的 token 数', '给定窗口预算，分别分配系统指令、历史、检索、用户输入和输出额度', '人为加入无关长文并比较模型回答，再写出截断或摘要策略'], deliverable: '一张预算表、三组 token 计数和一段说明质量变化原因的实验结论。', experiment: 'token-budget' },
    quiz: [
      quiz('quiz-llm-03-1', '关于 token 的说法哪项正确？', ['一个 token 永远等于一个汉字', 'token 边界由 tokenizer 规则决定', 'token 与 embedding 是同一个对象', '所有模型共享完全相同的词表'], 1, '不同 tokenizer 的词表与编码规则不同，同一文本的 token 划分和数量都可能变化。', ['tokenization']),
      quiz('quiz-llm-03-2', '上下文未超过窗口上限时，增加材料为何仍可能变差？', ['模型会自动删除参数', '无关或冲突信息可能干扰注意与指令执行', 'Embedding 会停止工作', '推理会变成训练'], 1, '窗口是容量约束而非质量保证；噪声、冲突和关键证据位置都会影响输出。', ['context-budget', 'context-strategy']),
    ],
    interviewQuestionIds: ['iq-llm-03-1', 'iq-llm-03-2', 'iq-llm-03-3'],
    completionCriteria: ['能用 tokenizer 实测而不是凭字符数猜 token 数', '能为一个真实请求制定包含输出余量的上下文预算'],
  },
  {
    id: 'llm-04', moduleId: 'llm-foundation', order: 4, title: 'Attention 与 Transformer', durationMinutes: 120,
    summary: '从 Q、K、V 的信息选择机制进入多头注意力、残差、归一化和 decoder-only 信息流。',
    objectives: ['用查询、匹配、聚合三步解释 self-attention', '追踪 token 表示经过多头注意力、残差和前馈层的更新过程'],
    concepts: ['Query/Key/Value', 'Self-Attention', '多头注意力', '残差连接', '归一化', 'Decoder-only'],
    explanations: [
      { heading: 'Attention 是按内容读取信息', body: '每个位置的表示分别投影为 Query、Key 和 Value。Query 与其他位置的 Key 计算匹配分数，经过缩放和 softmax 形成权重，再对对应 Value 加权求和，得到当前位置要读取的信息。因果语言模型还使用掩码，阻止当前位置看到未来 token。Q、K、V 不是固定语义标签，而是训练学到的读取机制。', keyPoints: ['Q 与 K 决定读取权重，V 提供被汇总的信息', '因果掩码保证下一 token 训练与生成一致'] },
      { heading: 'Transformer 是可堆叠的表示更新器', body: '多个注意力头可在不同投影子空间学习不同关系，拼接后共同更新表示。残差连接保留旧表示并提供稳定梯度路径，归一化控制数值尺度，逐位置前馈网络对每个 token 的特征做非线性变换。Decoder-only 模型重复这些模块，最后把当前位置表示映射到词表 logits，因此输出源于多层信息混合而非检索一句存好的文本。', keyPoints: ['多头提供多组可学习的信息读取方式', '残差、归一化和前馈层都是完整 Transformer 的关键部分'] },
    ],
    resourceIds: ['res-3b1b-attention', 'res-karpathy', 'res-karpathy-build-gpt', 'res-rasbt', 'res-attention-paper', 'res-happy-llm', 'res-limu-transformer', 'res-wangmutou-transformer', 'res-llm-primary-javaguide-mechanism'],
    knowledgeNote: llmFoundationNotes['llm-04'],
    exercise: { title: '操纵 Attention 直觉实验', brief: '改变一个短句中的 Query-Key 相似度与掩码，观察权重和输出表示如何变化。', steps: ['在交互面板选择某个 token，记录它对其他位置的注意权重', '提高一个 Key 的匹配分数并解释对应 Value 对输出的影响', '打开因果掩码，说明哪些连接被禁止及其训练意义'], deliverable: '两张权重对比记录，以及一段从输入表示到更新表示的信息流解释。', experiment: 'attention' },
    quiz: [
      quiz('quiz-llm-04-1', 'Self-Attention 中最终被加权汇总的是什么？', ['Query 向量', 'Key 向量', 'Value 向量', '损失函数'], 2, 'Query 与 Key 产生权重，权重用于对 Value 加权汇总，从其他位置读取信息。', ['qkv-attention', 'scaled-dot-product']),
      quiz('quiz-llm-04-2', 'decoder-only 语言模型使用因果掩码的主要原因是什么？', ['减少词表大小', '阻止训练位置读取未来 token', '删除所有残差连接', '让每个头参数相同'], 1, '下一 token 预测不能偷看答案，因果掩码让训练时的信息可见性符合生成过程。', ['causal-mask']),
    ],
    interviewQuestionIds: ['iq-llm-04-1', 'iq-llm-04-2', 'iq-llm-04-3'],
    completionCriteria: ['能不用公式也准确解释 Q、K、V 的协作', '能画出 decoder-only Transformer 块并说明信息与梯度通路'],
  },
  {
    id: 'llm-05', moduleId: 'llm-foundation', order: 5, title: '预训练、微调与对齐', durationMinutes: 105,
    summary: '分清基础能力从哪里来、行为如何被塑造，以及微调、LoRA、偏好优化和 RAG 各自解决什么问题。',
    objectives: ['比较预训练、SFT、偏好优化与参数高效微调的目标和成本', '基于知识更新、行为定制和证据引用需求选择微调或 RAG'],
    concepts: ['预训练', 'SFT', '偏好优化', 'LoRA', '数据质量', '微调与 RAG'],
    explanations: [
      { heading: '不同阶段优化不同目标', body: '预训练通常利用大规模文本做下一 token 预测，获得通用语言与模式能力；监督微调使用高质量输入输出示例，把能力塑造成遵循任务和对话格式的行为；偏好优化再利用人类或模型偏好信号，让回答风格、安全性和有用性更符合目标。阶段不是简单“继续喂数据”，每一步的数据分布和目标函数都决定模型会学到什么。', keyPoints: ['预训练建立通用能力，后训练塑造可用行为', '高质量且与目标匹配的数据常比盲目增加数量更重要'] },
      { heading: '微调、LoRA 与 RAG 的选择', body: '全量微调更新大量参数，资源和运维成本高；LoRA 冻结主体参数并训练低秩增量，降低训练与存储成本，但仍需要数据和评测。RAG 在推理时检索外部资料，不把新事实写入模型参数，因而更适合频繁变化、需要引用或权限隔离的知识。若问题是输出格式和稳定行为，可考虑微调；若问题是可更新事实与出处，通常先验证 RAG。', keyPoints: ['LoRA 降低参数更新成本但不消除数据与评测成本', '行为定制与知识注入是不同问题'] },
    ],
    resourceIds: ['res-rasbt', 'res-happy-llm', 'res-hf-llm', 'res-stanford-cs336', 'res-ms-genai', 'res-openai-cookbook', 'res-llm-primary-javaguide-core-concepts', 'res-llm-primary-feishu-version-drifting'],
    knowledgeNote: llmFoundationNotes['llm-05'],
    exercise: { title: '训练方案决策表', brief: '为客服语气、公司制度问答和专业分类三个需求比较技术路线。', steps: ['分别写出预训练、SFT、偏好优化、LoRA 和 RAG 的直接优化目标', '从数据、计算、更新频率、可引用性和风险五个维度评分', '为三个需求选择方案并写出在上线前必须通过的评测'], deliverable: '一张目标—成本—用例对比表，以及三项有证据链的技术选择。' },
    quiz: [
      quiz('quiz-llm-05-1', '需要每天更新且回答必须给出处的制度知识，优先验证哪种方案？', ['从头预训练', 'RAG', '只提高温度', '删除系统指令'], 1, 'RAG 可在推理时使用可更新、可引用的外部资料，也更容易做权限与版本管理。', ['method-selection', 'rag-finetuning']),
      quiz('quiz-llm-05-2', 'LoRA 的核心取舍更接近哪项？', ['完全不训练任何参数', '只训练低秩增量以降低微调资源成本', '自动消除幻觉', '把上下文窗口变成无限'], 1, 'LoRA 冻结大部分原参数并学习低秩适配参数，但仍需训练数据、验证与部署管理。', ['lora']),
    ],
    interviewQuestionIds: ['iq-llm-05-1', 'iq-llm-05-2', 'iq-llm-05-3'],
    completionCriteria: ['能按目标而不是按流行度选择 RAG 或微调', '能解释预训练、SFT、偏好优化与 LoRA 的关系和边界'],
  },
  {
    id: 'llm-06', moduleId: 'llm-foundation', order: 6, title: '推理、采样与 KV Cache', durationMinutes: 90,
    summary: '跟踪 logits 到 token 的生成过程，理解采样参数、停止条件、KV Cache 对质量、延迟和显存的影响。',
    objectives: ['解释 logits、softmax、temperature、top-p 和 stop 如何共同决定输出', '区分 prefill 与 decode，并说明 KV Cache 的收益和资源代价'],
    concepts: ['Logits', 'Softmax', 'Temperature', 'Top-p', 'Stop 条件', 'KV Cache'],
    explanations: [
      { heading: '从分数到下一个 token', body: '模型最后一层为词表中每个候选 token 产生 logits，它们是未归一化分数。softmax 将其转换成概率分布；temperature 通过缩放 logits 改变分布尖锐程度，top-p 则保留累计概率达到阈值的最小候选集合再采样。二者都不会修复知识错误，只是在给定模型分布上改变随机性与候选范围，实际接口还会结合最大输出和 stop 条件终止。', keyPoints: ['采样参数改变选择过程，不增加模型知识', '低温通常更集中，但不等于绝对确定或必然正确'] },
      { heading: '缓存已经计算过的上下文', body: 'prefill 阶段并行处理输入上下文并为每层计算 Key、Value；decode 阶段逐 token 生成。若每一步都重新计算整个前缀会大量重复工作，KV Cache 保存历史位置的 Key、Value，让新 token 只需计算自身并读取缓存。它显著降低重复计算，却会随序列长度、批量和模型结构占用显存，因此长上下文与高并发需要在延迟、吞吐和内存之间取舍。', keyPoints: ['KV Cache 复用的是注意力中的历史 K/V，不是最终答案', '缓存加速 decode，但内存压力会影响可服务并发'] },
    ],
    resourceIds: ['res-hf-llm', 'res-karpathy', 'res-rasbt', 'res-openai-cookbook', 'res-zomi-bili', 'res-llm-primary-javaguide-mechanism', 'res-llm-primary-feishu-version-drifting'],
    knowledgeNote: llmFoundationNotes['llm-06'],
    exercise: { title: '采样参数对比实验', brief: '固定提示，组合调整 temperature 与 top-p，比较稳定性、多样性和任务适配。', steps: ['用同一提示在低温与高温下各生成多次，记录重复率和错误类型', '固定 temperature 后逐步收窄 top-p，观察候选变化', '为代码生成、创意标题和结构化抽取分别选择参数并说明理由'], deliverable: '至少六次输出的对比表，以及面向三类任务的参数决策说明。', experiment: 'sampling' },
    quiz: [
      quiz('quiz-llm-06-1', 'temperature 调高通常直接改变什么？', ['训练数据', 'logits 转换后的概率分布形状', '上下文窗口硬上限', 'KV Cache 层数'], 1, 'temperature 缩放 logits，使概率分布通常更平或更尖，从而影响采样多样性。', ['logit-softmax', 'temperature-top-p']),
      quiz('quiz-llm-06-2', 'KV Cache 加速自回归生成的原因是什么？', ['缓存历史 token 的 K/V，避免每步重复计算全部前缀', '提前存下所有正确答案', '减少模型参数数量', '取消注意力计算'], 0, '历史位置的 K/V 在后续步可复用，新 token 仍要计算并与缓存做注意力。', ['kv-cache']),
    ],
    interviewQuestionIds: ['iq-llm-06-1', 'iq-llm-06-2', 'iq-llm-06-3'],
    completionCriteria: ['能从 logits 讲到采样和停止条件', '能说明 KV Cache 为什么提速、为什么又限制长上下文并发'],
  },
  {
    id: 'llm-07', moduleId: 'llm-foundation', order: 7, title: 'Prompt 与结构化输出', durationMinutes: 85,
    summary: '把提示从措辞技巧升级为可验证接口：明确指令层级、示例、约束、Schema、解析和重试策略。',
    objectives: ['设计边界清楚、优先级明确且包含少量示例的提示契约', '使用 JSON Schema、校验、错误反馈与有限重试构建可靠输出链路'],
    concepts: ['指令层级', 'Few-shot', '约束', 'JSON Schema', '验证与重试'],
    explanations: [
      { heading: 'Prompt 是运行时规格', body: '系统或开发者指令定义稳定规则，用户输入表达本次目标，工具结果与检索内容提供数据但不应自然获得更高权限。好的提示说明任务、输入边界、成功标准和禁止事项，并用少量代表性示例消除格式或分类歧义。示例不是越多越好：它们会占上下文，也可能把偶然模式变成模型错误遵循的惯例。', keyPoints: ['区分指令与不可信数据的权限', '示例用于澄清决策边界而不是堆砌上下文'] },
      { heading: '结构化输出需要闭环验证', body: '要求“返回 JSON”只是自然语言愿望；生产系统应提供可机器检查的 Schema，约束字段、类型、枚举和必填项，再在服务端解析与校验。失败时把精简的验证错误反馈给模型并限制重试次数，仍失败则进入降级或人工路径。即使语法通过，也要继续做业务校验，因为合法的日期、ID 或金额仍可能在业务上无效。', keyPoints: ['语法校验与业务校验是两层防线', '重试必须有边界、可观测并避免重复副作用'] },
    ],
    resourceIds: ['res-ms-genai', 'res-openai-cookbook', 'res-llm-universe', 'res-hf-agents', 'res-owasp-prompt-injection', 'res-llm-primary-javaguide-prompt', 'res-llm-primary-javaguide-api', 'res-llm-primary-javaguide-structured-output', 'res-llm-primary-feishu-tool-truth', 'res-llm-primary-feishu-claude-tools'],
    knowledgeNote: llmFoundationNotes['llm-07'],
    exercise: { title: '设计结构化输出契约', brief: '为工单分类器设计提示、JSON Schema、验证错误和降级行为。', steps: ['定义类别、优先级、理由和证据字段，写出必填、类型和枚举约束', '加入两个边界示例与一条不可信工单内容，明确它不能覆盖系统规则', '设计解析失败、业务校验失败和连续失败时的不同处理'], deliverable: '一份提示模板、一份 JSON Schema 和带最大重试次数的伪代码。' },
    quiz: [
      quiz('quiz-llm-07-1', '模型返回了可解析 JSON，生产系统下一步应做什么？', ['直接执行所有动作', '继续做 Schema 与业务规则校验', '删除日志', '把温度调到最高'], 1, '语法正确不代表字段齐全或业务有效，必须在可信代码中执行结构与业务校验。', ['schema-pipeline']),
      quiz('quiz-llm-07-2', '检索文档中出现“忽略之前规则”时，应如何理解？', ['它自动升级为系统指令', '它属于不可信数据，不能覆盖更高层规则', '它证明模型已被微调', '它应无限重试'], 1, '外部内容是任务数据而不是授权来源，应用要通过边界、权限和工具校验抵抗注入。', ['instruction-boundary']),
    ],
    interviewQuestionIds: ['iq-llm-07-1', 'iq-llm-07-2', 'iq-llm-07-3'],
    completionCriteria: ['能把一个模糊提示改写成包含成功标准和边界的契约', '能实现 Schema 校验、有限重试与安全降级流程'],
  },
  {
    id: 'llm-08', moduleId: 'llm-foundation', order: 8, title: '能力边界、评测与安全', durationMinutes: 110,
    summary: '承认概率模型的不确定性，并用分层评测、威胁建模、成本与延迟预算把 LLM 功能变成可运营系统。',
    objectives: ['区分幻觉、非确定性、上下文污染与提示注入的成因和缓解手段', '为一个 LLM 功能设计离线评测、线上监控、安全边界和成本延迟预算'],
    concepts: ['幻觉', '非确定性', '上下文污染', 'Evals', 'Prompt Injection', '成本与延迟'],
    explanations: [
      { heading: '错误不是一个开关能消除', body: 'LLM 根据条件概率生成连贯 token，并不内置事实数据库或真值验证器，因此可能在缺少证据时给出流畅但错误的回答。采样、服务差异和模糊输入带来非确定性；无关历史、错误检索或冲突规则造成上下文污染。缓解需要按失败类型组合检索证据、引用、工具计算、拒答、结构校验和人工复核，而不是宣称某个提示能“彻底消除幻觉”。', keyPoints: ['先给失败分类，再选择控制措施', '语言流畅度不能作为事实正确性的代理指标'] },
      { heading: '用评测和边界管理系统', body: '离线评测应从真实任务与失败日志构建版本化样本，分别测任务质量、证据忠实度、格式、安全和延迟成本；线上监控关注分布变化、异常率与用户反馈。Prompt injection 的本质是不可信内容试图改变控制流，防御必须延伸到最小工具权限、参数校验、敏感动作确认和输出隔离。最终要把准确率、尾延迟、token 成本与风险共同放进发布门槛。', keyPoints: ['评测集要覆盖正常、边界、对抗和回归样例', '模型提示不是安全边界，权限与执行控制必须由系统保证'] },
    ],
    resourceIds: ['res-anthropic-agents', 'res-openai-cookbook', 'res-openai-evals', 'res-owasp-prompt-injection', 'res-ms-genai', 'res-hf-agents', 'res-llm-universe', 'res-llm-primary-javaguide-evaluation', 'res-llm-primary-feishu-version-drifting', 'res-llm-primary-feishu-beyond-model'],
    knowledgeNote: llmFoundationNotes['llm-08'],
    exercise: { title: 'LLM 功能测试清单', brief: '为“读取知识库并起草退款答复”的功能建立发布前检查表。', steps: ['收集正常、信息不足、冲突材料、超长上下文和对抗指令样例', '为正确性、忠实度、格式、安全、成本和 P95 延迟定义指标与阈值', '列出工具最小权限、高风险操作确认、日志脱敏和失败降级方案'], deliverable: '一份至少 15 条用例、含指标与责任人的发布检查表。' },
    quiz: [
      quiz('quiz-llm-08-1', '以下哪项最能构成 Prompt Injection 的系统性防线？', ['只在提示里写“不要被攻击”', '最小权限、输入标记、参数校验和敏感动作确认', '无限扩大上下文', '隐藏所有错误'], 1, '提示可辅助模型识别风险，但真正的安全边界来自权限、验证、隔离和人工控制。', ['injection-defense', 'model-application-boundary']),
      quiz('quiz-llm-08-2', '高质量离线评测集应该主要从哪里演进？', ['只用随机百科问题', '真实需求、边界条件与生产失败样例', '只保留模型答对的题', '每次发布都换成完全不同指标'], 1, '真实任务和失败日志让评测能预测用户风险，版本化固定集还能发现回归。', ['eval-funnel']),
    ],
    interviewQuestionIds: ['iq-llm-08-1', 'iq-llm-08-2', 'iq-llm-08-3'],
    completionCriteria: ['能为常见错误选择对应的评测与缓解方案', '能提交兼顾质量、安全、成本和延迟的上线门槛'],
  },
];

const interviewSpecs = [
  {
    id: 'iq-llm-01-1', lessonId: 'llm-01', question: 'AI、机器学习、深度学习和 LLM 是什么关系？',
    shortAnswer: 'AI 是能力目标的总称，机器学习是从数据学习的方法，深度学习是其中以多层神经网络为主的分支；LLM 通常是基于深度学习、执行语言建模的生成模型。',
    deepDive: ['强调它们是包含与交叉关系，AI 还包括搜索、规划等非学习方法，深度学习也不只处理语言。', '工程上要把“使用模型能力”和“训练模型能力”分开，否则容易为应用问题选择过重方案。'],
    misconceptions: ['把 AI、深度学习、LLM 和聊天产品当成完全同义词。'], followUps: ['生成模型与判别模型的目标有什么区别？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-01-2', lessonId: 'llm-01', question: '训练和自回归推理的核心区别是什么？',
    shortAnswer: '训练通过数据、损失、反向传播和优化器反复更新参数，目标是学到可泛化规律；自回归推理固定已部署参数，读取当前 token 上下文形成下一 token 分布，选择并追加一个 token 后重复，直到命中停止条件。',
    deepDive: ['训练闭环包含前向、损失、反向和更新，只有优化器写回参数；验证与标准推理都只读使用参数。', '自回归推理可分 prefill 和逐 token decode，应用还需管理缓存、并发、采样、停止原因和失败重试。'],
    misconceptions: ['认为把新文档放进 prompt 就是在继续训练模型。'], followUps: ['为什么自回归推理难以完全并行？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-01-3', lessonId: 'llm-01', question: 'Agent 应用开发与模型开发如何取舍？',
    shortAnswer: '先依据业务指标验证现成模型加提示、工具和检索能否满足需求；只有当评测证明瓶颈来自模型行为或能力，并且数据和收益足够时，才进入微调甚至训练。',
    deepDive: ['应用层迭代快，能通过上下文、工作流和确定性代码修复大量问题。', '模型层改动成本高且可能引入回归，需要数据治理、训练基础设施和更广泛评测。'],
    misconceptions: ['认为模型越大或训练越深，应用一定越可靠。'], followUps: ['什么证据会让你决定进行微调？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-02-1', lessonId: 'llm-02', question: '请解释神经网络一次参数更新，并说明学习率的作用。',
    shortAnswer: '输入经过带参数的层得到预测，损失函数度量预测和目标的差距，反向传播用链式法则得到参数梯度，优化器按学习率控制的步长更新参数，再用新批次重复；学习率过小会使收敛缓慢，过大则可能越过低谷、震荡甚至发散。',
    deepDive: ['梯度表示当前点附近参数微小变化对损失的影响，不是全局最优方向保证；学习率把这个局部方向转换为实际更新步长。', '监控训练和验证损失可区分学习率不当、其他优化困难与泛化问题，还需观察梯度尺度和数据质量。'],
    misconceptions: ['把反向传播和优化器更新当成同一步，或认为梯度就是参数的新值。'], followUps: ['学习率过大会出现什么现象？'],
    frequency: '高', difficulty: '基础', roles: ['AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-02-2', lessonId: 'llm-02', question: '激活函数为什么重要？',
    shortAnswer: '激活函数引入非线性，使多层网络能够表达复杂决策边界；如果层与层之间全是线性变换，无论堆多少层，整体仍可化为单个线性变换。',
    deepDive: ['激活还影响梯度传播和数值分布，因此不同架构会选择适合的平滑性与计算特性。', '表达能力不等于易训练，残差、归一化和初始化仍影响深层网络优化。'],
    misconceptions: ['认为激活函数只是把输出限制到固定范围，删掉也不影响表达。'], followUps: ['梯度消失与激活选择有什么关系？'],
    frequency: '中', difficulty: '基础', roles: ['AI 应用'],
  },
  {
    id: 'iq-llm-02-3', lessonId: 'llm-02', question: '损失下降是否代表模型已经可上线？',
    shortAnswer: '不代表。训练损失下降只说明模型更贴合训练目标，还要检查独立验证集、真实业务切片、安全用例和成本延迟；过拟合或目标错配都可能让低损失模型上线失败。',
    deepDive: ['训练目标往往只是业务目标的代理，需要用任务级指标补足。', '按人群、语言、长度和风险切片能发现平均分掩盖的局部失败。'],
    misconceptions: ['只看训练 loss 或单一平均准确率就判断生产质量。'], followUps: ['如何设计避免数据泄漏的验证集？'],
    frequency: '中', difficulty: '进阶', roles: ['AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-03-1', lessonId: 'llm-03', question: 'Token 和词有什么区别？',
    shortAnswer: 'Token 是 tokenizer 按词表与编码规则产生的模型输入单位，可能是词、子词、汉字、标点或字节片段；同一文本在不同模型上可能得到完全不同的 token 划分。',
    deepDive: ['token ID 经过 embedding 查表变为向量，ID 数字本身没有距离语义。', '计费、窗口和生成上限通常以 token 计，因此应用必须用目标模型 tokenizer 实测。'],
    misconceptions: ['按一个汉字或一个英文单词等于一个 token 来固定估算。'], followUps: ['为什么代码或罕见字符可能消耗更多 token？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-03-2', lessonId: 'llm-03', question: 'Embedding 是什么，为什么能表达语义？',
    shortAnswer: 'Embedding 把离散 token ID 映射为连续向量；训练目标推动能产生相似预测作用的表示形成可利用的几何关系，但向量不是人工编写的词义表，也会受上下文继续更新。',
    deepDive: ['输入 embedding 是初始表示，经过多层注意力后会成为上下文化表示。', 'RAG 的向量 embedding 与生成模型内部 token embedding 用途相关但不一定是同一模型或空间。'],
    misconceptions: ['认为每个词只有一个永远不变、可直接解释的语义坐标。'], followUps: ['相似度高为什么不保证检索结果一定相关？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-03-3', lessonId: 'llm-03', question: '如何管理长上下文，而不是简单塞满窗口？',
    shortAnswer: '先给系统指令、用户输入、历史、检索和输出分配 token 预算，再按任务保留高价值证据，使用检索、摘要、分段或结构化状态压缩历史，并对截断和冲突做评测。',
    deepDive: ['窗口上限只保证可容纳，不保证模型能同等利用每个位置的信号。', '长上下文同时增加输入成本、prefill 延迟和被不可信内容污染的攻击面。'],
    misconceptions: ['认为上下文越长答案必然越好，或输出不需要预留预算。'], followUps: ['摘要历史可能丢失哪些信息，如何检测？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-04-1', lessonId: 'llm-04', question: '请用直觉解释 Q、K、V。',
    shortAnswer: '当前位置用 Query 表达想找什么，每个可见位置用 Key 表达可被怎样匹配，二者相似度形成读取权重；最后按这些权重汇总对应 Value，把相关信息写回当前位置表示。',
    deepDive: ['Q、K、V 都是从当前表示经不同参数投影得到，语义由训练形成。', '缩放点积控制数值范围，softmax 形成权重，因果掩码在 softmax 前屏蔽未来位置。'],
    misconceptions: ['把 Q、K、V 当成固定的问句、数据库键和原始文本。'], followUps: ['为什么需要除以 Key 维度平方根？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-04-2', lessonId: 'llm-04', question: '多头注意力比单头多了什么？',
    shortAnswer: '多头注意力用多组独立投影并行产生多种信息读取方式，让模型可同时建模不同位置关系与特征子空间；各头结果拼接再投影，形成一次联合更新。',
    deepDive: ['头并没有预设“语法头”或“指代头”，功能是训练后涌现且可能冗余。', '增加头数会改变参数、计算和单头维度，不能简单等同于线性增加能力。'],
    misconceptions: ['认为每个注意力头都由开发者预先分配固定任务。'], followUps: ['如果多个头学到相似模式会怎样？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-04-3', lessonId: 'llm-04', question: '残差连接和归一化在 Transformer 中做什么？',
    shortAnswer: '残差让子层学习对原表示的增量并提供更直接的梯度路径，归一化控制表示尺度、改善数值与优化稳定性；它们不负责内容匹配，却让深层堆叠更可训练。',
    deepDive: ['残差路径也保留旧信息，使注意力或前馈层无需每次重建全部表示。', 'Pre-Norm 与 Post-Norm 放置不同，会影响深层训练稳定性与最终行为。'],
    misconceptions: ['认为 Transformer 只有注意力，其他模块只是可删除的装饰。'], followUps: ['decoder-only 与 encoder-decoder 的可见性有什么不同？'],
    frequency: '中', difficulty: '深挖', roles: ['AI 应用'],
  },
  {
    id: 'iq-llm-05-1', lessonId: 'llm-05', question: '预训练、SFT 和偏好优化分别解决什么？',
    shortAnswer: '预训练用大规模数据建立通用语言与模式能力，SFT 用高质量示例教会任务格式和指令行为，偏好优化利用成对偏好或奖励信号进一步塑造有用性、安全性与回答风格。',
    deepDive: ['三个阶段的目标与数据分布不同，后训练不能凭空补回预训练从未获得的基础能力。', '对齐是多目标权衡，过度优化单一偏好可能牺牲信息量、校准或任务表现。'],
    misconceptions: ['把 SFT、RLHF 或所有后训练方法统称为继续预训练，忽略目标差异。'], followUps: ['为什么偏好数据也可能引入系统性偏差？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-05-2', lessonId: 'llm-05', question: '微调和 RAG 应该如何选择？',
    shortAnswer: '需要改变稳定行为、领域表达或特定任务映射时可评估微调；需要频繁更新的事实、出处或权限隔离时通常优先 RAG。两者可组合，但都必须由失败样例和业务评测驱动。',
    deepDive: ['RAG 的上限受文档质量、切分、召回、排序和上下文使用共同影响。', '微调把模式写入参数，更新与回滚更重，也无法天然提供事实来源和实时性。'],
    misconceptions: ['把微调当成可靠灌入私有知识的唯一方法，或认为 RAG 不需要评测。'], followUps: ['什么场景会同时使用 RAG 与微调？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-05-3', lessonId: 'llm-05', question: 'LoRA 为什么能降低微调成本？',
    shortAnswer: 'LoRA 冻结原模型权重，在目标层旁学习低秩矩阵的增量，用少量可训练参数近似所需权重更新；因此训练显存、存储和多任务适配成本通常更低。',
    deepDive: ['低秩假设限制了可表达的更新空间，rank 和目标层选择会影响效果与成本。', '基础模型仍需加载，推理时可合并增量或动态挂载，不等于模型总体积消失。'],
    misconceptions: ['认为 LoRA 不需要 GPU、数据或验证，或者必然等价于全量微调。'], followUps: ['如何选择 rank 和目标模块？'],
    frequency: '中', difficulty: '深挖', roles: ['AI 应用'],
  },
  {
    id: 'iq-llm-06-1', lessonId: 'llm-06', question: 'temperature 与 top-p 在逐 token 采样循环中分别做什么？',
    shortAnswer: '每个 decode 步先产生 logits，temperature 缩放它们，softmax 得到概率，top-p 再保留累计质量达到阈值的最小候选集合；系统从集合中采样一个 token，追加到上下文并更新 KV Cache，然后检查停止条件，未停止就进入下一步。',
    deepDive: ['temperature 整体改变分布尖锐程度，top-p 动态改变可参与采样的候选集合；两者都不增加知识或保证正确。', '低温使高分 token 更占优势，高温扩大低分候选影响；top-p 的候选数量随每一步分布变化，参数应按任务通过重复试验选择。'],
    misconceptions: ['认为 temperature 为零就能让跨版本、跨服务的输出绝对一致。'], followUps: ['结构化抽取和创意写作会如何设置采样？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-06-2', lessonId: 'llm-06', question: 'KV Cache 的原理和代价是什么？',
    shortAnswer: '自回归解码时，历史 token 在各层注意力中的 Key、Value 可复用；KV Cache 保存它们，避免每步重算全部前缀。代价是缓存随层数、序列、批量等增长，占用显存并限制并发。',
    deepDive: ['prefill 计算整段输入的 K/V，decode 每步追加新位置并读取历史缓存。', '分页缓存、量化、前缀复用和请求调度都在优化内存碎片、命中率与吞吐取舍。'],
    misconceptions: ['把 KV Cache 当成语义检索缓存，或认为它能缓存模型最终答案。'], followUps: ['长上下文为什么会降低可服务并发？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', '后端工程'],
  },
  {
    id: 'iq-llm-06-3', lessonId: 'llm-06', question: '如何降低 LLM 推理延迟与成本？',
    shortAnswer: '先拆分首 token 延迟、生成速度与排队时间，再减少无效上下文和输出，选择合适模型，使用缓存、批处理、并发限制、流式返回和必要的量化，同时守住质量评测。',
    deepDive: ['prefill 更受输入长度与并行计算影响，decode 更受逐 token 内存访问和输出长度影响。', '模型路由和结果缓存可能大幅降本，但必须定义可缓存语义、失效规则与隐私隔离。'],
    misconceptions: ['只压缩 prompt 字符数而不测 token，或只看平均延迟忽略尾延迟。'], followUps: ['你会如何诊断 P95 延迟突然升高？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', '后端工程'],
  },
  {
    id: 'iq-llm-07-1', lessonId: 'llm-07', question: '怎样设计一个健壮的 Prompt？',
    shortAnswer: '明确角色不是重点，关键是写清任务、输入边界、约束、成功标准和失败行为，区分高层指令与不可信数据，用少量边界示例消除歧义，并用评测而非主观感觉迭代。',
    deepDive: ['将稳定规则放在更高层，把用户与检索内容明确标记为数据，降低指令混淆。', '提示版本应与模型版本、评测集和变更记录绑定，才能发现回归。'],
    misconceptions: ['迷信神奇措辞或超长角色设定，忽略输入契约与测试。'], followUps: ['few-shot 示例应该如何选择？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用'],
  },
  {
    id: 'iq-llm-07-2', lessonId: 'llm-07', question: '结构化输出为什么还需要服务端校验？',
    shortAnswer: '模型输出本质仍是不可信数据，即使语法是 JSON，也可能缺字段、类型错误、枚举越界或业务值无效；服务端必须做 Schema 与业务校验，再有限重试、降级或人工处理。',
    deepDive: ['Schema 解决结构契约，跨字段一致性、数据库存在性和权限仍由业务代码检查。', '重试应带精简错误反馈并限制次数；有副作用的操作需使用幂等键避免重复执行。'],
    misconceptions: ['认为提示里要求 JSON 或 API 的结构化模式能替代所有业务验证。'], followUps: ['重试仍失败时如何优雅降级？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-07-3', lessonId: 'llm-07', question: '指令层级与 Prompt Injection 有什么关系？',
    shortAnswer: '层级规定不同来源指令的优先级，但外部文档或工具结果可能伪装成指令诱导模型。应用必须把它们视作不可信数据，并在模型之外实施权限、参数和动作确认控制。',
    deepDive: ['提示边界能降低模型混淆概率，却不是强安全隔离，模型仍可能误遵循内容。', '最小权限让一次注入即使成功影响模型，也无法直接扩大为高危系统操作。'],
    misconceptions: ['认为只写一句“忽略恶意指令”即可彻底防住注入。'], followUps: ['间接 Prompt Injection 的攻击路径是什么？'],
    frequency: '高', difficulty: '深挖', roles: ['Agent 开发', '后端工程'],
  },
  {
    id: 'iq-llm-08-1', lessonId: 'llm-08', question: '为什么 LLM 会产生幻觉，如何缓解？',
    shortAnswer: 'LLM 优化的是在上下文下生成高概率 token，并不自动验证事实；信息不足、错误上下文和目标错配都可能产生流畅错误。应按场景组合证据检索、引用、工具、拒答、校验和人工复核。',
    deepDive: ['先区分知识缺失、检索失败、推理错误与格式错误，否则缓解措施容易错位。', '事实性任务应评估答案与证据的一致性，而不是只评估语言质量或关键词重合。'],
    misconceptions: ['宣称调低 temperature 或增加一句提示就能完全消除幻觉。'], followUps: ['如何量化检索问答的忠实度？'],
    frequency: '高', difficulty: '基础', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-08-2', lessonId: 'llm-08', question: '怎样构建有效的 LLM Evals？',
    shortAnswer: '从真实需求与失败日志构建版本化样本，覆盖正常、边界和对抗场景；按任务质量、证据、格式、安全、成本和延迟分层指标，用人工规则、代码和模型评审组合，并持续回归。',
    deepDive: ['评测样本要防污染并按业务分布切片，平均分之外还要看高风险失败率。', '模型裁判需用人工标注做校准，控制位置偏差、措辞偏差和与被测模型同源的盲点。'],
    misconceptions: ['只跑通用 benchmark 或几十个随手问题就代表生产质量。'], followUps: ['LLM-as-a-judge 应如何校准？'],
    frequency: '高', difficulty: '进阶', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
  {
    id: 'iq-llm-08-3', lessonId: 'llm-08', question: '如何同时管理质量、安全、成本和延迟？',
    shortAnswer: '先定义各维度可测的服务目标与不可突破的安全门槛，再用模型路由、上下文预算、缓存、工具确定性和人工升级做分层处理；发布决策看 Pareto 权衡而非单一最高分。',
    deepDive: ['低风险高频请求可走小模型或缓存，高风险动作应增加验证、权限和人工确认。', '在线追踪 token、首 token 延迟、尾延迟、错误类型和用户反馈，才能发现流量分布变化。'],
    misconceptions: ['认为换最大模型能同时自动解决质量、安全、成本和性能问题。'], followUps: ['什么请求适合路由到更强模型？'],
    frequency: '高', difficulty: '深挖', roles: ['Agent 开发', 'AI 应用', '后端工程'],
  },
];

const interviewConceptTags = {
  'iq-llm-01-1': ['field-map', 'model-boundary'],
  'iq-llm-01-2': [
    'training-inference-boundary',
    'autoregressive-generation',
  ],
  'iq-llm-01-3': ['application-diagnosis'],
  'iq-llm-02-1': [
    'training-cycle',
    'backpropagation',
    'optimizer',
    'learning-rate',
  ],
  'iq-llm-02-2': ['activation'],
  'iq-llm-02-3': ['generalization'],
  'iq-llm-03-1': ['tokenization'],
  'iq-llm-03-2': ['embedding-position'],
  'iq-llm-03-3': ['context-budget', 'context-strategy'],
  'iq-llm-04-1': ['qkv-attention', 'scaled-dot-product'],
  'iq-llm-04-2': ['multi-head'],
  'iq-llm-04-3': ['transformer-block'],
  'iq-llm-05-1': ['training-stages', 'preference-boundary'],
  'iq-llm-05-2': ['method-selection', 'rag-finetuning'],
  'iq-llm-05-3': ['lora'],
  'iq-llm-06-1': [
    'logit-softmax',
    'temperature-top-p',
    'sampling-loop',
  ],
  'iq-llm-06-2': ['kv-cache', 'latency-cost'],
  'iq-llm-06-3': ['latency-cost'],
  'iq-llm-07-1': ['runtime-contract', 'instruction-boundary', 'versioned-evaluation'],
  'iq-llm-07-2': ['schema-pipeline', 'retry-repair'],
  'iq-llm-07-3': ['instruction-boundary'],
  'iq-llm-08-1': ['failure-taxonomy', 'grounding'],
  'iq-llm-08-2': ['eval-funnel'],
  'iq-llm-08-3': ['release-pareto'],
};

const interviewQuestions = interviewSpecs.map((spec) => ({
  ...spec,
  conceptTags: [...interviewConceptTags[spec.id]],
}));

const visualOutcomes = {
  'visual-llm-01-field-map': ['field-map', 'model-boundary'],
  'visual-llm-01-learning-loop': ['training-inference-boundary'],
  'visual-llm-01-autoregressive-generation': ['autoregressive-generation'],
  'visual-llm-01-training-inference-boundary': ['training-inference-boundary'],
  'visual-llm-01-application-decision-stack': ['application-diagnosis'],
  'visual-llm-02-training-cycle': ['training-cycle', 'optimizer'],
  'visual-llm-02-neuron-forward': ['activation'],
  'visual-llm-02-backprop-graph': ['backpropagation'],
  'visual-llm-02-learning-rate-trajectories': ['learning-rate', 'optimizer'],
  'visual-llm-02-generalization-curves': ['generalization'],
  'visual-llm-03-text-to-context': ['tokenization', 'embedding-position'],
  'visual-llm-03-tokenization-comparison': ['tokenization'],
  'visual-llm-03-embedding-position-space': ['embedding-position'],
  'visual-llm-03-context-budget': ['context-budget'],
  'visual-llm-03-context-strategy-matrix': ['context-strategy'],
  'visual-llm-04-decoder-block': ['transformer-block'],
  'visual-llm-04-qkv-flow': ['qkv-attention'],
  'visual-llm-04-score-mask-softmax': ['scaled-dot-product'],
  'visual-llm-04-multi-head-merge': ['multi-head'],
  'visual-llm-04-causal-visibility': ['causal-mask'],
  'visual-llm-05-method-map': ['method-selection'],
  'visual-llm-05-stage-objectives': ['training-stages'],
  'visual-llm-05-preference-boundary': ['preference-boundary'],
  'visual-llm-05-lora-update': ['lora'],
  'visual-llm-05-rag-finetune-matrix': ['rag-finetuning'],
  'visual-llm-06-generation-loop': ['sampling-loop'],
  'visual-llm-06-logit-softmax': ['logit-softmax'],
  'visual-llm-06-temperature-top-p': ['temperature-top-p'],
  'visual-llm-06-kv-cache': ['kv-cache'],
  'visual-llm-06-latency-breakdown': ['latency-cost'],
  'visual-llm-07-runtime-contract': ['runtime-contract'],
  'visual-llm-07-instruction-boundary': ['instruction-boundary'],
  'visual-llm-07-schema-pipeline': ['schema-pipeline'],
  'visual-llm-07-retry-state-machine': ['retry-repair'],
  'visual-llm-07-version-eval-loop': ['versioned-evaluation'],
  'visual-llm-08-failure-map': ['failure-taxonomy'],
  'visual-llm-08-grounding-chain': ['grounding'],
  'visual-llm-08-eval-funnel': ['eval-funnel'],
  'visual-llm-08-injection-defense': ['injection-defense', 'model-application-boundary'],
  'visual-llm-08-release-pareto': ['release-pareto'],
};

const assessmentOutcomes = Object.fromEntries([
  ...lessons.flatMap((lesson) => lesson.quiz.map((assessment) => [
    assessment.id,
    { lessonId: lesson.id, outcomeTags: [...assessment.conceptTags] },
  ])),
  ...interviewQuestions.map((assessment) => [
    assessment.id,
    { lessonId: assessment.lessonId, outcomeTags: [...assessment.conceptTags] },
  ]),
]);

const assessmentVisualCoverage = {
  'quiz-llm-01-1': ['visual-llm-01-field-map'],
  'quiz-llm-01-2': ['visual-llm-01-application-decision-stack'],
  'quiz-llm-02-1': [
    'visual-llm-02-training-cycle',
    'visual-llm-02-backprop-graph',
  ],
  'quiz-llm-02-2': ['visual-llm-02-neuron-forward'],
  'quiz-llm-03-1': ['visual-llm-03-tokenization-comparison'],
  'quiz-llm-03-2': [
    'visual-llm-03-context-budget',
    'visual-llm-03-context-strategy-matrix',
  ],
  'quiz-llm-04-1': [
    'visual-llm-04-qkv-flow',
    'visual-llm-04-score-mask-softmax',
  ],
  'quiz-llm-04-2': ['visual-llm-04-causal-visibility'],
  'quiz-llm-05-1': [
    'visual-llm-05-method-map',
    'visual-llm-05-rag-finetune-matrix',
  ],
  'quiz-llm-05-2': ['visual-llm-05-lora-update'],
  'quiz-llm-06-1': [
    'visual-llm-06-logit-softmax',
    'visual-llm-06-temperature-top-p',
  ],
  'quiz-llm-06-2': ['visual-llm-06-kv-cache'],
  'quiz-llm-07-1': ['visual-llm-07-schema-pipeline'],
  'quiz-llm-07-2': ['visual-llm-07-instruction-boundary'],
  'quiz-llm-08-1': ['visual-llm-08-injection-defense'],
  'quiz-llm-08-2': ['visual-llm-08-eval-funnel'],
  'iq-llm-01-1': ['visual-llm-01-field-map'],
  'iq-llm-01-2': [
    'visual-llm-01-learning-loop',
    'visual-llm-01-autoregressive-generation',
    'visual-llm-01-training-inference-boundary',
  ],
  'iq-llm-01-3': ['visual-llm-01-application-decision-stack'],
  'iq-llm-02-1': [
    'visual-llm-02-training-cycle',
    'visual-llm-02-backprop-graph',
    'visual-llm-02-learning-rate-trajectories',
  ],
  'iq-llm-02-2': ['visual-llm-02-neuron-forward'],
  'iq-llm-02-3': ['visual-llm-02-generalization-curves'],
  'iq-llm-03-1': [
    'visual-llm-03-text-to-context',
    'visual-llm-03-tokenization-comparison',
  ],
  'iq-llm-03-2': ['visual-llm-03-embedding-position-space'],
  'iq-llm-03-3': [
    'visual-llm-03-context-budget',
    'visual-llm-03-context-strategy-matrix',
  ],
  'iq-llm-04-1': [
    'visual-llm-04-qkv-flow',
    'visual-llm-04-score-mask-softmax',
  ],
  'iq-llm-04-2': ['visual-llm-04-multi-head-merge'],
  'iq-llm-04-3': ['visual-llm-04-decoder-block'],
  'iq-llm-05-1': [
    'visual-llm-05-stage-objectives',
    'visual-llm-05-preference-boundary',
  ],
  'iq-llm-05-2': [
    'visual-llm-05-method-map',
    'visual-llm-05-rag-finetune-matrix',
  ],
  'iq-llm-05-3': ['visual-llm-05-lora-update'],
  'iq-llm-06-1': [
    'visual-llm-06-generation-loop',
    'visual-llm-06-logit-softmax',
    'visual-llm-06-temperature-top-p',
  ],
  'iq-llm-06-2': [
    'visual-llm-06-kv-cache',
    'visual-llm-06-latency-breakdown',
  ],
  'iq-llm-06-3': ['visual-llm-06-latency-breakdown'],
  'iq-llm-07-1': [
    'visual-llm-07-runtime-contract',
    'visual-llm-07-instruction-boundary',
    'visual-llm-07-version-eval-loop',
  ],
  'iq-llm-07-2': [
    'visual-llm-07-schema-pipeline',
    'visual-llm-07-retry-state-machine',
  ],
  'iq-llm-07-3': ['visual-llm-07-instruction-boundary'],
  'iq-llm-08-1': [
    'visual-llm-08-failure-map',
    'visual-llm-08-grounding-chain',
  ],
  'iq-llm-08-2': ['visual-llm-08-eval-funnel'],
  'iq-llm-08-3': ['visual-llm-08-release-pareto'],
};

const sourceImpactClaims = [
  {
    id: 'ai-field-model-application-agent-spine',
    lessonId: 'llm-01',
    sectionId: 'map-the-field',
    statement: 'AI 领域地图必须区分能力目标、模型方法、应用系统与 Agent runtime：LLM 是模型组件，应用与 Agent 在模型之外组织上下文、工具和控制。',
    sourceIds: ['res-llm-primary-javaguide-ai', 'res-ms-ai', 'res-ms-genai'],
    semanticKeys: ['field-spine'],
  },
  {
    id: 'llm-is-not-an-answer-database',
    lessonId: 'llm-01',
    sectionId: 'from-generation-to-llm',
    statement: 'LLM 通过 next-token prediction 学习条件分布，不是保存并检索正确答案的数据库；流畅、相关与事实正确必须分别评测。',
    sourceIds: ['res-llm-primary-javaguide-ai', 'res-llm-primary-javaguide-core-concepts', 'res-hf-llm'],
    semanticKeys: ['autoregressive-truth-boundary'],
  },
  {
    id: 'inference-context-does-not-update-parameters',
    lessonId: 'llm-02',
    sectionId: 'training-loop-and-tensor-shapes',
    statement: '训练闭环通过反向传播和优化器更新参数，标准推理上下文只参与前向计算，不会自动成为训练样本。',
    sourceIds: ['res-llm-primary-javaguide-mechanism', 'res-d2l-zh', 'res-karpathy'],
    semanticKeys: ['training-inference-boundary'],
  },
  {
    id: 'context-is-not-persistent-memory',
    lessonId: 'llm-03',
    sectionId: 'context-and-shared-budget',
    statement: '上下文窗口承载本次请求的 transcript 与证据，但不等于跨会话持久记忆；持久状态由模型外部系统选择和注入。',
    sourceIds: ['res-llm-primary-javaguide-mechanism', 'res-llm-primary-javaguide-prompt', 'res-llm-primary-feishu-prompt-memory', 'res-llm-primary-feishu-context-offloading', 'res-openai-cookbook'],
    semanticKeys: ['context-memory-boundary'],
  },
  {
    id: 'attention-needs-original-mechanism-verification',
    lessonId: 'llm-04',
    sectionId: 'scaled-dot-softmax',
    statement: 'JavaGuide 可组织 Q、K、V 与采样的教学顺序，但 scaled dot-product、因果掩码和 Transformer block 的机制必须由原论文与可核验教材支撑。',
    sourceIds: ['res-llm-primary-javaguide-mechanism', 'res-attention-paper', 'res-rasbt'],
    semanticKeys: ['attention-verification'],
  },
  {
    id: 'version-the-whole-llm-system',
    lessonId: 'llm-05',
    sectionId: 'data-quality-bias-and-evaluation',
    statement: '模型、推理 Prompt、工具 Schema 和 eval set 必须分别版本化，才能把质量变化归因到可复现的系统元组。',
    sourceIds: ['res-llm-primary-feishu-version-drifting', 'res-llm-primary-javaguide-core-concepts', 'res-openai-cookbook'],
    semanticKeys: ['system-versioning'],
  },
  {
    id: 'seed-is-not-cross-version-determinism',
    lessonId: 'llm-06',
    sectionId: 'temperature-and-greedy-boundary',
    statement: '低温、greedy 或 seed 只能在受控条件下提高复现机会，不能保证跨模型版本、服务后端或硬件得到一致输出。',
    sourceIds: ['res-llm-primary-feishu-version-drifting', 'res-llm-primary-javaguide-mechanism', 'res-openai-cookbook'],
    semanticKeys: ['seed-version-boundary'],
  },
  {
    id: 'valid-json-is-not-valid-action',
    lessonId: 'llm-07',
    sectionId: 'schema-and-structured-output',
    statement: '结构化输出即使通过 JSON 解析和 Schema，也可能在权限、资源存在性和业务不变量上错误，必须继续 validate、repair 或安全降级。',
    sourceIds: ['res-llm-primary-javaguide-structured-output', 'res-openai-cookbook'],
    semanticKeys: ['structured-output-validation'],
  },
  {
    id: 'tool-transcript-is-not-execution-proof',
    lessonId: 'llm-07',
    sectionId: 'prompt-as-runtime-contract',
    statement: '模型生成 tool call 或对话 transcript 出现 tool result，只能证明候选或消息被记录，不能证明宿主实际执行；执行身份、真实 observation 与副作用必须由执行器日志核验。',
    sourceIds: ['res-llm-primary-feishu-tool-truth', 'res-hf-agents'],
    semanticKeys: ['tool-execution-truth'],
  },
  {
    id: 'model-safety-is-not-application-control',
    lessonId: 'llm-08',
    sectionId: 'defense-in-depth-and-runtime-operations',
    statement: '模型安全能力不能替代应用的最小权限、参数校验、人工确认、隐私控制、监控和 kill switch；模型只产生候选。',
    sourceIds: ['res-llm-primary-feishu-beyond-model', 'res-owasp-prompt-injection', 'res-hf-agents'],
    semanticKeys: ['model-application-control-boundary'],
  },
  {
    id: 'evaluation-is-an-operating-loop',
    lessonId: 'llm-08',
    sectionId: 'eval-dataset-and-slices',
    statement: '评测从 dataset 与 rubric 出发，经 offline eval、model grader 和 human review 校准，再由 production monitoring 回灌真实失败。',
    sourceIds: ['res-llm-primary-javaguide-evaluation', 'res-llm-primary-feishu-version-drifting', 'res-openai-evals'],
    semanticKeys: ['evaluation-loop'],
  },
];

const sourceImpactSectionSemantics = Object.freeze({
  'section:llm-07/prompt-as-runtime-contract': Object.freeze(['tool-contract']),
});

const sourceImpactMediaCandidates = [
  {
    id: 'javaguide-llm-mechanism-figures',
    lessonId: 'llm-04',
    resourceIds: ['res-llm-primary-javaguide-mechanism'],
    semanticKeys: ['third-party-mechanism-figures'],
    description: 'JavaGuide LLM 运行机制页面中用于解释 Attention 与 Transformer 的第三方图表候选。',
  },
];

export function resolveLlmSourceImpactClaim(targetId) {
  if (typeof targetId !== 'string' || !targetId.startsWith('claim:')) {
    throw new TypeError('LLM source-impact claim target must start with claim:');
  }
  const claim = sourceImpactClaims.find(({ id }) => id === targetId.slice(6));
  if (!claim) throw new RangeError(`Unknown LLM source-impact claim: ${targetId}`);
  return claim;
}

export function resolveLlmSourceImpactTarget(targetId) {
  if (typeof targetId !== 'string') {
    throw new TypeError('LLM source-impact target must be a string');
  }
  if (targetId.startsWith('claim:')) {
    const claim = resolveLlmSourceImpactClaim(targetId);
    return {
      type: 'claim',
      lessonId: claim.lessonId,
      resourceIds: claim.sourceIds,
      semanticKeys: claim.semanticKeys,
      value: claim,
    };
  }
  if (targetId.startsWith('section:')) {
    const match = /^section:(llm-\d{2})\/([a-z0-9-]+)$/.exec(targetId);
    if (!match) throw new RangeError(`Invalid LLM source-impact section: ${targetId}`);
    const lesson = lessons.find(({ id }) => id === match[1]);
    const section = lesson?.knowledgeNote.sections.find(({ id }) => id === match[2]);
    const semanticKeys = sourceImpactSectionSemantics[targetId];
    if (!section || !semanticKeys) {
      throw new RangeError(`Unknown LLM source-impact section: ${targetId}`);
    }
    return {
      type: 'section',
      lessonId: lesson.id,
      resourceIds: section.sourceIds,
      semanticKeys,
      value: section,
    };
  }
  if (targetId.startsWith('media-candidate:')) {
    const candidate = sourceImpactMediaCandidates.find(
      ({ id }) => id === targetId.slice('media-candidate:'.length),
    );
    if (!candidate) {
      throw new RangeError(`Unknown LLM source-impact media candidate: ${targetId}`);
    }
    return {
      type: 'media-candidate',
      lessonId: candidate.lessonId,
      resourceIds: candidate.resourceIds,
      semanticKeys: candidate.semanticKeys,
      value: candidate,
    };
  }
  throw new RangeError(`Unsupported LLM source-impact target: ${targetId}`);
}

function claimTarget(id) {
  const targetId = `claim:${id}`;
  resolveLlmSourceImpactClaim(targetId);
  return targetId;
}

const sourceImpactAudit = [
  {
    decisionId: 'impact-llm-01-field-spine',
    lessonId: 'llm-01',
    resourceId: 'res-llm-primary-javaguide-ai',
    scope: 'claim',
    targetId: claimTarget('ai-field-model-application-agent-spine'),
    semanticKey: 'field-spine',
    contribution: 'adopted',
    summary: '采用 JavaGuide 的 AI 应用知识地图作为八课入口，并把模型、应用和 Agent runtime 分层。',
    rationale: '该来源适合课程导航，但 next-token 机制、模型架构和产品行为继续交给论文与官方资料核验。',
  },
  {
    decisionId: 'impact-llm-02-training-boundary',
    lessonId: 'llm-02',
    resourceId: 'res-llm-primary-javaguide-mechanism',
    scope: 'claim',
    targetId: claimTarget('inference-context-does-not-update-parameters'),
    semanticKey: 'training-inference-boundary',
    contribution: 'deepened',
    summary: '把 tensor、layer、activation、loss、backprop 和 optimizer 收束为一次可计算的训练闭环。',
    rationale: '综述用于建立顺序，小型数值例和梯度机制仍由 D2L、micrograd 等可核验资料交叉支持。',
  },
  {
    decisionId: 'impact-llm-03-memory-boundary',
    lessonId: 'llm-03',
    resourceId: 'res-llm-primary-feishu-prompt-memory',
    scope: 'claim',
    targetId: claimTarget('context-is-not-persistent-memory'),
    semanticKey: 'context-memory-boundary',
    contribution: 'corrected',
    summary: '把 transcript、活动上下文和产品记忆拆开，修正“模型看过就会永久记住”的误区。',
    rationale: '飞书正文是日期化逆向观察，不视为 Claude 当前协议或通用 LLM 事实，持久化责任落在宿主系统。',
  },
  {
    decisionId: 'impact-llm-04-attention-verification',
    lessonId: 'llm-04',
    resourceId: 'res-llm-primary-javaguide-mechanism',
    scope: 'claim',
    targetId: claimTarget('attention-needs-original-mechanism-verification'),
    semanticKey: 'attention-verification',
    contribution: 'adopted',
    summary: '采用运行机制文章的教学导航，但不让二手综述单独承担 Attention 公式和架构事实。',
    rationale: 'QKV、scaled dot-product、mask、multi-head、residual 与 block 均保留原论文和教材核验链。',
  },
  {
    decisionId: 'impact-llm-05-system-versioning',
    lessonId: 'llm-05',
    resourceId: 'res-llm-primary-feishu-version-drifting',
    scope: 'claim',
    targetId: claimTarget('version-the-whole-llm-system'),
    semanticKey: 'system-versioning',
    contribution: 'deepened',
    summary: '把后训练课程深化为模型、Prompt、工具 Schema、评测集和宿主配置分别版本化。',
    rationale: 'Agent 漂移观察帮助建立系统元组，但不把特定产品案例外推为所有模型的漂移规律。',
  },
  {
    decisionId: 'impact-llm-06-seed-boundary',
    lessonId: 'llm-06',
    resourceId: 'res-llm-primary-feishu-version-drifting',
    scope: 'claim',
    targetId: claimTarget('seed-is-not-cross-version-determinism'),
    semanticKey: 'seed-version-boundary',
    contribution: 'corrected',
    summary: '修正 seed、低温或 greedy 可保证跨模型版本一致的错误承诺。',
    rationale: '复现必须固定完整系统版本并重复验证；seed 只作为部分服务的尽力实验参数。',
  },
  {
    decisionId: 'impact-llm-07-structured-contract',
    lessonId: 'llm-07',
    resourceId: 'res-llm-primary-javaguide-structured-output',
    scope: 'claim',
    targetId: claimTarget('valid-json-is-not-valid-action'),
    semanticKey: 'structured-output-validation',
    contribution: 'deepened',
    summary: '把结构化输出扩展为 parse、Schema validate、业务 validate、repair、retry 与降级链。',
    rationale: 'Function Calling 和 JSON 契约只约束候选结构，权限和副作用始终由可信代码与宿主控制。',
  },
  {
    decisionId: 'impact-llm-08-eval-loop',
    lessonId: 'llm-08',
    resourceId: 'res-llm-primary-javaguide-evaluation',
    scope: 'claim',
    targetId: claimTarget('evaluation-is-an-operating-loop'),
    semanticKey: 'evaluation-loop',
    contribution: 'adopted',
    summary: '采用 Golden Set 到线上灰度的评测主干，并显式加入模型裁判校准和人工复核。',
    rationale: '来源不提供本项目阈值或 gold truth，model grader 仍需以人标 heldout 数据持续校准。',
  },
  {
    decisionId: 'impact-llm-09-outside-model',
    lessonId: 'llm-08',
    resourceId: 'res-llm-primary-feishu-beyond-model',
    scope: 'claim',
    targetId: claimTarget('model-safety-is-not-application-control'),
    semanticKey: 'model-application-control-boundary',
    contribution: 'deepened',
    summary: '深化模型与应用控制边界，把权限、执行、隐私、监控和恢复明确放在模型之外。',
    rationale: '作者叙事用于责任划分，不构成任何产品的安全、权限、可靠性或恢复能力保证。',
  },
  {
    decisionId: 'impact-llm-10-tool-protocol-limit',
    lessonId: 'llm-07',
    resourceId: 'res-llm-primary-feishu-tool-truth',
    scope: 'claim',
    targetId: claimTarget('tool-transcript-is-not-execution-proof'),
    semanticKey: 'tool-execution-truth',
    contribution: 'corrected',
    summary: '修正“模型输出 tool call 就证明工具已真实执行”的错误推断。',
    rationale: '对话 transcript 与宿主 observation 不同；执行身份、结果和副作用必须由宿主日志核验。',
  },
  {
    decisionId: 'impact-llm-11-claude-tool-list',
    lessonId: 'llm-07',
    resourceId: 'res-llm-primary-feishu-claude-tools',
    scope: 'narrative',
    targetId: 'section:llm-07/prompt-as-runtime-contract',
    semanticKey: 'tool-contract',
    contribution: 'duplicate',
    summary: 'Claude Code 工具清单与现有工具契约教学重复，只保留为特定实现扩展阅读。',
    rationale: '工具名称和能力随产品演进，不能替代通用的定义、权限、校验、执行和 observation 边界。',
  },
  {
    decisionId: 'impact-llm-12-third-party-media',
    lessonId: 'llm-04',
    resourceId: 'res-llm-primary-javaguide-mechanism',
    scope: 'media',
    targetId: 'media-candidate:javaguide-llm-mechanism-figures',
    semanticKey: 'third-party-mechanism-figures',
    contribution: 'rejected',
    summary: '拒绝直接复制 JavaGuide 运行机制页面图表，继续使用本课既有原创 SVG 及其官方和论文证据链。',
    rationale: '页面图表缺少独立可发布许可记录；原创重绘能保持标签、无障碍描述和几何检查的一致性。',
  },
];

const outcomeRegistry = {
  assessments: assessmentOutcomes,
  visuals: visualOutcomes,
  assessmentVisualCoverage,
};

const deepFreeze = (value) => {
  if (value === null || typeof value !== 'object') return value;
  for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  return Object.freeze(value);
};

export const llmFoundation = deepFreeze({
  id: 'llm-foundation',
  title: 'LLM 基础',
  summary: '面向 Agent 与 AI 应用开发者的第一阶段课程：先理解模型，再学会把概率能力装进可验证系统。',
  lessons,
  resources,
  interviewQuestions,
  sourceImpactClaims,
  sourceImpactMediaCandidates,
  sourceImpactAudit,
  outcomeRegistry,
});
