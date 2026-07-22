# Agent Harness 全模块知识笔记实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` task-by-task. Every lesson also uses `.agents/skills/build-learning-module-notes/`. Authoring, specification review, and quality review are separate turns.

**Goal:** 把 Agent Harness 八课升级为来源可追溯、站内可独立学习的知识笔记，并完成测试、浏览器验收、PR 合并与 Vercel Production 精确 SHA 验证。

**Architecture:** 八课各自使用纯数据文件，`agent-harness-notes.js` 负责聚合与递归冻结，`agent-harness.js` 负责真实课程与 28 份资源的 evidence/knowledgeNote 接线。通用 renderer 保持不变；写作期间线上继续使用 `explanations` fallback，最终一次性接入八课。

**Tech Stack:** 原生 ES Modules、Node.js test runner、Fake DOM、Vercel、项目 Skills `build-agent-learner-module` 与 `build-learning-module-notes`。

## 文件职责

- `src/data/agent-harness-notes/harness-01.js` … `harness-08.js`：单课纯数据知识笔记。
- `src/data/agent-harness-notes.js`：八课 import、精确 ID 映射和递归冻结。
- `src/data/agent-harness.js`：evidence cards、lesson `knowledgeNote` 接线和课程导出。
- `tests/agent-harness-data.test.js`：Harness 课程、来源卡、知识笔记、引用与冻结契约。
- `tests/data.test.js`：跨模块 fallback 与全局数据回归。
- `tests/guided-ui.test.js`：通用知识笔记、目录、来源卡与安全外链。
- `tests/static-app.test.js`：README 发布声明与架构路径。
- `docs/content-audits/2026-07-23-agent-harness-knowledge-notes.md`：来源访问表、覆盖矩阵、质量分与验证记录。
- `README.md`：前三模块的主教材状态，以及 Context/RAG/Memory fallback。

## 全程规则

- 课程字段是覆盖输入，不是来源证据；主代理必须复核真实正文。
- OpenAI 产品语义使用 `openai-docs`；普通官方网页使用浏览工具；仓库材料读取原始文件。视频无可访问字幕或等价正文时只能是 metadata-only `extension`。
- 每课先建立 `outcome → section → evidence → deliverable` 矩阵，再写正文。
- 每课依次执行作者自审、独立规格审查、独立质量审查；修复后重新审查。
- 单课质量至少 85/100，最终 `brokenReferenceCount === 0`。
- 单课作者只编辑自己的 note 文件；共享 registry、聚合入口、测试、README 和审计由主代理集成。

### Task 1：核验 28 份来源并冻结 evidence ledger

**Files:**
- Create: `docs/content-audits/2026-07-23-agent-harness-knowledge-notes.md`
- Modify later: `src/data/agent-harness.js`

- [ ] 导出 28 项资源及逐课引用关系，确认所有 ID 唯一且至少被一课使用。
- [ ] 三个只读研究流核验实际正文：运行状态与恢复；权限与隔离；可靠性、队列与交接。
- [ ] 主代理逐项复核正文入口、canonical URL、访问类型、版本/日期、coverage 与 limitations。
- [ ] 对 OpenAI 条目使用官方文档 Skill；对 Bilibili/抖音确认字幕或 metadata-only 状态。
- [ ] 建立 28 行访问表和逐课 assessed-outcome coverage matrix。
- [ ] 若核心 outcome 缺证据，先建立书面 amendment；不得开始相应课程写作。
- [ ] 将合法 evidence card 写入 `agent-harness.js`，但暂不接入 knowledgeNote。
- [ ] 提交：`docs: audit Agent Harness learning sources`。

### Task 2：建立完整发布契约的 RED 测试

**Files:**
- Modify: `tests/agent-harness-data.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/guided-ui.test.js`
- Modify: `tests/static-app.test.js`

