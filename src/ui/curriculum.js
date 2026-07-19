import { scoreQuiz } from '../core/quiz.js';
import { buildKnowledgeNodes, getNextLesson } from '../core/view-models.js';
import { button, element, externalLink } from './dom.js';
import { renderExperiment } from './experiments.js';

const STATUS_LABELS = {
  complete: '已完成',
  current: '当前建议',
  available: '可学习',
  locked: '待先修（仍可查看）',
};

function statusForLesson(course, progress, lessonId) {
  return buildKnowledgeNodes(course.lessons, progress).find(({ id }) => id === lessonId)?.status ?? 'available';
}

function list(items, className) {
  if (!items?.length) return element('p', { className: 'empty-note', text: '本节暂无条目。' });
  return element('ul', { className }, items.map((item) => element('li', { text: item })));
}

function curriculumItem(lesson, node, recommendedId, onOpenLesson) {
  const criterion = lesson.completionCriteria?.[0] ?? '完成本节阅读与练习';
  return element('li', {
    className: `lesson-ledger__item status-${node?.status ?? 'available'}${lesson.id === recommendedId ? ' is-recommended' : ''}`,
  }, [
    element('div', { className: 'lesson-ledger__number', text: String(lesson.order).padStart(2, '0'), attrs: { 'aria-hidden': 'true' } }),
    element('div', { className: 'lesson-ledger__body' }, [
      element('div', { className: 'lesson-ledger__heading' }, [
        element('h2', { text: lesson.title }),
        element('span', { className: 'status-stamp', text: STATUS_LABELS[node?.status] ?? '可学习' }),
      ]),
      element('p', { text: lesson.summary }),
      element('div', { className: 'lesson-ledger__meta' }, [
        element('span', { text: `约 ${lesson.durationMinutes} 分钟` }),
        element('span', { text: `交付预告：${lesson.exercise?.deliverable ?? criterion}` }),
      ]),
      element('p', { className: 'criterion-teaser', text: `完成标准：${criterion}` }),
      node?.status === 'locked'
        ? element('p', { className: 'guided-note', text: '推荐先完成前置课程；内容保持开放，可自由探索。' })
        : null,
      button('查看课程', {
        className: 'text-action',
        attrs: { 'aria-label': `查看课程 ${lesson.order}：${lesson.title}` },
        events: { click: () => onOpenLesson?.(lesson.id) },
      }),
    ]),
  ]);
}

export function renderCurriculumList(root, { course, progress, onOpenLesson }) {
  const nodes = buildKnowledgeNodes(course.lessons, progress);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const recommended = getNextLesson(course.lessons, progress);

  root.replaceChildren(
    element('section', { className: 'curriculum-view', attrs: { 'aria-labelledby': 'curriculum-title' } }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: 'LLM FOUNDATION / 八节主线' }),
        element('h1', { text: '学习主线', attrs: { id: 'curriculum-title' } }),
        element('p', { text: '按推荐顺序完成八项交付，也可随时打开后续课程探索；“待先修”只是路线建议，不会隐藏内容。' }),
      ]),
      course.lessons.length
        ? element('ol', { className: 'lesson-ledger' }, course.lessons.map((lesson) => (
          curriculumItem(lesson, nodeById.get(lesson.id), recommended?.id, onOpenLesson)
        )))
        : element('p', { className: 'empty-note', text: '这个模块尚未配置课程。' }),
    ]),
  );
  root.removeAttribute('aria-busy');
}

function resourceSection(course, lesson) {
  const resourcesById = new Map(course.resources.map((resource) => [resource.id, resource]));
  const resources = (lesson.resourceIds ?? []).map((id) => resourcesById.get(id)).filter(Boolean);
  const missingCount = (lesson.resourceIds?.length ?? 0) - resources.length;

  return element('section', { className: 'lesson-section resource-selection', attrs: { 'aria-labelledby': 'lesson-resources' } }, [
    element('h2', { text: '精选资料', attrs: { id: 'lesson-resources' } }),
    resources.length
      ? element('ul', {}, resources.map((resource) => element('li', {}, [
        externalLink(resource),
        element('span', { className: 'resource-note', text: `${resource.source} · ${resource.language} · ${resource.value}` }),
      ])))
      : element('p', { className: 'empty-note', text: '本节暂未关联可用资料。' }),
    missingCount
      ? element('p', { className: 'data-diagnostic', text: `${missingCount} 条资料引用暂时无法解析，已安全跳过。` })
      : null,
  ]);
}

