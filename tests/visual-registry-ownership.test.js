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
