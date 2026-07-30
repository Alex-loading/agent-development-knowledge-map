# Agent Harness Primary Reference Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用飞书 Harness 101 作为主叙事、JavaGuide 作为系统化交叉参照，深度重构 Agent Harness 八课，并把该模块升级为视觉完成状态。

**Architecture:** 八个 note 文件继续独立拥有正文与 placement；`agent-harness.js` 绑定课程内唯一的一级来源资源；新的 Harness visual registry 拥有媒体元数据，笔记只拥有 placement。每课至少三个主视觉，定量或状态图使用独立 fixture。

**Tech Stack:** 原生 ES Modules、Node.js test runner、共享 visual contract、静态 SVG、Fake DOM。

---

## File responsibilities

- Modify `src/data/agent-harness.js`: 一级参考源资源、evidence、lesson resourceIds、quiz/interview/exercise 更新。
- Modify `src/data/agent-harness-notes/harness-01.js` … `harness-08.js`: 八课重构正文与 visual placements。
- Create `src/data/visuals/agent-harness-visuals.js`: Harness 视觉 registry。
- Create `assets/visuals/agent-harness/*.svg`: 至少 24 个主视觉及必要 step states。
- Create `tests/fixtures/agent-harness-visual-fixtures.js`: 状态、预算、重试、队列和恢复的数值真源。
- Create `tests/agent-harness-primary-references.test.js`: 新来源影响与课程兼容契约。
- Create `tests/agent-harness-visual-data.test.js`: visual registry、fixture 与 placement 契约。
- Create `docs/content-audits/2026-07-30-agent-harness-primary-reference-reconstruction.md`: 来源、覆盖、版权、质量与测试审计。

### Task 1: Write RED compatibility and source-weight tests

**Files:**
- Create: `tests/agent-harness-primary-references.test.js`
- Modify: `tests/agent-harness-data.test.js`

- [ ] **Step 1: Freeze the stable lesson IDs**

```js
const stableHarnessLessonIds = Object.freeze([
  'harness-01', 'harness-02', 'harness-03', 'harness-04',
  'harness-05', 'harness-06', 'harness-07', 'harness-08',
]);

assert.deepEqual(agentHarness.lessons.map(({ id }) => id), stableHarnessLessonIds);
```

- [ ] **Step 2: Require both primary source families at module scope**

```js
const resourcesById = new Map(agentHarness.resources.map((item) => [item.id, item]));
const primaryResources = agentHarness.resources.filter(
  ({ sourceTier }) => sourceTier === 'primary-narrative',
);
assert.ok(primaryResources.some(({ sourceFamily }) => sourceFamily === 'feishu-harness-101'));
assert.ok(primaryResources.some(({ sourceFamily }) => sourceFamily === 'javaguide-ai'));

for (const lesson of agentHarness.lessons) {
  const bound = lesson.resourceIds.map((id) => resourcesById.get(id));
  assert.ok(bound.some(({ sourceTier }) => sourceTier === 'primary-narrative'));
  assert.ok(lesson.knowledgeNote.sections.some(({ sourceIds }) => (
    sourceIds.some((id) => resourcesById.get(id)?.sourceTier === 'primary-narrative')
  )));
}
```

- [ ] **Step 3: Require explicit contribution audit values**

Read the Harness audit table and allow only:

```js
new Set(['adopted', 'corrected', 'deepened', 'rejected', 'duplicate']);
```

Require every lesson to have at least one `adopted`, `corrected`, or `deepened` row.

- [ ] **Step 4: Run RED**

```bash
node --test tests/agent-harness-primary-references.test.js tests/agent-harness-data.test.js
```

Expected: FAIL because the new primary resources and impact audit do not exist.

- [ ] **Step 5: Commit**

```bash
git add tests/agent-harness-primary-references.test.js tests/agent-harness-data.test.js
git commit -m "test: require Harness primary source reconstruction"
```

### Task 2: Bind the Harness primary references

**Files:**
- Modify: `src/data/agent-harness.js`
- Modify: `tests/agent-harness-primary-references.test.js`

- [ ] **Step 1: Import the shared binding factory**

```js
import { createPrimaryReferenceBinding } from './primary-reference-bindings.js';
```

- [ ] **Step 2: Add course-unique Feishu bindings**

Create bindings for all 15 Feishu documents using IDs beginning `res-harness-primary-feishu-`. Use `authority: 'expert'`; use `role: 'core'` only where the body directly supports a central Harness outcome. Every limitations string must distinguish teaching observations from current product guarantees.

- [ ] **Step 3: Add JavaGuide bindings**

Bind the JavaGuide Agent Core, Skills, MCP, Harness, Workflow, Loop, Context and AI System Design articles with IDs beginning `res-harness-primary-javaguide-`.

- [ ] **Step 4: Attach source IDs by lesson**

Use this mapping:

