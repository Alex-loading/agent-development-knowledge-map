import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceJobDelivery,
  evaluateServiceAdmission,
  simulateStreamLifecycle,
} from '../src/core/backend-engineering.js';

function streamInput(overrides = {}) {
  return {
    responseMode: 'stream',
    deltaCount: 3,
    disconnectAfterDelta: null,
    cancelAfterDelta: null,
    upstreamCancellable: true,
    ...overrides,
  };
}

test('simulateStreamLifecycle emits one completed terminal after every stream delta', () => {
  const result = simulateStreamLifecycle(streamInput());

  assert.deepEqual(result.events, [
    { type: 'created', sequence: 0 },
    { type: 'delta', sequence: 1, delta: 1 },
    { type: 'delta', sequence: 2, delta: 2 },
    { type: 'delta', sequence: 3, delta: 3 },
    { type: 'completed', sequence: 4 },
  ]);
  assert.equal(result.clientStatus, 'completed');
  assert.equal(result.upstreamStatus, 'completed');
  assert.deepEqual(result.cleanupActions, [
    'close-response',
    'release-request-resources',
  ]);
  assert.equal(
    result.events.filter((event) => ['completed', 'disconnected', 'cancelled'].includes(event.type)).length,
    1,
  );
});

test('simulateStreamLifecycle models a synchronous response without exposing partial deltas', () => {
  const result = simulateStreamLifecycle(streamInput({
    responseMode: 'sync',
    deltaCount: 2,
  }));

  assert.deepEqual(result.events, [
    { type: 'created', sequence: 0 },
    { type: 'completed', sequence: 1 },
  ]);
  assert.equal(result.clientStatus, 'completed');
  assert.equal(result.upstreamStatus, 'completed');
});

test('simulateStreamLifecycle propagates a client disconnect when upstream cancellation is supported', () => {
  const result = simulateStreamLifecycle(streamInput({
    disconnectAfterDelta: 1,
  }));

  assert.deepEqual(result.events, [
    { type: 'created', sequence: 0 },
    { type: 'delta', sequence: 1, delta: 1 },
    { type: 'disconnected', sequence: 2 },
  ]);
  assert.equal(result.clientStatus, 'disconnected');
  assert.equal(result.upstreamStatus, 'cancelled');
  assert.deepEqual(result.cleanupActions, [
    'stop-client-writes',
    'request-upstream-cancel',
    'close-response',
    'release-request-resources',
  ]);
});

test('simulateStreamLifecycle keeps uncancellable upstream work explicit after disconnect', () => {
  const result = simulateStreamLifecycle(streamInput({
    disconnectAfterDelta: 0,
    upstreamCancellable: false,
  }));

  assert.deepEqual(result.events, [
    { type: 'created', sequence: 0 },
    { type: 'disconnected', sequence: 1 },
  ]);
  assert.equal(result.upstreamStatus, 'continuing');
  assert.deepEqual(result.cleanupActions, [
    'stop-client-writes',
    'observe-upstream-until-terminal',
    'close-response',
    'release-request-resources',
  ]);
});

test('simulateStreamLifecycle gives application cancellation tie priority and keeps one terminal', () => {
  const result = simulateStreamLifecycle(streamInput({
    disconnectAfterDelta: 2,
    cancelAfterDelta: 2,
  }));

  assert.deepEqual(result.events.at(-1), { type: 'cancelled', sequence: 3 });
  assert.equal(result.clientStatus, 'cancelled');
  assert.equal(result.upstreamStatus, 'cancelled');
  assert.equal(result.events.some((event) => event.type === 'disconnected'), false);
  assert.equal(
    result.events.filter((event) => ['completed', 'disconnected', 'cancelled'].includes(event.type)).length,
    1,
  );
});

