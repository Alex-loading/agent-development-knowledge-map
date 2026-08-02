import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { startApp } from '../src/app.js';
import {
  FILTER_ALL,
  filterInterviewQuestions,
  filterResources,
  resourcePlatform,
} from '../src/core/filters.js';
import {
  createDefaultProgress,
  setInterviewStatus,
  toggleReviewQueue,
} from '../src/core/progress.js';
import { backendEngineering } from '../src/data/backend-engineering.js';
import { contextRagMemory } from '../src/data/context-rag-memory.js';
import { courseRegistry } from '../src/data/courses.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import { renderDashboard } from '../src/ui/dashboard.js';
import { renderExperiment } from '../src/ui/experiments.js';
import { renderInterviewPractice } from '../src/ui/interviews.js';
import { renderProgressView } from '../src/ui/progress-view.js';
import { renderResourceLibrary } from '../src/ui/resources.js';
import {
  FakeDocument,
  FakeEvent,
  createAppDocument,
  createFakeWindow,
  findButton,
  installFakeDom,
} from './helpers/fake-dom.js';

function dispatchChange(select, value) {
  select.value = value;
  select.dispatchEvent(new FakeEvent('change'));
}

function navigateTo(app, windowRef, hash) {
  app.navigate(hash);
  windowRef.dispatchEvent(new FakeEvent('hashchange'));
}

function createStore(initialState) {
  let stored = structuredClone(initialState);
  const saves = [];
  let resetCount = 0;
  return {
    saves,
    load: () => structuredClone(stored),
    save(next) {
      stored = structuredClone(next);
      saves.push(structuredClone(next));
    },
    reset() {
      resetCount += 1;
      stored = createDefaultProgress('llm-foundation');
    },
    mode: () => 'local',
    resetCount: () => resetCount,
  };
}

function distinctResourceProfiles(courses) {
  const used = new Set();
  return courses.map((course) => {
    const profile = course.resources.map((resource) => ({
      language: resource.language,
      platform: resourcePlatform(resource),
      source: resource.source,
      type: resource.type,
      difficulty: resource.difficulty,
      stage: resource.stage,
    })).find((filters) => {
      const key = JSON.stringify(filters);
      const count = filterResources(course.resources, filters).length;
      return !used.has(key) && count > 0 && count < course.resources.length;
    });
    assert.ok(profile, `${course.id} should expose a distinct selective resource profile`);
    used.add(JSON.stringify(profile));
    return { course, filters: profile };
  });
}

function distinctInterviewProfiles(courses) {
  const used = new Set();
  return courses.map((course) => {
    let profile = null;
    for (const question of course.interviewQuestions) {
      for (const role of question.roles) {
        const filters = {
          role,
          frequency: question.frequency,
          difficulty: question.difficulty,
          status: 'unseen',
        };
        const key = JSON.stringify(filters);
        const count = filterInterviewQuestions(course.interviewQuestions, filters, {}).length;
        if (!used.has(key) && count > 0 && count < course.interviewQuestions.length) {
          profile = filters;
          break;
        }
      }
      if (profile) break;
    }
    assert.ok(profile, `${course.id} should expose a distinct selective interview profile`);
    used.add(JSON.stringify(profile));
    return [course, profile];
  });
}

test('resource library combines real filters, renders empty state and resets to every resource', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  let filters = {};
  const render = () => renderResourceLibrary(root, {
    resources: llmFoundation.resources,
    filters,
    onFiltersChange(next) {
      filters = next;
      render();
    },
  });

  render();
  assert.equal(root.querySelectorAll('.resource-row').length, llmFoundation.resources.length);

  dispatchChange(root.querySelector('#resource-filter-platform'), 'GitHub');
  const githubRows = root.querySelectorAll('.resource-row');
  assert.ok(githubRows.length > 0);
  assert.ok(githubRows.every((row) => row.dataset.platform === 'GitHub'));
  assert.ok(root.textContent.includes(`${githubRows.length} / ${llmFoundation.resources.length}`));

  dispatchChange(root.querySelector('#resource-filter-language'), '中文');
  dispatchChange(root.querySelector('#resource-filter-platform'), 'YouTube');
  assert.equal(root.querySelectorAll('.resource-row').length, 0);
  assert.ok(root.textContent.includes('没有符合当前筛选条件的资料'));

  findButton(root, '重置筛选').click();
  assert.equal(root.querySelectorAll('.resource-row').length, llmFoundation.resources.length);
  assert.ok(root.textContent.includes('启用筛选 0 项'));
});

test('resource copy is data-derived and every rendered platform option matches real resources', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const resources = llmFoundation.resources.slice(0, 5);

  renderResourceLibrary(root, { resources, filters: {} });

  assert.ok(root.textContent.includes(`${resources.length} 份课程、项目、论文与视频`));
  const platformOptions = root.querySelector('#resource-filter-platform').children;
  assert.equal(platformOptions[0].value, FILTER_ALL);
  for (const option of platformOptions.slice(1)) {
    assert.ok(
      filterResources(resources, { platform: option.value }).length > 0,
      `平台选项 ${option.textContent} 必须能命中至少一条资料`,
    );
  }
  assert.equal(platformOptions.some((option) => option.textContent === '未知平台'), false);
});

test('canonical all sentinel keeps a literal all data value selectable in the resource UI', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const resources = [
    { id: 'literal-all', title: 'Literal', url: 'https://github.com/example/literal', source: 'Test', language: 'all', type: '教程', difficulty: '入门', stage: '基础', value: 'Literal value', verifiedAt: '2026-07-20' },
    { id: 'chinese', title: 'Chinese', url: 'https://github.com/example/chinese', source: 'Test', language: '中文', type: '教程', difficulty: '入门', stage: '基础', value: 'Chinese value', verifiedAt: '2026-07-20' },
  ];
  let filters = {};
  const render = () => renderResourceLibrary(root, {
    resources,
    filters,
    onFiltersChange(next) {
      filters = next;
      render();
    },
  });

  render();
  const language = root.querySelector('#resource-filter-language');
  assert.equal(language.children[0].value, FILTER_ALL);
  const literalOption = language.children.find((option) => option.textContent === 'all');
  assert.notEqual(literalOption.value, 'all');
  dispatchChange(language, literalOption.value);
  assert.deepEqual(root.querySelectorAll('.resource-row').map((row) => row.textContent.includes('Literal')), [true]);
});

test('application restores focus after resource filtering and falls back after reset disables its trigger', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/resources'),
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  const platform = document.querySelector('#resource-filter-platform');
  platform.focus();
  dispatchChange(platform, 'GitHub');
  assert.equal(document.activeElement.id, 'resource-filter-platform');
  assert.notEqual(document.activeElement, platform, '焦点应落在重渲染后的替代控件');

  const reset = document.querySelector('#resource-reset-filters');
  reset.focus();
  reset.click();
  assert.equal(document.activeElement.id, 'resource-results-summary');
});

test('application preserves independent resource filters across all five active modules', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const windowRef = createFakeWindow('#context-rag-memory/resources');
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  const courses = Object.values(courseRegistry);
  const priorCourses = courses.filter(({ id }) => id !== contextRagMemory.id);
  const visitOrder = [contextRagMemory, ...priorCourses];
  const expectedStates = [];
  const profiles = distinctResourceProfiles(visitOrder);
  assert.equal(
    new Set(profiles.map(({ filters }) => JSON.stringify(filters))).size,
    visitOrder.length,
    '每门课程必须使用不同的资源筛选组合，才能检测共享状态泄漏',
  );

  for (const [index, { course, filters }] of profiles.entries()) {
    if (index > 0) navigateTo(app, windowRef, `#${course.id}/resources`);
    assert.equal(document.querySelectorAll('.resource-row').length, course.resources.length);
    for (const name of Object.keys(filters)) {
      assert.equal(document.querySelector(`#resource-filter-${name}`).value, FILTER_ALL);
      dispatchChange(document.querySelector(`#resource-filter-${name}`), filters[name]);
    }
    const count = document.querySelectorAll('.resource-row').length;
    assert.ok(count > 0 && count < course.resources.length, course.id);
    assert.equal(filterResources(course.resources, filters).length, count, course.id);
    expectedStates.push({ course, filters, count });
  }

  for (const { course, filters, count } of [...expectedStates, ...expectedStates]) {
    navigateTo(app, windowRef, `#${course.id}/resources`);
    const rendered = Object.fromEntries(Object.keys(filters).map((name) => [
      name,
      document.querySelector(`#resource-filter-${name}`).value,
    ]));
    assert.deepEqual(rendered, filters, `${course.id} should restore only its resource filters`);
    for (const other of expectedStates.filter((state) => state.course.id !== course.id)) {
      assert.notDeepEqual(rendered, other.filters, `${course.id} must not inherit ${other.course.id}`);
    }
    assert.equal(document.querySelectorAll('.resource-row').length, count, course.id);
  }
});

test('module-scoped temporary state safely stores a __proto__ module ID', async () => {
  const appModule = await import('../src/app.js');
  assert.equal(typeof appModule.createModuleViewState, 'function');
  const viewState = appModule.createModuleViewState();
  const values = {
    resourceFiltersByModule: { platform: 'GitHub' },
    interviewFiltersByModule: { role: 'Agent 开发' },
    revealedInterviewIdsByModule: new Set(['iq-synthetic-01']),
  };

  for (const [stateName, value] of Object.entries(values)) {
    const dictionary = viewState[stateName];
    dictionary.__proto__ = value;
    assert.equal(Object.hasOwn(dictionary, '__proto__'), true, stateName);
    assert.equal(dictionary.__proto__, value, stateName);
  }

  const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(appSource, /const viewState\s*=\s*createModuleViewState\(\)/);
});

