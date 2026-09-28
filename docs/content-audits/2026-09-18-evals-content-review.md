# 第六模块 01–04 内容独立审查

审查日期：2026-09-18。审查者未编写 `eval-01` 至 `eval-04`。本记录覆盖四课正文、课程目标、测验、面试题、练习、完成标准、56 条覆盖映射，以及 8 幅教学图的来源归属；不对审查者编写的 `eval-06`、`eval-07` 进行独立内容评分。

正文与考核对应关系通过，未发现需要阻止内容验收的概念错误、未教先考或来源归属问题。四课均达到笔记 Rubric 的 85 分要求。来源归属、图资产一致性与静态 SVG 安全检查通过；浏览器 DOM 验证由集成审查记录。

## 审查依据与正文证据

采用仓库中的 [笔记构建技能](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.agents/skills/build-learning-module-notes/SKILL.md)、[质量 Rubric](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.agents/skills/build-learning-module-notes/references/quality-rubric.md)、[数据要求](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.agents/skills/build-learning-module-notes/references/data-contract.md)和[模块设计](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/docs/superpowers/specs/2026-09-18-evals-observability-security-design.md)。课程字段用于确认考核范围，来源正文用于核验知识主张。

独立读取了以下五份原始正文。所有访问均限于相关正文，不将链接标题或未读引用视作证据；核验日期为 2026-09-18。

