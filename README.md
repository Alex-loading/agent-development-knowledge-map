# Agent Learner：Agent 开发知识地图

Agent Learner 是一个面向 AI / Agent 开发入门与面试复习的中文交互式学习站。当前版本已经开放「LLM 基础」「Agent 机制」「Agent Harness」与「上下文、RAG 与记忆」四个完整模块：内容可学习、可练习、可复习、可记录进度，而不是只罗列链接。

页面采用“纸张研究实验室”视觉：暖色纸张底、深绿墨色、朱红索引与赭色批注。当前仓库未提交产品截图；启动本地服务即可查看桌面与移动端布局。

## 当前状态

当前有四个完整模块：

- **LLM 基础模块已完成**：8 节课程、28 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖从神经网络、Token、Transformer 到推理、结构化输出与评测安全的基础主线。
- **Agent 机制模块已完成**：8 节课程、28 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖单 Agent 的任务契约、工具、循环、规划、恢复、工作上下文与终止设计。
- **Agent Harness 模块已完成**：8 节课程、28 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖宿主 Runner、状态与事件、工具治理、隔离、预算、可靠恢复、并发调度和人工接力。
- **上下文、RAG 与记忆模块已完成**：8 节课程、28 份资源、24 道面试题、16 道 quiz 和 3 项交互实验，覆盖上下文生命周期、预算分配、会话压缩、语料与索引、混合检索、证据打包和长期记忆治理。

四个模块都提供课程完成度、quiz 记录、面试掌握度与复习队列的本地进度。其余四个目录模块仍未开放，范围见“模块路线图与边界”。

LLM 基础八课均以**站内知识笔记作为主教材**：学习者可以直接沿八课长文建立完整主线，外部学习资料则作为依据、交叉核验和扩展阅读。Agent 机制、Agent Harness、上下文、RAG 与记忆仍由原有 `explanations` 提供站内讲解，保留通用 fallback，尚未迁移为同等长文；因此知识笔记完成状态只适用于 LLM 基础模块。

## 功能导览

站点有六个一级视图：

1. **模块首页**：给出当前模块的下一节推荐、课程与面试双轨进度、复习入口和八步迷你路径。
2. **学习主线**：按先修关系展示当前模块的 8 节课程；课程详情包含讲解、资料、练习、测验和完成标准。
3. **知识地图**：用可用、当前、已完成、待先修等文本状态展示概念路径，状态不只依赖颜色。
4. **资源库**：按语言、平台、来源、类型、难度和阶段组合筛选当前模块的 28 份资源。
5. **面试高频**：先自行口述，再展开参考答案；可筛选岗位与掌握状态，并维护复习队列。
6. **学习进度**：分别汇总课程与面试记录，可通过二次确认重置当前版本的学习进度。

LLM 基础的三项概念实验嵌在对应课程内：

- `llm-03`：**Token / 上下文预算台**，演示系统指令、历史、检索与输出如何竞争上下文预算；
- `llm-04`：**Attention 直觉台**，演示教学关联分、归一化权重与因果掩码；
- `llm-06`：**采样参数实验**，比较 temperature、top-p 与候选核变化。

这些实验明确是教学模型，不冒充真实 tokenizer、完整多头注意力或生产推理服务。

## 模块切换与路由

使用页头的模块选择器可在四个完整模块之间切换；六个一级视图会沿用当前 `moduleId`，不会把一个模块的临时筛选带到另一个模块。每个模块的 dashboard 与第一课 canonical Hash 路由是：

```text
#llm-foundation/dashboard
#llm-foundation/lesson/llm-01
#agent-mechanism/dashboard
#agent-mechanism/lesson/agent-01
#agent-harness/dashboard
#agent-harness/lesson/harness-01
#context-rag-memory/dashboard
#context-rag-memory/lesson/context-01
```

模块必须同时在目录中标记为 `active` 并注册到 `courseRegistry` 才能打开；无效模块或课程 ID 会回退到默认模块首页。

## Agent 机制课程地图

Agent 机制是一条从控制权判断到综合设计的八节单 Agent 主线：

