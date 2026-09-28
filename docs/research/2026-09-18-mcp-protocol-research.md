# MCP 协议来源研究记录

checkedAt：2026-09-18。用途：为第七模块 `multi-agent-mcp` 的 `ma-04`、`ma-05`、`ma-06` 提供协议证据、版本范围与考察建议。本记录只包含研究结果，课程内容与实验实现仍需后续分工。以下行号来自本次网页文字读取结果，后续页面更新可能改变行号；同时保留小节名便于复核。所有链接均为原规范或官方项目来源，未访问图像。

已重新阅读仓库 `AGENTS.md`，并使用本地 `build-learning-module-notes` 技能及其 `source-policy.md`、`data-contract.md`。本次未修改任何课程、共享数据、运行逻辑或已有研究文件。下列 `res-ma-*` 为协调后的候选登记名；本次尚未验证第七模块资源注册表。

## 一、截至核验日的版本边界

| 材料 | 版本与实际读取范围 | 支持的结论及限制 |
| --- | --- | --- |
| [Versioning](https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning) | 正文 25–54，Revisions、Feature States、Negotiation；原 `/specification/versioning` 重定向至此 | 官方明确 Current 为 `2026-07-28`。Current 可使用，并可继续接受兼容修改；Final 指过去完整版本；Draft 指尚未准备供使用的工作规范。日期标识表示最近一次不兼容变更日期，不能代替具体实现版本。 |
| [当前规范](https://modelcontextprotocol.io/specification/2026-07-28) | 正文 20–125；`/specification/latest` 重定向至此 | 当前主线使用 self-contained request 与 per-request capability negotiation。不能把旧版初始化规则直接用于当前版本。 |
| [Key Changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog) | 正文 21–97，Major changes、Minor changes、Deprecated | 相对 `2025-11-25`，当前版本移除 initialize handshake、protocol session、GET stream、SSE 恢复机制；引入 `server/discover`、MRTR 与独立 Tasks extension。变更摘要用于导航，具体行为以对应小节为准。 |
| [Draft 入口](https://modelcontextprotocol.io/specification/draft) | 正文 20–125 | 本次可读到与当前主线相似的说明，但入口名称仍为 draft；相似文字不证明两版本完全相同。未将 draft 用作课程机制的唯一证据。 |
| [Draft changelog](https://modelcontextprotocol.io/specification/draft/changelog) | 返回 0–16，仅导航 | 工具没有获得实质变更正文，因此不能宣称已完整比较未来变更。 |
| [Deprecated Features](https://modelcontextprotocol.io/specification/2026-07-28/deprecated) | 正文 20–42 | Roots、Sampling、Logging 自 `2026-07-28` 标记 Deprecated，仍属于规范；新实现 SHOULD NOT 采用。HTTP+SSE 自 `2025-03-26` 已弃用。Deprecated 与 Removed 应分别解释。 |

课程基线应明确写成“核验于 2026-09-18 的 MCP `2026-07-28`”。当前网页与 GitHub `main` 仍可能更新；本次没有固定仓库 commit SHA，也未验证任何 SDK 已实现全部当前要求。

## 二、角色与三类原语

### `res-ma-mcp-architecture`

来源：[Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 20–113，Core Components、Design Principles、Capability Negotiation。

Host 管理多个 Client，控制连接权限、用户授权、上下文聚合与模型协调；每个 Client 对应一个 Server。Server 可为本地进程或远程服务，提供有明确职责的能力。Host 控制跨 Server 信息传递，完整对话保留在 Host。当前请求各自携带版本与能力，连接身份不能承担对话身份的职责。这些是架构责任；协议无法自动证明应用已经实现安全隔离。

### `res-ma-mcp-tools`

来源：[Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–676，用户交互、Capabilities、list/call、MRTR、定义与 schema、结果、Stateful Tools、Error Handling、Security Considerations。

`tools/list` 发现工具，`tools/call` 通过名称和参数调用。Tools 设计为 model-controlled，具体 UI 仍由实现决定。Server 必须声明 `tools`；工具集合可随请求授权变化，不能依赖连接内的历史调用变化。`inputSchema` 描述参数，`outputSchema` 可约束 `structuredContent`；当前后者允许任何符合 schema 的 JSON 值。工具名称只在单个 Server 内唯一。Annotations 需要信任判断，不能直接充当执行授权。

限制：Stateful Tools 小节明确属于非规范性设计指导。调用图、schema 通过或 `isError: false` 都不足以证明业务目标正确；这些判断需要应用自己的验收。页面示例为简洁而省略部分 `_meta`，直接复制时仍需补齐当前必需字段。

### `res-ma-mcp-resources`

来源：[Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–389，用户交互、Capabilities、list/read/templates、订阅、URI、错误与安全。

Resources 提供上下文数据，由 URI 标识；Host 决定如何纳入上下文。`resources/list` 给出可用项，`resources/read` 读取内容，`resources/templates/list` 暴露参数化 URI。一次 read 可以返回多份内容。`file://` 可以表示文件式资源，无须对应真实物理文件。不存在的资源必须返回 `-32602`，不能用空 `contents` 表达；兼容旧 Server 时 Client SHOULD 接受旧码 `-32002`。

限制：列出资源不会自动读取内容；读取后的使用仍需权限与数据处理规则。Resources 的 application-driven 定位没有规定唯一 UI。URI 模板和目录式响应的实际范围由 Server 实现决定。

### `res-ma-mcp-prompts`

来源：[Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–313，用户交互、Capabilities、list/get、消息类型、错误、安全。

Prompts 为 Server 提供的结构化消息模板，设计上由用户选择使用。`prompts/list` 发现模板，`prompts/get` 提供参数并取回消息；user-controlled 说明选择使用的主体，模板内容仍由 Server 定义。非法名称、缺少必需参数建议返回 `-32602`。取回模板不等同于模型已经执行模板中的任务，内容也不能自动提升权限。

限制：具体交互模式允许实现自行选择。用户选择一个 Prompt，不能据此推断其中每一项数据访问与动作都已经获准。

## 三、当前请求、版本、能力与旧版生命周期

### `res-ma-mcp-basic`

来源：[Base Protocol Overview](https://modelcontextprotocol.io/specification/2026-07-28/basic)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–349，Messages、Error Codes、Statelessness、Schema、JSON Schema Usage、`_meta`。

请求 ID 必须为字符串或整数，不能为 null，也不能与尚未收到响应的本端请求重号；响应通过同一 ID 关联。Notification 没有 ID，接收方不发送响应。当前请求必须携带 `io.modelcontextprotocol/protocolVersion` 和 `io.modelcontextprotocol/clientCapabilities`；缺失返回 `-32602`，HTTP 使用 400。所需能力未声明使用 `-32021`。当前 Result 通过 `resultType` 区分形态；旧版本省略该字段时 Client 按 `complete` 处理。

限制：Client/Server 自报的名称和版本用于展示与诊断，不能承担安全凭据职责。JSON Schema 校验只检查指定结构与约束。JSON-RPC ID 用于报文关联，规范没有为它提供业务去重保证。

交叉来源：[JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)，JSON-RPC Working Group，2013-01-04 更新；实际读取正文 36–130 与消息示例。它定义 response 的 `result`、`error` 互斥及通用错误码。MCP 对 ID、参数、消息方向和传输另有限制，因此基础 JSON-RPC 允许的所有组合不能直接视为 MCP 合规行为。

### `res-ma-mcp-versioning`

来源：[Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–119，术语、版本协商、extension 协商、兼容矩阵。

Modern 指 `2026-07-28` 及之后的每请求模型；Legacy 指 `2025-11-25` 及以前的 handshake 模型；Dual-era 同时支持两者。Server 独立接受或拒绝每个请求。版本不支持时返回 `UnsupportedProtocolVersionError`，码为 `-32022`，`data.supported` 提供可选版本。Client 应从共同支持版本中选择，或报告没有兼容版本。Extensions 在 capabilities 的 `extensions` 中声明，双方支持不足时按 extension 的规则返回核心行为或错误。

限制：具体旧版探测依赖 transport。识别到 Modern 错误后应修正请求或重选版本；不能只看一个 HTTP 400 就认定需要旧版 initialize。课程要分别解释协议版本、SDK 版本与业务版本。

### `res-ma-mcp-discovery`

来源：[Discovery](https://modelcontextprotocol.io/specification/2026-07-28/server/discover)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–106，Request、Response、When to Call、Data Types。

Server 必须实现 `server/discover`，Client 可选择先调用它。结果汇集 `supportedVersions`、capabilities 与自报身份。Client 也能直接发送操作请求，再处理版本错误。stdio Dual-era Client SHOULD 先探测，以获得明确的新旧模式信息。

限制：发现能力不授予业务权限，也不证明工具调用已发生。返回的 `serverInfo` 属于自报信息，不能作为身份认证依据。

### `res-ma-mcp-legacy-lifecycle`

来源：[Lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)。发布方：Model Context Protocol。版本：`2025-11-25`，只用于兼容教学。实际读取：正文 25–252，Initialization、Version Negotiation、Capabilities、Operation、Shutdown、Timeouts、Errors。

该版要求先发送 `initialize`，交换版本、能力和实现信息；成功后 Client 发送 `notifications/initialized`，随后按已协商条件通信。若 Client 不支持 Server 回应的版本，SHOULD 断开。关闭采用 transport 机制，规范没有独立 shutdown RPC。

限制：这些顺序规则属于该旧版，不能作为 `2026-07-28` 的前置门槛。旧版 `tasks` capability、server-initiated request 与新版 Tasks extension、MRTR 必须使用各自版本的字段。

### `res-ma-mcp-mrtr`

来源：[Multi Round-Trip Requests](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–231，类型、适用请求、双方要求、错误与安全。

`tools/call`、`resources/read`、`prompts/get` 可返回 `InputRequiredResult`。Client 准备 `inputResponses` 后重发原操作，使用新的 JSON-RPC ID；若收到 `requestState`，重试时原样带回。Client 不解析或修改该字符串，也不能把它用到并行的其他操作。Server 只能请求 Client 已声明支持的输入类型，并须保护影响权限或业务逻辑的 `requestState` 完整性。

限制：基本 MRTR 的补充输入随原操作重试；任务执行中的输入走 `tasks/update`，两者路径不同。带签名和有效期仍不能单独保证一次性消费，业务需要该性质时要另行实现。

## 四、传输、错误、进度与取消

### `res-ma-mcp-stdio`

来源：[stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–97，消息通道、metadata、取消、关闭、意外退出、兼容探测。

Client 启动 Server 子进程，每行承载一条 JSON-RPC 消息。`stdout` 只能输出 MCP 消息，日志可写入 `stderr`；`stderr` 有文字不代表请求失败。当前 Server 不在 `stdout` 发送独立 JSON-RPC request。取消某个进行中请求使用带 request ID 的 `notifications/cancelled`，不能通过关闭共享通道只取消其中一个请求。进程重启后需要重新建立订阅。

限制：读懂 framing 不代表已完成真实进程互通。Legacy 探测应识别 Modern 错误、其他错误及超时，不能只绑定某一个旧错误码。

### `res-ma-mcp-http`

来源：[Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–377，消息收发、安全、取消、headers、校验及兼容。

每个请求独立 POST；Client 同时接受 JSON 与 SSE response。`MCP-Protocol-Version` 必须与 body 一致；`Mcp-Method` 必需，`tools/call`、`resources/read`、`prompts/get` 还需 `Mcp-Name`。对应值不一致或必需 header 无效时使用 HTTP 400 与 `HeaderMismatch`（`-32020`）。当前版本没有 protocol session、独立 GET stream 或 `Last-Event-ID` 恢复。关闭对应 SSE response stream 表达该请求的取消。

限制：同名 transport 在 `2025-03-26` 至 `2025-11-25` 的行为不同。请求失败后是否能安全重复执行仍取决于操作语义；新 JSON-RPC ID 不保证业务仅执行一次。Origin 校验、认证与逐次授权也各有职责。

### `res-ma-mcp-cancellation`

来源：[Cancellation](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/cancellation)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–111，transport 区别、超时、行为要求、竞争情况与错误。

取消只针对本端已发出且认为仍在进行的请求。HTTP 关闭 response stream，stdio 发送 notification。请求超时后 Client 应停止等待，并执行相应取消动作。收到 progress 可调整等待计时，但仍应有最大总时限。取消和完成可能交错，未知或已完成 ID 的取消可被忽略，Client 应忽略取消后到达的普通响应。

限制：取消信号不能证明动作尚未发生，也没有定义撤销业务副作用的操作。Server 主动结束 subscription 的消息要求在两个官方页面之间存在文字差异，见后文；暂不将这个细节设成单一正确答案。

### `res-ma-mcp-progress`

来源：[Progress](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/progress)。发布方：Model Context Protocol。版本：`2026-07-28`。实际读取：正文 25–90，token、通知字段、行为要求。

Client 通过 `_meta.progressToken` 选择接收进度。Token 为字符串或整数，在全部活动请求之间唯一。Server 可以不发通知；已发出的 progress 值必须持续增加，total 可以未知，完成后必须停止。Progress 表明某个操作的进展，不能直接作为业务成功或安全通过的证据。

限制：不能要求所有 Server 按固定频率报告，也不能总把 progress 当百分比。Tasks extension 使用自己的状态机制，当前 extension 明确不支持在 task 上使用 `notifications/progress`。

补充来源：[Subscriptions](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/subscriptions)，版本 `2026-07-28`；正文 25–145 已读。`subscriptions/listen` 先获得 acknowledgment，再接收明确选择的通知；通过 `io.modelcontextprotocol/subscriptionId` 关联。stdio 重连后重发 listen。该材料可支持区分变化订阅与单个请求进度，暂未分配独立资源 ID。

错误考察应区分三层：transport 的 HTTP 状态、JSON-RPC 的 `error`、工具结果内的 `isError`。未知 RPC method 为 `-32601`；未知工具名称属于 `tools/call` 参数问题，可返回 `-32602`；业务输入验证或 API 失败可通过工具结果 `isError: true` 表达。分类依据为 [Tools 的 Error Handling](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#error-handling) 与 [Base Protocol 的 Error Codes](https://modelcontextprotocol.io/specification/2026-07-28/basic#error-codes)。不能把所有失败都归为同一重试动作。

## 五、可选 Tasks 的稳定版与旧设计

### `res-ma-mcp-tasks`

首选来源：[Tasks `2026-07-28`](https://tasks.extensions.modelcontextprotocol.io/specification/2026-07-28/tasks)。发布方：Model Context Protocol 官方 Tasks extension。实际读取：正文 23–820，包括 capabilities、适用方法、result 形态、Task 状态、创建、polling、update、cancel、notifications、routing headers、错误与安全。

当前 extension 标识为 `io.modelcontextprotocol/tasks`，支持 `tools/call`。双方声明支持后，Server 可决定返回 `CreateTaskResult`；Client 必须同时处理普通结果和 task handle。创建结果为 flat `Result & Task`，使用 `resultType: "task"`。Server 必须先让任务可被查询，再返回 handle。`tasks/get` 返回 `resultType: "complete"` 及当前 task 状态；`input_required` 通过 `tasks/update` 提交输入。任务完成但工具返回 `isError: true` 时状态为 `completed`；JSON-RPC 执行错误对应 `failed`。

`tasks/cancel` 只确认收到取消意图，任务可能继续执行，ack 后状态也可能尚未变化。Task 查询与更新要逐次验证权限；taskId 具有长期关联作用，但不能代替这些权限检查。TTL 可以限制保存期，handle 不保证永久可用。

交叉来源及版本证据：

- [ext-tasks 官方仓库](https://github.com/modelcontextprotocol/ext-tasks)：README 正文 180–228 已读，schemas 表明确 `2026-07-28` 为 Stable、draft 为 Development，发布 schema 为不可变快照。
- [稳定 TypeScript schema](https://github.com/modelcontextprotocol/ext-tasks/blob/main/schema/2026-07-28/schema.ts)：通过 Raw 读取 0–327 全文，核对 flat `CreateTaskResult`、`GetTaskResult.resultType`、状态字段、`taskIds` 与 extension capability。
- [官方 Tasks 概览](https://modelcontextprotocol.io/extensions/tasks/overview)：正文 32–213 已读，说明终态和能力选择；正文明确 `completed`、`failed`、`cancelled` 为终态。
- [旧版 experimental Tasks](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks)：正文 68–319 已读，核对 experimental 声明、初始化能力、tool-level `execution.taskSupport`、请求 `task` 字段、`tasks/result` 及旧通知名。未阅读其全部后续实现要求。
- [Tasks draft](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks)：正文 23–568 已读，仅用于确认并行存在的 draft 路径；课程结论使用 dated Stable 正文。

限制：旧版 `tasks/result`、`tasks/list`、`ttl`、`pollInterval` 不能与当前 `tasks/get`、`tasks/update`、`ttlMs`、`pollIntervalMs` 混写。本次没有运行 Server、SDK、远程 job 或恢复流程，协议规范的承诺不能作为具体实现已通过验证的证据。

## 六、需要保留的官方材料差异

1. 当前规范首页 Extensions 仍有“during initialization”说明；当前 Versioning and Compatibility 正文与 Tasks Stable 正文明确定义每请求能力声明。课程采用后者，并把 initialize 留在旧版兼容内容中。
2. [Tasks extension 站点概览](https://tasks.extensions.modelcontextprotocol.io/) 正文 28–48 仍展示旧错误码 `-32003`；dated Stable 规范正文 68–87 与核心错误表使用 `-32021`。课程采用 `-32021`。
3. Tasks Stable 正文 269 仍使用 embedded task 与 `task.taskId` 的说法；同页类型、示例及 released schema 都将字段直接放在 result 内。课程采用 flat 结构，并避免照抄该句。
4. Cancellation 正文 25、74 要求 Server 结束 subscription 时发送 `notifications/cancelled`；Subscriptions 正文 123–145 则描述主动结束时 SHOULD 返回 completion result。课程可以解释两种消息，但在上游说明统一之前，不把主动关闭的唯一形态作为必答判断题。
5. 若工具页面示例省略当前必需 `_meta`，正文已明确这是为简洁而作的省略。教学报文应说明必需字段，不能把简化示例当成可以直接发送的完整请求。

## 七、建议课程范围与可考察行为

`ma-04` 可围绕角色与原语组织：让学习者分配 Host、Client、Server 的责任，选择 list/read/get/call 的正确行为，解释 Prompt 作者与选择使用者，识别跨 Server 工具重名，并说明能力发现与权限检查的关系。

`ma-05` 可围绕 self-contained request 组织：要求学习者逐次补齐 metadata，解释 `server/discover` 的 Server MUST 与 Client MAY，处理不支持版本和缺失能力，区分 Modern、Legacy、Dual-era，并正确处理 MRTR 的新 request ID 与 opaque `requestState`。

`ma-06` 可围绕运行行为组织：比较两种 transport、识别 header/body 问题、区分三层错误、处理 progress 与取消竞争，最后解释可选 Tasks。建议把 Tasks 放在独立小节，始终显示 extension 版本；完整 OAuth、复杂 schema 与所有兼容探测细节适合作为后续阅读。

适合确定性教学的范围是“输入条件与规范判定”。以下建议尚未实现，不产生虚构 Server 结果、性能数据或线上成功率。

| 输入条件或状态 | 可确定检查的行为 | 证据与边界 |
| --- | --- | --- |
| 版本、每请求能力、必需 metadata | 分类 `-32602`、`-32021`、`-32022`；没有共同版本时报告不兼容 | Basic、Versioning；业务授权仍需独立判断 |
| `server/discover` 返回结果、Modern error、其他错误或超时 | stdio Dual-era 探测的继续、修正或旧版回退 | Discovery、stdio；超时时长属于应用配置 |
| request ID、pending 集合、response ID、notification | 检查活动 ID 唯一、响应关联、notification 无响应 | Basic、JSON-RPC；不声称提供业务幂等 |
| header 与 body 中的 method、name、version | 检查缺失、不一致与 `HeaderMismatch` | Streamable HTTP；范围限于公开规范的 metadata 规则 |
| `input_required`、输入映射、`requestState` | 检查 MRTR 重试使用新 ID、原样带回状态、正确匹配输入 | MRTR；不解析真实认证资料或秘密 |
| progressToken、连续 progress、完成状态 | 检查 token 归属、递增和完成后停止 | Progress；允许 Server 全程不发通知 |
| transport、请求进行状态、取消后迟到响应 | 选择 HTTP 关闭 stream 或 stdio notification，显示取消与结果竞争 | Cancellation、stdio、HTTP；不推断业务副作用已撤销 |
| extension capability、Task 状态、`isError`、JSON-RPC error | 检查是否能接收 task handle，以及 `completed` 与 `failed` 的含义 | Tasks Stable 与 schema；cancel ack 后不能直接显示已停止 |

业务幂等属于应用设计。本次来源支持的事实是：JSON-RPC ID 负责消息关联，MRTR 重试须使用新 ID，取消可能晚于完成。由此得到的工程建议是：有写副作用的工具重试前应查询业务结果或使用独立业务幂等机制；实现可使用业务键、唯一约束及结果记录，并验证并发行为。这里没有把某个幂等字段写成 MCP 必需字段，也没有宣称取消能够撤销已经发送的消息、支付或数据变更。

## 八、访问与验证记录

部分 canonical 页面首次直接 open 返回工具内部错误，包括 versioning、prompts、subscriptions；随后从官方关联页面点击并按返回引用继续读取，已经得到上述正文范围。未将首次失败视为正文证据。核心 schema GitHub 页面仅打开到页面信息，未据此声称完整阅读其 3197 行；Tasks stable schema 已通过 Raw 全文阅读。未使用搜索摘要替代机制正文，未下载或访问图像。

`tests.status`：`not applicable`。原因：本阶段仅新增 Markdown 研究记录，未新增课程数据、协议代码、实验或测试数据，项目运行测试不适用于这份独立研究材料。`brokenReferenceCount`：`null`，候选 ID 尚未在本次任务中执行注册解析。课程正式编写前应由集成阶段注册来源，复核版本及章节引用，再执行相应课程与功能检查。

本记录的研究阶段已经完成。后续获分配 `ma-04`、`ma-05`、`ma-06` 的课程数据与原创图示，课程文件分别保存实际执行的检查记录；本节的测试说明限定于上述只读研究阶段。

## 九、三课原创图示的教学任务

以下图示均采用 `original-synthesis`，只根据已读规范表达关系，没有复制官方图片。每图同时提供 Mermaid 源码与手工编写的静态 SVG；两种形式表达相同事实，字号与坐标按本地安全属性检查，未使用截图。

| 图示 | 学习者的问题与考察结果 | 证据所属章节 | 图形优于连续文字的原因 |
| --- | --- | --- | --- |
| `visual-ma-04-overview` | 谁管理完整对话，两个 Client 分别连接谁；支撑角色目标与角色面试题 | `ma04-integration-roles` | 用包含关系显示 Host 的职责，用两条连接显示 Client 与 Server 一一对应 |
| `visual-ma-04-detail` | 目录发现以后用哪个方法取得什么产物；支撑资源读取测验与原语目录练习 | `ma04-discovery-to-use` | 三行并列展现 list、具体使用方法和产物，便于逐项比较 |
| `visual-ma-05-overview` | 单条请求应携带什么，缺少哪项会被拒绝；支撑 metadata 测验与核对实验 | `ma05-request-context` | 请求框和服务检查框形成直接关系，错误类别集中标在对应条件上 |
| `visual-ma-05-detail` | 当前请求与旧版初始化有哪些不同前提；支撑兼容测验和面试题 | `ma05-legacy-compatibility` | 按 revision 分成两条路线，并把 Modern 错误的处理规则放在共同说明区 |
| `visual-ma-06-overview` | 当前失败属于哪一层，接下来应读取什么证据；支撑错误分类目标与测验 | `ma06-layered-failures` | 并列列出传输、JSON-RPC 和工具结果，防止把一个成功字段误读成业务成功 |
| `visual-ma-06-detail` | Task 的查询响应、任务状态和取消确认分别说明什么；支撑 Tasks 测验与恢复表 | `ma06-tasks-extension` | 用有向关系显示创建、查询、补充输入与终态，并把取消确认与停止证明分开表达 |