test('interview practice keeps answers absent until reveal and preserves filters/reveal through status updates', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const first = llmFoundation.interviewQuestions[0];
  let progress = createDefaultProgress('llm-foundation');
  let filters = { role: 'Agent 开发' };
  const revealedIds = new Set();
  let persistenceCount = 0;
  const render = () => renderInterviewPractice(root, {
    course: llmFoundation,
    progress,
    filters,
    revealedIds,
    onFiltersChange(next) {
      filters = next;
      render();
    },
    onToggleReveal(id) {
      if (revealedIds.has(id)) revealedIds.delete(id);
      else revealedIds.add(id);
      render();
    },
    onSetStatus(id, status) {
      progress = setInterviewStatus(progress, id, status);
      persistenceCount += 1;
      render();
    },
    onToggleReview(id) {
      progress = toggleReviewQueue(progress, id);
      persistenceCount += 1;
      render();
    },
  });

  render();
  assert.equal(root.textContent.includes(first.shortAnswer), false);
  const reveal = root.querySelector(`[aria-controls="answer-${first.id}"]`);
  assert.equal(reveal.getAttribute('aria-expanded'), 'false');
  reveal.click();
  assert.ok(root.textContent.includes(first.shortAnswer));
  assert.equal(root.querySelector(`[aria-controls="answer-${first.id}"]`).getAttribute('aria-expanded'), 'true');

  const card = root.querySelector(`[data-question-id="${first.id}"]`);
  findButton(card, '已掌握').click();
  assert.equal(persistenceCount, 1);
  assert.equal(progress.interviewStatusById[first.id], 'mastered');
  assert.ok(root.textContent.includes('已掌握 1 / 24'));
  assert.ok(root.textContent.includes(first.shortAnswer), '状态重渲染不得关闭答案');
  assert.equal(root.querySelector('#interview-filter-role').value, 'Agent 开发');

  const rerenderedCard = root.querySelector(`[data-question-id="${first.id}"]`);
  findButton(rerenderedCard, '加入复习').click();
  assert.equal(persistenceCount, 2);
  assert.deepEqual(progress.reviewQueue, [first.id]);
  findButton(root.querySelector(`[data-question-id="${first.id}"]`), '移出复习').click();
  assert.equal(persistenceCount, 3);
  assert.deepEqual(progress.reviewQueue, []);
});

test('application persists interview mastery exactly once and updates shell summary', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const store = createStore(createDefaultProgress('llm-foundation'));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/interviews'),
    progressStore: store,
  });
  t.after(app.teardown);

  app.render();
  app.render();
  const first = llmFoundation.interviewQuestions[0];
  const roleFilter = document.querySelector('#interview-filter-role');
  roleFilter.focus();
  dispatchChange(roleFilter, 'Agent 开发');
  assert.equal(document.activeElement.id, 'interview-filter-role');

  const reveal = document.querySelector(`[aria-controls="answer-${first.id}"]`);
  reveal.focus();
  reveal.click();
  assert.equal(document.activeElement.id, `interview-reveal-${first.id}`);
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));
  assert.equal(document.querySelector('#interview-filter-role').value, 'Agent 开发');
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));

  const mastered = document.querySelector(`#interview-status-${first.id}-mastered`);
  mastered.focus();
  mastered.click();

  assert.equal(store.saves.length, 1);
  assert.equal(document.activeElement.id, `interview-status-${first.id}-mastered`);
  assert.ok(document.querySelector('#progress-summary').textContent.includes('面试 1 / 24'));
  assert.ok(document.querySelector('#app-live-region').textContent.includes('已标记为已掌握'));
  assert.equal(document.querySelector('#interview-filter-role').value, 'Agent 开发');
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));

  const review = document.querySelector(`#interview-review-${first.id}`);
  review.focus();
  review.click();
  assert.equal(document.activeElement.id, `interview-review-${first.id}`);
  assert.equal(store.saves.length, 2);
});

test('application preserves independent interview filters and revealed answers across all five active modules', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const windowRef = createFakeWindow('#context-rag-memory/interviews');
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  const configureCurrentModule = (course, filters) => {
    for (const [name, value] of Object.entries(filters)) {
      dispatchChange(document.querySelector(`#interview-filter-${name}`), value);
    }
    const count = document.querySelectorAll('.interview-card').length;
    assert.ok(count > 0 && count < course.interviewQuestions.length, course.id);
    const question = course.interviewQuestions.find((candidate) => (
      candidate.roles.includes(filters.role)
      && candidate.frequency === filters.frequency
      && candidate.difficulty === filters.difficulty
    ));
    assert.ok(question, `${course.id} should contain a question matching its filters`);
    assert.notEqual(document.querySelector(`[data-question-id="${question.id}"]`), null);
    document.querySelector(`#interview-reveal-${question.id}`).click();
    assert.equal(document.querySelectorAll('.answer-drawer').length, 1);
    return { course, filters, count, questionId: question.id };
  };
  const courses = Object.values(courseRegistry);
  const priorCourses = courses.filter(({ id }) => id !== contextRagMemory.id);
  const configurations = distinctInterviewProfiles([contextRagMemory, ...priorCourses]);
  assert.equal(
    new Set(configurations.map(([, filters]) => JSON.stringify(filters))).size,
    configurations.length,
    '每门课程必须使用不同的面试筛选组合，才能检测共享状态泄漏',
  );
  const states = [];

  for (const [index, [course, filters]] of configurations.entries()) {
    if (index > 0) navigateTo(app, windowRef, `#${course.id}/interviews`);
    assert.equal(document.querySelectorAll('.interview-card').length, course.interviewQuestions.length);
    for (const name of Object.keys(filters)) {
      assert.equal(document.querySelector(`#interview-filter-${name}`).value, FILTER_ALL);
    }
    assert.equal(document.querySelectorAll('.answer-drawer').length, 0);
    states.push(configureCurrentModule(course, filters));
  }

  for (const { course, filters, count, questionId } of [...states, ...states]) {
    navigateTo(app, windowRef, `#${course.id}/interviews`);
    const rendered = Object.fromEntries(Object.keys(filters).map((name) => [
      name,
      document.querySelector(`#interview-filter-${name}`).value,
    ]));
    assert.deepEqual(rendered, filters, `${course.id} should restore only its interview filters`);
    for (const other of states.filter((state) => state.course.id !== course.id)) {
      assert.notDeepEqual(rendered, other.filters, `${course.id} must not inherit ${other.course.id}`);
    }
    assert.equal(document.querySelectorAll('.interview-card').length, count, course.id);
    assert.equal(document.querySelector(`#interview-reveal-${questionId}`).getAttribute('aria-expanded'), 'true');
    for (const other of states.filter((state) => state.course.id !== course.id)) {
      assert.equal(document.querySelector(`#interview-reveal-${other.questionId}`), null);
    }
  }
});

test('interview focus falls back to results summary when a status change removes the active card', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/interviews'),
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  const statusFilter = document.querySelector('#interview-filter-status');
  statusFilter.focus();
  dispatchChange(statusFilter, 'unseen');
  assert.equal(document.activeElement.id, 'interview-filter-status');

  const first = llmFoundation.interviewQuestions[0];
  const mastered = document.querySelector(`#interview-status-${first.id}-mastered`);
  mastered.focus();
  mastered.click();

  assert.equal(document.querySelector(`[data-question-id="${first.id}"]`), null);
  assert.equal(document.activeElement.id, 'interview-results-summary');
});

test('passive app render preserves a stable focused practice control', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/interviews'),
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  const filter = document.querySelector('#interview-filter-frequency');
  filter.focus();
  app.render();

  assert.equal(document.activeElement.id, 'interview-filter-frequency');
  assert.notEqual(document.activeElement, filter);
});

test('interview summaries ignore duplicate and stale mastered/review IDs', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const firstId = llmFoundation.interviewQuestions[0].id;
  renderInterviewPractice(root, {
    course: llmFoundation,
    progress: {
      ...createDefaultProgress('llm-foundation'),
      interviewStatusById: { [firstId]: 'mastered', stale: 'mastered' },
      reviewQueue: [firstId, firstId, 'stale'],
    },
  });

  assert.ok(root.textContent.includes('已掌握 1 / 24'));
  assert.ok(root.textContent.includes('复习队列 1 题'));
});

