function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend08Note = deepFreeze({
  readingMinutes: 28,
  introduction: '部署不是把本地进程装进镜像，扩容也不是把副本数调大。API、worker、PostgreSQL、Redis 和模型服务分别受连接、CPU、队列、内存、显存与 token 调度约束，错误地一起复制可能让成本上升却让尾延迟更差。本课把前七课的协议与可靠性边界放进真实发布流程，通过容器、独立扩容单元、动态批处理、负载测试和故障树完成一个可评审的 AI 后端设计包。',
  overviewVisualId: 'visual-backend-08-overview',
  overviewVisualSectionId: 'scaling-units',
  sections: [
    {
      id: 'container-boundary',
      title: '容器封装进程而非消除运行约束',
      paragraphs: [
        'Docker build best practices 直接说明可重建构建、build cache 和在镜像中用 USER 切换 non-root 用户等建议；应用仍要按所选基础镜像验证 UID、文件权限与运行时能力。FastAPI 容器文档补充当前框架的进程和复制取舍。两者都是版本化实现资料，Dockerfile Reference 仍未单列，不能把某个示例写成所有运行时的永久规则。',
        '一个容器内启动多个 API worker 可能提高单机 CPU 利用，却会为每个进程复制 Python 堆、连接池甚至模型内存。在 Kubernetes 等编排环境中，常见选择是每容器单进程、靠副本扩展和故障隔离；但这不是铁律。决定应基于内存、启动成本、连接数量、信号传播和实际吞吐测量。',
        '模型权重和 KV cache 让 AI 容器的启动与内存边界更突出。startup 必须覆盖下载、加载和预热，readiness 只能在能够服务后成功；滚动发布要控制 surge，避免新旧副本同时加载耗尽节点显存。镜像版本、模型版本、配置和 schema 迁移都要进入发布证据。',
      ],
      keyPoints: ['镜像构建与运行配置边界要清晰', '进程数和副本数由内存、连接和故障隔离证据决定'],
      sourceIds: ['res-backend-fastapi-containers', 'res-backend-docker-build-best-practices'],
    },
    {
      id: 'scaling-units',
      title: '按瓶颈拆分独立扩容单元',
      paragraphs: [
        'API ingress 可能受连接和序列化限制，异步 worker 受任务类型和 CPU 限制，数据库受连接、锁和 I/O 限制，模型 server 受显存、scheduler 与 token 吞吐限制。把所有组件放进同一副本会让扩 API 顺便复制昂贵模型，也让模型故障拖走接入能力。部署拓扑应让不同瓶颈可分别扩容和降级。',
        'vLLM 的 API server、engine core、scheduler、KV cache 和 GPU worker 拓扑提供一个当前实现样本，帮助定位排队和内存位置；它是项目实现，不代表通用规范。不同版本、并行策略、模型和硬件会改变进程关系。架构图应标注观察到的实现版本与待验证假设，而不是把文档组件名变成永久事实。',
        '自动扩容信号要接近瓶颈。API 可看并发与 CPU，worker 可看队列年龄和可用 slot，模型可看排队请求、KV cache 压力和 token 吞吐。只按 CPU 扩 GPU 服务可能完全失效；只按队列深度又可能追赶已经超过 deadline 的任务。扩容还有加载延迟和冷缓存，准入必须在新容量 ready 前保护系统。',
        '部署拓扑明确拆成 stateless API 与 stateful workers：autoscaling 不替代准入，canary 和 rollback 携带 model/prompt/tool 版本，migrations 保持新旧 payload 兼容，provider failover 复核质量与 capability，regional boundary 决定数据能否跨区。系统设计、网关与 AgentFS 都是实现观察；诊断分别判断 overloaded、slow、wrong、unsafe。',
      ],
      keyPoints: ['API、worker、数据层和模型层分别定位饱和资源', '项目拓扑是验证线索而非通用架构标准'],
      sourceIds: ['res-backend-vllm-architecture', 'res-backend-vllm-server', 'res-backend-primary-javaguide-system-design', 'res-backend-primary-javaguide-gateway', 'res-backend-primary-feishu-agentfs'],
      visuals: [{ visualId: 'visual-backend-08-detail', afterParagraph: 1 }],
    },
    {
      id: 'batching-tradeoff',
      title: '动态批处理交换吞吐和等待',
      paragraphs: [
        '动态 batching 会短暂等待多个请求组成批次，以提高设备利用率和吞吐；等待窗口过大则直接增加 TTFT，batch 过大还可能让长请求拖慢短请求。请求长度、输出长度和到达分布都会影响收益，因此必须同时测 throughput、TTFT、完整延迟和 p95/p99，而不是只展示每秒请求数。',
        'Ray Serve 的 batch wait 与 batch size、vLLM 的 scheduler 行为，以及 Sarathi-Serve 对 prefill/decode 调度的研究提供了不同实现视角。它们的机制有学习价值，但项目配置与论文结果都依赖版本、GPU、模型和工作负载，不可外推为所有 AI 服务的性能保证。参数只能通过目标流量回放选择。',
        '公平性与取消也进入 batching 协议。一个超长 prompt 不应无限阻塞短请求，已超过 deadline 的排队项应在占用 GPU 前丢弃，客户端断线后的运行是否继续取决于业务状态。批次内部单个请求失败时，响应拆分必须保持身份与顺序，不能让一个异常污染其他租户结果。',
      ],
      keyPoints: ['batching 优化必须同时衡量吞吐与尾延迟', '论文和框架参数需要在目标硬件与流量重新验证'],
      sourceIds: ['res-backend-ray-batching', 'res-backend-sarathi', 'res-backend-vllm-architecture'],
    },
    {
      id: 'load-test',
      title: '负载测试绑定模型、硬件和流量',
      paragraphs: [
        '测试报告先声明模型与精度、GPU/CPU、并行方式、输入输出长度分布、并发模式、缓存冷热、工具调用和成功判定。coordinated omission 论文指出，closed synchronous generator 会因等待上一响应而跳过原本 intended arrivals，从而低估高延迟；因此至少加入按计划到达的开放环或补偿记录，并明确该结论来自数据库 benchmark 方法研究而非 LLM 性能数字。',
        '指标同时覆盖接纳率、完成率、队列和错误；延迟中 TTFT 是首 token 时间，ITL 是相邻输出 token 间隔，TPOT 是首 token 后平均每输出 token 时间，E2EL 是端到端总延迟。vLLM Spyre 页面为这些定义提供当前实现参照，但不是所有 backend 的通用指标实现。报告还要给 p50/p95/p99、tokens/s、成本与质量，并保留原始配置和版本。',
        '寻找的是安全工作区而非极限峰值。逐步增加负载，观察哪项资源先饱和、尾延迟在哪里陡升，然后将生产准入设在有恢复余量的位置。再让模型延迟翻倍、Redis 清空、worker 崩溃和数据库连接受限，验证降级、队列和恢复路径；没有故障阶段的压测只能说明理想条件。',
      ],
      keyPoints: ['负载报告必须公开模型、硬件和请求分布', '用饱和曲线与故障阶段确定安全工作区'],
      sourceIds: ['res-backend-vllm-server', 'res-backend-ray-batching', 'res-backend-sarathi', 'res-backend-coordinated-omission', 'res-backend-vllm-performance-tpot'],
    },
    {
      id: 'deployment-diagnosis',
      title: '滚动发布与故障树共享证据',
      paragraphs: [
        '滚动发布先部署兼容 schema 和新实例，等待 startup/readiness 成功后逐步接流量；旧实例先摘流、停止领取并 drain。金丝雀比较成功率、TTFT、尾延迟、队列和结果质量，超过阈值自动停止或回滚。回滚也要考虑数据库和队列 schema，不能假设镜像退回就恢复全部兼容。',
        '故障树从用户症状逆推：客户端无事件可能是网关缓冲、API 饱和、队列积压、worker 无租约、数据库锁、缓存击穿或模型变慢。沿 requestId、jobId、attempt 和 modelRequestId 查询每层最近证据，用排除法缩小范围。先确认权威状态，再决定重试、切流、扩容、降级或人工对账。',
        'Datawhale 的中文项目可以作为实现导航，帮助学习者串联 API、数据库、模型调用和部署；但课程示例不承担核心生产主张。最终设计包仍以 OpenAPI 契约、状态机、容量实验和故障证据为准，明确哪些是规范要求、当前项目行为、论文启发和本地验证结果，避免把演示代码直接升级为可靠性承诺。',
      ],
      keyPoints: ['发布包含兼容、接流、摘流、drain 和回滚证据', '诊断沿全链路身份逐层反证并先确认权威状态'],
      sourceIds: ['res-backend-openapi', 'res-backend-fastapi-containers', 'res-backend-datawhale'],
    },
    {
      id: 'design-defense',
      title: '设计答辩用证据连接每项取舍',
      paragraphs: [
        '综合设计评审不只展示一张整洁架构图，而要从一个请求贯穿同步、SSE 与后台 job，说明身份、deadline、状态和权威存储如何变化。每个箭头标出协议、超时、幂等与容量限制；每个存储标出所有权和恢复来源；每个副本组标出独立扩容信号和启动成本。',
        '对关键取舍准备备选方案。例如选择 SSE 而非 WebSocket 的客户端需求，选择 PostgreSQL 权威加 Redis 缓存而非双写事实，选择 API 与模型服务分离而非同容器。比较复杂度、故障面、成本和验证结果，明确在什么流量或产品变化下需要重新评估，而不是把当前方案描述成唯一答案。',
        '证据包包含契约测试、崩溃矩阵、负载原始配置、饱和曲线、故障树和发布演练记录。规范支持协议语义，项目文档解释当前实现，论文提出机制假设，本地实验决定容量参数。清楚标注尚未覆盖的模型、硬件和流量，能让评审者区分已证明能力与后续风险。',
      ],
      keyPoints: ['架构图每条边都附协议与恢复边界', '规范、实现、研究和实验分别承担不同证据角色'],
      sourceIds: ['res-backend-openapi', 'res-backend-vllm-architecture', 'res-backend-sarathi'],
    },
  ],
  misconceptions: [
    { claim: '容器化以后应用天然可以水平扩容。', correction: '状态、连接、模型内存、启动时间和共享瓶颈仍需拆分与测量，镜像只提供封装边界。' },
    { claim: '增加模型副本一定会线性提高吞吐。', correction: '显存、带宽、调度、数据库和到达分布都可能成为共享瓶颈，必须通过饱和曲线验证。' },
    { claim: '动态 batching 的 batch 越大越好。', correction: '更大批次可能提高吞吐却增加等待和尾延迟，需要按目标流量联合优化。' },
    { claim: '论文中的性能提升可以直接写入生产目标。', correction: '结果绑定硬件、模型、版本和请求分布，只能作为假设并在本地复现。' },
    { claim: '滚动发布失败时换回旧镜像就一定安全。', correction: '数据库、队列消息和外部协议可能已演进，回滚也需要前后兼容和恢复计划。' },
  ],
  recap: [
    '容器封装进程与依赖，但不会消除容量和状态约束。',
    'API、worker、数据库、缓存和模型服务应按瓶颈独立扩容。',
    'vLLM 与 Ray 行为是当前项目实现，不代表通用规范。',
    '动态 batching 必须联合衡量吞吐、TTFT 和尾延迟。',
    '负载测试结论绑定模型、硬件、版本和请求分布。',
    '发布与诊断依靠兼容窗口、身份链和故障证据。',
  ],
  nextStep: '完成一份研究报告服务设计包：画出 API、queue、worker、PostgreSQL、Redis 和 model server 的独立扩容边界，附上 OpenAPI 与状态机；在固定模型和硬件上运行稳态、突发、长短混合与依赖变慢测试，记录吞吐、TTFT、p95/p99、队列年龄、错误和成本。最后执行一次金丝雀发布与回滚演练，用故障树证明每项异常都有检测、降级和恢复证据。请另一位工程师仅凭证据包复现一次容量结论和故障定位。',
  tests: {
    status: 'passed',
    commands: ['node --test tests/backend-engineering-data.test.js', 'npm test'],
    results: [
      { command: 'node --test tests/backend-engineering-data.test.js', exitCode: 0, summary: '9 项目标数据测试通过。' },
      { command: 'npm test', exitCode: 0, summary: '全量测试通过。' },
    ],
  },
});
