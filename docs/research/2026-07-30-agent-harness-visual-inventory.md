# Agent Harness visual inventory

Status: verified production inventory
Frozen on: 2026-07-30
Scope: `harness-01` through `harness-08`

This inventory was frozen before any Agent Harness visual asset was created. Every selected visual is an original synthesis drawn from the cited lesson sources and the reconstructed note section that owns it. No third-party image, screenshot, paper figure, product UI, or video frame is selected for redistribution or adaptation; therefore every permission record is `not applicable`, every provenance value is `original-synthesis`, and every published item carries the credit `Agent Learner 原创教学图解`.

All state labels and quantitative values are frozen in `tests/fixtures/agent-harness-visual-fixtures.js`. Color is never the only encoding: state, trust, direction, rejection, and terminality are also expressed through labels, shapes, line styles, numbering, or boundary patterns.

| visualId | role | owner lesson / section | assessed outcomes | cognitive question and form | sourceIds | storyboard and fixture contract | permission decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `visual-harness-01-control-system` | `overview` | `harness-01 / decision-and-control-planes` | `quiz-harness-01-1`, `iq-harness-01-1` | Harness 怎样把模型提议变成受控执行？课程总览控制面图。 | `res-harness-openai-running`, `res-harness-openai-sandboxes`, `res-harness-primary-feishu-beyond-model`, `res-harness-primary-javaguide-harness-engineering` | Read 模型提议 → Runner → Policy → Runtime → Sandbox → Evidence；双线边界区分提议与执行权。Fixture freezes all visible state labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-01-tool-transcript` | `process` | `harness-01 / run-attempt-step-session` | `iq-harness-01-1`, `iq-harness-01-3` | 一次工具调用怎样跨 run、attempt、step、session 和 callId 保持身份？三步累积图。 | `res-harness-openai-sandboxes`, `res-harness-temporal-execution`, `res-harness-primary-feishu-react-loop` | Step 1 proposal, step 2 host execution, step 3 observation and next decision; each step preserves prior identifiers. Fixture freezes transcript labels and values. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-01-stop-guard` | `decision` | `harness-01 / normative-state-machine` | `quiz-harness-01-2`, `iq-harness-01-2` | continue 与 stop 怎样由状态、预算和证据共同裁决？状态门图。 | `res-harness-openai-running`, `res-harness-temporal-execution`, `res-harness-primary-feishu-react-loop` | Running enters guard; evidence, budget, approval and cancellation produce continue, wait, fail, complete, or cancel branches. Fixture freezes state labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-02-state-journal` | `overview` | `harness-02 / separate-facts-projections-and-recovery-points` | `quiz-harness-02-1`, `iq-harness-02-1` | event、projection、checkpoint 各保存什么？课程总览分层图。 | `res-harness-openai-run-state`, `res-harness-langgraph-persistence`, `res-harness-temporal-event`, `res-harness-primary-feishu-dynamic-workflow` | Immutable facts feed reducer projections; checkpoint stores cursor and versions; recovery replays from facts. Fixture freezes layer labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-02-checkpoint-gap` | `process` | `harness-02 / commit-events-and-projections-atomically` | `quiz-harness-02-2`, `iq-harness-02-2` | 崩溃发生在事件提交与 checkpoint 之间时怎样恢复？时间线。 | `res-harness-langgraph-persistence`, `res-harness-temporal-event`, `res-harness-primary-feishu-dynamic-workflow` | Intent → effect evidence → completion event → checkpoint; crash markers expose two gaps and replay choices. Fixture freezes event order. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-02-versioned-resume` | `decision` | `harness-02 / recover-with-a-single-lease-and-replay` | `quiz-harness-02-2`, `iq-harness-02-3` | 新 worker 怎样在版本漂移后安全接管？恢复门图。 | `res-harness-openai-run-state`, `res-harness-langgraph-persistence`, `res-harness-temporal-event`, `res-harness-primary-feishu-agent-version-drifting` | Acquire lease → compare model/prompt/tool/reducer versions → migrate or block → replay → verify projection. Fixture freezes gates and outcomes. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-03-tool-governance` | `overview` | `harness-03 / separate-model-catalog-from-host-registry` | `iq-harness-03-1` | Tool Definition、模型决策与宿主 registry 怎样分工？课程总览泳道图。 | `res-harness-openai-tools`, `res-harness-nist-tool-use`, `res-harness-primary-feishu-tool-truth`, `res-harness-primary-javaguide-mcp`, `res-harness-mcp-tools-spec` | Discovery catalog → model proposal → host registry lookup → policy → adapter/MCP boundary → result. Fixture freezes boundaries. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-03-control-gates` | `mechanism` | `harness-03 / apply-four-distinct-control-layers` | `quiz-harness-03-1`, `iq-harness-03-2` | Schema、authorization、approval、runtime validation 为什么不能合并？四门管线。 | `res-harness-openai-tools`, `res-harness-openai-hitl`, `res-harness-owasp-agency`, `res-harness-primary-feishu-tool-truth` | Proposed call crosses four numbered gates; every gate has an explicit rejection branch. Fixture freezes gate labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-03-approval-resume` | `process` | `harness-03 / persist-approval-with-framework-aware-resume` | `quiz-harness-03-2`, `iq-harness-03-3` | 批准绑定什么，恢复时又必须重验什么？暂停恢复图。 | `res-harness-openai-hitl`, `res-harness-langgraph-interrupts`, `res-harness-primary-feishu-claude-code-tools` | Normalize intent → persist digest → wait → decision → reacquire lease → revalidate → execute or re-request. Fixture freezes resume states. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-04-sandbox-boundary` | `overview` | `harness-04 / start-from-a-threat-model` | `quiz-harness-04-1`, `iq-harness-04-1` | 不可信代码从哪里进入，哪些能力必须被隔离？课程总览威胁边界图。 | `res-harness-openai-sandboxes`, `res-harness-primary-feishu-beyond-model`, `res-harness-primary-feishu-virtual-filesystem`, `res-harness-primary-javaguide-harness-engineering` | Untrusted code enters sandbox; filesystem, process, network, secrets and resources cross explicit capability gates; evidence exits separately. Fixture freezes zones. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-04-isolation-stack` | `comparison` | `harness-04 / compare-isolation-mechanisms` | `quiz-harness-04-1`, `iq-harness-04-1` | Process、container、gVisor 与 microVM 提供哪些不同边界？比较栈。 | `res-harness-gvisor`, `res-harness-docker-seccomp`, `res-harness-docker-rootless`, `res-harness-firecracker`, `res-harness-primary-feishu-virtual-filesystem` | Four columns compare kernel boundary, startup, density and remaining host controls without claiming absolute safety. Fixture freezes comparison labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-04-vfs-session` | `mechanism` | `harness-04 / minimize-files-and-secrets` | `quiz-harness-04-2`, `iq-harness-04-2` | VFS provider 怎样按 session 和 capability 暴露最小文件面？会话隔离图。 | `res-harness-openai-sandboxes`, `res-harness-docker-rootless`, `res-harness-primary-feishu-virtual-filesystem`, `res-harness-primary-javaguide-harness-engineering` | Session A and B each receive scoped Files/Git/Bash capabilities; secrets remain references; artifact export crosses a verification gate. Fixture freezes scope labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-05-bounded-run` | `overview` | `harness-05 / build-a-hierarchical-run-budget` | `iq-harness-05-3` | open loop 与 closed loop 怎样共享硬预算与停止证据？课程总览图。 | `res-harness-aws-timeouts`, `res-harness-sre-cascading`, `res-harness-primary-feishu-loop-engineering-intro`, `res-harness-primary-javaguide-loop-engineering` | Both loop forms feed the same hierarchical time, step, token, cost and side-effect ledger; neither rank implies reliability. Fixture freezes budgets. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-05-deadline-cancel` | `comparison` | `harness-05 / separate-timeout-deadline-cancel-and-rollback` | `quiz-harness-05-1`, `iq-harness-05-1` | timeout、deadline、cancel 与 rollback 的方向和效果有何不同？时间轴。 | `res-harness-aws-timeouts`, `res-harness-sre-cascading`, `res-harness-langgraph-fault-tolerance`, `res-harness-primary-feishu-loop-engineering-intro` | Local timeout, end-to-end deadline, cancellation propagation and independent compensation are shown as distinct events. Fixture freezes ordering. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-05-retry-budget` | `mechanism` | `harness-05 / bound-retries-and-prevent-amplification` | `quiz-harness-05-2`, `iq-harness-05-2` | 重试怎样消耗共享预算并避免层层放大？预算漏斗。 | `res-harness-temporal-retry`, `res-harness-langgraph-fault-tolerance`, `res-harness-aws-timeouts`, `res-harness-sre-cascading`, `res-harness-primary-javaguide-loop-engineering` | Three retry layers collapse into one owner and one attempt ledger with backoff, jitter, deadline and stop guard. Fixture freezes attempt counts. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-06-idempotent-recovery` | `overview` | `harness-06 / bind-retries-to-business-intent` | `quiz-harness-06-2`, `iq-harness-06-1` | intent、attempt、key 与 checkpoint 怎样共同决定安全重放？课程总览图。 | `res-harness-aws-idempotent`, `res-harness-primary-feishu-dynamic-workflow`, `res-harness-primary-javaguide-loop-engineering` | One intent owns one stable key across multiple attempts; journal and remote operation converge through reconciliation. Fixture freezes identity labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-06-side-effect-journal` | `process` | `harness-06 / persist-intent-and-side-effect-ledger` | `quiz-harness-06-1`, `iq-harness-06-2` | unknown outcome 出现时账本里应有哪些证据？双时间线。 | `res-harness-aws-idempotent`, `res-harness-langgraph-fault-tolerance`, `res-harness-temporal-event`, `res-harness-primary-feishu-dynamic-workflow` | Local intent/journal/checkpoint and remote operation timelines diverge at response loss, then reconnect through query evidence. Fixture freezes states. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-06-evidence-decision` | `decision` | `harness-06 / resume-by-lease-evidence-and-five-decisions` | `quiz-harness-06-1`, `iq-harness-06-3` | skip、retry、reconcile、manual、fail 分别需要什么证据？决策树。 | `res-harness-aws-idempotent`, `res-harness-langgraph-fault-tolerance`, `res-harness-temporal-event`, `res-harness-primary-feishu-agent-version-drifting` | Lease and evidence checks lead to five named outcomes; version mismatch blocks automatic replay. Fixture freezes decisions. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-07-orchestration-map` | `overview` | `harness-07 / layer-concurrency-limits` | `iq-harness-07-1` | workflow、graph、loop、parallel、pipeline 与 orchestration 怎样组合？课程总览地图。 | `res-harness-sre-overload`, `res-harness-agentscope-runtime`, `res-harness-primary-feishu-react-orchestration`, `res-harness-primary-javaguide-workflow-graph-loop` | Six control structures surround a shared orchestrator; model judgment enters only at semantic decision nodes. Fixture freezes structure labels. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-07-queue-lease` | `process` | `harness-07 / consume-with-visibility-and-checkpoints` | `quiz-harness-07-1`, `iq-harness-07-2` | receive、visibility、checkpoint、ack 与 redelivery 的顺序是什么？队列生命周期图。 | `res-harness-aws-sqs-visibility`, `res-harness-primary-feishu-react-orchestration` | Receive → lease → checkpoint/extend → completion fact → ack; lease expiry branches to redelivery and fencing. Fixture freezes states. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-07-backpressure` | `mechanism` | `harness-07 / apply-backpressure-and-load-shedding` | `quiz-harness-07-2`, `iq-harness-07-3` | soft/hard watermark 怎样把容量压力传回 producer？水位控制图。 | `res-harness-sre-overload`, `res-harness-sre-cascading`, `res-harness-primary-feishu-loop-engineering-intro` | Queue depth and oldest age cross soft then hard thresholds, triggering slow, degrade, reject, shed and staged recovery. Fixture freezes thresholds. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-08-long-horizon-handoff` | `overview` | `harness-08 / classify-waiting-and-terminal-states` | `quiz-harness-08-1`, `iq-harness-08-1` | 长任务如何停、卸载上下文并保留恢复入口？课程总览图。 | `res-harness-openai-hitl`, `res-harness-primary-feishu-context-offloading`, `res-harness-primary-feishu-microcompact`, `res-harness-primary-javaguide-context-engineering` | Active context offloads evidence and artifacts, then records waiting/blocked/failed/cancelled with allowed next actions. Fixture freezes states. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-08-progressive-disclosure` | `process` | `harness-08 / persist-and-release-long-approvals` | `quiz-harness-08-1`, `iq-harness-08-2` | Install.md、Skill 与 Hook 怎样按需加载并强制边界？渐进披露图。 | `res-harness-openai-hitl`, `res-harness-primary-feishu-agent-install-md`, `res-harness-primary-javaguide-agent-skills`, `res-harness-primary-feishu-beyond-model` | Compact catalog → Install contract → selected Skill → lifecycle Hook → approval checkpoint; irrelevant detail remains unloaded. Fixture freezes layers. | Original synthesis; no third-party media selected. | verified |
| `visual-harness-08-handoff-evidence` | `mechanism` | `harness-08 / build-a-verifiable-handoff-bundle` | `quiz-harness-08-2`, `iq-harness-08-3` | 陌生接管者如何从 bundle 验证状态与产物？证据包图。 | `res-harness-nist-tool-use`, `res-harness-primary-feishu-context-offloading`, `res-harness-primary-feishu-company-brain`, `res-harness-primary-javaguide-context-engineering` | Bundle links goal, state, event cursor, approvals, side-effect ledger, artifact manifest, hashes and next action; takeover verifies each reference. Fixture freezes fields. | Original synthesis; no third-party media selected. | verified |

