const sections = Object.freeze([
  Object.freeze({
    id: 'choose-planning-by-task-structure',
    title: '先看任务结构：Reactive 与 Plan-and-execute 不是强弱排名',
    paragraphs: Object.freeze([
      '上一课已经建立 decide–act–observe 循环；本课要决定的是，一次只选眼前动作，还是先保存一个跨多步的行动结构。Reactive（反应式）策略每轮依据最新 observation 选择下一动作，不要求预先固定完整路径。它适合步骤少、依赖弱、环境反馈频繁且下一步高度依赖刚取得事实的任务；优势是能快速吸收变化，代价是容易只顾局部、重复查询，也较难提前估算关键路径与总预算。ReAct 原论文支撑行动与环境观察交错的机制，但其具体实验结果不能外推为 reactive 在所有动态任务都更好。',
      'Plan-and-execute（先规划后执行）先把目标转换成里程碑、依赖和中间产物，再按计划调度动作。它适合多个步骤存在明确先后关系、产物会被下游消费、返工代价较高的任务；全局结构让并行机会、验证点和预算更可见，但初始计划建立在不完整 belief 上，环境一变就可能过期。Plan-and-Solve 论文研究先生成计划再求解的静态推理提示；它能支撑“先分解再求解”的研究路线，却没有工具环境、动态 observation 或运行时重规划，所以不能被当作生产 plan-and-execute 控制器规范。',
      '工程选择应同时检查任务长度、依赖密度、反馈频率、错误代价与验证成本，而不是比较方法名称。一步查询或每步都会获得决定性新事实时，reactive 往往够用；十个步骤共享稳定前提且有清楚依赖时，显式计划更利于治理；长任务同时面对变化环境时，常用混合策略：先保存粗粒度里程碑，每到验证点再由最新 observation 决定局部动作或修订剩余计划。这个选择框架是课程综合，应通过本团队任务集的成功证据、调用次数、延迟与恢复成本验证。',
    ]),
    keyPoints: Object.freeze([
      'Reactive 以最新 observation 驱动下一动作，适应变化但容易短视与重复；显式计划展示依赖和里程碑，却可能因旧假设失效。',
      '任务长度、依赖、反馈频率、错误代价与验证成本共同决定策略，不存在对所有任务必胜的规划范式。',
    ]),
    callout: Object.freeze({
      kind: 'intuition',
      title: '路线图与路口导航',
      body: '显式计划像出发前画路线图，reactive 像每到路口再看实时路况；复杂动态任务通常保留路线图，但允许路口证据修改后半程。类比只解释控制粒度，不证明任何策略的效果。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-plan-solve', 'res-agent-ms-plan-video']),
  }),
  Object.freeze({
    id: 'decompose-into-verifiable-work',
    title: '可验证分解：步骤必须有输入、动作、产物与验收',
    paragraphs: Object.freeze([
      '任务分解不是把一句大目标换成几句同样含糊的动词。一个可执行步骤至少要写清输入、允许动作、输出 artifact（可被保存和检查的中间产物）、dependencies（开始前必须成立的依赖）、checkpoint（局部成功谓词）和 failure exit（失败后换路、重规划、blocked 或 handoff 的出口）。例如“研究供应商”不可验收；“从获准目录取得候选供应商清单，输出含名称、来源与访问时间的去重表，至少两条独立来源或显式标记证据缺口”才让宿主能判断完成与缺口。上述精确字段是课程工程综合，不是某篇论文发布的标准。',
      '合理粒度由工具能力、上下文预算、错误隔离和下游消费方式共同决定。若一个步骤跨越多个工具权限、需要装入超过单次上下文预算的材料，或同时要求发现候选、核验资质、比较报价并写建议，任一失败都难以定位，应继续拆成能由一个工具或短循环完成、能独立保存和重试的步骤；若相邻步骤使用同一工具、共享同一输入与验收、没有独立失败出口，且中间 artifact 只会重复占用上下文，就应合并。依赖图用有向边表示“产物 A 必须先于步骤 B”，可发现循环依赖与关键路径；上线后还要按失败轨迹迭代粒度：反复整段返工说明应拆分，频繁跨步搬运同一上下文且总是一起成败则说明应合并。',
      '验证点应靠外部或确定性证据，而不是模型说“这一阶段不错”。可检查候选数、必填字段、来源可访问性、去重键、约束覆盖和冲突标记；验证失败产生结构化 observation，并保持未满足状态。Plan-and-Solve 对计划后求解和错误类型的分析只限于其静态推理实验；Microsoft 视频字幕提供复杂任务拆分、结构化计划与 Pydantic 校验的实现示例，但来自旧课程章节和具体框架。二者可支撑分解与校验方向，不能证明本课程字段集合在所有系统中最优。',
    ]),
    keyPoints: Object.freeze([
      '可验收步骤明确输入、动作、artifact、依赖、checkpoint 与失败出口，模糊动词不能充当计划。',
      '粒度要使失败可隔离、产物可消费，同时避免把同一次工具操作拆成只增加管理成本的碎片。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '一步的最小检查卡',
      body: 'step id｜inputs｜allowed action｜artifact schema｜dependencies｜checkpoint｜failure exit｜step budget。真实字段应按业务和工具契约调整。',
    }),
    sourceIds: Object.freeze(['res-agent-plan-solve', 'res-agent-ms-plan-video']),
  }),
  Object.freeze({
    id: 'plans-as-executable-dataflow',
    title: '从计划文本到数据流：Plan-and-Solve 与 ReWOO 的边界',
    paragraphs: Object.freeze([
      '“先规划”至少有两种不同含义。Plan-and-Solve 在论文设定中先提示模型制定子任务计划，再按计划完成静态推理；增强版 PS+ 还要求抽取相关变量及其数值并完成中间计算。它说明显式分解可以成为提示流程的一部分，也分析缺失步骤、计算和语义理解等错误，但研究没有让步骤调用外部工具，更没有在环境改变后重写计划。因此将 PS 的实验收益直接写成“Agent 先规划必然更可靠”超出了论文证据。',
      'ReWOO 把流程组织为 Planner–Worker–Solver：Planner 预先生成带证据占位符的蓝图，Worker 执行工具并填充证据，Solver 根据蓝图与已取得证据形成答案。关键点是规划阶段不需要在每次工具观察后再次调用规划模型，从而在论文任务、模型和计费口径内减少 token 消耗；代价是固定蓝图降低在线适应性，工具失败或证据改变后不能自然地像每步交错策略那样调整。这里讨论的是论文架构与设定，不是对任何供应商 API 成本的当前承诺。',
      '把计划实现为数据结构时，应保存 planVersion、steps、artifactRefs、dependency edges、assumptions、checkpoints、budgets 与 status；执行器只调度依赖已满足的 ready 步骤，验证器把 observation 变成 passed、failed、unknown 或 constraint-changed，规划器才决定保留、替换或废弃剩余节点。这份 schema 是课程综合，用来把论文思想转译为可审计控制器。它既可表达 PS 式先列后做，也可表达 ReWOO 的证据占位符，却不能借论文名跳过权限、工具校验、并发与恢复设计。',
      '每个版本化步骤采用 pending → ready → running → passed/failed/unknown/invalidated：pending 等待依赖，依赖的当前版本均 passed 后才 ready；dispatch 必须以原子 claim 绑定完整 expected tuple，即 stepId、planVersion、stepVersion、attempt、stableIntent 与单调递增的 fencingToken，随后才进入 running。完成或 commit 使用 CAS 同时比较这六项：当前目标 stepId、planVersion、stepVersion、attempt、同一 stableIntent 和仍有效的 fencingToken；只有完整 tuple 匹配的当前 worker 能发布 artifact、满足 checkpoint 并解锁依赖。计划修订可把旧 pending、ready 或 running 标成 invalidated；来自旧 plan、旧 stepVersion、旧 attempt、错误 stableIntent、错误 stepId 或失效 fencing token 的迟到成功都只能追加 observation 供审计，不能发布 artifact 或改变当前依赖。unknown 副作用按 stable intent 对账，未确认安全前不允许再次 act。这套并发和版本协议是课程工程综合，不是 Plan-and-Solve 或 ReWOO 的原论文机制。运行约束 JSON：{"states":["pending","ready","running","passed","failed","unknown","invalidated"],"claimKey":["stepId","planVersion","stepVersion","attempt","stableIntent","fencingToken"],"dispatch":"atomic-claim-expected-tuple","completion":"cas-full-claim-tuple-with-valid-fencing","currentTuplePublishesArtifact":true,"staleCompletion":"append-observation-only","unknownSideEffect":"reconcile-by-stable-intent-no-repeat-act"}',
    ]),
    keyPoints: Object.freeze([
      'Plan-and-Solve 是静态推理提示研究，不包含工具环境与动态重规划；ReWOO 用 Planner–Worker–Solver 和证据占位符解耦规划与观察。',
      '可执行计划应是带版本、依赖、artifact、假设、验证点、预算和状态的数据，而不是无法局部修订的一段散文。',
      '原子 claim 与完成 CAS/fencing 必须比较 stepId、planVersion、stepVersion、attempt、stableIntent 和有效 fencingToken 六项，阻止任何错误或陈旧 tuple 发布 artifact、满足 checkpoint 或解锁依赖。',
    ]),
    callout: Object.freeze({
      kind: 'boundary',
      title: '效率结果有实验边界',
      body: 'ReWOO 的 token 效率结论属于论文所用任务、模型和实现；固定蓝图是否划算，取决于真实工具失败率、观察依赖与重规划成本。',
    }),
    sourceIds: Object.freeze(['res-agent-plan-solve', 'res-agent-rewoo']),
  }),
  Object.freeze({
    id: 'search-planning-and-evaluation-cost',
    title: '搜索式规划：Tree of Thoughts 用更多候选换取前瞻',
    paragraphs: Object.freeze([
      '当单一路径很容易早早走错，规划可以从线性清单升级为搜索。Tree of Thoughts（ToT）把 thought 定义为可作为中间状态的连贯文本单元，在每个状态生成多个候选，对候选状态进行评价，再用广度优先或深度优先等策略探索、前瞻与回溯。它与“让模型多写几句思考”不同：系统必须显式维护候选、分支、评价与搜索前沿，失败分支可以被剪枝，尚有希望的状态才继续扩展。',
      '搜索不会免费带来正确性。分支因子为 b、深度为 d 时，未剪枝候选数量可能迅速增长；每个节点还要支付生成、评价、上下文、延迟和错误传播成本。评价器若无法可靠区分进展，搜索只会把同一种偏差复制到更多分支。ToT 论文在 Game of 24、创意写作和迷你填字三个特制任务上评估，并依赖正确的问题分解与状态评价；结果不能外推成开放工具环境或所有规划任务的普遍优势。',
      '工程上先设置搜索预算，再决定是否搜索：最大深度、每层候选数、总评价次数、墙钟时间和最低分差都要成为硬边界。若步骤有清楚依赖且每个 checkpoint 能直接验证，线性计划通常更便宜；只有选择不可逆、早期分支会影响全局、能构造有区分力的外部评价器，并且错误成本高于搜索成本时，才值得保留多个候选。搜索停止后仍须把胜出路径转回可执行步骤，并在真实 observation 到来时重新核验。',
    ]),
    keyPoints: Object.freeze([
      'ToT 显式维护 thought 候选、状态评价和 BFS/DFS 式搜索，允许前瞻与回溯，但不等于普通长思维文本。',
      '分支、评价和延迟构成搜索成本；没有可靠评价器或硬预算时，增加候选可能只会放大偏差。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: '先证明评价器有信号',
      body: '如果两个候选只能靠同一个模型无依据地自评，搜索排序可能不稳定；优先接入规则、测试、环境状态或人工检查等独立信号。',
    }),
    sourceIds: Object.freeze(['res-agent-tot-paper']),
  }),
  Object.freeze({
    id: 'observation-driven-replanning',
    title: 'Observation 驱动重规划：修改的是失效假设，不是重写全部历史',
    paragraphs: Object.freeze([
      '计划是一组基于当前 belief 的行动假设，不是执行命令的真理。每个 checkpoint 都要比较 expected observation 与 actual observation，并把差异分类为局部步骤失败、依赖失效、新约束、权限变化、目标变化或证据不足。权限被撤销、凭据范围缩小或审批状态改变，都会使依赖该权限的未执行步骤不可运行，也可能使按旧权限取得、准备写入或尚未授权共享的 artifact 失效；它们必须作为结构化 observation 写入状态。只有相关状态发生最小但实质的变化才触发修订；模型因为措辞不同就重写计划不算新证据。ReAct 能支撑环境 observation 进入后续决策，ReWOO 则明确展示固定蓝图在工具失败时的适应性限制；触发分类和 planVersion 规则属于课程工程综合。',
      '局部修订适用于目标和大部分依赖仍有效的情况：替换一个获准数据源、修正一个查询、降级为仍有权限的只读动作、重跑受影响步骤，并使所有消费旧 artifact 的下游节点失效。整体重规划适用于顶层目标或硬约束改变、关键依赖或必需权限永久不可用、依赖图产生冲突，或多次局部恢复仍无进展；若缺失权限可由明确授权解除，则记录缺口和解除条件后 blocked，若风险、审批或权限归属需要有权者裁决，则连同 planVersion、证据和受影响 artifact 进入 handoff。任何修订都应保留触发 observation、保留节点、废弃理由和预算差异，使评审者能回答“为什么改、改了什么、旧产物还能否用”。',
      '为防止重规划震荡，控制器同时限制 replan count、总模型调用、墙钟时间与连续无进展次数，并可要求冷却或最小状态差异。若新计划只是给同一失败动作换个名字、没有新的 artifact 或 checkpoint，就应停止并 blocked/handoff，而不是继续烧预算。反过来，忠于旧计划也不是稳定性：新硬约束已明确冲突时继续执行，会把早期错误传播到所有下游步骤。以上权限传播规则、局部或整体重规划阈值、最小状态变化、冷却与最大次数整组规则都是课程工程综合，不归因于 ReAct 或 ReWOO；两份来源只支撑 observation 进入后续决策及固定蓝图的适应性边界。',
    ]),
    keyPoints: Object.freeze([
      '重规划由 expected 与 actual observation 的可观察差异触发，并区分局部修订与整体重建。',
      '版本、影响范围、废弃原因和预算变化必须留痕；最大重规划次数与无进展阈值阻止计划震荡。',
    ]),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-rewoo']),
  }),
  Object.freeze({
    id: 'supplier-research-strategy-board',
    title: '供应商研究棋盘：把三种策略写成同一份可比较契约',
    paragraphs: Object.freeze([
      '贯穿案例是为采购方研究候选供应商：必须从获准来源发现候选，核验地区与合规约束，收集能力和报价证据，比较冲突，最后输出带来源的 shortlist。三种策略必须面对同一 task contract、只读工具和完成谓词，才能公平比较。以下棋盘中的数量是本地教学预算，不是论文推荐值；生产配置必须依据工具延迟、来源规模、风险和历史轨迹校准。每项都明确 actions、artifacts、dependencies、checkpoints 与 budgets，以便直接完成练习第一步。',
      '策略棋盘 JSON：[ {"strategy":"reactive","actions":{"r1":"search-candidates","r2":"fill-largest-gap"},"artifacts":{"r1":["candidates"],"r2":["evidence-board","gap-list"]},"dependencies":{"r1":[],"r2":["r1"]},"checkpoints":{"r1":"schema-valid","r2":"new-evidence"},"budgets":{"r1":{"calls":3,"minutes":4},"r2":{"calls":5,"minutes":6}},"replanBudget":0}, {"strategy":"plan-and-execute","actions":{"p1":"discover-and-verify","p2":"compare-and-draft"},"artifacts":{"p1":["candidate-table","constraint-report"],"p2":["shortlist"]},"dependencies":{"p1":[],"p2":["p1"]},"checkpoints":{"p1":"sources-and-constraints-valid","p2":"shortlist-has-evidence"},"budgets":{"p1":{"calls":6,"minutes":7},"p2":{"calls":2,"minutes":3}},"replanBudget":1}, {"strategy":"hybrid","actions":{"h1":"reactive-discovery","h2":"milestone-verify-and-draft"},"artifacts":{"h1":["evidence-board"],"h2":["revision-log","shortlist"]},"dependencies":{"h1":[],"h2":["h1"]},"checkpoints":{"h1":"evidence-progress","h2":"constraints-and-evidence-valid"},"budgets":{"h1":{"calls":4,"minutes":4},"h2":{"calls":4,"minutes":6}},"replanBudget":2} ]',
      'Reactive 每轮盯住当前最大证据缺口，适合来源不稳定、下一查询依赖刚读到的事实，但必须用 gap-list 和无进展阈值防止重复。Plan-and-execute 先固定发现、核验、比较和成稿的依赖，适合约束稳定且产物边界明确的调研，但数据源变化时可能使后续全部失效。混合策略保留阶段里程碑，在阶段内部 reactive，并只重建受影响后半段；它不是自动最佳，而是用额外 planVersion 与验证开销交换适应性。Microsoft 视频提供结构化计划与校验示例，ReAct、Plan-and-Solve 和 ReWOO 分别提供交错反馈、先规划后求解及规划观察解耦的研究视角；具体棋盘仍是课程综合。',
    ]),
    keyPoints: Object.freeze([
      '三种策略必须在同一目标和证据标准下比较，并逐项写 actions、artifacts、dependencies、checkpoints 与 budgets。',
      '混合策略保留全局里程碑并在局部吸收 observation；它增加版本与验证成本，不能默认视为最佳。',
    ]),
    callout: Object.freeze({
      kind: 'example',
      title: '交付物不是三段口号',
      body: '提交时保留三份机器可读策略卡、统一的 evidence board，以及每次 observation 如何改变 planVersion 的修订记录。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-plan-solve', 'res-agent-rewoo', 'res-agent-ms-plan-video']),
  }),
  Object.freeze({
    id: 'failure-injections-and-lab-boundary',
    title: '三类注入：空结果、超时与新约束必须走不同恢复路径',
    paragraphs: Object.freeze([
      '同一个“步骤没完成”不能统一处理为重试。空结果若是 success=true 且 items=[]，说明查询执行成功但当前范围无命中：先记录已查范围，扩大或替换查询、换获准来源，再更新依赖于候选集的步骤；只有所有允许来源都无结果且没有可接受降级时才 blocked。新约束例如“供应商必须在欧盟托管数据”会改变候选有效性：写入 constraint-changed observation，使旧候选和比较产物失效，保留仍满足条件的证据，局部修订或整体重规划并重跑约束 checkpoint，而不是忽略新事实。',
      '恢复记录 JSON：[ {"injection":"empty-result","reason":"工具成功但当前查询范围没有候选","recovery":"mark-scope-searched→change-query-or-source→replace-discovery-step","exit":"allowed-sources-exhausted则blocked"}, {"injection":"timeout","reason":"响应缺失时外部终态可能未知，副作用不能按失败假定","recovery":"record-unknown→reconcile-by-stable-intent→仅确认未执行且预算允许时重放","exit":"无法对账则handoff"}, {"injection":"new-constraint","reason":"硬约束改变使旧计划假设和部分artifact失效","recovery":"version-constraint→invalidate-dependent-artifacts→local-revise-or-full-replan→revalidate","exit":"约束不可同时满足则blocked"} ]。这里的 stable intent 是宿主生成并持久化、用于标识同一业务意图的唯一 client request identifier/idempotency key，不由模型临时编造；它把初次调用、终态查询和获准重放关联到同一意图。供应商实验固定使用只读查询，timeout 后 retry 只适用于无副作用读操作；创建订单、付款或发送消息等副作用动作必须先对账。',
      '页面 plan-recovery 实验只是本地确定性教学状态机：它根据选定策略、observation 类型和重试计数展示恢复分支；底层函数还可接收宿主可信的 operationKind（read-only/side-effect）与 reconciliationStatus（not-required/unknown/confirmed-not-executed/cannot-reconcile），这些值来自工具 registry 与对账记录，不能采信模型自报。实验固定传入 read-only/not-required，副作用 unknown 走 reconcile、cannot-reconcile 走 handoff，只有 confirmed-not-executed 且预算允许才 retry。它不调用真实模型、供应商数据源或论文实现，不测量论文方法的能力；它不是模型、论文方法或生产可靠性的评测。真实系统还需接入终态对账、幂等/审计、真实依赖图、预算持久化和业务验证器。',
    ]),
    keyPoints: Object.freeze([
      '空结果是成功执行后的无命中，新约束是计划假设失效，超时则可能形成未知外部终态；三者不能都原样重试。',
      '超时涉及副作用时必须先按稳定 intent 对账，确认未执行才可在预算内重放；无法判定则 handoff。',
      'plan-recovery 只验证本地确定性恢复分支，不是模型、论文方法或生产可靠性的评测。',
    ]),
    callout: Object.freeze({
      kind: 'warning',
      title: 'Timeout 不等于失败',
      body: '客户端没有收到响应，只能证明响应未知；如果动作可能已产生副作用，直接执行第二次可能造成重复写入。先对账，再决定是否重放。',
    }),
    sourceIds: Object.freeze(['res-agent-react-paper', 'res-agent-rewoo', 'res-agent-aws-idempotent-apis']),
  }),
]);

