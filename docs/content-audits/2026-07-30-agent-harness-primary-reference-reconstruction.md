# Agent Harness primary-reference reconstruction audit

- Audit date: 2026-07-30
- Correction review date: 2026-07-31
- Module: `agent-harness`
- Compatibility boundary: eight existing lesson IDs, sixteen quiz IDs, twenty-four interview IDs, and the three existing experiment mappings are unchanged
- Resource result: 29 verified legacy resources retained, one versioned official MCP specification added, 23 primary-reference bindings appended, 53 total resources
- Visual result: 24 published teaching visuals, three per lesson and exactly one overview per lesson; 27 local SVG assets including three step states
- Publication state: source, note, visual, ownership, UI, and full regression contracts pass; browser backend availability is recorded separately below

## Reconstruction inputs

Every new primary narrative is created through `createPrimaryReferenceBinding`; no title, canonical URL, author, source tier, or source-family string is retyped into the Harness registry.

| Family | Count | Frozen canonical source IDs |
| --- | ---: | --- |
| Feishu Harness 101 | 15 | `primary-feishu-react-loop`, `primary-feishu-beyond-model`, `primary-feishu-loop-engineering-intro`, `primary-feishu-react-orchestration`, `primary-feishu-dynamic-workflow`, `primary-feishu-agent-version-drifting`, `primary-feishu-tool-truth`, `primary-feishu-company-brain`, `primary-feishu-context-offloading`, `primary-feishu-microcompact`, `primary-feishu-virtual-filesystem`, `primary-feishu-claude-code-tools`, `primary-feishu-claude-ai-memory`, `primary-feishu-autonomous-evolution`, `primary-feishu-agent-install-md` |
| JavaGuide AI | 8 | `primary-javaguide-agent-basis`, `primary-javaguide-harness-engineering`, `primary-javaguide-agent-skills`, `primary-javaguide-mcp`, `primary-javaguide-workflow-graph-loop`, `primary-javaguide-loop-engineering`, `primary-javaguide-context-engineering`, `primary-javaguide-ai-application-architecture` |

Feishu bindings use `expert` authority and explicitly identify the material as teaching observation, narrative, or engineering deduction rather than product, protocol, runtime, or safety guarantees. JavaGuide supplies systematic cross-reference structure. Sections containing product, SDK, API, protocol, OpenAI, LangGraph, Temporal, Claude, or MCP claims retain an official verification source inside the same owning section.

The non-canonical-registry addition `res-harness-mcp-tools-spec` is an ordinary project resource rather than a primary narrative binding. Its authoritative body is the versioned [Model Context Protocol Tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), published by Model Context Protocol on `modelcontextprotocol.io` and rechecked on 2026-07-31. It supports only the declared `tools` capability, `tools/list`, `tools/call`, tool schema, client-server message flow, and the specification's model-controlled interaction boundary; its card explicitly excludes Harness identity, resource authorization, business approval, policy execution, and side-effect guarantees. All 53 resources have complete evidence cards.

## Source-impact audit

The machine-readable copy of this table is exported as the deeply frozen `agentHarness.sourceImpactAudit`. `adopted`, `corrected`, and `deepened` are material contributions; `rejected` and `duplicate` make non-use decisions auditable.

