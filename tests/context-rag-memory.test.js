import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyMemoryEvent,
  assembleContext,
  recallMemory,
  retrieveAndPack,
} from '../src/core/context-rag-memory.js';

function contextItem(id, overrides = {}) {
  return {
    id,
    layer: 'conversation-state',
    projectionType: 'state-projection',
    tokenCost: 2,
    sourceRef: `source:${id}`,
    priority: 0,
    timestamp: 1,
    required: false,
    status: 'active',
    ...overrides,
  };
}

test('assembleContext prioritizes required instruction and current turn without mutating inputs', () => {
  const items = [
    contextItem('optional-new', { tokenCost: 4, timestamp: 99 }),
    contextItem('instruction', {
      layer: 'static-instruction',
      projectionType: 'instruction',
      tokenCost: 2,
      required: true,
    }),
    contextItem('turn', {
      layer: 'current-turn',
      projectionType: 'current-turn',
      tokenCost: 3,
      required: true,
    }),
  ];
  const policy = { strategy: 'recent-first' };
  const snapshot = structuredClone({ items, policy });

  const result = assembleContext(items, 8, 2, policy);

  assert.deepEqual(result.included.map(({ id }) => id), ['turn', 'instruction']);
  assert.deepEqual(result.excluded, [{ id: 'optional-new', reason: 'budget-exceeded' }]);
  assert.equal(result.inputBudget, 6);
  assert.equal(result.used, 5);
  assert.equal(result.remaining, 1);
  assert.equal(result.unassemblable, false);
  assert.equal(result.reason, null);
  assert.deepEqual({ items, policy }, snapshot);
  assert.notEqual(result.included[0], items[2]);
});

test('assembleContext excludes raw stores and inactive projections with explicit reasons', () => {
  const result = assembleContext([
    contextItem('checkpoint', {
      layer: 'checkpoint',
      projectionType: 'raw',
    }),
    contextItem('corpus', {
      layer: 'corpus',
      projectionType: 'raw',
    }),
    contextItem('expired', { status: 'expired' }),
    contextItem('superseded', { status: 'superseded' }),
    contextItem('memory', {
      layer: 'long-term-memory',
      projectionType: 'memory-projection',
    }),
  ], 20, 2, { strategy: 'recent-first' });

  assert.deepEqual(result.included.map(({ id }) => id), ['memory']);
  assert.deepEqual(result.excluded, [
    { id: 'checkpoint', reason: 'not-projectable' },
    { id: 'corpus', reason: 'not-projectable' },
    { id: 'expired', reason: 'expired' },
    { id: 'superseded', reason: 'superseded' },
  ]);
});

test('assembleContext applies stable recent-first and evidence-first ordering', () => {
  const items = [
    contextItem('state-z', { timestamp: 9, priority: 1 }),
    contextItem('evidence-b', {
      layer: 'corpus',
      projectionType: 'retrieval-evidence',
      timestamp: 2,
      priority: 1,
    }),
    contextItem('evidence-a', {
      layer: 'corpus',
      projectionType: 'retrieval-evidence',
      timestamp: 2,
      priority: 1,
    }),
  ];

  const recent = assembleContext(items, 20, 0, { strategy: 'recent-first' });
  const evidence = assembleContext(items, 20, 0, { strategy: 'evidence-first' });

  assert.deepEqual(recent.included.map(({ id }) => id), [
    'state-z', 'evidence-a', 'evidence-b',
  ]);
  assert.deepEqual(evidence.included.map(({ id }) => id), [
    'evidence-a', 'evidence-b', 'state-z',
  ]);
});

test('assembleContext permits an exact fit', () => {
  const result = assembleContext([
    contextItem('one', { tokenCost: 3 }),
    contextItem('two', { tokenCost: 5 }),
  ], 10, 2, { strategy: 'recent-first' });

  assert.equal(result.used, 8);
  assert.equal(result.remaining, 0);
  assert.equal(result.unassemblable, false);
  assert.deepEqual(result.excluded, []);
});

test('assembleContext reports required overflow instead of silently dropping required items', () => {
  const result = assembleContext([
    contextItem('required-a', {
      layer: 'static-instruction',
      projectionType: 'instruction',
      tokenCost: 4,
      required: true,
    }),
    contextItem('required-b', {
      layer: 'current-turn',
      projectionType: 'current-turn',
      tokenCost: 4,
      required: true,
    }),
  ], 8, 2, { strategy: 'evidence-first' });

  assert.equal(result.unassemblable, true);
  assert.match(result.reason, /required.*budget/i);
  assert.deepEqual(
    [...result.included.map(({ id }) => id), ...result.excluded.map(({ id }) => id)].sort(),
    ['required-a', 'required-b'],
  );
  assert.ok(result.excluded.some(({ reason }) => reason === 'required-budget-exceeded'));
});

