import assert from 'node:assert/strict';

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
  'data-step',
  'data-w',
  'data-loss',
  'data-valley-x',
  'data-x-scale',
  'data-valley-y',
  'data-y-scale',
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
const SVG_NUMBER_SOURCE = '[+-]?(?:(?:[0-9]+(?:\\.[0-9]*)?)|(?:\\.[0-9]+))(?:[eE][+-]?[0-9]+)?';
const SVG_NUMBER_PATTERN = new RegExp(`^${SVG_NUMBER_SOURCE}$`);
const SVG_VIEW_BOX_PATTERN = new RegExp(
  `^(${SVG_NUMBER_SOURCE})[\\x20\\x09\\x0D\\x0A]+`
  + `(${SVG_NUMBER_SOURCE})[\\x20\\x09\\x0D\\x0A]+`
  + `(${SVG_NUMBER_SOURCE})[\\x20\\x09\\x0D\\x0A]+`
  + `(${SVG_NUMBER_SOURCE})$`,
);
const POSITIVE_DECIMAL_INTEGER_PATTERN = /^[1-9][0-9]*$/;

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
          `${label}:${elementName}.${attributeName}: 引用属性只允许可见 ASCII`,
        );
        assert.doesNotMatch(
          value,
          /%/,
          `${label}:${elementName}.${attributeName}: 引用与 paint 属性禁止百分号编码混淆`,
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
      if (attributeName === 'aria-hidden') {
        assert.match(value, /^(?:true|false)$/, `${label}:${elementName}.aria-hidden: 只允许 true/false`);
      }
    }

    attributes.set(attributeName, value);
  }

  return attributes;
}

export function parseStrictSvg(svg, label) {
  for (const character of svg) {
    const codePoint = character.codePointAt(0);
    const isXml10Character = (
      codePoint === 0x9
      || codePoint === 0xA
      || codePoint === 0xD
      || (codePoint >= 0x20 && codePoint <= 0xD7FF)
      || (codePoint >= 0xE000 && codePoint <= 0xFFFD)
      || (codePoint >= 0x10000 && codePoint <= 0x10FFFF)
    );
    assert.ok(
      isXml10Character,
      `${label}: U+${codePoint.toString(16).toUpperCase()} 不是 XML 1.0 合法字符`,
    );
  }
  assert.equal(svg, svg.normalize('NFC'), `${label}: 必须使用 NFC Unicode`);
  assert.doesNotMatch(svg, /\uFFFD/, `${label}: 必须是有效 UTF-8`);
  assert.doesNotMatch(svg, /\\/, `${label}: 禁止 CSS 转义与反斜线`);
  assert.doesNotMatch(svg, /&/, `${label}: 禁止 XML/HTML entity 与字符引用`);
  assert.doesNotMatch(svg, /<\?/, `${label}: 禁止所有 XML 处理指令`);
  assert.doesNotMatch(svg, /<!/, `${label}: 禁止注释、CDATA、DOCTYPE 与 ENTITY`);
  assert.doesNotMatch(
    svg,
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/,
    `${label}: 禁止控制符与不可见方向符编码混淆`,
  );

  const stack = [];
  const elements = [];
  const elementsByName = new Map();
  const ids = new Map();
  const localReferences = [];
  let cursor = 0;
  let rootSeen = false;
  let rootClosed = false;
  let root = null;

  while (cursor < svg.length) {
    if (svg[cursor] !== '<') {
      const nextTag = svg.indexOf('<', cursor);
      const end = nextTag === -1 ? svg.length : nextTag;
      const characterData = svg.slice(cursor, end);
      if (stack.length === 0) {
        assert.match(characterData, /^[\t\n\r ]*$/, `${label}: 根节点外禁止文本`);
      } else {
        assert.doesNotMatch(characterData, /\]\]>/, `${label}: 正文禁止 CDATA 终止序列 ]]>`);
        for (const node of stack) node.text += characterData;
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
      assert.equal(stack.at(-1).name, closing[1], `${label}: ${closing[1]} 闭合顺序错误`);
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
      const node = {
        name: elementName,
        attributes,
        children: [],
        text: '',
      };
      elements.push(node);
      if (!elementsByName.has(elementName)) elementsByName.set(elementName, []);
      elementsByName.get(elementName).push(node);
      if (isRoot) {
        root = node;
      } else {
        stack.at(-1).children.push(node);
      }
      const id = attributes.get('id');
      if (id !== undefined) {
        assert.match(id, /^[A-Za-z_][\w.-]*$/, `${label}:${elementName}.id: id 语法无效`);
        assert.ok(!ids.has(id), `${label}: id ${id} 不得重复`);
        ids.set(id, node);
      }
      const href = attributes.get('href');
      if (href !== undefined) {
        localReferences.push({
          node,
          attribute: 'href',
          targetId: href.slice(1),
        });
      }
      for (const attributeName of LOCAL_FRAGMENT_ATTRIBUTES) {
        const match = /^url\(#([A-Za-z_][\w.-]*)\)$/.exec(attributes.get(attributeName) ?? '');
        if (match) {
          localReferences.push({
            node,
            attribute: attributeName,
            targetId: match[1],
          });
        }
      }
      if (!selfClosing) stack.push(node);
    }
    cursor = tagEnd + 1;
  }

  assert.ok(rootSeen, `${label}: 缺少根 svg`);
  assert.equal(stack.length, 0, `${label}: 存在未闭合元素 ${stack.at(-1)?.name ?? ''}`);
  assert.ok(rootClosed, `${label}: 根 svg 必须完整闭合`);
  for (const reference of localReferences) {
    assert.ok(
      ids.has(reference.targetId),
      `${label}:${reference.node.name}.${reference.attribute}: `
      + `本地片段 #${reference.targetId} 必须引用真实 id`,
    );
  }
  return {
    root,
    elements,
    elementsByName,
    ids,
    localReferences,
  };
}

