const sections = Object.freeze([
  Object.freeze({
    id: 'state-read-and-termination-priority',
    title: '先读状态、再判终止：循环的第一步不是调用模型',
    paragraphs: Object.freeze([
      '上一课已经把单次工具调用拆成模型提案、宿主校验、真实执行和 observation 回填；Agent loop 要做的，是让这些步骤在同一份任务状态上有序重复。每轮开始先读取不可变的 task contract、当前 working state、最近事件和剩余预算，形成一份只含本轮决策所需信息的 state view。模型不是状态真相的拥有者：完成证据、审批结果、工具终态和预算计数都由宿主从可验证记录计算，不能靠模型说“应该已经好了”来更新。',
      '读取后立即运行确定性的终止检查，而且优先级必须写进代码与测试。本课程采用 done → failed → handoff → blocked → budget-exhausted 的顺序：已有完成证据时即使同时出现阻塞或预算耗尽也返回 done；不可恢复的系统不变量破坏返回 failed；风险或失败阈值要求把控制权转给人或其他执行者时返回 handoff；缺少必需输入、权限或依赖时返回 blocked；前四项都不成立才检查步数、时间或成本预算。优先级是本课程工程约定，不是 ReAct 论文标准，但它消除了同一状态多种解释造成的不确定性。',
      'Anthropic 的工程正文要求 Agent 每步从环境取得 ground truth 来评估进展，并在检查点或阻塞时请求人工反馈，还建议设置最大迭代等停止条件；OpenAI 的工程指南把 run 描述为持续到工具调用、结构化输出、错误或最大轮次等退出条件的循环，并把超出失败阈值和高风险动作列为人工介入触发器。两者支撑“外部证据、硬预算、人工出口”这一原则，却没有定义上述五状态的字段或优先级；五状态枚举和排序是为了完成本课交付物而显式给出的课程综合。',
    ]),
    keyPoints: Object.freeze([
      '每轮先从可信记录构造 state view，再执行确定性的终止检查；模型自述不能充当完成证据。',
      '课程约定 done → failed → handoff → blocked → budget-exhausted，优先级必须编码并测试。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '终止检查必须早于 decide',
      body: '目标已经完成或任务已经阻塞时再调用一次模型，既浪费预算，也可能产生不该发生的副作用；先终止是控制器职责，不是提示词建议。',
    }),
    sourceIds: Object.freeze(['res-agent-anthropic-effective', 'res-agent-openai-guide', 'res-agent-agentbench']),
  }),
  Object.freeze({
    id: 'decide-from-observable-state',
    title: 'Decide：基于可观察状态选择一个受约束动作',
    paragraphs: Object.freeze([
      '终止检查返回 continue 后，控制器才请求模型决定下一步。decide 的输入至少包括目标摘要、硬约束、当前事实与未知项、最近相关 observation、可用工具声明、允许的恢复动作和剩余预算；输出则应是可验证的结构化候选，例如 call-tool、ask-user、finish-candidate、handoff-candidate 或 fail-candidate，而不是一段可被任意解释的散文。模型可以建议结束，但宿主仍要用 completion predicate 核验；模型可以建议工具，宿主仍按上一课的 ACI 边界校验。',
      'ReAct 原论文研究的是让语言模型交错生成自然语言 reasoning trace 与任务特定 action：reasoning trace 用来跟踪或调整计划、处理例外，action 则连接知识库或交互环境取得新信息。论文在 HotpotQA、FEVER、ALFWorld 和 WebShop 等设定中比较 ReAct、CoT 与只行动基线；因此它能支撑“行动把外部信息带回后续决策”这一机制，但不能证明所有生产 Agent 都应暴露长篇推理，也不能定义本课程的 JSON 动作枚举、权限检查或终止优先级。',
      '普通 chain-of-thought 主要在文本内部展开中间推理，并不要求宿主执行环境动作或把新的 observation 插回下一轮；ReAct 的区分点是 reasoning 与 task-specific actions 在论文轨迹中交错，外部反馈能够改变后续步骤。如果任务不需要外部新证据，一次结构化输出或固定 workflow 往往更直接；只有当下一动作确实依赖最新环境反馈时，循环式 decide 才值得承担额外调用、延迟和错误累积成本。',
    ]),
    keyPoints: Object.freeze([
      'decide 只选择候选动作，完成、失败和交接仍由宿主根据外部谓词确认。',
      'ReAct 区别于普通 CoT 的核心是任务动作与环境 observation 进入后续决策，而不是推理文本更长。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '模型是策略提议者，控制器是裁判',
      body: '模型根据 state view 提议下一动作；控制器决定该动作是否允许、是否执行、结果如何记账，以及是否已经到达任何出口。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-lilian-weng', 'res-agent-openai-guide']),
  }),
  Object.freeze({
    id: 'validate-and-act-boundary',
    title: 'Validate 与 Act：校验通过才跨越副作用边界',
    paragraphs: Object.freeze([
      'decide 之后必须先 validate，再 act。宿主依次检查动作类型是否在允许空间内、工具参数是否满足 schema、业务资源与跨字段关系是否成立、认证主体是否有权、风险是否需要审批、预算是否足够，以及副作用调用是否携带宿主持久化的稳定 intent 与幂等映射。结构失败不是工具失败：前者生成 validation observation 供下一轮修参，后者才是外部系统实际返回的执行结果；把二者混为“再试一次”会制造无意义重复。',
      'act 是唯一允许越过真实系统边界的步骤。控制器使用受限凭据执行获准动作，为调用分配 event id，并在外部调用前持久化动作名、规范化参数摘要、状态版本、宿主稳定 intent、幂等映射与开始时间；进程重启后先查事件和外部请求终态，复用原 intent 对账，而不是盲目重做已有副作用。这里复用了上一课已建立的宿主执行边界。遇到高风险动作则先返回 handoff 或 approval-waiting，而不是让模型自行批准；若校验发现不可恢复的不变量破坏，控制器写入 fatal error 并在下一次终止检查返回 failed；若只是缺少用户输入或权限，写入 blocker 并返回 blocked 或 handoff。',
      'OpenAI 指南的 run loop、工具风险与人工介入建议，以及 Anthropic 对清晰工具、环境反馈和受控自治的经验，都支持在模型之外保留执行边界。本段的 validate 顺序、事件字段和错误分流则是课程工程综合，用来回答面试中的“最小 loop 如何避免 while(true) 盲目调用”。它们不应被说成两个厂商共同发布的协议；真实系统还必须把授权、审计、超时、补偿和隐私要求落到自己的服务契约。',
    ]),
    keyPoints: Object.freeze([
      '固定执行链是 decide → validate → act；结构错误、业务拒绝和真实工具失败必须生成不同 observation。',
      '副作用只在宿主边界内执行，高风险、可信身份、幂等与审计不能交给模型自行决定。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: 'Act 不是“模型输出了动作”',
      body: '模型输出只是候选；只有宿主完成校验并实际调用外部系统，才发生 act。这个区分决定了错误分类、审计和恢复能否成立。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-guide', 'res-agent-anthropic-effective']),
  }),
  Object.freeze({
    id: 'observe-and-update-state',
    title: 'Observe 与 Update：工具结果先回填，再进入下一轮',
    paragraphs: Object.freeze([
      'act 返回后，宿主把结果规范化为 observation：至少包含 call id、success、结果类别、最小必要 data、结构化 error、证据引用和时间或外部版本。Observation 是环境对动作的回答，不是模型对结果的猜测；空结果、权限拒绝、瞬态超时、未知副作用终态和业务成功必须可区分。随后先把 observation 追加到事件日志，再依据它计算 state diff，例如新增已确认事实、改变待办项、登记 blocker、扣减预算或更新完成证据。',
      'update 只能由可观察结果驱动。一次调用已提交不等于工具成功，工具返回 success 也不必然等于业务目标完成；控制器要把 call submitted、action succeeded 和 goal satisfied 分开。下一轮读取的是更新后的 state version 与相关 observation，因此固定因果链必须是 decide → validate → act → observe → update；若跳过回填，模型仍停留在调用前 belief，最容易重复旧动作、编造成功或错误地继续旧计划。',
      'ReAct 论文中的 action 允许模型与 Wikipedia API、文本环境或网页购物环境交互，并把 observation 放回后续轨迹；Anthropic 也把每步工具结果或代码执行称作评估进展所需的环境 ground truth。这两份材料共同支撑“行动后吸收观察”的机制。事件日志字段、三层完成语义和 state diff 仍是课程综合；它们负责把论文直觉变成可恢复、可测试的宿主程序，而不是声称原论文已经规定现代生产日志 schema。',
    ]),
    keyPoints: Object.freeze([
      '工具结果必须以 call id 关联写入事件日志，并在进入下一轮前驱动 working state 更新。',
      'submitted、action succeeded 与 goal satisfied 是三种不同证据，只有完成谓词成立才返回 done。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '搜索空结果仍是一条 observation',
      body: 'success=true、items=[] 说明查询执行成功但没有命中；它应更新“已查范围”和策略，而不能被写成工具失败，也不能被忽略后原样再搜。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-anthropic-effective', 'res-agent-lilian-weng']),
  }),
  Object.freeze({
    id: 'progress-and-repetition-detection',
    title: '进展与重复检测：阻止无进展循环，也允许有新证据的重试',
    paragraphs: Object.freeze([
      '无限工具调用通常不是单一的“模型随机性”问题，而是控制器缺少可判定出口：工具结果未回填使 belief 不变，错误都被标成可重试，完成谓词永远不成立，预算没有硬上限，或状态更新把真实变化丢失。AgentBench 在其八类环境与所测模型的设定中把达到预设最大交互轮次或多轮重复生成归为 Task Limit Exceeded，并分析了末段重复内容与动作循环；这说明重复和终止失败是可观察轨迹问题，但其特定百分比和旧模型结果不能外推为所有生产 Agent 的发生率。',
      '工程上可为每次动作计算指纹：tool name + canonicalized params + relevant state/version + result class。canonicalized 表示对象键排序、默认值显式化并删去时间戳等无关噪声；relevant state/version 只选会改变该动作意义的事实、游标、权限或外部版本；result class 使用 success-empty、validation-error、permission-denied、timeout 等稳定类别，而不是整段错误文本。随后同时比较 state diff：只有指纹重复、相关状态没有实质进展且连续次数达到配置阈值，才阻止再次执行并选择修参、换工具、blocked 或 handoff。',
      '这个规则不能退化成“同工具同参数永远不许再调”。搜索任务可把新增且去重后的有效证据数、尚未覆盖的必要问题数、已推进游标或已探索查询簇作为进展指标，而不是把回复字数变化当进展；若这些值都不变，重复搜索才累计无进展。环境版本改变、审批刚到位、退避窗口结束、搜索游标推进或先前未知终态已完成对账时，相关 state/version 变化会产生新指纹或清零计数，合理重试仍可发生。Lilian Weng 的综述在转述相关 Agent 研究时也把连续相同动作导致相同 observation 视为应停止的低效轨迹信号；本课程加入状态版本、结果类别和业务进展指标以降低误杀，属于工程综合而非 ReAct 论文定义。',
    ]),
    keyPoints: Object.freeze([
      '动作指纹至少含 tool、规范化 params、相关 state/version 与 result class，并与真实 state diff 联合判断。',
      '仅在“重复 + 无状态进展 + 达到阈值”同时成立时阻止；环境变化后应允许有依据的重试。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: 'temperature=0 不能修复循环',
      body: '确定性采样仍会在相同 belief、相同错误分类和缺失出口下稳定重复；修复点是回填、状态、错误类别、进展指标与硬预算。',
    }),
    sourceIds: Object.freeze(['res-agent-agentbench', 'res-agent-lilian-weng', 'res-agent-anthropic-effective']),
  }),
  Object.freeze({
    id: 'react-boundary-and-observable-logging',
    title: 'ReAct 的准确边界：保留环境闭环，不依赖隐藏思维链',
    paragraphs: Object.freeze([
      'ReAct 原论文的具体设定确实使用可见的自然语言 reasoning traces，并让它们与任务特定 action、环境 observation 交错；知识密集任务接入简化 Wikipedia API，交互决策任务包括 ALFWorld 与 WebShop，模型和 few-shot 轨迹也属于论文当时的实验条件。因此准确表述是“论文在这些设定中研究交错 reasoning 与 acting”，而不是“ReAct 是所有 Agent 的标准运行时”或“论文证明任何模型在任何工具环境都更可靠”。',
      '现代生产实现不应把获取、展示或持久化模型隐藏思维链当作控制器依赖。可观察日志应记录 decision summary、所选 action、规范化参数摘要、validation 结果、observation、state diff、预算变化和 terminal decision；decision summary 只写可审查的任务理由，例如“需查询订单状态以验证取消是否生效”，不要求逐 token 暴露内部推理。这个日志政策是课程基于可观察性与隐私边界的工程综合，不声称 ReAct 论文提出了现代隐藏推理政策。',
      '面试回答可以据此给出清楚对比：普通 CoT 可以只在模型文本中展开推理，未必执行动作；ReAct 论文轨迹把 reasoning trace、任务动作和外部 observation 交错，使后续步骤能吸收新证据；生产控制器则可保留这种环境闭环，同时把接口收敛为结构化动作与简短决策摘要。采用与否看任务是否需要外部反馈，不能因为名字流行就给一次性文本任务套上多轮循环。',
    ]),
    keyPoints: Object.freeze([
      'ReAct 结论必须限定在论文的模型、few-shot 轨迹、动作空间与四类任务设定内。',
      '生产日志记录可观察 decision summary、action、observation 与 state diff，不获取或依赖隐藏思维链。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '可观察摘要不等于隐藏推理',
      body: '“为什么此刻需要这个动作”的短摘要可供审计；模型未公开的内部推理不是协议字段，也不是完成证据或恢复依据。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-lilian-weng']),
  }),
  Object.freeze({
    id: 'minimal-loop-and-deterministic-lab',
    title: '控制循环交付：可照抄伪代码与确定性决策台',
    paragraphs: Object.freeze([
      '下面的伪代码可直接作为本课 deliverable；terminal_check 必须在 decide 之前，工具结果必须在下一轮前回填：function run_agent(task) { state = load_state(task.id); while (true) { view = read_state_view(task.contract, state); terminal = terminal_check(view, priority=[done, failed, handoff, blocked, budget-exhausted]); if (terminal) return terminal; candidate = decide(view); validation = validate(candidate, view.allowed_actions, view.permissions, view.risk_policy); if (!validation.ok) { obs = observation_from_validation(candidate, validation); append_event(obs); state = update_state(state, obs); if (validation.fatal) state.failed = true; continue; } action = act(candidate, host_identity, stable_intent); obs = normalize_observation(action.call_id, action.result); append_event(obs); next = update_state(state, obs); progress = compare_relevant_state(state, next); fingerprint = hash(action.tool, canonicalize(action.params), relevant_version(state), classify(obs)); next = update_progress(next, fingerprint, progress); state = next; } }。所有出口都由 terminal_check 返回结构化 status、reason 与 evidenceRef。',
      '实现第二步是把失败路径写全：done 需要 completion predicate 的证据；failed 只用于不可恢复不变量或宿主故障；budget-exhausted 覆盖 max turns、deadline 或成本硬上限；blocked 表示缺少必需信息、权限或外部依赖且当前不能自行解除；handoff 表示把任务、状态、最近 observation、未决副作用和建议下一步移交给人或另一受控执行者。每轮都严格遵守 decide → validate → act → observe → update；validate 拒绝也要形成 observation 和状态更新，才能避免在下一轮原样重提。',
      '页面中的 agent-loop 决策台只运行本地确定性规则：goalSatisfied 优先于 blocked 与步骤预算，blocked 又优先于 budget-exhausted，否则 continue。它不调用真实模型或第三方 API，不模拟 ReAct 论文评测，也没有展示 failed、handoff、时间预算、成本预算和重复指纹；你需要在伪代码中补全这些出口，再切换 goalSatisfied、blocked、stepsUsed 与 maxSteps 验证现有优先级。最后新增两条测试：相同指纹但 state version 改变时允许重试；相同指纹、无进展且到阈值时返回 handoff 或 blocked。',
    ]),
    keyPoints: Object.freeze([
      '交付伪代码包含 done、failed、handoff、blocked、budget-exhausted，并严格执行终止优先的完整因果链。',
      'agent-loop 页面是本地确定性终止优先级教学模拟，不是真实模型、生产控制器或 ReAct 能力评测。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '验收轨迹至少覆盖五种出口',
      body: '为同一 task contract 分别构造完成证据、致命不变量、人工交接、外部阻塞和预算耗尽；另加一条正常 continue→工具 observation→状态进展轨迹。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-guide', 'res-agent-anthropic-effective', 'res-agent-agentbench']),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Agent loop 就是 while(true) 反复调用模型和工具，模型自然会知道什么时候停。',
    correction: '循环必须在每轮 decide 前检查外部完成证据、失败、交接、阻塞与硬预算；缺少确定出口会把控制缺陷变成无限调用。',
  }),
  Object.freeze({
    claim: '模型输出 finish 或说“任务完成”就可以直接返回 done。',
    correction: 'finish 只是候选动作；宿主要用工具终态、产物校验或测试等 completion predicate 复核，模型自述不能替代环境证据。',
  }),
  Object.freeze({
    claim: 'ReAct 的要点是向用户展示更长、更详细的思维链。',
    correction: '论文要点是在其设定中交错 reasoning trace、任务动作与 observation；生产系统可以记录短决策摘要，不应获取或依赖隐藏思维链。',
  }),
  Object.freeze({
    claim: '同一个工具和参数调用过一次后就应永久禁止重复。',
    correction: '只有动作指纹重复、相关状态无进展且达到阈值才阻止；权限、游标、审批、外部版本或退避窗口改变后，重试可能合理。',
  }),
  Object.freeze({
    claim: '把 temperature 调成零就不会无限工具调用。',
    correction: '相同 belief、错误分类和缺失出口会产生确定性重复；真正修复点是 observation 回填、state diff、进展指标、错误路由和硬预算。',
  }),
  Object.freeze({
    claim: '页面 agent-loop 决策台已经实现并验证了真实 ReAct Agent。',
    correction: '该实验只运行 goalSatisfied、blocked 与步骤预算的本地确定性优先级，不调用模型、工具或论文环境，也不代表生产可靠性。',
  }),
]);

