import test from 'node:test';
import assert from 'node:assert/strict';

import * as backendModule from '../src/data/backend-engineering.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import { backendAssessmentTextEvidence } from './fixtures/backend-engineering-semantic-evidence.js';
import { backendPrimarySectionEvidence } from './fixtures/backend-engineering-primary-section-evidence.js';
import {
  backendSourceImpactDecisionEvidence,
  irrelevantBackendImpactMutation,
} from './fixtures/backend-engineering-source-impact-evidence.js';

const { backendEngineering } = backendModule;

const lessonIds = Array.from({ length: 8 }, (_, index) => (
  `backend-${String(index + 1).padStart(2, '0')}`
));

const primaryIntent = {
  'backend-01': [
    'primary-javaguide-llm-api-engineering',
    'primary-javaguide-structured-output-function-calling',
    'primary-feishu-tool-truth',
  ],
  'backend-02': [
    'primary-javaguide-llm-api-engineering',
    'primary-feishu-beyond-model',
  ],
  'backend-03': [
    'primary-javaguide-llm-gateway',
    'primary-feishu-beyond-model',
    'primary-feishu-virtual-filesystem',
  ],
  'backend-04': [
    'primary-javaguide-system-design-interview',
    'primary-feishu-dynamic-workflow',
  ],
  'backend-05': [
    'primary-javaguide-system-design-interview',
    'primary-feishu-company-brain',
  ],
  'backend-06': [
    'primary-feishu-dynamic-workflow',
    'primary-feishu-agent-version-drifting',
    'primary-feishu-tool-truth',
  ],
  'backend-07': [
    'primary-javaguide-llm-evaluation',
    'primary-feishu-dynamic-workflow',
    'primary-feishu-agent-install-md',
  ],
  'backend-08': [
    'primary-javaguide-system-design-interview',
    'primary-javaguide-llm-gateway',
    'primary-feishu-virtual-filesystem',
  ],
};

const lessonSpine = {
  'backend-01': [/client.*AI API.*provider.*tools.*storage/is, /requestId.*model.*prompt.*tool.*version/is, /schema.*error.*usage.*capability/is],
  'backend-02': [/同步.*JSON.*SSE.*异步.*轮询/s, /TTFT.*event.*buffer.*heartbeat/is, /disconnect.*cancel.*partial.*resume/is],
  'backend-03': [/concurrency.*queue.*deadline.*provider/is, /token.*budget.*admission.*backpressure.*load shedding/is, /retry.*shared.*capacity|重试.*同一.*容量/is],
  'backend-04': [/submit.*queue.*lease.*checkpoint.*progress.*cancel/is, /DLQ|dead.?letter/i, /replayable control.*external effect|可重放.*控制.*外部副作用/is],
  'backend-05': [/PostgreSQL.*object storage.*vector.*Redis/is, /cache key.*version.*TTL.*invalidation.*stampede/is, /authorization.*share|授权.*共享/is],
  'backend-06': [/retryable.*ambiguous.*permanent/is, /outbox.*inbox.*dedup.*lease.*reconcile/is, /exactly.once.*business invariant|exactly.once.*业务不变量/is],
  'backend-07': [/startup.*readiness.*liveness.*drain/is, /log.*trace.*metric.*token.*cost.*eval/is, /model.*prompt.*tool.*version.*high cardinality|模型.*Prompt.*tool.*版本.*高基数/is],
  'backend-08': [/stateless API.*stateful worker/is, /autoscal.*canary.*rollback.*migration.*failover.*regional/is, /overloaded.*slow.*wrong.*unsafe/is],
};

function assessmentText(assessment) {
  return [
    assessment.prompt, assessment.question, assessment.shortAnswer,
    assessment.explanation, ...(assessment.choices ?? []),
    ...(assessment.deepDive ?? []), ...(assessment.misconceptions ?? []),
    ...(assessment.followUps ?? []),
  ].filter(Boolean).join(' ');
}

function assessmentSatisfiesContract(assessment, contract) {
  const text = assessmentText(assessment);
  return new Set(assessment.conceptTags ?? []).size === Object.keys(contract).length
    && Object.keys(contract).every((tag) => assessment.conceptTags?.includes(tag))
    && Object.values(contract).every((patterns) => patterns.some((pattern) => pattern.test(text)));
}

