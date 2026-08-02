const lessonTags = Object.freeze({
  'backend-01': ['api-boundary', 'contract-version'],
  'backend-02': ['stream-lifecycle', 'cancellation'],
  'backend-03': ['capacity-envelope', 'overload-control'],
  'backend-04': ['job-state', 'durable-replay'],
  'backend-05': ['data-ownership', 'cache-safety'],
  'backend-06': ['delivery-semantics', 'exactly-once-boundary'],
  'backend-07': ['lifecycle', 'observability'],
  'backend-08': ['deployment', 'failure-diagnosis'],
});

const assessmentTagsByLesson = Object.fromEntries(Object.entries(lessonTags).map(
  ([lessonId, tags]) => [lessonId, [tags[0], tags[1], tags[0], tags[1], tags[1]]],
));
assessmentTagsByLesson['backend-08'] = [
  'failure-diagnosis', 'deployment', 'failure-diagnosis', 'deployment', 'failure-diagnosis',
];
assessmentTagsByLesson['backend-02'][4] = 'stream-lifecycle';
assessmentTagsByLesson['backend-07'][3] = 'lifecycle';

export const backendAssessmentConceptTags = Object.freeze(Object.fromEntries(
  Object.entries(assessmentTagsByLesson).flatMap(([lessonId, tags]) => [
    [`quiz-${lessonId}-1`, Object.freeze([tags[0]])],
    [`quiz-${lessonId}-2`, Object.freeze([tags[1]])],
    [`iq-${lessonId}-1`, Object.freeze([tags[2]])],
    [`iq-${lessonId}-2`, Object.freeze([tags[3]])],
    [`iq-${lessonId}-3`, Object.freeze([tags[4]])],
  ]),
));

export const backendVisualOutcomes = Object.freeze(Object.fromEntries(
  Object.entries(lessonTags).flatMap(([lessonId, tags]) => [
    [`visual-${lessonId}-overview`, Object.freeze([tags[0]])],
    [`visual-${lessonId}-detail`, Object.freeze([tags[1]])],
  ]),
));

export const backendAssessmentVisualCoverage = Object.freeze(Object.fromEntries(
  Object.entries(backendAssessmentConceptTags).map(([assessmentId, [tag]]) => {
    const lessonId = assessmentId.match(/backend-\d{2}/)[0];
    const kind = lessonTags[lessonId][0] === tag ? 'overview' : 'detail';
    return [assessmentId, Object.freeze([`visual-${lessonId}-${kind}`])];
  }),
));