test('application progress scopes lesson, interview and quiz state across all five active modules', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const registeredCourses = Object.values(courseRegistry);
  const courses = [
    contextRagMemory,
    ...registeredCourses.filter(({ id }) => id !== contextRagMemory.id),
  ];
  const expected = courses.map((course, index) => ({
    course,
    count: index + 1,
    lessons: course.lessons.slice(0, index + 1),
    questions: course.interviewQuestions.slice(0, index + 1),
  }));
  const completedLessonIds = expected.flatMap(({ lessons }) => lessons.map(({ id }) => id));
  const interviewStatusById = Object.fromEntries(expected.flatMap(({ questions }) => (
    questions.map(({ id }) => [id, 'mastered'])
  )));
  const quizResults = Object.fromEntries(expected.flatMap(({ lessons }) => lessons.map(({ id }) => [
    id,
    { correct: 1, total: 2, percent: 50, results: [] },
  ])));
  const windowRef = createFakeWindow('#context-rag-memory/progress');
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: createStore({
      ...createDefaultProgress('llm-foundation'),
      completedLessonIds: [...completedLessonIds, 'stale-lesson'],
      interviewStatusById: { ...interviewStatusById, stale: 'mastered' },
      quizResults: { ...quizResults, stale: { correct: 1, total: 1, percent: 100, results: [] } },
    }),
  });
  t.after(app.teardown);

  for (const { course, count, lessons } of [...expected, ...expected]) {
    navigateTo(app, windowRef, `#${course.id}/progress`);
    assert.ok(
      document.querySelector('#progress-summary').textContent.includes(
        `课程 ${count} / ${course.lessons.length}`,
      ),
      course.id,
    );
    assert.ok(
      document.querySelector('#progress-summary').textContent.includes(
        `面试 ${count} / ${course.interviewQuestions.length}`,
      ),
      course.id,
    );
    const root = document.querySelector('#view-root');
    assert.deepEqual(
      root.querySelectorAll('.progress-ledger__summary strong').map(({ textContent }) => textContent),
      [`${count} / ${course.lessons.length}`, `${count} / ${course.interviewQuestions.length}`],
      course.id,
    );
    const completedList = root.querySelector('.completed-lesson-list');
    const quizLedger = root.querySelector('.quiz-result-ledger');
    assert.equal(completedList.querySelectorAll('li').length, count, course.id);
    assert.equal(quizLedger.querySelectorAll('li').length, count, course.id);
    for (const lesson of lessons) {
      assert.ok(completedList.textContent.includes(lesson.title), lesson.id);
      assert.ok(quizLedger.textContent.includes(lesson.title), lesson.id);
    }
  }
});

test('quiz callback receives a serializable score while visible feedback remains in the lesson', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const calls = [];
  renderLessonDetail(root, {
    course: llmFoundation,
    lessonId: 'llm-01',
    progress: createDefaultProgress('llm-foundation'),
    onQuizResult: (score, message) => calls.push({ score, message }),
  });

  const form = root.querySelector('form');
  for (const question of llmFoundation.lessons[0].quiz) {
    form.querySelector(`input[name="${question.id}"][value="${question.answerIndex}"]`).checked = true;
  }
  form.dispatchEvent(new FakeEvent('submit'));

  assert.deepEqual(calls[0].score, {
    correct: 2,
    total: 2,
    percent: 100,
    results: llmFoundation.lessons[0].quiz.map(({ explanation }) => ({ correct: true, explanation })),
  });
  assert.doesNotThrow(() => JSON.stringify(calls[0].score));
  assert.ok(calls[0].message.includes('得分 100%'));
  assert.ok(root.textContent.includes('得分 2 / 2（100%）'));
});

test('application persists quiz once without rerendering away feedback', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const store = createStore(createDefaultProgress('llm-foundation'));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/lesson/llm-01'),
    progressStore: store,
  });
  t.after(app.teardown);
  const form = document.querySelector('.quiz-form');
  for (const question of llmFoundation.lessons[0].quiz) {
    form.querySelector(`input[name="${question.id}"][value="${question.answerIndex}"]`).checked = true;
  }
  const savesBeforeSubmit = store.saves.length;

  form.dispatchEvent(new FakeEvent('submit'));

  assert.equal(store.saves.length, savesBeforeSubmit + 1);
  assert.equal(app.getState().quizResults['llm-01'].percent, 100);
  assert.match(app.getState().quizResults['llm-01'].completedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(document.querySelector('.quiz-results').textContent.includes('得分 2 / 2（100%）'));
  assert.ok(document.querySelector('#app-live-region').textContent.includes('测验完成'));
});

test('quiz save failure reveals memory notice without rerendering feedback or losing focus', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  let mode = 'local';
  let stored = createDefaultProgress('llm-foundation');
  const store = {
    load: () => structuredClone(stored),
    save(next) {
      stored = structuredClone(next);
      if (next.quizResults?.['llm-01']) mode = 'memory';
    },
    reset() {},
    mode: () => mode,
  };
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/lesson/llm-01'),
    progressStore: store,
  });
  t.after(app.teardown);
  const rootBefore = document.querySelector('#view-root');
  const formBefore = document.querySelector('.quiz-form');
  let focusedAnswer;
  for (const question of llmFoundation.lessons[0].quiz) {
    const answer = formBefore.querySelector(`input[name="${question.id}"][value="${question.answerIndex}"]`);
    answer.checked = true;
    focusedAnswer = answer;
  }
  focusedAnswer.focus();
  assert.equal(document.querySelector('#storage-notice').hidden, true);

  formBefore.dispatchEvent(new FakeEvent('submit'));

  assert.equal(mode, 'memory');
  assert.equal(document.querySelector('#storage-notice').hidden, false);
  assert.equal(document.querySelector('#view-root'), rootBefore);
  assert.equal(document.querySelector('.quiz-form'), formBefore);
  assert.equal(document.activeElement, focusedAnswer);
  assert.ok(document.querySelector('.quiz-results').textContent.includes('得分 2 / 2（100%）'));
});

test('progress view filters stale duplicate and malformed records to the current course', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const questionId = llmFoundation.interviewQuestions[0].id;
  const validQuiz = {
    correct: 1,
    total: 2,
    percent: 50,
    results: [{ correct: true, explanation: '有效解释' }],
  };
  const render = (quizResults) => renderProgressView(root, {
    course: llmFoundation,
    progress: {
      ...createDefaultProgress('llm-foundation'),
      completedLessonIds: ['llm-01', 'llm-01', 'stale-lesson'],
      quizResults,
      reviewQueue: [questionId, questionId, 'stale-question'],
    },
    summary: {
      lessonsCompleted: 1,
      lessonPercent: 13,
      interviewsMastered: 0,
      interviewPercent: 0,
    },
  });

  assert.doesNotThrow(() => render({
    'llm-01': validQuiz,
    'llm-02': null,
    'stale-lesson': validQuiz,
  }));
  assert.equal(root.querySelectorAll('.completed-lesson-list li').length, 1);
  assert.equal(root.querySelectorAll('.quiz-result-ledger li').length, 1);
  assert.equal(root.querySelectorAll('.review-queue-list li').length, 1);
  assert.equal(root.textContent.includes('stale-lesson'), false);
  assert.equal(root.textContent.includes('stale-question'), false);

  assert.doesNotThrow(() => render({ 'llm-01': null, 'stale-lesson': validQuiz }));
  assert.equal(root.querySelector('.quiz-result-ledger'), null);
  assert.ok(root.textContent.includes('尚无测验记录'));
});

test('progress reset requires in-page confirmation, resets once and restores meaningful focus', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const dirty = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01'],
    quizResults: { 'llm-01': { correct: 1, total: 2, percent: 50, results: [] } },
    reviewQueue: ['iq-llm-01-1'],
  };
  const store = createStore(dirty);
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/progress'),
    progressStore: store,
  });
  t.after(app.teardown);

  findButton(document, '重置学习进度').click();
  assert.equal(store.resetCount(), 0);
  assert.equal(document.activeElement.id, 'progress-reset-confirm-title');

  findButton(document, '取消').click();
  assert.equal(store.resetCount(), 0);
  assert.equal(document.activeElement.id, 'progress-reset-button');
  assert.deepEqual(app.getState().completedLessonIds, ['llm-01']);

  findButton(document, '重置学习进度').click();
  findButton(document, '确认重置').click();
  assert.equal(store.resetCount(), 1);
  assert.deepEqual(app.getState(), createDefaultProgress('llm-foundation'));
  assert.equal(store.saves.length, 0, '重置后不得立即把默认状态写回');
  assert.equal(document.activeElement.id, 'progress-reset-button');
  assert.ok(document.querySelector('#app-live-region').textContent.includes('学习进度已重置'));
});

test('token budget lab recomputes overflow live and reset restores the teaching defaults', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  renderLessonDetail(root, {
    course: llmFoundation,
    lessonId: 'llm-03',
    progress: createDefaultProgress('llm-foundation'),
  });

  const lab = root.querySelector('.token-budget-lab');
  const status = lab.querySelector('#token-budget-status');
  const initialStatus = status.textContent;
  assert.ok(initialStatus.includes('溢出：否'));
  assert.ok(lab.textContent.includes('不是真实 tokenizer'));

  const history = lab.querySelector('#token-budget-history');
  history.value = '4000';
  history.dispatchEvent(new FakeEvent('input'));
  assert.ok(status.textContent.includes('已用 6100 / 4096'));
  assert.ok(status.textContent.includes('超出 2004'));
  assert.ok(status.textContent.includes('溢出：是'));

  findButton(lab, '重置预算实验').click();
  assert.equal(history.value, '1200');
  assert.equal(status.textContent, initialStatus);
});

