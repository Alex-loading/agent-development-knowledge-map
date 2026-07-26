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
  'visual-llm-03-text-to-context': {
    lessonId: 'llm-03',
    sectionId: 'token-and-tokenizer',
    kind: 'diagram',
    role: 'overview',
    tags: ['process'],
    sourceIds: ['res-tiktoken', 'res-hf-llm', 'res-rasbt', 'res-openai-cookbook'],
    fixtureId: 'fixture-llm-03-text-to-context',
  },
  'visual-llm-03-tokenization-comparison': {
    lessonId: 'llm-03',
    sectionId: 'token-and-tokenizer',
    kind: 'diagram',
    role: 'comparison',
    tags: ['boundary'],
    sourceIds: ['res-tiktoken', 'res-hf-llm', 'res-rasbt', 'res-openai-cookbook'],
    fixtureId: 'fixture-llm-03-tokenization-comparison',
  },
  'visual-llm-03-embedding-position-space': {
    lessonId: 'llm-03',
    sectionId: 'ids-to-embeddings',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['relationship'],
    sourceIds: ['res-hf-llm', 'res-rasbt', 'res-3b1b-transformer', 'res-ms-genai'],
    fixtureId: 'fixture-llm-03-embedding-position-space',
  },
  'visual-llm-03-context-budget': {
    lessonId: 'llm-03',
    sectionId: 'context-and-shared-budget',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['boundary'],
    sourceIds: ['res-openai-cookbook', 'res-hf-llm', 'res-ms-genai'],
    fixtureId: 'fixture-llm-03-context-budget',
  },
  'visual-llm-03-context-strategy-matrix': {
    lessonId: 'llm-03',
    sectionId: 'context-strategy-tradeoffs',
    kind: 'diagram',
    role: 'decision',
    tags: ['failure-mode', 'tradeoff'],
    sourceIds: ['res-openai-cookbook', 'res-ms-genai', 'res-llm-universe', 'res-hf-llm'],
  },
  'visual-llm-04-decoder-block': {
    lessonId: 'llm-04',
    sectionId: 'decoder-block-information-flow',
    kind: 'diagram',
    role: 'overview',
    tags: ['process', 'boundary'],
    sourceIds: ['res-attention-paper', 'res-rasbt', 'res-limu-transformer', 'res-happy-llm'],
  },
  'visual-llm-04-qkv-flow': {
    lessonId: 'llm-04',
    sectionId: 'qkv-query-match-aggregate',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-3b1b-attention', 'res-attention-paper', 'res-rasbt'],
    fixtureId: 'fixture-llm-04-qkv-flow',
  },
  'visual-llm-04-score-mask-softmax': {
    lessonId: 'llm-04',
    sectionId: 'scaled-dot-softmax',
    kind: 'step-diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-attention-paper', 'res-rasbt', 'res-3b1b-attention'],
    fixtureId: 'fixture-llm-04-score-mask-softmax',
  },
  'visual-llm-04-multi-head-merge': {
    lessonId: 'llm-04',
    sectionId: 'multi-head-attention',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['relationship'],
    sourceIds: ['res-attention-paper', 'res-rasbt', 'res-happy-llm'],
    fixtureId: 'fixture-llm-04-multi-head-merge',
  },
  'visual-llm-04-causal-visibility': {
    lessonId: 'llm-04',
    sectionId: 'causal-mask',
    kind: 'diagram',
    role: 'boundary',
    tags: ['failure-mode'],
    sourceIds: ['res-attention-paper', 'res-rasbt', 'res-happy-llm'],
    fixtureId: 'fixture-llm-04-causal-visibility',
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

function finiteNumberAttribute(node, attribute, label) {
  const value = Number(node?.attributes.get(attribute));
  assert.ok(Number.isFinite(value), `${label}.${attribute} 必须是有限数`);
  return value;
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

test('registers the frozen field-map contract and two-panel boundary exactly once', async () => {
  const { knowledgeVisuals, knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById[FIELD_MAP_ID];

  assert.equal(
    knowledgeVisuals.filter(({ id }) => id === FIELD_MAP_ID).length,
    1,
    `${FIELD_MAP_ID} 必须且只能注册一次`,
  );
  assert.deepEqual({
    id: visual.id,
    kind: visual.kind,
    role: visual.role,
    tags: visual.tags,
    sourceIds: visual.sourceIds,
    fixtureId: visual.fixtureId,
    provenance: visual.provenance,
  }, {
    id: FIELD_MAP_ID,
    kind: 'diagram',
    role: 'overview',
    tags: ['relationship', 'boundary'],
    sourceIds: ['res-ms-ai', 'res-ms-genai', 'res-hf-llm'],
    fixtureId: undefined,
    provenance: 'original-synthesis',
  });
  assert.equal(visual.assetPath, FIELD_MAP_PATH);
  assert.match(visual.alt, /方法轴.*生成能力轴/);
  assert.match(visual.longDescription, /搜索与规划.*机器学习外/);
  assert.match(visual.longDescription, /LLM.*深度学习/);
  assert.match(visual.caption, /不是一条同义嵌套链/);
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

test('publishes exactly five frozen visual references per llm-01–04 lesson with all coverage groups', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.deepEqual(
    llmFoundationVisuals.map(({ id }) => id).sort(),
    [...EXPECTED_VISUAL_IDS].sort(),
    '01–04 registry 必须精确使用冻结的二十个 visual ID',
  );
  assert.equal(llmFoundationVisuals.length, 20);

  for (const lessonId of ['llm-01', 'llm-02', 'llm-03', 'llm-04']) {
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

test('places every published llm-01–04 visual once in its evidence-owning real section', async () => {
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
  assert.equal(result.placements.length, 20);

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
  const llm03 = llmFoundation.lessons.find(({ id }) => id === 'llm-03');
  assert.equal(llm03.knowledgeNote.overviewVisualId, 'visual-llm-03-text-to-context');
  assert.equal(llm03.knowledgeNote.overviewVisualSectionId, 'token-and-tokenizer');
  const llm04 = llmFoundation.lessons.find(({ id }) => id === 'llm-04');
  assert.equal(llm04.knowledgeNote.overviewVisualId, 'visual-llm-04-decoder-block');
  assert.equal(
    llm04.knowledgeNote.overviewVisualSectionId,
    'decoder-block-information-flow',
  );

  for (const lesson of llmFoundation.lessons.filter(({ id }) =>
    ['llm-01', 'llm-02', 'llm-03', 'llm-04'].includes(id),
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

test('anchors visuals after the earliest paragraph that completes their teaching prerequisite', () => {
  const expectedAnchors = {
    'visual-llm-01-learning-loop': 2,
    'visual-llm-01-training-inference-boundary': 2,
    'visual-llm-01-application-decision-stack': 2,
    'visual-llm-02-learning-rate-trajectories': 2,
    'visual-llm-02-generalization-curves': 2,
    'visual-llm-03-tokenization-comparison': 1,
    'visual-llm-03-embedding-position-space': 1,
    'visual-llm-03-context-budget': 2,
    'visual-llm-03-context-strategy-matrix': 3,
    'visual-llm-04-qkv-flow': 1,
    'visual-llm-04-score-mask-softmax': 2,
    'visual-llm-04-multi-head-merge': 1,
    'visual-llm-04-causal-visibility': 1,
  };

  for (const lesson of llmFoundation.lessons.filter(({ id }) =>
    ['llm-01', 'llm-02', 'llm-03', 'llm-04'].includes(id),
  )) {
    for (const section of lesson.knowledgeNote.sections) {
      for (const placement of section.visuals ?? []) {
        if (Object.hasOwn(expectedAnchors, placement.visualId)) {
          assert.equal(
            placement.afterParagraph,
            expectedAnchors[placement.visualId],
            `${placement.visualId} 必须放在完整概念定义之后`,
          );
        }
      }
    }
  }
});

test('keeps all twenty llm-01–04 registry records aligned with frozen roles, tags, sources and fixtures', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.equal(llmFoundationVisuals.length, 20);
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
    'llm-03': 5,
    'llm-04': 5,
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

test('keeps score-mask-softmax as four ordered, cumulative and renderable teaching steps', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById['visual-llm-04-score-mask-softmax'];
  assert.equal(visual.kind, 'step-diagram');
  assert.equal(validateRenderableVisual(visual).valid, true);
  assert.deepEqual(
    visual.steps.map(({ id, title }) => ({ id, title })),
    [
      { id: 'project-qkv', title: '投影：表示变成 Q、K、V' },
      { id: 'compare-keys', title: '匹配：Q 比较允许的 K' },
      { id: 'mask-and-normalize', title: '归一：缩放、因果掩码与 softmax' },
      { id: 'aggregate-values', title: '汇总：按权重聚合 V' },
    ],
  );
  assert.deepEqual(
    visual.steps.map(({ assetPath }) => assetPath),
    [1, 2, 3, 4].map(
      (step) =>
        `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-${step}.svg`,
    ),
  );
  for (const step of visual.steps) {
    assert.match(step.description, /[\u3400-\u9fff]/, `${step.id} description 必须是中文`);
    assert.match(step.alt, /[\u3400-\u9fff]/, `${step.id} alt 必须是中文`);
  }

  const cumulativeRegions = [
    ['phase-project'],
    ['phase-project', 'phase-compare'],
    ['phase-project', 'phase-compare', 'phase-normalize'],
    ['phase-project', 'phase-compare', 'phase-normalize', 'phase-aggregate'],
  ];
  for (let index = 0; index < visual.steps.length; index += 1) {
    const step = visual.steps[index];
    const parsed = parseStrictSvg(
      await readFile(step.assetPath, 'utf8'),
      step.assetPath,
    );
    for (const region of cumulativeRegions[index]) {
      assert.ok(
        parsed.elements.some((node) => node.attributes.get('data-region') === region),
        `${step.id} 必须累积保留 ${region}`,
      );
    }
    const visibleText = (parsed.elementsByName.get('text') ?? [])
      .map(({ text }) => text.trim())
      .join('\n');
    for (let stepNumber = 1; stepNumber <= index + 1; stepNumber += 1) {
      assertSvgIncludes(visibleText, `步骤 ${stepNumber}`);
    }
    if (index > 0) {
      assert.ok(
        parsed.elements.some(
          (node) =>
            node.attributes.get('data-region') === `direction-${index}`,
        ),
        `${step.id} 必须有进入当前阶段的方向标记`,
      );
    }
  }
});

function structuredElementSignature(node) {
  const structuralAttributes = [
    'data-region',
    'data-node',
    'data-stage',
    'data-row',
    'data-column',
    'data-value',
    'data-from',
    'data-to',
    'data-kind',
    'x',
    'y',
    'width',
    'height',
    'cx',
    'cy',
    'r',
    'x1',
    'y1',
    'x2',
    'y2',
    'points',
    'd',
  ];
  return JSON.stringify([
    node.name,
    node.text.replace(/\s+/g, ' ').trim(),
    ...structuralAttributes.map((attribute) => node.attributes.get(attribute) ?? null),
  ]);
}

test('states the score scaling direction as raw divided by root d_k equals scaled', async () => {
  for (const stepNumber of [3, 4]) {
    const assetPath =
      `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-${stepNumber}.svg`;
    const visibleText = visibleSvgText(await readFile(assetPath, 'utf8'), assetPath);
    assertSvgIncludes(visibleText, 'raw ÷ √d_k = scaled');
    assert.doesNotMatch(visibleText, /scaled\s*÷\s*(?:sqrt|√)/);
  }
});

test('keeps every activated score phase structurally identical in all later cumulative steps', async () => {
  const phases = ['project', 'compare', 'normalize', 'aggregate'];
  const snapshots = [];
  for (let stepNumber = 1; stepNumber <= phases.length; stepNumber += 1) {
    const assetPath =
      `assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-${stepNumber}.svg`;
    const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
    const phaseStates = new Map();
    for (const phase of phases) {
      const region = parsed.elements.find(
        (node) =>
          node.attributes.get('data-region') === `phase-${phase}`
          && node.attributes.get('data-phase') === phase,
      );
      assert.ok(region, `${assetPath} 缺少固定布局 phase-${phase}`);
      const expectedState = phases.indexOf(phase) < stepNumber ? 'active' : 'placeholder';
      assert.equal(region.attributes.get('data-state'), expectedState);
      const activeElements = parsed.elements
        .filter(
          (node) =>
            node.attributes.get('data-phase') === phase
            && node.attributes.get('data-state') === 'active',
        )
        .map(structuredElementSignature)
        .sort();
      if (expectedState === 'active') {
        assert.ok(activeElements.length >= 4, `${phase} 必须保留完整结构节点`);
      } else {
        assert.deepEqual(activeElements, [], `${phase} 尚未激活时只能是占位`);
      }
      phaseStates.set(phase, activeElements);
    }
    snapshots.push(phaseStates);
  }

  phases.forEach((phase, phaseIndex) => {
    const canonical = snapshots[phaseIndex].get(phase);
    for (let laterStep = phaseIndex + 1; laterStep < snapshots.length; laterStep += 1) {
      assert.deepEqual(
        snapshots[laterStep].get(phase),
        canonical,
        `${phase} 在后续步骤不得压缩、改值或移动`,
      );
    }
  });
});

test('includes active phase visible text in cumulative signatures so a displayed value mutation fails', async () => {
  const step3Path =
    'assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-3.svg';
  const step4Path =
    'assets/visuals/llm-foundation/llm-04-score-mask-softmax-step-4.svg';
  const step3 = parseStrictSvg(await readFile(step3Path, 'utf8'), step3Path);
  const step4Svg = await readFile(step4Path, 'utf8');
  const step4 = parseStrictSvg(step4Svg, step4Path);
  const normalizeSignature = (parsed) =>
    structuredElementSignature(
      parsed.elements.find(
        (node) =>
          node.attributes.get('data-region') === 'phase-normalize'
          && node.attributes.get('data-state') === 'active',
      ),
    );
  assert.equal(normalizeSignature(step3), normalizeSignature(step4));

  const mutatedSvg = step4Svg.replace(
    'weights 行和 = 1.000',
    'weights 行和 = 0.999',
  );
  assert.notEqual(mutatedSvg, step4Svg);
  const mutated = parseStrictSvg(mutatedSvg, `${step4Path}:mutated-visible-value`);
  assert.notEqual(
    normalizeSignature(mutated),
    normalizeSignature(step3),
    '可见数字漂移必须改变累计签名',
  );
});

test('models the decoder main path, two residual targets and reverse gradient as explicit edges', async () => {
  const assetPath = 'assets/visuals/llm-foundation/llm-04-decoder-block.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const nodes = new Set(
    parsed.elements
      .filter((node) => node.attributes.get('data-region') === 'decoder-node')
      .map((node) => node.attributes.get('data-node')),
  );
  assert.deepEqual(
    [...nodes].sort(),
    [
      'block-output',
      'ffn',
      'h',
      'h-prime',
      'ln1',
      'ln2',
      'masked-mha',
      'plus1',
      'plus2',
      'stack-exit',
    ].sort(),
  );

  const edges = parsed.elements.filter(
    (node) => node.attributes.get('data-region') === 'decoder-edge',
  );
  const edgeKey = (edge) =>
    `${edge.attributes.get('data-from')}->${edge.attributes.get('data-to')}`;
  const mainEdges = edges
    .filter((edge) => edge.attributes.get('data-kind') === 'main')
    .map(edgeKey);
  assert.deepEqual(mainEdges, [
    'h->ln1',
    'ln1->masked-mha',
    'masked-mha->plus1',
    'plus1->h-prime',
    'h-prime->ln2',
    'ln2->ffn',
    'ffn->plus2',
    'plus2->block-output',
    'block-output->stack-exit',
  ]);

  const residualEdges = edges
    .filter((edge) => edge.attributes.get('data-kind') === 'residual');
  assert.deepEqual(residualEdges.map(edgeKey).sort(), ['h->plus1', 'h-prime->plus2']);
  assert.ok(residualEdges.every((edge) => !edge.attributes.has('stroke-dasharray')));
  assert.ok(residualEdges.every((edge) => edge.attributes.get('data-to')?.startsWith('plus')));
  assert.ok(!residualEdges.some((edge) => edge.attributes.get('data-to') === 'ffn'));

  const gradientEdges = edges.filter(
    (edge) => edge.attributes.get('data-kind') === 'gradient',
  );
  assert.equal(gradientEdges.length, 1);
  assert.equal(edgeKey(gradientEdges[0]), 'block-output->h');
  assert.equal(gradientEdges[0].attributes.get('data-direction'), 'reverse');
  assert.ok(gradientEdges[0].attributes.has('stroke-dasharray'));
  assert.ok(gradientEdges[0].attributes.has('marker-end'));
});

function stableSoftmaxForFixture(values) {
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const denominator = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / denominator);
}

test('recomputes every multi-head output from fixture scores, weights and Values', () => {
  const fixture = fixtureForVisual('visual-llm-04-multi-head-merge');
  assert.equal(fixture.data.heads.length, 2);
  fixture.data.heads.forEach((head, headIndex) => {
    assert.ok(Array.isArray(head.scores), `Head ${headIndex + 1} 缺少 scores`);
    assert.ok(Array.isArray(head.values), `Head ${headIndex + 1} 缺少 values`);
    const weights = stableSoftmaxForFixture(head.scores);
    const output = head.values[0].map((_, dimension) =>
      head.values.reduce(
        (sum, vector, index) => sum + weights[index] * vector[dimension],
        0,
      ),
    );
    weights.forEach((value, index) =>
      assert.ok(
        Math.abs(value - fixture.result.heads[headIndex].weights[index]) < 1e-12,
        `Head ${headIndex + 1} weight ${index} 必须可从 scores 复算`,
      ),
    );
    output.forEach((value, index) =>
      assert.ok(
        Math.abs(value - fixture.result.heads[headIndex].output[index]) < 1e-12,
        `Head ${headIndex + 1} output ${index} 必须由 weights 与 Values 复算`,
      ),
    );
  });
  assert.deepEqual(
    fixture.result.heads.flatMap(({ output }) => output),
    fixture.result.concatenated,
  );
});

test('draws each fixture-backed head mechanism and a joint-update endpoint as structured nodes and edges', async () => {
  const fixture = fixtureForVisual('visual-llm-04-multi-head-merge');
  assert.ok(Array.isArray(fixture.result.heads), 'fixture result 必须逐头保存 weights 与 output');
  const assetPath = 'assets/visuals/llm-foundation/llm-04-multi-head-merge.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const edgeKey = (edge) =>
    `${edge.attributes.get('data-from')}->${edge.attributes.get('data-to')}`;
  fixture.result.heads.forEach((headResult, headIndex) => {
    const head = String(headIndex + 1);
    const region = parsed.elements.find(
      (node) =>
        node.attributes.get('data-region') === 'attention-head'
        && node.attributes.get('data-head') === head,
    );
    assert.ok(region, `Head ${head} 必须有完整机制 region`);
    const nodes = parsed.elements.filter(
      (node) =>
        node.attributes.get('data-region') === 'head-node'
        && node.attributes.get('data-head') === head,
    );
    assert.deepEqual(
      nodes.map((node) => node.attributes.get('data-node')).sort(),
      ['aggregate', 'keys', 'query', 'values', 'weights', `H${head}`].sort(),
    );
    const weights = parsed.elements
      .filter(
        (node) =>
          node.attributes.get('data-region') === 'head-weight'
          && node.attributes.get('data-head') === head,
      )
      .sort(
        (left, right) =>
          Number(left.attributes.get('data-index')) - Number(right.attributes.get('data-index')),
      );
    assert.deepEqual(
      weights.map((node) => Number(node.attributes.get('data-value'))),
      headResult.weights,
    );
    const output = nodes.find((node) => node.attributes.get('data-node') === `H${head}`);
    assert.equal(Number(output.attributes.get('data-value')), headResult.output[0]);
    const edges = parsed.elements.filter(
      (node) =>
        node.attributes.get('data-region') === 'head-edge'
        && node.attributes.get('data-head') === head,
    );
    assert.deepEqual(
      edges.map(edgeKey).sort(),
      [
        `H${head}-aggregate->H${head}`,
        `H${head}-keys->H${head}-weights`,
        `H${head}-query->H${head}-weights`,
        `H${head}-values->H${head}-aggregate`,
        `H${head}-weights->H${head}-aggregate`,
      ].sort(),
    );
  });
  const jointNode = parsed.elements.find(
    (node) =>
      node.attributes.get('data-region') === 'merge-node'
      && node.attributes.get('data-node') === 'joint-update',
  );
  assert.ok(jointNode);
  const jointEdge = parsed.elements.find(
    (node) =>
      node.attributes.get('data-region') === 'merge-edge'
      && edgeKey(node) === 'output-projection->joint-update',
  );
  assert.ok(jointEdge);
});

test('keeps score main metadata aligned with an SVG that begins at raw QK rather than projection', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById['visual-llm-04-score-mask-softmax'];
  const metadata = [visual.title, visual.alt, visual.longDescription].join('\n');
  assert.doesNotMatch(metadata, /Q\/K\/V 投影|从表示投影|投影为 Q/);
  for (const fragment of ['raw QK', '缩放', '因果掩码', 'softmax', 'Value']) {
    assertSvgIncludes(metadata, fragment);
  }
  const visibleText = visibleSvgText(
    await readFile(visual.assetPath, 'utf8'),
    visual.assetPath,
  );
  assert.match(visibleText.split('\n')[0], /QK.*scale.*causal mask.*softmax.*ΣV/);
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

function longestMatchEncode(rawText, vocabulary) {
  const tokens = Object.keys(vocabulary).sort(
    (left, right) => right.length - left.length || left.localeCompare(right),
  );
  const segments = [];
  let offset = 0;
  while (offset < rawText.length) {
    const token = tokens.find((candidate) => rawText.startsWith(candidate, offset));
    assert.ok(token, `教学词表无法编码 offset=${offset} 的原始文本`);
    segments.push(token);
    offset += token.length;
  }
  return { segments };
}

function assertSvgIncludes(svg, fragment) {
  assert.ok(svg.includes(fragment), `SVG 必须包含 fixture 文本：${fragment}`);
}

function visibleSvgText(svg, label) {
  const parsed = parseStrictSvg(svg, label);
  return (parsed.elementsByName.get('text') ?? [])
    .map(({ text }) => text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

test('encodes every llm-01–04 quantitative fixture input, method, result and rounding in visible SVG text', async () => {
  const checks = {
    'visual-llm-01-autoregressive-generation': (fixture, text) => {
      assertSvgIncludes(text, fixture.data.rawPrompt);
      for (const [token, id] of Object.entries(fixture.data.vocabulary)) {
        assertSvgIncludes(text, `${token} ${id}`);
      }
      assertSvgIncludes(text, '最长匹配');
      assertSvgIncludes(text, 'stable softmax');
      assertSvgIncludes(text, 'greedy');
      assertSvgIncludes(text, '固定下一状态');
      assertSvgIncludes(text, fixture.result.encodedIds.join(' / '));
      fixture.result.probabilities.forEach((probability) =>
        assertSvgIncludes(text, probability.toFixed(4)),
      );
      assertSvgIncludes(text, `ID ${fixture.result.selectedId}`);
      assertSvgIncludes(text, fixture.result.nextToken);
    },
    'visual-llm-02-training-cycle': (fixture, text) => {
      assertSvgIncludes(text, `X ${JSON.stringify(fixture.data.X)}`);
      assertSvgIncludes(text, `W ${JSON.stringify(fixture.data.W)}`);
      assertSvgIncludes(text, `b ${JSON.stringify(fixture.data.b)}`);
      assertSvgIncludes(text, `Y ${JSON.stringify(fixture.data.Y)}`);
      assertSvgIncludes(text, 'Z=XW+b');
      assertSvgIncludes(text, '四元素 MSE');
      assertSvgIncludes(text, 'backward');
      assertSvgIncludes(text, 'SGD');
      assertSvgIncludes(text, `Z ${JSON.stringify(fixture.result.Z)}`);
      assertSvgIncludes(text, `loss ${fixture.result.loss.toFixed(6)}`);
      assertSvgIncludes(text, `dW ${JSON.stringify(fixture.result.dW)}`);
      assertSvgIncludes(text, `new W ${JSON.stringify(fixture.result.newW)}`);
      assertSvgIncludes(text, `new loss ${fixture.result.newLoss.toFixed(6)}`);
      assertSvgIncludes(text, '不能直接逐元素对齐');
      assertSvgIncludes(text, '可静默广播');
      assertSvgIncludes(text, '需确认语义');
    },
    'visual-llm-02-neuron-forward': (fixture, text) => {
      assertSvgIncludes(text, `x ${fixture.data.x}`);
      assertSvgIncludes(text, `w ${fixture.data.w}`);
      assertSvgIncludes(text, `b ${fixture.data.b}`);
      assertSvgIncludes(text, `y ${fixture.data.y}`);
      assertSvgIncludes(text, 'z = wx + b');
      assertSvgIncludes(text, 'sigmoid(z)');
      assertSvgIncludes(text, 'loss = -ln(p)');
      assertSvgIncludes(text, `z ${fixture.result.z.toFixed(4)}`);
      assertSvgIncludes(text, `p ${fixture.result.probability.toFixed(4)}`);
      assertSvgIncludes(text, `loss ${fixture.result.loss.toFixed(4)}`);
    },
    'visual-llm-02-backprop-graph': (fixture, text) => {
      assertSvgIncludes(text, `x ${fixture.data.x}`);
      assertSvgIncludes(text, `w ${fixture.data.w}`);
      assertSvgIncludes(text, 'a = xw');
      assertSvgIncludes(text, 'b = x²');
      assertSvgIncludes(text, 'c = a + b');
      assertSvgIncludes(text, 'L = c²/2');
      assertSvgIncludes(text, 'forward');
      assertSvgIncludes(text, 'backward');
      assertSvgIncludes(text, `a ${fixture.result.forward.a}`);
      assertSvgIncludes(text, `L ${fixture.result.forward.loss}`);
      assertSvgIncludes(
        text,
        `${fixture.result.pathContributionsToX.viaA} + `
        + `${fixture.result.pathContributionsToX.viaB} = `
        + `${fixture.result.accumulated.dLossDx}`,
      );
      assertSvgIncludes(text, `dL/dw ${fixture.result.accumulated.dLossDw}`);
    },
    'visual-llm-02-learning-rate-trajectories': (fixture, text) => {
      assertSvgIncludes(text, `w0 = ${fixture.data.initialW}`);
      assertSvgIncludes(text, 'w_next = w - η · 2(w - 1)');
      for (const trajectory of fixture.result.trajectories) {
        assertSvgIncludes(text, `η ${trajectory.learningRate}`);
        for (const value of trajectory.weights) {
          assertSvgIncludes(text, value.toFixed(3));
        }
        for (const value of trajectory.losses) {
          assertSvgIncludes(text, value.toFixed(4));
        }
      }
      assertSvgIncludes(text, '参数位置 w');
      assertSvgIncludes(text, '损失 L');
    },
    'visual-llm-02-generalization-curves': (fixture, text) => {
      assertSvgIncludes(text, `epoch ${fixture.data.epochs.join(' / ')}`);
      for (const series of Object.values(fixture.data.series)) {
        for (const value of series.train) assertSvgIncludes(text, value.toFixed(2));
        for (const value of series.validation) assertSvgIncludes(text, value.toFixed(2));
      }
      assertSvgIncludes(text, '绝对损失');
      assertSvgIncludes(text, '同步趋势');
      assertSvgIncludes(text, 'validation 最小点');
      assertSvgIncludes(text, `最佳 epoch ${fixture.result.overfit.bestEpoch}`);
      assertSvgIncludes(
        text,
        `分叉始于 epoch ${fixture.result.overfit.divergenceStartsAtEpoch}`,
      );
      assert.match(text, /教学示例 · 非实测/);
    },
    'visual-llm-03-text-to-context': (fixture, text) => {
      assertSvgIncludes(text, '教学 tokenizer');
      assertSvgIncludes(text, '猫坐');
      assertSvgIncludes(text, `token ID ${fixture.data.tokenIds.join(' / ')}`);
      for (const [id, vector] of Object.entries(fixture.data.embeddings)) {
        assertSvgIncludes(text, `E${id} ${fixed(vector, 1)}`);
      }
      fixture.data.positions.forEach((vector, index) =>
        assertSvgIncludes(text, `P${index} ${fixed(vector, 1)}`),
      );
      assertSvgIncludes(text, '固定查表');
      assertSvgIncludes(text, '逐位置相加');
      assertSvgIncludes(text, '交换 token，位置向量不移动');
      fixture.result.ordered.forEach((vector) =>
        assertSvgIncludes(text, fixed(vector, 1)),
      );
      fixture.result.swapped.forEach((vector) =>
        assertSvgIncludes(text, fixed(vector, 1)),
      );
      assertSvgIncludes(text, 'ID 数值无距离语义');
      assertSvgIncludes(text, '上下文化表示会继续更新');
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
    'visual-llm-03-tokenization-comparison': (fixture, text) => {
      assertSvgIncludes(text, '教学 tokenizer A');
      assertSvgIncludes(text, '教学 tokenizer B');
      assertSvgIncludes(text, '不是生产模型测量');
      assertSvgIncludes(text, 'longest-match');
      assertSvgIncludes(text, 'Unicode code point');
      for (const [token, id] of Object.entries(fixture.data.tokenizerAVocabulary)) {
        assertSvgIncludes(text, `${token} ${id}`);
      }
      fixture.data.texts.forEach((rawText, index) => {
        const segmentsA = longestMatchEncode(
          rawText,
          fixture.data.tokenizerAVocabulary,
        ).segments;
        assertSvgIncludes(text, `原文 ${rawText}`);
        assertSvgIncludes(text, `A ${segmentsA.join(' / ')}`);
        assertSvgIncludes(text, `B ${[...rawText].join(' / ')}`);
        assertSvgIncludes(text, `计数 ${fixture.result.tokenizerACounts[index]} / ${fixture.result.tokenizerBCounts[index]}`);
      });
    },
    'visual-llm-03-embedding-position-space': (fixture, text) => {
      assertSvgIncludes(text, '教学投影');
      assertSvgIncludes(text, '不是字典释义');
      for (const [id, vector] of Object.entries(fixture.data.embeddings)) {
        assertSvgIncludes(text, `E${id} ${fixed(vector, 1)}`);
      }
      fixture.data.positions.forEach((vector, index) =>
        assertSvgIncludes(text, `P${index} ${fixed(vector, 1)}`),
      );
      fixture.data.orders.forEach((order, index) => {
        assertSvgIncludes(text, `顺序 ${order.join(' / ')}`);
        fixture.result.representations[index].forEach((vector) =>
          assertSvgIncludes(text, fixed(vector, 1)),
        );
      });
      assertSvgIncludes(text, 'Hᵢ = E_id + Pᵢ');
      assertSvgIncludes(text, '上下文层继续更新 H');
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
    'visual-llm-03-context-budget': (fixture, text) => {
      assertSvgIncludes(text, `窗口 ${fixture.data.window}`);
      for (const [name, value] of Object.entries(fixture.data.allocations)) {
        assertSvgIncludes(text, `${name} ${value}`);
      }
      assertSvgIncludes(text, '先预留 output / margin');
      assertSvgIncludes(text, `baseline ${fixture.result.baselineTotal}`);
      assertSvgIncludes(text, `retrieval +${fixture.data.retrievalIncrease}`);
      assertSvgIncludes(text, `expanded ${fixture.result.expandedTotal}`);
      assertSvgIncludes(text, `overflow ${fixture.result.overflow}`);
      assertSvgIncludes(text, `trim ${fixture.data.trimFirst}`);
      assertSvgIncludes(text, `history ${fixture.result.trimmedHistory}`);
      assertSvgIncludes(text, `final ${fixture.result.finalTotal}`);
      assertSvgIncludes(text, '教学预算 · 非实测');
    },
    'visual-llm-04-qkv-flow': (fixture, text) => {
      assertSvgIncludes(text, `scores ${fixed(fixture.data.scaledScores, 3)}`);
      fixture.data.values.forEach((vector, index) =>
        assertSvgIncludes(text, `V${index + 1} ${fixed(vector, 3)}`),
      );
      assertSvgIncludes(text, 'stable softmax');
      assertSvgIncludes(text, `weights ${fixed(fixture.result.weights, 3)}`);
      assertSvgIncludes(text, `output ${fixed(fixture.result.output, 3)}`);
      assertSvgIncludes(text, 'Q × K 产生读取权重');
      assertSvgIncludes(text, '按权重汇总 Value');
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
    'visual-llm-04-score-mask-softmax': (fixture, text) => {
      assertSvgIncludes(text, `raw QK ${fixed(fixture.data.rawQKScores, 3)}`);
      assertSvgIncludes(text, `d_k ${fixture.data.dK}`);
      assertSvgIncludes(text, '除以 sqrt(d_k)');
      assertSvgIncludes(text, `scaled ${fixed(fixture.result.scaledScores, 3)}`);
      assertSvgIncludes(text, `未来索引 ${fixture.data.maskedIndices.join(' / ')}`);
      assertSvgIncludes(text, 'softmax 前 mask');
      assertSvgIncludes(text, '−∞');
      assertSvgIncludes(text, `weights ${fixed(fixture.result.weights, 3)}`);
      fixture.data.values.forEach((vector, index) =>
        assertSvgIncludes(text, `V${index + 1} ${fixed(vector, 3)}`),
      );
      assertSvgIncludes(text, `output ${fixed(fixture.result.output, 3)}`);
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
    'visual-llm-04-multi-head-merge': (fixture, text) => {
      fixture.data.heads.forEach((head, index) => {
        const result = fixture.result.heads[index];
        assertSvgIncludes(text, `Head ${index + 1}`);
        assertSvgIncludes(text, `scores ${fixed(head.scores, 3)}`);
        assertSvgIncludes(text, `weights ${fixed(result.weights, 3)}`);
        assertSvgIncludes(text, `Values ${head.values.flat().join(' / ')}`);
        assertSvgIncludes(text, `H${index + 1} ${result.output.join(' / ')}`);
      });
      assertSvgIncludes(text, `W_O ${JSON.stringify(fixture.data.outputProjection)}`);
      assertSvgIncludes(text, '沿特征维 concat');
      assertSvgIncludes(text, `concat ${fixture.result.concatenated.join(' / ')}`);
      assertSvgIncludes(text, `output ${fixture.result.output.join(' / ')}`);
      assertSvgIncludes(text, '联合更新');
      assertSvgIncludes(text, '独立 Q/K/V 参数');
      assertSvgIncludes(text, '不预设语法职责');
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
    'visual-llm-04-causal-visibility': (fixture, text) => {
      assertSvgIncludes(text, `n ${fixture.data.allowedScores.length}`);
      assertSvgIncludes(text, '0-based 规则 j≤i');
      fixture.result.visibility.forEach((row, index) =>
        assertSvgIncludes(text, `M${index} ${row.join(' ')}`),
      );
      fixture.result.rowWeights.forEach((row, index) =>
        assertSvgIncludes(text, `W${index} ${fixed(row, 4)}`),
      );
      assertSvgIncludes(text, '逐行仅对可见位置 softmax');
      assertSvgIncludes(text, '错误全可见 = 未来答案泄漏');
      assertSvgIncludes(text, '教学示例 · 非实测');
    },
  };

  const { knowledgeVisualsById } = await loadRegistry();
  for (const [visualId, assertFixtureText] of Object.entries(checks)) {
    const visual = knowledgeVisualsById[visualId];
    const fixture = fixtureForVisual(visualId);
    const svg = await readFile(visual.assetPath, 'utf8');
    const visibleText = visibleSvgText(svg, visual.assetPath);
    assert.doesNotMatch(visibleText, /<title|<desc/);
    assertSvgIncludes(visibleText, fixture.fields.Rounding);
    assertFixtureText(fixture, visibleText);
  }
});

test('draws three upward-opening learning-rate landscapes with explicit axes', async () => {
  const assetPath = 'assets/visuals/llm-foundation/llm-02-learning-rate-trajectories.svg';
  const svg = await readFile(assetPath, 'utf8');
  const parsed = parseStrictSvg(svg, assetPath);
  for (const region of ['small', 'matched', 'large']) {
    const path = parsed.elements.find((node) =>
      node.attributes.get('data-region') === `loss-landscape-${region}`,
    );
    assert.equal(path?.name, 'path', `${region} 必须有可检查的损失地形 path`);
    const match = /^M[0-9]+ ([0-9]+) Q[0-9]+ ([0-9]+) [0-9]+ ([0-9]+)$/
      .exec(path.attributes.get('d') ?? '');
    assert.ok(match, `${region} 的 U 形路径必须使用单段二次曲线`);
    const [, startY, controlY, endY] = match.map(Number);
    assert.ok(
      controlY > startY && controlY > endY,
      `${region} 的最低损失必须在视觉低处`,
    );
  }
});

test('maps every learning-rate fixture state with each panel declared coordinate formula', async () => {
  const visualId = 'visual-llm-02-learning-rate-trajectories';
  const assetPath = 'assets/visuals/llm-foundation/llm-02-learning-rate-trajectories.svg';
  const fixture = fixtureForVisual(visualId);
  const targetW = fixture.data.targetW;
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const panelNames = ['small', 'matched', 'large'];

  fixture.result.trajectories.forEach((trajectory, panelIndex) => {
    const panel = panelNames[panelIndex];
    const mapNode = parsed.elements.find((candidate) =>
      candidate.attributes.get('data-region') === `coordinate-map-${panel}`,
    );
    assert.equal(mapNode?.name, 'g', `${panel} 必须声明坐标映射`);
    const valleyX = Number(mapNode.attributes.get('data-valley-x'));
    const xScale = Number(mapNode.attributes.get('data-x-scale'));
    const valleyY = Number(mapNode.attributes.get('data-valley-y'));
    const yScale = Number(mapNode.attributes.get('data-y-scale'));
    for (const value of [valleyX, xScale, valleyY, yScale]) {
      assert.ok(Number.isFinite(value), `${panel} 坐标映射必须是有限数`);
    }

    const states = [
      {
        w: fixture.data.initialW,
        loss: (fixture.data.initialW - targetW) ** 2,
      },
      ...trajectory.weights.map((w, index) => ({
        w,
        loss: trajectory.losses[index],
      })),
    ];
    states.forEach((state, step) => {
      const node = parsed.elements.find((candidate) =>
        candidate.attributes.get('data-region') === `${panel}-step-${step}`,
      );
      assert.equal(node?.name, 'circle', `${panel} step ${step} 必须是 circle`);
      assert.equal(node.attributes.get('data-step'), String(step));
      assert.ok(
        Math.abs(Number(node.attributes.get('data-w')) - state.w) < 1e-12,
        `${panel} step ${step} data-w 必须来自 fixture`,
      );
      assert.ok(
        Math.abs(Number(node.attributes.get('data-loss')) - state.loss) < 1e-12,
        `${panel} step ${step} data-loss 必须来自 fixture`,
      );
      const expectedCx = valleyX + (state.w - targetW) * xScale;
      const expectedCy = valleyY - state.loss * yScale;
      assert.ok(
        Math.abs(Number(node.attributes.get('cx')) - expectedCx) < 1e-6,
        `${panel} step ${step} cx 必须遵循 valleyX + (w-1)*xScale`,
      );
      assert.ok(
        Math.abs(Number(node.attributes.get('cy')) - expectedCy) < 1e-6,
        `${panel} step ${step} cy 必须遵循 valleyY - loss*yScale`,
      );
    });
  });
});

test('labels every learning-rate state visibly, including the matched repeated point', async () => {
  const assetPath = 'assets/visuals/llm-foundation/llm-02-learning-rate-trajectories.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  for (const panel of ['small', 'large']) {
    for (let step = 0; step <= 3; step += 1) {
      const label = parsed.elements.find((candidate) =>
        candidate.attributes.get('data-region') === `${panel}-label-${step}`,
      );
      assert.equal(label?.name, 'text');
      assert.equal(label.text.trim(), `w${step}`);
    }
  }
  const matchedStart = parsed.elements.find((candidate) =>
    candidate.attributes.get('data-region') === 'matched-label-0',
  );
  const matchedRepeated = parsed.elements.find((candidate) =>
    candidate.attributes.get('data-region') === 'matched-label-1-3',
  );
  assert.equal(matchedStart?.text.trim(), 'w0');
  assert.equal(matchedRepeated?.text.trim(), 'w1–w3');
});

test('shows every frozen backprop local gradient in visible text', async () => {
  const visualId = 'visual-llm-02-backprop-graph';
  const fixture = fixtureForVisual(visualId);
  const assetPath = 'assets/visuals/llm-foundation/llm-02-backprop-graph.svg';
  const visibleText = visibleSvgText(
    await readFile(assetPath, 'utf8'),
    assetPath,
  );
  const labels = {
    dLossDc: (value) => `dL/dc ${value}`,
    dCda: (value) => `dc/da ${value}`,
    dCdb: (value) => `dc/db ${value}`,
    dAdx: (value) => `da/dx ${value}`,
    dAdw: (value) => `da/dw = x = ${value}`,
    dBdx: (value) => `db/dx ${value}`,
  };
  for (const [gradient, value] of Object.entries(fixture.result.localGradients)) {
    assertSvgIncludes(visibleText, labels[gradient](value));
  }
  assertSvgIncludes(
    visibleText,
    `dL/dw ${fixture.result.accumulated.dLossDw}`,
  );
});

test('keeps frozen qualitative nodes visible in the learning and application diagrams', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const expected = {
    'visual-llm-01-learning-loop': [
      '数据批次',
      '当前参数',
      '预测',
      '损失',
      '梯度',
      '优化器更新',
      '新参数',
      '验证旁路 · 只读',
      '标准推理 · 只读',
    ],
    'visual-llm-01-application-decision-stack': [
      '应用层',
      '服务层',
      '模型层',
      '基础模型',
      '评测证据门',
      '修复选择',
      '换模型 / 微调',
      '仅在证据门之后',
    ],
  };
  for (const [visualId, labels] of Object.entries(expected)) {
    const assetPath = knowledgeVisualsById[visualId].assetPath;
    const visibleText = visibleSvgText(
      await readFile(assetPath, 'utf8'),
      assetPath,
    );
    for (const label of labels) assertSvgIncludes(visibleText, label);
  }
});

test('marks every constructed quantitative teaching visual as non-measured', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  for (const visualId of [
    'visual-llm-02-training-cycle',
    'visual-llm-02-neuron-forward',
    'visual-llm-02-learning-rate-trajectories',
    'visual-llm-02-generalization-curves',
  ]) {
    const assetPath = knowledgeVisualsById[visualId].assetPath;
    const visibleText = visibleSvgText(
      await readFile(assetPath, 'utf8'),
      assetPath,
    );
    assertSvgIncludes(visibleText, '教学示例 · 非实测');
  }
});

test('separates a fixture-derived incompatible elementwise edge from compatible broadcast risk', async () => {
  const fixture = fixtureForVisual('visual-llm-02-training-cycle');
  const B = fixture.data.X.length;
  const F = fixture.data.X[0].length;
  const C = fixture.data.W[0].length;
  const assetPath = 'assets/visuals/llm-foundation/llm-02-training-cycle.svg';
  const svg = await readFile(assetPath, 'utf8');
  const parsed = parseStrictSvg(svg, assetPath);
  const visibleText = visibleSvgText(svg, assetPath);
  const blockedEdge = parsed.elements.find((node) =>
    node.attributes.get('data-region') === 'shape-block-edge',
  );
  assert.equal(blockedEdge?.name, 'line');
  assert.equal(blockedEdge.attributes.get('stroke-dasharray'), '10 7');
  assert.notEqual(F, C, 'fixture 的尾轴必须确实不兼容');
  assertSvgIncludes(
    visibleText,
    `[B,F]=[${B},${F}] ✕ [B,C]=[${B},${C}]`,
  );
  assertSvgIncludes(visibleText, '不能直接逐元素对齐');

  const broadcastEdge = parsed.elements.find((node) =>
    node.attributes.get('data-region') === 'shape-broadcast-edge',
  );
  assert.equal(broadcastEdge?.name, 'line');
  assert.equal(
    fixture.data.b.length,
    C,
    'fixture 的 [C] 尾轴必须能广播到 [B,C]',
  );
  assertSvgIncludes(
    visibleText,
    `[C]=[${C}] → [B,C]=[${B},${C}]`,
  );
  assertSvgIncludes(visibleText, '可静默广播 · 需确认语义');
});

test('maps tokenizer fixture segments to proportional structured blocks', async () => {
  const visualId = 'visual-llm-03-tokenization-comparison';
  const fixture = fixtureForVisual(visualId);
  const assetPath = `assets/visuals/llm-foundation/llm-03-tokenization-comparison.svg`;
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);

  fixture.data.texts.forEach((rawText, textIndex) => {
    const segmentsByTokenizer = {
      A: longestMatchEncode(rawText, fixture.data.tokenizerAVocabulary).segments,
      B: [...rawText],
    };
    for (const [tokenizer, segments] of Object.entries(segmentsByTokenizer)) {
      const row = parsed.elements.find(
        (node) =>
          node.name === 'g'
          && node.attributes.get('data-region') === 'token-row'
          && node.attributes.get('data-text-index') === String(textIndex)
          && node.attributes.get('data-tokenizer') === tokenizer,
      );
      assert.ok(row, `text ${textIndex} tokenizer ${tokenizer} 缺少结构化行`);
      const originX = finiteNumberAttribute(row, 'data-origin-x', 'token-row');
      const scale = finiteNumberAttribute(row, 'data-scale', 'token-row');
      const blocks = parsed.elements.filter(
        (node) =>
          node.name === 'rect'
          && node.attributes.get('data-region') === 'token-segment'
          && node.attributes.get('data-text-index') === String(textIndex)
          && node.attributes.get('data-tokenizer') === tokenizer,
      );
      assert.equal(blocks.length, segments.length);
      let codePointOffset = 0;
      blocks.forEach((block, index) => {
        const codePointCount = [...segments[index]].length;
        assert.equal(block.attributes.get('data-index'), String(index));
        assert.equal(block.attributes.get('data-count'), String(codePointCount));
        assert.equal(finiteNumberAttribute(block, 'x', 'token-segment'), originX + codePointOffset * scale);
        assert.equal(finiteNumberAttribute(block, 'width', 'token-segment'), codePointCount * scale);
        codePointOffset += codePointCount;
      });
    }
  });
});

test('maps embedding fixture vectors to declared teaching-projection coordinates', async () => {
  const visualId = 'visual-llm-03-embedding-position-space';
  const fixture = fixtureForVisual(visualId);
  const assetPath = `assets/visuals/llm-foundation/llm-03-embedding-position-space.svg`;
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);

  fixture.result.representations.forEach((vectors, orderIndex) => {
    const plot = parsed.elements.find(
      (node) =>
        node.name === 'g'
        && node.attributes.get('data-region') === 'embedding-plot'
        && node.attributes.get('data-row') === String(orderIndex),
    );
    assert.ok(plot, `order ${orderIndex} 缺少教学投影坐标声明`);
    const originX = finiteNumberAttribute(plot, 'data-origin-x', 'embedding-plot');
    const originY = finiteNumberAttribute(plot, 'data-origin-y', 'embedding-plot');
    const scale = finiteNumberAttribute(plot, 'data-scale', 'embedding-plot');
    vectors.forEach(([vectorX, vectorY], positionIndex) => {
      const point = parsed.elements.find(
        (node) =>
          node.name === 'circle'
          && node.attributes.get('data-region') === 'embedding-point'
          && node.attributes.get('data-row') === String(orderIndex)
          && node.attributes.get('data-column') === String(positionIndex),
      );
      assert.ok(point, `order ${orderIndex} position ${positionIndex} 缺少点`);
      assert.equal(finiteNumberAttribute(point, 'data-vector-x', 'embedding-point'), vectorX);
      assert.equal(finiteNumberAttribute(point, 'data-vector-y', 'embedding-point'), vectorY);
      assert.equal(finiteNumberAttribute(point, 'cx', 'embedding-point'), originX + vectorX * scale);
      assert.equal(finiteNumberAttribute(point, 'cy', 'embedding-point'), originY - vectorY * scale);
    });
  });
});

test('derives context-budget block positions and overflow width from the fixture', async () => {
  const visualId = 'visual-llm-03-context-budget';
  const fixture = fixtureForVisual(visualId);
  const assetPath = `assets/visuals/llm-foundation/llm-03-context-budget.svg`;
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const windowBar = parsed.elements.find(
    (node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'budget-window',
  );
  assert.ok(windowBar);
  const originX = finiteNumberAttribute(windowBar, 'x', 'budget-window');
  const width = finiteNumberAttribute(windowBar, 'width', 'budget-window');
  const scale = width / fixture.data.window;
  const displayOrder = ['output', 'margin', 'system', 'user', 'history', 'retrieval'];
  let start = 0;
  for (const allocation of displayOrder) {
    const block = parsed.elements.find(
      (node) =>
        node.name === 'rect'
        && node.attributes.get('data-region') === `budget-block-${allocation}`,
    );
    const value = fixture.data.allocations[allocation];
    assert.ok(block, allocation);
    assert.equal(finiteNumberAttribute(block, 'data-value', allocation), value);
    assert.equal(finiteNumberAttribute(block, 'data-start', allocation), start);
    assert.equal(finiteNumberAttribute(block, 'x', allocation), originX + start * scale);
    assert.equal(finiteNumberAttribute(block, 'width', allocation), value * scale);
    start += value;
  }
  assert.equal(start, fixture.result.baselineTotal);
  const overflow = parsed.elements.find(
    (node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'budget-overflow',
  );
  assert.equal(finiteNumberAttribute(overflow, 'data-value', 'budget-overflow'), fixture.result.overflow);
  assert.equal(finiteNumberAttribute(overflow, 'width', 'budget-overflow'), fixture.result.overflow * scale);
});

test('maps QKV weights to edge widths and keeps Value vectors as the aggregation source', async () => {
  const visualId = 'visual-llm-04-qkv-flow';
  const fixture = fixtureForVisual(visualId);
  const assetPath = `assets/visuals/llm-foundation/llm-04-qkv-flow.svg`;
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  fixture.result.weights.forEach((weight, index) => {
    const edge = parsed.elements.find(
      (node) =>
        node.name === 'line'
        && node.attributes.get('data-region') === 'value-weight-edge'
        && node.attributes.get('data-index') === String(index),
    );
    assert.ok(edge, `weight ${index} 缺少 Value 聚合边`);
    assert.ok(
      Math.abs(finiteNumberAttribute(edge, 'data-weight', 'value-weight-edge') - weight) < 1e-12,
    );
    assert.ok(
      Math.abs(finiteNumberAttribute(edge, 'stroke-width', 'value-weight-edge') - (2 + 12 * weight)) < 1e-6,
    );
  });
});

test('lays out raw attention scores and causal visibility as fixture-derived matrix grids', async () => {
  const scoreFixture = fixtureForVisual('visual-llm-04-score-mask-softmax');
  const scorePath = `assets/visuals/llm-foundation/llm-04-score-mask-softmax.svg`;
  const scoreParsed = parseStrictSvg(await readFile(scorePath, 'utf8'), scorePath);
  const expectedStages = new Map([
    ['raw', scoreFixture.data.rawQKScores],
    ['scaled', scoreFixture.result.scaledScores],
    ['masked', scoreFixture.result.maskedScores],
    ['weights', scoreFixture.result.weights],
  ]);
  for (const [stage, expectedValues] of expectedStages) {
    const matrix = scoreParsed.elements.find(
      (node) =>
        node.attributes.get('data-region') === 'attention-matrix'
        && node.attributes.get('data-stage') === stage,
    );
    assert.ok(matrix, `${stage} 必须是真正的 1×3 matrix`);
    const originX = finiteNumberAttribute(matrix, 'data-origin-x', `${stage}-matrix`);
    const originY = finiteNumberAttribute(matrix, 'data-origin-y', `${stage}-matrix`);
    const cellWidth = finiteNumberAttribute(matrix, 'data-cell-width', `${stage}-matrix`);
    const cellHeight = finiteNumberAttribute(matrix, 'data-cell-height', `${stage}-matrix`);
    const cells = scoreParsed.elements.filter(
      (node) =>
        node.name === 'rect'
        && node.attributes.get('data-region') === 'attention-cell'
        && node.attributes.get('data-stage') === stage,
    );
    assert.equal(cells.length, expectedValues.length);
    expectedValues.forEach((expectedValue, column) => {
      const cell = cells.find(
        (candidate) =>
          candidate.attributes.get('data-row') === '0'
          && candidate.attributes.get('data-column') === String(column),
      );
      assert.ok(cell, `${stage}[0][${column}]`);
      const encodedValue = cell.attributes.get('data-value');
      if (expectedValue === -Infinity) {
        assert.equal(encodedValue, '-Infinity');
        assert.equal(cell.attributes.get('data-kind'), 'masked-future');
        assert.match(cell.attributes.get('fill') ?? '', /^url\(#[-A-Za-z0-9_]+\)$/);
      } else {
        assert.ok(Math.abs(Number(encodedValue) - expectedValue) < 1e-12);
      }
      assert.equal(finiteNumberAttribute(cell, 'x', `${stage}-cell`), originX + column * cellWidth);
      assert.equal(finiteNumberAttribute(cell, 'y', `${stage}-cell`), originY);
      assert.equal(finiteNumberAttribute(cell, 'width', `${stage}-cell`), cellWidth);
      assert.equal(finiteNumberAttribute(cell, 'height', `${stage}-cell`), cellHeight);
    });
    const keyLabels = scoreParsed.elements.filter(
      (node) =>
        node.attributes.get('data-region') === 'attention-key-label'
        && node.attributes.get('data-stage') === stage,
    );
    assert.deepEqual(
      keyLabels.map((node) => node.attributes.get('data-column')),
      expectedValues.map((_, column) => String(column)),
      `${stage} 必须有 k0/k1/k2 列轴`,
    );
    const queryLabel = scoreParsed.elements.find(
      (node) =>
        node.attributes.get('data-region') === 'attention-query-label'
        && node.attributes.get('data-stage') === stage,
    );
    assert.equal(queryLabel?.attributes.get('data-row'), '0', `${stage} 必须有 q0 行轴`);
  }
  assert.ok(
    Math.abs(scoreFixture.result.weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12,
  );
  const outputCells = scoreParsed.elements.filter(
    (node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'attention-output-cell',
  );
  assert.equal(outputCells.length, scoreFixture.result.output.length);
  outputCells.forEach((cell, column) => {
    assert.equal(cell.attributes.get('data-column'), String(column));
    assert.ok(
      Math.abs(Number(cell.attributes.get('data-value')) - scoreFixture.result.output[column]) < 1e-12,
    );
  });

  const causalFixture = fixtureForVisual('visual-llm-04-causal-visibility');
  const causalPath = `assets/visuals/llm-foundation/llm-04-causal-visibility.svg`;
  const causalParsed = parseStrictSvg(await readFile(causalPath, 'utf8'), causalPath);
  const grid = causalParsed.elements.find(
    (node) => node.name === 'g' && node.attributes.get('data-region') === 'causal-grid',
  );
  assert.ok(grid);
  const originX = finiteNumberAttribute(grid, 'data-origin-x', 'causal-grid');
  const originY = finiteNumberAttribute(grid, 'data-origin-y', 'causal-grid');
  const cellSize = finiteNumberAttribute(grid, 'data-cell-size', 'causal-grid');
  causalFixture.result.visibility.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      const cell = causalParsed.elements.find(
        (node) =>
          node.name === 'rect'
          && node.attributes.get('data-region') === 'visibility-cell'
          && node.attributes.get('data-row') === String(rowIndex)
          && node.attributes.get('data-column') === String(columnIndex),
      );
      assert.ok(cell, `M[${rowIndex}][${columnIndex}]`);
      assert.equal(finiteNumberAttribute(cell, 'data-value', 'visibility-cell'), value);
      assert.equal(finiteNumberAttribute(cell, 'x', 'visibility-cell'), originX + columnIndex * cellSize);
      assert.equal(finiteNumberAttribute(cell, 'y', 'visibility-cell'), originY + rowIndex * cellSize);
      assert.equal(finiteNumberAttribute(cell, 'width', 'visibility-cell'), cellSize);
      assert.equal(finiteNumberAttribute(cell, 'height', 'visibility-cell'), cellSize);
    });
  });
});

test('keeps every llm-01–04 SVG label at least 26px with a 32px viewBox safety margin', async () => {
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
