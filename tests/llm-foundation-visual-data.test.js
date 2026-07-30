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
import { VISUALIZED_LESSON_IDS } from './helpers/visualized-lessons.js';

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
  'visual-llm-05-method-map': {
    lessonId: 'llm-05',
    sectionId: 'objectives-before-methods',
    kind: 'diagram',
    role: 'overview',
    tags: ['decision'],
    sourceIds: ['res-hf-llm', 'res-ms-genai', 'res-openai-cookbook'],
  },
  'visual-llm-05-stage-objectives': {
    lessonId: 'llm-05',
    sectionId: 'sft-and-behavior-shaping',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['comparison'],
    sourceIds: ['res-hf-llm', 'res-rasbt', 'res-stanford-cs336'],
  },
  'visual-llm-05-preference-boundary': {
    lessonId: 'llm-05',
    sectionId: 'preference-optimization-boundaries',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['boundary', 'comparison'],
    sourceIds: ['res-hf-llm', 'res-rasbt', 'res-happy-llm'],
  },
  'visual-llm-05-lora-update': {
    lessonId: 'llm-05',
    sectionId: 'lora-as-parameter-efficient-update',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-rasbt', 'res-hf-llm', 'res-happy-llm'],
    fixtureId: 'fixture-llm-05-lora-update',
  },
  'visual-llm-05-rag-finetune-matrix': {
    lessonId: 'llm-05',
    sectionId: 'rag-finetuning-decision-lab',
    kind: 'diagram',
    role: 'decision',
    tags: ['failure-mode', 'comparison'],
    sourceIds: ['res-ms-genai', 'res-openai-cookbook', 'res-hf-llm', 'res-rasbt'],
    fixtureId: 'fixture-llm-05-rag-finetune-matrix',
  },
  'visual-llm-06-generation-loop': {
    lessonId: 'llm-06',
    sectionId: 'sampling-experiment-and-serving-tradeoffs',
    kind: 'step-diagram',
    role: 'overview',
    tags: ['process'],
    sourceIds: ['res-rasbt', 'res-hf-llm', 'res-openai-cookbook'],
    fixtureId: 'fixture-llm-06-generation-loop',
  },
  'visual-llm-06-logit-softmax': {
    lessonId: 'llm-06',
    sectionId: 'logits-softmax-next-token',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['process'],
    sourceIds: ['res-rasbt', 'res-hf-llm'],
    fixtureId: 'fixture-llm-06-logit-softmax',
  },
  'visual-llm-06-temperature-top-p': {
    lessonId: 'llm-06',
    sectionId: 'top-p-and-combined-sampling',
    kind: 'diagram',
    role: 'comparison',
    tags: ['mechanism'],
    sourceIds: ['res-hf-llm', 'res-openai-cookbook', 'res-rasbt'],
    fixtureId: 'fixture-llm-06-temperature-top-p',
  },
  'visual-llm-06-kv-cache': {
    lessonId: 'llm-06',
    sectionId: 'kv-cache-reuse-memory-and-concurrency',
    kind: 'diagram',
    role: 'mechanism',
    tags: ['tradeoff', 'comparison'],
    sourceIds: ['res-hf-llm', 'res-rasbt', 'res-openai-cookbook'],
    fixtureId: 'fixture-llm-06-kv-cache',
  },
  'visual-llm-06-latency-breakdown': {
    lessonId: 'llm-06',
    sectionId: 'prefill-decode-and-latency-metrics',
    kind: 'diagram',
    role: 'boundary',
    tags: ['decision', 'tradeoff'],
    sourceIds: ['res-hf-llm', 'res-openai-cookbook'],
    fixtureId: 'fixture-llm-06-latency-breakdown',
  },
  'visual-llm-07-runtime-contract': {
    lessonId: 'llm-07', sectionId: 'prompt-as-runtime-contract',
    kind: 'diagram', role: 'overview', tags: ['boundary'],
    sourceIds: ['res-ms-genai', 'res-openai-cookbook', 'res-hf-agents'],
  },
  'visual-llm-07-instruction-boundary': {
    lessonId: 'llm-07', sectionId: 'instruction-and-untrusted-data-boundaries',
    kind: 'diagram', role: 'boundary', tags: ['failure-mode'],
    sourceIds: ['res-owasp-prompt-injection', 'res-ms-genai', 'res-hf-agents'],
  },
  'visual-llm-07-schema-pipeline': {
    lessonId: 'llm-07', sectionId: 'schema-and-structured-output',
    kind: 'diagram', role: 'mechanism', tags: ['process'],
    sourceIds: ['res-openai-cookbook', 'res-ms-genai', 'res-hf-agents'],
  },
  'visual-llm-07-retry-state-machine': {
    lessonId: 'llm-07', sectionId: 'validation-retry-and-side-effects',
    kind: 'diagram', role: 'mechanism', tags: ['failure-mode', 'process'],
    sourceIds: ['res-openai-cookbook', 'res-ms-genai', 'res-owasp-prompt-injection'],
    fixtureId: 'fixture-llm-07-retry-state-machine',
  },
  'visual-llm-07-version-eval-loop': {
    lessonId: 'llm-07', sectionId: 'observable-versioned-evaluation',
    kind: 'diagram', role: 'process', tags: ['decision'],
    sourceIds: ['res-openai-cookbook', 'res-llm-universe', 'res-ms-genai', 'res-owasp-prompt-injection'],
    fixtureId: 'fixture-llm-07-version-eval-loop',
  },
  'visual-llm-08-failure-map': {
    lessonId: 'llm-08', sectionId: 'failure-taxonomy-not-fluency',
    kind: 'diagram', role: 'overview', tags: ['boundary'],
    sourceIds: ['res-ms-genai', 'res-openai-cookbook', 'res-hf-agents'],
  },
  'visual-llm-08-grounding-chain': {
    lessonId: 'llm-08', sectionId: 'evidence-grounding-and-uncertainty',
    kind: 'diagram', role: 'mechanism', tags: ['failure-mode', 'process'],
    sourceIds: ['res-openai-cookbook', 'res-ms-genai', 'res-llm-universe'],
  },
  'visual-llm-08-eval-funnel': {
    lessonId: 'llm-08', sectionId: 'eval-dataset-and-slices',
    kind: 'diagram', role: 'process', tags: ['decision'],
    sourceIds: ['res-openai-evals', 'res-openai-cookbook', 'res-ms-genai', 'res-hf-agents'],
    fixtureId: 'fixture-llm-08-eval-funnel',
  },
  'visual-llm-08-injection-defense': {
    lessonId: 'llm-08', sectionId: 'prompt-injection-threat-model',
    kind: 'diagram', role: 'mechanism', tags: ['boundary', 'failure-mode'],
    sourceIds: ['res-owasp-prompt-injection'],
  },
  'visual-llm-08-release-pareto': {
    lessonId: 'llm-08', sectionId: 'defense-in-depth-and-runtime-operations',
    kind: 'diagram', role: 'decision', tags: ['comparison', 'tradeoff'],
    sourceIds: ['res-owasp-prompt-injection', 'res-hf-agents', 'res-ms-genai', 'res-anthropic-agents'],
    fixtureId: 'fixture-llm-08-release-pareto',
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

test('treats high training and validation loss as suspected underfitting rather than a threshold-free verdict', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual =
    knowledgeVisualsById['visual-llm-02-generalization-curves'];
  const svg = await readFile(visual.assetPath, 'utf8');
  const visibleText = visibleSvgText(svg, visual.assetPath);

  assert.match(visibleText, /训练\/验证仍高.*疑似欠拟合/s);
  assert.match(visibleText, /任务基线.*阈值|阈值.*任务基线/);
  assert.doesNotMatch(visibleText, /①\s*欠拟合/);

  for (const field of ['alt', 'longDescription', 'caption']) {
    assert.match(visual[field], /训练\/验证.*仍高.*疑似欠拟合/s, field);
    assert.match(visual[field], /任务基线.*阈值|阈值.*任务基线/, field);
  }
});

