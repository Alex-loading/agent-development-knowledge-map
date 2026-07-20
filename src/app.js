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
import { getCourse } from './data/courses.js';
import { modules } from './data/modules.js';
import { renderCurriculumList, renderLessonDetail } from './ui/curriculum.js';
import { renderDashboard } from './ui/dashboard.js';
import { element } from './ui/dom.js';
import { renderInterviewPractice } from './ui/interviews.js';
import { renderKnowledgeMap } from './ui/knowledge-map.js';
import { renderProgressView } from './ui/progress-view.js';
import { renderResourceLibrary } from './ui/resources.js';
import { renderShell } from './ui/shell.js';

const DEFAULT_MODULE_ID = 'llm-foundation';
const DEFAULT_HASH = `#${DEFAULT_MODULE_ID}/dashboard`;
const VIEWS = new Set(['dashboard', 'curriculum', 'map', 'resources', 'interviews', 'progress']);
const VIEW_COPY = {
  dashboard: ['模块首页', '从一条推荐路径开始，也可以随时打开课程、知识地图或面试档案。'],
  curriculum: ['学习主线', '课程主线将把模型原理、应用实践与验证任务串成一条可执行路线。'],
  map: ['知识地图', '在全局关系中定位概念、前置知识与下一步，避免只记孤立名词。'],
  resources: ['资源库', '按阶段与难度检索经过筛选的 GitHub、官方课程、博客和视频资料。'],
  interviews: ['面试高频', '从三十秒回答进入深挖、误区与追问，并分别记录掌握状态。'],
  progress: ['学习进度', '课程完成度和面试掌握度分开记录，让复习队列保持诚实。'],
};

export function createModuleViewState() {
  return {
    resourceFiltersByModule: Object.create(null),
    interviewFiltersByModule: Object.create(null),
    revealedInterviewIdsByModule: Object.create(null),
    resetConfirmOpen: false,
  };
}

