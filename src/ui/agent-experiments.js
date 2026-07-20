import {
  decideLoopOutcome,
  decidePlanRecovery,
  validateToolInvocation,
} from '../core/agent-mechanism.js';
import { button, element } from './dom.js';

const LOOP_DEFAULTS = Object.freeze({
  goalSatisfied: false,
  blocked: false,
  stepsUsed: 2,
  maxSteps: 5,
});

const PLAN_DEFAULTS = Object.freeze({
  strategy: 'hybrid',
  observation: 'timeout',
  retriesUsed: 0,
  maxRetries: 2,
});

const TOOL_CATALOG = Object.freeze([
  Object.freeze({
    name: 'search_docs',
    risk: 'low',
    required: Object.freeze(['query']),
    properties: Object.freeze({
      query: Object.freeze({ type: 'string' }),
      scope: Object.freeze({ type: 'string', enum: Object.freeze(['docs', 'code']) }),
      limit: Object.freeze({ type: 'number' }),
    }),
  }),
  Object.freeze({
    name: 'delete_index',
    risk: 'high',
    required: Object.freeze(['confirm']),
    properties: Object.freeze({
      confirm: Object.freeze({ type: 'boolean' }),
    }),
  }),
]);

const TOOL_PRESETS = Object.freeze({
  'valid-low': Object.freeze({
    name: 'search_docs',
    args: Object.freeze({ query: 'Agent 工具调用', scope: 'docs', limit: 5 }),
  }),
  'missing-required': Object.freeze({
    name: 'search_docs',
    args: Object.freeze({ scope: 'docs' }),
  }),
  'invalid-enum': Object.freeze({
    name: 'search_docs',
    args: Object.freeze({ query: 'Agent 工具调用', scope: 'web' }),
  }),
  'high-risk': Object.freeze({
    name: 'delete_index',
    args: Object.freeze({ confirm: true }),
  }),
});

const STATUS_LABELS = Object.freeze({
  continue: '继续执行',
  done: '目标完成',
  blocked: '已阻塞',
  'budget-exhausted': '预算耗尽',
  invalid: '输入无效',
  ready: '可以执行',
  'approval-required': '需要人工审批',
  retry: '重试当前动作',
  'switch-action': '切换动作',
  'replace-step': '替换计划步骤',
  replan: '重新规划',
});

function agentLabHeader(index, id, title, description) {
  return element('header', { className: 'experiment-lab__header' }, [
    element('span', { className: 'section-index', text: `Agent 实验 ${index}` }),
    element('h3', { text: title, attrs: { id } }),
    element('p', { text: description }),
  ]);
}

function readInteger(input) {
  return input.value.trim() === '' ? Number.NaN : Number(input.value);
}

function numberControl({ id, label, value, min, step = 1, update }) {
  const input = element('input', {
    className: 'agent-control-input',
    attrs: { id, type: 'number', min, step, value },
    events: { input: update },
  });
  return {
    input,
    control: element('div', { className: 'experiment-control' }, [
      element('label', { text: label, attrs: { for: id } }),
      input,
    ]),
  };
}

function selectControl({ id, label, value, options, update }) {
  const select = element('select', {
    className: 'agent-control-input',
    attrs: { id },
    events: { change: update },
  }, options.map(({ value: optionValue, label: optionLabel }) => (
    element('option', { text: optionLabel, attrs: { value: optionValue } })
  )));
  select.value = value;
  return {
    select,
    control: element('div', { className: 'experiment-control' }, [
      element('label', { text: label, attrs: { for: id } }),
      select,
    ]),
  };
}

function setDecision(result, status, entries) {
  result.className = 'agent-decision-ledger agent-status-stamp';
  result.dataset.status = status;
  result.replaceChildren(
    element('strong', { className: 'agent-status-stamp__label', text: STATUS_LABELS[status] ?? status }),
    element('dl', { className: 'agent-decision-values' }, entries.map(({ term, value }) => (
      element('div', { className: 'agent-decision-ledger__entry' }, [
        element('dt', { text: `${term}：` }),
        element('dd', { text: value }),
      ])
    ))),
  );
}

function setInvalidDecision(result, error) {
  setDecision(result, 'invalid', [
    { term: '错误', value: error instanceof Error ? error.message : '输入暂时无法解析' },
  ]);
}

