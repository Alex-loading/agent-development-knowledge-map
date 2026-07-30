import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { agentMechanism } from '../src/data/agent-mechanism.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';

test('publishes two original, local and accessible Agent visuals per lesson', async () => {
  assert.equal(agentMechanismVisuals.length, 16);
  assert.equal(new Set(agentMechanismVisuals.map(({ id }) => id)).size, 16);
  assert.ok(agentMechanismVisuals.every(({ provenance }) => provenance === 'original-synthesis'));
  assert.ok(knowledgeVisuals.every((visual, index, all) => all.findIndex(({ id }) => id === visual.id) === index));
  for (const lesson of agentMechanism.lessons) {
    const prefix = `visual-${lesson.id}-`;
    const visuals = agentMechanismVisuals.filter(({ id }) => id.startsWith(prefix));
    assert.equal(visuals.length, 2, lesson.id);
    assert.ok(visuals.some(({ role }) => role === 'overview'), lesson.id);
    assert.equal(lesson.knowledgeNote.overviewVisualId, visuals.find(({ role }) => role === 'overview').id);
    assert.ok(lesson.knowledgeNote.overviewVisualSectionId);
    const placements = lesson.knowledgeNote.sections.flatMap((section) => section.visuals ?? []);
    assert.equal(placements.length, 1, lesson.id);
    assert.equal(placements[0].visualId, visuals.find(({ role }) => role !== 'overview').id);
    for (const visual of visuals) {
      assert.deepEqual(validateVisualAsset(visual), [], visual.id);
      assert.ok(visual.assessedCoverage.length > 0, visual.id);
      assert.ok(visual.alt.length >= 24, visual.id);
      assert.ok(visual.longDescription.length >= 50, visual.id);
      await access(new URL(`../${visual.assetPath}`, import.meta.url));
    }
  }
});

test('Agent SVG files are strict local static artifacts', async () => {
  for (const visual of agentMechanismVisuals) {
    const svg = await readFile(new URL(`../${visual.assetPath}`, import.meta.url), 'utf8');
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /viewBox="0 0 1200 675"/);
    assert.doesNotMatch(
      svg.replace('http://www.w3.org/2000/svg', ''),
      /<script|foreignObject|onload=|javascript:|data:|https?:\/\//i,
    );
    assert.doesNotMatch(svg, /font-size="(?:[0-9]|1[0-3])"/);
    assert.match(svg, /data-node=/);
    assert.match(svg, /data-edge=/);
  }
});