```js
const primarySourcesByLesson = Object.freeze({
  'harness-01': ['react-loop', 'beyond-model', 'javaguide-harness'],
  'harness-02': ['dynamic-workflow', 'version-drifting', 'javaguide-workflow'],
  'harness-03': ['tool-truth', 'claude-tools', 'javaguide-mcp'],
  'harness-04': ['agentfs', 'beyond-model', 'javaguide-harness'],
  'harness-05': ['loop-engineering-basics', 'loop-evolution', 'javaguide-loop'],
  'harness-06': ['dynamic-workflow', 'version-drifting', 'javaguide-workflow'],
  'harness-07': ['react-orchestration', 'loop-engineering-basics', 'javaguide-workflow'],
  'harness-08': ['install-md', 'prompt-memory', 'beyond-model'],
});
```

Resolve each slug to the exact course resource ID; keep existing official and academic evidence in every lesson.

- [ ] **Step 5: Run targeted tests**

```bash
node --test tests/agent-harness-primary-references.test.js tests/agent-harness-data.test.js
```

Expected: source-family assertions pass; note-impact assertions remain RED.

- [ ] **Step 6: Commit**

```bash
git add src/data/agent-harness.js tests/agent-harness-primary-references.test.js
git commit -m "feat: bind Harness primary references"
```

### Task 3: Rewrite lessons 1–2 around control and durable state

**Files:**
- Modify: `src/data/agent-harness-notes/harness-01.js`
- Modify: `src/data/agent-harness-notes/harness-02.js`

- [ ] **Step 1: Rewrite `harness-01`**

Use 5–7 sections covering:

```text
模型提案 vs Harness 执行
单轮/并行/多轮 tool transcript
ReAct Loop 的继续与停止
Plan-then-Act 与 briefing/nudge
control plane、runtime、sandbox 与证据
```

Preserve `harness-01`, teach all existing quiz/interview/exercise outcomes, and bind every section to at least one primary source plus official verification where product behavior is stated.

- [ ] **Step 2: Rewrite `harness-02`**

Use the Dynamic Workflow and Version Drifting materials to deepen event log, checkpoint, replay, prompt/model/tool version boundaries and journaled replay. Keep “durable control flow does not guarantee exactly-once side effects” as an explicit boundary.

- [ ] **Step 3: Run lesson contract probes**

```bash
node --test tests/agent-harness-data.test.js tests/agent-harness-primary-references.test.js
```

Expected: lessons 1–2 pass structure, source resolution and assessment coverage.

- [ ] **Step 4: Commit**

```bash
git add src/data/agent-harness-notes/harness-01.js \
  src/data/agent-harness-notes/harness-02.js
git commit -m "feat: reconstruct Harness control and state lessons"
```

### Task 4: Rewrite lessons 3–4 around tools, permissions and execution surfaces

**Files:**
- Modify: `src/data/agent-harness-notes/harness-03.js`
- Modify: `src/data/agent-harness-notes/harness-04.js`

- [ ] **Step 1: Rewrite `harness-03`**

Teach Tool Definition as a model-facing contract, Tools API history, discovery, decision, execution by Harness, parallel vs sequential calls, approval, authorization and transcript-based tuning.

- [ ] **Step 2: Rewrite `harness-04`**

Use AgentFS and “模型之外的全部” to compare filesystem, Git, Bash, sandbox, VFS provider protocols, session isolation, capability discovery and three execution-stack choices. Preserve official isolation caveats.

- [ ] **Step 3: Run targeted tests**

```bash
node --test tests/agent-harness-data.test.js tests/agent-harness-primary-references.test.js
```

Expected: PASS for lessons 3–4.

- [ ] **Step 4: Commit**

```bash
git add src/data/agent-harness-notes/harness-03.js \
  src/data/agent-harness-notes/harness-04.js
git commit -m "feat: reconstruct Harness tools and execution lessons"
```

### Task 5: Rewrite lessons 5–6 around loops, budgets and recovery

**Files:**
- Modify: `src/data/agent-harness-notes/harness-05.js`
- Modify: `src/data/agent-harness-notes/harness-06.js`

- [ ] **Step 1: Rewrite `harness-05`**

Connect open/closed loops to budget predictability, validation, stopping conditions, timeout, bounded retry, cancellation and long-horizon work. Do not use “open” or “closed” as a reliability ranking.

- [ ] **Step 2: Rewrite `harness-06`**

Use Dynamic Workflow and Version Drifting to teach idempotency, unknown outcomes, reconciliation, checkpoint gaps, journaled replay, model/prompt/tool schema migration and safe resume decisions.

- [ ] **Step 3: Run targeted tests and commit**

```bash
node --test tests/agent-harness-data.test.js tests/agent-harness-primary-references.test.js
git add src/data/agent-harness-notes/harness-05.js \
  src/data/agent-harness-notes/harness-06.js
git commit -m "feat: reconstruct Harness loop and recovery lessons"
```

### Task 6: Rewrite lessons 7–8 around orchestration and long-horizon delivery

**Files:**
- Modify: `src/data/agent-harness-notes/harness-07.js`
- Modify: `src/data/agent-harness-notes/harness-08.js`

- [ ] **Step 1: Rewrite `harness-07`**

