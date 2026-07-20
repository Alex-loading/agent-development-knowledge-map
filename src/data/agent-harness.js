const VERIFIED_AT = '2026-07-20';

const resources = [
  { id: 'res-harness-openai-running', title: 'Running Agents', url: 'https://openai.github.io/openai-agents-python/running_agents/', source: 'OpenAI Agents SDK', language: '英文', type: '官方文档', difficulty: '入门', stage: 'Runner 基础', value: '学习用途：辨认 Runner、run 配置与模型决策的职责边界；证据边界：这是当前 OpenAI Agents SDK 的实现语义，不是跨框架标准。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-openai-hitl', title: 'Human-in-the-loop', url: 'https://openai.github.io/openai-agents-python/human_in_the_loop/', source: 'OpenAI Agents SDK', language: '英文', type: '官方文档', difficulty: '进阶', stage: '人工审批', value: '学习用途：对照工具审批的中断、保存和恢复流程；证据边界：这是当前 OpenAI Agents SDK 的实现语义，不是跨框架标准。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-openai-tools', title: 'Tools', url: 'https://openai.github.io/openai-agents-python/tools/', source: 'OpenAI Agents SDK', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '工具治理', value: '学习用途：检查工具注册、参数校验和执行层分工；证据边界：这是当前 OpenAI Agents SDK 的实现语义，不是跨框架标准。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-openai-run-state', title: 'RunState API Reference', url: 'https://openai.github.io/openai-agents-python/ref/run_state/', source: 'OpenAI Agents SDK', language: '英文', type: 'API 参考', difficulty: '进阶', stage: '运行状态', value: '学习用途：理解暂停续跑所需的可序列化控制信息；证据边界：这是当前 OpenAI Agents SDK 的实现语义，不是跨框架标准。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-langgraph-persistence', title: 'Persistence', url: 'https://docs.langchain.com/oss/python/langgraph/persistence', source: 'LangGraph', language: '英文', type: '官方文档', difficulty: '进阶', stage: 'Checkpoint', value: '学习用途：比较状态快照、线程历史和跨进程恢复；证据边界：这是 LangGraph 的具体 checkpoint/replay 语义，不可外推为所有 Harness 的通用保证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-langgraph-interrupts', title: 'Interrupts', url: 'https://docs.langchain.com/oss/python/langgraph/interrupts', source: 'LangGraph', language: '英文', type: '官方文档', difficulty: '进阶', stage: '暂停恢复', value: '学习用途：对照人工审批的中断点和恢复输入设计；证据边界：这是 LangGraph 的具体 checkpoint/replay 语义，不可外推为所有 Harness 的通用保证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-langgraph-fault-tolerance', title: 'Fault tolerance', url: 'https://docs.langchain.com/oss/python/langgraph/fault-tolerance', source: 'LangGraph', language: '英文', type: '官方文档', difficulty: '进阶', stage: '失败恢复', value: '学习用途：分析节点故障后的 checkpoint 恢复与 replay；证据边界：这是 LangGraph 的具体 checkpoint/replay 语义，不可外推为所有 Harness 的通用保证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-temporal-execution', title: 'Workflow Execution', url: 'https://docs.temporal.io/workflow-execution', source: 'Temporal', language: '英文', type: '官方文档', difficulty: '进阶', stage: '耐久执行', value: '学习用途：理解耐久 run 与宿主进程生命周期的分离；证据边界：durable 编排不保证所有外部副作用 exactly-once。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-temporal-event', title: 'Workflow Execution Event', url: 'https://docs.temporal.io/workflow-execution/event', source: 'Temporal', language: '英文', type: '官方文档', difficulty: '进阶', stage: '事件历史', value: '学习用途：观察追加事件如何支持重放、审计和诊断；证据边界：durable 编排不保证所有外部副作用 exactly-once。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-temporal-retry', title: 'Retry Policies', url: 'https://docs.temporal.io/encyclopedia/retry-policies', source: 'Temporal', language: '英文', type: '官方文档', difficulty: '进阶', stage: '重试策略', value: '学习用途：比较重试参数和瞬态故障分类；证据边界：durable 编排不保证所有外部副作用 exactly-once。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-azure-durable', title: 'Durable Functions programming model overview', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/durable/programming-model-overview', source: 'Microsoft Learn', language: '英文', type: '官方文档', difficulty: '进阶', stage: '耐久编排', value: '学习用途：比较 orchestrator、activity 和 Agent Runner；证据边界：durable 编排不保证所有外部副作用 exactly-once。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-aws-idempotent', title: 'Making retries safe with idempotent APIs', url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/', source: 'Amazon Builders’ Library', language: '英文', type: '工程文章', difficulty: '进阶', stage: '幂等设计', value: '学习用途：设计幂等请求标识、重复语义与副作用恢复；证据边界：这是厂商工程经验，不是普适定律，需在本系统验证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-aws-timeouts', title: 'Timeouts, retries, and backoff with jitter', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', source: 'Amazon Builders’ Library', language: '英文', type: '工程文章', difficulty: '进阶', stage: '超时与退避', value: '学习用途：组合 timeout、有限重试、退避和 jitter；证据边界：这是厂商工程经验，不是普适定律，需在本系统验证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-sre-cascading', title: 'Addressing Cascading Failures', url: 'https://sre.google/sre-book/addressing-cascading-failures/', source: 'Google SRE', language: '英文', type: '工程书籍', difficulty: '进阶', stage: '故障控制', value: '学习用途：从级联故障分析限流、超时与降级；证据边界：这是厂商工程经验，不是普适定律，需在本系统验证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-sre-overload', title: 'Handling Overload', url: 'https://sre.google/sre-book/handling-overload/', source: 'Google SRE', language: '英文', type: '工程书籍', difficulty: '进阶', stage: '背压', value: '学习用途：设计过载保护、请求拒绝和背压策略；证据边界：这是厂商工程经验，不是普适定律，需在本系统验证。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-gvisor', title: 'What is gVisor?', url: 'https://gvisor.dev/docs/architecture_guide/intro/', source: 'gVisor', language: '英文', type: '官方文档', difficulty: '进阶', stage: 'Sandbox 架构', value: '学习用途：比较容器、用户态内核和虚拟机隔离；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-docker-seccomp', title: 'Seccomp security profiles for Docker', url: 'https://docs.docker.com/engine/security/seccomp/', source: 'Docker', language: '英文', type: '官方文档', difficulty: '进阶', stage: '系统调用隔离', value: '学习用途：理解 seccomp 系统调用限制的配置位置；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-docker-resources', title: 'Resource constraints', url: 'https://docs.docker.com/engine/containers/resource_constraints/', source: 'Docker', language: '英文', type: '官方文档', difficulty: '入门到进阶', stage: '资源预算', value: '学习用途：设计 CPU、内存等代码执行硬上限；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-docker-rootless', title: 'Rootless mode', url: 'https://docs.docker.com/engine/security/rootless/', source: 'Docker', language: '英文', type: '官方文档', difficulty: '进阶', stage: '权限隔离', value: '学习用途：理解 rootless 运行如何缩小宿主权限面；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-firecracker', title: 'Firecracker design', url: 'https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md', source: 'Firecracker', language: '英文', type: 'GitHub 设计文档', difficulty: '深挖', stage: 'MicroVM 隔离', value: '学习用途：评估 microVM 隔离、启动与运维权衡；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-nist-tool-use', title: 'Lessons Learned from a Consortium on Tool Use in Agent Systems', url: 'https://www.nist.gov/news-events/news/2025/08/lessons-learned-consortium-tool-use-agent-systems', source: 'NIST', language: '英文', type: '机构文章', difficulty: '进阶', stage: '工具风险', value: '学习用途：补充 Agent 工具身份、授权与治理检查；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-owasp-agency', title: 'LLM06:2025 Excessive Agency', url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/', source: 'OWASP GenAI', language: '英文', type: '安全指南', difficulty: '进阶', stage: '权限治理', value: '学习用途：检查过度功能、权限和自治风险；证据边界：资料说明机制边界或安全原则，不证明任何具体配置绝对安全。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-agent-learning-hub', title: 'Agent-Learning-Hub', url: 'https://github.com/datawhalechina/Agent-Learning-Hub', source: 'Datawhale', language: '中文', type: 'GitHub 社区课程', difficulty: '入门到进阶', stage: '综合学习', value: '学习用途：作为中文课程与实践的学习导航和演示入口；证据边界：该材料不承担可靠性或安全性结论。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-agentscope-runtime', title: 'AgentScope Runtime', url: 'https://github.com/agentscope-ai/agentscope-runtime', source: 'AgentScope', language: '中英文', type: 'GitHub 开源项目', difficulty: '进阶', stage: '运行时实践', value: '学习用途：作为运行时部署、隔离与状态代码的学习导航和演示；证据边界：该仓库不承担可靠性或安全性结论。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-smolagents-code', title: 'Code agents', url: 'https://huggingface.co/learn/agents-course/zh-CN/unit2/smolagents/code_agents', source: 'Hugging Face', language: '中文', type: '官方课程', difficulty: '入门到进阶', stage: '代码 Agent', value: '学习用途：作为代码 Agent 执行方式的学习导航和演示；证据边界：该课程不承担可靠性或安全性结论。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-hello-agents-framework', title: 'Hello-Agents 第六章：框架开发实践', url: 'https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter6/%E7%AC%AC%E5%85%AD%E7%AB%A0%20%E6%A1%86%E6%9E%B6%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5.md', source: 'Datawhale', language: '中文', type: 'GitHub 社区教材', difficulty: '进阶', stage: '框架实践', value: '学习用途：作为 Runner、工具与上下文抽象的学习导航和演示；证据边界：该教材不承担可靠性或安全性结论。', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-bilibili', title: 'Agent Harness 与运行时工程实践视频', url: 'https://www.bilibili.com/video/BV1HfHgzuEPn/', source: 'Bilibili 创作者', language: '中文', type: '社区视频', difficulty: '入门', stage: '直观补充', value: '学习用途：作为运行时工程的中文学习导航和演示；证据边界：该视频不承担可靠性或安全性结论。', platform: 'Bilibili', verifiedAt: VERIFIED_AT },
  { id: 'res-harness-douyin', title: 'Agent 工程与 Harness 实作短视频', url: 'https://jingxuan.douyin.com/m/video/7646732508339457334', source: '抖音精选创作者', language: '中文', type: '社区视频', difficulty: '入门', stage: '实作补充', value: '学习用途：作为 Agent 实作的中文学习导航和演示；证据边界：该视频不承担可靠性或安全性结论。', platform: '抖音', verifiedAt: VERIFIED_AT },
];

function quiz(prompt, choices, answerIndex, explanation) {
  return { prompt, choices, answerIndex, explanation };
}

function lesson({ order, title, summary, objectives, concepts, explanations, resourceIds, exercise, quizzes, completionCriteria }) {
  const suffix = String(order).padStart(2, '0');
  return {
    id: `harness-${suffix}`,
    moduleId: 'agent-harness',
    order,
    title,
    durationMinutes: 70,
    summary,
    objectives,
    concepts,
    explanations,
    resourceIds,
    exercise,
    quiz: quizzes.map((item, index) => ({ id: `quiz-harness-${suffix}-${index + 1}`, ...item })),
    interviewQuestionIds: [1, 2, 3].map((number) => `iq-harness-${suffix}-${number}`),
    completionCriteria,
  };
}

const lessons = [
  lesson({
    order: 1,
    title: 'Harness 与宿主 Runner',
    summary: '从控制面理解 Harness 如何承载 Agent run，并用可审计的 Runner 生命周期约束模型决策。',
    objectives: ['区分 Agent 的决策职责与 Harness 的执行治理职责', '设计包含明确终态、钩子与运行产物的 Runner 生命周期'],
    concepts: ['Agent Harness', '宿主 Runner', 'Run lifecycle', 'Lifecycle hook', '运行产物'],
    explanations: [
      { heading: 'Agent 决策与宿主治理分层', body: 'Agent 根据目标、状态与观察提出下一步动作；Harness 则负责运行标识、状态持久化、工具执行、权限审批、预算、隔离、日志和终止。把两者分开，才能让模型输出保持建议性质，并由可信宿主在真正改变环境前执行确定性检查。Prompt 和 guardrail 不等于宿主授权，任何高风险能力都必须在执行边界重新验证。', keyPoints: ['模型可以提出动作，但不能自行授予凭证或越过策略', 'Harness 是控制面与运行时，不是另一个更长的 Prompt'] },
      { heading: 'Runner 生命周期必须可观测', body: '一个 run 先从 created 进入 queued，再由 worker 领取为 running；等待人工审批时进入 awaiting_approval，可重试错误等待退避时进入 retry_wait，缺少外部条件时进入 blocked。满足验收证据后转换为 succeeded，不可恢复错误进入 failed，主动停止进入 cancelled，超过整体 deadline 则进入 timed_out。Runner 在关键转换处触发窄而稳定的 hooks，并同步生成事件、checkpoint 与产物引用。', keyPoints: ['十个规范状态都由明确事件和守卫驱动，非法转换必须被拒绝', 'Hook 观察和扩展生命周期，但不得绕过核心校验'] },
    ],
    resourceIds: ['res-harness-openai-running', 'res-harness-temporal-execution', 'res-harness-azure-durable', 'res-harness-agentscope-runtime'],
    exercise: { title: '绘制可执行 run 生命周期', brief: '为一个能读取仓库并运行测试的 Agent 设计 Runner 状态机和生命周期事件。', steps: ['列出正常、等待审批、阻塞、失败与取消路径，并为每次转换写出触发事件和守卫条件', '为 before_model、before_tool、after_tool 与 on_terminal hooks 定义输入、输出、失败处理和审计字段'], deliverable: '一张状态转换表、一份 hook 契约和两条完整运行轨迹。', experiment: 'run-lifecycle' },
    quizzes: [
      quiz('Agent 与 Harness 的核心职责如何划分？', ['Agent 负责所有系统权限，Harness 负责提示词', 'Agent 提议决策，Harness 执行治理与持久化', '两者只是不同框架名称'], 1, 'Agent 面向任务决策，Harness 在可信宿主侧实施权限、执行、状态、预算和审计。'),
      quiz('Runner lifecycle hook 最重要的设计约束是什么？', ['可以跳过主执行路径的校验', '输入输出稳定且不破坏核心状态机不变量', '必须允许任意网络副作用'], 1, 'Hook 应有窄契约和明确失败语义，不能成为绕过权限或状态转换规则的后门。'),
    ],
    completionCriteria: ['能逐项说明 Agent 与 Harness 各自拥有和不拥有的职责', '能让成功、审批、阻塞、失败和取消轨迹通过同一状态机校验'],
  }),
  lesson({
    order: 2,
    title: 'Run State、Event Log 与 Checkpoint',
    summary: '用当前状态、追加事件和恢复快照三种数据结构共同支撑审计、诊断和跨进程恢复。',
    objectives: ['解释 run state、event log 与 checkpoint 的职责和一致性关系', '为恢复点选择保存时机、版本与兼容策略'],
    concepts: ['Run state', 'Append-only event log', 'Checkpoint', 'Replay', 'Schema version'],
    explanations: [
      { heading: '快照、历史与恢复点各司其职', body: 'Run state 是驱动下一步的当前结构化快照；event log 是按顺序追加的事实记录，回答状态怎样变化；checkpoint 是可恢复的状态与控制位置封装，帮助新进程从已提交边界继续。Checkpoint 不等于长期 memory：前者服务一次 run 的耐久恢复，后者涉及跨任务信息选择、保留、检索与治理。', keyPoints: ['State 优化当前决策，event log 优化审计与重建', 'Checkpoint 要带版本、游标和已确认副作用引用'] },
      { heading: '保存频率是风险与成本权衡', body: 'Checkpoint 太少会扩大故障后的重算窗口，太多则增加写放大、延迟和一致性复杂度。实践中应在昂贵模型调用后、外部副作用前后、人工暂停前和终态处设置关键提交点，再按可接受恢复点目标补充周期保存；恢复时先校验 schema、事件游标和依赖资源，而不是盲信旧快照。', keyPoints: ['围绕不可重复成本和副作用边界设置恢复点', '恢复必须处理旧版本、部分提交和损坏快照'] },
    ],
    resourceIds: ['res-harness-openai-run-state', 'res-harness-langgraph-persistence', 'res-harness-temporal-event'],
    exercise: { title: '设计 run 持久化模型', brief: '为长达两小时的资料整理 run 设计状态表、事件表和 checkpoint 记录。', steps: ['定义三类记录的主键、版本、游标、有效载荷和原子提交边界，并标注哪些字段是事实或派生值', '模拟模型完成、工具写入、进程崩溃和 schema 升级，逐步写出恢复读取与兼容检查'], deliverable: '一份数据 schema、四个提交点以及崩溃恢复时序图。' },
    quizzes: [
      quiz('Event log 与 run state 的关系是什么？', ['两者必须保存相同内容', '前者记录变化历史，后者表示当前快照', 'event log 只存模型文本'], 1, '事件日志保留发生过什么，当前状态聚合对下一步有用的最新事实，两者用途不同。'),
      quiz('Checkpoint 应优先放在哪类边界？', ['任意固定字符数之后', '昂贵步骤、外部副作用与暂停终止附近', '只在程序退出时'], 1, '关键边界 checkpoint 能减少昂贵重算，并为副作用去重、审批暂停和终态审计提供依据。'),
    ],
    completionCriteria: ['能用同一条 run 轨迹分别生成 state、event log 和 checkpoint', '能解释 checkpoint 策略的恢复窗口、写入成本与版本风险'],
  }),
  lesson({
    order: 3,
    title: '工具注册、权限与人工审批',
    summary: '把工具能力、身份、策略与审批放入宿主控制面，使每次真实调用都可验证、可审计。',
    objectives: ['设计包含 schema、风险、权限和幂等元数据的工具注册表', '区分认证、授权与人工审批并实现批准后的再次校验'],
    concepts: ['Tool registry', 'Authentication', 'Authorization', 'Human approval', 'TOCTOU'],
    explanations: [
      { heading: '注册表是执行契约而非菜单', body: '工具注册表除名称和描述外，还应记录版本、参数与返回 schema、数据分级、所需 scope、风险等级、副作用、幂等能力、超时和责任团队。模型只能从当次 run 被允许的视图中选工具；宿主接到调用后仍需验证结构、业务约束、调用者身份和资源级权限。Prompt 和 guardrail 不等于宿主授权，文字规则不能替代执行层策略。', keyPoints: ['面向模型的说明与面向宿主的强制策略要分离', '高风险、副作用和可重试性应成为一等元数据'] },
      { heading: '审批是有时效的条件授权', body: '认证回答调用者是谁，授权回答其当前能对目标资源做什么，人工审批回答特定高风险意图是否被人接受。审批应绑定工具版本、规范化参数、资源、身份、策略版本和过期时间；恢复执行时必须再次验证，因为凭证、参数、对象状态或策略可能在等待期间变化，避免批准内容与实际执行内容发生偏移。', keyPoints: ['审批令牌必须绑定不可歧义的调用摘要', '批准后重验身份、权限、参数和资源状态，防止时序竞态'] },
    ],
    resourceIds: ['res-harness-openai-tools', 'res-harness-openai-hitl', 'res-harness-langgraph-interrupts', 'res-harness-nist-tool-use', 'res-harness-owasp-agency'],
    exercise: { title: '构建高风险工具策略', brief: '为退款、只读查询和代码执行三个工具定义注册、校验、授权与审批流程。', steps: ['写出每个工具的版本化 schema、scope、风险、副作用、幂等键、超时和审计字段', '模拟审批等待期间参数、权限与资源变化，设计恢复时的摘要比对和重新验证结果'], deliverable: '三条工具注册记录、一份策略矩阵和审批恢复时序。' },
    quizzes: [
      quiz('人工审批主要补充哪一层控制？', ['证明调用者身份', '对具体高风险意图给予条件许可', '保证工具永不失败'], 1, '审批针对具体意图和风险作人为判断，但认证、授权与运行时校验仍分别不可省略。'),
      quiz('为什么已审批调用恢复时仍要校验？', ['为了让模型重新生成文案', '等待期间身份、参数、资源或策略可能变化', '审批令牌不能保存'], 1, '审批绑定的是特定上下文；恢复时重验可以防止过期授权和批准内容被替换。'),
    ],
    completionCriteria: ['能定义模型可见工具目录与宿主执行注册表的不同字段', '能演示审批前暂停、持久化、恢复重验和拒绝过期令牌'],
  }),
  lesson({
    order: 4,
    title: 'Sandbox、隔离与资源边界',
    summary: '以威胁模型驱动代码执行隔离，并用最小权限与硬资源配额缩小潜在破坏半径。',
    objectives: ['比较进程、容器、用户态内核和 microVM 的隔离边界', '为代码执行 Agent 设计文件、网络、系统调用与资源最小权限'],
    concepts: ['Threat model', 'Container', 'Sandbox', 'Seccomp', 'Resource quota'],
    explanations: [
      { heading: '容器只是隔离机制的一层', body: 'Container 共享宿主内核，主要提供 namespace、cgroup 和权限边界；配置错误、内核漏洞、过宽挂载与高权限运行都会削弱隔离。因此 Container 不等于绝对安全 sandbox。应先明确攻击者能力、资产和逃逸后果，再按风险组合 rootless、只读文件系统、系统调用过滤、网络出口控制、凭证代理、用户态内核或 microVM。', keyPoints: ['隔离强度必须对应威胁模型和逃逸代价', '默认拒绝挂载、网络、设备与特权能力，再按任务开放'] },
      { heading: '资源限制也是安全边界', body: '代码执行不仅可能读写越权，还可能消耗 CPU、内存、磁盘、进程数、文件描述符、网络带宽和墙钟时间。Harness 应在宿主或编排层设置不可由容器内进程提高的硬上限，监控接近阈值的行为，并为超限定义可识别终态和清理流程；仅依赖提示词要求“节省资源”没有强制力。', keyPoints: ['为 CPU、内存、存储、进程、网络和时间分别设硬预算', '终止后清理临时文件、子进程与短期凭证，并保留证据'] },
    ],
    resourceIds: ['res-harness-gvisor', 'res-harness-docker-seccomp', 'res-harness-docker-resources', 'res-harness-docker-rootless', 'res-harness-firecracker', 'res-harness-smolagents-code'],
    exercise: { title: '编写代码 Agent sandbox 配置', brief: '针对不可信仓库测试任务，从威胁模型推导隔离层级与最小权限配置。', steps: ['列出宿主源码、密钥、内网与算力资产，分析恶意代码、依赖脚本和资源耗尽路径', '选择隔离方案并定义只读挂载、临时写区、出口白名单、seccomp、用户身份和六类资源上限'], deliverable: '一份威胁模型、可审查的 sandbox 策略和终止清理清单。' },
    quizzes: [
      quiz('为什么容器不能自动等同安全 sandbox？', ['容器没有文件系统', '共享内核且安全性依赖权限、挂载和运行时配置', '容器无法设置资源限制'], 1, '容器提供重要隔离原语，但共享内核和错误配置仍会留下逃逸或越权路径。'),
      quiz('代码执行最小权限应从哪里开始？', ['给 root 后依赖 Prompt 自律', '基于威胁模型默认拒绝，再开放必要能力', '只限制输出长度'], 1, '先识别资产与攻击路径，再最小化身份、文件、网络、系统调用和资源权限。'),
    ],
    completionCriteria: ['能根据两种不同威胁模型选择并解释隔离方案', '能给出覆盖权限、资源、清理和审计的 sandbox 配置'],
  }),
  lesson({
    order: 5,
    title: 'Budget、Timeout、Retry 与 Cancel',
    summary: '把成本、时间和尝试次数建模为可继承预算，并对超时、重试与取消建立独立语义。',
    objectives: ['区分 timeout、deadline、cancellation 与 rollback', '基于错误分类和剩余预算设计有限重试与退避'],
    concepts: ['Run budget', 'Timeout', 'Deadline', 'Retry policy', 'Cancellation'],
    explanations: [
      { heading: '时间控制不是一个开关', body: 'Timeout 约束单个操作等待多久，deadline 表示整个 run 或调用链最晚完成时刻，cancellation 是向正在执行的组件传播停止意图，rollback 则是业务补偿或事务语义。timeout 不等于 cancel 或 rollback：等待超时后远端动作可能仍在运行或已成功，Harness 必须查询状态、传播取消并按工具契约决定补偿。', keyPoints: ['绝对 deadline 沿调用链传递，子步骤不得重置总时限', '超时结果未知时先确认副作用状态，不能立即盲重试'] },
      { heading: '预算与重试共同限制放大效应', body: '运行预算应覆盖模型调用数、token 或费用、工具调用数、墙钟时间、重试次数和并发槽位，并在父子任务间保守分配。只有明确瞬态且幂等或可安全去重的错误才进入有限重试，采用指数退避与 jitter；参数错误、权限拒绝、业务冲突和预算耗尽通常应修正、阻塞或终止。', keyPoints: ['每次重试都消耗剩余预算并记录原因', '重试策略需防止多层调用各自重试造成乘法放大'] },
    ],
    resourceIds: ['res-harness-temporal-retry', 'res-harness-aws-timeouts', 'res-harness-sre-cascading'],
    exercise: { title: '设计分层运行预算', brief: '为包含检索、生成和写入的 run 分配成本、时间与重试预算。', steps: ['定义全局 deadline、各步骤 timeout、模型和工具配额，并写出父子预算继承及拒绝规则', '把超时、限流、参数错误、权限拒绝和结果未知映射为重试、查询、修正、blocked 或 failed'], deliverable: '一张预算账本、错误决策表和取消传播时序图。' },
    quizzes: [
      quiz('工具调用 timeout 后最安全的第一步通常是什么？', ['立刻用相同参数无限重试', '依据调用标识查询远端状态和副作用', '假定已经 rollback'], 1, '超时只说明等待结束，远端结果可能未知；先查状态可避免重复副作用。'),
      quiz('哪类错误通常不应原样重试？', ['短暂网络抖动', '明确参数校验失败', '带 Retry-After 的限流'], 1, '参数校验错误不会随时间自动消失，应修正调用而不是消耗重试预算。'),
    ],
    completionCriteria: ['能为同一轨迹分别标出 timeout、deadline、cancel 和补偿行为', '能用错误分类与预算证明每一种重试或终止决策'],
  }),
  lesson({
    order: 6,
    title: '幂等副作用与安全 Resume',
    summary: '通过意图记录、幂等键、结果对账和恢复游标，让崩溃后的 run 不会重复关键副作用。',
    objectives: ['为不可重复工具调用设计幂等协议与提交记录', '处理副作用成功而 checkpoint 失败的模糊恢复窗口'],
    concepts: ['Idempotency key', 'Intent record', 'Side-effect ledger', 'Resume', 'At-least-once'],
    explanations: [
      { heading: '恢复前先识别已发生的动作', body: 'Harness 在调用副作用工具前应持久化规范化意图、幂等键和状态 pending，执行后记录远端操作标识与结果，再推进 checkpoint。若进程在远端成功后、checkpoint 前崩溃，恢复器先用幂等键或远端标识查询，再把已发生结果补写到本地，不能因为快照仍在旧位置就再次创建动作。', keyPoints: ['幂等键应绑定业务意图，不能每次重试随机生成', '本地账本需表达 pending、succeeded、failed 和 unknown'] },
      { heading: 'Durable 不承诺所有外部 exactly-once', body: 'durable execution 不等于外部副作用 exactly-once。网络分区和跨系统提交使 Harness 很难同时原子写入自身 checkpoint 与任意外部服务；常见保证是至少一次调度，加上工具幂等、去重、状态查询和必要补偿，使业务效果接近一次。对不支持幂等或查询的工具，应减少自动重试并升级人工处理。', keyPoints: ['区分执行尝试次数与可观察业务效果次数', '明确承诺边界，用对账和补偿处理无法原子提交的系统'] },
    ],
    resourceIds: ['res-harness-langgraph-fault-tolerance', 'res-harness-aws-idempotent', 'res-harness-hello-agents-framework'],
    exercise: { title: '演练崩溃后的安全续跑', brief: '为创建工单工具建立副作用账本，并在五个崩溃位置判断恢复动作。', steps: ['定义意图指纹、幂等键、远端操作 ID、账本状态和 checkpoint 游标的更新协议', '分别模拟调用前、请求中、远端成功后、本地记账后和 checkpoint 后崩溃，选择查询、补写、重试或人工对账'], deliverable: '一张提交时序、五条恢复决策和不重复创建工单的验证记录。', experiment: 'retry-resume' },
    quizzes: [
      quiz('副作用成功但 checkpoint 失败后应怎样恢复？', ['直接生成新幂等键再调用', '先按原幂等键或远端 ID 查询并补写结果', '直接把 run 标记 succeeded'], 1, '旧 checkpoint 不证明副作用未发生；恢复必须先对账，确认后再推进本地状态。'),
      quiz('Durable execution 能直接保证什么？', ['任意外部工具 exactly-once', 'run 状态可跨进程继续，但外部副作用仍需幂等协议', '所有失败自动 rollback'], 1, '耐久执行保护运行控制状态，跨外部系统的一次性业务效果还需幂等、查询和补偿。'),
    ],
    completionCriteria: ['能为未知结果的副作用选择查询、重试、补偿或人工对账', '能清楚陈述 at-least-once 调度与业务幂等效果的保证边界'],
  }),
  lesson({
    order: 7,
    title: '并发、队列与背压',
    summary: '用有界并发和耐久队列承载长任务，并在过载时主动施加背压而非无限堆积。',
    objectives: ['区分并发、并行、吞吐与公平性并选择限并发位置', '设计具备租约、去重、重投递和背压的长任务队列'],
    concepts: ['Concurrency limit', 'Durable queue', 'Lease', 'Backpressure', 'Load shedding'],
    explanations: [
      { heading: '限并发保护共享依赖', body: '并发表示多个 run 在时间上重叠推进，并行表示它们确实同时占用计算资源。即使机器能并行更多任务，模型 API、数据库连接、sandbox 容量和下游限额也可能先饱和。Harness 应按租户、工具和全局设置独立信号量，并把公平性、优先级和每个 run 的子任务上限纳入调度。', keyPoints: ['并发上限依据最紧依赖与错误预算，而非只看 CPU 核数', '限制要分层，避免单个 run 或租户占满所有槽位'] },
      { heading: '队列满是控制信号', body: '长任务进入耐久队列后，由 worker 用租约领取，周期续租并在成功后确认；租约过期会导致重投递，因此处理器仍需幂等。队列深度、等待时间或下游饱和达到阈值时，应暂停生产者、降低接收速率、返回稍后重试、按优先级丢弃或降级，而不是继续无界缓存，这就是背压。', keyPoints: ['队列提供缓冲和耐久，不会消除容量上限', '背压策略必须明确谁等待、谁拒绝、谁降级以及如何观测恢复'] },
    ],
    resourceIds: ['res-harness-sre-overload', 'res-harness-agentscope-runtime'],
    exercise: { title: '调度长任务并处理过载', brief: '为每分钟突发一百个长 run 的服务设计队列、worker 与背压策略。', steps: ['定义消息字段、幂等键、租约、续租、重投递、优先级和按租户并发上限', '在 worker 变慢、队列达到软硬阈值和下游限流时，逐级触发减速、拒绝、降级与恢复'], deliverable: '一份队列协议、容量阈值表和三条过载演练轨迹。', experiment: 'queue-backpressure' },
    quizzes: [
      quiz('为什么队列消费者仍必须幂等？', ['队列永远只投递一次', '租约过期或确认丢失会造成重投递', '幂等只用于同步调用'], 1, '多数耐久队列允许至少一次投递，worker 崩溃或确认丢失都可能产生重复消息。'),
      quiz('队列达到硬容量时合理做法是什么？', ['继续写入无界内存', '按策略拒绝、降级或要求生产者稍后重试', '把并发上限全部移除'], 1, '硬容量代表系统不能安全吸收更多工作，应显式向上游传播背压并保护已接收任务。'),
    ],
    completionCriteria: ['能证明分层并发上限不会让单租户压垮共享依赖', '能在队列重复投递与满载情况下保持任务可恢复且资源有界'],
  }),
  lesson({
    order: 8,
    title: 'Blocked、HITL、Handoff 与运行产物',
    summary: '用精确终态、耐久人工介入和完整 handoff bundle，让未自动完成的 run 仍可被接管。',
    objectives: ['区分 blocked、failed、cancelled 并设计可恢复的人工暂停', '定义可审计、可接管的 handoff bundle 与运行产物'],
    concepts: ['Blocked', 'HITL', 'Handoff bundle', 'Artifact manifest', 'Terminal state'],
    explanations: [
      { heading: '终态表达下一位操作者能做什么', body: 'blocked 表示当前缺少权限、信息、依赖或人工决定，但满足解除条件后仍可继续；failed 表示本次尝试遇到不可恢复错误或已耗尽规定恢复策略；cancelled 表示收到停止意图并完成必要清理。人工审批进入 awaiting_approval，保存审批请求、过期时间和恢复令牌后释放 worker；验收通过才进入 succeeded。', keyPoints: ['状态名必须配套原因码、证据和允许的后续动作', '长时间等待不能占用 worker、锁或短期凭证'] },
      { heading: 'Handoff 要交付可继续工作的上下文', body: 'Handoff bundle 应包含目标与验收标准、当前状态和版本、关键事件摘要、已尝试动作、未决问题、预算余额、审批与权限状态、副作用账本、产物清单、验证结果、敏感信息引用和建议下一步。产物通过稳定 URI、摘要哈希、媒体类型、生成步骤与保留策略引用，避免只交一段模型总结而无法复核。', keyPoints: ['接管者应能从证据重建现状，而非相信“已经处理”', '敏感凭证不直接塞入 bundle，只保存受控引用和访问要求'] },
    ],
    resourceIds: ['res-harness-openai-hitl', 'res-harness-langgraph-interrupts', 'res-harness-nist-tool-use', 'res-harness-agent-learning-hub', 'res-harness-bilibili', 'res-harness-douyin'],
    exercise: { title: '制作可接管 handoff bundle', brief: '把一个等待生产发布审批且已有测试产物的 run 交给下一班工程师。', steps: ['判断应使用 awaiting_approval、blocked、failed 还是 cancelled，并记录原因、解除条件、恢复令牌与清理状态', '整理目标、事件摘要、副作用账本、预算、审批、产物哈希、验证证据和下一步，检查敏感信息处理'], deliverable: '一个可机读 handoff bundle、产物 manifest 和人工接管检查表。' },
    quizzes: [
      quiz('缺少用户提供的生产账号但稍后可继续，应是什么状态？', ['failed', 'blocked', 'succeeded'], 1, '缺少可补充依赖且存在明确解除条件时属于 blocked，不应伪装为失败或完成。'),
      quiz('Handoff bundle 为什么不能只有模型总结？', ['总结文本太短', '缺少可验证状态、事件、副作用与产物引用，接管者无法安全续作', '模型总结不能保存中文'], 1, '安全接管依赖结构化状态、证据和稳定产物引用，叙述性总结只能作为辅助。'),
    ],
    completionCriteria: ['能为暂停、阻塞、失败和取消分别给出原因码及恢复规则', '能让未参与原 run 的工程师仅凭 bundle 校验现状并安全继续'],
  }),
];

const interviewSpecs = [
  [1, 'Agent Harness 与 Agent 本身有什么区别？', '判断标准是能否区分决策面与控制面：Agent 根据目标和观察提出动作，Harness 在可信宿主中负责运行、状态、工具、权限、隔离、预算、审计和终止。', ['模型输出是候选决策，真正副作用必须通过宿主校验与执行。', 'Harness 可以承载不同 Agent 策略，同一 Agent 也可运行在不同治理能力的 Harness 上。'], '把 Harness 当作更长的 system prompt，忽略执行控制和持久化。', '请为代码 Agent 分别列出三项 Agent 职责和三项 Harness 职责。', '高', '基础', ['Agent 开发', '后端工程']],
  [1, '请设计一个 Agent run 的生命周期状态机。', '判断标准是状态、事件和守卫完整：created、queued、running、awaiting_approval、retry_wait、blocked、succeeded、failed、cancelled、timed_out 均有合法入口、终止性质和恢复规则。', ['每次转换应持久化原因、版本和触发者，并用幂等命令避免重复转换。', 'awaiting_approval 与 retry_wait 表达两种不同等待，succeeded 必须绑定验收证据。'], '只画 running 到 succeeded 或 failed 两条线，没有超时、取消、审批和恢复路径。', '审批过期和取消同时发生时如何决定转换顺序？', '高', '进阶', ['Agent 开发', '后端工程']],
  [1, 'Runner 的 lifecycle hooks 应如何设计？', '判断标准是 hook 契约稳定且不破坏状态机：输入包含只读上下文和事件，输出受 schema 限制，超时、失败、重试与顺序都有定义。', ['区分观察型 hook 与能影响决策的策略 hook，后者必须被审计和版本化。', 'Hook 不得直接绕过工具注册、授权或 checkpoint 提交边界。'], '允许插件在任意时刻直接改数据库和执行工具，靠约定保持正确。', '一个 after_tool hook 失败时，工具结果和 run state 应怎样处理？', '中', '深挖', ['Agent 开发', '后端工程']],
  [2, 'Run state、event log、checkpoint 有什么区别？', '判断标准是职责清晰：state 是当前可操作快照，event log 是追加的变化事实，checkpoint 是带控制位置和版本、可供恢复的提交点。', ['事件可重建或审计状态，但重放成本和外部依赖决定是否保留快照。', 'Checkpoint 不等于长期 memory，它只解决特定 run 的耐久恢复。'], '把三者都实现成覆盖写的聊天记录，既无事件顺序也无恢复游标。', '如果 state 与 event log 的最新事件不一致，应以什么规则修复？', '高', '基础', ['Agent 开发', '后端工程']],
  [2, 'Checkpoint 应该多频繁保存？', '判断标准是根据恢复点目标、步骤成本、副作用边界、写入延迟和一致性风险权衡，而不是机械地每轮或只在结束保存。', ['昂贵调用后、外部副作用前后、人工暂停和终态通常是关键保存点。', '还需考虑 schema 版本、压缩、增量快照以及损坏 checkpoint 的回退。'], '认为保存越频繁一定越可靠，完全忽略写放大和部分提交。', '怎样为十分钟模型调用与一毫秒纯计算步骤设置不同策略？', '中', '进阶', ['Agent 开发', '后端工程']],
  [2, '进程重启后怎样安全恢复一个 run？', '判断标准是先获取单一恢复租约，校验 checkpoint 版本与事件游标，再对账 pending 副作用，重建状态并从已提交边界继续。', ['恢复器要拒绝同时续跑同一 run，并为租约过期和 worker 失联设计接管。', '外部资源可能变化，旧 checkpoint 中的权限、批准和依赖必须重新验证。'], '加载最后一条聊天消息后直接再次调用模型，不检查副作用和并发恢复。', '如果最后一个 checkpoint 校验失败但事件日志完整，应怎样降级恢复？', '高', '深挖', ['Agent 开发', '后端工程']],
  [3, '如何设计工具注册表？', '判断标准是同时服务模型发现和宿主治理：记录版本化 schema、返回契约、scope、风险、副作用、幂等、超时、所有者和审计策略。', ['模型只看到当前身份和任务允许的工具子集，避免暴露无权能力。', '注册表更新要版本化，运行中的审批和调用绑定具体版本。'], '只保存函数名和自然语言说明，让模型自行决定参数与权限。', '同名工具升级参数 schema 时，正在暂停的 run 如何恢复？', '高', '进阶', ['Agent 开发', '后端工程']],
  [3, '认证、授权和人工审批分别解决什么？', '判断标准是分别回答“你是谁”“你现在能做什么”“这个具体高风险意图是否获人同意”，三者互补且不能相互替代。', ['授权最好在资源和动作粒度判断，并使用短期最小 scope 凭证。', '审批绑定调用摘要、策略版本、批准者、期限和条件，留下审计证据。'], '用户登录后就认为所有工具调用都已授权且无需审批。', '服务账号代用户调用退款工具时三层控制分别放在哪里？', '高', '基础', ['Agent 开发', 'AI 应用', '后端工程']],
  [3, '为什么审批后还要重新验证工具调用？', '判断标准是审批只对特定上下文有效；等待期间参数、对象状态、身份、权限、工具版本或策略都可能变化，执行前必须重验。', ['用规范化参数摘要和工具版本检测批准内容是否被替换。', '审批过期或资源状态变化时应重新请求、降级或 blocked，不能静默执行。'], '认为人点过一次同意后，同一 run 的任何后续调用都永久可信。', '如何防止审批界面显示的金额与最终执行金额不同？', '高', '深挖', ['Agent 开发', 'AI 应用', '后端工程']],
  [4, 'Container 与 sandbox 是一回事吗？', '判断标准是否定的：容器是一组隔离原语，sandbox 是针对威胁模型形成的整体安全边界，可能组合容器、策略、用户态内核或 microVM。', ['共享内核、过宽挂载、特权模式和网络出口都可能突破预期边界。', '安全结论必须说明攻击者能力、资产、配置与剩余风险，不能只报技术名称。'], '看到 Docker 就宣称代码绝对安全，未检查权限、挂载和逃逸后果。', '什么威胁会促使你从 rootless container 升级到 microVM？', '高', '基础', ['Agent 开发', 'AI 应用', '后端工程']],
  [4, '如何给代码执行 Agent 做最小权限设计？', '判断标准是从任务所需能力反推默认拒绝策略，仅开放临时身份、只读输入、隔离写区、受控系统调用与必要网络目的地。', ['依赖安装常是供应链和网络突破口，应使用镜像、代理、缓存与域名策略。', '凭证通过短期代理注入并限制 scope，任务结束立即撤销和清理。'], '以 root 运行并挂载整个主目录，只在 Prompt 中要求不要访问秘密。', '需要提交 Git 变更时，怎样避免把长期仓库凭证放进 sandbox？', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']],
  [4, 'Sandbox 的资源预算怎么设置？', '判断标准是按任务基线、租户配额和最坏破坏面，分别设置 CPU、内存、磁盘、进程、文件描述符、网络与墙钟硬上限。', ['软阈值用于告警或降级，硬阈值必须由 sandbox 外层强制，容器内不能自行提高。', '超限终止要区分原因，杀掉进程树、清理临时资源并保留诊断产物。'], '只设置模型 token 数就认为代码运行不会耗尽宿主资源。', '怎样通过观测数据调整预算而不让恶意样本抬高默认上限？', '中', '深挖', ['Agent 开发', 'AI 应用', '后端工程']],
  [5, 'Timeout、deadline 和 cancellation 有何区别？', '判断标准是 timeout 限制单次等待，deadline 是绝对最晚时刻，cancellation 是传播停止意图；三者都不自动提供业务 rollback。', ['Timeout 后远端可能继续执行，需查询状态或发送可确认取消。', 'Deadline 应沿调用链递减传播，避免每层重新获得完整超时。'], '把本地 timeout 当成远端已经取消且所有副作用已经回滚。', '下游不支持取消时，Harness 应如何记录和收敛未知状态？', '高', '基础', ['Agent 开发', '后端工程']],
  [5, '哪些错误应该重试？', '判断标准是错误瞬态、操作幂等或可去重、剩余预算充足且重试不会放大故障；否则应修参、阻塞、失败或人工处理。', ['网络抖动、限流和临时不可用可有限退避重试，但要尊重 Retry-After。', '认证失败、参数错误、业务冲突和明确拒绝通常不会靠等待自动恢复。'], '所有异常统一重试三次，包括权限错误和不可幂等写入。', 'HTTP 500 且响应未知时，读操作和扣款操作的策略有何不同？', '高', '进阶', ['Agent 开发', '后端工程']],
  [5, '如何设计运行预算？', '判断标准是把墙钟、deadline、模型次数、token 或费用、工具次数、重试和并发作为可计量、可继承且有硬上限的资源。', ['父任务分配给子任务的预算总和不能无约束超过全局余量。', '预算接近耗尽时应保留生成总结、checkpoint 或 handoff 所需的收尾额度。'], '只设最大循环步数，忽略一步可能触发昂贵模型或长时间工具。', '并行子任务怎样预留和归还未使用预算？', '高', '进阶', ['Agent 开发', '后端工程']],
  [6, '什么是幂等，Agent 为什么特别需要它？', '判断标准是相同业务意图重复提交不会产生额外可观察效果；Agent 会因超时、重启、重投递和不确定决策重复动作，因此尤其需要。', ['幂等键应由稳定业务意图构成，并在服务端保存首次处理结果。', '技术请求相同不一定业务意图相同，键的作用域和过期策略必须明确。'], '认为 GET 才能幂等，或者给每次重试生成新键就拥有幂等性。', '创建订单时如何选择幂等键并处理同键不同参数？', '高', '基础', ['Agent 开发', '后端工程']],
  [6, '副作用成功但 checkpoint 失败，怎样恢复？', '判断标准是把本地状态视为未知，使用原幂等键或远端操作 ID 查询事实，确认成功后补写账本和 checkpoint，再继续后续步骤。', ['调用前的 intent record 让恢复器知道要查询什么，而不是只能猜测。', '远端无法查询且不支持幂等时，应停止自动重试并进入人工对账。'], '旧 checkpoint 没写成功就断定远端操作没有发生，再次直接调用。', '如果查询接口也超时，何时重试查询、何时 handoff？', '高', '深挖', ['Agent 开发', '后端工程']],
  [6, '能否保证 exactly-once 工具执行？', '判断标准是通常不能对任意外部系统作绝对保证；可用至少一次调度加幂等、去重、查询与补偿实现一次业务效果。', ['本地 checkpoint 与外部服务写入缺少共同事务时存在不可消除的模糊窗口。', '应分别说明调用尝试、外部处理和业务效果的保证，而不是笼统承诺 exactly-once。'], '框架带 durable execution 就意味着所有第三方 API 天然 exactly-once。', '在支持事务 outbox 的自有服务中，保证可以提升到什么程度？', '高', '深挖', ['Agent 开发', '后端工程']],
  [7, '并发与并行有什么区别，Agent Harness 为什么要限并发？', '判断标准是并发描述任务重叠推进，并行描述同时执行；Harness 限并发用于保护模型配额、连接池、sandbox 和下游容量并保证公平。', ['并发上限可以按租户、工具和全局分层，动态调整但必须有硬界限。', '更高并发可能降低单任务延迟，却也可能增加排队、限流与级联失败。'], 'CPU 核数很多就取消所有并发限制，忽略外部服务容量。', '如何为共享搜索 API 设置全局与租户两级并发？', '高', '基础', ['Agent 开发', '后端工程']],
  [7, '怎样用队列运行长任务？', '判断标准是消息只保存稳定 run 引用与调度元数据，worker 通过租约领取、续租、checkpoint、确认，并能应对重复投递和失联。', ['队列消息版本化并带幂等键、优先级、租户和入队时间，正文大产物放对象存储。', 'Worker 处理时间超过租约时需续租；崩溃后另一 worker 从 checkpoint 接管。'], '把完整聊天和二进制产物塞进消息，并假设消息只会投递一次。', '任务取消时怎样处理仍在队列、执行中和已完成未确认的消息？', '高', '进阶', ['Agent 开发', '后端工程']],
  [7, '什么是背压，队列满了怎么办？', '判断标准是下游把容量不足信号传回生产者；队列达到阈值时应减速、拒绝、降级、按优先级丢弃或要求稍后重试。', ['软阈值提前限制接收，硬阈值防止内存、存储或等待时间失控。', '策略要区分可丢任务与必须保留任务，并提供 Retry-After 和容量指标。'], '继续无界扩容队列，认为只要不丢消息就没有过载问题。', '怎样为交互请求和离线批处理设置不同背压策略？', '高', '深挖', ['Agent 开发', '后端工程']],
  [8, 'Blocked、failed、cancelled 应如何区分？', '判断标准是 blocked 有明确外部解除条件，failed 表示规定恢复策略已不可用或耗尽，cancelled 表示收到停止意图并完成清理。', ['每个状态都带机器可读原因、证据、是否可恢复和允许的下一步。', '用户取消与系统失败同时出现时，要记录事件顺序和实际副作用状态。'], '把所有未完成 run 都标成 failed，导致等待输入和主动取消无法恢复或统计。', '预算耗尽应单列状态还是 failed，取决于哪些产品语义？', '高', '基础', ['Agent 开发', '后端工程']],
  [8, '如何实现长时间人工审批的 pause/resume？', '判断标准是审批请求持久化后 run 进入 awaiting_approval，释放 worker 和短期资源；回调验证令牌、期限、调用摘要和权限后由新 worker 续跑。', ['审批通知与状态提交需防重复，重复批准不能执行两次副作用。', '恢复时重新获取依赖、凭证和租约，并校验工具及策略版本。'], '让 worker 持有数据库连接和访问令牌阻塞等待几天，收到消息后直接执行。', '审批被拒、过期或修改参数时各自进入什么状态？', '高', '进阶', ['Agent 开发', 'AI 应用', '后端工程']],
  [8, 'Handoff bundle 和运行产物应包含什么？', '判断标准是接管者能验证并继续：bundle 包含目标、状态、事件摘要、尝试、预算、审批、副作用、未决项、产物 manifest 与下一步。', ['产物记录 URI、哈希、媒体类型、生成步骤、验证结果、保留策略和访问级别。', '敏感凭证只保留受控引用和获取条件，不直接复制到 bundle 或日志。'], '只输出一段“已完成大部分工作”的自然语言总结，没有证据和产物引用。', '如何验证 handoff bundle 在跨版本 Runner 中仍可读取？', '高', '进阶', ['Agent 开发', '后端工程']],
];

const interviewQuestions = interviewSpecs.map(([
  lessonNumber,
  question,
  shortAnswer,
  deepDive,
  misconception,
  followUp,
  frequency,
  difficulty,
  roles,
], index) => {
  const lessonSuffix = String(lessonNumber).padStart(2, '0');
  return {
    id: `iq-harness-${lessonSuffix}-${(index % 3) + 1}`,
    lessonId: `harness-${lessonSuffix}`,
    question,
    shortAnswer,
    deepDive,
    misconceptions: [misconception],
    followUps: [followUp],
    frequency,
    difficulty,
    roles,
  };
});

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  return Object.freeze(value);
}

export const agentHarness = deepFreeze({
  id: 'agent-harness',
  title: 'Agent Harness',
  summary: '把 Agent loop 放进可约束、可暂停、可恢复并能安全处理副作用的宿主执行系统。',
  lessons,
  resources,
  interviewQuestions,
});
