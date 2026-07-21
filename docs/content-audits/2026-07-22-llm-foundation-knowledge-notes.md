# LLM 基础知识笔记来源与覆盖审计

审计日期：2026-07-22

当前范围：`llm-01` 至 `llm-08` 已全部接入，LLM 基础模块完成长篇知识笔记迁移。

适用规则：`.agents/skills/build-learning-module-notes/` 的来源政策、章节标准、数据契约与质量量表。

## 当前发布状态

- 课程结构保持 8 lessons、28 resources、24 interview questions；所有资源 URL 均为 HTTPS。
- 笔记注册表恰好包含 `llm-01` 至 `llm-08` 八项；每个 lesson 的 `knowledgeNote` 与对应注册表对象严格同一，八篇笔记互不复用对象。
- 28/28 资源均有完整 evidence card。共享资源按整个 LLM 模块合并 coverage 与 limitations，单课 extension 用途不会覆盖其在其他课程中的 core 角色。
- 每个实质章节的 `sourceIds` 都同时存在于全局 registry、该 lesson 的 `resourceIds` 与 evidence set；`brokenReferenceCount: 0`。
- `llm-01` 的 JSON SHA-256 仍为 `3cb13c700455cbd8a770c7661e659d495958254aa1e51144d179e652614bc03f`，证明拆分与最终聚合没有改写已发布试点正文。
- `llm-02`、`llm-03`、`llm-04` 保留独立审查最终分 99、96、99；`llm-05` 至 `llm-08` 的最终分为 97、97、96、96。现有历史审计没有记录 `llm-01` 数值分，本次继续明确其已发布并通过正式 contract，而不虚构历史分数。

## 来源访问与 evidence 角色

`body` 表示读取了可归因正文；`metadata` 表示只核验来源身份、页面或课程元数据；`equivalent` 表示目标视频无字幕，但访问了明确关联的 D2L 等价正文。`role` 是跨整个 LLM 模块的全局用途，而不是只看当前一课。

