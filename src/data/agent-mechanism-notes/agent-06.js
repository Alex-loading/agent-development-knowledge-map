const sections = Object.freeze([
  Object.freeze({
    id: 'observe-before-recover',
    title: '先保存失败观察，再讨论恢复动作',
    paragraphs: Object.freeze([
      '上一课把计划中的每一步都接到 checkpoint 和 failure exit；本章先把“失败”从一句自然语言变成可路由的 observation。工具返回或客户端超时后，宿主先追加不可变事件：tool、规范化参数摘要、call id、稳定 intent、开始与结束时间、HTTP 或业务 error code、原始响应的最小必要副本、外部资源版本、是否可能产生副作用，以及结果类别。随后才生成供模型读取的精简摘要。先保存原始证据是为了让对账、审计与人工接管仍能还原事实，而不是让下一轮模型用猜测覆盖现场。',
      '课程把工单 Agent 的结果分成六类：transport 表示请求未到达、连接中断或响应未知；parameter 表示 schema、类型、枚举或跨字段约束不合格；empty-result 表示查询成功但当前范围没有命中，它是语义上“没有找到”而不是调用异常；business-conflict 表示版本冲突、状态迁移非法或规则拒绝；permission 表示身份、scope、审批或租户边界不满足；capability 表示当前工具根本不支持所需动作、字段或渠道。这个枚举和字段是课程工程综合，不是 AgentBench 或 τ-bench 发布的生产错误标准。',
      '分类器只读可信返回与 registry 元数据，不能让模型凭措辞决定 sideEffectRisk 或 retryable。AgentBench 在其八类环境的评测中记录 invalid action、超时、重复与终止失败，说明长轨迹故障可以从可观察行为分析；τ-bench 则用领域政策和数据库终态判分，说明一段流畅答复不等于业务状态正确。两篇工作都不提供本课六类路由或工单恢复规则，课程只借它们建立“行为与终态必须可观察”的证据边界。',
    ]),
    keyPoints: Object.freeze([
      '原始错误、调用关联、稳定 intent、外部版本和副作用可能性必须先进入事件日志，再生成模型摘要。',
      'transport、parameter、empty-result、business-conflict、permission、capability 是面向恢复决策的课程分类，不是论文标准。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '错误消息不是完整证据',
      body: '“请求失败”既可能是服务器未执行，也可能是写入成功但响应丢失；没有调用标识、资源版本和对账入口，就无法安全决定下一步。',
    }),
    sourceIds: Object.freeze(['res-agent-agentbench', 'res-agent-tau-bench']),
  }),
  Object.freeze({
    id: 'retry-budget-and-unknown-outcome',
    title: '重试要同时受预算、幂等与未知终态约束',
    paragraphs: Object.freeze([
      '有限重试只适用于证据表明“同一意图再次提交仍安全且可能成功”的情况。只读查询遇到明确的瞬态传输错误，可以按工具策略指数退避并加入 jitter，但仍受 attempts、wall-clock、cost 和连续无进展四类预算约束；参数错误应先修参，权限与能力错误通常不应重试。预算耗尽不是让模型再想一次的理由，而是进入 blocked、handoff 或 failed 的确定性出口，并把已尝试次数和最后证据交给接管者。',
      '写操作 timeout 更危险：客户端只知道没有收到响应，不能断言服务器没有执行，所以结果先标为 UNKNOWN_OUTCOME。宿主在第一次 act 前生成并持久化稳定 caller intent，也就是服务端接受的唯一 client request identifier/idempotency key，并把它与动作和业务对象绑定。恢复时先用同一 intent 查询请求记录或资源终态；确认已执行就吸收结果，确认未执行且预算允许才以同一语义重放，无法对账则 handoff。绝不能新造 intent 再调用，否则服务端会把它视为另一次业务意图。',
      'AWS Builders’ Library 的正文直接支撑调用方请求标识、幂等重试、网络超时不确定性、reconciliation、语义等价响应与晚到请求边界；它不替工单系统定义状态机、权限、补偿或错误码。本章的预算字段、UNKNOWN_OUTCOME 枚举、blocked/handoff 阈值和对账接口都是课程综合。即使服务宣称幂等，也要验证保留期、同 key 改参如何拒绝、响应重放语义和原子性；幂等键只是安全重放的必要条件之一，不是无限重试许可证。',
    ]),
    keyPoints: Object.freeze([
      '重试需要同时满足可重试分类、副作用安全、稳定 intent、次数/时间/成本预算和可观察进展。',
      '写操作超时先记 UNKNOWN_OUTCOME，再以同一稳定 intent 对账；只有确认未执行才允许有限重放。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: 'Retryable 不等于现在就 retry',
      body: '它只表示存在安全重放的可能；控制器仍须检查副作用、对账结果、预算、退避窗口和环境版本。',
    }),
    sourceIds: Object.freeze(['res-agent-aws-idempotent-apis']),
  }),
  Object.freeze({
    id: 'reflection-needs-feedback',
    title: 'Reflection 的收益来自反馈条件，而不是“再想一遍”',
    paragraphs: Object.freeze([
      'Reflexion 把过程组织为 Actor、Evaluator 与 Reflection：Actor 尝试任务，Evaluator 根据环境、启发式、模型判断或测试产生信号，Reflection 把轨迹和反馈压缩为语言经验，写入情景记忆供后续 trial 使用。论文报告的是特定模型、任务与多次尝试设置中的改进；部分编程任务使用单元测试。因此可迁移的机制是“失败证据经过评价后成为下一次约束”，不是“同一模型无证据自评就会变可靠”，更不是生产副作用安全保证。',
      'Self-Refine 的范式是同一模型先生成输出，再按任务化维度给出可操作反馈并修订，循环到停止条件；论文覆盖的七类任务多体现生成或编辑式输出迭代。它说明一份明确反馈协议可以让候选逐步变化，但不能推出任意数学推理、工具权限或数据库更新都能由文字批评纠正。工程上应记录 candidate version、feedback source、修改 diff、validator result 和最大轮数，避免把改写次数误当质量进展。',
      '《Large Language Models Cannot Self-Correct Reasoning Yet》研究的是没有外部反馈时的内在自修正，并通过 oracle 反馈、等成本和提示公平对照指出部分推理设置会退化；它不否定有测试反馈的 Reflexion，也不证明风格、偏好或安全任务都不能迭代。CRITIC 则在搜索、代码、计算器和毒性 API 等特定任务中让模型调用工具形成外部 critique，再执行 verify–correct；其效果依赖工具质量、提示和任务。四项工作按反馈来源与任务类型并列后并不矛盾：先问“反馈来自哪里、能否校准”，再决定是否反思。',
    ]),
    keyPoints: Object.freeze([
      'Reflexion 依赖 Actor–Evaluator–Reflection、环境或评价信号和多 trial；它不是无反馈自评。',
      'Self-Refine 主要证明任务化反馈下的输出迭代；无外部反馈推理反证与 CRITIC 工具反馈共同限定适用边界。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '把 Reflection 看成受控恢复候选',
      body: '反思可以重写下一次尝试的约束，但只有独立验证器能把“说得更像”与“状态真的更对”区分开。',
    }),
    sourceIds: Object.freeze(['res-agent-reflexion', 'res-agent-self-refine', 'res-agent-no-self-correct', 'res-agent-critic']),
  }),
  Object.freeze({
    id: 'external-validation-stack',
    title: '外部验证栈：从格式正确推进到业务终态正确',
    paragraphs: Object.freeze([
      '验证器是相对独立、可重复计算的证据来源，不等于另一个自由生成的“裁判模型”。第一层解析器检查 JSON、schema 和必填字段；第二层规则引擎检查工单状态迁移、权限、审批和字段组合；第三层测试或沙箱执行验证代码、查询与转换结果；第四层读取数据库版本、审计事件或远端 request status，确认真实副作用终态；第五层在策略冲突、高风险或证据无法自动判断时请求人工反馈。层级不是越多越好，而是按动作风险选择最便宜且有区分力的信号。',
      '工单查询可以用 schema 和结果集合验证，更新则还要比较预期 rowVersion、更新后状态与审计事件。若工具说 success 但数据库仍是旧版本，控制器保存冲突 observation，不能让模型总结为完成；若规则拒绝 CLOSED → IN_PROGRESS，则修参也不能绕过状态机。τ-bench 的领域政策与数据库终态判分直接支持“策略遵循和环境状态共同决定任务是否完成”；它在模拟用户、两个简化领域及唯一数据库结果假设下评测，不代表真实客服系统的全部并发与人工流程。',
      'CRITIC 支撑工具交互 critique 能在其任务中提供不同于纯自评的信号，却也提醒工具可能错误、有偏、延迟，并带来隐私和安全风险。因此验证器本身要有版本、超时、失败类别和可信范围：解析器不能验证业务真相，数据库读取可能陈旧，测试只能覆盖断言，人工也可能不一致。生产验收应组合证据并记录 provenance；论文没有承诺工具一接入就能保证正确。',
    ]),
    keyPoints: Object.freeze([
      '解析器、规则、测试、数据库终态和人工反馈解决不同层次的问题，必须按风险组合。',
      '外部验证强在提供相对独立且可观察的信号，但验证工具也有质量、时效与权限边界。',
    ]),
    sourceIds: Object.freeze(['res-agent-critic', 'res-agent-tau-bench']),
  }),
  Object.freeze({
    id: 'fingerprint-and-progress-detection',
    title: '动作指纹与进展检测：阻止死循环，也不误杀合理重试',
    paragraphs: Object.freeze([
      '控制器为每次候选动作计算完整指纹：tool + canonical params + relevant state/version + result class。canonical params 会排序键、统一稳定格式但不泄露密钥；relevant state/version 至少包含目标版本、计划或步骤版本、目标资源版本与权限快照；result class 区分 timeout、validation-error、empty-result、conflict、permission-denied 等。只比较工具名和参数会误判：同一查询在新工单版本或退避窗口后可能合理，而参数相同、状态相同、结果类别相同才更接近无进展重复。',
      '进展不是“模型换了一段解释”，而是可验证状态差异：新 observation 扩大了证据范围、参数通过验证、资源版本变化、权限已获批、checkpoint 被满足，或对账把 UNKNOWN_OUTCOME 解成确定终态。系统同时维护 consecutiveSameFingerprint、sameResultWithoutStateChange、recoveryAttempts 和 validatorScoreDelta；当完整指纹重复、相关 state/version 未变、结果类别相同且没有可验证进展达到阈值，控制器禁止再次 act，转向换查询、重规划、blocked 或 handoff。阈值与计数维度属于课程综合，需要用真实失败轨迹校准。',
      '环境改变时不能机械去重：权限已批准、rowVersion 更新、服务器给出 retry-after 到期、先前对账确认未执行，都会改变 state/version 或恢复前提，从而形成新指纹或显式重置计数。相反，只改 temperature、提示措辞、计划步骤名称或 JSON 键顺序不算进展。AgentBench 的重复轨迹和 TLE 分析只能证明评测中存在这类可观察故障，不能提供通用阈值；AWS 的 caller intent 与晚到请求边界只支撑跨重放关联，具体指纹结构仍是课程工程综合。',
    ]),
    keyPoints: Object.freeze([
      '指纹必须结合 tool、规范化参数、相关 state/version 与 result class；只比较文本或参数不够。',
      '只有完整指纹重复且状态无进展才累计死循环阈值；环境版本或对账证据变化允许重新判断。',
    ]),
    sourceIds: Object.freeze(['res-agent-agentbench', 'res-agent-aws-idempotent-apis']),
  }),
  Object.freeze({
    id: 'ticket-recovery-decision-table',
    title: '工单查询与更新：六类失败必须落到确定性决策表',
    paragraphs: Object.freeze([
      '案例 Agent 有 search_tickets 只读查询与 update_ticket 写操作。下面的六行共享一份输入契约：分类器只使用可信 error code、schema validator、policy engine、工具 registry、request record 与数据库版本；sideEffectRisk 来自 registry，不采信模型；budget 是本地教学上限而非行业推荐；allowedRecovery 的顺序由控制器执行。整张表是课程工程综合，六篇论文和 AWS 正文都没有共同发布这套工单协议。',
      '决策表 JSON：[ {"class":"transport","observableEvidence":["timeout-or-connection-reset","request-status"],"sideEffectRisk":"read=none;write=unknown","allowedRecovery":["read:bounded-backoff-retry","write:mark-UNKNOWN_OUTCOME","write:reconcile-by-stable-intent","write:retry-only-if-confirmed-not-executed"],"budget":{"attempts":2,"wallClockSeconds":30},"idempotency":"write requires host-persisted stable intent; reuse same key","terminalExit":"cannot-reconcile=>handoff;budget-exhausted=>blocked"}, {"class":"parameter","observableEvidence":["schema-or-cross-field-validation-error"],"sideEffectRisk":"none-before-act","allowedRecovery":["repair-only-rejected-fields","revalidate","single-resubmit"],"budget":{"repairs":1},"idempotency":"do not consume write intent before validation","terminalExit":"still-invalid=>blocked-with-required-fields"}, {"class":"empty-result","observableEvidence":["success=true","items=[]","searched-scope"],"sideEffectRisk":"none","allowedRecovery":["record-scope","change-query-or-approved-source","replan"],"budget":{"alternateQueries":2},"idempotency":"not-required-for-read","terminalExit":"approved-scopes-exhausted=>clarify-or-blocked"}, {"class":"business-conflict","observableEvidence":["version-conflict-or-illegal-transition","expected-and-actual-rowVersion"],"sideEffectRisk":"write-may-not-have-committed;verify","allowedRecovery":["read-current-state","recompute-against-policy","retry-only-with-new-expected-version-and-valid-transition"],"budget":{"replans":1},"idempotency":"preserve old request evidence; new intent only for materially revised authorized transition","terminalExit":"policy-still-conflicts=>blocked-or-handoff"}, {"class":"permission","observableEvidence":["authenticated-actor","denied-scope-or-missing-approval","policy-reference"],"sideEffectRisk":"action-must-not-run","allowedRecovery":["record-denial","request-approved-authorization-path","handoff"],"budget":{"automaticRetries":0},"idempotency":"no replay until authorization state/version changes","terminalExit":"blocked-awaiting-authorization-or-handoff"}, {"class":"capability","observableEvidence":["tool-registry-lacks-operation-or-required-field","supported-capabilities"],"sideEffectRisk":"unsupported-action-must-not-run","allowedRecovery":["clarify-goal","offer-approved-degraded-output","select-capable-approved-tool","handoff"],"budget":{"toolSubstitutions":1},"idempotency":"not-applicable-until-a-supported-action-exists","terminalExit":"no-safe-capability=>handoff-or-blocked"} ]',
      '走查写操作 timeout：update_ticket 已持久化 intent=ticket-42-close-v1，客户端超时后只能写 UNKNOWN_OUTCOME；控制器查询 request-status 与工单 rowVersion，已关闭就吸收成功，明确未执行且仍获授权才用同一 key 重放，查不到则 handoff。权限拒绝 automaticRetries=0，不能靠反思伪造 scope。能力不足先澄清是否接受只读报告或选择获准工具；没有安全降级就交接。parameter 只修被拒字段，empty-result 换查询范围，business-conflict 读取新版本并重新验证规则，六类不会都落入 reflection。',
    ]),
    keyPoints: Object.freeze([
      '每一类都必须写 observableEvidence、sideEffectRisk、allowedRecovery、budget、idempotency 和 terminalExit。',
      '写 timeout 先 UNKNOWN_OUTCOME 与对账；权限零自动重试；能力不足走澄清、获准降级或 handoff。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '决策表先于语言反思',
      body: '确定性证据能直接路由时由控制器处理；只有需要生成修订候选时才调用模型，并继续接受同一张表与外部验证器约束。',
    }),
    sourceIds: Object.freeze(['res-agent-aws-idempotent-apis', 'res-agent-agentbench', 'res-agent-tau-bench']),
  }),
  Object.freeze({
    id: 'recovery-runbook-and-evaluation-boundary',
    title: '把恢复闭环做成可复现 runbook，而不是论文名称拼盘',
    paragraphs: Object.freeze([
      '完整 runbook 的顺序是 observe → preserve evidence → classify → deterministic route → optional reflection candidate → external validate → update state → terminal check。Reflection 只在“存在可修改候选、反馈指出差距、预算仍有余量”时进入；transport unknown、permission 和 capability gap 不会因为生成更多文字而消失。每轮保存 validator version、feedback provenance、动作完整指纹、state diff 与预算变化，使接管者能判断失败来自模型候选、工具、策略、权限还是验证器。',
      '练习交付时先把上一节 JSON 解析为六行，再注入四条轨迹：写更新 timeout 必须得到 UNKNOWN_OUTCOME→reconcile，权限拒绝必须直接零重试出口，能力缺口必须产生 clarify/degrade/handoff 候选，重复指纹只有在 relevant state/version 与 result class 同时未变时才触发 stop。再以同一数据执行反例：rowVersion 从 7 变 8 后指纹应变化；只改 JSON 键序或提示措辞则不算变化。这样能验证控制语义，而不是仅检查表格看起来完整。',
      '这些 probe 规范是课程工程综合，只做本地确定性课程检查，不运行 Reflexion、Self-Refine、CRITIC、AgentBench 或 τ-bench，也不比较模型能力；论文结果始终保留各自模型、任务、反馈和 trial 边界。真实系统还要实现持久化事件、原子 intent 映射、鉴权、对账 API、validator 版本治理、隐私清理、告警与人工队列，并用自身故障注入校准预算和阈值。课程的目标不是承诺自动恢复一切，而是让每次继续、停止与交接都有可检查证据。',
    ]),
    keyPoints: Object.freeze([
      '确定性路由优先，reflection 只生成受反馈约束的恢复候选，外部验证后才能更新任务状态。',
      '语义 probe 必须覆盖未知写终态、权限零重试、能力出口及包含 state/version/result class 的重复判断。',
    ]),
    sourceIds: Object.freeze(['res-agent-reflexion', 'res-agent-self-refine', 'res-agent-no-self-correct', 'res-agent-critic', 'res-agent-agentbench', 'res-agent-tau-bench', 'res-agent-aws-idempotent-apis']),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '工具报 timeout 就说明服务器没有执行，直接重试最稳妥。',
    correction: 'timeout 只说明响应未知；写操作可能已提交。先标记 UNKNOWN_OUTCOME，用原稳定 intent 对账，只有确认未执行且预算允许才重放。',
  }),
  Object.freeze({
    claim: '所有错误都先让模型 reflection 三次，总能找到新办法。',
    correction: '权限、能力与未知副作用终态需要授权、工具或对账证据，文字反思不能改变外部事实。确定性分类和出口必须先执行。',
  }),
  Object.freeze({
    claim: 'Reflexion 证明模型只靠自我批评就能稳定自纠错。',
    correction: 'Reflexion 包含 Evaluator、环境或测试信号和多 trial；无外部反馈的推理自修正有反方结果，论文结论不能混用。',
  }),
  Object.freeze({
    claim: '外部工具给出的验证结果天然正确，可以直接覆盖数据库状态。',
    correction: '工具会错误、有偏、过期或超时。验证结果也需记录版本、来源、可信范围，并与规则、数据库终态或人工证据交叉核验。',
  }),
  Object.freeze({
    claim: '只要工具名和参数相同，就应永久禁止重复调用。',
    correction: '合理重试还取决于 state/version、result class、退避窗口和对账结果；只有完整指纹重复且无可验证进展才应累计停止阈值。',
  }),
  Object.freeze({
    claim: 'blocked 与 handoff 表示 Agent 设计失败，应该隐藏并继续尝试。',
    correction: '缺权限、缺能力或终态无法对账时，带证据的 blocked/handoff 是保护副作用和预算的正常终态；隐藏它才会制造死循环。',
  }),
]);

