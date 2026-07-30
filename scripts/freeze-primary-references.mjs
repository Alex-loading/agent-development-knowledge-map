import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  mkdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import {
  basename,
  dirname,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const FEISHU_SPACE_ID = '7641116018563255484';
const FEISHU_ROOT_NODE_TOKEN = 'L082wubkdie8uMkRUjgceKYQnIe';
const FEISHU_ROOT_OBJECT_TOKEN = 'PO6ndV82oorjtTxPkRacq7f6nch';
const FEISHU_ROOT_TITLE = 'Harness 101 🔥🔥🔥';
const FEISHU_ROOT_URL = `https://my.feishu.cn/wiki/${FEISHU_ROOT_NODE_TOKEN}`;
const FEISHU_NODE_TOKEN = /^[A-Za-z0-9]{27}$/;
const JAVA_GUIDE_ROOT = 'https://javaguide.cn/ai/';
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const STAGING_ID = /^[a-f0-9]{32}$/;

export const PRIMARY_REFERENCE_CACHE_ROOT = new URL('../.research-cache/', import.meta.url);
export const PRIMARY_REFERENCE_CACHE_DIRECTORY = new URL(
  './primary-references/',
  PRIMARY_REFERENCE_CACHE_ROOT,
);

export const DEFAULT_FREEZE_LIMITS = Object.freeze({
  fetchTimeoutMs: 15_000,
  larkTimeoutMs: 30_000,
  maxRoutes: 100,
  maxBodyBytes: 8 * 1024 * 1024,
  maxTotalBytes: 64 * 1024 * 1024,
  maxLarkStdoutBytes: 16 * 1024 * 1024,
});

const DEFAULT_FILESYSTEM = Object.freeze({
  mkdir,
  rename,
  rm,
  stat,
  writeFile,
});

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

function assertFeishuNodeToken(nodeToken) {
  if (typeof nodeToken !== 'string' || !FEISHU_NODE_TOKEN.test(nodeToken)) {
    throw new TypeError('Feishu node token must contain exactly 27 ASCII letters or digits');
  }
  return nodeToken;
}

export const FEISHU_DOCUMENT_ARGS = (nodeToken) => [
  'docs',
  '+fetch',
  '--doc',
  assertFeishuNodeToken(nodeToken),
  '--detail',
  'simple',
  '--format',
  'json',
];

export function resolveFeishuRawBodyUrl(nodeToken, rawDirectory) {
  assertFeishuNodeToken(nodeToken);
  if (!(rawDirectory instanceof URL) || rawDirectory.protocol !== 'file:') {
    throw new TypeError('Feishu raw body directory must be a file URL');
  }
  const rawPath = fileURLToPath(rawDirectory);
  if (basename(resolve(rawPath)) !== 'feishu') {
    throw new TypeError('Feishu raw bodies must stay inside a feishu/ directory');
  }
  const cacheDirectoryPath = dirname(resolve(rawPath));
  const cacheDirectoryName = basename(cacheDirectoryPath);
  const cacheRootPath = dirname(cacheDirectoryPath);
  if (
    pathToFileURL(`${cacheRootPath}${sep}`).href !== PRIMARY_REFERENCE_CACHE_ROOT.href
    || (
      cacheDirectoryName !== 'primary-references'
      && !/^\.primary-references-staging-[a-f0-9]{32}$/.test(cacheDirectoryName)
    )
  ) {
    throw new TypeError('Feishu raw bodies must stay under the managed cache root');
  }
  const candidatePath = resolve(rawPath, `${nodeToken}.xml`);
  const pathFromRawDirectory = relative(resolve(rawPath), candidatePath);
  if (
    pathFromRawDirectory.startsWith(`..${sep}`)
    || pathFromRawDirectory === '..'
    || resolve(dirname(candidatePath)) !== resolve(rawPath)
  ) {
    throw new TypeError('Feishu raw body path escaped the feishu/ directory');
  }
  return pathToFileURL(candidatePath);
}

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

export function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
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
  if (typeof stdout !== 'string') {
    throw new TypeError('lark-cli did not return valid JSON');
  }
  let json = stdout.trim();
  if (!json.startsWith('{')) {
    const banner = json.match(/^Found \d+ node\(s\)\r?\n/);
    if (!banner) {
      throw new TypeError('lark-cli did not return valid JSON or use the known banner');
    }
    json = json.slice(banner[0].length).trim();
  }
  let envelope;
  try {
    envelope = JSON.parse(json);
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
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
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
  const match = value.match(/\b(20\d{2}-\d{2}-\d{2})(?!\d)/);
  return match && isValidCalendarDate(match[1]) ? match[1] : null;
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

function validateJavaGuideHtml(html, responseUrl) {
  const structuralChecks = [
    /<!doctype\s+html/i,
    /<html\b/i,
    /<head\b/i,
    /<\/head>/i,
    /<body\b/i,
    /<\/body>/i,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
  ];
  if (structuralChecks.some((pattern) => !pattern.test(html))) {
    throw new Error(`Invalid JavaGuide HTML structure: ${responseUrl}`);
  }
  const canonicalUrl = extractCanonicalLink(html, responseUrl);
  if (!canonicalUrl) {
    throw new Error(`Invalid JavaGuide canonical link: ${responseUrl}`);
  }
  const title = extractHtmlTitle(html, responseUrl);
  if (
    /just a moment|attention required|access denied|service unavailable|captcha/i.test(title)
    || /checking your browser|cf-chl-|cloudflare ray id|captcha-container/i.test(html)
  ) {
    throw new Error(`JavaGuide challenge or error page detected: ${responseUrl}`);
  }
  return canonicalUrl;
}

function validateLimits(limits) {
  const merged = { ...DEFAULT_FREEZE_LIMITS, ...limits };
  for (const [name, value] of Object.entries(merged)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`${name} must be a positive safe integer`);
    }
  }
  return Object.freeze(merged);
}