test('attention lab changes query and similarity while keeping displayed weights normalized', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  const lab = renderExperiment('attention');
  root.append(lab);
  const query = lab.querySelector('#attention-query-2');
  query.click();
  assert.equal(query.getAttribute('aria-pressed'), 'true');
  assert.equal(lab.querySelector('#attention-query-0').getAttribute('aria-pressed'), 'false');

  const summary = lab.querySelector('#attention-summary');
  const summaryAfterQuery = summary.textContent;
  const slider = lab.querySelector('#attention-score-4');
  slider.value = '10';
  slider.dispatchEvent(new FakeEvent('input'));
  assert.notEqual(summary.textContent, summaryAfterQuery);
  assert.ok(summary.textContent.includes('权重最高'));
  assert.ok(summary.textContent.includes('省略了学习得到的投影'));

  const total = lab.querySelectorAll('.attention-percent')
    .reduce((sum, output) => sum + Number.parseFloat(output.textContent), 0);
  assert.ok(Math.abs(total - 100) <= 0.2, `显示权重合计应约为 100%，实际为 ${total}`);

  findButton(lab, '重置注意力实验').click();
  assert.equal(lab.querySelector('#attention-query-0').getAttribute('aria-pressed'), 'true');
});

test('attention lab explains linear teaching weights and applies a causal mask without future leakage', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('attention');
  document.body.append(lab);

  assert.ok(lab.textContent.includes('非负手工分数并进行线性归一化'));
  assert.ok(lab.textContent.includes('softmax(QKᵀ / √dₖ + mask)'));
  assert.ok(lab.textContent.includes('Value 向量'));

  lab.querySelector('#attention-query-2').click();
  const causalMask = lab.querySelector('#attention-causal-mask');
  causalMask.checked = true;
  causalMask.dispatchEvent(new FakeEvent('change'));

  let rows = lab.querySelectorAll('.attention-row');
  for (const row of rows.slice(3)) {
    assert.ok(row.textContent.includes('已屏蔽'));
    assert.equal(row.querySelector('.attention-percent').textContent, '0.0%');
    assert.equal(row.querySelector('progress').value, 0);
  }
  assert.ok(lab.querySelector('#attention-summary').textContent.includes('不能读取未来 token'));

  for (const index of [0, 1, 2]) {
    const slider = lab.querySelector(`#attention-score-${index}`);
    slider.value = '0';
    slider.dispatchEvent(new FakeEvent('input'));
  }
  rows = lab.querySelectorAll('.attention-row');
  assert.deepEqual(
    rows.map((row) => row.querySelector('.attention-percent').textContent),
    ['33.3%', '33.3%', '33.3%', '0.0%', '0.0%'],
  );

  causalMask.checked = false;
  causalMask.dispatchEvent(new FakeEvent('change'));
  assert.equal(lab.querySelectorAll('.attention-row').some((row) => row.textContent.includes('已屏蔽')), false);

  causalMask.checked = true;
  causalMask.dispatchEvent(new FakeEvent('change'));
  findButton(lab, '重置注意力实验').click();
  assert.equal(causalMask.checked, false);
  assert.equal(lab.querySelector('#attention-query-0').getAttribute('aria-pressed'), 'true');
  assert.equal(lab.querySelectorAll('.attention-row').some((row) => row.textContent.includes('已屏蔽')), false);
});

test('sampling lab controls and presets update parameters and nucleus membership before reset', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  const lab = renderExperiment('sampling');
  root.append(lab);
  const temperature = lab.querySelector('#sampling-temperature');
  const topP = lab.querySelector('#sampling-top-p');
  const initialMembership = lab.querySelectorAll('.sampling-row')
    .map((row) => row.dataset.inNucleus);

  temperature.value = '2';
  temperature.dispatchEvent(new FakeEvent('input'));
  topP.value = '0.05';
  topP.dispatchEvent(new FakeEvent('input'));
  assert.equal(lab.querySelector('#sampling-temperature-value').textContent, '2.00');
  assert.equal(lab.querySelector('#sampling-top-p-value').textContent, '0.05');
  assert.ok(lab.textContent.includes('排除候选核'));

  findButton(lab, '稳定答案预设').click();
  assert.equal(temperature.value, '0.2');
  assert.equal(topP.value, '0.75');
  const stableMembership = lab.querySelectorAll('.sampling-row')
    .map((row) => row.dataset.inNucleus);

  findButton(lab, '创意写作预设').click();
  assert.equal(temperature.value, '1.2');
  assert.equal(topP.value, '0.95');
  const creativeMembership = lab.querySelectorAll('.sampling-row')
    .map((row) => row.dataset.inNucleus);
  assert.notDeepEqual(creativeMembership, stableMembership);
  assert.notDeepEqual(creativeMembership, initialMembership);
  assert.ok(lab.querySelector('#sampling-summary').textContent.includes('不保证'));

  findButton(lab, '重置采样实验').click();
  assert.equal(temperature.value, '1');
  assert.equal(topP.value, '0.9');
});

test('prototype-inherited experiment IDs use the accessible unavailable note', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  for (const experimentId of ['toString', 'constructor']) {
    const unavailable = renderExperiment(experimentId);
    assert.equal(unavailable.tagName, 'SECTION', experimentId);
    assert.equal(unavailable.getAttribute('role'), 'status', experimentId);
    assert.ok(unavailable.textContent.includes('暂不可用'), experimentId);
    const headingId = unavailable.getAttribute('aria-labelledby');
    assert.ok(headingId, experimentId);
    assert.notEqual(unavailable.querySelector(`#${headingId}`), null, experimentId);
  }
});

test('Agent decision live regions contain a semantically valid definition list', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  for (const [experimentId, resultId] of [
    ['agent-loop', '#agent-loop-result'],
    ['plan-recovery', '#plan-recovery-result'],
  ]) {
    const lab = renderExperiment(experimentId);
    document.body.append(lab);
    const result = lab.querySelector(resultId);
    assert.equal(result.tagName, 'DIV', experimentId);
    assert.equal(result.getAttribute('aria-live'), 'polite', experimentId);
    assert.equal(result.getAttribute('aria-atomic'), 'true', experimentId);
    const ledger = result.querySelector('dl');
    assert.notEqual(ledger, null, experimentId);
    assert.equal(ledger.children.every((child) => child.tagName === 'DIV'), true, experimentId);
    assert.equal(result.children.some((child) => ['DT', 'DD'].includes(child.tagName)), false, experimentId);
  }
});

test('loop and plan labs visibly state their deterministic teaching boundaries', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  for (const experimentId of ['agent-loop', 'plan-recovery']) {
    const lab = renderExperiment(experimentId);
    document.body.append(lab);
    const caveat = lab.querySelector('.experiment-caveat');
    assert.notEqual(caveat, null, experimentId);
    assert.ok(caveat.textContent.includes('确定性教学模拟'), experimentId);
    assert.ok(caveat.textContent.includes('不调用真实模型'), experimentId);
    assert.ok(caveat.textContent.includes('不调用第三方 API'), experimentId);
  }
  const planCaveat = document.querySelector('.plan-recovery-lab .experiment-caveat');
  assert.match(planCaveat.textContent, /不(?:模拟|证明)[^。]*真实模型[^。]*规划能力/);
  assert.match(planCaveat.textContent, /固定为[^。]*只读[^。]*供应商查询/);
  assert.match(planCaveat.textContent, /retry[^。]*仅适用于[^。]*无副作用读操作/);
});

test('Agent loop lab exposes core decisions, invalid input and a focused reset state', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('agent-loop');
  document.body.append(lab);

  const result = lab.querySelector('#agent-loop-result');
  const goalSatisfied = lab.querySelector('#agent-loop-goal-satisfied');
  const blocked = lab.querySelector('#agent-loop-blocked');
  const stepsUsed = lab.querySelector('#agent-loop-steps-used');
  const maxSteps = lab.querySelector('#agent-loop-max-steps');
  assert.equal(result.dataset.status, 'continue');
  assert.ok(result.textContent.includes('继续执行：是'));

  goalSatisfied.checked = true;
  goalSatisfied.dispatchEvent(new FakeEvent('change'));
  blocked.checked = true;
  blocked.dispatchEvent(new FakeEvent('change'));
  assert.equal(result.dataset.status, 'done');
  assert.ok(result.textContent.includes('完成证据'));

  goalSatisfied.checked = false;
  goalSatisfied.dispatchEvent(new FakeEvent('change'));
  assert.equal(result.dataset.status, 'blocked');
  assert.ok(result.textContent.includes('人工介入'));

  blocked.checked = false;
  blocked.dispatchEvent(new FakeEvent('change'));
  stepsUsed.value = '5';
  stepsUsed.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'budget-exhausted');
  assert.ok(result.textContent.includes('最大步骤预算'));

  maxSteps.value = '';
  maxSteps.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('必须是有限正整数'));

  findButton(lab, '重置循环实验').click();
  assert.equal(goalSatisfied.checked, false);
  assert.equal(blocked.checked, false);
  assert.equal(stepsUsed.value, '2');
  assert.equal(maxSteps.value, '5');
  assert.equal(result.dataset.status, 'continue');
  assert.equal(document.activeElement, goalSatisfied);
});

