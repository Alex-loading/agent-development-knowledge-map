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
import { assertSafeStaticSvg } from './helpers/static-svg.js';

function rectanglesOverlap(left, right) {
  return left.x < right.x + right.width && left.x + left.width > right.x
    && left.y < right.y + right.height && left.y + left.height > right.y;
}

function segmentHitsRectangle([start, end], rectangle) {
  const [[x1, y1], [x2, y2]] = [start, end];
  if (x1 === x2) {
    return x1 > rectangle.x && x1 < rectangle.x + rectangle.width
      && Math.max(Math.min(y1, y2), rectangle.y) < Math.min(Math.max(y1, y2), rectangle.y + rectangle.height);
  }
  return y1 > rectangle.y && y1 < rectangle.y + rectangle.height
    && Math.max(Math.min(x1, x2), rectangle.x) < Math.min(Math.max(x1, x2), rectangle.x + rectangle.width);
}

function segmentIntersection(left, right) {
  const [[ax1, ay1], [ax2, ay2]] = left;
  const [[bx1, by1], [bx2, by2]] = right;
  const leftHorizontal = ay1 === ay2;
  const rightHorizontal = by1 === by2;
  if (leftHorizontal === rightHorizontal) {
    if (leftHorizontal && ay1 === by1) {
      return Math.max(Math.min(ax1, ax2), Math.min(bx1, bx2)) < Math.min(Math.max(ax1, ax2), Math.max(bx1, bx2));
    }
    if (!leftHorizontal && ax1 === bx1) {
      return Math.max(Math.min(ay1, ay2), Math.min(by1, by2)) < Math.min(Math.max(ay1, ay2), Math.max(by1, by2));
    }
    return false;
  }
  const horizontal = leftHorizontal ? left : right;
  const vertical = leftHorizontal ? right : left;
  const [[hx1, hy], [hx2]] = horizontal;
  const [[vx, vy1], [, vy2]] = vertical;
  return vx > Math.min(hx1, hx2) && vx < Math.max(hx1, hx2)
    && hy > Math.min(vy1, vy2) && hy < Math.max(vy1, vy2);
}

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

test('all scene geometry stays inside reserved regions with orthogonal nonzero edges', () => {
  assert.equal(backendEngineeringScenes.length, 16);
  for (const scene of backendEngineeringScenes) {
    for (const card of scene.cards) {
      assert.ok(card.x >= 36 && card.x + card.width <= 1164, `${scene.id}:${card.id}:x`);
      assert.ok(card.y >= 170 && card.y + card.height <= 510, `${scene.id}:${card.id}:y`);
      assert.ok(card.width >= 160 && card.height >= 72, `${scene.id}:${card.id}:size`);
    }
    for (const edge of scene.edges) {
      assert.ok(edge.points.length >= 2);
      for (let index = 1; index < edge.points.length; index += 1) {
        const [x1, y1] = edge.points[index - 1];
        const [x2, y2] = edge.points[index];
        assert.ok(x1 === x2 || y1 === y2, `${scene.id}:${edge.id}:diagonal`);
        assert.notDeepEqual(edge.points[index - 1], edge.points[index], `${scene.id}:${edge.id}:zero`);
      }
    }
  }
});

test('strict geometry has zero node overlap, edge collision, crossing, truncation, or undersized text', () => {
  for (const visual of backendEngineeringVisuals) {
    const scene = getBackendEngineeringScene(visual.id);
    for (let left = 0; left < scene.cards.length; left += 1) {
      for (let right = left + 1; right < scene.cards.length; right += 1) {
        assert.equal(rectanglesOverlap(scene.cards[left], scene.cards[right]), false, `${scene.id}:node-node`);
      }
    }
    const segments = scene.edges.flatMap((edge) => edge.points.slice(1).map((point, index) => ({
      edge,
      points: [edge.points[index], point],
    })));
    for (const segment of segments) {
      for (const card of scene.cards.filter(({ id }) => ![segment.edge.from, segment.edge.to].includes(id))) {
        assert.equal(segmentHitsRectangle(segment.points, card), false, `${scene.id}:${segment.edge.id}:${card.id}`);
      }
    }
    for (let left = 0; left < segments.length; left += 1) {
      for (let right = left + 1; right < segments.length; right += 1) {
        if (segments[left].edge.id === segments[right].edge.id) continue;
        assert.equal(segmentIntersection(segments[left].points, segments[right].points), false, `${scene.id}:edge-edge`);
      }
    }
    assert.ok(scene.edges.every((edge) => edge.label === undefined), `${scene.id}: edge labels require collision boxes`);
    const svg = renderBackendEngineeringSvg(visual, scene);
    const fontSizes = [...svg.matchAll(/font-size="(\d+)"/g)].map((match) => Number(match[1]));
    assert.ok(fontSizes.length > 0 && Math.min(...fontSizes) >= 14, `${scene.id}:min-font`);
    for (const card of scene.cards) {
      for (const word of card.label.split(/\s+/)) assert.ok(svg.includes(word), `${scene.id}:${card.id}:truncation`);
    }
    assert.match(svg, /<text x="64" y="94"/);
    assert.match(svg, /<text x="64" y="610"/);
  }
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
