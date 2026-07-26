# AI 后端工程知识笔记内容审计

- 审计日期：2026-07-24
- 模块：`backend-engineering`
- 审计基线：`0dbd658`
- 审计对象：8 课课程字段、8 篇 `knowledgeNote`、37 条资源、88 条 assessed coverage row，以及与本模块有关的核心模拟、三项实验和静态 UI 测试
- 发布结论：**内容发布门通过**。8 篇笔记均达到 85/100 的最低门槛；assessed coverage gap、broken resource reference、section source reference error 与 course-field-as-evidence violation 均为 0。

## 1. 发布门与数据盘点

本审计把课程字段视为“需要被解释和验证的学习要求”，不把它们反过来当作证据。每条 objective、quiz、interview question、exercise step 与 completion criterion 都必须落到笔记 section，并由该 section 使用的外部 source ID 支撑。最终得到 8 课 × 11 条 = 88 条 assessed row，88/88 均有有效 section 与外部证据。

| 检查项 | 实际值 | 结论 |
| --- | ---: | --- |
| 课程 / 笔记 | 8 / 8 | 通过 |
| assessed coverage row | 88 | 88/88 通过 |
| 资源 | 37 | 37/37 被课程与笔记实际使用 |
| 证据权威层级 | official 27 / academic 8 / expert 1 / community 1 | 通过 |
| 证据角色 | core 22 / cross-check 14 / extension 1 | 通过 |
| broken resource reference | 0 | 通过 |
| broken note-section source reference | 0 | 通过 |
| assessed coverage gap | 0 | 通过 |
| course field 被当作外部证据 | 0 | 通过 |

8 篇笔记都包含引言、6 个 section、每节 3 段、5 个 misconception、6 条 recap 和可执行 next step。

| 课次 | 阅读时长 | 正文字符 | section / 每节段落 | misconception / recap | 笔记引用资源 |
| --- | ---: | ---: | --- | --- | ---: |
| backend-01 | 24 分钟 | 2680 | 6 / 3 | 5 / 6 | 5 |
| backend-02 | 25 分钟 | 2768 | 6 / 3 | 5 / 6 | 5 |
| backend-03 | 26 分钟 | 2465 | 6 / 3 | 5 / 6 | 7 |
| backend-04 | 27 分钟 | 2681 | 6 / 3 | 5 / 6 | 6 |
| backend-05 | 25 分钟 | 2590 | 6 / 3 | 5 / 6 | 5 |
| backend-06 | 27 分钟 | 2507 | 6 / 3 | 5 / 6 | 7 |
| backend-07 | 26 分钟 | 2695 | 6 / 3 | 5 / 6 | 5 |
| backend-08 | 28 分钟 | 2785 | 6 / 3 | 5 / 6 | 10 |

## 2. 37 条资源使用账本

下表的“覆盖行”是该资源直接参与的 assessed row 数，不是引用次数。37 条资源全部出现在相应 lesson 的 `resourceIds`，也全部出现在至少一个实质性笔记 section 的 `sourceIds`。其中 OpenAI rate limits 文档用于限流 section 的实现交叉检查，Datawhale 仅承担中文延伸导航；二者不被硬塞进 assessed row，所以覆盖行可以为 0。

