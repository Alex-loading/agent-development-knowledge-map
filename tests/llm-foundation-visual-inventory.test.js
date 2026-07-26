import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import { llmFoundation } from '../src/data/llm-foundation.js';
import { llmFoundationNotes } from '../src/data/llm-foundation-notes.js';
import {
  formatFixtureExpected,
  llmFoundationVisualFixtures,
} from './fixtures/llm-foundation-visual-fixtures.js';

const inventoryPath = new URL(
  '../docs/research/2026-07-26-llm-foundation-visual-inventory.md',
  import.meta.url,
);
const auditPath = new URL(
  '../docs/content-audits/2026-07-26-llm-foundation-visuals.md',
  import.meta.url,
);
const fixtureDataPath = new URL(
  './fixtures/llm-foundation-visual-fixtures.js',
  import.meta.url,
);
const inventory = readFileSync(inventoryPath, 'utf8');
const audit = readFileSync(auditPath, 'utf8');
const fixtureDataSource = readFileSync(fixtureDataPath, 'utf8');

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

function parseFixtureReference(storyboard) {
  const match = storyboard.match(
    /\*\*Fixture:\*\* fixture=(quantitative|qualitative)；(.+?)(?:。)?<br>/,
  );
  if (!match) return null;
  return {
    kind: match[1],
    detail: match[2].replace(/。$/, ''),
  };
}

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

function assertDeepClose(actual, expected, path = 'result') {
  if (typeof expected === 'number') {
    if (!Number.isFinite(expected)) {
      assert.equal(actual, expected, path);
      return;
    }
    assert.ok(
      Math.abs(actual - expected) <= 1e-12,
      `${path}: expected ${expected}, received ${actual}`,
    );
    return;
  }
  if (Array.isArray(expected)) {
    assert.equal(actual.length, expected.length, `${path}.length`);
    expected.forEach((value, index) =>
      assertDeepClose(actual[index], value, `${path}[${index}]`),
    );
    return;
  }
  if (expected && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual), Object.keys(expected), `${path}.keys`);
    for (const [key, value] of Object.entries(expected)) {
      assertDeepClose(actual[key], value, `${path}.${key}`);
    }
    return;
  }
  assert.equal(actual, expected, path);
}

function formatExpectedFromResult(result) {
  return `结构化 result：${JSON.stringify(result, (_key, value) => {
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    return value;
  })}`;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function softmax(values) {
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const denominator = sum(exponentials);
  return exponentials.map((value) => value / denominator);
}

function longestMatchEncode(rawText, vocabulary) {
  const vocabularyTokens = Object.keys(vocabulary).sort(
    (left, right) => right.length - left.length || left.localeCompare(right),
  );
  const segments = [];
  const tokenIds = [];
  let offset = 0;
  while (offset < rawText.length) {
    const token = vocabularyTokens.find((candidate) =>
      rawText.startsWith(candidate, offset),
    );
    assert.ok(token, `教学词表无法编码 offset=${offset} 的原始文本`);
    segments.push(token);
    tokenIds.push(vocabulary[token]);
    offset += token.length;
  }
  return { segments, tokenIds };
}

function matrixMultiply(left, right) {
  return left.map((row) =>
    right[0].map((_, columnIndex) =>
      sum(row.map((value, index) => value * right[index][columnIndex])),
    ),
  );
}

function transpose(matrix) {
  return matrix[0].map((_, columnIndex) =>
    matrix.map((row) => row[columnIndex]),
  );
}

function addBias(matrix, bias) {
  return matrix.map((row) => row.map((value, index) => value + bias[index]));
}

function meanSquaredError(actual, expected) {
  const squaredErrors = actual.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => (value - expected[rowIndex][columnIndex]) ** 2),
  );
  return sum(squaredErrors) / squaredErrors.length;
}

function weightedSum(weights, values) {
  return values[0].map((_, columnIndex) =>
    sum(weights.map((weight, index) => weight * values[index][columnIndex])),
  );
}

function nucleusIndices(probabilities, threshold) {
  let cumulative = 0;
  const indices = [];
  const ranked = probabilities
    .map((probability, index) => ({ probability, index }))
    .sort(
      (left, right) =>
        right.probability - left.probability || left.index - right.index,
    );
  for (const { index, probability } of ranked) {
    indices.push(index);
    cumulative += probability;
    if (cumulative >= threshold) break;
  }
  return indices;
}

