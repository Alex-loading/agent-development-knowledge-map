# Quality Rubric

Score the finished artifact out of 100. Record evidence for each score; do not award points for intentions or unavailable material.

## 1. 目标、测验与面试覆盖（25）

- **22–25:** Every objective, quiz concept, interview short answer/follow-up, exercise step, and completion criterion maps to a substantive section; the chapter teaches the reasoning needed to perform each outcome.
- **16–21:** Objectives and quiz are covered, but one assessed interview nuance, exercise step, or completion criterion is shallow.
- **8–15:** Several outcomes are mentioned but not taught or are disconnected from examples.
- **0–7:** Major objectives or assessed outcomes are absent.

## 2. 知识结构与跨章衔接（20）

- **18–20:** Uses 4–7 coherent sections; moves from prerequisite and intuition to accurate mechanism, engineering meaning, example, misconception, recap, and next lesson without source-by-source listing or repetition.
- **13–17:** Overall progression is usable but one transition, prerequisite, or next-lesson bridge is weak.
- **7–12:** Mostly topical fragments, repeated definitions, or abrupt sections.
- **0–6:** A resource list, glossary dump, or structurally unusable draft.

## 3. 来源与不确定性（25）

- **22–25:** Every substantive section uses source IDs present in both the lesson evidence set and project resource registry; all associated resources have accurate evidence cards; core claims use accessible bodies; conflicts, metadata-only limits, scope, and freshness are visible.
- **16–21:** IDs resolve and major claims are grounded, but a secondary limitation, conflict, or freshness note is incomplete.
- **8–15:** Attribution exists but is coarse, some evidence roles are inflated, or unsupported details remain.
- **0–7:** Broken/untraceable citations, invented course-field resource IDs, unknown/internal provenance mislabeled as `community`, implied reading of unavailable bodies, or model-memory claims presented as sourced facts.

## 4. 教学可读性与例子（20）

- **18–20:** Terms are defined on first use; paragraphs are short and cumulative; at least one concrete worked example exposes a decision; misconceptions receive causal corrections; a learner can study without external links.
- **13–17:** Clear overall, but an example, definition, or misconception correction lacks operational detail.
- **7–12:** Understandable only with substantial prior knowledge or external reading; examples merely decorate definitions.
- **0–6:** Dense, vague, contradictory, or dominated by jargon.

## 5. 版权与数据契约（10）

- **9–10:** Pure contract-valid data; stable unique IDs; no HTML; paraphrases sources; quotations are brief and attributed; required arrays and fields are complete.
- **6–8:** Contract is usable with a minor schema or phrasing correction; no material copyright risk.
- **3–5:** Multiple schema defects, excessive source-shaped prose, or missing required fields.
- **0–2:** HTML/executable content, large copied passages, unusable data shape, or a contract-shaped `knowledgeNote`/`evidence` artifact created in a blocked scenario with fake source IDs.

## Visual teaching score for declared visual completion（60）

Score this separately from the 100-point note score. Record 0–10 for each category; require at least 8 in every category and 51/60 overall. An unmigrated legacy module may mark this score not applicable, but a module declaring visual completion must not.

1. **Accuracy:** visible geometry, labels, quantities, states, arrows, and conclusions match verified facts and deterministic fixtures.
2. **Evidence boundaries:** every visual has one evidence-owning section; its `sourceIds` resolve through the lesson, evidence, and project registries and stay within the owning section.
3. **Teaching value:** the figure answers its recorded cognitive question, supports an assessed outcome, and makes a relationship, sequence, boundary, comparison, or decision materially clearer than prose.
4. **Accessibility:** concise `alt`, non-duplicative caption, complete ordered `longDescription` for complex diagrams, semantic figure structure, and keyboard-safe step controls are available.
5. **Responsive rendering:** the page itself does not overflow at desktop, 390px, or 320px; media uses local horizontal scrolling only when its minimum readable geometry requires it; focus and controls remain visible.
6. **Fallback:** missing/unknown assets preserve prose and expose a useful textual diagnostic or fallback; step diagrams remain understandable without animation and respect reduced motion.

## Release gates

Do not publish when either gate fails, regardless of score:

1. Any `sourceId` is missing from the lesson evidence set or cannot be resolved in the project resource registry. A formal project chapter requires both lookups to succeed.
2. Total score is below **85/100**.

Also block publication when lesson fields were converted into resource evidence, when provenance was guessed to fit the authority enum, or when a blocked isolated draft used invented IDs in formal `knowledgeNote.sections.sourceIds`.

Also block a prose-only or word-count response when accessible core evidence or registry validation is missing. A limitation appended to otherwise polished prose does not satisfy the gate; the artifact must use the blocked contract, preserve `courseFieldBasis`, and report the failed release audit.

Also stop when a key assessed outcome depends only on metadata or unmarked model memory. Report the exact blocked outcome and required evidence before revising.

For a module that declares visual completion, also block publication for any of the following regardless of either score:

- a missing, duplicate, orphan, or broken `visualId`, invalid `afterParagraph`, missing local asset, or visual source outside its owning section;
- missing redistribution permission, missing modification permission for an adaptation, ambiguous provenance, or a downloaded/hotlinked figure whose decision should have been `link-only-original-replacement`;
- active SVG content such as `<script>`, `foreignObject`, event handlers, remote references, external stylesheets, or executable links;
- a complex diagram without a complete long description, keyboard-inaccessible step controls, page-level narrow-screen overflow, absent readable fallback, or reduced-motion failure;
- a false deployment claim, including treating a build, push, preview URL, or unmatched production SHA as a completed release.

## Audit record

Record category scores, total, broken-reference count, coverage gaps, evidence-role corrections, course-field provenance violations, test status, and remaining limitations. When visual completion is declared, also record the six visual scores, visual total, unresolved visual count, permission decisions, SVG safety result, accessibility checks, viewport checks, fallback/reduced-motion result, and exact commands. For a limited task such as outline-only validation, mark non-applicable subcriteria explicitly; if the project registry is unavailable, keep genuine resource IDs as separate candidates, set broken-reference count to unknown/null, and record that resolvability was not tested. Every artifact is defective if it omits the test audit. A project-changing task must record `passed` or `failed` with commands and results even when publication is blocked; `not applicable` requires an exact reason and is reserved for tasks where project tests truly do not apply. These fields remain mandatory under a constrained response shape and may be nested in an explicit coverage audit. Do not infer that tests ran, and do not inflate the result into a publishable chapter score.
