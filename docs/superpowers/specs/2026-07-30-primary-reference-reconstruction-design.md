# 一级参考资料驱动的五模块重构设计

## 1. 状态与决策

- 设计日期：2026-07-30
- 用户确认：覆盖当前全部 5 个已完成模块
- 更新方式：重构型更新，不采用末尾追加资料的补丁方式
- 兼容要求：保留每个模块现有 8 节课、路由 ID 与学习进度
- 发布要求：测试、真实浏览器验收、PR 合并，最后部署到现有 Vercel Production
- 生产约束：Vercel 是唯一生产部署；GitHub Pages 保持关闭

本设计把以下两组资料提升为课程的一级叙事参考源：

1. 飞书知识库 `Harness 101 🔥🔥🔥` 及其 15 篇子文档：
   `https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe`
2. JavaGuide AI 专题及 `/ai/` 下的文章：
   `https://javaguide.cn/ai/`

官方文档、规范与论文继续作为事实校验层。一级参考源决定课程如何解释问题、如何组织工程案例和哪些关系值得图解；官方资料决定关键事实、版本边界、协议行为和数值主张是否可以发布。

## 2. 要解决的问题

当前知识笔记已经比早期资料列表更完整，但新资料没有进入统一的课程生产线。若只把文章链接、段落或图片追加到现有页面，会重新出现以下问题：

- 课程正文与参考资料各说各话，学习者仍需自行拼接知识体系；
- 相同概念在 LLM、Agent、Harness、Context/RAG/Memory 与后端模块中重复定义；
- 资料中的工程案例和图表没有映射到课程目标、练习、测验与面试判断；
- 第三方图像可能在许可、作者、修改权和再分发权不明时被直接下载；
- 新资料改变了叙事，却没有留下可追踪的来源贡献与事实校验记录；
- 课程更新可能破坏既有路由、学习进度或跨模块前置关系。

本次重构的结果必须是一套可独立学习的知识笔记。原始文章负责扩展、追溯与进一步阅读，不承担正文缺失部分。

## 3. 目标与非目标

### 3.1 目标

1. 重构 5 个模块共 40 节课的课内知识主线。
2. 让每节课都能说明一级参考源具体贡献了哪些概念、案例、反例或视觉问题。
3. 让飞书与 JavaGuide 对课程叙事和工程案例的影响约占 60%，官方资料约占 30%，现有内容与其他资料约占 10%。
4. 将该比例解释为“知识结构与案例影响”，不按字数或引用次数机械计算。
5. 建立来源清单、主张矩阵、视觉许可门和来源影响审计。
6. 保留每节课的学习目标、正文、误区、练习、测验、面试题与完成标准闭环。
7. 将有教学价值的流程、状态、关系、边界与权衡变成可访问的视觉内容。
8. 保持 40 个 lesson ID、路由、模块顺序和现有学习进度兼容。
9. 在 Vercel Preview、PR、合并与 Production 全链路验证发布产物。

### 3.2 非目标

- 不镜像或转载飞书、JavaGuide 的完整文章。
- 不把引用数量当作来源权重的替代指标。
- 不因为 JavaGuide 仓库采用 Apache-2.0，就默认其页面内每张第三方图片都可再分发。
- 不把飞书作者的产品观察、逆向分析或版本行为自动提升为行业标准。
- 不改变课程路由、进度存储模型或站点部署平台。
- 不为了视觉数量制作装饰图。
- 不把全部 5 个模块合并成一套新的课程目录。

## 4. 来源边界与冻结方式

### 4.1 飞书来源范围

知识库根节点标题为 `Harness 101 🔥🔥🔥`，当前有 15 个直接子文档，且这些子文档没有进一步的 Wiki 子节点：

1. Harness 101：从 ReAct Loop 讲起
2. Harness 101：模型之外的全部
3. Harness 101：从零认识 Loop Engineering
4. Harness 101：Loop Engineering—从 ReAct 到 Orchestration
5. Harness 101：复刻 Dynamic Workflow（含代码）
6. Harness 101：Agent Version Drifting
7. Harness 101：工具的真相
8. Harness 101：Company Brain
9. Harness 101：Context Offloading 机制
10. Harness 101：Claude Code 的三种上下文压缩与 Microcompact 的秘密
11. Harness 101：写给 Agent 的虚拟文件系统
12. Harness 101：Claude Code Agent 里的常用工具一览
13. Harness 101：Claude.AI 提示词与记忆结构解析
14. Harness 101：从 for 循环到自治系统的进化之路
15. Harness 101：专为 Agent 设计的 Install.md

