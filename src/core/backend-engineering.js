const RESPONSE_MODES = new Set(['sync', 'stream']);
const MAX_SIMULATION_DELTAS = 10_000;

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

function assertEnum(value, allowed, name) {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
  if (!allowed.has(value)) {
    throw new RangeError(`${name} is not supported`);
  }
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') {
    throw new TypeError(`${name} must be a boolean`);
  }
}

function assertSafeInteger(value, name, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a safe integer between ${minimum} and ${maximum}`);
  }
}

function assertNullableDelta(value, name, deltaCount) {
  if (value === null) return;
  assertSafeInteger(value, name);
  if (value > deltaCount) {
    throw new RangeError(`${name} must not exceed deltaCount`);
  }
}

function streamTerminal(type, upstreamCancellable) {
  if (type === 'completed') {
    return {
      clientStatus: 'completed',
      upstreamStatus: 'completed',
      cleanupActions: ['close-response', 'release-request-resources'],
    };
  }

  if (type === 'cancelled') {
    return {
      clientStatus: 'cancelled',
      upstreamStatus: upstreamCancellable ? 'cancelled' : 'continuing',
      cleanupActions: [
        upstreamCancellable ? 'request-upstream-cancel' : 'observe-upstream-until-terminal',
        'close-response',
        'release-request-resources',
      ],
    };
  }

  return {
    clientStatus: 'disconnected',
    upstreamStatus: upstreamCancellable ? 'cancelled' : 'continuing',
    cleanupActions: [
      'stop-client-writes',
      upstreamCancellable ? 'request-upstream-cancel' : 'observe-upstream-until-terminal',
      'close-response',
      'release-request-resources',
    ],
  };
}

export function simulateStreamLifecycle(input) {
  assertPlainObject(input, 'input');
  assertEnum(input.responseMode, RESPONSE_MODES, 'input.responseMode');
  assertSafeInteger(input.deltaCount, 'input.deltaCount', {
    maximum: MAX_SIMULATION_DELTAS,
  });
  assertNullableDelta(
    input.disconnectAfterDelta,
    'input.disconnectAfterDelta',
    input.deltaCount,
  );
  assertNullableDelta(input.cancelAfterDelta, 'input.cancelAfterDelta', input.deltaCount);
  assertBoolean(input.upstreamCancellable, 'input.upstreamCancellable');

  const events = [{ type: 'created', sequence: 0 }];
  let terminalType = null;

  for (let delta = 0; delta <= input.deltaCount; delta += 1) {
    if (delta > 0 && input.responseMode === 'stream') {
      events.push({ type: 'delta', sequence: events.length, delta });
    }

    if (input.cancelAfterDelta === delta) {
      terminalType = 'cancelled';
      break;
    }
    if (input.disconnectAfterDelta === delta) {
      terminalType = 'disconnected';
      break;
    }
  }

  terminalType ??= 'completed';
  events.push({ type: terminalType, sequence: events.length });

  return {
    events,
    ...streamTerminal(terminalType, input.upstreamCancellable),
  };
}

function assertSafeProduct(left, right, name) {
  const product = left * right;
  if (!Number.isSafeInteger(product)) {
    throw new RangeError(`${name} exceeds the safe numeric range`);
  }
  return product;
}

export function evaluateServiceAdmission(input) {
  assertPlainObject(input, 'input');
  assertSafeInteger(input.arrivalRatePerSecond, 'input.arrivalRatePerSecond');
  assertSafeInteger(input.meanServiceTimeMs, 'input.meanServiceTimeMs', { minimum: 1 });
  assertSafeInteger(input.concurrencySlots, 'input.concurrencySlots', { minimum: 1 });
  assertSafeInteger(input.queueLimit, 'input.queueLimit');
  assertSafeInteger(input.deadlineMs, 'input.deadlineMs', { minimum: 1 });

  const capacityNumerator = assertSafeProduct(
    input.concurrencySlots,
    1_000,
    'service capacity',
  );
  const offeredConcurrencyNumerator = assertSafeProduct(
    input.arrivalRatePerSecond,
    input.meanServiceTimeMs,
    'offered concurrency',
  );
  const capacityPerSecond = capacityNumerator / input.meanServiceTimeMs;
  const offeredConcurrency = offeredConcurrencyNumerator / 1_000;
  const offeredLoad = offeredConcurrency / input.concurrencySlots;
  const immediate = Math.min(input.arrivalRatePerSecond, Math.floor(capacityPerSecond));
  const excess = input.arrivalRatePerSecond - immediate;
  const queued = Math.min(excess, input.queueLimit);
  const rejected = excess - queued;
  const accepted = immediate + queued;

  const onTimeQueueWaves = Math.max(
    0,
    Math.floor(input.deadlineMs / input.meanServiceTimeMs) - 1,
  );
  const requiredQueueWaves = Math.ceil(queued / input.concurrencySlots);
  const onTimeQueued = onTimeQueueWaves >= requiredQueueWaves
    ? queued
    : onTimeQueueWaves * input.concurrencySlots;
  const timedOut = (input.meanServiceTimeMs > input.deadlineMs ? immediate : 0)
    + queued
    - onTimeQueued;

  const estimatedMaxQueueWaitMs = queued === 0
    ? 0
    : Math.ceil(queued / input.concurrencySlots) * input.meanServiceTimeMs;
  const reasons = [];
  if (queued > 0) reasons.push('queue-buffering');
  if (rejected > 0) reasons.push('queue-limit-rejections');
  if (timedOut > 0) reasons.push('deadline-timeouts');
  if (reasons.length === 0) reasons.push('capacity-sufficient');

  return {
    capacityPerSecond,
    offeredConcurrency,
    offeredLoad,
    utilization: Math.min(offeredLoad, 1),
    accepted,
    immediate,
    queued,
    rejected,
    timedOut,
    estimatedMaxQueueWaitMs,
    reasons,
    modelBoundary: 'deterministic one-second mean-capacity model; not a p95 or p99 prediction',
  };
}

const DELIVERY_STATUSES = new Set([
  'empty',
  'submitted',
  'queued',
  'leased',
  'running',
  'committed',
  'acknowledged',
  'cancelled',
  'unknown',
]);
const IDEMPOTENCY_STATUSES = new Set([
  'pending',
  'committed',
  'acknowledged',
  'cancelled',
  'unknown',
]);
const DELIVERY_EVENT_TYPES = new Set([
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
const RECONCILIATION_OUTCOMES = new Set(['committed', 'not-committed']);

function assertNonEmptyString(value, name, { nullable = false } = {}) {
  if (nullable && value === null) return;
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new RangeError(`${name} must not be empty`);
  }
}

function assertUniqueStringArray(value, name, duplicateMessage) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array`);
  }

  const seen = new Set();
  for (const [index, item] of value.entries()) {
    assertNonEmptyString(item, `${name}[${index}]`);
    if (seen.has(item)) {
      throw new RangeError(duplicateMessage);
    }
    seen.add(item);
  }
}

