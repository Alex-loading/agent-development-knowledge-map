import { spawnSync } from 'node:child_process';
import {
  mkdir, readdir, readFile, rename, writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { getBackendEngineeringScene } from '../src/data/visuals/backend-engineering-scenes.js';
import { renderBackendEngineeringSvg } from '../src/data/visuals/backend-engineering-svg.js';
import { backendEngineeringVisuals } from '../src/data/visuals/backend-engineering-visuals.js';

const defaultOutputDirectory = fileURLToPath(
  new URL('../assets/visuals/backend-engineering/', import.meta.url),
);

function validateSvg(svg, filename) {
  const inspectable = svg.replace('http://www.w3.org/2000/svg', '');
  if (/<script|foreignObject|onload=|javascript:|data:|https?:\/\/|<!DOCTYPE|<!ENTITY/i.test(inspectable)) {
    throw new Error(`${filename}: active, embedded, or remote content is forbidden`);
  }
  const validation = spawnSync('xmllint', ['--noout', '-'], { input: svg, encoding: 'utf8' });
  if (validation.error) throw new Error(`${filename}: xmllint unavailable: ${validation.error.message}`);
  if (validation.status !== 0) throw new Error(`${filename}: invalid XML\n${validation.stderr.trim()}`);
}

export function buildBackendEngineeringVisualArtifacts() {
  const artifacts = new Map();
  for (const visual of backendEngineeringVisuals) {
    const scene = getBackendEngineeringScene(visual.id);
    if (!scene) throw new Error(`Missing production scene for ${visual.id}`);
    const filename = basename(visual.assetPath);
    const svg = renderBackendEngineeringSvg(visual, scene);
    validateSvg(svg, filename);
    artifacts.set(filename, svg);
  }
  if (artifacts.size !== 16) throw new Error(`Expected 16 Backend visual artifacts, got ${artifacts.size}`);
  return artifacts;
}

async function atomicWrite(path, bytes, sequence) {
  const temporaryPath = `${path}.tmp-${process.pid}-${sequence}`;
  await writeFile(temporaryPath, bytes, 'utf8');
  await rename(temporaryPath, path);
}

export async function writeBackendEngineeringVisualArtifacts({ outputDirectory = defaultOutputDirectory } = {}) {
  const directory = outputDirectory instanceof URL ? fileURLToPath(outputDirectory) : String(outputDirectory);
  const artifacts = buildBackendEngineeringVisualArtifacts();
  await mkdir(directory, { recursive: true });
  let sequence = 0;
  for (const [filename, bytes] of artifacts) {
    await atomicWrite(join(directory, filename), bytes, sequence);
    sequence += 1;
  }
  return artifacts;
}

export async function checkBackendEngineeringVisualArtifacts({ outputDirectory = defaultOutputDirectory } = {}) {
  const directory = outputDirectory instanceof URL ? fileURLToPath(outputDirectory) : String(outputDirectory);
  const expected = buildBackendEngineeringVisualArtifacts();
  let names = [];
  try {
    names = (await readdir(directory)).filter((name) => name.endsWith('.svg')).sort();
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const drift = [];
  for (const [filename, bytes] of expected) {
    try {
      if (await readFile(join(directory, filename), 'utf8') !== bytes) drift.push(`changed: ${filename}`);
    } catch (error) {
      if (error?.code === 'ENOENT') drift.push(`missing: ${filename}`);
      else throw error;
    }
  }
  for (const filename of names) if (!expected.has(filename)) drift.push(`unexpected: ${filename}`);
  if (drift.length) throw new Error(`Backend visual artifact drift:\n${drift.join('\n')}`);
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
    ? await checkBackendEngineeringVisualArtifacts()
    : await writeBackendEngineeringVisualArtifacts();
  process.stdout.write(check
    ? `${artifacts.size} Backend visual artifacts are current.\n`
    : `Generated ${artifacts.size} Backend visual artifacts atomically.\n`);
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
