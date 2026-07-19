function completedIds(progress) {
  return new Set(progress.completedLessonIds ?? []);
}

export function getNextLesson(lessons, progress) {
  if (lessons.length === 0) return null;

  const completed = completedIds(progress);
  const lesson = lessons.find(({ id }) => !completed.has(id)) ?? lessons.at(-1);
  return { ...lesson };
}

export function buildKnowledgeNodes(lessons, progress) {
  const completed = completedIds(progress);
  const currentIndex = lessons.findIndex(({ id }) => !completed.has(id));

  return lessons.map((lesson, index) => {
    const explicitPrerequisites = lesson.prerequisites ?? lesson.prerequisiteIds;
    const prerequisiteIds = Array.isArray(explicitPrerequisites)
      ? [...explicitPrerequisites]
      : index === 0 ? [] : [lessons[index - 1].id];

    let status = 'locked';
    if (completed.has(lesson.id)) {
      status = 'complete';
    } else if (index === currentIndex) {
      status = 'current';
    } else if (prerequisiteIds.every((id) => completed.has(id))) {
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
