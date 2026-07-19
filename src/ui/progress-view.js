import { button, element } from './dom.js';

function formatVisit(value) {
  if (!value) return '尚无访问记录';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

function namedList(items, emptyMessage, className) {
  return items.length
    ? element('ul', { className }, items.map((item) => element('li', { text: item })))
    : element('p', { className: 'empty-note', text: emptyMessage });
}

export function renderProgressView(root, {
  course,
  progress,
  summary,
  storageMode = 'local',
  resetConfirmOpen = false,
  onRequestReset,
  onCancelReset,
  onConfirmReset,
}) {
  const lessonById = new Map(course.lessons.map((lesson) => [lesson.id, lesson]));
  const questionById = new Map(course.interviewQuestions.map((question) => [question.id, question]));
  const completedLessons = (progress.completedLessonIds ?? [])
    .map((id) => lessonById.get(id)?.title ?? id);
  const quizEntries = Object.entries(progress.quizResults ?? {});
  const reviewQuestions = (progress.reviewQueue ?? [])
    .map((id) => questionById.get(id)?.question ?? id);

  root.replaceChildren(
    element('section', { className: 'progress-view', attrs: { 'aria-labelledby': 'progress-title' } }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: `${course.title} / 学习账簿` }),
        element('h1', { text: '学习进度', attrs: { id: 'progress-title' } }),
        element('p', { text: '课程完成、测验结果与面试掌握分别记录；复习队列不会因为“已掌握”而自动消失。' }),
      ]),
      element('div', { className: 'progress-ledger' }, [
        element('section', { className: 'progress-ledger__summary' }, [
          element('div', {}, [
            element('span', { text: '课程完成' }),
            element('strong', { text: `${summary.lessonsCompleted} / ${course.lessons.length}` }),
            element('span', { text: `${summary.lessonPercent}%` }),
          ]),
          element('div', {}, [
            element('span', { text: '面试掌握' }),
            element('strong', { text: `${summary.interviewsMastered} / ${course.interviewQuestions.length}` }),
            element('span', { text: `${summary.interviewPercent}%` }),
          ]),
        ]),
        element('section', { className: 'progress-ledger__section' }, [
          element('h2', { text: '已完成课程' }),
          namedList(completedLessons, '尚未完成课程；从学习主线的第一项交付开始。', 'completed-lesson-list'),
        ]),
        element('section', { className: 'progress-ledger__section' }, [
          element('h2', { text: '测验记录' }),
          quizEntries.length
            ? element('ul', { className: 'quiz-result-ledger' }, quizEntries.map(([lessonId, result]) => element('li', {}, [
              element('strong', { text: lessonById.get(lessonId)?.title ?? lessonId }),
              element('span', { text: `${result.correct ?? 0} / ${result.total ?? 0} · ${result.percent ?? 0}%` }),
              result.completedAt ? element('time', { text: formatVisit(result.completedAt), attrs: { datetime: result.completedAt } }) : null,
            ])))
            : element('p', { className: 'empty-note', text: '尚无测验记录；提交课程测验后会显示在这里。' }),
        ]),
        element('section', { className: 'progress-ledger__section' }, [
          element('h2', { text: '复习队列' }),
          namedList(reviewQuestions, '复习队列为空；在面试档案中加入需要重复口述的题目。', 'review-queue-list'),
        ]),
        element('section', { className: 'progress-ledger__section storage-record' }, [
          element('h2', { text: '保存状态' }),
          element('p', { text: `最近访问：${formatVisit(progress.lastVisitedAt)}` }),
          element('p', {
            text: storageMode === 'memory'
              ? '当前为临时内存模式：浏览器阻止了本地存储，关闭页面后本次进度会丢失。'
              : '当前为浏览器本地保存：进度只保存在此浏览器的 Agent Learner 专用键中。',
          }),
        ]),
      ]),
      element('section', { className: 'reset-zone', attrs: { 'aria-labelledby': 'reset-zone-title' } }, [
        element('h2', { text: '重新开始', attrs: { id: 'reset-zone-title' } }),
        element('p', { text: '需要从零复习时，可以清空当前版本保存在专用键中的全部学习记录。' }),
        resetConfirmOpen
          ? element('div', { className: 'reset-confirmation' }, [
            element('h3', {
              text: '确认重置学习进度？',
              attrs: { id: 'progress-reset-confirm-title', tabindex: '-1' },
            }),
            element('p', { text: '会删除 Agent Learner 当前版本的全部本地课程、测验、面试和复习记录，但不会清除其他网站或应用的数据。' }),
            element('div', { className: 'reset-confirmation__actions' }, [
              button('确认重置', { className: 'destructive-action', events: { click: () => onConfirmReset?.() } }),
              button('取消', { className: 'secondary-action', events: { click: () => onCancelReset?.() } }),
            ]),
          ])
          : button('重置学习进度', {
            className: 'reset-request',
            attrs: { id: 'progress-reset-button' },
            events: { click: () => onRequestReset?.() },
          }),
      ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}
