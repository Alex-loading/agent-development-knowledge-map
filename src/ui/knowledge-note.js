import { button, element, externalLink } from './dom.js';
import { knowledgeVisualsById } from '../data/visuals/index.js';
import { renderKnowledgeVisual } from './knowledge-visual.js';

const STABLE_VISUAL_ID = /^visual-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isHttpsResource(resource) {
  try {
    return new URL(resource?.url).protocol === 'https:';
  } catch {
    return false;
  }
}

function bulletList(items, className) {
  return items?.length
    ? element('ul', { className }, items.map((item) => element('li', { text: item })))
    : element('p', { className: 'empty-note', text: '本节暂无条目。' });
}

function renderSources(section, resourcesById, diagnostics) {
  const resources = [];

  for (const sourceId of section.sourceIds ?? []) {
    const resource = resourcesById.get(sourceId);
    if (!resource) {
      diagnostics.add(`未找到资料引用：${sourceId}`);
      continue;
    }
    if (!isHttpsResource(resource)) {
      diagnostics.add(`资料引用不是安全的 HTTPS 链接：${sourceId}`);
      continue;
    }
    resources.push(resource);
  }

  return element('div', { className: 'knowledge-note__sources' }, [
    element('h3', { text: '本节依据' }),
    resources.length
      ? element('ul', {}, resources.map((resource) => element('li', {}, [
        externalLink(resource),
        resource.source ? element('span', { className: 'resource-note', text: ` · ${resource.source}` }) : null,
      ])))
      : element('p', { className: 'empty-note', text: '本节暂无可用的 HTTPS 资料链接。' }),
  ]);
}

function renderCallout(callout) {
  if (!callout) return null;
  return element('aside', {
    className: 'knowledge-note__callout',
    dataset: { kind: callout.kind },
  }, [
    element('h3', { text: callout.title }),
    element('p', { text: callout.body }),
  ]);
}

function renderMisconceptions(misconceptions) {
  return element('section', { className: 'knowledge-note__misconceptions' }, [
    element('h2', { text: '常见误区' }),
    misconceptions?.length
      ? element('dl', {}, misconceptions.flatMap((item) => [
        element('dt', { text: item.claim }),
        element('dd', { text: item.correction }),
      ]))
      : element('p', { className: 'empty-note', text: '本章暂无常见误区。' }),
  ]);
}