实施阶段读取每篇文档的完整正文、代码、表格和媒体清单，并记录 `node_token`、`obj_token`、标题、revision、读取时间与内容 hash。原始正文只存放在本地忽略目录或临时目录，不提交到 Git；仓库只提交摘要、主张、来源元数据和 hash。

飞书图片默认视为尚未取得再分发与修改许可。若没有作者、许可链接、再分发权和修改权的明确证据，只提炼图中的知识关系并从空白画布原创重绘。

### 4.2 JavaGuide 来源范围

冻结范围是抓取时从 `https://javaguide.cn/ai/` 导航与页面链接可达、canonical URL 仍位于 `/ai/` 前缀下的文章，包括：

- 入门总览与 AI 核心概念；
- LLM 运行机制、API 工程、结构化输出与评测；
- Agent、Memory、Prompt、Context、Skills、MCP、Harness、Workflow 与 Loop；
- RAG 基础、文档处理、向量索引、更新、GraphRAG 与检索优化；
- AI 系统设计、模型网关与相关生产工程；
- `/ai/` 下的面试与复习文章。

实施阶段生成确定性的 canonical URL 清单，不将站外学习路线、商业内容或 `/ai-coding/` 自动纳入本次范围。

JavaGuide 主仓库标注 Apache-2.0，README 另要求转载注明出处。媒体仍逐图核验：

- 确认资产位于受许可覆盖的仓库路径；
- 检查文章是否声明图片来自第三方；
- 记录作者、原始 URL、仓库路径、许可证 URL、获取日期；
- 改编时记录修改内容并保留归因；
- 不能完成上述证据链时，降级为链接或原创重绘。

### 4.3 官方校验来源

涉及以下类型的主张必须增加官方文档、规范或论文校验：

- SDK、API、CLI、协议字段与当前产品行为；
- 版本号、默认参数、上下文窗口、计费或配额；
- 安全、权限、隔离、沙箱和数据治理能力；
- 算法、公式、数值、性能或评测结果；
- “支持”“保证”“自动”“只执行一次”等强语义；
- 对特定厂商、框架或产品内部机制的描述。

当一级参考源与官方来源冲突时：

1. 可验证事实以官方来源为准；
2. 工程解释可保留一级参考源的教学框架，但要标明适用范围；
3. 无法裁决的观点标记为 `contested`，正文不得把它写成唯一答案；
4. 时间敏感行为标记为 `volatile`，显示“截至日期”和最后复核时间。

## 5. 来源优先级模型

### 5.1 三层来源角色

| 层级 | 角色 | 作用 |
| --- | --- | --- |
| 一级 | `primary-narrative` | 决定知识主线、工程问题、案例形态、失败模式与视觉问题 |
| 二级 | `verification` | 校验事实、版本、协议、数值、安全边界和强语义 |
| 三级 | `supplemental` | 提供不同解释、延伸阅读、历史背景或额外示例 |

“60 / 30 / 10”不是字数配额。实施用以下可检查代理指标代替：

- 每节课至少绑定一个本次新增的一级参考源；
- Agent Harness 与 Context/RAG/Memory 两个深度重构模块在模块级同时覆盖飞书和 JavaGuide；
- 每个被重写的核心 section 都记录 `sourceContribution`；
- 每节课至少有一个案例、失败模式或视觉问题受到一级参考源直接启发；
- 需要官方校验的主张不得只有一级参考源；
- 来源影响审计必须记录一级参考源带来的新增、纠错、深化、拒绝或去重。

### 5.2 来源记录

在现有课程资源结构上增加可被测试读取的来源元数据：

```js
{
  id: 'res-primary-javaguide-harness',
  title: '一文搞懂 Harness Engineering',
  url: 'https://javaguide.cn/ai/agent/harness-engineering.html',
  sourceFamily: 'javaguide-ai',
  sourceTier: 'primary-narrative',
  author: 'Guide',
  retrievedAt: freezeDate,
  updatedAt: readPublishedDate(page),
  contentHash: `sha256:${sha256(normalizeSource(page))}`,
  evidence: {
    role: 'framework',
    supports: ['六层架构', '上下文管理', '状态与安全边界'],
    limitations: '工程解释来源；具体产品与协议行为需官方来源校验'
  }
}
```

