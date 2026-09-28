# Multi Agent 编排研究记录

核验日期：2026-09-18。研究范围：第七模块 `multi-agent-mcp` 的 `ma-01`、`ma-02`、`ma-03`，涉及适用条件、任务依赖、委托与控制权、上下文选择、结果验收和质量成本比较。本记录只提供研究证据及课程能力建议。

采用本地 `build-agent-learner-module` 的 research-and-curriculum 标准，以及 `build-learning-module-notes` 的 source-policy。访问 OpenAI 正文前已读取 `openai-docs`。以下均为原始作者正文或官方文档；搜索摘要仅用于发现入口。未获取或检查图像，文中范围均指可读取的文字、表格与代码。

## 研究问题与能力边界

建议入门能力为：能解释单 Agent 的工具循环，能识别数据依赖，能编写任务成功条件，并理解上一模块的 baseline、trace 和回归评测。前三课的目标是让学习者为企业知识助手与工单处理场景完成一份编排设计：说明是否需要多个 Agent、谁拥有下一步控制权、各参与者收到什么信息、返回什么证据，以及如何衡量新增协作的收益。

交付物建议包含任务依赖表、控制流说明、委托输入与结果格式、验收规则和质量成本比较表。MCP 角色、2026-07-28 规范、transport、认证和执行权限由后续课程承担；本记录不为这些协议语义提供证据。

## 原始资料清单

下列 ID 为主代理可采用的资源候选 ID，尚不表示课程注册或覆盖校验已经完成。`core`、`cross-check` 表示建议用途。全部 `checkedAt` 均为 `2026-09-18`。

### 1. Building effective agents

- 候选 ID：`res-ma-effective-agents`。
- 原文：[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)。作者 Erik S.、Barry Zhang；发布方 Anthropic。
- 来源性质：官方工程文章；建议用途 `core`。
- 日期与版本：页面标注 2024-12-19；当前页面明确提醒工具生态已有变化，正文包含持续更新内容，应同时保留核验日期。
- `bodyAccess: full`：读取从 What are agents?、When to use agents，到五种 workflow、Agents、Combining patterns、Appendix 1 与 Appendix 2 的全部文字。
- 可支持主张：预设代码路径与模型动态决策是不同的编排选择；简单方案应先形成基线；固定独立工作适合 parallelization，随输入产生工作项适合 orchestrator-workers；evaluator-optimizer 需要清楚的评价标准及可验证的改进；工具反馈和停止条件属于 Agent 循环的重要组成。
- 限制：工程经验不构成所有任务的效果保证；文内模型和框架示例不能用作当前产品选型结论。它支持模式定义，不提供一套通用的 Agent 数量或预算阈值。

### 2. How we built our multi-agent research system

- 候选 ID：`res-ma-research-system`。
- 原文：[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)。Jeremy Hadfield 等六位作者；Anthropic。
- 来源性质：官方工程实践；建议用途 `core`。
- 日期：2025-06-13。
- `bodyAccess: full`：读取 Benefits、Architecture overview、Prompt engineering、Effective evaluation、Production reliability 和 Appendix 全部文字。
- 可支持主张：独立研究方向和独立上下文适合并行探索；委托说明应包含目标、输出形式、工具与来源、范围；结果可保存为 artifact 并返回引用；验收兼顾任务结果、引用、完整性和工具效率；同步等待、错误恢复和协作本身均有成本。
- 数字边界：90.2% 是该团队内部研究评测中指定系统相对 single-agent Claude Opus 4 的报告结果；15× 的比较基准是 chats 的 token 使用量。二者均不可转成课程通用收益。本文还明确讨论共享上下文需求和密集依赖造成的不适配。
- 限制：内部任务集及设置不等同本项目场景；本文的约 20 个早期测试案例用于快速发现大变化，不是上线可靠性证明。

### 3. Orchestration and handoffs

