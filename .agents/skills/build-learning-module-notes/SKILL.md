---
name: build-learning-module-notes
description: Use when creating or revising Agent Learner knowledge notes from multiple learning resources, or when a resource-heavy course outline must become a source-grounded, self-contained Chinese chapter.
---

# Build Learning Module Notes

## Core rule

Build a Chinese teaching chapter that a learner can study without opening every external link. Treat verified resource bodies—not model memory or unattributed course fields—as publishable evidence. Preserve missing evidence, conflicts, version limits, and uncertainty instead of filling gaps with plausible prose.

## Required workflow

1. Read the target module and lesson. Collect its objectives, concepts, quiz prompts and explanations, interview questions and answers, exercise, completion criteria, resource IDs, and existing explanations. Treat those lesson fields as coverage inputs and drafting constraints, not resource evidence. Treat quiz, interview, and exercise requirements as learning outcomes that the chapter must teach, not as appendices.
2. Read [source-policy.md](references/source-policy.md). Create one evidence card only for each genuine associated resource with a real resource ID and attributable provenance. If the body is unavailable, set its role to `extension`, describe only supplied metadata, and do not infer content from its title, URL, publisher, course fields, or model memory. Never mint a resource ID, `authority`, or `role` for lesson fields.
3. Select source-access tools conditionally. Use **openai-docs** for OpenAI product material, **pdf:pdf** for papers or PDFs, and a browsing tool for ordinary official web pages. Do not request or install low-trust `course-creator`, `fact-check`, or similar third-party packages.
4. Draw the lesson's knowledge-dependency map and coverage matrix before drafting. Map each objective, quiz, interview question, exercise step, and completion criterion to `courseFieldBasis` separately from the resource evidence needed to teach it. Mark missing resource evidence as a gap; course-field coverage does not close an evidence gap.
5. Synthesize by theme, never by source order. Use [chapter-standard.md](references/chapter-standard.md) to move from prerequisite bridge and intuition through accurate mechanism, engineering meaning, concrete examples, misconceptions, recap, and the next lesson.
6. Attach valid `sourceIds` to every substantive section of a formal chapter. Use only real resource IDs backed by attributable evidence cards; never convert `lesson.explanations`, objectives, quiz, interview, exercise, completion criteria, or other course-field paths into source IDs. Keep conflicts, versions, and uncertainty visible. Delete unsupported mechanism details or keep them only in a blocked draft with `courseFieldBasis`; model memory is not a citable source.
7. Produce data only, with no HTML, according to [data-contract.md](references/data-contract.md). For a formal project chapter, validate every section source ID against both the lesson's evidence set and the project resource registry. If an isolated or outline-only task lacks the registry or valid resource evidence, return a blocked outline, coverage matrix, or `draftSections` with `courseFieldBasis`; list candidate real resource IDs separately. Do not emit contract-shaped `knowledgeNote.sections.sourceIds`, do not create a formal `evidence` map, and never call candidate IDs resolvable. Every blocked artifact must also report `brokenReferenceCount: null` because resolution was not tested.
8. When a project exists and the task produces or validates project data or rendering changes, run the relevant data and rendering tests plus the full regression suite. For an isolated, read-only, or outline-only task where project tests are outside scope, every blocked artifact must record `tests: { status: 'not applicable', reason: '...' }` with the exact reason; never imply that tests ran. This audit is mandatory even when the requested response is limited to an outline, source-role cards, and a coverage matrix; if the requested top-level shape is fixed, put `brokenReferenceCount` and `tests` in an explicit audit object inside the coverage-matrix result.
9. Score the result with [quality-rubric.md](references/quality-rubric.md). Do not publish below 85/100 or with broken `sourceIds`; revise the chapter or explicitly report the blocking evidence gap.

## Evidence-bound drafting rules

- Distinguish course fields that specify coverage from resource bodies that supply evidence. Course fields never become resource evidence merely because they contain accurate prose.
- Keep unknown or internal provenance outside the `authority` enum rather than disguising it as `community`; do not create an evidence card until genuine provenance is known.
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
- Return contract-valid data without HTML, pass applicable project tests (or explicitly record why tests are not applicable), and score at least 85/100. Every blocked result includes `brokenReferenceCount: null` and the explicit `tests` audit, including shape-constrained outline-only results.

## Common failure modes

| Failure | Correction |
| --- | --- |
| The prose sounds complete because model memory supplied details. | Remove unsupported details or mark them `待核验`; cite only supplied or fetched evidence. |
| The output follows the resource list. | Rebuild around dependency and coverage matrices, then synthesize by concept. |
| A metadata-only link supports a key fact. | Downgrade it to `extension`; obtain its body or use another source. |
| Sections cite a publisher name but no stable ID. | Bind each formal-project section to IDs present in both its evidence set and resource registry; candidate IDs alone are not publishable. |
| Lesson prose is assigned a made-up ID or `authority: community`. | Keep it in `courseFieldBasis`; unknown provenance is not community provenance and cannot enter the resource evidence map. |
| A shape-constrained blocked response omits reference or test status. | Include `brokenReferenceCount: null` and `tests.status: not applicable`; nest them in the requested coverage result when necessary. |
| The chapter reads well but misses an assessed outcome. | Trace every quiz, interview, exercise, and completion criterion through the coverage matrix. |