- [ ] 在 Harness 数据测试中声明逐课阅读时间与最低正文长度。
- [ ] 先引用尚不存在的 `agentHarnessNotes`，断言八个精确 key、对象 identity、5–7 sections、2–4 paragraphs、kebab-case ID、keyPoints、sourceIds、4–6 misconceptions、至少 5 recap、长度与递归冻结。
- [ ] 断言所有章节来源同时属于资源 registry、当前 lesson 和有效 evidence set，断裂引用为 0。
- [ ] 断言 28 张 evidence card 的 enum、coverage、limitations、日期和 metadata-only 视频边界。
- [ ] 将跨模块 fallback 收窄为 Context/RAG/Memory；在 UI 测试中要求 Harness 第一、中间和末课渲染知识笔记与来源卡。
- [ ] README 测试要求前三模块使用站内长文主教材，并列出 Harness 笔记目录与聚合入口。
- [ ] 运行目标测试，确认只因缺少 notes/接线/README 声明而失败。
- [ ] 提交：`test: require Agent Harness knowledge notes`。

### Task 3：撰写 `harness-01` Harness 与宿主 Runner

**Files:** Create `src/data/agent-harness-notes/harness-01.js`

- [ ] 覆盖职责边界、run/attempt/step/session、规范状态机、终态不可逆、hook 契约、资源清理和 Run Lifecycle Reducer。
- [ ] 写 30–35 分钟、至少 4200 字符、5–7 章节、4–6 误区、至少 5 回顾的 `harness01Note`。
- [ ] 状态词汇完整包含 `created/queued/running/awaiting_approval/retry_wait/blocked/succeeded/failed/cancelled/timed_out`，不得混入 `completed/paused` 作为规范状态。
- [ ] 运行语法与单课 contract probe；完成规格审查与 ≥85 质量审查。
- [ ] 提交：`feat: add Harness runner knowledge note`。

### Task 4：撰写 `harness-02` State、Event Log 与 Checkpoint

**Files:** Create `src/data/agent-harness-notes/harness-02.js`

- [ ] 覆盖 state projection、append-only fact、checkpoint、ordinary log、事件顺序/去重、恢复与 replay、版本兼容和 lease/revalidation。
- [ ] 写 35–40 分钟、至少 4800 字符的 `harness02Note`，把崩溃恢复练习逐步映射到章节。
- [ ] 不把 LangGraph、Temporal 或 Azure 的具体实现写成跨框架标准，也不暗示持久工作流保证外部副作用 exactly-once。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness persistence knowledge note`。

### Task 5：撰写 `harness-03` 工具、权限与人工审批

**Files:** Create `src/data/agent-harness-notes/harness-03.js`

- [ ] 覆盖 registry、authentication、authorization、capability、逐调用 approval、持久中断、resume token 与 TOCTOU 重校验。
- [ ] 写 35–40 分钟、至少 4800 字符的 `harness03Note`，用读文件、发信、退款三类工具给出最小权限和审批记录设计。
- [ ] 明确 approval 不是授权的替代物；审批后参数、权限和环境变化必须重新验证。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness tool governance knowledge note`。

### Task 6：撰写 `harness-04` Sandbox 与资源边界

**Files:** Create `src/data/agent-harness-notes/harness-04.js`

- [ ] 覆盖进程、容器、用户态内核、microVM 边界，filesystem/network/secret、seccomp/rootless、CPU/memory/pids/disk/time 配额和生命周期清理。
- [ ] 写 35–45 分钟、至少 5000 字符的 `harness04Note`，给出代码执行环境审计与收紧清单。
- [ ] 不把普通容器、单个 seccomp profile、rootless、gVisor 或 microVM 描述为绝对安全。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness sandbox knowledge note`。

### Task 7：撰写 `harness-05` Budget、Timeout、Retry 与 Cancel

**Files:** Create `src/data/agent-harness-notes/harness-05.js`

- [ ] 覆盖 run/attempt/step/tool/token/cost/wall-time 预算、attempt timeout、run deadline、协作式取消、错误分类、有限重试、backoff/jitter 与级联失败。
- [ ] 写 35–40 分钟、至少 4800 字符的 `harness05Note`，为模型、只读查询和写操作给出差异化策略。
- [ ] 明确“错误可重试”不等于“动作可安全重放”，厂商文章是工程经验而非普适定律。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness budget and retry knowledge note`。

