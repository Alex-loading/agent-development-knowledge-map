import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { multiAgentMcp } from '../src/data/multi-agent-mcp.js';
import { multiAgentVisuals } from '../src/data/visuals/multi-agent-visuals.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import { validateKnowledgeVisualOwnership } from './helpers/visual-registry.js';
import { assertSafeStaticSvg } from './helpers/static-svg.js';

test('seventh module has sixteen safe assets with unique evidence-owning placements', async () => {
  assert.equal(multiAgentVisuals.length, 16);
  const ownership = await validateKnowledgeVisualOwnership({
    courseRegistry: { [multiAgentMcp.id]: multiAgentMcp },
    knowledgeVisuals: multiAgentVisuals,
    assetExists: async (assetPath) => { await access(new URL(`../${assetPath}`, import.meta.url)); return true; },
  });
  assert.deepEqual(ownership.errors, []);
  assert.equal(ownership.placements.length, 16);
  for (const lesson of multiAgentMcp.lessons) {
    assert.equal(ownership.placements.filter(({ lessonId }) => lessonId === lesson.id).length, 2);
  }
  for (const visual of multiAgentVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.ok(Object.isFrozen(visual) && Object.isFrozen(visual.sourceIds));
    assert.equal(visual.provenance, 'original-synthesis');
    assert.equal(visual.permission, null);
    assert.ok(visual.longDescription.length >= 100);
    const svg = await readFile(new URL(`../${visual.assetPath}`, import.meta.url), 'utf8');
    assertSafeStaticSvg(svg, visual, visual.assetPath);
    const mermaid = await readFile(new URL(`../${visual.assetPath.replace(/\.svg$/, '.mmd')}`, import.meta.url), 'utf8');
    assert.ok(mermaid.trim().length >= 80, visual.id);
  }
});
