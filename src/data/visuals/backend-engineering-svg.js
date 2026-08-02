const COLORS = {
  entry: ['#173B55', '#74D8F2'],
  stage: ['#24375F', '#9FB7FF'],
  outcome: ['#174B4A', '#8EECE1'],
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
  size = 16, weight = 600, fill = '#F5FBFF', anchor = 'middle',
} = {}) {
  return `<text ${attributes({
    x, y, 'font-family': 'Inter, Arial, sans-serif', 'font-size': size,
    'font-weight': weight, fill, 'text-anchor': anchor,
  })}>${escapeXml(value)}</text>`;
}

function wrapLabel(value, limit = 20) {
  const raw = String(value);
  if ([...raw].length <= limit) return [raw];
  const words = raw.split(/\s+/);
  if (words.length === 1) {
    const characters = [...raw];
    return [characters.slice(0, limit).join(''), characters.slice(limit).join('')];
  }
  const lines = [''];
  for (const word of words) {
    const candidate = `${lines.at(-1)} ${word}`.trim();
    if ([...candidate].length > limit && lines.at(-1)) lines.push(word);
    else lines[lines.length - 1] = candidate;
  }
  return lines.slice(0, 2);
}

function renderCard(card) {
  const [fill, stroke] = COLORS[card.kind] ?? COLORS.stage;
  const lines = wrapLabel(card.label, card.width >= 200 ? 22 : 17);
  const lineHeight = 23;
  const startY = card.y + card.height / 2 - ((lines.length - 1) * lineHeight) / 2 + 6;
  return `<g ${attributes({ 'data-node': card.id, 'data-kind': card.kind })}>
    <rect ${attributes({
    x: card.x, y: card.y, width: card.width, height: card.height, rx: 18,
    fill, stroke, 'stroke-width': 2,
  })}/>
    ${lines.map((line, index) => text(
    card.x + card.width / 2,
    startY + index * lineHeight,
    line,
    { size: index === 0 ? 16 : 14, weight: index === 0 ? 750 : 600 },
  )).join('\n')}
  </g>`;
}

function renderEdge(edge, markerId) {
  return `<polyline ${attributes({
    'data-edge': edge.id,
    'data-from': edge.from,
    'data-to': edge.to,
    points: edge.points.map(([x, y]) => `${x},${y}`).join(' '),
    fill: 'none',
    stroke: '#57D6C7',
    'stroke-width': 4,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'marker-end': `url(#${markerId})`,
  })}/>`;
}

function renderValues(values) {
  const gap = 16;
  const width = Math.floor((1072 - (values.length - 1) * gap) / values.length);
  return values.map((value, index) => {
    const x = 64 + index * (width + gap);
    return `<g ${attributes({ 'data-value': index + 1 })}>
      <rect ${attributes({ x, y: 535, width, height: 38, rx: 19, fill: '#102C40', stroke: '#31556B' })}/>
      ${text(x + width / 2, 560, value, { size: 14, weight: 650, fill: '#A7E8C2' })}
    </g>`;
  }).join('\n');
}

export function renderBackendEngineeringSvg(visual, scene) {
  if (!visual || !scene || visual.id !== scene.id) {
    throw new TypeError('Backend visual and scene IDs must match');
  }
  const prefix = safeId(visual.id);
  const titleId = `${prefix}-title`;
  const descriptionId = `${prefix}-description`;
  const markerId = `${prefix}-arrow`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${titleId} ${descriptionId}">
  <title id="${titleId}">${escapeXml(visual.title)}</title>
  <desc id="${descriptionId}">${escapeXml(visual.longDescription)}</desc>
  <defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#57D6C7"/></marker></defs>
  <rect width="1200" height="675" fill="#081B2A"/>
  <rect x="36" y="36" width="1128" height="603" rx="28" fill="#0D2537" stroke="#244A61" stroke-width="2"/>
  ${text(64, 94, scene.title, { size: 30, weight: 760, anchor: 'start' })}
  ${text(64, 132, scene.subtitle, { size: 17, weight: 500, fill: '#B8CBD8', anchor: 'start' })}
  <g ${attributes({ 'data-kind': scene.type })}>
    ${scene.edges.map((edge) => renderEdge(edge, markerId)).join('\n')}
    ${scene.cards.map(renderCard).join('\n')}
    ${renderValues(scene.values)}
  </g>
  ${text(64, 610, visual.caption, { size: 15, weight: 500, fill: '#91AABA', anchor: 'start' })}
  ${text(1136, 610, `${scene.type.toUpperCase()} · ${scene.topology}`, { size: 14, weight: 600, fill: '#66899D', anchor: 'end' })}
</svg>`;
}
