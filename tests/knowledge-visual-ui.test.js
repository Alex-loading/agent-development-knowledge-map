import test from 'node:test';
import assert from 'node:assert/strict';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { renderKnowledgeNote } from '../src/ui/knowledge-note.js';
import { renderKnowledgeVisual } from '../src/ui/knowledge-visual.js';
import {
  FakeDocument,
  FakeEvent,
  findButton,
  installFakeDom,
} from './helpers/fake-dom.js';

const originalVisual = {
  id: 'visual-test-overview',
  kind: 'diagram',
  role: 'overview',
  title: '测试总览图',
  alt: '一张解释测试系统边界的总览图。',
  longDescription: '图中从左到右依次展示输入、边界与输出。',
  caption: '观察重点：边界把输入与输出职责分开。',
  assetPath: 'assets/visuals/test/test-overview.svg',
  width: 1200,
  height: 675,
  provenance: 'original-synthesis',
  sourceIds: ['source-test'],
  credit: 'Agent Learner 原创教学图解',
  permission: null,
  verifiedAt: '2026-07-26',
};

const sourcedVisual = {
  ...originalVisual,
  id: 'visual-test-source',
  kind: 'source-figure',
  role: 'mechanism',
  title: '经许可的来源原图',
  provenance: 'licensed-reproduction',
  creator: 'Example Research Group',
  sourceUrl: 'https://example.com/research/original-figure',
  sourceFigure: 'Figure 2: Verified mechanism',
  permission: {
    basis: 'license',
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    allowsRedistribution: true,
    allowsModification: true,
  },
  retrievedAt: '2026-07-26',
  modifications: [],
};

const stepVisual = {
  ...originalVisual,
  id: 'visual-test-step-flow',
  kind: 'step-diagram',
  role: 'process',
  title: '两步交互流程',
  longDescription: '完整序列：第一步读取输入，第二步产生输出。',
  assetPath: 'assets/visuals/test/test-step-flow.svg',
  steps: [
    {
      id: 'first-step',
      title: '第一步',
      description: '先读取输入。',
      alt: '输入进入流程。',
      assetPath: 'assets/visuals/test/test-step-flow-first.svg',
    },
    {
      id: 'second-step',
      title: '第二步',
      description: '再产生输出。',
      alt: '流程产生输出。',
      assetPath: 'assets/visuals/test/test-step-flow-second.svg',
    },
  ],
};

const threeStepVisual = {
  ...stepVisual,
  id: 'visual-test-three-step-flow',
  title: '三步交互流程',
  longDescription: '完整序列：读取输入，安全处理，最后输出结果。',
  assetPath: 'assets/visuals/test/test-three-step-flow.svg',
  steps: [
    {
      id: 'read-input',
      title: '读取输入',
      description: '读取用户提交的内容。',
      alt: '输入进入安全流程。',
      assetPath: 'assets/visuals/test/test-three-step-flow-read.svg',
    },
    {
      id: 'process-input',
      title: '安全处理',
      description: '<em>只作为文本显示，不解析标记。</em>',
      alt: '输入在安全边界内处理。',
      assetPath: 'assets/visuals/test/test-three-step-flow-process.svg',
    },
    {
      id: 'return-output',
      title: '返回结果',
      description: '返回经过处理的结果。',
      alt: '安全流程返回最终结果。',
      assetPath: 'assets/visuals/test/test-three-step-flow-return.svg',
    },
  ],
};

function visualWith(id, title = id) {
  return {
    ...originalVisual,
    id,
    title,
    assetPath: `assets/visuals/test/${id}.svg`,
  };
}

function lessonWithNote(noteOverrides = {}, sectionOverrides = {}) {
  return {
    id: 'lesson-placement',
    knowledgeNote: {
      introduction: '导语',
      sections: [{
        id: 'section-a',
        title: '第一节',
        paragraphs: ['第一段', '第二段'],
        keyPoints: ['关键点'],
        sourceIds: [],
        ...sectionOverrides,
      }],
      misconceptions: [],
      recap: [],
      nextStep: '继续学习。',
      ...noteOverrides,
    },
  };
}

