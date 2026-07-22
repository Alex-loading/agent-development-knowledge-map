const sections = Object.freeze([
  Object.freeze({
    id: 'build-a-hierarchical-run-budget',
    title: '先把运行资源写成分层预算账本',
    paragraphs: Object.freeze([
      '上一课用 sandbox 硬上限约束代码能消耗的 CPU、内存和墙钟时间，本课把视角拉回整个 Agent run：Run budget（运行预算）是在任务开始前分配、执行中扣减、结束时对账的一组资源上限。课程账本至少区分 run、attempt、step 三层，并分别记录 modelCalls、toolCalls、tokens、cost、wallTime、retryAttempts 与 concurrencySlots。run 是业务任务总额度；attempt 是一次执行尝试可用的子额度；step 再为一个模型或工具边界预留资源。只设循环步数会漏掉“单步调用十分钟或花掉大部分费用”的风险。',
      '父子预算必须守恒，而不是每个子任务重新获得一份完整上限。父 run 分派两个并行子任务时，先从可用余额中保守预留各自的 token、费用、工具次数和墙钟窗口；子任务完成后只归还未承诺且未消耗的余额，已经发出的远端请求仍记作在途成本。每次 attempt 重启也继承 run 的剩余预算，不能因为 worker 更换就把 retry 次数和 deadline 清零。预算扣减与状态事件同边界持久化，才能在恢复后拒绝“账面还有、实际已花”的重复调用。',
      '预算不能全部花在主路径上。接近阈值时应进入收尾区，停止创建非必要子任务和新重试，保留生成 checkpoint、简短 summary、诊断证据或 handoff 所需的 token、工具次数和墙钟额度。若剩余量不足以安全完成写操作，就在动作前 blocked 或失败，而不是先发请求再发现无法记录结果。分层字段、预留与归还规则是本课程的 Harness 工程模板；SRE 的 retry budget、deadline 与过载经验提供设计依据，但具体比例和阈值必须由本系统负载验证。',
    ]),
    keyPoints: Object.freeze([
      'Run、attempt、step 分层共享模型、工具、token、费用、墙钟、重试和并发预算。',
      '父任务先预留、子任务按实际消耗、未使用余额再归还；重启 attempt 不会刷新总额度。',
      '接近耗尽时停止扩张，并保留 checkpoint、summary、诊断和 handoff 的收尾预算。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '预算像总账户，不像每层优惠券',
      body: '子任务和重试只能从同一 run 的余额领取额度，不能每进入一层就重新获得一套 token、费用和时间上限。',
    }),
    sourceIds: Object.freeze([
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
    ]),
  }),
  Object.freeze({
    id: 'separate-timeout-deadline-cancel-and-rollback',
    title: '把 timeout、deadline、cancel 与 rollback 分开',
    paragraphs: Object.freeze([
      'Attempt timeout 限制一次具体等待最多持续多久，例如一次模型调用或工具请求；absolute run deadline 是整个 run 的绝对最晚时刻，写成固定时间点并沿调用链向下传递。子步骤获得的有效 timeout 应取自身上限与 deadline 剩余时间中的较小值，不能在每一层重新获得完整十分钟。Timeout 只说明本地不再等待：请求可能尚未到达、仍在远端运行、已经成功但响应丢失，因而它既不证明远端取消，也不证明副作用 rollback。',
      'Cancellation 是传播停止意图的协作协议。Harness 创建带 runId、原因、发起者、时间和版本的 cancellation token，Runner 收到后停止派发新 step，并把信号传给子任务、模型流、工具客户端和 sandbox；每个边界记录 acknowledged、unsupported 或 timed_out。能取消的下游应返回可核验确认，不能取消的下游则把在途操作标为 unknown 并保留调用 ID，后续查询。Rollback 是业务事务或补偿动作，必须由工具契约单独定义；发出 cancel 不会自动撤销已经发送的消息、退款或文件写入。',
      '取消之后仍可能出现 late result。对纯计算或只读结果，Runner 可以保存诊断但不得让晚到数据把 cancelled 终态改回 running 或 succeeded；对外部写入，晚到成功是必须对账的事实，不能因为本地已取消就丢弃，也不能未经检查再次执行。若 deadline 到达，先持久化 timed_out 或取消意图及在途清单，再传播 token、等待有界宽限期并生成 checkpoint/handoff；下游不支持取消时，状态应明确表达 unknown，而不是伪称已经 rollback。',
    ]),
    keyPoints: Object.freeze([
      'Attempt timeout 限制一次等待，absolute deadline 限制整个 run；子步骤只能使用剩余时间。',
      'Cancellation 传播停止意图，rollback 是单独的业务语义，timeout 也不代表远端已经停止。',
      '取消后的晚到结果仍要记录和对账，但不得非法改写终态或触发重复副作用。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
      'res-harness-langgraph-fault-tolerance',
    ]),
  }),
  Object.freeze({
    id: 'classify-errors-before-choosing-actions',
    title: '先分类错误，再判断动作能否安全重放',
    paragraphs: Object.freeze([
      '错误分类先回答“等待或修正后条件会不会改变”。Transient 瞬态错误包括短暂网络中断或服务临时不可用，可在预算内重试；throttle 限流表示下游当前拒绝容量，应尊重 Retry-After 或服务信号后再排队；permanent 永久错误表示当前协议下不会自行恢复。Bad input 参数错误需要修正请求，authentication 或 authorization 失败需要更新身份、权限或进入 blocked，business conflict 业务冲突需要重新读取事实并改变决策。把这些类别统一写成“异常，重试三次”只会浪费预算或放大故障。',
      'Unknown outcome 结果未知必须单列：timeout、连接断开或取消竞态只能说明调用者没拿到确定答复，远端可能已处理。最安全的第一步通常是用稳定调用 ID 查询远端状态和副作用；只有确认未执行、动作可幂等去重且预算仍足够时，才考虑重试。查询也失败时应有限重试查询、等待人工或 handoff，而不是换一个请求标识再次写入。下一课会展开幂等账本，本课先守住一句话：错误可重试，不等于动作可安全重放。',
      '分类结果还要映射终态与下一动作：瞬态或限流进入有界 retry_wait；参数错误返回修正；权限缺失且可补充进入 blocked；明确永久错误或耗尽恢复策略进入 failed；业务冲突重新观察后决策；unknown 进入查询、对账或人工处理。Temporal 资料区分 retryable 与 non-retryable failure，AWS 与 Google 则提供生产工程经验，但这张分类表是课程综合，不是任何框架的统一枚举，实际系统还需按工具契约细化。',
    ]),
    keyPoints: Object.freeze([
      '区分 transient、permanent、throttle、bad input、认证授权失败、业务冲突和 unknown outcome。',
      '是否重试既取决于错误会否恢复，也取决于原动作能否幂等、去重或查询。',
      'Unknown outcome 先查询和对账；错误可重试绝不等于动作可安全重放。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-temporal-retry',
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
    ]),
  }),
  Object.freeze({
    id: 'bound-retries-and-prevent-amplification',
    title: '限制重试次数、退避上限与多层放大',
    paragraphs: Object.freeze([
      'Retry policy（重试策略）至少包含最大 attempts、initial delay、backoff multiplier、maximum delay、jitter、可重试类别和停止条件。每次失败后采用 capped exponential backoff：等待随次数增长但不超过上限，再加随机 jitter 打散同一时刻恢复的大量客户端；下游给出 Retry-After 时，以其可用语义和本地 deadline、最大退避共同决定下一时刻。任何等待前都先检查剩余 deadline、attempt 数和业务预算，若下一次尝试已无法在期限内完成，就立即停止而不是睡到过期。',
      '次数上限还不够，因为调用链的每层都可能重试。客户端重试三次、Harness 重试三次、工具代理再重试三次，最坏会把一次业务意图放大成多次下游尝试。应指定一个主要重试层，其余层暴露错误；同时为整条 run 设置 retry budget，例如按已接受请求分配可消耗重试额度，或用 token bucket 让失败尝试先取得令牌、以有限速率补充。令牌耗尽时 fail early、降级或 blocked，防止故障期的重试流量压垮正在恢复的服务。具体令牌参数属于课程工程设计，需按容量验证。',
      '来源边界必须写清。Temporal 当前文档中 Activity 与 Workflow 的默认策略不同，Activity 的 Maximum Attempts 未设上限时可能持续重试；课程仍要求显式有限 attempts，不能把平台默认照搬为最佳实践，而且 jitter 并不来自该 Temporal 页面。LangGraph 资料描述节点级 retry、timeout、error handler、失败来源与 graceful drain，部分能力要求 1.2 或更高；清理节点 buffered writes 不等于回滚远端工具副作用。Capped backoff、jitter、retry amplification 来自 AWS 工程经验，retry budget、deadline 与级联故障来自 Google SRE 经验，都不是跨系统普适参数。',
    ]),
    keyPoints: Object.freeze([
      '显式设置有限 attempts、capped exponential backoff、jitter、Retry-After 处理和 deadline 停止条件。',
      '只保留一个主要重试层，并用 run 级 retry budget 或 token bucket 抑制乘法放大。',
      'Temporal、LangGraph 是版本化框架语义；AWS 与 Google SRE 是平台工程经验，不是统一默认值。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '框架默认不是课程默认',
      body: '本课统一要求显式有限重试与可审计预算，但必须保留 Temporal、LangGraph 当前版本语义的差异，并在目标系统验证 AWS/SRE 参数。',
    }),
    sourceIds: Object.freeze([
      'res-harness-temporal-retry',
      'res-harness-langgraph-fault-tolerance',
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
    ]),
  }),
  Object.freeze({
    id: 'choose-policies-by-action-semantics',
    title: '让模型、只读查询与写操作采用不同策略',
    paragraphs: Object.freeze([
      '模型调用通常成本高、token 可计量且结果可重新生成，但重试会再次付费，也可能得到不同输出。策略应设置较长但有界的 attempt timeout，限制模型次数、输入输出 token 与费用；只对明确瞬态或限流错误有限重试，并保存 Retry-After、模型版本和已消耗 usage。若十分钟调用在本地 timeout 后没有服务端状态查询能力，不应假定旧请求已取消；可等待确认、接受晚到结果或按产品语义发起新 attempt，同时把两次成本都计入 run。',
      '只读查询没有业务写副作用，但仍可能给下游造成负载。它通常可以在连接错误、临时不可用或限流后重试，前提是查询语义稳定、deadline 和 retry budget 足够；缓存、分页游标或读版本变化也要记录，避免把不同时刻的数据误作同一快照。对于一毫秒本地纯计算，重算通常比频繁持久化便宜；对于昂贵远端检索，保存结果引用或 checkpoint 可以缩小恢复成本。可重读不等于可无限重试。',
      '写操作必须最保守。HTTP 500、timeout 或取消时，如果远端可能已经创建工单、发信或扣款，结果就是 unknown；没有幂等键、状态查询或去重契约时，不允许仅凭“错误瞬态”自动重放。应先查询或对账，必要时人工处理。只有动作语义支持相同业务意图去重、参数未变化、权限仍有效且预算足够，重试才可能安全。这样同一个错误分类会因动作不同得到不同决策，也为下一课的 intent record、idempotency key 和 side-effect ledger 留出清晰接口。',
    ]),
    keyPoints: Object.freeze([
      '模型重试会再次产生 token、费用和非确定输出，必须把旧请求与晚到结果计入同一 run。',
      '只读查询通常可重试但仍受负载、版本、deadline 和 retry budget 限制。',
      '写操作结果未知时先查询或对账；没有幂等和去重保证就不能自动重放。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
      'res-harness-temporal-retry',
    ]),
  }),
  Object.freeze({
    id: 'deliver-a-budget-ledger-and-cancel-timeline',
    title: '用一条检索、生成、写入轨迹证明策略',
    paragraphs: Object.freeze([
      '课程练习从一条三步 run 开始：检索资料、模型生成摘要、写入工单。预算账本为 run 记录 absolute deadline、总 token、cost、modelCalls、toolCalls、retryAttempts 与收尾预留；为每个 attempt 和 step 记录预留、已用、在途和归还量。父 run 分配检索与生成子预算，写入步骤只有在保留 checkpoint 和 handoff 额度后仍有足够余额时才可开始。不要填一组假装通用的固定数字，交付物应说明每个阈值怎样由服务目标、步骤成本和破坏面得到。',
      '错误决策表至少演练七类输入：检索网络抖动选择有限重试；429 按 Retry-After 和 deadline 排程；模型参数错误先修正；认证或授权失败进入 blocked；工单业务冲突重新读取；写入 timeout 作为 unknown 先查询；明确永久错误进入 failed。每一行同时写错误类别、动作语义、剩余 attempts、retry budget、幂等或查询能力、下一动作和终态理由，才能证明“为什么重试或不重试”，而不只是背选项。',
      '取消传播时序从用户发出 cancellation token 开始：Runner 停止新 step，通知检索、模型、工具与子任务，记录各自确认；deadline 到达时冻结新预算并保留收尾额度；对晚到只读结果只保存证据，对晚到写入成功转入对账；最后生成 checkpoint、summary 或 handoff。用这条轨迹回答两道测验和三道访谈追问：timeout 后为何先查状态，哪类错误不能原样重试，三种时间控制如何区分，HTTP 500 的读写策略为何不同，父子并行预算如何预留与归还。完成标准是能逐点标出 timeout、deadline、cancel、补偿，并用分类与预算证明每个决策。',
    ]),
    keyPoints: Object.freeze([
      '交付物包含分层预算账本、错误决策表和 cancellation token 传播时序。',
      '检索、模型与写入用同一决策字段，却因成本、可重放性和 unknown outcome 得到不同策略。',
      '两道测验、三道访谈追问和两条完成标准都必须能从同一轨迹的证据回答。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-temporal-retry',
      'res-harness-langgraph-fault-tolerance',
      'res-harness-aws-timeouts',
      'res-harness-sre-cascading',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '只要给 run 设置最大循环步数，就已经限制了时间、费用、token 和工具风险。',
    correction: '单步可能非常昂贵或持续很久；必须分别核算模型、工具、token、费用、墙钟、重试和并发，并让子任务共享总余额。',
  }),
  Object.freeze({
    claim: '本地 timeout 或 cancellation 返回后，远端请求一定已经停止，所有副作用也已经 rollback。',
    correction: 'Timeout 只结束本地等待，cancel 只是停止意图；远端可能仍在执行或已经成功，rollback 需要独立事务或补偿语义。',
  }),
  Object.freeze({
    claim: '只要错误属于 transient，就可以安全地用原参数再次执行任何动作。',
    correction: '错误能否恢复与动作能否重放是两个判断；写操作结果未知时仍需幂等、查询、去重或人工对账。',
  }),
  Object.freeze({
    claim: '每一层各自重试三次很保守，不会明显增加下游压力。',
    correction: '多层重试会乘法放大尝试次数；应指定主要重试层，并使用共享 retry budget 或 token bucket 限制故障流量。',
  }),
  Object.freeze({
    claim: 'Temporal、LangGraph、AWS 或 Google 给出的默认值可以直接当作所有 Harness 的统一重试策略。',
    correction: '框架语义受版本和对象类型影响，厂商文章来自特定生产环境；课程要求显式有限策略，但具体参数必须在本系统验证。',
  }),
  Object.freeze({
    claim: 'Run 被取消后，所有晚到结果都应直接丢弃，这样状态最干净。',
    correction: '晚到结果不能非法改写终态，但必须记录；写操作的晚到成功尤其需要对账，否则可能重复副作用或遗失业务事实。',
  }),
]);

export const harness05Note = Object.freeze({
  readingMinutes: 38,
  introduction: '一个 Agent run 同时消耗时间、模型次数、token、费用、工具调用和下游容量；当错误出现时，“再试一次”还会继续消耗这些资源，并可能重复外部副作用。上一课的 sandbox 解决执行进程能用多少硬资源，本课进一步建立跨 run、attempt、step、model 和 tool 的预算账本，区分 attempt timeout、absolute run deadline、cancellation 与 rollback，再把 transient、throttle、bad input、权限失败、业务冲突和 unknown outcome 映射成不同动作。你将学习有限 attempts、capped exponential backoff、jitter、Retry-After、retry budget 和多层放大控制，并用检索、模型生成与写入三类步骤完成预算账本、错误决策表和取消传播时序。所有框架默认与厂商经验都会保留适用边界：可重试的错误从来不自动意味着动作可以安全重放。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Run budget 分层覆盖 run、attempt、step、model 和 tool，并分别核算 token、费用、墙钟、重试与并发。',
    '父任务预留子预算，子任务只归还未使用余额；重启 attempt 不会刷新 run 的总 deadline 或重试次数。',
    'Attempt timeout 结束一次等待，absolute deadline 限制整条 run，cancellation 传播停止意图，rollback 是独立业务语义。',
    'Timeout 和 cancel 都不证明远端已停止；取消后的 late result 仍要记录，写入成功还必须对账。',
    '错误分类至少区分 transient、permanent、throttle、bad input、认证授权失败、业务冲突和 unknown outcome。',
    '错误可重试不等于动作可安全重放；unknown 写入先查询、去重或人工处理。',
    '有限 attempts、capped backoff、jitter、Retry-After 与 deadline 共同限制单层重试，retry budget 或 token bucket 限制跨层放大。',
    'Temporal Activity 默认可能无限重试且该页不提供 jitter；LangGraph 能力有版本和节点边界；AWS/SRE 参数是工程经验。',
    '接近预算耗尽时停止新工作并保留 checkpoint、summary、诊断或 handoff 的收尾额度。',
  ]),
  nextStep: '现在完成“设计分层运行预算”练习：为检索、模型生成和写入工单建立 run/attempt/step 预算账本，记录 absolute deadline、各步 timeout、modelCalls、toolCalls、tokens、cost、wallTime、attempts、retry budget、在途消耗与父子预留归还规则。再把网络抖动、429、参数错误、认证授权失败、业务冲突、永久错误和写入结果未知逐行映射为重试、等待、查询、修正、blocked、failed 或人工处理，并画出 cancellation token 从 Runner 传播到子任务、模型和工具以及晚到结果对账的时序。交付前用两道 quiz、三道 interview 追问和两条 completion criteria 验收，并确认收尾预算足以写 checkpoint、summary 或 handoff。下一课将深入 unknown 写入窗口，使用 intent record、idempotency key、side-effect ledger 与安全 resume 判断副作用是否已经发生。',
});
