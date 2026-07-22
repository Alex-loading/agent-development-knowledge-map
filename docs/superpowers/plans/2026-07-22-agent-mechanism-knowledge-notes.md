# Agent 机制全模块知识笔记实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Agent 机制八课升级为来源可追溯、站内可独立学习的知识笔记，并完成测试、浏览器验收、PR 合并与公开部署。

**Architecture:** 每课使用一个纯数据文件，`agent-mechanism-notes.js` 只做八课聚合与递归冻结，`agent-mechanism.js` 负责真实课程和资源 registry 接线。通用 renderer 保持不变；28 份来源卡嵌入 `resource.evidence`，章节引用必须同时解析到全局 registry、当前 lesson 和有效 evidence。

**Tech Stack:** 原生 ES Modules、Node.js test runner、Fake DOM、GitHub Pages、项目 `.agents/skills/build-learning-module-notes/`。

---

## 文件职责

- `src/data/agent-mechanism-notes/agent-01.js` … `agent-08.js`：单课纯数据知识笔记。
- `src/data/agent-mechanism-notes.js`：八课 import、ID 映射和递归冻结。
- `src/data/agent-mechanism.js`：28 份资源 evidence、lesson `knowledgeNote` 接线和课程导出。
- `tests/agent-mechanism-data.test.js`：Agent 课程、来源卡、知识笔记和冻结契约。
- `tests/data.test.js`：跨模块 fallback 与全局数据回归。
- `tests/guided-ui.test.js`：通用知识笔记渲染、目录焦点和安全外链。
- `tests/static-app.test.js`：README 发布声明与架构路径。
- `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`：来源访问、覆盖矩阵、质量量表和验证记录。
- `README.md`：前两个模块的主教材状态与后两个模块 fallback。

## 全程规则

- 每个写作任务必须先读目标 lesson 的全部课程字段、关联面试题和关联资源，再使用 `build-learning-module-notes` Skill。
- OpenAI 产品语义使用 `openai-docs`；论文/PDF 使用 `pdf:pdf`；普通官方网页使用浏览工具。视频无可访问字幕或等价正文时只能作为 `extension`。
- 每项任务先由作者自审，再由独立规格审查者检查覆盖和 contract，最后由独立质量审查者按 100 分量表评分。规格问题修复并复审通过后才能开始质量审查。
- 单课质量至少 85；最终要求 `brokenReferenceCount === 0`。作者只编辑自己的 note 文件和审计中的该课覆盖区，聚合与共享 registry 由集成任务处理。

### Task 1: 建立完整发布契约的 RED 测试

**Files:**
- Modify: `tests/agent-mechanism-data.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/guided-ui.test.js`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1: 在 Agent 数据测试中声明逐课期望**

加入以下常量和最终 registry 断言，测试先引用尚未创建的 `agentMechanismNotes`：

```js
const agentNoteExpectations = new Map([
  ['agent-01', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['agent-02', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['agent-03', { minMinutes: 30, maxMinutes: 40, minLength: 4500 }],
  ['agent-04', { minMinutes: 30, maxMinutes: 40, minLength: 4500 }],
  ['agent-05', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['agent-06', { minMinutes: 35, maxMinutes: 40, minLength: 4800 }],
  ['agent-07', { minMinutes: 30, maxMinutes: 35, minLength: 4200 }],
  ['agent-08', { minMinutes: 35, maxMinutes: 40, minLength: 5000 }],
]);
```

断言应复用 LLM 正式 contract：8 个精确 key、对象身份、5–7 sections、kebab-case ID、2–4 段且每段至少 60 字、至少两个 keyPoints、sourceIds 双重解析、4–6 misconceptions、至少 5 个 recap、逐课阅读量/长度和深层冻结。另增加 28/28 evidence card 的 enum、coverage、limitations 与 `verifiedAt` 合法性断言。

- [ ] **Step 2: 把跨模块 fallback 收窄为 Harness 与 Context**

```js
for (const course of [agentHarness, contextRagMemory]) {
  for (const lesson of course.lessons) {
    assert.equal(lesson.knowledgeNote, undefined);
    assert.ok(lesson.explanations.length >= 2);
  }
}
```

