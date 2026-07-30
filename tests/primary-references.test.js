import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  PRIMARY_SOURCE_FAMILIES,
  getPrimaryReference,
  primaryReferences,
} from '../src/data/primary-references.js';
import * as primaryReferenceModule from '../src/data/primary-references.js';
import { createPrimaryReferenceBinding } from '../src/data/primary-reference-bindings.js';
import {
  FEISHU_CHILDREN_ARGS,
  FEISHU_DOCUMENT_ARGS,
  canonicalizeJavaGuideUrl,
  crawlJavaGuide,
  hashSourceText,
  normalizeSourceText,
  parseLarkEnvelope,
} from '../scripts/freeze-primary-references.mjs';

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const PRIMARY_ID = /^primary-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label} must be deeply frozen`);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
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
    creator: source.publisherOrAuthor,
    platform: '飞书',
    language: '中文',
    type: '一级参考资料',
    difficulty: input.difficulty,
    stage: input.stage,
    value: input.value,
    canonicalSourceId: source.id,
    sourceFamily: source.sourceFamily,
    sourceTier: source.sourceTier,
    evidence: input.evidence,
  });
  assert.notEqual(binding.evidence, input.evidence);
  assert.notEqual(binding.evidence.coverage, input.evidence.coverage);
  assertDeepFrozen(binding, 'binding');
  assert.equal(Object.isFrozen(input), false, 'factory must not freeze caller input');
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
      body: '<title>AI</title><a href="/ai/a/?q=1">A</a><a href="/ai/old">Old</a><a href="/ai/fail">Fail</a>',
    }],
    ['https://javaguide.cn/ai/a/', {
      url: 'https://javaguide.cn/ai/a/',
      status: 200,
      body: '<title>A</title><a href="/ai/b#details">B</a>',
    }],
    ['https://javaguide.cn/ai/old', {
      url: 'https://javaguide.cn/ai/new',
      status: 200,
      redirected: true,
      body: '<title>New</title>',
    }],
    ['https://javaguide.cn/ai/b', {
      url: 'https://javaguide.cn/ai/b',
      status: 200,
      body: '<title>B</title>',
    }],
  ]);
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    if (url.endsWith('/fail')) throw new Error('network down');
    const fixture = bodies.get(url);
    return {
      ok: fixture.status >= 200 && fixture.status < 300,
      status: fixture.status,
      url: fixture.url,
      redirected: fixture.redirected ?? false,
      headers: new Headers(),
      text: async () => fixture.body,
    };
  };

  const result = await crawlJavaGuide({ fetchImpl });

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
    'https://javaguide.cn/ai/new',
    'https://javaguide.cn/ai/b',
  ]);
});

test('JavaGuide crawler records an available ISO update date', async () => {
  const body = [
    '<meta property="article:modified_time" content="2026-05-25T00:42:42.000Z">',
    '<title>Dated page</title>',
  ].join('');
  const result = await crawlJavaGuide({
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      url,
      redirected: false,
      headers: new Headers(),
      text: async () => body,
    }),
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
  assert.deepEqual(FEISHU_DOCUMENT_ARGS('node-token'), [
    'docs', '+fetch',
    '--doc', 'node-token',
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

test('private cache is ignored and no private body or access token is tracked', async () => {
  const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(gitignore, /^\.research-cache\/$/m);
});
