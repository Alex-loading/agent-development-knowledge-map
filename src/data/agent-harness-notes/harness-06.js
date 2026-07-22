const sections = Object.freeze([
  Object.freeze({
    id: 'bind-retries-to-business-intent',
    title: '先把业务 intent 与执行 attempt 分开',
    paragraphs: Object.freeze([
      '上一课已经说明 timeout 后错误可能可重试，但写动作不一定可安全重放。本课先区分两个对象：business intent（业务意图）是“同一调用者要对同一业务对象达成同一结果”，例如为客户 C 的故障 I 创建一张严重级别为高的工单；attempt（执行尝试）则是为了实现这个意图发出的一次网络请求。进程重启、连接重置或队列重投递会增加 attempt，却不应自动制造新的 intent。幂等的目标不是让代码只运行一次，而是让同一 intent 的重复 attempt 不增加可观察业务效果。',
      'Idempotency key（幂等键）是调用方为同一 intent 提供并在所有重试、查询和恢复中复用的稳定标识。它必须在第一次远端调用前由可信宿主持久化，不能由模型临时编造，也不能每个 attempt 重新生成。仅对参数做哈希也不够：两个完全相同的创建请求可能本来就是两个合法业务意图。因此课程把 key 与 caller、tenant、tool、业务对象和 intentId 绑定，并另存 intent fingerprint（意图指纹），即对会改变业务含义的规范化参数、工具版本和授权上下文生成的稳定摘要，用来检测同键异意图，而不是用摘要代替人的意图标识。',
      'Key 还必须有明确 scope（作用域）与 TTL（保留期限）。作用域回答在哪个租户、调用者、工具和操作内判重；TTL 回答服务端保留去重事实多久。TTL 太短，晚到 retry 可能越过去重窗口；无限保留又会积累成本，并使未来合法 key 碰撞更难处理。恢复器必须比较首次记录的 createdAt、expiresAt 与当前时间：过期不能解释为“未执行”，而应查询 operationId 或转人工。AWS 文章提供的是 Amazon 服务设计中验证过的工程经验，具体 key 结构、作用域和期限必须按本系统的资源生命周期、最大重试延迟与合规要求验证。',
    ]),
    keyPoints: Object.freeze([
      'Business intent 表示一次业务目的，attempt 表示实现它的一次执行尝试；重试只能增加 attempt。',
      '稳定 key 在调用前由宿主持久化并复用，intent fingerprint 用于检查语义是否变化，不能替代 intent。',
      'Key 的 caller/tenant/tool 作用域和 TTL 都是协议的一部分；过期不是“确认未执行”。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '一张取号单，多次询问进度',
      body: 'Intent 像一次业务取号，attempt 像拿同一号码反复询问；每次换新号码就失去“这是同一件事”的证明。类比只解释标识关系，真实保证仍依赖服务端原子去重。',
    }),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
    ]),
  }),
  Object.freeze({
    id: 'require-an-atomic-server-dedupe-contract',
    title: '幂等保证必须落在服务端原子去重契约',
    paragraphs: Object.freeze([
      '客户端带上 key 只是提出判重请求，真正的幂等语义由接收服务实现。课程把服务端记录具体化为 dedupe record（去重记录）：在能覆盖业务写入的原子边界内保存 caller、scope、key、fingerprint、处理状态、operationId 和可返回结果，并防止两个并发首请求都通过“未见过 key”的检查。若先写业务对象后写记录，崩溃会留下“效果已发生、key 不存在”；若先单独写 key 后业务失败，又可能把未完成动作误报成功。AWS 的模式明确要求记录 token 与相关变更具备服务端原子一致性，这不是 Harness 单方面生成 UUID 就能补出的能力。',
      '同一 scope 下再次收到相同 key 与相同 intent fingerprint 时，服务端应返回首次处理的结果，或返回在业务意义上等价的当前结果，而不是再创建一张工单。语义等价不要求响应字节完全一致：时间戳或资源状态可能变化，但调用者仍应能判断这是原 intent 对应的同一 operationId 与业务对象。课程协议还要求首次处理进行中时返回明确的 in-progress 状态和查询引用；调用方随后查询，不能因为没拿到最终响应就换 key。',
      '相同 key 却带来不同的规范化参数、工具版本或关键授权语义时，应返回 idempotency conflict 或参数不匹配，并保留原记录供审计，绝不能静默采用新参数，也不能把旧成功结果冒充新意图的成功。若业务真的改变，例如把工单严重级别由高改为低，应先完成重新授权与业务决策，再创建新的 intent 和 key；若只是字段排序、默认值展开或无业务意义的表示差异，则由规范化规则得到同一 fingerprint。规范化字段和冲突策略必须版本化，否则部署升级可能把同一 intent 错判成不同请求。',
    ]),
    keyPoints: Object.freeze([
      '服务端必须原子组合 dedupe record 与业务变更，并处理两个并发首请求。',
      '同 key 同意图返回同一 operationId 对应的等价结果；处理中返回可查询状态而非重复创建。',
      '同 key 不同语义必须冲突；真正改变业务意图时经授权创建新的 intent 和 key。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '有 key 不等于有幂等',
      body: '只有接收方明确支持该 key、在正确作用域保存它，并把去重记录与业务写入原子处理，调用方才获得相应保证。',
    }),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
    ]),
  }),
  Object.freeze({
    id: 'persist-intent-and-side-effect-ledger',
    title: '调用前写 intent record，调用后推进副作用账本',
    paragraphs: Object.freeze([
      'Harness 还需要自己的 intent record 与 side-effect ledger（副作用账本），因为本地 checkpoint 和第三方服务通常不共享事务。调用前先取得单一写入权限并持久化 intent：至少记录 runId、callId、intentId、tool/version、caller/tenant、规范化参数、fingerprint、idempotencyKey、scope、expiresAt、审批引用与状态 pending。只有这条记录提交成功，才允许发出远端请求；否则恢复器连“本来要做什么、该用哪个 key 查询”都无法证明。账本字段集合是本课程综合协议，不是 AWS 或 LangGraph 发布的统一 schema。',
      '请求发出后，账本追加 attemptId、开始时间和传输状态；收到确定响应时记录 operationId、远端状态、结果摘要、证据引用与 succeeded 或 failed，再提交 completion event 并推进 checkpoint 游标。Unknown outcome（未知终态）表示调用方无法由现有证据判定远端是否已产生效果，例如请求中连接断开、远端成功但响应丢失，或成功结果已到达却在本地记账前崩溃。Unknown 不是 failed 的别名，也不是允许换 key 重试的理由；它要求把 pending 转为 unknown 或保持待对账状态，并冻结同一 intent 的新写 attempt。',
      '更隐蔽的窗口是账本已经记录成功、completion event 也已提交，但 checkpoint 仍停在调用前。旧 checkpoint 只说明控制状态没有推进，不能推翻较新的本地事实。恢复器应先取得 recovery lease，按 callId、intentId 和事件游标读取账本及完成事件，再决定补写 checkpoint。LangGraph 的 fault tolerance 可以保存可恢复控制状态，并在 timeout 时清理节点 buffered writes；这不等于撤销已发往工单、支付或消息服务的远端效果，也不替代 intent record。框架 checkpoint 的恢复能力只能在其版本与运行边界内使用。',
    ]),
    keyPoints: Object.freeze([
      '远端调用前先持久化 pending intent record，确保 key、指纹、授权与调用目标可恢复。',
      '账本分别记录 intent、attempt、operationId、远端证据、完成事件和 checkpoint 游标。',
      'Unknown outcome 不能降格成失败；旧 checkpoint 也不能覆盖较新的副作用证据。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
      'res-harness-langgraph-fault-tolerance',
    ]),
  }),
  Object.freeze({
    id: 'resume-by-lease-evidence-and-five-decisions',
    title: '用恢复 lease、证据优先级与五路决策续跑',
    paragraphs: Object.freeze([
      '安全 Resume 的第一步不是重放节点，而是用条件写取得 run 的 recovery lease，记录 owner、leaseVersion 与 expiresAt，阻止两个 worker 同时恢复同一 pending intent。接管者校验 checkpoint 版本和游标后，按原 idempotency key 或 operationId 查询远端；查询请求本身也要有 deadline、有限 retry 与预算。若查询 timeout，仍没有得到写入失败证据：只可在查询预算内再次查询或换获准的只读对账通道，预算耗尽、key 过期、权限不足或远端不可查询时转 manual/handoff，不能因此自动重放写入。',
      '课程把证据映射为五种动作。skip 用于已有可信 completion event 或账本 succeeded，表示不再调用；reconcile 用于远端成功但本地完成事实缺失，按原 operationId 补写 ledger、completion event 和 checkpoint；retry 只用于已确认未执行或服务端幂等契约有效、同 key 同 fingerprint、错误瞬态、权限仍有效且预算足够的情况；manual 用于未知写入、证据冲突、不可查询、不支持去重、key 过期或补偿含义不清；fail 用于远端明确失败、永久错误、无可用恢复路径或预算耗尽。五路枚举与优先级是课程综合，不是两份来源的标准 API。',
      '补偿与 retry 是不同动作。若确认原 intent 已成功，但业务随后要求撤销，应执行有独立授权、独立 intent/key 和审计记录的 compensate，例如关闭误建工单，而不是把账本改成“从未发生”。补偿可能失败，也可能不能恢复所有外部观察，因此不叫 rollback 魔法。若远端证据与本地 completion 冲突，或两个查询通道返回不同 operationId，恢复器必须保持 lease 或安全封存、停止自动推进并进入 manual；只有对账事实达成一致，才释放 lease 给后续 Runner。',
    ]),
    keyPoints: Object.freeze([
      '恢复先取得单一 lease，再校验本地游标并按原 key 或 operationId 查询，防止并发续跑。',
      'skip、retry、reconcile、manual、fail 由证据、服务端语义、权限与预算共同决定。',
      '补偿是新的受控副作用，不会抹去原事实，也不能被描述为通用 rollback。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: 'Unknown 期间禁止换 key 写入',
      body: '新 key 会让服务端看到新的业务意图；在原操作尚未对账时这样做，正是重复副作用最常见的来源。',
    }),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
      'res-harness-langgraph-fault-tolerance',
    ]),
  }),
  Object.freeze({
    id: 'exercise-every-retry-resume-evidence-path',
    title: '读懂 Retry / Resume Simulator 的全部证据组合',
    paragraphs: Object.freeze([
      '实验输入包括 read/write、completion event、transient/permanent/unknown、稳定 key、账本 none/pending/succeeded、远端证据 none/succeeded/failed，以及已用和最大 attempts。判定先查冲突：成功证据与远端失败或永久错误并存进入 manual；completion event 或账本 succeeded 得到 skip；仅远端 succeeded 得到 reconcile；远端 failed 或永久错误得到 fail；无证据的 unknown write 得到 manual。随后预算耗尽得到 fail，瞬态 read 或带稳定 key 的 write 才得到 retry，其余进入 manual。这个优先级防止“错误可重试”盖过完成或冲突事实。',
      '逐个运行预设：unknown-outcome 是无 key、账本和远端证据的 unknown write，所以 manual；before-call 是预算内 transient read，所以 retry，它只演示无副作用读取；after-remote-success 有远端成功却缺 completion event，所以 reconcile；after-completion-event 已有完成事件，所以 skip。Custom 用来组合证据：remote failed 或 permanent 会 fail；completion 与 remote failed 并存会 manual；attempts 用尽会 fail；transient write 加稳定 key 会显示 retry。',
      '模拟器不会访问真实服务，也不验证 key 的 scope、fingerprint、TTL、服务端原子去重、授权或“确认未执行”证据。它把“write 有稳定 key”简化为可重试候选，生产协议仍须补齐前述条件。交付要记录输入、decision、reason、missing evidence 与 next attempt，并说明 manual 退出所需证据，不能只截图标签。',
    ]),
    keyPoints: Object.freeze([
      '判定优先处理证据冲突与已有完成事实，再处理远端证据、永久失败、unknown、预算和 retry。',
      '四个预设分别得到 manual、retry、reconcile、skip；custom 用于构造 fail、冲突和预算组合。',
      '模拟器中的稳定 key 是简化输入，生产 retry 仍需验证 scope、fingerprint、TTL 与服务端去重契约。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
      'res-harness-langgraph-fault-tolerance',
    ]),
  }),
  Object.freeze({
    id: 'prove-five-crash-points-with-one-ticket-intent',
    title: '用同一工单 intent 验证五个崩溃点与保证边界',
    paragraphs: Object.freeze([
      '练习使用一个稳定 intent：为客户 C 的故障 I 创建工单。先画提交时序：取得写入 lease，持久化 intent record 与 key K，调用服务端，服务端原子建立 dedupe record 和工单并返回 operationId O，本地记录结果与 completion event，最后推进 checkpoint。第一处“调用前崩溃”有已提交 intent、无 attempt 和远端证据，确认没有并发调用且 lease 接管后可用 K 发出首次请求；第二处“请求中崩溃”有 attempt 但响应缺失，必须标 unknown 并先用 K 或 O 查询，不能依据本地空结果猜测。',
      '第三处“远端成功后崩溃”由查询得到 O 和成功事实，应 reconcile：补写账本、completion event 与 checkpoint，不再创建工单。第四处“本地记账后崩溃”已有 ledger succeeded 或 completion event，应 skip 远端调用并只推进缺失投影；第五处“checkpoint 后崩溃”恢复器看到游标已包含完成事件，同样 skip 并继续下一业务步骤。每条决策都要列出 call kind、原 key、fingerprint、TTL、ledger 状态、completion event、remote evidence、attempt budget、lease owner、动作和缺失证据，才能证明不是靠崩溃位置名称猜答案。',
      '最后验证保证边界。At-least-once 表示调用可能发生多次；服务端原子去重只能在其契约、scope 和保留窗口内把同一 intent 的业务效果限制为一次，不能为任意第三方工具或跨系统 checkpoint 提供通用 exactly-once。LangGraph 只恢复图的控制状态，buffered writes 清理也不是远端回滚；AWS 方案依赖服务端实现且来自平台工程经验。自有服务若在同一数据库事务中组合业务写入、dedupe record 和 outbox，可提升本服务内的提交保证，外部消费者仍需各自的投递、去重和对账条件。',
    ]),
    keyPoints: Object.freeze([
      '五个崩溃点共享同一 intent、key 与证据表，分别验证首次调用、查询、补写、skip 和继续。',
      '远端成功但响应或 checkpoint 丢失都先对账；确认成功后补账，不再重放业务写入。',
      '分别陈述 attempt、远端处理与业务效果的保证，不对任意工具承诺 exactly-once。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '交付物最小列',
      body: 'crashPoint｜intentId｜key/scope/TTL｜fingerprint｜ledger/event/checkpoint｜remote evidence｜lease｜decision｜missing evidence｜验证结果。',
    }),
    sourceIds: Object.freeze([
      'res-harness-aws-idempotent',
      'res-harness-langgraph-fault-tolerance',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '每次 retry 都生成新的 UUID，服务端就能知道这些请求属于同一业务意图。',
    correction: '新 key 表示新的请求身份，会切断首次调用、查询与重试的关联；同一 intent 必须复用调用前已持久化的稳定 key。',
  }),
  Object.freeze({
    claim: '只要请求带 idempotency key，任何第三方写操作都自动成为 exactly-once。',
    correction: '保证依赖服务端按正确作用域原子保存去重记录并返回等价结果；客户端 UUID、checkpoint 或 retry 本身都不能提供该语义。',
  }),
  Object.freeze({
    claim: '相同参数一定表示相同 intent，因此把全部参数哈希就能替代 caller-provided key。',
    correction: '调用者可能确实要创建两个参数完全相同的资源；fingerprint 用于检测语义变化，稳定 intent 标识才表达是否为同一业务请求。',
  }),
  Object.freeze({
    claim: 'Checkpoint 仍在调用前，足以证明远端副作用没有发生，可以直接再次调用。',
    correction: '远端可能已成功而响应或本地提交丢失；恢复器必须先读 intent/ledger，并按原 key 或 operationId 查询、对账和补写。',
  }),
  Object.freeze({
    claim: 'LangGraph 清除了 timeout 节点的 buffered writes，就等于工单、邮件或扣款已经回滚。',
    correction: 'Buffered writes 属于框架节点状态边界，不会撤销已发送到外部系统的副作用；外部事实仍需幂等、查询或补偿。',
  }),
  Object.freeze({
    claim: '补偿能把历史抹掉，所以执行补偿后可以删除原 operationId 和审计记录。',
    correction: '补偿是新的受控副作用，可能失败或只部分抵消业务影响；原动作、授权、结果和补偿证据都必须保留。',
  }),
]);

