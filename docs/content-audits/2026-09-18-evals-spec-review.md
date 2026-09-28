# 第六模块独立规格审查

审查日期：2026-09-18。本次范围内无待修复 blocker，未发现需要提交给作者处理的内容、数据引用或实验计算缺陷。eval-05 至 eval-08 的正文评分分别为 95、96、96、95，全部达到 85 分门槛。浏览器 DOM、站点回归和课程激活的实际结果见[课程与集成验收](2026-09-18-evals-observability-security.md)。

## 范围与依据

独立审查对象为 `src/data/evals-notes/eval-05.js` 至 `eval-08.js`、`src/data/evals-observability-security.js`、`src/core/evals.js`、`src/ui/evals-experiments.js`，以及 16 图的 placement、owner、sourceIds 和本地资产。审查者未编写后四课。本次未给审查者编写的 eval-01 至 eval-04 正文评分；聚合数据、实验行为及图形归属仍覆盖八课。

依据包括本地 design spec、模块规范与 release gates，以及 `build-learning-module-notes` 的 data-contract 和 quality-rubric。检查采用正文通读、官方来源正文复核、字段映射核对、纯函数实际调用和现有测试。没有新增 mock 测试，没有访问外部业务系统，没有截图或图像检查。

## 逐课评分

五类满分依次为：目标及考核覆盖 25、知识结构 20、来源与不确定性 25、教学可读性 20、版权与数据规范 10。正文字符数按 introduction、nextStep 与各 section 的 paragraphs 合计；它只用于结构检查，评分依据列在表后。

| 课程 | 覆盖 | 结构 | 来源 | 可读性 | 数据 | 总分 | 正文字符 | 阅读分钟 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| eval-05 | 24 | 19 | 24 | 18 | 10 | 95 | 3647 | 28 |
| eval-06 | 25 | 19 | 24 | 18 | 10 | 96 | 2768 | 27 |
| eval-07 | 25 | 19 | 24 | 18 | 10 | 96 | 2890 | 28 |
| eval-08 | 24 | 19 | 24 | 18 | 10 | 95 | 3414 | 29 |

- **eval-05**：六节从单次运行关联进入传播、总体指标、采样和数据最小化，足以解释两个测验、三道面试题及练习三项产物。`trace-evidence` 区分 span 完成与业务正确；`sampling-bias` 按六条数据计算三个保留集；`genai-conventions` 明示 Development、核验日期和 SDK 支持边界。`metrics-and-versions` 对高基数的说明完整，但学习者还需自行整理具体标签清单，因此覆盖和可读性保留一定分差。来源使用动态文档，已说明版本限制；后续维护仍需重新核对。对应正文见 [eval-05.js](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-05.js:18)。
- **eval-06**：`eval-action-authorization` 逐项教会 complete mediation、应用确认的身份、资源权限、实际参数与确认绑定，直接覆盖“确认 A 后改成 B”的测验。`eval-malicious-retrieval` 保留检测、动作提案和终态三类证据，并配正常对照；`eval-threat-exercise` 可以指导学习者生成允许与拒绝样例。六节顺序清晰，原理与原创规则有明确区分。工具参数和权限表主要由文字说明，读者仍需整理为表格；没有据此认定已完成真实系统的授权验证。对应正文见 [eval-06.js](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-06.js:32)。
- **eval-07**：`eval-safety-outcomes` 分别定义攻击成功、检测错误与正常误拒；`eval-regression-fixture` 的两攻击、四正常样本及四种开关组合与实际计算一致。HTML、SQL、文件路径和日志分别给出消费端检查理由，能够回答 JSON 格式正确为何仍需检查。没有把固定标签称为真实检测器，也没有把当前零副作用外推到所有攻击面。知识内容较密，完成输出去向检查清单需要复读前两课的权限与观测条件，因此可读性取 18。对应正文见 [eval-07.js](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-07.js:32)。
- **eval-08**：`shadow-isolation` 检查缓存、记忆和写工具；`canary-decisions` 使用同期对照、绝对 SLO 和独立安全停止条件；`sli-denominators` 的 98/100、84/90、10 条未知各自保留含义。`incident-feedback` 把时间线、事实与推断、负责人、验证条件及正常回归连到发布包。三个纸面发布决定具备所需原理；最终六类产物的组织由学习者完成，没有提供填好的完整发布包，因此覆盖取 24。来源实例与原创教学阈值区分清楚，未将书中 error budget 扩展为泄漏许可。对应正文见 [eval-08.js](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-notes/eval-08.js:29)。

