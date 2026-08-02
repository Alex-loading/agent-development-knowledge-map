const sections = Object.freeze([
  Object.freeze({
    id: 'three-conversation-representations',
    title: '先分清 transcript、state 与 summary',
    paragraphs: Object.freeze([
      '长会话不能只保留一串越来越长的消息，也不能只保留一段不断重写的摘要。本课程区分三种表示。Canonical events 是按发生顺序保存的用户、助手、工具和系统事实；rendered transcript 是从这些事件投影出的可读视图，可能隐藏内部字段或裁剪工具结果；canonical conversation state 则归并当前有效的事实、约束、未决承诺、失败和不确定项。Summary 是为了降低阅读和 token 成本生成的有损叙述。',
      '“Canonical”在这里不表示行业标准、数据库绝对真相或某个框架的官方对象；它只表示应用在明确规则下选出的当前有效表示。原始 transcript 可能同时包含旧地址和新地址，canonical state 应指出哪一个当前有效、为何有效以及来源消息；summary 可以写“用户后来更新了地址”，但可能省略时间、否定词或精确措辞。三者分别服务取证、当前决策和压缩阅读，不能互相冒充。',
      'LangGraph 的线程级状态、跨会话 store 和 namespace 提供了一种框架实现参照，CoALA 则从认知架构角度区分 working memory 与长期 semantic、episodic、procedural memory。它们可以帮助理解“当前状态”和“长期存储”承担不同职责，却没有发布本课程的 canonical state schema、supersession 规则或来源映射字段。课程模型因此必须明确标注，并由应用自己的事件和测试来证明。',
    ]),
    keyPoints: Object.freeze([
      'Transcript 保存原始事件，canonical state 表示当前可操作信息，summary 是有损派生叙述。',
      'Canonical state 是课程应用模型，不是框架或学术论文规定的统一标准。',
      '三种表示职责不同，不能用一份摘要同时承担取证、当前决策和完整历史。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '录像、案件状态与案情摘要',
      body: 'Transcript 像原始录像，canonical state 像按规则整理的当前案件状态，summary 像方便阅读的案情梗概。类比只解释职责；真实数据仍要以消息 ID、时间、来源和状态规则为准。',
    }),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-coala',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-prompt-memory',
    ]),
  }),
  Object.freeze({
    id: 'canonical-state-schema',
    title: '让规范状态保留来源与不确定性',
    paragraphs: Object.freeze([
      '一条 canonical fact 至少需要稳定 id、subject、field、value、status、source message、observedAt 和适用 scope。若值来自推断而非用户明确声明，还应记录 provenance 和 confidence，并采用更严格的使用门槛。约束要区分硬约束与偏好；未决项要记录 owner、下一动作和截止条件；工具失败要保留 callId、错误类别与是否重试。字段细节是课程应用契约，不能归因于 LangGraph、CoALA 或 OpenAI 文档。',
      'Source mapping 是从状态条目回到 transcript 事件的映射。它可以是一对一，例如“语言偏好=中文”直接来自某条用户消息；也可以是多对一，例如“行程日期仍未确认”由多个消息和一次失败工具调用共同决定。映射不应只保存自然语言说明，还要保存稳定消息 ID、事件时间和必要的原文 span，这样摘要遗漏或状态冲突时，系统可以回取证据而不是猜测。',
      '状态还必须允许“不知道”。当两个来源冲突且没有明确优先规则时，canonical state 不应随机选一个值，而应把 conflict 标为 unresolved，保留候选、来源与所需澄清。若用户当前显式输入与旧状态或长期记忆冲突，当前输入通常拥有更高决策优先级，但是否写回长期记忆仍取决于准入策略。把不确定性显式化，能防止模型把暂定值包装成确定事实。',
      '规范状态本身也应版本化。每次归并记录基于哪一段 transcript、使用哪一版规则、产生了哪些新增、替代或冲突条目；读取者要么取得一个完整快照，要么按事件顺序重建，不能在更新一半时看到混合状态。版本化不是为了把所有历史重复保存，而是让“当前值为何变化”可以重放，并让摘要或记忆投影明确绑定某一状态版本。若归并器规则升级，应以历史样本回放新旧版本并比较 active、superseded 与 unresolved 条目；差异未经审核前，不应让新规则静默重写所有当前值。',
    ]),
    keyPoints: Object.freeze([
      '规范状态要记录主体、字段、值、状态、来源、时间和适用范围。',
      'Source mapping 必须能从当前值回到 transcript 消息或工具事件。',
      '无决胜依据的冲突应保持 unresolved，而不是被覆盖写隐藏。',
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-coala',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-prompt-memory',
    ]),
  }),
  Object.freeze({
    id: 'summary-is-lossy',
    title: '把 summary 明确当作有损派生物',
    paragraphs: Object.freeze([
      'Summary 的任务是用较短文本保留连续叙事中对后续有用的部分，因此它必然做选择。否定、例外、时间顺序、精确数字、谁说过什么以及工具是否真正成功，都可能在压缩中丢失。把 summary 标成“有损”不是贬低它，而是防止读者把语言流畅误认成证据完整。摘要应带生成版本、覆盖的 transcript 范围、来源指针和已知遗漏类别，并允许在高风险判断前回取原文。',
      '安全压缩可按顺序进行：先把 canonical event 游标写入 summary checkpoint，再从事件中提取硬约束、当前事实、纠正链、未决承诺、工具失败和不确定项；接着生成便于阅读的 summary；最后比较压缩前后是否遗漏否定条件、数字、期限和来源。对法律措辞、授权语句或用户纠正等必须逐字核验的内容，应保留原文 span 或结构化字段，而不是只留下转述。',
      'OpenAI compaction 是当前产品用于压缩和续接长会话的接口能力，具体语义会随产品版本变化。其 opaque compaction item 不是供应用阅读和编辑的普通 summary，也不能被宣称无损或可逆。应用若需要来源映射、纠正链和审计，仍要维护自己的 transcript 与 canonical state。产品状态可以帮助续接，却不替应用定义事实真值。',
      'Micro-compaction 与 tool-result elision 可以只替换单条巨大工具结果：事件账本保留 callId、结果哈希、来源 URI、权限和回取指针，活动 transcript 只显示短摘要。它比整段会话重写影响范围小，却仍可能删掉错误码、单位或否定条件；回取失败时必须显式标为 unavailable，不能让模型把摘要补成原文。Summary checkpoint 因而只是带事件游标的可重建派生视图，不是新的事实源。',
    ]),
    keyPoints: Object.freeze([
      'Summary 为降低成本而选择信息，必须按有损派生物治理。',
      '高风险事实要保留结构化状态或 transcript span，不能只依赖流畅转述。',
      'Opaque compaction item 不等于可读、无损、可替代 transcript 的摘要。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '流畅不等于完整',
      body: '摘要读起来越自然，越容易让人忽略它删除了哪些限定词。评审时要问“省略了什么、如何回取”，而不只问“是否通顺”。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-03-compaction-loss', afterParagraph: 3 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-openai-compaction',
      'res-context-langchain-memory',
      'res-context-primary-feishu-microcompact',
      'res-context-primary-feishu-prompt-memory',
    ]),
  }),
  Object.freeze({
    id: 'sliding-summary-retrieval',
    title: '组合滑窗、摘要与 retrieval',
    paragraphs: Object.freeze([
      'Sliding window（滑窗）保留最近若干消息的原始措辞，适合时间局部性强、需要理解刚刚发生内容的任务；它会自然丢掉较早历史。Summary 压缩较长的连续叙事，适合保持任务脉络，却可能丢失细节。Retrieval 根据当前查询从 transcript、事件或长期存储中找回远处材料，适合精确回取，但结果受索引、查询和候选选择影响。三者不是相互排斥的替代品。',
      '一个稳健组合可以是：当前轮和最近消息保留在滑窗中；canonical state 单独保存当前事实、约束和未决项；较早会话生成带覆盖范围的有损摘要；完整 transcript 仍作为审计底座并可被 retrieval 回取。当用户问“上个月我明确拒绝了哪项条款”时，摘要用于定位主题，retrieval 找回原始消息，最终回答引用 transcript span，而不是把摘要转述当作逐字证据。',
      '组合策略也要保留边界。LangGraph 的 short-term 与 long-term memory 文档说明一种框架如何组织线程状态和跨线程 store，但不保证任意摘要、检索器或 namespace 配置都满足业务正确性。OpenAI 的数据控制文档描述其 API 数据存储与保留选项，账户、端点、地区和时间条件会变化；这些产品政策不能替代应用对 transcript、备份、索引和长期记忆删除传播的责任。',
    ]),
    keyPoints: Object.freeze([
      '滑窗保留最近原话，summary 保留压缩脉络，retrieval 按需回取远处细节。',
      '三者应围绕 canonical state 与完整 transcript 组合，而不是互相宣称无损替代。',
      '框架状态和供应商数据政策都不能替代应用自己的正确性与生命周期治理。',
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-openai-data',
      'res-context-openai-compaction',
      'res-context-primary-feishu-microcompact',
    ]),
  }),
  Object.freeze({
    id: 'supersession-and-conflict',
    title: '用 supersession 表达纠正而不是抹除历史',
    paragraphs: Object.freeze([
      'Supersession 是用新记录声明旧记录不再是当前有效值，同时保留二者来源的关系。假设用户先说“默认出发城市是上海”，后来明确说“以后改成杭州，上海那条不要再用”。系统不应删除第一条 transcript，也不应让新旧值同时保持 active。它应创建杭州记录，使用 supersedes 指向上海记录，把上海状态改为 superseded，并让后续 state、summary 和 memory projection 只采用杭州。',
      '纠正与冲突不同。纠正包含明确的替代语义，能够确定当前值；冲突只是多个来源不一致，尚未有可靠决胜规则。例如工具返回“会议在周二”，用户消息写“会议在周三”，若无法确认哪个更新，就应保存两个候选并标记 unresolved。决胜规则可以考虑来源权威、事件时间、用户当前显式输入和任务语义，但规则必须可见，不能依赖数组最后一项碰巧覆盖前一项。',
      '来源映射让更正链可以审计：current value 指向新消息，superseded value 仍指向旧消息，两者保留 observedAt 和变更原因。生成摘要时可写“用户将默认出发地由上海改为杭州”，并附双方消息 ID；检索旧 transcript 时也要尊重状态，不得把上海重新投影为当前偏好。更新当前状态不等于永久删除历史，删除历史也不等于正确完成纠正。',
    ]),
    keyPoints: Object.freeze([
      'Supersession 保留旧记录和来源，但阻止旧值继续作为当前事实投影。',
      '明确替代是纠正；无决胜依据的不一致是 unresolved conflict。',
      '决胜规则和变更原因必须可见，不能依赖最后写入覆盖一切。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '“上海改杭州”完整链路',
      body: 'Transcript 保留两条原话；state 以杭州为 active、上海为 superseded；summary 描述更改；source mapping 连接两个消息 ID；后续投影只发送杭州。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-03-recoverability-chain', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-coala',
      'res-context-primary-javaguide-memory',
      'res-context-primary-feishu-prompt-memory',
    ]),
  }),
  Object.freeze({
    id: 'compression-deliverable',
    title: '完成含纠正会话的三份交付物',
    paragraphs: Object.freeze([
      '设想一段旅行助理会话：用户最初说偏好早班机，随后改为“不要早于十点”；工具第一次订票失败，系统承诺稍后重试；用户又提供两个互相冲突的日期，并明确要求不要永久保存证件号码。第一份交付物 canonical state 应分别记录当前时间约束、未决日期 conflict、失败工具调用与待重试承诺，并把敏感号码标为不进入长期记忆。早班偏好保留来源但状态为 superseded。',
      '第二份交付物是有损 summary。它可以简洁说明“用户将航班时间偏好改为十点以后，日期仍待确认，首次订票失败且需要重试”，同时标注这是覆盖某段 transcript 的派生摘要，不包含证件号码，也不把工具失败写成订票成功。摘要后附回取指针，使审核者可以找到纠正消息、冲突日期和 callId。若没有这些指针，summary 不能独自承担审计。',
      '第三份交付物 source mapping 表把每个 canonical 条目映射到消息或工具事件：当前航班时间约束映射到纠正消息，superseded 早班偏好映射到旧消息，日期 conflict 映射到两个候选来源，retry promise 映射到失败工具事件与助手承诺。验收时逐项问：当前值是否唯一且有来源，旧值是否停止投影，冲突是否未被伪装成确定值，摘要是否承认有损，省略细节是否可回取。',
      '最后做两次反向测试。第一次从 summary 出发，能否找回“不要早于十点”的原文而不只得到“偏好晚一点”；第二次模拟旧记忆召回，系统是否让当前显式纠正优先并排除 superseded 早班偏好。若这两条都通过，说明 transcript、canonical state、summary 与来源映射的职责已经闭合；若失败，应修状态规则或映射，而不是继续把摘要写得更长。',
    ]),
    keyPoints: Object.freeze([
      '练习必须同时产出规范状态、有损摘要和来源映射，三者不可合并成一段文本。',
      '工具失败、未决承诺、冲突和敏感信息都要在压缩过程中得到明确处理。',
      '反向回取与旧值召回测试可以证明纠正链真正影响后续投影。',
    ]),
    sourceIds: Object.freeze([
      'res-context-langchain-memory',
      'res-context-openai-compaction',
      'res-context-openai-data',
      'res-context-coala',
      'res-context-primary-feishu-microcompact',
      'res-context-primary-feishu-prompt-memory',
      'res-context-primary-javaguide-memory',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Summary 是 transcript 的等价缩短版，只要写得好就不会丢信息。',
    correction: '摘要必然选择和改写内容，应明确标为有损，并保留覆盖范围、来源指针和高风险原文回取路径。',
  }),
  Object.freeze({
    claim: 'Canonical state 是行业通用标准，可以直接从某个框架字段复制。',
    correction: '它是本课程的应用模型。框架可以提供线程状态或存储原语，具体 schema、决胜和 supersession 规则仍由应用定义并测试。',
  }),
  Object.freeze({
    claim: '用户纠正旧事实后，直接删除旧消息最干净。',
    correction: '删除会破坏来源与变更解释。应让新值 supersede 旧值，保留双方消息、时间和原因，同时阻止旧值继续投影。',
  }),
  Object.freeze({
    claim: '两个来源冲突时，最后写入数据库的值自然就是 canonical value。',
    correction: '最后写入只反映处理顺序，不一定反映权威或时效。没有明确决胜依据时应保持 unresolved 并请求澄清。',
  }),
  Object.freeze({
    claim: '使用 OpenAI compaction 后，应用可以删除 transcript 和自身的状态映射。',
    correction: 'Opaque compaction 主要服务特定产品续接，不能当作可读无损摘要，也不替代应用对取证、纠正和删除传播的责任。',
  }),
  Object.freeze({
    claim: '滑窗、summary 与 retrieval 只能三选一。',
    correction: '它们分别擅长最近原话、压缩脉络和远处回取，可围绕 canonical state 与 transcript 组合使用。',
  }),
]);

