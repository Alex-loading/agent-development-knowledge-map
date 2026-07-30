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
import { agentHarnessVisualFixtures } from './fixtures/agent-harness-visual-fixtures.js';
import {
  FakeDocument,
  FakeEvent,
  findButton,
  installFakeDom,
} from './helpers/fake-dom.js';
import { assertSafeStaticSvg } from './helpers/static-svg.js';
import { validateKnowledgeVisualOwnership } from './helpers/visual-registry.js';

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

function unwrapCode(value) {
  return value.replace(/^`|`$/g, '');
}

async function readInventory() {
  const markdown = await readFile(
    new URL('../docs/research/2026-07-30-agent-harness-visual-inventory.md', import.meta.url),
    'utf8',
  );
  const lines = markdown.split('\n');
  const headerIndex = lines.findIndex((line) => (
    line === '| visualId | role | owner lesson / section | assessed outcomes | cognitive question and form | sourceIds | storyboard and fixture contract | permission decision | status |'
  ));
  assert.ok(headerIndex >= 0, 'inventory must publish the traceability column contract');

  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.startsWith('| `visual-harness-')) break;
    const cells = line.slice(1, -1).split('|').map((cell) => cell.trim());
    assert.equal(cells.length, 9, line);
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
    rows.push({
      visualId: unwrapCode(visualId),
      role: unwrapCode(role),
      lessonId: ownerMatch[1],
      sectionId: ownerMatch[2],
      assessedOutcomes: [...assessedOutcomes.matchAll(
        /`((?:quiz|iq)-harness-\d{2}-\d+)`/g,
      )].map((match) => match[1]),
      cognitiveQuestion,
      sourceIds,
      storyboard,
      permissionDecision,
      status,
    });
  }

  return { markdown, rows };
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

test('inventory traces every registry visual to its role, real owner and assessed outcomes', async () => {
  const { markdown, rows } = await readInventory();
  const rowsByVisualId = new Map(rows.map((row) => [row.visualId, row]));
  const assessmentIds = new Set([
    ...agentHarness.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    ...agentHarness.interviewQuestions.map(({ id }) => id),
  ]);

  assert.equal(rows.length, agentHarnessVisuals.length);
  assert.equal(rowsByVisualId.size, rows.length, 'inventory visual IDs must be unique');

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
    assert.ok(row.assessedOutcomes.length > 0, `${visual.id}: assessed outcome is required`);
    for (const outcomeId of row.assessedOutcomes) {
      assert.ok(assessmentIds.has(outcomeId), `${visual.id}: unknown outcome ${outcomeId}`);
      assert.ok(outcomeId.includes(row.lessonId), `${visual.id}: cross-lesson outcome ${outcomeId}`);
    }
  }

  for (const stepNumber of [1, 2, 3]) {
    assert.match(
      markdown,
      new RegExp(
        `harness-01-tool-transcript-step-${stepNumber}\\.svg[^\\n]+`
          + 'inherits `visual-harness-01-tool-transcript` outcomes',
      ),
      `step ${stepNumber}: must state inherited parent outcomes`,
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

test('renders only strict local SVG and derives visible state labels from frozen fixtures', async () => {
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
    for (const assetPath of paths) {
      const svg = await readFile(new URL(`../${assetPath}`, import.meta.url), 'utf8');
      assertSafeStaticSvg(svg, visual, assetPath);
    }
    const primarySvg = await readFile(
      new URL(`../${visual.assetPath}`, import.meta.url),
      'utf8',
    );
    for (const label of fixture.labels) {
      assert.ok(primarySvg.includes(label), `${visual.id}: missing fixture label ${label}`);
    }
    for (const value of fixture.values) {
      assert.ok(primarySvg.includes(String(value)), `${visual.id}: missing fixture value ${value}`);
    }
  }
});

test('freezes the registry, step definitions, placements and fixture truth recursively', () => {
  assertDeepFrozen(agentHarnessVisuals, 'agentHarnessVisuals');
  assertDeepFrozen(agentHarnessVisualFixtures, 'agentHarnessVisualFixtures');
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