### Task 8：撰写 `harness-06` 幂等副作用与安全 Resume

**Files:** Create `src/data/agent-harness-notes/harness-06.js`

- [ ] 覆盖调用意图、idempotency key、dedupe record、远端成功但响应/checkpoint 丢失、unknown outcome、reconciliation 和 `skip/retry/reconcile/manual/fail`。
- [ ] 写 40–45 分钟、至少 5200 字符的 `harness06Note`，逐一解释 Retry/Resume Simulator 的崩溃点和证据组合。
- [ ] 不宣称通用 exactly-once；写入动作只有在幂等语义、远端证据和预算满足时才可重试。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness safe resume knowledge note`。

### Task 9：撰写 `harness-07` 并发、队列与背压

**Files:** Create `src/data/agent-harness-notes/harness-07.js`

- [ ] 覆盖 concurrency/parallelism、producer、bounded queue、worker、lease/ack、FIFO 边界、取消、admission control、backpressure 与 load shedding。
- [ ] 写 35–40 分钟、至少 4800 字符的 `harness07Note`，把 Queue Lab 的到达率、worker、服务能力、容量和策略映射为可解释结果。
- [ ] 不把教学模拟描述成真实分布式调度器，也不承诺单一队列策略适合所有负载。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness queue knowledge note`。

### Task 10：撰写 `harness-08` HITL、Handoff 与运行产物

**Files:** Create `src/data/agent-harness-notes/harness-08.js`

- [ ] 覆盖 blocked/failed/cancelled/awaiting approval、长暂停、审批记录、resume token、handoff bundle、artifact manifest、版本/敏感性和最终综合轨迹。
- [ ] 写 35–45 分钟、至少 5000 字符的 `harness08Note`，完成退款审批轨迹和交接包模板。
- [ ] 视频无字幕时不得进入关键章节 sourceIds；课程/仓库只作学习导航或实现示例。
- [ ] `nextStep` 连接 Context/RAG/Memory 和后续可观测性边界。
- [ ] 运行 probe；完成双审和 ≥85 分。
- [ ] 提交：`feat: add Harness handoff knowledge note`。

### Task 11：聚合、接线、README 与最终内容审计

**Files:**
- Create: `src/data/agent-harness-notes.js`
- Modify: `src/data/agent-harness.js`
- Modify: `README.md`
- Modify: `docs/content-audits/2026-07-23-agent-harness-knowledge-notes.md`
- Modify: target tests from Task 2

- [ ] 创建八课精确 registry，并复用项目递归冻结模式。
- [ ] 把八课 note 一次性接入对应 lesson；确保对象 identity 与深层冻结。
- [ ] 更新 README：前三模块为站内主教材，Context/RAG/Memory 仍为 fallback；部署仍只走 Vercel。
- [ ] 完成跨课术语、重复、边界、相邻衔接、sourceIds 和 evidence 全局审查。
- [ ] 在内容审计中记录逐课质量分、覆盖矩阵、断链计数和已知限制。
- [ ] 运行四个目标测试文件直至全绿。
- [ ] 提交：`feat: publish Agent Harness knowledge notes`。

### Task 12：全量验证、PR 与 Vercel 发布

- [ ] 运行 `npm test`，要求新增测试和既有 1275 项全部通过。
- [ ] 运行 `find src tests -name '*.js' -print0 | xargs -0 -n1 node --check`。
- [ ] 运行 `git diff --check` 和 `git status --short --branch`。
- [ ] 浏览器验收桌面、390px、320px：八课目录与来源、首/中/末课、三个实验、quiz、资源、面试、进度、键盘、焦点、无横向溢出、控制台无错误。
- [ ] 同步最新 `main` 并解决冲突；重跑完整验证。
- [ ] 推送功能分支并创建一个 PR；检查 Vercel Preview。
- [ ] 合并后验证 Vercel Production 为 Ready、公开 Harness 路由可访问、部署 Git SHA 精确匹配 `main`。
- [ ] 确认 GitHub Pages 仍关闭。
