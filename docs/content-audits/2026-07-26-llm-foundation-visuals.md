# LLM 基础视觉教学系统审计

## 发布前基线

- 功能分支：`feat/llm-foundation-visual-system`
- 基线提交：`24bc4ba7e5fe3805bb70fd27a6246af80f6b019d`
- 建立工作树时的 `origin/main`：`d4a3c8b01ed840421b2cc2ca59997c0afe9bdc44`
- 隔离工作树：`.worktrees/llm-foundation-visual-system`
- `npm test`：319 / 319 通过
- `git diff --check`：通过
- GitHub CLI 登录与仓库读取：通过
- Vercel 项目链接：已核对 `.vercel/project.json`
  - 项目：`agent-development-knowledge-map`
  - Project ID：`prj_my3aISdykLrqWFBtSetO9Ixi3Hlw`
  - Team ID：`team_u7X1xS2vwrojoOxfkxMgxkEC`
  - 生产域名：`https://agent-development-knowledge-map.vercel.app`
- 本机未安装全局 Vercel CLI；发布阶段继续使用已经验证成功的 Vercel REST/API 路径，并在发布前重新校验项目、提交 SHA、部署状态与生产别名。
- 当前尚未完成：视觉证据清单、图形资产、浏览器验收与生产部署。

## 视觉证据与许可冻结结果

- 冻结清单：[LLM 基础视觉主张、来源与许可冻结清单](../research/2026-07-26-llm-foundation-visual-inventory.md)
- 冻结日期：2026-07-26
- 视觉条目：40
- 课程分布：`llm-01` 至 `llm-08` 各 5 项
- 认知结构：每课 1 项 overview、至少 2 项机制/过程/关系图、至少 1 项边界/对比/失败模式/决策图
- assessed coverage：每项至少绑定一个与 cognitive question/storyboard 直接吻合的学习目标、quiz、练习步骤、完成标准或面试判断；40 项均映射到对应知识笔记的真实 section ID
- 来源：每项 `sourceIds` 均取自对应 section 的已核验来源范围；课程字段仅作为 coverage basis

### 许可决策汇总

| decision | count | 处置 |
| --- | ---: | --- |
| `original-synthesis` | 40 | 从空白画布制作，只重组来源支持的事实与关系，不复制、裁剪、翻译或近似临摹第三方图像。 |
| `licensed-reproduction` | 0 | 本轮未选择第三方原图。 |
| `licensed-adaptation` | 0 | 本轮未选择第三方改编。 |
| `official-media` | 0 | 本轮未选择官方媒体素材。 |
| `link-only-original-replacement` | 0 | 没有必须保留链接的不可替代第三方图；全部直接冻结为原创方案。 |

没有把论文发布页、课程页、视频页、仓库许可证、转载页或搜索摘要推断为图片再分发/修改许可。由于没有第三方媒体复用需求，本轮没有可适用的许可证 URL。任何后续第三方图片需求都必须重新进入许可发布门，补齐原始语境、作者、图号、实际许可证或媒体政策 URL、再分发和修改权限、版本、获取日期及修改记录后才能入站。

### 状态与阻塞处置

| status | count | 处置 |
| --- | ---: | --- |
| `verified` | 40 | section、考核映射、来源、原创决策与 storyboard 七要素已冻结，可进入原创制作。 |
| `blocked` | 0 | 当前没有阻塞项。若后续证据或媒体许可不足，条目必须停在发布门外并改为 `link-only-original-replacement` 或继续原创，不得猜测许可。 |

本节更新的是“发布前基线”之后的内容状态；图形资产制作、数据注册、页面组件、浏览器验收和部署仍由后续任务完成。

### assessed coverage 语义复核

规格审查后对 40 项重新执行了逐行语义复核，而不是只检查字段路径是否存在：

