# Learning Note Data Contract

Return pure JavaScript-compatible data. Do not return HTML strings, DOM nodes, Markdown embedded as HTML, or executable callbacks.

## Contract

```js
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
}

evidence: {
  authority: 'official',
  role: 'core',
  coverage: ['覆盖主题'],
  limitations: '该资料不能证明或未覆盖的边界',
}
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
  - `sourceIds`: non-empty, de-duplicated array of resource IDs resolvable in the lesson/module resource registry or supplied evidence set.
- `misconceptions`: array of objects pairing a plausible `claim` with a substantive `correction`.
- `recap`: non-empty array that recalls the causal structure and decisions, not a list of section titles.
- `nextStep`: non-empty Chinese string connecting current knowledge to the next lesson.

### `evidence`

Create one evidence entry keyed by each associated resource ID, or an equivalent array whose item contains that ID. Each entry must include:

- `authority`: exactly `official`, `academic`, `expert`, or `community`.
- `role`: exactly `core`, `cross-check`, or `extension`.
- `coverage`: array naming only themes/outcomes supported by accessible material.
- `limitations`: non-empty string stating inaccessible content, unsupported claims, scope, version, or transfer limits. Use `无已知限制` only after checking; never omit the field.

Add `verifiedAt` beside the evidence fields when a claim depends on current implementation semantics. The example omits it because it is conditional.

## Integrity checks

1. Resolve every `sections[*].sourceIds[*]` against the evidence keys and project resource registry.
2. Ensure every associated resource has an evidence entry even when its role is only `extension`.
3. Ensure a metadata-only resource is never the sole support for a substantive mechanism claim.
4. Ensure all text fields are plain text and contain no HTML tags.
5. Reject duplicate section IDs, empty arrays required above, unknown enum values, and unreferenced `core` evidence.