四课均为 6 sections，每节 2 至 4 个 paragraphs 且每个至少 60 字符；均有 4 条 misconceptions、5 条 recap、introduction、nextStep 和有效 tests 审计。未发现长篇复制、HTML 或运行回调进入正文数据。

## 覆盖与聚合数据

模块包含 8 课、24 道面试题、22 份资源、108 条 coverageMatrix。后四课每课 13 条映射，覆盖 2 objectives、2 quiz、3 interviewQuestionIds、3 exercise.steps、exercise.deliverable 和 2 completionCriteria。逐项核对了答案解释、面试追问及练习要求所需的推理；没有只凭字段存在认定教学完成。

| 课程 | 考核内容对应的主要正文 section | 核查结果 |
| --- | --- | --- |
| eval-05 | trace-evidence、propagation-boundaries、metrics-and-versions、sampling-bias、genai-conventions、minimal-data | 跨队列因果关联、采样分母、版本字段、默认采集范围均有解释与实例 |
| eval-06 | eval-threat-model、eval-injection-path、eval-action-authorization、eval-minimum-capability、eval-malicious-retrieval、eval-threat-exercise | 内容来源与授权分离、参数改变后的确认、最小能力和正常对照均有教学支持 |
| eval-07 | eval-safety-outcomes、eval-safety-corpus、eval-output-consumers、eval-sensitive-logging、eval-regression-fixture、eval-security-release | 检测与结果计数、攻击预算、消费端检查和最小回归记录均有支持 |
| eval-08 | release-evidence、shadow-isolation、canary-decisions、sli-denominators、incident-feedback、delivery-evidence | 封存测试、Shadow、Canary、SLI 分母、停止条件与事故回归形成连续流程 |

资源均能从 lesson.resourceIds 解析到模块资源表，反向 lessonIds 正确；coverage sourceIds 均属于相应正文 section。聚合对象递归冻结。`brokenReferenceCount = 0`，`coverageGapCount = 0`，`courseFieldProvenanceViolationCount = 0`。课程目标和测验被用作考核范围，未被冒充外部资料。

## 实验实际行为

三个实验均使用现有固定教学数据，没有调用真实模型、OTel collector 或安全检测器。UI 的输入范围与纯函数前置检查分别承担界面反馈和数据验证；结果区域使用 aria-live，控件有明确 label，重置后恢复初始参数并将焦点交回首控件。以下计算已直接调用 `src/core/evals.js` 核对。

| 实验条件 | 实际结果 | 教学判断 |
| --- | --- | --- |
| 发布：候选与基线相同，每组最少 2，零容差、零关键失败 | pass；总体 5/6 → 5/6 | 当前教学规则允许继续 |
| 发布：修好 faq-d，同时 long-b 失败 | block；总体 5/6 → 5/6，长文档 2/2 → 1/2 | 总分无法覆盖切片退化 |
| 发布：同分，每组最少 3 | hold | 长文档只有 2 条，证据量不足 |
| 发布：上述样本不足，同时 criticalFailures = 1 | block | 已知关键失败优先 |
| 发布：候选全部 unknown | hold；已评分 0/6，rate 为 null | 未知保留独立状态 |
| 重复试验：单任务 p = 0.8，k = 3，独立同分布 | 至少一次 0.992；全部成功约 0.512 | 未进行显著性检验，也未计算跨任务估计 |
| 采样：all | 保留 6/6，样本错误率 2/6 | 全部教学数据可见 |
| 采样：head-demo | 保留第 1、4 条，2/6，样本错误率 0/2 | 固定选择只说明这些数据 |
| 采样：errors-only | 保留 2/6，样本错误率 2/2 | 总体教学错误率仍为 2/6 |