export function renderAgentLoopExperiment() {
  const result = element('div', {
    attrs: { id: 'agent-loop-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
  let goalSatisfied;
  let blocked;
  let stepsUsed;
  let maxSteps;

  function update() {
    try {
      const decision = decideLoopOutcome({
        goalSatisfied: goalSatisfied.checked,
        blocked: blocked.checked,
        stepsUsed: readInteger(stepsUsed),
        maxSteps: readInteger(maxSteps),
      });
      setDecision(result, decision.status, [
        { term: '状态', value: decision.status },
        { term: '原因', value: decision.reason },
        { term: '继续执行', value: decision.shouldContinue ? '是' : '否' },
      ]);
    } catch (error) {
      setInvalidDecision(result, error);
    }
  }

  goalSatisfied = element('input', {
    className: 'agent-checkbox',
    attrs: { id: 'agent-loop-goal-satisfied', type: 'checkbox' },
    events: { change: update },
  });
  blocked = element('input', {
    className: 'agent-checkbox',
    attrs: { id: 'agent-loop-blocked', type: 'checkbox' },
    events: { change: update },
  });
  const stepsControl = numberControl({
    id: 'agent-loop-steps-used', label: '已使用步骤', value: LOOP_DEFAULTS.stepsUsed, min: 0, update,
  });
  stepsUsed = stepsControl.input;
  const maxStepsControl = numberControl({
    id: 'agent-loop-max-steps', label: '最大步骤', value: LOOP_DEFAULTS.maxSteps, min: 1, update,
  });
  maxSteps = maxStepsControl.input;

  const reset = button('重置循环实验', {
    className: 'secondary-action experiment-reset',
    events: {
      click: () => {
        goalSatisfied.checked = LOOP_DEFAULTS.goalSatisfied;
        blocked.checked = LOOP_DEFAULTS.blocked;
        stepsUsed.value = String(LOOP_DEFAULTS.stepsUsed);
        maxSteps.value = String(LOOP_DEFAULTS.maxSteps);
        update();
        goalSatisfied.focus();
      },
    },
  });

  const lab = element('section', {
    className: 'experiment-lab agent-loop-lab',
    attrs: { 'aria-labelledby': 'agent-loop-title' },
  }, [
    agentLabHeader('01', 'agent-loop-title', 'Agent Loop 决策台', '改变完成证据、阻塞信号与步骤预算，观察循环应继续还是终止。'),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls agent-controls' }, [
        element('div', { className: 'agent-check-control' }, [
          goalSatisfied,
          element('label', { text: '目标已有完成证据', attrs: { for: 'agent-loop-goal-satisfied' } }),
        ]),
        element('div', { className: 'agent-check-control' }, [
          blocked,
          element('label', { text: '任务当前已阻塞', attrs: { for: 'agent-loop-blocked' } }),
        ]),
        stepsControl.control,
        maxStepsControl.control,
      ]),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '循环判定' }),
        result,
      ]),
    ]),
    reset,
  ]);

  update();
  return lab;
}

