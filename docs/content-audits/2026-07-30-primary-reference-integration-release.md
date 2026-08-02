# 五模块一级资料重构：集成与发布前审计

审计基线：`feat/primary-reference-reconstruction`；集成执行日期：2026-08-02。本文只记录仓库内已经能够复核的内容与发布前证据。Vercel Preview、Production URL、部署状态和最终 `main` SHA 必须由发布负责人在真实远端操作后补录；本文不会用本地 SHA 或预期 URL伪造部署完成。

## 结论与边界

五个 active module 保持精确 40 个稳定 lesson ID 与原 canonical Hash route；`agent-learner:progress:v1` 没有迁移，旧的完成记录继续按全局唯一 lesson ID 解析。共享一级来源 registry 仍是 50 个 canonical source（16 个 Feishu Harness 101、34 个 JavaGuide AI），课程层以 81 个全局唯一 resource binding 把同一 canonical identity 接入不同教学语境；canonical identity 可以复用，课程 resource ID 不可复用。

两家指定资料负责课程叙事顺序和问题选择，不承担产品、协议、安全、性能或许可的普遍保证。官方文档、开放标准、原始论文和可复现实验负责收紧机制与时效性主张。现有课程的稳定 ID、练习、面试和经过核验的原创综合只承担兼容与补充作用。

## 精确生产 inventory

| moduleId | lessons | sections | paragraphs | resources | primaryBindings | verificationResources | sourceImpactDecisions | quizzes | interviews | mainVisuals | stepStates | localAssets |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `llm-foundation` | 8 | 55 | 179 | 41 | 13 | 15 | 12 | 16 | 24 | 40 | 12 | 52 |
| `agent-mechanism` | 8 | 53 | 166 | 47 | 18 | 22 | 8 | 16 | 24 | 16 | 0 | 16 |
| `agent-harness` | 8 | 50 | 154 | 53 | 23 | 22 | 11 | 16 | 24 | 24 | 3 | 27 |
| `context-rag-memory` | 8 | 51 | 174 | 44 | 15 | 23 | 8 | 16 | 24 | 24 | 3 | 27 |
| `backend-engineering` | 8 | 48 | 154 | 49 | 12 | 35 | 8 | 16 | 24 | 16 | 0 | 16 |
| **total** | **40** | **257** | **827** | **234** | **81** | **117** | **47** | **80** | **120** | **120** | **18** | **138** |

`verificationResources` 是模块内 authority 为 official 或 academic 的 resource 数，不是跨模块去重后的文献数。`localAssets` 是 120 个主 SVG 加 18 个 step state SVG；所有 138 个路径全局唯一。当前资产清单通过对 `find assets/visuals -type f | sort | shasum -a 256` 的逐行输出再计算 SHA-256，得到 `d6d5f29fbc077c241fa3bb5ac0bce15ab656a1a2277b6600c57e0a9fb57a2db4`。

## 人工语义贡献分类（60/30/10）

贡献单元是一项会改变学习者心智模型、工程选择、失败诊断或验收产物的独立教学决定；它不是字数、段落数、引用次数、resource 数或 source slot 的代理指标。每个模块按十个等粒度决策单元复读成稿，并按“主要由谁改变了教学设计”归类；一个 primary 决策仍可能由多个 official source 收紧。

