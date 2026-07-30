# Context Visual Semantics Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic Context visual fixtures/renderers with production-owned typed semantic scenes, independently check generated artifacts, preserve interview compatibility, escape XML safely, and publish a resolvable 6/3/1 decision ledger.

**Architecture:** `context-rag-memory-scenes.js` is the single deeply frozen production authority for scene geometry, semantics, visible labels, step states, and inventory annotations. A reusable renderer module validates typed scenes and serializes safe SVG; both generation scripts expose deterministic render functions plus strict CLI `--check`, compare expected bytes without writing, and write atomically in generation mode. Curriculum data owns the decision ledger and derives audit parity from resolvable lesson/resource/claim references.

**Tech Stack:** Native ESM JavaScript, Node test runner, strict local SVG/XML parser, filesystem atomic rename, Markdown inventory generation.

---

### Task 1: Typed production scenes and semantic SVG rendering

**Files:**
- Create: `src/data/visuals/context-rag-memory-scenes.js`
- Create: `src/data/visuals/context-rag-memory-svg.js`
- Modify: `scripts/generate-context-rag-memory-visuals.mjs`
- Modify: `tests/context-rag-memory-visual-data.test.js`
- Delete: `tests/fixtures/context-rag-memory-visual-fixtures.js`

- [ ] Write failing tests that import 24 production scenes, require deep freezing and typed forms, assert ingestion `chunk -> metadata`, ANN row/column metric bindings, RRF rank arithmetic, admission decision branches, unique SVG IDs, and geometry inside `1200 × 675`.
- [ ] Run `node --test tests/context-rag-memory-visual-data.test.js` and verify failure because production scenes and semantic render exports do not exist.
- [ ] Implement production scenes with explicit `nodes/edges`, `columns/rows/cells`, `series/axes/points`, and `decisions/branches/outcomes`; implement dedicated flow, table, chart, and decision renderers.
- [ ] Run the focused visual test and verify semantic/geometry assertions pass.

### Task 2: Safe deterministic artifact generation and inventory derivation

**Files:**
- Modify: `scripts/generate-context-rag-memory-visuals.mjs`
- Modify: `scripts/generate-context-rag-memory-visual-inventory.mjs`
- Modify: `package.json`
- Create: `tests/context-rag-memory-artifacts.test.js`
- Regenerate: `assets/visuals/context-rag-memory/*.svg`
- Regenerate: `docs/research/2026-07-30-context-rag-memory-visual-inventory.md`

- [ ] Write failing CLI tests for clean `--check`, unknown-argument rejection, tampered SVG/inventory drift reporting, and hostile XML text/attribute escaping.
- [ ] Run `node --test tests/context-rag-memory-artifacts.test.js` and verify failures against the current write-only generators.
- [ ] Implement byte-exact expected artifact maps, non-writing `--check`, atomic temp-file rename, XML escaping and pre-write strict validation; derive inventory only from production scenes/annotations.
- [ ] Add `generate:context-visuals` and `check:context-visuals`, regenerate 27 SVGs and inventory, and verify clean check plus tampering regression.

### Task 3: Interview backward compatibility

**Files:**
- Modify: `tests/context-rag-memory-data.test.js`
- Modify: `src/data/context-rag-memory.js`

- [ ] Write failing tests using the exact prior interview shape without `conceptTags`, a current tagged shape, and invalid non-array/blank tags.
- [ ] Verify the prior shape fails because `spec.conceptTags` is not iterable.
- [ ] Default absent tags to a frozen empty array, defensively copy valid nonblank tags, and throw clear `TypeError` for invalid tags without changing current assessment parity.
- [ ] Run Context data and visual semantic tests.

### Task 4: Structured source-contribution decision ledger

**Files:**
- Modify: `tests/context-rag-memory-primary-references.test.js`
- Modify: `src/data/context-rag-memory.js`
- Modify: `docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md`

- [ ] Write failing tests for exactly 10 deeply frozen records, stable IDs, categories `primary/verification/other`, resolvable lesson/target/resource/claim references, and exact 6/3/1 counts.
- [ ] Verify failure because only editorial prose exists.
- [ ] Add the machine-readable ledger to curriculum data and derive the audit table’s unit/share rows from the ledger contract.
- [ ] Run primary-reference tests and audit parity checks.

### Task 5: Full verification, truthful audit, and commit

**Files:**
- Modify: `docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md`

- [ ] Record RED→GREEN evidence, artifact commands/counts, semantic scene coverage, XML escaping, ledger parity, and browser screenshot limitation without claiming unavailable inspection.
- [ ] Run focused, shared, privacy/progress/UI, artifact, syntax, XML, static-security, marker/hotlink, full regression, range diff, clean status, and local HTTP smoke commands.
- [ ] Review all scene semantics and generated diffs, then commit with no push, PR, merge, or deployment.
