import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { backendEngineering } from '../src/data/backend-engineering.js';
import {
  backendAssessmentConceptTags,
  backendAssessmentVisualCoverage,
} from '../src/data/backend-engineering-outcomes.js';
import { backendEngineeringVisuals } from '../src/data/visuals/backend-engineering-visuals.js';
import { getBackendEngineeringScene } from '../src/data/visuals/backend-engineering-scenes.js';
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

test('production scenes preserve all independent fixture semantics', () => {
  const fixtureVisualIds = new Set();
  for (const fixture of Object.values(backendEngineeringVisualFixtures)) {
    fixtureVisualIds.add(fixture.visualId);
    const scene = getBackendEngineeringScene(fixture.visualId);
    assert.ok(scene, fixture.visualId);
    assert.equal(scene.topology, fixture.topology);
    const text = JSON.stringify(scene);
    for (const label of fixture.labels) assert.ok(text.includes(label), `${fixture.visualId}:${label}`);
    for (const value of fixture.renderedValues) assert.ok(text.includes(value), `${fixture.visualId}:${value}`);
  }
  assert.equal(fixtureVisualIds.size, 8);
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