| 资源 ID | authority / role | 使用课次 | 覆盖行 |
| --- | --- | --- | ---: |
| `res-backend-openapi` | official / core | B01, B08 | 11 |
| `res-backend-rfc9110` | official / core | B01, B06 | 10 |
| `res-backend-rfc6585` | official / core | B01, B03 | 3 |
| `res-backend-whatwg-sse` | official / core | B02 | 6 |
| `res-backend-asgi-http` | official / core | B02 | 5 |
| `res-backend-asgi-lifespan` | official / core | B07 | 4 |
| `res-backend-python-asyncio` | official / core | B02 | 4 |
| `res-backend-kubernetes-probes` | official / core | B07 | 6 |
| `res-backend-prometheus` | official / core | B07 | 5 |
| `res-backend-openai-streaming` | official / cross-check | B02 | 2 |
| `res-backend-openai-background` | official / cross-check | B04 | 4 |
| `res-backend-openai-rate-limits` | official / cross-check | B03 | 0 |
| `res-backend-fastapi-sse` | official / cross-check | B02 | 1 |
| `res-backend-fastapi-containers` | official / cross-check | B08 | 3 |
| `res-backend-celery-tasks` | official / core | B04, B06 | 12 |
| `res-backend-celery-optimizing` | official / core | B04 | 3 |
| `res-backend-redis-eviction` | official / core | B05 | 6 |
| `res-backend-redis-semantic-cache` | official / cross-check | B05 | 6 |
| `res-backend-postgres-transactions` | official / core | B05, B06 | 9 |
| `res-backend-tail-at-scale` | academic / core | B03 | 3 |
| `res-backend-seda` | academic / core | B04 | 2 |
| `res-backend-dagor` | academic / core | B03 | 3 |
| `res-backend-millwheel` | academic / cross-check | B04, B06 | 5 |
| `res-backend-sarathi` | academic / cross-check | B08 | 1 |
| `res-backend-sre-cascading` | expert / core | B03, B06, B07 | 11 |
| `res-backend-vllm-architecture` | official / cross-check | B08 | 2 |
| `res-backend-vllm-server` | official / cross-check | B07, B08 | 4 |
| `res-backend-ray-batching` | official / cross-check | B08 | 1 |
| `res-backend-datawhale` | community / extension | B01, B08 | 0 |
| `res-backend-little-law` | academic / core | B03 | 4 |
| `res-backend-aws-idempotent-apis` | official / core | B01, B06 | 9 |
| `res-backend-aws-transactional-outbox` | official / core | B05, B06 | 3 |
| `res-backend-chubby` | academic / cross-check | B04 | 3 |
| `res-backend-docker-build-best-practices` | official / core | B08 | 1 |
| `res-backend-coordinated-omission` | academic / cross-check | B03, B08 | 6 |
| `res-backend-vllm-performance-tpot` | official / cross-check | B08 | 5 |
| `res-backend-go-singleflight` | official / core | B05 | 1 |

## 3. 证据角色修正历程

| 主题 | 修正后的证据角色与落点 | 明确边界 |
| --- | --- | --- |
| Little's Law | 新增 Columbia 学术资料，标为 academic/core，支撑 B03 的排队直觉、quiz、interview 与验收 | 只连接稳态长期均值，不预测 p95/p99，也不替代非稳态或分布级实验 |
| Idempotency | AWS Builders' Library 标为 official/core，支撑 client request ID、same ID/different intent、late arrival 与 unknown outcome | 不是互联网标准；幂等键作用域、保留期和过期行为仍由项目定义并验证 |
| Transactional outbox | AWS Prescriptive Guidance 标为 official/core，落到 B05 事务边界和 B06 outbox 面试/验收 | 解决数据库事实与待发布消息的双写窗口；relay 仍可能重复，不能宣称普适 exactly-once |
| Chubby | Chubby 论文标为 academic/cross-check，支撑 sequencer/generation 与 stale holder rejection | 不是所有 broker lease/fencing 的统一规范；资源侧必须实际校验代次 |
| Docker | Docker build best practices 标为 official/core，支撑 B08 的 `USER`、构建缓存与可复现构建讨论 | 属当前版本构建指导，不覆盖所有运行时隔离和供应链策略 |
| Coordinated omission | University of Hamburg 学术资料标为 academic/cross-check，支撑 B03/B08 压测方法 | 说明闭环同步生成器会漏记本应到达的请求；论文的数据库实验结果不是 LLM 性能数字 |
| TPOT | vLLM Spyre 文档标为 official/cross-check，校准 TTFT、ITL、TPOT、E2EL 定义 | 文档与插件/后端版本相关，不能假设所有推理栈实现和统计口径相同 |
| Singleflight | Go `x/sync/singleflight` 标为 official/core，支撑 B05 同进程 miss 合并 | 只抑制同进程同 key 的并发函数调用并共享结果，不是分布式锁、跨实例持久化或故障恢复机制 |

## 4. Assessed outcome → note section → evidence 覆盖矩阵

每课固定审计 11 行：2 objective、2 quiz、3 interview、2 exercise step、2 completion criterion。字段文本由课程对象承载；下表记录它被解释到哪个笔记 section，以及该 section 对应的外部证据。缩写 `obj/q/int/ex/cc` 仅用于提高矩阵可读性。

