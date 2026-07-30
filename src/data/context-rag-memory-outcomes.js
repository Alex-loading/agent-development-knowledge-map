function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  return Object.freeze(value);
}

const sections = {
  'context-01/five-information-objects': ['object-boundaries', 'projection'],
  'context-01/projection-pipeline': ['projection', 'evidence-provenance'],
  'context-01/scope-lifecycle-ownership': ['offloading', 'recoverability'],
  'context-02/context-engineering-budget': ['context-budget'],
  'context-02/two-overflow-modes': ['overflow-strategies', 'lossy-compaction', 'offloading'],
  'context-02/required-and-output-reserve': ['assembly-guards', 'context-budget'],
  'context-03/three-conversation-representations': ['conversation-representations'],
  'context-03/summary-is-lossy': ['lossy-compaction', 'recoverability'],
  'context-03/supersession-and-conflict': ['supersession', 'recoverability'],
  'context-04/separate-source-retrieval-and-citation-units': ['ingestion-pipeline', 'citation-units'],
  'context-04/chunk-by-structure-and-answer-needs': ['chunk-strategy', 'citation-units'],
  'context-04/propagate-version-permission-and-validity': ['version-acl-propagation'],
  'context-05/start-with-complementary-retrieval-signals': ['hybrid-retrieval'],
  'context-05/fuse-ranks-without-mixing-score-scales': ['rank-fusion', 'hybrid-retrieval'],
  'context-05/evaluate-methods-on-real-query-slices': ['ann-tradeoffs', 'retrieval-evaluation'],
  'context-06/turn-recalled-items-into-evidence-candidates': ['candidate-pipeline', 'reranking'],
  'context-06/select-diverse-evidence-under-a-budget': ['reranking', 'dedup-diversity'],
  'context-06/build-an-evidence-packet-and-citation-manifest': ['evidence-provenance', 'citation-grounding'],
  'context-07/separate-memory-from-history': ['memory-lifecycle'],
  'context-07/choose-write-path-and-admission': ['memory-admission', 'consent-boundary'],
  'context-07/expire-supersede-and-delete': ['memory-decay', 'ttl-expiry', 'memory-supersession', 'memory-deletion'],
  'context-08/separate-five-system-objects': ['integrated-architecture', 'rag-finetuning-memory'],
  'context-08/contract-source-through-index': ['graphrag-routing', 'knowledge-update'],
  'context-08/diagnose-by-layered-falsification': ['layered-diagnosis'],
};

const visuals = {
  'visual-context-01-object-map': ['object-boundaries', 'projection'],
  'visual-context-01-projection-lifecycle': ['projection', 'evidence-provenance'],
  'visual-context-01-offloading-boundary': ['offloading', 'recoverability'],
  'visual-context-02-token-budget': ['context-budget'],
  'visual-context-02-overflow-strategies': ['overflow-strategies', 'lossy-compaction', 'offloading'],
  'visual-context-02-injection-loss-guard': ['assembly-guards', 'context-budget'],
  'visual-context-03-event-state-summary': ['conversation-representations'],
  'visual-context-03-compaction-loss': ['lossy-compaction', 'recoverability'],
  'visual-context-03-recoverability-chain': ['supersession', 'recoverability'],
  'visual-context-04-ingestion-pipeline': ['ingestion-pipeline', 'citation-units'],
  'visual-context-04-chunk-strategies': ['chunk-strategy', 'citation-units'],
  'visual-context-04-version-acl-delete': ['version-acl-propagation'],
  'visual-context-05-hybrid-signals': ['hybrid-retrieval'],
  'visual-context-05-rrf-fusion': ['rank-fusion', 'hybrid-retrieval'],
  'visual-context-05-ann-tradeoff': ['ann-tradeoffs', 'retrieval-evaluation'],
  'visual-context-06-candidate-evidence-pipeline': ['candidate-pipeline', 'reranking'],
  'visual-context-06-rerank-dedup-diversity': ['reranking', 'dedup-diversity'],
  'visual-context-06-provenance-packing': ['evidence-provenance', 'citation-grounding'],
  'visual-context-07-memory-lifecycle': ['memory-lifecycle', 'memory-admission'],
  'visual-context-07-admission-conflict': ['memory-admission', 'consent-boundary'],
  'visual-context-07-decay-delete': ['memory-decay', 'ttl-expiry', 'memory-supersession', 'memory-deletion'],
  'visual-context-08-integrated-flow': ['integrated-architecture', 'rag-finetuning-memory'],
  'visual-context-08-graphrag-update-boundary': ['graphrag-routing', 'knowledge-update'],
  'visual-context-08-layered-diagnosis': ['layered-diagnosis'],
};

export const contextRagMemoryTeachingOutcomeRegistry = deepFreeze({
  sections,
  visuals,
});
