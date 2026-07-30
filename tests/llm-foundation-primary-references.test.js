import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import * as llmData from '../src/data/llm-foundation.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import { llmFoundationVisuals } from '../src/data/visuals/llm-foundation-visuals.js';
import {
  readMarkdownTable,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const { llmFoundation } = llmData;

const lessonIds = Object.freeze([
  'llm-01',
  'llm-02',
  'llm-03',
  'llm-04',
  'llm-05',
  'llm-06',
  'llm-07',
  'llm-08',
]);

const legacyResourceIds = Object.freeze([
  'res-ms-ai',
  'res-ms-genai',
  'res-ms-agents',
  'res-hf-llm',
  'res-hf-agents',
  'res-karpathy',
  'res-karpathy-build-gpt',
  'res-rasbt',
  'res-happy-llm',
  'res-llm-universe',
  'res-hello-agents',
  'res-openai-cookbook',
  'res-openai-evals',
  'res-openai-agents',
  'res-tiktoken',
  'res-anthropic-agents',
  'res-stanford-cs336',
  'res-google-ml',
  'res-fastai',
  'res-d2l-zh',
  'res-3b1b-nn',
  'res-3b1b-transformer',
  'res-3b1b-attention',
  'res-attention-paper',
  'res-limu-transformer',
  'res-wangmutou-transformer',
  'res-owasp-prompt-injection',
  'res-zomi-bili',
]);

const primaryIntentByLesson = Object.freeze({
  'llm-01': [
    'primary-javaguide-ai',
    'primary-javaguide-ai-core-concepts',
  ],
  'llm-02': ['primary-javaguide-llm-operation-mechanism'],
  'llm-03': [
    'primary-javaguide-llm-operation-mechanism',
    'primary-javaguide-prompt-engineering',
    'primary-feishu-claude-ai-memory',
    'primary-feishu-context-offloading',
  ],
  'llm-04': ['primary-javaguide-llm-operation-mechanism'],
  'llm-05': [
    'primary-javaguide-ai-core-concepts',
    'primary-feishu-agent-version-drifting',
  ],
  'llm-06': [
    'primary-javaguide-llm-operation-mechanism',
    'primary-feishu-agent-version-drifting',
  ],
  'llm-07': [
    'primary-javaguide-llm-api-engineering',
    'primary-javaguide-structured-output-function-calling',
    'primary-feishu-tool-truth',
  ],
  'llm-08': [
    'primary-javaguide-llm-evaluation',
    'primary-feishu-agent-version-drifting',
    'primary-feishu-beyond-model',
  ],
});

const materialContributions = new Set(['adopted', 'corrected', 'deepened']);
const allContributions = new Set([
  ...materialContributions,
  'rejected',
  'duplicate',
]);

function assertDeepFrozen(value, label, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true, label);
  for (const [key, nested] of Object.entries(value)) {
    assertDeepFrozen(nested, `${label}.${key}`, seen);
  }
}

test('preserves every public LLM identity while adding primary bindings', () => {
  assert.deepEqual(llmFoundation.lessons.map(({ id }) => id), lessonIds);
  assert.deepEqual(
    llmFoundation.lessons.flatMap(({ quiz }) => quiz.map(({ id }) => id)),
    lessonIds.flatMap((lessonId) => [
      `quiz-${lessonId}-1`,
      `quiz-${lessonId}-2`,
    ]),
  );
  assert.deepEqual(
    llmFoundation.interviewQuestions.map(({ id }) => id),
    lessonIds.flatMap((lessonId) => [
      `iq-${lessonId}-1`,
      `iq-${lessonId}-2`,
      `iq-${lessonId}-3`,
    ]),
  );
  assert.deepEqual(
    llmFoundation.lessons
      .filter(({ exercise }) => exercise.experiment)
      .map(({ id, exercise }) => [id, exercise.experiment]),
    [
      ['llm-03', 'token-budget'],
      ['llm-04', 'attention'],
      ['llm-06', 'sampling'],
    ],
  );
  assert.deepEqual(
    llmFoundation.resources.slice(0, legacyResourceIds.length).map(({ id }) => id),
    legacyResourceIds,
  );
  assert.equal(llmFoundationVisuals.length, 40);
  assert.equal(
    llmFoundationVisuals.reduce((sum, visual) => sum + (visual.steps?.length ?? 0), 0),
    12,
  );
});