export const agent04Note = Object.freeze({
  readingMinutes: 37,
  introduction: '上一课完成了单次工具调用的可信边界，本章把它放进一个可观察、可预算、可终止的控制程序。你将从可信状态读取开始，依次实现终止检查、decide、validate、act、observe、update 与进展检测，手写包含五类出口的最小 Agent loop；同时准确理解 ReAct 论文的环境交互设定，并把可观察决策摘要与模型隐藏推理分开。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Agent loop 是宿主控制程序，不是模型自己反复续写；每轮从 task contract、可信状态、事件和剩余预算构造 state view。',
    '终止检查必须早于 decide；课程优先级为 done、failed、handoff、blocked、budget-exhausted，并用测试固定冲突状态的唯一结果。',
    '模型只负责基于可观察状态提出结构化候选，finish、fail 或 handoff 建议都需要宿主复核。',
    '每轮固定因果链为 decide → validate → act → observe → update，任何拒绝或结果都要形成 observation。',
    '工具输出用 call id 关联写入事件日志，再驱动 state diff；提交、动作成功与业务目标完成必须分开。',
    '动作指纹至少包含 tool、规范化 params、相关 state/version 和 result class，并与无进展计数联合使用。',
    '重复动作只有在相关状态不变且达到阈值时才阻止；环境、权限、游标或版本变化后允许有依据的重试。',
    '无限调用常来自无完成证据、结果未回填、错误分类错误、进展检测缺失或预算不硬，不是 temperature 单独造成。',
    'ReAct 论文在其问答、事实核验和交互环境中交错 reasoning、action、observation；结论不能外推成通用生产保证。',
    '生产日志记录 decision summary、action、validation、observation、state diff、预算与终止决定，不获取或依赖隐藏思维链。',
    'agent-loop 决策台只是本地确定性终止优先级教学模拟，不是真实模型调用或 ReAct 评测。',
  ]),
  nextStep: '一个可终止循环仍可能在长任务中短视地逐步反应。下一课将把 plan 视为可验证的行动假设，比较 reactive、plan-and-execute 与搜索式规划，并依据新 observation 调整依赖、验证点和恢复动作；本课的 state diff、进展指纹、硬预算和结构化出口会成为判断何时继续原计划、何时重规划的控制信号。',
});