### backend-01 — AI 服务边界与 API 契约

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | HTTP 资源与操作契约 | `service-boundary` | OpenAPI, RFC 9110 |
| obj1 | 区分描述、兼容、幂等、可靠性 | `openapi-contract` | OpenAPI |
| q0 | OpenAPI 能实际保证什么 | `openapi-contract` | OpenAPI |
| q1 | 长任务 POST 的身份、状态与重复提交 | `resource-state` | AWS idempotent APIs, OpenAPI |
| int0 | 为多租户研究服务划边界 | `service-boundary` | OpenAPI, RFC 9110 |
| int1 | 让 schema 演进保持兼容 | `openapi-contract` | OpenAPI |
| int2 | unknown outcome 下的安全重试 | `resource-state` | AWS idempotent APIs, RFC 9110 |
| ex0 | 写 schema、端点、状态码与错误 envelope | `contract-review` | OpenAPI, RFC 9110 |
| ex1 | 写兼容、重复、未知与超限验收例 | `resource-state` | AWS idempotent APIs |
| cc0 | 可解析、资源语义一致的 OpenAPI | `openapi-contract` | OpenAPI |
| cc1 | 解释描述、HTTP 幂等与业务可靠性边界 | `resource-state` | AWS idempotent APIs, RFC 9110 |

### backend-02 — 流式响应、断线与取消

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 解释 SSE 增量事件和最终状态 | `streaming-model` | WHATWG SSE, OpenAI streaming |
| obj1 | 传播断线、取消与 deadline | `asgi-disconnect` | ASGI HTTP, Python asyncio |
| q0 | SSE wire format | `sse-wire-format` | WHATWG SSE |
| q1 | ASGI disconnect 的含义 | `asgi-disconnect` | ASGI HTTP |
| int0 | 流事件与业务资源状态如何对齐 | `streaming-model` | WHATWG SSE, OpenAI streaming |
| int1 | cooperative cancellation | `cooperative-cancellation` | Python asyncio, ASGI HTTP |
| int2 | 断线重连与事件身份 | `streaming-model` | WHATWG SSE |
| ex0 | 定义客户端事件与重连契约 | `client-contract` | WHATWG SSE, FastAPI SSE |
| ex1 | 模拟 abort、disconnect 与清理 | `cooperative-cancellation` | Python asyncio, ASGI HTTP |
| cc0 | 能解释完整客户端流契约 | `client-contract` | WHATWG SSE |
| cc1 | 能说明断线信号与资源释放边界 | `asgi-disconnect` | ASGI HTTP, Python asyncio |

### backend-03 — 容量、限流与背压

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 用到达率、服务时间、并发建立容量直觉 | `queueing-intuition` | Little's Law |
| obj1 | 设计按租户/成本的 admission control | `admission-control` | RFC 6585, DAGOR |
| q0 | Little's Law 的适用条件 | `queueing-intuition` | Little's Law |
| q1 | 重试如何放大级联故障 | `overload-loop` | Google SRE |
| int0 | 估算稳定系统平均并发 | `queueing-intuition` | Little's Law |
| int1 | 公平准入与 429 契约 | `admission-control` | RFC 6585, DAGOR |
| int2 | 识别过载反馈环 | `overload-loop` | Google SRE |
| ex0 | 运行容量/尾延迟实验 | `capacity-experiment` | Tail at Scale, Google SRE, coordinated omission |
| ex1 | 给不同成本请求设置 admission policy | `admission-control` | RFC 6585, DAGOR |
| cc0 | 用实验说明拐点与测量偏差 | `capacity-experiment` | Tail at Scale, Google SRE, coordinated omission |
| cc1 | 区分均值关系和尾延迟 | `queueing-intuition` | Little's Law, Tail at Scale |