function registryWith(kind, visualId, visual) {
  if (kind === 'map') return new Map([[visualId, visual]]);
  const registry = kind === 'null-prototype'
    ? Object.create(null)
    : {};
  Object.defineProperty(registry, visualId, {
    value: visual,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return registry;
}

function noteForVisual(visualId, visualsById) {
  const lesson = lessonWithNote({}, {
    visuals: [{ visualId, afterParagraph: 0 }],
  });
  const note = renderKnowledgeNote(
    { resources: [] },
    lesson,
    { visualsById },
  );
  return { lesson, note };
}

test('renders an original knowledge figure with accessible local media metadata', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  const figure = renderKnowledgeVisual(originalVisual);

  assert.equal(figure.tagName, 'FIGURE');
  assert.equal(figure.className, 'knowledge-visual');
  assert.equal(figure.dataset.kind, 'diagram');
  assert.equal(figure.dataset.provenance, 'original-synthesis');
  const title = figure.querySelector('.knowledge-visual__title');
  assert.equal(title.tagName, 'P');
  assert.equal(title.textContent, originalVisual.title);
  assert.equal(figure.querySelector('h3'), null);

  const media = figure.querySelector('.knowledge-visual__media');
  const image = media.querySelector('img');
  assert.equal(image.getAttribute('src'), originalVisual.assetPath);
  assert.equal(image.getAttribute('alt'), originalVisual.alt);
  assert.equal(image.getAttribute('loading'), 'lazy');
  assert.equal(image.getAttribute('decoding'), 'async');
  assert.equal(image.getAttribute('width'), String(originalVisual.width));
  assert.equal(image.getAttribute('height'), String(originalVisual.height));

  const caption = figure.querySelector('figcaption');
  assert.ok(caption.textContent.includes(originalVisual.caption));
  assert.ok(caption.textContent.includes(originalVisual.credit));
  assert.ok(!caption.textContent.includes('许可'));

  const originalLink = figure.querySelector('.knowledge-visual__original-link');
  assert.equal(originalLink.textContent, '查看原图（新标签）');
  assert.equal(originalLink.getAttribute('href'), originalVisual.assetPath);
  assert.equal(originalLink.getAttribute('target'), '_blank');
  assert.ok(originalLink.getAttribute('rel').includes('noopener'));

  const details = figure.querySelector('details');
  assert.equal(details.querySelector('summary').textContent, '查看长描述');
  assert.ok(details.textContent.includes(originalVisual.longDescription));
  assert.equal(details.parentNode, caption);
  assert.equal(figure.children.at(-1), caption);
});

test('reveals the status fallback once while preserving all non-image learning paths', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(originalVisual);
  const image = figure.querySelector('img');
  const fallback = figure.querySelector('.knowledge-visual__fallback');

  assert.equal(fallback.hidden, true);
  assert.equal(fallback.getAttribute('role'), 'status');
  assert.equal(image.listeners.get('error').size, 1);

  image.dispatchEvent(new FakeEvent('error'));

  assert.equal(image.hidden, true);
  assert.equal(image.getAttribute('aria-hidden'), 'true');
  assert.equal(fallback.hidden, false);
  assert.equal(fallback.getAttribute('hidden'), null);
  assert.equal(image.listeners.get('error').size, 0);
  assert.ok(figure.textContent.includes(originalVisual.caption));
  assert.ok(figure.textContent.includes(originalVisual.longDescription));
  assert.equal(
    figure.querySelector('.knowledge-visual__original-link').getAttribute('href'),
    originalVisual.assetPath,
  );

  image.dispatchEvent(new FakeEvent('error'));
  assert.equal(image.listeners.get('error').size, 0, 'error 降级只能触发一次');
});

test('renders sourced attribution with exactly two HTTPS links plus one local original link', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));

  const figure = renderKnowledgeVisual(sourcedVisual);
  const links = figure.querySelectorAll('a');
  const httpsLinks = links.filter((link) => link.getAttribute('href')?.startsWith('https://'));
  const localLinks = links.filter((link) => !link.getAttribute('href')?.startsWith('https://'));

  assert.equal(figure.querySelector('.knowledge-visual__label').textContent, '来源原图');
  assert.equal(httpsLinks.length, 2);
  assert.deepEqual(
    httpsLinks.map((link) => link.getAttribute('href')),
    [sourcedVisual.sourceUrl, sourcedVisual.permission.url],
  );
  for (const link of httpsLinks) {
    assert.equal(link.getAttribute('target'), '_blank');
    assert.ok(link.getAttribute('rel').includes('noopener'));
  }
  assert.equal(localLinks.length, 1);
  assert.equal(localLinks[0].getAttribute('href'), sourcedVisual.assetPath);
  assert.ok(figure.textContent.includes(sourcedVisual.creator));
  assert.ok(figure.textContent.includes(sourcedVisual.sourceFigure));
  assert.ok(figure.textContent.includes(sourcedVisual.permission.name));
});

