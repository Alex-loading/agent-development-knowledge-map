import { buildKnowledgeNodes, getDueInterviewQuestions, getNextLesson } from '../core/view-models.js';
import { button, element } from './dom.js';

const STATUS_LABELS = {
  complete: '已完成',
  current: '当前建议',
  available: '可学习',
  locked: '待先修',
};

function progressBlock(label, completed, total, percent) {
  return element('section', { className: 'progress-block', attrs: { 'aria-label': label } }, [
    element('div', { className: 'progress-block__heading' }, [
      element('h3', { text: label }),
      element('strong', { text: `${percent}%` }),
    ]),
    element('progress', {
      attrs: {
        max: total || 1,
        value: completed,
        'aria-label': label,
        'aria-valuetext': `${completed} / ${total}`,
      },
    }),
    element('p', { text: `${completed} / ${total} ${label === '课程完成度' ? '节课程' : '道题已掌握'}` }),
  ]);
}

function formatVisit(timestamp) {
  if (!timestamp) return '尚无记录';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '记录时间不可用';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function recommendation(course, progress, onOpenLesson) {
  const nextLesson = getNextLesson(course.lessons, progress);
  if (!nextLesson) {
    return element('section', { className: 'recommendation-spread' }, [
      element('span', { className: 'section-index', text: '推荐路径 / 暂无可用节点' }),
      element('h2', { text: '先检查课程先修关系' }),
      element('p', { text: '当前没有满足先修条件的未完成课程，你仍可从学习主线自由查看全部内容。' }),
    ]);
  }

  const allComplete = course.lessons.every(({ id }) => progress.completedLessonIds?.includes(id));
  return element('section', { className: 'recommendation-spread', attrs: { 'aria-labelledby': 'recommended-title' } }, [
    element('span', {
      className: 'section-index',
      text: allComplete ? '主线完成 / 回看终章' : `下一站 / 课程 ${String(nextLesson.order).padStart(2, '0')}`,
    }),
    element('h2', { text: allComplete ? '八节主线已经完成' : nextLesson.title, attrs: { id: 'recommended-title' } }),
    element('p', {
      className: 'recommendation-spread__summary',
      text: allComplete
        ? `做得好。回到「${nextLesson.title}」复盘上线门槛，或进入面试题继续巩固。`
        : nextLesson.summary,
    }),
    element('div', { className: 'recommendation-spread__meta' }, [
      element('span', { text: `约 ${nextLesson.durationMinutes} 分钟` }),
      element('span', { text: `${nextLesson.objectives?.length ?? 0} 项学习目标` }),
    ]),
    button(allComplete ? '回看最终课程' : '开始推荐课程', {
      className: 'primary-action',
      events: { click: () => onOpenLesson?.(nextLesson.id) },
    }),
  ]);
}

function miniPath(course, progress, onOpenLesson) {
  const nodes = buildKnowledgeNodes(course.lessons, progress);
  return element('section', { className: 'dashboard-panel mini-path', attrs: { 'aria-labelledby': 'mini-path-title' } }, [
    element('div', { className: 'panel-heading' }, [
      element('span', { className: 'section-index', text: '路径速览' }),
      element('h2', { text: '八步知识路径', attrs: { id: 'mini-path-title' } }),
    ]),
    element('ol', { className: 'mini-path__list' }, nodes.map((node) => (
      element('li', { className: `mini-path__node status-${node.status}` }, [
        button(`${String(node.order).padStart(2, '0')} ${node.title}`, {
          className: 'text-action',
          attrs: { 'aria-label': `打开课程 ${node.order}：${node.title}` },
          events: { click: () => onOpenLesson?.(node.id) },
        }),
        element('span', { className: 'status-stamp', text: STATUS_LABELS[node.status] }),
      ])
    ))),
  ]);
}

function reviewPanel(course, progress, onNavigate) {
  const due = getDueInterviewQuestions(course.interviewQuestions, progress).slice(0, 3);
  return element('section', { className: 'dashboard-panel review-docket', attrs: { 'aria-labelledby': 'review-title' } }, [
    element('div', { className: 'panel-heading' }, [
      element('span', { className: 'section-index', text: '复习档案' }),
      element('h2', { text: '今日待复习', attrs: { id: 'review-title' } }),
    ]),
    due.length
      ? element('ol', {}, due.map((question) => element('li', { text: question.question })))
      : element('p', { className: 'empty-note', text: '当前没有到期待复习题。可进入面试高频建立第一批复习记录。' }),
    button('打开面试高频', {
      className: 'secondary-action',
      events: { click: () => onNavigate?.('interviews') },
    }),
  ]);
}

export function renderDashboard(root, {
  course,
  progress,
  summary,
  onOpenLesson,
  onNavigate,
}) {
  root.replaceChildren(
    element('div', { className: 'dashboard-view' }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: 'LLM FOUNDATION / 模块首页' }),
        element('h1', { text: course.title }),
        element('p', { text: course.summary }),
      ]),
      recommendation(course, progress, onOpenLesson),
      element('div', { className: 'dashboard-grid' }, [
        element('section', { className: 'dashboard-panel progress-ledger', attrs: { 'aria-labelledby': 'progress-title' } }, [
          element('div', { className: 'panel-heading' }, [
            element('span', { className: 'section-index', text: '双轨进度' }),
            element('h2', { text: '学习记录', attrs: { id: 'progress-title' } }),
          ]),
          progressBlock('课程完成度', summary.lessonsCompleted, course.lessons.length, summary.lessonPercent),
          progressBlock('面试掌握度', summary.interviewsMastered, course.interviewQuestions.length, summary.interviewPercent),
          element('p', { className: 'last-visit', text: `最近访问：${formatVisit(progress.lastVisitedAt)}` }),
        ]),
        reviewPanel(course, progress, onNavigate),
      ]),
      miniPath(course, progress, onOpenLesson),
      element('nav', { className: 'quick-actions', attrs: { 'aria-label': '快捷入口' } }, [
        button('查看学习主线', { className: 'secondary-action', events: { click: () => onNavigate?.('curriculum') } }),
        button('打开知识地图', { className: 'secondary-action', events: { click: () => onNavigate?.('map') } }),
        button('训练面试题', { className: 'secondary-action', events: { click: () => onNavigate?.('interviews') } }),
      ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}
