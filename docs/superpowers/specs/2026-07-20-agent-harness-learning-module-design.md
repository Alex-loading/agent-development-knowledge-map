# Agent Harness 学习模块设计

## 1. 目标与既定选择

Agent Learner 的第三个完整模块为「Agent Harness」。本模块沿用前两个模块已经确认的 Paper Lab 视觉语言、原生 ES Modules、六个通用学习视图、本地进度、八节递进课程、精选资源、交互实验、理解测验和模块独立面试题库。用户要求所有选择与第一个模块一致，因此不引入新的视觉主题、框架依赖或导航模式。

模块目标是让学习者把上一模块的单 Agent loop 放进一个可靠、可暂停、可恢复、可约束的宿主执行系统。完成后，学习者应能设计 run 生命周期、事件与检查点、权限审批、沙箱、预算与取消、幂等恢复、队列背压和人工交接，并能说明这些机制为何必须由确定性宿主强制执行。

## 2. 范围边界

本模块完整覆盖：

- Agent、模型、工具与 Harness/Runner 的职责边界；
- run、attempt、step、session 的生命周期与状态机；
- run state、append-only event log、checkpoint、replay 与 artifact；
- tool registry、authentication、authorization、capability 与逐调用 approval；
- filesystem/network/secret/resource 等 sandbox 边界；
- turn/tool/token/cost/time budget、timeout、deadline、retry 与 cancellation；
- at-least-once、idempotency key、dedupe、unknown outcome、reconciliation 与安全 resume；
- bounded queue、worker concurrency、lease/ack、backpressure 与 load shedding 入门；
- blocked、paused、failed、cancelled、HITL、handoff bundle 和运行产物。

本模块只定义接口，不展开：RAG 与跨会话长期记忆；模型推理后端、分片和跨区调度；完整评测、trace/metrics/alerting 与 SLO；完整威胁模型、prompt injection、防供应链攻击与合规；多 Agent 编排和 MCP 协议细节。

## 3. 八节课程

### 3.1 Harness 与宿主 Runner

区分 Agent 的策略决策与 Harness 的确定性控制，建立 `created / queued / running / awaiting_approval / retry_wait / blocked / succeeded / failed / cancelled / timed_out` 生命周期。练习将已有循环包装成事件驱动 runner，并证明终态不可逆、所有路径都能清理资源。

### 3.2 Run State、Event Log 与 Checkpoint

区分当前状态快照、追加事件事实、恢复点和普通文本日志。练习为中途崩溃的任务构造有序事件与 checkpoint，从恢复点重放，并识别缺事件、乱序、重复事件和版本不兼容。

### 3.3 工具注册、权限与人工审批

解释 registry 只描述“有什么能力”，authorization 判断主体当前能否使用，approval 对具体高风险调用作决定。练习为读取文件、发信与退款设计最小工具集合、权限策略、持久化中断和恢复时 TOCTOU 重校验。

### 3.4 Sandbox、隔离与资源边界

比较进程、容器、用户态内核与 microVM 的边界，强调普通容器不是绝对安全沙箱。练习审查并收紧一个代码执行环境的文件、网络、凭据、CPU、内存、进程、磁盘和生命周期策略。

### 3.5 Budget、Timeout、Retry 与 Cancel

把步数、工具调用、token/cost、wall time 和 sandbox 资源纳入统一预算；区分 attempt timeout、run deadline 和协作式取消。练习为模型、只读查询和写操作制定错误分类、有限重试、backoff/jitter 与取消传播策略。

### 3.6 幂等副作用与安全 Resume

围绕“远端动作成功、响应或 checkpoint 丢失”的不确定窗口解释幂等键、去重记录、调用意图、原子边界和 reconciliation。练习向写工具注入多个崩溃点，为每种证据组合选择 skip、retry、reconcile、manual 或 fail。

### 3.7 并发、队列与背压

从 producer、bounded queue、worker、lease/ack 和 concurrency limit 建立最小队列模型。练习改变到达率、worker 数、服务能力和队列容量，观察等待、拒绝、取消传播和下游过载；只讲单 Harness 所需边界，不扩展为分布式调度专章。

### 3.8 Blocked、HITL、Handoff 与运行产物

区分 blocked、paused、failed、cancelled，设计可以等待数小时或数天的审批记录和 resume token。综合练习处理一条退款审批轨迹，生成目标、当前状态、未决动作、审批、预算、错误证据、artifact manifest、版本与敏感性齐全的 handoff bundle。

每节课继续满足现有 `Lesson` 协议：至少两个目标、三个概念、两段实质解释、两项关键点、两步练习、明确交付物、两道测验、三道关联面试题和两项完成标准。

## 4. 资源体系

