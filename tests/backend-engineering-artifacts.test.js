import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { backendEngineeringVisuals } from '../src/data/visuals/backend-engineering-visuals.js';
import { backendEngineeringScenes, getBackendEngineeringScene } from '../src/data/visuals/backend-engineering-scenes.js';
import { renderBackendEngineeringSvg } from '../src/data/visuals/backend-engineering-svg.js';
import {
  buildBackendEngineeringVisualArtifacts,
  checkBackendEngineeringVisualArtifacts,
} from '../scripts/generate-backend-engineering-visuals.mjs';
import { backendEngineeringVisualFixtures } from './fixtures/backend-engineering-visual-fixtures.js';
import {
  allowedEdgeIntersection,
  BACKEND_CANVAS,
  BACKEND_TEXT_REGIONS,
  boxContains,
  boxesOverlap,
  collinearOverlap,
  groupRectangles,
  orthogonalIntersection,
  parsePolylinePoints,
  renderedTextBoxes,
  segmentIntersectsInterior,
  segmentsFromPoints,
  svgElements,
} from './helpers/backend-visual-geometry.js';
import { assertSafeStaticSvg, parseStrictSvg } from './helpers/static-svg.js';

const fixturesById = new Map(Object.values(backendEngineeringVisualFixtures)
  .map((fixture) => [fixture.visualId, fixture]));

test('builds 16 deterministic strict static SVG artifacts from production scenes', async () => {
  const artifacts = buildBackendEngineeringVisualArtifacts();
  assert.equal(artifacts.size, 16);
  for (const visual of backendEngineeringVisuals) {
    const filename = visual.assetPath.split('/').at(-1);
    const expected = artifacts.get(filename);
    const actual = await readFile(new URL(`../${visual.assetPath}`, import.meta.url), 'utf8');
    assert.equal(actual, expected, filename);
    assertSafeStaticSvg(expected, visual, visual.assetPath);
  }
});

test('scene geometry uses bounded semantic nodes and orthogonal nonzero rendered edges', () => {
  assert.equal(backendEngineeringScenes.length, 16);
  for (const scene of backendEngineeringScenes) {
    assert.ok(scene.nodes.length > 0, `${scene.id}: nodes`);
    const ids = new Set(scene.nodes.map(({ id }) => id));
    assert.equal(ids.size, scene.nodes.length, `${scene.id}: node IDs`);
    for (const node of scene.nodes) {
      assert.ok(node.x >= 36 && node.x + node.width <= 1164, `${scene.id}:${node.id}:x`);
      assert.ok(node.y >= 158 && node.y + node.height <= 514, `${scene.id}:${node.id}:y`);
      assert.ok(node.width > 0 && node.height > 0, `${scene.id}:${node.id}:size`);
    }
    for (const edge of scene.edges) {
      assert.ok(ids.has(edge.from), `${scene.id}:${edge.id}:from`);
      assert.ok(ids.has(edge.to), `${scene.id}:${edge.id}:to`);
      assert.ok(edge.points.length >= 2, `${scene.id}:${edge.id}:points`);
      if (edge.label !== undefined) {
        assert.match(edge.label, /\S/, `${scene.id}:${edge.id}:meaningful label`);
        assert.deepEqual(edge.labelAt?.length, 2, `${scene.id}:${edge.id}:labelAt`);
      }
      for (const segment of segmentsFromPoints(edge.points)) {
        const [[x1, y1], [x2, y2]] = segment;
        assert.ok(x1 === x2 || y1 === y2, `${scene.id}:${edge.id}:diagonal`);
        assert.notDeepEqual(segment[0], segment[1], `${scene.id}:${edge.id}:zero`);
        for (const [x, y] of segment) {
          assert.ok(x >= BACKEND_CANVAS.left && x <= BACKEND_CANVAS.right, `${scene.id}:${edge.id}:canvas-x`);
          assert.ok(y >= 151 && y <= 518, `${scene.id}:${edge.id}:reserved-y`);
        }
      }
    }
  }
});