test('tool contract lab validates all five presets and resets to a focused ready invocation', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('tool-contract');
  document.body.append(lab);

  const preset = lab.querySelector('#tool-contract-preset');
  const result = lab.querySelector('#tool-contract-result');
  const invocation = lab.querySelector('#tool-contract-invocation');
  assert.equal(preset.value, 'valid-low');
  assert.equal(preset.children.length, 5);
  assert.equal(result.dataset.status, 'ready');
  assert.ok(invocation.textContent.includes('search_docs'));

  dispatchChange(preset, 'missing-required');
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('缺少必填字段 "query"'));
  assert.equal(result.querySelectorAll('ul li').length, 1);

  dispatchChange(preset, 'invalid-enum');
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('字段 "scope" 必须是以下值之一: docs, code'));
  assert.equal(result.querySelectorAll('ul li').length, 1);

  dispatchChange(preset, 'extra-field');
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('不允许额外字段 "debug"'));
  assert.equal(result.querySelectorAll('ul li').length, 1);
  assert.ok(invocation.textContent.includes('"debug"'));

  dispatchChange(preset, 'high-risk');
  assert.equal(result.dataset.status, 'approval-required');
  assert.ok(result.textContent.includes('需要人工审批'));
  assert.ok(invocation.textContent.includes('delete_index'));

  findButton(lab, '重置工具契约实验').click();
  assert.equal(preset.value, 'valid-low');
  assert.equal(result.dataset.status, 'ready');
  assert.equal(document.activeElement, preset);
});

test('plan recovery lab reaches every recovery branch, handles invalid numbers and resets focus', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('plan-recovery');
  document.body.append(lab);

  const strategy = lab.querySelector('#plan-recovery-strategy');
  const observation = lab.querySelector('#plan-recovery-observation');
  const retriesUsed = lab.querySelector('#plan-recovery-retries-used');
  const maxRetries = lab.querySelector('#plan-recovery-max-retries');
  const result = lab.querySelector('#plan-recovery-result');
  assert.equal(result.dataset.status, 'retry');

  dispatchChange(observation, 'empty-result');
  assert.equal(result.dataset.status, 'replace-step');
  dispatchChange(strategy, 'reactive');
  assert.equal(result.dataset.status, 'switch-action');
  dispatchChange(observation, 'new-constraint');
  assert.equal(result.dataset.status, 'replan');
  dispatchChange(strategy, 'fixed');
  dispatchChange(observation, 'empty-result');
  assert.equal(result.dataset.status, 'blocked');

  retriesUsed.value = '';
  retriesUsed.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('必须是有限非负整数'));

  findButton(lab, '重置计划恢复实验').click();
  assert.equal(strategy.value, 'hybrid');
  assert.equal(observation.value, 'timeout');
  assert.equal(retriesUsed.value, '0');
  assert.equal(maxRetries.value, '2');
  assert.equal(result.dataset.status, 'retry');
  assert.equal(document.activeElement, strategy);
});

test('Agent Harness labs render accessible headings and atomic live results', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  for (const [experimentId, resultId] of [
    ['run-lifecycle', 'harness-lifecycle-result'],
    ['retry-resume', 'harness-resume-result'],
    ['queue-backpressure', 'harness-queue-result'],
  ]) {
    const lab = renderExperiment(experimentId);
    document.body.append(lab);
    assert.ok(lab.className.includes('experiment-lab'), experimentId);
    const headingId = lab.getAttribute('aria-labelledby');
    assert.ok(headingId, experimentId);
    assert.notEqual(lab.querySelector(`#${headingId}`), null, experimentId);
    const result = lab.querySelector(`#${resultId}`);
    assert.notEqual(result, null, experimentId);
    assert.ok(result.className.includes('harness-metrics-grid'), experimentId);
    assert.equal(result.getAttribute('aria-live'), 'polite', experimentId);
    assert.equal(result.getAttribute('aria-atomic'), 'true', experimentId);
  }
});

test('run lifecycle lab applies ordered events, rejects illegal transitions and resets focus', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('run-lifecycle');
  document.body.append(lab);

  const result = lab.querySelector('#harness-lifecycle-result');
  const enqueue = lab.querySelector('#harness-event-enqueue');
  assert.equal(result.dataset.status, 'created');
  assert.ok(result.textContent.includes('sequence：0'));
  assert.ok(lab.textContent.includes('确定性状态机模拟'));
  assert.ok(lab.textContent.includes('不是真实 worker'));
  assert.ok(lab.textContent.includes('持久层'));
  for (const eventType of [
    'enqueue', 'start', 'request-approval', 'approve', 'schedule-retry', 'retry',
    'block', 'resume', 'step', 'complete', 'fail', 'cancel', 'timeout',
  ]) {
    assert.notEqual(lab.querySelector(`#harness-event-${eventType}`), null, eventType);
  }

  lab.querySelector('#harness-event-start').click();
  assert.equal(result.dataset.status, 'rejected');
  assert.ok(result.textContent.includes('illegal transition'));
  assert.ok(result.textContent.includes('状态：created'));

  enqueue.click();
  assert.equal(result.dataset.status, 'queued');
  lab.querySelector('#harness-event-start').click();
  assert.equal(result.dataset.status, 'running');
  lab.querySelector('#harness-event-request-approval').click();
  assert.equal(result.dataset.status, 'awaiting_approval');
  assert.ok(result.textContent.includes('refund-001'));
  lab.querySelector('#harness-event-approve').click();
  assert.equal(result.dataset.status, 'running');
  assert.ok(result.textContent.includes('sequence：4'));
  assert.ok(result.textContent.includes('pending approval：无'));

  lab.querySelector('#harness-lifecycle-reset').click();
  assert.equal(result.dataset.status, 'created');
  assert.ok(result.textContent.includes('steps：0'));
  assert.equal(document.activeElement, enqueue);
});

test('retry resume lab reaches manual, reconcile, skip, retry and fail decisions', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('retry-resume');
  document.body.append(lab);

  const crashPoint = lab.querySelector('#harness-resume-crash-point');
  const callKind = lab.querySelector('#harness-resume-call-kind');
  const completion = lab.querySelector('#harness-resume-completion');
  const errorKind = lab.querySelector('#harness-resume-error-kind');
  const key = lab.querySelector('#harness-resume-key');
  const record = lab.querySelector('#harness-resume-record');
  const remote = lab.querySelector('#harness-resume-remote');
  const attempts = lab.querySelector('#harness-resume-attempts');
  const maxAttempts = lab.querySelector('#harness-resume-max-attempts');
  const result = lab.querySelector('#harness-resume-result');

  assert.equal(result.dataset.status, 'manual');
  assert.ok(result.textContent.includes('completionEvent'));
  assert.ok(lab.textContent.includes('可重试错误不等于副作用可安全重放'));

  dispatchChange(remote, 'succeeded');
  assert.equal(result.dataset.status, 'reconcile');
  assert.ok(result.textContent.includes('completionEvent'));
  completion.checked = true;
  completion.dispatchEvent(new FakeEvent('change'));
  assert.equal(result.dataset.status, 'skip');

  completion.checked = false;
  completion.dispatchEvent(new FakeEvent('change'));
  dispatchChange(remote, 'none');
  dispatchChange(callKind, 'read');
  dispatchChange(errorKind, 'transient');
  assert.equal(result.dataset.status, 'retry');
  assert.ok(result.textContent.includes('1300'));

  dispatchChange(errorKind, 'permanent');
  assert.equal(result.dataset.status, 'fail');
  attempts.value = '';
  attempts.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('non-negative safe integer'));

  key.checked = true;
  key.dispatchEvent(new FakeEvent('change'));
  dispatchChange(record, 'pending');
  maxAttempts.value = '8';
  maxAttempts.dispatchEvent(new FakeEvent('input'));
  lab.querySelector('#harness-resume-reset').click();
  assert.equal(callKind.value, 'write');
  assert.equal(completion.checked, false);
  assert.equal(errorKind.value, 'unknown');
  assert.equal(key.checked, false);
  assert.equal(record.value, 'none');
  assert.equal(remote.value, 'none');
  assert.equal(attempts.value, '0');
  assert.equal(maxAttempts.value, '3');
  assert.equal(crashPoint.value, 'unknown-outcome');
  assert.equal(result.dataset.status, 'manual');
  assert.equal(document.activeElement, callKind);
});

test('retry resume crash-point presets synchronize evidence and manual edits switch to custom', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('retry-resume');
  document.body.append(lab);

  const crashPoint = lab.querySelector('#harness-resume-crash-point');
  const callKind = lab.querySelector('#harness-resume-call-kind');
  const completion = lab.querySelector('#harness-resume-completion');
  const errorKind = lab.querySelector('#harness-resume-error-kind');
  const record = lab.querySelector('#harness-resume-record');
  const remote = lab.querySelector('#harness-resume-remote');
  const result = lab.querySelector('#harness-resume-result');

  assert.deepEqual(
    crashPoint.children.map((option) => option.value),
    ['unknown-outcome', 'before-call', 'after-remote-success', 'after-completion-event', 'custom'],
  );
  assert.equal(crashPoint.value, 'unknown-outcome');
  assert.equal(result.dataset.status, 'manual');

  dispatchChange(crashPoint, 'before-call');
  assert.equal(callKind.value, 'read');
  assert.equal(errorKind.value, 'transient');
  assert.equal(completion.checked, false);
  assert.equal(record.value, 'none');
  assert.equal(remote.value, 'none');
  assert.equal(result.dataset.status, 'retry');

  dispatchChange(crashPoint, 'after-remote-success');
  assert.equal(callKind.value, 'write');
  assert.equal(errorKind.value, 'unknown');
  assert.equal(remote.value, 'succeeded');
  assert.equal(result.dataset.status, 'reconcile');

  dispatchChange(crashPoint, 'after-completion-event');
  assert.equal(completion.checked, true);
  assert.equal(result.dataset.status, 'skip');

  dispatchChange(crashPoint, 'before-call');
  dispatchChange(errorKind, 'permanent');
  assert.equal(crashPoint.value, 'custom');
  assert.equal(result.dataset.status, 'fail');
});

