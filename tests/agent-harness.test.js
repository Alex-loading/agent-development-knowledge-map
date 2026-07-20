import test from 'node:test';
import assert from 'node:assert/strict';

import {
  planResume,
  reduceRun,
  stepQueue,
} from '../src/core/agent-harness.js';

function runState(overrides = {}) {
  return {
    status: 'created',
    sequence: 0,
    processedEventIds: [],
    stepsUsed: 0,
    pendingApproval: null,
    ...overrides,
  };
}

function apply(state, type, sequence, extra = {}, policy = { maxSteps: 3 }) {
  return reduceRun(state, {
    eventId: `event-${sequence}`,
    sequence,
    type,
    ...extra,
  }, policy);
}

test('reduceRun applies every main run-state transition', () => {
  let state = apply(runState(), 'enqueue', 1).state;
  assert.equal(state.status, 'queued');

  state = apply(state, 'start', 2).state;
  assert.equal(state.status, 'running');

  state = apply(state, 'request-approval', 3, { payload: { callId: 'call-1' } }).state;
  assert.equal(state.status, 'awaiting_approval');
  assert.equal(state.pendingApproval, 'call-1');

  state = apply(state, 'approve', 4).state;
  assert.equal(state.status, 'running');
  assert.equal(state.pendingApproval, null);

  state = apply(state, 'schedule-retry', 5).state;
  assert.equal(state.status, 'retry_wait');

  state = apply(state, 'retry', 6).state;
  assert.equal(state.status, 'running');

  state = apply(state, 'block', 7).state;
  assert.equal(state.status, 'blocked');

  state = apply(state, 'resume', 8).state;
  assert.equal(state.status, 'running');

  const result = apply(state, 'complete', 9);
  assert.equal(result.state.status, 'succeeded');
  assert.equal(result.state.sequence, 9);
  assert.deepEqual(result.state.processedEventIds, [
    'event-1', 'event-2', 'event-3', 'event-4', 'event-5',
    'event-6', 'event-7', 'event-8', 'event-9',
  ]);
  assert.deepEqual(result.emittedEffects, []);
  assert.equal(result.rejected, false);
  assert.equal(typeof result.reason, 'string');
});

test('reduceRun permits fail, cancel, and timeout from any non-terminal status', () => {
  for (const type of ['fail', 'cancel', 'timeout']) {
    for (const status of [
      'created', 'queued', 'running', 'awaiting_approval', 'retry_wait', 'blocked',
    ]) {
      const result = reduceRun(runState({ status }), {
        eventId: `${type}-${status}`,
        sequence: 1,
        type,
      }, { maxSteps: 2 });

      assert.equal(result.rejected, false);
      assert.equal(result.state.status, {
        fail: 'failed',
        cancel: 'cancelled',
        timeout: 'timed_out',
      }[type]);
    }
  }
});

test('reduceRun rejects illegal and unknown transitions with a defensive state copy', () => {
  const state = runState({ processedEventIds: ['old'] });

  for (const type of ['complete', 'invented-event']) {
    const result = reduceRun(state, {
      eventId: type,
      sequence: 1,
      type,
    }, { maxSteps: 2 });

    assert.equal(result.rejected, true);
    assert.match(result.reason, type === 'complete' ? /transition|转换/i : /unknown|未知/i);
    assert.deepEqual(result.state, state);
    assert.notEqual(result.state, state);
    assert.notEqual(result.state.processedEventIds, state.processedEventIds);
    assert.deepEqual(result.emittedEffects, []);
  }
});

test('reduceRun makes duplicate delivery an explicit no-op before sequence checking', () => {
  const state = runState({
    status: 'queued',
    sequence: 1,
    processedEventIds: ['same-event'],
  });

  const result = reduceRun(state, {
    eventId: 'same-event',
    sequence: 1,
    type: 'enqueue',
  }, { maxSteps: 2 });

  assert.equal(result.rejected, true);
  assert.match(result.reason, /duplicate|重复/i);
  assert.deepEqual(result.state, state);
  assert.notEqual(result.state, state);
  assert.notEqual(result.state.processedEventIds, state.processedEventIds);
});

