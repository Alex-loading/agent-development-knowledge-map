# LLM Foundation Primary Reference Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 JavaGuide 的 LLM 机制、API、结构化输出和评测内容重整 LLM 基础八课，并用 Harness 101 中版本漂移、提示词/记忆、工具 transcript 的材料连接模型机制与 Agent 工程。

**Architecture:** 保持 `llm-01` 至 `llm-08` 和所有进度键不变。复用并修订现有 52 个 LLM SVG 与 visual registry，不降低每课五个视觉的既有标准；正文继续由八个 note 文件拥有，媒体仍由 registry 管理。

**Tech Stack:** 原生 ES Modules、Node.js test runner、现有 LLM visual fixtures/registry、静态 SVG、Fake DOM。

---

## File responsibilities

- Modify `src/data/llm-foundation.js`: 一级来源绑定、evidence 和 assessment 对齐。
- Modify `src/data/llm-foundation-notes/llm-01.js` … `llm-08.js`: 八课参考源驱动重构。
- Modify `src/data/visuals/llm-foundation-visuals.js`: 修订视觉元数据与来源。
- Modify `assets/visuals/llm-foundation/*.svg`: 修订不准确或叙事不匹配的既有图；保持不少于 52 个资产。
- Modify `tests/fixtures/llm-foundation-visual-fixtures.js`: 只在事实或标签改变时更新。
- Create `tests/llm-foundation-primary-references.test.js`: 来源影响和兼容契约。
- Modify `tests/data.test.js`: LLM 数据与稳定课程契约。
- Modify `tests/llm-foundation-visual-data.test.js`: 保持既有视觉完成标准。
- Create `docs/content-audits/2026-07-30-llm-foundation-primary-reference-reconstruction.md`: 来源、内容、版权与验证审计。

### Task 1: Write RED source and compatibility tests

**Files:**
- Create: `tests/llm-foundation-primary-references.test.js`
- Modify: `tests/data.test.js`
- Test: `tests/progress.test.js`

- [ ] **Step 1: Freeze lesson identity**

Require exactly:

```js
[
  'llm-01', 'llm-02', 'llm-03', 'llm-04',
  'llm-05', 'llm-06', 'llm-07', 'llm-08',
]
```

Assert routes, lesson lookup and stored completion remain compatible.

- [ ] **Step 2: Require primary-reference coverage**

Every lesson must reference at least one primary narrative; JavaGuide must cover the whole module, while Feishu may be concentrated in lessons 3, 6, 7 and 8 where it makes a material contribution. Official or academic sources remain mandatory for equations, model architecture, API behavior and safety claims.

- [ ] **Step 3: Require contribution rows**

Parse the audit, require all eight lesson IDs and allow only `adopted`, `corrected`, `deepened`, `rejected`, `duplicate`.

- [ ] **Step 4: Run RED and commit**

```bash
node --test tests/llm-foundation-primary-references.test.js \
  tests/data.test.js tests/progress.test.js
git add tests/llm-foundation-primary-references.test.js \
  tests/data.test.js tests/progress.test.js
git commit -m "test: require LLM primary source reconstruction"
```

Expected: FAIL on missing primary bindings and audit.

### Task 2: Bind LLM primary references

**Files:**
- Modify: `src/data/llm-foundation.js`

- [ ] **Step 1: Add course-unique bindings**

Import `createPrimaryReferenceBinding`; use IDs beginning `res-llm-primary-`. Bind JavaGuide overview, LLM mechanism, API, structured output and evaluation pages discovered by the frozen inventory.

- [ ] **Step 2: Add selective Feishu bindings**

Bind Version Drifting, prompt/memory structure, Tool Truth, Claude Code tools and model-outside-the-model only where they clarify token context, inference contracts, model/tool boundary or evaluation drift. Mark implementation observations and avoid presenting Claude-specific details as universal LLM behavior.

- [ ] **Step 3: Attach this source map**

```js
const primarySourcesByLesson = Object.freeze({
  'llm-01': ['javaguide-ai-overview', 'javaguide-llm'],
  'llm-02': ['javaguide-llm-mechanism'],
  'llm-03': ['javaguide-llm-mechanism', 'prompt-memory', 'context-offloading'],
  'llm-04': ['javaguide-llm-mechanism'],
  'llm-05': ['javaguide-llm', 'version-drifting'],
  'llm-06': ['javaguide-llm-mechanism', 'version-drifting'],
  'llm-07': ['javaguide-llm-api', 'javaguide-structured-output', 'tool-truth'],
  'llm-08': ['javaguide-evaluation', 'version-drifting', 'beyond-model'],
});
```

Use exact canonical IDs from the source registry and preserve high-authority citations already in the module.

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/llm-foundation-primary-references.test.js \
  tests/data.test.js
git add src/data/llm-foundation.js
git commit -m "feat: bind LLM primary references"
```

### Task 3: Reconstruct lessons 1–2 around model scope and learning

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-01.js`
- Modify: `src/data/llm-foundation-notes/llm-02.js`

- [ ] **Step 1: Rewrite `llm-01`**

Build a stable hierarchy from AI to machine learning, deep learning, foundation models and LLMs. Distinguish model, application and Agent runtime. Explain next-token prediction, capability emergence as an empirical observation, and what is not stored as a literal database of answers.

- [ ] **Step 2: Rewrite `llm-02`**

Teach tensors, layers, activation, loss, gradient descent and backpropagation as one learning loop. Use a small numeric example and explicitly separate training-time parameter updates from inference-time context.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/data.test.js \
  tests/llm-foundation-primary-references.test.js \
  tests/llm-foundation-visual-data.test.js
git add src/data/llm-foundation-notes/llm-01.js \
  src/data/llm-foundation-notes/llm-02.js