| Lesson | Source | Impact | Material change | Boundary kept |
| --- | --- | --- | --- | --- |
| `harness-01` | `res-harness-primary-feishu-beyond-model` | adopted | Reorganized the lesson around model proposal versus Harness execution authority. | Tool messages and product runtime behavior remain tied to current official documentation. |
| `harness-02` | `res-harness-primary-feishu-dynamic-workflow` | corrected | Replaced “save state and resume” with event history, control cursor, checkpoint, journaled replay, and crash gaps. | Teaching code does not prove atomic persistence or external exactly-once effects. |
| `harness-03` | `res-harness-primary-feishu-tool-truth` | deepened | Separated Tool Definition, model decision, host registry, policy, adapter, and result feedback. | MCP tool-message semantics now use the versioned official specification; product-specific tool behavior and application authorization still require their own current evidence. |
| `harness-03` | `res-harness-mcp-tools-spec` | corrected | Replaced the weak “some official source exists” proxy with versioned MCP evidence for `tools` capability, `tools/list`, `tools/call`, schemas, and client-server message flow. | The protocol does not grant application identity, resource authorization, business approval, policy enforcement, or side-effect safety. |
| `harness-04` | `res-harness-primary-feishu-virtual-filesystem` | adopted | Added VFS provider capability discovery, session namespaces, Files/Git/Bash scope, artifact promotion, and cleanup ownership. | A virtual filesystem is not itself a sandbox or a trust guarantee. |
| `harness-05` | `res-harness-primary-feishu-loop-engineering-intro` | corrected | Recast open and closed loops as feedback structures rather than reliability rankings, then placed both under hard budgets and stop guards. | Long-horizon reliability must be demonstrated by runtime evidence. |
| `harness-06` | `res-harness-primary-feishu-agent-version-drifting` | deepened | Extended resume checks to model, prompt, tool schema, policy, reducer, and dependency versions. | Dated examples do not guarantee current product compatibility. |
| `harness-07` | `res-harness-primary-feishu-react-orchestration` | adopted | Related workflow, graph, loop, parallel, pipeline, orchestration, queues, and HITL without erasing their control boundaries. | The taxonomy does not establish durability, queue, or recovery semantics. |
| `harness-08` | `res-harness-primary-feishu-agent-install-md` | deepened | Connected Install.md, Skills, Hooks, context offloading, artifacts, stop points, and handoff evidence. | Install.md is a suggested pattern, not a universal installation or trust protocol. |
| `harness-01` | `res-harness-primary-feishu-react-loop` | rejected | The source image was not copied; an original tool-transcript teaching diagram was drawn from verified relationships. | Access to source text is not media redistribution or modification permission. |
| `harness-07` | `res-harness-primary-javaguide-workflow-graph-loop` | duplicate | Retained the useful cross-structure comparison but did not count repeated navigation definitions as independent factual evidence. | Checkpoint, queue, concurrency, and recovery claims continue to use official implementation sources. |

## Reconstructed learning sequence

| Lesson | Reconstructed emphasis | Required concepts materially present |
| --- | --- | --- |
| `harness-01` | Model proposal versus Harness control; single, parallel, and multi-turn tool transcripts; guarded continuation and termination. | Runner, runtime, sandbox, run/attempt/step/session/call identity, Plan-then-Act briefing and nudge. |
| `harness-02` | Facts, projections, checkpoints, side-effect journal, single recovery lease, replay, and version migration. | Crash windows, checkpoint gaps, model/prompt/tool/reducer versions, safe resume. |
| `harness-03` | Discovery through result feedback with distinct governance layers. | Tool Definition versus host registry, sequential/parallel scheduling, authentication, authorization, capability, approval, MCP and Skills boundaries. |
| `harness-04` | Threat-model-driven execution stacks and capability-scoped VFS sessions. | Local Files/Git/Bash, sandbox stacks, remote provider, mount/network/secret/resource controls, official isolation caveats. |
| `harness-05` | Feedback-loop structure under shared hierarchical budgets. | Timeout, deadline, cancellation, late results, compensation, error taxonomy, bounded retry, stop points. |
| `harness-06` | Stable business intent, idempotency, journaled replay, reconciliation, and five evidence-driven recovery actions. | Unknown outcome, side-effect ledger, skip/retry/reconcile/manual/fail, version-safe resume. |
| `harness-07` | Control-structure selection followed by bounded durable scheduling. | Workflow, graph, loop, parallel, pipeline, orchestration, mechanical control versus model judgment, lease/ack/redelivery, backpressure. |
| `harness-08` | Long-horizon completion through context offloading and verifiable handoff. | Progressive disclosure, Install.md, Skills, Hooks, awaiting/blocked/failed/cancelled, artifact manifest, completion evidence, bridge to Context/RAG/Memory. |

## Manual semantic contribution review (60/30/10)

A substantive contribution is one independently teachable decision that changes a learner's mental model, engineering choice, failure diagnosis, or assessed deliverable. Repeated citations, source slots, resource count, paragraph length, and restated definitions do not create additional contribution units. The integration owner manually reread the eight finished notes and classified twenty equal-granularity decisions by the source family that materially shaped the teaching change; this is a semantic review, not an automated citation-count proxy.