| resourceId | 关联课 | access | authority / role | 本轮可支撑内容 | 仍保留的限制 |
| --- | --- | --- | --- | --- | --- |
| `res-ms-ai` | 01 | body | official / cross-check | AI/ML/DL 范围、自监督语言建模、最小训练与泛化 | 课程含过时参数表和拟人表达，不用于模型规格或 Agent 保证 |
| `res-ms-genai` | 01、03、05、07、08 | body | official / core | 生成模型、token/embedding、训练阶段、Prompt、RAG、评测与 Agent 衔接 | Foundry、接口示例和模型清单有平台与时间边界 |
| `res-ms-agents` | 01 | body | official / cross-check | Agent 与裸 LLM 边界、工具、知识、记忆和行动组件 | 不支撑训练、tokenization 或所有框架统一语义 |
| `res-hf-llm` | 01、03、05、06 | body | official / core | tokenizer、表示、预训练/SFT/PEFT、生成、prefill/decode/KV Cache | 教学实现和接口不能推广到所有模型、训练配方或服务 |
| `res-hf-agents` | 07、08 | body | official / core | messages/tools/parser/执行边界、trace、token、成本、延迟、错误、离线与在线评测、retry/fallback | smolagents、OpenTelemetry 与接口行为有框架版本边界；parse 不等于授权或业务有效 |
| `res-karpathy` | 02、04、06 | body for 02; metadata for 04/06 | expert / core | micrograd 计算图、链式法则、最小训练循环与参数更新 | micrograd 是教学标量引擎；Transformer 与推理视频未当正文使用 |
| `res-karpathy-build-gpt` | 03、04 | metadata | expert / extension | 作者、视频身份和从 bigram 到 GPT 路线元数据 | 无可核验字幕/正文，不支撑 token、Attention 或 Transformer 关键机制 |
| `res-rasbt` | 03、04、05、06 | body | expert / core | token/embedding/位置、Attention、GPT-like Pre-Norm、预训练、微调、LoRA、logits、采样与 KV Cache | 教学 GPT 实现不代表所有训练、采样、缓存与归一化实现 |
| `res-happy-llm` | 04、05 | body | community / cross-check | Transformer、SFT、偏好优化、LoRA/PEFT 中文交叉核验 | 社区二手教材不替代论文、方法原典或具体模型实现 |
| `res-llm-universe` | 03、07、08 | body | community / cross-check | Prompt、RAG 切分检索、应用评测、检索相关性与答案忠实度 | 社区依赖和示例结果不保证跨模型、跨业务成立 |
| `res-hello-agents` | 01 | body | community / cross-check | Agent 不等于裸 LLM、工具调用与应用验证路径 | 社区框架和模型示例不替代 SDK 或厂商官方语义 |
| `res-openai-cookbook` | 03、05、06、07、08 | body; official Docs cross-check | official / core | token 计数、长输入、RAG、结构化输出、评测与 token/成本/延迟实验 | Cookbook 和 API 示例时敏；独立 Docs 事实未伪归因给 Cookbook，跨版本需复核 |
| `res-openai-evals` | 08 | body | official / core | 版本化数据集、reference/rubric、basic/model-graded grader、meta-eval 与复现 | 框架模板有版本边界；model grader 不是 gold，也非完整生产门禁 |
| `res-openai-agents` | 01 | body | official / extension | instructions、tools、handoffs、guardrails、sessions、tracing 与特定审批语义 | needs_approval 是该 SDK 的配置语义，guardrail 不是权限系统 |
| `res-tiktoken` | 03 | body | official / core | BPE 编码、token ID、解码与纯文本计数 | 本地纯文本计数不等于含消息、工具等包装的完整 API 计数 |
| `res-anthropic-agents` | 08 | body | official / cross-check | 最简单充分设计、workflow/agent 取舍、routing/evaluator 与复杂度权衡 | 厂商工程经验不支撑 OWASP 威胁细节或普遍 benchmark |
| `res-stanford-cs336` | 05 | body | academic / core | 数据抽取、过滤、去重、PII、质量阈值、SFT/偏好优化/DPO、偏差与退化 | 课程实验不是生产保证，不覆盖 LoRA/RAG 完整选型，也不支持算力泛化 |
| `res-d2l-zh` | 02 | body | academic / core | 张量、层与激活、损失归约、计算图、反向传播、优化和泛化 | 框架代码有版本边界；zero-grad 不是微积分定律 |
| `res-google-ml` | 02 | body | official / core | 线性与非线性、损失、梯度下降、学习率、训练/验证与过拟合 | 通用课程不构成生产 LLM 训练系统或上线保证 |
| `res-3b1b-nn` | 02 | body | expert / cross-check | 前向、梯度与反向传播可视化直觉 | 动画不替代框架语义，也不保证全局最优 |
| `res-fastai` | 02 | body | expert / cross-check | 批次训练、学习率、曲线与验证诊断的项目实践 | 库默认值和训练配方有版本、任务边界 |
| `res-3b1b-transformer` | 03 | body | expert / cross-check | token 向量、位置线索与 decoder-only 数据流直觉 | 不支撑固定位置方案、窗口限额或 RAG 可靠性保证 |
| `res-wangmutou-transformer` | 03、04 | metadata | expert / extension | 作者、视频主题与类比路线元数据，仅作扩展入口 | 无可核验字幕/正文；不能用标题支持机制，卷积类比不等于架构等价 |
| `res-3b1b-attention` | 04 | body | expert / core | QKV、匹配、Value 聚合、缩放点积与多头直觉 | 注意力图不能单独构成最终输出的因果解释 |
| `res-attention-paper` | 04 | body, original paper/PDF | academic / core | 缩放点积、多头、causal mask、FFN、残差与 LayerNorm | 原论文是 encoder-decoder/Post-Norm，不可泛化成现代 GPT 唯一实现 |
| `res-limu-transformer` | 04 | equivalent | expert / cross-check | 通过明确关联 D2L 正文核验多头、残差、归一化与实现 | 视频本身无可用字幕，未声称读过视频正文或其中额外主张 |
| `res-owasp-prompt-injection` | 07、08 | body | official / core | direct/indirect injection、RAG poisoning、工具操纵、指令/数据分离、验证、最小权限、HITL 与日志 | 正则、阈值和代码是示范而非通用检测器；每层可绕过，需威胁模型 |
| `res-zomi-bili` | 01、06 | metadata | expert / extension | 作者与视频路线元数据，作为全流程扩展入口 | 字幕为空且页面访问失败，不支撑训练、推理或部署关键事实 |