test('binds the approved primary source intent through the canonical registry', () => {
  const resourcesById = new Map(
    llmFoundation.resources.map((resource) => [resource.id, resource]),
  );
  const primaryResources = llmFoundation.resources.filter(
    ({ sourceTier }) => sourceTier === 'primary-narrative',
  );

  assert.equal(primaryResources.length, 13);
  assert.equal(llmFoundation.resources.length, legacyResourceIds.length + 13);
  for (const resource of primaryResources) {
    assertDeepFrozen(resource, resource.id);
  }
  assert.equal(
    new Set(primaryResources.map(({ id }) => id)).size,
    primaryResources.length,
  );

  for (const resource of primaryResources) {
    assert.match(resource.id, /^res-llm-primary-/);
    const canonical = getPrimaryReference(resource.canonicalSourceId);
    assert.ok(canonical, resource.id);
    assert.equal(resource.title, canonical.title, resource.id);
    assert.equal(resource.url, canonical.canonicalUrl, resource.id);
    assert.equal(resource.sourceFamily, canonical.sourceFamily, resource.id);
    assert.equal(resource.evidence.verifiedAt, '2026-07-30', resource.id);
    assert.ok(resource.evidence.learningUse.length >= 20, resource.id);
    assert.equal(
      resource.value,
      `学习用途：${resource.evidence.learningUse}`
        + `；覆盖范围：${resource.evidence.coverage.join('、')}`
        + `；证据边界：${resource.evidence.limitations}`,
      resource.id,
    );
    if (resource.sourceFamily === 'feishu-harness-101') {
      assert.equal(resource.evidence.authority, 'expert', resource.id);
      assert.match(resource.evidence.limitations, /观察|教学|作者/);
      assert.match(
        resource.evidence.limitations,
        /不(?:代表|构成|保证|等于).*?(?:通用|产品|模型|协议|事实)/,
      );
    }
  }

  for (const lesson of llmFoundation.lessons) {
    const canonicalIds = lesson.resourceIds
      .map((id) => resourcesById.get(id))
      .filter(({ sourceTier }) => sourceTier === 'primary-narrative')
      .map(({ canonicalSourceId }) => canonicalSourceId);
    for (const expected of primaryIntentByLesson[lesson.id]) {
      assert.ok(canonicalIds.includes(expected), `${lesson.id}: missing ${expected}`);
    }
    assert.ok(
      lesson.knowledgeNote.sections.some(({ sourceIds }) => (
        sourceIds.some((id) => resourcesById.get(id)?.sourceTier === 'primary-narrative')
      )),
      `${lesson.id}: primary source never reaches the note`,
    );
  }
});

test('publishes real assessment concept tags and closes visual learning outcomes', () => {
  const assessmentsByLesson = new Map(
    lessonIds.map((lessonId) => [lessonId, [
      ...llmFoundation.lessons.find(({ id }) => id === lessonId).quiz,
      ...llmFoundation.interviewQuestions.filter(
        (assessment) => assessment.lessonId === lessonId,
      ),
    ]]),
  );

  assertDeepFrozen(llmFoundation.outcomeRegistry, 'outcomeRegistry');
  for (const [lessonId, assessments] of assessmentsByLesson) {
    for (const assessment of assessments) {
      assert.ok(assessment.conceptTags.length > 0, assessment.id);
      assert.equal(new Set(assessment.conceptTags).size, assessment.conceptTags.length);
      assert.deepEqual(
        llmFoundation.outcomeRegistry.assessments[assessment.id],
        {
          lessonId,
          outcomeTags: assessment.conceptTags,
        },
      );
    }

    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    const placements = [
      lesson.knowledgeNote.overviewVisualId,
      ...lesson.knowledgeNote.sections.flatMap(
        ({ visuals = [] }) => visuals.map(({ visualId }) => visualId),
      ),
    ];
    assert.equal(placements.length, 5, `${lessonId}: five placements`);
    assert.equal(new Set(placements).size, 5, `${lessonId}: unique placements`);
    for (const visualId of placements) {
      const visualTags = llmFoundation.outcomeRegistry.visuals[visualId];
      assert.ok(visualTags?.length > 0, visualId);
      assert.ok(
        assessments.some(({ conceptTags }) => (
          conceptTags.some((tag) => visualTags.includes(tag))
        )),
        `${visualId}: no assessment covers its actual outcome`,
      );
    }
  }
});

