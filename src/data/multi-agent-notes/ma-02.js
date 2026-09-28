import { deepFreeze } from '../multi-agent-shared.js';

export const ma02Note = deepFreeze({
  readingMinutes: 28,
  tests: { status: 'passed', commands: ['node --check src/data/multi-agent-notes/ma-02.js'], results: [{ command: 'node --check src/data/multi-agent-notes/ma-02.js', exitCode: 0, summary: '笔记文件通过 Node.js 语法检查，退出码为零。' }] },
  overviewVisualId: 'visual-ma-02-overview',
  overviewVisualSectionId: 'ma02-control-ownership',
  introduction: '上一课已经识别出可以独立调查的资料任务，以及需要顺序处理的工单状态。接下来要把分工变成实际控制流：谁选择 worker，结果交给谁，谁继续处理用户消息，何时才允许开始下一项工作？本课先区分 manager-as-tools 与 handoff，再设计委托说明，并使用固定时长实验解释依赖、worker 数量和共享写入如何共同决定调度。',
  sections: [
    {
      id: 'ma02-control-ownership', title: '先确定最终回复由谁负责',
      paragraphs: [
        'manager-as-tools 表示主 Agent 把 specialist 当作有边界的能力调用。政策 worker 查询条款并返回结果，渠道 worker 查询维修入口并返回结果，随后 manager 综合员工可采取的步骤。调用期间 specialist 可以执行多个工具动作，但主 Agent 仍保留外层任务与最终回复责任。检查这种设计时，应沿着返回路径确认结果确实回到 manager，并明确由它处理未完成项。',
        'handoff 关注控制权转移。在 OpenAI 的模式说明中，specialist 接管当前分支的后续回复，例如售后专员继续询问保修资料。下一条用户消息应由当前活动参与者处理，系统需要保存相应状态。LangChain 的 handoffs 文档还覆盖单 Agent 根据状态切换提示与工具的做法，因此课程会同时标明实现方式，避免从一个术语直接推断进程数或模型实例数。',
        '两种方式都可能通过 tool call 触发，表面调用形式不能决定责任关系。案例中员工只需要一份综合报修建议时，可以让 manager 保留回复；需要售后角色持续与员工确认具体情况时，可以考虑 handoff。无论采用哪种方式，设计说明都应指出执行者、返回目标、最终回复人和剩余工作。控制权变化也不能自行增加执行权限，权限检查由后续课程专门处理。',
      ],
      keyPoints: ['manager-as-tools 保留外层回复责任', 'handoff 要明确后续行为、活动状态与实现定义'],
      sourceIds: ['res-ma-openai-orchestration', 'res-ma-langchain-handoffs', 'res-ma-langchain-subagents'],
    },
    {
      id: 'ma02-pattern-selection', title: '按工作项的产生方式选择编排',
      paragraphs: [
        'routing 通常先判断输入类别，再交给对应能力。设备政策问题进入政策流程，维修入口问题进入渠道流程，分类规则需要足够明确。固定 parallelization 则预先知道要完成哪些独立工作，例如每次都查询政策和渠道后汇总。它们都可以使用模型，但流程中的关键决定已经由设计者限定；不要因为有多个节点就假定每一步都需要自主规划。',
        'orchestrator-workers 适用于工作项随输入变化的场景。员工比较三个地区的维修安排，主 Agent 可以先识别涉及的地区和资料，再产生相应任务。LangGraph 的示例使用 Send 向动态 worker 提供专属输入，并把结果汇集到主流程。动态创建并不意味着数量无限，主 Agent 仍需限制职责重叠、总预算和可同时运行的工作，否则协调本身会占用大量资源。',
        '几种模式可以组合使用。入口先判断是否属于报修，再由 manager 选择两个研究 worker；只有需要持续对话的分支才交给 specialist。设计者应为每个选择写出理由，并保留简单路径：短政策问题可以直接由单 Agent 完成。不同控制流的价值需要用同一任务集验证，不能仅凭图中节点更多，就认为它能够处理更多真实情况。',
        '控制流中也可以设置明确检查节点。例如两份资料返回后，程序先检查是否都有可访问引用，缺少引用的工作项再进入补充调查。开放质量可由评价流程给出具体反馈，但循环必须有结束条件。这样能够分清哪些决定来自明确规则，哪些依赖模型判断，以及哪一步需要人工处理；每一种决定都应该能在执行记录中找到对应证据。',
      ],
      keyPoints: ['routing 选择类别，固定并行执行已知独立工作', 'orchestrator-workers 根据输入产生工作项并汇集结果'],
      sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows', 'res-ma-research-system'],
    },
    {
      id: 'ma02-delegation-brief', title: '把委托写成可以完成的工作说明',
      paragraphs: [
        '“研究报修问题”缺少可操作边界。更清楚的委托是：根据已确认的政策版本，查明设备 D17 是否需要先完成保修查询，返回结论、依据位置、适用条件和无法确认的事项；维修地址由另一 worker 处理。这样既说明目标和输出，也说明工作分配。Anthropic 的实践将目标、输出形式、工具与来源指导、任务边界列为委托的必要信息。',
        '为教学工单可以写一份本地工作说明，包含 taskId、objective、dependencies、inputs、allowedTools、outputFormat 和 budget。这些字段由课程设计，不是某个 SDK 强制的 schema。dependencies 指出必须取得哪些结果才能开始，budget 说明工作范围或调用上限，outputFormat 告诉 worker 哪些证据必须返回。主 Agent 在派发前检查这些字段是否足以让另一个参与者独立完成任务。',
        '还要约定结束方式。已找到充分证据就返回结果；资料相互冲突时标明冲突与缺口；工具持续失败时报告已经尝试的范围和未完成事项。不要让“继续努力”成为唯一指令，否则 worker 可能不断搜索相同内容。主 Agent 汇总时应能识别哪些工作完成、哪些需要补充或升级处理，工作说明的好坏最终体现在是否减少重复、遗漏与含糊的完成声明。',
        '委托说明还应写明执行者、返回目标和回复责任人。manager 调用中，政策 worker 把调查结果返回主 Agent，由主 Agent 继续综合并回复员工；采用 handoff 时，应标明接管当前分支的 specialist，以及后续消息交给谁处理。把这些责任和任务目标一起记录，才能检查工作说明是否覆盖了完成后的控制流；它们是应用设计要求，具体状态字段由所选框架决定。',
      ],
      keyPoints: ['委托包含目标、输入、输出、来源范围和停止条件', '本地任务字段用于责任清晰，不冒充 SDK 标准'],
      sourceIds: ['res-ma-research-system', 'res-ma-langchain-subagents', 'res-ma-openai-orchestration', 'res-ma-langchain-handoffs'],
    },
    {
      id: 'ma02-scheduling-model', title: '用固定时长算清依赖与并发',
      paragraphs: [
        '本课实验只计算一个确定的时间模型。准备 prepare 用二个时间单位；检索 A 用四个、检索 B 用六个；汇总 synthesize 用三个；核验 verify 用二个。依赖为准备完成后启动两项检索，两项都完成后才能汇总，汇总完成后才能核验。任务时长由教学输入指定，不包含模型随机性、网络等待、派发费用或真实质量变化。',
        '只有一个 worker 时，按 A 后 B 的顺序执行，时间区间为准备零到二、A 二到六、B 六到十二、汇总十二到十五、核验十五到十七，总时长十七。两个 worker 且检索独立时，A 与 B 都在二开始，分别在六和八结束；汇总八到十一，核验十一到十三，总时长十三。总任务工作量仍为二加四加六加三加二，等于十七。',
        '最早完成时间受最长依赖路径限制。准备、检索 B、汇总、核验这一条路径合计十三，增加到更多 worker 也无法消除这些前后关系。观察实验时，请同时检查每项开始时间是否晚于所有前置任务结束，以及同一时刻占用的 worker 是否超过上限。若两项检索共享写入对象，模型要求它们串行，总时长恢复十七；下一节继续解释这项资源约束。',
      ],
      keyPoints: ['一个 worker 总时长 17，两个独立 worker 总时长 13', '并行缩短等待，固定任务总工作量仍为 17'],
      visuals: [{ visualId: 'visual-ma-02-detail', afterParagraph: 1 }],
      sourceIds: ['res-ma-effective-agents', 'res-ma-langgraph-workflows'],
    },
    {
      id: 'ma02-shared-write', title: '共享写入会收紧并行空间',
      paragraphs: [
        '现在为两项检索加入同一个共享写入对象，例如它们都把中间结果更新到同一份工单摘要。实验采用保守规则：同一对象同时只允许一个写入任务，因此 A 与 B 必须顺序执行。即使界面选择两个 worker，另一个 worker 也不能绕过资源约束提前写入，完成时间重新成为十七。这个变化来自资源关系，单纯增加执行名额无法解决。',
        '真实系统可以通过不同 artifact、明确合并规则或由单一流程写入最终对象来设计协作，但每种做法都需要具体实现与验证。课程实验仅用串行规则呈现冲突风险，不模拟数据库锁、事务或自动冲突解决。若两个 worker 各自提交独立研究文件，再由主流程完成有序合并，输入模型中的共享写入条件才发生变化；上下文隔离本身没有提供这项保障。',
        '对实验的解释应同时交代配置与边界：一个 worker 得十七；两个 worker 且无共享写入得十三；两个 worker 共享写入得十七。数值支持对这组任务的调度判断，不支持“真实 Agent 一定提速多少”的结论。网络波动、不同回答长度和重试会改变实际时间，结果质量还需独立评测。把时间模型与真实运行证据分开记录，才能避免错误推广。',
        '如果把检索改为后台执行，共享写入规则仍然有效，同时要补充 jobId、状态查询和结果获取方式。主 Agent 必须知道任务正在等待、已经完成或明确失败，并为失败项指定继续处理的负责人；已经完成的独立调查可以保留。教学时间表没有模拟这些后台状态，因此练习需要把状态与失败去向另行写入说明，避免把调度结束时间直接当作真实任务完成证据。',
      ],
      keyPoints: ['共享写入规则可以要求两个检索串行，总时长恢复 17', '独立上下文、资源互斥和业务正确性是不同检查'],
      sourceIds: ['res-ma-effective-agents', 'res-ma-research-system', 'res-ma-langchain-subagents'],
    },
    {
      id: 'ma02-lifecycle-control', title: '每条工作路径都需要完成与失败出口',
      paragraphs: [
        '同步调用会等待 worker 结果，适合主流程必须使用该结果才能继续的情况。后台执行允许主对话继续处理其他工作，但应用需要记录 jobId、状态和结果获取方式。LangChain 文档中的 async 指这种后台工作模式，Python 的 async 与 await 只是语言机制，不能自动证明用户对话已经独立继续。选择方式时，先判断主流程的下一步是否依赖当前结果。',
        '主 Agent 还需要处理长时间没有返回、明确失败和结果不完整。教学设计可以为每项任务记录 pending、running、completed、failed，并为未完成项指定后续负责人。达到预算或停止条件后应汇报已有结果与缺口，不能把缺失部分写成确定答案。同步、后台和 handoff 都需要明确失败出口；关于取消请求与恢复语义，后续 MCP 运行课程会继续说明。',
        '处理失败时先保留已经产生的有效结果及任务状态，再判断是否需要重新执行。若政策查询成功、渠道查询失败，可以将缺项限定在渠道证据，避免让所有参与者重新开始调查。恢复也不能直接复用过期状态，应检查资料版本和工作范围是否仍适用。这里强调责任与记录要求，具体恢复点和外部操作是否可以重做，需要根据实际执行环境验证。',
        '本课的练习交付两部分材料：一份包含两种回复责任安排的控制流说明，以及三种配置的调度时间表。先核对委托是否具有足够信息，再逐项复算开始与结束时间，最后写明后台工作如何查询状态、失败交给谁处理。下一课会检查信息本身：哪些历史应该传给 worker，返回摘要如何保留来源与不确定性，以及 manager 怎样验收后再形成最终回复。',
      ],
      keyPoints: ['后台任务需要状态与结果获取机制', '预算耗尽、失败和缺失结果必须有明确责任去向'],
      sourceIds: ['res-ma-langchain-subagents', 'res-ma-research-system', 'res-ma-openai-orchestration'],
    },
  ],
  misconceptions: [
    { claim: '两种机制都通过工具触发，所以 manager 调用和 handoff 完全相同。', correction: '要追踪控制权与回复责任。前者把结果返回 manager，后者改变后续行为或当前分支的回复负责人。' },
    { claim: '函数使用 async，就一定已经成为独立后台任务。', correction: '语言层等待机制不能代替 job 状态与结果管理。主流程是否继续，以及如何获取最终结果，都需要应用明确实现。' },
    { claim: '实验增加第三个 worker，十三个时间单位还能继续减少。', correction: '这组任务的最长依赖路径已经是十三。更多执行名额无法消除准备、检索 B、汇总和核验的顺序。' },
    { claim: '两个 worker 有独立上下文，所以同时写同一对象一定安全。', correction: '上下文范围不提供写入互斥。教学模型要求共享写入串行；实际执行层需要明确的数据一致性规则。' },
  ],
  recap: ['先指定最终回复责任，再选择 manager 调用或 handoff。', '区分分类路由、固定并行和动态工作分配。', '委托说明同时定义输入、目标、结果形式和结束条件。', '固定时间模型得到 17、13、17，必须逐项满足依赖与资源规则。', '后台、失败和预算结束需要状态记录及下一责任人。'],
  nextStep: '带上本课的工作说明与返回路径，继续设计 worker 的上下文输入和结果格式，逐项检查来源、约束、未完成项与最终验收。',
});
