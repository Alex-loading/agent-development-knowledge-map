const CONTEXT_LAYERS = new Set([
  'static-instruction',
  'current-turn',
  'conversation-state',
  'corpus',
  'checkpoint',
  'long-term-memory',
]);

const PROJECTION_TYPES = new Set([
  'instruction',
  'current-turn',
  'state-projection',
  'retrieval-evidence',
  'memory-projection',
  'raw',
]);

const CONTEXT_PROJECTIONS_BY_LAYER = new Map([
  ['static-instruction', new Set(['instruction'])],
  ['current-turn', new Set(['current-turn'])],
  ['conversation-state', new Set(['state-projection'])],
  ['corpus', new Set(['retrieval-evidence', 'raw'])],
  ['checkpoint', new Set(['state-projection', 'raw'])],
  ['long-term-memory', new Set(['memory-projection'])],
]);

const CONTEXT_STRATEGIES = new Set(['recent-first', 'evidence-first']);
const CONTEXT_STATUSES = new Set(['active', 'expired', 'superseded']);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertPlainObject(value, name) {
  if (!isPlainObject(value)) throw new TypeError(`${name} must be a plain object`);
}

function assertNonEmptyString(value, name) {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`);
  if (value.trim().length === 0) throw new RangeError(`${name} must not be empty`);
}

function assertSafeInteger(value, name, { positive = false } = {}) {
  const minimum = positive ? 1 : 0;
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(
      `${name} must be a ${positive ? 'positive' : 'non-negative'} safe integer`,
    );
  }
}

function assertFiniteNumber(value, name, { minimum = -Infinity, maximum = Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  if (value < minimum || value > maximum) {
    throw new RangeError(`${name} must be between ${minimum} and ${maximum}`);
  }
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertContextItem(item, index, ids) {
  const name = `items[${index}]`;
  assertPlainObject(item, name);
  assertNonEmptyString(item.id, `${name}.id`);
  if (ids.has(item.id)) throw new RangeError(`duplicate context item ID: ${item.id}`);
  ids.add(item.id);
  if (!CONTEXT_LAYERS.has(item.layer)) {
    throw new RangeError(`${name}.layer is not supported`);
  }
  if (!PROJECTION_TYPES.has(item.projectionType)) {
    throw new RangeError(`${name}.projectionType is not supported`);
  }
  if (!CONTEXT_PROJECTIONS_BY_LAYER.get(item.layer).has(item.projectionType)) {
    throw new RangeError(`${name} layer and projectionType combination is not supported`);
  }
  assertSafeInteger(item.tokenCost, `${name}.tokenCost`);
  assertNonEmptyString(item.sourceRef, `${name}.sourceRef`);
  if (typeof item.required !== 'boolean') {
    throw new TypeError(`${name}.required must be a boolean`);
  }
  assertFiniteNumber(item.priority, `${name}.priority`);
  assertSafeInteger(item.timestamp, `${name}.timestamp`);
  if (!CONTEXT_STATUSES.has(item.status)) {
    throw new RangeError(`${name}.status is not supported`);
  }
}

function contextComparator(strategy) {
  const evidenceRank = {
    'retrieval-evidence': 0,
    'memory-projection': 1,
    'state-projection': 2,
    'current-turn': 3,
    instruction: 4,
    raw: 5,
  };
  const requiredLayerRank = {
    'current-turn': 0,
    'static-instruction': 1,
  };

  return (left, right) => {
    if (left.required !== right.required) return left.required ? -1 : 1;
    if (left.required && right.required) {
      const layerDifference = (requiredLayerRank[left.layer] ?? 2)
        - (requiredLayerRank[right.layer] ?? 2);
      if (layerDifference !== 0) return layerDifference;
    }
    if (strategy === 'evidence-first') {
      const projectionDifference = evidenceRank[left.projectionType]
        - evidenceRank[right.projectionType];
      if (projectionDifference !== 0) return projectionDifference;
    } else if (left.timestamp !== right.timestamp) {
      return right.timestamp - left.timestamp;
    }
    if (left.priority !== right.priority) return right.priority - left.priority;
    if (left.timestamp !== right.timestamp) return right.timestamp - left.timestamp;
    return compareText(left.id, right.id);
  };
}

function contextProjection(item) {
  return {
    id: item.id,
    originLayer: item.layer,
    projectionType: item.projectionType,
    tokenCost: item.tokenCost,
    sourceRef: item.sourceRef,
  };
}

export function assembleContext(items, inputLimit, outputReserve, policy) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  assertSafeInteger(inputLimit, 'inputLimit');
  assertSafeInteger(outputReserve, 'outputReserve');
  if (outputReserve > inputLimit) {
    throw new RangeError('outputReserve must not exceed inputLimit');
  }
  assertPlainObject(policy, 'policy');
  if (!CONTEXT_STRATEGIES.has(policy.strategy)) {
    throw new RangeError('policy.strategy must be recent-first or evidence-first');
  }

  const ids = new Set();
  items.forEach((item, index) => assertContextItem(item, index, ids));
  const inputBudget = inputLimit - outputReserve;
  const excluded = [];
  const candidates = [];

  for (const item of items) {
    if (item.projectionType === 'raw'
      && (item.layer === 'checkpoint' || item.layer === 'corpus')) {
      excluded.push({ id: item.id, reason: 'not-projectable' });
    } else if (item.status === 'expired') {
      excluded.push({ id: item.id, reason: 'expired' });
    } else if (item.status === 'superseded') {
      excluded.push({ id: item.id, reason: 'superseded' });
    } else {
      candidates.push(item);
    }
  }

  candidates.sort(contextComparator(policy.strategy));
  const requiredCost = candidates
    .filter(({ required }) => required)
    .reduce((total, { tokenCost }) => total + tokenCost, 0);
  const unassemblable = requiredCost > inputBudget;
  const included = [];
  let used = 0;

  for (const item of candidates) {
    if (used + item.tokenCost <= inputBudget) {
      included.push(contextProjection(item));
      used += item.tokenCost;
    } else {
      excluded.push({
        id: item.id,
        reason: item.required ? 'required-budget-exceeded' : 'budget-exceeded',
      });
    }
  }

  return {
    included,
    excluded,
    inputBudget,
    used,
    remaining: inputBudget - used,
    unassemblable,
    reason: unassemblable ? 'required items exceed input budget' : null,
  };
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean`);
}

