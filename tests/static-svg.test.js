import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSafeStaticSvg,
  parseStrictSvg,
} from './helpers/static-svg.js';

const visual = { id: 'visual-static-test', width: 1200, height: 675 };

function safeSvg(content = '', {
  width = '1200',
  height = '675',
  viewBox = '0 0 1200 675',
  ariaLabelledBy = 't d',
  rootAttributes = '',
  titleAttributes = 'id="t"',
  descAttributes = 'id="d"',
  title = '安全标题',
  desc = '安全描述',
} = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
    + `viewBox="${viewBox}" role="img" aria-labelledby="${ariaLabelledBy}" ${rootAttributes}>`
    + `<title ${titleAttributes}>${title}</title>`
    + `<desc ${descAttributes}>${desc}</desc>${content}</svg>`
  );
}

function assertUnsafe(cases) {
  for (const [name, svg] of cases) {
    assert.throws(
      () => assertSafeStaticSvg(svg, visual, `${name}.svg`),
      assert.AssertionError,
      name,
    );
  }
}

test('accepts a well-formed accessible SVG with resolved local references and safe percentages', () => {
  const svg = safeSvg(
    '<defs><pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse">'
    + '<rect width="10" height="10" fill="#fff"/></pattern></defs>'
    + '<rect x="50%" y="50%" width="10%" height="10%" fill="url(#p)"/>'
    + '<text x="10" y="20">覆盖率 100%，P95 为 99.5%</text>',
    { title: '覆盖率 100%', desc: '百分比正文与数值属性是安全内容' },
  );

  const parsed = assertSafeStaticSvg(svg, visual, 'safe-percent.svg');
  assert.equal(parsed.root.name, 'svg');
  assert.equal(parsed.ids.get('p').name, 'pattern');
  assert.equal(parsed.localReferences[0].targetId, 'p');
});

test('accepts XML predefined entities as decoded inert text and attribute data', () => {
  const svg = safeSvg(
    '<text id="escaped" data-region="A&amp;B &lt;region&gt;">'
    + 'A&amp;B &lt;safe&gt; &quot;quoted&quot; &apos;single&apos;</text>',
    {
      title: 'A&amp;B &lt;title&gt;',
      desc: 'Escaped &quot;description&quot; stays text',
    },
  );
  const parsed = assertSafeStaticSvg(svg, visual, 'safe-predefined-entities.svg');
  assert.equal(parsed.ids.get('escaped').text, `A&B <safe> "quoted" 'single'`);
  assert.equal(parsed.ids.get('escaped').attributes.get('data-region'), 'A&B <region>');
  assert.equal(parsed.elementsByName.get('title')[0].text, 'A&B <title>');
});

test('rejects active content, remote URLs, unsafe elements and prefixed names', () => {
  assertUnsafe(new Map([
    ['script', safeSvg('<script>alert(1)</script>')],
    ['foreignObject', safeSvg('<foreignObject><div>HTML</div></foreignObject>')],
    ['event handler', safeSvg('<rect onload="alert(1)"/>')],
    ['remote href', safeSvg('<use href="https://example.com/a.svg#shape"/>')],
    ['protocol relative href', safeSvg('<textPath href="//example.com/p">x</textPath>')],
    ['data URL', safeSvg('<rect fill="data:image/svg+xml,x"/>')],
    ['javascript URL', safeSvg('<use href="javascript:alert(1)"/>')],
    ['style element', safeSvg('<style>@import "https://example.com/a.css";</style>')],
    ['style attribute', safeSvg('<rect style="fill:url(https://example.com/a.svg)"/>')],
    ['animation element', safeSvg('<set attributeName="href" to="https://example.com"/>')],
    ['prefixed element', safeSvg('<x:script xmlns:x="http://www.w3.org/2000/svg"/>')],
    ['prefixed attribute', safeSvg('<use xlink:href="#shape"/>')],
    ['xml base', safeSvg('<use href="#shape"/>', { rootAttributes: 'xml:base="https://example.com"' })],
  ]));
});

test('rejects encoded references while allowing percent signs outside URL and paint contexts', () => {
  const fullyCssEscapedUrl = safeSvg(
    '<rect fill="\\75\\72\\6c\\28\\68\\74\\74\\70\\73\\3a\\2f\\2f'
    + '\\65\\78\\61\\6d\\70\\6c\\65\\2e\\63\\6f\\6d\\29"/>',
  );
  const numericEntityUrl = safeSvg(
    '<rect fill="u&#114;l(&#104;&#116;&#116;&#112;&#115;&#58;&#47;&#47;example.com)"/>',
  );
  assertUnsafe(new Map([
    ['CSS escapes', fullyCssEscapedUrl],
    ['numeric entities', numericEntityUrl],
    ['custom named entity', safeSvg('<text>&unsafe;</text>')],
    ['percent href', safeSvg('<use id="shape" href="%23shape"/>')],
    ['percent local paint', safeSvg('<rect fill="url(%23shape)"/>')],
    ['percent remote paint', safeSvg('<rect fill="%68%74%74%70%73%3A%2F%2Fexample.com/a.svg"/>')],
    ['Unicode-confused paint', safeSvg('<rect fill="ｕｒｌ（ｈｔｔｐｓ：／／example.com）"/>')],
  ]));
});