- [ ] **Step 3: 把 UI 契约改为 Agent 知识笔记**

为 `agent-02` 和 `agent-08` 增加 `.knowledge-note`、目录项数量、安全外链、`继续深挖`、role/limitations、无 `.data-diagnostic` 的断言；把 `agent-01` legacy 断言改为 Harness/Context fallback。

- [ ] **Step 4: 写 README 的 RED 断言**

要求 README 明确“LLM 基础与 Agent 机制八课均以站内知识笔记为主教材”，fallback 只列 Agent Harness 和上下文/RAG/记忆，并列出 `src/data/agent-mechanism-notes/` 与聚合入口。

- [ ] **Step 5: 运行并确认 RED**

Run: `node --test tests/agent-mechanism-data.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js`

Expected: FAIL，失败原因必须是缺少 `agentMechanismNotes`、Agent `knowledgeNote`、evidence 或新 README 声明，而不是语法错误或无关回归。

- [ ] **Step 6: 提交 RED 契约**

```bash
git add tests/agent-mechanism-data.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js
git commit -m "test: require Agent mechanism knowledge notes"
```

### Task 2: 核验 28 份来源并建立 evidence registry

**Files:**
- Modify: `src/data/agent-mechanism.js`
- Create: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 导出真实资源与 lesson 使用关系**

Run:

```bash
node --input-type=module -e "import('./src/data/agent-mechanism.js').then(({agentMechanism:c})=>console.log(JSON.stringify(c.resources.map(r=>({id:r.id,title:r.title,url:r.url,lessons:c.lessons.filter(l=>l.resourceIds.includes(r.id)).map(l=>l.id)})),null,2)))"
```

Expected: 28 个唯一资源，所有 ID 至少被一课引用。

- [ ] **Step 2: 逐正文建立来源访问表**

审计表每项必须记录 `id`、访问类型 `body | metadata | equivalent`、实际访问入口、核验日期、authority、role、coverage、limitations。论文读原文/PDF；OpenAI function calling 读当前官方文档；无字幕视频记录 metadata 限制。不得从现有 `value` 反推正文。

- [ ] **Step 3: 在 registry 中加入 28 张 evidence card**

每个资源使用以下真实结构，具体字段必须来自 Step 2 的访问结果：

```js
evidence: {
  authority: 'official',
  role: 'core',
  coverage: ['实际正文覆盖的机制或学习产出'],
  limitations: '明确说明未覆盖、版本、实验设定或迁移边界',
  verifiedAt: '2026-07-22',
}
```

视频若无正文必须使用 `role: 'extension'`，coverage 只能描述已验证元数据允许的导航用途；论文 `authority: 'academic'`，但 limitations 必须保留评测条件；厂商文章不得写成普适保证。

- [ ] **Step 4: 更新旧统一日期契约**

将 `tests/agent-mechanism-data.test.js` 中“所有资源都等于 2026-07-20”的断言替换为真实允许日期集合和不晚于审计日的检查。只有重新访问正文的资源才更新语义核验日期。

- [ ] **Step 5: 运行来源卡测试**

Run: `node --test tests/agent-mechanism-data.test.js --test-name-pattern="resources|evidence|references"`

Expected: evidence、资源数量、双向引用和日期测试 PASS；完整知识笔记测试仍保持预期 RED。

- [ ] **Step 6: 提交来源审计**

```bash
git add src/data/agent-mechanism.js tests/agent-mechanism-data.test.js docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md
git commit -m "docs: audit Agent mechanism learning sources"
```

### Task 3: 撰写 `agent-01` 控制权与最小闭环

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-01.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 建立覆盖矩阵**

把两个 objectives、五个 concepts、两道 quiz、`iq-agent-01-1..3` 的短答/深挖/追问、三案例 exercise 和两个 completion criteria 映射到 6 个章节：控制权连续谱、最小闭环、动作空间与环境、终止证据、选型门槛、三案例决策表。

- [ ] **Step 2: 写先失败的单课校验**

