# Agent 机制全模块知识笔记设计

## 背景与目标

LLM 基础八课已经验证“站内知识笔记是主教材、外部资料是证据与扩展”的学习模式。第二模块 Agent 机制目前拥有完整的八课骨架、28 份资料、24 道面试题和三个交互实验，但每课仍只有两段 `explanations`，学习者必须自行拼接论文、课程、厂商文章和视频，难以形成从任务契约到可终止控制循环的完整知识体系。

本次工作把 `agent-01` 至 `agent-08` 全部迁移为来源可追溯、站内可独立学习的中文知识笔记。完成后，学习者即使不打开外链，也应能回答现有 quiz 和面试追问、完成每课 exercise，并能从空白纸设计一个可验证、可恢复、可终止的单 Agent。外部资料继续承担核心依据、交叉核验和延伸阅读，而不是课程正文的替代品。

## 方案选择

采用与第一模块一致的“每课独立纯数据文件 + 模块聚合入口 + 课程 registry 接线”方案。相较于把八篇长文继续塞入 `agent-mechanism.js`，该方案便于独立研究、审查和维护；相较于引入 Markdown 运行时或构建管线，它不增加依赖、构建步骤或部署风险。

通用 `knowledgeNote` renderer 已能按数据协议渲染目录、来源、误区、回顾和下一步，本次不新增 Agent 专用 UI，也不按 lesson ID 添加渲染分支。现有 `explanations` 保留为兼容字段和课程覆盖输入。

## 范围与非目标

本次范围包括：

- Agent 机制八课知识笔记和聚合入口；
- 28 份既有资源的正文核验、证据卡与访问限制；
- 课程数据接线、递归冻结、测试契约、README 和内容审计；
- 桌面与 390px 浏览器验收、PR、合并和 GitHub Pages 部署验证。

本次不改写课程的目标、quiz、面试题、实验逻辑或进度协议，除非来源核验发现明确事实冲突；不新增资源总数、课程专用 CSS、框架或远端请求；不把 Agent Harness、RAG、MCP 或多 Agent 展开为本模块正文，它们只在 `agent-08` 作为边界和下一模块接口出现。Agent Harness 与上下文/RAG/记忆继续使用 `explanations` fallback。

## 八课知识路径与篇幅

阅读量按知识密度和工程交付物浮动，不机械等长：

| 课程 | 主题 | 阅读量 | 正文最低长度 | 教学主线 |
| --- | --- | ---: | ---: | --- |
| `agent-01` | Agent、Workflow 与普通 LLM 应用 | 25–30 分钟 | 3600 字符 | 控制权连续谱、最小闭环、选型门槛 |
| `agent-02` | 目标、约束与任务状态 | 25–30 分钟 | 3600 字符 | task contract、未知项、状态、完成证据 |
| `agent-03` | 工具调用与 ACI | 30–40 分钟 | 4500 字符 | 声明、调用、校验、执行、回填、最小权限 |
| `agent-04` | Agent Loop 与 ReAct | 30–40 分钟 | 4500 字符 | decide–act–observe、状态更新、进展与终止 |
| `agent-05` | 规划、分解与重规划 | 30–40 分钟 | 4800 字符 | reactive、显式计划、依赖、验证点、搜索成本 |
| `agent-06` | 失败恢复、反思与外部验证 | 35–40 分钟 | 4800 字符 | 错误分类、预算、幂等、reflection 边界、外部反馈 |
| `agent-07` | 上下文与工作记忆 | 30–35 分钟 | 4200 字符 | transcript、event log、state、working memory、context |
| `agent-08` | 单 Agent 综合设计 | 35–40 分钟 | 5000 字符 | 端到端状态机、三类轨迹、框架与后续模块边界 |

每课包含 5–7 个实质章节、4–6 个误区和至少 5 个回顾要点。章节按先修桥接、直觉模型、准确机制、工程意义、具体案例、误区、回顾与下一课推进。每个实质章节有 2–4 个短段落、至少两个要点和至少一个真实 `sourceId`。

每课必须建立覆盖矩阵，把全部 objectives、concepts、两道 quiz 的推理、三道面试题的短答/深挖/追问、exercise steps、deliverable 和 completion criteria 映射到章节。贯穿案例直接服务原 exercise，不另造与考核无关的练习。

## 课间分工与边界

- `agent-01` 建立控制权与行动闭环词汇，避免提前展开工具协议细节。
- `agent-02` 把目标转成可检查任务契约，完成证据由外部谓词而非模型自述决定。
- `agent-03` 解释模型只提出结构化动作，宿主负责 schema、业务、权限、副作用和结果回填；Toolformer 研究目标不得冒充生产 function calling 协议。
- `agent-04` 聚焦控制循环和 ReAct 的环境交互，明确可观察计划摘要不等于隐藏推理；循环实验是确定性控制器教学模拟。
- `agent-05` 比较 reactive、plan-and-execute、Plan-and-Solve、ReWOO 和搜索式方法，所有论文收益只保留其任务与评测条件；重规划实验不模拟真实模型能力。
- `agent-06` 先按可观察错误分类，再选择有限重试、修参、换工具、重规划、澄清、blocked 或 handoff；Reflexion、Self-Refine、CRITIC 与无外部反馈自纠错的反方证据必须并列。
- `agent-07` 区分记录、状态、工作记忆和本轮上下文，只负责单任务短中期信息流；跨会话长期记忆与检索策略留给第四模块。
- `agent-08` 用只读仓库诊断 Agent 汇总前七课，并准确区分 Agent 机制、Harness、RAG、MCP 和多 Agent；`nextStep` 明确连接 Agent Harness。

