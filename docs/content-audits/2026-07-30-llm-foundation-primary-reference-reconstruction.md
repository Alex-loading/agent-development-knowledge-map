# LLM 基础一级参考资料重构审计

## 范围与结论

- 稳定身份：只发布 `llm-01` 至 `llm-08`，课程顺序、路由、进度键、16 道 quiz、24 道面试题和 3 个交互实验保持不变。
- 兼容资源：28 个既有资源按原顺序完整保留；新增资源统一通过 `createPrimaryReferenceBinding` 绑定冻结 registry，ID 均以 `res-llm-primary-` 开头。
- 一级主干：JavaGuide `/ai/` 负责八课知识组织；Harness 101 只用于 Prompt/Memory、Context Offloading、工具 observation、版本漂移和 model-outside-model 边界。
- 权威核验：Attention 与 Transformer 公式继续由原论文和可核验教材支撑；API、安全、评测与产品行为继续由官方资料或目标系统实测约束。
- 内容形态：八篇笔记仍是递进知识文章，一级来源进入真实 section 的 `sourceIds`，不是尾部链接列表。
- 视觉形态：40 张主视觉和 12 张分步 SVG 全部保留为原创重绘，没有下载或复制第三方图表，没有热链或 data URI。
- 学习闭环：40 个 assessment 与 40 个主视觉分别使用精确 outcome allow-set；`assessmentVisualCoverage` 逐题声明真正承担对应概念的视觉，禁止用任意相交 tag 伪造覆盖。

## 来源影响决策

机器数据为 `llmFoundation.sourceImpactAudit`；下表按相同顺序保持逐字段完全一致。`adopted`、`corrected` 与 `deepened` 表示材料产生实质影响；`duplicate` 与 `rejected` 记录有作用域的非采用决策。每个 `targetId` 必须由统一 resolver 解析为真实 claim、section 或 media candidate；`semanticKey` 同时存在于 decision 和目标契约中，并由逐决策 summary 主题契约检查，不能只靠 lesson 相同宣称同义。

