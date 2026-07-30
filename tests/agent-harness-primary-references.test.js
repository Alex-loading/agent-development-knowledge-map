import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import * as agentHarnessData from '../src/data/agent-harness.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import { agentHarnessVisuals } from '../src/data/visuals/agent-harness-visuals.js';
import {
  readMarkdownTable,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const { agentHarness } = agentHarnessData;

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

test('binds the frozen Feishu and JavaGuide narratives through one structured authority', async () => {
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
    assert.equal(typeof resource.evidence.learningUse, 'string', resource.id);
    assert.ok(resource.evidence.learningUse.length >= 20, resource.id);
    assert.equal(
      resource.value,
      `学习用途：${resource.evidence.learningUse}`
        + `；覆盖范围：${resource.evidence.coverage.join('、')}`
        + `；证据边界：${resource.evidence.limitations}`,
      `${resource.id}: rendered value must derive from structured evidence`,
    );
    assert.equal(Object.hasOwn(resource.evidence, 'use'), false, resource.id);
    assert.equal(Object.hasOwn(resource.evidence, 'boundary'), false, resource.id);
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

  const source = await readFile(
    new URL('../src/data/agent-harness.js', import.meta.url),
    'utf8',
  );
  const bindingSource = source.slice(
    source.indexOf('function primaryBinding'),
    source.indexOf('const lessons ='),
  );
  assert.doesNotMatch(
    bindingSource,
    /^\s*(?:use|boundary)(?:\s*[:,]|\s*$)/m,
    'primary binding inputs must not retain obsolete use/boundary keys',
  );
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

test('grounds the MCP protocol section in the versioned official MCP specification', () => {
  const lesson = agentHarness.lessons.find(({ id }) => id === 'harness-03');
  const section = lesson.knowledgeNote.sections.find(
    ({ id }) => id === 'separate-model-catalog-from-host-registry',
  );
  const resourcesById = new Map(
    agentHarness.resources.map((resource) => [resource.id, resource]),
  );
  const officialMcpSources = section.sourceIds
    .map((sourceId) => resourcesById.get(sourceId))
    .filter((resource) => (
      resource?.evidence?.authority === 'official'
      && /^https:\/\/modelcontextprotocol\.io\/specification\/\d{4}-\d{2}-\d{2}\//.test(
        resource.url,
      )
      && /Model Context Protocol|MCP/i.test([
        resource.title,
        resource.source,
        ...resource.evidence.coverage,
      ].join(' '))
    ));

  assert.equal(officialMcpSources.length, 1,
    'MCP protocol claims need one MCP-specific official specification source');
  const [mcpSource] = officialMcpSources;
  assert.equal(mcpSource.id, 'res-harness-mcp-tools-spec');
  assert.ok(lesson.resourceIds.includes(mcpSource.id));
  assert.equal(
    mcpSource.url,
    'https://modelcontextprotocol.io/specification/2025-11-25/server/tools',
  );
  assert.equal(mcpSource.source, 'Model Context Protocol');
  assert.equal(mcpSource.platform, 'modelcontextprotocol.io');
  const coverage = mcpSource.evidence.coverage.join(' ');
  for (const requiredClaim of [
    /tools capability/i,
    /tools\/list/i,
    /tools\/call/i,
    /client/i,
    /server/i,
    /model-controlled/i,
  ]) {
    assert.match(coverage, requiredClaim);
  }
  assert.match(mcpSource.evidence.limitations, /2025-11-25/);
  assert.equal(mcpSource.verifiedAt, '2026-07-31');
  assert.equal(mcpSource.evidence.verifiedAt, '2026-07-31');

  const sectionCopy = section.paragraphs.join(' ');
  for (const requiredSectionClaim of [
    /2025-11-25 Tools 规范/,
    /tools capability/,
    /tools\/list/,
    /tools\/call/,
    /model-controlled/,
    /不规定应用交互模型/,
    /不替代应用授权/,
  ]) {
    assert.match(sectionCopy, requiredSectionClaim);
  }

  const governanceVisual = agentHarnessVisuals.find(
    ({ id }) => id === 'visual-harness-03-tool-governance',
  );
  assert.ok(governanceVisual.sourceIds.includes(mcpSource.id));
});

test('publishes unique scoped source-impact decisions with resolvable targets', async () => {
  const inventory = await readFile(
    new URL('../docs/research/2026-07-30-agent-harness-visual-inventory.md', import.meta.url),
    'utf8',
  );
  const mediaCandidateRows = readMarkdownTable(inventory, [
    'mediaCandidateId',
    'lessonId',
    'resourceId',
    'decisionId',
    'status',
  ]).map((row, index) => ({
    mediaCandidateId: unwrapSingleCodeSpan(row[0], `media candidate ${index} ID`),
    lessonId: unwrapSingleCodeSpan(row[1], `media candidate ${index} lesson`),
    resourceId: unwrapSingleCodeSpan(row[2], `media candidate ${index} resource`),
    decisionId: unwrapSingleCodeSpan(row[3], `media candidate ${index} decision`),
    status: unwrapSingleCodeSpan(row[4], `media candidate ${index} status`),
  }));
  const mediaCandidatesById = new Map(
    mediaCandidateRows.map((row) => [row.mediaCandidateId, row]),
  );
  assert.equal(mediaCandidatesById.size, mediaCandidateRows.length);
  const resourcesById = new Map(
    agentHarness.resources.map((resource) => [resource.id, resource]),
  );
  const visualsById = new Map(
    agentHarnessVisuals.map((visual) => [visual.id, visual]),
  );
  const decisionIds = new Set();

  assert.ok(Array.isArray(agentHarness.sourceImpactAudit));
  for (const decision of agentHarness.sourceImpactAudit) {
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
    assert.match(decision.decisionId, /^impact-harness-\d{2}-[a-z0-9-]+$/);
    assert.ok(!decisionIds.has(decision.decisionId), decision.decisionId);
    decisionIds.add(decision.decisionId);
    assert.ok(stableLessonIds.includes(decision.lessonId), decision.lessonId);
    assert.ok(decisionScopes.has(decision.scope), `${decision.decisionId}: ${decision.scope}`);
    assert.ok(contributions.has(decision.contribution),
      `${decision.decisionId}: ${decision.contribution}`);
    assert.match(decision.targetId, /^(?:section|claim|visual|asset|media-candidate):\S+$/);
    assert.ok(typeof decision.summary === 'string' && decision.summary.length >= 20);
    assert.ok(typeof decision.rationale === 'string' && decision.rationale.length >= 20);

    const lesson = agentHarness.lessons.find(({ id }) => id === decision.lessonId);
    const resource = resourcesById.get(decision.resourceId);
    assert.ok(resource, `${decision.decisionId}: unknown resource ${decision.resourceId}`);
    assert.ok(
      lesson.resourceIds.includes(resource.id),
      `${decision.decisionId}: ${resource.id} is outside ${lesson.id}`,
    );

    const [targetKind, targetValue] = decision.targetId.split(/:(.+)/);
    if (targetKind === 'section') {
      assert.ok(
        lesson.knowledgeNote.sections.some(({ id }) => id === targetValue),
        `${decision.decisionId}: unknown section ${targetValue}`,
      );
    } else if (targetKind === 'visual') {
      const visual = visualsById.get(targetValue);
      assert.ok(visual, `${decision.decisionId}: unknown visual ${targetValue}`);
      assert.match(visual.id, new RegExp(`^visual-${lesson.id}-`));
    } else if (targetKind === 'asset') {
      await access(new URL(`../${targetValue}`, import.meta.url));
    } else if (targetKind === 'media-candidate') {
      assert.ok(mediaCandidatesById.has(targetValue),
        `${decision.decisionId}: undeclared media candidate ${targetValue}`);
      assert.deepEqual(
        mediaCandidatesById.get(targetValue),
        {
          mediaCandidateId: targetValue,
          lessonId: decision.lessonId,
          resourceId: decision.resourceId,
          decisionId: decision.decisionId,
          status: 'rejected-media-only',
        },
        `${decision.decisionId}: media candidate declaration drift`,
      );
    } else {
      assert.equal(targetKind, 'claim');
      assert.match(targetValue, /^[a-z0-9-]{12,}$/);
    }

    if (decision.scope === 'narrative') assert.equal(targetKind, 'section');
    if (decision.scope === 'claim') assert.equal(targetKind, 'claim');
    if (decision.scope === 'media') {
      assert.ok(['media-candidate', 'visual', 'asset'].includes(targetKind));
    }
  }

  for (const lessonId of stableLessonIds) {
    assert.ok(
      agentHarness.sourceImpactAudit.some(
        (decision) => (
          decision.lessonId === lessonId
          && ['narrative', 'claim'].includes(decision.scope)
          && materialContributions.has(decision.contribution)
        )
      ),
      `${lessonId}: requires a material narrative or claim contribution`,
    );
  }

  const reactMediaDecision = agentHarness.sourceImpactAudit.find(
    ({ resourceId }) => resourceId === 'res-harness-primary-feishu-react-loop',
  );
  assert.equal(reactMediaDecision.scope, 'media');
  assert.equal(reactMediaDecision.contribution, 'rejected');
  assert.match(reactMediaDecision.targetId, /^media-candidate:/);

  const workflowDuplicate = agentHarness.sourceImpactAudit.find(
    ({ resourceId, contribution }) => (
      resourceId === 'res-harness-primary-javaguide-workflow-graph-loop'
      && contribution === 'duplicate'
    ),
  );
  assert.equal(workflowDuplicate.scope, 'claim');
  assert.match(workflowDuplicate.targetId, /^claim:/);
});

test('resolves every claim decision through an independent frozen claim registry', () => {
  const claims = agentHarness.sourceImpactClaims;
  const resolveClaim = agentHarnessData.resolveSourceImpactClaim;
  const resourcesById = new Map(
    agentHarness.resources.map((resource) => [resource.id, resource]),
  );
  const claimIds = new Set();

  assert.ok(Array.isArray(claims));
  assert.ok(claims.length > 0);
  assert.equal(typeof resolveClaim, 'function');
  assertDeepFrozen(claims, 'sourceImpactClaims');

  for (const claim of claims) {
    assert.deepEqual(Object.keys(claim), [
      'id',
      'lessonId',
      'sectionId',
      'statement',
      'sourceIds',
    ]);
    assert.match(claim.id, /^[a-z0-9]+(?:-[a-z0-9]+)+$/);
    assert.ok(!claimIds.has(claim.id), `duplicate claim ${claim.id}`);
    claimIds.add(claim.id);
    assert.ok(stableLessonIds.includes(claim.lessonId), claim.id);
    assert.ok(typeof claim.statement === 'string' && claim.statement.length >= 20, claim.id);
    assert.ok(Array.isArray(claim.sourceIds) && claim.sourceIds.length > 0, claim.id);
    assert.equal(new Set(claim.sourceIds).size, claim.sourceIds.length, claim.id);

    const lesson = agentHarness.lessons.find(({ id }) => id === claim.lessonId);
    const section = lesson.knowledgeNote.sections.find(({ id }) => id === claim.sectionId);
    assert.ok(section, `${claim.id}: unknown section ${claim.sectionId}`);
    for (const sourceId of claim.sourceIds) {
      assert.ok(resourcesById.has(sourceId), `${claim.id}: unknown source ${sourceId}`);
      assert.ok(lesson.resourceIds.includes(sourceId),
        `${claim.id}: ${sourceId} is outside ${lesson.id}`);
      assert.ok(section.sourceIds.includes(sourceId),
        `${claim.id}: ${sourceId} is outside ${section.id}`);
    }

    const targetId = `claim:${claim.id}`;
    assert.equal(resolveClaim(targetId), claim, `${claim.id}: resolver identity drift`);
    const decisions = agentHarness.sourceImpactAudit.filter(
      (decision) => decision.scope === 'claim' && decision.targetId === targetId,
    );
    assert.ok(decisions.length > 0, `${claim.id}: unreferenced claim`);
    for (const decision of decisions) {
      assert.equal(decision.lessonId, claim.lessonId, decision.decisionId);
      assert.ok(claim.sourceIds.includes(decision.resourceId), decision.decisionId);
      assert.ok(section.sourceIds.includes(decision.resourceId), decision.decisionId);
    }
  }

  const claimDecisions = agentHarness.sourceImpactAudit.filter(
    ({ scope }) => scope === 'claim',
  );
  assert.ok(claimDecisions.length >= claims.length);
  for (const decision of claimDecisions) {
    assert.equal(
      resolveClaim(decision.targetId).lessonId,
      decision.lessonId,
      decision.decisionId,
    );
  }

  const inventedDecision = {
    ...claimDecisions[0],
    targetId: 'claim:totally-made-up-claim',
  };
  assert.throws(
    () => resolveClaim(inventedDecision.targetId),
    /Unknown source-impact claim/,
  );
  assert.throws(
    () => resolveClaim('section:totally-made-up-claim'),
    /must start with claim:/,
  );
});

test('keeps the Markdown source-impact ledger in exact parity with machine decisions', async () => {
  const audit = await readFile(
    new URL(
      '../docs/content-audits/2026-07-30-agent-harness-primary-reference-reconstruction.md',
      import.meta.url,
    ),
    'utf8',
  );
  const rows = readMarkdownTable(audit, [
    'decisionId',
    'lessonId',
    'resourceId',
    'scope',
    'targetId',
    'contribution',
    'summary',
    'rationale',
  ]);
  const markdownDecisions = rows.map((row, index) => ({
    decisionId: unwrapSingleCodeSpan(row[0], `decision ${index} ID`),
    lessonId: unwrapSingleCodeSpan(row[1], `decision ${index} lesson`),
    resourceId: unwrapSingleCodeSpan(row[2], `decision ${index} resource`),
    scope: unwrapSingleCodeSpan(row[3], `decision ${index} scope`),
    targetId: unwrapSingleCodeSpan(row[4], `decision ${index} target`),
    contribution: unwrapSingleCodeSpan(row[5], `decision ${index} contribution`),
    summary: row[6],
    rationale: row[7],
  }));
  assert.deepEqual(markdownDecisions, agentHarness.sourceImpactAudit);
});

test('keeps resource IDs globally unique and the reconstructed data deeply frozen', () => {
  const resourceIds = agentHarness.resources.map(({ id }) => id);
  assert.ok(Array.isArray(agentHarness.sourceImpactClaims));
  const allIds = [
    ...agentHarness.lessons.map(({ id }) => id),
    ...resourceIds,
    ...agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...agentHarness.interviewQuestions.map(({ id }) => id),
    ...agentHarness.sourceImpactClaims.map(({ id }) => id),
  ];
  assert.equal(new Set(resourceIds).size, resourceIds.length);
  assert.equal(new Set(allIds).size, allIds.length);
  assertDeepFrozen(agentHarness, 'agentHarness');
});
