import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProgress } from '../src/core/progress.js';
import { courseRegistry } from '../src/data/courses.js';
import { renderLessonDetail } from '../src/ui/curriculum.js';
import { renderInterviewPractice } from '../src/ui/interviews.js';
import { FakeDocument, installFakeDom, findButton } from './helpers/fake-dom.js';

// 2026-09-17 的外部题单覆盖这五个模块；新增题单需要独立核验原文。
const supplementedModuleIds = [
  'llm-foundation', 'agent-mechanism', 'agent-harness', 'context-rag-memory', 'backend-engineering',
];

test('supplement questions resolve to their own course and traceable original pages', () => {
  const ids = new Set();
  assert.deepEqual(Object.values(courseRegistry)
    .filter((course) => course.interviewSupplements.length).map(({ id }) => id), supplementedModuleIds);
  for (const moduleId of supplementedModuleIds) {
    const course = courseRegistry[moduleId];
    const lessonIds = new Set(course.lessons.map(({ id }) => id));
    const providers = new Set();
    assert.ok(course.interviewSupplements.length, course.id);
    assert.ok(Object.isFrozen(course.interviewSupplements));
    for (const question of course.interviewSupplements) {
      assert.ok(!ids.has(question.id), question.id);
      ids.add(question.id);
      assert.equal(question.moduleId, course.id);
      assert.ok(lessonIds.has(question.lessonId), question.id);
      assert.ok(question.sources.length, question.id);
      assert.equal(new Set(question.sources.map(({ url }) => url)).size, question.sources.length);
      for (const source of question.sources) {
        providers.add(source.providerId);
        const url = new URL(source.url);
        assert.equal(url.protocol, 'https:');
        assert.equal(url.search, '', 'source links must not embed access credentials');
        assert.ok(source.title && source.verifiedAt);
        assert.ok(['catalog', 'page'].includes(source.verification));
        if (source.providerId === 'xiaolin') {
          assert.equal(url.hostname, 'xiaolinnote.com');
          assert.match(url.pathname, /^\/ai\/(agent|rag|tools|llm)\/.+\.html$/);
        } else {
          assert.equal(source.providerId, 'yuque');
          assert.equal(url.hostname, 'www.yuque.com');
          assert.match(url.pathname, /^\/aaron-wecc3\/dhluml\/[a-z0-9]+$/);
          assert.notEqual(url.pathname.split('/').at(-1), 'foho2nsutnn37gw3', 'link to a relevant article, not the collection home');
        }
      }
    }
    assert.deepEqual([...providers].sort(), ['xiaolin', 'yuque'], course.id);
  }
});

test('interview view scopes supplements by module and keeps source links available before revealing answers', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('main');
  document.body.append(root);

  for (const course of Object.values(courseRegistry)) {
    let openedLesson;
    renderInterviewPractice(root, {
      course,
      progress: createDefaultProgress(course.id),
      onOpenLesson: (id) => { openedLesson = id; },
    });
    const section = root.querySelector('.interview-supplements');
    assert.equal(root.querySelectorAll('.interview-card').length, course.interviewQuestions.length);
    if (!course.interviewSupplements.length) {
      assert.equal(section, null, `${course.id}: empty supplements must not create an empty heading`);
      continue;
    }
    const expectedLinks = course.interviewSupplements.flatMap(({ sources }) => sources.map(({ url }) => url));
    const links = section.querySelectorAll('.supplement-sources').flatMap((list) => list.querySelectorAll('a'));
    assert.deepEqual(links.map((link) => link.getAttribute('href')).sort(), expectedLinks.sort());
    for (const link of links) {
      assert.equal(link.getAttribute('target'), '_blank');
      assert.equal(link.getAttribute('rel'), 'noopener noreferrer');
    }
    assert.equal(root.querySelectorAll('.interview-card').length, course.interviewQuestions.length);
    assert.equal(root.querySelectorAll('.answer-drawer').length, 0);
    assert.ok(root.textContent.includes(`已掌握 0 / ${course.interviewQuestions.length}`));
    const firstLesson = course.lessons.find((lesson) => course.interviewSupplements.some((q) => q.lessonId === lesson.id));
    findButton(section, `学习本课：${firstLesson.title}`).click();
    assert.equal(openedLesson, firstLesson.id);
  }
});

test('lesson detail only shows supplements belonging to that lesson and omits empty sections', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const root = document.createElement('main');
  document.body.append(root);
  for (const course of Object.values(courseRegistry)) {
    for (const lesson of course.lessons) {
      renderLessonDetail(root, {
        course,
        lessonId: lesson.id,
        progress: createDefaultProgress(course.id),
      });
      const expected = course.interviewSupplements.filter((q) => q.lessonId === lesson.id);
      const section = root.querySelector('.interview-supplements');
      if (!expected.length) {
        assert.equal(section, null, lesson.id);
        continue;
      }
      assert.ok(section, lesson.id);
      assert.equal(section.querySelectorAll('.supplement-question').length, expected.length);
      for (const question of expected) assert.ok(section.textContent.includes(question.question));
      for (const question of course.interviewSupplements.filter((q) => q.lessonId !== lesson.id)) {
        assert.equal(section.textContent.includes(question.question), false, question.id);
      }
    }
  }
});
