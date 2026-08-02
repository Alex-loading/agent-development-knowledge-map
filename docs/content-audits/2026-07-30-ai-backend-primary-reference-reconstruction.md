# AI 后端工程一级资料重构审计

审计日期：2026-07-30。审计对象是生产数据、真实笔记 placement、共享 visual registry 与生成后的本地 SVG，不以计划或测试 fixture 代替产物。JavaGuide 与 Harness 101 被作为课程主干和 implementation observation, not universal standard；涉及 API、数据库、投递、交付与部署的行为继续由开放规范、官方文档、原始论文和本地实验核验。

## Production parity

| metric | exact production value |
| --- | ---: |
| lessons | 8 |
| sections | 48 |
| paragraphs | 154 |
| resources | 49 |
| primaryBindings | 12 |
| assessments | 40 |
| visuals | 16 |
| scenes | 16 |
| cards | 86 |
| edges | 23 |
| svgAssets | 16 |

身份兼容保持 `backend-01`…`backend-08`、37 个 legacy resources、24 道 interview、16 道 quiz 与 `backend-02/03/06` 三个实验。新增 12 个 `res-backend-primary-` binding 全部来自冻结 50-source registry；49 个课程资源均至少被一课和一个真实 section 使用，没有孤立链接。

## 逐课来源影响与官方核验

| lesson | primary source impact | independent verification | decision |
| --- | --- | --- | --- |
| backend-01 | JavaGuide API/structured output 组织 schema、usage、capability；Tool Truth 修正“call 即执行” | OpenAPI 3.1.2、RFC 9110/6585、OpenAI streaming | corrected |
| backend-02 | JavaGuide API 与模型外系统把同步 JSON、SSE、异步轮询放入同一状态机 | WHATWG SSE、ASGI HTTP、Python asyncio | deepened |
| backend-03 | Gateway、beyond-model、AgentFS 形成 shared capacity envelope | RFC 6585、OpenAI rate limits、Little 定律、DAGOR、Google SRE | deepened |
| backend-04 | AI system design 与 Dynamic Workflow 区分 replayable control 和 external effect | OpenAI background、Celery Tasks/Optimizing、Chubby、MillWheel | corrected |
| backend-05 | system design 与 Company Brain 强化数据所有权、ACL 与缓存共享边界 | PostgreSQL transactions、Redis eviction/semantic cache、Go singleflight | corrected |
| backend-06 | Dynamic Workflow、version drift、Tool Truth 把恢复绑定真实 observation 和版本 | RFC 9110、AWS idempotent API/outbox、Celery、MillWheel | corrected |
| backend-07 | JavaGuide evaluation、Dynamic Workflow、Install.md 连接生命周期、评测和版本证据 | ASGI lifespan、Kubernetes probes、Prometheus instrumentation | adopted |
| backend-08 | system design、Gateway、AgentFS 组织独立扩缩、区域边界和四类故障 | Docker、FastAPI、vLLM、Ray Serve、Sarathi-Serve | deepened |

## 拒绝与修正

- 拒绝把 Harness 101 的具体运行形态写成任何 AI 后端都必须采用的标准；它只提供可核验的实现观察。
- 拒绝把 JavaGuide 的产品与框架描述当作稳定 API 保证；接口行为由对应官方版本核验。
- 修正“Tool call 就是执行成功”：只有宿主日志、observation 与持久提交能证明外部事实。
- 修正“自动重连等于 SSE 恢复”：没有持久游标、事件窗口与去重协议时只能查询权威结果。
- 修正“重试会提升容量”：retry 和首次请求消费同一 concurrency/token/deadline envelope。
- 修正“journal replay 可恢复外部副作用”：可重放的是控制决定，外部 effect 需要幂等键、查询或 reconcile。
- 修正“缓存模型输出可以安全共享”：tenant、ACL、模型、prompt、tool 与知识版本的硬隔离先于相似度。
- 修正“exactly-once 是队列开关”：它是必须跨 broker、数据库和真实副作用证明的端到端业务不变量。

## Source-impact parity

八条 production claim 全部显式解析真实 `sectionId`，且 decision resource 同时属于 lesson.resourceIds 与 section.sourceIds。每条 claim 都关联真实 assessment outcome 和真实 note-derived visual owner；独立 fixture 分别验证 claim、section 与 summary 的语义锚点，CSS/字体类无关文本 mutation 不能通过。

