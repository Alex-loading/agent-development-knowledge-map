import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import {
  contextRagMemoryScenes,
  contextRagMemoryScenesById,
} from '../src/data/visuals/context-rag-memory-scenes.js';
import {
  renderContextRagMemorySvg,
} from '../src/data/visuals/context-rag-memory-svg.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';
import { parseStrictSvg } from './helpers/static-svg.js';

function assertDeepFrozen(value, label, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: expected deeply frozen data`);
  for (const [key, child] of Object.entries(value)) {
    assertDeepFrozen(child, `${label}.${key}`, seen);
  }
}

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

function number(node, attribute) {
  return Number(node.attributes.get(attribute));
}

function assertGeometryInsideViewBox(parsed, label) {
  for (const node of elements(parsed, ({ name }) => (
    ['rect', 'circle', 'line', 'polyline', 'polygon', 'text'].includes(name)
  ))) {
    if (node.name === 'rect') {
      assert.ok(number(node, 'x') >= 0, `${label}:${node.name} x`);
      assert.ok(number(node, 'y') >= 0, `${label}:${node.name} y`);
      assert.ok(number(node, 'x') + number(node, 'width') <= 1200, `${label}:${node.name} width`);
      assert.ok(number(node, 'y') + number(node, 'height') <= 675, `${label}:${node.name} height`);
    } else if (node.name === 'circle') {
      assert.ok(number(node, 'cx') - number(node, 'r') >= 0, `${label}:circle left`);
      assert.ok(number(node, 'cy') - number(node, 'r') >= 0, `${label}:circle top`);
      assert.ok(number(node, 'cx') + number(node, 'r') <= 1200, `${label}:circle right`);
      assert.ok(number(node, 'cy') + number(node, 'r') <= 675, `${label}:circle bottom`);
    } else if (node.name === 'line') {
      for (const attribute of ['x1', 'x2']) {
        assert.ok(number(node, attribute) >= 0 && number(node, attribute) <= 1200, `${label}:line ${attribute}`);
      }
      for (const attribute of ['y1', 'y2']) {
        assert.ok(number(node, attribute) >= 0 && number(node, attribute) <= 675, `${label}:line ${attribute}`);
      }
    } else if (node.name === 'polyline' || node.name === 'polygon') {
      for (const pair of node.attributes.get('points').trim().split(/\s+/)) {
        const [x, y] = pair.split(',').map(Number);
        assert.ok(x >= 0 && x <= 1200, `${label}:${node.name} x`);
        assert.ok(y >= 0 && y <= 675, `${label}:${node.name} y`);
      }
    } else {
      const x = number(node, 'x');
      const y = number(node, 'y');
      const fontSize = number(node, 'font-size');
      const estimatedWidth = [...node.ownText].length * fontSize * 0.58;
      const anchor = node.attributes.get('text-anchor');
      const left = anchor === 'start'
        ? x
        : anchor === 'end'
          ? x - estimatedWidth
          : x - estimatedWidth / 2;
      const right = anchor === 'start'
        ? x + estimatedWidth
        : anchor === 'end'
          ? x
          : x + estimatedWidth / 2;
      assert.ok(left >= 0, `${label}:text left ${node.ownText}`);
      assert.ok(right <= 1200, `${label}:text right ${node.ownText}`);
      assert.ok(y - fontSize >= 0, `${label}:text top ${node.ownText}`);
      assert.ok(y <= 675, `${label}:text bottom ${node.ownText}`);
    }
  }
}

function resolveSemanticRef(scene, ref) {
  if (ref.type === 'node') {
    return scene.nodes?.some(({ id }) => id === ref.id)
      || scene.decisions?.some(({ id }) => id === ref.id)
      || scene.outcomes?.some(({ id }) => id === ref.id);
  }
  if (ref.type === 'edge') {
    return scene.edges?.some(({ from, to }) => from === ref.from && to === ref.to);
  }
  if (ref.type === 'row') {
    return scene.rows?.some(({ id }) => id === ref.id);
  }
  if (ref.type === 'cell') {
    return scene.rows?.some(({ id, cells }) => (
      id === ref.row && Object.hasOwn(cells, ref.column)
    ));
  }
  if (ref.type === 'series') {
    return scene.series?.some(({ id }) => id === ref.id);
  }
  if (ref.type === 'point') {
    return scene.series?.some(({ id, points }) => (
      id === ref.series && points.some((point) => point.id === ref.id)
    ));
  }
  return false;
}

test('publishes deeply frozen typed production scenes whose storyboard semantics resolve', () => {
  assert.equal(contextRagMemoryScenes.length, 24);
  assert.equal(contextRagMemoryScenesById.size, 24);
  assertDeepFrozen(contextRagMemoryScenes, 'contextRagMemoryScenes');
  assertDeepFrozen(contextRagMemoryScenesById, 'contextRagMemoryScenesById');

  const visualIds = contextRagMemoryVisuals.map(({ id }) => id).sort();
  assert.deepEqual([...contextRagMemoryScenesById.keys()].sort(), visualIds);
  for (const record of contextRagMemoryScenes) {
    assert.ok(['flow', 'table', 'chart', 'decision'].includes(record.scene.type), record.visualId);
    assert.ok(record.annotation.storyboard.length > 30, `${record.visualId}: storyboard`);
    assert.ok(record.annotation.semanticRefs.length > 0, `${record.visualId}: semantic refs`);
    for (const ref of record.annotation.semanticRefs) {
      assert.ok(resolveSemanticRef(record.scene, ref), `${record.visualId}: ${JSON.stringify(ref)}`);
    }
  }
});

test('models ingestion wrap edge, ANN metric bindings, and RRF arithmetic explicitly', () => {
  const ingestion = contextRagMemoryScenesById.get('visual-context-04-ingestion-pipeline').scene;
  assert.ok(ingestion.edges.some(({ from, to }) => from === 'chunk' && to === 'metadata'));
  assert.deepEqual(
    ingestion.nodes.map(({ id }) => id),
    ['acquire', 'parse', 'normalize', 'chunk', 'metadata', 'embed', 'index'],
  );

  const ann = contextRagMemoryScenesById.get('visual-context-05-ann-tradeoff').scene;
  assert.deepEqual(ann.columns.map(({ id }) => id), [
    'configuration',
    'recall',
    'p95',
    'memory',
    'update',
  ]);
  assert.deepEqual(ann.rows.map(({ id }) => id), ['fast', 'balanced', 'deep']);
  for (const row of ann.rows) {
    assert.deepEqual(Object.keys(row.cells), ann.columns.map(({ id }) => id));
  }

  const rrf = contextRagMemoryScenesById.get('visual-context-05-rrf-fusion').scene;
  const docB = rrf.rows.find(({ id }) => id === 'doc-b');
  const expected = 1 / (rrf.k + docB.cells.sparseRank)
    + 1 / (rrf.k + docB.cells.denseRank);
  assert.equal(Number(docB.cells.total), Number(expected.toFixed(4)));
  assert.equal(docB.cells.total, '0.0325');
});

test('renders typed semantic elements with unique IDs and bounded geometry', () => {
  for (const visual of contextRagMemoryVisuals) {
    const record = contextRagMemoryScenesById.get(visual.id);
    const parsed = parseStrictSvg(
      renderContextRagMemorySvg(visual, record.scene),
      visual.id,
    );
    const ids = elements(parsed, (node) => node.attributes.has('id'))
      .map((node) => node.attributes.get('id'));
    assert.equal(new Set(ids).size, ids.length, `${visual.id}: unique element IDs`);
    assertGeometryInsideViewBox(parsed, visual.id);

    if (record.scene.type === 'flow' || record.scene.type === 'decision') {
      for (const edge of record.scene.edges) {
        assert.equal(
          elements(parsed, (node) => node.attributes.get('data-edge') === edge.id).length,
          1,
          `${visual.id}: rendered edge ${edge.id}`,
        );
      }
    } else if (record.scene.type === 'table') {
      for (const row of record.scene.rows) {
        for (const column of record.scene.columns) {
          assert.equal(
            elements(parsed, (node) => (
              node.attributes.get('data-row') === row.id
              && node.attributes.get('data-column') === column.id
            )).length,
            1,
            `${visual.id}: ${row.id}/${column.id}`,
          );
        }
      }
    } else {
      for (const series of record.scene.series) {
        for (const point of series.points) {
          assert.equal(
            elements(parsed, (node) => (
              node.attributes.get('data-row') === series.id
              && node.attributes.get('data-index') === point.id
            )).length,
            1,
            `${visual.id}: ${series.id}/${point.id}`,
          );
        }
      }
    }
  }
});

test('renders the admission governance tree as branches with a fitting final action label', () => {
  const visual = contextRagMemoryVisuals.find(
    ({ id }) => id === 'visual-context-07-admission-conflict',
  );
  const scene = contextRagMemoryScenesById.get(visual.id).scene;
  assert.ok(scene.decisions.length >= 4);
  assert.deepEqual(
    scene.outcomes.map(({ id }) => id).sort(),
    ['no-op', 'reject', 'store', 'supersede'],
  );
  assert.ok(scene.edges.some(({ condition, to }) => condition === 'NO' && to === 'reject'));
  assert.ok(scene.edges.some(({ condition, to }) => condition === 'UNCHANGED' && to === 'no-op'));

  const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
  const actionGroup = elements(
    parsed,
    (node) => node.attributes.get('data-node') === 'action-summary',
  )[0];
  const actionRect = actionGroup.children.find(({ name }) => name === 'rect');
  const actionText = actionGroup.children.find(({ name }) => name === 'text');
  const estimatedTextWidth = [...actionText.ownText].length
    * Number(actionText.attributes.get('font-size')) * 0.58;
  assert.ok(estimatedTextWidth <= Number(actionRect.attributes.get('width')) - 16);
  assert.ok(number(actionRect, 'x') + number(actionRect, 'width') <= 1200);

  const outcomeRects = scene.outcomes.map(({ id }) => {
    const group = elements(
      parsed,
      (node) => node.attributes.get('data-node') === id,
    )[0];
    const rect = group.children.find(({ name }) => name === 'rect');
    return {
      id,
      left: number(rect, 'x'),
      right: number(rect, 'x') + number(rect, 'width'),
      top: number(rect, 'y'),
      bottom: number(rect, 'y') + number(rect, 'height'),
    };
  });
  for (const [index, current] of outcomeRects.entries()) {
    for (const other of outcomeRects.slice(index + 1)) {
      const overlaps = current.left < other.right
        && current.right > other.left
        && current.top < other.bottom
        && current.bottom > other.top;
      assert.equal(overlaps, false, `${current.id} overlaps ${other.id}`);
    }
  }
});

test('escapes hostile titles, labels, edge conditions, and attribute IDs as XML data', () => {
  const hostileVisual = {
    id: 'visual-hostile-test',
    title: `A&B <title> "quoted" 'single'`,
    caption: `Caption & <script>alert("x")</script>`,
    role: 'process',
  };
  const hostileScene = {
    type: 'flow',
    nodes: [
      { id: `from'"<&`, label: `FROM & <unsafe>` },
      { id: 'to', label: `TO "quoted" 'single'` },
    ],
    edges: [
      { id: `edge'"<&`, from: `from'"<&`, to: 'to', label: `YES & <NO>` },
    ],
  };
  const svg = renderContextRagMemorySvg(hostileVisual, hostileScene);
  assert.doesNotMatch(svg, /<script>|data-node="from'"<&"/);
  assert.match(svg, /A&amp;B &lt;title&gt; &quot;quoted&quot; &apos;single&apos;/);
  assert.match(svg, /FROM &amp; &lt;unsafe&gt;/);
  assert.match(svg, /YES &amp; &lt;NO&gt;/);
  const validation = spawnSync('xmllint', ['--noout', '-'], {
    input: svg,
    encoding: 'utf8',
  });
  assert.equal(validation.status, 0, validation.stderr);
});
