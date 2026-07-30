# Context、RAG 与记忆 Primary Reference Reconstruction Audit

日期：2026-07-30

模块：`context-rag-memory`

兼容边界：既有八个 lesson ID、十六个 quiz ID、二十四个 interview ID、三项 experiment mapping、canonical routes 与 progress key 均保持不变。

重建结果：保留 29 个既有核验资源，追加 15 个 frozen primary-reference bindings，共 44 个资源；发布 24 个主视觉，每课 3 个且恰好 1 个 overview；磁盘共有 27 个 Context SVG，其中 3 个是同一 compaction-loss 主视觉的 step states。

发布状态：source、note、typed semantic visual、ownership、UI、README、静态安全、隐私存储与全量回归契约通过。实时浏览器 backend 不可用，因此本文只记录自动化 320px/390px 响应式证据、本地 HTTP smoke 与 macOS Quick Look 静态渲染检查，不声称完成交互式浏览器截图或人工 viewport sweep。

## Reconstruction inputs

所有新增 primary narrative 都通过 `createPrimaryReferenceBinding` 读取 canonical registry；Context 模块没有重写来源标题、canonical URL、作者、source tier 或 source family。

| Family | Count | Frozen canonical source IDs |
| --- | ---: | --- |
| Feishu Harness 101 | 7 | `primary-feishu-company-brain`, `primary-feishu-context-offloading`, `primary-feishu-microcompact`, `primary-feishu-virtual-filesystem`, `primary-feishu-claude-ai-memory`, `primary-feishu-beyond-model`, `primary-feishu-tool-truth` |
| JavaGuide AI | 8 | `primary-javaguide-agent-memory`, `primary-javaguide-context-engineering`, `primary-javaguide-rag-basis`, `primary-javaguide-rag-document-processing`, `primary-javaguide-rag-vector-store`, `primary-javaguide-rag-optimization`, `primary-javaguide-rag-knowledge-update`, `primary-javaguide-graphrag` |

Feishu bindings使用 `expert` authority，并把正文限定为观察、工程叙事、逆向案例或教学分析；它们不代表产品、协议、权限、安全、隐私或删除保证。JavaGuide 提供系统化教学骨架，但不被写成行业标准、性能 benchmark 或产品事务保证。章节涉及 OpenAI、RAGFlow、LangChain、权限、安全、产品接口或数据保留时，在同一个 lesson/section 保留 official verification；研究结论保留论文任务、模型、数据与时间边界。

所有 44 个资源都有完整 evidence card。视频资源只承担导航和元数据角色：未稳定取得字幕正文的材料没有进入关键 section sourceIds，也不支撑机制、数字或保证。

## Source-impact decision ledger

