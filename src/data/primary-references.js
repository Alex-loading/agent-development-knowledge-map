import { primaryReferenceSnapshot } from './primary-reference-snapshot.generated.js';

export const PRIMARY_SOURCE_FAMILIES = Object.freeze([
  'feishu-harness-101',
  'javaguide-ai',
]);

function createPrimaryReference(record) {
  return Object.freeze({
    id: record.id,
    title: record.title,
    canonicalUrl: record.canonicalUrl,
    sourceFamily: record.sourceFamily,
    sourceTier: record.sourceTier,
    publisherOrAuthor: record.publisherOrAuthor,
    bodyAccess: record.bodyAccess,
    retrievedAt: record.retrievedAt,
    updatedAt: record.updatedAt,
    contentHash: record.contentHash,
    mediaDecision: record.mediaDecision,
  });
}

export const primaryReferences = Object.freeze(
  primaryReferenceSnapshot.map(createPrimaryReference),
);

const primaryReferenceById = new Map(
  primaryReferences.map((source) => [source.id, source]),
);

export function getPrimaryReference(id) {
  return typeof id === 'string' ? primaryReferenceById.get(id) ?? null : null;
}
