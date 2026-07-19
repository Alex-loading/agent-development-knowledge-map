import {
  estimateContextBudget,
  normalizeAttention,
  sampleDistribution,
} from '../core/experiments.js';
import { button, element } from './dom.js';

const BUDGET_DEFAULTS = Object.freeze({
  system: 600,
  history: 1200,
  retrieval: 800,
  output: 700,
  limit: 4096,
});

const BUDGET_CONTROLS = [
  { field: 'system', label: '系统指令预算', max: 4000, step: 100 },
  { field: 'history', label: '历史消息预算', max: 6000, step: 100 },
  { field: 'retrieval', label: '检索内容预算', max: 6000, step: 100 },
  { field: 'output', label: '输出预算', max: 4000, step: 100 },
  { field: 'limit', label: '总上下文上限', min: 512, max: 16000, step: 128 },
];

const ATTENTION_TOKENS = ['模型', '根据', '上下文', '回答', '问题'];
const ATTENTION_PRESETS = [
  [8, 3, 6, 2, 4],
  [5, 8, 7, 3, 2],
  [3, 5, 8, 6, 2],
  [2, 4, 7, 8, 6],
  [4, 2, 7, 6, 8],
];

function normalizeEligibleAttention(scores, queryIndex, causalMaskEnabled) {
  const eligibleIndices = scores
    .map((_score, index) => index)
    .filter((index) => !causalMaskEnabled || index <= queryIndex);
  const eligibleWeights = normalizeAttention(eligibleIndices.map((index) => scores[index]));
  const weightByIndex = new Map(eligibleIndices.map((index, position) => [index, eligibleWeights[position]]));
  return scores.map((_score, index) => weightByIndex.get(index) ?? 0);
}

const SAMPLING_CANDIDATES = [
  { token: '巴黎', logit: 3.6 },
  { token: '法国首都', logit: 2.4 },
  { token: '伦敦', logit: 0.8 },
  { token: '不确定', logit: 0.2 },
  { token: '一首诗', logit: -0.5 },
];

const SAMPLING_DEFAULTS = Object.freeze({ temperature: 1, topP: 0.9 });

function labHeader(index, id, title, description) {
  return element('header', { className: 'experiment-lab__header' }, [
    element('span', { className: 'section-index', text: `概念实验 ${index}` }),
    element('h3', { text: title, attrs: { id } }),
    element('p', { text: description }),
  ]);
}

export function renderTokenBudgetExperiment() {
  const state = { ...BUDGET_DEFAULTS };
  const inputs = new Map();
  const values = new Map();
  const status = element('div', {
    className: 'experiment-status budget-status',
    attrs: { id: 'token-budget-status', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  function update() {
    for (const [field, input] of inputs) {
      state[field] = Number(input.value);
      values.get(field).textContent = `${state[field]} 教学 token`;
    }

    try {
      const result = estimateContextBudget(state);
      status.className = `experiment-status budget-status ${result.overflow ? 'is-overflow' : 'is-within-budget'}`;
      status.replaceChildren(
        element('strong', { text: `已用 ${result.used} / ${state.limit}` }),
        element('span', {
          text: result.overflow
            ? `超出 ${Math.abs(result.remaining)} 教学 token`
            : `剩余 ${result.remaining} 教学 token`,
        }),
        element('span', { text: `占用 ${result.percent}%` }),
        element('span', { text: `溢出：${result.overflow ? '是' : '否'}` }),
      );
    } catch (error) {
      status.className = 'experiment-status budget-status has-error';
      status.textContent = `暂时无法计算：${error.message}`;
    }
  }

  const controls = BUDGET_CONTROLS.map(({ field, label, min = 0, max, step }) => {
    const output = element('output', {
      className: 'experiment-control__value',
      text: `${state[field]} 教学 token`,
      attrs: { id: `token-budget-${field}-value`, for: `token-budget-${field}` },
    });
    const input = element('input', {
      attrs: {
        id: `token-budget-${field}`,
        type: 'range',
        min,
        max,
        step,
        value: state[field],
        'aria-describedby': `token-budget-${field}-value`,
      },
      events: { input: update },
    });
    inputs.set(field, input);
    values.set(field, output);
    return element('div', { className: 'experiment-control' }, [
      element('div', { className: 'experiment-control__heading' }, [
        element('label', { text: label, attrs: { for: `token-budget-${field}` } }),
        output,
      ]),
      input,
    ]);
  });

  const reset = button('重置预算实验', {
    className: 'secondary-action experiment-reset',
    events: {
      click: () => {
        Object.assign(state, BUDGET_DEFAULTS);
        for (const [field, input] of inputs) input.value = String(state[field]);
        update();
      },
    },
  });

  const lab = element('section', {
    className: 'experiment-lab token-budget-lab',
    attrs: { 'aria-labelledby': 'token-budget-title' },
  }, [
    labHeader('01', 'token-budget-title', 'Token / 上下文预算台', '拖动预算项，观察输入与输出如何共同占用上下文窗口。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这里操纵的是已经估算好的教学 token 预算，不是真实 tokenizer，也不是任何具体模型的精确计数。',
    }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls' }, controls),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '预算结果' }),
        status,
        element('p', { text: '若溢出，可缩短历史、减少检索片段、摘要旧消息，或为输出预留更多空间。' }),
      ]),
    ]),
    reset,
  ]);

  update();
  return lab;
}

