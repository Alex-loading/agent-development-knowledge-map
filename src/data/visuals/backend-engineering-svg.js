const COLORS = {
  actor: ['#173B55', '#74D8F2'], request: ['#173B55', '#74D8F2'], entry: ['#173B55', '#74D8F2'],
  gate: ['#443716', '#F5CA72'], decision: ['#443716', '#F5CA72'], warning: ['#553240', '#F2A6B2'],
  terminal: ['#174B4A', '#8EECE1'], outcome: ['#174B4A', '#8EECE1'], result: ['#174B4A', '#8EECE1'],
  authority: ['#174B4A', '#8EECE1'], durable: ['#183850', '#7CCBDD'], derived: ['#24375F', '#9FB7FF'],
  cache: ['#3D315B', '#B8A7F8'], record: ['#183850', '#7CCBDD'], transport: ['#24375F', '#9FB7FF'],
  external: ['#553240', '#F2A6B2'], service: ['#24375F', '#9FB7FF'], host: ['#3D315B', '#B8A7F8'],
  worker: ['#24375F', '#9FB7FF'], queue: ['#24375F', '#9FB7FF'], state: ['#24375F', '#9FB7FF'],
  event: ['#24375F', '#9FB7FF'], lane: ['#183850', '#7CCBDD'], signal: ['#174B4A', '#8EECE1'],
  identity: ['#183850', '#7CCBDD'], version: ['#443716', '#F5CA72'], channel: ['#174B4A', '#8EECE1'],
  header: ['#173B55', '#74D8F2'], cell: ['#102C40', '#31556B'],
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

function text(x, y, content, {
  region, size = 16, weight = 650, fill = '#F5FBFF', anchor = 'middle',
} = {}) {
  return `<text ${attributes({
    x, y, 'data-region': region, 'font-family': 'Inter, Arial, sans-serif',
    'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor,
  })}>${escapeXml(content)}</text>`;
}

function estimateTextWidth(content, size = 14) {
  return [...String(content)].reduce((total, character) => {
    if (/\s/.test(character)) return total + size * 0.34;
    if (/[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(character)) return total + size;
    return total + size * 0.62;
  }, 0);
}

function renderNodeTexts(node) {
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  if (!node.secondary) {
    return text(centerX, centerY + 6, node.label, { region: 'node-primary', size: 15, weight: 760 });
  }
  return [
    text(centerX, centerY - 3, node.label, { region: 'node-primary', size: 15, weight: 760 }),
    text(centerX, centerY + 16, node.secondary, { region: 'node-secondary', size: 14, weight: 540, fill: '#C1D4E0' }),
  ].join('\n');
}

function nodeRect(node, { rx = 16, fill, stroke, strokeWidth = 2, opacity } = {}) {
  const colors = COLORS[node.kind] ?? COLORS.state;
  return `<rect ${attributes({
    x: node.x, y: node.y, width: node.width, height: node.height, rx,
    fill: fill ?? colors[0], stroke: stroke ?? colors[1], 'stroke-width': strokeWidth, opacity,
  })}/>`;
}

function renderRectNode(node, options = {}) {
  return `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, options)}
    ${renderNodeTexts(node)}
  </g>`;
}

function renderEdge(edge, markerId) {
  const color = ['error', 'reject', 'ambiguous', 'terminal'].includes(edge.kind)
    ? '#F2A6B2'
    : ['retry', 'feedback', 'redelivery', 'failover'].includes(edge.kind) ? '#F5CA72' : '#57D6C7';
  const chunks = [`<polyline ${attributes({
    'data-edge': edge.id, 'data-from': edge.from, 'data-to': edge.to, 'data-kind': edge.kind,
    points: edge.points.map(([x, y]) => `${x},${y}`).join(' '), fill: 'none', stroke: color,
    'stroke-width': 3, 'stroke-dasharray': ['retry', 'feedback', 'redelivery', 'failover'].includes(edge.kind) ? '8 6' : undefined,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'marker-end': `url(#${markerId})`,
  })}/>`];
  if (edge.label) {
    const [centerX, centerY] = edge.labelAt;
    const width = Math.min(230, Math.max(58, Math.ceil(estimateTextWidth(edge.label, 14) + 22)));
    chunks.push(`<g ${attributes({ 'data-edge-label': edge.id })}>
      <rect ${attributes({ x: centerX - width / 2, y: centerY - 14, width, height: 28, rx: 14, fill: '#0C2638', stroke: '#477083', 'stroke-width': 1 })}/>
      ${text(centerX, centerY + 5, edge.label, { region: 'edge-label', size: 14, weight: 680, fill: color })}
    </g>`);
  }
  return chunks.join('\n');
}

function renderEdges(scene, markerId) {
  return scene.edges.map((edge) => renderEdge(edge, markerId)).join('\n');
}

function renderValues(scene) {
  return scene.values.map((entry) => `<g ${attributes({ 'data-value': entry.id })}>
    <rect ${attributes({ x: entry.x, y: entry.y, width: entry.width, height: entry.height, rx: 19, fill: '#102C40', stroke: '#31556B', 'stroke-width': 1 })}/>
    ${text(entry.x + entry.width / 2, entry.y + 26, entry.text, { region: 'value', size: 14, weight: 680, fill: '#A7E8C2' })}
  </g>`).join('\n');
}

function renderSequence(scene, markerId) {
  const lifelines = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': 'actor' })}>
    ${nodeRect(node, { rx: 12 })}
    ${text(node.x + node.width / 2, node.y + 31, node.label, { region: 'node-primary', size: 15, weight: 760 })}
    <line ${attributes({ x1: node.x + node.width / 2, y1: node.y + node.height, x2: node.x + node.width / 2, y2: 478, stroke: '#31556B', 'stroke-width': 2, 'stroke-dasharray': '7 7' })}/>
  </g>`).join('\n');
  return `<g data-kind="sequence">${lifelines}${renderEdges(scene, markerId)}</g>`;
}