function impactSatisfiesContract(decision, resolved, contract) {
  const sectionText = [
    resolved.section.title, ...resolved.section.paragraphs, ...resolved.section.keyPoints,
  ].join(' ');
  return resolved.lessonId === decision.lessonId
    && resolved.section.id === decision.sectionId
    && resolved.section.sourceIds.includes(decision.resourceId)
    && contract.targetPatterns.some((pattern) => pattern.test(JSON.stringify(resolved.value)))
    && contract.sectionPatterns.some((pattern) => pattern.test(sectionText))
    && contract.summaryPatterns.some((pattern) => pattern.test(decision.summary))
    && resolved.outcomes.assessments.length > 0
    && resolved.outcomes.visuals.length > 0
    && resolved.outcomes.visuals.map(({ id }) => id).join('|') === contract.visualIds.join('|');
}

test('preserves backend identities and all legacy learning objects', () => {
  assert.deepEqual(backendEngineering.lessons.map(({ id }) => id), lessonIds);
  assert.equal(
    backendEngineering.resources.filter(({ id }) => !id.startsWith('res-backend-primary-')).length,
    37,
  );
  assert.equal(backendEngineering.interviewQuestions.length, 24);
  assert.equal(backendEngineering.lessons.flatMap(({ quiz }) => quiz).length, 16);
  assert.deepEqual(
    backendEngineering.lessons.filter(({ exercise }) => exercise.experiment).map(({ id }) => id),
    ['backend-02', 'backend-03', 'backend-06'],
  );
});

test('binds the exact two-family primary intent through immutable canonical bindings', () => {
  const resources = new Map(backendEngineering.resources.map((resource) => [resource.id, resource]));
  const moduleFamilies = new Set();
  for (const [lessonId, canonicalIds] of Object.entries(primaryIntent)) {
    const lesson = backendEngineering.lessons.find(({ id }) => id === lessonId);
    const bound = lesson.resourceIds
      .map((id) => resources.get(id))
      .filter(({ canonicalSourceId }) => canonicalSourceId);
    assert.deepEqual(new Set(bound.map(({ canonicalSourceId }) => canonicalSourceId)), new Set(canonicalIds), lessonId);
    for (const resource of bound) moduleFamilies.add(resource.sourceFamily);
    for (const resource of bound) {
      assert.match(resource.id, /^res-backend-primary-/);
      assert.equal(resource.title, getPrimaryReference(resource.canonicalSourceId).title);
      assert.ok(Object.isFrozen(resource));
    }
  }
  assert.deepEqual(moduleFamilies, new Set(['javaguide-ai', 'feishu-harness-101']));
});

test('every lesson-bound primary source owns real independently anchored section text', () => {
  const observed = new Set();
  for (const lesson of backendEngineering.lessons) {
    const primaryIds = lesson.resourceIds.filter((id) => id.startsWith('res-backend-primary-'));
    assert.equal(primaryIds.length, primaryIntent[lesson.id].length, lesson.id);
    for (const resourceId of primaryIds) {
      const key = `${lesson.id}:${resourceId}`;
      const contract = backendPrimarySectionEvidence[key];
      assert.ok(contract, key);
      observed.add(key);
      const owner = lesson.knowledgeNote.sections.find(({ id }) => id === contract.sectionId);
      assert.ok(owner, key);
      assert.ok(owner.sourceIds.includes(resourceId), key);
      const text = [owner.title, ...owner.paragraphs, ...owner.keyPoints].join(' ');
      assert.ok(text.length >= 180, key);
      for (const pattern of contract.patterns) assert.match(text, pattern, `${key}: ${pattern}`);
    }
  }
  assert.deepEqual(observed, new Set(Object.keys(backendPrimarySectionEvidence)));
});

test('eight lessons teach the complete production backend spine', () => {
  for (const [lessonId, patterns] of Object.entries(lessonSpine)) {
    const lesson = backendEngineering.lessons.find(({ id }) => id === lessonId);
    const text = JSON.stringify(lesson.knowledgeNote);
    for (const pattern of patterns) assert.match(text, pattern, `${lessonId}: ${pattern}`);
  }
});

