# 多 Agent 与 MCP 内容及图形审查

checkedAt：2026-09-18。审查对象为 `multi-agent-mcp` 的八课正文、16 道测验、24 道面试题、练习与完成条件、30 项来源，以及 16 组 Mermaid、静态 SVG 和图形说明。内容与图形审查通过：八课知识笔记为 93–96 分，16 图为 53–56 分，六项图形分数均不低于 8；目标检查为 8 项通过，当前没有未解决的内容或图形缺陷。

本次使用本地 `build-learning-module-notes` 的来源规则、数据要求和质量量表，重新阅读了 `AGENTS.md`。评审按实际可见的最终文件记录。正文、来源、考核及图形文字/XML 由本报告作者核对；`ma-04` 至 `ma-06` 同时属于本报告作者的编写范围，另由协作成员 `eval_research` 独立复验其规范、39 项考核对应关系和六图来源归属，结论为未发现缺陷，详见 [独立规格审查](2026-09-18-multi-agent-spec-review.md)。浏览器几何与交互检查由主代理执行，相关证据在下文单独标明。

## 来源读取与适用范围

全部课程来源均为原作者、官方项目或研究论文。MCP 主线固定为 `2026-07-28`，历史初始化仅解释 `2025-11-25`。这里的网页行号属于本次文字提取结果，网页更新后应结合小节名称定位。未使用搜索摘要充当机制证据，未读取或识别图片。

协议的 14 项资源及交叉核验材料详见 [MCP 协议来源研究记录](../research/2026-09-18-mcp-protocol-research.md)。该记录保存了 canonical URL、正文范围、版本以及上游材料之间的差异。本报告实际核对的课程用途如下。

