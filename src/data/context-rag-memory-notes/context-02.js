const sections = Object.freeze([
  Object.freeze({
    id: 'context-engineering-budget',
    title: '把上下文工程看成预算内的信息系统',
    paragraphs: Object.freeze([
      '上一课已经把后端信息分成五层，并强调只有投影结果进入一次模型调用。本课进一步回答“窗口装不下时怎么选”。Prompt engineering 主要改进指令表达、示例和输出约束；context engineering 的范围更宽，它还管理信息从哪里来、何时有效、按什么顺序投影、占用多少预算、为什么被排除，以及压缩后如何续接。好的提示词若配上陈旧、重复或错误排序的证据，仍然会得到不可靠结果。',
      'Token budget 是本轮允许输入和输出共同占用的容量约束。课程采用确定性预算模型：先设总上限 inputLimit，再预留 outputReserve，得到可用于组装输入的 inputBudget=inputLimit-outputReserve。这里的字段名与计算规则是课程和实验契约，不是某家模型 API 的统一计费规范。真实模型的 token 计算、系统开销和可用窗口会随模型及接口变化，生产系统必须使用目标接口的实际计数方式。',
      '显式预算可写成 W≥I_fixed+H_recent+T_results+R_evidence+S_scratch+O_reserve：总窗口 W 依次容纳固定指令、最近轮次、工具结果、检索证据、工作草稿和输出预留。这个分解是课程的审计模型，不是通用最优比例；每一桶都应记录上限、实际 used、优先级和 sourceRef。这样才能看出是工具输出挤掉证据、历史过长，还是预留不足，而不把“窗口已满”当成单一原因。',
      '预算还要区分估算与结算。候选生成阶段可以使用缓存的 tokenCost 估算排序，但真正调用前应按目标模型重新计数，并确认拼接分隔符、工具 schema 和固定指令没有让输入越界。若重新计数改变了结果，应生成新的 manifest 版本并重新执行同一选择策略，而不是从字符串尾部直接截断。这样做会增加一次校验成本，却能避免“规划时合法、发送时超限”以及截断恰好切掉否定条件的故障。估算误差、重算次数与最终差值也应进入可观测指标，帮助发现 tokenizer 或模板版本已经变化。',
    ]),
    keyPoints: Object.freeze([
      'Context engineering 管理来源、选择、预算、排序、压缩和失效，不只是修改提示词措辞。',
      '课程预算先扣除输出预留，再用剩余 inputBudget 组装输入。',
      '预算目标是必要信息可解释地进入调用，而不是尽量填满窗口。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
    ]),
  }),
  Object.freeze({
    id: 'required-and-output-reserve',
    title: '先保护输出与 required 信息',
    paragraphs: Object.freeze([
      'Output reserve 是在组装输入前为模型回答预留的空间。若把总窗口全部塞成输入，模型可能没有足够空间生成完整答案、引用或结构化结果。课程实验直接从总上限扣除预留；真实产品还可能存在隐藏或固定开销，所以不能把实验数字复制为任意 API 的精确容量。稳定原则是先明确预期输出规模和失败方式，再允许可选上下文竞争剩余空间。',
      'Required 表示本次调用若缺失就不应继续的条目，例如不可绕过的系统约束、当前用户请求和任务必需格式。Required 不是“优先级较高”的同义词：高 priority 的可选证据在空间不足时仍可排除，而 required 一旦被静默截断，调用的语义就已经改变。系统应先计算所有有效 required 候选的成本，并把这个总和与 inputBudget 比较。',
      '若 requiredCost 大于 inputBudget，结果应标记 unassemblable，并明确返回 required items exceed input budget。调用方可以缩短必需材料、拆分任务、选择更大窗口或调整输出要求，但组装器不能随机删除一半指令后假装成功。若 requiredCost 能容纳，则 required 仍按确定性顺序参与组装，剩余空间才由状态、检索证据和记忆投影竞争。这个边界让硬约束不会被普通证据挤掉。',
    ]),
    keyPoints: Object.freeze([
      '输出预留在输入组装之前扣除，避免输入占满窗口后无空间完成回答。',
      'Required 表示缺失即改变调用语义，不等同于可选项中的高 priority。',
      'Required 自身超限必须显式不可组装，不能静默截断。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '预算失败也是正确结果',
      body: '当必要约束无法同时容纳时，返回不可组装比生成一个表面流畅但缺失硬约束的答案更可靠。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-02-injection-loss-guard', afterParagraph: 2 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
    ]),
  }),
  Object.freeze({
    id: 'priority-and-stable-order',
    title: '用优先级与稳定排序消除偶然性',
    paragraphs: Object.freeze([
      'Priority 用于比较同为可投影候选的信息价值，但不能单独决定最终顺序。课程的 recent-first 会优先 required，再比较较新的时间、priority 和稳定 id；evidence-first 同样先保护 required，但把检索证据放到会话状态或长期记忆之前，再使用 priority、时间和 id 解决并列。精确比较顺序属于课程实验设计，不是外部来源推荐的普适算法。',
      '稳定排序意味着同一批输入、同一策略和同一预算总能得到同一 manifest。若只依赖数据库返回顺序或对象插入时机，两个相同请求可能随机保留不同证据，使线上问题难以重放。使用稳定 id 作为最后的 tie-breaker 可以消除这种偶然性；策略名称和版本也要写进 trace，才能解释为何一个条目在 recent-first 被选中、在 evidence-first 被排除。',
      '分层配额可以进一步限制某一来源独占空间，例如为会话状态、检索证据和长期记忆设置最大份额；但配额不能替代 required 守卫，也不能凭空证明某个比例最优。设计时应把配额当作可测试策略：用真实任务比较证据覆盖、约束保留、成本和回答质量，再调整比例。厂商工程文章提供选择、压缩和隔离的经验方向，不能被外推成所有模型都适用的固定配额。',
    ]),
    keyPoints: Object.freeze([
      '排序必须先保护 required，再按声明策略比较层、priority、时间和稳定 id。',
      '稳定 tie-breaker 让 manifest 可重放，避免数据库返回顺序暗中改变上下文。',
      '分层配额是需要业务评测的策略参数，不是外部资料证明的通用比例。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
    ]),
  }),
  Object.freeze({
    id: 'two-overflow-modes',
    title: '区分普通超限与 required 超限',
    paragraphs: Object.freeze([
      '第一类超限是普通预算不足：required 可以容纳，但某个可选状态、证据或记忆加入后会超过 inputBudget。组装器保留已经按稳定顺序装入的条目，把该候选写入 excluded 并标记 budget-exceeded，然后继续检查后续候选。这样，输入仍可合法调用，只是 manifest 清楚显示哪些信息因预算未进入。工程师随后可以检查排序、压缩或分层配额，而不是误以为资料从未存在。',
      '第二类是 required 自身超限。此时即使可选项全部删除，必需信息仍无法完整进入输入。组装结果可以继续列出逐项 included 与 excluded 以便诊断，但整体必须标记 unassemblable，并给出明确原因。调用方不能只看 included 非空就继续发送，因为这会把部分硬约束误当成完整约束。普通超限允许降级运行，required 超限要求上游决策，这是二者最重要的语义差别。',
      '还要检查刚好装满的边界。若 used 正好等于 inputBudget，应视为合法 exact fit，remaining 为零；只有下一项使总成本大于预算时才排除。边界条件若使用错误的不等号，会让系统无故丢掉恰好可容纳的信息。测试至少覆盖 exact fit、普通 budget-exceeded、required-budget-exceeded、outputReserve 大于总上限以及非法负数，才能证明预算行为确定而非依赖样例。',
    ]),
    keyPoints: Object.freeze([
      '普通超限排除可选项并记录 budget-exceeded，调用仍可在剩余信息上继续。',
      'Required 超限标记 unassemblable，必须交给上游缩减、拆分或调整模型与预算。',
      'Exact fit 与非法预算都应有单独测试，避免边界条件改变语义。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '两个看似相同的“放不下”',
      body: '少一篇辅助证据仍可回答，只需标记降级；少一条安全约束则不能继续。错误不在 token 数，而在被排除条目的语义。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-context-02-overflow-strategies', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
    ]),
  }),
  Object.freeze({
    id: 'long-context-and-compaction',
    title: '把长窗口与 compaction 放回证据边界',
    paragraphs: Object.freeze([
      'Lost in the Middle 通过多文档问答和 key-value retrieval 的受控实验说明，在论文所测模型与任务中，改变相关信息位置可能显著影响表现；相关内容常在开头或末尾利用较好，在中间变差。这个结果支持“窗口更长不等于有效利用更稳定”，也支持测试排序和截断策略。它不能证明任意模型都有同样曲线，更不能直接给出本课程的 priority、配额或 overflow 契约。',
      'Compaction 是 OpenAI 当前产品提供的长会话压缩与状态续接能力，产品接口和具体语义可能随版本变化。对本课最重要的边界是：opaque compaction item 是供后续调用续接的产品状态，不应被当作人类可读的普通 summary，也没有理由把它描述为可逆或无损。应用若需要可审计的当前事实、原文引用或纠正链，仍要单独维护 conversation state、transcript 指针和自身的来源映射。',
      '溢出时有四类动作：selection 排除低价值候选；compression 把连续历史或工具结果变成有损派生物；offloading 把可恢复细节写到外部状态并留下引用；reset 在保存 checkpoint、未决项和回取路径后开启新上下文。四者都可能丢细节；offloaded 文件和重新检索的历史还可能携带 prompt injection，因此必须按不可信内容过滤、保留来源与权限，并让固定指令继续由宿主控制。',
    ]),
    keyPoints: Object.freeze([
      'Lost in the Middle 支持测试位置敏感性，不支持把单篇论文外推为所有模型定律。',
      'OpenAI opaque compaction 是版本化产品状态，不是可读、可逆、无损摘要。',
      '滑窗、应用摘要、retrieval 与 compaction 可以组合，但职责和证据能力不同。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: 'Opaque 的工程含义',
      body: '应用可以把 opaque compaction item 传回对应产品继续处理，但不应解析、改写或把它展示成一份完整会话摘要；需要审计的事实应由应用自己的状态与来源记录承载。',
    }),
    sourceIds: Object.freeze([
      'res-context-lost-middle',
      'res-context-openai-compaction',
      'res-context-anthropic-engineering',
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
      'res-context-primary-feishu-microcompact',
    ]),
  }),
  Object.freeze({
    id: 'context-router-worked-example',
    title: '用 Context Router 验收预算守恒',
    paragraphs: Object.freeze([
      '以政策助理的一轮调用为例，候选包括系统约束、当前问题、最近会话状态、两条检索证据、一条用户偏好，以及 raw corpus 和 raw checkpoint。先为每项填写 id、layer、projectionType、required、priority、timestamp、tokenCost、sourceRef 和 status。Raw corpus 与 raw checkpoint 因 not-projectable 排除；expired 或 superseded 投影也在预算竞争前排除。随后计算 inputBudget，并单独汇总有效 requiredCost。',
      '第一次运行选择 recent-first，观察 required 条目是否稳定在前，最近状态与证据如何竞争预算；再切换 evidence-first，比较检索证据是否提前，以及 included、excluded 与 remaining 怎样变化。两次输入相同却排序策略不同，manifest 应能解释差异。若你只记录最终 prompt，就无法判断条目是因策略、状态还是预算被排除；这正是 Context Router 要训练的可观测性。',
      '最后依次构造三种边界：让条目恰好填满 inputBudget，确认 remaining=0 且没有误排除；缩小预算使一条可选证据出现 budget-exceeded，确认整体仍 ready；继续缩小到 requiredCost 也放不下，确认 unassemblable=true 且出现 required-budget-exceeded。交付的 manifest 要同时展示输入算式、策略、included 投影和 excluded 原因。实验只处理固定教学条目，不接收真实敏感内容，也不证明 recent-first 或 evidence-first 在生产中普遍更好。',
    ]),
    keyPoints: Object.freeze([
      '先过滤不可投影和无效条目，再排序、计算 requiredCost 并装入预算。',
      '切换策略时，manifest 必须解释相同候选为何得到不同选择结果。',
      '练习要覆盖 exact fit、普通超限和 required 超限三条路径。',
    ]),
    sourceIds: Object.freeze([
      'res-context-anthropic-engineering',
      'res-context-lost-middle',
      'res-context-practical-guide',
      'res-context-primary-javaguide-context',
      'res-context-primary-feishu-context-offloading',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Context engineering 就是把 prompt 写得更长、更详细。',
    correction: '它管理来源、状态、检索、记忆、预算、排序、压缩和失效；文本措辞只是整个信息系统中的一部分。',
  }),
  Object.freeze({
    claim: '只要 inputLimit 足够大，就无需给输出预留空间。',
    correction: '输入和输出共享容量约束。没有 output reserve 可能让模型无法完成答案、引用或结构化结果。',
  }),
  Object.freeze({
    claim: 'Required 只是 priority 最高的可选项，放不下时可以静默截掉。',
    correction: 'Required 缺失会改变调用语义；其总成本超限必须显式不可组装并交给上游处理。',
  }),
  Object.freeze({
    claim: '普通证据超限和 required 超限都只是少放几段文字，处理方式相同。',
    correction: '普通超限可以带降级记录继续调用；required 超限表示合法输入无法构成，必须停止或重新规划。',
  }),
  Object.freeze({
    claim: 'OpenAI compaction 返回的是一份可读、无损、可以替代 transcript 的摘要。',
    correction: 'Opaque compaction item 是特定产品用于后续续接的状态；不能据此声称可读、可逆或无损，审计记录仍应由应用维护。',
  }),
  Object.freeze({
    claim: 'Lost in the Middle 已经证明所有模型都应把证据放在开头。',
    correction: '论文结论绑定其模型、任务和输入构造。它支持开展位置评测，不提供跨模型通用排序定律。',
  }),
]);

export const context02Note = Object.freeze({
  readingMinutes: 37,
  overviewVisualId: 'visual-context-02-token-budget',
  overviewVisualSectionId: 'context-engineering-budget',
  introduction: '上一课回答了“信息属于哪一层、如何投影”，本课回答更现实的问题：窗口有限时，哪些内容必须保留，哪些可以降级，系统怎样证明自己没有悄悄删掉硬约束。我们会把总窗口拆成输出预留和输入预算，区分 required 与普通 priority，用稳定排序消除偶然性，并严格区分可选项 budget-exceeded 与 required-budget-exceeded。随后把长上下文位置效应和 OpenAI compaction 放回各自证据边界，最后用 Context Router 完成 exact fit、普通超限和不可组装三条验收路径。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Context engineering 管理完整的信息供应链，prompt engineering 主要处理指令表达。',
    '课程预算以 inputBudget=inputLimit-outputReserve 表示，真实产品仍须使用对应接口的 token 语义。',
    'Output reserve 在输入组装前扣除，避免没有空间生成完整结果。',
    'Required 缺失会改变调用语义，不等同于可选项里的高 priority。',
    '稳定排序要记录策略版本，并使用稳定 id 消除并列项的偶然顺序。',
    '普通超限记录 budget-exceeded 后可降级继续；required 超限必须标记 unassemblable。',
    'Exact fit、普通超限、required 超限和非法预算都需要独立测试。',
    '长窗口不保证稳定利用信息，论文位置效应只能在其任务边界内解释。',
    'Opaque compaction 是特定产品的续接状态，不是可读、可逆或无损摘要。',
    'Context Router 的 manifest 同时展示 included、excluded、预算与原因，用于教学诊断而非证明生产最优策略。',
  ]),
  nextStep: '下一课将进入会话内部，区分原始 transcript、课程应用模型中的 canonical conversation state 与有损 summary。你会看到压缩为何必须保留 source mapping、未决项、工具失败和不确定性，并用 supersedes 表达用户纠正，而不是覆盖旧消息或让 opaque compaction 充当事实数据库。',
});
