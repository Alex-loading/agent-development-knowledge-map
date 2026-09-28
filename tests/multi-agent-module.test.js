import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('seventh module teaches every assessed outcome with verified resources', async () => {
  const url = new URL('../src/data/multi-agent-mcp.js', import.meta.url);
  assert.ok(existsSync(url), '第七模块课程文件应存在');
  const { multiAgentMcp: course } = await import(url.href);
  assert.equal(course.id, 'multi-agent-mcp');
  assert.deepEqual(course.lessons.map(({ id }) => id), ['ma-01', 'ma-02', 'ma-03', 'ma-04', 'ma-05', 'ma-06', 'ma-07', 'ma-08']);
  const resources = new Map(course.resources.map((item) => [item.id, item]));
  const questions = new Map(course.interviewQuestions.map((item) => [item.id, item]));
  for (const lesson of course.lessons) {
    assert.equal(lesson.moduleId, course.id);
    assert.equal(lesson.objectives.length, 2);
    assert.equal(lesson.quiz.length, 2);
    assert.equal(lesson.interviewQuestionIds.length, 3);
    assert.equal(lesson.exercise.steps.length, 3);
    assert.equal(lesson.completionCriteria.length, 2);
    assert.ok(lesson.exercise.deliverable.length >= 20);
    assert.ok(lesson.explanations.length >= 2 && lesson.concepts.length >= 3);
    const note = lesson.knowledgeNote;
    assert.equal(note.sections.length, 6);
    assert.equal(note.tests.status, 'passed');
    assert.ok(note.tests.results.every(({ exitCode }) => exitCode === 0));
    const length = note.introduction.length + note.nextStep.length + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length;
    assert.ok(length >= 2400, `${lesson.id}: ${length}`);
    assert.ok(note.misconceptions.length >= 4 && note.recap.length >= 5);
    assert.ok(note.readingMinutes >= 20 && note.readingMinutes <= 40);
    assert.equal(new Set(note.sections.map(({ id }) => id)).size, note.sections.length);
    for (const section of note.sections) {
      assert.ok(section.paragraphs.length >= 2 && section.paragraphs.length <= 4);
      assert.ok(section.paragraphs.every((text) => text.length >= 60), `${lesson.id}/${section.id}`);
      assert.ok(section.keyPoints.length >= 2 && section.sourceIds.length > 0);
      for (const id of section.sourceIds) {
        assert.ok(lesson.resourceIds.includes(id) && resources.has(id), id);
        assert.notEqual(resources.get(id).evidence.role, 'extension');
      }
    }
    for (const id of lesson.resourceIds) assert.ok(resources.get(id)?.lessonIds.includes(lesson.id), id);
    for (const id of lesson.interviewQuestionIds) {
      const item = questions.get(id);
      assert.equal(item?.lessonId, lesson.id);
      assert.ok(item.shortAnswer.length >= 35 && item.deepDive.length >= 2);
      assert.ok(item.misconceptions.length > 0 && item.followUps.length > 0);
    }
    for (const item of lesson.quiz) {
      assert.ok(item.choices.length >= 3 && item.explanation.length >= 30);
      assert.ok(Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < item.choices.length);
    }
    const expected = [...lesson.objectives.map((_, i) => `objectives[${i}]`), ...lesson.quiz.map((_, i) => `quiz[${i}]`), ...lesson.interviewQuestionIds.map((_, i) => `interviewQuestionIds[${i}]`), ...lesson.exercise.steps.map((_, i) => `exercise.steps[${i}]`), 'exercise.deliverable', ...lesson.completionCriteria.map((_, i) => `completionCriteria[${i}]`)];
    assert.deepEqual(course.coverageMatrix[lesson.id].map(({ fieldPath }) => fieldPath).sort(), expected.sort());
    for (const row of course.coverageMatrix[lesson.id]) {
      const section = note.sections.find(({ id }) => id === row.sectionId);
      assert.ok(section && row.sourceIds.length > 0 && row.sourceIds.every((id) => section.sourceIds.includes(id)));
    }
  }
  assert.equal(new Set(course.lessons.flatMap(({ resourceIds }) => resourceIds)).size, resources.size);
  assert.equal(course.interviewQuestions.length, 24);
  for (const resource of course.resources) {
    assert.match(resource.url, /^https:\/\//);
    assert.equal(resource.verifiedAt, '2026-09-18');
    assert.ok(resource.access.scope.length > 10 && resource.evidence.limitations.length >= 20);
    assert.ok(['official', 'academic', 'expert', 'community'].includes(resource.evidence.authority));
  }
  const seen = new Set();
  function assertFrozen(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    assert.ok(Object.isFrozen(value));
    Object.values(value).forEach(assertFrozen);
  }
  assertFrozen(course);
});
