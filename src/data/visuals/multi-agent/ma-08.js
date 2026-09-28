import { deepFreeze } from '../../multi-agent-shared.js';

export const ma08Visuals = deepFreeze([
  {
    id: 'visual-ma-08-overview', kind: 'diagram', role: 'overview',
    title: '四组证据组成验收包',
    alt: '协作、协议、权限与质量成本分别提供证据，共同支持验收结论，并保留未覆盖范围。',
    longDescription: '图从上方的用户任务与成功条件开始。四条箭头分别指向协作证据、协议证据、权限证据以及质量成本证据。协作记录任务分工与结果合并，协议记录版本、transport 和请求，权限记录允许与拒绝的案例，质量成本记录最终产物、全部投入和耗时。四组结果共同进入下方验收包，交付物包含实际证据、判断与未覆盖范围。任何一组检查的通过都不能替代其他组的必要验证。该四组组织方式是课程原创模板，实际项目还需按场景定义接受条件。',
    caption: '从业务成功条件出发，分别收集证据，再形成带范围的结论。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-08-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-research-system', 'res-ma-anthropic-evals'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['process', 'relationship'],
  },
  {
    id: 'visual-ma-08-detail', kind: 'diagram', role: 'boundary',
    title: '同一 URI 的 private 缓存隔离',
    alt: '用户甲乙即使请求相同 URI，也不能跨授权上下文共享 private 缓存；TTL 不提供额外许可。',
    longDescription: '先阅读上方说明，两位用户请求相同 URI，且甲的缓存仍在 TTL 内。左侧用户甲沿实线访问属于授权上下文甲的 private 缓存；右侧用户乙沿实线进入自己的授权检查，再获得允许访问的内容。中间从甲缓存通向乙的红色虚线标记为禁止跨上下文共享。下方补充两项独立规则：TTL 只表示新鲜度提示，相关通知可使缓存失效；服务器仍须执行每个原语的访问控制。图中资源和用户是课程合成案例，不展示真实资料或凭据。',
    caption: 'private 结果按授权上下文隔离；URI 相同和 TTL 有效都不能扩大访问范围。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-08-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-caching'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['relationship', 'failure-mode'],
  },
]);
