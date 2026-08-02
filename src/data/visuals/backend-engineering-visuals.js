import { backendVisualOutcomes } from '../backend-engineering-outcomes.js';
import { deepFreezeVisual } from './visual-contract.js';

const VERIFIED_AT = '2026-07-30';
const CREDIT = 'Agent Learner 原创教学图解';

const specs = [
  ['backend-01', 'AI API 五层责任边界', '客户端、AI API、模型供应商、工具与存储之间的职责和可信证据边界。', ['res-backend-primary-javaguide-llm-api', 'res-backend-primary-feishu-tool-truth'], 'API 契约必须绑定身份、版本、能力与执行证据。'],
  ['backend-02', 'Typed SSE 可恢复生命周期', '同步、流式与异步路径共享状态机，断线、取消和恢复分别取证。', ['res-backend-primary-javaguide-llm-api', 'res-backend-primary-feishu-beyond-model'], '连接进度不是业务完成；恢复需要持久游标。'],
  ['backend-03', '共享容量与 Deadline 包络', '并发、队列、供应商限额、token 与重试共同消费有界容量。', ['res-backend-primary-javaguide-gateway', 'res-backend-primary-feishu-agentfs'], '重试不创造容量，所有尝试共用一个预算。'],
  ['backend-04', '耐久 Job 状态机', '提交、排队、租约、checkpoint、终态和死信组成可恢复异步控制面。', ['res-backend-primary-javaguide-system-design', 'res-backend-primary-feishu-dynamic-workflow'], '控制决策可重放，外部副作用必须对账。'],
  ['backend-05', '权威存储与缓存层', 'PostgreSQL、对象存储、向量库与 Redis 按事实所有权分层。', ['res-backend-primary-javaguide-system-design', 'res-backend-primary-feishu-company-brain'], '缓存可以丢失，授权与业务真相不能丢失。'],
  ['backend-06', '幂等投递与 Effect Ledger', '至少一次投递通过 outbox、inbox、去重和副作用账本恢复。', ['res-backend-primary-feishu-dynamic-workflow', 'res-backend-primary-feishu-tool-truth'], 'unknown outcome 先取证，exactly-once 是业务不变量。'],
  ['backend-07', '生命周期与可观测证据流', '启动、接流、排空和停止由日志、trace、metric 与评测事件共同解释。', ['res-backend-primary-javaguide-evaluation', 'res-backend-primary-feishu-install-md'], '版本用于关联回归，但指标维度必须有界。'],
  ['backend-08', '部署故障诊断矩阵', '无状态 API、有状态 worker、网关与区域数据边界支持独立诊断和回滚。', ['res-backend-primary-javaguide-system-design', 'res-backend-primary-javaguide-gateway'], 'overloaded、slow、wrong、unsafe 需要不同处置。'],
];

const detailSourceIdsByLesson = {
  'backend-01': ['res-backend-openapi', 'res-backend-primary-javaguide-structured-output'],
  'backend-02': ['res-backend-whatwg-sse', 'res-backend-fastapi-sse'],
  'backend-05': ['res-backend-redis-eviction', 'res-backend-postgres-transactions', 'res-backend-go-singleflight'],
  'backend-07': ['res-backend-prometheus', 'res-backend-vllm-server', 'res-backend-primary-javaguide-evaluation'],
};

const detailMetadataByLesson = {
  'backend-01': ['结构化契约与错误回路', '请求依次经过 schema、能力、执行与用量校验，并把失败收敛到稳定错误信封。'],
  'backend-02': ['同步、SSE 与后台 Job 三路契约', '三种传输方式共享权威状态，但分别暴露完整响应、增量游标与可恢复任务快照。'],
  'backend-03': ['准入控制的四个确定出口', '剩余 deadline、队列年龄、租户权重和依赖健康共同决定接受、排队、降级或拒绝。'],
  'backend-04': ['可重放控制与外部副作用矩阵', 'journal 与 checkpoint 支撑控制面重放；外部 effect 必须依赖证据查询、对账或死信恢复。'],
  'backend-05': ['版本化 Cache-aside 与击穿保护', '读取校验租户与版本，miss 经 singleflight 有界回源，写入后发布失效。'],
  'backend-06': ['投递、未知结果与恢复动作', 'relay、consumer 与远端 effect 的故障点具有不同恢复动作，未知结果先查证再重试。'],
  'backend-07': ['关联身份与高基数边界', '逐请求身份进入日志和 trace，受控版本维度进入 metric 与 evaluation。'],
  'backend-08': ['无状态 API 与有状态 Worker 发布拓扑', 'API、队列、worker、provider 与区域数据边界独立扩缩，并沿同一证据链诊断。'],
};

function visual(id, role, title, alt, longDescription, caption, sourceIds, tags) {
  return {
    id,
    kind: 'diagram',
    role,
    tags,
    assessedCoverage: backendVisualOutcomes[id],
    title,
    alt,
    longDescription,
    caption,
    assetPath: `assets/visuals/backend-engineering/${id.replace(/^visual-/, '')}.svg`,
    width: 1200,
    height: 675,
    provenance: 'original-synthesis',
    sourceIds,
    credit: CREDIT,
    permission: null,
    verifiedAt: VERIFIED_AT,
    fixtureId: `fixture-${id.replace(/^visual-/, '')}`,
  };
}

export const backendEngineeringVisuals = deepFreezeVisual(specs.flatMap(([
  lessonId, title, description, sourceIds, caption,
]) => {
  const [detailTitle, detailDescription] = detailMetadataByLesson[lessonId];
  return [
    visual(
      `visual-${lessonId}-overview`, 'overview', title,
      `${title}的工程结构图，展示本课核心组件、状态与数值边界。`,
      `${description} 图中所有数值来自课程固定 fixture，用于说明关系与边界而非生产默认值。`,
      caption, sourceIds, ['mechanism', 'relationship', 'boundary'],
    ),
    visual(
      `visual-${lessonId}-detail`, lessonId === 'backend-08' ? 'decision' : 'process',
      detailTitle,
      `${detailTitle}的细化图，展示关键决策、失败路径和确定恢复出口。`,
      `${detailDescription} 图中状态、数值与边标签来自独立 fixture，用于验证关系而非声明生产默认值。`,
      caption, detailSourceIdsByLesson[lessonId] ?? sourceIds, ['relationship', 'failure-mode', 'tradeoff'],
    ),
  ];
}));
