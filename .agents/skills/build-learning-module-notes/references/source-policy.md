# Source Policy

## Evidence card schema

Assign one card to every genuine resource associated with the lesson. A resource must have a real resource ID and attributable provenance; a lesson field or invented identifier is not a resource.

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

`authority` describes known provenance, not trust level or automatic truth. `role` describes how the accessible resource is used in this chapter. Never use a lower enum value as a fallback for missing provenance.

The enum belongs to validated evidence cards. In a blocked task where a resource body and registry cannot be checked, keep the item in a separate candidate list with `authorityStatus: unresolved`; preserve publisher, source, and type only as supplied metadata. Do not infer `official`, `academic`, `expert`, or `community` from a publisher name, title, URL, or metadata type label—even one containing words such as “官方”, “大学”, “专家”, or “社区”.

## Course fields are coverage inputs

- Treat lesson objectives, concepts, explanations, quiz, interview, exercise, completion criteria, and their paths as `courseFieldBasis`: they define coverage, assessment, and draft constraints.
- Do not create a resource ID, evidence card, `authority`, or `role` for a course field unless it already references a genuine resource in the project registry with verifiable provenance.
- Do not label unknown, internal, or unattributed lesson prose as `community`. `community` requires an explicitly identified community source; the fixed authority enum does not contain an `unknown` fallback.
- When course fields are the only substantive material, output a blocked outline, coverage matrix, or draft sections attributed with `courseFieldBasis`. Keep real resource metadata IDs as separate candidates and do not place course-field paths or invented IDs in `sourceIds`.

## Authority and role rules

1. Prefer official specifications, product documentation, and original academic work for definitions, interfaces, and reported experimental findings.
2. Use expert or community tutorials to explain, visualize, or reproduce a concept. Never let a tutorial silently override an original definition or official implementation semantic.
3. Use `core` only when the accessible body directly supports a central learning outcome. Use `cross-check` when it independently corroborates, scopes, or challenges a claim. Use `extension` for optional depth, metadata-only links, inaccessible bodies, or adjacent topics.
4. Treat model memory as navigation help only. Model memory is not a citable source. Delete mechanism details not grounded in supplied course fields or accessed source bodies, or label them as `待核验` outside publishable teaching claims.
5. Do not infer a resource's contents from its title, URL, publisher, type, stage, or `value` field. Metadata can support route planning and evidence limitations, not unobserved body claims.
6. Do not infer a metadata-only candidate's authority enum from those fields. Until its provenance is validated, omit `authority` and use `authorityStatus: unresolved`.

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

## Visual research and permission decisions

Start a visual from a cognitive question, not from an image search. The inventory must record the exact learner question, assessed coverage, owning section, intended visual form, `sourceIds`, candidate source URL, permission evidence, decision, storyboard, and status.

Prefer `original-synthesis` from independently supported facts. A third-party figure may enter the local visual registry only after all of these checks:

1. open the original source body and the page that actually contains the figure;
2. identify its creator and figure title or number;
3. open the applicable license or official media policy, not a search snippet or aggregator;
4. confirm explicit redistribution permission;
5. if any crop, annotation, translation, recoloring, combination, or other adaptation is planned, confirm explicit modification permission;
6. record the source URL, permission URL, retrieval and verification dates, permission basis, and concrete modifications.

Use one of these standard decisions:

- `original-synthesis`: create a new teaching visual from independently supported facts;
- `licensed-reproduction`: ingest the unmodified figure only after redistribution permission is explicit;
- `licensed-adaptation`: ingest a modified figure only after both redistribution and modification permissions are explicit;
- `official-media`: ingest under an explicit official-media policy;
- `link-only-original-replacement`: when the source body is useful but permission is absent, inaccessible, ambiguous, or does not cover the intended use, do not download the figure; retain a normal source link and create an original replacement from independently supported facts.

Page accessibility, a visible copyright notice, an image-search result, social sharing controls, or lack of a watermark is not permission. Do not bulk-ingest search images, scrape galleries, infer a license from neighboring material, or remote-hotlink third-party assets. A linked original remains learning material; it does not become a locally redistributable visual.

For original replacements, do not trace the protected composition, typography, icons, or decorative treatment. Re-derive the teaching structure from the cognitive question and verified facts, and keep the underlying `sourceIds` attached to the new visual.

## Broken or insufficient evidence

Stop publication when a section cites an unknown or invented ID, when a key claim is supported only by metadata or course fields, when provenance is unknown, or when an assessed outcome has no resource evidence. When visual completion is declared, also stop for a broken visual reference, unowned visual evidence, missing/ambiguous permission, remote hotlink, active SVG content, or inaccessible complex diagram. Report the gap and the material needed to resolve it.
