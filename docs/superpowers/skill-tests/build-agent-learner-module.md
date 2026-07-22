# `build-agent-learner-module` skill test log

## RED: baseline without the skill

Date: 2026-07-22

Three fresh subagents received realistic zero-to-one module requests. They could inspect the repository but were forbidden from reading `.agents/skills`; all runs were read-only.

### Scenarios

1. Build `backend-engineering` under same-day pressure, including research, curriculum, notes, implementation, and release.
2. Build `multi-agent-mcp` when Chinese video bodies and transcripts are frequently unavailable.
3. Derive a reusable workflow that adds later modules without regressing the four existing modules.

### What baseline agents did well

- Recovered the data/core/UI/registry architecture and Vercel-only release policy.
- Preserved real source-body checks, evidence limitations, coverage matrices, TDD, cross-module regression, and browser verification.
- Kept incomplete modules `planned` in two of three runs and recognized that metadata-only video cannot support key claims.

### Observed failures and rationalizations

| Failure | Baseline behavior |
| --- | --- |
| Copied precedent as quota | Fixed `8 lessons / 28 resources / 3 labs` before complexity and evidence were known. |
| Designed before research convergence | Published lesson titles and resource buckets before a domain claim inventory and evidence-gap review. |
| Activated too early | One plan placed registration/activation before the eight knowledge notes and final evidence review. |
| Changed product prerequisites to ease delivery | One plan proposed replacing the declared prerequisites of `multi-agent-mcp` with currently active modules. |
| Underestimated content work under deadline | One plan allocated about three hours for eight source-grounded long-form chapters. |
| Reimplemented note policy informally | Agents approximated the mature chapter contract instead of requiring `$build-learning-module-notes`. |
| Weak parallel ownership model | Research/writing/review responsibilities and shared-file ownership were incomplete or absent. |
| No explicit evidence-driven rescoping loop | Plans described blockers, but did not require returning from evidence gaps to curriculum scope before implementation. |

### GREEN acceptance criteria

The new skill must make a fresh agent:

1. inspect repository instructions and current baselines before choosing a module shape;
2. treat modules 1 and 2 as quality references, not fixed counts;
3. run bounded parallel research before freezing the curriculum;
4. preserve declared product prerequisites and module boundaries;
5. require `$build-learning-module-notes` for every publishable lesson note;
6. keep the module `planned` and unregistered until content, implementation, and regressions pass;
7. separate author, specification review, and content/code quality review ownership;
8. stop or rescope when evidence, time, or dependencies cannot meet the release gates;
9. verify Vercel Ready state, public routes, and exact production Git SHA while keeping Pages disabled.

## GREEN and REFACTOR

Two new read-only subagents received the same deadline-pressure and weak-source scenarios with only the new skill path and task context.

### GREEN results

| Acceptance criterion | Deadline-pressure run | Weak-source run |
| --- | --- | --- |
| Recovered repository baseline and Vercel policy | Pass | Pass |
| Treated modules 1/2 as reference, not fixed quota | Pass: derived 6–10 lesson range after evidence | Pass: eight-lesson hypothesis allowed to become 7 or 9 |
| Ran bounded research before curriculum freeze | Pass | Pass |
| Preserved product prerequisites | Pass | Pass: explicitly refused to remove two unmet prerequisites |
| Required `$build-learning-module-notes` per lesson | Pass | Pass |
| Kept module planned/unregistered until final gates | Pass | Pass |
| Separated author/specification/quality ownership | Pass | Pass |
| Rescoped instead of lowering gates under pressure | Pass: would deliver phase artifacts and blocker | Pass: cannot activate before prerequisites |
| Verified Vercel SHA/routes and Pages disabled | Pass | Pass |

The deadline run also noticed and protected the current untracked skill artifacts, while the weak-source run correctly kept inaccessible video as navigation only and derived a realistic 8–12 day critical path instead of promising same-day completion.

### REFACTOR decision

No new loophole required a rule change. The skill already directed agents to the current child-skill contract when its section-count summary differs, and both agents treated the child contract as authoritative. Keep the parent skill focused on orchestration; do not duplicate the detailed note rubric into it.

Final status: GREEN. Re-run these scenarios whenever stage order, activation policy, evidence policy, or deployment provider changes.
