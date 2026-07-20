import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { resolveRoute } from '../src/app.js';
import { courseRegistry, getCourse } from '../src/data/courses.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';
import { llmFoundation } from '../src/data/llm-foundation.js';

function assertRegistryIdsAreUnique(selectIds, label) {
  const ids = Object.values(courseRegistry).flatMap(selectIds);
  assert.equal(new Set(ids).size, ids.length, `${label} 必须在课程内及跨课程全局唯一`);
}

test('production course registry is immutable and resolves both active courses', () => {
  assert.deepEqual(Object.keys(courseRegistry), ['llm-foundation', 'agent-mechanism']);
  assert.equal(Object.isFrozen(courseRegistry), true);
  assert.equal(getCourse('llm-foundation'), llmFoundation);
  assert.equal(getCourse('agent-mechanism'), agentMechanism);
  assert.equal(getCourse('not-registered'), null);
  assert.throws(() => {
    courseRegistry.extra = llmFoundation;
  }, TypeError);
});

test('route resolver opens Agent dashboard and lessons from the production registry', () => {
  assert.deepEqual(resolveRoute('#agent-mechanism/dashboard'), {
    hash: '#agent-mechanism/dashboard',
    moduleId: 'agent-mechanism',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#agent-mechanism/lesson/agent-01'), {
    hash: '#agent-mechanism/lesson/agent-01',
    moduleId: 'agent-mechanism',
    view: 'lesson',
    lessonId: 'agent-01',
  });
});

test('route resolver keeps a canonical fallback for invalid Agent lessons', () => {
  assert.deepEqual(resolveRoute('#agent-mechanism/lesson/missing'), {
    hash: '#llm-foundation/dashboard',
    moduleId: 'llm-foundation',
    view: 'dashboard',
  });
});

test('route resolver falls back for active modules without a course', () => {
  const alphaCourse = {
    id: 'alpha',
    title: 'Alpha',
    lessons: [{ id: 'alpha-01', order: 1, title: 'Alpha lesson' }],
    resources: [],
    interviewQuestions: [],
  };
  const moduleCatalog = [
    { id: 'alpha', status: 'active' },
    { id: 'orphan', status: 'active' },
  ];
  const options = {
    moduleCatalog,
    courseResolver: (moduleId) => (moduleId === 'alpha' ? alphaCourse : null),
    defaultModuleId: 'alpha',
  };
  const fallback = { hash: '#alpha/dashboard', moduleId: 'alpha', view: 'dashboard' };

  assert.deepEqual(resolveRoute('#alpha/lesson/missing', options), fallback);
  assert.deepEqual(resolveRoute('#orphan/dashboard', options), fallback);
  assert.deepEqual(resolveRoute('#unknown/dashboard', options), fallback);
});

test('all registry-backed content IDs are globally unique by entity type', () => {
  assertRegistryIdsAreUnique((course) => course.lessons.map(({ id }) => id), 'lesson id');
  assertRegistryIdsAreUnique((course) => course.resources.map(({ id }) => id), 'resource id');
  assertRegistryIdsAreUnique(
    (course) => course.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    'quiz id',
  );
  assertRegistryIdsAreUnique(
    (course) => course.interviewQuestions.map(({ id }) => id),
    'interview id',
  );
  assertRegistryIdsAreUnique((course) => [
    ...course.lessons.map(({ id }) => id),
    ...course.resources.map(({ id }) => id),
    ...course.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...course.interviewQuestions.map(({ id }) => id),
  ], 'content id');
});

test('generic application and views do not hardcode LLM course data', async () => {
  const paths = [
    '../src/app.js',
    '../src/ui/dashboard.js',
    '../src/ui/curriculum.js',
    '../src/ui/knowledge-map.js',
    '../src/ui/resources.js',
    '../src/ui/interviews.js',
    '../src/ui/progress-view.js',
  ];
  const source = (await Promise.all(paths.map((path) => (
    readFile(new URL(path, import.meta.url), 'utf8')
  )))).join('\n');

  assert.doesNotMatch(source, /\bllmFoundation\b/);
  assert.doesNotMatch(source, /LLM FOUNDATION|八节|八步|八项/);
});