正文或等价正文实际复核于 2026-07-22 的资源，其资源与 evidence 的 `verifiedAt` 均为 `2026-07-22`。`res-wangmutou-transformer` 与 `res-karpathy-build-gpt` 仍仅有 metadata，保留 `2026-07-15`；`res-zomi-bili` 仍仅有 metadata，保留 `2026-07-21`。`llm-01` 其余已发布来源保持 2026-07-21；没有为了统一日期而伪造重新访问。

## `llm-02` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：描述前向、损失、反向传播与参数更新因果链 | `training-loop-and-tensor-shapes`、`computation-graph-chain-rule-backprop`、`optimizer-learning-rate-and-zero-grad` | covered |
| objective：理解梯度并识别学习率、激活与数据问题 | `linear-layers-and-activation`、`optimizer-learning-rate-and-zero-grad`、`generalization-and-training-diagnosis` | covered |
| concept：张量 | `training-loop-and-tensor-shapes` | covered |
| concept：线性层 | `linear-layers-and-activation` | covered |
| concept：激活函数 | `linear-layers-and-activation` | covered |
| concept：损失函数 | `loss-as-training-proxy`、`worked-binary-parameter-update` | covered |
| concept：梯度 | `computation-graph-chain-rule-backprop`、`optimizer-learning-rate-and-zero-grad` | covered |
| concept：优化器 | `optimizer-learning-rate-and-zero-grad`、`worked-binary-parameter-update` | covered |
| quiz 1：反向传播直接产生梯度 | `computation-graph-chain-rule-backprop` | covered |
| quiz 2：无激活的多层仿射仍可合并 | `linear-layers-and-activation` | covered |
| interview 1 及 follow-up：一次参数更新、学习率过大现象 | `training-loop-and-tensor-shapes`、`optimizer-learning-rate-and-zero-grad`、`worked-binary-parameter-update` | covered |
| interview 2 及 follow-up：激活作用、梯度消失关系 | `linear-layers-and-activation` | covered |
| interview 3 及 follow-up：损失下降不等于上线、无泄漏验证 | `loss-as-training-proxy`、`generalization-and-training-diagnosis` | covered |
| exercise step 1：输入、参数、预测、标签和损失 | `worked-binary-parameter-update` | covered |
| exercise step 2：梯度方向与优化器修改 | `worked-binary-parameter-update` | covered |
| exercise step 3：大学习率和小学习率现象 | `optimizer-learning-rate-and-zero-grad`、`worked-binary-parameter-update` | covered |
| deliverable：200–400 字完整更新说明 | `worked-binary-parameter-update` 的可填写模板 | covered |
| completion：完整口述一次训练迭代 | `worked-binary-parameter-update` 自检 | covered |
| completion：解释梯度、学习率和激活的职责 | `linear-layers-and-activation`、`optimizer-learning-rate-and-zero-grad` | covered |

边界：反向传播只算梯度，优化器才更新；梯度是局部信息，无全局保证；损失可能先是未归约张量；PyTorch 清梯度是框架行为；训练 loss 不是发布证据。二分类数值例明确标为构造示例，并给出 sigmoid、二元交叉熵与学习率。

