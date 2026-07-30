const sections = Object.freeze([
  Object.freeze({
    id: 'separate-model-catalog-from-host-registry',
    title: '把模型目录与宿主注册表拆成两份视图',
    paragraphs: Object.freeze([
      '飞书“工具的真相”先把工具拆成两个对象。Tool Definition 是面向模型的提案契约：名称与描述帮助发现，输入 schema 约束候选参数，安全的结果说明告诉模型会看到什么；它不包含可信身份、审批凭证或服务端执行权。宿主 Tool Registry 才保存稳定 toolId、语义版本、返回契约、scope、风险、副作用、幂等属性、timeout、owner、凭证引用与审计策略。OpenAI Agents SDK 的函数工具、JSON Schema、Pydantic 约束和逐调用 timeout 提供当前产品证据，但不会自动生成完整治理注册表。',
      '模型可见工具目录是注册表经过身份、任务与策略过滤后的最小子集，通常只暴露调用所需的名称、用途、参数 schema 与安全的结果说明。宿主执行注册表保存 owner、内部端点、凭证引用、数据分类、资源 scope、风险、副作用、幂等、timeout 和审计字段，不能因为模型“需要发现工具”就全部塞入上下文。以 read_file、send_message、issue_refund 为例，模型可以看到如何填写 path、recipient 或 orderId，却不应看到文件服务密钥、退款后台地址，也不应看到自己无权调用的管理工具。',
      '工具进入模型前还要经过 discovery：Harness 按身份、任务、环境与策略过滤目录，必要时通过 Skill 或 MCP client 发现候选能力；模型随后做 decision，返回一个或多个 tool intent；Harness 再做结构与业务校验、authorization、approval、执行和 result 记录。MCP 位于集成边界，标准化 client 与 server 如何暴露能力，不等于模型已经选择调用，也不替代应用授权。JavaGuide 的 MCP/Skills 比较用于组织概念，规范字段和生命周期必须由当前 MCP 官方规范核验。',
    ]),
    keyPoints: Object.freeze([
      '执行注册表同时记录版本化 schema、返回契约、scope、风险、副作用、幂等、timeout、owner 与审计策略。',
      '模型只看到当前身份和任务允许的工具子集；宿主保留治理字段、凭证引用与最终执行权。',
      '暂停中的调用绑定具体工具版本，同名工具升级不能静默继承旧审批。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '能力目录不是完整注册表',
      body: 'OpenAI 工具文档提供函数工具、schema、timeout、动态启用与审批入口的实现证据；完整 registry 模板是课程工程设计，仍需宿主自行存储、过滤和校验。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-tools',
      'res-harness-nist-tool-use',
      'res-harness-owasp-agency',
      'res-harness-primary-feishu-tool-truth',
      'res-harness-primary-javaguide-mcp',
      'res-harness-primary-javaguide-agent-skills',
    ]),
  }),
  Object.freeze({
    id: 'apply-four-distinct-control-layers',
    title: '用四层控制回答四个不同问题',
    paragraphs: Object.freeze([
      'Authentication 认证回答“发起者是谁”，例如登录用户、代表用户行动的服务账号，以及可验证的委托关系；Authorization 授权回答“该身份此刻能否对这个资源执行这个动作”，例如用户 A 能读项目 P 的 report.txt，却不能读项目 Q 的 secrets.env。Capability 是宿主根据身份、任务、资源范围和策略签发或计算出的可执行能力，例如只允许 read_file 访问 /reports 下只读路径、调用次数不超过十次；它应最小 scope、短期有效，并由宿主强制执行。',
      'Human approval 人工审批回答的是第四个问题：“这个已经通过认证与授权的具体高风险意图，是否得到人类同意？”审批必须是逐调用或按严格条件决定，而不是把工具永久解锁。send_message 的候选调用可绑定发件身份、收件人、规范化正文摘要与附件摘要；issue_refund 可绑定客户、订单、金额、币种和原因。即使批准者点击同意，执行端仍要验证操作者身份、服务账号委托链、订单归属和退款权限。审批补充授权，绝不能替代授权。',
      '调度还要判断 sequential 或 parallel。read_file(a) 与 read_file(b) 在授权和预算独立时可并行，结果按 callId 确定性回填；先 search 再按结果 read 必须顺序；send_message 与 issue_refund 即使由模型同轮提出，也因高风险副作用和共享业务状态按策略串行审批执行。并行只是一种 Harness 调度选择，不会共享审批、减少授权或把多个 call 合成一次副作用。OWASP 对高影响动作的用户批准和下游 complete mediation，正说明 approval 不是权限替身。',
    ]),
    keyPoints: Object.freeze([
      '认证确认身份，授权判断当前资源与动作，capability 收窄可执行能力，审批确认特定高风险意图。',
      '服务账号代表用户行动时，必须同时记录机器身份、最终用户与委托关系。',
      '任何人工批准都不能绕过执行端的资源级授权与 complete mediation。',
    ]),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-03-control-gates', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-tools',
      'res-harness-openai-hitl',
      'res-harness-owasp-agency',
      'res-harness-nist-tool-use',
      'res-harness-primary-feishu-tool-truth',
      'res-harness-primary-feishu-claude-code-tools',
    ]),
  }),
  Object.freeze({
    id: 'persist-approval-with-framework-aware-resume',
    title: '持久化审批，但不要混写框架恢复语义',
    paragraphs: Object.freeze([
      '高风险调用到达 approval gate 时，Harness 应先把 run 置为 awaiting_approval，持久化候选调用与审批请求，再释放 worker 和短期凭证。OpenAI Agents SDK 的具体流程是从 interruptions 取得待处理调用，把结果转为可序列化 RunState，调用 approve 或 reject 后以原顶层 agent 和该 state 恢复；文档也说明 sticky 决策可随同一 run 的序列化状态保留。这证明长时间暂停、跨进程保存与恢复的载体存在，但不证明恢复时会自动重新认证、重新授权或比较课程定义的参数摘要。',
      'LangGraph 的 interrupt 同样能持久暂停，并用 Command(resume=...) 注入人工决定；关键差异是恢复时会从发生 interrupt 的整个节点开头重新执行，而不是从那一行之后继续。因此 interrupt 之前的代码会再次运行，前置操作必须纯粹、可安全重复或带幂等保护。OpenAI 的 RunState 恢复与 LangGraph 的节点重跑都是各自产品语义，不能合并成“所有 Harness 都从精确指令位置继续”，也不能据任一 durable 机制宣称外部副作用天然只发生一次。',
      '课程建议另外保存审批记录 approvalRecord 与不可伪造或服务端可查的 resumeToken。记录至少绑定 runId、callId、toolId 与 toolVersion、规范化参数摘要、调用身份与代表身份、资源标识、策略版本、批准者、决定、条件、issuedAt 和 expiresAt；token 只引用或签封这条记录及一次性 nonce，不能把明文 token 当作新的长期权限。read_file、send_message 和 issue_refund 都走同一暂停协议，但各自的摘要字段、批准条件和过期时间由策略决定。这个记录与 token 模板是课程工程综合，不是 OpenAI 或 LangGraph 自动提供的跨框架标准。',
    ]),
    keyPoints: Object.freeze([
      'OpenAI 使用 interruptions 与可序列化 RunState 保存审批决定并恢复同一 run。',
      'LangGraph 恢复时从中断所在节点开头重跑，interrupt 之前的代码也会再次执行。',
      '课程审批记录绑定调用、版本、摘要、身份、资源、策略与期限；resume token 不是长期授权。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: 'Durable 不等于自动重验',
      body: 'SDK 能保存中断状态，只解决“如何回来”；“回来后还能不能执行”仍由宿主按当前身份、权限、资源、参数和策略重新判断。',
    }),
    visuals: Object.freeze([
      Object.freeze({ visualId: 'visual-harness-03-approval-resume', afterParagraph: 1 }),
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-primary-feishu-claude-code-tools',
    ]),
  }),
  Object.freeze({
    id: 'bind-intent-and-revalidate-after-wait',
    title: '用调用摘要固定意图，并在恢复前阻断 TOCTOU',
    paragraphs: Object.freeze([
      '审批界面展示的对象必须与最终执行对象可比较。先按固定 canonicalizationVersion 规范化参数：解析并约束类型，统一币种与金额精度，规范路径但拒绝越界和符号链接逃逸，稳定排序对象键，解析收件人与附件资源标识；再对 canonicalArgs 计算摘要。摘要输入至少带 toolId、toolVersion、identity、delegatedSubject、resourceIds、policyVersion 和关键环境约束，审批界面从同一份 canonicalArgs 渲染，而不是另拼一段自然语言摘要。摘要用于检测替换，不负责证明身份或授予权限。',
      '等待期间存在典型 TOCTOU：read_file 的路径可能被换成别的文件或其分类升高；send_message 的收件人、正文、附件权限或组织策略可能变化；issue_refund 的订单可能已退款、归属发生变化、金额被改动，批准者或发起者权限也可能过期。恢复器先校验 token 完整性、一次性状态和期限，再重新认证身份与委托关系，重新读取资源状态并做资源级授权，加载被绑定的工具和策略版本，重新规范化参数并比较摘要，最后检查审批条件。任一关键值不一致都不得静默执行。',
      '不一致时需要明确分支：只影响低风险展示且策略允许时可以重新渲染并继续；参数、资源、身份、工具版本或政策发生实质变化时生成新的 callId 与审批请求；权限撤销、资源不存在或令牌过期时拒绝或进入 blocked，并保留原因与审计事件。防止“界面显示退款 10 元、最终执行 100 元”的核心不是再让模型确认一次，而是让审批 UI 和执行器共享规范化调用记录，在执行前以当前事实重验。OpenAI HITL 与 LangGraph interrupt 都没有替宿主自动完成这套摘要和 TOCTOU 协议。',
    ]),
    keyPoints: Object.freeze([
      '规范化参数摘要必须绑定工具版本、身份、资源和策略版本，并由审批界面与执行器共享。',
      '恢复顺序是验证 token、重验身份与委托、重读资源、重做授权、比较版本和摘要、检查期限与条件。',
      '参数或上下文实质变化应重新审批；权限撤销、资源失效或 token 过期必须拒绝或 blocked。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-owasp-agency',
      'res-harness-primary-feishu-tool-truth',
    ]),
  }),
  Object.freeze({
    id: 'derive-policies-for-three-tool-intents',
    title: '让读文件、发信与退款贯穿同一策略矩阵',
    paragraphs: Object.freeze([
      'read_file@1 的参数 schema 可要求 projectId 与 relativePath，返回契约区分 content、not_found、forbidden 和 too_large；scope 是指定项目的只读目录，风险随数据分类变化，副作用为无外部写入，timeout 较短。模型只看到允许项目中的 Tool Definition，Harness 从 registry 解析真实适配器和权限。飞书的 Claude Code 工具清单只作为截至冻结日的 transcript 观察：工具名、参数与可用性都必须版本化，不能据此声称今天的产品清单完整不变。',
      'send_message@2 的参数 schema 包含 senderProfile、recipients、subject、body 与 attachmentIds，返回契约给出 accepted、messageId、policy_denied 与 delivery_unknown；scope 限定企业邮箱和允许域，风险由外部收件人、敏感内容与附件决定，副作用是不可轻易撤回的对外通信。幂等元数据说明使用 callId 或 deliveryKey 去重，timeout 后先查 messageId 再决定是否重试。审批绑定规范化收件人、正文与附件摘要，但实际发送前仍要重验发件权限、附件读取权限和最新外发策略。',
      'issue_refund@3 的参数 schema 要求 orderId、customerId、amountMinor、currency 与 reasonCode，返回契约区分 refunded、already_refunded、limit_exceeded、order_changed 与 indeterminate；scope 限定支付账户、订单归属和金额阈值，风险高且产生财务副作用。把三类工具的真实 transcript 收集后，应调优定义而不是只改 prompt：错误选择说明名称/描述或目录过滤不清，参数反复失败说明 schema 和错误反馈不够精确，误并行说明依赖与 sideEffect 元数据缺失，审批频繁误触说明风险规则需拆分。任何调优都版本化并回放固定案例。',
    ]),
    keyPoints: Object.freeze([
      '同一 registry 模板要按工具具体化返回契约、资源 scope、风险、副作用、幂等、timeout、owner 与审计内容。',
      '只读文件仍需资源授权；对外发信需绑定内容与附件；退款需同时校验委托、订单状态与金额阈值。',
      '模型目录只描述可调用表面，宿主策略矩阵才决定直接执行、逐调用审批、拒绝或 blocked。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-tools',
      'res-harness-nist-tool-use',
      'res-harness-owasp-agency',
      'res-harness-primary-feishu-claude-code-tools',
      'res-harness-primary-feishu-tool-truth',
    ]),
  }),
  Object.freeze({
    id: 'deliver-and-defend-the-policy-design',
    title: '用交付物、测验与追问证明控制链完整',
    paragraphs: Object.freeze([
      '课程练习的正式交付仍是“三个工具注册记录、策略矩阵、审批恢复时序”：用 read_file 代表只读查询、用 issue_refund 代表财务写入，再补一个 run_code 工具满足代码执行场景。run_code 的 registry 要写清输入与返回 schema、sandbox capability、文件与网络 scope、高风险副作用、幂等边界、墙钟 timeout、sandbox owner 和审计产物；它的隔离细节留到下一课。send_message 作为贯穿对照案例加入策略矩阵，帮助检查“已授权但仍因具体收件人与内容需要审批”的条件分支。',
      '恢复时序必须主动模拟三类漂移：审批期间把 read_file 参数换到另一个项目、撤销 send_message 发起者的外发权限、让 issue_refund 订单先被他人部分退款；再增加同名工具 schema 升级、策略版本变化和 token 过期。对每种情况记录暂停、持久化、人工决定、恢复 token 校验、参数摘要比较、身份与资源授权重验，以及重新审批、拒绝、降级或 blocked 的结果。只有同时交付版本化 registry、策略矩阵和可复核时序，才完成“设计注册表”和“区分三层控制并重验”两个学习目标。',
      '最后用课程的两道测验和三道访谈自证：能够解释人工审批只为特定高风险意图增加条件性许可，认证和资源授权仍各自必需；能够解释等待期间身份、参数、资源和策略都可能变化。访谈时完整回答注册表字段与模型子集、认证/授权/审批差别、审批后重验原因，并接住三个追问：暂停中同名 schema 升级怎么办，服务账号代用户退款怎样布置控制，如何保证界面金额与执行金额一致。完成标准是能对照字段说清两份工具视图，并现场演示暂停、持久化、恢复重验和拒绝过期 token。',
    ]),
    keyPoints: Object.freeze([
      '练习交付包含三个版本化 registry 记录、工具策略矩阵和审批恢复时序，并以发信案例补充条件审批对照。',
      '测试至少覆盖参数、权限、资源、工具版本、策略版本与期限在等待期间发生变化。',
      '两道测验、三道访谈及其追问和两条完成标准必须都能由交付证据回答。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-tools',
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
      'res-harness-nist-tool-use',
      'res-harness-owasp-agency',
      'res-harness-primary-javaguide-mcp',
      'res-harness-primary-javaguide-agent-skills',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '工具名、自然语言描述和参数 schema 已经构成完整工具注册表，模型看到的内容也应与宿主完全相同。',
    correction: '这些字段主要服务模型发现；宿主还要保存版本、返回契约、scope、风险、副作用、幂等、timeout、owner、审计与凭证引用，并只向模型暴露允许子集。',
  }),
  Object.freeze({
    claim: '用户或服务账号通过认证，就表示它可以调用名下所有工具并访问所有资源。',
    correction: '认证只确认身份；授权必须在当前动作与资源粒度判断，capability 还要把 scope、期限和调用上限收窄到任务所需。',
  }),
  Object.freeze({
    claim: '人工已经点击批准，执行器就可以跳过授权检查，因为审批比权限更强。',
    correction: '审批仅补充对特定高风险意图的同意，不能替代身份认证、委托验证和下游资源级授权。',
  }),
  Object.freeze({
    claim: '一次批准可以覆盖同一 run 后续的参数变化、资源变化和同名工具版本升级。',
    correction: '审批绑定具体版本、规范化参数摘要、身份、资源、策略和期限；任何实质变化都需重新判断，通常要重新审批。',
  }),
  Object.freeze({
    claim: 'OpenAI RunState 与 LangGraph interrupt 的恢复语义相同，都从暂停代码的下一行继续。',
    correction: 'OpenAI 用可序列化 RunState 恢复同一 run；LangGraph 明确从中断所在节点开头重跑，因此中断前代码也会再次执行。',
  }),
  Object.freeze({
    claim: 'SDK 支持持久审批后，就会自动提供完整 registry、参数摘要、策略版本、token 过期和恢复时 TOCTOU 重验。',
    correction: '所引 SDK 文档不承诺这些宿主治理能力；registry、审批记录、resume token 和重验顺序是课程工程模板，必须自行实现和验证。',
  }),
]);

