function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend06Note = deepFreeze({
  readingMinutes: 27,
  introduction: '分布式系统最常见的可靠性陷阱，是把“请求重试成功”“消息确认完成”和“业务副作用只发生一次”说成同一件事。网络中断只会让调用方失去结果知识，动作本身可能成功、失败或仍在执行；broker 为避免丢失通常允许重复投递。本课逐层拆开 HTTP、消息、数据库和外部副作用的保证，用持久幂等账本、outbox、状态查询与人工对账，把 unknown outcome 转化为可以收集证据和做出安全决策的流程。',
  sections: [
    {
      id: 'delivery-semantics',
      title: '逐边界说明投递语义',
      paragraphs: [
        'at-most-once 倾向于不重复但可能丢失，at-least-once 倾向于不丢失但允许重复；所谓 exactly-once 往往只在特定框架、状态存储和操作边界内成立。HTTP 客户端、broker、数据库与邮件或支付系统各自有不同故障点，不能用一个标签覆盖整条链路。',
        '至少一次投递意味着消费者必须把重复视为正常协议情况，并通过幂等或去重保护业务事实。消息的唯一 id、jobId、业务操作键和 attempt 各有用途：messageId 识别交付，业务键识别希望只产生一次的效果，attempt 记录新的执行。若每次重试都生成新的业务键，去重机制就失去意义。',
        'MillWheel 的研究展示在框架控制的持久状态和数据流中构造 exactly-once processing 的方法，但论文结论不能自动覆盖外部 HTTP 和现实副作用。学习重点是将进度、去重和输出提交放入可恢复协议，而不是在架构图上写一个 exactly-once 箭头就省略失败矩阵。',
      ],
      keyPoints: ['投递语义只在明确边界内有意义', '至少一次要求消费者处理重复'],
      sourceIds: ['res-backend-celery-tasks', 'res-backend-millwheel'],
    },
    {
      id: 'idempotency-ledger',
      title: '持久幂等账本记录业务意图',
      paragraphs: [
        '幂等账本至少保存作用域、key、规范化请求摘要、状态、关联资源、响应摘要和有效期。首次请求以唯一约束抢占记录，相同摘要的重复请求返回已有进度或结果，不同摘要复用同一 key 则冲突。账本必须位于能保护业务创建的同一事务边界，进程内 set 或短 TTL 缓存无法覆盖重启和多副本。',
        '幂等不一定意味着“什么都不执行”。重复请求可能重新读取结果、刷新授权检查或等待原操作完成，但不能再次产生受保护副作用。对进行中的记录要处理 owner 崩溃：使用租约、状态版本和接管规则，而不是永久返回处理中。对失败记录则明确哪些错误可用同一 key 重试，哪些需要新业务意图。',
        'key 的作用域和保留期属于产品协议。租户 A 与租户 B 可以使用相同字符串但不能碰撞；创建报告与取消报告也不应共享命名空间。保留期至少覆盖客户端可能重试和消息可能重投的窗口，过期清理前评估副作用是否仍可能迟到，否则旧请求重现会被误当成新操作。',
      ],
      keyPoints: ['幂等账本绑定请求指纹与既有资源', '作用域和保留期必须覆盖真实重试窗口'],
      sourceIds: ['res-backend-rfc9110', 'res-backend-postgres-transactions'],
    },
    {
      id: 'unknown-outcome',
      title: '未知结果先对账再重试',
      paragraphs: [
        '调用外部服务超时时，调用方只知道没有按时收到响应，不知道远端是否执行。立即重试可能重复扣费、发送或创建资源；直接标记失败又可能漏记已发生动作。正确做法是把结果标为 unknown，保存远端请求标识和时间，然后用幂等键、查询 API、webhook 或账单记录收集证据。',
        '证据可能互相矛盾或暂时缺失，因此状态机应容纳 reconciliation_required，而不是强迫所有路径立即成功或失败。对账任务有独立重试预算和告警，找到远端成功后关联本地资源，确认未执行后才安全重试；长期无法判断则进入人工队列，并向用户提供诚实且不泄露内部信息的状态。',
        'HTTP 方法幂等语义有助于判断重复预期，但不代替远端实现保证。即使 PUT 被定义为幂等，远端计费、通知或审计可能仍记录多次；POST 也可能通过供应商幂等键安全重试。工程决策必须读取目标 API 的当前契约，并用沙箱故障实验验证，而不是只凭方法名称。',
      ],
      keyPoints: ['timeout 产生知识不确定性而非确定失败', '对账依赖可查询身份和持久证据'],
      sourceIds: ['res-backend-rfc9110', 'res-backend-sre-cascading'],
    },
    {
      id: 'outbox-inbox',
      title: 'Outbox 协调事实和发布意图',
      paragraphs: [
        '数据库提交业务事实后再发布消息会在两者之间崩溃，先发布后提交则可能让消费者看到不存在的事实。outbox 将业务行与待发布事件写入同一数据库事务，发布器随后读取并至少一次发送。即使发布器崩溃后重发，发布意图不会静默丢失。',
        'outbox 解决数据库事实与发布意图协调，而非所有外部原子性。消费者仍可能收到重复消息，因此 inbox 或业务幂等表保存已处理 messageId 与结果；如果处理同时修改本地数据库，可以在同一事务内写入去重记录。调用远端 API 仍位于事务外，需要远端幂等键或 unknown outcome 对账。',
        '发布器需要并发领取、租约、退避和可观察状态，不能只跑一个无状态循环。消息 schema 带版本，消费者应兼容部署窗口内的旧消息。清理 outbox 和 inbox 记录前，确认 broker 最大重投期、灾备恢复和审计要求；为了节省表空间过早删除会重新打开重复副作用窗口。',
      ],
      keyPoints: ['outbox 防止数据库提交与消息发布之间静默丢失', '消费者去重和外部副作用仍需独立协议'],
      sourceIds: ['res-backend-postgres-transactions', 'res-backend-millwheel'],
    },
    {
      id: 'retry-budget',
      title: '重试预算阻止级联放大',
      paragraphs: [
        '只有临时且可安全重复的错误才进入自动重试。每层都独立重试会形成乘法，例如客户端三次、API 三次、worker 三次可能造成二十七次下游调用。应尽量选择单一负责层，沿链路传递 attempt 与剩余预算，并在总 deadline 前停止，避免成功结果也无法及时交付。',
        '指数退避配合随机抖动降低同步重试，最大次数和最大持续时间提供硬上限。对于 429 和明确 Retry-After，仍要受本地预算约束；对于认证、校验、配额耗尽或确定冲突，不应通过重试隐藏配置和业务问题。断路器与准入可以在依赖明显故障时快速失败，保护恢复容量。',
        '故障演练要在副作用之前、远端成功后响应丢失、数据库提交后 ack 前等位置中断。日志按 idempotencyKey、jobId、messageId、attempt 和 remoteRequestId 串联，最终核对本地事实、远端事实、消息状态和账本。目标不是观察“最终成功”，而是证明每个重复和 unknown outcome 都走入预先定义的安全分支。',
      ],
      keyPoints: ['跨层重试需要共享总预算和明确责任层', '故障注入验证重复、未知结果与对账分支'],
      sourceIds: ['res-backend-celery-tasks', 'res-backend-sre-cascading', 'res-backend-postgres-transactions'],
    },
    {
      id: 'assurance-table',
      title: '用保证表替代模糊可靠性口号',
      paragraphs: [
        '为每一步列出发起方、接收方、稳定身份、提交点、失败可见性、重复可能和恢复动作。例如 HTTP 接纳的提交点是 job 事务，broker 交付可能重复，模型超时可能 unknown，结果状态用版本条件提交。表格迫使团队说明证据从哪里来，也能暴露某个副作用没有查询接口。',
        '保证表还要写不保证什么。幂等键不保证无限期去重，outbox 不保证远端动作原子，ack 不保证业务成功，取消不保证副作用撤销。将这些边界放进客户端文档和运行手册，能避免故障时不同团队依据不同假设同时采取重试，反而扩大损害。',
        '以表格生成测试矩阵，在每个提交点前后丢包、崩溃、超时和重复。测试不仅断言最终数据库值，还核对尝试数、远端执行数、账本证据和告警。若某场景只能人工判断，也应把收集命令、权限、升级路径和用户沟通模板作为协议的一部分。',
      ],
      keyPoints: ['逐步骤记录提交点、重复窗口和恢复证据', '明确不保证事项能防止故障时错误重试'],
      sourceIds: ['res-backend-celery-tasks', 'res-backend-millwheel', 'res-backend-sre-cascading'],
    },
  ],
  misconceptions: [
    { claim: '至少一次投递表示任务至少成功执行一次。', correction: '它描述交付可能重复，不保证业务执行成功；消费者还要处理失败、重复与终态提交。' },
    { claim: 'HTTP 幂等方法保证内部只运行一次。', correction: '协议约束重复请求的预期效果，不证明内部执行次数或外部副作用 exactly-once。' },
    { claim: '超时以后立刻重试是最可靠做法。', correction: '超时可能是 unknown outcome，应先用远端身份或幂等键查询，避免重复副作用。' },
    { claim: 'Outbox 能让所有跨系统动作原子提交。', correction: '它协调本地事实和发布意图，消费者重复与远端副作用仍需去重、幂等或对账。' },
    { claim: '每一层各重试三次只会多三次请求。', correction: '嵌套重试会乘法放大调用，应指定责任层并共享总尝试和时间预算。' },
  ],
  recap: [
    'at-least-once、at-most-once 和 exactly-once 必须带上具体边界。',
    '至少一次投递要求持久幂等或去重处理。',
    '幂等账本保存作用域、请求指纹、状态和既有结果。',
    '超时产生 unknown outcome，应先收集证据并对账。',
    'outbox 解决本地事实与发布意图协调，不覆盖所有外部动作。',
    '重试应按错误分类并受跨层总预算限制。',
  ],
  nextStep: '画出一次任务从 HTTP 提交、数据库事务、outbox、broker、worker 到远端模型和结果提交的事件账本。为每个事件记录业务幂等键、messageId、attempt 和可查询证据，并在任意两个事件之间注入崩溃或响应丢失。验证重复交付不会生成第二份业务结果，unknown outcome 会进入对账而非盲重试，超过预算的任务会形成明确终态和人工处理清单。再配置客户端、API 和 worker 各自重试，测量未共享预算时的乘法调用次数；随后只保留一个责任层并传递剩余 deadline，对比下游压力和用户成功率。选择一个没有状态查询接口的模拟副作用，写出停止自动化、收集日志、人工核验和补偿的升级流程，证明系统不会用虚假的 failed 或 cancelled 掩盖未知事实，并由另一位值班人员按流程独立复核全部证据与最终业务结论，留存完整对账档案。',
});
