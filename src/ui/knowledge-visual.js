import { button, element, externalLink } from './dom.js';
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
    attrs: { 'data-visual-diagnostic': 'true' },
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

function setButtonDisabled(control, disabled) {
  control.disabled = disabled;
  if (disabled) {
    control.setAttribute('disabled', '');
  } else {
    control.removeAttribute('disabled');
  }
}

function stepDiagramControls(visual, image, restoreImageLoadingPath) {
  let currentIndex = 0;
  const status = element('p', {
    className: 'knowledge-visual__step-status',
    attrs: {
      tabindex: '-1',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
  });
  const description = element('p', {
    className: 'knowledge-visual__step-description',
  });
  let previous;
  let next;

  const renderStep = ({ focusStatus = false } = {}) => {
    const {
      id, title, description: stepDescription, assetPath, alt,
    } = visual.steps[currentIndex];

    restoreImageLoadingPath();
    image.setAttribute('src', assetPath);
    image.setAttribute('alt', alt);
    status.dataset.stepId = id;
    status.textContent = `${currentIndex + 1} / ${visual.steps.length} · ${title}`;
    description.textContent = stepDescription;
    setButtonDisabled(previous, currentIndex === 0);
    setButtonDisabled(next, currentIndex === visual.steps.length - 1);
    if (focusStatus) status.focus();
  };

  previous = button('上一步', {
    className: 'knowledge-visual__step-previous',
    attrs: { 'aria-label': '显示上一步' },
    events: {
      click: () => {
        if (currentIndex === 0) return;
        currentIndex -= 1;
        renderStep();
      },
    },
  });
  next = button('下一步', {
    className: 'knowledge-visual__step-next',
    attrs: { 'aria-label': '显示下一步' },
    events: {
      click: () => {
        if (currentIndex === visual.steps.length - 1) return;
        currentIndex += 1;
        renderStep();
      },
    },
  });
  const reset = button('重置', {
    className: 'knowledge-visual__step-reset',
    attrs: { 'aria-label': '重置为第一步' },
    events: {
      click: () => {
        currentIndex = 0;
        renderStep({ focusStatus: true });
      },
    },
  });

  renderStep();

  return element('div', {
    className: 'knowledge-visual__controls',
  }, [
    status,
    description,
    element('div', {
      className: 'knowledge-visual__step-actions',
    }, [previous, next, reset]),
  ]);
}

export function renderKnowledgeVisual(candidate) {
  const validation = validateRenderableVisual(candidate);
  if (!validation.valid) return invalidVisualDiagnostic();
  const visual = validation.visual;
  const firstImage = visual.kind === 'step-diagram'
    ? visual.steps[0]
    : visual;

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
      src: firstImage.assetPath,
      alt: firstImage.alt,
      loading: 'lazy',
      decoding: 'async',
      width: visual.width,
      height: visual.height,
    },
    events: { error: handleImageError },
  });
  const restoreImageLoadingPath = () => {
    imageErrorHandled = false;
    image.hidden = false;
    image.removeAttribute('aria-hidden');
    fallback.hidden = true;
    fallback.setAttribute('hidden', '');
    image.removeEventListener('error', handleImageError);
    image.addEventListener('error', handleImageError);
  };
  const controls = visual.kind === 'step-diagram'
    ? stepDiagramControls(visual, image, restoreImageLoadingPath)
    : null;

  const longDescription = visual.longDescription
    ? element('details', { className: 'knowledge-visual__long-description' }, [
      element('summary', { text: '查看长描述' }),
      element('p', { text: visual.longDescription }),
    ])
    : null;

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
    element('p', {
      className: 'knowledge-visual__title',
      text: visual.title,
    }),
    element('div', { className: 'knowledge-visual__media' }, [
      image,
      fallback,
    ]),
    controls,
    element('figcaption', {}, [
      element('p', { text: visual.caption }),
      visualCredit(visual),
      localOriginalLink(visual),
      longDescription,
    ]),
  ]);
}