| decisionId | lessonId | resourceId | scope | targetId | contribution | summary | rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `impact-context-01-context-projection` | `context-01` | `res-context-primary-javaguide-context` | `claim` | `claim:prompt-stuffing-is-context-engineering` | `corrected` | 把“上下文工程就是把更多文本塞入提示词”修正为有来源、预算和失效规则的投影系统。 | 该体系化叙事用于建立课程主干，具体窗口、压缩和产品行为仍需官方资料与目标模型实测。 |
| `impact-context-02-budget-boundary` | `context-02` | `res-context-primary-feishu-context-offloading` | `claim` | `claim:fixed-context-ratio-is-universal` | `deepened` | 把上下文预算深化为固定指令、历史、工具结果、检索证据、草稿和输出预留的显式分桶。 | 来源支持外置和活动上下文边界，但课程拒绝把任何分桶数字提升为跨模型的通用最优比例。 |
| `impact-context-03-lossy-summary` | `context-03` | `res-context-primary-feishu-microcompact` | `claim` | `claim:summary-is-canonical-source-of-truth` | `corrected` | 把流畅摘要从“新事实源”降级为带事件游标、已知遗漏和原文回取入口的有损派生视图。 | 文章中的产品观察具有日期和逆向边界，课程只采用压缩层次，不宣称当前产品协议或无损恢复。 |
| `impact-context-04-rag-pipeline` | `context-04` | `res-context-primary-javaguide-document-processing` | `claim` | `claim:vector-database-is-complete-rag` | `deepened` | 把向量存储前后的 acquire、parse、normalize、chunk、metadata、embed 和 index 串成可追溯管线。 | 教学综述用于组织处理阶段，具体解析器能力、切分参数和质量收益仍必须在目标文档与查询集验证。 |
| `impact-context-05-retrieval-signals` | `context-05` | `res-context-primary-javaguide-rag-optimization` | `claim` | `claim:dense-retrieval-always-dominates` | `corrected` | 把“稠密检索必然更强”修正为按查询切片比较 sparse、dense、hybrid 与融合规则。 | 来源提供优化导航而非跨语料收益保证，课程用 BEIR 等研究边界和本地评测约束方法选择。 |
| `impact-context-06-evidence-grounding` | `context-06` | `res-context-primary-feishu-tool-truth` | `claim` | `claim:retrieval-success-guarantees-grounding` | `deepened` | 把证据包深化为同时保留宿主真实 observation、callId、结果哈希、版本与精确 span 的清单。 | 工具 transcript 的教学观察不构成执行真实性或协议保证，因此课程要求宿主记录并逐 claim 核验。 |
| `impact-context-07-memory-boundary` | `context-07` | `res-context-primary-javaguide-memory` | `claim` | `claim:transcript-is-long-term-memory` | `corrected` | 把长期记忆从聊天历史集合收紧为经准入、绑定主体与 scope、拥有过期更正删除能力的信息。 | 记忆分类只作为应用建模标签，不支持人类认知类比，也不证明产品隐私、隔离或删除承诺。 |
| `impact-context-08-graphrag-boundary` | `context-08` | `res-context-primary-javaguide-graphrag` | `claim` | `claim:graphrag-replaces-vector-retrieval` | `corrected` | 把 GraphRAG 从向量检索替代品修正为面向关系密集与全局问题的可选候选生成分支。 | GraphRAG 收益依赖图构建、语料和查询类型，最终政策主张仍须回到有效源版本和精确 span。 |

## Source contribution and semantic weighting

下表与 `contextRagMemory.sourceContributionLedger` 逐字段保持 parity。每个 decision unit 都有稳定 ID、category、lesson、可解析 claim target、实际 source references 与人工 rationale：

| unitId | category | lessonId | targetId | resourceIds | claimIds | rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `context-source-unit-01-projection-narrative` | `primary` | `context-01` | `claim:prompt-stuffing-is-context-engineering` | `res-context-primary-javaguide-context` | `prompt-stuffing-is-context-engineering` | 以 JavaGuide 的上下文工程叙事确定五类对象和有来源投影的主解释顺序。 |
| `context-source-unit-02-budget-narrative` | `primary` | `context-02` | `claim:fixed-context-ratio-is-universal` | `res-context-primary-feishu-context-offloading` | `fixed-context-ratio-is-universal` | 以活动上下文和外置边界重构预算、输出预留、显式排除与可恢复失败的主叙事。 |
| `context-source-unit-03-compaction-narrative` | `primary` | `context-03` | `claim:summary-is-canonical-source-of-truth` | `res-context-primary-feishu-microcompact` | `summary-is-canonical-source-of-truth` | 以有损压缩观察确定 summary、canonical state、事件证据和原文回取的责任边界。 |
| `context-source-unit-04-ingestion-narrative` | `primary` | `context-04` | `claim:vector-database-is-complete-rag` | `res-context-primary-javaguide-document-processing` | `vector-database-is-complete-rag` | 以文档处理叙事组织 acquire 到 index 的七阶段摄取、版本、权限和 span 传递。 |
| `context-source-unit-05-evidence-narrative` | `primary` | `context-06` | `claim:retrieval-success-guarantees-grounding` | `res-context-primary-feishu-tool-truth` | `retrieval-success-guarantees-grounding` | 以工具 observation 边界深化 evidence packet、callId、hash、citation 与 claim 支持核验。 |
| `context-source-unit-06-graphrag-narrative` | `primary` | `context-08` | `claim:graphrag-replaces-vector-retrieval` | `res-context-primary-javaguide-graphrag` | `graphrag-replaces-vector-retrieval` | 以 GraphRAG 体系化叙事确定关系查询分支、知识更新边界和原文证据回归路径。 |
| `context-source-unit-07-context-verification` | `verification` | `context-02` | `claim:fixed-context-ratio-is-universal` | `res-context-lost-middle` | `fixed-context-ratio-is-universal` | 以长上下文研究的任务和位置边界核验窗口容量不等于稳定有效利用，也不导出固定预算比例。 |
| `context-source-unit-08-retrieval-verification` | `verification` | `context-05` | `claim:dense-retrieval-always-dominates` | `res-context-rrf`, `res-context-beir` | `dense-retrieval-always-dominates` | 以 RRF 数学和 BEIR 任务边界核验 sparse、dense、hybrid 的融合方式与跨数据集外推限制。 |
| `context-source-unit-09-citation-verification` | `verification` | `context-06` | `claim:retrieval-success-guarantees-grounding` | `res-context-openai-citations`, `res-context-alce`, `res-context-ragas` | `retrieval-success-guarantees-grounding` | 以官方引用格式和学术评测维度核验可回源、citation correctness、completeness 与生成忠实并不等价。 |
| `context-source-unit-10-curriculum-synthesis` | `other` | `context-08` | `claim:graphrag-replaces-vector-retrieval` | `res-context-ragflow` | `graphrag-replaces-vector-retrieval` | 把既有八课、三项实验、测评和 progress 契约重新接入统一架构，同时保持所有稳定身份与学习路径。 |

