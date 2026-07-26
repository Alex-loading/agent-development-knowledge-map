---
name: build-agent-learner-module
description: Use when turning an Agent Learner planned topic with missing or incomplete sources into a complete new module, or when research, curriculum, knowledge notes, interactive exercises, website integration, and production release must be coordinated from zero.
---

# Build Agent Learner Module

## Core rule

Build the evidence system before publishing the teaching system. Modules 1 and 2 are quality references, not quotas. Let domain complexity and accessible evidence determine lesson, resource, and experiment counts; never change product prerequisites, pad weak sources, or lower release gates to fit a deadline.

## Required skills

- **REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` to settle scope and boundaries before implementation.
- **REQUIRED SUB-SKILL:** Use `superpowers:dispatching-parallel-agents` for independent research streams when subagents are available.
- **REQUIRED SUB-SKILL:** Use `$build-learning-module-notes` for every publishable lesson knowledge note.
- **REQUIRED SUB-SKILL:** Use `superpowers:writing-plans`, `superpowers:test-driven-development`, `superpowers:subagent-driven-development`, and `superpowers:verification-before-completion` for implementation.
- Use `superpowers:using-git-worktrees` when feature work must be isolated from `main`.

Read [research-and-curriculum.md](references/research-and-curriculum.md) before research or curriculum design, [module-contract.md](references/module-contract.md) before writing the specification or code, and [release-gates.md](references/release-gates.md) before integration or release. Start the specification from [module-design-spec-template.md](assets/module-design-spec-template.md).

## Stage-gated workflow

### 0. Recover the real baseline

Read `AGENTS.md`, README extension/deployment rules, module catalog, course registry, existing data tests, and the two completed reference modules. Record current test result, active/planned modules, dependency graph, ID prefixes, routes, shared UI contracts, and deployment provider. Do not copy an older design document's stale deployment instructions over current repository instructions.

### 1. Define capability and boundaries

Write learner entry capability, terminal capability, observable capstone, prerequisites, in-scope/out-of-scope topics, adjacent-module handoffs, and time-sensitive version boundaries. Preserve the product dependency graph. Stop if the requested activation contradicts unmet prerequisites; research may proceed, production activation may not.

### 2. Research in parallel

Create bounded, read-only streams for primary/official evidence, academic/original work, engineering/open-source practice, and Chinese/video learning navigation. A fifth stream may collect interview demand. The main agent owns deduplication, direct-body verification, registry IDs, conflicts, and the final evidence ledger. Subagent summaries are leads, not evidence.

When visuals are in scope, create only a provisional cognitive inventory during research: learner question, factual evidence leads, candidate visual form, and source/permission leads. Start from the question, not an image search. Do not freeze an assessed outcome, owner section, placement, or storyboard before the curriculum exists. Apply the child Skill's source policy before downloading any third-party figure.

### 3. Freeze evidence before curriculum

Produce a claim inventory, source ledger, access-failure list, freshness/version notes, and unresolved evidence gaps. Apply the research gate in the reference. If central assessed claims lack accessible bodies, narrow the module or continue research; do not freeze a polished curriculum around unsupported claims.

### 4. Derive the curriculum

Build a dependency graph from capabilities and claims, then group it into the smallest coherent lesson sequence. Default to the proven eight-lesson shape only when it fits. Create per-lesson outcomes, exercise deliverables, quiz reasoning, interview coverage, source candidates, and next-lesson bridges. Choose experiments only where deterministic interaction materially improves understanding.

After lesson outcomes and real note sections are derived, refine the provisional inventory before storyboarding: freeze the assessed outcome, exact owner section, overview-or-section placement, evidence source IDs, permission decision, and only then the storyboard. Decide visual scope explicitly. Legacy modules may remain text-only until migration, but a module that declares visual completion accepts every child-Skill visual gate as mandatory.

### 5. Approve specification and plan

Write the design specification with research audit, count rationale, boundaries, data ownership, coverage matrix, browser matrix, and release definition. Then write a TDD implementation plan. Keep the module `planned` and unregistered. Use an isolated worktree and capture the clean baseline.

### 6. Implement through independent ownership

Use small tasks in this order: data contract tests; resource/evidence registry; lesson skeleton and assessments; per-lesson knowledge notes; domain core logic; experiment UI; registry integration; documentation. Partition authors by lesson/file. For each task use author → specification reviewer → quality reviewer; return defects to the author and re-review. Shared registries and aggregators have one integration owner.

For visual work, one owner integrates the deeply frozen visual registry and renderer. Note authors own only placements and their evidence-owning sections; visual authors own disjoint assets/records. Write visible-geometry and asset-safety tests, not hidden data proxies. Reject active SVG content, remote hotlinks, broken ownership, and inaccessible fallbacks before browser review.

### 7. Apply the knowledge-note gate

For every lesson, run `$build-learning-module-notes` against the actual lesson, resource bodies, and project registry. Require complete assessment/exercise coverage, valid source IDs, evidence cards, zero broken references, truthful test audit, and score ≥85/100. For declared visual completion, also require exact note placements, one evidence-owning section per visual, resolved registry assets/source IDs/permissions, the six-category visual score, and zero visual blockers. A blocked lesson blocks module activation.

### 8. Integrate and activate last

Run targeted tests first, then full regression. Verify global ID uniqueness, bidirectional references, deep freezing, route safety, module-scoped UI state, old progress compatibility, and no module-specific branching in shared views. Register the course and change `planned` to `active` only after content and implementation gates pass.

### 9. Verify preview and production

Complete desktop/mobile/keyboard/browser checks, including local media scroll, keyboard step controls, reduced motion, long-description/original-source links, unknown-asset fallback, and console state when visuals changed. Review the actual diff, sync current `main`, use one PR, and verify Vercel Preview. After merge, deploy Vercel Production and require `READY`, `target=production`, and its exact Git SHA equal to current `main`; verify canonical routes and confirm GitHub Pages remains disabled. Do not call a push, merge, build start, preview URL, or unmatched production URL a completed deployment.

## Stop and rescope conditions

- A required outcome depends only on metadata, inaccessible media, course fields, or model memory.
- Product prerequisites are unmet or an adjacent module must exist first.
- A lesson fails the note score/reference gate.
- A module declares visual completion while any placement, source, permission, asset safety, accessibility, responsive, fallback, or visual-score gate fails.
- The deadline cannot support source-body review, independent review, tests, and browser verification.
- Full regression, public routes, or exact Vercel SHA verification fails.

Return the completed phase artifacts, precise blocker, and smallest safe next action. Never activate a partial module to appear finished.

## Red flags

- Fixing `8/28/3` before research; using counts as proof of quality.
- Writing lesson prose in source order or before a claim/evidence matrix exists.
- Treating subagent prose, search snippets, titles, stars, or views as verified evidence.
- Letting multiple agents edit one note or registry concurrently.
- Activating in the registry before every lesson note and regression passes.
- Reusing Pages because an old plan mentions it; current production is Vercel only.
