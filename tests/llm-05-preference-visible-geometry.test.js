import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { parseStrictSvg } from './helpers/static-svg.js';

const ASSET_PATH = 'assets/visuals/llm-foundation/llm-05-preference-boundary.svg';

test('routes both answers through one visible pairwise comparison before behavior changes', async () => {
  const parsed = parseStrictSvg(await readFile(ASSET_PATH, 'utf8'), ASSET_PATH);
  const nodes = parsed.elements.filter(
    (element) => element.attributes.get('data-region') === 'preference-node',
  );
  const nodesById = new Map(nodes.map((node) => [node.attributes.get('data-node'), node]));
  const expectedNodeIds = [
    'answer-a',
    'answer-b',
    'pairwise-comparison',
    'preference-label',
    'optimization-signal',
    'behavior-distribution',
    'multi-objective-boundary',
  ];

  assert.deepEqual([...nodesById.keys()], expectedNodeIds);
  expectedNodeIds.forEach((nodeId) => {
    const node = nodesById.get(nodeId);
    assert.equal(node.name, 'rect', `${nodeId} 必须由可见矩形承载`);
    assert.ok(Number(node.attributes.get('width')) > 0, `${nodeId} 必须有正宽度`);
    assert.ok(Number(node.attributes.get('height')) > 0, `${nodeId} 必须有正高度`);
    assert.notEqual(node.attributes.get('fill'), 'none', `${nodeId} 不能是隐形命中区`);
  });

  const edges = parsed.elements.filter(
    (element) => element.attributes.get('data-region') === 'preference-edge',
  );
  assert.deepEqual(
    edges.map((edge) => [
      edge.attributes.get('data-from'),
      edge.attributes.get('data-to'),
    ]),
    [
      ['answer-a', 'pairwise-comparison'],
      ['answer-b', 'pairwise-comparison'],
      ['pairwise-comparison', 'preference-label'],
      ['preference-label', 'optimization-signal'],
      ['optimization-signal', 'behavior-distribution'],
      ['behavior-distribution', 'multi-objective-boundary'],
    ],
  );
  edges.forEach((edge) => {
    assert.match(edge.name, /^(?:line|path|polyline)$/, '边必须具有可见几何');
    assert.ok(Number(edge.attributes.get('stroke-width')) >= 3, '边必须足够清晰');
    assert.equal(edge.attributes.get('marker-end'), 'url(#arrow)', '边必须带方向箭头');
  });

  const visibleText = parsed.elements
    .filter((element) => element.name === 'text' || element.name === 'tspan')
    .map((element) => element.text)
    .join(' ');
  assert.match(visibleText, /偏好\s*≠\s*事实真值/);
  assert.match(visibleText, /不是所有目标同时改善/);
});
