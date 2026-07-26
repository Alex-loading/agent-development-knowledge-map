import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { llmFoundationNotes } from '../src/data/llm-foundation-notes.js';

const inventoryPath = new URL(
  '../docs/research/2026-07-26-llm-foundation-visual-inventory.md',
  import.meta.url,
);
const auditPath = new URL(
  '../docs/content-audits/2026-07-26-llm-foundation-visuals.md',
  import.meta.url,
);
const inventory = readFileSync(inventoryPath, 'utf8');
const audit = readFileSync(auditPath, 'utf8');

const allowedDecisions = new Set([
  'original-synthesis',
  'licensed-reproduction',
  'licensed-adaptation',
  'official-media',
  'link-only-original-replacement',
]);
const allowedStatuses = new Set(['verified', 'blocked']);
const allowedPrimaryRoles = new Set([
  'overview',
  'mechanism',
  'process',
  'comparison',
  'boundary',
  'decision',
]);
const allowedSecondaryTags = new Set([
  'mechanism',
  'process',
  'comparison',
  'boundary',
  'decision',
  'relationship',
  'failure-mode',
  'tradeoff',
]);
const storyboardLabels = [
  '**Reading order:**',
  '**Nodes/regions:**',
  '**Edges or comparison axes:**',
  '**Color-independent encoding:**',
  '**One-sentence caption conclusion:**',
  '**Alt summary:**',
  '**Long-description outline:**',
];
const quantitativeVisualIds = new Set([
  'visual-llm-01-autoregressive-generation',
  'visual-llm-02-training-cycle',
  'visual-llm-02-neuron-forward',
  'visual-llm-02-backprop-graph',
  'visual-llm-02-learning-rate-trajectories',
  'visual-llm-02-generalization-curves',
  'visual-llm-03-text-to-context',
  'visual-llm-03-tokenization-comparison',
  'visual-llm-03-embedding-position-space',
  'visual-llm-03-context-budget',
  'visual-llm-04-qkv-flow',
  'visual-llm-04-score-mask-softmax',
  'visual-llm-04-multi-head-merge',
  'visual-llm-04-causal-visibility',
  'visual-llm-05-lora-update',
  'visual-llm-05-rag-finetune-matrix',
  'visual-llm-06-generation-loop',
  'visual-llm-06-logit-softmax',
  'visual-llm-06-temperature-top-p',
  'visual-llm-06-kv-cache',
  'visual-llm-06-latency-breakdown',
  'visual-llm-07-retry-state-machine',
  'visual-llm-07-version-eval-loop',
  'visual-llm-08-eval-funnel',
  'visual-llm-08-release-pareto',
]);

function parseRows(markdown) {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('| `visual-'))
    .map((line) => {
      const cells = line.slice(2, -2).split(' | ');
      assert.equal(cells.length, 11, `${cells[0]} 必须有 11 列`);
      return {
        visualId: cells[0].replaceAll('`', ''),
        lessonSection: cells[1],
        cognitiveQuestion: cells[2],
        visualForm: cells[3],
        assessedCoverage: cells[4],
        sourceIds: cells[5],
        candidateImageUrl: cells[6],
        permissionEvidence: cells[7],
        decision: cells[8],
        storyboard: cells[9],
        status: cells[10],
      };
    });
}

function parseRole(visualForm, visualId) {
  const match = visualForm.match(
    /^(?<form>.+)；primary=(?<primary>[a-z-]+)；tags=(?<tags>[a-z-]+(?:,[a-z-]+)*)$/,
  );
  assert.ok(match, `${visualId} 必须声明 form；primary=<role>；tags=<tag,...>`);
  return {
    primary: match.groups.primary,
    tags: match.groups.tags.split(','),
  };
}

function gitBlobSha(content) {
  return createHash('sha1')
    .update(`blob ${Buffer.byteLength(content)}\0`)
    .update(content)
    .digest('hex');
}

const rows = parseRows(inventory);
const rowsById = new Map(rows.map((row) => [row.visualId, row]));

test('visual inventory freezes 40 unique rows with deterministic primary roles', () => {
  assert.equal(rows.length, 40);
  assert.equal(rowsById.size, 40);

  const lessonCounts = new Map();
  const lessonCoverage = new Map();

  for (const row of rows) {
    const match = row.lessonSection.match(/^`(llm-\d{2}) \/ ([a-z0-9-]+)`$/);
    assert.ok(match, `${row.visualId} 必须指向 lesson / section`);
    const lessonId = match[1];
    lessonCounts.set(lessonId, (lessonCounts.get(lessonId) ?? 0) + 1);

    const role = parseRole(row.visualForm, row.visualId);
    assert.ok(allowedPrimaryRoles.has(role.primary), `${row.visualId} primary role 非法`);
    assert.equal(new Set(role.tags).size, role.tags.length, `${row.visualId} tags 不应重复`);
    assert.ok(
      role.tags.every((tag) => allowedSecondaryTags.has(tag)),
      `${row.visualId} secondary tag 非法`,
    );
    assert.ok(!role.tags.includes(role.primary), `${row.visualId} tags 不应重复 primary`);

    const coverage = lessonCoverage.get(lessonId) ?? {
      overview: 0,
      mechanism: 0,
      boundary: 0,
    };
    const roles = new Set([role.primary, ...role.tags]);
    if (role.primary === 'overview') coverage.overview += 1;
    if (['mechanism', 'process', 'relationship'].some((item) => roles.has(item))) {
      coverage.mechanism += 1;
    }
    if (
      ['boundary', 'comparison', 'failure-mode', 'decision'].some((item) =>
        roles.has(item),
      )
    ) {
      coverage.boundary += 1;
    }
    lessonCoverage.set(lessonId, coverage);
  }

  for (const lesson of llmFoundation.lessons) {
    assert.equal(lessonCounts.get(lesson.id), 5, `${lesson.id} 必须恰有 5 项`);
    const coverage = lessonCoverage.get(lesson.id);
    assert.equal(coverage.overview, 1, `${lesson.id} 必须恰有 1 个 primary overview`);
    assert.ok(coverage.mechanism >= 2, `${lesson.id} 至少有 2 个机制/过程/关系图`);
    assert.ok(coverage.boundary >= 1, `${lesson.id} 至少有 1 个边界/对比/决策图`);
  }
});

