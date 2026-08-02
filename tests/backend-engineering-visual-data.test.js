import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { backendEngineering } from '../src/data/backend-engineering.js';
import {
  backendAssessmentConceptTags,
  backendAssessmentVisualCoverage,
} from '../src/data/backend-engineering-outcomes.js';
import { backendEngineeringVisuals } from '../src/data/visuals/backend-engineering-visuals.js';
import {
  backendEngineeringScenes,
  getBackendEngineeringScene,
} from '../src/data/visuals/backend-engineering-scenes.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import { backendEngineeringVisualFixtures } from './fixtures/backend-engineering-visual-fixtures.js';

function placements() {
  return backendEngineering.lessons.flatMap((lesson) => [
    { visualId: lesson.knowledgeNote.overviewVisualId, lessonId: lesson.id, kind: 'overview' },
    ...lesson.knowledgeNote.sections.flatMap((section) => (section.visuals ?? []).map(
      ({ visualId }) => ({ visualId, lessonId: lesson.id, kind: 'section' }),
    )),
  ]);
}

function assertDeepFrozen(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const nested of Object.values(value)) assertDeepFrozen(nested, seen);
}

function edgeMatches(edge, truth) {
  return edge.from === truth.from
    && edge.to === truth.to
    && (truth.kind === undefined || edge.kind === truth.kind);
}

function structureIncludes(actual, expected) {
  const actualText = JSON.stringify(actual);
  return expected.every((truth) => actualText.includes(JSON.stringify(truth)));
}

export function assertBackendSceneFixture(scene, fixture) {
  assert.ok(scene, `${fixture.visualId}: scene exists`);
  assert.equal(scene.id, fixture.visualId, `${fixture.visualId}: identity`);
  assert.equal(scene.type, fixture.type, `${fixture.visualId}: type`);
  assert.equal(scene.topology, fixture.topology, `${fixture.visualId}: topology`);
  assert.ok(Array.isArray(scene.nodes), `${fixture.visualId}: semantic nodes are required`);
  assert.ok(Array.isArray(scene.edges), `${fixture.visualId}: edges are required`);
  assert.ok(Array.isArray(scene.values), `${fixture.visualId}: values are required`);

  const nodeIds = scene.nodes.map(({ id }) => id);
  assert.equal(new Set(nodeIds).size, nodeIds.length, `${fixture.visualId}: unique node IDs`);
  assert.ok(nodeIds.every((id) => id && !/^card-\d+$/.test(id)), `${fixture.visualId}: stable semantic node IDs`);

  const structure = Object.fromEntries(Object.keys(fixture.structure).map((key) => [key, scene[key]]));
  const visibleTruth = JSON.stringify({
    nodes: scene.nodes,
    edges: scene.edges,
    values: scene.values,
    structure,
  });
  for (const truth of [
    ...fixture.criticalLabels,
    ...fixture.criticalStates,
    ...fixture.criticalValues,
  ]) {
    assert.ok(visibleTruth.includes(truth), `${fixture.visualId}: missing visible truth ${truth}`);
  }

  for (const [field, expected] of Object.entries(fixture.structure)) {
    assert.ok(Array.isArray(structure[field]), `${fixture.visualId}: missing ${fixture.type}.${field}`);
    assert.ok(
      structureIncludes(structure[field], expected),
      `${fixture.visualId}: ${field} does not preserve ${JSON.stringify(expected)}`,
    );
  }

  for (const truth of fixture.requiredEdges) {
    assert.ok(
      scene.edges.some((edge) => edgeMatches(edge, truth)),
      `${fixture.visualId}: missing edge ${truth.from}->${truth.to}${truth.kind ? ` (${truth.kind})` : ''}`,
    );
  }
  for (const branch of fixture.requiredBranches) {
    const targets = new Set(scene.edges.filter(({ from }) => from === branch.from).map(({ to }) => to));
    for (const target of branch.to) {
      assert.ok(targets.has(target), `${fixture.visualId}: missing branch ${branch.from}->${target}`);
    }
  }
  for (const truth of fixture.edgeLabelTruths) {
    assert.ok(
      scene.edges.some((edge) => edgeMatches(edge, truth) && edge.label === truth.label),
      `${fixture.visualId}: missing edge label ${truth.from}->${truth.to}: ${truth.label}`,
    );
  }
}