| Classification | Units | Share | Human-reviewable decision ledger and rationale |
| --- | ---: | ---: | --- |
| Requested primary narratives | 12 | 60% | P01 model proposal versus Harness authority; P02 run/attempt/step/session/call transcript; P03 event/projection/checkpoint separation; P04 version-drift-aware resume; P05 Tool Definition versus host registry; P06 capability-scoped VFS sessions; P07 open/closed loops under one hard budget; P08 journaled replay and evidence-led recovery; P09 workflow/graph/loop/orchestration taxonomy; P10 context offloading; P11 Install.md/Skills/Hooks progressive disclosure; P12 evidence-bearing handoff. These are structural teaching changes derived from the frozen Feishu/JavaGuide narratives. |
| Official/academic verification | 6 | 30% | V01 current SDK run/HITL semantics; V02 durable event/checkpoint/replay boundaries; V03 MCP `tools` capability, `tools/list`, and `tools/call`; V04 container/gVisor/microVM isolation limits; V05 retry/idempotency/queue visibility semantics; V06 complete-mediation, least-authority, and overloading boundaries. These units correct or constrain primary narratives with versioned official, standards, security, or original engineering evidence. |
| Existing/other | 2 | 10% | O01 preservation of the existing ten-state lifecycle, three deterministic labs, and stable public IDs; O02 retained Chinese/community navigation and the existing interview scenarios as optional learning routes. These contribute compatibility and learning navigation, not new protocol or reliability facts. |
| **Total** | **20** | **100%** | **60/30/10 at the decision-unit level.** |

The ratio is intentionally approximate in prose: a primary-narrative decision may be narrowed by several official sources, and an official rule may support more than one paragraph. Classification follows the dominant origin of the material teaching change. The raw section/source-slot probe is therefore secondary traceability only and must not be interpreted as contribution weight.

## Per-lesson knowledge-note scores

Rubric columns are the exact 25/20/25/20/10 note categories: assessed-outcome coverage, knowledge structure and cross-lesson bridge, sources and uncertainty, teaching readability and examples, and copyright/data contract. Every score is based on the finished note rather than intended work; the automated resolution tests report zero broken source references.

| Lesson | Coverage /25 | Structure /20 | Sources /25 | Teaching /20 | Contract /10 | Total | Evidence and rationale |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `harness-01` | 24 | 19 | 23 | 19 | 10 | **95** | Six causal sections cover both objectives, two quizzes, three interviews, both exercise steps and both completion criteria; the two-plane model, transcript, state guard and worked lifecycle lab are source-bound and use stable plain-data IDs. One point is retained because hook behavior remains product-specific. |
| `harness-02` | 25 | 19 | 23 | 19 | 10 | **96** | Facts → projections → checkpoint gaps → versioned lease/replay → crash tests forms one recoverability chain and maps every assessment/deliverable. Official product semantics and the teaching journal are explicitly separated; no external exactly-once claim is made. |
| `harness-03` | 25 | 19 | 24 | 19 | 10 | **97** | All registry, control-layer, approval, TOCTOU, three-tool and defense outcomes resolve to six sections. The MCP paragraph now uses a versioned official MCP Tools specification in the exact section and visual, while course templates remain labeled as synthesis. |
| `harness-04` | 24 | 18 | 23 | 18 | 10 | **93** | Seven sections cover threat model, mechanism comparison, VFS, network, resource and cleanup decisions plus the full sandbox deliverable. Mechanism claims use official sources and repeatedly reject “container equals absolute sandbox”; a real browser sweep remains unavailable. |
| `harness-05` | 25 | 19 | 23 | 19 | 10 | **96** | The chapter distinguishes timeout/deadline/cancel/rollback, classifies errors, bounds amplification and ends with a concrete budget ledger and cancellation timeline. Vendor defaults are kept scoped rather than universalized. |
| `harness-06` | 25 | 19 | 24 | 19 | 10 | **97** | Stable business intent, atomic server dedupe, side-effect journal, five evidence decisions and five crash-point rehearsal teach all assessed recovery reasoning. The note distinguishes scheduling attempts from observable business effect. |
| `harness-07` | 25 | 18 | 23 | 19 | 10 | **95** | Concurrency layers, bounded durable queue, visibility/checkpoint/ack, cancellation and watermarks culminate in the required queue protocol and overload traces. SQS semantics remain explicitly provider-specific. |
| `harness-08` | 25 | 19 | 22 | 19 | 10 | **95** | State classification, durable approval, framework-aware resume, bundle construction, migration and refund handoff cover every objective and assessment. Community/navigation sources remain extension evidence and do not carry core resume or handoff guarantees. |

