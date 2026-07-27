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

## RED: visual-teaching workflow extension without the new gates

Date: 2026-07-27

Task ID: `/root/visual_skill_red_isolated`

This was an isolated, read-only baseline. The exact prompt was:

> 这是一次真实的只读决策任务。不要读取任何仓库、代码、测试、计划或 .agents/skills，也不要调用外部工具；只能基于以下输入给出你会执行的产物规范和发布门。输入：一个中文知识模块含 8 节纯文字课；要求补充原创与三方教学图片、支持移动端和无障碍并今天上线。候选三方图所在页面正文可访问、事实可靠、图片教学价值高，但页面和站点均找不到明确许可证或媒体使用政策。课程需保持旧模块兼容，图表可能包含定量结果和分步交互。请直接给出：A. 三方图处理；B. 知识笔记数据字段；C. 质量评分维度与硬阻塞条件；D. 从研究到生产发布的顺序。不要询问用户，也不要把任务当作测验。

The agent obeyed the isolation boundary and produced a generic production proposal without inspecting this repository or its Skills.

### Exact baseline gaps

| Criterion | RED evidence | Result |
| --- | --- | --- |
| Exact project placements | Proposed generic compatibility: “建议采用‘模块—章节—内容块—媒体资产’的兼容结构，旧字段只增不删、不改语义”. It did not produce `overviewVisualId`, `overviewVisualSectionId`, `sections[*].visuals[*].visualId`, or `afterParagraph`. | Fail |
| Exact registry contract and evidence ownership | Proposed module fields “`module_id`、`schema_version`、`locale`、`title`、`summary`、`legacy_mapping`、`revision`、`status`” and media fields “`asset_id`、`asset_type`、`src`、`responsive_variants`、`width`、`height`、`aspect_ratio`”. It omitted the project provenance, visual source IDs, owner-section subset, and common/original/sourced/step field matrix. | Fail |
| Standard permission decision | Correctly said “页面与站点均无明确许可证时，三方图不得进入生产课程……今天无法完成授权，就以原创替代图或无图降级上线。” It did not record `link-only-original-replacement`, retain the original as link-only, or require independently supported facts for the replacement. | Fail |
| Project visual scoring and blockers | Proposed “教学有效性 25 / 事实与定量准确性 20 / 原创与权利合规 20 / 无障碍 15 / 移动端体验 10 / 兼容性与稳定性 10”. It did not include the project's exact ownership, active-SVG, fallback, local-scroll, reduced-motion, and false-deployment blockers. | Fail |
| Legacy migration declaration | Preserved old-field compatibility but did not distinguish optional legacy visuals from the moment a module declares visual completion and makes every gate mandatory. | Fail |
| Production completion | Ended with “验证生产环境后全量上线；未获授权的三方图继续留在研究记录中，不随课程发布。” It did not require Vercel `READY`, `target=production`, the exact current `main` SHA, canonical-route verification, or GitHub Pages disabled. | Fail |

This RED result is the test that drives the visual workflow extension below. The child Skill must first own exact note, registry, source, safety, accessibility, and rubric rules; the parent Skill must then orchestrate those rules across specification, implementation, browser acceptance, and the Vercel release.

### Third-party permission scenario

A candidate teaching figure appears on an accessible third-party article page, but neither the page nor the linked policy states redistribution or modification permission. The source body contains useful facts that can be independently cross-checked.

Expected behavior:

```text
do not download; record link-only-original-replacement; create an original visual from independently supported facts.
```

## GREEN acceptance criteria: visual-teaching workflow extension

The revised Skills must make a fresh agent:

1. ask a cognitive question before storyboarding each visual;
2. use the exact overview pair `overviewVisualId`/`overviewVisualSectionId` and section pair `sections[*].visuals[*].visualId`/`afterParagraph`;
3. require the exact common/original/sourced/step visual field matrix, including ownership, geometry, provenance, source, permission, modification, date, and step requirements as applicable;
4. verify the original body, source page, license or policy, redistribution rights, and modification rights before ingesting third-party media;
5. record `link-only-original-replacement`, retain only the source link, and create an original visual from independently supported facts when permission is unclear;
6. reject remote hotlinks, search-image bulk ingestion, active SVG content, broken visual IDs, inaccessible complex diagrams, and false deployment claims;
7. keep publication optional for a legacy module until it declares visual completion, then make every visual gate mandatory;
8. verify responsive local media scrolling, keyboard-safe step controls, reduced motion, and fallback behavior;
9. deploy only through Vercel, require Production `READY` with the exact `main` Git SHA, verify public routes, and confirm GitHub Pages remains disabled.

### First GREEN forward-test: intermediate result

Task ID: `/root/visual_skill_green_forward`

The exact prompt was:

> Use $build-agent-learner-module at /Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.worktrees/llm-foundation-visual-system/.agents/skills/build-agent-learner-module to solve this planning task. Read the skill and every reference it requires. Do not modify files or call external tools. Scenario: Extend an existing eight-lesson text-first Chinese learning module into a visually complete module and take it through production release. The module includes quantitative diagrams and one step diagram. A third-party tutorial page and its figure are accessible, but no clear license or media policy is found. Existing legacy modules must continue to work. Provide the actual artifact/data contract, research and permission decision, implementation/review/browser gates, and final deployment completion criteria you would follow. Treat this as real work, not a skill review or quiz.

This run is a forward test of behavior after reading the revised Skills, but it is **not isolated**. Despite the prompt's “Do not ... call external tools” boundary, the agent reported inspecting the repository baseline and dirty worktree and reported `npm test` as 471/471. Those claims are a prompt-boundary deviation and are not treated here as independent execution evidence; repository tests must be rerun by the implementation owner.

