import { element, externalLink } from './dom.js';
import { validateVisualAsset } from '../data/visuals/visual-contract.js';

function safePrimitive(value) {
  return (
    value === null
    || ['string', 'number', 'boolean', 'undefined'].includes(typeof value)
  );
}

function safePlainSnapshot(value, state) {
  if (safePrimitive(value)) return { valid: true, value };
  if (typeof value !== 'object') return { valid: false };
  if (state.active.has(value)) return { valid: false };
  if (state.copies.has(value)) {
    return { valid: true, value: state.copies.get(value) };
  }

  let arrayValue;
  let prototype;
  let keys;
  try {
    arrayValue = Array.isArray(value);
    prototype = Object.getPrototypeOf(value);
    if (
      (arrayValue && prototype !== Array.prototype)
      || (
        !arrayValue
        && prototype !== Object.prototype
        && prototype !== null
      )
    ) {
      return { valid: false };
    }
    keys = Reflect.ownKeys(value);
  } catch {
    return { valid: false };
  }

  const copy = arrayValue ? [] : Object.create(null);
  state.copies.set(value, copy);
  state.active.add(value);

  try {
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        return { valid: false };
      }
      if (arrayValue && key === 'length') {
        copy.length = descriptor.value;
        continue;
      }

      const nested = safePlainSnapshot(descriptor.value, state);
      if (!nested.valid) return { valid: false };
      Object.defineProperty(copy, key, {
        value: nested.value,
        enumerable: descriptor.enumerable,
        configurable: true,
        writable: true,
      });
    }
  } catch {
    return { valid: false };
  } finally {
    state.active.delete(value);
  }

  return { valid: true, value: copy };
}

export function validateRenderableVisual(candidate) {
  const snapshot = safePlainSnapshot(candidate, {
    active: new WeakSet(),
    copies: new WeakMap(),
  });
  if (!snapshot.valid) return { valid: false };

  try {
    if (validateVisualAsset(snapshot.value).length > 0) {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }
  return { valid: true, visual: snapshot.value };
}

function invalidVisualDiagnostic() {
  return element('p', {
    className: 'knowledge-visual-diagnostic data-diagnostic',
    text: '视觉资源无法安全渲染，正文内容仍可继续阅读。',
    attrs: {
      role: 'status',
      'data-visual-diagnostic': 'true',
    },
  });
}

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

export function renderKnowledgeVisual(candidate) {
  const validation = validateRenderableVisual(candidate);
  if (!validation.valid) return invalidVisualDiagnostic();
  const visual = validation.visual;

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