1. `agent-01` **Agent、Workflow 与普通 LLM 应用**：从控制流和行动闭环判断何时需要自治。
2. `agent-02` **目标、约束与任务状态**：把模糊请求改写成有成功证据的任务契约。
3. `agent-03` **工具调用与 Agent–Computer Interface**：区分模型动作提案、宿主校验执行和 observation 回填。
4. `agent-04` **Agent Loop 与 ReAct**：实现受终止条件与步骤预算约束的 decide–act–observe 循环。
5. `agent-05` **规划、任务分解与重规划**：比较 fixed、reactive 与 hybrid 策略并依据新观察修订计划。
6. `agent-06` **失败恢复、反思与外部验证**：按错误类型选择有限恢复，并用外部证据校准反思。
7. `agent-07` **上下文与工作记忆**：组织目标、计划、观察、产物引用和压缩后的工作上下文。
8. `agent-08` **单 Agent 综合设计与面试压力测试**：把机制、边界、验证和终止出口组合成可评审方案。

三项交互实验直接调用课程的纯逻辑，不在 UI 中复制判定规则：

- `agent-03` / `tool-contract`：**工具契约检查台**，比较合法低风险、缺少必填项、非法枚举、额外字段和高风险审批五类调用；
- `agent-04` / `agent-loop`：**Agent Loop 决策台**，观察完成、阻塞、继续和预算耗尽的优先级；
- `agent-05` / `plan-recovery`：**计划恢复棋盘**，触发 retry、switch-action、replace-step、replan 与 blocked。

## Agent Harness 课程地图

Agent Harness 是一条从宿主执行入口到可靠调度、人工接力与运行产物的八节工程主线：

1. `harness-01` **Harness 与宿主 Runner**：明确模型、Agent loop、Harness 与宿主进程的职责边界，并定义 run 生命周期。
2. `harness-02` **Run State、Event Log 与 Checkpoint**：用可序列化状态、追加事件和 checkpoint 支持审计与恢复。
3. `harness-03` **工具注册、权限与人工审批**：把工具契约、最小权限、风险分级和审批决策放在模型之外执行。
4. `harness-04` **Sandbox、隔离与资源边界**：比较进程、容器和 microVM 的隔离边界，并限制文件、网络、CPU 与内存。
5. `harness-05` **Budget、Timeout、Retry 与 Cancel**：组合步骤、时间、费用预算和有限重试，保证取消能传播并收敛。
6. `harness-06` **幂等副作用与安全 Resume**：用幂等键、调用账本、远端查询和补偿处理崩溃后的模糊窗口。
7. `harness-07` **并发、队列与背压**：用租约、并发上限和过载策略调度长任务，避免无限积压。
8. `harness-08` **Blocked、HITL、Handoff 与运行产物**：把无法自治完成的 run 转成可恢复、可交接、可验收的结果。

三项交互实验与课程直接对应：

- `harness-01` / `run-lifecycle`：**Run Lifecycle 状态台**，按事件观察 run 的合法转换、终态守卫与步骤预算；
- `harness-06` / `retry-resume`：**Retry / Resume 恢复决策台**，根据错误、幂等记录与远端证据选择跳过、对账、重试或人工处理；
- `harness-07` / `queue-backpressure`：**Queue / Backpressure 调度台**，观察 worker 容量、队列阈值、拒绝与取消策略。

三项实验均为确定性模拟，只呈现输入对应的控制决策；它们不是真实 worker 或真实持久层，也不调用真实外部系统或真实队列，因此不能用于推断生产吞吐、故障概率或隔离强度。

## 上下文、RAG 与记忆课程地图

上下文、RAG 与记忆模块沿着“识别信息层次 → 投影当前上下文 → 构建检索证据 → 治理长期记忆 → 综合诊断”的顺序组织八节课：