class JavaGuideAggregateByteLimitError extends Error {}

function aggregateByteLimitError(limit) {
  return new JavaGuideAggregateByteLimitError(
    `JavaGuide total byte limit exceeded: ${limit}`,
  );
}

async function readResponseTextWithinLimit(response, limits, remainingTotalBytes) {
  if (remainingTotalBytes <= 0) throw aggregateByteLimitError(limits.maxTotalBytes);
  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > remainingTotalBytes) {
    throw aggregateByteLimitError(limits.maxTotalBytes);
  }
  if (Number.isFinite(declaredLength) && declaredLength > limits.maxBodyBytes) {
    throw new Error(
      `JavaGuide body byte limit exceeded: ${declaredLength} > ${limits.maxBodyBytes}`,
    );
  }
  if (response.body?.getReader) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let byteCount = 0;
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteCount += value.byteLength;
      if (byteCount > remainingTotalBytes) {
        await reader.cancel();
        throw aggregateByteLimitError(limits.maxTotalBytes);
      }
      if (byteCount > limits.maxBodyBytes) {
        await reader.cancel();
        throw new Error(`JavaGuide body byte limit exceeded: > ${limits.maxBodyBytes}`);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { text, byteCount };
  }
  const text = await response.text();
  const byteCount = Buffer.byteLength(text, 'utf8');
  if (byteCount > remainingTotalBytes) {
    throw aggregateByteLimitError(limits.maxTotalBytes);
  }
  if (byteCount > limits.maxBodyBytes) {
    throw new Error(`JavaGuide body byte limit exceeded: ${byteCount} > ${limits.maxBodyBytes}`);
  }
  return { text, byteCount };
}

