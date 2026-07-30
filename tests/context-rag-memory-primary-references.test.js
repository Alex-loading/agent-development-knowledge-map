import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import * as contextData from '../src/data/context-rag-memory.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import {
  markLessonComplete,
  summarizeProgress,
} from '../src/core/progress.js';
import {
  readMarkdownTable,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const { contextRagMemory } = contextData;

const stableLessonIds = Object.freeze([
  'context-01',
  'context-02',
  'context-03',
  'context-04',
  'context-05',
  'context-06',
  'context-07',
  'context-08',
]);

const expectedCanonicalSourceIds = Object.freeze([
  'primary-feishu-company-brain',
  'primary-feishu-context-offloading',
  'primary-feishu-microcompact',
  'primary-feishu-virtual-filesystem',
  'primary-feishu-claude-ai-memory',
  'primary-feishu-beyond-model',
  'primary-feishu-tool-truth',
  'primary-javaguide-agent-memory',
  'primary-javaguide-context-engineering',
  'primary-javaguide-rag-basis',
  'primary-javaguide-rag-document-processing',
  'primary-javaguide-rag-vector-store',
  'primary-javaguide-rag-optimization',
  'primary-javaguide-rag-knowledge-update',
  'primary-javaguide-graphrag',
]);

const expectedPrimaryIntentByLesson = Object.freeze({
  'context-01': [
    'primary-javaguide-context-engineering',
    'primary-feishu-context-offloading',
    'primary-feishu-claude-ai-memory',
  ],
  'context-02': [
    'primary-javaguide-context-engineering',
    'primary-feishu-context-offloading',
    'primary-feishu-microcompact',
  ],
  'context-03': [
    'primary-feishu-microcompact',
    'primary-feishu-claude-ai-memory',
    'primary-javaguide-agent-memory',
  ],
  'context-04': [
    'primary-javaguide-rag-basis',
    'primary-javaguide-rag-document-processing',
    'primary-feishu-company-brain',
  ],
  'context-05': [
    'primary-javaguide-rag-vector-store',
    'primary-javaguide-rag-optimization',
  ],
  'context-06': [
    'primary-javaguide-rag-optimization',
    'primary-javaguide-rag-basis',
    'primary-feishu-tool-truth',
  ],
  'context-07': [
    'primary-javaguide-agent-memory',
    'primary-feishu-company-brain',
    'primary-feishu-virtual-filesystem',
  ],
  'context-08': [
    'primary-javaguide-graphrag',
    'primary-javaguide-rag-knowledge-update',
    'primary-feishu-company-brain',
  ],
});

const materialContributions = new Set(['adopted', 'corrected', 'deepened']);
const contributions = new Set([
  ...materialContributions,
  'rejected',
  'duplicate',
]);
const decisionScopes = new Set(['narrative', 'claim', 'media']);

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true, label);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

test('preserves Context lesson, quiz, interview, experiment and progress compatibility', () => {
  assert.equal(contextRagMemory.id, 'context-rag-memory');
  assert.deepEqual(contextRagMemory.lessons.map(({ id }) => id), stableLessonIds);
  assert.deepEqual(
    contextRagMemory.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    stableLessonIds.flatMap((lessonId) => [
      `quiz-${lessonId}-1`,
      `quiz-${lessonId}-2`,
    ]),
  );
  assert.deepEqual(
    contextRagMemory.interviewQuestions.map(({ id }) => id),
    stableLessonIds.flatMap((lessonId) => [
      `iq-${lessonId}-1`,
      `iq-${lessonId}-2`,
      `iq-${lessonId}-3`,
    ]),
  );
  assert.deepEqual(
    contextRagMemory.lessons
      .filter(({ exercise }) => exercise.experiment)
      .map(({ id, exercise }) => [id, exercise.experiment]),
    [
      ['context-02', 'context-router'],
      ['context-05', 'hybrid-retrieval'],
      ['context-07', 'memory-lifecycle'],
    ],
  );

  let progress = {
    completedLessonIds: ['context-01', 'context-03', 'legacy-lesson'],
    interviewStatusById: {},
  };
  progress = markLessonComplete(progress, 'context-08');
  assert.deepEqual(
    summarizeProgress(
      progress,
      stableLessonIds,
      contextRagMemory.interviewQuestions,
    ),
    {
      lessonsCompleted: 3,
      lessonPercent: 38,
      interviewsMastered: 0,
      interviewPercent: 0,
    },
  );
});

