import test from 'node:test';
import assert from 'node:assert/strict';

import { agentHarness } from '../src/data/agent-harness.js';
import { getPrimaryReference } from '../src/data/primary-references.js';

const stableLessonIds = Object.freeze([
  'harness-01',
  'harness-02',
  'harness-03',
  'harness-04',
  'harness-05',
  'harness-06',
  'harness-07',
  'harness-08',
]);

const expectedCanonicalSourceIds = Object.freeze([
  'primary-feishu-react-loop',
  'primary-feishu-beyond-model',
  'primary-feishu-loop-engineering-intro',
  'primary-feishu-react-orchestration',
  'primary-feishu-dynamic-workflow',
  'primary-feishu-agent-version-drifting',
  'primary-feishu-tool-truth',
  'primary-feishu-company-brain',
  'primary-feishu-context-offloading',
  'primary-feishu-microcompact',
  'primary-feishu-virtual-filesystem',
  'primary-feishu-claude-code-tools',
  'primary-feishu-claude-ai-memory',
  'primary-feishu-autonomous-evolution',
  'primary-feishu-agent-install-md',
  'primary-javaguide-agent-basis',
  'primary-javaguide-harness-engineering',
  'primary-javaguide-agent-skills',
  'primary-javaguide-mcp',
  'primary-javaguide-workflow-graph-loop',
  'primary-javaguide-loop-engineering',
  'primary-javaguide-context-engineering',
  'primary-javaguide-ai-application-architecture',
]);

const expectedExerciseExperiments = Object.freeze([
  ['harness-01', 'run-lifecycle'],
  ['harness-06', 'retry-resume'],
  ['harness-07', 'queue-backpressure'],
]);

const materialImpactKinds = new Set(['adopted', 'corrected', 'deepened']);
const impactKinds = new Set([
  ...materialImpactKinds,
  'rejected',
  'duplicate',
]);

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true, label);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

test('preserves Harness lesson, quiz, interview and experiment compatibility', () => {
  assert.equal(agentHarness.id, 'agent-harness');
  assert.deepEqual(agentHarness.lessons.map(({ id }) => id), stableLessonIds);
  assert.deepEqual(
    agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    stableLessonIds.flatMap((lessonId) => [
      `quiz-${lessonId}-1`,
      `quiz-${lessonId}-2`,
    ]),
  );
  assert.deepEqual(
    agentHarness.interviewQuestions.map(({ id }) => id),
    stableLessonIds.flatMap((lessonId) => [
      `iq-${lessonId}-1`,
      `iq-${lessonId}-2`,
      `iq-${lessonId}-3`,
    ]),
  );
  assert.deepEqual(
    agentHarness.lessons
      .filter(({ exercise }) => exercise.experiment)
      .map(({ id, exercise }) => [id, exercise.experiment]),
    expectedExerciseExperiments,
  );
});

test('binds the frozen Feishu and JavaGuide narratives through the shared factory', () => {
  const primaryResources = agentHarness.resources.filter(
    ({ sourceTier }) => sourceTier === 'primary-narrative',
  );
  assert.equal(primaryResources.length, expectedCanonicalSourceIds.length);
  assert.deepEqual(
    primaryResources.map(({ canonicalSourceId }) => canonicalSourceId),
    expectedCanonicalSourceIds,
  );
  assert.equal(
    primaryResources.filter(({ sourceFamily }) => sourceFamily === 'feishu-harness-101').length,
    15,
  );
  assert.equal(
    primaryResources.filter(({ sourceFamily }) => sourceFamily === 'javaguide-ai').length,
    8,
  );

  for (const resource of primaryResources) {
    const canonical = getPrimaryReference(resource.canonicalSourceId);
    assert.ok(canonical, resource.id);
    assert.equal(resource.title, canonical.title, resource.id);
    assert.equal(resource.url, canonical.canonicalUrl, resource.id);
    assert.equal(resource.source, canonical.publisherOrAuthor, resource.id);
    assert.equal(resource.sourceTier, canonical.sourceTier, resource.id);
    assert.equal(resource.sourceFamily, canonical.sourceFamily, resource.id);
    assert.match(resource.id, /^res-harness-primary-(?:feishu|javaguide)-/);
    assert.match(resource.value, /学习用途[：:]/, resource.id);
    assert.match(resource.value, /证据边界[：:]/, resource.id);
    assert.equal(resource.evidence.verifiedAt, '2026-07-30', resource.id);
    if (resource.sourceFamily === 'feishu-harness-101') {
      assert.equal(resource.evidence.authority, 'expert', resource.id);
      assert.match(
        resource.evidence.limitations,
        /教学|观察|叙事|推演/,
        `${resource.id}: must identify the teaching-observation boundary`,
      );
      assert.match(
        resource.evidence.limitations,
        /不(?:代表|构成|保证|等于).*?(?:产品|协议|运行时|行业|安全)/,
        `${resource.id}: must reject product/protocol guarantees`,
      );
    }
  }
});