| decisionId | lessonId | resourceId | scope | targetId | semanticKey | contribution | summary | rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `impact-llm-01-field-spine` | `llm-01` | `res-llm-primary-javaguide-ai` | `claim` | `claim:ai-field-model-application-agent-spine` | `field-spine` | `adopted` | 采用 JavaGuide 的 AI 应用知识地图作为八课入口，并把模型、应用和 Agent runtime 分层。 | 该来源适合课程导航，但 next-token 机制、模型架构和产品行为继续交给论文与官方资料核验。 |
| `impact-llm-02-training-boundary` | `llm-02` | `res-llm-primary-javaguide-mechanism` | `claim` | `claim:inference-context-does-not-update-parameters` | `training-inference-boundary` | `deepened` | 把 tensor、layer、activation、loss、backprop 和 optimizer 收束为一次可计算的训练闭环。 | 综述用于建立顺序，小型数值例和梯度机制仍由 D2L、micrograd 等可核验资料交叉支持。 |
| `impact-llm-03-memory-boundary` | `llm-03` | `res-llm-primary-feishu-prompt-memory` | `claim` | `claim:context-is-not-persistent-memory` | `context-memory-boundary` | `corrected` | 把 transcript、活动上下文和产品记忆拆开，修正“模型看过就会永久记住”的误区。 | 飞书正文是日期化逆向观察，不视为 Claude 当前协议或通用 LLM 事实，持久化责任落在宿主系统。 |
| `impact-llm-04-attention-verification` | `llm-04` | `res-llm-primary-javaguide-mechanism` | `claim` | `claim:attention-needs-original-mechanism-verification` | `attention-verification` | `adopted` | 采用运行机制文章的教学导航，但不让二手综述单独承担 Attention 公式和架构事实。 | QKV、scaled dot-product、mask、multi-head、residual 与 block 均保留原论文和教材核验链。 |
| `impact-llm-05-system-versioning` | `llm-05` | `res-llm-primary-feishu-version-drifting` | `claim` | `claim:version-the-whole-llm-system` | `system-versioning` | `deepened` | 把后训练课程深化为模型、Prompt、工具 Schema、评测集和宿主配置分别版本化。 | Agent 漂移观察帮助建立系统元组，但不把特定产品案例外推为所有模型的漂移规律。 |
| `impact-llm-06-seed-boundary` | `llm-06` | `res-llm-primary-feishu-version-drifting` | `claim` | `claim:seed-is-not-cross-version-determinism` | `seed-version-boundary` | `corrected` | 修正 seed、低温或 greedy 可保证跨模型版本一致的错误承诺。 | 复现必须固定完整系统版本并重复验证；seed 只作为部分服务的尽力实验参数。 |
| `impact-llm-07-structured-contract` | `llm-07` | `res-llm-primary-javaguide-structured-output` | `claim` | `claim:valid-json-is-not-valid-action` | `structured-output-validation` | `deepened` | 把结构化输出扩展为 parse、Schema validate、业务 validate、repair、retry 与降级链。 | Function Calling 和 JSON 契约只约束候选结构，权限和副作用始终由可信代码与宿主控制。 |
| `impact-llm-08-eval-loop` | `llm-08` | `res-llm-primary-javaguide-evaluation` | `claim` | `claim:evaluation-is-an-operating-loop` | `evaluation-loop` | `adopted` | 采用 Golden Set 到线上灰度的评测主干，并显式加入模型裁判校准和人工复核。 | 来源不提供本项目阈值或 gold truth，model grader 仍需以人标 heldout 数据持续校准。 |
| `impact-llm-09-outside-model` | `llm-08` | `res-llm-primary-feishu-beyond-model` | `claim` | `claim:model-safety-is-not-application-control` | `model-application-control-boundary` | `deepened` | 深化模型与应用控制边界，把权限、执行、隐私、监控和恢复明确放在模型之外。 | 作者叙事用于责任划分，不构成任何产品的安全、权限、可靠性或恢复能力保证。 |
| `impact-llm-10-tool-protocol-limit` | `llm-07` | `res-llm-primary-feishu-tool-truth` | `claim` | `claim:tool-transcript-is-not-execution-proof` | `tool-execution-truth` | `corrected` | 修正“模型输出 tool call 就证明工具已真实执行”的错误推断。 | 对话 transcript 与宿主 observation 不同；执行身份、结果和副作用必须由宿主日志核验。 |
| `impact-llm-11-claude-tool-list` | `llm-07` | `res-llm-primary-feishu-claude-tools` | `narrative` | `section:llm-07/prompt-as-runtime-contract` | `tool-contract` | `duplicate` | Claude Code 工具清单与现有工具契约教学重复，只保留为特定实现扩展阅读。 | 工具名称和能力随产品演进，不能替代通用的定义、权限、校验、执行和 observation 边界。 |
| `impact-llm-12-third-party-media` | `llm-04` | `res-llm-primary-javaguide-mechanism` | `media` | `media-candidate:javaguide-llm-mechanism-figures` | `third-party-mechanism-figures` | `rejected` | 拒绝直接复制 JavaGuide 运行机制页面图表，继续使用本课既有原创 SVG 及其官方和论文证据链。 | 页面图表缺少独立可发布许可记录；原创重绘能保持标签、无障碍描述和几何检查的一致性。 |

## 八课知识主干与核验

| 课程 | 一级资料主干 | 核验与边界 |
| --- | --- | --- |
| `llm-01` | JavaGuide AI 总览与核心概念 | 以既有官方课程核对 AI→ML→DL、基础模型、LLM、应用和 Agent runtime 边界；明确 next-token prediction 不是答案数据库。 |
| `llm-02` | JavaGuide LLM 运行机制 | D2L、Google ML 与 micrograd 核验 tensor、activation、loss、gradient、backprop 和 optimizer；冻结小型数值例。 |
| `llm-03` | JavaGuide 运行机制和 Prompt；飞书 Prompt/Memory 与 Offloading | 产品观察只解释 transcript、活动上下文、外部状态与持久记忆边界，不当作 Claude 或通用 LLM 协议。 |
| `llm-04` | JavaGuide 运行机制作为导航 | Attention Is All You Need 与实现教材承担 Q/K/V、scaled dot-product、mask、multi-head、residual 和 Transformer block 事实。 |
| `llm-05` | JavaGuide 核心概念；飞书 Version Drifting | 官方课程和训练教材核验 pretraining、SFT、preference optimization；模型、Prompt、tool schema、eval set 分别版本化。 |
| `llm-06` | JavaGuide 运行机制；飞书 Version Drifting | 既有模型教材核验 logit、softmax、top-k、top-p、KV cache；明确 seed 不保证跨版本一致。 |
| `llm-07` | JavaGuide Prompt、API 与结构化输出；飞书 Tool Truth | 官方 API 和安全资料核验角色、Schema 与失败处理；JSON 合法不等于业务正确或动作已执行。 |
| `llm-08` | JavaGuide Evaluation；飞书 Version Drifting 与模型之外 | OpenAI Evals、OWASP 和官方运行资料核验 grader、安全、隐私与生产控制；模型安全不替代应用控制。 |