1. `context-01` **信息层次与上下文生命周期**：区分提示、会话状态、检索语料、运行 checkpoint 与长期记忆的所有权、生命周期和投影方式。
2. `context-02` **Context Engineering 与预算分配**：为 required 指令、当前轮、状态、检索证据和记忆投影分配有限输入预算。
3. `context-03` **Conversation State、Transcript 与摘要**：从原始消息提取 canonical state，并把摘要视为可回源但有损的派生物。
4. `context-04` **Retrieval Corpus、Chunk 与索引**：设计可版本化、可失效、可过滤、可引用的 chunk，同时区分 corpus 与 index。
5. `context-05` **Sparse、Dense 与 Hybrid Retrieval**：比较词法召回、语义召回和稳定融合，并保留过滤与排序 trace。
6. `context-06` **Reranking、去重与证据打包**：在上下文预算内选择互补证据，生成可回源的 citation manifest。
7. `context-07` **长期记忆的写入、召回与遗忘**：用准入、作用域、纠正、TTL 与删除管理长期记录。
8. `context-08` **RAG 与记忆综合设计及故障定位**：从摄取、召回、过滤、打包、记忆到生成忠实度逐层定位错误。

三项交互实验使用固定输入和纯函数，便于重复比较结果：

- `context-02` / `context-router`：**上下文路由与预算台**，观察 required 超限、投影资格、排序策略和预算排除原因；
- `context-05` / `hybrid-retrieval`：**混合检索与证据打包台**，比较 sparse、dense、hybrid、版本过滤、去重与引用清单；
- `context-07` / `memory-lifecycle`：**长期记忆生命周期台**，演练 store、no-op、supersede、reject、expire、delete 与作用域隔离。

这里的 RAG 不等同于向量数据库：语料摄取、chunk、词法/向量召回、过滤、重排、证据打包、引用和生成校验都是独立环节；RAG 不能消除幻觉，也不承诺答案必然忠实。三项实验是确定性教学模型，其中教学记忆模拟不代表真实隐私合规，不能替代访问控制、数据治理、审计或法律评估。

责任边界保持清楚：`context projection` 是把已选择信息放入单次模型调用；`retrieval corpus` 是可管理、可版本化的外部知识源；`long-term memory` 是跨轮次保存且必须支持更新、过期和删除的记录；`checkpoint` 保存 Harness 的运行恢复状态。Checkpoint 不是长期记忆，Harness 负责执行与恢复控制，本模块负责信息选择、检索与记忆语义。

## 模块路线图与边界

已开放的 Agent 机制模块只讲**单 Agent**：目标、状态、工具、loop、规划、恢复、工作上下文和终止。它建立的是机制层心智模型，不把生产运行时、知识检索、评测治理或分布式协作提前塞进同一门课。

**Agent Harness**：active（已开放）。范围是宿主 Runner、Run State、Event Log、Checkpoint、工具权限与人工审批、Sandbox 隔离、Budget / Timeout / Retry / Cancel、幂等副作用与安全 Resume、并发队列与背压，以及 Blocked / HITL / Handoff / 运行产物。它负责执行与恢复控制，但不提前覆盖 RAG 与长期记忆、完整后端服务、系统化评测治理或多 Agent 协议。

**上下文、RAG 与记忆**：active（已开放）。范围是信息层次、context projection、会话状态与有损摘要、retrieval corpus、chunk/index、Sparse / Dense / Hybrid Retrieval、重排去重、证据与引用，以及 long-term memory 的写入、纠正、过期和删除。它不负责 Harness checkpoint 恢复、生产向量库与后端伸缩、完整评测安全治理或多 Agent 协议。

以下四个模块仍只有目录与依赖元数据：

- **AI 后端工程**：planned（规划中），承接服务、队列、数据与部署；
- **评测、可观测与安全**：planned（规划中），承接离线/在线评测、追踪、风险与安全治理；
- **多 Agent 与 MCP**：planned（规划中），承接多 Agent 协作、协议与 MCP 生态；
- **求职与项目交付**：planned（规划中），承接作品集、系统设计与面试交付。

因此完整 AI 后端、评测治理、多 Agent / MCP 与求职交付仍属于后续模块；目录卡片不代表课程已开放。

## 快速开始

前置条件：Git、现代浏览器、Node.js 18+（运行原生 `node:test`）与 Python 3（启动静态服务器）。项目没有第三方运行依赖。

```bash
cd agent-development-knowledge-map
npm test
npm run serve
```