test('binds the frozen Feishu and JavaGuide Context narratives through one authority', () => {
  const primaryResources = contextRagMemory.resources.filter(
    ({ sourceTier }) => sourceTier === 'primary-narrative',
  );
  assert.deepEqual(
    primaryResources.map(({ canonicalSourceId }) => canonicalSourceId),
    expectedCanonicalSourceIds,
  );
  assert.deepEqual(
    [...new Set(primaryResources.map(({ sourceFamily }) => sourceFamily))].sort(),
    ['feishu-harness-101', 'javaguide-ai'],
  );

  for (const resource of primaryResources) {
    const canonical = getPrimaryReference(resource.canonicalSourceId);
    assert.ok(canonical, resource.id);
    assert.equal(resource.title, canonical.title, resource.id);
    assert.equal(resource.url, canonical.canonicalUrl, resource.id);
    assert.equal(resource.source, canonical.publisherOrAuthor, resource.id);
    assert.equal(resource.sourceTier, canonical.sourceTier, resource.id);
    assert.equal(resource.sourceFamily, canonical.sourceFamily, resource.id);
    assert.match(resource.id, /^res-context-primary-(?:feishu|javaguide)-/);
    assert.equal(resource.evidence.verifiedAt, '2026-07-30', resource.id);
    assert.equal(typeof resource.evidence.learningUse, 'string', resource.id);
    assert.ok(resource.evidence.learningUse.length >= 20, resource.id);
    assert.equal(
      resource.value,
      `学习用途：${resource.evidence.learningUse}`
        + `；覆盖范围：${resource.evidence.coverage.join('、')}`
        + `；证据边界：${resource.evidence.limitations}`,
      `${resource.id}: value must derive from structured evidence`,
    );
    if (resource.sourceFamily === 'feishu-harness-101') {
      assert.equal(resource.evidence.authority, 'expert', resource.id);
      assert.match(
        resource.evidence.limitations,
        /观察|叙事|逆向|教学/,
        `${resource.id}: implementation observations must be labeled`,
      );
      assert.match(
        resource.evidence.limitations,
        /不(?:代表|构成|保证|等于).*?(?:产品|协议|安全|权限|实现)/,
        `${resource.id}: product and permission limits must be explicit`,
      );
    }
  }
});

test('binds the approved primary intent map and keeps every section source lesson-scoped', () => {
  const resourcesById = new Map(
    contextRagMemory.resources.map((resource) => [resource.id, resource]),
  );

  for (const lesson of contextRagMemory.lessons) {
    const primaryCanonicalIds = lesson.resourceIds
      .map((id) => resourcesById.get(id))
      .filter(({ sourceTier }) => sourceTier === 'primary-narrative')
      .map(({ canonicalSourceId }) => canonicalSourceId);
    for (const canonicalSourceId of expectedPrimaryIntentByLesson[lesson.id]) {
      assert.ok(
        primaryCanonicalIds.includes(canonicalSourceId),
        `${lesson.id}: missing ${canonicalSourceId}`,
      );
    }
    assert.ok(
      lesson.knowledgeNote.sections.some(({ sourceIds }) => (
        sourceIds.some((id) => resourcesById.get(id)?.sourceTier === 'primary-narrative')
      )),
      `${lesson.id}: note needs a primary narrative`,
    );

    for (const section of lesson.knowledgeNote.sections) {
      assert.ok(section.sourceIds.length > 0, `${lesson.id}/${section.id}`);
      for (const sourceId of section.sourceIds) {
        assert.ok(resourcesById.has(sourceId), `${lesson.id}/${section.id}/${sourceId}`);
        assert.ok(
          lesson.resourceIds.includes(sourceId),
          `${lesson.id}/${section.id}/${sourceId}: outside lesson resources`,
        );
      }
      const copy = section.paragraphs.join(' ');
      if (/(?:OpenAI|Claude|LangGraph|API|产品|权限|安全|AgentFS)/i.test(copy)) {
        assert.ok(
          section.sourceIds.some(
            (id) => resourcesById.get(id)?.evidence?.authority === 'official',
          ),
          `${lesson.id}/${section.id}: volatile product/security claims need official verification`,
        );
      }
    }
  }
});