git commit -m "feat: reconstruct LLM scope and learning lessons"
```

### Task 4: Reconstruct lessons 3–4 around representation and attention

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-03.js`
- Modify: `src/data/llm-foundation-notes/llm-04.js`

- [ ] **Step 1: Rewrite `llm-03`**

Connect tokenization, IDs, embeddings, positions, context windows and transcript rendering. Explain why token count differs from characters and why context is runtime input rather than durable memory.

- [ ] **Step 2: Rewrite `llm-04`**

Walk through Q/K/V, scaled dot-product attention, causal masking, multi-head attention, residual paths and Transformer blocks. Label simplified diagrams as conceptual and keep equations tied to official/academic sources.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/data.test.js \
  tests/llm-foundation-primary-references.test.js \
  tests/llm-foundation-visual-data.test.js
git add src/data/llm-foundation-notes/llm-03.js \
  src/data/llm-foundation-notes/llm-04.js
git commit -m "feat: reconstruct token and Transformer lessons"
```

### Task 5: Reconstruct lessons 5–6 around training and inference

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-05.js`
- Modify: `src/data/llm-foundation-notes/llm-06.js`

- [ ] **Step 1: Rewrite `llm-05`**

Compare pretraining, supervised fine-tuning, preference optimization and inference-time prompting. Use Version Drifting to explain why model, prompt, tool schema and evaluation set must be versioned separately.

- [ ] **Step 2: Rewrite `llm-06`**

Explain logits, softmax, temperature, top-k/top-p, deterministic limits, autoregressive decoding, KV cache and latency/cost trade-offs. Do not imply a seed guarantees cross-version identity.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/data.test.js \
  tests/llm-foundation-primary-references.test.js \
  tests/llm-foundation-visual-data.test.js
git add src/data/llm-foundation-notes/llm-05.js \
  src/data/llm-foundation-notes/llm-06.js
git commit -m "feat: reconstruct training and inference lessons"
```

### Task 6: Reconstruct lessons 7–8 around contracts, evaluation and safety

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-07.js`
- Modify: `src/data/llm-foundation-notes/llm-08.js`

- [ ] **Step 1: Rewrite `llm-07`**

Separate instruction design, message roles, tool definitions, schema-constrained output, parsing and validation. Explain that well-formed JSON does not guarantee semantically correct data and show retry/repair boundaries.

- [ ] **Step 2: Rewrite `llm-08`**

Build an evaluation stack from dataset and rubric through offline eval, model-graded checks, human review and production monitoring. Cover hallucination, prompt injection, privacy, drift and the boundary between model safety and application controls.

- [ ] **Step 3: Test and commit**

```bash
node --test tests/data.test.js \
  tests/llm-foundation-primary-references.test.js \
  tests/llm-foundation-visual-data.test.js
git add src/data/llm-foundation-notes/llm-07.js \
  src/data/llm-foundation-notes/llm-08.js
git commit -m "feat: reconstruct LLM contracts and evaluation lessons"
```

### Task 7: Revise the existing 52-asset visual system

**Files:**
- Modify: `tests/fixtures/llm-foundation-visual-fixtures.js`
- Modify: `tests/llm-foundation-visual-data.test.js`
- Modify: `src/data/visuals/llm-foundation-visuals.js`
- Modify: `assets/visuals/llm-foundation/*.svg`
- Modify: all eight LLM note files

- [ ] **Step 1: Strengthen RED assertions**

Freeze the current visual ID list before editing. Require every existing visual ID to remain resolvable, all 40 main visuals and 12 step-state assets to remain available, every lesson to retain at least five placements and one overview, and all records to have valid roles/kinds/provenance, complete accessible descriptions, unique IDs, valid local assets and fixture-backed quantitative labels.

- [ ] **Step 2: Review every existing visual**

Create an audit row for keep, revise, replace or remove. Replace only when the existing visual contradicts the new narrative; otherwise revise captions and labels. Any removal must be offset so the per-lesson and total thresholds remain satisfied.

- [ ] **Step 3: Apply the media policy**

Prefer original redraws. Reuse a JavaGuide or Feishu figure only after recording creator, canonical source, figure identity, retrieved date, permission evidence and modifications. A source page license does not automatically license embedded third-party media.

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/llm-foundation-visual-data.test.js \
  tests/knowledge-visual-ui.test.js \
  tests/data.test.js
find assets/visuals/llm-foundation -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
git add src/data/visuals/llm-foundation-visuals.js \
  tests/fixtures/llm-foundation-visual-fixtures.js \
  tests/llm-foundation-visual-data.test.js \
  src/data/llm-foundation-notes assets/visuals/llm-foundation
git commit -m "feat: align LLM visuals with primary references"
```

### Task 8: Audit and verify the module

- [ ] **Step 1: Score content and visuals**

Require note score at least 85/100, visual score at least 51/60 and every visual category at least 8. Confirm every lesson still covers its quiz, interview prompts and exercises.

- [ ] **Step 2: Write the audit**

Record the source-impact matrix, official verification, all 52+ asset decisions, permissions, quality scores and exact test outputs in `docs/content-audits/2026-07-30-llm-foundation-primary-reference-reconstruction.md`.

- [ ] **Step 3: Run module gates**

```bash
node --test tests/llm-foundation-primary-references.test.js \
  tests/llm-foundation-visual-data.test.js \
  tests/data.test.js \
  tests/knowledge-notes.test.js tests/knowledge-visual-ui.test.js
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成]' \
  src/data/llm-foundation.js src/data/llm-foundation-notes \
  docs/content-audits/2026-07-30-llm-foundation-primary-reference-reconstruction.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add docs/content-audits/2026-07-30-llm-foundation-primary-reference-reconstruction.md
git commit -m "docs: audit LLM primary reference reconstruction"
```
