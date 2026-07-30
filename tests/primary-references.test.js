import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { filterResources } from '../src/core/filters.js';
import { courseRegistry } from '../src/data/courses.js';
import {
  PRIMARY_SOURCE_FAMILIES,
  getPrimaryReference,
  primaryReferences,
} from '../src/data/primary-references.js';
import * as primaryReferenceModule from '../src/data/primary-references.js';
import { createPrimaryReferenceBinding } from '../src/data/primary-reference-bindings.js';
import { primaryReferenceSnapshot } from '../src/data/primary-reference-snapshot.generated.js';
import {
  DEFAULT_FREEZE_LIMITS,
  FEISHU_CHILDREN_ARGS,
  FEISHU_DOCUMENT_ARGS,
  PRIMARY_REFERENCE_CACHE_DIRECTORY,
  PRIMARY_REFERENCE_CACHE_ROOT,
  canonicalizeJavaGuideUrl,
  crawlJavaGuide,
  freezePrimaryReferences,
  hashSourceText,
  isValidCalendarDate,
  normalizeSourceText,
  parseLarkEnvelope,
  resolveFeishuRawBodyUrl,
  runLarkCli,
  sortFeishuNodes,
  sortManifestCollections,
  validatePrimaryReferenceManifest,
} from '../scripts/freeze-primary-references.mjs';
import {
  assertGeneratedArtifactCurrent,
  createSafePrimaryReferenceSnapshot,
  renderInventoryTable,
  renderSafePrimaryReferenceSnapshot,
  replaceInventoryTable,
  validatePrimaryReferenceAnnotations,
} from '../scripts/generate-primary-reference-artifacts.mjs';
import {
  PRIMARY_REFERENCE_IDENTITY_RULES,
  primaryReferenceAnnotations,
} from '../scripts/primary-reference-annotations.mjs';

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const PRIMARY_ID = /^primary-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACTIVE_MODULE_IDS = new Set(Object.keys(courseRegistry));
const STABLE_LESSON_IDS = new Set(
  Object.values(courseRegistry).flatMap(({ lessons }) => lessons.map(({ id }) => id)),
);
const INVENTORY_COLUMNS = [
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
const CLAIM_COLUMNS = [
  'claimId',
  'statement',
  'status',
  'primarySourceIds',
  'verificationNeed',
  'moduleId',
  'lessonId',
  'plannedSection',
  'sourceContribution',
  'limitations',
];

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label} must be deeply frozen`);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

function parseMarkdownTable(markdown, expectedColumns) {
  const lines = markdown.split('\n');
  const headerIndex = lines.findIndex((line) => {
    if (!line.startsWith('|') || !line.endsWith('|')) return false;
    const cells = line
      .slice(1, -1)
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim());
    return cells.join('\u0000') === expectedColumns.join('\u0000');
  });
  assert.notEqual(headerIndex, -1, `missing table: ${expectedColumns.join(' | ')}`);
  assert.match(lines[headerIndex + 1] ?? '', /^\|(?:\s*:?-+:?\s*\|)+$/);

  const rows = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('|') || !line.endsWith('|')) break;
    const cells = line
      .slice(1, -1)
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim().replaceAll('\\|', '|'));
    assert.equal(cells.length, expectedColumns.length, `malformed row ${index + 1}`);
    rows.push(Object.fromEntries(expectedColumns.map((column, cellIndex) => (
      [column, cells[cellIndex]]
    ))));
  }
  return rows;
}

function javaGuideHtml({
  canonicalUrl = 'https://javaguide.cn/ai/',
  title = 'JavaGuide AI',
  links = [],
  extraHead = '',
  body = '<main><h1>JavaGuide AI</h1></main>',
} = {}) {
  return [
    '<!doctype html><html><head>',
    `<title>${title}</title>`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    extraHead,
    '</head><body>',
    body,
    ...links.map((href) => `<a href="${href}">route</a>`),
    '</body></html>',
  ].join('');
}

function javaGuideResponse({
  url = 'https://javaguide.cn/ai/',
  status = 200,
  redirected = false,
  contentType = 'text/html; charset=utf-8',
  body = javaGuideHtml({ canonicalUrl: url }),
  contentLength,
} = {}) {
  const headers = new Headers({ 'content-type': contentType });
  if (contentLength !== undefined) headers.set('content-length', String(contentLength));
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    redirected,
    headers,
    text: async () => body,
  };
}

function manifestFixture({
  javaGuideFailures = [],
  javaGuideCount = 34,
  feishuCount = 16,
} = {}) {
  const hash = `sha256:${'a'.repeat(64)}`;
  const feishuDocuments = Array.from({ length: feishuCount }, (_, index) => ({
    nodeToken: index === 0
      ? 'L082wubkdie8uMkRUjgceKYQnIe'
      : `A${String(index).padStart(26, '0')}`,
    canonicalUrl: index === 0
      ? 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe'
      : `https://my.feishu.cn/wiki/A${String(index).padStart(26, '0')}`,
    contentHash: hash,
    mediaCount: 0,
  }));
  const javaGuideArticles = Array.from({ length: javaGuideCount }, (_, index) => ({
    canonicalUrl: index === 0
      ? 'https://javaguide.cn/ai/'
      : `https://javaguide.cn/ai/fixture-${String(index).padStart(2, '0')}.html`,
    contentHash: hash,
    mediaCount: 0,
  }));
  return {
    schemaVersion: 2,
    frozenAt: '2026-07-30T00:00:00.000Z',
    retrievedAt: '2026-07-30',
    policy: {
      rawBodiesCommitted: false,
      feishuMediaDecision: 'permission-review-required',
      javaGuideMediaDecision: 'asset-level-review-required',
    },
    feishu: {
      accessResult: 'ok',
      rootUrl: 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe',
      expectedDirectLeafChildren: 15,
      discoveredDirectLeafChildren: 15,
      documents: feishuDocuments,
      failures: [],
    },
    javaGuide: {
      accessResult: javaGuideFailures.length === 0 ? 'ok' : 'partial',
      rootUrl: 'https://javaguide.cn/ai/',
      visitedRouteCount: javaGuideCount,
      visitedRoutes: javaGuideArticles.map(({ canonicalUrl }) => canonicalUrl),
      articles: javaGuideArticles,
      redirects: [],
      failures: javaGuideFailures,
    },
    totals: {
      sources: feishuCount + javaGuideCount,
      feishuDocuments: feishuCount,
      javaGuideArticles: javaGuideCount,
      mediaCandidates: 0,
      redirects: 0,
      failures: javaGuideFailures.length,
    },
  };
}