test('queue backpressure lab reports exact tick flow, advances age and resets invalid input', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('queue-backpressure');
  document.body.append(lab);

  const arrivals = lab.querySelector('#harness-queue-arrivals');
  const workers = lab.querySelector('#harness-queue-workers');
  const service = lab.querySelector('#harness-queue-service');
  const limit = lab.querySelector('#harness-queue-limit');
  const tick = lab.querySelector('#harness-queue-tick');
  const result = lab.querySelector('#harness-queue-result');
  assert.ok(lab.textContent.includes('离散 tick 教学模拟'));
  assert.ok(lab.textContent.includes('不是分布式队列'));
  assert.equal(result.dataset.status, 'healthy');

  tick.click();
  assert.equal(result.dataset.status, 'overloaded');
  assert.ok(result.textContent.includes('started：job-001'));
  assert.ok(result.textContent.includes('queued：job-002、job-003'));
  assert.ok(result.textContent.includes('rejected：job-004'));
  assert.ok(result.textContent.includes('utilization：100%'));

  tick.click();
  assert.ok(result.textContent.includes('running：job-001 (remaining 1)'));
  assert.ok(result.textContent.includes('oldest age：1'));
  assert.ok(result.textContent.includes('rejected：job-005、job-006、job-007、job-008'));

  workers.value = '';
  workers.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'invalid');
  assert.ok(result.textContent.includes('non-negative safe integer'));

  arrivals.value = '1';
  service.value = '2';
  limit.value = '5';
  lab.querySelector('#harness-queue-reset').click();
  assert.equal(arrivals.value, '4');
  assert.equal(workers.value, '1');
  assert.equal(service.value, '1');
  assert.equal(limit.value, '2');
  assert.equal(result.dataset.status, 'healthy');
  assert.ok(result.textContent.includes('running：无'));
  assert.equal(document.activeElement, tick);
});

function assertContextLabAccessibility(lab, resultId) {
  const headingId = lab.getAttribute('aria-labelledby');
  assert.ok(headingId);
  assert.notEqual(lab.querySelector(`#${headingId}`), null);

  const result = lab.querySelector(`#${resultId}`);
  assert.notEqual(result, null);
  assert.equal(result.getAttribute('aria-live'), 'polite');
  assert.equal(result.getAttribute('aria-atomic'), 'true');
  const resultHeadingId = result.getAttribute('aria-labelledby');
  assert.ok(resultHeadingId);
  assert.notEqual(lab.querySelector(`#${resultHeadingId}`), null);

  for (const control of lab.querySelectorAll('input').concat(lab.querySelectorAll('select'))) {
    assert.ok(control.id, `${control.tagName} control should have an id`);
    assert.notEqual(lab.querySelector(`label[for="${control.id}"]`), null, control.id);
  }
}

test('context router experiment assembles fixed projections live and resets budget with focus', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('context-router');
  document.body.append(lab);

  assertContextLabAccessibility(lab, 'context-router-result');
  assert.ok(lab.className.includes('context-router-lab'));
  assert.ok(lab.textContent.includes('固定教学条目'));
  assert.ok(lab.textContent.includes('不接收真实敏感内容'));
  assert.notEqual(lab.querySelector('.context-manifest__included'), null);
  assert.notEqual(lab.querySelector('.context-manifest__excluded'), null);

  const strategy = lab.querySelector('#context-router-strategy');
  const inputLimit = lab.querySelector('#context-router-input-limit');
  const outputReserve = lab.querySelector('#context-router-output-reserve');
  const result = lab.querySelector('#context-router-result');
  const initial = result.textContent;

  strategy.focus();
  dispatchChange(strategy, 'evidence-first');
  assert.equal(document.activeElement, strategy);
  assert.notEqual(result.textContent, initial);
  assert.ok(result.textContent.includes('evidence-first'));

  inputLimit.value = '400';
  inputLimit.dispatchEvent(new FakeEvent('input'));
  outputReserve.value = '300';
  outputReserve.dispatchEvent(new FakeEvent('input'));
  assert.equal(result.dataset.status, 'unassemblable');
  assert.ok(result.textContent.includes('required-budget-exceeded'));

  lab.querySelector('#context-router-reset').click();
  assert.equal(strategy.value, 'recent-first');
  assert.equal(inputLimit.value, '1600');
  assert.equal(outputReserve.value, '400');
  assert.equal(result.dataset.status, 'ready');
  assert.equal(document.activeElement, strategy);
});

test('hybrid retrieval experiment filters and packs ranked teaching evidence before reset', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('hybrid-retrieval');
  document.body.append(lab);

  assertContextLabAccessibility(lab, 'hybrid-retrieval-result');
  assert.ok(lab.className.includes('hybrid-retrieval-lab'));
  assert.ok(lab.textContent.includes('教学分数'));
  for (const selector of [
    '.retrieval-trace', '.retrieval-ranking', '.retrieval-packed', '.retrieval-citations',
  ]) assert.notEqual(lab.querySelector(selector), null, selector);

  const query = lab.querySelector('#hybrid-query-preset');
  const department = lab.querySelector('#hybrid-department');
  const language = lab.querySelector('#hybrid-language');
  const latest = lab.querySelector('#hybrid-latest-version');
  const alpha = lab.querySelector('#hybrid-alpha');
  const topK = lab.querySelector('#hybrid-top-k');
  const threshold = lab.querySelector('#hybrid-threshold');
  const dedupe = lab.querySelector('#hybrid-dedupe');
  const budget = lab.querySelector('#hybrid-budget');
  const result = lab.querySelector('#hybrid-retrieval-result');
  const initial = result.textContent;

  department.focus();
  dispatchChange(department, 'engineering');
  assert.equal(document.activeElement, department);
  assert.notEqual(result.textContent, initial);
  assert.ok(result.textContent.includes('metadata-filtered'));

  dispatchChange(query, 'memory-preference');
  dispatchChange(language, 'zh');
  latest.checked = false;
  latest.dispatchEvent(new FakeEvent('change'));
  alpha.value = '0.25';
  alpha.dispatchEvent(new FakeEvent('input'));
  topK.value = '2';
  topK.dispatchEvent(new FakeEvent('input'));
  threshold.value = '0.1';
  threshold.dispatchEvent(new FakeEvent('input'));
  dedupe.checked = false;
  dedupe.dispatchEvent(new FakeEvent('change'));
  budget.value = '180';
  budget.dispatchEvent(new FakeEvent('input'));
  assert.ok(result.textContent.includes('packed evidence'));
  assert.ok(result.textContent.includes('citation manifest'));

  lab.querySelector('#hybrid-retrieval-reset').click();
  assert.equal(query.value, 'refund-policy');
  assert.equal(department.value, 'all');
  assert.equal(language.value, 'all');
  assert.equal(latest.checked, true);
  assert.equal(alpha.value, '0.6');
  assert.equal(topK.value, '4');
  assert.equal(threshold.value, '0.2');
  assert.equal(dedupe.checked, true);
  assert.equal(budget.value, '520');
  assert.equal(document.activeElement, query);
});

test('memory lifecycle experiment applies preset events and keeps recall subject scoped', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('memory-lifecycle');
  document.body.append(lab);

  assertContextLabAccessibility(lab, 'memory-lifecycle-result');
  assert.ok(lab.className.includes('memory-lifecycle-lab'));
  assert.ok(lab.textContent.includes('逻辑时钟'));
  assert.ok(lab.textContent.includes('非真实隐私存储'));
  for (const eventType of ['observe', 'explicit-save', 'correct', 'delete', 'advance-time']) {
    assert.notEqual(lab.querySelector(`#memory-event-${eventType}`), null, eventType);
  }

  const result = lab.querySelector('#memory-lifecycle-result');
  const observe = lab.querySelector('#memory-event-observe');
  observe.focus();
  observe.click();
  assert.equal(document.activeElement, observe);
  assert.equal(result.dataset.action, 'store');
  assert.ok(result.textContent.includes('active records'));

  lab.querySelector('#memory-event-explicit-save').click();
  lab.querySelector('#memory-event-correct').click();
  assert.equal(result.dataset.action, 'supersede');
  assert.ok(result.textContent.includes('superseded records'));

  lab.querySelector('#memory-event-advance-time').click();
  assert.equal(result.dataset.action, 'expire');
  assert.ok(result.textContent.includes('expired records'));
  lab.querySelector('#memory-event-delete').click();
  assert.equal(result.dataset.action, 'delete');
  assert.ok(result.textContent.includes('deleted records'));

  const subject = lab.querySelector('#memory-recall-subject');
  const recallBefore = lab.querySelector('.memory-recall').textContent;
  dispatchChange(subject, 'learner-b');
  assert.notEqual(lab.querySelector('.memory-recall').textContent, recallBefore);
  assert.ok(lab.querySelector('.memory-recall').textContent.includes('learner-b'));

  lab.querySelector('#memory-lifecycle-reset').click();
  assert.equal(subject.value, 'learner-a');
  assert.equal(result.dataset.action, 'idle');
  assert.ok(result.textContent.includes('active records：无'));
  assert.equal(document.activeElement, observe);
});