function isMonotonicDown(values) {
  return values.slice(1).every((value, index) => value < values[index]);
}

function recomputeFixture(fixture) {
  const { data } = fixture;
  switch (fixture.visualId) {
    case 'visual-llm-01-autoregressive-generation': {
      const encoding = longestMatchEncode(data.rawPrompt, data.vocabulary);
      const probabilities = softmax(data.logits);
      const selectedIndex = probabilities.indexOf(Math.max(...probabilities));
      return {
        segments: encoding.segments,
        encodedIds: encoding.tokenIds,
        probabilities,
        selectedId: data.vocabulary[data.candidates[selectedIndex]],
        nextToken: data.nextStateToken,
      };
    }
    case 'visual-llm-02-training-cycle': {
      const Z = addBias(matrixMultiply(data.X, data.W), data.b);
      const elementCount = Z.length * Z[0].length;
      const dZ = Z.map((row, rowIndex) =>
        row.map(
          (value, columnIndex) =>
            (2 / elementCount) * (value - data.Y[rowIndex][columnIndex]),
        ),
      );
      const dW = matrixMultiply(transpose(data.X), dZ);
      const db = dZ[0].map((_, columnIndex) =>
        sum(dZ.map((row) => row[columnIndex])),
      );
      const newW = data.W.map((row, rowIndex) =>
        row.map(
          (value, columnIndex) =>
            value - data.learningRate * dW[rowIndex][columnIndex],
        ),
      );
      const newB = data.b.map(
        (value, index) => value - data.learningRate * db[index],
      );
      const newZ = addBias(matrixMultiply(data.X, newW), newB);
      return {
        Z,
        loss: meanSquaredError(Z, data.Y),
        dZ,
        dW,
        db,
        newW,
        newB,
        newZ,
        newLoss: meanSquaredError(newZ, data.Y),
      };
    }
    case 'visual-llm-02-neuron-forward': {
      const z = data.x * data.w + data.b;
      const probability = 1 / (1 + Math.exp(-z));
      const loss =
        -data.y * Math.log(probability) -
        (1 - data.y) * Math.log(1 - probability);
      return { z, probability, loss };
    }
    case 'visual-llm-02-backprop-graph': {
      const a = data.x * data.w;
      const b = data.x ** 2;
      const c = a + b;
      const dLossDc = c;
      const localGradients = {
        dLossDc,
        dCda: 1,
        dCdb: 1,
        dAdx: data.w,
        dAdw: data.x,
        dBdx: 2 * data.x,
      };
      const viaA = dLossDc * localGradients.dCda * localGradients.dAdx;
      const viaB = dLossDc * localGradients.dCdb * localGradients.dBdx;
      return {
        forward: { a, b, c, loss: c ** 2 / 2 },
        localGradients,
        pathContributionsToX: { viaA, viaB },
        accumulated: {
          dLossDx: viaA + viaB,
          dLossDw: dLossDc * localGradients.dCda * localGradients.dAdw,
        },
      };
    }
    case 'visual-llm-02-learning-rate-trajectories':
      return {
        trajectories: data.learningRates.map((learningRate) => {
          let weight = data.initialW;
          const weights = [];
          const losses = [];
          for (let step = 0; step < data.steps; step += 1) {
            weight -= learningRate * 2 * (weight - data.targetW);
            weights.push(weight);
            losses.push((weight - data.targetW) ** 2);
          }
          return { learningRate, weights, losses };
        }),
      };
    case 'visual-llm-02-generalization-curves': {
      const overfitValidation = data.series.overfit.validation;
      const minimumValidation = Math.min(...overfitValidation);
      const minimumIndex = overfitValidation.indexOf(minimumValidation);
      return {
        underfit: {
          trainMonotonicDown: isMonotonicDown(data.series.underfit.train),
          validationMonotonicDown: isMonotonicDown(
            data.series.underfit.validation,
          ),
          finalTrain: data.series.underfit.train.at(-1),
          finalValidation: data.series.underfit.validation.at(-1),
        },
        improving: {
          trainMonotonicDown: isMonotonicDown(data.series.improving.train),
          validationMonotonicDown: isMonotonicDown(
            data.series.improving.validation,
          ),
        },
        overfit: {
          trainMonotonicDown: isMonotonicDown(data.series.overfit.train),
          bestEpoch: data.epochs[minimumIndex],
          divergenceStartsAtEpoch: data.epochs[minimumIndex + 1],
        },
      };
    }
    case 'visual-llm-03-text-to-context': {
      const represent = (ids) =>
        ids.map((id, index) =>
          data.embeddings[id].map(
            (value, dimension) => value + data.positions[index][dimension],
          ),
        );
      return {
        ordered: represent(data.tokenIds),
        swapped: represent([...data.tokenIds].reverse()),
      };
    }
    case 'visual-llm-03-tokenization-comparison':
      return {
        tokenizerACounts: data.texts.map(
          (text) =>
            longestMatchEncode(text, data.tokenizerAVocabulary).segments.length,
        ),
        tokenizerBCounts: data.texts.map((text) => [...text].length),
      };
    case 'visual-llm-03-embedding-position-space':
      return {
        representations: data.orders.map((ids) =>
          ids.map((id, index) =>
            data.embeddings[id].map(
              (value, dimension) => value + data.positions[index][dimension],
            ),
          ),
        ),
      };
    case 'visual-llm-03-context-budget': {
      const baselineTotal = sum(Object.values(data.allocations));
      const expandedTotal = baselineTotal + data.retrievalIncrease;
      const overflow = Math.max(0, expandedTotal - data.window);
      const trimmedHistory = data.allocations[data.trimFirst] - overflow;
      return {
        baselineTotal,
        expandedTotal,
        overflow,
        trimmedHistory,
        finalTotal: expandedTotal - overflow,
      };
    }
    case 'visual-llm-04-qkv-flow': {
      const weights = softmax(data.scaledScores);
      return { weights, output: weightedSum(weights, data.values) };
    }
    case 'visual-llm-04-score-mask-softmax': {
      const scaledScores = data.rawQKScores.map(
        (score) => score / Math.sqrt(data.dK),
      );
      const maskedScores = scaledScores.map((score, index) =>
        data.maskedIndices.includes(index) ? -Infinity : score,
      );
      const weights = softmax(maskedScores);
      return {
        scaledScores,
        maskedScores,
        weights,
        output: weightedSum(weights, data.values),
      };
    }
    case 'visual-llm-04-multi-head-merge': {
      const heads = data.heads.map((head) => {
        const weights = softmax(head.scores);
        return {
          weights,
          output: weightedSum(weights, head.values),
        };
      });
      const concatenated = heads.flatMap(({ output }) => output);
      return {
        heads,
        concatenated,
        output: matrixMultiply([concatenated], data.outputProjection)[0],
      };
    }
    case 'visual-llm-04-causal-visibility': {
      const sequenceLength = data.allowedScores.length;
      const visibility = Array.from({ length: sequenceLength }, (_, row) =>
        Array.from({ length: sequenceLength }, (_, column) =>
          column <= row ? 1 : 0,
        ),
      );
      return {
        visibility,
        rowWeights: visibility.map((row, rowIndex) => {
          assert.equal(data.allowedScores[rowIndex].length, rowIndex + 1);
          const scores = row.map((visible, columnIndex) =>
            visible ? data.allowedScores[rowIndex][columnIndex] : -Infinity,
          );
          return softmax(scores);
        }),
      };
    }
    case 'visual-llm-05-lora-update':
      assert.equal(data.rank, 1, '教学 LoRA fixture 当前冻结 rank=1');
      assert.equal(data.A.length, data.baseShape[1]);
      assert.equal(data.B.length, data.baseShape[0]);
      return {
        deltaW: data.B.map((value) => data.A.map((item) => value * item)),
        adapterParameters:
          data.rank * (data.baseShape[0] + data.baseShape[1]),
        fullParameters: data.baseShape[0] * data.baseShape[1],
      };
    case 'visual-llm-05-rag-finetune-matrix':
      return {
        decisions: data.cases.map(({ name, axes, hasExamples }) => {
          const evaluationProfile = {
            riskControl:
              axes.risk >= data.highThreshold
                ? 'high-risk slices + rollback'
                : 'standard slices + rollback',
            costCheck:
              axes.computeBudget <= 1
                ? 'low-compute baseline required'
                : 'compare training and serving cost',
          };
          if (
            axes.updateFrequency >= data.highThreshold ||
            axes.citationNeed >= data.highThreshold
          ) {
            return {
              name,
              route: 'RAG',
              reason: 'updateFrequency/citationNeed reached high threshold',
              nextStep: 'evaluate retrieval, citations and permissions',
              evaluationProfile,
            };
          }
          if (axes.stableBehavior === true && hasExamples === true) {
            return {
              name,
              route: 'SFT/LoRA',
              reason: 'stable behavior gap with representative examples',
              nextStep: 'compare against the Prompt/tool baseline before training',
              evaluationProfile,
            };
          }
          return {
            name,
            route: 'insufficient evidence—do not fine-tune',
            reason:
              axes.stableBehavior !== true
                ? 'behavior target is not stable'
                : 'representative examples are missing',
            nextStep:
              axes.stableBehavior !== true
                ? 'establish Prompt/tool baseline and clarify the target'
                : 'establish Prompt/tool baseline and continue collecting data',
            evaluationProfile,
          };
        }),
      };
    case 'visual-llm-06-generation-loop': {
      const probabilities = softmax(
        data.logits.map((value) => value / data.temperature),
      );
      const indices = nucleusIndices(probabilities, data.topP);
      const retainedMass = sum(indices.map((index) => probabilities[index]));
      const renormalized = indices.map(
        (index) => probabilities[index] / retainedMass,
      );
      let cumulative = 0;
      const selectedIndex = renormalized.findIndex((probability) => {
        cumulative += probability;
        return data.uniformSample <= cumulative;
      });
      return {
        probabilities,
        nucleus: indices.map((index) => data.candidates[index]),
        renormalized,
        selected: data.candidates[indices[selectedIndex]],
        nextToken: data.nextStateToken,
      };
    }
    case 'visual-llm-06-logit-softmax': {
      const maximum = Math.max(...data.logits);
      const shiftedExponentials = data.logits.map((value) =>
        Math.exp(value - maximum),
      );
      const probabilities = softmax(data.logits);
      const greedyIndex = probabilities.indexOf(Math.max(...probabilities));
      return {
        shiftedExponentials,
        probabilities,
        sum: sum(probabilities),
        greedy: data.candidates[greedyIndex],
      };
    }
    case 'visual-llm-06-temperature-top-p': {
      const distributions = data.temperatures.map((temperature) =>
        softmax(data.logits.map((value) => value / temperature)),
      );
      const distribution =
        distributions[data.temperatures.indexOf(data.nucleusTemperature)];
      return {
        distributions,
        nucleus: nucleusIndices(distribution, data.topP).map(
          (index) => data.candidates[index],
        ),
      };
    }
    case 'visual-llm-06-kv-cache': {
      const bytesForLength = (length) =>
        2 *
        data.layers *
        length *
        data.kvHeads *
        data.headDimension *
        data.bytesPerElement;
      const bytesPerSequence = bytesForLength(data.length);
      const doubledLengthBytesPerSequence = bytesForLength(data.length * 2);
      return {
        bytesPerSequence,
        maxSequences: Math.floor(data.budgetBytes / bytesPerSequence),
        doubledLengthBytesPerSequence,
        doubledLengthMaxSequences: Math.floor(
          data.budgetBytes / doubledLengthBytesPerSequence,
        ),
      };
    }
    case 'visual-llm-06-latency-breakdown': {
      const ttftMs = data.queueMs + data.prefillMs + data.firstPacketMs;
      const sortedSamples = [...data.samplesMs].sort((left, right) => left - right);
      const nearestRank = Math.ceil(data.percentile * sortedSamples.length);
      return {
        ttftMs,
        endToEndMs: ttftMs + sum(data.decodeIntervalsMs),
        nearestRank,
        p95Ms: sortedSamples[nearestRank - 1],
        maxMs: sortedSamples.at(-1),
      };
    }
    case 'visual-llm-07-retry-state-machine': {
      const firstValidIndex = data.attempts.findIndex(({ priority }) =>
        data.allowedPriorities.includes(priority),
      );
      const validated =
        firstValidIndex >= 0 && firstValidIndex < data.maxAttempts;
      if (!validated) {
        return {
          states: ['schema-failed', 'exhausted'],
          attemptsUsed: data.maxAttempts,
          eventResults: [],
          sideEffectExecutions: 0,
          cacheKeys: [],
        };
      }

      const keyPattern = new RegExp(data.idempotencyKeyPattern);
      const resultCache = new Map();
      let sideEffectExecutions = 0;
      const eventResults = data.events.map(({ key, payload }) => {
        if (typeof key !== 'string' || !keyPattern.test(key)) {
          return {
            key,
            status: 'rejected',
            error: 'invalid idempotency key',
            result: null,
          };
        }
        if (resultCache.has(key)) {
          return {
            key,
            status: 'deduplicated',
            result: resultCache.get(key),
          };
        }
        sideEffectExecutions += 1;
        const result = {
          receiptId: `effect-${sideEffectExecutions}`,
          payload,
        };
        resultCache.set(key, result);
        return { key, status: 'executed', result };
      });
      return {
        states: ['schema-failed', 'retry', 'validated', 'events-processed'],
        attemptsUsed: firstValidIndex + 1,
        eventResults,
        sideEffectExecutions,
        cacheKeys: [...resultCache.keys()],
      };
    }
    case 'visual-llm-07-version-eval-loop': {
      const evaluate = (passes) => {
        const failedSafetySampleIds = data.safetySampleIds.filter(
          (sampleId) => !passes[data.sampleIds.indexOf(sampleId)],
        );
        const safetyRate =
          (data.safetySampleIds.length - failedSafetySampleIds.length) /
          data.safetySampleIds.length;
        return {
          overallRate: sum(passes) / passes.length,
          safetyRate,
          blocked: safetyRate < data.safetyGate,
          failedSafetySampleIds,
        };
      };
      return {
        v1: evaluate(data.versions.v1),
        v2: evaluate(data.versions.v2),
      };
    }
    case 'visual-llm-08-eval-funnel': {
      const rates = Object.fromEntries(
        Object.entries(data.slices).map(([name, slice]) => [
          name,
          slice.passed / slice.total,
        ]),
      );
      const passed = sum(Object.values(data.slices).map((slice) => slice.passed));
      const total = sum(Object.values(data.slices).map((slice) => slice.total));
      return {
        rates,
        overallRate: passed / total,
        blocked: rates.adversarial < data.adversarialGate,
      };
    }
    case 'visual-llm-08-release-pareto': {
      const eligible = data.candidates.filter(
        ({ safety }) => safety >= data.safetyGate,
      );
      const dominates = (left, right) =>
        left.quality >= right.quality &&
        left.cost <= right.cost &&
        left.latency <= right.latency &&
        (left.quality > right.quality ||
          left.cost < right.cost ||
          left.latency < right.latency);
      const dominancePairs = eligible.flatMap((left) =>
        eligible
          .filter((right) => left !== right && dominates(left, right))
          .map((right) => [left.id, right.id]),
      );
      return {
        rejectedBySafety: data.candidates
          .filter(({ safety }) => safety < data.safetyGate)
          .map(({ id }) => id),
        dominancePairs,
        nonDominated: eligible
          .filter(
            (candidate) =>
              !eligible.some(
                (other) => other !== candidate && dominates(other, candidate),
              ),
          )
          .map(({ id }) => id),
      };
    }
    default:
      throw new Error(`未实现可执行 fixture：${fixture.visualId}`);
  }
}