test('simulateStreamLifecycle validates every boundary and leaves input untouched', () => {
  const input = streamInput();
  const snapshot = structuredClone(input);
  const result = simulateStreamLifecycle(input);

  assert.deepEqual(input, snapshot);
  assert.notEqual(result.events, input);

  assert.throws(() => simulateStreamLifecycle(null), /plain object/i);
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ responseMode: 'poll' })),
    /responseMode.*supported/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ deltaCount: 1.5 })),
    /deltaCount.*safe integer/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ deltaCount: Number.MAX_SAFE_INTEGER + 1 })),
    /deltaCount.*safe integer/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ disconnectAfterDelta: -1 })),
    /disconnectAfterDelta.*safe integer/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ disconnectAfterDelta: 4 })),
    /disconnectAfterDelta.*deltaCount/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ cancelAfterDelta: 4 })),
    /cancelAfterDelta.*deltaCount/i,
  );
  assert.throws(
    () => simulateStreamLifecycle(streamInput({ upstreamCancellable: 'yes' })),
    /upstreamCancellable.*boolean/i,
  );
});

function admissionInput(overrides = {}) {
  return {
    arrivalRatePerSecond: 8,
    meanServiceTimeMs: 250,
    concurrencySlots: 2,
    queueLimit: 4,
    deadlineMs: 1_000,
    ...overrides,
  };
}

test('evaluateServiceAdmission reports a fully utilized service without inventing queueing', () => {
  const result = evaluateServiceAdmission(admissionInput());

  assert.deepEqual(result, {
    capacityPerSecond: 8,
    offeredConcurrency: 2,
    offeredLoad: 1,
    utilization: 1,
    accepted: 8,
    immediate: 8,
    queued: 0,
    rejected: 0,
    timedOut: 0,
    estimatedMaxQueueWaitMs: 0,
    reasons: ['capacity-sufficient'],
    modelBoundary: 'deterministic one-second mean-capacity model; not a p95 or p99 prediction',
  });
});

test('evaluateServiceAdmission queues bounded excess load and rejects beyond the queue limit', () => {
  const result = evaluateServiceAdmission(admissionInput({
    arrivalRatePerSecond: 12,
    queueLimit: 3,
  }));

  assert.equal(result.capacityPerSecond, 8);
  assert.equal(result.offeredLoad, 1.5);
  assert.equal(result.utilization, 1);
  assert.equal(result.immediate, 8);
  assert.equal(result.queued, 3);
  assert.equal(result.accepted, 11);
  assert.equal(result.rejected, 1);
  assert.equal(result.timedOut, 0);
  assert.equal(result.estimatedMaxQueueWaitMs, 500);
  assert.deepEqual(result.reasons, ['queue-buffering', 'queue-limit-rejections']);
});

test('evaluateServiceAdmission counts queued requests whose modeled completion misses deadline', () => {
  const result = evaluateServiceAdmission(admissionInput({
    arrivalRatePerSecond: 12,
    deadlineMs: 600,
  }));

  assert.equal(result.queued, 4);
  assert.equal(result.rejected, 0);
  assert.equal(result.timedOut, 2);
  assert.deepEqual(result.reasons, ['queue-buffering', 'deadline-timeouts']);
});

test('evaluateServiceAdmission applies deadline to immediate service as well as queue wait', () => {
  const result = evaluateServiceAdmission(admissionInput({
    arrivalRatePerSecond: 3,
    deadlineMs: 200,
  }));

  assert.equal(result.immediate, 3);
  assert.equal(result.queued, 0);
  assert.equal(result.timedOut, 3);
  assert.deepEqual(result.reasons, ['deadline-timeouts']);
});

test('evaluateServiceAdmission treats zero arrivals and a zero queue as valid boundaries', () => {
  const idle = evaluateServiceAdmission(admissionInput({
    arrivalRatePerSecond: 0,
    queueLimit: 0,
  }));
  assert.equal(idle.utilization, 0);
  assert.equal(idle.accepted, 0);
  assert.equal(idle.queued, 0);
  assert.equal(idle.rejected, 0);
  assert.deepEqual(idle.reasons, ['capacity-sufficient']);

  const reject = evaluateServiceAdmission(admissionInput({
    arrivalRatePerSecond: 9,
    queueLimit: 0,
  }));
  assert.equal(reject.accepted, 8);
  assert.equal(reject.rejected, 1);
  assert.deepEqual(reject.reasons, ['queue-limit-rejections']);
});

