# Agent 机制学习模块设计

## 1. 目标与既定选择

Agent Learner 的第二个完整模块为「Agent 机制」。本模块沿用 LLM 基础模块已经确认的产品选择：Paper Lab 视觉语言、原生 ES Modules、六个通用学习视图、本地进度、八节递进课程、精选资源、交互练习、理解测验和模块独立面试题库。用户明确要求所有需要选择的地方与第一个模块一致，因此本次不引入新的视觉方向、框架或导航模式。

模块目标不是教会某一个 Agent 框架的 API，而是让学习者能从目标、状态、动作、观察和终止条件解释一个单 Agent 系统，能手写最小控制循环，并能在面试中说明工具、规划、状态、反思和错误恢复的机制与边界。

## 2. 范围边界

本模块完整覆盖：

- Agent、workflow 与普通 LLM 应用的区别；
- 目标、约束、成功证据、工作状态和未知项；
- 工具调用协议、结构化动作与执行器边界；
- decide / act / observe / update 控制循环与 ReAct；
- reactive、plan-and-execute、搜索与动态重规划；
- 错误分类、重试预算、反思、外部验证和受控失败；
- 当前任务的上下文、工作记忆、事件日志与状态快照；
- 终止条件、人类澄清/接管和单 Agent 综合设计。

本模块只定义以下后续模块的接口，不展开实现：

- Agent Harness：耐久执行、权限、队列、检查点、追踪与部署；
- 上下文、RAG 与记忆：检索、向量索引和跨会话长期记忆；
- 评测、可观测与安全：系统化评测集、威胁模型和在线观测；
- 多 Agent 与 MCP：协作拓扑、协议细节和多主体编排。

## 3. 八节课程

### 3.1 Agent、Workflow 与普通 LLM 应用

建立 agency 连续谱，解释控制权在代码还是模型，拆出目标、策略、动作空间、环境、状态、观察和终止条件。练习要求学习者为三个业务案例判断是否需要 Agent，并写出成功标准和停止条件。

### 3.2 目标、约束与任务状态

把自然语言请求转成可执行 task contract，区分硬约束、软偏好、事实、假设和未知项。练习把模糊差旅请求改写为结构化任务状态，并判断每个未知项应假设、澄清、查询还是阻塞。

### 3.3 工具调用与 Agent–Computer Interface

解释工具定义、模型产生调用、宿主校验执行、tool result 回填和继续决策的完整生命周期。练习为订单查询/取消设计职责单一的工具 schema、前置条件、结构化错误和反例。

### 3.4 Agent Loop 与 ReAct

解释 reasoning、action、observation 的交错机制，并明确可观察计划摘要不等于模型隐藏推理。练习手写一个带工具结果回填、done / blocked / failed 和 max turns 的最小 Agent loop。

### 3.5 规划、任务分解与重规划

比较 reactive、plan-and-execute、Plan-and-Solve、ReWOO 与搜索式方法；把计划视为可验证、可能过时的行动假设。练习对同一供应商研究任务设计三种策略并注入数据源失败。

### 3.6 失败恢复、反思与外部验证

区分传输、参数、业务、语义、权限和能力失败，按类型选择有限重试、修参、换工具、重规划、澄清或终止。Self-Refine、Reflexion 与 CRITIC 必须连同“无外部反馈的自纠错不保证改进”的反方证据一起讲。

### 3.7 上下文与工作记忆

区分 transcript、event log、working state、context、artifact、belief 和 observation。练习把二十轮轨迹压缩成事件日志、当前快照和下一轮上下文，同时保留全部硬约束与未决失败。

### 3.8 单 Agent 综合设计与面试压力测试

以只读开源仓库 issue 诊断 Agent 为 capstone，交付 task contract、状态 schema、工具 schema、控制循环和成功/失败/澄清三类轨迹。学习者必须先解释机制与边界，再说明框架如何封装这些机制。

每节课继续满足现有 `Lesson` 协议：至少两个目标、三个概念、两段实质解释、两项关键点、两步练习、明确交付物、两道可回答测验、三道关联面试题和两项完成标准。

## 4. 资源体系

资源数量控制在 24–28 项，`verifiedAt` 统一为 `2026-07-20`。优先级为：

1. 原始论文、官方接口文档和官方工程指南；
2. GitHub 官方课程、大学公开课和作者维护项目；
3. 高质量中文开源教材、Bilibili/YouTube 原作者或官方课程；
4. 博客用于综述和建立直觉；短视频平台只作补充线索。

核心资料包括 Anthropic《Building effective agents》、OpenAI《A practical guide to building agents》、Hugging Face Agents Course、Microsoft AI Agents for Beginners、Datawhale Hello-Agents、Berkeley LLM Agents MOOC，以及 ReAct、Toolformer、Plan-and-Solve、ReWOO、Tree of Thoughts、Reflexion、Self-Refine、CRITIC、AgentBench、WebArena 与 τ-bench 等论文或项目。

课程文案必须区分证据类型：

