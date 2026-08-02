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
import { assertSafeStaticSvg, parseStrictSvg } from './helpers/static-svg.js';

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

function rectangleForNode(parsed, nodeId) {
  const group = elements(
    parsed,
    (node) => node.attributes.get('data-node') === nodeId,
  )[0];
  const rect = group?.children.find(({ name }) => name === 'rect');
  assert.ok(rect, `missing rectangle for node ${nodeId}`);
  return {
    left: number(rect, 'x'),
    right: number(rect, 'x') + number(rect, 'width'),
    top: number(rect, 'y'),
    bottom: number(rect, 'y') + number(rect, 'height'),
  };
}

function polylineSegments(node) {
  const points = polylinePoints(node);
  return points.slice(1).map((point, index) => [points[index], point]);
}

function polylinePoints(node) {
  return node.attributes.get('points').trim().split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
}

function assertSegmentLeavesRectangleAtOuterBoundary(segment, rectangle, label) {
  const [[x1, y1], [x2, y2]] = segment;
  assert.notDeepEqual(segment[0], segment[1], `${label}: zero-length departure`);
  if (x1 === x2) {
    assert.ok(x1 >= rectangle.left && x1 <= rectangle.right, `${label}: departure x span`);
    assert.equal(
      y1,
      y2 > y1 ? rectangle.bottom : rectangle.top,
      `${label}: vertical departure must start at the outward boundary`,
    );
  } else {
    assert.equal(y1, y2, `${label}: departure must be orthogonal`);
    assert.ok(y1 >= rectangle.top && y1 <= rectangle.bottom, `${label}: departure y span`);
    assert.equal(
      x1,
      x2 > x1 ? rectangle.right : rectangle.left,
      `${label}: horizontal departure must start at the outward boundary`,
    );
  }
  assert.equal(
    segmentIntersectsRectangleInterior(segment, rectangle),
    false,
    `${label}: departure re-enters endpoint interior after the shared start point`,
  );
}

function assertSegmentEntersRectangleAtOuterBoundary(segment, rectangle, label) {
  const [[x1, y1], [x2, y2]] = segment;
  assert.notDeepEqual(segment[0], segment[1], `${label}: zero-length arrival`);
  if (x1 === x2) {
    assert.ok(x2 >= rectangle.left && x2 <= rectangle.right, `${label}: arrival x span`);
    assert.equal(
      y2,
      y2 > y1 ? rectangle.top : rectangle.bottom,
      `${label}: vertical arrival must end at the outward boundary`,
    );
  } else {
    assert.equal(y1, y2, `${label}: arrival must be orthogonal`);
    assert.ok(y2 >= rectangle.top && y2 <= rectangle.bottom, `${label}: arrival y span`);
    assert.equal(
      x2,
      x2 > x1 ? rectangle.left : rectangle.right,
      `${label}: horizontal arrival must end at the outward boundary`,
    );
  }
  assert.equal(
    segmentIntersectsRectangleInterior(segment, rectangle),
    false,
    `${label}: arrival crosses endpoint interior before the shared end point`,
  );
}

function segmentIntersectsRectangleInterior([[x1, y1], [x2, y2]], rectangle) {
  if (x1 === x2) {
    return x1 > rectangle.left
      && x1 < rectangle.right
      && Math.max(y1, y2) > rectangle.top
      && Math.min(y1, y2) < rectangle.bottom;
  }
  assert.equal(y1, y2, 'flow routing must remain orthogonal');
  return y1 > rectangle.top
    && y1 < rectangle.bottom
    && Math.max(x1, x2) > rectangle.left
    && Math.min(x1, x2) < rectangle.right;
}

function rectanglesOverlap(first, second) {
  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top;
}

function rectangleForText(node) {
  const x = number(node, 'x');
  const y = number(node, 'y');
  const fontSize = number(node, 'font-size');
  const width = [...node.ownText].length * fontSize * 0.58;
  const anchor = node.attributes.get('text-anchor');
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  const right = anchor === 'start' ? x + width : anchor === 'end' ? x : x + width / 2;
  return { left, right, top: y - fontSize, bottom: y };
}