`60 / 30 / 10` 是上述十个课程决策单元的结构化语义归因。它**不是 citation count，不是 source/URL count，也不是 word count**，更不会把同一来源在多课出现重复计票。分类汇总由 ledger 的 category 计数得到：

| category | decisionUnits | share |
| --- | ---: | ---: |
| `primary` | 6 | 60% |
| `verification` | 3 | 30% |
| `other` | 1 | 10% |

该权重表达“什么改变了课程结构”，并不表达来源可信度的线性分数。Primary narrative 决定解释顺序；official/academic 材料负责收紧机制、数字和产品主张；既有课程负责保持学习路径、练习与兼容契约。资源、段落或 citation slot 数只能作为覆盖检查的次级指标，不能替代这份人工决策单元账本。

## Corrections and evidence boundaries

- “上下文越多越好”被改成显式预算方程、输出预留和 required failure；任何比例都只是工作负载配置。
- “摘要就是新事实源”被改成带游标、遗漏说明和原文回取入口的有损派生视图。
- “向量数据库就是 RAG”被改成 acquire → parse → normalize → chunk → metadata → embed → index 的可追溯摄取链。
- “Dense 必然胜过 sparse”被改成按查询切片评测 sparse、dense、hybrid、ANN 与 RRF。
- “召回成功或带引用就已 grounded”被改成候选、重排、去重、多样性、证据包、claim-to-span 核验的分层流程。
- “聊天历史就是长期记忆”被改成具有准入、主体、scope、TTL、supersession 和 deletion propagation 的生命周期对象。
- “记忆变旧就是过期或删除”被改成 relevance decay 排序、TTL expiry、supersession、deletion 四个独立动作；`1.00 → 0.65 → 0.20` 明确为合成教学 fixture，不是通用记忆规律。
- “GraphRAG 替代向量检索”被改成关系密集或全局问题上的可选候选生成分支。

仍然具有时间或实现波动的内容包括：模型窗口与产品 compaction 行为、供应商 retention/delete 语义、parser 与向量库能力、embedding/reranker benchmark、GraphRAG 成本收益以及 UI 产品行为。课程没有把这些内容写成永久协议；部署前必须重新查阅目标产品官方文档并在目标语料、查询和权限模型上实测。

## Reconstructed teaching sequence

| Lesson | Reconstructed sequence | Primary teaching correction |
| --- | --- | --- |
| `context-01` | 五类对象 → scope/lifecycle/owner → projection → long-context limits → manifest → worked example | 持久化不等于模型可见 |
| `context-02` | 预算方程 → required/output reserve → stable priority → 两类 overflow → compaction boundary → router | 普通超限与 required 超限必须分开 |
| `context-03` | transcript/state/summary → canonical schema → lossy summary → sliding/retrieval → supersession → deliverable | 流畅摘要不等于完整事实 |
| `context-04` | source/retrieval/citation units → chunk strategy → derived artifacts → version/ACL/validity → spans → corpus case | index 必须能从受治理 source 重建 |
| `context-05` | sparse/dense complement → query slices → RRF → ANN recall/latency/memory/update → filter/threshold/top-k → rewrite → trace | 检索方法和 ANN 参数必须在相同查询、语料与硬件上联合评测 |
| `context-06` | candidates → rerank → semantic dedup → diversity → evidence/citation manifest → quality dimensions → full case | 候选与引用都不是支持关系本身 |
| `context-07` | history/memory boundary → admission → event ledger → bounded recall → relevance decay → expire/supersede/delete → lifecycle lab → policy audit | decay 只改变排序，TTL、supersession 与 deletion 改变状态或使用许可 |
| `context-08` | five objects/RAG-fine-tuning-memory roles → GraphRAG routing → incremental/full rebuild → retrieve/pack → projections → citation → diagnosis → capstone | GraphRAG 是可选分支，更新和最终主张仍回到有效 source span |

