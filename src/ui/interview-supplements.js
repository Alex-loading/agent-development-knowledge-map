import { button, element, externalLink } from './dom.js';
import { interviewSupplementSources } from '../data/interview-supplements.js';

function questionList(questions) {
  return element('ol', { className: 'supplement-questions' }, questions.map((question) => (
    element('li', { dataset: { supplementId: question.id } }, [
      element('p', { className: 'supplement-question', text: question.question }),
      question.kind === 'reading-prompt'
        ? element('span', { className: 'supplement-kind', text: '延伸阅读追问' })
        : null,
      element('ul', { className: 'supplement-sources', attrs: { 'aria-label': `${question.question}的原始来源` } },
        question.sources.map((source) => element('li', {}, [
          externalLink(source),
          source.format === 'PDF 题单'
            ? element('span', { className: 'supplement-kind', text: 'PDF 题单' })
            : null,
        ]))),
    ])
  )));
}

export function renderInterviewSupplements(course, { lessonId, onOpenLesson } = {}) {
  const questions = (course.interviewSupplements ?? [])
    .filter((question) => !lessonId || question.lessonId === lessonId);
  if (!questions.length) return null;

  const groups = course.lessons.map((lesson) => ({
    lesson,
    questions: questions.filter((question) => question.lessonId === lesson.id),
  })).filter((group) => group.questions.length);
  const headingId = lessonId ? 'lesson-interview-supplements' : 'interview-supplements-title';
  const needsAccessCode = questions.some((question) => question.sources.some(({ providerId }) => providerId === 'yuque'));
  const providerIds = [...new Set(questions.flatMap((question) => question.sources.map(({ providerId }) => providerId)))];

  return element('section', {
    className: `interview-supplements${lessonId ? ' lesson-section' : ''}`,
    attrs: { 'aria-labelledby': headingId },
  }, [
    element('h2', { text: `面试补充 · 原文题单（${questions.length}）`, attrs: { id: headingId } }),
    element('p', {
      className: 'supplement-intro',
      text: '按考点归纳问题，点击来源阅读原题与解析。延伸阅读追问由本站根据文章主题整理。',
    }),
    element('p', {
      className: 'supplement-note',
      text: `原文题单供拓展练习，不计入站内掌握进度。${needsAccessCode ? '语雀原文可能需要访问码。' : ''}`,
    }),
    element('p', { className: 'supplement-catalogs' }, [
      element('span', { text: '题库来源：' }),
      ...providerIds.map((providerId) => {
        const source = interviewSupplementSources[providerId];
        return externalLink({ title: source.name, url: source.url });
      }),
    ]),
    ...groups.map(({ lesson, questions: lessonQuestions }) => (
      lessonId
        ? questionList(lessonQuestions)
        : element('details', { className: 'supplement-group' }, [
          element('summary', { text: `${String(lesson.order).padStart(2, '0')} · ${lesson.title} · ${lessonQuestions.length} 题` }),
          questionList(lessonQuestions),
          onOpenLesson ? button(`学习本课：${lesson.title}`, {
            className: 'text-action',
            events: { click: () => onOpenLesson(lesson.id) },
          }) : null,
        ])
    )),
  ]);
}
