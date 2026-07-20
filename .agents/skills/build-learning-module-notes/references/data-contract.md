# Learning Note Data Contract

Return pure JavaScript-compatible data. Do not return HTML strings, DOM nodes, Markdown embedded as HTML, or executable callbacks.

## Formal publishable contract

Use this shape only when each `sourceId` is a genuine project resource ID present in both the lesson evidence map and project registry, with attributable provenance and accessible supporting material.

```js
const learningArtifact = {
  knowledgeNote: {
    readingMinutes: 25,
    introduction: '章节导语',
    sections: [{
      id: 'stable-section-id',
      title: '章节标题',
      paragraphs: ['段落一', '段落二'],
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
};
```

## Field rules

### `knowledgeNote`

- `readingMinutes`: integer estimated from the finished chapter; use 20–30 for the standard full chapter unless the task explicitly requests a smaller artifact.
- `introduction`: non-empty Chinese string that states the chapter problem, prerequisite bridge, and expected outcome.
- `sections`: array of 4–7 substantive section objects in teaching order.
  - `id`: stable, unique, lowercase kebab-case identifier; do not derive it from array position.
  - `title`: non-empty Chinese heading.
  - `paragraphs`: array of 2–4 non-empty plain-text paragraphs.
  - `keyPoints`: array of concise, non-duplicative recall points.
  - `callout`: optional object. When present, require `kind`, `title`, and `body`; keep all values plain text. Common `kind` values include `intuition`, `example`, `boundary`, and `warning`.
  - `sourceIds`: non-empty, de-duplicated array of resource IDs. For a formal project chapter, every ID must be present in both the lesson's `evidence` map and the project resource registry. In an isolated or outline-only task without a registry, retain proposed IDs only as candidates outside publishable `knowledgeNote.sections`.
- `misconceptions`: array of objects pairing a plausible `claim` with a substantive `correction`.
- `recap`: non-empty array that recalls the causal structure and decisions, not a list of section titles.
- `nextStep`: non-empty Chinese string connecting current knowledge to the next lesson.

### `evidence`

Use an object map keyed by genuine project resource ID, exactly as shown in the example. Never key this map with an invented course-field ID or a path such as `lesson.explanations[0]`. Create one evidence entry for every genuine resource associated with the lesson. Each entry must include:

- `authority`: exactly `official`, `academic`, `expert`, or `community`.
- `role`: exactly `core`, `cross-check`, or `extension`.
- `coverage`: array naming only themes/outcomes supported by accessible material.
- `limitations`: non-empty string stating inaccessible content, unsupported claims, scope, version, or transfer limits. Use `无已知限制` only after checking; never omit the field.

Add `verifiedAt` beside the evidence fields when a claim depends on current implementation semantics. The example omits it because it is conditional.

## Blocked isolated or outline-only contract

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

`brokenReferenceCount: null` and the complete `tests` object are mandatory in every blocked artifact. A request such as “only output the outline, source-role cards, and coverage matrix” does not waive this audit. When those are the only permitted top-level items, include an explicit audit object containing both fields inside the coverage-matrix result rather than omitting them or claiming a test ran.

## Integrity checks

1. For a formal project chapter, resolve every `sections[*].sourceIds[*]` against both the `evidence` keys and the project resource registry. Reject the artifact if either lookup fails.
2. Ensure every associated resource has an evidence entry even when its role is only `extension`.
3. Ensure a metadata-only resource is never the sole support for a substantive mechanism claim.
4. Ensure all text fields are plain text and contain no HTML tags.
5. Reject duplicate section IDs, empty arrays required above, unknown enum values, and unreferenced `core` evidence.
6. When the project resource registry is unavailable in an isolated or outline-only task, label proposed resource IDs as candidates, record that registry validation was not applicable, and do not publish or claim that any ID is resolvable.
7. Reject any course-field path, synthetic `course-fields-*` identifier, unknown/internal provenance, or unattributed prose in the formal `evidence` map or `knowledgeNote.sections[*].sourceIds`.
8. Reject a blocked or outline-only artifact that omits `brokenReferenceCount: null`, omits `tests.status: 'not applicable'`, or fails to state why project tests did not apply.
9. Reject a polished plain-text note produced without accessible core evidence or registry validation, even if it ends with a source limitation. Require the blocked contract and failed release audit instead.
