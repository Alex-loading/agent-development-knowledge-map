import { summarizeProgress } from './core/progress.js';
import { createProgressStore } from './core/storage.js';
import { llmFoundation } from './data/llm-foundation.js';
import { modules } from './data/modules.js';
import { element } from './ui/dom.js';
import { renderShell } from './ui/shell.js';

const DEFAULT_HASH = '#llm-foundation/dashboard';
const VIEWS = new Set(['dashboard', 'curriculum', 'map', 'resources', 'interviews', 'progress']);
const VIEW_COPY = {
  dashboard: ['模块首页', '从一条推荐路径开始，也可以随时打开课程、知识地图或面试档案。'],
  curriculum: ['学习主线', '八节课程将把模型原理、应用实践与验证任务串成一条可执行路线。'],
  map: ['知识地图', '在全局关系中定位概念、前置知识与下一步，避免只记孤立名词。'],
  resources: ['资源库', '按阶段与难度检索经过筛选的 GitHub、官方课程、博客和视频资料。'],
  interviews: ['面试高频', '从三十秒回答进入深挖、误区与追问，并分别记录掌握状态。'],
  progress: ['学习进度', '课程完成度和面试掌握度分开记录，让复习队列保持诚实。'],
};

export function normalizeRoute(hash) {
  const parts = String(hash ?? '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const module = modules.find((item) => item.id === parts[0] && item.status === 'active');
  if (!module) return { hash: DEFAULT_HASH, moduleId: 'llm-foundation', view: 'dashboard' };

  if (parts[1] === 'lesson' && parts.length === 3) {
    const lesson = llmFoundation.lessons.find((item) => item.id === parts[2]);
    if (lesson) return { hash: `#${module.id}/lesson/${lesson.id}`, moduleId: module.id, view: 'lesson', lessonId: lesson.id };
  }

  if (parts.length === 2 && VIEWS.has(parts[1])) {
    return { hash: `#${module.id}/${parts[1]}`, moduleId: module.id, view: parts[1] };
  }

  return { hash: DEFAULT_HASH, moduleId: 'llm-foundation', view: 'dashboard' };
}

function storageAdapter() {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem() { throw new Error('localStorage unavailable'); },
      setItem() { throw new Error('localStorage unavailable'); },
      removeItem() { throw new Error('localStorage unavailable'); },
    };
  }
}

function viewPlaceholder(route) {
  if (route.view === 'lesson') {
    const lesson = llmFoundation.lessons.find((item) => item.id === route.lessonId);
    return {
      index: `课程 ${String(lesson.order).padStart(2, '0')} / ${String(llmFoundation.lessons.length).padStart(2, '0')}`,
      title: lesson.title,
      summary: lesson.summary,
    };
  }
  const [title, summary] = VIEW_COPY[route.view];
  return { index: 'LLM FOUNDATION / 研究手册', title, summary };
}

function renderPlaceholder(root, route) {
  const copy = viewPlaceholder(route);
  root.replaceChildren(
    element('section', { className: 'view-placeholder', attrs: { 'aria-labelledby': 'view-title' } }, [
      element('span', { className: 'section-index', text: copy.index }),
      element('h1', { text: copy.title, attrs: { id: 'view-title' } }),
      element('p', { text: copy.summary }),
      element('div', { className: 'placeholder-ledger', attrs: { 'aria-label': '本模块结构' } }, [
        element('div', {}, [element('strong', { text: '8 节课程' }), element('span', { text: '原理、实践、测验与完成标准' })]),
        element('div', {}, [element('strong', { text: '24 道面试题' }), element('span', { text: '短答、深挖、误区与追问' })]),
        element('div', {}, [element('strong', { text: '独立进度' }), element('span', { text: '课程完成与面试掌握分开统计' })]),
      ]),
    ]),
  );
  root.removeAttribute('aria-busy');
}

function startApp() {
  const store = createProgressStore(storageAdapter());
  const state = store.load();
  let focusAfterNavigation = false;

  const navigate = (nextHash) => {
    focusAfterNavigation = true;
    if (window.location.hash === nextHash) {
      render();
    } else {
      window.location.hash = nextHash;
    }
  };

  const render = () => {
    const route = normalizeRoute(window.location.hash);
    if (window.location.hash !== route.hash) window.history.replaceState(null, '', route.hash);

    const summary = summarizeProgress(state, llmFoundation.lessons.length, llmFoundation.interviewQuestions.length);
    renderShell({
      modules,
      activeModuleId: route.moduleId,
      activeView: route.view === 'lesson' ? 'curriculum' : route.view,
      progressSummary: {
        ...summary,
        lessonTotal: llmFoundation.lessons.length,
        interviewTotal: llmFoundation.interviewQuestions.length,
      },
      storageMode: store.mode(),
      onModuleSelect: (moduleId) => navigate(`#${moduleId}/dashboard`),
      onViewSelect: (view) => navigate(`#${route.moduleId}/${view}`),
    });

    const root = document.querySelector('#view-root');
    const live = document.querySelector('#app-live-region');
    const main = document.querySelector('#app-main');
    if (!root || !live || !main) throw new Error('主要内容挂载点不完整');
    renderPlaceholder(root, route);
    live.textContent = `已打开${viewPlaceholder(route).title}`;
    document.title = `${viewPlaceholder(route).title} · Agent Learner`;
    if (focusAfterNavigation) {
      main.focus({ preventScroll: true });
      focusAfterNavigation = false;
    }
  };

  window.addEventListener('hashchange', render);
  render();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') startApp();