| moduleId | primaryUnits | verificationUnits | otherUnits | primaryShare | verificationShare | otherShare | classification rationale |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `llm-foundation` | 6 | 3 | 1 | 60% | 30% | 10% | 一级资料重排领域地图、上下文边界、版本漂移、结构化输出、评测闭环与模型外控制；论文和官方教材核验训练、Attention、采样；既有 ID、实验和原创图承担兼容。 |
| `agent-mechanism` | 6 | 3 | 1 | 60% | 30% | 10% | 一级资料重排自治边界、任务状态、tool truth、ReAct、编排与上下文投影；原论文和官方协议收紧机制与权限；既有练习、面试和稳定路由作为补充。 |
| `agent-harness` | 6 | 3 | 1 | 60% | 30% | 10% | 一级资料塑造宿主权限、运行轨迹、耐久循环、VFS、offloading 与 handoff；官方运行时、MCP 和安全资料负责验证；既有十态生命周期和三实验保留兼容。 |
| `context-rag-memory` | 6 | 3 | 1 | 60% | 30% | 10% | 一级资料塑造信息对象、预算、压缩、RAG 管线、证据包与记忆治理；论文和官方接口收紧位置效应、检索与引用；既有课程路径和教学实验承担补充。 |
| `backend-engineering` | 6 | 3 | 1 | 60% | 30% | 10% | 一级资料塑造 API、流式状态、容量、异步工作、数据所有权和恢复主线；RFC、数据库、队列和运行平台文档核验具体语义；既有 ID 与确定性实验保持兼容。 |

## 跨模块概念边界复核

| repeated concept | canonical definition | owning module | adjacent-module boundary |
| --- | --- | --- | --- |
| LLM context / Agent working memory / long-term memory | LLM context 是一次调用可见的有限输入；working memory 是 Agent 为当前任务维护并投影的状态；long-term memory 是经过准入、作用域、更新、过期和删除治理的跨会话记录。 | `context-rag-memory` | `llm-foundation` 解释窗口和 token；`agent-mechanism` 只解释当前任务如何使用投影。 |
| Agent loop / Harness durable loop | Agent loop 是 decide–act–observe 的决策结构；durable loop 在宿主侧增加事件、checkpoint、预算、租约、审批、恢复与证据。 | `agent-mechanism` / `agent-harness` | 模型提出动作不等于宿主已执行，也不等于 run 可恢复。 |
| tool definition / execution / MCP | definition 描述候选调用 schema；execution 是宿主鉴权、校验和副作用；MCP 是 client-server 集成协议层，不替代应用授权或执行证明。 | `agent-mechanism` | Harness 管理 registry、capability 和审批；Backend 保存执行与投递事实。 |
| workflow / orchestration / queue worker | workflow 表达已知依赖；orchestration 协调步骤、委派和恢复；queue worker 只租赁并执行已入队工作。 | `agent-mechanism` / `agent-harness` / `backend-engineering` | worker 不是 planner，队列投递语义也不定义 Agent 的任务分解。 |
| checkpoint / transcript summary / memory | checkpoint 是 run 恢复提交点；summary 是可回源但有损的派生文本；memory 是经治理的跨会话记录。 | `agent-harness` / `context-rag-memory` | 三者不能互相替代，尤其不能用摘要伪造耐久状态或删除证明。 |
| model eval / Agent eval / production observability | model eval 检查模型输出能力；Agent eval 检查完整轨迹、工具与终止；observability 记录线上 request/run 的 logs、metrics、traces、versions 与 cost。 | `llm-foundation` / `agent-mechanism` / `backend-engineering` | 同一指标可关联，但不同评测对象和证据层不得合并为单一“准确率”。 |
| retry/idempotency in Agent logic / backend delivery | Agent 逻辑决定是否值得再尝试；幂等与 delivery ledger 证明同一业务意图不会因重放产生额外副作用。 | `agent-harness` / `backend-engineering` | retryable 不等于 safe-to-replay；unknown outcome 必须先查询或 reconcile。 |

复核未发现需要改写稳定 ID 或大范围复制定义的冲突。相邻模块已经在正文中使用责任边界交叉引用；本轮只在此审计冻结 canonical wording，避免为制造“统一”而改变已经通过逐课证据审查的内容。

## 修正、拒绝与时效性主张

