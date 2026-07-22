const sections = Object.freeze([
  Object.freeze({
    id: 'separate-facts-projections-and-recovery-points',
    title: '先分清事实、投影、恢复点与普通日志',
    paragraphs: Object.freeze([
      '上一课的 Runner 生命周期回答“一个 run 现在处在哪个阶段”，这一课进一步回答“这个结论依据什么保存、进程消失后怎样继续”。先把四类记录拆开：run state 是面向下一步决策的当前结构化投影；append-only event log 是按发生顺序追加的领域事实；checkpoint 是从某个已提交控制位置恢复所需的状态封装；ordinary log 则主要服务检索、排障与运维观察。它们可能描述同一次动作，却有不同的不变量，不能因为都能写成 JSON 就合并成一张覆盖写的聊天表。',
      '以资料整理 run 为例，模型完成检索计划后可追加 plan_created 事件；state 把 phase 投影为 collecting、把 nextAction 投影为 fetch_source；checkpoint 还要封装恢复游标、schemaVersion、已确认副作用引用与继续执行位置；普通日志可以记录耗时、worker 名称和调试上下文。事件回答“发生过什么”，state 回答“此刻下一步需要什么”，checkpoint 回答“新进程从哪里安全接手”，普通日志回答“运行时看到了什么”。日志级别调整或保留期结束，不应改变业务事实。',
      'OpenAI Agents SDK 的 RunState 资料支持“可序列化状态可承载上下文、usage、interruptions 与暂停恢复”，但它并不是追加事件协议；LangGraph 资料区分 thread 图状态/历史与跨 thread store；Temporal 资料展示自身的追加式 Workflow Event History。三者能帮助建立职责分离的直觉，却不能拼成一个跨框架标准。尤其要记住 checkpoint 不等于长期 memory：checkpoint 服务特定 run 的耐久恢复，长期 memory 还涉及跨任务信息选择、保留、检索、删除与治理。',
    ]),
    keyPoints: Object.freeze([
      'State 是当前投影，event log 是追加事实，checkpoint 是恢复提交点，ordinary log 是诊断记录。',
      'Checkpoint 只解决特定 run 的耐久恢复，不等于跨任务长期 memory。',
      '框架文档提供具体实现证据，不定义所有 Harness 都必须遵守的统一语义。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-run-state',
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
  Object.freeze({
    id: 'design-a-versioned-persistence-model',
    title: '用版本化 schema 表达三种职责',
    paragraphs: Object.freeze([
      '课程练习要求为两小时资料整理 run 设计三类记录。可以把 run_state 设为每个 run 一条当前投影，至少含 runId、stateVersion、phase、nextAction、lastEventSequence、budget、pendingEffectRefs 与 updatedAt；把 run_event 设为不可覆盖的事实表，至少含 runId、sequence、eventId、eventType、schemaVersion、occurredAt、actor、causationId、correlationId 和 payload；把 run_checkpoint 设为带 checkpointId、runId、checkpointVersion、eventCursor、controlPosition、statePayload、confirmedEffectRefs、createdAt 与 checksum 的恢复封装。字段名不是行业标准，但事实、派生值与恢复元数据必须可辨认。',
      '事实字段记录已经被系统接受的输入或结果，例如 tool_completed、approval_received 及其稳定引用；派生字段则由事实归并得到，例如当前 phase、累计 usage 或 nextAction。不要把可重算的摘要伪装成唯一事实，也不要让 state 中一个未经事件确认的覆盖写抹去历史。状态更新可使用 expectedStateVersion 做乐观并发控制；事件用 runId 加 sequence 保证每条 run 内的明确位置，再用 eventId 支持重复提交去重；checkpoint 的 eventCursor 必须说明它包含到哪条已提交事件。',
      '这里的统一数据 schema 是课程为了完成“同一轨迹生成 state、event log 与 checkpoint”而提出的工程综合，不是 OpenAI、LangGraph 或 Temporal 的共同规范。OpenAI 的 RunState schema、LangGraph 的 checkpoint/thread 语义、Temporal 的事件类型与历史限制各自属于具体产品。实现时可以借鉴其职责分离，但必须为自己的数据库、事务能力、保留策略、负载与合规要求定义字段、索引和上限；不能把某框架能序列化状态直接外推成通用事件日志或通用迁移协议。',
    ]),
    keyPoints: Object.freeze([
      '事件带顺序、唯一标识与 schema 版本；state 带投影版本；checkpoint 带事件游标、控制位置与校验信息。',
      '先标注哪些字段是事实、哪些是派生值，再决定写入和重建规则。',
      '统一 schema 属于课程工程设计，必须按本系统事务与保留条件验证。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-run-state',
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
  Object.freeze({
    id: 'commit-events-and-projections-atomically',
    title: '守住事件顺序、去重与原子提交边界',
    paragraphs: Object.freeze([
      '一次本地状态转换的理想提交边界是：校验旧 stateVersion 和预期事件游标，插入唯一 eventId 的新事件，以该事件更新 state 投影，必要时写入指向同一 eventCursor 的 checkpoint，然后在同一个数据库事务中提交。这样读者不会看到“state 已经进入下一阶段但事实事件不存在”，也不会看到 checkpoint 宣称包含尚未提交的事件。若存储系统无法把三类写放进同一事务，就必须显式设计 outbox、提交标记或可修复的中间状态，而不是把多次成功概率称为原子。原子提交边界同样是本课程的工程要求，并非三份框架资料给出的统一保证。',
      '事件顺序需要按 run 定义，而不是依赖跨主机时间戳。为每条 run 分配单调 sequence，并对 runId 加 eventId 建唯一约束；写入者携带 expectedSequence，冲突时重新读取而不是跳号覆盖。若消息重投导致同一 eventId 再来，返回第一次提交结果；若相同 eventId 携带不同 payload，则记录冲突并停止自动推进。消费者更新投影时保存 lastAppliedSequence，重复事件直接忽略，遇到序列缺口则暂停并补齐，不能把后到事件误当最新事实。',
      '当 state 与 event log 最新事实不一致时，先冻结该 run 的自动推进并确认权威边界：验证事件唯一性、顺序和提交标记，从最近可信 checkpoint 或空投影开始，按已提交事件重建临时 state，再与现有 state 做字段级比较。若临时投影通过不变量校验，就以新的 stateVersion 原子替换派生 state，并留下 repair 事件或审计记录；若事件本身缺失、冲突或依赖外部事实，则进入人工对账。普通应用日志只能帮助定位写入者，不能凭一条“success”文本篡改领域事实。',
    ]),
    keyPoints: Object.freeze([
      '事件、投影和 checkpoint 必须指向同一已提交边界；不能把部分成功称为原子。',
      '用每个 run 的 sequence 管顺序，用 eventId 唯一约束和首次结果管去重。',
      'State 不一致时从可信事实重建派生投影，普通日志不是修复依据。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
  Object.freeze({
    id: 'place-checkpoints-at-risk-boundaries',
    title: '按恢复风险选择 checkpoint 时机',
    paragraphs: Object.freeze([
      'Checkpoint 频率不是“越多越可靠”。保存过少会扩大恢复点目标所允许的重算窗口：十分钟模型调用若只在调用前保存，崩溃后可能再次付出十分钟和一轮费用；保存过多则产生写放大、延迟、锁竞争、存储成本和更多部分提交机会。一毫秒纯计算可从事实快速重放，通常不值得每步生成完整快照。应先列出每个步骤的重算成本、外部副作用、暂停可能性和允许丢失的工作，再选择恢复点，而不是机械地每轮保存或只在退出时保存。',
      '四类关键位置通常值得评估：昂贵模型或工具结果被接受之后，避免重复昂贵工作；外部副作用之前，保存 intent、幂等键或远端操作引用，说明下一次恢复要对账什么；副作用确认之后，把结果事件、state 与恢复游标推进到同一提交边界；人工暂停和 run 终态之前，确保新进程或审计者得到完整上下文。对于无副作用、便宜且确定的连续步骤，可以周期性或增量保存，前提是重放仍满足预算与时延目标。',
      '“副作用前后各一个 checkpoint”也不是 exactly-once 魔法：本地 checkpoint 与第三方 API 通常没有共同事务，调用已成功而确认 checkpoint 未提交时仍存在模糊窗口。Durable 只说明编排状态能跨进程持续，不保证任意外部副作用 exactly-once。恢复器应使用稳定幂等键或远端操作 ID 查询事实；若外部系统既不可查询又不支持去重，就停止自动重试并转入人工对账。LangGraph 和 Temporal 的具体恢复、重放语义也只能在各自文档边界内解释。',
    ]),
    keyPoints: Object.freeze([
      'Checkpoint 频率权衡恢复窗口、步骤成本、写入延迟与一致性风险。',
      '优先评估昂贵步骤、外部副作用前后、人工暂停与终态边界。',
      'Durable checkpoint 不会把无共同事务的第三方副作用变成 exactly-once。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
  Object.freeze({
    id: 'recover-with-a-single-lease-and-replay',
    title: '以单一恢复 lease 校验、重放并续跑',
    paragraphs: Object.freeze([
      '进程重启后，第一步不是加载最后一条聊天消息，而是为 run 获取带 owner、leaseVersion 和 expiresAt 的单一恢复 lease。获取必须是条件写，只有无有效 lease 或旧 lease 已过期时才成功；续租也必须匹配 owner 与 leaseVersion，防止失联 worker 复活后继续写入。接管者随后读取候选 checkpoint，验证 checksum、schemaVersion、runId、checkpointVersion、eventCursor 和控制位置，再确认游标不超过最后已提交事件。恢复 lease 是课程为排除并发续跑提出的工程机制，不是所引用框架共同承诺的 API。',
      '通过验证后，把 checkpoint 的 statePayload 装入临时状态，从 eventCursor 后一条开始按 sequence 重放已提交事件；重复 eventId 不再应用，发现缺口、未知关键事件或不变量失败就停止。在继续模型或工具之前，对账 pending 副作用：有幂等键或远端操作 ID 时先查询，确认成功便补写完成事实，确认未执行才允许沿原意图重试，结果未知则不得猜测。最后以新的 stateVersion 和 leaseVersion 提交恢复完成事件，才把 run 交给 Runner 继续。',
      '旧 checkpoint 保存的是过去条件，不是今天的授权。恢复时必须重新取得或验证外部文件、模型与工具版本、凭证、资源级权限、审批有效期、预算余额、依赖服务状态和产物哈希；任何关键条件改变都应重新审批、降级、blocked 或人工 handoff。若最后 checkpoint 损坏但 event log 完整且事件版本可读，可退回更早可信 checkpoint，或从初始状态顺序重建并生成新的 checkpoint；如果关键事件缺失或迁移无定义，就不能用普通日志猜出状态。',
    ]),
    keyPoints: Object.freeze([
      '先条件获取单一恢复 lease，再读 checkpoint，避免两个 worker 同时续跑同一 run。',
      '校验 checkpoint 后只重放游标之后的已提交事件，并对账所有 pending 副作用。',
      '恢复必须重新验证权限、审批、依赖、预算和产物，旧快照不是永久许可。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-run-state',
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
  Object.freeze({
    id: 'migrate-schemas-and-test-crash-windows',
    title: '用版本迁移和崩溃演练证明可恢复',
    paragraphs: Object.freeze([
      'Schema version 必须跟随会影响解释方式的记录，而不只是跟随应用发布号。事件尽量保持不可变：新读者通过按 eventType 与 schemaVersion 注册的 upcaster 把旧 payload 转成当前内存模型；checkpoint 可以在读取时迁移并以新 checkpointVersion 重写，但应保留来源游标和迁移审计。部署采用 expand-read-contract：先让新代码同时读取旧版并写兼容字段，再回填或生成新 checkpoint，确认所有活跃 run 可恢复后才停止旧写法。遇到未知关键版本、校验和失败或不可逆语义变化时，应拒绝自动续跑而不是静默填默认值。',
      '把练习中的四个提交点落到时序图：一，模型结果被接受后提交 model_completed 事件与 state；二，外部工具调用前提交 effect_intended、幂等键和 checkpoint；三，查询或调用确认后提交 effect_confirmed、派生 state 与新 checkpoint；四，资料汇总产物校验后提交 artifact_verified 与终态 checkpoint。分别在“远端成功但本地确认前”“事件写入后投影前”“checkpoint 写入中”“新旧 schema 混跑时”注入崩溃，记录恢复器读到的版本、游标、lease、对账动作和最终选择，才能暴露模糊窗口。',
      '自测时用同一条轨迹回答课程的两道测验与三道访谈题：能够说明 event log 保存变化事实而 state 是当前投影；能够按十分钟调用与一毫秒计算的差异选择 checkpoint；能够区分 state、event log、checkpoint；能够解释频率权衡；能够完整口述“取得单一 lease—校验版本和游标—对账 pending 副作用—重放—重验依赖—从已提交边界继续”。最终交付应包含版本化数据 schema、四个提交点和崩溃恢复时序图，并明确每一种失败落入自动恢复、回退、blocked 或人工对账中的哪一类。',
    ]),
    keyPoints: Object.freeze([
      '事件版本通过显式 upcaster 兼容，checkpoint 迁移保留来源游标与审计链。',
      '通过四个提交点和多个崩溃窗口演练验证协议，而不是只画成功路径。',
      '未知关键版本、事件缺失或副作用未知时应停止自动推进。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-run-state',
      'res-harness-langgraph-persistence',
      'res-harness-temporal-event',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Run state、event log、checkpoint 和普通日志只是四份重复数据，保留其中一份就够了。',
    correction: '四者分别优化当前决策、事实审计、耐久恢复和运行诊断；可以相互校验，但权威性、写入规则和保留策略不同。',
  }),
  Object.freeze({
    claim: 'Checkpoint 就是长期 memory，恢复后也可以把旧权限、审批和依赖直接沿用。',
    correction: 'Checkpoint 只封装特定 run 的恢复状态与控制位置；跨任务记忆另有治理，恢复时还必须重验权限、审批、依赖和外部资源。',
  }),
  Object.freeze({
    claim: 'Checkpoint 保存越频繁一定越安全，最好每个微小计算都写完整快照。',
    correction: '高频保存会增加写放大、延迟与部分提交风险；应按恢复窗口、重算成本、副作用边界和一致性要求选择时机。',
  }),
  Object.freeze({
    claim: '框架支持 durable execution 或 replay，就意味着第三方工具调用天然 exactly-once。',
    correction: '本地持久化与外部系统通常没有共同事务，仍需幂等键、远端查询、去重、补偿或人工对账来处理模糊窗口。',
  }),
  Object.freeze({
    claim: '重启后只要读取最新 checkpoint 并再次调用模型，恢复流程就完成了。',
    correction: '还要取得单一恢复 lease，校验版本、校验和与事件游标，对账 pending 副作用，重放尾部事件，并重验权限和依赖。',
  }),
  Object.freeze({
    claim: 'OpenAI、LangGraph 或 Temporal 中任一实现的状态与重放语义都可以直接作为所有 Harness 的统一协议。',
    correction: '这些资料只证明各自产品的具体能力；统一 schema、原子边界、lease 和迁移流程是本课程的工程综合，必须在目标系统验证。',
  }),
]);

export const harness02Note = Object.freeze({
  readingMinutes: 38,
  introduction: '一个长达两小时的 Agent run 不应把生命系在某个 worker 的内存里。进程可能升级、崩溃或释放，工具调用也可能在本地确认之前已经改变外部世界；如果系统只有一条不断覆盖的“最新消息”，就既无法解释状态怎样形成，也无法判断重启后哪一步可以安全继续。本课沿用上一课的 Runner 生命周期，把“当前状态、追加事实、恢复提交点”拆成可验证的数据职责，并把 ordinary log 放回诊断位置。你将用同一条资料整理轨迹设计数据 schema、事件顺序与去重、原子提交边界、checkpoint 时机、单一恢复 lease、replay 和 schema 迁移，再以四个提交点和崩溃注入证明恢复协议。课程引用的三份官方资料分别提供可序列化 RunState、LangGraph persistence 和 Temporal event history 的具体证据；统一 schema、lease、原子边界与迁移策略则是课程工程综合，不能外推为任何框架的默认保证。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Run state 是供下一步决策使用的当前投影，append-only event log 是按序追加的事实，checkpoint 是带控制位置与事件游标的恢复提交点。',
    'Ordinary log 服务诊断和观察，不应替代领域事件，也不能凭一条成功文本修复权威状态。',
    '每条 run 用明确 sequence 排序、eventId 去重，并让事件、投影和 checkpoint 指向同一已提交边界。',
    'Checkpoint 时机围绕恢复窗口、昂贵步骤、外部副作用、人工暂停和终态权衡，频率越高并不必然越可靠。',
    '进程恢复先取得单一 lease，再校验 checkpoint、重放尾部事件、对账副作用并重新验证权限、审批和依赖。',
    'Schema 兼容需要显式版本、upcaster 或迁移、回退规则和审计；未知关键版本不能静默继续。',
    'Checkpoint 不等于长期 memory，durable 也不保证外部副作用 exactly-once，具体框架的 replay 语义不可跨框架外推。',
  ]),
  nextStep: '现在完成“设计 run 持久化模型”练习：先为两小时资料整理 run 写出 run_state、run_event、run_checkpoint 三类 schema，标出事实、派生值、版本、sequence、eventId、eventCursor、checksum 和 pendingEffectRefs；再画出模型完成、外部工具 intent、工具确认、产物验收四个提交点。在每个提交点前后注入进程崩溃与重复投递，并加入一次 checkpoint 损坏和一次 schema 升级，逐步写明单一恢复 lease 的取得、版本与游标校验、事件去重和重放、副作用对账、依赖重验以及回退条件。交付前用两道测验、三道访谈追问和两条完成标准逐项验收：若不能从同一轨迹生成三类记录，或不能解释恢复窗口、写入成本与版本风险，就继续修改设计而不要把“成功重启一次”当作完成。完成这套持久化底座后，下一课会把外部工具放到宿主控制面中，继续处理注册、认证、授权、人工审批与恢复时重验。',
});
