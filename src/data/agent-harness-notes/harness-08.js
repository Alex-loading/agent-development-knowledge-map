const sections = Object.freeze([
  Object.freeze({
    id: 'classify-waiting-and-terminal-states',
    title: '先用后续动作区分等待与终态',
    paragraphs: Object.freeze([
      '上一课已经让 run 在队列、租约与取消中保持资源有界，本课把“长程任务能否完成”改写成三个可检查问题：什么时候应该停、停下时保存什么、下一位操作者还能做什么。Context offloading（上下文卸载）不是把旧消息粗暴删除，而是把大体量证据、工具输出和中间产物移到可寻址、可校验的外部载体，在活跃上下文中保留摘要、游标、哈希、未决项和恢复入口。它让 run 跨班次、跨进程继续，却不替代状态机、checkpoint 或权限。Awaiting approval（等待审批）表示具体高风险调用已形成且审批请求已持久化；blocked（受阻）表示缺少账号、输入、依赖或外部决定，但存在可描述的解除条件；failed（失败）表示本次 run 的规定恢复策略不可用或已经耗尽；cancelled（已取消）表示收到停止意图，并完成了能完成的传播、对账与清理。',
      '每次进入这些状态都要附带机器可读的 reasonCode、evidenceRefs、recoverable 和 allowedNextActions。reasonCode 说明为何停下，例如 missing_production_account、approval_expired、retry_budget_exhausted 或 user_cancelled；evidenceRefs 指向事件、审批、错误、清理和副作用事实；recoverable 说明满足什么条件后可以继续；allowedNextActions 列出 resume、request_approval、supply_input、handoff、retry、compensate 或 close 等合法动作。自然语言说明可以帮助人阅读，却不能替代这些可校验字段，否则自动路由、统计和接管都会依赖猜测。',
      'Terminal state（终态）表示当前 run 按协议不再自动前进；在本章比较的四种状态中，failed 与 cancelled 属于终态，而 awaiting_approval 与 blocked 仍保留条件化恢复路径。状态冲突要按事实和事件顺序裁决：用户取消与系统错误同时出现时，先记录两者时间、取消是否已传播、远端副作用是否已经发生，再决定 cancelled、failed 或先进入人工对账。NIST 的工具分类帮助判断应收集哪些证据，但它不是状态机实现规范；本章四状态、原因码和后续动作是课程综合模板，也不是任何框架的标准枚举。',
    ]),
    keyPoints: Object.freeze([
      'Awaiting approval 等具体审批，blocked 等可解除外部条件，failed 表示恢复不可用或耗尽，cancelled 表示停止与清理。',
      '状态必须携带 reasonCode、证据引用、可恢复条件与允许的下一步，不能只有一段总结。',
      '并发出现取消、失败或预算耗尽时按事件顺序和真实副作用裁决；状态模板属于课程综合。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '状态是给下一位操作者的路标',
      body: '状态名不是对过去的情绪评价，而是对当前事实、解除条件和合法后续动作的压缩；真正裁决仍须读取证据。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-nist-tool-use',
      'res-harness-primary-feishu-context-offloading',
      'res-harness-primary-feishu-microcompact',
      'res-harness-primary-javaguide-context-engineering',
    ]),
  }),
  Object.freeze({
    id: 'persist-and-release-long-approvals',
    title: '用 Install、Skill 与 Hook 渐进披露运行契约',
    paragraphs: Object.freeze([
      '长程 Agent 不应在启动时把全部手册、脚本和领域知识塞进提示词。Install.md 负责显式声明前置依赖、安装命令、权限边界、验证步骤、回滚办法和兼容版本；Skill 把可复用的任务说明、资源与脚本封装成按需加载单元；Hook 则在 tool.before、tool.after、checkpoint.before 或 handoff.created 等稳定生命周期边界执行确定性检查。三者共同形成 progressive disclosure（渐进披露）：模型先看短目录与触发条件，命中任务后才读取具体 Skill，执行到边界时由 Hook 强制验证。它们都属于 Harness 组织与执行层，不能绕过宿主授权或把第三方命令自动升级为可信代码。',
      '这些可复用契约仍要落到一次 run 的耐久事实。长时间 HITL（human in the loop，人在回路）不能靠 worker 阻塞等待；高风险工具准备执行时，宿主先规范化调用并持久化 approval request，记录 approvalRequestId、runId、toolId 与 toolVersion、参数摘要、业务对象、请求者身份、权限与策略版本、风险说明、requestedAt、expiresAt、单次 resume token 的哈希和状态。OpenAI Agents SDK 会把待审批工具调用作为 interruption 暴露，并允许把 RunState 序列化后批准、拒绝和恢复；这支持跨进程暂停，却没有自动替宿主定义上述审计字段。',
      '安全提交顺序是先原子保存审批请求、等待状态、checkpoint 与通知意图，确认耐久后再释放 worker、数据库连接、run lease、sandbox 会话、文件锁和短期凭证。通知失败可以用同一 notificationId 重投，不能回滚已经提交的等待事实。Hook 可以承载“提交前校验”与“释放后记录”，但资源释放顺序、结果和泄漏告警仍由 Harness 实现。若审批等待数小时或数天，继续占有短期令牌与执行槽位既浪费容量，也会在令牌过期后制造虚假的执行权。',
      '审批回调按 approvalRequestId、decisionId 和期望版本做幂等条件更新：重复批准返回首次结果，批准与拒绝冲突进入人工核验，过期 token 不得复活旧请求。接受决定前重新认证回调者，校验签名、期限、调用摘要、业务对象和批准范围；拒绝可以结束该调用或进入可修改方案的 blocked，过期与参数变化通常创建新请求，不能沿用旧批准。恢复由新 worker 取得单一 run lease，重新获取依赖和最小权限凭证，并重验工具版本、策略、身份授权、资源状态与副作用账本后才继续。OpenAI 文档没有承诺这些宿主重验会自动发生。',
    ]),
    keyPoints: Object.freeze([
      'Install.md 声明安装与验证契约，Skill 按需加载能力，Hook 在稳定生命周期边界强制确定性检查。',
      '审批请求在暂停前持久化调用摘要、身份权限、版本、期限和一次性恢复令牌。',
      '等待事实与 checkpoint 提交成功后释放 worker、锁、lease、sandbox 和短期凭证；资源释放是宿主职责。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: 'Durable pause 不等于占着线程睡眠',
      body: '耐久的是审批事实和恢复所需状态，不是原进程、连接、锁或凭证；宿主必须能在没有原 worker 的情况下续跑。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-08-progressive-disclosure', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-primary-feishu-agent-install-md',
      'res-harness-primary-javaguide-agent-skills',
      'res-harness-primary-feishu-beyond-model',
    ]),
  }),
  Object.freeze({
    id: 'respect-framework-resume-semantics',
    title: '分别遵守 OpenAI 与 LangGraph 的恢复语义',
    paragraphs: Object.freeze([
      'OpenAI Agents SDK 的审批路径从 RunResult interruptions 取得待决调用，把结果转换为 RunState，在 state 上 approve 或 reject，再把同一顶层 agent 与保存的 state 交给 Runner 恢复。RunState 可以序列化供另一个进程稍后装载，长期等待时还应把 agent 或 SDK 版本标记与状态一起保存，以便路由到兼容代码。这个保证描述 SDK 如何保留运行上下文和审批决定；它不等于课程的 blocked 原因码、资源释放、跨版本迁移、身份重验或 handoff bundle 会自动生成。',
      'LangGraph interrupt 则依赖 durable checkpointer 与稳定 thread_id 保存图状态，通过 Command 提供恢复值。恢复时，包含 interrupt 的节点从节点开头重新执行，而不是从源码中断行继续，因此 interrupt 之前的代码也会再次运行；这些前置副作用必须幂等，或移动到 interrupt 之后、拆入独立节点。它与 OpenAI 的 RunState 恢复是两个具体框架的不同接口和重放边界，不能合并成“所有框架都精确从原位置继续”的通用承诺。',
      '课程建议在框架外保存统一 pending-action envelope：记录 framework、frameworkVersion、adapterSchemaVersion、nativeCursorRef、approvalRequestId、callDigest 和 sideEffectRefs。适配器负责把 envelope 映射到 OpenAI RunState 或 LangGraph thread/checkpoint，宿主则统一处理 lease、权限、幂等回调、版本选择和审计。恢复测试必须覆盖原进程消失、重复回调、节点重跑与旧版本状态；若只在同一内存对象上暂停几秒，尚未证明长暂停可恢复。',
    ]),
    keyPoints: Object.freeze([
      'OpenAI 使用 interruptions、可序列化 RunState 与 approve/reject 后续跑，并建议为长期待决任务保存版本标记。',
      'LangGraph 用 thread/checkpoint 与 Command 恢复，节点会从开头重跑，interrupt 前副作用必须幂等。',
      '统一 envelope 是宿主适配层，不抹平框架的原生游标、重放边界和版本要求。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-primary-feishu-claude-ai-memory',
      'res-harness-primary-feishu-microcompact',
    ]),
  }),
  Object.freeze({
    id: 'build-a-verifiable-handoff-bundle',
    title: '让 handoff bundle 能重建事实而非转述印象',
    paragraphs: Object.freeze([
      'Handoff bundle（交接包）是让未参与原 run 的人或另一运行时验证现状并继续工作的结构化载体，也是 context offloading 的恢复入口。课程模板至少包含 bundleSchemaVersion、runId、目标与验收标准、当前状态及 stateVersion、关键事件摘要与事件游标、已经尝试的动作和结果、未决问题、剩余预算与期限、审批及权限状态、副作用账本、artifact manifest、验证结果、敏感信息引用、建议下一步和 bundle 生成者。活跃上下文只保留决策所需摘要与稳定引用，大型 trace、工具输出、历史草稿和知识快照进入受控载体；每项摘要都附原始证据引用，不能用“基本完成”覆盖失败、unknown outcome 或未决审批。',
      'Artifact manifest（产物清单）为每个可交付物记录稳定 URI、内容哈希、mediaType、generationStep、producerVersion、verification 状态与证据、retention 期限和 accessClass。URI 指向受控存储而非某个 worker 的临时路径，哈希让接管者检测内容替换，generationStep 连接生成事件，verification 区分“文件存在”与“已经验收”。凭证、用户隐私和密钥不复制进 bundle；只保存 secretRef、所需 scope、访问条件与轮换要求。若接管者无权读取某产物，应明确 blocked 条件，而不是把敏感内容嵌入总结绕过访问控制。',
      'NIST workshop 的 taxonomy 提醒设计者同时描述工具功能、读写访问、环境可信度、风险与可逆性、可靠性、监控和自治程度，因此 handoff 应优先暴露高风险写动作、不可逆结果和缺失观测。但该 taxonomy 是可扩展的分类讨论，不是审批、交接或 artifact schema 的实现规范；这里列出的 bundle 与 manifest 字段属于课程工程综合。Agent Learning Hub 可作为中文 Harness、trace、权限与 HITL 学习导航，本章不会把它的路线清单当成生产交接保证；课程注册表中的抖音条目只有可核验元数据，没有字幕或等价正文，因此不进入章节 sourceIds，也不支撑任何状态、审批或交接主张。',
    ]),
    keyPoints: Object.freeze([
      'Bundle 覆盖目标、版本化状态、事件、尝试、未决项、预算、审批、账本、产物、验证、敏感引用与下一步。',
      'Artifact 以 URI、hash、mediaType、generationStep、verification、retention 和 accessClass 形成可验证 manifest。',
      'NIST 只提供风险与监控分类视角，handoff 字段是课程模板；社区材料只承担学习导航。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-08-handoff-evidence', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-nist-tool-use',
      'res-harness-agent-learning-hub',
      'res-harness-primary-feishu-context-offloading',
      'res-harness-primary-feishu-company-brain',
      'res-harness-primary-javaguide-context-engineering',
    ]),
  }),
  Object.freeze({
    id: 'migrate-and-verify-across-runner-versions',
    title: '跨版本接管先迁移再恢复执行权',
    paragraphs: Object.freeze([
      '长暂停跨过部署很常见，交接格式必须显式版本化。Bundle、approval request、artifact manifest、checkpoint、外部化 memory pointer 和适配器 envelope 分别记录 schemaVersion、producerVersion、minReaderVersion 与完整性哈希；迁移函数按旧版本逐级转换，保留原始只读快照、迁移者、时间和差异摘要。OpenAI 文档建议给长期待决 RunState 保存 agent 或 SDK 版本标记，但这不等于任意新 Runner 都能读取旧状态；宿主应优先路由到兼容运行时，在验证过的迁移不存在时进入 blocked，而不是尝试反序列化后直接执行高风险工具。',
      '人工接管检查表按固定顺序执行：认证接管者并核验访问范围；验证 bundle 签名、哈希、schema 和状态版本；取得新的 run lease；从事件日志、checkpoint 和副作用账本重建事实；重新读取审批决定、调用摘要、期限与当前授权；校验 artifact 哈希和 verification；复核剩余预算、未决依赖与 allowedNextActions；最后写入 takeover event 后才执行。任何旧 resume token、原 worker lease 或短期凭证都视为失效输入，不能因 bundle 携带引用就自动继承。',
      '检查结果决定状态：格式可迁移但缺少兼容运行时，可用 blocked/unsupported_runtime 并给出路由条件；关键状态损坏且事件与备份也无法恢复，才以 failed/state_unrecoverable 收敛；收到有效取消时先核对副作用并完成清理，再记 cancelled；缺少生产账号但稍后可补充，则是 blocked/missing_production_account。这样既能回答课程 quiz，也能证明接管者仅凭 bundle 和受控引用校验现状，而不是依赖原作者口头解释。',
    ]),
    keyPoints: Object.freeze([
      '所有长期载体都要版本化并保留原始快照、迁移证据与兼容读者要求。',
      '接管者先验签、迁移、取 lease、重建事实、重验权限和产物，再写 takeover event 并执行。',
      '兼容运行时暂缺属于可解除 blocked；无证据可恢复的状态损坏才是 failed。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-nist-tool-use',
      'res-harness-primary-feishu-claude-ai-memory',
      'res-harness-primary-feishu-agent-install-md',
      'res-harness-primary-javaguide-context-engineering',
    ]),
  }),
  Object.freeze({
    id: 'rehearse-a-refund-approval-handoff',
    title: '用退款审批轨迹验收暂停与交接',
    paragraphs: Object.freeze([
      '贯穿案例是一项生产退款：run 已生成退款计算与测试报告 artifact，但真正调用 refund 工具需要财务批准。Worker 先保存测试报告的 URI、hash、mediaType、generationStep 和 verification，再创建绑定 customerId、orderId、amount、currency、toolVersion 与参数摘要的 approval request；它提交 awaiting_approval、checkpoint、resume token 哈希和通知意图后，释放 worker、lease、sandbox 与短期财务凭证。此时 handoff 显示目标、验收标准、剩余预算、审批期限和“尚未产生退款副作用”，下一班无需原进程即可判断当前事实。',
      '回调到达后先走分支而不是直接退款：重复批准命中同一 decisionId 并返回已有结果；拒绝且允许修订金额时进入 blocked/approval_rejected，下一步是修订并发起新请求；过期进入 blocked/approval_expired；金额、币种、工具或策略版本变化使旧摘要失配，也必须重新审批；用户明确终止目标并完成清理后进入 cancelled。只有有效批准才让新 worker 取得 lease、重验身份权限与订单状态，用稳定幂等键执行退款，随后写副作用账本、远端退款 ID、completion event、终态 checkpoint 和 artifact verification。明确不可恢复的执行错误或恢复预算耗尽才进入 failed。',
      '交付时让另一位工程师只使用 bundle、按需加载的退款 Skill 和接管检查表完成复核：验证版本与哈希，查看审批和退款账本，确认敏感信息只有受控引用，重算 artifact 完整性，核对 allowedNextActions，并证明重复回调或 LangGraph 节点重跑都不会重复退款。最终完成证据不是模型说“done”，而是验收项、artifact verification、远端副作用账本、终态事件和 stop reason 全部对齐；若任一证据缺失，就准确记录 blocked 条件或 unknown side effect。最终交付一个可机读 handoff bundle、artifact manifest、审批与状态事件轨迹，以及签名后的人工接管检查表。',
    ]),
    keyPoints: Object.freeze([
      '退款调用在审批前只保存意图与验证产物，耐久暂停提交后释放所有短期执行资源。',
      '拒绝、过期、参数漂移、取消、有效批准和不可恢复失败分别走有证据的状态分支。',
      '验收要求陌生工程师凭 bundle、manifest、账本和检查表证明能安全继续且不会重复退款。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '先证明批准仍对应这笔退款',
      body: '批准的是某一版本的规范化调用，不是“这个 run 以后可以退款”的永久通行证；金额、对象、权限或策略变化都会使旧决定失效。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-nist-tool-use',
      'res-harness-primary-feishu-agent-install-md',
      'res-harness-primary-feishu-context-offloading',
      'res-harness-primary-javaguide-agent-skills',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '所有没完成的 run 都标成 failed，等人补资料时再手工改回 running。',
    correction: '可解除外部条件应进入带解除条件和后续动作的 blocked，具体审批进入 awaiting_approval；混成 failed 会破坏恢复、统计和通知。',
  }),
  Object.freeze({
    claim: '耐久 HITL 就是让原 worker 持有连接、锁和短期凭证一直睡到审批回来。',
    correction: '应先持久化审批与 checkpoint，再释放 worker、lease、锁、sandbox 和凭证，由新 worker 在回调后重新取得执行权。',
  }),
  Object.freeze({
    claim: '批准一次后，即使金额、工具版本、权限或策略改变也可以继续执行。',
    correction: '批准只绑定特定调用摘要、身份权限、版本和期限；任一关键语义漂移都应使旧批准失效并重新审批。',
  }),
  Object.freeze({
    claim: 'OpenAI RunState 可序列化或 LangGraph 有 checkpointer，就证明宿主会自动释放资源并重验授权。',
    correction: '框架证明各自的暂停恢复载体；资源清理、回调去重、身份权限重验和 run lease 都需要宿主明确实现。',
  }),
  Object.freeze({
    claim: 'LangGraph 恢复会从 interrupt 的下一行继续，因此中断前写日志或创建记录不会重复。',
    correction: '包含 interrupt 的节点会从开头重跑；中断前副作用必须幂等、后移或拆入独立节点。',
  }),
  Object.freeze({
    claim: 'Handoff 只要一段模型总结，artifact 直接附临时路径和生产凭证最方便。',
    correction: '安全接管需要版本化状态、原始证据与 artifact manifest；产物用稳定 URI 和哈希，凭证只能保存受控引用和访问条件。',
  }),
]);

export const harness08Note = Object.freeze({
  readingMinutes: 42,
  introduction: '前七课已经把 Agent run 放进状态机、checkpoint、权限、sandbox、预算、幂等与有界队列，但真实任务常常不会在同一班次、同一进程或同一版本内结束。长程完成依赖的不只是“更长上下文”：Harness 要知道何时停止，把 trace、工具输出和产物卸载到可寻址载体，通过 Install.md、Skill 与 Hook 渐进披露操作契约，并为下一位操作者保存足够证据。生产退款可能等待财务批准，缺少账号的发布可能等待用户补充，旧 worker 则必须释放执行资源。若只写“暂停了”或留一段模型总结，接管者无法判断这是 awaiting_approval、blocked、failed 还是 cancelled。本课把长时间 HITL 设计为可持久、可去重、可重验的协议，再用 handoff bundle、artifact manifest、跨版本迁移与人工接管检查表，让陌生工程师或新 Runner 从证据恢复，也为下一模块区分 Context、RAG 与 Memory 的职责边界。',
  overviewVisualId: 'visual-harness-08-long-horizon-handoff',
  overviewVisualSectionId: 'classify-waiting-and-terminal-states',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Awaiting approval 等待一个已持久化的具体审批；blocked 等可解除条件；failed 表示恢复不可用或耗尽；cancelled 表示停止与清理。',
    '状态携带 reasonCode、evidenceRefs、recoverable 条件和 allowedNextActions，叙述性总结只能作为辅助。',
    '长审批先提交请求、调用摘要、版本、期限、resume token 哈希和 checkpoint，再释放 worker、锁、lease、sandbox 与短期凭证。',
    '审批回调按请求、决定和状态版本去重；新 worker 重获 lease、依赖与凭证，并重验身份、权限、调用、工具、策略和资源。',
    'OpenAI 通过 interruptions 与可序列化 RunState 批准、拒绝和恢复；长期待决状态还需版本标记。',
    'LangGraph 用 thread/checkpoint 与 Command 恢复，包含 interrupt 的节点从开头重跑，中断前副作用必须幂等。',
    'Handoff bundle 交付目标、验收、版本化状态、事件、尝试、未决项、预算、审批、账本、产物、验证、敏感引用与下一步。',
    'Artifact manifest 用稳定 URI、hash、mediaType、generationStep、verification、retention 与 accessClass 证明产物身份和可用性。',
    '跨版本接管先验证与迁移，再取得 lease 和执行权；不兼容但可路由时是 blocked，无证据可恢复时才是 failed。',
    'Blocked 原因码、handoff 字段和接管顺序是课程综合模板；NIST taxonomy 不是实现规范，社区导航与无正文视频不能支撑关键保证。',
  ]),
  nextStep: '至此，Harness 模块完成了从 run 启动到暂停、恢复、终止和交接的控制闭环，但 handoff bundle 仍不是长期知识库：它保存一次运行的可接管事实，不负责把大量历史自动变成下一次推理所需的相关上下文。接下来的 Context、RAG 与 Memory 模块会讨论如何选择、检索、压缩和更新可复用信息，并继续区分短期运行状态、会话历史与长期记忆；可观测性则把本课的 reasonCode、事件游标、审批延迟、资源释放、迁移结果、artifact verification 和接管动作转为 trace、metric、log 与告警，使团队能验证协议在真实故障和跨班次交接中是否成立。',
});