## Fixture and publication identity

The table below is the exact fixture/publication contract for every main registry record. `published` means the same object identity is present in `src/data/visuals/index.js`, not merely that an SVG exists on disk.

| visualId | fixtureId | publicationStatus |
| --- | --- | --- |
| `visual-harness-01-control-system` | `fixture-harness-01-control-system` | `published` |
| `visual-harness-01-tool-transcript` | `fixture-harness-01-tool-transcript` | `published` |
| `visual-harness-01-stop-guard` | `fixture-harness-01-stop-guard` | `published` |
| `visual-harness-02-state-journal` | `fixture-harness-02-state-journal` | `published` |
| `visual-harness-02-checkpoint-gap` | `fixture-harness-02-checkpoint-gap` | `published` |
| `visual-harness-02-versioned-resume` | `fixture-harness-02-versioned-resume` | `published` |
| `visual-harness-03-tool-governance` | `fixture-harness-03-tool-governance` | `published` |
| `visual-harness-03-control-gates` | `fixture-harness-03-control-gates` | `published` |
| `visual-harness-03-approval-resume` | `fixture-harness-03-approval-resume` | `published` |
| `visual-harness-04-sandbox-boundary` | `fixture-harness-04-sandbox-boundary` | `published` |
| `visual-harness-04-isolation-stack` | `fixture-harness-04-isolation-stack` | `published` |
| `visual-harness-04-vfs-session` | `fixture-harness-04-vfs-session` | `published` |
| `visual-harness-05-bounded-run` | `fixture-harness-05-bounded-run` | `published` |
| `visual-harness-05-deadline-cancel` | `fixture-harness-05-deadline-cancel` | `published` |
| `visual-harness-05-retry-budget` | `fixture-harness-05-retry-budget` | `published` |
| `visual-harness-06-idempotent-recovery` | `fixture-harness-06-idempotent-recovery` | `published` |
| `visual-harness-06-side-effect-journal` | `fixture-harness-06-side-effect-journal` | `published` |
| `visual-harness-06-evidence-decision` | `fixture-harness-06-evidence-decision` | `published` |
| `visual-harness-07-orchestration-map` | `fixture-harness-07-orchestration-map` | `published` |
| `visual-harness-07-queue-lease` | `fixture-harness-07-queue-lease` | `published` |
| `visual-harness-07-backpressure` | `fixture-harness-07-backpressure` | `published` |
| `visual-harness-08-long-horizon-handoff` | `fixture-harness-08-long-horizon-handoff` | `published` |
| `visual-harness-08-progressive-disclosure` | `fixture-harness-08-progressive-disclosure` | `published` |
| `visual-harness-08-handoff-evidence` | `fixture-harness-08-handoff-evidence` | `published` |