export function resolveRoute(hash, {
  moduleCatalog = modules,
  courseResolver = getCourse,
  defaultModuleId = DEFAULT_MODULE_ID,
} = {}) {
  const fallbackModule = moduleCatalog.find((item) => (
    item.id === defaultModuleId && item.status === 'active' && courseResolver(item.id)
  )) ?? moduleCatalog.find((item) => item.status === 'active' && courseResolver(item.id));
  if (!fallbackModule) throw new Error('没有已注册且可学习的课程模块');

  const fallback = {
    hash: `#${fallbackModule.id}/dashboard`,
    moduleId: fallbackModule.id,
    view: 'dashboard',
  };
  const parts = String(hash ?? '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const module = moduleCatalog.find((item) => item.id === parts[0] && item.status === 'active');
  const course = module ? courseResolver(module.id) : null;
  if (!module || !course) return fallback;

  if (parts[1] === 'lesson' && parts.length === 3) {
    const lesson = (course.lessons ?? []).find((item) => item.id === parts[2]);
    if (lesson) return { hash: `#${module.id}/lesson/${lesson.id}`, moduleId: module.id, view: 'lesson', lessonId: lesson.id };
  }

  if (parts.length === 2 && VIEWS.has(parts[1])) {
    return { hash: `#${module.id}/${parts[1]}`, moduleId: module.id, view: parts[1] };
  }

  return fallback;
}

export function normalizeRoute(hash) {
  return resolveRoute(hash);
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

function viewPlaceholder(route, course) {
  if (route.view === 'lesson') {
    const lesson = course.lessons.find((item) => item.id === route.lessonId);
    return {
      index: `课程 ${String(lesson.order).padStart(2, '0')} / ${String(course.lessons.length).padStart(2, '0')}`,
      title: lesson.title,
      summary: lesson.summary,
    };
  }
  const [title, summary] = VIEW_COPY[route.view];
  return { index: `${course.title} / 研究手册`, title, summary };
}

function renderPlaceholder(root, route, course) {
  const copy = viewPlaceholder(route, course);
  root.replaceChildren(
    element('section', { className: 'view-placeholder', attrs: { 'aria-labelledby': 'view-title' } }, [
      element('span', { className: 'section-index', text: copy.index }),
      element('h1', { text: copy.title, attrs: { id: 'view-title' } }),
      element('p', { text: copy.summary }),
      element('div', { className: 'placeholder-ledger', attrs: { 'aria-label': '本模块结构' } }, [
        element('div', {}, [element('strong', { text: `${course.lessons.length} 节课程` }), element('span', { text: '原理、实践、测验与完成标准' })]),
        element('div', {}, [element('strong', { text: `${course.interviewQuestions.length} 道面试题` }), element('span', { text: '短答、深挖、误区与追问' })]),
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
  const viewState = createModuleViewState();

  const getModuleFilters = (filtersByModule, moduleId) => {
    if (!Object.hasOwn(filtersByModule, moduleId)) filtersByModule[moduleId] = {};
    return filtersByModule[moduleId];
  };

  const getRevealedInterviewIds = (moduleId) => {
    if (!Object.hasOwn(viewState.revealedInterviewIdsByModule, moduleId)) {
      viewState.revealedInterviewIdsByModule[moduleId] = new Set();
    }
    return viewState.revealedInterviewIdsByModule[moduleId];
  };

  const syncStorageNotice = () => {
    const storageNotice = documentRef.querySelector('#storage-notice');
    if (storageNotice) storageNotice.hidden = store.mode() !== 'memory';
  };

  const persistState = (nextState) => {
    state = nextState;
    store.save(state);
    syncStorageNotice();
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

  const skipLink = documentRef.querySelector('#skip-to-main');
  const brandHome = documentRef.querySelector('#brand-home');
  const main = documentRef.querySelector('#app-main');
  if (!skipLink || !brandHome || !main) throw new Error('全局导航挂载点不完整');

  const handleSkipToMain = (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
  };
  const handleBrandHome = (event) => {
    event.preventDefault();
    navigate(DEFAULT_HASH);
  };

  skipLink.addEventListener('click', handleSkipToMain);
  brandHome.addEventListener('click', handleBrandHome);

  const openLesson = (moduleId, lessonId) => navigate(`#${moduleId}/lesson/${lessonId}`);

  const completeLesson = (course, lessonId) => {
    const lesson = course.lessons.find((item) => item.id === lessonId);
    if (!lesson || state.completedLessonIds.includes(lessonId)) return;
    const completedState = markLessonComplete(state, lessonId);
    const allComplete = course.lessons.every(({ id }) => (
      completedState.completedLessonIds.includes(id)
    ));
    const nextLesson = getNextLesson(course.lessons, completedState);
    persistState({
      ...completedState,
      currentModuleId: course.id,
      currentLessonId: nextLesson?.id ?? lessonId,
      lastVisitedAt: new Date().toISOString(),
    });
    pendingAnnouncement = `已完成${lesson.title}。${allComplete ? `${course.title}主线已全部完成。` : `下一节建议：${nextLesson?.title ?? '请回到学习主线选择课程'}`}`;
    focusAfterCompletion = true;
    render();
  };

  const updateResourceFilters = (moduleId, filters, focusId) => {
    viewState.resourceFiltersByModule[moduleId] = { ...filters };
    restoreViewFocusAfterRender(focusId, 'resource-results-summary');
    render();
  };

  const updateInterviewFilters = (moduleId, filters, focusId) => {
    viewState.interviewFiltersByModule[moduleId] = { ...filters };
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const toggleInterviewReveal = (moduleId, questionId, focusId) => {
    const revealedIds = new Set(getRevealedInterviewIds(moduleId));
    if (revealedIds.has(questionId)) {
      revealedIds.delete(questionId);
    } else {
      revealedIds.add(questionId);
    }
    viewState.revealedInterviewIdsByModule[moduleId] = revealedIds;
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const updateInterviewStatus = (moduleId, questionId, status, focusId) => {
    const course = getCourse(moduleId);
    if (!course?.interviewQuestions.some(({ id }) => id === questionId)) return;
    const currentStatus = state.interviewStatusById?.[questionId] ?? 'unseen';
    if (currentStatus === status) return;
    persistState(setInterviewStatus(state, questionId, status));
    const question = course.interviewQuestions.find(({ id }) => id === questionId);
    const labels = { unseen: '未掌握', reviewing: '复习中', mastered: '已掌握' };
    pendingAnnouncement = `${question?.question ?? '面试题'}已标记为${labels[status] ?? status}`;
    restoreViewFocusAfterRender(focusId, 'interview-results-summary');
    render();
  };

  const updateReviewQueue = (moduleId, questionId, focusId) => {
    const course = getCourse(moduleId);
    if (!course?.interviewQuestions.some(({ id }) => id === questionId)) return;
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

  const confirmReset = (course) => {
    store.reset();
    state = resetModuleProgress(state, course.id, course.lessons[0]?.id ?? '');
    viewState.resetConfirmOpen = false;
    pendingAnnouncement = '学习进度已重置';
    restoreViewFocusAfterRender('progress-reset-button');
    render();
  };

  const renderGuidedView = (root, route, course, summary, live) => {
    const shared = {
      course,
      progress: state,
    };
    const openCourseLesson = (lessonId) => openLesson(route.moduleId, lessonId);

    if (route.view === 'dashboard') {
      renderDashboard(root, {
        ...shared,
        summary,
        onOpenLesson: openCourseLesson,
        onNavigate: (view) => navigate(`#${route.moduleId}/${view}`),
      });
      return true;
    }
    if (route.view === 'curriculum') {
      renderCurriculumList(root, { ...shared, onOpenLesson: openCourseLesson });
      return true;
    }
    if (route.view === 'lesson') {
      renderLessonDetail(root, {
        ...shared,
        lessonId: route.lessonId,
        onBack: () => navigate(`#${route.moduleId}/curriculum`),
        onCompleteLesson: (lessonId) => completeLesson(course, lessonId),
        onOpenInterviews: () => navigate(`#${route.moduleId}/interviews`),
        onQuizResult: (score, message) => saveQuizResult(route.lessonId, score, message, live),
      });
      return true;
    }
    if (route.view === 'map') {
      renderKnowledgeMap(root, { ...shared, onOpenLesson: openCourseLesson });
      return true;
    }
    if (route.view === 'resources') {
      renderResourceLibrary(root, {
        courseTitle: course.title,
        resources: course.resources,
        filters: getModuleFilters(viewState.resourceFiltersByModule, route.moduleId),
        onFiltersChange: (filters, focusId) => updateResourceFilters(route.moduleId, filters, focusId),
      });
      return true;
    }
    if (route.view === 'interviews') {
      renderInterviewPractice(root, {
        ...shared,
        filters: getModuleFilters(viewState.interviewFiltersByModule, route.moduleId),
        revealedIds: getRevealedInterviewIds(route.moduleId),
        onFiltersChange: (filters, focusId) => updateInterviewFilters(route.moduleId, filters, focusId),
        onToggleReveal: (questionId, focusId) => toggleInterviewReveal(route.moduleId, questionId, focusId),
        onSetStatus: (questionId, status, focusId) => updateInterviewStatus(route.moduleId, questionId, status, focusId),
        onToggleReview: (questionId, focusId) => updateReviewQueue(route.moduleId, questionId, focusId),
        onOpenLesson: openCourseLesson,
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
        onConfirmReset: () => confirmReset(course),
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
    const course = getCourse(route.moduleId);
    if (!course) throw new Error(`课程模块未注册：${route.moduleId}`);
    if (windowRef.location.hash !== route.hash) windowRef.history.replaceState(null, '', route.hash);

    if (route.view === 'lesson' && lastRenderedHash !== route.hash) {
      persistState({
        ...state,
        currentModuleId: route.moduleId,
        currentLessonId: route.lessonId,
        lastVisitedAt: new Date().toISOString(),
      });
    }

    const summary = summarizeProgress(state, course.lessons, course.interviewQuestions);
    renderShell({
      modules,
      activeModuleId: route.moduleId,
      activeView: route.view === 'lesson' ? 'curriculum' : route.view,
      progressSummary: {
        ...summary,
        lessonTotal: course.lessons.length,
        interviewTotal: course.interviewQuestions.length,
      },
      storageMode: store.mode(),
      onModuleSelect: (moduleId) => navigate(`#${moduleId}/dashboard`),
      onViewSelect: (view) => navigate(`#${route.moduleId}/${view}`),
    });

    const root = documentRef.querySelector('#view-root');
    const live = documentRef.querySelector('#app-live-region');
    if (!root || !live) throw new Error('主要内容挂载点不完整');
    if (!renderGuidedView(root, route, course, summary, live)) renderPlaceholder(root, route, course);
    const copy = viewPlaceholder(route, course);
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
    teardown: () => {
      windowRef.removeEventListener('hashchange', render);
      skipLink.removeEventListener('click', handleSkipToMain);
      brandHome.removeEventListener('click', handleBrandHome);
    },
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') startApp();
