function isInclusive(value) {
  return value == null || value === 'all';
}

function matches(value, expected) {
  return isInclusive(expected) || value === expected;
}

export function filterResources(items, filters = {}) {
  return items.filter((item) =>
    matches(item.language, filters.language)
    && (isInclusive(filters.platform)
      || item.platform === filters.platform
      || item.source === filters.platform)
    && matches(item.source, filters.source)
    && matches(item.type, filters.type)
    && matches(item.difficulty, filters.difficulty)
    && matches(item.stage, filters.stage));
}

export function filterInterviewQuestions(items, filters = {}, statusById = {}) {
  const expectedStatus = filters.status ?? filters.masteryStatus;

  return items.filter((item) => {
    const status = statusById[item.id] ?? 'unseen';
    return (isInclusive(filters.role) || item.roles?.includes(filters.role))
      && matches(item.frequency, filters.frequency)
      && matches(item.difficulty, filters.difficulty)
      && matches(status, expectedStatus);
  });
}
