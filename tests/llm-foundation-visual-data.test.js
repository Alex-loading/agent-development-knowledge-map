import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';

const FIELD_MAP_ID = 'visual-llm-01-field-map';
const FIELD_MAP_PATH = 'assets/visuals/llm-foundation/llm-01-field-map.svg';
const OVERVIEW_SECTION_IDS = new Map([
  [FIELD_MAP_ID, 'map-the-field'],
]);
const SAFE_SVG_ELEMENTS = new Set([
  'svg',
  'title',
  'desc',
  'defs',
  'g',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'path',
  'text',
  'tspan',
  'pattern',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
  'marker',
  'use',
  'textPath',
]);
const SAFE_SVG_ATTRIBUTES = new Set([
  'id',
  'xmlns',
  'xmlns:xlink',
  'width',
  'height',
  'viewBox',
  'role',
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
  'data-region',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'transform',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'patternUnits',
  'patternTransform',
  'markerWidth',
  'markerHeight',
  'markerUnits',
  'refX',
  'refY',
  'orient',
  'offset',
  'stop-color',
  'stop-opacity',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'preserveAspectRatio',
  'clip-path',
  'mask',
  'marker-start',
  'marker-mid',
  'marker-end',
  'href',
  'xlink:href',
  'xml:space',
]);

async function loadRegistry() {
  return import('../src/data/visuals/index.js');
}

async function loadLlmRegistry() {
  return import('../src/data/visuals/llm-foundation-visuals.js');
}

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label} 必须深冻结`);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

function assetPathsFor(visual) {
  return [
    visual.assetPath,
    ...(visual.steps?.map((step) => step.assetPath) ?? []),
  ];
}

function assertUniqueAssetPaths(visuals) {
  const paths = visuals.flatMap(assetPathsFor);
  assert.equal(
    new Set(paths).size,
    paths.length,
    '不同 visual 或 step 不得复用同一资产路径',
  );
}

function attributeValue(tag, attribute) {
  const match = new RegExp(
    `\\b${attribute}\\s*=\\s*(["'])([\\s\\S]*?)\\1`,
    'i',
  ).exec(tag);
  return match?.[2];
}

