import { scheduleWork, inspectMcpMetadata, evaluateDelegatedAccess } from '../core/multi-agent.js';
import { researchWork, requestExample, accessExample } from '../data/multi-agent-fixtures.js';
import { button, element } from './dom.js';

function select(id, label, options, value, update) {
  const input = element('select', {
    className: 'backend-control-input', attrs: { id }, events: { change: update },
  }, options.map(([key, text]) => element('option', { text, attrs: { value: key } })));
  input.value = value;
  return { input, node: element('div', { className: 'experiment-control' }, [element('label', { text: label, attrs: { for: id } }), input]) };
}

function checkbox(id, label, checked, update) {
  const input = element('input', { attrs: { id, type: 'checkbox' }, events: { change: update } });
  input.checked = checked;
  return { input, node: element('div', { className: 'backend-check-control' }, [input, element('label', { text: label, attrs: { for: id } })]) };
}

function liveResult(id) {
  return element('div', { className: 'experiment-status', attrs: { id, 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function checkList(checks) {
  return element('ul', {}, checks.map(({ label, passed, code, detail }) => element('li', {
    text: `${label}：${passed === null ? '本次不检查' : passed ? '通过' : '未通过'}${code ? `（${code}）` : ''}${detail ? `。${detail}` : ''}`,
  })));
}

function lab({ id, title, caveat, controls, result, reset }) {
  return element('section', { className: 'experiment-lab', attrs: { 'aria-labelledby': `${id}-title` } }, [
    element('header', { className: 'experiment-lab__header' }, [
      element('span', { className: 'section-index', text: '多 Agent 与 MCP · 教学实验' }),
      element('h3', { text: title, attrs: { id: `${id}-title` } }),
    ]),
    element('p', { className: 'experiment-caveat', text: caveat }),
    element('div', { className: 'experiment-grid' }, [
      element('div', { className: 'experiment-controls' }, controls),
      element('div', { className: 'experiment-results' }, [result]),
    ]), reset,
  ]);
}

export function renderDependencyScheduling() {
  const result = liveResult('ma-scheduling-result');
  const workers = element('input', {
    className: 'backend-control-input',
    attrs: { id: 'ma-scheduling-workers', type: 'number', value: 2, min: 1, max: 8, step: 1 },
    events: { input: update },
  });
  const shared = checkbox('ma-scheduling-shared', '两项检索写入同一份共享报告', false, update);
  function update() {
    const count = workers.value.trim() === '' ? NaN : Number(workers.value);
    const valid = Number.isInteger(count) && count >= 1 && count <= 8;
    workers.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      result.className = 'experiment-status has-error';
      result.replaceChildren(element('strong', { text: '请输入 1 至 8 之间的整数 worker 数量。' }));
      return;
    }
    const tasks = researchWork.map((task) => ({
      ...task,
      writes: shared.input.checked && task.id.startsWith('search-') ? ['shared-report'] : task.writes,
    }));
    const schedule = scheduleWork(tasks, count);
    result.className = 'experiment-status';
    result.replaceChildren(
      element('h4', { text: `完成时长：${schedule.duration} 个教学时间单位` }),
      element('p', { text: `总工作量 ${schedule.totalWork}；依赖路径下界 ${schedule.criticalPath}；worker 数量 ${count}。` }),
      element('ol', {}, schedule.timeline.map(({ label, start, end }) => element('li', { text: `${label}：${start} → ${end}` }))),
      element('p', { text: shared.input.checked ? '共享写入采用互斥规则；检索 B 等待检索 A 释放同名写入资源。依赖路径下界没有计入这种资源等待。' : '两项检索分别保存证据，可以同时进行。汇总等待两项检索完成，核验等待汇总完成。' }),
      element('p', { text: '增加 worker 只改变可同时执行的任务数量。真实系统还需测量通信、模型调用、失败重试与结果质量。' }),
    );
  }
  const reset = button('重置调度实验', {
    className: 'secondary-action experiment-reset', attrs: { id: 'ma-scheduling-reset' },
    events: { click: () => { workers.value = '2'; shared.input.checked = false; update(); workers.focus(); } },
  });
  update();
  return lab({
    id: 'ma-scheduling', title: '依赖与共享写入调度台',
    caveat: '五项固定任务使用假设时长。确定性调度按任务 ID 选择就绪任务，遵守依赖、worker 上限与同名写入互斥；未运行真实 Agent，也不保证任意任务图的最优安排。',
    controls: [element('div', { className: 'experiment-control' }, [element('label', { text: '可用 worker 数量', attrs: { for: 'ma-scheduling-workers' } }), workers]), shared.node], result, reset,
  });
}

export function renderMcpRequest() {
  const result = liveResult('ma-request-result');
  const transport = select('ma-request-transport', '传输方式', [['http', 'Streamable HTTP'], ['stdio', 'stdio']], 'http', update);
  const scenario = select('ma-request-scenario', '请求字段条件', [
    ['valid', '必需字段完整'], ['missing-version', '缺少 protocolVersion'],
    ['missing-capabilities', '缺少 clientCapabilities'], ['unsupported', '请求未支持的版本'],
    ['header-mismatch', 'HTTP 请求头与工具名称不一致'],
  ], 'valid', update);
  const requiresForm = checkbox('ma-request-requires-form', '本次操作需要客户端表单能力', false, update);
  const declaresForm = checkbox('ma-request-declares-form', '客户端声明 elicitation.form', false, update);
  function update() {
    const input = {
      ...requestExample, transport: transport.input.value,
      clientCapabilities: declaresForm.input.checked ? { elicitation: { form: {} } } : {},
      requiresForm: requiresForm.input.checked,
    };
    if (scenario.input.value === 'missing-version') input.protocolVersion = undefined;
    if (scenario.input.value === 'missing-capabilities') input.clientCapabilities = undefined;
    if (scenario.input.value === 'unsupported') {
      input.protocolVersion = '2099-01-01';
      input.headerVersion = input.protocolVersion;
    }
    if (scenario.input.value === 'header-mismatch') input.headerName = 'another_tool';
    const report = inspectMcpMetadata(input);
    const message = {
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: {
        name: input.toolName, arguments: { query: '报销规则' },
        _meta: {
          'io.modelcontextprotocol/protocolVersion': input.protocolVersion,
          'io.modelcontextprotocol/clientCapabilities': input.clientCapabilities,
        },
      },
    };
    result.className = `experiment-status${report.accepted ? '' : ' has-error'}`;
    result.replaceChildren(
      element('h4', { text: report.accepted ? '通过本面板的字段检查' : `发现 ${report.errors.length} 项字段问题` }),
      checkList(report.checks),
      element('details', {}, [
        element('summary', { text: '查看对应教学请求' }),
        element('pre', { className: 'tool-invocation', text: JSON.stringify(message, null, 2) }),
        element('p', { text: input.transport === 'http' ? `请求头：MCP-Protocol-Version=${input.headerVersion}；Mcp-Method=${input.headerMethod}；Mcp-Name=${input.headerName}。` : 'stdio 通过进程输入输出传送消息。' }),
      ]),
      element('p', { text: '各项错误独立呈现。真实服务端的检查顺序、工具参数校验、业务权限和响应内容需要另行验证。' }),
    );
  }
  const reset = button('重置请求实验', {
    className: 'secondary-action experiment-reset', attrs: { id: 'ma-request-reset' },
    events: { click: () => { transport.input.value = 'http'; scenario.input.value = 'valid'; requiresForm.input.checked = false; declaresForm.input.checked = false; update(); transport.input.focus(); } },
  });
  update();
  return lab({
    id: 'ma-request', title: 'MCP 请求字段核对台',
    caveat: '依据 MCP 2026-07-28 检查已给定的 metadata、版本、能力和 HTTP 请求头。教学工具名限于 ASCII；页面没有连接 MCP Server，也未实现完整协议验证。2099-01-01 仅为未支持版本的教学输入。',
    controls: [transport.node, scenario.node, requiresForm.node, declaresForm.node], result, reset,
  });
}

export function renderDelegatedPermissions() {
  const result = liveResult('ma-access-result');
  const action = select('ma-access-action', '请求动作', [['read', '读取 read'], ['export', '导出 export']], 'read', update);
  const transport = select('ma-access-transport', '传输方式', [['http', 'HTTP'], ['stdio', 'stdio']], 'http', update);
  const scenario = select('ma-access-scenario', '身份与资源条件', [
    ['valid', '当前用户与资源匹配'], ['identity', '应用身份尚未确认'],
    ['user', '用户缺少当前动作权限'], ['tenant', '资源属于另一租户'],
    ['audience', 'HTTP token 面向另一服务'], ['scope', 'HTTP token 缺少当前 scope'],
  ], 'valid', update);
  const delegated = checkbox('ma-access-delegated', '本次委托允许 export', false, update);
  const confirmation = select('ma-access-confirmation', '导出确认', [
    ['none', '没有确认'], ['current', '确认导出当前资源'], ['other', '确认导出另一资源'],
  ], 'none', update);
  function update() {
    const input = {
      ...accessExample, action: action.input.value, transport: transport.input.value,
      delegatedActions: delegated.input.checked ? ['read', 'export'] : ['read'],
      confirmation: confirmation.input.value === 'none' ? null : { action: 'export', resourceId: confirmation.input.value === 'current' ? 'policy-a' : 'policy-b' },
    };
    if (scenario.input.value === 'identity') input.authenticated = false;
    if (scenario.input.value === 'user') input.userActions = [];
    if (scenario.input.value === 'tenant') input.resourceTenant = 'tenant-b';
    if (scenario.input.value === 'audience') input.tokenAudience = 'https://another.example/mcp';
    if (scenario.input.value === 'scope') input.tokenActions = [];
    const report = evaluateDelegatedAccess(input);
    result.className = `experiment-status${report.allowed ? '' : ' has-error'}`;
    result.replaceChildren(
      element('h4', { text: report.allowed ? '教学策略允许当前动作' : '教学策略拒绝当前动作' }),
      element('p', { text: `动作 ${input.action}；资源 ${input.resourceId}；用户租户 ${input.userTenant}；资源租户 ${input.resourceTenant}。` }),
      checkList(report.checks),
      element('p', { text: '全部适用条件同时通过才允许执行。stdio 保留应用身份、委托、资源权限与具体确认检查；HTTP token 项在该分支不适用。' }),
    );
  }
  const reset = button('重置权限实验', {
    className: 'secondary-action experiment-reset', attrs: { id: 'ma-access-reset' },
    events: { click: () => { action.input.value = 'read'; transport.input.value = 'http'; scenario.input.value = 'valid'; delegated.input.checked = false; confirmation.input.value = 'none'; update(); action.input.focus(); } },
  });
  update();
  return lab({
    id: 'ma-access', title: '委托范围与执行权限台',
    caveat: '原创应用策略采用给定的身份与 token 事实，计算 read/export 的许可交集。实际身份认证、签名、issuer、时效与 OAuth 交互需由真实系统验证；MCP 没有定义本面板的通用委托算法。',
    controls: [action.node, transport.node, scenario.node, delegated.node, confirmation.node], result, reset,
  });
}

export const multiAgentExperimentRenderers = Object.freeze({
  'ma-dependency-scheduling': renderDependencyScheduling,
  'ma-mcp-request': renderMcpRequest,
  'ma-delegated-permissions': renderDelegatedPermissions,
});
