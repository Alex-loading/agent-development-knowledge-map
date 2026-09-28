# Agent Learner：Agent 开发知识地图

Agent Learner 是一个面向 AI / Agent 开发入门与面试复习的中文交互式学习站。当前版本已经开放「LLM 基础」「Agent 机制」「Agent Harness」「上下文、RAG 与记忆」「AI 后端工程」「评测、可观测与安全」与「多 Agent 与 MCP」七个完整模块，支持学习、练习、复习和进度记录。

页面采用“纸张研究实验室”视觉：暖色纸张底、深绿墨色、朱红索引与赭色批注。当前仓库未提交产品截图；启动本地服务即可查看桌面与移动端布局。

## 当前状态

当前有七个完整模块：

- **LLM 基础模块已完成**：8 节课程、41 份资源（含完整保留的 28 份既有资源与 13 份冻结一级资料绑定）、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖从神经网络、Token、Transformer 到推理、结构化输出与评测安全的基础主线。
- **Agent 机制模块已完成**：8 节课程、47 份资源（含完整保留的 29 份既有资源与 18 份冻结一级资料绑定）、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖单 Agent 的任务契约、工具、循环、规划、恢复、工作上下文与终止设计。
- **Agent Harness 模块已完成**：8 节课程、53 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖宿主 Runner、状态与事件、工具治理、隔离、预算、可靠恢复、并发调度和人工接力。
- **上下文、RAG 与记忆模块已完成**：8 节课程、44 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖上下文生命周期、预算分配、会话压缩、语料与索引、混合检索、证据打包和长期记忆治理。
- **AI 后端工程模块已完成**：8 节课程、49 份资源（含完整保留的 37 份既有资源与 12 份冻结一级资料绑定）、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖 API 契约、流式取消、准入控制、异步队列、权威存储、缓存正确性、幂等投递、服务生命周期、可观测性与部署扩容。

- **评测、可观测与安全模块已完成**：8 节课程、22 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖成功标准、评分器校准、分组回归、RAG 故障归因、Trace 与采样、提示注入、执行权限、安全回归和发布验证。

- **多 Agent 与 MCP 模块已完成**：8 节课程、30 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖任务依赖、编排与控制权、上下文隔离、MCP 原语、每请求版本与能力、传输与恢复、授权和集成验收。

七个模块都提供课程完成度、quiz 记录、面试掌握度与复习队列的本地进度。求职与项目交付模块仍未开放，范围见“模块路线图与边界”。

LLM 基础八课以站内知识笔记为主教材；Agent 机制八课以站内知识笔记为主教材；Agent Harness 八课以站内知识笔记为主教材；上下文、RAG 与记忆八课以站内知识笔记为主教材；AI 后端工程八课以站内知识笔记为主教材；评测、可观测与安全八课以站内知识笔记为主教材；多 Agent 与 MCP 八课以站内知识笔记为主教材。外部学习资料提供依据、交叉核验和扩展阅读。

课程详情渲染经过来源审计的 `knowledgeNote`；`explanations` 用于兼容 fallback。

**七个模块已接入教学图解**：LLM 基础八课共接入 40 张主视觉，每课 1 张总览图与 4 张章节图；Agent 机制八课共接入 16 张主视觉，对应 16 个 SVG 文件；Agent Harness 八课共接入 24 张主视觉，对应 27 个 SVG 文件，其中 3 个分步状态；上下文、RAG 与记忆八课共接入 24 张主视觉，对应 27 个 SVG 文件，其中 3 个分步状态；AI 后端工程八课共接入 16 张主视觉与 16 个 typed production scenes，对应 16 个 SVG 文件；评测、可观测与安全八课共接入 16 张主视觉，对应 16 个 SVG 文件，每课 1 张总览与 1 张章节图；多 Agent 与 MCP 八课共接入 16 张主视觉，对应 16 个 SVG 文件和 16 份 Mermaid 关系图。七个模块通过统一 visual registry 读取本地静态资产、证据归属、替代文本、长描述、图注与分步状态。

全站合计 56 节课、286 份课程资源、168 道站内面试题、21 项交互实验、152 张主视觉与 18 个分步状态（170 个本地 SVG）。前五个模块的两家指定一级资料冻结为 50 个 canonical source，再由 81 个全局唯一课程 resource binding 接入；相关分类与证据见 [`2026-07-30-primary-reference-integration-release.md`](docs/content-audits/2026-07-30-primary-reference-integration-release.md)。第六模块的来源见 [`2026-09-18-evals-observability-security-sources.md`](docs/research/2026-09-18-evals-observability-security-sources.md)；第七模块的来源与版本见 [`2026-09-18-multi-agent-mcp-sources.md`](docs/research/2026-09-18-multi-agent-mcp-sources.md)。

## 功能导览

站点有六个一级视图：

1. **模块首页**：给出当前模块的下一节推荐、课程与面试双轨进度、复习入口和八步迷你路径。
2. **学习主线**：按先修关系展示当前模块的 8 节课程；课程详情包含讲解、资料、练习、测验和完成标准。
3. **知识地图**：用可用、当前、已完成、待先修等文本状态展示概念路径，状态不只依赖颜色。
4. **资源库**：按语言、平台、来源、类型、难度和阶段组合筛选当前模块的全部资源。
5. **面试高频**：先自行口述，再展开参考答案；可筛选岗位与掌握状态，并维护复习队列。
6. **学习进度**：分别汇总课程与面试记录，可通过二次确认重置当前版本的学习进度。

### 外部面试补充