安全实验的分母为 2 条攻击和 4 条正常案例。真实作用范围限定为夹具中定义的越权动作。

| 分类器 | 执行端授权检查 | 检测 TP / FN / FP / TN | 正常误拒 | 越权副作用 | 攻击成功率 |
| --- | --- | --- | ---: | ---: | ---: |
| 开 | 关 | 1 / 1 / 1 / 3 | 1 | 1 | 1/2 |
| 开 | 开 | 1 / 1 / 1 / 3 | 1 | 0 | 0/2 |
| 关 | 开 | 0 / 2 / 0 / 4 | 0 | 0 | 0/2 |
| 关 | 关 | 0 / 2 / 0 / 4 | 0 | 2 | 2/2 |

采样结果仅保留 modelVersion、promptVersion、stage 三个属性及 trace 的有限基础字段；原始 prompt、output、token 未进入投影结果。正文与 UI 均说明属性名允许列表仍需配合值检查。安全实验保留固定标签范围；执行端阻止动作时，分类器 FN 继续计数。核心逻辑也检查空样本、重复 ID、不可比较案例、错误布尔值、无效数值和输入不变性。

## 16 图归属

每图出现一次；overview 由 overviewVisualSectionId 指定 owner，detail 由该 section 的 visuals 指定。所有 detail 的 afterParagraph 为 1，位置有效。每图 sourceIds 均属于 owner 的 sourceIds，也存在于 lesson 和模块资源表。图形来源均为 original-synthesis，本地 SVG 与当前 scene 的确定性输出一致；静态安全检查通过。

| lesson | overview owner | detail owner |
| --- | --- | --- |
| eval-01 | eval01-outcome-evidence | eval01-dataset-boundary |
| eval-02 | eval02-grader-routing | eval02-pairwise-bias |
| eval-03 | eval03-comparable-runs | eval03-slice-regression |
| eval-04 | eval04-end-to-end-map | eval04-quality-dimensions |
| eval-05 | trace-evidence | sampling-bias |
| eval-06 | eval-threat-model | eval-action-authorization |
| eval-07 | eval-safety-outcomes | eval-regression-fixture |
| eval-08 | release-evidence | incident-feedback |

visualId 采用 `visual-eval-NN-overview` 与 `visual-eval-NN-detail`。`unresolvedVisualCount = 0`。eval-03-detail 的 6 根柱形按实际 rate 计算宽度，source fixtures 的比例与标签一致。复杂图均有按顺序描述内容的 longDescription。未发现 script、foreignObject、事件属性或外部链接进入 SVG。图形的浏览器尺寸、键盘阅读与 fallback 属于集成 DOM 检查范围，本次不计算完整 60 分图形发布评分。

## 重点来源正文复核

以下均访问原始正文；核验日期为 2026-09-18。范围描述只覆盖实际用于本次判断的章节。没有使用网页摘要代替正文。

