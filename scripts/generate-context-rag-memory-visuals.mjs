import { spawnSync } from 'node:child_process';
import {
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  contextRagMemoryScenesById,
} from '../src/data/visuals/context-rag-memory-scenes.js';
import {
  renderContextRagMemorySvg,
} from '../src/data/visuals/context-rag-memory-svg.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';

const defaultOutputDirectory = fileURLToPath(
  new URL('../assets/visuals/context-rag-memory/', import.meta.url),
);

function validateSvg(svg, filename) {
  const validation = spawnSync('xmllint', ['--noout', '-'], {
    input: svg,
    encoding: 'utf8',
  });
  if (validation.error) {
    throw new Error(`${filename}: xmllint unavailable: ${validation.error.message}`);
  }
  if (validation.status !== 0) {
    throw new Error(`${filename}: invalid generated XML\n${validation.stderr.trim()}`);
  }
}

function stepVisual(parent, step) {
  return {
    ...parent,
    id: `${parent.id}-${step.id}`,
    title: step.title,
    caption: step.description,
    role: 'process',
  };
}

export function buildContextVisualArtifacts() {
  const artifacts = new Map();
  for (const visual of contextRagMemoryVisuals) {
    const record = contextRagMemoryScenesById.get(visual.id);
    if (!record) throw new Error(`Missing production scene for ${visual.id}`);
    const filename = basename(visual.assetPath);
    const svg = renderContextRagMemorySvg(visual, record.scene);
    validateSvg(svg, filename);
    artifacts.set(filename, svg);

    for (const step of visual.steps ?? []) {
      const stepScene = record.steps?.[step.assetPath];
      if (!stepScene) throw new Error(`Missing production step scene for ${step.assetPath}`);
      const stepFilename = basename(step.assetPath);
      const stepSvg = renderContextRagMemorySvg(stepVisual(visual, step), stepScene);
      validateSvg(stepSvg, stepFilename);
      artifacts.set(stepFilename, stepSvg);
    }
  }
  if (artifacts.size !== 27) {
    throw new Error(`Expected 27 Context visual artifacts, got ${artifacts.size}`);
  }
  return artifacts;
}

async function atomicWrite(path, bytes, sequence) {
  const temporaryPath = `${path}.tmp-${process.pid}-${sequence}`;
  await writeFile(temporaryPath, bytes, 'utf8');
  await rename(temporaryPath, path);
}

export async function writeContextVisualArtifacts({
  outputDirectory = defaultOutputDirectory,
} = {}) {
  const directory = fileURLToPathSafe(outputDirectory);
  const artifacts = buildContextVisualArtifacts();
  await mkdir(directory, { recursive: true });
  let sequence = 0;
  for (const [filename, bytes] of artifacts) {
    await atomicWrite(join(directory, filename), bytes, sequence);
    sequence += 1;
  }
  return artifacts;
}

function fileURLToPathSafe(pathOrUrl) {
  return pathOrUrl instanceof URL ? fileURLToPath(pathOrUrl) : String(pathOrUrl);
}

export async function checkContextVisualArtifacts({
  outputDirectory = defaultOutputDirectory,
} = {}) {
  const directory = fileURLToPathSafe(outputDirectory);
  const expected = buildContextVisualArtifacts();
  const actualNames = (await readdir(directory))
    .filter((filename) => filename.endsWith('.svg'))
    .sort();
  const expectedNames = [...expected.keys()].sort();
  const drift = [];

  for (const filename of expectedNames) {
    let actual;
    try {
      actual = await readFile(join(directory, filename), 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        drift.push(`missing: ${filename}`);
        continue;
      }
      throw error;
    }
    if (actual !== expected.get(filename)) drift.push(`changed: ${filename}`);
  }
  for (const filename of actualNames) {
    if (!expected.has(filename)) drift.push(`unexpected: ${filename}`);
  }
  if (drift.length > 0) {
    throw new Error(`Context visual artifact drift:\n${drift.join('\n')}`);
  }
  return expected;
}

function parseArguments(argv) {
  if (argv.length === 0) return { check: false };
  if (argv.length === 1 && argv[0] === '--check') return { check: true };
  throw new TypeError(`Unknown argument: ${argv[0]}`);
}

async function main(argv) {
  const { check } = parseArguments(argv);
  if (check) {
    const artifacts = await checkContextVisualArtifacts();
    process.stdout.write(`${artifacts.size} Context visual artifacts are current.\n`);
  } else {
    const artifacts = await writeContextVisualArtifacts();
    process.stdout.write(`Generated ${artifacts.size} Context visual artifacts atomically.\n`);
  }
}

const isMain = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
