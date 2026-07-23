const sections = Object.freeze([
  Object.freeze({
    id: 'five-information-objects',
    title: '先把五类信息对象分开',
    paragraphs: Object.freeze([
      '学习 Agent 状态、检索和记忆之后，一个常见错觉是“只要信息被系统保存，模型就能随时看见”。本章先拆掉这个错觉。本课程把信息分成 prompt context、conversation state、retrieval corpus、checkpoint 与 long-term memory 五类。这个五层划分是课程为了工程分析建立的应用模型，不是某篇论文、某个 SDK 或行业组织发布的统一标准；它的价值在于迫使设计者回答作用域、生命周期、所有者和投影方式，而不是用“记忆”一词掩盖差异。',
      'Prompt context 是一次模型调用真正可见的输入，包括本轮指令、当前请求以及被选中的状态、证据和记忆投影。Conversation state 是当前会话仍然有效的消息、事实、约束和未决项，它可以比单次输入更完整。Retrieval corpus 是跨调用保存并可检索的源文档集合；模型不会因为文档已经入库或建立向量索引就自动读取它。三者的关键差别不是数据库类型，而是“信息是否已被选择进入这一次调用”。',
      'Checkpoint 保存特定 run 的控制位置和恢复所需信息，例如已完成步骤、游标或待处理动作；它服务运行恢复，不等于用户长期记忆，也不应默认进入 prompt。Long-term memory 则保存跨会话且经过准入策略的信息，例如用户明确要求保留的稳定偏好。它同样只是后端记录，召回后还要校验主体、作用域、时效和相关性，才能形成本轮投影。因而“持久化”只能说明保存寿命，不能说明用途，更不能说明模型可见性。',
    ]),
    keyPoints: Object.freeze([
      '五层是课程应用模型，用作用域、生命周期、所有者和投影关系澄清职责，不是外部来源的统一标准。',
      'Checkpoint 服务 run 恢复，长期记忆服务跨会话信息；二者持久化目的不同。',
      'Corpus、state 和 memory 都不会因存在于后端而自动进入 prompt context。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '仓库不是书桌',
      body: '后端存储像仓库，prompt context 像这一刻摊在书桌上的材料。类比只说明“保存”和“当前可见”不同；真实系统仍要记录来源、版本、权限和选择策略。',
    }),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
    ]),
  }),
  Object.freeze({
    id: 'scope-lifecycle-ownership',
    title: '用作用域与生命周期判定归属',
    paragraphs: Object.freeze([
      '面对一条信息时，先不要问“放哪个数据库”，而要连续问四个问题。第一，它属于哪一个主体和范围：当前调用、当前会话、某次 run、某个用户，还是共享语料？第二，它在什么时候产生，又在什么时候失效？第三，谁有权更新、纠正或删除？第四，模型在什么条件下需要看见它？这四问把存储实现推迟到语义边界之后，能避免把运行游标、公共手册和用户偏好混进同一个所谓 memory store。',
      '例如系统指令“不得泄露密钥”是每次调用都需要的 required context；用户在本轮说“只看中文资料”先进入 conversation state，并在本轮投影；员工手册属于 corpus，只有相关版本和段落经过检索后才投影；某工具已经执行到第三步属于 checkpoint，恢复控制器需要它，但回答用户通常不需要；用户明确要求跨会话保留的称呼偏好才可能进入长期记忆。即使这些对象都保存在同一数据库中，语义层仍然必须分开。',
      '生命周期还决定错误的严重程度。把旧 corpus 版本投影进来会产生陈旧证据；把已被纠正的 state 当当前事实会制造冲突；把 checkpoint 文本塞给模型可能暴露内部控制信息；把一次性敏感内容永久记忆则扩大隐私风险。相反，过早删除 transcript 或旧版本也会破坏审计。正确做法不是追求单一保留时长，而是让每层拥有明确的有效状态、失效传播和可回取路径。',
    ]),
    keyPoints: Object.freeze([
      '先定义主体、范围、寿命、更新权和可见条件，再选择存储介质。',
      '同一数据库可以承载不同对象，但不能因此抹平它们的语义与治理边界。',
      '失效、纠正、删除和审计要求随信息层不同而变化。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
    ]),
  }),
  Object.freeze({
    id: 'projection-pipeline',
    title: '理解从后端对象到本轮输入的投影',
    paragraphs: Object.freeze([
      'Projection（投影）是从较完整的后端对象中选择本轮需要的最小表示，再把它放入 prompt context 的过程。它不是简单拼接。对 conversation state，投影可能只取当前有效约束、最近事实和未决承诺；对 corpus，投影通常经过解析、版本选择、chunk、索引、查询召回、过滤、重排和预算打包；对长期记忆，投影还要检查主体、作用域、有效期与当前请求是否相关。原始 corpus 和 raw checkpoint 默认不投影，因为它们的用途与风险都不同。',
      '每次投影至少应保留可追溯关系。一个检索 chunk 需要能指向 documentId、version 和 source span；一个状态事实需要能指向产生或纠正它的消息；一条长期记忆需要有主体、准入原因和有效状态。这样，模型回答中的数字出错时，工程师可以沿着 prompt 条目回到选择结果，再回到源版本，而不是只看最终拼接字符串猜测问题发生在哪一层。',
      '投影也包含明确排除。过期、被 supersede、权限不匹配或与任务无关的信息应记录 excluded reason；raw corpus 和 checkpoint 被排除时，应说明 not-projectable，而不是让它们悄悄消失。显式排除看似增加日志量，实则让“模型为什么没看到某条信息”成为可回答问题。上下文工程因此不仅管理 included 项，也管理没有进入输入的候选及其原因。',
    ]),
    keyPoints: Object.freeze([
      '投影是带策略的选择与变换，不是把所有持久化内容拼进输入。',
      '每个投影项都要保留到后端对象、源版本或来源事件的追踪关系。',
      'Excluded reason 与 included manifest 同等重要，它们共同支持诊断。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
    ]),
  }),
  Object.freeze({
    id: 'position-and-long-context',
    title: '长窗口仍然需要选择与排序',
    paragraphs: Object.freeze([
      '模型声明支持更长 context window，只表示输入容量上限提高，不表示窗口内每个位置的信息都能被同等、稳定地利用。Lost in the Middle 在多文档问答和 key-value retrieval 的受控实验中改变相关信息位置，观察到所测模型的表现经常在开头或末尾较好、在中间下降；论文也报告开放域问答案例中，reader 的收益会早于 retriever recall 饱和。这些结果提醒我们评估位置和噪声，而不是把“装得下”等同于“用得好”。',
      '这项研究的边界必须同时保留。它测试的是特定年代的模型、任务、长度和输入构造，不能推出所有新模型、所有业务都存在完全相同的 U 型曲线，也不能直接给出通用排序公式。工程上可以据此提出可检验假设：硬约束是否应放在稳定位置，相关证据是否应按任务排序，无关或重复材料是否在干扰回答；随后要用自己的查询集、模型版本和上下文构造做受控比较。',
      '因此，五层模型中的 projection 不是为了人为限制模型能力，而是为了提高有效信息密度并保留诊断性。扩大窗口后仍要问：哪些内容必需、哪些可以检索、哪些已经失效、哪些相互重复、哪些位置变化会影响结果。真正的上下文质量指标应同时观察任务结果、来源覆盖、排除原因、成本和位置敏感性，而不只是 token 使用率。',
    ]),
    keyPoints: Object.freeze([
      '窗口容量是可接收输入的上限，不是信息利用质量保证。',
      'Lost in the Middle 支持位置敏感性的风险提示，但结论不能跨模型与任务无条件外推。',
      '选择、排序和受控评测在长窗口模型中仍然必要。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '不要把论文曲线写成产品定律',
      body: '可复用的结论是“位置与额外上下文价值需要测量”，不是“所有模型永远把关键证据放开头就最好”。',
    }),
    sourceIds: Object.freeze([
      'res-context-lost-middle',
      'res-context-anthropic-engineering',
    ]),
  }),
  Object.freeze({
    id: 'context-manifest',
    title: '把上下文写成可审计的 manifest',
    paragraphs: Object.freeze([
      'Context manifest 是本课程为每次组装定义的临时清单，也是课程工程模型而非外部标准。每个 included 条目应记录稳定 id、origin layer、projection type、token cost、sourceRef，以及必要时的 document version、span、选择原因和排序信息。清单还要汇总 input budget、used、remaining 与策略版本。它回答“这一次模型究竟看见了什么”，避免后端拥有的信息与调用输入被混为一谈。',
      'Excluded 清单则记录候选为什么没有进入调用。常见原因包括 not-projectable、expired、superseded、权限或范围不匹配，以及 budget-exceeded。若 required 项装不下，manifest 还要显式标为不可组装，而不是把硬约束截短后继续调用。这里的字段和原因码属于课程为了实验和评审建立的契约，厂商文章与公开指南只能支持选择、压缩和可观测性等一般方向，不能被说成发布了完全相同的 manifest schema。',
      '审计 manifest 时可以做三条逆向检查。第一，任一 included 项能否回到真实来源？第二，任一 excluded 项能否解释为何被排除以及如何重新纳入？第三，模型回答错误时，能否区分源不存在、投影没选中、位置干扰和生成未忠实使用证据？如果只能看到最终 prompt 文本而无法回答这些问题，系统仍停留在不可观测的字符串拼接阶段。',
    ]),
    keyPoints: Object.freeze([
      'Manifest 同时记录 included、excluded、预算和策略，是课程定义的审计契约。',
      '来源层、投影类型、token 成本和 sourceRef 是最小可追溯字段。',
      '字段可观测性让缺失、陈旧、排除和生成错误能够分层定位。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
    ]),
  }),
  Object.freeze({
    id: 'classification-worked-example',
    title: '完成五层地图与 Context Router 预演',
    paragraphs: Object.freeze([
      '以企业政策助理为例，先分类五项材料。系统安全规则属于 required prompt context；用户本轮要求“只比较 2026 版差旅政策”进入 conversation state，并投影为当前约束；2024 与 2026 版政策原文属于 corpus，检索时只选择有效版本和相关 span；流程执行到“等待财务工具结果”的游标属于 checkpoint，不直接展示给模型；用户明确要求长期保存的语言偏好可以成为 long-term memory 候选，但仍要经过准入与作用域检查。分类表应为每项写出所有者、寿命、来源和可否直接投影。',
      '接着为本轮构造 manifest。系统规则和当前请求标为 required；当前状态、检索到的 2026 版证据与有效语言偏好是候选投影；旧版政策因 superseded 排除，raw corpus 与 raw checkpoint 因 not-projectable 排除。每个 included 项写 token cost 和 sourceRef，每个 excluded 项写明确原因。此时你既能看到模型输入，也能证明为什么旧版和游标没有出现。',
      'Context Router 实验在下一课正式操作，但本章可以先理解它的边界：实验只对固定教学条目应用 recent-first 或 evidence-first 排序，扣除输出预留后装入预算，并展示 included、excluded、remaining 与 unassemblable。它不连接真实敏感数据，也不证明某种排序普遍最好。你的五层地图和 manifest 若能被这套流程表达，便说明已经从“所有东西都是记忆”过渡到“每层对象经条件投影进入调用”的工程模型。',
    ]),
    keyPoints: Object.freeze([
      '分类练习先判断语义层，再写生命周期、所有者、来源和投影条件。',
      '旧版本、raw corpus 与 checkpoint 的排除必须有可复查原因。',
      'Context Router 是确定性教学模拟，用来观察投影与 manifest，不是生产优化结论。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '自检问题',
      body: '任取一个条目，依次回答“它存在哪里、当前是否有效、为何本轮需要、如何进入 prompt、若不进入原因是什么”。五问都能回答，分类才算完成。',
    }),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-lost-middle',
      'res-context-practical-guide',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '只要数据被持久化，它就已经成为模型的长期记忆并会自动参与回答。',
    correction: '持久化只描述保存寿命。State、corpus、checkpoint 和长期记忆都要经过各自的选择、校验与投影，模型才能在一次调用中看见。',
  }),
  Object.freeze({
    claim: 'Checkpoint 是长期记忆的一种，因为两者都能跨进程保存。',
    correction: 'Checkpoint 保存 run 的恢复位置与控制证据；长期记忆保存跨会话且经治理的信息。二者用途、所有者和默认可见性都不同。',
  }),
  Object.freeze({
    claim: '建立向量索引以后，corpus 中所有原文都已经进入模型上下文。',
    correction: '索引只是帮助检索候选。只有经过查询、过滤、选择、预算打包并形成投影的证据才进入 prompt context。',
  }),
  Object.freeze({
    claim: '上下文窗口足够长时，不再需要检索、排序或排除信息。',
    correction: '容量不等于利用质量。位置、重复、冲突和无关内容仍可能影响结果，应在目标模型和任务上做受控评测。',
  }),
  Object.freeze({
    claim: '五层对象和 manifest 字段是 Lost in the Middle 或 Anthropic 发布的统一标准。',
    correction: '外部来源支持长上下文风险和上下文选择等部分原则；精确五层与 manifest schema 是本课程的应用模型，必须明确标注。',
  }),
]);