### backend-04 — 异步任务、队列与 worker

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 定义 job 状态、轮询与后台契约 | `job-contract` | OpenAI background, Celery tasks |
| obj1 | 处理 worker lease、迟到提交与 fencing | `worker-lease` | Celery tasks, Chubby |
| q0 | background job 的资源语义 | `job-contract` | OpenAI background |
| q1 | 预取、队列和 worker 容量 | `queue-capacity` | Celery optimizing, SEDA |
| int0 | 设计可查询异步任务 API | `job-contract` | OpenAI background, Celery tasks |
| int1 | retry route 与 poison job | `retry-routing` | Celery tasks, Celery optimizing |
| int2 | 有界队列和隔离 | `queue-capacity` | Celery optimizing, SEDA |
| ex0 | 模拟 lease 过期和 stale worker | `worker-lease` | Celery tasks, Chubby |
| ex1 | 留下可重放的运营证据 | `operational-proof` | MillWheel, Celery tasks |
| cc0 | 交付 job contract | `job-contract` | OpenAI background, Celery tasks |
| cc1 | 解释 lease/fencing 的安全边界 | `worker-lease` | Chubby, Celery tasks |

### backend-05 — 数据库、缓存与一致性

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 划分数据库事实与缓存副本 | `source-of-truth` | PostgreSQL transactions, Redis eviction |
| obj1 | 定义 semantic cache 的相似度与失效边界 | `semantic-cache` | Redis semantic cache, Redis eviction |
| q0 | source of truth 与 eviction | `source-of-truth` | PostgreSQL transactions, Redis eviction |
| q1 | semantic cache 风险 | `semantic-cache` | Redis semantic cache |
| int0 | 事务、双写与 outbox | `transaction-boundary` | PostgreSQL transactions, AWS outbox |
| int1 | 相似查询能否共享结果 | `semantic-cache` | Redis semantic cache |
| int2 | 权限、模型版本和 cache key | `semantic-cache` | Redis semantic cache |
| ex0 | 实现 cache-aside 与 miss 合并 | `cache-aside` | PostgreSQL transactions, Redis eviction, Go singleflight |
| ex1 | 设计一致性与失效测试 | `consistency-tests` | PostgreSQL transactions, Redis semantic cache |
| cc0 | 用故障例证明缓存不是事实源 | `consistency-tests` | PostgreSQL transactions, Redis eviction |
| cc1 | 说明语义缓存的质量/隔离边界 | `semantic-cache` | Redis semantic cache, Redis eviction |

### backend-06 — 重试、幂等与投递语义

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 设计幂等键、请求指纹和 ledger | `idempotency-ledger` | RFC 9110, PostgreSQL transactions, AWS idempotent APIs |
| obj1 | 处理 timeout 后 unknown outcome | `unknown-outcome` | RFC 9110, Google SRE, AWS idempotent APIs |
| q0 | at-least-once 与 exactly-once 边界 | `delivery-semantics` | Celery tasks, MillWheel |
| q1 | unknown outcome 的正确响应 | `unknown-outcome` | RFC 9110, Google SRE, AWS idempotent APIs |
| int0 | broker 重投与消费幂等 | `delivery-semantics` | Celery tasks, MillWheel |
| int1 | 安全重试预算 | `unknown-outcome` | RFC 9110, Google SRE, AWS idempotent APIs |
| int2 | outbox 解决哪个双写窗口 | `transactional-outbox` | AWS outbox, PostgreSQL transactions |
| ex0 | 推进 delivery ledger 状态机 | `assurance-experiment` | Celery tasks, MillWheel |
| ex1 | 模拟超时、迟到与重复提交 | `unknown-outcome` | RFC 9110, Google SRE, AWS idempotent APIs |
| cc0 | 能解释实验能证明与不能证明什么 | `assurance-experiment` | Celery tasks, MillWheel |
| cc1 | 能说明 outbox relay 仍会重复 | `transactional-outbox` | AWS outbox, PostgreSQL transactions |

### backend-07 — 生命周期、探针与可观测性

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 对齐 ASGI lifecycle 与 K8s probes | `lifecycle-contract` | ASGI lifespan, Kubernetes probes |
| obj1 | 从用户体验建立指标和告警 | `observability-model` | Prometheus, vLLM server |
| q0 | startup/readiness/liveness 的区别 | `probe-semantics` | Kubernetes probes, Google SRE |
| q1 | counter、gauge、histogram 选择 | `observability-model` | Prometheus |
| int0 | 设计不放大故障的探针 | `probe-semantics` | Kubernetes probes |
| int1 | graceful shutdown 与 draining | `shutdown-draining` | ASGI lifespan, Kubernetes probes |
| int2 | 推理服务的观测维度 | `observability-model` | Prometheus, vLLM server |
| ex0 | 模拟启动、ready、drain、stop | `lifecycle-contract` | ASGI lifespan, Kubernetes probes |
| ex1 | 写症状型 alerts 与 runbook | `alerts-runbook` | Prometheus, Google SRE |
| cc0 | 能证明 shutdown 不接新流量 | `shutdown-draining` | ASGI lifespan, Kubernetes probes |
| cc1 | 能从告警追到可执行排障步骤 | `alerts-runbook` | Prometheus, Google SRE |

