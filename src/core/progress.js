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
  return state.completedLessonIds.includes(lessonId)
    ? state
    : { ...state, completedLessonIds: [...state.completedLessonIds, lessonId] };
}

export function setInterviewStatus(state, questionId, status) {
  return {
    ...state,
    interviewStatusById: { ...state.interviewStatusById, [questionId]: status },
  };
}

export function summarizeProgress(state, lessonTotal, interviewTotal) {
  const interviewsMastered = Object.values(state.interviewStatusById)
    .filter((status) => status === 'mastered').length;
  const lessonsCompleted = state.completedLessonIds.length;

  return {
    lessonsCompleted,
    lessonPercent: lessonTotal === 0 ? 0 : Math.round((lessonsCompleted / lessonTotal) * 100),
    interviewsMastered,
    interviewPercent: interviewTotal === 0 ? 0 : Math.round((interviewsMastered / interviewTotal) * 100),
  };
}
