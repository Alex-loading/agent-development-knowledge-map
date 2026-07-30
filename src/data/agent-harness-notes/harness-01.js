const sections = Object.freeze([
  Object.freeze({
    id: 'decision-and-control-planes',
    title: '先分清决策面与控制面',
    paragraphs: Object.freeze([
      '飞书 Harness 101 用“模型之外的全部”提出本课的第一条责任线：模型根据目标与观察生成候选文本或 tool intent，真正改变文件、数据库和外部服务的是模型之外的执行系统。这里把 Agent 放在决策面，把 Harness 放在控制面与运行时：前者选择下一步并解释观察，后者给 run 编号，组装上下文，校验 schema、身份、权限和预算，安排工具与 sandbox，并决定继续、等待、拒绝或停止。模型输出因此只是提案，不是授权，不是副作用已经发生的证据。',
      'Runner 是 Harness 中驱动一次运行的确定性控制器。OpenAI Agents SDK 的 Runner 会推进模型调用、工具调用、handoff 和最终输出；其 Sandbox Agents 文档又把 harness control plane 与 sandbox compute plane 分开。这个实现可帮助建立边界直觉：控制面决定允许什么并编排生命周期，执行面只在给定 manifest、capability、凭证、挂载和 session 边界内做工作。该页面仍是 Beta，具体隔离强度取决于 provider 与配置，不能据此宣称绝对安全。',
      'JavaGuide 的六类 Harness 责任可作检查表，而不是行业标准：context 决定模型看见什么，tools 决定可提出什么能力，state 保存事实和控制位置，control 推进循环，safety 强制权限与隔离，observability 留下 transcript、事件、checkpoint 和 artifact。Prompt 可以劝模型不要越权，却不能撤销凭证、关闭网络、锁定预算或持久化终态；这些动作必须由模型不能自行改写的宿主代码完成。工程评审应逐项问：谁提议、谁验证、谁执行、谁记录、谁能终止、证据在哪里。',
    ]),
    keyPoints: Object.freeze([
      'Agent 提议下一步，Harness 在可信宿主侧实施权限、执行、持久化、预算、审计和终止。',
      'Runner 是生命周期控制器；sandbox 是受约束的执行面，二者不能被一个 Prompt 取代。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '导演与场务的类比边界',
      body: 'Agent 像提出下一镜怎么拍的导演，Harness 像掌管场地、许可、器材和停机规则的场务系统。类比只解释职责分离，真实系统仍须以状态、权限与审计记录为准。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-running',
      'res-harness-openai-sandboxes',
      'res-harness-primary-feishu-beyond-model',
      'res-harness-primary-javaguide-harness-engineering',
    ]),
  }),
  Object.freeze({
    id: 'run-attempt-step-session',
    title: '从 tool transcript 看见循环如何推进',
    paragraphs: Object.freeze([
      '最小的单工具轨迹包含四类事实：Harness 向模型提供当前消息和可见 Tool Definition；模型返回带 callId 的工具意图；Harness 校验后执行并记录 tool result；模型读取该结果后生成终答或下一个意图。比如模型提出 read_file(path)，真正打开文件的是 Harness；result 必须关联 callId、toolVersion、状态和受控结果引用。只保存最后一句自然语言会丢失“模型提议了什么、宿主实际执行了什么、返回了什么”，恢复时无法证明动作边界。',
      '并行工具轨迹不是把多个结果随意拼回聊天。模型可在同一轮提出 read_a 与 read_b 两个互不依赖的 call，Harness 为它们分配独立 callId，分别做授权、预算和超时检查，再按实现允许的并行策略执行。结果可以不同顺序到达，但写回 transcript 时要有确定性关联与排序规则；任何一个调用有副作用、共享资源冲突或依赖另一个结果时，就应改为顺序执行。并行只改变调度，不降低每个调用的治理要求。',
      '多轮轨迹会重复“模型提议—Harness 执行—观察写回”。第一轮 search 得到候选，第二轮 read 打开选中文件，第三轮 validate 形成外部证据；每轮之后 Harness 先判断结果是否满足 stop condition、是否还有预算、是否 blocked 或 cancelled，再决定是否把新观察交回模型。为跨 attempt 和 session 保持可追溯，本课程仍记录 runId、attemptId、stepId、sessionId 与 callId：逻辑 run 可以跨进程存在，旧 attempt 不被新尝试覆盖，sandbox session 的创建和释放也有明确 owner。',
      '这三种 transcript 是教学结构，不是统一 API 格式。OpenAI Runner 展示当前 SDK 如何推进模型与工具，Temporal 和 Azure 展示逻辑运行如何跨 worker 进程延续；飞书文章提供工程叙事。稳定结论是提案、执行、结果和控制判断必须分别记录，具体消息字段、并行行为和耐久语义仍以目标运行时的官方文档与测试为准。',
    ]),
    keyPoints: Object.freeze([
      '单工具、并行工具与多轮工具轨迹都要分开记录模型意图、宿主执行、结果与控制判断。',
      'run、attempt、step、session 与 callId 让重试、并行、跨进程恢复和资源清理仍能关联到原事实。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-01-tool-transcript', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-temporal-execution',
      'res-harness-azure-durable',
      'res-harness-agentscope-runtime',
      'res-harness-primary-feishu-react-loop',
      'res-harness-primary-javaguide-agent-basis',
    ]),
  }),
  Object.freeze({
    id: 'normative-state-machine',
    title: '十状态、转换守卫与不可逆终态',
    paragraphs: Object.freeze([
      '本课程把 Runner 规范化为十个状态：created、queued、running、awaiting_approval、retry_wait、blocked、succeeded、failed、cancelled、timed_out。它们是为了教学与工程评审统一词义而建立的课程模型，并非 OpenAI、Temporal、Azure 或任何单一 SDK 发布的标准状态枚举。十状态之外不再增加另一个“暂停态”或“完成态”别名：等待审批、退避等待和外部条件缺失分别落到前三个等待类状态，成功结束只能记录为 succeeded。',
      'ReAct 的“继续还是停止”必须落到确定性守卫，而不是只问模型是否想继续。每次观察写回后，Harness 先检查 completion evidence 是否满足、当前是否 blocked/cancelled、预算和 deadline 是否耗尽、是否仍有待处理 tool call，再决定 complete、等待、终止或进入下一次模型调用。模型可以给出“已完成”的判断，但 succeeded 需要宿主可验证的验收证据；模型也可以要求继续，但超过预算或命中停止策略时 Runner 必须拒绝。',
      '守卫除了检查当前状态，还应检查 eventId 去重、sequence 严格递增、审批对象匹配、预算剩余和调用者权限。若审批到期与取消几乎同时到达，本课程要求先用持久化序列和显式优先策略确定唯一顺序；例如取消命令先被接受，状态就进入 cancelled，稍后的 approve 必须作为非法终态转换被拒绝。Temporal 和 Azure 展示了耐久执行、事件重放以及 suspend、resume、terminate 等实现语义，但它们既不定义这套十状态，也不把外部副作用自动变成只发生一次。',
    ]),
    keyPoints: Object.freeze([
      '十状态是课程规范化工程模型，不是某个 SDK 或行业组织的统一标准。',
      '事件决定想做什么，守卫决定当前是否允许；四个终态一旦写入便不可逆。',
      '并发事件必须通过去重键、序列与优先策略确定顺序，不能让到达时机暗中改写语义。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '耐久执行不等于副作用只发生一次',
      body: '事件历史可让控制流程恢复，但远端工具可能已经成功而本地尚未记录。状态机负责拒绝非法转换，副作用幂等与对账将在后续课程单独处理。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-01-stop-guard', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-running',
      'res-harness-temporal-execution',
      'res-harness-azure-durable',
      'res-harness-primary-feishu-react-loop',
    ]),
  }),
  Object.freeze({
    id: 'hook-contracts',
    title: '把 lifecycle hooks 收窄成契约',
    paragraphs: Object.freeze([
      'Lifecycle hook 是 Runner 在稳定生命周期边界调用的扩展点，而不是可以随时改数据库的插件后门。本课程要求每个 hook 声明触发时机、只读输入、结构化输出、超时、失败类别、重试上限、执行顺序与审计版本。输入至少关联 run、attempt、step、session、当前状态、事件 sequence、剩余预算和策略版本；输出只能是 schema 允许的观察、拒绝建议或补充元数据，最终状态转换仍由同一 Runner 守卫执行。',
      'Plan-then-Act 不会取代控制面，它只是把计划产物显式放进循环。before_model 可以提供 briefing：目标、验收标准、已知事实、预算、禁止项和当前计划版本；模型提出 plan 后，Runner 把可执行步骤转成受控队列。执行偏离、证据不足或计划过期时，Harness 用 nudge 返回具体缺口，例如“先验证测试结果再提交”，而不是偷偷执行模型没有提出的动作。briefing 和 nudge 都要带版本与来源，模型仍不能借计划绕过工具注册、授权和停止守卫。',
      'after_tool 的失败尤其容易造成语义混乱：远端工具结果一旦已经保存，后处理失败不能把它伪装成“工具从未执行”，也不能仅因 hook 重试就再次执行原工具。Runner 应分别记录 tool outcome 与 hook outcome，再按契约选择重试 hook、降低为告警、使 run 失败或交给人工。OpenAI Runner、AgentScope Runtime 及 Hello-Agents 教材都展示了 loop、callback 或生命周期抽象，但完整字段和失败矩阵是本课程的工程契约，不能归因于某一个实现。',
    ]),
    keyPoints: Object.freeze([
      'Hook 输入只读、输出受 schema 限制，且超时、失败、重试、顺序和版本都必须显式。',
      'Hook 可以观察或提出策略结果，但不能绕过状态机、工具授权、预算与持久化边界。',
      '工具执行结果与 after_tool 结果要分别落账，避免后处理失败触发重复副作用。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-running',
      'res-harness-agentscope-runtime',
      'res-harness-hello-agents-framework',
      'res-harness-primary-feishu-react-loop',
      'res-harness-primary-javaguide-agent-basis',
    ]),
  }),
  Object.freeze({
    id: 'terminal-cleanup',
    title: '让每条路径都抵达可重放的清理',
    paragraphs: Object.freeze([
      '终态不是把 status 字段改掉就结束。Runner 还要停止派发新 step，传播取消信号，释放 worker lease，关闭或回收 sandbox session，撤销临时凭证与挂载，刷新事件和 checkpoint，封存日志、测试报告及 artifact 引用，并为未确认的外部动作留下对账线索。清理对象应在获得时登记 owner 与 release 状态，终态处理才能按账本逐项核对，而不是依赖某段 finally 代码刚好运行。',
      '清理也不能假设 on_terminal 只调用一次。进程可能在写入终态之后、释放资源之前崩溃，恢复者随后会再次执行清理，所以每个清理动作都应可重复检查：已经撤销的凭证再次撤销不应破坏状态，已经关闭的 session 返回“已关闭”也应视作成功。课程建议把终态事实与 cleanup-pending 记录持久化，再由可重放清理器逐项确认；这是工程综合模式，并不是相关框架共同承诺的原子事务。',
      'OpenAI Sandboxes 提供 session、snapshot、挂载和凭证边界，Temporal 与 Azure 展示逻辑运行跨进程恢复的方式，AgentScope 则提供另一种 sandbox 与状态服务实现。它们共同提醒我们区分“worker 不在了”和“run 已安全收尾”，但耐久编排仍不保证任意外部工具只执行一次。若远端结果不明，终态产物必须保留调用标识与证据缺口，后续再进入幂等、对账或人工处理，而不是在清理阶段假装回滚成功。',
    ]),
    keyPoints: Object.freeze([
      '所有成功、失败、取消与超时路径都要停止新工作、释放资源并封存可审计产物。',
      'on_terminal 与清理动作必须能安全重放，不能依赖宿主进程只退出一次。',
      '资源释放不等于外部副作用回滚；不确定结果必须保留证据并交给恢复协议。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-temporal-execution',
      'res-harness-azure-durable',
      'res-harness-agentscope-runtime',
      'res-harness-primary-feishu-beyond-model',
    ]),
  }),
  Object.freeze({
    id: 'lifecycle-lab-deliverable',
    title: '用 Run Lifecycle 实验验收设计',
    paragraphs: Object.freeze([
      '交互实验是本地确定性 reducer，不连接真实 worker 或持久层。初始 state 包含 status=created、sequence=0、processedEventIds、stepsUsed 与 pendingApproval。每次点击生成递增 sequence 和唯一 eventId，再由同一 reduceRun 检查重复、乱序、合法来源状态与步数预算。先依次触发 enqueue、start、request-approval、approve、schedule-retry、retry、block、resume、complete，可以看到十状态中的主路径与等待路径，最后到 succeeded；此后再触发任何事件都会因终态不可逆而被拒绝。',
      '状态转换表至少应写出“来源状态｜事件｜守卫｜目标状态｜审计原因｜清理影响”。正常路径记录 created→queued→running→succeeded；审批路径记录 running→awaiting_approval→running；退避与阻塞分别记录 running→retry_wait→running、running→blocked→running；失败、取消和整体超时从任意非终态进入各自终态。对 request-approval 还要写 callId 必填，对 step 写剩余预算，对所有事件写 eventId 未处理且 sequence 等于上一值加一。',
      '两条运行轨迹要能重放而不是只画箭头。轨迹一可让代码 Agent 排队、启动、读取仓库、请求执行测试、审批通过、记录 after_tool 结果并以验收证据触发 complete，随后 on_terminal 封存日志并释放 session。轨迹二可在 awaiting_approval 时先接受 cancel，进入 cancelled 并清理；迟到的 approve 被终态守卫拒绝。再为 before_model、before_tool、after_tool、on_terminal 分别填写输入、输出、超时、失败、重试、顺序和审计字段，就得到练习要求的状态表、hook 契约与两条完整轨迹。',
    ]),
    keyPoints: Object.freeze([
      '实验用唯一 eventId、严格 sequence、状态来源和预算共同验证转换，不是任意按钮跳状态。',
      '交付物应同时包含转换表、四类 hook 契约和两条带事件、守卫、产物及清理结果的轨迹。',
      '实验只证明 reducer 的教学语义，不代表真实持久层、worker 或远端副作用已经可靠。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '先测非法路径',
      body: '从 created 直接触发 complete、重复投递同一个 eventId，或在 cancelled 后触发 approve；若设计不能稳定拒绝这些输入，就还没有形成可执行状态机。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-running',
      'res-harness-openai-sandboxes',
      'res-harness-temporal-execution',
      'res-harness-primary-feishu-react-loop',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Harness 只是包在 Agent 外面的一段 system prompt，写得足够详细就能完成治理。',
    correction: 'Prompt 只能影响候选输出，无法强制权限、预算、隔离、持久化和资源释放；这些控制必须由模型不能自行改写的宿主执行。',
  }),
  Object.freeze({
    claim: 'created 到 timed_out 的十状态是某个主流 SDK 的官方统一枚举，可以直接照搬接口。',
    correction: '十状态是本课程用于工程评审的规范化模型。各实现的名称和恢复语义不同，接入时必须做显式映射并保留差异。',
  }),
  Object.freeze({
    claim: 'Hook 既然是扩展点，就可以直接修改状态、调用任意工具并绕过主 Runner。',
    correction: 'Hook 必须接受只读上下文、返回受限结构，并经过同一状态、权限和预算守卫；否则它会成为无法审计的旁路执行器。',
  }),
  Object.freeze({
    claim: '只要使用耐久工作流和 replay，外部工具副作用就自然只会发生一次。',
    correction: '耐久编排恢复的是控制流程，无法自动消除远端成功但本地记录丢失的窗口；外部写入仍需要幂等键、证据和对账。',
  }),
  Object.freeze({
    claim: '状态已经写成 succeeded、failed、cancelled 或 timed_out，资源自然会全部释放。',
    correction: '进程可能在终态提交与释放之间崩溃。必须持久化 cleanup-pending，并让 on_terminal 与每项释放动作可以安全重放和核对。',
  }),
]);

export const harness01Note = Object.freeze({
  readingMinutes: 33,
  introduction: '你已经知道 Agent 会在 ReAct 式“提案—动作—观察”循环里选择下一步，但一个能作决定的模型并不会自动成为可靠运行系统。本章以飞书 Harness 101 的工具轨迹和“模型之外的全部”为主叙事，用 JavaGuide 的 Agent/Harness 分类交叉检查，再由 OpenAI、Temporal 与 Azure 的官方实现限定事实边界。你将逐条拆解单工具、并行工具和多轮 transcript，理解 ReAct 的继续/停止守卫与 Plan-then-Act briefing/nudge，然后把它们放进 control plane、runtime、sandbox、证据链、十状态生命周期和 hook 契约。学完后，你应能证明模型只提出候选动作，Harness 才执行、记录并决定何时继续或停止。',
  overviewVisualId: 'visual-harness-01-control-system',
  overviewVisualSectionId: 'decision-and-control-planes',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Agent 位于决策面并提出候选动作；Harness 位于控制面，负责执行治理、状态、预算、审计和终止。',
    'Runner 驱动生命周期，sandbox 承载受约束执行；控制面与执行面必须通过明确能力和 session 边界连接。',
    'run、attempt、step、session 分别标识逻辑运行、执行尝试、观察边界与受管理句柄，它们是课程工程词汇而非框架标准。',
    '十状态课程模型区分排队、运行、三类等待和四个不可逆终态，不使用含义重叠的状态别名。',
    '合法转换同时依赖事件、来源状态、eventId、sequence、审批对象、权限与预算守卫。',
    'Hook 的输入输出、超时、失败、重试、顺序和审计版本必须显式，且不能绕过核心校验。',
    '终态处理要停止新工作、释放 session 与凭证、封存事件和产物；清理动作必须可安全重放。',
    'Run Lifecycle 实验用于验证 reducer 语义，真实系统仍需持久层、并发控制和外部副作用恢复协议。',
  ]),
  nextStep: '下一课将把本章状态机背后的记录拆成 run state、append-only event log 与 checkpoint：当前状态回答“现在是什么”，事件回答“为何走到这里”，checkpoint 回答“从哪里可恢复”。你将进一步处理重复事件、崩溃窗口、replay 与版本迁移，从而让这里定义的 sequence、终态事实和 cleanup-pending 不只存在于内存实验中。',
});
