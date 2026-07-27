import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { llmFoundationVisualFixtures } from './fixtures/llm-foundation-visual-fixtures.js';
import { parseStrictSvg } from './helpers/static-svg.js';

const ASSET_PATH = 'assets/visuals/llm-foundation/llm-05-rag-finetune-matrix.svg';
const FIXTURE = llmFoundationVisualFixtures.find(
  ({ visualId }) => visualId === 'visual-llm-05-rag-finetune-matrix',
);
const AXES = [
  ['updateFrequency', '更新'],
  ['citationNeed', '引用'],
  ['stableBehavior', '稳定'],
  ['computeBudget', '预算'],
  ['risk', '风险'],
  ['hasExamples', '示例'],
];
const EVALUATION_KINDS = ['riskControl', 'costCheck', 'nextStep'];

function numberAttribute(node, name) {
  const value = Number(node.attributes.get(name));
  assert.ok(Number.isFinite(value), `${node.name}.${name} 必须是有限数值`);
  return value;
}

function textWidth(node) {
  const fontSize = numberAttribute(node, 'font-size');
  return [...node.text].reduce((width, character) => {
    if (/\s/u.test(character)) return width + fontSize * 0.32;
    if (/[\p{Script=Han}：，。；、]/u.test(character)) return width + fontSize;
    return width + fontSize * 0.58;
  }, 0);
}

function visibleBounds(node) {
  if (node.name === 'rect') {
    const x = numberAttribute(node, 'x');
    const y = numberAttribute(node, 'y');
    return {
      left: x,
      top: y,
      right: x + numberAttribute(node, 'width'),
      bottom: y + numberAttribute(node, 'height'),
    };
  }

  assert.equal(node.name, 'text', '可见几何断言只支持 rect/text');
  const x = numberAttribute(node, 'x');
  const y = numberAttribute(node, 'y');
  const width = textWidth(node);
  const fontSize = numberAttribute(node, 'font-size');
  const anchor = node.attributes.get('text-anchor') ?? 'start';
  const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
  return {
    left,
    top: y - fontSize * 0.82,
    right: left + width,
    bottom: y + fontSize * 0.22,
  };
}

function assertContained(inner, outer, label, inset = 0) {
  assert.ok(inner.left >= outer.left + inset, `${label} 左侧越过容器`);
  assert.ok(inner.top >= outer.top + inset, `${label} 顶部越过容器`);
  assert.ok(inner.right <= outer.right - inset, `${label} 右侧越过容器`);
  assert.ok(inner.bottom <= outer.bottom - inset, `${label} 底部越过容器`);
}

function overlaps(first, second) {
  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top;
}

function byRegion(parsed, region, name = 'text') {
  return parsed.elements.filter(
    (node) => node.name === name && node.attributes.get('data-region') === region,
  );
}

function expectedAxisValue(item, axis) {
  return String(axis === 'hasExamples' ? item.hasExamples : item.axes[axis]);
}

function expectedEvaluationValue(decision, kind) {
  return kind === 'nextStep' ? decision.nextStep : decision.evaluationProfile[kind];
}