test('publishes independent scoped claims and material source-impact decisions', () => {
  const resourcesById = new Map(
    contextRagMemory.resources.map((resource) => [resource.id, resource]),
  );
  const claimIds = new Set();
  const decisionIds = new Set();

  assert.ok(Array.isArray(contextRagMemory.sourceImpactClaims));
  assert.ok(contextRagMemory.sourceImpactClaims.length >= stableLessonIds.length);
  assert.equal(typeof contextData.resolveSourceImpactClaim, 'function');
  for (const claim of contextRagMemory.sourceImpactClaims) {
    assert.deepEqual(Object.keys(claim), [
      'id',
      'lessonId',
      'sectionId',
      'statement',
      'sourceIds',
    ]);
    assert.match(claim.id, /^[a-z0-9]+(?:-[a-z0-9]+)+$/);
    assert.ok(!claimIds.has(claim.id), claim.id);
    claimIds.add(claim.id);
    const lesson = contextRagMemory.lessons.find(({ id }) => id === claim.lessonId);
    const section = lesson?.knowledgeNote.sections.find(({ id }) => id === claim.sectionId);
    assert.ok(section, `${claim.id}: unresolved owner`);
    assert.ok(claim.statement.length >= 20, claim.id);
    assert.ok(claim.sourceIds.length > 0, claim.id);
    for (const sourceId of claim.sourceIds) {
      assert.ok(resourcesById.has(sourceId), `${claim.id}: ${sourceId}`);
      assert.ok(lesson.resourceIds.includes(sourceId), `${claim.id}: lesson source`);
      assert.ok(section.sourceIds.includes(sourceId), `${claim.id}: section source`);
    }
    assert.equal(
      contextData.resolveSourceImpactClaim(`claim:${claim.id}`),
      claim,
      `${claim.id}: resolver identity`,
    );
  }

  for (const decision of contextRagMemory.sourceImpactAudit) {
    assert.deepEqual(Object.keys(decision), [
      'decisionId',
      'lessonId',
      'resourceId',
      'scope',
      'targetId',
      'contribution',
      'summary',
      'rationale',
    ]);
    assert.match(decision.decisionId, /^impact-context-\d{2}-[a-z0-9-]+$/);
    assert.ok(!decisionIds.has(decision.decisionId), decision.decisionId);
    decisionIds.add(decision.decisionId);
    assert.ok(decisionScopes.has(decision.scope), decision.decisionId);
    assert.ok(contributions.has(decision.contribution), decision.decisionId);
    assert.ok(decision.summary.length >= 20, decision.decisionId);
    assert.ok(decision.rationale.length >= 20, decision.decisionId);
    const lesson = contextRagMemory.lessons.find(({ id }) => id === decision.lessonId);
    assert.ok(lesson.resourceIds.includes(decision.resourceId), decision.decisionId);
    if (decision.scope === 'claim') {
      const claim = contextData.resolveSourceImpactClaim(decision.targetId);
      assert.equal(claim.lessonId, decision.lessonId, decision.decisionId);
      assert.ok(claim.sourceIds.includes(decision.resourceId), decision.decisionId);
    }
  }

  for (const lessonId of stableLessonIds) {
    assert.ok(
      contextRagMemory.sourceImpactAudit.some((decision) => (
        decision.lessonId === lessonId
        && ['narrative', 'claim'].includes(decision.scope)
        && materialContributions.has(decision.contribution)
      )),
      `${lessonId}: missing material contribution`,
    );
  }
});

test('keeps the Markdown source-impact ledger in exact parity with machine decisions', async () => {
  const audit = await readFile(
    new URL(
      '../docs/content-audits/2026-07-30-context-rag-memory-primary-reference-reconstruction.md',
      import.meta.url,
    ),
    'utf8',
  );
  const markdownDecisions = readMarkdownTable(audit, [
    'decisionId',
    'lessonId',
    'resourceId',
    'scope',
    'targetId',
    'contribution',
    'summary',
    'rationale',
  ]).map((row, index) => ({
    decisionId: unwrapSingleCodeSpan(row[0], `decision ${index} ID`),
    lessonId: unwrapSingleCodeSpan(row[1], `decision ${index} lesson`),
    resourceId: unwrapSingleCodeSpan(row[2], `decision ${index} resource`),
    scope: unwrapSingleCodeSpan(row[3], `decision ${index} scope`),
    targetId: unwrapSingleCodeSpan(row[4], `decision ${index} target`),
    contribution: unwrapSingleCodeSpan(row[5], `decision ${index} contribution`),
    summary: row[6],
    rationale: row[7],
  }));
  assert.deepEqual(markdownDecisions, contextRagMemory.sourceImpactAudit);
});

test('keeps reconstructed Context resources and impact registries globally unique and frozen', () => {
  const resourceIds = contextRagMemory.resources.map(({ id }) => id);
  const allIds = [
    ...contextRagMemory.lessons.map(({ id }) => id),
    ...resourceIds,
    ...contextRagMemory.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...contextRagMemory.interviewQuestions.map(({ id }) => id),
    ...contextRagMemory.sourceImpactClaims.map(({ id }) => id),
  ];
  assert.equal(new Set(resourceIds).size, resourceIds.length);
  assert.equal(new Set(allIds).size, allIds.length);
  assertDeepFrozen(contextRagMemory, 'contextRagMemory');
});
