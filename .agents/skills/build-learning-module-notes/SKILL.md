---
name: build-learning-module-notes
description: Use when creating or revising Agent Learner knowledge notes from multiple learning resources, or when a resource-heavy course outline must become a source-grounded, self-contained Chinese chapter.
---

# Build Learning Module Notes

## Core rule

Build a Chinese teaching chapter that a learner can study without opening every external link. Treat verified resource bodies—not model memory or unattributed course fields—as publishable evidence. Preserve missing evidence, conflicts, version limits, and uncertainty instead of filling gaps with plausible prose.

Evidence and release gates take precedence over requested artifact shape, word count, and format instructions such as “只返回笔记正文”. Apply those gates only after completing every source-body and registry access attempt that the task authorizes and requires; a gate must never be used to skip legitimate evidence collection. When accessible core evidence or the project registry is still missing after those attempts, do not first produce a polished, apparently publishable plain-text note and append a limitation afterward. Refuse the publishable shape and return a blocked report or draft outline that exposes the gap.

## Required workflow

1. Read the target module and lesson first. Collect its objectives, concepts, quiz prompts and explanations, interview questions and answers, exercise, completion criteria, associated resource metadata and IDs, existing explanations, and any project registry location. Treat lesson fields as coverage inputs and drafting constraints, not resource evidence. Treat quiz, interview, and exercise requirements as learning outcomes that the chapter must teach, not as appendices.
2. Read [source-policy.md](references/source-policy.md), decide what evidence and registry checks are necessary, and select access tools conditionally. Use **openai-docs** for OpenAI product material, **pdf:pdf** for papers or PDFs, and a browsing tool for ordinary official web pages. Do not request or install low-trust `course-creator`, `fact-check`, or similar third-party packages.
3. Attempt every necessary source-body and project-registry access allowed by the task. Record access failures instead of treating an untried source as unavailable. Then create one evidence card for each genuine associated resource with a real resource ID and validated provenance. If a body remains unavailable, keep it as a candidate with role `extension`, describe only supplied metadata, and do not infer content from its title, URL, publisher, course fields, or model memory. In a blocked task without registry or body validation, omit the formal `authority` field and record `authorityStatus: 'unresolved'`; do not translate publisher names or labels such as “官方课程”, “技术综述”, or “社区课程” into the authority enum. Never mint a resource ID, `authority`, or `role` for lesson fields.
4. Before drafting any publishable artifact, apply the evidence and release gates to the post-access evidence set. If no accessible core body or required registry validation remains available after authorized attempts, enter the blocked path—even when the user requested a word count, prose-only response, or “only the note.” A blocked result must expose blockers, separate `courseFieldBasis` from resource evidence, list genuine candidate IDs, report `brokenReferenceCount` as an integer when resolution ran or `null` when it did not, include the required `tests` audit, and include a rubric with a failed release gate.
5. Draw the lesson's knowledge-dependency map and coverage matrix before drafting. Map each objective, quiz, interview question, exercise step, and completion criterion to `courseFieldBasis` separately from the resource evidence needed to teach it. Mark missing resource evidence as a gap; course-field coverage does not close an evidence gap.
6. Synthesize by theme, never by source order. Use [chapter-standard.md](references/chapter-standard.md) to move from prerequisite bridge and intuition through accurate mechanism, engineering meaning, concrete examples, misconceptions, recap, and the next lesson.
7. Attach valid `sourceIds` to every substantive section of a formal chapter. Use only real resource IDs backed by attributable evidence cards; never convert `lesson.explanations`, objectives, quiz, interview, exercise, completion criteria, or other course-field paths into source IDs. Keep conflicts, versions, and uncertainty visible. Delete unsupported mechanism details or keep them only in a blocked draft with `courseFieldBasis`; model memory is not a citable source.
8. Produce data only, with no HTML, according to [data-contract.md](references/data-contract.md). For a formal project chapter, validate every section source ID against both the lesson's evidence set and the project resource registry. If evidence remains insufficient, return a blocked outline, coverage matrix, or `draftSections` with `courseFieldBasis`; list candidate real resource IDs separately. Do not emit contract-shaped `knowledgeNote.sections.sourceIds`, do not create a formal `evidence` map, and never call unvalidated candidate IDs resolvable.
9. Always record a test audit. Use `tests.status: 'passed'` or `'failed'` with the exact commands and results when project data or rendering was changed or validated, even if the evidence gate later blocks publication. Use `tests.status: 'not applicable'` with an exact reason only for a truly isolated, read-only, or outline-only task where project tests do not apply. Test status is independent of publication status. This audit is mandatory under a constrained response shape; nest it in an explicit coverage audit when necessary.
10. Score the result with [quality-rubric.md](references/quality-rubric.md). Do not publish below 85/100 or with broken `sourceIds`; revise the chapter or explicitly report the blocking evidence gap.

