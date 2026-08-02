import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { backendEngineering } from '../src/data/backend-engineering.js';
import { backendEngineeringScenes } from '../src/data/visuals/backend-engineering-scenes.js';
import { backendEngineeringVisuals } from '../src/data/visuals/backend-engineering-visuals.js';

const auditUrl = new URL(
  '../docs/content-audits/2026-07-30-ai-backend-primary-reference-reconstruction.md',
  import.meta.url,
);

test('backend reconstruction audit reports exact production parity and rubric gates', async () => {
  const audit = await readFile(auditUrl, 'utf8');
  const sections = backendEngineering.lessons.flatMap(({ knowledgeNote }) => knowledgeNote.sections);
  const paragraphs = sections.flatMap(({ paragraphs: values }) => values);
  const edges = backendEngineeringScenes.flatMap(({ edges: values }) => values);
  const nodes = backendEngineeringScenes.flatMap(({ nodes: values }) => values);
  const labels = edges.filter(({ label }) => label).length;
  const values = backendEngineeringScenes.flatMap(({ values: entries }) => entries);
  const primary = backendEngineering.resources.filter(({ id }) => id.startsWith('res-backend-primary-'));

  for (const [label, value] of Object.entries({
    lessons: 8,
    sections: sections.length,
    paragraphs: paragraphs.length,
    resources: backendEngineering.resources.length,
    primaryBindings: primary.length,
    assessments: 40,
    visuals: backendEngineeringVisuals.length,
    scenes: backendEngineeringScenes.length,
    nodes: nodes.length,
    edges: edges.length,
    edgeLabels: labels,
    values: values.length,
    svgAssets: 16,
  })) {
    assert.match(audit, new RegExp(`\\| ${label} \\| ${value} \\|`), label);
  }

  assert.match(audit, /内容评分\s*\|\s*94\s*\/\s*100/);
  assert.match(audit, /视觉评分\s*\|\s*55\s*\/\s*60/);
  for (const score of ['10 / 10', '9 / 10', '8 / 10']) assert.ok(audit.includes(score));
  for (const lesson of backendEngineering.lessons) {
    assert.match(audit, new RegExp(`\\| ${lesson.id} \\|`), lesson.id);
  }
  for (const visual of backendEngineeringVisuals) {
    assert.ok(audit.includes(visual.id), visual.id);
  }
  assert.match(audit, /implementation observation.*not universal standard/is);
  assert.match(audit, /official|RFC|WHATWG|Kubernetes|PostgreSQL|Redis/i);
  assert.match(audit, /许可.*原创|原创.*许可/s);
  assert.match(audit, /实际渲染.*已执行|render.*executed/is);
});
