import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { llmFoundationVisuals } from '../src/data/visuals/llm-foundation-visuals.js';
import { llmFoundationVisualFixtures } from './fixtures/llm-foundation-visual-fixtures.js';
import { parseStrictSvg } from './helpers/static-svg.js';

const FIXTURES = new Map(
  llmFoundationVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
);
const knowledgeVisualsById = Object.fromEntries(
  llmFoundationVisuals.map((visual) => [visual.id, visual]),
);

async function parseAsset(assetPath) {
  const svg = await readFile(assetPath, 'utf8');
  return { svg, parsed: parseStrictSvg(svg, assetPath) };
}

function visibleText(parsed) {
  return (parsed.elementsByName.get('text') ?? [])
    .map((node) => node.text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function descriptionText(parsed) {
  return (parsed.elementsByName.get('desc') ?? [])
    .map((node) => node.text.replace(/\s+/g, ' ').trim())
    .join('\n');
}

test('keeps final visible concepts aligned with registry metadata and SVG descriptions', async () => {
  const expectations = {
    'visual-llm-05-lora-update': {
      visible: ['Wx', 'Ax', 'B(Ax)', '适配后输出', '训练', '部署'],
      metadata: ['Wx', 'Ax', 'B(Ax)', '适配后输出', '训练', '部署'],
    },
    'visual-llm-05-rag-finetune-matrix': {
      visible: ['更新', '引用', '稳定', '预算', '风险', '示例', '风险切片', '成本'],
      metadata: ['updateFrequency', 'citationNeed', 'stableBehavior', 'computeBudget', 'risk', 'hasExamples', 'riskControl', 'costCheck'],
    },
    'visual-llm-06-generation-loop': {
      visible: ['prefill', 'decode', 'KV', 'EOS', 'stop 序列', 'max tokens', '业务完成'],
      metadata: ['prefill', 'decode', 'KV', 'EOS', 'stop sequence', 'max tokens', '业务完成'],
    },
    'visual-llm-06-latency-breakdown': {
      visible: ['TPOT', 'Queue 高', 'Prefill 慢', 'Decode 慢', 'P95 尾异常'],
      metadata: ['TPOT', 'Queue 高', 'Prefill 慢', 'Decode 慢', 'P95 尾异常'],
    },
  };

  for (const [visualId, expected] of Object.entries(expectations)) {
    const visual = knowledgeVisualsById[visualId];
    const { parsed } = await parseAsset(visual.assetPath);
    const onCanvas = visibleText(parsed);
    const metadata = `${visual.alt}\n${visual.longDescription}`;
    const desc = descriptionText(parsed);
    expected.visible.forEach((fragment) => assert.ok(onCanvas.includes(fragment), `${visualId} visible: ${fragment}`));
    expected.metadata.forEach((fragment) => {
      assert.ok(metadata.includes(fragment), `${visualId} metadata: ${fragment}`);
      assert.ok(desc.includes(fragment), `${visualId} desc: ${fragment}`);
    });
  }
});

test('binds generation probabilities, nucleus and CDF to visible cumulative geometry', async () => {
  const visual = knowledgeVisualsById['visual-llm-06-generation-loop'];
  const fixture = FIXTURES.get('visual-llm-06-generation-loop');
  const paths = {
    main: visual.assetPath,
    step3: visual.steps[2].assetPath,
    step4: visual.steps[3].assetPath,
    step5: visual.steps[4].assetPath,
  };
  const parsedByStage = {};
  for (const [stage, assetPath] of Object.entries(paths)) {
    parsedByStage[stage] = (await parseAsset(assetPath)).parsed;
  }

  for (const stage of ['main', 'step3', 'step4', 'step5']) {
    const bars = parsedByStage[stage].elements.filter(
      (node) => node.name === 'rect' && node.attributes.get('data-region') === 'generation-probability',
    );
    assert.equal(bars.length, 3, `${stage} probability bars`);
    fixture.data.candidates.forEach((token, index) => {
      const bar = bars.find((node) => node.attributes.get('data-token') === token);
      assert.equal(Number(bar.attributes.get('data-value')), fixture.result.probabilities[index]);
      assert.ok(Math.abs(Number(bar.attributes.get('width')) - 160 * fixture.result.probabilities[index]) < 0.0001);
    });
  }

  for (const stage of ['main', 'step4', 'step5']) {
    const members = parsedByStage[stage].elements.filter(
      (node) => node.name === 'rect' && node.attributes.get('data-region') === 'nucleus-member',
    );
    assert.equal(members.length, 2, `${stage} nucleus members`);
    fixture.result.nucleus.forEach((token, index) => {
      assert.equal(members[index].attributes.get('data-token'), token);
      assert.equal(Number(members[index].attributes.get('data-value')), fixture.result.renormalized[index]);
      assert.ok(Math.abs(Number(members[index].attributes.get('width')) - 160 * fixture.result.renormalized[index]) < 0.0001);
    });
    assert.ok(Math.abs(
      Number(members[1].attributes.get('x'))
      - Number(members[0].attributes.get('x'))
      - Number(members[0].attributes.get('width')),
    ) < 0.0001);
  }

  for (const stage of ['main', 'step5']) {
    const parsed = parsedByStage[stage];
    const axis = parsed.elements.find((node) => node.name === 'line' && node.attributes.get('data-region') === 'cdf-axis');
    const segments = parsed.elements.filter((node) => node.name === 'rect' && node.attributes.get('data-region') === 'cdf-segment');
    const sample = parsed.elements.find((node) => node.name === 'line' && node.attributes.get('data-region') === 'cdf-sample');
    assert.ok(axis, `${stage} CDF axis`);
    assert.equal(segments.length, 2, `${stage} CDF intervals`);
    assert.equal(Number(axis.attributes.get('x1')), 954);
    assert.equal(Number(axis.attributes.get('x2')), 1114);
    assert.equal(Number(segments[0].attributes.get('x')), 954);
    assert.ok(Math.abs(Number(segments[0].attributes.get('width')) - 160 * fixture.result.renormalized[0]) < 0.0001);
    assert.ok(Math.abs(Number(segments[1].attributes.get('x')) - (954 + 160 * fixture.result.renormalized[0])) < 0.0001);
    assert.ok(Math.abs(Number(segments[1].attributes.get('width')) - 160 * fixture.result.renormalized[1]) < 0.0001);
    assert.equal(Number(sample.attributes.get('x1')), 954 + 160 * fixture.data.uniformSample);
    assert.ok(Number(sample.attributes.get('x1')) < Number(segments[1].attributes.get('x')), `${stage} u=.7 must land in A`);
  }
});

test('uses visible service nodes and directed service edges in the main and final generation views', async () => {
  const visual = knowledgeVisualsById['visual-llm-06-generation-loop'];
  for (const assetPath of [visual.assetPath, visual.steps[4].assetPath]) {
    const { parsed } = await parseAsset(assetPath);
    const nodes = parsed.elements.filter((node) => node.attributes.get('data-region') === 'service-node');
    const nodeIds = new Set(nodes.map((node) => node.attributes.get('data-node')));
    ['input', 'prefill', 'decode', 'logits', 'sampling', 'append-kv', 'eos', 'stop-sequence', 'max-tokens', 'business-complete']
      .forEach((id) => assert.ok(nodeIds.has(id), `${assetPath}: ${id}`));
    nodes.forEach((node) => {
      assert.equal(node.name, 'rect', `${assetPath}: service data must sit on visible rect`);
      assert.ok(Number(node.attributes.get('width')) > 0);
      assert.ok(Number(node.attributes.get('height')) > 0);
    });
    const edges = parsed.elements.filter((node) => node.attributes.get('data-region') === 'service-edge');
    assert.equal(edges.length, 10);
    edges.forEach((edge) => {
      assert.ok(edge.attributes.get('stroke'), `${assetPath}: visible stroke`);
      assert.ok(edge.attributes.get('marker-end'), `${assetPath}: directed marker`);
    });
  }
});

test('uses one column-vector LoRA path Wx + B(Ax) with fixture-derived dimensions', async () => {
  const visual = knowledgeVisualsById['visual-llm-05-lora-update'];
  const fixture = FIXTURES.get('visual-llm-05-lora-update');
  const { parsed } = await parseAsset(visual.assetPath);
  const text = visibleText(parsed);
  const [outputDimension, inputDimension] = fixture.data.baseShape;
  const rank = fixture.data.rank;
  [
    `W(${outputDimension}×${inputDimension}) × x(${inputDimension}×1) → Wx(${outputDimension}×1)`,
    `A(${rank}×${inputDimension}) × x(${inputDimension}×1) → Ax(${rank}×1)`,
    `B(${outputDimension}×${rank}) × Ax(${rank}×1) → B(Ax)=ΔWx(${outputDimension}×1)`,
  ].forEach((fragment) => assert.ok(text.includes(fragment), fragment));

  const nodes = new Set(
    parsed.elements
      .filter((node) => node.attributes.get('data-region') === 'lora-node')
      .map((node) => node.attributes.get('data-node')),
  );
  ['x', 'wx', 'ax', 'bax', 'plus', 'adapted-output', 'train-boundary', 'deploy-boundary']
    .forEach((id) => assert.ok(nodes.has(id), id));
  const expectedEdges = {
    'x-wx': ['x', 'wx'],
    'x-ax': ['x', 'ax'],
    'ax-bax': ['ax', 'bax'],
    'wx-plus': ['wx', 'plus'],
    'bax-plus': ['bax', 'plus'],
    'plus-output': ['plus', 'adapted-output'],
  };
  const edges = parsed.elements.filter((node) => node.attributes.get('data-region') === 'lora-edge');
  assert.equal(edges.length, Object.keys(expectedEdges).length);
  edges.forEach((edge) => assert.deepEqual(
    [edge.attributes.get('data-from'), edge.attributes.get('data-to')],
    expectedEdges[edge.attributes.get('data-edge')],
  ));
});
