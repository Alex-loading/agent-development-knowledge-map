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
  assert.match(html, /<a[^>]+id=["']skip-to-main["'][^>]+href=["']#app-main["'][^>]*>/i);
  assert.match(html, /<a[^>]+id=["']brand-home["'][^>]+href=["']#llm-foundation\/dashboard["'][^>]*>/i);
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

test('falls back from empty, invalid and unknown-module routes', () => {
  const fallback = {
    hash: '#llm-foundation/dashboard',
    moduleId: 'llm-foundation',
    view: 'dashboard',
  };
  assert.deepEqual(normalizeRoute(''), fallback);
  assert.deepEqual(normalizeRoute('#llm-foundation/not-a-view'), fallback);
  assert.deepEqual(normalizeRoute('#not-registered/dashboard'), fallback);
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

test('application integrates the dashboard, curriculum and knowledge-map renderers', async () => {
  const app = await read('src/app.js');

  assert.match(app, /from ['"]\.\/ui\/dashboard\.js['"]/);
  assert.match(app, /from ['"]\.\/ui\/curriculum\.js['"]/);
  assert.match(app, /from ['"]\.\/ui\/knowledge-map\.js['"]/);
  assert.match(app, /renderDashboard\s*\(/);
  assert.match(app, /renderCurriculum(?:List|Lesson)\s*\(/);
  assert.match(app, /renderKnowledgeMap\s*\(/);
});

test('practice views are real renderers with paper-lab responsive component styles', async () => {
  const [app, styles] = await Promise.all([
    read('src/app.js'),
    read('styles/app.css'),
  ]);

  for (const modulePath of ['./ui/resources.js', './ui/interviews.js', './ui/progress-view.js']) {
    assert.ok(app.includes(`from '${modulePath}'`), `app should import ${modulePath}`);
  }
  for (const selector of [
    '.filter-ledger',
    '.resource-row',
    '.interview-card',
    '.answer-drawer',
    '.status-matrix',
    '.progress-ledger',
    '.reset-confirmation',
    '.destructive-action',
  ]) {
    assert.ok(styles.includes(selector), `missing paper-lab component style ${selector}`);
  }
  assert.match(styles, /\.resource-row\s*\{[^}]*grid-template-columns/s);
  assert.match(styles, /@media\s*\(max-width\s*:\s*40rem\)[\s\S]*\.resource-row/s);
});

test('release guide documents operation, architecture, privacy and the extension contract', async () => {
  const readme = await read('README.md');

  for (const command of ['npm test', 'npm run serve', 'http://localhost:4173']) {
    assert.ok(readme.includes(command), `README should document ${command}`);
  }
  for (const view of ['模块首页', '学习主线', '知识地图', '资源库', '面试高频', '学习进度']) {
    assert.ok(readme.includes(view), `README should tour the ${view} view`);
  }
  for (const lab of ['Token / 上下文预算台', 'Attention 直觉台', '采样参数实验']) {
    assert.ok(readme.includes(lab), `README should document the ${lab} lab`);
  }
  for (const category of ['课程', '资源', '练习', '面试高频']) {
    assert.match(readme, new RegExp(`必(?:须|需)[^\n]{0,40}${category}|${category}[^\n]{0,40}必(?:须|需)`));
  }
  for (const planned of ['Agent 机制', 'Agent Harness', '上下文、RAG 与记忆', 'AI 后端工程', '评测、可观测与安全', '多 Agent 与 MCP', '求职与项目交付']) {
    assert.ok(readme.includes(planned), `README should identify planned module ${planned}`);
  }

  assert.match(readme, /LLM 基础[^\n]{0,30}(?:完整|完成)/);
  assert.match(readme, /8\s*节课程/);
  assert.match(readme, /28\s*(?:份|条)[^\n]{0,20}资源/);
  assert.match(readme, /24\s*(?:道|条)[^\n]{0,20}面试/);
  assert.match(readme, /agent-learner:progress:v1/);
  assert.match(readme, /仅[^\n]{0,30}本地|本地[^\n]{0,30}(?:保存|存储)/);
  assert.match(readme, /内存[^\n]{0,30}(?:回退|降级)|(?:回退|降级)[^\n]{0,30}内存/);
  assert.match(readme, /无(?:需|须)[^\n]{0,12}(?:构建|build)|no build/i);
  assert.match(readme, /data[^\n]{0,50}core[^\n]{0,50}UI[^\n]{0,50}(?:app|storage)/i);
  assert.match(readme, /原生 ES Modules|native ES modules/i);
  assert.match(readme, /HTTPS/);
  assert.match(readme, /verifiedAt/);
  assert.match(readme, /短视频[^\n]{0,30}(?:补充|核心)/);
  assert.match(readme, /courses\.js/);
  assert.match(readme, /(?:注册|registry)[^\n]{0,50}(?:active|开放)|(?:active|开放)[^\n]{0,50}(?:注册|registry)/i);
  assert.match(readme, /(?:损坏|无效)[^\n]{0,50}(?:默认|初始)[^\n]{0,50}local/i);
  assert.match(readme, /(?:抛出|不可用|阻止)[^\n]{0,50}memory|memory[^\n]{0,50}(?:抛出|不可用|阻止)/i);
  assert.match(readme, /`prerequisites`/);
  assert.match(readme, /`platform`[^\n]{0,30}(?:可选|推导|派生)/);
});

test('styles explicitly protect 320px layouts, media and touch interactions', async () => {
  const styles = await read('styles/app.css');

  assert.match(styles, /\*\s*\{[^}]*box-sizing\s*:\s*border-box/s);
  assert.match(styles, /overflow-wrap\s*:\s*anywhere/i);
  assert.match(styles, /(?:img|svg|video|canvas)[^{]*\{[^}]*max-width\s*:\s*100%/is);
  assert.match(styles, /(?:body|main|section|article|fieldset|\.app-layout)[^{]*\{[^}]*min-width\s*:\s*0/is);
  assert.match(styles, /@media\s*\(max-width\s*:\s*40rem\)/i);
  assert.match(styles, /@media\s*\(max-width\s*:\s*22rem\)/i);
  assert.match(styles, /@media\s*\(max-width\s*:\s*40rem\)[\s\S]*(?:button|select|input)[^{]*\{[^}]*min-height\s*:\s*(?:2\.75rem|44px)/is);
  assert.match(styles, /input\[type=["']range["']\][^{]*\{[^}]*max-width\s*:\s*100%/is);
  assert.match(styles, /prefers-reduced-motion\s*:\s*reduce/i);
});

test('document release contract is local, descriptive and keyboard reachable', async () => {
  const [html, tokens, styles] = await Promise.all([
    read('index.html'),
    read('styles/tokens.css'),
    read('styles/app.css'),
  ]);

  assert.match(html, /<meta\s+name=["']viewport["']\s+content=["']width=device-width, initial-scale=1["']/i);
  assert.match(html, /<title>[^<]*(?:Agent Learner|LLM)[^<]*<\/title>/i);
  assert.match(html, /<main[^>]+id=["']app-main["'][^>]+tabindex=["']-1["']/i);
  assert.match(html, /id=["']app-live-region["'][^>]+aria-live=["']polite["']/i);
  assert.doesNotMatch(`${html}\n${tokens}\n${styles}`, /(?:@import\s+url|href=["']https?:\/\/[^"']+\.css|url\(["']?https?:\/\/)/i);
});

test('valid external resources open safely in a new tab', () => {
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
    const link = externalLink({ title: '官方资料', url: 'https://example.com/guide' });
    assert.equal(link.tagName, 'A');
    assert.equal(link.attributes.target, '_blank');
    assert.equal(link.attributes.rel, 'noopener noreferrer');
    assert.equal(link.attributes.href, 'https://example.com/guide');
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
