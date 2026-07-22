const sections = Object.freeze([
  Object.freeze({
    id: 'start-from-a-threat-model',
    title: '先用威胁模型决定隔离边界',
    paragraphs: Object.freeze([
      '上一课解决“某个工具调用是否获准”，这一课处理更坏的情况：已获准的 run_code 执行了恶意仓库、依赖安装脚本或失控程序。Threat model（威胁模型）是对受保护资产、攻击者能力、入口、信任边界、预期影响和剩余风险的结构化说明。对于代码 Agent，资产至少包括宿主源码、其他租户数据、长期密钥、内网服务、算力配额和交付产物完整性；攻击路径包括读取越权文件、利用过宽挂载、访问内网、偷取凭证、制造 fork bomb 或填满磁盘。',
      'Harness 位于控制面，负责验证任务、选择 provider、生成 manifest 与 capability、创建 session、注入受限资源、设置预算、收集事件并终止清理；sandbox 位于执行面，只运行被允许的代码并返回产物。OpenAI Sandbox Agents 文档直接展示这种 control plane 与 sandbox compute plane 的分离，以及 session、snapshot、挂载和凭证边界。但该功能仍是 Beta，属于 OpenAI SDK 和具体 provider 的当前语义；provider 名称本身不能证明隔离配置正确，更不能证明绝对安全。',
      '威胁模型不同，合理方案也会不同。受信团队仓库中的偶发死循环，重点可能是资源上限、只读输入和可重复清理；来源未知的 PR 连同安装脚本，则还要假设主动探测内网、读取宿主文件和利用运行时漏洞。评审不能只问“用了什么容器”，而要问攻击者能执行到哪一层、哪些资产仍可见、逃逸后果是什么、哪一层负责阻断，以及失败后能否留下不含秘密的诊断证据。',
    ]),
    keyPoints: Object.freeze([
      '威胁模型先列资产、攻击者能力、入口、信任边界、影响和剩余风险，再选择隔离机制。',
      'Harness 控制授权、session、预算与清理，sandbox 只在受限执行面运行代码。',
      'OpenAI Sandboxes 是 Beta 且 provider-specific，不构成任意配置绝对安全的证明。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '先画爆炸半径，再选盒子',
      body: 'sandbox 的目标不是给技术名称贴“安全”标签，而是在最坏输入下把可见资产、可用能力和故障影响压缩到可接受范围。',
    }),
    sourceIds: Object.freeze(['res-harness-openai-sandboxes']),
  }),
  Object.freeze({
    id: 'compare-isolation-mechanisms',
    title: '比较进程、共享内核与独立内核边界',
    paragraphs: Object.freeze([
      '普通宿主进程直接使用宿主内核与当前用户可见资源，隔离主要依赖操作系统身份、目录权限和进程限制；它适合受信代码，却不是运行未知仓库的充分边界。Container（容器）组合 namespace、cgroup、文件系统视图与权限配置，但仍与宿主共享内核。特权模式、宿主目录或 Docker socket 挂载、过宽 capability 和内核漏洞都会扩大后果，因此“运行在容器里”只能说明使用了若干隔离原语，不能自动等同安全 sandbox。',
      'Rootless mode 让 Docker daemon 与容器以非 root 用户运行，并依赖 user namespace 与 subordinate UID/GID 映射，从而缩小宿主身份和 daemon 权限面；它不会自动限制系统调用、挂载、网络、凭证或资源。Seccomp 则在 syscall 层按 profile 允许或拒绝调用，Docker 默认 profile 使用 allowlist 与拒绝动作，但官方只称其为中等保护。rootless 和 seccomp 可叠加，却分别只回答“以谁的权限运行”和“可请求哪些系统调用”，不能拼成对完整 sandbox 的证明。',
      'gVisor 在应用与宿主内核之间加入用户态 application kernel，以 Sentry/Gofer 等组件承接大量系统调用，目标是减少应用直接触达宿主内核的表面；Firecracker 通过 KVM microVM、精简设备模型与 jailer、cgroup、chroot、seccomp 等层建立另一种 containment。两份资料都来自项目自身，能说明机制与设计边界，却不是独立安全评估，也不证明某方案对所有负载更安全、更兼容或更经济。',
      '选择时应把威胁、兼容性、启动与复用方式、运维能力、可观测性和逃逸后果放在同一表中。若风险只是受信脚本误耗资源，收紧的 rootless container 可能满足模型；若要运行主动恶意且跨租户的未知代码，团队可评估用户态内核或 microVM 来增加边界，但仍需挂载、网络、身份、预算和清理策略。这里不存在脱离配置和威胁模型的绝对强弱排序。',
    ]),
    keyPoints: Object.freeze([
      '普通进程与容器都使用宿主内核；容器的安全性取决于身份、挂载、capability、网络和运行时配置。',
      'Rootless 收紧身份面，seccomp 收紧 syscall 面，任一单项机制都不等于完整 sandbox。',
      'gVisor 与 Firecracker 展示不同隔离边界，但项目自述不能支持跨威胁模型的绝对排名。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '层数多不等于结论自动成立',
      body: '每层必须写清它阻断哪条攻击路径、仍信任什么以及失效后的后果；否则“容器加 seccomp 加 microVM”只是技术名词堆叠。',
    }),
    sourceIds: Object.freeze([
      'res-harness-gvisor',
      'res-harness-docker-seccomp',
      'res-harness-docker-rootless',
      'res-harness-firecracker',
    ]),
  }),
  Object.freeze({
    id: 'minimize-files-and-secrets',
    title: '把文件、身份与凭证缩到任务所需',
    paragraphs: Object.freeze([
      '代码测试任务通常只需要读取一个仓库并写出构建结果，因此文件策略应从默认拒绝开始：输入仓库以只读方式挂载到固定路径，输出写入独立的临时工作区，宿主根目录、用户主目录、其他项目、设备、容器运行时 socket 和敏感配置一律不挂载。写区使用独立 session 标识和容量上限，任务结束只把通过类型、路径、大小、恶意内容和敏感信息检查的指定产物提升到宿主；输入与输出不能共享一个可任意覆盖的目录。',
      '文件授权不能只检查字符串前缀。Harness 应规范化路径，拒绝越界、设备文件和不允许的链接目标，记录挂载来源、只读或可写属性、sandbox 内目标、内容版本及释放状态；执行面不得自行扩大挂载。OpenAI Sandboxes 的 manifest、capability、session、snapshot 与 mount 边界提供一种实现参照，但完整路径校验、产物提升和清理协议仍是本课程按威胁模型组合的宿主模板。',
      'Secret 应以短期、最小 scope、可撤销的方式提供，最好由 Harness 控制的凭证 broker 或网络代理在获准请求发生时注入，而不是把长期 token 写进镜像、仓库、普通环境转储或 checkpoint。需要提交 Git 变更时，可以让 sandbox 只生成 patch 和测试产物，由控制面验证后使用短期仓库凭证执行提交；若业务必须在 sandbox 内提交，也要把 token 绑定仓库、动作、分支和期限，并在终态立即撤销。Rootless 只降低进程身份权限，并不会自动保护已经暴露给进程的秘密。',
    ]),
    keyPoints: Object.freeze([
      '输入仓库只读挂载，输出进入隔离写区；禁止暴露宿主目录、其他租户、设备与运行时 socket。',
      '短期凭证通过受控 broker 或代理按请求、scope 和期限注入，不能把长期凭证留在 sandbox。',
      '产物返回宿主前要检查路径、类型、大小、敏感信息和完整性，并记录挂载与提升审计。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-docker-rootless',
    ]),
  }),
  Object.freeze({
    id: 'control-network-egress',
    title: '把网络出口、DNS 与依赖下载纳入策略',
    paragraphs: Object.freeze([
      '默认开放网络会让恶意代码扫描内网、访问云元数据服务、外传仓库内容或下载新的载荷。课程策略因此从无网络开始，再按任务开放明确的 egress：列出目的域名或服务身份、端口、协议、请求方法、允许时段和流量预算；显式拒绝环回之外的宿主接口、私有地址、元数据端点与未声明目的地。仅在 Prompt 中要求“不要访问外网”无法强制执行，也不能替代执行面外部的网络策略。',
      '域名白名单还需要 DNS 边界。解析请求应经过受控 resolver，记录查询与结果，限制查询频率，并在连接时按策略再次检查解析出的地址，避免允许域名最终指向禁止网段。更可审计的做法是让 HTTP、包管理器和 Git 流量经过 egress proxy：代理根据 session、目标与方法放行，注入短期上游凭证，限制响应大小并记录不含秘密的摘要。完整 DNS、代理和内网阻断模板是课程威胁模型综合，不是某个 sandbox provider 自动提供的通用保证。',
      '依赖安装既是供应链入口也是网络突破口。优先使用已构建并记录摘要的镜像、组织缓存或经过策略检查的包代理；确需联网安装时，固定仓库与版本来源，隔离安装写区，禁止安装脚本继承长期凭证，并对下载字节、连接数和墙钟时间设上限。代码 Agent 教程中的显式工具列表或 authorized imports 能限制解释器层可导入内容，却不能阻止内核调用、原生扩展、网络访问、挂载读取或资源耗尽，因此 import allowlist 不能被写成内核隔离。',
    ]),
    keyPoints: Object.freeze([
      '网络默认拒绝，必要出口按目的地、协议、方法、时段和流量预算最小开放。',
      'DNS 解析与实际连接都要检查，egress proxy 负责策略、短期凭证、限额和审计。',
      '依赖下载优先走固定镜像或受控代理；import allowlist 不是网络、挂载或内核安全边界。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-smolagents-code',
    ]),
  }),
  Object.freeze({
    id: 'enforce-resource-budgets',
    title: '为七类资源设置软阈值与硬上限',
    paragraphs: Object.freeze([
      'Resource quota（资源配额，也称资源预算）是宿主为一次 sandbox 运行规定的可用资源边界，要从正常任务基线、租户配额和最坏破坏面推导，而不是让恶意样本把历史峰值不断抬高。至少分别限制 CPU、memory、pids、disk、file descriptors、network 与 wall time：CPU 配额约束可用算力，内存上限控制工作集与 OOM 风险，pids 阻断进程爆炸，磁盘配额防止临时区填满宿主，FD 上限抑制句柄耗尽，网络限制连接与字节，墙钟 deadline 保证任务最终退出。模型 token 预算与这些执行资源不是同一层。',
      '软阈值用于告警、降低并发、停止接收新工作或提前保存诊断；硬上限必须由 sandbox 外部的 Harness、内核或编排层强制，执行进程不能自行提高。CPU 达到限额可能先被节流，若进度停止则由墙钟 deadline 终止；memory、pids、disk、FD 和 network 超限要产生可区分的拒绝或终止结果。Docker 资源文档直接支撑容器默认无 CPU/内存上限、内存硬软限制、OOM 与 CPU 约束，但它不覆盖其余类别或完整终态策略。',
      '为调优建立受控观测集：按任务类别记录可信样本的峰值、持续时间、退出原因和产物大小，用分位范围提出初始软阈值，再由租户硬配额和破坏面封顶。被判断为恶意、异常或超限的运行只进入安全事件样本，不能自动提高默认预算；提高上限必须经容量和安全评审，并限制到特定任务类型。这样才能回答“如何根据观测调整预算”，又不让攻击者通过制造极端负载训练系统放宽防线。',
    ]),
    keyPoints: Object.freeze([
      'CPU、内存、进程数、磁盘、FD、网络和墙钟时间必须分别有预算，token 上限不能替代它们。',
      '软阈值驱动告警和降级，硬上限由执行面外部强制且不可由 sandbox 内进程提高。',
      '预算调优使用可信同类任务基线并受租户配额封顶，恶意超限样本不能自动抬高默认值。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-docker-resources',
      'res-harness-firecracker',
    ]),
  }),
  Object.freeze({
    id: 'terminate-cleanly-and-preserve-evidence',
    title: '超限后终止进程树、清理资源并保留证据',
    paragraphs: Object.freeze([
      '所有超限不能折叠成模糊的“任务失败”。课程建议至少区分 resource_cpu_exhausted、resource_memory_oom、resource_pid_limit、resource_disk_limit、resource_fd_limit、resource_network_limit 与 run_wall_time_exceeded，并记录触发阈值、观测值、策略版本和最后进展。原因码让 Runner 决定是否降低并发、扩大经过批准的预算、隔离可疑输入或直接失败，也让面试回答从“杀掉容器”提升为可运营协议。该原因码集合是课程模板，不是 Docker 或 Firecracker 的标准枚举。',
      '终止顺序要由 sandbox 外层控制：先停止派发新工具与网络请求，标记终止原因并尝试协作式退出；在有界宽限期后向 session 或 cgroup 中的根进程及全部后代发出强制终止，确认没有孤儿继续运行。随后关闭网络与代理会话，撤销短期凭证，解除并核对挂载，删除临时写区与快照，释放 worker、地址和配额记录。只杀父进程、只等待容器自行退出或只删除工作目录，都可能留下子进程、租约、秘密或外部通道。',
      '清理前应封存最小诊断产物：退出原因、资源时间线、进程树摘要、stdout/stderr 截断、系统调用或策略拒绝摘要、网络目的地、测试报告、允许提升的产物清单及哈希。诊断包必须脱敏并按访问策略保存，不能把 secret、完整敏感文件或任意内存转储作为“方便排查”的默认产物。OpenAI 的 session/snapshot/凭证边界、Docker 的资源约束和 Firecracker 的 jailer/cgroup 层能提供实现参照；完整终止、清理与诊断顺序仍是课程综合。',
    ]),
    keyPoints: Object.freeze([
      '每类资源超限使用明确原因码和策略版本，不能全部压成一个失败字符串。',
      '终止必须覆盖整个进程树，并撤销网络、凭证、挂载、临时文件、快照与配额租约。',
      '诊断产物保留原因、资源、进程、策略与产物证据，同时过滤秘密和敏感正文。',
    ]),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-docker-resources',
      'res-harness-firecracker',
    ]),
  }),
  Object.freeze({
    id: 'audit-and-tighten-a-code-sandbox',
    title: '用两种威胁场景审计并收紧配置',
    paragraphs: Object.freeze([
      '练习先为“不可信仓库测试”画威胁模型：资产列宿主源码、密钥、内网、其他租户、算力和交付完整性；攻击者能力列任意仓库代码、依赖脚本、子进程、系统调用与网络请求；入口列 clone、build、test、package manager 和 artifact；后果列泄露、篡改、逃逸与拒绝服务。再比较两种场景：受信内部仓库的误行为可评估 rootless container 加只读输入、隔离写区、seccomp 与硬预算；主动恶意的跨租户输入则评估额外用户态内核或 microVM、无默认网络、无直接 secret 和一次性 session。选择必须写剩余风险，不能只报技术名称。',
      '可审查策略按顺序填写：provider 与镜像摘要；用户和 capability；只读输入、隔离写区及禁止挂载；syscall profile；DNS、egress 目的地与代理；短期 secret 注入；CPU、memory、pids、disk、FD、network、wall-time 的软硬限制；超限原因码；进程树终止；凭证、挂载和临时区清理；脱敏诊断与 artifact 提升。对每项注明“阻断哪条攻击路径、由哪一层强制、如何测试、失败时留下什么证据”，这份六类权限边界加资源与清理模板是课程威胁模型综合。',
      '最后执行收紧演练：尝试写只读输入、越界读取、访问宿主或私网、绕过 DNS、读取长期凭证、创建过量进程、填满磁盘、耗尽 FD、超出网络预算和跨过 deadline；每次都应得到预期拒绝或原因码，并在终态确认进程树消失、秘密撤销、挂载解除、临时区清空且诊断包可审计。能根据两种威胁模型解释不同选择，并给出覆盖权限、资源、清理与审计的配置，才满足两项完成标准和三道访谈追问。',
    ]),
    keyPoints: Object.freeze([
      '交付物包括威胁模型、逐项可验证的 sandbox 策略和终止清理清单。',
      '审计覆盖文件、身份、系统调用、网络、凭证、七类资源、终止、清理、诊断和产物提升。',
      '两种威胁模型可以选择不同隔离组合，但每个选择都必须说明攻击路径、强制层与剩余风险。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '配置审查的固定问法',
      body: '资产是什么｜攻击者能做什么｜允许什么｜谁强制｜如何超限｜怎样清理｜保留何种脱敏证据｜还剩什么风险。',
    }),
    sourceIds: Object.freeze([
      'res-harness-openai-sandboxes',
      'res-harness-gvisor',
      'res-harness-docker-seccomp',
      'res-harness-docker-resources',
      'res-harness-docker-rootless',
      'res-harness-firecracker',
      'res-harness-smolagents-code',
    ]),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: '代码放进 Docker 容器后就得到绝对安全 sandbox，不必再检查挂载、权限和网络。',
    correction: '容器共享宿主内核，隔离取决于身份、capability、挂载、网络、系统调用和运行时配置；必须按威胁模型组合并验证边界。',
  }),
  Object.freeze({
    claim: 'Rootless mode 已经解决代码执行安全，因为容器内不再拥有任何危险权限。',
    correction: 'Rootless 主要收紧宿主身份与 daemon 权限面；已经暴露的文件、网络、凭证和资源仍可被进程使用，其他边界必须另设。',
  }),
  Object.freeze({
    claim: 'Seccomp profile 或 Python import allowlist 能单独阻止所有逃逸、网络访问和资源耗尽。',
    correction: 'Seccomp 只过滤 syscall，import allowlist 只限制解释器层导入；二者都不等于身份、挂载、网络、凭证、配额和清理的完整隔离。',
  }),
  Object.freeze({
    claim: 'MicroVM 的技术层级更高，所以在每种威胁模型和工作负载中都必然是最佳选择。',
    correction: 'Firecracker 文档是项目设计自述，不能支持绝对排名；选择还要验证威胁、兼容性、运维、可观测性和剩余风险。',
  }),
  Object.freeze({
    claim: '限制模型 token 或在 Prompt 中要求节省资源，就能防止代码耗尽 CPU、内存和磁盘。',
    correction: '模型预算不约束执行进程；CPU、内存、pids、磁盘、FD、网络和墙钟上限必须由 sandbox 外层强制。',
  }),
  Object.freeze({
    claim: '超限时杀掉父进程就已完成清理，临时目录和凭证可以等后台任务以后处理。',
    correction: '必须终止整个进程树，立即关闭网络、撤销凭证、解除挂载、清理临时区和租约，并先保留经过脱敏的诊断证据。',
  }),
]);

