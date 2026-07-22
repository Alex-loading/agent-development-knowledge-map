const sections = Object.freeze([
  Object.freeze({
    id: 'tool-declaration-contract',
    title: '工具声明：把允许动作写成模型与宿主共享的契约',
    paragraphs: Object.freeze([
      '上一课把自然语言请求整理成 task contract，明确目标、约束、未知项和成功证据；本课再把其中的“允许动作”变成工具契约。function calling（也称 tool calling）不是让模型取得数据库或操作系统权限，而是由应用把可选工具的名称、用途和参数结构交给模型，模型只在响应中提出一个结构化调用意图。真实能力、凭据和执行入口始终留在宿主程序一侧，因此画职责图时必须把模型、宿主执行器和外部系统分成三个边界。',
      '一份可用声明要让工具职责单一，并把名称、描述、参数类型、必填项、枚举和对象边界写清。OpenAI 当前文档用 JSON Schema 描述 function 参数；Anthropic 的工程经验也强调少而高信号的工具集合、清晰命名和高信息量描述。两者都不意味着 schema 自动获得业务正确性：声明只缩小模型可以表达的调用形状，资源是否存在、操作者是否有权、动作是否合规仍要由宿主另行判断。',
      '以订单场景为例，查询和取消不应合并成一个带 mode 自由文本的万能工具，因为二者权限与副作用完全不同。下面是可直接复制并解析的当前 Responses function 工具定义，宿主从认证上下文取得主体，不让模型传 user_id：{"type":"function","name":"get_order","description":"Read one order visible to the authenticated caller.","strict":true,"parameters":{"type":"object","properties":{"order_id":{"type":"string","description":"Stable order identifier."},"view":{"type":"string","enum":["summary","items"],"description":"Response detail level."}},"required":["order_id","view"],"additionalProperties":false}}。它只读，返回仅含订单状态、可取消性和所选视图的必要摘要，不回传支付令牌、完整地址或内部风控备注。',
    ]),
    keyPoints: Object.freeze([
      '模型只能看到工具契约并提出调用，真实权限、凭据和执行能力始终属于宿主与外部系统。',
      '查询与取消按权限和副作用拆成两个职责单一工具，声明只暴露完成任务所需的最小字段。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: 'schema 是接口形状，不是授权书',
      body: '参数满足 JSON Schema 只能说明结构可接受；它不证明订单存在、调用者有权、当前状态可取消，也不代表动作已经执行。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-function', 'res-agent-anthropic-tools', 'res-agent-ms-tool-video']),
  }),
  Object.freeze({
    id: 'model-proposes-function-call',
    title: '模型产生调用：结构化输出仍是不可信的动作提案',
    paragraphs: Object.freeze([
      'OpenAI 在 2026-07-22 核验的官方文档把工具调用概括为五个高层步骤：应用连同可用工具发出请求；模型返回零个、一个或多个 tool call；应用侧代码执行获准调用；应用把对应 tool output 再次提交给模型；模型给出最终回复或继续提出调用。这个顺序的关键不是 API 名称，而是控制权：第二步只产生 name、arguments 与调用标识等候选数据，第三步是否发生完全由宿主决定。',
      '模型输出即使能被 JSON 解析，也可能选错工具、缺少字段、给出越界枚举、混入未声明字段，或者在业务上请求不存在的订单。宿主应把每个调用都当作来自不可信边界的输入，并为零调用、多调用、重复调用和未知工具名定义确定性处理。Toolformer 论文研究的是用少量示例生成 API 调用标注、执行候选调用，再按其是否降低后续 token 预测损失过滤数据并微调模型；它说明“何时、调用什么、传什么参数、如何利用结果”可以成为训练目标，却没有定义本课使用的生产协议。',
      '这一区分也避免把研究结果错迁移到线上系统。Toolformer 的 GPT-J 实验使用问答、Wikipedia 搜索、计算器、日历和翻译五类文本工具，并明确列出不能链式调用、不能交互修订查询、对措辞敏感和未计工具成本等限制；论文没有覆盖业务授权、审批、幂等或不可逆副作用。生产 function calling 因而仍需要宿主安全边界，不能用“模型学会使用工具”推导出“模型可以自行执行订单取消”。',
    ]),
    keyPoints: Object.freeze([
      '五步生命周期把模型提案与宿主执行明确分开；收到 function call 不等于调用已经发生。',
      'Toolformer 是自监督工具使用训练研究，不是当前生产 API 的消息协议或安全保证。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '把 tool call 看成待审工单',
      body: '模型填写动作名称与候选参数，宿主像审批与执行系统一样检查后才落地；工单生成、获批、执行成功是三个不同事件。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-function', 'res-agent-toolformer', 'res-agent-hf-course']),
  }),
  Object.freeze({
    id: 'syntax-and-schema-validation',
    title: '语法与 schema 校验：只证明形状，不证明语义',
    paragraphs: Object.freeze([
      '宿主收到 arguments 后先做语法层检查：限制字节数和嵌套深度，安全解析 JSON，拒绝未知工具名，再按对应 schema 校验必填字段、类型、枚举、格式、范围和额外字段。顺序不能反过来，更不能在解析失败时让模型返回的文本进入数据库语句或命令行。把 additionalProperties 设为 false 能拒绝 debug、admin 或其他未声明字段，避免模型用“顺便多传一个值”扩大接口表面。',
      'OpenAI 当前 strict 模式建议每层对象设置 additionalProperties 为 false，并把 properties 中字段列为 required；需要可选值时可用包含 null 的类型表达。strict 约束模型生成对 schema 的遵循度，但只覆盖所支持的 JSON Schema 子集，而且 Responses 与 Chat Completions 的默认处理存在接口差异，所以本文只把这些语义声明为 2026-07-22 的 OpenAI 接口核验结果。跨供应商或升级 SDK 时必须重读对应文档并跑契约测试，不能把本段当永久不变的通用标准。',
      '订单查询的五类输入能立刻显示边界：合法低风险调用 get_order，order_id 为 ord_2048、view 为 summary，可进入业务校验；缺少 order_id 返回 INVALID_ARGUMENT、retryable 为 true，要求补参；view 为 raw 不属于 summary、items，必须返回 INVALID_ENUM；若多出 debug 字段，则由 additionalProperties 为 false 返回 UNEXPECTED_PROPERTY。以上结构失败都不得触发真实查询；第五类高风险动作由取消工具承担，并在下一层转入审批而不是混进 schema 判断。',
    ]),
    keyPoints: Object.freeze([
      '校验链先安全解析，再解析工具名与 schema；任何失败都在执行前终止并产生可分类错误。',
      'strict 与 additionalProperties 为 false 收紧结构，却不覆盖存在性、跨字段关系、权限、风险和业务状态。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '合法 JSON 只是起点',
      body: 'quiz 的正确推理是：合法 JSON 之后仍要做 schema、业务、权限与风险校验；不能直接视为已执行。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-function', 'res-agent-anthropic-tools']),
  }),
  Object.freeze({
    id: 'business-permission-risk-validation',
    title: '业务、权限与风险校验：决定这个动作此刻能否发生',
    paragraphs: Object.freeze([
      '通过 schema 后，宿主才进入语义层。存在性检查确认 order_id 对应真实且当前可见的资源；跨字段规则检查 reason、channel 与订单状态组合是否允许；权限检查从认证会话取得主体与租户，而不是信任模型参数；风险策略判断退款金额、不可逆性、监管要求和审批门槛。最小权限的含义是工具只获得完成单一职责所需的身份、数据范围和动作能力，并在执行时再次校验，不能把管理员凭据或任意订单范围交给模型。',
      '下面是第二份可直接复制并解析的当前 Responses function 工具定义：{"type":"function","name":"cancel_order","description":"Request cancellation of one order after host-side authorization and risk checks.","strict":true,"parameters":{"type":"object","properties":{"order_id":{"type":"string","description":"Stable order identifier."},"reason":{"type":"string","enum":["customer_request","duplicate","delivery_delay"],"description":"Allowed cancellation reason."},"idempotency_key":{"type":"string","description":"Caller-generated identifier for this cancellation intent."},"approval_token":{"type":["string","null"],"description":"Verified approval reference, or null when policy permits no approval."}},"required":["order_id","reason","idempotency_key","approval_token"],"additionalProperties":false}}。在当前 strict 约束里，approval_token 仍列入 required，只是值允许 null；required 约束字段必须出现，nullable 不代表宿主可以跳过审批，实际策略仍要判断此时 null 是否被允许。',
      '高风险调用即使结构完全合法也只能返回 APPROVAL_REQUIRED，retryable 为 false，message 说明需要授权角色，evidenceRef 指向审计事件；没有审批时禁止执行。一次高风险退款的检查表至少包括：调用与会话关联、schema、订单存在性、租户归属、当前状态、金额与政策、操作者权限、审批令牌、幂等键、审计记录以及响应最小暴露。错误结构应让程序明确选择补参、重新授权、等待审批或终止，而不是把模糊异常丢给模型自由猜测。',
    ]),
    keyPoints: Object.freeze([
      '语义校验覆盖资源存在性、跨字段关系、业务状态、认证主体、权限政策和风险审批。',
      '最小权限不靠提示词保证，而靠宿主从可信身份上下文收窄资源范围与动作能力。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '高风险合法调用的正确结论',
      body: 'schema 通过并不等于 ready；当策略命中审批门槛时，宿主返回 approval-required 并保持零副作用，只有可验证审批到位后才重新进入执行前检查。',
    }),
    sourceIds: Object.freeze(['res-agent-anthropic-tools', 'res-agent-ms-tool-video', 'res-agent-openai-function']),
  }),
  Object.freeze({
    id: 'host-execution-boundary',
    title: '宿主执行：用幂等、超时和审计守住副作用边界',
    paragraphs: Object.freeze([
      '所有检查通过后，宿主才使用服务端凭据调用真实系统。AWS Builders’ Library 把幂等操作定义为同一请求可以重传或重试而不产生额外副作用，并说明其偏好把调用方提供的唯一 client request identifier 写入 API 契约；同一调用方与同一标识可被识别为重复请求，服务端还要原子地记录标识与变更。本课把 cancel_order 的 idempotency_key 映射到这一职责：同一取消意图重试时复用同一键，同一键却改变参数时拒绝为 IDEMPOTENCY_CONFLICT，而不是仅凭参数哈希猜测调用意图。',
      'AWS 正文以网络超时说明调用方可能不知道资源是否已经创建，非幂等地直接重试可能重复产生副作用；在幂等契约的有效窗口内，同一 client request identifier 的重试应获得语义等价响应，同时必须考虑晚到请求与标识保留期。订单示例据此把超时回填为 UNKNOWN_OUTCOME 并保留原 idempotency_key；随后查询订单状态或调用账本属于本课程把 AWS 所述 reconciliation 落到订单域的恢复设计，不是 AWS 为订单规定的接口，也不能在没有具体业务证据时自动决定补偿。',
      '执行层还要隔离并发、限制总时长、记录结构化事件，并把底层异常转换为稳定的领域错误。本课程使用 rejected、approval-required、running、succeeded、failed 与 unknown-outcome 作为订单调用状态；这些名称、审批和补偿策略是课程综合，必须由宿主与外部系统证据决定。Microsoft 视频的字幕材料只交叉说明工具串联、最小权限与错误处理，其 Semantic Kernel 的 auto 或 required 行为依赖版本；AWS 文章也明确其严谨契约有服务端复杂度，不证明每个业务都应照搬。',
    ]),
    keyPoints: Object.freeze([
      '副作用工具用调用方请求标识表达一次意图；同一意图重试复用标识，同一标识改变参数应被拒绝。',
      '超时会造成调用方视角的不确定性；保留原标识并对账，晚到请求和标识保留期必须进入设计。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '超时后不要立即再做一次',
      body: '网络超时不能证明远端没有执行。若服务提供幂等契约，应复用原请求标识取得语义等价结果；具体订单系统如何查询或对账仍由本课程示例和真实接口另行定义。',
    }),
    sourceIds: Object.freeze(['res-agent-aws-idempotent-apis', 'res-agent-anthropic-tools', 'res-agent-ms-tool-video']),
  }),
  Object.freeze({
    id: 'structured-result-observation',
    title: '结构化结果与调用关联：把真实环境变化变成 observation',
    paragraphs: Object.freeze([
      '执行或拒绝后，宿主产生统一结果，而不是让异常栈、整行数据库记录或一大段日志直接进入模型上下文。成功形状可写为 success 为 true、data 为经过字段白名单处理的业务摘要、error 为 null、evidenceRef 为可审计结果引用；失败形状可写为 success 为 false、data 为 null、error 包含 code、retryable、message，另带 evidenceRef。code 供控制器分支，retryable 只表达在既定恢复条件下是否可能重试，message 给出最小必要解释，evidenceRef 让人或程序回溯证据但不泄露机密内容。',
      'OpenAI 当前 Responses 示例要求 function_call_output 使用原 function call 的 call_id 关联提交。关联的意义不是界面美观，而是让多调用环境知道哪个输出回答哪个动作，并把结果作为新的 observation 交给模型和控制器。模型随后可以根据 success、错误类别和业务数据更新上一课的工作状态，判断任务已完成、需要修参、等待审批、查询未知终态或进入下一轮；没有回填时，它仍停留在调用前的 belief，容易把“提出取消”写成“订单已取消”。',
      '空列表与超时必须不同：订单查询成功但 data.items 为空，应返回 success 为 true、明确 empty 为 true、retryable 为 false，并给出查询范围与 evidenceRef，后续可以得出“该范围当前无结果”；超时则返回 success 为 false、code 为 TIMEOUT 或 UNKNOWN_OUTCOME，不能断言为空，后续应按是否有副作用选择受控重试或终态核对。最小暴露要求 data 只保留下一步决策需要的订单号掩码、状态、可取消性和必要摘要，敏感地址、支付信息、内部令牌和无关大文本均留在受控系统。',
    ]),
    keyPoints: Object.freeze([
      'tool result 通过 call_id 与原调用关联，成为更新状态和选择下一步的真实 observation。',
      '统一 success/error、code、retryable、message、evidenceRef，并区分成功空结果与请求超时。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '结果足够决策即可',
      body: '结构化返回既服务确定性控制器，也服务模型；应保留状态、错误类别与证据引用，删掉秘密、无关字段和污染上下文的大文本。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-function', 'res-agent-anthropic-tools', 'res-agent-aws-idempotent-apis', 'res-agent-toolformer']),
  }),
  Object.freeze({
    id: 'order-tool-contract-lab',
    title: '订单工具契约实验：用五类调用验证完整交付物',
    paragraphs: Object.freeze([
      '练习交付先列两份 schema 与返回协议：get_order 是只读工具，声明 order_id 与 view 枚举 summary、items，二者必填并禁止额外字段；cancel_order 是副作用工具，声明 order_id、reason 枚举、idempotency_key 与可空 approval_token，同样全部必填并禁止额外字段。两者都采用统一 success/error 与 evidenceRef，查询错误至少含 NOT_FOUND、FORBIDDEN、TIMEOUT，取消错误至少含 INVALID_STATE、APPROVAL_REQUIRED、IDEMPOTENCY_CONFLICT、UNKNOWN_OUTCOME。工具名、用途、必填、枚举、返回、权限和幂等要求由此全部可检查。',
      '然后记录五类结果：合法 get_order 仅在 schema、存在性和权限都通过后为 ready 并执行；缺 order_id 返回 INVALID_ARGUMENT 且零执行；view 为 raw 返回 INVALID_ENUM；多出 debug 返回 UNEXPECTED_PROPERTY；合法的 cancel_order 若命中高风险策略则返回 APPROVAL_REQUIRED，等待可验证审批后再检查，不能自动执行。若批准后执行成功，回填 success、最小订单状态与 evidenceRef；若超时，回填 UNKNOWN_OUTCOME 并按原幂等键查终态。每一行都要写“宿主动作、是否有副作用、下一步”，这样五类结果不是只看颜色的演示。',
      '页面中的 tool-contract 检查台正好提供合法低风险、缺必填、非法枚举、额外字段和高风险五个预设，但它是本地确定性教学检查器：只按简化 catalog 返回 ready、invalid 或 approval-required，不调用真实模型、订单系统或生产策略，也不是任何模型的能力评测。它能检验“结构化提案仍需宿主裁决”这一因果关系；真正上线还要补充认证、租户隔离、资源状态、审批验证、幂等存储、超时恢复、审计和回归测试。',
    ]),
    keyPoints: Object.freeze([
      '交付物包含两份具体 schema、统一成功与错误结果、权限和幂等边界，以及五类调用的宿主判定。',
      '教学检查器只验证简化确定性规则，不能被描述为真实模型调用、生产安全验证或性能评测。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '五类验收表的列',
      body: '输入场景｜语法/schema 结果｜业务/权限/风险结果｜宿主动作｜是否产生副作用｜结构化返回｜下一步；五行分别对应合法、缺参、非法枚举、额外字段、需审批。',
    }),
    sourceIds: Object.freeze(['res-agent-openai-function', 'res-agent-anthropic-tools', 'res-agent-aws-idempotent-apis', 'res-agent-hf-course', 'res-agent-ms-tool-video']),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '模型返回 function call 对象，就说明它已经运行了函数并拥有对应系统权限。',
    correction: 'function call 是动作提案；只有宿主在 schema、业务、权限、风险和审批全部通过后，才可用受控凭据访问外部系统。',
  }),
  Object.freeze({
    claim: 'JSON 能解析且 strict schema 通过，就可以安全执行任意业务动作。',
    correction: '结构校验不覆盖资源存在性、跨字段关系、认证主体、业务状态、风险政策、幂等和审批，这些必须在宿主侧单独检查。',
  }),
  Object.freeze({
    claim: '查询与取消可以塞进一个自由文本万能工具，模型会自己理解权限差异。',
    correction: '不同权限与副作用应拆成职责单一工具；自由文本放大歧义，也让校验、审计、最小权限和错误恢复无法精确实施。',
  }),
  Object.freeze({
    claim: '副作用调用超时等于失败，换一个幂等键立即重试最保险。',
    correction: '超时可能是未知终态。应保留原幂等键和请求引用查询结果，盲目换键可能重复取消、退款或发送。',
  }),
  Object.freeze({
    claim: '工具由应用执行，所以模型不需要看到结果，可以直接继续原计划。',
    correction: '关联原调用的 tool result 是动作后的 observation；不回填时模型仍只有调用前信念，无法区分成功、空结果、拒绝与超时。',
  }),
  Object.freeze({
    claim: 'Toolformer 证明了生产 Agent 的 function calling、安全校验与工具链已经被训练自动解决。',
    correction: '该论文研究自监督 API 调用标注与微调，并明确不支持工具链和交互修订，也未覆盖权限、审批、幂等或副作用治理。',
  }),
]);