## 来源与证据策略

制作过程必须使用 `.agents/skills/build-learning-module-notes/`。课程字段只定义学习覆盖，不构成来源证据。28 个既有资源逐一建立 evidence card：

```text
authority: official | academic | expert | community
role: core | cross-check | extension
coverage: [实际正文支持的主题]
limitations: 访问、版本、实验设定或迁移边界
verifiedAt: 对时敏实现语义记录核验日期
```

论文优先读取原文或 PDF，只支撑其模型、数据、任务和评价设定；厂商文章作为有平台边界的工程经验；OpenAI function calling 只依据当前官方材料说明接口语义，不证明业务动作可靠；课程和仓库提供学习路径与示例，不承担生产性能主张。没有可访问字幕或等价正文的 YouTube、Bilibili、抖音资源只能作为 `extension`，不能单独支撑关键机制。

每个章节 `sourceIds` 必须同时存在于项目资源 registry、当前 lesson 的 `resourceIds` 和有效 evidence set。访问失败要如实记录，不根据标题、URL、`value` 或模型记忆推断正文。若关键 assessed outcome 缺少可访问核心证据，该课保持 blocked，不能通过降低测试门槛或把课程字段伪装成 evidence 发布。

## 数据与文件结构

```text
src/data/agent-mechanism-notes/
  agent-01.js
  agent-02.js
  agent-03.js
  agent-04.js
  agent-05.js
  agent-06.js
  agent-07.js
  agent-08.js
src/data/agent-mechanism-notes.js
src/data/agent-mechanism.js
```

单课文件只导出纯 JavaScript 数据。聚合入口导出 `agentMechanismNotes`，键必须且只能是 `agent-01` 至 `agent-08`，并递归冻结所有嵌套值。`agent-mechanism.js` 导入聚合入口，为每个 lesson 连接同一 note 对象，并将来源卡嵌入真实 `resource.evidence`。

## 子代理生产与审查

实现先建立 RED 测试和 28 张来源卡，再按课程顺序写作。每个课程任务使用独立作者；作者完成、自测和自审后，未参与写作的代理先做规格合规审查，再做内容质量审查。任何规格缺口由原作者修正并重新规格审查；只有规格通过后才进入质量审查，质量问题修复后必须复审。

为降低共享文件冲突，不同作者只编辑各自 note 文件；聚合入口、`agent-mechanism.js`、测试、README 和审计由独立集成任务统一处理。最终再进行跨课术语、重复、边界、引用和相邻章节衔接审查。子代理报告不作为完成证据，主代理必须检查实际 diff 并运行完整验证。

## 测试契约

先将当前“Agent 机制没有知识笔记”的测试改为完整发布契约，再实现内容：

- registry keys 恰好覆盖 `agent-01` 至 `agent-08`，每课引用不同且同一的 note 对象；
- 阅读时长和正文最低长度符合上表，章节为 5–7 个、ID 唯一 kebab-case；
- 每章节 2–4 段且每段至少 60 字、至少两个要点、至少一个来源；
- 所有 `sourceIds` 同时解析到全局资源和当前 lesson 资源集；
- 4–6 个误区、至少 5 个 recap、导语和下一步非空；
- 28/28 资源拥有合法 evidence，时敏日期使用真实核验值；
- notes、evidence 和课程导出递归冻结；
- Agent 知识笔记通过通用 renderer 呈现目录、HTTPS 安全外链、role、limitations 和无障碍焦点；
- Harness 与 Context 模块继续使用 fallback，UI 不硬编码 Agent lesson ID；
- README 准确声明前两个模块以知识笔记为主教材，后两个模块尚未迁移。

发布前运行正式课程测试、`npm test`、全部 `src`/`tests` JavaScript 的 `node --check`、`git diff --check` 和工作树检查。真实浏览器逐页验证八课桌面版，在 390px 抽查工具、规划和综合课程，验证目录聚焦、长链接换行、无横向溢出、三个现有实验仍可用、其他模块 fallback 和控制台无 error。

## 内容审计与完成标准

内容审计记录 28 份资料的访问类型、角色和限制，以及每课 coverage matrix、质量量表、断裂引用和测试结果。单课发布门槛为 85/100；最终目标为无课程字段来源伪装、`brokenReferenceCount === 0`、所有八课均达到门槛。

完成定义为：功能分支同步最新 `main` 后无冲突；全部自动化与浏览器验收通过；一个 PR 合并到 `main`；GitHub Pages 最新构建状态为 `built` 且 commit 等于合并提交；公开站点 `agent-01` 至 `agent-08` 均渲染知识笔记，并且 Agent Harness 与 Context 仍正常显示原理札记 fallback。