## `llm-03` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：连接 tokenization、embedding、位置和窗口 | `token-and-tokenizer`、`ids-to-embeddings`、`positional-representation`、`context-and-shared-budget` | covered |
| objective：估算提示/输出预算并解释截断影响 | `context-and-shared-budget`、`context-strategy-tradeoffs`、`customer-service-token-budget-experiment` | covered |
| concept：Tokenization | `token-and-tokenizer` | covered |
| concept：Embedding | `ids-to-embeddings` | covered |
| concept：上下文窗口 | `context-and-shared-budget` | covered |
| concept：位置编码/位置表示 | `positional-representation` | covered |
| concept：Token 预算 | `context-and-shared-budget`、`customer-service-token-budget-experiment` | covered |
| quiz 1：token 边界由 tokenizer 决定 | `token-and-tokenizer` | covered |
| quiz 2：窗口未满时噪声仍可能影响证据利用 | `context-and-shared-budget`、`customer-service-token-budget-experiment` | covered，且限定为需对照验证的“可能” |
| interview 1 及 follow-up：token 与词、代码/罕见字符 | `token-and-tokenizer`、`customer-service-token-budget-experiment` | covered |
| interview 2 及 follow-up：embedding 与相似度边界 | `ids-to-embeddings` | covered |
| interview 3 及 follow-up：长上下文、摘要损失检测 | `context-and-shared-budget`、`context-strategy-tradeoffs` | covered |
| exercise step 1：中英文、JSON、代码实测 | `customer-service-token-budget-experiment` | covered |
| exercise step 2：分配指令、历史、检索、输入和输出 | `context-and-shared-budget`、`customer-service-token-budget-experiment` | covered |
| exercise step 3：加入无关长文并设计截断/摘要策略 | `context-strategy-tradeoffs`、`customer-service-token-budget-experiment` | covered |
| deliverable：预算表、三组计数和实验结论 | `customer-service-token-budget-experiment` 的记录项与结论模板 | covered |
| completion：用匹配 tokenizer 实测 | `token-and-tokenizer`、`customer-service-token-budget-experiment` | covered |
| completion：制定含输出余量的真实预算 | `context-and-shared-budget`、`customer-service-token-budget-experiment` | covered |

边界：无固定语言 token 比例；本地纯文本计数不等于完整 API 计数；输入 embedding、上下文化表示和 RAG embedding 分开；位置表示不假定单一实现；窗口容量不是质量保证；摘要有损、检索不保证相关或正确，噪声影响只通过受控实验判断。`llm-03.resourceIds` 在原六项上加入 registry 已有的 `res-openai-cookbook`、`res-ms-genai`、`res-llm-universe`，总资源数仍为 28。

## `llm-04` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：用查询、匹配、聚合解释 self-attention | `input-representation-goal`、`qkv-query-match-aggregate`、`scaled-dot-softmax` | covered |
| objective：追踪多头、残差和 FFN 更新 | `multi-head-attention`、`decoder-block-information-flow`、`attention-lab` | covered |
| concept：Query/Key/Value | `qkv-query-match-aggregate` | covered |
| concept：Self-Attention | `input-representation-goal`、`qkv-query-match-aggregate` | covered |
| concept：多头注意力 | `multi-head-attention` | covered |
| concept：残差连接 | `decoder-block-information-flow` | covered |
| concept：归一化 | `decoder-block-information-flow` | covered |
| concept：Decoder-only | `causal-mask`、`decoder-block-information-flow` | covered |
| quiz 1：最终加权的是 Value | `qkv-query-match-aggregate` | covered |
| quiz 2：因果 mask 阻止读取未来 token | `causal-mask` | covered |
| interview 1 及 follow-up：QKV、除以 √d_k | `qkv-query-match-aggregate`、`scaled-dot-softmax` | covered |
| interview 2 及 follow-up：多头与冗余 | `multi-head-attention` | covered |
| interview 3 及 follow-up：残差、归一化、两类架构可见性 | `causal-mask`、`decoder-block-information-flow` | covered |
| exercise step 1：记录 Query 对其他位置权重 | `attention-lab` | covered |
| exercise step 2：提高 Key 匹配并解释 Value 贡献 | `scaled-dot-softmax`、`attention-lab` | covered |
| exercise step 3：打开 mask 并说明训练意义 | `causal-mask`、`attention-lab` | covered |
| deliverable：两张权重对比和完整信息流 | `attention-lab` 的快照与自检模板 | covered |
| completion：不用公式准确解释 QKV | `qkv-query-match-aggregate`、`attention-lab` | covered |
| completion：画 decoder-only 块和梯度通路 | `decoder-block-information-flow`、`attention-lab` | covered |

