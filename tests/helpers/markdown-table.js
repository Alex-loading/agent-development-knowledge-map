import assert from 'node:assert/strict';

export function splitMarkdownTableRow(line) {
  assert.match(line, /^\|.*\|$/, `not a Markdown table row: ${line}`);
  const cells = [];
  let cell = '';
  let escaped = false;

  for (const character of line.slice(1, -1)) {
    if (escaped) {
      cell += character === '|' ? '|' : `\\${character}`;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }
  if (escaped) cell += '\\';
  cells.push(cell.trim());
  return cells;
}

export function readMarkdownTable(markdown, expectedHeader) {
  const lines = markdown.split('\n');
  const headerLine = `| ${expectedHeader.join(' | ')} |`;
  const headerIndex = lines.indexOf(headerLine);
  assert.ok(headerIndex >= 0, `missing Markdown table header: ${headerLine}`);
  assert.match(
    lines[headerIndex + 1] ?? '',
    /^\|(?:\s*:?-+:?\s*\|)+$/,
    `missing Markdown table delimiter after: ${headerLine}`,
  );

  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.startsWith('|')) break;
    const cells = splitMarkdownTableRow(line);
    assert.equal(cells.length, expectedHeader.length, line);
    rows.push(cells);
  }
  return rows;
}

export function extractCodeSpans(cell) {
  return [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

export function unwrapSingleCodeSpan(cell, label) {
  const spans = extractCodeSpans(cell);
  assert.equal(spans.length, 1, `${label}: expected exactly one code span`);
  assert.equal(cell, `\`${spans[0]}\``, `${label}: expected only one code span`);
  return spans[0];
}

export function unwrapCodeSpanList(cell, label) {
  const spans = extractCodeSpans(cell);
  assert.ok(spans.length > 0, `${label}: expected at least one code span`);
  assert.equal(
    cell,
    spans.map((span) => `\`${span}\``).join(', '),
    `${label}: expected only comma-separated code spans`,
  );
  return spans;
}