1. 从 `src/data/llm-foundation.js` 展开每个引用的学习目标、quiz prompt、练习步骤、完成标准和面试题全文；面试判断同时核对其 short answer 与 deep dive。
2. 将课程字段原文与该图的 cognitive question、nodes/regions、caption、alt 和 long-description outline 并排比较。
3. 只有图能直接回答该判断，或明确覆盖该考核结果的必要子步骤时才保留映射；仅“属于同一课程”或字段范围过宽不算覆盖。
4. 修正两处错误 quiz：有限重试状态机移除与不可信文档优先级相关的 `quiz-llm-07-2`，改用结构校验面试判断、练习步骤和完成标准；Prompt Injection 防御图由评测集来源题 `quiz-llm-08-2` 改为系统性防线题 `quiz-llm-08-1`。
5. 自回归生成图明确收窄为“不更新参数的标准推理”，改绑训练/推理目标与面试判断；泛化曲线移除与梯度、学习率、激活函数相关的完成标准。
6. 同轮还删除了训练/推理边界、tokenization、训练阶段、logit/softmax、因果可见性、版本评测与 grounding 图中的过宽或非必要引用，避免用数量夸大 assessed coverage。

复核后仍为 40 / 40 项各至少一个直接语义映射，许可决策与 blocked 数量不变。

### 多头权威更正

2026-07-26 审查更正：概念稿的 3 头与 fixture numHeads=2（由 data.heads.length 冻结）冲突，采用 fixture 的 2 头作为数值单一真源。对应 inventory 的 Reading order、Nodes/regions、纹理说明、alt 与 long-description 已统一为 Head 1、Head 2 和两组 Q/K/V；visualId、角色、assessed coverage 与 fixture 文件均未改变。此次更正只消除 storyboard 与既有数值真源之间的权威冲突，因此 Fixture git blob SHA 保持不变，Inventory git blob SHA 按修正文档重新计算。

2026-07-27 机制可复算更正：两头 fixture 进一步冻结每头 scores、Values、stable softmax weights 与 ΣV 输出；图与 inventory 均明确展示 `Q/K → weights → ΣV → Hn`，再进入 concat、输出投影和联合更新端点。此次更正改变 fixture 与 inventory 内容，因此下方两个 git blob SHA 均重新计算。

### Logit 候选数量权威更正

2026-07-27 审查更正：inventory 误写“五个 token”，但 quantitative fixture 与图面始终冻结 A/B/C 三个候选。采用 fixture 作为数值单一真源，将 storyboard 更正为“五个 token→三个候选 token”；fixture 内容未改变，Inventory git blob SHA 按修正文档重新计算。

### KV Cache 解码对照基数更正

2026-07-27 审查更正：KV Cache 对照图此前把下排缓存历史块误画成 2/3/4 个位置，再额外追加 1 个当前位置，导致它与上排重算路径的 2/3/4 个总位置不是同一比较基数。fixture 现显式冻结三个 decode step 的 `history/current` 为 `1+1`、`2+1`、`3+1`，两条路径每步总位置均为 2/3/4；区别只在上排对历史做 recompute、下排对历史做 cache read，而当前位置分别为 compute 与 append。此次更正改变 fixture 内容，因此 Fixture git blob SHA 重新计算。

## 实施就绪复核