test('treats visual copy as text and never parses HTML', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const visual = {
    ...originalVisual,
    id: 'visual-test-hostile',
    title: '<script>globalThis.compromised = true</script>',
    caption: '<button>伪造按钮</button>',
    credit: '<img src=x onerror=alert(1)>',
  };

  const figure = renderKnowledgeVisual(visual);

  assert.equal(figure.querySelector('script'), null);
  assert.equal(figure.querySelector('button'), null);
  assert.equal(figure.querySelectorAll('img').length, 1);
  assert.ok(figure.textContent.includes(visual.title));
  assert.ok(figure.textContent.includes(visual.caption));
});

test('renders a two-step diagram at step one with accessible controls and a complete static description', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(stepVisual);
  const image = figure.querySelector('img');
  const status = figure.querySelector('.knowledge-visual__step-status');
  const description = figure.querySelector(
    '.knowledge-visual__step-description',
  );
  const previous = findButton(figure, '上一步');
  const next = findButton(figure, '下一步');
  const reset = findButton(figure, '重置');

  assert.equal(figure.dataset.kind, 'step-diagram');
  assert.equal(image.getAttribute('src'), stepVisual.steps[0].assetPath);
  assert.equal(image.getAttribute('alt'), stepVisual.steps[0].alt);
  assert.equal(status.textContent, '1 / 2 · 第一步');
  assert.equal(status.getAttribute('tabindex'), '-1');
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.equal(status.getAttribute('aria-atomic'), 'true');
  assert.equal(description.textContent, stepVisual.steps[0].description);
  assert.equal(previous.getAttribute('aria-label'), '显示上一步');
  assert.equal(next.getAttribute('aria-label'), '显示下一步');
  assert.equal(reset.getAttribute('aria-label'), '重置为第一步');
  assert.equal(previous.disabled, true);
  assert.notEqual(previous.getAttribute('disabled'), null);
  assert.equal(next.disabled, false);
  assert.equal(next.getAttribute('disabled'), null);
  assert.equal(reset.disabled, false);
  assert.equal(reset.getAttribute('disabled'), null);
  assert.ok(figure.querySelector('details').textContent.includes(
    stepVisual.longDescription,
  ));
  assert.equal(
    figure.querySelector('.knowledge-visual__original-link').getAttribute('href'),
    stepVisual.assetPath,
  );
});

test('moves a two-step diagram by one step, clamps both ends, and resets with status focus', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(stepVisual);
  const image = figure.querySelector('img');
  const status = figure.querySelector('.knowledge-visual__step-status');
  const description = figure.querySelector(
    '.knowledge-visual__step-description',
  );
  const previous = findButton(figure, '上一步');
  const next = findButton(figure, '下一步');
  const reset = findButton(figure, '重置');

  next.click();
  assert.equal(image.getAttribute('src'), stepVisual.steps[1].assetPath);
  assert.equal(image.getAttribute('alt'), stepVisual.steps[1].alt);
  assert.equal(status.textContent, '2 / 2 · 第二步');
  assert.equal(description.textContent, stepVisual.steps[1].description);
  assert.equal(previous.disabled, false);
  assert.equal(previous.getAttribute('disabled'), null);
  assert.equal(next.disabled, true);
  assert.notEqual(next.getAttribute('disabled'), null);
  assert.equal(reset.disabled, false);
  assert.equal(reset.getAttribute('disabled'), null);

  next.click();
  assert.equal(status.textContent, '2 / 2 · 第二步');

  previous.click();
  assert.equal(image.getAttribute('src'), stepVisual.steps[0].assetPath);
  assert.equal(status.textContent, '1 / 2 · 第一步');
  previous.click();
  assert.equal(status.textContent, '1 / 2 · 第一步');

  next.click();
  reset.click();
  assert.equal(image.getAttribute('src'), stepVisual.steps[0].assetPath);
  assert.equal(image.getAttribute('alt'), stepVisual.steps[0].alt);
  assert.equal(status.textContent, '1 / 2 · 第一步');
  assert.equal(description.textContent, stepVisual.steps[0].description);
  assert.equal(document.activeElement, status);
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, false);
  assert.equal(reset.disabled, false);

  next.focus();
  reset.click();
  assert.equal(status.textContent, '1 / 2 · 第一步');
  assert.equal(document.activeElement, status);
});

