import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const FEISHU_SPACE_ID = '7641116018563255484';
const FEISHU_ROOT_NODE_TOKEN = 'L082wubkdie8uMkRUjgceKYQnIe';
const FEISHU_ROOT_OBJECT_TOKEN = 'PO6ndV82oorjtTxPkRacq7f6nch';
const FEISHU_ROOT_TITLE = 'Harness 101 🔥🔥🔥';
const FEISHU_ROOT_URL = `https://my.feishu.cn/wiki/${FEISHU_ROOT_NODE_TOKEN}`;
const JAVA_GUIDE_ROOT = 'https://javaguide.cn/ai/';
const OUTPUT_DIRECTORY = new URL('../.research-cache/primary-references/', import.meta.url);

export const FEISHU_CHILDREN_ARGS = Object.freeze([
  'wiki',
  '+node-list',
  '--space-id',
  FEISHU_SPACE_ID,
  '--parent-node-token',
  FEISHU_ROOT_NODE_TOKEN,
  '--page-all',
  '--page-limit',
  '30',
  '--as',
  'user',
  '--format',
  'json',
]);

export const FEISHU_DOCUMENT_ARGS = (nodeToken) => [
  'docs',
  '+fetch',
  '--doc',
  nodeToken,
  '--detail',
  'simple',
  '--format',
  'json',
];

export function normalizeSourceText(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Source body must be a string');
  }
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

export function hashSourceText(value) {
  return `sha256:${createHash('sha256')
    .update(normalizeSourceText(value))
    .digest('hex')}`;
}

