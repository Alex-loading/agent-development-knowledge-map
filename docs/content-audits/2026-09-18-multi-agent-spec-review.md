# 第七模块规格独立审查

审查日期：2026-09-18。审查者：`eval_research`。结论：本次范围内无未解决 blocker 或内容缺陷，可以进入本地课程集成验收。实际执行的三个目标测试文件全部通过，共 8 项；本报告不代表生产发布完成。

## 范围与方法

独立审查 `ma-04` 至 `ma-08` 的笔记、课程、面试题、coverage、10 张图形记录及对应 Mermaid/SVG，并核对共享资源表、课程聚合、请求核对和委托权限的真实计算与 UI 源码。`ma-01` 至 `ma-03` 由本审查者编写，因此不在本报告中自评；目标测试同时检查了全模块的数据与 16 张图的引用关系。

依据为本地模块设计、`build-learning-module-notes` 的 data-contract、source-policy 和 quality-rubric，以及本次实际访问的官方正文。审查使用文件文字、XML、纯函数执行和现有真实测试，没有新增 mock、读取图像或使用截图。注册与产品页面总验收由主代理负责。

## 规格核对结果

| 项目 | 当前结果 |
| --- | --- |
| 课程结构 | 五课各有 6 个 section、2 个 objectives、2 个 quiz、3 个 interviews、3 个练习步骤、2 个完成条件。 |
| 学习正文 | 每个 section 有 2–4 个正文字符串，每项至少 60 字符；各课有 introduction、nextStep、4 项误区和 5 项回顾。阅读时间为 27、29、30、28、29 分钟。 |
| 考核覆盖 | 共 65 条 coverage，字段集合完整且唯一；sectionId 有效，sourceIds 为 owner 的来源子集。正文提供题目判断、面试追问和交付步骤所需机制。 |
| 来源登记 | sourceId 缺失数 0；资源角色使用官方或学术依据，课程字段没有充当资料，未发现虚构引用或仅据摘要作出机制结论。 |
| 数据与审计 | 课程递归冻结；标识符唯一；五课 tests 均为 passed，并包含实际命令和退出码。 |
| 文字要求 | 对课程、笔记、图形、core 和 UI 的中文用语检查无命中；技术 identifier 保留英文原名。 |

正文字符统计只统计 `sections[].paragraphs[]` 中的中文字符，不计 introduction、keyPoints 或回顾：

| 课程 | 正文中文字符 | 最短正文字符串字符数 | coverage |
| --- | ---: | ---: | ---: |
| ma-04 | 2513 | 149 | 13 |
| ma-05 | 2524 | 151 | 13 |
| ma-06 | 2512 | 155 | 13 |
| ma-07 | 2470 | 161 | 13 |
| ma-08 | 2458 | 141 | 13 |

## 版本、机制与来源范围

下表为本次独立访问的关键正文范围。网页行号仅用于本次读取定位，小节名称和 dated URL 是后续复查入口；未声称已运行资料中的 SDK、OAuth 服务或 Inspector。

