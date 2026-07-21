# 上下文、RAG 与记忆学习模块设计

## 1. 目标与既定选择

Agent Learner 的第四个完整模块为「上下文、RAG 与记忆」。本模块继续沿用前三个模块已经确认的 Paper Lab 视觉语言、原生 ES Modules、六个通用学习视图、本地独立进度、八节递进课程、精选资源、交互实验、理解测验和模块独立面试题库。用户要求所有需要选择的地方与之前保持一致并直接推进到上线，因此不引入新框架、新视觉主题或新的导航模式。

课程采用“信息生命周期 + RAG 管线”主线。学习者先区分单次 prompt context、conversation state、retrieval corpus、Harness checkpoint 和跨会话 long-term memory，再掌握上下文组装、会话压缩、文档切分与索引、稀疏/稠密/混合检索、重排与证据打包、记忆写入/召回/更新/遗忘，以及分层故障定位。完成后，学习者应能设计一个来源可追溯、预算有界、记忆有生命周期的 RAG 应用，并能准确陈述每层能够和不能够保证什么。

## 2. 规范对象与范围边界

五类对象使用固定语义：

| 对象 | 作用域 | 是否直接给模型 | 核心责任 |
| --- | --- | --- | --- |
| Prompt context | 单次模型调用 | 是 | 本轮实际可见的指令、输入、状态投影、检索证据和记忆投影 |
| Conversation state | 当前会话或任务 | 经选择后 | 保存消息、结构化事实、约束、摘要和未决项 |
| Retrieval corpus | 跨调用知识源 | 否 | 保存版本化源文档、chunk 和可检索元数据 |
| Checkpoint | 特定 run | 通常否 | 保存控制位置、事件游标与 pending effect，服务崩溃恢复 |
| Long-term memory | 跨会话且绑定主体/作用域 | 经召回后 | 保存经策略选择、可更新、可过期、可删除的信息 |

`conversation state / corpus / long-term memory` 只能经过选择、过滤和 projection 进入 prompt context；corpus 中的原始文档和 checkpoint 不会因为被持久化就自动成为模型上下文或长期记忆。

本模块完整覆盖：上下文窗口与有效上下文的区别；输入/输出预算与组装契约；transcript、canonical state、summary 和 sliding window；source document、chunk、metadata、version 和 citation span；embedding、sparse/dense/hybrid retrieval、filter、top-k、threshold、query rewrite；RRF、reranking、去重、多样性和 evidence packet；检索指标与引用边界的入门；长期记忆 admission、scope、provenance、confidence、TTL、supersession、delete 和 recall；按层诊断 stale/missing/irrelevant/conflicting evidence。

本模块只定义接口，不展开：checkpoint 存储、重放与幂等恢复；向量数据库部署、索引分片、队列、缓存和容量规划；完整离线/在线评测平台、trace、SLO、prompt injection 与合规审查；GraphRAG、多模态 RAG、agentic/self-corrective RAG；共享记忆一致性、多 Agent 和 MCP。评测内容只用于分清 retrieval 与 generation 的责任，不提前覆盖后续完整评测模块。

## 3. 八节课程

### 3.1 信息层次与上下文生命周期

建立五类对象的作用域、生命周期和 projection 关系。练习把 system instruction、当前请求、会话摘要、产品手册、检索 chunk、用户偏好与 run checkpoint 分类，并解释哪些对象可在何种策略下进入本轮 prompt context。

### 3.2 Context Engineering 与预算分配

从输出预留、必选项、优先级、每类预算、稳定排序和明确排除原因设计 context manifest。练习处理刚好装满、普通超限与 required 项自身超限，禁止静默截断硬约束，并强调更长窗口不保证更可靠地使用中间信息。

### 3.3 Conversation State、Transcript 与摘要

区分原始消息事实、当前可操作结构化状态和有损摘要。练习把含约束修改、工具失败与用户纠正的长对话压成 state、summary 和可回取 transcript 指针；最新有效值 supersede 旧值，但仍保留来源与时间关系。

### 3.4 Retrieval Corpus、Chunk 与索引

区分 source document、retrieval unit、citation unit、embedding 和 index。练习为 FAQ、产品手册与制度文档设计结构感知边界、overlap、标题继承、版本、部门/语言元数据和回源 span，并解释过小、过大和过度 overlap 的代价。

