# 上下文、RAG 与记忆知识笔记完善设计

## 1. Baseline

- Repository/branch/worktree：`Agent-learner/agent-development-knowledge-map`，当前在主工作区 `main`，基线提交为 `b1808be581fe29185da216bf4ae7cc44c3376849`，开始审计时与 `origin/main` 同步且工作区干净。
- Current tests：`npm test` 在基线提交上得到 1,542 项通过、0 项失败。本次工作不得用删除或弱化既有断言的方式换取通过。
- Active/planned dependencies：`context-rag-memory` 已经是 `active`，拥有八课、28 项资源、24 道面试题、16 道测验和 `context-router`、`hybrid-retrieval`、`memory-lifecycle` 三个确定性实验；不存在待注册的新模块依赖。
- Existing contracts that must not regress：原生 ES Modules、深度冻结数据、全局唯一 ID、六个通用学习视图、按模块隔离的进度与筛选状态、三个实验的纯逻辑/DOM 分层、canonical hash 路由、320px/390px 响应式与既有无障碍契约。
- Current deployment provider：只使用 Vercel。GitHub Pages 已关闭，完成时仍须证明 Pages 未恢复。
- Baseline defect：八课目前只使用 `explanations` 回退，没有 `knowledgeNote`；28 项资源没有与前三模块一致的结构化 evidence cards；README 仍明确把第四模块列为未提供长文知识笔记。

## 2. Learner contract

- Entry capability：学习者已理解 LLM 基础、Agent loop 与 Agent Harness，能阅读基本的 prompt、状态、工具调用和运行日志，但尚不能系统地区分上下文、会话状态、检索语料、checkpoint 与长期记忆。
- Terminal capability：完成八课后，学习者能设计一个来源可追溯、输入预算有界、检索阶段可诊断、引用可核对、记忆有完整生命周期的 Agent 信息系统；遇到错误回答时，能沿 `source → chunk → candidate → evidence packet → prompt context → answer` 定位故障层，而不是只调大窗口或 top-k。
- Observable capstone：为企业政策助理交付一张分层架构图、一份 context manifest、一份 retrieval trace、一个 citation manifest、一份 memory lifecycle policy 和一棵带可观察证据的故障树，并能指出每项保证由模型、课程算法、宿主系统或后续评测模块中的哪一层负责。
- Prerequisites：模块 1 的 token/上下文窗口、结构化输出和证据边界；模块 2 的 Agent 状态/动作循环；模块 3 的 checkpoint、权限、预算、恢复与审计边界。
- In scope：五类信息对象及 projection；上下文预算与压缩；transcript/state/summary；版本化 corpus、chunk、embedding、index 和 citation span；sparse/dense/hybrid retrieval；filter、threshold、top-k、query rewrite；rank fusion、reranking、去重、多样性和证据打包；长期记忆的 admission、scope、provenance、supersession、TTL、delete 与 recall；引用与生成忠实性的分层评价；综合故障定位。
- Out of scope / next-module handoffs：真实向量数据库部署和容量规划；完整离线/在线评测平台与 SLO；prompt injection、数据合规和安全红队；GraphRAG、多模态 RAG、自校正 RAG；跨 Agent 共享记忆一致性；参数化模型遗忘。笔记可以指出这些接口，但不能把它们伪装成本模块已经实现的能力。
- Time-sensitive versions：OpenAI、Anthropic、LangChain、Hugging Face、RAGFlow 和 GitHub 教程均按 2026-07-23 的可见正文核验；其产品参数、模型名、默认值和 API 形态只能描述为当前实现，并记录 `verifiedAt`。论文结论绑定正式版本、任务、语料和指标。

## 3. Research audit

