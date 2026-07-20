const RUN_STATUSES = new Set([
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

const TERMINAL_RUN_STATUSES = new Set([
  'succeeded',
  'failed',
  'cancelled',
  'timed_out',
]);

const RUN_TRANSITIONS = {
  enqueue: { from: 'created', to: 'queued' },
  start: { from: 'queued', to: 'running' },
  'request-approval': { from: 'running', to: 'awaiting_approval' },
  approve: { from: 'awaiting_approval', to: 'running' },
  'schedule-retry': { from: 'running', to: 'retry_wait' },
  retry: { from: 'retry_wait', to: 'running' },
  block: { from: 'running', to: 'blocked' },
  resume: { from: 'blocked', to: 'running' },
  complete: { from: 'running', to: 'succeeded' },
  step: { from: 'running', to: 'running' },
};

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertPlainObject(value, name) {
  if (!isPlainObject(value)) {
    throw new TypeError(`${name} must be a plain object`);
  }
}

function assertNonEmptyString(value, name) {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new RangeError(`${name} must not be empty`);
  }
}

function assertNumber(value, name) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and non-negative`);
  }
}

function assertNonNegativeInteger(value, name, { positive = false } = {}) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
  const minimum = positive ? 1 : 0;
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a ${positive ? 'positive' : 'non-negative'} integer`);
  }
}

function clone(value) {
  return structuredClone(value);
}

function assertRunState(state) {
  assertPlainObject(state, 'state');
  if (!RUN_STATUSES.has(state.status)) {
    throw new RangeError('state.status is not a supported run status');
  }
  assertNonNegativeInteger(state.sequence, 'state.sequence');
  assertNonNegativeInteger(state.stepsUsed, 'state.stepsUsed');
  if (!Array.isArray(state.processedEventIds)) {
    throw new TypeError('state.processedEventIds must be an array');
  }

  const eventIds = new Set();
  for (const eventId of state.processedEventIds) {
    assertNonEmptyString(eventId, 'state.processedEventIds entry');
    if (eventIds.has(eventId)) {
      throw new RangeError(`duplicate processed event ID: ${eventId}`);
    }
    eventIds.add(eventId);
  }

  if (state.pendingApproval !== null) {
    assertNonEmptyString(state.pendingApproval, 'state.pendingApproval');
  }
}

function assertRunEvent(event) {
  assertPlainObject(event, 'event');
  assertNonEmptyString(event.eventId, 'event.eventId');
  assertNonNegativeInteger(event.sequence, 'event.sequence', { positive: true });
  if (typeof event.type !== 'string') {
    throw new TypeError('event.type must be a string');
  }
}

function runResult(state, rejected, reason) {
  return {
    state,
    emittedEffects: [],
    rejected,
    reason,
  };
}

export function reduceRun(state, event, policy) {
  assertRunState(state);
  assertRunEvent(event);
  assertPlainObject(policy, 'policy');
  assertNonNegativeInteger(policy.maxSteps, 'policy.maxSteps', { positive: true });

  const nextState = clone(state);

  if (state.processedEventIds.includes(event.eventId)) {
    return runResult(nextState, true, `duplicate eventId: ${event.eventId}`);
  }

  if (event.sequence !== state.sequence + 1) {
    return runResult(
      nextState,
      true,
      `event sequence must be ${state.sequence + 1}, received ${event.sequence}`,
    );
  }

  if (TERMINAL_RUN_STATUSES.has(state.status)) {
    return runResult(nextState, true, `terminal state ${state.status} is irreversible`);
  }

  if (event.type === 'fail' || event.type === 'cancel' || event.type === 'timeout') {
    nextState.status = {
      fail: 'failed',
      cancel: 'cancelled',
      timeout: 'timed_out',
    }[event.type];
  } else {
    const transition = RUN_TRANSITIONS[event.type];
    if (!transition) {
      return runResult(nextState, true, `unknown event type: ${event.type}`);
    }
    if (transition.from !== state.status) {
      return runResult(
        nextState,
        true,
        `illegal transition: ${event.type} cannot be applied from ${state.status}`,
      );
    }

    if (event.type === 'request-approval') {
      if (!isPlainObject(event.payload)) {
        throw new TypeError('event.payload must be a plain object for request-approval');
      }
      assertNonEmptyString(event.payload.callId, 'event.payload.callId');
      nextState.pendingApproval = event.payload.callId;
    } else if (event.type === 'approve') {
      nextState.pendingApproval = null;
    } else if (event.type === 'step') {
      nextState.stepsUsed += 1;
    }

    nextState.status = event.type === 'step' && nextState.stepsUsed >= policy.maxSteps
      ? 'failed'
      : transition.to;
  }

  nextState.sequence = event.sequence;
  nextState.processedEventIds.push(event.eventId);

  const reason = event.type === 'step' && nextState.status === 'failed'
    ? 'step budget exhausted'
    : `event ${event.type} applied`;
  return runResult(nextState, false, reason);
}