export const context03Note = Object.freeze({
  readingMinutes: 39,
  overviewVisualId: 'visual-context-03-event-state-summary',
  overviewVisualSectionId: 'three-conversation-representations',
  introduction: '预算有限时，长会话必须压缩；但如果只让模型把历史改写成一段流畅摘要，否定、纠正、来源、工具失败和未决承诺就可能悄悄消失。本章区分原始 transcript、明确标注为课程应用模型的 canonical conversation state 与有损 summary：前者负责取证，中者负责当前决策，后者负责降低阅读成本。我们还会建立 source mapping，用 supersession 表达用户纠正，用 unresolved conflict 保留尚无决胜依据的不一致，并通过一段含偏好修改、工具失败和敏感信息的旅行助理案例完成三份可验收交付物。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Transcript 保存原始消息和工具事件，是来源与审计底座。',
    'Canonical conversation state 是课程应用模型，表达当前事实、约束、未决项、失败和不确定性。',
    'Summary 是为降低成本生成的有损派生物，不能覆盖 transcript 或被当作完整事实库。',
    'Source mapping 把状态条目和摘要结论连接回消息 ID、时间与必要 span。',
    '滑窗保留最近原话，summary 压缩叙事，retrieval 按需回取远处细节，三者可以组合。',
    'Opaque compaction item 服务特定产品续接，不是可读、可逆、无损摘要。',
    'Supersession 让新值成为当前事实并停止旧值投影，同时保留旧记录及其来源。',
    '纠正具有明确替代语义；没有决胜依据的不一致应保持 unresolved conflict。',
    '工具失败和未决承诺必须进入状态，不能在摘要中被写成已经成功。',
    '安全压缩的验收不仅看摘要是否通顺，还要验证原文可回取、旧值不再召回和冲突未被隐藏。',
  ]),
  nextStep: '下一课将把会话之外的知识放进 retrieval corpus，进一步区分 source document、retrieval unit、citation unit、embedding 与 index。你会沿用本章的来源映射和版本意识，为不同结构设计 chunk，并保证每个检索单元都能回到有效源文档和精确 span，而不是把索引记录误当成完整原文或当前事实。',
});