function gitBlobSha(content) {
  return createHash('sha1')
    .update(`blob ${Buffer.byteLength(content)}\0`)
    .update(content)
    .digest('hex');
}

const rows = parseRows(inventory);
const rowsById = new Map(rows.map((row) => [row.visualId, row]));
const fixturesById = new Map(
  llmFoundationVisualFixtures.map((fixtureItem) => [fixtureItem.id, fixtureItem]),
);

function assertFixtureContracts(fixtures) {
  assert.equal(fixtures.length, 25);
  assert.equal(new Set(fixtures.map(({ id }) => id)).size, 25);
  assert.equal(new Set(fixtures.map(({ visualId }) => visualId)).size, 25);
  for (const fixtureItem of fixtures) {
    assert.deepEqual(Object.keys(fixtureItem.fields), [
      'Input',
      'Method',
      'Expected',
      'Rounding',
    ]);
    for (const [field, value] of Object.entries(fixtureItem.fields)) {
      assert.equal(typeof value, 'string', `${fixtureItem.id}.${field} 必须是字符串`);
      assert.ok(value.trim(), `${fixtureItem.id}.${field} 不得为空`);
    }
    assert.equal(
      fixtureItem.fields.Expected,
      formatExpectedFromResult(fixtureItem.result),
      `${fixtureItem.id}.Expected 必须从结构化 result 确定性生成`,
    );
    assert.equal(
      fixtureItem.fields.Expected,
      formatFixtureExpected(fixtureItem.result),
      `${fixtureItem.id}.Expected 必须使用模块 formatter`,
    );
    assert.ok(fixtureItem.data && typeof fixtureItem.data === 'object');
    assert.ok(fixtureItem.result && typeof fixtureItem.result === 'object');
  }
}