function ownDataValue(record, key) {
  if (!record || typeof record !== 'object') return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

function visualFromRegistry(visualsById, visualId) {
  if (
    typeof visualId !== 'string'
    || !STABLE_VISUAL_ID.test(visualId)
  ) {
    return undefined;
  }
  if (visualsById instanceof Map) {
    return visualsById.has(visualId) ? visualsById.get(visualId) : undefined;
  }
  if (
    !visualsById
    || typeof visualsById !== 'object'
    || !Object.hasOwn(visualsById, visualId)
  ) {
    return undefined;
  }
  return ownDataValue(visualsById, visualId);
}

function safeIdentifier(value, fallback) {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function renderVisualDiagnostic({
  lessonId,
  sectionId,
  visualId,
  reason,
}) {
  return element('p', {
    className: 'knowledge-visual-diagnostic data-diagnostic',
    text: [
      `视觉引用诊断：lesson=${safeIdentifier(lessonId, '[unknown lesson]')}`,
      `section=${safeIdentifier(sectionId, '[unknown section]')}`,
      `visual=${safeIdentifier(visualId, '[缺失 visualId]')}`,
      `原因：${reason}`,
    ].join('；'),
    attrs: {
      role: 'status',
      'data-visual-diagnostic': 'true',
    },
  });
}

function resolveVisualNode({
  visualsById,
  lessonId,
  sectionId,
  visualId,
}) {
  if (typeof visualId !== 'string' || visualId.length === 0) {
    return renderVisualDiagnostic({
      lessonId,
      sectionId,
      visualId,
      reason: '缺少有效 visualId',
    });
  }
  if (!STABLE_VISUAL_ID.test(visualId)) {
    return renderVisualDiagnostic({
      lessonId,
      sectionId,
      visualId,
      reason: 'visualId 不符合稳定 ID 格式',
    });
  }

  const visual = visualFromRegistry(visualsById, visualId);
  if (!visual || typeof visual !== 'object') {
    return renderVisualDiagnostic({
      lessonId,
      sectionId,
      visualId,
      reason: 'visualId 未在视觉注册表中解析',
    });
  }
  return renderKnowledgeVisual(visual);
}

function renderSectionContent(section, lessonId, visualsById) {
  const paragraphs = section.paragraphs ?? [];
  if (!Array.isArray(section.visuals)) {
    return paragraphs.map((paragraph) => element('p', { text: paragraph }));
  }

  const nodesAfterParagraph = paragraphs.map(() => []);
  const trailingDiagnostics = [];

  for (let index = 0; index < section.visuals.length; index += 1) {
    const reference = Object.hasOwn(section.visuals, index)
      ? section.visuals[index]
      : null;
    const visualId = ownDataValue(reference, 'visualId');
    const afterParagraph = ownDataValue(reference, 'afterParagraph');

    if (typeof visualId !== 'string' || visualId.length === 0) {
      const diagnostic = renderVisualDiagnostic({
        lessonId,
        sectionId: section.id,
        visualId,
        reason: '缺少有效 visualId',
      });
      if (
        Number.isInteger(afterParagraph)
        && afterParagraph >= 0
        && afterParagraph < paragraphs.length
      ) {
        nodesAfterParagraph[afterParagraph].push(diagnostic);
      } else {
        trailingDiagnostics.push(diagnostic);
      }
      continue;
    }

    if (
      !Number.isInteger(afterParagraph)
      || afterParagraph < 0
      || afterParagraph >= paragraphs.length
    ) {
      trailingDiagnostics.push(renderVisualDiagnostic({
        lessonId,
        sectionId: section.id,
        visualId,
        reason: 'afterParagraph 必须是正文范围内的非负整数',
      }));
      continue;
    }

    nodesAfterParagraph[afterParagraph].push(resolveVisualNode({
      visualsById,
      lessonId,
      sectionId: section.id,
      visualId,
    }));
  }

  return [
    ...paragraphs.flatMap((paragraph, index) => [
      element('p', { text: paragraph }),
      ...nodesAfterParagraph[index],
    ]),
    ...trailingDiagnostics,
  ];
}

export function renderKnowledgeNote(
  course,
  lesson,
  { visualsById = knowledgeVisualsById } = {},
) {
  const note = lesson.knowledgeNote;
  const diagnostics = new Set();
  const resourcesById = new Map((course.resources ?? []).map((resource) => [resource.id, resource]));
  const sectionHeadings = new Map();
  const sections = (note.sections ?? []).map((section) => {
    const heading = element('h2', {
      text: section.title,
      attrs: { id: `${lesson.id}-note-${section.id}`, tabindex: '-1' },
    });
    sectionHeadings.set(section.id, heading);

    return element('section', { className: 'knowledge-note__section' }, [
      heading,
      ...renderSectionContent(section, lesson.id, visualsById),
      bulletList(section.keyPoints, 'key-point-list'),
      renderCallout(section.callout),
      renderSources(section, resourcesById, diagnostics),
    ]);
  });

  const toc = element('nav', {
    className: 'knowledge-note__toc',
    attrs: { 'aria-label': '本章目录' },
  }, [
    element('h2', { text: '本章目录' }),
    (note.sections ?? []).length
      ? element('ol', {}, note.sections.map((section) => element('li', {}, [
        button(section.title, {
          className: 'text-action',
          attrs: { 'aria-controls': `${lesson.id}-note-${section.id}` },
          events: { click: () => sectionHeadings.get(section.id)?.focus() },
        }),
      ])))
      : element('p', { className: 'empty-note', text: '本章目录正在整理。' }),
  ]);

  const overviewVisualId = ownDataValue(note, 'overviewVisualId');
  const overview = Object.hasOwn(note, 'overviewVisualId')
    ? resolveVisualNode({
      visualsById,
      lessonId: lesson.id,
      sectionId: 'overview',
      visualId: overviewVisualId,
    })
    : null;

  return element('div', { className: 'knowledge-note' }, [
    element('section', { className: 'knowledge-note__introduction' }, [
      element('p', { text: note.introduction }),
    ]),
    overview,
    toc,
    ...sections,
    diagnostics.size
      ? element('aside', {
        className: 'data-diagnostic',
        attrs: { role: 'status' },
      }, [
        element('strong', { text: '部分资料引用暂时无法解析，正文内容仍可继续阅读。' }),
        element('ul', {}, [...diagnostics].map((message) => element('li', { text: message }))),
      ])
      : null,
    renderMisconceptions(note.misconceptions),
    element('section', { className: 'knowledge-note__recap' }, [
      element('h2', { text: '本章回顾' }),
      bulletList(note.recap, 'knowledge-note__recap-list'),
    ]),
    element('section', { className: 'knowledge-note__next-step' }, [
      element('h2', { text: '下一步' }),
      element('p', { text: note.nextStep }),
    ]),
  ]);
}
