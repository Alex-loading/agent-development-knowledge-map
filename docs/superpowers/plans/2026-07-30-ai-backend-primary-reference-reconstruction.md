# AI Backend Engineering Primary Reference Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 JavaGuide 的 LLM API、结构化输出、评测、AI 系统设计和网关内容重构 AI 后端八课，并用 Harness 101 的 Dynamic Workflow、Tool Truth、AgentFS、版本漂移和 journaled replay 补足运行时可靠性。

**Architecture:** 保持 `backend-01` 至 `backend-08`、路由和进度键。课程数据绑定唯一资源 ID；八个 note 文件持有叙事与 placement；新的 backend visual registry 持有媒体。每课至少两个工程主视觉，时序、队列、状态机与缓存图由 fixture 驱动。

**Tech Stack:** 原生 ES Modules、Node.js test runner、共享 source/visual contracts、静态 SVG、Fake DOM。

---

## File responsibilities

- Modify `src/data/backend-engineering.js`: 来源绑定、evidence、lesson resources 与 assessment。
- Modify `src/data/backend-engineering-notes/backend-01.js` … `backend-08.js`: 八课参考源驱动重构。
- Create `src/data/visuals/backend-engineering-visuals.js`: 后端视觉 registry。
- Create `assets/visuals/backend-engineering/*.svg`: 至少 16 个主视觉与 step states。
- Create `tests/fixtures/backend-engineering-visual-fixtures.js`: 时序、容量、重试、缓存状态真源。
- Create `tests/backend-engineering-primary-references.test.js`: 来源影响与兼容契约。
- Create `tests/backend-engineering-visual-data.test.js`: 视觉契约。
- Create `docs/content-audits/2026-07-30-ai-backend-primary-reference-reconstruction.md`: 内容、来源、版权和验证审计。

### Task 1: Write RED compatibility and source-impact tests

**Files:**
- Create: `tests/backend-engineering-primary-references.test.js`
- Modify: `tests/backend-engineering-data.test.js`
- Test: `tests/progress.test.js`

- [ ] **Step 1: Freeze identity**

Require exactly:

```js
[
  'backend-01', 'backend-02', 'backend-03', 'backend-04',
  'backend-05', 'backend-06', 'backend-07', 'backend-08',
]
```

Assert route and progress compatibility.

- [ ] **Step 2: Require primary sources**

Every lesson needs at least one primary narrative. Both source families must contribute at module scope. Framework/API details, database behavior, delivery semantics and deployment assertions require official documentation in addition to narrative sources.

- [ ] **Step 3: Require contribution audit**

Every lesson must show a material `adopted`, `corrected`, or `deepened` row. Require all section `sourceIds` and lesson `resourceIds` to resolve.

- [ ] **Step 4: Run RED and commit**

```bash
node --test tests/backend-engineering-primary-references.test.js \
  tests/backend-engineering-data.test.js tests/progress.test.js
git add tests/backend-engineering-primary-references.test.js \
  tests/backend-engineering-data.test.js tests/progress.test.js
git commit -m "test: require AI backend reconstruction"
```

### Task 2: Bind AI backend primary references

**Files:**
- Modify: `src/data/backend-engineering.js`

- [ ] **Step 1: Create course-unique bindings**

Import `createPrimaryReferenceBinding`; use IDs beginning `res-backend-primary-`. Bind JavaGuide LLM API, structured output, evaluation, AI system design and AI gateway articles from the frozen registry.

- [ ] **Step 2: Bind Feishu runtime references**

Bind Dynamic Workflow, Version Drifting, Tool Truth, AgentFS, model-outside-the-model, common Claude Code tools, and Install.md. Describe them as concrete runtime patterns, not universal infrastructure requirements.

- [ ] **Step 3: Attach source mapping**

```js
const primarySourcesByLesson = Object.freeze({
  'backend-01': ['javaguide-llm-api', 'javaguide-structured-output', 'tool-truth'],
  'backend-02': ['javaguide-llm-api', 'beyond-model'],
  'backend-03': ['javaguide-ai-gateway', 'beyond-model', 'agentfs'],
  'backend-04': ['javaguide-ai-system-design', 'dynamic-workflow'],
  'backend-05': ['javaguide-ai-system-design', 'company-brain'],
  'backend-06': ['dynamic-workflow', 'version-drifting', 'tool-truth'],
  'backend-07': ['javaguide-evaluation', 'dynamic-workflow', 'install-md'],
  'backend-08': ['javaguide-ai-system-design', 'javaguide-ai-gateway', 'agentfs'],
});
```

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/backend-engineering-primary-references.test.js \
  tests/backend-engineering-data.test.js
git add src/data/backend-engineering.js
git commit -m "feat: bind AI backend primary references"
```

### Task 3: Reconstruct lessons 1–2 around contracts and streaming

**Files:**
- Modify: `src/data/backend-engineering-notes/backend-01.js`
- Modify: `src/data/backend-engineering-notes/backend-02.js`

- [ ] **Step 1: Rewrite `backend-01`**

Define the boundary among client, AI API, model provider, tools and storage. Teach request IDs, model/prompt/tool versions, schema validation, error taxonomy, usage accounting and capability negotiation.

- [ ] **Step 2: Rewrite `backend-02`**

Compare synchronous JSON, SSE and asynchronous polling. Explain first-token latency, event types, buffering, heartbeat, disconnect, cancellation propagation, partial output and resumability boundaries.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/backend-engineering-data.test.js \
  tests/backend-engineering-primary-references.test.js
git add src/data/backend-engineering-notes/backend-01.js \
  src/data/backend-engineering-notes/backend-02.js
git commit -m "feat: reconstruct AI API and streaming lessons"
```

