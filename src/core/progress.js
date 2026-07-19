export const PROGRESS_VERSION = 1;

export function createDefaultProgress(moduleId, firstLessonId = 'llm-01') {
  return {
    version: PROGRESS_VERSION,
    currentModuleId: moduleId,
    currentLessonId: firstLessonId,
    completedLessonIds: [],
    quizResults: {},
    interviewStatusById: {},
    reviewQueue: [],
    lastVisitedAt: null,
  };
}

export function markLessonComplete(state, lessonId) {
  const completedLessonIds = Array.isArray(state.completedLessonIds) ? state.completedLessonIds : [];
  return completedLessonIds.includes(lessonId)
    ? state
    : { ...state, completedLessonIds: [...completedLessonIds, lessonId] };
}

export function setInterviewStatus(state, questionId, status) {
  const interviewStatusById = state.interviewStatusById && typeof state.interviewStatusById === 'object'
    ? state.interviewStatusById
    : {};
  return {
    ...state,
    interviewStatusById: { ...interviewStatusById, [questionId]: status },
  };
}

export function toggleReviewQueue(state, questionId) {
  const reviewQueue = Array.isArray(state.reviewQueue) ? state.reviewQueue : [];
  const uniqueQueue = [...new Set(reviewQueue)];
  return {
    ...state,
    reviewQueue: uniqueQueue.includes(questionId)
      ? uniqueQueue.filter((id) => id !== questionId)
      : [...uniqueQueue, questionId],
  };
}

export function recordQuizResult(state, lessonId, result = {}) {
  const quizResults = state.quizResults && typeof state.quizResults === 'object'
    ? state.quizResults
    : {};
  const storedResult = {
    correct: result.correct ?? 0,
    total: result.total ?? 0,
    percent: result.percent ?? 0,
    results: JSON.parse(JSON.stringify(Array.isArray(result.results) ? result.results : [])),
  };
  if (result.completedAt !== undefined) storedResult.completedAt = result.completedAt;

  return {
    ...state,
    quizResults: { ...quizResults, [lessonId]: storedResult },
  };
}

export function resetModuleProgress(_state, moduleId, firstLessonId = 'llm-01') {
  return createDefaultProgress(moduleId, firstLessonId);
}

function progressScope(scope) {
  if (typeof scope === 'number') {
    return {
      total: Number.isFinite(scope) ? Math.max(0, Math.floor(scope)) : 0,
      validIds: null,
    };
  }
  const entries = Array.isArray(scope) ? scope : scope instanceof Set ? [...scope] : [];
  const validIds = new Set(entries
    .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
    .filter((id) => typeof id === 'string'));
  return { total: validIds.size, validIds };
}

export function summarizeProgress(state, lessonScope, interviewScope) {
  const interviewStatusById = state.interviewStatusById && typeof state.interviewStatusById === 'object'
    ? state.interviewStatusById
    : {};
  const completedLessonIds = Array.isArray(state.completedLessonIds) ? state.completedLessonIds : [];
  const lessons = progressScope(lessonScope);
  const interviews = progressScope(interviewScope);
  const uniqueCompletedIds = new Set(completedLessonIds);
  const completedInScope = lessons.validIds
    ? [...uniqueCompletedIds].filter((id) => lessons.validIds.has(id)).length
    : uniqueCompletedIds.size;
  const masteredIds = Object.entries(interviewStatusById)
    .filter(([, status]) => status === 'mastered')
    .map(([id]) => id);
  const masteredInScope = interviews.validIds
    ? masteredIds.filter((id) => interviews.validIds.has(id)).length
    : masteredIds.length;
  const lessonsCompleted = Math.min(completedInScope, lessons.total);
  const interviewsMastered = Math.min(masteredInScope, interviews.total);

  return {
    lessonsCompleted,
    lessonPercent: lessons.total === 0 ? 0 : Math.round((lessonsCompleted / lessons.total) * 100),
    interviewsMastered,
    interviewPercent: interviews.total === 0 ? 0 : Math.round((interviewsMastered / interviews.total) * 100),
  };
}