test('renderer classifies every visible text and fits every estimated bbox in its reserved region', () => {
  const requiredSingletons = ['title', 'subtitle', 'caption', 'footer'];
  for (const visual of backendEngineeringVisuals) {
    const scene = getBackendEngineeringScene(visual.id);
    const parsed = parseStrictSvg(renderBackendEngineeringSvg(visual, scene), visual.id);
    const boxes = renderedTextBoxes(parsed);
    assert.equal(boxes.length, parsed.elementsByName.get('text')?.length ?? 0, `${scene.id}: all text classified`);
    for (const region of requiredSingletons) {
      assert.equal(boxes.filter((box) => box.region === region).length, 1, `${scene.id}:${region}`);
    }
    assert.equal(boxes.filter(({ region }) => region === 'node-primary').length, scene.nodes.length, `${scene.id}:node-primary`);
    assert.equal(
      boxes.filter(({ region }) => region === 'node-secondary').length,
      scene.nodes.filter(({ secondary }) => secondary !== undefined).length,
      `${scene.id}:node-secondary`,
    );
    assert.equal(boxes.filter(({ region }) => region === 'value').length, scene.values.length, `${scene.id}:values`);
    assert.equal(
      boxes.filter(({ region }) => region === 'edge-label').length,
      scene.edges.filter(({ label }) => label !== undefined).length,
      `${scene.id}:edge-labels`,
    );
    assert.ok(
      svgElements(parsed, (node) => node.attributes.get('data-kind') === scene.type).length >= 1,
      `${scene.id}: renderer branch data-kind=${scene.type}`,
    );
    for (const box of boxes) {
      assert.ok(box.text.length > 0, `${scene.id}:${box.region}:empty`);
      assert.equal(boxContains(BACKEND_CANVAS, box), true, `${scene.id}:${box.id}:canvas`);
      assert.equal(boxContains(BACKEND_TEXT_REGIONS[box.region], box), true, `${scene.id}:${box.id}:reserve`);
    }
  }
});

test('rendered text has zero text-text, text-node, and edge-label-node collisions', () => {
  for (const visual of backendEngineeringVisuals) {
    const scene = getBackendEngineeringScene(visual.id);
    const parsed = parseStrictSvg(renderBackendEngineeringSvg(visual, scene), visual.id);
    const boxes = renderedTextBoxes(parsed);
    const nodeRectangles = groupRectangles(parsed, 'data-node');
    const valueRectangles = groupRectangles(parsed, 'data-value');
    const edgeLabelRectangles = groupRectangles(parsed, 'data-edge-label');
    assert.equal(nodeRectangles.size, scene.nodes.length, `${scene.id}:rendered nodes`);
    assert.equal(valueRectangles.size, scene.values.length, `${scene.id}:rendered values`);
    assert.equal(
      edgeLabelRectangles.size,
      scene.edges.filter(({ label }) => label !== undefined).length,
      `${scene.id}:rendered edge labels`,
    );

    for (const [index, box] of boxes.entries()) {
      for (const other of boxes.slice(index + 1)) {
        assert.equal(boxesOverlap(box, other, 1), false, `${scene.id}:${box.id} overlaps ${other.id}`);
      }
      if (box.ownerNode) {
        assert.equal(boxContains(nodeRectangles.get(box.ownerNode), box, 8), true, `${scene.id}:${box.id}:node-fit`);
      }
      if (box.ownerValue) {
        assert.equal(boxContains(valueRectangles.get(box.ownerValue), box, 6), true, `${scene.id}:${box.id}:value-fit`);
      }
      if (box.ownerEdgeLabel) {
        assert.equal(boxContains(edgeLabelRectangles.get(box.ownerEdgeLabel), box, 5), true, `${scene.id}:${box.id}:edge-label-fit`);
      }
      for (const [nodeId, rectangle] of nodeRectangles) {
        if (nodeId === box.ownerNode) continue;
        assert.equal(boxesOverlap(box, rectangle), false, `${scene.id}:${box.id} overlaps node ${nodeId}`);
      }
    }
    for (const [labelId, label] of edgeLabelRectangles) {
      assert.equal(
        boxContains(BACKEND_TEXT_REGIONS['edge-label'], label),
        true,
        `${scene.id}:${labelId}:edge-label reserve`,
      );
      for (const [nodeId, node] of nodeRectangles) {
        assert.equal(boxesOverlap(label, node), false, `${scene.id}:${labelId} overlaps node ${nodeId}`);
      }
    }
    const renderedNodes = [...nodeRectangles.values()];
    for (const [index, node] of renderedNodes.entries()) {
      for (const other of renderedNodes.slice(index + 1)) {
        assert.equal(boxesOverlap(node, other), false, `${scene.id}:node ${node.id} overlaps ${other.id}`);
      }
    }
    const renderedLabels = [...edgeLabelRectangles.values()];
    for (const [index, label] of renderedLabels.entries()) {
      for (const other of renderedLabels.slice(index + 1)) {
        assert.equal(boxesOverlap(label, other), false, `${scene.id}:edge label ${label.id} overlaps ${other.id}`);
      }
    }
  }
});