test('assembleContext validates budgets, policies, identifiers, layers, projections and token cost', () => {
  const valid = contextItem('valid');
  const invalidCalls = [
    () => assembleContext([valid], -1, 0, { strategy: 'recent-first' }),
    () => assembleContext([valid], 4, 5, { strategy: 'recent-first' }),
    () => assembleContext([valid], 4, 0, { strategy: 'random' }),
    () => assembleContext([valid, { ...valid }], 4, 0, { strategy: 'recent-first' }),
    () => assembleContext([{ ...valid, id: ' ' }], 4, 0, { strategy: 'recent-first' }),
    () => assembleContext([{ ...valid, layer: 'unknown' }], 4, 0, { strategy: 'recent-first' }),
    () => assembleContext([{ ...valid, projectionType: 'unknown' }], 4, 0, { strategy: 'recent-first' }),
    () => assembleContext([{ ...valid, tokenCost: -1 }], 4, 0, { strategy: 'recent-first' }),
    () => assembleContext([{ ...valid, tokenCost: Number.MAX_SAFE_INTEGER + 1 }], 4, 0, { strategy: 'recent-first' }),
  ];

  for (const call of invalidCalls) assert.throws(call);
});

function chunk(id, overrides = {}) {
  return {
    id,
    documentId: `document-${id}`,
    version: 1,
    department: 'engineering',
    language: 'zh',
    tokenCost: 2,
    terms: ['agent'],
    denseScore: 0.5,
    sourceRef: `https://example.com/${id}`,
    ...overrides,
  };
}

function retrievalOptions(overrides = {}) {
  return {
    alpha: 0.5,
    topK: 10,
    threshold: 0,
    budget: 20,
    filters: {},
    latestVersionOnly: false,
    dedupeByDocument: false,
    ...overrides,
  };
}

test('retrieveAndPack computes case-insensitive unique query-term overlap', () => {
  const result = retrieveAndPack([
    chunk('partial', { terms: ['Agent'] }),
    chunk('full', { terms: ['MEMORY', 'agent', 'agent'] }),
    chunk('none', { terms: ['tool'] }),
  ], 'Agent agent MEMORY', retrievalOptions({ alpha: 0 }));

  const scores = Object.fromEntries(result.trace.map((entry) => [entry.id, entry.sparseScore]));
  assert.equal(scores.partial, 0.5);
  assert.equal(scores.full, 1);
  assert.equal(scores.none, 0);
  assert.deepEqual(result.ranked.map(({ id }) => id), ['full', 'partial', 'none']);
});

test('retrieveAndPack alpha endpoints use only sparse or dense score', () => {
  const corpus = [
    chunk('lexical', { terms: ['memory'], denseScore: 0.1 }),
    chunk('semantic', { terms: ['other'], denseScore: 0.9 }),
  ];

  const sparse = retrieveAndPack(corpus, 'memory', retrievalOptions({ alpha: 0 }));
  const dense = retrieveAndPack(corpus, 'memory', retrievalOptions({ alpha: 1 }));

  assert.deepEqual(sparse.ranked.map(({ id }) => id), ['lexical', 'semantic']);
  assert.deepEqual(dense.ranked.map(({ id }) => id), ['semantic', 'lexical']);
  assert.equal(sparse.ranked[0].hybridScore, sparse.ranked[0].sparseScore);
  assert.equal(dense.ranked[0].hybridScore, dense.ranked[0].denseScore);
});

test('retrieveAndPack applies metadata filters before top-k', () => {
  const result = retrieveAndPack([
    chunk('filtered-high', { department: 'sales', denseScore: 1 }),
    chunk('kept-best', { denseScore: 0.8 }),
    chunk('kept-next', { denseScore: 0.7 }),
  ], 'agent', retrievalOptions({
    alpha: 1,
    topK: 1,
    filters: { department: 'engineering', language: 'zh' },
  }));

  assert.deepEqual(result.ranked.map(({ id }) => id), ['kept-best']);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'filtered-high' && reason === 'metadata-filtered'
  )));
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'kept-next' && reason === 'top-k'
  )));
  assert.equal(
    result.trace.find(({ id }) => id === 'filtered-high').filteredReason,
    'metadata-filtered',
  );
});