Release score result: all eight notes are at least 85/100; broken references `0`; course-field paths converted to resource evidence `0`; unresolved evidence roles `0`. The remaining limitation is the unavailable browser backend recorded below, not a broken data/source gate.

## Per-lesson visual teaching scores

The six columns use the exact visual rubric names and ten-point scale. Each category is at least 8 and every lesson total is at least 51/60.

| Lesson | Accuracy | Evidence boundaries | Teaching value | Accessibility | Responsive rendering | Fallback | Total | Lesson-specific evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `harness-01` | 9 | 10 | 10 | 9 | 8 | 10 | **56** | Control-plane overview, three-state real transcript and stop guard map responsibilities, identities and state decisions; the real step-control/fallback test advances all states and re-arms the image fallback. |
| `harness-02` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Layer, crash-gap and versioned-resume diagrams expose three different recovery questions with exact owner sections and fixture labels. |
| `harness-03` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Governance, four gates and approval-resume visuals map the registry, rejection and TOCTOU outcomes; the overview now includes the official MCP source inside the same owner. |
| `harness-04` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Threat boundary, mechanism comparison and scoped VFS show complementary boundary questions without claiming absolute security. |
| `harness-05` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Shared budget, time-control comparison and retry funnel make direction, ownership and amplification visible; fixture values are labeled as teaching examples. |
| `harness-06` | 9 | 10 | 10 | 9 | 8 | 9 | **55** | Intent identity, divergent local/remote journals and the five-action decision tree make the unknown-outcome recovery path materially inspectable. |
| `harness-07` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Orchestration map, queue lease lifecycle and watermarks cover selection, sequencing and overload control without erasing provider boundaries. |
| `harness-08` | 9 | 10 | 9 | 9 | 8 | 9 | **54** | Long-horizon state, progressive disclosure and bundle evidence link pause/release/handoff outcomes to exact assessment IDs. |

Shared scoring evidence: Accuracy is checked against the frozen fixture labels/values and strict static SVG parser. Evidence boundaries are validated across registry → lesson → evidence map → exact owner section with one placement per visual. Teaching value is tied to the inventory's cognitive question and real quiz/interview IDs. Accessibility uses nonduplicative `alt`, caption, ordered long description, semantic figure markup and keyboard step controls. Responsive rendering receives the honest lower score of 8 because static CSS/UI contracts cover 390px and 320px containment but the real browser backend was unavailable. Fallback is exercised through unknown/missing assets, prose-preserving diagnostics, reduced-motion CSS, and the real Harness step state test. Unresolved visuals `0`; non-original visuals `0`; permission blockers `0`.

## Assessment and outcome-to-section mapping

Paths such as `objectives[0]`, `exercise.steps[1]`, and `completionCriteria[0]` are course-field traceability, never source IDs. Quiz and interview IDs are stable public assessment IDs. Every mapped section is a real note section; the final column names representative source/visual support inside those sections.