边界：原论文是 encoder-decoder/Post-Norm，Raschka 教学实现是 GPT-like decoder-only/Pre-Norm，两者没有混写；因果 mask 不是所有 Attention 的通用 mask；多头没有预设固定职责且头数不线性保证能力；注意力权重不是充分因果解释；站内 UI 用非负手工分数的线性归一化，零总分回退均匀权重，不是 QK 缩放后的 softmax。

## `llm-05` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：比较预训练、SFT、偏好优化与参数高效微调 | `objectives-before-methods`、`pretraining-and-continued-pretraining`、`sft-and-behavior-shaping`、`preference-optimization-boundaries`、`lora-as-parameter-efficient-update` | covered |
| objective：按知识更新、行为与证据需求选择微调或 RAG | `objectives-before-methods`、`rag-finetuning-decision-lab` | covered |
| concepts：预训练、SFT、偏好优化 | `pretraining-and-continued-pretraining`、`sft-and-behavior-shaping`、`preference-optimization-boundaries` | covered |
| concepts：LoRA、数据质量 | `lora-as-parameter-efficient-update`、`data-quality-bias-and-evaluation` | covered |
| concept：微调与 RAG | `rag-finetuning-decision-lab` | covered |
| quiz 1：每日更新且需出处优先 RAG | `pretraining-and-continued-pretraining`、`rag-finetuning-decision-lab` | covered |
| quiz 2：LoRA 训练低秩增量 | `lora-as-parameter-efficient-update` | covered |
| interview 1 及 follow-up：预训练/SFT/偏好目标与偏好偏差 | `objectives-before-methods`、`preference-optimization-boundaries`、`data-quality-bias-and-evaluation` | covered |
| interview 2 及 follow-up：微调/RAG 选择与组合 | `rag-finetuning-decision-lab` | covered |
| interview 3 及 follow-up：LoRA 成本、rank 与 target modules | `lora-as-parameter-efficient-update` | covered |
| exercise step 1：写出五种路线的直接目标 | `objectives-before-methods`、`rag-finetuning-decision-lab` | covered |
| exercise step 2：数据、计算、更新、引用与风险五维评分 | `data-quality-bias-and-evaluation`、`rag-finetuning-decision-lab` | covered |
| exercise step 3：三个需求选型并定义上线评测 | `rag-finetuning-decision-lab` | covered |
| deliverable：目标—成本—用例表及三条证据链 | `rag-finetuning-decision-lab` 的填写顺序与验证字段 | covered |
| completion：按目标选择 RAG/微调并解释阶段关系 | `objectives-before-methods`、`rag-finetuning-decision-lab` | covered |

边界：继续预训练与 SFT 按目标和数据结构区分；LoRA 是参数更新方式而非独立目标；DPO 与奖励模型加 PPO 路线没有混写；训练不能自动获得引用、版本和权限；数据过滤与偏好标注可能带来偏差和退化；决策表的等级均标为教学假设，不冒充 benchmark。