const CALL_KINDS = new Set(['read', 'write']);
const ERROR_KINDS = new Set(['transient', 'permanent', 'unknown']);
const IDEMPOTENCY_RECORDS = new Set(['none', 'pending', 'succeeded']);
const REMOTE_EVIDENCE = new Set(['none', 'succeeded', 'failed']);

function assertEnum(value, allowed, name) {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
  if (!allowed.has(value)) {
    throw new RangeError(`${name} is not supported`);
  }
}

function resumeResult(decision, reason, missingEvidence = [], nextAttemptAt = null) {
  return { decision, reason, missingEvidence, nextAttemptAt };
}

export function planResume(input) {
  assertPlainObject(input, 'input');
  assertEnum(input.callKind, CALL_KINDS, 'input.callKind');
  if (typeof input.hasCompletionEvent !== 'boolean') {
    throw new TypeError('input.hasCompletionEvent must be a boolean');
  }
  assertEnum(input.errorKind, ERROR_KINDS, 'input.errorKind');
  if (input.idempotencyKey !== null && typeof input.idempotencyKey !== 'string') {
    throw new TypeError('input.idempotencyKey must be a string or null');
  }
  assertEnum(input.idempotencyRecord, IDEMPOTENCY_RECORDS, 'input.idempotencyRecord');
  assertEnum(input.remoteEvidence, REMOTE_EVIDENCE, 'input.remoteEvidence');
  assertNonNegativeInteger(input.attemptsUsed, 'input.attemptsUsed');
  assertNonNegativeInteger(input.maxAttempts, 'input.maxAttempts', { positive: true });
  assertNumber(input.now, 'input.now');
  assertNumber(input.baseDelayMs, 'input.baseDelayMs');
  assertNumber(input.jitterFactor, 'input.jitterFactor');
  if (input.jitterFactor > 1) {
    throw new RangeError('input.jitterFactor must be between 0 and 1');
  }

  if (input.hasCompletionEvent || input.idempotencyRecord === 'succeeded') {
    return resumeResult('skip', '调用已有完成证据，无需恢复');
  }
  if (input.remoteEvidence === 'succeeded') {
    return resumeResult(
      'reconcile',
      '远端已有成功证据，但缺少完成事件',
      ['completionEvent'],
    );
  }
  if (input.remoteEvidence === 'failed' || input.errorKind === 'permanent') {
    return resumeResult('fail', '已有失败证据或错误不可恢复');
  }
  if (input.callKind === 'write' && input.errorKind === 'unknown') {
    return resumeResult(
      'manual',
      '写操作结果未知且缺少可确认的远端证据',
      ['completionEvent', 'remoteEvidence'],
    );
  }
  if (input.attemptsUsed >= input.maxAttempts) {
    return resumeResult('fail', '重试预算已耗尽');
  }

  const hasStableIdempotencyKey = typeof input.idempotencyKey === 'string'
    && input.idempotencyKey.length > 0;
  const canRetry = input.callKind === 'read' || hasStableIdempotencyKey;
  if (input.errorKind === 'transient' && canRetry) {
    const nextAttemptAt = input.now
      + input.baseDelayMs * (2 ** input.attemptsUsed) * (1 + input.jitterFactor);
    if (!Number.isFinite(nextAttemptAt)) {
      throw new RangeError('computed nextAttemptAt must be finite');
    }
    return resumeResult('retry', '临时错误且操作可安全重试', [], nextAttemptAt);
  }

  return resumeResult(
    'manual',
    '现有证据不足以安全自动恢复',
    input.callKind === 'write'
      ? ['idempotencyKey', 'remoteEvidence']
      : ['remoteEvidence'],
  );
}