function manifestFromSafeSnapshot(records = primaryReferenceSnapshot) {
  const feishuDocuments = records
    .filter(({ sourceFamily }) => sourceFamily === 'feishu-harness-101')
    .map((record) => ({
      ...record,
      nodeToken: new URL(record.canonicalUrl).pathname.split('/').at(-1),
    }));
  const javaGuideArticles = records
    .filter(({ sourceFamily }) => sourceFamily === 'javaguide-ai')
    .map((record) => ({ ...record }));
  return {
    retrievedAt: records[0].retrievedAt,
    policy: {
      feishuMediaDecision: 'permission-review-required',
      javaGuideMediaDecision: 'asset-level-review-required',
    },
    feishu: { documents: feishuDocuments },
    javaGuide: { articles: javaGuideArticles },
  };
}

async function createIsolatedCache(t) {
  const testRoot = await mkdtemp(join(tmpdir(), 'primary-reference-cache-'));
  t.after(() => rm(testRoot, { recursive: true, force: true }));
  const productionRoot = fileURLToPath(PRIMARY_REFERENCE_CACHE_ROOT);
  const mapTarget = (target) => {
    const targetPath = fileURLToPath(target);
    const relativePath = relative(productionRoot, targetPath);
    assert.ok(
      relativePath !== '..'
      && !relativePath.startsWith(`..${sep}`),
      `unexpected cache target: ${targetPath}`,
    );
    return resolve(testRoot, relativePath);
  };
  const filesystem = {
    mkdir: (target, options) => mkdir(mapTarget(target), options),
    rename: (source, destination) => rename(mapTarget(source), mapTarget(destination)),
    rm: (target, options) => rm(mapTarget(target), options),
    stat: (target) => stat(mapTarget(target)),
    writeFile: (target, value, options) => writeFile(mapTarget(target), value, options),
  };
  const canonicalDirectory = mapTarget(PRIMARY_REFERENCE_CACHE_DIRECTORY);
  const canonicalManifest = mapTarget(
    new URL('./manifest.json', PRIMARY_REFERENCE_CACHE_DIRECTORY),
  );
  return {
    canonicalDirectory,
    canonicalManifest,
    filesystem,
    mapTarget,
    async seedCanonical(value) {
      await mkdir(canonicalDirectory, { recursive: true });
      await writeFile(canonicalManifest, value, 'utf8');
    },
  };
}

test('primary references freeze both requested source families and roots', () => {
  assert.deepEqual(PRIMARY_SOURCE_FAMILIES, [
    'feishu-harness-101',
    'javaguide-ai',
  ]);
  assert.ok(Object.isFrozen(PRIMARY_SOURCE_FAMILIES));

  const feishuSources = primaryReferences.filter(
    ({ sourceFamily }) => sourceFamily === 'feishu-harness-101',
  );
  const javaGuideSources = primaryReferences.filter(
    ({ sourceFamily }) => sourceFamily === 'javaguide-ai',
  );
  assert.equal(feishuSources.length, 16);
  assert.ok(javaGuideSources.length > 0);
  assert.ok(primaryReferences.some(({ canonicalUrl }) => (
    canonicalUrl === 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe'
  )));
  assert.ok(primaryReferences.some(({ canonicalUrl }) => (
    canonicalUrl === 'https://javaguide.cn/ai/'
  )));
});

