export function estimateContextBudget({ system, history, retrieval, output, limit }) {
  const budgets = { system, history, retrieval, output, limit };
  for (const [name, value] of Object.entries(budgets)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be a finite, non-negative number`);
    }
  }

  const used = system + history + retrieval + output;
  const remaining = limit - used;
  const percent = limit === 0 ? 0 : Math.round((used / limit) * 100);
  if (![used, remaining, percent].every(Number.isFinite)) {
    throw new RangeError('context budget calculation exceeds the numeric range');
  }

  return {
    used,
    remaining,
    percent,
    overflow: used > limit,
  };
}

export function normalizeAttention(weights) {
  if (weights.length === 0) return [];

  const clamped = weights.map((weight) =>
    Number.isFinite(weight) ? Math.max(0, weight) : 0);
  const maximum = clamped.reduce((max, weight) => Math.max(max, weight), 0);
  if (maximum === 0) return clamped.map(() => 1 / clamped.length);

  const scaled = clamped.map((weight) => weight / maximum);
  const total = scaled.reduce((sum, weight) => sum + weight, 0);
  return scaled.map((weight) => weight / total);
}

export const MIN_TEMPERATURE = 0.05;
export const MAX_TEMPERATURE = 2;
export const MIN_TOP_P = 0.05;
export const MAX_TOP_P = 1;

export function sampleDistribution(candidates, temperature = 1, topP = 1) {
  if (candidates.length === 0) return [];

  const safeTemperature = Number.isFinite(temperature)
    ? Math.min(MAX_TEMPERATURE, Math.max(MIN_TEMPERATURE, temperature))
    : 1;
  const safeTopP = Number.isFinite(topP)
    ? Math.min(MAX_TOP_P, Math.max(MIN_TOP_P, topP))
    : 1;
  if (candidates.some(({ logit }) => !Number.isFinite(logit))) {
    throw new RangeError('candidate logits must be finite numbers');
  }

  const maxLogit = candidates.reduce(
    (maximum, candidate) => Math.max(maximum, candidate.logit),
    -Infinity,
  );
  const exponentials = candidates.map((candidate) =>
    Math.exp((candidate.logit - maxLogit) / safeTemperature));
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