function assertQueueState(state) {
  assertPlainObject(state, 'state');
  for (const field of ['queued', 'running', 'completed', 'cancelled']) {
    if (!Array.isArray(state[field])) {
      throw new TypeError(`state.${field} must be an array`);
    }
  }

  for (const job of state.queued) {
    assertPlainObject(job, 'queued job');
    assertNonEmptyString(job.id, 'queued job.id');
    assertNonNegativeInteger(job.age, 'queued job.age');
    assertNonNegativeInteger(job.remaining, 'queued job.remaining', { positive: true });
  }
  for (const job of state.running) {
    assertPlainObject(job, 'running job');
    assertNonEmptyString(job.id, 'running job.id');
    assertNonNegativeInteger(job.remaining, 'running job.remaining', { positive: true });
  }
  for (const field of ['completed', 'cancelled']) {
    for (const id of state[field]) {
      assertNonEmptyString(id, `state.${field} entry`);
    }
  }
}

function collectExistingIds(state) {
  return [
    ...state.queued.map(({ id }) => id),
    ...state.running.map(({ id }) => id),
    ...state.completed,
    ...state.cancelled,
  ];
}

function assertUniqueIds(ids) {
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new RangeError(`duplicate job ID: ${id}`);
    }
    seen.add(id);
  }
}

function assertQueueInput(input) {
  assertPlainObject(input, 'input');
  if (!Array.isArray(input.arrivals)) {
    throw new TypeError('input.arrivals must be an array');
  }
  if (!Array.isArray(input.cancelIds)) {
    throw new TypeError('input.cancelIds must be an array');
  }
  assertNonNegativeInteger(input.workerCount, 'input.workerCount');
  assertNonNegativeInteger(input.serviceCapacity, 'input.serviceCapacity');
  assertNonNegativeInteger(input.maxQueue, 'input.maxQueue');
  if (input.admissionPolicy !== 'reject-new') {
    throw new RangeError('input.admissionPolicy must be reject-new');
  }
  for (const arrival of input.arrivals) {
    assertPlainObject(arrival, 'arrival');
    assertNonEmptyString(arrival.id, 'arrival.id');
    assertNonNegativeInteger(arrival.duration, 'arrival.duration', { positive: true });
  }
  for (const id of input.cancelIds) {
    assertNonEmptyString(id, 'input.cancelIds entry');
  }
  assertUniqueIds(input.cancelIds);
}

export function stepQueue(state, input) {
  assertQueueState(state);
  assertQueueInput(input);
  assertUniqueIds([
    ...collectExistingIds(state),
    ...input.arrivals.map(({ id }) => id),
  ]);
  const nextState = clone(state);
  const activeIds = new Set([
    ...nextState.queued.map(({ id }) => id),
    ...nextState.running.map(({ id }) => id),
  ]);
  const cancelled = input.cancelIds.filter((id) => activeIds.has(id));
  const cancellationSet = new Set(cancelled);

  nextState.queued = nextState.queued.filter(({ id }) => !cancellationSet.has(id));
  nextState.running = nextState.running.filter(({ id }) => !cancellationSet.has(id));
  nextState.cancelled.push(...cancelled);

  const stillRunning = [];
  const completed = [];
  for (const job of nextState.running) {
    const remaining = job.remaining - input.serviceCapacity;
    if (remaining <= 0) {
      completed.push(job.id);
    } else {
      stillRunning.push({ id: job.id, remaining });
    }
  }
  nextState.running = stillRunning;
  nextState.completed.push(...completed);

  if (nextState.running.length > input.workerCount) {
    throw new RangeError('active running jobs exceed input.workerCount');
  }

  nextState.queued = nextState.queued.map((job) => ({
    ...job,
    age: job.age + 1,
  }));

  const started = [];
  while (nextState.running.length < input.workerCount && nextState.queued.length > 0) {
    const job = nextState.queued.shift();
    nextState.running.push({ id: job.id, remaining: job.remaining });
    started.push(job.id);
  }

  const admitted = [];
  const rejected = [];
  for (const arrival of input.arrivals) {
    if (nextState.running.length < input.workerCount) {
      nextState.running.push({ id: arrival.id, remaining: arrival.duration });
      admitted.push(arrival.id);
      started.push(arrival.id);
    } else if (nextState.queued.length < input.maxQueue) {
      nextState.queued.push({ id: arrival.id, age: 0, remaining: arrival.duration });
      admitted.push(arrival.id);
    } else {
      rejected.push(arrival.id);
    }
  }

  return {
    state: nextState,
    admitted,
    started,
    completed,
    rejected,
    cancelled,
    utilization: input.workerCount === 0
      ? 0
      : nextState.running.length / input.workerCount,
  };
}