export const harness03Note = Object.freeze({
  readingMinutes: 38,
  introduction: '一个 Agent 提出“读文件”“发消息”或“退一笔款”时，模型输出的只是候选 tool intent，不是执行许可。飞书“工具的真相”和 Claude Code 工具清单提供提案—执行—结果 transcript 的教学主线，JavaGuide MCP/Skills 用来校准发现与集成边界，OpenAI、NIST、OWASP 和 LangGraph 负责验证当前产品与安全语义。你将把 Tool Definition 与宿主 Registry 分开，完整走过 discovery、decision、sequential/parallel scheduling、authorization、approval、execution 和 result feedback，再用失败 transcript 调优描述、schema、依赖与风险元数据。最后以三个工具演练暂停、持久化和 TOCTOU 重验，并明确 MCP 连接能力却不替代模型决策或 Harness 授权。',
  overviewVisualId: 'visual-harness-03-tool-governance',
  overviewVisualSectionId: 'separate-model-catalog-from-host-registry',
  sections,
  misconceptions,
  recap: Object.freeze([
    '模型可见工具目录服务发现，宿主执行注册表服务治理；后者还包含版本、返回契约、scope、风险、副作用、幂等、timeout、owner 与审计策略。',
    'Authentication 确认是谁，authorization 判断当前资源动作，capability 收窄能力，human approval 只确认一个具体高风险意图。',
    '人工审批不能替代授权；服务账号代用户行动时还必须验证代表身份、委托关系和最终用户的资源权限。',
    'OpenAI 支持 interruptions、RunState 序列化和同一 run 恢复；LangGraph 恢复会从中断所在节点开头重跑，二者不可混写。',
    '审批记录应绑定工具与策略版本、规范化参数摘要、身份、资源、批准者、条件和期限，resume token 本身不是长期权限。',
    '执行前必须重新认证与授权、重读资源、比较参数摘要和版本、检查审批期限；任何 TOCTOU 漂移都要重新审批、拒绝、降级或 blocked。',
    'read_file、send_message 与 issue_refund 共用控制链，但只读路径、外发内容和退款订单分别需要不同的 scope、风险与审批条件。',
    'OpenAI 或 LangGraph SDK 没有自动提供课程的完整 registry 或恢复重验；这些模板必须由 Harness 实现并以变化场景验证。',
  ]),
  nextStep: '现在完成“构建高风险工具策略”练习：为 issue_refund、read_file 只读查询和 run_code 写出版本化 schema、返回契约、scope、风险、副作用、幂等键、timeout、owner 与审计字段，再把 send_message 放入策略矩阵作为条件审批对照。画出候选调用进入 approval gate、保存审批记录与 run 状态、释放 worker、人工决定、携带 resume token 恢复、重新认证与授权、重读资源、重新规范化参数并比较摘要、检查工具和策略版本及期限、最终执行或拒绝的完整时序。分别注入参数替换、权限撤销、资源变化、schema 升级、策略变化和 token 过期，并用两道测验、三道访谈追问和两条完成标准逐项验收。下一课将把 run_code 放入 sandbox，进一步限制文件、网络、系统调用和硬资源；正确的 registry 与审批链能决定“是否允许执行”，却不能代替隔离层控制“执行后能影响什么”。',
});
