# Context, RAG & Memory Primary Reference Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 JavaGuide 的 Context、Memory、RAG 体系为知识骨架，以 Harness 101 的 Company Brain、Context Offloading、压缩、AgentFS 与提示词记忆结构补足工程机制，深度重构 Context、RAG 与 Memory 八课。

**Architecture:** 保持 `context-01` 至 `context-08`、路由和进度键不变。模块数据只绑定课程内唯一 resource ID；八个 note 文件拥有叙事与 visual placements；独立 visual registry 拥有媒体元数据。每课至少三个教学主视觉，检索评分、预算和衰减图由 fixture 驱动。

**Tech Stack:** 原生 ES Modules、Node.js test runner、共享 primary-reference/visual contracts、静态 SVG、Fake DOM。

---

## File responsibilities

- Modify `src/data/context-rag-memory.js`: 一级来源、evidence、资源绑定和评测任务。
- Modify `src/data/context-rag-memory-notes/context-01.js` … `context-08.js`: 八课正文与 visual placements。
- Create `src/data/visuals/context-rag-memory-visuals.js`: 模块视觉 registry。
- Create `assets/visuals/context-rag-memory/*.svg`: 至少 24 个主视觉及必要 step states。
- Create `tests/fixtures/context-rag-memory-visual-fixtures.js`: 预算、检索、排序、记忆衰减的数值真源。
- Create `tests/context-rag-memory-primary-references.test.js`: 来源影响、ID 和进度兼容契约。
- Create `tests/context-rag-memory-visual-data.test.js`: 视觉、fixture 与 placement 契约。
- Create `docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md`: 来源、主张、版权、质量与验证审计。

### Task 1: Write RED compatibility and source-impact tests

**Files:**
- Create: `tests/context-rag-memory-primary-references.test.js`
- Modify: `tests/context-rag-memory-data.test.js`

- [ ] **Step 1: Freeze stable IDs**

Assert the lesson sequence is exactly:

```js
[
  'context-01', 'context-02', 'context-03', 'context-04',
  'context-05', 'context-06', 'context-07', 'context-08',
]
```

Also assert existing route resolution and persisted completion values still resolve to the same lessons.

- [ ] **Step 2: Require both primary source families**

Every lesson must bind at least one `primary-narrative` resource. At module scope require both `feishu-harness-101` and `javaguide-ai`; for volatile API or product claims require a separate official verification source.

- [ ] **Step 3: Require contribution tracking**

Parse the module audit and accept only `adopted`, `corrected`, `deepened`, `rejected`, or `duplicate`. Require every lesson to contain at least one material contribution and every substantive note section to resolve all `sourceIds`.

- [ ] **Step 4: Run RED and commit**

```bash
node --test tests/context-rag-memory-primary-references.test.js \
  tests/context-rag-memory-data.test.js \
  tests/progress.test.js
git add tests/context-rag-memory-primary-references.test.js \
  tests/context-rag-memory-data.test.js tests/progress.test.js
git commit -m "test: require context RAG memory reconstruction"
```

Expected: FAIL because primary bindings and impact rows do not exist.

### Task 2: Bind the primary references

**Files:**
- Modify: `src/data/context-rag-memory.js`

- [ ] **Step 1: Import `createPrimaryReferenceBinding`**

Create course-unique resource IDs beginning `res-context-primary-`; never reuse IDs owned by another module.

- [ ] **Step 2: Bind the JavaGuide backbone**

Bind the current JavaGuide articles for Agent Context, Agent Memory, RAG Basics, Document Processing, Vector Index/Database, Hybrid Retrieval, Reranking/Optimization, Update Strategy and GraphRAG. Copy canonical IDs from `primary-references.js`; do not hard-code a second source registry.

- [ ] **Step 3: Bind the Feishu mechanisms**

Bind Company Brain, Context Offloading, Claude Code context compaction, AgentFS, prompt/memory structure, model-outside-the-model, and tool transcript articles. Mark them `authority: 'expert'` and state where observations are implementation-specific.

- [ ] **Step 4: Attach the lesson mapping**

