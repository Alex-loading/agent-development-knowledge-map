import assert from 'node:assert/strict';

export const BACKEND_CANVAS = Object.freeze({ left: 0, right: 1200, top: 0, bottom: 675 });

export const BACKEND_TEXT_REGIONS = Object.freeze({
  title: { left: 54, right: 1146, top: 58, bottom: 108 },
  subtitle: { left: 54, right: 1146, top: 108, bottom: 151 },
  'node-primary': { left: 36, right: 1164, top: 158, bottom: 514 },
  'node-secondary': { left: 36, right: 1164, top: 158, bottom: 514 },
  value: { left: 54, right: 1146, top: 518, bottom: 580 },
  'edge-label': { left: 36, right: 1164, top: 151, bottom: 518 },
  caption: { left: 54, right: 840, top: 582, bottom: 626 },
  footer: { left: 820, right: 1146, top: 582, bottom: 626 },
});

export function walkSvg(node, visit, ancestors = []) {
  visit(node, ancestors);
  for (const child of node.children) walkSvg(child, visit, [...ancestors, node]);
}

export function svgElements(parsed, predicate) {
  const matches = [];
  walkSvg(parsed.root, (node, ancestors) => {
    if (predicate(node, ancestors)) matches.push({ node, ancestors });
  });
  return matches;
}

function numeric(node, attribute) {
  const value = Number(node.attributes.get(attribute));
  assert.ok(Number.isFinite(value), `text geometry requires numeric ${attribute}`);
  return value;
}

function estimatedAdvance(text, fontSize) {
  return [...text].reduce((width, character) => {
    if (/\s/u.test(character)) return width + fontSize * 0.33;
    if (/^[\x21-\x7e]$/u.test(character)) return width + fontSize * 0.58;
    return width + fontSize;
  }, 0);
}

function ancestorAttribute(ancestors, attribute) {
  return [...ancestors].reverse().find((ancestor) => ancestor.attributes.has(attribute))
    ?.attributes.get(attribute);
}

export function renderedTextBoxes(parsed) {
  return svgElements(parsed, ({ name }) => name === 'text').map(({ node, ancestors }) => {
    const region = node.attributes.get('data-region');
    assert.ok(region, `unclassified rendered text: ${node.text.trim()}`);
    assert.ok(BACKEND_TEXT_REGIONS[region], `unknown text region ${region}`);
    const x = numeric(node, 'x');
    const y = numeric(node, 'y');
    const fontSize = numeric(node, 'font-size');
    assert.ok(fontSize >= 14, `${region}: font-size ${fontSize}`);
    const width = estimatedAdvance(node.text.trim(), fontSize);
    const anchor = node.attributes.get('text-anchor') ?? 'start';
    const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    return {
      id: `${region}:${node.text.trim()}`,
      text: node.text.trim(),
      region,
      left,
      right: left + width,
      top: y - fontSize * 0.82,
      bottom: y + fontSize * 0.24,
      ownerNode: ancestorAttribute(ancestors, 'data-node'),
      ownerValue: ancestorAttribute(ancestors, 'data-value'),
      ownerEdgeLabel: ancestorAttribute(ancestors, 'data-edge-label'),
    };
  });
}

export function groupRectangles(parsed, attribute) {
  return new Map(svgElements(
    parsed,
    (node) => node.attributes.has(attribute),
  ).map(({ node: group }) => {
    const rectangle = group.children.find(({ name }) => name === 'rect');
    assert.ok(rectangle, `${attribute}=${group.attributes.get(attribute)} must own a rect`);
    const left = numeric(rectangle, 'x');
    const top = numeric(rectangle, 'y');
    return [group.attributes.get(attribute), {
      id: group.attributes.get(attribute),
      left,
      right: left + numeric(rectangle, 'width'),
      top,
      bottom: top + numeric(rectangle, 'height'),
    }];
  }));
}

export function boxesOverlap(first, second, padding = 0) {
  return first.left < second.right + padding
    && first.right > second.left - padding
    && first.top < second.bottom + padding
    && first.bottom > second.top - padding;
}

export function boxContains(outer, inner, padding = 0) {
  return inner.left >= outer.left + padding
    && inner.right <= outer.right - padding
    && inner.top >= outer.top + padding
    && inner.bottom <= outer.bottom - padding;
}

export function segmentsFromPoints(points) {
  return points.slice(1).map((point, index) => [points[index], point]);
}

export function parsePolylinePoints(polyline) {
  return polyline.attributes.get('points').trim().split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
}

export function segmentIntersectsInterior([[x1, y1], [x2, y2]], rectangle) {
  assert.ok(x1 === x2 || y1 === y2, 'backend graph routing must be orthogonal');
  if (x1 === x2) {
    return x1 > rectangle.left && x1 < rectangle.right
      && Math.max(y1, y2) > rectangle.top && Math.min(y1, y2) < rectangle.bottom;
  }
  return y1 > rectangle.top && y1 < rectangle.bottom
    && Math.max(x1, x2) > rectangle.left && Math.min(x1, x2) < rectangle.right;
}

export function collinearOverlap(first, second) {
  const [[ax1, ay1], [ax2, ay2]] = first;
  const [[bx1, by1], [bx2, by2]] = second;
  if (ay1 === ay2 && by1 === by2 && ay1 === by1) {
    return Math.min(Math.max(ax1, ax2), Math.max(bx1, bx2))
      - Math.max(Math.min(ax1, ax2), Math.min(bx1, bx2)) > 0;
  }
  if (ax1 === ax2 && bx1 === bx2 && ax1 === bx1) {
    return Math.min(Math.max(ay1, ay2), Math.max(by1, by2))
      - Math.max(Math.min(ay1, ay2), Math.min(by1, by2)) > 0;
  }
  return false;
}

export function orthogonalIntersection(first, second) {
  const horizontal = first[0][1] === first[1][1]
    ? first
    : second[0][1] === second[1][1] ? second : null;
  const vertical = first[0][0] === first[1][0]
    ? first
    : second[0][0] === second[1][0] ? second : null;
  if (!horizontal || !vertical || horizontal === vertical) return null;
  const point = [vertical[0][0], horizontal[0][1]];
  const onHorizontal = point[0] >= Math.min(horizontal[0][0], horizontal[1][0])
    && point[0] <= Math.max(horizontal[0][0], horizontal[1][0]);
  const onVertical = point[1] >= Math.min(vertical[0][1], vertical[1][1])
    && point[1] <= Math.max(vertical[0][1], vertical[1][1]);
  return onHorizontal && onVertical ? point : null;
}

function samePoint(first, second) {
  return first[0] === second[0] && first[1] === second[1];
}

export function allowedEdgeIntersection(scene, edge, other, point) {
  const sharedNode = [edge.from, edge.to].some((id) => id === other.from || id === other.to);
  const explicitSharedEndpoint = sharedNode
    && [edge.points[0], edge.points.at(-1)].some((endpoint) => samePoint(endpoint, point))
    && [other.points[0], other.points.at(-1)].some((endpoint) => samePoint(endpoint, point));
  const declared = [...(scene.junctions ?? []), ...(scene.bridges ?? [])]
    .some(({ x, y }) => x === point[0] && y === point[1]);
  return explicitSharedEndpoint || declared;
}
