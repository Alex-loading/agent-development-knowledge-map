import { deepFreezeVisual } from '../visual-contract.js';

export const ma06Visuals = deepFreezeVisual([
  {
    id: 'visual-ma-06-overview', kind: 'diagram', role: 'overview',
    title: '分别读取三层结果，再选择恢复动作',
    alt: 'transport、JSON-RPC 和工具 result 分别提供传输、方法处理和业务执行证据，需要逐层读取。',
    longDescription: '图形按行比较三种结果层级。第一行是 transport，观察 HTTP 状态和 response stream 是否中断，并保留业务结果仍可能未知的判断。第二行是 JSON-RPC，观察 error 和具体错误码，例如未知方法 -32601 或无效参数 -32602，再判断方法与参数是否需要修正。第三行是工具结果，观察 result 内的 isError 与内容，继续读取业务反馈和实际产物。表格中的箭头只表示从信号到判断的阅读方向，不代表所有错误按顺序发生。收到一个合法响应不能单独证明用户目标完成。',
    caption: '错误码帮助分类；安全重试仍需要副作用、授权与业务结果证据。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-06-overview.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-basic', 'res-ma-mcp-tools', 'res-ma-mcp-http'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['comparison', 'failure-mode'],
  },
  {
    id: 'visual-ma-06-detail', kind: 'diagram', role: 'process',
    title: 'Task 状态与查询响应分别读取',
    alt: '可选 Tasks 返回 flat handle，tasks/get 读取状态，tasks/update 提交输入，取消确认只说明收到意图。',
    longDescription: '先沿顶部从左向右阅读：当前请求声明 Tasks extension，Server 可以在 tools/call 后返回 flat CreateTaskResult，客户端随后通过 tasks/get 查询。创建结果的 resultType 为 task，查询响应的 resultType 为 complete，后者不保证任务已结束。查询框向下连接 working、input_required 和终态三组状态；需要输入时通过 tasks/update 提交后再查询。底部单独说明 tasks/cancel 的 ack 只确认意图，需要继续查看状态。另一张说明卡区分 completed 可包含工具 isError 与 failed 对应 JSON-RPC 执行错误。',
    caption: 'Tasks 2026-07-28 为可选 extension；taskId 每次使用仍需授权，cancel ack 不保证停止。',
    assetPath: 'assets/visuals/multi-agent-mcp/ma-06-detail.svg', width: 1120, height: 660,
    provenance: 'original-synthesis', sourceIds: ['res-ma-mcp-tasks', 'res-ma-mcp-tools', 'res-ma-mcp-basic', 'res-ma-mcp-versioning'],
    credit: 'Agent Learner 原创教学图解', permission: null, verifiedAt: '2026-09-18', tags: ['mechanism', 'boundary'],
  },
]);