### backend-08 — 压测、推理性能与部署

| assessed field | 学习要求摘要 | note section | evidence |
| --- | --- | --- | --- |
| obj0 | 设计避免 coordinated omission 的压测 | `load-test-design` | coordinated omission, vLLM TPOT |
| obj1 | 交付容器边界与可复现部署 | `container-contract` | Docker best practices, FastAPI containers |
| q0 | continuous batching 的吞吐/延迟权衡 | `batching-scheduling` | Ray batching, Sarathi |
| q1 | 部署时仍要守住 API contract | `deployment-checklist` | FastAPI containers, OpenAPI |
| int0 | TTFT/ITL/TPOT/E2EL 与压测方法 | `load-test-design` | coordinated omission, vLLM TPOT |
| int1 | 推理服务调度和扩缩容 | `inference-serving` | vLLM architecture, vLLM server |
| int2 | 用指标解释用户等待 | `load-test-design` | vLLM TPOT, vLLM server |
| ex0 | 运行 open-loop/closed-loop 对照 | `load-test-design` | coordinated omission, vLLM TPOT |
| ex1 | 写容器与发布验收清单 | `deployment-checklist` | FastAPI containers, OpenAPI |
| cc0 | 能为服务设计作证据化答辩 | `design-defense` | OpenAPI, vLLM architecture |
| cc1 | 能解释测试方法、指标与边界 | `load-test-design` | vLLM TPOT, coordinated omission |

矩阵结果：每课 11/11，合计 88/88；不存在落到不存在 section、引用不存在 resource、或只用课程字段自证的行。

## 5. 逐篇 100 分质量评分

评分按 release gate 的五个维度执行：Coverage 25、Structure 20、Sources 25、Teaching quality 20、Data contract 10。每篇必须不低于 85 分。

| 笔记 | Coverage | Structure | Sources | Teaching | Contract | 总分 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| backend-01 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-02 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-03 | 25 | 20 | 23 | 19 | 10 | **97** |
| backend-04 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-05 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-06 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-07 | 25 | 20 | 24 | 19 | 10 | **98** |
| backend-08 | 25 | 19 | 24 | 19 | 10 | **97** |

扣分是有意保留的可信度边界：

- 所有笔记 Sources 扣 1，是因为规范、产品文档和论文只能支撑各自范围内的主张，不能替当前项目制造生产证明。
- backend-03 再扣 1 分，原因是排队理论和 coordinated omission 研究需要迁移到本地 workload 验证，当前确定性 admission 模型不能预测尾延迟。
- Teaching 每篇扣 1，反映六节内容密度仍高，虽有 misconception、recap、实验和 next step，但不能替代实际运行与评审。
- backend-08 Structure 扣 1，反映该课同时覆盖压测、推理调度、容器和发布，跨度大于其他课程。

最低分 97，8/8 通过 85 分发布门。

## 6. 时效、版权与证据边界

37 条资源及其 evidence metadata 的 `verifiedAt` 均为 2026-07-24。RFC、OpenAPI、WHATWG、ASGI 等规范可提供相对稳定的语义基线，但不保证项目实现合规；OpenAI Responses streaming/background/rate limits、FastAPI、Celery、Redis、Kubernetes、Docker、vLLM 与 Ray 的产品行为、接口和默认值会变化。尤其 vLLM Spyre 的 TPOT 资料与特定插件/后端版本有关，模型、硬件、batch、输入输出长度和调度策略相关论文也不能外推为普适性能结论。未来改写课程或发布长期版本前，应重新核验这些时效敏感来源。

笔记正文为中文原创综合与教学改写，没有复制论文、规范或产品文档的长段原文；保留的只是协议名、产品名、指标名和必要的短标签。每个 section 通过 source ID 给出来源归属和适用边界，不以“大段引用”代替解释。课程 objective、quiz、interview、exercise 和 completion criterion 只是覆盖输入，不被登记成外部证据。

