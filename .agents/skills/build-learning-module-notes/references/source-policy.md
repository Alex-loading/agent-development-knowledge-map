# Source Policy

## Evidence card schema

Assign one card to every resource associated with the lesson.

```text
authority: official | academic | expert | community
role: core | cross-check | extension
coverage: [specific themes or learning outcomes actually supported]
limitations: material not accessed, claims not established, scope, version, or transfer boundary
verifiedAt: YYYY-MM-DD when semantics are time-sensitive
```

Use only these enum values:

- `authority`: `official | academic | expert | community`
- `role`: `core | cross-check | extension`

`authority` describes provenance, not automatic truth. `role` describes how the material is used in this chapter.

## Authority and role rules

1. Prefer official specifications, product documentation, and original academic work for definitions, interfaces, and reported experimental findings.
2. Use expert or community tutorials to explain, visualize, or reproduce a concept. Never let a tutorial silently override an original definition or official implementation semantic.
3. Use `core` only when the accessible body directly supports a central learning outcome. Use `cross-check` when it independently corroborates, scopes, or challenges a claim. Use `extension` for optional depth, metadata-only links, inaccessible bodies, or adjacent topics.
4. Treat model memory as navigation help only. Model memory is not a citable source. Delete mechanism details not grounded in supplied course fields or accessed source bodies, or label them as `待核验` outside publishable teaching claims.
5. Do not infer a resource's contents from its title, URL, publisher, type, stage, or `value` field. Metadata can support route planning and evidence limitations, not unobserved body claims.

## Media, freshness, and conflict

- Do not use a video without an accessible transcript or equivalent primary material to support a key fact. Keep it as `extension` and state the transcript limitation.
- Attach a verification date to implementation semantics, API behavior, model availability, pricing, limits, security guidance, and other time-sensitive claims.
- Do not silently merge conflicting claims. Present each position with its source ID, explain differences in definition, version, task, or experimental setting, and state what remains unresolved.
- Distinguish a paper's result under its reported evaluation from a universal engineering guarantee.

## Attribution and copyright

- Paraphrase long source passages in original structure and language. Do not copy a large passage from any single source.
- Quote only brief wording when exact language matters; keep the quotation attached to its source ID.
- Preserve source IDs at the section level and add more granular attribution in prose when multiple sources disagree.
- Do not claim to have read, watched, or verified a body that was unavailable.

## Broken or insufficient evidence

Stop publication when a section cites an unknown ID, when a key claim is supported only by metadata, or when an assessed outcome has no evidence. Report the gap and the material needed to resolve it.