test('every primary reference has unique, attributable, dated and hashed metadata', () => {
  const ids = primaryReferences.map(({ id }) => id);
  const urls = primaryReferences.map(({ canonicalUrl }) => canonicalUrl);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(urls).size, urls.length);

  for (const source of primaryReferences) {
    assert.deepEqual(Object.keys(source), [
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
    ]);
    assert.match(source.id, PRIMARY_ID);
    assert.ok(PRIMARY_SOURCE_FAMILIES.includes(source.sourceFamily));
    assert.equal(source.sourceTier, 'primary-narrative');
    assert.match(source.canonicalUrl, /^https:\/\//);
    assert.match(source.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(
      source.updatedAt === null || /^\d{4}-\d{2}-\d{2}$/.test(source.updatedAt),
      `${source.id}: updatedAt must be a date or null when unavailable`,
    );
    assert.match(source.contentHash, SHA256);
    assert.ok(['full', 'partial'].includes(source.bodyAccess));
    assert.ok(source.title.trim().length > 0);
    assert.ok(source.publisherOrAuthor.trim().length > 0);
    assert.ok(source.mediaDecision.trim().length > 0);
    assertDeepFrozen(source, source.id);
    assert.equal(getPrimaryReference(source.id), source);
  }
  assertDeepFrozen(primaryReferences, 'primaryReferences');
});

test('every JavaGuide reference preserves its available source update date', () => {
  const javaGuideSources = primaryReferences.filter(
    ({ sourceFamily }) => sourceFamily === 'javaguide-ai',
  );
  assert.equal(javaGuideSources.length, 34);
  assert.ok(javaGuideSources.every(({ updatedAt }) => updatedAt !== null));
});

test('primary lookup is private, immutable and null-safe', () => {
  assert.deepEqual(Object.keys(primaryReferenceModule).sort(), [
    'PRIMARY_SOURCE_FAMILIES',
    'getPrimaryReference',
    'primaryReferences',
  ]);
  assert.equal(getPrimaryReference('missing-primary-source'), null);
  assert.equal(getPrimaryReference(null), null);
  assert.throws(() => {
    primaryReferences.push({});
  }, TypeError);
  assert.throws(() => {
    getPrimaryReference('primary-feishu-react-loop').title = 'tampered';
  }, TypeError);
});

test('course binding derives canonical identity and deeply freezes caller-owned metadata', () => {
  const input = {
    id: 'res-harness-primary-react-loop',
    canonicalSourceId: 'primary-feishu-react-loop',
    stage: 'Agent Loop',
    difficulty: '入门到进阶',
    value: '用于解释单轮、多轮和停止条件。',
    evidence: {
      authority: 'expert',
      role: 'core',
      coverage: ['单轮与多轮 Agent Loop'],
      limitations: '工程教学材料；产品行为与协议字段需官方资料校验。',
      verifiedAt: '2026-07-30',
    },
  };
  const binding = createPrimaryReferenceBinding(input);
  const source = getPrimaryReference(input.canonicalSourceId);

  assert.deepEqual(binding, {
    id: input.id,
    title: source.title,
    url: source.canonicalUrl,
    source: source.publisherOrAuthor,
    creator: source.publisherOrAuthor,
    platform: '飞书',
    language: '中文',
    type: '一级参考资料',
    difficulty: input.difficulty,
    stage: input.stage,
    value: input.value,
    verifiedAt: input.evidence.verifiedAt,
    canonicalSourceId: source.id,
    sourceFamily: source.sourceFamily,
    sourceTier: source.sourceTier,
    evidence: input.evidence,
  });
  assert.notEqual(binding.evidence, input.evidence);
  assert.notEqual(binding.evidence.coverage, input.evidence.coverage);
  assertDeepFrozen(binding, 'binding');
  assert.equal(Object.isFrozen(input), false, 'factory must not freeze caller input');

  assert.deepEqual(
    filterResources([binding], {
      source: source.publisherOrAuthor,
      platform: '飞书',
      type: '一级参考资料',
    }),
    [binding],
    'generated bindings must integrate with the existing resource filters',
  );
});

test('course binding rejects malformed required fields, canonical IDs and evidence', () => {
  const valid = {
    id: 'res-harness-primary-react-loop',
    canonicalSourceId: 'primary-feishu-react-loop',
    stage: 'Agent Loop',
    difficulty: '入门到进阶',
    value: '用于解释单轮、多轮和停止条件。',
    evidence: {
      authority: 'expert',
      role: 'core',
      coverage: ['单轮与多轮 Agent Loop'],
      limitations: '工程教学材料；产品行为与协议字段需官方资料校验。',
      verifiedAt: '2026-07-30',
    },
  };

  for (const key of ['id', 'canonicalSourceId', 'stage', 'difficulty', 'value']) {
    assert.throws(
      () => createPrimaryReferenceBinding({ ...valid, [key]: ' ' }),
      TypeError,
      `${key} is required`,
    );
  }
  assert.throws(
    () => createPrimaryReferenceBinding({ ...valid, canonicalSourceId: 'primary-unknown' }),
    /Unknown primary source/,
  );
  assert.throws(
    () => createPrimaryReferenceBinding({ ...valid, id: 'primary-feishu-react-loop' }),
    TypeError,
  );
  assert.throws(
    () => createPrimaryReferenceBinding({ ...valid, evidence: null }),
    TypeError,
  );
  for (const [key, value] of [
    ['authority', 'invented'],
    ['role', 'invented'],
    ['coverage', []],
    ['limitations', ' '],
    ['verifiedAt', 'July 30'],
    ['verifiedAt', '2026-02-30'],
  ]) {
    assert.throws(
      () => createPrimaryReferenceBinding({
        ...valid,
        evidence: { ...valid.evidence, [key]: value },
      }),
      TypeError,
      `evidence.${key} must be validated`,
    );
  }
});

test('freezer normalizes line endings and trailing whitespace before hashing', () => {
  const source = ' alpha  \r\nbeta\t\r\n\r\n';
  assert.equal(normalizeSourceText(source), 'alpha\nbeta');
  assert.equal(
    hashSourceText(source),
    'sha256:bbfb79e82216bd2db1ad2c507d44ddf80aeb12f64f9562056afe93aad43154d9',
  );
});

test('JavaGuide URL canonicalization strips queries/fragments and enforces scope', () => {
  assert.equal(
    canonicalizeJavaGuideUrl('/ai/agent/?from=nav#loop'),
    'https://javaguide.cn/ai/agent/',
  );
  assert.equal(canonicalizeJavaGuideUrl('/ai-coding/'), null);
  assert.equal(canonicalizeJavaGuideUrl('https://example.com/ai/'), null);
  assert.equal(canonicalizeJavaGuideUrl('/about/'), null);
  assert.equal(canonicalizeJavaGuideUrl('javascript:alert(1)'), null);
});

test('JavaGuide crawler uses BFS and records redirects and failures', async () => {
  const bodies = new Map([
    ['https://javaguide.cn/ai/', {
      url: 'https://javaguide.cn/ai/',
      status: 200,
      body: javaGuideHtml({
        title: 'AI',
        links: ['/ai/a/?q=1', '/ai/old', '/ai/fail'],
      }),
    }],
    ['https://javaguide.cn/ai/a/', {
      url: 'https://javaguide.cn/ai/a/',
      status: 200,
      body: javaGuideHtml({
        canonicalUrl: 'https://javaguide.cn/ai/a/',
        title: 'A',
        links: ['/ai/b#details'],
      }),
    }],
    ['https://javaguide.cn/ai/old', {
      url: 'https://javaguide.cn/ai/new',
      status: 200,
      redirected: true,
      body: javaGuideHtml({
        canonicalUrl: 'https://javaguide.cn/ai/new',
        title: 'New',
      }),
    }],
    ['https://javaguide.cn/ai/b', {
      url: 'https://javaguide.cn/ai/b',
      status: 200,
      body: javaGuideHtml({
        canonicalUrl: 'https://javaguide.cn/ai/b',
        title: 'B',
      }),
    }],
  ]);
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    if (url.endsWith('/fail')) throw new Error('network down');
    const fixture = bodies.get(url);
    return javaGuideResponse(fixture);
  };

  const result = await crawlJavaGuide({ fetchImpl, allowPartial: true });

  assert.deepEqual(requested, [
    'https://javaguide.cn/ai/',
    'https://javaguide.cn/ai/a/',
    'https://javaguide.cn/ai/old',
    'https://javaguide.cn/ai/fail',
    'https://javaguide.cn/ai/b',
  ]);
  assert.deepEqual(result.redirects, [{
    from: 'https://javaguide.cn/ai/old',
    to: 'https://javaguide.cn/ai/new',
    status: 200,
  }]);
  assert.deepEqual(result.failures, [{
    url: 'https://javaguide.cn/ai/fail',
    error: 'network down',
  }]);
  assert.deepEqual(result.articles.map(({ canonicalUrl }) => canonicalUrl), [
    'https://javaguide.cn/ai/',
    'https://javaguide.cn/ai/a/',
    'https://javaguide.cn/ai/b',
    'https://javaguide.cn/ai/new',
  ]);
});

test('JavaGuide crawler records an available ISO update date', async () => {
  const body = javaGuideHtml({
    title: 'Dated page',
    extraHead: '<meta property="article:modified_time" content="2026-05-25T00:42:42.000Z">',
  });
  const result = await crawlJavaGuide({
    fetchImpl: async (url) => javaGuideResponse({ url, body }),
  });

  assert.equal(result.articles[0].updatedAt, '2026-05-25');
});

