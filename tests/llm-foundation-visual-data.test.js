import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import { validateRenderableVisual } from '../src/ui/knowledge-visual.js';
import { llmFoundationVisualFixtures } from './fixtures/llm-foundation-visual-fixtures.js';
import {
  assertSafeStaticSvg,
  parseStrictSvg,
} from './helpers/static-svg.js';
import { validateKnowledgeVisualOwnership } from './helpers/visual-registry.js';

const FIELD_MAP_ID = 'visual-llm-01-field-map';
const FIELD_MAP_PATH = 'assets/visuals/llm-foundation/llm-01-field-map.svg';
const EXPECTED_VISUALS = Object.freeze({
  'visual-llm-01-field-map': {
    lessonId: 'llm-01',
    sectionId: 'map-the-field',
    kind: 'diagram',
    role: 'overview',
    tags: ['relationship', 'boundary'],
    sourceIds: ['res-ms-ai', 'res-ms-genai', 'res-hf-llm'],
  },
  'visual-llm-01-learning-loop': {
    lessonId: 'llm-01',
    sectionId: 'minimal-learning-loop',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-ms-ai', 'res-hf-llm'],
  },
  'visual-llm-01-autoregressive-generation': {
    lessonId: 'llm-01',
    sectionId: 'from-generation-to-llm',
    kind: 'step-diagram',
    role: 'process',
    tags: ['mechanism'],
    sourceIds: ['res-ms-genai', 'res-hf-llm', 'res-ms-ai'],
    fixtureId: 'fixture-llm-01-autoregressive-generation',
  },
  'visual-llm-01-training-inference-boundary': {
    lessonId: 'llm-01',
    sectionId: 'training-versus-inference',
    kind: 'diagram',
    role: 'comparison',
    tags: ['boundary'],
    sourceIds: ['res-ms-genai', 'res-hf-llm', 'res-ms-ai'],
  },
  'visual-llm-01-application-decision-stack': {
    lessonId: 'llm-01',
    sectionId: 'model-and-application-boundary',
    kind: 'diagram',
    role: 'decision',
    tags: ['failure-mode'],
    sourceIds: ['res-ms-genai', 'res-hf-llm', 'res-openai-agents'],
  },
  'visual-llm-02-training-cycle': {
    lessonId: 'llm-02',
    sectionId: 'training-loop-and-tensor-shapes',
    kind: 'diagram',
    role: 'overview',
    tags: ['process'],
    sourceIds: ['res-d2l-zh', 'res-karpathy', 'res-fastai'],
    fixtureId: 'fixture-llm-02-training-cycle',
  },
  'visual-llm-02-neuron-forward': {
    lessonId: 'llm-02',
    sectionId: 'linear-layers-and-activation',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['comparison'],
    sourceIds: ['res-google-ml', 'res-d2l-zh', 'res-fastai'],
    fixtureId: 'fixture-llm-02-neuron-forward',
  },
  'visual-llm-02-backprop-graph': {
    lessonId: 'llm-02',
    sectionId: 'computation-graph-chain-rule-backprop',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-d2l-zh', 'res-karpathy', 'res-3b1b-nn'],
    fixtureId: 'fixture-llm-02-backprop-graph',
  },
  'visual-llm-02-learning-rate-trajectories': {
    lessonId: 'llm-02',
    sectionId: 'optimizer-learning-rate-and-zero-grad',
    kind: 'diagram',
    role: 'comparison',
    tags: ['failure-mode'],
    sourceIds: ['res-d2l-zh', 'res-google-ml', 'res-fastai', 'res-karpathy'],
    fixtureId: 'fixture-llm-02-learning-rate-trajectories',
  },
  'visual-llm-02-generalization-curves': {
    lessonId: 'llm-02',
    sectionId: 'generalization-and-training-diagnosis',
    kind: 'diagram',
    role: 'boundary',
    tags: ['decision'],
    sourceIds: ['res-google-ml', 'res-d2l-zh', 'res-karpathy'],
    fixtureId: 'fixture-llm-02-generalization-curves',
  },
});
const EXPECTED_VISUAL_IDS = Object.freeze(Object.keys(EXPECTED_VISUALS));
const FIXTURES_BY_ID = new Map(
  llmFoundationVisualFixtures.map((fixture) => [fixture.id, fixture]),
);

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

