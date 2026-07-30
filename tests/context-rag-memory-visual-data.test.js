import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { contextRagMemory } from '../src/data/context-rag-memory.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import {
  renderKnowledgeVisual,
  validateRenderableVisual,
} from '../src/ui/knowledge-visual.js';
import {
  contextRagMemoryVisualFixtures,
  contextRagMemoryVisualInventoryFixtures,
} from './fixtures/context-rag-memory-visual-fixtures.js';
import {
  FakeDocument,
  FakeEvent,
  findButton,
  installFakeDom,
} from './helpers/fake-dom.js';
import { assertSafeStaticSvg, parseStrictSvg } from './helpers/static-svg.js';
import { validateKnowledgeVisualOwnership } from './helpers/visual-registry.js';
import {
  readMarkdownTable,
  unwrapCodeSpanList,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const EXPECTED_OWNER = Object.freeze({
  'visual-context-01-object-map': ['context-01', 'five-information-objects'],
  'visual-context-01-projection-lifecycle': ['context-01', 'projection-pipeline'],
  'visual-context-01-offloading-boundary': ['context-01', 'scope-lifecycle-ownership'],
  'visual-context-02-token-budget': ['context-02', 'context-engineering-budget'],
  'visual-context-02-overflow-strategies': ['context-02', 'two-overflow-modes'],
  'visual-context-02-injection-loss-guard': ['context-02', 'required-and-output-reserve'],
  'visual-context-03-event-state-summary': ['context-03', 'three-conversation-representations'],
  'visual-context-03-compaction-loss': ['context-03', 'summary-is-lossy'],
  'visual-context-03-recoverability-chain': ['context-03', 'supersession-and-conflict'],
  'visual-context-04-ingestion-pipeline': ['context-04', 'separate-source-retrieval-and-citation-units'],
  'visual-context-04-chunk-strategies': ['context-04', 'chunk-by-structure-and-answer-needs'],
  'visual-context-04-version-acl-delete': ['context-04', 'propagate-version-permission-and-validity'],
  'visual-context-05-hybrid-signals': ['context-05', 'start-with-complementary-retrieval-signals'],
  'visual-context-05-rrf-fusion': ['context-05', 'fuse-ranks-without-mixing-score-scales'],
  'visual-context-05-ann-tradeoff': ['context-05', 'evaluate-methods-on-real-query-slices'],
  'visual-context-06-candidate-evidence-pipeline': ['context-06', 'turn-recalled-items-into-evidence-candidates'],
  'visual-context-06-rerank-dedup-diversity': ['context-06', 'select-diverse-evidence-under-a-budget'],
  'visual-context-06-provenance-packing': ['context-06', 'build-an-evidence-packet-and-citation-manifest'],
  'visual-context-07-memory-lifecycle': ['context-07', 'separate-memory-from-history'],
  'visual-context-07-admission-conflict': ['context-07', 'choose-write-path-and-admission'],
  'visual-context-07-decay-delete': ['context-07', 'expire-supersede-and-delete'],
  'visual-context-08-integrated-flow': ['context-08', 'separate-five-system-objects'],
  'visual-context-08-graphrag-update-boundary': ['context-08', 'contract-source-through-index'],
  'visual-context-08-layered-diagnosis': ['context-08', 'diagnose-by-layered-falsification'],
});

function visibleSvgText(parsed) {
  const chunks = [];
  function visit(node, hiddenByAncestor = false) {
    const hidden = hiddenByAncestor || node.attributes.get('aria-hidden') === 'true';
    if (!hidden && (node.name === 'text' || node.name === 'tspan')) {
      chunks.push(node.ownText);
    }
    for (const child of node.children) visit(child, hidden);
  }
  visit(parsed.root);
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

function assertDeepFrozen(value, label, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), `${label}: expected deeply frozen data`);
  for (const [key, child] of Object.entries(value)) {
    assertDeepFrozen(child, `${label}.${key}`, seen);
  }
}