test('reconstructs all eight knowledge notes as the requested concept spine', () => {
  const requiredTerms = {
    'llm-01': [/AI/, /机器学习/, /深度学习/, /基础模型/, /next-token|下一 token/, /Agent/],
    'llm-02': [/张量/, /激活/, /损失/, /梯度下降|优化器/, /反向传播/, /推理上下文/],
    'llm-03': [/token ID/i, /embedding/i, /位置/, /上下文窗口/, /transcript|对话历史/, /持久记忆/],
    'llm-04': [/Query|Q\b/, /Key|K\b/, /Value|V\b/, /scaled|缩放点积/, /因果掩码/, /多头/, /残差/],
    'llm-05': [/预训练/, /SFT/, /偏好优化/, /推理.*Prompt|Prompt.*推理/s, /eval.*版本|评测集.*版本/s],
    'llm-06': [/logit/i, /softmax/i, /temperature/i, /top-k/i, /top-p/i, /KV Cache/i, /seed/i],
    'llm-07': [/instruction|指令/i, /message role|消息角色/i, /tool definition|工具定义/i, /Schema/, /解析/, /校验/, /重试/],
    'llm-08': [/dataset|数据集/i, /rubric/i, /model grader|模型裁判/i, /人工/, /生产.*监测|线上.*监测/s, /隐私/, /漂移/],
  };

  for (const lesson of llmFoundation.lessons) {
    const note = lesson.knowledgeNote;
    const copy = [
      note.introduction,
      ...note.sections.flatMap(({ paragraphs, keyPoints }) => [
        ...paragraphs,
        ...keyPoints,
      ]),
      ...note.misconceptions.flatMap(({ claim, correction }) => [claim, correction]),
      ...note.recap,
      note.nextStep,
    ].join(' ');
    for (const pattern of requiredTerms[lesson.id]) {
      assert.match(copy, pattern, `${lesson.id}: ${pattern}`);
    }
  }
});

