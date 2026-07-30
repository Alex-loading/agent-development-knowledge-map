# Agent Harness primary-reference reconstruction audit

- Audit date: 2026-07-30
- Module: `agent-harness`
- Compatibility boundary: eight existing lesson IDs, sixteen quiz IDs, twenty-four interview IDs, and the three existing experiment mappings are unchanged
- Resource result: 29 verified legacy resources retained, 23 primary-reference bindings appended, 52 total resources
- Visual result: 24 published teaching visuals, three per lesson and exactly one overview per lesson; 27 local SVG assets including three step states
- Publication state: source, note, visual, ownership, UI, and full regression contracts pass; browser backend availability is recorded separately below

## Reconstruction inputs

Every new primary narrative is created through `createPrimaryReferenceBinding`; no title, canonical URL, author, source tier, or source-family string is retyped into the Harness registry.

| Family | Count | Frozen canonical source IDs |
| --- | ---: | --- |
| Feishu Harness 101 | 15 | `primary-feishu-react-loop`, `primary-feishu-beyond-model`, `primary-feishu-loop-engineering-intro`, `primary-feishu-react-orchestration`, `primary-feishu-dynamic-workflow`, `primary-feishu-agent-version-drifting`, `primary-feishu-tool-truth`, `primary-feishu-company-brain`, `primary-feishu-context-offloading`, `primary-feishu-microcompact`, `primary-feishu-virtual-filesystem`, `primary-feishu-claude-code-tools`, `primary-feishu-claude-ai-memory`, `primary-feishu-autonomous-evolution`, `primary-feishu-agent-install-md` |
| JavaGuide AI | 8 | `primary-javaguide-agent-basis`, `primary-javaguide-harness-engineering`, `primary-javaguide-agent-skills`, `primary-javaguide-mcp`, `primary-javaguide-workflow-graph-loop`, `primary-javaguide-loop-engineering`, `primary-javaguide-context-engineering`, `primary-javaguide-ai-application-architecture` |

Feishu bindings use `expert` authority and explicitly identify the material as teaching observation, narrative, or engineering deduction rather than product, protocol, runtime, or safety guarantees. JavaGuide supplies systematic cross-reference structure. Sections containing product, SDK, API, protocol, OpenAI, LangGraph, Temporal, Claude, or MCP claims retain an official verification source inside the same owning section. All 52 resources have complete evidence cards.

## Source-impact audit

The machine-readable copy of this table is exported as the deeply frozen `agentHarness.sourceImpactAudit`. `adopted`, `corrected`, and `deepened` are material contributions; `rejected` and `duplicate` make non-use decisions auditable.

| Lesson | Source | Impact | Material change | Boundary kept |
| --- | --- | --- | --- | --- |
| `harness-01` | `res-harness-primary-feishu-beyond-model` | adopted | Reorganized the lesson around model proposal versus Harness execution authority. | Tool messages and product runtime behavior remain tied to current official documentation. |
| `harness-02` | `res-harness-primary-feishu-dynamic-workflow` | corrected | Replaced “save state and resume” with event history, control cursor, checkpoint, journaled replay, and crash gaps. | Teaching code does not prove atomic persistence or external exactly-once effects. |
| `harness-03` | `res-harness-primary-feishu-tool-truth` | deepened | Separated Tool Definition, model decision, host registry, policy, adapter, and result feedback. | MCP lifecycle and normative protocol fields still require official specification evidence. |
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

| Check | Result |
| --- | --- |
| Primary reconstruction plus existing Harness data | `17/17` passed |
| Direct Harness visual registry, ownership, SVG, fixture, deep-freeze, real step-control and fallback suite | `6/6` passed |
| Combined Harness source, data, and visual focused suite | `23/23` passed |
| Guided UI, shared ownership, static release guide, and visual integration slice | `49/49` passed before the additional real Harness step-control case; the case itself also passes in the direct visual suite |
| Full repository `npm test` | `521/521` passed |
| JavaScript syntax and patch whitespace | all checked files passed `node --check`; `git diff --check` passed |

## Browser check record

A read-only local server was started at `http://127.0.0.1:4173/` for the required real-browser pass. The prescribed in-app browser runtime initialized, but browser discovery returned an empty backend list after the documented bootstrap diagnostic. Because the browser-control contract forbids replacing an unavailable backend with an unrelated automation surface, no browser screenshot or manual viewport claim is fabricated.

The unavailable manual pass is covered, but not mislabeled as executed, by repository evidence: guided UI tests render the first, middle, and final Harness lessons without diagnostics; the real Harness three-step transcript advances through all states and re-arms its image fallback; shared UI tests cover fallback generation safety; static application tests cover 390px and 320px figure containment, touch-size controls, keyboard focus styling, forced colors, reduced motion, and print behavior; strict SVG checks parse all 27 assets. A browser backend remains useful for a final human visual sweep when one is available, but its absence did not leave a failing publication contract.