test('reduceRun rejects out-of-order events without consuming them', () => {
  const state = runState({ sequence: 4 });
  const result = reduceRun(state, {
    eventId: 'event-6',
    sequence: 6,
    type: 'enqueue',
  }, { maxSteps: 2 });

  assert.equal(result.rejected, true);
  assert.match(result.reason, /sequence|序列/i);
  assert.deepEqual(result.state, state);
});

test('reduceRun keeps terminal states irreversible', () => {
  for (const status of ['succeeded', 'failed', 'cancelled', 'timed_out']) {
    for (const type of ['fail', 'cancel', 'timeout', 'start']) {
      const result = reduceRun(runState({ status }), {
        eventId: `${status}-${type}`,
        sequence: 1,
        type,
      }, { maxSteps: 2 });
      assert.equal(result.rejected, true);
      assert.match(result.reason, /terminal|终态/i);
      assert.equal(result.state.status, status);
    }
  }
});

test('reduceRun counts steps and fails exactly at the step budget', () => {
  const first = reduceRun(runState({ status: 'running' }), {
    eventId: 'step-1',
    sequence: 1,
    type: 'step',
  }, { maxSteps: 2 });
  assert.equal(first.state.status, 'running');
  assert.equal(first.state.stepsUsed, 1);

  const second = reduceRun(first.state, {
    eventId: 'step-2',
    sequence: 2,
    type: 'step',
  }, { maxSteps: 2 });
  assert.equal(second.rejected, false);
  assert.equal(second.state.status, 'failed');
  assert.equal(second.state.stepsUsed, 2);
  assert.match(second.reason, /step|步骤|budget|预算/i);
});

test('reduceRun does not mutate state, event, or policy', () => {
  const state = runState({ status: 'running', metadata: { owner: 'agent' } });
  const event = {
    eventId: 'approval-1',
    sequence: 1,
    type: 'request-approval',
    payload: { callId: 'call-1' },
  };
  const policy = { maxSteps: 2 };
  const snapshots = structuredClone({ state, event, policy });

  const result = reduceRun(state, event, policy);

  assert.deepEqual({ state, event, policy }, snapshots);
  assert.notEqual(result.state, state);
  assert.notEqual(result.state.processedEventIds, state.processedEventIds);
  assert.notEqual(result.state.metadata, state.metadata);
});

test('reduceRun validates objects, statuses, counts, IDs, sequence, and approval payload', () => {
  const event = { eventId: 'event-1', sequence: 1, type: 'enqueue' };
  const state = runState();

  assert.throws(() => reduceRun(null, event, { maxSteps: 1 }), TypeError);
  assert.throws(() => reduceRun(state, null, { maxSteps: 1 }), TypeError);
  assert.throws(() => reduceRun(state, event, null), TypeError);
  assert.throws(() => reduceRun({ ...state, status: 'mystery' }, event, { maxSteps: 1 }), RangeError);
  assert.throws(() => reduceRun({ ...state, processedEventIds: {} }, event, { maxSteps: 1 }), TypeError);

  for (const [field, value] of [
    ['sequence', -1], ['sequence', 0.5], ['stepsUsed', -1], ['stepsUsed', 0.5],
  ]) {
    assert.throws(() => reduceRun({ ...state, [field]: value }, event, { maxSteps: 1 }), RangeError);
  }
  for (const maxSteps of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => reduceRun(state, event, { maxSteps }), RangeError);
  }
  for (const eventId of ['', '   ', null]) {
    assert.throws(() => reduceRun(state, { ...event, eventId }, { maxSteps: 1 }),
      eventId === null ? TypeError : RangeError);
  }
  for (const sequence of [0, -1, 1.5, Number.NaN]) {
    assert.throws(() => reduceRun(state, { ...event, sequence }, { maxSteps: 1 }), RangeError);
  }
  assert.throws(() => reduceRun(runState({ status: 'running' }), {
    eventId: 'approval', sequence: 1, type: 'request-approval', payload: {},
  }, { maxSteps: 1 }), TypeError);
});

