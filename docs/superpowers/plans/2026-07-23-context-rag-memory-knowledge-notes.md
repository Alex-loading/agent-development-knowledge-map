# Context、RAG 与记忆知识笔记实施计划

> **执行要求：** 使用 `superpowers:executing-plans`、`superpowers:test-driven-development` 与 `superpowers:subagent-driven-development` 逐项完成；每个课节遵循作者 → 规格审查 → 质量审查，作者负责修复。所有生产代码之前必须先看到对应 RED 失败。

**目标：** 为已 active 的第四模块补齐八篇可独立学习的知识型长文、29 项结构化来源证据卡与发布文档，并保持现有八课、24 道面试题、16 道测验和三个确定性实验不回归，最终通过 PR 和 Vercel 发布。

**架构：** 每课知识笔记放在独立 ES module 中，由冻结的 `context-rag-memory-notes.js` 聚合；课程数据以 `evidenceByResourceId` 给所有资源附加 evidence，再把八个 note 精确连接到对应 lesson。通用 UI 继续消费既有 `knowledgeNote`/`evidence` 协议，不新增模块分支。

**技术栈：** 原生 JavaScript ES Modules、Node `node:test`、自研 fake DOM、静态 HTML/CSS、Git/GitHub、Vercel。

---

## Task 1：建立隔离 worktree 与复验基线

**Files:**
- Verify: `.gitignore`
- Create worktree: `.worktrees/context-rag-memory-knowledge-notes`

**Step 1：确认 worktree 目录被忽略**

Run: `git check-ignore -q .worktrees`
Expected: exit 0。若未忽略，先在主工作区用 `apply_patch` 更新 `.gitignore`，提交后再继续。

**Step 2：创建功能分支 worktree**

Run: `git worktree add .worktrees/context-rag-memory-knowledge-notes -b feat/context-rag-memory-knowledge-notes`
Expected: worktree 基于已确认规格与计划提交。

**Step 3：在 worktree 运行基线**

Run: `npm test`
Expected: 1,542 tests pass，0 fail；若主线在计划提交后有新增测试，以实际总数为准并记录。

## Task 2：用 RED 锁定资源证据契约

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Modify: `tests/data.test.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：写失败测试**

新增断言：

- 资源总数从 28 调整为 29，新增 `res-context-bert-reranker`；
- 29 项资源均有 `authority ∈ official|academic|expert|community`、`role ∈ core|cross-check|extension`、非空 `coverage`、不少于 15 字的 `limitations`；
- 时敏官方/维护者页面使用 `verifiedAt: '2026-07-23'`；
- RAGFlow URL 指向 `https://ragflow.io/docs/v0.26.4/` 范围；
- RRF limitations 明确它是 rank fusion、不是 reranker；BERT 来源承担 reranking；
- Bilibili 为 metadata-only community/extension，YouTube 为 expert/extension；
- 所有公开 evidence 深度冻结；所有资源至少被一课引用。

**Step 2：运行 RED**

Run: `node --test tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: FAIL，原因是现有 28 项资源没有 evidence 且缺 BERT reranking 来源。

**Step 3：最小实现 evidence registry**

在 `context-rag-memory.js` 顶部加入 `evidenceByResourceId`，为每个资源逐项写 `authority`、`role`、`coverage`、`limitations` 和必要 `verifiedAt`；修正 canonical URL/真实视频标题；新增 BERT passage reranking 原始研究，并加入 `context-06.resourceIds`。资源数组映射后再冻结，禁止 evidence 对象遗漏或共享可变引用。

**Step 4：运行 GREEN 与检查**

Run: `node --test tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: PASS。

Run: `node --check src/data/context-rag-memory.js && git diff --check`
Expected: PASS。

**Step 5：提交**

Commit: `feat: add context RAG memory evidence cards`

## Task 3：建立笔记数据契约并完成 context-01

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Modify: `tests/data.test.js`
- Create: `src/data/context-rag-memory-notes/context-01.js`
- Create: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：写 context-01 RED**

加入可复用的 note schema 断言：独立对象、深度冻结、readingMinutes 30–45、5–7 sections、正文长度在本课门槛内、section ID 唯一 kebab-case、每节 2–4 段且每段不少于 60 字、至少两个 keyPoints、至少一个属于当前 lesson evidence set 的 sourceId、4–6 misconceptions、非空 recap/nextStep。先只要求注册表精确包含 `context-01`，并断言课程引用同一对象。

**Step 2：运行 RED**

Run: `node --test --test-name-pattern="context-01|knowledge note registry" tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: FAIL，缺少 note 文件、聚合入口和 lesson 接线。

**Step 3：创作并接线**

作者仅创建 `context-01.js`；主代理创建 aggregator 并在共享课程文件连接 `knowledgeNote`。内容覆盖五类对象、生命周期、projection、位置敏感性、manifest 与 `context-router` 交付；明确五层为课程模型。

**Step 4：规格审查、作者修复、质量审查**

规格审查逐项核对本课 objectives/exercise/completion criteria 与 sourceId 闭包；质量审查关注术语边界、重复、段落推进、过度外推和数据结构。审查者不直接编辑文件。

**Step 5：运行 GREEN 并提交**

Run: `node --test --test-name-pattern="context-01|knowledge note registry" tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: PASS。

