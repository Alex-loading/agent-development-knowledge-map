function isInclusive(value) {
  return value == null || value === 'all';
}

function matches(value, expected) {
  return isInclusive(expected) || value === expected;
}

export function resourcePlatform(item) {
  if (item.platform) return item.platform;

  if (item.url) {
    try {
      const hostname = new URL(item.url).hostname.toLowerCase().replace(/^www\./, '');
      if (hostname === 'github.com' || hostname.endsWith('.github.com')) return 'GitHub';
      if (hostname === 'bilibili.com' || hostname.endsWith('.bilibili.com')) return 'Bilibili';
      if (
        hostname === 'youtube.com'
        || hostname.endsWith('.youtube.com')
        || hostname === 'youtu.be'
      ) return 'YouTube';
      if (hostname === 'huggingface.co') return 'Hugging Face';
      if (hostname === '3blue1brown.com') return '3Blue1Brown';
      if (hostname === 'arxiv.org') return 'arXiv';
      return hostname;
    } catch {
      // Invalid URLs simply cannot contribute platform metadata.
    }
  }

  if (/GitHub/i.test(item.type ?? '')) return 'GitHub';
  if (/Bilibili/i.test(item.type ?? '')) return 'Bilibili';
  if (/YouTube/i.test(item.type ?? '')) return 'YouTube';
  return null;
}

export function filterResources(items, filters = {}) {
  return items.filter((item) =>
    matches(item.language, filters.language)
    && matches(resourcePlatform(item), filters.platform)
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
