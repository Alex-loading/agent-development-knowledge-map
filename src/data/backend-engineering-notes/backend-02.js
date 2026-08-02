function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend02Note = deepFreeze({
  readingMinutes: 25,
  introduction: '流式响应不是把完整文本切成小块发送这么简单。连接建立、首字节、增量事件、业务终态、客户端断线和上游取消分别属于不同层次；若没有明确协议，用户看到的“停止”可能只是浏览器不再显示，而服务器仍在消耗模型额度并写入副作用。本课以 SSE、ASGI 和 asyncio 的真实语义为基础，设计同步与流式共享的状态模型，并练习在无法保证远端取消时诚实地记录结果。',
  overviewVisualId: 'visual-backend-02-overview',
  overviewVisualSectionId: 'streaming-model',
  sections: [
    {
      id: 'streaming-model',
      title: '先区分传输进度和业务状态',
      paragraphs: [
        '同步接口通常等所有工作完成再返回一个响应，优点是简单，缺点是长时间占用连接且用户无法观察中间进度。流式接口允许服务逐步发送事件，让客户端更早获得反馈，但连接成功只说明传输通道可用，不说明任务成功。模型已经生成部分文本后仍可能失败，客户端也可能只收到半个结果，因此业务终态必须显式出现。',
        '推荐用稳定事件封装而不是直接吐出任意 token。事件可以包含 eventId、requestId、runId、sequence、timestamp、type 和 payload，其中业务类型至少区分 created、delta、completed、error、cancelled。created 告知客户端运行身份，delta 追加可展示内容，三个终态则说明运行如何结束。客户端只在收到合法终态时把结果标为完成。',
        '同步与流式不应维护两套互相矛盾的业务逻辑。两者可以调用同一个运行状态机和结果聚合器：同步端等待终态后返回快照，流式端订阅状态转换并发出事件。这样错误码、取消、持久化和审计保持一致，差异只在传输表现；测试也能对同一输入比较同步最终结果与流式增量聚合结果。',
        'Beyond Model 的工程视角要求三条路径并列验收：同步 JSON 受单次 deadline 约束；SSE 明确 TTFT、event 序号、代理 buffer 与 heartbeat；异步轮询（async polling）暴露 queued/running/terminal。协议必须按顺序处理 disconnect、cancel、partial output 与 resume：模型外状态不能从连接状态推断，部分输出只是一段传输结果，只有持久事件游标或 checkpoint 才支持恢复。',
      ],
      keyPoints: ['连接状态不等于业务运行状态', '同步和流式共享同一个权威状态机'],
      sourceIds: ['res-backend-whatwg-sse', 'res-backend-openai-streaming', 'res-backend-primary-javaguide-llm-api', 'res-backend-primary-feishu-beyond-model'],
    },
    {
      id: 'sse-wire-format',
      title: 'SSE 是有边界的文本事件协议',
      paragraphs: [
        'SSE 使用 text/event-stream 和 UTF-8 文本，以空行结束一个事件。event、data、id、retry 等字段有各自语义，多行 data 会按规则组合。服务必须正确处理换行和序列化，代理也要避免不必要缓冲。若只把 JSON 字符串随意拼到 socket，客户端可能在半个 UTF-8 字符、半个 JSON 或粘连事件处解析失败。',
        '事件 id 可以帮助客户端表达最后确认的位置，但自动重连不等于业务级精确恢复。若服务没有持久事件日志，新的实例可能无法重放丢失增量；若重放存在，客户端又必须按 runId 与 sequence 去重。设计应明确三种策略之一：不支持恢复并重新查询最终结果、在有限窗口重放事件，或把流作为后台 job 的一个可重新订阅视图。',
        '心跳用于让中间网络设备和客户端知道连接仍在活动，却不能替代业务进度。心跳频率要考虑代理空闲超时和连接规模，payload 应小且不泄露敏感信息。服务还要设置最大流时长、单租户活跃流数量和慢消费者策略，否则少量读取缓慢的客户端就可能占满文件描述符、内存缓冲和生成任务。',
      ],
      keyPoints: ['遵守 SSE 事件分隔和字段语义', '重连、重放和去重要作为显式产品能力设计'],
      sourceIds: ['res-backend-whatwg-sse', 'res-backend-fastapi-sse'],
      visuals: [{ visualId: 'visual-backend-02-detail', afterParagraph: 1 }],
    },
    {
      id: 'asgi-disconnect',
      title: '断线是信号，不是远端取消证明',
      paragraphs: [
        'ASGI 将请求、响应发送和 disconnect 表达为应用与服务器之间的消息。应用收到断线后可以停止继续向该连接发送内容，并触发本地取消流程，但断线时机存在竞争：响应发送可能先失败，disconnect 也可能稍后才被读取。实现必须把这些路径视为正常并发事件，而不是依赖某一个固定异常。',
        '最危险的误解是把客户端断线、协程取消和业务副作用撤销画成同一个箭头。浏览器关闭只改变连接；应用取消 Task 需要协程到达可取消点；上游 SDK 是否取消 HTTP 请求取决于实现；模型供应商已经计算或数据库已经提交的动作可能继续存在。因此断线、取消、副作用三者必须分别记录，不能声称“用户关页所以没有计费或写入”。',
        '合适的策略取决于产品语义。若用户明确请求后台完成，断线后运行应继续，客户端稍后按 jobId 查询；若运行只服务当前交互，可在断线后请求取消，但仍要保存 cancellation_requested、实际停止时间和最终状态。无论哪种策略，都要在资源预算、审计和 UI 文案中保持一致。',
      ],
      keyPoints: ['把 ASGI disconnect 当作并发信号处理', '分别追踪连接、本地任务、远端工作和已提交副作用'],
      sourceIds: ['res-backend-asgi-http', 'res-backend-python-asyncio'],
    },
    {
      id: 'cooperative-cancellation',
      title: '协作式取消需要清理边界',
      paragraphs: [
        'asyncio 的取消通过向 Task 注入 CancelledError 协作传播。代码只有在 await 等可取消点才有机会响应；CPU 密集循环、阻塞库或吞掉异常的宽泛捕获会推迟甚至破坏取消。应用应使用明确 timeout 和结构化并发，让子任务在父作用域结束时可被追踪，而不是创建无人持有的后台 Task。',
        '清理代码要保护真正需要完成的短临界区，例如归还连接、更新运行状态或释放租约，但不能无限 shield 整个模型调用。过度屏蔽会让超时失去意义，过早中断又可能留下“数据库记录仍是 running、实际工作已经停止”的幽灵任务。通常先记录取消意图，在 finally 中执行有界清理，再根据可证明结果提交 cancelled、failed 或 unknown。',
        '超时也是取消的一种来源，却应保留独立原因。客户端 deadline、网关空闲超时、服务总体预算和单次上游调用超时要逐层递减，为清理留出余量。日志至少包含 timeout_scope、elapsed、remaining_budget、cancel_origin 和 side_effect_state，便于判断是用户断线、容量保护还是依赖超时触发终止。',
      ],
      keyPoints: ['取消依赖可取消点和正确的异常传播', '为清理留出有界预算并保存取消原因'],
      sourceIds: ['res-backend-python-asyncio', 'res-backend-asgi-http'],
    },
    {
      id: 'stream-observability',
      title: '用事件日志验证完整生命周期',
      paragraphs: [
        '流式服务至少观察请求数、建立失败、活跃连接、TTFT、事件间隔、完整时长、每种终态计数、客户端断线和上游取消结果。TTFT 只描述首个有意义增量到达时间，不能替代总延迟和成功率；平均时长也会隐藏少数卡住的流。指标需要按阶段拆解等待、模型首 token 和网络发送时间。',
        '结构化日志应沿 requestId、runId 和 traceId 关联，但不要把完整 prompt、token 或用户身份直接作为日志字段和指标标签。事件 sequence、最后发送序号、最后持久序号与终态可以帮助回答“客户端看到多少、服务生成多少、最终保存多少”。这些事实比一个笼统的 connection reset 错误更适合故障诊断和用户申诉。',
        '测试需要覆盖正常完成、上游在首事件前失败、发送若干 delta 后失败、客户端慢读、客户端断线、取消与完成竞争以及服务重启。每个场景都检查事件顺序只出现一次 created 和一个终态，delta 不在终态后出现，并比较数据库状态、外部调用和资源释放。只有故障注入能证明实现遵守协议，而不是只在 happy path 看起来流畅。',
      ],
      keyPoints: ['同时观察 TTFT、完整时长、终态和资源占用', '通过竞争与故障注入验证事件顺序和清理'],
      sourceIds: ['res-backend-openai-streaming', 'res-backend-fastapi-sse', 'res-backend-python-asyncio'],
    },
    {
      id: 'client-contract',
      title: '客户端也要实现确定状态机',
      paragraphs: [
        '客户端解析器要按事件边界增量读取，校验 runId 与 sequence，并把未知事件作为可记录但不致崩溃的扩展。UI 可以逐步展示 delta，却只在唯一终态后开放“已完成”操作；连接自然结束但未见终态时应显示结果待确认，并通过 job 查询恢复，而不是擅自把部分文本保存成成功报告。',
        '重连策略要限制次数和总时间，携带最后确认位置，并识别服务是否支持重放。若无法重放，客户端清空临时增量后查询权威快照；若可以重放，则对重复 sequence 去重并检查缺口。这样网络层的自动恢复不会掩盖业务事件遗漏，也不会把同一段内容追加两次。',
        '前后端契约测试应输入被拆分在任意字节位置的事件、多个 data 行、心跳、未知类型、重复序号、缺失终态和错误终态。服务端与客户端共同通过这些样例，才能证明 wire format 与业务状态兼容。只用浏览器手动观看顺畅输出，无法覆盖代理、分包和竞争条件。',
      ],
      keyPoints: ['客户端只以明确业务终态确认完成', '用分包、重复和缺口样例做双向契约测试'],
      sourceIds: ['res-backend-whatwg-sse', 'res-backend-fastapi-sse'],
    },
  ],
  misconceptions: [
    { claim: 'SSE 连接返回 200 就表示任务成功。', correction: '200 只建立流；必须收到 completed、error 或 cancelled 等明确业务终态。' },
    { claim: '浏览器断线会自动停止所有模型计算。', correction: '断线只提供连接信号，本地协程、远端请求和已提交副作用需要分别确认。' },
    { claim: '捕获所有异常能让流更稳定。', correction: '宽泛捕获可能吞掉 CancelledError，导致 deadline 和资源清理语义失效。' },
    { claim: 'SSE 的 Last-Event-ID 自动提供可靠重放。', correction: '只有服务持久化事件并实现窗口、顺序和去重协议时才能恢复业务增量。' },
    { claim: 'TTFT 低就代表流式体验一定好。', correction: '首 token 快仍可能随后停顿或失败，必须同时观察间隔、终态、总时长和正确性。' },
  ],
  recap: [
    '流式连接和业务运行是两套相关但不同的状态。',
    '事件协议至少定义 created、delta、completed、error、cancelled。',
    'SSE 的线格式、重连和心跳都有明确边界。',
    '客户端断线、本地取消、远端工作和副作用不能混为一谈。',
    'asyncio 取消依赖可取消点、结构化并发和有界清理。',
    '故障注入应验证事件顺序、终态唯一性和资源释放。',
  ],
  nextStep: '实现一个最小流式端点：复用同一 run 状态机，按 sequence 发出 created、delta 和唯一终态，并记录 requestId、runId、最后发送序号与取消来源。然后分别模拟正常完成、第三个 delta 后上游报错、慢消费者和客户端断线，核对客户端事件、数据库终态、远端调用是否仍在运行以及连接资源是否释放。把差异整理成断线与取消策略表。',
  tests: {
    status: 'passed',
    commands: ['node --test tests/backend-engineering-data.test.js', 'npm test'],
    results: [
      { command: 'node --test tests/backend-engineering-data.test.js', exitCode: 0, summary: '9 项目标数据测试通过。' },
      { command: 'npm test', exitCode: 0, summary: '全量测试通过。' },
    ],
  },
});
