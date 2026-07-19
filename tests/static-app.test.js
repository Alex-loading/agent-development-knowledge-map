import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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
