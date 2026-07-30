function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function lines(label) {
  return label.split('\n').map(escapeXml);
}

export function renderAgentMechanismSvg(visual, scene) {
  const nodesById = new Map(scene.nodes.map((node) => [node.id, node]));
  const edges = scene.edges.map((edge) => {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    const startX = from.x + from.width;
    const endX = to.x;
    const y = from.y + from.height / 2;
    const labelX = (startX + endX) / 2;
    return `<g data-edge="${escapeXml(edge.id)}">
      <path d="M ${startX} ${y} L ${endX - 12} ${y}" fill="none" stroke="#57D6C7" stroke-width="4"/>
      <path d="M ${endX - 18} ${y - 8} L ${endX} ${y} L ${endX - 18} ${y + 8}" fill="none" stroke="#57D6C7" stroke-width="4"/>
      <rect x="${labelX - 38}" y="${y - 48}" width="76" height="30" rx="15" fill="#10283A"/>
      <text x="${labelX}" y="${y - 27}" text-anchor="middle" font-size="16" fill="#8EECE1">${escapeXml(edge.label)}</text>
    </g>`;
  }).join('\n');
  const nodes = scene.nodes.map((node, index) => {
    const labelLines = lines(node.label);
    const startY = node.y + 42 - (labelLines.length - 1) * 12;
    return `<g data-node="${escapeXml(node.id)}">
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="22" fill="${index % 2 === 0 ? '#173B55' : '#1E4B55'}" stroke="#75E3D6" stroke-width="2"/>
      ${labelLines.map((line, lineIndex) => `<text x="${node.x + node.width / 2}" y="${startY + lineIndex * 28}" text-anchor="middle" font-size="${lineIndex === 0 ? 18 : 16}" font-weight="${lineIndex === 0 ? 700 : 500}" fill="#F5FBFF">${line}</text>`).join('\n')}
    </g>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(visual.title)}</title>
  <desc id="description">${escapeXml(visual.longDescription)}</desc>
  <rect width="1200" height="675" fill="#081B2A"/>
  <rect x="36" y="36" width="1128" height="603" rx="28" fill="#0D2537" stroke="#244A61" stroke-width="2"/>
  <text x="64" y="105" font-size="34" font-weight="750" fill="#F5FBFF">${escapeXml(scene.title)}</text>
  <text x="64" y="150" font-size="19" fill="#B8CBD8">${escapeXml(scene.subtitle)}</text>
  ${edges}
  ${nodes}
  <text x="64" y="590" font-size="18" fill="#7FA1B5">${escapeXml(visual.caption)}</text>
  <text x="1136" y="610" text-anchor="end" font-size="16" fill="#5F8195">Agent Learner · 2026-07-30</text>
</svg>`;
}
