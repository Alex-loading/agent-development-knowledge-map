# Agent 机制一级资料重构审计

审计日期：2026-07-30
课程范围：`agent-01`—`agent-08`
稳定契约：8 课、29 份既有资源、24 道面试题、16 道 quiz、3 项实验及全部既有 ID、顺序、路由与 progress key 保持不变。新增 18 份 `res-agent-primary-` 一级资料绑定，不复制或发布 `.research-cache` 与受限原文。

## 结论与评分

- 内容质量：**94 / 100**。来源架构 19/20，体系化 20/20，工程边界 19/20，测评闭环 20/20，练习与面试迁移 16/20。
- 视觉质量：**56 / 60**。认知任务 12/12，语义编码 12/12，证据归属 10/10，可访问性 10/10，安全与几何 12/16。
- 发布判断：通过。八课均有 4–7 个 substantive sections，每节 2–4 个短段为主；40 个 assessment 全部拥有独立文本证据支持的 conceptTags，并与 16 张视觉形成双向 outcome 覆盖。
- 媒体判断：两家一级资料中的第三方图表均因缺少本仓库可独立证明的再发布许可而**拒绝直接复制**。本模块只发布原创静态 SVG，来源用于知识组织与语义综合。

## 八课一级资料影响

1. `agent-01`：JavaGuide Agent Core 提供总览骨架；飞书 model-outside-model 与 ReAct Loop 强化“决策位置”和“有界权限”。官方来源核验工具权限、真实执行与终止仍属于宿主。
2. `agent-02`：JavaGuide Prompt 工程组织 intent、objective、constraints、success；飞书 ReAct Loop 提供观察驱动的任务状态直觉。官方来源交叉验证产品行为，课程拒绝把自然语言计划当耐久状态。
3. `agent-03`：JavaGuide Skills 与 MCP 建立知识封装和互操作边界；飞书 Tool Truth 强化 transcript 与 observation 的差异。OpenAI function calling 与 AWS 幂等资料负责官方核验调用生命周期和副作用边界。
4. `agent-04`：JavaGuide Loop Engineering 与飞书 ReAct、自治演进观察共同组织循环；ReAct 原论文核验 reason–action–observation 机制。课程不要求输出 private chain-of-thought。
5. `agent-05`：JavaGuide Workflow / Graph / Loop 提供模式地图；飞书 ReAct→Orchestration 与 Dynamic Workflow 深化依赖、并行、委派和汇合。论文与官方来源交叉验证具体规划模式的实验边界。
6. `agent-06`：JavaGuide Loop Engineering 与飞书 version drift、dynamic workflow 用于恢复叙事；CRITIC、反方自纠论文与 AWS 官方来源核验 external validation、幂等和 reconciliation。
7. `agent-07`：JavaGuide Context 与 Memory 建立对象边界；飞书 prompt/memory 观察用于解释产品外部状态。课程保留 source、version、expiry 与回取指针，不将逆向观察冒充产品协议。
8. `agent-08`：JavaGuide Agent Core 与 Harness 边界、飞书 orchestration、beyond-model、version drift 共同形成端到端压力矩阵；官方来源交叉验证权限、执行、完成证据与恢复责任。

## Source-impact 决策台账

| decisionId | lessonId | resourceId | scope | targetType | targetId | sectionId | semanticKey | contribution | summary | rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| impact-agent-01-boundary | agent-01 | res-agent-primary-feishu-beyond-model | claim | claim | claim:agent-is-bounded-decision-authority | control-authority-spectrum | agency-boundary | corrected | Agent 自治被重写为决策位置与有界权限，而不是模型获得任意执行权。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-02-task-state | agent-02 | res-agent-primary-javaguide-prompt | claim | claim | claim:task-plan-is-not-durable-state | request-to-task-contract | task-state | deepened | 把 Agent 计划深化为任务契约、状态机、事件日志和显式终止的组合。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-03-tool-truth | agent-03 | res-agent-primary-feishu-tool-truth | claim | claim | claim:tool-call-is-not-execution-proof | tool-declaration-contract | tool-truth | corrected | 修正工具调用文本等于真实执行的误区，以宿主 observation 和日志为准。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-04-react | agent-04 | res-agent-primary-feishu-react-loop | claim | claim | claim:react-does-not-require-private-cot | react-boundary-and-observable-logging | react-loop | corrected | 保留 ReAct 的行动结构，同时拒绝把 private CoT 当作必需审计产物。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-05-orchestration | agent-05 | res-agent-primary-feishu-react-orchestration | claim | claim | claim:planning-mode-follows-uncertainty | choose-planning-by-task-structure | orchestration | adopted | 以不确定性和依赖关系组织 Agent 规划、重规划与编排模式。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-06-validation | agent-06 | res-agent-primary-javaguide-loop-engineering | claim | claim | claim:reflection-is-not-proof | external-validation-stack | external-validation | corrected | 把 Agent 反思降级为修订候选，并以外部验证关闭证据环。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-07-provenance | agent-07 | res-agent-primary-feishu-prompt-memory | claim | claim | claim:context-compression-must-preserve-provenance | information-carriers-and-lifecycles | context-provenance | deepened | 把 Agent 上下文压缩深化为保留来源、版本、有效期与回取入口的投影。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |
| impact-agent-08-pressure | agent-08 | res-agent-primary-feishu-agent-version | claim | claim | claim:end-to-end-agent-needs-pressure-matrix | capstone-architecture-and-trust-boundaries | pressure-test | adopted | 为单 Agent 端到端设计加入工具失败、成功歧义、漂移与越权压力测试。 | 一级资料承担课程主干与实现观察；产品、协议、安全与效果行为继续由官方资料、原始论文或本地测试核验。 |

