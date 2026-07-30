import { agent01Note } from './agent-mechanism-notes/agent-01.js';
import { agent02Note } from './agent-mechanism-notes/agent-02.js';
import { agent03Note } from './agent-mechanism-notes/agent-03.js';
import { agent04Note } from './agent-mechanism-notes/agent-04.js';
import { agent05Note } from './agent-mechanism-notes/agent-05.js';
import { agent06Note } from './agent-mechanism-notes/agent-06.js';
import { agent07Note } from './agent-mechanism-notes/agent-07.js';
import { agent08Note } from './agent-mechanism-notes/agent-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

const visualPlans = Object.freeze({
  'agent-01': {
    overviewVisualId: 'visual-agent-01-boundary-spectrum',
    overviewVisualSectionId: 'control-authority-spectrum',
    overviewSourceIds: ['res-agent-primary-javaguide-agent-basis', 'res-agent-primary-feishu-beyond-model'],
    sectionId: 'minimal-action-loop',
    visualId: 'visual-agent-01-action-feedback-loop',
    sourceIds: ['res-agent-primary-feishu-react-loop'],
    synthesisSectionId: 'control-authority-spectrum',
    synthesisParagraph: '把两组一级资料合起来看，Agent 的分水岭不是“是否调用模型”，而是谁决定下一步：决策位置沿 model → app → workflow → Agent 迁移。真正的 Agent 机制必须闭合 state → action → feedback，并把模型限制在宿主授予的有界权限与受限动作空间中；自主性越高，授权、预算和终止证据就越要显式。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-agent-basis',
      'res-agent-primary-feishu-beyond-model',
      'res-agent-primary-feishu-react-loop',
    ],
  },
  'agent-02': {
    overviewVisualId: 'visual-agent-02-task-contract',
    overviewVisualSectionId: 'request-to-task-contract',
    overviewSourceIds: ['res-agent-primary-javaguide-prompt', 'res-agent-primary-feishu-react-loop'],
    sectionId: 'state-transcript-event-log',
    visualId: 'visual-agent-02-state-event-log',
    sourceIds: ['res-agent-primary-javaguide-workflow-loop'],
    synthesisSectionId: 'request-to-task-contract',
    synthesisParagraph: '可执行任务契约要把 intent 逐层翻译成 objective、constraints、success criteria、task state 与 termination，而不是只润色一句提示词。自然语言计划适合表达弹性意图，状态机适合约束确定分支，耐久 event log 负责保存事实与恢复依据；三者分别回答“想做什么、允许怎样推进、发生过什么”。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-prompt',
      'res-agent-primary-javaguide-workflow-loop',
      'res-agent-primary-feishu-react-loop',
    ],
  },
  'agent-03': {
    overviewVisualId: 'visual-agent-03-tool-protocol',
    overviewVisualSectionId: 'tool-declaration-contract',
    overviewSourceIds: ['res-agent-primary-feishu-tool-truth'],
    sectionId: 'host-execution-boundary',
    visualId: 'visual-agent-03-skills-mcp-boundary',
    sourceIds: ['res-agent-primary-javaguide-skills', 'res-agent-primary-javaguide-mcp', 'res-agent-primary-feishu-tool-truth'],
    synthesisSectionId: 'host-execution-boundary',
    synthesisParagraph: '完整工具协议是一条 definition → schema → discovery → selection → authorization → execution → observation 责任链，模型只能提出候选调用，宿主必须校验、授权、执行并回传可验证观察。Skills ≠ MCP：Skill 封装可复用的过程知识，MCP 标准化能力与数据的互操作接口，Agent loop 决定何时使用，而宿主守住真实执行边界。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-skills',
      'res-agent-primary-javaguide-mcp',
      'res-agent-primary-feishu-tool-truth',
    ],
  },
  'agent-04': {
    overviewVisualId: 'visual-agent-04-react-cycle',
    overviewVisualSectionId: 'react-boundary-and-observable-logging',
    overviewSourceIds: ['res-agent-primary-feishu-react-loop', 'res-agent-react-paper'],
    sectionId: 'state-read-and-termination-priority',
    visualId: 'visual-agent-04-bounded-loop',
    sourceIds: ['res-agent-primary-javaguide-loop-engineering', 'res-agent-primary-feishu-autonomous-evolution'],
    synthesisSectionId: 'react-boundary-and-observable-logging',
    synthesisReplaceIndex: 2,
    synthesisParagraph: '工程化 ReAct 保留 reason → action → observation 的环境闭环，却不依赖 private CoT（隐藏思维链）。single、multi、parallel 与 bounded loop 都须按可观察状态作出 continue / stop 决策，并由宿主用预算、进展与终止谓词兜底。',
    synthesisSourceIds: [
      'res-agent-primary-feishu-react-loop',
      'res-agent-primary-feishu-autonomous-evolution',
      'res-agent-primary-javaguide-loop-engineering',
    ],
  },
  'agent-05': {
    overviewVisualId: 'visual-agent-05-planning-modes',
    overviewVisualSectionId: 'choose-planning-by-task-structure',
    overviewSourceIds: ['res-agent-primary-javaguide-workflow-loop', 'res-agent-primary-feishu-react-orchestration'],
    sectionId: 'plans-as-executable-dataflow',
    visualId: 'visual-agent-05-orchestration-graph',
    sourceIds: ['res-agent-primary-feishu-react-orchestration', 'res-agent-primary-feishu-dynamic-workflow'],
    synthesisSectionId: 'choose-planning-by-task-structure',
    synthesisParagraph: '规划强度应沿 direct → plan-then-act → replan → workflow graph → orchestration 逐级增加，而不是把所有任务都升级成多 Agent。选择依据是依赖关系、可并行性、是否需要委派以及环境不确定性；计划只有被表示成带前置条件、产物和验证门的可执行数据流，才真正改善控制。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-workflow-loop',
      'res-agent-primary-feishu-react-orchestration',
      'res-agent-primary-feishu-dynamic-workflow',
    ],
  },
  'agent-06': {
    overviewVisualId: 'visual-agent-06-correction-ladder',
    overviewVisualSectionId: 'external-validation-stack',
    overviewSourceIds: ['res-agent-primary-javaguide-loop-engineering', 'res-agent-critic', 'res-agent-no-self-correct'],
    sectionId: 'retry-budget-and-unknown-outcome',
    visualId: 'visual-agent-06-durable-recovery',
    sourceIds: ['res-agent-primary-feishu-agent-version', 'res-agent-primary-feishu-dynamic-workflow'],
    synthesisSectionId: 'external-validation-stack',
    synthesisParagraph: '纠错阶梯按 retry → replan → reflection → external validation → reconciliation → human escalation 升级。reflection ≠ proof，模型自评不能替代测试、规则、外部证据与人工复核；跨进程的耐久恢复、幂等、版本钉扎和回放属于 Harness 的职责。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-loop-engineering',
      'res-agent-primary-feishu-agent-version',
      'res-agent-primary-feishu-dynamic-workflow',
    ],
  },
  'agent-07': {
    overviewVisualId: 'visual-agent-07-context-layers',
    overviewVisualSectionId: 'information-carriers-and-lifecycles',
    overviewSourceIds: ['res-agent-primary-javaguide-context', 'res-agent-primary-javaguide-memory'],
    sectionId: 'epistemic-records-and-provenance',
    visualId: 'visual-agent-07-provenance-budget',
    sourceIds: ['res-agent-primary-feishu-prompt-memory', 'res-agent-primary-javaguide-context'],
    synthesisSectionId: 'information-carriers-and-lifecycles',
    synthesisReplaceIndex: 2,
    synthesisParagraph: '运行时信息按生命周期拆为 transcript、scratchpad、plan state、retrieved evidence 与 long-term memory。CoALA 与 Weng 综述提供记忆和窗口问题的交叉依据，但不规定生产字段；压缩和 offload 仍须保留 provenance、时间、置信度与回指，避免摘要把假设伪装成事实。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-context',
      'res-agent-primary-javaguide-memory',
      'res-agent-primary-feishu-prompt-memory',
    ],
  },
  'agent-08': {
    overviewVisualId: 'visual-agent-08-end-to-end',
    overviewVisualSectionId: 'capstone-architecture-and-trust-boundaries',
    overviewSourceIds: ['res-agent-primary-javaguide-agent-basis', 'res-agent-primary-feishu-beyond-model'],
    sectionId: 'three-auditable-terminal-traces',
    visualId: 'visual-agent-08-pressure-matrix',
    sourceIds: ['res-agent-primary-feishu-agent-version', 'res-agent-primary-feishu-react-orchestration', 'res-agent-agentbench'],
    synthesisSectionId: 'capstone-architecture-and-trust-boundaries',
    synthesisParagraph: '毕业项目应先做一个 single-Agent 端到端闭环，再用压力矩阵验证机制，而不是用角色数量掩盖缺陷。至少注入 tool failure、ambiguous success、stale context、unauthorized action、无限 loop、版本 drift 与 evaluation 失真，并要求每条终态都有任务契约、事件证据和可回放决策。',
    synthesisSourceIds: [
      'res-agent-primary-javaguide-agent-basis',
      'res-agent-primary-javaguide-harness',
      'res-agent-primary-feishu-react-orchestration',
      'res-agent-primary-feishu-agent-version',
    ],
  },
});