test('binds primary narratives to every lesson and resolves every section source', () => {
  const resourcesById = new Map(
    agentHarness.resources.map((resource) => [resource.id, resource]),
  );
  const primaryFamilies = new Set(
    agentHarness.resources
      .filter(({ sourceTier }) => sourceTier === 'primary-narrative')
      .map(({ sourceFamily }) => sourceFamily),
  );
  assert.deepEqual(
    [...primaryFamilies].sort(),
    ['feishu-harness-101', 'javaguide-ai'],
  );

  for (const lesson of agentHarness.lessons) {
    const boundResources = lesson.resourceIds.map((id) => resourcesById.get(id));
    assert.ok(
      boundResources.some(({ sourceTier }) => sourceTier === 'primary-narrative'),
      `${lesson.id}: requires a primary narrative`,
    );
    assert.ok(
      boundResources.some(({ evidence }) => evidence?.authority === 'official'),
      `${lesson.id}: keeps an official verification source`,
    );
    assert.ok(
      lesson.knowledgeNote.sections.some(({ sourceIds }) => (
        sourceIds.some((id) => resourcesById.get(id)?.sourceTier === 'primary-narrative')
      )),
      `${lesson.id}: note must materially use primary narratives`,
    );

    for (const section of lesson.knowledgeNote.sections) {
      assert.ok(section.sourceIds.length > 0, `${lesson.id}/${section.id}`);
      for (const sourceId of section.sourceIds) {
        assert.ok(
          lesson.resourceIds.includes(sourceId),
          `${lesson.id}/${section.id}/${sourceId}: outside lesson resources`,
        );
        assert.ok(
          resourcesById.get(sourceId)?.evidence,
          `${lesson.id}/${section.id}/${sourceId}: missing evidence`,
        );
      }
      const copy = section.paragraphs.join(' ');
      if (/(?:OpenAI|Claude|LangGraph|Temporal|MCP|SDK|API|协议|产品)/i.test(copy)) {
        assert.ok(
          section.sourceIds.some(
            (id) => resourcesById.get(id)?.evidence?.authority === 'official',
          ),
          `${lesson.id}/${section.id}: product or protocol claims need official verification`,
        );
      }
    }
  }
});

test('publishes a material, enum-safe source-impact audit row for every lesson', () => {
  assert.ok(Array.isArray(agentHarness.sourceImpactAudit));
  for (const row of agentHarness.sourceImpactAudit) {
    assert.ok(stableLessonIds.includes(row.lessonId), row.lessonId);
    assert.ok(impactKinds.has(row.impact), `${row.lessonId}: ${row.impact}`);
    assert.ok(
      agentHarness.resources.some(({ id }) => id === row.sourceId),
      `${row.lessonId}: unknown source ${row.sourceId}`,
    );
    assert.ok(typeof row.summary === 'string' && row.summary.length >= 20);
    assert.ok(typeof row.boundary === 'string' && row.boundary.length >= 20);
  }
  for (const lessonId of stableLessonIds) {
    assert.ok(
      agentHarness.sourceImpactAudit.some(
        (row) => row.lessonId === lessonId && materialImpactKinds.has(row.impact),
      ),
      `${lessonId}: requires an adopted, corrected or deepened contribution`,
    );
  }
});

test('keeps resource IDs globally unique and the reconstructed data deeply frozen', () => {
  const resourceIds = agentHarness.resources.map(({ id }) => id);
  const allIds = [
    ...agentHarness.lessons.map(({ id }) => id),
    ...resourceIds,
    ...agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...agentHarness.interviewQuestions.map(({ id }) => id),
  ];
  assert.equal(new Set(resourceIds).size, resourceIds.length);
  assert.equal(new Set(allIds).size, allIds.length);
  assertDeepFrozen(agentHarness, 'agentHarness');
});