## `llm-06` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：从 logits、softmax、temperature、top-p 到 stop | `logits-softmax-next-token`、`temperature-and-greedy-boundary`、`top-p-and-combined-sampling`、`stop-max-output-and-termination` | covered |
| objective：区分 prefill/decode 并说明 KV Cache 代价 | `prefill-decode-and-latency-metrics`、`kv-cache-reuse-memory-and-concurrency` | covered |
| concepts：Logits、Softmax | `logits-softmax-next-token` | covered |
| concepts：Temperature、Top-p | `temperature-and-greedy-boundary`、`top-p-and-combined-sampling` | covered |
| concepts：Stop、KV Cache | `stop-max-output-and-termination`、`kv-cache-reuse-memory-and-concurrency` | covered |
| quiz 1：temperature 改变概率分布形状 | `temperature-and-greedy-boundary` | covered |
| quiz 2：缓存历史 K/V 避免重算前缀 | `kv-cache-reuse-memory-and-concurrency` | covered |
| interview 1 及 follow-up：temperature/top-p 与三类任务 | `temperature-and-greedy-boundary`、`top-p-and-combined-sampling`、`sampling-experiment-and-serving-tradeoffs` | covered |
| interview 2 及 follow-up：KV Cache 原理、显存与并发 | `kv-cache-reuse-memory-and-concurrency` | covered |
| interview 3 及 follow-up：延迟成本优化与 P95 诊断 | `prefill-decode-and-latency-metrics`、`sampling-experiment-and-serving-tradeoffs` | covered |
| exercise step 1：低温/高温各多次并分类错误 | `sampling-experiment-and-serving-tradeoffs` | covered |
| exercise step 2：固定温度逐步收窄 top-p | `top-p-and-combined-sampling`、`sampling-experiment-and-serving-tradeoffs` | covered |
| exercise step 3：代码、创意、抽取参数决策 | `sampling-experiment-and-serving-tradeoffs` | covered |
| deliverable：至少六次输出表与三类任务决策 | `sampling-experiment-and-serving-tradeoffs` 的紧凑表格和结论模板 | covered |
| completion：完整生成链与 KV Cache 权衡 | 全章因果链，重点为 `stop-max-output-and-termination`、`kv-cache-reuse-memory-and-concurrency` | covered |

边界：temperature 公式只对 T>0，零值是接口特判；top-p 是累计概率动态前缀；EOS、stop、上限与业务完成分开；TTFT 不等于纯 prefill，六次运行不能估计生产 P95；KV Cache、prefix cache、result cache 与 RAG 分开。站内 sampling 面板只展示固定候选的教学分布和 nucleus 成员，不伪装成真实模型输出。

## `llm-07` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：设计边界清楚、含少量示例的提示契约 | `prompt-as-runtime-contract`、`instruction-and-untrusted-data-boundaries`、`few-shot-and-example-budget` | covered |
| objective：以 Schema、校验、错误反馈和有限重试闭环 | `schema-and-structured-output`、`validation-retry-and-side-effects`、`support-ticket-classifier-contract` | covered |
| concepts：指令层级、Few-shot、约束 | `prompt-as-runtime-contract`、`instruction-and-untrusted-data-boundaries`、`few-shot-and-example-budget` | covered |
| concepts：JSON Schema、验证与重试 | `schema-and-structured-output`、`validation-retry-and-side-effects` | covered |
| quiz 1：JSON 后继续 Schema 与业务校验 | `schema-and-structured-output`、`validation-retry-and-side-effects` | covered |
| quiz 2：检索文档命令是不可信数据 | `instruction-and-untrusted-data-boundaries`、`support-ticket-classifier-contract` | covered |
| interview 1 及 follow-up：健壮 Prompt 与 few-shot 选择 | `prompt-as-runtime-contract`、`few-shot-and-example-budget` | covered |
| interview 2 及 follow-up：结构化输出仍需服务端校验与降级 | `schema-and-structured-output`、`validation-retry-and-side-effects` | covered |
| interview 3 及 follow-up：指令层级与间接注入攻击路径 | `instruction-and-untrusted-data-boundaries` | covered |
| exercise step 1：字段、必填、类型、枚举及 category/priority policy | `schema-and-structured-output`、`support-ticket-classifier-contract` | covered；Prompt 与 validator 共享分类、高优先级及人工复核规则：歧义、缺失、冲突，或 payload 试图改规则、要求敏感副作用或越权动作时转人工 |
| exercise step 2：两个边界示例与不可信工单 | `few-shot-and-example-budget`、`support-ticket-classifier-contract` | covered；T-1001 可标准分类且无需人工，T-1002 因信息不足转人工，T-1003 因改规则与直接退款企图转人工；三例均可由同一 policy 推导且 evidence 可定位 |
| exercise step 3：解析、业务和连续失败分流 | `validation-retry-and-side-effects`、`support-ticket-classifier-contract` | covered；business validator 从原 payload 独立重算 category、priority、needs_human_review，并识别规则篡改、敏感副作用与越权企图后再允许执行 |
| deliverable：提示模板、可执行 Schema 与最大重试伪代码 | `support-ticket-classifier-contract` | covered；包含完整 Schema、三例与生成—解析—Schema—policy—业务—人工控制流 |
| completion：模糊提示契约化并实现安全降级 | `support-ticket-classifier-contract` 的双项完成自检 | covered |

