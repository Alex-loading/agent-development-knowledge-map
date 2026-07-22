# Agent Harness 全模块知识笔记设计

## 背景与目标

Agent Harness 已经是可学习的完整模块：八节递进课程、28 份基线外部资料、24 道面试题、16 道测验和三个确定性交互实验均已上线，但每节课仍依赖两段 `explanations` 和外链资料。学习者需要自行把运行状态、恢复、权限、隔离、预算、幂等、背压与人工交接拼成体系，无法在站内完成一站式学习。

本次工作把 `harness-01` 至 `harness-08` 全部迁移为来源可追溯、站内可独立学习的中文知识笔记。完成后，学习者即使不打开外链，也应能回答现有 quiz 和面试追问、完成每课 exercise，并能设计一个可暂停、可恢复、可约束且能安全处理副作用的 Agent 宿主。外部资料承担核心依据、交叉核验和延伸阅读，不再替代正文。

## 方案选择

采用“整模块原子迁移”：每课使用独立纯数据文件，模块聚合入口统一导出，最终由课程数据一次性接线。研究与写作期间，线上继续使用现有 `explanations` fallback；八课、证据卡、测试和审查全部通过后才接入 `knowledgeNote`，避免模块长期处于新旧教材混合状态。

不采用逐课上线，因为它会造成跨课术语、深度和用户体验不一致；不采用单个巨型文件，因为它不利于子代理按课分工、独立审查和后续维护。通用知识笔记 renderer 已经满足需求，本次不新增 Harness 专用 UI 或运行时依赖。

## 范围与非目标

本次范围包括：

- Agent Harness 八课知识笔记及聚合入口；
- 基线资料及证据补强资料的正文核验、证据账本和 `resource.evidence`；
- 课程数据接线、递归冻结、发布契约测试、README 与内容审计；
- 桌面、390px 和 320px 浏览器验收；
- Pull Request、Vercel Preview、合并和 Vercel Production 精确 SHA 验证。

本次不改写现有课程目标、概念、quiz、面试题、实验逻辑或进度协议，除非来源核验发现明确事实冲突；不新增课程专用 CSS、框架、构建步骤或远端运行时请求；不把 RAG、长期记忆、完整可观测性、安全威胁建模、MCP 或多 Agent 编排展开为本模块正文。若关键考核结果缺乏可访问核心证据，允许通过书面 amendment 增加权威来源，但不能用课程字段、资源标题或模型记忆代替证据。

## 八课知识路径与篇幅

阅读量按机制复杂度和工程交付物浮动：

| 课程 | 主题 | 阅读量 | 正文最低长度 | 教学主线 |
| --- | --- | ---: | ---: | --- |
| `harness-01` | Harness 与宿主 Runner | 30–35 分钟 | 4200 字符 | 职责边界、run 词汇、状态机、hooks 与清理 |
| `harness-02` | Run State、Event Log 与 Checkpoint | 35–40 分钟 | 4800 字符 | 事实、投影、恢复点、重放与版本兼容 |
| `harness-03` | 工具注册、权限与人工审批 | 35–40 分钟 | 4800 字符 | registry、认证、授权、逐调用审批与 TOCTOU |
| `harness-04` | Sandbox、隔离与资源边界 | 35–45 分钟 | 5000 字符 | 容器边界、隔离层次、最小权限与资源配额 |
| `harness-05` | Budget、Timeout、Retry 与 Cancel | 35–40 分钟 | 4800 字符 | 分层预算、错误分类、退避、截止时间与取消传播 |
| `harness-06` | 幂等副作用与安全 Resume | 40–45 分钟 | 5200 字符 | 未知终态、幂等键、去重、对账与恢复决策 |
| `harness-07` | 并发、队列与背压 | 35–40 分钟 | 4800 字符 | 有界队列、lease/ack、限并发、准入与过载保护 |
| `harness-08` | Blocked、HITL、Handoff 与运行产物 | 35–45 分钟 | 5000 字符 | 长暂停、恢复令牌、人工交接与 artifact manifest |

每课包含 5–7 个实质章节、4–6 个误区和至少 5 个回顾要点。每个实质章节有 2–4 个短段落、至少两个要点和至少一个真实 `sourceId`。章节依次完成先修桥接、直觉模型、准确机制、工程设计、贯穿案例与边界说明；贯穿案例直接服务原有 exercise 和三个交互实验，不另造与考核无关的练习。

每课建立覆盖矩阵，把 objectives、concepts、两道 quiz 的推理、三道面试题的短答/深挖/追问、exercise steps、deliverable 和 completion criteria 映射到章节。`explanations` 保留为兼容字段和覆盖输入，但不作为知识主张的外部证据。

## 课间分工与边界

- `harness-01` 建立 Agent 与确定性宿主的责任边界及规范状态词汇；不提前展开持久化实现。
- `harness-02` 区分当前状态投影、追加事实、恢复点和普通日志；框架 checkpoint/replay 规则不得外推为跨框架标准。
- `harness-03` 区分能力发现、身份、授权和具体调用审批；恢复前必须重新验证参数、权限和环境条件。
- `harness-04` 比较进程、容器、用户态内核与 microVM 的不同边界；任何单一机制都不等于绝对安全沙箱。
- `harness-05` 先按错误、动作和期限分类，再决定有限重试；deadline、attempt timeout 和 cancellation 不得混为一谈。
- `harness-06` 聚焦“副作用成功但响应或 checkpoint 丢失”的不确定窗口；不宣称通用 exactly-once 工具执行。
- `harness-07` 只讲单 Harness 所需的 producer、bounded queue、worker、lease/ack、并发限制和背压，不扩展为分布式调度专章。
- `harness-08` 区分 blocked、failed、cancelled 与长时间 HITL，最终产出可由人或另一运行时继续工作的 handoff bundle，并连接后续上下文与可观测性模块。