| 来源 | 实际读取范围 | 支持的课程主张与限制 |
| --- | --- | --- |
| [Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) | 正文 20–113；角色、设计原则、能力 | Host 管理上下文和授权，Client 与 Server 一一连接；连接数量不能证明 Agent 数量。 |
| [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | 正文 25–676；目录、调用、schema、结果、错误、安全 | list 与 call 分开；annotations 需要信任判断；协议错误与工具 `isError` 分开。示例省略的必需 metadata 不能从课程报文中省略。 |
| [Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) | 正文 25–389；list/read、templates、URI、错误 | application-driven、URI 内容和具体读取操作；URI 形态不能证明物理文件存在。 |
| [Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts) | 正文 25–313；list/get、用户交互、消息、安全 | Server 编写模板，用户选择使用；取得消息不代表任务已经执行。 |
| [Base Protocol](https://modelcontextprotocol.io/specification/2026-07-28/basic) | 正文 25–349；消息、错误、无会话状态、schema、metadata | 当前每请求 metadata、活动 ID、结果类型及错误码；JSON-RPC ID 没有业务去重保证。 |
| [Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) | 正文 25–119；Modern、Legacy、Dual-era、extension | 按请求接受版本，`-32022` 与支持版本；旧版 handshake 单独适用。 |
| [Discovery](https://modelcontextprotocol.io/specification/2026-07-28/server/discover) | 正文 25–106；请求、结果、调用条件 | Server MUST 实现，Client MAY 调用；能力发现不提供业务许可。 |
| [旧版 Lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) | 正文 25–252；初始化至关闭 | `initialize` 与 `notifications/initialized` 的历史顺序；只适用于对应 revision。 |
| [stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio) | 正文 25–97 | 每行消息、stdout/stderr、取消和重启；日志输出不能单独判定失败。 |
| [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) | 正文 25–377 | POST、JSON/SSE、header/body 检查；当前版本没有旧会话及 SSE 恢复机制。 |
| [Cancellation](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/cancellation) | 正文 25–111 | transport 对应的取消方式、完成竞争、最大时限；取消不能证明已发生的业务动作被撤销。 |
| [Progress](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/progress) | 正文 25–90 | 活动 token 唯一、可选通知、递增数值；进度没有业务成功保证。 |
| [MRTR](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr) | 正文 25–231 | 三类适用操作、补充输入、新 request ID、不透明 `requestState` 及完整性要求。 |
| [Tasks Stable](https://tasks.extensions.modelcontextprotocol.io/specification/2026-07-28/tasks) | 正文 23–820；另读 [官方仓库](https://github.com/modelcontextprotocol/ext-tasks) Stable 表和 [发布 schema](https://github.com/modelcontextprotocol/ext-tasks/blob/main/schema/2026-07-28/schema.ts) 全文 | 当前可选 extension、flat result、`tasks/get` 的响应类型与 task 状态、工具错误、取消意图。没有宣称已验证某个 SDK 实现。 |

以下 16 项来源在全模块评审中直接打开相应正文。它们补足了协作、授权、安全和综合验收的证据。

| 来源 | 实际读取范围 | 适用主张与限制 |
| --- | --- | --- |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 正文 17–114；简单方案、workflow、routing、parallelization、orchestrator、evaluator | 从简单方案和明确任务结构出发；工程模式不指定通用 Agent 数量或 SDK 实现。 |
| [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | 正文 20–73、93–106；多条执行过程、委托说明、成本、结果文件 | 任务边界、专门上下文、返回证据及完整成本；原项目的增益和 token 用量不能外推为通用阈值。 |
| [OpenAI Orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration) | 官方文档工具返回的完整 Markdown；模式选择、handoffs、agents as tools | manager 保持最终回复责任与 specialist 接管后续交互的区别；仅用于解释该文档的模式定义。 |
| [LangChain Multi-agent](https://docs.langchain.com/oss/python/langchain/multi-agent/index) | 正文 23–51；适用条件、模式、上下文工程 | 多 Agent 的适用原因与单 Agent 基线；不同框架的术语仍需分别解释。 |
| [LangChain Subagents](https://docs.langchain.com/oss/python/langchain/multi-agent/subagents) | 正文 22–42、88–127、166–173、231–239、342–421 | subagent 默认调用状态、可选历史、持久状态、后台任务；后台工作与 Python `async` 分别说明。 |
| [LangChain Handoffs](https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs) | 正文 23–89、364–409；状态切换、上下文交接 | 该框架的 handoff 可通过状态切换实现；tool call 与回应成对保留，最小配对例子有无其他并行调用的前提。 |
| [LangGraph Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents) | 正文 564–731；orchestrator-worker 与 `Send` | 动态工作项、各 worker 状态及共享结果键；框架机制不能代替业务证据验收。 |
| [Towards a Science of Scaling Agent Systems v3](https://arxiv.org/html/2512.08296v3) | 页首版本为 2026-04-08；正文 101–144、349、525、600–638、868–874 | 260 个配置、六类基准、控制条件、样本范围和研究限制；不将论文中的数值写成普遍采用门槛。 |
| [MCP Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index) | 正文 30–291；适用范围、发现、resource、token、错误 | HTTP 授权、stdio 的 SHOULD NOT、audience 和 scope；授权为可选协议功能，凭据流程不等同于业务许可。 |
| [Authorization Server Discovery](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery) | 正文 25–62 | PRM、授权服务器列表、issuer 验证和凭据归属；发现地址不能证明已获授权。 |
| [Authorization Security Considerations](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations) | 正文 25–125 | audience、PKCE、redirect、代理按客户端同意、禁止 token passthrough；具体 token 不必采用 JWT。 |
| [MCP Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) | 正文 95–216、305–384；代理同意、token、状态句柄、本地 Server | 一键配置本地服务时显示完整命令并取得确认；本地进程仍由实际运行环境限制权限。 |
| [MCP Caching](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/caching) | 正文 25–134 | 缓存方法、参数、授权上下文、private、TTL 与失效；缓存新鲜度不能代替当前权限检查。 |
| [MCP Inspector](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector) | 正文 23–146；Web、CLI、TUI 和排查用途 | 可以取得接口交互证据；工具运行本身不能证明业务结果与安全要求通过。 |
| [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | 正文 7–54、61–73；风险与缓解 | 必要权限、高影响动作的人类控制、下游逐次策略验证；课程七条件交集属于原创应用策略。 |
| [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 正文 30–124、242–271；task/trial、trace/outcome、评分、隔离与负向案例 | 区分交互记录和最终环境，固定起始条件，结合多类评分；本次没有运行模型质量基准。 |

本次没有逐行阅读这些来源的全部导航、代码示例和附录。课程资源的 `access.body: 'partial'` 与这种按主张核对正文的方式一致。资源表含 30 项真实来源，没有把目标、题目或练习字段登记成来源；全部来源均在课程正文中使用。

## 内容结论与逐课评分

八课都有六个实质章节，2 项目标、2 道测验、3 道面试题、3 个练习步骤、1 项交付物和 2 项完成条件，共 104 项考核对应关系。逐条检查章节内容可以教会该项要求；来源在相应章节、课程资源集合及全局资源表均可解析。

评分按覆盖 25、结构 20、来源与不确定性 25、可读性 20、版权与数据结构 10 计。分数为基于量表的人工判断，不能解释为学习效果测量。正文汉字数仅统计 `sections[].paragraphs`，不计 introduction、标题、英文 identifier 和摘要，因此可直接说明正文厚度。

| 课程 | 正文汉字 / 最短一段汉字 | 分钟 | 覆盖 / 结构 / 来源 / 可读性 / 数据 | 总分 | 主要依据与保留范围 |
| --- | --- | --- | --- | --- | --- |
| ma-01 | 2463 / 112 | 27 | 24 / 18 / 23 / 18 / 10 | 93 | 从单 Agent 失败证据进入依赖关系和质量成本比较；明确多个角色、多个调用及多个 Agent 的区别。采用决定仍需学习者自己的基线数据。 |
| ma-02 | 2738 / 98 | 28 | 25 / 19 / 24 / 18 / 10 | 96 | 委托说明覆盖执行者、返回目标和回复责任，后台工作明确状态查询及失败负责人；五任务推演给出工作量 17、并行时长 13、共享写入时长 17，解释最长路径。全部数字属于公开教学输入。 |
| ma-03 | 2424 / 113 | 28 | 24 / 18 / 24 / 18 / 10 | 94 | 上下文输入包含来源、版本和状态时效；历史继承及持久状态为明确配置；消息配对有适用前提。accepted、needs-evidence、conflict 清楚标明为本地教学状态。 |
| ma-04 | 2513 / 86 | 27 | 24 / 19 / 24 / 18 / 10 | 95 | 角色责任和三类原语均有具体产物；list 与 call/read/get 分开，Prompt 作者与选择者分开。schema、目录和 annotations 均保留权限边界。 |
| ma-05 | 2524 / 81 | 29 | 25 / 18 / 24 / 17 / 10 | 94 | 完整解释必需 metadata、发现、版本与能力错误、MRTR 和历史 handshake；实验列出四类错误及 accepted。规范字段较密集，阅读需要反复查看例子。 |
| ma-06 | 2512 / 70 | 30 | 25 / 18 / 24 / 17 / 10 | 94 | 传输、协议、工具结果分层；进度、取消、幂等与 Tasks 使用不同证据。当前和旧版 Task 形态没有混用；状态内容较多，需要结合流程图阅读。 |
| ma-07 | 2470 / 101 | 28 | 24 / 18 / 24 / 18 / 10 | 94 | PRM、issuer、scope、audience、业务许可和委托范围分别说明；本地确认限定一键配置场景，stdio 建议级别准确。七条件实验只计算已给定事实。 |
| ma-08 | 2458 / 98 | 29 | 24 / 19 / 24 / 18 / 10 | 95 | task、trial、transcript、outcome 与综合验收关联；协议组合、权限案例、缓存隔离、完整成本和未知范围进入交付物。真实 SDK/Server 验收由学习者项目执行。 |

每课 4 项常见误解、5 项复习点及下一课衔接齐全。例子具有明确输入、选择及验收理由；没有复制外部文章的连续长文本，也没有把研究统计结果变成课程的通用保证。

`brokenReferenceCount: 0`；`coverageGaps: 0`；`courseFieldProvenanceViolations: 0`。来源角色均与实际用途相符，关键考核没有仅凭摘要或未标注的模型记忆回答。当前未发现需要阻止内容验收的缺陷。

## 协议和安全表述的核对结论

- `2026-07-28` 的请求各自携带协议版本与客户端能力；空能力对象与缺少该字段分别判断。`server/discover` 的 Server MUST 与 Client MAY 没有混写。
- 缺失 metadata、版本不支持、header 不一致、所需能力缺失分别对应 `-32602`、`-32022`、`-32020`、`-32021`。请求实验明确限定已公开的教学检查项，没有宣称完整 parser 或 SDK。
- `2025-11-25` 的 initialize 顺序在独立兼容内容中出现。遇到现代错误后修正当前请求的说明，可以防止仅凭 HTTP 400 就采用旧版流程。
- MRTR 重试使用新的 JSON-RPC ID，`requestState` 原样传回并由 Server 保护完整性。JSON-RPC ID、taskId 和业务幂等键各有职责。
- Tasks 固定到 dated Stable 和发布 schema，采用 flat `CreateTaskResult`。`tasks/get` 的 `resultType: complete` 与 `status: working` 可以同时成立；完成的工具结果仍可为 `isError: true`。取消 ack 只表达取消意图被接收。
- 授权部分准确保留 OPTIONAL、SHOULD NOT 及一键本地配置的 MUST 范围。stdio 教学分支将 HTTP audience 和 scope 检查标为不适用，同时继续检查身份、用户、委托、资源和动作确认。
- 上游首页初始化措辞、Tasks 页面中的旧错误码与嵌套字段说明，均已记录为资料差异；课程以具体 dated 正文及发布类型为准。subscription 主动结束的文字差异没有成为单一答案考点。

## Mermaid、SVG 与长描述的一致性

16 组图形均逐项比较关系源码、SVG 的 text/path/包含位置和 `longDescription`。SVG 为人工静态呈现，未宣称由 Mermaid 自动生成。没有要求二者采用相同坐标；核对的是角色、方向、分支、数量、状态与结论相同。

| 图形 | 三种表达共同说明的关系 | 教学与准确性证据 |
| --- | --- | --- |
| ma-01-overview | 基线、依赖、质量成本、采用决定 | 四个决策阶段的顺序相同，采用条件依赖证据。 |
| ma-01-detail | 准备后的两项只读工作汇总，再读取当前状态并确认写入 | 并行分支与后续动作分别表达，写入保留前置条件。 |
| ma-02-overview | manager 工具委托回到 manager；handoff 后 specialist 承担后续交互 | 两条路线具有不同的控制和最终回复责任。 |
| ma-02-detail | 五任务依赖，串行 17、并行 13、共享写入 17 | 时长和依赖与确定性计算输入相同，没有把工作量与时长混为一项。 |
| ma-03-overview | 任务事实与版本经过上下文选择交给 worker，再返回证据 | 输入范围和结果验收都有明确位置，隔离并未删除任务所需信息。 |
| ma-03-detail | 缺证据、来源冲突、满足要求分别进入三个本地验收状态 | completed 没有直接等于 accepted，状态的教学用途已说明。 |
| ma-04-overview | Host 包含上下文控制及两个 Client，分别连接两个 Server | 包含关系与一一连接共同说明职责；连接数没有变成 Agent 数量。 |
| ma-04-detail | 三类原语分别从 list 进入 call、read、get | 三行的控制主体、方法和产物一致；发现后仍需要具体操作。 |
| ma-05-overview | 单条请求的 metadata 进入 Server 检查，按条件区分错误 | 完整字段在正文提供，图形显示主要条件；不把能力声明写成授权。 |
| ma-05-detail | 现代可选发现和直接请求，与旧版 initialize 顺序并列 | revision 标签和 optional 路线明确，现代错误有对应处理说明。 |
| ma-06-overview | HTTP 传输、JSON-RPC、工具结果三类失败 | 各层检查的字段独立，一个层次的成功无法证明业务成功。 |
| ma-06-detail | task 创建、查询、补充输入、终态与取消意图 | flat 创建结果和查询响应状态分开；取消 ack 没有直接连接为停止证明。 |
| ma-07-overview | 用户许可、host 委托、服务身份、执行端动作和资源检查 | capabilities 与外部材料以辅助输入显示，没有授予执行许可的箭头。 |
| ma-07-detail | 五组区域展示七项独立条件，全部适用条件共同决定结果 | audience 与 scope 在 stdio 中同时标为不适用，其余执行条件继续有效。 |
| ma-08-overview | 协作、协议、权限、质量成本四组证据进入验收包 | 每组都对应正文产物，缺少一组不会被其他成功结论替代。 |
| ma-08-detail | 相同 URI 在两个身份下使用各自 private 缓存 | private 缓存与授权上下文关联，跨用户复用为禁止关系，TTL 单独说明。 |

全部图形为 `original-synthesis`，`permission: null`，来源用于事实核验。无第三方图像复制、下载、外链或许可推断。16 项来源集合均属于唯一证据所属章节；每课两图的位置真实存在，章节图为 `afterParagraph: 1`。16 项长描述均按可阅读顺序说明复杂关系，最短也有 120 个汉字。

静态检查通过 `assertSafeStaticSvg`；16 个 SVG 均为 1120×660，具有可访问标题和描述，没有脚本、事件、`foreignObject`、外部样式或远程引用。XML 阅读检查覆盖全部文件的文字及关系定义。

主代理在真实浏览器执行 Mermaid 12.0.0 `parse`，16 份源码均通过。主代理逐个加载 16 份 SVG，用原生 `text.getBBox()` 验证全部文字位于 1120×660 内，并逐对检查文字矩形；交叠宽和高均大于 1px 的文字交叠为 0。控制台 error 和 warn 为 0。此证据来自 DOM 与原生几何数据，没有使用截图或图像识别。

## 可访问性、响应式与失图范围

`src/ui/knowledge-visual.js` 提供语义化 figure/figcaption、独立 alt、图注、可展开长描述和本地原图链接。每个图形浏览区域具有名称、`role: region` 和 `tabindex: 0`。16 张图都为静态 diagram，没有需要学习者操作的逐步动画按钮。`styles/app.css` 对图形容器使用局部水平滚动，390px 及以下保留可读宽度和滚动提示。

主代理在无缓存的本地 4175 服务上完成真实浏览器 42 页检查：三个视口分别检查 6 个应用视图与 8 课。数值如下，`document.scrollWidth` 均未超过相应视口；每页恰有一个 h1。

| 视口宽度 | document.scrollWidth | 图形区域宽度 / 图形内容宽度 | 结果 |
| --- | --- | --- | --- |
| 1440px | 1425px | 桌面布局 | 页面无横向溢出。 |
| 390px | 375px | 278px / 720px | 图形使用局部水平滚动，页面无横向溢出。 |
| 320px | 305px | 224px / 720px | 图形使用局部水平滚动，页面无横向溢出。 |

16 个图形区域的可访问名称、region 角色和焦点入口均通过检查。320px 页面实际按 ArrowRight 后，图形区域 `scrollLeft: 40`、`focus: true`、`outline: 3px solid`；长描述可展开，已加载 SVG 的 `naturalWidth: 1120`。实验 select、button、number 控件高度为 44–44.39px。以上由主代理操作真实 DOM 和键盘取得，本报告作者另读当前 renderer 与 CSS，确认对应属性和样式存在。

本次没有实际执行失图网络请求测试。代码检查确认：资源数据无效时显示文字诊断，图片 error 时隐藏图片并显示提示，图注和长描述仍保留。`prefers-reduced-motion: reduce` 规则取消图形及相关控件的 animation/transition；本次未模拟操作系统的 reduced-motion 设置。失图与减弱动态的结论限于上述 renderer 和样式检查。

图形分数按准确性、来源边界、教学价值、可访问性、响应式、失图与减弱动态六项各 10 分计。来源归属完整，记 10 分；响应式有三个真实视口和键盘证据，记 9 分；失图与减弱动态仅做代码检查，记 8 分。ma-05 两图、ma-06 状态图、ma-07 条件图的信息密度较高，可访问性记 8 分，并由顺序长描述提供完整阅读路径。其余各图的教学依据见上表。

| 图形 | 准确性 | 来源边界 | 教学价值 | 可访问性 | 响应式 | 失图与减弱动态 | 合计 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ma-01-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-01-detail | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-02-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-02-detail | 10 | 10 | 10 | 9 | 9 | 8 | 56 |
| ma-03-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-03-detail | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-04-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-04-detail | 10 | 10 | 9 | 9 | 9 | 8 | 55 |
| ma-05-overview | 9 | 10 | 9 | 8 | 9 | 8 | 53 |
| ma-05-detail | 9 | 10 | 9 | 8 | 9 | 8 | 53 |
| ma-06-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-06-detail | 9 | 10 | 9 | 8 | 9 | 8 | 53 |
| ma-07-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-07-detail | 9 | 10 | 9 | 8 | 9 | 8 | 53 |
| ma-08-overview | 9 | 10 | 9 | 9 | 9 | 8 | 54 |
| ma-08-detail | 9 | 10 | 9 | 9 | 9 | 8 | 54 |

`unresolvedVisualCount: 0`。图形没有以分数代替来源、许可、SVG 安全、文字替代或页面溢出等必要检查；这些项目均已按上述范围取得证据。

## 实际检查记录

`tests.status: passed`。本报告作者在最终课程文件可见后实际执行：

```sh
node --test tests/multi-agent-core.test.js tests/multi-agent-module.test.js tests/multi-agent-visuals.test.js
```

结果：8 项通过，0 项失败，退出码 0。覆盖调度依赖、并发上限、共享写入、非法任务图、协议四类错误、输入不变、权限交集、stdio 检查边界、八课课程数据和 16 份安全图形及归属。八份 `knowledgeNote.tests` 均含作者实际执行的通过记录。

`ma-04`、`ma-05`、`ma-06` 的 note、lesson、visual 数据文件共九份分别执行 `node --check`，退出码均为 0；补充 tests 字段后又对三份 note 执行同一语法检查，结果均为 0。只读 Node ESM 核对还确认 30 项资源、104 项考核对应关系和 16 个图形位置均可解析，图形来源没有超出所属章节。

文字规则检查使用以下命令，退出码 1 且无输出，表示未匹配到禁止用语：

```sh
rg -n '[\x{6808}\x{843d}\x{6b7b}\x{62c6}\x{504f}]|\x{5951}\x{7ea6}|\x{5bf9}\x{9f50}|\x{4e0d}\x{662f}.{0,90}\x{800c}\x{662f}|\x{8981}.{0,90}\x{800c}\x{4e0d}\x{662f}' src/data/multi-agent-notes src/data/multi-agent-lessons src/data/visuals/multi-agent assets/visuals/multi-agent-mcp docs/research/2026-09-18-mcp-protocol-research.md docs/content-audits/2026-09-18-multi-agent-content-review.md
```

本报告没有执行新的 mock，也没有修改共享运行逻辑或其他作者文件。全站回归、真实浏览器完整交互以及发布状态由主代理的最终验收记录说明。本次未执行真实 MCP Server/SDK 互通、OAuth 服务、远程 Tasks、模型质量评测、跨浏览器或屏幕阅读器测试；这些范围没有被记为通过。
