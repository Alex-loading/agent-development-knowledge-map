# Agent Mechanism Primary Reference Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 JavaGuide 的 Agent、Prompt、Context、Memory、Skills、MCP、Workflow 与 Loop 体系重建课程骨架，并以 Harness 101 的 ReAct Loop、Tool Truth、Loop Engineering 和 Orchestration 深化 Agent 内部机制。

**Architecture:** 保持 `agent-01` 至 `agent-08`、路由和进度键。模块数据持有课程内唯一资源绑定，八个 note 文件持有知识叙事和 placement，新的 Agent Mechanism visual registry 持有媒体。每课至少两个高信息密度主视觉。

**Tech Stack:** 原生 ES Modules、Node.js test runner、共享 source/visual contracts、静态 SVG、Fake DOM。

---

## File responsibilities

- Modify `src/data/agent-mechanism.js`: 一级来源、evidence、lesson resources 与 assessment。
- Modify `src/data/agent-mechanism-notes/agent-01.js` … `agent-08.js`: 八课知识重构。
- Create `src/data/visuals/agent-mechanism-visuals.js`: 模块视觉 registry。
- Create `assets/visuals/agent-mechanism/*.svg`: 至少 16 个主视觉与必要 step states。
- Create `tests/fixtures/agent-mechanism-visual-fixtures.js`: loop、规划与重试状态真源。
- Create `tests/agent-mechanism-primary-references.test.js`: 来源影响与兼容性。
- Create `tests/agent-mechanism-visual-data.test.js`: 视觉契约。
- Create `docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md`: 完整审计。

### Task 1: Write RED compatibility and source-impact tests

**Files:**
- Create: `tests/agent-mechanism-primary-references.test.js`
- Modify: `tests/agent-mechanism-data.test.js`
- Test: `tests/progress.test.js`

- [ ] **Step 1: Freeze stable IDs**

Require:

```js
[
  'agent-01', 'agent-02', 'agent-03', 'agent-04',
  'agent-05', 'agent-06', 'agent-07', 'agent-08',
]
```

Assert lesson routes and stored progress still resolve unchanged.

- [ ] **Step 2: Require source-family coverage**

Every lesson must bind a primary narrative; both requested families must be represented at module scope. All current product behavior and protocol details need official verification, while conceptual synthesis may cite the primary narrative plus academic work.

- [ ] **Step 3: Require contribution audit**

Every lesson must have an `adopted`, `corrected`, or `deepened` contribution. Reject unresolved source IDs and contribution values outside the approved five-state vocabulary.

- [ ] **Step 4: Run RED and commit**

```bash
node --test tests/agent-mechanism-primary-references.test.js \
  tests/agent-mechanism-data.test.js tests/progress.test.js
git add tests/agent-mechanism-primary-references.test.js \
  tests/agent-mechanism-data.test.js tests/progress.test.js
git commit -m "test: require Agent mechanism reconstruction"
```

### Task 2: Bind Agent mechanism primary references

**Files:**
- Modify: `src/data/agent-mechanism.js`

- [ ] **Step 1: Create course-owned bindings**

Import `createPrimaryReferenceBinding`; use `res-agent-primary-` IDs. Bind JavaGuide Agent Core, Prompt, Context, Memory, Skills, MCP, Harness, Workflow and Loop articles.

- [ ] **Step 2: Bind the Feishu mechanism set**

Bind ReAct Loop, model-outside-the-model, Loop Engineering basics, ReAct-to-Orchestration, Tool Truth, loop evolution, dynamic workflow and prompt/memory structure. Capture where each article supplies a mental model rather than a universal standard.

- [ ] **Step 3: Attach source mapping**

```js
const primarySourcesByLesson = Object.freeze({
  'agent-01': ['javaguide-agent-core', 'beyond-model', 'react-loop'],
  'agent-02': ['javaguide-prompt', 'react-loop', 'loop-engineering-basics'],
  'agent-03': ['javaguide-skills', 'javaguide-mcp', 'tool-truth'],
  'agent-04': ['javaguide-loop', 'react-loop', 'loop-evolution'],
  'agent-05': ['javaguide-workflow', 'react-orchestration', 'dynamic-workflow'],
  'agent-06': ['javaguide-loop', 'version-drifting', 'dynamic-workflow'],
  'agent-07': ['javaguide-context', 'javaguide-memory', 'prompt-memory'],
  'agent-08': ['javaguide-agent-core', 'react-orchestration', 'beyond-model'],
});
```

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/agent-mechanism-primary-references.test.js \
  tests/agent-mechanism-data.test.js
git add src/data/agent-mechanism.js
git commit -m "feat: bind Agent mechanism primary references"
```

### Task 3: Reconstruct lessons 1–2 around agency and task state

**Files:**
- Modify: `src/data/agent-mechanism-notes/agent-01.js`
- Modify: `src/data/agent-mechanism-notes/agent-02.js`

- [ ] **Step 1: Rewrite `agent-01`**

Define model, LLM application, workflow and Agent by where decisions are made and how state/action/feedback form a loop. Explain autonomy as bounded runtime authority, not a binary label.

- [ ] **Step 2: Rewrite `agent-02`**

Turn user intent into objective, constraints, success criteria, task state and termination conditions. Separate natural-language plan, executable state machine and durable event log.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/agent-mechanism-data.test.js \
  tests/agent-mechanism-primary-references.test.js
git add src/data/agent-mechanism-notes/agent-01.js \
  src/data/agent-mechanism-notes/agent-02.js
git commit -m "feat: reconstruct Agent scope and state lessons"
```