| Lesson | Objectives → sections | Quiz → sections | Interview → sections | Exercise/deliverable → sections | Completion criteria → sections | Representative source and visual support |
| --- | --- | --- | --- | --- | --- | --- |
| `harness-01` | `objectives[0]` → `decision-and-control-planes`; `objectives[1]` → `normative-state-machine`, `hook-contracts` | `quiz-harness-01-1` → `decision-and-control-planes`; `quiz-harness-01-2` → `hook-contracts` | `iq-harness-01-1` → `decision-and-control-planes`; `iq-harness-01-2` → `normative-state-machine`; `iq-harness-01-3` → `hook-contracts` | `exercise.steps[0]` → `normative-state-machine`; `exercise.steps[1]` → `hook-contracts`; deliverable → `lifecycle-lab-deliverable` | `[0]` → `decision-and-control-planes`; `[1]` → `lifecycle-lab-deliverable` | `res-harness-openai-running`, `res-harness-openai-sandboxes`, `res-harness-primary-feishu-react-loop`; `visual-harness-01-control-system`, `visual-harness-01-tool-transcript`, `visual-harness-01-stop-guard` |
| `harness-02` | `[0]` → `separate-facts-projections-and-recovery-points`; `[1]` → `place-checkpoints-at-risk-boundaries`, `recover-with-a-single-lease-and-replay` | `quiz-harness-02-1` → `separate-facts-projections-and-recovery-points`; `quiz-harness-02-2` → `place-checkpoints-at-risk-boundaries` | `iq-harness-02-1` → `separate-facts-projections-and-recovery-points`; `iq-harness-02-2` → `place-checkpoints-at-risk-boundaries`; `iq-harness-02-3` → `recover-with-a-single-lease-and-replay` | step 0 → `design-a-versioned-persistence-model`, `commit-events-and-projections-atomically`; step 1/deliverable → `migrate-schemas-and-test-crash-windows` | `[0]` → `separate-facts-projections-and-recovery-points`; `[1]` → `place-checkpoints-at-risk-boundaries`, `migrate-schemas-and-test-crash-windows` | `res-harness-openai-run-state`, `res-harness-langgraph-persistence`, `res-harness-temporal-event`; `visual-harness-02-state-journal`, `visual-harness-02-checkpoint-gap`, `visual-harness-02-versioned-resume` |
| `harness-03` | `[0]` → `separate-model-catalog-from-host-registry`, `derive-policies-for-three-tool-intents`; `[1]` → `apply-four-distinct-control-layers`, `bind-intent-and-revalidate-after-wait` | `quiz-harness-03-1` → `apply-four-distinct-control-layers`; `quiz-harness-03-2` → `bind-intent-and-revalidate-after-wait` | `iq-harness-03-1` → `separate-model-catalog-from-host-registry`; `iq-harness-03-2` → `apply-four-distinct-control-layers`; `iq-harness-03-3` → `persist-approval-with-framework-aware-resume`, `bind-intent-and-revalidate-after-wait` | step 0 → `derive-policies-for-three-tool-intents`; step 1 → `bind-intent-and-revalidate-after-wait`; deliverable → `deliver-and-defend-the-policy-design` | `[0]` → `separate-model-catalog-from-host-registry`; `[1]` → `persist-approval-with-framework-aware-resume`, `deliver-and-defend-the-policy-design` | `res-harness-mcp-tools-spec`, `res-harness-openai-tools`, `res-harness-openai-hitl`, `res-harness-owasp-agency`; `visual-harness-03-tool-governance`, `visual-harness-03-control-gates`, `visual-harness-03-approval-resume` |
| `harness-04` | `[0]` → `compare-isolation-mechanisms`; `[1]` → `minimize-files-and-secrets`, `control-network-egress`, `enforce-resource-budgets` | `quiz-harness-04-1` → `compare-isolation-mechanisms`; `quiz-harness-04-2` → `start-from-a-threat-model`, `minimize-files-and-secrets` | `iq-harness-04-1` → `compare-isolation-mechanisms`; `iq-harness-04-2` → `minimize-files-and-secrets`, `control-network-egress`; `iq-harness-04-3` → `enforce-resource-budgets` | step 0 → `start-from-a-threat-model`; step 1 → `compare-isolation-mechanisms`, `minimize-files-and-secrets`, `control-network-egress`, `enforce-resource-budgets`; deliverable → `audit-and-tighten-a-code-sandbox` | `[0]` → `start-from-a-threat-model`, `compare-isolation-mechanisms`; `[1]` → `audit-and-tighten-a-code-sandbox` | `res-harness-openai-sandboxes`, `res-harness-gvisor`, `res-harness-docker-seccomp`, `res-harness-firecracker`; `visual-harness-04-sandbox-boundary`, `visual-harness-04-isolation-stack`, `visual-harness-04-vfs-session` |
| `harness-05` | `[0]` → `separate-timeout-deadline-cancel-and-rollback`; `[1]` → `classify-errors-before-choosing-actions`, `bound-retries-and-prevent-amplification` | `quiz-harness-05-1` → `separate-timeout-deadline-cancel-and-rollback`; `quiz-harness-05-2` → `classify-errors-before-choosing-actions` | `iq-harness-05-1` → `separate-timeout-deadline-cancel-and-rollback`; `iq-harness-05-2` → `classify-errors-before-choosing-actions`, `bound-retries-and-prevent-amplification`; `iq-harness-05-3` → `build-a-hierarchical-run-budget` | step 0 → `build-a-hierarchical-run-budget`; step 1 → `choose-policies-by-action-semantics`; deliverable → `deliver-a-budget-ledger-and-cancel-timeline` | `[0]` → `separate-timeout-deadline-cancel-and-rollback`; `[1]` → `bound-retries-and-prevent-amplification` | `res-harness-aws-timeouts`, `res-harness-temporal-retry`, `res-harness-sre-cascading`; `visual-harness-05-bounded-run`, `visual-harness-05-deadline-cancel`, `visual-harness-05-retry-budget` |
| `harness-06` | `[0]` → `bind-retries-to-business-intent`, `require-an-atomic-server-dedupe-contract`; `[1]` → `persist-intent-and-side-effect-ledger`, `resume-by-lease-evidence-and-five-decisions` | `quiz-harness-06-1` → `resume-by-lease-evidence-and-five-decisions`; `quiz-harness-06-2` → `require-an-atomic-server-dedupe-contract` | `iq-harness-06-1` → `bind-retries-to-business-intent`; `iq-harness-06-2` → `persist-intent-and-side-effect-ledger`, `resume-by-lease-evidence-and-five-decisions`; `iq-harness-06-3` → `require-an-atomic-server-dedupe-contract` | step 0 → `persist-intent-and-side-effect-ledger`; step 1 → `exercise-every-retry-resume-evidence-path`; deliverable → `prove-five-crash-points-with-one-ticket-intent` | `[0]` → `resume-by-lease-evidence-and-five-decisions`; `[1]` → `bind-retries-to-business-intent`, `require-an-atomic-server-dedupe-contract` | `res-harness-aws-idempotent`, `res-harness-temporal-event`, `res-harness-langgraph-fault-tolerance`; `visual-harness-06-idempotent-recovery`, `visual-harness-06-side-effect-journal`, `visual-harness-06-evidence-decision` |
| `harness-07` | `[0]` → `layer-concurrency-limits`; `[1]` → `design-a-bounded-durable-queue`, `consume-with-visibility-and-checkpoints`, `apply-backpressure-and-load-shedding` | `quiz-harness-07-1` → `consume-with-visibility-and-checkpoints`; `quiz-harness-07-2` → `apply-backpressure-and-load-shedding` | `iq-harness-07-1` → `layer-concurrency-limits`; `iq-harness-07-2` → `design-a-bounded-durable-queue`, `consume-with-visibility-and-checkpoints`; `iq-harness-07-3` → `apply-backpressure-and-load-shedding` | step 0 → `design-a-bounded-durable-queue`, `consume-with-visibility-and-checkpoints`; step 1 → `apply-backpressure-and-load-shedding`; deliverable → `deliver-the-queue-protocol` | `[0]` → `layer-concurrency-limits`; `[1]` → `interpret-the-queue-lab`, `deliver-the-queue-protocol` | `res-harness-aws-sqs-visibility`, `res-harness-sre-overload`, `res-harness-primary-feishu-react-orchestration`, `res-harness-primary-javaguide-workflow-graph-loop`; `visual-harness-07-orchestration-map`, `visual-harness-07-queue-lease`, `visual-harness-07-backpressure` |
| `harness-08` | `[0]` → `classify-waiting-and-terminal-states`, `persist-and-release-long-approvals`; `[1]` → `build-a-verifiable-handoff-bundle` | `quiz-harness-08-1` → `classify-waiting-and-terminal-states`; `quiz-harness-08-2` → `build-a-verifiable-handoff-bundle` | `iq-harness-08-1` → `classify-waiting-and-terminal-states`; `iq-harness-08-2` → `persist-and-release-long-approvals`, `respect-framework-resume-semantics`; `iq-harness-08-3` → `build-a-verifiable-handoff-bundle` | step 0 → `classify-waiting-and-terminal-states`, `persist-and-release-long-approvals`; step 1 → `build-a-verifiable-handoff-bundle`; deliverable → `rehearse-a-refund-approval-handoff` | `[0]` → `classify-waiting-and-terminal-states`; `[1]` → `build-a-verifiable-handoff-bundle`, `rehearse-a-refund-approval-handoff` | `res-harness-openai-hitl`, `res-harness-nist-tool-use`, `res-harness-primary-feishu-context-offloading`, `res-harness-primary-feishu-company-brain`; `visual-harness-08-long-horizon-handoff`, `visual-harness-08-progressive-disclosure`, `visual-harness-08-handoff-evidence` |

