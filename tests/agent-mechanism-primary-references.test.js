import test from 'node:test';
import assert from 'node:assert/strict';

import {
  agentMechanism,
  resolveAgentSourceImpactTarget,
} from '../src/data/agent-mechanism.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import { agentMechanismVisuals } from '../src/data/visuals/agent-mechanism-visuals.js';
import {
  agentAssessmentTextEvidence,
} from './fixtures/agent-mechanism-semantic-evidence.js';
import {
  agentPrimarySectionEvidence,
} from './fixtures/agent-mechanism-primary-section-evidence.js';
import {
  agentSourceImpactDecisionEvidence,
  irrelevantImpactMutation,
} from './fixtures/agent-mechanism-source-impact-evidence.js';

const legacyIds = [
  'res-agent-anthropic-effective', 'res-agent-openai-guide',
  'res-agent-berkeley-course', 'res-agent-hf-course', 'res-agent-ms-course',
  'res-agent-hello-agents', 'res-agent-dlai-agentic',
  'res-agent-lilian-weng', 'res-agent-lihongyi',
  'res-agent-datawhale-bili', 'res-agent-disney-planner-bili',
  'res-agent-ms-tool-video', 'res-agent-ms-plan-video',
  'res-agent-react-paper', 'res-agent-tot-paper', 'res-agent-plan-solve',
  'res-agent-rewoo', 'res-agent-toolformer', 'res-agent-openai-function',
  'res-agent-anthropic-tools', 'res-agent-aws-idempotent-apis',
  'res-agent-coala', 'res-agent-reflexion', 'res-agent-self-refine',
  'res-agent-no-self-correct', 'res-agent-critic',
  'res-agent-agentbench', 'res-agent-tau-bench',
  'res-agent-douyin-claude-code',
];

const primaryIntent = {
  'agent-01': ['primary-javaguide-agent-basis', 'primary-feishu-beyond-model', 'primary-feishu-react-loop'],
  'agent-02': ['primary-javaguide-prompt-engineering', 'primary-feishu-react-loop', 'primary-feishu-loop-engineering-intro'],
  'agent-03': ['primary-javaguide-agent-skills', 'primary-javaguide-mcp', 'primary-feishu-tool-truth'],
  'agent-04': ['primary-javaguide-loop-engineering', 'primary-feishu-react-loop', 'primary-feishu-autonomous-evolution'],
  'agent-05': ['primary-javaguide-workflow-graph-loop', 'primary-feishu-react-orchestration', 'primary-feishu-dynamic-workflow'],
  'agent-06': ['primary-javaguide-loop-engineering', 'primary-feishu-agent-version-drifting', 'primary-feishu-dynamic-workflow'],
  'agent-07': ['primary-javaguide-context-engineering', 'primary-javaguide-agent-memory', 'primary-feishu-claude-ai-memory'],
  'agent-08': ['primary-javaguide-agent-basis', 'primary-javaguide-harness-engineering', 'primary-feishu-react-orchestration', 'primary-feishu-beyond-model', 'primary-feishu-agent-version-drifting'],
};

function assessmentText(assessment) {
  return [
    assessment.prompt, assessment.question, assessment.shortAnswer,
    assessment.explanation, ...(assessment.choices ?? []),
    ...(assessment.deepDive ?? []),
  ].filter(Boolean).join(' ');
}

function sourceImpactSectionText(section) {
  return [section.title, ...section.paragraphs, ...section.keyPoints].join(' ');
}

function satisfiesSourceImpactContract(decision, resolved, contract) {
  return resolved.lessonId === decision.lessonId
    && resolved.section.id === decision.sectionId
    && resolved.section.sourceIds.includes(decision.resourceId)
    && contract.targetPatterns.some(
      (pattern) => pattern.test(JSON.stringify(resolved.value)),
    )
    && contract.sectionPatterns.some(
      (pattern) => pattern.test(sourceImpactSectionText(resolved.section)),
    )
    && contract.summaryPatterns.some((pattern) => pattern.test(decision.summary));
}

