# 第六模块：观测与发布资料核验

核验日期为 2026-09-18。本记录整理本次实际打开的官方文档、工程书原文和原项目课程。阅读范围指本次用于写作的具体章节，页面可以访问不代表已经审阅全部链接、代码、附录或图片。本文没有执行官方示例，也没有测试特定 OpenTelemetry SDK 的功能。课程使用原创企业知识助手案例和既有教学数据。

## Trace 和 context propagation

资源 `res-eval-otel-traces` 使用 [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/)。本次读过 trace 示例、Tracer、Exporter、Context Propagation、Spans、Span Context、Attributes、Events、Links、Status 和 Kind，网页文本提取位置约为 864–1119。页面显示最近修改日期为 2026-01-14。

正文支持以下机制：span 表示有起止时间的操作，trace ID 与 parent span ID 连接相关工作，event 表达有意义的时间点，span link 可保存异步工作之间的因果关系。课程据此让任务验收结果关联到运行证据，并另行检查答案正确性。操作记录本身不能证明业务目标已经完成。页面明确提醒示例 JSON 没有采用 OTLP/JSON 格式；其中历史属性也不能直接充当当前 HTTP semantic conventions 清单。

资源 `res-eval-otel-context` 使用 [OpenTelemetry Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)。本次读过 Context、Propagation、Example、Custom Context Propagation、Security best practices 和语言支持说明，文本提取位置约为 859–947。页面显示最近修改日期为 2026-08-10。

正文说明发送端向 carrier 注入上下文，接收端提取，默认使用 W3C TraceContext headers，并可通过 trace ID/span ID 关联日志。外部传入数据需要信任检查，向外部发送的上下文也需要审查；baggage 不应携带凭证、API key 或个人信息。课程把关联与授权分别验证：一个合法的 trace ID 无法证明读取企业文档的权限。具体 SDK 的自动传播范围需要按技术环境测试。

## Sampling 与总体计数

