import { deepFreeze } from '../multi-agent-shared.js';

export const ma07Note = deepFreeze({
  readingMinutes: 28,
  introduction: '前两课已经说明 MCP 请求怎样表达版本、能力和运行结果。本课进一步回答：一条能够正确解析的调用，究竟由谁决定可以执行？继续使用星桥企业资料助手，主管希望阅读并导出本部门报告，研究 worker 只负责提取证据。我们沿着身份、目标服务器、动作、资源与委托范围逐层检查，解释 HTTP 与 stdio 的不同责任，并用确定性实验记录每层判断。学完后应能交付一份含正常案例、拒绝案例和实施边界的授权表。',
  overviewVisualId: 'visual-ma-07-overview',
  overviewVisualSectionId: 'ma07-authorization-layers',
  sections: [
    {
      id: 'ma07-authorization-layers',
      title: '把身份、协议能力和业务许可分别检查',
      paragraphs: [
        '身份认证回答请求代表谁，授权回答这个身份可以对什么资源执行什么动作。MCP 中的 capabilities 则说明一方支持哪些协议功能，例如是否支持某种客户端交互。把三个问题写成不同列，可以避免一种常见错误：服务器公布了某个工具，或者请求声明支持某种功能，调用方就认为自己取得了使用所有数据的许可。工具可发现性与实际访问控制需要分别实现。',
        '星桥主管可以阅读和导出本部门的报告，研究 worker 只被委托整理摘要。即使二者使用同一个 MCP server，worker 本次任务的行动范围仍可更小。host 负责管理用户同意、客户端及上下文，工具服务器和下游服务负责在执行位置检查访问规则。权限随任务、用户和具体资源变化，单靠聊天记录里的一句“已经允许”无法让这些检查成为有效事实。',
        '本课把执行判断组织为用户动作许可、委托动作许可、资源归属、transport 所需身份条件和敏感动作确认。这是企业资料助手的原创应用策略，MCP 没有规定一个同名的通用委托算法。规范提供 OAuth 与工具访问控制要求，OWASP 的 complete mediation 强调每次下游请求都经过策略验证；我们用这些依据说明各层如何共同约束一次动作。',
      ],
      keyPoints: ['capabilities 表达协议支持，授权表达行动许可。', 'host 管理同意与上下文，执行端逐请求检查权限。', '课程委托交集为应用策略，不属于 MCP wire format。'],
      sourceIds: ['res-ma-mcp-architecture', 'res-ma-mcp-tools', 'res-ma-mcp-auth', 'res-ma-owasp-agency'],
    },
    {
      id: 'ma07-discovery-identity',
      title: '先识别受保护资源，再进入授权流程',
      paragraphs: [
        '截至 2026-09-18，本课采用 MCP 2026-07-28 当前规范。授权功能对 MCP 实现是可选的；采用授权的 HTTP 实现应遵循规范中的 OAuth 流程。stdio 的凭据通常来自进程运行环境，规范建议它不沿用这套 HTTP 授权流程，对应 SHOULD NOT。因此，判断安全要求时先写 transport 和部署方式，避免把远程 HTTP 的步骤机械应用于所有本地进程。',
        'HTTP 客户端需要知道哪个授权服务器负责目标 MCP 资源。Protected Resource Metadata，简称 PRM，是受保护资源发布的描述信息。客户端可从响应的 WWW-Authenticate 指引或规定的 well-known 位置找到它，再读取所选 Authorization Server 的 metadata。MCP 要求 PRM 包含可用授权服务器列表；发现流程还必须验证 issuer 与预期发行者一致，防止把凭据交给错误的服务。',
        'scope 描述请求的权限范围，resource 表达 token 预期面向的资源服务器。客户端在授权请求及 token 请求中携带目标 resource，随后由服务器验证实际收到的 token。发现到一个 endpoint、看到资源目录或完成登录，都不能省略具体动作与数据记录的权限检查。真实实现还需处理 PKCE、redirect URI、token 时效和安全存储；教学实验只使用已给定的判断输入。',
      ],
      keyPoints: ['HTTP 与 stdio 的凭据流程不同。', 'PRM 提供发现信息，issuer 验证仍然必需。', 'scope、resource 和业务资源访问分别核验。'],
      sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-discovery', 'res-ma-mcp-auth-security'],
    },
    {
      id: 'ma07-audience-proxy',
      title: '在代理之间保持 token 的目标与同意范围',
      paragraphs: [
        'token audience 表示 token 预期由哪个服务接收。假设用户为日历服务取得一个有效 token，资料 MCP server 不能仅因为该 token 带有 read scope 就接受它。有效身份材料仍可能面向另一个接收者。MCP 要求服务器检查 token 是否签发给自身；接受其他目标的 token 并原样传给下游的 token passthrough 被明确禁止。具体 token 格式可以不同，不能假定全部都是 JWT。',
        'confused deputy 描述一种代理利用自身权限替错误请求完成操作的风险。MCP 安全资料给出的特定场景涉及代理复用上游静态 client ID、允许动态客户端加入，以及上游已保存用户同意。新客户端若借用这份旧同意，可能获得用户未针对它授权的访问。防护要求在进入上游授权前识别当前客户端，并取得与该客户端、请求范围及 redirect URI 有关的用户同意。',
        '这两个问题提醒我们追踪“谁向谁请求哪一种许可”。audience 检查约束 token 的接收目标，逐客户端同意约束代理替哪个客户端行动；两项检查不能互相替代。资料助手若还需要调用下游服务，应按下游要求获得对应授权并保留可审计的身份关系。课程不把上游 token 复制视为一种便捷委托方案，也不把用户对某个客户端的一次同意扩展成全局许可。',
      ],
      keyPoints: ['有效 token 仍须验证接收目标。', 'token passthrough 会破坏服务之间的授权边界。', 'confused deputy 场景需要识别并确认当前客户端。'],
      sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security', 'res-ma-mcp-security'],
    },
    {
      id: 'ma07-delegation-policy',
      title: '用权限交集限制每次委托动作',
      paragraphs: [
        '在课程实验中，应用先确认当前身份，再检查用户动作集合 read 与 export，以及研究 worker 初始只有 read 的委托集合。两个集合的交集就是本次 worker 可申请的动作集合；因此 export 在委托层被拒绝，即使用户本人有导出权限。随后还要检查资源租户是否属于当前用户的允许范围，避免一个合法动作作用于其他部门的报告。实验逐层显示结果，使一个成功条件无法掩盖其他失败条件。',
        '本案例把 export 定义为需要确认的高影响动作。确认记录必须指向此次资源与动作：同意导出报告 A 不能许可导出报告 B，阅读确认也不能许可导出。HTTP 分支还检查输入的 token audience 是否符合目标服务，以及 token scope 是否包含动作；stdio 将这两项 HTTP 检查标为不适用，同时继续检查身份、用户许可、委托许可、资源归属和动作确认。任何必需条件失败，最终都不给予执行许可。',
        '实验使用课程自拟权限数据计算布尔判断，不执行真实工具，不验证签名，不联系授权服务器，也不实现完整 OAuth。先运行允许阅读的正常案例，再一次只改变委托动作、资源租户、audience 或确认记录，观察哪层发生变化。还可设置多个同时失败的条件，检查结果是否分别呈现全部原因。由此得到的表格说明教学策略的行为，真实服务仍需实现对应的执行检查。',
        '面板中的身份有效和 token 动作范围来自预设场景，用来呈现认证失败与权限不足的区别。身份无效时，不能因为其余集合包含动作就继续执行；身份有效而 token 缺少所需动作时，则由对应范围检查拒绝。逐项结果包含身份、用户、委托、资源、目标、范围和确认共七项，其中不适用项有明确标识。实际部署应由可信组件产生这些事实，模型或普通输入字段无法自行宣布认证成功。',
      ],
      visuals: [{ visualId: 'visual-ma-07-detail', afterParagraph: 1 }],
      keyPoints: ['有效身份之后，动作取用户许可与委托许可的交集。', '资源归属、HTTP 凭据条件与具体确认分别检查。', 'stdio 省略 HTTP audience/scope 检查，保留身份与业务权限检查。'],
      sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security', 'res-ma-owasp-agency'],
    },
    {
      id: 'ma07-local-content',
      title: '本地进程和不可信内容也需要执行边界',
      paragraphs: [
        'stdio 连接通常由客户端启动本地服务器进程，进程可能拥有运行用户的文件与网络访问能力。因此本地运行并不自动得到隔离。MCP 安全指导要求支持一键配置本地服务的客户端清楚显示完整命令和参数，并取得用户确认；最小文件范围、网络限制和 OS sandbox 则要由实际部署实现。一次确认安装或启动某个服务，也需要与后续高影响动作的业务确认分别管理。',
        '工具 annotations 是服务器给出的行为提示；不可信服务器可以提供不准确的描述。标注只读无法从技术上阻止写入，返回数据满足 JSON schema 也无法证明其中的指令获得授权。检索文档、工具结果或其他 Agent 可能要求资料助手扩大任务范围。host 可以把这些内容作为待分析的材料，但不能仅凭它们修改保存的用户许可或委托许可。',
        '在星桥案例里，一份供应商资料写着“审核需要导出全部部门记录”，研究 worker 应继续按原始任务提取证据。即使模型生成了导出提案，执行端仍依据可信身份、资源归属和本次委托检查。可以把读取工具与导出工具分配给不同角色，并只给下游身份必要权限；如果使用通用命令工具，还需要承担更广的执行风险。内容检测与模型提示可以帮助识别风险，实际权限承担最终行动约束。',
      ],
      keyPoints: ['本地进程权限由运行环境实际限制。', '工具 annotations 与外部文本不能自行扩大许可。', '每次下游动作都以可信身份与资源策略验证。'],
      sourceIds: ['res-ma-mcp-security', 'res-ma-mcp-tools', 'res-ma-owasp-agency'],
    },
    {
      id: 'ma07-permission-evidence',
      title: '把授权判断写成可复验的证据表',
      paragraphs: [
        '完成练习时，先为每例记录 transport、用户动作集合、委托动作集合、请求动作和目标资源，再补上资源租户、目标服务与确认所绑定的资源及动作。写出预期结果后再运行实验，逐项记录实际判断。至少保留正常阅读、委托不含导出、跨租户资源、HTTP audience 错误和导出确认不匹配的案例，并对照 stdio 下同一业务请求的判断。',
        '证据表需要同时解释允许与拒绝。只测试所有条件均为假的请求，无法证明正常任务仍可完成；只测试正常阅读，无法证明导出受到约束。如果调整委托范围后允许导出，继续验证资源和确认条件依然独立生效。把多个失败层全部记录，还能防止只修复最先发现的错误后，另一项越权条件被遗漏。不同拒绝原因的统计可以帮助团队定位配置、授权或业务策略问题。',
        '最终交付包含各例输入、预期、逐层实际结果和总判断，并注明课程策略与真实实现的责任边界。面试解释时先说 transport，再说 token 面向哪个服务器，最后说明动作、资源与委托检查发生在哪里。真实系统的授权失败应由执行记录证明，日志避免保留完整凭据。下一课会把本表与协议、协作结果、质量和成本证据合并，形成整个系统的验收包。',
      ],
      keyPoints: ['每例先写预期，再对照逐层结果。', '同时保留允许、单条件拒绝和多条件拒绝。', '交付物注明教学范围及真实实现责任。'],
      sourceIds: ['res-ma-mcp-auth', 'res-ma-mcp-auth-security', 'res-ma-mcp-security', 'res-ma-owasp-agency'],
    },
  ],
  misconceptions: [
    { claim: '客户端声明支持某项 capability，就有权调用相关业务。', correction: 'capability 说明协议功能支持；用户、动作和资源授权需要在 host、服务器及下游执行位置继续检查。' },
    { claim: '用户拥有 export，所有子 Agent 都自动拥有 export。', correction: '委托可以进一步缩小行动范围；课程实验只在用户许可和委托许可均包含动作时继续检查其他条件。' },
    { claim: '带 read scope 的有效 token 可以在任意 MCP 服务使用。', correction: 'token 还受目标 audience 约束，服务器必须拒绝发给其他服务的 token，禁止把它原样转送作为自身授权。' },
    { claim: '改用 stdio 后可以取消全部权限检查。', correction: 'stdio 不使用本课的 HTTP OAuth 流程；本地进程权限、用户与委托动作、资源归属和敏感操作确认依然需要管理。' },
  ],
  recap: ['分别判断身份、协议能力和业务授权。', '用 PRM 与 issuer 验证发现正确的授权服务器。', 'audience 和逐客户端同意分别保护服务目标与代理关系。', '将用户许可、委托许可、资源与具体确认逐层求交。', '用正常与拒绝案例证明执行端规则，并注明 transport 和教学限制。'],
  nextStep: '进入集成验收，把权限表与任务分工、请求记录、失败恢复和质量成本比较放在同一组案例中，检查各组件合作后的最终业务结果。',
  tests: {
    status: 'passed',
    commands: ['node --check src/data/multi-agent-notes/ma-07.js', 'node --check src/data/multi-agent-lessons/ma-07.js', 'node --test tests/multi-agent-core.test.js'],
    results: [
      { command: 'node --check src/data/multi-agent-notes/ma-07.js', exitCode: 0, summary: '笔记 ES module 语法检查通过。' },
      { command: 'node --check src/data/multi-agent-lessons/ma-07.js', exitCode: 0, summary: '课程、面试与覆盖数据语法检查通过。' },
      { command: 'node --test tests/multi-agent-core.test.js', exitCode: 0, summary: '6 项真实函数测试通过，包含委托交集、HTTP audience/scope 与 stdio 业务权限。' },
    ],
  },
});