export function renderAttentionExperiment() {
  let queryIndex = 0;
  let causalMaskEnabled = false;
  let scores = [...ATTENTION_PRESETS[queryIndex]];
  const queryButtons = [];
  const sliders = [];
  const scoreValues = [];
  const percentages = [];
  const bars = [];
  const eligibilityLabels = [];
  const summary = element('p', {
    className: 'experiment-summary',
    attrs: { id: 'attention-summary', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  function update() {
    const weights = normalizeEligibleAttention(scores, queryIndex, causalMaskEnabled);
    queryButtons.forEach((queryButton, index) => {
      queryButton.setAttribute('aria-pressed', index === queryIndex ? 'true' : 'false');
    });
    sliders.forEach((slider, index) => {
      slider.value = String(scores[index]);
      scoreValues[index].textContent = scores[index].toFixed(1);
      const percent = weights[index] * 100;
      percentages[index].textContent = `${percent.toFixed(1)}%`;
      bars[index].value = percent;
      bars[index].setAttribute('value', percent);
      const masked = causalMaskEnabled && index > queryIndex;
      eligibilityLabels[index].textContent = masked ? '已屏蔽' : '可参与';
      eligibilityLabels[index].className = `attention-eligibility ${masked ? 'is-masked' : 'is-eligible'}`;
    });

    const maximum = Math.max(...weights);
    const strongest = ATTENTION_TOKENS
      .filter((_token, index) => Math.abs(weights[index] - maximum) < 1e-12)
      .map((token) => `「${token}」`)
      .join('、');
    const maskExplanation = causalMaskEnabled
      ? '因果 decoder 掩码已开启，当前位置不能读取未来 token。'
      : '因果掩码已关闭，所有位置都可参与这次教学计算。';
    summary.textContent = `当前 Query「${ATTENTION_TOKENS[queryIndex]}」把权重最高地分给 ${strongest}，可把它理解为按权重读取相关位置。${maskExplanation}本面板省略了学习得到的投影与完整多头 Value 更新，仍不是完整的学习注意力。`;
  }

  const queryPicker = element('div', {
    className: 'attention-query-picker',
    attrs: { role: 'group', 'aria-label': '选择当前 Query token' },
  }, ATTENTION_TOKENS.map((token, index) => {
    const queryButton = button(token, {
      className: 'attention-token',
      attrs: { id: `attention-query-${index}`, 'aria-pressed': index === queryIndex ? 'true' : 'false' },
      events: {
        click: () => {
          queryIndex = index;
          scores = [...ATTENTION_PRESETS[index]];
          update();
        },
      },
    });
    queryButtons.push(queryButton);
    return queryButton;
  }));

  const causalMask = element('input', {
    attrs: {
      id: 'attention-causal-mask',
      type: 'checkbox',
      'aria-describedby': 'attention-causal-mask-note',
    },
    events: {
      change: () => {
        causalMaskEnabled = causalMask.checked;
        update();
      },
    },
  });
  causalMask.checked = causalMaskEnabled;
  const maskControl = element('div', { className: 'attention-mask-control' }, [
    causalMask,
    element('label', { text: '因果掩码', attrs: { for: 'attention-causal-mask' } }),
    element('span', {
      text: '开启后，当前 Query 不能读取它右侧的未来 token。',
      attrs: { id: 'attention-causal-mask-note' },
    }),
  ]);

  const scoreControls = element('div', { className: 'experiment-controls attention-controls' }, ATTENTION_TOKENS.map((token, index) => {
    const value = element('output', {
      className: 'experiment-control__value',
      text: scores[index].toFixed(1),
      attrs: { id: `attention-score-${index}-value`, for: `attention-score-${index}` },
    });
    const slider = element('input', {
      attrs: {
        id: `attention-score-${index}`,
        type: 'range',
        min: 0,
        max: 10,
        step: 0.5,
        value: scores[index],
        'aria-describedby': `attention-score-${index}-value`,
      },
      events: {
        input: (event) => {
          scores[index] = Number(event.currentTarget?.value ?? slider.value);
          update();
        },
      },
    });
    sliders.push(slider);
    scoreValues.push(value);
    return element('div', { className: 'experiment-control' }, [
      element('div', { className: 'experiment-control__heading' }, [
        element('label', { text: `与「${token}」的教学关联分`, attrs: { for: `attention-score-${index}` } }),
        value,
      ]),
      slider,
    ]);
  }));

  const weightRows = element('div', { className: 'experiment-results attention-results' }, [
    element('h4', { text: '归一化权重' }),
    ...ATTENTION_TOKENS.map((token, index) => {
      const percent = element('output', { className: 'attention-percent', text: '0.0%' });
      const eligibility = element('strong', { className: 'attention-eligibility', text: '可参与' });
      const bar = element('progress', {
        attrs: { max: 100, value: 0, 'aria-label': `token ${token} 的注意力百分比` },
      });
      percentages.push(percent);
      bars.push(bar);
      eligibilityLabels.push(eligibility);
      return element('div', { className: 'experiment-result-row attention-row' }, [
        element('span', { className: 'experiment-result-row__token', text: token }),
        bar,
        percent,
        eligibility,
      ]);
    }),
  ]);

  const lab = element('section', {
    className: 'experiment-lab attention-lab',
    attrs: { 'aria-labelledby': 'attention-title' },
  }, [
    labHeader('02', 'attention-title', 'Attention 直觉台', '先选 Query token，再改变它与各位置的教学关联分。'),
    element('p', {
      className: 'experiment-caveat',
      text: '本面板使用非负手工分数并进行线性归一化；真实注意力会计算缩放点积并应用 softmax(QKᵀ / √dₖ + mask)，再跨多个头读取 Value 向量。',
    }),
    element('div', {}, [element('h4', { text: '当前 Query token' }), queryPicker]),
    maskControl,
    element('div', { className: 'experiment-grid' }, [scoreControls, weightRows]),
    summary,
    button('重置注意力实验', {
      className: 'secondary-action experiment-reset',
      events: {
        click: () => {
          queryIndex = 0;
          causalMaskEnabled = false;
          causalMask.checked = false;
          scores = [...ATTENTION_PRESETS[0]];
          update();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export function renderSamplingExperiment() {
  const state = { ...SAMPLING_DEFAULTS };
  const temperatureValue = element('output', {
    className: 'experiment-control__value',
    attrs: { id: 'sampling-temperature-value', for: 'sampling-temperature' },
  });
  const topPValue = element('output', {
    className: 'experiment-control__value',
    attrs: { id: 'sampling-top-p-value', for: 'sampling-top-p' },
  });
  const temperature = element('input', {
    attrs: { id: 'sampling-temperature', type: 'range', min: 0.05, max: 2, step: 0.05, value: state.temperature, 'aria-describedby': 'sampling-temperature-value' },
    events: { input: () => updateFromControls() },
  });
  const topP = element('input', {
    attrs: { id: 'sampling-top-p', type: 'range', min: 0.05, max: 1, step: 0.05, value: state.topP, 'aria-describedby': 'sampling-top-p-value' },
    events: { input: () => updateFromControls() },
  });
  const rows = element('div', { className: 'experiment-results sampling-results' });
  const summary = element('p', {
    className: 'experiment-summary',
    attrs: { id: 'sampling-summary', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  function updateFromControls() {
    state.temperature = Number(temperature.value);
    state.topP = Number(topP.value);
    update();
  }

  function setPreset(next) {
    Object.assign(state, next);
    temperature.value = String(state.temperature);
    topP.value = String(state.topP);
    update();
  }

  function update() {
    temperatureValue.textContent = state.temperature.toFixed(2);
    topPValue.textContent = state.topP.toFixed(2);
    const distribution = sampleDistribution(SAMPLING_CANDIDATES, state.temperature, state.topP);
    rows.replaceChildren(
      element('h4', { text: '固定候选分布' }),
      ...distribution.map((candidate) => {
        const percent = candidate.probability * 100;
        return element('div', {
          className: `experiment-result-row sampling-row ${candidate.inNucleus ? 'is-included' : 'is-excluded'}`,
          dataset: { inNucleus: candidate.inNucleus },
        }, [
          element('span', { className: 'experiment-result-row__token', text: candidate.token }),
          element('progress', { attrs: { max: 100, value: percent, 'aria-label': `${candidate.token} 的候选概率` } }),
          element('output', { className: 'sampling-percent', text: `${percent.toFixed(1)}%` }),
          element('strong', { className: 'nucleus-status', text: candidate.inNucleus ? '纳入候选核' : '排除候选核' }),
        ]);
      }),
    );
    const included = distribution.filter(({ inNucleus }) => inNucleus).map(({ token }) => `「${token}」`).join('、');
    summary.textContent = `当前候选核包含 ${included}。Temperature 改变分布平缓度，top-p 改变候选集；这些参数不保证答案正确，也不保证输出一定更有创意。`;
  }

  const lab = element('section', {
    className: 'experiment-lab sampling-lab',
    attrs: { 'aria-labelledby': 'sampling-title' },
  }, [
    labHeader('03', 'sampling-title', '采样分布台', '固定候选 token 与 logits，只观察参数如何改变概率和 nucleus 集合。'),
    element('p', {
      className: 'experiment-caveat',
      text: '本实验不会随机生成文本，也不声称展示某个真实模型的词表分布。',
    }),
    element('div', { className: 'experiment-presets', attrs: { role: 'group', 'aria-label': '采样参数预设' } }, [
      button('稳定答案预设', { className: 'secondary-action', events: { click: () => setPreset({ temperature: 0.2, topP: 0.75 }) } }),
      button('创意写作预设', { className: 'secondary-action', events: { click: () => setPreset({ temperature: 1.2, topP: 0.95 }) } }),
    ]),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls' }, [
        element('div', { className: 'experiment-control' }, [
          element('div', { className: 'experiment-control__heading' }, [
            element('label', { text: 'Temperature', attrs: { for: 'sampling-temperature' } }),
            temperatureValue,
          ]),
          temperature,
        ]),
        element('div', { className: 'experiment-control' }, [
          element('div', { className: 'experiment-control__heading' }, [
            element('label', { text: 'Top-p', attrs: { for: 'sampling-top-p' } }),
            topPValue,
          ]),
          topP,
        ]),
      ]),
      rows,
    ]),
    summary,
    button('重置采样实验', {
      className: 'secondary-action experiment-reset',
      events: { click: () => setPreset(SAMPLING_DEFAULTS) },
    }),
  ]);

  update();
  return lab;
}

export function renderExperiment(experimentId) {
  const renderers = {
    'token-budget': renderTokenBudgetExperiment,
    attention: renderAttentionExperiment,
    sampling: renderSamplingExperiment,
  };
  const renderer = renderers[experimentId];
  if (renderer) return renderer();

  return element('section', {
    className: 'experiment-lab experiment-unavailable',
    attrs: { role: 'status', 'aria-label': '交互实验暂不可用' },
  }, [
    element('h3', { text: '交互实验暂不可用' }),
    element('p', { text: '这项实验尚未配置，仍可按上方练习步骤手动完成并记录结论。' }),
  ]);
}