const misconceptions = Object.freeze([
  Object.freeze({
    claim: 'Plan-and-execute 一定比 reactive 更聪明，因为它一次看得更远。',
    correction: '全局结构能展示依赖，却会受初始假设过期影响；反馈频繁的短任务可能更适合 reactive。应以任务结构、验证成本和真实轨迹比较，而非按名称排强弱。',
  }),
  Object.freeze({
    claim: '把“研究、分析、完成报告”列成三步，就已经完成任务分解。',
    correction: '这些动词没有输入、工具边界、artifact、依赖和 checkpoint，宿主无法判断进展或局部恢复。每步必须产生可被下游消费与验证的结果。',
  }),
  Object.freeze({
    claim: 'ReWOO 解耦规划和观察后，工具失败也不会影响既定计划。',
    correction: '固定蓝图正会降低对新观察和工具失败的在线适应性；失败证据必须使相关占位符和下游步骤失效，再选择替换或重规划。',
  }),
  Object.freeze({
    claim: 'Tree of Thoughts 生成越多候选就越可靠，搜索预算只影响费用。',
    correction: '候选还会放大评价器偏差、上下文和延迟；若没有有区分力的外部评价信号，更多分支不等于更接近正确答案。',
  }),
  Object.freeze({
    claim: '强模型生成的初始计划应被完整执行，新约束最多只能修改工具参数。',
    correction: '计划基于当时的 belief。硬约束、关键依赖和证据改变时，旧步骤与下游 artifact 可能已无效，必须版本化修订或重建计划。',
  }),
  Object.freeze({
    claim: '工具超时就是没有执行，按原参数重复调用最安全。',
    correction: '超时只表示响应未知，副作用可能已经发生。必须使用宿主持久化的稳定 intent 查询终态，确认未执行后才可在预算内重放；不能对账就 handoff。',
  }),
]);

