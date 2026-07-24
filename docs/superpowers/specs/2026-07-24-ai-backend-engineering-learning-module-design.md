# AI 后端工程模块从零到一设计

## 1. Baseline

- 仓库：`Alex-loading/agent-development-knowledge-map`。
- 分支与工作区：`feat/ai-backend-engineering`，独立工作区 `.worktrees/ai-backend-engineering`，基线 `12d572a63a611a0a83ce2e1b600714cbd3b8effe`。
- 当前课程：`llm-foundation`、`agent-mechanism`、`agent-harness`、`context-rag-memory` 已注册且 active；`backend-engineering` 仅存在于模块目录，状态为 planned。
- 先修关系：`backend-engineering` 依赖 `agent-harness`，先修已经满足。
- 不得回归的契约：原生 ES Modules、深度冻结课程数据、六个通用学习视图、模块隔离进度、全局唯一 ID、canonical hash 路由、无 `innerHTML`、可访问交互与 320px/390px 响应式布局。
- 发布：Vercel 项目 `agent-development-knowledge-map` 是唯一生产部署；GitHub Pages 必须保持关闭；Production 必须 READY、可访问且 Git SHA 等于合并后的 `main`。

## 2. Learner contract

- 进入能力：理解 LLM、单 Agent 机制、Harness 中的 run 生命周期、预算、超时、重试、幂等、队列与背压。
- 终点能力：能够设计、解释和诊断一个面向多个客户端、可同步/流式响应、可异步执行、可取消、可恢复、可观测、可部署扩容的 AI 服务。
- 可观察综合项目：完成“AI 研究报告服务”的 OpenAPI、SSE、异步任务、存储、可靠性、健康检查、容量与部署设计包。
- 核心范围：HTTP API 契约；同步、SSE 与客户端断线；deadline、并发、限流与准入；异步任务和 worker；PostgreSQL 权威状态与 Redis 可重建缓存；重试、幂等和投递边界；生命周期、健康检查、指标与日志；负载测试、部署与扩容。
- 与 Harness 的边界：Harness 管理单个 Agent run 内部的状态、工具与恢复；本模块管理多个客户端、多个 run 和多个服务实例之间的公共接口、全局容量、broker–database 协调与部署生命周期。
- 不作为核心：自建 GPU 集群、深度 Kubernetes 运维、分布式训练、服务网格、完整安全合规平台。vLLM、Ray Serve、Docker 与 Kubernetes 只用于说明模型服务和部署边界。
- 时间敏感语义：框架版本、产品 API、模型/平台限额和部署行为标记 `verifiedAt: '2026-07-24'`；不把 Vercel、OpenAI 或具体模型的当前硬限制写成永久事实。

## 3. Research audit

研究分成官方规范、原始研究、工程实践三个并行流，由子代理发现候选，主代理逐项打开正文复核。已直接核验 OpenAPI 3.1.2、RFC 9110、WHATWG SSE、ASGI HTTP/Lifespan、Python asyncio、OpenAI Streaming/Background/Rate Limits、Celery Tasks/Optimizing、Redis Eviction/Semantic Cache、PostgreSQL Transactions、Kubernetes Probes、Prometheus Instrumentation、Google SRE Cascading Failures，以及 Tail at Scale、SEDA、DAGOR、MillWheel、Sarathi-Serve 的可访问正文或 PDF 页面。

### 中央主张与边界

1. OpenAPI 描述服务接口，但不会自动保证实现兼容、幂等或可靠。
2. SSE 是 UTF-8 `text/event-stream` 事件流；AI 应用仍需定义自己的 created/delta/completed/error/cancelled 语义。
3. 客户端断线、应用取消、上游取消与资源清理是不同事件；取消是协作式传播，不等于远端副作用被撤回。
4. `L = λW` 只描述稳态均值关系，不是 p95/p99 延迟公式；背压可以保护吞吐稳定，但不能保证低延迟。
5. 指数退避和 jitter 只能减轻同步重试，不会创造容量，也不会让非幂等副作用自动安全。
6. HTTP 幂等、broker 至少一次投递、应用去重和框架内部 exactly-once 属于不同边界；外部数据库、支付、邮件和工具调用需要单独协议。
7. Redis 缓存必须被视为非权威、可淘汰、可重建；任务状态、幂等记录和结果索引保存到事务性持久层。
8. readiness、liveness 和 startup 回答不同问题；健康检查不能用一次模型供应商抖动把所有健康实例同时杀死。
9. 论文数字只在其工作负载、硬件、独立性假设和实验设置中成立。Tail at Scale 的 fan-out 示例、DAGOR 的微信生产经验和 Sarathi-Serve 的 GPU 结果均不得外推成普适保证。

