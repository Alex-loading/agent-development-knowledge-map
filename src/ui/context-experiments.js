import {
  applyMemoryEvent,
  assembleContext,
  recallMemory,
  retrieveAndPack,
} from '../core/context-rag-memory.js';
import { button, element } from './dom.js';

const CONTEXT_DEFAULTS = Object.freeze({
  strategy: 'recent-first',
  inputLimit: 1600,
  outputReserve: 400,
});

const CONTEXT_ITEMS = Object.freeze([
  Object.freeze({ id: 'ctx-current-request', layer: 'current-turn', projectionType: 'current-turn', tokenCost: 220, sourceRef: 'turn://teaching/current', required: true, priority: 10, timestamp: 80, status: 'active' }),
  Object.freeze({ id: 'ctx-system-contract', layer: 'static-instruction', projectionType: 'instruction', tokenCost: 280, sourceRef: 'policy://teaching/system', required: true, priority: 10, timestamp: 10, status: 'active' }),
  Object.freeze({ id: 'ctx-recent-summary', layer: 'conversation-state', projectionType: 'state-projection', tokenCost: 260, sourceRef: 'state://teaching/summary', required: false, priority: 7, timestamp: 70, status: 'active' }),
  Object.freeze({ id: 'ctx-rag-evidence', layer: 'corpus', projectionType: 'retrieval-evidence', tokenCost: 360, sourceRef: 'evidence://teaching/rag-01', required: false, priority: 9, timestamp: 50, status: 'active' }),
  Object.freeze({ id: 'ctx-memory-preference', layer: 'long-term-memory', projectionType: 'memory-projection', tokenCost: 160, sourceRef: 'memory://teaching/preference', required: false, priority: 8, timestamp: 40, status: 'active' }),
  Object.freeze({ id: 'ctx-old-summary', layer: 'conversation-state', projectionType: 'state-projection', tokenCost: 180, sourceRef: 'state://teaching/old-summary', required: false, priority: 5, timestamp: 30, status: 'superseded' }),
  Object.freeze({ id: 'ctx-expired-memory', layer: 'long-term-memory', projectionType: 'memory-projection', tokenCost: 120, sourceRef: 'memory://teaching/expired', required: false, priority: 4, timestamp: 20, status: 'expired' }),
  Object.freeze({ id: 'ctx-raw-checkpoint', layer: 'checkpoint', projectionType: 'raw', tokenCost: 900, sourceRef: 'checkpoint://teaching/raw', required: false, priority: 3, timestamp: 60, status: 'active' }),
]);

const RETRIEVAL_DEFAULTS = Object.freeze({
  queryPreset: 'refund-policy',
  department: 'all',
  language: 'all',
  latestVersionOnly: true,
  alpha: 0.6,
  topK: 4,
  threshold: 0.2,
  dedupeByDocument: true,
  budget: 520,
});

const QUERY_PRESETS = Object.freeze({
  'refund-policy': 'refund policy',
  'memory-preference': 'memory preference',
  'context-budget': 'context budget',
});

const RETRIEVAL_CORPUS = Object.freeze([
  Object.freeze({ id: 'chunk-refund-v1', documentId: 'doc-refund', version: 1, department: 'support', language: 'en', tokenCost: 150, terms: Object.freeze(['refund', 'policy', 'legacy']), denseScore: 0.72, sourceRef: 'https://example.invalid/teaching/refund/v1' }),
  Object.freeze({ id: 'chunk-refund-v2', documentId: 'doc-refund', version: 2, department: 'support', language: 'en', tokenCost: 170, terms: Object.freeze(['refund', 'policy', 'current']), denseScore: 0.94, sourceRef: 'https://example.invalid/teaching/refund/v2' }),
  Object.freeze({ id: 'chunk-refund-cn', documentId: 'doc-refund-cn', version: 1, department: 'support', language: 'zh', tokenCost: 145, terms: Object.freeze(['refund', 'policy', '退款']), denseScore: 0.78, sourceRef: 'https://example.invalid/teaching/refund/zh' }),
  Object.freeze({ id: 'chunk-memory-v1', documentId: 'doc-memory', version: 1, department: 'engineering', language: 'zh', tokenCost: 150, terms: Object.freeze(['memory', 'preference', '旧版']), denseScore: 0.82, sourceRef: 'https://example.invalid/teaching/memory/v1' }),
  Object.freeze({ id: 'chunk-memory-v2', documentId: 'doc-memory', version: 2, department: 'engineering', language: 'zh', tokenCost: 160, terms: Object.freeze(['memory', 'preference', '新版']), denseScore: 0.96, sourceRef: 'https://example.invalid/teaching/memory/v2' }),
  Object.freeze({ id: 'chunk-context-budget', documentId: 'doc-context', version: 1, department: 'engineering', language: 'en', tokenCost: 210, terms: Object.freeze(['context', 'budget', 'evidence']), denseScore: 0.88, sourceRef: 'https://example.invalid/teaching/context/budget' }),
]);