test('Feishu freezer commands and JSON envelope checks stay exact', () => {
  assert.deepEqual(FEISHU_CHILDREN_ARGS, [
    'wiki', '+node-list',
    '--space-id', '7641116018563255484',
    '--parent-node-token', 'L082wubkdie8uMkRUjgceKYQnIe',
    '--page-all', '--page-limit', '30',
    '--as', 'user', '--format', 'json',
  ]);
  const nodeToken = 'L082wubkdie8uMkRUjgceKYQnIe';
  assert.deepEqual(FEISHU_DOCUMENT_ARGS(nodeToken), [
    'docs', '+fetch',
    '--doc', nodeToken,
    '--detail', 'simple',
    '--format', 'json',
  ]);
  assert.deepEqual(parseLarkEnvelope('{"ok":true,"data":{"value":1}}'), { value: 1 });
  assert.throws(
    () => parseLarkEnvelope('{"ok":false,"error":{"message":"denied"}}'),
    /denied/,
  );
  assert.throws(() => parseLarkEnvelope('not json'), /valid JSON/);
});

test('lark envelope parser accepts only JSON or the known node-count banner', () => {
  const envelope = '{"ok":true,"data":{"value":1}}';
  assert.deepEqual(parseLarkEnvelope(` \n${envelope}\n`), { value: 1 });
  assert.deepEqual(
    parseLarkEnvelope(`Found 15 node(s)\n${envelope}\n`),
    { value: 1 },
  );
  assert.throws(
    () => parseLarkEnvelope(`diagnostic banner\n${envelope}`),
    /known banner/,
  );
  assert.throws(
    () => parseLarkEnvelope(`warning {diagnostic}\n${envelope}`),
    /known banner/,
  );
  assert.throws(
    () => parseLarkEnvelope(`${envelope}\nrequest complete`),
    /valid JSON/,
  );
});

test('Feishu node tokens and raw body paths are strictly contained', () => {
  const token = 'L082wubkdie8uMkRUjgceKYQnIe';
  const rawDirectory = new URL('./feishu/', PRIMARY_REFERENCE_CACHE_DIRECTORY);
  assert.equal(
    resolveFeishuRawBodyUrl(token, rawDirectory).href,
    new URL(`${token}.xml`, rawDirectory).href,
  );
  for (const invalid of [
    '../escape',
    'node-token',
    'L082wubkdie8uMkRUjgceKYQnI/',
    'L082wubkdie8uMkRUjgceKYQnI\\',
    'L082wubkdie8uMkRUjgceKYQnI.',
    'L082wubkdie8uMkRUjgceKYQnIeX',
    'L082wubkdie8uMkRUjgceKYQnI%',
  ]) {
    assert.throws(() => FEISHU_DOCUMENT_ARGS(invalid), /Feishu node token/);
    assert.throws(
      () => resolveFeishuRawBodyUrl(invalid, rawDirectory),
      /Feishu node token/,
    );
  }
  assert.throws(
    () => resolveFeishuRawBodyUrl(token, PRIMARY_REFERENCE_CACHE_DIRECTORY),
    /feishu\/ directory/,
  );
  assert.throws(
    () => resolveFeishuRawBodyUrl(token, new URL('file:///tmp/feishu/')),
    /managed cache root/,
  );
});

test('calendar validation rejects impossible ISO dates', () => {
  assert.equal(isValidCalendarDate('2024-02-29'), true);
  assert.equal(isValidCalendarDate('2025-02-29'), false);
  assert.equal(isValidCalendarDate('2026-02-30'), false);
  assert.equal(isValidCalendarDate('2026-13-01'), false);
  assert.equal(isValidCalendarDate('July 30, 2026'), false);
});

test('JavaGuide crawler fails closed on HTTP failures and challenge pages', async () => {
  const rootBody = javaGuideHtml({ links: ['/ai/fail'] });
  const fetchWithFailure = async (url) => {
    if (url.endsWith('/fail')) return javaGuideResponse({ url, status: 503 });
    return javaGuideResponse({ url, body: rootBody });
  };
  await assert.rejects(
    crawlJavaGuide({ fetchImpl: fetchWithFailure }),
    /JavaGuide crawl failed closed.*1 failure/,
  );

  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (url) => javaGuideResponse({
        url,
        title: 'Just a moment',
        body: javaGuideHtml({
          canonicalUrl: url,
          title: 'Just a moment...',
          body: '<main>Checking your browser before accessing JavaGuide</main>',
        }),
      }),
    }),
    /challenge or error page/i,
  );
});

test('JavaGuide crawler rejects non-HTML and structurally incomplete 200 responses', async () => {
  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (url) => javaGuideResponse({
        url,
        contentType: 'application/json',
        body: '{"message":"ok"}',
      }),
    }),
    /content-type/i,
  );
  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (url) => javaGuideResponse({
        url,
        body: '<title>not a complete HTML document</title>',
      }),
    }),
    /HTML structure/i,
  );
});

test('JavaGuide crawler enforces route, body and timeout limits without waiting', async () => {
  await assert.rejects(
    crawlJavaGuide({
      limits: { ...DEFAULT_FREEZE_LIMITS, maxRoutes: 1 },
      fetchImpl: async (url) => javaGuideResponse({
        url,
        body: javaGuideHtml({ canonicalUrl: url, links: ['/ai/second'] }),
      }),
    }),
    /route limit/i,
  );
  await assert.rejects(
    crawlJavaGuide({
      limits: { ...DEFAULT_FREEZE_LIMITS, maxBodyBytes: 16 },
      fetchImpl: async (url) => javaGuideResponse({
        url,
        contentLength: 10_000,
      }),
    }),
    /body byte limit/i,
  );

  let receivedSignal;
  const timeoutSignal = AbortSignal.abort(new DOMException('timed out', 'TimeoutError'));
  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (_url, options) => {
        receivedSignal = options.signal;
        throw options.signal.reason;
      },
      timeoutSignalFactory: () => timeoutSignal,
    }),
    /timed out|TimeoutError/i,
  );
  assert.equal(receivedSignal, timeoutSignal);
});

