import { button, element } from './dom.js';

const VIEWS = [
  ['dashboard', '模块首页'],
  ['curriculum', '学习主线'],
  ['map', '知识地图'],
  ['resources', '资源库'],
  ['interviews', '面试高频'],
  ['progress', '学习进度'],
];

const selectHandlers = new WeakMap();

function prerequisiteLabel(module, modules) {
  if (!module.prerequisites?.length) return '无需前置模块';
  const titles = module.prerequisites.map((id) => modules.find((item) => item.id === id)?.title ?? id);
  return `前置：${titles.join('、')}`;
}

function moduleButton(module, index, modules, activeModuleId, onModuleSelect) {
  const active = module.id === activeModuleId;
  const planned = module.status !== 'active';
  const control = button('', {
    className: 'module-item',
    disabled: planned,
    attrs: {
      'aria-current': active ? 'page' : null,
      'aria-label': `${module.title}，${planned ? '规划中' : '可学习'}`,
    },
    events: { click: () => onModuleSelect?.(module.id) },
  });
  control.append(
    element('span', { className: 'module-number', text: String(index + 1).padStart(2, '0'), attrs: { 'aria-hidden': 'true' } }),
    element('span', { className: 'module-copy' }, [
      element('span', { className: 'module-title', text: module.title }),
      element('span', { className: 'module-status', text: planned ? '规划中 · 尚未开放' : '当前开放 · 可学习' }),
      element('span', { className: 'module-summary', text: module.summary }),
      element('span', { className: 'module-prerequisites', text: prerequisiteLabel(module, modules) }),
    ]),
  );
  return control;
}

function renderModuleSelect(select, modules, activeModuleId, onModuleSelect) {
  const options = modules.map((module) => {
    const planned = module.status !== 'active';
    const option = element('option', {
      text: `${module.title}${planned ? '（规划中）' : ''}`,
      attrs: { value: module.id },
    });
    option.disabled = planned;
    option.selected = module.id === activeModuleId;
    return option;
  });
  select.replaceChildren(...options);
  const previousHandler = selectHandlers.get(select);
  if (previousHandler) select.removeEventListener('change', previousHandler);
  const nextHandler = () => onModuleSelect?.(select.value);
  select.addEventListener('change', nextHandler);
  selectHandlers.set(select, nextHandler);
}

function renderTabs(container, activeView, onViewSelect) {
  const tabs = VIEWS.map(([id, label]) => button(label, {
    className: 'view-tab',
    attrs: { 'aria-current': id === activeView ? 'page' : null },
    dataset: { view: id },
    events: { click: () => onViewSelect?.(id) },
  }));
  container.replaceChildren(...tabs);
}

export function renderShell({
  modules,
  activeModuleId,
  activeView,
  progressSummary = {},
  storageMode = 'local',
  onModuleSelect,
  onViewSelect,
}) {
  const moduleList = document.querySelector('#module-list');
  const moduleSelect = document.querySelector('#module-select');
  const viewTabs = document.querySelector('#view-tabs');
  const moduleTitle = document.querySelector('#current-module-title');
  const progress = document.querySelector('#progress-summary');
  const storageNotice = document.querySelector('#storage-notice');

  if (!moduleList || !moduleSelect || !viewTabs || !moduleTitle || !progress || !storageNotice) {
    throw new Error('应用壳层挂载点不完整');
  }

  const activeModule = modules.find((module) => module.id === activeModuleId) ?? modules[0];
  moduleTitle.textContent = activeModule?.title ?? '学习模块';
  moduleList.replaceChildren(...modules.map((module, index) => (
    moduleButton(module, index, modules, activeModuleId, onModuleSelect)
  )));
  renderModuleSelect(moduleSelect, modules, activeModuleId, onModuleSelect);
  renderTabs(viewTabs, activeView, onViewSelect);

  progress.replaceChildren(
    element('span', { text: `课程 ${progressSummary.lessonsCompleted ?? 0} / ${progressSummary.lessonTotal ?? 0}` }),
    element('span', { text: `面试 ${progressSummary.interviewsMastered ?? 0} / ${progressSummary.interviewTotal ?? 0}` }),
  );
  storageNotice.hidden = storageMode !== 'memory';
}