## Note quality rubric

评分按 Objectives/assessment 25、Structure 20、Sources 25、Readability 20、Copyright/data 10，总分 100；发布阈值为 85。每课 4–7 个实质章节，正文段落均控制为适合扫描的 2–4 段或等价短块。

| Lesson | Objectives / assessment | Structure | Sources | Readability | Copyright / data | Total | Sections | Broken refs | Evidence gaps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `context-01` | 25 | 19 | 24 | 19 | 10 | 97 | 6 | 0 | 0 |
| `context-02` | 25 | 19 | 23 | 19 | 10 | 96 | 6 | 0 | 0 |
| `context-03` | 25 | 19 | 24 | 19 | 10 | 97 | 6 | 0 | 0 |
| `context-04` | 25 | 19 | 23 | 19 | 10 | 96 | 6 | 0 | 0 |
| `context-05` | 25 | 19 | 24 | 19 | 10 | 97 | 6 | 0 | 0 |
| `context-06` | 25 | 19 | 24 | 19 | 10 | 97 | 7 | 0 | 0 |
| `context-07` | 25 | 19 | 24 | 19 | 10 | 97 | 7 | 0 | 0 |
| `context-08` | 25 | 19 | 24 | 19 | 10 | 97 | 7 | 0 | 0 |

扣分原因是：部分产品行为需要部署时再核验，长文中仍存在少量英文工程术语，以及实时 viewport 人工检查未能执行。没有发现悬空 sourceId、失效内部锚点或无证据的数值保证。

## Assessment-to-section coverage

| Lesson | Objectives and quizzes | Interviews | Exercise and acceptance |
| --- | --- | --- | --- |
| `context-01` | `five-information-objects`、`projection-pipeline`、`scope-lifecycle-ownership`；`context-01-1` → object/checkpoint boundary，`context-01-2` → offloading/recoverability | `iq-context-01-1` → five objects；`iq-context-01-2` → context engineering/projection；`iq-context-01-3` → projection/ingestion/provenance | “绘制五层信息地图” → `classification-worked-example`；交付分类表、manifest 与可验证外置回取记录 |
| `context-02` | `context-engineering-budget`、`required-and-output-reserve`、`priority-and-stable-order`、`two-overflow-modes`；`context-02-1` → budget，`context-02-2` → required reserve | `iq-context-02-1` → budget；`iq-context-02-2` → `long-context-and-compaction`；`iq-context-02-3` → long-context + overflow | “组装预算有界的上下文”与 `context-router-worked-example`；`context-router` 验收预算守恒和排除原因 |
| `context-03` | `three-conversation-representations`、`canonical-state-schema`、`supersession-and-conflict`；`context-03-1` → representations/summary，`context-03-2` → supersession | `iq-context-03-1` → representations；`iq-context-03-2` → `summary-is-lossy` + `sliding-summary-retrieval`；`iq-context-03-3` → supersession | “压缩一段含纠正的长会话”与 `compression-deliverable`；验收 state、lossy summary、source map |
| `context-04` | chunk、three units、ingestion、version/ACL；`context-04-1` → index/corpus，`context-04-2` → versioned ingestion、ACL propagation、tombstone/delete 与派生索引重建 | `iq-context-04-1` → chunk strategy + excessive overlap/duplicate candidates/budget；`iq-context-04-2` → version/validity；`iq-context-04-3` → seven-stage ingestion + source/retrieval/citation units | “为异构文档设计 chunk schema”与 `build-and-diagnose-a-versioned-corpus`；验收 schema、examples、invalidating flow，并保留 overlap 重复率与预算浪费检查 |
| `context-05` | hybrid、RRF、ANN tradeoff、filter 与 rewrite；`context-05-1` → sparse，`context-05-2` → ANN joint metrics | `iq-context-05-1` → method selection + RRF calculation；`iq-context-05-2` → filter/top-k；`iq-context-05-3` → ANN recall/p95/memory/update | `hybrid-retrieval` 同时验收 ANN 联合权衡、可回放 trace 与 query rewrite 风险；被替换的 rewrite 结果保留在 objective、section、exercise 和 completion criterion |
| `context-06` | candidates、rerank、dedup/diversity、evidence provenance/citation；`context-06-1` → candidates，`context-06-2` → citation grounding | `iq-context-06-1` → candidate/rerank；`iq-context-06-2` → dedup/diversity；`iq-context-06-3` → observation/call/hash/source/span/claim | “打包可引用证据”验收 packet、排除清单和 claim-to-citation map |
| `context-07` | memory lifecycle、admission、decay/expiry/supersession/deletion；`context-07-1` → salience vs governance，`context-07-2` → decay vs TTL | `iq-context-07-1` → lifecycle/admission；`iq-context-07-2` → memory types；`iq-context-07-3` → decay/expiry/supersession/deletion | `memory-lifecycle` 验收含 decay score 的 event/effective table 与 projection；纠正、过期、删除覆盖保留在 objective、interview、exercise 和 completion criterion |
| `context-08` | integrated roles、GraphRAG/update、diagnosis；`context-08-1` → diagnosis，`context-08-2` → GraphRAG routing + rebuild | `iq-context-08-1` → diagnosis；`iq-context-08-2` → GraphRAG/update；`iq-context-08-3` → architecture + RAG/fine-tuning/memory roles | Capstone 验收职责矩阵、GraphRAG/update 边界、architecture、fault tree、checklist；被替换的 RAG/fine-tuning/memory 结果保留在 objective、note、exercise、`iq-context-08-3` 与 completion criterion |

