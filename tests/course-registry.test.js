import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { resolveRoute } from '../src/app.js';
import { courseRegistry, getCourse } from '../src/data/courses.js';
import { agentHarness } from '../src/data/agent-harness.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';
import { contextRagMemory } from '../src/data/context-rag-memory.js';
import { llmFoundation } from '../src/data/llm-foundation.js';

function assertRegistryIdsAreUnique(selectIds, label) {
  const idsByCourse = Object.values(courseRegistry).map(selectIds);
  const ids = idsByCourse.flat();
  assert.equal(new Set(ids).size, ids.length, `${label} 必须在课程内及跨课程全局唯一`);
  for (let first = 0; first < idsByCourse.length; first += 1) {
    for (let second = first + 1; second < idsByCourse.length; second += 1) {
      const otherCourseIds = new Set(idsByCourse[second]);
      assert.deepEqual(
        idsByCourse[first].filter((id) => otherCourseIds.has(id)),
        [],
        `${label} 在任意两门课程间都不能重复`,
      );
    }
  }
}

test('production course registry is immutable and resolves exactly four active courses', () => {
  const expectedCourses = [
    llmFoundation,
    agentMechanism,
    agentHarness,
    contextRagMemory,
  ];
  assert.deepEqual(Object.keys(courseRegistry), expectedCourses.map(({ id }) => id));
  assert.equal(Object.isFrozen(courseRegistry), true);
  for (const course of expectedCourses) assert.equal(getCourse(course.id), course);
  assert.equal(getCourse('context-rag-memory'), contextRagMemory);
  assert.equal(getCourse('not-registered'), null);
  assert.throws(() => {
    courseRegistry.extra = llmFoundation;
  }, TypeError);
});

test('route resolver opens registered dashboards and lessons from the production registry', () => {
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
  assert.deepEqual(resolveRoute('#agent-harness/dashboard'), {
    hash: '#agent-harness/dashboard',
    moduleId: 'agent-harness',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#agent-harness/lesson/harness-01'), {
    hash: '#agent-harness/lesson/harness-01',
    moduleId: 'agent-harness',
    view: 'lesson',
    lessonId: 'harness-01',
  });
  assert.deepEqual(resolveRoute('#context-rag-memory/dashboard'), {
    hash: '#context-rag-memory/dashboard',
    moduleId: 'context-rag-memory',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#context-rag-memory/lesson/context-01'), {
    hash: '#context-rag-memory/lesson/context-01',
    moduleId: 'context-rag-memory',
    view: 'lesson',
    lessonId: 'context-01',
  });
});

test('route resolver keeps a canonical fallback for invalid Agent lessons', () => {
  assert.deepEqual(resolveRoute('#agent-mechanism/lesson/missing'), {
    hash: '#llm-foundation/dashboard',
    moduleId: 'llm-foundation',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#agent-harness/lesson/missing'), {
    hash: '#llm-foundation/dashboard',
    moduleId: 'llm-foundation',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#context-rag-memory/lesson/missing'), {
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

test('lesson, resource, quiz, interview and experiment IDs are globally unique across courses', () => {
  const selectors = [
    ['lesson id', (course) => course.lessons.map(({ id }) => id)],
    ['resource id', (course) => course.resources.map(({ id }) => id)],
    ['quiz id', (course) => course.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id))],
    ['interview id', (course) => course.interviewQuestions.map(({ id }) => id)],
    ['experiment id', (course) => course.lessons
      .map(({ exercise }) => exercise.experiment)
      .filter(Boolean)],
  ];
  for (const [label, selectIds] of selectors) assertRegistryIdsAreUnique(selectIds, label);

  assertRegistryIdsAreUnique((course) => [
    ...course.lessons.map(({ id }) => id),
    ...course.resources.map(({ id }) => id),
    ...course.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...course.interviewQuestions.map(({ id }) => id),
    ...course.lessons.map(({ exercise }) => exercise.experiment).filter(Boolean),
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
