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
4. `agent-04`：JavaGuide Loop Engineering 与飞书 ReAct、自治演进、Loop Engineering 观察共同组织循环；ReAct 原论文核验 reason–action–observation 机制。课程不要求输出 private chain-of-thought。
5. `agent-05`：JavaGuide Workflow / Graph / Loop 提供模式地图；飞书 ReAct→Orchestration 与 Dynamic Workflow 深化依赖、并行、委派和汇合。论文与官方来源交叉验证具体规划模式的实验边界。
6. `agent-06`：JavaGuide Loop Engineering 与飞书 version drift、dynamic workflow 用于恢复叙事；CRITIC、反方自纠论文与 AWS 官方来源核验 external validation、幂等和 reconciliation。
7. `agent-07`：JavaGuide Context 与 Memory 建立对象边界；飞书 prompt/memory 观察用于解释产品外部状态。课程保留 source、version、expiry 与回取指针，不将逆向观察冒充产品协议。
8. `agent-08`：JavaGuide Agent Core 与 Harness 边界、飞书 orchestration、beyond-model、version drift 共同形成端到端压力矩阵；官方来源交叉验证权限、执行、完成证据与恢复责任。

## Source-impact 决策台账

| decision | lesson | target | decision | 课程影响 |
|---|---|---|---|---|
| `impact-agent-01-boundary` | agent-01 | `claim:agent-is-bounded-decision-authority` | corrected | Agent 自治改写为决策位置与有界权限。 |
| `impact-agent-02-task-state` | agent-02 | `claim:task-plan-is-not-durable-state` | deepened | 计划、状态机、event log 与 termination 分层。 |
| `impact-agent-03-tool-truth` | agent-03 | `claim:tool-call-is-not-execution-proof` | corrected | tool call 候选与宿主 observation 分离。 |
| `impact-agent-04-react` | agent-04 | `claim:react-does-not-require-private-cot` | corrected | 保留行动结构，不发布 private CoT。 |
| `impact-agent-05-orchestration` | agent-05 | `claim:planning-mode-follows-uncertainty` | adopted | 按不确定性与依赖选择规划和编排。 |
| `impact-agent-06-validation` | agent-06 | `claim:reflection-is-not-proof` | corrected | reflection 是修订候选，external validation 才是证据。 |
| `impact-agent-07-provenance` | agent-07 | `claim:context-compression-must-preserve-provenance` | deepened | 压缩、外置和记忆投影保留 provenance。 |
| `impact-agent-08-pressure` | agent-08 | `claim:end-to-end-agent-needs-pressure-matrix` | adopted | 发布前覆盖失败、歧义、越权、陈旧与漂移。 |

所有 contribution 只使用 approved 五态：adopted、corrected、deepened、rejected、duplicate。resolver 返回真实 claim 对象；独立 fixture 以 regex anchor 检查正文，semanticKey 本身不能自证。HTTP 无关文本 mutation 会失败。

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

所有视觉采用 `original-synthesis`，permission 为 null，不需要第三方再发布许可；alt、longDescription、caption、sourceIds、role、kind、尺寸和 verifiedAt 完整。生产 scene model 与 renderer 是唯一数值真源，生成器执行 XML 校验并以 atomic rename 发布，`--check` 只比较、不写文件。节点保持 32px 触达 margin，边只连接相邻节点，标签位于 85px gap 内；几何测试验证节点、边标签不重叠，正文最小字号 16px。

## 验证记录

- 首批 RED：3 个新测试文件因缺少 visual registry 与 generator 以 `ERR_MODULE_NOT_FOUND` 失败，0 pass / 3 fail。
- 聚焦 GREEN：primary、assessment semantic、双向 visual outcome、artifact 与静态安全 8 / 8。
- 首次完整回归：`npm test`，**577 / 577**，0 fail。
- 收尾完整回归：`npm test`，**580 / 580**，0 fail（加入审计 parity、几何与 hostile XML policy 测试后）。
- 一级资料机制主干补强后的最终完整回归：`npm test`，**581 / 581**，0 fail；8 节正文均显式覆盖任务契约、工具责任链、循环、规划、纠错、上下文与端到端压力矩阵。
- 生成物：`node scripts/generate-agent-mechanism-visuals.mjs --check`，16 / 16 current，非写模式。
- 安全：共享 strict SVG parser、xmllint、active/remote-content scan、hostile XML renderer probe、全局 visual ownership 和 asset uniqueness 全部执行。
- 浏览器边界：本切片只完成数据、静态资产、共享 UI 合约与 HTTP smoke；没有声称真实浏览器或设备矩阵验收。