```js
const primarySourcesByLesson = Object.freeze({
  'context-01': ['javaguide-context', 'context-offloading', 'prompt-memory'],
  'context-02': ['javaguide-context', 'context-offloading', 'context-compaction'],
  'context-03': ['context-compaction', 'prompt-memory', 'javaguide-memory'],
  'context-04': ['javaguide-rag', 'javaguide-document-processing', 'company-brain'],
  'context-05': ['javaguide-vector-index', 'javaguide-vector-database', 'javaguide-rag-optimization'],
  'context-06': ['javaguide-rag-optimization', 'javaguide-rag', 'tool-truth'],
  'context-07': ['javaguide-memory', 'company-brain', 'agentfs'],
  'context-08': ['javaguide-graphrag', 'javaguide-rag-update', 'company-brain'],
});
```

Resolve slugs to exact canonical IDs discovered by source freeze. Preserve useful official and academic sources.

- [ ] **Step 5: Verify and commit**

```bash
node --test tests/context-rag-memory-primary-references.test.js \
  tests/context-rag-memory-data.test.js
git add src/data/context-rag-memory.js
git commit -m "feat: bind context RAG memory primary references"
```

### Task 3: Reconstruct lessons 1–2 around context lifecycle and budgets

**Files:**
- Modify: `src/data/context-rag-memory-notes/context-01.js`
- Modify: `src/data/context-rag-memory-notes/context-02.js`

- [ ] **Step 1: Rewrite `context-01`**

Use 5–7 sections to distinguish training knowledge, runtime context, transcript, working state, external memory and durable corpus. Explain the read/write lifecycle, provenance and why “put everything in the prompt” is not context engineering.

- [ ] **Step 2: Rewrite `context-02`**

Turn the Feishu offloading and compaction material into an explicit token-budget model: fixed instructions, recent turns, tool results, retrieved evidence, scratch state and reserve. Compare selection, compression, offloading and reset; cover lost-detail and prompt-injection risks.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/context-rag-memory-data.test.js \
  tests/context-rag-memory-primary-references.test.js
git add src/data/context-rag-memory-notes/context-01.js \
  src/data/context-rag-memory-notes/context-02.js
git commit -m "feat: reconstruct context lifecycle lessons"
```

### Task 4: Reconstruct lessons 3–4 around transcript and corpus

**Files:**
- Modify: `src/data/context-rag-memory-notes/context-03.js`
- Modify: `src/data/context-rag-memory-notes/context-04.js`

- [ ] **Step 1: Rewrite `context-03`**

Explain conversation state versus rendered transcript, canonical events, summary checkpoints, micro-compaction, tool-result elision and recoverability. State that a summary is a lossy derived view, not the source of truth.

- [ ] **Step 2: Rewrite `context-04`**

Build the ingestion chain from source acquisition through parsing, normalization, chunking, metadata, embedding and indexing. Compare structural, semantic, fixed and parent-child chunks; include document versioning, access control and deletion propagation.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/context-rag-memory-data.test.js \
  tests/context-rag-memory-primary-references.test.js
git add src/data/context-rag-memory-notes/context-03.js \
  src/data/context-rag-memory-notes/context-04.js
git commit -m "feat: reconstruct transcript and corpus lessons"
```

### Task 5: Reconstruct lessons 5–6 around retrieval and evidence packing

**Files:**
- Modify: `src/data/context-rag-memory-notes/context-05.js`
- Modify: `src/data/context-rag-memory-notes/context-06.js`

- [ ] **Step 1: Rewrite `context-05`**

Teach sparse, dense and hybrid retrieval as complementary signals. Cover filters, ANN recall/latency, score calibration, reciprocal-rank fusion and query rewriting. Avoid presenting a vector database as the whole RAG system.

- [ ] **Step 2: Rewrite `context-06`**

Teach reranking, deduplication, diversity, parent recovery, evidence budget, citation IDs and provenance-preserving packaging. Include failure cases where retrieval succeeded but generation lacks grounded evidence.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/context-rag-memory-data.test.js \
  tests/context-rag-memory-primary-references.test.js
git add src/data/context-rag-memory-notes/context-05.js \
  src/data/context-rag-memory-notes/context-06.js