test('rejects processing instructions, declarations and malformed XML stacks', () => {
  assertUnsafe(new Map([
    ['XML declaration', `<?xml version="1.0"?>${safeSvg()}`],
    ['stylesheet PI', `<?xml-stylesheet href="#css"?>${safeSvg()}`],
    ['comment', safeSvg('<!-- hidden -->')],
    ['CDATA', safeSvg('<text><![CDATA[hidden]]></text>')],
    ['DOCTYPE', `<!DOCTYPE svg>${safeSvg()}`],
    ['ENTITY declaration', `<!DOCTYPE svg [<!ENTITY unsafe "x">]>${safeSvg()}`],
    ['unclosed element', safeSvg('<g><rect/>')],
    ['misordered close', safeSvg('<g><rect></g></rect>')],
    ['two roots', `${safeSvg()}${safeSvg()}`],
    ['text before root', `unexpected${safeSvg()}`],
    ['text after root', `${safeSvg()}unexpected`],
    ['whitespace after opening bracket', safeSvg('< g/>')],
  ]));
});

test('trusts parsed attributes rather than attribute-looking text inside values', () => {
  const body = '<title id="t">标题</title><desc id="d">描述</desc>';
  const missingRealRootAttributes = (
    '<svg xmlns="http://www.w3.org/2000/svg" '
    + 'data-region=\'role="img" aria-labelledby="t d" width="1200" height="675" '
    + `viewBox="0 0 1200 675"'>${body}</svg>`
  );
  const wrongRealRootAttributes = (
    '<svg xmlns="http://www.w3.org/2000/svg" '
    + 'data-region=\'role="img" aria-labelledby="t d" width="1200" height="675" '
    + 'viewBox="0 0 1200 675"\' role="presentation" aria-labelledby="d t" '
    + `width="1" height="2" viewBox="0 0 1 2">${body}</svg>`
  );
  const fakeTitleIds = safeSvg('', {
    titleAttributes: 'aria-label=\'id="t"\'',
    descAttributes: 'aria-label=\'id="d"\'',
  });
  assertUnsafe(new Map([
    ['missing real root attributes', missingRealRootAttributes],
    ['wrong real root attributes', wrongRealRootAttributes],
    ['fake title IDs', fakeTitleIds],
    ['duplicate title', safeSvg('<title id="t2">extra</title>')],
    ['duplicate desc', safeSvg('<desc id="d2">extra</desc>')],
    ['duplicate ID', safeSvg('<rect id="t"/>')],
    ['wrong aria order', safeSvg('', { ariaLabelledBy: 'd t' })],
    ['missing aria target', safeSvg('', { ariaLabelledBy: 't missing' })],
  ]));
});

test('enforces SVG number, XML-wsp and exact ARIA IDREF lexical grammar', () => {
  assert.doesNotThrow(
    () => assertSafeStaticSvg(
      safeSvg('', { viewBox: '0e0 .0 1.2e3 6.75e2' }),
      visual,
      'valid-exponent.svg',
    ),
  );
  assert.doesNotThrow(
    () => assertSafeStaticSvg(
      safeSvg('', { viewBox: '0\t0\n1200\r675' }),
      visual,
      'valid-xml-wsp.svg',
    ),
  );
  assertUnsafe(new Map([
    ['hex width', safeSvg('', { width: '0x4b0' })],
    ['binary height', safeSvg('', { height: '0b1010100011' })],
    ['exponent width', safeSvg('', { width: '12e2' })],
    ['numeric separator', safeSvg('', { width: '1_200' })],
    ['NBSP viewBox', safeSvg('', { viewBox: '0\u00A00 1200 675' })],
    ['EM SPACE viewBox', safeSvg('', { viewBox: '0\u20030 1200 675' })],
    ['Infinity', safeSvg('', { viewBox: '0 0 Infinity 675' })],
    ['NaN', safeSvg('', { viewBox: '0 0 NaN 675' })],
    ['bad exponent', safeSvg('', { viewBox: '0 0 12e+ 675' })],
    ['rounded fraction', safeSvg('', { viewBox: '0 0 1200.0000000000000001 675' })],
    ['comma viewBox', safeSvg('', { viewBox: '0,0,1200,675' })],
    ['NBSP aria', safeSvg('', { ariaLabelledBy: 't\u00A0d' })],
    ['EM SPACE aria', safeSvg('', { ariaLabelledBy: 't\u2003d' })],
    ['Tab aria', safeSvg('', { ariaLabelledBy: 't\td' })],
    ['repeated aria space', safeSvg('', { ariaLabelledBy: 't  d' })],
    ['leading aria space', safeSvg('', { ariaLabelledBy: ' t d' })],
    ['trailing aria space', safeSvg('', { ariaLabelledBy: 't d ' })],
  ]));
});

test('rejects aria-hidden accessibility nodes and invalid XML 1.0 CharData', () => {
  assertUnsafe(new Map([
    ['hidden root', safeSvg('', { rootAttributes: 'aria-hidden="true"' })],
    ['hidden title', safeSvg('', { titleAttributes: 'id="t" aria-hidden="true"' })],
    ['hidden desc', safeSvg('', { descAttributes: 'id="d" aria-hidden="true"' })],
    ['case-confused hidden root', safeSvg('', { rootAttributes: 'aria-hidden="TRUE"' })],
    ['U+FFFE', safeSvg('<text>\uFFFE</text>')],
    ['U+FFFF', safeSvg('<text>\uFFFF</text>')],
    ['isolated high surrogate', safeSvg('<text>\uD800</text>')],
    ['isolated low surrogate', safeSvg('<text>\uDC00</text>')],
    ['CharData terminator', safeSvg('<text>]]></text>')],
  ]));

  const parsed = parseStrictSvg(
    safeSvg('<text id="emoji">安全中文 😀</text>', { title: '安全中文 😀' }),
    'safe-emoji.svg',
  );
  assert.equal(parsed.ids.get('emoji').text, '安全中文 😀');
});
