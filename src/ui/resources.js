import { filterResources, resourcePlatform } from '../core/filters.js';
import { button, element, externalLink } from './dom.js';

function platformFor(resource) {
  return resourcePlatform(resource) ?? '未知平台';
}

function distinct(items, getter) {
  return [...new Set(items.map(getter).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function filterSelect({ id, label, value = 'all', options, onChange }) {
  const select = element('select', {
    attrs: { id, name: id },
    events: { change: () => onChange(select.value) },
  }, [
    element('option', { text: '全部', attrs: { value: 'all' } }),
    ...options.map((option) => element('option', { text: option, attrs: { value: option } })),
  ]);
  select.value = value ?? 'all';
  for (const option of select.children) option.selected = option.value === select.value;
  return element('label', { className: 'filter-control', attrs: { for: id } }, [
    element('span', { text: label }),
    select,
  ]);
}

function resourceRow(resource) {
  const platform = platformFor(resource);
  return element('li', {
    className: 'resource-row',
    dataset: { platform },
    attrs: { 'data-platform': platform },
  }, [
    element('div', { className: 'resource-row__main' }, [
      externalLink(resource),
      element('p', { className: 'resource-row__value', text: resource.value }),
    ]),
    element('dl', { className: 'resource-row__meta' }, [
      element('div', {}, [element('dt', { text: '来源' }), element('dd', { text: resource.source })]),
      element('div', {}, [element('dt', { text: '平台' }), element('dd', { text: platform })]),
      element('div', {}, [element('dt', { text: '语言' }), element('dd', { text: resource.language })]),
      element('div', {}, [element('dt', { text: '类型' }), element('dd', { text: resource.type })]),
      element('div', {}, [element('dt', { text: '难度' }), element('dd', { text: resource.difficulty })]),
      element('div', {}, [element('dt', { text: '阶段' }), element('dd', { text: resource.stage })]),
      element('div', {}, [element('dt', { text: '核验' }), element('dd', { text: resource.verifiedAt })]),
    ]),
  ]);
}

export function renderResourceLibrary(root, {
  resources = [],
  filters = {},
  onFiltersChange,
}) {
  const normalized = {
    language: filters.language ?? 'all',
    platform: filters.platform ?? 'all',
    source: filters.source ?? 'all',
    type: filters.type ?? 'all',
    difficulty: filters.difficulty ?? 'all',
    stage: filters.stage ?? 'all',
  };
  const updateFilter = (key, value) => onFiltersChange?.({ ...normalized, [key]: value });
  const visible = filterResources(resources, normalized);
  const activeCount = Object.values(normalized).filter((value) => value !== 'all').length;
  const fields = [
    ['language', '语言', distinct(resources, (resource) => resource.language)],
    ['platform', '平台', distinct(resources, platformFor)],
    ['source', '来源', distinct(resources, (resource) => resource.source)],
    ['type', '类型', distinct(resources, (resource) => resource.type)],
    ['difficulty', '难度', distinct(resources, (resource) => resource.difficulty)],
    ['stage', '学习阶段', distinct(resources, (resource) => resource.stage)],
  ];

  root.replaceChildren(
    element('section', { className: 'resource-library-view', attrs: { 'aria-labelledby': 'resources-title' } }, [
      element('header', { className: 'section-header' }, [
        element('span', { className: 'section-index', text: 'LLM FOUNDATION / 资料索引' }),
        element('h1', { text: '资源库', attrs: { id: 'resources-title' } }),
        element('p', { text: '以资料账簿快速筛选 28 份课程、项目、论文与视频；每条都标注学习价值和最近核验日期。' }),
      ]),
      element('fieldset', { className: 'filter-ledger' }, [
        element('legend', { text: '筛选学习资料' }),
        element('div', { className: 'filter-ledger__grid' }, fields.map(([key, label, options]) => filterSelect({
          id: `resource-filter-${key}`,
          label,
          value: normalized[key],
          options,
          onChange: (value) => updateFilter(key, value),
        }))),
        element('div', { className: 'filter-ledger__summary', attrs: { 'aria-live': 'polite' } }, [
          element('strong', { text: `显示 ${visible.length} / ${resources.length}` }),
          element('span', { text: `启用筛选 ${activeCount} 项` }),
          button('重置筛选', {
            className: 'secondary-action',
            disabled: activeCount === 0,
            events: { click: () => onFiltersChange?.({}) },
          }),
        ]),
      ]),
      visible.length
        ? element('ol', { className: 'resource-ledger', attrs: { 'aria-label': '资料筛选结果' } }, visible.map(resourceRow))
        : element('section', { className: 'empty-state resource-empty' }, [
          element('h2', { text: '没有符合当前筛选条件的资料' }),
          element('p', { text: '尝试减少一个条件，或重置后从完整资料账簿重新开始。' }),
          button('重置筛选', { events: { click: () => onFiltersChange?.({}) } }),
        ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}