function assertFrozenRowDecisions(inputRows) {
  assert.equal(inputRows.length, 40);
  for (const row of inputRows) {
    assert.equal(row.decision, 'original-synthesis', `${row.visualId} decision 漂移`);
    assert.equal(row.status, 'verified', `${row.visualId} status 漂移`);
    assert.equal(
      row.candidateImageUrl,
      '无（不选择第三方图）',
      `${row.visualId} 原创决策不得绑定第三方候选 URL`,
    );
    assert.match(
      row.permissionEvidence,
      /^不适用：/,
      `${row.visualId} 原创决策必须明确许可证据不适用及原创边界`,
    );
  }
}

test('quantitative inventory has a dependency-free single fixture source', () => {
  assert.ok(
    existsSync(fixtureDataPath),
    'tests/fixtures/llm-foundation-visual-fixtures.js 必须存在',
  );
  assert.equal(
    fixtureDataSource.match(/^\s+Expected:/gm)?.length,
    1,
    'fixture 源码只能由构造器声明一次 Expected，不得逐项手写副本',
  );
  assert.match(
    fixtureDataSource,
    /Expected: formatFixtureExpected\(result\)/,
  );
  assertFixtureContracts(llmFoundationVisualFixtures);
});

test('every inventory row explicitly classifies its fixture scope', () => {
  const references = rows.map((row) => ({
    visualId: row.visualId,
    reference: parseFixtureReference(row.storyboard),
  }));

  assert.ok(
    references.every(({ reference }) => reference),
    '40 项都必须显式声明 fixture=quantitative 或 fixture=qualitative',
  );
  assert.equal(
    references.filter(({ reference }) => reference.kind === 'quantitative').length,
    25,
  );
  assert.equal(
    references.filter(({ reference }) => reference.kind === 'qualitative').length,
    15,
  );

  const actualQuantitativeVisualIds = new Set(
    references
      .filter(({ reference }) => reference.kind === 'quantitative')
      .map(({ visualId }) => visualId),
  );
  assert.deepEqual(
    [...actualQuantitativeVisualIds].sort(),
    [...quantitativeVisualIds].sort(),
    '文档派生的 quantitative 集合必须与冻结集合双向一致',
  );

  for (const { visualId, reference } of references) {
    if (reference.kind === 'qualitative') {
      assert.match(reference.detail, /^scope=.+/);
      assert.ok(!reference.detail.includes('fixtureId='));
      continue;
    }
    const match = reference.detail.match(
      /^fixtureId=(fixture-[a-z0-9-]+)；source=tests\/fixtures\/llm-foundation-visual-fixtures\.js$/,
    );
    assert.ok(match, `${visualId} 必须按固定语法引用单一 fixture 真源`);
    const fixtureItem = fixturesById.get(match[1]);
    assert.ok(fixtureItem, `${visualId} 引用的 ${match[1]} 必须存在`);
    assert.equal(fixtureItem.visualId, visualId);
  }

  assert.equal(fixturesById.size, 25, 'fixture ID 必须唯一且无孤儿项');
});

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

