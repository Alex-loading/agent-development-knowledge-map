const NODE_COLORS = {
  stage: ['#173B55', '#75E3D6'],
  controlled: ['#174B4A', '#8EECE1'],
  host: ['#3D315B', '#B8A7F8'],
  evidence: ['#24482F', '#9FE5B0'],
  decision: ['#4A391D', '#F5CA72'],
  outcome: ['#1E5141', '#88E0B7'],
  blocked: ['#562E35', '#F2A6B2'],
  layer: ['#183850', '#7CCBDD'],
  protocol: ['#293B63', '#9FB7FF'],
};

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]/g, (character) => (
    `-x${character.codePointAt(0).toString(16)}-`
  ));
}

function attributes(values) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}="${escapeXml(value)}"`)
    .join(' ');
}

function text(x, y, value, {
  size = 16,
  weight = 600,
  fill = '#F5FBFF',
  anchor = 'middle',
} = {}) {
  return `<text ${attributes({
    x,
    y,
    'font-family': 'Inter, Arial, sans-serif',
    'font-size': size,
    'font-weight': weight,
    fill,
    'text-anchor': anchor,
  })}>${escapeXml(value)}</text>`;
}

function renderNode(node) {
  const [fill, stroke] = NODE_COLORS[node.kind] ?? NODE_COLORS.stage;
  const labelLines = String(node.label).split('\n');
  const lineHeight = labelLines.length >= 3 ? 22 : 25;
  const startY = node.y + node.height / 2
    - ((labelLines.length - 1) * lineHeight) / 2
    + 6;
  return [
    `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>`,
    `<rect ${attributes({
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      rx: node.kind === 'layer' ? 16 : 20,
      fill,
      stroke,
      'stroke-width': 2,
    })}/>`,
    ...labelLines.map((line, index) => text(
      node.x + node.width / 2,
      startY + index * lineHeight,
      line,
      {
        size: index === 0 ? 16 : 14,
        weight: index === 0 ? 750 : 550,
      },
    )),
    '</g>',
  ].join('');
}

function labelWidth(label) {
  return Math.min(188, Math.max(72, [...String(label)].length * 8 + 24));
}

function renderEdge(edge, markerId) {
  const stroke = edge.kind === 'feedback' ? '#F5C36A' : '#57D6C7';
  const chunks = [
    `<polyline ${attributes({
      'data-edge': edge.id,
      'data-from': edge.from,
      'data-to': edge.to,
      'data-kind': edge.kind,
      points: edge.points.map(([x, y]) => `${x},${y}`).join(' '),
      fill: 'none',
      stroke,
      'stroke-width': edge.kind === 'feedback' ? 3 : 4,
      'stroke-dasharray': edge.kind === 'feedback' ? '8 6' : undefined,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'marker-end': `url(#${markerId})`,
    })}/>`,
  ];
  if (edge.label) {
    const [centerX, centerY] = edge.labelAt;
    const width = labelWidth(edge.label);
    chunks.push(
      `<g ${attributes({ 'data-edge-label': edge.id })}>`,
      `<rect ${attributes({
        x: centerX - width / 2,
        y: centerY - 13,
        width,
        height: 24,
        rx: 12,
        fill: '#10283A',
        stroke: '#31556B',
        'stroke-width': 1,
      })}/>`,
      text(centerX, centerY + 4, edge.label, {
        size: 14,
        weight: 650,
        fill: edge.kind === 'feedback' ? '#F5D28C' : '#8EECE1',
      }),
      '</g>',
    );
  }
  return chunks.join('');
}

function renderGraph(scene, markerId) {
  return [
    `<g ${attributes({ 'data-kind': scene.type })}>`,
    ...scene.edges.map((edge) => renderEdge(edge, markerId)),
    ...scene.nodes.map(renderNode),
    '</g>',
  ].join('');
}

function renderMatrix(scene) {
  const left = 82;
  const top = 182;
  const headerHeight = 52;
  const rowHeight = 58;
  const chunks = [`<g ${attributes({ 'data-kind': scene.type })}>`];
  let x = left;
  for (const column of scene.columns) {
    chunks.push(
      `<rect ${attributes({
        'data-column': column.id,
        x,
        y: top,
        width: column.width,
        height: headerHeight,
        fill: '#173B55',
        stroke: '#75E3D6',
        'stroke-width': 2,
      })}/>`,
      text(x + column.width / 2, top + 33, column.label, {
        size: 16,
        weight: 750,
        fill: '#8EECE1',
      }),
    );
    x += column.width;
  }
  for (const [rowIndex, row] of scene.rows.entries()) {
    x = left;
    const y = top + headerHeight + rowIndex * rowHeight;
    for (const [columnIndex, column] of scene.columns.entries()) {
      chunks.push(
        `<g ${attributes({
          'data-row': row.id,
          'data-column': column.id,
        })}>`,
        `<rect ${attributes({
          x,
          y,
          width: column.width,
          height: rowHeight,
          fill: rowIndex % 2 === 0 ? '#102C40' : '#0D2537',
          stroke: '#31556B',
          'stroke-width': 1,
        })}/>`,
        text(x + column.width / 2, y + 36, row.cells[columnIndex], {
          size: 14,
          weight: columnIndex === 0 ? 700 : 550,
          fill: columnIndex === 3 ? '#A7E8C2' : '#F5FBFF',
        }),
        '</g>',
      );
      x += column.width;
    }
  }
  chunks.push('</g>');
  return chunks.join('');
}

export function renderAgentMechanismSvg(visual, scene) {
  const prefix = safeId(visual.id);
  const titleId = `${prefix}-title`;
  const descriptionId = `${prefix}-description`;
  const markerId = `${prefix}-arrow`;
  const body = scene.type === 'matrix'
    ? renderMatrix(scene)
    : renderGraph(scene, markerId);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${titleId} ${descriptionId}">
  <title id="${titleId}">${escapeXml(visual.title)}</title>
  <desc id="${descriptionId}">${escapeXml(visual.longDescription)}</desc>
  <defs>
    <marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0 0 L8 4 L0 8 Z" fill="#57D6C7"/>
    </marker>
  </defs>
  <rect width="1200" height="675" fill="#081B2A"/>
  <rect x="36" y="36" width="1128" height="603" rx="28" fill="#0D2537" stroke="#244A61" stroke-width="2"/>
  ${text(64, 98, scene.title, { size: 30, weight: 750, anchor: 'start' })}
  ${text(64, 137, scene.subtitle, { size: 18, weight: 500, fill: '#B8CBD8', anchor: 'start' })}
  ${body}
  ${text(64, 606, visual.caption, { size: 16, weight: 500, fill: '#91AABA', anchor: 'start' })}
  ${text(1136, 614, `${scene.type.toUpperCase()} · ${scene.topology}`, {
    size: 14,
    weight: 600,
    fill: '#66899D',
    anchor: 'end',
  })}
</svg>`;
}
