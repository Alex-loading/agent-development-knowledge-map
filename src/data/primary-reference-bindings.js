import { getPrimaryReference } from './primary-references.js';

const RESOURCE_ID = /^res-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_AUTHORITIES = new Set(['official', 'academic', 'expert', 'community']);
const VALID_ROLES = new Set(['core', 'cross-check', 'extension']);

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function createEvidence(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('evidence must be an object');
  }
  if (!VALID_AUTHORITIES.has(value.authority)) {
    throw new TypeError('evidence.authority is invalid');
  }
  if (!VALID_ROLES.has(value.role)) {
    throw new TypeError('evidence.role is invalid');
  }
  if (
    !Array.isArray(value.coverage)
    || value.coverage.length === 0
    || value.coverage.some((item) => typeof item !== 'string' || item.trim().length === 0)
  ) {
    throw new TypeError('evidence.coverage must contain non-empty strings');
  }
  requireNonEmptyString(value.limitations, 'evidence.limitations');
  if (typeof value.verifiedAt !== 'string' || !DATE.test(value.verifiedAt)) {
    throw new TypeError('evidence.verifiedAt must use YYYY-MM-DD');
  }
  return Object.freeze({
    authority: value.authority,
    role: value.role,
    coverage: Object.freeze([...value.coverage]),
    limitations: value.limitations,
    verifiedAt: value.verifiedAt,
  });
}

export function createPrimaryReferenceBinding(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Primary reference binding input must be an object');
  }
  const id = requireNonEmptyString(input.id, 'id');
  if (!RESOURCE_ID.test(id)) {
    throw new TypeError('id must be a globally unique course resource ID');
  }
  const canonicalSourceId = requireNonEmptyString(
    input.canonicalSourceId,
    'canonicalSourceId',
  );
  const source = getPrimaryReference(canonicalSourceId);
  if (!source) {
    throw new TypeError(`Unknown primary source: ${canonicalSourceId}`);
  }
  const stage = requireNonEmptyString(input.stage, 'stage');
  const difficulty = requireNonEmptyString(input.difficulty, 'difficulty');
  const value = requireNonEmptyString(input.value, 'value');
  const evidence = createEvidence(input.evidence);

  return Object.freeze({
    id,
    title: source.title,
    url: source.canonicalUrl,
    creator: source.publisherOrAuthor,
    platform: source.sourceFamily === 'feishu-harness-101' ? '飞书' : 'JavaGuide',
    language: '中文',
    type: '一级参考资料',
    difficulty,
    stage,
    value,
    canonicalSourceId: source.id,
    sourceFamily: source.sourceFamily,
    sourceTier: source.sourceTier,
    evidence,
  });
}
