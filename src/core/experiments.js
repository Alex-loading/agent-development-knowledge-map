export function estimateContextBudget({ system, history, retrieval, output, limit }) {
  const used = system + history + retrieval + output;
  return {
    used,
    remaining: limit - used,
    percent: limit === 0 ? 0 : Math.round((used / limit) * 100),
    overflow: used > limit,
  };
}

export function normalizeAttention(weights) {
  if (weights.length === 0) return [];

  const clamped = weights.map((weight) =>
    Number.isFinite(weight) ? Math.max(0, weight) : 0);
  const total = clamped.reduce((sum, weight) => sum + weight, 0);

  return total === 0
    ? clamped.map(() => 1 / clamped.length)
    : clamped.map((weight) => weight / total);
}

export function sampleDistribution(candidates, temperature = 1, topP = 1) {
  if (candidates.length === 0) return [];

  const safeTemperature = Number.isFinite(temperature) && temperature > 0
    ? temperature
    : 1;
  const safeTopP = Number.isFinite(topP) ? Math.min(1, Math.max(0, topP)) : 1;
  const scaledLogits = candidates.map((candidate) =>
    (Number.isFinite(candidate.logit) ? candidate.logit : 0) / safeTemperature);
  const maxLogit = Math.max(...scaledLogits);
  const exponentials = scaledLogits.map((logit) => Math.exp(logit - maxLogit));
  const denominator = exponentials.reduce((sum, value) => sum + value, 0);

  const sorted = candidates
    .map((candidate, index) => ({
      token: candidate.token,
      logit: candidate.logit,
      probability: exponentials[index] / denominator,
      originalIndex: index,
    }))
    .sort((left, right) =>
      right.probability - left.probability || left.originalIndex - right.originalIndex);

  let cumulative = 0;
  return sorted.map(({ originalIndex, ...candidate }, index) => {
    const inNucleus = index === 0 || cumulative < safeTopP;
    cumulative += candidate.probability;
    return { ...candidate, inNucleus };
  });
}
