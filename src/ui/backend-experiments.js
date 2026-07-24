import {
  advanceJobDelivery,
  evaluateServiceAdmission,
  simulateStreamLifecycle,
} from '../core/backend-engineering.js';
import { button, element } from './dom.js';

const STREAM_DEFAULTS = Object.freeze({
  responseMode: 'stream',
  deltaCount: 3,
  disconnectAfterDelta: null,
  cancelAfterDelta: null,
  failAfterDelta: null,
  upstreamCancellable: true,
});

const ADMISSION_DEFAULTS = Object.freeze({
  arrivalRatePerSecond: 12,
  meanServiceTimeMs: 500,
  concurrencySlots: 4,
  queueLimit: 3,
  deadlineMs: 1_000,
});

const DELIVERY_EVENT_TYPES = Object.freeze([
  'submit',
  'enqueue',
  'lease',
  'start',
  'commit',
  'ack',
  'crash',
  'redeliver',
  'cancel',
  'reconcile',
]);
const MAX_UI_DELIVERY_ATTEMPTS = 24;

function labHeader(index, id, title, description) {
  return element('header', { className: 'experiment-lab__header' }, [
    element('span', { className: 'section-index', text: `后端实验 ${index}` }),
    element('h3', { text: title, attrs: { id } }),
    element('p', { text: description }),
  ]);
}

function option(value, label) {
  return element('option', { text: label, attrs: { value } });
}

function selectControl({
  id, label, value, options, update,
}) {
  const input = element('select', {
    className: 'backend-control-input',
    attrs: { id },
    events: { change: update },
  }, options.map(([optionValue, optionLabel]) => option(optionValue, optionLabel)));
  input.value = value;
  return {
    input,
    node: element('div', { className: 'experiment-control' }, [
      element('label', { text: label, attrs: { for: id } }),
      input,
    ]),
  };
}

