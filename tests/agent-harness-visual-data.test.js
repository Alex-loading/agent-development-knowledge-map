import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { agentHarness } from '../src/data/agent-harness.js';
import { agentHarnessVisuals } from '../src/data/visuals/agent-harness-visuals.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';
import {
  renderKnowledgeVisual,
  validateRenderableVisual,
} from '../src/ui/knowledge-visual.js';
import {
  agentHarnessVisualFixtures,
  agentHarnessVisualInventoryFixtures,
} from './fixtures/agent-harness-visual-fixtures.js';
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
  splitMarkdownTableRow,
  unwrapCodeSpanList,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const EXPECTED_OWNER = Object.freeze({
  'visual-harness-01-control-system': ['harness-01', 'decision-and-control-planes'],
  'visual-harness-01-tool-transcript': ['harness-01', 'run-attempt-step-session'],
  'visual-harness-01-stop-guard': ['harness-01', 'normative-state-machine'],
  'visual-harness-02-state-journal': ['harness-02', 'separate-facts-projections-and-recovery-points'],
  'visual-harness-02-checkpoint-gap': ['harness-02', 'commit-events-and-projections-atomically'],
  'visual-harness-02-versioned-resume': ['harness-02', 'recover-with-a-single-lease-and-replay'],
  'visual-harness-03-tool-governance': ['harness-03', 'separate-model-catalog-from-host-registry'],
  'visual-harness-03-control-gates': ['harness-03', 'apply-four-distinct-control-layers'],
  'visual-harness-03-approval-resume': ['harness-03', 'persist-approval-with-framework-aware-resume'],
  'visual-harness-04-sandbox-boundary': ['harness-04', 'start-from-a-threat-model'],
  'visual-harness-04-isolation-stack': ['harness-04', 'compare-isolation-mechanisms'],
  'visual-harness-04-vfs-session': ['harness-04', 'minimize-files-and-secrets'],
  'visual-harness-05-bounded-run': ['harness-05', 'build-a-hierarchical-run-budget'],
  'visual-harness-05-deadline-cancel': ['harness-05', 'separate-timeout-deadline-cancel-and-rollback'],
  'visual-harness-05-retry-budget': ['harness-05', 'bound-retries-and-prevent-amplification'],
  'visual-harness-06-idempotent-recovery': ['harness-06', 'bind-retries-to-business-intent'],
  'visual-harness-06-side-effect-journal': ['harness-06', 'persist-intent-and-side-effect-ledger'],
  'visual-harness-06-evidence-decision': ['harness-06', 'resume-by-lease-evidence-and-five-decisions'],
  'visual-harness-07-orchestration-map': ['harness-07', 'layer-concurrency-limits'],
  'visual-harness-07-queue-lease': ['harness-07', 'consume-with-visibility-and-checkpoints'],
  'visual-harness-07-backpressure': ['harness-07', 'apply-backpressure-and-load-shedding'],
  'visual-harness-08-long-horizon-handoff': ['harness-08', 'classify-waiting-and-terminal-states'],
  'visual-harness-08-progressive-disclosure': ['harness-08', 'persist-and-release-long-approvals'],
  'visual-harness-08-handoff-evidence': ['harness-08', 'build-a-verifiable-handoff-bundle'],
});

async function readInventory() {
  const markdown = await readFile(
    new URL('../docs/research/2026-07-30-agent-harness-visual-inventory.md', import.meta.url),
    'utf8',
  );
  const rows = readMarkdownTable(markdown, [
    'visualId',
    'role',
    'owner lesson / section',
    'assessed outcomes',
    'cognitive question and form',
    'sourceIds',
    'storyboard and fixture contract',
    'permission decision',
    'status',
  ]).map((cells, index) => {
    const [
      visualId,
      role,
      owner,
      assessedOutcomes,
      cognitiveQuestion,
      sourceIds,
      storyboard,
      permissionDecision,
      status,
    ] = cells;
    const ownerMatch = owner.match(/^`(harness-\d{2}) \/ ([a-z0-9-]+)`$/);
    assert.ok(ownerMatch, `${visualId}: owner cell must name a real lesson and section`);
    const parsedAssessedOutcomes = unwrapCodeSpanList(
      assessedOutcomes,
      `inventory row ${index} outcomes`,
    );
    const parsedSourceIds = unwrapCodeSpanList(
      sourceIds,
      `inventory row ${index} sources`,
    );
    for (const outcomeId of parsedAssessedOutcomes) {
      assert.match(outcomeId, /^(?:quiz|iq)-harness-\d{2}-\d+$/);
    }
    for (const sourceId of parsedSourceIds) {
      assert.match(sourceId, /^res-harness-[a-z0-9-]+$/);
    }
    return {
      visualId: unwrapSingleCodeSpan(visualId, `inventory row ${index} visual`),
      role: unwrapSingleCodeSpan(role, `inventory row ${index} role`),
      lessonId: ownerMatch[1],
      sectionId: ownerMatch[2],
      assessedOutcomes: parsedAssessedOutcomes,
      sourceIds: parsedSourceIds,
      cognitiveQuestion,
      storyboard,
      permissionDecision,
      status,
    };
  });

  const publicationRows = readMarkdownTable(markdown, [
    'visualId',
    'fixtureId',
    'publicationStatus',
  ]).map((cells, index) => ({
    visualId: unwrapSingleCodeSpan(cells[0], `publication row ${index} visual`),
    fixtureId: unwrapSingleCodeSpan(cells[1], `publication row ${index} fixture`),
    publicationStatus: unwrapSingleCodeSpan(cells[2], `publication row ${index} status`),
  }));

  return { markdown, rows, publicationRows };
}

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

