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

const expectedAssessmentOutcomes = Object.freeze({
  'quiz-llm-01-1': ['field-map', 'model-boundary'],
  'quiz-llm-01-2': ['application-diagnosis'],
  'quiz-llm-02-1': ['training-cycle', 'backpropagation', 'optimizer'],
  'quiz-llm-02-2': ['activation'],
  'quiz-llm-03-1': ['tokenization'],
  'quiz-llm-03-2': ['context-budget', 'context-strategy'],
  'quiz-llm-04-1': ['qkv-attention', 'scaled-dot-product'],
  'quiz-llm-04-2': ['causal-mask'],
  'quiz-llm-05-1': ['method-selection', 'rag-finetuning'],
  'quiz-llm-05-2': ['lora'],
  'quiz-llm-06-1': ['logit-softmax', 'temperature-top-p'],
  'quiz-llm-06-2': ['kv-cache'],
  'quiz-llm-07-1': ['schema-pipeline'],
  'quiz-llm-07-2': ['instruction-boundary'],
  'quiz-llm-08-1': ['injection-defense', 'model-application-boundary'],
  'quiz-llm-08-2': ['eval-funnel'],
  'iq-llm-01-1': ['field-map', 'model-boundary'],
  'iq-llm-01-2': [
    'training-inference-boundary',
    'autoregressive-generation',
  ],
  'iq-llm-01-3': ['application-diagnosis'],
  'iq-llm-02-1': [
    'training-cycle',
    'backpropagation',
    'optimizer',
    'learning-rate',
  ],
  'iq-llm-02-2': ['activation'],
  'iq-llm-02-3': ['generalization'],
  'iq-llm-03-1': ['tokenization'],
  'iq-llm-03-2': ['embedding-position'],
  'iq-llm-03-3': ['context-budget', 'context-strategy'],
  'iq-llm-04-1': ['qkv-attention', 'scaled-dot-product'],
  'iq-llm-04-2': ['multi-head'],
  'iq-llm-04-3': ['transformer-block'],
  'iq-llm-05-1': ['training-stages', 'preference-boundary'],
  'iq-llm-05-2': ['method-selection', 'rag-finetuning'],
  'iq-llm-05-3': ['lora'],
  'iq-llm-06-1': [
    'logit-softmax',
    'temperature-top-p',
    'sampling-loop',
  ],
  'iq-llm-06-2': ['kv-cache', 'latency-cost'],
  'iq-llm-06-3': ['latency-cost'],
  'iq-llm-07-1': [
    'runtime-contract',
    'instruction-boundary',
    'versioned-evaluation',
  ],
  'iq-llm-07-2': ['schema-pipeline', 'retry-repair'],
  'iq-llm-07-3': ['instruction-boundary'],
  'iq-llm-08-1': ['failure-taxonomy', 'grounding'],
  'iq-llm-08-2': ['eval-funnel'],
  'iq-llm-08-3': ['release-pareto'],
});

const expectedVisualOutcomes = Object.freeze({
  'visual-llm-01-field-map': ['field-map', 'model-boundary'],
  'visual-llm-01-learning-loop': ['training-inference-boundary'],
  'visual-llm-01-autoregressive-generation': ['autoregressive-generation'],
  'visual-llm-01-training-inference-boundary': ['training-inference-boundary'],
  'visual-llm-01-application-decision-stack': ['application-diagnosis'],
  'visual-llm-02-training-cycle': ['training-cycle', 'optimizer'],
  'visual-llm-02-neuron-forward': ['activation'],
  'visual-llm-02-backprop-graph': ['backpropagation'],
  'visual-llm-02-learning-rate-trajectories': ['learning-rate', 'optimizer'],
  'visual-llm-02-generalization-curves': ['generalization'],
  'visual-llm-03-text-to-context': ['tokenization', 'embedding-position'],
  'visual-llm-03-tokenization-comparison': ['tokenization'],
  'visual-llm-03-embedding-position-space': ['embedding-position'],
  'visual-llm-03-context-budget': ['context-budget'],
  'visual-llm-03-context-strategy-matrix': ['context-strategy'],
  'visual-llm-04-decoder-block': ['transformer-block'],
  'visual-llm-04-qkv-flow': ['qkv-attention'],
  'visual-llm-04-score-mask-softmax': ['scaled-dot-product'],
  'visual-llm-04-multi-head-merge': ['multi-head'],
  'visual-llm-04-causal-visibility': ['causal-mask'],
  'visual-llm-05-method-map': ['method-selection'],
  'visual-llm-05-stage-objectives': ['training-stages'],
  'visual-llm-05-preference-boundary': ['preference-boundary'],
  'visual-llm-05-lora-update': ['lora'],
  'visual-llm-05-rag-finetune-matrix': ['rag-finetuning'],
  'visual-llm-06-generation-loop': ['sampling-loop'],
  'visual-llm-06-logit-softmax': ['logit-softmax'],
  'visual-llm-06-temperature-top-p': ['temperature-top-p'],
  'visual-llm-06-kv-cache': ['kv-cache'],
  'visual-llm-06-latency-breakdown': ['latency-cost'],
  'visual-llm-07-runtime-contract': ['runtime-contract'],
  'visual-llm-07-instruction-boundary': ['instruction-boundary'],
  'visual-llm-07-schema-pipeline': ['schema-pipeline'],
  'visual-llm-07-retry-state-machine': ['retry-repair'],
  'visual-llm-07-version-eval-loop': ['versioned-evaluation'],
  'visual-llm-08-failure-map': ['failure-taxonomy'],
  'visual-llm-08-grounding-chain': ['grounding'],
  'visual-llm-08-eval-funnel': ['eval-funnel'],
  'visual-llm-08-injection-defense': [
    'injection-defense',
    'model-application-boundary',
  ],
  'visual-llm-08-release-pareto': ['release-pareto'],
});