### Task 4: Reconstruct lessons 3–4 around capacity and async work

**Files:**
- Modify: `src/data/backend-engineering-notes/backend-03.js`
- Modify: `src/data/backend-engineering-notes/backend-04.js`

- [ ] **Step 1: Rewrite `backend-03`**

Teach concurrency limits, queue time, deadline propagation, provider rate limits, token budgets, admission control, backpressure and load shedding. Make retry budgets consume the same capacity envelope.

- [ ] **Step 2: Rewrite `backend-04`**

Model job submission, queue, worker lease, checkpoint, progress event, cancellation, dead-letter handling and reconciliation. Use Dynamic Workflow to distinguish replayable control decisions from external side effects.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/backend-engineering-data.test.js \
  tests/backend-engineering-primary-references.test.js
git add src/data/backend-engineering-notes/backend-03.js \
  src/data/backend-engineering-notes/backend-04.js
git commit -m "feat: reconstruct AI capacity and queue lessons"
```

### Task 5: Reconstruct lessons 5–6 around data and delivery semantics

**Files:**
- Modify: `src/data/backend-engineering-notes/backend-05.js`
- Modify: `src/data/backend-engineering-notes/backend-06.js`

- [ ] **Step 1: Rewrite `backend-05`**

Assign PostgreSQL, object storage, vector stores and Redis clear roles. Cover cache key versioning, TTL, invalidation, stampede control, authorization-aware retrieval and why cached model output is not automatically safe to share.

- [ ] **Step 2: Rewrite `backend-06`**

Separate retryable failures, ambiguous outcomes and permanent failures. Teach idempotency keys, outbox/inbox, deduplication, leases, reconciliation and at-least-once delivery. State that “exactly once” is usually an end-to-end business invariant, not a queue toggle.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/backend-engineering-data.test.js \
  tests/backend-engineering-primary-references.test.js
git add src/data/backend-engineering-notes/backend-05.js \
  src/data/backend-engineering-notes/backend-06.js
git commit -m "feat: reconstruct AI data and delivery lessons"
```

### Task 6: Reconstruct lessons 7–8 around operations and deployment

**Files:**
- Modify: `src/data/backend-engineering-notes/backend-07.js`
- Modify: `src/data/backend-engineering-notes/backend-08.js`

- [ ] **Step 1: Rewrite `backend-07`**

Connect startup/shutdown, readiness/liveness, draining, structured logs, traces, metrics, token/cost accounting and evaluation events. Include model/prompt/tool version dimensions without creating unbounded-cardinality metrics.

- [ ] **Step 2: Rewrite `backend-08`**

Build a deployment and failure-diagnosis playbook: stateless API, stateful workers, autoscaling signals, canary/version rollback, migrations, provider failover and regional data boundaries. Diagnose overloaded, slow, wrong and unsafe outputs separately.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/backend-engineering-data.test.js \
  tests/backend-engineering-primary-references.test.js
git add src/data/backend-engineering-notes/backend-07.js \
  src/data/backend-engineering-notes/backend-08.js
git commit -m "feat: reconstruct AI operations and deployment lessons"
```

### Task 7: Add two or more visuals per lesson

**Files:**
- Create: `tests/fixtures/backend-engineering-visual-fixtures.js`
- Create: `tests/backend-engineering-visual-data.test.js`
- Create: `src/data/visuals/backend-engineering-visuals.js`
- Create: `assets/visuals/backend-engineering/*.svg`
- Modify: all eight backend note files

- [ ] **Step 1: Write RED visual tests**

Require at least 16 placements, two per lesson, one overview per lesson, unique IDs, valid local paths, complete accessibility text and valid provenance.

- [ ] **Step 2: Create fixture-backed visual families**

Cover API boundary, SSE lifecycle, concurrency/deadline envelope, queue state, storage/cache roles, idempotent delivery, observability signal flow and deployment diagnosis. Derive capacity, timeout and retry labels from fixtures.

- [ ] **Step 3: Register and place**

Use IDs beginning `visual-backend-XX-`; avoid editing the shared visual index until integration. Prefer original diagrams; reuse third-party media only with asset-level permission evidence.

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/backend-engineering-visual-data.test.js \
  tests/knowledge-visual-ui.test.js tests/backend-engineering-data.test.js
find assets/visuals/backend-engineering -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
git add src/data/visuals/backend-engineering-visuals.js \
  tests/fixtures/backend-engineering-visual-fixtures.js \
  tests/backend-engineering-visual-data.test.js \
  src/data/backend-engineering-notes assets/visuals/backend-engineering
git commit -m "feat: add AI backend learning visuals"
```

### Task 8: Audit and verify the module

- [ ] **Step 1: Score against both rubrics**

Require 4–7 substantive sections, 2–4 short paragraphs per section, note score at least 85/100, visual score at least 51/60 and each visual category at least 8.

- [ ] **Step 2: Write the audit**

Record source impact, official verification, rejected/corrected claims, asset permission, scores, test output and engineering caveats in `docs/content-audits/2026-07-30-ai-backend-primary-reference-reconstruction.md`.

- [ ] **Step 3: Run gates**

```bash
node --test tests/backend-engineering-primary-references.test.js \
  tests/backend-engineering-visual-data.test.js \
  tests/backend-engineering-data.test.js \
  tests/knowledge-notes.test.js tests/knowledge-visual-ui.test.js
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成]' \
  src/data/backend-engineering.js src/data/backend-engineering-notes \
  docs/content-audits/2026-07-30-ai-backend-primary-reference-reconstruction.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add docs/content-audits/2026-07-30-ai-backend-primary-reference-reconstruction.md
git commit -m "docs: audit AI backend reconstruction"
```
