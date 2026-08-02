import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HARD_MARKER = /\b(?:TODO|TBD)\b|\b(?:placeholder|similar\s+to)\b|待补/;
const STRUCTURAL_UNFINISHED = /(?:^|[:：]\s*|[-*]\s+)未完成(?:\s|$|[：:。；;])/;

function withoutMarkdownCodeFences(text) {
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line;
  }).join('\n');
}

export function findReleaseMarkers(text, { markdown = false } = {}) {
  const inspected = markdown ? withoutMarkdownCodeFences(text) : text;
  return inspected.split('\n').flatMap((line, index) => (
    HARD_MARKER.test(line) || STRUCTURAL_UNFINISHED.test(line)
      ? [{ line: index + 1, text: line.trim() }]
      : []
  ));
}

async function filesUnder(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

export async function scanReleaseContent(root) {
  const candidates = [
    ...await filesUnder(resolve(root, 'src/data')),
    ...await filesUnder(resolve(root, 'docs/content-audits')),
  ].filter((path) => ['.js', '.md'].includes(extname(path)));
  const findings = [];
  for (const path of candidates) {
    const text = await readFile(path, 'utf8');
    const markers = findReleaseMarkers(text, { markdown: extname(path) === '.md' });
    findings.push(...markers.map((marker) => ({ path, ...marker })));
  }
  return findings;
}

async function main() {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const findings = await scanReleaseContent(root);
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.path}:${finding.line}: ${finding.text}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log('Release content has no unresolved authoring markers.');
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
