# 第六模块安全资料核验

核验对象为 `eval-06` 与 `eval-07` 所需的应用安全证据。`checkedAt` 为 `2026-09-18T04:16:07Z`。八份资料均读取了官方 HTML 正文中的相关内容；登记为 `body: partial`。本记录使用无跟踪参数的官方原始正文 URL，没有将搜索摘要、页面标题、图像或正文引用的其他资料视为已读证据，也没有声明已检查所有页面的 `rel=canonical` 标签。

资源 ID、`authority` 与 `role` 采用 `src/data/evals-resources.js` 的实际登记。工程结论限于威胁模型、执行授权、输出消费、敏感数据与安全评测，不包含法律合规解释。调研与课程实验均未向真实业务系统发送攻击或执行工具动作。

## 资料与证据边界

### 1. OWASP Prompt Injection

- ID：`res-eval-owasp-injection`；`authority: official`；`role: core`。
- Canonical URL：[LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)。
- 读取范围：定义、直接与间接注入类型、缓解建议、示例；读取快照主要为正文第 7–90 行。
- 支持主张：外部网页、文件和工具返回内容可成为间接注入入口；检索增强与微调没有消除这一风险。应用需要标记不可信内容，在代码和工具端限制权限，为高影响动作设置人工检查，并持续进行对抗评测。
- 限制：风险指南提供分层缓解方向，没有给出适用于所有应用的检测成功率或防御保证。来源标记、提示说明和过滤器均需配合执行约束。

### 2. OWASP Sensitive Information Disclosure

- ID：`res-eval-owasp-disclosure`；`authority: official`；`role: core`。
- Canonical URL：[LLM02:2025 Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/)。
- 读取范围：定义、访问控制、数据使用与示例；快照主要为正文第 7–91 行，其中访问限制与令牌化、脱敏内容用于课程。
- 支持主张：模型上下文与应用输出可能暴露个人信息、商业资料或凭据。数据源应限制到当前用户和任务所需范围，配合访问控制、敏感字段处理及输出检查。
- 限制：本课不据此推断 API 请求是否用于模型训练，也不采用其中的联邦学习或法规建议。日志字段排除与验证使用专门的 Logging Cheat Sheet 支持。

### 3. OWASP Improper Output Handling

- ID：`res-eval-owasp-output`；`authority: official`；`role: core`。
- Canonical URL：[LLM05:2025 Improper Output Handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)。
- 读取范围：定义、常见示例与防护措施；快照主要为正文第 7–50 行。
- 支持主张：模型输出进入 HTML、SQL、文件路径或命令执行环境时，应按消费环境验证和处理。HTML 编码、参数化查询、参数限制与路径检查具有各自职责。合法 JSON 仅能证明约定的结构条件成立。
- 限制：结构校验不能证明资源授权或业务正确。课程以文字和合成数据解释输出去向，不执行真实恶意载荷；具体安全库与部署配置需要项目另行核验。

### 4. OWASP Excessive Agency

- ID：`res-eval-owasp-agency`；`authority: official`；`role: core`。
- Canonical URL：[LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)。
- 读取范围：功能、权限与自主程度的成因，缓解措施，以及 downstream authorization、complete mediation；快照主要为正文第 7–81 行，执行授权内容位于第 55–66 行。
- 支持主张：减少当前任务不需要的工具能力、权限和自主动作。在下游按当前用户与资源检查授权，并对每次访问执行检查。高影响动作可要求人工确认；限制速率与审计日志用于控制影响和支持调查。
- 限制：原文没有要求每次只读工具调用都经人工确认。确认只能批准允许范围内的具体动作，模型拒绝文本与人工点击都不能取代下游授权。

### 5. Claude 防护文档

- ID：`res-eval-claude-guardrails`；`authority: official`；`role: cross-check`。
- Canonical URL：[Mitigate jailbreaks and prompt injections](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)。
- 读取范围：提示注入风险、间接提示注入、分层防护与持续监控；快照第 37–180 行，重点为第 102–177 行；课程未采用后续金融合规示例。
- 支持主张：文档、搜索结果和工具内容属于外部输入，不能覆盖用户原始目标。来源标签、输入分隔、检查器、最小权限与受控环境应协同工作，部署前后都需要安全测试与监控。
- 限制：`tool_result` 等组织方式属于该产品文档的具体建议。格式标记、JSON 编码与分类器没有独立提供完整授权或安全隔离保证，课程不将它们扩展为通用协议。

### 6. OWASP Logging Cheat Sheet

