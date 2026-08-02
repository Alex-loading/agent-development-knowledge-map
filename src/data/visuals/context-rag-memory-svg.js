const WIDTH = 1200;
const HEIGHT = 675;
const COLORS = ['#2563eb', '#0f766e', '#7c3aed', '#c2410c', '#be123c', '#0369a1'];

export function escapeXml(value) {
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
  fill = '#14213d',
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

function titleBlock(visual, markerId) {
  const titleId = `${safeId(visual.id)}-title`;
  const descId = `${safeId(visual.id)}-desc`;
  return {
    titleId,
    descId,
    markup: [
      `<title id="${titleId}">${escapeXml(visual.title)}</title>`,
      `<desc id="${descId}">${escapeXml(visual.caption)}</desc>`,
      '<defs>',
      `<marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">`,
      '<path d="M0 0 L8 4 L0 8 Z" fill="#64748b"/>',
      '</marker>',
      '</defs>',
      '<rect x="0" y="0" width="1200" height="675" fill="#f8fafc"/>',
      '<rect x="42" y="28" width="1116" height="96" rx="24" fill="#0f172a"/>',
      text(76, 74, visual.title, {
        size: 28,
        weight: 700,
        fill: '#ffffff',
        anchor: 'start',
      }),
      text(76, 103, `${String(visual.role).toUpperCase()} · TYPED SEMANTIC SCENE`, {
        size: 15,
        fill: '#bfdbfe',
        anchor: 'start',
      }),
    ].join(''),
  };
}

function nodePositions(nodes) {
  const columns = Math.min(4, Math.max(1, nodes.length));
  const width = columns === 4 ? 240 : Math.min(300, Math.floor(1040 / columns) - 22);
  const gap = columns === 1 ? 0 : (1040 - (columns * width)) / (columns - 1);
  return new Map(nodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    return [node.id, {
      x: 80 + column * (width + gap),
      y: 170 + row * 178,
      width,
      height: 76,
    }];
  }));
}