Assessment outcome registry 不再维护与题目平行的手写映射：每个实际 quiz/interview record 都携带 `conceptTags`，发布 registry 的 40 个 assessment outcome 由这些记录及其 lesson ownership 派生；section/visual teaching outcome 保留为独立教学覆盖注册表。

## Visual publication and quality

视觉注册表发布 24 个主视觉，严格为每课 3 个、每课恰好 1 个 overview；`visual-context-03-compaction-loss` 另有 3 个 step state，所以磁盘总数为 27 个 SVG。所有主视觉都绑定 lesson/section/sourceIds，并通过同一对象身份进入共享 registry。初始方案曾把共享 index 集成列为延后项；实际 UI、ownership 和 published-truth 契约要求它作为发布原子的一部分，因此按测试证据完成集成，并在此记录偏差。

所有图形语义现在由 `src/data/visuals/context-rag-memory-scenes.js` 的 deeply frozen production scene registry 持有，而不是由 tests fixture 反向驱动生产生成器。24 个主视觉分别使用 typed `flow`、`table`、`chart` 或 `decision` scene；`src/data/visuals/context-rag-memory-svg.js` 为四种 scene form 提供专用 renderer。annotation 的 `semanticRefs` 必须解析到实际 node、edge、row、cell、series 或 point；renderer 测试再逐个验证 semantic element、唯一 ID、1200×675 边界几何和可见文本。

Reviewer 指定语义均由结构而不是通用卡片表达：ingestion 明确保存 `chunk → metadata` wrap edge；ANN 用 `fast`、`balanced`、`deep` 三行绑定 recall、p95、memory、update 四项指标；RRF 用 rank 2/1 和两个 contribution 得到 `0.0325`；memory admission 用 scope、sensitivity、consent、confidence、existing-value 五级治理分支落到 reject/store/no-op/supersede，且四个 outcome 与 final action summary 均不重叠、不越界。

评分按 Accuracy、Evidence boundaries、Teaching value、Accessibility、Responsive rendering、Fallback 各 10 分，总分 60；发布阈值为总分至少 51 且每项至少 8。

