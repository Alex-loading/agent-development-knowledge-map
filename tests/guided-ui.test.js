import test from 'node:test';
import assert from 'node:assert/strict';

import { startApp } from '../src/app.js';
import { createDefaultProgress } from '../src/core/progress.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import {
  FakeDocument,
  FakeEvent,
  createAppDocument,
  createFakeWindow,
  findButton,
  installFakeDom,
} from './helpers/fake-dom.js';

function createStore(initialState) {
  let stored = structuredClone(initialState);
  const saves = [];
  return {
    saves,
    load: () => structuredClone(stored),
    save(state) {
      stored = structuredClone(state);
      saves.push(structuredClone(state));
    },
    mode: () => 'local',
  };
}

test('lesson detail renders real teaching content and quiz interaction once after rerender', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);
  const progress = createDefaultProgress('llm-foundation');
  const announcements = [];
  const options = {
    course: llmFoundation,
    lessonId: 'llm-01',
    progress,
    onQuizResult: (score, message) => announcements.push({ score, message }),
  };

  renderLessonDetail(root, options);
  renderLessonDetail(root, options);

  assert.equal(root.querySelector('h1').textContent, llmFoundation.lessons[0].title);
  assert.ok(root.textContent.includes(llmFoundation.lessons[0].objectives[0]));
  assert.ok(root.textContent.includes(llmFoundation.lessons[0].explanations[0].heading));
  const form = root.querySelector('form');
  assert.ok(form, '应渲染真实测验表单');

  for (const question of llmFoundation.lessons[0].quiz) {
    const selected = form.querySelector(`input[name="${question.id}"][value="${question.answerIndex}"]`);
    selected.checked = true;
  }
  form.dispatchEvent(new FakeEvent('submit'));

  assert.ok(root.textContent.includes('得分 2 / 2（100%）'));
  for (const question of llmFoundation.lessons[0].quiz) {
    assert.ok(root.textContent.includes(question.explanation));
  }
  assert.deepEqual(announcements, [{
    score: {
      correct: 2,
      total: 2,
      percent: 100,
      results: llmFoundation.lessons[0].quiz.map(({ explanation }) => ({ correct: true, explanation })),
    },
    message: '测验完成：答对 2 / 2 题，得分 100%',
  }]);
});

test('completion persists immutable progress, updates recommendation, announces and restores focus', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const initialState = createDefaultProgress('llm-foundation');
  const store = createStore(initialState);
  const windowRef = createFakeWindow('#llm-foundation/lesson/llm-01');
  const app = startApp({ windowRef, documentRef: document, progressStore: store });
  t.after(app.teardown);

  app.render();
  app.render();
  assert.equal(document.activeElement, null, '被动重复渲染不应抢走焦点');
  const savesBeforeCompletion = store.saves.length;
  findButton(document, '标记本节完成').click();

  assert.deepEqual(initialState.completedLessonIds, [], '加载得到的原状态不得被修改');
  assert.equal(store.saves.length, savesBeforeCompletion + 1, '一次点击只能保存一次');
  assert.deepEqual(app.getState().completedLessonIds, ['llm-01']);
  assert.equal(app.getState().currentLessonId, 'llm-02');
  assert.ok(document.querySelector('#progress-summary').textContent.includes('课程 1 / 8'));
  assert.ok(document.querySelector('#app-live-region').textContent.includes('下一节建议：神经网络与反向传播'));
  assert.equal(document.activeElement, document.querySelector('#app-main'));

  windowRef.location.hash = '#llm-foundation/dashboard';
  app.render();
  assert.equal(document.querySelector('.recommendation-spread h2').textContent, '神经网络与反向传播');
});

test('finishing the last remaining lesson announces mainline completion out of order', (t) => {
  const document = createAppDocument();
  t.after(installFakeDom(document));
  const completedLessonIds = llmFoundation.lessons.slice(1).map(({ id }) => id);
  const store = createStore({
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds,
  });
  const windowRef = createFakeWindow('#llm-foundation/lesson/llm-01');
  const app = startApp({ windowRef, documentRef: document, progressStore: store });
  t.after(app.teardown);

  findButton(document, '标记本节完成').click();

  assert.ok(document.querySelector('#app-live-region').textContent.includes('LLM 基础主线已全部完成'));
  assert.ok(!document.querySelector('#app-live-region').textContent.includes('下一节建议'));
  assert.equal(document.activeElement, document.querySelector('#app-main'));
});
