const sections = Object.freeze([
  Object.freeze({
    id: 'observe-before-recover',
    title: '先保存失败观察，再讨论恢复动作',
    paragraphs: Object.freeze([
      '上一课把计划中的每一步都接到 checkpoint 和 failure exit；本章先把“失败”从一句自然语言变成可路由的 observation。工具返回或客户端超时后，宿主先追加不可变事件：tool、规范化参数摘要、call id、稳定 intent、开始与结束时间、HTTP 或业务 error code、原始响应的最小必要副本、外部资源版本、是否可能产生副作用，以及结果类别。随后才生成供模型读取的精简摘要。先保存原始证据是为了让对账、审计与人工接管仍能还原事实，而不是让下一轮模型用猜测覆盖现场。',
      '课程把工单结果分六类：transport 是连接或响应未知；parameter 是 schema 或跨字段不合格；semantic-mismatch 是结构合法、甚至非空，却与目标、事实或 completion predicate 不一致，items=[] 只是 empty-result 子类；business-conflict 是版本或规则冲突；permission 是身份、scope 或审批不足；capability 是工具不支持所需动作。这是课程工程综合，不是论文标准。',
      '分类器只读可信返回与 registry 元数据，不能让模型凭措辞决定 sideEffectRisk 或 retryable。AgentBench 在其八类环境的评测中记录 invalid action、超时、重复与终止失败，说明长轨迹故障可以从可观察行为分析；τ-bench 则用领域政策和数据库终态判分，说明一段流畅答复不等于业务状态正确。两篇工作都不提供本课六类路由或工单恢复规则，课程只借它们建立“行为与终态必须可观察”的证据边界。',
    ]),
    keyPoints: Object.freeze([
      '原始错误、调用关联、稳定 intent、外部版本和副作用可能性必须先进入事件日志，再生成模型摘要。',
      'transport、parameter、semantic-mismatch、business-conflict、permission、capability 是面向恢复决策的课程分类；empty-result 是 semantic-mismatch 子类。',
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
      '验证只有 PASS、FAIL、VALIDATION_UNKNOWN。PASS 还须来源获准且 validatorVersion 与资源版本匹配，才可发布完成证据或继续副作用；FAIL 保存 expected-vs-actual、断言与 provenance，只做预算内修订。timeout、验证权限拒绝、stale source 或验证器冲突都归 UNKNOWN：不得发布或继续副作用，只可在相同权限和数据最小化边界内换独立 validator，否则 blocked/handoff。状态机 JSON：{"states":["PASS","FAIL","VALIDATION_UNKNOWN"],"passGate":["approved-provenance","validator-and-resource-version-match"],"failAction":"structured-feedback-and-bounded-revision","unknownAction":"no-publish-no-side-effect;alternate-independent-validator-with-same-permission-and-data-minimization-or-blocked-handoff"}',
      '工单查询可以用 schema 和结果集合验证，更新则还要比较预期 rowVersion、更新后状态与审计事件。若工具说 success 但数据库仍是旧版本，控制器得到 FAIL 或 VALIDATION_UNKNOWN，不能让模型总结为完成；若规则拒绝 CLOSED → IN_PROGRESS，则修参也不能绕过状态机。τ-bench 的领域政策与数据库终态判分支持“策略遵循和环境状态共同决定任务是否完成”；CRITIC 支撑工具 critique 提供不同于纯自评的信号，但工具会错误、有偏、过期或超时。三态、版本门和替代 validator 权限规则是课程综合，不是论文保证。',
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
      'pre-act 计算 actionKey = tool + canonical params + stableIntent + relevant state/version，通过权限、预算和 pending claim 才 act。post-act 再算 outcomeKey = actionKey + resultClass。canonical params 只统一键序；relevant state/version 含目标、计划/步骤、资源与权限版本。同一动作的 timeout 与 conflict 是两个 outcomeKey，却共享一个 actionKey。',
      '控制器维护 globalRecoveryAttempts、globalRecoveryTime、globalRecoveryCost 三个硬预算和 noProgressOnActionKey；任何结果、提示或版本变化都不清零硬预算，同一 actionKey 的 timeout/conflict 交替也不重置无进展。任一到限即禁止 act 并 blocked/handoff。控制约束 JSON：{"actionKey":["tool","canonicalParams","stableIntent","relevantStateVersion"],"outcomeKey":["actionKey","resultClass"],"globalBudgets":["globalRecoveryAttempts","globalRecoveryTime","globalRecoveryCost"],"noProgressCounter":"noProgressOnActionKey","resultClassChangeResetsNoProgress":false,"hardBudgetNeverResets":true,"newAttemptRequires":"real-prerequisite-or-relevant-state-version-change"}',
      '只有真实前置条件或 relevant state/version 改变，例如权限已批准、rowVersion 更新或对账确认未执行，才允许形成新 actionKey、开启新 attempt 并清零旧 actionKey 的局部无进展计数；总硬预算继续累计。retry-after 到期只能满足时间前置条件，仍要检查其他状态；只改 temperature、提示措辞、计划步骤名称、JSON 键序或 resultClass 不算新 action。AgentBench 的重复/TLE 与 AWS 的 caller intent 只支撑问题背景和跨重放关联；双键、计数与清零规则均为课程综合。',
    ]),
    keyPoints: Object.freeze([
      'pre-act actionKey 绑定 tool、规范化参数、stableIntent 与相关 state/version；post-act outcomeKey 再加入 resultClass。',
      '结果类别交替不得清零 actionKey 无进展或全局次数/时间/成本；只有真实前置条件或版本变化允许新 attempt。',
    ]),
    sourceIds: Object.freeze(['res-agent-agentbench', 'res-agent-aws-idempotent-apis']),
  }),
  Object.freeze({
    id: 'ticket-recovery-decision-table',
    title: '工单查询与更新：六类失败必须落到确定性决策表',
    paragraphs: Object.freeze([
      '案例有 search_tickets 只读查询与 update_ticket 写操作。分类器只使用可信 error code、schema/policy validator、工具 registry、request record 与数据库版本；sideEffectRisk 来自 registry，不采信模型。budget 是教学上限，allowedRecovery 由控制器按序执行；整表是课程综合，不是论文或 AWS 协议。',
      '决策表 JSON：[ {"class":"transport","observableEvidence":["timeout-or-connection-reset","request-status"],"sideEffectRisk":"read=none;write=unknown","allowedRecovery":["read:bounded-backoff-retry","write:mark-UNKNOWN_OUTCOME","write:reconcile-by-stable-intent","write:retry-only-if-confirmed-not-executed"],"budget":{"attempts":2,"wallClockSeconds":30},"idempotency":"write requires host-persisted stable intent; reuse same key","terminalExit":"cannot-reconcile=>handoff;budget-exhausted=>blocked"}, {"class":"parameter","observableEvidence":["schema-or-cross-field-validation-error"],"sideEffectRisk":"none-before-act","allowedRecovery":["repair-only-rejected-fields","revalidate","single-resubmit"],"budget":{"repairs":1},"idempotency":"do not consume write intent before validation","terminalExit":"still-invalid=>blocked-with-required-fields"}, {"class":"semantic-mismatch","observableEvidence":["schema-valid","expected-vs-actual-mismatch","external-validator-mismatch","missing-or-conflicting-provenance","subtype:empty-result-or-nonempty-irrelevant"],"sideEffectRisk":"no-new-side-effect-before-validation","allowedRecovery":["record-scope-and-provenance","bounded-revise-query","change-approved-source","replan","external-validate"],"budget":{"revisions":2,"alternateValidators":1},"idempotency":"preserve prior evidence; no side-effect replay","terminalExit":"no-validated-relevant-evidence=>clarify-or-blocked;high-risk-conflict=>handoff"}, {"class":"business-conflict","observableEvidence":["version-conflict-or-illegal-transition","expected-and-actual-rowVersion"],"sideEffectRisk":"write-may-not-have-committed;verify","allowedRecovery":["read-current-state","recompute-against-policy","retry-only-with-new-expected-version-and-valid-transition"],"budget":{"replans":1},"idempotency":"preserve old request evidence; new intent only for materially revised authorized transition","terminalExit":"policy-still-conflicts=>blocked-or-handoff"}, {"class":"permission","observableEvidence":["authenticated-actor","denied-scope-or-missing-approval","policy-reference"],"sideEffectRisk":"action-must-not-run","allowedRecovery":["record-denial","request-approved-authorization-path","handoff"],"budget":{"automaticRetries":0},"idempotency":"no replay until authorization state/version changes","terminalExit":"blocked-awaiting-authorization-or-handoff"}, {"class":"capability","observableEvidence":["tool-registry-lacks-operation-or-required-field","supported-capabilities"],"sideEffectRisk":"unsupported-action-must-not-run","allowedRecovery":["clarify-goal","offer-approved-degraded-output","select-capable-approved-tool","handoff"],"budget":{"toolSubstitutions":1},"idempotency":"not-applicable-until-a-supported-action-exists","terminalExit":"no-safe-capability=>handoff-or-blocked"} ]',
      '走查写操作 timeout：update_ticket 已持久化 intent=ticket-42-close-v1，客户端超时后只能写 UNKNOWN_OUTCOME；控制器查询 request-status 与工单 rowVersion，已关闭就吸收成功，明确未执行且仍获授权才用同一 key 重放，查不到则 handoff。权限拒绝 automaticRetries=0，不能靠反思伪造 scope。能力不足先澄清是否接受只读报告或选择获准工具；没有安全降级就交接。parameter 只修被拒字段；semantic-mismatch 中的 empty-result 换查询范围，非空但不相关或 provenance 冲突也要有限修订、换获准来源、重规划并外部验证；business-conflict 读取新版本并重新验证规则，六类不会都落入 reflection。',
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
      'runbook 顺序是 observe → preserve evidence → classify → deterministic route → optional reflection → external validate → update state → terminal check。Reflection 只在有可修改候选、反馈和预算时进入；unknown、permission 与 capability gap 不会因更多文字消失。每轮保存 validator version/provenance、actionKey/outcomeKey、state diff 与预算。',
      '练习先解析六行 JSON，再注入：写 timeout 对账；权限零重试；能力 clarify/degrade/handoff；semantic-mismatch 覆盖空与非空不相关；同一 actionKey 的 timeout/conflict/timeout 仍累计 noProgress 与全局次数并到限终止。validator VALIDATION_UNKNOWN 时 commitCount 和 downstreamSideEffectCount 都为 0；只有真实前置条件或版本变化允许新 attempt，且硬预算不清零。',
      'probe 是课程综合的本地确定性检查，不运行论文方法或比较模型能力。真实系统还要实现持久事件、原子 intent、鉴权、对账、validator 治理、隐私、告警与人工队列，并用故障注入校准预算；目标不是自动恢复一切，而是让继续、停止与交接都有证据。',
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
  introduction: '上一课把计划接上 checkpoint 与 failure exit；本章回答失败后如何安全继续。你将保存错误、版本和副作用证据，把传输、参数、语义不匹配、业务冲突、权限与能力失败分别路由，其中空结果只是语义不匹配子类；再比较四项反思研究的反馈条件。最后交付工单决策表，用 probe 验证写超时对账、验证器三态、双层动作键和受控出口。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '恢复前先保存原始 error、call id、稳定 intent、外部版本、参数摘要、结果类别与副作用可能性，模型摘要不能覆盖证据。',
    '六类课程路由分别是 transport、parameter、semantic-mismatch、business-conflict、permission 与 capability；empty-result 只是语义不匹配子类。',
    '只读瞬态错误可在退避和硬预算内重试；写 timeout 是 UNKNOWN_OUTCOME，必须以同一稳定 intent 先对账。',
    'Reflexion 依赖 Actor、Evaluator、环境或测试反馈与多 trial；Self-Refine 多体现任务化输出反馈和修订。',
    '无外部反馈推理自修正的反方证据不否定带 oracle、测试或工具信号的恢复；先比较反馈条件，不能只比较论文标题。',
    'CRITIC 展示特定任务中的工具交互 critique，但工具质量、偏差、延迟、隐私与权限仍限制结果。',
    '外部验证只有 PASS、FAIL、VALIDATION_UNKNOWN；UNKNOWN 不得发布或继续副作用，只有 PASS 且来源/版本匹配才能提交。',
    'pre-act actionKey 不含结果类别，post-act outcomeKey 才加入 resultClass；结果交替不重置 action 无进展或全局硬预算。',
    '工单决策表每类都必须给出 observable evidence、side-effect risk、allowed recovery、budget/idempotency 与 terminal exit。',
    '权限不足默认零自动重试并 blocked/handoff；能力不足先澄清或提供获准降级，不能安全满足时交接。',
    '本章决策表、预算、指纹和 probe 是课程工程综合，不是论文或 AWS 的生产安全保证。',
  ]),
  nextStep: '下一课将处理“恢复循环持续了很多轮后，下一次模型调用究竟该看到什么”：区分 transcript、event log、working state、working memory 与临时 context，并把本章的错误证据、稳定 intent、预算、未决 UNKNOWN_OUTCOME 和验证器来源压缩成可追溯且不会丢失硬约束的工作上下文。',
});