- 修正 context 等于 memory、tool call 等于执行证明、checkpoint 等于 exactly-once、检索成功等于 grounded answer、合法 JSON 等于合法动作、retry 提升容量等跨层误推断。
- 拒绝直接复制 Feishu 或 JavaGuide 页面图片。冻结源 inventory 对 Feishu 标记 permission review required，对 JavaGuide 嵌入媒体标记 asset-level review required；这不足以证明具体图片可再发布。
- claim matrix 中 volatile/contested 行全部保留 verificationNeed、limitations、稳定 lesson/section 和 adopted/corrected/deepened/rejected/duplicate 决策；不存在把未解决时效性或争议主张发布成普遍事实的行。
- 当前 120 个主视觉全部是 `original-synthesis`，`permission: null`，credit 为本项目原创教学图解；没有 licensed/official 第三方复用资产，没有 remote media hotlink。18 个 step state 继承父视觉的 owner、sourceIds 和权利决策。

## 稳定身份、进度与共享视觉契约

- module 顺序固定为 `llm-foundation`、`agent-mechanism`、`agent-harness`、`context-rag-memory`、`backend-engineering`；每个模块固定八课，合计 40 个 canonical lesson route。
- lesson、resource、quiz、interview、experiment ID 在五模块中全局唯一；旧 `agent-learner:progress:v1` 记录可同时装载 40 个 lesson ID，并按当前 course 的真实集合汇总。
- 共享 visual index 只聚合五个模块 registry，并在 visual ID 碰撞时抛错。每个 placement 解析到且只解析到一个 visual，每个 visual 只有一个 lesson/section owner；每课最低分别为 LLM 5、Agent 2、Harness 3、Context 3、Backend 2。
- 所有 main/step asset path 与 step state ID 全局唯一；visual sourceIds 同时属于 lesson.resourceIds 与 owner section.sourceIds。非原创来源若未来加入，必须记录 creator、source URL、figure identity、retrieved date、permission basis、再发布和修改授权。

## 自动门禁

本轮工作树的发布前结果：

- `npm test -- --test-reporter=dot` exit 0；随后 TAP 汇总确认 628 tests、628 pass、0 fail、0 skipped/cancelled/todo。
- `find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;`：168 个文件全部 exit 0。
- `find assets/visuals -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout`：138 / 138 exit 0。
- `check:primary-references`、`check:context-visuals`（27 assets + inventory）、`check:agent-visuals`（16 assets）、`check:backend-visuals`（16 assets）全部报告 current。一级资料检查在私有 manifest 存在时重建安全产物；在干净发布克隆中则以 committed safe snapshot、人工 annotation 与 inventory 做闭环一致性验证，不能替代重新抓取上游资料。
- `check:release-content` 用结构化 marker 规则扫描 production course data 与全部 content audit；对应策略测试 2 / 2，通过实际扫描。宽泛匹配所有“未完成”会误报“请求已接纳但处理尚未完成”等领域语义，因此不把原始 `rg` 的语义命中伪装成 authoring debt。
- remote image hotlink 扫描与 SVG `script` / `foreignObject` / DTD / entity / inline handler 扫描均 exit 1 且无输出；secret/token/private-key 模式扫描无输出；`git ls-files .research-cache` 无输出；`git diff --check` exit 0。
- exact inventory 为 5 modules、40 lessons、234 resources、120 main visuals、18 step states、138 local SVG；asset manifest SHA-256 为 `d6d5f29fbc077c241fa3bb5ac0bce15ab656a1a2277b6600c57e0a9fb57a2db4`。

源工作树和提交后的 fresh clone 都执行同一发布门禁；任何失败都回到所属模块修复，不能以本文中的预期替代真实输出。

## 真实浏览器矩阵

使用 `python3 -m http.server 4173 --bind 127.0.0.1` 从仓库根目录启动 no-build server；本轮 PID 70798，URL `http://127.0.0.1:4173/`，启动时 base HEAD 为 `7b6e683134eb50de046707f1ca20895904f5ee5e`，浏览器读取的是包含本集成变更的当前工作树。提交后会重跑精确 HEAD smoke；Production SHA 仍只能由 Vercel 远端证据决定。

