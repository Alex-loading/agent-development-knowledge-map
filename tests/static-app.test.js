import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { normalizeRoute } from '../src/app.js';
import { courseRegistry } from '../src/data/courses.js';
import { modules } from '../src/data/modules.js';
import { externalLink } from '../src/ui/dom.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const agentHarness = courseRegistry['agent-harness'];
const agentMechanism = courseRegistry['agent-mechanism'];
const contextRagMemory = courseRegistry['context-rag-memory'];
const SMALL_CHINESE_NUMERALS = Object.freeze([
  '零', '一', '二|两', '三', '四', '五', '六', '七', '八', '九', '十',
]);

function countPattern(count) {
  const chineseNumeral = SMALL_CHINESE_NUMERALS[count];
  return chineseNumeral === undefined ? `${count}` : `(?:${count}|${chineseNumeral})`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markdownSection(markdown, heading) {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  assert.notEqual(start, -1, `README should contain section ${heading}`);
  const contentStart = start + marker.length;
  const nextHeading = markdown.indexOf('\n## ', contentStart);
  return markdown.slice(contentStart, nextHeading === -1 ? markdown.length : nextHeading);
}

function markdownParagraphContaining(markdown, marker) {
  const paragraph = markdown.split(/\n\s*\n/).find((candidate) => candidate.includes(marker));
  assert.ok(paragraph, 'README should contain paragraph ' + marker);
  return paragraph;
}

function findUnsafeDomPatterns(source) {
  return [
    ['HTML sink', /\.innerHTML\s*=|insertAdjacentHTML/],
    ['inline handler attribute', /setAttribute\(['"]on/i],
    ['DOM0 handler assignment', /\.\s*on[a-z]+\s*=/i],
  ].filter(([, pattern]) => pattern.test(source)).map(([label]) => label);
}

async function readJavaScriptTree(directory, relativeDirectory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(entries.map(async (entry) => {
    const path = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    const relativePath = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return readJavaScriptTree(path, relativePath);
    if (!entry.name.endsWith('.js')) return [];
    return [{ path: relativePath, source: await readFile(path, 'utf8') }];
  }));
  return contents.flat();
}

function cssHex(tokens, name) {
  const value = tokens.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  assert.ok(value, `missing six-digit hex token ${name}`);
  return value;
}

function cssBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `missing CSS block ${marker}`);
  const openingBrace = source.indexOf('{', markerIndex);
  assert.notEqual(openingBrace, -1, `missing opening brace for ${marker}`);
  let depth = 0;

  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  assert.fail(`missing closing brace for ${marker}`);
}

function cssRule(source, selector) {
  return cssBlock(source, `${selector} {`);
}

function cssRulesForSelector(source, selector) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(',').some((candidate) => candidate.trim() === selector))
    .map(([, , declarations]) => declarations);
}

function cssDeclaration(rule, property) {
  const value = rule.match(new RegExp(`(?:^|\\n)\\s*${escapeRegExp(property)}:\\s*([^;]+);`))?.[1]?.trim();
  assert.ok(value, `missing CSS declaration ${property}`);
  return value;
}

function cssVariable(declaration) {
  const name = declaration.match(/var\((--[\w-]+)\)/)?.[1];
  assert.ok(name, `CSS declaration should use a color token: ${declaration}`);
  return name;
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

test('long-form knowledge notes enforce readable measure, responsive flow and visible content', async () => {
  const styles = await read('styles/app.css');
  const note = cssRule(styles, '.knowledge-note');
  const sources = cssRule(styles, '.knowledge-note__sources');
  const evidence = cssRule(styles, '.resource-evidence');
  const mobile = cssBlock(styles, '@media (max-width: 40rem) {');
  const mobileSection = cssRule(mobile, '.knowledge-note__section');
  const mobileTocButton = cssRule(mobile, '.knowledge-note__toc button');

  assert.match(note, /width:\s*min\(\s*100%\s*,\s*7[0-4]ch\s*\)/);
  assert.match(mobileSection, /grid-template-columns:\s*(?:minmax\(\s*0\s*,\s*1fr\s*\)|1fr)/);
  assert.match(mobileTocButton, /min-height:\s*2\.75rem/);
  for (const wrappingRule of [sources, evidence]) {
    assert.match(wrappingRule, /overflow-wrap:\s*anywhere/);
    assert.match(wrappingRule, /word-break:\s*break-word/);
  }
  for (const selector of [
    '.knowledge-note__toc',
    '.knowledge-note__section',
    '.knowledge-note__sources',
    '.knowledge-note__callout',
    '.knowledge-note__misconceptions',
    '.knowledge-note__recap',
  ]) {
    assert.ok(
      cssRulesForSelector(styles, selector).some((rule) => rule.trim()),
      `missing substantive rule for ${selector}`,
    );
  }

  const hiddenKnowledgeNoteRules = [...styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors, declarations]) => (
      selectors.includes('.knowledge-note')
      && /(?:display\s*:\s*none|visibility\s*:\s*hidden)/.test(declarations)
    ));
  assert.deepEqual(hiddenKnowledgeNoteRules, []);
});