test('evaluateServiceAdmission validates safe integer ranges and leaves input untouched', () => {
  const input = admissionInput();
  const snapshot = structuredClone(input);
  evaluateServiceAdmission(input);
  assert.deepEqual(input, snapshot);

  assert.throws(() => evaluateServiceAdmission([]), /plain object/i);
  for (const field of [
    'arrivalRatePerSecond',
    'meanServiceTimeMs',
    'concurrencySlots',
    'queueLimit',
    'deadlineMs',
  ]) {
    assert.throws(
      () => evaluateServiceAdmission(admissionInput({ [field]: 1.25 })),
      new RegExp(`${field}.*safe integer`, 'i'),
    );
    assert.throws(
      () => evaluateServiceAdmission(admissionInput({
        [field]: Number.MAX_SAFE_INTEGER + 1,
      })),
      new RegExp(`${field}.*safe integer`, 'i'),
    );
  }

  assert.throws(
    () => evaluateServiceAdmission(admissionInput({ arrivalRatePerSecond: -1 })),
    /arrivalRatePerSecond.*safe integer/i,
  );
  assert.throws(
    () => evaluateServiceAdmission(admissionInput({ queueLimit: -1 })),
    /queueLimit.*safe integer/i,
  );
  for (const field of ['meanServiceTimeMs', 'concurrencySlots', 'deadlineMs']) {
    assert.throws(
      () => evaluateServiceAdmission(admissionInput({ [field]: 0 })),
      new RegExp(`${field}.*safe integer`, 'i'),
    );
  }
  assert.throws(
    () => evaluateServiceAdmission(admissionInput({
      concurrencySlots: Number.MAX_SAFE_INTEGER,
    })),
    /capacity.*numeric range/i,
  );
  assert.throws(
    () => evaluateServiceAdmission(admissionInput({
      arrivalRatePerSecond: Number.MAX_SAFE_INTEGER,
      meanServiceTimeMs: 2,
    })),
    /offered concurrency.*numeric range/i,
  );
});

function deliveryState(overrides = {}) {
  return {
    status: 'empty',
    jobId: null,
    idempotencyKey: null,
    deliveryAttempt: 0,
    leaseOwner: null,
    resultRef: null,
    idempotencyRecord: null,
    processedEventIds: [],
    ledger: [],
    reconciliationItems: [],
    ...overrides,
  };
}

function advance(state, type, sequence, extra = {}) {
  return advanceJobDelivery(state, {
    eventId: `${type}-${sequence}`,
    type,
    ...extra,
  });
}

test('advanceJobDelivery applies the complete successful delivery lifecycle', () => {
  let result = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'report:customer-1',
  });
  assert.equal(result.decision, 'applied');
  assert.equal(result.state.status, 'submitted');
  assert.deepEqual(result.state.idempotencyRecord, {
    key: 'report:customer-1',
    jobId: 'job-1',
    status: 'pending',
    resultRef: null,
  });

  result = advance(result.state, 'enqueue', 2);
  assert.equal(result.state.status, 'queued');

  result = advance(result.state, 'lease', 3, { workerId: 'worker-a' });
  assert.equal(result.state.status, 'leased');
  assert.equal(result.state.deliveryAttempt, 1);
  assert.equal(result.state.leaseOwner, 'worker-a');

  result = advance(result.state, 'start', 4);
  assert.equal(result.state.status, 'running');

  result = advance(result.state, 'commit', 5, { resultRef: 'result-1' });
  assert.equal(result.state.status, 'committed');
  assert.equal(result.state.resultRef, 'result-1');
  assert.equal(result.state.idempotencyRecord.status, 'committed');

  result = advance(result.state, 'ack', 6);
  assert.equal(result.state.status, 'acknowledged');
  assert.equal(result.state.idempotencyRecord.status, 'acknowledged');
  assert.deepEqual(result.state.ledger.map((entry) => entry.type), [
    'submit', 'enqueue', 'lease', 'start', 'commit', 'ack',
  ]);
  assert.deepEqual(result.state.processedEventIds, [
    'submit-1', 'enqueue-2', 'lease-3', 'start-4', 'commit-5', 'ack-6',
  ]);
});