test('advances a three-step diagram one step at a time without parsing descriptions as HTML', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(threeStepVisual);
  const image = figure.querySelector('img');
  const status = figure.querySelector('.knowledge-visual__step-status');
  const description = figure.querySelector(
    '.knowledge-visual__step-description',
  );
  const next = findButton(figure, '下一步');

  next.click();
  assert.equal(status.textContent, '2 / 3 · 安全处理');
  assert.equal(image.getAttribute('src'), threeStepVisual.steps[1].assetPath);
  assert.equal(image.getAttribute('alt'), threeStepVisual.steps[1].alt);
  assert.equal(description.textContent, threeStepVisual.steps[1].description);
  assert.equal(description.querySelector('em'), null);
  assert.equal(next.disabled, false);

  next.click();
  assert.equal(status.textContent, '3 / 3 · 返回结果');
  assert.equal(image.getAttribute('src'), threeStepVisual.steps[2].assetPath);
  assert.equal(next.disabled, true);
  assert.ok(figure.querySelector('details').textContent.includes(
    threeStepVisual.longDescription,
  ));
});

test('re-arms image fallback for a new step while keeping the original link on the main asset', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(stepVisual);
  const image = figure.querySelector('img');
  const fallback = figure.querySelector('.knowledge-visual__fallback');
  const next = findButton(figure, '下一步');
  const originalLink = figure.querySelector(
    '.knowledge-visual__original-link',
  );

  image.dispatchEvent(new FakeEvent('error'));
  assert.equal(image.hidden, true);
  assert.equal(image.getAttribute('aria-hidden'), 'true');
  assert.equal(fallback.hidden, false);
  assert.equal(image.listeners.get('error').size, 0);

  next.click();
  assert.equal(image.getAttribute('src'), stepVisual.steps[1].assetPath);
  assert.equal(image.hidden, false);
  assert.equal(image.getAttribute('aria-hidden'), null);
  assert.equal(fallback.hidden, true);
  assert.notEqual(fallback.getAttribute('hidden'), null);
  assert.equal(image.listeners.get('error').size, 1);
  assert.equal(originalLink.getAttribute('href'), stepVisual.assetPath);

  image.dispatchEvent(new FakeEvent('error'));
  assert.equal(image.hidden, true);
  assert.equal(fallback.hidden, false);
});

test('ignores a stale step-one error after Next without consuming the current step-two handler', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(stepVisual);
  const image = figure.querySelector('img');
  const fallback = figure.querySelector('.knowledge-visual__fallback');
  const next = findButton(figure, '下一步');
  const stepOneError = [...image.listeners.get('error')][0];

  next.click();
  const stepTwoError = [...image.listeners.get('error')][0];
  assert.notEqual(stepTwoError, stepOneError);

  stepOneError(new FakeEvent('error'));
  assert.equal(image.getAttribute('src'), stepVisual.steps[1].assetPath);
  assert.equal(image.hidden, false);
  assert.equal(image.getAttribute('aria-hidden'), null);
  assert.equal(fallback.hidden, true);
  assert.deepEqual([...image.listeners.get('error')], [stepTwoError]);

  image.setAttribute('src', stepVisual.steps[0].assetPath);
  stepTwoError(new FakeEvent('error'));
  assert.equal(image.hidden, false);
  assert.equal(fallback.hidden, true);
  assert.deepEqual([...image.listeners.get('error')], [stepTwoError]);

  image.setAttribute('src', stepVisual.steps[1].assetPath);
  stepTwoError(new FakeEvent('error'));
  assert.equal(image.hidden, true);
  assert.equal(image.getAttribute('aria-hidden'), 'true');
  assert.equal(fallback.hidden, false);
  assert.equal(image.listeners.get('error').size, 0);

  stepTwoError(new FakeEvent('error'));
  assert.equal(image.hidden, true);
  assert.equal(fallback.hidden, false);
  assert.equal(image.listeners.get('error').size, 0);
});