test('stream lifecycle lab renders typed events, propagation state and a focused reset', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('stream-lifecycle');
  document.body.append(lab);

  const result = lab.querySelector('#backend-stream-result');
  assert.equal(result.getAttribute('aria-live'), 'polite');
  assert.equal(result.getAttribute('aria-atomic'), 'true');
  assert.ok(lab.querySelector(`#${lab.getAttribute('aria-labelledby')}`));
  for (const controlId of [
    'backend-stream-mode',
    'backend-stream-delta-count',
    'backend-stream-disconnect-after',
    'backend-stream-cancel-after',
    'backend-stream-fail-after',
    'backend-stream-upstream-cancellable',
  ]) {
    assert.notEqual(lab.querySelector(`label[for="${controlId}"]`), null, controlId);
  }
  assert.deepEqual(
    lab.querySelectorAll('.backend-event').map((event) => event.dataset.eventType),
    ['created', 'delta', 'delta', 'delta', 'completed'],
  );
  assert.match(result.textContent, /客户端状态.*completed/);
  assert.match(result.textContent, /上游状态.*completed/);
  assert.ok(result.textContent.includes('release-request-resources'));
  assert.ok(lab.querySelector('.experiment-caveat').textContent.includes('确定性教学模拟'));

  const disconnect = lab.querySelector('#backend-stream-disconnect-after');
  const upstreamCancellable = lab.querySelector('#backend-stream-upstream-cancellable');
  upstreamCancellable.checked = false;
  upstreamCancellable.dispatchEvent(new FakeEvent('change'));
  disconnect.value = '1';
  disconnect.dispatchEvent(new FakeEvent('input'));
  assert.deepEqual(
    lab.querySelectorAll('.backend-event').map((event) => event.dataset.eventType),
    ['created', 'delta', 'disconnected'],
  );
  assert.match(result.textContent, /客户端状态.*disconnected/);
  assert.match(result.textContent, /上游状态.*continuing/);
  assert.ok(result.textContent.includes('observe-upstream-until-terminal'));

  lab.querySelector('#backend-stream-reset').click();
  assert.equal(disconnect.value, '');
  assert.equal(upstreamCancellable.checked, true);
  assert.match(result.textContent, /客户端状态.*completed/);
  assert.equal(document.activeElement, lab.querySelector('#backend-stream-mode'));
});

test('service admission lab exposes its window math, all outcomes and mean-model boundary', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('service-admission');
  document.body.append(lab);

  const result = lab.querySelector('#backend-admission-result');
  assert.equal(result.getAttribute('aria-live'), 'polite');
  assert.equal(result.getAttribute('aria-atomic'), 'true');
  for (const controlId of [
    'backend-admission-arrival-rate',
    'backend-admission-service-time',
    'backend-admission-slots',
    'backend-admission-queue-limit',
    'backend-admission-deadline',
  ]) {
    assert.notEqual(lab.querySelector(`label[for="${controlId}"]`), null, controlId);
  }
  for (const field of ['window', 'capacity', 'immediate', 'queued', 'rejected', 'timedOut']) {
    assert.ok(result.textContent.includes(field), field);
  }
  assert.match(result.textContent, /not a p95 or p99 prediction/);
  assert.ok(lab.textContent.includes('均值模型'));

  const deadline = lab.querySelector('#backend-admission-deadline');
  deadline.value = '400';
  deadline.dispatchEvent(new FakeEvent('input'));
  assert.match(result.textContent, /timedOut.*11/);
  assert.match(result.textContent, /rejected.*1/);

  lab.querySelector('#backend-admission-reset').click();
  assert.equal(deadline.value, '1000');
  assert.match(result.textContent, /timedOut.*0/);
  assert.equal(document.activeElement, lab.querySelector('#backend-admission-arrival-rate'));
});

test('job delivery lab drives every event and exposes delivery, idempotency and reconciliation history', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('job-delivery-ledger');
  document.body.append(lab);

  const summary = lab.querySelector('#backend-delivery-summary');
  const result = lab.querySelector('#backend-delivery-result');
  assert.equal(summary.getAttribute('aria-live'), 'polite');
  assert.equal(summary.getAttribute('aria-atomic'), 'true');
  assert.equal(result.getAttribute('aria-live'), null);
  assert.equal(result.getAttribute('aria-atomic'), null);
  assert.equal(lab.querySelector('.backend-delivery-history').getAttribute('aria-live'), null);
  for (const type of [
    'submit',
    'enqueue',
    'lease',
    'start',
    'commit',
    'ack',
    'crash',
    'redeliver',
    'cancel',
    'reconcile',
  ]) {
    assert.notEqual(lab.querySelector(`#backend-delivery-event-${type}`), null, type);
  }
  for (const controlId of [
    'backend-delivery-job-id',
    'backend-delivery-idempotency-key',
    'backend-delivery-worker-id',
    'backend-delivery-result-ref',
    'backend-delivery-reconcile-outcome',
  ]) {
    assert.notEqual(lab.querySelector(`label[for="${controlId}"]`), null, controlId);
  }
  assert.match(result.textContent, /delivery status.*empty/);
  assert.match(result.textContent, /idempotency status.*none/);
  for (const boundary of [
    'client state',
    'message state',
    'effect ledger',
    'idempotency ledger',
  ]) {
    assert.match(result.textContent, new RegExp(boundary), boundary);
  }

  for (const type of ['submit', 'enqueue', 'lease', 'start', 'commit', 'crash']) {
    lab.querySelector(`#backend-delivery-event-${type}`).click();
  }
  assert.match(result.textContent, /delivery status.*unknown/);
  assert.match(result.textContent, /idempotency status.*unknown/);
  assert.match(result.textContent, /unknownReason.*result-commit/);
  assert.ok(result.textContent.includes('confirm-result-commit'));
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 6);

  lab.querySelector('#backend-delivery-event-redeliver').click();
  assert.ok(result.textContent.includes('reconcile-required'));
  lab.querySelector('#backend-delivery-event-reconcile').click();
  assert.match(result.textContent, /delivery status.*committed/);
  lab.querySelector('#backend-delivery-event-ack').click();
  assert.match(result.textContent, /delivery status.*acknowledged/);
  assert.ok(result.textContent.includes('result://report-001'));

  lab.querySelector('#backend-delivery-reset').click();
  assert.match(result.textContent, /delivery status.*empty/);
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 0);
  assert.equal(document.activeElement, lab.querySelector('#backend-delivery-event-submit'));

  for (const type of ['submit', 'enqueue', 'lease', 'start', 'cancel']) {
    lab.querySelector(`#backend-delivery-event-${type}`).click();
  }
  assert.match(result.textContent, /delivery status.*unknown/);
  assert.match(result.textContent, /unknownReason.*cancellation-outcome/);
  assert.ok(result.textContent.includes('confirm-cancellation-outcome'));
  dispatchChange(lab.querySelector('#backend-delivery-reconcile-outcome'), 'not-committed');
  lab.querySelector('#backend-delivery-event-reconcile').click();
  assert.match(result.textContent, /delivery status.*cancelled/);
});

test('job delivery lab keeps rejected and invalid UI attempts visible without mutating core state', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lab = renderExperiment('job-delivery-ledger');
  document.body.append(lab);

  const result = lab.querySelector('#backend-delivery-result');
  const summary = lab.querySelector('#backend-delivery-summary');
  const jobId = lab.querySelector('#backend-delivery-job-id');
  const submit = lab.querySelector('#backend-delivery-event-submit');
  const ack = lab.querySelector('#backend-delivery-event-ack');

  ack.click();
  assert.match(summary.textContent, /ui-01-ack.*rejected/);
  assert.match(result.textContent, /delivery status.*empty/);
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 0);
  assert.equal(lab.querySelectorAll('.backend-delivery-attempt').length, 1);
  assert.match(
    lab.querySelector('.backend-delivery-attempt').textContent,
    /ui-01-ack.*illegal ack transition from empty/,
  );

  jobId.value = '   ';
  submit.click();
  assert.match(summary.textContent, /ui-02-submit.*invalid-input/);
  assert.match(result.textContent, /delivery status.*empty/);
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 0);
  assert.equal(lab.querySelectorAll('.backend-delivery-attempt').length, 2);
  assert.match(
    lab.querySelectorAll('.backend-delivery-attempt').at(-1).textContent,
    /ui-02-submit.*event\.jobId must not be empty/,
  );

  jobId.value = 'job-report-001';
  submit.click();
  assert.match(summary.textContent, /ui-03-submit.*applied/);
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 1);
  assert.match(lab.querySelector('.backend-delivery-entry').textContent, /ui-03-submit/);
  assert.equal(lab.querySelectorAll('.backend-delivery-attempt').length, 3);

  for (let attempt = 0; attempt < 30; attempt += 1) ack.click();
  assert.equal(lab.querySelectorAll('.backend-delivery-attempt').length, 24);
  assert.doesNotMatch(result.textContent, /ui-01-ack/);
  assert.match(
    lab.querySelectorAll('.backend-delivery-attempt').at(-1).textContent,
    /ui-33-ack.*rejected/,
  );
  assert.match(result.textContent, /delivery status.*submitted/);
  assert.equal(lab.querySelectorAll('.backend-delivery-entry').length, 1);
});