- 清单内容标识：Inventory git blob SHA：`9d855ae2e48c05a94895e2aa6c16f65f4b1ca52f`
- 数值真源标识：Fixture git blob SHA：`9a81db876ed41d059ee135e3090b06a13c129450`
- 人工逐行复核日期：2026-07-26
- 执行角色：implementation agent + independent spec reviewer
- 人工复核结果：40 / 40 项通过；每项均复核 cognitive question、图形角色、assessed coverage、来源范围、许可决策和 storyboard 七要素。
- 角色字段已改为确定性语法 `图形形式；primary=<role>；tags=<tag,...>`。primary allowlist 为 `overview`、`mechanism`、`process`、`comparison`、`boundary`、`decision`；secondary tags allowlist 为 `mechanism`、`process`、`comparison`、`boundary`、`decision`、`relationship`、`failure-mode`、`tradeoff`。每项只能有一个 primary，tags 不得重复 primary。
- 清单 40 行均显式声明 `fixture=quantitative` 或 `fixture=qualitative`；测试从文档自身派生出 25 项定量与 15 项定性 scope，再与冻结 ID 集合做双向比较。
- 25 项定量输入的单一数值真源为 `tests/fixtures/llm-foundation-visual-fixtures.js`。清单只保存 `fixtureId` 引用；结构化 `data/result` 保存数值，模块构造器通过 `formatFixtureExpected(result)` 确定性生成 `Expected`，源文件中不再存在 25 份手写输出副本。测试同时比较独立格式化结果、导出 formatter 与字段值，非空但错误的 `Expected` 也会失败。
- 第二轮逐项扫描了全部 25 个定量 fixture：重点补全 training-cycle 的 forward/MSE/backward/SGD/新参数与复算、backprop-graph 的真实分叉/局部梯度/共享变量累加、generalization-curves 的三组完整数组，以及 score-mask-softmax 的原始 QK/缩放/mask/softmax/V 聚合；其余 21 项也均由测试执行 storyboard 承诺的完整定量链。
- 第四轮再次逐方法核对全部 25 项的 `data` 与实际计算。扫描按生成/训练 6 项、表示/上下文 4 项、注意力 4 项、适配/路由 2 项、推理/服务 5 项、编排/评测 4 项覆盖全部 fixture。修正的字段级缺口为：自回归候选改成 token 字符串并经词表解析 ID；BCE 使用结构化标签 `y`；泛化判断读取欠拟合和过拟合的完整 train 数组；因果 mask 由逐行原始允许分数生成、去掉 softmax 无法观察的统一偏移字段；LoRA 的 rank 与 base shape 参与验证和参数量计算。回归测试通过突变这些输入，证明结果发生变化或违反契约时被拒绝，而不是只做属性访问计数。
- RAG/SFT 决策 fixture 现有四个结构化用例，每例使用命名 `axes` 和布尔 `hasExamples`。实际执行三路规则得到 `RAG`、`SFT/LoRA` 及两个 `insufficient evidence—do not fine-tune` 反例；额外将每例 axes 属性顺序反转后重算，结果保持不变。风险与计算预算分别生成发布评测画像，因此五个命名轴均参与输出或路由。
- 重试/幂等 fixture 现逐条处理五个 key/payload 事件。执行结果依次为 `executed`、`deduplicated`、`executed`、`rejected`、`rejected`；同 key 返回首个缓存结果，不同合法 key 产生不同 receipt，空 key 与含空格非法 key 均无副作用。最终真实副作用执行 2 次，缓存仅含 `ticket-42:v1` 与 `ticket-43:v1`。
- Transformer 总览明确以 GPT-like decoder-only、Pre-Norm 为主例，同时标出 Post-Norm 对比，并保留原论文 encoder-decoder 与 cross-attention 的历史边界。
- 发布 Pareto 图取消未定义的单一合并指标，改为质量–成本、质量–延迟两个小倍图和独立安全硬门表；固定 A–E 候选值、淘汰结果、dominance 关系和非支配集合。

### 例外与修正记录

1. 修正两处不匹配 quiz，并收紧只与课程主题相邻、但不能由图直接回答的 assessed coverage。
2. 将视觉角色从自然语言混写改为单 primary 加 secondary tags，消除 overview 与其他角色的计数歧义。
3. 将 25 项定量视觉迁移到无依赖、机器可读的单一 fixture 真源；把 tokenization 明确限定为教学规则，把延迟分位数明确到最近秩定义，并补齐四条曾被截断的计算链。
4. 补齐 Transformer 的现代 decoder-only 主例、规范化位置对比和原论文架构边界。
5. 删除 Pareto 图的未定义合并指标，拆分独立单位，并加入安全硬门与支配关系。
6. 第三方媒体例外为 0；40 项继续采用 `original-synthesis`，没有新增许可推断。
7. `version-eval-loop` 明确失败样本 3 属于安全切片，因此 v1 被安全 hard gate 阻断；`causal-visibility` 使用嵌套 0/1 数组冻结 4×4 可见矩阵。
8. 自回归 fixture 改为从 raw prompt 和含重叠 token 的教学词表执行 longest-match；两项 top-p fixture 使用故意乱序的候选/logit，并先按概率降序构造最小前缀；P95 fixture 使用故意乱序的观测值，并在 nearest-rank 前内部排序。tokenization comparison 同步改为从原文和词表执行最长匹配。
9. 决策矩阵不再使用位置数组或汇总分数：四例的命名轴、示例证据、RAG/SFT 两条正路径与目标不稳/缺少示例两条否定路径均由方法执行，并保留 Prompt/工具基线、数据收集与风险/成本评测后续动作。
10. 幂等演示不再由 `submissions` 数字预置结果：状态机在 schema 重试成功后执行真实事件流、正则校验 key、缓存首个结果并计算副作用次数。
11. 全量字段扫描删除或修正无法影响方法结果的数据，其中因果 softmax 的统一允许分数属于数学上不可观察的平移，已替换为逐行原始允许分数；新增行为突变回归覆盖 BCE 标签、完整曲线、因果分数与 LoRA rank。

