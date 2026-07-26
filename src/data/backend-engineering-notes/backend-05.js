function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const backend05Note = deepFreeze({
  readingMinutes: 25,
  introduction: 'AI 后端同时需要长期可信的业务事实和极低延迟的临时加速数据，PostgreSQL 与 Redis 因而经常一起出现。真正的风险不是选错产品，而是没有声明谁是权威：缓存命中很快，却可能过期、误命中或被淘汰；数据库事务可靠，却不能原子覆盖 broker 和模型 API。本课从事实所有权、事务边界和缓存失效出发，设计即使 Redis 被清空也能恢复、即使并发请求交错也不会泄露租户数据的存储协议。',
  sections: [
    {
      id: 'source-of-truth',
      title: '先为每类数据指定权威来源',
      paragraphs: [
        'job 状态、用户权限、计费记录、幂等键和最终报告索引通常需要持久、可审计的权威存储。Redis 适合缓存、短租约、速率计数和可重建派生结果，但 key 可能因 TTL、淘汰、故障切换或运维操作消失。因此设计要求 Redis 非权威、可重建；清空缓存后正确性不应改变，只允许性能暂时下降。',
        '可以为每个实体写一张所有权表：规范字段由哪张 PostgreSQL 表保存，缓存 key 如何从权威版本推导，谁能写入，何时失效，重建成本和允许陈旧窗口是多少。若同一业务字段可以在数据库、Redis 和对象存储分别被修改而没有单一版本来源，任何双写顺序都会留下难以解释的冲突。',
        '读取路径也要说明故障行为。Redis 超时应回源还是快速失败，取决于缓存内容是否只是优化；回源必须有限并受并发保护，否则缓存故障会瞬间把数据库打垮。对不可丢失状态，缓存 miss 绝不能被解释为资源不存在，必须查询权威存储或返回无法确认。',
      ],
      keyPoints: ['缓存丢失只能影响性能不能改变业务事实', '用所有权表明确写入者、版本和失效规则'],
      sourceIds: ['res-backend-postgres-transactions', 'res-backend-redis-eviction'],
    },
    {
      id: 'transaction-boundary',
      title: '数据库事务保护本地不变量',
      paragraphs: [
        'PostgreSQL 事务把一组数据库操作变成 all-or-nothing，并让并发会话按隔离规则观察变化。创建 job 时，可以在一个事务内检查幂等键、插入 job、写初始事件和 outbox 意图；任何一步失败都回滚。唯一约束和条件更新比“先查再写”的应用逻辑更能抵抗并发竞争。',
        '隔离级别并不自动替业务选择正确不变量。两个请求读取相同配额后分别写入，可能在某些隔离策略下都认为有余额；需要行锁、原子更新、唯一约束或更强隔离，并处理 serialization failure。事务应短小，不能在持有锁时等待模型数十秒，否则连接和锁会把慢依赖传播给所有请求。',
        '单库事务不能原子覆盖 broker publish、模型 API、邮件或对象存储。AWS transactional outbox 指南把这个 dual write 缺口建模为：在数据库事务内写 outbox 记录，独立 relay 重试发送，再由消费者以消息标识去重。outbox 协调“业务事实已提交”和“需要发布”的意图，却没有让外部副作用自动 exactly-once；relay 仍可能重复发布，每个边界仍需幂等、查询或补偿。',
      ],
      keyPoints: ['用数据库约束与条件写守护并发不变量', '事务外动作通过 outbox 和幂等协调'],
      sourceIds: ['res-backend-postgres-transactions', 'res-backend-aws-transactional-outbox'],
    },
    {
      id: 'cache-aside',
      title: 'Cache-aside 的难点在失效窗口',
      paragraphs: [
        '典型 cache-aside 读取先查缓存，miss 后读数据库并回填；写入先提交数据库，再删除或更新缓存。任何顺序都有竞争窗口：写后删前可能读到旧值，删除后另一个读者可能把旧查询结果重新写回。解决方案不是声称“最终一致”就结束，而是根据业务容忍度引入版本 key、短 TTL、事件失效或读取时版本校验。',
        '缓存击穿发生在热门 key 同时过期，大量请求并发回源。Go x/sync/singleflight 在单个进程内抑制同一 key 的重复函数调用：只执行一次，其余并发调用等待并共享结果；它可以与随机 TTL、提前刷新和有界回源并发组合。这个语义不是分布式锁或跨实例去重；若协调跨进程，锁持有者可能暂停，仍需有效性 token 与超时。最重要的是保护权威数据库，不让所有请求无上限回源。',
        '淘汰策略决定内存不足时哪些 key 消失，并不会理解业务重要性。若把任务状态、幂等账本和普通响应缓存混在可淘汰实例，压力升高时恰好可能丢掉恢复所需事实。应按可靠性等级拆实例或至少拆职责，并把 maxmemory、淘汰量、命中率、回源率和 key 年龄作为容量信号。',
      ],
      keyPoints: ['缓存一致性要分析具体读写竞争窗口', '回源保护和职责隔离防止缓存故障击穿数据库'],
      sourceIds: ['res-backend-redis-eviction', 'res-backend-postgres-transactions', 'res-backend-go-singleflight'],
    },
    {
      id: 'semantic-cache',
      title: '语义缓存先做硬隔离再谈相似',
      paragraphs: [
        '语义缓存按 embedding 相似度复用已有结果，比精确 key 更容易误命中。相似问题不代表授权范围、时间、知识版本、模型、system prompt、工具集和安全策略相同。查询向量之前必须用 tenant、模型、模板版本、知识库版本、语言和安全标签做硬过滤，之后才在允许集合内计算相似度。',
        '阈值需要用自己的数据评估假阳性和假阴性。过低会返回语义接近但事实不同的报告，过高则几乎没有收益；对医疗、法律或实时数据场景，错误复用成本可能远高于模型费用。记录命中候选、相似度、版本、最终采纳以及用户反馈，建立离线评测集，而不是直接采用厂商示例中的性能数字或默认阈值。',
        '语义缓存内容也必须有来源和过期策略。结果应关联生成时间、输入指纹、模型与知识快照，命中时仍执行授权和安全检查。更新知识库或提示模板时，可以提升 namespace 版本让旧 key 自然失效，而不是扫描删除全部条目。若 Redis 数据丢失，服务回到正常生成路径，证明缓存仍是可重建优化。',
      ],
      keyPoints: ['tenant 与版本等硬条件先于向量相似度', '阈值和收益必须在本地任务集评估'],
      sourceIds: ['res-backend-redis-semantic-cache', 'res-backend-redis-eviction'],
    },
    {
      id: 'consistency-tests',
      title: '用并发与故障实验验证正确性',
      paragraphs: [
        '存储测试要越过单线程 CRUD。并发提交相同幂等键、同时更新同一 job、在事务提交后发布前杀进程、在缓存回填时修改数据库，观察唯一约束、版本号和 outbox 是否给出确定结果。每个实验都同时检查 PostgreSQL 权威行、Redis key、消息记录和 API 返回，不能只看最终页面。',
        '最重要的恢复演练是清空 Redis。服务应能从 PostgreSQL 重建必要缓存，已有 job 仍可查询，重复请求仍由持久幂等记录识别，唯一变化是命中率下降和数据库负载上升。若清空后任务消失或重复创建，说明权威边界设计错误，而不是需要把 Redis 备份做得更复杂。',
        '观测指标包括事务冲突、锁等待、连接池、慢查询、缓存命中与淘汰、回源率、singleflight 等待和语义缓存采纳率。日志以 requestId、jobId、tenant 和数据版本关联，敏感输入只保存必要摘要。告警应把缓存故障与数据库保护联动，例如回源率暴增时自动收紧准入。',
      ],
      keyPoints: ['并发竞争和跨边界崩溃是存储协议的核心测试', '定期清空缓存验证权威状态真正可恢复'],
      sourceIds: ['res-backend-postgres-transactions', 'res-backend-redis-eviction', 'res-backend-redis-semantic-cache'],
    },
    {
      id: 'data-review',
      title: '用数据契约评审生命周期',
      paragraphs: [
        '每张权威表应声明主键、租户边界、状态约束、版本、保留期和删除策略。缓存则声明 key namespace、TTL、最大尺寸、回源函数和允许陈旧度。把两者放在同一评审表中，可以快速发现某个业务事实只有可淘汰副本，或某个缓存缺少版本导致跨部署复用旧语义。',
        '隐私与删除要求也要穿过缓存。用户删除报告时，数据库事务记录删除事实，异步清理对象和缓存，并在查询路径优先检查权威 tombstone，防止旧缓存让内容短暂复活。语义缓存尤其要能按 tenant 与知识版本定位，不应因为只存向量而失去来源和删除能力。',
        '灾备演练区分恢复数据与恢复服务。恢复 PostgreSQL 后先校验事务一致性和迁移版本，再逐步开放回源并重建缓存；若所有实例同时预热，会再次压垮数据库。使用并发上限、优先 key 和随机节奏恢复，持续比较权威版本与缓存版本，直到命中率稳定。',
      ],
      keyPoints: ['权威表和缓存 key 都要声明完整生命周期', '删除、灾备和预热仍以权威版本为准'],
      sourceIds: ['res-backend-postgres-transactions', 'res-backend-redis-eviction', 'res-backend-redis-semantic-cache'],
    },
  ],
  misconceptions: [
    { claim: 'Redis 开启持久化后就能承担所有权威状态。', correction: '淘汰、TTL 与故障语义仍不同于业务事务，关键事实和不变量应由合适的权威存储保护。' },
    { claim: '数据库事务可以覆盖模型 API 和消息发布。', correction: '本地事务无法原子提交外部系统，需要 outbox、幂等、查询和补偿协议。' },
    { claim: '写数据库后删除缓存就完全没有竞态。', correction: '并发读取可能把旧值重新回填，仍需版本、TTL 或失效事件控制陈旧窗口。' },
    { claim: '语义相似度高就可以跨租户复用答案。', correction: '租户、授权、模型、知识和安全版本必须硬隔离，相似度不能替代访问控制。' },
    { claim: '缓存命中率越高，系统设计越好。', correction: '高命中可能来自错误复用；必须同时衡量正确性、陈旧度、回源保护和业务收益。' },
  ],
  recap: [
    'PostgreSQL 保存权威事实，Redis 缓存必须非权威且可重建。',
    '数据库约束和短事务保护本地并发不变量。',
    'outbox 协调发布意图，但不自动保证外部 exactly-once。',
    'cache-aside 需要显式处理失效、回填和击穿竞态。',
    '语义缓存先做租户与版本硬过滤，再评估相似度。',
    '清空缓存和跨边界崩溃实验能验证正确性边界。',
  ],
  nextStep: '为 job、idempotency_record 和 outbox 建立最小 PostgreSQL schema，并给所有状态更新增加版本条件。实现一个 Redis cache-aside 读取路径，记录命中、回源和数据版本。然后同时发起重复提交与并发更新，在数据库提交后发布前杀进程，并执行一次 Redis 全量清空。验证 job 仍可查询、重复不会创建第二份权威记录、outbox 会补发，而且缓存只影响延迟与负载。接着让一批热门 key 同时过期，比较无保护回源与 singleflight 加随机 TTL 时的数据库连接、慢查询和恢复时间。对语义缓存加入跨租户、旧知识版本和边界相似度样例，确认硬过滤先于向量匹配，并把误命中作为正确性失败而不是普通缓存命中。',
  tests: {
    status: 'passed',
    commands: ['node --test tests/backend-engineering-data.test.js', 'npm test'],
    results: [
      { command: 'node --test tests/backend-engineering-data.test.js', exitCode: 0, summary: '9 项目标数据测试通过。' },
      { command: 'npm test', exitCode: 0, summary: '全量测试通过。' },
    ],
  },
});