- Research streams and ownership：主代理负责课程基线、OpenAI 官方文档和最终证据裁决；并行只读流分别核验 11 项学术原文、6 项非 OpenAI 官方/维护者资料、6 项中文/视频弱来源。所有流只提供线索，最终纳入规则由主代理统一裁决。
- Candidate/evidence ledger location：本规格记录研究门结论；实现后每项资源的可展示裁决写入 `context-rag-memory.js` 的 `evidence`，每个知识章节通过 `sourceIds` 连接本课 evidence set。原始论文版本、fallback URL 与访问失败写入相应资源的 coverage/limitations，而不建立脱离产品数据的第二套运行时来源注册表。
- Access failures and conflicts：ACM 的 RRF 正文返回 403，改用作者正式稿核验；BEIR、CoALA 的 OpenReview 页面触发验证，使用正式 arXiv/TMLR 版本交叉；当前 RAGFlow URL `ragflow.com.cn/docs` 页面自述为非官方，必须迁移到 `ragflow.io` 官方固定版本；Bilibili 字幕列表为空，只能核验元数据；YouTube 可见自动字幕轨但未稳定取得正文，不能承担机制主张。
- Central claims and evidence gaps：Lost in the Middle 支持位置敏感性而不支持“所有模型固定 U 型”；DPR 支持其开放域 QA 设置中的 dense retrieval 而不支持 dense 全局优于 sparse；RRF 是 rank fusion 而不是 cross-encoder reranker；ALCE 支持 citation precision/recall 分解而不支持“有引用即正确”；RAGAS 指标依赖 evaluator；CoALA 是 taxonomy，不是生产效果实验；MemGPT 的 unbounded context 是系统抽象而非无损保证；MemoryBank 的遗忘机制是场景化启发式；LongMemEval 是受控 benchmark，不代表真实用户分布。
- Engineering-only claims：课程五层对象模型、context manifest、预算守恒、required-overflow、canonical state/supersession、版本失效、citation span contract、去重/多样性策略、记忆同意/删除/租户隔离和统一故障树保留为“课程采用的工程约束”，不能归因于单篇论文或厂商文档。
- Weak-source decision：`llm-universe`、`all-in-rag`、`hello-agents` 保留为 community/cross-check；Practical Guide 降为 community/extension；Bilibili 为 metadata-only extension；YouTube 为 expert/extension。后二者不得出现在核心机制章节的 `sourceIds` 中。
- Research gate decision：通过。现有八课依赖链合理；需要修复来源治理、补一项真正的 passage reranking 原始研究，并在所有知识笔记中显式写出证据边界。没有证据要求重构课程顺序或删除现有实验。

## 4. Curriculum rationale

- Dependency graph：`信息对象与生命周期 → 上下文组装/预算 → 会话状态与压缩 → corpus/chunk/index → sparse/dense/hybrid 候选生成 → rerank/去重/证据包 → 长期记忆生命周期 → 综合架构与分层诊断`。第 1–3 课解决“信息在哪里、怎样进入本轮”，第 4–6 课解决“外部知识如何成为可引用证据”，第 7 课解决“跨会话信息怎样受治理”，第 8 课把三条路径汇合。
- Lesson count and complexity rationale：保持八课，不拆分也不合并。每课由 `$build-learning-module-notes` 生成独立的 5–7 节递进长文；阅读时长按复杂度在 30–45 分钟浮动，正文目标 4,200–9,000 个非空字符。第 6–8 课因证据验证、记忆治理和综合诊断复杂度较高，允许位于区间上沿。
- Lesson outcomes/exercises/assessments：保留现有目标、练习、16 道测验、24 道面试题和 completion criteria；知识笔记必须把这些 assessed outcomes 讲透，并包含能直接产出既有 exercise deliverable 的完整案例。知识笔记不是把 `explanations` 机械扩写，而是围绕可观察决策和失败路径重新组织。
- Resource count rationale：现有 28 项资源全部保留，修正标题、canonical URL 和角色；新增一项 passage reranking 原始研究以区分 RRF rank fusion 与真正 reranking，最终 29 项。去重与多样性作为课程工程策略解释，不用来源不足的“普遍增益”数字装饰。
- Experiment decisions and simulation boundaries：三个实验全部保留且不新增真实 API。它们只证明课程纯函数在固定输入下的分类、预算、排序、过滤、记忆状态转换与原因码，不模拟真实 tokenizer、embedding、BM25、cross-encoder、向量库、模型忠实性、数据合规或物理删除。
- Interview coverage rationale：现有每课三题覆盖定义、权衡和系统设计，内容范围与终局能力一致；本次只在知识笔记中提供可推导的回答材料，不改变题库规模。

## 5. Coverage and evidence