### 可复现校验

以下命令均从项目根目录执行，预期结果已经固定：

| 命令 | 预期结果 |
| --- | --- |
| `node --test tests/llm-foundation-visual-inventory.test.js` | `tests 15`、`pass 15`、`fail 0` |
| `npm test` | `tests 474`、`pass 474`、`fail 0` |
| `rg -n -i 'T[O]DO\|T[B]D\|p[l]aceholder\|待[补]\|未[知]\|unk[n]own' docs/research/2026-07-26-llm-foundation-visual-inventory.md docs/content-audits/2026-07-26-llm-foundation-visuals.md tests/fixtures/llm-foundation-visual-fixtures.js` | 无匹配，退出码 1 |
| `git diff --check` | 无输出，退出码 0 |

项目测试会校验 40 个唯一 ID、每课 5 项分布、角色 allowlist、storyboard 七要素、section/source/assessed 路径解析、文档派生的 25/15 fixture 分类、单一真源字段与引用，并实际重算 softmax、BCE/MSE、SGD、上下文预算、KV 容量、nearest-rank P95、切片通过率、Pareto 支配关系和全部 25 条预期结果。方法级证明包括从 raw prompt 真正执行最长匹配、对乱序候选先排序再构造 top-p 最小前缀、对乱序延迟样本先排序再取 nearest-rank、按命名轴与示例证据执行三路 RAG/SFT 规则并验证属性顺序不变性，以及按 key/payload 事件实际执行幂等缓存和副作用计数。行为突变测试还证明 BCE 标签、完整训练曲线、逐行因果分数和 LoRA rank 能改变结果或触发契约拒绝；其余排序、过滤与聚合方法也从各自 `data` 执行，而非读取预整理结果。冻结状态还精确要求 40 项 `decision=original-synthesis`、40 项 `status=verified`，并检查 candidate URL 与 permission evidence 一致；突变等价测试证明空或伪造的 `Expected`、`blocked`、`licensed-reproduction` 和第三方候选 URL 均会失败。测试还按 Git blob 算法核对 inventory 与 fixture file 两个 SHA。机器校验不能证明语义正确；它能证明固定算法对固定原始输入产生冻结结果，但不能证明教学方法适用于真实模型、认知问题是否教学上最佳、assessed coverage 是否足以支持学习判断、来源主张是否被正确解释，或实际成图是否清晰。因此发布门仍保留 2026-07-26 的 40 / 40 人工逐行复核，后续成图还需浏览器与无障碍验收。

## 最终本地发布审计（Task 13）

审计日期：2026-07-27。当前候选包含 40 张主视觉和 12 张分步状态图，共 52 个本地 SVG；全部是 `original-synthesis`，没有下载、改编、热链或嵌入第三方媒体。每个 SVG 都是 `1200 × 675`，`viewBox="0 0 1200 675"`。52 个文件全部通过 XML 与静态安全检查，没有 `script`、`foreignObject`、事件处理器、远程资源、外部样式表或可执行链接。

### 数量、角色与许可

