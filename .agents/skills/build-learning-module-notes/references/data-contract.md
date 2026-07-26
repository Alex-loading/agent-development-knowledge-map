# Learning Note Data Contract

Return pure JavaScript-compatible data. Do not return HTML strings, DOM nodes, Markdown embedded as HTML, or executable callbacks.

## Formal publishable contract

Use this shape only when each `sourceId` is a genuine project resource ID present in both the lesson evidence map and project registry, with attributable provenance and accessible supporting material.

```js
const learningArtifact = {
  knowledgeNote: {
    readingMinutes: 25,
    overviewVisualId: 'visual-example-overview',
    overviewVisualSectionId: 'stable-section-id',
    introduction: '章节导语',
    sections: [{
      id: 'stable-section-id',
      title: '章节标题',
      paragraphs: ['段落一', '段落二'],
      visuals: [{
        visualId: 'visual-example-mechanism',
        afterParagraph: 0,
      }],
      keyPoints: ['要点一', '要点二'],
      callout: { kind: 'intuition', title: '提示标题', body: '提示正文' },
      sourceIds: ['res-example'],
    }],
    misconceptions: [{ claim: '错误理解', correction: '准确解释' }],
    recap: ['回顾要点'],
    nextStep: '与下一课的连接',
  },
  evidence: {
    'res-example': {
      authority: 'official',
      role: 'core',
      coverage: ['覆盖主题'],
      limitations: '该资料不能证明或未覆盖的边界',
    },
  },
  tests: {
    status: 'passed',
    commands: ['npm test'],
    results: [{ command: 'npm test', exitCode: 0, summary: '全部测试通过' }],
  },
};
```

## Field rules

### `knowledgeNote`

- `readingMinutes`: integer estimated from the finished chapter; use 20–30 for the standard full chapter unless the task explicitly requests a smaller artifact.
- `introduction`: non-empty Chinese string that states the chapter problem, prerequisite bridge, and expected outcome.
- `overviewVisualId`: optional only while a legacy module has not declared visual completion. When present, it is a stable visual registry ID placed after the introduction and before the table of contents.
- `overviewVisualSectionId`: required with `overviewVisualId`; identifies the real section that owns the overview visual's evidence. The overview visual's `sourceIds` must be a subset of this section's source IDs.
- `sections`: array of 4–7 substantive section objects in teaching order.
  - `id`: stable, unique, lowercase kebab-case identifier; do not derive it from array position.
  - `title`: non-empty Chinese heading.
  - `paragraphs`: array of 2–4 non-empty plain-text paragraphs.
  - `visuals`: optional only before visual completion is declared. Each placement contains exactly `visualId` and `afterParagraph`; `visualId` resolves through the shared registry, and `afterParagraph` is a zero-based integer that points to an existing paragraph in this owning section.
  - `keyPoints`: array of concise, non-duplicative recall points.
  - `callout`: optional object. When present, require `kind`, `title`, and `body`; keep all values plain text. Common `kind` values include `intuition`, `example`, `boundary`, and `warning`.
  - `sourceIds`: non-empty, de-duplicated array of resource IDs. For a formal project chapter, every ID must be present in both the lesson's `evidence` map and the project resource registry. In an isolated or outline-only task without a registry, retain proposed IDs only as candidates outside publishable `knowledgeNote.sections`.
- `misconceptions`: array of objects pairing a plausible `claim` with a substantive `correction`.
- `recap`: non-empty array that recalls the causal structure and decisions, not a list of section titles.
- `nextStep`: non-empty Chinese string connecting current knowledge to the next lesson.

## Visual registry contract

Keep visual records in one shared, deeply frozen registry. Notes own placement and evidence; registry records own media metadata. Every published visual has exactly one placement and no orphan registry entry.

```js
const visual = {
  id: 'visual-example-mechanism',
  kind: 'diagram',
  role: 'mechanism',
  title: '视觉标题',
  alt: '简短替代文本',
  longDescription: '按阅读顺序描述结构、关系、状态和结论。',
  caption: '图注与证据边界。',
  assetPath: 'assets/visuals/example/example-mechanism.svg',
  width: 1200,
  height: 675,
  provenance: 'original-synthesis',
  sourceIds: ['res-example'],
  credit: 'Agent Learner 原创教学图解',
  permission: null,
  verifiedAt: '2026-07-27',
};
```