| Acceptance criterion | GREEN evidence | Result |
| --- | --- | --- |
| Cognitive question before storyboard and permission boundary | “Page accessibility does not grant image redistribution rights.” The workflow separated research evidence from later section ownership/storyboarding. | Pass |
| Standard unclear-permission decision | “With no explicit license or media policy, the figure decision is unequivocally `link-only-original-replacement`.” It retained the original link and required an independently evidenced original replacement. | Pass |
| Exact placement contract | Returned `overviewVisualId`, `overviewVisualSectionId`, `sections[].visuals[].visualId`, and `afterParagraph`, with one real owner section per visual. | Pass |
| Exact registry fields | Returned `id/kind/role/title/alt/longDescription/caption/assetPath/width/height/provenance/sourceIds/credit/permission/modifications/verifiedAt`. The subsequent quality review tightened the Skill reference into explicit common/original/sourced/step matrices; this row does not claim unquoted forward-test fields. | Pass for quoted core; refactored afterward |
| Quantitative and visible correctness | “Every quantitative diagram binds a deeply frozen executable fixture” and the proposed tests recomputed raw inputs and checked visible SVG labels and geometry. | Pass |
| Safety, accessibility, responsive behavior, and fallback | Required active-SVG rejection, local assets, long descriptions, keyboard step controls, reduced motion, local media scrolling at narrow widths, and prose-preserving fallback. | Pass |
| Legacy migration boundary | Kept legacy modules compatible while making all visual gates mandatory for the module declaring visual completion. | Pass |
| Actual production completion | “Verify deployment metadata reports `READY`, `target=production`, and `githubCommitSha` exactly equals the current `main` SHA.” Also: “Confirm GitHub Pages remains disabled.” | Pass |

Audit limitation: the GREEN agent's repository inspection and `npm test` claim violated the no-external-tools prompt boundary. They do not invalidate the contract behaviors above, but they prevent describing this run as isolated or using its reported test count as verification evidence. This run is retained as an intermediate result only; it is not the final evidence for the provenance-specific field matrix.

### REFACTOR verification: final GREEN

Task ID: `/root/visual_skill_final_green`

After the quality-review refactor aligned the field matrix, two-stage inventory timing, release gates, README, and module-design template, a fresh agent received this exact prompt:

> Use `$build-agent-learner-module` from `/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.worktrees/llm-foundation-visual-system/.agents/skills/build-agent-learner-module` for this real planning task. You may use filesystem tools only to read that Skill directory and the child Skill directory it explicitly requires, including their directly required references and template. Do not inspect any other repository path, implementation, tests, plans, README, git state, or network; do not run commands or modify files. Scenario: An existing active eight-lesson Chinese learning module is text-first. Migrate it to declared visual completion with original visuals, a quantitative visual, a step diagram, and one candidate third-party figure whose source page is accessible but has no clear license or media policy. Preserve all legacy modules and take the migration through production release. Return: (1) research/inventory stage order; (2) exact note placement and complete common/original/sourced/step visual field matrix; (3) permission decision; (4) score/blocker and implementation/review/browser gates; (5) exact production-completion conditions. Treat this as real work, not a Skill review or quiz.

This agent honored the read-only and path-scope boundary. It made no repository-baseline, git-state, network, or test-run claims and ended with tests marked not applicable because this was a read-only Skill-driven planning task.

| Final criterion | REFACTOR evidence | Result |
| --- | --- | --- |
| Two-stage inventory order | Before curriculum it kept only a provisional cognitive question plus factual and permission leads. After curriculum it said: “Only now freeze, per figure: exact assessed outcome, one real owner section, overview/section placement, genuine project sourceIds, permission decision, and storyboard.” | Pass |
| Exact note placement | Returned the overview pair `overviewVisualId`/`overviewVisualSectionId` and section pair `sections[*].visuals[*].visualId`/integer `afterParagraph`, with exactly one real evidence-owning section per published visual. | Pass |
| Complete common matrix | Returned `id`, `kind`, `role`, `title`, `alt`, `longDescription`, `caption`, `assetPath`, `width`, `height`, `provenance`, `sourceIds`, and `verifiedAt`. | Pass |
| Original/sourced/step matrices | Original required `credit`, allowed `permission` only omitted or `null`, and did not require `modifications`. Sourced required `creator`, `sourceUrl`, `sourceFigure`, `retrievedAt`, `permission`, and `modifications`, including the `official-media-policy` basis boundary. Step diagrams required at least two unique steps whose assets share the main asset directory and format. | Pass |
| Unclear third-party permission | “mandatory decision is: `link-only-original-replacement`”; do not download or hotlink, retain the normal source link, and create `original-synthesis` from independently verified facts. | Pass |
| Scores and blockers | Required note score ≥85/100, visual score ≥51/60, every visual category ≥8/10, and zero ownership, permission, active-SVG, accessibility, responsive, fallback, or deployment blockers. | Pass |
| Implementation, review, and browser gates | Required deterministic fixtures for quantitative meaning, visible-geometry and static-asset checks, author → specification review → quality review, keyboard step controls, long descriptions, reduced motion, 390px/320px local media scrolling without document overflow, and fallback/console verification. | Pass |
| Exact production completion | Required Vercel `READY`, `target=production`, `githubCommitSha` equal to the exact current `main` SHA, verified public routes, and GitHub Pages disabled. | Pass |
| Scope integrity | No unrelated repository inspection or command/test claim; `tests.status` remained not applicable for the read-only planning run. | Pass |

Final status: **GREEN**, based on `/root/visual_skill_final_green`. The first GREEN run remains an intermediate behavioral result and is not used as final field-matrix evidence. Re-run this constrained forward test whenever the visual data contract, permission decisions, renderer safety rules, migration declaration, browser matrix, template, or deployment provider changes.