当前剩余的非阻断维护成本是：8 篇笔记存在重复的 `deepFreeze` 与 test-audit 结构。它不影响本次内容正确性和数据契约，但后续若抽公共 helper，必须保证静态浏览器加载路径和不可变性测试不退化。

## 7. 核心模拟与三项实验的已证事实

| 实验 / 核心函数 | 自动化已证明 | 确定性边界 |
| --- | --- | --- |
| stream lifecycle / `simulateStreamLifecycle` | 8 个核心测试覆盖事件推进、终态、断线和非法输入；对应渲染器为 `stream-lifecycle` | 纯确定性事件/状态模拟；没有真实网络、模型、代理、时钟或计费。客户端断线不等于上游副作用已经取消 |
| service admission / `evaluateServiceAdmission` | 7 个核心测试覆盖容量信用、接受/拒绝及输入边界；对应渲染器为 `service-admission` | 使用平均服务时间的确定性 admission-window 信用模型；不是到达分布或队列模拟器，不预测 p95/p99 |
| job delivery / `advanceJobDelivery` | 13 个核心测试覆盖接受、投递、超时、重试、完成与拒绝；对应渲染器为 `job-delivery-ledger` | 纯内存确定性 delivery state machine；没有真实 broker、数据库事务、lease clock 或外部副作用，不能证明 exactly-once |

核心 ledger 最多保留 256 条；第三项实验 UI 的 attempt history 最多显示 24 条。非法或被拒绝的 UI 尝试不会修改核心状态。静态 Fake DOM 测试验证的是渲染、交互和可访问性契约；后续真实浏览器验收另行记录，仍不等于端到端生产网络证明。

## 8. 测试审计

在审计基线上实际执行：

| 命令 | 结果 |
| --- | --- |
| `node --test tests/backend-engineering-data.test.js` | 9/9 passed |
| `node --test tests/backend-engineering.test.js` | 28/28 passed（stream 8、admission 7、delivery 13） |
| `node --test tests/static-app.test.js tests/ui-interactions.test.js` | 74/74 passed |
| `npm test` | 319/319 passed |

因此可以确认数据契约、88 条映射、资源引用、三个确定性核心及静态 UI 回归在本地自动化范围内通过。这个结论不扩大到尚未执行的生产部署环境。

## 9. 浏览器与部署状态

在 `http://localhost:4173` 上使用真实浏览器完成以下验收：

- 桌面 1280×720：`backend-engineering` dashboard、8 课学习主线、知识地图、37 项资源库、24 道面试题、学习进度均只有一个 `h1`，无横向溢出。
- `stream-lifecycle`：在第 1 个 delta 后断线，得到 `created → delta → disconnected`、客户端 `disconnected`、上游 `cancelled` 与完整清理动作；reset 恢复默认并把焦点放回响应模式。
- `service-admission`：把到达率改为 20 req/s 后，账本显示 8 immediate、3 queued、9 rejected，并保留“均值模型不预测 p95/p99”的边界。
- `job-delivery-ledger`：先执行非法 `ack`，UI 保留 `ui-01-ack · rejected` 且核心仍为 `empty`；随后执行 submit、enqueue、lease、start、commit、crash、reconcile，最终恢复 `committed`，客户端、消息、effect 与幂等四个事实边界分别展示。
- 课程测验：backend-02 两题提交后显示 2/2（100%）及逐题解释。
- 390×844 与 320×800：dashboard 和 backend-06 课程无横向溢出；实验 grid 为单列；按钮与输入最小高度均至少 44px；长 ID 可换行。390px 与 320px 截图中的课程卡片和知识笔记正文可读。
- 浏览器控制台：warning/error 为 0。

浏览器发布门通过。当前仍**没有**创建或核验 Vercel Preview/Production 部署、公开可达 URL、部署 SHA 或 GitHub Pages 状态；这些属于后续发布流程，不能从本地浏览器结果推断为已完成。

最终本地发布记录：8 篇笔记 8/8 通过，最低 97/100；37/37 资源实际使用；88/88 assessed row 有 note section 与外部证据；broken refs = 0；自动化 319/319；桌面、390px 与 320px 浏览器门通过。部署门保持未完成状态。
