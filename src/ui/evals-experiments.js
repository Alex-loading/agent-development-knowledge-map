import { evaluateReleaseGate, trialReliability, sampleTeachingTraces, assessSafetyRegression } from '../core/evals.js';
import { releaseBaseline, teachingTraces, safetyCases } from '../data/evals-fixtures.js';
import { button, element } from './dom.js';

const percent = (rate) => rate === null ? '无已评分样本' : `${(rate * 100).toFixed(1)}%`;
const numeric = (input) => input.value.trim() === '' ? NaN : Number(input.value);

function select(id, label, options, value, update) {
  const input = element('select', {
    className: 'backend-control-input', attrs: { id }, events: { change: update },
  }, options.map(([key, text]) => element('option', { text, attrs: { value: key } })));
  input.value = value;
  return { input, node: element('div', { className: 'experiment-control' }, [element('label', { text: label, attrs: { for: id } }), input]) };
}

function number(id, label, value, min, max, step, update) {
  const input = element('input', {
    className: 'backend-control-input', attrs: { id, type: 'number', value, min, max, step }, events: { input: update },
  });
  return { input, node: element('div', { className: 'experiment-control' }, [element('label', { text: label, attrs: { for: id } }), input]) };
}

function checkbox(id, label, update) {
  const input = element('input', { attrs: { id, type: 'checkbox' }, events: { change: update } });
  input.checked = true;
  return { input, node: element('div', { className: 'backend-check-control' }, [input, element('label', { text: label, attrs: { for: id } })]) };
}