function renderProtocol(scene, markerId) {
  const nodes = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 10 })}
    <circle ${attributes({ cx: node.x + 22, cy: node.y + 20, r: 12, fill: '#0D2537', stroke: '#74D8F2', 'stroke-width': 1 })}/>
    ${text(node.x + node.width / 2, node.y + 44, node.label, { region: 'node-primary', size: 15, weight: 760 })}
    ${text(node.x + node.width / 2, node.y + 66, node.secondary, { region: 'node-secondary', size: 14, weight: 540, fill: '#C1D4E0' })}
  </g>`).join('\n');
  return `<g data-kind="protocol">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderTimeline(scene, markerId) {
  const nodes = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 35, fill: 'none', stroke: 'none', strokeWidth: 0 })}
    <circle ${attributes({ cx: node.x + node.width / 2, cy: node.y + node.height / 2, r: 31, fill: (COLORS[node.kind] ?? COLORS.event)[0], stroke: (COLORS[node.kind] ?? COLORS.event)[1], 'stroke-width': 3 })}/>
    ${text(node.x + node.width / 2, node.y + 32, node.label, { region: 'node-primary', size: 14, weight: 760 })}
    ${text(node.x + node.width / 2, node.y + 52, node.secondary, { region: 'node-secondary', size: 14, weight: 540, fill: '#C1D4E0' })}
  </g>`).join('\n');
  return `<g data-kind="timeline"><line ${attributes({ x1: 60, y1: scene.axisY, x2: 1120, y2: scene.axisY, stroke: '#31556B', 'stroke-width': 6, 'stroke-linecap': 'round' })}/>${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderSplit(scene, markerId) {
  const lanes = [185, 300, 415].map((y, index) => `<rect ${attributes({ 'data-region': `lane-${index + 1}`, x: 54, y: y - 12, width: 1092, height: 88, rx: 18, fill: index % 2 ? '#10283A' : '#0F3044', stroke: '#31556B', 'stroke-width': 1 })}/>`).join('\n');
  return `<g data-kind="split">${lanes}${renderEdges(scene, markerId)}${scene.nodes.map((node) => renderRectNode(node, { rx: 14 })).join('\n')}</g>`;
}

function renderEnvelope(scene, markerId) {
  const frames = scene.budgetFrames.map((frame, index) => `<g data-region="${frame.id}">
    <rect ${attributes({ x: frame.x, y: frame.y, width: frame.width, height: frame.height, rx: 24, fill: 'none', stroke: index ? '#31556B' : '#F5CA72', 'stroke-width': index ? 2 : 3, 'stroke-dasharray': index ? '8 7' : undefined })}/>
  </g>`).join('\n');
  return `<g data-kind="envelope">${frames}${renderEdges(scene, markerId)}${scene.nodes.map((node) => renderRectNode(node)).join('\n')}</g>`;
}

function renderDecision(scene, markerId) {
  const nodes = scene.nodes.map((node) => {
    if (node.kind !== 'decision') return renderRectNode(node, { rx: 14 });
    const points = [
      [node.x + node.width / 2, node.y], [node.x + node.width, node.y + node.height / 2],
      [node.x + node.width / 2, node.y + node.height], [node.x, node.y + node.height / 2],
    ].map((point) => point.join(',')).join(' ');
    return `<g ${attributes({ 'data-node': node.id, 'data-kind': 'decision' })}>
      ${nodeRect(node, { fill: 'none', stroke: 'none', strokeWidth: 0 })}
      <polygon ${attributes({ points, fill: COLORS.decision[0], stroke: COLORS.decision[1], 'stroke-width': 3 })}/>
      ${renderNodeTexts(node)}
    </g>`;
  }).join('\n');
  return `<g data-kind="decision">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderStateMachine(scene, markerId) {
  const nodes = scene.nodes.map((node) => {
    const terminalRing = node.kind === 'terminal'
      ? `<rect ${attributes({ x: node.x + 7, y: node.y + 7, width: node.width - 14, height: node.height - 14, rx: 21, fill: 'none', stroke: '#8EECE1', 'stroke-width': 1 })}/>`
      : '';
    return `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 28, strokeWidth: node.kind === 'terminal' ? 4 : 2 })}${terminalRing ? `\n    ${terminalRing}` : ''}
    ${renderNodeTexts(node)}
  </g>`;
  }).join('\n');
  return `<g data-kind="state-machine">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderMatrix(scene, markerId) {
  const cells = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: node.kind === 'header' ? 0 : 6, strokeWidth: 1 })}
    ${renderNodeTexts(node)}
  </g>`).join('\n');
  return `<g data-kind="matrix">${cells}${renderEdges(scene, markerId)}</g>`;
}

function renderLayers(scene, markerId) {
  const layers = scene.nodes.map((node, index) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 10 })}
    <rect ${attributes({ x: node.x, y: node.y, width: 12, height: node.height, rx: 6, fill: ['#74D8F2', '#7CCBDD', '#9FB7FF', '#B8A7F8'][index] })}/>
    ${text(node.x + 30, node.y + 22, node.label, { region: 'node-primary', size: 15, weight: 760, anchor: 'start' })}
    ${text(node.x + 250, node.y + 22, node.secondary, { region: 'node-secondary', size: 14, weight: 540, fill: '#C1D4E0', anchor: 'start' })}
  </g>`).join('\n');
  return `<g data-kind="layers">${renderEdges(scene, markerId)}${layers}</g>`;
}