### 3.5 Sparse、Dense 与 Hybrid Retrieval

比较词法精确匹配、语义向量召回和混合检索，加入 metadata filter、threshold、top-k、query rewrite 与稳定 tie-break。练习在固定小语料上诊断“语料中不存在”“未召回”“被过滤”“排序靠后”四种不同结果。

### 3.6 Reranking、去重与证据打包

把第一阶段候选视为高召回集合，而非可直接塞入 prompt 的最终证据。练习执行 RRF/固定 rerank、版本去重、相邻片段处理、多样性选择和 token budget 打包，输出唯一 source/version/span 的 citation manifest，并明确“有引用”不等于“引用支持对应主张”。

### 3.7 长期记忆的写入、召回与遗忘

把 semantic/profile、episodic、procedural 视为应用建模标签，而不是模型内部机制保证。练习为个人助理设计 admission policy，处理显式偏好、一次性行程、敏感字段、重复写入、用户纠正、TTL、scope、删除和召回；禁止把每条聊天自动写成永久记忆。

### 3.8 RAG 与记忆综合设计及故障定位

为企业政策助理设计完整信息架构，并沿 `source → chunk → candidate → evidence packet → prompt context → answer` 诊断未摄取、旧版本、漏召、误过滤、打包丢失和错误记忆覆盖。最终交付清楚标明哪些保证属于本模块，哪些必须交给 Harness、后端和评测安全模块。

每节课继续满足现有 `Lesson` 协议：至少两个目标、三个概念、两段实质解释、每段两个关键点、两步练习、明确交付物、两道测验、三道关联面试题和两项完成标准。

## 4. 资源体系

资源数固定为 28，`verifiedAt` 统一为 `2026-07-21`。最终清单由 19 项官方/原始研究、5 项优质 GitHub/中文课程和 4 项公开课程/文档组成：

1. Anthropic：Effective context engineering for AI agents；
2. TACL：Lost in the Middle；
3. OpenAI：Compaction；
4. OpenAI：Vector embeddings；
5. EMNLP：Dense Passage Retrieval；
6. Google Research/SIGIR：Reciprocal Rank Fusion；
7. Anthropic：Introducing Contextual Retrieval；
8. OpenAI：Retrieval；
9. NeurIPS：Retrieval-Augmented Generation；
10. OpenAI：Citation Formatting；
11. EMNLP：ALCE citation generation；
12. BEIR benchmark；
13. EACL：RAGAS；
14. LangGraph：Memory overview；
15. TMLR：CoALA；
16. MemGPT；
17. AAAI：MemoryBank；
18. LongMemEval GitHub；
19. OpenAI：Data controls；
20. LangChain `rag-from-scratch` GitHub；
21. Datawhale `llm-universe`；
22. Datawhale `all-in-rag`；
23. Datawhale `hello-agents`；
24. 《上下文工程实践指南》；
25. Hugging Face Agentic RAG 课程；
26. RAGFlow 中文官方文档；
27. Datawhale Bilibili RAG 入门视频；
28. 李宏毅 2025 上下文工程 YouTube 课程。

每项资源使用全局唯一 `res-context-*` ID，至少被一课引用。文案必须说明学习价值和证据边界：论文结论绑定实验设定；官方产品文档只证明当前实现；厂商工程数字不可外推；GitHub/中文课程中的依赖版本会变化；视频仅作为直觉与学习导航。小红书、抖音和普通知乎回答因公开访问、完整引用链或长期稳定性不足，不作为核心资源；不收录营销合集、私信领取资料、无原作者搬运和无法核验的收益数字。

## 5. 面试题库

本模块提供 24 道题，每节三道，ID 为 `iq-context-01-1` 至 `iq-context-08-3`。每题包含三十秒短答、至少两个 deepDive、常见误区、追问、频率、难度和岗位标签。题目覆盖五类对象、context engineering、知识进入上下文的数据流、预算、滑窗/摘要/retrieval、长上下文边界、transcript/state/summary、纠正、chunking、版本失效、retrieval/citation unit、sparse/dense/hybrid、filter/top-k/threshold、query rewrite、reranker、去重/多样性、引用忠实性、长期记忆写入、记忆类型、冲突/过期/删除、RAG 故障诊断、RAG/fine-tuning/memory 选择和综合架构设计。频率为公开工程面试主题的定性标签，不宣称统计出现率。

