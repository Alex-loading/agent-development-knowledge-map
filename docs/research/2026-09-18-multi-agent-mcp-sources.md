# 多 Agent 与 MCP 资料核验

核验日期：2026-09-18。课程资源表位于 `src/data/multi-agent-resources.js`，共 30 项；每项记录 HTTPS 地址、来源、使用章节、核对日期、正文读取范围和证据限制。所有资源均被课程正文引用。

## 资料范围

| 资料组 | 资源 ID | 课程用途与核对内容 |
| --- | --- | --- |
| Anthropic 编排经验 | `res-ma-effective-agents`、`res-ma-research-system` | workflow、路由、并行、动态工作项、委托说明、证据汇总及成本；结论保留任务背景 |
| OpenAI 编排 | `res-ma-openai-orchestration` | handoff 后的回复责任、agents as tools 的返回路径和专门 Agent 的使用条件 |
| LangChain 与 LangGraph | `res-ma-langchain-multi-agent`、`res-ma-langchain-subagents`、`res-ma-langchain-handoffs`、`res-ma-langgraph-workflows` | 模式选择、上下文输入输出、可选历史状态、交接实现与 Send 工作项 |
| 协作规模研究 | `res-ma-agent-scaling-science` | 2026-04-08 v3 的评测设计、260 个配置、六类基准、通信与错误传播、限制及 Appendix E.4 |
| MCP 接入 | `res-ma-mcp-architecture`、`res-ma-mcp-tools`、`res-ma-mcp-resources`、`res-ma-mcp-prompts` | Host、Client、Server；原语定位；目录与具体操作；schema、结果、annotations 和安全说明 |
| MCP 请求与版本 | `res-ma-mcp-basic`、`res-ma-mcp-versioning`、`res-ma-mcp-discovery` | JSON-RPC、每请求 metadata、版本选择、能力、错误码、server/discover 要求 |
| 历史兼容 | `res-ma-mcp-legacy-lifecycle` | 2025-11-25 initialize、initialized、能力协商与关闭；仅用于对应 revision |
| 传输与继续工作 | `res-ma-mcp-stdio`、`res-ma-mcp-http`、`res-ma-mcp-cancellation`、`res-ma-mcp-progress`、`res-ma-mcp-mrtr` | 消息边界、请求头、取消、进度通知、input_required 与 requestState |
| 可选长任务 | `res-ma-mcp-tasks` | 2026-07-28 Stable extension；创建、查询、补充输入、取消、状态与结果类型 |
| 授权 | `res-ma-mcp-auth`、`res-ma-mcp-auth-discovery`、`res-ma-mcp-auth-security` | HTTP 授权范围、Protected Resource Metadata、issuer、audience、scope、PKCE 与代理同意 |
| 执行与数据安全 | `res-ma-mcp-security`、`res-ma-mcp-caching`、`res-ma-owasp-agency` | 本地服务权限、不可信 URL 与内容、private 缓存身份、TTL、最小权限和逐次授权 |
| 综合验收 | `res-ma-mcp-inspector`、`res-ma-anthropic-evals` | Inspector 工具入口、task/trial/outcome、正常与异常案例及多类评分 |

每份卡片的 `access.body` 使用 `partial`，表达按课程主张读取对应正文范围；不声称逐行复核全部示例、导航与附录。主代理直接阅读支撑课程的原始正文，研究代理报告用于定位证据。研究记录分别见 [协作研究](2026-09-18-multi-agent-orchestration-research.md)、[协议研究](2026-09-18-mcp-protocol-research.md)、[安全研究](2026-09-18-mcp-security-research.md)。

## 版本与事实边界

- 主线固定 MCP **2026-07-28**。每个请求的 `params._meta` 包含 `protocolVersion` 与 `clientCapabilities`；空能力对象有效。`clientInfo` 按规范的建议程度讲解。
- Server 必须实现 `server/discover`；Client 可根据接入情况调用。每请求 metadata 提供解释当前请求所需的版本与能力。历史 `initialize` 流程按 2025-11-25 单独说明。
- 缺少必需 metadata 对应 `-32602`；版本不支持对应 `-32022`；所需客户端能力未声明对应 `-32021`；HTTP 指定请求头与正文不一致对应 `-32020`。实验仅验证明确列出的教学字段。
- Streamable HTTP 使用单个 POST endpoint 和 JSON/SSE 响应；当前取消、恢复语义按该 revision 讲解。消息 ID、requestState、taskId 和业务幂等分别承担自己的职责。
- MRTR 使用 `input_required`、`inputRequests`、`inputResponses` 和不透明 `requestState`；继续请求使用新的 JSON-RPC ID，并携带当前请求 metadata。业务敏感状态需要完整性、身份和期限检查。
- Tasks 为可选 Stable extension，当前支持 `tools/call`。课程依据日期固定的类型定义与示例解释直接位于结果中的 task 字段；查询响应的 `resultType` 和 task 的 `status` 分别读取。`tasks/cancel` 的成功响应表达接受取消请求。
- 协议能力、工具 annotations、发现目录、TTL 和用户授权分别判断。HTTP token 的目标、scope、用户资源许可与具体委托仍需执行端检查。
- 多 Agent 工程文章及论文提供限定任务与条件下的证据。课程不设通用 Agent 数量、性能增益、样本量或发布阈值。

上游概览页、历史内容和 extension 导航可能采用不同 revision。课程引用带日期的规范，并在研究记录中保存核对范围；未解决的表述差异不作为唯一正确答案的考点。

## 考核对应关系

`multiAgentMcp.coverageMatrix` 为八课分别维护 13 项对应关系，共 104 项：2 项学习目标、2 道测验、3 道面试题、3 个练习步骤、1 项交付物和 2 项完成条件。每项指向真实笔记章节及该章节的来源。资源与课程、面试题与课程双向连接；资源总入口按正文来源生成课程关联。

图形为原创关系表达，来源用于事实核验。16 份 `.mmd` 记录关系，16 份人工编写的静态 `.svg` 提供课程呈现，二者的语义需要共同审查；SVG 没有被声明为 Mermaid 自动生成产物。图形清单见 [对应关系与位置](2026-09-18-multi-agent-visual-inventory.md)。

## 实验证据范围

- 调度台实际运行确定性调度函数，校验依赖、worker 上限、共享写入和非法任务图。五项任务的时长属于公开教学输入。
- 请求台实际运行字段核对函数，展示输入对应的检查结果。完整网络协议与 JSON-RPC 解析需要真实 MCP 实现验证。
- 权限台实际计算应用策略，使用已给定的身份与 token 事实。真实认证、验签、issuer、时效和 OAuth 流程需要服务端实现与检查。

本次实现的验证对象为课程数据、计算、页面交互与图形。Inspector、真实 MCP Server、OAuth 服务与模型评测列入学习者项目的验收内容，未作为本次已经运行的系统陈述。