function unique(values) {
  return [...new Set(values)];
}

function withVisuals(note, plan, lessonId) {
  const sectionIds = new Set(note.sections.map(({ id }) => id));
  const configuredSectionIds = [
    plan.overviewVisualSectionId,
    plan.sectionId,
    plan.synthesisSectionId,
  ];
  for (const sectionId of configuredSectionIds) {
    if (!sectionIds.has(sectionId)) {
      throw new Error(`Unknown Agent note section "${sectionId}" in ${lessonId}`);
    }
  }
  return {
    ...note,
    overviewVisualId: plan.overviewVisualId,
    overviewVisualSectionId: plan.overviewVisualSectionId,
    sections: note.sections.map((section) => {
      const isOverviewOwner = section.id === plan.overviewVisualSectionId;
      const isDetailOwner = section.id === plan.sectionId;
      const isSynthesisOwner = section.id === plan.synthesisSectionId;
      if (!isOverviewOwner && !isDetailOwner && !isSynthesisOwner) return section;
      const paragraphs = [...section.paragraphs];
      if (isSynthesisOwner) {
        if (Number.isInteger(plan.synthesisReplaceIndex)) {
          if (!paragraphs[plan.synthesisReplaceIndex]) {
            throw new Error(
              `Unknown paragraph ${plan.synthesisReplaceIndex} in ${lessonId}:${section.id}`,
            );
          }
          paragraphs[plan.synthesisReplaceIndex] = plan.synthesisParagraph;
        } else {
          paragraphs.push(plan.synthesisParagraph);
        }
      }
      return {
        ...section,
        paragraphs,
        sourceIds: unique([
          ...section.sourceIds,
          ...(isOverviewOwner ? plan.overviewSourceIds : []),
          ...(isDetailOwner ? plan.sourceIds : []),
          ...(isSynthesisOwner ? plan.synthesisSourceIds : []),
        ]),
        ...(isDetailOwner
          ? { visuals: [{ visualId: plan.visualId, afterParagraph: 1 }] }
          : {}),
      };
    }),
  };
}

export const agentMechanismNotes = deepFreeze({
  'agent-01': withVisuals(agent01Note, visualPlans['agent-01'], 'agent-01'),
  'agent-02': withVisuals(agent02Note, visualPlans['agent-02'], 'agent-02'),
  'agent-03': withVisuals(agent03Note, visualPlans['agent-03'], 'agent-03'),
  'agent-04': withVisuals(agent04Note, visualPlans['agent-04'], 'agent-04'),
  'agent-05': withVisuals(agent05Note, visualPlans['agent-05'], 'agent-05'),
  'agent-06': withVisuals(agent06Note, visualPlans['agent-06'], 'agent-06'),
  'agent-07': withVisuals(agent07Note, visualPlans['agent-07'], 'agent-07'),
  'agent-08': withVisuals(agent08Note, visualPlans['agent-08'], 'agent-08'),
});