## Step-state inheritance

These three SVG files are renderer states of one parent registry visual, not independent published visuals. They inherit the parent outcomes and use explicit visible-text fixture labels.

| step asset | parent visualId | inherited assessed outcomes | expected visible labels |
| --- | --- | --- | --- |
| `assets/visuals/agent-harness/harness-01-tool-transcript-step-1.svg` | `visual-harness-01-tool-transcript` | `iq-harness-01-1`, `iq-harness-01-3` | `STEP 1 · PROPOSAL`, `RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9`, `MODEL PROPOSAL` |
| `assets/visuals/agent-harness/harness-01-tool-transcript-step-2.svg` | `visual-harness-01-tool-transcript` | `iq-harness-01-1`, `iq-harness-01-3` | `STEP 2 · EXECUTION`, `RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9 · SESSION sbx-7`, `HOST EXECUTION` |
| `assets/visuals/agent-harness/harness-01-tool-transcript-step-3.svg` | `visual-harness-01-tool-transcript` | `iq-harness-01-1`, `iq-harness-01-3` | `STEP 3 · OBSERVATION`, `RUN run-42 · ATTEMPT 2 · STEP 3 · CALL call-9 · SESSION sbx-7`, `OBSERVATION`, `Harness uses the observation to continue, wait or stop` |