test('keeps the suspected-underfitting qualifier clear of both visible curves', async () => {
  const assetPath =
    'assets/visuals/llm-foundation/llm-02-generalization-curves.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const qualifier = parsed.elements.find(
    (node) =>
      node.name === 'text'
      && node.text.includes('绝对损失需任务基线'),
  );
  const firstPanelCurves = (parsed.elementsByName.get('polyline') ?? []).slice(
    0,
    2,
  );

  assert.ok(qualifier, '必须有可见的任务基线/阈值限定');
  assert.equal(firstPanelCurves.length, 2, '第一面板必须有两条曲线');
  const qualifierBottom =
    Number(qualifier.attributes.get('y'))
    + Number(qualifier.attributes.get('font-size'));
  for (const curve of firstPanelCurves) {
    const minimumY = Math.min(
      ...curve.attributes
        .get('points')
        .trim()
        .split(/\s+/)
        .map((point) => Number(point.split(',')[1])),
    );
    assert.ok(
      minimumY >= qualifierBottom,
      `曲线 y=${minimumY} 不得遮挡限定文字底部 y=${qualifierBottom}`,
    );
  }
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

test('publishes exactly five frozen visual references per llm-01–08 lesson with all coverage groups', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.deepEqual(
    llmFoundationVisuals.map(({ id }) => id).sort(),
    [...EXPECTED_VISUAL_IDS].sort(),
    '01–08 registry 必须精确使用冻结的四十个 visual ID',
  );
  assert.equal(llmFoundationVisuals.length, 40);

  for (const lessonId of VISUALIZED_LESSON_IDS) {
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

test('places every published llm-01–08 visual once in its evidence-owning real section', async () => {
  const { knowledgeVisuals } = await loadRegistry();
  const result = await validateKnowledgeVisualOwnership({
    courseRegistry: { 'llm-foundation': llmFoundation },
    knowledgeVisuals: knowledgeVisuals.filter(({ id }) => id.startsWith('visual-llm-')),
    assetExists: async (assetPath) => {
      await access(assetPath);
      return true;
    },
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.placements.length, 40);

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
  const llm05 = llmFoundation.lessons.find(({ id }) => id === 'llm-05');
  assert.equal(llm05.knowledgeNote.overviewVisualId, 'visual-llm-05-method-map');
  assert.equal(llm05.knowledgeNote.overviewVisualSectionId, 'objectives-before-methods');
  const llm06 = llmFoundation.lessons.find(({ id }) => id === 'llm-06');
  assert.equal(llm06.knowledgeNote.overviewVisualId, 'visual-llm-06-generation-loop');
  assert.equal(
    llm06.knowledgeNote.overviewVisualSectionId,
    'sampling-experiment-and-serving-tradeoffs',
  );
  const llm07 = llmFoundation.lessons.find(({ id }) => id === 'llm-07');
  assert.equal(llm07.knowledgeNote.overviewVisualId, 'visual-llm-07-runtime-contract');
  assert.equal(llm07.knowledgeNote.overviewVisualSectionId, 'prompt-as-runtime-contract');
  const llm08 = llmFoundation.lessons.find(({ id }) => id === 'llm-08');
  assert.equal(llm08.knowledgeNote.overviewVisualId, 'visual-llm-08-failure-map');
  assert.equal(llm08.knowledgeNote.overviewVisualSectionId, 'failure-taxonomy-not-fluency');

  for (const lesson of llmFoundation.lessons.filter(({ id }) =>
    VISUALIZED_LESSON_IDS.includes(id),
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
    'visual-llm-05-stage-objectives': 1,
    'visual-llm-05-preference-boundary': 2,
    'visual-llm-05-lora-update': 1,
    'visual-llm-05-rag-finetune-matrix': 2,
    'visual-llm-06-logit-softmax': 2,
    'visual-llm-06-temperature-top-p': 2,
    'visual-llm-06-kv-cache': 2,
    'visual-llm-06-latency-breakdown': 3,
    'visual-llm-07-instruction-boundary': 2,
    'visual-llm-07-schema-pipeline': 2,
    'visual-llm-07-retry-state-machine': 2,
    'visual-llm-07-version-eval-loop': 2,
    'visual-llm-08-grounding-chain': 2,
    'visual-llm-08-eval-funnel': 2,
    'visual-llm-08-injection-defense': 2,
    'visual-llm-08-release-pareto': 3,
  };

  for (const lesson of llmFoundation.lessons.filter(({ id }) =>
    VISUALIZED_LESSON_IDS.includes(id),
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

test('keeps all forty llm-01–08 registry records aligned with frozen roles, tags, sources and fixtures', async () => {
  const { llmFoundationVisuals } = await loadLlmRegistry();
  assert.equal(llmFoundationVisuals.length, 40);
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
    'llm-05': 5,
    'llm-06': 5,
    'llm-07': 5,
    'llm-08': 5,
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

test('keeps generation-loop as five ordered, strictly cumulative and renderable teaching steps', async () => {
  const { knowledgeVisualsById } = await loadRegistry();
  const visual = knowledgeVisualsById['visual-llm-06-generation-loop'];
  assert.equal(visual.kind, 'step-diagram');
  assert.equal(validateRenderableVisual(visual).valid, true);
  assert.deepEqual(
    visual.steps.map(({ id }) => id),
    ['raw-logits', 'temperature', 'softmax', 'nucleus', 'sample'],
  );
  assert.deepEqual(
    visual.steps.map(({ assetPath }) => assetPath),
    [1, 2, 3, 4, 5].map(
      (step) => `assets/visuals/llm-foundation/llm-06-generation-loop-step-${step}.svg`,
    ),
  );

  const phases = ['raw', 'temperature', 'softmax', 'nucleus', 'sample'];
  const snapshots = [];
  for (let stepNumber = 1; stepNumber <= phases.length; stepNumber += 1) {
    const assetPath = visual.steps[stepNumber - 1].assetPath;
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
      assert.equal(
        expectedState === 'active' ? activeElements.length >= 4 : activeElements.length,
        expectedState === 'active' ? true : 0,
      );
      phaseStates.set(phase, activeElements);
    }
    snapshots.push(phaseStates);
  }
  phases.forEach((phase, phaseIndex) => {
    const canonical = snapshots[phaseIndex].get(phase);
    for (let later = phaseIndex + 1; later < snapshots.length; later += 1) {
      assert.deepEqual(snapshots[later].get(phase), canonical, `${phase} 后续步骤不得改值或移动`);
    }
  });
});

test('freezes qualitative llm-05 structures as explicit nodes, routes and boundaries', async () => {
  const requirements = {
    'visual-llm-05-method-map': {
      nodes: ['business-failure', 'capability', 'behavior', 'knowledge', 'evidence', 'pretrain', 'sft', 'preference', 'lora', 'rag', 'evaluation'],
      edges: ['capability-pretrain', 'behavior-sft', 'behavior-preference', 'behavior-lora', 'knowledge-rag', 'evidence-rag'],
    },
    'visual-llm-05-stage-objectives': {
      nodes: ['base-model', 'pretraining', 'continued-pretraining', 'sft', 'evaluation'],
      edges: ['base-pretrain', 'pretrain-continue', 'continue-sft', 'sft-evaluate'],
    },
    'visual-llm-05-preference-boundary': {
      nodes: ['prompt', 'answer-a', 'answer-b', 'preference-label', 'optimization-signal', 'behavior-distribution', 'helpful', 'safe', 'informative', 'calibrated'],
      edges: ['prompt-a', 'prompt-b', 'answers-label', 'label-signal', 'signal-distribution'],
    },
  };
  for (const [visualId, expected] of Object.entries(requirements)) {
    const assetPath = `assets/visuals/llm-foundation/${visualId.replace('visual-', '')}.svg`;
    const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
    const nodes = new Set(
      parsed.elements
        .filter((node) => node.attributes.get('data-region') === 'teaching-node')
        .map((node) => node.attributes.get('data-node')),
    );
    const edges = new Set(
      parsed.elements
        .filter((node) => node.attributes.get('data-region') === 'teaching-edge')
        .map((node) => node.attributes.get('data-edge')),
    );
    expected.nodes.forEach((node) => assert.ok(nodes.has(node), `${visualId} 缺少 ${node}`));
    expected.edges.forEach((edge) => assert.ok(edges.has(edge), `${visualId} 缺少 ${edge}`));
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
    node.text.replace(/\s+/g, ''),
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

test('encodes every llm-05–06 quantitative fixture input, method, result and rounding in visible SVG text', async () => {
  const expectations = {
    'visual-llm-05-lora-update': ['冻结 W 为 4×4', 'ΔW=BA', 'adapter 参数', '8 vs fullParameters 16', 'Rounding：整数原样'],
    'visual-llm-05-rag-finetune-matrix': ['高阈值 = 3', 'updateFrequency', 'citationNeed', 'stableBehavior', 'hasExamples', 'RAG', 'SFT/LoRA', 'insufficient evidence—do not fine-tune', 'Rounding：等级为整数'],
    'visual-llm-06-generation-loop': ['logits 0/2/1', 'T=1', 'top-p=.8', 'u=.7', 'stable', 'softmax', '最小', 'nucleus', '逆 CDF', '0.0900', '0.6652', '0.2447', '0.7311/0.2689', 'selected A', 'EOS', 'Rounding：概率四位小数'],
    'visual-llm-06-logit-softmax': ['logits=[2,1,0]', 'stable softmax', '1.0000 / 0.3679 / 0.1353', '0.6652 / 0.2447 / 0.0900', 'sum = 1.0000', 'greedy = A', 'Rounding：指数与概率四位小数'],
    'visual-llm-06-temperature-top-p': ['logits 0 / 2 / 1', 'T = 0.5 / 1 / 2', 'top-p = 0.8', '0.0159', '0.8668', '0.5065', 'nucleus = A / B', 'Rounding：概率四位小数'],
    'visual-llm-06-kv-cache': ['layers=2', 'length=4', 'KV heads=1', 'head dim=2', '预算 576 bytes', '64 bytes/seq', '9 并发', '128 bytes/seq', '4 并发', 'Rounding：bytes 与序列数为整数'],
    'visual-llm-06-latency-breakdown': ['queue=40', 'prefill=80', '首包=20', '5 个 decode', 'TTFT 140', 'E2E', '240 ms', 'rank 19', 'P95 = 280 ms', 'max = 500 ms', 'Rounding：毫秒整数'],
  };
  const { knowledgeVisualsById } = await loadRegistry();
  for (const [visualId, fragments] of Object.entries(expectations)) {
    const visual = knowledgeVisualsById[visualId];
    const fixture = fixtureForVisual(visualId);
    const visibleText = visibleSvgText(await readFile(visual.assetPath, 'utf8'), visual.assetPath);
    assertSvgIncludes(visibleText, fixture.fields.Rounding);
    fragments.forEach((fragment) => assertSvgIncludes(visibleText, fragment));
  }
});

test('maps LoRA delta cells and inference distributions to fixture-derived geometry', async () => {
  const lora = fixtureForVisual('visual-llm-05-lora-update');
  const loraPath = 'assets/visuals/llm-foundation/llm-05-lora-update.svg';
  const loraParsed = parseStrictSvg(await readFile(loraPath, 'utf8'), loraPath);
  const cells = loraParsed.elements.filter(
    (node) => node.attributes.get('data-region') === 'lora-delta-cell',
  );
  assert.equal(cells.length, 16);
  cells.forEach((cell) => {
    const row = Number(cell.attributes.get('data-row'));
    const column = Number(cell.attributes.get('data-column'));
    assert.equal(Number(cell.attributes.get('data-value')), lora.result.deltaW[row][column]);
    assert.equal(Number(cell.attributes.get('x')), 686 + column * 84);
    assert.equal(Number(cell.attributes.get('y')), 174 + row * 44);
  });

  for (const visualId of ['visual-llm-06-logit-softmax', 'visual-llm-06-temperature-top-p']) {
    const fixture = fixtureForVisual(visualId);
    const path = `assets/visuals/llm-foundation/${visualId.replace('visual-', '')}.svg`;
    const parsed = parseStrictSvg(await readFile(path, 'utf8'), path);
    const bars = parsed.elements.filter(
      (node) => node.attributes.get('data-region') === (
        visualId.endsWith('logit-softmax') ? 'probability-bar' : 'temperature-bar'
      ),
    );
    const expected = visualId.endsWith('logit-softmax')
      ? fixture.result.probabilities
      : fixture.result.distributions.flat();
    assert.equal(bars.length, expected.length);
    bars.forEach((bar, index) => {
      assert.ok(Math.abs(Number(bar.attributes.get('data-value')) - expected[index]) < 1e-12);
      assert.equal(Number(bar.attributes.get('width')), Math.round(expected[index] * (visualId.endsWith('logit-softmax') ? 260 : 100)));
    });
  }
});

test('models the complete service loop, LoRA paths, RAG axes, latency diagnosis and KV capacity as structure', async () => {
  const parse = async (name) => {
    const path = `assets/visuals/llm-foundation/${name}.svg`;
    return parseStrictSvg(await readFile(path, 'utf8'), path);
  };
  const generation = await parse('llm-06-generation-loop');
  const generationNodes = new Set(generation.elements.filter((n) => n.attributes.get('data-region') === 'service-node').map((n) => n.attributes.get('data-node')));
  ['input', 'prefill', 'decode', 'logits', 'sampling', 'append-kv', 'eos', 'stop-sequence', 'max-tokens', 'business-complete'].forEach((id) => assert.ok(generationNodes.has(id), id));
  const generationEdges = new Set(generation.elements.filter((n) => n.attributes.get('data-region') === 'service-edge').map((n) => n.attributes.get('data-edge')));
  ['input-prefill', 'prefill-decode', 'decode-logits', 'logits-sampling', 'sampling-append', 'append-decode', 'sampling-eos', 'sampling-stop', 'sampling-max', 'sampling-business'].forEach((id) => assert.ok(generationEdges.has(id), id));
  const phaseDirections = generation.elements.filter((n) => n.attributes.get('data-region') === 'phase-direction');
  assert.deepEqual(
    phaseDirections.map((n) => `${n.attributes.get('data-from')}->${n.attributes.get('data-to')}`),
    ['raw->temperature', 'temperature->softmax', 'softmax->nucleus', 'nucleus->sample'],
  );
  const generationFixture = fixtureForVisual('visual-llm-06-generation-loop');
  const generationValues = Object.fromEntries(generation.elements.filter((n) => n.attributes.get('data-region') === 'generation-value').map((n) => [n.attributes.get('data-kind'), n.attributes.get('data-value')]));
  assert.equal(generationValues.candidates, generationFixture.data.candidates.join(','));
  assert.equal(generationValues.logits, generationFixture.data.logits.join(','));
  assert.equal(Number(generationValues.temperature), generationFixture.data.temperature);
  assert.equal(Number(generationValues['top-p']), generationFixture.data.topP);
  assert.equal(Number(generationValues['uniform-sample']), generationFixture.data.uniformSample);
  assert.equal(generationValues.selected, generationFixture.result.selected);
  assert.equal(generationValues['next-token'], generationFixture.result.nextToken);
  const probabilityBars = generation.elements.filter((n) => n.attributes.get('data-region') === 'generation-probability');
  generationFixture.data.candidates.forEach((token, index) => {
    const bar = probabilityBars.find((node) => node.attributes.get('data-token') === token);
    assert.ok(Math.abs(Number(bar.attributes.get('data-value')) - generationFixture.result.probabilities[index]) < 1e-12);
    assert.ok(Math.abs(Number(bar.attributes.get('width')) - generationFixture.result.probabilities[index] * 160) < 0.0001);
  });
  const nucleusMembers = generation.elements.filter((n) => n.attributes.get('data-region') === 'nucleus-member');
  generationFixture.result.nucleus.forEach((token, index) => {
    const member = nucleusMembers[index];
    assert.equal(member.attributes.get('data-token'), token);
    assert.ok(Math.abs(Number(member.attributes.get('data-value')) - generationFixture.result.renormalized[index]) < 1e-12);
    assert.ok(Math.abs(Number(member.attributes.get('width')) - generationFixture.result.renormalized[index] * 160) < 0.0001);
    if (index) {
      const previous = nucleusMembers[index - 1];
      assert.ok(Math.abs(Number(member.attributes.get('x')) - (Number(previous.attributes.get('x')) + Number(previous.attributes.get('width')))) < 0.0001);
    }
  });
  const cdfSample = generation.elements.find((n) => n.attributes.get('data-region') === 'cdf-sample');
  assert.equal(Number(cdfSample.attributes.get('data-value')), generationFixture.data.uniformSample);
  assert.equal(Number(cdfSample.attributes.get('x1')), 954 + generationFixture.data.uniformSample * 160);
  assert.equal(cdfSample.attributes.get('x1'), cdfSample.attributes.get('x2'));

  const lora = await parse('llm-05-lora-update');
  const loraNodes = new Set(lora.elements.filter((n) => n.attributes.get('data-region') === 'lora-node').map((n) => n.attributes.get('data-node')));
  ['x', 'wx', 'ax', 'bax', 'plus', 'adapted-output', 'train-boundary', 'deploy-boundary'].forEach((id) => assert.ok(loraNodes.has(id), id));
  const loraEdges = new Set(lora.elements.filter((n) => n.attributes.get('data-region') === 'lora-edge').map((n) => n.attributes.get('data-edge')));
  ['x-wx', 'x-ax', 'ax-bax', 'wx-plus', 'bax-plus', 'plus-output'].forEach((id) => assert.ok(loraEdges.has(id), id));
  const expectedLoraEdges = {
    'x-wx': ['x', 'wx'], 'x-ax': ['x', 'ax'], 'ax-bax': ['ax', 'bax'],
    'wx-plus': ['wx', 'plus'], 'bax-plus': ['bax', 'plus'],
    'plus-output': ['plus', 'adapted-output'],
  };
  lora.elements.filter((n) => n.attributes.get('data-region') === 'lora-edge').forEach((edge) => {
    assert.deepEqual(
      [edge.attributes.get('data-from'), edge.attributes.get('data-to')],
      expectedLoraEdges[edge.attributes.get('data-edge')],
    );
  });

  const rag = await parse('llm-05-rag-finetune-matrix');
  const ragFixture = fixtureForVisual('visual-llm-05-rag-finetune-matrix');
  const ragCells = rag.elements.filter((n) => n.attributes.get('data-region') === 'rag-axis-cell');
  assert.equal(ragCells.length, 24);
  ragFixture.data.cases.forEach((item, row) => {
    const expected = { ...item.axes, hasExamples: item.hasExamples };
    Object.entries(expected).forEach(([column, value]) => {
      const cell = ragCells.find((node) =>
        node.attributes.get('data-row') === String(row)
        && node.attributes.get('data-column') === column,
      );
      assert.ok(cell, `${row}/${column}`);
      assert.equal(cell.attributes.get('data-value'), String(value));
    });
  });
  const ragEvaluations = rag.elements.filter((n) => n.attributes.get('data-region') === 'rag-evaluation');
  assert.equal(ragEvaluations.length, 4);
  ragFixture.result.decisions.forEach((decision, row) => {
    const evaluation = ragEvaluations.find((node) => node.attributes.get('data-row') === String(row));
    assert.equal(evaluation.attributes.get('data-value'), [
      decision.evaluationProfile.riskControl,
      decision.evaluationProfile.costCheck,
      decision.nextStep,
    ].join('|'));
  });
  const latency = await parse('llm-06-latency-breakdown');
  assert.equal(latency.elements.filter((n) => n.attributes.get('data-region') === 'latency-diagnostic-row').length, 4);
  const latencyFixture = fixtureForVisual('visual-llm-06-latency-breakdown');
  const latencySegments = latency.elements.filter((n) => n.attributes.get('data-region') === 'latency-segment');
  const segmentValues = [
    latencyFixture.data.queueMs,
    latencyFixture.data.prefillMs,
    latencyFixture.data.firstPacketMs,
    latencyFixture.data.decodeIntervalsMs.reduce((sum, value) => sum + value, 0),
  ];
  latencySegments.forEach((segment, index) => {
    assert.equal(Number(segment.attributes.get('data-value')), segmentValues[index]);
    assert.equal(Number(segment.attributes.get('width')), segmentValues[index] * 4);
    if (index) {
      const previous = latencySegments[index - 1];
      assert.equal(
        Number(segment.attributes.get('x')),
        Number(previous.attributes.get('x')) + Number(previous.attributes.get('width')),
      );
    }
  });
  const p95 = latency.elements.find((n) => n.attributes.get('data-region') === 'p95-marker');
  assert.equal(Number(p95.attributes.get('data-index')), latencyFixture.result.nearestRank);
  assert.equal(Number(p95.attributes.get('data-value')), latencyFixture.result.p95Ms);
  const latencyText = visibleSvgText(await readFile('assets/visuals/llm-foundation/llm-06-latency-breakdown.svg', 'utf8'), 'latency');
  assertSvgIncludes(latencyText, 'TPOT = 20 ms');
  const kv = await parse('llm-06-kv-cache');
  const kvFixture = fixtureForVisual('visual-llm-06-kv-cache');
  const capacity = Object.fromEntries(kv.elements.filter((n) => n.attributes.get('data-region') === 'kv-capacity-block').map((n) => [n.attributes.get('data-kind'), Number(n.attributes.get('data-value'))]));
  assert.deepEqual(capacity, {
    'bytes-per-sequence': kvFixture.result.bytesPerSequence,
    concurrency: kvFixture.result.maxSequences,
    'doubled-bytes-per-sequence': kvFixture.result.doubledLengthBytesPerSequence,
    'doubled-concurrency': kvFixture.result.doubledLengthMaxSequences,
  });
  assert.equal(kv.elements.filter((n) => n.attributes.get('data-region') === 'kv-cache-read').length, 3);
  kvFixture.data.decodeSteps.forEach(({ step: fixtureStep, history, current }) => {
    const step = String(fixtureStep);
    const recomputedHistory = kv.elements.filter((n) =>
      n.attributes.get('data-region') === 'kv-recompute-history'
      && n.attributes.get('data-step') === step,
    );
    const recomputedCurrent = kv.elements.filter((n) =>
      n.attributes.get('data-region') === 'kv-recompute-current'
      && n.attributes.get('data-step') === step,
    );
    assert.equal(recomputedHistory.length, history);
    assert.equal(recomputedCurrent.length, current);
    recomputedHistory.forEach((block, blockIndex) => {
      assert.equal(Number(block.attributes.get('data-index')), blockIndex);
      if (blockIndex) assert.ok(Number(block.attributes.get('x')) > Number(recomputedHistory[blockIndex - 1].attributes.get('x')));
    });
    const cachedHistory = kv.elements.filter((n) =>
      n.attributes.get('data-region') === 'kv-cache-history'
      && n.attributes.get('data-step') === step,
    );
    const cachedCurrent = kv.elements.filter((n) =>
      n.attributes.get('data-region') === 'kv-cache-current'
      && n.attributes.get('data-step') === step,
    );
    assert.equal(cachedHistory.length, history);
    assert.equal(cachedCurrent.length, current);
    assert.equal(recomputedHistory.length + recomputedCurrent.length, history + current);
    assert.equal(cachedHistory.length + cachedCurrent.length, history + current);
    assert.ok(Number(cachedCurrent[0].attributes.get('x')) > Number(cachedHistory.at(-1).attributes.get('x')));
    const edge = kv.elements.find((n) => n.attributes.get('data-edge') === `read-append-${step}`);
    assert.deepEqual(
      [edge.attributes.get('data-from'), edge.attributes.get('data-to')],
      [`history-${step}`, `append-${step}`],
    );
  });
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

test('keeps every llm-01–08 SVG label at least 26px with a 32px viewBox safety margin', async () => {
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

test('plots every sorted latency sample on a visible rank axis with fixture-derived geometry', async () => {
  const visualId = 'visual-llm-06-latency-breakdown';
  const fixture = fixtureForVisual(visualId);
  const assetPath = 'assets/visuals/llm-foundation/llm-06-latency-breakdown.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const plot = parsed.elements.find(
    (node) => node.attributes.get('data-region') === 'latency-rank-plot',
  );
  assert.ok(plot, '必须声明可见的 rank 排序图');
  const originX = finiteNumberAttribute(plot, 'data-origin-x', 'latency-rank-plot');
  const stepX = finiteNumberAttribute(plot, 'data-scale', 'latency-rank-plot');
  const sortedSamples = [...fixture.data.samplesMs].sort((a, b) => a - b);
  const points = parsed.elements.filter(
    (node) => node.name === 'rect' && node.attributes.get('data-region') === 'latency-rank-point',
  );
  assert.equal(points.length, sortedSamples.length);
  sortedSamples.forEach((expectedValue, index) => {
    const rank = index + 1;
    const point = points.find((node) => node.attributes.get('data-index') === String(rank));
    assert.ok(point, `rank ${rank} 必须有可见点`);
    assert.equal(finiteNumberAttribute(point, 'data-value', `rank ${rank}`), expectedValue);
    assert.equal(finiteNumberAttribute(point, 'x', `rank ${rank}`), originX + index * stepX);
    assert.ok(finiteNumberAttribute(point, 'width', `rank ${rank}`) > 0);
    assert.ok(finiteNumberAttribute(point, 'height', `rank ${rank}`) > 0);
  });
  const marker = parsed.elements.find(
    (node) => node.attributes.get('data-region') === 'p95-marker',
  );
  assert.equal(finiteNumberAttribute(marker, 'data-index', 'p95-marker'), fixture.result.nearestRank);
  assert.equal(finiteNumberAttribute(marker, 'data-value', 'p95-marker'), fixture.result.p95Ms);
  assert.equal(
    finiteNumberAttribute(marker, 'x1', 'p95-marker'),
    originX + (fixture.result.nearestRank - 1) * stepX,
  );
  assert.ok(finiteNumberAttribute(marker, 'y2', 'p95-marker') > finiteNumberAttribute(marker, 'y1', 'p95-marker'));
  assert.equal(
    finiteNumberAttribute(points.at(-1), 'data-value', 'max-rank-point'),
    fixture.result.maxMs,
  );
});

test('contains every KV history and append block inside its visible decode card', async () => {
  const assetPath = 'assets/visuals/llm-foundation/llm-06-kv-cache.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  for (const mode of ['recompute', 'cached']) {
    for (const step of ['1', '2', '3']) {
      const cardRegion = mode === 'recompute' ? 'kv-recompute-stage' : 'kv-cache-read';
      const card = parsed.elements.find(
        (node) =>
          node.name === 'rect'
          && node.attributes.get('data-region') === cardRegion
          && node.attributes.get('data-step') === step,
      );
      assert.ok(card, `${mode} step ${step} 必须有可检查的可见卡片`);
      const cardLeft = finiteNumberAttribute(card, 'x', `${mode}-${step}`);
      const cardTop = finiteNumberAttribute(card, 'y', `${mode}-${step}`);
      const cardRight = cardLeft + finiteNumberAttribute(card, 'width', `${mode}-${step}`);
      const cardBottom = cardTop + finiteNumberAttribute(card, 'height', `${mode}-${step}`);
      const blockRegions = mode === 'recompute'
        ? ['kv-recompute-history', 'kv-recompute-current']
        : ['kv-cache-history', 'kv-cache-current'];
      const blocks = parsed.elements.filter(
        (node) =>
          node.name === 'rect'
          && blockRegions.includes(node.attributes.get('data-region'))
          && node.attributes.get('data-step') === step,
      );
      assert.ok(blocks.length > 0, `${mode} step ${step} 必须有历史/追加块`);
      for (const block of blocks) {
        const left = finiteNumberAttribute(block, 'x', `${mode}-${step}-block`);
        const top = finiteNumberAttribute(block, 'y', `${mode}-${step}-block`);
        const right = left + finiteNumberAttribute(block, 'width', `${mode}-${step}-block`);
        const bottom = top + finiteNumberAttribute(block, 'height', `${mode}-${step}-block`);
        assert.ok(left >= cardLeft && right <= cardRight, `${mode} step ${step} 块横向越出卡片`);
        assert.ok(top >= cardTop && bottom <= cardBottom, `${mode} step ${step} 块纵向越出卡片`);
      }
    }
  }
});

test('derives equal recompute and cached decode totals from fixture history plus current positions', async () => {
  const fixture = fixtureForVisual('visual-llm-06-kv-cache');
  assert.equal(fixture.data.decodeSteps.length, 3);
  const assetPath = 'assets/visuals/llm-foundation/llm-06-kv-cache.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  fixture.data.decodeSteps.forEach(({ step, history, current }) => {
    const stepKey = String(step);
    const recomputeHistory = parsed.elements.filter((node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'kv-recompute-history'
      && node.attributes.get('data-step') === stepKey,
    );
    const recomputeCurrent = parsed.elements.filter((node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'kv-recompute-current'
      && node.attributes.get('data-step') === stepKey,
    );
    const cachedHistory = parsed.elements.filter((node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'kv-cache-history'
      && node.attributes.get('data-step') === stepKey,
    );
    const cachedCurrent = parsed.elements.filter((node) =>
      node.name === 'rect'
      && node.attributes.get('data-region') === 'kv-cache-current'
      && node.attributes.get('data-step') === stepKey,
    );
    assert.equal(recomputeHistory.length, history, `recompute step ${step} history`);
    assert.equal(recomputeCurrent.length, current, `recompute step ${step} current`);
    assert.equal(cachedHistory.length, history, `cached step ${step} history`);
    assert.equal(cachedCurrent.length, current, `cached step ${step} current`);
    assert.equal(recomputeHistory.length + recomputeCurrent.length, history + current);
    assert.equal(cachedHistory.length + cachedCurrent.length, history + current);
    [...recomputeHistory, ...recomputeCurrent, ...cachedHistory, ...cachedCurrent]
      .forEach((block) => {
        assert.ok(finiteNumberAttribute(block, 'width', `kv-step-${step}`) > 0);
        assert.ok(finiteNumberAttribute(block, 'height', `kv-step-${step}`) > 0);
      });
  });
});

test('keeps LoRA deployment copy inside its box with baseline safety margins', async () => {
  const assetPath = 'assets/visuals/llm-foundation/llm-05-lora-update.svg';
  const parsed = parseStrictSvg(await readFile(assetPath, 'utf8'), assetPath);
  const boundary = parsed.elements.find((node) =>
    node.name === 'rect'
    && node.attributes.get('data-region') === 'lora-node'
    && node.attributes.get('data-node') === 'deploy-boundary',
  );
  assert.ok(boundary);
  const left = finiteNumberAttribute(boundary, 'x', 'deploy-boundary');
  const top = finiteNumberAttribute(boundary, 'y', 'deploy-boundary');
  const right = left + finiteNumberAttribute(boundary, 'width', 'deploy-boundary');
  const bottom = top + finiteNumberAttribute(boundary, 'height', 'deploy-boundary');
  const labels = parsed.elements.filter((node) =>
    node.name === 'text' && node.attributes.get('data-region') === 'lora-deploy-text',
  );
  assert.equal(labels.length, 3);
  const baselines = labels.map((label) => finiteNumberAttribute(label, 'y', 'deploy-text'));
  labels.forEach((label) => {
    const x = finiteNumberAttribute(label, 'x', 'deploy-text');
    const fontSize = finiteNumberAttribute(label, 'font-size', 'deploy-text');
    const estimatedWidth = [...label.text].reduce((width, character) => {
      if (/\s/u.test(character)) return width + fontSize * 0.32;
      if (/[\p{Script=Han}：，。；、]/u.test(character)) return width + fontSize;
      return width + fontSize * 0.58;
    }, 0);
    assert.ok(x >= left + 20);
    assert.ok(x + estimatedWidth <= right - 14, `${label.text} 必须保留右侧安全边距`);
  });
  assert.ok(baselines[0] >= top + 30);
  assert.ok(baselines[1] - baselines[0] >= 28);
  assert.ok(baselines[2] - baselines[1] >= 28);
  assert.ok(baselines.at(-1) <= bottom - 14);
});
