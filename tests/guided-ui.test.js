import test from 'node:test';
import assert from 'node:assert/strict';

import { startApp } from '../src/app.js';
import { createDefaultProgress } from '../src/core/progress.js';
import { agentMechanism } from '../src/data/agent-mechanism.js';
import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import { renderKnowledgeNote } from '../src/ui/knowledge-note.js';
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
  const knowledgeNote = root.querySelector('.knowledge-note');
  const noteToc = knowledgeNote?.querySelector('nav[aria-label="本章目录"]');
  const firstSection = llmFoundation.lessons[0].knowledgeNote.sections[0];
  const firstSectionHeading = knowledgeNote?.querySelector(`#llm-01-note-${firstSection.id}`);
  const resourceSelection = root.querySelector('.resource-selection');
  const evidenceResource = llmFoundation.resources.find((resource) => (
    llmFoundation.lessons[0].resourceIds.includes(resource.id) && resource.evidence
  ));
  const evidenceResourceItem = resourceSelection?.querySelectorAll('li')
    .find((item) => item.textContent.includes(evidenceResource.title));

  assert.ok(knowledgeNote, '应渲染知识型长文笔记');
  assert.ok(noteToc, '应渲染本章目录');
  assert.equal(firstSectionHeading?.textContent, firstSection.title);
  assert.ok(firstSectionHeading?.parentNode.querySelectorAll('p').length >= 2, '首节应包含至少两个正文段落');
  const sourceLink = knowledgeNote.querySelector('a');
  assert.equal(new URL(sourceLink.getAttribute('href')).protocol, 'https:');
  assert.ok(!knowledgeNote.textContent.includes('原理札记'), '新版知识笔记不应继续使用旧标签');
  assert.equal(resourceSelection.querySelector('h2').textContent, '继续深挖');
  assert.ok(!resourceSelection.textContent.includes('精选资料'));
  assert.ok(evidenceResourceItem.textContent.includes(evidenceResource.evidence.role));
  assert.ok(evidenceResourceItem.textContent.includes(evidenceResource.evidence.limitations));

  noteToc.querySelector('button').click();
  assert.equal(firstSectionHeading.getAttribute('tabindex'), '-1');
  assert.equal(document.activeElement, firstSectionHeading);
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

test('lesson detail renders released LLM knowledge notes with source-safe deepening resources', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  for (const lessonId of ['llm-02', 'llm-08']) {
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    renderLessonDetail(root, {
      course: llmFoundation,
      lessonId,
      progress: createDefaultProgress('llm-foundation'),
    });

    const knowledgeNote = root.querySelector('.knowledge-note');
    const resourceSelection = root.querySelector('.resource-selection');
    const sourceLink = knowledgeNote?.querySelector('a');
    assert.ok(knowledgeNote, `${lessonId}: 应渲染知识型长文笔记`);
    assert.equal(knowledgeNote.querySelectorAll('nav[aria-label="本章目录"] button').length, lesson.knowledgeNote.sections.length,
      `${lessonId}: 目录按钮数必须等于章节数`);
    assert.equal(sourceLink.getAttribute('target'), '_blank', `${lessonId}: 来源链接应在新窗口打开`);
    assert.ok(sourceLink.getAttribute('rel').includes('noopener noreferrer'), `${lessonId}: 来源链接必须防止 opener 泄漏`);
    assert.equal(resourceSelection.querySelector('h2').textContent, '继续深挖');
    assert.equal(root.querySelector('.data-diagnostic'), null, `${lessonId}: 不应出现资料诊断`);
  }
});

test('agent mechanism lessons retain legacy explanations without a knowledge note', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('div');
  document.body.append(root);

  renderLessonDetail(root, {
    course: agentMechanism,
    lessonId: 'agent-01',
    progress: createDefaultProgress('agent-mechanism'),
  });

  assert.ok(root.textContent.includes(agentMechanism.lessons[0].explanations[0].heading));
  assert.ok(root.querySelector('.lesson-explanations'));
  assert.equal(root.querySelector('.knowledge-note'), null);
  const resourceSelection = root.querySelector('.resource-selection');
  const legacyResource = agentMechanism.resources.find(({ id }) => (
    agentMechanism.lessons[0].resourceIds.includes(id)
  ));
  const legacyResourceItem = resourceSelection.querySelectorAll('li')
    .find((item) => item.textContent.includes(legacyResource.title));
  assert.equal(resourceSelection.querySelector('h2').textContent, '精选资料');
  assert.ok(legacyResourceItem.textContent.includes(
    `${legacyResource.source} · ${legacyResource.language} · ${legacyResource.value}`,
  ));
  assert.ok(!resourceSelection.textContent.includes('undefined'));
});

test('knowledge note keeps body visible and reports missing source references', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const course = { resources: [] };
  const lesson = {
    id: 'synthetic-01',
    knowledgeNote: {
      introduction: '这段导言仍应显示。',
      sections: [{
        id: 'body',
        title: '主体内容',
        paragraphs: ['即使资料引用失效，正文也不能消失。', '诊断应保持非阻塞。'],
        keyPoints: ['先显示正文，再报告数据问题。'],
        sourceIds: ['missing-source'],
      }],
      misconceptions: [],
      recap: [],
      nextStep: '继续下一课。',
    },
  };

  const note = renderKnowledgeNote(course, lesson);

  assert.ok(note.textContent.includes('即使资料引用失效，正文也不能消失。'));
  assert.ok(note.querySelector('.data-diagnostic'));
  assert.ok(note.textContent.includes('missing-source'));
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
