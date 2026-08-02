const lessonEvidence = {
  'backend-01': {
    'api-boundary': [/API|接口|端点|资源|OpenAPI/i],
    'contract-version': [/schema|契约|兼容|幂等|版本/i],
  },
  'backend-02': {
    'stream-lifecycle': [/SSE|流|事件|TTFT|同步|异步/i],
    cancellation: [/断线|取消|cancel|终态/i],
  },
  'backend-03': {
    'capacity-envelope': [/容量|并发|队列|Little|deadline|预算/i],
    'overload-control': [/过载|准入|拒绝|429|重试/i],
  },
  'backend-04': {
    'job-state': [/job|任务|202|queued|running|worker/i],
    'durable-replay': [/恢复|崩溃|重投|lease|队列|ack/i],
  },
  'backend-05': {
    'data-ownership': [/PostgreSQL|Redis|事务|权威|数据库/i],
    'cache-safety': [/缓存|cache|TTL|租户|相似/i],
  },
  'backend-06': {
    'delivery-semantics': [/投递|重复|幂等|outbox|至少一次/i],
    'exactly-once-boundary': [/unknown|未知|副作用|对账|exactly.once/i],
  },
  'backend-07': {
    lifecycle: [/startup|readiness|liveness|drain|关闭/i],
    observability: [/日志|trace|指标|观测|requestId/i],
  },
  'backend-08': {
    deployment: [/部署|容器|扩容|滚动|vLLM|Ray/i],
    'failure-diagnosis': [/诊断|尾延迟|负载|故障|瓶颈/i],
  },
};

const quizTags = {
  1: 0,
  2: 1,
};

const interviewTags = {
  1: 0,
  2: 1,
  3: 1,
};

const backend08Tags = {
  'quiz-backend-08-1': 'failure-diagnosis',
  'quiz-backend-08-2': 'deployment',
  'iq-backend-08-1': 'failure-diagnosis',
  'iq-backend-08-2': 'deployment',
  'iq-backend-08-3': 'failure-diagnosis',
};
const assessmentTagOverrides = {
  'iq-backend-02-3': 'stream-lifecycle',
  'iq-backend-07-2': 'lifecycle',
  ...backend08Tags,
};

const generatedEvidence = Object.fromEntries(
  Object.entries(lessonEvidence).flatMap(([lessonId, contracts]) => {
    const tags = Object.keys(contracts);
    return [
      ...Object.entries(quizTags).map(([number, tagIndex]) => [
        `quiz-${lessonId}-${number}`,
        Object.freeze({ [tags[tagIndex]]: contracts[tags[tagIndex]] }),
      ]),
      ...Object.entries(interviewTags).map(([number, tagIndex]) => [
        `iq-${lessonId}-${number}`,
        Object.freeze({ [tags[tagIndex]]: contracts[tags[tagIndex]] }),
      ]),
    ];
  }),
);
for (const [assessmentId, tag] of Object.entries(assessmentTagOverrides)) {
  const lessonId = assessmentId.match(/backend-\d{2}/)[0];
  generatedEvidence[assessmentId] = Object.freeze({
    [tag]: lessonEvidence[lessonId][tag],
  });
}

export const backendAssessmentTextEvidence = Object.freeze(generatedEvidence);
