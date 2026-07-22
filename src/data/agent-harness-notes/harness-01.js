const sections = Object.freeze([
  Object.freeze({
    id: 'decision-and-control-planes',
    title: '先分清决策面与控制面',
    paragraphs: Object.freeze([
      '上一模块的 Agent loop 已经能根据目标、状态和观察提出下一步动作；本章要解决的是，谁有权把这个提议变成真实操作。Agent 属于决策面：它选择候选动作、解释观察并判断还缺什么。Harness（宿主执行系统）属于控制面：它给 run 编号，保存状态，校验工具、身份、权限和预算，安排执行环境，并决定何时拒绝、等待或终止。模型输出因此只是提案，不是系统授权，也不是动作已经发生的证据。',
      'Runner 是 Harness 中驱动一次运行的确定性控制器。OpenAI Agents SDK 的 Runner 会推进模型调用、工具调用、handoff 和最终输出；其 Sandbox Agents 文档又把 harness control plane 与 sandbox compute plane 分开。这个实现可帮助建立边界直觉：控制面决定允许什么并编排生命周期，执行面只在给定 manifest、capability、凭证、挂载和 session 边界内做工作。该页面仍是 Beta，具体隔离强度取决于 provider 与配置，不能据此宣称绝对安全。',
      '把 Harness 当作“另一段更长的 Prompt”会丢掉最关键的可信边界。Prompt 可以劝模型不要越权，却不能撤销凭证、关闭网络、锁定预算或持久化终态；这些动作必须由模型不能自行改写的宿主代码强制完成。同一个 Agent 策略可以放进治理能力不同的 Harness，同一个 Harness 也可以承载不同策略。工程评审应逐项问：此能力由谁提议、谁验证、谁执行、谁记录、谁能终止。',
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
    ]),
  }),
  Object.freeze({
    id: 'run-attempt-step-session',
    title: '用四层标识描述一次执行',
    paragraphs: Object.freeze([
      '为了在重试和进程重启后仍能回答“哪一次动作发生了什么”，本课程约定四个层次。run 是从接收目标到业务终态的一次逻辑运行；attempt 是承接同一 run 的一次执行尝试，worker 崩溃或可重试错误可能产生新 attempt；step 是 attempt 内一个可观察的决策或工具边界；session 是 Harness 向某个执行环境或外部交互通道分配的有生命周期句柄。四者不是各框架共享的标准名词，而是课程用于消除歧义的工程词汇。',
      '层级关系通常写成一个 run 包含一个或多个 attempts，一个 attempt 包含按序 steps，而 session 由 Harness 创建、引用并释放；session 可以跨多个 step 复用，却不能等同于 run。进程也不等同于 attempt：耐久编排系统通过事件历史重放，让逻辑工作流跨过单个 worker 进程的消亡继续存在；Azure Durable Task 同样把 orchestrator、activity 与 client 等角色拆开。这里得到的稳定结论是“逻辑运行不应依赖某个进程一直存活”，不是所有框架都必须采用相同对象模型。',
      '日志和事件至少应同时带上 runId、attemptId、stepId；涉及隔离环境时再带 sessionId。这样，模型调用超时后重新尝试不会覆盖旧 attempt，工具结果也能关联到发起它的 step；清理逻辑则可以按 session 查找尚未释放的资源。AgentScope Runtime 的状态 load/save、interrupt 与 sandbox 实现可作为一种运行时交叉参照，但其仓库已进入只读迁移阶段并计划归档，相关能力已迁移至 AgentScope 2.0，不能把项目接口直接提升为通用协议。',
    ]),
    keyPoints: Object.freeze([
      'run 表示业务级逻辑运行，attempt 表示一次执行尝试，step 表示可观察边界，session 表示受管理的执行句柄。',
      '四层术语是课程规范化模型；框架名称可以不同，但身份关联与生命周期所有权不能含糊。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-temporal-execution',
      'res-harness-azure-durable',
      'res-harness-agentscope-runtime',
    ]),
  }),
  Object.freeze({
    id: 'normative-state-machine',
    title: '十状态、转换守卫与不可逆终态',
    paragraphs: Object.freeze([
      '本课程把 Runner 规范化为十个状态：created、queued、running、awaiting_approval、retry_wait、blocked、succeeded、failed、cancelled、timed_out。它们是为了教学与工程评审统一词义而建立的课程模型，并非 OpenAI、Temporal、Azure 或任何单一 SDK 发布的标准状态枚举。十状态之外不再增加另一个“暂停态”或“完成态”别名：等待审批、退避等待和外部条件缺失分别落到前三个等待类状态，成功结束只能记录为 succeeded。',
      '转换必须由事件和守卫共同决定。enqueue 只允许 created 到 queued，start 只允许 queued 到 running；running 可因 request-approval、schedule-retry、block 分别进入 awaiting_approval、retry_wait、blocked，再由 approve、retry、resume 回到 running。只有 running 接受 complete 并进入 succeeded；fail、cancel、timeout 可以把任意非终态分别送入 failed、cancelled、timed_out。succeeded、failed、cancelled、timed_out 都是终态，后续业务事件必须被拒绝，不能靠 hook 或普通重试把终态改回运行中。',
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
    sourceIds: Object.freeze([
      'res-harness-openai-running',
      'res-harness-temporal-execution',
      'res-harness-azure-durable',
    ]),
  }),
  Object.freeze({
    id: 'hook-contracts',
    title: '把 lifecycle hooks 收窄成契约',
    paragraphs: Object.freeze([
      'Lifecycle hook 是 Runner 在稳定生命周期边界调用的扩展点，而不是可以随时改数据库的插件后门。本课程要求每个 hook 声明触发时机、只读输入、结构化输出、超时、失败类别、重试上限、执行顺序与审计版本。输入至少关联 run、attempt、step、session、当前状态、事件 sequence、剩余预算和策略版本；输出只能是 schema 允许的观察、拒绝建议或补充元数据，最终状态转换仍由同一 Runner 守卫执行。',
      '四个练习 hook 的职责应彼此分离。before_model 可裁剪上下文或拒绝超预算请求；before_tool 可根据已解析的工具名、参数摘要和权限结果给出允许、拒绝或要求审批；after_tool 接收已落盘的工具结果引用，追加审计、脱敏或质量判断；on_terminal 在终态事件提交后安排清理和产物封装。观察型 hook 只记录事实，能影响决策的策略型 hook 必须版本化、可审计，并且不能跳过工具注册、授权、预算或 checkpoint 提交边界。',
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
  introduction: '你已经知道 Agent 会在“观察—决策—动作”循环里选择下一步，但一个能作决定的模型并不会自动成为可靠的运行系统。本章把这条循环放进可信宿主：先划清 Agent、Harness、Runner 与 sandbox 的职责，再用 run、attempt、step、session 四层身份和十状态课程模型描述生命周期，随后收窄 hook 契约、补齐终态清理，并用 Run Lifecycle 实验产出可复核的状态表和两条轨迹。学完后，你应能解释谁有权执行动作，设计等待、恢复与终止守卫，并回答 hooks 失败和并发事件到达时系统如何保持不变量。',
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