test('JavaGuide aggregate byte exhaustion aborts before fetching later queued routes', async () => {
  const rootUrl = 'https://javaguide.cn/ai/';
  const secondUrl = 'https://javaguide.cn/ai/second';
  const laterUrl = 'https://javaguide.cn/ai/later';
  const bodies = new Map([
    [rootUrl, javaGuideHtml({
      canonicalUrl: rootUrl,
      links: [secondUrl, laterUrl],
    })],
    [secondUrl, javaGuideHtml({
      canonicalUrl: secondUrl,
      body: `<main>${'x'.repeat(1024)}</main>`,
    })],
    [laterUrl, javaGuideHtml({ canonicalUrl: laterUrl })],
  ]);
  const requested = [];
  let aggregateStreamCancelled = false;
  const maxTotalBytes = Buffer.byteLength(bodies.get(rootUrl), 'utf8')
    + Buffer.byteLength(bodies.get(secondUrl), 'utf8')
    - 1;

  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (url) => {
        requested.push(url);
        const response = javaGuideResponse({ url, body: bodies.get(url) });
        if (url !== secondUrl) return response;
        let delivered = false;
        return {
          ...response,
          body: {
            getReader: () => ({
              cancel: async () => {
                aggregateStreamCancelled = true;
              },
              read: async () => {
                if (delivered) return { done: true };
                delivered = true;
                return {
                  done: false,
                  value: new TextEncoder().encode(bodies.get(url)),
                };
              },
            }),
          },
        };
      },
      limits: {
        ...DEFAULT_FREEZE_LIMITS,
        maxBodyBytes: Buffer.byteLength(bodies.get(secondUrl), 'utf8') - 1,
        maxTotalBytes,
      },
    }),
    /total byte limit/i,
  );
  assert.deepEqual(requested, [rootUrl, secondUrl]);
  assert.equal(aggregateStreamCancelled, true);
});

test('declared aggregate overrun cancels the body and aborts before later routes', async () => {
  const rootUrl = 'https://javaguide.cn/ai/';
  const secondUrl = 'https://javaguide.cn/ai/second';
  const laterUrl = 'https://javaguide.cn/ai/later';
  const rootBody = javaGuideHtml({
    canonicalUrl: rootUrl,
    links: [secondUrl, laterUrl],
  });
  const requested = [];
  let responseBodyCancelled = false;
  const remainingAfterRoot = 16;

  await assert.rejects(
    crawlJavaGuide({
      fetchImpl: async (url) => {
        requested.push(url);
        if (url === rootUrl) return javaGuideResponse({ url, body: rootBody });
        const response = javaGuideResponse({
          url,
          contentLength: remainingAfterRoot + 1,
        });
        return {
          ...response,
          body: {
            cancel: async () => {
              responseBodyCancelled = true;
            },
          },
        };
      },
      limits: {
        ...DEFAULT_FREEZE_LIMITS,
        maxTotalBytes: Buffer.byteLength(rootBody, 'utf8') + remainingAfterRoot,
      },
    }),
    /total byte limit/i,
  );
  assert.deepEqual(requested, [rootUrl, secondUrl]);
  assert.equal(responseBodyCancelled, true);
});

test('rejecting aggregate cancellation preserves the sentinel and prior cache', async (t) => {
  const cache = await createIsolatedCache(t);
  const before = '{"fixture":"prior aggregate-safe snapshot"}\n';
  await cache.seedCanonical(before);
  const rootUrl = 'https://javaguide.cn/ai/';
  const secondUrl = 'https://javaguide.cn/ai/second';
  const laterUrl = 'https://javaguide.cn/ai/later';
  const rootBody = javaGuideHtml({
    canonicalUrl: rootUrl,
    links: [secondUrl, laterUrl],
  });
  const secondBody = javaGuideHtml({
    canonicalUrl: secondUrl,
    body: `<main>${'x'.repeat(1024)}</main>`,
  });
  const requested = [];
  let cancelAttempted = false;

  await assert.rejects(
    freezePrimaryReferences({
      filesystem: cache.filesystem,
      stagingId: '44444444444444444444444444444444',
      snapshotBuilder: async () => {
        await crawlJavaGuide({
          fetchImpl: async (url) => {
            requested.push(url);
            if (url === rootUrl) return javaGuideResponse({ url, body: rootBody });
            if (url === laterUrl) return javaGuideResponse({ url });
            const response = javaGuideResponse({ url, body: secondBody });
            let delivered = false;
            return {
              ...response,
              body: {
                getReader: () => ({
                  cancel: async () => {
                    cancelAttempted = true;
                    throw new Error('secondary cancellation diagnostic');
                  },
                  read: async () => {
                    if (delivered) return { done: true };
                    delivered = true;
                    return {
                      done: false,
                      value: new TextEncoder().encode(secondBody),
                    };
                  },
                }),
              },
            };
          },
          limits: {
            ...DEFAULT_FREEZE_LIMITS,
            maxTotalBytes: Buffer.byteLength(rootBody, 'utf8')
              + Buffer.byteLength(secondBody, 'utf8')
              - 1,
          },
        });
        throw new Error('crawl unexpectedly completed');
      },
    }),
    (error) => {
      assert.match(error.message, /total byte limit/i);
      assert.doesNotMatch(error.message, /secondary cancellation diagnostic/i);
      return true;
    },
  );
  assert.equal(cancelAttempted, true);
  assert.deepEqual(requested, [rootUrl, secondUrl]);
  assert.equal(await readFile(cache.canonicalManifest, 'utf8'), before);
});

test('JavaGuide update date extraction rejects impossible calendar dates', async () => {
  const result = await crawlJavaGuide({
    fetchImpl: async (url) => javaGuideResponse({
      url,
      body: javaGuideHtml({
        canonicalUrl: url,
        extraHead: '<meta property="article:modified_time" content="2026-02-30T00:00:00Z">',
      }),
    }),
  });
  assert.equal(result.articles[0].updatedAt, null);
});

test('lark execution applies timeout and output limits with explicit errors', async () => {
  let receivedOptions;
  await assert.rejects(
    runLarkCli(FEISHU_CHILDREN_ARGS, {
      execFileImpl: async (_file, _args, options) => {
        receivedOptions = options;
        const error = new Error('process timed out');
        error.code = 'ETIMEDOUT';
        throw error;
      },
      limits: { ...DEFAULT_FREEZE_LIMITS, larkTimeoutMs: 7 },
    }),
    /timed out after 7ms/,
  );
  assert.equal(receivedOptions.timeout, 7);

  await assert.rejects(
    runLarkCli(FEISHU_CHILDREN_ARGS, {
      execFileImpl: async () => ({
        stdout: `{"ok":true,"data":{"value":"${'x'.repeat(100)}"}}`,
        stderr: '',
      }),
      limits: { ...DEFAULT_FREEZE_LIMITS, maxLarkStdoutBytes: 16 },
    }),
    /stdout byte limit/i,
  );
});