export const agent03Note = Object.freeze({
  readingMinutes: 36,
  introduction: '上一课已经把模糊请求整理为可检查的 task contract，本章继续回答“允许动作怎样被安全地提出、验证、执行和观察”。你将沿着工具声明、模型提案、两层校验、宿主执行和结果回填走完 function calling 生命周期，并把两份订单工具 schema、五类调用结果与执行边界写成可审查交付物。OpenAI 接口语义以 2026-07-22 核验为限；Toolformer 只用于解释工具使用可以成为训练目标，不被当作生产协议或安全保证。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'function calling 是应用与模型的多步协议：应用提供工具，模型提出调用，宿主执行并把结果回填，模型再继续回应或调用。',
    '模型只产生不可信的结构化动作提案；权限、凭据、真实执行和最终责任始终属于宿主与外部系统。',
    '工具职责应单一、名称和描述明确，并用 required、类型、枚举和 additionalProperties 为 false 收窄输入形状。',
    'strict 提高对 schema 的遵循，但合法 JSON 与合法 schema 都不证明资源存在、调用者有权或业务动作安全。',
    '业务层还要检查存在性、跨字段关系、租户归属、当前状态、风险政策和审批，最小权限由可信执行边界落实。',
    '副作用工具需要稳定幂等键、审计记录和未知终态恢复；超时不能简单等同于失败，也不能换键盲目重放。',
    '工具结果以统一 success/error、code、retryable、message、evidenceRef 表达，并通过 call_id 关联原调用成为 observation。',
    '成功空列表与超时语义不同，回填只暴露下一步需要的数据，不能把秘密、异常栈或无关大文本塞进上下文。',
    '订单练习用合法、缺参、非法枚举、额外字段和需审批五类输入逐层验证；页面检查台只是确定性教学模拟。',
    'Toolformer 研究自监督学习调用时机、参数和结果利用，不等于当前 function calling API，更不提供生产权限与副作用治理。',
  ]),
  nextStep: '下一课将把一次工具调用放进可终止的 Agent loop：控制器读取当前状态，先检查 done、blocked 与预算，再决定动作、经宿主校验执行、吸收 observation、更新状态并重复。这里建立的 call_id、结构化错误、幂等与未知终态，会成为循环判断继续、恢复、交接或停止的可观察输入。',
});