const MEMORY_POLICY = Object.freeze({
  minObserveConfidence: 0.7,
  forbiddenSensitivities: Object.freeze(['secret']),
  defaultTtl: null,
});

const MEMORY_EVENTS = Object.freeze({
  observe: Object.freeze({ type: 'observe', id: 'mem-focus', subject: 'learner-a', key: 'focus', value: 'RAG citations', scope: 'course', sourceRef: 'lesson://context-07/observe', confidence: 0.88, sensitivity: 'public', ttl: 3 }),
  'explicit-save': Object.freeze({ type: 'explicit-save', id: 'mem-language-v1', subject: 'learner-a', key: 'language', value: '中文', scope: 'course', sourceRef: 'lesson://context-07/save', confidence: 1, sensitivity: 'public', ttl: null }),
  correct: Object.freeze({ type: 'correct', id: 'mem-language-v2', targetId: 'mem-language-v1', subject: 'learner-a', key: 'language', value: '双语', scope: 'course', sourceRef: 'lesson://context-07/correct', confidence: 1, sensitivity: 'public', ttl: null }),
  delete: Object.freeze({ type: 'delete', targetId: 'mem-language-v2' }),
  'advance-time': Object.freeze({ type: 'advance-time' }),
});

function contextLabHeader(index, id, title, description) {
  return element('header', { className: 'experiment-lab__header' }, [
    element('span', { className: 'section-index', text: `Context 实验 ${index}` }),
    element('h3', { text: title, attrs: { id } }),
    element('p', { text: description }),
  ]);
}

function option(value, label) {
  return element('option', { text: label, attrs: { value } });
}

function selectControl({ id, label, value, options, update }) {
  const select = element('select', {
    className: 'agent-control-input context-control-input',
    attrs: { id },
    events: { change: update },
  }, options.map(([optionValue, optionLabel]) => option(optionValue, optionLabel)));
  select.value = value;
  return {
    input: select,
    node: element('div', { className: 'experiment-control' }, [
      element('label', { text: label, attrs: { for: id } }),
      select,
    ]),
  };
}

function numberControl({ id, label, value, min, max, step = 1, update }) {
  const input = element('input', {
    className: 'agent-control-input context-control-input',
    attrs: { id, type: 'number', min, max, step, value },
    events: { input: update },
  });
  return {
    input,
    node: element('div', { className: 'experiment-control' }, [
      element('label', { text: label, attrs: { for: id } }),
      input,
    ]),
  };
}

function rangeControl({ id, label, value, min, max, step, update }) {
  const output = element('output', {
    className: 'experiment-control__value',
    text: String(value),
    attrs: { id: `${id}-value`, for: id },
  });
  const input = element('input', {
    attrs: { id, type: 'range', min, max, step, value, 'aria-describedby': `${id}-value` },
    events: {
      input: () => {
        output.textContent = input.value;
        update();
      },
    },
  });
  return {
    input,
    output,
    node: element('div', { className: 'experiment-control' }, [
      element('div', { className: 'experiment-control__heading' }, [
        element('label', { text: label, attrs: { for: id } }),
        output,
      ]),
      input,
    ]),
  };
}

function checkboxControl({ id, label, checked, update }) {
  const input = element('input', {
    className: 'agent-checkbox context-checkbox',
    attrs: { id, type: 'checkbox' },
    events: { change: update },
  });
  input.checked = checked;
  return {
    input,
    node: element('div', { className: 'agent-check-control context-check-control' }, [
      input,
      element('label', { text: label, attrs: { for: id } }),
    ]),
  };
}