- 课程：`llm-01` 至 `llm-08` 各 5 张主视觉。
- kind：`diagram` 37，`step-diagram` 3。
- primary role：`overview` 8，`mechanism` 17，`process` 3，`comparison` 4，`decision` 4，`boundary` 4。
- provenance：`original-synthesis` 40；其他 provenance 均为 0。
- 许可：40 项 `permission: null`，来源与权限解析率 100%；第三方媒体条目 0，未产生需要猜测的许可结论。
- ownership：40 / 40 均恰好有一个真实所属 section；每项 `sourceIds` 都包含于所属 section，并解析到 lesson evidence 与全局资源注册表。
- assessed coverage：40 / 40 均至少覆盖一个经过语义复核的目标、quiz、面试判断、练习步骤或完成标准。

### 视觉质量评分

| 维度 | 分数 | 证据 |
| --- | ---: | --- |
| Accuracy | 9 / 10 | 25 项定量图由冻结 fixture 从原始输入复算；15 项定性图通过可见结构断言与人工审图。 |
| Evidence boundaries | 10 / 10 | 40 项唯一 ownership、section source containment、registry/evidence/global resource 三层解析全部通过。 |
| Teaching value | 9 / 10 | 每张图对应冻结 cognitive question 与 assessed outcome；三轮独立审查修正了注入防御、疑似欠拟合和 Pareto 坐标边界。 |
| Accessibility | 9 / 10 | `alt`、`longDescription`、caption、SVG title/desc、非颜色编码和键盘分步控制完整。 |
| Responsive rendering | 9 / 10 | CSS 保证页面不横溢，复杂媒体使用局部横向滚动，390px/320px 与 44px 控件契约有测试；真实浏览器矩阵仍在 Task 14 执行。 |
| Fallback | 9 / 10 | 未解析 visual ID、加载失败、重复错误事件、step fallback、reduced motion 与 prose preservation 均有 UI 回归。 |
| **总计** | **55 / 60** | 每项均 ≥8，超过 51 / 60 发布线；无视觉硬阻塞。 |

### 每课负载

| lesson | SVG 文件数 | 总字节 |
| --- | ---: | ---: |
| `llm-01` | 8 | 40,932 |
| `llm-02` | 5 | 37,895 |
| `llm-03` | 5 | 34,805 |
| `llm-04` | 9 | 94,680 |
| `llm-05` | 5 | 46,648 |
| `llm-06` | 10 | 79,015 |
| `llm-07` | 5 | 51,186 |
| `llm-08` | 5 | 50,379 |
| **全部** | **52** | **435,540** |

最大单文件为 `llm-04-score-mask-softmax-step-4.svg`，15,491 B。没有超大 raster 派生物；当前 425.33 KiB 的全部视觉负载按 lesson 路由按需请求，不需要为了发布牺牲可读几何。

### 逐视觉资产、来源与归属

下表主文件与 step 文件覆盖全部 52 个资产；format 均为 SVG，dimensions/viewBox 均为 `1200 × 675 / 0 0 1200 675`。