function resumeInput(overrides = {}) {
  return {
    callKind: 'read',
    hasCompletionEvent: false,
    errorKind: 'transient',
    idempotencyKey: null,
    idempotencyRecord: 'none',
    remoteEvidence: 'none',
    attemptsUsed: 0,
    maxAttempts: 3,
    now: 1_000,
    baseDelayMs: 100,
    jitterFactor: 0.25,
    ...overrides,
  };
}

test('planResume skips completed or idempotently succeeded calls with highest priority', () => {
  for (const input of [
    resumeInput({ hasCompletionEvent: true, errorKind: 'permanent', remoteEvidence: 'failed' }),
    resumeInput({ idempotencyRecord: 'succeeded', errorKind: 'permanent' }),
  ]) {
    const result = planResume(input);
    assert.equal(result.decision, 'skip');
    assert.deepEqual(result.missingEvidence, []);
    assert.equal(result.nextAttemptAt, null);
  }
});

test('planResume reconciles remote success when the completion event is missing', () => {
  assert.deepEqual(planResume(resumeInput({ remoteEvidence: 'succeeded' })), {
    decision: 'reconcile',
    reason: '远端已有成功证据，但缺少完成事件',
    missingEvidence: ['completionEvent'],
    nextAttemptAt: null,
  });
});

test('planResume fails remote failures and permanent errors before retry logic', () => {
  for (const input of [
    resumeInput({ remoteEvidence: 'failed' }),
    resumeInput({ errorKind: 'permanent' }),
  ]) {
    const result = planResume(input);
    assert.equal(result.decision, 'fail');
    assert.equal(result.nextAttemptAt, null);
  }
});

test('planResume sends unknown writes without evidence to manual review', () => {
  const result = planResume(resumeInput({
    callKind: 'write',
    errorKind: 'unknown',
    idempotencyKey: 'stable-key',
  }));

  assert.equal(result.decision, 'manual');
  assert.deepEqual(result.missingEvidence, ['completionEvent', 'remoteEvidence']);
  assert.equal(result.nextAttemptAt, null);
});

test('planResume retries transient reads and idempotent writes with exponential delay', () => {
  for (const input of [
    resumeInput({ attemptsUsed: 2 }),
    resumeInput({ callKind: 'write', idempotencyKey: 'write-42', attemptsUsed: 2 }),
  ]) {
    assert.deepEqual(planResume(input), {
      decision: 'retry',
      reason: '临时错误且操作可安全重试',
      missingEvidence: [],
      nextAttemptAt: 1_500,
    });
  }
});

test('planResume fails when retry budget is exhausted and manually reviews unsafe retries', () => {
  assert.equal(planResume(resumeInput({ attemptsUsed: 3 })).decision, 'fail');
  assert.equal(planResume(resumeInput({
    callKind: 'write',
    errorKind: 'transient',
    idempotencyKey: null,
  })).decision, 'manual');
  assert.equal(planResume(resumeInput({ errorKind: 'unknown' })).decision, 'manual');
});

test('planResume rejects blank idempotency keys instead of retrying writes', () => {
  for (const idempotencyKey of ['', '   ']) {
    assert.throws(() => planResume(resumeInput({
      callKind: 'write',
      idempotencyKey,
    })), RangeError);
  }
});