function assertIdempotencyRecord(state) {
  if (state.status === 'empty') {
    if (state.idempotencyRecord !== null) {
      throw new RangeError('state.idempotencyRecord must be null for empty state');
    }
    return;
  }

  assertPlainObject(state.idempotencyRecord, 'state.idempotencyRecord');
  assertNonEmptyString(state.idempotencyRecord.key, 'state.idempotencyRecord.key');
  assertNonEmptyString(state.idempotencyRecord.jobId, 'state.idempotencyRecord.jobId');
  assertEnum(
    state.idempotencyRecord.status,
    IDEMPOTENCY_STATUSES,
    'state.idempotencyRecord.status',
  );
  assertNonEmptyString(
    state.idempotencyRecord.resultRef,
    'state.idempotencyRecord.resultRef',
    { nullable: true },
  );

  if (
    state.idempotencyRecord.key !== state.idempotencyKey
    || state.idempotencyRecord.jobId !== state.jobId
    || state.idempotencyRecord.resultRef !== state.resultRef
  ) {
    throw new RangeError('state idempotency record fields must match the delivery state');
  }

  const expectedRecordStatus = {
    submitted: 'pending',
    queued: 'pending',
    leased: 'pending',
    running: 'pending',
    committed: 'committed',
    acknowledged: 'acknowledged',
    cancelled: 'cancelled',
    unknown: 'unknown',
  }[state.status];
  if (state.idempotencyRecord.status !== expectedRecordStatus) {
    throw new RangeError('state idempotency record status must match the delivery state');
  }
}

