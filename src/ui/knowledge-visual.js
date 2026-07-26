import { element, externalLink } from './dom.js';

function visualLabel(visual) {
  if (visual.kind === 'source-figure') return '来源原图';
  if (visual.kind === 'step-diagram') return '分步机制图';
  return '原创教学图解';
}

function localOriginalLink(visual) {
  return element('a', {
    className: 'knowledge-visual__original-link',
    text: '查看原图（新标签）',
    attrs: {
      href: visual.assetPath,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
}

function visualCredit(visual) {
  if (visual.provenance === 'original-synthesis') {
    return element('p', {
      className: 'knowledge-visual__credit',
      text: visual.credit,
    });
  }

  return element('p', { className: 'knowledge-visual__credit' }, [
    element('span', {
      text: `来源：${visual.creator} · ${visual.sourceFigure} · `,
    }),
    externalLink({
      title: '原始来源',
      url: visual.sourceUrl,
    }),
    element('span', { text: ' · 许可：' }),
    externalLink({
      title: visual.permission?.name,
      url: visual.permission?.url,
    }),
  ]);
}

export function renderKnowledgeVisual(visual) {
  const fallback = element('p', {
    className: 'knowledge-visual__fallback',
    text: '图片暂时无法加载，可继续阅读图注、长描述或查看原图。',
    attrs: { role: 'status', hidden: true },
  });
  fallback.hidden = true;

  let image;
  let imageErrorHandled = false;
  const handleImageError = () => {
    if (imageErrorHandled) return;
    imageErrorHandled = true;
    image.hidden = true;
    image.setAttribute('aria-hidden', 'true');
    fallback.hidden = false;
    fallback.removeAttribute('hidden');
    image.removeEventListener('error', handleImageError);
  };
  image = element('img', {
    className: 'knowledge-visual__image',
    attrs: {
      src: visual.assetPath,
      alt: visual.alt,
      loading: 'lazy',
      decoding: 'async',
      width: visual.width,
      height: visual.height,
    },
    events: { error: handleImageError },
  });

  return element('figure', {
    className: 'knowledge-visual',
    dataset: {
      kind: visual.kind,
      provenance: visual.provenance,
    },
  }, [
    element('span', {
      className: 'knowledge-visual__label',
      text: visualLabel(visual),
    }),
    element('h3', { text: visual.title }),
    element('div', { className: 'knowledge-visual__media' }, [
      image,
      fallback,
    ]),
    element('figcaption', {}, [
      element('p', { text: visual.caption }),
      visualCredit(visual),
      localOriginalLink(visual),
    ]),
    visual.longDescription
      ? element('details', { className: 'knowledge-visual__long-description' }, [
        element('summary', { text: '查看长描述' }),
        element('p', { text: visual.longDescription }),
      ])
      : null,
  ]);
}