test('publishes twenty-four valid original Harness visuals with exactly one overview per lesson', () => {
  assert.equal(agentHarnessVisuals.length, 24);
  assert.equal(Object.keys(EXPECTED_OWNER).length, 24);

  const ids = new Set();
  for (const visual of agentHarnessVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.equal(validateRenderableVisual(visual).valid, true, visual.id);
    assert.equal(visual.provenance, 'original-synthesis');
    assert.equal(visual.permission, null);
    assert.equal(visual.verifiedAt, '2026-07-30');
    assert.ok(!ids.has(visual.id), `${visual.id}: duplicate module visual`);
    ids.add(visual.id);
  }

  for (const lesson of agentHarness.lessons) {
    const lessonVisuals = agentHarnessVisuals.filter((visual) => (
      visual.id.startsWith(`visual-${lesson.id}-`)
    ));
    assert.equal(lessonVisuals.length, 3, `${lesson.id}: requires three visuals`);
    assert.equal(
      lessonVisuals.filter(({ role }) => role === 'overview').length,
      1,
      `${lesson.id}: requires exactly one overview`,
    );
  }
});

test('registers every Harness visual globally without duplicate IDs', () => {
  const globalIds = new Set();
  for (const visual of knowledgeVisuals) {
    assert.ok(!globalIds.has(visual.id), `${visual.id}: duplicate global visual`);
    globalIds.add(visual.id);
  }
  for (const visual of agentHarnessVisuals) {
    assert.ok(globalIds.has(visual.id), `${visual.id}: missing from shared registry`);
    assert.ok(knowledgeVisuals.includes(visual), `${visual.id}: identity must be preserved`);
  }
});