Commit: `feat: add context lifecycle knowledge note`

## Task 4：完成 context-02 上下文预算笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-02.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展 RED**

注册表预期扩为 `context-01..02`；为 context-02 设置 30–40 分钟和至少 4,400 字符；断言至少一个章节引用 Anthropic/Lost in the Middle/OpenAI compaction 中的有效 evidence，视频不能成为核心 section source。

**Step 2：运行 RED**

Run: `node --test --test-name-pattern="context-02|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL，缺 context-02。

**Step 3：创作、接线与双审**

覆盖输出预留、required/priority、稳定排序、normal overflow、required overflow、compaction/structured note-taking、多 agent context isolation，以及实验可证明/不可证明的边界。OpenAI compaction 必须写为产品特定的 opaque canonical next window，不得称为可读无损摘要。

**Step 4：运行 GREEN 并提交**

Run: `node --test --test-name-pattern="context-02|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: PASS。

Commit: `feat: add context budgeting knowledge note`

## Task 5：完成 context-03 会话状态笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-03.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

将注册表扩为 `context-01..03`，门槛 32–42 分钟、至少 4,600 字符；要求出现 transcript、canonical state、lossy summary、source mapping、supersession 和 conflict 边界。

Run: `node --test --test-name-pattern="context-03|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

完成含用户纠正、工具失败、旧承诺和不确定项的贯穿案例；明确 canonical state/supersession 是课程应用状态模型，OpenAI compaction 和 LangChain memory 只能作为实现交叉。

**Step 3：运行 GREEN 并提交**

Commit: `feat: add conversation state knowledge note`

## Task 6：完成 context-04 corpus/chunk/index 笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-04.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

注册表扩为 `context-01..04`，门槛 35–45 分钟、至少 4,800 字符；要求 source document、retrieval unit、citation unit、embedding、index、version、permission、validity、span 均进入案例或不变量。

Run: `node --test --test-name-pattern="context-04|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

用 FAQ、手册、制度三类材料讲结构感知切分、overlap、标题继承、回源 span、版本失效和重建；论文中的固定 100-word chunk 只能写为实验设置，OpenAI 当前默认也不可写成通用最佳值。

**Step 3：运行 GREEN 并提交**

Commit: `feat: add retrieval corpus knowledge note`

## Task 7：完成 context-05 检索笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-05.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

注册表扩为 `context-01..05`，门槛 35–45 分钟、至少 5,000 字符；断言核心章节连接 DPR、RRF、BEIR、Anthropic/OpenAI retrieval，而社区教程只作交叉/实作。

Run: `node --test --test-name-pattern="context-05|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

讲清 sparse/dense/hybrid 的互补信号、RRF 公式和尺度独立性、filter/threshold/top-k/rewrite 对候选集合的影响；用 `hybrid-retrieval` trace 区分 not-in-corpus、missed、filtered、ranked-low。任何收益数字都绑定实验设置。

**Step 3：运行 GREEN 并提交**

Commit: `feat: add hybrid retrieval knowledge note`

## Task 8：完成 context-06 证据打包笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-06.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

注册表扩为 `context-01..06`，门槛 38–45 分钟、至少 5,200 字符；要求 BERT reranker、ALCE、RAGAS、OpenAI citation evidence 出现在适当章节；明确 RRF 不得承担 reranker 定义。

Run: `node --test --test-name-pattern="context-06|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

从高召回候选推进到 stronger query-document scoring、版本去重、相邻 span 合并、多样性选择、预算打包和 citation manifest；分别定义 citation presence、correctness/support、completeness 与 answer factuality。RAGAS 只能作为 evaluator-dependent signal。

**Step 3：运行 GREEN 并提交**

Commit: `feat: add evidence packing knowledge note`

## Task 9：完成 context-07 长期记忆笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-07.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

注册表扩为 `context-01..07`，门槛 38–45 分钟、至少 5,200 字符；要求 taxonomy、paging prototype、scenario heuristic、benchmark 和 data-control 证据角色彼此区分。

Run: `node --test --test-name-pattern="context-07|knowledge note registry" tests/context-rag-memory-data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

覆盖 semantic/profile、episodic、procedural 标签，hot-path/background 写入，admission、explicit-save、confidence、scope、provenance、TTL、supersession、delete 和 recall；用实验事件完整走过 reject/store/no-op/supersede/expire/delete。明确外部 store 删除不等于参数反学习，也不自动证明备份擦除或跨租户隔离。

**Step 3：运行 GREEN 并提交**

Commit: `feat: add long term memory knowledge note`

## Task 10：完成 context-08 综合设计笔记

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory-notes/context-08.js`
- Modify: `src/data/context-rag-memory-notes.js`
- Modify: `src/data/context-rag-memory.js`

**Step 1：扩展并运行 RED**

