function completedIds(progress) {
  return new Set(progress.completedLessonIds ?? []);
}

function prerequisiteIdsFor(lessons, index) {
  const lesson = lessons[index];
  const explicitPrerequisites = lesson.prerequisites ?? lesson.prerequisiteIds;
  if (Array.isArray(explicitPrerequisites)) return [...explicitPrerequisites];
  return index === 0 ? [] : [lessons[index - 1].id];
}

function isEligible(lessons, index, completed) {
  return !completed.has(lessons[index].id)
    && prerequisiteIdsFor(lessons, index).every((id) => completed.has(id));
}

export function getNextLesson(lessons, progress) {
  if (lessons.length === 0) return null;

  const completed = completedIds(progress);
  if (lessons.every(({ id }) => completed.has(id))) return { ...lessons.at(-1) };

  const lesson = lessons.find((_, index) => isEligible(lessons, index, completed));
  if (!lesson) return null;
  return { ...lesson };
}

export function buildKnowledgeNodes(lessons, progress) {
  const completed = completedIds(progress);
  const currentIndex = lessons.findIndex((_, index) => isEligible(lessons, index, completed));

  return lessons.map((lesson, index) => {
    const prerequisiteIds = prerequisiteIdsFor(lessons, index);
    const eligible = prerequisiteIds.every((id) => completed.has(id));

    let status = 'locked';
    if (completed.has(lesson.id)) {
      status = 'complete';
    } else if (index === currentIndex) {
      status = 'current';
    } else if (eligible) {
      status = 'available';
    }

    return {
      id: lesson.id,
      order: lesson.order,
      title: lesson.title,
      status,
      prerequisiteIds,
    };
  });
}

export function getDueInterviewQuestions(questions, progress) {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const dueIds = [];
  const seen = new Set();
  const add = (id) => {
    if (!seen.has(id) && questionsById.has(id)) {
      seen.add(id);
      dueIds.push(id);
    }
  };

  for (const id of progress.reviewQueue ?? []) add(id);
  for (const question of questions) {
    if (progress.interviewStatusById?.[question.id] === 'reviewing') add(question.id);
  }

  return dueIds.map((id) => ({ ...questionsById.get(id) }));
}

export function getRecentActivity(progress) {
  const activity = [];
  if (progress.lastVisitedAt) {
    activity.push({ type: 'visit', timestamp: progress.lastVisitedAt });
  }
  for (const lessonId of progress.completedLessonIds ?? []) {
    activity.push({ type: 'lesson-completed', lessonId });
  }
  for (const [quizId, quizResult] of Object.entries(progress.quizResults ?? {})) {
    const result = quizResult && typeof quizResult === 'object'
      ? { ...quizResult }
      : quizResult;
    activity.push({ type: 'quiz-completed', quizId, result });
  }
  return activity;
}