function exerciseSection(lesson) {
  const exercise = lesson.exercise;
  if (!exercise) return element('section', { className: 'lesson-section' }, [element('h2', { text: '动手练习' }), element('p', { className: 'empty-note', text: '本节练习正在整理。' })]);
  return element('section', { className: 'lesson-section exercise-sheet', attrs: { 'aria-labelledby': 'lesson-exercise' } }, [
    element('h2', { text: exercise.title, attrs: { id: 'lesson-exercise' } }),
    element('p', { text: exercise.brief }),
    element('ol', {}, (exercise.steps ?? []).map((step) => element('li', { text: step }))),
    element('div', { className: 'deliverable-note' }, [
      element('strong', { text: '本节交付' }),
      element('p', { text: exercise.deliverable ?? '记录过程与结论。' }),
    ]),
    exercise.experiment
      ? renderExperiment(exercise.experiment)
      : null,
  ]);
}

function quizSection(lesson, onQuizResult) {
  const quiz = lesson.quiz ?? [];
  const resultRegion = element('div', { className: 'quiz-results', attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' } });

  if (!quiz.length) {
    return element('section', { className: 'lesson-section quiz-sheet' }, [
      element('h2', { text: '理解测验' }),
      element('p', { className: 'empty-note', text: '本节暂无测验题。' }),
    ]);
  }

  const form = element('form', {
    className: 'quiz-form',
    events: {
      submit: (event) => {
        event.preventDefault();
        const selected = quiz.map((question) => {
          const checked = form.querySelector(`input[name="${question.id}"]:checked`);
          return checked ? Number(checked.value) : -1;
        });
        const score = scoreQuiz(quiz, selected);
        resultRegion.replaceChildren(
          element('h3', { text: `得分 ${score.correct} / ${score.total}（${score.percent}%）` }),
          element('ol', {}, score.results.map((result, index) => element('li', {
            className: result.correct ? 'quiz-correct' : 'quiz-incorrect',
          }, [
            element('strong', { text: `第 ${index + 1} 题：${result.correct ? '正确' : '需要复习'}` }),
            element('p', { text: result.explanation }),
          ]))),
        );
        onQuizResult?.(score, `测验完成：答对 ${score.correct} / ${score.total} 题，得分 ${score.percent}%`);
      },
    },
  }, [
    ...quiz.map((question, questionIndex) => element('fieldset', { className: 'quiz-question' }, [
      element('legend', { text: `${questionIndex + 1}. ${question.prompt}` }),
      ...(question.choices ?? []).map((choice, choiceIndex) => {
        const inputId = `${lesson.id}-question-${questionIndex}-choice-${choiceIndex}`;
        return element('label', { className: 'quiz-choice', attrs: { for: inputId } }, [
          element('input', {
            attrs: {
              id: inputId,
              type: 'radio',
              name: question.id,
              value: choiceIndex,
              required: choiceIndex === 0,
            },
          }),
          element('span', { text: choice }),
        ]);
      }),
    ])),
    button('提交测验', { type: 'submit' }),
  ]);

  return element('section', { className: 'lesson-section quiz-sheet', attrs: { 'aria-labelledby': 'lesson-quiz' } }, [
    element('h2', { text: '理解测验', attrs: { id: 'lesson-quiz' } }),
    form,
    resultRegion,
  ]);
}

function interviewsSection(course, lesson, onOpenInterviews) {
  const questionById = new Map(course.interviewQuestions.map((question) => [question.id, question]));
  const questions = (lesson.interviewQuestionIds ?? []).map((id) => questionById.get(id)).filter(Boolean);
  return element('section', { className: 'lesson-section related-interviews', attrs: { 'aria-labelledby': 'lesson-interviews' } }, [
    element('h2', { text: '关联面试题', attrs: { id: 'lesson-interviews' } }),
    questions.length
      ? element('ul', {}, questions.map((question) => element('li', {}, [
        element('h3', { text: question.question }),
        element('p', { className: 'interview-meta', text: `频率 ${question.frequency} · 难度 ${question.difficulty} · ${question.roles.join(' / ')}` }),
      ])))
      : element('p', { className: 'empty-note', text: '本节暂无关联面试题。' }),
    button('前往面试高频', { className: 'secondary-action', events: { click: () => onOpenInterviews?.() } }),
  ]);
}

export function renderLessonDetail(root, {
  course,
  lessonId,
  progress,
  onBack,
  onCompleteLesson,
  onOpenInterviews,
  onQuizResult,
}) {
  const lesson = course.lessons.find(({ id }) => id === lessonId);
  if (!lesson) {
    root.replaceChildren(element('section', { className: 'empty-state' }, [
      element('h1', { text: '没有找到这节课程' }),
      element('p', { text: '课程链接可能已更新，请返回学习主线重新选择。' }),
      button('返回学习主线', { events: { click: () => onBack?.() } }),
    ]));
    root.removeAttribute('aria-busy');
    return;
  }

  const completed = progress.completedLessonIds?.includes(lesson.id);
  const status = statusForLesson(course, progress, lesson.id);
  root.replaceChildren(
    element('article', { className: 'lesson-detail', attrs: { 'aria-labelledby': 'lesson-title' } }, [
      element('nav', { className: 'breadcrumb', attrs: { 'aria-label': '面包屑' } }, [
        button('学习主线', { className: 'text-action', events: { click: () => onBack?.() } }),
        element('span', { text: `课程 ${String(lesson.order).padStart(2, '0')}` }),
      ]),
      element('header', { className: 'lesson-hero' }, [
        element('span', { className: 'section-index', text: `课程 ${String(lesson.order).padStart(2, '0')} / ${String(course.lessons.length).padStart(2, '0')}` }),
        element('h1', { text: lesson.title, attrs: { id: 'lesson-title' } }),
        element('p', { className: 'lesson-hero__summary', text: lesson.summary }),
        element('div', { className: 'lesson-hero__meta' }, [
          element('span', { className: 'status-stamp', text: STATUS_LABELS[status] ?? '可学习' }),
          element('span', { text: `约 ${lesson.durationMinutes} 分钟` }),
        ]),
      ]),
      element('section', { className: 'lesson-section opening-ledger' }, [
        element('div', {}, [element('h2', { text: '学习目标' }), list(lesson.objectives, 'check-list')]),
        element('div', {}, [element('h2', { text: '核心概念' }), list(lesson.concepts, 'concept-list')]),
      ]),
      ...(lesson.explanations?.length
        ? lesson.explanations.map((explanation, index) => element('section', { className: 'lesson-section explanation-section' }, [
          element('span', { className: 'section-index', text: `原理札记 ${String(index + 1).padStart(2, '0')}` }),
          element('h2', { text: explanation.heading }),
          element('p', { text: explanation.body }),
          list(explanation.keyPoints, 'key-point-list'),
        ]))
        : [element('p', { className: 'empty-note', text: '本节原理讲解正在整理。' })]),
      resourceSection(course, lesson),
      exerciseSection(lesson),
      quizSection(lesson, onQuizResult),
      interviewsSection(course, lesson, onOpenInterviews),
      element('section', { className: 'lesson-section completion-sheet', attrs: { 'aria-labelledby': 'completion-title' } }, [
        element('h2', { text: '完成标准', attrs: { id: 'completion-title' } }),
        list(lesson.completionCriteria, 'check-list'),
        button(completed ? '本节已完成' : '标记本节完成', {
          disabled: completed,
          events: { click: () => onCompleteLesson?.(lesson.id) },
        }),
      ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}