function assertRetrievalChunk(chunk, index, ids) {
  const name = `corpus[${index}]`;
  assertPlainObject(chunk, name);
  for (const field of ['id', 'documentId', 'department', 'language', 'sourceRef']) {
    assertNonEmptyString(chunk[field], `${name}.${field}`);
  }
  if (ids.has(chunk.id)) throw new RangeError(`duplicate chunk ID: ${chunk.id}`);
  ids.add(chunk.id);
  assertSafeInteger(chunk.version, `${name}.version`, { positive: true });
  assertSafeInteger(chunk.tokenCost, `${name}.tokenCost`);
  if (!Array.isArray(chunk.terms)) throw new TypeError(`${name}.terms must be an array`);
  for (const [termIndex, term] of chunk.terms.entries()) {
    assertNonEmptyString(term, `${name}.terms[${termIndex}]`);
  }
  assertFiniteNumber(chunk.denseScore, `${name}.denseScore`);
}

function assertRetrievalOptions(options) {
  assertPlainObject(options, 'options');
  assertFiniteNumber(options.alpha, 'options.alpha', { minimum: 0, maximum: 1 });
  assertSafeInteger(options.topK, 'options.topK', { positive: true });
  assertFiniteNumber(options.threshold, 'options.threshold', { minimum: 0, maximum: 1 });
  assertSafeInteger(options.budget, 'options.budget');
  assertPlainObject(options.filters, 'options.filters');
  for (const [field, value] of Object.entries(options.filters)) {
    if (!['department', 'language'].includes(field)) {
      throw new RangeError(`options.filters.${field} is not supported`);
    }
    assertNonEmptyString(value, `options.filters.${field}`);
  }
  assertBoolean(options.latestVersionOnly, 'options.latestVersionOnly');
  assertBoolean(options.dedupeByDocument, 'options.dedupeByDocument');
}

function uniqueTerms(text) {
  return new Set(text.toLowerCase().trim().split(/\s+/u).filter(Boolean));
}