| 课节 | Outcome → assessment/exercise | 知识笔记必须覆盖 | 核心/交叉证据 | 必须显式写出的边界 |
| --- | --- | --- | --- | --- |
| `context-01` | 分类信息对象并解释 projection | 窗口、有效上下文、五类对象、生命周期、manifest | Lost in the Middle；Anthropic context engineering；CoALA/MemGPT 交叉 | 五层是课程模型；checkpoint 不等于 memory；长窗口不保证稳定利用 |
| `context-02` | 产出预算守恒的 context manifest | 输入/输出预算、required、priority、stable order、compaction | Anthropic；Lost in the Middle；OpenAI compaction | 产品 compaction 是不透明实现；required-overflow 是课程契约，不是论文结论 |
| `context-03` | 产出 state、summary 和 source map | transcript、canonical state、有损摘要、滑窗、纠正、supersession | OpenAI compaction/data；LangChain memory；CoALA | summary 不是源事实；canonical state/supersession 是应用状态模型 |
| `context-04` | 设计 chunk schema 与版本失效流程 | source/retrieval/citation unit、结构切分、embedding、index、span | DPR；原始 RAG；OpenAI embeddings/retrieval；rag-from-scratch | 固定 chunk 大小与 embedding 参数不可外推；index 不是 corpus |
| `context-05` | 产出可回放 retrieval trace | sparse/dense/hybrid、RRF、filter、threshold、top-k、rewrite | DPR；RRF；BEIR；Anthropic/OpenAI retrieval | dense 不总胜；RRF 参数不普适；过滤和阈值须用自有数据评测 |
| `context-06` | 产出 evidence packet 与 claim-citation 表 | candidate/reranker 区分、去重、多样性、预算、citation precision/recall | 新增 BERT reranking；Anthropic contextual retrieval；ALCE；RAGAS；OpenAI citations | RRF 不是 reranker；引用存在不等于蕴含、完整或事实为真 |
| `context-07` | 产出 admission policy 与 memory event log | semantic/episodic/procedural、准入、scope、provenance、TTL、纠正、delete/recall | CoALA；MemGPT；MemoryBank；LongMemEval；OpenAI data | 类型是应用标签；删除、同意和隔离是系统治理契约，论文没有替系统证明 |
| `context-08` | 产出综合图、故障树和验收清单 | 分层接口、RAG/memory/fine-tuning 选择、source-to-answer trace、指标边界 | RAGAS；ALCE；LongMemEval；官方/社区实作交叉 | 没有单一来源证明完整故障树；端到端通过必须由分层测试与真实评测建立 |

- Knowledge-note production plan using `$build-learning-module-notes`：创建 `src/data/context-rag-memory-notes/context-01.js` 至 `context-08.js`，每课均包含 `readingMinutes`、`introduction`、5–7 个 `sections`、4–6 个 `misconceptions`、`recap` 和 `nextStep`。每节 section 含 2–4 段、至少两个 key points、可选 callout 和至少一个本课 evidence source；最终由深度冻结 aggregator 按八个 lesson ID 注册。
- Source use rule：`sourceIds` 必须存在于全局资源、属于当前 lesson.resourceIds、具有 evidence，且不能仅由 extension 或 metadata-only 视频承担一个核心章节。产品默认值、模型名、价格、窗口大小和 API 形态必须带时间边界；研究数字必须同时写任务、指标或实验条件。
- Blocked claims or lessons：没有整课阻塞。来源无法支持的治理规则可以作为课程工程规范发布，但正文必须说明它的 owner、可验证不变量与未覆盖保证，不得用“最佳实践”替代证据。

## 6. Architecture and ownership

- Data/note/core/UI/registry files：新增 `src/data/context-rag-memory-notes/context-01.js` 至 `context-08.js` 和 `src/data/context-rag-memory-notes.js`；修改 `src/data/context-rag-memory.js` 以加入 `evidenceByResourceId`、修正/新增资源并将八个 `knowledgeNote` 连接一次；按 RED 需要修改 `tests/context-rag-memory-data.test.js`、`tests/data.test.js`、`tests/guided-ui.test.js`、`tests/static-app.test.js` 与 README。三个 core 实验和 UI renderer 默认不改，只有回归测试暴露真实契约缺陷时才做最小修复。
- Stable ID prefixes：课程/课节/资源继续使用 `context-rag-memory`、`context-01..08`、`res-context-*`；新增 reranker 来源使用 `res-context-bert-reranker`。不重命名既有 lesson、quiz、interview 或 experiment ID，避免进度迁移。
- Shared-file integration owner：主代理独占 `context-rag-memory.js`、aggregator、README、跨模块测试和最终集成；子代理一次只创作指定课节文件，不同时编辑共享注册表。
- Author → specification review → quality review assignments：每个可独立任务遵循同一作者先实现、独立规格审查、作者修复、独立质量审查、作者再修复的顺序。审查代理不直接改作者文件。共享集成由主代理完成并接受最终全分支审查。
- Cross-module state and compatibility risks：`tests/data.test.js` 当前明确断言第四模块没有 `knowledgeNote`，必须先在 RED 阶段把过时契约替换为完整正向契约；通用 UI 已能渲染知识笔记和 evidence card，不增加模块 ID 分支；所有公开对象深度冻结，防止跨模块引用污染。