export const harness04Note = Object.freeze({
  readingMinutes: 42,
  introduction: '当 Agent 获准运行仓库代码时，Prompt、工具 schema 和人工审批已经无法限制程序真正触达的系统资源。本章从不可信仓库测试任务出发，用威胁模型连接 Harness 控制面与 sandbox 执行面：先比较普通进程、共享内核容器、rootless、seccomp、gVisor 用户态内核和 Firecracker microVM 的真实边界，再逐项收紧只读输入与隔离写区、DNS 与网络出口、短期凭证，以及 CPU、内存、进程、磁盘、文件描述符、网络和墙钟时间。最后把超限原因码、进程树终止、临时资源清理、脱敏诊断和产物提升收束成一份可验证策略。学完后，你应能针对两种威胁模型解释为何选择不同组合，并现场审计一份覆盖权限、资源、清理与证据的代码执行配置。',
  sections,
  misconceptions,
  recap: Object.freeze([
    '威胁模型明确资产、攻击者能力、入口、信任边界、影响和剩余风险，隔离方案必须由它推导。',
    'Harness 是控制面，sandbox 是执行面；OpenAI Sandboxes 的当前 Beta/provider 语义不能外推为绝对安全。',
    '普通进程与容器共享宿主内核；rootless、seccomp、gVisor 和 microVM 位于不同边界，不能脱离配置绝对排序。',
    '输入仓库只读挂载，输出进入隔离写区，宿主目录、运行时 socket、设备和其他租户默认不可见。',
    '网络默认拒绝，必要流量经受控 DNS 与 egress proxy；依赖安装使用固定镜像、缓存或受策略约束的代理。',
    'Secret 以短期、最小 scope、可撤销方式注入；import allowlist 不等于内核、挂载、网络或凭证隔离。',
    'CPU、内存、pids、磁盘、FD、网络和墙钟时间分别设置软阈值与外层硬上限，token 预算不能替代执行预算。',
    '超限使用明确原因码，终止整个进程树，撤销网络和凭证，解除挂载并清理临时区，同时保留脱敏诊断与产物哈希。',
  ]),
  nextStep: '下一课将在这套隔离边界之外继续治理时间与失败：区分单次 attempt timeout、整个 run deadline 和协作式 cancellation，并为模型调用、只读查询与写操作设置有限 retry、backoff、jitter 和预算传播。sandbox 可以在失控代码超限时强制终止，却不能说明错误是否值得重试，也不能把已经发生的外部副作用自动回滚；因此请保留本章的原因码、资源时间线和终止证据，它们会成为下一课错误分类和取消决策的输入。',
});