- 新增候选 ID：`res-ma-openai-orchestration`。
- 原文：[Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)。OpenAI 官方开发者文档。
- 来源性质：官方实现指南；建议用途 `core` 或交叉核验。
- 日期与版本：正文无明确发布日期或固定 SDK 版本；核验于 2026-09-18。
- `bodyAccess: full`：通过官方文档 search 后 fetch 读取完整 Markdown，包含模式表、handoff 示例、agents-as-tools 示例和增加 specialist 的条件。
- 可支持主张：handoff 将当前分支的后续回复责任交给 specialist；`agent.asTool()` / `agent.as_tool()` 使 manager 保留最终回复责任。应先采用单 Agent，再根据能力范围、策略、提示清晰度或 trace 可读性决定是否增加 specialist。
- 限制：该页给出概念与基础示例，结构化 handoff metadata、history filtering 的准确 API 留在 SDK 文档；本次未运行这些示例，也未将其语言接口细节纳入课程考查。

### 4. LangChain Multi-agent

- 候选 ID：`res-ma-langchain-multi-agent`。
- 原文：[Multi-agent](https://docs.langchain.com/oss/python/langchain/multi-agent/index)。LangChain 官方文档。
- 来源性质：官方概念文档；建议用途 `core`。
- 日期与版本：持续更新的 Python 文档；正文未标固定包版本或更新日。
- `bodyAccess: full`：读取 Why multi-agent?、Patterns、Choosing a pattern、Performance comparison 的三个场景及 Summary。
- 可支持主张：上下文管理、独立维护和并行工作是常见需求；需要比较 model calls 与所有调用的 token 总量；一个模式在单次请求、重复请求和跨领域请求中的成本可能不同。
- 限制：性能表是简化场景分析，不能当作 benchmark。正文以 9K 与 15K tokens 为例却写有“67% fewer”；按表内数字计算，减少比例为 40%。课程宜保留定性机制，避免引用该百分比。该页的 stateless 描述须结合 subagents 页的可选持久化说明阅读。

### 5. LangChain Subagents

- 候选 ID：`res-ma-langchain-subagents`。
- 原文：[Subagents](https://docs.langchain.com/oss/python/langchain/multi-agent/subagents)。LangChain 官方文档。
- 来源性质：官方机制与实现文档；建议用途 `core`。
- 日期与版本：持续更新的 Python 文档，未标固定包版本；核验于 2026-09-18。
- `bodyAccess: full`：读取 Basic implementation、Design decisions、Sync vs. async、Tool patterns、Context engineering、Subagent inputs/outputs、Checkpointing and state inspection。
- 可支持主张：supervisor 决定调用对象、输入和汇总方式；默认调用使用新 state，但可显式加入父级历史或选择持久化；只传任务、传入历史及返回摘要都有信息与成本取舍；子 Agent 的最终输出必须包含 supervisor 所需结果。
- 限制：本文的 async 指后台任务机制，不能仅凭 Python `async` / `await` 判断。上下文隔离不证明执行权限隔离。checkpoint 与 state inspection 的细节属于当前 LangGraph 实现语义，写入课程时应保留版本核验要求。

### 6. LangChain Handoffs

- 候选 ID：`res-ma-langchain-handoffs`。
- 原文：[Handoffs](https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs)。LangChain 官方文档。
- 来源性质：官方机制与实现文档；建议用途 `core`。
- 日期与版本：持续更新的 Python 文档，未标固定包版本；核验于 2026-09-18。
- `bodyAccess: full`：读取定义、使用条件、Basic implementation、两种 implementation approaches、Context engineering 和 Implementation considerations，以及相应代码。
- 可支持主张：状态字段如 `current_step`、`active_agent` 驱动行为变化；该页同时涵盖单 Agent 的配置切换与多个 agent subgraphs；subgraph handoff 需要明确传递哪些消息；tool call 与对应 `ToolMessage` 的配对必须保持有效；路由更新与外部写操作应明确区分。
- 限制：术语范围比 OpenAI 模式表更宽。只传 handoff 消息对的简化示例明确假定没有并行 tool calls，不能作为所有消息历史的通用裁剪算法。原示例未经本地执行。

### 7. LangGraph Workflows and agents

- 候选 ID：`res-ma-langgraph-workflows`。
- 原文：[Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)。LangChain 官方 LangGraph 文档。
- 来源性质：官方实现指南；建议用途 `core`，并用于机制交叉核验。
- 日期与版本：持续更新的 Python 文档；未标固定包版本，核验于 2026-09-18。
- `bodyAccess: full`：分两次读取全文文字与代码，范围包括 Prompt chaining、Parallelization、Routing、Orchestrator-worker、Creating workers、Evaluator-optimizer、Agents、ToolNode。
- 可支持主张：`Send` 可根据计划动态创建 worker 调用并传入专属输入；worker 有各自 state，输出可经共享 state key 汇集；汇总和评价是需要设计的步骤；预设并行工作与动态任务分配适用于不同需求。
- 限制：示例展示数据流，不能证明业务成功。报告示例通过字符串组合生成最终输出，应用仍需增加业务验收。此页与 Anthropic 模式存在内容渊源，不能把二者算成两项独立实证。未运行示例或读取图片。

### 8. Towards a Science of Scaling Agent Systems

- 新增候选 ID：`res-ma-agent-scaling-science`。
- 原文：[Towards a Science of Scaling Agent Systems，v3](https://arxiv.org/html/2512.08296v3)。Yubin Kim 等作者，署名机构包括 Google Research、Google DeepMind 和 MIT。
- 来源性质：作者原论文；建议用途 `cross-check`。
- 日期与版本：v3，2026-04-08；[arXiv 版本记录](https://arxiv.org/abs/2512.08296)用于核验版本日期。
- `bodyAccess: partial`：实际读取 Introduction、Related Work、§3.1 的定义与架构部分、完整 §3.2、§4.1、§4.2、§4.5、§5，以及 Appendix E.4；也读取到 §4.3 和 §4.4 的部分内容。未阅读全文全部附录或执行作者代码。
- 可支持主张：该研究在 260 个配置、6 个 benchmark 中报告强烈的任务与架构依赖；质量比较同时记录预算、工具条件、协作过程和成本；正文中的 Finance Agent 与 PlanCraft 展现相反方向的效果。
- 限制：约 45% 的 single-agent 经验阈值不可作为应用通用规则。两项新增 benchmark 每配置只有 20 个实例，作者指出成对比较能力有限；提示未按每个模型单独优化。v1 的 180 个配置与回归结果不可混入 v3。本文适合支持评测思路与范围意识，不宜把全部回归系数编入基础课。

## 需要统一的术语与来源范围

| 项目 | 本模块建议用法 | 原文依据与范围 |
| --- | --- | --- |
| workflow 与 Agent | 按谁决定下一步描述，可包含确定流程和动态决策的组合 | `res-ma-effective-agents`、`res-ma-langgraph-workflows` |
| manager / supervisor | 保留编排和最终综合责任，specialist 完成有边界的工作 | `res-ma-openai-orchestration`、`res-ma-langchain-subagents` |
| handoff | 先说明正在使用的框架定义，再说明后续行为或回复由谁负责 | `res-ma-openai-orchestration`、`res-ma-langchain-handoffs` |
| context isolation | 描述输入历史、任务数据和返回信息的范围；执行权限另行设计 | `res-ma-langchain-subagents`；权限部分交由后续安全证据 |
| parallelization | 依据工作项的数据依赖与共享状态需求判断 | `res-ma-effective-agents`、`res-ma-research-system` |
| coordination benefit | 同时查看任务质量、成本和等待时间，保留实验设置 | `res-ma-agent-scaling-science`、`res-ma-langchain-multi-agent` |

来源之间没有形成单一产品 API。课程可以建立统一问题框架，但必须保留各实现的定义范围。可发布的核心结论是：多 Agent 的价值需要在具体任务、控制流和资源条件下验证；增加角色数量本身不足以证明改进。

## 前三课的能力与考查建议

下表为依据已读正文进行的教学设计。字段名称、企业案例与验收动作由本项目提出，不声称它们是某个 SDK 的标准格式。

| 课程 | 可观察能力 | 建议练习交付物 | 建议考查重点 | 主要证据 |
| --- | --- | --- | --- | --- |
| `ma-01` 多 Agent 适用条件与任务依赖 | 从 single-agent baseline 的具体问题出发，识别可独立探索的任务、必须等待的前置结果及共享状态需求；给出采用多 Agent 或保留简单方案的理由 | 对知识检索、跨部门调查、工单状态更新列出输入、前置结果、并行许可、质量目标与预算；形成一页决策记录 | 独立资料调查与顺序状态更新为何不同；增加协作时如何验证收益 | `res-ma-effective-agents`、`res-ma-research-system`、`res-ma-agent-scaling-science` |
| `ma-02` 编排、委托与控制权 | 在 routing、固定 parallelization、动态 orchestrator-workers、manager-as-tools 和 handoff 中选择适合的控制流；指出每一步谁继续执行与回复 | 为同一工单画出文字控制流，分别写清 manager 调 specialist 和转交 specialist 的输入、输出、下一责任人；提供完整委托说明 | manager 返回结果后谁综合；handoff 后谁处理后续消息；动态任务分配与预设工作项的区别 | `res-ma-openai-orchestration`、`res-ma-langchain-handoffs`、`res-ma-langgraph-workflows`、`res-ma-research-system` |
| `ma-03` 上下文隔离与结果验收 | 按任务选择输入历史与证据，设计可检查的结果，识别遗漏、矛盾和不可核验的完成声明 | 提交一份委托输入与返回样例，列明必要事实、来源引用、未解决项、artifact 引用、验收结果及失败后的责任人 | 为什么过少上下文会丢失约束；为何完整历史也有成本；完成消息如何获得独立验收 | `res-ma-langchain-subagents`、`res-ma-langchain-handoffs`、`res-ma-research-system` |

建议三课依次形成“是否分工 → 如何分工 → 如何传递与验收”的能力链，之后再进入 MCP 交互和权限机制。结果验收应继续使用第六模块已经建立的 outcome、policy 与人工校准知识，本模块增加跨 Agent 交接时的证据完整性要求。

## 供主代理确定评测要求的检查表

以下为本地课程检查建议，使用上述资料的机制进行教学演绎；它们没有对应一套官方固定 JSON schema。

1. 适用条件：至少包含一项确有独立工作的研究任务、一项严格依赖前置状态的任务，以及一项简单请求。学习者必须写出基线问题和新增协作的成本来源。
2. 控制权：在每个调用或 handoff 后明确下一执行者、最终回复责任人和仍未完成的工作。状态驱动配置变化须标注其实现方式，避免将所有 handoff 都数成新增 Agent。
3. 委托输入：可使用 `taskId`、`objective`、`dependencies`、`inputs`、`constraints`、`allowedTools`、`outputFormat`、`budget`。这些字段用于让边界可审查，字段名称属于本地教学设计。
4. 返回与验收：可使用 `status`、`result`、`sourceRefs`、`artifactRefs`、`uncertainties`、`remainingWork`。验收需要核对结果是否满足任务规则和证据是否可查；`completed` 字符串本身不能完成这项判断。
5. 质量成本比较：在同一任务集、工具条件和可比预算下比较 baseline 与候选；同时保留任务成功、关键规则失败、总 token、model/tool calls、总费用、wall-clock latency 及重复工作记录。费用和等待时间分别记录，以免把并行带来的等待缩短误读成资源减少。
6. 实验限制：教学交互可呈现已给定的依赖与成本数据，要求学习者解释控制流。它的计算结果只适用于输入数据，不能声称已经预测真实模型质量。真实质量结论需要实际运行记录及上一模块的评测方法。

## 访问状态与检查记录

- 已直接读取 8 份核心候选正文：7 份完整文字、1 份按章节读取的原论文。当前候选不存在以搜索摘要代替正文的情况。
- 另访问 arXiv 版本页和 v1 开头部分。版本页只支持日期、作者与版本信息；v1 不作为当前课程主证据。
- 未访问源文中的图片、视频、链接后的完整教程或所有 SDK reference。未读取的内容不在本记录支持范围内。
- `tests.status: not applicable`；原因：本次只新增研究文档，未更改课程数据、程序或测试，也未执行文内第三方示例。
- `brokenReferenceCount: null`；原因：本记录提供候选资源与证据范围，未执行第七模块课程注册引用校验。
- 文本检查范围为本文件；完整模块质量、课程评分和发布检查由后续作者与审查任务完成。