test('publishes resolvable scoped source-impact decisions in Markdown parity', async () => {
  const claimIds = new Set();
  const decisionIds = new Set();

  assert.ok(llmFoundation.sourceImpactClaims.length >= lessonIds.length);
  assertDeepFrozen(llmFoundation.sourceImpactClaims, 'sourceImpactClaims');
  assertDeepFrozen(llmFoundation.sourceImpactAudit, 'sourceImpactAudit');
  for (const claim of llmFoundation.sourceImpactClaims) {
    assert.match(claim.id, /^[a-z0-9-]+$/);
    assert.ok(!claimIds.has(claim.id), claim.id);
    claimIds.add(claim.id);
    const lesson = llmFoundation.lessons.find(({ id }) => id === claim.lessonId);
    const section = lesson?.knowledgeNote.sections.find(({ id }) => id === claim.sectionId);
    assert.ok(section, claim.id);
    assert.ok(claim.statement.length >= 30, claim.id);
    assert.ok(claim.sourceIds.length > 0, claim.id);
    assert.ok(claim.sourceIds.every((id) => section.sourceIds.includes(id)), claim.id);
    assert.equal(llmData.resolveLlmSourceImpactClaim(`claim:${claim.id}`), claim);
  }

  for (const decision of llmFoundation.sourceImpactAudit) {
    assert.deepEqual(Object.keys(decision), [
      'decisionId',
      'lessonId',
      'resourceId',
      'scope',
      'targetId',
      'contribution',
      'summary',
      'rationale',
    ]);
    assert.match(decision.decisionId, /^impact-llm-\d{2}-[a-z0-9-]+$/);
    assert.ok(!decisionIds.has(decision.decisionId), decision.decisionId);
    decisionIds.add(decision.decisionId);
    assert.ok(['narrative', 'claim', 'media'].includes(decision.scope));
    assert.ok(allContributions.has(decision.contribution));
    const lesson = llmFoundation.lessons.find(({ id }) => id === decision.lessonId);
    assert.ok(lesson.resourceIds.includes(decision.resourceId), decision.decisionId);
    if (decision.scope === 'claim') {
      const claim = llmData.resolveLlmSourceImpactClaim(decision.targetId);
      assert.equal(claim.lessonId, decision.lessonId);
      assert.ok(claim.sourceIds.includes(decision.resourceId));
    }
  }

  for (const lessonId of lessonIds) {
    assert.ok(
      llmFoundation.sourceImpactAudit.some((decision) => (
        decision.lessonId === lessonId
        && materialContributions.has(decision.contribution)
      )),
      `${lessonId}: no material primary contribution`,
    );
  }
  assert.ok(
    [...allContributions].every((contribution) => (
      llmFoundation.sourceImpactAudit.some((row) => row.contribution === contribution)
    )),
    'ledger must exercise all decision outcomes',
  );

  const audit = await readFile(
    new URL(
      '../docs/content-audits/2026-07-30-llm-foundation-primary-reference-reconstruction.md',
      import.meta.url,
    ),
    'utf8',
  );
  const markdownDecisions = readMarkdownTable(audit, [
    'decisionId',
    'lessonId',
    'resourceId',
    'scope',
    'targetId',
    'contribution',
    'summary',
    'rationale',
  ]).map((row, index) => ({
    decisionId: unwrapSingleCodeSpan(row[0], `decision ${index} ID`),
    lessonId: unwrapSingleCodeSpan(row[1], `decision ${index} lesson`),
    resourceId: unwrapSingleCodeSpan(row[2], `decision ${index} resource`),
    scope: unwrapSingleCodeSpan(row[3], `decision ${index} scope`),
    targetId: unwrapSingleCodeSpan(row[4], `decision ${index} target`),
    contribution: unwrapSingleCodeSpan(row[5], `decision ${index} contribution`),
    summary: row[6],
    rationale: row[7],
  }));
  assert.deepEqual(markdownDecisions, llmFoundation.sourceImpactAudit);

  const visualDecisions = readMarkdownTable(audit, [
    'assetPath',
    'parentVisualId',
    'decision',
    'rationale',
  ]).map((row, index) => ({
    assetPath: unwrapSingleCodeSpan(row[0], `visual decision ${index} asset`),
    parentVisualId: unwrapSingleCodeSpan(
      row[1],
      `visual decision ${index} parent`,
    ),
    decision: unwrapSingleCodeSpan(row[2], `visual decision ${index} outcome`),
    rationale: row[3],
  }));
  const expectedVisualDecisions = llmFoundationVisuals.flatMap((visual) => [
    {
      assetPath: visual.assetPath,
      parentVisualId: visual.id,
    },
    ...(visual.steps ?? []).map((step) => ({
      assetPath: step.assetPath,
      parentVisualId: visual.id,
    })),
  ]);
  assert.equal(visualDecisions.length, 52);
  assert.deepEqual(
    visualDecisions.map(({ assetPath, parentVisualId }) => ({
      assetPath,
      parentVisualId,
    })),
    expectedVisualDecisions,
  );
  assert.equal(
    new Set(visualDecisions.map(({ assetPath }) => assetPath)).size,
    visualDecisions.length,
  );
  for (const decision of visualDecisions) {
    assert.ok(['keep', 'revise', 'replace'].includes(decision.decision));
    assert.ok(decision.rationale.length >= 20, decision.assetPath);
  }
});
