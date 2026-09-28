# 第六模块资料与课程依据

核验日期：2026-09-18。课程采用 22 份资料，资源地址、正文阅读范围、来源类别、用途及限制保存在 `src/data/evals-resources.js`。每课的引用同时经过课程资源、章节来源和全站注册表检查。

## 来源账本

| resourceId | 阅读范围 | 支持的课程内容 | 使用限制 |
| --- | --- | --- | --- |
| res-eval-anthropic-evals | 任务、试验、评分器、运行记录、结果、评测建设步骤 | eval-01 至 04、08 的评测方法 | 工程经验需要结合具体任务验证 |
| res-eval-tau-bench | v1 的任务定义、环境结果与重复可靠性 | eval-01、03、04 | 环境奖励只覆盖已定义的结果与条件 |
| res-eval-mt-bench | v4 的裁判类型、位置影响、人工一致性 | eval-02 | 一致性数值受论文样本与模型限制 |
| res-eval-ragas | v1 的质量维度、无参考评测与验证 | eval-04 | 采用论文定义，当前库 API 另行核对 |
| res-eval-sklearn-leakage | 数据泄漏、预处理与 Pipeline 示例 | eval-01、08 | 提供集合隔离原则，课程不指定通用比例 |
| res-eval-otel-traces | trace、span、context、link、event、status | eval-05 | 操作记录需要关联任务验收结果 |
| res-eval-otel-context | 上下文注入、提取、第三方服务与 baggage | eval-05 | 关联信息与业务授权分别验证 |
| res-eval-otel-sampling | head、tail 与组合采样 | eval-05 | 采样结果需要注明选择规则与分母 |
| res-eval-otel-sensitive | 采集最小化、删除、哈希限制 | eval-05、08 | 允许字段的内容仍需要审查 |
| res-eval-otel-genai | Development 状态、逻辑调用、重试、输入输出捕获 | eval-05 | 字段在发展中，具体 SDK 支持情况需要验证 |
| res-eval-prometheus | 请求、错误、延迟与标签基数 | eval-05、08 | 总体指标需要可靠且一致的计数范围 |
| res-eval-sre-slos | SLI、SLO、窗口与错误预算规则 | eval-08 | 阈值由业务决定，关键安全条件单独处理 |
| res-eval-sre-canary | 灰度评估、指标、持续时间与限制 | eval-08 | 代码恢复后仍需处理已经发生的外部影响 |
| res-eval-sre-postmortem | 无责复盘、触发条件与跟进行动 | eval-08 | 行动项必须配有负责人和验证证据 |
| res-eval-owasp-injection | LLM01:2025 定义、攻击入口与缓解方法 | eval-06、07 | 防护结论限定在明确的威胁模型内 |
| res-eval-owasp-disclosure | LLM02:2025 数据来源与访问控制 | eval-06、07 | 引用范围限定为应用的数据保护 |
| res-eval-owasp-output | LLM05:2025 消费端校验与编码 | eval-07 | schema、授权与消费上下文分别验证 |
| res-eval-owasp-agency | LLM06:2025 功能、权限、自主性与逐次授权 | eval-06、07 | 人工确认的动作必须处于授权范围 |
| res-eval-owasp-logging | 事件字段、排除数据、日志保护与验证 | eval-06、07 | 日志内容本身需要访问与保留规则 |
| res-eval-claude-guardrails | 间接注入、分层防护与持续检查 | eval-06、07 | 产品建议按日期引用 |
| res-eval-anthropic-containment | 模型、权限、隔离及实际后果 | eval-06、07 | 产品经验需要结合当前系统的边界验证 |
| res-eval-anthropic-browser | 威胁模型、攻击预算与防护评估 | eval-07 | 结论受攻击面和测试预算限制 |

## 学习能力与证据

`coverageMatrix` 包含 108 条对应关系，每条记录实际课程字段、负责讲授的章节以及章节引用的来源。课程字段定义考核范围，资源正文提供论据。

| 课程 | 学员需要完成的判断 | 主要证据 | 练习产物 |
| --- | --- | --- | --- |
| eval-01 | 用环境结果和必要条件判定任务是否成功 | Anthropic evals、τ-bench、集合隔离原则 | 任务定义与版本化评测集合说明 |
| eval-02 | 为评分维度选择方法，处理评分分歧 | Anthropic evals、MT-Bench | Rubric、人工标注与校准记录 |
| eval-03 | 检查分组退化、未知结果与重复可靠性 | Anthropic evals、τ-bench | 配对回归表和发布判断 |
| eval-04 | 根据证据定位 RAG 与 Agent 失败环节 | RAGAS、τ-bench、Anthropic evals | 按环节归因的调查记录 |
| eval-05 | 关联一次运行，并解释采样后的证据范围 | OpenTelemetry、Prometheus | 关联说明、分母表和字段允许清单 |
| eval-06 | 标记内容入口和每次执行的授权条件 | OWASP、Claude 文档与工程资料 | 威胁模型与逐次权限检查表 |
| eval-07 | 同时检查攻击结果、正常请求和实际影响 | OWASP、Anthropic 防护研究 | 安全回归结果与数据处理规则 |
| eval-08 | 根据离线和线上证据形成发布决策 | Google SRE、Anthropic evals、观测资料 | 发布评审包、停止条件及事故行动项 |

## 版本和使用范围

论文固定为 MT-Bench v4、RAGAS v1、τ-bench v1；OWASP 风险编号采用 2025 分类。OpenTelemetry 的 GenAI 文档使用核验当日的官方仓库，并在课程中明确 Development 状态。

重复成功概率说明采用同一任务的独立同分布假设。分组发布规则、六条 trace 与安全案例均为课程明确列出的教学数据。每项交互显示样本范围和计算口径。

所有正式资源均有可访问正文。`access.body: partial` 表示已审阅账本列出的相关章节，其他章节与外部链接需要独立核验。课程中的自定义运行字段均注明用途，工具与 SDK 的生产接入需要核对实际版本。

## 验证记录

来源与字段覆盖通过 `tests/evals-module.test.js` 检查，图形证据归属通过 `tests/visual-registry-ownership.test.js` 检查。逐课审查与最终执行结果保存在 `docs/content-audits/2026-09-18-evals-observability-security.md`。
