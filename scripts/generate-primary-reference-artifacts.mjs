import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPOSITORY_ROOT = new URL('../', import.meta.url);
const MANIFEST_URL = new URL(
  './.research-cache/primary-references/manifest.json',
  REPOSITORY_ROOT,
);
const SNAPSHOT_URL = new URL(
  './src/data/primary-reference-snapshot.generated.js',
  REPOSITORY_ROOT,
);
const INVENTORY_URL = new URL(
  './docs/research/2026-07-30-primary-reference-inventory.md',
  REPOSITORY_ROOT,
);
const INVENTORY_HEADER = [
  'sourceId',
  'title',
  'canonicalUrl',
  'bodyAccess',
  'retrievedAt',
  'updatedAt',
  'revision',
  'contentHash',
  'moduleCandidates',
  'mediaCount',
  'permissionDecision',
  'permissionEvidence',
  'limitations',
];
const SNAPSHOT_ANNOTATION_FIELDS = [
  'id',
  'canonicalUrl',
  'moduleCandidates',
  'permissionEvidence',
  'limitations',
];
const SAFE_SNAPSHOT_FIELDS = [
  'id',
  'title',
  'canonicalUrl',
  'sourceFamily',
  'sourceTier',
  'publisherOrAuthor',
  'bodyAccess',
  'retrievedAt',
  'updatedAt',
  'contentHash',
  'mediaDecision',
  'revision',
  'mediaCount',
  'moduleCandidates',
  'permissionEvidence',
  'limitations',
];

function splitMarkdownRow(line) {
  return line
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

export function parseInventoryAnnotations(markdown) {
  const lines = markdown.split('\n');
  const tableStart = lines.findIndex((line) => (
    line.startsWith('|')
    && splitMarkdownRow(line).join('\u0000') === INVENTORY_HEADER.join('\u0000')
  ));
  if (tableStart === -1) throw new Error('Primary reference inventory table was not found');
  const annotations = [];
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('|') || !line.endsWith('|')) break;
    const cells = splitMarkdownRow(line);
    if (cells.length !== INVENTORY_HEADER.length) {
      throw new Error(`Malformed primary reference inventory row ${index + 1}`);
    }
    const row = Object.fromEntries(
      INVENTORY_HEADER.map((field, cellIndex) => [field, cells[cellIndex]]),
    );
    annotations.push({
      id: row.sourceId,
      canonicalUrl: row.canonicalUrl,
      moduleCandidates: row.moduleCandidates.split(',').map((value) => value.trim()),
      permissionEvidence: row.permissionEvidence,
      limitations: row.limitations,
    });
  }
  return annotations;
}

function annotationFromSnapshot(record) {
  return Object.fromEntries(
    SNAPSHOT_ANNOTATION_FIELDS.map((field) => [field, structuredClone(record[field])]),
  );
}

function assertSafeAnnotation(annotation) {
  if (
    !annotation
    || typeof annotation.id !== 'string'
    || typeof annotation.canonicalUrl !== 'string'
    || !Array.isArray(annotation.moduleCandidates)
    || annotation.moduleCandidates.length === 0
    || typeof annotation.permissionEvidence !== 'string'
    || typeof annotation.limitations !== 'string'
  ) {
    throw new Error(`Incomplete safe annotation: ${annotation?.canonicalUrl ?? 'unknown'}`);
  }
}

export function createSafePrimaryReferenceSnapshot(manifest, annotations) {
  if (!manifest || typeof manifest !== 'object') {
    throw new TypeError('Private manifest must be an object');
  }
  if (!Array.isArray(annotations) || annotations.length !== 50) {
    throw new Error('Exactly 50 safe primary reference annotations are required');
  }
  const annotationByUrl = new Map();
  for (const annotation of annotations) {
    assertSafeAnnotation(annotation);
    if (annotationByUrl.has(annotation.canonicalUrl)) {
      throw new Error(`Duplicate safe annotation: ${annotation.canonicalUrl}`);
    }
    annotationByUrl.set(annotation.canonicalUrl, annotation);
  }

  const sourceByUrl = new Map();
  for (const document of manifest.feishu?.documents ?? []) {
    sourceByUrl.set(document.canonicalUrl, {
      ...document,
      sourceFamily: 'feishu-harness-101',
      publisherOrAuthor: 'Harness 101',
      mediaDecision: manifest.policy?.feishuMediaDecision,
    });
  }
  for (const article of manifest.javaGuide?.articles ?? []) {
    sourceByUrl.set(article.canonicalUrl, {
      ...article,
      sourceFamily: 'javaguide-ai',
      publisherOrAuthor: 'JavaGuide',
      mediaDecision: manifest.policy?.javaGuideMediaDecision,
    });
  }
  if (sourceByUrl.size !== 50) {
    throw new Error(`Private manifest must resolve exactly 50 sources; received ${sourceByUrl.size}`);
  }

  const records = annotations.map((annotation) => {
    const source = sourceByUrl.get(annotation.canonicalUrl);
    if (!source) {
      throw new Error(`Private manifest is missing ${annotation.canonicalUrl}`);
    }
    sourceByUrl.delete(annotation.canonicalUrl);
    const record = {
      id: annotation.id,
      title: source.title,
      canonicalUrl: source.canonicalUrl,
      sourceFamily: source.sourceFamily,
      sourceTier: 'primary-narrative',
      publisherOrAuthor: source.publisherOrAuthor,
      bodyAccess: source.bodyAccess,
      retrievedAt: source.retrievedAt ?? manifest.retrievedAt,
      updatedAt: source.updatedAt ?? null,
      contentHash: source.contentHash,
      mediaDecision: source.mediaDecision,
      revision: source.revision ?? null,
      mediaCount: source.mediaCount,
      moduleCandidates: [...annotation.moduleCandidates],
      permissionEvidence: annotation.permissionEvidence,
      limitations: annotation.limitations,
    };
    if (Object.keys(record).join('\u0000') !== SAFE_SNAPSHOT_FIELDS.join('\u0000')) {
      throw new Error(`Unexpected safe snapshot fields for ${record.id}`);
    }
    return record;
  });
  if (sourceByUrl.size > 0) {
    throw new Error(
      `Private manifest contains unannotated sources: ${[...sourceByUrl.keys()].join(', ')}`,
    );
  }
  return records;
}

