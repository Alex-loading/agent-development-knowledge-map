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

## 实施就绪复核

- 清单内容标识：Inventory git blob SHA：`3a7cb8d3366f67d776b3feb4f103c2fc037ae46c`
- 数值真源标识：Fixture git blob SHA：`dd1c46658cfd5bc600da07db5acc9167f3ef40e7`
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
| `node --test tests/llm-foundation-visual-inventory.test.js` | `tests 12`、`pass 12`、`fail 0` |
| `npm test` | `tests 331`、`pass 331`、`fail 0` |
| `rg -n -i 'T[O]DO\|T[B]D\|p[l]aceholder\|待[补]\|未[知]\|unk[n]own' docs/research/2026-07-26-llm-foundation-visual-inventory.md docs/content-audits/2026-07-26-llm-foundation-visuals.md tests/fixtures/llm-foundation-visual-fixtures.js` | 无匹配，退出码 1 |
| `git diff --check` | 无输出，退出码 0 |

项目测试会校验 40 个唯一 ID、每课 5 项分布、角色 allowlist、storyboard 七要素、section/source/assessed 路径解析、文档派生的 25/15 fixture 分类、单一真源字段与引用，并实际重算 softmax、BCE/MSE、SGD、上下文预算、KV 容量、nearest-rank P95、切片通过率、Pareto 支配关系和全部 25 条预期结果。方法级证明包括从 raw prompt 真正执行最长匹配、对乱序候选先排序再构造 top-p 最小前缀、对乱序延迟样本先排序再取 nearest-rank、按命名轴与示例证据执行三路 RAG/SFT 规则并验证属性顺序不变性，以及按 key/payload 事件实际执行幂等缓存和副作用计数。行为突变测试还证明 BCE 标签、完整训练曲线、逐行因果分数和 LoRA rank 能改变结果或触发契约拒绝；其余排序、过滤与聚合方法也从各自 `data` 执行，而非读取预整理结果。冻结状态还精确要求 40 项 `decision=original-synthesis`、40 项 `status=verified`，并检查 candidate URL 与 permission evidence 一致；突变等价测试证明空或伪造的 `Expected`、`blocked`、`licensed-reproduction` 和第三方候选 URL 均会失败。测试还按 Git blob 算法核对 inventory 与 fixture file 两个 SHA。机器校验不能证明语义正确；它能证明固定算法对固定原始输入产生冻结结果，但不能证明教学方法适用于真实模型、认知问题是否教学上最佳、assessed coverage 是否足以支持学习判断、来源主张是否被正确解释，或实际成图是否清晰。因此发布门仍保留 2026-07-26 的 40 / 40 人工逐行复核，后续成图还需浏览器与无障碍验收。