test('manifest validation fails closed on partial or incomplete snapshots', () => {
  assert.doesNotThrow(() => validatePrimaryReferenceManifest(manifestFixture()));
  assert.throws(
    () => validatePrimaryReferenceManifest(manifestFixture({
      javaGuideFailures: [{ url: 'https://javaguide.cn/ai/fail', error: 'network down' }],
    })),
    /zero failures/,
  );
  assert.throws(
    () => validatePrimaryReferenceManifest(manifestFixture({ javaGuideCount: 33 })),
    /34 JavaGuide/,
  );
  assert.throws(
    () => validatePrimaryReferenceManifest(manifestFixture({ feishuCount: 15 })),
    /16 Feishu/,
  );
  const missingRoot = manifestFixture();
  missingRoot.javaGuide.articles[0] = {
    ...missingRoot.javaGuide.articles[0],
    canonicalUrl: 'https://javaguide.cn/ai/missing-root.html',
  };
  assert.throws(
    () => validatePrimaryReferenceManifest(missingRoot),
    /JavaGuide root/,
  );
});

test('freezer rejects caller-controlled output targets before touching storage', async () => {
  for (const outputDirectory of [
    new URL('../', import.meta.url),
    pathToFileURL(`${homedir()}/`),
    new URL('file:///tmp/arbitrary-primary-reference-target/'),
  ]) {
    await assert.rejects(
      freezePrimaryReferences({ outputDirectory }),
      /Unsupported freeze option: outputDirectory/,
    );
  }
});

test('failed staged freeze preserves an isolated prior canonical cache', async (t) => {
  const cache = await createIsolatedCache(t);
  const before = '{"fixture":"prior canonical snapshot"}\n';
  await cache.seedCanonical(before);
  await assert.rejects(
    freezePrimaryReferences({
      filesystem: cache.filesystem,
      stagingId: '0123456789abcdef0123456789abcdef',
      snapshotBuilder: async () => {
        throw new Error('fixture builder failed');
      },
    }),
    /fixture builder failed/,
  );
  assert.equal(await readFile(cache.canonicalManifest, 'utf8'), before);
});

test('invalid or partial staged manifests never replace an isolated canonical cache', async (t) => {
  const cache = await createIsolatedCache(t);
  const before = '{"fixture":"validated prior snapshot"}\n';
  await cache.seedCanonical(before);
  for (const [stagingId, fixture] of [
    [
      '11111111111111111111111111111111',
      manifestFixture({ javaGuideCount: 33 }),
    ],
    [
      '22222222222222222222222222222222',
      manifestFixture({
        javaGuideFailures: [{
          url: 'https://javaguide.cn/ai/fail',
          error: 'challenge page',
        }],
      }),
    ],
  ]) {
    await assert.rejects(
      freezePrimaryReferences({
        filesystem: cache.filesystem,
        stagingId,
        snapshotBuilder: async () => ({
          feishu: fixture.feishu,
          javaGuide: fixture.javaGuide,
        }),
      }),
      /34 JavaGuide|zero failures/,
    );
    assert.equal(await readFile(cache.canonicalManifest, 'utf8'), before);
  }
});

test('failed freeze does not require or create a canonical private cache', async (t) => {
  const cache = await createIsolatedCache(t);
  await assert.rejects(
    freezePrimaryReferences({
      filesystem: cache.filesystem,
      stagingId: '33333333333333333333333333333333',
      snapshotBuilder: async () => {
        throw new Error('clean-checkout failure');
      },
    }),
    /clean-checkout failure/,
  );
  await assert.rejects(readFile(cache.canonicalManifest, 'utf8'), /ENOENT/);
});

test('backup cleanup failure warns while keeping the promoted cache active', async (t) => {
  const cache = await createIsolatedCache(t);
  await cache.seedCanonical('{"fixture":"prior snapshot retained as backup"}\n');
  const stagingId = '55555555555555555555555555555555';
  const backupDirectory = new URL(
    `.primary-references-backup-${stagingId}/`,
    PRIMARY_REFERENCE_CACHE_ROOT,
  );
  const warnings = [];
  const filesystem = {
    ...cache.filesystem,
    rm: async (target, options) => {
      if (basename(fileURLToPath(target)).startsWith('.primary-references-backup-')) {
        throw new Error('simulated backup cleanup failure');
      }
      return cache.filesystem.rm(target, options);
    },
  };
  const fixture = manifestFixture();

  const promoted = await freezePrimaryReferences({
    filesystem,
    onWarning: (warning) => warnings.push(warning),
    stagingId,
    snapshotBuilder: async () => ({
      feishu: fixture.feishu,
      javaGuide: fixture.javaGuide,
    }),
  });

  assert.equal(promoted.totals.sources, 50);
  assert.equal(JSON.parse(await readFile(cache.canonicalManifest, 'utf8')).totals.sources, 50);
  assert.deepEqual(warnings, [
    'Primary reference cache promoted, but prior backup cleanup failed: simulated backup cleanup failure',
  ]);
  await assert.doesNotReject(stat(cache.mapTarget(backupDirectory)));
});

test('manifest collections serialize deterministically regardless of discovery order', () => {
  const original = manifestFixture();
  original.feishu.failures = [
    { nodeToken: 'Z00000000000000000000000000', error: 'z' },
    { nodeToken: 'B00000000000000000000000000', error: 'b' },
  ];
  original.javaGuide.redirects = [
    { from: 'https://javaguide.cn/ai/z', to: 'https://javaguide.cn/ai/a', status: 200 },
    { from: 'https://javaguide.cn/ai/b', to: 'https://javaguide.cn/ai/c', status: 200 },
  ];
  original.javaGuide.failures = [
    { url: 'https://javaguide.cn/ai/z', error: 'z' },
    { url: 'https://javaguide.cn/ai/a', error: 'a' },
  ];
  const reversed = structuredClone(original);
  reversed.feishu.documents.reverse();
  reversed.feishu.failures.reverse();
  reversed.javaGuide.articles.reverse();
  reversed.javaGuide.redirects.reverse();
  reversed.javaGuide.failures.reverse();
  reversed.javaGuide.visitedRoutes.reverse();

  assert.equal(
    JSON.stringify(sortManifestCollections(original)),
    JSON.stringify(sortManifestCollections(reversed)),
  );
  assert.notEqual(original.feishu.documents[0], original.feishu.documents.at(-1));
});