飞书来源使用稳定的 Wiki URL 或 node token 生成站内 source ID，不把授权 token、访问令牌或完整私有正文提交到仓库。

### 5.3 主张矩阵

每个可发布主张保存如下研究态记录：

```js
{
  claimId: 'claim-harness-tool-executor',
  moduleId: 'agent-harness',
  lessonId: 'harness-01',
  sectionId: 'decision-and-control-planes',
  statement: '模型产生工具调用意图，Harness 负责校验与执行。',
  status: 'verified',
  primarySourceIds: ['res-primary-feishu-tool-truth'],
  verificationSourceIds: ['res-openai-agents-tools'],
  sourceContribution: 'deepened',
  lastVerifiedAt: '2026-07-30'
}
```

主张矩阵属于研究与测试输入，不要求全部发送到浏览器。站点展示 section 的来源卡、证据角色与边界即可。

`sourceContribution` 只允许 `adopted`、`corrected`、`deepened`、`rejected` 与 `duplicate`，分别表示采用新知识、纠正旧内容、深化现有内容、因证据或边界不足而拒绝，以及与现有内容重复。

## 6. 课内知识笔记契约

每个 section 按同一教学顺序组织：

1. **问题**：本节要解决的真实工程问题；
2. **核心回答**：2–4 句可复述结论和适用边界；
3. **机制展开**：状态、数据、计算或控制流；
4. **视觉解释**：承载关系、流程、对比、边界或决策；
5. **工程现场**：由一级参考源启发、统一改写的案例、代码或 transcript；
6. **失败边界**：错误路径、反例、成本、安全、版本和不确定性；
7. **判断与练习**：测验、面试题、练习步骤与完成标准；
8. **来源卡**：解释资料在本节扮演的角色、支持范围和限制。

正文不得要求学习者先打开原文才能理解本节。原文用于验证、追溯和扩展。

## 7. 课程兼容性

以下标识必须保持稳定：

- 模块 ID；
- 40 个 lesson ID；
- URL hash 路由；
- 本地进度使用的 lesson 完成键；
- 被进度、实验或 UI 测试引用的既有稳定 ID。

允许改变：

- section 的标题、顺序和正文；
- 误区、recap 与 next step；
- 练习内容、测验题干、面试深挖与完成标准；
- 来源集合；
- 新增视觉资产、visual ID 和 placement；现有 LLM visual ID 保持稳定，被其他模块引用的 ID 不得删除。

任何 ID 变更必须先证明不进入现有进度存储、路由或跨文件引用；不能证明时保留旧 ID。

## 8. 五模块映射

### 8.1 LLM 基础：重点补强

主要吸收 JavaGuide 的 LLM 运行机制、Token、上下文窗口、采样、API 调用、结构化输出和评测。飞书的 Agent Version Drifting、Prompt 装配与工具 transcript 用于补充版本边界和运行时连接。

保留现有 40 张主视觉和 12 张步骤图的最低覆盖，不因新来源降低数量或可访问性。若新资料暴露概念缺口，优先修订既有图；只有认知问题独立时才新增图。

### 8.2 Agent 机制：重点补强

以 JavaGuide Agent、Memory、Prompt、Context、Skills、MCP、Workflow 与 Loop 为系统主线；以飞书 ReAct Loop、工具契约、单轮/并行/多轮调用和从 for 循环到自治系统的演化作为运行轨迹。

重点消除 Agent、Workflow、Graph、Loop、Skill、MCP、Tool Calling 与 Harness 之间的概念重叠。

### 8.3 Agent Harness：深度重构

飞书 15 篇文档是主要叙事骨架，JavaGuide Harness、Workflow、Loop、Skills、MCP 与系统设计负责横向整理。官方 SDK、协议和运行时资料负责验证。

重点主题包括：

- 模型与 Harness 的责任边界；
- ReAct、多轮 Loop、Plan-then-Act 与 Orchestration；
- 工具定义、发现、调用、执行与 transcript；
- Dynamic Workflow、机械控制流、并行、pipeline 与 journaled replay；
- Agent Version Drifting；
- Context Offloading、Microcompact 与压缩层级；
- 文件系统、sandbox、memory、search、hooks 与 AgentFS；
- Skill、Install.md 与渐进式披露；
- 长程执行、停止条件、验证、预算与人类介入。