## 7. TDD and verification

- RED contract tests：先写失败测试，要求八个唯一知识笔记、完整 note schema、按课复杂度浮动的时长/长度、章节来源闭包、29 项完整 evidence cards、时敏来源 `verifiedAt=2026-07-23`、弱来源降级、RAGFlow 官方 URL、RRF/reranker 语义边界、所有资源至少被一课使用、公开对象深度冻结。RED 失败原因必须是缺少新能力，而不是语法或 fixture 错误。
- Targeted test groups：`node --test tests/context-rag-memory-data.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js`；若共享数据影响 registry/catalog，再加模块、课程和 UI 交互相关测试。
- Full regression command：`npm test`，随后对所有变更 JS 执行 `node --check`，并执行 `git diff --check`。最终通过数以当时仓库实际测试数为准，不能预写固定成功数字。
- Browser viewport/route/interaction matrix：本地与公开环境均验证模块首页、`context-01`、`context-04`、`context-08`；桌面和 390px，关键布局再用 320px；检查目录跳转、来源链接、资源 evidence card、上一课/下一课、测验、三个实验操作与重置、进度持久化和模块切换隔离。
- Accessibility and console checks：每路由单一 `h1`，目录 button 可键盘操作，来源链接有明确文本，live region 不回归，触控目标不小于既有 44px 契约，无横向溢出、无 console error、无失败网络请求影响主内容。
- Evidence review：随机抽查每课至少两个关键主张回到原始正文；第一、中间、最后一课做完整 sourceIds → evidence → URL 回链；metadata-only 资源不得出现在知识章节来源列表。

## 8. Activation and release

- Conditions for `planned` → registered → `active`：模块已经 active，因此本次不改变状态机；分支和 PR 中必须八课同时具备完整 note/evidence/test，不能把部分笔记合并到 active 模块。若任一课未通过来源、schema 或浏览器门，则整次完善不发布。
- PR and current-main synchronization：从已同步主线创建隔离 worktree 和功能分支；完成后推送并创建 PR；合并前重新获取 current `origin/main`，处理冲突并重跑受影响测试；PR 合并后主工作区同步到合并提交。
- Vercel Preview checks：使用 canonical `agent-development-knowledge-map` Vercel 项目生成 Preview；检查构建成功、Preview commit 与分支头一致、第四模块首中末课及三实验可公开访问。
- Vercel Production SHA and route checks：只从合并后的精确 Git SHA 部署 Production；验证 Vercel deployment metadata SHA 与 `main`/`origin/main` 一致，生产别名可访问，并在公开生产 URL 重跑关键浏览器矩阵。
- GitHub Pages disabled check：发布后读取仓库 Pages 状态并访问旧 Pages 路径，确认未启用或返回预期 404；不得创建 Pages workflow。

## 9. Stop conditions

- Evidence blockers：核心主张只有 metadata-only、搜索摘要或不可读二手材料；时敏官方语义未从正文核验；来源冲突无法用版本/范围解释；知识章节无法给出至少一个属于本课 evidence set 的来源。
- Prerequisite blockers：发现需要改写前三模块定义、全局路由协议或持久进度 schema 才能解释第四模块；此类扩域先停下重新设计，而不是在笔记任务中暗改。
- Quality/test blockers：任一知识笔记未达到完整 schema 与复杂度门；任一来源角色被拔高；全量测试、语法、diff、浏览器、Preview、Production SHA 或公开路由任一失败。
- Deadline rescope decision：优先减少 extension 资源或非核心补充案例，绝不减少八课、核心 assessed outcomes、证据边界、RED 测试、全量回归或 Production 验证。若仍无法一次完成，则不发布半成品。

## 10. Design decision

采用用户确认的 evidence-first retrofit：保留八课、24 道面试题、16 道测验与三个确定性实验；新增八篇知识型长文笔记和全资源 evidence cards，修正来源分类与 URL，补一项 reranking 原始研究，并通过测试、PR、Vercel Preview 和精确 SHA Production 发布。该方案不重做已经合理的课程导航，也不把旧的资源罗列继续作为主要学习内容。
