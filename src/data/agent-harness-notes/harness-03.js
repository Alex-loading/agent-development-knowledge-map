const sections = Object.freeze([
  Object.freeze({
    id: 'separate-model-catalog-from-host-registry',
    title: '把模型目录与宿主注册表拆成两份视图',
    paragraphs: Object.freeze([
      '上一课已经让 run 可以跨进程恢复，但一个耐久 run 只有在外部动作仍受宿主约束时才安全。本课先建立工具注册表：每条执行记录至少包含稳定 toolId、语义版本、参数 schema、返回契约、允许的 scope、风险等级、可能副作用、幂等属性、逐调用 timeout、owner 与审计策略。参数 schema 只回答输入长什么样，返回契约还要说明成功值、可识别错误和敏感字段；风险与副作用则决定授权、审批和记录强度。OpenAI Agents SDK 文档证明函数签名可生成 JSON Schema、Pydantic 可加约束、异步函数工具可设逐调用 timeout，但没有自动生成上述完整治理注册表。',
      '模型可见工具目录是注册表经过身份、任务与策略过滤后的最小子集，通常只暴露调用所需的名称、用途、参数 schema 与安全的结果说明。宿主执行注册表保存 owner、内部端点、凭证引用、数据分类、资源 scope、风险、副作用、幂等、timeout 和审计字段，不能因为模型“需要发现工具”就全部塞入上下文。以 read_file、send_message、issue_refund 为例，模型可以看到如何填写 path、recipient 或 orderId，却不应看到文件服务密钥、退款后台地址，也不应看到自己无权调用的管理工具。',
      '每次候选调用都必须绑定具体工具版本。若 issue_refund@2 在审批等待期间升级为同名的 @3，哪怕字段看似兼容，旧审批也不能直接授权新实现；宿主要按保存的版本恢复，或重新生成摘要并请求审批。NIST 的工具使用资料支持按功能、访问模式、风险、可逆性、监控和自治程度分类，OWASP 也主张缩小工具功能与权限；把这些维度固化为统一 registry 字段，是本课程为可治理 Harness 提出的工程综合，并不是 NIST 标准或任一 SDK 的默认 schema。',
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
    ]),
  }),
  Object.freeze({
    id: 'apply-four-distinct-control-layers',
    title: '用四层控制回答四个不同问题',
    paragraphs: Object.freeze([
      'Authentication 认证回答“发起者是谁”，例如登录用户、代表用户行动的服务账号，以及可验证的委托关系；Authorization 授权回答“该身份此刻能否对这个资源执行这个动作”，例如用户 A 能读项目 P 的 report.txt，却不能读项目 Q 的 secrets.env。Capability 是宿主根据身份、任务、资源范围和策略签发或计算出的可执行能力，例如只允许 read_file 访问 /reports 下只读路径、调用次数不超过十次；它应最小 scope、短期有效，并由宿主强制执行。',
      'Human approval 人工审批回答的是第四个问题：“这个已经通过认证与授权的具体高风险意图，是否得到人类同意？”审批必须是逐调用或按严格条件决定，而不是把工具永久解锁。send_message 的候选调用可绑定发件身份、收件人、规范化正文摘要与附件摘要；issue_refund 可绑定客户、订单、金额、币种和原因。即使批准者点击同意，执行端仍要验证操作者身份、服务账号委托链、订单归属和退款权限。审批补充授权，绝不能替代授权。',
      '把三例放进同一条流水线就能看出差别：read_file 先认证调用者，再按项目与规范化路径授权，低敏只读场景可能无需人工审批；send_message 已获邮箱发送权限仍可能因外部收件人或敏感附件触发逐调用审批；issue_refund 即使服务账号可访问支付 API，也必须校验“代表哪个用户”、该用户对该订单的资源级权限、金额阈值和具体批准。OWASP 明确建议高影响动作引入用户批准，并要求下游系统对所有请求执行完整授权校验，这正说明 approval 不是权限替身。',
    ]),
    keyPoints: Object.freeze([
      '认证确认身份，授权判断当前资源与动作，capability 收窄可执行能力，审批确认特定高风险意图。',
      '服务账号代表用户行动时，必须同时记录机器身份、最终用户与委托关系。',
      '任何人工批准都不能绕过执行端的资源级授权与 complete mediation。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-tools',
      'res-harness-openai-hitl',
      'res-harness-owasp-agency',
      'res-harness-nist-tool-use',
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
    sourceIds: Object.freeze([
      'res-harness-openai-hitl',
      'res-harness-langgraph-interrupts',
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
    ]),
  }),
  Object.freeze({
    id: 'derive-policies-for-three-tool-intents',
    title: '让读文件、发信与退款贯穿同一策略矩阵',
    paragraphs: Object.freeze([
      'read_file@1 的参数 schema 可要求 projectId 与 relativePath，返回契约区分 content、not_found、forbidden 和 too_large；scope 是指定项目的只读目录，风险随数据分类变化，副作用为无外部写入，timeout 较短，owner 是文件平台组，审计记录规范化路径、资源版本和返回分类而不记录机密正文。模型只看到允许项目中的该工具视图。宿主仍需防路径穿越并检查真实文件对象的授权；“只读”通常降低审批需求，却不等于无需认证、授权和审计。',
      'send_message@2 的参数 schema 包含 senderProfile、recipients、subject、body 与 attachmentIds，返回契约给出 accepted、messageId、policy_denied 与 delivery_unknown；scope 限定企业邮箱和允许域，风险由外部收件人、敏感内容与附件决定，副作用是不可轻易撤回的对外通信。幂等元数据说明使用 callId 或 deliveryKey 去重，timeout 后先查 messageId 再决定是否重试。审批绑定规范化收件人、正文与附件摘要，但实际发送前仍要重验发件权限、附件读取权限和最新外发策略。',
      'issue_refund@3 的参数 schema 要求 orderId、customerId、amountMinor、currency 与 reasonCode，返回契约区分 refunded、already_refunded、limit_exceeded、order_changed 与 indeterminate；scope 限定支付账户、订单归属和金额阈值，风险高且产生财务副作用，幂等键绑定订单与业务请求，timeout 后必须先对账。owner 是支付平台组，审计保存用户、服务账号委托、审批证据、政策版本和远端操作 ID。恢复执行前再次读取订单与累计退款，确保批准金额、当前可退金额和最终请求完全一致。',
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
  introduction: '一个 Agent 提出“读文件”“发消息”或“退一笔款”时，模型输出的只是候选意图，不是执行许可。上一课解决了 run 如何保存与恢复，本课继续追问：恢复后的宿主凭什么确认工具仍是原版本、调用者仍有权、批准者看到的参数就是最终参数？你将把模型可见的能力目录与宿主执行注册表分离，用版本化 schema、返回契约、scope、风险、副作用、幂等、timeout、owner 和审计字段治理工具；再严格区分 authentication、authorization、capability 与逐调用 human approval。随后以 read_file、send_message、issue_refund 贯穿暂停、持久化、resume token、规范化参数摘要和 TOCTOU 重验，并比较 OpenAI RunState 与 LangGraph 节点重跑的真实差异。课程引用证明具体 SDK 能力和安全原则，完整 registry 与审批恢复协议则明确作为宿主侧工程综合，不冒充框架自动保证。',
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