async function readInventory() {
  const markdown = await readFile(
    new URL(
      '../docs/research/2026-07-30-context-rag-memory-visual-inventory.md',
      import.meta.url,
    ),
    'utf8',
  );
  const rows = readMarkdownTable(markdown, [
    'visualId',
    'role',
    'owner lesson / section',
    'assessed outcomes',
    'assessed outcome criteria',
    'cognitive question and form',
    'sourceIds',
    'storyboard and fixture contract',
    'permission decision',
    'status',
  ]).map((cells, index) => {
    const ownerMatch = cells[2].match(/^`(context-\d{2}) \/ ([a-z0-9-]+)`$/);
    assert.ok(ownerMatch, `${cells[0]}: owner must resolve to a lesson and section`);
    return {
      visualId: unwrapSingleCodeSpan(cells[0], `inventory ${index} visual`),
      role: unwrapSingleCodeSpan(cells[1], `inventory ${index} role`),
      lessonId: ownerMatch[1],
      sectionId: ownerMatch[2],
      assessedOutcomes: unwrapCodeSpanList(cells[3], `inventory ${index} outcomes`),
      outcomeCriteria: cells[4],
      cognitiveQuestion: cells[5],
      sourceIds: unwrapCodeSpanList(cells[6], `inventory ${index} sources`),
      storyboard: cells[7],
      permissionDecision: cells[8],
      status: cells[9],
    };
  });
  const publicationRows = readMarkdownTable(markdown, [
    'visualId',
    'fixtureId',
    'publicationStatus',
  ]).map((cells, index) => ({
    visualId: unwrapSingleCodeSpan(cells[0], `publication ${index} visual`),
    fixtureId: unwrapSingleCodeSpan(cells[1], `publication ${index} fixture`),
    publicationStatus: unwrapSingleCodeSpan(cells[2], `publication ${index} status`),
  }));
  const stepRows = readMarkdownTable(markdown, [
    'step asset',
    'parent visualId',
    'inherited assessed outcomes',
    'expected visible labels',
  ]).map((cells, index) => ({
    assetPath: unwrapSingleCodeSpan(cells[0], `step ${index} asset`),
    parentVisualId: unwrapSingleCodeSpan(cells[1], `step ${index} parent`),
    assessedOutcomes: unwrapCodeSpanList(cells[2], `step ${index} outcomes`),
    visibleLabels: unwrapCodeSpanList(cells[3], `step ${index} labels`),
  }));
  return { rows, publicationRows, stepRows };
}

test('publishes twenty-four original Context visuals with one overview and multiple cognitive forms per lesson', () => {
  assert.equal(contextRagMemoryVisuals.length, 24);
  assert.equal(Object.keys(EXPECTED_OWNER).length, 24);
  const ids = new Set();
  for (const visual of contextRagMemoryVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.equal(validateRenderableVisual(visual).valid, true, visual.id);
    assert.equal(visual.provenance, 'original-synthesis');
    assert.equal(visual.permission, null);
    assert.equal(visual.verifiedAt, '2026-07-30');
    assert.ok(!ids.has(visual.id), `${visual.id}: duplicate`);
    ids.add(visual.id);
  }
  for (const lesson of contextRagMemory.lessons) {
    const lessonVisuals = contextRagMemoryVisuals.filter(({ id }) => (
      id.startsWith(`visual-${lesson.id}-`)
    ));
    assert.equal(lessonVisuals.length, 3, `${lesson.id}: exactly three`);
    assert.equal(
      lessonVisuals.filter(({ role }) => role === 'overview').length,
      1,
      `${lesson.id}: exactly one overview`,
    );
    assert.ok(
      new Set(lessonVisuals.map(({ role }) => role)).size >= 2,
      `${lesson.id}: at least two cognitive forms`,
    );
  }
});

test('registers every Context visual globally with object identity and no duplicate IDs', () => {
  assert.equal(
    new Set(knowledgeVisuals.map(({ id }) => id)).size,
    knowledgeVisuals.length,
  );
  for (const visual of contextRagMemoryVisuals) {
    assert.ok(knowledgeVisuals.includes(visual), `${visual.id}: shared registry identity`);
  }
});