研究门禁通过：八节课的关键学习产出均有至少一项可访问官方或学术 core evidence；中文/视频/课程只作为 extension，不承担关键机制主张。

## 4. Curriculum rationale

课程采用“一次 AI 请求的生产生命周期”主线，而不是按框架堆叠：

1. **AI 服务边界与 API 契约**：从用户场景推导资源、端点、schema、错误模型和版本策略。
2. **同步、SSE 流式响应与取消**：建立响应模式、typed events、TTFT/完整延迟、断线与取消传播。
3. **并发、Deadline 与准入控制**：由到达率、服务时间和并发槽位推导容量、排队、限流和负载丢弃。
4. **异步任务、队列与 Worker**：设计 `202 Accepted → queued → running → terminal` 客户端可见状态机。
5. **PostgreSQL、Redis 与缓存正确性**：划分权威状态、事务边界、缓存键、TTL、淘汰、隔离和失效。
6. **重试、幂等与投递语义**：处理重复、未知结果、redelivery、worker 崩溃和外部副作用。
7. **生命周期、健康检查与可观测性**：设计 startup/readiness/liveness/shutdown/drain 与请求、流、队列、worker、缓存指标。
8. **部署、扩容与综合故障诊断**：完成负载测试、尾延迟、滚动发布、多副本和模型服务边界的综合设计。

每节 90–125 分钟，模块总计约 18–20 小时。每节提供至少两个目标、三个概念、两段基础解释、两道 quiz、三道独立面试题、两步练习、明确交付物与完成标准。

三项实验均是确定性教学模拟：

- `stream-lifecycle`：输入响应模式、事件节奏、断线点和上游取消能力，输出事件轨迹、客户端终态与清理动作。
- `service-admission`：输入到达率、服务时间、并发槽位、队列上限和 deadline，输出吞吐、排队、超时、拒绝与容量判断。
- `job-delivery-ledger`：在提交、入队、领取、执行、提交结果与确认阶段注入重复和崩溃，输出任务状态、投递决策、幂等账本与人工对账项。

实验不调用真实模型、队列、数据库或时钟，不声称能预测真实生产 p99、成本或恢复概率。

## 5. Coverage and evidence

模块使用 29 项核验资源，ID 统一为 `res-backend-*`：

- 规范与官方机制：OpenAPI 3.1.2、RFC 9110、RFC 6585、WHATWG SSE、ASGI HTTP、ASGI Lifespan、Python asyncio、Kubernetes Probes、Prometheus Instrumentation。
- AI/API 官方语义：OpenAI Streaming Responses、Background Mode、Rate Limits；FastAPI SSE 与容器部署。
- 任务与数据：Celery Tasks、Celery Optimizing、Redis Eviction、Redis Semantic Cache、PostgreSQL Transactions。
- 原始研究与工程书籍：Tail at Scale、SEDA、DAGOR、MillWheel、Sarathi-Serve、Google SRE Cascading Failures。
- 实现扩展：vLLM Architecture、vLLM OpenAI-compatible Server、Ray Serve Dynamic Request Batching、Dockerfile Reference、Datawhale LLM Universe。

资源条目含可归因来源、学习价值、证据边界和核验日期；课程 section 只能引用课程资源数组中存在的 ID。每项资源都有 evidence card：`authority`、`role`、`coverage`、`limitations`，时间敏感项带 `verifiedAt`。