function assertVisibleRagMatrix(svg) {
  assert.doesNotMatch(
    svg,
    /<g\b[^>]*data-region="rag-(?:axis-cell|evaluation)"[^>]*\/>/,
    '语义数据不得藏在不可见的空 g 代理中',
  );
  const parsed = parseStrictSvg(svg, ASSET_PATH);
  const rows = byRegion(parsed, 'decision-row', 'rect');
  const headers = byRegion(parsed, 'rag-axis-header');
  const cells = byRegion(parsed, 'rag-axis-cell');
  const routes = byRegion(parsed, 'rag-route');
  const summaries = byRegion(parsed, 'rag-evaluation');
  const details = byRegion(parsed, 'rag-evaluation-detail');

  assert.equal(rows.length, FIXTURE.data.cases.length);
  assert.equal(headers.length, AXES.length);
  assert.equal(cells.length, FIXTURE.data.cases.length * AXES.length);
  assert.equal(routes.length, FIXTURE.result.decisions.length);
  assert.equal(summaries.length, FIXTURE.result.decisions.length);
  assert.equal(details.length, FIXTURE.result.decisions.length * EVALUATION_KINDS.length);

  const rowBounds = rows
    .sort((first, second) => Number(first.attributes.get('data-row')) - Number(second.attributes.get('data-row')))
    .map(visibleBounds);
  rowBounds.slice(1).forEach((bounds, row) => {
    assert.ok(rowBounds[row].bottom <= bounds.top, `相邻行 ${row}/${row + 1} 不得重叠`);
  });

  const orderedHeaders = AXES.map(([axis, label]) => {
    const header = headers.find((node) => node.attributes.get('data-column') === axis);
    assert.ok(header, `缺少 ${axis} 可见表头`);
    assert.equal(header.text, label);
    assert.ok(visibleBounds(header).bottom < rowBounds[0].top, `${axis} 表头不得侵入首行`);
    return header;
  });
  orderedHeaders.slice(1).forEach((header, column) => {
    assert.ok(
      numberAttribute(orderedHeaders[column], 'x') < numberAttribute(header, 'x'),
      '六轴表头必须保持 fixture 字段顺序',
    );
  });

  FIXTURE.data.cases.forEach((item, row) => {
    const rowCells = AXES.map(([axis], column) => {
      const cell = cells.find(
        (node) => node.attributes.get('data-row') === String(row)
          && node.attributes.get('data-column') === axis,
      );
      assert.ok(cell, `缺少 ${row}/${axis} 可见单元格`);
      const expected = expectedAxisValue(item, axis);
      assert.equal(cell.attributes.get('data-value'), expected);
      assert.equal(cell.text, expected, `${row}/${axis} 可见文字必须与 fixture 一致`);
      assert.equal(
        numberAttribute(cell, 'x'),
        numberAttribute(orderedHeaders[column], 'x'),
        `${axis} 表头与四行单元格必须共用列 X`,
      );
      assertContained(visibleBounds(cell), rowBounds[row], `${row}/${axis}`);
      return cell;
    });
    rowCells.slice(1).forEach((cell, column) => {
      assert.ok(
        numberAttribute(rowCells[column], 'x') < numberAttribute(cell, 'x'),
        `第 ${row} 行六轴单元格必须保持列顺序`,
      );
    });

    const decision = FIXTURE.result.decisions[row];
    const route = routes.find((node) => node.attributes.get('data-row') === String(row));
    assert.equal(route?.attributes.get('data-value'), decision.route);
    assert.equal(route?.text, decision.route);
    assert.ok(numberAttribute(route, 'x') > numberAttribute(rowCells.at(-1), 'x'));
    assert.ok(numberAttribute(route, 'x') < rowBounds[row].right, `第 ${row} 行路线起点必须在行内`);
    assert.ok(
      numberAttribute(route, 'y') > rowBounds[row].top
        && numberAttribute(route, 'y') < rowBounds[row].bottom,
      `第 ${row} 行路线基线必须在行内`,
    );

    const summary = summaries.find((node) => node.attributes.get('data-row') === String(row));
    assert.ok(summary, `第 ${row} 行必须有可见评测节点`);
    assert.equal(summary.text, '评测');
    assert.equal(summary.attributes.get('data-value'), EVALUATION_KINDS
      .map((kind) => expectedEvaluationValue(decision, kind))
      .join('|'));
    const summaryBounds = visibleBounds(summary);
    assertContained(summaryBounds, rowBounds[row], `第 ${row} 行评测节点`, 8);

    const rowDetails = EVALUATION_KINDS.map((kind) => {
      const detail = details.find(
        (node) => node.attributes.get('data-row') === String(row)
          && node.attributes.get('data-kind') === kind,
      );
      assert.ok(detail, `第 ${row} 行缺少 ${kind} 可见评测值`);
      assert.equal(detail.attributes.get('data-value'), expectedEvaluationValue(decision, kind));
      assert.ok(detail.text.length > 0, `${kind} 可见文字不得为空`);
      assertContained(visibleBounds(detail), rowBounds[row], `第 ${row} 行 ${kind}`);
      return detail;
    });
    rowDetails.forEach((detail) => {
      assert.equal(
        overlaps(summaryBounds, visibleBounds(detail)),
        false,
        `第 ${row} 行评测节点不得覆盖 ${detail.attributes.get('data-kind')}`,
      );
    });
  });
}

test('RAG decision matrix keeps visible fixture values in ordered, aligned row containers', async () => {
  const svg = await readFile(ASSET_PATH, 'utf8');
  assertVisibleRagMatrix(svg);
});

test('RAG visible-value mutation is rejected even when data attributes stay unchanged', async () => {
  const svg = await readFile(ASSET_PATH, 'utf8');
  const mutated = svg.replace(
    /(<text\b[^>]*data-region="rag-axis-cell"[^>]*data-row="0"[^>]*data-column="updateFrequency"[^>]*>)3(<\/text>)/,
    '$1失真$2',
  );
  assert.notEqual(mutated, svg, '测试必须真的修改一个可见 fixture 值');
  assert.throws(
    () => assertVisibleRagMatrix(mutated),
    /可见文字必须与 fixture 一致/,
  );
});
