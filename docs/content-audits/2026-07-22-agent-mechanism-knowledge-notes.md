# Agent 机制知识笔记内容审计

## Scope 与当前发布状态

本审计覆盖 `agent-mechanism` 的 8 节课、28 份既有资源、24 道面试题和 3 个交互实验。来源正文核验与资源 evidence registry 已完成；`agent-01` 与 `agent-02` 独立知识笔记文件已达到 ready-for-integration，但尚未接入公开课程数据，`agent-03..08` 仍待写作，八课均尚未完成统一接线。

- `publicationReady: false`
- `status: in-progress`（不是 blocked；可访问核心证据和项目 registry 已具备，`agent-01..02` 待集成，`agent-03..08` 待写作）
- `brokenReferenceCount: 0`
- 本次 registry 中 28 项资源 metadata 均已重访并更新为 `2026-07-22`；回归测试同时允许已知真实核验日期 `2026-07-20` 与 `2026-07-22`，避免把所有历史记录强制伪装成同一天
- 发布门槛：每课质量分至少 85/100、所有章节 `sourceIds` 同时解析到全局 registry、lesson `resourceIds` 和有效 evidence set。

## Source policy

课程 objectives、concepts、explanations、quiz、面试题和 exercise 只定义学习覆盖，不是外部证据。官方规范与厂商正文用于接口语义和工程经验，原始论文只支持其任务、模型、数据与评测设定，课程和综述负责路线与交叉核验。视频只有在取得字幕正文或明确等价文字材料时才可支持相应范围；metadata-only 视频只能作为 `extension`，标题、简介和现有 `value` 不得被反推为机制正文。

`authority` 表示已核验的来源身份，不等于普遍正确；`role` 表示本模块实际用途。时敏 API、持续更新仓库、在线厂商材料和等价文字材料记录语义核验日。下表的 coverage 均来自本轮实际访问，limitations 明示访问、版本与迁移边界。

## 28 项来源访问表