## Non-selected media candidates

This declaration makes a media-only non-use decision distinguishable from disposition of the source narrative.

| mediaCandidateId | lessonId | resourceId | decisionId | status |
| --- | --- | --- | --- | --- |
| `feishu-react-loop-source-image` | `harness-01` | `res-harness-primary-feishu-react-loop` | `impact-harness-01-react-loop-media` | `rejected-media-only` |

## Coverage and production gate

| lesson | total | overview | mechanism/process | boundary/decision/comparison | verified | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `harness-01` | 3 | 1 | 2 | 2 | 3 | 0 |
| `harness-02` | 3 | 1 | 3 | 1 | 3 | 0 |
| `harness-03` | 3 | 1 | 3 | 2 | 3 | 0 |
| `harness-04` | 3 | 1 | 2 | 3 | 3 | 0 |
| `harness-05` | 3 | 1 | 3 | 2 | 3 | 0 |
| `harness-06` | 3 | 1 | 3 | 2 | 3 | 0 |
| `harness-07` | 3 | 1 | 3 | 1 | 3 | 0 |
| `harness-08` | 3 | 1 | 3 | 2 | 3 | 0 |
| **Total** | **24** | **8** | **22** | **15** | **24** | **0** |

Production may proceed only if the direct module registry validates every record, each visual has exactly one owner placement, all sources stay inside both the owning lesson and section, every local asset passes the strict SVG parser, fixture labels match rendered labels, and the global visual registry reports no duplicate IDs. The 24 records are currently published through `src/data/visuals/index.js`; this shared-index integration was the authorized evidence-based deviation required for real rendering and global ownership validation.
