import { spawnSync } from 'node:child_process';
import {
  mkdir, readdir, readFile, rename, writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { getAgentMechanismScene } from '../src/data/visuals/agent-mechanism-scenes.js';
import { renderAgentMechanismSvg } from '../src/data/visuals/agent-mechanism-svg.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';

const defaultOutputDirectory = fileURLToPath(
  new URL('../assets/visuals/agent-mechanism/', import.meta.url),
);

function validateSvg(svg, filename) {
  const inspectableSvg = svg.replace('http://www.w3.org/2000/svg', '');
  if (/<script|foreignObject|onload=|javascript:|data:|https?:\/\//i.test(inspectableSvg)) {
    throw new Error(`${filename}: active, embedded, or remote content is forbidden`);
  }
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

export function buildAgentMechanismVisualArtifacts() {
  const artifacts = new Map();
  for (const visual of agentMechanismVisuals) {
    const scene = getAgentMechanismScene(visual.id);
    if (!scene) throw new Error(`Missing production scene for ${visual.id}`);
    const filename = basename(visual.assetPath);
    const svg = renderAgentMechanismSvg(visual, scene);
    validateSvg(svg, filename);
    artifacts.set(filename, svg);
  }
  if (artifacts.size !== 16) {
    throw new Error(`Expected 16 Agent visual artifacts, got ${artifacts.size}`);
  }
  return artifacts;
}

async function atomicWrite(path, bytes, sequence) {
  const temporaryPath = `${path}.tmp-${process.pid}-${sequence}`;
  await writeFile(temporaryPath, bytes, 'utf8');
  await rename(temporaryPath, path);
}

export async function writeAgentMechanismVisualArtifacts({
  outputDirectory = defaultOutputDirectory,
} = {}) {
  const directory = outputDirectory instanceof URL
    ? fileURLToPath(outputDirectory)
    : String(outputDirectory);
  const artifacts = buildAgentMechanismVisualArtifacts();
  await mkdir(directory, { recursive: true });
  let sequence = 0;
  for (const [filename, bytes] of artifacts) {
    await atomicWrite(join(directory, filename), bytes, sequence);
    sequence += 1;
  }
  return artifacts;
}

export async function checkAgentMechanismVisualArtifacts({
  outputDirectory = defaultOutputDirectory,
} = {}) {
  const directory = outputDirectory instanceof URL
    ? fileURLToPath(outputDirectory)
    : String(outputDirectory);
  const expected = buildAgentMechanismVisualArtifacts();
  let entries = [];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const actualNames = entries.filter((name) => name.endsWith('.svg')).sort();
  const expectedNames = [...expected.keys()].sort();
  const drift = [];
  for (const filename of expectedNames) {
    try {
      const actual = await readFile(join(directory, filename), 'utf8');
      if (actual !== expected.get(filename)) drift.push(`changed: ${filename}`);
    } catch (error) {
      if (error?.code === 'ENOENT') drift.push(`missing: ${filename}`);
      else throw error;
    }
  }
  for (const filename of actualNames) {
    if (!expected.has(filename)) drift.push(`unexpected: ${filename}`);
  }
  if (drift.length > 0) {
    throw new Error(`Agent visual artifact drift:\n${drift.join('\n')}`);
  }
  return expected;
}

function parseArguments(argv) {
  if (argv.length === 0) return { check: false };
  if (argv.length === 1 && argv[0] === '--check') return { check: true };
  throw new TypeError(`Unknown argument: ${argv.join(' ')}`);
}

async function main(argv) {
  const { check } = parseArguments(argv);
  const artifacts = check
    ? await checkAgentMechanismVisualArtifacts()
    : await writeAgentMechanismVisualArtifacts();
  process.stdout.write(
    check
      ? `${artifacts.size} Agent visual artifacts are current.\n`
      : `Generated ${artifacts.size} Agent visual artifacts atomically.\n`,
  );
}

const isMain = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