五个模块的「面试高频」页新增 **69 道补充问题、98 条原文引用**，来源为[图灵 AI 大模型面试系列（语雀）](https://www.yuque.com/aaron-wecc3/dhluml/foho2nsutnn37gw3)与[小林面试笔记](https://www.xiaolincoding.com/project/xiaolinnote.html)。题单按关联课程展开，对应课程详情末尾也可直接阅读本课问题、打开原文。

| 模块 | 补充问题 | 原文引用 |
| --- | ---: | ---: |
| LLM 基础 | 23 | 29 |
| Agent 机制 | 10 | 20 |
| Agent Harness | 7 | 8 |
| 上下文、RAG 与记忆 | 24 | 36 |
| AI 后端工程 | 5 | 5 |

问题根据来源考点归纳，同一考点可对照多个原文；根据工程文章整理的练习标为「延伸阅读追问」。外部答案和 PDF 保留在原站，语雀可能要求访问码。原文题单不计入现有 168 道站内题的掌握率与复习队列。多 Agent 与 MCP 的 24 道站内题随第七模块提供。

题单数据位于 `src/data/interview-supplements.js`，记录模块、课程、来源、核对日期与核对范围；增补时应使用具体文章或已核对章节的链接。来源核对范围与分类说明见[本次内容记录](docs/content-audits/2026-09-17-interview-supplements.md)。

LLM 基础的三项概念实验嵌在对应课程内：

- `llm-03`：**Token / 上下文预算台**，演示系统指令、历史、检索与输出如何竞争上下文预算；
- `llm-04`：**Attention 直觉台**，演示教学关联分、归一化权重与因果掩码；
- `llm-06`：**采样参数实验**，比较 temperature、top-p 与候选核变化。

这些实验明确是教学模型，不冒充真实 tokenizer、完整多头注意力或生产推理服务。

## 模块切换与路由

使用页头的模块选择器可在七个完整模块之间切换；六个一级视图沿用当前 `moduleId`，临时筛选按模块分别保存。每个模块的 dashboard 与第一课 canonical Hash 路由是：

```text
#llm-foundation/dashboard
#llm-foundation/lesson/llm-01
#agent-mechanism/dashboard
#agent-mechanism/lesson/agent-01
#agent-harness/dashboard
#agent-harness/lesson/harness-01
#context-rag-memory/dashboard
#context-rag-memory/lesson/context-01
#backend-engineering/dashboard
#backend-engineering/lesson/backend-01
#evals-observability-security/dashboard
#evals-observability-security/lesson/eval-01
#multi-agent-mcp/dashboard
#multi-agent-mcp/lesson/ma-01
```

模块必须同时在目录中标记为 `active` 并注册到 `courseRegistry` 才能打开；无效模块或课程 ID 会回退到默认模块首页。

## Agent 机制课程地图

Agent 机制是一条从控制权判断到综合设计的八节单 Agent 主线：

1. `agent-01` **Agent、Workflow 与普通 LLM 应用**：从控制流和行动闭环判断何时需要自治。
2. `agent-02` **目标、约束与任务状态**：把模糊请求改写成有成功证据的任务契约。
3. `agent-03` **工具调用与 Agent–Computer Interface**：区分模型动作提案、宿主校验执行和 observation 回填。
4. `agent-04` **Agent Loop 与 ReAct**：实现受终止条件与步骤预算约束的 decide–act–observe 循环。
5. `agent-05` **规划、任务分解与重规划**：比较 fixed、reactive 与 hybrid 策略并依据新观察修订计划。
6. `agent-06` **失败恢复、反思与外部验证**：按错误类型选择有限恢复，并用外部证据校准反思。
7. `agent-07` **上下文与工作记忆**：组织目标、计划、观察、产物引用和压缩后的工作上下文。
8. `agent-08` **单 Agent 综合设计与面试压力测试**：把机制、边界、验证和终止出口组合成可评审方案。

三项交互实验直接调用课程的纯逻辑，不在 UI 中复制判定规则：

- `agent-03` / `tool-contract`：**工具契约检查台**，比较合法低风险、缺少必填项、非法枚举、额外字段和高风险审批五类调用；
- `agent-04` / `agent-loop`：**Agent Loop 决策台**，观察完成、阻塞、继续和预算耗尽的优先级；
- `agent-05` / `plan-recovery`：**计划恢复棋盘**，触发 retry、switch-action、replace-step、replan 与 blocked。

## Agent Harness 课程地图

Agent Harness 是一条从宿主执行入口到可靠调度、人工接力与运行产物的八节工程主线：

1. `harness-01` **Harness 与宿主 Runner**：明确模型、Agent loop、Harness 与宿主进程的职责边界，并定义 run 生命周期。
2. `harness-02` **Run State、Event Log 与 Checkpoint**：用可序列化状态、追加事件和 checkpoint 支持审计与恢复。
3. `harness-03` **工具注册、权限与人工审批**：把工具契约、最小权限、风险分级和审批决策放在模型之外执行。
4. `harness-04` **Sandbox、隔离与资源边界**：比较进程、容器和 microVM 的隔离边界，并限制文件、网络、CPU 与内存。
5. `harness-05` **Budget、Timeout、Retry 与 Cancel**：组合步骤、时间、费用预算和有限重试，保证取消能传播并收敛。
6. `harness-06` **幂等副作用与安全 Resume**：用幂等键、调用账本、远端查询和补偿处理崩溃后的模糊窗口。
7. `harness-07` **并发、队列与背压**：用租约、并发上限和过载策略调度长任务，避免无限积压。
8. `harness-08` **Blocked、HITL、Handoff 与运行产物**：把无法自治完成的 run 转成可恢复、可交接、可验收的结果。

三项交互实验与课程直接对应：

- `harness-01` / `run-lifecycle`：**Run Lifecycle 状态台**，按事件观察 run 的合法转换、终态守卫与步骤预算；
- `harness-06` / `retry-resume`：**Retry / Resume 恢复决策台**，根据错误、幂等记录与远端证据选择跳过、对账、重试或人工处理；
- `harness-07` / `queue-backpressure`：**Queue / Backpressure 调度台**，观察 worker 容量、队列阈值、拒绝与取消策略。

三项实验均为确定性模拟，只呈现输入对应的控制决策；它们不是真实 worker 或真实持久层，也不调用真实外部系统或真实队列，因此不能用于推断生产吞吐、故障概率或隔离强度。

## 上下文、RAG 与记忆课程地图

上下文、RAG 与记忆模块沿着“识别信息层次 → 投影当前上下文 → 构建检索证据 → 治理长期记忆 → 综合诊断”的顺序组织八节课：

1. `context-01` **信息层次与上下文生命周期**：区分提示、会话状态、检索语料、运行 checkpoint 与长期记忆的所有权、生命周期和投影方式。
2. `context-02` **Context Engineering 与预算分配**：为 required 指令、当前轮、状态、检索证据和记忆投影分配有限输入预算。
3. `context-03` **Conversation State、Transcript 与摘要**：从原始消息提取 canonical state，并把摘要视为可回源但有损的派生物。
4. `context-04` **Retrieval Corpus、Chunk 与索引**：设计可版本化、可失效、可过滤、可引用的 chunk，同时区分 corpus 与 index。
5. `context-05` **Sparse、Dense 与 Hybrid Retrieval**：比较词法召回、语义召回和稳定融合，并保留过滤与排序 trace。
6. `context-06` **Reranking、去重与证据打包**：在上下文预算内选择互补证据，生成可回源的 citation manifest。
7. `context-07` **长期记忆的写入、召回与遗忘**：用准入、作用域、纠正、TTL 与删除管理长期记录。
8. `context-08` **RAG 与记忆综合设计及故障定位**：从摄取、召回、过滤、打包、记忆到生成忠实度逐层定位错误。

三项交互实验使用固定输入和纯函数，便于重复比较结果：

- `context-02` / `context-router`：**上下文路由与预算台**，观察 required 超限、投影资格、排序策略和预算排除原因；
- `context-05` / `hybrid-retrieval`：**混合检索与证据打包台**，比较 sparse、dense、hybrid、版本过滤、去重与引用清单；
- `context-07` / `memory-lifecycle`：**长期记忆生命周期台**，演练 store、no-op、supersede、reject、expire、delete 与作用域隔离。

这里的 RAG 不等同于向量数据库：语料摄取、chunk、词法/向量召回、过滤、重排、证据打包、引用和生成校验都是独立环节；RAG 不能消除幻觉，也不承诺答案必然忠实。三项实验是确定性教学模型，其中教学记忆模拟不代表真实隐私合规，不能替代访问控制、数据治理、审计或法律评估。

责任边界保持清楚：`context projection` 是把已选择信息放入单次模型调用；`retrieval corpus` 是可管理、可版本化的外部知识源；`long-term memory` 是跨轮次保存且必须支持更新、过期和删除的记录；`checkpoint` 保存 Harness 的运行恢复状态。Checkpoint 不是长期记忆，Harness 负责执行与恢复控制，本模块负责信息选择、检索与记忆语义。

## AI 后端工程课程地图

AI 后端工程沿着“定义公共服务边界 → 管理长连接与并发 → 持久化异步工作 → 保证缓存与投递正确性 → 运行、观测并扩容”的依赖顺序组织八节课：

1. `backend-01` **AI 服务边界与 API 契约**：围绕 report、job、result 与 cancellation 定义资源、schema、错误 envelope、版本和请求身份。
2. `backend-02` **同步、SSE 流式响应与取消**：区分同步结果、typed SSE 事件、客户端断线、应用取消、上游停止与资源清理。
3. `backend-03` **并发、Deadline 与准入控制**：用稳态均值模型建立容量直觉，再用有界队列、deadline、429 和负载丢弃保护服务。
4. `backend-04` **异步任务、队列与 Worker**：把长工作建模为可查询、可取消、可恢复的 job，并分离业务状态、broker delivery 与 worker lease。
5. `backend-05` **PostgreSQL、Redis 与缓存正确性**：让事务性持久层保存权威状态，把 Redis 限定为可淘汰、可重建并按租户与版本隔离的加速层。
6. `backend-06` **重试、幂等与投递语义**：区分 HTTP 幂等、broker 至少一次、应用去重、数据库约束和外部副作用的未知结果。
7. `backend-07` **生命周期、健康检查与可观测性**：设计 startup、readiness、liveness、drain、graceful shutdown，以及贯穿请求、流、队列和 worker 的观测字段。
8. `backend-08` **部署、扩容与综合故障诊断**：组合容器、非 root 运行、多副本、滚动发布、请求路由与端到端故障定位。

三项交互实验与服务边界直接对应：

- `backend-02` / `stream-lifecycle`：**流式生命周期台**，生成同步、正常流、断线、应用取消和上游失败的 typed 事件轨迹与清理动作；
- `backend-03` / `service-admission`：**服务准入预算台**，根据到达率、平均服务时间、并发槽、队列上限和 deadline 推导接受、排队、拒绝与超时；
- `backend-06` / `job-delivery-ledger`：**任务投递账本台**，在提交、领取、执行、结果提交与确认阶段演练重复、崩溃、幂等回放和人工对账。

三项实验都是固定规则驱动的确定性教学模拟，不是真实服务、真实网络或真实队列；结果不能外推为生产吞吐、p95 / p99 延迟、broker 投递保证或端到端 exactly-once。流式实验只刻画事件与取消边界，准入实验使用均值窗口而非排队分布，投递账本只证明所示状态机中的决定，不替代真实数据库事务、broker 配置、故障注入和压测。

## 评测、可观测与安全课程地图

八课围绕企业知识助手的发布评审组织：

1. `eval-01` **成功标准、评测集与基线**：定义环境结果、必要约束、开发集合与封存集合。
2. `eval-02` **评分器、Rubric 与人工校准**：选择代码、模型和人工评分，核验评分误差。
3. `eval-03` **分组回归、重复试验与发布门槛**：按案例与业务分组比较候选版本，保留未知结果。
4. `eval-04` **RAG 与 Agent 的分层故障归因**：定位检索、证据使用、执行与评分环境的失败。
5. `eval-05` **Trace、指标、采样与数据最小化**：关联运行记录，解释采样分母，限制敏感内容采集。
6. `eval-06` **提示注入、威胁模型与执行边界**：识别不可信内容，逐次核查工具和资源权限。
7. `eval-07` **安全测试、数据保护与输出校验**：同时检查攻击样本、正常请求和实际副作用。
8. `eval-08` **离线到线上：发布门槛与事故闭环**：定义灰度停止条件，将事故行动项加入回归验证。

三项交互实验：

- `eval-03` / `eval-release-gate`：**分组回归与发布门槛台**，检查总分相同但长文档退化、样本不足、尚未评分和关键失败。
- `eval-05` / `eval-trace-sampling`：**追踪采样与证据范围台**，显示同一组六条记录在三种选择规则下的分子和分母。
- `eval-07` / `eval-safety-regression`：**安全回归与正常对照台**，分别报告检测漏报、正常误拒和越权副作用。

实验使用公开定义的教学数据。重复成功概率采用同一任务独立同分布假设；发布规则仅表达教学条件。GenAI semantic conventions 按 2026-09-18 的 Development 文档注明版本限制。

## 多 Agent 与 MCP 课程地图

1. `ma-01` **多 Agent 适用条件与任务依赖**：依据单 Agent 基线、依赖关系、质量与成本判断协作价值。
2. `ma-02` **编排、委托与控制权**：明确最终回复责任，计算并发与共享写入的影响。
3. `ma-03` **上下文隔离与结果验收**：组织任务输入、产物引用、证据和合并责任。
4. `ma-04` **MCP 角色与 tools、resources、prompts**：说明 Host、Client、Server 及三类原语。
5. `ma-05` **每请求版本、能力与旧版兼容**：核对 metadata、HTTP 请求头、能力需求与 MRTR。
6. `ma-06` **传输、错误、取消与可选 Tasks**：区分传输、协议、工具及业务结果，选择恢复动作。
7. `ma-07` **认证授权与执行边界**：逐项检查身份、委托、资源、token 和具体动作确认。
8. `ma-08` **多 Agent 与 MCP 集成验收**：汇集协议、业务结果、安全、质量与成本的检查证据。

三项交互实验使用实际纯函数计算：

- `ma-02` / `ma-dependency-scheduling`：**依赖与共享写入调度台**，调整 worker 数量和写入对象，观察执行顺序与完成时长。
- `ma-05` / `ma-mcp-request`：**MCP 请求字段核对台**，检查 metadata、版本、HTTP 字段与表单能力，展示对应错误码。
- `ma-07` / `ma-delegated-permissions`：**委托范围与执行权限台**，计算身份、动作、租户、audience、scope 与具体确认的许可交集。

MCP 主线采用 **2026-07-28**；2025-11-25 用于历史兼容说明，Tasks 按同日期的可选 Stable extension 讲解。三个实验只表达公开定义的教学规则，页面没有运行真实 Agent、MCP Server 或 OAuth 服务。课程与图形验收见 [`2026-09-18-multi-agent-mcp.md`](docs/content-audits/2026-09-18-multi-agent-mcp.md)。

## 模块路线图与边界

已开放的 Agent 机制模块只讲**单 Agent**：目标、状态、工具、loop、规划、恢复、工作上下文和终止。它建立的是机制层心智模型，不把生产运行时、知识检索、评测治理或分布式协作提前塞进同一门课。

**Agent Harness**：active（已开放）。范围是宿主 Runner、Run State、Event Log、Checkpoint、工具权限与人工审批、Sandbox 隔离、Budget / Timeout / Retry / Cancel、幂等副作用与安全 Resume、并发队列与背压，以及 Blocked / HITL / Handoff / 运行产物。它负责执行与恢复控制，但不提前覆盖 RAG 与长期记忆、完整后端服务、系统化评测治理或多 Agent 协议。

**上下文、RAG 与记忆**：active（已开放）。范围是信息层次、context projection、会话状态与有损摘要、retrieval corpus、chunk/index、Sparse / Dense / Hybrid Retrieval、重排去重、证据与引用，以及 long-term memory 的写入、纠正、过期和删除。它不负责 Harness checkpoint 恢复、生产向量库与后端伸缩、完整评测安全治理或多 Agent 协议。

**AI 后端工程**：active（已开放）。范围是多客户端 AI 服务的 API 契约、同步与 SSE、取消传播、并发与 deadline、准入控制、异步 job、队列与 worker、PostgreSQL 权威状态、Redis 缓存、重试幂等、健康检查、可观测性、容器部署与扩容。它承接 Harness 输出并把 run 放入公共服务边界，但不提前覆盖系统化评测安全治理、多 Agent 协作协议或作品集交付。

**评测、可观测与安全**：active（已开放）。先修课程为 Agent Harness 和上下文、RAG 与记忆。范围包括任务评测、运行证据、安全边界与发布判断。

**多 Agent 与 MCP**：active（已开放）。先修课程为 AI 后端工程和评测、可观测与安全。范围包括协作选择、控制责任、上下文、MCP 接入与兼容、传输恢复、权限和综合验收。

以下一个模块仍只有目录与依赖元数据：

- **求职与项目交付**：planned（规划中），承接作品集、系统设计与面试交付。

## 快速开始

前置条件：Git、现代浏览器、Node.js 18+（运行原生 `node:test`）与 Python 3（启动静态服务器）。项目没有第三方运行依赖。

```bash
cd agent-development-knowledge-map
npm test
npm run serve
```

数据与计算逻辑可以使用 `npm run test:data` 单独验证。页面交互使用真实浏览器检查；第六模块的静态图形可用 `npm run check:evals-visuals` 核验。

然后打开 [http://localhost:4173](http://localhost:4173)。不要直接双击 `index.html`：浏览器对 `file://` 下的 ES Modules 有额外限制。

本项目是原生 ES Modules 静态站，无需构建（no build step）。本仓库的**唯一正式部署平台是 Vercel**：生产环境发布仓库根目录，入口是 `index.html`，不要只发布 `src/`；所有站内资源使用相对路径，部署产物必须同时包含 `styles/` 与 `src/`。

部署约定：

- `main` 对应 Vercel Production，功能分支或 Pull Request 对应 Preview；
- GitHub Pages 必须保持关闭，不作为正式环境或备用发布渠道；
- 每次发布后必须确认 Vercel 部署状态为 Ready、线上页面可访问，并核对部署提交与目标 `main` 提交一致；
- 若 Vercel 的 Git 集成暂时不可用，可使用已关联项目的 Vercel CLI 发布，但仍需执行上述验证。

## 隐私与进度存储

进度仅保存在当前浏览器的 `localStorage`，键名固定为：

```text
agent-learner:progress:v1
```

- 没有账号、分析脚本或网络同步；学习记录不会上传到服务端。
- `localStorage` 中的 JSON 损坏或字段无效时，会安全返回默认进度，模式仍保持 `local`；下一次保存会用有效状态覆盖坏数据。
- 只有读取、写入或删除等存储操作抛出异常、被浏览器阻止或不可用时，才会切换到 `memory` 内存回退模式并显示提示；关闭页面后该次进度会丢失。
- “重置进度”需要页面内二次确认，并且只删除 `agent-learner:progress:v1`，不会清空同域名下其他应用的数据。
- 外部学习资料只有在用户主动打开时才会访问第三方站点；有效链接使用 HTTPS、新标签页以及 `noopener noreferrer`。

## 架构与数据流

项目刻意保持无框架、无打包器：浏览器直接加载 native ES modules。主数据流是：

```text
data（课程事实） -> core（纯逻辑） -> UI（DOM 渲染） -> app（路由与事件） -> storage（本地持久化）
```

- `src/data/` 保存模块目录、课程事实和 `src/data/courses.js` 中不可变的 `courseRegistry`；路由只接受“模块元数据为 active 且课程已经注册”的组合。
- `src/data/llm-foundation.js`、`src/data/agent-mechanism.js`、`src/data/agent-harness.js`、`src/data/context-rag-memory.js`、`src/data/backend-engineering.js`、`src/data/evals-observability-security.js` 与 `src/data/multi-agent-mcp.js` 保存七个完整课程的数据，由 `courseRegistry` 按 `moduleId` 注册。正文分别位于各模块的 notes 目录，聚合入口负责引用和递归冻结。第七模块使用 `src/data/multi-agent-notes/`、`src/data/multi-agent-lessons/` 和 `src/data/multi-agent-resources.js`，记录正文、考核对应关系、来源版本和核对范围。
- 正文目录与入口分别为：`src/data/llm-foundation-notes/` 和 `src/data/llm-foundation-notes.js` 聚合入口；`src/data/agent-mechanism-notes/` 和 `src/data/agent-mechanism-notes.js` 聚合入口；`src/data/agent-harness-notes/` 和 `src/data/agent-harness-notes.js` 聚合入口；`src/data/context-rag-memory-notes/` 和 `src/data/context-rag-memory-notes.js` 聚合入口；`src/data/backend-engineering-notes/` 和 `src/data/backend-engineering-notes.js` 聚合入口；`src/data/evals-notes/` 和 `src/data/evals-notes.js` 聚合入口；`src/data/multi-agent-notes/` 和 `src/data/multi-agent-notes.js` 聚合入口。
- `src/data/visuals/` 保存共享 visual registry 与图形数据定义；当前注册 LLM 基础 40 张、Agent 机制 16 张、Agent Harness 24 张、上下文/RAG/记忆 24 张、AI 后端工程 16 张、评测/可观测/安全 16 张和多 Agent/MCP 16 张主视觉。知识笔记用稳定 `visualId` 声明总览或章节插入位置，registry 管理本地资产、来源、许可和可访问描述。
- `src/core/` 提供可独立测试的进度、筛选、测验、实验计算与 view-model 纯函数；`src/core/agent-mechanism.js` 是 Agent 三实验的判定源，`src/core/agent-harness.js` 负责 run 状态归约、安全 Resume 决策与队列/背压步进，`src/core/context-rag-memory.js` 负责上下文组装、混合检索/证据打包与记忆生命周期，`src/core/backend-engineering.js` 负责流式生命周期、服务准入和任务投递账本，四者均不查询 DOM。
- `src/ui/` 使用安全 DOM API 生成六个通用视图和课程实验，不使用 `innerHTML` 或内联事件；`src/ui/agent-experiments.js`、`src/ui/harness-experiments.js`、`src/ui/context-experiments.js` 与 `src/ui/backend-experiments.js` 只负责控件、输入错误、可访问结果和调用对应 core，不复制领域判定。
- `src/core/multi-agent.js` 提供依赖调度、MCP metadata 和委托权限计算；`src/ui/multi-agent-experiments.js` 提供对应控件、结果说明和焦点恢复。
- `src/app.js` 负责 hash 路由、跨视图状态、焦点恢复、公告与持久化编排。
- `src/core/storage.js` 负责结构校验、`localStorage` 与内存回退。

`src/app.js` 通过注册表按当前 `moduleId` 取得课程，再把同一个 course 交给通用视图；只有 planned 元数据而未注册的模块不可路由。依赖方向保持单向；数据层不导入 UI，纯逻辑不查询 DOM，通用视图不为某个新模块添加特判。

## 目录说明

```text
.
├── index.html                 # 语义化应用壳、跳过链接、挂载点
├── styles/
│   ├── tokens.css             # 色彩、字号、间距、动效 token
│   └── app.css                # 纸张实验室组件与响应式样式
├── src/
│   ├── app.js                 # 路由、事件和应用状态编排
│   ├── data/
│   │   ├── modules.js         # 模块目录、状态、先修关系
│   │   ├── courses.js         # 不可变课程注册表与 getCourse 查询
│   │   ├── llm-foundation.js  # LLM 课程、资源、面试题
│   │   ├── llm-foundation-notes.js # LLM 八课知识笔记聚合入口
│   │   ├── llm-foundation-notes/
│   │   │   ├── llm-01.js      # 第一课知识笔记纯数据
│   │   │   ├── llm-02.js      # 第二课知识笔记纯数据
│   │   │   ├── llm-03.js      # 第三课知识笔记纯数据
│   │   │   ├── llm-04.js      # 第四课知识笔记纯数据
│   │   │   ├── llm-05.js      # 第五课知识笔记纯数据
│   │   │   ├── llm-06.js      # 第六课知识笔记纯数据
│   │   │   ├── llm-07.js      # 第七课知识笔记纯数据
│   │   │   └── llm-08.js      # 第八课知识笔记纯数据
│   │   ├── agent-mechanism.js # Agent 课程、资源、面试题
│   │   ├── agent-mechanism-notes.js # Agent 八课知识笔记聚合入口
│   │   ├── agent-mechanism-notes/
│   │   │   ├── agent-01.js    # 第一课知识笔记纯数据
│   │   │   ├── agent-02.js    # 第二课知识笔记纯数据
│   │   │   ├── agent-03.js    # 第三课知识笔记纯数据
│   │   │   ├── agent-04.js    # 第四课知识笔记纯数据
│   │   │   ├── agent-05.js    # 第五课知识笔记纯数据
│   │   │   ├── agent-06.js    # 第六课知识笔记纯数据
│   │   │   ├── agent-07.js    # 第七课知识笔记纯数据
│   │   │   └── agent-08.js    # 第八课知识笔记纯数据
│   │   ├── agent-harness.js   # Harness 课程、资源、面试题
│   │   ├── agent-harness-notes.js # Harness 八课知识笔记聚合入口
│   │   ├── agent-harness-notes/
│   │   │   ├── harness-01.js  # 第一课知识笔记纯数据
│   │   │   ├── harness-02.js  # 第二课知识笔记纯数据
│   │   │   ├── harness-03.js  # 第三课知识笔记纯数据
│   │   │   ├── harness-04.js  # 第四课知识笔记纯数据
│   │   │   ├── harness-05.js  # 第五课知识笔记纯数据
│   │   │   ├── harness-06.js  # 第六课知识笔记纯数据
│   │   │   ├── harness-07.js  # 第七课知识笔记纯数据
│   │   │   └── harness-08.js  # 第八课知识笔记纯数据
│   │   ├── context-rag-memory.js # Context/RAG/Memory 课程数据
│   │   ├── context-rag-memory-notes.js # Context/RAG/Memory 八课知识笔记聚合入口
│   │   ├── context-rag-memory-notes/
│   │   │   ├── context-01.js  # 第一课知识笔记纯数据
│   │   │   ├── context-02.js  # 第二课知识笔记纯数据
│   │   │   ├── context-03.js  # 第三课知识笔记纯数据
│   │   │   ├── context-04.js  # 第四课知识笔记纯数据
│   │   │   ├── context-05.js  # 第五课知识笔记纯数据
│   │   │   ├── context-06.js  # 第六课知识笔记纯数据
│   │   │   ├── context-07.js  # 第七课知识笔记纯数据
│   │   │   └── context-08.js  # 第八课知识笔记纯数据
│   │   ├── backend-engineering.js # AI 后端课程、资源、面试题
│   │   ├── backend-engineering-notes.js # AI 后端八课知识笔记聚合入口
│   │   └── backend-engineering-notes/
│   │       ├── backend-01.js  # 第一课知识笔记纯数据
│   │       ├── backend-02.js  # 第二课知识笔记纯数据
│   │       ├── backend-03.js  # 第三课知识笔记纯数据
│   │       ├── backend-04.js  # 第四课知识笔记纯数据
│   │       ├── backend-05.js  # 第五课知识笔记纯数据
│   │       ├── backend-06.js  # 第六课知识笔记纯数据
│   │       ├── backend-07.js  # 第七课知识笔记纯数据
│   │       └── backend-08.js  # 第八课知识笔记纯数据
│   ├── core/                  # 无 DOM 的领域逻辑与存储适配器
│   │   ├── agent-mechanism.js # Agent loop、工具契约、计划恢复判定
│   │   ├── agent-harness.js   # Run、Resume 与队列背压判定
│   │   ├── context-rag-memory.js # 上下文、检索与记忆纯逻辑
│   │   └── backend-engineering.js # 流式、准入与投递语义纯逻辑
│   └── ui/                    # 各视图、课程详情、实验和 DOM 工具
│       ├── agent-experiments.js # Agent 三项交互实验 renderer
│       ├── harness-experiments.js # Harness 三项交互实验 renderer
│       ├── context-experiments.js # Context/RAG/Memory 三实验 renderer
│       └── backend-experiments.js # AI 后端三实验 renderer
└── tests/
    ├── data.test.js           # 数据规模、字段和交叉引用
    ├── course-registry.test.js # 注册表与多模块路由边界
    ├── learning-logic.test.js # 筛选、测验、实验、view-model
    ├── progress.test.js       # 不可变进度领域
    ├── storage.test.js        # 本地保存、损坏恢复、内存回退
    ├── static-app.test.js     # HTML/CSS/README 发布契约
    └── *ui*.test.js           # 真实渲染路径、交互与焦点回归
```

## 数据字段约定

现有实现是字段契约的权威示例：模块见 `src/data/modules.js`，课程数据见 `src/data/llm-foundation.js`、`src/data/agent-mechanism.js`、`src/data/agent-harness.js`、`src/data/context-rag-memory.js` 与 `src/data/backend-engineering.js`，进度见 `src/core/progress.js`。

### Module

- `id`：稳定、唯一、URL 安全；
- `title`、`summary`：展示文案；
- `status`：`active` 或 `planned`；
- `prerequisites`：引用已存在的模块 ID，依赖图不能成环；
- `estimatedHours`：预计学习时长；
- `promisedContent`：每个模块必须同时包含 `课程 / 资源 / 练习 / 面试高频` 四类内容。

### Lesson

- `id`、`order`、`title`、`summary`、`durationMinutes`；
- `prerequisites`：可选，只引用本模块课程 ID；省略时 view-model 按课程顺序推导上一节为先修；
- `objectives`、`concepts`、`explanations`、`keyPoints`；
- `knowledgeNote`：可选的站内长文主教材，包含 `readingMinutes`、`introduction`、`sections`、`misconceptions`、`recap` 与 `nextStep`；每个 section 由 `id`、`title`、`paragraphs`、`keyPoints`、可选 `callout` 和 `sourceIds` 组成。未提供时继续使用 `explanations`；
- `resourceIds`、`interviewQuestionIds`：必须双向可解析；
- `exercise`：标题、说明、步骤、交付物，可选已有 `experiment` ID；
- `quiz` 与 `completionCriteria`：保证学习者能验证理解与完成状态。

### Resource

- `id`、`title`、`url`、`source`；`platform` 可选，缺省时由 URL 与类型等字段推导；
- `language`、`type`、`difficulty`、`stage`；
- `value`：展示“学习价值”，说明为什么值得学以及证据适用边界；
- `verifiedAt`：`YYYY-MM-DD` 核验日期。
- `evidence`：知识笔记使用的可选来源卡，简要记录 `authority`、`role`、`coverage`、`limitations` 与 `verifiedAt`；它描述来源能证明什么、不能外推什么，不替代正文核验。

### Interview question

- `id`、`lessonId`、`question`；
- `shortAnswer`、`deepDive`、`misconceptions`、`followUps`；
- `frequency`、`difficulty`、`roles`。

### Progress

- `version`、`currentModuleId`、`currentLessonId`、`lastVisitedAt`；
- `completedLessonIds`、`quizResults`；
- `interviewStatusById`、`reviewQueue`。

进度写入必须走 `src/core/progress.js` 的不可变操作和 `src/core/storage.js` 的存储接口，不要让 UI 直接修改原对象。

七个完整模块共同遵循以下数据规则：

- lesson、resource、quiz、interview、experiment 五类内容 ID 在各课程内及跨课程全局唯一，扁平进度记录不会因 ID 碰撞串课；
- 课程与面试进度汇总按当前 course 的真实 ID 集合过滤，其他模块或陈旧记录不计入当前百分比；
- 重置会清空整个专用键 `agent-learner:progress:v1`，不是只清当前模块；它仍不会影响同域名下其他应用的数据；
- 临时资源筛选保存在 `resourceFiltersByModule`，以 `moduleId` 隔离；
- 临时面试筛选保存在 `interviewFiltersByModule`，以 `moduleId` 隔离；
- 临时 revealed 展开状态保存在 `revealedInterviewIdsByModule`，以 `moduleId` 隔离。

`ProgressState` 使用一个专用键保存扁平记录；全局 ID、按当前课程过滤和模块级临时 UI 状态使七个模块的进度分别计算。

## 知识模块从 0 到 1 的复用流程

后续完整模块统一从项目 Skill `.agents/skills/build-agent-learner-module/` 启动。它把早期模块开发中的跨平台资料搜集、课程与网站框架搭建，与后续验证过的来源审计、长文主教材、双重审查、浏览器验收和 Vercel 发布串成一个阶段门流程；`.agents/skills/build-learning-module-notes/` 继续作为逐课知识笔记的必需子 Skill。

调用 `$build-agent-learner-module` 后按以下顺序推进：

1. 读取当前仓库、模块依赖、注册表、已有模块、测试基线和 `AGENTS.md`，不复用旧计划中的过期部署规则。
2. 先定义学习者入口能力、最终能力、综合交付物、模块边界和相邻模块接口；产品先修关系不可为了赶进度被改写。
3. 将官方/标准、论文/原始工作、工程/GitHub、中文/视频导航拆成只读并行调研，由主代理直接复核正文、去重并建立证据账本；子代理摘要和搜索结果只作线索。此阶段的视觉清单只暂记认知问题、事实证据线索、候选形式和来源/许可线索，不提前指定考核、所属章节、插入位置或 storyboard。
4. 先冻结核心主张、版本、访问失败、冲突和证据缺口，再从知识依赖推导课程与真实笔记章节；此后、绘制 storyboard 之前，才冻结视觉对应的考核产出、真实归属章节、总览或段落插入位置、证据 ID 与许可决策。许可不明确时只保留原链接，以独立证据制作原创替代图。模块 1、2 的八课、28/29 个资源和三项实验是成熟参考中心，不是凑数指标；课数、资源数和实验数按复杂度说明理由。
5. 用 Skill 模板固化规格、覆盖矩阵、所有权与验收门，再在隔离 worktree 中按 TDD 实施。不同作者只处理互不重叠的资料或单课文件，共享 registry 和聚合入口由单一集成人负责。
6. 每课必须调用 `$build-learning-module-notes`，完成来源卡、考核/练习覆盖、可解析 `sourceIds`、测试审计和质量评分；声明视觉完成的模块还必须通过 visual registry、唯一证据归属、许可、静态资产安全、可访问性、窄屏与 fallback 门。低于 85/100、存在断裂引用或关键证据缺口时保持阻塞，不发布看似完整的正文。
7. 每项任务按作者 → 规格审查 → 质量审查推进；缺陷退回原作者并复审。课程数据、纯逻辑、实验 UI、通用注册与文档按文件边界集成。
8. 开发期间模块保持 `planned` 且不注册；只有知识内容、目标测试、全量回归、旧模块兼容和真实浏览器矩阵全部通过，才最后加入 registry 并切换为 `active`。
9. 同步最新 `main`、通过一个 PR 和 Vercel Preview 后合并；Production 只有在状态为 Ready、线上关键路由可访问且部署 Git SHA 与目标 `main` 完全一致时才算完成。GitHub Pages 必须继续关闭。

若证据、先修依赖或时间无法满足发布门，交付已完成的研究包、课程图、规格、测试状态、精确 blocker 和最小安全下一步；不能通过删减核验、提前激活或改写依赖来制造“已完成”。详细研究、数据、所有权和发布契约以该 Skill 的三个 references 为准。

## 知识笔记复用流程

七个模块采用按课程分别编写正文、由聚合入口负责引用的结构。第六模块正文位于 `src/data/evals-notes/`，第七模块正文位于 `src/data/multi-agent-notes/`，资料卡片记录版本和使用范围。可复用的项目 Skill 位于 `.agents/skills/build-learning-module-notes/`；每次编写新课程都需要核验课程目标、资源注册表和来源正文。

制作或重做知识笔记时，先调用 `$build-learning-module-notes` Skill，再按以下顺序推进：

1. 读取目标 lesson、测验、面试题、练习、完成标准及关联资源，逐来源访问正文并建立来源卡；访问失败、版本限制和证据冲突必须保留。
2. 在写正文前画出知识依赖图与覆盖矩阵，把目标、quiz、面试、练习和完成标准映射到需要讲清的知识与来源证据，再按主题综合，而不是按链接顺序批量拼接摘要。
3. 为可发布章节绑定项目注册表中真实可解析的 `sourceIds`，并记录来源的角色、覆盖范围与限制。资源 metadata、课程字段和模型记忆只能帮助规划覆盖面，不能支撑关键事实或伪装成已读证据。
4. 使用 Skill 的质量量表审查完整性、可学性、证据与边界；只有达到 **85/100** 且没有断裂引用，才接入 data、通用 UI 与 static tests。未达门槛时保留为阻塞报告或待核验提纲，不发布看似完整的主教材。

## 添加新模块

新增模块时按以下顺序执行；每一步都应配套测试：

1. 在 `src/data/modules.js` 添加唯一模块 `id`、标题、状态、先修模块与预计时长。开发期间保持 `planned`；只有元数据而没有注册课程时不可路由。
2. 新建模块数据文件，提供有序 lessons。课程 ID、顺序和可选 `prerequisites` 必须唯一且可解析，先修图不能成环。
3. 为每节课补齐目标、概念、解释、完成标准和 quiz，形成可验证的**课程**内容。
4. 添加经过核验的**资源**，填写 HTTPS URL、来源、学习价值与 `verifiedAt`；平台可显式填写，也可交给统一规则推导。把 `resourceIds` 连接回课程。
5. 为每节课设计可执行的**练习**：至少包含步骤和交付物；只有真正需要交互时才复用或新增实验渲染器。
6. 添加**面试高频**题，包含短答、深挖、误区、追问、岗位、频率与难度；维护 lesson ↔ interview 双向引用。
7. 在 `src/data/courses.js` 导入课程并加入不可变 registry。路由和六个通用视图会根据 registry 选择课程；未注册模块即使误标为 `active` 也会安全回退。
8. 为注册表、路由、数据约束、筛选/进度等纯逻辑先写失败测试，再实现最小变更。完成 registry 注册后，最后才把模块状态从 `planned` 改成 `active`。
9. 运行全量测试，检查键盘焦点与 320px 布局。优先扩展现有通用 dashboard、curriculum、map、resources、interviews、progress 渲染路径；不要在通用视图里按模块 ID 特判。若模型差异确实需要新能力，先更新字段契约与测试。

若新模块包含上下文、检索或记忆能力，仍应把数据层事实、core 纯逻辑和 UI renderer 分开：RAG 不是某个向量数据库的别名；检索结果与 citation 必须保留来源和版本，但它们不自动保证生成忠实；教学记忆模拟也不构成真实数据保护或隐私合规证明。

换言之，每个模块必须交付四类内容：**课程、资源、练习、面试高频**。只有目录卡片不算完成模块。

## 资源准入与核验

资源排序原则：官方文档与课程、GitHub 原始项目、大学公开课/论文、原作者讲解优先；高质量社区教程用于补充视角。资源库展示并可筛选**来源、类型、难度、阶段**，课程数据同时记录**学习价值**与 `verifiedAt`，这些标签用于区分证据角色和核验时间，不把厂商经验或社区案例冒充普适结论。

- 仅收录可解析的 HTTPS 链接，不编造项目名、作者、地址或核验结论。
- 添加前打开目标页，确认标题、作者/组织、内容主题与可访问性，再把当天日期写入 `verifiedAt`。
- 优先稳定的项目主页、文档页、论文页或公开视频页，避免搜索结果页、临时跳转和需要私有权限的链接。
- 官方 SDK 文档仅用于说明其当前实现语义，不把某个版本的 Runner、状态或审批 API 写成跨框架标准。
- 框架的 checkpoint/replay 只证明该框架的具体语义，不可外推为所有 Harness 的通用保证。
- durable 编排不保证任意外部副作用 exactly-once；仍需幂等键、去重、查询、对账或补偿来处理模糊窗口。
- 厂商文章提供的是工程经验，不是普适定律；采用其 timeout、retry 或过载策略前仍需在本系统验证。
- RAG 资料需区分 corpus、index、retrieval candidate、evidence packet 与 citation；召回或附带引用不代表 claim 已被证据支持，也不承诺消除幻觉。
- 长期记忆案例需记录 provenance、scope、TTL、纠正和删除语义；本站的确定性模拟只用于学习生命周期，不代表真实隐私与合规控制。
- 视频（包括短视频）仅作为直觉、演示与中文导航的补充，不承担可靠性或安全性结论。小红书因无稳定公开核验链接而未收录；这只说明本次证据条件不足，不评价平台内容质量。
- 链接失效、内容改名或长期未核验时，先更新或移除，再调整课程引用；不要保留“看起来可能正确”的不稳定链接。

## 测试与发布检查

开发遵循测试先行：先让描述新契约的测试因缺失能力而失败，再实现最小改动，最后跑全量回归。

```bash
npm test
npm run check:primary-references
npm run check:context-visuals
npm run check:agent-visuals
npm run check:backend-visuals
npm run check:release-content
git diff --check
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
find assets/visuals -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
```

发布前还应：

- 用 `npm run serve` 启动仓库根目录，确认 `/`、`/styles/app.css`、`/src/app.js` 均返回 HTTP 200；
- 在桌面与 320px/390px 宽度检查七个模块的六个视图、二十一项实验、筛选、测验、面试展开、状态、队列、持久化与重置；
- 仅在明确导航时把焦点移到 `main`，筛选、展开、状态和重置后恢复到有意义的控件或摘要；
- 保证每个路由一个 `h1`，后续标题层级合理；动态结果使用礼貌 live region；展开控件使用 `aria-expanded` 与 `aria-controls`；
- 以键盘检查跳过链接、可见焦点、禁用状态和二次确认；核心移动端触控目标约 44px；
- 检查正常文本至少 4.5:1 对比度、长文本无横向溢出、`prefers-reduced-motion` 生效、控制台无错误；
- 不点击无必要的第三方资源，不把本地测试进度带入正式预览。

## 开发工作流

保持提交小而可验证：数据、纯逻辑、UI 与文档分别说明意图；修改后先跑目标测试，再跑 `npm test`。这是静态站，没有构建产物需要提交，也不应提交本地服务器、浏览器状态或临时截图。静态托管始终从仓库根目录提供原始文件。