function syntheticScene(fixture) {
  const endpoints = new Set(fixture.requiredEdges.flatMap(({ from, to }) => [from, to]));
  const visible = [
    ...fixture.criticalLabels,
    ...fixture.criticalStates,
    ...fixture.criticalValues,
  ];
  const nodes = [...endpoints].map((id, index) => ({
    id,
    label: `${visible[index % visible.length] ?? id}\n${visible[(index + 1) % visible.length] ?? ''}`,
    x: 60 + index * 20,
    y: 180 + index * 10,
    width: 180,
    height: 80,
  }));
  nodes.push({ id: 'fixture-truth', label: visible.join('\n') });
  const edges = fixture.requiredEdges.map((truth, index) => ({
    id: `truth-edge-${index}`,
    ...truth,
    label: fixture.edgeLabelTruths.find((candidate) => edgeMatches(truth, candidate))?.label,
    points: [[0, index], [1, index]],
  }));
  for (const labelTruth of fixture.edgeLabelTruths) {
    if (!edges.some((edge) => edgeMatches(edge, labelTruth) && edge.label === labelTruth.label)) {
      edges.push({ id: `label-edge-${edges.length}`, ...labelTruth, points: [[0, edges.length], [1, edges.length]] });
    }
  }
  return {
    id: fixture.visualId,
    type: fixture.type,
    topology: fixture.topology,
    nodes,
    edges,
    values: fixture.criticalValues,
    ...fixture.structure,
  };
}

test('publishes exactly two original accessible backend visuals per lesson', async () => {
  assert.equal(backendEngineeringVisuals.length, 16);
  assert.equal(new Set(backendEngineeringVisuals.map(({ id }) => id)).size, 16);
  assert.deepEqual(new Set(placements().map(({ visualId }) => visualId)), new Set(backendEngineeringVisuals.map(({ id }) => id)));
  assert.ok(backendEngineeringVisuals.every(({ provenance }) => provenance === 'original-synthesis'));
  for (const lesson of backendEngineering.lessons) {
    const owned = backendEngineeringVisuals.filter(({ id }) => id.startsWith(`visual-${lesson.id}-`));
    assert.equal(owned.length, 2, lesson.id);
    assert.equal(owned.filter(({ role }) => role === 'overview').length, 1, lesson.id);
    assert.equal(placements().filter(({ lessonId }) => lessonId === lesson.id).length, 2, lesson.id);
    for (const visual of owned) {
      assert.deepEqual(validateVisualAsset(visual), [], visual.id);
      assert.ok(visual.alt.length >= 24);
      assert.ok(visual.longDescription.length >= 50);
      assert.ok(visual.assessedCoverage.length > 0);
      await access(new URL(`../${visual.assetPath}`, import.meta.url));
    }
  }
  assert.ok(backendEngineeringVisuals.every(({ id }) => knowledgeVisuals.some((visual) => visual.id === id)));
});

test('independent fixture and production inventories cover exactly the same 16 visuals', () => {
  assertDeepFrozen(backendEngineeringVisualFixtures);
  const fixtureIds = Object.values(backendEngineeringVisualFixtures).map(({ visualId }) => visualId);
  const productionIds = backendEngineeringScenes.map(({ id }) => id);
  assert.equal(fixtureIds.length, 16);
  assert.equal(new Set(fixtureIds).size, 16);
  assert.deepEqual(new Set(productionIds), new Set(fixtureIds));
  assert.deepEqual(new Set(backendEngineeringVisuals.map(({ id }) => id)), new Set(fixtureIds));
});

