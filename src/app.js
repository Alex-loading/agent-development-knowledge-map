import {
  markLessonComplete,
  recordQuizResult,
  resetModuleProgress,
  setInterviewStatus,
  summarizeProgress,
  toggleReviewQueue,
} from './core/progress.js';
import { createProgressStore } from './core/storage.js';
import { getNextLesson } from './core/view-models.js';
import { llmFoundation } from './data/llm-foundation.js';
import { modules } from './data/modules.js';
import { renderCurriculumList, renderLessonDetail } from './ui/curriculum.js';
import { renderDashboard } from './ui/dashboard.js';
import { element } from './ui/dom.js';
import { renderInterviewPractice } from './ui/interviews.js';
import { renderKnowledgeMap } from './ui/knowledge-map.js';
import { renderProgressView } from './ui/progress-view.js';
import { renderResourceLibrary } from './ui/resources.js';
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

function storageAdapter(windowRef) {
  try {
    return windowRef.localStorage;
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

export function startApp({
  windowRef = window,
  documentRef = document,
  progressStore,
} = {}) {
  const store = progressStore ?? createProgressStore(storageAdapter(windowRef));
  let state = store.load();
  let focusAfterNavigation = false;
  let focusAfterCompletion = false;
  let lastRenderedHash = null;
  let pendingAnnouncement = '';
  let pendingViewFocusId = null;
  let pendingViewFallbackId = null;
  const viewState = {
    resourceFilters: {},
    interviewFilters: {},
    revealedInterviewIds: new Set(),
    resetConfirmOpen: false,
  };

  const persistState = (nextState) => {
    state = nextState;
    store.save(state);
  };

  const restoreViewFocusAfterRender = (focusId, fallbackId) => {
    pendingViewFocusId = focusId;
    pendingViewFallbackId = fallbackId;
  };

  const navigate = (nextHash) => {
    focusAfterNavigation = true;
    if (windowRef.location.hash === nextHash) {
      render();
    } else {
      windowRef.location.hash = nextHash;
    }
  };

  const openLesson = (lessonId) => navigate(`#llm-foundation/lesson/${lessonId}`);

  const completeLesson = (lessonId) => {
    const lesson = llmFoundation.lessons.find((item) => item.id === lessonId);
    if (!lesson || state.completedLessonIds.includes(lessonId)) return;
    const completedState = markLessonComplete(state, lessonId);
    const allComplete = llmFoundation.lessons.every(({ id }) => (
      completedState.completedLessonIds.includes(id)
    ));
    const nextLesson = getNextLesson(llmFoundation.lessons, completedState);
    persistState({
      ...completedState,
      currentModuleId: llmFoundation.id,
      currentLessonId: nextLesson?.id ?? lessonId,
      lastVisitedAt: new Date().toISOString(),
    });
    pendingAnnouncement = `已完成${lesson.title}。${allComplete ? 'LLM 基础主线已全部完成。' : `下一节建议：${nextLesson?.title ?? '请回到学习主线选择课程'}`}`;
    focusAfterCompletion = true;
    render();
  };

  const updateResourceFilters = (filters, focusId) => {
    viewState.resourceFilters = { ...filters };
    restoreViewFocusAfterRender(focusId, 'resource-results-summary');
    render();
  };

  const updateInterviewFilters = (filters, focusId) => {
    viewState.interviewFilters = { ...filters };
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const toggleInterviewReveal = (questionId, focusId) => {
    if (viewState.revealedInterviewIds.has(questionId)) {
      viewState.revealedInterviewIds.delete(questionId);
    } else {
      viewState.revealedInterviewIds.add(questionId);
    }
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const updateInterviewStatus = (questionId, status, focusId) => {
    const currentStatus = state.interviewStatusById?.[questionId] ?? 'unseen';
    if (currentStatus === status) return;
    persistState(setInterviewStatus(state, questionId, status));
    const question = llmFoundation.interviewQuestions.find(({ id }) => id === questionId);
    const labels = { unseen: '未掌握', reviewing: '复习中', mastered: '已掌握' };
    pendingAnnouncement = `${question?.question ?? '面试题'}已标记为${labels[status] ?? status}`;
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const updateReviewQueue = (questionId, focusId) => {
    const wasQueued = state.reviewQueue?.includes(questionId);
    persistState(toggleReviewQueue(state, questionId));
    pendingAnnouncement = wasQueued ? '已移出复习队列' : '已加入复习队列';
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const saveQuizResult = (lessonId, score, message, live) => {
    persistState(recordQuizResult(state, lessonId, {
      ...score,
      results: score.results?.map((result) => ({ ...result })) ?? [],
      completedAt: new Date().toISOString(),
    }));
    live.textContent = message;
  };

  const requestReset = () => {
    viewState.resetConfirmOpen = true;
    restoreViewFocusAfterRender('progress-reset-confirm-title');
    render();
  };

  const cancelReset = () => {
    viewState.resetConfirmOpen = false;
    restoreViewFocusAfterRender('progress-reset-button');
    render();
  };

  const confirmReset = () => {
    store.reset();
    state = resetModuleProgress(state, llmFoundation.id, llmFoundation.lessons[0]?.id ?? 'llm-01');
    viewState.resetConfirmOpen = false;
    pendingAnnouncement = '学习进度已重置';
    restoreViewFocusAfterRender('progress-reset-button');
    render();
  };

  const renderGuidedView = (root, route, summary, live) => {
    const shared = {
      course: llmFoundation,
      progress: state,
    };

    if (route.view === 'dashboard') {
      renderDashboard(root, {
        ...shared,
        summary,
        onOpenLesson: openLesson,
        onNavigate: (view) => navigate(`#${route.moduleId}/${view}`),
      });
      return true;
    }
    if (route.view === 'curriculum') {
      renderCurriculumList(root, { ...shared, onOpenLesson: openLesson });
      return true;
    }
    if (route.view === 'lesson') {
      renderLessonDetail(root, {
        ...shared,
        lessonId: route.lessonId,
        onBack: () => navigate(`#${route.moduleId}/curriculum`),
        onCompleteLesson: completeLesson,
        onOpenInterviews: () => navigate(`#${route.moduleId}/interviews`),
        onQuizResult: (score, message) => saveQuizResult(route.lessonId, score, message, live),
      });
      return true;
    }
    if (route.view === 'map') {
      renderKnowledgeMap(root, { ...shared, onOpenLesson: openLesson });
      return true;
    }
    if (route.view === 'resources') {
      renderResourceLibrary(root, {
        resources: llmFoundation.resources,
        filters: viewState.resourceFilters,
        onFiltersChange: updateResourceFilters,
      });
      return true;
    }
    if (route.view === 'interviews') {
      renderInterviewPractice(root, {
        ...shared,
        filters: viewState.interviewFilters,
        revealedIds: viewState.revealedInterviewIds,
        onFiltersChange: updateInterviewFilters,
        onToggleReveal: toggleInterviewReveal,
        onSetStatus: updateInterviewStatus,
        onToggleReview: updateReviewQueue,
        onOpenLesson: openLesson,
      });
      return true;
    }
    if (route.view === 'progress') {
      renderProgressView(root, {
        ...shared,
        summary,
        storageMode: store.mode(),
        resetConfirmOpen: viewState.resetConfirmOpen,
        onRequestReset: requestReset,
        onCancelReset: cancelReset,
        onConfirmReset: confirmReset,
      });
      return true;
    }
    return false;
  };

  function render() {
    const passiveFocusId = !pendingViewFocusId && !focusAfterNavigation && !focusAfterCompletion
      ? documentRef.activeElement?.id
      : null;
    const route = normalizeRoute(windowRef.location.hash);
    if (windowRef.location.hash !== route.hash) windowRef.history.replaceState(null, '', route.hash);

    if (route.view === 'lesson' && lastRenderedHash !== route.hash) {
      persistState({
        ...state,
        currentModuleId: route.moduleId,
        currentLessonId: route.lessonId,
        lastVisitedAt: new Date().toISOString(),
      });
    }

    const summary = summarizeProgress(state, llmFoundation.lessons, llmFoundation.interviewQuestions);
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

    const root = documentRef.querySelector('#view-root');
    const live = documentRef.querySelector('#app-live-region');
    const main = documentRef.querySelector('#app-main');
    if (!root || !live || !main) throw new Error('主要内容挂载点不完整');
    if (!renderGuidedView(root, route, summary, live)) renderPlaceholder(root, route);
    const copy = viewPlaceholder(route);
    live.textContent = pendingAnnouncement || `已打开${copy.title}`;
    pendingAnnouncement = '';
    documentRef.title = `${copy.title} · Agent Learner`;
    lastRenderedHash = route.hash;
    if (pendingViewFocusId) {
      const primary = documentRef.querySelector(`#${pendingViewFocusId}`);
      const fallback = pendingViewFallbackId
        ? documentRef.querySelector(`#${pendingViewFallbackId}`)
        : null;
      const target = primary && !primary.disabled ? primary : fallback ?? main;
      target.focus({ preventScroll: true });
      pendingViewFocusId = null;
      pendingViewFallbackId = null;
    } else if (focusAfterNavigation || focusAfterCompletion) {
      main.focus({ preventScroll: true });
      focusAfterNavigation = false;
      focusAfterCompletion = false;
    } else if (passiveFocusId) {
      documentRef.querySelector(`#${passiveFocusId}`)?.focus({ preventScroll: true });
    }
  }

  windowRef.addEventListener('hashchange', render);
  render();

  return {
    getState: () => state,
    navigate,
    render,
    teardown: () => windowRef.removeEventListener('hashchange', render),
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') startApp();