test('all 25 quantitative fixtures reproduce their complete expected chain', () => {
  for (const fixtureItem of llmFoundationVisualFixtures) {
    const actual = recomputeFixture(fixtureItem);
    assertDeepClose(actual, fixtureItem.result, fixtureItem.id);
  }
});

test('tokenizer, top-p and P95 execute from raw deliberately unordered inputs', () => {
  const autoregressive = fixturesById.get(
    'fixture-llm-01-autoregressive-generation',
  );
  assert.equal(autoregressive.data.rawPrompt, '资料助理：查');
  assert.ok(
    !Object.hasOwn(autoregressive.data, 'promptSegments'),
    'tokenizer fixture 不得预先提供切分结果',
  );

  for (const fixtureId of [
    'fixture-llm-06-generation-loop',
    'fixture-llm-06-temperature-top-p',
  ]) {
    const sampling = fixturesById.get(fixtureId);
    const inputOrder = sampling.data.candidates.map((candidate, index) => ({
      candidate,
      logit: sampling.data.logits[index],
    }));
    const descendingOrder = [...inputOrder].sort(
      (left, right) => right.logit - left.logit,
    );
    assert.notDeepEqual(
      inputOrder,
      descendingOrder,
      `${fixtureId} 必须故意使用未按概率排序的候选输入`,
    );
  }

  const latency = fixturesById.get('fixture-llm-06-latency-breakdown');
  assert.notDeepEqual(
    latency.data.samplesMs,
    [...latency.data.samplesMs].sort((left, right) => left - right),
    'P95 fixture 必须故意使用未排序观测值',
  );
});

