import { deepFreeze } from '../multi-agent-shared.js';

export const ma06Note = deepFreeze({
  readingMinutes: 30,
  overviewVisualId: 'visual-ma-06-overview',
  overviewVisualSectionId: 'ma06-layered-failures',
  introduction: '一个请求通过版本和能力检查以后，仍可能遇到传输中断、参数问题、工具业务失败或长期等待。企业资料助手如果把这些情况都显示成“重试即可”，就可能重复创建工单或错误报告任务完成。本课继续使用 MCP 2026-07-28，并把同日 Stable 的 Tasks extension 作为可选能力单独说明。你将为不同失败选择可解释的恢复动作，记录取消与结果的竞争，并把消息关联、长期任务和业务幂等分别处理。',
  sections: [
    {
      id: 'ma06-layered-failures', title: '先判断失败来自哪一层',
      paragraphs: [
        '一次调用可以同时经过 transport、JSON-RPC 和具体工具逻辑。HTTP 状态说明传输端如何处理请求，JSON-RPC error 表达协议方法处理失败，Tool result 的 isError 则表达工具执行中的问题。三层需要同时读取：HTTP 收到响应不代表工具成功，JSON-RPC 返回 result 也可能携带 isError: true。先确定失败层级，才能判断需要修正格式、改变参数、查询业务状态还是停止继续执行。',
        '如果请求使用不存在的 RPC method，通用错误为 -32601；若 tools/call 指向未知工具名，当前 Tools 规范将它视为参数问题，可返回 -32602。工具已经被识别，但日期不符合业务规则或下游 API 失败时，可以返回 isError: true 的工具结果，让模型或应用根据具体反馈修正。不能只搜索“error”这个词来分类，也不能把格式问题和业务校验问题都解释为服务暂时不可用。',
        '企业资料助手提交工单时，失败记录应包含 transport、方法、请求身份、错误层级、已知业务状态和允许的下一步。无效工具名需要修正接口映射，缺少权限需要处理授权条件，响应中断则需要确认动作是否已发生。本课的分类帮助应用组织诊断；协议错误码没有替所有业务情况规定统一重试策略，恢复决策仍须结合动作副作用和可查询的结果证据。',
        '选择下一步时还要记录通道类型。当前标准输入输出通道用取消通知定位请求，HTTP 则通过关闭对应响应流表达取消；两种方式都不能替代业务结果查询。如果工程师只看到“已取消”三个字，就无法判断取消作用于哪个请求、何时送达以及动作是否已经完成。分类表应把传输动作和业务事实放在不同栏目，保留两者之间需要继续核验的部分。',
      ],
      keyPoints: ['HTTP 状态、JSON-RPC error、工具 isError 表达不同层面的结果', '先分类和核查业务状态，再决定修正、查询或重试'],
      sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-http', 'res-ma-mcp-stdio', 'res-ma-mcp-cancellation'],
    },
    {
      id: 'ma06-transport-boundaries', title: '按照当前版本理解两种传输',
      paragraphs: [
        'stdio 由 Client 启动 Server 子进程，通过标准输入输出交换逐行 JSON-RPC 消息。stdout 只能写 MCP 消息，普通日志可写 stderr；stderr 出现调试文字不会自动构成协议错误。所有请求共享同一通道，所以 Client 需要根据消息 ID 关联响应。当前版本的 Server 通过 MRTR result 请求补充输入，不在 stdout 直接发送独立 JSON-RPC request。',
        'Streamable HTTP 的每个请求使用独立 POST，Client 同时支持 application/json 与 text/event-stream 响应。SSE 可以先传递与本请求相关的通知，再给最终响应；长期变化通知通过 subscriptions/listen 的 response stream 传递。2026-07-28 已没有 protocol session、独立 GET stream 和 Last-Event-ID 恢复，不能把旧教程里的这些机制当成当前版本必备能力。',
        '工具动作和连接生命周期需要分开记录。stdio 进程意外退出后，进行中请求的信息可能丢失，订阅需要重建；HTTP response stream 中断也不能依赖旧版事件重放恢复。应用可以建立新请求继续处理，但在产生写副作用的场景中，应先核查业务结果。连接重新建立只恢复通信条件，不能直接证明前一次工单创建没有执行，更不能自动构成事务回滚。',
      ],
      keyPoints: ['stdio 共享逐行通道，HTTP 每请求使用独立 POST 与响应', '2026-07-28 的 session、GET stream 与恢复规则已经改变'],
      sourceIds: ['res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-mrtr'],
    },
    {
      id: 'ma06-progress-cancellation', title: '进度和取消都需要请求范围',
      paragraphs: [
        '需要进度时，Client 在请求 metadata 中给出 progressToken。这个字符串或整数必须在活动请求之间唯一，Server 可以选择发送 notifications/progress，也可以完全不发送。每次报告的 progress 必须增加，total 可以未知，完成后通知必须停止。因为数值单位由操作决定，界面不能在没有 total 与含义说明时把它直接显示成百分比，也不能用“有进度”证明输出已经通过验收。',
        'Client 取消进行中的普通请求时，必须按 transport 选择动作：stdio 发送引用 request ID 的 notifications/cancelled，HTTP 关闭该请求的 SSE response stream。共享 stdio 通道承载其他请求，因此关闭整个进程会影响更多工作。超时策略可以参考 progress 调整等待，但仍应设置最大总时限，避免一个持续发送进度却无法完成的操作无限占用资源。',
        '取消和完成会受消息顺序影响，取消到达时动作可能已经完成，迟到响应也可能随后出现。Client 应记录取消请求与观察结果，并按规范处理迟到普通响应；界面可以显示已请求取消，不能立刻宣称所有业务工作已停止。删除工单、撤回消息或恢复变更都属于额外业务动作，普通取消消息没有提供这些能力，因此恢复记录必须保留已经发生的副作用与证据。',
      ],
      keyPoints: ['Progress 可选且有作用范围，完成后停止', '取消动作依赖 transport，取消请求不能证明业务副作用已撤销'],
      sourceIds: ['res-ma-mcp-progress', 'res-ma-mcp-cancellation', 'res-ma-mcp-stdio', 'res-ma-mcp-http'],
    },
    {
      id: 'ma06-retry-business-state', title: '让消息 ID 和业务幂等各自负责',
      paragraphs: [
        'JSON-RPC ID 用来关联一次请求及其响应，并避免活动请求之间重号。它没有为创建工单提供业务去重规则。MRTR 重试使用新的请求 ID，传输中断后的新请求也需要明确的消息身份；这与“同一业务动作应只执行一次”是两个要求。记录中应保留请求身份与业务操作身份的对应关系，避免把一次业务提交的多次尝试当成多个独立用户意图。',
        '设想工单已经写入，Server 返回结果前连接中断。Client 没看到成功响应，只能确认结果未知，无法由此推断工单不存在。应用的恢复设计可以先按业务操作标识查询结果，或者让写入服务使用明确的幂等键、唯一约束和结果记录处理重复请求。这是根据副作用风险提出的工程建议，MCP 没有规定本课的业务键名称，也没有自动完成数据库事务与并发去重。',
        '重试策略还要区分可重新读取的资料和可能改变外部状态的动作。读取失败通常可以在权限和版本条件满足后再次读取；写入失败则应查清是否已执行、是否支持幂等、能否查询或补偿。工具描述可帮助选择，但不能替代执行端验证。交付恢复表时请写出缺少证据时的暂停条件，保留结果未知，不能为了让流程继续就把未知改成失败并立即重复创建。',
      ],
      keyPoints: ['JSON-RPC ID 关联报文，业务幂等需要执行服务另行保证', '响应未知时先核查副作用，不能直接推断未执行'],
      sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-mrtr', 'res-ma-mcp-tools', 'res-ma-mcp-cancellation', 'res-ma-mcp-http'],
    },
    {
      id: 'ma06-tasks-extension', title: '长期工作通过可选 Tasks 表达',
      paragraphs: [
        'MCP Tasks 2026-07-28 是独立 Stable extension，标识为 io.modelcontextprotocol/tasks，当前支持 tools/call。双方声明支持后，Server 根据本次工作决定返回普通结果还是 CreateTaskResult；Client 不能假设声明支持就一定获得 task。CreateTaskResult 是 flat Result 与 Task 的组合，taskId 和 status 直接位于 result 中，resultType 为 task；它不能按旧版嵌套 task 字段解释。',
        'Server 必须先让 taskId 对应的任务可查询，再返回 handle。Client 通过 tasks/get 获得当前状态及结果；该 RPC 的 resultType 为 complete，而任务状态可能仍是 working。需要输入时状态为 input_required，Client 通过 tasks/update 提交相应 inputResponses。Task 的 completed 可以包含 isError: true 的工具结果，failed 用于 JSON-RPC 执行错误，两个状态不能只凭业务是否顺利来互换。',
        'tasks/cancel 用 taskId 表达取消意图，成功响应确认收到请求，不能保证任务随后进入 cancelled。更新和取消都可能稍后才反映在查询结果里。Handle 能跨连接用于查询，但受到 TTL、保存策略与逐次授权限制。2025-11-25 的 experimental Tasks 使用另一套请求与结果设计；旧版 tasks/result、tasks/list 和任务参数不能直接混入当前 extension，SDK 支持也需要按实际安装版本核对。',
        '任务标识、消息标识和业务操作标识也应分别记录。消息标识关联某次查询及其响应，任务标识让客户端随后找到长期工作，业务操作标识则可以帮助执行服务查询结果或处理重复提交。拿到了任务标识，只能说明有一个可查询的工作对象，无法单独保证业务恰好执行一次。团队需要根据实际工具说明这些标识如何关联，并为每次查询继续检查资源权限。',
      ],
      visuals: [{ visualId: 'visual-ma-06-detail', afterParagraph: 1 }],
      keyPoints: ['当前 Tasks 为可选 extension，flat task handle 与普通结果需要分别处理', 'task completed 可以携带工具错误，cancel ack 仅确认取消意图'],
      sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-basic', 'res-ma-mcp-versioning'],
    },
    {
      id: 'ma06-recovery-record', title: '把恢复判断写成可以复核的记录',
      paragraphs: [
        '本课交付一份企业资料助手的失败分类与恢复表。第一步选择资料读取和工单写入两类动作，列出 transport 中断、JSON-RPC 参数错误、工具业务错误各需要什么证据；第二步记录普通请求的进度、超时与取消范围，明确 HTTP 与 stdio 的处理不同。每行都应写出能确定的事实、尚未知道的业务状态和允许的下一步，帮助接手者继续调查。',
        '第三步再加入可选 Task 情况，写明 extension 是否声明、taskId 是否已经获得、当前状态和 TTL 信息。遇到 input_required 时提交相应输入，遇到 cancel ack 时记录意图已接收，遇到 completed 时继续查看最终工具结果。练习可以依据规范分析这些状态，不需要制造真实外部任务；如果以后接入 SDK，应把实际互通与恢复结果另行加入记录，明确运行环境和依赖版本。',
        '这份记录还应解释安全与协议的关系：可解析的消息不等于有权读取任务，taskId 不代替资源授权，重试与取消都不能免除业务审查。下一课会进一步说明身份、scope、token audience、委托范围和具体确认分别在哪一层检查。到那里，本课的恢复动作仍要经过相同授权边界，不能因为一次调用失败或等待太久就获得额外权限。',
        '验收恢复表时，让另一位工程师只凭记录回答当前能向用户承诺什么。如果证据只说明取消请求已经送出，就保留等待状态；如果证据说明任务执行结束，还要检查产物是否符合工具和业务要求。记录无法支持的结论应保持未知，并指定需要查询的对象与下一项证据。这样的交付方式使恢复操作具有明确依据，也便于后续检查是否出现重复写入或错误展示。',
      ],
      keyPoints: ['恢复表保留已知事实、未知业务状态和可执行的下一步', '普通请求、长期任务和授权检查需要在记录中分别关联'],
      sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-stdio', 'res-ma-mcp-http', 'res-ma-mcp-cancellation'],
    },
  ],
  misconceptions: [
    { claim: '收到 JSON-RPC result 就表示业务成功。', correction: 'Tool result 可能带 isError: true，Task completed 也可能包含这种结果；业务验收还需检查实际产物。' },
    { claim: 'HTTP 和 stdio 都通过同一条取消通知停止请求。', correction: '2026-07-28 的 HTTP 关闭对应 SSE response stream，stdio 使用引用 request ID 的 notifications/cancelled。' },
    { claim: '更换 JSON-RPC ID 重试可以保证只创建一个工单。', correction: '消息 ID 只关联请求响应，业务去重需要幂等机制或查询结果等执行端措施。' },
    { claim: 'tasks/cancel 返回成功就能显示任务已经停止。', correction: 'ack 确认取消意图，状态可能稍后变化，任务也可能进入其他终态；已发生的副作用仍需处理。' },
  ],
  recap: ['分别读取 transport、JSON-RPC 和工具业务结果。', '当前 stdio 与 Streamable HTTP 的通道、取消及重连机制不同。', 'Progress 可选，取消存在竞争，二者都不能替代任务验收。', 'JSON-RPC ID 与业务幂等承担不同职责，响应未知时先查询证据。', 'Tasks 2026-07-28 是可选 extension，handle、状态与 cancel ack 需要按字段解释。'],
  nextStep: '下一课把身份、scope、资源归属、token audience 与委托范围组成逐层授权判断，让正常执行、恢复和长期任务都遵守同一组业务边界。',
  tests: {
    status: 'passed',
    commands: ['node --check src/data/multi-agent-notes/ma-06.js', 'node --check src/data/multi-agent-lessons/ma-06.js', 'node --check src/data/visuals/multi-agent/ma-06.js'],
    results: [
      { command: 'node --check src/data/multi-agent-notes/ma-06.js', exitCode: 0, summary: '笔记文件语法检查通过。' },
      { command: 'node --check src/data/multi-agent-lessons/ma-06.js', exitCode: 0, summary: '课程、面试题与覆盖数据语法检查通过。' },
      { command: 'node --check src/data/visuals/multi-agent/ma-06.js', exitCode: 0, summary: '图示记录语法检查通过。' },
    ],
  },
});