test('invalidates every earlier error generation across Previous and Reset without crossing instances', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const firstFigure = renderKnowledgeVisual(stepVisual);
  const secondFigure = renderKnowledgeVisual(stepVisual);
  const firstImage = firstFigure.querySelector('img');
  const secondImage = secondFigure.querySelector('img');
  const firstFallback = firstFigure.querySelector(
    '.knowledge-visual__fallback',
  );
  const secondFallback = secondFigure.querySelector(
    '.knowledge-visual__fallback',
  );
  const firstNext = findButton(firstFigure, '下一步');
  const firstPrevious = findButton(firstFigure, '上一步');
  const firstReset = findButton(firstFigure, '重置');
  const secondNext = findButton(secondFigure, '下一步');

  const firstGenerationOne = [...firstImage.listeners.get('error')][0];
  firstNext.click();
  const firstGenerationTwo = [...firstImage.listeners.get('error')][0];
  firstPrevious.click();
  const firstGenerationThree = [...firstImage.listeners.get('error')][0];
  firstReset.click();
  const firstGenerationFour = [...firstImage.listeners.get('error')][0];
  assert.equal(new Set([
    firstGenerationOne,
    firstGenerationTwo,
    firstGenerationThree,
    firstGenerationFour,
  ]).size, 4);

  const secondGenerationOne = [...secondImage.listeners.get('error')][0];
  secondNext.click();
  const secondGenerationTwo = [...secondImage.listeners.get('error')][0];

  for (const staleHandler of [
    firstGenerationOne,
    firstGenerationTwo,
    firstGenerationThree,
  ]) {
    staleHandler(new FakeEvent('error'));
  }
  secondGenerationOne(new FakeEvent('error'));

  assert.equal(firstImage.getAttribute('src'), stepVisual.steps[0].assetPath);
  assert.equal(firstImage.hidden, false);
  assert.equal(firstFallback.hidden, true);
  assert.deepEqual(
    [...firstImage.listeners.get('error')],
    [firstGenerationFour],
  );
  assert.equal(secondImage.getAttribute('src'), stepVisual.steps[1].assetPath);
  assert.equal(secondImage.hidden, false);
  assert.equal(secondFallback.hidden, true);
  assert.deepEqual(
    [...secondImage.listeners.get('error')],
    [secondGenerationTwo],
  );

  firstGenerationFour(new FakeEvent('error'));
  assert.equal(firstImage.hidden, true);
  assert.equal(firstFallback.hidden, false);
  assert.equal(secondImage.hidden, false);
  assert.equal(secondFallback.hidden, true);
  assert.deepEqual(
    [...secondImage.listeners.get('error')],
    [secondGenerationTwo],
  );
});

test('keeps step diagram instances independent and adds no controls to static figures', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const firstFigure = renderKnowledgeVisual(stepVisual);
  const secondFigure = renderKnowledgeVisual(threeStepVisual);
  const staticFigure = renderKnowledgeVisual(originalVisual);
  const sourcedFigure = renderKnowledgeVisual(sourcedVisual);

  findButton(firstFigure, '下一步').click();

  assert.equal(
    firstFigure.querySelector('.knowledge-visual__step-status').textContent,
    '2 / 2 · 第二步',
  );
  assert.equal(
    secondFigure.querySelector('.knowledge-visual__step-status').textContent,
    '1 / 3 · 读取输入',
  );
  assert.equal(staticFigure.querySelector('.knowledge-visual__controls'), null);
  assert.equal(staticFigure.querySelector('[aria-live="polite"]'), null);
  assert.equal(sourcedFigure.querySelector('.knowledge-visual__controls'), null);
  assert.equal(sourcedFigure.querySelector('[aria-live="polite"]'), null);
});

test('rejects callbacks and invalid step assets without rendering or executing them', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  let callbackCount = 0;
  const callbackVisual = {
    ...stepVisual,
    callback: () => { callbackCount += 1; },
  };
  const invalidStepVisual = {
    ...stepVisual,
    steps: stepVisual.steps.map((step, index) => ({
      ...step,
      assetPath: index === 0
        ? 'javascript:alert(1)'
        : step.assetPath,
    })),
  };

  const rejected = renderKnowledgeVisual(callbackVisual);
  const invalidStep = renderKnowledgeVisual(invalidStepVisual);

  assert.equal(callbackCount, 0);
  assert.equal(rejected.getAttribute('data-visual-diagnostic'), 'true');
  assert.equal(rejected.querySelector('img'), null);
  assert.equal(invalidStep.getAttribute('data-visual-diagnostic'), 'true');
  assert.equal(invalidStep.querySelector('img'), null);
  assert.equal(invalidStep.querySelector('.knowledge-visual__controls'), null);
});

test('does not mutate or freeze caller-owned visual data', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const visual = structuredClone(originalVisual);
  const before = structuredClone(visual);

  renderKnowledgeVisual(visual);

  assert.deepEqual(visual, before);
  assert.equal(Object.isFrozen(visual), false);
  assert.equal(Object.isFrozen(visual.sourceIds), false);
});