test('Feishu nodes are sorted before deterministic document retrieval', () => {
  const nodes = [
    { node_token: 'Z00000000000000000000000000' },
    { node_token: 'A00000000000000000000000000' },
  ];
  assert.deepEqual(
    sortFeishuNodes(nodes).map(({ node_token: token }) => token),
    [
      'A00000000000000000000000000',
      'Z00000000000000000000000000',
    ],
  );
  assert.equal(nodes[0].node_token, 'Z00000000000000000000000000');
});

test('safe generated snapshot and inventory are deterministic and detect drift', async () => {
  const reversedManifest = manifestFromSafeSnapshot();
  reversedManifest.feishu.documents.reverse();
  reversedManifest.javaGuide.articles.reverse();
  const generated = createSafePrimaryReferenceSnapshot(
    reversedManifest,
    primaryReferenceAnnotations,
  );
  assert.deepEqual(generated, primaryReferenceSnapshot);

  const rendered = renderSafePrimaryReferenceSnapshot(generated);
  assert.doesNotThrow(() => (
    assertGeneratedArtifactCurrent(rendered, rendered, 'fixture')
  ));
  assert.throws(
    () => assertGeneratedArtifactCurrent(
      rendered.replace(generated[0].contentHash, `sha256:${'0'.repeat(64)}`),
      rendered,
      'fixture',
    ),
    /drift detected/,
  );
  assert.throws(
    () => assertGeneratedArtifactCurrent(
      rendered.replace(
        generated[0].limitations,
        'tampered human-curated limitation',
      ),
      rendered,
      'fixture',
    ),
    /drift detected/,
  );
  const curatedTamper = structuredClone(generated);
  curatedTamper[0].limitations = 'tampered in both generated outputs';
  assert.throws(
    () => assertGeneratedArtifactCurrent(
      renderSafePrimaryReferenceSnapshot(curatedTamper),
      rendered,
      'tampered snapshot fixture',
    ),
    /drift detected/,
  );
  assert.throws(
    () => assertGeneratedArtifactCurrent(
      renderInventoryTable(curatedTamper),
      renderInventoryTable(generated),
      'tampered inventory fixture',
    ),
    /drift detected/,
  );

  const inventoryUrl = new URL(
    '../docs/research/2026-07-30-primary-reference-inventory.md',
    import.meta.url,
  );
  const inventory = await readFile(inventoryUrl, 'utf8');
  assert.equal(
    replaceInventoryTable(inventory, renderInventoryTable(generated)),
    inventory,
  );

  const serialized = JSON.stringify(primaryReferenceSnapshot);
  for (const privateField of [
    'rawBody',
    'rawBodyPath',
    'nodeToken',
    'objectToken',
    'documentId',
    'mediaCandidates',
  ]) {
    assert.doesNotMatch(serialized, new RegExp(`"${privateField}"`));
  }
});

test('curated annotations are independent, complete, unique and source-covered', () => {
  const manifest = manifestFromSafeSnapshot();
  assert.equal(Object.keys(PRIMARY_REFERENCE_IDENTITY_RULES).length, 2);
  assert.doesNotThrow(() => (
    validatePrimaryReferenceAnnotations(primaryReferenceAnnotations, manifest)
  ));
  assertDeepFrozen(primaryReferenceAnnotations, 'primaryReferenceAnnotations');
  assertDeepFrozen(PRIMARY_REFERENCE_IDENTITY_RULES, 'PRIMARY_REFERENCE_IDENTITY_RULES');

  assert.throws(
    () => validatePrimaryReferenceAnnotations(
      primaryReferenceAnnotations.slice(0, -1),
      manifest,
    ),
    /Expected exactly 50 curated annotations.*primary-reference-annotations\.mjs/,
  );
  assert.throws(
    () => validatePrimaryReferenceAnnotations([
      ...primaryReferenceAnnotations,
      {
        id: 'primary-javaguide-extra',
        canonicalUrl: 'https://javaguide.cn/ai/extra.html',
        moduleCandidates: ['agent-harness'],
        limitations: 'Fixture limitation with enough detail to satisfy validation.',
      },
    ], manifest),
    /Expected exactly 50 curated annotations.*primary-reference-annotations\.mjs/,
  );

  const duplicateId = structuredClone(primaryReferenceAnnotations);
  duplicateId[1].id = duplicateId[0].id;
  assert.throws(
    () => validatePrimaryReferenceAnnotations(duplicateId, manifest),
    /Duplicate curated annotation ID/,
  );
  const duplicateUrl = structuredClone(primaryReferenceAnnotations);
  duplicateUrl[1].canonicalUrl = duplicateUrl[0].canonicalUrl;
  assert.throws(
    () => validatePrimaryReferenceAnnotations(duplicateUrl, manifest),
    /Duplicate curated annotation URL/,
  );

  const changedManifest = structuredClone(manifest);
  changedManifest.javaGuide.articles[0].canonicalUrl = 'https://javaguide.cn/ai/new-route.html';
  assert.throws(
    () => validatePrimaryReferenceAnnotations(primaryReferenceAnnotations, changedManifest),
    /manifest source has no curated annotation.*primary-reference-annotations\.mjs/i,
  );
  const changedAnnotation = structuredClone(primaryReferenceAnnotations);
  changedAnnotation[0].canonicalUrl = 'https://example.com/wiki/changed';
  assert.throws(
    () => validatePrimaryReferenceAnnotations(changedAnnotation, manifest),
    /stable URL identity rule/,
  );
});

test('generated snapshot is deeply immutable before canonical registry import', () => {
  const snapshotUrl = new URL(
    '../src/data/primary-reference-snapshot.generated.js',
    import.meta.url,
  ).href;
  const registryUrl = new URL('../src/data/primary-references.js', import.meta.url).href;
  const script = `
    import assert from 'node:assert/strict';
    const { primaryReferenceSnapshot } = await import(${JSON.stringify(snapshotUrl)});
    const expectedTitle = primaryReferenceSnapshot[0].title;
    const expectedModule = primaryReferenceSnapshot[0].moduleCandidates[0];
    assert.throws(() => {
      primaryReferenceSnapshot[0].title = 'poisoned before registry import';
    }, TypeError);
    assert.throws(() => {
      primaryReferenceSnapshot[0].moduleCandidates[0] = 'poisoned-module';
    }, TypeError);
    assert.throws(() => {
      primaryReferenceSnapshot.push({});
    }, TypeError);
    const { primaryReferences } = await import(${JSON.stringify(registryUrl)});
    assert.equal(primaryReferences[0].title, expectedTitle);
    assert.equal(primaryReferenceSnapshot[0].moduleCandidates[0], expectedModule);
    process.stdout.write('immutable-before-import');
  `;
  assert.equal(
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      encoding: 'utf8',
    }),
    'immutable-before-import',
  );
  assertDeepFrozen(primaryReferenceSnapshot, 'primaryReferenceSnapshot');
});

