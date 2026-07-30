const sections = Object.freeze([
  Object.freeze({
    id: 'separate-memory-from-history',
    title: '先把长期记忆与历史记录分开',
    paragraphs: Object.freeze([
      '长期记忆不是“保存过的聊天”这一宽泛集合，而是跨会话、绑定明确主体与作用域、经过准入并能被更新和删除的信息。Transcript 保存原始消息事件，会话 state 保存当前任务仍然有效的事实与约束，checkpoint 保存一次 run 的恢复位置；只有一部分未来仍有用、允许跨会话使用的内容才可能进入长期记忆。这个区分决定了所有者、保留期限与读取条件：一次对话结束并不意味着其中每句话都获得永久存在和自动投影的资格。',
      'Semantic/profile、episodic、procedural 是应用建模标签。Semantic/profile 用来标记相对稳定的事实或偏好，例如用户明确要求以后默认使用中文；episodic 用来标记带时间与情境的一次经历，例如某次行程或某轮任务采用过哪份资料；procedural 用来标记可复用的流程，例如经审核后保存的一套工作步骤。同一事实会因产品目的而采用不同标签，标签也不证明底层模型具有人类式的语义、情景或程序记忆机制。',
      '设计时先问“下一次什么任务、以谁的身份、在什么 scope 下需要它”，再决定是否建模为长期记忆。一次性行程通常更像有明确有效期的 episode，长期饮食禁忌可能是 profile，但后者仍需用户意图、敏感性与用途审查。若无法说明未来用途、主体、来源和失效方式，正确动作通常是留在 transcript 或当前 state，而不是为了“个性化”先永久保存。',
      '还要把个人记忆与共享 corpus 分开：公共政策、产品手册和团队知识由文档 owner、版本与访问控制治理，不应复制成某个用户的长期记忆；个人记忆只保存经准入、绑定主体并有明确未来用途的跨会话信息。类似 AgentFS 的虚拟文件系统可以承载文件、事件或 provenance，但存储布局本身不定义 semantic、episodic 或 procedural 语义，也不替代准入、作用域和删除策略。',
    ]),
    keyPoints: Object.freeze([
      '长期记忆是经治理的跨会话信息，不等于 transcript、会话 state 或 checkpoint。',
      'Semantic/profile、episodic、procedural 是应用层标签，不是对模型内部认知机制的断言。',
      '分类必须同时说明未来用途、主体、scope、来源和失效条件。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '标签用于产品规则',
      body: '把偏好称为 semantic memory，只是在应用中约定如何保存与召回；它不证明模型参数内部形成了同名的人类式记忆。',
    }),
    sourceIds: Object.freeze([
      'res-context-coala',
      'res-context-langchain-memory',
      'res-context-memgpt',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
    ]),
  }),
  Object.freeze({
    id: 'choose-write-path-and-admission',
    title: '用写入路径与准入策略挡住无界保存',
    paragraphs: Object.freeze([
      '写入有两条常见路径。Hot-path（热路径）是在当前交互中同步决策，例如用户点击“记住”或明确说“以后都用双语”；它需要低延迟，但仍要先完成权限、敏感性、scope 与重复检查。Background（后台路径）是在会话后从候选事件中整理潜在记忆，可做更充分的归并和质量检查，却不能因为不打断用户就降低授权门槛。后台模型提出的是 candidate，不是已批准事实；没有清楚的同意与用途时应 reject 或等待确认。',
      'Admission policy（准入策略）应输出可审计动作，而不是一个模糊概率。输入至少包含 eventId、subject、scope、key/value、显式保存意图、sourceRef/provenance、confidence、sensitivity、observedAt 和建议 TTL；策略再返回 store、reject、no-op 或 supersede 及 reasonCode。Explicit-save 可以证明保存意图，却不能绕过禁止敏感字段、租户边界或不合法用途；系统从行为推断出的 observe 则应采用更高置信度与更短保留期，低置信或敏感观察优先拒绝。',
      'Confidence 表示当前来源对候选内容的支持程度，不等于事实永远正确，也不等于用户同意长期保存。Scope 表示允许在哪个产品、工作区或用途读取，不能用一个含糊的“全局”覆盖所有上下文。Provenance 记录内容来自哪条显式输入、工具结果或已审核事件，使后续纠正能解释旧值为何存在。TTL 则规定何时停止有效召回；永久不是默认值，尤其是一次性、易变或敏感信息。',
      'Salience 只是“这条候选对未来任务是否可能有用”的工作负载相关排序信号，可以帮助后台路径决定先审查哪些 candidate；它不能替代用户同意、敏感性政策或 confidence，也不能把一条有趣但越权的信息变成可保存事实。准入 trace 应分别记录 salience、consent evidence、confidence 和最终 reasonCode，避免一个综合分数吞掉治理边界。',
    ]),
    keyPoints: Object.freeze([
      'Hot-path 与 background 路径都必须经过同一类授权、敏感性和作用域门槛。',
      '准入输出 store、reject、no-op 或 supersede，并保存明确 reasonCode。',
      'Explicit-save、confidence、scope、provenance 与 TTL 分别回答不同治理问题，不能互相替代。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-07-admission-conflict', afterParagraph: 3 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-memorybank',
      'res-context-coala',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
    ]),
  }),
  Object.freeze({
    id: 'model-an-event-ledger',
    title: '把写入建模成事件账本而非覆盖写',
    paragraphs: Object.freeze([
      '长期记忆记录需要稳定 id，并保存 subject、scope、key、value、sourceRef、confidence、sensitivity、observedAt、expiresAt、status、supersededBy 与 deletedAt。事件账本另外记录 eventId、eventType、policyVersion、actor、decision、reason 和发生时间。记录描述当前可评估的事实，事件解释它怎样到达当前状态；两者分开后，调用者既能取得有效值，也能审计为什么被接受、被拒绝或失效。',
      '首次合法候选产生 store；同一 subject、scope、key 与 value 已有仍有效记录时，重复写入产生 no-op，而不是复制一份。低置信观察、禁止敏感级别或越权 scope 产生 reject，且不得留下可召回正文。用户纠正则产生新记录，并让旧记录 status 变为 superseded、supersededBy 指向新 id；这比原地覆盖更能保留来源链，也保证当前投影只有一个有效值。',
      '纠正不是任意改写。目标必须存在、仍有效，并与新事件保持相同 subject、key 和 scope；否则系统应拒绝或走另一个显式迁移流程。新来源、观察时间和置信度属于新记录，不能沿用旧值掩盖变化。这样，当用户问“为什么助理现在使用双语而不是中文”时，系统可以从新记录回到纠正事件，也可以证明旧记录已经被排除，而不是只能展示数据库里最后一次覆盖的结果。',
    ]),
    keyPoints: Object.freeze([
      '稳定记录保存当前生命周期字段，事件账本保存决策、参与者、策略版本和原因。',
      '重复有效值是 no-op，低置信或禁止敏感性是 reject，纠正是带来源链的 supersede。',
      'Supersession 保留历史可解释性，同时阻止旧值继续成为当前投影。',
    ]),
    sourceIds: Object.freeze([
      'res-context-memorybank',
      'res-context-longmemeval',
      'res-context-langchain-memory',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-agentfs',
    ]),
  }),
  Object.freeze({
    id: 'recall-a-bounded-projection',
    title: '召回的是有界投影而不是整库记忆',
    paragraphs: Object.freeze([
      'Recall（召回）先执行治理过滤，再讨论相关性。查询携带当前 authenticated subject、允许的 scope、用途和检索文本；服务只在相同主体与 scope 内寻找候选，随后排除 superseded、deleted、TTL 已到期或策略已撤权的记录。主体或 scope 不匹配的记录甚至不应作为“被排除的候选”暴露给调用者，因为这会泄漏其他用户或租户是否保存过某类信息。权限过滤必须在服务端强制，而不是靠 prompt 提醒模型不要使用。',
      '通过治理门槛后，相关性排序仍不是最终上下文。系统从有效记录产生 memory projection，只暴露本轮需要的 id、key、value 与 sourceRef，并设置数量或 token 预算；完整敏感元数据、内部策略和全库内容留在 store。每次 projection 记录 queryId、memoryId、policyVersion、included/excluded reason 与预算，使工程师能回答“某条旧偏好为何进入了 prompt”以及“另一个 scope 的信息为何没有出现”。',
      '冲突时采用明确优先级：当前轮用户的显式输入高于旧会话 state 和长期记忆投影；相同 scope 中的新有效记录高于其 superseded 前身；公共 corpus 中的最新政策证据负责公共规则，个人记忆不能改写它。长期记忆只是上下文的一种候选来源，不是模型必须服从的最高指令。这个规则既避免陈旧偏好压过当前要求，也让政策与个性化信息各守自己的所有权边界。',
    ]),
    keyPoints: Object.freeze([
      '召回先按 subject、scope、状态、有效期和权限过滤，再进行相关性与预算选择。',
      'Memory projection 只携带本轮必要字段，并记录纳入与排除原因。',
      '当前显式输入优先于旧记忆；个人记忆不能覆盖公共政策证据或系统约束。',
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-longmemeval',
      'res-context-coala',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
    ]),
  }),
  Object.freeze({
    id: 'expire-supersede-and-delete',
    title: '分别证明衰减、过期、更正与删除生效',
    paragraphs: Object.freeze([
      'Relevance decay（相关性衰减）是召回排序策略：记录仍为 active 且仍可被治理门接受，但随着观察变旧或任务相关性下降，它的排序分数可以降低。它不等于 salience 准入分数，也不改变 consent、confidence 或记录状态；更不能代替用户纠正、TTL expiry 或 deletion。图中的 1.00 → 0.65 → 0.20 是合成教学 fixture，用来让同一条记录的降权可见，不是研究或产品给出的通用衰减曲线、阈值或时间常数。生产系统必须按任务、时间敏感性和真实召回评测选择函数，并在 trace 中同时保存原始相关性、age/decay factor、final score 与 policyVersion。',
      'TTL 到期表示记录从该时刻起不再有效召回，它与 supersession 和 delete 是不同原因。Supersession 表示有一个被接受的新值取代旧值，旧记录保留来源链但不再投影；delete 表示主体或策略要求停止使用该记录，即使没有替代值也必须立即阻断本轮及后续 projection。服务应给出 expired、superseded、deleted 等机器可读排除原因，并让索引、缓存和派生投影共享同一失效版本，避免主库状态已变而旁路仍返回旧值。',
      '“已删除”必须写清承诺层级。应用层可以证明外部 memory store 中的记录被标记或移除、检索索引与缓存完成失效、之后的 recall 和 prompt manifest 不再包含该 memoryId；这不等于模型参数已经反学习曾见内容，也不自动证明离线备份已物理擦除。备份保留期、恢复副本、日志脱敏和灾备删除应由另一个明确政策说明，不能用一次 API delete 的成功响应概括。',
      '同样，单次跨 subject/scope 召回没有返回记录，只证明这一调用路径的过滤结果，不足以证明整个租户隔离体系。租户隔离还需要身份解析、授权策略、存储分区、索引命名空间、缓存键、日志访问和运维权限的联合验证。完成标准应收紧为：在指定接口、策略版本与测试范围内，旧记录不再投影且越权查询无信息泄漏；不能把课堂模拟提升为真实隐私存储、备份擦除或全系统隔离证明。',
    ]),
    keyPoints: Object.freeze([
      'Relevance decay 只改变仍有效记录的排序；1.00 → 0.65 → 0.20 是合成教学 fixture，不是普适事实。',
      'Expired、superseded 与 deleted 是三种不同失效原因，都必须阻断召回并留下可审计结果。',
      '外部 store 删除不等于模型参数反学习，也不自动证明备份已物理擦除。',
      '一次主体过滤测试不是租户隔离证明，隔离还涉及授权、分区、索引、缓存、日志与运维边界。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '删除承诺必须可验证',
      body: '可以声称指定服务不再召回某条 memoryId，不能据此声称模型参数、所有备份和所有租户通道都已清除。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-07-decay-delete', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-data',
      'res-context-langchain-memory',
      'res-context-memorybank',
      'res-context-longmemeval',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
    ]),
  }),
  Object.freeze({
    id: 'walk-the-memory-lifecycle-lab',
    title: '完整走过 Memory Lifecycle 实验',
    paragraphs: Object.freeze([
      '实验从 clock=0 的空账本开始，策略把 observe 的最低置信度设为 0.7、禁止 sensitivity=secret，默认 TTL 为空。先提交低置信观察 mem-focus-low：它属于 learner-a/course，但 confidence=0.40，因此策略返回 action=reject，reason 指向 confidence 门槛，账本仍为空。随后提交有效 observe 事件 mem-focus，内容是 focus=RAG citations、confidence=0.88、ttl=3，结果 action=store，并写出 expiresAt。这个对照实际证明 observe 会经过准入，而不是只在概念列表里声称低置信信息应该拒绝。',
      '接着用 explicit-save 保存 mem-language-v1，language=中文、confidence=1、无到期时间，得到 action=store。紧接着提交新 eventId、但 subject、scope、key 与 value 完全相同的重复保存事件；系统发现已有仍有效记录，返回 action=no-op，记录数和原记录 id 均不变化。然后推进逻辑时钟越过 mem-focus 的 expiresAt，advance-time 返回 action=expire，并把 mem-focus 列入 expiredRecordIds；这三步分别验证显式写入、幂等重复和 TTL 失效。',
      '在仍有效的 mem-language-v1 上执行 correct，以 mem-language-v2 把值改成“双语”，结果 action=supersede：v1 进入 superseded records 且 supersededBy 指向 v2，v2 成为 active；随后 delete v2，写入 deletedAt 并得到 action=delete。最后把召回主体改成 learner-b 或把 scope 改成 profile，投影应为空且不泄漏 learner-a 记录；合法主体下也只能看到仍有效记录，并以 superseded、expired、deleted 解释排除项。完整扩展轨迹因此实际覆盖 reject、store、no-op、expire、supersede、delete；逻辑时钟、阈值与事件值只是课堂设置，不证明生产隐私、删除或隔离能力。',
    ]),
    keyPoints: Object.freeze([
      '完整轨迹用低置信 observe 得到 action=reject，用有效写入得到 action=store，用重复有效值得到 action=no-op。',
      '随后推进 TTL、纠正和删除，依次观察 action=expire、action=supersede 与 action=delete 及对应账本状态。',
      '实验同时展示 active、superseded、expired、deleted 账本与 subject/scope 召回结果。',
      '逻辑时钟、阈值与预置数据只用于确定性教学，不能外推为生产隐私或隔离保证。',
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-memorybank',
      'res-context-longmemeval',
      'res-context-primary-javaguide-memory',
    ]),
  }),
  Object.freeze({
    id: 'deliver-and-audit-memory-policy',
    title: '用事件日志、有效表与投影验收设计',
    paragraphs: Object.freeze([
      '练习先建立候选表，至少覆盖显式长期偏好、一次性行程、敏感字段、低置信观察、重复观察和用户纠正。逐项填写 subject、scope、来源、置信度、敏感级别、未来用途、TTL 与意图证据，再让 admission policy 输出 reject、store、no-op 或 supersede。事件日志保留输入摘要、policyVersion、决定与原因；有效记录表按当前时刻列出 active、superseded、expired、deleted 及关联 id，不能只给一张“最终偏好”截图。',
      '接着推进时间并执行删除，从正确主体与 scope、错误主体、错误 scope 三条路径召回。每次记录 queryId、included memoryIds、excluded reasons 与最终 memory projection；检查过期、删除和被取代记录不会进入 prompt，当前显式纠正能够压过旧投影。若越权查询返回空结果，报告应准确写成“本接口在这些测试用例下未投影越权记录”，并附策略版本，而不是宣称系统已经通过完整租户隔离认证。',
      '可执行验收包含四类反证：重复事件不会复制有效值；纠正后旧 id 不再召回且新 id 可回源；到期和删除后对应 id 不再进入 projection；跨主体或 scope 查询不会暴露记录存在性。再补上删除传播清单，分别标记主存储、检索索引、缓存、日志与备份的 owner、完成状态和承诺边界。只有这些证据同时存在，才算满足“准入可解释”和“生命周期在召回时生效”，而不是依赖一句模型总结。',
    ]),
    keyPoints: Object.freeze([
      '交付物包括完整记忆事件日志、按时刻计算的有效记录表和有排除原因的 memory projection。',
      '验收必须覆盖重复、纠正、过期、删除以及跨主体和跨 scope 查询。',
      '删除传播按存储、索引、缓存、日志与备份分别声明 owner 和可证明边界。',
    ]),
    sourceIds: Object.freeze([
      'res-context-longmemeval',
      'res-context-openai-data',
      'res-context-langchain-memory',
      'res-context-memorybank',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-company-brain',
      'res-context-primary-feishu-agentfs',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '只要一条消息曾经出现在 transcript，就应该自动永久写入长期记忆。',
    correction: 'Transcript 是历史事件；长期记忆必须经过意图、用途、敏感性、主体、scope、来源、置信度和 TTL 的独立准入。',
  }),
  Object.freeze({
    claim: 'Semantic、episodic、procedural 这些名称证明模型内部具有人类式记忆模块。',
    correction: '这些是应用建模标签，用于组织保存与召回规则；它们不构成对底层模型认知机制的证据。',
  }),
  Object.freeze({
    claim: '用户明确说“记住”以后，任何字段都可以绕过敏感性和作用域检查永久保存。',
    correction: 'Explicit-save 只证明保存意图，仍需满足合法用途、敏感字段政策、主体权限、scope 和生命周期要求。',
  }),
  Object.freeze({
    claim: '纠正偏好时直接覆盖旧行最简单，反正最终只需要最新值。',
    correction: '原地覆盖会丢失来源和更正原因；应让新记录 supersede 旧记录，并阻止旧 id 继续进入召回投影。',
  }),
  Object.freeze({
    claim: '外部 memory store 返回删除成功，就证明模型参数和所有离线备份都已清除该信息。',
    correction: '应用删除只能按协议证明主存储、索引和缓存不再召回；参数反学习与备份擦除是不同机制和承诺。',
  }),
  Object.freeze({
    claim: '一次 learner-b 查询没有返回 learner-a 记录，就足以证明整个系统租户隔离安全。',
    correction: '该结果只验证一个接口用例；完整隔离还要验证身份授权、存储分区、索引、缓存、日志和运维访问。',
  }),
]);

export const context07Note = Object.freeze({
  readingMinutes: 42,
  overviewVisualId: 'visual-context-07-memory-lifecycle',
  overviewVisualSectionId: 'separate-memory-from-history',
  introduction: '前六课已经把会话状态和外部证据压缩为有来源、预算有界的本轮上下文，但跨会话个性化还引入另一类问题：什么值得保存、谁可以读取、何时失效，以及用户纠正或删除后怎样证明旧值没有再进入 prompt。本章先把长期记忆与 transcript、state、checkpoint 分开，再把 semantic/profile、episodic、procedural 限定为应用建模标签。随后对比 hot-path 与 background 写入，建立包含 explicit-save、confidence、scope、provenance、TTL 的 admission policy，以事件账本实现 reject、store、no-op、supersede、expire 和 delete，并把召回收紧为按主体、作用域、状态与预算生成的 memory projection。最后完整走过 Memory Lifecycle 实验，用事件日志和排除原因验证生命周期，同时明确外部 store 删除不等于参数反学习、备份擦除或完整租户隔离证明。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '长期记忆是经准入和治理的跨会话信息，不是 transcript、会话 state 或 checkpoint 的同义词。',
    'Semantic/profile、episodic、procedural 是应用标签，分类取决于产品用途而非模型内部机制断言。',
    'Hot-path 与 background 都要检查保存意图、敏感性、subject、scope、provenance、confidence 和 TTL。',
    '事件账本用 store、reject、no-op、supersede、expire 与 delete 保存每次决定及原因。',
    '召回先做主体、作用域、状态和有效期过滤，再按相关性与预算形成最小 memory projection。',
    '当前显式输入高于旧记忆投影，个人偏好也不能覆盖公共政策证据与系统约束。',
    'Relevance decay 只降低仍有效记录的排序；TTL 过期、被取代和删除必须分别记录，并确保索引、缓存和投影不再返回失效记录。',
    '1.00 → 0.65 → 0.20 是合成教学 fixture，不是通用记忆规律或产品阈值。',
    '外部 store 删除不证明参数反学习或备份擦除，单次过滤测试也不证明完整租户隔离。',
    'Memory Lifecycle 扩展轨迹实际产生 reject、store、no-op、expire、supersede 和 delete，并支持 subject/scope 反证。',
    '完成练习需要记忆事件日志、有效记录表、带排除原因的投影和分层删除传播清单。',
  ]),
  nextStep: '掌握长期记忆生命周期后，下一课不再单看一个 memory store，而是把版本化 corpus、检索候选、过滤、重排、evidence packet、会话 state 与 memory projection 汇入同一个企业政策助理。重点将从“某条记忆是否有效”扩展为“信息在哪一层消失或被曲解”：每一层都要留下输入输出 ID、版本、owner 和排除原因，并用分层反证区分未摄取、旧版本、漏召、误过滤、打包丢失、错误记忆与不忠实生成。',
});