test('publishes exactly five frozen visual references per llm-01/02 lesson with all coverage groups', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.deepEqual(
    llmFoundationVisuals.map(({ id }) => id).sort(),
    [...EXPECTED_VISUAL_IDS].sort(),
    '01–02 registry 必须精确使用冻结的十个 visual ID',
  );
  assert.equal(llmFoundationVisuals.length, 10);

  for (const lessonId of ['llm-01', 'llm-02']) {
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    const references = [
      lesson.knowledgeNote.overviewVisualId,
      ...lesson.knowledgeNote.sections.flatMap((section) =>
        (section.visuals ?? []).map(({ visualId }) => visualId),
      ),
    ].filter(Boolean);
    assert.equal(references.length, 5, `${lessonId} 必须恰好引用五张图`);
    assert.equal(new Set(references).size, 5, `${lessonId} 的视觉引用必须唯一`);

    const roles = references.map((id) => EXPECTED_VISUALS[id]?.role);
    assert.ok(roles.includes('overview'), `${lessonId} 缺少 overview coverage`);
    assert.ok(
      roles.some((role) => ['mechanism', 'process'].includes(role)),
      `${lessonId} 缺少 mechanism coverage`,
    );
    assert.ok(
      roles.some((role) =>
        ['boundary', 'comparison', 'decision'].includes(role),
      ),
      `${lessonId} 缺少 boundary coverage`,
    );
  }
});

test('places every published llm-01/02 visual once in its evidence-owning real section', async () => {
  const { knowledgeVisuals } = await loadRegistry();
  const result = await validateKnowledgeVisualOwnership({
    courseRegistry: { 'llm-foundation': llmFoundation },
    knowledgeVisuals,
    assetExists: async (assetPath) => {
      await access(assetPath);
      return true;
    },
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.placements.length, 10);

  const placementsById = new Map(
    result.placements.map((placement) => [placement.visualId, placement]),
  );
  for (const [visualId, expected] of Object.entries(EXPECTED_VISUALS)) {
    const placement = placementsById.get(visualId);
    assert.ok(placement, visualId);
    assert.equal(placement.lessonId, expected.lessonId, visualId);
    assert.equal(placement.sectionId, expected.sectionId, visualId);
  }

  const llm02 = llmFoundation.lessons.find(({ id }) => id === 'llm-02');
  assert.equal(llm02.knowledgeNote.overviewVisualId, 'visual-llm-02-training-cycle');
  assert.equal(
    llm02.knowledgeNote.overviewVisualSectionId,
    'training-loop-and-tensor-shapes',
  );

  for (const lesson of llmFoundation.lessons.filter(({ id }) =>
    ['llm-01', 'llm-02'].includes(id),
  )) {
    for (const section of lesson.knowledgeNote.sections) {
      for (const placement of section.visuals ?? []) {
        assert.ok(Number.isInteger(placement.afterParagraph));
        assert.ok(placement.afterParagraph >= 0);
        assert.ok(placement.afterParagraph < section.paragraphs.length);
      }
    }
  }
});

test('keeps all ten llm-01/02 registry records aligned with frozen roles, tags, sources and fixtures', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.equal(llmFoundationVisuals.length, 10);
  const countByLesson = new Map();

  for (const visual of llmFoundationVisuals) {
    const expected = EXPECTED_VISUALS[visual.id];
    assert.ok(expected, `${visual.id} 不在冻结清单`);
    countByLesson.set(
      expected.lessonId,
      (countByLesson.get(expected.lessonId) ?? 0) + 1,
    );
    assert.equal(visual.kind, expected.kind, visual.id);
    assert.equal(visual.role, expected.role, visual.id);
    assert.deepEqual(visual.tags, expected.tags, visual.id);
    assert.deepEqual(visual.sourceIds, expected.sourceIds, visual.id);
    assert.equal(visual.provenance, 'original-synthesis', visual.id);
    assert.equal(visual.credit, 'Agent Learner 原创教学图解', visual.id);
    assert.equal(visual.permission, null, visual.id);
    assert.equal(visual.verifiedAt, '2026-07-26', visual.id);
    assert.equal(visual.fixtureId, expected.fixtureId, visual.id);
    if (expected.fixtureId) {
      assert.equal(FIXTURES_BY_ID.get(expected.fixtureId)?.visualId, visual.id);
    }
  }
  assert.deepEqual(Object.fromEntries(countByLesson), {
    'llm-01': 5,
    'llm-02': 5,
  });
});