function assertGeometryInsideViewBox(parsed, label) {
  for (const node of elements(parsed, ({ name }) => (
    ['rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'tspan'].includes(name)
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

test('routes every flow edge around non-endpoint node boxes', () => {
  for (const visual of contextRagMemoryVisuals) {
    const scene = contextRagMemoryScenesById.get(visual.id).scene;
    if (scene.type !== 'flow') continue;
    const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
    for (const edge of scene.edges) {
      const polyline = elements(
        parsed,
        (node) => node.attributes.get('data-edge') === edge.id,
      )[0];
      for (const node of scene.nodes) {
        if (node.id === edge.from || node.id === edge.to) continue;
        const rectangle = rectangleForNode(parsed, node.id);
        for (const segment of polylineSegments(polyline)) {
          assert.equal(
            segmentIntersectsRectangleInterior(segment, rectangle),
            false,
            `${visual.id}:${edge.id} intersects ${node.id}`,
          );
        }
      }
    }
  }
});

test('routes every flow edge through the correct outer boundaries of both endpoints', () => {
  for (const visual of contextRagMemoryVisuals) {
    const scene = contextRagMemoryScenesById.get(visual.id).scene;
    if (scene.type !== 'flow') continue;
    const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
    for (const edge of scene.edges) {
      const polyline = elements(
        parsed,
        (node) => node.attributes.get('data-edge') === edge.id,
      )[0];
      const points = polylinePoints(polyline);
      assert.ok(points.length >= 2, `${visual.id}:${edge.id}: points`);
      assertSegmentLeavesRectangleAtOuterBoundary(
        [points[0], points[1]],
        rectangleForNode(parsed, edge.from),
        `${visual.id}:${edge.id}:from ${edge.from}`,
      );
      assertSegmentEntersRectangleAtOuterBoundary(
        [points.at(-2), points.at(-1)],
        rectangleForNode(parsed, edge.to),
        `${visual.id}:${edge.id}:to ${edge.to}`,
      );
    }
  }
});

test('routes a reversed same-row flow through the left and right outer boundaries', () => {
  const visual = {
    id: 'visual-context-horizontal-direction-fixture',
    title: 'Horizontal direction fixture',
    caption: 'Exercises the leftward endpoint contract.',
    role: 'process',
  };
  const scene = {
    type: 'flow',
    nodes: [
      { id: 'left', label: 'LEFT' },
      { id: 'right', label: 'RIGHT' },
    ],
    edges: [
      { id: 'right-left', from: 'right', to: 'left' },
    ],
  };
  const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
  const edge = elements(
    parsed,
    (node) => node.attributes.get('data-edge') === 'right-left',
  )[0];
  const points = polylinePoints(edge);
  assertSegmentLeavesRectangleAtOuterBoundary(
    [points[0], points[1]],
    rectangleForNode(parsed, 'right'),
    `${visual.id}:right-left:from right`,
  );
  assertSegmentEntersRectangleAtOuterBoundary(
    [points.at(-2), points.at(-1)],
    rectangleForNode(parsed, 'left'),
    `${visual.id}:right-left:to left`,
  );
});

test('places flow edge labels in unobstructed bounded boxes', () => {
  for (const visual of contextRagMemoryVisuals) {
    const scene = contextRagMemoryScenesById.get(visual.id).scene;
    if (scene.type !== 'flow') continue;
    const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
    for (const edge of scene.edges.filter(({ label }) => label)) {
      const group = elements(
        parsed,
        (node) => node.attributes.get('data-edge-label') === edge.id,
      )[0];
      assert.ok(group, `${visual.id}:${edge.id} label group`);
      const background = group.children.find(({ name }) => name === 'rect');
      const label = group.children.find(({ name }) => name === 'text');
      assert.ok(background && label, `${visual.id}:${edge.id} label background`);
      const labelBox = {
        left: number(background, 'x'),
        right: number(background, 'x') + number(background, 'width'),
        top: number(background, 'y'),
        bottom: number(background, 'y') + number(background, 'height'),
      };
      assert.ok(labelBox.left >= 0 && labelBox.right <= 1200, `${edge.id}: horizontal bounds`);
      assert.ok(labelBox.top >= 0 && labelBox.bottom <= 675, `${edge.id}: vertical bounds`);
      const textBox = rectangleForText(label);
      assert.ok(
        textBox.left >= labelBox.left
        && textBox.right <= labelBox.right
        && textBox.top >= labelBox.top
        && textBox.bottom <= labelBox.bottom,
        `${edge.id}: text fits background`,
      );
      for (const node of scene.nodes) {
        assert.equal(
          rectanglesOverlap(labelBox, rectangleForNode(parsed, node.id)),
          false,
          `${visual.id}:${edge.id} label overlaps ${node.id}`,
        );
      }
    }
  }

  const visual = contextRagMemoryVisuals.find(
    ({ id }) => id === 'visual-context-04-version-acl-delete',
  );
  const scene = contextRagMemoryScenesById.get(visual.id).scene;
  const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
  assert.deepEqual(
    elements(parsed, (node) => node.attributes.has('data-edge-label'))
      .map((group) => group.children.find(({ name }) => name === 'text').ownText)
      .sort(),
    ['CONSISTENT SNAPSHOT', 'TOMBSTONE', 'VERSION + ACL'],
  );
  const v3Edge = elements(
    parsed,
    (node) => node.attributes.get('data-edge') === 'v3-chunks',
  )[0];
  for (const segment of polylineSegments(v3Edge)) {
    assert.equal(
      segmentIntersectsRectangleInterior(segment, rectangleForNode(parsed, 'revoke-v2')),
      false,
      'source-v3→chunks must route around revoke-v2',
    );
  }
});

test('lays out chart series, event, and note labels without collisions', () => {
  for (const visual of contextRagMemoryVisuals) {
    const scene = contextRagMemoryScenesById.get(visual.id).scene;
    if (scene.type !== 'chart') continue;
    const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
    const labelGroups = elements(
      parsed,
      (node) => node.attributes.has('data-chart-label'),
    );
    const expectedLabelCount = scene.series.length
      + scene.series.reduce(
        (count, series) => count
          + series.points.length
          + series.points.filter(({ note }) => note).length,
        0,
      );
    assert.equal(labelGroups.length, expectedLabelCount, `${visual.id}: chart label count`);
    const boxes = labelGroups.map((group) => {
      const background = group.children.find(({ name }) => name === 'rect');
      const texts = group.children.filter(({ name }) => name === 'text');
      assert.ok(background && texts.length > 0, `${visual.id}: chart label structure`);
      const box = {
        id: group.attributes.get('data-chart-label'),
        left: number(background, 'x'),
        right: number(background, 'x') + number(background, 'width'),
        top: number(background, 'y'),
        bottom: number(background, 'y') + number(background, 'height'),
      };
      assert.ok(box.left >= 0 && box.right <= 1200, `${visual.id}:${box.id} horizontal`);
      assert.ok(box.top >= 0 && box.bottom <= 675, `${visual.id}:${box.id} vertical`);
      const labelRuns = texts.flatMap((label) => (
        label.children.some(({ name }) => name === 'tspan')
          ? label.children.filter(({ name }) => name === 'tspan')
          : [label]
      ));
      for (const label of labelRuns) {
        const textBox = rectangleForText(label);
        assert.ok(
          textBox.left >= box.left
          && textBox.right <= box.right
          && textBox.top >= box.top
          && textBox.bottom <= box.bottom,
          `${visual.id}:${box.id} text fits`,
        );
      }
      return box;
    });
    for (const [index, box] of boxes.entries()) {
      for (const other of boxes.slice(index + 1)) {
        assert.equal(
          rectanglesOverlap(box, other),
          false,
          `${visual.id}:${box.id} overlaps ${other.id}`,
        );
      }
    }
    for (const series of scene.series) {
      for (const point of series.points) {
        assert.equal(
          elements(
            parsed,
            (node) => node.attributes.get('data-chart-leader') === `${series.id}:${point.id}`,
          ).length,
          1,
          `${visual.id}:${series.id}/${point.id} leader`,
        );
      }
    }
  }

  const visual = contextRagMemoryVisuals.find(
    ({ id }) => id === 'visual-context-07-decay-delete',
  );
  const scene = contextRagMemoryScenesById.get(visual.id).scene;
  const parsed = parseStrictSvg(renderContextRagMemorySvg(visual, scene), visual.id);
  const labelBox = (id) => {
    const group = elements(
      parsed,
      (node) => node.attributes.get('data-chart-label') === id,
    )[0];
    const rect = group.children.find(({ name }) => name === 'rect');
    return {
      left: number(rect, 'x'),
      right: number(rect, 'x') + number(rect, 'width'),
      top: number(rect, 'y'),
      bottom: number(rect, 'y') + number(rect, 'height'),
      text: group.children.filter(({ name }) => name === 'text')
        .map(({ text }) => text).join(' '),
    };
  };
  for (const [eventId, noteId] of [
    ['event:relevance:fresh', 'note:state-boundaries:ttl'],
    ['event:relevance:aged', 'note:state-boundaries:superseded'],
  ]) {
    assert.equal(rectanglesOverlap(labelBox(eventId), labelBox(noteId)), false);
  }
  assert.match(labelBox('note:state-boundaries:ttl').text, /STOP RECALL/);
  assert.match(labelBox('note:state-boundaries:superseded').text, /USE NEW VALUE/);
  assert.match(
    labelBox('note:state-boundaries:delete').text,
    /STORE.*INDEX.*CACHE.*PROJECTION/,
  );
});

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
    width: 1200,
    height: 675,
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
  const parsed = assertSafeStaticSvg(svg, hostileVisual, 'hostile-renderer.svg');
  assert.equal(parsed.elementsByName.get('title')[0].text, hostileVisual.title);
  assert.equal(parsed.elementsByName.get('desc')[0].text, hostileVisual.caption);
  const validation = spawnSync('xmllint', ['--noout', '-'], {
    input: svg,
    encoding: 'utf8',
  });
  assert.equal(validation.status, 0, validation.stderr);
});
