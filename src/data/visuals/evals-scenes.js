import { deepFreeze } from '../evals-shared.js';
import { releaseBaseline, teachingTraces, safetyCases } from '../evals-fixtures.js';
import { evaluateReleaseGate, sampleTeachingTraces, assessSafetyRegression } from '../../core/evals.js';

const pct = (rate) => `${(rate * 100).toFixed(1)}%`;
const regression = evaluateReleaseGate({ baseline: releaseBaseline, candidate: releaseBaseline.map((row) => ({ ...row, passed: row.id !== 'long-b' })) });
const classifierOnly = assessSafetyRegression(safetyCases, { classifierEnabled: true, policyEnabled: false });
const withPolicy = assessSafetyRegression(safetyCases, { classifierEnabled: true, policyEnabled: true });

export const evalScenes = deepFreeze([
  { id: 'visual-eval-01-overview', title: '任务成功需要三类证据', role: 'overview', form: 'flow', question: '回答声称完成，为什么还需要环境与约束证据？', sourceIds: ['res-eval-anthropic-evals', 'res-eval-tau-bench'], panels: [
    ['任务定义', '输入与初始环境', '预期结果与禁止行为'], ['执行记录', '工具参数与观察', '保留版本和失败原因'], ['结果与约束', '环境终态是否成立', '权限与策略是否满足'], ['逐项判定', '成功 / 失败 / 未知', '不能只读最后一句话'],
  ], conclusion: '结果正确只是部分证据；约束违反不能被漂亮的回答抵消。' },
  { id: 'visual-eval-01-detail', title: '评测集有不同职责', role: 'boundary', form: 'table', question: '为什么开发集与封存评测集不能混用？', sourceIds: ['res-eval-sklearn-leakage', 'res-eval-anthropic-evals'], columns: ['集合', '可做什么', '不能据此声称什么'], rows: [
    ['开发样例', '调提示、调评分器', '不能证明未见样例泛化'], ['封存评测', '固定版本比较候选', '不能看完结果继续暗调'], ['回归集合', '复现已经修复的失败', '不能覆盖所有新风险'], ['生产回流', '脱敏、复核、版本化再入库', '不能直接搬运私人正文'],
  ], conclusion: '集合划分、去重与访问规则先确定；每次改样例都留下新版本。' },
  { id: 'visual-eval-02-overview', title: '让评分器各司其职', role: 'overview', form: 'flow', question: '代码、模型和人工分别验证什么？', sourceIds: ['res-eval-anthropic-evals', 'res-eval-mt-bench'], panels: [
    ['可检查的事实', 'schema / 环境结果', '代码规则验证'], ['开放质量维度', '覆盖度 / 表达', '明确 rubric 后评分'], ['人工校准', '核对分歧与未知', '检查边界样例'], ['版本化复测', '冻结评分规则', '候选和基线同口径'],
  ], conclusion: '评分器本身也要验证；模型裁判分数不是事实真值。' },
  { id: 'visual-eval-02-detail', title: '交换位置，检查裁判误差', role: 'comparison', form: 'table', question: '怎样检查裁判根据内容还是左侧位置选择答案？', sourceIds: ['res-eval-mt-bench', 'res-eval-anthropic-evals'], columns: ['一次比较', '左侧内容 / 右侧内容', '解释'], rows: [
    ['第一次', '答案 A / 答案 B，选择 A', '先保留原始评分'], ['交换顺序', '答案 B / 答案 A，仍选择 A', '内容选择在此对样例一致'], ['位置翻转', '答案 B / 答案 A，改选 B', '标记顺序敏感，复核'], ['证据不足', '两次都不充分', '允许未知，转人工核验'],
  ], conclusion: '此表是教学流程；交换顺序用于检查位置影响，其他裁判误差仍需分别核验。' },
  { id: 'visual-eval-03-overview', title: '从配对样本走到门槛判断', role: 'overview', form: 'flow', question: '比较新版本时，哪些信息不能混成一个总分？', sourceIds: ['res-eval-anthropic-evals', 'res-eval-tau-bench'], panels: [
    ['冻结比较条件', '同一批案例与切片', '相同评分器版本'], ['同时看分组', '总体和每个切片', '保留分子与分母'], ['检查证据量', '重复试验与未知', '小样本暂缓结论'], ['约束优先', '关键失败先阻止', '通过仅代表当前规则'],
  ], conclusion: '发布门槛是预先写下的决策规则；小样本成功不构成普适可靠性证明。' },
  { id: 'visual-eval-03-detail', title: '总分相同，长文档却退化', role: 'comparison', form: 'bars', question: '为什么总体分数会掩盖一个切片的失败？', sourceIds: ['res-eval-anthropic-evals'], rows: [
    ['总体（6 例）', regression.baseline.rate, regression.candidate.rate],
    ...regression.slices.map((slice) => [`${slice.id}（${slice.baseline.total} 例）`, slice.baseline.rate, slice.candidate.rate]),
  ], conclusion: '固定教学数据：候选修好一例常规问答，却损失一例长文档；零容差规则阻止发布。' },
  { id: 'visual-eval-04-overview', title: '从端到端失败向内找证据', role: 'overview', form: 'flow', question: '答案错误时，应该先换模型吗？', sourceIds: ['res-eval-ragas', 'res-eval-tau-bench'], panels: [
    ['输入与环境', '任务可解吗', '版本与数据是否可用'], ['检索与打包', '相关材料召回了吗', '送入模型的证据够吗'], ['推理与行动', '陈述有证据吗', '动作符合约束吗'], ['最终结果', '用户目标实现了吗', '失败回到具体环节'],
  ], conclusion: '局部指标用于定位，端到端结果用于验收；两者不能互相替代。' },
  { id: 'visual-eval-04-detail', title: '三个分数，各自回答什么', role: 'comparison', form: 'table', question: '相关、忠实和正确分别检查什么？', sourceIds: ['res-eval-ragas', 'res-eval-anthropic-evals', 'res-eval-tau-bench'], columns: ['评估维度', '检查对象', '仍可能失败的地方'], rows: [
    ['上下文相关性', '检索材料是否切题', '材料本身可能过时'], ['回答忠实度', '陈述是否被材料支持', '忠实复述错误材料'], ['回答相关性', '回答是否回应问题', '回应了却事实错误'], ['任务验收', '参考事实、约束和结果', '仍需核查评分器和环境'],
  ], conclusion: '课程用原始 RAGAS 概念区分问题，不绑定当前库 API 或宣称自动评分等于真值。' },
  { id: 'visual-eval-05-overview', title: '运行证据按身份关联', role: 'overview', form: 'flow', question: '怎样从一次用户失败回到具体模型和工具调用？', sourceIds: ['res-eval-otel-traces', 'res-eval-otel-context'], panels: [
    ['请求 / run', '业务身份与版本', '根 trace 起点'], ['模型 / 检索', 'span 记录操作', 'parent 表示包含关系'], ['异步 / 工具', '传播 context', '必要时用 links 关联'], ['诊断 / 评测', '日志关联 trace', '结果标签另行核验'],
  ], conclusion: 'trace 用于关联已经记录的工作；traceId 不是授权，span 成功不保证答案正确。' },
  { id: 'visual-eval-05-detail', title: '留下的样本改变了分母', role: 'comparison', form: 'table', question: '只保留错误后，100% 错误率说明了什么？', sourceIds: ['res-eval-otel-sampling'], columns: ['固定教学选择', '保留数 / 总数', '保留样本错误率'], rows: [
    ...[['all', '全部保留'], ['head-demo', '头部选择第1、4条'], ['errors-only', '只保留错误']].map(([mode, label]) => {
      const sample = sampleTeachingTraces(teachingTraces, mode);
      return [label, `${sample.retained} / ${sample.population}`, pct(sample.retainedErrorRate)];
    }),
    ['完整教学总体', '2 个错误 / 6 条 trace', '33.3%（已知集合）'],
  ], conclusion: '错误优先样本适合故障诊断；样本错误率不能直接当成总体错误率。' },
  { id: 'visual-eval-06-overview', title: '外部内容不能跨越授权边界', role: 'overview', form: 'boundary', question: '检索文档里的一条指令为何不能直接变成工具权限？', sourceIds: ['res-eval-owasp-injection', 'res-eval-owasp-agency'], panels: [
    ['外部材料', '网页 / 文档 / 工具输出', '可含攻击者指令'], ['模型上下文', '材料作为数据处理', '动作只是候选提案'], ['执行端策略', '校验身份与资源', '逐次检查权限和参数'], ['受保护资源', '只执行允许的动作', '拒绝也留下审计证据'],
  ], conclusion: '模型被诱导与副作用获准是两个事件；下游不能把模型输出当成授权凭据。' },
  { id: 'visual-eval-06-detail', title: '把威胁写成可验证的边界', role: 'boundary', form: 'table', question: '怎样把“注意安全”改写成具体的测试条件？', sourceIds: ['res-eval-owasp-agency', 'res-eval-claude-guardrails'], columns: ['边界', '可核验条件', '失败时的动作'], rows: [
    ['输入来源', '文档内容不是用户授权', '保留来源，不提升权限'], ['工具入口', '允许工具 + 参数 schema', '无效提案不执行'], ['资源读取', '当前身份具有读取权', '拒绝跨租户读取'], ['外发 / 变更', '授权范围内的具体确认', '缺条件则拒绝或暂停'],
  ], conclusion: '人工确认要绑定具体动作；确认不能覆盖执行端的硬性授权限制。' },
  { id: 'visual-eval-07-overview', title: '安全测试同时看两类样本', role: 'overview', form: 'table', question: '如果拒绝所有请求，为什么仍不能算好系统？', sourceIds: ['res-eval-anthropic-containment', 'res-eval-owasp-output'], columns: ['真实类型', '被防护拦截', '未被防护拦截'], rows: [
    ['恶意请求', '命中；继续核对副作用', '漏报；执行端仍需约束'], ['正常请求', '误拒；正常能力受损', '正常放行；验证任务质量'],
    ['评分目标', '不只看“我拒绝”的文字', '检查环境是否发生越权'],
  ], conclusion: '同时保留攻击集和正常对照，分开报告漏防、误拒和实际后果。' },
  { id: 'visual-eval-07-detail', title: '检测漏报与越权执行分开计数', role: 'comparison', form: 'table', question: '执行端拒绝了动作，为什么分类器漏报仍然存在？', sourceIds: ['res-eval-owasp-agency', 'res-eval-anthropic-containment'], columns: ['固定六例配置', '检测漏报 / 正常误拒', '越权副作用'], rows: [
    ['仅教学分类器', `${classifierOnly.detection.falseNegative} / ${classifierOnly.falseRefusals}`, String(classifierOnly.unauthorizedEffects)],
    ['分类器 + 执行端授权', `${withPolicy.detection.falseNegative} / ${withPolicy.falseRefusals}`, String(withPolicy.unauthorizedEffects)],
    ['解释', '同一分类器，错误没有消失', '硬边界限制了后果'],
  ], conclusion: '只展示此夹具的越权动作目标；没有覆盖所有攻击、泄漏或内容污染。' },
  { id: 'visual-eval-08-overview', title: '发布是带退出条件的过程', role: 'overview', form: 'flow', question: '离线通过后，为什么还要保留线上停止条件？', sourceIds: ['res-eval-sre-canary', 'res-eval-anthropic-evals'], panels: [
    ['离线证据', '配对回归与安全测试', '未知项不得伪装通过'], ['影子验证', '只读 / 无写副作用', '观察真实输入差异'], ['受限灰度', '候选与对照比较', '持续时间与停止门槛'], ['扩大或停止', '证据足够再扩大', '退化则暂停 / 回滚'],
  ], conclusion: '灰度比例小不意味着可以接受泄漏；关键安全失败应独立阻止推进。' },
  { id: 'visual-eval-08-detail', title: '让事故变成可复验的改进', role: 'process', form: 'flow', question: '复盘怎样回到下一次可执行的验收？', sourceIds: ['res-eval-sre-postmortem', 'res-eval-sre-canary'], panels: [
    ['限制影响', '停止相关动作', '保全必要诊断证据'], ['还原时间线', '影响 / 触发 / 缺口', '区分事实与推断'], ['完成修复', '负责人和验证条件', '加入正反回归样例'], ['再次验收', '重跑评测与安全测试', '更新门槛和运行手册'],
  ], conclusion: '回滚实现不能撤销已发生的副作用；复盘完成以行动项验证为准。' },
]);
