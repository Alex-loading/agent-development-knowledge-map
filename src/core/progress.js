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

export function summarizeProgress(state, lessonTotal, interviewTotal) {
  const interviewStatusById = state.interviewStatusById && typeof state.interviewStatusById === 'object'
    ? state.interviewStatusById
    : {};
  const completedLessonIds = Array.isArray(state.completedLessonIds) ? state.completedLessonIds : [];
  const interviewsMastered = Object.values(interviewStatusById)
    .filter((status) => status === 'mastered').length;
  const lessonsCompleted = completedLessonIds.length;

  return {
    lessonsCompleted,
    lessonPercent: lessonTotal === 0 ? 0 : Math.round((lessonsCompleted / lessonTotal) * 100),
    interviewsMastered,
    interviewPercent: interviewTotal === 0 ? 0 : Math.round((interviewsMastered / interviewTotal) * 100),
  };
}