export const context01Note = Object.freeze({
  readingMinutes: 35,
  introduction: '你已经接触过 prompt、会话历史、向量库和 Agent 状态，但若把它们统称为“模型记忆”，系统就无法解释某条信息为何被保存、为何本轮可见、又为何在纠正或恢复后失效。本章建立一套明确标注为课程模型的五层信息地图：prompt context、conversation state、retrieval corpus、checkpoint 与 long-term memory。我们将用作用域和生命周期区分它们，用 projection 解释后端对象如何进入一次调用，再结合长上下文位置效应、context manifest 与 Context Router 教学流程，把“信息很多”转化为“来源清楚、选择有因、排除可查”的工程设计。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '五层划分是课程应用模型，不是论文、SDK 或行业统一标准。',
    'Prompt context 是本轮真正可见的输入，其余层必须经过策略投影才可能进入。',
    'Conversation state 表示当前会话有效信息，corpus 表示可检索源文档，checkpoint 表示 run 恢复位置，长期记忆表示经准入的跨会话信息。',
    '持久化不等于模型可见，数据库相同也不等于对象语义相同。',
    'Projection 要保留来源、版本、span、选择原因和排除原因。',
    '长窗口容量不是稳定利用保证，位置、噪声和重复仍需在目标任务上评测。',
    'Context manifest 同时记录 included 与 excluded，使一次调用可以审计和诊断。',
    'Context Router 只模拟固定教学条目的排序和投影，不能外推为生产最优策略。',
  ]),
  nextStep: '下一课将把本章的 manifest 放进明确预算：从总窗口扣除输出预留，先纳入 required 指令和当前请求，再按 priority 与稳定排序选择状态、证据和记忆。你会区分普通预算不足与 required 自身超限，并看到为什么 compaction 只能作为受版本约束的产品能力，不能被当成可读、无损且可替代 transcript 的摘要。',
});
