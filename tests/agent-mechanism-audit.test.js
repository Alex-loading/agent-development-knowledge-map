import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { agentMechanism } from '../src/data/agent-mechanism.js';
import {
  agentMechanismScenes,
  getAgentMechanismScene,
} from '../src/data/visuals/agent-mechanism-scenes.js';
import { renderAgentMechanismSvg } from '../src/data/visuals/agent-mechanism-svg.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';

const auditUrl = new URL(
  '../docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md',
  import.meta.url,
);

function parseSourceImpactRows(markdown) {
  const header = '| decisionId | lessonId | resourceId | scope | targetType | targetId | sectionId | semanticKey | contribution | summary | rationale |';
  const start = markdown.indexOf(header);
  assert.notEqual(start, -1, 'source-impact parity header');
  const rows = [];
  for (const line of markdown.slice(start).split('\n').slice(2)) {
    if (!line.startsWith('|')) break;
    const [
      decisionId, lessonId, resourceId, scope, targetType,
      targetId, sectionId, semanticKey, contribution, summary, rationale,
    ] = line.split('|').slice(1, -1).map((value) => value.trim());
    rows.push({
      decisionId,
      lessonId,
      resourceId,
      scope,
      targetType,
      targetId,
      sectionId,
      semanticKey,
      contribution,
      summary,
      rationale,
    });
  }
  return rows;
}

test('Agent reconstruction audit traces every source decision and visual asset exactly once', async () => {
  const audit = await readFile(auditUrl, 'utf8');
  assert.deepEqual(parseSourceImpactRows(audit), agentMechanism.sourceImpactAudit.map(({
    decisionId, lessonId, resourceId, scope, targetType,
    targetId, sectionId, semanticKey, contribution, summary, rationale,
  }) => ({
    decisionId,
    lessonId,
    resourceId,
    scope,
    targetType,
    targetId,
    sectionId,
    semanticKey,
    contribution,
    summary,
    rationale,
  })));
  for (const { id, assetPath } of agentMechanismVisuals) {
    assert.equal(audit.split(`\`${id}\``).length - 1, 1, id);
    assert.ok(audit.includes(`\`${assetPath}\``), assetPath);
  }
  const typeCounts = new Map();
  let edgeCount = 0;
  let feedbackCount = 0;
  let multiSegmentCount = 0;
  for (const scene of agentMechanismScenes) {
    typeCounts.set(scene.type, (typeCounts.get(scene.type) ?? 0) + 1);
    for (const edge of scene.edges ?? []) {
      edgeCount += 1;
      if (edge.kind === 'feedback') feedbackCount += 1;
      if (edge.points.length > 2) multiSegmentCount += 1;
    }
  }
  const typeFact = [...typeCounts].map(([type, count]) => `${type}=${count}`).join(', ');
  assert.ok(audit.includes(`scene-type parity: ${typeFact}`));
  assert.ok(audit.includes(
    `routing parity: edges=${edgeCount}, feedback=${feedbackCount}, multi-segment=${multiSegmentCount}`,
  ));
  const fontSizes = new Set();
  for (const visual of agentMechanismVisuals) {
    const svg = renderAgentMechanismSvg(visual, getAgentMechanismScene(visual.id));
    for (const match of svg.matchAll(/font-size="(\d+)"/g)) fontSizes.add(Number(match[1]));
  }
  assert.ok(audit.includes(`font-size parity: ${[...fontSizes].sort((a, b) => a - b).join(', ')}`));
  const lessonFourFact = audit.match(/^4\. `agent-04`:[^\n]+/m)?.[0] ?? '';
  assert.doesNotMatch(lessonFourFact, /飞书[^\n]*Loop Engineering/);
  assert.doesNotMatch(audit, /边只连接相邻节点|正文最小字号 16px/);
  assert.match(audit, /内容质量[^0-9]*9[0-9]\s*\/\s*100/);
  assert.match(audit, /视觉质量[^0-9]*5[1-9]\s*\/\s*60/);
  for (const dimension of ['认知任务', '语义编码', '证据归属', '可访问性', '安全与几何']) {
    assert.match(audit, new RegExp(`${dimension}[^\\n]*[89]|${dimension}[^\\n]*1[0-5]`));
  }
  assert.match(audit, /第三方图表[^。\n]*拒绝直接复制/);
  assert.match(audit, /官方来源[^。\n]*(?:核验|交叉验证)/);
  assert.match(audit, /591\s*\/\s*591/);
});
