import { deepFreeze } from '../multi-agent-shared.js';

export const ma05Note = deepFreeze({
  readingMinutes: 29,
  overviewVisualId: 'visual-ma-05-overview',
  overviewVisualSectionId: 'ma05-request-context',
  introduction: '上一课已经明确谁提供工具、资源和模板，现在要让企业资料助手正确表达每一次请求。许多已有教程从 initialize 开始，但 MCP 2026-07-28 已采用每请求携带版本与能力的模型。本课按核验于 2026 年 9 月 18 日的官方正文，建立当前请求检查顺序，再解释 2025-11-25 的兼容路径。你将能够说明一个请求为什么被拒绝，分清能力发现与授权，并用确定性教学核对器验证有限的请求条件。',
  sections: [
    {
      id: 'ma05-request-context', title: '每个请求都带足解释它的信息',
      paragraphs: [
        'MCP 2026-07-28 使用 self-contained request，表示 Server 处理当前请求所需的协议上下文直接来自请求本身。每次请求必须在 params._meta 中包含 io.modelcontextprotocol/protocolVersion 和 io.modelcontextprotocol/clientCapabilities；即使能力对象为空，也要明确携带。Server 不能根据同一连接之前收到过的字段，替后续缺失字段补全协议上下文。',
        '企业资料助手可能在同一个 stdio 进程里交错查询不同员工的制度，也可能通过不同 HTTP 连接处理同一业务操作。连接的存在只提供传输路径，不能被当成用户会话身份。需要跨请求保留业务状态时，应用应通过明确标识引用它，并在每次使用时检查权限。这样每条请求才有可审查的输入，服务也不必靠“上一个请求是谁”来猜测本次含义。',
        '必需 metadata 缺失时，规范要求返回 JSON-RPC Invalid params，错误码为 -32602；HTTP 响应状态为 400。Client 可附带自报名称和版本帮助诊断，但这些字段不能用于安全判断。本课先检查字段是否具备，再检查声明版本与能力；这是一条便于学习的核对顺序，实际实现还需要完整消息结构、schema、身份与资源校验，不能把几个条件通过当成完整协议合规证明。',
        '审查请求记录时，先让每条消息独立回答三个问题：采用哪份规范、客户端能处理什么交互、当前业务身份来自哪里。前两个问题由规定字段提供协议说明，第三个问题需要真正的认证与授权材料。即使两个请求连续到达同一进程，也应分别判断这些条件。这样的记录方式能让后来接手的工程师从单条请求理解检查依据，减少依赖连接历史造成的误读。',
      ],
      keyPoints: ['protocolVersion 与 clientCapabilities 必须出现在每个当前版请求中', '连接与自报身份都不能代替业务身份和授权'],
      sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning'],
    },
    {
      id: 'ma05-version-selection', title: '用支持版本作出下一次请求选择',
      paragraphs: [
        'protocolVersion 说明本条消息按哪个 MCP revision 解释，不能直接填成 SDK 的版本号。Server 不支持请求版本时，返回 UnsupportedProtocolVersionError，错误码 -32022，并在 data.supported 中列出它支持的版本。Client 应选择双方共同支持的版本后再请求；若没有交集，就向使用者说明不兼容。随意降低版本号而继续使用新版字段，只会制造新的解释问题。',
        'server/discover 把支持版本、Server capabilities 和自报实现信息集中返回。当前规范要求 Server 实现这个方法，Client 则可以选择先调用，也可以直接发业务请求后处理版本错误。因此“Server 必须提供 discover”和“每个 Client 都必须先 discover”是两个不同判断。企业资料助手可在接入展示时读取发现结果，向操作者说明可用能力，但每个后续请求仍要携带自己的 metadata。',
        '规范日期、实现版本和应用版本承担不同用途。前者决定消息语义，SDK 版本决定当前依赖是否实现这些语义，工具或提示版本则帮助定位业务变更。接入记录应同时写明三者，并核对真正安装的 SDK 支持范围。2026-07-28 是本课核验日的 Current 版本，draft 为工作规范；不能把网页里的 draft 示例与 dated revision 混合成一个无版本接口。',
      ],
      keyPoints: ['-32022 应推动共同版本选择，没有交集时报告不兼容', 'Server MUST 实现 discover，Client MAY 预先调用'],
      sourceIds: ['res-ma-mcp-versioning', 'res-ma-mcp-discovery', 'res-ma-mcp-basic'],
    },
    {
      id: 'ma05-request-capabilities', title: '能力声明约束本次交互方式',
      paragraphs: [
        'Capabilities 说明双方支持哪些协议功能。Server 通过 discover 公布 tools、resources、prompts 等能力，Client 在每个请求的 clientCapabilities 中声明本次可处理的功能。某项功能确实需要 Client 配合，而当前请求没有声明时，Server 返回 MissingRequiredClientCapabilityError，码为 -32021，并说明 requiredCapabilities。它不能因为之前的请求声明过，就推断本次也愿意处理相同交互。',
        '例如工单工具还需要向员工收集补充信息，Server 希望使用 elicitation。Host 必须确认自己能够处理这种输入请求，并在当前 capability 中声明适用支持；缺少所需能力时，应修正交互方式或报告条件不足。elicitation 说明客户端能组织补充输入，不能说明员工已经同意创建工单；输入结果、身份、参数与最终动作权限仍需继续检查。',
        'Extensions 在 capabilities 的 extensions 中使用明确标识声明，双方还需遵守该 extension 自己的规则。Client 支持某个 extension 不会自动迫使 Server 为每次调用使用它，也不会为业务操作增加权限。判断失败时应记录缺失的是协议交互能力还是业务授权条件，前者可能通过客户端升级或改交互解决，后者则需要有效身份与实际允许的动作范围。',
        '假设员工可以阅读报修制度，但当前界面无法展示补充输入表单。此时服务既要尊重员工的读取范围，也要尊重客户端实际支持的交互能力。反过来，即使界面能够收集所有字段，员工仍可能没有创建其他部门工单的权限。因此核对表应分别保留功能支持、输入完成和业务允许三项结论；其中任何一项未知，都不能由另一项通过来补充证明。',
      ],
      keyPoints: ['Server 不能使用本次请求未声明的 Client capability', '能力可用、用户提供输入和业务获准分别检查'],
      sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-mrtr'],
    },
    {
      id: 'ma05-legacy-compatibility', title: '把旧版初始化放回对应版本',
      paragraphs: [
        'MCP 2025-11-25 的连接生命周期包含初始化、正常通信和关闭。Client 先发送 initialize，双方交换支持版本、capabilities 和实现信息；初始化成功后，Client 发送 notifications/initialized，再按已协商版本通信。若 Client 无法支持 Server 返回的版本，规范建议断开。这套流程适用于旧 revision，不能要求当前 self-contained request 先通过同一初始化门槛。',
        '同时支持两类 revision 的实现称为 Dual-era。stdio Client 应先使用 server/discover 探测：拿到发现结果就走 Modern；拿到可识别的 Modern 错误就修正版本或请求；其他错误或合理超时才进入旧版 initialize。旧 Server 在初始化前遇到未知方法，可能返回不同错误或保持无响应，所以回退条件不能只认一个错误码，也不能把 -32022 当成旧版信号。',
        'HTTP 的兼容判断还要检查响应正文。Modern Server 也会因为版本、能力或 header 问题返回 400；识别出这些 Modern 错误时应修正对应字段。仅凭状态码执行回退，可能把一个能说新版协议的 Server 错误地转入旧流程。课程图将两条路线分开呈现，接入报告需要写明选用的 revision、探测证据和下一步处理，避免用模糊的“自动兼容”隐藏实际条件。',
        '补充输入的路线也应随版本一起解释。当前普通请求通过结果提出输入要求，客户端准备好输入后再次发起独立请求，使用新的消息标识并携带必要状态。读到旧教程里的初始化和双向请求示意时，应先写明它解释的日期版本，再与当前方法比较。团队能够说明每一步的适用范围，才有条件验证兼容实现；把各版本看起来方便的步骤放在一起，无法形成可核验的通信流程。',
      ],
      visuals: [{ visualId: 'visual-ma-05-detail', afterParagraph: 1 }],
      keyPoints: ['2025-11-25 使用 initialize 与 initialized，2026-07-28 每请求自带上下文', '可识别的 Modern 错误需要修正请求，不能直接触发旧版回退'],
      sourceIds: ['res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning', 'res-ma-mcp-discovery', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'],
    },
    {
      id: 'ma05-mrtr-retries', title: '补充输入后形成新的独立请求',
      paragraphs: [
        '当前版通过 Multi Round-Trip Requests，简称 MRTR，让 Server 在结果里请求更多输入。tools/call、resources/read 和 prompts/get 可以返回 resultType 为 input_required 的结果，其中 inputRequests 使用键标识所需输入，requestState 可以携带只有 Server 理解的状态字符串。Server 不再通过独立 JSON-RPC request 发起同样的客户端交互，理解这一点有助于阅读当前消息方向。',
        'Client 准备好输入后，重新发送原操作并带上对应 inputResponses。这是一次独立请求，JSON-RPC ID 必须更换；若前次返回 requestState，就原样带回，不能解析、修改或把它借给另一个并行请求。企业资料助手同时处理制度读取和工单创建时，要分别保存各自的补充输入关系，避免把一个员工的确认交给另一项动作。',
        'Server 要把回传的 requestState 当作不可信输入；当它影响授权、资源或业务逻辑时，需要验证完整性，并结合身份、有效期和原请求限制重复使用。签名能够发现内容变更，却不能单独保证一个状态只使用一次。Task 执行期间也可能要求输入，但使用 tasks/get 和 tasks/update 处理；本课先理解普通 MRTR，下一课再解释这个可选 extension 的独立路径。',
        '将全过程写进记录时，可以分别保留原请求、输入要求、用户提供的值和后续请求，使每一步都有自己的身份与来源。后续请求仍须带齐当前版本与能力，不能把原先收到输入要求当成持续有效的授权。旧版先初始化的通信前提和当前逐次声明的前提不同；无论采用哪一版，应用都应说明用户输入如何关联到正在处理的事项，并核查是否仍满足执行条件。',
      ],
      keyPoints: ['MRTR 重试沿用原操作语义，使用新的 JSON-RPC ID', 'Client 原样回传 requestState，Server 负责必要的完整性与业务验证'],
      sourceIds: ['res-ma-mcp-mrtr', 'res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-tasks', 'res-ma-mcp-legacy-lifecycle', 'res-ma-mcp-versioning'],
    },
    {
      id: 'ma05-request-checklist', title: '用有限条件核对一次请求',
      paragraphs: [
        '本课请求核对器固定使用 MCP 2026-07-28 的教学条件。你可以检查必需 version 与 capabilities 是否存在、Server 是否支持该 version、HTTP header 是否和 body 一致，以及当前操作需要的 elicitation capability 是否已声明。结果依次区分 missing metadata、unsupported、header mismatch、missing capability 和 accepted，并显示对应解释。这些类别帮助定位已覆盖条件，不负责解析所有 MCP 消息。',
        'HTTP 需要把部分信息同时写入 header 与 JSON-RPC body。MCP-Protocol-Version 应与 metadata 中的值一致，Mcp-Method 对应 method，特定方法的 Mcp-Name 对应名称或 URI；不一致时当前规范使用 HeaderMismatch，码为 -32020。练习应一次改变一项条件，先预测错误类别，再核对程序结果，避免多个问题叠加后误以为第一个显示的错误已经穷尽全部缺陷。',
        '交付请求核对记录时，为每项条件写清输入、预期、观察与修改理由，再附上版本不兼容的处理方案和一条旧版初始化路径。accepted 只表示教学核对器覆盖的条件成立，还需要真实 SDK、传输、完整 schema 与业务权限验证。源码中省略 metadata 的官方示例都有阅读上下文，练习不能把简化片段当成完整线上请求；下一课将用这些明确条件分析中断、取消和长期任务。',
      ],
      keyPoints: ['教学核对器只判断明确列出的五类结果，不提供完整 MCP 实现', '每次改变一项条件，记录版本、transport、字段与对应错误'],
      sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-versioning', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'],
    },
  ],
  misconceptions: [
    { claim: '所有 MCP 请求都必须先经过 initialize。', correction: '本课当前版按每请求 metadata 解释；initialize 与 initialized 属于 2025-11-25 及以前的兼容路线。' },
    { claim: '上一次声明过 capability，后续请求可以省略。', correction: '2026-07-28 要求每次携带必需字段，Server 不能借用连接中先前的能力声明。' },
    { claim: 'HTTP 400 表示 Server 只能使用旧版本。', correction: 'Modern 的版本、能力与 header 错误也可返回 400，应检查 JSON-RPC 正文再决定修正或回退。' },
    { claim: 'MRTR 重试必须复用原 JSON-RPC ID。', correction: '重试为独立请求，必须使用新 ID；输入映射和原样 requestState 用于表达后续处理所需信息。' },
  ],
  recap: ['每个当前版请求都携带 protocolVersion 与 clientCapabilities。', 'discover 为 Server 必需能力，Client 可以选择提前查询。', '版本不支持、缺少 metadata、能力不足与 header 不一致需要分别处理。', '旧版 initialize 流程必须标注适用 revision 与探测证据。', 'MRTR 使用新的请求 ID，并保持输入关系和 opaque requestState 的边界。'],
  nextStep: '下一课继续区分 transport、JSON-RPC 与工具执行结果，说明取消与重试的业务后果，并学习 2026-07-28 可选 Tasks extension。',
  tests: {
    status: 'passed',
    commands: ['node --check src/data/multi-agent-notes/ma-05.js', 'node --check src/data/multi-agent-lessons/ma-05.js', 'node --check src/data/visuals/multi-agent/ma-05.js'],
    results: [
      { command: 'node --check src/data/multi-agent-notes/ma-05.js', exitCode: 0, summary: '笔记文件语法检查通过。' },
      { command: 'node --check src/data/multi-agent-lessons/ma-05.js', exitCode: 0, summary: '课程、面试题与覆盖数据语法检查通过。' },
      { command: 'node --check src/data/visuals/multi-agent/ma-05.js', exitCode: 0, summary: '图示记录语法检查通过。' },
    ],
  },
});
