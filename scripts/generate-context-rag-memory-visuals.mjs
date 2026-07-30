import { mkdir, writeFile } from 'node:fs/promises';

import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';
import { contextRagMemoryVisualFixtures } from '../tests/fixtures/context-rag-memory-visual-fixtures.js';

const outputDirectory = new URL('../assets/visuals/context-rag-memory/', import.meta.url);
const fixturesByVisualId = new Map(
  contextRagMemoryVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
);

function text(x, y, value, {
  size = 22,
  weight = 600,
  fill = '#14213d',
  anchor = 'middle',
} = {}) {
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${value}</text>`;
}

function card(x, y, width, height, label, index, accent = '#2563eb') {
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#ffffff" stroke="${accent}" stroke-width="3"/>`,
    `<circle cx="${x + 28}" cy="${y + 28}" r="15" fill="${accent}"/>`,
    text(x + 28, y + 35, String(index + 1), {
      size: 16,
      fill: '#ffffff',
    }),
    text(x + (width / 2), y + (height / 2) + 9, label, {
      size: label.length > 23 ? 17 : 20,
    }),
  ].join('');
}

function processBody(labels) {
  const chunks = [];
  const columns = labels.length > 6 ? 4 : 3;
  const width = columns === 4 ? 250 : 320;
  const gap = columns === 4 ? 24 : 36;
  const startX = (1200 - ((columns * width) + ((columns - 1) * gap))) / 2;
  labels.forEach((label, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const x = startX + (column * (width + gap));
    const y = 185 + (row * 145);
    chunks.push(card(x, y, width, 96, label, index));
    if (column > 0) {
      chunks.push(`<line x1="${x - gap + 7}" y1="${y + 48}" x2="${x - 8}" y2="${y + 48}" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>`);
    }
  });
  return chunks.join('');
}

function comparisonBody(labels) {
  const chunks = [];
  const columns = Math.min(4, labels.length);
  const width = 250;
  const gap = 24;
  const startX = (1200 - ((columns * width) + ((columns - 1) * gap))) / 2;
  labels.forEach((label, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + (column * (width + gap));
    const y = 180 + (row * 150);
    const accent = ['#2563eb', '#0f766e', '#7c3aed', '#c2410c'][column];
    chunks.push(card(x, y, width, 110, label, index, accent));
  });
  return chunks.join('');
}

function decisionBody(labels) {
  const [question, ...branches] = labels;
  const chunks = [
    '<polygon points="600,170 790,265 600,360 410,265" fill="#eff6ff" stroke="#2563eb" stroke-width="4"/>',
    text(600, 257, question, { size: question.length > 22 ? 17 : 20 }),
  ];
  const branchWidth = Math.min(230, Math.floor(1040 / Math.max(branches.length, 1)) - 16);
  const totalWidth = branches.length * branchWidth + Math.max(branches.length - 1, 0) * 16;
  const startX = (1200 - totalWidth) / 2;
  branches.forEach((label, index) => {
    const x = startX + index * (branchWidth + 16);
    chunks.push(`<line x1="600" y1="360" x2="${x + branchWidth / 2}" y2="430" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>`);
    chunks.push(card(x, 445, branchWidth, 96, label, index, index % 2 === 0 ? '#0f766e' : '#c2410c'));
  });
  return chunks.join('');
}

function mainSvg(visual, fixture) {
  const titleId = `${visual.id}-title`;
  const descId = `${visual.id}-desc`;
  const body = visual.role === 'decision'
    ? decisionBody(fixture.labels)
    : visual.role === 'comparison'
      ? comparisonBody(fixture.labels)
      : processBody(fixture.labels);
  const values = fixture.values.length > 0
    ? text(600, 625, `FIXTURE VALUES · ${fixture.values.join(' · ')}`, {
      size: 17,
      weight: 600,
      fill: '#475569',
    })
    : text(600, 625, 'ORIGINAL SYNTHESIS · SOURCE-BOUND TEACHING MODEL', {
      size: 16,
      weight: 600,
      fill: '#475569',
    });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${titleId} ${descId}"><title id="${titleId}">${visual.title}</title><desc id="${descId}">${visual.caption}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#64748b"/></marker></defs><rect x="0" y="0" width="1200" height="675" fill="#f8fafc"/><rect x="42" y="32" width="1116" height="92" rx="24" fill="#0f172a"/><text x="76" y="78" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="700" fill="#ffffff">${visual.title}</text><text x="76" y="105" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="#bfdbfe">${visual.role.toUpperCase()} · CONTEXT / RAG / MEMORY</text>${body}${values}</svg>`;
}

function stepSvg(visual, label, labels, index) {
  const titleId = `${visual.id}-step-${index + 1}-title`;
  const descId = `${visual.id}-step-${index + 1}-desc`;
  const cards = labels.map((item, itemIndex) => (
    card(120 + (itemIndex * 330), 285, 300, 120, item, itemIndex, ['#2563eb', '#7c3aed', '#0f766e'][itemIndex])
  )).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${titleId} ${descId}"><title id="${titleId}">${label}</title><desc id="${descId}">${visual.caption}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#64748b"/></marker></defs><rect x="0" y="0" width="1200" height="675" fill="#f8fafc"/><rect x="42" y="32" width="1116" height="100" rx="24" fill="#0f172a"/>${text(76, 78, label, { size: 30, fill: '#ffffff', anchor: 'start' })}${text(76, 108, 'LOSS IS EXPLICIT · RECOVERY IS VERIFIED', { size: 16, fill: '#bfdbfe', anchor: 'start' })}${cards}<line x1="420" y1="345" x2="440" y2="345" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/><line x1="750" y1="345" x2="770" y2="345" stroke="#64748b" stroke-width="3" marker-end="url(#arrow)"/>${text(600, 590, 'SUMMARY IS A LOSSY DERIVED VIEW', { size: 20, fill: '#475569' })}</svg>`;
}

await mkdir(outputDirectory, { recursive: true });

for (const visual of contextRagMemoryVisuals) {
  const fixture = fixturesByVisualId.get(visual.id);
  if (!fixture) throw new Error(`Missing fixture for ${visual.id}`);
  await writeFile(
    new URL(visual.assetPath.split('/').at(-1), outputDirectory),
    mainSvg(visual, fixture),
    'utf8',
  );
  for (const [index, step] of (visual.steps ?? []).entries()) {
    const labels = fixture.stepLabels[step.assetPath];
    await writeFile(
      new URL(step.assetPath.split('/').at(-1), outputDirectory),
      stepSvg(visual, labels[0], labels, index),
      'utf8',
    );
  }
}