function retrievalView(entry) {
  return {
    id: entry.id,
    documentId: entry.documentId,
    version: entry.version,
    tokenCost: entry.tokenCost,
    sourceRef: entry.sourceRef,
    sparseScore: entry.sparseScore,
    denseScore: entry.denseScore,
    hybridScore: entry.hybridScore,
  };
}

export function retrieveAndPack(corpus, query, options) {
  if (!Array.isArray(corpus)) throw new TypeError('corpus must be an array');
  assertNonEmptyString(query, 'query');
  assertRetrievalOptions(options);
  const ids = new Set();
  corpus.forEach((entry, index) => assertRetrievalChunk(entry, index, ids));

  const queryTerms = uniqueTerms(query);
  const traceById = new Map();
  const scored = corpus.map((entry) => {
    const documentTerms = new Set(entry.terms.map((term) => term.toLowerCase()));
    const matches = [...queryTerms].filter((term) => documentTerms.has(term)).length;
    const sparseScore = matches / queryTerms.size;
    const hybridScore = options.alpha * entry.denseScore
      + (1 - options.alpha) * sparseScore;
    const scoredEntry = { ...entry, sparseScore, hybridScore };
    traceById.set(entry.id, {
      id: entry.id,
      sparseScore,
      denseScore: entry.denseScore,
      hybridScore,
      filteredReason: null,
    });
    return scoredEntry;
  });
  const excluded = [];

  function exclude(entry, reason) {
    excluded.push({ id: entry.id, reason });
    traceById.get(entry.id).filteredReason = reason;
  }

  let candidates = scored;
  if (options.latestVersionOnly) {
    const latestVersionByDocument = new Map();
    for (const entry of scored) {
      const current = latestVersionByDocument.get(entry.documentId) ?? -Infinity;
      latestVersionByDocument.set(entry.documentId, Math.max(current, entry.version));
    }
    candidates = candidates.filter((entry) => {
      const isLatest = entry.version === latestVersionByDocument.get(entry.documentId);
      if (!isLatest) exclude(entry, 'old-version');
      return isLatest;
    });
  }

  candidates = candidates.filter((entry) => {
    const matches = Object.entries(options.filters)
      .every(([field, value]) => entry[field] === value);
    if (!matches) exclude(entry, 'metadata-filtered');
    return matches;
  });

  candidates = candidates.filter((entry) => {
    const passes = entry.hybridScore >= options.threshold;
    if (!passes) exclude(entry, 'below-threshold');
    return passes;
  });
  candidates.sort((left, right) => (
    right.hybridScore - left.hybridScore || compareText(left.id, right.id)
  ));

  if (options.dedupeByDocument) {
    const seenDocuments = new Set();
    candidates = candidates.filter((entry) => {
      if (seenDocuments.has(entry.documentId)) {
        exclude(entry, 'duplicate-document');
        return false;
      }
      seenDocuments.add(entry.documentId);
      return true;
    });
  }

  const rankedEntries = candidates.slice(0, options.topK);
  for (const entry of candidates.slice(options.topK)) exclude(entry, 'top-k');

  const packedEntries = [];
  let used = 0;
  for (const entry of rankedEntries) {
    if (used + entry.tokenCost <= options.budget) {
      packedEntries.push(entry);
      used += entry.tokenCost;
    } else {
      exclude(entry, 'budget-exceeded');
    }
  }

  const packed = packedEntries.map(retrievalView);
  return {
    trace: corpus.map(({ id }) => ({ ...traceById.get(id) })),
    ranked: rankedEntries.map(retrievalView),
    packed,
    excluded,
    citations: packedEntries.map((entry) => ({
      chunkId: entry.id,
      documentId: entry.documentId,
      version: entry.version,
      sourceRef: entry.sourceRef,
    })),
    used,
    remaining: options.budget - used,
  };
}

const MEMORY_EVENT_TYPES = new Set([
  'observe',
  'explicit-save',
  'correct',
  'delete',
  'advance-time',
]);
const MEMORY_STATUSES = new Set(['active', 'superseded', 'deleted']);

function assertNullableSafeInteger(value, name) {
  if (value !== null) assertSafeInteger(value, name);
}