| id | access type | 实际入口 | authority | role | coverage | limitations | 核验日 | broken |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `res-agent-anthropic-effective` | body | [Anthropic 正文的 Agents 段落](https://www.anthropic.com/engineering/building-effective-agents) | official | core | Agent/workflow 与编排模式；自治成本/工具设计；逐步环境 ground truth；阻塞时人工检查点；完成或最大迭代停止 | 厂商工程经验，非跨模型普适实验；不定义本课 task contract schema、未知项四路由或三层业务完成语义；在线内容可演进 | 2026-07-22 | 否 |
| `res-agent-openai-guide` | body | [OpenAI Business 指南正文](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)；[Developers track](https://developers.openai.com/tracks/ai-application-development) 经 OpenAI Docs MCP 交叉核验 | official | core | Agent 适用条件与 model/tools/instructions；单双编排；清晰步骤、动作、输出与缺失信息分支；run-loop 退出；工具风险、护栏、评测与人工介入 | 工程指南不是 API 规范；不定义本课精确字段、硬/软约束、四路由或三层业务完成语义；模型和实现会过时 | 2026-07-22 | 否 |
| `res-agent-berkeley-course` | body | [课程页与 syllabus](https://llmagents-learning.org/f24) | academic | extension | 推理、规划、工具、基础设施、评测、安全和多 Agent 的课程导航 | 未逐讲访问正文，不支持机制细节或性能结论 | 2026-07-22 | 否 |
| `res-agent-hf-course` | body | [GitHub 仓库](https://github.com/huggingface/agents-course)、[Unit 1](https://huggingface.co/learn/agents-course/en/unit1/introduction) | official | cross-check | Agent 基础；Think–Act–Observe；tools/actions；smolagents 路线 | main 持续更新；框架示例不证明一般可靠性 | 2026-07-22 | 否 |
| `res-agent-ms-course` | body | [GitHub 仓库](https://github.com/microsoft/ai-agents-for-beginners)、[01-intro](https://github.com/microsoft/ai-agents-for-beginners/tree/main/01-intro-to-ai-agents) | official | cross-check | Agent、环境、工具；适用/不适用；实现路线和框架入口 | 当前为 18 lessons 并转向 Agent Framework/Foundry V2；旧视频代码不可混用 | 2026-07-22 | 否 |
| `res-agent-hello-agents` | body | [chapter 1 正文](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20%E5%88%9D%E8%AF%86%E6%99%BA%E8%83%BD%E4%BD%93.md)；[chapter 7 正文](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter7/%E7%AC%AC%E4%B8%83%E7%AB%A0%20%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84Agent%E6%A1%86%E6%9E%B6.md) | community | cross-check | 环境/内部状态/行动闭环；旅行目标分解、工具补缺、用户反馈成为新约束后的修正；消息时间/metadata 与最大迭代示例 | 社区教材与旅行案例不是 task contract 标准；不定义 state/transcript/event log 三分法或三层业务完成谓词；接口版本需复核 | 2026-07-22 | 否 |
| `res-agent-dlai-agentic` | body | [课程介绍与 outline](https://www.deeplearning.ai/courses/agentic-ai) | expert | extension | reflection、tool、planning、multi-agent；eval/error analysis 与部署路线 | 未取得完整讲义或字幕，不能承担效果主张 | 2026-07-22 | 否 |
| `res-agent-lilian-weng` | body | [综述正文](https://lilianweng.github.io/posts/2023-06-23-agent/) | expert | cross-check | planning、task decomposition、ReAct、短长记忆、工具与挑战 | 2023 二手综述；实验结论须回原论文 | 2026-07-22 | 否 |
| `res-agent-lihongyi` | body | [YouTube 视频](https://www.youtube.com/watch?v=M2Yg1kwPpts)、[第三方字幕正文](https://youtube-transcript.ai/transcript/M2Yg1kwPpts.txt) | expert | core | goal–observation–action；环境反馈；工具；规划 benchmark、树搜索、world model 与过度思考边界 | 第三方繁中字幕可能有转写误差；论文、模型和 benchmark 数字不可脱离年份 | 2026-07-22 | 否 |
| `res-agent-datawhale-bili` | metadata | [Bilibili 页面](https://www.bilibili.com/video/BV17i421Y7L6/)、[view API](https://api.bilibili.com/x/web-interface/view?bvid=BV17i421Y7L6) | community | extension | 标题、作者、时长、课程 season 等导航元数据 | 字幕数组为空；严禁从标题推断正文，不支持实质机制 | 2026-07-22 | 否 |
| `res-agent-disney-planner-bili` | metadata | [Bilibili 页面](https://www.bilibili.com/video/BV1ix4y117zo/)、[view API](https://api.bilibili.com/x/web-interface/view?bvid=BV1ix4y117zo) | community | extension | 标题、作者、时长、简介等导航元数据 | 字幕为空；简介不等于讲解，比赛合作语境可能过时 | 2026-07-22 | 否 |
| `res-agent-ms-tool-video` | body | [YouTube 视频](https://www.youtube.com/watch?v=vieRiPRx-gI)、[自动字幕正文](https://youtube-transcript.ai/transcript/vieRiPRx-gI.txt) | official | cross-check | 外部工具、工具串联、最小权限、错误处理、Semantic Kernel auto/required | 字幕有三重重复；实现行为依赖版本 | 2026-07-22 | 否 |
| `res-agent-ms-plan-video` | body | [YouTube 视频](https://www.youtube.com/watch?v=kPfJ2BrBCMY)、[自动字幕正文](https://youtube-transcript.ai/transcript/kPfJ2BrBCMY.txt) | official | cross-check | 子任务分解、多 Agent 分派、结构化计划、Pydantic 校验和执行 | 字幕有噪声；旧 Chapter 7/Pydantic 示例与当前 18 课版本分离 | 2026-07-22 | 否 |
| `res-agent-react-paper` | body | [arXiv PDF](https://arxiv.org/pdf/2210.03629) | academic | core | reason–act–observe；环境反馈；ReAct/CoT/Act 对照；QA 和交互环境实验 | PaLM-540B、少量人工轨迹、受限动作空间；非通用控制器或生产安全证明 | 2026-07-22 | 否 |
| `res-agent-tot-paper` | body | [arXiv PDF](https://arxiv.org/pdf/2305.10601) | academic | core | thought 单元；候选生成和状态评价；BFS/DFS；前瞻和回溯 | 仅三个特制任务；搜索成本高且依赖分解和评价器 | 2026-07-22 | 否 |
| `res-agent-plan-solve` | body | [arXiv PDF](https://arxiv.org/pdf/2305.04091) | academic | core | 先规划后求解；子任务；PS/PS+；错误分类 | 静态推理提示，不含环境、工具或动态重规划 | 2026-07-22 | 否 |
| `res-agent-rewoo` | body | [arXiv PDF](https://arxiv.org/pdf/2305.18323) | academic | core | Planner–Worker–Solver；证据占位符；推理/观察解耦；token 效率与工具失败 | 固定蓝图降低在线适应性，不适合强观察依赖 | 2026-07-22 | 否 |
| `res-agent-toolformer` | body | [arXiv PDF](https://arxiv.org/pdf/2302.04761) | academic | cross-check | 自监督 API 标注；调用时机和参数；结果并入生成；五类工具实验 | 不支持工具链、交互修订、权限和副作用；不等于生产 function calling | 2026-07-22 | 否 |
| `res-agent-openai-function` | body | [OpenAI 官方 Docs](https://developers.openai.com/api/docs/guides/function-calling) | official | core | 五步生命周期；JSON Schema；call_id 与 function_call_output；多调用、strict、工具建议 | 含 GPT-5.6、Responses、GPT-5.4+ tool_search 等强时效语义；结构化不保证参数或业务动作正确 | 2026-07-22 | 否 |
| `res-agent-anthropic-tools` | body | [Anthropic 正文](https://www.anthropic.com/engineering/writing-tools-for-agents) | official | core | 工具契约；少而高信号；命名、描述、schema；返回上下文、token 与 eval 迭代 | 2025-09-11 厂商经验；依赖模型与任务，在线标题有轻微变化 | 2026-07-22 | 否 |
| `res-agent-coala` | body | [arXiv PDF](https://arxiv.org/pdf/2309.02427) 与 [完整 HTML](https://arxiv.org/html/2309.02427) 的 4.1、4.2、4.6 节 | academic | core | 跨调用工作记忆中的当前感知/目标/中间信息；情景/语义/程序记忆；环境反馈写回；提议、评价、选择、执行、观察循环 | 概念架构与综述，无新增 benchmark；不规定生产 state schema、三类记录职责、task contract 或业务完成谓词 | 2026-07-22 | 否 |
| `res-agent-reflexion` | body | [arXiv PDF](https://arxiv.org/pdf/2303.11366) | academic | core | Actor–Evaluator–Reflection；语言反馈；情景记忆；跨 trial 改进 | 依赖环境信号、启发式/LLM 评价和多次尝试，部分任务使用单测 | 2026-07-22 | 否 |
| `res-agent-self-refine` | body | [arXiv PDF](https://arxiv.org/pdf/2303.17651) | academic | cross-check | 同模型生成、反馈、修订；迭代停止；可操作反馈；七类任务 | 依赖任务化提示和评价标准，多为输出编辑，不等于可靠推理纠错 | 2026-07-22 | 否 |
| `res-agent-no-self-correct` | body | [arXiv PDF](https://arxiv.org/pdf/2310.01798) | academic | core | 内在自修正；无外部反馈退化；oracle 对照；等成本与提示公平 | 仅研究推理正确性，不外推所有风格、偏好或安全任务 | 2026-07-22 | 否 |
| `res-agent-critic` | body | [arXiv PDF](https://arxiv.org/pdf/2305.11738) | academic | core | 工具验证；外部 critique；verify–correct；搜索、代码、计算器、毒性 API | 工具可能错误、有偏、有延迟及隐私安全风险；效果依赖提示 | 2026-07-22 | 否 |
| `res-agent-agentbench` | equivalent | [arXiv 完整 HTML](https://arxiv.org/html/2308.03688) | academic | core | 八类环境；29 模型；完成格式、动作、超时、终止；重复与长程规划失败 | 简化提示；不测搜索、反思和多次尝试；环境/模型版本时效 | 2026-07-22 | 否 |
| `res-agent-tau-bench` | body | [arXiv PDF](https://arxiv.org/pdf/2406.12045) | academic | core | agent–tool–user 动态交互；数据库终态；领域政策；pass^k | 模拟用户、两个简化领域、唯一数据库结果假设；不代表真实单次服务 | 2026-07-22 | 否 |
| `res-agent-douyin-claude-code` | equivalent | [原视频](https://www.douyin.com/video/7529703060969508130)、[明确源自视频的修订文字版](https://hicsc.com/how-to-build-agent/) | community | extension | 间接材料中的 LLM 工具编排、ReAct、Plan-and-Execute/replan、状态与 LangGraph 示例 | 原视频防自动化且无字幕；文字版为间接修订材料，GPT-4o/Cursor/Manus/LangGraph 属 2025 语境 | 2026-07-22 | 否 |

## URL、版本与字幕限制

- 本轮 28 个 registry URL 均可解析，`brokenReferenceCount: 0`；实际正文入口可能是同一来源的 PDF、完整 HTML、课程子页、字幕或等价文字版，已逐项列在上表。
- 两条 Bilibili 资源仅取得 metadata，字幕数组为空；它们只可用于资源导航，不能被章节 `sourceIds` 用来证明 Agent 机制。
- 李宏毅和 Microsoft 两条 YouTube 使用第三方/自动字幕，分别保留转写与重复噪声限制。抖音原视频没有可访问字幕，只能把明确源自该视频的文字版作为间接 extension。
- Berkeley 与 DeepLearning.AI 只访问课程页或 syllabus/outline；课程字段不等于逐讲正文。Microsoft 课程核验时已为 18 课，旧视频示例不得和当前仓库语义混用。
- OpenAI function calling 为强时敏官方语义，`evidence.verifiedAt` 固定记录本轮核验日；结构化工具调用仍只是动作提案，不保证业务参数、权限、副作用或执行结果正确。

## `agent-02` 四来源重新访问与课程综合边界

2026-07-22 在规格复审后重新访问了本课全部四个正文，而不是复用 registry 的 `value` 或课程解释：OpenAI Business 指南读取了 Configuring instructions、单 Agent run、Guardrails 与 Plan for human intervention，并按 OpenAI Docs Skill 通过官方 Developers track 交叉核验 instructions/tools/guardrails、上下文/记忆和 eval/guardrail 边界；Anthropic 读取了 Agents 段落中逐步环境 ground truth、人工检查点、阻塞和最大迭代停止；Hello-Agents 读取 chapter 1 的旅行目标分解、工具补缺、反馈变约束与动态修正，以及 chapter 7 的消息时间/metadata、历史和最大工具迭代示例；CoALA 同时读取 arXiv PDF 与完整 HTML 的 4.1、4.2、4.6 节，确认跨调用工作记忆、环境反馈和决策循环。

上述材料共同支撑“指令要清晰、缺失信息要显式处理、环境反馈应进入后续决策、当前信息需跨调用保存、运行需有停止与人工介入”的一般机制，但没有任何一份把本课的精确结构定义为标准。因此 `task contract` 的字段清单、硬约束/软偏好二分、查询/澄清/可撤销假设/blocked 四路由、state/transcript/event log 三分职责，以及 submitted/action-succeeded/business-goal-achieved 三层验收，均被正文明确标为本课程为了把一般机制落成可审查设计而采用的工程工作模型。它们属于透明的 `course synthesis`，不得反向写入四张 evidence card，亦不得声称由四份来源共同提出。

本课没有 publication blocker：一般机制、风险边界、状态与环境反馈均有可访问正文，精确课程结构被清楚标为综合推导而非外部事实；coverage gap 为“尚无单一来源定义完整工程检查表”，已通过限制声明而不是伪造来源处理。若未来要把该检查表宣称为行业标准，必须补充对应规范；当前发布只把它作为可审查课程产出。

## 论文冲突与互补

Reflection 的正反证据必须按反馈条件分开：`res-agent-reflexion` 的闭环实际使用环境、评价器或测试信号并允许跨 trial 记忆；`res-agent-no-self-correct` 检验的是没有外部反馈时的内在自修正，发现部分推理设置会退化，因此两者并不直接矛盾。`res-agent-self-refine` 支持有明确评价维度的生成/编辑迭代，不能被扩大成任意推理自纠错；`res-agent-critic` 则说明在其特定任务中引入可查询工具的外部 critique 能提供不同于自评的证据，但工具自身仍可能错误或有偏。

规划材料形成条件化谱系：Plan-and-Solve 是低成本线性预规划，ReWOO 先形成蓝图后收集证据，ReAct 每轮吸收观察，Tree of Thoughts 显式生成、评价、搜索和回溯。课程必须根据观察依赖、分支数、延迟、搜索成本与错误代价选择，而不能把任一论文结果写成普适排名。

## 逐课 coverage matrix 骨架

以下矩阵由 Task 3–10 的单课作者按“courseFieldBasis → 教学章节 → resource evidence → 验收产出”逐项填充。目前 evidence set 已就绪；`agent-01` 与 `agent-02` 的独立章节、覆盖与评分已经完成但尚未接线，`agent-03..08` 的章节仍不存在，因此这些课程不提前声称覆盖或评分。

| lesson | objectives / concepts | quiz | interview | exercise / completion | section mapping | evidence mapping | 质量分 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-01` | objectives[0..1] 与 concepts[0..4] → `control-authority-spectrum`、`minimal-action-loop`、`action-space-and-environment`、`termination-evidence` | quiz[0] → `control-authority-spectrum`；quiz[1] → `minimal-action-loop`、`termination-evidence` | `iq-agent-01-1` short/deepDive/followUp → `control-authority-spectrum`；`iq-agent-01-2` 全字段 → `selection-thresholds`；`iq-agent-01-3` 全字段 → `minimal-action-loop`、`action-space-and-environment`、`termination-evidence` | exercise.steps[0..1]、deliverable → `three-case-decision-table`；completionCriteria[0] → 第 1/5/6 节，completionCriteria[1] → 第 2/3/4/6 节 | 六节按控制权连续谱→最小闭环→动作与环境→终止证据→选型门槛→三案例表递进；产出固定摘要/审批流/开放调查分别为普通调用/Workflow/Agent，并含 done、blocked、budget、handoff | 核心 `res-agent-anthropic-effective`、`res-agent-openai-guide`；闭环交叉核验 `res-agent-hf-course`、`res-agent-ms-course`、`res-agent-hello-agents`、`res-agent-lihongyi`；未使用 metadata-only `res-agent-datawhale-bili`，也未把课程目录 `res-agent-berkeley-course` 或 outline-only `res-agent-dlai-agentic` 用作机制主张 | 94（25/20/24/16/9） | ready-for-integration |
| `agent-02` | objectives[0..1] 与 concepts[0..4] → `request-to-task-contract`、`constraints-and-preferences`、`facts-assumptions-unknowns`、`state-transcript-event-log`、`completion-predicates-evidence` | quiz[0] → `facts-assumptions-unknowns`、`shanghai-travel-contract`；quiz[1] → `completion-predicates-evidence` | `iq-agent-02-1` short/deepDive/followUp → 第 1/2/3/6 节；`iq-agent-02-2` 全字段 → 第 5/6 节；`iq-agent-02-3` 全字段 → 第 3/4 节 | exercise.steps[0..1] 与 deliverable → `shanghai-travel-contract`；completionCriteria[0] → 第 1/2/3/5/6 节，completionCriteria[1] → 第 3/4 节 | 六节按请求→契约、约束、认识状态、运行状态、完成证据、差旅交付递进；上海案例明确目标、硬约束、软偏好、事实、假设、七个未知项及查询/澄清/临时假设/blocked 策略，并区分 submitted/action-succeeded/business-goal-achieved | OpenAI 支撑清晰指令、缺失信息分支、退出与高风险人工介入；Anthropic 支撑环境 ground truth、阻塞检查点和停止；CoALA 支撑跨调用工作记忆、反馈与决策循环；Hello-Agents 交叉核验旅行目标分解、工具补缺和反馈修正。精确字段、四路由、三类记录与三层验收全部标为 `course synthesis` | 94（25/20/22/18/9） | ready-for-integration |
| `agent-03` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-03-1..3` | 待映射工具 schema 与五类实验 | 待 Task 5 填写 | 待 Task 5 绑定 | — | pending |
| `agent-04` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-04-1..3` | 待映射 loop 轨迹与退出 | 待 Task 6 填写 | 待 Task 6 绑定 | — | pending |
| `agent-05` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-05-1..3` | 待映射计划/重规划实验 | 待 Task 7 填写 | 待 Task 7 绑定 | — | pending |
| `agent-06` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-06-1..3` | 待映射失败恢复表 | 待 Task 8 填写 | 待 Task 8 绑定 | — | pending |
| `agent-07` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-07-1..3` | 待映射状态/日志/context 设计 | 待 Task 9 填写 | 待 Task 9 绑定 | — | pending |
| `agent-08` | 待逐项映射 | 待映射 2 题推理 | 待映射 `iq-agent-08-1..3` | 待映射综合状态机与三类轨迹 | 待 Task 10 填写 | 待 Task 10 绑定 | — | pending |

## 当前测试审计

`tests.status: failed`，原因是当前公开课程数据与聚合入口仍未接入八课 `knowledgeNote`：`agent-01` 与 `agent-02` 已有通过单课 probe 的独立文件，但尚未接入，`agent-03..08` 尚未完成。evidence 与引用测试已通过，集成 RED 没有被改写为 `not applicable`。

| command | exit code | result |
| --- | ---: | --- |
| `node --test --test-name-pattern="resources\|evidence\|references" tests/agent-mechanism-data.test.js` | 0 | 3 项命中测试通过，9 项因名称不匹配跳过；资源数量、28 张 evidence 卡、双向引用和日期均通过；日期需真实、不晚于审计日且属于 `2026-07-20`/`2026-07-22` 允许集合，当前 registry 实值均为本轮重访的 `2026-07-22` |
| `node --test tests/agent-mechanism-data.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js` | 1 | 共 58 项，53 通过、5 个预期 RED：公开课程数据仍缺八课 `knowledgeNote` 接线、聚合 registry/冻结、Agent UI 笔记和 README 发布声明；`agent-01` 与 `agent-02` 独立文件已完成但不改变上述集成状态 |
| `node --check src/data/agent-mechanism.js` | 0 | 语法通过 |
| `node --check tests/agent-mechanism-data.test.js` | 0 | 语法通过 |
| `node --check src/data/agent-mechanism-notes/agent-02.js` | 0 | `agent-02` 独立笔记语法通过 |
| `git diff --check` | 0 | 本轮 `agent-02`、四张 evidence card 与审计差异无空白错误 |
| 下方“`agent-02` 可复制 contract/source/freeze probe”完整 one-liner | 0 | 29 分钟；6 节；测试口径（introduction + paragraphs + nextStep）正文 3898 字符；每节 3–4 段、每段最短 146 字符、至少 2 个要点；5 个误区、8 个 recap；所有嵌套值冻结；4 个来源均通过全局 registry、lesson resourceIds 和 evidence set 三重解析，`brokenReferenceCount: 0` |

### `agent-02` 可复制 contract/source/freeze probe

以下命令不是注释或占位符；它实际导入 `agent02Note` 与公开课程 registry，断言阅读量、测试口径长度、六节结构、段落与要点、误区、recap、深层冻结和 source 三重解析，并输出本轮记录的摘要：

```bash
node --input-type=module -e 'import assert from "node:assert/strict"; const [{agent02Note:n},{agentMechanism:c}]=await Promise.all([import("./src/data/agent-mechanism-notes/agent-02.js"),import("./src/data/agent-mechanism.js")]); const lesson=c.lessons.find(({id})=>id==="agent-02"); const globalIds=new Set(c.resources.map(({id})=>id)); const evidenceIds=new Set(c.resources.filter(({evidence})=>evidence).map(({id})=>id)); const body=[n.introduction,...n.sections.flatMap(({paragraphs})=>paragraphs),n.nextStep].reduce((sum,value)=>sum+value.trim().length,0); const deepFrozen=(value)=>{if(value&&typeof value==="object"){assert.equal(Object.isFrozen(value),true); Object.values(value).forEach(deepFrozen)}}; assert.equal(n.readingMinutes,29); assert.equal(n.sections.length,6); assert.ok(body>=3600); assert.ok(n.sections.every(({id,paragraphs,keyPoints,sourceIds})=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)&&paragraphs.length>=2&&paragraphs.length<=4&&paragraphs.every((p)=>p.trim().length>=60)&&keyPoints.length>=2&&sourceIds.every((sourceId)=>globalIds.has(sourceId)&&lesson.resourceIds.includes(sourceId)&&evidenceIds.has(sourceId)))); assert.ok(n.misconceptions.length>=4&&n.misconceptions.length<=6); assert.ok(n.recap.length>=5); deepFrozen(n); console.log(JSON.stringify({body,sections:n.sections.length,minParagraph:Math.min(...n.sections.flatMap(({paragraphs})=>paragraphs.map((p)=>p.trim().length))),sources:[...new Set(n.sections.flatMap(({sourceIds})=>sourceIds))],brokenReferenceCount:0,deepFrozen:true}))'
```

本轮输出：`{"body":3898,"sections":6,"minParagraph":146,"sources":["res-agent-openai-guide","res-agent-anthropic-effective","res-agent-hello-agents","res-agent-coala"],"brokenReferenceCount":0,"deepFrozen":true}`。

当前没有把 metadata-only 材料当作机制 evidence，也没有把 extension 升级为 core。最终测试状态、coverage、评分和 `publicationReady` 必须在八篇笔记接线、完整自动化与浏览器验收完成后重写，不能沿用本阶段的中间结果。

### `agent-01` 单课质量与可追溯性

- `courseFieldBasis`：`lesson.objectives[0..1]`、`lesson.concepts[0..4]`、`lesson.explanations[0..1]`、`lesson.quiz[0..1]`、`iq-agent-01-1..3` 的 `shortAnswer`、全部 `deepDive` 与 `followUps`、`lesson.exercise.steps[0..1]`、`lesson.exercise.deliverable`、`lesson.completionCriteria[0..1]` 均已进入上表所列实质章节；这些路径只定义覆盖，不被伪装成来源 ID。
- `sections → evidence → 产出`：第 1/5 节用 Anthropic 与 OpenAI 厂商正文支撑控制权和适用门槛，并明确其工程经验不构成跨任务定律；第 2/3/4 节以 OpenAI、Hugging Face、Microsoft、Hello-Agents 与李宏毅字幕正文交叉说明闭环、环境和退出，始终区分模型决策与宿主执行；第 6 节把相同标准应用到三案例选型表。两条 Bilibili metadata-only 资源没有出现在任何 `sourceIds` 中。
- `质量自评`：覆盖 25/25（两个 objectives、五 concepts、两题 quiz 推理、三题面试全字段、exercise 两步与 deliverable、两个完成标准均可追踪）；结构 20/20（六节按依赖递进并连接 agent-02）；来源 24/25（ID 全部属于本课 registry 与 evidence set，厂商/字幕/课程边界已显式保留）；教学 16/20（固定三案例完整走查，但尚待集成后的真实页面可读性验收）；数据契约 9/10（纯数据、稳定 ID、无 HTML，最终递归冻结由聚合入口与集成测试共同验收）。总分 `94/100`，`brokenReferenceCount: 0`，coverage gap：无；状态 `ready-for-integration`，全模块仍为 `publicationReady: false`。

### `agent-02` 单课质量与可追溯性

- `courseFieldBasis`：`lesson.objectives[0..1]`、`lesson.concepts[0..4]`、`lesson.explanations[0..1]`、`lesson.quiz[0..1]`、`iq-agent-02-1..3` 的 `shortAnswer`、全部 `deepDive`、`misconceptions` 与 `followUps`、`lesson.exercise.steps[0..1]`、`lesson.exercise.deliverable`、`lesson.completionCriteria[0..1]` 均映射到上表所列六节；这些字段只规定覆盖与验收，不进入 `sourceIds` 或 evidence map。
- `sections → evidence → 产出`：第 1/2/5/6 节只用 OpenAI 支撑清晰步骤、缺失信息分支、run 退出、工具风险与人工介入，用 Anthropic 支撑环境 ground truth、阻塞检查点和停止；第 3/4/6 节只用 Hello-Agents 交叉核验旅行目标分解、工具补缺和反馈修正，用 CoALA 解释跨调用工作记忆、环境反馈与决策循环。正文明确说明四份来源都没有定义完整 task contract；最终上海差旅字段、四路由、三类记录和三层验收是课程综合出的可审查交付物。
- `完成语义`：正文明确区分 state、transcript 与 event log，区分事实、假设与 observation，关键状态带来源、时间或版本；完成检查依次区分“动作已提交、动作成功、业务目标达成”，异步 queued/pending/processing 均保持 waiting 或 in-progress，并依赖工具终态、产物校验或测试证据，而不采信模型自述。
- `质量自评`：覆盖 25/25（两个 objectives、五 concepts、两题 quiz 推理、三题面试 short/deepDive/misconception/follow-up、exercise 全步骤与 deliverable、两个完成标准均可追踪）；结构 20/20（六节严格按任务定义到案例交付递进并承接 agent-01、连接 agent-03）；来源 22/25（四份正文重新实际访问且 ID 三重解析，精确课程结构均标注为综合推导；扣分项是没有单一外部规范定义完整检查表）；教学 18/20（上海案例给出七个未知项的逐项策略与三层完成证据，仍待集成后的真实页面验收）；数据契约 9/10（纯数据、稳定 kebab-case ID、无 HTML、全部嵌套值已冻结，最终对象身份由聚合测试验收）。总分 `94/100`，`brokenReferenceCount: 0`；coverage gap：没有阻塞性缺口，限制为“完整 schema 仅作为 course synthesis 而非外部标准”；状态 `ready-for-integration`，全模块仍为 `publicationReady: false`。