function svgNumberEqualsInteger(token, expected) {
  const parts = /^([+-]?)(?:([0-9]+)(?:\.([0-9]*))?|\.([0-9]+))(?:[eE]([+-]?[0-9]+))?$/
    .exec(token);
  if (!parts || !Number.isSafeInteger(expected) || expected < 0) return false;

  const integerPart = parts[2] ?? '';
  const fractionPart = parts[2] === undefined ? parts[4] : (parts[3] ?? '');
  const significantDigits = `${integerPart}${fractionPart}`.replace(/^0+/, '');
  if (significantDigits === '') return expected === 0;
  if (parts[1] === '-') return false;

  const decimalShift = BigInt(parts[5] ?? '0') - BigInt(fractionPart.length);
  const expectedDigits = String(expected);
  if (decimalShift >= 0n) {
    const zeroCount = expectedDigits.length - significantDigits.length;
    return (
      zeroCount >= 0
      && decimalShift === BigInt(zeroCount)
      && `${significantDigits}${'0'.repeat(zeroCount)}` === expectedDigits
    );
  }

  const removedCount = significantDigits.length - expectedDigits.length;
  return (
    removedCount > 0
    && -decimalShift === BigInt(removedCount)
    && significantDigits.slice(0, -removedCount) === expectedDigits
    && /^[0]+$/.test(significantDigits.slice(-removedCount))
  );
}

function assertRootDimension(value, expected, label) {
  assert.equal(typeof value, 'string', `${label}: 必须存在`);
  assert.match(value, POSITIVE_DECIMAL_INTEGER_PATTERN, `${label}: 必须是无单位正十进制整数`);
  assert.ok(Number.isSafeInteger(expected) && expected > 0, `${label}: registry 尺寸必须是安全正整数`);
  assert.equal(BigInt(value), BigInt(expected), `${label}: 必须与 registry 尺寸精确一致`);
}

function assertViewBox(value, expected, label) {
  assert.equal(typeof value, 'string', `${label}: 必须存在`);
  const match = SVG_VIEW_BOX_PATTERN.exec(value);
  assert.ok(
    match,
    `${label}: 必须是四个以 XML wsp 分隔的 SVG number，禁止逗号与 Unicode 空白`,
  );
  const tokens = match.slice(1);
  for (let index = 0; index < expected.length; index += 1) {
    assert.match(tokens[index], SVG_NUMBER_PATTERN, `${label}: 第 ${index + 1} 项词法无效`);
    assert.ok(
      svgNumberEqualsInteger(tokens[index], expected[index]),
      `${label}: 第 ${index + 1} 项必须与 registry 数值精确一致`,
    );
  }
}

export function assertSafeStaticSvg(svg, visual, assetPath) {
  const label = `${visual.id}:${assetPath}`;
  const parsed = parseStrictSvg(svg, label);
  const titleNodes = parsed.elementsByName.get('title') ?? [];
  const descNodes = parsed.elementsByName.get('desc') ?? [];
  assert.equal(titleNodes.length, 1, `${label}: 必须有一个 title`);
  assert.equal(descNodes.length, 1, `${label}: 必须有一个 desc`);
  const [titleNode] = titleNodes;
  const [descNode] = descNodes;
  assert.equal(parsed.root.attributes.get('role'), 'img', `${label}: role 必须为 img`);
  assert.notEqual(parsed.root.attributes.get('aria-hidden'), 'true', `${label}: 根 svg 不得 aria-hidden`);

  const titleId = titleNode.attributes.get('id');
  const descId = descNode.attributes.get('id');
  assert.ok(titleId, `${label}: title 必须有 id`);
  assert.ok(descId, `${label}: desc 必须有 id`);
  assert.notEqual(titleId, descId, `${label}: title 与 desc id 必须不同`);
  assert.notEqual(titleNode.attributes.get('aria-hidden'), 'true', `${label}: title 不得 aria-hidden`);
  assert.notEqual(descNode.attributes.get('aria-hidden'), 'true', `${label}: desc 不得 aria-hidden`);
  assert.match(titleNode.text, /[^\x20\x09\x0D\x0A]/, `${label}: title 必须有正文`);
  assert.match(descNode.text, /[^\x20\x09\x0D\x0A]/, `${label}: desc 必须有正文`);
  assert.equal(
    parsed.root.attributes.get('aria-labelledby'),
    `${titleId} ${descId}`,
    `${label}: aria-labelledby 必须以单个 ASCII 空格依次引用真实 title 与 desc`,
  );
  assert.equal(parsed.ids.get(titleId), titleNode, `${label}: aria 首项必须指向真实 title`);
  assert.equal(parsed.ids.get(descId), descNode, `${label}: aria 次项必须指向真实 desc`);

  assertViewBox(
    parsed.root.attributes.get('viewBox'),
    [0, 0, visual.width, visual.height],
    `${label}: viewBox`,
  );
  assertRootDimension(parsed.root.attributes.get('width'), visual.width, `${label}: width`);
  assertRootDimension(parsed.root.attributes.get('height'), visual.height, `${label}: height`);
  return parsed;
}
