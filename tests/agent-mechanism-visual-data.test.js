import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import { agentMechanism } from '../src/data/agent-mechanism.js';
import { getAgentMechanismScene } from '../src/data/visuals/agent-mechanism-scenes.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';

test('publishes two original, local and accessible Agent visuals per lesson', async () => {
  assert.equal(agentMechanismVisuals.length, 16);
  assert.equal(new Set(agentMechanismVisuals.map(({ id }) => id)).size, 16);
  assert.ok(agentMechanismVisuals.every(({ provenance }) => provenance === 'original-synthesis'));
  assert.ok(knowledgeVisuals.every((visual, index, all) => all.findIndex(({ id }) => id === visual.id) === index));
  for (const lesson of agentMechanism.lessons) {
    const prefix = `visual-${lesson.id}-`;
    const visuals = agentMechanismVisuals.filter(({ id }) => id.startsWith(prefix));
    assert.equal(visuals.length, 2, lesson.id);
    assert.ok(visuals.some(({ role }) => role === 'overview'), lesson.id);
    assert.equal(lesson.knowledgeNote.overviewVisualId, visuals.find(({ role }) => role === 'overview').id);
    assert.ok(lesson.knowledgeNote.overviewVisualSectionId);
    const placements = lesson.knowledgeNote.sections.flatMap((section) => section.visuals ?? []);
    assert.equal(placements.length, 1, lesson.id);
    assert.equal(placements[0].visualId, visuals.find(({ role }) => role !== 'overview').id);
    for (const visual of visuals) {
      assert.deepEqual(validateVisualAsset(visual), [], visual.id);
      assert.ok(visual.assessedCoverage.length > 0, visual.id);
      assert.ok(visual.alt.length >= 24, visual.id);
      assert.ok(visual.longDescription.length >= 50, visual.id);
      await access(new URL(`../${visual.assetPath}`, import.meta.url));
    }
  }
});

test('critical Agent visuals align topology, tags, and assessed outcomes', () => {
  const contracts = {
    'visual-agent-01-action-feedback-loop': {
      topology: 'directed-action-feedback',
      tag: 'process',
      outcome: 'agent-core',
    },
    'visual-agent-04-bounded-loop': {
      topology: 'bounded-loop-exits',
      tag: 'failure-mode',
      outcome: 'loop-control',
    },
    'visual-agent-05-orchestration-graph': {
      topology: 'parallel-fork-join',
      tag: 'relationship',
      outcome: 'orchestration',
    },
    'visual-agent-06-correction-ladder': {
      topology: 'retry-replan-reflect-validate',
      tag: 'failure-mode',
      outcome: 'external-validation',
    },
    'visual-agent-08-pressure-matrix': {
      topology: 'failure-control-exit-matrix',
      tag: 'failure-mode',
      outcome: 'pressure-test',
    },
  };
  for (const [visualId, contract] of Object.entries(contracts)) {
    const visual = agentMechanismVisuals.find(({ id }) => id === visualId);
    const scene = getAgentMechanismScene(visualId);
    assert.equal(scene.topology, contract.topology, visualId);
    assert.ok(visual.tags.includes(contract.tag), `${visualId}: ${contract.tag}`);
    assert.ok(visual.assessedCoverage.includes(contract.outcome), `${visualId}: ${contract.outcome}`);
  }
});

test('Agent SVG files are strict local static artifacts', async () => {
  for (const visual of agentMechanismVisuals) {
    const svg = await readFile(new URL(`../${visual.assetPath}`, import.meta.url), 'utf8');
    const scene = getAgentMechanismScene(visual.id);
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /viewBox="0 0 1200 675"/);
    assert.doesNotMatch(
      svg.replace('http://www.w3.org/2000/svg', ''),
      /<script|foreignObject|onload=|javascript:|data:|https?:\/\//i,
    );
    assert.doesNotMatch(svg, /font-size="(?:[0-9]|1[0-3])"/);
    if (scene.type === 'matrix') {
      assert.match(svg, /data-kind="matrix"/);
      assert.match(svg, /data-row=/);
      assert.match(svg, /data-column=/);
      assert.doesNotMatch(svg, /data-node=/);
    } else {
      assert.match(svg, /data-node=/);
      assert.match(svg, /data-edge=/);
    }
  }
});