### 8.4 Context / RAG / Memory：深度重构

JavaGuide RAG 全专题提供知识库主线；飞书 Company Brain、Context Offloading、Microcompact、VFS 和 Claude.AI 记忆结构提供长程上下文和记忆案例。

重点区分：

- prompt、context、memory、retrieval 与 external state；
- factual、interaction 与 action memory；
- chunk、embedding、index、hybrid search、rerank 与 context packing；
- 增量更新、版本、去重、回滚和全量重建；
- GraphRAG 的局部与全局问题；
- 上下文卸载、压缩、引用恢复与可重取数据；
- RAG 失败定位与评测闭环。

### 8.5 AI 后端工程：重点补强

JavaGuide API 工程、结构化输出、评测、AI 系统设计和模型网关是主要增量；飞书工具契约、Dynamic Workflow、journaled replay、VFS 与 sandbox 用于补充控制面和恢复案例。

重点主题包括：

- 流式输出、取消、超时、重试、限流与幂等；
- schema、业务校验与副作用边界；
- 多模型路由、fallback、预算、缓存、配额和成本归因；
- trace、Golden Set、CI 回归、LLM-as-Judge 与灰度；
- 权限、审计、凭证、sandbox 与数据隔离；
- durable state、checkpoint、replay 和不确定副作用对账。

## 9. 视觉系统与媒体许可

### 9.1 视觉覆盖

视觉数量服从认知问题，不做装饰配额，但设置最低教学覆盖：

- 每节课至少一个 overview；
- 每节课至少再有一个 mechanism、process、comparison、boundary 或 decision 视觉；
- Agent Harness 与 Context/RAG/Memory 每节课目标不少于三个主视觉；
- LLM 基础保持当前每课五个主视觉的覆盖；
- 复杂计算或状态变化可增加 step-diagram。

若某节课无法找到第二个有价值的视觉问题，必须在视觉清单中写出理由并由教学审查通过，不能用装饰图填数。

### 9.2 媒体决策

沿用现有视觉契约：

- `original-synthesis`
- `licensed-reproduction`
- `licensed-adaptation`
- `official-media`

每个第三方候选资产必须记录：

- 原始语境和图号或页面位置；
- 作者与原始 URL；
- 许可证或媒体政策 URL；
- 再分发与修改权限；
- 获取日期、版本与修改记录；
- 本地文件 hash；
- `sourceIds`、owning section 与 assessed coverage。

许可不足时：

1. 不下载；
2. 不热链；
3. 不近似临摹布局和视觉表达；
4. 可以保留来源链接；
5. 从知识主张和数据出发原创重绘。

### 9.3 可访问性与安全

全部视觉继续满足：

- 本地资产，不依赖运行时第三方域名；
- 优先 SVG，固定 `viewBox`；
- title、desc、alt、caption 和 long description；
- 颜色之外的形状、线型、文字或纹理编码；
- 键盘可操作的 step controls；
- `prefers-reduced-motion`；
- 320px、390px 与桌面视口可读；
- 无 script、事件处理器、foreignObject、远程资源或可执行链接；
- 定量图由 fixture 复算，不能把手写结果伪装为数据真源。

## 10. 异常状态

来源与主张使用以下显式状态：

| 状态 | 含义 | 发布行为 |
| --- | --- | --- |
| `verified` | 主张、来源、时间和边界闭环 | 可进入正文 |
| `contested` | 来源冲突且没有唯一裁决 | 并列观点或收窄结论 |
| `volatile` | 产品或版本相关 | 标注截至日期并设置复核时间 |
| `license-blocked` | 媒体许可证据不足 | 链接或原创重绘 |
| `source-unavailable` | 页面移动、权限失效或暂不可读 | 可使用已冻结摘要，不新增无法校验的主张 |

处理规则：

- JavaGuide URL 变化时，先解析 canonical 或 Git 历史；不能定位则标记 `source-unavailable`；
- 飞书 revision 变化时重新计算 hash，并只重审受影响主张；
- 一级来源与官方来源冲突时，不静默选择更顺口的版本；
- 只有图片加载失败时，正文仍必须完整可学，figure 显示 fallback 和来源链接；
- 定量输入不完整时，图不得发布为精确数值图；
- 许可证据不完整时，视觉发布门失败，不以“公开网页可见”推断许可。