function textList(className, entries, emptyLabel, formatter) {
  return element('ul', { className }, entries.length > 0
    ? entries.map((entry) => element('li', { text: formatter(entry) }))
    : [element('li', { text: emptyLabel })]);
}

function errorText(error) {
  return error instanceof Error ? error.message : '输入暂时无法解析';
}

export function renderContextRouterExperiment() {
  let state = { ...CONTEXT_DEFAULTS };
  const result = element('div', {
    className: 'context-result context-router-result',
    attrs: {
      id: 'context-router-result',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'aria-labelledby': 'context-router-result-title',
    },
  });
  let strategy;
  let inputLimit;
  let outputReserve;

  function update() {
    state = {
      strategy: strategy.value,
      inputLimit: Number(inputLimit.value),
      outputReserve: Number(outputReserve.value),
    };
    try {
      const assembled = assembleContext(
        CONTEXT_ITEMS,
        state.inputLimit,
        state.outputReserve,
        { strategy: state.strategy },
      );
      result.dataset.status = assembled.unassemblable ? 'unassemblable' : 'ready';
      result.replaceChildren(
        element('dl', { className: 'context-metrics' }, [
          element('div', {}, [element('dt', { text: 'strategy' }), element('dd', { text: state.strategy })]),
          element('div', {}, [element('dt', { text: 'input budget' }), element('dd', { text: `${assembled.used} / ${assembled.inputBudget}` })]),
          element('div', {}, [element('dt', { text: 'remaining' }), element('dd', { text: String(assembled.remaining) })]),
          element('div', {}, [element('dt', { text: 'unassemblable' }), element('dd', { text: assembled.unassemblable ? '是' : '否' })]),
        ]),
        element('section', { className: 'context-manifest' }, [
          element('h5', { text: 'included manifest' }),
          textList('context-manifest__included', assembled.included, '无', (item) => `${item.id} · ${item.projectionType} · ${item.tokenCost}`),
        ]),
        element('section', { className: 'context-manifest' }, [
          element('h5', { text: 'excluded reasons' }),
          textList('context-manifest__excluded', assembled.excluded, '无', (item) => `${item.id} · ${item.reason}`),
        ]),
        assembled.reason ? element('p', { className: 'context-warning', text: assembled.reason }) : null,
      );
    } catch (error) {
      result.dataset.status = 'invalid';
      result.replaceChildren(element('p', { className: 'context-warning', text: `无法组装：${errorText(error)}` }));
    }
  }

  const strategyControl = selectControl({
    id: 'context-router-strategy', label: '组装策略', value: state.strategy,
    options: [['recent-first', 'recent-first · 最近优先'], ['evidence-first', 'evidence-first · 证据优先']],
    update,
  });
  strategy = strategyControl.input;
  const inputControl = numberControl({ id: 'context-router-input-limit', label: '上下文总上限', value: state.inputLimit, min: 1, max: 8192, step: 100, update });
  inputLimit = inputControl.input;
  const reserveControl = numberControl({ id: 'context-router-output-reserve', label: '输出预留', value: state.outputReserve, min: 0, max: 4096, step: 100, update });
  outputReserve = reserveControl.input;

  const lab = element('section', {
    className: 'experiment-lab context-router-lab',
    attrs: { 'aria-labelledby': 'context-router-title' },
  }, [
    contextLabHeader('01', 'context-router-title', 'Context Router 组装台', '在输入预算内投影会话状态、检索证据与长期记忆。'),
    element('p', { className: 'experiment-caveat', text: '只处理固定教学条目，不接收真实敏感内容；checkpoint 与 corpus 原文不能直接等同于模型上下文。' }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls context-controls' }, [strategyControl.node, inputControl.node, reserveControl.node]),
      element('div', { className: 'experiment-results context-results' }, [
        element('h4', { text: '上下文组装结果', attrs: { id: 'context-router-result-title' } }),
        result,
      ]),
    ]),
    button('重置 Context Router', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'context-router-reset' },
      events: {
        click: () => {
          state = { ...CONTEXT_DEFAULTS };
          strategy.value = state.strategy;
          inputLimit.value = String(state.inputLimit);
          outputReserve.value = String(state.outputReserve);
          update();
          strategy.focus();
        },
      },
    }),
  ]);
  update();
  return lab;
}

