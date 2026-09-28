# 第七模块独立质量审查

日期：2026-09-18。审查者负责 ma-07、ma-08 的编写，本报告的内容评分只覆盖未参与编写的 ma-01、ma-02、ma-03；同时独立审查共享计算、实验 UI、测试数据、来源登记及图形浏览区域的可访问性改动。

## 结论与范围

共享计算和实验 UI 未发现阻断性缺陷。实际函数计算、8 项目标测试及相关 JavaScript 语法检查均通过。前三课的机制、案例、测验和面试内容均已在正文讲解，来源与图形 owner 引用可以解析。覆盖矩阵的章节定位有完整正文支持，当前没有待处理的内容或共享实现问题。

本次独立验证采用源码、原始资料正文、实际纯函数和静态资产检查，未采用替代 DOM 环境，未获取截图。主代理另行执行真实浏览器交互、响应式、键盘及进度检查；本报告不把这些检查表述为审查者本人执行。

## 课程内容评分

评分依据本地知识笔记 rubric 的 25/20/25/20/10 五类要求。最后一类以“版权与数据完整性”表述。

| 课程 | 目标、测验与面试覆盖 /25 | 结构与衔接 /20 | 来源与不确定性 /25 | 可读性与例子 /20 | 版权与数据完整性 /10 | 总分 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ma-01 | 24 | 19 | 24 | 19 | 10 | 96 |
| ma-02 | 25 | 19 | 24 | 19 | 10 | 97 |
| ma-03 | 25 | 19 | 24 | 19 | 10 | 97 |

- **ma-01：** 从单 Agent baseline 的具体失败进入依赖和共享状态，再比较全部参与者成本与等待时间。测验检查输入依赖和资源成本，面试延伸至适用范围；原创维修案例能支撑采用决策。论文只用于有条件的比较思路，没有把特定阈值或厂商效果比例推广为通用结论。正文 6 节、2463 个中文字符，最短正文单元 141 个字符。
- **ma-02：** 明确 OpenAI 的回复责任视角及 LangChain 的状态驱动范围，区分 manager-as-tools、handoff、固定并行与动态 workers。调度案例逐项得到 17、13、17，说明依赖下界、共享写入、总工作量和真实系统范围。后台执行与语言层 async 分别解释，委托与共享写入节分别包含练习要求的控制责任和失败去向。正文 6 节、2738 个中文字符，最短正文单元 145 个字符。
- **ma-03：** 区分默认 fresh state、显式历史输入与持久状态，讲清 ToolMessage 配对及无并行调用的示例前提。completed、JSON 结构和实际业务接受分开核验，示例保留来源版本、冲突、缺项与责任。返回格式练习由综合交接节支撑，包含完整返回样例与消息配对。正文 6 节、2424 个中文字符，最短正文单元 144 个字符。

三课合计 39 条 coverage、6 张原创图。所有 sourceIds 都在章节来源及共享登记中解析，图源为真实 owner 的子集，未把课程字段当作外部证据。图形语义依据为 Mermaid、SVG 文本及长描述；本报告不替代总审的浏览器可访问性与响应式评分。

## 共享实现审查

### 计算与教学输入

- `src/core/multi-agent.js:18` 的调度器检查任务数量、worker 数量、时长、重复 ID、缺失依赖及循环。就绪任务按 ID 确定顺序，遵守前置结果、worker 上限和同名写入互斥。返回的 criticalPath 是纯依赖下界，UI 明确指出它未包含共享资源等待；未声称一般任务图的最优调度。
- `src/core/multi-agent.js:71` 的请求核对器明确只检查给定字段，区分缺少 metadata、版本不支持、HTTP header 不一致和必要能力缺失。当前 Basic 正文确认 protocolVersion 与 clientCapabilities 必需，clientInfo 为建议字段；错误类别与读取的当前规范一致。stdio 分支不检查 HTTP headers。
- `src/core/multi-agent.js:93` 的权限计算独立保存身份、用户动作、委托动作、资源租户、audience、scope 及确认结果。全部适用项通过才允许；确认同时比较动作和资源。stdio 只令两项 HTTP token 检查不适用，身份及业务权限仍生效。
- `src/data/multi-agent-fixtures.js` 为递归冻结的教学输入。固定时长和授权事实没有伪装为真实模型测量或 OAuth 认证结果。核心函数不修改输入。

补充实际调用结果：错误确认动作被拒绝；组合输入在 HTTP 分支保留 identity、delegation、resource、audience、scope、confirmation 共 6 项失败，在 stdio 分支保留前述业务相关的 4 项失败并显示 2 项不适用。8 个 worker 的固定任务时长仍为 13。这些检查直接调用项目函数，无真实网络请求或系统副作用。

### 实验 UI 与共享图形组件

- `src/ui/multi-agent-experiments.js:43` 对空值、非整数及超出 1–8 范围的 worker 输入给出错误状态；有效输入直接使用计算结果。三个实验各自拥有独立控件、输出及重置路径，重置后更新结果并恢复焦点。
- `src/ui/multi-agent-experiments.js:27` 根据 `passed` 的 true、false、null 区分通过、未通过和不适用，各项失败独立显示。输出通过 DOM 工具的 textContent 与属性设置创建，没有把教学输入作为 HTML 执行。
- `src/ui/multi-agent-experiments.js:143` 的身份与资源条件可与导出动作、委托范围和确认组合，能呈现多个条件同时失败。界面明确注明真实认证、签名、issuer、时效及 OAuth 交互需要外部实现。
- `src/ui/knowledge-visual.js:338` 的共享改动为局部图形浏览区域添加命名 `region` 和 `tabindex=0`。来源校验、图片替代文字、错误 fallback、长描述与原图链接保持原有处理流程。代码审查与语法检查通过，键盘滚动及窄屏行为由主代理在真实浏览器核验。