const sourceImpactContracts = Object.freeze({
  'impact-llm-01-field-spine': {
    targetId: 'claim:ai-field-model-application-agent-spine',
    semanticKey: 'field-spine',
    summary: /AI.*知识地图.*模型、应用.*Agent runtime/,
  },
  'impact-llm-02-training-boundary': {
    targetId: 'claim:inference-context-does-not-update-parameters',
    semanticKey: 'training-inference-boundary',
    summary: /tensor.*activation.*loss.*backprop.*optimizer/,
  },
  'impact-llm-03-memory-boundary': {
    targetId: 'claim:context-is-not-persistent-memory',
    semanticKey: 'context-memory-boundary',
    summary: /transcript.*活动上下文.*产品记忆/,
  },
  'impact-llm-04-attention-verification': {
    targetId: 'claim:attention-needs-original-mechanism-verification',
    semanticKey: 'attention-verification',
    summary: /Attention.*公式.*架构事实/,
  },
  'impact-llm-05-system-versioning': {
    targetId: 'claim:version-the-whole-llm-system',
    semanticKey: 'system-versioning',
    summary: /模型、Prompt、工具 Schema、评测集.*版本化/,
  },
  'impact-llm-06-seed-boundary': {
    targetId: 'claim:seed-is-not-cross-version-determinism',
    semanticKey: 'seed-version-boundary',
    summary: /seed.*跨模型版本一致/,
  },
  'impact-llm-07-structured-contract': {
    targetId: 'claim:valid-json-is-not-valid-action',
    semanticKey: 'structured-output-validation',
    summary: /parse.*Schema validate.*业务 validate.*repair.*retry/,
  },
  'impact-llm-08-eval-loop': {
    targetId: 'claim:evaluation-is-an-operating-loop',
    semanticKey: 'evaluation-loop',
    summary: /Golden Set.*线上灰度.*模型裁判.*人工复核/,
  },
  'impact-llm-09-outside-model': {
    targetId: 'claim:model-safety-is-not-application-control',
    semanticKey: 'model-application-control-boundary',
    summary: /模型与应用控制边界.*权限、执行、隐私、监控和恢复/,
  },
  'impact-llm-10-tool-protocol-limit': {
    targetId: 'claim:tool-transcript-is-not-execution-proof',
    semanticKey: 'tool-execution-truth',
    summary: /tool call.*真实执行/,
  },
  'impact-llm-11-claude-tool-list': {
    targetId: 'section:llm-07/prompt-as-runtime-contract',
    semanticKey: 'tool-contract',
    summary: /Claude Code 工具清单.*工具契约/,
  },
  'impact-llm-12-third-party-media': {
    targetId: 'media-candidate:javaguide-llm-mechanism-figures',
    semanticKey: 'third-party-mechanism-figures',
    summary: /拒绝直接复制 JavaGuide.*图表.*原创 SVG/,
  },
});

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
  assert.deepEqual(
    llmFoundation.outcomeRegistry.visuals,
    expectedVisualOutcomes,
  );
  assert.deepEqual(
    Object.keys(llmFoundation.outcomeRegistry.assessmentVisualCoverage).sort(),
    Object.keys(expectedAssessmentOutcomes).sort(),
  );
  for (const [lessonId, assessments] of assessmentsByLesson) {
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    const placements = [
      lesson.knowledgeNote.overviewVisualId,
      ...lesson.knowledgeNote.sections.flatMap(
        ({ visuals = [] }) => visuals.map(({ visualId }) => visualId),
      ),
    ];
    for (const assessment of assessments) {
      assert.deepEqual(
        assessment.conceptTags,
        expectedAssessmentOutcomes[assessment.id],
        assessment.id,
      );
      assert.equal(new Set(assessment.conceptTags).size, assessment.conceptTags.length);
      assert.deepEqual(
        llmFoundation.outcomeRegistry.assessments[assessment.id],
        {
          lessonId,
          outcomeTags: assessment.conceptTags,
        },
      );
      const coveredVisualIds = llmFoundation.outcomeRegistry
        .assessmentVisualCoverage[assessment.id];
      assert.ok(coveredVisualIds.length > 0, assessment.id);
      assert.ok(
        coveredVisualIds.every((visualId) => placements.includes(visualId)),
        `${assessment.id}: coverage escapes its lesson`,
      );
      assert.ok(
        coveredVisualIds.every((visualId) => expectedVisualOutcomes[visualId]),
        `${assessment.id}: coverage names an unknown visual`,
      );
      const coveredTags = new Set(
        coveredVisualIds.flatMap((visualId) => (
          llmFoundation.outcomeRegistry.visuals[visualId]
        )),
      );
      assert.ok(
        assessment.conceptTags.every((tag) => coveredTags.has(tag)),
        `${assessment.id}: declared visuals do not cover every assessment outcome`,
      );
    }

    assert.equal(placements.length, 5, `${lessonId}: five placements`);
    assert.equal(new Set(placements).size, 5, `${lessonId}: unique placements`);
    for (const visualId of placements) {
      const visualTags = llmFoundation.outcomeRegistry.visuals[visualId];
      assert.ok(visualTags?.length > 0, visualId);
    }
  }
});