| Lesson | Accuracy | Evidence boundaries | Teaching value | Accessibility | Responsive | Fallback | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `context-01` | 9 | 10 | 9 | 9 | 8 | 10 | 55 |
| `context-02` | 10 | 10 | 9 | 9 | 8 | 9 | 55 |
| `context-03` | 10 | 10 | 10 | 9 | 8 | 9 | 56 |
| `context-04` | 9 | 10 | 9 | 9 | 8 | 9 | 54 |
| `context-05` | 10 | 10 | 10 | 9 | 8 | 9 | 56 |
| `context-06` | 9 | 10 | 10 | 9 | 8 | 9 | 55 |
| `context-07` | 10 | 10 | 9 | 9 | 8 | 9 | 55 |
| `context-08` | 9 | 10 | 10 | 9 | 8 | 9 | 55 |

Responsive rendering 只记 8 分：静态 UI/CSS 契约覆盖 320px 与 390px 降级规则，SVG 使用可缩放 viewBox；Quick Look 已静态检查 ingestion、ANN、RRF、admission 四个 reviewer-critical scene，但实时 browser backend 不可用，无法增加交互式 viewport 截图证据。Fallback 由 figcaption、alt/aria 文本、sourceIds 和 step inheritance 提供。

可见数值真值包括：8192 token budget；compaction 从 1200 到 420、保留 3 项并丢失 2 项；RRF `k=60` 与 `0.0325`；ANN recall/latency 对照；candidate/rerank/packing 数量；合成 memory relevance `1.00 → 0.65 → 0.20`；七层诊断。ANN 与 decay 数值都是冻结教学 fixture，不是产品 benchmark 或普适规律。严格 SVG 测试从 `text`/`tspan` 节点读取这些值，不接受把值藏在注释或 metadata。

## Rights and media decisions

逐资产权利账本位于 `docs/research/2026-07-30-context-rag-memory-visual-inventory.md`。24 个主视觉均为本仓库根据课程数据重新绘制的 original SVG，`permission` 为 `null`，没有复制、描摹或内嵌第三方图片；3 个 step state 继承 `visual-context-03-compaction-loss` 的 owner、sourceIds、permission 与 rights decision。

Primary references 中的截图、插图和视频帧没有经过可验证的再分发与修改授权，所以全部拒绝作为发布媒体，只保留文本证据绑定。`scripts/generate-context-rag-memory-visuals.mjs` 和 `scripts/generate-context-rag-memory-visual-inventory.mjs` 是可重复生成入口；资产与 inventory 都由 production scene/visual/lesson registries 纯派生，不导入 tests 数据。

## Verification evidence

测试驱动证据：

- source/note 契约首次运行：38 项中 33 通过、5 失败；实现 frozen primary binding、impact audit 和重建正文后 38/38 通过。
- visual 契约首次运行：因 Context visual registry 尚不存在而失败；实现 24 个主视觉、3 个 step state、placement 与 inventory 后 7/7 通过。
- README publication 契约首次运行：旧发布计数不匹配；更新发布事实后通过。
- outcome semantic 契约首次运行：`Context outcome registry` 断言失败；实现 40 个稳定 assessment、24 个 owner section 与 24 个 visual coverage 后通过。
- `context-04` assessment semantic 契约首次运行：实际 `quiz-context-04-2` 仍只检查 overlap，且 quiz/interview record 没有 `conceptTags`；改为唯一正确的 version/ACL/tombstone/delete/rebuild 题，并把 overlap/duplicate/budget 保留在 `iq-context-04-1` 后通过。
- decay 契约首次运行：`expire-supersede-and-delete` 没有 `relevance decay`；补充 note、assessment、exercise/completion、source 与 synthetic fixture 边界后通过。
- inventory coverage 列首次运行：Markdown header 与更新后的可见标签缺失；重新生成 inventory/SVG 后通过。
- typed production scene 契约首次运行：`src/data/visuals/context-rag-memory-scenes.js` 不存在；实现 24 个 deeply frozen typed scene、3 个 step scene、semantic refs 与四类专用 renderer 后 5/5 通过。
- generator artifact 契约首次运行：旧 generator 没有 build/write/check API；实现 atomic write、严格 non-writing `--check`、missing/changed/unexpected drift、unknown-argument rejection 和 production-only inventory derivation 后 5/5 通过。
- interview compatibility 契约首次运行：旧 shape 缺少 `conceptTags` 时触发 `spec.conceptTags is not iterable`；改为缺省 frozen empty list、合法数组 defensive copy + freeze、非法形状明确 `TypeError` 后通过。
- source-contribution ledger 契约首次运行：`sourceContributionLedger` 为 `undefined`；实现可解析 deeply frozen 10-unit 账本、派生 summary 与 Markdown exact parity 后通过，汇总严格为 6/3/1 和 60/30/10。
- admission preview regression 首次运行：`no-op overlaps supersede`；调整 decision outcome layout 后通过，并与 ingestion connector 一起重新生成、重新渲染检查。

