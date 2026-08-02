import test from 'node:test';
import assert from 'node:assert/strict';

import {
  agentMechanismScenes,
  getAgentMechanismScene,
} from '../src/data/visuals/agent-mechanism-scenes.js';
import { renderAgentMechanismSvg } from '../src/data/visuals/agent-mechanism-svg.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';
import { agentMechanismVisualFixtures } from './fixtures/agent-mechanism-visual-fixtures.js';
import { assertSafeStaticSvg, parseStrictSvg } from './helpers/static-svg.js';

function walk(node, visit) {
  visit(node);
  for (const child of node.children) walk(child, visit);
}

function elements(parsed, predicate) {
  const matches = [];
  walk(parsed.root, (node) => {
    if (predicate(node)) matches.push(node);
  });
  return matches;
}

function numeric(node, attribute) {
  return Number(node.attributes.get(attribute));
}

function rectangleForGroup(parsed, attribute, id) {
  const group = elements(parsed, (node) => node.attributes.get(attribute) === id)[0];
  const rectangle = group?.children.find(({ name }) => name === 'rect');
  assert.ok(rectangle, `missing ${attribute}=${id}`);
  return {
    left: numeric(rectangle, 'x'),
    right: numeric(rectangle, 'x') + numeric(rectangle, 'width'),
    top: numeric(rectangle, 'y'),
    bottom: numeric(rectangle, 'y') + numeric(rectangle, 'height'),
  };
}

function overlaps(first, second) {
  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top;
}

function segments(polyline) {
  const points = polyline.attributes.get('points').trim().split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
  return points.slice(1).map((point, index) => [points[index], point]);
}

function segmentIntersectsInterior([[x1, y1], [x2, y2]], rectangle) {
  assert.ok(x1 === x2 || y1 === y2, 'Agent graph routing must be orthogonal');
  if (x1 === x2) {
    return x1 > rectangle.left
      && x1 < rectangle.right
      && Math.max(y1, y2) > rectangle.top
      && Math.min(y1, y2) < rectangle.bottom;
  }
  return y1 > rectangle.top
    && y1 < rectangle.bottom
    && Math.max(x1, x2) > rectangle.left
    && Math.min(x1, x2) < rectangle.right;
}

function assertDeepFrozen(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const nested of Object.values(value)) assertDeepFrozen(nested, seen);
}

const expectedSceneContracts = {
  'visual-agent-01-boundary-spectrum': ['spectrum', 'decision-authority-continuum'],
  'visual-agent-01-action-feedback-loop': ['loop', 'directed-action-feedback'],
  'visual-agent-02-task-contract': ['decision', 'task-contract-gates'],
  'visual-agent-02-state-event-log': ['state-machine', 'event-sourced-recovery'],
  'visual-agent-03-tool-protocol': ['protocol', 'host-authorized-tool-call'],
  'visual-agent-03-skills-mcp-boundary': ['layers', 'responsibility-boundary-stack'],
  'visual-agent-04-react-cycle': ['loop', 'directed-react-feedback'],
  'visual-agent-04-bounded-loop': ['decision', 'bounded-loop-exits'],
  'visual-agent-05-planning-modes': ['planning-graph', 'uncertainty-escalation'],
  'visual-agent-05-orchestration-graph': ['dag', 'parallel-fork-join'],
  'visual-agent-06-correction-ladder': ['ladder', 'retry-replan-reflect-validate'],
  'visual-agent-06-durable-recovery': ['state-machine', 'reconciliation-recovery'],
  'visual-agent-07-context-layers': ['layers', 'context-projection-stack'],
  'visual-agent-07-provenance-budget': ['flow', 'provenance-preserving-projection'],
  'visual-agent-08-end-to-end': ['control-loop', 'validated-agent-control-loop'],
  'visual-agent-08-pressure-matrix': ['matrix', 'failure-control-exit-matrix'],
};

function hasEdge(scene, from, to, kind = undefined) {
  return scene.edges?.some((edge) => (
    edge.from === from && edge.to === to && (kind === undefined || edge.kind === kind)
  ));
}