test('retrieveAndPack applies threshold and stable ID tie-breaking', () => {
  const result = retrieveAndPack([
    chunk('same-b', { terms: ['agent'], denseScore: 0.5 }),
    chunk('below', { terms: ['other'], denseScore: 0.1 }),
    chunk('same-a', { terms: ['agent'], denseScore: 0.5 }),
  ], 'agent', retrievalOptions({ alpha: 0.5, threshold: 0.5 }));

  assert.deepEqual(result.ranked.map(({ id }) => id), ['same-a', 'same-b']);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'below' && reason === 'below-threshold'
  )));
});

test('retrieveAndPack keeps only the latest document version when requested', () => {
  const result = retrieveAndPack([
    chunk('guide-v1', { documentId: 'guide', version: 1, denseScore: 0.9 }),
    chunk('guide-v2', { documentId: 'guide', version: 2, denseScore: 0.8 }),
    chunk('other', { documentId: 'other', version: 1, denseScore: 0.7 }),
  ], 'agent', retrievalOptions({ alpha: 1, latestVersionOnly: true }));

  assert.deepEqual(result.ranked.map(({ id }) => id), ['guide-v2', 'other']);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'guide-v1' && reason === 'old-version'
  )));
});

test('retrieveAndPack never revives an old version when the latest version misses metadata filters', () => {
  const result = retrieveAndPack([
    chunk('guide-v1', {
      documentId: 'guide', version: 1, department: 'engineering', denseScore: 0.9,
    }),
    chunk('guide-v2', {
      documentId: 'guide', version: 2, department: 'sales', denseScore: 0.8,
    }),
  ], 'agent', retrievalOptions({
    alpha: 1,
    filters: { department: 'engineering' },
    latestVersionOnly: true,
  }));

  assert.deepEqual(result.ranked, []);
  assert.deepEqual(result.packed, []);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'guide-v1' && reason === 'old-version'
  )));
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'guide-v2' && reason === 'metadata-filtered'
  )));
});

test('retrieveAndPack deduplicates documents before budget packing', () => {
  const result = retrieveAndPack([
    chunk('doc-a-best', { documentId: 'doc-a', denseScore: 0.9 }),
    chunk('doc-a-next', { documentId: 'doc-a', denseScore: 0.8 }),
    chunk('doc-b', { documentId: 'doc-b', denseScore: 0.7 }),
  ], 'agent', retrievalOptions({
    alpha: 1,
    dedupeByDocument: true,
  }));

  assert.deepEqual(result.packed.map(({ id }) => id), ['doc-a-best', 'doc-b']);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'doc-a-next' && reason === 'duplicate-document'
  )));
});

test('retrieveAndPack records budget exclusions and emits source-traceable citations', () => {
  const corpus = [
    chunk('a', { tokenCost: 3, denseScore: 0.9 }),
    chunk('b', { tokenCost: 3, denseScore: 0.8 }),
  ];
  const options = retrievalOptions({ alpha: 1, budget: 3 });
  const snapshot = structuredClone({ corpus, options });

  const result = retrieveAndPack(corpus, 'agent', options);

  assert.deepEqual(result.packed.map(({ id }) => id), ['a']);
  assert.deepEqual(result.citations, [{
    chunkId: 'a',
    documentId: 'document-a',
    version: 1,
    sourceRef: 'https://example.com/a',
  }]);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'b' && reason === 'budget-exceeded'
  )));
  assert.equal(result.used, 3);
  assert.equal(result.remaining, 0);
  assert.deepEqual({ corpus, options }, snapshot);
  assert.notEqual(result.packed[0], corpus[0]);
});

test('retrieveAndPack validates query, options, duplicate IDs and dense scores', () => {
  const valid = chunk('valid');
  const invalidCalls = [
    () => retrieveAndPack([valid], ' ', retrievalOptions()),
    () => retrieveAndPack([valid], 'agent', retrievalOptions({ alpha: -0.1 })),
    () => retrieveAndPack([valid], 'agent', retrievalOptions({ alpha: 1.1 })),
    () => retrieveAndPack([valid], 'agent', retrievalOptions({ topK: 0 })),
    () => retrieveAndPack([valid], 'agent', retrievalOptions({ threshold: -1 })),
    () => retrieveAndPack([valid], 'agent', retrievalOptions({ budget: -1 })),
    () => retrieveAndPack([valid, { ...valid }], 'agent', retrievalOptions()),
    () => retrieveAndPack([{ ...valid, denseScore: Infinity }], 'agent', retrievalOptions()),
  ];

  for (const call of invalidCalls) assert.throws(call);
});

