# Context、RAG 与记忆 Visual Inventory

日期：2026-07-30

本清单由 production scene registry 纯派生：24 个主视觉与 3 个 step-state SVG 均为 Agent Learner 原创综合图，provenance 为 `original-synthesis`，credit 为 `Agent Learner 原创教学图解`。颜色不是唯一编码；typed flow/table/chart/decision scene 明确保存关系、方向、分支、指标绑定、排除和失败语义。

飞书与 JavaGuide 页面中的插图没有经过可再分发许可核验，因此没有复制、截图、描摹或改编任何第三方媒体。页面正文只作为课程叙事来源；全部视觉从已核验关系和课程 production scene 原创重绘。

| visualId | role | owner lesson / section | assessed outcomes | assessed coverage | assessed outcome criteria | cognitive question and form | sourceIds | storyboard and fixture contract | permission decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `visual-context-01-object-map` | `overview` | `context-01 / five-information-objects` | `quiz-context-01-1`, `iq-context-01-1` | `object-boundaries`, `projection` | 能按 owner、scope、lifecycle 与投影条件区分五类对象。 | 五类信息为何不能都叫 memory？关系总览图。 | `res-context-primary-javaguide-context`, `res-context-primary-feishu-beyond-model` | 五个对象围绕 prompt；state、corpus evidence 与 memory 只有经选择的投影进入窗口，checkpoint 明确落入非直接可见分支。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-01-projection-lifecycle` | `process` | `context-01 / projection-pipeline` | `iq-context-01-3` | `projection`, `evidence-provenance` | 能从 prompt item 反向追踪到状态事件或源版本，并解释排除原因。 | 后端对象怎样变成本轮输入？投影流程图。 | `res-context-anthropic-engineering`, `res-context-primary-feishu-context-offloading` | 对象依次通过有效性、权限、相关性与预算门，included 进入 manifest，invalid、denied 与 over-budget 分别进入 excluded reasons。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-01-offloading-boundary` | `boundary` | `context-01 / scope-lifecycle-ownership` | `quiz-context-01-2` | `offloading`, `recoverability` | 能说明外置细节的引用、权限、回取和 unavailable 失败边界。 | 哪些内容留在活动上下文，哪些可外置？边界图。 | `res-context-primary-feishu-context-offloading`, `res-context-primary-javaguide-context` | 活动上下文只留最小集与恢复指针；指针携带 URI、hash 与 ACL 穿过 read boundary，核验失败明确转入 unavailable。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-02-token-budget` | `overview` | `context-02 / context-engineering-budget` | `iq-context-02-1` | `context-budget` | 能用守恒式核对输入分桶与输出预留，而不把 fixture 比例当通用值。 | 8192 token 怎样分给六类内容？预算条图。 | `res-context-primary-javaguide-context`, `res-context-anthropic-engineering` | 一条具名 series 把六个预算桶与 remaining 绑定到各自数值，纵轴上限固定 8192，并明确总窗口 W=8192。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-02-overflow-strategies` | `comparison` | `context-02 / two-overflow-modes` | `iq-context-02-2` | `overflow-strategies`, `lossy-compaction`, `offloading` | 能比较 selection、compression、offloading、reset 的损失与恢复条件。 | 超限时四类策略各牺牲什么？比较表。 | `res-context-anthropic-engineering`, `res-context-primary-javaguide-context` | 四个策略逐行绑定保留对象、损失与恢复入口，避免把策略名画成没有可比维度的卡片。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-02-injection-loss-guard` | `decision` | `context-02 / required-and-output-reserve` | `quiz-context-02-2` | `assembly-guards`, `context-budget` | 能在 required 超限、提示注入或压缩缺失高风险字段时选择显式失败或回取。 | 组装器何时 include、exclude、fail 或回取？决策树。 | `res-context-anthropic-engineering`, `res-context-primary-javaguide-context` | 来源边界、requiredCost 与细节核验依次形成 YES/NO 分支，最终落到 include、exclude、unassemblable 或 retrieve-original。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-03-event-state-summary` | `overview` | `context-03 / three-conversation-representations` | `quiz-context-03-1`, `iq-context-03-1` | `conversation-representations` | 能区分事件证据、当前规范状态和有损摘要的职责。 | Transcript、state、summary 如何派生又不互相冒充？三层图。 | `res-context-primary-javaguide-memory`, `res-context-primary-feishu-prompt-memory` | 事件经 reducer 生成 canonical state，并另行派生 lossy summary；两条派生链都保留 source pointers 回到事件证据。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-03-compaction-loss` | `process` | `context-03 / summary-is-lossy` | `iq-context-03-2` | `lossy-compaction`, `recoverability` | 能量化压缩前后信息损失，并用 source pointer 核验数字、否定与工具状态。 | 压缩删掉了什么，怎样恢复核验？三步趋势图。 | `res-context-openai-compaction`, `res-context-primary-feishu-microcompact` | token-count series 从 1200 降到 420；checkpoint 绑定 3 retained 与 2 lost，verify 绑定 source pointer 和 unavailable 分支。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-03-recoverability-chain` | `mechanism` | `context-03 / supersession-and-conflict` | `quiz-context-03-2`, `iq-context-03-3` | `supersession`, `recoverability` | 能用 supersession 保留新旧事实来源且只投影当前值。 | 一次用户纠正怎样贯穿 event、state 和 summary？机制链。 | `res-context-primary-javaguide-memory`, `res-context-primary-feishu-prompt-memory` | e17 旧事实与 e24 纠正分别连接旧值和新值；supersededBy 保留历史关系，current projection 纳入新值并排除旧值。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-04-ingestion-pipeline` | `overview` | `context-04 / separate-source-retrieval-and-citation-units` | `iq-context-04-3` | `ingestion-pipeline`, `citation-units` | 能列出摄取七阶段并保持 documentId、version、ACL、hash 与 span。 | 原件怎样成为可搜索且可引用的派生索引？管线总览。 | `res-context-primary-javaguide-rag`, `res-context-primary-javaguide-document-processing` | acquire 到 index 七阶段按序连接；跨行的 CHUNK→METADATA 仍是显式 edge，并携带 documentId、version、ACL 与 span。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-04-chunk-strategies` | `comparison` | `context-04 / chunk-by-structure-and-answer-needs` | `iq-context-04-1` | `chunk-strategy`, `citation-units` | 能按召回、重复、上下文与引用定位比较四种切分策略。 | 同一文档用四种 chunking 会发生什么？比较表。 | `res-context-primary-javaguide-document-processing`, `res-context-dpr` | 固定、结构、语义和父子块逐行绑定 boundary、recall、context 与 citation 指标，不把策略名称当作无关系卡片。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-04-version-acl-delete` | `process` | `context-04 / propagate-version-permission-and-validity` | `quiz-context-04-2`, `iq-context-04-2` | `version-acl-propagation` | 能证明新版本发布与旧版本撤权传播到 chunk、index、cache 和 alias。 | 正文更新为何还不是索引更新？传播流程图。 | `res-context-openai-retrieval`, `res-context-primary-feishu-company-brain` | SOURCE v3 与 REVOKE v2 分别以 version/ACL 和 tombstone 进入 chunks，再按 index、cache、alias 到 publish gate 的顺序传播。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-05-hybrid-signals` | `overview` | `context-05 / start-with-complementary-retrieval-signals` | `quiz-context-05-1`, `iq-context-05-1` | `hybrid-retrieval` | 能说明编号查询与语义改写为何需要互补候选通道。 | Sparse 和 dense 分别看见查询的哪部分？分支融合图。 | `res-context-beir`, `res-context-primary-javaguide-rag-optimization` | ZX-17 精确词分支进入 sparse/exact-term，energy-saver 语义分支进入 dense/semantic-match，两路再汇入 hybrid fusion。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-05-rrf-fusion` | `mechanism` | `context-05 / fuse-ranks-without-mixing-score-scales` | `iq-context-05-1` | `rank-fusion`, `hybrid-retrieval` | 能按 k=60 计算名次贡献，且不混加不同尺度的原始分数。 | 两路名次怎样用 RRF 合并？逐文档计算表。 | `res-context-rrf`, `res-context-primary-javaguide-rag-optimization` | doc-A、doc-B、doc-C 分别绑定 sparse/dense rank、两路倒数贡献与 total；footer 展开 doc-B 的 0.0325 算式。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-05-ann-tradeoff` | `comparison` | `context-05 / evaluate-methods-on-real-query-slices` | `quiz-context-05-2`, `iq-context-05-3` | `ann-tradeoffs`, `retrieval-evaluation` | 能共同比较 ANN recall、p95 latency、内存与更新成本。 | 更深 ANN 搜索带来哪些联动代价？指标绑定表。 | `res-context-primary-javaguide-vector-store`, `res-context-beir` | FAST、BALANCED、DEEP 三行分别绑定 recall@10、p95 latency、memory 与 update cost；每个值只属于对应配置和指标列。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-06-candidate-evidence-pipeline` | `overview` | `context-06 / turn-recalled-items-into-evidence-candidates` | `quiz-context-06-1`, `iq-context-06-1` | `candidate-pipeline`, `reranking` | 能解释候选在哪一层被过滤、重排、去重或预算排除。 | 20 个候选怎样变成 4 条证据？漏斗趋势图。 | `res-context-rag-paper`, `res-context-primary-javaguide-rag-optimization` | candidate-count series 按 20→14→8→6→4 绑定候选、过滤、重排、去重和打包阶段，packed 点明确标注 evidence packet。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-06-rerank-dedup-diversity` | `process` | `context-06 / select-diverse-evidence-under-a-budget` | `iq-context-06-1`, `iq-context-06-2` | `reranking`, `dedup-diversity` | 能区分 rerank、版本去重和方面多样性的不同作用。 | 排序变化后为何仍需去重和多样性？前后比较表。 | `res-context-contextual-retrieval`, `res-context-primary-javaguide-rag-optimization` | 每个候选绑定 before/after rank、dedup decision 与 coverage；duplicate 和 superseded-version 分别排除，保留 amount、exception、approval。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-06-provenance-packing` | `mechanism` | `context-06 / build-an-evidence-packet-and-citation-manifest` | `quiz-context-06-2`, `iq-context-06-3` | `evidence-provenance`, `citation-grounding` | 能把 citationId 映射到真实 observation、callId、hash、source version 与 span。 | 证据包怎样同时保留工具真相和引用来源？来源链。 | `res-context-openai-citations`, `res-context-primary-feishu-tool-truth` | 宿主 observation 依次绑定 call-9、result hash 8f31、source v4 span 18–27、1500-token packet 和 citation manifest。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-07-memory-lifecycle` | `overview` | `context-07 / separate-memory-from-history` | `quiz-context-07-1`, `iq-context-07-1` | `memory-lifecycle`, `memory-admission` | 能把候选准入、active ledger、bounded recall 与三类失效串成生命周期。 | 长期记忆从哪里来，又怎样停止召回？生命周期图。 | `res-context-primary-javaguide-memory`, `res-context-primary-feishu-company-brain` | candidate 经过 admission 写入 active memory，经 subject/scope bounded projection 使用；active 可分支到 superseded、expired 或 deleted。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-07-admission-conflict` | `decision` | `context-07 / choose-write-path-and-admission` | `quiz-context-07-1`, `iq-context-07-1` | `memory-admission`, `consent-boundary` | 能把 salience 与 consent、confidence、sensitivity 和 scope 分开裁决。 | 什么候选可以 store、reject、no-op 或 supersede？治理决策树。 | `res-context-langchain-memory`, `res-context-primary-javaguide-memory` | subject/scope、sensitivity、consent、confidence 逐级作为治理 decision；existing-value 分支再区分 none、unchanged 和 corrected，落到四类 action。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-07-decay-delete` | `process` | `context-07 / expire-supersede-and-delete` | `quiz-context-07-2`, `iq-context-07-3` | `memory-decay`, `ttl-expiry`, `memory-supersession`, `memory-deletion` | 能区分 relevance decay、TTL、supersession、delete 及其传播承诺。 | 记忆变旧、过期、更正和删除有什么不同？双 series 时间线。 | `res-context-memorybank`, `res-context-openai-data`, `res-context-primary-javaguide-memory` | relevance series 绑定 1.00→0.65→0.20；state-boundaries series 分别绑定 TTL stop-recall、superseded use-new-value 与 delete 的 store/index/cache/projection 传播。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-08-integrated-flow` | `overview` | `context-08 / separate-five-system-objects` | `iq-context-08-3` | `integrated-architecture`, `rag-finetuning-memory` | 能画出 source 到 answer 的 owners、versions、projections 与反向 citation。 | RAG、state 与 memory 怎样汇合而不混存？综合流图。 | `res-context-primary-javaguide-rag`, `res-context-primary-feishu-company-brain` | source 经 ingestion、retrieval、evidence 进入 prompt；state 和 memory 独立投影汇入 prompt，answer citation 再反向连接 source span。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-08-graphrag-update-boundary` | `comparison` | `context-08 / contract-source-through-index` | `quiz-context-08-2`, `iq-context-08-2` | `graphrag-routing`, `knowledge-update` | 能按查询类型选择 GraphRAG 分支，并按变更类型选择增量更新或全量重建。 | GraphRAG 何时用，更新何时重建？边界矩阵。 | `res-context-primary-javaguide-graphrag`, `res-context-primary-javaguide-rag-update` | lookup 与 relationship query 分别绑定 sparse+dense 与 GraphRAG；content change 与 schema change 分别绑定 incremental update 与 full rebuild，并共享 ACL/source-span gates。 | Original synthesis; no third-party media selected. | verified |
| `visual-context-08-layered-diagnosis` | `decision` | `context-08 / diagnose-by-layered-falsification` | `quiz-context-08-1`, `iq-context-08-1` | `layered-diagnosis` | 能沿七层集合差找到首次失真点，而不是无界扩大 top-k。 | 正确证据在哪一层首次消失？分层决策树。 | `res-context-ragas`, `res-context-primary-javaguide-rag-update` | ingestion、retrieval、rerank、packing、generation、memory-write、freshness 逐层判断；fixture 在 packing 的 NO·4 分支标记 first distortion。 | Original synthesis; no third-party media selected. | verified |