function assertContracts(assessments, contracts) {
  assert.deepEqual(new Set(assessments.map(({ id }) => id)), new Set(Object.keys(contracts)));
  for (const assessment of assessments) {
    assert.deepEqual(new Set(assessment.conceptTags), new Set(Object.keys(contracts[assessment.id])));
    const text = assessmentText(assessment);
    for (const patterns of Object.values(contracts[assessment.id])) {
      assert.ok(patterns.some((pattern) => pattern.test(text)), assessment.id);
    }
  }
}

test('preserves Agent stable identities while adding course-owned primary bindings', () => {
  assert.deepEqual(agentMechanism.lessons.map(({ id }) => id), Object.keys(primaryIntent));
  assert.deepEqual(
    agentMechanism.resources.filter(({ id }) => !id.startsWith('res-agent-primary-')).map(({ id }) => id),
    legacyIds,
  );
  assert.equal(agentMechanism.interviewQuestions.length, 24);
  assert.equal(agentMechanism.lessons.flatMap(({ quiz }) => quiz).length, 16);
  assert.deepEqual(
    agentMechanism.lessons.filter(({ exercise }) => exercise.experiment).map(({ id }) => id),
    ['agent-03', 'agent-04', 'agent-05'],
  );
});

test('binds both primary families to every required lesson intent', () => {
  const resources = new Map(agentMechanism.resources.map((resource) => [resource.id, resource]));
  for (const [lessonId, canonicalIds] of Object.entries(primaryIntent)) {
    const lesson = agentMechanism.lessons.find(({ id }) => id === lessonId);
    const bound = lesson.resourceIds.map((id) => resources.get(id)).filter(({ canonicalSourceId }) => canonicalSourceId);
    assert.deepEqual(new Set(bound.map(({ canonicalSourceId }) => canonicalSourceId)), new Set(canonicalIds), lessonId);
    assert.deepEqual(new Set(bound.map(({ sourceFamily }) => sourceFamily)), new Set(['javaguide-ai', 'feishu-harness-101']));
    for (const resource of bound) {
      assert.ok(resource.id.startsWith('res-agent-primary-'));
      assert.equal(resource.title, getPrimaryReference(resource.canonicalSourceId).title);
      assert.ok(Object.isFrozen(resource));
    }
  }
});

test('every lesson-bound primary source owns a semantically anchored note section', () => {
  for (const lesson of agentMechanism.lessons) {
    const primaryIds = lesson.resourceIds.filter((id) => id.startsWith('res-agent-primary-'));
    const contracts = agentPrimarySectionEvidence[lesson.id];
    assert.deepEqual(new Set(primaryIds), new Set(Object.keys(contracts)), lesson.id);
    for (const resourceId of primaryIds) {
      const owners = lesson.knowledgeNote.sections.filter(
        ({ sourceIds }) => sourceIds.includes(resourceId),
      );
      assert.ok(owners.length > 0, `${lesson.id}: ${resourceId} is not cited by note text`);
      assert.ok(
        owners.some((section) => contracts[resourceId].test([
          section.title,
          ...section.paragraphs,
          ...section.keyPoints,
        ].join(' '))),
        `${lesson.id}: ${resourceId} has no independent semantic anchor`,
      );
    }
  }
});