export const agent05Note = Object.freeze({
  readingMinutes: 38,
  introduction: '上一课把单 Agent 写成受预算约束的 decide–act–observe 控制循环；本章进一步回答“循环每次只看眼前，还是先保存跨多步计划”。你将从任务依赖、反馈频率与错误代价选择 reactive、plan-and-execute 或混合策略，把模糊目标拆成带产物、依赖、验证点和预算的可恢复步骤，并理解 Plan-and-Solve、ReWOO 与 Tree of Thoughts 各自真正研究了什么。最后用供应商研究棋盘走查空结果、超时和新约束，生成三份可比较策略卡与一份 observation 驱动的计划修订记录；所有论文结论只保留原任务和评测边界。',
  sections,
  misconceptions,
  recap: Object.freeze([
    'Reactive 每轮依据最新 observation 决策，适合短、依赖弱或变化频繁的任务；显式计划适合依赖清楚、产物可验证的长任务。',
    'Plan-and-execute 展示全局结构却可能被旧假设拖累；动态长任务常用里程碑加局部 reactive 的混合策略，但它不是默认最优。',
    '可验证步骤必须有输入、动作、artifact、dependencies、checkpoint、failure exit 与 step budget。',
    'Plan-and-Solve 研究静态推理中的先规划后求解；ReWOO 用 Planner–Worker–Solver 和证据占位符解耦规划与观察，两者都不是通用生产控制器规范。',
    'Tree of Thoughts 显式维护候选、评价与搜索前沿；分支、评价误差、调用和延迟都必须进入搜索预算。',
    '重规划由 observation 与旧假设的实质冲突触发；局部修订使受影响下游失效，整体重规划处理目标、硬约束或关键依赖变化。',
    '计划修订要保存 planVersion、触发证据、保留与废弃节点、artifact 版本和预算差异，不能无痕覆盖旧计划。',
    '供应商研究的 reactive、plan-and-execute 与 hybrid 三卡都应明确 actions、artifacts、dependencies、checkpoints 与 budgets，才可公平比较。',
    '空结果、新约束和超时代表不同 observation；超时副作用终态未知时必须先对账，不能盲目重放。',
    'plan-recovery 是本地确定性控制教学，不调用真实模型或论文实现，也不构成规划策略能力评测。',
  ]),
  nextStep: '下一课将把本章的 failure exit 展开为完整恢复体系：先区分传输、参数、业务、语义、权限与能力失败，再选择有限重试、修参、换工具、重规划、澄清、blocked 或 handoff；同时比较 Reflexion、Self-Refine、CRITIC 与“模型不能在无外部反馈时稳定自纠错”的证据，学习为什么反思必须接受可校准验证。',
});