Required placement and registry fields are:

```text
overviewVisualId
overviewVisualSectionId
sections[*].visuals[*].visualId
sections[*].visuals[*].afterParagraph
kind / role / provenance
alt / longDescription / caption
sourceIds / permission / modifications
```

Use the following exact field matrix.

### Common to every registry visual

- `id`: required stable kebab-case ID beginning with `visual-`.
- `kind`: required project allowlist value: `diagram`, `source-figure`, or `step-diagram`; never an arbitrary executable renderer name.
- `role`: required project teaching-role allowlist value and one primary cognitive job.
- `title`, `alt`, `longDescription`, `caption`: all required non-empty plain text. `alt` gives a concise replacement and main conclusion; `longDescription` describes the complete reading order, relationships, states, and conclusion; `caption` gives the visible interpretation and evidence boundary without duplicating `alt`.
- `assetPath`: required safe local media path under `assets/visuals/`. Remote URLs, data URLs, traversal, executable content, and hotlinks are invalid.
- `width` and `height`: required positive integers describing the main asset's intrinsic geometry.
- `provenance`: required allowlist value: `original-synthesis`, `licensed-reproduction`, `licensed-adaptation`, or `official-media`.
- `sourceIds`: required non-empty array of unique project resource IDs. Every ID resolves through the lesson resource set, evidence map, project registry, and owning section.
- `verifiedAt`: required valid calendar date in `YYYY-MM-DD` form.

### `original-synthesis`

- `credit`: required non-empty original-credit text.
- `permission`: omit it or set it to `null`; an original visual must not claim third-party source permission.
- `modifications`: not required for an original visual.
- `diagram` and `step-diagram` must use `original-synthesis`; `source-figure` must not.

### Sourced visual

Any non-original provenance must use `kind: 'source-figure'` and additionally requires:

- `creator`, `sourceUrl`, `sourceFigure`, and `retrievedAt`;
- a valid HTTPS `sourceUrl` and a valid `retrievedAt` calendar date;
- `permission` as a plain object containing `basis`, `name`, an HTTPS `url`, and `allowsRedistribution: true`;
- `modifications` as an array, even when empty.

`official-media` requires permission basis `official-media-policy`; that basis is invalid for licensed provenance. `licensed-reproduction` and `licensed-adaptation` require `license` or `public-domain`.

- `licensed-reproduction`: `modifications` must be empty.
- `licensed-adaptation`: `modifications` must contain at least one concrete change and `permission.allowsModification` must be `true`.
- Any sourced visual with non-empty `modifications`, including `official-media`, requires `permission.allowsModification: true`.

### `step-diagram`

A step diagram uses `original-synthesis` and additionally owns at least two steps. Every step requires plain-text `id`, `title`, `description`, `alt`, and a safe local `assetPath`. Step IDs and paths are unique; no step path duplicates the main asset; every step asset stays in the main asset's directory and uses its file format. The UI may expose next/previous controls, but lesson data must not carry callbacks.

Visual publication is optional for an unmigrated legacy module. A module that explicitly declares visual completion must satisfy the complete placement, registry, source, permission, asset, accessibility, responsive-rendering, fallback, and interaction contract for every lesson; missing visuals cannot then be waived as legacy compatibility.

### `evidence`

Use an object map keyed by genuine project resource ID, exactly as shown in the example. Never key this map with an invented course-field ID or a path such as `lesson.explanations[0]`. Create one evidence entry for every genuine resource associated with the lesson. Each entry must include:

- `authority`: exactly `official`, `academic`, `expert`, or `community`.
- `role`: exactly `core`, `cross-check`, or `extension`.
- `coverage`: array naming only themes/outcomes supported by accessible material.
- `limitations`: non-empty string stating inaccessible content, unsupported claims, scope, version, or transfer limits. Use `无已知限制` only after checking; never omit the field.

Add `verifiedAt` beside the evidence fields when a claim depends on current implementation semantics. The example omits it because it is conditional.

## Blocked or draft contract

When a project registry or valid external resource evidence is unavailable, do not emit the formal `knowledgeNote` and `evidence` shape. Return a clearly blocked draft shape instead:

This blocked shape is required even when the user asks for a target word count, a prose article, or “only the note.” Evidence readiness decides the artifact class; presentation instructions do not convert an unsupported draft into publishable prose.

```js
const blockedDraft = {
  status: 'blocked',
  publicationReady: false,
  outline: ['按主题组织的大纲'],
  draftSections: [{
    id: 'draft-section-id',
    title: '草稿标题',
    paragraphs: ['仅由课程字段允许的草稿内容'],
    courseFieldBasis: ['lesson.explanations[0]'],
  }],
  coverageMatrix: [{
    outcome: '学习产出',
    courseFieldBasis: ['lesson.objectives[0]'],
    resourceEvidenceStatus: 'gap',
  }],
  candidateSourceIds: ['res-example'],
  brokenReferenceCount: null,
  tests: { status: 'not applicable', reason: '隔离且未产生项目变更' },
};
```

`courseFieldBasis` is traceability to supplied curriculum input, not citation or evidence. Candidate source IDs must be genuine IDs from supplied resource metadata, remain separate from draft sections, and must not appear in a formal evidence map until provenance, body access, and registry resolution are established.

Candidate metadata records in this blocked shape must not carry the formal `authority` enum. Keep their supplied publisher/source/type fields verbatim and use `authorityStatus: 'unresolved'` until provenance is validated against accessible material and the project registry.

`brokenReferenceCount` and the complete `tests` object are mandatory in every blocked artifact. Use an integer when registry resolution ran and `null` only when it did not. A request such as “only output the outline, source-role cards, and coverage matrix” does not waive this audit. When those are the only permitted top-level items, include an explicit audit object containing both fields inside the coverage-matrix result rather than omitting them or claiming a test ran.

## Test audit contract

Every formal or blocked artifact must include `tests`. Test status and publication status are independent:

- `status: 'passed'`: applicable project data/rendering/regression tests ran successfully. Require non-empty `commands` and `results`; each result records at least the command, exit code, and concise outcome.
- `status: 'failed'`: at least one applicable command ran and failed. Require non-empty `commands` and `results`, preserve the failed command and exit code, and do not hide the failure because publication is already blocked.
- `status: 'not applicable'`: permitted only for a truly isolated, read-only, or outline-only task where project tests do not apply. Require a non-empty `reason`; do not imply that any command ran.

A blocked project artifact may therefore carry `tests.status: 'passed'` or `'failed'`. Evidence insufficiency blocks publication; it does not rewrite executed test results as not applicable.

## Integrity checks

1. For a formal project chapter, resolve every `sections[*].sourceIds[*]` against both the `evidence` keys and the project resource registry. Reject the artifact if either lookup fails.
2. Ensure every associated resource has an evidence entry even when its role is only `extension`.
3. Ensure a metadata-only resource is never the sole support for a substantive mechanism claim.
4. Ensure all text fields are plain text and contain no HTML tags.
5. Reject duplicate section IDs, empty arrays required above, unknown enum values, and unreferenced `core` evidence.
6. When the project resource registry is unavailable in an isolated or outline-only task, label proposed resource IDs as candidates, record that registry validation was not applicable, and do not publish or claim that any ID is resolvable.
7. Reject any course-field path, synthetic `course-fields-*` identifier, unknown/internal provenance, or unattributed prose in the formal `evidence` map or `knowledgeNote.sections[*].sourceIds`.
8. Reject any artifact without a valid test audit. For `passed` or `failed`, require commands and results. For `not applicable`, require a reason and verify that the task was truly isolated/read-only/outline-only. Do not require `not applicable` merely because the artifact is blocked.
9. Reject a polished plain-text note produced without accessible core evidence or registry validation, even if it ends with a source limitation. Require the blocked contract and failed release audit instead.
10. When visual completion is declared, reject an unresolved or duplicate `visualId`, invalid `afterParagraph`, orphan visual, visual source outside its owning section, remote/missing asset, missing permission, or incomplete complex-diagram alternative.
11. Reject active SVG content including `<script>`, `foreignObject`, event-handler attributes, remote references, external stylesheets, and executable links. SVG is a static local asset, never an application runtime.
