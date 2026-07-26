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
const AXIS_X = [270, 326, 382, 438, 494, 550];
const ROW_TOP = [126, 226, 326, 426];
const ROW_CENTER_Y = ROW_TOP.map((top) => top + 50);
const DETAIL_TEXT = [
  {
    riskControl: '风险：高危切片+回滚',
    costCheck: '成本：低算力基线',
    nextStep: '下一步：评测检索、引用与权限',
  },
  {
    riskControl: '风险：标准切片+回滚',
    costCheck: '成本：训推对比',
    nextStep: '下一步：训练前对比 Prompt / 工具基线',
  },
  {
    riskControl: '风险：标准切片+回滚',
    costCheck: '成本：训推对比',
    nextStep: '下一步：建立基线并澄清目标',
  },
  {
    riskControl: '风险：标准切片+回滚',
    costCheck: '成本：训推对比',
    nextStep: '下一步：建立基线并继续收集数据',
  },
];

function expectedValue(item, axis) {
  return axis === 'hasExamples' ? item.hasExamples : item.axes[axis];
}

function assertVisibleRagMatrix(svg) {
  assert.doesNotMatch(
    svg,
    /<g\b[^>]*data-region="rag-(?:axis-cell|evaluation)"[^>]*\/>/,
    '语义数据不得藏在不可见的空 g 代理中',
  );
  const parsed = parseStrictSvg(svg, ASSET_PATH);

  const headers = parsed.elements.filter(
    (node) => node.name === 'text' && node.attributes.get('data-region') === 'rag-axis-header',
  );
  assert.equal(headers.length, AXES.length);
  AXES.forEach(([axis, label], column) => {
    const header = headers.find((node) => node.attributes.get('data-column') === axis);
    assert.ok(header, `缺少 ${axis} 可见表头`);
    assert.equal(header.text, label);
    assert.equal(Number(header.attributes.get('x')), AXIS_X[column]);
    assert.equal(Number(header.attributes.get('y')), 112);
    assert.ok(Number(header.attributes.get('y')) < ROW_TOP[0], '表头不得侵入首行');
  });

  const cells = parsed.elements.filter(
    (node) => node.name === 'text' && node.attributes.get('data-region') === 'rag-axis-cell',
  );
  assert.equal(cells.length, FIXTURE.data.cases.length * AXES.length);
  FIXTURE.data.cases.forEach((item, row) => {
    AXES.forEach(([axis], column) => {
      const expected = String(expectedValue(item, axis));
      const cell = cells.find(
        (node) => node.attributes.get('data-row') === String(row)
          && node.attributes.get('data-column') === axis,
      );
      assert.ok(cell, `缺少 ${row}/${axis} 可见单元格`);
      assert.equal(cell.attributes.get('data-value'), expected);
      assert.equal(cell.text, expected, `${row}/${axis} 可见文字必须与 fixture 一致`);
      assert.equal(Number(cell.attributes.get('x')), AXIS_X[column]);
      assert.equal(Number(cell.attributes.get('y')), ROW_CENTER_Y[row]);
    });
  });

  const routes = parsed.elements.filter(
    (node) => node.name === 'text' && node.attributes.get('data-region') === 'rag-route',
  );
  assert.equal(routes.length, FIXTURE.result.decisions.length);
  FIXTURE.result.decisions.forEach((decision, row) => {
    const route = routes.find((node) => node.attributes.get('data-row') === String(row));
    assert.equal(route?.attributes.get('data-value'), decision.route);
    assert.equal(route?.text, decision.route);
    assert.equal(Number(route?.attributes.get('x')), 610);
    assert.equal(Number(route?.attributes.get('y')), ROW_TOP[row] + 25);
  });

  const summaries = parsed.elements.filter(
    (node) => node.name === 'text' && node.attributes.get('data-region') === 'rag-evaluation',
  );
  const details = parsed.elements.filter(
    (node) => node.name === 'text' && node.attributes.get('data-region') === 'rag-evaluation-detail',
  );
  assert.equal(summaries.length, FIXTURE.result.decisions.length);
  assert.equal(details.length, FIXTURE.result.decisions.length * 3);
  FIXTURE.result.decisions.forEach((decision, row) => {
    const summary = summaries.find((node) => node.attributes.get('data-row') === String(row));
    assert.equal(summary?.attributes.get('data-value'), [
      decision.evaluationProfile.riskControl,
      decision.evaluationProfile.costCheck,
      decision.nextStep,
    ].join('|'));
    assert.match(summary?.text ?? '', /^评测/);

    ['riskControl', 'costCheck', 'nextStep'].forEach((kind, index) => {
      const detail = details.find(
        (node) => node.attributes.get('data-row') === String(row)
          && node.attributes.get('data-kind') === kind,
      );
      const fixtureValue = kind === 'nextStep'
        ? decision.nextStep
        : decision.evaluationProfile[kind];
      assert.equal(detail?.attributes.get('data-value'), fixtureValue);
      assert.equal(detail?.text, DETAIL_TEXT[row][kind]);
      assert.equal(Number(detail?.attributes.get('x')), index === 1 ? 875 : 610);
      assert.equal(
        Number(detail?.attributes.get('y')),
        index === 2 ? ROW_TOP[row] + 86 : ROW_TOP[row] + 57,
      );
      assert.ok(Number(detail?.attributes.get('y')) < ROW_TOP[row] + 100);
    });
  });
}

test('RAG decision matrix renders six fixture axes and evaluation steps as visible geometry', async () => {
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