test('40 assessments carry independently evidenced concept tags', () => {
  const assessments = [
    ...backendEngineering.lessons.flatMap(({ quiz }) => quiz),
    ...backendEngineering.interviewQuestions,
  ];
  assert.equal(assessments.length, 40);
  assert.deepEqual(
    new Set(assessments.map(({ id }) => id)),
    new Set(Object.keys(backendAssessmentTextEvidence)),
  );
  for (const assessment of assessments) {
    const contract = backendAssessmentTextEvidence[assessment.id];
    assert.deepEqual(new Set(assessment.conceptTags), new Set(Object.keys(contract)), assessment.id);
    assert.equal(assessmentSatisfiesContract(assessment, contract), true, assessment.id);
  }
  const mutated = Object.fromEntries(Object.keys(backendAssessmentTextEvidence).map((id) => [
    id,
    { id, prompt: 'HTTP 缓存、浏览器 CSS 与静态页面部署。', conceptTags: ['http-cache'] },
  ]));
  assert.equal(Object.entries(mutated).some(([id, assessment]) => (
    assessmentSatisfiesContract(assessment, backendAssessmentTextEvidence[id])
  )), false, 'HTTP-only assessment mutation must not satisfy backend outcome contracts');
});

test('source impact decisions resolve to owned sections, outcomes, and independent summaries', () => {
  assert.deepEqual(
    new Set(backendEngineering.sourceImpactAudit.map(({ decisionId }) => decisionId)),
    new Set(Object.keys(backendSourceImpactDecisionEvidence)),
  );
  for (const decision of backendEngineering.sourceImpactAudit) {
    const contract = backendSourceImpactDecisionEvidence[decision.decisionId];
    assert.ok(['adopted', 'corrected', 'deepened'].includes(decision.contribution));
    const lesson = backendEngineering.lessons.find(({ id }) => id === decision.lessonId);
    const section = lesson.knowledgeNote.sections.find(({ id }) => id === decision.sectionId);
    assert.ok(lesson.resourceIds.includes(decision.resourceId));
    assert.ok(section.sourceIds.includes(decision.resourceId));
    assert.match(decision.targetId, /^claim:/);
    assert.ok(decision.summary.length >= 24);
    const resolved = backendModule.resolveBackendSourceImpactTarget(decision.targetId);
    assert.equal(resolved.lessonId, decision.lessonId);
    assert.equal(resolved.section.id, decision.sectionId);
    assert.ok(resolved.outcomes.assessments.length > 0);
    assert.ok(resolved.outcomes.visuals.length > 0);
    assert.equal(impactSatisfiesContract(decision, resolved, contract), true, decision.decisionId);

    const irrelevant = irrelevantBackendImpactMutation;
    assert.equal(impactSatisfiesContract(
      decision,
      { ...resolved, value: { text: irrelevant.text } },
      contract,
    ), false, `${decision.decisionId}: claim mutation`);
    assert.equal(impactSatisfiesContract(
      decision,
      { ...resolved, section: { ...resolved.section, paragraphs: [irrelevant.sectionText], keyPoints: [] } },
      contract,
    ), false, `${decision.decisionId}: section text mutation`);
    assert.equal(impactSatisfiesContract(
      decision,
      { ...resolved, section: { ...resolved.section, sourceIds: [] } },
      contract,
    ), false, `${decision.decisionId}: source ownership mutation`);
    assert.equal(impactSatisfiesContract(
      { ...decision, summary: irrelevant.summary }, resolved, contract,
    ), false, `${decision.decisionId}: summary mutation`);
  }
  assert.equal(
    Object.values(backendSourceImpactDecisionEvidence).some((contract) => (
      contract.targetPatterns.some((pattern) => pattern.test(irrelevantBackendImpactMutation.text))
      || contract.sectionPatterns.some((pattern) => pattern.test(irrelevantBackendImpactMutation.sectionText))
      || contract.summaryPatterns.some((pattern) => pattern.test(irrelevantBackendImpactMutation.summary))
    )),
    false,
  );
});