## 6. 三个交互实验

实验均为确定性教学模拟，不调用真实模型、embedding、向量数据库或个人数据。

### 6.1 Five-Layer Context Router

纯函数 `assembleContext(items, inputLimit, outputReserve, policy)` 按来源层、projectionType、tokenCost、priority、required、timestamp 和 sourceRef 组装 manifest，输出 included、带原因的 excluded、剩余预算和是否不可组装。checkpoint 和原始 corpus document 默认 `not-projectable`；required 总量超限返回明确失败；证据中的“忽略系统指令”仍保持 data 身份，不提升为 instruction。

### 6.2 Hybrid Retrieval & Evidence Packing Lab

纯函数 `retrieveAndPack(corpus, query, options)` 使用固定教学词项与向量分数，应用 metadata filter、sparse/dense 融合、threshold、top-k、稳定 tie-break、去重、多样性和 token budget，返回候选 trace、filtered reasons、ranked、packed、excluded 与 citation manifest。空查询、全过滤、旧版本高分、同分、重复 chunk 和单 chunk 超预算均有确定结果。

### 6.3 Memory Lifecycle Simulator

纯函数 `applyMemoryEvent(memoryState, event, policy, now)` 和 `recallMemory(memoryState, query, now)` 处理 observe、explicit-save、correct、delete 和 advance-time，返回 `reject / store / no-op / supersede / expire / delete`、有效记录、失效原因、provenance 和本轮投影。实验覆盖重复值、冲突值、低置信度观察、显式纠正、敏感字段、TTL、跨 subject/scope 拒绝与删除后 recall。

纯逻辑放入 `src/core/context-rag-memory.js`，DOM 渲染放入 `src/ui/context-experiments.js`；`src/ui/experiments.js` 只合并不可变 renderer registry。实验可保证同输入同结果、预算守恒、稳定排序和明确原因，但不代表真实 tokenizer/embedding/BM25/reranker 质量，不保证模型遵循上下文、RAG 自动消除幻觉、真实隐私合规或外部备份物理删除。

## 7. 数据、路由与状态

新增 `src/data/context-rag-memory.js`，导出与前三课程相同协议的深度不可变对象 `contextRagMemory`。Lesson ID 为 `context-01` 至 `context-08`，资源 ID 使用 `res-context-*`，quiz 使用 `quiz-context-*`，实验 ID 使用 `context-router / hybrid-retrieval / memory-lifecycle`。`src/data/courses.js` 注册课程，`src/data/modules.js` 最后才将 `context-rag-memory` 从 planned 切换为 active。

六个视图继续完全依赖 `courseRegistry`，禁止在通用视图中增加模块 ID 分支。现有按模块隔离的筛选、面试展开与持久进度继续复用全局唯一 ID 协议，无需迁移。README 更新为四个完整模块和四个规划模块，并从 registry/catalog 派生数量和 canonical hash。

## 8. 测试、无障碍与完成标准

所有行为变更执行 RED → GREEN → REFACTOR：

- 数据测试验证 8 节、28 资源、24 面试题、16 quiz、完整字段、引用解析、核验日期、资源使用率和跨课程 ID 唯一；
- 纯逻辑测试覆盖 required 超限、not-projectable、预算边界、稳定排序、过滤/融合/打包、版本与重复、记忆 admission、scope、TTL、supersession 和 delete；
- UI 测试覆盖三项实验的真实 DOM 操作、重置、live status、label 和键盘语义；
- 集成测试覆盖第四模块六视图、canonical 路由、独立进度、资源与面试筛选；
- 静态测试继续禁止 `innerHTML`、内联事件、通用视图模块硬编码和过时 README 数量。

真实浏览器验收覆盖桌面与 320px/390px：四模块切换、第四模块六视图、三项实验、资源筛选、面试回答、测验、进度与重置。每条路由保持一个 `h1`、无横向溢出、触控目标至少 44px，live region、焦点和 reduced motion 延续现有标准。

完成时 `context-rag-memory` 拥有 canonical hash 并可学习；全部课程内容、资源、面试题与实验可用；自动化测试、语法检查和 `git diff --check` 通过；最终代码经过逐任务规格审查、质量审查和全分支审查；功能安全合并到 `main`、推送 GitHub、更新 Vercel 生产部署并在线验收。