八篇知识笔记使用 `$build-learning-module-notes` 的固定教学进程：先修桥接、直觉模型、准确机制、工程意义、具体例子、常见误区、回顾与下一课。每篇 20–30 分钟，4–7 个实质 section，每个 section 2–4 个短段落；quiz、面试追问和练习交付物必须能从正文推导，而不是依赖外链。

## 6. Architecture and ownership

新增：

- `src/data/backend-engineering.js`
- `src/data/backend-engineering-notes.js`
- `src/data/backend-engineering-notes/backend-01.js` 至 `backend-08.js`
- `src/core/backend-engineering.js`
- `src/ui/backend-experiments.js`
- `tests/backend-engineering-data.test.js`
- `tests/backend-engineering.test.js`

集成修改：

- `src/data/courses.js`
- `src/data/modules.js`
- `src/ui/experiments.js`
- `styles/app.css`
- `tests/course-registry.test.js`
- `tests/data.test.js`
- `tests/ui-interactions.test.js`
- `tests/static-app.test.js`
- `README.md`

稳定 ID：

- Lesson：`backend-01` 至 `backend-08`
- Resource：`res-backend-*`
- Quiz：`quiz-backend-*`
- Interview：`iq-backend-01-1` 至 `iq-backend-08-3`
- Experiment：`stream-lifecycle`、`service-admission`、`job-delivery-ledger`

执行采用子代理驱动：每个任务先由作者按 TDD 实现，再由独立规格审查者检查需求覆盖，最后由独立质量审查者检查正确性、可维护性、证据与安全。共享 registry、模块状态和 README 只在全部内容门禁通过后激活。

## 7. TDD and verification

RED 测试先于生产代码：

- 数据测试：8 节、29 资源、24 面试题、16 quiz、8 篇知识笔记、evidence 可解析、资源使用率、全局 ID 唯一和深度冻结。
- 纯逻辑测试：流式终态与断线/取消竞态；容量数学、deadline、拒绝和边界校验；任务 redelivery、未知结果、去重和账本不变式。
- UI 测试：三项实验真实 DOM 操作、reset、label、live region、键盘与焦点。
- 集成测试：第五课程 registry、canonical route、六视图、独立进度、资源与面试筛选。
- 静态测试：无 `innerHTML`/内联事件、无通用视图模块硬编码、README 计数一致。

验证命令：

- 目标 `node --test ...`
- `npm test`
- `node --check` 针对全部新增/修改 JS
- `git diff --check`
- 本地静态服务器浏览器验收

浏览器矩阵：桌面与 390px、320px；第五模块 dashboard/curriculum/lesson/resources/interviews/progress；三项实验；quiz、进度与重置；单一 `h1`、无横向滚动、无控制台错误、控件最小触控高度和 reduced-motion。

## 8. Activation and release

`backend-engineering` 只有在研究、数据、知识笔记、实验、回归和浏览器门禁全部通过后，才加入 `courseRegistry` 并从 planned 切到 active。

发布流程：

1. 将 feature branch 同步最新 `origin/main`，解决冲突并重跑测试。
2. 推送并创建 PR，检查 CI 和 Vercel Preview。
3. 独立最终代码审查无 Critical/Important 遗留后合并。
4. 在最新 main 上重跑测试。
5. 部署 Vercel Production，等待 READY。
6. 核验 canonical URL 可访问、模块 route 可学习、部署 metadata Git SHA 等于合并 SHA。
7. 核验 GitHub Pages 仍关闭。

用户已经明确要求不中途验收并持续到部署完成，因此不会在任务间暂停询问。

## 9. Stop conditions

- 任一关键 assessed outcome 只有 metadata、视频或未访问正文支持：停止发布并补充 core evidence。
- 任一知识笔记 source ID 不能同时解析到 lesson evidence 与课程资源 registry：停止激活。
- 质量分低于 85/100、存在 course-field 伪证据、版权复制或未标注时效边界：停止发布。
- 测试失败、浏览器控制台错误、移动端横向溢出、Critical/Important review 未解决：停止合并。
- Vercel 非 READY、Production SHA 不匹配、canonical route 不可达或 Pages 被启用：停止宣布完成。