| visual ID | lesson / owning section | 主文件（字节） | step 文件（字节） | sourceIds | provenance / permission |
| --- | --- | --- | --- | --- | --- |
| `visual-llm-01-field-map` | `llm-01/map-the-field` | llm-01-field-map.svg (6519 B) | — | `res-ms-ai`, `res-ms-genai`, `res-hf-llm` | `original-synthesis`; permission=null |
| `visual-llm-01-learning-loop` | `llm-01/minimal-learning-loop` | llm-01-learning-loop.svg (5785 B) | — | `res-ms-ai`, `res-hf-llm` | `original-synthesis`; permission=null |
| `visual-llm-01-autoregressive-generation` | `llm-01/from-generation-to-llm` | llm-01-autoregressive-generation.svg (5100 B) | llm-01-autoregressive-generation-step-1.svg (3201 B)<br>llm-01-autoregressive-generation-step-2.svg (3665 B)<br>llm-01-autoregressive-generation-step-3.svg (4666 B) | `res-ms-genai`, `res-hf-llm`, `res-ms-ai` | `original-synthesis`; permission=null |
| `visual-llm-01-training-inference-boundary` | `llm-01/training-versus-inference` | llm-01-training-inference-boundary.svg (6737 B) | — | `res-ms-genai`, `res-hf-llm`, `res-ms-ai` | `original-synthesis`; permission=null |
| `visual-llm-01-application-decision-stack` | `llm-01/model-and-application-boundary` | llm-01-application-decision-stack.svg (5259 B) | — | `res-ms-genai`, `res-hf-llm`, `res-openai-agents` | `original-synthesis`; permission=null |
| `visual-llm-02-training-cycle` | `llm-02/training-loop-and-tensor-shapes` | llm-02-training-cycle.svg (7569 B) | — | `res-d2l-zh`, `res-karpathy`, `res-fastai` | `original-synthesis`; permission=null |
| `visual-llm-02-neuron-forward` | `llm-02/linear-layers-and-activation` | llm-02-neuron-forward.svg (6672 B) | — | `res-google-ml`, `res-d2l-zh`, `res-fastai` | `original-synthesis`; permission=null |
| `visual-llm-02-backprop-graph` | `llm-02/computation-graph-chain-rule-backprop` | llm-02-backprop-graph.svg (5972 B) | — | `res-d2l-zh`, `res-karpathy`, `res-3b1b-nn` | `original-synthesis`; permission=null |
| `visual-llm-02-learning-rate-trajectories` | `llm-02/optimizer-learning-rate-and-zero-grad` | llm-02-learning-rate-trajectories.svg (9254 B) | — | `res-d2l-zh`, `res-google-ml`, `res-fastai`, `res-karpathy` | `original-synthesis`; permission=null |
| `visual-llm-02-generalization-curves` | `llm-02/generalization-and-training-diagnosis` | llm-02-generalization-curves.svg (8428 B) | — | `res-google-ml`, `res-d2l-zh`, `res-karpathy` | `original-synthesis`; permission=null |
| `visual-llm-03-text-to-context` | `llm-03/token-and-tokenizer` | llm-03-text-to-context.svg (6767 B) | — | `res-tiktoken`, `res-hf-llm`, `res-rasbt`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-03-tokenization-comparison` | `llm-03/token-and-tokenizer` | llm-03-tokenization-comparison.svg (10329 B) | — | `res-tiktoken`, `res-hf-llm`, `res-rasbt`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-03-embedding-position-space` | `llm-03/ids-to-embeddings` | llm-03-embedding-position-space.svg (6555 B) | — | `res-hf-llm`, `res-rasbt`, `res-3b1b-transformer`, `res-ms-genai` | `original-synthesis`; permission=null |
| `visual-llm-03-context-budget` | `llm-03/context-and-shared-budget` | llm-03-context-budget.svg (5064 B) | — | `res-openai-cookbook`, `res-hf-llm`, `res-ms-genai` | `original-synthesis`; permission=null |
| `visual-llm-03-context-strategy-matrix` | `llm-03/context-strategy-tradeoffs` | llm-03-context-strategy-matrix.svg (6090 B) | — | `res-openai-cookbook`, `res-ms-genai`, `res-llm-universe`, `res-hf-llm` | `original-synthesis`; permission=null |
| `visual-llm-04-decoder-block` | `llm-04/decoder-block-information-flow` | llm-04-decoder-block.svg (10658 B) | — | `res-attention-paper`, `res-rasbt`, `res-limu-transformer`, `res-happy-llm` | `original-synthesis`; permission=null |
| `visual-llm-04-qkv-flow` | `llm-04/qkv-query-match-aggregate` | llm-04-qkv-flow.svg (5492 B) | — | `res-3b1b-attention`, `res-attention-paper`, `res-rasbt` | `original-synthesis`; permission=null |
| `visual-llm-04-score-mask-softmax` | `llm-04/scaled-dot-softmax` | llm-04-score-mask-softmax.svg (13901 B) | llm-04-score-mask-softmax-step-1.svg (6053 B)<br>llm-04-score-mask-softmax-step-2.svg (8083 B)<br>llm-04-score-mask-softmax-step-3.svg (13465 B)<br>llm-04-score-mask-softmax-step-4.svg (15491 B) | `res-attention-paper`, `res-rasbt`, `res-3b1b-attention` | `original-synthesis`; permission=null |
| `visual-llm-04-multi-head-merge` | `llm-04/multi-head-attention` | llm-04-multi-head-merge.svg (12007 B) | — | `res-attention-paper`, `res-rasbt`, `res-happy-llm` | `original-synthesis`; permission=null |
| `visual-llm-04-causal-visibility` | `llm-04/causal-mask` | llm-04-causal-visibility.svg (9530 B) | — | `res-attention-paper`, `res-rasbt`, `res-happy-llm` | `original-synthesis`; permission=null |
| `visual-llm-05-method-map` | `llm-05/objectives-before-methods` | llm-05-method-map.svg (7255 B) | — | `res-hf-llm`, `res-ms-genai`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-05-stage-objectives` | `llm-05/sft-and-behavior-shaping` | llm-05-stage-objectives.svg (5850 B) | — | `res-hf-llm`, `res-rasbt`, `res-stanford-cs336` | `original-synthesis`; permission=null |
| `visual-llm-05-preference-boundary` | `llm-05/preference-optimization-boundaries` | llm-05-preference-boundary.svg (8401 B) | — | `res-hf-llm`, `res-rasbt`, `res-happy-llm` | `original-synthesis`; permission=null |
| `visual-llm-05-lora-update` | `llm-05/lora-as-parameter-efficient-update` | llm-05-lora-update.svg (11596 B) | — | `res-rasbt`, `res-hf-llm`, `res-happy-llm` | `original-synthesis`; permission=null |
| `visual-llm-05-rag-finetune-matrix` | `llm-05/rag-finetuning-decision-lab` | llm-05-rag-finetune-matrix.svg (13546 B) | — | `res-ms-genai`, `res-openai-cookbook`, `res-hf-llm`, `res-rasbt` | `original-synthesis`; permission=null |
| `visual-llm-06-generation-loop` | `llm-06/sampling-experiment-and-serving-tradeoffs` | llm-06-generation-loop.svg (14067 B) | llm-06-generation-loop-step-1.svg (4070 B)<br>llm-06-generation-loop-step-2.svg (4693 B)<br>llm-06-generation-loop-step-3.svg (5918 B)<br>llm-06-generation-loop-step-4.svg (6932 B)<br>llm-06-generation-loop-step-5.svg (12886 B) | `res-rasbt`, `res-hf-llm`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-06-logit-softmax` | `llm-06/logits-softmax-next-token` | llm-06-logit-softmax.svg (4535 B) | — | `res-rasbt`, `res-hf-llm` | `original-synthesis`; permission=null |
| `visual-llm-06-temperature-top-p` | `llm-06/top-p-and-combined-sampling` | llm-06-temperature-top-p.svg (7236 B) | — | `res-hf-llm`, `res-openai-cookbook`, `res-rasbt` | `original-synthesis`; permission=null |
| `visual-llm-06-kv-cache` | `llm-06/kv-cache-reuse-memory-and-concurrency` | llm-06-kv-cache.svg (8528 B) | — | `res-hf-llm`, `res-rasbt`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-06-latency-breakdown` | `llm-06/prefill-decode-and-latency-metrics` | llm-06-latency-breakdown.svg (10150 B) | — | `res-hf-llm`, `res-openai-cookbook` | `original-synthesis`; permission=null |
| `visual-llm-07-runtime-contract` | `llm-07/prompt-as-runtime-contract` | llm-07-runtime-contract.svg (6866 B) | — | `res-ms-genai`, `res-openai-cookbook`, `res-hf-agents` | `original-synthesis`; permission=null |
| `visual-llm-07-instruction-boundary` | `llm-07/instruction-and-untrusted-data-boundaries` | llm-07-instruction-boundary.svg (8552 B) | — | `res-owasp-prompt-injection`, `res-ms-genai`, `res-hf-agents` | `original-synthesis`; permission=null |
| `visual-llm-07-schema-pipeline` | `llm-07/schema-and-structured-output` | llm-07-schema-pipeline.svg (9085 B) | — | `res-openai-cookbook`, `res-ms-genai`, `res-hf-agents` | `original-synthesis`; permission=null |
| `visual-llm-07-retry-state-machine` | `llm-07/validation-retry-and-side-effects` | llm-07-retry-state-machine.svg (14081 B) | — | `res-openai-cookbook`, `res-ms-genai`, `res-owasp-prompt-injection` | `original-synthesis`; permission=null |
| `visual-llm-07-version-eval-loop` | `llm-07/observable-versioned-evaluation` | llm-07-version-eval-loop.svg (12602 B) | — | `res-openai-cookbook`, `res-llm-universe`, `res-ms-genai`, `res-owasp-prompt-injection` | `original-synthesis`; permission=null |
| `visual-llm-08-failure-map` | `llm-08/failure-taxonomy-not-fluency` | llm-08-failure-map.svg (12057 B) | — | `res-ms-genai`, `res-openai-cookbook`, `res-hf-agents` | `original-synthesis`; permission=null |
| `visual-llm-08-grounding-chain` | `llm-08/evidence-grounding-and-uncertainty` | llm-08-grounding-chain.svg (8380 B) | — | `res-openai-cookbook`, `res-ms-genai`, `res-llm-universe` | `original-synthesis`; permission=null |
| `visual-llm-08-eval-funnel` | `llm-08/eval-dataset-and-slices` | llm-08-eval-funnel.svg (8552 B) | — | `res-openai-evals`, `res-openai-cookbook`, `res-ms-genai`, `res-hf-agents` | `original-synthesis`; permission=null |
| `visual-llm-08-injection-defense` | `llm-08/prompt-injection-threat-model` | llm-08-injection-defense.svg (10456 B) | — | `res-owasp-prompt-injection` | `original-synthesis`; permission=null |
| `visual-llm-08-release-pareto` | `llm-08/defense-in-depth-and-runtime-operations` | llm-08-release-pareto.svg (10934 B) | — | `res-owasp-prompt-injection`, `res-hf-agents`, `res-ms-genai`, `res-anthropic-agents` | `original-synthesis`; permission=null |

### 最终命令与独立审查

| 检查 | 结果 |
| --- | --- |
| `npm test` | 474 / 474 通过 |
| `node --test tests/knowledge-visual-contract.test.js tests/knowledge-visual-ui.test.js tests/llm-foundation-visual-data.test.js tests/llm-foundation-visual-inventory.test.js tests/visual-registry-ownership.test.js` | 126 / 126 通过 |
| `find src tests -name '*.js' -exec node --check {} \;` | 退出码 0，无语法错误 |
| `find assets/visuals/llm-foundation -maxdepth 1 -type f -print` | 52 个文件 |
| `xmllint --noout assets/visuals/llm-foundation/*.svg` | 退出码 0 |
| `git diff --check` | 退出码 0 |
| `git status --short --branch` | `feat/llm-foundation-visual-system`；9 个预期未提交文件（3 SVG、inventory、registry、3 tests、audit） |

三项独立终审均已通过：

1. specification / coverage：PASS；40 个 ID、placement、assessed coverage、25 个 fixture 与 15 个 qualitative scope 全部闭环。
2. pedagogy / evidence / license：APPROVED；修正后没有纯装饰、证据越界、定量误导或许可风险。
3. engineering / accessibility / security：APPROVED；52 个资产、renderer、keyboard、fallback、narrow-screen CSS、reduced motion、active-SVG 与共享模块回归均通过。

终审返修记录：

- `visual-llm-02-generalization-curves` 将“欠拟合”收窄为依赖任务基线/阈值的“疑似欠拟合”。
- `visual-llm-08-injection-defense` 用路径上的实体屏障表示四项预防控制，并把日志改为影响后的检测、遏制与反馈回路。
- `visual-llm-08-release-pareto` 显式标注坐标按通过安全门候选范围截断：质量 82–91、成本 1.0–3.4、P95 450–1100。

### 当前浏览器与部署状态

- 本地自动化与独立审查：完成。
- Task 14 真实浏览器桌面、390px、320px、键盘、reduced motion、断图降级与 console 验收：**尚未执行**。
- Vercel Preview / Production：**尚未部署**。
- 当前文档不得把本地测试、PR、Preview URL 或部署开始描述为生产上线；只有真实浏览器矩阵、Production `READY`、canonical routes、exact `main` SHA 与 Pages-disabled 检查全部通过后才可更新为完成。