export function renderSafePrimaryReferenceSnapshot(records) {
  return [
    '// Generated by scripts/generate-primary-reference-artifacts.mjs.',
    '// Safe metadata only: private bodies, access envelopes, media tokens, and credentials are excluded.',
    `export const primaryReferenceSnapshot = ${JSON.stringify(records, null, 2)};`,
    '',
  ].join('\n');
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

export function renderInventoryTable(records) {
  const separator = INVENTORY_HEADER.map(() => '---');
  const rows = records.map((record) => [
    record.id,
    record.title,
    record.canonicalUrl,
    record.bodyAccess,
    record.retrievedAt,
    record.updatedAt ?? '—',
    record.revision ?? '—',
    record.contentHash,
    record.moduleCandidates.join(','),
    record.mediaCount,
    record.mediaDecision,
    record.permissionEvidence,
    record.limitations,
  ]);
  return [
    `| ${INVENTORY_HEADER.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeMarkdownCell).join(' | ')} |`),
  ].join('\n');
}

export function replaceInventoryTable(markdown, renderedTable) {
  const lines = markdown.split('\n');
  const tableStart = lines.findIndex((line) => (
    line.startsWith('|')
    && splitMarkdownRow(line).join('\u0000') === INVENTORY_HEADER.join('\u0000')
  ));
  if (tableStart === -1) throw new Error('Primary reference inventory table was not found');
  let tableEnd = tableStart + 2;
  while (lines[tableEnd]?.startsWith('|') && lines[tableEnd]?.endsWith('|')) {
    tableEnd += 1;
  }
  return [
    ...lines.slice(0, tableStart),
    ...renderedTable.split('\n'),
    ...lines.slice(tableEnd),
  ].join('\n');
}

export function assertGeneratedArtifactCurrent(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} drift detected; run npm run generate:primary-references`);
  }
}

async function loadAnnotations(inventoryMarkdown) {
  try {
    const module = await import(`${SNAPSHOT_URL.href}?cacheBust=${Date.now()}`);
    return module.primaryReferenceSnapshot.map(annotationFromSnapshot);
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    return parseInventoryAnnotations(inventoryMarkdown);
  }
}

async function run() {
  const checkOnly = process.argv.includes('--check');
  if (process.argv.some((argument) => !['--check'].includes(argument) && argument !== process.argv[0] && argument !== process.argv[1])) {
    throw new Error('Usage: node scripts/generate-primary-reference-artifacts.mjs [--check]');
  }
  const [manifestText, inventoryMarkdown] = await Promise.all([
    readFile(MANIFEST_URL, 'utf8'),
    readFile(INVENTORY_URL, 'utf8'),
  ]);
  const manifest = JSON.parse(manifestText);
  const annotations = await loadAnnotations(inventoryMarkdown);
  const records = createSafePrimaryReferenceSnapshot(manifest, annotations);
  const snapshotOutput = renderSafePrimaryReferenceSnapshot(records);
  const inventoryOutput = replaceInventoryTable(
    inventoryMarkdown,
    renderInventoryTable(records),
  );

  if (checkOnly) {
    const currentSnapshot = await readFile(SNAPSHOT_URL, 'utf8');
    assertGeneratedArtifactCurrent(
      currentSnapshot,
      snapshotOutput,
      'Safe primary reference snapshot',
    );
    assertGeneratedArtifactCurrent(
      inventoryMarkdown,
      inventoryOutput,
      'Primary reference inventory',
    );
    process.stdout.write('Primary reference generated artifacts are current.\n');
    return;
  }
  await Promise.all([
    writeFile(SNAPSHOT_URL, snapshotOutput, 'utf8'),
    writeFile(INVENTORY_URL, inventoryOutput, 'utf8'),
  ]);
  process.stdout.write('Generated safe primary reference snapshot and inventory.\n');
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  try {
    await run();
  } catch (error) {
    process.stderr.write(`Primary reference generation failed: ${error.stack ?? error}\n`);
    process.exitCode = 1;
  }
}