test('RAG and SFT decisions execute named axes, examples and both negative paths', () => {
  const decisionFixture = fixturesById.get(
    'fixture-llm-05-rag-finetune-matrix',
  );
  assert.ok(
    decisionFixture.data.cases.every(
      (item) =>
        item.axes &&
        !Array.isArray(item.axes) &&
        typeof item.hasExamples === 'boolean',
    ),
    '每个用例必须用命名 axes 与结构化 hasExamples',
  );
  assert.deepEqual(
    decisionFixture.result.decisions.map(({ route }) => route),
    [
      'RAG',
      'SFT/LoRA',
      'insufficient evidence—do not fine-tune',
      'insufficient evidence—do not fine-tune',
    ],
  );

  const reordered = structuredClone(decisionFixture);
  reordered.data.cases = reordered.data.cases.map((item) => ({
    ...item,
    axes: Object.fromEntries(Object.entries(item.axes).reverse()),
  }));
  assertDeepClose(
    recomputeFixture(reordered),
    decisionFixture.result,
    'RAG/SFT 属性顺序不变性',
  );
});

test('retry fixture executes idempotency events and rejects invalid keys', () => {
  const retryFixture = fixturesById.get(
    'fixture-llm-07-retry-state-machine',
  );
  assert.ok(Array.isArray(retryFixture.data.events));
  assert.ok(
    !Object.hasOwn(retryFixture.data, 'submissions'),
    '幂等 fixture 不得用 submissions 数字预置结果',
  );

  const actual = recomputeFixture(retryFixture);
  assert.deepEqual(
    actual.eventResults.map(({ status }) => status),
    ['executed', 'deduplicated', 'executed', 'rejected', 'rejected'],
  );
  assert.deepEqual(actual.eventResults[1].result, actual.eventResults[0].result);
  assert.notDeepEqual(actual.eventResults[2].result, actual.eventResults[0].result);
  assert.equal(actual.sideEffectExecutions, 2);
  assert.deepEqual(actual.cacheKeys, ['ticket-42:v1', 'ticket-43:v1']);
});

