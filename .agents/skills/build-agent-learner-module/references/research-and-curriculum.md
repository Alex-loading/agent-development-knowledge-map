# Research and Curriculum Standard

## 1. Research question packet

Before searching, define:

- learner entry and terminal capability;
- capstone artifact and observable completion evidence;
- module responsibility and adjacent-module exclusions;
- concepts, decisions, failure modes, and time-sensitive semantics that need evidence;
- candidate interview and exercise outcomes that must be taught rather than merely listed.

## 2. Parallel research streams

Give each subagent a bounded question set and require canonical URLs, access status, supported claims, limitations, and dates. Research agents do not edit course files.

| Stream | Primary purpose | Typical sources |
| --- | --- | --- |
| Official and standards | Interface, protocol, product, and current implementation semantics | specifications, official docs, official repositories |
| Academic and original | Definitions, methods, experiments, and known limits | papers, author pages, benchmark repositories |
| Engineering practice | Operational decisions and failure handling | original projects, maintainers' guides, vendor engineering articles |
| Learning navigation | Intuition, reproductions, and Chinese accessibility | university courses, author videos, maintained Chinese projects |
| Interview demand (optional) | Calibrate questions and job relevance | public role descriptions and recurring engineering themes |

Short-video and social-platform material is discovery/navigation unless a stable body or transcript is accessible. Popularity is never an evidence rank.

## 3. Candidate and evidence ledger

Record candidates before promoting them to course resources:

```text
candidateId
canonicalUrl
title
publisherOrAuthor
sourceClass
language
bodyAccess: full | partial | metadata-only | failed
freshnessOrVersion
candidateClaims[]
limitations
checkedAt
```

After direct-body verification, use the `$build-learning-module-notes` evidence contract. Keep failed, partial, and metadata-only sources visible; do not describe unobserved contents.

## 4. Research gate

Research may converge only when:

1. every central capability and assessed claim has accessible core evidence;
2. every time-sensitive semantic has a version/date boundary;
3. important cross-framework or safety claims have independent corroboration or an explicit single-source limitation;
4. conflicts and failures are recorded rather than silently merged;
5. the expected curriculum can be taught without relying on unavailable media;
6. weak sources are not being kept to reach a target count.

If the gate fails, choose one: research another canonical source, shrink the claim, move it to an adjacent module, make it optional extension, or block the module.

## 5. Curriculum derivation

Do not turn source categories into lessons. Build this graph first:

```text
entry knowledge → concepts → mechanisms → engineering decisions
→ failure diagnosis → integrated capstone
```

For each lesson define:

- prerequisite nodes and the question this lesson resolves;
- observable objectives and completion criteria;
- an exercise deliverable and validation method;
- quiz reasoning and interview short-answer/deep-dive requirements;
- central claims and candidate evidence;
- the exact handoff to the next lesson.

Then create the coverage matrix:

```text
outcome | assessment/exercise | planned section | evidence IDs | status
```

Course fields define what must be taught; source bodies establish why claims are publishable.

## 6. Complexity calibration

Use modules 1 and 2 as a proven center point, not a template to fill mechanically.

| Dimension | Proven center | Allowed decision |
| --- | --- | --- |
| Lessons | 8 | Usually 6–10; justify dependency boundaries |
| Resources | 28–29 | Use the smallest sufficient verified set; additions close named gaps |
| Quiz | 2 per lesson | Keep enough to test separate reasoning moves |
| Interviews | 3 per lesson | Adjust only with explicit coverage rationale |
| Experiments | 3 | Usually 2–4; zero is valid when interaction adds no teaching value |
| Reading | 25–40 min per lesson | Let mechanism and capstone complexity determine the range |

Split a lesson when it has multiple independent prerequisite chains or cannot fit one coherent exercise. Merge lessons when they repeat definitions and share the same decision and evidence set.