test('places overview after introduction and preserves declaration order at paragraph anchors', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const overview = visualWith('visual-test-course-overview', '课程总览');
  const first = visualWith('visual-test-first', '同锚点第一张');
  const second = visualWith('visual-test-second', '同锚点第二张');
  const lesson = lessonWithNote(
    { overviewVisualId: overview.id },
    {
      visuals: [
        { visualId: first.id, afterParagraph: 0 },
        { visualId: second.id, afterParagraph: 0 },
      ],
    },
  );
  const visualsById = new Map([
    [overview.id, overview],
    [first.id, first],
    [second.id, second],
  ]);

  const note = renderKnowledgeNote({ resources: [] }, lesson, { visualsById });

  assert.equal(note.children[0].className, 'knowledge-note__introduction');
  assert.equal(
    note.children[1].querySelector('.knowledge-visual__title').textContent,
    overview.title,
  );
  assert.equal(note.children[2].className, 'knowledge-note__toc');

  const section = note.querySelector('.knowledge-note__section');
  assert.deepEqual(
    section.children.slice(0, 6).map((node) => (
      node.className === 'knowledge-visual'
        ? `FIGURE:${node.querySelector('.knowledge-visual__title').textContent}`
        : `${node.tagName}:${node.textContent}`
    )),
    [
      'H2:第一节',
      'P:第一段',
      'FIGURE:同锚点第一张',
      'FIGURE:同锚点第二张',
      'P:第二段',
      'UL:关键点',
    ],
  );
});

test('keeps the legacy section child order when no visuals are declared', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lesson = lessonWithNote();

  const note = renderKnowledgeNote({ resources: [] }, lesson, {
    visualsById: new Map(),
  });
  const section = note.querySelector('.knowledge-note__section');

  assert.deepEqual(
    section.children.map((node) => `${node.tagName}:${node.className}`),
    [
      'H2:',
      'P:',
      'P:',
      'UL:key-point-list',
      'DIV:knowledge-note__sources',
    ],
  );
});

test('keeps synchronous source diagnostics out of live regions', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lesson = lessonWithNote({}, {
    sourceIds: ['missing-source'],
  });

  const note = renderKnowledgeNote(
    { resources: [] },
    lesson,
    { visualsById: new Map() },
  );
  const diagnostic = note.querySelector('.data-diagnostic');

  assert.ok(diagnostic);
  assert.equal(diagnostic.getAttribute('role'), null);
  assert.equal(diagnostic.getAttribute('aria-live'), null);
  assert.equal(note.querySelectorAll('[role="status"]').length, 0);
});

test('keeps prose and emits exactly one safe diagnostic for every invalid placement', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const valid = visualWith('visual-test-valid');
  const lesson = lessonWithNote(
    { overviewVisualId: 'visual-missing-overview' },
    {
      visuals: [
        { visualId: 'visual-unknown', afterParagraph: 0 },
        { visualId: valid.id, afterParagraph: -1 },
        { visualId: valid.id, afterParagraph: 0.5 },
        { visualId: valid.id, afterParagraph: 2 },
        { afterParagraph: 0 },
        { visualId: '__proto__', afterParagraph: 0 },
      ],
    },
  );
  const ordinaryObjectRegistry = { [valid.id]: valid };

  const note = renderKnowledgeNote(
    { resources: [] },
    lesson,
    { visualsById: ordinaryObjectRegistry },
  );
  const diagnostics = note.querySelectorAll(
    '[data-visual-diagnostic="true"]',
  );

  assert.ok(note.textContent.includes('第一段'));
  assert.ok(note.textContent.includes('第二段'));
  assert.equal(diagnostics.length, 7);
  for (const diagnostic of diagnostics) {
    assert.equal(diagnostic.getAttribute('role'), null);
    assert.equal(diagnostic.getAttribute('aria-live'), null);
    assert.ok(diagnostic.textContent.includes(lesson.id));
    assert.ok(
      diagnostic.textContent.includes('section-a')
      || diagnostic.textContent.includes('overview'),
    );
    assert.ok(diagnostic.textContent.includes('原因'));
    assert.ok(!diagnostic.textContent.includes('[object Object]'));
  }
  assert.equal(note.querySelectorAll('[role="status"]').length, 0);
  assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
  assert.ok(diagnostics.some((node) => node.textContent.includes('__proto__')));
});

test('rejects malformed own object and Map registry keys before lookup', (t) => {
  const invalidIds = ['__proto__', 'constructor', 'bad-id'];

  for (const registryKind of ['object', 'map']) {
    for (const visualId of invalidIds) {
      const document = new FakeDocument();
      const restore = installFakeDom(document);
      const visual = visualWith('visual-test-registry-entry');
      const visualsById = registryKind === 'map'
        ? new Map([[visualId, visual]])
        : { [visualId]: visual };
      const lesson = lessonWithNote({}, {
        visuals: [{ visualId, afterParagraph: 0 }],
      });

      try {
        const note = renderKnowledgeNote(
          { resources: [] },
          lesson,
          { visualsById },
        );

        assert.equal(
          note.querySelectorAll('.knowledge-visual').length,
          0,
          `${registryKind}/${visualId} 不得渲染`,
        );
        assert.equal(
          note.querySelectorAll('[data-visual-diagnostic="true"]').length,
          1,
          `${registryKind}/${visualId} 必须输出一个诊断`,
        );
      } finally {
        restore();
      }
    }
  }
});