function retrievalFilters(department, language) {
  const filters = {};
  if (department !== 'all') filters.department = department;
  if (language !== 'all') filters.language = language;
  return filters;
}

export function renderHybridRetrievalExperiment() {
  let state = { ...RETRIEVAL_DEFAULTS };
  const result = element('div', {
    className: 'context-result retrieval-result',
    attrs: {
      id: 'hybrid-retrieval-result',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'aria-labelledby': 'hybrid-retrieval-result-title',
    },
  });
  let query;
  let department;
  let language;
  let latest;
  let alpha;
  let topK;
  let threshold;
  let dedupe;
  let budget;

  function update() {
    state = {
      queryPreset: query.value,
      department: department.value,
      language: language.value,
      latestVersionOnly: latest.checked,
      alpha: Number(alpha.value),
      topK: Number(topK.value),
      threshold: Number(threshold.value),
      dedupeByDocument: dedupe.checked,
      budget: Number(budget.value),
    };
    try {
      const retrieval = retrieveAndPack(RETRIEVAL_CORPUS, QUERY_PRESETS[state.queryPreset], {
        alpha: state.alpha,
        topK: state.topK,
        threshold: state.threshold,
        budget: state.budget,
        filters: retrievalFilters(state.department, state.language),
        latestVersionOnly: state.latestVersionOnly,
        dedupeByDocument: state.dedupeByDocument,
      });
      result.dataset.status = 'ready';
      result.replaceChildren(
        element('p', { className: 'retrieval-budget', text: `query：${QUERY_PRESETS[state.queryPreset]} · packed budget：${retrieval.used} / ${state.budget} · remaining：${retrieval.remaining}` }),
        element('section', {}, [
          element('h5', { text: 'retrieval trace' }),
          element('ol', { className: 'retrieval-trace' }, retrieval.trace.map((entry) => (
            element('li', { className: 'retrieval-trace__row' }, [
              element('strong', { text: entry.id }),
              element('progress', { attrs: { max: 1, value: entry.hybridScore, 'aria-label': `${entry.id} 教学混合分数` } }),
              element('span', { text: `sparse ${entry.sparseScore.toFixed(2)} · dense ${entry.denseScore.toFixed(2)} · hybrid ${entry.hybridScore.toFixed(2)} · ${entry.filteredReason ?? 'candidate'}` }),
            ])
          ))),
        ]),
        element('section', {}, [
          element('h5', { text: 'ranking' }),
          textList('retrieval-ranking', retrieval.ranked, '无', (entry) => `${entry.id} · score ${entry.hybridScore.toFixed(2)}`),
        ]),
        element('section', {}, [
          element('h5', { text: 'packed evidence' }),
          textList('retrieval-packed', retrieval.packed, '无', (entry) => `${entry.id} · ${entry.tokenCost} teaching tokens`),
        ]),
        element('section', {}, [
          element('h5', { text: 'citation manifest' }),
          textList('retrieval-citations', retrieval.citations, '无', (entry) => `${entry.chunkId} → ${entry.sourceRef}`),
        ]),
        element('section', {}, [
          element('h5', { text: 'excluded reasons' }),
          textList('retrieval-excluded', retrieval.excluded, '无', (entry) => `${entry.id} · ${entry.reason}`),
        ]),
      );
    } catch (error) {
      result.dataset.status = 'invalid';
      result.replaceChildren(element('p', { className: 'context-warning', text: `无法检索：${errorText(error)}` }));
    }
  }

  const queryControl = selectControl({ id: 'hybrid-query-preset', label: '查询预设', value: state.queryPreset, options: [['refund-policy', '退款政策'], ['memory-preference', '记忆偏好'], ['context-budget', '上下文预算']], update });
  query = queryControl.input;
  const departmentControl = selectControl({ id: 'hybrid-department', label: '部门过滤', value: state.department, options: [['all', '全部部门'], ['support', 'support'], ['engineering', 'engineering']], update });
  department = departmentControl.input;
  const languageControl = selectControl({ id: 'hybrid-language', label: '语言过滤', value: state.language, options: [['all', '全部语言'], ['zh', '中文'], ['en', 'English']], update });
  language = languageControl.input;
  const latestControl = checkboxControl({ id: 'hybrid-latest-version', label: '只保留最新版本', checked: state.latestVersionOnly, update });
  latest = latestControl.input;
  const alphaControl = rangeControl({ id: 'hybrid-alpha', label: 'Dense 权重 alpha', value: state.alpha, min: 0, max: 1, step: 0.05, update });
  alpha = alphaControl.input;
  const topKControl = numberControl({ id: 'hybrid-top-k', label: 'Top K', value: state.topK, min: 1, max: 6, update });
  topK = topKControl.input;
  const thresholdControl = rangeControl({ id: 'hybrid-threshold', label: '最低教学分数', value: state.threshold, min: 0, max: 1, step: 0.05, update });
  threshold = thresholdControl.input;
  const dedupeControl = checkboxControl({ id: 'hybrid-dedupe', label: '按文档去重', checked: state.dedupeByDocument, update });
  dedupe = dedupeControl.input;
  const budgetControl = numberControl({ id: 'hybrid-budget', label: '证据预算', value: state.budget, min: 0, max: 1600, step: 20, update });
  budget = budgetControl.input;

  const lab = element('section', {
    className: 'experiment-lab hybrid-retrieval-lab',
    attrs: { 'aria-labelledby': 'hybrid-retrieval-title' },
  }, [
    contextLabHeader('02', 'hybrid-retrieval-title', 'Hybrid Retrieval 流水线', '观察过滤、稀疏/稠密融合、排序、去重与预算打包的先后关系。'),
    element('p', { className: 'experiment-caveat', text: '所有分数与 token 成本均为确定性教学值，不代表真实 embedding、reranker 或生产检索质量。' }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls context-controls retrieval-controls' }, [queryControl.node, departmentControl.node, languageControl.node, latestControl.node, alphaControl.node, topKControl.node, thresholdControl.node, dedupeControl.node, budgetControl.node]),
      element('div', { className: 'experiment-results context-results retrieval-results' }, [
        element('h4', { text: '检索与证据打包结果', attrs: { id: 'hybrid-retrieval-result-title' } }),
        result,
      ]),
    ]),
    button('重置 Hybrid Retrieval', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'hybrid-retrieval-reset' },
      events: {
        click: () => {
          state = { ...RETRIEVAL_DEFAULTS };
          query.value = state.queryPreset;
          department.value = state.department;
          language.value = state.language;
          latest.checked = state.latestVersionOnly;
          alpha.value = String(state.alpha);
          alphaControl.output.textContent = String(state.alpha);
          topK.value = String(state.topK);
          threshold.value = String(state.threshold);
          thresholdControl.output.textContent = String(state.threshold);
          dedupe.checked = state.dedupeByDocument;
          budget.value = String(state.budget);
          update();
          query.focus();
        },
      },
    }),
  ]);
  update();
  return lab;
}