test('advanceJobDelivery redelivers a pre-commit crash with a new delivery attempt', () => {
  let state = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'report:customer-1',
  }).state;
  state = advance(state, 'enqueue', 2).state;
  state = advance(state, 'lease', 3, { workerId: 'worker-a' }).state;
  state = advance(state, 'start', 4).state;

  const crashed = advance(state, 'crash', 5);
  assert.equal(crashed.state.status, 'queued');
  assert.equal(crashed.state.leaseOwner, null);
  assert.equal(crashed.state.idempotencyRecord.status, 'pending');

  const redelivered = advance(crashed.state, 'redeliver', 6, {
    workerId: 'worker-b',
  });
  assert.equal(redelivered.decision, 'applied');
  assert.equal(redelivered.state.status, 'leased');
  assert.equal(redelivered.state.deliveryAttempt, 2);
  assert.equal(redelivered.state.leaseOwner, 'worker-b');
});

test('advanceJobDelivery reconciles commit-before-ack uncertainty before redelivery', () => {
  let state = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'report:customer-1',
  }).state;
  state = advance(state, 'enqueue', 2).state;
  state = advance(state, 'lease', 3, { workerId: 'worker-a' }).state;
  state = advance(state, 'start', 4).state;
  state = advance(state, 'commit', 5, { resultRef: 'result-1' }).state;

  const crashed = advance(state, 'crash', 6);
  assert.equal(crashed.state.status, 'unknown');
  assert.equal(crashed.state.idempotencyRecord.status, 'unknown');
  assert.deepEqual(crashed.state.reconciliationItems, ['confirm-result-commit']);

  const held = advance(crashed.state, 'redeliver', 7, { workerId: 'worker-b' });
  assert.equal(held.decision, 'reconcile-required');
  assert.equal(held.state.status, 'unknown');
  assert.equal(held.state.deliveryAttempt, 1);
  assert.equal(held.state.leaseOwner, null);

  const reconciled = advance(held.state, 'reconcile', 8, { outcome: 'committed' });
  assert.equal(reconciled.state.status, 'committed');
  assert.equal(reconciled.state.idempotencyRecord.status, 'committed');
  assert.deepEqual(reconciled.state.reconciliationItems, []);

  const acknowledged = advance(reconciled.state, 'ack', 9);
  assert.equal(acknowledged.state.status, 'acknowledged');
});

test('advanceJobDelivery deduplicates a repeated submit while preserving the first key', () => {
  const submitted = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'stable-key',
  }).state;
  const duplicateSubmit = advance(submitted, 'submit', 2, {
    jobId: 'job-1',
    idempotencyKey: 'stable-key',
  });

  assert.equal(duplicateSubmit.decision, 'deduplicated');
  assert.equal(duplicateSubmit.state.idempotencyKey, 'stable-key');
  assert.equal(duplicateSubmit.state.status, 'submitted');

  const conflict = advance(duplicateSubmit.state, 'submit', 3, {
    jobId: 'job-1',
    idempotencyKey: 'changed-key',
  });
  assert.equal(conflict.decision, 'rejected');
  assert.match(conflict.reason, /idempotency|key|幂等/i);
  assert.deepEqual(conflict.state, duplicateSubmit.state);
});

test('advanceJobDelivery makes duplicate event IDs explicit immutable no-ops', () => {
  const state = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'stable-key',
  }).state;
  const duplicate = advanceJobDelivery(state, {
    eventId: 'submit-1',
    type: 'enqueue',
  });

  assert.equal(duplicate.decision, 'duplicate');
  assert.deepEqual(duplicate.state, state);
  assert.notEqual(duplicate.state, state);
  assert.notEqual(duplicate.state.ledger, state.ledger);
});