## 来源与证据策略

模块制作使用 `.agents/skills/build-agent-learner-module/`，每课必须继续使用 `.agents/skills/build-learning-module-notes/`。基线资源与经 amendment 补入的资源逐一读取正文并建立 evidence card：

```text
authority: official | academic | expert | community
role: core | cross-check | extension
coverage: [实际正文支持的主题]
limitations: 访问、版本、平台、实验设定或迁移边界
verifiedAt: 对时敏实现语义记录核验日期
```

OpenAI Agents SDK、LangGraph、Temporal、Azure、AWS SQS、Docker、gVisor 和 Firecracker 只证明各自当前文档或实现语义；AWS Builders' Library 与 Google SRE 是有平台背景的工程经验；NIST 与 OWASP 支撑安全原则和风险边界；课程、仓库和视频承担导航、示例或交叉理解。没有可访问字幕或等价正文的视频最多只能是 `extension`，不得单独支撑关键机制；连标题、作者和简介都无法核验的资源必须移出正式 registry。

### 2026-07-23 来源 amendment

正文核验确认两个核心考核结果缺乏直接证据，因此在写作前修订来源集合：新增 OpenAI 官方 `Sandbox Agents`，支撑 Harness 控制面与 sandbox 执行面的职责分离；新增 AWS 官方 `Amazon SQS visibility timeout`，支撑 receive、临时不可见、delete-as-ack、超时后 redelivery 与重复投递边界。原 Bilibili 条目无法核验标题、作者、简介或字幕，移出正式 registry。最终发布集合为 29 项资源，其中抖音条目仅有可核验元数据，保持 `community/extension` 且不进入关键章节 `sourceIds`。

`handoff bundle` 与 `artifact manifest` 的字段集合明确标为本课程基于状态、审批、副作用和产物证据要求形成的工程综合模板，而不是 OpenAI、NIST、LangGraph 或任何外部组织发布的统一标准。

每个章节 `sourceIds` 必须同时存在于全局资源 registry、当前 lesson 的 `resourceIds` 和有效 evidence set。访问失败必须如实记录，不能依据标题、URL、`value` 或模型记忆推断正文。关键 assessed outcome 缺少可访问核心证据时，该课保持 blocked，直至补充权威来源或明确缩小主张。

## 数据与文件结构

```text
src/data/agent-harness-notes/
  harness-01.js
  harness-02.js
  harness-03.js
  harness-04.js
  harness-05.js
  harness-06.js
  harness-07.js
  harness-08.js
src/data/agent-harness-notes.js
src/data/agent-harness.js
```

单课文件只导出纯 JavaScript 数据。聚合入口导出 `agentHarnessNotes`，键必须且只能是 `harness-01` 至 `harness-08`，并递归冻结所有嵌套值。`agent-harness.js` 导入聚合入口，为每个 lesson 连接注册表中的同一 note 对象，并将来源卡嵌入真实 `resource.evidence`。

## 子代理生产与审查

研究按三条互不重叠的来源流并行：运行状态与恢复；权限与隔离；可靠性、队列与交接。主代理复核实际正文、冲突、访问限制和最终 evidence ledger，子代理摘要不能充当证据。

实现先建立 RED 发布契约，再按两批写作：`harness-01` 至 `harness-04`、`harness-05` 至 `harness-08`。不同作者只编辑各自 note 文件；聚合入口、课程数据、测试、README 和审计由主代理统一处理。每课依次经过作者自审、未参与写作的规格审查、内容质量审查；修复后必须复审。最终增加跨课术语、重复、边界、相邻章节衔接和引用审查。

## 测试契约

先把当前“Harness 没有知识笔记”的隐含状态改为完整发布契约，再实现内容：

- registry keys 恰好覆盖八课，每课引用不同且与 registry 相同的 note 对象；
- 阅读时长和正文最低长度符合表格，章节为 5–7 个、ID 唯一且可用作锚点；
- 每章 2–4 个非空段落、至少两个 key points、至少一个可解析 `sourceId`；
- 每课误区为 4–6 个、回顾至少 5 项，introduction 和 nextStep 为实质文本；
- 所有章节来源同时属于当前 lesson 和有效 evidence set，断裂引用为 0；
- 29 份最终资源全部有合法 evidence card，时敏来源记录 `verifiedAt`，metadata-only 视频保持 `community/extension`；
- 八课笔记、证据卡、课程数据和聚合入口递归冻结；
- 通用 UI 为 Harness 八课渲染目录、来源链接和来源卡，不引入 lesson ID 分支；
- 既有 1275 项测试持续通过，README 准确描述三个已完成知识笔记模块及后续 fallback 状态。

逐课质量评分必须达到 `.agents/skills/build-learning-module-notes/` 规定的 85/100，且 broken reference count 为 0。测试只验证可自动判定的结构和关键边界，不能用堆字、重复句子或课程字段冒充内容质量。

## 发布门

模块在最终接线前保持现有 `explanations` 可学习状态。只有证据账本冻结、八课双审通过、目标测试与全量回归通过、旧模块兼容、桌面与 390px/320px 浏览器验收均通过，才接入所有 `knowledgeNote`。

功能分支通过单个 Pull Request 和 Vercel Preview 后合并到最新 `main`。完成定义包括：Vercel Production 为 Ready、公开站点关键 Harness 路由可访问、部署 Git SHA 与目标 `main` SHA 完全一致。GitHub Pages 必须保持关闭，不作为生产或备用部署渠道。