test('method scan keeps every previously ignored input behaviorally observable', () => {
  const neuron = structuredClone(
    fixturesById.get('fixture-llm-02-neuron-forward'),
  );
  const positiveLoss = recomputeFixture(neuron).loss;
  neuron.data.y = 0;
  assert.notEqual(recomputeFixture(neuron).loss, positiveLoss);

  const generalization = structuredClone(
    fixturesById.get('fixture-llm-02-generalization-curves'),
  );
  generalization.data.series.underfit.train[2] = 1;
  generalization.data.series.overfit.train[2] = 0.7;
  const changedCurves = recomputeFixture(generalization);
  assert.equal(changedCurves.underfit.trainMonotonicDown, false);
  assert.equal(changedCurves.overfit.trainMonotonicDown, false);

  const causal = structuredClone(
    fixturesById.get('fixture-llm-04-causal-visibility'),
  );
  assert.ok(
    Array.isArray(causal.data.allowedScores),
    '因果遮罩必须计算原始允许分数，而不是读取无行为影响的统一偏移量',
  );
  causal.data.allowedScores[1][1] = Math.log(2);
  assert.notDeepEqual(
    recomputeFixture(causal).rowWeights[1],
    [0.5, 0.5, 0, 0],
  );

  const lora = structuredClone(fixturesById.get('fixture-llm-05-lora-update'));
  lora.data.rank = 2;
  assert.throws(() => recomputeFixture(lora), /rank=1/);
});