### Task 4: Reconstruct lessons 3–4 around tools and loops

**Files:**
- Modify: `src/data/agent-mechanism-notes/agent-03.js`
- Modify: `src/data/agent-mechanism-notes/agent-04.js`

- [ ] **Step 1: Rewrite `agent-03`**

Explain Tool Definition, schema, discovery, selection, authorization, execution and returned observations. Distinguish Skills as reusable instruction/capability bundles from MCP as an interoperability protocol; verify product-specific claims officially.

- [ ] **Step 2: Rewrite `agent-04`**

Teach ReAct as reason/action/observation structure without exposing private chain-of-thought. Compare single turn, multi-turn, parallel and bounded loops; make continuation and stopping explicit.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/agent-mechanism-data.test.js \
  tests/agent-mechanism-primary-references.test.js
git add src/data/agent-mechanism-notes/agent-03.js \
  src/data/agent-mechanism-notes/agent-04.js
git commit -m "feat: reconstruct Agent tools and loops lessons"
```

### Task 5: Reconstruct lessons 5–6 around planning and correction

**Files:**
- Modify: `src/data/agent-mechanism-notes/agent-05.js`
- Modify: `src/data/agent-mechanism-notes/agent-06.js`

- [ ] **Step 1: Rewrite `agent-05`**

Compare direct action, plan-then-act, dynamic replanning, workflow graphs and orchestration. Show dependency ordering, parallelizable work, delegation boundaries and why planning depth must match uncertainty.

- [ ] **Step 2: Rewrite `agent-06`**

Separate retry, replan, reflection, external validation, reconciliation and human escalation. Reflection is a proposal generator, not proof; durable recovery belongs to the Harness/runtime layer.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/agent-mechanism-data.test.js \
  tests/agent-mechanism-primary-references.test.js
git add src/data/agent-mechanism-notes/agent-05.js \
  src/data/agent-mechanism-notes/agent-06.js
git commit -m "feat: reconstruct Agent planning and recovery lessons"
```

### Task 6: Reconstruct lessons 7–8 around working memory and synthesis

**Files:**
- Modify: `src/data/agent-mechanism-notes/agent-07.js`
- Modify: `src/data/agent-mechanism-notes/agent-08.js`

- [ ] **Step 1: Rewrite `agent-07`**

Separate context window, transcript, scratchpad, plan state, retrieved evidence and long-term memory. Explain budgeting, compaction and offloading while preserving source provenance.

- [ ] **Step 2: Rewrite `agent-08`**

Build one single-Agent design from intent to stop condition. Include a pressure-test matrix covering tool failure, ambiguous success, stale context, unauthorized action, loops, drift and evaluation.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/agent-mechanism-data.test.js \
  tests/agent-mechanism-primary-references.test.js
git add src/data/agent-mechanism-notes/agent-07.js \
  src/data/agent-mechanism-notes/agent-08.js
git commit -m "feat: reconstruct Agent memory and synthesis lessons"
```

### Task 7: Add two or more visuals per lesson

**Files:**
- Create: `tests/fixtures/agent-mechanism-visual-fixtures.js`
- Create: `tests/agent-mechanism-visual-data.test.js`
- Create: `src/data/visuals/agent-mechanism-visuals.js`
- Create: `assets/visuals/agent-mechanism/*.svg`
- Modify: all eight Agent note files

- [ ] **Step 1: Write RED visual tests**

Require at least 16 placements, two per lesson, an overview in each lesson, valid ownership and roles, unique IDs, accessible descriptions, local assets and complete provenance.

- [ ] **Step 2: Create fixtures and original visual families**

Cover Agent/workflow boundary, task state, tool protocol, ReAct loop, planning graph, correction ladder, context layers and end-to-end pressure testing. Use fixtures for loop budgets, dependency graphs and retry state.

- [ ] **Step 3: Register and place**

Use IDs beginning `visual-agent-XX-`; do not edit the shared visual index in this module plan. Third-party figures require asset-level permission evidence; otherwise redraw.

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/agent-mechanism-visual-data.test.js \
  tests/knowledge-visual-ui.test.js tests/agent-mechanism-data.test.js
find assets/visuals/agent-mechanism -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
git add src/data/visuals/agent-mechanism-visuals.js \
  tests/fixtures/agent-mechanism-visual-fixtures.js \
  tests/agent-mechanism-visual-data.test.js \
  src/data/agent-mechanism-notes assets/visuals/agent-mechanism
git commit -m "feat: add Agent mechanism learning visuals"
```

### Task 8: Audit and verify the module

- [ ] **Step 1: Apply content and visual rubrics**

Require 4–7 substantive sections, 2–4 short paragraphs per section, note score at least 85/100, visual score at least 51/60 and each visual category at least 8.

- [ ] **Step 2: Write the audit**

Record source impact, rejected/corrected claims, official verification, media permission, quality scores and exact command output in `docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md`.

- [ ] **Step 3: Run gates**

```bash
node --test tests/agent-mechanism-primary-references.test.js \
  tests/agent-mechanism-visual-data.test.js \
  tests/agent-mechanism-data.test.js \
  tests/knowledge-notes.test.js tests/knowledge-visual-ui.test.js
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成]' \
  src/data/agent-mechanism.js src/data/agent-mechanism-notes \
  docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md
git commit -m "docs: audit Agent mechanism reconstruction"
```