test('inventory fully traces every published registry visual and all step assets', async () => {
  const { markdown, rows, publicationRows } = await readInventory();
  const rowsByVisualId = new Map(rows.map((row) => [row.visualId, row]));
  const publicationByVisualId = new Map(
    publicationRows.map((row) => [row.visualId, row]),
  );
  const assessmentIds = new Set([
    ...agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...agentHarness.interviewQuestions.map(({ id }) => id),
  ]);
  const resourcesById = new Map(
    agentHarness.resources.map((resource) => [resource.id, resource]),
  );
  const fixturesByVisualId = new Map(
    agentHarnessVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
  );
  const inventoryFixturesByVisualId = new Map(
    agentHarnessVisualInventoryFixtures.map((fixture) => [fixture.visualId, fixture]),
  );

  assert.deepEqual(
    splitMarkdownTableRow('| escaped \\| pipe | `literal` |'),
    ['escaped | pipe', '`literal`'],
    'inventory parser must preserve escaped cell delimiters',
  );

  assert.equal(rows.length, agentHarnessVisuals.length);
  assert.equal(rowsByVisualId.size, rows.length, 'inventory visual IDs must be unique');
  assert.equal(publicationRows.length, agentHarnessVisuals.length);
  assert.equal(publicationByVisualId.size, publicationRows.length);
  assert.equal(agentHarnessVisualInventoryFixtures.length, agentHarnessVisuals.length);
  assert.equal(inventoryFixturesByVisualId.size, agentHarnessVisualInventoryFixtures.length);

  for (const visual of agentHarnessVisuals) {
    const row = rowsByVisualId.get(visual.id);
    assert.ok(row, `${visual.id}: missing inventory row`);
    assert.equal(row.role, visual.role, `${visual.id}: inventory role drift`);
    assert.deepEqual(
      [row.lessonId, row.sectionId],
      EXPECTED_OWNER[visual.id],
      `${visual.id}: inventory owner drift`,
    );
    const lesson = agentHarness.lessons.find(({ id }) => id === row.lessonId);
    assert.ok(
      lesson.knowledgeNote.sections.some(({ id }) => id === row.sectionId),
      `${visual.id}: inventory section does not exist`,
    );
    const section = lesson.knowledgeNote.sections.find(({ id }) => id === row.sectionId);
    assert.ok(row.assessedOutcomes.length > 0, `${visual.id}: assessed outcome is required`);
    for (const outcomeId of row.assessedOutcomes) {
      assert.ok(assessmentIds.has(outcomeId), `${visual.id}: unknown outcome ${outcomeId}`);
      assert.ok(outcomeId.includes(row.lessonId), `${visual.id}: cross-lesson outcome ${outcomeId}`);
    }
    assert.deepEqual(row.sourceIds, visual.sourceIds, `${visual.id}: inventory source order drift`);
    for (const sourceId of row.sourceIds) {
      assert.ok(resourcesById.has(sourceId), `${visual.id}: unknown inventory source ${sourceId}`);
      assert.ok(lesson.resourceIds.includes(sourceId),
        `${visual.id}: ${sourceId} is outside ${lesson.id}`);
      assert.ok(section.sourceIds.includes(sourceId),
        `${visual.id}: ${sourceId} is outside ${section.id}`);
    }
    const inventoryFixture = inventoryFixturesByVisualId.get(visual.id);
    assert.ok(inventoryFixture, `${visual.id}: missing inventory text fixture`);
    assert.deepEqual(
      row.assessedOutcomes,
      inventoryFixture.assessedOutcomes,
      `${visual.id}: assessed outcome drift`,
    );
    assert.equal(
      row.cognitiveQuestion,
      inventoryFixture.cognitiveQuestion,
      `${visual.id}: cognitive question/form drift`,
    );
    assert.equal(
      row.storyboard,
      inventoryFixture.storyboard,
      `${visual.id}: storyboard/fixture contract drift`,
    );
    assert.equal(fixturesByVisualId.get(visual.id)?.id, visual.fixtureId, visual.id);
    assert.equal(visual.provenance, 'original-synthesis');
    assert.equal(visual.permission, null);
    assert.equal(
      row.permissionDecision,
      'Original synthesis; no third-party media selected.',
      `${visual.id}: permission decision drift`,
    );
    assert.equal(row.status, 'verified', `${visual.id}: production verification status drift`);
    assert.deepEqual(
      publicationByVisualId.get(visual.id),
      {
        visualId: visual.id,
        fixtureId: visual.fixtureId,
        publicationStatus: 'published',
      },
      `${visual.id}: fixture/publication truth drift`,
    );
    assert.ok(knowledgeVisuals.includes(visual), `${visual.id}: published status requires shared index`);
  }

  const stepRows = readMarkdownTable(markdown, [
    'step asset',
    'parent visualId',
    'inherited assessed outcomes',
    'expected visible labels',
  ]).map((cells, index) => ({
    assetPath: unwrapSingleCodeSpan(cells[0], `step row ${index} asset`),
    parentVisualId: unwrapSingleCodeSpan(cells[1], `step row ${index} parent`),
    assessedOutcomes: unwrapCodeSpanList(cells[2], `step row ${index} outcomes`),
    visibleLabels: unwrapCodeSpanList(cells[3], `step row ${index} labels`),
  }));
  const registrySteps = agentHarnessVisuals.flatMap((visual) => (
    (visual.steps ?? []).map((step) => ({ visual, step }))
  ));
  assert.equal(stepRows.length, registrySteps.length);
  for (const { visual, step } of registrySteps) {
    const row = stepRows.find(({ assetPath }) => assetPath === step.assetPath);
    assert.ok(row, `${step.assetPath}: missing step inventory row`);
    assert.equal(row.parentVisualId, visual.id, step.assetPath);
    assert.deepEqual(
      row.assessedOutcomes,
      rowsByVisualId.get(visual.id).assessedOutcomes,
      `${step.assetPath}: inherited outcomes drift`,
    );
    assert.deepEqual(
      row.visibleLabels,
      fixturesByVisualId.get(visual.id).stepLabels[step.assetPath],
      `${step.assetPath}: visible fixture labels drift`,
    );
  }
});

