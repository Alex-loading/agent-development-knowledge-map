import { deepFreeze } from './multi-agent-shared.js';
import { multiAgentResources } from './multi-agent-resources.js';
import { multiAgentNotes } from './multi-agent-notes.js';
import { ma01Lesson, ma01Interviews, ma01Coverage } from './multi-agent-lessons/ma-01.js';
import { ma02Lesson, ma02Interviews, ma02Coverage } from './multi-agent-lessons/ma-02.js';
import { ma03Lesson, ma03Interviews, ma03Coverage } from './multi-agent-lessons/ma-03.js';
import { ma04Lesson, ma04Interviews, ma04Coverage } from './multi-agent-lessons/ma-04.js';
import { ma05Lesson, ma05Interviews, ma05Coverage } from './multi-agent-lessons/ma-05.js';
import { ma06Lesson, ma06Interviews, ma06Coverage } from './multi-agent-lessons/ma-06.js';
import { ma07Lesson, ma07Interviews, ma07Coverage } from './multi-agent-lessons/ma-07.js';
import { ma08Lesson, ma08Interviews, ma08Coverage } from './multi-agent-lessons/ma-08.js';

const lessonSpecs = [ma01Lesson, ma02Lesson, ma03Lesson, ma04Lesson, ma05Lesson, ma06Lesson, ma07Lesson, ma08Lesson];
const lessons = lessonSpecs.map((lesson) => ({
  ...lesson,
  knowledgeNote: multiAgentNotes[lesson.id],
  resourceIds: [...new Set(multiAgentNotes[lesson.id].sections.flatMap(({ sourceIds }) => sourceIds))],
}));
const resources = multiAgentResources.map((resource) => ({
  ...resource,
  lessonIds: lessons.filter((lesson) => lesson.resourceIds.includes(resource.id)).map(({ id }) => id),
}));

export const multiAgentMcp = deepFreeze({
  id: 'multi-agent-mcp', title: '多 Agent 与 MCP',
  summary: '从任务依赖与控制责任出发，设计多 Agent 协作、接入 MCP，并用版本、权限、成本和任务结果验证系统。',
  lessons, resources,
  interviewQuestions: [...ma01Interviews, ...ma02Interviews, ...ma03Interviews, ...ma04Interviews, ...ma05Interviews, ...ma06Interviews, ...ma07Interviews, ...ma08Interviews],
  interviewSupplements: [],
  coverageMatrix: {
    'ma-01': ma01Coverage, 'ma-02': ma02Coverage, 'ma-03': ma03Coverage, 'ma-04': ma04Coverage,
    'ma-05': ma05Coverage, 'ma-06': ma06Coverage, 'ma-07': ma07Coverage, 'ma-08': ma08Coverage,
  },
});
