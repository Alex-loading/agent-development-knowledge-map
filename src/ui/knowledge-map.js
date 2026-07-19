import { buildKnowledgeNodes } from '../core/view-models.js';
import { button, element } from './dom.js';

const STATUS_LABELS = {
  complete: '已完成',
  current: '当前建议',
  available: '可学习',
  locked: '待先修',
};

function prerequisiteText(node, lessonById, nodeById) {
  if (!node.prerequisiteIds.length) return '前置：无需先修';
  const labels = node.prerequisiteIds.map((id) => {
    const title = lessonById.get(id)?.title ?? `未知课程 ${id}`;
    const status = STATUS_LABELS[nodeById.get(id)?.status] ?? '状态未知';
    return `${title}（${status}）`;
  });
  return `前置：${labels.join('、')}`;
}

export function renderKnowledgeMap(root, { course, progress, onOpenLesson }) {
  const nodes = buildKnowledgeNodes(course.lessons, progress);
  const lessonById = new Map(course.lessons.map((lesson) => [lesson.id, lesson]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  root.replaceChildren(
    element('section', { className: 'knowledge-map-view', attrs: { 'aria-labelledby': 'map-title' } }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: 'LLM FOUNDATION / 依赖账本' }),
        element('h1', { text: '知识地图', attrs: { id: 'map-title' } }),
        element('p', { text: '状态表示推荐学习顺序，不是访问限制。“待先修”课程仍可打开查看，适合先建立问题意识再回补前置概念。' }),
      ]),
      nodes.length
        ? element('ol', { className: 'knowledge-path' }, nodes.map((node) => (
          element('li', { className: `knowledge-node status-${node.status}` }, [
            element('div', { className: 'knowledge-node__index', text: String(node.order).padStart(2, '0'), attrs: { 'aria-hidden': 'true' } }),
            element('div', { className: 'knowledge-node__body' }, [
              element('div', { className: 'knowledge-node__heading' }, [
                element('h2', { text: node.title }),
                element('span', { className: 'status-stamp', text: STATUS_LABELS[node.status] }),
              ]),
              element('p', { className: 'prerequisite-line', text: prerequisiteText(node, lessonById, nodeById) }),
              button('查看课程', {
                className: 'text-action',
                attrs: { 'aria-label': `查看课程 ${node.order}：${node.title}，状态${STATUS_LABELS[node.status]}` },
                events: { click: () => onOpenLesson?.(node.id) },
              }),
            ]),
          ])
        )))
        : element('p', { className: 'empty-note', text: '这个模块尚未配置课程节点。' }),
    ]),
  );
  root.removeAttribute('aria-busy');
}