以下命令均从仓库 worktree 根目录逐字执行；结果包含精确 exit 与汇总。

Focused Context gate：

```sh
node --test tests/context-rag-memory-scenes.test.js tests/context-rag-memory-artifacts.test.js tests/context-rag-memory-primary-references.test.js tests/context-rag-memory-visual-data.test.js tests/context-rag-memory-data.test.js tests/readme-visual-publication.test.js
```

结果：exit 0；52 tests、52 pass、0 fail、0 skipped。

Shared visual/UI/static gate：

```sh
node --test tests/knowledge-visual-contract.test.js tests/knowledge-visual-ui.test.js tests/static-svg.test.js tests/guided-ui.test.js tests/visual-registry-ownership.test.js tests/static-app.test.js
```

结果：exit 0；110 tests、110 pass、0 fail、0 skipped。

Privacy/progress/UI gate：

```sh
node --test tests/storage.test.js tests/progress.test.js tests/ui-interactions.test.js
```

结果：exit 0；61 tests、61 pass、0 fail、0 skipped。

Frozen primary-reference generated-artifact gate：

```sh
npm run check:primary-references
```

结果：exit 0；`Primary reference generated artifacts are current.`

Context visual generated-artifact gate：

```sh
npm run check:context-visuals
```

结果：exit 0；`27 Context visual artifacts are current.` 与 `Context visual inventory is current.`

Full regression：

```sh
npm test
```

结果：exit 0；554 tests、554 pass、0 fail、0 skipped。

JS/MJS syntax 与文件计数：

```sh
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
find src tests scripts -type f \( -name '*.js' -o -name '*.mjs' \) | wc -l
```

结果：两条命令均 exit 0；第一条无诊断，第二条输出 `135`。

Context SVG XML 与资产计数：

```sh
find assets/visuals/context-rag-memory -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
find assets/visuals/context-rag-memory -name '*.svg' | wc -l
```

结果：两条命令均 exit 0；第一条无诊断，第二条输出 `27`。

Visual semantic、strict SVG 与 static-security gate：

```sh
node --test tests/context-rag-memory-scenes.test.js tests/context-rag-memory-artifacts.test.js tests/context-rag-memory-visual-data.test.js tests/static-svg.test.js
```

结果：exit 0；27 tests、27 pass、0 fail、0 skipped。

Marker scan（exit 1 在 `rg` 中表示零命中）：

```sh
rg -n 'TODO|TBD|placeholder|待补|未完成' src/data/context-rag-memory.js src/data/context-rag-memory-outcomes.js src/data/context-rag-memory-notes src/data/visuals/context-rag-memory-visuals.js src/data/visuals/context-rag-memory-scenes.js src/data/visuals/context-rag-memory-svg.js tests/context-rag-memory-scenes.test.js tests/context-rag-memory-artifacts.test.js tests/context-rag-memory-primary-references.test.js tests/context-rag-memory-visual-data.test.js tests/context-rag-memory-data.test.js scripts/generate-context-rag-memory-visuals.mjs scripts/generate-context-rag-memory-visual-inventory.mjs docs/research/2026-07-30-context-rag-memory-visual-inventory.md README.md
```

结果：exit 1；stdout/stderr 均无输出，即零命中。

Remote-image hotlink scan（exit 1 在 `rg` 中表示零命中）：

```sh
rg -n "https?://[^[:space:]\"')]+\.(png|jpe?g|gif|webp|svg)([?#][^[:space:]\"')]+)?" assets/visuals/context-rag-memory src/data/visuals/context-rag-memory-visuals.js src/data/visuals/context-rag-memory-scenes.js
```

结果：exit 1；stdout/stderr 均无输出，即零命中。

Research-cache policy：

```sh
git ls-files .research-cache
git check-ignore .research-cache/primary-references/manifest.json
```

结果：两条命令均 exit 0；第一条无输出，第二条输出 `.research-cache/primary-references/manifest.json`。