test('eight notes teach the required Agent mechanism spine rather than only linking sources', () => {
  const noteText = Object.fromEntries(agentMechanism.lessons.map((lesson) => [
    lesson.id,
    JSON.stringify(lesson.knowledgeNote),
  ]));
  const contracts = {
    'agent-01': [/决策位置|谁决定下一步/, /state.*action.*feedback|状态.*动作.*反馈/is, /有界权限|受限动作空间/],
    'agent-02': [/intent.*objective.*constraints.*success.*termination/is, /自然语言计划.*状态机.*event log/is],
    'agent-03': [/definition.*schema.*discovery.*selection.*auth.*execution.*observation/is, /Skills.*MCP.*不等于|Skills\s*≠\s*MCP/is],
    'agent-04': [/reason.*action.*observation/is, /private.*CoT|隐藏思维链/is, /continue.*stop|继续.*停止/is],
    'agent-05': [/direct.*plan-then-act.*replan.*workflow graph/is, /依赖.*并行.*委派.*不确定性/s],
    'agent-06': [/retry.*replan.*reflection.*external validation/is, /reflection.*proof|反思.*证明/is, /耐久恢复.*Harness|Harness.*耐久恢复/s],
    'agent-07': [/transcript.*scratchpad.*plan state.*retrieved evidence.*long-term memory/is, /压缩.*offload.*provenance/is],
    'agent-08': [/single-Agent.*端到端/is, /tool failure.*ambiguous success.*stale context.*unauthorized action.*drift/is],
  };
  for (const [lessonId, patterns] of Object.entries(contracts)) {
    for (const pattern of patterns) assert.match(noteText[lessonId], pattern, lessonId);
  }
});

test('40 assessments carry independently evidenced concept tags', () => {
  const assessments = [
    ...agentMechanism.lessons.flatMap(({ quiz }) => quiz),
    ...agentMechanism.interviewQuestions,
  ];
  assert.equal(assessments.length, 40);
  assertContracts(assessments, agentAssessmentTextEvidence);
  const mutation = {
    ...assessments[0],
    prompt: 'HTTP cache headers and TCP congestion windows',
    question: 'HTTP cache headers and TCP congestion windows',
    shortAnswer: 'HTTP cache headers and TCP congestion windows',
    explanation: 'HTTP cache headers and TCP congestion windows',
    choices: ['HTTP cache headers', 'TCP congestion windows'],
    deepDive: ['HTTP cache headers and TCP congestion windows'],
  };
  const contract = agentAssessmentTextEvidence[mutation.id];
  assert.equal(Object.values(contract).flat().some((pattern) => pattern.test(assessmentText(mutation))), false);
});

test('assessment and visual outcomes cover each other bidirectionally', () => {
  const { assessments, visuals, assessmentVisualCoverage } = agentMechanism.outcomeRegistry;
  assert.deepEqual(new Set(Object.keys(visuals)), new Set(agentMechanismVisuals.map(({ id }) => id)));
  for (const [assessmentId, links] of Object.entries(assessmentVisualCoverage)) {
    assert.ok(links.length > 0, assessmentId);
    for (const visualId of links) {
      assert.ok(assessments[assessmentId]);
      assert.ok(visuals[visualId]);
      assert.ok(
        assessments[assessmentId].outcomeTags.some((tag) => visuals[visualId].includes(tag)),
        `${assessmentId} -> ${visualId}`,
      );
    }
  }
  for (const [visualId, tags] of Object.entries(visuals)) {
    const linked = Object.entries(assessmentVisualCoverage)
      .filter(([, ids]) => ids.includes(visualId))
      .flatMap(([id]) => assessments[id].outcomeTags);
    assert.deepEqual(new Set(linked), new Set(tags), visualId);
  }
});

