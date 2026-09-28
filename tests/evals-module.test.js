import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const moduleUrl = new URL('../src/data/evals-observability-security.js', import.meta.url);

test('sixth module provides a complete, evidence-bound curriculum', async () => {
  assert.ok(existsSync(moduleUrl), '第六模块课程数据应已实现');
  const { evalsObservabilitySecurity: course } = await import(moduleUrl.href);
  assert.equal(course.id, 'evals-observability-security');
  assert.deepEqual(course.lessons.map(({ id }) => id), [
    'eval-01', 'eval-02', 'eval-03', 'eval-04', 'eval-05', 'eval-06', 'eval-07', 'eval-08',
  ]);
  const resources = new Map(course.resources.map((item) => [item.id, item]));
  const questions = new Map(course.interviewQuestions.map((item) => [item.id, item]));
  const usedResources = new Set();
  const usedQuestions = new Set();
  for (const lesson of course.lessons) {
    assert.equal(lesson.moduleId, course.id);
    assert.ok(lesson.objectives.length >= 2 && lesson.concepts.length >= 3, lesson.id);
    assert.equal(lesson.quiz.length, 2);
    assert.equal(lesson.interviewQuestionIds.length, 3);
    assert.ok(lesson.exercise.steps.length >= 3 && lesson.exercise.deliverable.length >= 20);
    assert.ok(lesson.completionCriteria.length >= 2);
    const note = lesson.knowledgeNote;
    assert.ok(note && note.sections.length >= 5 && note.sections.length <= 7, lesson.id);
    assert.equal(note.tests?.status, 'passed', `${lesson.id}: 正文需要实际执行的检查记录`);
    assert.ok(note.tests.commands.length > 0);
    assert.ok(note.introduction.length >= 100 && note.nextStep.length >= 30, lesson.id);
    assert.ok(note.readingMinutes >= 20 && note.readingMinutes <= 40, lesson.id);
    assert.ok(note.misconceptions.length >= 4 && note.recap.length >= 5, lesson.id);
    let bodyLength = note.introduction.length + note.nextStep.length;
    for (const section of note.sections) {
      assert.ok(section.paragraphs.length >= 2 && section.paragraphs.length <= 4, `${lesson.id}/${section.id}`);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 60), `${lesson.id}/${section.id}`);
      bodyLength += section.paragraphs.join('').length;
      assert.ok(section.keyPoints.length >= 2);
      assert.ok(section.sourceIds.length > 0);
      for (const id of section.sourceIds) {
        assert.ok(lesson.resourceIds.includes(id), `${lesson.id}/${section.id}: ${id}`);
        assert.ok(resources.has(id), id);
        assert.notEqual(resources.get(id).evidence.role, 'extension', `${id}: 正文核心不能只靠导航资料`);
      }
    }
    assert.ok(bodyLength >= 2400, `${lesson.id}: 需要完整正文，当前 ${bodyLength} 字符`);
    assert.equal(new Set(note.sections.map(({ id }) => id)).size, note.sections.length);
    for (const id of lesson.resourceIds) {
      usedResources.add(id);
      assert.ok(resources.get(id)?.lessonIds.includes(lesson.id), `${id}: 双向归属`);
    }
    for (const id of lesson.interviewQuestionIds) {
      usedQuestions.add(id);
      const question = questions.get(id);
      assert.equal(question?.lessonId, lesson.id);
      assert.ok(question.shortAnswer.length >= 35 && question.deepDive.length >= 2, id);
      assert.ok(question.followUps.length >= 1 && question.misconceptions.length >= 1, id);
    }
    for (const quiz of lesson.quiz) {
      assert.ok(quiz.choices.length >= 3 && quiz.explanation.length >= 30, quiz.id);
      assert.ok(Number.isInteger(quiz.answerIndex) && quiz.answerIndex >= 0 && quiz.answerIndex < quiz.choices.length);
    }
    const rows = course.coverageMatrix[lesson.id];
    const paths = [
      ...lesson.objectives.map((_, i) => `objectives[${i}]`),
      ...lesson.quiz.map((_, i) => `quiz[${i}]`),
      ...lesson.interviewQuestionIds.map((_, i) => `interviewQuestionIds[${i}]`),
      ...lesson.exercise.steps.map((_, i) => `exercise.steps[${i}]`),
      'exercise.deliverable',
      ...lesson.completionCriteria.map((_, i) => `completionCriteria[${i}]`),
    ];
    assert.deepEqual(rows.map(({ fieldPath }) => fieldPath).sort(), paths.sort(), lesson.id);
    for (const row of rows) {
      const owner = note.sections.find(({ id }) => id === row.sectionId);
      assert.ok(owner && row.sourceIds.length > 0, `${lesson.id}: ${row.fieldPath}`);
      assert.ok(row.sourceIds.every((id) => owner.sourceIds.includes(id)), row.fieldPath);
    }
  }
  assert.equal(usedResources.size, resources.size);
  assert.equal(usedQuestions.size, questions.size);
  for (const resource of resources.values()) {
    assert.match(resource.url, /^https:\/\//);
    assert.equal(resource.verifiedAt, '2026-09-18');
    assert.ok(['official', 'academic', 'expert', 'community'].includes(resource.evidence.authority));
    assert.ok(['core', 'cross-check', 'extension'].includes(resource.evidence.role));
    assert.ok(resource.evidence.limitations.length >= 20);
    assert.ok(resource.evidence.coverage.length > 0 && resource.access.scope.length > 10);
  }
  const seen = new Set();
  function frozen(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    assert.ok(Object.isFrozen(value));
    Object.values(value).forEach(frozen);
  }
  frozen(course);
});