## Fixture and publication identity

`published` 表示主记录以相同对象身份进入 `src/data/visuals/index.js`；不是只在磁盘上存在同名文件。

| visualId | fixtureId | publicationStatus |
| --- | --- | --- |
| `visual-context-01-object-map` | `fixture-context-01-object-map` | `published` |
| `visual-context-01-projection-lifecycle` | `fixture-context-01-projection-lifecycle` | `published` |
| `visual-context-01-offloading-boundary` | `fixture-context-01-offloading-boundary` | `published` |
| `visual-context-02-token-budget` | `fixture-context-02-token-budget` | `published` |
| `visual-context-02-overflow-strategies` | `fixture-context-02-overflow-strategies` | `published` |
| `visual-context-02-injection-loss-guard` | `fixture-context-02-injection-loss-guard` | `published` |
| `visual-context-03-event-state-summary` | `fixture-context-03-event-state-summary` | `published` |
| `visual-context-03-compaction-loss` | `fixture-context-03-compaction-loss` | `published` |
| `visual-context-03-recoverability-chain` | `fixture-context-03-recoverability-chain` | `published` |
| `visual-context-04-ingestion-pipeline` | `fixture-context-04-ingestion-pipeline` | `published` |
| `visual-context-04-chunk-strategies` | `fixture-context-04-chunk-strategies` | `published` |
| `visual-context-04-version-acl-delete` | `fixture-context-04-version-acl-delete` | `published` |
| `visual-context-05-hybrid-signals` | `fixture-context-05-hybrid-signals` | `published` |
| `visual-context-05-rrf-fusion` | `fixture-context-05-rrf-fusion` | `published` |
| `visual-context-05-ann-tradeoff` | `fixture-context-05-ann-tradeoff` | `published` |
| `visual-context-06-candidate-evidence-pipeline` | `fixture-context-06-candidate-evidence-pipeline` | `published` |
| `visual-context-06-rerank-dedup-diversity` | `fixture-context-06-rerank-dedup-diversity` | `published` |
| `visual-context-06-provenance-packing` | `fixture-context-06-provenance-packing` | `published` |
| `visual-context-07-memory-lifecycle` | `fixture-context-07-memory-lifecycle` | `published` |
| `visual-context-07-admission-conflict` | `fixture-context-07-admission-conflict` | `published` |
| `visual-context-07-decay-delete` | `fixture-context-07-decay-delete` | `published` |
| `visual-context-08-integrated-flow` | `fixture-context-08-integrated-flow` | `published` |
| `visual-context-08-graphrag-update-boundary` | `fixture-context-08-graphrag-update-boundary` | `published` |
| `visual-context-08-layered-diagnosis` | `fixture-context-08-layered-diagnosis` | `published` |