test('keeps visual inventory, assessment criteria, fixture and publication truth in exact parity', async () => {
  const { rows, publicationRows, stepRows } = await readInventory();
  const rowsById = new Map(rows.map((row) => [row.visualId, row]));
  const publicationById = new Map(
    publicationRows.map((row) => [row.visualId, row]),
  );
  const fixturesById = new Map(
    contextRagMemoryVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
  );
  const inventoryFixturesById = new Map(
    contextRagMemoryVisualInventoryFixtures.map((fixture) => [
      fixture.visualId,
      fixture,
    ]),
  );
  const assessmentIds = new Set([
    ...contextRagMemory.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...contextRagMemory.interviewQuestions.map(({ id }) => id),
  ]);
  const resourcesById = new Map(
    contextRagMemory.resources.map((resource) => [resource.id, resource]),
  );

  assert.equal(rows.length, 24);
  assert.equal(rowsById.size, 24);
  assert.equal(publicationRows.length, 24);
  assert.equal(publicationById.size, 24);
  assert.equal(contextRagMemoryVisualFixtures.length, 24);
  assert.equal(contextRagMemoryVisualInventoryFixtures.length, 24);

  for (const visual of contextRagMemoryVisuals) {
    const row = rowsById.get(visual.id);
    const inventoryFixture = inventoryFixturesById.get(visual.id);
    assert.ok(row, `${visual.id}: inventory row`);
    assert.ok(inventoryFixture, `${visual.id}: inventory fixture`);
    assert.deepEqual(
      [row.lessonId, row.sectionId],
      EXPECTED_OWNER[visual.id],
      `${visual.id}: owner`,
    );
    assert.equal(row.role, visual.role, `${visual.id}: role`);
    assert.deepEqual(row.sourceIds, visual.sourceIds, `${visual.id}: sources`);
    assert.deepEqual(
      row.assessedOutcomes,
      inventoryFixture.assessedOutcomes,
      `${visual.id}: outcomes`,
    );
    assert.equal(row.outcomeCriteria, inventoryFixture.outcomeCriteria, visual.id);
    assert.equal(row.cognitiveQuestion, inventoryFixture.cognitiveQuestion, visual.id);
    assert.equal(row.storyboard, inventoryFixture.storyboard, visual.id);
    assert.equal(row.permissionDecision, 'Original synthesis; no third-party media selected.');
    assert.equal(row.status, 'verified');
    assert.ok(row.assessedOutcomes.length > 0, `${visual.id}: assessed`);
    for (const outcomeId of row.assessedOutcomes) {
      assert.ok(assessmentIds.has(outcomeId), `${visual.id}: ${outcomeId}`);
      assert.ok(outcomeId.includes(row.lessonId), `${visual.id}: lesson outcome`);
    }
    const lesson = contextRagMemory.lessons.find(({ id }) => id === row.lessonId);
    const section = lesson.knowledgeNote.sections.find(({ id }) => id === row.sectionId);
    assert.ok(section, `${visual.id}: section`);
    for (const sourceId of row.sourceIds) {
      assert.ok(resourcesById.has(sourceId), `${visual.id}: ${sourceId}`);
      assert.ok(lesson.resourceIds.includes(sourceId), `${visual.id}: lesson source`);
      assert.ok(section.sourceIds.includes(sourceId), `${visual.id}: section source`);
    }
    assert.equal(fixturesById.get(visual.id)?.id, visual.fixtureId, visual.id);
    assert.deepEqual(publicationById.get(visual.id), {
      visualId: visual.id,
      fixtureId: visual.fixtureId,
      publicationStatus: 'published',
    });
  }

  const registrySteps = contextRagMemoryVisuals.flatMap((visual) => (
    (visual.steps ?? []).map((step) => ({ visual, step }))
  ));
  assert.equal(stepRows.length, registrySteps.length);
  for (const { visual, step } of registrySteps) {
    const row = stepRows.find(({ assetPath }) => assetPath === step.assetPath);
    assert.ok(row, `${step.assetPath}: inventory row`);
    assert.equal(row.parentVisualId, visual.id);
    assert.deepEqual(
      row.assessedOutcomes,
      rowsById.get(visual.id).assessedOutcomes,
    );
    assert.deepEqual(
      row.visibleLabels,
      fixturesById.get(visual.id).stepLabels[step.assetPath],
    );
  }
});

test('owns every Context visual exactly once in a source-bearing lesson section', async () => {
  const ownership = await validateKnowledgeVisualOwnership({
    courseRegistry: { contextRagMemory },
    knowledgeVisuals: contextRagMemoryVisuals,
    assetExists: async (assetPath) => {
      await access(new URL(`../${assetPath}`, import.meta.url));
      return true;
    },
  });
  assert.deepEqual(ownership.errors, []);
  assert.equal(ownership.placements.length, 24);
  for (const placement of ownership.placements) {
    assert.deepEqual(
      [placement.lessonId, placement.sectionId],
      EXPECTED_OWNER[placement.visualId],
    );
    if (placement.kind === 'section') {
      const ownerPlacement = placement.ownerSection.visuals.find(
        ({ visualId }) => visualId === placement.visualId,
      );
      assert.ok(Number.isInteger(ownerPlacement.afterParagraph));
      assert.ok(ownerPlacement.afterParagraph >= 0);
      assert.ok(ownerPlacement.afterParagraph < placement.ownerSection.paragraphs.length);
    }
  }
});

