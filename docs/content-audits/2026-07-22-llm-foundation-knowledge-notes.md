# LLM 基础知识笔记来源与覆盖审计

审计日期：2026-07-22

当前范围：第一轮集成，`llm-01` 至 `llm-04` 已接入；`llm-05` 至 `llm-08` 尚未制作或接入。

适用规则：`.agents/skills/build-learning-module-notes/` 的来源政策、章节标准、数据契约与质量量表。

## 当前发布状态

- 课程结构保持 8 lessons、28 resources、24 interview questions。
- 笔记注册表当前包含 `llm-01`、`llm-02`、`llm-03`、`llm-04`；四课 lesson 的 `knowledgeNote` 与注册表对象严格同一。
- 第一轮三课的 22 条 lesson-resource 关联全部有 evidence card；共享资源按整个 LLM 模块合并 coverage，未因单课用途覆盖旧卡或降低全局角色。
- 当前共有 23/28 资源具有 evidence card。剩余 `res-hf-agents`、`res-openai-evals`、`res-anthropic-agents`、`res-stanford-cs336`、`res-owasp-prompt-injection` 留待第二轮逐正文核验，未预先补卡。
- `llm-01` 至 `llm-04` 的章节 `sourceIds` 均同时存在于 lesson evidence set 和全局 registry，`brokenReferenceCount: 0`。
- `llm-02`、`llm-03`、`llm-04` 独立审查分分别为 99、96、99，均超过 85 分发布门槛。现有项目文档未记录 `llm-01` 的最终数值分，本轮未重写该课正文，也不虚构一个历史分数；它保留已发布试点状态和既有 evidence 限制。

## 来源访问与 evidence 角色

`body` 表示读取了可归因正文；`metadata` 表示只核验来源身份、页面或课程元数据；`equivalent` 表示目标视频无字幕，但访问了明确关联的 D2L 等价正文。`role` 是跨整个 LLM 模块的全局用途，而不是只看当前一课。

| resourceId | 关联课 | access | authority / role | 本轮可支撑内容 | 仍保留的限制 |
| --- | --- | --- | --- | --- | --- |
| `res-d2l-zh` | 02 | body | academic / core | 张量、层与激活、损失归约、计算图、反向传播、优化和泛化 | 框架代码有版本边界；zero-grad 不是微积分定律 |
| `res-google-ml` | 02 | body | official / core | 线性与非线性、损失、梯度下降、学习率、训练/验证与过拟合 | 通用课程不构成生产 LLM 训练系统或上线保证 |
| `res-karpathy` | 02、04 | body for 02; metadata for 04 | expert / core | micrograd 标量计算图、链式法则、最小训练循环与参数更新 | micrograd 是教学标量引擎；Transformer 视频内容未当作已读正文 |
| `res-3b1b-nn` | 02 | body | expert / cross-check | 前向、梯度与反向传播可视化直觉 | 动画不替代框架语义，也不保证全局最优 |
| `res-fastai` | 02 | body | expert / cross-check | 批次训练、学习率、曲线与验证诊断的项目实践 | 库默认值和训练配方有版本、任务边界 |
| `res-tiktoken` | 03 | body | official / core | BPE 编码、token ID、解码与纯文本计数 | 本地纯文本计数不等于含消息、工具等包装的完整 API 计数 |
| `res-hf-llm` | 01、03 | body | official / core | tokenizer、输入 embedding、上下文化表示、位置与上下文限制 | 各模型词表、位置实现和限制仍须查目标模型资料 |
| `res-rasbt` | 03、04 | body | expert / core | token/embedding/位置、QKV、mask、多头与 GPT-like Pre-Norm | 教学 GPT 实现不代表所有模型；不能改写原论文 Post-Norm 语境 |
| `res-3b1b-transformer` | 03 | body | expert / cross-check | token 向量、位置线索与 decoder-only 数据流直觉 | 不支撑固定位置方案、窗口限额或 RAG 可靠性保证 |
| `res-wangmutou-transformer` | 03、04 | metadata | expert / extension | 作者、视频主题与类比路线元数据，仅作扩展入口 | 无可核验字幕/正文；不能用标题支持机制，卷积类比不等于架构等价 |
| `res-karpathy-build-gpt` | 03、04 | metadata | expert / extension | 作者、视频身份和从 bigram 到 GPT 的教学路线元数据 | 无可核验字幕/正文，不支撑 token、Attention 或 Transformer 关键事实 |
| `res-openai-cookbook` | 03 | body | official / core | token 计数、embedding QA、长输入、分块摘要、RAG 与评测 | OpenAI API 示例有版本边界；摘要有损，检索不保证相关或正确 |
| `res-ms-genai` | 01、03 | body, chapters 04/08/14/15 | official / core | tokenization、embedding、RAG、上下文策略与评测 | Foundry 流程和模型清单有平台与时间边界；单课 cross-check 用途不降低全局 core |
| `res-llm-universe` | 03 | body, chapters 3/5 | community / cross-check | RAG 切分检索、应用评估与中文工程实践 | 社区实现和示例结果不代表检索必然可靠或跨模型通用 |
| `res-3b1b-attention` | 04 | body | expert / core | QKV、匹配、Value 聚合、缩放点积与多头直觉 | 注意力图不能单独构成最终输出的因果解释 |
| `res-attention-paper` | 04 | body, original paper/PDF | academic / core | 缩放点积、多头、causal mask、FFN、残差与 LayerNorm | 原论文是 encoder-decoder/Post-Norm，不可泛化成现代 GPT 唯一实现 |
| `res-happy-llm` | 04 | body | community / cross-check | 多头、掩码、残差、归一化、FFN 的中文交叉核验 | 二手教材不替代论文或具体模型实现 |
| `res-limu-transformer` | 04 | equivalent | expert / cross-check | 通过明确关联 D2L 正文核验多头、残差、归一化与实现 | 视频本身无可用字幕，未声称读过视频正文或其中额外主张 |

