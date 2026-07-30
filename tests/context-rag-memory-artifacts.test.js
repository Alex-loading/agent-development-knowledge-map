import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildContextVisualArtifacts,
  checkContextVisualArtifacts,
  writeContextVisualArtifacts,
} from '../scripts/generate-context-rag-memory-visuals.mjs';
import {
  buildContextVisualInventory,
  checkContextVisualInventory,
  writeContextVisualInventory,
} from '../scripts/generate-context-rag-memory-visual-inventory.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const visualScript = fileURLToPath(
  new URL('../scripts/generate-context-rag-memory-visuals.mjs', import.meta.url),
);
const inventoryScript = fileURLToPath(
  new URL('../scripts/generate-context-rag-memory-visual-inventory.mjs', import.meta.url),
);
const inventoryPath = fileURLToPath(
  new URL(
    '../docs/research/2026-07-30-context-rag-memory-visual-inventory.md',
    import.meta.url,
  ),
);

function runScript(script, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

test('strict visual and inventory --check succeed without changing artifact mtimes', async () => {
  const visualPath = fileURLToPath(
    new URL(
      '../assets/visuals/context-rag-memory/context-04-ingestion-pipeline.svg',
      import.meta.url,
    ),
  );
  const before = {
    visual: (await stat(visualPath)).mtimeMs,
    inventory: (await stat(inventoryPath)).mtimeMs,
  };
  const visualCheck = runScript(visualScript, ['--check']);
  const inventoryCheck = runScript(inventoryScript, ['--check']);
  assert.equal(visualCheck.status, 0, visualCheck.stderr || visualCheck.stdout);
  assert.equal(inventoryCheck.status, 0, inventoryCheck.stderr || inventoryCheck.stdout);
  assert.match(visualCheck.stdout, /27 Context visual artifacts are current/);
  assert.match(inventoryCheck.stdout, /Context visual inventory is current/);
  assert.deepEqual({
    visual: (await stat(visualPath)).mtimeMs,
    inventory: (await stat(inventoryPath)).mtimeMs,
  }, before);
});

test('visual and inventory generators reject every unknown argument', () => {
  for (const script of [visualScript, inventoryScript]) {
    const result = runScript(script, ['--write-anyway']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unknown argument: --write-anyway/);
  }
});

test('visual artifact checker reports missing, changed, and unexpected SVG drift', async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'context-visuals-'));
  const expected = buildContextVisualArtifacts();
  assert.equal(expected.size, 27);
  await writeContextVisualArtifacts({ outputDirectory });
  await checkContextVisualArtifacts({ outputDirectory });

  const changedName = 'context-05-ann-tradeoff.svg';
  await writeFile(join(outputDirectory, changedName), '<svg/>', 'utf8');
  await writeFile(join(outputDirectory, 'unexpected.svg'), '<svg/>', 'utf8');
  await assert.rejects(
    checkContextVisualArtifacts({ outputDirectory }),
    (error) => {
      assert.match(error.message, /changed: context-05-ann-tradeoff\.svg/);
      assert.match(error.message, /unexpected: unexpected\.svg/);
      return true;
    },
  );
});

test('inventory checker reports byte drift and inventory is derived from production scenes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'context-inventory-'));
  const outputPath = join(directory, 'inventory.md');
  const expected = buildContextVisualInventory();
  assert.match(expected, /CHUNK→METADATA/);
  assert.match(expected, /FAST、BALANCED、DEEP/);
  await writeContextVisualInventory({ outputPath });
  await checkContextVisualInventory({ outputPath });
  await writeFile(outputPath, `${await readFile(outputPath, 'utf8')}\nDRIFT`, 'utf8');
  await assert.rejects(
    checkContextVisualInventory({ outputPath }),
    /changed: inventory\.md/,
  );
});

test('package scripts expose generation and CI-safe Context visual artifact checks', async () => {
  const packageJson = JSON.parse(
    await readFile(join(repositoryRoot, 'package.json'), 'utf8'),
  );
  assert.equal(
    packageJson.scripts['generate:context-visuals'],
    'node scripts/generate-context-rag-memory-visuals.mjs && node scripts/generate-context-rag-memory-visual-inventory.mjs',
  );
  assert.equal(
    packageJson.scripts['check:context-visuals'],
    'node scripts/generate-context-rag-memory-visuals.mjs --check && node scripts/generate-context-rag-memory-visual-inventory.mjs --check',
  );
});