function memoryState(overrides = {}) {
  return { clock: 10, records: [], ...overrides };
}

function memoryPolicy(overrides = {}) {
  return {
    minObserveConfidence: 0.7,
    forbiddenSensitivities: ['secret'],
    defaultTtl: null,
    ...overrides,
  };
}

function saveEvent(id, overrides = {}) {
  return {
    type: 'explicit-save',
    id,
    subject: 'user-1',
    key: 'editor',
    value: 'VS Code',
    scope: 'assistant',
    sourceRef: 'turn:1',
    confidence: 1,
    sensitivity: 'normal',
    ttl: null,
    ...overrides,
  };
}

test('applyMemoryEvent stores explicit saves with complete lifecycle fields and no mutation', () => {
  const state = memoryState();
  const event = saveEvent('memory-1');
  const policy = memoryPolicy();
  const snapshot = structuredClone({ state, event, policy });

  const result = applyMemoryEvent(state, event, policy, 20);

  assert.equal(result.action, 'store');
  assert.equal(result.state.clock, 20);
  assert.deepEqual(result.state.records[0], {
    id: 'memory-1',
    subject: 'user-1',
    key: 'editor',
    value: 'VS Code',
    scope: 'assistant',
    sourceRef: 'turn:1',
    confidence: 1,
    sensitivity: 'normal',
    observedAt: 20,
    expiresAt: null,
    status: 'active',
    supersededBy: null,
    deletedAt: null,
  });
  assert.deepEqual({ state, event, policy }, snapshot);
  assert.notEqual(result.state, state);
  assert.notEqual(result.state.records, state.records);
});

test('applyMemoryEvent treats a repeated active value as an explicit no-op', () => {
  const stored = applyMemoryEvent(
    memoryState(),
    saveEvent('memory-1'),
    memoryPolicy(),
    20,
  ).state;
  const result = applyMemoryEvent(
    stored,
    saveEvent('memory-2', { sourceRef: 'turn:2' }),
    memoryPolicy(),
    21,
  );

  assert.equal(result.action, 'no-op');
  assert.equal(result.state.clock, 21);
  assert.equal(result.state.records.length, 1);
  assert.deepEqual(result.state.records[0], stored.records[0]);
});

test('applyMemoryEvent correction supersedes the target and stores the replacement', () => {
  const stored = applyMemoryEvent(
    memoryState(),
    saveEvent('memory-old'),
    memoryPolicy(),
    20,
  ).state;
  const corrected = applyMemoryEvent(stored, {
    ...saveEvent('memory-new', { value: 'Zed', sourceRef: 'turn:3' }),
    type: 'correct',
    targetId: 'memory-old',
  }, memoryPolicy(), 30);

  assert.equal(corrected.action, 'supersede');
  assert.equal(corrected.state.records[0].status, 'superseded');
  assert.equal(corrected.state.records[0].supersededBy, 'memory-new');
  assert.equal(corrected.state.records[1].status, 'active');
  assert.equal(corrected.state.records[1].value, 'Zed');
});

test('applyMemoryEvent rejects low-confidence observations and forbidden sensitivity', () => {
  const lowConfidence = applyMemoryEvent(memoryState(), {
    ...saveEvent('observed-low', { confidence: 0.4 }),
    type: 'observe',
  }, memoryPolicy(), 20);
  const sensitive = applyMemoryEvent(memoryState(), saveEvent('secret', {
    sensitivity: 'secret',
  }), memoryPolicy(), 20);

  assert.equal(lowConfidence.action, 'reject');
  assert.match(lowConfidence.reason, /confidence/i);
  assert.deepEqual(lowConfidence.state.records, []);
  assert.equal(sensitive.action, 'reject');
  assert.match(sensitive.reason, /sensitivity/i);
  assert.deepEqual(sensitive.state.records, []);
});

test('recallMemory excludes expired and deleted records', () => {
  let state = applyMemoryEvent(memoryState(), saveEvent('temporary', {
    ttl: 5,
  }), memoryPolicy(), 20).state;
  state = applyMemoryEvent(state, saveEvent('deletable', {
    key: 'editor-theme',
    value: 'dark',
  }), memoryPolicy(), 21).state;
  state = applyMemoryEvent(state, {
    type: 'delete',
    targetId: 'deletable',
  }, memoryPolicy(), 22).state;

  const result = recallMemory(state, {
    subject: 'user-1',
    scope: 'assistant',
    text: 'editor theme',
  }, 30);

  assert.deepEqual(result.records, []);
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'temporary' && reason === 'expired'
  )));
  assert.ok(result.excluded.some(({ id, reason }) => (
    id === 'deletable' && reason === 'deleted'
  )));
});