| decision | section | linked outcome |
| --- | --- | --- |
| impact-backend-01-tool-truth | service-boundary | api-boundary |
| impact-backend-02-stream-contract | streaming-model | stream-lifecycle |
| impact-backend-03-capacity | admission-control | capacity-envelope |
| impact-backend-04-replay | job-contract | job-state |
| impact-backend-05-ownership | source-of-truth | data-ownership |
| impact-backend-06-exactly-once | delivery-semantics | exactly-once-boundary |
| impact-backend-07-evaluation | observability-model | observability |
| impact-backend-08-diagnosis | scaling-units | failure-diagnosis |

## 视觉资产与许可

全部 16 张图为 Agent Learner 原创合成，许可决策是“不复制第三方图表”；一级资料只进入 sourceIds 与语义综合。没有下载、改编或内嵌第三方图片，因此无需额外 reproduction license；credit 统一为“Agent Learner 原创教学图解”。所有资产为本地 SVG，无 hotlink、data URI、foreignObject、脚本、DTD 或 custom entity。

| asset | cognitive task | asset decision |
| --- | --- | --- |
| visual-backend-01-overview | API boundary sequence | original |
| visual-backend-01-detail | schema/error protocol | original |
| visual-backend-02-overview | SSE timeline | original |
| visual-backend-02-detail | transport matrix | original |
| visual-backend-03-overview | capacity envelope | original |
| visual-backend-03-detail | admission decision | original |
| visual-backend-04-overview | job state machine | original |
| visual-backend-04-detail | control/effect split | original |
| visual-backend-05-overview | storage layers | original |
| visual-backend-05-detail | cache-aside process | original |
| visual-backend-06-overview | delivery ledger | original |
| visual-backend-06-detail | failure matrix | original |
| visual-backend-07-overview | lifecycle signal flow | original |
| visual-backend-07-detail | observability boundary | original |
| visual-backend-08-overview | diagnosis matrix | original |
| visual-backend-08-detail | deployment topology | original |

Scene 分布为 sequence、protocol、timeline、envelope、decision、state-machine、split、layers、cache、ledger、signal-flow、observability、deployment 各 1，matrix 3；共 16 个唯一 topology、86 cards、23 条正交非零 edge。画布固定 1200×675，正文 card 位于 y=170…510 保留区，标题/副标题在 y≤132，数值 ledger 在 y=535，图注与 topology footer 在 y=610。正文最小字号 14px、图注 15px、副标题 17px、标题 30px；严格几何测试确认 node-node、edge-node、edge-edge overlap/crossing、截断与保留区碰撞均为 0，并检查真实 fixture 字段和 16 个生成物 byte parity。

## 评分

| rubric | score | evidence |
| --- | ---: | --- |
| 内容评分 | 94 / 100 | 8 课完整主线、48 sections、154 段、40 assessment 闭环与来源边界 |
| 视觉评分 | 56 / 60 | 16 原创图、16 typed scenes、真实 fixture 与严格静态门 |
| 语义对应 | 10 / 10 | 每课两图并绑定真实 outcome |
| 认知任务选择 | 10 / 10 | sequence/state-machine/envelope/layer/ledger/matrix 等按问题选择 |
| 可读性 | 9 / 10 | 固定保留区、最小 14px、无斜线与零长 edge |
| 可访问性 | 9 / 10 | alt、longDescription、caption、SVG title/desc 齐全 |
| 来源与许可 | 10 / 10 | sourceIds 可解析，全部原创且无第三方复制 |
| 集成与回归 | 8 / 10 | shared registry、原子 generator、strict `--check` 与数据回归 |

六个视觉类别最低为 8 / 10，内容超过 85/100、视觉超过 51/60。

## 验证与限制

已执行 backend primary/data/visual/artifact/audit tests、607 项全量 Node test、JS/MJS syntax、16 SVG xmllint、generator `--check`、marker/hotlink/active/privacy/cache 扫描与 `git diff --check`。hostile title/description/caption 通过 shared static SVG gate；缺失目录测试确认 `--check` 非写入并一次报告全部 16 个 missing artifact。

本地 HTTP smoke 已确认 `/`、`/styles/app.css`、`/src/app.js` 与一张 backend SVG 均返回 200 和正确 MIME。本切片没有声称浏览器验收：浏览器矩阵未执行（browser not executed），留给最终跨模块集成阶段。