test('planResume validates enums, booleans, keys, and all numeric inputs', () => {
  const valid = resumeInput();
  assert.throws(() => planResume(null), TypeError);
  assert.throws(() => planResume({ ...valid, callKind: 'execute' }), RangeError);
  assert.throws(() => planResume({ ...valid, hasCompletionEvent: 1 }), TypeError);
  assert.throws(() => planResume({ ...valid, errorKind: 'network' }), RangeError);
  assert.throws(() => planResume({ ...valid, idempotencyKey: 42 }), TypeError);
  assert.throws(() => planResume({ ...valid, idempotencyRecord: 'failed' }), RangeError);
  assert.throws(() => planResume({ ...valid, remoteEvidence: 'unknown' }), RangeError);

  for (const [field, value] of [
    ['attemptsUsed', -1], ['attemptsUsed', 0.5], ['maxAttempts', 0], ['maxAttempts', 1.5],
    ['now', -1], ['now', Number.NaN], ['baseDelayMs', -1], ['baseDelayMs', Infinity],
    ['jitterFactor', -0.1], ['jitterFactor', 1.1], ['jitterFactor', Number.NaN],
  ]) {
    assert.throws(() => planResume({ ...valid, [field]: value }), RangeError);
  }
  assert.throws(() => planResume({ ...valid, now: '1000' }), TypeError);
});

test('planResume leaves its input untouched', () => {
  const input = resumeInput({ callKind: 'write', idempotencyKey: 'key-1' });
  const snapshot = structuredClone(input);

  planResume(input);

  assert.deepEqual(input, snapshot);
});

function queueState(overrides = {}) {
  return {
    queued: [],
    running: [],
    completed: [],
    cancelled: [],
    ...overrides,
  };
}

function queueInput(overrides = {}) {
  return {
    arrivals: [],
    workerCount: 2,
    serviceCapacity: 3,
    maxQueue: 2,
    admissionPolicy: 'reject-new',
    cancelIds: [],
    ...overrides,
  };
}

test('stepQueue applies cancellation, service, queue aging, FIFO starts, and arrivals in order', () => {
  const state = queueState({
    queued: [
      { id: 'cancel-q', age: 2, remaining: 8 },
      { id: 'next-q', age: 1, remaining: 5 },
    ],
    running: [
      { id: 'finish-r', remaining: 2 },
      { id: 'keep-r', remaining: 8 },
    ],
  });
  const result = stepQueue(state, queueInput({
    arrivals: [
      { id: 'queued-new', duration: 4 },
      { id: 'rejected-new', duration: 7 },
    ],
    maxQueue: 1,
    cancelIds: ['cancel-q'],
  }));

  assert.deepEqual(result.state, {
    queued: [{ id: 'queued-new', age: 0, remaining: 4 }],
    running: [
      { id: 'keep-r', remaining: 5 },
      { id: 'next-q', remaining: 5 },
    ],
    completed: ['finish-r'],
    cancelled: ['cancel-q'],
  });
  assert.deepEqual(result.admitted, ['queued-new']);
  assert.deepEqual(result.started, ['next-q']);
  assert.deepEqual(result.completed, ['finish-r']);
  assert.deepEqual(result.rejected, ['rejected-new']);
  assert.deepEqual(result.cancelled, ['cancel-q']);
  assert.equal(result.utilization, 1);
});

test('stepQueue never exceeds worker count and starts new arrivals directly when possible', () => {
  const result = stepQueue(queueState(), queueInput({
    arrivals: [
      { id: 'a', duration: 5 },
      { id: 'b', duration: 6 },
      { id: 'c', duration: 7 },
    ],
  }));

  assert.deepEqual(result.state.running, [
    { id: 'a', remaining: 5 },
    { id: 'b', remaining: 6 },
  ]);
  assert.deepEqual(result.state.queued, [{ id: 'c', age: 0, remaining: 7 }]);
  assert.deepEqual(result.admitted, ['a', 'b', 'c']);
  assert.deepEqual(result.started, ['a', 'b']);
  assert.equal(result.state.running.length <= 2, true);
});

test('stepQueue rejects new work when the queue is full', () => {
  const result = stepQueue(queueState({
    queued: [{ id: 'waiting', age: 0, remaining: 5 }],
    running: [{ id: 'busy', remaining: 10 }],
  }), queueInput({
    arrivals: [{ id: 'new', duration: 2 }],
    workerCount: 1,
    maxQueue: 1,
  }));

  assert.deepEqual(result.rejected, ['new']);
  assert.deepEqual(result.state.queued, [{ id: 'waiting', age: 1, remaining: 5 }]);
});