- 论文只支持其模型、数据集、提示与评价条件下的实验结论；
- 厂商文章是工程经验，不写成普适定律；
- API/协议文档证明接口语义，不证明 Agent 的可靠性；
- 课程与仓库提供学习路径和代码，不承担性能主张；
- 无法稳定核验的小红书、抖音内容不进入核心资源库，也不编造链接。

每个资源使用全局唯一 `res-agent-*` ID，至少被一节课引用；每节课至少引用两个资源。URL 必须为直接 HTTPS 页面并在开发期重新检查可访问性、标题和来源。

## 5. 面试题库

本模块提供 24 道题，每节三道，使用全局唯一 `iq-agent-*` ID。每道题继续包含：

- 三十秒短答；
- 至少两个深挖点；
- 至少一个常见误区；
- 至少一个追问；
- 频率、难度和岗位标签。

题目重点是机制还原和故障推理，包括 workflow/Agent 区分、任务契约、完成判定、工具调用生命周期、schema 设计、最小 Agent loop、ReAct 与 CoT、循环检测、规划策略、错误恢复、reflection 局限、state/memory/context 区分及模块边界。频率为基于招聘信息与公开工程面试主题的定性校准，不宣称统计学精确度。

## 6. 三个交互实验

实验均为确定性的教学模拟，不调用真实模型或第三方 API，并明确其简化边界。

### 6.1 控制循环决策台

学习者调整 `goalSatisfied`、`blocked`、已用步数和最大步数，观察控制器输出 `continue / done / blocked / budget-exhausted`。纯函数负责终止优先级，UI 展示当前状态和原因。

### 6.2 工具契约检查器

学习者选择预置工具调用，改变必填参数、枚举、额外字段和风险等级，观察 schema 校验结果、是否可执行及是否需要人类确认。模型只提出调用，宿主程序校验和执行的边界必须明确。

### 6.3 计划与重规划棋盘

学习者选择固定计划、reactive 或混合策略，并注入“数据源为空、临时超时、新约束”等 observation。实验展示继续、重试、替换步骤、重规划或阻塞的差异，不声称模拟真实模型规划能力。

纯逻辑放在新的 `src/core/agent-mechanism.js`，DOM 渲染放在新的 `src/ui/agent-experiments.js`；现有 `renderExperiment` 只负责不可变实验注册和未知实验降级，避免继续膨胀成单体文件。

## 7. 多模块数据与状态

新增 `src/data/agent-mechanism.js`，导出与 `llmFoundation` 同协议的不可变课程对象。课程、资源、测验和面试 ID 使用 `agent-*` 前缀，保证跨课程全局唯一。

`src/data/courses.js` 注册第二课程后，`src/data/modules.js` 最后才把 `agent-mechanism` 标记为 `active`。路由、dashboard、curriculum、knowledge map、resources、interviews 和 progress 必须继续通过 `courseRegistry` 工作，禁止按模块 ID 增加视图特判。

现有扁平进度结构可以容纳全局唯一 ID，汇总和进度页按当前课程 ID 集合过滤，因此本次不升级存储版本。重置仍按页面已有说明清空 Agent Learner 当前版本的全部记录。需要修复的多模块隔离是临时视图状态：资源筛选、面试筛选和展开状态应按模块分别保存或在切换模块时回到默认，不能把 LLM 模块的阶段过滤带入 Agent 模块造成空结果。本设计选择按模块保存临时筛选状态，让学习者切回原模块时恢复原筛选。

## 8. 测试与可访问性

所有行为变更遵循 RED → GREEN → REFACTOR：

- 数据测试验证第二课程八节有序、所有字段完整、双向引用、24 道题、24–28 项资源、核验日期和跨课程 ID 唯一；
- 注册表和路由测试验证两个 active/registered 模块均可导航，planned 模块仍被拒绝；
- 纯逻辑测试覆盖循环终止优先级、非法输入、工具 schema 校验和重规划决策；
- UI 测试覆盖三项实验的真实 DOM 交互、重置和无障碍 live status；
- 集成测试覆盖模块切换、课程独立进度汇总、筛选隔离、面试状态和学习进度；
- 静态测试继续禁止不安全 HTML、内联事件和通用视图中的课程硬编码。

真实浏览器验收覆盖桌面端与 320px/390px：两个模块切换、六个视图、Agent 三项实验、资源筛选、测验、面试展开/掌握/队列、进度和重置。每个路由保持一个 `h1`，键盘焦点、`aria-expanded`、live region、44px 触控目标、无横向溢出和 reduced motion 继续满足现有标准。

## 9. 完成标准

- `agent-mechanism` 在模块导航中显示为可学习，并拥有自己的 canonical hash；
- 八节课程、24–28 项核验资源、24 道面试题和三项实验完整可用；
- 论文事实、工程经验、协议事实和课程导航在资源价值文案中不混淆；
- 两模块的课程/面试进度按当前课程正确汇总，临时筛选互不污染；
- 所有自动化测试、语法检查和 `git diff --check` 通过；
- 桌面与移动浏览器真实交互通过，控制台无应用错误；
- README 更新为两个完整模块，并保留后续模块扩展契约。