Run: `node --input-type=module -e "import('./src/data/agent-mechanism-notes/agent-01.js')"`

Expected: FAIL，模块尚不存在。

- [ ] **Step 3: 完成 25–30 分钟、至少 3600 字符的笔记**

导出 `agent01Note`，包含 5–7 sections、4–6 misconceptions、至少 5 recap 和连接 task contract 的 `nextStep`。案例必须对固定摘要、审批流、开放调查分别给出普通调用/Workflow/Agent 选择及完成、阻塞、预算出口。

- [ ] **Step 4: 运行语法与 contract probe**

Run: `node --check src/data/agent-mechanism-notes/agent-01.js`

Expected: PASS；审查器确认章节来源只使用 `agent-01.resourceIds`。

- [ ] **Step 5: 提交、规格审查、质量审查**

Commit: `feat: add Agent selection knowledge note`。规格审查必须零遗漏；质量分至少 85 后才完成本任务。

### Task 4: 撰写 `agent-02` 任务契约与完成证据

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-02.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 覆盖所有考核结果**

6 个章节依次教授：请求到 task contract、硬约束/软偏好、事实/假设/未知项、工作状态与 transcript、完成谓词与证据、上海差旅 contract。完整覆盖 `iq-agent-02-1..3` 及追问。

- [ ] **Step 2: RED、实现与验证**

先运行不存在模块的 import 并确认失败；再导出 25–30 分钟、至少 3600 字符的 `agent02Note`。上海案例必须逐项选择查询、澄清、可撤销假设或 blocked，不能把猜测写成事实。

Run: `node --check src/data/agent-mechanism-notes/agent-02.js`

Expected: PASS，sourceIds 全部属于本课四个资源。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add task contract knowledge note`。质量分至少 85。

### Task 5: 撰写 `agent-03` 工具协议与宿主边界

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-03.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 建立生命周期覆盖**

7 个章节覆盖：工具声明、模型产生调用、语法/schema 校验、业务/权限/风险校验、宿主执行、结构化结果与调用关联、订单工具契约实验。明确 Toolformer 训练研究与当前 function calling API 不是同一层。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 30–40 分钟、至少 4500 字符的 `agent03Note`。订单查询/取消案例必须给出合法、缺参、非法枚举、额外字段和需审批五种结果，并说明幂等与副作用边界。

Run: `node --check src/data/agent-mechanism-notes/agent-03.js`

Expected: PASS；OpenAI 接口语义带 2026-07-22 核验边界；教学检查器不被描述成真实模型评测。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add tool calling knowledge note`。质量分至少 85。

### Task 6: 撰写 `agent-04` 控制循环与 ReAct

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-04.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 建立循环因果链**

6–7 个章节覆盖状态读取、终止优先级、decide、校验/act、observe、状态更新、进展检测与 ReAct 边界。显式区分可观察决策摘要与模型隐藏推理。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 30–40 分钟、至少 4500 字符的 `agent04Note`。伪代码必须包含 `done / blocked / failed / budget-exhausted / handoff`，并解释重复动作指纹。

Run: `node --check src/data/agent-mechanism-notes/agent-04.js`

Expected: PASS；ReAct 论文结论保留其评测设定，循环面板只描述确定性终止优先级。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add Agent loop knowledge note`。质量分至少 85。

### Task 7: 撰写 `agent-05` 规划、分解与重规划

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-05.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 建立策略比较框架**

7 个章节覆盖 reactive、plan-and-execute、可验证分解、Plan-and-Solve、ReWOO、Tree of Thoughts 的搜索成本、基于 observation 的重规划，以及供应商研究棋盘。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 30–40 分钟、至少 4800 字符的 `agent05Note`。三种策略都必须写动作、产物、依赖、验证点和预算；空结果、超时、新约束分别产生有理由的恢复动作。

Run: `node --check src/data/agent-mechanism-notes/agent-05.js`

Expected: PASS；任何论文结果不被外推为“规划必然更好”。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add planning and replanning knowledge note`。质量分至少 85。

