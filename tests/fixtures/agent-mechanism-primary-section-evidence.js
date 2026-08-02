export const agentPrimarySectionEvidence = Object.freeze({
  'agent-01': Object.freeze({
    'res-agent-primary-javaguide-agent-basis': /决策位置.*model.*app.*workflow.*Agent/is,
    'res-agent-primary-feishu-beyond-model': /宿主.*有界权限.*动作空间/s,
    'res-agent-primary-feishu-react-loop': /state.*action.*feedback/is,
  }),
  'agent-02': Object.freeze({
    'res-agent-primary-javaguide-prompt': /intent.*objective.*constraints.*success criteria/is,
    'res-agent-primary-feishu-react-loop': /task state.*termination/is,
    'res-agent-primary-feishu-loop-engineering': /自然语言计划.*状态机.*event log/is,
  }),
  'agent-03': Object.freeze({
    'res-agent-primary-javaguide-skills': /Skills.*过程知识/is,
    'res-agent-primary-javaguide-mcp': /MCP.*互操作接口/is,
    'res-agent-primary-feishu-tool-truth': /authorization.*execution.*observation/is,
  }),
  'agent-04': Object.freeze({
    'res-agent-primary-javaguide-loop-engineering': /bounded loop.*continue.*stop/is,
    'res-agent-primary-feishu-react-loop': /reason.*action.*observation/is,
    'res-agent-primary-feishu-autonomous-evolution': /single.*multi.*parallel/is,
  }),
  'agent-05': Object.freeze({
    'res-agent-primary-javaguide-workflow-loop': /direct.*plan-then-act.*replan.*workflow graph/is,
    'res-agent-primary-feishu-react-orchestration': /依赖关系.*并行.*委派/s,
    'res-agent-primary-feishu-dynamic-workflow': /环境不确定性.*可执行数据流/s,
  }),
  'agent-06': Object.freeze({
    'res-agent-primary-javaguide-loop-engineering': /retry.*replan.*reflection.*external validation/is,
    'res-agent-primary-feishu-agent-version': /版本钉扎.*回放/s,
    'res-agent-primary-feishu-dynamic-workflow': /reconciliation.*human escalation/is,
  }),
  'agent-07': Object.freeze({
    'res-agent-primary-javaguide-context': /transcript.*scratchpad.*plan state.*retrieved evidence/is,
    'res-agent-primary-javaguide-memory': /long-term memory/is,
    'res-agent-primary-feishu-prompt-memory': /压缩.*offload.*provenance/is,
  }),
  'agent-08': Object.freeze({
    'res-agent-primary-javaguide-agent-basis': /single-Agent.*端到端闭环/is,
    'res-agent-primary-javaguide-harness': /Harness.*运行边界/is,
    'res-agent-primary-feishu-react-orchestration': /压力矩阵.*可回放决策/s,
    'res-agent-primary-feishu-beyond-model': /任务契约.*事件证据/s,
    'res-agent-primary-feishu-agent-version': /版本 drift.*evaluation/is,
  }),
});