git commit -m "feat: reconstruct retrieval and evidence lessons"
```

### Task 6: Reconstruct lessons 7–8 around memory and system diagnosis

**Files:**
- Modify: `src/data/context-rag-memory-notes/context-07.js`
- Modify: `src/data/context-rag-memory-notes/context-08.js`

- [ ] **Step 1: Rewrite `context-07`**

Separate episodic, semantic, procedural and user-profile memory. Explain write admission, conflict resolution, salience, recall, decay, deletion, privacy and evaluation. Contrast memory with transcript and corpus.

- [ ] **Step 2: Rewrite `context-08`**

Combine context, RAG and memory into one decision flow. Add GraphRAG and corpus-update boundaries only where useful. Diagnose failures by ingestion, retrieval, reranking, packing, generation, memory write and freshness layers.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/context-rag-memory-data.test.js \
  tests/context-rag-memory-primary-references.test.js
git add src/data/context-rag-memory-notes/context-07.js \
  src/data/context-rag-memory-notes/context-08.js
git commit -m "feat: reconstruct memory and diagnosis lessons"
```

### Task 7: Add at least three visuals per lesson

**Files:**
- Create: `tests/fixtures/context-rag-memory-visual-fixtures.js`
- Create: `tests/context-rag-memory-visual-data.test.js`
- Create: `src/data/visuals/context-rag-memory-visuals.js`
- Create: `assets/visuals/context-rag-memory/*.svg`
- Modify: all eight context note files

- [ ] **Step 1: Write RED visual tests**

Require at least 24 owned placements, at least three per lesson, one `overview` placement per lesson, globally unique visual/placement IDs, valid local paths, descriptive alt/caption/longDescription, and source permission metadata for every reused figure.

- [ ] **Step 2: Freeze fixture truth**

Create fixtures for token-budget allocation, compaction loss, sparse/dense fusion, reranking, memory decay and retrieval latency. Tests must recompute labels and percentages from fixtures.

- [ ] **Step 3: Draw original diagrams first**

Create lifecycle, budget, transcript/checkpoint, ingestion, retrieval, evidence packing, memory and diagnosis families. Use `original-synthesis` unless an asset has explicit reusable permission; record third-party media decisions in the audit.

- [ ] **Step 4: Register and place visuals**

Use IDs beginning `visual-context-XX-`; keep registry ownership separate from placements. Do not edit `src/data/visuals/index.js` here because the integration plan owns that shared file.

- [ ] **Step 5: Verify and commit**

```bash
node --test tests/context-rag-memory-visual-data.test.js \
  tests/knowledge-visual-ui.test.js \
  tests/context-rag-memory-data.test.js
find assets/visuals/context-rag-memory -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
git add src/data/visuals/context-rag-memory-visuals.js \
  tests/fixtures/context-rag-memory-visual-fixtures.js \
  tests/context-rag-memory-visual-data.test.js \
  src/data/context-rag-memory-notes assets/visuals/context-rag-memory
git commit -m "feat: add context RAG memory learning visuals"
```

### Task 8: Audit and verify the module

- [ ] **Step 1: Score every lesson**

Apply `chapter-standard.md` and `quality-rubric.md`: 4–7 substantive sections, 2–4 short paragraphs per section, note score at least 85/100, visual score at least 51/60 and at least 8 in every visual category.

- [ ] **Step 2: Complete the audit**

Record source contribution, corrections, unresolved volatility, per-asset permission, lesson scores, commands and exit codes in `docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md`.

- [ ] **Step 3: Run module gates**

```bash
node --test tests/context-rag-memory-primary-references.test.js \
  tests/context-rag-memory-visual-data.test.js \
  tests/context-rag-memory-data.test.js \
  tests/knowledge-notes.test.js \
  tests/knowledge-visual-ui.test.js
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成]' \
  src/data/context-rag-memory.js src/data/context-rag-memory-notes \
  docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md
git diff --check
```

Expected: tests pass, content scan has no matches, diff check has no output.

- [ ] **Step 4: Commit**

```bash
git add docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md
git commit -m "docs: audit context RAG memory reconstruction"
```