Post-commit base-to-HEAD whitespace gate：

```sh
git diff --check e0f2e5b0b22d05fa2df9a474593e41d7928f339f..HEAD
```

结果：exit 0；无输出。

Post-commit branch 与 clean-tree gate：

```sh
git branch --show-current
git status --short
```

结果：两条命令均 exit 0；第一条输出 `feat/primary-reference-reconstruction`，第二条无输出。

原模块计划命令引用了不存在的 `tests/knowledge-notes.test.js`，所以该命令按原样返回找不到文件；替换为仓库实际存在的 `context-rag-memory-data.test.js`、`knowledge-visual-contract.test.js` 与 `knowledge-visual-ui.test.js`。替换只修正测试路径，不降低断言范围。

## Local server and browser evidence

本地 server start/curl/stop 使用同一个可复制 shell block：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 >/tmp/context-rag-memory-http.log 2>&1 &
CONTEXT_HTTP_PID=$!
sleep 1
curl --silent --show-error --output /dev/null --write-out '%{url_effective} %{http_code}\n' http://127.0.0.1:4173/
curl --silent --show-error --output /dev/null --write-out '%{url_effective} %{http_code}\n' http://127.0.0.1:4173/src/data/visuals/context-rag-memory-scenes.js
curl --silent --show-error --output /dev/null --write-out '%{url_effective} %{http_code}\n' http://127.0.0.1:4173/assets/visuals/context-rag-memory/context-04-ingestion-pipeline.svg
curl --silent --show-error --output /dev/null --write-out '%{url_effective} %{http_code}\n' http://127.0.0.1:4173/assets/visuals/context-rag-memory/context-07-admission-conflict.svg
kill "$CONTEXT_HTTP_PID"
wait "$CONTEXT_HTTP_PID"
CONTEXT_STOP_EXIT=$?
test "$CONTEXT_STOP_EXIT" -eq 143
echo "server-stop exit=0 (wait=$CONTEXT_STOP_EXIT)"
```

整个 block 最终 exit 0，精确输出为：

```text
http://127.0.0.1:4173/ 200
http://127.0.0.1:4173/src/data/visuals/context-rag-memory-scenes.js 200
http://127.0.0.1:4173/assets/visuals/context-rag-memory/context-04-ingestion-pipeline.svg 200
http://127.0.0.1:4173/assets/visuals/context-rag-memory/context-07-admission-conflict.svg 200
server-stop exit=0 (wait=143)
```

浏览器 backend 仍不可用：`getForUrl` 返回 `No browser is available`，`browsers.list()` 返回空数组。因此未生成 1440px、390px 或 320px 交互式浏览器截图，也不声称完成键盘或人工 viewport sweep。响应式结论来自已通过的 DOM、CSS、SVG 和 UI 自动化契约。

本机 image viewer 不能直接解码 SVG；macOS Quick Look 可以把本地 SVG 渲染为 PNG thumbnail。为避免 Quick Look 默认方形 thumbnail 对 1200×675 图的 cover crop，检查时只对 `/tmp` 中的副本把临时 canvas 扩到 1200×1200，production SVG bytes 保持不变。先后检查 `context-04-ingestion-pipeline.svg`、`context-05-ann-tradeoff.svg`、`context-05-rrf-fusion.svg`、`context-07-admission-conflict.svg`。首次检查发现 same-row flow connector 不够清晰和 admission 的 NO-OP/SUPERSEDE box 重叠；修复 renderer、加入 outcome non-overlap regression、重新生成后再次渲染，四个 reviewer-critical scene 的标签、关系、方向、数值、分支和 final action 均清晰且无裁切。

## Compatibility and residual limitations

八个 lesson ID、canonical route、16 个 quiz ID、24 个 interview ID、`context-router`、`hybrid-retrieval`、`memory-lifecycle` 映射及 progress/storage schema 均未迁移。29 个既有资源仍以原顺序、URL 和 verification date 存在，15 个 primary resources 只追加在其后。

剩余限制是浏览器人工观察证据缺席、供应商行为可能更新，以及视觉是教学模型而不是产品协议截图。这些限制不影响 registry、路由、存储、静态安全、资源身份或学习评估契约，但发布者在产品升级或引入第三方媒体时应重新执行官方核验与权利审计。
