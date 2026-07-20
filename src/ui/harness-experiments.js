import { planResume, reduceRun, stepQueue } from '../core/agent-harness.js';
import { button, element } from './dom.js';

const RUN_DEFAULTS = Object.freeze({
  status: 'created',
  sequence: 0,
  processedEventIds: Object.freeze([]),
  stepsUsed: 0,
  pendingApproval: null,
});

const RUN_POLICY = Object.freeze({ maxSteps: 4 });

const RESUME_DEFAULTS = Object.freeze({
  callKind: 'write',
  hasCompletionEvent: false,
  errorKind: 'unknown',
  hasIdempotencyKey: false,
  idempotencyRecord: 'none',
  remoteEvidence: 'none',
  attemptsUsed: 0,
  maxAttempts: 3,
});

const QUEUE_DEFAULTS = Object.freeze({
  arrivals: 4,
  workers: 1,
  service: 1,
  limit: 2,
});

const RUN_EVENTS = Object.freeze([
  Object.freeze({ type: 'enqueue', label: 'enqueue · 入队' }),
  Object.freeze({ type: 'start', label: 'start · 启动' }),
  Object.freeze({ type: 'request-approval', label: 'request-approval · 请求审批' }),
  Object.freeze({ type: 'approve', label: 'approve · 批准' }),
  Object.freeze({ type: 'schedule-retry', label: 'schedule-retry · 等待重试' }),
  Object.freeze({ type: 'retry', label: 'retry · 重试' }),
  Object.freeze({ type: 'block', label: 'block · 阻塞' }),
  Object.freeze({ type: 'resume', label: 'resume · 恢复' }),
  Object.freeze({ type: 'step', label: 'step · 执行一步' }),
  Object.freeze({ type: 'complete', label: 'complete · 完成' }),
  Object.freeze({ type: 'fail', label: 'fail · 失败' }),
  Object.freeze({ type: 'cancel', label: 'cancel · 取消' }),
  Object.freeze({ type: 'timeout', label: 'timeout · 超时' }),
]);

const RUN_STATUSES = Object.freeze([
  'created',
  'queued',
  'running',
  'awaiting_approval',
  'retry_wait',
  'blocked',
  'succeeded',
  'failed',
  'cancelled',
  'timed_out',
]);

function createRunState() {
  return {
    ...RUN_DEFAULTS,
    processedEventIds: [],
  };
}

function createQueueState() {
  return { queued: [], running: [], completed: [], cancelled: [] };
}

function harnessLabHeader(index, id, title, description) {
  return element('header', { className: 'experiment-lab__header' }, [
    element('span', { className: 'section-index', text: `Harness 实验 ${index}` }),
    element('h3', { text: title, attrs: { id } }),
    element('p', { text: description }),
  ]);
}

function ledgerEntry(term, value) {
  return element('div', { className: 'agent-decision-ledger__entry' }, [
    element('dt', { text: `${term}：` }),
    element('dd', { text: value }),
  ]);
}

function setLedger(result, status, label, entries) {
  result.className = 'agent-decision-ledger agent-status-stamp harness-decision harness-metrics-grid';
  result.dataset.status = status;
  result.replaceChildren(
    element('strong', { className: 'agent-status-stamp__label', text: label }),
    element('dl', { className: 'agent-decision-values' }, (
      entries.map(({ term, value }) => ledgerEntry(term, value))
    )),
  );
}

function errorMessage(error) {
  return error instanceof Error ? error.message : '输入暂时无法解析';
}

function formatIds(ids) {
  return ids.length > 0 ? ids.join('、') : '无';
}

function readInteger(input) {
  return input.value.trim() === '' ? Number.NaN : Number(input.value);
}