test('keeps fixture labels and numeric teaching values in visible strict SVG text nodes', async () => {
  const visibilityProbe = parseStrictSvg(
    '<svg xmlns="http://www.w3.org/2000/svg">'
      + '<text>VISIBLE<tspan aria-hidden="true">HIDDEN</tspan></text>'
      + '</svg>',
    'visibility probe',
  );
  assert.equal(visibleSvgText(visibilityProbe), 'VISIBLE');
  const fixturesById = new Map(
    contextRagMemoryVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
  );
  for (const visual of contextRagMemoryVisuals) {
    const fixture = fixturesById.get(visual.id);
    assert.ok(fixture, `${visual.id}: fixture`);
    const paths = [
      visual.assetPath,
      ...(visual.steps?.map(({ assetPath }) => assetPath) ?? []),
    ];
    const parsedByPath = new Map();
    for (const assetPath of paths) {
      const svg = await readFile(new URL(`../${assetPath}`, import.meta.url), 'utf8');
      parsedByPath.set(assetPath, assertSafeStaticSvg(svg, visual, assetPath));
    }
    const primaryText = visibleSvgText(parsedByPath.get(visual.assetPath));
    for (const label of fixture.labels) {
      assert.ok(primaryText.includes(label), `${visual.id}: visible label ${label}`);
    }
    for (const value of fixture.values) {
      assert.ok(primaryText.includes(String(value)), `${visual.id}: visible value ${value}`);
    }
    const expectedStepPaths = visual.steps?.map(({ assetPath }) => assetPath) ?? [];
    assert.deepEqual(Object.keys(fixture.stepLabels ?? {}), expectedStepPaths);
    for (const assetPath of expectedStepPaths) {
      const stepText = visibleSvgText(parsedByPath.get(assetPath));
      for (const label of fixture.stepLabels[assetPath]) {
        assert.ok(stepText.includes(label), `${assetPath}: ${label}`);
      }
    }
  }
});

test('freezes Context visual registries, fixtures and note placements recursively', () => {
  assertDeepFrozen(contextRagMemoryVisuals, 'contextRagMemoryVisuals');
  assertDeepFrozen(contextRagMemoryVisualFixtures, 'contextRagMemoryVisualFixtures');
  assertDeepFrozen(
    contextRagMemoryVisualInventoryFixtures,
    'contextRagMemoryVisualInventoryFixtures',
  );
  for (const lesson of contextRagMemory.lessons) {
    assertDeepFrozen(lesson.knowledgeNote, `${lesson.id}.knowledgeNote`);
  }
});

test('advances the real compaction-loss step visual and re-arms accessible fallback', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const visual = contextRagMemoryVisuals.find(
    ({ id }) => id === 'visual-context-03-compaction-loss',
  );
  const figure = renderKnowledgeVisual(visual);
  const image = figure.querySelector('img');
  const status = figure.querySelector('.knowledge-visual__step-status');
  const fallback = figure.querySelector('.knowledge-visual__fallback');
  const next = findButton(figure, '下一步');
  const titles = ['压缩前', '检查点', '恢复核验'];

  assert.equal(status.textContent, `1 / 3 · ${titles[0]}`);
  assert.equal(image.getAttribute('src'), visual.steps[0].assetPath);
  image.dispatchEvent(new FakeEvent('error'));
  assert.equal(image.hidden, true);
  assert.equal(fallback.hidden, false);
  titles.slice(1).forEach((title, offset) => {
    const index = offset + 1;
    next.click();
    assert.equal(status.textContent, `${index + 1} / 3 · ${title}`);
    assert.equal(image.getAttribute('src'), visual.steps[index].assetPath);
    assert.equal(image.getAttribute('alt'), visual.steps[index].alt);
    assert.equal(image.hidden, false);
    assert.equal(fallback.hidden, true);
  });
  assert.equal(next.disabled, true);
  assert.ok(figure.querySelector('details').textContent.includes(
    visual.longDescription,
  ));
});