| 原始来源 | 实际读取范围与版本 | 支持范围及限制 |
| --- | --- | --- |
| [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/) | Spans、Span Context、Span Events、Span Links、Span Status | 支持工作单元、parent、事件及异步因果关联；业务成功由课程另行定义 |
| [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/) | Context、Propagation、Custom Context Propagation、Security best practices；页面标记 2026-08-10 更新 | 支持 inject/extract、外部 carrier 风险和 Baggage 最小化；不把 trace 身份当作业务授权 |
| [Sampling](https://opentelemetry.io/docs/concepts/sampling/) | Head Sampling、Tail Sampling、成本与联合使用；页面标记 2025-10-16 更新 | 支持决策时机和可见数据范围；教学固定选择不声称实现生产 sampler |
| [Handling sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/) | Your responsibility、Data minimization、Protecting sensitive data、hashing limitations | 支持采集最小化、允许属性与哈希限制；工具不替业务识别全部敏感值 |
| [GenAI spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)、[Agent spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md) | client 文档的 Status、Spans、Capturing instructions, inputs, and outputs；Agent 文档的 Status 与 Spans 引言；两个 main 正文均标记 Development | 支持逻辑调用包含自动重试、内容默认不采集、显式 opt-in 和外部内容引用；课程不承诺具体 SDK 已实现 |
| [Prometheus Instrumentation](https://prometheus.io/docs/practices/instrumentation/) | 在线服务、离线处理、Use labels、Do not overuse labels | 支持聚合指标与标签基数成本；课程未把文档中的经验数字设为统一产品阈值 |
| [OWASP Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | 2025 分类正文、Direct/Indirect、缓解措施与攻击实例 | 支持外部材料风险、最小权限、内容区分与持续测试；RAG 或 fine-tuning 不提供完整免疫 |
| [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | 2025 分类正文、功能/权限/自主程度、最小权限、用户审批、Complete mediation | 支持逐次下游授权检查；课程中的确认字段组合是明确标注的原创规则 |
| [OWASP Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/) | 2025 分类正文、HTML/SQL/路径实例、缓解措施 | 支持消费上下文校验、输出编码及参数化查询；格式检查无法单独完成权限判断 |
| [OWASP Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) | 2025 分类正文、Access Controls、数据源限制、清理与访问控制 | 支持任务所需数据访问范围；未据此声明通用隐私认证 |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | Data to exclude、Event collection、Verification、Protection | 支持敏感字段限制、CR/LF 与 delimiter 处理、日志访问及故障测试 |
| [Claude guardrails](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks) | Direct/Indirect prompt injection、结构区分、工具输出筛查、Red-team、Continuous monitoring | 支持可信任务与第三方材料分开处理及持续验证；产品接口建议未被外推为所有模型统一规则 |
| [How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) | 2026-05-25；风险类别、模型/环境/外部内容、containment patterns | 支持概率防护与可达能力边界各有职责，可信 connector 可读取有风险内容；课程未复述厂商产品指标为自身结果 |
| [Browser prompt injection defenses](https://www.anthropic.com/research/prompt-injection-defenses) | 2025-11-24；威胁示例、Best-of-N 评测设置、有限 ASR 与限制 | 支持报告模型、配置、预算及尝试次数；论文式产品结果不能变成固定六例的泛化保证 |
| [Implementing SLOs](https://sre.google/workbook/implementing-slos/) | 2018 Workbook；What to Measure、SLI specification/implementation、测量位置与 error budget | 支持 good/total、窗口、分母与观测覆盖；业务正确与技术成功分别定义 |
| [Canarying Releases](https://sre.google/workbook/canarying-releases/) | 2018 Workbook；Population/Duration、归因与同期比较、Isolation、Monitoring Data、Traffic Teeing、脚注 3 | 支持受限流量、共享状态影响、Shadow 类比及绝对 SLO；脚注明确排除数据泄漏影响，课程安全停止条件与此一致 |
| [Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) | 网页版权标记 2017；Philosophy、Blameless、正式 review 与行动计划 | 支持事实、原因、影响与预防措施；课程把这些原则具体化为回归案例和验证条件 |

## 验证记录与范围限制

tests.status 为 passed，适用命令及结果如下。上述实际函数值另经只读 Node ESM 调用核对，使用仓库现有 fixtures；未写入新增测试文件。

| 命令 | 退出码 | 结果 |
| --- | ---: | --- |
| `node --test tests/evals-core.test.js tests/evals-module.test.js tests/evals-visuals.test.js` | 0 | 9 项全部通过；含核心边界、数据完整性、静态 SVG 安全与柱形几何 |
| `node --check src/ui/evals-experiments.js` | 0 | UI ESM 语法通过 |
| `node --test tests/evals-core.test.js tests/evals-module.test.js` | 0 | 7 项全部通过；四课 tests 字段可在仓库内复验 |

本次独立规格审查覆盖上述内容、引用与实际计算。实际浏览器交互、桌面与 390/320px 页面尺寸、focus、fallback、reduced motion 及注册后的导航由[课程与集成验收](2026-09-18-evals-observability-security.md)记录。