function renderFlow(scene, prefix, markerId) {
  const positions = nodePositions(scene.nodes);
  const sameRowLabelLaneByEdge = new Map();
  const labelCountsByRow = new Map();
  for (const edge of scene.edges) {
    if (!edge.label) continue;
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to || from.y !== to.y) continue;
    const count = labelCountsByRow.get(from.y) ?? 0;
    sameRowLabelLaneByEdge.set(edge.id, count);
    labelCountsByRow.set(from.y, count + 1);
  }
  const edges = scene.edges.map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) throw new RangeError(`Unknown flow edge endpoint: ${edge.id}`);
    const sameRow = from.y === to.y;
    const crossesNode = sameRow && [...positions.entries()].some(([id, position]) => (
      id !== edge.from
      && id !== edge.to
      && position.y === from.y
      && position.x < Math.max(from.x, to.x)
      && position.x + position.width > Math.min(from.x + from.width, to.x + to.width)
    ));
    let startX;
    let startY;
    let endX;
    let endY;
    let middleY;
    let points;
    const labelLaneIndex = sameRowLabelLaneByEdge.get(edge.id);
    if (crossesNode || labelLaneIndex !== undefined) {
      const routeAbove = labelLaneIndex === undefined
        ? from.y === 170
        : labelLaneIndex % 2 === 0;
      startX = from.x + from.width / 2;
      startY = routeAbove ? from.y : from.y + from.height;
      endX = to.x + to.width / 2;
      endY = routeAbove ? to.y : to.y + to.height;
      middleY = routeAbove ? from.y - 24 : from.y + from.height + 42;
      points = `${startX},${startY} ${startX},${middleY} ${endX},${middleY} ${endX},${endY}`;
    } else {
      const movesRight = to.x > from.x;
      const movesDown = to.y > from.y;
      startX = sameRow
        ? movesRight ? from.x + from.width : from.x
        : from.x + from.width / 2;
      startY = sameRow
        ? from.y + from.height / 2
        : movesDown ? from.y + from.height : from.y;
      endX = sameRow
        ? movesRight ? to.x : to.x + to.width
        : to.x + to.width / 2;
      endY = sameRow
        ? to.y + to.height / 2
        : movesDown ? to.y : to.y + to.height;
      middleY = sameRow
        ? startY
        : Math.min(560, Math.max(140, (startY + endY) / 2));
      points = sameRow
        ? `${startX},${startY} ${endX},${endY}`
        : `${startX},${startY} ${startX},${middleY} ${endX},${middleY} ${endX},${endY}`;
    }
    const dash = edge.kind === 'excluded' ? '9 6' : undefined;
    const stroke = edge.kind === 'excluded' ? '#c2410c' : '#64748b';
    const labelWidth = edge.label ? [...edge.label].length * 12 * 0.58 + 16 : 0;
    const labelX = (startX + endX) / 2;
    return [
      `<polyline ${attributes({
        id: `${prefix}-edge-${safeId(edge.id)}`,
        'data-edge': edge.id,
        'data-from': edge.from,
        'data-to': edge.to,
        points,
        fill: 'none',
        stroke,
        'stroke-width': 2.5,
        'stroke-dasharray': dash,
        'marker-end': `url(#${markerId})`,
      })}/>`,
      edge.label
        ? [
          `<g ${attributes({
            id: `${prefix}-edge-label-${safeId(edge.id)}`,
            'data-edge-label': edge.id,
          })}>`,
          `<rect ${attributes({
            x: labelX - labelWidth / 2,
            y: middleY - 13,
            width: labelWidth,
            height: 24,
            rx: 6,
            fill: '#f8fafc',
            stroke,
            'stroke-width': 1,
          })}/>`,
          text(labelX, middleY + 4, edge.label, {
            size: 12,
            fill: stroke,
          }),
          '</g>',
        ].join('')
        : '',
    ].join('');
  }).join('');
  const nodes = scene.nodes.map((node, index) => {
    const position = positions.get(node.id);
    const accent = COLORS[index % COLORS.length];
    const size = node.label.length > 24 ? 13 : 16;
    return [
      `<g ${attributes({
        id: `${prefix}-node-${safeId(node.id)}`,
        'data-node': node.id,
      })}>`,
      `<rect ${attributes({
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        rx: 16,
        fill: '#ffffff',
        stroke: accent,
        'stroke-width': 3,
      })}/>`,
      text(position.x + position.width / 2, position.y + 44, node.label, {
        size,
      }),
      '</g>',
    ].join('');
  }).join('');
  return `${edges}${nodes}`;
}

function renderTable(scene, prefix) {
  const x = 54;
  const y = 154;
  const width = 1092;
  const columnWidth = width / scene.columns.length;
  const rowHeight = Math.min(68, 390 / (scene.rows.length + 1));
  const chunks = [];
  for (const [columnIndex, column] of scene.columns.entries()) {
    const cellX = x + columnIndex * columnWidth;
    chunks.push(
      `<rect ${attributes({
        id: `${prefix}-header-${safeId(column.id)}`,
        x: cellX,
        y,
        width: columnWidth,
        height: rowHeight,
        fill: '#dbeafe',
        stroke: '#94a3b8',
        'stroke-width': 1,
      })}/>`,
      text(cellX + columnWidth / 2, y + rowHeight / 2 + 6, column.label, {
        size: scene.columns.length > 5 ? 12 : 14,
        weight: 700,
      }),
    );
  }
  for (const [rowIndex, row] of scene.rows.entries()) {
    for (const [columnIndex, column] of scene.columns.entries()) {
      const cellX = x + columnIndex * columnWidth;
      const cellY = y + (rowIndex + 1) * rowHeight;
      const value = row.cells[column.id];
      chunks.push(
        `<rect ${attributes({
          id: `${prefix}-cell-${safeId(row.id)}-${safeId(column.id)}`,
          'data-row': row.id,
          'data-column': column.id,
          'data-value': value,
          x: cellX,
          y: cellY,
          width: columnWidth,
          height: rowHeight,
          fill: rowIndex % 2 === 0 ? '#ffffff' : '#f1f5f9',
          stroke: '#cbd5e1',
          'stroke-width': 1,
        })}/>`,
        text(cellX + columnWidth / 2, cellY + rowHeight / 2 + 5, value, {
          size: scene.columns.length > 5 || String(value).length > 20 ? 11 : 13,
          weight: columnIndex === 0 ? 700 : 600,
        }),
      );
    }
  }
  if (scene.footer) {
    chunks.push(text(600, 590, scene.footer, {
      size: 15,
      fill: '#475569',
    }));
  }
  return chunks.join('');
}

function estimatedTextWidth(value, size) {
  return [...String(value)].length * size * 0.58;
}

function wrapChartLabel(value, maximumCharacters = 20) {
  const tokens = String(value).split(' · ');
  const lines = [];
  let line = '';
  for (const token of tokens) {
    const candidate = line ? `${line} · ${token}` : token;
    if (line && [...candidate].length > maximumCharacters) {
      lines.push(`${line} · `);
      line = token;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function chartLabelGroup(prefix, key, centerX, top, lines, {
  size = 11,
  color = '#475569',
  fill = '#ffffff',
} = {}) {
  const lineHeight = size + 4;
  const width = Math.max(...lines.map((line) => estimatedTextWidth(line, size))) + 16;
  const height = lines.length * lineHeight + 8;
  const x = Math.min(WIDTH - width - 12, Math.max(12, centerX - width / 2));
  const adjustedCenterX = x + width / 2;
  return {
    width,
    height,
    centerX: adjustedCenterX,
    markup: [
      `<g ${attributes({
        id: `${prefix}-chart-label-${safeId(key)}`,
        'data-chart-label': key,
      })}>`,
      `<rect ${attributes({
        x,
        y: top,
        width,
        height,
        rx: 6,
        fill,
        stroke: color,
        'stroke-width': 1,
      })}/>`,
      `<text ${attributes({
        x: adjustedCenterX,
        y: top + size + 3,
        'font-family': 'Inter, Arial, sans-serif',
        'font-size': size,
        'font-weight': 600,
        fill: color,
        'text-anchor': 'middle',
      })}>`,
      ...lines.map((line, index) => (
        `<tspan ${attributes({
          x: adjustedCenterX,
          y: top + size + 3 + index * lineHeight,
          'font-family': 'Inter, Arial, sans-serif',
          'font-size': size,
          'font-weight': 600,
          fill: color,
          'text-anchor': 'middle',
        })}>${escapeXml(line)}</tspan>`
      )),
      '</text>',
      '</g>',
    ].join(''),
  };
}

function renderChart(scene, prefix) {
  const left = 130;
  const top = 190;
  const plotWidth = 980;
  const plotHeight = 270;
  const plotBottom = top + plotHeight;
  const min = Number(scene.yAxis.min);
  const max = Number(scene.yAxis.max);
  const range = max - min || 1;
  const maxPoints = Math.max(...scene.series.map(({ points }) => points.length));
  const step = plotWidth / maxPoints;
  const chunks = [
    `<line id="${prefix}-axis-y" x1="${left}" y1="${top}" x2="${left}" y2="${plotBottom}" stroke="#334155" stroke-width="2"/>`,
    `<line id="${prefix}-axis-x" x1="${left}" y1="${plotBottom}" x2="${left + plotWidth}" y2="${plotBottom}" stroke="#334155" stroke-width="2"/>`,
    text(50, top + plotHeight / 2, scene.yAxis.label, {
      size: 14,
      fill: '#475569',
      anchor: 'start',
    }),
  ];

  let legendLeft = left;
  for (const [seriesIndex, series] of scene.series.entries()) {
    const color = COLORS[seriesIndex % COLORS.length];
    const legendLines = wrapChartLabel(series.label);
    const legend = chartLabelGroup(
      prefix,
      `series:${series.id}`,
      legendLeft + (estimatedTextWidth(legendLines[0], 11) + 16) / 2,
      132,
      legendLines,
      { size: 11, color, fill: '#f8fafc' },
    );
    chunks.push(legend.markup);
    legendLeft += legend.width + 12;
    const pointCoordinates = [];
    for (const [pointIndex, point] of series.points.entries()) {
      const value = Number(point.value);
      const x = left + step * (pointIndex + 0.5)
        + (seriesIndex - (scene.series.length - 1) / 2) * Math.min(22, step / 6);
      const y = top + plotHeight - ((value - min) / range) * plotHeight;
      pointCoordinates.push([x, y]);
      if (scene.mode === 'bars') {
        const barWidth = Math.min(74, step / Math.max(scene.series.length, 1) * 0.58);
        const barY = Math.min(top + plotHeight - 3, y);
        chunks.push(`<rect ${attributes({
          id: `${prefix}-point-${safeId(series.id)}-${safeId(point.id)}`,
          'data-row': series.id,
          'data-index': point.id,
          'data-value': point.value,
          x: x - barWidth / 2,
          y: barY,
          width: barWidth,
          height: Math.max(3, top + plotHeight - barY),
          rx: 5,
          fill: color,
        })}/>`);
      } else {
        chunks.push(`<circle ${attributes({
          id: `${prefix}-point-${safeId(series.id)}-${safeId(point.id)}`,
          'data-row': series.id,
          'data-index': point.id,
          'data-value': point.value,
          cx: x,
          cy: y,
          r: 7,
          fill: color,
          stroke: '#ffffff',
          'stroke-width': 2,
        })}/>`);
      }
      const eventTop = plotBottom + 18 + seriesIndex * 32;
      const event = chartLabelGroup(
        prefix,
        `event:${series.id}:${point.id}`,
        x,
        eventTop,
        wrapChartLabel(point.label),
        {
          size: maxPoints > 6 ? 10 : 11,
          color,
          fill: '#f8fafc',
        },
      );
      chunks.push(
        `<line ${attributes({
          'data-chart-leader': `${series.id}:${point.id}`,
          x1: x,
          y1: y,
          x2: event.centerX,
          y2: eventTop,
          stroke: color,
          'stroke-width': 1,
          'stroke-dasharray': '4 4',
        })}/>`,
        event.markup,
        text(x, Math.max(top + 14, y - 12), point.value, {
          size: 12,
          fill: color,
        }),
      );
      if (point.note) {
        const note = chartLabelGroup(
          prefix,
          `note:${series.id}:${point.id}`,
          x,
          plotBottom + 18 + scene.series.length * 32,
          wrapChartLabel(point.note),
          { size: 10, color: '#475569', fill: '#ffffff' },
        );
        chunks.push(note.markup);
      }
    }
    if (scene.mode !== 'bars' && pointCoordinates.length > 1) {
      chunks.unshift(`<polyline ${attributes({
        id: `${prefix}-series-${safeId(series.id)}`,
        points: pointCoordinates.map(([x, y]) => `${x},${y}`).join(' '),
        fill: 'none',
        stroke: color,
        'stroke-width': 3,
      })}/>`);
    }
  }
  if (scene.totalLabel || scene.footer) {
    chunks.push(text(600, 640, scene.totalLabel ?? scene.footer, {
      size: 14,
      fill: '#475569',
    }));
  }
  return chunks.join('');
}

function decisionPosition(item, maxLevel) {
  const y = 148 + item.level * (390 / Math.max(maxLevel, 1));
  if (item.column === 0) return { x: 300, y, width: 420, height: 38 };
  if (item.column === 1) return { x: 770, y, width: 200, height: 38 };
  return {
    x: 1000 + (item.column - 2) * 150,
    y,
    width: 150,
    height: 38,
  };
}

function renderDecision(scene, prefix, markerId) {
  const items = [...scene.decisions, ...scene.outcomes];
  const maxLevel = Math.max(...items.map(({ level }) => level));
  const positions = new Map(items.map((item) => [item.id, decisionPosition(item, maxLevel)]));
  const edges = scene.edges.map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) throw new RangeError(`Unknown decision edge endpoint: ${edge.id}`);
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    const middleY = (startY + endY) / 2;
    return [
      `<polyline ${attributes({
        id: `${prefix}-edge-${safeId(edge.id)}`,
        'data-edge': edge.id,
        'data-from': edge.from,
        'data-to': edge.to,
        points: `${startX},${startY} ${startX},${middleY} ${endX},${middleY} ${endX},${endY}`,
        fill: 'none',
        stroke: '#64748b',
        'stroke-width': 2,
        'marker-end': `url(#${markerId})`,
      })}/>`,
      text((startX + endX) / 2, middleY - 5, edge.condition, {
        size: 10,
        fill: '#475569',
      }),
    ].join('');
  }).join('');

  const decisions = scene.decisions.map((item) => {
    const position = positions.get(item.id);
    const points = [
      `${position.x + position.width / 2},${position.y}`,
      `${position.x + position.width},${position.y + position.height / 2}`,
      `${position.x + position.width / 2},${position.y + position.height}`,
      `${position.x},${position.y + position.height / 2}`,
    ].join(' ');
    return [
      `<g ${attributes({
        id: `${prefix}-decision-${safeId(item.id)}`,
        'data-node': item.id,
      })}>`,
      `<polygon points="${points}" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>`,
      text(position.x + position.width / 2, position.y + position.height / 2 + 5, item.label, {
        size: item.label.length > 27 ? 11 : 13,
      }),
      '</g>',
    ].join('');
  }).join('');

  const outcomes = scene.outcomes.map((item, index) => {
    const position = positions.get(item.id);
    return [
      `<g ${attributes({
        id: `${prefix}-outcome-${safeId(item.id)}`,
        'data-node': item.id,
      })}>`,
      `<rect ${attributes({
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        rx: 10,
        fill: '#ffffff',
        stroke: COLORS[(index + 1) % COLORS.length],
        'stroke-width': 2,
      })}/>`,
      text(position.x + position.width / 2, position.y + position.height / 2 + 5, item.label, {
        size: item.label.length > 24 ? 11 : 13,
      }),
      '</g>',
    ].join('');
  }).join('');

  const actionSummary = scene.actionSummary
    ? [
      `<g id="${prefix}-action-summary" data-node="action-summary">`,
      '<rect x="360" y="584" width="480" height="48" rx="12" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>',
      text(600, 614, scene.actionSummary, {
        size: 15,
        fill: '#ffffff',
      }),
      '</g>',
    ].join('')
    : '';
  return `${edges}${decisions}${outcomes}${actionSummary}`;
}

function validateScene(scene) {
  if (!scene || !['flow', 'table', 'chart', 'decision'].includes(scene.type)) {
    throw new TypeError('Context visual scene must use flow, table, chart, or decision');
  }
}

export function renderContextRagMemorySvg(visual, scene) {
  validateScene(scene);
  const prefix = safeId(visual.id);
  const markerId = `${prefix}-arrow`;
  const header = titleBlock(visual, markerId);
  const body = scene.type === 'flow'
    ? renderFlow(scene, prefix, markerId)
    : scene.type === 'table'
      ? renderTable(scene, prefix)
      : scene.type === 'chart'
        ? renderChart(scene, prefix)
        : renderDecision(scene, prefix, markerId);
  return [
    `<svg ${attributes({
      xmlns: 'http://www.w3.org/2000/svg',
      width: WIDTH,
      height: HEIGHT,
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      role: 'img',
      'aria-labelledby': `${header.titleId} ${header.descId}`,
    })}>`,
    header.markup,
    body,
    '</svg>',
  ].join('');
}