所有 contribution 只使用 approved 五态：adopted、corrected、deepened、rejected、duplicate。resolver 同时返回 claim、同课真实 note section，以及来自正式 outcome registry 的 assessment / visual 记录；decision resource 必须真实存在于 section.sourceIds。独立 fixture 分别以 regex anchor 检查 claim 和 section 正文，semanticKey 本身不能自证。Mutation 测试分别替换 claim、summary、section 正文，并从 section.sourceIds 移除 decision resource；四类变更都必须被独立语义或所有权契约拒绝。

## 视觉逐资产决策

| visual | asset | lesson | 决策与证据 |
|---|---|---|---|
| `visual-agent-01-boundary-spectrum` | `assets/visuals/agent-mechanism/agent-01-boundary-spectrum.svg` | agent-01 | 原创重绘控制权连续谱；采用 JavaGuide Core 与 beyond-model 心智模型。 |
| `visual-agent-01-action-feedback-loop` | `assets/visuals/agent-mechanism/agent-01-action-feedback-loop.svg` | agent-01 | 原创最小闭环；突出宿主执行与 observation。 |
| `visual-agent-02-task-contract` | `assets/visuals/agent-mechanism/agent-02-task-contract.svg` | agent-02 | 原创任务编译链；绑定成功谓词与出口。 |
| `visual-agent-02-state-event-log` | `assets/visuals/agent-mechanism/agent-02-state-event-log.svg` | agent-02 | 原创三对象比较；计划不替代 event log。 |
| `visual-agent-03-tool-protocol` | `assets/visuals/agent-mechanism/agent-03-tool-protocol.svg` | agent-03 | 原创工具协议；schema、auth、execution、observation 全链。 |
| `visual-agent-03-skills-mcp-boundary` | `assets/visuals/agent-mechanism/agent-03-skills-mcp-boundary.svg` | agent-03 | 原创职责边界；Skills≠MCP≠Agent。 |
| `visual-agent-04-react-cycle` | `assets/visuals/agent-mechanism/agent-04-react-cycle.svg` | agent-04 | 原创 ReAct 图；使用可审计摘要而非 private CoT。 |
| `visual-agent-04-bounded-loop` | `assets/visuals/agent-mechanism/agent-04-bounded-loop.svg` | agent-04 | 原创循环出口；预算和 stop 原因由宿主控制。 |
| `visual-agent-05-planning-modes` | `assets/visuals/agent-mechanism/agent-05-planning-modes.svg` | agent-05 | 原创模式比较；复杂度不被描述成优越性。 |
| `visual-agent-05-orchestration-graph` | `assets/visuals/agent-mechanism/agent-05-orchestration-graph.svg` | agent-05 | 原创依赖图；并行后必须汇合核验。 |
| `visual-agent-06-correction-ladder` | `assets/visuals/agent-mechanism/agent-06-correction-ladder.svg` | agent-06 | 原创纠错阶梯；reflection 与 proof 分离。 |
| `visual-agent-06-durable-recovery` | `assets/visuals/agent-mechanism/agent-06-durable-recovery.svg` | agent-06 | 原创恢复边界；checkpoint 与 reconciliation 归 Harness。 |
| `visual-agent-07-context-layers` | `assets/visuals/agent-mechanism/agent-07-context-layers.svg` | agent-07 | 原创对象分层；context 是投影而非全部存储。 |
| `visual-agent-07-provenance-budget` | `assets/visuals/agent-mechanism/agent-07-provenance-budget.svg` | agent-07 | 原创预算链；压缩仍保留来源和回取。 |
| `visual-agent-08-end-to-end` | `assets/visuals/agent-mechanism/agent-08-end-to-end.svg` | agent-08 | 原创控制面；validator 独立裁决完成。 |
| `visual-agent-08-pressure-matrix` | `assets/visuals/agent-mechanism/agent-08-pressure-matrix.svg` | agent-08 | 原创压力矩阵；失败必须落入受控出口。 |