## Evidence-bound drafting rules

- Distinguish course fields that specify coverage from resource bodies that supply evidence. Course fields never become resource evidence merely because they contain accurate prose.
- Course fields may support a visibly non-publishable draft, but they do not license model-memory embellishment. Remove or mark `待核验` any definition, causal claim, mechanism, analogy, or example not explicitly supplied by a course field or accessible resource body.
- Keep unknown or internal provenance outside the `authority` enum rather than disguising it as `community`; do not create an evidence card until genuine provenance is known.
- For metadata-only candidates in a blocked task, preserve publisher and type as supplied metadata but keep `authorityStatus: 'unresolved'`. Authority classification belongs to validated evidence, not candidate-route planning.
- Paraphrase long passages. Use brief quotations only when exact wording is necessary and permitted.
- Use tutorials to explain an original definition, never to silently replace it.
- Do not imply that a linked resource was read when only metadata was available.
- Do not turn a resource list into one summary per link. Merge complementary evidence around the learner's question.

## Completion checklist

- Cover every objective, assessed quiz concept, interview short answer, exercise step, and completion criterion.
- For a formal chapter, include 4–7 substantive sections with 2–4 short paragraphs each and explain each term on first use. For blocked work, use `draftSections` or an outline instead of a formal `knowledgeNote`.
- Give every substantive section at least one `sourceId` that exists in both the lesson evidence set and project resource registry. Without a registry, keep IDs as candidates and do not publish.
- Record all associated resources in evidence cards, including limitations and an explicit role.
- Show conflicts, implementation dates, missing bodies, and other uncertainty.
- Return contract-valid data without HTML, record applicable project tests as passed or failed with commands/results (or explicitly record why tests are not applicable), and score at least 85/100. Every blocked result includes the reference-resolution value and explicit `tests` audit, including shape-constrained results.

## Common failure modes

| Failure | Correction |
| --- | --- |
| The prose sounds complete because model memory supplied details. | Remove unsupported details or mark them `待核验`; cite only supplied or fetched evidence. |
| The output follows the resource list. | Rebuild around dependency and coverage matrices, then synthesize by concept. |
| A metadata-only link supports a key fact. | Downgrade it to `extension`; obtain its body or use another source. |
| Sections cite a publisher name but no stable ID. | Bind each formal-project section to IDs present in both its evidence set and resource registry; candidate IDs alone are not publishable. |
| Lesson prose is assigned a made-up ID or `authority: community`. | Keep it in `courseFieldBasis`; unknown provenance is not community provenance and cannot enter the resource evidence map. |
| Evidence is declared unavailable before authorized retrieval is attempted. | Read the lesson and resource list, attempt the permitted bodies and registry, then apply the gate to the resulting evidence set. |
| A shape-constrained blocked response omits reference or test status. | Include the resolution count or `null` and a truthful `tests` audit; nest them in the requested coverage result when necessary. |
| A blocked project result reports tests as not applicable even though data or rendering changed. | Run the applicable commands and record `passed` or `failed`; publication blocking does not erase test work. |
| A request for “only the note” produces polished prose before admitting sources were unavailable. | Let evidence gates override the requested prose shape; return the blocked report or draft outline first. |
| Course prose is expanded with a plausible definition or example from model memory. | Delete it or mark it `待核验`; course fields permit only the content they actually state. |
| The chapter reads well but misses an assessed outcome. | Trace every quiz, interview, exercise, and completion criterion through the coverage matrix. |