test('rendered edges avoid non-endpoint nodes and preserve every fixture edge label truth', () => {
  for (const visual of backendEngineeringVisuals) {
    const scene = getBackendEngineeringScene(visual.id);
    const fixture = fixturesById.get(scene.id);
    const parsed = parseStrictSvg(renderBackendEngineeringSvg(visual, scene), visual.id);
    const nodes = groupRectangles(parsed, 'data-node');
    const renderedLabels = groupRectangles(parsed, 'data-edge-label');
    for (const edge of scene.edges) {
      const polyline = svgElements(parsed, (node) => node.attributes.get('data-edge') === edge.id)[0]?.node;
      assert.ok(polyline, `${scene.id}:${edge.id}:rendered`);
      assert.deepEqual(parsePolylinePoints(polyline), edge.points, `${scene.id}:${edge.id}:points`);
      for (const [nodeId, rectangle] of nodes) {
        if (nodeId === edge.from || nodeId === edge.to) continue;
        for (const segment of segmentsFromPoints(edge.points)) {
          assert.equal(segmentIntersectsInterior(segment, rectangle), false, `${scene.id}:${edge.id} intersects ${nodeId}`);
        }
      }
    }
    for (const truth of fixture.edgeLabelTruths) {
      const edge = scene.edges.find(({ from, to, label }) => (
        from === truth.from && to === truth.to && label === truth.label
      ));
      assert.ok(edge, `${scene.id}:${truth.label}:scene truth`);
      assert.ok(renderedLabels.has(edge.id), `${scene.id}:${truth.label}:rendered truth`);
    }
  }
});

test('all edge collinear overlaps and undeclared orthogonal crossings are zero', () => {
  const overlaps = [];
  const crossings = [];
  for (const scene of backendEngineeringScenes) {
    for (const [edgeIndex, edge] of scene.edges.entries()) {
      for (const other of scene.edges.slice(edgeIndex + 1)) {
        for (const first of segmentsFromPoints(edge.points)) {
          for (const second of segmentsFromPoints(other.points)) {
            if (collinearOverlap(first, second)) overlaps.push(`${scene.id}:${edge.id}/${other.id}`);
            const point = orthogonalIntersection(first, second);
            if (point && !allowedEdgeIntersection(scene, edge, other, point)) {
              crossings.push(`${scene.id}:${edge.id}/${other.id}@${point.join(',')}`);
            }
          }
        }
      }
    }
  }
  assert.deepEqual(overlaps, []);
  assert.deepEqual(crossings, []);
});

test('hostile visible copy is escaped and still passes the shared static SVG gate', () => {
  const base = backendEngineeringVisuals[0];
  const visual = {
    ...base,
    title: '<script>alert(1)</script> & "quoted"',
    longDescription: '<!DOCTYPE svg> &danger; &#60; javascript: data: https://evil.test',
    caption: '<foreignObject onload="x">',
  };
  const svg = renderBackendEngineeringSvg(visual, getBackendEngineeringScene(base.id));
  assert.doesNotMatch(svg, /<script|<foreignObject|<!DOCTYPE/i);
  assert.match(svg, /&lt;script&gt;/);
  assertSafeStaticSvg(svg, visual, 'hostile-backend-render.svg');
});

test('strict check is nonwriting and reports every missing artifact', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'backend-visual-check-'));
  await assert.rejects(
    () => checkBackendEngineeringVisualArtifacts({ outputDirectory: directory }),
    (error) => {
      assert.match(error.message, /missing:/);
      assert.equal((error.message.match(/missing:/g) ?? []).length, 16);
      return true;
    },
  );
});