| 来源 | 直接读取范围 | 支持结论与使用限制 |
| --- | --- | --- |
| [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | evaluation 结构、三类 grader、重复运行与建设流程 | task、trial、transcript、outcome 分开；环境隔离；人工校准；证据不足可保留 unknown；规则应允许有效替代路径。工程经验不构成任意产品的可靠性保证。 |
| [τ-bench v1](https://arxiv.org/html/2406.12045v1) | 任务与环境、reward、重复可靠性定义，尤其 §5.1 | 数据库终态与必要回答构成 reward；reward 满足仍可能缺少必要确认。pass@k 与 pass^k 先在任务内定义和估计，再跨任务汇总。 |
| [MT-Bench v4](https://arxiv.org/html/2306.05685v4) | §3 裁判类型、局限与缓解；§4 人工一致性 | 位置、冗长和模型自我倾向会影响判断；交换顺序后的保守判胜口径可复核。一致性比例受样本、模型和平局处理影响，不能直接充当业务准确率。 |
| [RAGAS v1](https://arxiv.org/html/2309.15217v1) | §2 维度、§3 自动评估与验证讨论 | faithfulness、answer relevance、context relevance 具有不同检查对象；answer relevance 不检查 factuality。自动指标仍有误差，论文没有覆盖完整 Agent 授权或任务环境。 |
| [scikit-learn：Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) | Data leakage 与 How to avoid data leakage | 测试数据不得参与拟合或选择。课程将此原则用于 Agent 样例治理，并明确其不提供统一集合比例。 |

## 五类评分

五类权重分别为覆盖 25、知识结构 20、来源与不确定性 25、可读性与示例 20、版权与数据结构 10。分数依据当前正文及其可复核证据；数字不代表部署或浏览器验收结果。

| 课程 | 覆盖 /25 | 结构 /20 | 来源 /25 | 可读性 /20 | 版权与结构 /10 | 总分 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| eval-01 | 25 | 19 | 25 | 18 | 10 | 97 |
| eval-02 | 24 | 19 | 25 | 18 | 10 | 96 |
| eval-03 | 25 | 19 | 25 | 18 | 10 | 97 |
| eval-04 | 24 | 19 | 25 | 18 | 10 | 96 |

### eval-01：任务标准、数据集与基线

- 覆盖：任务结果与关键约束、案例卡、集合用途、环境恢复、版本及分母均有实质解释。三个目标、两题测验、三道面试题、三步练习、交付物和两个完成标准都有明确教学位置，共 14 条映射。
- 结构：六节依次建立证据、案例、集合、基线、版本与验收包，前后课衔接清楚。版本账本与验收包中的复现要求略有重复，因此记 19/20。
- 来源：在 [正文第 13 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-01.js:13)区分行为记录与环境事实，在第 15 行保留 τ-bench reward 的必要条件限制；集合划分使用 scikit-learn 作交叉核验并说明适用范围。来源 25/25。
- 可读性：确认与未确认的工单形成有效对照，残留工单与过期政策暴露实际判据。完整案例卡主要通过叙述呈现，读者仍需将多个位置的信息整理成表，因此记 18/20。
- 数据：2833 个正文字符、六节、四个误区、五项回顾，ID 与资源引用完整，采用原创例子和转述。数据与版权 10/10。

### eval-02：评分器、Rubric 与人工校准

- 覆盖：代码、模型和人工的职责、Rubric、位置交换、人工校准、unknown 与已知失败均有教学依据。14 条映射完整；练习同时组合职责表、Rubric 和对照记录，阅读时需要回到多个章节，覆盖记 24/25。
- 结构：六节由可核验事实推进到裁判校准和评分器回归，顺序合理。校准与分歧处理中存在少量重复解释，记 19/20。
- 来源：在 [第 31 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-02.js:31)与第 33 行准确表述 MT-Bench 顺序检验及其局限；第 41–43 行以业务样本校准裁判，避免继承论文比例。图中的 unknown 与人工核验有 Anthropic 正文支持，来源 25/25。
- 可读性：简洁完整与冗长缺项的 A/B 例子能展示相对判胜与事实正确的区别；十例校准中的关键误判说明单一一致率的不足。完整校准记录由练习生成，正文没有给出整张表，记 18/20。
- 数据：2858 个正文字符、六节、四个误区、五项回顾，结构与引用通过，数据与版权 10/10。

### eval-03：切片、重复试验与发布门槛

- 覆盖：同案例比较、总体与切片、分子分母、重复试验、证据不足和关键失败均能支撑测验、面试与实验。14 条映射完整，覆盖 25/25。
- 结构：六节由配对记录推进到明确的 block、hold、pass 决策，下一课直接接续 `long-b`。概率说明与发布策略共享章节空间，信息密度较高，记 19/20。
- 来源：在 [第 32–36 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-03.js:32)限定单任务独立同分布条件，并说明跨任务统计顺序。最少样本与容差均明确为教学策略，未被表述为统计显著性结论。来源 25/25。
- 可读性：六条固定案例准确展示总体 5/6 不变、长文档 2/2 变为 1/2。`p=0.8`、`k=3` 与两个异质任务的例子有助于解释不同可靠性目标，但两个符号及其统计层级仍需要较高注意力，记 18/20。
- 数据：2834 个正文字符、六节、四个误区、五项回顾，实验 ID 和引用完整，数据与版权 10/10。

### eval-04：RAG 与 Agent 分层诊断

- 覆盖：任务可解性、上下文相关性、回答忠实度、回答相关性、事实正确性、检索候选与实际上下文、行动终态与回归都有解释。14 条映射完整；多个环节共同承担故障矩阵练习，需要综合阅读，覆盖记 24/25。
- 结构：从用户任务进入内部证据，随后进行受控回放与端到端复验，顺序清楚。六节覆盖的系统环节较多，读者需维护多个证据对象，记 19/20。
- 来源：在 [第 22–24 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-04.js:22)准确保留 RAGAS 三个维度的原始边界，并以过期政策说明忠实度与事实正确性不同。任务约束和环境终态由 Anthropic 与 τ-bench 支持，来源 25/25。
- 可读性：记录 A、B、C 分别展示资料缺失、上下文选择和生成错误。正文明确每条证据仅收缩调查范围，避免过早认定唯一根因。完整故障矩阵仍由读者在练习中组织，记 18/20。
- 数据：2902 个正文字符、六节、四个误区、五项回顾，结构及引用完整，数据与版权 10/10。

## 关键概念与实验一致性

1. **pass^k**：正文没有将跨任务平均成功率直接取幂。单任务独立同分布例子中的 `1−(1−0.8)^3=0.992` 与 `0.8^3=0.512` 正确；两个任务概率为 0 和 1 的例子也正确。课程没有实现 τ-bench 经验估计器，没有将概率演示冒充实测 benchmark 结果。
2. **发布状态**：[核心逻辑](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js:30)与正文一致。关键失败优先返回 block；评分完整的退化可阻止；证据不完整或样本不足返回 hold；通过仅限教学规则。未知数量没有被悄悄算为成功。
3. **RAG 指标**：回答相关性不检查事实正确性；对过期材料的忠实复述仍可能错误。上下文指标用于诊断，任务验收继续检查业务事实与行动约束。
4. **评分器本身**：合法结构与正确判定分开；人工一致率不掩盖关键误放过；unknown 有补证据路径。未发现需要读者依赖外部资料才能作答的关键考核。

## 图源归属与覆盖结构

8 幅图各有一个明确 owner，图源均为 owner 来源集合的子集，并能在相应课程和项目资源表中解析。`brokenReferenceCount: 0`，来源缺口为 0，课程字段被当作资源证据的情况为 0。

| 图 | owner | 核对结果 |
| --- | --- | --- |
| visual-eval-01-overview | eval01-outcome-evidence | Anthropic 与 τ-bench 支持行为、结果和约束关系 |
| visual-eval-01-detail | eval01-dataset-boundary | scikit-learn 与 Anthropic 支持集合用途和数据治理 |
| visual-eval-02-overview | eval02-grader-routing | Anthropic 与 MT-Bench 支持评分器分工和校准 |
| visual-eval-02-detail | eval02-pairwise-bias | MT-Bench 支持交换位置；Anthropic 支持 unknown 与核验 |
| visual-eval-03-overview | eval03-comparable-runs | Anthropic 与 τ-bench 支持可比任务及重复证据 |
| visual-eval-03-detail | eval03-slice-regression | 数值直接来自固定教学案例；Anthropic 支持回归评测主题 |
| visual-eval-04-overview | eval04-end-to-end-map | RAGAS 与 τ-bench 支持组件和任务结果的不同职责 |
| visual-eval-04-detail | eval04-quality-dimensions | RAGAS 支持三个指标；Anthropic 与 τ-bench 支持任务验收边界 |

正文中的中文限制词句检查无命中。四课测试审计均使用当前仓库内可复验命令，注明浏览器 DOM 验证范围。覆盖矩阵共 56 行，包含 12 个目标、8 道测验、12 道面试题、12 个练习步骤、4 个交付物和 8 个完成标准。

## 实际验证与剩余范围

测试命令：`node --test tests/evals-core.test.js tests/evals-module.test.js tests/evals-visuals.test.js`。实际结果为 9 项通过、0 项失败，退出码 0；覆盖核心 6 项、课程结构 1 项、图一致性及静态安全 1 项、图柱宽计算 1 项。

资产检查命令：`node scripts/generate-evals-visuals.mjs --check`。实际结果为 16 幅图通过，退出码 0。所有本地 SVG 与当前 scenes 一致；本审查范围没有待处理的内容或引用问题。

本审查没有执行截图、视觉检查或模拟 DOM 测试。图的六项完整评分、窄屏浏览器 DOM、键盘交互和页面进度由集成审查记录；本文不据静态源码认定这些条件已经通过。课程注册与激活属于集成步骤，不作为内容缺陷。