### Task 8: 撰写 `agent-06` 失败恢复与外部验证

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-06.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 把失败类型映射到动作**

7 个章节覆盖传输、参数、业务、语义、权限、能力失败；重试预算与幂等；blocked/handoff；Reflexion、Self-Refine；无外部反馈自纠错的反证；CRITIC 与独立验证；工单恢复决策表。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 35–40 分钟、至少 4800 字符的 `agent06Note`。每类错误必须有可观察信号、副作用风险、预算和出口；反思必须依赖可校准反馈，不能承诺自评必然改进。

Run: `node --check src/data/agent-mechanism-notes/agent-06.js`

Expected: PASS；六篇论文的结论保留实验边界并呈现相互张力。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add Agent recovery knowledge note`。质量分至少 85。

### Task 9: 撰写 `agent-07` 上下文与工作记忆

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-07.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 建立信息载体分层**

6 个章节覆盖 transcript、event log、working state、working memory、本轮 context、artifact pointer，以及 fact/belief/observation 冲突。明确本课不展开长期记忆和 RAG。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 30–35 分钟、至少 4200 字符的 `agent07Note`。二十轮压缩案例必须产出事件索引、状态快照、下一轮上下文和回取指针，并保留硬约束、来源、预算和未决失败。

Run: `node --check src/data/agent-mechanism-notes/agent-07.js`

Expected: PASS；CoALA 分类只作为概念架构，不被描述为实现标准。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add Agent working memory knowledge note`。质量分至少 85。

### Task 10: 撰写 `agent-08` 单 Agent 综合设计

**Files:**
- Create: `src/data/agent-mechanism-notes/agent-08.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 汇总前七课为端到端设计**

7 个章节覆盖 task contract、状态 schema、只读工具 schema、控制状态机、恢复与终止、成功/澄清/阻塞三类轨迹、框架价值与 Harness/RAG/MCP/多 Agent 边界。

- [ ] **Step 2: RED、实现与验证**

先确认 import 失败，再导出 35–40 分钟、至少 5000 字符的 `agent08Note`。只读仓库诊断案例不得执行写操作；AgentBench、τ-bench 只能说明其基准中的长轨迹和规则交互观察；抖音条目保持 metadata-only extension。

Run: `node --check src/data/agent-mechanism-notes/agent-08.js`

Expected: PASS；`nextStep` 连接 Agent Harness 的耐久执行、权限、检查点与追踪。

- [ ] **Step 3: 提交并完成双重审查**

Commit: `feat: add single Agent capstone knowledge note`。质量分至少 85。

### Task 11: 聚合、接线、README 与最终内容审计

**Files:**
- Create: `src/data/agent-mechanism-notes.js`
- Modify: `src/data/agent-mechanism.js`
- Modify: `README.md`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`
- Modify: `tests/agent-mechanism-data.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/guided-ui.test.js`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1: 创建聚合入口**

```js
import { agent01Note } from './agent-mechanism-notes/agent-01.js';
import { agent02Note } from './agent-mechanism-notes/agent-02.js';
import { agent03Note } from './agent-mechanism-notes/agent-03.js';
import { agent04Note } from './agent-mechanism-notes/agent-04.js';
import { agent05Note } from './agent-mechanism-notes/agent-05.js';
import { agent06Note } from './agent-mechanism-notes/agent-06.js';
import { agent07Note } from './agent-mechanism-notes/agent-07.js';
import { agent08Note } from './agent-mechanism-notes/agent-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export const agentMechanismNotes = deepFreeze({
  'agent-01': agent01Note,
  'agent-02': agent02Note,
  'agent-03': agent03Note,
  'agent-04': agent04Note,
  'agent-05': agent05Note,
  'agent-06': agent06Note,
  'agent-07': agent07Note,
  'agent-08': agent08Note,
});
```

- [ ] **Step 2: 为八课连接同一 note 对象**

在 `agent-mechanism.js` 顶部导入聚合器，每个 lesson 在 `summary` 后加入：

```js
knowledgeNote: agentMechanismNotes['agent-01'],
```

八课 key 分别对应自身 ID，不复制对象。