function numberControl({ id, label, value, min = 0, update }) {
  const input = element('input', {
    className: 'agent-control-input harness-number-input',
    attrs: { id, type: 'number', min, step: 1, value },
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
    className: 'agent-control-input harness-select',
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

function checkboxControl({ id, label, update }) {
  const input = element('input', {
    className: 'agent-checkbox harness-checkbox',
    attrs: { id, type: 'checkbox' },
    events: { change: update },
  });
  return {
    input,
    control: element('div', { className: 'agent-check-control harness-check-control' }, [
      input,
      element('label', { text: label, attrs: { for: id } }),
    ]),
  };
}

export function renderRunLifecycleExperiment() {
  let state = createRunState();
  let eventIdSequence = 0;
  let lastOutcome = { rejected: false, reason: '等待生命周期事件' };
  const statusNodes = new Map();
  const result = element('div', {
    attrs: { id: 'harness-lifecycle-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  function update() {
    for (const [status, node] of statusNodes) {
      node.dataset.active = status === state.status ? 'true' : 'false';
    }
    setLedger(
      result,
      lastOutcome.rejected ? 'rejected' : state.status,
      lastOutcome.rejected ? 'REJECTED' : state.status,
      [
        { term: '状态', value: state.status },
        { term: 'sequence', value: String(state.sequence) },
        { term: 'steps', value: `${state.stepsUsed} / ${RUN_POLICY.maxSteps}` },
        { term: 'pending approval', value: state.pendingApproval ?? '无' },
        { term: 'reason', value: lastOutcome.reason },
      ],
    );
  }

  function applyEvent(type) {
    eventIdSequence += 1;
    const event = {
      type,
      eventId: `harness-run-event-${eventIdSequence}`,
      sequence: state.sequence + 1,
    };
    if (type === 'request-approval') event.payload = { callId: 'refund-001' };
    lastOutcome = reduceRun(state, event, RUN_POLICY);
    state = lastOutcome.state;
    update();
  }

  const eventButtons = RUN_EVENTS.map(({ type, label }) => button(label, {
    className: 'secondary-action harness-event-button',
    attrs: { id: `harness-event-${type}` },
    events: { click: () => applyEvent(type) },
  }));
  const enqueueButton = eventButtons[0];

  const stateTrack = element('ol', {
    className: 'harness-state-track',
    attrs: { 'aria-label': 'Run 状态轨迹' },
  }, RUN_STATUSES.map((status) => {
    const node = element('li', {
      className: 'harness-state-track__state',
      text: status,
      dataset: { active: status === state.status ? 'true' : 'false' },
    });
    statusNodes.set(status, node);
    return node;
  }));

  const lab = element('section', {
    className: 'experiment-lab harness-lifecycle-lab',
    attrs: { 'aria-labelledby': 'harness-lifecycle-title' },
  }, [
    harnessLabHeader('01', 'harness-lifecycle-title', 'Run Lifecycle 状态台', '按事件顺序驱动 run，观察审批、重试、阻塞和终态守卫。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这是确定性状态机模拟，不是真实 worker，也不连接持久层；刷新页面后不会保留事件。',
    }),
    stateTrack,
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls harness-event-grid' }, eventButtons),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '状态机结果' }),
        result,
      ]),
    ]),
    button('重置生命周期实验', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'harness-lifecycle-reset' },
      events: {
        click: () => {
          state = createRunState();
          lastOutcome = { rejected: false, reason: '已恢复初始状态' };
          update();
          enqueueButton.focus();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export function renderRetryResumeExperiment() {
  const result = element('div', {
    attrs: { id: 'harness-resume-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
  let callKind;
  let completion;
  let errorKind;
  let key;
  let record;
  let remote;
  let attempts;
  let maxAttempts;

  function update() {
    try {
      const decision = planResume({
        callKind: callKind.value,
        hasCompletionEvent: completion.checked,
        errorKind: errorKind.value,
        idempotencyKey: key.checked ? 'run-001/call-001' : null,
        idempotencyRecord: record.value,
        remoteEvidence: remote.value,
        attemptsUsed: readInteger(attempts),
        maxAttempts: readInteger(maxAttempts),
        now: 1000,
        baseDelayMs: 250,
        jitterFactor: 0.2,
      });
      setLedger(result, decision.decision, decision.decision, [
        { term: 'decision', value: decision.decision },
        { term: 'reason', value: decision.reason },
        { term: 'missing evidence', value: formatIds(decision.missingEvidence) },
        { term: 'next attempt', value: decision.nextAttemptAt === null ? '无' : String(decision.nextAttemptAt) },
      ]);
    } catch (error) {
      setLedger(result, 'invalid', 'INVALID', [
        { term: '错误', value: errorMessage(error) },
      ]);
    }
  }

  const callKindControl = selectControl({
    id: 'harness-resume-call-kind',
    label: '调用类型',
    value: RESUME_DEFAULTS.callKind,
    options: [
      { value: 'read', label: 'read · 读取' },
      { value: 'write', label: 'write · 写入' },
    ],
    update,
  });
  callKind = callKindControl.select;
  const completionControl = checkboxControl({
    id: 'harness-resume-completion', label: '已有 completion event', update,
  });
  completion = completionControl.input;
  const errorKindControl = selectControl({
    id: 'harness-resume-error-kind',
    label: '错误类型',
    value: RESUME_DEFAULTS.errorKind,
    options: [
      { value: 'transient', label: 'transient · 临时错误' },
      { value: 'permanent', label: 'permanent · 永久错误' },
      { value: 'unknown', label: 'unknown · 结果未知' },
    ],
    update,
  });
  errorKind = errorKindControl.select;
  const keyControl = checkboxControl({
    id: 'harness-resume-key', label: '使用稳定幂等键 run-001/call-001', update,
  });
  key = keyControl.input;
  const recordControl = selectControl({
    id: 'harness-resume-record',
    label: '幂等账本记录',
    value: RESUME_DEFAULTS.idempotencyRecord,
    options: [
      { value: 'none', label: 'none · 无记录' },
      { value: 'pending', label: 'pending · 待确认' },
      { value: 'succeeded', label: 'succeeded · 已成功' },
    ],
    update,
  });
  record = recordControl.select;
  const remoteControl = selectControl({
    id: 'harness-resume-remote',
    label: '远端证据',
    value: RESUME_DEFAULTS.remoteEvidence,
    options: [
      { value: 'none', label: 'none · 无证据' },
      { value: 'succeeded', label: 'succeeded · 远端成功' },
      { value: 'failed', label: 'failed · 远端失败' },
    ],
    update,
  });
  remote = remoteControl.select;
  const attemptsControl = numberControl({
    id: 'harness-resume-attempts', label: '已用尝试次数', value: RESUME_DEFAULTS.attemptsUsed, update,
  });
  attempts = attemptsControl.input;
  const maxAttemptsControl = numberControl({
    id: 'harness-resume-max-attempts', label: '最大尝试次数', value: RESUME_DEFAULTS.maxAttempts, min: 1, update,
  });
  maxAttempts = maxAttemptsControl.input;

  const lab = element('section', {
    className: 'experiment-lab harness-resume-lab',
    attrs: { 'aria-labelledby': 'harness-resume-title' },
  }, [
    harnessLabHeader('02', 'harness-resume-title', 'Retry / Resume 证据台', '组合调用性质、账本与远端证据，决定崩溃后如何安全恢复。'),
    element('p', {
      className: 'experiment-caveat',
      text: '可重试错误不等于副作用可安全重放；自动恢复必须同时满足错误语义、幂等性与完成证据约束。',
    }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls harness-control-set' }, [
        callKindControl.control,
        completionControl.control,
        errorKindControl.control,
        keyControl.control,
        recordControl.control,
        remoteControl.control,
        attemptsControl.control,
        maxAttemptsControl.control,
      ]),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '恢复判定' }),
        result,
      ]),
    ]),
    button('重置恢复实验', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'harness-resume-reset' },
      events: {
        click: () => {
          callKind.value = RESUME_DEFAULTS.callKind;
          completion.checked = RESUME_DEFAULTS.hasCompletionEvent;
          errorKind.value = RESUME_DEFAULTS.errorKind;
          key.checked = RESUME_DEFAULTS.hasIdempotencyKey;
          record.value = RESUME_DEFAULTS.idempotencyRecord;
          remote.value = RESUME_DEFAULTS.remoteEvidence;
          attempts.value = String(RESUME_DEFAULTS.attemptsUsed);
          maxAttempts.value = String(RESUME_DEFAULTS.maxAttempts);
          update();
          callKind.focus();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export function renderQueueBackpressureExperiment() {
  let state = createQueueState();
  let jobIdSequence = 0;
  let lastTick = null;
  let arrivals;
  let workers;
  let service;
  let limit;
  const result = element('div', {
    attrs: { id: 'harness-queue-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
  const meter = element('progress', {
    className: 'harness-queue-meter',
    attrs: { max: QUEUE_DEFAULTS.limit, value: 0, 'aria-label': '队列容量占用' },
  });

  function values() {
    return {
      arrivalCount: readInteger(arrivals),
      workerCount: readInteger(workers),
      serviceCapacity: readInteger(service),
      maxQueue: readInteger(limit),
    };
  }

  function assertInputs(input) {
    for (const [name, value] of Object.entries(input)) {
      if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`${name} must be a non-negative safe integer`);
      }
    }
  }

  function update(queueResult = lastTick) {
    try {
      const currentValues = values();
      assertInputs(currentValues);
      const rejected = queueResult?.rejected ?? [];
      const started = queueResult?.started ?? [];
      const completedThisTick = queueResult?.completed ?? [];
      const utilization = queueResult?.utilization
        ?? (currentValues.workerCount === 0 ? 0 : state.running.length / currentValues.workerCount);
      const oldestAge = state.queued.reduce((oldest, job) => Math.max(oldest, job.age), 0);
      meter.setAttribute('max', Math.max(currentValues.maxQueue, 1));
      meter.setAttribute('value', Math.min(state.queued.length, Math.max(currentValues.maxQueue, 1)));
      setLedger(result, rejected.length > 0 ? 'overloaded' : 'healthy', rejected.length > 0 ? 'OVERLOADED' : 'HEALTHY', [
        { term: 'started', value: formatIds(started) },
        { term: 'running', value: state.running.length > 0
          ? state.running.map((job) => `${job.id} (remaining ${job.remaining})`).join('、')
          : '无' },
        { term: 'queued', value: formatIds(state.queued.map((job) => job.id)) },
        { term: 'completed', value: formatIds(state.completed) },
        { term: 'completed this tick', value: formatIds(completedThisTick) },
        { term: 'rejected', value: formatIds(rejected) },
        { term: 'utilization', value: `${Math.round(utilization * 100)}%` },
        { term: 'oldest age', value: String(oldestAge) },
      ]);
    } catch (error) {
      setLedger(result, 'invalid', 'INVALID', [
        { term: '错误', value: errorMessage(error) },
      ]);
    }
  }

  function tick() {
    try {
      const currentValues = values();
      assertInputs(currentValues);
      const arrivalsForTick = Array.from({ length: currentValues.arrivalCount }, () => {
        jobIdSequence += 1;
        return { id: `job-${String(jobIdSequence).padStart(3, '0')}`, duration: 2 };
      });
      lastTick = stepQueue(state, {
        arrivals: arrivalsForTick,
        cancelIds: [],
        workerCount: currentValues.workerCount,
        serviceCapacity: currentValues.serviceCapacity,
        maxQueue: currentValues.maxQueue,
        admissionPolicy: 'reject-new',
      });
      state = lastTick.state;
      update(lastTick);
    } catch (error) {
      setLedger(result, 'invalid', 'INVALID', [
        { term: '错误', value: errorMessage(error) },
      ]);
    }
  }

  const arrivalsControl = numberControl({
    id: 'harness-queue-arrivals', label: '每 tick 新到任务', value: QUEUE_DEFAULTS.arrivals, update,
  });
  arrivals = arrivalsControl.input;
  const workersControl = numberControl({
    id: 'harness-queue-workers', label: 'worker 数', value: QUEUE_DEFAULTS.workers, update,
  });
  workers = workersControl.input;
  const serviceControl = numberControl({
    id: 'harness-queue-service', label: '每 tick 服务量', value: QUEUE_DEFAULTS.service, update,
  });
  service = serviceControl.input;
  const limitControl = numberControl({
    id: 'harness-queue-limit', label: '队列上限', value: QUEUE_DEFAULTS.limit, update,
  });
  limit = limitControl.input;
  const tickButton = button('推进一个 tick', {
    className: 'harness-tick-button',
    attrs: { id: 'harness-queue-tick' },
    events: { click: tick },
  });

  const lab = element('section', {
    className: 'experiment-lab harness-queue-lab',
    attrs: { 'aria-labelledby': 'harness-queue-title' },
  }, [
    harnessLabHeader('03', 'harness-queue-title', 'Queue / Backpressure 调度台', '推进离散时间，观察 worker、等待队列与拒绝新任务的背压边界。'),
    element('p', {
      className: 'experiment-caveat',
      text: '这是离散 tick 教学模拟，不是分布式队列；它省略了租约、网络分区、重投递与跨节点一致性。',
    }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls harness-control-set' }, [
        arrivalsControl.control,
        workersControl.control,
        serviceControl.control,
        limitControl.control,
        tickButton,
      ]),
      element('div', { className: 'experiment-results' }, [
        element('h4', { text: '队列指标' }),
        element('div', { className: 'harness-queue-meter-wrap' }, [
          element('span', { text: '等待队列容量' }),
          meter,
        ]),
        result,
      ]),
    ]),
    button('重置队列实验', {
      className: 'secondary-action experiment-reset',
      attrs: { id: 'harness-queue-reset' },
      events: {
        click: () => {
          state = createQueueState();
          lastTick = null;
          arrivals.value = String(QUEUE_DEFAULTS.arrivals);
          workers.value = String(QUEUE_DEFAULTS.workers);
          service.value = String(QUEUE_DEFAULTS.service);
          limit.value = String(QUEUE_DEFAULTS.limit);
          update();
          tickButton.focus();
        },
      },
    }),
  ]);

  update();
  return lab;
}

export const harnessExperimentRenderers = Object.freeze({
  'run-lifecycle': renderRunLifecycleExperiment,
  'retry-resume': renderRetryResumeExperiment,
  'queue-backpressure': renderQueueBackpressureExperiment,
});
