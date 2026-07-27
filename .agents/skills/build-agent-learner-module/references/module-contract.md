# Agent Learner Module Contract

## Required module outcomes

A complete active module provides, for every lesson:

- objectives, concepts, a concise `explanations` fallback, and completion criteria;
- a concrete exercise with steps, deliverable, and validation method;
- quiz questions with answer and causal explanation;
- interview questions with short answer, deep dives, misconception, follow-up, frequency, difficulty, and roles;
- associated verified resources and bidirectional references;
- a publishable source-grounded `knowledgeNote` produced with `$build-learning-module-notes`.

The module also provides a dependency-ordered curriculum, resource library, interview bank, progress isolation, and experiments only when justified.

## Visual completion declaration

Visual publication is optional for an unmigrated legacy module. The specification must say whether the module remains legacy-text-only, pilots selected visuals without declaring completion, or declares visual completion. Once visual completion is declared, the complete child-Skill visual contract is mandatory for every lesson and cannot be waived as compatibility work.

A visually complete module provides:

- a cognitive visual inventory created before storyboards, with one learner question and assessed outcome for every figure;
- note-owned placements using `overviewVisualId` plus `overviewVisualSectionId`, or `sections[*].visuals[*].visualId` plus `afterParagraph`;
- a single deeply frozen visual registry whose records own `kind`, `role`, `provenance`, `alt`, `longDescription`, `caption`, `sourceIds`, `permission`, and `modifications` as applicable;
- exactly one real evidence-owning section per published visual, with visual source IDs contained in that section and resolved through lesson evidence and the project resource registry;
- only safe local assets under `assets/visuals/`, with deterministic fixtures where visible quantities or states need a single source of truth;
- semantic figures, useful text fallback, keyboard-safe step controls, reduced motion, readable narrow-screen behavior, and no page-level horizontal overflow.

Third-party media enters the registry only with explicit redistribution permission and explicit modification permission for adaptations. If permission is unclear, do not download: record `link-only-original-replacement`, retain the ordinary original-source link, and create an original visual from independently supported facts. Search-image bulk ingestion and remote hotlinking are prohibited.

## Knowledge-note baseline

The completed first two modules established this practical center:

- 5–7 substantive sections in teaching order;
- 2–4 short paragraphs and at least two recall points per section;
- prerequisite bridge, intuition with limits, accurate mechanism, engineering consequence, worked example, misconceptions, recap, and next-step bridge;
- reading time generally 25–40 minutes, allowed to vary with complexity;
- every substantive section binds real project resource IDs supported by accessible bodies;
- every objective, quiz concept, interview answer/follow-up, exercise step, deliverable, and completion criterion appears in the coverage matrix;
- every lesson scores at least 85/100 with zero broken references.

The child skill's current contract and rubric are authoritative when details differ from this summary.

## Data and architecture rules

1. Keep module metadata `planned` while building.
2. Put course facts in one module data file and long notes in one file per lesson plus a frozen aggregation entry.
3. Use stable explicit IDs with a module prefix; never derive public IDs from array order or mutable wording.
4. Maintain lesson↔resource and lesson↔interview references in both directions.
5. Recursively freeze exported course, notes, resources, and evidence.
6. Keep data free of HTML and callbacks.
7. Put deterministic domain decisions in `src/core/`; UI renderers handle controls, errors, live results, and focus only.
8. Extend generic registries and views. Do not branch shared UI on a specific module or lesson ID.
9. Keep resource/interview/revealed UI state module-scoped and preserve old progress behavior.
10. Add the course to the registry and mark the catalog entry active last.
11. Keep lesson placements separate from registry metadata and renderer code. Unknown visual IDs preserve prose and expose a diagnostic; active SVG content (`script`, `foreignObject`, event handlers, remote references, external stylesheets, or executable links) blocks publication.

## Experiment decision

Create an experiment only when manipulating state exposes a mechanism or decision that prose and a static exercise cannot teach as well. It must:

- be deterministic and declare its simulation boundary;
- have a pure, immutable core with invalid/boundary cases;
- avoid real models, network calls, secrets, and third-party services;
- provide keyboard access, meaningful focus restoration, reset, and polite live output;
- avoid duplicating an existing module's experiment under a new label.

## Subagent ownership

Use parallel agents only for independent work:

- research streams return leads and audit records; the main agent verifies bodies;
- note authors own disjoint lesson files;
- one integration owner changes shared registries, aggregators, tests, and README;
- a specification reviewer checks against the approved design and coverage matrix;
- a separate quality reviewer checks evidence, teaching progression, correctness, maintainability, and test strength;
- defects return to the original author, then receive the same review again.
- visual assets/records are partitioned by lesson; one integration owner changes the visual registry, renderer, shared CSS, and visual contract tests.

Subagent reports never replace reading the actual files, diff, tests, or browser state.

## Activation gate

Do not activate when any lesson is missing, blocked, below the note threshold, or has broken references; when prerequisites are unmet; when shared regressions fail; or when the public release cannot be tied to the intended commit. For declared visual completion, also block on any missing visual, broken ownership/reference, unresolved permission, unsafe asset, inaccessible complex diagram, failed responsive/fallback/interaction check, or failed visual score.