资源 `res-eval-otel-sampling` 使用 [OpenTelemetry Sampling](https://opentelemetry.io/docs/concepts/sampling/)。本次阅读 Terminology、Why sampling、When to sample、When not to sample、Head Sampling、Tail Sampling 与 Support，文本提取位置约为 857–954。页面显示最近修改日期为 2025-10-16。

head sampling 很早作出选择，无法依靠尚未发生的错误决定保留；tail sampling 可以使用整条或大部分 trace 的信息，但需要缓存、计算容量和维护。组合使用时，下游无法恢复上游已丢弃的记录，这是根据数据经过顺序作出的工程推论。按错误条件保存的集合适合调查故障；若要描述全部尝试，还需要可信的总体计数及明确的采样方法。

课程实验沿用六条既有教学 trace。all 包含两个错误和六条记录；固定选择第 1、4 条时是零个错误、两条记录；errors-only 是两个错误、两条记录。实验使用固定选择规则，未实现概率抽样、OpenTelemetry SDK、等待窗口或实际 tail sampler。这些比例仅描述已知集合，不能成为线上质量估计。

资源 `res-eval-prometheus` 使用 [Prometheus Instrumentation](https://prometheus.io/docs/practices/instrumentation/)。本次打开并读过 Online-serving systems、Failures、Use labels、Do not overuse labels 及指标类型说明，文本提取位置约为 85–172。它支持同时计数请求与错误、保持计数时点一致，并解释每个 label set 都增加时间序列的资源开销。

课程采用受控发布组作为聚合维度，把精确运行身份和不断增加的版本 hash 留在日志及 trace。标签选择仍需根据系统规模验证；文档所举基数、流量和资源规模均有具体条件，课程没有把它们变成统一门槛。

## GenAI semantic conventions 的当前范围

资源 `res-eval-otel-genai` 的主地址是 [Semantic conventions for generative client AI spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)。本次读过开头、Inference 属性和 Capturing instructions, inputs, and outputs，文本提取位置约为 192–239、1249–1305。

本次还打开了 [GenAI conventions index](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md) 的正文，以及 [GenAI agent and framework spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md) 中 create/invoke agent 的说明和属性，后者阅读位置约为 192–359。三份文档均标注 Development。没有审阅全部 provider-specific conventions，也没有验证各语言 instrumentation 是否实现全部字段。

[旧主站 GenAI 地址](https://opentelemetry.io/docs/specs/semconv/gen-ai/) 明确说明内容已迁移，原位置停止维护。因此课程链接采用新官方仓库，并保留核验日期。该仓库 main 会变化；生产接入需要固定版本并检查实际导出结果。

当前 model span 文档以调用者看到的逻辑操作为范围，包含自动重试。指令、输入和输出默认不捕获；显式 opt-in 可记录内容，也可把内容另存并在 span 保存引用，用独立访问控制保护正文。课程的 modelVersion、promptVersion 与 taskOutcome 是应用教学字段，不能视为官方标准属性。

本次阅读的 [Definitions of Document Statuses](https://opentelemetry.io/docs/specs/otel/document-status/) 说明状态只适用于对应文档。Development 表示仍可能缺少内容、接口可能频繁变化、组件可能无预告移除；官方还写明此阶段不宜用于生产。GenAI 草案里的生产内容存储建议可以帮助设计，具体实现仍需版本验证。该状态不能推广到整个 OpenTelemetry 项目。

## 数据最小化与敏感信息

资源 `res-eval-otel-sensitive` 使用 [Handling sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/)。本次读过完整正文及配置示例，文本提取位置约为 855–940，包括 Your responsibility、Data minimization、删除与 hash、数据截短和 redaction。页面显示最近修改日期为 2026-01-14。

正文要求字段服务于明确的观测目的，个人信息只在必要时采集，并定期检查字段是否仍有用途。Collector 提供属性删除、过滤、允许清单和变换处理，但开发者仍需审查 instrumentation 实际收集的内容。小范围、可预测身份经过 hash 后仍可能被枚举反推。课程据此同时检查字段名称和字段值，使用受控引用减少正文复制，并要求说明访问、保留和删除范围。

这些技术措施没有提供通用法律合规认证或统一保留期限。数据进入 Collector 后才删除，无法证明它从未进入上游进程或传输路径。课程通过既有虚构数据检查输出，不使用真实企业正文和凭证。

## SLI、SLO 与 error budget

资源 `res-eval-sre-slos` 使用 Google 官方工程书的 [Implementing SLOs](https://sre.google/workbook/implementing-slos/)，作者为 Steven Thurgood、David Ferguson，Alex Hidalgo 与 Betsy Beyer 参与。它属于 2018 年《The Site Reliability Workbook》。

本次读过开头、Reliability Targets and Error Budgets、What to Measure、SLI specification 与 implementation、组件类型和 SLI 表、Getting Stakeholder Agreement、Error Budget Policy、文档要求及持续改进和决策说明，文本提取位置约为 37–160、250–363。没有逐项审阅全部高级专题和图表。

正文支持用 good events / total events 定义 SLI，并为目标指定时间窗口、测量方法和预算政策。课程因此把技术成功、任务合格和时延分开报告，记录未评分任务及测量位置遗漏的事件。课堂的 98/100、84/90 和十次未评分只用于说明分母，实际门槛须由业务确定。书中的四周窗口和 99.9% 等数值也保留其示例范围。

error budget 用于相应可靠性目标的取舍。课程对越权和泄漏另设禁止条件，质量加分不能取消已经确认的安全失败。这是本案例明确制定的发布政策，未宣称存在适用于所有 Agent 的统一阈值。

## Canary、shadow 与回滚

资源 `res-eval-sre-canary` 使用 [Canarying Releases](https://sre.google/workbook/canarying-releases/)，作者为 Alec Warner、Štěpán Davidovič，Alex Hidalgo、Betsy Beyer、Kyle Smith 和 Matt Duftler 参与。该文同属 2018 年《The Site Reliability Workbook》。

本次读过 canary 定义、Requirements、版本分组示例、风险模型、群体与持续时间、指标选择和归因、before/after 限制、共享依赖、指标窗口、Traffic Teeing 和脚注，文本提取位置约为 37–251。图片只阅读图注，没有进行图形细节审查。

正文把 canary 定义为局部且有时限的部署及评价。它要求划定候选与对照，选取有代表性的流量和持续时间，判断异常时暂停或回滚。共享依赖可能同时影响两组，指标窗口过长也会混入先前故障。因此课程同时检查组间差异和绝对目标；关键样本不足保持 hold，已经确认的安全失败触发 block。

Traffic Teeing 说明输入副本可能通过共享状态影响系统。课程据此把 shadow 的写工具和状态隔离列为前置条件，仅观察候选回复仍可能有真实写操作。书中简化的可用性模型在脚注明确排除 data leak；课程没有把低灰度比例视为泄漏许可。回滚代码无法取回已经发送的信息，这一结论来自对动作后果的工程分析。

## 事故复盘与离线证据

资源 `res-eval-sre-postmortem` 使用 [Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/)，作者为 John Lunney、Sue Lueder，编辑为 Gary O’ Connor。本次读过 postmortem 定义、触发条件、Blameless、review 与行动跟进，文本提取位置约为 51–122。

正文支持记录影响、缓解动作、相关原因和后续行动，并鼓励通过系统与流程改进减少复发。课程将行动写成负责人、完成条件和复验结果，并保留一个失败任务与一个合法对照。这个交付格式是课程综合设计；写出复盘文件本身不能证明修复已经完成。

资源 `res-eval-anthropic-evals` 使用 [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)，发布时间为 2026-01-09。本次用于第八课的范围包括独立 trial 环境、实际失败任务积累，以及自动评测、生产监控、人工检查和 A/B testing 的互补关系，重点阅读位置为 233–284、287–375。

资源 `res-eval-sklearn-leakage` 使用 [Common pitfalls: Data leakage](https://scikit-learn.org/stable/common_pitfalls.html)。本次读过 Data leakage 和 How to avoid data leakage，文本提取位置约为 120–141。该文的示例属于监督学习；课程仅使用测试信息不得参与拟合与选择的原则，说明 holdout 应与调优过程分开。它没有证明 Agent 私有测试集已排除所有污染。

## 中文原项目学习入口

本次实际打开 [Hello-Agents 第十二章：智能体性能评估](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter12/%E7%AC%AC%E5%8D%81%E4%BA%8C%E7%AB%A0%20%E6%99%BA%E8%83%BD%E4%BD%93%E6%80%A7%E8%83%BD%E8%AF%84%E4%BC%B0.md) 的中文正文，阅读开头、12.1.1–12.1.4 和 12.2 的 BFCL 引介与 AST 示例，文本提取位置约为 195–420。

它提供评估维度、BFCL/GAIA/数据生成质量的实践路线及项目代码入口，适合作为中文导航。章节固定 `hello-agents[evaluation]==0.2.7` 并提示依赖冲突；本次没有运行代码，也没有把 benchmark 数量、类别或匹配实现当成当前官方评测标准。机制和生产结论使用前述原始资料。

另一个候选 [JavaGuide AI 应用评测体系](https://javaguide.cn/ai/llm-basis/llm-evaluation.html) 在搜索中返回中文内容，但本次两次正文打开失败，其中一次报告 timeout。因此本记录只保留访问失败事实，不把搜索内容或旧核验日期当成本轮正文已读证据。

## 写作与验证记录

本次更新仅涉及 `eval-05.js`、`eval-08.js` 和本研究记录。两个课程文件各有六节，保留既有英文 identifier。overview 的证据 owner 分别是 `trace-evidence`、`release-evidence`；detail 的 owner 分别是 `sampling-bias`、`incident-feedback`。主代理负责共享资源、课程聚合与视觉资产，本次没有修改这些文件。

测试状态为 passed。执行命令为 `node --test tests/evals-module.test.js tests/evals-core.test.js tests/evals-visuals.test.js`，退出码为 0，共 9 项通过。测试检查课程结构、全部 coverage 路径、资源解析、采样分母与敏感属性排除，以及视觉资产和证据归属。`res-eval-otel-genai` 已在共享资源表注册，当前资源解析错误数量为 0。

用语检查覆盖两份课程文件和本记录。测试未执行真实线上流量、第三方 SDK 或部署流程；浏览器响应式与完整页面验收由主代理负责。本次没有作出发布完成声明。
