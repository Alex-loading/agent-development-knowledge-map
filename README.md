# Agent Learner：Agent 开发知识地图

Agent Learner 是一个面向 AI / Agent 开发入门与面试复习的中文交互式学习站。当前版本先把「LLM 基础」整理成可学习、可练习、可复习、可记录进度的完整模块，而不是只罗列链接。

页面采用“纸张研究实验室”视觉：暖色纸张底、深绿墨色、朱红索引与赭色批注。当前仓库未提交产品截图；启动本地服务即可查看桌面与移动端布局。

## 当前状态

LLM 基础模块已完成，包含：

- 8 节课程，覆盖 AI / ML / LLM、神经网络、Token 与上下文、Transformer、训练与对齐、推理与采样、提示与结构化输出、评测与安全；
- 28 份已记录核验日期的精选资源；
- 24 道面试高频题，每题含 30 秒回答、深挖要点、常见误区与追问；
- 3 个交互实验：Token / 上下文预算台、Attention 直觉台、采样参数实验；
- 课程完成度、测验记录、面试掌握度与复习队列的本地进度。

以下模块目前只有目录、依赖关系和“规划中”状态等脚手架元数据，尚无课程正文：

- Agent 机制
- Agent Harness
- 上下文、RAG 与记忆
- AI 后端工程
- 评测、可观测与安全
- 多 Agent 与 MCP
- 求职与项目交付

请勿把规划模块理解为已经开放的学习内容。

## 功能导览

站点有六个一级视图：

1. **模块首页**：给出下一节推荐、课程与面试双轨进度、复习入口和八步迷你路径。
2. **学习主线**：按先修关系展示 8 节课程；课程详情包含讲解、资料、练习、测验和完成标准。
3. **知识地图**：用可用、当前、已完成、待先修等文本状态展示概念路径，状态不只依赖颜色。
4. **资源库**：按语言、平台、来源、类型、难度和阶段组合筛选 28 份资源。
5. **面试高频**：先自行口述，再展开参考答案；可筛选岗位与掌握状态，并维护复习队列。
6. **学习进度**：分别汇总课程与面试记录，可通过二次确认重置本模块进度。

三项概念实验嵌在对应课程内：

- `llm-03`：**Token / 上下文预算台**，演示系统指令、历史、检索与输出如何竞争上下文预算；
- `llm-04`：**Attention 直觉台**，演示教学关联分、归一化权重与因果掩码；
- `llm-06`：**采样参数实验**，比较 temperature、top-p 与候选核变化。

这些实验明确是教学模型，不冒充真实 tokenizer、完整多头注意力或生产推理服务。

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
- 浏览器阻止或损坏 `localStorage` 时，会自动降级为内存回退模式；关闭页面后该次进度会丢失，页面会显示提示。
- “重置进度”需要页面内二次确认，并且只删除 `agent-learner:progress:v1`，不会清空同域名下其他应用的数据。
- 外部学习资料只有在用户主动打开时才会访问第三方站点；有效链接使用 HTTPS、新标签页以及 `noopener noreferrer`。

## 架构与数据流

项目刻意保持无框架、无打包器：浏览器直接加载 native ES modules。主数据流是：

```text
data（课程事实） -> core（纯逻辑） -> UI（DOM 渲染） -> app（路由与事件） -> storage（本地持久化）
```

- `src/data/` 只保存模块目录、课程、资源与面试题等事实数据。
- `src/core/` 提供可独立测试的进度、筛选、测验、实验计算与 view-model 纯函数。
- `src/ui/` 使用安全 DOM API 生成六个视图和课程实验，不使用 `innerHTML` 或内联事件。
- `src/app.js` 负责 hash 路由、跨视图状态、焦点恢复、公告与持久化编排。
- `src/core/storage.js` 负责结构校验、`localStorage` 与内存回退。

依赖方向保持单向；数据层不导入 UI，纯逻辑不查询 DOM，通用视图不为某个新模块添加特判。

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
│   │   └── llm-foundation.js  # LLM 课程、资源、面试题
│   ├── core/                  # 无 DOM 的领域逻辑与存储适配器
│   └── ui/                    # 各视图、课程详情、实验和 DOM 工具
└── tests/
    ├── data.test.js           # 数据规模、字段和交叉引用
    ├── learning-logic.test.js # 筛选、测验、实验、view-model
    ├── progress.test.js       # 不可变进度领域
    ├── storage.test.js        # 本地保存、损坏恢复、内存回退
    ├── static-app.test.js     # HTML/CSS/README 发布契约
    └── *ui*.test.js           # 真实渲染路径、交互与焦点回归
