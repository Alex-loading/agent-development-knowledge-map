import {
  FILTER_ALL,
  filterInterviewQuestions,
  filterOptionValue,
} from '../core/filters.js';
import { button, element } from './dom.js';

const STATUS_LABELS = {
  unseen: '未掌握',
  reviewing: '复习中',
  mastered: '已掌握',
};

function distinct(items, getter) {
  return [...new Set(items.flatMap((item) => getter(item) ?? []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function filterSelect({ id, label, value = FILTER_ALL, options, labels = {}, onChange }) {
  const select = element('select', {
    attrs: { id, name: id },
    events: { change: () => onChange(select.value, id) },
  }, [
    element('option', { text: '全部', attrs: { value: FILTER_ALL } }),
    ...options.map((option) => element('option', {
      text: labels[option] ?? option,
      attrs: { value: filterOptionValue(option) },
    })),
  ]);
  select.value = value ?? FILTER_ALL;
  for (const option of select.children) option.selected = option.value === select.value;
  return element('label', { className: 'filter-control', attrs: { for: id } }, [
    element('span', { text: label }),
    select,
  ]);
}

function answerDrawer(question, lesson, onOpenLesson) {
  return element('section', {
    className: 'answer-drawer',
    attrs: { id: `answer-${question.id}`, 'aria-label': '参考回答与追问' },
  }, [
    element('div', { className: 'answer-drawer__short' }, [
      element('h3', { text: '30 秒回答' }),
      element('p', { text: question.shortAnswer }),
    ]),
    element('div', {}, [
      element('h3', { text: '深挖要点' }),
      element('ul', {}, question.deepDive.map((item) => element('li', { text: item }))),
    ]),
    element('div', {}, [
      element('h3', { text: '常见误区' }),
      element('ul', {}, question.misconceptions.map((item) => element('li', { text: item }))),
    ]),
    element('div', {}, [
      element('h3', { text: '可能追问' }),
      element('ul', {}, question.followUps.map((item) => element('li', { text: item }))),
    ]),
    button(`打开关联课程：${lesson?.title ?? question.lessonId}`, {
      className: 'text-action',
      events: { click: () => onOpenLesson?.(question.lessonId) },
    }),
  ]);
}

function interviewCard({
  question,
  lesson,
  status,
  queued,
  revealed,
  onToggleReveal,
  onSetStatus,
  onToggleReview,
  onOpenLesson,
}) {
  return element('article', {
    className: 'interview-card',
    dataset: { questionId: question.id },
    attrs: { 'data-question-id': question.id, 'aria-labelledby': `question-${question.id}` },
  }, [
    element('header', { className: 'interview-card__header' }, [
      element('div', {}, [
        element('span', { className: 'section-index', text: `${question.frequency}频 · ${question.difficulty}` }),
        element('h2', { text: question.question, attrs: { id: `question-${question.id}` } }),
      ]),
      button(queued ? '移出复习' : '加入复习', {
        className: `review-bookmark${queued ? ' is-queued' : ''}`,
        attrs: { id: `interview-review-${question.id}`, 'aria-pressed': queued ? 'true' : 'false' },
        events: { click: () => onToggleReview?.(question.id, `interview-review-${question.id}`) },
      }),
    ]),
    element('p', {
      className: 'interview-card__meta',
      text: `岗位 ${question.roles.join(' / ')} · 关联 ${lesson?.title ?? question.lessonId}`,
    }),
    element('div', { className: 'status-matrix' }, [
      element('span', { className: 'status-matrix__current', text: `当前：${STATUS_LABELS[status]}` }),
      element('div', { attrs: { role: 'group', 'aria-label': '掌握状态' } }, Object.entries(STATUS_LABELS).map(([value, label]) => button(label, {
        className: 'status-action',
        attrs: { id: `interview-status-${question.id}-${value}`, 'aria-pressed': status === value ? 'true' : 'false' },
        events: { click: () => onSetStatus?.(question.id, value, `interview-status-${question.id}-${value}`) },
      }))),
    ]),
    button(revealed ? '收起参考回答' : '查看参考回答', {
      className: 'reveal-answer',
      attrs: {
        id: `interview-reveal-${question.id}`,
        'aria-expanded': revealed ? 'true' : 'false',
        'aria-controls': `answer-${question.id}`,
      },
      events: { click: () => onToggleReveal?.(question.id, `interview-reveal-${question.id}`) },
    }),
    revealed ? answerDrawer(question, lesson, onOpenLesson) : null,
  ]);
}

export function renderInterviewPractice(root, {
  course,
  progress,
  filters = {},
  revealedIds = new Set(),
  onFiltersChange,
  onToggleReveal,
  onSetStatus,
  onToggleReview,
  onOpenLesson,
}) {
  const questions = course.interviewQuestions ?? [];
  const validQuestionIds = new Set(questions.map(({ id }) => id));
  const statusById = progress.interviewStatusById ?? {};
  const reviewQueue = new Set((progress.reviewQueue ?? []).filter((id) => validQuestionIds.has(id)));
  const revealed = revealedIds instanceof Set ? revealedIds : new Set(revealedIds ?? []);
  const canonical = (value) => (value == null || value === 'all' ? FILTER_ALL : value);
  const normalized = {
    role: canonical(filters.role),
    frequency: canonical(filters.frequency),
    difficulty: canonical(filters.difficulty),
    status: canonical(filters.status),
  };
  const visible = filterInterviewQuestions(questions, normalized, statusById);
  const activeCount = Object.values(normalized).filter((value) => value !== FILTER_ALL).length;
  const mastered = Object.entries(statusById)
    .filter(([id, status]) => validQuestionIds.has(id) && status === 'mastered').length;
  const lessonById = new Map(course.lessons.map((lesson) => [lesson.id, lesson]));
  const updateFilter = (key, value, focusId) => onFiltersChange?.({ ...normalized, [key]: value }, focusId);
  const fields = [
    ['role', '目标岗位', distinct(questions, (question) => question.roles)],
    ['frequency', '频率', distinct(questions, (question) => question.frequency)],
    ['difficulty', '难度', distinct(questions, (question) => question.difficulty)],
    ['status', '掌握状态', ['unseen', 'reviewing', 'mastered'], STATUS_LABELS],
  ];

  root.replaceChildren(
    element('section', { className: 'interview-practice-view', attrs: { 'aria-labelledby': 'interviews-title' } }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: 'LLM FOUNDATION / 面试档案' }),
        element('h1', { text: '面试高频', attrs: { id: 'interviews-title' } }),
        element('p', { text: '先口述自己的 30 秒答案，再展开参考内容；深挖、误区与追问共同组成一次完整演练。' }),
      ]),
      element('div', { className: 'interview-summary', attrs: { id: 'interview-results-summary', tabindex: '-1', 'aria-live': 'polite' } }, [
        element('strong', { text: `已掌握 ${mastered} / ${questions.length}` }),
        element('span', { text: `复习队列 ${reviewQueue.size} 题` }),
      ]),
      element('fieldset', { className: 'filter-ledger' }, [
        element('legend', { text: '筛选面试题' }),
        element('div', { className: 'filter-ledger__grid' }, fields.map(([key, label, options, labels]) => filterSelect({
          id: `interview-filter-${key}`,
          label,
          value: normalized[key],
          options,
          labels,
          onChange: (value, focusId) => updateFilter(key, value, focusId),
        }))),
        element('div', { className: 'filter-ledger__summary' }, [
          element('strong', { text: `显示 ${visible.length} / ${questions.length}` }),
          element('span', { text: `启用筛选 ${activeCount} 项` }),
          button('重置筛选', {
            className: 'secondary-action',
            disabled: activeCount === 0,
            attrs: { id: 'interview-reset-filters' },
            events: { click: () => onFiltersChange?.({}, 'interview-reset-filters') },
          }),
        ]),
      ]),
      visible.length
        ? element('div', { className: 'interview-docket' }, visible.map((question) => interviewCard({
          question,
          lesson: lessonById.get(question.lessonId),
          status: statusById[question.id] ?? 'unseen',
          queued: reviewQueue.has(question.id),
          revealed: revealed.has(question.id),
          onToggleReveal,
          onSetStatus,
          onToggleReview,
          onOpenLesson,
        })))
        : element('section', { className: 'empty-state interview-empty' }, [
          element('h2', { text: '没有符合当前筛选条件的面试题' }),
          element('p', { text: '重置筛选，或放宽岗位、频率、难度和掌握状态。' }),
          button('重置筛选', {
            attrs: { id: 'interview-empty-reset-filters' },
            events: { click: () => onFiltersChange?.({}, 'interview-empty-reset-filters') },
          }),
        ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}