- [ ] **Step 3: 完成审计矩阵与量表**

审计必须包含 8 张 outcome→section 覆盖矩阵、28 份来源访问表、每课五类分数、总分、broken refs、证据角色修正、剩余限制和测试表。若某课低于 85 或有 gap，返回原作者修复并重新双审，不能在集成阶段降低断言。

- [ ] **Step 4: 更新 README**

声明 LLM 基础和 Agent 机制均以八课站内知识笔记为主教材；外部资料是依据、交叉核验和扩展；Agent Harness 与 Context 继续 fallback。增加 Agent note 目录与聚合入口，并保留原生 ES Modules、无构建步骤和通用 renderer 描述。

- [ ] **Step 5: 运行 focused GREEN**

Run: `node --test tests/agent-mechanism-data.test.js tests/data.test.js tests/guided-ui.test.js tests/static-app.test.js`

Expected: 所有测试 PASS，Agent 八课 contract、28 evidence、旧模块 fallback 和 README 声明均为 GREEN。

- [ ] **Step 6: 运行完整 GREEN**

Run: `npm test`

Expected: 0 failed。

- [ ] **Step 7: 提交集成**

```bash
git add src/data/agent-mechanism-notes.js src/data/agent-mechanism.js src/data/agent-mechanism-notes README.md tests docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md
git commit -m "feat: complete Agent mechanism knowledge notes"
```

### Task 12: 跨课复审、浏览器验收与发布

**Files:**
- Review and revise on findings: `src/data/agent-mechanism-notes/agent-01.js` … `agent-08.js`
- Modify: `docs/content-audits/2026-07-22-agent-mechanism-knowledge-notes.md`

- [ ] **Step 1: 独立最终规格审查**

逐项核对设计范围、八课考核覆盖、28 份来源、实验边界、相邻课程衔接、Harness/Context fallback、README 和所有发布门槛。任何遗漏返回对应作者修正并复审。

- [ ] **Step 2: 独立最终质量审查**

检查重复定义、术语漂移、论文外推、厂商语义泛化、metadata-only 冒充正文、课程字段伪来源、篇幅与可读性。要求每课至少 85 且 broken refs 为 0。

- [ ] **Step 3: 运行发布前自动化**

```bash
npm test
find src tests -name '*.js' -print0 | xargs -0 -n1 node --check
git diff --check
git status --short
```

Expected: 测试 0 failed、语法 0 error、diff 无空白错误、工作树仅含预期审计更新或完全干净。

- [ ] **Step 4: 本地真实浏览器验收**

启动 `npm run serve`。桌面逐页打开 `#agent-mechanism/lesson/agent-01` 至 `agent-08`，验证导语、5–7 项目录、正文、逐节依据、误区、回顾、下一步、`继续深挖` 和无 `.data-diagnostic`；点击目录后对应 H2 获得焦点。390×844 抽查 `agent-03`、`agent-05`、`agent-08`，要求无横向溢出和长链接溢出。运行三个现有实验；抽查 Harness 与 Context fallback；控制台无 error。

- [ ] **Step 5: 同步主线并创建 PR**

```bash
git fetch origin
git rebase origin/main
git push -u origin feat/agent-mechanism-knowledge-notes
```

创建非草稿 PR，标题 `feat: complete Agent mechanism knowledge notes`，正文列出 8 篇笔记、28 张 evidence、测试和浏览器结果。

- [ ] **Step 6: 合并并等待 Pages**

确认 PR `MERGEABLE/CLEAN`，合并到 `main`。轮询 `repos/Alex-loading/agent-development-knowledge-map/pages/builds/latest`，直到 `status === 'built'` 且 `commit` 等于本次 merge commit。

- [ ] **Step 7: 公网验收**

在 `https://alex-loading.github.io/agent-development-knowledge-map/` 逐页打开 `agent-01` 至 `agent-08`，核对标题、目录、误区、回顾、下一步和无诊断；打开 Harness/Context fallback；控制台无 error。最后将本地 `main` 快进到同一 merge commit，并重新运行正式测试。