## Step-state inheritance

下列三个文件是一个主视觉的 renderer states，不是额外发布记录。它们继承父视觉的考核结果，并以 production step scene 的可见文本验证信息损失和恢复边界。

| step asset | parent visualId | inherited assessed outcomes | expected visible labels |
| --- | --- | --- | --- |
| `assets/visuals/context-rag-memory/context-03-compaction-loss-step-1.svg` | `visual-context-03-compaction-loss` | `iq-context-03-2` | `STEP 1 · BEFORE`, `1200 TOKENS`, `5 HIGH-RISK FIELDS` |
| `assets/visuals/context-rag-memory/context-03-compaction-loss-step-2.svg` | `visual-context-03-compaction-loss` | `iq-context-03-2` | `STEP 2 · CHECKPOINT`, `420 TOKENS`, `3 RETAINED · 2 LOST` |
| `assets/visuals/context-rag-memory/context-03-compaction-loss-step-3.svg` | `visual-context-03-compaction-loss` | `iq-context-03-2` | `SOURCE POINTER AVAILABLE?`, `RETRIEVE ORIGINAL`, `UNAVAILABLE` |

## Rights and media decisions

| asset scope | provenance | creator | redistribution basis | third-party media decision |
| --- | --- | --- | --- | --- |
| `24 main SVG + 3 step-state SVG` | `original-synthesis` | `Agent Learner` | Original project asset; no external permission claim. | Feishu and JavaGuide source media rejected because redistribution and modification permission was not verified. |

## Coverage gate

| lesson | total | overview | other cognitive forms | main verified | step assets | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `context-01` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-02` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-03` | 3 | 1 | 2 | 3 | 3 | 0 |
| `context-04` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-05` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-06` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-07` | 3 | 1 | 2 | 3 | 0 | 0 |
| `context-08` | 3 | 1 | 2 | 3 | 0 | 0 |
| **Total** | **24** | **8** | **16+** | **24** | **3** | **0** |

发布门要求：每个主记录只有一个 owner placement；所有 sourceIds 同时位于 lesson 和 owner section；主图与 step 图都通过 strict SVG XML、安全属性、固定 viewBox、title/desc、typed scene semantics 和边界几何检查；共享 registry 不得出现重复 ID。