export const harness06Note = Object.freeze({
  readingMinutes: 43,
  introduction: '进程重启、节点重放或队列重投递不会让工单、消息或扣款自动消失。上一课把 timeout 后的写结果标为 unknown，本课继续追问：同一业务 intent 出现多个 attempt 时，Harness 如何识别重复、确认远端事实，并选择 skip、retry、reconcile、manual 或 fail。你将建立稳定 idempotency key、intent fingerprint、scope/TTL、服务端原子 dedupe record、调用前 intent record 与 side-effect ledger，再用原 key 或 operationId 对账和补写。五个崩溃点与 Retry / Resume Simulator 贯穿全文，同时保留边界：AWS 是依赖服务端配合的平台工程经验；LangGraph 恢复控制状态而不回滚远端副作用；账本、recovery lease 与五路决策是课程综合，不能包装成任意工具 exactly-once。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Business intent 是一次业务目的，attempt 是一次执行尝试；恢复和重试不能把同一 intent 变成新业务请求。',
    'Idempotency key 在首次调用前由宿主持久化并复用，fingerprint 检测关键语义变化，scope 与 TTL 限定判重边界。',
    '真正的幂等依赖服务端原子保存 dedupe record 与业务变更；Harness 单方面生成 UUID 不够。',
    '同 key 同意图返回同一 operationId 的等价结果，同 key 不同参数或关键语义必须返回冲突。',
    'Intent record 先于调用提交，side-effect ledger 区分 pending、unknown、succeeded 与 failed，并关联 attempt、远端证据和 checkpoint。',
    '远端成功但响应或 checkpoint 丢失时，用原 key 或 operationId 查询；成功则补写 ledger、completion event 与 checkpoint。',
    'Resume 先取得单一 recovery lease，再按证据选择 skip、retry、reconcile、manual 或 fail。',
    'Retry 要同时满足确认未执行或有效服务端去重、同一指纹、未过 TTL、权限有效、错误瞬态和预算充足。',
    '补偿是带独立授权和 intent 的新副作用，不会抹去原动作，也不等于自动 rollback。',
    'At-least-once 调度、幂等业务效果与 exactly-once 是不同承诺；LangGraph buffered writes 清理不能外推到远端工具。',
  ]),
  nextStep: '完成“演练崩溃后的安全续跑”：为创建工单定义 intentId、稳定 key、scope、TTL、fingerprint、服务端 dedupe record、operationId、side-effect ledger、completion event、checkpoint 游标和 recovery lease。按调用前、请求中、远端成功后、本地记账后、checkpoint 后注入崩溃，逐行记录本地与远端证据、missing evidence、五路决策及原因；再运行 Simulator 四个预设和 custom 的失败、冲突、预算耗尽、瞬态带 key 组合，说明教学简化与生产条件的差别。交付提交时序、五条恢复决策和“不重复创建工单”的验证记录，并用 quiz、interview 与追问检验同键异参冲突、查询再次 timeout 的 handoff 条件、事务 outbox 的局部保证，以及 durable control state 为何不等于外部工具 exactly-once。下一课把这些幂等消费者放入 durable queue，继续处理 lease、ack、redelivery、并发限制与背压。',
});