test('recallMemory isolates subject and scope without revealing mismatches', () => {
  let state = applyMemoryEvent(memoryState(), saveEvent('visible'), memoryPolicy(), 20).state;
  state = applyMemoryEvent(state, saveEvent('other-subject', {
    subject: 'user-2',
  }), memoryPolicy(), 21).state;
  state = applyMemoryEvent(state, saveEvent('other-scope', {
    scope: 'team',
  }), memoryPolicy(), 22).state;

  const result = recallMemory(state, {
    subject: 'user-1',
    scope: 'assistant',
    text: 'editor',
  }, 23);

  assert.deepEqual(result.records.map(({ id }) => id), ['visible']);
  assert.ok(!result.excluded.some(({ id }) => id === 'other-subject' || id === 'other-scope'));
  assert.deepEqual(result.projection, [{
    id: 'visible',
    key: 'editor',
    value: 'VS Code',
    sourceRef: 'turn:1',
  }]);
  assert.notEqual(result.projection[0], result.records[0]);
});

test('recallMemory breaks equal-score ties by newest observedAt then ID', () => {
  let state = applyMemoryEvent(memoryState(), saveEvent('same-z', {
    key: 'editor-choice',
  }), memoryPolicy(), 20).state;
  state = applyMemoryEvent(state, saveEvent('new-b', {
    key: 'editor-font',
    value: 'JetBrains Mono',
  }), memoryPolicy(), 21).state;
  state = applyMemoryEvent(state, saveEvent('new-a', {
    key: 'editor-theme',
    value: 'solarized',
  }), memoryPolicy(), 21).state;

  const result = recallMemory(state, {
    subject: 'user-1',
    scope: 'assistant',
    text: 'editor',
  }, 22);

  assert.deepEqual(result.records.map(({ id }) => id), ['new-a', 'new-b', 'same-z']);
});

test('applyMemoryEvent uses supplied time for advance-time and never accepts clock rollback', () => {
  const advanced = applyMemoryEvent(
    memoryState(),
    { type: 'advance-time' },
    memoryPolicy(),
    50,
  );
  assert.equal(advanced.action, 'advance-time');
  assert.equal(advanced.state.clock, 50);
  assert.throws(() => applyMemoryEvent(
    advanced.state,
    { type: 'advance-time' },
    memoryPolicy(),
    49,
  ), /clock|time/i);
  assert.throws(() => recallMemory(advanced.state, {
    subject: 'user-1', scope: 'assistant', text: 'editor',
  }, 49), /clock|time/i);
});

test('memory lifecycle validates events, state identity and required provenance fields', () => {
  const duplicateRecords = memoryState({
    records: [
      {
        id: 'duplicate', subject: 'user-1', key: 'editor', value: 'A',
        scope: 'assistant', sourceRef: 'turn:1', confidence: 1,
        sensitivity: 'normal', observedAt: 1, expiresAt: null,
        status: 'active', supersededBy: null, deletedAt: null,
      },
      {
        id: 'duplicate', subject: 'user-1', key: 'theme', value: 'B',
        scope: 'assistant', sourceRef: 'turn:2', confidence: 1,
        sensitivity: 'normal', observedAt: 2, expiresAt: null,
        status: 'active', supersededBy: null, deletedAt: null,
      },
    ],
  });
  const invalidCalls = [
    () => applyMemoryEvent(memoryState(), { type: 'invented' }, memoryPolicy(), 20),
    () => applyMemoryEvent(duplicateRecords, { type: 'advance-time' }, memoryPolicy(), 20),
    () => applyMemoryEvent(memoryState(), saveEvent('x', { subject: ' ' }), memoryPolicy(), 20),
    () => applyMemoryEvent(memoryState(), saveEvent('x', { key: '' }), memoryPolicy(), 20),
    () => applyMemoryEvent(memoryState(), saveEvent('x', { sourceRef: '' }), memoryPolicy(), 20),
  ];
  for (const call of invalidCalls) assert.throws(call);

  const stored = applyMemoryEvent(memoryState(), saveEvent('duplicate'), memoryPolicy(), 20).state;
  assert.throws(() => applyMemoryEvent(
    stored,
    saveEvent('duplicate', { key: 'new-key', value: 'new-value' }),
    memoryPolicy(),
    21,
  ), /duplicate/i);
});
