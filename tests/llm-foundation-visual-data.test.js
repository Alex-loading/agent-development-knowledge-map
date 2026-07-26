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
]);
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const LOCAL_FRAGMENT_ATTRIBUTES = new Set([
  'fill',
  'stroke',
  'clip-path',
  'mask',
  'marker-start',
  'marker-mid',
  'marker-end',
]);
const LOCAL_HREF_ELEMENTS = new Set(['use', 'textPath']);

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

function findTagEnd(svg, start, label) {
  let quote = null;
  for (let index = start + 1; index < svg.length; index += 1) {
    const character = svg[index];
    if (quote !== null) {
      assert.notEqual(character, '<', `${label}: 属性值不得包含标签起始符`);
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index;
    } else {
      assert.notEqual(character, '<', `${label}: 标签不得嵌套`);
    }
  }
  assert.fail(`${label}: 标签或属性值必须闭合`);
}

function parseSvgAttributes(rawAttributes, elementName, isRoot, label) {
  const attributes = new Map();
  let cursor = 0;

  while (cursor < rawAttributes.length) {
    const whitespace = /^[\t\n\r ]+/.exec(rawAttributes.slice(cursor));
    assert.ok(whitespace, `${label}:${elementName}: 属性之间必须用 XML 空白分隔`);
    cursor += whitespace[0].length;
    if (cursor === rawAttributes.length) break;

    const nameMatch = /^[A-Za-z_][A-Za-z0-9_.-]*/.exec(rawAttributes.slice(cursor));
    assert.ok(nameMatch, `${label}:${elementName}: 属性语法无效或包含命名空间前缀`);
    const attributeName = nameMatch[0];
    cursor += attributeName.length;
    const beforeEquals = /^[\t\n\r ]*/.exec(rawAttributes.slice(cursor))[0];
    cursor += beforeEquals.length;
    assert.equal(
      rawAttributes[cursor],
      '=',
      `${label}:${elementName}.${attributeName}: 属性必须赋值且不得带命名空间前缀`,
    );
    cursor += 1;
    const afterEquals = /^[\t\n\r ]*/.exec(rawAttributes.slice(cursor))[0];
    cursor += afterEquals.length;
    const quote = rawAttributes[cursor];
    assert.ok(
      quote === '"' || quote === "'",
      `${label}:${elementName}.${attributeName}: 属性值必须加引号`,
    );
    const closingQuote = rawAttributes.indexOf(quote, cursor + 1);
    assert.ok(closingQuote > cursor, `${label}:${elementName}.${attributeName}: 属性值必须闭合`);
    const value = rawAttributes.slice(cursor + 1, closingQuote);
    cursor = closingQuote + 1;

    assert.doesNotMatch(value, /[<>]/, `${label}:${elementName}.${attributeName}: 属性值含非法标记`);
    assert.ok(
      SAFE_SVG_ATTRIBUTES.has(attributeName),
      `${label}:${elementName}: 禁止 SVG 属性 ${attributeName}`,
    );
    assert.ok(!attributes.has(attributeName), `${label}:${elementName}.${attributeName}: 属性不得重复`);

    if (attributeName === 'xmlns') {
      assert.ok(isRoot, `${label}: xmlns 只允许出现在根 svg`);
      assert.equal(value, SVG_NAMESPACE, `${label}: 根 svg 必须使用固定 SVG namespace`);
    } else {
      if (attributeName === 'href' || LOCAL_FRAGMENT_ATTRIBUTES.has(attributeName)) {
        assert.match(
          value,
          /^[\x20-\x7e]*$/,
          `${label}:${elementName}.${attributeName}: 引用属性只允许可见 ASCII，禁止 Unicode 编码混淆`,
        );
      }
      assert.doesNotMatch(value, /@import\b/i, `${label}:${elementName}.${attributeName}: 禁止 CSS @import`);
      assert.doesNotMatch(
        value,
        /(?:https?|ftp|file)\s*:|\/\/|(?:data|javascript)\s*:/i,
        `${label}:${elementName}.${attributeName}: 禁止外部或嵌入引用`,
      );
      if (attributeName === 'href') {
        assert.ok(
          LOCAL_HREF_ELEMENTS.has(elementName),
          `${label}:${elementName}.href: 仅 use/textPath 可引用本地片段`,
        );
        assert.match(value, /^#[A-Za-z_][\w.-]*$/, `${label}:${elementName}.href: 只能引用本地片段`);
      }
      if (/url\s*\(/i.test(value)) {
        assert.ok(
          LOCAL_FRAGMENT_ATTRIBUTES.has(attributeName),
          `${label}:${elementName}.${attributeName}: 此属性禁止 url()`,
        );
        assert.match(
          value,
          /^url\(#[A-Za-z_][\w.-]*\)$/,
          `${label}:${elementName}.${attributeName}: url() 只能精确引用本地片段`,
        );
      }
    }

    attributes.set(attributeName, value);
  }

  return attributes;
}

function parseStrictSvg(svg, label) {
  assert.equal(svg, svg.normalize('NFC'), `${label}: 必须使用 NFC Unicode`);
  assert.doesNotMatch(svg, /\uFFFD/, `${label}: 必须是有效 UTF-8`);
  assert.doesNotMatch(svg, /\\/, `${label}: 禁止 CSS 转义与反斜线`);
  assert.doesNotMatch(svg, /&/, `${label}: 禁止 XML/HTML entity 与字符引用`);
  assert.doesNotMatch(svg, /%/, `${label}: 禁止百分号编码混淆`);
  assert.doesNotMatch(svg, /<\?/, `${label}: 禁止所有 XML 处理指令`);
  assert.doesNotMatch(svg, /<!/, `${label}: 禁止注释、CDATA、DOCTYPE 与 ENTITY`);
  assert.doesNotMatch(
    svg,
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/,
    `${label}: 禁止控制符与不可见方向符编码混淆`,
  );

  const stack = [];
  const ids = new Set();
  const localReferences = [];
  let cursor = 0;
  let rootSeen = false;
  let rootClosed = false;
  let rootTag = '';

  while (cursor < svg.length) {
    if (svg[cursor] !== '<') {
      const nextTag = svg.indexOf('<', cursor);
      const end = nextTag === -1 ? svg.length : nextTag;
      if (stack.length === 0) {
        assert.match(svg.slice(cursor, end), /^[\t\n\r ]*$/, `${label}: 根节点外禁止文本`);
      }
      cursor = end;
      continue;
    }

    const tagEnd = findTagEnd(svg, cursor, label);
    const tag = svg.slice(cursor, tagEnd + 1);
    if (tag.startsWith('</')) {
      const closing = /^<\/([A-Za-z_][A-Za-z0-9_.-]*)[\t\n\r ]*>$/.exec(tag);
      assert.ok(closing, `${label}: 闭合标签语法无效或包含命名空间前缀`);
      assert.ok(stack.length > 0, `${label}: 出现无对应开始标签的 ${closing[1]}`);
      assert.equal(stack.at(-1), closing[1], `${label}: ${closing[1]} 闭合顺序错误`);
      stack.pop();
      if (stack.length === 0) rootClosed = true;
    } else {
      const content = tag.slice(1, -1);
      const selfClosing = content.endsWith('/');
      const opening = (selfClosing ? content.slice(0, -1) : content).trimEnd();
      const nameMatch = /^[A-Za-z_][A-Za-z0-9_.-]*/.exec(opening);
      assert.ok(nameMatch, `${label}: 开始标签语法无效或包含命名空间前缀`);
      const elementName = nameMatch[0];
      assert.ok(SAFE_SVG_ELEMENTS.has(elementName), `${label}: 禁止 SVG 元素 ${elementName}`);
      assert.ok(!rootClosed, `${label}: 根 svg 闭合后不得再有元素`);

      const isRoot = stack.length === 0;
      if (isRoot) {
        assert.ok(!rootSeen, `${label}: 只能有一个根 svg`);
        assert.equal(elementName, 'svg', `${label}: 根节点必须是 svg`);
        assert.ok(!selfClosing, `${label}: 根 svg 必须有完整闭合标签`);
        rootSeen = true;
        rootTag = tag;
      } else {
        assert.notEqual(elementName, 'svg', `${label}: 禁止嵌套 svg 根元素`);
      }

      const attributes = parseSvgAttributes(
        opening.slice(elementName.length),
        elementName,
        isRoot,
        label,
      );
      if (isRoot) {
        assert.equal(attributes.get('xmlns'), SVG_NAMESPACE, `${label}: 根 svg 缺少固定 xmlns`);
      }
      const id = attributes.get('id');
      if (id !== undefined) {
        assert.match(id, /^[A-Za-z_][\w.-]*$/, `${label}:${elementName}.id: id 语法无效`);
        assert.ok(!ids.has(id), `${label}: id ${id} 不得重复`);
        ids.add(id);
      }
      const href = attributes.get('href');
      if (href !== undefined) localReferences.push(href.slice(1));
      for (const attributeName of LOCAL_FRAGMENT_ATTRIBUTES) {
        const match = /^url\(#([A-Za-z_][\w.-]*)\)$/.exec(attributes.get(attributeName) ?? '');
        if (match) localReferences.push(match[1]);
      }
      if (!selfClosing) stack.push(elementName);
    }
    cursor = tagEnd + 1;
  }

  assert.ok(rootSeen, `${label}: 缺少根 svg`);
  assert.equal(stack.length, 0, `${label}: 存在未闭合元素 ${stack.at(-1) ?? ''}`);
  assert.ok(rootClosed, `${label}: 根 svg 必须完整闭合`);
  for (const reference of localReferences) {
    assert.ok(ids.has(reference), `${label}: 本地片段 #${reference} 必须引用真实 id`);
  }
  return { rootTag };
}

function assertSafeSvg(svg, visual, assetPath) {
  const label = `${visual.id}:${assetPath}`;
  const { rootTag } = parseStrictSvg(svg, label);
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="t d" ${rootAttributes}>`
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

test('strict SVG subset rejects encoded URLs, processing instructions and malformed element stacks', () => {
  const visual = { id: 'visual-test', width: 1200, height: 675 };
  const safeShell = (content) => (
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" '
    + 'viewBox="0 0 1200 675" role="img" aria-labelledby="t d">'
    + `<title id="t">标题</title><desc id="d">描述</desc>${content}</svg>`
  );
  const fullyCssEscapedUrl = safeShell(
    '<rect fill="\\75\\72\\6c\\28\\68\\74\\74\\70\\73\\3a\\2f\\2f'
    + '\\65\\78\\61\\6d\\70\\6c\\65\\2e\\63\\6f\\6d\\2f\\61\\2e'
    + '\\73\\76\\67\\29"/>',
  );
  const numericEntityUrl = safeShell(
    '<rect fill="u&#114;l(&#104;&#116;&#116;&#112;&#115;&#58;&#47;&#47;'
    + 'example.com/a.svg)"/>',
  );
  const unsafeCases = new Map([
    ['fully CSS-escaped URL', fullyCssEscapedUrl],
    ['numeric entity URL', numericEntityUrl],
    ['percent-encoded URL', safeShell('<rect fill="url%28https%3A%2F%2Fexample.com/a.svg%29"/>')],
    ['Unicode-confused URL', safeShell('<rect fill="ｕｒｌ（ｈｔｔｐｓ：／／example.com/a.svg）"/>')],
    ['XML declaration PI', `<?xml version="1.0"?>${safeShell('')}`],
    ['local xml-stylesheet PI', `<?xml-stylesheet href="#local-css"?>${safeShell('')}`],
    ['comment', safeShell('<!-- hidden -->')],
    ['CDATA', safeShell('<text><![CDATA[hidden]]></text>')],
    ['namespace-prefixed attribute', safeShell('<use xlink:href="#shape"/>')],
    ['unclosed element', safeShell('<g><rect/>')],
    ['misordered closing tags', safeShell('<g><rect></g></rect>')],
    ['two root elements', `${safeShell('')}${safeShell('')}`],
    ['text before root', `unexpected${safeShell('')}`],
    ['text after root', `${safeShell('')}unexpected`],
    ['whitespace after opening bracket', safeShell('< g/>')],
  ]);

  const withoutSvgNamespace = (svg) => svg.replace('http://www.w3.org/2000/svg', '');
  assert.doesNotMatch(
    withoutSvgNamespace(fullyCssEscapedUrl),
    /:\/\//,
    'CSS escape negative must hide :// outside the fixed SVG namespace',
  );
  assert.doesNotMatch(
    withoutSvgNamespace(numericEntityUrl),
    /:\/\//,
    'entity negative must hide :// outside the fixed SVG namespace',
  );
  assert.doesNotThrow(() => assertSafeSvg(safeShell('<g><rect/></g>'), visual, 'safe.svg'));
  for (const [name, svg] of unsafeCases) {
    assert.throws(
      () => assertSafeSvg(svg, visual, `${name}.svg`),
      assert.AssertionError,
      name,
    );
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