test('stepQueue does not start queued work cancelled in the same tick', () => {
  const result = stepQueue(queueState({
    queued: [{ id: 'cancel-me', age: 4, remaining: 2 }],
  }), queueInput({ workerCount: 1, cancelIds: ['cancel-me'] }));

  assert.deepEqual(result.started, []);
  assert.deepEqual(result.cancelled, ['cancel-me']);
  assert.deepEqual(result.state.running, []);
  assert.deepEqual(result.state.cancelled, ['cancel-me']);
});

test('stepQueue ages only jobs that were already queued at tick start', () => {
  const result = stepQueue(queueState({
    queued: [{ id: 'old', age: 3, remaining: 8 }],
    running: [{ id: 'busy', remaining: 10 }],
  }), queueInput({
    arrivals: [{ id: 'new', duration: 4 }],
    workerCount: 1,
    maxQueue: 2,
  }));

  assert.deepEqual(result.state.queued, [
    { id: 'old', age: 4, remaining: 8 },
    { id: 'new', age: 0, remaining: 4 },
  ]);
});

test('stepQueue reports zero utilization when worker count is zero', () => {
  const result = stepQueue(queueState(), queueInput({
    arrivals: [{ id: 'waiting', duration: 2 }],
    workerCount: 0,
  }));

  assert.equal(result.utilization, 0);
  assert.deepEqual(result.state.queued, [{ id: 'waiting', age: 0, remaining: 2 }]);
});

test('stepQueue rejects malformed counts, policy, jobs, and duplicate IDs', () => {
  const state = queueState();
  const input = queueInput();

  assert.throws(() => stepQueue(null, input), TypeError);
  assert.throws(() => stepQueue(state, null), TypeError);
  assert.throws(() => stepQueue(state, { ...input, admissionPolicy: 'drop-old' }), RangeError);
  for (const [field, value] of [
    ['workerCount', -1], ['workerCount', 1.5],
    ['serviceCapacity', -1], ['serviceCapacity', 1.5],
    ['maxQueue', -1], ['maxQueue', 1.5],
  ]) {
    assert.throws(() => stepQueue(state, { ...input, [field]: value }), RangeError);
  }
  assert.throws(() => stepQueue(queueState({ queued: [{ id: 'q', age: -1, remaining: 2 }] }), input), RangeError);
  assert.throws(() => stepQueue(queueState({ running: [{ id: 'r', remaining: 1.5 }] }), input), RangeError);
  assert.throws(() => stepQueue(state, queueInput({ arrivals: [{ id: 'a', duration: 0 }] })), RangeError);
  assert.throws(() => stepQueue(state, queueInput({
    arrivals: [{ id: 'same', duration: 1 }, { id: 'same', duration: 2 }],
  })), /duplicate|重复/i);
  assert.throws(() => stepQueue(queueState({
    queued: [{ id: 'same', age: 0, remaining: 1 }],
    completed: ['same'],
  }), input), /duplicate|重复/i);
});

test('stepQueue does not mutate state or input and returns fresh nested data', () => {
  const state = queueState({
    queued: [{ id: 'q', age: 1, remaining: 4 }],
    running: [{ id: 'r', remaining: 8 }],
    completed: ['done'],
  });
  const input = queueInput({ arrivals: [{ id: 'new', duration: 3 }] });
  const snapshots = structuredClone({ state, input });

  const result = stepQueue(state, input);

  assert.deepEqual({ state, input }, snapshots);
  assert.notEqual(result.state, state);
  assert.notEqual(result.state.queued, state.queued);
  assert.notEqual(result.state.running, state.running);
  assert.notEqual(result.state.completed, state.completed);
  assert.notEqual(result.state.queued[0], state.queued[0]);
});