```

## 数据字段约定

现有实现是字段契约的权威示例：模块见 `src/data/modules.js`，课程数据见 `src/data/llm-foundation.js`，进度见 `src/core/progress.js`。

### Module

- `id`：稳定、唯一、URL 安全；
- `title`、`summary`：展示文案；
- `status`：`active` 或 `planned`；
- `prerequisites`：引用已存在的模块 ID，依赖图不能成环；
- `estimatedHours`：预计学习时长；
- `promisedContent`：每个模块必须同时包含 `课程 / 资源 / 练习 / 面试高频` 四类内容。

### Lesson

- `id`、`order`、`title`、`summary`、`durationMinutes`；
- `prerequisiteLessonIds`：只引用本模块课程 ID；
- `objectives`、`concepts`、`explanations`、`keyPoints`；
- `resourceIds`、`interviewQuestionIds`：必须双向可解析；
- `exercise`：标题、说明、步骤、交付物，可选已有 `experiment` ID；
- `quiz` 与 `completionCriteria`：保证学习者能验证理解与完成状态。

### Resource

- `id`、`title`、`url`、`source`、`platform`；
- `language`、`type`、`difficulty`、`stage`；
- `value`：说明为什么值得学；
- `verifiedAt`：`YYYY-MM-DD` 核验日期。

### Interview question

- `id`、`lessonId`、`question`；
- `shortAnswer`、`deepDive`、`misconceptions`、`followUps`；
- `frequency`、`difficulty`、`roles`。

### Progress

- `version`、`currentModuleId`、`currentLessonId`、`lastVisitedAt`；
- `completedLessonIds`、`quizResults`；
- `interviewStatusById`、`reviewQueue`。

进度写入必须走 `src/core/progress.js` 的不可变操作和 `src/core/storage.js` 的存储接口，不要让 UI 直接修改原对象。

## 添加新模块

新增模块时按以下顺序执行；每一步都应配套测试：

1. 在 `src/data/modules.js` 添加唯一模块 `id`、标题、状态、先修模块与预计时长。开发期间保持 `planned`，内容和测试完整后再切换为 `active`。
2. 新建模块数据文件，提供有序 lessons。课程 ID、顺序和 `prerequisiteLessonIds` 必须唯一且可解析，先修图不能成环。
3. 为每节课补齐目标、概念、解释、完成标准和 quiz，形成可验证的**课程**内容。
4. 添加经过核验的**资源**，填写 HTTPS URL、来源、平台、学习价值与 `verifiedAt`；把 `resourceIds` 连接回课程。
5. 为每节课设计可执行的**练习**：至少包含步骤和交付物；只有真正需要交互时才复用或新增实验渲染器。
6. 添加**面试高频**题，包含短答、深挖、误区、追问、岗位、频率与难度；维护 lesson ↔ interview 双向引用。
7. 为数据约束、筛选/进度等纯逻辑先写失败测试，再实现最小变更。运行全量测试，检查键盘焦点与 320px 布局。
8. 优先扩展现有通用 dashboard、curriculum、map、resources、interviews、progress 渲染路径；不要在通用视图里按模块 ID 特判。若模型差异确实需要新能力，先更新字段契约与测试。

换言之，每个模块必须交付四类内容：**课程、资源、练习、面试高频**。只有目录卡片不算完成模块。

## 资源准入与核验

资源排序原则：官方文档与课程、GitHub 原始项目、大学公开课/论文、原作者讲解优先；高质量社区教程用于补充视角。

- 仅收录可解析的 HTTPS 链接，不编造项目名、作者、地址或核验结论。
- 添加前打开目标页，确认标题、作者/组织、内容主题与可访问性，再把当天日期写入 `verifiedAt`。
- 优先稳定的项目主页、文档页、论文页或公开视频页，避免搜索结果页、临时跳转和需要私有权限的链接。
- 博客和长视频可以承担系统讲解；Bilibili、YouTube 等视频需标明来源。小红书、抖音等短视频只作为补充线索，不作为核心知识与事实依据。
- 链接失效、内容改名或长期未核验时，先更新或移除，再调整课程引用；不要保留“看起来可能正确”的不稳定链接。

## 测试与发布检查

开发遵循测试先行：先让描述新契约的测试因缺失能力而失败，再实现最小改动，最后跑全量回归。

```bash
npm test
git diff --check
find src -name '*.js' -print0 | xargs -0 -n1 node --check
```

发布前还应：

- 用 `npm run serve` 启动仓库根目录，确认 `/`、`/styles/app.css`、`/src/app.js` 均返回 HTTP 200；
- 在约 1440px 与 320px/390px 宽度检查六个视图、三项实验、筛选、测验、面试展开/状态/队列、持久化与重置；
- 仅在明确导航时把焦点移到 `main`，筛选、展开、状态和重置后恢复到有意义的控件或摘要；
- 保证每个路由一个 `h1`，后续标题层级合理；动态结果使用礼貌 live region；展开控件使用 `aria-expanded` 与 `aria-controls`；
- 以键盘检查跳过链接、可见焦点、禁用状态和二次确认；核心移动端触控目标约 44px；
- 检查正常文本至少 4.5:1 对比度、长文本无横向溢出、`prefers-reduced-motion` 生效、控制台无错误；
- 不点击无必要的第三方资源，不把本地测试进度带入正式预览。

## 开发工作流

保持提交小而可验证：数据、纯逻辑、UI 与文档分别说明意图；修改后先跑目标测试，再跑 `npm test`。这是静态站，没有构建产物需要提交，也不应提交本地服务器、浏览器状态或临时截图。静态托管始终从仓库根目录提供原始文件。