function renderCache(scene, markerId) {
  const nodes = scene.nodes.map((node) => {
    const cacheRim = node.kind === 'cache'
      ? `<ellipse ${attributes({ cx: node.x + node.width / 2, cy: node.y + 14, rx: node.width / 2 - 4, ry: 12, fill: 'none', stroke: '#B8A7F8', 'stroke-width': 2 })}/>`
      : '';
    return `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: node.kind === 'cache' ? 28 : 14 })}${cacheRim ? `\n    ${cacheRim}` : ''}
    ${renderNodeTexts(node)}
  </g>`;
  }).join('\n');
  return `<g data-kind="cache">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderLedger(scene, markerId) {
  const nodes = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 8 })}
    <line ${attributes({ x1: node.x + 12, y1: node.y + 54, x2: node.x + node.width - 12, y2: node.y + 54, stroke: '#477083', 'stroke-width': 1 })}/>
    ${renderNodeTexts(node)}
  </g>`).join('\n');
  return `<g data-kind="ledger">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderDelivery(scene, markerId) {
  const nodes = scene.nodes.map((node) => `<g ${attributes({ 'data-node': node.id, 'data-kind': node.kind })}>
    ${nodeRect(node, { rx: 14 })}
    <circle ${attributes({ cx: node.x + 18, cy: node.y + 18, r: 11, fill: '#0D2537', stroke: '#57D6C7', 'stroke-width': 1 })}/>
    ${text(node.x + node.width / 2, node.y + 34, node.label, { region: 'node-primary', size: 15, weight: 760 })}
    ${text(node.x + node.width / 2, node.y + 55, node.secondary, { region: 'node-secondary', size: 14, weight: 540, fill: '#C1D4E0' })}
  </g>`).join('\n');
  return `<g data-kind="delivery">${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderSignalFlow(scene, markerId) {
  const nodes = scene.nodes.map((node) => renderRectNode(node, { rx: node.kind === 'signal' ? 8 : 26 })).join('\n');
  return `<g data-kind="signal-flow"><rect ${attributes({ x: 54, y: 386, width: 1092, height: 105, rx: 18, fill: '#0C2E35', stroke: '#31556B', 'stroke-width': 1 })}/>${renderEdges(scene, markerId)}${nodes}</g>`;
}

function renderObservability(scene, markerId) {
  const lanes = [175, 255, 335, 415].map((y, index) => `<rect ${attributes({ x: 56, y: y - 7, width: 1088, height: 72, rx: 14, fill: index % 2 ? '#10283A' : '#0F3044', stroke: '#244A61', 'stroke-width': 1 })}/>`).join('\n');
  return `<g data-kind="observability">${lanes}${renderEdges(scene, markerId)}${scene.nodes.map((node) => renderRectNode(node, { rx: 12 })).join('\n')}</g>`;
}

function renderDeployment(scene, markerId) {
  const zones = scene.zoneFrames.map((zone) => `<rect ${attributes({ 'data-region': zone.id, x: zone.x, y: zone.y, width: zone.width, height: zone.height, rx: 22, fill: '#0B2233', stroke: '#31556B', 'stroke-width': 2, 'stroke-dasharray': '9 7' })}/>`).join('\n');
  return `<g data-kind="deployment">${zones}${renderEdges(scene, markerId)}${scene.nodes.map((node) => renderRectNode(node, { rx: 14 })).join('\n')}</g>`;
}

const RENDERERS = {
  sequence: renderSequence,
  protocol: renderProtocol,
  timeline: renderTimeline,
  split: renderSplit,
  envelope: renderEnvelope,
  decision: renderDecision,
  'state-machine': renderStateMachine,
  matrix: renderMatrix,
  layers: renderLayers,
  cache: renderCache,
  ledger: renderLedger,
  delivery: renderDelivery,
  'signal-flow': renderSignalFlow,
  observability: renderObservability,
  deployment: renderDeployment,
};

export function renderBackendEngineeringSvg(visual, scene) {
  if (!visual || !scene || visual.id !== scene.id) throw new TypeError('Backend visual and scene IDs must match');
  const renderer = RENDERERS[scene.type];
  if (!renderer) throw new TypeError(`Unsupported backend scene type: ${scene.type}`);
  const prefix = safeId(visual.id);
  const titleId = `${prefix}-title`;
  const descriptionId = `${prefix}-description`;
  const markerId = `${prefix}-arrow`;
  const body = renderer(scene, markerId);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${titleId} ${descriptionId}">
  <title id="${titleId}">${escapeXml(visual.title)}</title>
  <desc id="${descriptionId}">${escapeXml(visual.longDescription)}</desc>
  <defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#57D6C7"/></marker></defs>
  <rect width="1200" height="675" fill="#081B2A"/>
  <rect x="36" y="36" width="1128" height="603" rx="28" fill="#0D2537" stroke="#244A61" stroke-width="2"/>
  ${text(64, 94, scene.title, { region: 'title', size: 30, weight: 760, anchor: 'start' })}
  ${text(64, 132, scene.subtitle, { region: 'subtitle', size: 17, weight: 500, fill: '#B8CBD8', anchor: 'start' })}
  ${body}
  ${renderValues(scene)}
  ${text(64, 610, visual.caption, { region: 'caption', size: 15, weight: 500, fill: '#91AABA', anchor: 'start' })}
  ${text(1136, 610, `${scene.type.toUpperCase()} · ${scene.topology.split('-').slice(0, 2).join('-')}`, { region: 'footer', size: 14, weight: 600, fill: '#66899D', anchor: 'end' })}
</svg>`;
}
