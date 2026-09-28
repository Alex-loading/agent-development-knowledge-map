import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evalVisuals } from '../src/data/visuals/evals-visuals.js';
import { evalScenes } from '../src/data/visuals/evals-scenes.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import { renderEvalSvg } from '../src/data/visuals/evals-svg.js';
import { assertSafeStaticSvg } from './helpers/static-svg.js';

test('evaluation visuals are complete, safe, deterministic local assets', async () => {
  assert.equal(evalVisuals.length, 16);
  for (const visual of evalVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.ok(Object.isFrozen(visual) && Object.isFrozen(visual.sourceIds));
    const actual = await readFile(new URL(`../${visual.assetPath}`, import.meta.url), 'utf8');
    const scene = evalScenes.find(({ id }) => id === visual.id);
    assert.equal(actual, renderEvalSvg(scene), visual.id);
    assertSafeStaticSvg(actual, visual, visual.assetPath);
    assert.ok(visual.longDescription.includes(scene.conclusion));
  }
});

test('visible regression bars use their measured rates as actual geometry', async () => {
  const svg = await readFile(new URL('../assets/visuals/evals-observability-security/eval-03-detail.svg', import.meta.url), 'utf8');
  const bars = JSON.parse(execFileSync('python3', [
    fileURLToPath(new URL('./helpers/inspect-svg.py', import.meta.url)),
    fileURLToPath(new URL('../assets/visuals/evals-observability-security/eval-03-detail.svg', import.meta.url)),
  ], { encoding: 'utf8' }));
  assert.equal(bars.length, 6);
  const rows = evalScenes.find(({ id }) => id === 'visual-eval-03-detail').rows;
  for (const bar of bars) {
    const expected = rows[Number(bar['data-row'])][bar['data-kind'] === 'baseline' ? 1 : 2];
    assert.equal(Number(bar['data-value']), expected);
    assert.equal(Number(bar.width), 580 * expected);
    assert.equal(Number(bar.height), 27);
    assert.equal(Number(bar.x), 326);
  }
  assert.match(svg, /长文档/);
  assert.match(svg, /50.0%/);
});