- ID：`res-eval-owasp-logging`；`authority: official`；`role: core`。
- Canonical URL：[Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)。
- 读取范围：事件来源与属性、应排除的数据、日志收集、验证和保护；快照主要为第 239–417 行及第 451–469 行。
- 支持主张：事件应保留足以解释主体、动作、对象、结果和原因的信息，并使用关联标识连接上下文。口令、访问令牌、会话秘密及不必要的敏感正文应受到排除或处理。外部字段需验证，日志注入、访问控制与记录失败也应测试。
- 限制：原文容许不同处理环节；“普通日志在写入前移除教学敏感标记”是本课程的明确选择。课程字段表属于教学方案，没有被表述为 Agent 日志统一标准。

### 7. Anthropic 浏览器提示注入研究

- ID：`res-eval-anthropic-browser`；`authority: official`；`role: cross-check`。
- Canonical URL：[Mitigating prompt injections in browser use](https://www.anthropic.com/research/prompt-injection-defenses)。
- 发布日期：`2025-11-24`。
- 读取范围：研究正文、攻击预算、防护方式与剩余风险；快照主要为第 11–45 行。没有复刻或独立核验文中图像。
- 支持主张：浏览器接收的内容与可执行动作形成不同攻击面。评估防护时必须注明威胁模型、环境、攻击预算和自适应尝试条件；研究使用的预算包含每个环境最多 100 次尝试。
- 限制：结果与特定产品、版本、环境和攻击预算有关。课程不移用产品成功率作为通用门槛，也不据此声称提示注入风险已消除。

### 8. Anthropic 产品 containment 复盘

- ID：`res-eval-anthropic-containment`；`authority: official`；`role: cross-check`。
- Canonical URL：[How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude)。
- 发布日期：`2026-05-25`。
- 读取范围：模型防护、权限系统、文件和网络限制、外部内容与测试环境，以及正常请求被拦截和风险未被识别的代价；快照主要为第 13–141 行。图像未独立核验。
- 支持主张：模型行为控制与执行环境限制承担不同职责。审核过的连接器仍可能读取后来加入的外部恶意内容。隔离测试和合成资源可帮助验证权限边界，评测需同时考虑正常能力与风险后果。
- 限制：文章记录具体产品工程，不能证明所有隔离环境都具备相同保证。课程不引用产品比例作为通用验收标准，也不扩展到 Agent 身份协议或多代理治理。

## 课程主张的来源关系

| 课程主张 | 主证据 | 教学边界 |
| --- | --- | --- |
| 外部资料可影响模型，但资料内容不能授予动作权限 | OWASP Prompt Injection、Excessive Agency；Claude 防护文档 | 来源标签只描述材料来历，权限来自执行端的身份与资源规则 |
| 每次下游访问验证当前用户、资源与动作 | OWASP Excessive Agency | 课程将确认绑定到动作类型、资源、目的地与内容版本；这些字段为原创示例 |
| 安全判定检查实际后果与执行记录 | OWASP Excessive Agency、Improper Output Handling；Anthropic containment | 最终拒绝文字不能单独证明此前未发生越权 |
| 输出需在消费环境执行对应校验 | OWASP Improper Output Handling | HTML、SQL 与路径各自使用具体规则，JSON 结构只覆盖结构条件 |
| 上下文与日志均需最小化敏感数据 | OWASP Sensitive Information Disclosure、Logging Cheat Sheet | 字段允许列表、脱敏位置与保留方式属于课程明确选择 |
| 攻击集与正常对照共同组成安全回归 | Claude 防护文档；Anthropic 浏览器研究与 containment | 课程以固定合成案例展示漏报、误拒、越权副作用，数值仅描述该案例集 |

## 原创案例与实验范围

两课使用“星桥项目知识助手”的合成资料与身份。文档作者能够影响检索文本，助手可以提出动作，模拟执行端根据授权标签判断是否允许。案例保留原用户任务、攻击者可影响的位置、预期允许行为、禁止后果与必要的运行证据。

`eval-safety-regression` 使用六条固定标注记录：两条攻击记录和四条正常记录。教学分类器的命中标签预先给定，执行策略使用预先给定的授权标签。开启分类器时出现一次漏报与一次正常误拒；仅分类器配置产生一次越权副作用，同时启用执行检查后该副作用为零。这组变化只说明所定义的越权动作后果受到限制，分类器标签保持原状。

该实验未模拟真实分类器、网络请求、生产工具、所有泄漏渠道或内容污染。零副作用只适用于固定记录及当前攻击目标。红队发现转成回归记录时，应保留威胁模型、失败条件、正常对照、后果断言和配置版本；更换模型、提示或权限策略后重新验证受影响案例。

## 核验记录

- 八个资源 ID 均存在于当前资源登记表，`eval-06` 与 `eval-07` 的来源使用与相应教学主题一致。
- 正文与图解采用转述和原创例子，没有复制外部图像或完整攻击载荷。
- 资料的访问范围、发布日期与限制按上述记录保留；动态官方文档应在未来课程更新时再次检查。
- 本研究过程为只读资料核验；课程数据、固定实验和渲染的测试记录由内容审查与集成验证分别保存。