export async function crawlJavaGuide({
  fetchImpl = fetch,
  rootUrl = JAVA_GUIDE_ROOT,
  allowPartial = false,
  limits: limitOverrides,
  timeoutSignalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
} = {}) {
  const limits = validateLimits(limitOverrides);
  const canonicalRoot = canonicalizeJavaGuideUrl(rootUrl);
  if (!canonicalRoot) throw new TypeError(`Invalid JavaGuide root: ${rootUrl}`);

  const queue = [canonicalRoot];
  const queued = new Set(queue);
  const visited = new Set();
  const articlesByCanonicalUrl = new Map();
  const redirects = [];
  const failures = [];
  let totalBytes = 0;

  while (queue.length > 0) {
    const requestedUrl = queue.shift();
    if (visited.has(requestedUrl)) continue;
    if (visited.size >= limits.maxRoutes) {
      throw new Error(`JavaGuide route limit exceeded: ${limits.maxRoutes}`);
    }
    visited.add(requestedUrl);

    try {
      const signal = timeoutSignalFactory(limits.fetchTimeoutMs);
      const response = await fetchImpl(requestedUrl, {
        redirect: 'follow',
        headers: {
          'user-agent': 'Agent-Learner primary-reference freezer',
        },
        signal,
      });
      const responseUrl = canonicalizeJavaGuideUrl(response.url || requestedUrl);
      if (response.redirected || responseUrl !== requestedUrl) {
        redirects.push({
          from: requestedUrl,
          to: responseUrl ?? response.url,
          status: response.status,
        });
      }
      if (!responseUrl) {
        throw new Error(`Redirected outside JavaGuide /ai/: ${response.url}`);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers?.get?.('content-type') ?? '';
      if (!/^text\/html(?:;|$)/i.test(contentType.trim())) {
        throw new Error(`Unexpected JavaGuide content-type: ${contentType || 'missing'}`);
      }
      const responseBody = await readResponseTextWithinLimit(
        response,
        limits,
        limits.maxTotalBytes - totalBytes,
      );
      totalBytes += responseBody.byteCount;
      const body = normalizeSourceText(responseBody.text);
      const canonicalUrl = validateJavaGuideHtml(body, responseUrl);

      for (const linkedUrl of extractJavaGuideLinks(body, responseUrl)) {
        if (queued.has(linkedUrl)) continue;
        if (queued.size >= limits.maxRoutes) {
          throw new Error(`JavaGuide route limit exceeded: ${limits.maxRoutes}`);
        }
        queued.add(linkedUrl);
        queue.push(linkedUrl);
      }

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
    } catch (error) {
      if (error instanceof JavaGuideAggregateByteLimitError) throw error;
      failures.push({
        url: requestedUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const result = {
    articles: [...articlesByCanonicalUrl.values()]
      .sort((left, right) => left.canonicalUrl.localeCompare(right.canonicalUrl)),
    redirects: redirects.sort((left, right) => left.from.localeCompare(right.from)),
    failures: failures.sort((left, right) => left.url.localeCompare(right.url)),
    visitedRoutes: [...visited].sort(),
  };
  if (result.failures.length > 0 && !allowPartial) {
    throw new Error(
      `JavaGuide crawl failed closed with ${result.failures.length} failure(s): `
      + JSON.stringify(result.failures),
    );
  }
  return result;
}

export async function runLarkCli(args, {
  execFileImpl = execFileAsync,
  limits: limitOverrides,
} = {}) {
  const limits = validateLimits(limitOverrides);
  try {
    const { stdout } = await execFileImpl('lark-cli', args, {
      encoding: 'utf8',
      maxBuffer: limits.maxLarkStdoutBytes,
      timeout: limits.larkTimeoutMs,
    });
    if (Buffer.byteLength(stdout, 'utf8') > limits.maxLarkStdoutBytes) {
      throw new Error(
        `lark-cli stdout byte limit exceeded: ${limits.maxLarkStdoutBytes}`,
      );
    }
    return parseLarkEnvelope(stdout);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('lark-cli is not installed or not available on PATH');
    }
    if (error?.code === 'ETIMEDOUT' || error?.killed === true) {
      throw new Error(`lark-cli timed out after ${limits.larkTimeoutMs}ms`);
    }
    const detail = error?.stderr?.trim() || error?.message || String(error);
    throw new Error(`lark-cli ${args.slice(0, 2).join(' ')} failed: ${detail}`);
  }
}

export function sortFeishuNodes(nodes) {
  if (!Array.isArray(nodes)) throw new TypeError('Feishu nodes must be an array');
  return [...nodes].sort((left, right) => (
    String(left?.node_token ?? '').localeCompare(String(right?.node_token ?? ''))
  ));
}

async function freezeFeishu(outputDirectory, retrievedAt, {
  filesystem,
  execFileImpl,
  limits,
}) {
  const childrenData = await runLarkCli(FEISHU_CHILDREN_ARGS, { execFileImpl, limits });
  const children = childrenData?.nodes;
  if (!Array.isArray(children)) {
    throw new TypeError('lark-cli wiki node-list response did not contain data.nodes');
  }
  if (children.length !== 15) {
    throw new Error(`Expected 15 direct Feishu children, received ${children.length}`);
  }
  const childTokens = new Set();
  for (const child of children) {
    assertFeishuNodeToken(child?.node_token);
    if (
      child.parent_node_token !== FEISHU_ROOT_NODE_TOKEN
      || child.has_child !== false
      || childTokens.has(child.node_token)
    ) {
      throw new Error(`Invalid Feishu child node metadata: ${child.node_token}`);
    }
    childTokens.add(child.node_token);
  }

  const nodes = sortFeishuNodes([
    {
      node_token: FEISHU_ROOT_NODE_TOKEN,
      obj_token: FEISHU_ROOT_OBJECT_TOKEN,
      title: FEISHU_ROOT_TITLE,
      isRoot: true,
    },
    ...children,
  ]);
  const rawDirectory = new URL('./feishu/', outputDirectory);
  await filesystem.mkdir(rawDirectory, { recursive: true });

  const documents = [];
  const failures = [];
  for (const node of nodes) {
    try {
      const data = await runLarkCli(FEISHU_DOCUMENT_ARGS(node.node_token), {
        execFileImpl,
        limits,
      });
      const document = data?.document;
      if (!document || typeof document.content !== 'string') {
        throw new TypeError('response did not contain data.document.content');
      }
      const bodyBytes = Buffer.byteLength(document.content, 'utf8');
      if (bodyBytes > limits.maxBodyBytes) {
        throw new Error(`Feishu body byte limit exceeded: ${bodyBytes} > ${limits.maxBodyBytes}`);
      }
      const body = normalizeSourceText(document.content);
      const mediaCandidates = extractFeishuMedia(body);
      const rawBodyUrl = resolveFeishuRawBodyUrl(node.node_token, rawDirectory);
      await filesystem.writeFile(rawBodyUrl, `${body}\n`, 'utf8');
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
        rawBodyPath: `feishu/${node.node_token}.xml`,
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
    throw new Error(
      `Failed to freeze ${failures.length} Feishu document(s): ${JSON.stringify(failures)}`,
    );
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

async function freezeJavaGuide(outputDirectory, retrievedAt, {
  filesystem,
  fetchImpl,
  limits,
  timeoutSignalFactory,
}) {
  const crawl = await crawlJavaGuide({
    fetchImpl,
    limits,
    timeoutSignalFactory,
  });
  const rawDirectory = new URL('./javaguide/', outputDirectory);
  await filesystem.mkdir(rawDirectory, { recursive: true });

  const articles = [];
  for (const article of crawl.articles) {
    const rawFilename = javaGuideRawFilename(article.canonicalUrl);
    await filesystem.writeFile(
      new URL(rawFilename, rawDirectory),
      `${article.rawBody}\n`,
      'utf8',
    );
    const { rawBody, ...metadata } = article;
    articles.push({
      ...metadata,
      retrievedAt,
      rawBodyPath: `javaguide/${rawFilename}`,
    });
  }

  return {
    accessResult: 'ok',
    rootUrl: JAVA_GUIDE_ROOT,
    visitedRouteCount: crawl.visitedRoutes.length,
    visitedRoutes: crawl.visitedRoutes,
    articles,
    redirects: crawl.redirects,
    failures: crawl.failures,
  };
}

function compareBy(field) {
  return (left, right) => String(left?.[field] ?? '').localeCompare(String(right?.[field] ?? ''));
}

export function sortManifestCollections(manifest) {
  const sorted = structuredClone(manifest);
  sorted.feishu.documents.sort(compareBy('canonicalUrl'));
  sorted.feishu.failures.sort(compareBy('nodeToken'));
  sorted.javaGuide.articles.sort(compareBy('canonicalUrl'));
  sorted.javaGuide.redirects.sort(compareBy('from'));
  sorted.javaGuide.failures.sort(compareBy('url'));
  sorted.javaGuide.visitedRoutes.sort();
  return sorted;
}

function assertUnique(values, label) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must be unique`);
  }
}

export function validatePrimaryReferenceManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('Primary reference manifest must be an object');
  }
  if (manifest.schemaVersion !== 2) {
    throw new Error('Primary reference manifest schemaVersion must be 2');
  }
  if (!isValidCalendarDate(manifest.retrievedAt)) {
    throw new Error('Primary reference manifest retrievedAt must be a real calendar date');
  }
  if (manifest.policy?.rawBodiesCommitted !== false) {
    throw new Error('Primary reference raw bodies must remain uncommitted');
  }
  const feishuDocuments = manifest.feishu?.documents;
  const javaGuideArticles = manifest.javaGuide?.articles;
  if (!Array.isArray(feishuDocuments) || feishuDocuments.length !== 16) {
    throw new Error('Primary reference manifest must contain exactly 16 Feishu documents');
  }
  if (!Array.isArray(javaGuideArticles) || javaGuideArticles.length !== 34) {
    throw new Error('Primary reference manifest must contain exactly 34 JavaGuide articles');
  }
  if (
    manifest.feishu.accessResult !== 'ok'
    || manifest.javaGuide.accessResult !== 'ok'
    || manifest.feishu.failures?.length !== 0
    || manifest.javaGuide.failures?.length !== 0
    || manifest.totals?.failures !== 0
  ) {
    throw new Error('Primary reference manifest requires zero failures and ok access results');
  }
  if (
    manifest.feishu.rootUrl !== FEISHU_ROOT_URL
    || !feishuDocuments.some(({ canonicalUrl }) => canonicalUrl === FEISHU_ROOT_URL)
  ) {
    throw new Error('Primary reference manifest is missing the Feishu root');
  }
  if (
    manifest.javaGuide.rootUrl !== JAVA_GUIDE_ROOT
    || !javaGuideArticles.some(({ canonicalUrl }) => canonicalUrl === JAVA_GUIDE_ROOT)
  ) {
    throw new Error('Primary reference manifest is missing the JavaGuide root');
  }
  if (
    manifest.feishu.expectedDirectLeafChildren !== 15
    || manifest.feishu.discoveredDirectLeafChildren !== 15
  ) {
    throw new Error('Primary reference manifest must contain all 15 Feishu leaf children');
  }
  const allSources = [...feishuDocuments, ...javaGuideArticles];
  assertUnique(allSources.map(({ canonicalUrl }) => canonicalUrl), 'Canonical source URLs');
  for (const source of allSources) {
    if (typeof source.canonicalUrl !== 'string' || !source.canonicalUrl.startsWith('https://')) {
      throw new Error('Every primary source requires an HTTPS canonical URL');
    }
    if (!SHA256.test(source.contentHash)) {
      throw new Error(`Invalid primary source content hash: ${source.canonicalUrl}`);
    }
  }
  for (const document of feishuDocuments) {
    assertFeishuNodeToken(document.nodeToken);
    if (document.canonicalUrl !== `https://my.feishu.cn/wiki/${document.nodeToken}`) {
      throw new Error(`Feishu canonical URL does not match node token: ${document.nodeToken}`);
    }
  }
  if (
    manifest.totals.sources !== 50
    || manifest.totals.feishuDocuments !== 16
    || manifest.totals.javaGuideArticles !== 34
  ) {
    throw new Error('Primary reference manifest totals must equal 16 Feishu + 34 JavaGuide');
  }
  if (
    manifest.javaGuide.visitedRouteCount !== manifest.javaGuide.visitedRoutes.length
    || manifest.javaGuide.visitedRoutes.length < javaGuideArticles.length
  ) {
    throw new Error('JavaGuide visited route invariants are inconsistent');
  }
  return manifest;
}

async function defaultSnapshotBuilder({
  stagingDirectory,
  retrievedAt,
  filesystem,
  fetchImpl,
  execFileImpl,
  limits,
  timeoutSignalFactory,
}) {
  const [feishu, javaGuide] = await Promise.all([
    freezeFeishu(stagingDirectory, retrievedAt, {
      filesystem,
      execFileImpl,
      limits,
    }),
    freezeJavaGuide(stagingDirectory, retrievedAt, {
      filesystem,
      fetchImpl,
      limits,
      timeoutSignalFactory,
    }),
  ]);
  return {
    feishu,
    javaGuide,
  };
}

function managedSibling(kind, id) {
  if (!STAGING_ID.test(id)) {
    throw new TypeError('stagingId must contain exactly 32 lowercase hexadecimal characters');
  }
  return new URL(`.${kind}-${id}/`, PRIMARY_REFERENCE_CACHE_ROOT);
}

function assertManagedTransientDirectory(directory) {
  if (!(directory instanceof URL) || directory.protocol !== 'file:') {
    throw new TypeError('Managed cache directory must be a file URL');
  }
  const parent = pathToFileURL(`${dirname(fileURLToPath(directory))}${sep}`).href;
  const name = basename(fileURLToPath(directory));
  if (
    parent !== PRIMARY_REFERENCE_CACHE_ROOT.href
    || !/^\.(?:primary-references-staging|primary-references-backup)-[a-f0-9]{32}$/.test(name)
  ) {
    throw new Error(`Refusing to remove unchecked cache path: ${directory.href}`);
  }
}

async function removeManagedTransient(directory, filesystem) {
  assertManagedTransientDirectory(directory);
  await filesystem.rm(directory, { recursive: true, force: true });
}

async function pathExists(directory, filesystem) {
  try {
    await filesystem.stat(directory);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

const FREEZE_OPTIONS = new Set([
  'clock',
  'execFileImpl',
  'fetchImpl',
  'filesystem',
  'limits',
  'onWarning',
  'snapshotBuilder',
  'stagingId',
  'timeoutSignalFactory',
]);

export async function freezePrimaryReferences(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Freeze options must be an object');
  }
  for (const option of Object.keys(options)) {
    if (!FREEZE_OPTIONS.has(option)) {
      throw new TypeError(`Unsupported freeze option: ${option}`);
    }
  }
  const {
    clock = () => new Date(),
    execFileImpl = execFileAsync,
    fetchImpl = fetch,
    filesystem = DEFAULT_FILESYSTEM,
    limits: limitOverrides,
    onWarning = (warning) => process.stderr.write(`Warning: ${warning}\n`),
    snapshotBuilder = defaultSnapshotBuilder,
    stagingId = randomUUID().replaceAll('-', ''),
    timeoutSignalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
  } = options;
  if (typeof onWarning !== 'function') {
    throw new TypeError('onWarning must be a function');
  }
  const limits = validateLimits(limitOverrides);
  const stagingDirectory = managedSibling('primary-references-staging', stagingId);
  const backupDirectory = managedSibling('primary-references-backup', stagingId);
  const startedAt = clock();
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.valueOf())) {
    throw new TypeError('clock must return a valid Date');
  }
  const frozenAt = startedAt.toISOString();
  const retrievedAt = frozenAt.slice(0, 10);

  await filesystem.mkdir(PRIMARY_REFERENCE_CACHE_ROOT, { recursive: true });
  await filesystem.mkdir(stagingDirectory, { recursive: false });
  let priorMoved = false;
  try {
    const snapshot = await snapshotBuilder({
      stagingDirectory,
      retrievedAt,
      filesystem,
      fetchImpl,
      execFileImpl,
      limits,
      timeoutSignalFactory,
    });
    const manifest = sortManifestCollections({
      schemaVersion: 2,
      frozenAt,
      retrievedAt,
      policy: {
        rawBodiesCommitted: false,
        feishuMediaDecision: 'permission-review-required',
        javaGuideMediaDecision: 'asset-level-review-required',
      },
      feishu: snapshot.feishu,
      javaGuide: snapshot.javaGuide,
      totals: {
        sources: snapshot.feishu.documents.length + snapshot.javaGuide.articles.length,
        feishuDocuments: snapshot.feishu.documents.length,
        javaGuideArticles: snapshot.javaGuide.articles.length,
        mediaCandidates: snapshot.feishu.documents.reduce(
          (sum, item) => sum + item.mediaCount,
          0,
        ) + snapshot.javaGuide.articles.reduce((sum, item) => sum + item.mediaCount, 0),
        redirects: snapshot.javaGuide.redirects.length,
        failures: snapshot.feishu.failures.length + snapshot.javaGuide.failures.length,
      },
    });
    validatePrimaryReferenceManifest(manifest);
    await filesystem.writeFile(
      new URL('./manifest.json', stagingDirectory),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );

    if (await pathExists(PRIMARY_REFERENCE_CACHE_DIRECTORY, filesystem)) {
      await filesystem.rename(PRIMARY_REFERENCE_CACHE_DIRECTORY, backupDirectory);
      priorMoved = true;
    }
    try {
      await filesystem.rename(stagingDirectory, PRIMARY_REFERENCE_CACHE_DIRECTORY);
    } catch (error) {
      if (priorMoved) {
        await filesystem.rename(backupDirectory, PRIMARY_REFERENCE_CACHE_DIRECTORY);
        priorMoved = false;
      }
      throw error;
    }
    if (priorMoved) {
      priorMoved = false;
      try {
        await removeManagedTransient(backupDirectory, filesystem);
      } catch (error) {
        const warning = 'Primary reference cache promoted, but prior backup cleanup failed: '
          + (error instanceof Error ? error.message : String(error));
        try {
          onWarning(warning);
        } catch {
          // Warning reporting is best-effort after the new canonical cache is active.
        }
      }
    }
    return manifest;
  } finally {
    if (await pathExists(stagingDirectory, filesystem)) {
      await removeManagedTransient(stagingDirectory, filesystem);
    }
    if (priorMoved && await pathExists(backupDirectory, filesystem)) {
      if (!await pathExists(PRIMARY_REFERENCE_CACHE_DIRECTORY, filesystem)) {
        await filesystem.rename(backupDirectory, PRIMARY_REFERENCE_CACHE_DIRECTORY);
      }
    }
  }
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