test('knowledge-note accent text keeps WCAG AA contrast on paper tints', async () => {
  const [tokens, styles] = await Promise.all([
    read('styles/tokens.css'),
    read('styles/app.css'),
  ]);
  const focus = cssRule(styles, '.knowledge-note__toc button:focus-visible');
  const hover = cssRule(styles, '.knowledge-note__toc button:hover:not(:disabled)');
  const misconceptionLabel = cssRule(styles, '.knowledge-note__misconceptions dt::before');
  const misconception = cssRule(styles, '.knowledge-note__misconceptions dt');
  const focusForeground = cssHex(tokens, cssVariable(cssDeclaration(focus, 'color')));
  const focusBackground = cssHex(tokens, cssVariable(cssDeclaration(focus, 'background')));
  const hoverForeground = cssHex(tokens, cssVariable(cssDeclaration(hover, 'color')));
  const misconceptionForeground = cssHex(tokens, cssVariable(cssDeclaration(misconceptionLabel, 'color')));
  const misconceptionBackground = cssHex(tokens, cssVariable(cssDeclaration(misconception, 'background')));

  assert.ok(contrastRatio(focusForeground, focusBackground) >= 4.5, 'TOC focus text must reach 4.5:1');
  for (const hoverBackground of ['--color-ochre-soft', '--color-paper']) {
    assert.ok(
      contrastRatio(hoverForeground, cssHex(tokens, hoverBackground)) >= 4.5,
      `TOC hover text must reach 4.5:1 against ${hoverBackground}`,
    );
  }
  assert.ok(
    contrastRatio(misconceptionForeground, misconceptionBackground) >= 4.5,
    'misconception label must reach 4.5:1',
  );
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

test('application modules avoid unsafe HTML rendering, inline handlers and course hardcoding', async () => {
  const [dom, shell, app, uiApplicationFiles, ...genericViews] = await Promise.all([
    read('src/ui/dom.js'),
    read('src/ui/shell.js'),
    read('src/app.js'),
    readJavaScriptTree(new URL('../src/ui/', import.meta.url), 'src/ui'),
    read('src/ui/dashboard.js'),
    read('src/ui/curriculum.js'),
    read('src/ui/knowledge-map.js'),
    read('src/ui/resources.js'),
    read('src/ui/interviews.js'),
    read('src/ui/progress-view.js'),
    read('src/ui/knowledge-note.js'),
  ]);
  const source = `${dom}\n${shell}\n${app}\n${genericViews.join('\n')}`;
  const genericViewSource = `${shell}\n${genericViews.join('\n')}`;

  assert.match(dom, /export function element\b/);
  assert.match(dom, /export function button\b/);
  assert.match(dom, /export function externalLink\b/);
  assert.match(shell, /export function renderShell\b/);
  assert.match(app, /addEventListener\(['"]hashchange['"]/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /setAttribute\(['"]on/i);
  for (const file of [{ path: 'src/app.js', source: app }, ...uiApplicationFiles]) {
    assert.deepEqual(
      findUnsafeDomPatterns(file.source),
      [],
      `${file.path} should avoid unsafe HTML sinks and inline or DOM0 handlers`,
    );
  }
  for (const module of modules) {
    assert.doesNotMatch(
      genericViewSource,
      new RegExp(escapeRegExp(module.id), 'i'),
      `generic views should not hardcode module ID ${module.id}`,
    );
    assert.doesNotMatch(
      genericViewSource,
      new RegExp(escapeRegExp(module.title), 'i'),
      `generic views should not hardcode module title ${module.title}`,
    );
  }
});

test('DOM safety scanner catches unsafe rendering and DOM0 handler assignment mutations', () => {
  const mutation = `
    region.innerHTML = unsafeMarkup;
    region.setAttribute('onclick', unsafeHandler);
    button.onclick = unsafeHandler;
  `;

  assert.deepEqual(findUnsafeDomPatterns(mutation), [
    'HTML sink',
    'inline handler attribute',
    'DOM0 handler assignment',
  ]);
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

test('Agent experiment renderers are isolated, safely registered and responsively styled', async () => {
  const [experiments, agentExperiments, harnessExperiments, styles] = await Promise.all([
    read('src/ui/experiments.js'),
    read('src/ui/agent-experiments.js'),
    read('src/ui/harness-experiments.js'),
    read('styles/app.css'),
  ]);

  assert.match(agentExperiments, /from ['"]\.\.\/core\/agent-mechanism\.js['"]/);
  for (const coreFunction of ['decideLoopOutcome', 'validateToolInvocation', 'decidePlanRecovery']) {
    assert.match(agentExperiments, new RegExp(`\\b${coreFunction}\\s*\\(`));
  }
  for (const renderer of ['renderAgentLoopExperiment', 'renderToolContractExperiment', 'renderPlanRecoveryExperiment']) {
    assert.match(agentExperiments, new RegExp(`export function ${renderer}\\b`));
  }
  assert.match(agentExperiments, /export const agentExperimentRenderers\s*=\s*Object\.freeze\s*\(\s*\{/);
  for (const id of ['agent-loop', 'tool-contract', 'plan-recovery']) {
    assert.match(agentExperiments, new RegExp(`['"]${id}['"]\\s*:`));
  }
  assert.match(experiments, /import\s*\{\s*agentExperimentRenderers\s*\}\s*from ['"]\.\/agent-experiments\.js['"]/);
  assert.match(experiments, /Object\.freeze\s*\(\s*\{[\s\S]*\.\.\.agentExperimentRenderers[\s\S]*\}\s*\)/);
  assert.doesNotMatch(`${experiments}\n${agentExperiments}\n${harnessExperiments}`, /\.innerHTML\s*=|insertAdjacentHTML|setAttribute\(['"]on/i);

  for (const selector of ['.agent-status-stamp', '.agent-decision-ledger', '.tool-invocation', '.tool-error-list']) {
    assert.ok(styles.includes(selector), `missing Agent lab style ${selector}`);
  }
  assert.match(styles, /\.agent-status-stamp\[data-status="(?:ready|continue)"\][^{]*\{[^}]*--stamp-color:\s*var\(--color-forest\)/s);
  assert.match(styles, /\.agent-status-stamp\[data-status="(?:invalid|blocked)"\][^{]*\{[^}]*--stamp-color:\s*var\(--color-vermilion\)/s);
  assert.match(styles, /@media\s*\(max-width\s*:\s*40rem\)[\s\S]*\.agent-control-input[^{]*\{[^}]*width:\s*100%/s);
  assert.match(styles, /@media\s*\(max-width\s*:\s*22rem\)[\s\S]*\.agent-decision-ledger/s);
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
  for (const module of modules.filter((candidate) => candidate.status === 'planned')) {
    assert.ok(readme.includes(module.title), `README should identify planned module ${module.title}`);
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

test('release guide records LLM and Agent knowledge-note scope with only Harness and Context fallback', async () => {
  const readme = await read('README.md');
  const status = markdownSection(readme, '当前状态');
  const architecture = markdownSection(readme, '架构与数据流');
  const primaryTextbookStatement = markdownParagraphContaining(status, '主教材');
  const fallbackStatement = markdownParagraphContaining(status, '`explanations`');

  for (const title of ['LLM 基础', 'Agent 机制']) {
    assert.match(
      primaryTextbookStatement,
      new RegExp(`${escapeRegExp(title)}[^\\n]{0,50}(?:八|8)课[^\\n]{0,50}(?:站内)?知识笔记[^\\n]{0,40}主教材`),
      `README should state that all eight ${title} lessons use in-site knowledge notes as the primary textbook`,
    );
  }
  assert.match(
    status,
    /外部(?:学习)?资料[^\n]{0,50}依据[^\n]{0,30}交叉核验[^\n]{0,30}扩展/,
    'README should position external resources as evidence, cross-checks and extensions',
  );
  for (const title of ['Agent Harness', '上下文、RAG 与记忆']) {
    assert.ok(fallbackStatement.includes(title), `README should preserve the explanations fallback for ${title}`);
  }
  for (const title of ['LLM 基础', 'Agent 机制']) {
    assert.ok(!fallbackStatement.includes(title),
      `README should not describe ${title} as an explanations fallback`);
  }
  assert.match(fallbackStatement, /尚未迁移[^\n]{0,20}同等长文/);
  assert.doesNotMatch(readme, /这个试点目前只覆盖 `llm-01`/);
  assert.doesNotMatch(readme, /LLM 第一课知识笔记试点/);
  assert.ok(architecture.includes('`src/data/llm-foundation-notes/`'));
  assert.match(architecture, /`src\/data\/llm-foundation-notes\.js`[^\n]{0,30}(?:聚合|汇总)入口/);
  assert.ok(architecture.includes('`src/data/agent-mechanism-notes/`'));
  assert.match(architecture, /`src\/data\/agent-mechanism-notes\.js`[^\n]{0,30}(?:聚合|汇总)入口/);
});

test('release guide publishes every active registered course with data-derived counts and canonical routes', async () => {
  const readme = await read('README.md');
  const status = markdownSection(readme, '当前状态');
  const activeModules = modules.filter((module) => module.status === 'active');
  const activeCourses = Object.values(courseRegistry);

  assert.deepEqual(
    activeCourses.map((course) => course.id).sort(),
    activeModules.map((module) => module.id).sort(),
    'active modules and registered courses should be the same set',
  );
  assert.match(
    status,
    new RegExp(`当前有${countPattern(activeCourses.length)}个完整模块`),
  );
  for (const course of activeCourses) {
    const module = activeModules.find((candidate) => candidate.id === course.id);
    const line = status.split('\n').find((candidate) => candidate.includes(course.title));
    const quizCount = course.lessons.reduce((total, lesson) => total + lesson.quiz.length, 0);
    const experimentCount = course.lessons.filter((lesson) => lesson.exercise.experiment).length;

    assert.equal(course.title, module.title, `${course.id} catalog and course titles should agree`);
    assert.ok(line, `README should publish ${course.title} status`);
    assert.match(line, /(?:完整|完成)/, `${course.title} should be complete`);
    assert.match(line, new RegExp(`${course.lessons.length}\\s*节课程`));
    assert.match(line, new RegExp(`${course.resources.length}\\s*(?:份|条)[^，。；]*资源`));
    assert.match(line, new RegExp(`${course.interviewQuestions.length}\\s*(?:道|条)[^，。；]*面试`));
    assert.match(line, new RegExp(`${quizCount}\\s*(?:道|个)?\\s*quiz`, 'i'));
    assert.match(line, new RegExp(`${experimentCount}\\s*(?:个|项)[^，。；]*交互实验`));
  }

  for (const course of activeCourses) {
    for (const route of [
      `#${course.id}/dashboard`,
      `#${course.id}/lesson/${course.lessons[0].id}`,
    ]) {
      assert.ok(readme.includes(route), `README should document route ${route}`);
    }
  }
});

test('release guide maps all Agent lessons and its three interactive labs', async () => {
  const readme = await read('README.md');
  const map = markdownSection(readme, 'Agent 机制课程地图');

  for (const lesson of agentMechanism.lessons) {
    assert.ok(map.includes(`\`${lesson.id}\``), `README should list ${lesson.id}`);
    assert.ok(map.includes(lesson.title), `README should name ${lesson.title}`);
  }
  for (const lab of [
    ['tool-contract', '工具契约检查台'],
    ['agent-loop', 'Agent Loop 决策台'],
    ['plan-recovery', '计划恢复棋盘'],
  ]) {
    assert.ok(map.includes(`\`${lab[0]}\``), `README should list ${lab[0]}`);
    assert.ok(map.includes(lab[1]), `README should name ${lab[1]}`);
  }
});

test('release guide maps all Harness lessons, labs and deterministic simulation boundary', async () => {
  const readme = await read('README.md');
  const map = markdownSection(readme, 'Agent Harness 课程地图');

  for (const lesson of agentHarness.lessons) {
    assert.ok(map.includes(`\`${lesson.id}\``), `README should list ${lesson.id}`);
    assert.ok(map.includes(lesson.title), `README should name ${lesson.title}`);
  }
  for (const [lessonId, experimentId] of [
    ['harness-01', 'run-lifecycle'],
    ['harness-06', 'retry-resume'],
    ['harness-07', 'queue-backpressure'],
  ]) {
    const mappingLine = map.split('\n').find((line) => (
      line.includes(`\`${lessonId}\``) && line.includes(`\`${experimentId}\``)
    ));
    assert.ok(mappingLine, `README should map ${experimentId} to ${lessonId}`);
  }
  assert.match(map, /确定性模拟[^\n]{0,180}(?:真实 worker|真实持久层)[^\n]{0,180}(?:真实外部系统|真实队列)/i);
});

test('release guide maps every Context RAG and Memory lesson, lab and responsibility boundary', async () => {
  const readme = await read('README.md');
  const map = markdownSection(readme, '上下文、RAG 与记忆课程地图');

  for (const lesson of contextRagMemory.lessons) {
    assert.ok(map.includes(`\`${lesson.id}\``), `README should list ${lesson.id}`);
    assert.ok(map.includes(lesson.title), `README should name ${lesson.title}`);
  }
  for (const [lessonId, experimentId] of [
    ['context-02', 'context-router'],
    ['context-05', 'hybrid-retrieval'],
    ['context-07', 'memory-lifecycle'],
  ]) {
    const mappingLine = map.split('\n').find((line) => (
      line.includes(`\`${lessonId}\``) && line.includes(`\`${experimentId}\``)
    ));
    assert.ok(mappingLine, `README should map ${experimentId} to ${lessonId}`);
  }

  for (const file of [
    'src/data/context-rag-memory.js',
    'src/core/context-rag-memory.js',
    'src/ui/context-experiments.js',
  ]) {
    assert.ok(readme.includes(file), `README should document ${file}`);
  }
  assert.match(map, /RAG[^\n]{0,80}(?:不等同于|不是)向量数据库/i);
  assert.match(map, /RAG[^\n]{0,100}(?:不能|不承诺)[^\n]{0,30}(?:消除|杜绝)幻觉/i);
  assert.match(map, /教学[^\n]{0,30}记忆[^\n]{0,60}(?:不代表|不等于|不能证明)[^\n]{0,30}(?:隐私合规|合规)/i);
  for (const boundary of ['context projection', 'retrieval corpus', 'long-term memory', 'checkpoint', 'Harness']) {
    assert.match(map, new RegExp(escapeRegExp(boundary), 'i'), `README should distinguish ${boundary}`);
  }
});

test('release guide records multi-module state isolation and evidence labels as completed facts', async () => {
  const readme = await read('README.md');

  assert.match(readme, /内容\s*ID[^\n]{0,50}全局唯一/);
  assert.match(readme, /汇总[^\n]{0,50}当前(?:\s*course|课程)/i);
  assert.match(readme, /重置[^\n]{0,80}(?:整个|整份)[^\n]{0,40}agent-learner:progress:v1/);
  for (const stateName of [
    'resourceFiltersByModule',
    'interviewFiltersByModule',
    'revealedInterviewIdsByModule',
  ]) {
    assert.match(readme, new RegExp(`\\b${stateName}\\b[^\\n]{0,80}moduleId|moduleId[^\\n]{0,80}\\b${stateName}\\b`));
  }
  for (const label of ['来源', '类型', '难度', '阶段', '学习价值', 'verifiedAt']) {
    assert.ok(readme.includes(label), `README should document resource evidence label ${label}`);
  }
  for (const file of [
    'src/data/llm-foundation.js',
    'src/data/agent-mechanism.js',
    'src/data/agent-harness.js',
    'courseRegistry',
    'src/core/agent-harness.js',
    'src/ui/harness-experiments.js',
    'core/agent-mechanism.js',
    'ui/agent-experiments.js',
  ]) {
    assert.ok(readme.includes(file), `README should document ${file}`);
  }
});

test('release guide marks complete modules active and derives every planned module from the catalog', async () => {
  const readme = await read('README.md');
  const boundary = markdownSection(readme, '模块路线图与边界');
  const harnessBoundary = markdownParagraphContaining(boundary, '**Agent Harness**');
  const contextBoundary = markdownParagraphContaining(boundary, '**上下文、RAG 与记忆**');
  const activeModules = modules.filter((module) => module.status === 'active');
  const plannedModules = modules.filter((module) => module.status === 'planned');

  assert.match(harnessBoundary, /Agent Harness[^\n]{0,160}(?:active|已开放)/i);
  assert.match(contextBoundary, /上下文、RAG 与记忆[^\n]{0,220}(?:active|已开放)/i);
  for (const scope of ['宿主 Runner', 'Run State', 'Event Log', 'Checkpoint', '权限', '人工审批', 'Sandbox', 'Budget', 'Timeout', 'Retry', 'Cancel', '幂等', 'Resume', '并发', '队列', '背压', 'Blocked', 'HITL', 'Handoff', '运行产物']) {
    assert.match(harnessBoundary, new RegExp(scope, 'i'), `README should define Harness scope: ${scope}`);
  }
  assert.match(harnessBoundary, /不提前覆盖[^。]{0,80}RAG[^。]{0,30}长期记忆/i);
  for (const later of ['完整后端服务', '系统化评测治理', '多 Agent 协议']) {
    assert.match(harnessBoundary, new RegExp(later, 'i'), `README should keep ${later} outside Harness`);
  }
  assert.match(
    boundary,
    new RegExp(`以下${countPattern(plannedModules.length)}个模块[^\\n]{0,40}(?:仍未开放|仍只有目录与依赖元数据|规划中)`),
  );
  for (const module of plannedModules) {
    assert.match(
      boundary,
      new RegExp(`${escapeRegExp(module.title)}[^\\n]{0,30}(?:planned|规划中)`, 'i'),
      `README should identify planned module ${module.title}`,
    );
  }
  assert.equal(
    boundary.split('\n').filter((line) => /(?:planned|规划中)/i.test(line)).length,
    plannedModules.length,
  );
  for (const module of activeModules) {
    assert.doesNotMatch(
      readme,
      new RegExp(`${escapeRegExp(module.title)}[^\\n]{0,30}(?:planned|规划中)`, 'i'),
      `active module ${module.title} should not be described as planned`,
    );
  }

  const staleActiveCount = activeModules.length - 1;
  const stalePlannedCount = plannedModules.length + 1;
  assert.doesNotMatch(
    readme,
    new RegExp(
      `${countPattern(staleActiveCount)}个完整模块|(?:其余|剩余)${countPattern(stalePlannedCount)}个[^\\n]{0,20}(?:planned|规划中|仍未开放)`,
      'i',
    ),
  );
});

test('release guide labels Harness evidence limits without judging uncollected platforms', async () => {
  const readme = await read('README.md');
  const evidence = markdownSection(readme, '资源准入与核验');

  assert.match(evidence, /官方 SDK[^\n]{0,80}当前实现语义/);
  assert.match(evidence, /checkpoint\s*\/\s*replay[^\n]{0,80}不可外推/i);
  assert.match(evidence, /durable[^\n]{0,80}不保证[^\n]{0,80}exactly-once/i);
  assert.match(evidence, /厂商文章[^\n]{0,80}工程经验/);
  assert.match(evidence, /视频[^\n]{0,50}(?:仅|只)[^\n]{0,20}补充/);
  assert.match(evidence, /小红书[^\n]{0,80}无稳定公开核验链接[^\n]{0,80}未收录/);
  assert.doesNotMatch(evidence, /小红书[^\n]{0,50}(?:无|没有)[^\n]{0,20}优质内容/);
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
  assert.match(styles, /@media\s*\(max-width\s*:\s*40rem\)[\s\S]*?\.text-action\s*\{[^}]*min-height\s*:\s*2\.75rem/is);
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
