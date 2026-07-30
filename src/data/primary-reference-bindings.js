import { getPrimaryReference } from './primary-references.js';

const RESOURCE_ID = /^res-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_AUTHORITIES = new Set(['official', 'academic', 'expert', 'community']);
const VALID_ROLES = new Set(['core', 'cross-check', 'extension']);

function requirePlainRecord(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain record`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain record`);
  }
  return value;
}

function readOwnDataProperty(record, key, label, { optional = false } = {}) {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  if (!descriptor) {
    if (optional) return undefined;
    throw new TypeError(`${label} must be an own data property`);
  }
  if (!Object.hasOwn(descriptor, 'value')) {
    throw new TypeError(`${label} must be an own data property`);
  }
  return descriptor.value;
}

function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function copyDenseNativeStringArray(value, label) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new TypeError(`${label} must be a native array`);
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, 'value')) {
    throw new TypeError(`${label}.length must be an own data property`);
  }
  const { value: length } = lengthDescriptor;
  if (!Number.isSafeInteger(length) || length <= 0) {
    throw new TypeError(`${label} must contain non-empty strings`);
  }

  const ownKeys = Reflect.ownKeys(value);
  for (let ownKeyIndex = 0; ownKeyIndex < ownKeys.length; ownKeyIndex += 1) {
    const key = ownKeys[ownKeyIndex];
    if (key === 'length') continue;
    const index = typeof key === 'string' ? Number(key) : Number.NaN;
    if (
      !Number.isSafeInteger(index)
      || index < 0
      || index >= length
      || String(index) !== key
    ) {
      throw new TypeError(`${label} has unexpected own properties`);
    }
  }

  const copy = new Array(length);
  for (let index = 0; index < length; index += 1) {
    const itemDescriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!itemDescriptor || !Object.hasOwn(itemDescriptor, 'value')) {
      throw new TypeError(`${label}[${index}] must be an own data property`);
    }
    const item = requireNonEmptyString(
      itemDescriptor.value,
      `${label}[${index}]`,
    );
    Object.defineProperty(copy, String(index), {
      configurable: true,
      enumerable: true,
      value: item,
      writable: true,
    });
  }
  return Object.freeze(copy);
}

function createEvidence(value) {
  const evidence = requirePlainRecord(value, 'evidence');
  const authority = readOwnDataProperty(
    evidence,
    'authority',
    'evidence.authority',
  );
  const role = readOwnDataProperty(evidence, 'role', 'evidence.role');
  const coverage = readOwnDataProperty(
    evidence,
    'coverage',
    'evidence.coverage',
  );
  const learningUseValue = readOwnDataProperty(
    evidence,
    'learningUse',
    'evidence.learningUse',
    { optional: true },
  );
  const limitations = readOwnDataProperty(
    evidence,
    'limitations',
    'evidence.limitations',
  );
  const verifiedAt = readOwnDataProperty(
    evidence,
    'verifiedAt',
    'evidence.verifiedAt',
  );

  if (!VALID_AUTHORITIES.has(authority)) {
    throw new TypeError('evidence.authority is invalid');
  }
  if (!VALID_ROLES.has(role)) {
    throw new TypeError('evidence.role is invalid');
  }
  const coverageCopy = copyDenseNativeStringArray(coverage, 'evidence.coverage');
  const learningUse = learningUseValue === undefined
    ? undefined
    : requireNonEmptyString(learningUseValue, 'evidence.learningUse');
  requireNonEmptyString(limitations, 'evidence.limitations');
  if (!isValidCalendarDate(verifiedAt)) {
    throw new TypeError('evidence.verifiedAt must be a real YYYY-MM-DD date');
  }
  return Object.freeze({
    authority,
    role,
    ...(learningUse === undefined ? {} : { learningUse }),
    coverage: coverageCopy,
    limitations,
    verifiedAt,
  });
}

export function createPrimaryReferenceBinding(input) {
  const bindingInput = requirePlainRecord(
    input,
    'Primary reference binding input',
  );
  const id = requireNonEmptyString(
    readOwnDataProperty(bindingInput, 'id', 'id'),
    'id',
  );
  if (!RESOURCE_ID.test(id)) {
    throw new TypeError('id must be a globally unique course resource ID');
  }
  const canonicalSourceId = requireNonEmptyString(
    readOwnDataProperty(
      bindingInput,
      'canonicalSourceId',
      'canonicalSourceId',
    ),
    'canonicalSourceId',
  );
  const source = getPrimaryReference(canonicalSourceId);
  if (!source) {
    throw new TypeError(`Unknown primary source: ${canonicalSourceId}`);
  }
  const stage = requireNonEmptyString(
    readOwnDataProperty(bindingInput, 'stage', 'stage'),
    'stage',
  );
  const difficulty = requireNonEmptyString(
    readOwnDataProperty(bindingInput, 'difficulty', 'difficulty'),
    'difficulty',
  );
  const value = requireNonEmptyString(
    readOwnDataProperty(bindingInput, 'value', 'value'),
    'value',
  );
  const evidence = createEvidence(
    readOwnDataProperty(bindingInput, 'evidence', 'evidence'),
  );

  return Object.freeze({
    id,
    title: source.title,
    url: source.canonicalUrl,
    source: source.publisherOrAuthor,
    creator: source.publisherOrAuthor,
    platform: source.sourceFamily === 'feishu-harness-101' ? '飞书' : 'JavaGuide',
    language: '中文',
    type: '一级参考资料',
    difficulty,
    stage,
    value,
    verifiedAt: evidence.verifiedAt,
    canonicalSourceId: source.id,
    sourceFamily: source.sourceFamily,
    sourceTier: source.sourceTier,
    evidence,
  });
}
