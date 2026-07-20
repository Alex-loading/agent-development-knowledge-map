---
name: build-learning-module-notes
description: Use when creating or revising Agent Learner knowledge notes from multiple learning resources, or when a resource-heavy course outline must become a source-grounded, self-contained Chinese chapter.
---

# Build Learning Module Notes

## Core rule

Build a Chinese teaching chapter that a learner can study without opening every external link. Treat the supplied materials—not model memory—as the evidence boundary. Preserve missing evidence, conflicts, version limits, and uncertainty instead of filling gaps with plausible prose.

## Required workflow

1. Read the target module and lesson. Collect its objectives, concepts, quiz prompts and explanations, interview questions and answers, exercise, completion criteria, resource IDs, and existing explanations. Treat quiz, interview, and exercise requirements as learning outcomes that the chapter must teach, not as appendices.
2. Read [source-policy.md](references/source-policy.md). Create one evidence card for every associated resource. If the body is unavailable, set its role to `extension`, describe only supplied metadata, and do not infer content from its title, URL, publisher, or model memory.
3. Select source-access tools conditionally. Use **openai-docs** for OpenAI product material, **pdf:pdf** for papers or PDFs, and a browsing tool for ordinary official web pages. Do not request or install low-trust `course-creator`, `fact-check`, or similar third-party packages.
4. Draw the lesson's knowledge-dependency map and coverage matrix before drafting. Map each objective, quiz, interview question, exercise step, and completion criterion to the concepts and evidence needed to teach it. Mark uncovered cells as gaps.
5. Synthesize by theme, never by source order. Use [chapter-standard.md](references/chapter-standard.md) to move from prerequisite bridge and intuition through accurate mechanism, engineering meaning, concrete examples, misconceptions, recap, and the next lesson.
6. Attach valid `sourceIds` to every substantive section. Keep conflicting claims separate, state which source says what, record version-sensitive verification dates, and make uncertainty visible. Delete unsupported mechanism details or mark them for verification; model memory is not a citable source.
7. Produce data only, with no HTML, according to [data-contract.md](references/data-contract.md). Keep IDs stable and validate every section source ID against the lesson's evidence cards or resource registry.
8. Run the project's relevant data, rendering, and full regression tests. Do not claim completion when tests fail or when a citation cannot be resolved.
9. Score the result with [quality-rubric.md](references/quality-rubric.md). Do not publish below 85/100 or with broken `sourceIds`; revise the chapter or explicitly report the blocking evidence gap.

## Evidence-bound drafting rules

- Distinguish statements supported by course fields from statements supported by fetched source bodies.
- Paraphrase long passages. Use brief quotations only when exact wording is necessary and permitted.
- Use tutorials to explain an original definition, never to silently replace it.
- Do not imply that a linked resource was read when only metadata was available.
- Do not turn a resource list into one summary per link. Merge complementary evidence around the learner's question.

## Completion checklist

- Cover every objective, assessed quiz concept, interview short answer, exercise step, and completion criterion.
- Include 4–7 substantive sections with 2–4 short paragraphs each and explain each term on first use.
- Give every substantive section at least one resolvable `sourceId`.
- Record all associated resources in evidence cards, including limitations and an explicit role.
- Show conflicts, implementation dates, missing bodies, and other uncertainty.
- Return contract-valid data without HTML, pass project tests, and score at least 85/100.

## Common failure modes

| Failure | Correction |
| --- | --- |
| The prose sounds complete because model memory supplied details. | Remove unsupported details or mark them `待核验`; cite only supplied or fetched evidence. |
| The output follows the resource list. | Rebuild around dependency and coverage matrices, then synthesize by concept. |
| A metadata-only link supports a key fact. | Downgrade it to `extension`; obtain its body or use another source. |
| Sections cite a publisher name but no stable ID. | Bind each section to registry-resolvable `sourceIds`. |
| The chapter reads well but misses an assessed outcome. | Trace every quiz, interview, exercise, and completion criterion through the coverage matrix. |