test('rejects registry key and validated visual ID mismatches in every registry shape', (t) => {
  const requestedId = 'visual-test-requested-key';
  const visual = {
    ...originalVisual,
    id: 'visual-test-different-record-id',
  };

  for (const registryKind of ['map', 'object', 'null-prototype']) {
    const document = new FakeDocument();
    const restore = installFakeDom(document);
    try {
      const { note } = noteForVisual(
        requestedId,
        registryWith(registryKind, requestedId, visual),
      );

      assert.ok(note.textContent.includes('第一段'));
      assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
      assert.equal(
        note.querySelectorAll('[data-visual-diagnostic="true"]').length,
        1,
      );
      assert.equal(note.querySelectorAll('[role="status"]').length, 0);
    } finally {
      restore();
    }
  }
});

test('rejects incomplete, invalid-provenance and remote visual records in every registry shape', (t) => {
  const invalidRecords = [
    ['visual-test-empty', {}],
    ['visual-test-missing-field', {
      ...originalVisual,
      id: 'visual-test-missing-field',
      alt: '',
    }],
    ['visual-test-invalid-provenance', {
      ...originalVisual,
      id: 'visual-test-invalid-provenance',
      provenance: 'unverified-copy',
    }],
    ['visual-test-remote-asset', {
      ...originalVisual,
      id: 'visual-test-remote-asset',
      assetPath: 'https://evil.example/remote.svg',
    }],
  ];

  for (const registryKind of ['map', 'object', 'null-prototype']) {
    for (const [visualId, visual] of invalidRecords) {
      const document = new FakeDocument();
      const restore = installFakeDom(document);
      try {
        const { note } = noteForVisual(
          visualId,
          registryWith(registryKind, visualId, visual),
        );

        assert.ok(note.textContent.includes('第一段'));
        assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
        assert.equal(
          note.querySelectorAll('[data-visual-diagnostic="true"]').length,
          1,
          `${registryKind}/${visualId}`,
        );
        assert.equal(note.querySelector('img'), null);
        assert.equal(
          note.textContent.includes('https://evil.example/remote.svg'),
          false,
        );
      } finally {
        restore();
      }
    }
  }
});

test('does not invoke top-level or nested visual accessors for any registry shape', (t) => {
  let getterCount = 0;
  const topLevelGetter = {
    ...originalVisual,
    id: 'visual-test-top-level-getter',
  };
  Object.defineProperty(topLevelGetter, 'title', {
    enumerable: true,
    get() {
      getterCount += 1;
      throw new Error('top-level getter must not execute');
    },
  });

  const nestedPermissionGetter = {
    ...sourcedVisual,
    id: 'visual-test-permission-getter',
    permission: { ...sourcedVisual.permission },
  };
  Object.defineProperty(nestedPermissionGetter.permission, 'name', {
    enumerable: true,
    get() {
      getterCount += 1;
      throw new Error('permission getter must not execute');
    },
  });

  const nestedStepGetter = {
    ...stepVisual,
    id: 'visual-test-step-getter',
    steps: stepVisual.steps.map((step) => ({ ...step })),
  };
  Object.defineProperty(nestedStepGetter.steps[0], 'description', {
    enumerable: true,
    get() {
      getterCount += 1;
      throw new Error('step getter must not execute');
    },
  });

  const accessorRecords = [
    [topLevelGetter.id, topLevelGetter],
    [nestedPermissionGetter.id, nestedPermissionGetter],
    [nestedStepGetter.id, nestedStepGetter],
  ];

  for (const registryKind of ['map', 'object', 'null-prototype']) {
    for (const [visualId, visual] of accessorRecords) {
      const document = new FakeDocument();
      const restore = installFakeDom(document);
      try {
        assert.doesNotThrow(() => {
          const { note } = noteForVisual(
            visualId,
            registryWith(registryKind, visualId, visual),
          );
          assert.ok(note.textContent.includes('第一段'));
          assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
          assert.equal(
            note.querySelectorAll('[data-visual-diagnostic="true"]').length,
            1,
          );
        });
      } finally {
        restore();
      }
    }
  }

  const registryAccessorId = 'visual-test-registry-accessor';
  const registry = {};
  Object.defineProperty(registry, registryAccessorId, {
    enumerable: true,
    get() {
      getterCount += 1;
      throw new Error('registry getter must not execute');
    },
  });
  const document = new FakeDocument();
  const restore = installFakeDom(document);
  try {
    const { note } = noteForVisual(registryAccessorId, registry);
    assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
    assert.equal(
      note.querySelectorAll('[data-visual-diagnostic="true"]').length,
      1,
    );
  } finally {
    restore();
  }

  assert.equal(getterCount, 0);
});

