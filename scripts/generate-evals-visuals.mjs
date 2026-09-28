import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { evalScenes } from '../src/data/visuals/evals-scenes.js';
import { evalVisuals } from '../src/data/visuals/evals-visuals.js';
import { renderEvalSvg } from '../src/data/visuals/evals-svg.js';

const check = process.argv.includes('--check');
for (const visual of evalVisuals) {
  const path = fileURLToPath(new URL(`../${visual.assetPath}`, import.meta.url));
  const svg = renderEvalSvg(evalScenes.find(({ id }) => id === visual.id));
  if (check) {
    if (await readFile(path, 'utf8') !== svg) throw new Error(`Outdated evaluation visual: ${visual.id}`);
  } else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, svg);
  }
}
console.log(`${check ? 'Verified' : 'Generated'} ${evalVisuals.length} evaluation visuals.`);