真实 Codex in-app Chromium 验收结果：

- 桌面 1280×720 自动遍历 40 / 40 canonical lesson route：hash 与 h1 标题精确一致，每页恰有一个 main h1；40 / 40 substantive knowledge note、40 / 40 exercise、40 / 40 quiz、40 / 40 linked-interview panel 均存在。合计渲染 257 个 source section、1017 个 source link 与 120 个 visual placement；页面级横向 overflow 0，console warning/error 0。
- SVG 使用原生 lazy loading；逐页首屏观察到 47 张已加载、73 张离屏延迟请求，0 张已请求失败。独立顺序 HTTP 探测覆盖 138 / 138 本地 SVG，全部返回 200 与 `image/svg+xml`，所以不把“离屏尚未请求”误报成失败。
- 390px 与 320px 各覆盖 5 个 module dashboard + 40 个 lesson，共 90 / 90 页面。每页核对 h1、document/body width 与所有 main interactive control 的横向边界；page overflow、control clipping 和 trapped horizontal scroll 均为 0。十次 step-lesson viewport 检查覆盖全部五个含分步图的 lesson。320px 抽样截图只用于本轮人工查看、未提交；computed width 为 body 320、main 296、lesson/visual 272。
- 五个 step diagram 在 320px 下完整点按 3 / 4 / 5 / 3 / 3 个状态；每一步 status 顺序正确，末步 Next 禁用，Reset 回到 1/n，并把焦点送到 status。真实 computed focus ring 为 solid 3px、offset 3px、`rgb(8, 125, 114)`。120 / 120 visual 都拥有非空 `details` 长描述，summary 为“查看长描述”。
- 缺图降级使用明确恢复的文件级故障注入：临时移出尚未发布的 `backend-04-overview.svg`，以新 document URL 加载对应课程。该 image 变为 `naturalWidth=0` 且 hidden，fallback 可见，同时 note、17 个 source link、quiz、caption 和 long description 保留；随后立即恢复原文件，并复核 HTTP 200。
- 样式表在真实页面暴露 `(prefers-reduced-motion: reduce)` rule，并对 visual image、controls、step buttons 禁用 animation/transition，同时全局把 motion duration 压到 0.01ms。当前浏览器 OS 偏好为 false，而且此 IAB 只提供 viewport/visibility capability、没有 media emulation，所以不伪称已经切换系统偏好；该分支由 CSS 解析与自动测试覆盖。
- 浏览器的 Playwright/CUA `press` 接口在已聚焦 native button 上没有产生默认 click，无法把这次运行描述成端到端键盘激活；这属于验收后端限制。产品使用原生 `<button>`，自动 UI 测试覆盖 Previous/Next/Reset、disabled、status focus 和实例隔离；真实浏览器已验证鼠标路径、焦点转移与可见 ring。该限制保留给发布负责人在 Preview 做一次物理键盘抽查。

## 部署契约与远端补录字段

Vercel project `agent-development-knowledge-map` 是唯一生产目标；仓库根目录是 no-build 发布目录，`main` 对应 Production，PR/feature branch 对应 Preview。GitHub Pages 必须关闭，仓库不得新增 Pages workflow、`gh-pages` 分支发布脚本或 fallback 文案。

- Preview deployment URL / status / branch SHA：待发布负责人从 Vercel 真实结果补录。
- Production URL / Ready status / deployment SHA / exact `main` SHA：待 merge 后从 Vercel 真实结果补录。
- GitHub Pages API 404（关闭证据）：待发布负责人从 GitHub 真实 API 补录。

## 已知限制

本审计的 60/30/10 是人工语义分类而非定量内容测量；50 个 canonical source 的冻结时间为 2026-07-30，产品、协议和价格等易变行为仍需在后续迭代重新核验。原创 SVG 的静态安全、几何和浏览器检查不能替代真实业务系统的权限、隐私、性能或可靠性验证。