然后打开 [http://localhost:4173](http://localhost:4173)。不要直接双击 `index.html`：浏览器对 `file://` 下的 ES Modules 有额外限制。

本项目是原生 ES Modules 静态站，无需构建（no build step）。部署到 GitHub Pages、Netlify、Vercel 或任意静态主机时，直接把**仓库根目录**作为站点根目录；入口是 `index.html`，不要只发布 `src/`。所有站内资源使用相对路径，静态主机必须同时提供 `styles/` 与 `src/`。

## 隐私与进度存储

进度仅保存在当前浏览器的 `localStorage`，键名固定为：

```text
agent-learner:progress:v1
```

- 没有账号、分析脚本或网络同步；学习记录不会上传到服务端。
- `localStorage` 中的 JSON 损坏或字段无效时，会安全返回默认进度，模式仍保持 `local`；下一次保存会用有效状态覆盖坏数据。
- 只有读取、写入或删除等存储操作抛出异常、被浏览器阻止或不可用时，才会切换到 `memory` 内存回退模式并显示提示；关闭页面后该次进度会丢失。
- “重置进度”需要页面内二次确认，并且只删除 `agent-learner:progress:v1`，不会清空同域名下其他应用的数据。
- 外部学习资料只有在用户主动打开时才会访问第三方站点；有效链接使用 HTTPS、新标签页以及 `noopener noreferrer`。

## 架构与数据流

项目刻意保持无框架、无打包器：浏览器直接加载 native ES modules。主数据流是：

```text
data（课程事实） -> core（纯逻辑） -> UI（DOM 渲染） -> app（路由与事件） -> storage（本地持久化）
```

- `src/data/` 保存模块目录、课程事实和 `src/data/courses.js` 中不可变的 `courseRegistry`；路由只接受“模块元数据为 active 且课程已经注册”的组合。
- `src/data/llm-foundation.js`、`src/data/agent-mechanism.js`、`src/data/agent-harness.js` 与 `src/data/context-rag-memory.js` 分别保存四个完整课程的数据，由 `courseRegistry` 统一按 `moduleId` 注册；LLM 八课长文分别保存在 `src/data/llm-foundation-notes/`，`src/data/llm-foundation-notes.js` 是统一聚合入口并负责递归冻结。
- `src/core/` 提供可独立测试的进度、筛选、测验、实验计算与 view-model 纯函数；`src/core/agent-mechanism.js` 是 Agent 三实验的判定源，`src/core/agent-harness.js` 负责 run 状态归约、安全 Resume 决策与队列/背压步进，`src/core/context-rag-memory.js` 负责上下文组装、混合检索/证据打包与记忆生命周期，三者均不查询 DOM。
- `src/ui/` 使用安全 DOM API 生成六个通用视图和课程实验，不使用 `innerHTML` 或内联事件；`src/ui/agent-experiments.js`、`src/ui/harness-experiments.js` 与 `src/ui/context-experiments.js` 只负责控件、输入错误、可访问结果和调用对应 core，不复制领域判定。
- `src/app.js` 负责 hash 路由、跨视图状态、焦点恢复、公告与持久化编排。
- `src/core/storage.js` 负责结构校验、`localStorage` 与内存回退。

`src/app.js` 通过注册表按当前 `moduleId` 取得课程，再把同一个 course 交给通用视图；只有 planned 元数据而未注册的模块不可路由。依赖方向保持单向；数据层不导入 UI，纯逻辑不查询 DOM，通用视图不为某个新模块添加特判。

## 目录说明

```text
.
├── index.html                 # 语义化应用壳、跳过链接、挂载点
├── styles/
│   ├── tokens.css             # 色彩、字号、间距、动效 token
│   └── app.css                # 纸张实验室组件与响应式样式
├── src/
│   ├── app.js                 # 路由、事件和应用状态编排
│   ├── data/
│   │   ├── modules.js         # 模块目录、状态、先修关系
│   │   ├── courses.js         # 不可变课程注册表与 getCourse 查询
│   │   ├── llm-foundation.js  # LLM 课程、资源、面试题
│   │   ├── llm-foundation-notes.js # LLM 八课知识笔记聚合入口
│   │   ├── llm-foundation-notes/
│   │   │   ├── llm-01.js      # 第一课知识笔记纯数据
│   │   │   ├── llm-02.js      # 第二课知识笔记纯数据
│   │   │   ├── llm-03.js      # 第三课知识笔记纯数据
│   │   │   ├── llm-04.js      # 第四课知识笔记纯数据
│   │   │   ├── llm-05.js      # 第五课知识笔记纯数据
│   │   │   ├── llm-06.js      # 第六课知识笔记纯数据
│   │   │   ├── llm-07.js      # 第七课知识笔记纯数据
│   │   │   └── llm-08.js      # 第八课知识笔记纯数据
│   │   ├── agent-mechanism.js # Agent 课程、资源、面试题
│   │   ├── agent-harness.js   # Harness 课程、资源、面试题
│   │   └── context-rag-memory.js # Context/RAG/Memory 课程数据
│   ├── core/                  # 无 DOM 的领域逻辑与存储适配器
│   │   ├── agent-mechanism.js # Agent loop、工具契约、计划恢复判定
│   │   ├── agent-harness.js   # Run、Resume 与队列背压判定
│   │   └── context-rag-memory.js # 上下文、检索与记忆纯逻辑
│   └── ui/                    # 各视图、课程详情、实验和 DOM 工具
│       ├── agent-experiments.js # Agent 三项交互实验 renderer
│       ├── harness-experiments.js # Harness 三项交互实验 renderer
│       └── context-experiments.js # Context/RAG/Memory 三实验 renderer
└── tests/
    ├── data.test.js           # 数据规模、字段和交叉引用
    ├── course-registry.test.js # 注册表与多模块路由边界
    ├── learning-logic.test.js # 筛选、测验、实验、view-model
    ├── progress.test.js       # 不可变进度领域
    ├── storage.test.js        # 本地保存、损坏恢复、内存回退
    ├── static-app.test.js     # HTML/CSS/README 发布契约
    └── *ui*.test.js           # 真实渲染路径、交互与焦点回归
```

## 数据字段约定

现有实现是字段契约的权威示例：模块见 `src/data/modules.js`，课程数据见 `src/data/llm-foundation.js`、`src/data/agent-mechanism.js`、`src/data/agent-harness.js` 与 `src/data/context-rag-memory.js`，进度见 `src/core/progress.js`。

### Module

- `id`：稳定、唯一、URL 安全；
- `title`、`summary`：展示文案；
- `status`：`active` 或 `planned`；
- `prerequisites`：引用已存在的模块 ID，依赖图不能成环；
- `estimatedHours`：预计学习时长；
- `promisedContent`：每个模块必须同时包含 `课程 / 资源 / 练习 / 面试高频` 四类内容。

### Lesson

- `id`、`order`、`title`、`summary`、`durationMinutes`；
- `prerequisites`：可选，只引用本模块课程 ID；省略时 view-model 按课程顺序推导上一节为先修；
- `objectives`、`concepts`、`explanations`、`keyPoints`；
- `knowledgeNote`：可选的站内长文主教材，包含 `readingMinutes`、`introduction`、`sections`、`misconceptions`、`recap` 与 `nextStep`；每个 section 由 `id`、`title`、`paragraphs`、`keyPoints`、可选 `callout` 和 `sourceIds` 组成。未提供时继续使用 `explanations`；
- `resourceIds`、`interviewQuestionIds`：必须双向可解析；
- `exercise`：标题、说明、步骤、交付物，可选已有 `experiment` ID；
- `quiz` 与 `completionCriteria`：保证学习者能验证理解与完成状态。

### Resource

- `id`、`title`、`url`、`source`；`platform` 可选，缺省时由 URL 与类型等字段推导；
- `language`、`type`、`difficulty`、`stage`；
- `value`：展示“学习价值”，说明为什么值得学以及证据适用边界；
- `verifiedAt`：`YYYY-MM-DD` 核验日期。
- `evidence`：知识笔记使用的可选来源卡，简要记录 `authority`、`role`、`coverage`、`limitations` 与 `verifiedAt`；它描述来源能证明什么、不能外推什么，不替代正文核验。

### Interview question

- `id`、`lessonId`、`question`；
- `shortAnswer`、`deepDive`、`misconceptions`、`followUps`；
- `frequency`、`difficulty`、`roles`。

### Progress

- `version`、`currentModuleId`、`currentLessonId`、`lastVisitedAt`；
- `completedLessonIds`、`quizResults`；
- `interviewStatusById`、`reviewQueue`。

进度写入必须走 `src/core/progress.js` 的不可变操作和 `src/core/storage.js` 的存储接口，不要让 UI 直接修改原对象。

四个完整模块开放后，多模块契约已经落实为以下事实：

- lesson、resource、quiz、interview 四类内容 ID 在各课程内及跨课程全局唯一，扁平进度记录不会因 ID 碰撞串课；
- 课程与面试进度汇总按当前 course 的真实 ID 集合过滤，其他模块或陈旧记录不计入当前百分比；
- 重置会清空整个专用键 `agent-learner:progress:v1`，不是只清当前模块；它仍不会影响同域名下其他应用的数据；
- 临时资源筛选保存在 `resourceFiltersByModule`，以 `moduleId` 隔离；
- 临时面试筛选保存在 `interviewFiltersByModule`，以 `moduleId` 隔离；
- 临时 revealed 展开状态保存在 `revealedInterviewIdsByModule`，以 `moduleId` 隔离。

`ProgressState` 仍是一个专用键内的扁平记录；上述全局 ID、按当前课程过滤与模块级临时 UI 状态共同保证四个已开放模块不会互相污染。

## 知识笔记复用流程

LLM 基础八课是这套流程的完整模板：单课纯数据位于 `src/data/llm-foundation-notes/`，由 `src/data/llm-foundation-notes.js` 聚合；可复用的项目 Skill 位于 `.agents/skills/build-learning-module-notes/`。后续课程或模块可以沿用这套协议与工具，但每次仍必须重新核验目标课程、资源注册表和每一份来源正文，不能把 LLM 模块的证据判断直接复制到新主题。Agent 机制、Agent Harness、上下文、RAG 与记忆当前仍保留 `explanations` fallback，迁移时也必须逐模块完成同等审计后才能改称长文主教材。

制作或重做知识笔记时，先调用 `$build-learning-module-notes` Skill，再按以下顺序推进：

1. 读取目标 lesson、测验、面试题、练习、完成标准及关联资源，逐来源访问正文并建立来源卡；访问失败、版本限制和证据冲突必须保留。
2. 在写正文前画出知识依赖图与覆盖矩阵，把目标、quiz、面试、练习和完成标准映射到需要讲清的知识与来源证据，再按主题综合，而不是按链接顺序批量拼接摘要。
3. 为可发布章节绑定项目注册表中真实可解析的 `sourceIds`，并记录来源的角色、覆盖范围与限制。资源 metadata、课程字段和模型记忆只能帮助规划覆盖面，不能支撑关键事实或伪装成已读证据。
4. 使用 Skill 的质量量表审查完整性、可学性、证据与边界；只有达到 **85/100** 且没有断裂引用，才接入 data、通用 UI 与 static tests。未达门槛时保留为阻塞报告或待核验提纲，不发布看似完整的主教材。

## 添加新模块

新增模块时按以下顺序执行；每一步都应配套测试：

1. 在 `src/data/modules.js` 添加唯一模块 `id`、标题、状态、先修模块与预计时长。开发期间保持 `planned`；只有元数据而没有注册课程时不可路由。
2. 新建模块数据文件，提供有序 lessons。课程 ID、顺序和可选 `prerequisites` 必须唯一且可解析，先修图不能成环。
3. 为每节课补齐目标、概念、解释、完成标准和 quiz，形成可验证的**课程**内容。
4. 添加经过核验的**资源**，填写 HTTPS URL、来源、学习价值与 `verifiedAt`；平台可显式填写，也可交给统一规则推导。把 `resourceIds` 连接回课程。
5. 为每节课设计可执行的**练习**：至少包含步骤和交付物；只有真正需要交互时才复用或新增实验渲染器。
6. 添加**面试高频**题，包含短答、深挖、误区、追问、岗位、频率与难度；维护 lesson ↔ interview 双向引用。
7. 在 `src/data/courses.js` 导入课程并加入不可变 registry。路由和六个通用视图会根据 registry 选择课程；未注册模块即使误标为 `active` 也会安全回退。
8. 为注册表、路由、数据约束、筛选/进度等纯逻辑先写失败测试，再实现最小变更。完成 registry 注册后，最后才把模块状态从 `planned` 改成 `active`。
9. 运行全量测试，检查键盘焦点与 320px 布局。优先扩展现有通用 dashboard、curriculum、map、resources、interviews、progress 渲染路径；不要在通用视图里按模块 ID 特判。若模型差异确实需要新能力，先更新字段契约与测试。

若新模块包含上下文、检索或记忆能力，仍应把数据层事实、core 纯逻辑和 UI renderer 分开：RAG 不是某个向量数据库的别名；检索结果与 citation 必须保留来源和版本，但它们不自动保证生成忠实；教学记忆模拟也不构成真实数据保护或隐私合规证明。

换言之，每个模块必须交付四类内容：**课程、资源、练习、面试高频**。只有目录卡片不算完成模块。

## 资源准入与核验

资源排序原则：官方文档与课程、GitHub 原始项目、大学公开课/论文、原作者讲解优先；高质量社区教程用于补充视角。资源库展示并可筛选**来源、类型、难度、阶段**，课程数据同时记录**学习价值**与 `verifiedAt`，这些标签用于区分证据角色和核验时间，不把厂商经验或社区案例冒充普适结论。

- 仅收录可解析的 HTTPS 链接，不编造项目名、作者、地址或核验结论。
- 添加前打开目标页，确认标题、作者/组织、内容主题与可访问性，再把当天日期写入 `verifiedAt`。
- 优先稳定的项目主页、文档页、论文页或公开视频页，避免搜索结果页、临时跳转和需要私有权限的链接。
- 官方 SDK 文档仅用于说明其当前实现语义，不把某个版本的 Runner、状态或审批 API 写成跨框架标准。
- 框架的 checkpoint/replay 只证明该框架的具体语义，不可外推为所有 Harness 的通用保证。
- durable 编排不保证任意外部副作用 exactly-once；仍需幂等键、去重、查询、对账或补偿来处理模糊窗口。
- 厂商文章提供的是工程经验，不是普适定律；采用其 timeout、retry 或过载策略前仍需在本系统验证。
- RAG 资料需区分 corpus、index、retrieval candidate、evidence packet 与 citation；召回或附带引用不代表 claim 已被证据支持，也不承诺消除幻觉。
- 长期记忆案例需记录 provenance、scope、TTL、纠正和删除语义；本站的确定性模拟只用于学习生命周期，不代表真实隐私与合规控制。
- 视频（包括短视频）仅作为直觉、演示与中文导航的补充，不承担可靠性或安全性结论。小红书因无稳定公开核验链接而未收录；这只说明本次证据条件不足，不评价平台内容质量。
- 链接失效、内容改名或长期未核验时，先更新或移除，再调整课程引用；不要保留“看起来可能正确”的不稳定链接。

## 测试与发布检查

开发遵循测试先行：先让描述新契约的测试因缺失能力而失败，再实现最小改动，最后跑全量回归。

```bash
npm test
git diff --check
find src tests -name '*.js' -exec node --check {} \;
```

发布前还应：

- 用 `npm run serve` 启动仓库根目录，确认 `/`、`/styles/app.css`、`/src/app.js` 均返回 HTTP 200；
- 在约 1440px 与 320px/390px 宽度分别检查四个模块的六个视图、十二项实验、筛选、测验、面试展开/状态/队列、持久化与重置；
- 仅在明确导航时把焦点移到 `main`，筛选、展开、状态和重置后恢复到有意义的控件或摘要；
- 保证每个路由一个 `h1`，后续标题层级合理；动态结果使用礼貌 live region；展开控件使用 `aria-expanded` 与 `aria-controls`；
- 以键盘检查跳过链接、可见焦点、禁用状态和二次确认；核心移动端触控目标约 44px；
- 检查正常文本至少 4.5:1 对比度、长文本无横向溢出、`prefers-reduced-motion` 生效、控制台无错误；
- 不点击无必要的第三方资源，不把本地测试进度带入正式预览。

## 开发工作流

保持提交小而可验证：数据、纯逻辑、UI 与文档分别说明意图；修改后先跑目标测试，再跑 `npm test`。这是静态站，没有构建产物需要提交，也不应提交本地服务器、浏览器状态或临时截图。静态托管始终从仓库根目录提供原始文件。
