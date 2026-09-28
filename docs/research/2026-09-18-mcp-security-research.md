# MCP 安全与集成验收研究

核验日期：2026-09-18。范围为第七模块 `multi-agent-mcp` 的授权、执行权限与验收依据。已阅读本地模块技能、研究标准、知识笔记来源规则及模块设计。研究通过官方网页正文完成，未运行外部服务器、下载软件、获取凭据或执行攻击。以下候选 ID 由模块集成者登记；补充来源只承担注明的交叉核对作用。

## 版本结论

[Versioning](https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning) 正文 25–54 行标记 Current 为 `2026-07-28`，Draft 表示开发中且尚未准备供一般使用，Final 表示历史版本。日期版本反映最近一次不兼容变更，同一日期仍可接收兼容更新。本研究全部 MCP 核心结论使用 `2026-07-28` 路径，`checkedAt` 均为 `2026-09-18`。

当前版本采用每请求携带版本与能力的机制，旧版 `initialize` 生命周期需明确注明 `2025-11-25` 及以前的兼容范围。MCP 当前规范引用的 OAuth 2.1 文档本身仍为 IETF draft；这与 MCP 文档的 Current 状态属于两套版本概念。[draft Authorization](https://modelcontextprotocol.io/specification/draft/basic/authorization) 已读取 35–279 行，仅用于识别可变草案入口，不承担正式课程的独有结论。

## 核心来源

### res-ma-mcp-auth

- 标题与发布者：Authorization，Model Context Protocol。
- URL：https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index
- `bodyAccess: partial`；已读正文 35–272 行：Purpose、Requirements、Roles、Overview、Scope Selection、Authorization Response Validation、Resource Parameter、Access Tokens、Refresh、Scope Challenge。
- 版本与日期：`2026-07-28`；`checkedAt: 2026-09-18`。
- 支持：MCP 的授权功能可选；支持授权的 HTTP 实现 SHOULD 遵循本流程，stdio SHOULD NOT 使用此流程并从环境取得凭据。受保护服务器使用 OAuth 角色与 PRM；客户端在授权及 token 请求中携带目标 `resource`；服务器验证 token 面向自身，逐个 HTTP 请求携带授权信息。scope 表达许可范围，不能单独证明某条业务记录可访问。
- 限制：未规定完整的多 Agent 委托策略，也未统一要求所有本地 transport 启动 OAuth。OAuth 服务端实现及真实 token 验证不属于课程确定性计算器。当前 DCR 为可选且已 Deprecated，不能沿用旧版必需注册的表述。

### res-ma-mcp-auth-discovery

- 标题与发布者：Authorization Server Discovery，Model Context Protocol。
- URL：https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery
- `bodyAccess: full`；已读正文 25–62 行。
- 版本与日期：`2026-07-28`；`checkedAt: 2026-09-18`。
- 支持：客户端通过 `WWW-Authenticate` 的 `resource_metadata` 或 well-known 位置获取 Protected Resource Metadata（PRM）；MCP 要求其中的 `authorization_servers` 非空。读取 AS metadata 后验证 `issuer` 与用于发现的 issuer 完全一致；不同 AS 的注册、凭据和 token 分别管理。
- 限制：发现 URL 与 metadata 仍须验证；得到 metadata 不等于获得权限。多个 AS 之间的选择与组织信任规则由应用确定。

### res-ma-mcp-auth-security

- 标题与发布者：Authorization Security Considerations，Model Context Protocol。
- URL：https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations
- `bodyAccess: full`；已读正文 25–122 行。
- 版本与日期：`2026-07-28`；`checkedAt: 2026-09-18`。
- 支持：token audience 验证、禁止 token passthrough、PKCE、redirect URI 精确匹配、token 安全存储，以及代理使用静态上游 client ID 时的逐客户端用户同意。客户端必须验证所需 PKCE 支持；缺少相应 metadata 时不能假定支持。
- 限制：PKCE、audience 与 issuer 检查分别处理不同风险。标准流程通过仍需工具级、资源级业务访问控制。CIMD 对客户端的描述不能证明哪个本地进程持有 callback。

### res-ma-mcp-security

- 标题与发布者：Security Best Practices，Model Context Protocol。
- URL：https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices
- `bodyAccess: partial`；已读 Confused Deputy 95–181、Token Passthrough 186–216、SSRF 222–276、Local MCP Server Compromise 327–384、URL 与 stdio proxy 425–510 行。
- 版本与日期：文档路径 `2026-07-28`；`checkedAt: 2026-09-18`。
- 支持：上游已有 consent 不能代替每个 MCP 客户端的同意；错误接收并转发其他目标的 token 会破坏受众隔离。OAuth metadata 的外部 URL 需防 SSRF。支持一键配置本地服务的客户端须呈现完整命令与参数并获得确认；进程权限、文件和网络限制需要实际执行。stdio proxy 另有进程启动边界。
- 限制：该页为安全指导，不能据其宣称任意服务器已安全。直接 stdio 与代理启动场景需分别描述；读到的示例攻击命令未复现。HTTPS 本身无法消除全部 SSRF 风险。

## 接口、上下文与授权的补充依据

| 来源 | 正文范围、日期版本与支持主张 | 明确限制 |
| --- | --- | --- |
| [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | `bodyAccess: partial`；241–272、316–419、591–615、664–676；2026-07-28。annotations 在服务器不可信时须视为不可信；工具名只在单个服务器内唯一；输入、权限和结果需要验证。认证服务器的业务 handle 需逐请求检查身份。 | `readOnlyHint` 等描述不构成实际授权；结构化输出与 schema 验证不保证业务安全。该页没有替应用定义全部委托规则。 |
| [Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) | `bodyAccess: full`；25–389；2026-07-28。资源由应用选择使用；目录可按请求权限变化；URI 与路径需验证。内容 annotations 的 `audience` 表达预期阅读者。 | 内容 `audience` 与 OAuth token audience 含义不同；URI 存在或资源文本声称获批均不能证明业务授权。 |
| [Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture/index) | `bodyAccess: full`；20–113；2026-07-28。host 管理客户端、权限、用户同意及跨服务器上下文；每个 client 与一个 server 建立关系；服务器应只接触必要上下文。 | 这是角色责任与设计原则，实际隔离程度由实现决定；MCP 不定义完整多 Agent 权限委托协议。 |
| [Roots](https://modelcontextprotocol.io/specification/2026-07-28/client/roots) | `bodyAccess: full`；24–152；2026-07-28。Roots 已 Deprecated，提供相关文件范围的信息性提示；新实现 SHOULD NOT 采用。 | 协议不强制限制文件系统访问；Roots 列表不能充当 OS sandbox。课程只将其作为兼容边界说明。 |
| [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html) | `bodyAccess: partial`；§1–§3；2020-02，IETF Standards Track。`resource` 指定目标资源，scope 表达访问范围；audience 限制 token 的使用目标。 | RFC 中可选项与 MCP profile 的 MUST 要求须分别叙述；token 可为不透明格式，课程不假定全部 token 为 JWT。 |
| [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html) | `bodyAccess: partial`；§2、§3.3、§5、§7.6、§7.7、§7.10；2025-04，IETF Standards Track。PRM 身份须与预期资源匹配，外部发现地址需防 SSRF；metadata 缓存涉及新鲜度。 | RFC 把 `authorization_servers` 设为可选，MCP profile 进一步要求；metadata 仅描述服务，授权仍需后续流程与检查。 |
| [OWASP Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | `bodyAccess: partial`；定义、direct/indirect、风险与缓解正文；LLM01:2025。外部文档和工具内容可能携带改变模型行为的指令，需分隔内容与指令并限制权限。 | 提示分隔无法提供绝对防御保证，检测文本也不能代替执行权限。 |
| [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | `bodyAccess: partial`；7–81；LLM06:2025。受控或恶意 peer Agent 也可诱发越权；按用户上下文执行、最小权限、高影响动作确认、下游 complete mediation 可约束行动。 | 属于应用安全指导，不自动规定 MCP 的 wire format 或 delegation 字段。 |

本表来源的 `checkedAt` 均为 `2026-09-18`；发布者分别为 MCP 项目、IETF/RFC Editor、OWASP，正文已直接访问，来源类别为官方。Tools、Resources 等正式课程 ID 由共享登记表确定，不把本研究字段路径转换成来源 ID。

## 集成验收候选来源

### res-ma-mcp-caching

[Caching](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/caching)，MCP，`bodyAccess: full`，已读 25–134 行，版本 `2026-07-28`，`checkedAt: 2026-09-18`。缓存标识包含方法及影响结果的参数；多轮补充请求的结果不可缓存。`private` 缓存不能跨授权上下文复用，TTL 只提供新鲜度提示，相关通知可使缓存立即失效。服务器仍须按原语执行权限检查。适合验收“相同 URI、不同用户或 token”的隔离案例；课程无需自制通用缓存实现。

### res-ma-mcp-inspector

[MCP Inspector](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector)，MCP，`bodyAccess: full`，已读 27–146 行，版本化文档 `2026-07-28`，`checkedAt: 2026-09-18`。正文介绍用于测试和调试真实 MCP 服务器的 Web、CLI、TUI 客户端，以及各自后续文档入口。可用于学习者实际项目的工具导航。课程不固定安装命令或声称已运行 Inspector；工具连通、列出目录或成功执行一次调用均不足以完成业务、安全和成本验收。

### res-ma-anthropic-evals

[Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)，Anthropic，发布于 `2026-01-09`；`bodyAccess: partial`，已读 evaluation 结构 24–38、roadmap 230–283、综合评测 287–375，`checkedAt: 2026-09-18`。支持区分任务、trial、轨迹和环境 outcome；使用明确判定条件、正常与异常案例、独立初始环境，以及多类评分。适合解释为何验收须检查最终资源状态，并把真实失败加入回归。文章属于工程经验，不提供适用于所有应用的固定样本数、达标率或成本阈值。

## 可用于确定性教学的边界

1. **逐层许可计算。** 用课程自拟数据表示用户允许 `read/export`，受委托 worker 只有 `read`。逐项呈现应用确认的身份、用户权限、委托范围、资源租户、HTTP token 目标、scope 及具体确认的判断，最终取全部必需条件的交集。这是原创应用策略示例，MCP 无同名通用委托算法。
2. **HTTP 与 stdio 分支。** 同一业务请求在 HTTP 分支检查已给定的 audience 与 scope 判断，在 stdio 分支显示这两项不适用；两个分支均保留身份、用户、资源、委托及确认检查。教学输入为抽象事实，完整签名、issuer、时效、PKCE 与授权服务器交互由真实实现承担。
3. **确认绑定。** 对课程定义的 `export` 高影响动作，确认关联动作和资源；确认另一份文档不能许可当前导出。该具体字段设计是课程策略；资料支持敏感行动的明确确认与逐请求权限验证。
4. **不可信材料。** 检索资源、工具 annotations、peer Agent 的文字即使声称“管理员已同意”，也不自动改变 host 保存的权限状态。材料可成为业务证据，新的执行许可仍需可信的授权路径。
5. **集成验收。** 记录当前规范及 SDK 版本、transport、正常与拒绝案例、最终状态、成本和耗时；分别报告协议正确、权限正确与任务质量。缓存和多 Agent 共用材料时加入授权上下文隔离案例。预设教学计算通过只能证明该计算规则在指定输入上的表现。

## 访问限制与研究状态

`Client Best Practices` 的当前 HTML 与 Markdown 入口分别遇到访问失败和不受支持的内容类型；未将其纳入教学依据。当前 Prompts 与 Specification 总览 HTML 入口也未成功读取，未据此增加事实。Authorization 的可用正文入口为上文 `/index` 路径。其他条目按已读范围标为 full 或 partial，未将导航标题视为正文。

核心授权与权限主张已有 MCP 正文依据，跨 Agent 的应用安全主张由 OWASP 交叉核对。仍需实际产品决定的是租户与资源模型、敏感动作列表、确认有效期、下游身份传播及成本预算。研究未修改课程或共享入口；本研究阶段测试为 `not applicable`，原因是仅生成来源记录，不包含可执行实现。课程与图形另按实际执行命令记录审计。