## Visual and permission audit

The inventory was frozen before asset production in `docs/research/2026-07-30-agent-harness-visual-inventory.md`. It records the cognitive question, owner section, source IDs, storyboard, fixture scope, permission decision, and production status for all 24 visuals.

| Lesson | Published | Overview | Section diagrams | Step diagrams | Third-party media |
| --- | ---: | ---: | ---: | ---: | ---: |
| `harness-01` | 3 | 1 | 2 | 1 with three states | 0 |
| `harness-02` | 3 | 1 | 2 | 0 | 0 |
| `harness-03` | 3 | 1 | 2 | 0 | 0 |
| `harness-04` | 3 | 1 | 2 | 0 | 0 |
| `harness-05` | 3 | 1 | 2 | 0 | 0 |
| `harness-06` | 3 | 1 | 2 | 0 | 0 |
| `harness-07` | 3 | 1 | 2 | 0 | 0 |
| `harness-08` | 3 | 1 | 2 | 0 | 0 |
| **Total** | **24** | **8** | **16** | **1 with three states** | **0** |

All assets use `original-synthesis`, `permission: null`, the credit `Agent Learner 原创教学图解`, and the verification date `2026-07-30`. No external image, screenshot, source figure, paper figure, or video frame is redistributed or adapted. State labels and the two small quantitative examples are frozen in `tests/fixtures/agent-harness-visual-fixtures.js`; the tests verify that fixture labels and values are actually present in the corresponding primary SVG. Every SVG has one title, one description, matching registry dimensions, local-only references, and no active content.

