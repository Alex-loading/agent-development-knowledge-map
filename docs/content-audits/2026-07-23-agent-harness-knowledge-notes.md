# Agent Harness 知识笔记内容审计

- 审计日期：2026-07-23
- 模块：`agent-harness`
- 基线：8 课、28 个候选资源、24 道面试题、16 道测验、3 个交互实验
- 发布集合：29 个资源；新增 2 个核心来源，移除 1 个无法核验的候选视频
- 当前阶段：来源门禁通过；知识笔记与最终质量分待写作后补录

## 来源变更与发布决定

正文核验发现，原集合没有直接支撑 Harness 控制面与 sandbox 执行面边界的核心来源，也没有支撑队列 receive、lease/visibility、ack/delete、redelivery 与重复投递语义的核心来源。根据设计中的证据缺口 amendment 规则，新增：

1. `res-harness-openai-sandboxes`：OpenAI 官方 Sandbox Agents 文档，直接区分 harness control plane 与 sandbox compute plane。
2. `res-harness-aws-sqs-visibility`：AWS 官方 SQS visibility timeout 文档，直接说明接收后暂时不可见、处理成功后删除、超时后重新可见以及至少一次投递边界。

`res-harness-bilibili` 在页面访问和精确 BV 搜索中均无法核验标题、作者、简介或字幕，不能建立合法 evidence card，因此从正式 registry 与 `harness-08.resourceIds` 移除。抖音条目可核验标题、作者、日期、时长和简介，但无字幕或等价正文，只保留为 `community/extension`，不得出现在关键机制章节的 `sourceIds` 中。

## 最终 evidence ledger

`coverage` 只记录实际正文支持的内容；课程字段、资源标题和现有 `value` 不计作外部证据。