test('keeps the autoregressive generation main sequence and three cumulative steps renderable and ordered', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById['visual-llm-01-autoregressive-generation'];
  assert.equal(visual.kind, 'step-diagram');
  assert.ok(visual.steps.length >= 3);
  assert.equal(validateRenderableVisual(visual).valid, true);
  assert.deepEqual(
    visual.steps.map(({ id, title }) => ({ id, title })),
    [
      { id: 'tokenize', title: '编码：文本变成 token ID' },
      { id: 'select', title: '选择：读取下一 token 分布' },
      { id: 'append', title: '追加：新 token 成为下一步上下文' },
    ],
  );
  assert.deepEqual(
    visual.steps.map(({ assetPath }) => assetPath),
    [
      'assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-1.svg',
      'assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-2.svg',
      'assets/visuals/llm-foundation/llm-01-autoregressive-generation-step-3.svg',
    ],
  );
});

function fixtureForVisual(visualId) {
  const expected = EXPECTED_VISUALS[visualId];
  const fixture = FIXTURES_BY_ID.get(expected.fixtureId);
  assert.ok(fixture, `${visualId} fixture 必须存在`);
  return fixture;
}

function fixed(values, digits) {
  return values.map((value) => Number(value).toFixed(digits)).join(' / ');
}

function assertSvgIncludes(svg, fragment) {
  assert.ok(svg.includes(fragment), `SVG 必须包含 fixture 文本：${fragment}`);
}

