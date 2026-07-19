export const FILTER_ALL = '__all__';
const FILTER_EXACT_PREFIX = '__filter_exact__:';

function isInclusive(value) {
  return value == null || value === FILTER_ALL || value === 'all';
}

function exactValue(value) {
  if (typeof value === 'string' && value.startsWith(FILTER_EXACT_PREFIX)) {
    return decodeURIComponent(value.slice(FILTER_EXACT_PREFIX.length));
  }
  return value;
}

export function filterOptionValue(value) {
  const text = String(value);
  return text === 'all' || text === FILTER_ALL || text.startsWith(FILTER_EXACT_PREFIX)
    ? `${FILTER_EXACT_PREFIX}${encodeURIComponent(text)}`
    : text;
}

function matches(value, expected) {
  return isInclusive(expected) || value === exactValue(expected);
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
    return (isInclusive(filters.role) || item.roles?.includes(exactValue(filters.role)))
      && matches(item.frequency, filters.frequency)
      && matches(item.difficulty, filters.difficulty)
      && matches(status, expectedStatus);
  });
}