| Resource ID | Lesson | Body | Authority / role | 实际 coverage | 主要限制 |
| --- | --- | --- | --- | --- | --- |
| `res-harness-openai-running` | 01 | full | official / core | Runner 循环、终止输出、handoff、tool call、max turns、run config | 当前 Python SDK 语义；不定义跨框架状态机与完整 hooks |
| `res-harness-openai-sandboxes` | 01, 04 | full | official / core | Harness 控制面与 sandbox 执行面分离；manifest、capability、session、snapshot、凭证与挂载边界 | Beta；OpenAI SDK 与 provider-specific 语义，不证明绝对隔离 |
| `res-harness-openai-hitl` | 03, 08 | full | official / core | 逐调用审批、中断、RunState 序列化、批准/拒绝与长暂停恢复 | 不承诺恢复时自动重做认证、授权、资源或策略校验 |
| `res-harness-openai-tools` | 03 | full | official / core | 工具分类、schema、Pydantic 参数约束、timeout、动态启用、approval gate | 不提供完整版本化 registry、scope、幂等和审计字段 |
| `res-harness-openai-run-state` | 02 | full | official / core | 可序列化运行快照、上下文、usage、interruptions、恢复 | 当前 SDK schema；不是事件日志或通用持久化协议 |
| `res-harness-langgraph-persistence` | 02 | full | official / core | Checkpointer 的 thread state/history 与跨 thread store 区分、retention | LangGraph checkpoint/replay 语义，不可外推 |
| `res-harness-langgraph-interrupts` | 03, 08 | full | official / cross-check | interrupt 持久暂停与 resume；恢复从节点开头重跑；前置副作用须幂等 | 不提供认证、资源授权、审批摘要和 handoff schema |
| `res-harness-langgraph-fault-tolerance` | 05, 06 | full | official / cross-check | 节点 retry、timeout、handler、失败 provenance、graceful drain | `>=1.2` 的框架语义；buffered writes 清理不等于外部副作用回滚 |
| `res-harness-temporal-execution` | 01 | full | official / core | Durable workflow execution、event-history replay、进程与 run 生命周期分离 | Durable execution 不保证外部副作用 exactly-once |
| `res-harness-temporal-event` | 02 | full | official / core | 追加事件历史、恢复、审计与 Activity 事件 | Temporal 事件模型；有历史大小等平台限制 |
| `res-harness-temporal-retry` | 05 | full | official / core | Activity/Workflow 默认差异、重试参数、non-retryable error、overall timeout | Activity 默认可无限重试；该页不提供 jitter；不可照抄默认值 |
| `res-harness-azure-durable` | 01 | full | official / cross-check | Orchestrator/activity/entity/client、确定性 replay、suspend/resume/terminate | Activity 至少一次；不保证外部副作用 exactly-once；canonical URL 已迁移 |
| `res-harness-aws-idempotent` | 06 | full | expert / core | caller-provided intent token、原子去重记录、同 key 不同意图、late arrival | AWS 工程模式；需服务端配合，Harness 生成 UUID 本身不构成幂等 |
| `res-harness-aws-timeouts` | 05 | full | expert / core | timeout、有限 retry、capped backoff、jitter、retry amplification、幂等条件 | 厂商工程经验；HTML 重定向，正文由官方 PDF/等价官方页面核验 |
| `res-harness-sre-cascading` | 05, 07 | full | expert / core | 级联失败、fail early、有界队列、load shedding、retry budget、deadline/cancel propagation | Google SRE 经验，不提供业务 rollback 与幂等协议 |
| `res-harness-sre-overload` | 07 | full | expert / core | 按资源衡量容量、租户配额、客户端节流、criticality 与过载保护 | 不提供 durable queue 的 lease、ack、redelivery |
| `res-harness-aws-sqs-visibility` | 07 | full | official / core | receive 后暂时不可见、delete-as-ack、visibility 延长/到期、redelivery、至少一次边界 | SQS 特定实现；visibility timeout 不是处理 exactly-once 保证 |
| `res-harness-gvisor` | 04 | full | official / core | 用户态 application kernel、Sentry/Gofer、缩小宿主内核攻击面 | 项目自述；不支持绝对安全或固定强弱排序 |
| `res-harness-docker-seccomp` | 04 | full | official / core | Syscall allowlist、默认拒绝动作和自定义 profile | 只覆盖 syscall 层；默认 profile 仅是中等防护 |
| `res-harness-docker-resources` | 04 | full | official / core | 容器默认无 CPU/内存上限、硬软限制、OOM 与 CFS 约束 | 不覆盖全部磁盘、pids、FD、网络和墙钟预算 |
| `res-harness-docker-rootless` | 04 | full | official / core | Daemon 与容器非 root、user namespace、subuid/subgid | 只是身份/daemon 权限层，不是完整 sandbox |
| `res-harness-firecracker` | 04 | full | official / cross-check | KVM microVM、精简设备模型、jailer、cgroup/chroot/seccomp、trust zones | 项目自述且 `main` 可变化；不证明所有威胁模型下最优 |
| `res-harness-nist-tool-use` | 03, 08 | full | official / cross-check | 工具功能、访问、风险、可逆性、监控与自治 taxonomy | Workshop lessons，不是控制标准或实现规范 |
| `res-harness-owasp-agency` | 03 | full | expert / core | 最小功能、最小权限、用户上下文、高影响审批、下游 complete mediation | 安全指南，不定义具体状态机和恢复协议 |
| `res-harness-agent-learning-hub` | 08 | full | community / extension | 中文 Harness 学习路线、trace/retry/timeout/cost/permission/HITL 导航 | 社区 README；不支撑状态、handoff 或可靠性核心结论 |
| `res-harness-agentscope-runtime` | 01, 07 | full | official / cross-check | AaaS、SSE、生命周期、sandbox、状态 load/save、interrupt 的项目实现 | 仓库进入只读迁移阶段并计划归档，能力并入 AgentScope 2.0；第一方实现主张，不是通用保证 |
| `res-harness-smolagents-code` | 04 | full | official / extension | CodeAgent、显式工具列表、authorized imports 与执行日志教学示例 | Import allowlist 不等于内核、网络、挂载、凭证或资源隔离 |
| `res-harness-hello-agents-framework` | 01 | full | community / extension | 框架对 loop、tool、state、logging、callbacks 的抽象与中文示例 | 版本时敏；不支撑幂等、副作用恢复或生产可靠性保证 |
| `res-harness-douyin` | 08 | metadata-only | community / extension | 可核验标题《十分钟拆解Agent Skill如何让AI稳定执行任务》、作者老傅1024、2026-06-02、08:06 与简介 | 无字幕/正文，不支撑任何 assessed outcome 或知识笔记关键机制 |

最终统计：`full=28`、`metadata-only=1`、`failed=0`、`brokenReferenceCount=0`。所有时敏实现语义以 2026-07-23 为核验日期。

## 逐课 assessed-outcome 覆盖矩阵

