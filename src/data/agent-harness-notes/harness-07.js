const sections = Object.freeze([
  Object.freeze({
    id: 'layer-concurrency-limits',
    title: '先区分并发、并行、吞吐与公平',
    paragraphs: Object.freeze([
      'Concurrency（并发）表示多个 run 在同一时间窗口交错推进，parallelism（并行）表示多个计算确实在同一时刻占用不同执行资源；两者都不等于 throughput（吞吐），后者是单位时间完成的有效工作量。增加 worker 可能提高并行度，却也可能先耗尽模型配额、数据库连接、sandbox 容量或第三方 API，令排队、限流和失败增加，最终吞吐反而下降。Fairness（公平性）则回答共享容量怎样分给不同租户和任务，不能用全局完成数掩盖单个租户长期饥饿。',
      'Concurrency limit（并发上限）应按最紧依赖分层：全局上限保护服务总容量；租户上限防止一个客户占满槽位；工具上限保护高成本或高风险工具；依赖上限对应搜索 API、数据库连接池或 sandbox provider 的真实容量。一个 run 内的子任务也要受上限约束。调度器只有同时取得所需层级的许可才启动工作，并在完成、取消或超时后释放；仅按 CPU 核数扩大全局 worker，会绕过外部依赖与租户隔离。',
      '公平没有唯一算法。课程可以使用每租户保留量、权重、轮转、等待时间 aging 与最大在途数的组合，并明确高优先任务可借用多少共享槽位、批处理最多等待多久。Google SRE 资料提供 per-customer limit、criticality、过载与级联故障的工程经验，但阈值和公平算法必须由本系统验证。AgentScope Runtime 的 AaaS、生命周期、sandbox 与状态服务只作实现交叉参照；仓库已进入只读迁移阶段并计划归档，相关能力并入 AgentScope 2.0，不能把其实现提升为通用调度保证。',
    ]),
    keyPoints: Object.freeze([
      '并发描述重叠推进，并行描述同时执行，吞吐衡量完成速率，公平性衡量容量分配。',
      '并发上限至少覆盖全局、租户、工具与共享依赖，并限制单个 run 的子任务。',
      '公平与优先策略需按业务验证；Google SRE 是工程经验，AgentScope 只是迁移中的第一方实现参照。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-sre-overload',
      'res-harness-sre-cascading',
      'res-harness-agentscope-runtime',
    ]),
  }),
  Object.freeze({
    id: 'design-a-bounded-durable-queue',
    title: '让 producer 写入有界耐久队列',
    paragraphs: Object.freeze([
      'Producer（生产者）接收新 run，先做身份、配额、幂等和 admission control，再把获准任务写入 durable queue（耐久队列）。这里的“耐久”表示任务不会只存在 producer 或 worker 的进程内存中，而是按所选队列服务的持久化契约保存；“有界”表示队列对消息数、字节、等待时间或租户积压有明确容量。队列能吸收短时突发，却不能创造下游处理能力，无界堆积只会把立即拒绝变成长时间等待、存储膨胀和过期任务。',
      '消息应只携带稳定 run 引用和调度元数据，例如 schemaVersion、runId、tenantId、idempotencyKey、priorityClass、enqueuedAt、notBefore、attemptHint 与 traceId。当前 state、checkpoint、审批记录和预算由权威存储按 runId 读取；大型输入、日志、模型上下文与二进制 artifact 放对象存储，并在消息中保留不可变引用、版本与哈希。把完整聊天或大产物塞进消息会放大复制、重投递、更新和敏感数据治理成本，也让旧消息携带过时状态。',
      '顺序与优先级必须写适用范围。FIFO（先进先出）只能在队列或分组提供的顺序边界内帮助重放，不能证明跨租户全局顺序，也不能阻止慢任务形成队首阻塞；严格 priority 可能让批处理永久饥饿。课程策略可按租户分队、在优先级内轮转并对等待任务 aging，但这只是可评审方案，不是 SQS 或 SRE 的通用协议。消息顺序也不能替代 run 内 event sequence 和幂等消费者。',
    ]),
    keyPoints: Object.freeze([
      '耐久队列保存获准任务，有界容量限制可吸收的突发；队列不是无限处理能力。',
      '消息只放稳定 run 引用与调度元数据，大状态和 artifact 进入权威存储或对象存储。',
      'FIFO 与 priority 都有局部边界，公平性、aging 和分队策略必须显式设计。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-sre-overload',
      'res-harness-sre-cascading',
      'res-harness-aws-sqs-visibility',
    ]),
  }),
  Object.freeze({
    id: 'consume-with-visibility-and-checkpoints',
    title: '用 visibility、续租、checkpoint 与确认消费',
    paragraphs: Object.freeze([
      'Worker receive 消息后不能立即把它当成永久所有权。Amazon SQS 的具体语义是：消息被接收后在 visibility timeout 内暂时对其他消费者不可见；处理成功后用 delete 删除消息作为确认；若未删除且 timeout 到期，消息重新可见并可能 redelivery。课程把这种带到期时间的临时处理权称为 Lease（租约）。Worker 应把 receipt、runId、workerId、lease/visibility 到期时间和 attempt 记录到运行状态，读取最新 checkpoint 后再开始。SQS 页面提供的是一种队列租约直觉，不是所有 durable queue 的统一 lease/ack 协议。',
      '长任务的处理时间可能超过初始 visibility。Worker 只有仍持有当前运行权限、持续产生进展且 deadline 允许时才续租；续租前先提交 checkpoint、事件游标和副作用账本，使接管者知道从哪里恢复。续租失败或 worker 失联后，另一个 worker 会在消息重新可见时接管，但旧 worker 也可能尚未完全停止，因此 run lease、fencing version 与幂等副作用仍不可省。成功路径是先持久化业务完成事实和终态 checkpoint，再 delete/ack；在业务事实提交前确认消息会造成任务丢失。',
      '至少一次投递意味着同一消息可能被处理多次。SQS 特别说明，即使 visibility 尚未到期也不能绝对排除重复，因此消费者应按 runId、eventId 和 intent key 检查已完成事实：已完成则只确认消息，不重做副作用；处理中则验证 lease；结果未知先对账。Visibility timeout 既不保证 exactly-once，也不等于分布式锁。队列层负责重新提供工作机会，Harness 状态机、checkpoint 和幂等协议负责让重复机会不破坏业务事实。',
    ]),
    keyPoints: Object.freeze([
      'SQS 是 receive 后暂时不可见、成功后 delete、超时后重新可见的具体实现，不是通用队列标准。',
      '长任务续租前保存 checkpoint；完成事实先持久化，随后才 ack/delete。',
      'Visibility 期间也可能重复，消费者必须用 run 状态、lease version 与幂等记录安全去重。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '不可见不等于只投递一次',
      body: 'Visibility 只降低同一消息同时被领取的机会；网络、确认丢失和队列语义仍可能带来重复，业务效果要由幂等消费者保护。',
    }),
    sourceIds: Object.freeze(['res-harness-aws-sqs-visibility']),
  }),
  Object.freeze({
    id: 'propagate-cancellation-across-queue-states',
    title: '分别处理排队、执行中与完成未确认的取消',
    paragraphs: Object.freeze([
      '取消不能只尝试“从队列删除一条消息”。Harness 先为 run 持久化带 sequence、原因、发起者和时间的 cancellation intent，阻止新的 admission 与 step。仍在 queued 的消息如果队列支持定位移除，可以删除并记录；否则 worker receive 后先查 run 状态，发现 cancelled 就不启动任务并安全 ack。仅依靠 producer 的内存标记会在进程重启或消息重投递后失效。',
      '执行中的 worker 收到取消后停止领取新子任务，传播 cancellation token，保存 checkpoint 与在途副作用，结束 sandbox，并在终态事实提交后 ack。若下游不支持取消，就把操作保留为 unknown 并继续对账，不能先确认消息再遗失恢复入口。Lease 到期导致另一 worker 接管时，新 worker首先检查 cancellation intent；旧 worker则必须被 fencing version 阻止继续提交。这套取消记录和 fencing 顺序是课程协议，不是 SQS visibility 页面自动提供的能力。',
      '最容易误判的是“业务已完成、delete/ack 尚未成功”。此时取消命令不能抹掉 completion event 或已发生副作用；消费者在 redelivery 时读到完成事实，应跳过执行并再次 ack，取消请求只作为迟到事件审计或按业务规则触发独立补偿。相反，如果只有本地计算结束而完成事实尚未提交，仍按执行中处理。Google SRE 的 cancellation propagation 是工程经验，也不定义 durable queue 中这三种状态的统一协议。',
    ]),
    keyPoints: Object.freeze([
      '排队任务持久化取消意图并在领取前检查，不能依赖 producer 内存或必然可删除消息。',
      '执行中任务传播取消、保存 checkpoint、记录未知副作用，并以 fencing 阻止失联 worker 提交。',
      '已完成未 ack 的任务以完成事实为准，重投递只补确认，迟到取消不能删除历史。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-sqs-visibility',
      'res-harness-sre-cascading',
    ]),
  }),
  Object.freeze({
    id: 'apply-backpressure-and-load-shedding',
    title: '用水位、拒绝和降级把压力传回上游',
    paragraphs: Object.freeze([
      'Backpressure（背压）是下游把“当前不能安全吸收更多工作”的信号传回 producer，使到达速率向可服务容量收敛。Admission control 在入队前同时检查全局、租户、任务类别、队列深度、oldest age、预计等待和关键依赖饱和度。Soft watermark（软水位）用于提前减速：降低租户接收率、停止非必要 fan-out、推迟批任务或提示客户端延后；hard watermark（硬水位）表示容量不能再安全扩张，必须拒绝新任务或只保留明确的关键流量。',
      '拒绝需要可操作反馈。同步入口可返回 overload 原因、可重试标志和基于容量策略的 Retry-After；这里的 Retry-After 是本课程建议的准入响应接口选择，用于告诉上游建议等待多久，并不是两份 Google SRE 正文直接规定的字段或统一标准。异步 producer 可减少拉取、暂停分区或把可延期任务写入独立延迟队列。Load shedding（负载丢弃）是在过载时主动拒绝低关键性工作以保护核心服务，degrade（降级）则用更便宜的模型、较小搜索范围或只读结果替代完整流程。Google SRE 资料支撑按资源衡量容量、客户限额、criticality、fail early、load shedding 与级联故障控制，但它不定义 durable queue 的 lease、ack、redelivery 或唯一阈值。',
      '交互请求与离线批处理不应共用一条无差别策略。交互流量重视等待上界，可以保留独立并发、在软水位收紧 fan-out、硬水位快速拒绝并给 Retry-After；批处理通常允许延迟，可降低优先级、缩小并发或重新排程，但仍需最大等待与最低份额，避免永久饥饿。恢复也要分阶段：水位下降并持续稳定后逐步放量，观察下游错误和 oldest age，不能一次移除全部限制形成新的流量尖峰。',
    ]),
    keyPoints: Object.freeze([
      'Admission control 同时观察分层配额、队列深度、等待年龄和下游资源，而不只看原始 QPS。',
      '软水位减速和降级，硬水位拒绝或保留关键流量，并向上游返回原因与 Retry-After。',
      '交互与批处理使用不同等待、优先和恢复策略，同时保留公平下限。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-sre-overload',
      'res-harness-sre-cascading',
    ]),
  }),
  Object.freeze({
    id: 'interpret-the-queue-lab',
    title: '用 Queue Lab 解释容量而非模拟分布式系统',
    paragraphs: Object.freeze([
      'Queue / Backpressure Lab 使用离散 tick。每个 tick 输入 arrival count、worker count、service capacity 和 max queue，admission policy 固定为 reject-new；新任务 duration 固定为 2。核心函数先取消指定活动任务、让已有 running job 按 service capacity 推进并完成，再增加 queued age、从队首填充空闲 worker，最后接纳本 tick arrivals：有 worker 就立即启动，否则在容量内排队，队满则 rejected。结果展示 started、running、queued、completed、completed this tick、rejected、utilization 与 oldest age。',
      '默认设置每 tick 到达 4 个任务、1 个 worker、服务量 1、等待队列上限 2。第一个 tick 会立即启动 job-001，把 job-002 与 job-003 放入队列，并拒绝 job-004；利用率为 100%。继续推进时，到达量持续大于可服务量，队列保持满载、oldest age 增长并持续拒绝。提高 worker 或 service capacity 可以改变完成与等待速度，提高 max queue 只会延后拒绝并扩大等待，不会改变长期服务率；把 worker 设为零则所有获准任务只能进入有限队列。',
      '实验是确定性教学模拟，不是 SQS、AgentScope 或真实分布式调度器。它没有 durability、visibility lease、ack 丢失、redelivery、网络分区、租户公平、priority 或自适应 admission，只展示单机 FIFO 与 reject-new 的一种结果。因此不能从图中推出通用容量公式或最佳策略；应把它当作可解释反例生成器：比较 arrival rate、worker、service rate 与 capacity，观察何时开始等待和拒绝，再把真实队列协议补回设计。',
    ]),
    keyPoints: Object.freeze([
      'Lab 的四个可调参数是每 tick 到达量（到达率代理）、worker 数、每 tick 服务量（它与固定 duration=2 共同决定单任务服务时长）和队列容量；admission policy 固定为 reject-new，不是第五个可调参数。',
      '结果用 started、running、queued、completed、rejected、utilization 与 oldest age 解释容量变化。',
      '模拟省略耐久、lease、重投递、公平和网络，不代表真实分布式调度器或通用最优策略。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-sre-overload',
      'res-harness-sre-cascading',
      'res-harness-aws-sqs-visibility',
    ]),
  }),
  Object.freeze({
    id: 'deliver-the-queue-protocol',
    title: '用三条过载轨迹验收队列协议',
    paragraphs: Object.freeze([
      '练习面对每分钟突发一百个长 run，先交付队列协议：消息字段与对象存储引用、run/idempotency key、优先级和租户、receive 与 visibility、续租条件、checkpoint 时机、完成后 ack/delete、失联 redelivery、重复消费、三阶段取消与故障审计。再写分层并发表，列全局、租户、工具和依赖的上限、获取与释放时机、公平策略及指标。容量阈值表则记录正常、soft、hard、恢复水位对应的 queue depth、oldest age、依赖利用率、admission、Retry-After、degrade 和 shedding 动作。具体数值须由任务服务时间和依赖容量验证。',
      '三条演练轨迹分别证明不同控制点。轨迹一让 worker 变慢：oldest age 上升，soft watermark 先限制批任务并降低接收，持续恶化后 hard watermark 拒绝新批任务。轨迹二让队列突发到硬容量：交互入口快速返回 Retry-After，已接收任务保持耐久，优先级与租户最低份额防止单租户占满。轨迹三让下游搜索 API 限流：依赖级并发先收紧，生产者降速，允许的任务按 Retry-After 重排；恢复时逐步放量，避免重试尖峰。',
      '最后用两道 quiz 与三道 interview 追问验收：能解释 visibility/ack 丢失为何要求幂等；能在硬容量时选择拒绝、降级或稍后重试；能区分并发、并行、吞吐和公平并给共享搜索 API 设置全局与租户两级上限；能处理 queued、running、completed-not-acked 的取消；能为交互与批处理制定不同背压。完成标准是用协议证明重复投递仍可恢复、资源始终有界，并用分层容量证明单租户不能压垮共享依赖。',
    ]),
    keyPoints: Object.freeze([
      '交付物是版本化队列协议、分层并发表、容量阈值表和三条可重放过载轨迹。',
      '轨迹分别覆盖 worker 变慢、队列硬满和依赖限流，并记录减速、拒绝、降级与恢复。',
      '所有测验、访谈追问和完成标准都应能从协议字段、指标和演练结果得到回答。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-sqs-visibility',
      'res-harness-sre-overload',
      'res-harness-sre-cascading',
      'res-harness-agentscope-runtime',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '机器 CPU 核数很多，就可以取消所有并发限制并获得更高吞吐。',
    correction: '模型配额、连接池、sandbox 和下游 API 可能先饱和；并发必须按全局、租户、工具和依赖分层限制。',
  }),
  Object.freeze({
    claim: '耐久队列可以无限吸收流量，只要不丢消息就不存在过载。',
    correction: '队列只缓冲突发，不创造服务能力；深度、字节和等待时间必须有界，并在水位处减速、拒绝或降级。',
  }),
  Object.freeze({
    claim: 'SQS 消息在 visibility timeout 内不可见，所以消费者一定不会收到重复消息。',
    correction: 'SQS 至少一次语义仍可能产生重复；visibility 不是 exactly-once 或分布式锁，消费者必须幂等。',
  }),
  Object.freeze({
    claim: 'Worker receive 消息后应立即 ack，避免处理期间再次投递。',
    correction: '先确认会在 worker 崩溃时丢失任务；应先提交业务完成事实和终态 checkpoint，再 ack/delete。',
  }),
  Object.freeze({
    claim: '把完整上下文和二进制产物放进队列消息，恢复时读取最方便。',
    correction: '大消息会放大复制、重投递和敏感数据风险；消息只保存稳定 run 引用，状态与产物进入权威存储。',
  }),
  Object.freeze({
    claim: '严格 FIFO 或最高优先级优先天然公平，也能替代背压。',
    correction: 'FIFO 可能队首阻塞，严格优先可能让低优先任务饥饿；二者都不减少到达量，仍需公平和 admission 策略。',
  }),
]);

export const harness07Note = Object.freeze({
  readingMinutes: 39,
  introduction: '前两课已经让单个 run 具备有限重试和幂等恢复，但生产 Harness 同时面对许多租户、子任务、sandbox 和下游依赖。若只增加 worker 或把所有请求塞进无界队列，短时突发会变成长等待，重投递会变成重复副作用，单个租户还可能耗尽共享容量。本章从并发、并行、吞吐和公平的区别出发，设计全局、租户、工具与依赖分层上限，再建立只携带稳定 run 引用的有界耐久队列，完整走过 receive、visibility/lease、续租、checkpoint、ack/delete、失联 redelivery 和幂等消费。随后分别处理三种取消状态，用 soft/hard watermark、准入拒绝、load shedding 与降级把压力传回 producer，并通过 Queue Lab 和三条过载轨迹验证资源始终有界。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '并发是任务重叠推进，并行是同时执行，吞吐是单位时间有效完成量，公平性描述共享容量分配。',
    '全局、租户、工具、依赖和单 run 子任务分别限并发，容量由最紧依赖而非 CPU 核数决定。',
    '耐久队列有明确容量，消息只保存稳定 run 引用和调度元数据，大状态与 artifact 放权威存储。',
    'SQS visibility 是具体实现语义：receive 后暂时不可见、成功后 delete、到期后可能 redelivery，但仍可能重复。',
    'Worker 续租前保存 checkpoint，完成事实先提交再 ack；重复消费者按 run、lease 与幂等账本决定 skip、接管或对账。',
    'Queued、running、completed-not-acked 三种取消路径不同，迟到取消不能抹掉完成事实。',
    '软水位用于减速和降级，硬水位用于拒绝或保护关键流量，并向 producer 返回原因与 Retry-After。',
    '交互流量重视等待上界，批处理允许延迟但仍需最低公平份额和最大等待时间。',
    'Queue Lab 只展示离散 FIFO 与 reject-new；它不是 durable queue、分布式调度器或通用最佳策略。',
  ]),
  nextStep: '下一课将处理“系统不是失败，而是在等待人或外部条件”的交付问题：区分 blocked、人工审批等待、failed 与 cancelled，设计可持续数小时或数天的恢复令牌，并把目标、状态、未决动作、审批、预算、错误证据、artifact manifest 与敏感性打包为 handoff bundle。本章的 run 引用、租约、取消事实、checkpoint、队列年龄和过载原因会成为 handoff 的关键输入，使接手者不仅知道任务在哪里，还知道它为何等待、是否仍持有执行权以及哪些副作用可能重投递。',
});