export const agent06Note = Object.freeze({
  readingMinutes: 39,
  introduction: '上一课把计划写成带 checkpoint 与 failure exit 的版本化步骤；本章回答失败出现后如何安全继续。你将先保存 error、外部版本和副作用证据，把传输、参数、空结果、业务冲突、权限与能力失败映射到不同恢复路径；再比较 Reflexion、Self-Refine、无外部反馈自纠错的反方研究与 CRITIC，理解“反思是否有用”取决于反馈来源和任务。最后为查询并更新工单的 Agent 交付一张可解析决策表，并用确定性 probe 验证写超时对账、权限零重试、能力出口和动作去重。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '恢复前先保存原始 error、call id、稳定 intent、外部版本、参数摘要、结果类别与副作用可能性，模型摘要不能覆盖证据。',
    '六类课程路由分别是 transport、parameter、empty-result、business-conflict、permission 与 capability；同一句“失败”不能统一重试。',
    '只读瞬态错误可在退避和硬预算内重试；写 timeout 是 UNKNOWN_OUTCOME，必须以同一稳定 intent 先对账。',
    'Reflexion 依赖 Actor、Evaluator、环境或测试反馈与多 trial；Self-Refine 多体现任务化输出反馈和修订。',
    '无外部反馈推理自修正的反方证据不否定带 oracle、测试或工具信号的恢复；先比较反馈条件，不能只比较论文标题。',
    'CRITIC 展示特定任务中的工具交互 critique，但工具质量、偏差、延迟、隐私与权限仍限制结果。',
    '解析器、规则、测试、数据库终态和人工反馈是不同验证层；流畅答案与 success 字段都不能单独证明业务完成。',
    '完整动作指纹包含 tool、canonical params、relevant state/version 与 result class；只有指纹重复且无状态进展才触发停止。',
    '工单决策表每类都必须给出 observable evidence、side-effect risk、allowed recovery、budget/idempotency 与 terminal exit。',
    '权限不足默认零自动重试并 blocked/handoff；能力不足先澄清或提供获准降级，不能安全满足时交接。',
    '本章决策表、预算、指纹和 probe 是课程工程综合，不是论文或 AWS 的生产安全保证。',
  ]),
  nextStep: '下一课将处理“恢复循环持续了很多轮后，下一次模型调用究竟该看到什么”：区分 transcript、event log、working state、working memory 与临时 context，并把本章的错误证据、稳定 intent、预算、未决 UNKNOWN_OUTCOME 和验证器来源压缩成可追溯且不会丢失硬约束的工作上下文。',
});