## 视觉与许可决策

全部视觉的 `provenance` 为 `original-synthesis`，`credit` 为 Agent Learner 原创教学图解，第三方 `permission` 不适用。来源只用于约束概念和数值，不授予复制页面图形的许可。每个主视觉拥有本地 SVG、alt、longDescription、caption、来源和唯一 placement；12 个 step asset 继承父视觉的语义、来源与许可。40 个父视觉分别执行 keep/revise/replace 审计：本轮全部选择 `keep`，因为既有 SVG 已覆盖目标概念、无障碍描述、定量 fixture 和安全静态策略；仅正文来源与 outcome registry 接线发生变化。12 个分步状态同样逐项 `keep`。

| lesson | main visual decisions | step asset decisions | result |
| --- | ---: | ---: | --- |
| `llm-01` | 5 keep | 3 keep | 8 / 8 |
| `llm-02` | 5 keep | 0 keep | 5 / 5 |
| `llm-03` | 5 keep | 0 keep | 5 / 5 |
| `llm-04` | 5 keep | 4 keep | 9 / 9 |
| `llm-05` | 5 keep | 0 keep | 5 / 5 |
| `llm-06` | 5 keep | 5 keep | 10 / 10 |
| `llm-07` | 5 keep | 0 keep | 5 / 5 |
| `llm-08` | 5 keep | 0 keep | 5 / 5 |
| 合计 | 40 keep | 12 keep | 52 / 52 |

逐资产身份由 `docs/research/2026-07-26-llm-foundation-visual-inventory.md` 与 `src/data/visuals/llm-foundation-visuals.js` 双重冻结；本审计的 52 / 52 决策覆盖这两个 registry 中的每一条本地路径。没有新增第三方媒体，因此 creator、figure identity、retrieved date、permission 与 modifications 的第三方复用字段均为不适用，而不是未知。

