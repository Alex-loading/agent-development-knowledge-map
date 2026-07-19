import test from 'node:test';
import assert from 'node:assert/strict';

import { startApp } from '../src/app.js';
import { FILTER_ALL, filterResources } from '../src/core/filters.js';
import {
  createDefaultProgress,
  setInterviewStatus,
  toggleReviewQueue,
} from '../src/core/progress.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import { renderExperiment } from '../src/ui/experiments.js';
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

test('application shell scopes dirty persisted progress to the current course catalog', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const firstQuestionId = llmFoundation.interviewQuestions[0].id;
  const app = startApp({
    documentRef: document,
    windowRef: createFakeWindow('#llm-foundation/dashboard'),
    progressStore: createStore({
      ...createDefaultProgress('llm-foundation'),
      completedLessonIds: ['llm-01', 'llm-01', 'stale-lesson'],
      interviewStatusById: { [firstQuestionId]: 'mastered', stale: 'mastered' },
    }),
  });
  t.after(app.teardown);

  assert.ok(document.querySelector('#progress-summary').textContent.includes('课程 1 / 8'));
  assert.ok(document.querySelector('#progress-summary').textContent.includes('面试 1 / 24'));
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

  for (const [lessonId, experimentId] of [
    ['llm-03', 'token-budget'],
    ['llm-04', 'attention'],
    ['llm-06', 'sampling'],
  ]) {
    renderLessonDetail(root, {
      course: llmFoundation,
      lessonId,
      progress: createDefaultProgress('llm-foundation'),
    });
    const lab = root.querySelector(`.${experimentId === 'token-budget' ? 'token-budget' : experimentId}-lab`);
    const headingId = lab.getAttribute('aria-labelledby');
    assert.ok(headingId);
    assert.notEqual(lab.querySelector(`#${headingId}`), null);
  }
});