Each visual has exactly one note placement. Its source IDs must resolve through the global resource registry, belong to the owning lesson, carry an evidence card, and appear in the exact owner section. The direct module registry is merged into `src/data/visuals/index.js`; the shared duplicate-ID guard remains fail-closed. This is an evidence-based deviation from the initial “defer shared index integration” plan: real UI and global ownership tests demonstrated that unregistered placements render diagnostics and cannot be considered published.

## Verification evidence

The following commands were run from the isolated reconstruction worktree root on 2026-07-31. Each fenced block is the literal copy-pasteable command; counts are command results, not estimates.

### Focused, shared, full, and privacy contracts

```sh
node --test tests/agent-harness-data.test.js tests/agent-harness-primary-references.test.js tests/agent-harness-visual-data.test.js
```

Exit `0`: `25` tests, `25` pass, `0` fail/skipped. This includes the MCP section/source/platform/version contract and the inventory role/outcome/step-inheritance contract.

```sh
node --test tests/knowledge-visual-contract.test.js tests/knowledge-visual-ui.test.js tests/static-svg.test.js tests/guided-ui.test.js tests/visual-registry-ownership.test.js tests/static-app.test.js
```

Exit `0`: `110` tests, `110` pass, `0` fail/skipped.

```sh
npm test
```

Exit `0`: `523` tests, `523` pass, `0` fail/skipped.

```sh
node --test tests/primary-references.test.js
```

Exit `0`: `36` tests, `36` pass, `0` fail/skipped.

### JavaScript syntax

```sh
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
```

Exit `0`: no syntax diagnostics.

```sh
find src tests scripts -type f \( -name '*.js' -o -name '*.mjs' \) | wc -l
```

Exit `0`; exact trimmed output `123`, establishing the checked JavaScript/module file count.

### Harness SVG XML and static-security gates