function liveResult(id) {
  return element('div', { className: 'experiment-status', attrs: { id, 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function validateNumbers(controls, result) {
  const invalid = controls.find(({ input }) => {
    const value = numeric(input);
    return !Number.isInteger(value) || value < Number(input.getAttribute('min'))
      || value > Number(input.getAttribute('max'));
  });
  if (!invalid) return true;
  result.className = 'experiment-status has-error';
  result.replaceChildren(element('strong', { text: '请检查输入范围' }), element('p', {
    text: `请输入 ${invalid.input.getAttribute('min')} 至 ${invalid.input.getAttribute('max')} 之间的整数。`,
  }));
  return false;
}

function lab({ id, title, caveat, controls, result, reset }) {
  return element('section', { className: 'experiment-lab', attrs: { 'aria-labelledby': `${id}-title` } }, [
    element('header', { className: 'experiment-lab__header' }, [
      element('span', { className: 'section-index', text: '评测与安全 · 教学实验' }),
      element('h3', { text: title, attrs: { id: `${id}-title` } }),
    ]),
    element('p', { className: 'experiment-caveat', text: caveat }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls' }, controls),
      element('div', { className: 'experiment-results' }, [result]),
    ]), reset,
  ]);
}

export function renderEvalReleaseGate() {
  const result = liveResult('eval-release-result');
  const scenario = select('eval-release-scenario', '候选版本成绩', [
    ['balanced', '候选与基线相同'], ['slice-regression', '常规改善、长文档退化'], ['ungraded', '候选评分尚未返回'],
  ], 'balanced', update);
  const minimum = number('eval-release-minimum', '每组最少样本数', 2, 1, 1000, 1, update);
  const tolerance = number('eval-release-tolerance', '允许下降百分点', 0, 0, 100, 1, update);
  const critical = number('eval-release-critical', '关键失败数', 0, 0, 1000, 1, update);
  const probability = number('eval-release-probability', '假设同一任务单次成功率（%）', 75, 0, 100, 1, update);
  const attempts = number('eval-release-attempts', '独立尝试次数 k', 3, 1, 100, 1, update);
  function update() {
      if (!validateNumbers([minimum, tolerance, critical, probability, attempts], result)) return;
      const candidate = releaseBaseline.map((row) => ({
        ...row,
        passed: scenario.input.value === 'ungraded' ? null : scenario.input.value === 'slice-regression' ? row.id !== 'long-b' : row.passed,
      }));
      const gate = evaluateReleaseGate({
        baseline: releaseBaseline, candidate, minSamples: numeric(minimum.input),
        maxDrop: numeric(tolerance.input) / 100, criticalFailures: numeric(critical.input),
      });
      const repeated = trialReliability({ probability: numeric(probability.input) / 100, attempts: numeric(attempts.input) });
      result.className = `experiment-status ${gate.status === 'block' ? 'is-overflow' : ''}`;
      result.replaceChildren(
        element('h4', { text: { pass: '通过教学门槛', block: '阻止发布', hold: '暂缓判断' }[gate.status] }),
        element('p', { text: `总体：${percent(gate.baseline.rate)} → ${percent(gate.candidate.rate)}；候选已评分 ${gate.candidate.graded} / ${gate.candidate.total}` }),
        element('ul', {}, gate.slices.map((slice) => element('li', { text: `${slice.id}（${slice.baseline.total} 例）：${percent(slice.baseline.rate)} → ${percent(slice.candidate.rate)}` }))),
        element('ul', {}, gate.reasons.map((text) => element('li', { text }))),
        element('h4', { text: '独立同分布假设下的重复试验' }),
        element('p', { text: `至少一次成功：${percent(repeated.atLeastOne)}；全部 k 次成功：${percent(repeated.allSuccess)}。` }),
        element('p', { text: '这组概率只描述同一任务，不能把跨任务平均成功率直接代入；它也不是上方发布规则的置信区间。' }),
      );
  }
  const reset = button('重置发布实验', {
    className: 'secondary-action experiment-reset', attrs: { id: 'eval-release-reset' },
    events: { click: () => {
      scenario.input.value = 'balanced';
      for (const [control, value] of [[minimum, 2], [tolerance, 0], [critical, 0], [probability, 75], [attempts, 3]]) control.input.value = String(value);
      update(); scenario.input.focus();
    } },
  });
  update();
  return lab({ id: 'eval-release', title: '分组回归与发布门槛台', caveat: '固定六例的确定性教学模型；最少样本数与容差是演示策略，不是生产标准或统计显著性检验。关键失败不能由质量加分抵消。', controls: [scenario, minimum, tolerance, critical, probability, attempts].map(({ node }) => node), result, reset });
}

export function renderEvalTraceSampling() {
  const result = liveResult('eval-trace-result');
  const mode = select('eval-trace-mode', '保留 trace 的规则', [
    ['all', '保留全部教学 trace'], ['head-demo', '固定头部选择示例（第 1、4 条）'], ['errors-only', '仅保留错误（尾部选择示例）'],
  ], 'all', update);
  function update() {
      const sample = sampleTeachingTraces(teachingTraces, mode.input.value);
      result.className = 'experiment-status';
      result.replaceChildren(
        element('h4', { text: `保留 ${sample.retained} / ${sample.population} 条 trace` }),
        element('p', { text: `保留样本错误率：${percent(sample.retainedErrorRate)}` }),
        element('p', { text: `完整教学集合错误率：${percent(sample.populationErrorRate)}` }),
        element('ul', {}, sample.traces.map((trace) => element('li', { text: `${trace.id} · ${trace.outcome} · ${trace.durationMs} ms · ${Object.values(trace.attributes).join(' / ')}` }))),
        element('p', { text: '只投影 modelVersion、promptVersion、stage；原始 prompt、output、token 不进入结果。字段允许列表仍需配合字段值审查。' }),
        element('p', { text: '错误优先样本适合诊断，不能以其错误比例直接估计总体。完整集合分母只因本教学夹具已知才可显示。' }),
      );
  }
  const reset = button('重置采样实验', { className: 'secondary-action experiment-reset', attrs: { id: 'eval-trace-reset' }, events: { click: () => { mode.input.value = 'all'; update(); mode.input.focus(); } } });
  update();
  return lab({ id: 'eval-trace', title: '追踪采样与证据范围台', caveat: '六条人工构造的教学 trace；固定选择演示决策时机与分母变化。结果仅描述这些教学数据。', controls: [mode.node], result, reset });
}

export function renderEvalSafetyRegression() {
  const result = liveResult('eval-safety-result');
  const classifier = checkbox('eval-safety-classifier', '启用教学分类器', update);
  const policy = checkbox('eval-safety-policy', '执行端检查资源授权', update);
  function update() {
      const report = assessSafetyRegression(safetyCases, { classifierEnabled: classifier.input.checked, policyEnabled: policy.input.checked });
      result.className = 'experiment-status';
      result.replaceChildren(
        element('h4', { text: `越权副作用：${report.unauthorizedEffects}` }),
        element('p', { text: `检测命中：${report.detection.truePositive}；检测漏报：${report.detection.falseNegative}；正常误拒：${report.falseRefusals}` }),
        element('p', { text: `攻击成功：${report.attackSuccesses} / ${report.attacks}；仅本例越权动作目标的攻击成功率：${percent(report.attackSuccessRate)}` }),
        element('p', { text: `正常样本：${safetyCases.length - report.attacks}；正常误拒：${report.falseRefusals} / ${safetyCases.length - report.attacks}` }),
        element('ul', {}, report.outcomes.map((row, index) => element('li', { text: `${safetyCases[index].title}：${row.flagged ? '分类器拦截' : '分类器未拦截'} / ${row.policyDenied ? '执行端拒绝' : '执行端未拒绝'} / ${row.executed ? '执行' : '未执行'}` }))),
        element('p', { text: '检测器未命中，执行端仍可拒绝越权；检测器误报也会妨碍正常请求。当前样本零副作用不能证明其他攻击面安全。' }),
      );
  }
  const reset = button('重置安全实验', { className: 'secondary-action experiment-reset', attrs: { id: 'eval-safety-reset' }, events: { click: () => { classifier.input.checked = true; policy.input.checked = true; update(); classifier.input.focus(); } } });
  update();
  return lab({ id: 'eval-safety', title: '安全回归与正常对照台', caveat: '固定标注的教学案例，分类器标签为预设；没有运行真实检测器、执行真实工具或进行攻击。宿主权限判断只覆盖本例定义的越权动作。', controls: [classifier.node, policy.node], result, reset });
}

export const evalExperimentRenderers = Object.freeze({
  'eval-release-gate': renderEvalReleaseGate,
  'eval-trace-sampling': renderEvalTraceSampling,
  'eval-safety-regression': renderEvalSafetyRegression,
});