边界：消息角色优先级按具体供应商接口核验；提示分隔不等于强安全隔离；Schema 只管结构。category、priority 与 expectedHumanReview 均由业务 validator 从原 payload 按同一 policy 独立重算，其中人工复核明确覆盖无法分类、多主题无明确主诉、信息不足、内容冲突，以及试图改规则、直接触发敏感副作用或越权动作；普通且可按标准流程分类的投诉不自动转人工。有限 repair 与瞬时服务退避分开；生成和修复循环不执行副作用，幂等语义必须由下游真实实现。复审后阅读量为 38 分钟：完整 Schema、三组 policy 可推导样例及逐分支控制流构成必要工程闭环，按用户允许的复杂度浮动落入 35–40 分钟契约；质量分暂保留 96，等待后续复审结论再调整。

## `llm-08` 覆盖矩阵

| assessed outcome | 对应章节 | 状态 |
| --- | --- | --- |
| objective：区分幻觉、非确定性、污染与注入 | `failure-taxonomy-not-fluency`、`prompt-injection-threat-model` | covered |
| objective：设计离线、线上、安全、成本和延迟发布门槛 | `eval-dataset-and-slices`、`graders-and-judge-calibration`、`defense-in-depth-and-runtime-operations`、`refund-release-checklist` | covered |
| concepts：幻觉、非确定性、上下文污染 | `failure-taxonomy-not-fluency`、`evidence-grounding-and-uncertainty` | covered |
| concepts：Evals | `eval-dataset-and-slices`、`graders-and-judge-calibration` | covered |
| concepts：Prompt Injection、成本与延迟 | `prompt-injection-threat-model`、`defense-in-depth-and-runtime-operations` | covered |
| quiz 1：最小权限、标记、校验和确认构成防线 | `prompt-injection-threat-model`、`defense-in-depth-and-runtime-operations` | covered |
| quiz 2：评测集来自真实需求、边界与失败 | `eval-dataset-and-slices` | covered |
| interview 1 及 follow-up：幻觉缓解与 RAG 忠实度 | `failure-taxonomy-not-fluency`、`evidence-grounding-and-uncertainty` | covered |
| interview 2 及 follow-up：Evals 与 LLM judge 校准 | `eval-dataset-and-slices`、`graders-and-judge-calibration` | covered |
| interview 3 及 follow-up：质量/安全/成本/延迟与路由 | `defense-in-depth-and-runtime-operations`、`refund-release-checklist` | covered |
| exercise step 1：五类正常、缺失、冲突、超长与对抗用例 | `refund-release-checklist` 的 15 条待执行用例 | covered |
| exercise step 2：六类指标、阈值与责任人 | `refund-release-checklist` 的项目填写指标行 | covered |
| exercise step 3：最小权限、确认、脱敏与降级 | `defense-in-depth-and-runtime-operations`、`refund-release-checklist` | covered |
| deliverable：至少 15 条、含指标与 owner 的发布清单 | `refund-release-checklist` | covered |
| completion：故障到控制映射与多维上线门槛 | 全章，最终由 `refund-release-checklist` 可判定门禁收束 | covered |