资源数固定为 28，`verifiedAt` 统一为 `2026-07-20`。优先原始或官方材料：OpenAI Agents SDK 的 running agents、RunState 与 HITL；LangGraph persistence、interrupts 与 fault tolerance；Temporal workflow execution、event history 与 retry；AWS 的幂等和 backoff 工程文章；Google SRE 的过载与级联失败；gVisor、Docker 与 Firecracker 的隔离资料；NIST/OWASP 的工具权限边界；Datawhale、AgentScope、Hugging Face 中文课程；Bilibili、YouTube 与抖音仅作为机制直觉和操作补充。

每个资源使用全局唯一 `res-harness-*` ID，至少被一节课引用。文案必须区分：官方 SDK 文档只证明当前实现语义；框架的 checkpoint/replay 规则不可外推为通用标准；厂商文章是工程经验；论文只支持其研究设定；短视频不承担安全性和可靠性结论。无法稳定公开核验的小红书内容不收录。

## 5. 面试题库

本模块提供 24 道题，每节三道，ID 为 `iq-harness-01-1` 至 `iq-harness-08-3`。每题包含三十秒短答、至少两个深挖点、常见误区、追问、频率、难度和岗位标签。题目覆盖 Harness 边界、状态机、hooks、state/event/checkpoint、恢复、registry、认证授权审批、TOCTOU、sandbox、最小权限、资源预算、timeout/deadline/cancel、retry、运行预算、幂等、unknown outcome、exactly-once 边界、并发、队列、背压、blocked/failed/cancelled、长时间审批和 handoff bundle。频率是基于公开岗位与系统设计主题的定性标签，不宣称统计出现率。

## 6. 三个交互实验

实验均为确定性教学模拟，不调用真实模型、远端服务或不可信代码。

### 6.1 Run Lifecycle Reducer

纯函数 `reduceRun(state, event, policy)` 接收当前状态、带 sequence/eventId 的事件和预算策略，返回下一状态、待执行 effect 或拒绝原因。实验覆盖合法/非法转换、重复事件、审批暂停、预算耗尽和 terminal 不可逆。

### 6.2 Crash / Retry / Resume Simulator

纯函数 `planResume(input)` 根据 checkpoint、事件、pending call、幂等记录、远端证据、错误分类、重试策略和预算，输出 `skip / retry / reconcile / manual / fail`、原因和缺失证据。实验明确“错误可重试”不等于“副作用可安全重放”。

### 6.3 Bounded Queue & Backpressure Lab

纯函数 `stepQueue(state, input)` 以离散 tick 处理 arrivals、workerCount、serviceCapacity、maxQueue 和 admissionPolicy，输出 admitted、started、completed、rejected、queue age 与 utilization。实验展示无限积压、worker 过量和明确拒绝策略的权衡，不模拟真实分布式系统。

纯逻辑放入 `src/core/agent-harness.js`，DOM 渲染放入 `src/ui/harness-experiments.js`；现有实验入口只合并不可变 renderer registry。

## 7. 数据、路由与状态

新增 `src/data/agent-harness.js`，导出与已有课程相同协议的深度不可变课程对象。`src/data/courses.js` 注册课程，`src/data/modules.js` 将 `agent-harness` 切换为 active。六个视图继续完全依赖 `courseRegistry`，禁止增加按模块 ID 分支。

课程、资源、测验、面试和实验 ID 均使用 `harness-*` 前缀并保持跨课程全局唯一。现有按模块隔离的临时筛选与展开状态继续复用；持久进度仍使用 v1 扁平全局唯一 ID 协议，无需迁移。

## 8. 测试、无障碍与完成标准

所有行为变更执行 RED → GREEN → REFACTOR：

- 数据测试验证 8 节、28 资源、24 面试题、16 quiz、完整字段、引用解析、核验日期和跨课程 ID 唯一；
- 纯逻辑测试覆盖状态转换、重复事件、恢复决策、崩溃窗口、预算与有界队列；
- UI 测试覆盖三项实验的真实 DOM 操作、重置、live status 和键盘语义；
- 集成测试覆盖第三模块的六视图、路由、独立进度、资源与面试筛选；
- 静态测试继续禁止 `innerHTML`、内联事件和通用视图中的模块硬编码。

真实浏览器验收覆盖桌面与 320px/390px：三个模块切换、六个视图、三项 Harness 实验、资源筛选、测验、面试队列、进度与重置。每个路由保持一个 `h1`，无横向溢出，触控目标、live region、焦点与 reduced motion 延续现有标准。

完成时 `agent-harness` 拥有 canonical hash 并可学习；全部课程内容、资源、面试题与实验可用；自动化测试、语法检查和 `git diff --check` 通过；README 更新为三个完整模块并保留后续扩展契约。