| Lesson | 核心 assessed outcomes | Core / cross-check evidence | 证据结论与写作边界 |
| --- | --- | --- | --- |
| `harness-01` | Agent/Harness 边界；Runner 生命周期；hooks | OpenAI Sandboxes、OpenAI Running、Temporal Execution；Azure/AgentScope 交叉 | 控制面/执行面有直接证据；十状态和 hook 契约是课程的规范化工程模型，必须标为课程模型而非某 SDK 标准 |
| `harness-02` | State/event/checkpoint 区分；保存与恢复 | OpenAI RunState、LangGraph Persistence、Temporal Event | 可综合出职责分离；原子提交、lease 与 schema migration 是课程工程设计，不得归给单一框架 |
| `harness-03` | Registry；认证/授权/审批；恢复重验 | OpenAI Tools/HITL、OWASP；LangGraph/NIST 交叉 | 工具 schema、最小权限、审批暂停充分；参数摘要、策略版本、TOCTOU 重验是宿主必须补做的课程安全设计，不能声称 SDK 自动提供 |
| `harness-04` | Sandbox 层次；最小权限；资源预算与清理 | OpenAI Sandboxes、gVisor、Docker 三页；Firecracker 交叉 | 可比较机制边界但不能绝对排序；磁盘/pids/FD/网络/墙钟与清理清单为威胁模型驱动的综合配置 |
| `harness-05` | Budget；timeout/deadline/cancel；有限 retry | AWS Timeouts、Temporal Retry、SRE Cascading；LangGraph 交叉 | 必须注明 Temporal/LangGraph 默认差异；“错误可重试”不等于“动作可安全重放” |
| `harness-06` | 幂等；未知终态；对账与安全 resume | AWS Idempotent；LangGraph Fault Tolerance 交叉 | client token 与原子去重有核心证据；side-effect ledger 与五路恢复决策为课程协议；不得承诺通用 exactly-once |
| `harness-07` | 并发限制；bounded queue；lease/ack/redelivery；背压 | AWS SQS Visibility、SRE Overload/Cascading；AgentScope 交叉 | 队列消费与重复投递证据闭环；教学 Queue Lab 不代表通用调度器，FIFO 和公平性须说明适用条件 |
| `harness-08` | 状态区分；耐久 HITL；handoff 与 artifact | OpenAI HITL；LangGraph/NIST 交叉 | 暂停恢复有核心证据；blocked/failed/cancelled 原因码及 handoff/artifact 字段明确标为本课程工程综合模板，不冒充行业协议 |

## 跨来源冲突与强制边界

- OpenAI HITL 描述从保存的 RunState 继续；LangGraph 明确恢复会从节点开头重跑。正文必须分别陈述，不能合并成统一恢复保证。
- Temporal Activity 默认 retry 可以无限；LangGraph 当前 retry 默认与参数不同。课程统一要求显式有限重试，但不能说这是框架共同默认。
- LangGraph 清理 timed-out node 的 buffered writes 不等于远端工具副作用回滚。
- OpenAI 支持 run 内 sticky approval；课程要求执行前重验身份、调用参数、工具/策略版本与资源状态。官方页没有证明这些重验会自动发生。
- Docker seccomp、rootless、gVisor 和 Firecracker 位于不同边界，来源不支持简单的绝对安全排序。
- AWS SQS visibility timeout 是临时消费租约的具体实现直觉，不保证消息或业务效果只发生一次；消费者仍须幂等。
- Durable orchestration、checkpoint 和 replay 都不能推出任意外部工具 exactly-once。

## 质量与发布记录

| Lesson | Structure | Coverage | Evidence | Teaching | Contract | Total | Broken refs | Status |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `harness-01` | 25 | 20 | 24 | 19 | 10 | 98 | 0 | author + spec + quality passed |
| `harness-02` | 25 | 20 | 24 | 19 | 10 | 98 | 0 | author + spec + quality passed |
| `harness-03` | 25 | 19 | 25 | 19 | 10 | 98 | 0 | author + spec + quality passed |
| `harness-04` | 25 | 20 | 25 | 19 | 10 | 99 | 0 | author + spec + quality passed |
| `harness-05` | 25 | 20 | 24 | 20 | 10 | 99 | 0 | author + spec + quality passed |
| `harness-06` | 25 | 20 | 25 | 19 | 10 | 99 | 0 | author + spec + quality passed |
| `harness-07` | 25 | 20 | 25 | 20 | 10 | 100 | 0 | author + spec + quality passed |
| `harness-08` | 25 | 20 | 25 | 20 | 10 | 100 | 0 | author + spec + quality passed |

最终发布前还需补录每课覆盖矩阵审查、独立规格审查、独立质量审查、自动化测试、桌面/390px/320px 浏览器验收、Vercel Preview/Production SHA 与 GitHub Pages 关闭状态。
