import { button, element, externalLink } from './dom.js';

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

export function renderKnowledgeNote(course, lesson) {
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
      ...(section.paragraphs ?? []).map((paragraph) => element('p', { text: paragraph })),
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

  return element('div', { className: 'knowledge-note' }, [
    element('section', { className: 'knowledge-note__introduction' }, [
      element('p', { text: note.introduction }),
    ]),
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