test('encodes every llm-01/02 quantitative fixture input, result and rounding in SVG text', async () => {
  const checks = {
    'visual-llm-01-autoregressive-generation': (fixture, svg) => {
      assertSvgIncludes(svg, fixture.data.rawPrompt);
      assertSvgIncludes(svg, fixture.result.encodedIds.join(' / '));
      fixture.result.probabilities.forEach((probability) =>
        assertSvgIncludes(svg, probability.toFixed(4)),
      );
      assertSvgIncludes(svg, `ID ${fixture.result.selectedId}`);
      assertSvgIncludes(svg, fixture.result.nextToken);
    },
    'visual-llm-02-training-cycle': (fixture, svg) => {
      assertSvgIncludes(svg, `X ${JSON.stringify(fixture.data.X)}`);
      assertSvgIncludes(svg, `Z ${JSON.stringify(fixture.result.Z)}`);
      assertSvgIncludes(svg, `loss ${fixture.result.loss.toFixed(6)}`);
      assertSvgIncludes(svg, `dW ${JSON.stringify(fixture.result.dW)}`);
      assertSvgIncludes(svg, `new W ${JSON.stringify(fixture.result.newW)}`);
      assertSvgIncludes(svg, `new loss ${fixture.result.newLoss.toFixed(6)}`);
    },
    'visual-llm-02-neuron-forward': (fixture, svg) => {
      assertSvgIncludes(svg, `x ${fixture.data.x}`);
      assertSvgIncludes(svg, `w ${fixture.data.w}`);
      assertSvgIncludes(svg, `z ${fixture.result.z.toFixed(4)}`);
      assertSvgIncludes(svg, `p ${fixture.result.probability.toFixed(4)}`);
      assertSvgIncludes(svg, `loss ${fixture.result.loss.toFixed(4)}`);
    },
    'visual-llm-02-backprop-graph': (fixture, svg) => {
      assertSvgIncludes(svg, `x ${fixture.data.x}`);
      assertSvgIncludes(svg, `w ${fixture.data.w}`);
      assertSvgIncludes(svg, `a ${fixture.result.forward.a}`);
      assertSvgIncludes(svg, `L ${fixture.result.forward.loss}`);
      assertSvgIncludes(
        svg,
        `${fixture.result.pathContributionsToX.viaA} + `
        + `${fixture.result.pathContributionsToX.viaB} = `
        + `${fixture.result.accumulated.dLossDx}`,
      );
      assertSvgIncludes(svg, `dL/dw ${fixture.result.accumulated.dLossDw}`);
    },
    'visual-llm-02-learning-rate-trajectories': (fixture, svg) => {
      for (const trajectory of fixture.result.trajectories) {
        assertSvgIncludes(svg, `η ${trajectory.learningRate}`);
        assertSvgIncludes(
          svg,
          `权重为 ${trajectory.weights.map((value) => value.toFixed(3)).join('、')}`,
        );
        assertSvgIncludes(
          svg,
          `损失为 ${trajectory.losses.map((value) => value.toFixed(4)).join('、')}`,
        );
      }
    },
    'visual-llm-02-generalization-curves': (fixture, svg) => {
      assertSvgIncludes(svg, `epoch ${fixture.data.epochs.join(' / ')}`);
      for (const series of Object.values(fixture.data.series)) {
        assertSvgIncludes(
          svg,
          `train 为 ${series.train.map((value) => value.toFixed(2)).join('、')}`,
        );
        assertSvgIncludes(
          svg,
          `validation 为 ${series.validation.map((value) => value.toFixed(2)).join('、')}`,
        );
      }
      assertSvgIncludes(svg, `最佳 epoch ${fixture.result.overfit.bestEpoch}`);
      assertSvgIncludes(
        svg,
        `分叉始于 epoch ${fixture.result.overfit.divergenceStartsAtEpoch}`,
      );
      assert.match(svg, /教学示例 · 非实测/);
    },
  };

  const { knowledgeVisualsById } = await loadRegistry();
  for (const [visualId, assertFixtureText] of Object.entries(checks)) {
    const visual = knowledgeVisualsById[visualId];
    const fixture = fixtureForVisual(visualId);
    const svg = await readFile(visual.assetPath, 'utf8');
    assertSvgIncludes(svg, fixture.fields.Rounding);
    assertFixtureText(fixture, svg);
  }
});

test('keeps every llm-01/02 SVG label at least 26px with a 32px viewBox safety margin', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  for (const visual of llmFoundationVisuals) {
    for (const assetPath of assetPathsFor(visual)) {
      const svg = await readFile(assetPath, 'utf8');
      const parsed = assertSafeStaticSvg(svg, visual, assetPath);
      for (const textNode of parsed.elementsByName.get('text') ?? []) {
        const fontSize = unsignedIntegerAttribute(
          textNode,
          'font-size',
          `${assetPath}:${textNode.text}`,
        );
        const x = unsignedIntegerAttribute(textNode, 'x', `${assetPath}:${textNode.text}`);
        const y = unsignedIntegerAttribute(textNode, 'y', `${assetPath}:${textNode.text}`);
        assert.ok(fontSize >= 26n, `${assetPath}:${textNode.text} 字号小于 26`);
        assert.ok(x >= 32n && x <= 1168n, `${assetPath}:${textNode.text} 横向越界`);
        assert.ok(y >= 32n && y <= 643n, `${assetPath}:${textNode.text} 纵向越界`);
      }
    }
  }
});
