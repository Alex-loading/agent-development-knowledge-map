import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { courseRegistry } from '../src/data/courses.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateKnowledgeVisualOwnership } from './helpers/visual-registry.js';

function fixture() {
  const visual = {
    id: 'visual-course-01-overview',
    assetPath: 'assets/visuals/course/course-01-overview.svg',
    sourceIds: ['res-1'],
  };
  const section = {
    id: 'section-1',
    sourceIds: ['res-1'],
  };
  const lesson = {
    id: 'course-01',
    resourceIds: ['res-1'],
    knowledgeNote: {
      overviewVisualId: visual.id,
      overviewVisualSectionId: section.id,
      sections: [section],
    },
  };
  const course = {
    id: 'course',
    lessons: [lesson],
    resources: [{ id: 'res-1', evidence: { authority: 'official' } }],
  };
  return {
    courseRegistry: { course },
    knowledgeVisuals: [visual],
  };
}

test('accepts one evidence-owned placement for every published visual', async () => {
  const result = await validateKnowledgeVisualOwnership({
    ...fixture(),
    assetExists: async () => true,
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    result.placements.map(({ visualId, lessonId, sectionId, kind }) => ({
      visualId,
      lessonId,
      sectionId,
      kind,
    })),
    [{
      visualId: 'visual-course-01-overview',
      lessonId: 'course-01',
      sectionId: 'section-1',
      kind: 'overview',
    }],
  );
});

test('every published visual has exactly one evidence-owned placement across courseRegistry', async () => {
  const result = await validateKnowledgeVisualOwnership({
    courseRegistry,
    knowledgeVisuals,
    assetExists: async (assetPath) => {
      await access(assetPath);
      return true;
    },
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.placements.length, knowledgeVisuals.length);
});

test('five-module visual ownership, permission, asset and step-state identities are globally unique', async () => {
  const result = await validateKnowledgeVisualOwnership({
    courseRegistry,
    knowledgeVisuals,
    assetExists: async (assetPath) => {
      await access(assetPath);
      return true;
    },
  });
  assert.deepEqual(result.errors, []);

  const ownerByVisualId = new Map(result.placements.map((placement) => [
    placement.visualId,
    placement,
  ]));
  const minimumByModule = new Map([
    ['llm-foundation', 5],
    ['agent-mechanism', 2],
    ['agent-harness', 3],
    ['context-rag-memory', 3],
    ['backend-engineering', 2],
  ]);
  for (const course of Object.values(courseRegistry)) {
    for (const lesson of course.lessons) {
      const count = result.placements.filter(({ courseId, lessonId }) => (
        courseId === course.id && lessonId === lesson.id
      )).length;
      assert.ok(count >= minimumByModule.get(course.id), `${course.id}/${lesson.id}: ${count}`);
    }
  }

  const assetPaths = [];
  const stepIds = [];
  for (const visual of knowledgeVisuals) {
    const owner = ownerByVisualId.get(visual.id);
    assert.ok(owner, visual.id);
    assert.equal(
      visual.sourceIds.every((sourceId) => owner.ownerSection.sourceIds.includes(sourceId)),
      true,
      `${visual.id}: sources must be section-owned`,
    );
    assetPaths.push(visual.assetPath);
    for (const step of visual.steps ?? []) {
      assetPaths.push(step.assetPath);
      stepIds.push(step.id);
    }
    if (visual.provenance === 'original-synthesis') {
      assert.equal(visual.permission, null, visual.id);
    } else {
      assert.equal(visual.permission?.allowsRedistribution, true, visual.id);
      if (visual.provenance === 'licensed-adaptation') {
        assert.equal(visual.permission?.allowsModification, true, visual.id);
      }
    }
  }
  assert.equal(new Set(assetPaths).size, assetPaths.length, 'asset paths must be globally unique');
  assert.equal(new Set(stepIds).size, stepIds.length, 'step state IDs must be globally unique');
});

test('rejects orphan visuals that have no note placement', async () => {
  const data = fixture();
  data.knowledgeVisuals.push({
    ...data.knowledgeVisuals[0],
    id: 'visual-course-01-orphan',
    assetPath: 'assets/visuals/course/course-01-orphan.svg',
  });

  const result = await validateKnowledgeVisualOwnership({
    ...data,
    assetExists: async () => true,
  });

  assert.match(result.errors.join('\n'), /visual-course-01-orphan.*orphan/i);
});

test('rejects duplicate overview and section placements', async () => {
  const data = fixture();
  data.courseRegistry.course.lessons[0].knowledgeNote.sections[0].visuals = [{
    visualId: 'visual-course-01-overview',
  }];

  const result = await validateKnowledgeVisualOwnership({
    ...data,
    assetExists: async () => true,
  });

  assert.match(result.errors.join('\n'), /visual-course-01-overview.*2 placements/i);
});

test('rejects an overview owner that is not a real lesson section', async () => {
  const data = fixture();
  data.courseRegistry.course.lessons[0].knowledgeNote.overviewVisualSectionId = 'missing-section';

  const result = await validateKnowledgeVisualOwnership({
    ...data,
    assetExists: async () => true,
  });

  assert.match(result.errors.join('\n'), /missing-section.*not a real section/i);
});