test('visual inventory resolves sections, evidence and assessed coverage paths', () => {
  for (const row of rows) {
    const [, lessonId, sectionId] = row.lessonSection.match(
      /^`(llm-\d{2}) \/ ([a-z0-9-]+)`$/,
    );
    const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
    const section = llmFoundationNotes[lessonId].sections.find(
      ({ id }) => id === sectionId,
    );
    assert.ok(section, `${row.visualId} section 必须存在`);

    const sourceIds = [...row.sourceIds.matchAll(/`(res-[^`]+)`/g)].map(
      (match) => match[1],
    );
    assert.ok(sourceIds.length > 0, `${row.visualId} 必须有 sourceIds`);
    assert.ok(
      sourceIds.every((sourceId) => section.sourceIds.includes(sourceId)),
      `${row.visualId} sourceIds 必须属于 section 证据范围`,
    );

    const assessedPaths = [...row.assessedCoverage.matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    );
    assert.ok(assessedPaths.length > 0, `${row.visualId} 必须有 assessed coverage`);
    for (const path of assessedPaths) {
      const objective = path.match(/^(llm-\d{2})\.objectives\[(\d+)\]$/);
      const criterion = path.match(
        /^(llm-\d{2})\.completionCriteria\[(\d+)\]$/,
      );
      const exercise = path.match(
        /^(llm-\d{2})\.exercise\.steps\[(\d+)\]$/,
      );
      const resolves =
        (objective &&
          objective[1] === lessonId &&
          lesson.objectives[Number(objective[2])] !== undefined) ||
        (criterion &&
          criterion[1] === lessonId &&
          lesson.completionCriteria[Number(criterion[2])] !== undefined) ||
        (exercise &&
          exercise[1] === lessonId &&
          lesson.exercise.steps[Number(exercise[2])] !== undefined) ||
        (path.startsWith('quiz-') && lesson.quiz.some(({ id }) => id === path)) ||
        (path.startsWith('iq-') &&
          llmFoundation.interviewQuestions.some(
            ({ id, lessonId: owner }) => id === path && owner === lessonId,
          ));
      assert.ok(resolves, `${row.visualId} 无法解析 assessed path ${path}`);
    }

    assert.ok(allowedDecisions.has(row.decision), `${row.visualId} decision 非法`);
    assert.ok(allowedStatuses.has(row.status), `${row.visualId} status 非法`);
    for (const label of storyboardLabels) {
      assert.ok(row.storyboard.includes(label), `${row.visualId} 缺少 ${label}`);
    }
  }
});

test('every quantitative visual freezes an executable example fixture', () => {
  for (const visualId of quantitativeVisualIds) {
    const row = rowsById.get(visualId);
    assert.ok(row, `${visualId} 必须存在`);
    assert.ok(row.storyboard.includes('**Example fixture:**'), `${visualId} 缺 fixture`);
    for (const field of ['Input=', 'Rule/version=', 'Expected=', 'Rounding=']) {
      assert.ok(row.storyboard.includes(field), `${visualId} fixture 缺 ${field}`);
    }
  }
});

test('architecture and Pareto storyboards preserve their implementation boundaries', () => {
  const transformer = rowsById.get('visual-llm-04-decoder-block').storyboard;
  for (const boundary of [
    'GPT-like decoder-only',
    'Pre-Norm',
    'Post-Norm',
    'encoder-decoder',
    'cross-attention',
  ]) {
    assert.ok(transformer.includes(boundary), `Transformer overview 缺少 ${boundary}`);
  }

  const pareto = rowsById.get('visual-llm-08-release-pareto').storyboard;
  assert.ok(!pareto.includes('综合预算'), 'Pareto 图不得使用未定义综合预算');
  for (const boundary of ['质量–成本', '质量–延迟', 'dominance', '安全硬门']) {
    assert.ok(pareto.includes(boundary), `Pareto 图缺少 ${boundary}`);
  }
});

test('audit records reproducible commands, human review limits and inventory blob', () => {
  const placeholderPattern = /TODO|TBD|placeholder|待补|未知|unknown/iu;
  assert.ok(!placeholderPattern.test(inventory), 'inventory 不得含占位符');
  assert.ok(!placeholderPattern.test(audit), 'audit 不得含占位符');
  assert.ok(
    audit.includes('node --test tests/llm-foundation-visual-inventory.test.js'),
    'audit 必须记录结构测试命令',
  );
  assert.ok(audit.includes('2026-07-26'), 'audit 必须记录人工复核日期');
  assert.ok(
    audit.includes('implementation agent + independent spec reviewer'),
    'audit 必须记录执行角色',
  );
  assert.ok(audit.includes('40 / 40'), 'audit 必须记录逐行复核结果');
  assert.ok(
    audit.includes('机器校验不能证明语义正确'),
    'audit 必须声明机器校验的能力边界',
  );
  const recordedBlob = audit.match(/Inventory git blob SHA：`([a-f0-9]{40})`/)?.[1];
  assert.equal(recordedBlob, gitBlobSha(inventory), 'audit blob 必须匹配 inventory');
});