Teach workflow, graph, loop, parallel, pipeline, orchestration, human-in-loop, queue/backpressure and the boundary between mechanical control flow and model judgment.

- [ ] **Step 2: Rewrite `harness-08`**

Teach context offloading, progressive disclosure, Skill, Hook, Install.md, artifact manifests, handoff bundles, stop points and long-horizon completion evidence. Bridge explicitly to Context/RAG/Memory.

- [ ] **Step 3: Run targeted tests and commit**

```bash
node --test tests/agent-harness-data.test.js tests/agent-harness-primary-references.test.js
git add src/data/agent-harness-notes/harness-07.js \
  src/data/agent-harness-notes/harness-08.js
git commit -m "feat: reconstruct Harness orchestration lessons"
```

### Task 7: Add the Harness visual inventory and RED visual tests

**Files:**
- Create: `docs/research/2026-07-30-agent-harness-visual-inventory.md`
- Create: `tests/agent-harness-visual-data.test.js`
- Create: `tests/fixtures/agent-harness-visual-fixtures.js`

- [ ] **Step 1: Freeze at least three cognitive visuals per lesson**

For every visual record learner question, assessed outcome, owner section, role, source IDs, permission decision, storyboard and fixture type. Require at least one overview and two mechanism/process/comparison/boundary/decision visuals per lesson.

- [ ] **Step 2: Write RED registry tests**

```js
assert.equal(agentHarnessVisuals.length >= 24, true);
for (const lessonId of stableHarnessLessonIds) {
  const owned = agentHarnessVisuals.filter(({ id }) => id.startsWith(`visual-${lessonId}-`));
  assert.ok(owned.length >= 3, `${lessonId}: requires at least three visuals`);
  assert.equal(owned.filter(({ role }) => role === 'overview').length, 1);
}
```

Also reuse shared assertions for unique IDs, one placement, source containment, local assets, permission and deep freezing.

- [ ] **Step 3: Run RED and commit**

```bash
node --test tests/agent-harness-visual-data.test.js
git add docs/research/2026-07-30-agent-harness-visual-inventory.md \
  tests/agent-harness-visual-data.test.js \
  tests/fixtures/agent-harness-visual-fixtures.js
git commit -m "test: require Harness visual teaching system"
```

Expected: FAIL because registry and assets do not exist.

### Task 8: Implement Harness visuals and placements

**Files:**
- Create: `src/data/visuals/agent-harness-visuals.js`
- Create: `assets/visuals/agent-harness/*.svg`
- Modify: `src/data/agent-harness-notes/harness-01.js` … `harness-08.js`

- [ ] **Step 1: Implement registry records**

Use the existing `visual-contract.js` fields exactly. Prefer `original-synthesis`. JavaGuide figures may use licensed adaptation only when the source inventory proves creator, Apache-2.0 coverage, redistribution, modification and attribution; Feishu images remain original replacements unless explicit permission exists.

- [ ] **Step 2: Build static SVGs**

Every SVG uses:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img">
  <title>可独立理解的标题</title>
  <desc>按阅读顺序描述结构、关系和结论。</desc>
</svg>
```

Do not include scripts, event attributes, remote URLs, external styles or `foreignObject`.

- [ ] **Step 3: Add note placements**

Each lesson sets `overviewVisualId` and `overviewVisualSectionId`; section visuals use zero-based `afterParagraph` values pointing to real paragraphs.

- [ ] **Step 4: Run targeted visual suites**

```bash
node --test tests/agent-harness-visual-data.test.js \
  tests/knowledge-visual-contract.test.js \
  tests/static-svg.test.js
xmllint --noout assets/visuals/agent-harness/*.svg
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/visuals/agent-harness-visuals.js \
  src/data/agent-harness-notes \
  assets/visuals/agent-harness \
  tests/agent-harness-visual-data.test.js \
  tests/fixtures/agent-harness-visual-fixtures.js
git commit -m "feat: add Harness visual teaching system"
```

### Task 9: Audit and verify the Harness slice

**Files:**
- Create: `docs/content-audits/2026-07-30-agent-harness-primary-reference-reconstruction.md`

- [ ] **Step 1: Record coverage and scores**

Record every source contribution, lesson outcome mapping, note rubric score, visual score, broken reference count, permission decision and remaining limitation. Require note score ≥85/100, visual score ≥51/60 and every visual category ≥8.

- [ ] **Step 2: Run the full Harness slice**

```bash
node --test tests/agent-harness*.test.js \
  tests/knowledge-visual-contract.test.js \
  tests/knowledge-visual-ui.test.js \
  tests/static-svg.test.js
npm test
git diff --check
```

Expected: PASS.

- [ ] **Step 3: Browser-check all eight lessons**

At desktop, 390×844 and 320×800 verify one `h1`, overview before TOC, all placements, long descriptions, local figure scrolling, step controls, no page overflow and no console warnings/errors.

- [ ] **Step 4: Commit**

```bash
git add docs/content-audits/2026-07-30-agent-harness-primary-reference-reconstruction.md
git commit -m "test: verify Harness primary reference reconstruction"
```