function assertAllowedSvgMarkup(svg, label) {
  assert.doesNotMatch(svg, /<!--|<!\[CDATA\[|<\?(?!xml\b)/i, `${label}: 禁止注释、CDATA 与处理指令`);
  const tagPattern = /<\s*(\/?)\s*([A-Za-z_][\w:.-]*)([\s\S]*?)>/g;

  for (const match of svg.matchAll(tagPattern)) {
    const [, closing, elementName, rawAttributes] = match;
    assert.ok(SAFE_SVG_ELEMENTS.has(elementName), `${label}: 禁止 SVG 元素 ${elementName}`);
    if (closing) {
      assert.equal(rawAttributes.trim(), '', `${label}: 闭合标签不得携带内容`);
      continue;
    }

    let attributes = rawAttributes.trim();
    if (attributes.endsWith('/')) attributes = attributes.slice(0, -1).trim();
    const seenAttributes = new Set();
    while (attributes.length > 0) {
      const nameMatch = /^([A-Za-z_][\w:.-]*)/.exec(attributes);
      assert.ok(nameMatch, `${label}:${elementName}: 属性语法无效`);
      const attributeName = nameMatch[1];
      attributes = attributes.slice(nameMatch[0].length).trimStart();
      assert.equal(attributes[0], '=', `${label}:${elementName}.${attributeName}: 属性必须赋值`);
      attributes = attributes.slice(1).trimStart();
      assert.ok(['"', "'"].includes(attributes[0]), `${label}:${elementName}.${attributeName}: 属性值必须加引号`);
      const quote = attributes[0];
      const closingQuote = attributes.indexOf(quote, 1);
      assert.ok(closingQuote > 0, `${label}:${elementName}.${attributeName}: 属性值必须闭合`);
      const value = attributes.slice(1, closingQuote);
      attributes = attributes.slice(closingQuote + 1).trimStart();

      assert.ok(
        SAFE_SVG_ATTRIBUTES.has(attributeName),
        `${label}:${elementName}: 禁止 SVG 属性 ${attributeName}`,
      );
      assert.ok(!seenAttributes.has(attributeName), `${label}:${elementName}.${attributeName}: 属性不得重复`);
      seenAttributes.add(attributeName);

      if (!attributeName.startsWith('xmlns')) {
        assert.doesNotMatch(
          value,
          /(?:https?|ftp|file)\s*:|\/\/|(?:data|javascript)\s*:/i,
          `${label}:${elementName}.${attributeName}: 禁止外部或嵌入引用`,
        );
      }
    }
  }
}

function assertSafeSvg(svg, visual, assetPath) {
  const label = `${visual.id}:${assetPath}`;
  assert.doesNotMatch(svg, /\uFFFD/, `${label}: 必须是有效 UTF-8`);
  assert.doesNotMatch(
    svg,
    /<\s*(?:script|foreignObject)\b/i,
    `${label}: 禁止主动内容容器`,
  );
  assert.doesNotMatch(
    svg,
    /\s+on[a-z][\w:.-]*\s*=/i,
    `${label}: 禁止任何 on* 事件属性`,
  );
  assert.doesNotMatch(
    svg,
    /<!\s*(?:DOCTYPE|ENTITY)\b/i,
    `${label}: 禁止 DOCTYPE 与 XML entity 声明`,
  );
  assert.doesNotMatch(svg, /(?:data|javascript)\s*:/i, `${label}: 禁止嵌入或脚本 URL`);
  assert.doesNotMatch(svg, /@import\b/i, `${label}: 禁止 CSS @import`);
  assertAllowedSvgMarkup(svg, label);

  const externalStyleReference = /(?:https?|ftp|file)\s*:|\/\/|(?:data|javascript)\s*:/i;
  for (const styleElement of svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) {
    assert.doesNotMatch(
      styleElement[1],
      externalStyleReference,
      `${label}: style 元素禁止外部引用`,
    );
  }
  for (const styleAttribute of svg.matchAll(
    /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
  )) {
    assert.doesNotMatch(
      styleAttribute[1] ?? styleAttribute[2],
      externalStyleReference,
      `${label}: style 属性禁止外部引用`,
    );
  }

  for (const match of svg.matchAll(
    /\b(?:href|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
  )) {
    const target = match[1] ?? match[2] ?? match[3];
    assert.match(target, /^#[A-Za-z_][\w:.-]*$/, `${label}: href 只能引用本地片段`);
  }
  for (const match of svg.matchAll(
    /\burl\s*\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi,
  )) {
    const target = match[1] ?? match[2] ?? match[3];
    assert.match(target, /^#[A-Za-z_][\w:.-]*$/, `${label}: url() 只能引用本地片段`);
  }
  assert.doesNotMatch(
    svg,
    /\burl\s*\([^)]*(?:https?:|\/\/|data\s*:|javascript\s*:)/i,
    `${label}: 禁止远程或嵌入 url()`,
  );

  const normalized = svg.replace(/^\uFEFF?\s*<\?xml[^?]*\?>\s*/i, '').trim();
  assert.match(normalized, /^<svg\b[\s\S]*<\/svg>$/i, `${label}: 根节点必须是 svg`);
  assert.equal((normalized.match(/<svg\b/gi) ?? []).length, 1, `${label}: 只能有一个根 svg`);
  assert.equal((normalized.match(/<\/svg\s*>/gi) ?? []).length, 1, `${label}: svg 必须完整闭合`);

  const rootTag = /^<svg\b[^>]*>/i.exec(normalized)?.[0] ?? '';
  const titleMatches = [...svg.matchAll(/<title\b([^>]*)>/gi)];
  const descMatches = [...svg.matchAll(/<desc\b([^>]*)>/gi)];
  assert.equal(titleMatches.length, 1, `${label}: 必须有一个 title`);
  assert.equal(descMatches.length, 1, `${label}: 必须有一个 desc`);
  assert.equal(attributeValue(rootTag, 'role'), 'img', `${label}: role 必须为 img`);

  const titleId = attributeValue(titleMatches[0]?.[0] ?? '', 'id');
  const descId = attributeValue(descMatches[0]?.[0] ?? '', 'id');
  assert.ok(titleId, `${label}: title 必须有 id`);
  assert.ok(descId, `${label}: desc 必须有 id`);
  assert.notEqual(titleId, descId, `${label}: title 与 desc id 必须不同`);
  assert.deepEqual(
    attributeValue(rootTag, 'aria-labelledby')?.trim().split(/\s+/),
    [titleId, descId],
    `${label}: aria-labelledby 必须依次引用真实 title 与 desc`,
  );

  const viewBox = attributeValue(rootTag, 'viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  assert.deepEqual(
    viewBox,
    [0, 0, visual.width, visual.height],
    `${label}: viewBox 必须与 registry 尺寸一致`,
  );
  assert.equal(Number(attributeValue(rootTag, 'width')), visual.width, `${label}: width 必须固定`);
  assert.equal(Number(attributeValue(rootTag, 'height')), visual.height, `${label}: height 必须固定`);

  for (const element of svg.matchAll(/<(?:use|textPath)\b[^>]*>/gi)) {
    const href = attributeValue(element[0], '(?:href|xlink:href)');
    if (href !== undefined) {
      assert.match(href, /^#[A-Za-z_][\w:.-]*$/, `${label}: use/textPath 禁止外链`);
    }
  }
}

test('publishes the frozen llm-01 overview visual reference', () => {
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');
  assert.equal(lesson.knowledgeNote.overviewVisualId, FIELD_MAP_ID);
});

test('publishes the first frozen local SVG asset', async () => {
  await access(FIELD_MAP_PATH);
  const svg = await readFile(FIELD_MAP_PATH, 'utf8');
  assert.ok(svg.length > 0, FIELD_MAP_PATH);
});

test('publishes a unique, prototype-safe and deeply frozen visual registry', async () => {
  const { knowledgeVisuals, knowledgeVisualsById } = await loadRegistry();
  const ids = knowledgeVisuals.map(({ id }) => id);

  assert.equal(new Set(ids).size, ids.length, 'visual ID 必须唯一');
  assert.equal(Object.keys(knowledgeVisualsById).length, knowledgeVisuals.length);
  assert.equal(Object.getPrototypeOf(knowledgeVisualsById), null);
  assert.equal(knowledgeVisualsById.__proto__, undefined);
  assertDeepFrozen(knowledgeVisuals, 'knowledgeVisuals');
  assertDeepFrozen(knowledgeVisualsById, 'knowledgeVisualsById');

  for (const visual of knowledgeVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.ok(Object.hasOwn(knowledgeVisualsById, visual.id), visual.id);
    assert.equal(knowledgeVisualsById[visual.id], visual, visual.id);
  }
});

test('registers the frozen field-map metadata and qualitative boundary exactly once', async () => {
  const { knowledgeVisuals, knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById[FIELD_MAP_ID];

  assert.equal(
    knowledgeVisuals.filter(({ id }) => id === FIELD_MAP_ID).length,
    1,
    `${FIELD_MAP_ID} 必须且只能注册一次`,
  );
  assert.deepEqual(visual, {
    id: FIELD_MAP_ID,
    kind: 'diagram',
    role: 'overview',
    tags: ['relationship', 'boundary'],
    title: 'AI、机器学习、深度学习、生成式 AI 与 LLM 的双轴关系',
    alt: '双轴图显示方法包含关系与生成能力分类在 LLM 处交叉，并列出非学习 AI 和非语言深度学习反例。',
    longDescription: '图先定义两条轴：方法轴用嵌套框表示 AI 包含机器学习、机器学习包含深度学习；生成能力轴横向穿过这些方法类别。LLM 位于深度学习与语言生成的交叉处。图末用搜索、规划说明 AI 包含非学习方法，并用视觉、语音说明深度学习或生成模型不只处理语言，因此 AI、深度学习、生成式 AI 与 LLM 不能压成一条同义嵌套链。',
    caption: 'LLM 通常是深度学习实现的语言生成模型，但 AI、深度学习和生成式 AI 不能压成一条同义链。',
    assetPath: FIELD_MAP_PATH,
    width: 1200,
    height: 675,
    provenance: 'original-synthesis',
    sourceIds: ['res-ms-ai', 'res-ms-genai', 'res-hf-llm'],
    credit: 'Agent Learner 原创教学图解',
    permission: null,
    verifiedAt: '2026-07-26',
  });
});

test('resolves every current note reference to its lesson, evidence and local assets', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const resourcesById = new Map(
    llmFoundation.resources.map((resource) => [resource.id, resource]),
  );

  for (const lesson of llmFoundation.lessons) {
    const references = [];
    if (lesson.knowledgeNote.overviewVisualId) {
      references.push({
        visualId: lesson.knowledgeNote.overviewVisualId,
        sectionId: OVERVIEW_SECTION_IDS.get(lesson.knowledgeNote.overviewVisualId),
      });
    }
    for (const section of lesson.knowledgeNote.sections) {
      for (const { visualId } of section.visuals ?? []) {
        references.push({ visualId, sectionId: section.id });
      }
    }

    for (const { visualId, sectionId } of references) {
      assert.match(visualId, new RegExp(`^visual-${lesson.id}-`), `${lesson.id}:${visualId}`);
      const visual = knowledgeVisualsById[visualId];
      assert.ok(visual, `${lesson.id}:${visualId} 必须可解析`);
      const ownerSection = lesson.knowledgeNote.sections.find(({ id }) => id === sectionId);
      assert.ok(ownerSection, `${lesson.id}:${visualId}: 必须绑定真实 note section`);
      for (const assetPath of assetPathsFor(visual)) await access(assetPath);
      for (const sourceId of visual.sourceIds) {
        assert.ok(lesson.resourceIds.includes(sourceId), `${lesson.id}:${visualId}:${sourceId}`);
        assert.ok(resourcesById.get(sourceId)?.evidence, `${lesson.id}:${visualId}:${sourceId}: evidence`);
        assert.ok(
          ownerSection.sourceIds.includes(sourceId),
          `${lesson.id}:${visualId}:${sourceId}: section evidence scope`,
        );
      }
    }
  }
});

test('keeps every LLM registry record aligned with its lesson even before note insertion', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  const resourcesById = new Map(
    llmFoundation.resources.map((resource) => [resource.id, resource]),
  );

  for (const visual of llmFoundationVisuals) {
    const lessonId = /^visual-(llm-\d{2})-/.exec(visual.id)?.[1];
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    assert.ok(lesson, `${visual.id}: visual ID 必须带真实 lesson 前缀`);
    assert.match(
      visual.assetPath,
      new RegExp(`^assets/visuals/llm-foundation/${lesson.id}-`),
      `${visual.id}: assetPath 必须与 lesson 对齐`,
    );
    for (const sourceId of visual.sourceIds) {
      assert.ok(lesson.resourceIds.includes(sourceId), `${visual.id}:${sourceId}: lesson scope`);
      assert.ok(resourcesById.get(sourceId)?.evidence, `${visual.id}:${sourceId}: evidence`);
    }
    for (const assetPath of assetPathsFor(visual)) await access(assetPath);
  }
});

test('requires globally unique main and step asset paths', async () => {
  const { knowledgeVisuals } = await loadRegistry();
  assertUniqueAssetPaths(knowledgeVisuals);

  assert.throws(
    () => assertUniqueAssetPaths([
      knowledgeVisuals[0],
      { ...knowledgeVisuals[0], id: 'visual-llm-02-duplicate-path' },
    ]),
    /不得复用同一资产路径/,
  );
});

test('keeps every SVG structurally accessible and free from active or remote content', async () => {
  const { knowledgeVisuals } = await loadRegistry();
  for (const visual of knowledgeVisuals) {
    for (const assetPath of assetPathsFor(visual).filter((path) => path.endsWith('.svg'))) {
      const svg = await readFile(assetPath, 'utf8');
      assertSafeSvg(svg, visual, assetPath);
    }
  }
});

test('SVG safety checks reject whitespace-obscured active content and external references', () => {
  const visual = { id: 'visual-test', width: 1200, height: 675 };
  const safeShell = (content, rootAttributes = '') => (
    `<svg width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="t d" ${rootAttributes}>`
    + `<title id="t">标题</title><desc id="d">描述</desc>${content}</svg>`
  );
  const unsafeCases = [
    safeShell('<script>alert(1)</script>'),
    safeShell('<foreignObject><div>HTML</div></foreignObject>'),
    safeShell('<rect\n onload = "alert(1)"/>'),
    safeShell('<image href="https://example.com/a.svg"/>'),
    safeShell('<image href="//example.com/a.svg"/>'),
    safeShell('<image href="data:image/svg+xml,x"/>'),
    safeShell('<a href="javascript:alert(1)"/>'),
    safeShell('<style>@import "https://example.com/a.css";</style>'),
    safeShell('<style>.label { src: "https://example.com/font.woff2"; }</style>'),
    safeShell('<rect style="fill: url(https://example.com/a.svg)"/>'),
    safeShell('<rect style="background-image: \'//example.com/a.svg\'"/>'),
    safeShell('<use href="https://example.com/a.svg#shape"/>'),
    safeShell('<textPath href="//example.com/a.svg#path">文字</textPath>'),
    safeShell('<use href="#shape"/>', 'xml:base="https://example.com/a.svg"'),
    safeShell('<set href="#shape" attributeName="href" to="https://example.com/a.svg"/>'),
    safeShell('<x:script xmlns:x="http://www.w3.org/2000/svg">alert(1)</x:script>'),
    safeShell('<rect style="fill:u\\72l(h\\74tps://example.com/a.svg)"/>'),
    `<?xml-stylesheet href="https://example.com/a.css"?>${safeShell('')}`,
    `<!DOCTYPE svg [<!ENTITY payload SYSTEM "https://example.com/a">]>${safeShell('')}`,
    `${safeShell('')}${safeShell('')}`,
  ];

  for (const svg of unsafeCases) {
    assert.throws(() => assertSafeSvg(svg, visual, 'unsafe.svg'), assert.AssertionError);
  }
});

test('field map preserves the frozen two-axis reading order, encodings and counterexamples', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById[FIELD_MAP_ID];
  const svg = await readFile(FIELD_MAP_PATH, 'utf8');
  const readingOrder = [
    '① 总目标：人工智能 AI',
    '② 方法包含链',
    '③ 生成能力轴',
    '④ 交叉处：LLM',
    '⑤ 两个反例',
  ];

  assert.equal(visual.width, 1200);
  assert.equal(visual.height, 675);
  for (const label of readingOrder) assert.match(svg, new RegExp(label));
  for (let index = 1; index < readingOrder.length; index += 1) {
    assert.ok(
      svg.indexOf(readingOrder[index - 1]) < svg.indexOf(readingOrder[index]),
      `${readingOrder[index - 1]} 必须先于 ${readingOrder[index]}`,
    );
  }
  for (const term of [
    '机器学习 ML',
    '深度学习 DL',
    '生成式 AI',
    '语言生成',
    '搜索 / 规划',
    '视觉 / 语音',
    '非学习 AI',
    '非语言深度学习或生成模型',
  ]) {
    assert.match(svg, new RegExp(term), term);
  }
  assert.match(svg, /data-region="method-axis"/);
  assert.match(svg, /data-region="capability-axis"/);
  assert.match(svg, /fill="url\(#cross-hatch\)"/);
  assert.match(svg, /stroke-dasharray=/);
  assert.match(svg, /实线嵌套：方法包含/);
  assert.match(svg, /虚线边界：生成能力/);
  assert.match(svg, /斜线阴影：两轴交叉/);
});