function numberControl({
  id, label, value, min = 0, max = 10_000, update,
}) {
  const input = element('input', {
    className: 'backend-control-input',
    attrs: {
      id,
      type: 'number',
      min,
      max,
      step: 1,
      value: value ?? '',
    },
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

function textControl({
  id, label, value, update,
}) {
  const input = element('input', {
    className: 'backend-control-input backend-long-id',
    attrs: { id, type: 'text', value },
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

function checkboxControl({
  id, label, checked, update,
}) {
  const input = element('input', {
    className: 'backend-checkbox',
    attrs: { id, type: 'checkbox' },
    events: { change: update },
  });
  input.checked = checked;
  return {
    input,
    node: element('div', { className: 'backend-check-control' }, [
      input,
      element('label', { text: label, attrs: { for: id } }),
    ]),
  };
}

function definitionLedger(entries, className = '') {
  return element('dl', {
    className: `backend-definition-ledger ${className}`.trim(),
  }, entries.map(([term, value, valueClass = '']) => (
    element('div', { className: 'backend-definition-ledger__entry' }, [
      element('dt', { text: term }),
      element('dd', { className: valueClass, text: value }),
    ])
  )));
}

function nullableInteger(input) {
  return input.value === '' ? null : Number(input.value);
}

function errorResult(result, error) {
  result.className = 'experiment-status has-error';
  result.replaceChildren(
    element('strong', { text: '输入暂时无法模拟' }),
    element('span', { text: error.message }),
  );
}

export function renderStreamLifecycleExperiment() {
  const state = { ...STREAM_DEFAULTS };
  const result = element('div', {
    className: 'experiment-status backend-stream-result',
    attrs: {
      id: 'backend-stream-result',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
  });

  let mode;
  let deltaCount;
  let disconnectAfter;
  let cancelAfter;
  let failAfter;
  let upstreamCancellable;

  function update() {
    Object.assign(state, {
      responseMode: mode.value,
      deltaCount: Number(deltaCount.value),
      disconnectAfterDelta: nullableInteger(disconnectAfter),
      cancelAfterDelta: nullableInteger(cancelAfter),
      failAfterDelta: nullableInteger(failAfter),
      upstreamCancellable: upstreamCancellable.checked,
    });

    try {
      const simulation = simulateStreamLifecycle(state);
      result.className = 'experiment-status backend-stream-result';
      result.replaceChildren(
        element('h4', { text: 'Typed event 轨迹' }),
        element('ol', { className: 'backend-event-trace' }, simulation.events.map((event) => (
          element('li', {
            className: 'backend-event backend-long-id',
            dataset: { eventType: event.type },
            text: `#${event.sequence} · ${event.type}${event.delta ? ` · delta ${event.delta}` : ''}${event.errorCode ? ` · ${event.errorCode}` : ''}`,
          })
        ))),
        definitionLedger([
          ['客户端状态', simulation.clientStatus],
          ['上游状态', simulation.upstreamStatus],
        ]),
        element('section', { className: 'backend-cleanup' }, [
          element('h4', { text: '清理动作' }),
          element('ul', {}, simulation.cleanupActions.map((action) => (
            element('li', { className: 'backend-long-id', text: action })
          ))),
        ]),
      );
    } catch (error) {
      errorResult(result, error);
    }
  }

  const modeControl = selectControl({
    id: 'backend-stream-mode',
    label: '响应模式',
    value: state.responseMode,
    options: [
      ['stream', 'stream · typed SSE'],
      ['sync', 'sync · 同步响应'],
    ],
    update,
  });
  mode = modeControl.input;
  const deltaControl = numberControl({
    id: 'backend-stream-delta-count',
    label: '事件节奏（delta 数）',
    value: state.deltaCount,
    min: 0,
    max: 20,
    update,
  });
  deltaCount = deltaControl.input;
  const disconnectControl = numberControl({
    id: 'backend-stream-disconnect-after',
    label: '第几个 delta 后断线（留空表示不触发）',
    value: state.disconnectAfterDelta,
    min: 0,
    max: 20,
    update,
  });
  disconnectAfter = disconnectControl.input;
  const cancelControl = numberControl({
    id: 'backend-stream-cancel-after',
    label: '第几个 delta 后应用取消（留空表示不触发）',
    value: state.cancelAfterDelta,
    min: 0,
    max: 20,
    update,
  });
  cancelAfter = cancelControl.input;
  const failControl = numberControl({
    id: 'backend-stream-fail-after',
    label: '第几个 delta 后上游失败（留空表示不触发）',
    value: state.failAfterDelta,
    min: 0,
    max: 20,
    update,
  });
  failAfter = failControl.input;
  const upstreamControl = checkboxControl({
    id: 'backend-stream-upstream-cancellable',
    label: '上游支持取消',
    checked: state.upstreamCancellable,
    update,
  });
  upstreamCancellable = upstreamControl.input;

  function reset() {
    Object.assign(state, STREAM_DEFAULTS);
    mode.value = state.responseMode;
    deltaCount.value = String(state.deltaCount);
    disconnectAfter.value = '';
    cancelAfter.value = '';
    failAfter.value = '';
    upstreamCancellable.checked = state.upstreamCancellable;
    update();
    mode.focus();
  }

  const lab = element('section', {
    className: 'experiment-lab backend-lab stream-lifecycle-lab',
    attrs: { 'aria-labelledby': 'backend-stream-title' },
  }, [
    labHeader('01', 'backend-stream-title', '流式生命周期推演台', '改变响应模式和中断点，观察 typed events、客户端终态、上游状态与清理责任。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这是无真实网络、模型或时钟的确定性教学模拟；断线只表示客户端连接结束，不证明上游副作用已撤回。',
    }),
    element('div', { className: 'experiment-grid backend-lab-grid' }, [
      element('div', { className: 'experiment-controls backend-controls' }, [
        modeControl.node,
        deltaControl.node,
        disconnectControl.node,
        cancelControl.node,
        failControl.node,
        upstreamControl.node,
      ]),
      element('div', { className: 'experiment-results backend-results' }, [result]),
    ]),
    button('重置流式实验', {
      className: 'secondary-action experiment-reset backend-action',
      attrs: { id: 'backend-stream-reset' },
      events: { click: reset },
    }),
  ]);

  update();
  return lab;
}

function formatMetric(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function renderServiceAdmissionExperiment() {
  const state = { ...ADMISSION_DEFAULTS };
  const result = element('div', {
    className: 'experiment-status backend-admission-result',
    attrs: {
      id: 'backend-admission-result',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
  });
  const controls = new Map();

  function update() {
    Object.assign(state, {
      arrivalRatePerSecond: Number(controls.get('arrivalRatePerSecond').value),
      meanServiceTimeMs: Number(controls.get('meanServiceTimeMs').value),
      concurrencySlots: Number(controls.get('concurrencySlots').value),
      queueLimit: Number(controls.get('queueLimit').value),
      deadlineMs: Number(controls.get('deadlineMs').value),
    });

    try {
      const evaluation = evaluateServiceAdmission(state);
      result.className = 'experiment-status backend-admission-result';
      result.replaceChildren(
        element('h4', { text: '容量窗口账本' }),
        definitionLedger([
          ['window', `${evaluation.windowMs} ms`],
          ['capacity', `${formatMetric(evaluation.capacityPerSecond)} req/s · ${evaluation.capacityCredits} credits`],
          ['offered concurrency', formatMetric(evaluation.offeredConcurrency)],
          ['utilization', `${formatMetric(evaluation.utilization * 100)}%`],
          ['immediate', String(evaluation.immediate)],
          ['queued', String(evaluation.queued)],
          ['rejected', String(evaluation.rejected)],
          ['timedOut', String(evaluation.timedOut)],
          ['max queue wait', `${evaluation.estimatedMaxQueueWaitMs} ms`],
        ], 'backend-capacity-grid'),
        element('p', {
          className: 'backend-long-id',
          text: `window protocol：${evaluation.windowProtocol}`,
        }),
        element('p', {
          className: 'backend-model-boundary',
          text: `模型边界：${evaluation.modelBoundary}`,
        }),
      );
    } catch (error) {
      errorResult(result, error);
    }
  }

  const specs = [
    ['arrivalRatePerSecond', 'backend-admission-arrival-rate', '到达率（req/s）', 0, 1_000],
    ['meanServiceTimeMs', 'backend-admission-service-time', '平均服务时间（ms）', 1, 60_000],
    ['concurrencySlots', 'backend-admission-slots', '并发槽位', 1, 1_000],
    ['queueLimit', 'backend-admission-queue-limit', '队列上限', 0, 10_000],
    ['deadlineMs', 'backend-admission-deadline', '端到端 deadline（ms）', 1, 120_000],
  ];
  const controlNodes = specs.map(([field, id, label, min, max]) => {
    const control = numberControl({
      id,
      label,
      value: state[field],
      min,
      max,
      update,
    });
    controls.set(field, control.input);
    return control.node;
  });

  function reset() {
    Object.assign(state, ADMISSION_DEFAULTS);
    for (const [field, input] of controls) input.value = String(state[field]);
    update();
    controls.get('arrivalRatePerSecond').focus();
  }

  const lab = element('section', {
    className: 'experiment-lab backend-lab service-admission-lab',
    attrs: { 'aria-labelledby': 'backend-admission-title' },
  }, [
    labHeader('02', 'backend-admission-title', '服务准入预算台', '用固定窗口查看请求会立即执行、排队、拒绝还是超过 deadline。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这是基于平均服务时间的确定性均值模型，不含真实到达分布、长尾或下游抖动，也不预测真实生产 p95/p99。',
    }),
    element('div', { className: 'experiment-grid backend-lab-grid' }, [
      element('div', { className: 'experiment-controls backend-controls' }, controlNodes),
      element('div', { className: 'experiment-results backend-results' }, [result]),
    ]),
    button('重置准入实验', {
      className: 'secondary-action experiment-reset backend-action',
      attrs: { id: 'backend-admission-reset' },
      events: { click: reset },
    }),
  ]);

  update();
  return lab;
}

function createInitialDeliveryState() {
  return {
    status: 'empty',
    jobId: null,
    idempotencyKey: null,
    deliveryAttempt: 0,
    leaseOwner: null,
    resultRef: null,
    unknownReason: null,
    processedEventIds: [],
    reconciliationItems: [],
    idempotencyRecord: null,
    ledger: [],
  };
}

export function renderJobDeliveryLedgerExperiment() {
  let state = createInitialDeliveryState();
  let eventSequence = 0;
  let attemptHistory = [];
  let lastEventId = null;
  let lastDecision = 'idle';
  let lastReason = null;
  const summary = element('div', {
    className: 'experiment-status backend-delivery-summary',
    attrs: {
      id: 'backend-delivery-summary',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
  });
  const result = element('div', {
    className: 'experiment-status backend-delivery-result',
    attrs: { id: 'backend-delivery-result' },
  });

  let submitButton;

  function clientState() {
    return {
      empty: 'not-created · 客户端尚无 job',
      submitted: 'accepted · job 已创建',
      queued: 'accepted · 等待 worker',
      leased: 'running · worker 已领取',
      running: 'running · 正在执行',
      committed: 'succeeded · 结果已持久化',
      acknowledged: 'succeeded · 消息已确认',
      cancelled: 'cancelled · 已确认取消',
      unknown: 'reconciliation-required · 暂不能断言终态',
    }[state.status];
  }

  function messageState() {
    return {
      empty: 'none · 尚未创建消息',
      submitted: 'publish-pending · job 已存在但尚未入队',
      queued: 'queued · broker 可交付',
      leased: 'in-flight · worker 暂时持有',
      running: 'in-flight · worker 正在执行',
      committed: 'commit-before-ack · 结果已提交但消息未确认',
      acknowledged: 'acknowledged · broker 已确认',
      cancelled: 'inactive · 不再交付',
      unknown: 'delivery-unknown · 必须先对账',
    }[state.status];
  }

  function effectLedgerState() {
    if (state.status === 'unknown') {
      return `unknown · ${state.unknownReason} · ${state.reconciliationItems.join(', ')}`;
    }
    if (state.resultRef !== null) return `committed · ${state.resultRef}`;
    if (state.status === 'cancelled') return 'not-committed · 已确认无结果提交';
    return 'not-recorded · 尚无已证明副作用';
  }

  function idempotencyLedgerState() {
    if (state.idempotencyRecord === null) return 'none · 尚无业务意图记录';
    return `${state.idempotencyRecord.status} · ${state.idempotencyRecord.key}`;
  }

  function recordAttempt(event, from, to, decision, reason) {
    attemptHistory = [
      ...attemptHistory,
      {
        eventId: event.eventId,
        type: event.type,
        from,
        to,
        decision,
        reason,
      },
    ].slice(-MAX_UI_DELIVERY_ATTEMPTS);
    lastEventId = event.eventId;
    lastDecision = decision;
    lastReason = reason;
  }

  function renderState() {
    const idempotencyStatus = state.idempotencyRecord?.status ?? 'none';
    summary.className = `experiment-status backend-delivery-summary backend-delivery-summary--${lastDecision}`;
    summary.dataset.decision = lastDecision;
    summary.replaceChildren(
      element('strong', {
        text: lastEventId === null
          ? '等待投递事件'
          : `${lastEventId} · ${lastDecision}`,
      }),
      element('span', {
        className: 'backend-long-id',
        text: `核心任务状态：${state.status}${lastReason ? `；${lastReason}` : ''}`,
      }),
    );

    result.className = `experiment-status backend-delivery-result backend-delivery-result--${state.status}`;
    result.dataset.status = state.status;
    result.replaceChildren(
      element('h4', { text: '投递状态与幂等证据' }),
      element('section', { className: 'backend-delivery-boundaries' }, [
        element('h4', { text: '四个独立事实边界' }),
        element('p', {
          text: '客户端状态、broker 消息、外部副作用与业务幂等记录各自回答不同问题；一个边界变化不能替其他边界作证。',
        }),
        definitionLedger([
          ['client state', clientState()],
          ['message state', messageState()],
          ['effect ledger', effectLedgerState(), 'backend-long-id'],
          ['idempotency ledger', idempotencyLedgerState(), 'backend-long-id'],
        ], 'backend-boundary-ledger'),
      ]),
      definitionLedger([
        ['delivery status', state.status],
        ['idempotency status', idempotencyStatus],
        ['jobId', state.jobId ?? 'none', 'backend-long-id'],
        ['idempotency key', state.idempotencyKey ?? 'none', 'backend-long-id'],
        ['delivery attempt', String(state.deliveryAttempt)],
        ['lease owner', state.leaseOwner ?? 'none', 'backend-long-id'],
        ['resultRef', state.resultRef ?? 'none', 'backend-long-id'],
        ['unknownReason', state.unknownReason ?? 'none', 'backend-long-id'],
        ['last decision', lastDecision],
        ['reason', lastReason ?? 'none', 'backend-long-id'],
      ]),
      element('section', { className: 'backend-reconciliation' }, [
        element('h4', { text: 'Reconcile 项' }),
        element('p', {
          className: 'backend-long-id',
          text: state.reconciliationItems.length > 0
            ? state.reconciliationItems.join(' · ')
            : '无',
        }),
      ]),
      element('section', { className: 'backend-delivery-history' }, [
        element('h4', { text: 'Ledger / history' }),
        state.ledger.length === 0
          ? element('p', { text: '尚无投递事件。' })
          : element('ol', { className: 'backend-delivery-ledger' }, state.ledger.map((entry) => (
            element('li', {
              className: 'backend-delivery-entry backend-long-id',
              dataset: { decision: entry.decision },
              text: `${entry.eventId} · ${entry.type} · ${entry.from} → ${entry.to} · ${entry.decision}`,
            })
          ))),
      ]),
      element('section', { className: 'backend-delivery-attempt-history' }, [
        element('h4', { text: `UI attempt / rejected history（最近 ${MAX_UI_DELIVERY_ATTEMPTS} 次）` }),
        element('p', {
          text: '这里保留所有按钮尝试；rejected 与 invalid-input 不会写入或篡改 core ledger。',
        }),
        attemptHistory.length === 0
          ? element('p', { text: '尚无 UI 尝试。' })
          : element('ol', { className: 'backend-delivery-attempts' }, attemptHistory.map((entry) => (
            element('li', {
              className: 'backend-delivery-attempt backend-long-id',
              dataset: { decision: entry.decision },
              text: `${entry.eventId} · ${entry.type} · ${entry.from} → ${entry.to} · ${entry.decision}${entry.reason ? ` · ${entry.reason}` : ''}`,
            })
          ))),
      ]),
    );
  }

  const jobIdControl = textControl({
    id: 'backend-delivery-job-id',
    label: 'Job ID',
    value: 'job-report-001',
    update: () => {},
  });
  const idempotencyControl = textControl({
    id: 'backend-delivery-idempotency-key',
    label: 'Idempotency key',
    value: 'tenant-a/report-request-001',
    update: () => {},
  });
  const workerControl = textControl({
    id: 'backend-delivery-worker-id',
    label: 'Worker ID',
    value: 'worker-01',
    update: () => {},
  });
  const resultRefControl = textControl({
    id: 'backend-delivery-result-ref',
    label: 'Result reference',
    value: 'result://report-001',
    update: () => {},
  });
  const reconcileControl = selectControl({
    id: 'backend-delivery-reconcile-outcome',
    label: 'Reconcile outcome',
    value: 'committed',
    options: [
      ['committed', 'committed · 已确认结果'],
      ['not-committed', 'not-committed · 未提交'],
    ],
    update: () => {},
  });

  function eventFor(type) {
    eventSequence += 1;
    const event = { eventId: `ui-${String(eventSequence).padStart(2, '0')}-${type}`, type };
    if (type === 'submit') {
      event.jobId = jobIdControl.input.value;
      event.idempotencyKey = idempotencyControl.input.value;
    }
    if (type === 'lease' || type === 'redeliver') {
      event.workerId = workerControl.input.value;
    }
    if (type === 'commit') event.resultRef = resultRefControl.input.value;
    if (type === 'reconcile') {
      event.outcome = reconcileControl.input.value;
      if (event.outcome === 'committed') event.resultRef = resultRefControl.input.value;
    }
    return event;
  }

  function applyEvent(type) {
    const event = eventFor(type);
    const fromStatus = state.status;
    try {
      const transition = advanceJobDelivery(state, event);
      state = transition.state;
      recordAttempt(
        event,
        fromStatus,
        state.status,
        transition.decision,
        transition.reason,
      );
      renderState();
    } catch (error) {
      recordAttempt(event, fromStatus, state.status, 'invalid-input', error.message);
      renderState();
    }
  }

  const eventButtons = DELIVERY_EVENT_TYPES.map((type) => {
    const eventButton = button(type, {
      className: 'secondary-action backend-action backend-event-action',
      attrs: { id: `backend-delivery-event-${type}` },
      events: { click: () => applyEvent(type) },
    });
    if (type === 'submit') submitButton = eventButton;
    return eventButton;
  });

  function reset() {
    state = createInitialDeliveryState();
    eventSequence = 0;
    attemptHistory = [];
    lastEventId = null;
    lastDecision = 'idle';
    lastReason = null;
    jobIdControl.input.value = 'job-report-001';
    idempotencyControl.input.value = 'tenant-a/report-request-001';
    workerControl.input.value = 'worker-01';
    resultRefControl.input.value = 'result://report-001';
    reconcileControl.input.value = 'committed';
    renderState();
    submitButton.focus();
  }

  const lab = element('section', {
    className: 'experiment-lab backend-lab job-delivery-ledger-lab',
    attrs: { 'aria-labelledby': 'backend-delivery-title' },
  }, [
    labHeader('03', 'backend-delivery-title', '任务投递账本推演台', '逐步注入提交、投递、执行、崩溃与对账事件，观察状态、幂等记录和未知结果。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这是固定状态机上的确定性教学模拟，不调用真实 broker、数据库或外部副作用；ack、幂等和 reconcile 只在这里声明的边界内成立。',
    }),
    element('div', { className: 'experiment-grid backend-lab-grid' }, [
      element('div', { className: 'experiment-controls backend-controls' }, [
        jobIdControl.node,
        idempotencyControl.node,
        workerControl.node,
        resultRefControl.node,
        reconcileControl.node,
        element('div', {
          className: 'backend-event-actions',
          attrs: { role: 'group', 'aria-label': '投递事件' },
        }, eventButtons),
      ]),
      element('div', { className: 'experiment-results backend-results' }, [summary, result]),
    ]),
    button('重置投递实验', {
      className: 'secondary-action experiment-reset backend-action',
      attrs: { id: 'backend-delivery-reset' },
      events: { click: reset },
    }),
  ]);

  renderState();
  return lab;
}

export const backendExperimentRenderers = Object.freeze({
  'stream-lifecycle': renderStreamLifecycleExperiment,
  'service-admission': renderServiceAdmissionExperiment,
  'job-delivery-ledger': renderJobDeliveryLedgerExperiment,
});