test('closes assessment and visual outcomes in both directions with exact semantic edges', () => {
  const assessments = [
    ...llmFoundation.lessons.flatMap((lesson) => lesson.quiz.map((assessment) => ({
      ...assessment,
      lessonId: lesson.id,
    }))),
    ...llmFoundation.interviewQuestions,
  ];
  const assessmentIds = assessments.map(({ id }) => id);
  const assessmentById = new Map(
    assessments.map((assessment) => [assessment.id, assessment]),
  );
  const coverage = llmFoundation.outcomeRegistry.assessmentVisualCoverage;
  const visualOutcomes = llmFoundation.outcomeRegistry.visuals;
  const visualLessonById = new Map();
  const assessmentText = (assessmentId) => {
    const assessment = assessmentById.get(assessmentId);
    return [
      assessment.question,
      assessment.shortAnswer,
      ...(assessment.deepDive ?? []),
      ...(assessment.followUps ?? []),
    ].join('\n');
  };

  for (const lesson of llmFoundation.lessons) {
    const visualIds = [
      lesson.knowledgeNote.overviewVisualId,
      ...lesson.knowledgeNote.sections.flatMap(
        ({ visuals = [] }) => visuals.map(({ visualId }) => visualId),
      ),
    ];
    for (const visualId of visualIds) {
      assert.equal(
        visualLessonById.has(visualId),
        false,
        `${visualId}: visual placement is duplicated across lessons`,
      );
      visualLessonById.set(visualId, lesson.id);
    }
  }

  assert.equal(new Set(assessmentIds).size, assessmentIds.length);
  assert.deepEqual(
    Object.keys(coverage).sort(),
    [...assessmentIds].sort(),
    'coverage must contain every real assessment and no ghost assessment',
  );
  assert.deepEqual(
    Object.keys(llmFoundation.outcomeRegistry.assessments).sort(),
    [...assessmentIds].sort(),
    'assessment registry must contain every real assessment and no ghost assessment',
  );
  assert.deepEqual(
    [...visualLessonById.keys()].sort(),
    Object.keys(visualOutcomes).sort(),
    'visual outcome registry must contain every placed visual and no ghost visual',
  );
  assert.match(
    assessmentText('iq-llm-01-2'),
    /自回归.*逐 token|逐 token.*自回归/s,
    'autoregressive-generation must be stated by the assessment, not only tagged',
  );
  assert.match(
    assessmentText('iq-llm-02-1'),
    /学习率.*过小.*过大|过小.*学习率.*过大/s,
    'learning-rate must be stated by the assessment, not only tagged',
  );
  assert.match(
    assessmentText('iq-llm-06-1'),
    /logits.*temperature.*softmax.*top-p.*采样.*追加.*停止/s,
    'sampling-loop must be stated end to end by the assessment, not only tagged',
  );

  const assessmentIdsByVisual = new Map(
    Object.keys(visualOutcomes).map((visualId) => [visualId, []]),
  );
  for (const [assessmentId, visualIds] of Object.entries(coverage)) {
    const assessment = assessmentById.get(assessmentId);
    assert.ok(assessment, `${assessmentId}: coverage names a ghost assessment`);
    assert.equal(
      new Set(visualIds).size,
      visualIds.length,
      `${assessmentId}: coverage repeats a visual`,
    );
    assert.ok(visualIds.length > 0, `${assessmentId}: has no visual coverage`);

    for (const visualId of visualIds) {
      const visualTags = visualOutcomes[visualId];
      assert.ok(visualTags, `${assessmentId}: names ghost visual ${visualId}`);
      assert.equal(
        visualLessonById.get(visualId),
        assessment.lessonId,
        `${assessmentId} -> ${visualId}: crosses lesson ownership`,
      );
      assert.ok(
        assessment.conceptTags.some((tag) => visualTags.includes(tag)),
        `${assessmentId} -> ${visualId}: has no exact outcome-tag intersection`,
      );
      assessmentIdsByVisual.get(visualId).push(assessmentId);
    }
  }

  for (const [visualId, coveringAssessmentIds] of assessmentIdsByVisual) {
    assert.ok(
      coveringAssessmentIds.length > 0,
      `${visualId}: no same-lesson assessment explicitly covers this visual`,
    );
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
  assertDeepFrozen(
    llmFoundation.sourceImpactMediaCandidates,
    'sourceImpactMediaCandidates',
  );
  for (const claim of llmFoundation.sourceImpactClaims) {
    assert.match(claim.id, /^[a-z0-9-]+$/);
    assert.ok(!claimIds.has(claim.id), claim.id);
    claimIds.add(claim.id);
    const lesson = llmFoundation.lessons.find(({ id }) => id === claim.lessonId);
    const section = lesson?.knowledgeNote.sections.find(({ id }) => id === claim.sectionId);
    assert.ok(section, claim.id);
    assert.ok(claim.statement.length >= 30, claim.id);
    assert.ok(claim.sourceIds.length > 0, claim.id);
    assert.ok(claim.semanticKeys.length > 0, claim.id);
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
      'semanticKey',
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
    const contract = sourceImpactContracts[decision.decisionId];
    assert.ok(contract, decision.decisionId);
    assert.equal(decision.targetId, contract.targetId, decision.decisionId);
    assert.equal(decision.semanticKey, contract.semanticKey, decision.decisionId);
    assert.match(decision.summary, contract.summary, decision.decisionId);
    const target = llmData.resolveLlmSourceImpactTarget(decision.targetId);
    const allowedTargetTypes = {
      claim: ['claim'],
      narrative: ['section'],
      media: ['visual', 'asset', 'media-candidate'],
    }[decision.scope];
    assert.ok(allowedTargetTypes.includes(target.type), decision.decisionId);
    assert.equal(target.lessonId, decision.lessonId, decision.decisionId);
    assert.ok(target.resourceIds.includes(decision.resourceId), decision.decisionId);
    assert.ok(target.semanticKeys.includes(decision.semanticKey), decision.decisionId);
  }
  assert.deepEqual(
    Object.keys(sourceImpactContracts),
    llmFoundation.sourceImpactAudit.map(({ decisionId }) => decisionId),
  );

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
    'semanticKey',
    'contribution',
    'summary',
    'rationale',
  ]).map((row, index) => ({
    decisionId: unwrapSingleCodeSpan(row[0], `decision ${index} ID`),
    lessonId: unwrapSingleCodeSpan(row[1], `decision ${index} lesson`),
    resourceId: unwrapSingleCodeSpan(row[2], `decision ${index} resource`),
    scope: unwrapSingleCodeSpan(row[3], `decision ${index} scope`),
    targetId: unwrapSingleCodeSpan(row[4], `decision ${index} target`),
    semanticKey: unwrapSingleCodeSpan(row[5], `decision ${index} semantic key`),
    contribution: unwrapSingleCodeSpan(row[6], `decision ${index} contribution`),
    summary: row[7],
    rationale: row[8],
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
