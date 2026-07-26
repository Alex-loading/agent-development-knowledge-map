import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { llmFoundationVisuals } from '../src/data/visuals/llm-foundation-visuals.js';
import { llmFoundationVisualFixtures } from './fixtures/llm-foundation-visual-fixtures.js';
import { parseStrictSvg } from './helpers/static-svg.js';
import { VISUALIZED_LESSON_IDS } from './helpers/visualized-lessons.js';

const byId = Object.fromEntries(llmFoundationVisuals.map((visual) => [visual.id, visual]));
const fixtures = new Map(llmFoundationVisualFixtures.map((fixture) => [fixture.visualId, fixture]));

async function parseVisual(visualId) {
  const visual = byId[visualId];
  assert.ok(visual, `${visualId} must be registered`);
  return parseStrictSvg(await readFile(visual.assetPath, 'utf8'), visual.assetPath);
}

function nodes(parsed, region) {
  return parsed.elements.filter(
    (node) => node.attributes.get('data-region') === region
      && node.attributes.has('data-node'),
  );
}

function edges(parsed, region) {
  return parsed.elements.filter(
    (node) => node.attributes.get('data-region') === region
      && node.attributes.has('data-from')
      && node.attributes.has('data-to'),
  );
}

function visibleText(parsed) {
  return (parsed.elementsByName.get('text') ?? [])
    .map((node) => node.text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function assertVisibleNodes(parsed, region, expected) {
  const found = nodes(parsed, region);
  assert.deepEqual(new Set(found.map((node) => node.attributes.get('data-node'))), new Set(expected));
  found.forEach((node) => {
    assert.ok(['rect', 'circle', 'polygon', 'path'].includes(node.name), `${region}: visible geometry`);
    if (node.name === 'rect') {
      assert.ok(Number(node.attributes.get('width')) > 0);
      assert.ok(Number(node.attributes.get('height')) > 0);
    }
  });
}

function assertExactEdges(parsed, region, expected) {
  const found = edges(parsed, region);
  assert.deepEqual(
    new Set(found.map((edge) => `${edge.attributes.get('data-from')}→${edge.attributes.get('data-to')}`)),
    new Set(expected),
  );
  found.forEach((edge) => {
    assert.ok(edge.attributes.get('stroke'));
    assert.ok(edge.attributes.get('marker-end'), `${region}: directed edge`);
  });
}

test('publishes 40 visuals and makes lessons 01–08 the single visualized set', () => {
  assert.equal(llmFoundationVisuals.length, 40);
  assert.deepEqual(VISUALIZED_LESSON_IDS, [
    'llm-01', 'llm-02', 'llm-03', 'llm-04',
    'llm-05', 'llm-06', 'llm-07', 'llm-08',
  ]);
  for (const lessonId of ['llm-07', 'llm-08']) {
    assert.equal(llmFoundationVisuals.filter(({ id }) => id.startsWith(`visual-${lessonId}-`)).length, 5);
    const note = llmFoundation.lessons.find(({ id }) => id === lessonId).knowledgeNote;
    const placed = [
      note.overviewVisualId,
      ...note.sections.flatMap((section) => (section.visuals ?? []).map(({ visualId }) => visualId)),
    ].filter(Boolean);
    assert.equal(placed.length, 5);
    assert.equal(new Set(placed).size, 5);
  }
});

test('runtime contract visibly separates fixed rules from runtime data with one-way control', async () => {
  const parsed = await parseVisual('visual-llm-07-runtime-contract');
  assertVisibleNodes(parsed, 'contract-node', [
    'goal', 'fixed-rules', 'runtime-data', 'few-shot-boundary',
    'schema', 'failure-behavior', 'eval-version',
  ]);
  assertExactEdges(parsed, 'contract-edge', [
    'goal→fixed-rules', 'fixed-rules→runtime-data', 'runtime-data→few-shot-boundary',
    'few-shot-boundary→schema', 'schema→failure-behavior', 'failure-behavior→eval-version',
  ]);
  assert.equal(edges(parsed, 'contract-edge').some((edge) =>
    edge.attributes.get('data-from') === 'runtime-data'
      && edge.attributes.get('data-to') === 'fixed-rules'), false);
});

test('instruction boundary allows execution only through external gates', async () => {
  const parsed = await parseVisual('visual-llm-07-instruction-boundary');
  assertVisibleNodes(parsed, 'trust-node', [
    'high-level-rules', 'user-input', 'retrieval-input', 'tool-input',
    'model-proposal', 'permission-gate', 'parameter-gate', 'confirmation-gate', 'execute',
  ]);
  assertExactEdges(parsed, 'allowed-edge', [
    'high-level-rules→model-proposal', 'user-input→model-proposal',
    'retrieval-input→model-proposal', 'tool-input→model-proposal',
    'model-proposal→permission-gate', 'permission-gate→parameter-gate',
    'parameter-gate→confirmation-gate', 'confirmation-gate→execute',
  ]);
  const attacks = edges(parsed, 'attack-edge');
  assert.deepEqual(
    new Set(attacks.map((edge) => `${edge.attributes.get('data-from')}→${edge.attributes.get('data-to')}`)),
    new Set(['user-input→execute', 'retrieval-input→execute', 'tool-input→execute']),
  );
  attacks.forEach((edge) => assert.ok(edge.attributes.get('stroke-dasharray')));
});

test('schema pipeline exposes every validation gate and its exact failure branch', async () => {
  const parsed = await parseVisual('visual-llm-07-schema-pipeline');
  assertVisibleNodes(parsed, 'schema-node', [
    'model-text', 'json-parse', 'required-type-enum', 'business-rules',
    'permission-database', 'typed-object', 'parse-error', 'schema-error',
    'business-error', 'permission-error', 'side-effect',
  ]);
  assertExactEdges(parsed, 'schema-main-edge', [
    'model-text→json-parse', 'json-parse→required-type-enum',
    'required-type-enum→business-rules', 'business-rules→permission-database',
    'permission-database→typed-object', 'typed-object→side-effect',
  ]);
  assertExactEdges(parsed, 'schema-error-edge', [
    'json-parse→parse-error', 'required-type-enum→schema-error',
    'business-rules→business-error', 'permission-database→permission-error',
  ]);
});

test('retry diagram binds every attempt and event to fixture-derived visible geometry', async () => {
  const visualId = 'visual-llm-07-retry-state-machine';
  const parsed = await parseVisual(visualId);
  const fixture = fixtures.get(visualId);
  const attempts = nodes(parsed, 'retry-attempt');
  assert.equal(attempts.length, fixture.data.attempts.length);
  attempts.forEach((node, index) => {
    assert.equal(Number(node.attributes.get('data-index')), index + 1);
    assert.equal(node.attributes.get('data-value'), fixture.data.attempts[index].priority);
  });
  const guards = nodes(parsed, 'retry-guard');
  assert.equal(guards.length, fixture.data.maxAttempts);
  guards.forEach((guard, index) => {
    const attemptNumber = index + 1;
    assert.equal(Number(guard.attributes.get('data-index')), attemptNumber);
    assert.equal(
      guard.attributes.get('data-value'),
      `attempt ${attemptNumber} ＜ ${fixture.data.maxAttempts}?`,
    );
  });
  assertVisibleNodes(parsed, 'retry-terminal', ['degrade', 'manual-termination']);
  assertVisibleNodes(parsed, 'retry-state', [
    'schema-failed', 'schema-failed-2', 'validated', 'exhausted',
  ]);
  const events = nodes(parsed, 'idempotency-event');
  assert.equal(events.length, fixture.data.events.length);
  events.forEach((node, index) => {
    const expected = fixture.result.eventResults[index];
    assert.equal(Number(node.attributes.get('data-index')), index + 1);
    assert.equal(node.attributes.get('data-value'), expected.status);
    assert.equal(node.attributes.get('data-token'), fixture.data.events[index].key);
    assert.equal(node.attributes.get('data-count'), String(fixture.data.events[index].payload.ticketId));
  });
  assertExactEdges(parsed, 'retry-edge', [
    'attempt-1→schema-failed', 'schema-failed→guard-1', 'guard-1→attempt-2',
    'attempt-2→validated', 'attempt-2→schema-failed-2', 'schema-failed-2→guard-2',
    'guard-2→exhausted', 'exhausted→degrade', 'exhausted→manual-termination',
    'validated→event-1', 'event-1→effect-1', 'event-2→effect-1',
    'event-3→effect-2', 'event-4→rejected', 'event-5→rejected',
  ]);
  assert.deepEqual(
    edges(parsed, 'retry-edge')
      .filter((edge) => ['true', 'false'].includes(edge.attributes.get('data-kind')))
      .map((edge) => ({
        from: edge.attributes.get('data-from'),
        to: edge.attributes.get('data-to'),
        decision: edge.attributes.get('data-kind'),
      })),
    [
      { from: 'guard-1', to: 'attempt-2', decision: 'true' },
      { from: 'guard-2', to: 'exhausted', decision: 'false' },
    ],
  );
  const summary = nodes(parsed, 'retry-summary');
  assert.deepEqual(
    Object.fromEntries(summary.map((node) => [node.attributes.get('data-node'), node.attributes.get('data-value')])),
    {
      sideEffects: String(fixture.result.sideEffectExecutions),
      cacheKeys: fixture.result.cacheKeys.join('|'),
    },
  );
});

test('version evaluation binds four samples per version and applies safety gate before overall score', async () => {
  const visualId = 'visual-llm-07-version-eval-loop';
  const parsed = await parseVisual(visualId);
  const fixture = fixtures.get(visualId);
  for (const version of ['v1', 'v2']) {
    const cells = nodes(parsed, 'eval-sample').filter((node) => node.attributes.get('data-stage') === version);
    assert.equal(cells.length, 4);
    cells.forEach((cell, index) => {
      assert.equal(Number(cell.attributes.get('data-index')), fixture.data.sampleIds[index]);
      assert.equal(Number(cell.attributes.get('data-value')), fixture.data.versions[version][index]);
      if (fixture.data.safetySampleIds.includes(fixture.data.sampleIds[index])) {
        assert.equal(cell.attributes.get('data-kind'), 'safety');
      }
    });
  }
  assertExactEdges(parsed, 'eval-loop-edge', [
    'version-tuple→samples', 'samples→metrics', 'metrics→safety-gate',
    'safety-gate→blocked-v1', 'safety-gate→release-v2',
    'blocked-v1→failure-cluster', 'failure-cluster→modify',
    'modify→regression', 'regression→release-v2', 'release-v2→rollback',
  ]);
});

test('all four quantitative visuals visibly state fixture input, method, result and rounding', async () => {
  const expected = {
    'visual-llm-07-retry-state-machine': ['Input：2 attempts', 'Method：enum → retry → idempotency', 'Result', 'effects = 2', 'Rounding：整数'],
    'visual-llm-07-version-eval-loop': ['Input：4 samples', 'Method：安全门先于总分', 'Result：v1 75.0% BLOCKED', 'Rounding：百分比一位'],
    'visual-llm-08-eval-funnel': ['Input：6/6 · 4/5 · 3/4', 'Method：切片率 + adversarial hard gate', 'Result：13/15 = 86.7% BLOCKED', 'Rounding：百分比一位'],
    'visual-llm-08-release-pareto': ['Input：A–E · safety gate 99.5%', 'Method：先安全过滤，再判断 dominance', 'Result：C 淘汰 · B dominates D', 'Rounding：质量安全成本一位；P95 整数'],
  };
  for (const [visualId, fragments] of Object.entries(expected)) {
    const textContent = visibleText(await parseVisual(visualId));
    fragments.forEach((fragment) => assert.ok(textContent.includes(fragment), `${visualId}: ${fragment}`));
  }
});

test('failure map and grounding chain expose exact causes, evidence, mitigations and breakpoints', async () => {
  const failure = await parseVisual('visual-llm-08-failure-map');
  const types = ['fact', 'reasoning', 'format', 'instruction', 'permission', 'performance'];
  assertVisibleNodes(failure, 'failure-type', types);
  assertVisibleNodes(failure, 'failure-evidence', types.map((type) => `${type}-evidence`));
  assertVisibleNodes(failure, 'failure-mitigation', types.map((type) => `${type}-mitigation`));
  assertExactEdges(failure, 'failure-edge', types.flatMap((type) => [
    `fluent-symptom→${type}`, `${type}→${type}-evidence`, `${type}-evidence→${type}-mitigation`,
  ]));

  const grounding = await parseVisual('visual-llm-08-grounding-chain');
  const chain = ['question', 'document-version', 'recall', 'ranking', 'context', 'claim', 'citation-alignment', 'review'];
  assertVisibleNodes(grounding, 'grounding-node', chain);
  assertExactEdges(grounding, 'grounding-edge', chain.slice(0, -1).map((node, index) => `${node}→${chain[index + 1]}`));
  assertVisibleNodes(grounding, 'breakpoint', [
    'missing-document', 'wrong-recall', 'wrong-ranking', 'context-conflict',
    'claim-misuse', 'citation-mismatch', 'insufficient-evidence',
  ]);
});

test('eval funnel derives every visible slice and blocks despite the overall average', async () => {
  const visualId = 'visual-llm-08-eval-funnel';
  const parsed = await parseVisual(visualId);
  const fixture = fixtures.get(visualId);
  const sliceNodes = nodes(parsed, 'eval-slice');
  assert.equal(sliceNodes.length, 3);
  Object.entries(fixture.data.slices).forEach(([name, slice]) => {
    const node = sliceNodes.find((candidate) => candidate.attributes.get('data-node') === name);
    assert.equal(node.attributes.get('data-count'), `${slice.passed}/${slice.total}`);
    assert.equal(Number(node.attributes.get('data-value')), fixture.result.rates[name]);
  });
  const summary = nodes(parsed, 'eval-summary');
  assert.equal(summary.find((node) => node.attributes.get('data-node') === 'overall').attributes.get('data-value'), String(fixture.result.overallRate));
  assert.equal(summary.find((node) => node.attributes.get('data-node') === 'gate').attributes.get('data-value'), 'blocked');
  assertExactEdges(parsed, 'funnel-edge', [
    'sources→governance', 'governance→normal', 'governance→boundary', 'governance→adversarial',
    'normal→graders', 'boundary→graders', 'adversarial→graders',
    'graders→thresholds', 'thresholds→gate', 'gate→sources',
  ]);
});

test('injection defense uses five independent model-external barriers', async () => {
  const parsed = await parseVisual('visual-llm-08-injection-defense');
  assertVisibleNodes(parsed, 'injection-node', [
    'direct-input', 'indirect-input', 'model', 'tool-impact', 'data-impact',
    'input-isolation', 'least-privilege', 'parameter-validation', 'human-confirmation', 'logging-response',
  ]);
  assertExactEdges(parsed, 'attack-path', [
    'direct-input→model', 'indirect-input→model', 'model→tool-impact', 'model→data-impact',
  ]);
  assertExactEdges(parsed, 'control-edge', [
    'input-isolation→direct-input', 'input-isolation→indirect-input',
    'least-privilege→tool-impact', 'parameter-validation→tool-impact',
    'human-confirmation→tool-impact', 'logging-response→tool-impact', 'logging-response→data-impact',
  ]);
});

test('Pareto chart derives table values and two independent panel positions from one fixture', async () => {
  const visualId = 'visual-llm-08-release-pareto';
  const parsed = await parseVisual(visualId);
  const fixture = fixtures.get(visualId);
  const tableRows = nodes(parsed, 'pareto-table-row');
  assert.equal(tableRows.length, fixture.data.candidates.length);
  fixture.data.candidates.forEach((candidate, index) => {
    const row = tableRows.find((node) => node.attributes.get('data-node') === candidate.id);
    assert.equal(Number(row.attributes.get('data-index')), index);
    assert.equal(row.attributes.get('data-value'), `${candidate.quality}|${candidate.safety}|${candidate.cost}|${candidate.latency}`);
    assert.equal(row.attributes.get('data-kind'), candidate.safety < fixture.data.safetyGate ? 'rejected' : 'eligible');
  });

  const rejectedBySafety = new Set(fixture.result.rejectedBySafety);
  const allowedIds = fixture.data.candidates
    .filter((candidate) => candidate.safety >= fixture.data.safetyGate)
    .filter((candidate) => !rejectedBySafety.has(candidate.id))
    .map((candidate) => candidate.id);
  assert.deepEqual(
    fixture.data.candidates
      .filter((candidate) => candidate.safety < fixture.data.safetyGate)
      .map((candidate) => candidate.id),
    fixture.result.rejectedBySafety,
  );

  for (const stage of ['quality-cost', 'quality-latency']) {
    const points = nodes(parsed, 'pareto-point').filter((node) => node.attributes.get('data-stage') === stage);
    assert.deepEqual(points.map((point) => point.attributes.get('data-node')), allowedIds);
    fixture.data.candidates
      .filter((candidate) => allowedIds.includes(candidate.id))
      .forEach((candidate) => {
        const point = points.find((node) => node.attributes.get('data-node') === candidate.id);
        const horizontal = stage === 'quality-cost' ? candidate.cost : candidate.latency;
        assert.equal(Number(point.attributes.get('data-value')), horizontal);
        assert.equal(Number(point.attributes.get('data-count')), candidate.quality);
        assert.equal(
          point.attributes.get('data-kind'),
          fixture.result.nonDominated.includes(candidate.id) ? 'non-dominated' : 'dominated',
        );
        const expectedX = stage === 'quality-cost'
          ? 490 + ((horizontal - 1) / (3.4 - 1)) * 270
          : 840 + ((horizontal - 450) / (1100 - 450)) * 270;
        const expectedY = 575 - ((candidate.quality - 82) / (91 - 82)) * 190;
        assert.ok(Math.abs(Number(point.attributes.get('data-origin-x')) - expectedX) < 0.01);
        assert.ok(Math.abs(Number(point.attributes.get('data-origin-y')) - expectedY) < 0.01);
      });
  }
  assertExactEdges(parsed, 'dominance-edge', ['B→D']);
});
