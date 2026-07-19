import test from 'node:test';
import assert from 'node:assert/strict';

import { startApp } from '../src/app.js';
import {
  createDefaultProgress,
  setInterviewStatus,
  toggleReviewQueue,
} from '../src/core/progress.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import { renderInterviewPractice } from '../src/ui/interviews.js';
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

test('resource library combines real filters, renders empty state and resets to all 28 resources', (t) => {
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
  assert.equal(root.querySelectorAll('.resource-row').length, 28);

  dispatchChange(root.querySelector('#resource-filter-platform'), 'GitHub');
  const githubRows = root.querySelectorAll('.resource-row');
  assert.ok(githubRows.length > 0);
  assert.ok(githubRows.every((row) => row.dataset.platform === 'GitHub'));
  assert.ok(root.textContent.includes(`${githubRows.length} / 28`));

  dispatchChange(root.querySelector('#resource-filter-language'), '中文');
  dispatchChange(root.querySelector('#resource-filter-platform'), 'YouTube');
  assert.equal(root.querySelectorAll('.resource-row').length, 0);
  assert.ok(root.textContent.includes('没有符合当前筛选条件的资料'));

  findButton(root, '重置筛选').click();
  assert.equal(root.querySelectorAll('.resource-row').length, 28);
  assert.ok(root.textContent.includes('启用筛选 0 项'));
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
  document.querySelector(`[aria-controls="answer-${first.id}"]`).click();
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));
  dispatchChange(document.querySelector('#interview-filter-role'), 'Agent 开发');
  assert.equal(document.querySelector('#interview-filter-role').value, 'Agent 开发');
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));

  findButton(document.querySelector('.interview-card'), '已掌握').click();

  assert.equal(store.saves.length, 1);
  assert.ok(document.querySelector('#progress-summary').textContent.includes('面试 1 / 24'));
  assert.ok(document.querySelector('#app-live-region').textContent.includes('已标记为已掌握'));
  assert.equal(document.querySelector('#interview-filter-role').value, 'Agent 开发');
  assert.ok(document.querySelector('#view-root').textContent.includes(first.shortAnswer));
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
