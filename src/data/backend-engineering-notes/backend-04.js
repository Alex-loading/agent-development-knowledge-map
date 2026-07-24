function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend04Note = deepFreeze({
  readingMinutes: 27,
  introduction: '当研究任务超过一次交互可接受的时长，正确抽象不是“开一个后台线程”，而是把接纳、排队、领取、执行、提交和通知设计成可恢复协议。API 进程可能重启，broker 可能重投，worker 可能在任意指令后崩溃，GPU 任务还会占用大量不可抢占资源。本课用显式 job 状态、队列容量、租约与 worker 生命周期，把异步执行从框架调用提升为可以解释每个失败点的工程系统。',
  sections: [
    {
      id: 'job-contract',
      title: '异步 API 先创建可查询事实',
      paragraphs: [
        '提交接口应在返回前持久化最小权威事实：jobId、tenant、请求指纹、状态、创建时间和幂等键。响应通常是 202 加状态查询位置，表示服务已接受处理，而不是 worker 已开始或任务必然完成。客户端之后按 jobId 查询，也可以订阅事件；无论连接是否保留，任务身份和状态都不改变。',
        '状态机需要区分 queued、leased 或 running、succeeded、failed、cancellation_requested、cancelled 等阶段，并规定合法转换与终态。进度是辅助信息，不能取代状态；worker 上报 80% 后崩溃并不表示剩余工作可安全继续。每次转换记录 actor、attempt、时间、原因和版本，迟到更新使用条件写避免覆盖新终态。',
        '托管产品的 background mode 可以展示轮询和取消的接口形态，但它是当前产品语义，不等同于自建队列的持久性保证。自己的服务必须明确状态保留期、结果访问授权、取消尽力程度和未知结果处理。不要从某个 SDK 的状态字段反推 broker、数据库和外部副作用具有同样保证。',
      ],
      keyPoints: ['202 表示接受处理而非保证完成', '状态机和条件更新保护权威 job 事实'],
      sourceIds: ['res-backend-openai-background', 'res-backend-celery-tasks'],
    },
    {
      id: 'queue-capacity',
      title: '队列是可测容量而非无限缓冲',
      paragraphs: [
        '队列把接纳速率与执行速率解耦，但不能消除容量约束。若平均到达率持续高于 worker 完成率，深度和最老任务年龄都会增长，最终所有任务在开始前就超过 deadline。运营看板必须同时显示发布率、领取率、成功率、重试率、队列深度和年龄；仅看 broker 连接正常无法发现积压。',
        '长短任务共用一个 FIFO 队列会产生队头阻塞，prefetch 过大又可能让一个 worker 抢走大量任务却迟迟不执行。可以按模型、成本、优先级或预估时长路由不同队列，为交互与批处理设置不同并发池。预估会出错，所以还需要任务最大时长、租户配额和饥饿保护，不能只相信客户端申报的优先级。',
        'SEDA 的 stage 与显式 queue 提供拆分瓶颈的思路：每阶段有独立资源和反馈信号。但论文年代与工作负载不证明现代 async 框架或 GPU 服务必须采用同样结构。实际划分应围绕隔离价值和可观测瓶颈，例如 API 接纳、CPU 预处理、模型推理和结果提交，而不是把每个函数都变成网络队列。',
      ],
      keyPoints: ['用队列年龄和完成率判断真实积压', '按瓶颈隔离阶段，但避免无证据的过度拆分'],
      sourceIds: ['res-backend-celery-optimizing', 'res-backend-seda'],
    },
    {
      id: 'worker-lease',
      title: 'Worker 用租约表达暂时所有权',
      paragraphs: [
        'broker 交付消息后，worker 的“正在执行”只是暂时所有权。早确认可能在崩溃时丢任务，晚确认可能让完成附近的任务被重投；没有一种确认时机自动提供 exactly-once。应用应设计每次尝试都能识别 job 当前状态，使用 attempt 或 lease token 做条件更新，并让重复执行不会破坏业务事实。',
        'Chubby 论文展示的是 sequencer 与 generation validity：锁服务把可验证的 sequencer 交给持有者，受保护资源根据当前 generation 等信息拒绝 stale holder。应用到 worker 时，必须先确认结果存储或下游服务真的执行这项校验；不能只在 worker 本地保存一个“递增 fencing token”，也不能把 Chubby 机制夸大为所有 broker lease 的统一规范。',
        '优雅关闭时，worker 先停止领取新消息，再等待当前任务到安全点、提交状态并确认；超过 drain deadline 的工作要释放或让租约自然过期。强制终止测试应覆盖模型调用前后、数据库提交前后和 broker ack 前后。只有知道每个切点会重投、丢失还是产生未知结果，才能选择正确恢复动作。',
      ],
      keyPoints: ['broker 确认时机不能自动创造 exactly-once', 'sequencer/generation 只有被资源端验证时才能拒绝 stale holder'],
      sourceIds: ['res-backend-celery-tasks', 'res-backend-millwheel', 'res-backend-chubby'],
    },
    {
      id: 'retry-routing',
      title: '重试是新的受控尝试',
      paragraphs: [
        '重试应基于错误分类：临时网络错误、明确 429 或短暂依赖不可用可能重试；校验错误、权限拒绝和确定业务冲突不应重试；超时后的 unknown outcome 先查询或对账。每次重试保留相同 jobId 和业务幂等键，生成新的 attempt，并记录原因、计划时间和已消耗预算。',
        '退避、抖动、最大次数和截止时间共同限制重试放大。将失败消息立刻放回队首会形成热循环，挤压新工作；更适合使用延迟队列或计划时间。超过预算后进入明确 failed 或 dead-letter 状态，并附上可重放所需上下文，而不是让消息永久消失或无限占用 worker。',
        '任务路由还要防止 poison message。反复触发确定性崩溃的 payload 应隔离，保存版本、异常分类和最小安全诊断信息；修复代码后由运维选择重放。重放不是复制原消息就结束，还要检查 schema 兼容、幂等账本和下游副作用，避免旧任务在新版本产生不同解释。',
      ],
      keyPoints: ['按错误类别与剩余预算决定是否重试', '死信和重放必须保留版本与幂等上下文'],
      sourceIds: ['res-backend-celery-tasks', 'res-backend-celery-optimizing'],
    },
    {
      id: 'operational-proof',
      title: '用崩溃矩阵证明恢复路径',
      paragraphs: [
        '异步系统的测试单位不是单个函数，而是一系列可被中断的持久事件。为提交、发布、领取、调用模型、写结果、更新状态和确认消息画时间线，在每两个事件之间杀掉 API 或 worker。重启后检查 job 是否可查询、是否会重投、重复是否被识别，以及终态有没有被迟到尝试覆盖。',
        '观测字段至少包含 jobId、messageId、attempt、workerId、lease token、queue、enqueuedAt、startedAt、deadline 和状态版本。指标关注队列深度与年龄、领取到开始的等待、执行时长、成功失败取消、重试和死信。高基数身份放日志或 trace，不直接放入所有 metric label，以免观测系统先被任务量击穿。',
        'MillWheel 展示了持久状态和重复交付下构造处理语义的系统思路，但其框架内部 exactly-once processing 不能外推为任意 HTTP、数据库和现实副作用的 exactly-once。课程借它学习如何保存进度与去重证据；生产承诺仍要逐边界说明哪些动作可原子提交、哪些依赖幂等、哪些只能对账补偿。',
      ],
      keyPoints: ['在持久事件之间注入崩溃验证恢复', '逐边界陈述保证，避免泛化 exactly-once'],
      sourceIds: ['res-backend-millwheel', 'res-backend-seda', 'res-backend-celery-tasks'],
    },
    {
      id: 'queue-review',
      title: '队列设计评审关注最坏时刻',
      paragraphs: [
        '评审先计算每种任务的到达率、服务时间分布、资源需求和 deadline，再估算安全并发与最大等待。对于 GPU 长任务，还要考虑进程重启后模型加载期间没有完成率。容量表应明确队列达到软阈值时如何降级、达到硬阈值时如何拒绝，以及调用方能否稍后重新提交。',
        '随后检查所有权变化：消息发布前由 API 负责，进入 broker 后由队列保存，worker 领取后由租约表达暂时执行权，终态提交后由数据库保存结果。每次交接都要有稳定身份和可查询证据；若某一段只存在内存布尔值，进程崩溃就会造成无法判定的空白。',
        '最后审查运维动作。暂停队列、扩 worker、重放死信、撤销租约和迁移消息 schema 都需要权限、审计与回滚。工具界面不应允许无条件批量重放，因为旧副作用和新代码语义可能不同。先生成影响预览和幂等检查，再由操作员确认受控批次。',
      ],
      keyPoints: ['容量表包含模型加载与最坏恢复阶段', '任务所有权每次交接都留下持久证据'],
      sourceIds: ['res-backend-celery-optimizing', 'res-backend-celery-tasks', 'res-backend-seda'],
    },
  ],
  misconceptions: [
    { claim: '把函数交给 Celery 就获得可靠后台任务。', correction: '可靠性取决于持久状态、确认、重投、幂等、租约和崩溃恢复的组合设计。' },
    { claim: '队列可以无限吸收流量高峰。', correction: '持续过载必然让队列年龄增长，应设置容量、准入和明确的拒绝或降级策略。' },
    { claim: '消息晚确认就能保证任务只执行一次。', correction: '晚确认减少某些丢失窗口，却允许完成附近重投，消费者仍必须处理重复。' },
    { claim: '租约过期说明旧 worker 已停止。', correction: '旧进程可能只是暂停；应让资源端校验 sequencer/generation validity，并用副作用幂等处理迟到提交。' },
    { claim: '死信队列里的消息随时可以原样重放。', correction: '重放前要检查 schema 版本、修复状态、幂等记录和既有外部副作用。' },
  ],
  recap: [
    '异步提交先持久化可查询的 job 事实再返回 202。',
    '队列只能解耦速率，不能消除容量和 deadline。',
    '长短任务、模型和租户可以按瓶颈隔离资源池。',
    'broker ack、lease 与可验证 sequencer/generation 分别解决不同失败窗口，后者不是所有 broker 的统一规范。',
    '重试是带新 attempt、旧幂等身份和有限预算的受控动作。',
    '通过崩溃矩阵验证每个持久事件之间的恢复语义。',
  ],
  nextStep: '实现一个最小 job 表和 worker 协议：提交时持久化 job 与请求指纹，worker 领取时获得包含 generation 的 sequencer，结果存储只接受当前 generation。为发布前、领取后、模型返回后、结果提交后和 ack 前五个位置注入进程终止，记录重投次数、最终状态和副作用计数。再加入队列深度与年龄告警，证明系统在 worker 重启后既不静默丢任务，也不会让 stale holder 覆盖新结果。最后演练一次有界死信重放并保留完整可查询审计记录。',
  tests: {
    command: 'node --test tests/backend-engineering-data.test.js',
    exitCode: 0,
    summary: '目标数据测试全部通过，资源、笔记、覆盖矩阵与深冻结断言无失败。',
    verifiedAt: '2026-07-24',
  },
});