function assertDeliveryLedger(state) {
  if (!Array.isArray(state.ledger)) {
    throw new TypeError('state.ledger must be an array');
  }
  if (state.ledger.length !== state.processedEventIds.length) {
    throw new RangeError('state.ledger must match state.processedEventIds');
  }

  for (const [index, entry] of state.ledger.entries()) {
    assertPlainObject(entry, `state.ledger[${index}]`);
    assertNonEmptyString(entry.eventId, `state.ledger[${index}].eventId`);
    assertEnum(entry.type, DELIVERY_EVENT_TYPES, `state.ledger[${index}].type`);
    assertEnum(entry.from, DELIVERY_STATUSES, `state.ledger[${index}].from`);
    assertEnum(entry.to, DELIVERY_STATUSES, `state.ledger[${index}].to`);
    assertNonEmptyString(entry.decision, `state.ledger[${index}].decision`);
    if (entry.eventId !== state.processedEventIds[index]) {
      throw new RangeError('state.ledger event IDs must match state.processedEventIds');
    }
  }
}

function assertDeliveryState(state) {
  assertPlainObject(state, 'state');
  assertEnum(state.status, DELIVERY_STATUSES, 'state.status');
  assertNonEmptyString(state.jobId, 'state.jobId', { nullable: true });
  assertNonEmptyString(state.idempotencyKey, 'state.idempotencyKey', { nullable: true });
  assertSafeInteger(state.deliveryAttempt, 'state.deliveryAttempt');
  assertNonEmptyString(state.leaseOwner, 'state.leaseOwner', { nullable: true });
  assertNonEmptyString(state.resultRef, 'state.resultRef', { nullable: true });
  assertUniqueStringArray(
    state.processedEventIds,
    'state.processedEventIds',
    'state has duplicate processed event IDs',
  );
  assertUniqueStringArray(
    state.reconciliationItems,
    'state.reconciliationItems',
    'state has duplicate reconciliation items',
  );
  assertDeliveryLedger(state);

  if (state.status === 'empty') {
    if (
      state.jobId !== null
      || state.idempotencyKey !== null
      || state.deliveryAttempt !== 0
      || state.leaseOwner !== null
      || state.resultRef !== null
      || state.reconciliationItems.length !== 0
    ) {
      throw new RangeError('empty delivery state must not contain job data');
    }
  } else {
    assertNonEmptyString(state.jobId, 'state.jobId');
    assertNonEmptyString(state.idempotencyKey, 'state.idempotencyKey');
  }

  if (new Set(['leased', 'running']).has(state.status)) {
    if (state.leaseOwner === null) {
      throw new RangeError(`${state.status} delivery state must have a lease owner`);
    }
  } else if (state.leaseOwner !== null) {
    throw new RangeError(`${state.status} delivery state must not have a lease owner`);
  }

  if (new Set(['committed', 'acknowledged']).has(state.status)) {
    if (state.resultRef === null) {
      throw new RangeError(`${state.status} delivery state must have a result reference`);
    }
  } else if (state.status !== 'unknown' && state.resultRef !== null) {
    throw new RangeError(`${state.status} delivery state must not have a result reference`);
  }

  if (state.status === 'unknown') {
    if (state.reconciliationItems.length === 0) {
      throw new RangeError('unknown delivery state must have reconciliation items');
    }
  } else if (state.reconciliationItems.length !== 0) {
    throw new RangeError(`${state.status} delivery state must not have reconciliation items`);
  }

  assertIdempotencyRecord(state);
}

function deliveryResult(state, decision, reason = null) {
  return {
    state: structuredClone(state),
    decision,
    reason,
  };
}

function recordDeliveryEvent(previous, next, event, decision = 'applied', reason = null) {
  next.processedEventIds.push(event.eventId);
  next.ledger.push({
    eventId: event.eventId,
    type: event.type,
    from: previous.status,
    to: next.status,
    decision,
  });
  return deliveryResult(next, decision, reason);
}

function setRecordStatus(state, status) {
  state.idempotencyRecord.status = status;
  state.idempotencyRecord.resultRef = state.resultRef;
}

function rejectTransition(state, event) {
  return deliveryResult(
    state,
    'rejected',
    DELIVERY_EVENT_TYPES.has(event.type)
      ? `illegal ${event.type} transition from ${state.status}`
      : `unknown delivery event type: ${event.type}`,
  );
}