test('source impact decisions strictly own independently anchored targets and summaries', () => {
  const approved = new Set(['adopted', 'corrected', 'deepened', 'rejected', 'duplicate']);
  const lessons = new Map(agentMechanism.lessons.map((lesson) => [lesson.id, lesson]));
  const resources = new Map(agentMechanism.resources.map((resource) => [resource.id, resource]));
  assert.deepEqual(
    new Set(agentMechanism.sourceImpactAudit.map(({ decisionId }) => decisionId)),
    new Set(Object.keys(agentSourceImpactDecisionEvidence)),
  );
  for (const decision of agentMechanism.sourceImpactAudit) {
    const contract = agentSourceImpactDecisionEvidence[decision.decisionId];
    assert.ok(approved.has(decision.contribution), decision.decisionId);
    for (const field of [
      'lessonId', 'resourceId', 'targetId', 'targetType',
      'scope', 'sectionId', 'semanticKey', 'contribution',
    ]) {
      assert.equal(decision[field], contract[field], `${decision.decisionId}:${field}`);
    }
    assert.ok(resources.has(decision.resourceId), decision.resourceId);
    assert.ok(
      lessons.get(decision.lessonId).resourceIds.includes(decision.resourceId),
      `${decision.decisionId}: resource owner`,
    );
    const resolved = resolveAgentSourceImpactTarget(decision.targetId);
    assert.equal(resolved.type, decision.targetType);
    assert.equal(resolved.lessonId, decision.lessonId);
    assert.ok(resolved.resourceIds.includes(decision.resourceId));
    assert.ok(resolved.semanticKeys.includes(decision.semanticKey));
    assert.equal(resolved.section.id, decision.sectionId);
    assert.equal(resolved.section.id, contract.sectionId);
    assert.ok(resolved.section.sourceIds.includes(decision.resourceId));
    assert.ok(
      contract.targetPatterns.some((pattern) => pattern.test(JSON.stringify(resolved.value))),
      decision.targetId,
    );
    assert.ok(
      contract.sectionPatterns.some((pattern) => pattern.test(sourceImpactSectionText(resolved.section))),
      `${decision.decisionId}:section`,
    );
    assert.ok(
      contract.summaryPatterns.some((pattern) => pattern.test(decision.summary)),
      `${decision.decisionId}:summary`,
    );
    assert.deepEqual(resolved.outcomes.tags, contract.outcomeTags);
    assert.deepEqual(
      resolved.outcomes.assessments.map(({ id }) => id),
      contract.assessmentIds,
    );
    assert.deepEqual(
      resolved.outcomes.visuals.map(({ id }) => id),
      contract.visualIds,
    );
    for (const assessment of resolved.outcomes.assessments) {
      assert.ok(
        assessment.outcomeTags.some((tag) => contract.outcomeTags.includes(tag)),
        `${decision.decisionId}:${assessment.id}`,
      );
    }
    for (const visual of resolved.outcomes.visuals) {
      assert.ok(
        visual.outcomeTags.some((tag) => contract.outcomeTags.includes(tag)),
        `${decision.decisionId}:${visual.id}`,
      );
    }
  }
  assert.throws(() => resolveAgentSourceImpactTarget('claim:not-real'), /Unknown/);
});

test('target, summary, real section text, and section ownership mutations all fail', () => {
  for (const decision of agentMechanism.sourceImpactAudit) {
    const contract = agentSourceImpactDecisionEvidence[decision.decisionId];
    const resolved = resolveAgentSourceImpactTarget(decision.targetId);
    const targetMutation = { ...resolved.value, text: irrelevantImpactMutation };
    const summaryMutation = { ...decision, summary: irrelevantImpactMutation };
    const sectionTextMutation = {
      ...resolved.section,
      title: irrelevantImpactMutation,
      paragraphs: [irrelevantImpactMutation],
      keyPoints: [irrelevantImpactMutation],
    };
    const sectionSourceMutation = {
      ...resolved.section,
      sourceIds: resolved.section.sourceIds.filter((id) => id !== decision.resourceId),
    };
    assert.equal(satisfiesSourceImpactContract(decision, resolved, contract), true);
    assert.equal(
      satisfiesSourceImpactContract(
        decision,
        { ...resolved, value: targetMutation },
        contract,
      ),
      false,
      `${decision.decisionId}: target mutation`,
    );
    assert.equal(
      satisfiesSourceImpactContract(summaryMutation, resolved, contract),
      false,
      `${decision.decisionId}: summary mutation`,
    );
    assert.equal(
      satisfiesSourceImpactContract(
        decision,
        { ...resolved, section: sectionTextMutation },
        contract,
      ),
      false,
      `${decision.decisionId}: section text mutation`,
    );
    assert.equal(
      satisfiesSourceImpactContract(
        decision,
        { ...resolved, section: sectionSourceMutation },
        contract,
      ),
      false,
      `${decision.decisionId}: section source mutation`,
    );
  }
});