function assertMemoryRecord(record, index, ids) {
  const name = `state.records[${index}]`;
  assertPlainObject(record, name);
  for (const field of ['id', 'subject', 'key', 'value', 'scope', 'sourceRef', 'sensitivity']) {
    assertNonEmptyString(record[field], `${name}.${field}`);
  }
  if (ids.has(record.id)) throw new RangeError(`duplicate memory record ID: ${record.id}`);
  ids.add(record.id);
  assertFiniteNumber(record.confidence, `${name}.confidence`, { minimum: 0, maximum: 1 });
  assertSafeInteger(record.observedAt, `${name}.observedAt`);
  assertNullableSafeInteger(record.expiresAt, `${name}.expiresAt`);
  if (!MEMORY_STATUSES.has(record.status)) {
    throw new RangeError(`${name}.status is not supported`);
  }
  if (record.supersededBy !== null) {
    assertNonEmptyString(record.supersededBy, `${name}.supersededBy`);
  }
  assertNullableSafeInteger(record.deletedAt, `${name}.deletedAt`);
  if (record.status === 'superseded' && record.supersededBy === null) {
    throw new RangeError(`${name}.supersededBy is required for superseded records`);
  }
  if (record.status === 'deleted' && record.deletedAt === null) {
    throw new RangeError(`${name}.deletedAt is required for deleted records`);
  }
}

function assertMemoryState(state) {
  assertPlainObject(state, 'state');
  assertSafeInteger(state.clock, 'state.clock');
  if (!Array.isArray(state.records)) throw new TypeError('state.records must be an array');
  const ids = new Set();
  state.records.forEach((record, index) => assertMemoryRecord(record, index, ids));
  return ids;
}

function assertMemoryPolicy(policy) {
  assertPlainObject(policy, 'policy');
  assertFiniteNumber(policy.minObserveConfidence, 'policy.minObserveConfidence', {
    minimum: 0,
    maximum: 1,
  });
  if (!Array.isArray(policy.forbiddenSensitivities)) {
    throw new TypeError('policy.forbiddenSensitivities must be an array');
  }
  const sensitivities = new Set();
  for (const [index, sensitivity] of policy.forbiddenSensitivities.entries()) {
    assertNonEmptyString(sensitivity, `policy.forbiddenSensitivities[${index}]`);
    if (sensitivities.has(sensitivity)) {
      throw new RangeError(`duplicate forbidden sensitivity: ${sensitivity}`);
    }
    sensitivities.add(sensitivity);
  }
  if (policy.defaultTtl !== null) {
    assertSafeInteger(policy.defaultTtl, 'policy.defaultTtl', { positive: true });
  }
}

function assertMemoryTime(state, now) {
  assertSafeInteger(now, 'now');
  if (now < state.clock) throw new RangeError('now must not move the memory clock backward');
}

function assertMemoryWriteEvent(event) {
  for (const field of ['id', 'subject', 'key', 'value', 'scope', 'sourceRef', 'sensitivity']) {
    assertNonEmptyString(event[field], `event.${field}`);
  }
  assertFiniteNumber(event.confidence, 'event.confidence', { minimum: 0, maximum: 1 });
  if (event.ttl !== null) assertSafeInteger(event.ttl, 'event.ttl', { positive: true });
}

function cloneMemoryState(state, now) {
  return { clock: now, records: structuredClone(state.records) };
}

function memoryResult(state, action, reason) {
  return { state, action, reason };
}

function createMemoryRecord(event, policy, now) {
  const ttl = event.ttl ?? policy.defaultTtl;
  const expiresAt = ttl === null ? null : now + ttl;
  if (expiresAt !== null && !Number.isSafeInteger(expiresAt)) {
    throw new RangeError('memory expiry must be a safe integer');
  }
  return {
    id: event.id,
    subject: event.subject,
    key: event.key,
    value: event.value,
    scope: event.scope,
    sourceRef: event.sourceRef,
    confidence: event.confidence,
    sensitivity: event.sensitivity,
    observedAt: now,
    expiresAt,
    status: 'active',
    supersededBy: null,
    deletedAt: null,
  };
}

function isMemoryEffectiveAt(record, now) {
  return record.status === 'active'
    && (record.expiresAt === null || record.expiresAt > now);
}