test('all 16 backend scenes preserve fixture topology, type-specific structure, branches, and edge truths', () => {
  for (const fixture of Object.values(backendEngineeringVisualFixtures)) {
    assertBackendSceneFixture(getBackendEngineeringScene(fixture.visualId), fixture);
  }
});

test('fixture oracle rejects topology, cross-module, structure, branch, edge, and label mutations', () => {
  const fixture = backendEngineeringVisualFixtures.capacityDeadline;
  const valid = syntheticScene(fixture);
  assert.doesNotThrow(() => assertBackendSceneFixture(valid, fixture));

  assert.throws(
    () => assertBackendSceneFixture({ ...valid, topology: 'agent-control-loop' }, fixture),
    /topology/,
  );
  assert.throws(
    () => assertBackendSceneFixture({ ...valid, type: 'matrix' }, fixture),
    /type/,
  );
  assert.throws(
    () => assertBackendSceneFixture({ ...valid, id: 'visual-agent-08-end-to-end' }, fixture),
    /identity/,
  );
  assert.throws(
    () => assertBackendSceneFixture({ ...valid, budgets: [] }, fixture),
    /budgets/,
  );
  const withoutBranch = {
    ...valid,
    edges: valid.edges.filter(({ from, to }) => !(from === 'admission' && to === 'load-shed')),
  };
  assert.throws(() => assertBackendSceneFixture(withoutBranch, fixture), /missing edge|missing branch/);
  const withoutRetry = {
    ...valid,
    edges: valid.edges.filter(({ kind }) => kind !== 'retry'),
  };
  assert.throws(() => assertBackendSceneFixture(withoutRetry, fixture), /missing edge/);
  const withoutMeaningfulLabel = {
    ...valid,
    edges: valid.edges.map((edge) => (edge.label === 'REJECT' ? { ...edge, label: undefined } : edge)),
  };
  assert.throws(() => assertBackendSceneFixture(withoutMeaningfulLabel, fixture), /missing edge label/);
});

test('visual ownership is derived only from real note placements in the same lesson', () => {
  const owners = new Map(placements().map((placement) => [placement.visualId, placement]));
  assert.equal(owners.size, 16);
  for (const visual of backendEngineeringVisuals) {
    const owner = owners.get(visual.id);
    assert.ok(owner);
    assert.ok(visual.id.startsWith(`visual-${owner.lessonId}-`));
  }
  const mutated = [...placements()];
  mutated[0] = { ...mutated[0], visualId: 'visual-agent-01-boundary-spectrum' };
  assert.notDeepEqual(new Set(mutated.map(({ visualId }) => visualId)), new Set(backendEngineeringVisuals.map(({ id }) => id)));
});

test('assessment and visual outcomes cover each other bidirectionally', () => {
  const visuals = new Map(backendEngineeringVisuals.map((visual) => [visual.id, visual]));
  const assessmentIds = new Set([
    ...backendEngineering.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...backendEngineering.interviewQuestions.map(({ id }) => id),
  ]);
  assert.deepEqual(new Set(Object.keys(backendAssessmentVisualCoverage)), assessmentIds);
  assert.deepEqual(new Set(Object.keys(backendAssessmentConceptTags)), assessmentIds);
  const coveredVisualIds = new Set();
  for (const assessmentId of assessmentIds) {
    const tags = backendAssessmentConceptTags[assessmentId];
    const visualIds = backendAssessmentVisualCoverage[assessmentId];
    assert.ok(tags.length > 0 && visualIds.length > 0, assessmentId);
    for (const visualId of visualIds) {
      const visual = visuals.get(visualId);
      assert.ok(visual, `${assessmentId}:${visualId}`);
      assert.ok(tags.some((tag) => visual.assessedCoverage.includes(tag)), `${assessmentId}:${visualId}`);
      coveredVisualIds.add(visualId);
    }
  }
  assert.deepEqual(coveredVisualIds, new Set(visuals.keys()));
});