test('all 16 Agent scenes declare cognitive type and topology with critical branches', () => {
  assertDeepFrozen(agentMechanismScenes);
  assert.equal(agentMechanismScenes.length, 16);
  for (const scene of agentMechanismScenes) {
    assert.deepEqual([scene.type, scene.topology], expectedSceneContracts[scene.id], scene.id);
  }
  assert.ok(hasEdge(
    getAgentMechanismScene('visual-agent-01-action-feedback-loop'),
    'observation',
    'goal-state',
    'feedback',
  ));
  assert.ok(hasEdge(
    getAgentMechanismScene('visual-agent-04-react-cycle'),
    'state',
    'reason',
    'feedback',
  ));
  const bounded = getAgentMechanismScene('visual-agent-04-bounded-loop');
  for (const outcome of ['continue', 'stop', 'blocked', 'budget']) {
    assert.ok(hasEdge(bounded, 'guard', outcome) || hasEdge(bounded, 'act', outcome), outcome);
  }
  const orchestration = getAgentMechanismScene('visual-agent-05-orchestration-graph');
  assert.ok(hasEdge(orchestration, 'decompose', 'branch-a'));
  assert.ok(hasEdge(orchestration, 'decompose', 'branch-b'));
  assert.ok(hasEdge(orchestration, 'branch-a', 'join'));
  assert.ok(hasEdge(orchestration, 'branch-b', 'join'));
  const pressure = getAgentMechanismScene('visual-agent-08-pressure-matrix');
  assert.equal(pressure.columns.length, 4);
  assert.equal(pressure.rows.length, 6);
  assert.equal(pressure.nodes, undefined);
});

test('fixture truth is independent, deeply frozen, and rendered into four critical scenes', () => {
  assertDeepFrozen(agentMechanismVisualFixtures);
  const visualsById = new Map(agentMechanismVisuals.map((visual) => [visual.id, visual]));
  const fixtureText = (fixture) => [
    ...(fixture.labels ?? []),
    ...(fixture.renderedValues ?? []),
    ...(fixture.columns ?? []),
    ...(fixture.rows ?? []).flat(Infinity).map(String),
  ];
  for (const fixture of Object.values(agentMechanismVisualFixtures)) {
    const visual = visualsById.get(fixture.visualId);
    const svg = renderAgentMechanismSvg(visual, getAgentMechanismScene(fixture.visualId));
    for (const expected of fixtureText(fixture)) {
      assert.ok(svg.includes(expected), `${fixture.visualId}: missing fixture truth ${expected}`);
    }
  }
});

test('rendered graph routes avoid non-endpoint nodes and edge labels do not collide', () => {
  for (const visual of agentMechanismVisuals) {
    const scene = getAgentMechanismScene(visual.id);
    if (!scene.nodes) continue;
    const parsed = parseStrictSvg(renderAgentMechanismSvg(visual, scene), visual.id);
    const nodeRectangles = new Map(scene.nodes.map(({ id }) => [
      id,
      rectangleForGroup(parsed, 'data-node', id),
    ]));
    for (const edge of scene.edges) {
      const polyline = elements(
        parsed,
        (node) => node.attributes.get('data-edge') === edge.id,
      )[0];
      assert.ok(polyline, `${scene.id}/${edge.id}: rendered edge`);
      for (const [nodeId, rectangle] of nodeRectangles) {
        if (nodeId === edge.from || nodeId === edge.to) continue;
        for (const segment of segments(polyline)) {
          assert.equal(
            segmentIntersectsInterior(segment, rectangle),
            false,
            `${scene.id}/${edge.id} intersects ${nodeId}`,
          );
        }
      }
    }
    const labelRectangles = elements(
      parsed,
      (node) => node.attributes.has('data-edge-label'),
    ).map((group) => {
      const rectangle = group.children.find(({ name }) => name === 'rect');
      return {
        id: group.attributes.get('data-edge-label'),
        left: numeric(rectangle, 'x'),
        right: numeric(rectangle, 'x') + numeric(rectangle, 'width'),
        top: numeric(rectangle, 'y'),
        bottom: numeric(rectangle, 'y') + numeric(rectangle, 'height'),
      };
    });
    for (const label of labelRectangles) {
      for (const [nodeId, rectangle] of nodeRectangles) {
        assert.equal(overlaps(label, rectangle), false, `${scene.id}/${label.id} overlaps ${nodeId}`);
      }
    }
    for (const [index, label] of labelRectangles.entries()) {
      for (const other of labelRectangles.slice(index + 1)) {
        assert.equal(overlaps(label, other), false, `${scene.id}/${label.id} overlaps ${other.id}`);
      }
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