export function advanceJobDelivery(state, event) {
  assertDeliveryState(state);
  assertPlainObject(event, 'event');
  assertNonEmptyString(event.eventId, 'event.eventId');
  assertNonEmptyString(event.type, 'event.type');

  if (state.processedEventIds.includes(event.eventId)) {
    return deliveryResult(state, 'duplicate', 'event was already processed');
  }
  if (!DELIVERY_EVENT_TYPES.has(event.type)) {
    return rejectTransition(state, event);
  }

  const next = structuredClone(state);

  if (event.type === 'submit') {
    assertNonEmptyString(event.jobId, 'event.jobId');
    assertNonEmptyString(event.idempotencyKey, 'event.idempotencyKey');
    if (state.status === 'empty') {
      next.status = 'submitted';
      next.jobId = event.jobId;
      next.idempotencyKey = event.idempotencyKey;
      next.idempotencyRecord = {
        key: event.idempotencyKey,
        jobId: event.jobId,
        status: 'pending',
        resultRef: null,
      };
      return recordDeliveryEvent(state, next, event);
    }
    if (state.jobId === event.jobId && state.idempotencyKey === event.idempotencyKey) {
      return recordDeliveryEvent(
        state,
        next,
        event,
        'deduplicated',
        'idempotency key already identifies this job',
      );
    }
    return deliveryResult(
      state,
      'rejected',
      'idempotency key conflicts with the existing job',
    );
  }

  if (event.type === 'enqueue' && state.status === 'submitted') {
    next.status = 'queued';
    return recordDeliveryEvent(state, next, event);
  }

  if (
    (event.type === 'lease' && state.status === 'queued')
    || (event.type === 'redeliver' && state.status === 'queued')
  ) {
    assertNonEmptyString(event.workerId, 'event.workerId');
    if (next.deliveryAttempt === Number.MAX_SAFE_INTEGER) {
      throw new RangeError('state.deliveryAttempt cannot be safely incremented');
    }
    next.status = 'leased';
    next.deliveryAttempt += 1;
    next.leaseOwner = event.workerId;
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'start' && state.status === 'leased') {
    next.status = 'running';
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'commit' && state.status === 'running') {
    assertNonEmptyString(event.resultRef, 'event.resultRef');
    next.status = 'committed';
    next.leaseOwner = null;
    next.resultRef = event.resultRef;
    setRecordStatus(next, 'committed');
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'ack' && state.status === 'committed') {
    next.status = 'acknowledged';
    setRecordStatus(next, 'acknowledged');
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'crash' && new Set(['leased', 'running']).has(state.status)) {
    next.status = 'queued';
    next.leaseOwner = null;
    setRecordStatus(next, 'pending');
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'crash' && state.status === 'committed') {
    next.status = 'unknown';
    setRecordStatus(next, 'unknown');
    next.reconciliationItems = ['confirm-result-commit'];
    return recordDeliveryEvent(state, next, event, 'reconcile-required');
  }

  if (event.type === 'redeliver' && state.status === 'unknown') {
    assertNonEmptyString(event.workerId, 'event.workerId');
    return recordDeliveryEvent(
      state,
      next,
      event,
      'reconcile-required',
      'delivery outcome must be reconciled before redelivery',
    );
  }

  if (
    event.type === 'cancel'
    && new Set(['submitted', 'queued', 'leased']).has(state.status)
  ) {
    next.status = 'cancelled';
    next.leaseOwner = null;
    setRecordStatus(next, 'cancelled');
    return recordDeliveryEvent(state, next, event);
  }

  if (event.type === 'cancel' && state.status === 'running') {
    next.status = 'unknown';
    next.leaseOwner = null;
    setRecordStatus(next, 'unknown');
    next.reconciliationItems = ['confirm-cancellation-outcome'];
    return recordDeliveryEvent(state, next, event, 'reconcile-required');
  }

  if (event.type === 'reconcile' && state.status === 'unknown') {
    assertEnum(event.outcome, RECONCILIATION_OUTCOMES, 'event.outcome');
    next.reconciliationItems = [];
    if (event.outcome === 'committed') {
      if (next.resultRef === null) {
        assertNonEmptyString(event.resultRef, 'event.resultRef');
        next.resultRef = event.resultRef;
      }
      next.status = 'committed';
      setRecordStatus(next, 'committed');
    } else {
      next.status = 'queued';
      next.resultRef = null;
      setRecordStatus(next, 'pending');
    }
    return recordDeliveryEvent(state, next, event);
  }

  return rejectTransition(state, event);
}
