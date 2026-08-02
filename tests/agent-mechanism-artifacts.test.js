import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildAgentMechanismVisualArtifacts,
  checkAgentMechanismVisualArtifacts,
  writeAgentMechanismVisualArtifacts,
} from '../scripts/generate-agent-mechanism-visuals.mjs';

test('Agent visual generator emits 16 deterministic SVGs and --check is nonwriting', async () => {
  const expected = buildAgentMechanismVisualArtifacts();
  assert.equal(expected.size, 16);
  const directory = await mkdtemp(join(tmpdir(), 'agent-visuals-'));
  try {
    await writeAgentMechanismVisualArtifacts({ outputDirectory: directory });
    await checkAgentMechanismVisualArtifacts({ outputDirectory: directory });
    const filename = expected.keys().next().value;
    const before = await readFile(join(directory, filename), 'utf8');
    await checkAgentMechanismVisualArtifacts({ outputDirectory: directory });
    assert.equal(await readFile(join(directory, filename), 'utf8'), before);
    await rm(join(directory, filename));
    await assert.rejects(
      checkAgentMechanismVisualArtifacts({ outputDirectory: directory }),
      new RegExp(`missing: ${filename}`),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