注册表最终要求且只允许 `context-01..08`，门槛 40–45 分钟、至少 5,400 字符；加入所有 note 对象唯一、全部课节接线和全模块 deep-freeze 断言。

Run: `node --test --test-name-pattern="context-08|knowledge note registry|deeply frozen" tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: FAIL。

**Step 2：创作、接线与双审**

以企业政策助理为 capstone，给出每一层输入/输出 ID、版本、排除原因和 owner；沿 source、ingest、chunk、index、retrieve、filter、rerank、pack、memory projection、generate、cite 逐层反证；清楚区分 RAG、fine-tuning、conversation state、checkpoint 与 long-term memory 的适用问题。

**Step 3：运行 GREEN 并提交**

Run: `node --test tests/context-rag-memory-data.test.js tests/data.test.js`
Expected: PASS。

Commit: `feat: add integrated RAG memory knowledge note`

## Task 11：补 UI 与 README 发布契约

**Files:**
- Modify: `tests/guided-ui.test.js`
- Modify: `tests/static-app.test.js`
- Modify: `README.md`

**Step 1：写并运行 RED**

新增首课 `context-01`、中课 `context-04`、末课 `context-08` 的知识笔记 DOM 验证：目录按钮数与 sections 一致、来源链接存在、evidence card 显示 role/limitations、不再显示 fallback 标签。README 测试要求四个模块都以站内知识笔记为主教材，并记录第四模块 note 目录与来源准入边界。

Run: `node --test tests/guided-ui.test.js tests/static-app.test.js`
Expected: FAIL，README 和 Context UI 专项契约尚未更新。

**Step 2：最小文档/UI实现**

通用 UI 若已通过现有协议则不改生产 UI，只更新 README；只有 RED 暴露协议缺陷时才做最小通用修复，禁止新增 `context-rag-memory` 分支。

**Step 3：运行 GREEN 并提交**

Run: `node --test tests/guided-ui.test.js tests/static-app.test.js`
Expected: PASS。

Commit: `docs: publish context RAG memory learning path`

## Task 12：最终审查、回归与本地浏览器验收

**Files:**
- Review: all branch changes

**Step 1：全分支规格审查**

对照已确认设计逐项检查八课、29 资源、证据边界、note schema、来源闭包、弱来源降级、README、无模块硬编码。发现问题由原作者修复，再复审。

**Step 2：质量审查**

检查重复段落、空泛总结、不可执行案例、未定义术语、数字外推、产品文档冒充通用规律、metadata-only 冒充正文，以及共享数据冻结/ID 风险。

**Step 3：定向与全量验证**

Run: `node --test tests/context-rag-memory-data.test.js tests/context-rag-memory.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js tests/ui-interactions.test.js`
Expected: PASS。

Run: `npm test`
Expected: all pass，0 fail。

Run: `node --check src/data/context-rag-memory.js` 以及对九个新增 note/aggregator 逐个 `node --check`。
Expected: PASS。

Run: `git diff --check`
Expected: PASS。

**Step 4：本地浏览器验收**

Run: `npm run serve`
Open: `http://127.0.0.1:4173/#context-rag-memory/lesson/context-01`、`context-04`、`context-08`，以及三个实验入口。
Expected: 桌面、390px、320px 无横向溢出；目录、来源、上一/下一课、测验、实验、重置和进度隔离正常；console 无错误。

**Step 5：提交审查修复**

Commit: `fix: close context module review findings`（仅在存在修复时）。

## Task 13：PR、Vercel Preview、合并与 Production

**Files:**
- Verify: GitHub PR / Vercel deployment metadata

**Step 1：同步 current main**

获取 `origin/main`，将功能分支安全更新到 current main，解决冲突；重新运行受影响定向测试和 `npm test`。

**Step 2：推送并创建 PR**

推送 `feat/context-rag-memory-knowledge-notes`，创建包含设计、测试、来源修复和截图/浏览器结果的 PR。检查 CI 与 Vercel Preview 均针对 branch head SHA。

**Step 3：Preview 验收**

在公开 Preview 重跑 `context-01`、`context-04`、`context-08` 与三个实验的关键路径；确认来源链接、evidence cards、移动布局与 console。

**Step 4：合并与同步 main**

只有 Preview、测试和审查全部通过才合并；主工作区快进到合并后的 `origin/main`，记录 exact merge SHA，再跑 `npm test`。

**Step 5：Vercel Production**

从 exact merge SHA 的干净 Git archive 部署 canonical Vercel 项目 `agent-development-knowledge-map`，避免上传 `.worktrees`。检查 deployment ready、Production alias 和 deployment metadata SHA 一致。

**Step 6：公开生产复验**

在 Production URL 验证首页、第四模块首中末课、三个实验、资源 evidence cards、移动端和 console；同时读取 GitHub Pages 状态并确认旧 Pages 路径未启用/404。

**Step 7：清理与交付**

确认主工作区干净、`main == origin/main == Production SHA`；移除已完成的 worktree（不删除用户分支或未合并数据）；向用户报告 PR、合并 SHA、Production URL、测试总数和 Pages 状态。
