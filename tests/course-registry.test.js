import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { resolveRoute } from '../src/app.js';
import { courseRegistry, getCourse } from '../src/data/courses.js';
import { llmFoundation } from '../src/data/llm-foundation.js';

test('production course registry is immutable and resolves only registered courses', () => {
  assert.equal(Object.isFrozen(courseRegistry), true);
  assert.equal(getCourse('llm-foundation'), llmFoundation);
  assert.equal(getCourse('not-registered'), null);
  assert.throws(() => {
    courseRegistry.extra = llmFoundation;
  }, TypeError);
});

test('route resolver supports a synthetic second active registered course', () => {
  const alphaCourse = {
    id: 'alpha',
    title: 'Alpha',
    lessons: [{ id: 'alpha-01', order: 1, title: 'Alpha lesson' }],
    resources: [],
    interviewQuestions: [],
  };
  const betaCourse = {
    id: 'beta',
    title: 'Beta',
    lessons: [{ id: 'beta-01', order: 1, title: 'Beta lesson' }],
    resources: [],
    interviewQuestions: [],
  };
  const moduleCatalog = [
    { id: 'alpha', status: 'active' },
    { id: 'beta', status: 'active' },
    { id: 'orphan', status: 'active' },
  ];
  const registry = Object.freeze({ alpha: alphaCourse, beta: betaCourse });
  const options = {
    moduleCatalog,
    courseResolver: (moduleId) => registry[moduleId] ?? null,
    defaultModuleId: 'alpha',
  };

  assert.deepEqual(resolveRoute('#beta/dashboard', options), {
    hash: '#beta/dashboard',
    moduleId: 'beta',
    view: 'dashboard',
  });
  assert.deepEqual(resolveRoute('#beta/lesson/beta-01', options), {
    hash: '#beta/lesson/beta-01',
    moduleId: 'beta',
    view: 'lesson',
    lessonId: 'beta-01',
  });
});

test('route resolver falls back for invalid lessons and active modules without a course', () => {
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