所有视觉采用 `original-synthesis`，permission 为 null，不需要第三方再发布许可；alt、longDescription、caption、sourceIds、role、kind、尺寸和 verifiedAt 完整。生产 scene model 与 renderer 是唯一数值真源，生成器执行 XML 校验并以 atomic rename 发布，`--check` 只比较、不写文件。生产路由同时包含直进边、回边、分支、汇合和跨区段折线；几何测试验证边不穿过非端点节点、两条边不共线复用线段，且标签不与节点、其他标签或标题/副标题/页脚保留区重叠。全部文本字号取值为 14/16/18/30px；14px 仅用于节点续行、边标签、矩阵单元与类型页脚，节点首行、矩阵表头、caption、subtitle 和 title 为 16px 以上。

`scene-type parity: spectrum=1, loop=2, decision=2, state-machine=2, protocol=1, layers=2, planning-graph=1, dag=1, ladder=1, flow=1, control-loop=1, matrix=1`

`routing parity: edges=72, feedback=5, multi-segment=25`

`font-size parity: 14, 16, 18, 30`

## 验证记录

- 首批 RED：3 个新测试文件因缺少 visual registry 与 generator 以 `ERR_MODULE_NOT_FOUND` 失败，0 pass / 3 fail。
- 聚焦 GREEN：primary、assessment semantic、双向 visual outcome、artifact 与静态安全 8 / 8。
- 首次完整回归：`npm test`，**577 / 577**，0 fail。
- 收尾完整回归：`npm test`，**580 / 580**，0 fail（加入审计 parity、几何与 hostile XML policy 测试后）。
- 一级资料机制主干补强后的最终完整回归：`npm test`，**581 / 581**，0 fail；8 节正文均显式覆盖任务契约、工具责任链、循环、规划、纠错、上下文与端到端压力矩阵。
- 本次规格整改的 Agent 聚焦回归：primary reference、source-impact audit、visual semantics 与 geometry 共 **16 / 16**，0 fail。
- 本次规格整改后的完整回归：`npm test`，**586 / 586**，0 fail、0 skipped。
- 质量复审整改后的 Agent 完整聚焦回归：primary reference、source-impact audit、visual semantics 与 geometry 共 **21 / 21**，0 fail；其中新增的 audit + geometry + primary 核心门为 **18 / 18**。几何门会扫描全部 production scene，拒绝未声明 junction / bridge 的非端点正交交叉；当前共线重叠与非端点正交交叉均为 **0**。
- Source-impact 的 9 个 visual outcome 均由真实知识笔记 overview / section placement 建立唯一 `visualId → lessonId` ownership，再与视觉 registry 和 claim lesson 交叉核验；跨课程视觉替换 mutation 必须失败。
- 质量复审整改后的最终完整回归：`npm test`，**591 / 591**，0 fail、0 skipped。
- 生成物：Agent 16 份 SVG、一级资料共享产物、Context 27 份 SVG 及其 inventory 的 `--check` 均为 current，全部为非写模式。
- 类型视觉：`spectrum 1, loop 2, decision 2, state-machine 2, protocol 1, layers 2, planning-graph 1, dag 1, ladder 1, flow 1, control-loop 1, matrix 1`；测试确认 feedback/ReAct 回边、bounded loop 四出口、orchestration fork + join 与 6×4 pressure matrix。
- 安全与静态校验：16 / 16 SVG 通过 `xmllint`；从 Agent 重构基线计的 13 份变更 JS 通过 `node --check`；strict SVG parser、hostile XML renderer probe、全局 visual ownership 和 asset uniqueness 全部执行。release marker、remote-image hotlink、active/remote SVG reference 和敏感凭据定向扫描均零命中。
- 隐私与缓存：`git ls-files .research-cache` 无输出；`.research-cache/primary-references/manifest.json` 仍由 Git ignore 策略覆盖，未发布原始正文缓存。`git diff --check` 无输出。
- 渲染边界：应用内浏览器 runtime 发现结果为空，因此没有声称浏览器 viewport 或 console 验收。macOS Quick Look 已真实渲染 orchestration 与 end-to-end 两张点名 SVG，目视确认 fork 标签与 subtitle 分离、feedback 从 validator 底边独立回到 loop；Quick Look thumbnail 会裁剪右侧，所以该记录不代替完整浏览器页面验收。
