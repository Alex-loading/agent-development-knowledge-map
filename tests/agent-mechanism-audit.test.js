import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { agentMechanism } from '../src/data/agent-mechanism.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';

const auditUrl = new URL(
  '../docs/content-audits/2026-07-30-agent-mechanism-primary-reference-reconstruction.md',
  import.meta.url,
);

function parseSourceImpactRows(markdown) {
  const header = '| decisionId | lessonId | resourceId | scope | targetType | targetId | semanticKey | contribution | summary | rationale |';
  const start = markdown.indexOf(header);
  assert.notEqual(start, -1, 'source-impact parity header');
  const rows = [];
  for (const line of markdown.slice(start).split('\n').slice(2)) {
    if (!line.startsWith('|')) break;
    const [
      decisionId, lessonId, resourceId, scope, targetType,
      targetId, semanticKey, contribution, summary, rationale,
    ] = line.split('|').slice(1, -1).map((value) => value.trim());
    rows.push({
      decisionId,
      lessonId,
      resourceId,
      scope,
      targetType,
      targetId,
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
    targetId, semanticKey, contribution, summary, rationale,
  }) => ({
    decisionId,
    lessonId,
    resourceId,
    scope,
    targetType,
    targetId,
    semanticKey,
    contribution,
    summary,
    rationale,
  })));
  for (const { id, assetPath } of agentMechanismVisuals) {
    assert.equal(audit.split(`\`${id}\``).length - 1, 1, id);
    assert.ok(audit.includes(`\`${assetPath}\``), assetPath);
  }
  assert.match(audit, /内容质量[^0-9]*9[0-9]\s*\/\s*100/);
  assert.match(audit, /视觉质量[^0-9]*5[1-9]\s*\/\s*60/);
  for (const dimension of ['认知任务', '语义编码', '证据归属', '可访问性', '安全与几何']) {
    assert.match(audit, new RegExp(`${dimension}[^\\n]*[89]|${dimension}[^\\n]*1[0-5]`));
  }
  assert.match(audit, /第三方图表[^。\n]*拒绝直接复制/);
  assert.match(audit, /官方来源[^。\n]*(?:核验|交叉验证)/);
  assert.match(audit, /586\s*\/\s*586/);
});