test('frozen decisions and fixture contracts reject review mutations', () => {
  assert.doesNotThrow(() => assertFrozenRowDecisions(rows));
  assert.doesNotThrow(() =>
    assertFixtureContracts(llmFoundationVisualFixtures),
  );

  const emptyExpected = structuredClone(llmFoundationVisualFixtures);
  emptyExpected[0].fields.Expected = '';
  assert.throws(
    () => assertFixtureContracts(emptyExpected),
    /Expected 不得为空/,
  );

  const wrongExpected = structuredClone(llmFoundationVisualFixtures);
  wrongExpected[0].fields.Expected = '伪造的非空输出';
  assert.throws(
    () => assertFixtureContracts(wrongExpected),
    /Expected 必须从结构化 result 确定性生成/,
  );

  const blocked = structuredClone(rows);
  blocked[0].status = 'blocked';
  assert.throws(() => assertFrozenRowDecisions(blocked), /status 漂移/);

  const reproduced = structuredClone(rows);
  reproduced[0].decision = 'licensed-reproduction';
  assert.throws(() => assertFrozenRowDecisions(reproduced), /decision 漂移/);

  const candidateDrift = structuredClone(rows);
  candidateDrift[0].candidateImageUrl = 'https://example.com/third-party.png';
  assert.throws(
    () => assertFrozenRowDecisions(candidateDrift),
    /不得绑定第三方候选 URL/,
  );
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

test('multi-head inventory derives its head count from the frozen fixture authority', () => {
  const multiHead = rowsById.get('visual-llm-04-multi-head-merge');
  const fixtureItem = fixturesById.get('fixture-llm-04-multi-head-merge');
  const numHeads = fixtureItem.data.heads.length;
  const declaredHeads = [...multiHead.storyboard.matchAll(/Head ([0-9]+(?:\/[0-9]+)*)/g)]
    .flatMap((match) => match[1].split('/').map(Number));
  assert.deepEqual(
    [...new Set(declaredHeads)].sort((left, right) => left - right),
    Array.from({ length: numHeads }, (_, index) => index + 1),
    'inventory Head 节点必须完全由 fixture heads.length 派生',
  );
  assert.ok(
    multiHead.storyboard.includes(`${numHeads === 2 ? '两' : numHeads}组独立 Q/K/V 投影`),
    'Reading order 必须与 fixture 头数一致',
  );
  assert.ok(!multiHead.storyboard.includes(`Head ${numHeads + 1}`));
  assert.ok(
    audit.includes(
      '2026-07-26 审查更正：概念稿的 3 头与 fixture numHeads=2（由 data.heads.length 冻结）冲突，采用 fixture 的 2 头作为数值单一真源。',
    ),
    'audit 必须记录 3→2 权威冲突与裁决',
  );
});

test('audit records reproducible commands, human review limits and both blobs', () => {
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
  const recordedFixtureBlob = audit.match(
    /Fixture git blob SHA：`([a-f0-9]{40})`/,
  )?.[1];
  assert.equal(
    recordedFixtureBlob,
    gitBlobSha(fixtureDataSource),
    'audit blob 必须匹配 fixture file',
  );
});