test('direct renderer safely diagnoses malformed, remote, cyclic and reflection-throwing records', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  let getterCount = 0;
  const getterVisual = {
    ...originalVisual,
    id: 'visual-test-direct-getter',
  };
  Object.defineProperty(getterVisual, 'assetPath', {
    enumerable: true,
    get() {
      getterCount += 1;
      throw new Error('asset getter must not execute');
    },
  });
  const remoteVisual = {
    ...originalVisual,
    id: 'visual-test-direct-remote',
    assetPath: 'javascript:alert(1)',
  };
  const cyclicVisual = {
    ...originalVisual,
    id: 'visual-test-direct-cycle',
  };
  cyclicVisual.extra = cyclicVisual;
  const reflectionThrowingVisual = new Proxy(
    { ...originalVisual, id: 'visual-test-direct-proxy' },
    {
      ownKeys() {
        throw new Error('proxy reflection failed');
      },
    },
  );

  for (const visual of [
    {},
    getterVisual,
    remoteVisual,
    cyclicVisual,
    reflectionThrowingVisual,
  ]) {
    let diagnostic;
    assert.doesNotThrow(() => {
      diagnostic = renderKnowledgeVisual(visual);
    });
    assert.equal(diagnostic.getAttribute('role'), null);
    assert.equal(diagnostic.getAttribute('aria-live'), null);
    assert.equal(
      diagnostic.getAttribute('data-visual-diagnostic'),
      'true',
    );
    assert.equal(diagnostic.querySelector('img'), null);
    assert.equal(diagnostic.querySelector('a'), null);
    assert.equal(
      diagnostic.textContent.includes('javascript:alert(1)'),
      false,
    );
    assert.equal(diagnostic.textContent.includes('proxy reflection failed'), false);
  }
  assert.equal(getterCount, 0);
});

test('preserves trailing sparse array slots for complete contract validation', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const sparseVisual = {
    ...originalVisual,
    id: 'visual-test-sparse-source-ids',
    sourceIds: [...originalVisual.sourceIds],
  };
  sparseVisual.sourceIds.length = 2;

  const { note } = noteForVisual(
    sparseVisual.id,
    new Map([[sparseVisual.id, sparseVisual]]),
  );

  assert.equal(note.querySelectorAll('.knowledge-visual').length, 0);
  assert.equal(
    note.querySelectorAll('[data-visual-diagnostic="true"]').length,
    1,
  );
});

test('validates null-prototype snapshots without consulting inherited accessors', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const inheritedDescriptor = Object.getOwnPropertyDescriptor(
    Object.prototype,
    'credit',
  );
  let getterCount = 0;
  const visual = {
    ...originalVisual,
    id: 'visual-test-inherited-accessor',
  };
  delete visual.credit;
  Object.defineProperty(Object.prototype, 'credit', {
    configurable: true,
    get() {
      getterCount += 1;
      throw new Error('inherited getter must not execute');
    },
  });

  try {
    const diagnostic = renderKnowledgeVisual(visual);
    assert.equal(
      diagnostic.getAttribute('data-visual-diagnostic'),
      'true',
    );
    assert.equal(diagnostic.querySelector('img'), null);
    assert.equal(getterCount, 0);
  } finally {
    if (inheritedDescriptor) {
      Object.defineProperty(Object.prototype, 'credit', inheritedDescriptor);
    } else {
      delete Object.prototype.credit;
    }
  }
});

test('uses the default prototype-safe registry for the real llm-01 overview', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');

  const note = renderKnowledgeNote(llmFoundation, lesson);
  const overview = note.children[1];

  assert.equal(overview.className, 'knowledge-visual');
  assert.equal(overview.querySelector('h3'), null);
  assert.equal(
    overview.querySelector('.knowledge-visual__title').textContent,
    'AI、机器学习、深度学习、生成式 AI 与 LLM 的双轴关系',
  );
  assert.equal(
    overview.querySelector('img').getAttribute('src'),
    'assets/visuals/llm-foundation/llm-01-field-map.svg',
  );
  assert.equal(note.children[2].className, 'knowledge-note__toc');
});
