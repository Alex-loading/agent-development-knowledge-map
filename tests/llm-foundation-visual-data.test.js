import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import {
  assertSafeStaticSvg,
  parseStrictSvg,
} from './helpers/static-svg.js';

const FIELD_MAP_ID = 'visual-llm-01-field-map';
const FIELD_MAP_PATH = 'assets/visuals/llm-foundation/llm-01-field-map.svg';

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

function unsignedIntegerAttribute(node, attribute, label) {
  const value = node.attributes.get(attribute);
  assert.match(value ?? '', /^[0-9]+$/, `${label}.${attribute} 必须是无单位非负整数`);
  return BigInt(value);
}

test('publishes the frozen llm-01 overview visual and explicit owner section', () => {
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');
  assert.equal(lesson.knowledgeNote.overviewVisualId, FIELD_MAP_ID);
  assert.equal(lesson.knowledgeNote.overviewVisualSectionId, 'map-the-field');
  assert.ok(
    lesson.knowledgeNote.sections.some(({ id }) => id === 'map-the-field'),
    'overview owner 必须是真实 section',
  );
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

test('registers the frozen field-map metadata and two-panel boundary exactly once', async () => {
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
    alt: 'AI 外框内有方法轴与生成能力轴两个面板：左侧显示机器学习包含深度学习，并把搜索规划放在机器学习外；右侧并列语言与图像音频生成，LLM 通过连线关联深度学习和语言生成。',
    longDescription: '整张图由人工智能 AI 外框包围。左侧方法轴中，机器学习框位于 AI 内，深度学习框位于机器学习内；搜索与规划位于 AI 内但在机器学习外，说明 AI 还包含非学习方法。右侧生成能力轴中，生成式 AI 虚线框包含语言生成和图像音频生成；LLM 位于语言生成区域，并用明确连线连接左侧深度学习。视觉与语音标签位于深度学习中但不属于 LLM，说明深度学习不只处理语言。底部图例用实线、虚线和斜线阴影分别表示方法包含、生成能力与两轴交叉。',
    caption: 'AI 覆盖两条分类轴：LLM 连接深度学习与语言生成，但 AI、深度学习和生成式 AI 不是一条同义嵌套链。',
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

test('keeps LLM registry IDs and paths aligned with their lessons', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();

  for (const visual of llmFoundationVisuals) {
    const lessonId = /^visual-(llm-\d{2})-/.exec(visual.id)?.[1];
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    assert.ok(lesson, `${visual.id}: visual ID 必须带真实 LLM lesson 前缀`);
    assert.match(
      visual.assetPath,
      new RegExp(`^assets/visuals/llm-foundation/${lesson.id}-`),
      `${visual.id}: assetPath 必须与 LLM lesson 对齐`,
    );
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

test('keeps every published SVG accessible and free from active or remote content', async () => {
  const { knowledgeVisuals } = await loadRegistry();
  for (const visual of knowledgeVisuals) {
    for (const assetPath of assetPathsFor(visual).filter((path) => path.endsWith('.svg'))) {
      const svg = await readFile(assetPath, 'utf8');
      assertSafeStaticSvg(svg, visual, assetPath);
    }
  }
});

test('field map keeps both axes and every core label inside one readable AI universe', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById[FIELD_MAP_ID];
  const svg = await readFile(FIELD_MAP_PATH, 'utf8');
  const parsed = parseStrictSvg(svg, FIELD_MAP_PATH);
  const byRegion = (region) => parsed.elements.find(
    (node) => node.attributes.get('data-region') === region,
  );
  const numericBox = (region) => {
    const node = byRegion(region);
    assert.equal(node?.name, 'rect', `${region} 必须是可检查的 rect`);
    return {
      x: unsignedIntegerAttribute(node, 'x', region),
      y: unsignedIntegerAttribute(node, 'y', region),
      width: unsignedIntegerAttribute(node, 'width', region),
      height: unsignedIntegerAttribute(node, 'height', region),
    };
  };
  const contains = (outer, inner) => (
    inner.x >= outer.x
    && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height
  );

  const aiUniverse = numericBox('ai-universe');
  const methodPanel = numericBox('method-panel');
  const capabilityPanel = numericBox('capability-panel');
  const machineLearning = numericBox('machine-learning');
  const deepLearning = numericBox('deep-learning');
  const searchPlanning = numericBox('search-planning');
  const generativeAi = numericBox('generative-ai');
  const llm = numericBox('llm');
  assert.ok(contains(aiUniverse, methodPanel), 'AI 必须覆盖方法面板');
  assert.ok(contains(aiUniverse, capabilityPanel), 'AI 必须覆盖生成能力面板');
  assert.ok(contains(machineLearning, deepLearning), 'DL 必须位于 ML 内');
  assert.ok(!contains(machineLearning, searchPlanning), '搜索/规划必须位于 AI 内、ML 外');
  assert.ok(contains(capabilityPanel, generativeAi), '生成式 AI 不得超出 AI 内的能力面板');
  assert.ok(contains(generativeAi, llm), 'LLM 必须位于语言生成所属的生成式 AI 区域');
  assert.equal(byRegion('dl-to-llm')?.name, 'line', 'DL 与 LLM 必须有明确连接');

  for (const textNode of parsed.elementsByName.get('text') ?? []) {
    const fontSize = unsignedIntegerAttribute(textNode, 'font-size', textNode.text);
    const x = unsignedIntegerAttribute(textNode, 'x', textNode.text);
    const y = unsignedIntegerAttribute(textNode, 'y', textNode.text);
    const estimatedWidth = BigInt([...textNode.text].length) * fontSize * 62n / 100n;
    const anchor = textNode.attributes.get('text-anchor') ?? 'start';
    const left = anchor === 'middle' ? x - estimatedWidth / 2n : x;
    const right = anchor === 'middle' ? x + estimatedWidth / 2n : x + estimatedWidth;
    assert.ok(fontSize >= 26n, `${textNode.text}: font-size 必须至少 26`);
    assert.ok(left >= 32n, `${textNode.text}: 左侧必须留足边距`);
    assert.ok(right <= BigInt(visual.width) - 32n, `${textNode.text}: 右侧不得裁切`);
    assert.ok(
      y >= 32n && y <= BigInt(visual.height) - 32n,
      `${textNode.text}: 垂直位置必须在 viewBox 内`,
    );
  }
});

test('field map preserves the frozen reading order, encodings and counterexamples', async () => {
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
    '深度学习 × 语言生成',
  ]) {
    assert.match(svg, new RegExp(term), term);
  }
  assert.match(svg, /data-region="method-panel"/);
  assert.match(svg, /data-region="capability-panel"/);
  assert.match(svg, /fill="url\(#cross-hatch\)"/);
  assert.match(svg, /stroke-dasharray=/);
  assert.match(svg, /实线嵌套：方法包含/);
  assert.match(svg, /虚线边界：生成能力/);
  assert.match(svg, /斜线阴影：两轴交叉/);
});
