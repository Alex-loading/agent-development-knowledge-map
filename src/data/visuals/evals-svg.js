const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const color = { paper: '#f7f1e5', ink: '#183d36', soft: '#e4ebe3', ochre: '#a06a21', red: '#a44835', line: '#a5afa2' };

function wrap(text, width, size) {
  const lines = [];
  let line = '';
  let length = 0;
  for (const character of String(text)) {
    const unit = /[\u0000-\u007f]/.test(character) ? .6 : 1;
    if ((length + unit) * size > width && line) { lines.push(line); line = ''; length = 0; }
    line += character;
    length += unit;
  }
  if (line) lines.push(line);
  return lines;
}

function text(x, y, value, { size = 22, width = 1020, fill = color.ink, weight = 400, lineHeight = size * 1.45 } = {}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${wrap(value, width, size).map((line, index) => `<tspan x="${x}" y="${y + index * lineHeight}">${escape(line)}</tspan>`).join('')}</text>`;
}

function flow(scene) {
  let svg = '';
  scene.panels.forEach(([title, ...lines], index) => {
    const x = 44 + index * 264;
    const titleLines = wrap(title, 200, 25).length;
    svg += `<rect x="${x}" y="195" width="240" height="300" rx="12" fill="${index === 2 && scene.form === 'boundary' ? '#f1dfd3' : color.soft}" stroke="${color.line}"/>`;
    svg += text(x + 18, 228, `${index + 1}`.padStart(2, '0'), { size: 19, fill: color.ochre, weight: 700 });
    svg += text(x + 18, 272, title, { size: 25, width: 202, weight: 700 });
    let lineY = 272 + titleLines * 36 + 27;
    lines.forEach((line) => {
      svg += text(x + 18, lineY, line, { size: 21, width: 202 });
      lineY += wrap(line, 202, 21).length * 30 + 16;
    });
    if (index < scene.panels.length - 1) {
      svg += `<path d="M ${x + 240} 351 L ${x + 257} 351" fill="none" stroke="${color.ink}" stroke-width="3" marker-end="url(#arrow)"/>`;
    }
  });
  if (scene.form === 'boundary') {
    svg += `<line x1="560" y1="145" x2="560" y2="540" stroke="${color.red}" stroke-width="2" stroke-dasharray="8 6"/>`;
    svg += text(577, 169, '独立授权检查', { size: 19, fill: color.red, weight: 700 });
  }
  return svg;
}

function table(scene) {
  const widths = [286, 350, 396];
  const xs = [44, 330, 680];
  let svg = `<rect x="44" y="157" width="1032" height="57" rx="8" fill="${color.ink}"/>`;
  scene.columns.forEach((column, index) => { svg += text(xs[index] + 16, 194, column, { size: 22, width: widths[index] - 30, fill: color.paper, weight: 700 }); });
  scene.rows.forEach((row, rowIndex) => {
    const y = 222 + rowIndex * 81;
    svg += `<rect x="44" y="${y}" width="1032" height="75" rx="6" fill="${rowIndex % 2 ? '#ece4d6' : color.soft}"/>`;
    row.forEach((cell, index) => { svg += text(xs[index] + 16, y + 29, cell, { size: 21, width: widths[index] - 32, weight: index === 0 ? 700 : 400 }); });
  });
  return svg;
}

function bars(scene) {
  let svg = text(326, 148, '基线', { size: 20, fill: color.ink, weight: 700 });
  svg += text(432, 148, '候选', { size: 20, fill: color.ochre, weight: 700 });
  svg += text(786, 148, '条长表示成功比例', { size: 20 });
  scene.rows.forEach(([label, baseline, candidate], index) => {
    const y = 192 + index * 115;
    svg += text(44, y + 37, label, { size: 23, width: 255, weight: 700 });
    [[baseline, color.ink, 'baseline'], [candidate, color.ochre, 'candidate']].forEach(([value, fill, series], offset) => {
      const top = y + offset * 39;
      svg += `<rect x="326" y="${top}" width="580" height="27" rx="3" fill="#e2e1d6"/>`;
      svg += `<rect x="326" y="${top}" width="${580 * value}" height="27" rx="3" fill="${fill}" data-row="${index}" data-kind="${series}" data-value="${value}"/>`;
      svg += text(926, top + 22, `${(value * 100).toFixed(1)}%`, { size: 22, fill, weight: 700 });
    });
  });
  return svg;
}

export function renderEvalSvg(scene) {
  const content = scene.form === 'table' ? table(scene) : scene.form === 'bars' ? bars(scene) : flow(scene);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="660" viewBox="0 0 1120 660" role="img" aria-labelledby="title desc">
<title id="title">${escape(scene.title)}</title><desc id="desc">${escape(scene.question)} ${escape(scene.conclusion)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color.ink}"/></marker></defs>
<rect width="1120" height="660" rx="12" fill="${color.paper}"/>
<g font-family="PingFang SC, Microsoft YaHei, sans-serif">
${text(44, 47, 'AGENT LEARNER / EVALUATION LAB', { size: 16, fill: color.ochre, weight: 700 })}
${text(44, 93, scene.title, { size: 32, weight: 700 })}
${content}
<line x1="44" y1="574" x2="1076" y2="574" stroke="${color.line}"/>
${text(44, 607, scene.conclusion, { size: 21, width: 1025 })}
</g></svg>\n`;
}
