function fraction(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} 必须是 0 到 1 之间的有限数值`);
  }
}

function integer(value, name, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${name} 必须是至少 ${minimum} 的整数`);
}

function records(items, label, validate) {
  if (!Array.isArray(items)) throw new TypeError(`${label} 必须是数组`);
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || seen.has(item.id)) {
      throw new TypeError(`${label} 必须具有非空、唯一的 id`);
    }
    seen.add(item.id);
    validate(item);
  }
}

function gradeSummary(rows) {
  const graded = rows.filter(({ passed }) => passed !== null).length;
  const passed = rows.filter((row) => row.passed === true).length;
  return { total: rows.length, graded, passed, rate: graded ? passed / graded : null };
}

// 发布判断使用预先定义的教学规则。
export function evaluateReleaseGate({ baseline, candidate, minSamples = 2, maxDrop = 0, criticalFailures = 0 }) {
  integer(minSamples, '每组最少样本量', 1);
  integer(criticalFailures, '关键失败数');
  fraction(maxDrop, '允许下降比例');
  const validateCase = (row) => {
    if (typeof row.slice !== 'string' || !row.slice.trim()) throw new TypeError('每条案例必须注明切片');
    if (row.passed !== null && typeof row.passed !== 'boolean') throw new TypeError('passed 必须为布尔值或 null（未评分）');
  };
  records(baseline, '基线', validateCase);
  records(candidate, '候选', validateCase);
  const candidateById = new Map(candidate.map((row) => [row.id, row]));
  if (candidate.length !== baseline.length || baseline.some((row) => candidateById.get(row.id)?.slice !== row.slice)) {
    throw new RangeError('基线与候选必须是同一批案例且切片不变');
  }
  const baselineSummary = gradeSummary(baseline);
  const candidateSummary = gradeSummary(candidate);
  const sliceIds = [...new Set(baseline.map(({ slice }) => slice))].sort();
  const slices = sliceIds.map((id) => {
    const rows = baseline.filter(({ slice }) => slice === id);
    return { id, baseline: gradeSummary(rows), candidate: gradeSummary(rows.map((row) => candidateById.get(row.id))) };
  });
  const complete = (summary) => summary.total > 0 && summary.total === summary.graded;
  const regressed = (before, after) => complete(before) && complete(after) && before.rate - after.rate > maxDrop + 1e-12;
  const regressedSlices = slices.filter((slice) => regressed(slice.baseline, slice.candidate)).map(({ id }) => id);
  const insufficientSlices = slices.filter((slice) => slice.baseline.total < minSamples || !complete(slice.baseline) || !complete(slice.candidate)).map(({ id }) => id);
  const reasons = [];
  if (criticalFailures > 0) reasons.push(`存在 ${criticalFailures} 个关键失败，不能由其他得分抵消`);
  if (regressed(baselineSummary, candidateSummary)) reasons.push('总体成功率下降超过预设容差');
  if (regressedSlices.length) reasons.push(`切片退化：${regressedSlices.join('、')}`);
  const blocked = reasons.length > 0;
  const insufficient = !complete(baselineSummary) || !complete(candidateSummary) || insufficientSlices.length > 0;
  if (!complete(baselineSummary) || !complete(candidateSummary)) reasons.push('缺少完整配对评分，不能据缺失证据判定通过');
  if (insufficientSlices.length) reasons.push(`样本不足或尚未评分：${insufficientSlices.join('、')}`);
  if (!blocked && !insufficient) reasons.push('满足本教学规则；仍需人工审查、不确定性分析与线上验证');
  return {
    status: blocked ? 'block' : insufficient ? 'hold' : 'pass',
    baseline: baselineSummary, candidate: candidateSummary, slices,
    regressedSlices, insufficientSlices, reasons,
  };
}

// 给定同一任务的成功概率，计算独立同分布试验的结果。
export function trialReliability({ probability, attempts }) {
  fraction(probability, '单次成功概率');
  integer(attempts, '尝试次数', 1);
  if (attempts > 100) throw new RangeError('教学尝试次数不得超过 100');
  return { atLeastOne: 1 - (1 - probability) ** attempts, allSuccess: probability ** attempts };
}

const TELEMETRY_KEYS = Object.freeze(['modelVersion', 'promptVersion', 'stage']);

export function sampleTeachingTraces(traces, mode = 'all') {
  if (!['all', 'head-demo', 'errors-only'].includes(mode)) throw new RangeError('未知采样模式');
  records(traces, 'trace', (trace) => {
    if (!['ok', 'error'].includes(trace.outcome)) throw new TypeError('trace outcome 必须为 ok 或 error');
    if (!Number.isFinite(trace.durationMs) || trace.durationMs < 0) throw new RangeError('trace 时长必须为非负有限数值');
    if (trace.attributes === null || typeof trace.attributes !== 'object' || Array.isArray(trace.attributes)) {
      throw new TypeError('trace attributes 必须为对象');
    }
  });
  const selected = traces.filter((trace, index) => mode === 'all' || (mode === 'head-demo' ? index % 3 === 0 : trace.outcome === 'error'));
  const errorCount = (rows) => rows.filter(({ outcome }) => outcome === 'error').length;
  return {
    mode, population: traces.length, retained: selected.length,
    populationErrorRate: traces.length ? errorCount(traces) / traces.length : null,
    retainedErrorRate: selected.length ? errorCount(selected) / selected.length : null,
    traces: selected.map(({ id, outcome, durationMs, attributes }) => ({
      id, outcome, durationMs,
      attributes: Object.fromEntries(TELEMETRY_KEYS.filter((key) => (
        Object.hasOwn(attributes, key) && typeof attributes[key] === 'string'
      )).map((key) => [key, attributes[key]])),
    })),
  };
}

export function assessSafetyRegression(cases, { classifierEnabled, policyEnabled }) {
  if (typeof classifierEnabled !== 'boolean' || typeof policyEnabled !== 'boolean') {
    throw new TypeError('防护开关必须为布尔值');
  }
  records(cases, '安全案例', (row) => {
    for (const field of ['attack', 'detectorFlags', 'authorized']) {
      if (typeof row[field] !== 'boolean') throw new TypeError(`${field} 必须为布尔值`);
    }
  });
  const detection = { truePositive: 0, falseNegative: 0, falsePositive: 0, trueNegative: 0 };
  const outcomes = cases.map((row) => {
    const flagged = classifierEnabled && row.detectorFlags;
    detection[row.attack ? (flagged ? 'truePositive' : 'falseNegative') : (flagged ? 'falsePositive' : 'trueNegative')] += 1;
    const policyDenied = policyEnabled && !row.authorized;
    const executed = !flagged && !policyDenied;
    return { id: row.id, attack: row.attack, flagged, policyDenied, executed, unauthorizedEffect: executed && !row.authorized };
  });
  const attacks = outcomes.filter(({ attack }) => attack).length;
  const attackSuccesses = outcomes.filter(({ attack, unauthorizedEffect }) => attack && unauthorizedEffect).length;
  return {
    detection, outcomes, attacks, attackSuccesses,
    unauthorizedEffects: outcomes.filter(({ unauthorizedEffect }) => unauthorizedEffect).length,
    falseRefusals: outcomes.filter((row, index) => !row.attack && cases[index].authorized && !row.executed).length,
    // 评分范围限定为这些案例中的越权动作。
    attackSuccessRate: attacks ? attackSuccesses / attacks : null,
  };
}