export function renderToolContractExperiment() {
  const result = element('div', {
    attrs: { id: 'tool-contract-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
  const invocation = element('pre', {
    className: 'tool-invocation',
    attrs: { id: 'tool-contract-invocation', tabindex: '0', 'aria-label': '当前工具调用 JSON' },
  });
  let preset;

  function update() {
    const currentInvocation = TOOL_PRESETS[preset.value];
    invocation.textContent = JSON.stringify(currentInvocation, null, 2);
    const decision = validateToolInvocation(TOOL_CATALOG, currentInvocation);
    result.className = 'agent-decision-ledger agent-status-stamp tool-contract-decision';
    result.dataset.status = decision.status;
    const summary = decision.status === 'ready'
      ? 'schema 校验通过，宿主可以进入执行前检查。'
      : decision.status === 'approval-required'
        ? '高风险动作通过 schema 校验，但执行前需要人工审批。'
        : '调用未通过 schema 校验，宿主不得执行。';
    const children = [
      element('strong', { className: 'agent-status-stamp__label', text: STATUS_LABELS[decision.status] }),
      element('p', { text: summary }),
    ];
    if (decision.errors.length > 0) {
      children.push(element('ul', { className: 'tool-error-list' }, (
        decision.errors.map((error) => element('li', { text: error }))
      )));
    }
    result.replaceChildren(...children);
  }

  const presetControl = selectControl({
    id: 'tool-contract-preset',
    label: '调用场景',
    value: 'valid-low',
    options: [
      { value: 'valid-low', label: '合法低风险调用' },
      { value: 'missing-required', label: '缺少必填 query' },
      { value: 'invalid-enum', label: 'scope 枚举无效' },
      { value: 'high-risk', label: '高风险删除调用' },
    ],
    update,
  });
  preset = presetControl.select;

  const lab = element('section', {
    className: 'experiment-lab tool-contract-lab',
    attrs: { 'aria-labelledby': 'tool-contract-title' },
  }, [
    agentLabHeader('02', 'tool-contract-title', '工具契约检查台', '切换四个调用提案，让宿主校验器决定可执行、拒绝或请求审批。'),
    element('p', {
      className: 'experiment-caveat',
      text: '结构化调用只是动作提案；即使 schema 合法，高风险工具也不能自动执行。',
    }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls agent-controls' }, [
        presetControl.control,
        element('div', { className: 'tool-invocation-display' }, [
          element('h4', { text: '当前 invocation' }),
          invocation,
        ]),
      ]),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '宿主校验结果' }),
        result,
      ]),
    ]),
    button('重置工具契约实验', {
      className: 'secondary-action experiment-reset',
      events: {
        click: () => {
          preset.value = 'valid-low';
          update();
          preset.focus();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export function renderPlanRecoveryExperiment() {
  const result = element('div', {
    attrs: { id: 'plan-recovery-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
  let strategy;
  let observation;
  let retriesUsed;
  let maxRetries;

  function update() {
    try {
      const decision = decidePlanRecovery({
        strategy: strategy.value,
        observation: observation.value,
        retriesUsed: readInteger(retriesUsed),
        maxRetries: readInteger(maxRetries),
      });
      setDecision(result, decision.action, [
        { term: '动作', value: decision.action },
        { term: '原因', value: decision.reason },
      ]);
    } catch (error) {
      setInvalidDecision(result, error);
    }
  }

  const strategyControl = selectControl({
    id: 'plan-recovery-strategy',
    label: '规划策略',
    value: PLAN_DEFAULTS.strategy,
    options: [
      { value: 'fixed', label: 'fixed · 固定计划' },
      { value: 'reactive', label: 'reactive · 即时反应' },
      { value: 'hybrid', label: 'hybrid · 混合策略' },
    ],
    update,
  });
  strategy = strategyControl.select;
  const observationControl = selectControl({
    id: 'plan-recovery-observation',
    label: '新观察',
    value: PLAN_DEFAULTS.observation,
    options: [
      { value: 'success', label: 'success · 成功' },
      { value: 'timeout', label: 'timeout · 超时' },
      { value: 'empty-result', label: 'empty-result · 空结果' },
      { value: 'new-constraint', label: 'new-constraint · 新约束' },
    ],
    update,
  });
  observation = observationControl.select;
  const retriesUsedControl = numberControl({
    id: 'plan-recovery-retries-used', label: '已重试次数', value: PLAN_DEFAULTS.retriesUsed, min: 0, update,
  });
  retriesUsed = retriesUsedControl.input;
  const maxRetriesControl = numberControl({
    id: 'plan-recovery-max-retries', label: '最大重试次数', value: PLAN_DEFAULTS.maxRetries, min: 0, update,
  });
  maxRetries = maxRetriesControl.input;

  const lab = element('section', {
    className: 'experiment-lab plan-recovery-lab',
    attrs: { 'aria-labelledby': 'plan-recovery-title' },
  }, [
    agentLabHeader('03', 'plan-recovery-title', '计划恢复棋盘', '注入执行观察并切换策略，比较重试、换动作、替换步骤、重规划和阻塞。'),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls agent-controls' }, [
        strategyControl.control,
        observationControl.control,
        retriesUsedControl.control,
        maxRetriesControl.control,
      ]),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '恢复判定' }),
        result,
      ]),
    ]),
    button('重置计划恢复实验', {
      className: 'secondary-action experiment-reset',
      events: {
        click: () => {
          strategy.value = PLAN_DEFAULTS.strategy;
          observation.value = PLAN_DEFAULTS.observation;
          retriesUsed.value = String(PLAN_DEFAULTS.retriesUsed);
          maxRetries.value = String(PLAN_DEFAULTS.maxRetries);
          update();
          strategy.focus();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export const agentExperimentRenderers = Object.freeze({
  'agent-loop': renderAgentLoopExperiment,
  'tool-contract': renderToolContractExperiment,
  'plan-recovery': renderPlanRecoveryExperiment,
});
