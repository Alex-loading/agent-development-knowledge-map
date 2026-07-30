import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  PRIMARY_REFERENCE_IDENTITY_RULES,
  primaryReferenceAnnotations,
} from './primary-reference-annotations.mjs';

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
const ANNOTATION_FIELDS = ['id', 'canonicalUrl', 'moduleCandidates', 'limitations'];
const ACTIVE_MODULE_IDS = new Set([
  'llm-foundation',
  'agent-mechanism',
  'agent-harness',
  'context-rag-memory',
  'backend-engineering',
]);
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

function identityRuleFor(annotation) {
  const matches = Object.entries(PRIMARY_REFERENCE_IDENTITY_RULES).filter(([, rule]) => (
    annotation.canonicalUrl.startsWith(rule.canonicalUrlPrefix)
  ));
  if (matches.length !== 1) {
    throw new Error(
      `${annotation.canonicalUrl} does not match one stable URL identity rule`,
    );
  }
  const [sourceFamily, rule] = matches[0];
  if (!annotation.id.startsWith(rule.idPrefix)) {
    throw new Error(`${annotation.id} does not match the ${sourceFamily} stable ID rule`);
  }
  if (sourceFamily === 'feishu-harness-101') {
    const token = annotation.canonicalUrl.slice(rule.canonicalUrlPrefix.length);
    if (!/^[A-Za-z0-9]{27}$/.test(token)) {
      throw new Error(
        `${annotation.canonicalUrl} does not match the Feishu stable URL identity rule`,
      );
    }
  } else {
    const url = new URL(annotation.canonicalUrl);
    if (
      url.origin !== 'https://javaguide.cn'
      || !url.pathname.startsWith('/ai/')
      || url.search !== ''
      || url.hash !== ''
    ) {
      throw new Error(
        `${annotation.canonicalUrl} does not match the JavaGuide stable URL identity rule`,
      );
    }
  }
  return { sourceFamily, rule };
}

export function validatePrimaryReferenceAnnotations(annotations, manifest) {
  if (!Array.isArray(annotations) || annotations.length !== 50) {
    throw new Error(
      `Expected exactly 50 curated annotations; update scripts/primary-reference-annotations.mjs (received ${annotations?.length ?? 'non-array'})`,
    );
  }
  const ids = new Set();
  const urls = new Set();
  for (const annotation of annotations) {
    if (
      !annotation
      || Object.keys(annotation).join('\u0000') !== ANNOTATION_FIELDS.join('\u0000')
      || typeof annotation.id !== 'string'
      || !/^primary-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(annotation.id)
      || typeof annotation.canonicalUrl !== 'string'
      || !Array.isArray(annotation.moduleCandidates)
      || annotation.moduleCandidates.length === 0
      || annotation.moduleCandidates.some((moduleId) => !ACTIVE_MODULE_IDS.has(moduleId))
      || new Set(annotation.moduleCandidates).size !== annotation.moduleCandidates.length
      || typeof annotation.limitations !== 'string'
      || annotation.limitations.trim().length < 20
    ) {
      throw new Error(
        `Invalid curated annotation; update scripts/primary-reference-annotations.mjs: ${annotation?.id ?? 'unknown'}`,
      );
    }
    if (ids.has(annotation.id)) {
      throw new Error(`Duplicate curated annotation ID: ${annotation.id}`);
    }
    if (urls.has(annotation.canonicalUrl)) {
      throw new Error(`Duplicate curated annotation URL: ${annotation.canonicalUrl}`);
    }
    ids.add(annotation.id);
    urls.add(annotation.canonicalUrl);
    identityRuleFor(annotation);
  }
  if (manifest) {
    const manifestSources = [
      ...(manifest.feishu?.documents ?? []),
      ...(manifest.javaGuide?.articles ?? []),
    ];
    const manifestUrls = new Set(manifestSources.map(({ canonicalUrl }) => canonicalUrl));
    if (manifestUrls.size !== manifestSources.length) {
      throw new Error('Private manifest contains duplicate canonical source URLs');
    }
    for (const canonicalUrl of manifestUrls) {
      if (!urls.has(canonicalUrl)) {
        throw new Error(
          `Manifest source has no curated annotation: ${canonicalUrl}; update scripts/primary-reference-annotations.mjs`,
        );
      }
    }
    for (const canonicalUrl of urls) {
      if (!manifestUrls.has(canonicalUrl)) {
        throw new Error(
          `Curated annotation has no manifest source: ${canonicalUrl}; update scripts/primary-reference-annotations.mjs`,
        );
      }
    }
  }
  return annotations;
}

export function createSafePrimaryReferenceSnapshot(manifest, annotations) {
  if (!manifest || typeof manifest !== 'object') {
    throw new TypeError('Private manifest must be an object');
  }
  validatePrimaryReferenceAnnotations(annotations, manifest);

  const sourceByUrl = new Map();
  for (const document of manifest.feishu?.documents ?? []) {
    sourceByUrl.set(document.canonicalUrl, document);
  }
  for (const article of manifest.javaGuide?.articles ?? []) {
    sourceByUrl.set(article.canonicalUrl, article);
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
    const { sourceFamily, rule } = identityRuleFor(annotation);
    const record = {
      id: annotation.id,
      title: source.title,
      canonicalUrl: source.canonicalUrl,
      sourceFamily,
      sourceTier: 'primary-narrative',
      publisherOrAuthor: rule.publisherOrAuthor,
      bodyAccess: source.bodyAccess,
      retrievedAt: source.retrievedAt ?? manifest.retrievedAt,
      updatedAt: source.updatedAt ?? null,
      contentHash: source.contentHash,
      mediaDecision: rule.mediaDecision,
      revision: source.revision ?? null,
      mediaCount: source.mediaCount,
      moduleCandidates: [...annotation.moduleCandidates],
      permissionEvidence: rule.permissionEvidence,
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
    'function deepFreeze(value) {',
    "  if (value && typeof value === 'object' && !Object.isFrozen(value)) {",
    '    for (const nested of Object.values(value)) deepFreeze(nested);',
    '    Object.freeze(value);',
    '  }',
    '  return value;',
    '}',
    '',
    `export const primaryReferenceSnapshot = deepFreeze(${JSON.stringify(records, null, 2)});`,
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
  const records = createSafePrimaryReferenceSnapshot(
    manifest,
    primaryReferenceAnnotations,
  );
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