### 来源登记

`src/data/multi-agent-resources.js` 的 30 个条目有稳定 ID、原始 URL、阅读范围、日期和限制说明。当前 MCP 与历史兼容范围分别描述；OAuth 2.1 的 draft 状态、one-click 本地配置前提、教学计算的授权边界均有明确说明。前三课使用的厂商经验、框架特定定义及论文结果保留适用范围。登记完整性通过目标测试；本次直接复读范围为下列正文，并未声称逐页重读全部 30 个条目。

### 数据测试执行范围

独立静态审查确认 `scripts/test-data.mjs` 当前选入 41 个测试文件，明确排除 8 个使用替代浏览器或存储的文件，以及 `primary-references.test.js`、`agent-mechanism-artifacts.test.js`、`backend-engineering-artifacts.test.js`、`context-rag-memory-artifacts.test.js`。后四份含来源采集替代实现或系统临时目录写入，不进入本次数据测试命令；相关真实资产单独运行 `--check`。`static-app.test.js` 的两项替代 `globalThis.document` 操作均在测试回调内，脚本按完整测试名称过滤；其余选入用例没有调用这些回调。

脚本在启动前检查 FakeDocument、installFakeDom、createFakeWindow、mock、fetchImpl、execFileImpl 与 tmpdir 标识，并设置 30 秒执行超时。子进程启动错误、终止信号和测试退出状态均传递为失败。当前选入集合的子进程调用使用真实 `xmllint` 与 Python XML 读取，未写入临时资产。此次审查只读取测试及辅助实现，并运行脚本语法检查；真实资产的一致性由单独的 `--check` 命令核验，UI 行为由真实浏览器记录支撑。

## 直接核对的正文

`checkedAt` 均为 2026-09-18。

| 正文 | 本次阅读范围与用途 |
| --- | --- |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 定义、何时使用、routing、parallelization、orchestrator-workers、停止条件；核对简单方案基线及模式差异。 |
| [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | 分工、委托输入、资源开销、评测、恢复与 artifact；核对原创案例依托的工程原则。 |
| [LangChain Multi-agent](https://docs.langchain.com/oss/python/langchain/multi-agent/index) | 适用性、上下文、模式选择及性能示例；确认数值示例未被泛化。 |
| [LangChain Subagents](https://docs.langchain.com/oss/python/langchain/multi-agent/subagents) | 同步/后台模式、输入、输出和 checkpointing；核对 fresh state 与显式历史。 |
| [LangChain Handoffs](https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs) | 状态变化、单 Agent 与多个子图、ToolMessage 及无并行调用的消息对前提。 |
| [LangGraph Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents) | Orchestrator-worker、Send、独立 worker state 与共享结果汇集。 |
| [OpenAI Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration) | Choose the orchestration pattern、handoffs、agents as tools；核对回复责任。 |
| [Scaling Agent Systems v3](https://arxiv.org/html/2512.08296v3) | 260 配置、任务依赖相关结果、Limitations；核对条件性结论，未复算论文统计。 |
| [MCP Basic 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic) | 错误码、无连接状态依赖、每请求字段 317–332；核对请求计算范围。 |
| [MCP Streamable HTTP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) | metadata headers、校验、取消与版本兼容；核对 transport 分支。 |

授权与安全正文的准确 URL、版本、阅读范围和限制另见 [MCP 安全研究](../research/2026-09-18-mcp-security-research.md)。

## 实际验证记录

- `node --test tests/multi-agent-core.test.js tests/multi-agent-module.test.js tests/multi-agent-visuals.test.js`：8/8 通过，退出码 0。
- `node --check src/core/multi-agent.js`、`node --check src/ui/multi-agent-experiments.js`、`node --check src/ui/knowledge-visual.js`：均退出 0。
- `node --check scripts/test-data.mjs`：退出 0；独立核对选入文件、文件排除集合、测试名称过滤及剩余子进程调用。
- 对 ma-01、ma-02、ma-03 的 notes 与 lessons 文件分别运行 `node --check`：6 个命令均退出 0。
- 直接导入真实数据核对中文字符、章节、正文长度与来源，未发现必填字段或引用缺失。固定输入的补充真实函数判断均通过。
- 主代理执行 `npm run test:data`：475/475 通过，失败与跳过均为 0，退出码 0；审查者直接读取 `.work/module7/final-data-tests.log` 核对数量。主代理另行执行 `check:context-visuals`、`check:agent-visuals`、`check:backend-visuals`、`check:evals-visuals`、`check:primary-references`，均报告退出 0，检查对象为现有真实资产。
- 主代理的真实浏览器检查覆盖三个实验的正常、拒绝、HTTP/stdio、重置焦点及 polite live region，并完成 42 页、资料筛选及跨模块隔离、测验、课程完成、面试掌握与队列、重新加载后的进度，以及取消和确认重置。测试数据已清理。320px 图形区域使用 ArrowRight 后 `scrollLeft=40`，焦点轮廓为 `3px solid`。上述结果由主代理执行，本报告明确其验证责任。

限制：没有把教学输入当作真实认证、网络协议或模型质量证明；未运行真实 MCP server 或 Inspector；图形键盘、响应式和进度行为由主代理的真实浏览器记录支撑。没有生产发布结论。