## 11. 实施批次

该范围包含一个来源基础设施和五个可独立验证的模块纵向切片。实施计划不把全部工作塞进单个超长任务，而是生成一个来源冻结计划和五个模块计划；最终再由一个集成与发布计划执行全量回归、PR、合并和 Vercel Production 发布。

### 11.1 批次 0：来源冻结

1. 抓取飞书 15 篇完整文档及媒体清单；
2. 抓取 JavaGuide `/ai/` canonical 路由清单、正文结构与图片候选；
3. 生成来源 registry、内容 hash 和影响清单；
4. 标记官方校验需求、媒体许可状态与阻塞项。

### 11.2 模块纵向切片

实施顺序：

1. Agent Harness
2. Context / RAG / Memory
3. LLM 基础
4. Agent 机制
5. AI 后端工程

每个模块内部按同一闭环执行：

1. gap audit；
2. 先写失败的来源、内容与视觉契约测试；
3. 重写 8 节笔记；
4. 更新练习、测验、面试题与完成标准；
5. 制作或合规改编视觉；
6. 运行模块测试、人工事实审查和教学审查；
7. 提交独立模块 commit；
8. 全部模块完成后运行全量回归。

## 12. 测试与验收

### 12.1 来源与内容契约

自动测试至少证明：

- 40 个 lesson ID 与模块路由保持稳定；
- 每节课至少有一个本次一级参考源；
- 两个深度重构模块在模块级同时覆盖飞书和 JavaGuide；
- section 的 `sourceIds` 能解析到 lesson resource、证据元数据和全局 registry；
- 需要官方验证的主张存在 verification source；
- 不存在空标题、空正文、空来源边界或未解析 ID；
- 学习目标、测验、练习、面试题与完成标准可以回指正文；
- 旧进度数据加载后仍能定位同一 lesson。

### 12.2 视觉契约

自动测试至少证明：

- visual ID 唯一且 ownership 唯一；
- visual placement 指向真实 section；
- 资产路径存在并返回 200；
- 许可元数据与 provenance 相容；
- 禁止远程依赖和可执行 SVG；
- alt、caption、long description 非空；
- quantitative fixture 可以从输入复算结果；
- fallback、未解析 visual ID、加载失败与 step fallback 不破坏正文；
- 页面级没有横向溢出。

### 12.3 人工审查

逐课审查以下问题：

1. 不打开原始文章，是否仍能完成本课学习与练习？
2. 新资料是否真的新增、纠正或深化了知识，而非改写同义句？
3. 一级参考源的观察与官方事实是否分界清楚？
4. 图表是否回答了明确的认知问题？
5. 来源、版权与许可是否可追溯？
6. 与前后课程的术语、前置知识和 next step 是否连续？

真实浏览器验收覆盖：

- 40 个 lesson route；
- 桌面、390×844 与 320×800；
- step-diagram 前进、后退、状态和键盘操作；
- 图片失败 fallback；
- 旧进度加载；
- 现有实验与非视觉模块回归；
- console warning/error；
- 公网核心资源与抽样媒体状态。

## 13. 发布流程

1. 从最新 `main` 创建隔离功能工作树；
2. 按模块提交小步 commit；
3. 全量测试、静态检查、内容审计与浏览器矩阵通过；
4. 推送功能分支；
5. 创建 Vercel Preview，并核对 Preview 的 branch SHA；
6. 创建 PR，完成最终审查后合并；
7. 部署合并后的 `main` 精确 SHA 到现有 Vercel Production；
8. 验证 `READY`、`PROMOTED`、canonical alias、production target 和 SHA；
9. 验证公开站点、五模块路由、关键图表与控制台；
10. 确认 GitHub Pages 仍为关闭状态。

## 14. 完成定义

只有同时满足以下条件，任务才算完成：

- 两组资料的页面、子文档和媒体候选已经冻结并可追溯；
- 5 个模块、40 节课已完成重构；
- 一级参考源在知识主线、案例和视觉问题中有可审计的实质贡献；
- 事实、版本与安全主张经过校验；
- 第三方媒体全部通过许可门或被原创替代；
- 课程路由和学习进度保持兼容；
- 自动化测试与真实浏览器验收通过；
- PR 已合并；
- Vercel Production 已部署精确的 `main` 合并 SHA；
- GitHub Pages 保持关闭。