test('advanceJobDelivery models queued cancellation and running cancellation uncertainty', () => {
  let queued = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-1',
    idempotencyKey: 'stable-key',
  }).state;
  queued = advance(queued, 'enqueue', 2).state;
  const cancelled = advance(queued, 'cancel', 3);
  assert.equal(cancelled.state.status, 'cancelled');
  assert.equal(cancelled.state.idempotencyRecord.status, 'cancelled');

  let running = advance(deliveryState(), 'submit', 1, {
    jobId: 'job-2',
    idempotencyKey: 'stable-key-2',
  }).state;
  running = advance(running, 'enqueue', 2).state;
  running = advance(running, 'lease', 3, { workerId: 'worker-a' }).state;
  running = advance(running, 'start', 4).state;
  const uncertain = advance(running, 'cancel', 5);
  assert.equal(uncertain.decision, 'reconcile-required');
  assert.equal(uncertain.state.status, 'unknown');
  assert.deepEqual(uncertain.state.reconciliationItems, ['confirm-cancellation-outcome']);

  const notCommitted = advance(uncertain.state, 'reconcile', 6, {
    outcome: 'not-committed',
  });
  assert.equal(notCommitted.state.status, 'queued');
  assert.equal(notCommitted.state.idempotencyRecord.status, 'pending');
});

test('advanceJobDelivery rejects unknown and illegal transitions without consuming events', () => {
  const state = deliveryState();
  for (const event of [
    { eventId: 'unknown-1', type: 'invented' },
    { eventId: 'ack-1', type: 'ack' },
  ]) {
    const result = advanceJobDelivery(state, event);
    assert.equal(result.decision, 'rejected');
    assert.match(result.reason, /unknown|illegal|transition|未知|非法/i);
    assert.deepEqual(result.state, state);
  }
});

test('advanceJobDelivery validates nested state and event fields without mutation', () => {
  const state = deliveryState();
  const event = {
    eventId: 'submit-1',
    type: 'submit',
    jobId: 'job-1',
    idempotencyKey: 'stable-key',
  };
  const snapshot = structuredClone({ state, event });
  const result = advanceJobDelivery(state, event);
  assert.deepEqual({ state, event }, snapshot);
  assert.notEqual(result.state, state);

  assert.throws(() => advanceJobDelivery(null, event), /state.*plain object/i);
  assert.throws(
    () => advanceJobDelivery(deliveryState({ status: 'lost' }), event),
    /state.status.*supported/i,
  );
  assert.throws(
    () => advanceJobDelivery(deliveryState({ deliveryAttempt: 1.5 }), event),
    /deliveryAttempt.*safe integer/i,
  );
  assert.throws(
    () => advanceJobDelivery(deliveryState({
      processedEventIds: ['same', 'same'],
    }), event),
    /duplicate processed event/i,
  );
  assert.throws(
    () => advanceJobDelivery(deliveryState({
      status: 'submitted',
      jobId: 'job-1',
      idempotencyKey: 'key-1',
      idempotencyRecord: {
        key: 'different-key',
        jobId: 'job-1',
        status: 'pending',
        resultRef: null,
      },
    }), { eventId: 'enqueue-1', type: 'enqueue' }),
    /idempotency record.*match/i,
  );
  assert.throws(() => advanceJobDelivery(state, null), /event.*plain object/i);
  assert.throws(
    () => advanceJobDelivery(state, { eventId: '', type: 'submit' }),
    /event.eventId.*empty/i,
  );
  assert.throws(
    () => advanceJobDelivery(state, {
      eventId: 'submit-2',
      type: 'submit',
      jobId: '',
      idempotencyKey: 'key',
    }),
    /event.jobId.*empty/i,
  );

  const queued = deliveryState({
    status: 'queued',
    jobId: 'job-1',
    idempotencyKey: 'key-1',
    idempotencyRecord: {
      key: 'key-1',
      jobId: 'job-1',
      status: 'pending',
      resultRef: null,
    },
  });
  assert.throws(
    () => advanceJobDelivery(queued, {
      eventId: 'lease-1',
      type: 'lease',
      workerId: '',
    }),
    /event.workerId.*empty/i,
  );
  assert.throws(
    () => advanceJobDelivery(deliveryState({
      status: 'unknown',
      jobId: 'job-1',
      idempotencyKey: 'key-1',
      idempotencyRecord: {
        key: 'key-1',
        jobId: 'job-1',
        status: 'unknown',
        resultRef: null,
      },
      reconciliationItems: ['confirm-cancellation-outcome'],
    }), {
      eventId: 'reconcile-1',
      type: 'reconcile',
      outcome: 'maybe',
    }),
    /event.outcome.*supported/i,
  );
});