function createMemoryState() {
  return { clock: 0, records: [] };
}

function isExpired(record, clock) {
  return record.status === 'active' && record.expiresAt !== null && record.expiresAt <= clock;
}

function memoryRecordLabel(record) {
  const expiry = record.expiresAt === null ? 'none' : record.expiresAt;
  return `${record.id} · ${record.subject}/${record.scope} · ${record.key}=${record.value} · expires ${expiry}`;
}

export function renderMemoryLifecycleExperiment() {
  let state = createMemoryState();
  let lastDecision = { action: 'idle', reason: '等待预置事件' };
  const result = element('div', {
    className: 'context-result memory-result',
    attrs: {
      id: 'memory-lifecycle-result',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'aria-labelledby': 'memory-lifecycle-result-title',
    },
  });
  let subject;
  let scope;

  function recordsFor(status) {
    if (status === 'expired') return state.records.filter((record) => isExpired(record, state.clock));
    if (status === 'active') return state.records.filter((record) => record.status === 'active' && !isExpired(record, state.clock));
    return state.records.filter((record) => record.status === status);
  }

  function update() {
    let recalled;
    try {
      recalled = recallMemory(state, {
        subject: subject.value,
        scope: scope.value,
        text: 'language 双语 memory preference focus RAG citations',
      }, state.clock);
    } catch (error) {
      recalled = { projection: [], excluded: [{ id: 'recall', reason: errorText(error) }] };
    }
    result.dataset.action = lastDecision.action;
    result.replaceChildren(
      element('dl', { className: 'context-metrics memory-decision' }, [
        element('div', {}, [element('dt', { text: 'decision' }), element('dd', { text: lastDecision.action })]),
        element('div', {}, [element('dt', { text: 'reason' }), element('dd', { text: lastDecision.reason })]),
        element('div', {}, [element('dt', { text: 'logical clock' }), element('dd', { text: String(state.clock) })]),
      ]),
      ...[
        ['active', 'active records：'],
        ['superseded', 'superseded records：'],
        ['expired', 'expired records：'],
        ['deleted', 'deleted records：'],
      ].map(([status, label]) => element('section', { className: `memory-ledger memory-ledger--${status}` }, [
        element('h5', { text: label }),
        textList(`memory-ledger__${status}`, recordsFor(status), '无', memoryRecordLabel),
      ])),
      element('section', { className: 'memory-recall' }, [
        element('h5', { text: 'subject-scoped recall' }),
        element('p', { text: `subject ${subject.value} · scope ${scope.value}` }),
        textList('memory-recall__projection', recalled.projection, '无', (entry) => `${entry.id} · ${entry.key}=${entry.value} · ${entry.sourceRef}`),
        textList('memory-recall__excluded', recalled.excluded, 'excluded：无', (entry) => `excluded ${entry.id} · ${entry.reason}`),
      ]),
    );
  }

  function applyPreset(type) {
    try {
      const nextNow = type === 'advance-time' ? state.clock + 4 : state.clock + 1;
      const decision = applyMemoryEvent(state, MEMORY_EVENTS[type], MEMORY_POLICY, nextNow);
      state = decision.state;
      lastDecision = { action: decision.action, reason: decision.reason };
    } catch (error) {
      lastDecision = { action: 'reject', reason: errorText(error) };
    }
    update();
  }

  const subjectControl = selectControl({ id: 'memory-recall-subject', label: '召回主体', value: 'learner-a', options: [['learner-a', 'learner-a'], ['learner-b', 'learner-b']], update });
  subject = subjectControl.input;
  const scopeControl = selectControl({ id: 'memory-recall-scope', label: '召回作用域', value: 'course', options: [['course', 'course'], ['profile', 'profile']], update });
  scope = scopeControl.input;
  const eventButtons = [
    ['observe', 'observe · 观察偏好'],
    ['explicit-save', 'explicit-save · 明确保存'],
    ['correct', 'correct · 更正记录'],
    ['delete', 'delete · 删除记录'],
    ['advance-time', 'advance-time · 推进时钟'],
  ].map(([type, label]) => button(label, {
    className: 'secondary-action memory-event-button',
    attrs: { id: `memory-event-${type}` },
    events: { click: () => applyPreset(type) },
  }));
  const observeButton = eventButtons[0];

  const lab = element('section', {
    className: 'experiment-lab memory-lifecycle-lab',
    attrs: { 'aria-labelledby': 'memory-lifecycle-title' },
  }, [
    contextLabHeader('03', 'memory-lifecycle-title', 'Memory Lifecycle 账本', '用预置事件观察记忆的写入、更正、过期、删除与主体隔离召回。'),
    element('p', { className: 'experiment-caveat', text: '这是使用逻辑时钟的确定性课堂模拟，是非真实隐私存储；不会读取、保存或上传你的个人信息。' }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls context-controls' }, [
        subjectControl.node,
        scopeControl.node,
        element('div', { className: 'memory-event-grid', attrs: { role: 'group', 'aria-label': '预置记忆事件' } }, eventButtons),
      ]),
      element('div', { className: 'experiment-results context-results memory-results' }, [
        element('h4', { text: '记忆决策与召回结果', attrs: { id: 'memory-lifecycle-result-title' } }),
        result,
      ]),
    ]),
    button('重置 Memory Lifecycle', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'memory-lifecycle-reset' },
      events: {
        click: () => {
          state = createMemoryState();
          lastDecision = { action: 'idle', reason: '已恢复初始教学状态' };
          subject.value = 'learner-a';
          scope.value = 'course';
          update();
          observeButton.focus();
        },
      },
    }),
  ]);
  update();
  return lab;
}

export const contextExperimentRenderers = Object.freeze({
  'context-router': renderContextRouterExperiment,
  'hybrid-retrieval': renderHybridRetrievalExperiment,
  'memory-lifecycle': renderMemoryLifecycleExperiment,
});