| 来源 | 实际读取范围 | 对课程的核对结论 |
| --- | --- | --- |
| [MCP Versioning](https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning) | 正文 25–54 | `2026-07-28` 为核验日 Current；日期标识、draft、历史版本和实际实现版本分别记录。 |
| [Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) | 正文 20–113 | ma-04 的 Host、Client、Server 责任和最少必要上下文准确；连接数量没有被写成 Agent 数量。 |
| [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | Tool 定义至 Security，238–676 | 工具同名范围、annotations 信任、任意 JSON structuredContent、schema、协议错误与 isError 的区分准确。 |
| [Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) 与 [Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts) | Resources 25–157；Prompts 25–313 | application-driven、user-controlled、目录与具体读取方法分别解释；模板作者、用户选择和动作许可没有混同。 |
| [Base Protocol](https://modelcontextprotocol.io/specification/2026-07-28/basic) | Messages、Statelessness、Schema、metadata，25–349 | ma-05 每请求两个必需 metadata、空能力对象、缺失字段错误及自报身份限制有正文支持。 |
| [Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) 与 [Discovery](https://modelcontextprotocol.io/specification/2026-07-28/server/discover) | 25–119；25–106 | `-32022`、共同支持版本、Server MUST 与 Client MAY、Modern/Legacy/Dual-era 的范围准确。 |
| [历史 Lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) | 25–171，Initialization、Version Negotiation、Capability Negotiation | `initialize` 和 `notifications/initialized` 明确用于历史 revision，没有成为当前版请求的统一前置条件。 |
| [stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio) 与 [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) | 25–97；25–376 | stdio 的共享通道与取消通知、HTTP 的独立 POST/SSE、header 一致性以及旧版 GET/session/恢复范围准确。HTTP 400 后继续检查正文。 |
| [MRTR](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr) | 25–223 | ma-05 的新 JSON-RPC ID、对应输入键、原样 requestState 及 Server 完整性检查准确，应用授权仍逐次验证。 |
| [Progress](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/progress) 与 [Cancellation](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/cancellation) | 25–90；25–111 | ma-06 保留可选进度、活动请求范围、最大时限、取消与完成竞争，以及业务副作用未知状态。 |
| [Tasks dated 规范](https://tasks.extensions.modelcontextprotocol.io/specification/2026-07-28/tasks)、[Stable schema](https://raw.githubusercontent.com/modelcontextprotocol/ext-tasks/main/schema/2026-07-28/schema.ts)、[官方仓库状态](https://github.com/modelcontextprotocol/ext-tasks) | 规范 23–313、336–506、632–814；schema 0–327；仓库 README 180–228 | ma-06 明确可选 Stable extension、当前 tools/call 范围和 flat handle。`tasks/get` 的 complete、任务 completed 可含工具 isError、failed 对应 JSON-RPC 错误及取消 ack 的限制均正确。 |
| [Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index)、[AS Discovery](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery)、[Authorization Security](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations) | 35–291；25–62；25–124 | ma-07 区分 HTTP 授权、stdio 的 SHOULD NOT、PRM、issuer、scope、resource 与 audience；没有把教学布尔输入写成真实认证。 |
| [Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) 与 [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | 95–205、327–384；7–81 | token passthrough、特定 confused deputy 条件和下游权限检查均有依据。本地完整命令展示与确认的规范要求已明确限于支持一键配置的 Client。 |
| [Caching](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/caching) 与 [Inspector](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector) | 25–134；27–146 | ma-08 的 private 授权上下文、TTL 与失效通知准确；Inspector 的接口证据没有被扩大为完整系统验收。 |

ma-08 的任务、trial、轨迹、环境 outcome 和完整成本比较同时回查已读的 [Anthropic evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) 与 [多 Agent 研究系统](https://www.anthropic.com/engineering/multi-agent-research-system) 正文。课程采用原创企业案例和验收模板，厂商比例没有充当普遍质量或预算门槛。

## 实验与课程一致性

`src/core/multi-agent.js:71` 的请求检查限定在给定字段：metadata、支持版本、HTTP 对应值与本次表单能力。UI 在 `src/ui/multi-agent-experiments.js:139` 明确日期版本、ASCII 教学工具名和部分校验范围。缺字段、版本不支持、header 不一致、缺能力分别产生 `-32602`、`-32022`、`-32020`、`-32021`；多个错误同时保留。stdio 分支不检查 HTTP header。

`src/core/multi-agent.js:93` 的权限规则为课程原创策略。HTTP 采用身份、用户动作、委托动作、租户、audience、scope 和 export 具体确认七项判断；stdio 将 audience/scope 标为不适用，同时保留其余业务检查。UI 在 `src/ui/multi-agent-experiments.js:184` 明确没有完成签名、issuer、时效或 OAuth 交互，MCP 也没有定义本面板的通用委托算法。

独立调用实际函数时，HTTP 多条件案例同时报告 delegation、resource、audience、confirmation 失败；相同 stdio 输入报告 delegation、resource、confirmation 失败，并将 audience/scope 标为不适用。动作错误的确认单独在 confirmation 层被拒绝。header 错误与能力缺失同时产生 `-32020` 和 `-32021`。这些行为与 ma-05、ma-07 的练习及 ma-08 的集成范围一致。

## 图形来源 owner

| visualId | 唯一 owner section | 核对结果 |
| --- | --- | --- |
| visual-ma-04-overview | ma04-integration-roles | Architecture 来源覆盖角色与上下文责任。 |
| visual-ma-04-detail | ma04-discovery-to-use | Tools、Resources、Prompts 来源覆盖三条目录与使用路径。 |
| visual-ma-05-overview | ma05-request-context | Basic、Versioning 覆盖 metadata 和三个错误条件。 |
| visual-ma-05-detail | ma05-legacy-compatibility | 历史 Lifecycle、当前版本、discover、stdio、HTTP 覆盖两条通信路线。 |
| visual-ma-06-overview | ma06-layered-failures | Basic、Tools、HTTP 覆盖三层结果。 |
| visual-ma-06-detail | ma06-tasks-extension | Tasks、Tools、Basic、Versioning 覆盖查询、输入、终态和取消含义。 |
| visual-ma-07-overview | ma07-authorization-layers | Architecture、Tools、Authorization、OWASP 支持应用责任说明。 |
| visual-ma-07-detail | ma07-delegation-policy | Authorization、Authorization Security、OWASP 支持权限交集教学策略的依据。 |
| visual-ma-08-overview | ma08-acceptance-model | Anthropic 两篇正文支持四组证据的原创组织方式。 |
| visual-ma-08-detail | ma08-isolation-cases | Caching 直接支持 private 上下文与 TTL 边界。 |

10 张图均有唯一 owner，所有 sourceIds 属于相应 section。overview 归属字段和 detail 的 afterParagraph 均有效。Mermaid 与 SVG 的文字、节点关系和状态结论一致；长描述按阅读顺序补足图中关系，没有只重复标题。素材为 original-synthesis，没有使用外部图片或待授权改编，permission 为 null 合理。目标测试还验证了全模块 16 个本地 SVG 的安全静态属性和关联源码。

本次规格审查的图形评分为准确性 9/10、来源边界 10/10、教学价值 9/10、文本可访问性 9/10。响应式页面、键盘操作及 fallback/reduced-motion 的完整评分由产品页面验收负责，本报告不据此推定 60 分发布评分。主代理另提供真实浏览器结果：16 份 Mermaid 经 Mermaid 12.0.0 parse，16 份 SVG 的 text.getBBox 均处于 1120×660 内，三个实验的正常、异常、stdio、重置焦点和 live region 检查通过，控制台无 error/warn；这些属于主代理执行的证据。

## 逐课 Rubric

分项依次对应目标与考核覆盖 25 分、知识结构 20 分、来源与不确定性 25 分、教学可读性 20 分、原创性与数据规范 10 分。

| 课程 | 覆盖 | 结构 | 来源 | 可读性 | 数据 | 总分 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ma-04 | 24 | 19 | 24 | 19 | 10 | 96 |
| ma-05 | 24 | 19 | 24 | 18 | 10 | 95 |
| ma-06 | 24 | 19 | 24 | 18 | 10 | 95 |
| ma-07 | 24 | 19 | 24 | 19 | 10 | 96 |
| ma-08 | 24 | 19 | 24 | 19 | 10 | 96 |

- ma-04：从连接责任进入原语选择、具体方法、schema 和信任，再以接入目录收束。考核涉及的角色数量、资源读取、同名工具及授权边界都有教学说明；字段与图形来源完整。连续案例可独立学习，完整请求样例仍由下一课承接。
- ma-05：两个必需字段、四类错误、discover 义务、Dual-era 路线和 MRTR 都有推理依据。兼容问题通过具体错误正文判断，实验范围清楚；术语和字段密度较高，学习者需要结合前后章节理解。
- ma-06：从失败层级进入通道、取消、幂等与可选 Tasks，覆盖了工具错误和协议错误的不同终态。恢复表保留已知与未知状态，来源冲突处采用 dated 类型定义和相应规范要求；任务相关术语较集中。
- ma-07：从身份与能力的区别进入发现、token 目标、委托交集和本地权限，完整覆盖正常与拒绝案例。七项真实计算有业务例子支撑，HTTP、stdio、一键配置及教学输入范围明确，考核与来源可以逐项追溯。
- ma-08：按用户结果组织四组证据，协议版本、真实接口、跨用户缓存、权限和完整成本共同形成验收包。练习要求记录未执行范围和回归责任；属于集成型内容，需要调用前七课的已有产物。

## 测试审计与结论范围

状态：passed。实际执行命令：

```text
node --test tests/multi-agent-core.test.js tests/multi-agent-module.test.js tests/multi-agent-visuals.test.js
```

结果：退出码 0，8 项通过，0 项失败。包含 6 项真实计算测试、全模块课程/coverage/资源/递归冻结检查和 16 图 owner/文件/安全 SVG 检查。补充的只读 Node 字符统计、XML 文字读取和中文用语检查也已执行；没有生成或修改测试替身。

未解决引用数 0，考核覆盖缺口 0，课程字段来源违规 0，证据角色违规 0，图形 owner 与来源问题 0。当前实现支持本报告范围内的规格通过结论。真实网络互通、SDK 支持、OAuth 服务、长期 Task 的实际恢复和生产部署仍需相应环境中的独立验证，课程正文与实验均保留了这些限制。