边界：版本、Prompt 或配置变化另记 system/version drift，不混入非确定性；grounding 将检索证据与答案忠实度分开；LLM judge 需人工 gold、rubric、偏差对照和 heldout 校准；安全影响不只来自工具副作用，也来自过宽数据可见性和未清理输出；安全 hard gates 不能被平均分抵消。

## 质量量表

| lesson | 目标、测验与面试 25 | 结构与衔接 20 | 来源与不确定性 25 | 可读性与例子 20 | 版权与契约 10 | total | broken refs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `llm-02` | 25 | 20 | 24 | 20 | 10 | **99** | 0 |
| `llm-03` | 25 | 20 | 22 | 19 | 10 | **96** | 0 |
| `llm-04` | 25 | 20 | 24 | 20 | 10 | **99** | 0 |
| `llm-05` | 25 | 20 | 23 | 19 | 10 | **97** | 0 |
| `llm-06` | 25 | 19 | 24 | 19 | 10 | **97** | 0 |
| `llm-07` | 25 | 19 | 23 | 19 | 10 | **96** | 0 |
| `llm-08` | 25 | 19 | 24 | 18 | 10 | **96** | 0 |

`llm-02` 保留框架与代理目标边界；`llm-03` 的多个视频仅有 metadata、上下文效果仍需按模型与任务实测；`llm-04` 保留原始论文与 GPT-like 实现的架构边界。`llm-05` 对 DPO、LoRA、RAG 和数据偏差的证据边界完整，但训练方法仍需具体模型实测；`llm-06` 的推理服务接口、temperature 零值和缓存实现具有版本差异；`llm-07` 的供应商角色、结构化输出和重试语义不作跨平台保证；`llm-08` 的阈值均留给项目 owner，15 条清单明确是待执行设计而非已通过结果。七篇新笔记均无课程字段伪装成 resource evidence、无断裂引用、无大段复制来源正文。

## 测试审计（最终 GREEN）

`tests.status: passed`。最终验证以仓库正式测试为主，不依赖一次性、不可复现 probe。

| command | exit | result |
| --- | ---: | --- |
| `node --check src/data/llm-foundation-notes.js` | 0 | 八课聚合入口语法通过 |
| `node --check src/data/llm-foundation.js` | 0 | 课程数据、28 张 evidence card 与八课接线语法通过 |
| `node --test tests/data.test.js tests/guided-ui.test.js` | 0 | 20 tests：20 passed、0 failed；正式断言覆盖 exact registry keys、identity、不同对象、正文 contract、28/28 cards、source resolution、深层冻结、旧模块 fallback、渲染与安全外链 |
| `npm test` | 0 | 255 tests：255 passed、0 failed；全仓库无回归 |
| `npm run build` | not run | `package.json` 不存在 `build` script；项目是无构建步骤的原生静态站点 |
| `git diff --check` | 0 | 无空白错误 |

正式 contract 还验证 8 lessons、28 resources、24 interview questions；每节 note 与 registry identity 一致且对象互异；递归冻结会继续进入“父对象已浅冻结、子对象未冻结”的结构并冻结子项；所有 section source 都解析到 lesson set、registry 和 evidence；verifiedAt 只使用 2026-07-15/21/22 且不晚于审计日；资源 URL 安全；Agent 机制、Agent Harness 与上下文/RAG/记忆继续使用 explanations fallback。