export function applyMemoryEvent(state, event, policy, now) {
  const recordIds = assertMemoryState(state);
  assertPlainObject(event, 'event');
  assertMemoryPolicy(policy);
  assertMemoryTime(state, now);
  if (!MEMORY_EVENT_TYPES.has(event.type)) {
    throw new RangeError('event.type is not supported');
  }
  const nextState = cloneMemoryState(state, now);

  if (event.type === 'advance-time') {
    return memoryResult(nextState, 'advance-time', 'memory clock advanced');
  }

  if (event.type === 'delete') {
    assertNonEmptyString(event.targetId, 'event.targetId');
    const target = nextState.records.find(({ id }) => id === event.targetId);
    if (!target) throw new RangeError(`memory target not found: ${event.targetId}`);
    if (target.status === 'deleted') {
      return memoryResult(nextState, 'no-op', 'memory record is already deleted');
    }
    target.status = 'deleted';
    target.deletedAt = now;
    return memoryResult(nextState, 'delete', 'memory record deleted');
  }

  assertMemoryWriteEvent(event);
  if (recordIds.has(event.id)) throw new RangeError(`duplicate memory record ID: ${event.id}`);
  if (policy.forbiddenSensitivities.includes(event.sensitivity)) {
    return memoryResult(nextState, 'reject', 'memory sensitivity is forbidden by policy');
  }
  if (event.type === 'observe' && event.confidence < policy.minObserveConfidence) {
    return memoryResult(nextState, 'reject', 'observation confidence is below policy threshold');
  }

  if (event.type === 'correct') {
    assertNonEmptyString(event.targetId, 'event.targetId');
    const target = nextState.records.find(({ id }) => id === event.targetId);
    if (!target) throw new RangeError(`memory target not found: ${event.targetId}`);
    if (!isMemoryEffectiveAt(target, now)) {
      throw new RangeError('only an active, unexpired memory record can be corrected');
    }
    if (target.subject !== event.subject
      || target.key !== event.key
      || target.scope !== event.scope) {
      throw new RangeError('a correction must preserve subject, key, and scope');
    }
    target.status = 'superseded';
    target.supersededBy = event.id;
    nextState.records.push(createMemoryRecord(event, policy, now));
    return memoryResult(nextState, 'supersede', 'memory record corrected');
  }

  const duplicateValue = nextState.records.some((record) => (
    isMemoryEffectiveAt(record, now)
    && record.subject === event.subject
    && record.key === event.key
    && record.value === event.value
    && record.scope === event.scope
  ));
  if (duplicateValue) {
    return memoryResult(nextState, 'no-op', 'identical active memory already exists');
  }

  nextState.records.push(createMemoryRecord(event, policy, now));
  return memoryResult(nextState, 'store', 'memory record stored');
}

function memoryTerms(text) {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
}

export function recallMemory(state, query, now) {
  assertMemoryState(state);
  assertMemoryTime(state, now);
  assertPlainObject(query, 'query');
  assertNonEmptyString(query.subject, 'query.subject');
  assertNonEmptyString(query.scope, 'query.scope');
  assertNonEmptyString(query.text, 'query.text');
  const queryTerms = memoryTerms(query.text);
  if (queryTerms.size === 0) {
    throw new RangeError('query.text must contain at least one searchable term');
  }
  const recalled = [];
  const excluded = [];

  for (const record of state.records) {
    if (record.subject !== query.subject || record.scope !== query.scope) continue;
    if (!isMemoryEffectiveAt(record, now)) {
      const reason = record.status === 'superseded'
        ? 'superseded'
        : record.status === 'deleted'
          ? 'deleted'
          : 'expired';
      excluded.push({ id: record.id, reason });
      continue;
    }
    const searchableTerms = memoryTerms(`${record.key} ${record.value}`);
    const matches = [...queryTerms].filter((term) => searchableTerms.has(term)).length;
    const score = matches / queryTerms.size;
    if (score === 0) {
      excluded.push({ id: record.id, reason: 'no-match' });
      continue;
    }
    recalled.push({ ...structuredClone(record), score });
  }

  recalled.sort((left, right) => (
    right.score - left.score
    || right.observedAt - left.observedAt
    || compareText(left.id, right.id)
  ));
  const records = recalled.map(({ score: _score, ...record }) => record);
  return {
    records,
    projection: records.map(({ id, key, value, sourceRef }) => ({
      id, key, value, sourceRef,
    })),
    excluded,
  };
}
