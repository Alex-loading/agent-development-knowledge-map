import { backendEngineeringNotes } from './backend-engineering-notes.js';

const VERIFIED_AT = '2026-07-24';
const officialBoundary = '证据边界：该资料描述当前规范、产品或框架语义，具体接口与版本仍会变化，项目实现不等于通用规范。';
const researchBoundary = '证据边界：研究结论绑定论文的工作负载、硬件、模型与实验设置，不可外推为所有 AI 服务的普适保证。';
const engineeringBoundary = '证据边界：工程经验用于建立风险模型，不构成任意系统都能复现的性能或可靠性承诺。';
const courseBoundary = '证据边界：开源课程用于中文学习导航，不承担 assessed outcome 的核心机制主张或生产质量保证。';

const resourceCatalog = [
  { id: 'res-backend-openapi', title: 'OpenAPI Specification 3.1.2', url: 'https://spec.openapis.org/oas/v3.1.2.html', source: 'OpenAPI Initiative', language: '英文', type: '开放规范', difficulty: '进阶', stage: 'API 契约', value: `学习用途：定义路径、操作、schema、响应与安全描述的机器可读接口；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-rfc9110', title: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', source: 'IETF', language: '英文', type: '开放规范', difficulty: '进阶', stage: 'HTTP 语义', value: `学习用途：核对方法、状态码、幂等与缓存等 HTTP 语义；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-rfc6585', title: 'RFC 6585: Additional HTTP Status Codes', url: 'https://www.rfc-editor.org/rfc/rfc6585.html', source: 'IETF', language: '英文', type: '开放规范', difficulty: '进阶', stage: '限流响应', value: `学习用途：理解 429 与 Retry-After 的协议语义；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-whatwg-sse', title: 'Server-sent events', url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html', source: 'WHATWG', language: '英文', type: '开放规范', difficulty: '进阶', stage: 'SSE', value: `学习用途：理解 EventSource、text/event-stream、事件字段与重连语义；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-asgi-http', title: 'ASGI HTTP and WebSocket Specification', url: 'https://asgi.readthedocs.io/en/latest/specs/www.html', source: 'ASGI', language: '英文', type: '官方文档', difficulty: '进阶', stage: '应用协议', value: `学习用途：理解 HTTP request/response、disconnect 与 ASGI 消息边界；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-asgi-lifespan', title: 'ASGI Lifespan Protocol', url: 'https://asgi.readthedocs.io/en/latest/specs/lifespan.html', source: 'ASGI', language: '英文', type: '官方文档', difficulty: '进阶', stage: '生命周期', value: `学习用途：学习应用 startup 与 shutdown 生命周期消息；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-python-asyncio', title: 'Coroutines and Tasks', url: 'https://docs.python.org/3/library/asyncio-task.html', source: 'Python', language: '英文', type: '官方文档', difficulty: '进阶', stage: '并发与取消', value: `学习用途：理解 Task、timeout、TaskGroup 与协作式 cancellation；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-kubernetes-probes', title: 'Configure Liveness, Readiness and Startup Probes', url: 'https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/', source: 'Kubernetes', language: '英文', type: '官方文档', difficulty: '进阶', stage: '健康检查', value: `学习用途：区分 startup、readiness 与 liveness 的编排行为；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-prometheus', title: 'Instrumentation', url: 'https://prometheus.io/docs/practices/instrumentation/', source: 'Prometheus', language: '英文', type: '官方文档', difficulty: '进阶', stage: '可观测性', value: `学习用途：为 online serving、offline processing 与 batch job 选择关键指标；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-openai-streaming', title: 'Streaming API responses', url: 'https://developers.openai.com/api/docs/guides/streaming-responses', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: 'AI 流式接口', value: `学习用途：对照当前 Responses API 的流式事件与客户端消费方式；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-openai-background', title: 'Background mode', url: 'https://developers.openai.com/api/docs/guides/background', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '异步 AI 任务', value: `学习用途：对照长任务后台执行、轮询与取消的产品接口；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-openai-rate-limits', title: 'Rate limits', url: 'https://developers.openai.com/api/docs/guides/rate-limits', source: 'OpenAI Developers', language: '英文', type: '官方文档', difficulty: '进阶', stage: '限流', value: `学习用途：理解当前平台限额、响应头与退避建议；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-fastapi-sse', title: 'Server-Sent Events (SSE)', url: 'https://fastapi.tiangolo.com/tutorial/server-sent-events/', source: 'FastAPI', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: 'SSE 实作', value: `学习用途：观察 FastAPI 生成 typed SSE event 的当前实现；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-fastapi-containers', title: 'FastAPI in Containers - Docker', url: 'https://fastapi.tiangolo.com/deployment/docker/', source: 'FastAPI', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '容器部署', value: `学习用途：学习镜像构建、进程、内存与集群复制边界；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-celery-tasks', title: 'Tasks', url: 'https://docs.celeryq.dev/en/stable/userguide/tasks.html', source: 'Celery', language: '英文', type: '官方文档', difficulty: '进阶', stage: '任务可靠性', value: `学习用途：理解 task retry、acknowledgement 与幂等要求；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-celery-optimizing', title: 'Optimizing', url: 'https://docs.celeryq.dev/en/stable/userguide/optimizing.html', source: 'Celery', language: '英文', type: '官方文档', difficulty: '进阶', stage: '队列容量', value: `学习用途：分析 prefetch、并发、长短任务路由与队列增长；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-redis-eviction', title: 'Key eviction', url: 'https://redis.io/docs/latest/develop/reference/eviction/', source: 'Redis', language: '英文', type: '官方文档', difficulty: '进阶', stage: '缓存淘汰', value: `学习用途：理解 maxmemory 与 eviction policy 对缓存数据的影响；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-redis-semantic-cache', title: 'Redis semantic cache', url: 'https://redis.io/docs/latest/develop/use-cases/semantic-cache/', source: 'Redis', language: '英文', type: '官方文档', difficulty: '进阶', stage: 'AI 缓存', value: `学习用途：学习相似度阈值、TTL 与 tenant/model/safety 硬隔离；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-postgres-transactions', title: 'Transactions', url: 'https://www.postgresql.org/docs/current/tutorial-transactions.html', source: 'PostgreSQL', language: '英文', type: '官方文档', difficulty: '进阶', stage: '权威状态', value: `学习用途：理解事务的 all-or-nothing、可见性与 savepoint；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-tail-at-scale', title: 'The Tail at Scale', url: 'https://research.google/pubs/the-tail-at-scale/', source: 'Google Research', language: '英文', type: '研究论文', difficulty: '深挖', stage: '尾延迟', value: `学习用途：理解 fan-out 服务中尾延迟的放大与缓解思路；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-seda', title: 'SEDA: An Architecture for Well-Conditioned, Scalable Internet Services', url: 'https://www.sosp.org/2001/papers/welsh.pdf', source: 'SOSP', language: '英文', type: '研究论文', difficulty: '深挖', stage: '分阶段服务', value: `学习用途：理解 stage、queue 与资源控制的服务架构；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-dagor', title: 'DAGOR: A Highly Available and Scalable RPC System for WeChat', url: 'https://arxiv.org/abs/1806.04075', source: 'Tencent / arXiv', language: '英文', type: '研究论文', difficulty: '深挖', stage: '过载控制', value: `学习用途：分析入口准入、业务优先级和过载传播；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-millwheel', title: 'MillWheel: Fault-Tolerant Stream Processing at Internet Scale', url: 'https://research.google/pubs/millwheel-fault-tolerant-stream-processing-at-internet-scale/', source: 'Google Research', language: '英文', type: '研究论文', difficulty: '深挖', stage: '投递与幂等', value: `学习用途：理解持久状态、重复记录与 exactly-once 处理语义的系统边界；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-sarathi', title: 'Sarathi-Serve: Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve', url: 'https://www.usenix.org/conference/osdi24/presentation/agrawal', source: 'USENIX OSDI', language: '英文', type: '研究论文', difficulty: '深挖', stage: 'LLM Serving', value: `学习用途：理解 LLM serving 中 prefill/decode 调度与吞吐—延迟权衡；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-sre-cascading', title: 'Addressing Cascading Failures', url: 'https://sre.google/sre-book/addressing-cascading-failures/', source: 'Google SRE', language: '英文', type: '工程书籍', difficulty: '进阶', stage: '级联故障', value: `学习用途：建立过载、重试风暴、健康检查与负载丢弃的风险模型；${engineeringBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-vllm-architecture', title: 'Architecture Overview', url: 'https://docs.vllm.ai/en/latest/design/arch_overview/', source: 'vLLM', language: '英文', type: '官方文档', difficulty: '进阶', stage: '模型服务实现', value: `学习用途：观察 API server、engine core、scheduler、KV cache 与 GPU worker 的当前进程拓扑；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-vllm-server', title: 'Online Serving', url: 'https://docs.vllm.ai/en/stable/serving/openai_compatible_server/', source: 'vLLM', language: '英文', type: '官方文档', difficulty: '进阶', stage: '模型服务接口', value: `学习用途：观察 OpenAI-compatible endpoint、health、load 与 metrics；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-ray-batching', title: 'Dynamic Request Batching', url: 'https://docs.ray.io/en/latest/serve/advanced-guides/dyn-req-batch.html', source: 'Ray Serve', language: '英文', type: '官方文档', difficulty: '进阶', stage: '动态批处理', value: `学习用途：观察请求入队、batch wait、batch size 与拆分响应的当前实现；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-datawhale', title: 'LLM Universe', url: 'https://github.com/datawhalechina/llm-universe', source: 'Datawhale', language: '中文', type: '开源课程', difficulty: '入门到进阶', stage: '中文实践导航', value: `学习用途：用中文项目串联 API、数据库、模型调用与部署实践；${courseBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-little-law', title: "Little's Law", url: 'https://www.columbia.edu/~ks20/stochastic-I/stochastic-I-LL.pdf', source: 'Columbia University', language: '英文', type: '学术讲义', difficulty: '深挖', stage: '排队均值', value: `学习用途：核对 L = λW 的长期均值含义、存在与有限条件及证明思路；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-aws-idempotent-apis', title: 'Making retries safe with idempotent APIs', url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/', source: 'AWS Builders Library', language: '英文', type: '官方工程文章', difficulty: '进阶', stage: '幂等 API', value: `学习用途：分析 client request ID、相同 ID 不同意图、迟到请求与 unknown outcome；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-aws-transactional-outbox', title: 'Transactional outbox pattern', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html', source: 'AWS Prescriptive Guidance', language: '英文', type: '官方工程指南', difficulty: '进阶', stage: '事务消息', value: `学习用途：理解 dual write 风险、outbox、relay 和重复消费边界；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-chubby', title: 'The Chubby lock service for loosely-coupled distributed systems', url: 'https://people.eecs.berkeley.edu/~prabal/teaching/eecs582-w12/readings/chubby.pdf', source: 'Google / OSDI', language: '英文', type: '研究论文', difficulty: '深挖', stage: '租约有效性', value: `学习用途：理解 sequencer、generation 与拒绝 stale holder 的设计思路；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-docker-build-best-practices', title: 'Docker build best practices', url: 'https://docs.docker.com/build/building/best-practices/', source: 'Docker', language: '英文', type: '官方文档', difficulty: '进阶', stage: '容器构建', value: `学习用途：核对 USER、non-root、build cache 与可重建镜像建议；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-coordinated-omission', title: 'Coordinated Omission in NoSQL Database Benchmarking', url: 'https://vsis-www.informatik.uni-hamburg.de/getDoc.php/publications/569/Coordinated_Omission_in_NoSQL_Database_Benchmarking-Friedrich.pdf', source: 'University of Hamburg', language: '英文', type: '研究论文', difficulty: '深挖', stage: '负载生成', value: `学习用途：识别 closed synchronous generator 跳过 intended arrivals 导致的 coordinated omission；${researchBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-vllm-performance-tpot', title: 'vLLM Spyre performance tuning', url: 'https://docs.vllm.ai/projects/spyre/en/latest/user_guide/performance.html', source: 'vLLM Spyre', language: '英文', type: '官方文档', difficulty: '进阶', stage: 'LLM 延迟指标', value: `学习用途：区分 TTFT、ITL、TPOT 与 E2EL 的当前定义；${officialBoundary}`, verifiedAt: VERIFIED_AT },
  { id: 'res-backend-go-singleflight', title: 'singleflight package', url: 'https://pkg.go.dev/golang.org/x/sync/singleflight', source: 'Go Packages / golang.org/x/sync', language: '英文', type: '官方文档', difficulty: '进阶', stage: '缓存击穿保护', value: `学习用途：核对 duplicate function call suppression，即同一 key 的并发调用只执行一次，重复调用等待并共享结果；${officialBoundary}`, verifiedAt: VERIFIED_AT },
];

const evidenceByResourceId = {
  'res-backend-openapi': { authority: 'official', role: 'core', coverage: ['OpenAPI 文档结构、operation、schema、response 与安全描述'], limitations: '规范只描述接口表面，不会自动保证服务实现兼容、幂等、可靠或与文档持续一致。', verifiedAt: VERIFIED_AT },
  'res-backend-rfc9110': { authority: 'official', role: 'core', coverage: ['HTTP 方法、状态码、幂等与缓存的协议语义'], limitations: 'HTTP 幂等只约束多次相同请求的预期效果，不等于 broker 去重、外部副作用 exactly-once 或应用事务。', verifiedAt: VERIFIED_AT },
  'res-backend-rfc6585': { authority: 'official', role: 'core', coverage: ['429 Too Many Requests 与 Retry-After 语义'], limitations: '规范不定义服务的限额算法、全局容量或重试预算；客户端遵循 Retry-After 也不会创造后端容量。', verifiedAt: VERIFIED_AT },
  'res-backend-whatwg-sse': { authority: 'official', role: 'core', coverage: ['EventSource、UTF-8 text/event-stream、event/data/id/retry 字段与重连'], limitations: 'SSE 传输规范不定义 AI 服务的 created、delta、completed、error、cancelled 业务事件或持久恢复保证。', verifiedAt: VERIFIED_AT },
  'res-backend-asgi-http': { authority: 'official', role: 'core', coverage: ['ASGI HTTP 消息、响应流与 disconnect 事件'], limitations: 'ASGI disconnect 只说明应用收到的连接事件；它不证明上游请求、数据库事务或远端副作用已经取消。', verifiedAt: VERIFIED_AT },
  'res-backend-asgi-lifespan': { authority: 'official', role: 'core', coverage: ['ASGI startup、shutdown、complete 与 failed 消息'], limitations: '协议定义应用与服务器的生命周期消息，不替代编排器 probe、流量摘除、任务 drain 或依赖健康策略。', verifiedAt: VERIFIED_AT },
  'res-backend-python-asyncio': { authority: 'official', role: 'core', coverage: ['asyncio Task、TaskGroup、timeout 与 CancelledError 的协作式传播'], limitations: '协程取消需要代码到达可取消点并正确清理；不能据此断言线程、进程或远端 API 的工作已被撤销。', verifiedAt: VERIFIED_AT },
  'res-backend-kubernetes-probes': { authority: 'official', role: 'core', coverage: ['startup、readiness、liveness probe 的不同控制效果'], limitations: 'Kubernetes 探针行为是编排器机制，不提供适用于任意 AI 依赖的阈值；错误探针会放大而非修复故障。', verifiedAt: VERIFIED_AT },
  'res-backend-prometheus': { authority: 'official', role: 'core', coverage: ['online serving 的查询、错误、延迟及 batch job 指标原则'], limitations: '通用指标原则不直接给出 LLM 的 TTFT、TPOT、tokens/s、KV cache、队列或 GPU 指标名称和告警阈值。', verifiedAt: VERIFIED_AT },
  'res-backend-openai-streaming': { authority: 'official', role: 'cross-check', coverage: ['OpenAI Responses API 当前流式事件与客户端消费'], limitations: '这是当前产品接口而非 SSE 通用协议；事件类型、SDK 辅助函数与模型支持范围都可能随版本变化。', verifiedAt: VERIFIED_AT },
  'res-backend-openai-background': { authority: 'official', role: 'cross-check', coverage: ['OpenAI 当前 background response、轮询状态与取消接口'], limitations: '托管 background mode 的状态机和保留行为不等同于自建队列，也不为应用自己的数据库与副作用提供事务保证。', verifiedAt: VERIFIED_AT },
  'res-backend-openai-rate-limits': { authority: 'official', role: 'cross-check', coverage: ['OpenAI 当前限额维度、响应头和指数退避建议'], limitations: '账户、模型、地区和时间都会改变限额；文档中的当前产品限制不能写成永久事实或本地服务容量。', verifiedAt: VERIFIED_AT },
  'res-backend-fastapi-sse': { authority: 'official', role: 'cross-check', coverage: ['FastAPI 当前 SSE response、event 字段与生成器示例'], limitations: 'FastAPI 实现不等于 SSE 通用规范，也不覆盖代理缓冲、跨实例 resume、业务终态和远端取消的完整协议。', verifiedAt: VERIFIED_AT },
  'res-backend-fastapi-containers': { authority: 'official', role: 'cross-check', coverage: ['FastAPI 镜像构建、单进程/多进程、容器复制与模型内存边界'], limitations: '这是 FastAPI 部署建议而非容器通用铁律；Dockerfile Reference 作为未单列扩展不承担核心主张，具体指令仍应回查 Docker 官方文档。', verifiedAt: VERIFIED_AT },
  'res-backend-celery-tasks': { authority: 'official', role: 'core', coverage: ['Celery retry、early/late acknowledgement、worker lost 与 task idempotency'], limitations: 'Celery 的确认和重投语义受 broker、配置与崩溃点影响，不承诺跨数据库和外部副作用的通用 exactly-once。', verifiedAt: VERIFIED_AT },
  'res-backend-celery-optimizing': { authority: 'official', role: 'core', coverage: ['Celery queue 长期增长、prefetch、并发和长短任务路由'], limitations: '文档参数不是 GPU 任务的通用默认值；吞吐和内存必须在真实任务时长、broker 与 worker 隔离下测量。', verifiedAt: VERIFIED_AT },
  'res-backend-redis-eviction': { authority: 'official', role: 'core', coverage: ['Redis maxmemory、eviction policy 与 key 淘汰行为'], limitations: '淘汰会让 key 消失，因此 Redis 缓存不能单独承担任务权威状态、幂等账本或不可丢失结果索引。', verifiedAt: VERIFIED_AT },
  'res-backend-redis-semantic-cache': { authority: 'official', role: 'cross-check', coverage: ['语义缓存阈值、TTL、metadata filter 与读穿流程'], limitations: '厂商性能数字未作独立复核；近似匹配会误命中，必须以 tenant、模型、模板、安全与知识版本做硬隔离。', verifiedAt: VERIFIED_AT },
  'res-backend-postgres-transactions': { authority: 'official', role: 'core', coverage: ['事务 all-or-nothing、并发可见性与 savepoint'], limitations: '单数据库事务不能原子覆盖 broker publish、模型 API、邮件或支付等外部系统，仍需 outbox、幂等或对账协议。', verifiedAt: VERIFIED_AT },
  'res-backend-tail-at-scale': { authority: 'academic', role: 'core', coverage: ['fan-out 服务中的尾延迟放大与 hedging 等缓解思路'], limitations: '论文数字绑定 Google 当时的实验工作负载、规模与独立性假设，不能直接充当任意 AI API 的 p99 或复制收益。', verifiedAt: VERIFIED_AT },
  'res-backend-seda': { authority: 'academic', role: 'core', coverage: ['stage、显式 queue、控制器与资源隔离的服务架构'], limitations: '论文系统和 2001 年工作负载不能直接证明现代 async 框架或 GPU serving 的最优结构，stage 划分需按瓶颈验证。', verifiedAt: VERIFIED_AT },
  'res-backend-dagor': { authority: 'academic', role: 'core', coverage: ['入口过载控制、业务优先级与 RPC 级联保护'], limitations: 'DAGOR 来源于微信 WeChat 生产 RPC 经验，其优先级、规模和调用图不等同于任意 AI 服务，不能外推具体收益。', verifiedAt: VERIFIED_AT },
  'res-backend-millwheel': { authority: 'academic', role: 'cross-check', coverage: ['持久状态、重复交付与 exactly-once processing 的系统设计'], limitations: 'MillWheel 的框架内部语义不等于外部数据库、HTTP API 与现实副作用的 exactly-once；应用边界仍需独立去重。', verifiedAt: VERIFIED_AT },
  'res-backend-sarathi': { authority: 'academic', role: 'cross-check', coverage: ['LLM prefill/decode 调度与吞吐—延迟权衡'], limitations: '论文结果依赖所测 GPU 硬件、模型、请求长度和并发分布，不可外推为所有模型服务或当前 vLLM/Ray 的性能保证。', verifiedAt: VERIFIED_AT },
  'res-backend-sre-cascading': { authority: 'expert', role: 'core', coverage: ['过载、重试放大、健康检查、负载丢弃与级联故障'], limitations: 'Google SRE 工程经验不是普适定律；阈值、冗余和降级策略必须结合本服务依赖图与故障预算验证。', verifiedAt: VERIFIED_AT },
  'res-backend-vllm-architecture': { authority: 'official', role: 'cross-check', coverage: ['vLLM 当前 API server、engine core、scheduler、KV cache 与 worker 拓扑'], limitations: '这是 vLLM 当前项目实现，不代表通用 LLM server 架构；进程数、代码路径和调度器会随版本变化。', verifiedAt: VERIFIED_AT },
  'res-backend-vllm-server': { authority: 'official', role: 'cross-check', coverage: ['vLLM OpenAI-compatible API、health、load、metrics 与开发端点'], limitations: 'OpenAI-compatible 不等于字段和行为完全等价；开发端点具有生产风险，支持矩阵与默认参数需按固定版本核对。', verifiedAt: VERIFIED_AT },
  'res-backend-ray-batching': { authority: 'official', role: 'cross-check', coverage: ['Ray Serve 动态 batch queue、max batch size、wait timeout 与响应拆分'], limitations: '这是 Ray Serve 当前实现，不证明批次越大越好；TTFT、尾延迟、吞吐和显存需按目标模型与流量压测。', verifiedAt: VERIFIED_AT },
  'res-backend-datawhale': { authority: 'community', role: 'extension', coverage: ['Datawhale 中文开源课程的 LLM 应用、数据库与部署实践导航'], limitations: '该仓库仅作中文学习导航，依赖和示例会变化，不承担课程 assessed outcome 的核心主张、可靠性结论或生产保证。', verifiedAt: VERIFIED_AT },
  'res-backend-little-law': { authority: 'academic', role: 'core', coverage: ['L = λW、长期均值关系、相关量存在且有限时的适用条件'], limitations: '讲义证明的是长期平均关系且要求相关极限存在并有限；它不支持 p95、p99、单请求延迟或非稳态突发预测。', verifiedAt: VERIFIED_AT },
  'res-backend-aws-idempotent-apis': { authority: 'official', role: 'core', coverage: ['client request ID、same ID/different intent、late arrivals 与 unknown outcome'], limitations: '这是 AWS 厂商工程经验而非互联网标准；键作用域、冲突响应、保留期和迟到请求策略仍由具体系统定义并验证。', verifiedAt: VERIFIED_AT },
  'res-backend-aws-transactional-outbox': { authority: 'official', role: 'core', coverage: ['dual write 风险、transactional outbox、relay 与消费者重复处理'], limitations: 'AWS 示例用于解释模式边界，不构成跨任意 broker、数据库和外部副作用的普适 exactly-once 保证；消费者仍需幂等。', verifiedAt: VERIFIED_AT },
  'res-backend-chubby': { authority: 'academic', role: 'cross-check', coverage: ['sequencer、generation 与资源服务拒绝 stale holder 的机制'], limitations: 'Chubby 的锁服务与 sequencer 机制不是所有 broker lease、worker 协议或 fencing token 的统一规范；应用必须定义自己的验证方。', verifiedAt: VERIFIED_AT },
  'res-backend-docker-build-best-practices': { authority: 'official', role: 'core', coverage: ['Dockerfile USER、non-root 运行、build cache 与可重建构建实践'], limitations: '这是 Docker 当前版本化实现的构建建议，不替代组织镜像供应链政策，也不保证所有基础镜像、运行时或编排环境行为一致。', verifiedAt: VERIFIED_AT },
  'res-backend-coordinated-omission': { authority: 'academic', role: 'cross-check', coverage: ['closed synchronous generator 跳过 intended arrivals 与 coordinated omission 偏差'], limitations: '论文围绕 NoSQL 数据库 benchmark 实验展开；其结果不能直接外推为任意 LLM serving 的性能数字，只用于校准负载生成方法。', verifiedAt: VERIFIED_AT },
  'res-backend-vllm-performance-tpot': { authority: 'official', role: 'cross-check', coverage: ['TTFT、ITL、TPOT 与 E2EL 延迟指标定义'], limitations: '该页面属于 vLLM Spyre plugin 文档，是版本化项目扩展，不代表所有模型、硬件、vLLM backend 或观测系统的通用指标实现。', verifiedAt: VERIFIED_AT },
  'res-backend-go-singleflight': { authority: 'official', role: 'core', coverage: ['duplicate function call suppression：同一 key 的并发调用只执行一次，重复调用等待并共享结果'], limitations: '这是 Go x/sync/singleflight 的进程内语义，不等同于分布式锁、跨实例去重、结果持久化或跨故障恢复。', verifiedAt: VERIFIED_AT },
};

const resources = resourceCatalog.map((resource) => ({
  ...resource,
  evidence: evidenceByResourceId[resource.id],
}));

function quiz(lessonId, number, prompt, choices, answerIndex, explanation) {
  return {
    id: `quiz-${lessonId}-${number}`,
    prompt,
    choices,
    answerIndex,
    explanation,
  };
}

function lesson({
  order,
  title,
  summary,
  objectives,
  concepts,
  explanations,
  resourceIds,
  exercise,
  quizzes,
  completionCriteria,
}) {
  const suffix = String(order).padStart(2, '0');
  const id = `backend-${suffix}`;
  return {
    id,
    moduleId: 'backend-engineering',
    order,
    title,
    summary,
    durationMinutes: order === 8 ? 125 : 110,
    objectives,
    concepts,
    explanations,
    resourceIds,
    exercise,
    quiz: quizzes,
    interviewQuestionIds: [1, 2, 3].map((number) => `iq-${id}-${number}`),
    completionCriteria,
    knowledgeNote: backendEngineeringNotes[id],
  };
}

const lessons = [
  lesson({
    order: 1,
    title: 'AI 服务边界与 API 契约',
    summary: '从多个客户端和多个 Agent run 的公共边界出发，定义资源、端点、schema、错误与演进策略。',
    objectives: ['把用户场景转换为稳定的 HTTP 资源和操作契约', '区分接口描述、实现兼容、幂等与可靠性四种不同保证'],
    concepts: ['Resource model', 'OpenAPI', 'HTTP semantics', 'Error envelope', 'Versioning'],
    explanations: [
      { heading: '先定义公共服务边界', body: 'Harness 管理一个 run 内部的步骤和工具；AI 后端还要管理多个客户端、run、任务和服务实例。API 因此应围绕 report、job、result 与 cancellation 等资源建模，并明确同步、异步与流式响应的接受条件。', keyPoints: ['资源状态是跨请求公共契约', '请求 ID、run ID 与幂等键承担不同身份职责'] },
      { heading: 'OpenAPI 描述接口但不制造保证', body: 'OpenAPI 可以描述路径、schema、状态码与认证，却不会自动让实现兼容、事务安全或可靠。HTTP 方法幂等也只是一层协议语义；broker 重投、数据库去重和外部工具副作用仍需要独立设计。项目实现不等于通用规范。', keyPoints: ['错误响应必须稳定且可诊断', '版本策略要说明兼容窗口与废弃路径'] },
    ],
    resourceIds: ['res-backend-openapi', 'res-backend-rfc9110', 'res-backend-rfc6585', 'res-backend-datawhale', 'res-backend-aws-idempotent-apis'],
    exercise: { title: '设计研究报告服务 API', brief: '为创建报告、读取状态、获取结果和取消任务定义资源与接口。', steps: ['写出资源 schema、端点、状态码、错误 envelope 与请求身份字段', '为兼容变更、重复提交、未知资源和超限分别写出验收示例'], deliverable: '一份 OpenAPI 草案与契约决策记录。' },
    quizzes: [
      quiz('backend-01', 1, 'OpenAPI 文档能够自动保证什么？', ['实现一定幂等', '接口结构可被机器读取和校验', 'broker 与数据库原子提交'], 1, 'OpenAPI 描述接口结构，但不会自动创造实现兼容、可靠性或事务保证。'),
      quiz('backend-01', 2, 'POST 创建长任务时最需要额外定义什么？', ['只定义 200 文本', '资源身份、状态查询、重复提交和错误语义', '把所有内部栈写进响应'], 1, '长任务需要稳定资源、状态与重复请求契约，不能只依赖一次连接。'),
    ],
    completionCriteria: ['能交付可解析且资源语义一致的 OpenAPI 草案', '能逐项说明接口描述、HTTP 幂等和业务可靠性的边界'],
  }),
  lesson({
    order: 2,
    title: '同步、SSE 流式响应与取消',
    summary: '设计同步与 typed SSE 两种响应模式，并处理客户端断线、应用取消、上游取消和资源清理。',
    objectives: ['定义 created、delta、completed、error、cancelled 的唯一终态事件协议', '解释断线、取消传播和远端副作用撤销为何是不同问题'],
    concepts: ['SSE', 'Typed events', 'TTFT', 'Disconnect', 'Cooperative cancellation'],
    explanations: [
      { heading: '流式协议需要业务事件', body: 'SSE 规定 UTF-8 text/event-stream 和 event、data、id 等字段，但 AI 服务仍要定义 created、delta、completed、error、cancelled。一次流只能出现一个终态；TTFT 与完整延迟要分开测量，客户端还要能区分可重试传输中断和已确定业务失败。', keyPoints: ['delta 不是终态也不是持久结果', 'typed event 让客户端不必猜测字符串含义'] },
      { heading: '断线不等于全链路取消', body: '客户端断开后应用可能收到 ASGI disconnect，再取消本地 asyncio Task；上游 SDK 是否支持取消、远端是否已经产生副作用、数据库事务是否已提交，都是独立事实。取消是协作式传播，应在 finally 中释放连接、并发槽和临时资源。', keyPoints: ['每层记录取消请求与实际停止结果', '终态竞态必须由单一状态机裁决'] },
    ],
    resourceIds: ['res-backend-whatwg-sse', 'res-backend-asgi-http', 'res-backend-python-asyncio', 'res-backend-openai-streaming', 'res-backend-fastapi-sse'],
    exercise: { title: '推演流式生命周期', brief: '为同步、正常流、断线和应用取消生成确定事件轨迹。', steps: ['为每种场景排列 created、delta 与唯一终态，并记录客户端和上游状态', '列出断线后的本地 task、上游调用、数据库事务与并发槽清理动作'], deliverable: '一张事件时序图和取消清理矩阵。', experiment: 'stream-lifecycle' },
    quizzes: [
      quiz('backend-02', 1, 'SSE 规范会自动定义哪一种 AI 终态？', ['completed', 'cancelled', '都不会，业务层必须定义'], 2, 'SSE 规定传输格式，不规定 AI 应用的业务事件和终态。'),
      quiz('backend-02', 2, '客户端断线后可以立即推出什么？', ['远端副作用已经撤销', '应用应开始本地清理与取消传播', '数据库一定回滚'], 1, '断线只触发清理和传播流程，远端工作与副作用是否停止仍需单独观察。'),
    ],
    completionCriteria: ['能证明每条流只有一个 typed terminal event', '能逐层说明断线、应用取消、上游停止和资源清理结果'],
  }),
  lesson({
    order: 3,
    title: '并发、Deadline 与准入控制',
    summary: '从到达率、服务时间、并发槽和 deadline 推导容量，使用有界队列、限流和负载丢弃保护服务。',
    objectives: ['用 Little 定律与利用率建立稳态容量直觉并说明模型边界', '设计 admission、deadline、429 与有界队列的协同策略'],
    concepts: ['Little’s Law', 'Deadline', 'Admission control', 'Backpressure', 'Tail latency'],
    explanations: [
      { heading: '容量先于重试', body: '稳态均值下 L = λW 描述系统内平均在途量、到达率和平均停留时间的关系，但不是 p95 或 p99 公式。并发槽有限且服务时间上升时，无界排队只会把失败推迟；准入控制应在昂贵工作开始前检查预算和 deadline。', keyPoints: ['均值模型用于容量直觉而不是尾延迟承诺', '队列长度必须有上限和拒绝策略'] },
      { heading: '过载保护要跨层协调', body: '429 与 Retry-After 向客户端表达暂时超限，指数退避和 jitter 可减少同步重试，却不会创造容量。入口限流、租户公平、任务优先级、并发 semaphore 与下游保护要共享过载信号，避免重试风暴和级联故障。', keyPoints: ['越早拒绝越能保护昂贵资源', 'deadline 应向下游递减传播而非每层重置'] },
    ],
    resourceIds: ['res-backend-rfc6585', 'res-backend-openai-rate-limits', 'res-backend-tail-at-scale', 'res-backend-dagor', 'res-backend-sre-cascading', 'res-backend-little-law', 'res-backend-coordinated-omission'],
    exercise: { title: '计算服务准入预算', brief: '给定到达率、平均服务时间、并发槽、队列上限和 deadline，判断请求去向。', steps: ['计算平均并发需求与利用率，分别模拟空闲、短队列、满队列和 deadline 不足', '为 accepted、queued、rejected、timedOut 写出确定理由和客户端响应'], deliverable: '一份容量表、拒绝策略与边界说明。', experiment: 'service-admission' },
    quizzes: [
      quiz('backend-03', 1, 'L = λW 能直接预测哪项指标？', ['任意 p99 延迟', '稳态平均在途量', '每个请求的完成时间'], 1, 'Little 定律描述稳态均值关系，不是尾延迟或单请求预测公式。'),
      quiz('backend-03', 2, '系统已经过载时，无限制自动重试通常会怎样？', ['创造更多容量', '放大负载并可能形成级联故障', '保证每个请求成功'], 1, '重试会产生额外工作；没有预算、退避和准入时会进一步恶化过载。'),
    ],
    completionCriteria: ['能用容量模型解释接受、排队、拒绝和超时决定', '能明确均值假设、尾延迟风险和重试不会创造容量的边界'],
  }),
  lesson({
    order: 4,
    title: '异步任务、队列与 Worker',
    summary: '把超过请求生命周期的工作建模为持久 job，以有界队列和 worker 状态机提供查询、取消与恢复入口。',
    objectives: ['设计 202 Accepted 到 terminal state 的客户端可见任务状态机', '解释 broker、worker、数据库和客户端状态各自的职责'],
    concepts: ['202 Accepted', 'Job state', 'Broker', 'Worker lease', 'Backpressure'],
    explanations: [
      { heading: '异步接口先创建可查询资源', body: '长任务提交后返回 202、jobId 和 status URL，只表示请求已被接纳，不表示任务一定成功。客户端可见状态可采用 queued、running、succeeded、failed、cancelled，并记录版本、进度和终态原因；内部 broker delivery 状态不应直接冒充业务状态。', keyPoints: ['job 是权威资源而不是临时消息', '状态更新要支持重复读取和明确终态'] },
      { heading: '队列和 worker 需要有界控制', body: 'Broker 解耦提交和执行，worker 通过领取或 lease 获取任务。Celery 的 ack、prefetch 和重投具有具体实现语义；到达率长期高于完成率时队列不会自行恢复。应按任务成本、租户和 deadline 路由，并为排队、执行和结果保存分别设限。', keyPoints: ['消息存在不等于任务状态已经事务提交', 'worker 崩溃点决定重投与对账动作'] },
    ],
    resourceIds: ['res-backend-openai-background', 'res-backend-celery-tasks', 'res-backend-celery-optimizing', 'res-backend-seda', 'res-backend-millwheel', 'res-backend-chubby'],
    exercise: { title: '设计报告任务状态机', brief: '把报告生成拆成提交、入队、领取、执行、保存结果与确认阶段。', steps: ['定义客户端 job state、消息状态、worker lease、取消入口和每一步持久字段', '在入队前后、结果提交前后和 ack 前后注入崩溃，写出恢复或人工对账动作'], deliverable: '一张 job 状态机、崩溃点表和 worker 契约。' },
    quizzes: [
      quiz('backend-04', 1, '202 Accepted 最准确的含义是什么？', ['任务已经成功', '请求已接纳但处理尚未完成', '结果不会失败'], 1, '202 表示已接纳处理，客户端仍需通过任务资源观察后续状态。'),
      quiz('backend-04', 2, '队列到达率长期高于完成率时会发生什么？', ['队列自动清空', '积压持续增长直至触发限制或故障', '延迟保持不变'], 1, '没有负载丢弃或扩容时，长期供大于求会让队列与等待时间持续增长。'),
    ],
    completionCriteria: ['能交付客户端状态、broker 状态和 worker lease 分离的任务协议', '能针对主要崩溃点给出重投、恢复、取消或对账决定'],
  }),
  lesson({
    order: 5,
    title: 'PostgreSQL、Redis 与缓存正确性',
    summary: '让 PostgreSQL 保存权威任务与幂等状态，把 Redis 限定为可淘汰、可重建且作用域明确的缓存。',
    objectives: ['划分任务状态、结果索引、幂等账本与缓存的权威归属', '设计 exact/semantic cache key、TTL、隔离与失效策略'],
    concepts: ['Source of truth', 'Transaction', 'Cache-aside', 'Eviction', 'Semantic cache'],
    explanations: [
      { heading: '权威状态进入事务性持久层', body: 'Job 当前状态、状态版本、结果引用和幂等记录应由 PostgreSQL 等事务性持久层承担。为避免业务事实与消息发布的 dual write 缺口，可把状态转换与 outbox 发布意图放进同一事务，再由 relay 至少一次发送；单库事务仍不能覆盖 broker、模型 API 或邮件等外部系统，relay 重复也要求消费者幂等和对账。', keyPoints: ['事务提交点定义可恢复事实', '结果大对象可外置但索引和校验信息仍需持久化'] },
      { heading: 'Redis 只能作为可失去的加速层', body: 'Redis key 可能因 TTL、淘汰、故障或主动失效消失，所以缓存必须非权威、可重建。语义缓存还存在近似误命中；除了相似度阈值，还要以 tenant、model、prompt/template version、temperature、tool schema、安全策略和知识版本做硬隔离。', keyPoints: ['缓存 miss 不能让业务真相丢失', '缓存正确性比命中率更优先'] },
    ],
    resourceIds: ['res-backend-postgres-transactions', 'res-backend-redis-eviction', 'res-backend-redis-semantic-cache', 'res-backend-go-singleflight', 'res-backend-aws-transactional-outbox'],
    exercise: { title: '设计权威状态与缓存表', brief: '为报告 job、result、idempotency record、exact cache 和 semantic cache 划分存储。', steps: ['为每类数据写出 owner、事务边界、唯一约束、TTL、淘汰后行为和重建来源，并为热门 key 的并发 miss 定义 singleflight 回源保护', '构造跨租户、模型升级、知识更新和安全策略变化场景，验证旧缓存不会误用'], deliverable: '一份表结构草图、缓存键规范和失效矩阵。' },
    quizzes: [
      quiz('backend-05', 1, '为什么 Redis 不应单独保存任务权威终态？', ['读取太快', 'key 可能过期或被淘汰，无法承担不可丢失事实', '不支持字符串'], 1, '缓存可能消失，权威状态和幂等账本应保存在事务性持久层。'),
      quiz('backend-05', 2, '语义缓存只用相似度阈值有什么风险？', ['无法存储文本', '跨租户、模型或安全版本误复用答案', '一定没有命中'], 1, '近似匹配必须叠加硬 metadata 隔离和失效策略，避免语义相近但上下文不同的误命中。'),
    ],
    completionCriteria: ['能证明 Redis 全部数据丢失后权威任务仍可恢复', '能用缓存键和失效矩阵阻止跨租户、跨模型与陈旧知识误命中'],
  }),
  lesson({
    order: 6,
    title: '重试、幂等与投递语义',
    summary: '区分 HTTP 幂等、broker 至少一次、应用去重与框架内部 exactly-once，在未知结果下安全恢复。',
    objectives: ['为可重试操作建立稳定幂等键、去重账本和结果回放', '在 worker 崩溃、消息 redelivery 与未知副作用结果下选择重试或对账'],
    concepts: ['At-least-once', 'Idempotency key', 'Deduplication', 'Unknown outcome', 'Outbox'],
    explanations: [
      { heading: '投递保证必须标明边界', body: 'Broker 常见至少一次投递意味着消息可能重复，Celery ack 时点和 worker 丢失配置还会改变重投行为。HTTP 方法幂等、应用幂等键、数据库唯一约束和流处理框架 exactly-once 是不同边界；不能把任何一层的保证外推到支付、邮件或工具调用。', keyPoints: ['重复是正常输入而不是罕见异常', '幂等记录要绑定规范请求指纹和稳定结果'] },
      { heading: '未知结果优先对账而不是盲重试', body: '若外部写成功后 worker 在记录结果前崩溃，系统看到的是 unknown outcome。安全流程是用幂等键查询远端或本地 effect ledger；能证明成功则回放结果，能证明未执行才重试，证据矛盾则进入 reconcile。指数退避只能控制时间，不会让非幂等副作用自动安全。', keyPoints: ['先识别副作用边界再配置重试', 'outbox 解决数据库事实与发布意图协调而非所有外部原子性'] },
    ],
    resourceIds: ['res-backend-rfc9110', 'res-backend-celery-tasks', 'res-backend-millwheel', 'res-backend-postgres-transactions', 'res-backend-sre-cascading', 'res-backend-aws-idempotent-apis', 'res-backend-aws-transactional-outbox'],
    exercise: { title: '推演任务投递账本', brief: '在提交、入队、领取、执行、提交结果和确认阶段注入重复与崩溃。', steps: ['为每个事件更新 job state、message state、effect ledger 和 idempotency record', '遇到 unknown outcome 时列出可证明成功、可安全重试与必须人工 reconcile 的证据'], deliverable: '一份投递事件日志、幂等账本和人工对账清单。', experiment: 'job-delivery-ledger' },
    quizzes: [
      quiz('backend-06', 1, '至少一次投递意味着消费者必须准备什么？', ['消息绝不重复', '重复消息与幂等或去重处理', '每次都生成新幂等键'], 1, '至少一次允许 redelivery，消费者应把重复当作协议内情况。'),
      quiz('backend-06', 2, '外部写结果未知时最安全的第一步是什么？', ['立即无限重试', '依据幂等键或远端查询先对账', '直接标记成功'], 1, '未知结果下盲重试可能重复副作用，应先收集可证明的执行证据。'),
    ],
    completionCriteria: ['能逐层标明 HTTP、broker、数据库与外部副作用保证', '能用账本对重复、未知结果和证据矛盾做确定决策'],
  }),
  lesson({
    order: 7,
    title: '生命周期、健康检查与可观测性',
    summary: '让服务安全启动、摘流、drain 和关闭，并用关联日志、指标和 trace 观察请求、流、队列、worker 与缓存。',
    objectives: ['设计 startup、readiness、liveness、shutdown 与 drain 的分工', '建立覆盖请求、流、任务、队列、worker、缓存和模型调用的观测字段'],
    concepts: ['Startup', 'Readiness', 'Liveness', 'Graceful shutdown', 'RED metrics'],
    explanations: [
      { heading: '三个 probe 回答不同问题', body: 'Startup 判断慢启动是否完成，readiness 决定实例是否接收新流量，liveness 判断进程是否需要重启。短暂模型供应商抖动通常不应让所有实例同时 liveness 失败；摘流后还要等待正在进行的 SSE、任务领取和数据库提交完成或进入可恢复状态。', keyPoints: ['readiness 适合流量门控，liveness 应保守', 'shutdown 前先停止接收新工作并 drain'] },
      { heading: '观测要贯穿一次请求的完整路径', body: '每个请求至少关联 requestId、jobId、runId、tenant、attempt 和 traceId，并记录状态转换而不是泄露完整 prompt。指标同时覆盖请求率、错误、TTFT、完整延迟、活跃流、队列深度与年龄、worker 利用率、重试、缓存命中和模型 tokens。', keyPoints: ['高基数身份进入日志和 trace，不随意成为 metric label', '告警同时观察症状、容量与下游依赖'] },
    ],
    resourceIds: ['res-backend-asgi-lifespan', 'res-backend-kubernetes-probes', 'res-backend-prometheus', 'res-backend-sre-cascading', 'res-backend-vllm-server'],
    exercise: { title: '设计运行手册与仪表盘', brief: '为发布、模型抖动、队列积压和流式断线配置生命周期与观测方案。', steps: ['写出 startup/readiness/liveness/shutdown 判定、超时、drain 顺序和失败降级', '为 HTTP、SSE、job、queue、worker、cache 和 model 定义指标、关联字段与三条告警'], deliverable: '一份 probe 规范、优雅关闭时序和可观测性清单。' },
    quizzes: [
      quiz('backend-07', 1, '实例暂时不能接收新流量但进程仍可恢复时应改变什么？', ['让 readiness 失败', '立刻让 liveness 失败', '删除全部任务'], 0, 'Readiness 控制流量接入；liveness 应保守，避免把暂时依赖抖动放大成重启风暴。'),
      quiz('backend-07', 2, 'requestId 最适合放在哪里用于逐请求关联？', ['无限基数的 Prometheus label', '结构化日志与 trace', '健康检查路径名'], 1, '逐请求身份适合日志和 trace；直接作为 metric label 会造成高基数。'),
    ],
    completionCriteria: ['能证明实例摘流、drain 和关闭不会静默丢失已接纳工作', '能从统一身份链定位请求、流、任务、缓存和模型调用故障'],
  }),
  lesson({
    order: 8,
    title: '部署、扩容与综合故障诊断',
    summary: '用负载测试和故障证据决定 API、worker、缓存与模型服务如何独立扩容，完成研究报告服务设计包。',
    objectives: ['制定覆盖吞吐、TTFT、尾延迟、队列、错误与质量的负载测试', '设计多副本发布、容量扩展和跨层故障定位方案'],
    concepts: ['Load test', 'Horizontal scaling', 'Rolling deployment', 'Dynamic batching', 'Fault tree'],
    explanations: [
      { heading: '按瓶颈拆分扩容单元', body: 'API ingress、异步 worker、PostgreSQL、Redis 和模型 server 的瓶颈不同，应分别观察 CPU、连接、队列、显存与 token 调度。vLLM 的 scheduler/KV cache 拓扑和 Ray Serve dynamic batching 是项目实现，不代表通用规范；批处理需要同时测吞吐、TTFT 与尾延迟。', keyPoints: ['扩容前先定位饱和资源与排队位置', '模型副本扩容要考虑加载时间、显存和缓存预热'] },
      { heading: '发布与诊断依赖可恢复协议', body: '滚动发布先启动并通过 startup/readiness，再接流量；旧实例摘流、停止领取新任务并 drain。故障诊断沿 client、gateway、API、queue、worker、database、cache、model server 逐层反证，区分容量不足、发布不兼容、缓存陈旧和模型延迟。', keyPoints: ['版本兼容窗口覆盖正在运行的旧任务', '压测结果绑定硬件、模型、请求长度和流量分布'] },
    ],
    resourceIds: ['res-backend-fastapi-containers', 'res-backend-vllm-architecture', 'res-backend-vllm-server', 'res-backend-ray-batching', 'res-backend-sarathi', 'res-backend-datawhale', 'res-backend-openapi', 'res-backend-docker-build-best-practices', 'res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'],
    exercise: { title: '完成 AI 研究报告服务设计包', brief: '整合 OpenAPI、SSE、异步任务、存储、可靠性、健康检查、容量和部署策略。', steps: ['定义测试流量、模型与硬件基线，记录吞吐、TTFT、P95/P99、队列、错误、成本和质量指标', '为滚动发布、模型变慢、worker 崩溃、Redis 清空和数据库故障逐层写检测、降级与恢复'], deliverable: '一份可评审的架构图、接口、容量报告、发布计划和故障树。' },
    quizzes: [
      quiz('backend-08', 1, '动态批处理的正确评估方式是什么？', ['只看最大吞吐', '同时测吞吐、TTFT、尾延迟、显存和目标流量分布', '假设 batch 越大越好'], 1, '批处理改变吞吐与等待时间，应在固定硬件、模型和请求分布下综合评估。'),
      quiz('backend-08', 2, '滚动发布中旧实例最先应做什么？', ['删除状态', '从 readiness 摘流并停止领取新工作', '立即强杀全部连接'], 1, '先摘流和停止领取，再 drain 或把已接纳工作转换为可恢复状态。'),
    ],
    completionCriteria: ['能交付包含接口、容量、发布和故障恢复的完整设计包', '能明确所有基准数字与 vLLM、Ray Serve 等实现的版本和实验边界'],
  }),
];

function interviewSpec(id, lessonId, question, shortAnswer, deepDive, misconception, followUp, difficulty) {
  return {
    id,
    lessonId,
    question,
    shortAnswer,
    deepDive,
    misconceptions: [misconception],
    followUps: [followUp],
    frequency: '高',
    difficulty,
    roles: ['AI 应用', '后端工程'],
  };
}

const interviewSpecs = [
  interviewSpec('iq-backend-01-1', 'backend-01', '如何为一个 AI 研究报告服务设计资源与端点？', '围绕 report job、status、result 和 cancellation 建模，区分同步、异步与流式接受条件，并提供稳定错误 envelope。', ['说明 jobId、requestId、runId 与幂等键的不同用途。', '定义 202、404、409、422、429 与 5xx 的可操作语义。'], '只暴露一个万能 /run 并返回任意 JSON。', '如何兼容一个已在执行中的旧版本 job？', '进阶'),
  interviewSpec('iq-backend-01-2', 'backend-01', 'OpenAPI 能保证服务实现兼容和可靠吗？', '不能。OpenAPI 描述接口形状与操作，兼容性需要契约测试和演进策略，可靠性需要事务、幂等、队列和观测设计。', ['区分 schema 校验、行为兼容和运行时保证。', '说明文档漂移与生成客户端的失败模式。'], '把文档存在等同于实现满足全部语义。', '你会怎样在 CI 中检测 breaking change？', '基础'),
  interviewSpec('iq-backend-01-3', 'backend-01', 'HTTP 幂等与业务幂等有什么区别？', 'HTTP 幂等描述重复相同方法请求的预期效果；业务幂等还要定义身份、规范请求指纹、去重范围与结果回放。', ['broker 重投和外部副作用不因 HTTP 方法自动安全。', '幂等键复用但 payload 不同应返回冲突。'], '认为 PUT 或 DELETE 永远只执行一次。', 'POST 如何借助 Idempotency-Key 实现安全重试？', '进阶'),
  interviewSpec('iq-backend-02-1', 'backend-02', '如何设计 AI SSE 的事件协议？', '在 SSE 字段之上定义 created、delta、completed、error、cancelled，包含稳定 stream/job 身份、序号和结构化 payload，并保证唯一终态。', ['说明 TTFT 与完整延迟为何分开。', '区分传输重连、事件重放和业务恢复。'], '把每个 token 当作无类型字符串。', '客户端漏掉一个序号时如何处理？', '进阶'),
  interviewSpec('iq-backend-02-2', 'backend-02', '客户端断线是否意味着上游模型已经取消？', '不意味着。断线只触发本地检测；应用 task、上游 SDK、远端计算和副作用是否停止需要分别传播、观察和记录。', ['取消是协作式，需要可取消点和 finally 清理。', '结果提交与取消并发时由状态机决定唯一终态。'], '看到 disconnect 就记录所有资源已释放。', '上游不支持取消时怎样隔离资源？', '基础'),
  interviewSpec('iq-backend-02-3', 'backend-02', '同步、SSE 和异步 job 应如何选择？', '短且可在 deadline 内完成的操作适合同步；需要增量体验但连接可维持的适合 SSE；长时、可恢复或跨部署的工作适合异步 job。', ['三种模式可共享同一权威 job 和结果模型。', '选择取决于持续时间、恢复、取消和客户端能力。'], '所有 LLM 请求都必须流式。', '如何让 SSE 断线后降级为 job 查询？', '进阶'),
  interviewSpec('iq-backend-03-1', 'backend-03', 'Little 定律在容量设计中怎样使用，不能怎样使用？', '稳态下用 L = λW 估算平均在途量和并发需求；不能把它当作 p95、p99 或单请求延迟预测。', ['说明到达率、服务时间和并发槽的测量窗口。', '指出突发、非稳态和重尾分布的边界。'], '用平均值直接承诺尾延迟。', '如何用压测补足均值模型？', '基础'),
  interviewSpec('iq-backend-03-2', 'backend-03', '如何设计 AI 服务准入控制？', '在昂贵工作前按租户配额、并发槽、队列上限、token/成本预算和剩余 deadline 判断接受、排队或拒绝。', ['入口与下游共享过载信号。', '拒绝返回 429/503、Retry-After 和可重试性。'], '先把所有请求放进无界队列再说。', '高优先级请求怎样避免饿死普通租户？', '进阶'),
  interviewSpec('iq-backend-03-3', 'backend-03', '重试为什么会引发级联故障？', '每次重试都增加负载；当原因为过载或依赖变慢时，多层无预算重试会同步放大请求量并占满线程、连接和队列。', ['采用总 deadline、有限预算、指数退避和 jitter。', '越早 load shed 越能保护昂贵资源。'], '认为指数退避能创造容量。', '三层调用链的重试预算如何分配？', '深挖'),
  interviewSpec('iq-backend-04-1', 'backend-04', '如何设计异步 job 状态机？', '客户端状态至少含 queued、running、succeeded、failed、cancelled，并记录版本、进度、终态原因和结果引用；内部消息状态单独维护。', ['202 只表示接纳。', '终态不可逆，取消请求与取消完成分开。'], '直接把 broker ack 当作任务成功。', 'worker 崩溃后如何恢复 running job？', '进阶'),
  interviewSpec('iq-backend-04-2', 'backend-04', 'Celery 的 ack、retry 和 prefetch 分别影响什么？', 'Ack 影响消息何时从 broker 确认，retry 重新安排任务执行，prefetch 决定 worker 提前保留多少任务；三者共同影响重复、吞吐和公平。', ['acks_late 需要任务幂等。', '长短任务通常需要不同路由和预取策略。'], '把 retry 和 redelivery 当成同一个动作。', 'GPU 长任务的 prefetch 应如何压测？', '进阶'),
  interviewSpec('iq-backend-04-3', 'backend-04', '队列为什么必须有界？', '有界队列让系统在容量不足时明确拒绝或降级，避免等待时间、内存和已过 deadline 的无效工作无限增长。', ['观察 queue depth 与 oldest age。', '按成本、租户和 deadline 管理排队。'], '队列越长说明系统越可靠。', '满队列时同步和异步客户端分别收到什么？', '基础'),
  interviewSpec('iq-backend-05-1', 'backend-05', 'PostgreSQL 和 Redis 在 AI job 系统中如何分工？', 'PostgreSQL 保存权威 job、状态版本、结果引用和幂等账本；Redis 保存可淘汰、可重建的缓存、限流计数或短期加速数据。', ['事务定义恢复提交点。', 'Redis 全丢失不能改变业务真相。'], '把 Redis 中的状态视为永久记录。', '如何在数据库事务后可靠发布任务？', '基础'),
  interviewSpec('iq-backend-05-2', 'backend-05', '如何设计 LLM 响应缓存键？', '至少包含 tenant、模型与版本、规范 prompt/template、参数、tool schema、安全策略和知识版本；exact 与 semantic cache 分开。', ['TTL 与主动失效共同控制陈旧。', '敏感和个性化请求可能禁用共享缓存。'], '只对用户问题文本做哈希。', '模型升级时怎样防止旧答案误命中？', '进阶'),
  interviewSpec('iq-backend-05-3', 'backend-05', '语义缓存的主要正确性风险是什么？', '相似问题不一定具有相同租户、知识版本、权限或期望答案；阈值过松会误命中，过紧则降低收益。', ['硬 metadata filter 先于近似匹配。', '用人工标注集评估 false hit 和 miss。'], '只追求最高 cache hit ratio。', '怎样验证安全策略变化后的失效传播？', '深挖'),
  interviewSpec('iq-backend-06-1', 'backend-06', '为什么至少一次投递要求幂等消费者？', '至少一次允许消息在确认丢失或 worker 崩溃后 redelivery；消费者必须识别重复并回放已有结果或安全 no-op。', ['稳定幂等键跨 attempt 不变。', '数据库唯一约束保护并发重复。'], '每次重试都生成新的幂等键。', '重复 payload 不同应如何处理？', '基础'),
  interviewSpec('iq-backend-06-2', 'backend-06', '外部副作用结果未知时怎样恢复？', '先用幂等键、远端查询或 effect ledger 对账；证明成功则回放，证明未执行才重试，证据冲突进入人工 reconcile。', ['unknown 不等于 failed。', '重试预算不能覆盖不安全副作用。'], '超时后一律再次执行。', '远端没有查询接口时怎样降低风险？', '进阶'),
  interviewSpec('iq-backend-06-3', 'backend-06', 'Outbox pattern 解决什么，不解决什么？', '它把数据库状态与待发布事件意图放入同一事务，再由 relay 重复发布；它不让任意外部 API 与数据库成为一个原子事务。', ['relay 可能重复发布，消费者仍需幂等。', '记录 publish attempt 与完成证据。'], '认为 outbox 提供全球 exactly-once。', 'relay 在发布成功后标记前崩溃会怎样？', '深挖'),
  interviewSpec('iq-backend-07-1', 'backend-07', 'Startup、readiness、liveness 有何区别？', 'Startup 保护慢启动，readiness 控制是否接收流量，liveness 判断是否重启进程；三者失败后果不同，阈值不能混用。', ['依赖短抖动通常影响 readiness 而非 liveness。', '探针自身要便宜且有超时。'], '模型供应商一抖动就杀死全部实例。', '数据库只读降级时 readiness 应如何设计？', '基础'),
  interviewSpec('iq-backend-07-2', 'backend-07', 'AI 服务如何优雅关闭？', '先从 readiness 摘流并停止领取新任务，再等待 HTTP/SSE、worker lease 和事务完成或写入可恢复状态，最后关闭连接与进程。', ['为 drain 设置上限和可观察进度。', 'SIGTERM 到强杀之间保留恢复窗口。'], '收到信号后立即退出。', '长 SSE 超过 drain deadline 时怎么办？', '进阶'),
  interviewSpec('iq-backend-07-3', 'backend-07', 'AI 后端应观察哪些指标和关联字段？', '指标覆盖请求率、错误、TTFT、完整延迟、活跃流、队列深度/年龄、worker、重试、缓存和模型 tokens；日志/trace 关联 requestId、jobId、runId 与 attempt。', ['避免高基数 metric label。', '记录状态转换和原因，不默认记录敏感 prompt。'], '只看平均响应时间和 CPU。', '如何从一次用户超时追到模型调用？', '进阶'),
  interviewSpec('iq-backend-08-1', 'backend-08', '如何为 LLM 服务设计负载测试？', '固定模型、硬件、请求长度和到达分布，逐级增加并发，测吞吐、TTFT、TPOT、P95/P99、队列、错误、显存、成本和质量。', ['区分闭环与开环负载。', '记录预热、缓存和 batch 配置。'], '只跑一次最大 QPS。', '怎样识别 coordinated omission？', '深挖'),
  interviewSpec('iq-backend-08-2', 'backend-08', 'vLLM 与 Ray Serve 在架构中分别说明什么？', 'vLLM 展示模型 API、调度与 KV cache 的具体实现；Ray Serve 展示动态批处理和 serving 编排实现。二者都不是通用规范。', ['核验固定版本与兼容字段。', '批处理和扩缩仍需真实压测。'], '把项目默认值当作行业标准。', '升级版本前要做哪些契约与性能回归？', '进阶'),
  interviewSpec('iq-backend-08-3', 'backend-08', '如何诊断多副本 AI 服务的尾延迟突增？', '沿入口、API、queue、worker、数据库、缓存和模型 server 比较饱和度、排队时间与依赖延迟，结合版本和流量变化逐层反证。', ['区分容量不足、冷启动、缓存 miss 和下游变慢。', '先保护服务再做根因定位。'], '先盲目增加所有副本。', '模型 TTFT 正常但完整延迟升高说明什么？', '深挖'),
];

const interviewQuestions = interviewSpecs.map((question) => ({
  ...question,
  deepDive: [...question.deepDive],
  misconceptions: [...question.misconceptions],
  followUps: [...question.followUps],
  roles: [...question.roles],
}));

function coverage(fieldPath, sectionId, ...sourceIds) {
  return { fieldPath, sectionId, sourceIds };
}

const coverageMatrix = {
  'backend-01': [
    coverage('objectives[0]', 'service-boundary', 'res-backend-openapi', 'res-backend-rfc9110'),
    coverage('objectives[1]', 'openapi-contract', 'res-backend-openapi'),
    coverage('quiz[0]', 'openapi-contract', 'res-backend-openapi'),
    coverage('quiz[1]', 'resource-state', 'res-backend-aws-idempotent-apis', 'res-backend-openapi'),
    coverage('interviewQuestionIds[0]', 'service-boundary', 'res-backend-openapi', 'res-backend-rfc9110'),
    coverage('interviewQuestionIds[1]', 'openapi-contract', 'res-backend-openapi'),
    coverage('interviewQuestionIds[2]', 'resource-state', 'res-backend-aws-idempotent-apis', 'res-backend-rfc9110'),
    coverage('exercise.steps[0]', 'contract-review', 'res-backend-openapi', 'res-backend-rfc9110'),
    coverage('exercise.steps[1]', 'resource-state', 'res-backend-aws-idempotent-apis'),
    coverage('completionCriteria[0]', 'openapi-contract', 'res-backend-openapi'),
    coverage('completionCriteria[1]', 'resource-state', 'res-backend-aws-idempotent-apis', 'res-backend-rfc9110'),
  ],
  'backend-02': [
    coverage('objectives[0]', 'streaming-model', 'res-backend-whatwg-sse', 'res-backend-openai-streaming'),
    coverage('objectives[1]', 'asgi-disconnect', 'res-backend-asgi-http', 'res-backend-python-asyncio'),
    coverage('quiz[0]', 'sse-wire-format', 'res-backend-whatwg-sse'),
    coverage('quiz[1]', 'asgi-disconnect', 'res-backend-asgi-http'),
    coverage('interviewQuestionIds[0]', 'streaming-model', 'res-backend-whatwg-sse', 'res-backend-openai-streaming'),
    coverage('interviewQuestionIds[1]', 'cooperative-cancellation', 'res-backend-python-asyncio', 'res-backend-asgi-http'),
    coverage('interviewQuestionIds[2]', 'streaming-model', 'res-backend-whatwg-sse'),
    coverage('exercise.steps[0]', 'client-contract', 'res-backend-whatwg-sse', 'res-backend-fastapi-sse'),
    coverage('exercise.steps[1]', 'cooperative-cancellation', 'res-backend-python-asyncio', 'res-backend-asgi-http'),
    coverage('completionCriteria[0]', 'client-contract', 'res-backend-whatwg-sse'),
    coverage('completionCriteria[1]', 'asgi-disconnect', 'res-backend-asgi-http', 'res-backend-python-asyncio'),
  ],
  'backend-03': [
    coverage('objectives[0]', 'queueing-intuition', 'res-backend-little-law'),
    coverage('objectives[1]', 'admission-control', 'res-backend-rfc6585', 'res-backend-dagor'),
    coverage('quiz[0]', 'queueing-intuition', 'res-backend-little-law'),
    coverage('quiz[1]', 'overload-loop', 'res-backend-sre-cascading'),
    coverage('interviewQuestionIds[0]', 'queueing-intuition', 'res-backend-little-law'),
    coverage('interviewQuestionIds[1]', 'admission-control', 'res-backend-rfc6585', 'res-backend-dagor'),
    coverage('interviewQuestionIds[2]', 'overload-loop', 'res-backend-sre-cascading'),
    coverage('exercise.steps[0]', 'capacity-experiment', 'res-backend-tail-at-scale', 'res-backend-sre-cascading', 'res-backend-coordinated-omission'),
    coverage('exercise.steps[1]', 'admission-control', 'res-backend-rfc6585', 'res-backend-dagor'),
    coverage('completionCriteria[0]', 'capacity-experiment', 'res-backend-tail-at-scale', 'res-backend-sre-cascading', 'res-backend-coordinated-omission'),
    coverage('completionCriteria[1]', 'queueing-intuition', 'res-backend-little-law', 'res-backend-tail-at-scale'),
  ],
  'backend-04': [
    coverage('objectives[0]', 'job-contract', 'res-backend-openai-background', 'res-backend-celery-tasks'),
    coverage('objectives[1]', 'worker-lease', 'res-backend-celery-tasks', 'res-backend-chubby'),
    coverage('quiz[0]', 'job-contract', 'res-backend-openai-background'),
    coverage('quiz[1]', 'queue-capacity', 'res-backend-celery-optimizing', 'res-backend-seda'),
    coverage('interviewQuestionIds[0]', 'job-contract', 'res-backend-openai-background', 'res-backend-celery-tasks'),
    coverage('interviewQuestionIds[1]', 'retry-routing', 'res-backend-celery-tasks', 'res-backend-celery-optimizing'),
    coverage('interviewQuestionIds[2]', 'queue-capacity', 'res-backend-celery-optimizing', 'res-backend-seda'),
    coverage('exercise.steps[0]', 'worker-lease', 'res-backend-celery-tasks', 'res-backend-chubby'),
    coverage('exercise.steps[1]', 'operational-proof', 'res-backend-millwheel', 'res-backend-celery-tasks'),
    coverage('completionCriteria[0]', 'job-contract', 'res-backend-openai-background', 'res-backend-celery-tasks'),
    coverage('completionCriteria[1]', 'worker-lease', 'res-backend-chubby', 'res-backend-celery-tasks'),
  ],
  'backend-05': [
    coverage('objectives[0]', 'source-of-truth', 'res-backend-postgres-transactions', 'res-backend-redis-eviction'),
    coverage('objectives[1]', 'semantic-cache', 'res-backend-redis-semantic-cache', 'res-backend-redis-eviction'),
    coverage('quiz[0]', 'source-of-truth', 'res-backend-postgres-transactions', 'res-backend-redis-eviction'),
    coverage('quiz[1]', 'semantic-cache', 'res-backend-redis-semantic-cache'),
    coverage('interviewQuestionIds[0]', 'transaction-boundary', 'res-backend-postgres-transactions', 'res-backend-aws-transactional-outbox'),
    coverage('interviewQuestionIds[1]', 'semantic-cache', 'res-backend-redis-semantic-cache'),
    coverage('interviewQuestionIds[2]', 'semantic-cache', 'res-backend-redis-semantic-cache'),
    coverage('exercise.steps[0]', 'cache-aside', 'res-backend-postgres-transactions', 'res-backend-redis-eviction', 'res-backend-go-singleflight'),
    coverage('exercise.steps[1]', 'consistency-tests', 'res-backend-postgres-transactions', 'res-backend-redis-semantic-cache'),
    coverage('completionCriteria[0]', 'consistency-tests', 'res-backend-postgres-transactions', 'res-backend-redis-eviction'),
    coverage('completionCriteria[1]', 'semantic-cache', 'res-backend-redis-semantic-cache', 'res-backend-redis-eviction'),
  ],
  'backend-06': [
    coverage('objectives[0]', 'idempotency-ledger', 'res-backend-rfc9110', 'res-backend-postgres-transactions', 'res-backend-aws-idempotent-apis'),
    coverage('objectives[1]', 'unknown-outcome', 'res-backend-rfc9110', 'res-backend-sre-cascading', 'res-backend-aws-idempotent-apis'),
    coverage('quiz[0]', 'delivery-semantics', 'res-backend-celery-tasks', 'res-backend-millwheel'),
    coverage('quiz[1]', 'unknown-outcome', 'res-backend-rfc9110', 'res-backend-sre-cascading', 'res-backend-aws-idempotent-apis'),
    coverage('interviewQuestionIds[0]', 'delivery-semantics', 'res-backend-celery-tasks', 'res-backend-millwheel'),
    coverage('interviewQuestionIds[1]', 'unknown-outcome', 'res-backend-rfc9110', 'res-backend-sre-cascading', 'res-backend-aws-idempotent-apis'),
    coverage('interviewQuestionIds[2]', 'outbox-inbox', 'res-backend-aws-transactional-outbox', 'res-backend-postgres-transactions'),
    coverage('exercise.steps[0]', 'assurance-table', 'res-backend-celery-tasks', 'res-backend-millwheel'),
    coverage('exercise.steps[1]', 'unknown-outcome', 'res-backend-rfc9110', 'res-backend-sre-cascading', 'res-backend-aws-idempotent-apis'),
    coverage('completionCriteria[0]', 'assurance-table', 'res-backend-celery-tasks', 'res-backend-millwheel'),
    coverage('completionCriteria[1]', 'outbox-inbox', 'res-backend-aws-transactional-outbox', 'res-backend-postgres-transactions'),
  ],
  'backend-07': [
    coverage('objectives[0]', 'lifecycle-states', 'res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'),
    coverage('objectives[1]', 'observability-model', 'res-backend-prometheus', 'res-backend-vllm-server'),
    coverage('quiz[0]', 'probe-semantics', 'res-backend-kubernetes-probes', 'res-backend-sre-cascading'),
    coverage('quiz[1]', 'observability-model', 'res-backend-prometheus'),
    coverage('interviewQuestionIds[0]', 'probe-semantics', 'res-backend-kubernetes-probes'),
    coverage('interviewQuestionIds[1]', 'graceful-shutdown', 'res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'),
    coverage('interviewQuestionIds[2]', 'observability-model', 'res-backend-prometheus', 'res-backend-vllm-server'),
    coverage('exercise.steps[0]', 'lifecycle-states', 'res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'),
    coverage('exercise.steps[1]', 'alerts-runbooks', 'res-backend-prometheus', 'res-backend-sre-cascading'),
    coverage('completionCriteria[0]', 'graceful-shutdown', 'res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'),
    coverage('completionCriteria[1]', 'alerts-runbooks', 'res-backend-prometheus', 'res-backend-sre-cascading'),
  ],
  'backend-08': [
    coverage('objectives[0]', 'load-test', 'res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'),
    coverage('objectives[1]', 'container-boundary', 'res-backend-docker-build-best-practices', 'res-backend-fastapi-containers'),
    coverage('quiz[0]', 'batching-tradeoff', 'res-backend-ray-batching', 'res-backend-sarathi'),
    coverage('quiz[1]', 'deployment-diagnosis', 'res-backend-fastapi-containers', 'res-backend-openapi'),
    coverage('interviewQuestionIds[0]', 'load-test', 'res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'),
    coverage('interviewQuestionIds[1]', 'scaling-units', 'res-backend-vllm-architecture', 'res-backend-vllm-server'),
    coverage('interviewQuestionIds[2]', 'load-test', 'res-backend-vllm-performance-tpot', 'res-backend-vllm-server'),
    coverage('exercise.steps[0]', 'load-test', 'res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'),
    coverage('exercise.steps[1]', 'deployment-diagnosis', 'res-backend-fastapi-containers', 'res-backend-openapi'),
    coverage('completionCriteria[0]', 'design-defense', 'res-backend-openapi', 'res-backend-vllm-architecture'),
    coverage('completionCriteria[1]', 'load-test', 'res-backend-vllm-performance-tpot', 'res-backend-coordinated-omission'),
  ],
};

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const backendEngineering = deepFreeze({
  id: 'backend-engineering',
  title: 'AI 后端工程',
  summary: '把多个客户端与 Agent run 组织成可流式、可异步、可恢复、可观测并能部署扩容的 AI 服务。',
  lessons,
  resources,
  interviewQuestions,
  coverageMatrix,
});
