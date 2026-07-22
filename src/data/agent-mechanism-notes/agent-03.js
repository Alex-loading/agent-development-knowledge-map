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
      '订单查询的五类输入能立刻显示边界：合法低风险调用 get_order，order_id 为 ord_2048、view 为 summary，可进入业务校验；缺少 order_id 返回 INVALID_ARGUMENT，view 为 raw 返回 INVALID_ENUM，多出 debug 返回 UNEXPECTED_PROPERTY。三种结构错误都必须是 retryable 为 false、recoveryAction 为 repair_input，因为原参数原意图的自动重放只会再次失败，必须先修复提案；它们都不得触发真实查询。第五类高风险动作由取消工具承担，并在下一层转入审批而不是混进 schema 判断。',
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
      '下面是第二份可直接复制并解析的当前 Responses function 工具定义：{"type":"function","name":"cancel_order","description":"Propose cancellation of one order; the host authorizes and executes it.","strict":true,"parameters":{"type":"object","properties":{"order_id":{"type":"string","description":"Stable order identifier."},"reason":{"type":"string","enum":["customer_request","duplicate","delivery_delay"],"description":"Allowed cancellation reason."},"reason_detail":{"type":["string","null"],"description":"Optional factual context for the reason, or null."}},"required":["order_id","reason","reason_detail"],"additionalProperties":false}}。reason_detail 虽允许 null，仍列入 required：required 约束键必须出现，nullable 只表达值域。模型面对的 schema 只接收业务意图；模型既不能生成可信幂等键，也不能提交审批凭证或 actor、tenant 等安全上下文，这些字段一旦由不可信提案提供就失去证明力。',
      '高风险调用即使结构完全合法也只能返回 APPROVAL_REQUIRED，retryable 为 false、recoveryAction 为 request_approval，message 说明所需授权角色，evidenceRef 指向审计事件；没有审批时保持零副作用。宿主必须从认证会话、租户上下文、可信任务状态和审批系统重新取得 actor、tenant、稳定 intent 标识与 approval reference，再构造执行 envelope。一次高风险取消的检查表至少包括调用关联、schema、订单存在性、租户归属、当前状态、风险政策、可信审批引用、宿主幂等映射、审计和最小暴露，不能把这些职责交给模型参数。',
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
      '所有检查通过后，宿主才使用服务端凭据调用真实系统。在 AWS 所说的 API 关系里，caller 是作为 API client 的宿主，不是语言模型。宿主从可信任务状态取得稳定 intent ID，从认证上下文取得 actor 与 tenant，从审批系统取得 approval reference；随后为该 intent 分配或查回 idempotency key，把 intent、参数摘要、审批引用、外部请求引用与结果持久化为一对一映射，再构造执行 envelope。模型只提供 order_id、reason、reason_detail，不能生成可证明“同一意图”的稳定键或可信审批凭证。',
      'AWS Builders’ Library 说明调用方提供唯一 client request identifier，使同一请求可重传或重试而不产生额外副作用；同一调用方与同一标识可识别为重复请求，服务端还要原子记录标识与变更。同一宿主 intent 的重试必须查回原 key；若同一 key 对应的参数摘要改变，宿主或下游服务拒绝为 IDEMPOTENCY_CONFLICT。这个稳定映射由宿主持久化，而不是相信模型每轮碰巧生成相同字符串，也不是仅凭参数哈希猜测用户意图。',
      'AWS 正文还以网络超时说明调用方可能不知道远端是否执行；在幂等契约有效窗口内，原 client request identifier 的重试应得到语义等价响应，并考虑晚到请求与保留期。副作用取消超时因此返回 UNKNOWN_OUTCOME、retryable 为 false、recoveryAction 为 reconcile，并保存原宿主 key 与外部引用去查订单或调用账本；只有只读调用的瞬态错误，在原参数原意图自动重放既安全又有意义时，才可标 retryable 为 true、recoveryAction 为 retry。审批、查询、对账和补偿的具体策略仍是课程综合，不能归因给 AWS。',
    ]),
    keyPoints: Object.freeze([
      'AWS caller 是宿主 API client；宿主持久化 intent 到幂等键的映射，模型不得提供可信键或审批引用。',
      '超时会造成调用方视角的不确定性；保留原标识并对账，晚到请求和标识保留期必须进入设计。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '超时后不要立即再做一次',
      body: '网络超时不能证明远端没有执行。副作用调用应保留宿主持久化的原请求标识并进入 reconcile，不能让模型换键重放；具体订单系统如何查询或对账仍由真实接口定义。',
    }),
    sourceIds: Object.freeze(['res-agent-aws-idempotent-apis', 'res-agent-anthropic-tools', 'res-agent-ms-tool-video']),
  }),
  Object.freeze({
    id: 'structured-result-observation',
    title: '结构化结果与调用关联：把真实环境变化变成 observation',
    paragraphs: Object.freeze([
      '执行或拒绝后，宿主产生统一结果：success、data、error、recoveryAction、evidenceRef。失败时 error 固定包含 code、retryable、message；retryable 只表示“原参数、原业务意图的自动重放是否安全且有意义”，不表示错误最终可恢复。recoveryAction 使用稳定枚举：none 表示无需恢复，repair_input 表示先修正提案，request_approval 表示等待可信审批，retry 只用于可安全自动重放的瞬态失败，reconcile 表示未知终态需按原宿主 key 对账，blocked 表示当前没有获准恢复路径。控制器按枚举分支，message 只给最小解释，evidenceRef 指向审计证据。',
      'OpenAI 当前 Responses 示例要求 function_call_output 使用原 function call 的 call_id 关联提交。关联的意义不是界面美观，而是让多调用环境知道哪个输出回答哪个动作，并把结果作为新的 observation 交给模型和控制器。模型随后可以根据 success、错误类别和业务数据更新上一课的工作状态，判断任务已完成、需要修参、等待审批、查询未知终态或进入下一轮；没有回填时，它仍停留在调用前的 belief，容易把“提出取消”写成“订单已取消”。',
      '空列表与超时必须不同：订单查询成功但 data.items 为空，应返回 success 为 true、error 为 null、recoveryAction 为 none，并给出查询范围与 evidenceRef；只读查询的瞬态超时可以返回 TIMEOUT、retryable 为 true、recoveryAction 为 retry。取消订单等副作用的超时则返回 UNKNOWN_OUTCOME、retryable 为 false、recoveryAction 为 reconcile，不能断言失败或换 key。最小暴露要求 data 只保留下一步决策需要的订单号掩码、状态、可取消性和必要摘要，敏感地址、支付信息、内部令牌和无关大文本均留在受控系统。',
    ]),
    keyPoints: Object.freeze([
      'tool result 通过 call_id 与原调用关联，成为更新状态和选择下一步的真实 observation。',
      '统一 success/data/error/recoveryAction/evidenceRef；失败 error 固定含 code、retryable、message，恢复动作使用稳定枚举。',
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
      '练习交付先列两份模型工具 schema 与宿主协议：get_order 只声明 order_id 与 view；cancel_order 只声明 order_id、reason 和可空 reason_detail。模型 schema 不出现 actor、tenant、idempotency_key 或 approval_token；宿主在可信执行 envelope 中注入这些值并持久化 intent→key→外部请求→结果映射。统一结果固定为 success、data、error、recoveryAction、evidenceRef；失败 error 固定为 code、retryable、message。这样“业务提案”和“执行授权”能被分别检查。',
      '以下 JSON 数组可直接复制和解析，完整记录合法查询、缺参、非法枚举、额外字段与高风险需审批五类结果：[{"scenario":"valid_query","result":{"success":true,"data":{"order_id":"ord_2048","status":"processing","cancellable":true},"error":null,"recoveryAction":"none","evidenceRef":"evt_order_2048"}},{"scenario":"missing_order_id","result":{"success":false,"data":null,"error":{"code":"INVALID_ARGUMENT","retryable":false,"message":"order_id is required"},"recoveryAction":"repair_input","evidenceRef":"evt_validation_001"}},{"scenario":"invalid_view_enum","result":{"success":false,"data":null,"error":{"code":"INVALID_ENUM","retryable":false,"message":"view must be summary or items"},"recoveryAction":"repair_input","evidenceRef":"evt_validation_002"}},{"scenario":"unexpected_debug_property","result":{"success":false,"data":null,"error":{"code":"UNEXPECTED_PROPERTY","retryable":false,"message":"debug is not allowed"},"recoveryAction":"repair_input","evidenceRef":"evt_validation_003"}},{"scenario":"high_risk_cancel","result":{"success":false,"data":null,"error":{"code":"APPROVAL_REQUIRED","retryable":false,"message":"verified approval is required before cancellation"},"recoveryAction":"request_approval","evidenceRef":"evt_approval_001"}}]。三个 validation error 都不能自动重放原参数；审批也不是 retry，而是由宿主等待可信审批系统后重新构造 envelope。',
      '页面中的 tool-contract 检查台正好提供这五个预设，但它是本地确定性教学检查器：只按简化 catalog 返回 ready、invalid 或 approval-required，不调用真实模型、订单系统或生产策略，也不是任何模型的能力评测。真实上线还要补充认证、租户隔离、资源状态、审批验证、宿主 intent 与幂等存储、超时恢复、审计和回归测试；副作用出现 UNKNOWN_OUTCOME 时必须携带原宿主 key 进入 reconcile，只有只读瞬态失败才可能 retryable 为 true 并选择 retry。',
    ]),
    keyPoints: Object.freeze([
      '交付物包含两份仅表达业务意图的 schema、宿主可信 envelope、统一结果协议，以及五类完整可解析结果。',
      '教学检查器只验证简化确定性规则，不能被描述为真实模型调用、生产安全验证或性能评测。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '五类验收表的列',
      body: '输入场景｜语法/schema 结果｜业务/权限/风险结果｜宿主 envelope｜是否产生副作用｜结构化返回｜recoveryAction；五行分别对应合法、缺参、非法枚举、额外字段、需审批。',
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
    claim: '可以让模型生成幂等键和审批令牌；副作用调用超时后再让它换一个键重试。',
    correction: '模型不能生成可信身份、审批或稳定 intent 证明。宿主应注入并持久化这些执行字段；未知终态使用原宿主 key 进入 reconcile，换键可能重复副作用。',
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
    '模型工具 schema 只接收业务意图；actor、tenant、稳定 intent/幂等键和 approval reference 由宿主从可信系统注入执行 envelope 并持久化映射。',
    '工具结果统一为 success、data、error、recoveryAction、evidenceRef；失败 error 固定含 code、retryable、message，并通过 call_id 关联原调用。',
    'retryable 只表示原参数原意图可安全且有意义地自动重放；repair_input、request_approval、retry、reconcile、blocked 与 none 是不同控制动作。',
    '成功空列表与超时语义不同，回填只暴露下一步需要的数据，不能把秘密、异常栈或无关大文本塞进上下文。',
    '订单练习给出合法、缺参、非法枚举、额外字段和需审批五类完整 JSON；三类 validation error 均为 retryable false + repair_input，审批为 retryable false + request_approval。',
    'Toolformer 研究自监督学习调用时机、参数和结果利用，不等于当前 function calling API，更不提供生产权限与副作用治理。',
  ]),
  nextStep: '下一课将把一次工具调用放进可终止的 Agent loop：控制器读取当前状态，先检查 done、blocked 与预算，再决定动作、经宿主校验执行、吸收 observation、更新状态并重复。这里建立的 call_id、recoveryAction、宿主 intent/幂等映射与未知终态，会成为循环判断修参、审批、重试、对账、交接或停止的可观察输入。',
});