| assetPath | parentVisualId | decision | rationale |
| --- | --- | --- | --- |
| `assets/visuals/llm-foundation/llm-01-field-map.svg` | `visual-llm-01-field-map` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-learning-loop.svg` | `visual-llm-01-learning-loop` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-autoregressive-generation.svg` | `visual-llm-01-autoregressive-generation` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-1.svg` | `visual-llm-01-autoregressive-generation` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-2.svg` | `visual-llm-01-autoregressive-generation` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-3.svg` | `visual-llm-01-autoregressive-generation` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-training-inference-boundary.svg` | `visual-llm-01-training-inference-boundary` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-01-application-decision-stack.svg` | `visual-llm-01-application-decision-stack` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-02-training-cycle.svg` | `visual-llm-02-training-cycle` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-02-neuron-forward.svg` | `visual-llm-02-neuron-forward` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-02-backprop-graph.svg` | `visual-llm-02-backprop-graph` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-02-learning-rate-trajectories.svg` | `visual-llm-02-learning-rate-trajectories` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-02-generalization-curves.svg` | `visual-llm-02-generalization-curves` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-03-text-to-context.svg` | `visual-llm-03-text-to-context` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-03-tokenization-comparison.svg` | `visual-llm-03-tokenization-comparison` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-03-embedding-position-space.svg` | `visual-llm-03-embedding-position-space` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-03-context-budget.svg` | `visual-llm-03-context-budget` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-03-context-strategy-matrix.svg` | `visual-llm-03-context-strategy-matrix` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-decoder-block.svg` | `visual-llm-04-decoder-block` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-qkv-flow.svg` | `visual-llm-04-qkv-flow` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-score-mask-softmax.svg` | `visual-llm-04-score-mask-softmax` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-1.svg` | `visual-llm-04-score-mask-softmax` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-2.svg` | `visual-llm-04-score-mask-softmax` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-3.svg` | `visual-llm-04-score-mask-softmax` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-4.svg` | `visual-llm-04-score-mask-softmax` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-multi-head-merge.svg` | `visual-llm-04-multi-head-merge` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-04-causal-visibility.svg` | `visual-llm-04-causal-visibility` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-05-method-map.svg` | `visual-llm-05-method-map` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-05-stage-objectives.svg` | `visual-llm-05-stage-objectives` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-05-preference-boundary.svg` | `visual-llm-05-preference-boundary` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-05-lora-update.svg` | `visual-llm-05-lora-update` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-05-rag-finetune-matrix.svg` | `visual-llm-05-rag-finetune-matrix` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop.svg` | `visual-llm-06-generation-loop` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop-step-1.svg` | `visual-llm-06-generation-loop` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop-step-2.svg` | `visual-llm-06-generation-loop` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop-step-3.svg` | `visual-llm-06-generation-loop` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop-step-4.svg` | `visual-llm-06-generation-loop` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-generation-loop-step-5.svg` | `visual-llm-06-generation-loop` | `keep` | 分步资产延续父视觉的概念证据和累积状态，并通过本地静态策略检查，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-logit-softmax.svg` | `visual-llm-06-logit-softmax` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-temperature-top-p.svg` | `visual-llm-06-temperature-top-p` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-kv-cache.svg` | `visual-llm-06-kv-cache` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-06-latency-breakdown.svg` | `visual-llm-06-latency-breakdown` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-07-runtime-contract.svg` | `visual-llm-07-runtime-contract` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-07-instruction-boundary.svg` | `visual-llm-07-instruction-boundary` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-07-schema-pipeline.svg` | `visual-llm-07-schema-pipeline` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-07-retry-state-machine.svg` | `visual-llm-07-retry-state-machine` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-07-version-eval-loop.svg` | `visual-llm-07-version-eval-loop` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-08-failure-map.svg` | `visual-llm-08-failure-map` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-08-grounding-chain.svg` | `visual-llm-08-grounding-chain` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-08-eval-funnel.svg` | `visual-llm-08-eval-funnel` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-08-injection-defense.svg` | `visual-llm-08-injection-defense` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |
| `assets/visuals/llm-foundation/llm-08-release-pareto.svg` | `visual-llm-08-release-pareto` | `keep` | 原创本地 SVG 已覆盖本课目标概念、无障碍说明与静态安全约束，本轮无需替换。 |

## 质量评分

正文评分采用五项：知识完整性 20、因果结构 20、来源作用域 20、误区和边界 20、练习与测评闭环 20。结果为 **93 / 100**：八课均覆盖指定主干；所有一级来源进入真实 section；飞书观察均声明非通用事实；quiz 和 interview 使用逐题精确 conceptTags，并由显式视觉覆盖表闭环。

视觉评分采用六项，每项 10 分：语义正确 10、叙事一致 10、caption/labels/alt/longDescription 一致 9、来源与许可 10、静态安全 10、几何与可读性 9，合计 **58 / 60**，每类均不低于 8。扣分只反映静态检查不能替代真实浏览器在所有字体和缩放组合下的人工验收，不代表发现已知碰撞。

## 验证记录

以下均为本工作树中的实际命令结果，不以预期值替代运行证据：

- 一级来源、稳定身份、八课概念主干、测评 outcome 与 Markdown 审计契约：5 / 5 通过。
- LLM visual、inventory、visible semantics、geometry、静态安全与 ownership 聚焦套件：157 / 157 通过。
- 全量 `npm test`：565 / 565 通过。
- 52 个本地 SVG 经 `xmllint --noout`：52 / 52 通过；主动内容与 hotlink 定向扫描无命中。
- 变更文件 marker 与隐私定向扫描无命中；`git ls-files .research-cache` 为空。
- 模块、八篇 note 和变更测试经 `node --check` 通过；`npm run check:primary-references` 与 `npm run check:context-visuals` 均为 current；`git diff --check` 无输出。
- 提升本机监听权限后启动静态服务器，`/`、`/src/data/llm-foundation.js` 与 `/assets/visuals/llm-foundation/llm-04-score-mask-softmax.svg` 三个 HTTP smoke 请求均返回 200。
- 未把静态测试表述为真实浏览器验收；全字体、缩放和视口组合仍属于发布前人工观察边界。
