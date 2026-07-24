function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend07Note = deepFreeze({
  readingMinutes: 26,
  introduction: '一个 AI 服务能响应健康检查，不代表它已经加载模型、可以接收新流量，也不代表重启能修复当前故障。生命周期协议决定实例何时建立依赖、何时加入负载均衡、何时摘流和排空；可观测性则提供每个决定的证据。本课把 ASGI lifespan、Kubernetes startup/readiness/liveness 与请求、流、队列、worker、缓存和模型指标连接起来，目标是在发布和故障期间既不静默丢工作，也不让错误探针制造重启风暴。',
  sections: [
    {
      id: 'lifecycle-states',
      title: '应用生命周期不只是进程存活',
      paragraphs: [
        'ASGI lifespan 让服务器与应用交换 startup 和 shutdown 消息，适合初始化连接池、客户端、配置与本地资源。startup complete 表示应用初始化流程完成，却不自动说明所有远端依赖永远健康；shutdown complete 表示应用清理结束，也不证明编排器给了足够时间排空所有在途任务。',
        '实例状态可以建模为 starting、ready、draining、stopped。starting 阶段加载必要资源并拒绝业务流量；ready 才接纳请求；收到终止信号后先进入 draining，让 readiness 失败并停止领取新任务，再等待 SSE、数据库提交和 worker 到安全点。超出 drain deadline 的工作必须落入可恢复状态，而不是仅打印一条取消日志。',
        '启动失败应快速暴露具体阶段，避免服务看似运行却永远不 ready。可选依赖可以降级，关键 schema 不兼容则应阻止接流量。初始化也要幂等，因为编排器可能重启进程；不要在每次 startup 无条件创建重复外部资源或执行无法回滚的迁移。',
      ],
      keyPoints: ['用明确状态控制接流、摘流和排空', 'lifespan 消息不替代编排与业务恢复协议'],
      sourceIds: ['res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'],
    },
    {
      id: 'probe-semantics',
      title: 'Startup、readiness、liveness 各答一题',
      paragraphs: [
        'startup probe 回答慢启动是否已经跨过初始化阶段，在成功前可以保护应用不被 liveness 过早重启。readiness 回答实例当前是否应接收新流量，失败会从服务端点摘除但不必杀进程。liveness 只回答进程是否陷入无法自行恢复的状态，失败会触发重启，因此阈值应最保守。',
        '短暂模型供应商变慢通常应影响业务降级或 readiness，而不是让所有实例同时 liveness 失败。若每个实例都因为共同依赖抖动重启，会损失本地缓存、连接与恢复容量，形成级联故障。探针本身必须便宜、有超时、不执行昂贵 fan-out，也不能依赖正处于故障中的完整请求路径。',
        'readiness 也不能简单要求所有可选依赖健康。可以根据服务承诺区分核心数据库不可用、某模型池不可用和缓存不可用：前者可能摘流，后两者也许降级到其他模型或回源。每个判定要写明连续失败次数、恢复窗口和操作结果，并用故障注入验证不会抖动。',
      ],
      keyPoints: ['readiness 控制流量，liveness 控制重启', '探针阈值和依赖范围应避免级联放大'],
      sourceIds: ['res-backend-kubernetes-probes', 'res-backend-sre-cascading'],
    },
    {
      id: 'graceful-shutdown',
      title: '优雅关闭先停止接纳再处理在途',
      paragraphs: [
        '滚动发布或节点维护开始时，实例先把 readiness 设为失败，等待负载均衡传播，再停止新的 HTTP 接纳和队列领取。现有短请求可以完成，长 SSE 可以发送服务关闭事件或转为可查询 job，worker 则提交检查点、释放租约或完成有界临界区。顺序错误会让新工作不断进入即将退出的进程。',
        '终止宽限期必须覆盖摘流传播、合理的请求完成和清理预算，却不能依赖无限等待。每类工作定义 drain 策略：数据库事务通常短暂完成，模型调用可能请求取消并保存 unknown outcome，后台 job 让租约重分配。最终强杀仍可能发生，所以优雅关闭是减少中断窗口，不是替代持久恢复。',
        '发布兼容窗口要覆盖旧实例和旧队列消息。新代码读取旧 payload、旧代码读取新数据库 schema 都需要前后兼容迁移；先扩展 schema，再发布双读写或兼容代码，最后清理旧字段。只验证新 pod readiness 而不检查在途旧任务，仍可能在看似成功的部署后产生数据错误。',
      ],
      keyPoints: ['摘流与停止领取必须早于进程退出', 'graceful shutdown 仍依赖持久状态和重投恢复'],
      sourceIds: ['res-backend-asgi-lifespan', 'res-backend-kubernetes-probes'],
    },
    {
      id: 'observability-model',
      title: '观测贯穿请求到模型的身份链',
      paragraphs: [
        '一次业务运行可能经历 HTTP request、SSE stream、job、message、worker attempt、cache lookup 和 model request。为它们分配 requestId、runId、jobId、messageId、attempt 和 traceId，并在边界传播关联。指标用于聚合趋势，日志保存离散状态与高基数身份，trace 展示跨服务阶段；三者通过稳定身份互相跳转。',
        'Prometheus 的通用 instrumentation 建议从 online serving 的请求、错误与延迟出发，但 AI 服务还应观察 TTFT、完整时长、活跃流、队列深度和年龄、重试、缓存命中、模型 token、batch 和资源利用。vLLM 暴露的当前 health、load 或 metrics 能作为实现参考，项目字段不等于所有模型服务的通用规范。',
        '标签必须控制基数。status、route、model_family 和 error_class 适合有限枚举，requestId、tenantId、完整模型版本或 prompt 不应直接成为 metric label。高基数不仅增加费用，还会让监控在故障高峰失效。敏感 prompt 默认不记录，只保存经过批准的摘要、长度、哈希或安全分类。',
      ],
      keyPoints: ['用身份链关联请求、任务、worker、缓存和模型', '聚合指标控制基数，细粒度身份进入日志和 trace'],
      sourceIds: ['res-backend-prometheus', 'res-backend-vllm-server'],
    },
    {
      id: 'alerts-runbooks',
      title: '告警必须指向可执行诊断',
      paragraphs: [
        '告警从用户症状和错误预算出发，例如成功率下降、p99 或 TTFT 超标、队列年龄逼近 deadline，而不是每个内部指标轻微波动都分页。容量指标作为诊断上下文：API CPU、连接池、worker slot、Redis 淘汰、数据库锁、GPU 内存和模型 batch。症状与原因分层可以减少告警风暴。',
        '运行手册沿 client、gateway、API、queue、worker、database、cache、model 逐层反证。若活跃流增加但模型 token 吞吐稳定，检查慢消费者；队列年龄升高但 worker 空闲，检查路由或租约；所有实例 readiness 同时失败，检查共同依赖和探针条件。每一步写明查询、预期、下一分支和安全缓解动作。',
        '发布前演练慢启动、依赖抖动、SIGTERM、worker 崩溃和指标后端不可用。验证 startup/readiness/liveness 的变化顺序、负载均衡摘流、在途工作最终状态和告警是否到达。观测系统本身失败时，服务不能阻塞业务关键路径；日志和指标发送应有界并可降级。',
      ],
      keyPoints: ['从用户症状触发告警，以容量信号定位原因', '用发布和故障演练验证 probe、drain 与运行手册'],
      sourceIds: ['res-backend-prometheus', 'res-backend-sre-cascading', 'res-backend-kubernetes-probes'],
    },
    {
      id: 'release-observation',
      title: '发布观察窗口连接变更与症状',
      paragraphs: [
        '每次发布生成 deploymentId，并写入日志、trace 与有限基数指标。金丝雀期间比较新旧版本的成功率、TTFT、完整延迟、队列年龄、取消和结果质量，而不是只看 pod 是否 ready。若共享数据库或模型依赖同时变化，要标注事件时间，避免把外部抖动误判为代码回归。',
        '回滚条件应在发布前量化，并包含最小观察样本和最长等待时间。快速故障可以立刻停止接流，缓慢泄漏或尾延迟回归则需要更长窗口。执行回滚后继续观察旧实例 readiness、在途新版本任务和消息 schema，确认用户症状真正恢复，而不是仪表盘短暂变绿。',
        '复盘把时间线、探针变化、告警、人工动作和最终权威状态合并。重点寻找哪条信号最早能区分故障、哪个自动动作放大影响，以及运行手册哪里需要补充。把结论转成探针测试、告警规则或发布门禁，才会让下一次部署比本次更可预测。',
      ],
      keyPoints: ['用 deploymentId 比较版本级用户症状', '回滚后仍要验证在途工作和协议兼容'],
      sourceIds: ['res-backend-prometheus', 'res-backend-kubernetes-probes', 'res-backend-sre-cascading'],
    },
  ],
  misconceptions: [
    { claim: '健康端点返回 200 就表示实例可以接流量。', correction: '进程存活、启动完成、可接流量和依赖降级是不同判断，应由不同状态表达。' },
    { claim: '依赖超时就应该让 liveness 失败重启。', correction: '共同依赖抖动时同步重启会损失容量，liveness 应只处理进程无法自愈的问题。' },
    { claim: '收到 SIGTERM 后继续接流量直到退出最简单。', correction: '应先 readiness 摘流并停止领取新工作，再有界 drain 和提交可恢复状态。' },
    { claim: 'requestId 适合直接作为 Prometheus 标签。', correction: '逐请求标识会造成高基数，应进入结构化日志或 trace，再与聚合指标关联。' },
    { claim: '优雅关闭可以保证所有任务完整结束。', correction: '强杀和 deadline 仍存在，持久状态、租约、幂等和重投才提供最终恢复路径。' },
  ],
  recap: [
    'ASGI lifespan 管理应用初始化与清理消息。',
    'startup、readiness、liveness 分别控制慢启动、流量和重启。',
    '关闭顺序是摘流、停止领取、drain、提交恢复状态再退出。',
    '身份链把 HTTP、SSE、job、worker、cache 与 model 关联。',
    '指标聚合趋势，日志和 trace 承担高基数细节。',
    '告警从用户症状出发并连接可执行运行手册。',
  ],
  nextStep: '为服务写出 starting、ready、draining、stopped 状态表，并分别实现 startup、readiness、liveness 与 shutdown 判定。部署两个副本后模拟慢启动、模型供应商抖动和 SIGTERM，观察端点摘流顺序、现有 SSE 与 job 的最终状态。同步建立请求率、错误、TTFT、队列年龄和 worker 利用率仪表盘，用统一身份链从一条告警追到具体模型调用和恢复动作。',
  tests: {
    status: 'passed',
    commands: ['node --test tests/backend-engineering-data.test.js', 'npm test'],
    results: [
      { command: 'node --test tests/backend-engineering-data.test.js', exitCode: 0, summary: '9 项目标数据测试通过。' },
      { command: 'npm test', exitCode: 0, summary: '全量测试通过。' },
    ],
  },
});