test('owns every visual exactly once inside its lesson and source-bearing section', async () => {
  const ownership = await validateKnowledgeVisualOwnership({
    courseRegistry: { agentHarness },
    knowledgeVisuals: agentHarnessVisuals,
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
      placement.visualId,
    );
    if (placement.kind === 'section') {
      const sectionPlacement = placement.ownerSection.visuals.find(
        ({ visualId }) => visualId === placement.visualId,
      );
      assert.ok(
        Number.isInteger(sectionPlacement.afterParagraph)
          && sectionPlacement.afterParagraph >= 0
          && sectionPlacement.afterParagraph < placement.ownerSection.paragraphs.length,
        `${placement.visualId}: afterParagraph must resolve`,
      );
    }
  }
});

test('renders only strict local SVG and finds fixture labels in visible text nodes', async () => {
  const visibilityProbe = parseStrictSvg(
    '<svg xmlns="http://www.w3.org/2000/svg">'
      + '<text>VISIBLE<tspan aria-hidden="true">HIDDEN</tspan></text>'
      + '</svg>',
    'visible fixture text probe',
  );
  assert.equal(visibleSvgText(visibilityProbe), 'VISIBLE');

  const fixturesByVisualId = new Map(
    agentHarnessVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
  );
  assert.equal(fixturesByVisualId.size, 24);

  for (const visual of agentHarnessVisuals) {
    const fixture = fixturesByVisualId.get(visual.id);
    assert.ok(fixture, `${visual.id}: missing fixture`);
    assert.equal(visual.fixtureId, fixture.id);
    const paths = [
      visual.assetPath,
      ...(visual.steps?.map(({ assetPath }) => assetPath) ?? []),
    ];
    const parsedByPath = new Map();
    for (const assetPath of paths) {
      const svg = await readFile(new URL(`../${assetPath}`, import.meta.url), 'utf8');
      parsedByPath.set(assetPath, assertSafeStaticSvg(svg, visual, assetPath));
    }
    const primaryVisibleText = visibleSvgText(parsedByPath.get(visual.assetPath));
    for (const label of fixture.labels) {
      assert.ok(
        primaryVisibleText.includes(label),
        `${visual.id}: missing visible fixture label ${label}`,
      );
    }
    for (const value of fixture.values) {
      assert.ok(
        primaryVisibleText.includes(String(value)),
        `${visual.id}: missing visible fixture value ${value}`,
      );
    }
    const expectedStepPaths = visual.steps?.map(({ assetPath }) => assetPath) ?? [];
    assert.deepEqual(
      Object.keys(fixture.stepLabels ?? {}),
      expectedStepPaths,
      `${visual.id}: step fixture path drift`,
    );
    for (const assetPath of expectedStepPaths) {
      const stepVisibleText = visibleSvgText(parsedByPath.get(assetPath));
      for (const label of fixture.stepLabels[assetPath]) {
        assert.ok(
          stepVisibleText.includes(label),
          `${assetPath}: missing visible step label ${label}`,
        );
      }
    }
  }
});

test('freezes the registry, step definitions, placements and fixture truth recursively', () => {
  assertDeepFrozen(agentHarnessVisuals, 'agentHarnessVisuals');
  assertDeepFrozen(agentHarnessVisualFixtures, 'agentHarnessVisualFixtures');
  assertDeepFrozen(
    agentHarnessVisualInventoryFixtures,
    'agentHarnessVisualInventoryFixtures',
  );
  for (const lesson of agentHarness.lessons) {
    assertDeepFrozen(lesson.knowledgeNote, `${lesson.id}.knowledgeNote`);
  }
});

test('advances the real Harness transcript and re-arms its accessible image fallback', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const visual = agentHarnessVisuals.find(
    ({ id }) => id === 'visual-harness-01-tool-transcript',
  );
  const figure = renderKnowledgeVisual(visual);
  const image = figure.querySelector('img');
  const status = figure.querySelector('.knowledge-visual__step-status');
  const fallback = figure.querySelector('.knowledge-visual__fallback');
  const next = findButton(figure, '下一步');
  const titles = ['提议', '执行', '观察'];

  assert.equal(status.textContent, `1 / 3 · ${titles[0]}`);
  assert.equal(image.getAttribute('src'), visual.steps[0].assetPath);
  assert.equal(image.getAttribute('alt'), visual.steps[0].alt);
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
    assert.equal(next.disabled, index === titles.length - 1);
  });

  assert.ok(figure.querySelector('details').textContent.includes(
    visual.longDescription,
  ));
});