export function canonicalizeJavaGuideUrl(value, base = JAVA_GUIDE_ROOT) {
  try {
    const url = new URL(value, base);
    url.search = '';
    url.hash = '';
    if (
      url.origin !== 'https://javaguide.cn'
      || !url.pathname.startsWith('/ai/')
      || url.pathname.startsWith('/ai-coding/')
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function parseLarkEnvelope(stdout) {
  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) {
    throw new TypeError('lark-cli did not return valid JSON');
  }
  let envelope;
  try {
    envelope = JSON.parse(stdout.slice(jsonStart));
  } catch (error) {
    throw new TypeError(`lark-cli did not return valid JSON: ${error.message}`);
  }
  if (envelope?.ok !== true) {
    const detail = envelope?.error?.message
      ?? envelope?.message
      ?? envelope?.error?.code
      ?? 'ok was not true';
    throw new Error(`lark-cli rejected response: ${detail}`);
  }
  return envelope.data;
}

function decodeHtmlText(value) {
  const entities = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['quot', '"'],
  ]);
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => entities.get(name.toLowerCase()) ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(
    `\\b${name}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
    'i',
  ));
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function extractHtmlTitle(html, canonicalUrl) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlText(match[1]) : canonicalUrl;
}

function extractCanonicalLink(html, responseUrl) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = extractAttribute(tag, 'rel');
    const href = extractAttribute(tag, 'href');
    if (!rel || !href || !rel.toLowerCase().split(/\s+/).includes('canonical')) continue;
    return canonicalizeJavaGuideUrl(href, responseUrl);
  }
  return null;
}

function extractJavaGuideLinks(html, responseUrl) {
  const links = [];
  const seen = new Set();
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = extractAttribute(match[0], 'href');
    const canonicalUrl = href
      ? canonicalizeJavaGuideUrl(href.replaceAll('&amp;', '&'), responseUrl)
      : null;
    if (!canonicalUrl || seen.has(canonicalUrl)) continue;
    seen.add(canonicalUrl);
    links.push(canonicalUrl);
  }
  return links;
}

function dateOnly(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/\b(20\d{2}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function extractJavaGuideUpdatedAt(html, headers) {
  const candidateNames = new Set([
    'article:modified_time',
    'date',
    'dateModified',
    'last-modified',
    'lastUpdated',
  ]);
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const name = extractAttribute(tag, 'property')
      ?? extractAttribute(tag, 'name')
      ?? extractAttribute(tag, 'itemprop');
    const content = extractAttribute(tag, 'content');
    if (name && candidateNames.has(name) && dateOnly(content)) return dateOnly(content);
  }
  for (const match of html.matchAll(/<time\b[^>]*>/gi)) {
    const datetime = extractAttribute(match[0], 'datetime');
    if (dateOnly(datetime)) return dateOnly(datetime);
  }
  return dateOnly(headers?.get?.('last-modified'));
}

function extractHtmlMedia(html, responseUrl) {
  return [...html.matchAll(/<(?:img|video|audio|source)\b[^>]*>/gi)].map((match) => {
    const tag = match[0];
    const rawUrl = extractAttribute(tag, 'src')
      ?? extractAttribute(tag, 'data-src')
      ?? extractAttribute(tag, 'srcset');
    let sourceUrl = rawUrl;
    if (rawUrl) {
      try {
        sourceUrl = new URL(rawUrl.split(/\s+/)[0], responseUrl).href;
      } catch {
        sourceUrl = rawUrl;
      }
    }
    return {
      tagName: tag.match(/^<([a-z]+)/i)?.[1].toLowerCase() ?? 'media',
      sourceUrl: sourceUrl ?? null,
      alt: extractAttribute(tag, 'alt'),
    };
  });
}

function extractFeishuMedia(content) {
  return [...content.matchAll(/<(?:img|video|audio|file|media)\b[^>]*>/gi)].map((match) => {
    const tag = match[0];
    return {
      tagName: tag.match(/^<([a-z]+)/i)?.[1].toLowerCase() ?? 'media',
      token: extractAttribute(tag, 'token'),
      source: extractAttribute(tag, 'src'),
      alt: extractAttribute(tag, 'alt'),
    };
  });
}

function javaGuideRawFilename(canonicalUrl) {
  const url = new URL(canonicalUrl);
  const slug = url.pathname
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'ai';
  const suffix = createHash('sha256').update(canonicalUrl).digest('hex').slice(0, 12);
  return `${slug}-${suffix}.html`;
}

export async function crawlJavaGuide({
  fetchImpl = fetch,
  rootUrl = JAVA_GUIDE_ROOT,
} = {}) {
  const canonicalRoot = canonicalizeJavaGuideUrl(rootUrl);
  if (!canonicalRoot) throw new TypeError(`Invalid JavaGuide root: ${rootUrl}`);

  const queue = [canonicalRoot];
  const queued = new Set(queue);
  const visited = new Set();
  const articlesByCanonicalUrl = new Map();
  const redirects = [];
  const failures = [];

  while (queue.length > 0) {
    const requestedUrl = queue.shift();
    if (visited.has(requestedUrl)) continue;
    visited.add(requestedUrl);

    let response;
    try {
      response = await fetchImpl(requestedUrl, {
        redirect: 'follow',
        headers: {
          'user-agent': 'Agent-Learner primary-reference freezer',
        },
      });
    } catch (error) {
      failures.push({
        url: requestedUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    const responseUrl = canonicalizeJavaGuideUrl(response.url || requestedUrl);
    if (response.redirected || responseUrl !== requestedUrl) {
      redirects.push({
        from: requestedUrl,
        to: responseUrl ?? response.url,
        status: response.status,
      });
    }
    if (!responseUrl) {
      failures.push({
        url: requestedUrl,
        status: response.status,
        error: `Redirected outside JavaGuide /ai/: ${response.url}`,
      });
      continue;
    }
    if (!response.ok) {
      failures.push({
        url: requestedUrl,
        status: response.status,
        error: `HTTP ${response.status}`,
      });
      continue;
    }

    let body;
    try {
      body = normalizeSourceText(await response.text());
    } catch (error) {
      failures.push({
        url: requestedUrl,
        status: response.status,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    for (const linkedUrl of extractJavaGuideLinks(body, responseUrl)) {
      if (queued.has(linkedUrl)) continue;
      queued.add(linkedUrl);
      queue.push(linkedUrl);
    }

    const canonicalUrl = extractCanonicalLink(body, responseUrl) ?? responseUrl;
    if (!articlesByCanonicalUrl.has(canonicalUrl)) {
      const mediaCandidates = extractHtmlMedia(body, canonicalUrl);
      articlesByCanonicalUrl.set(canonicalUrl, {
        requestedUrl,
        canonicalUrl,
        status: response.status,
        title: extractHtmlTitle(body, canonicalUrl),
        bodyAccess: 'full',
        updatedAt: extractJavaGuideUpdatedAt(body, response.headers),
        contentHash: hashSourceText(body),
        mediaCandidates,
        mediaCount: mediaCandidates.length,
        rawBody: body,
      });
    }
  }

  return {
    articles: [...articlesByCanonicalUrl.values()],
    redirects,
    failures,
    visitedRoutes: [...visited],
  };
}

async function runLarkCli(args) {
  try {
    const { stdout } = await execFileAsync('lark-cli', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return parseLarkEnvelope(stdout);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('lark-cli is not installed or not available on PATH');
    }
    const detail = error?.stderr?.trim() || error?.message || String(error);
    throw new Error(`lark-cli ${args.slice(0, 2).join(' ')} failed: ${detail}`);
  }
}

async function freezeFeishu(outputDirectory, retrievedAt) {
  const childrenData = await runLarkCli(FEISHU_CHILDREN_ARGS);
  const children = childrenData?.nodes;
  if (!Array.isArray(children)) {
    throw new TypeError('lark-cli wiki node-list response did not contain data.nodes');
  }
  if (children.length !== 15) {
    throw new Error(`Expected 15 direct Feishu children, received ${children.length}`);
  }
  const childTokens = new Set();
  for (const child of children) {
    if (
      child?.parent_node_token !== FEISHU_ROOT_NODE_TOKEN
      || child?.has_child !== false
      || typeof child?.node_token !== 'string'
      || childTokens.has(child.node_token)
    ) {
      throw new Error(`Invalid Feishu child node metadata: ${child?.node_token ?? 'unknown'}`);
    }
    childTokens.add(child.node_token);
  }

  const nodes = [
    {
      node_token: FEISHU_ROOT_NODE_TOKEN,
      obj_token: FEISHU_ROOT_OBJECT_TOKEN,
      title: FEISHU_ROOT_TITLE,
      isRoot: true,
    },
    ...children,
  ];
  const rawDirectory = new URL('./feishu/', outputDirectory);
  await mkdir(rawDirectory, { recursive: true });

  const documents = [];
  const failures = [];
  for (const node of nodes) {
    try {
      const data = await runLarkCli(FEISHU_DOCUMENT_ARGS(node.node_token));
      const document = data?.document;
      if (!document || typeof document.content !== 'string') {
        throw new TypeError('response did not contain data.document.content');
      }
      const body = normalizeSourceText(document.content);
      const mediaCandidates = extractFeishuMedia(body);
      const rawFilename = `${node.node_token}.xml`;
      await writeFile(new URL(rawFilename, rawDirectory), `${body}\n`, 'utf8');
      documents.push({
        nodeToken: node.node_token,
        objectToken: node.obj_token ?? document.document_id ?? null,
        documentId: document.document_id ?? null,
        revision: document.revision_id ?? null,
        title: node.title,
        canonicalUrl: `https://my.feishu.cn/wiki/${node.node_token}`,
        isRoot: node.isRoot === true,
        bodyAccess: 'full',
        retrievedAt,
        updatedAt: null,
        contentHash: hashSourceText(body),
        mediaCandidates,
        mediaCount: mediaCandidates.length,
        rawBodyPath: `feishu/${rawFilename}`,
      });
    } catch (error) {
      failures.push({
        nodeToken: node.node_token,
        canonicalUrl: `https://my.feishu.cn/wiki/${node.node_token}`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (failures.length > 0) {
    throw new Error(`Failed to freeze ${failures.length} Feishu document(s): ${JSON.stringify(failures)}`);
  }

  return {
    accessResult: 'ok',
    rootUrl: FEISHU_ROOT_URL,
    spaceId: FEISHU_SPACE_ID,
    expectedDirectLeafChildren: 15,
    discoveredDirectLeafChildren: children.length,
    documents,
    failures,
  };
}

async function freezeJavaGuide(outputDirectory, retrievedAt) {
  const crawl = await crawlJavaGuide();
  const rawDirectory = new URL('./javaguide/', outputDirectory);
  await mkdir(rawDirectory, { recursive: true });

  const articles = [];
  for (const article of crawl.articles) {
    const rawFilename = javaGuideRawFilename(article.canonicalUrl);
    await writeFile(new URL(rawFilename, rawDirectory), `${article.rawBody}\n`, 'utf8');
    const { rawBody, ...metadata } = article;
    articles.push({
      ...metadata,
      retrievedAt,
      rawBodyPath: `javaguide/${rawFilename}`,
    });
  }

  return {
    accessResult: crawl.failures.length === 0 ? 'ok' : 'partial',
    rootUrl: JAVA_GUIDE_ROOT,
    visitedRouteCount: crawl.visitedRoutes.length,
    articles,
    redirects: crawl.redirects,
    failures: crawl.failures,
  };
}

export async function freezePrimaryReferences({
  outputDirectory = OUTPUT_DIRECTORY,
  clock = () => new Date(),
} = {}) {
  const startedAt = clock();
  const retrievedAt = startedAt.toISOString().slice(0, 10);
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  const [feishu, javaGuide] = await Promise.all([
    freezeFeishu(outputDirectory, retrievedAt),
    freezeJavaGuide(outputDirectory, retrievedAt),
  ]);
  const manifest = {
    schemaVersion: 1,
    frozenAt: startedAt.toISOString(),
    retrievedAt,
    policy: {
      rawBodiesCommitted: false,
      feishuMediaDecision: 'permission-review-required',
      javaGuideMediaDecision: 'asset-level-review-required',
    },
    feishu,
    javaGuide,
    totals: {
      sources: feishu.documents.length + javaGuide.articles.length,
      feishuDocuments: feishu.documents.length,
      javaGuideArticles: javaGuide.articles.length,
      mediaCandidates: feishu.documents.reduce((sum, item) => sum + item.mediaCount, 0)
        + javaGuide.articles.reduce((sum, item) => sum + item.mediaCount, 0),
      redirects: javaGuide.redirects.length,
      failures: feishu.failures.length + javaGuide.failures.length,
    },
  };
  await writeFile(
    new URL('./manifest.json', outputDirectory),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  return manifest;
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  try {
    const manifest = await freezePrimaryReferences();
    process.stdout.write(
      `Frozen ${manifest.totals.sources} primary references `
      + `(${manifest.totals.feishuDocuments} Feishu, `
      + `${manifest.totals.javaGuideArticles} JavaGuide); `
      + `${manifest.totals.redirects} redirects, ${manifest.totals.failures} failures.\n`,
    );
  } catch (error) {
    process.stderr.write(`Primary reference freeze failed: ${error.stack ?? error}\n`);
    process.exitCode = 1;
  }
}