上表中实际重新访问正文或等价正文的资源，其资源与 evidence 的 `verifiedAt` 更新为 `2026-07-22`。`res-wangmutou-transformer` 与 `res-karpathy-build-gpt` 本轮只核验 metadata，仍保留原验证日 `2026-07-15`；未列入本表且本轮未访问的资源也保持原日期。

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

## 质量量表

| lesson | 目标、测验与面试 25 | 结构与衔接 20 | 来源与不确定性 25 | 可读性与例子 20 | 版权与契约 10 | total | broken refs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `llm-02` | 25 | 20 | 24 | 20 | 10 | **99** | 0 |
| `llm-03` | 25 | 20 | 22 | 19 | 10 | **96** | 0 |
| `llm-04` | 25 | 20 | 24 | 20 | 10 | **99** | 0 |

`llm-02` 保留框架与代理目标边界；`llm-03` 的结构与跨章衔接完整得 20 分，但多个视频仅有 metadata、上下文效果仍需模型/任务实测，因此来源与不确定性项为 22 分；`llm-04` 因教程与架构变体需要持续保留实现边界而在来源项扣 1 分。三课都没有课程字段伪装成 resource evidence，没有断裂引用，也没有大段复制来源文本。

## 测试审计（第一轮预期 RED）

`tests.status: failed`。失败是阶段性发布契约的预期结果，不能写成全绿。

| command | exit | result |
| --- | ---: | --- |
| `node --check src/data/llm-foundation-notes.js` | 0 | 聚合器语法通过 |
| `node --check src/data/llm-foundation.js` | 0 | 课程数据语法通过 |
| 一次性 Node 数据/渲染 probe | 0 | `llm-02` 7 节/3899 字、`llm-03` 6 节/4332 字、`llm-04` 7 节/5259 字；三课 identity、递归冻结、lesson source set、0 断链、无 diagnostic、安全外链和目录渲染均通过 |
| `node --test tests/data.test.js tests/guided-ui.test.js` | 1 | 20 tests：16 passed、4 failed；失败仅为注册表缺 `llm-05`–`08`、5 项第二轮资源无 evidence、冻结全量断言停在 `llm-05`、UI 等待 `llm-08` |
| `npm test` | 1 | 254 tests：250 passed、4 failed；同上四项阶段性失败，无额外回归 |

剩余工作：逐正文研究并制作 `llm-05` 至 `llm-08`，为第二轮五项尚无卡资源补齐 evidence，随后重新运行完整契约；在那之前不得把本审计解释为全模块发布完成。