test('private cache is ignored and no private body or access token is tracked', async () => {
  const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(gitignore, /^\.research-cache\/$/m);

  const repository = new URL('..', import.meta.url);
  const ignored = execFileSync(
    'git',
    ['check-ignore', '.research-cache/primary-references/manifest.json'],
    { cwd: repository, encoding: 'utf8' },
  ).trim();
  assert.equal(ignored, '.research-cache/primary-references/manifest.json');

  const tracked = execFileSync('git', ['ls-files'], {
    cwd: repository,
    encoding: 'utf8',
  }).trim().split('\n').filter(Boolean);
  assert.ok(tracked.every((path) => !path.startsWith('.research-cache/')));
  assert.ok(tracked.every((path) => !/\.xml$/i.test(path)));

  const credentialPattern = [
    ['tenant', 'access', 'token'].join('_'),
    ['user', 'access', 'token'].join('_'),
    ['Authorization', 'Bearer'].join(': '),
    't-[a-z]-[A-Za-z0-9_-]{20,}',
  ].join('|');
  let credentialMatches = '';
  try {
    credentialMatches = execFileSync(
      'git',
      [
        'grep',
        '-I',
        '-l',
        '-E',
        credentialPattern,
        '--',
        '.',
        ':!tests/primary-references.test.js',
      ],
      { cwd: repository, encoding: 'utf8' },
    );
  } catch (error) {
    assert.equal(error.status, 1, error.stderr?.toString() || error.message);
  }
  assert.equal(credentialMatches, '');
});

test('research inventory resolves exactly every frozen source and media decision', async () => {
  const markdown = await readFile(
    new URL('../docs/research/2026-07-30-primary-reference-inventory.md', import.meta.url),
    'utf8',
  );
  const rows = parseMarkdownTable(markdown, INVENTORY_COLUMNS);
  const registryById = new Map(primaryReferences.map((source) => [source.id, source]));

  assert.equal(rows.length, 50);
  assert.equal(new Set(rows.map(({ sourceId }) => sourceId)).size, rows.length);
  assert.deepEqual(
    new Set(rows.map(({ sourceId }) => sourceId)),
    new Set(primaryReferences.map(({ id }) => id)),
  );
  for (const row of rows) {
    const source = registryById.get(row.sourceId);
    assert.ok(source, `${row.sourceId}: unknown source`);
    assert.equal(row.title, source.title);
    assert.equal(row.canonicalUrl, source.canonicalUrl);
    assert.equal(row.bodyAccess, source.bodyAccess);
    assert.equal(row.retrievedAt, source.retrievedAt);
    assert.equal(row.updatedAt, source.updatedAt ?? '—');
    assert.equal(row.contentHash, source.contentHash);
    assert.equal(row.permissionDecision, source.mediaDecision);
    assert.match(row.revision, /^(?:\d+|—)$/);
    assert.ok(row.moduleCandidates.length > 0);
    assert.ok(
      row.moduleCandidates.split(',').every((id) => ACTIVE_MODULE_IDS.has(id.trim())),
      `${row.sourceId}: invalid module candidate`,
    );
    assert.match(row.mediaCount, /^(?:0|[1-9]\d*)$/);
    assert.ok(row.permissionEvidence.length >= 20);
    assert.ok(row.limitations.length >= 20);
  }
  assert.equal(
    rows.reduce((sum, { mediaCount }) => sum + Number(mediaCount), 0),
    278,
  );
  assert.match(markdown, /16 Feishu documents, 34 JavaGuide articles/);
  assert.match(markdown, /278 media candidates/);
  assert.match(markdown, /0 redirects and 0 failures/);
});

test('claim matrix uses exact enums and resolves every source to a stable course lesson', async () => {
  const markdown = await readFile(
    new URL('../docs/research/2026-07-30-primary-reference-claim-matrix.md', import.meta.url),
    'utf8',
  );
  const rows = parseMarkdownTable(markdown, CLAIM_COLUMNS);
  const validStatuses = new Set([
    'verified',
    'contested',
    'volatile',
    'license-blocked',
    'source-unavailable',
  ]);
  const validContributions = new Set([
    'adopted',
    'corrected',
    'deepened',
    'rejected',
    'duplicate',
  ]);
  const knownSourceIds = new Set(primaryReferences.map(({ id }) => id));
  const usedSourceIds = new Set();

  assert.ok(rows.length >= 40);
  assert.equal(new Set(rows.map(({ claimId }) => claimId)).size, rows.length);
  for (const row of rows) {
    assert.match(row.claimId, /^claim-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(row.statement.length >= 12);
    assert.ok(validStatuses.has(row.status), `${row.claimId}: invalid status`);
    assert.ok(row.verificationNeed.length >= 8);
    assert.ok(ACTIVE_MODULE_IDS.has(row.moduleId), `${row.claimId}: invalid module`);
    assert.ok(STABLE_LESSON_IDS.has(row.lessonId), `${row.claimId}: invalid lesson`);
    assert.ok(
      courseRegistry[row.moduleId].lessons.some(({ id }) => id === row.lessonId),
      `${row.claimId}: lesson does not belong to module`,
    );
    assert.match(row.plannedSection, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(validContributions.has(row.sourceContribution));
    assert.ok(row.limitations.length >= 12);
    const sourceIds = row.primarySourceIds.split(',').map((id) => id.trim());
    assert.ok(sourceIds.length > 0);
    for (const sourceId of sourceIds) {
      assert.ok(knownSourceIds.has(sourceId), `${row.claimId}: unknown ${sourceId}`);
      usedSourceIds.add(sourceId);
    }
  }
  assert.deepEqual(usedSourceIds, knownSourceIds);
  assert.deepEqual(new Set(rows.map(({ moduleId }) => moduleId)), ACTIVE_MODULE_IDS);
});
