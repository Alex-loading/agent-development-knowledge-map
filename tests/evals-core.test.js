import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const coreUrl = new URL('../src/core/evals.js', import.meta.url);
async function core() {
  assert.ok(existsSync(coreUrl), '评测实验的纯逻辑应已实现');
  return import(coreUrl.href);
}
const baseline = [
  { id: 'a1', slice: 'normal', passed: true },
  { id: 'a2', slice: 'normal', passed: false },
  { id: 'b1', slice: 'long', passed: true },
  { id: 'b2', slice: 'long', passed: true },
];

test('release gate detects a slice regression hidden by an unchanged aggregate', async () => {
  const { evaluateReleaseGate } = await core();
  const candidate = baseline.map((row) => ({ ...row, passed: row.id !== 'b2' }));
  const before = JSON.stringify({ baseline, candidate });
  const result = evaluateReleaseGate({ baseline, candidate, minSamples: 2, maxDrop: 0, criticalFailures: 0 });
  assert.equal(result.baseline.rate, .75);
  assert.equal(result.candidate.rate, .75);
  assert.equal(result.status, 'block');
  assert.deepEqual(result.regressedSlices, ['long']);
  assert.equal(JSON.stringify({ baseline, candidate }), before);
  assert.deepEqual(evaluateReleaseGate({ baseline, candidate: [...candidate].reverse(), minSamples: 2, maxDrop: 0, criticalFailures: 0 }), result);
});

test('gate separates absent or ungraded evidence from success and prioritizes known critical failures', async () => {
  const { evaluateReleaseGate } = await core();
  const run = (extra) => evaluateReleaseGate({ baseline, candidate: baseline, minSamples: 2, maxDrop: .1, criticalFailures: 0, ...extra });
  assert.equal(run({}).status, 'pass');
  assert.equal(run({ minSamples: 3 }).status, 'hold');
  assert.equal(run({ baseline: [], candidate: [] }).status, 'hold');
  assert.equal(run({ baseline: [], candidate: [], criticalFailures: 1 }).status, 'block');
  const candidate = baseline.map((row) => ({ ...row, passed: null }));
  const missing = run({ candidate });
  assert.equal(missing.status, 'hold');
  assert.equal(missing.candidate.rate, null);
  assert.equal(missing.candidate.graded, 0);
  assert.equal(run({ candidate, criticalFailures: 1 }).status, 'block');
});

test('gate rejects incomparable cases, duplicate IDs and invalid numeric inputs', async () => {
  const { evaluateReleaseGate } = await core();
  const run = (extra) => evaluateReleaseGate({ baseline, candidate: baseline, minSamples: 2, maxDrop: 0, criticalFailures: 0, ...extra });
  for (const extra of [
    { candidate: baseline.slice(1) },
    { candidate: [...baseline, baseline[0]] },
    { candidate: baseline.map((row) => ({ ...row, slice: 'changed' })) },
    { candidate: baseline.map((row) => ({ ...row, passed: 'false' })) },
    { minSamples: 0 }, { minSamples: 1.5 }, { minSamples: NaN },
    { maxDrop: -1 }, { maxDrop: Infinity }, { criticalFailures: -1 },
  ]) assert.throws(() => run(extra));
  assert.equal(run({ candidate: baseline.map((row) => ({ ...row, passed: row.id === 'b1' })), maxDrop: .5 }).status, 'pass');
});

test('repeated trial illustration states one-task iid probabilities and validates boundaries', async () => {
  const { trialReliability } = await core();
  const result = trialReliability({ probability: .75, attempts: 3 });
  assert.equal(result.atLeastOne, .984375);
  assert.equal(result.allSuccess, .421875);
  assert.equal(trialReliability({ probability: 0, attempts: 5 }).atLeastOne, 0);
  assert.equal(trialReliability({ probability: 1, attempts: 5 }).allSuccess, 1);
  for (const args of [{ probability: 1.1, attempts: 1 }, { probability: NaN, attempts: 1 }, { probability: .5, attempts: 0 }, { probability: .5, attempts: 2.5 }]) {
    assert.throws(() => trialReliability(args));
  }
});

test('trace sample reports both denominators without returning sensitive attributes', async () => {
  const { sampleTeachingTraces } = await core();
  const traces = Array.from({ length: 6 }, (_, i) => ({
    id: `t${i}`, outcome: i % 3 === 2 ? 'error' : 'ok', durationMs: 10 + i,
    attributes: { modelVersion: 'm1', promptVersion: 'p1', stage: 'answer', prompt: 'private-text', token: 'secret-value', nested: { email: 'private-value' } },
  }));
  const original = JSON.stringify(traces);
  const errors = sampleTeachingTraces(traces, 'errors-only');
  assert.equal(errors.retained, 2);
  assert.equal(errors.retainedErrorRate, 1);
  assert.equal(errors.populationErrorRate, 1 / 3);
  assert.doesNotMatch(JSON.stringify(errors), /private-text|secret-value|private-value/);
  assert.deepEqual(Object.keys(errors.traces[0].attributes), ['modelVersion', 'promptVersion', 'stage']);
  assert.equal(sampleTeachingTraces(traces, 'head-demo').retainedErrorRate, 0);
  assert.equal(sampleTeachingTraces(traces, 'all').retained, 6);
  assert.equal(sampleTeachingTraces([], 'all').retainedErrorRate, null);
  assert.equal(JSON.stringify(traces), original);
  assert.throws(() => sampleTeachingTraces(traces, 'unknown'));
  assert.throws(() => sampleTeachingTraces([traces[0], traces[0]], 'all'));
  assert.throws(() => sampleTeachingTraces([{ ...traces[0], durationMs: -1 }], 'all'));
});

test('safety regression distinguishes detector misses, benign refusals and actual unauthorized effects', async () => {
  const { assessSafetyRegression } = await core();
  const cases = [
    { id: 'attack-known', attack: true, detectorFlags: true, authorized: false },
    { id: 'attack-missed', attack: true, detectorFlags: false, authorized: false },
    { id: 'benign-flagged', attack: false, detectorFlags: true, authorized: true },
    { id: 'benign', attack: false, detectorFlags: false, authorized: true },
  ];
  const before = JSON.stringify(cases);
  const onlyClassifier = assessSafetyRegression(cases, { classifierEnabled: true, policyEnabled: false });
  assert.deepEqual(onlyClassifier.detection, { truePositive: 1, falseNegative: 1, falsePositive: 1, trueNegative: 1 });
  assert.equal(onlyClassifier.unauthorizedEffects, 1);
  assert.equal(onlyClassifier.attackSuccesses, 1);
  assert.equal(onlyClassifier.attacks, 2);
  assert.equal(onlyClassifier.falseRefusals, 1);
  const both = assessSafetyRegression(cases, { classifierEnabled: true, policyEnabled: true });
  assert.equal(both.unauthorizedEffects, 0);
  assert.equal(both.attackSuccesses, 0);
  assert.equal(both.falseRefusals, 1);
  assert.equal(both.detection.falseNegative, 1);
  const onlyPolicy = assessSafetyRegression(cases, { classifierEnabled: false, policyEnabled: true });
  assert.equal(onlyPolicy.falseRefusals, 0);
  assert.equal(JSON.stringify(cases), before);
  assert.equal(assessSafetyRegression([], { classifierEnabled: true, policyEnabled: true }).attackSuccessRate, null);
  assert.throws(() => assessSafetyRegression(cases, { classifierEnabled: 'false', policyEnabled: true }));
  assert.throws(() => assessSafetyRegression([{ ...cases[0], authorized: undefined }], { classifierEnabled: true, policyEnabled: true }));
});
