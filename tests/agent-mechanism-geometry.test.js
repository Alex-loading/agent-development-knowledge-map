import test from 'node:test';
import assert from 'node:assert/strict';

import { agentMechanismScenes } from '../src/data/visuals/agent-mechanism-scenes.js';
import { renderAgentMechanismSvg } from '../src/data/visuals/agent-mechanism-svg.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';
import { assertSafeStaticSvg } from './helpers/static-svg.js';

function overlaps(first, second) {
  return !(
    first.x + first.width <= second.x
    || second.x + second.width <= first.x
    || first.y + first.height <= second.y
    || second.y + second.height <= first.y
  );
}

function assertDeepFrozen(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const nested of Object.values(value)) assertDeepFrozen(nested, seen);
}

test('production Agent scenes are deeply frozen and keep nodes, edges and labels collision-free', () => {
  assertDeepFrozen(agentMechanismScenes);
  for (const scene of agentMechanismScenes) {
    const nodes = new Map(scene.nodes.map((node) => [node.id, node]));
    for (const node of scene.nodes) {
      assert.ok(node.x >= 32 && node.y >= 32, `${scene.id}/${node.id}: leading margin`);
      assert.ok(node.x + node.width <= 1168, `${scene.id}/${node.id}: trailing margin`);
      assert.ok(node.y + node.height <= 643, `${scene.id}/${node.id}: bottom margin`);
    }
    for (let first = 0; first < scene.nodes.length; first += 1) {
      for (let second = first + 1; second < scene.nodes.length; second += 1) {
        assert.equal(
          overlaps(scene.nodes[first], scene.nodes[second]),
          false,
          `${scene.id}: node collision`,
        );
      }
    }
    for (const edge of scene.edges) {
      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);
      assert.ok(from && to, `${scene.id}/${edge.id}: endpoints`);
      assert.ok(from.x + from.width + 70 <= to.x, `${scene.id}/${edge.id}: route gap`);
      const label = {
        x: (from.x + from.width + to.x) / 2 - 38,
        y: from.y + from.height / 2 - 48,
        width: 76,
        height: 30,
      };
      assert.equal(overlaps(label, from), false, `${scene.id}/${edge.id}: label/from`);
      assert.equal(overlaps(label, to), false, `${scene.id}/${edge.id}: label/to`);
    }
  }
});

test('renderer escapes hostile text and still satisfies the shared static SVG policy', () => {
  const visual = {
    ...agentMechanismVisuals[0],
    title: '<script>alert("x")</script> & title',
    longDescription: 'Numeric &#60; custom &danger; DTD <!DOCTYPE svg> javascript: is visible text only.',
    caption: '<img onload="x"> & caption',
  };
  const scene = {
    ...agentMechanismScenes[0],
    title: '<script>alert(1)</script>',
    subtitle: '&danger; "quoted" <unsafe>',
    nodes: agentMechanismScenes[0].nodes.map((node, index) => (
      index === 0 ? { ...node, label: '<foreignObject>\n&danger;' } : node
    )),
  };
  const svg = renderAgentMechanismSvg(visual, scene);
  assert.doesNotMatch(svg, /<script|<foreignObject|<!DOCTYPE/i);
  assert.match(svg, /&lt;script&gt;/);
  assert.match(svg, /&amp;danger;/);
  assertSafeStaticSvg(svg, visual, 'hostile-agent-render.svg');
});
