import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeRoute } from '../src/app.js';
import { externalLink } from '../src/ui/dom.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function cssHex(tokens, name) {
  const value = tokens.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  assert.ok(value, `missing six-digit hex token ${name}`);
  return value;
}

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test('index exposes a semantic native-module application shell', async () => {
  const html = await read('index.html');

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html\s+lang=["']zh-CN["']/i);
  assert.match(html, /<a[^>]+href=["']#app-main["'][^>]*>/i);
  assert.match(html, /<nav[^>]+aria-label=["']学习模块["'][^>]*>/i);
  assert.match(html, /<nav[^>]+aria-label=["']学习视图["'][^>]*>/i);
  assert.match(html, /<main[^>]+id=["']app-main["'][^>]*>/i);
  assert.match(html, /id=["']storage-notice["']/i);
  assert.match(html, /aria-live=["']polite["']/i);
  assert.match(html, /<link[^>]+href=["']\.\/styles\/tokens\.css["']/i);
  assert.match(html, /<link[^>]+href=["']\.\/styles\/app\.css["']/i);
  assert.match(html, /<script\s+type=["']module["']\s+src=["']\.\/src\/app\.js["']><\/script>/i);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(html, /\son\w+\s*=/i);
});

test('paper-lab styles include responsive, focus, motion and design tokens', async () => {
  const [tokens, styles] = await Promise.all([
    read('styles/tokens.css'),
    read('styles/app.css'),
  ]);

  for (const token of ['--color-paper', '--color-ink', '--color-forest', '--color-vermilion', '--color-ochre', '--color-muted', '--color-border', '--color-focus']) {
    assert.match(tokens, new RegExp(token));
  }
  assert.match(styles, /@media\s*\(max-width\s*:/i);
  assert.match(styles, /prefers-reduced-motion/i);
  assert.match(styles, /:focus-visible/i);
  assert.match(styles, /\.module-item/i);
  assert.match(styles, /\.view-tab/i);
  assert.match(styles, /\.notice/i);
});

test('small-text palette tokens meet WCAG AA contrast on paper', async () => {
  const tokens = await read('styles/tokens.css');
  const paper = cssHex(tokens, '--color-paper');

  for (const token of ['--color-muted', '--color-ochre']) {
    const foreground = cssHex(tokens, token);
    assert.ok(
      contrastRatio(foreground, paper) >= 4.5,
      `${token} ${foreground} must reach 4.5:1 against paper ${paper}`,
    );
  }
});

test('normalizes supported view and lesson routes to canonical hashes', () => {
  assert.deepEqual(normalizeRoute('#llm-foundation/resources'), {
    hash: '#llm-foundation/resources',
    moduleId: 'llm-foundation',
    view: 'resources',
  });
  assert.deepEqual(normalizeRoute('#llm-foundation/lesson/llm-04'), {
    hash: '#llm-foundation/lesson/llm-04',
    moduleId: 'llm-foundation',
    view: 'lesson',
    lessonId: 'llm-04',
  });
});

test('falls back from empty, unknown and unsupported-module routes', () => {
  const fallback = {
    hash: '#llm-foundation/dashboard',
    moduleId: 'llm-foundation',
    view: 'dashboard',
  };
  assert.deepEqual(normalizeRoute(''), fallback);
  assert.deepEqual(normalizeRoute('#llm-foundation/not-a-view'), fallback);
  assert.deepEqual(normalizeRoute('#agent-mechanism/dashboard'), fallback);
});

test('malformed and non-HTTPS external resources are non-clickable and disabled', () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        attributes: {},
        dataset: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener() {},
        append() {},
      };
    },
    createTextNode(text) { return { textContent: text }; },
  };

  try {
    for (const resource of [
      { title: '格式错误', url: '://broken' },
      { title: '协议不安全', url: 'http://example.com' },
    ]) {
      const result = externalLink(resource);
      assert.equal(result.tagName, 'SPAN');
      assert.equal(result.attributes['aria-disabled'], 'true');
      assert.equal(result.attributes.href, undefined);
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('application modules avoid unsafe HTML rendering and inline handlers', async () => {
  const [dom, shell, app] = await Promise.all([
    read('src/ui/dom.js'),
    read('src/ui/shell.js'),
    read('src/app.js'),
  ]);
  const source = `${dom}\n${shell}\n${app}`;

  assert.match(dom, /export function element\b/);
  assert.match(dom, /export function button\b/);
  assert.match(dom, /export function externalLink\b/);
  assert.match(shell, /export function renderShell\b/);
  assert.match(app, /addEventListener\(['"]hashchange['"]/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /setAttribute\(['"]on/i);
});