```sh
find assets/visuals/agent-harness -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
```

Exit `0`: no XML diagnostics.

```sh
find assets/visuals/agent-harness -name '*.svg' | wc -l
```

Exit `0`; exact trimmed output `27`, establishing the Harness SVG count covered by the XML command.

```sh
node --test tests/agent-harness-visual-data.test.js tests/static-svg.test.js
```

Exit `0`: `14` tests, `14` pass, `0` fail/skipped. The Harness visual-data test resolves and applies `assertSafeStaticSvg` to every primary and step asset path, while the static-SVG suite exercises active-content, remote-reference, malformed-XML, IDREF, ARIA, and character-data rejection.

### Release-marker and remote-hotlink scans

```sh
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成](?:内容|章节|素材|图|项)|similar[[:space:]]+to' src/data/agent-harness.js src/data/agent-harness-notes src/data/visuals/agent-harness-visuals.js docs/content-audits/2026-07-30-agent-harness-primary-reference-reconstruction.md docs/research/2026-07-30-agent-harness-visual-inventory.md
```

Exit `1`, no output: `rg` found no unresolved release-marker match. The scoped `未完成…` form deliberately excludes legitimate lesson prose about an unfinished run or side effect.

```sh
rg -n "https?://[^\"'[:space:]]+\.(svg|png|jpe?g|webp)" src/data/agent-harness.js src/data/agent-harness-notes src/data/visuals/agent-harness-visuals.js assets/visuals/agent-harness
```

Exit `1`, no output: `rg` found no remote raster/SVG hotlink.

### Private-cache, full-range diff, branch, and worktree state

```sh
git check-ignore .research-cache/primary-references/manifest.json
```

Exit `0`; exact output `.research-cache/primary-references/manifest.json`.

```sh
git ls-files .research-cache
```

Exit `0`, no output: no private-cache file is tracked.

```sh
git diff --check 772dffbf968876289cd2c25b18c5216c06c54284..HEAD
```

Exit `0`, no output: the complete baseline-to-current-HEAD reconstruction range has no whitespace errors.

```sh
git branch --show-current
```

Exit `0`; exact output `feat/primary-reference-reconstruction`.

```sh
git status --short
```

Exit `0`, no output: the committed worktree is clean.

### Local route and asset smoke

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

The server emitted `Serving HTTP on 127.0.0.1 port 4173 (http://127.0.0.1:4173/) ...`.

```sh
printf '%s\n' http://127.0.0.1:4173/ http://127.0.0.1:4173/styles/app.css http://127.0.0.1:4173/src/app.js | xargs -n1 curl -sS -o /dev/null -w '%{url_effective} %{http_code}\n'
```

Exit `0`; exact output:

```text
http://127.0.0.1:4173/ 200
http://127.0.0.1:4173/styles/app.css 200
http://127.0.0.1:4173/src/app.js 200
```

Sending `Ctrl-C` to the server emitted `Keyboard interrupt received, exiting.` and the server process completed with exit `0`.

## Browser check record

A read-only local server was started with `python3 -m http.server 4173 --bind 127.0.0.1`. It emitted `Serving HTTP on 127.0.0.1 port 4173`; the route/assets smoke above then returned three HTTP `200` responses. The server was stopped with `Ctrl-C`, emitted `Keyboard interrupt received, exiting.`, and the process completed with exit code `0`.

For the required real-browser pass, the prescribed in-app browser runtime initialized, but browser discovery returned the exact empty result `agent.browsers.list() => []` after the documented bootstrap diagnostic. Because the browser-control contract forbids replacing an unavailable backend with an unrelated automation surface, no browser screenshot or manual viewport claim is fabricated.

The unavailable manual pass is covered, but not mislabeled as executed, by repository evidence: guided UI tests render the first, middle, and final Harness lessons without diagnostics; the real Harness three-step transcript advances through all states and re-arms its image fallback; shared UI tests cover fallback generation safety; static application tests cover 390px and 320px figure containment, touch-size controls, keyboard focus styling, forced colors, reduced motion, and print behavior; strict SVG checks parse all 27 assets. A browser backend remains useful for a final human visual sweep when one is available, but its absence did not leave a failing publication contract.