test('unknown experiment degrades to an accessible note and lesson rerender creates one lab', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  const unavailable = renderExperiment('not-configured');
  assert.equal(unavailable.getAttribute('role'), 'status');
  assert.ok(unavailable.textContent.includes('暂不可用'));

  const options = {
    course: llmFoundation,
    lessonId: 'llm-03',
    progress: createDefaultProgress('llm-foundation'),
  };
  renderLessonDetail(root, options);
  renderLessonDetail(root, options);
  assert.equal(root.querySelectorAll('.experiment-lab').length, 1);

  const history = root.querySelector('#token-budget-history');
  history.value = '1400';
  history.dispatchEvent(new FakeEvent('input'));
  assert.equal(root.querySelector('#token-budget-status').textContent.match(/已用/g)?.length, 1);
});

test('every configured experiment has a resolvable accessible heading and is integrated in its lesson', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  const courses = Object.values(courseRegistry);
  const configured = courses.flatMap((course) => course.lessons
    .filter((lesson) => lesson.exercise.experiment)
    .map((lesson) => ({ course, lesson, experimentId: lesson.exercise.experiment })));
  assert.deepEqual(
    configured
      .filter(({ course }) => course.id === contextRagMemory.id)
      .map(({ lesson, experimentId }) => [lesson.id, experimentId]),
    [
      ['context-02', 'context-router'],
      ['context-05', 'hybrid-retrieval'],
      ['context-07', 'memory-lifecycle'],
    ],
  );

  for (const { course, lesson, experimentId } of configured) {
    const resolved = renderExperiment(experimentId);
    const resolvedHeadingId = resolved.getAttribute('aria-labelledby');
    assert.ok(resolvedHeadingId, experimentId);
    assert.notEqual(resolved.querySelector(`#${resolvedHeadingId}`), null, experimentId);

    renderLessonDetail(root, {
      course,
      lessonId: lesson.id,
      progress: createDefaultProgress(course.id),
    });
    assert.equal(root.querySelectorAll('.experiment-lab').length, 1, experimentId);
    const lab = root.querySelector('.experiment-lab');
    const headingId = lab.getAttribute('aria-labelledby');
    assert.ok(headingId, experimentId);
    assert.notEqual(lab.querySelector(`#${headingId}`), null, experimentId);
  }
});

test('real application activates AI backend engineering, switches all modules and renders six views, quiz and labs', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const windowRef = createFakeWindow('#agent-mechanism/dashboard');
  const store = createStore(createDefaultProgress('llm-foundation'));
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: store,
  });
  t.after(app.teardown);

  dispatchChange(document.querySelector('#module-select'), backendEngineering.id);
  windowRef.dispatchEvent(new FakeEvent('hashchange'));
  assert.equal(windowRef.location.hash, '#backend-engineering/dashboard');
  assert.equal(document.querySelector('#current-module-title').textContent, backendEngineering.title);
  assert.ok(document.querySelector('#progress-summary').textContent.includes('课程 0 / 8'));
  assert.ok(document.querySelector('#progress-summary').textContent.includes('面试 0 / 24'));

  const priorCourses = Object.values(courseRegistry)
    .filter(({ id }) => id !== backendEngineering.id);
  for (const course of priorCourses) {
    document.querySelector('#module-select').focus();
    dispatchChange(document.querySelector('#module-select'), course.id);
    windowRef.dispatchEvent(new FakeEvent('hashchange'));
    assert.equal(windowRef.location.hash, `#${course.id}/dashboard`, course.id);
    assert.equal(document.querySelector('#current-module-title').textContent, course.title, course.id);
    assert.equal(document.querySelector('#view-root').querySelectorAll('h1').length, 1, course.id);
    assert.equal(document.activeElement.id, 'app-main', course.id);
  }
  dispatchChange(document.querySelector('#module-select'), backendEngineering.id);
  windowRef.dispatchEvent(new FakeEvent('hashchange'));
  assert.equal(windowRef.location.hash, '#backend-engineering/dashboard');

  for (const view of ['dashboard', 'curriculum', 'map', 'resources', 'interviews', 'progress']) {
    document.querySelector('#module-select').focus();
    navigateTo(app, windowRef, `#backend-engineering/${view}`);
    const viewRoot = document.querySelector('#view-root');
    assert.ok(viewRoot.textContent.includes(backendEngineering.title), `${view} should render backend course content`);
    assert.equal(document.querySelector('#view-root').querySelectorAll('h1').length, 1, `${view} should render one h1`);
    assert.equal(document.activeElement.id, 'app-main', `${view} navigation should focus main`);
    if (view === 'curriculum') assert.equal(viewRoot.querySelectorAll('.lesson-ledger__item').length, 8);
    if (view === 'resources') assert.equal(viewRoot.querySelectorAll('.resource-row').length, backendEngineering.resources.length);
    if (view === 'interviews') assert.equal(viewRoot.querySelectorAll('.interview-card').length, 24);
    if (view === 'progress') {
      assert.ok(viewRoot.textContent.includes(`0 / ${backendEngineering.lessons.length}`));
      assert.ok(viewRoot.textContent.includes(`0 / ${backendEngineering.interviewQuestions.length}`));
    }
  }

  navigateTo(app, windowRef, '#backend-engineering/lesson/backend-01');
  const quizForm = document.querySelector('.quiz-form');
  assert.equal(quizForm.querySelectorAll('.quiz-question').length, 2);
  for (const question of backendEngineering.lessons[0].quiz) {
    quizForm.querySelector(
      `input[name="${question.id}"][value="${question.answerIndex}"]`,
    ).checked = true;
  }
  const savesBeforeQuiz = store.saves.length;
  quizForm.dispatchEvent(new FakeEvent('submit'));
  assert.equal(app.getState().quizResults['backend-01'].percent, 100);
  assert.ok(document.querySelector('.quiz-results').textContent.includes('得分 2 / 2（100%）'));
  assert.equal(store.saves.length, savesBeforeQuiz + 1);

  for (const lessonId of ['backend-02', 'backend-03', 'backend-06']) {
    navigateTo(app, windowRef, `#backend-engineering/lesson/${lessonId}`);
    const viewRoot = document.querySelector('#view-root');
    assert.equal(viewRoot.querySelectorAll('h1').length, 1, lessonId);
    assert.equal(viewRoot.querySelectorAll('.experiment-lab').length, 1, lessonId);
    assert.ok(viewRoot.textContent.includes(
      backendEngineering.lessons.find(({ id }) => id === lessonId).title,
    ));
    assert.equal(document.activeElement.id, 'app-main', lessonId);
  }
});

test('dashboard progress bars expose accessible names and values', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/dashboard'),
    progressStore: createStore({
      ...createDefaultProgress('llm-foundation'),
      completedLessonIds: ['llm-01'],
    }),
  });
  t.after(app.teardown);

  const progressBars = document.querySelectorAll('progress');
  assert.equal(progressBars.length, 2);
  for (const bar of progressBars) {
    assert.ok(bar.getAttribute('aria-label'));
    assert.match(bar.getAttribute('aria-valuetext'), /^\d+\s*\/\s*\d+/);
  }
});

test('skip link preserves the active route and view while focusing main exactly once', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const windowRef = createFakeWindow('#llm-foundation/resources');
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  app.render();
  app.render();
  const before = document.querySelector('#view-root').textContent;
  const skip = document.querySelector('#skip-to-main');
  assert.equal(skip.listeners.get('click')?.size, 1);

  const event = new FakeEvent('click');
  skip.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(windowRef.location.hash, '#llm-foundation/resources');
  assert.equal(document.querySelector('#view-root').textContent, before);
  assert.equal(document.activeElement.id, 'app-main');

  app.teardown();
  assert.equal(skip.listeners.get('click')?.size, 0);
});

test('brand home uses canonical navigation and focuses main without duplicate handlers', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const windowRef = createFakeWindow('#llm-foundation/interviews');
  const app = startApp({
    documentRef: document,
    windowRef,
    progressStore: createStore(createDefaultProgress('llm-foundation')),
  });
  t.after(app.teardown);

  app.render();
  app.render();
  const brand = document.querySelector('#brand-home');
  assert.equal(brand.listeners.get('click')?.size, 1);

  const event = new FakeEvent('click');
  brand.dispatchEvent(event);
  windowRef.dispatchEvent(new FakeEvent('hashchange'));

  assert.equal(event.defaultPrevented, true);
  assert.equal(windowRef.location.hash, '#llm-foundation/dashboard');
  assert.equal(document.querySelector('#view-root').querySelector('h1').textContent, 'LLM 基础');
  assert.equal(document.activeElement.id, 'app-main');
});

test('dashboard uses semantic empty statuses instead of contradictory progress ranges', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  renderDashboard(root, {
    course: {
      id: 'empty-course',
      title: '空课程',
      summary: '用于验证空模块。',
      lessons: [],
      interviewQuestions: [],
    },
    progress: createDefaultProgress('empty-course', ''),
    summary: {
      lessonsCompleted: 0,
      lessonPercent: 0,
      interviewsMastered: 0,
      interviewPercent: 0,
    },
  });

  assert.equal(root.querySelectorAll('progress').length, 0);
  assert.ok(root.textContent.includes('暂无课程内容'));
  assert.ok(root.textContent.includes('暂无面试题'));
  assert.equal(root.querySelectorAll('[role="status"]').length, 2);
});
