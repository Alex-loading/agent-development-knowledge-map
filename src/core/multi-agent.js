function strings(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new TypeError(`${label} 必须为非空字符串组成的数组`);
  }
  if (new Set(value).size !== value.length) throw new RangeError(`${label} 包含重复项`);
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function transport(value) {
  if (!['http', 'stdio'].includes(value)) throw new RangeError('transport 必须为 http 或 stdio');
}

const byId = (a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

export function scheduleWork(tasks, workers) {
  if (!Array.isArray(tasks) || tasks.length === 0 || tasks.length > 100) throw new RangeError('任务数量必须为 1 至 100');
  if (!Number.isInteger(workers) || workers < 1 || workers > 8) throw new RangeError('worker 数量必须为 1 至 8');
  const taskMap = new Map();
  for (const task of tasks) {
    if (!record(task) || typeof task.id !== 'string' || !task.id.trim()) throw new TypeError('任务必须包含有效 id');
    if (taskMap.has(task.id)) throw new RangeError(`重复任务：${task.id}`);
    if (!Number.isSafeInteger(task.duration) || task.duration < 1 || task.duration > 100000) throw new RangeError('任务时长必须为 1 至 100000 的整数');
    strings(task.dependencies, 'dependencies');
    strings(task.writes, 'writes');
    taskMap.set(task.id, task);
  }
  for (const task of tasks) {
    if (task.dependencies.some((id) => !taskMap.has(id))) throw new RangeError(`任务依赖不存在：${task.id}`);
  }
  const visiting = new Set();
  const pathLengths = new Map();
  function pathLength(id) {
    if (visiting.has(id)) throw new RangeError(`任务依赖形成循环：${id}`);
    if (pathLengths.has(id)) return pathLengths.get(id);
    visiting.add(id);
    const task = taskMap.get(id);
    const duration = task.duration + Math.max(0, ...task.dependencies.map(pathLength));
    visiting.delete(id);
    pathLengths.set(id, duration);
    return duration;
  }
  const criticalPath = Math.max(...tasks.map(({ id }) => pathLength(id)));
  const remaining = new Map([...tasks].sort(byId).map((task) => [task.id, task]));
  const completed = new Set();
  const timeline = [];
  let running = [];
  let time = 0;
  while (remaining.size || running.length) {
    for (const item of running.filter(({ end }) => end <= time)) completed.add(item.id);
    running = running.filter(({ end }) => end > time);
    for (const task of remaining.values()) {
      if (running.length === workers) break;
      if (!task.dependencies.every((id) => completed.has(id))) continue;
      const occupied = new Set(running.flatMap(({ id }) => taskMap.get(id).writes));
      if (task.writes.some((key) => occupied.has(key))) continue;
      const entry = { id: task.id, label: task.label ?? task.id, start: time, end: time + task.duration };
      timeline.push(entry);
      running.push(entry);
      remaining.delete(task.id);
    }
    if (running.length) time = Math.min(...running.map(({ end }) => end));
    else if (remaining.size) throw new Error('任务无法继续调度');
  }
  return { duration: time, totalWork: tasks.reduce((sum, task) => sum + task.duration, 0), criticalPath, timeline };
}

// 输入是已读取的教学字段，本函数核对指定规则，不解析网络消息。
export function inspectMcpMetadata(input) {
  if (!record(input)) throw new TypeError('请求核对输入必须为对象');
  transport(input.transport);
  strings(input.supportedVersions, 'supportedVersions');
  if (!input.supportedVersions.length) throw new RangeError('至少声明一个支持的版本');
  if (typeof input.requiresForm !== 'boolean') throw new TypeError('requiresForm 必须为布尔值');
  if (typeof input.toolName !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(input.toolName)) throw new TypeError('教学工具名称必须使用 ASCII 字母、数字、下划线、句点或连字符');
  const checks = [];
  const add = (id, label, passed, code, detail) => checks.push({ id, label, passed, code: passed === false ? code : null, detail });
  const hasVersion = typeof input.protocolVersion === 'string' && input.protocolVersion.length > 0;
  const hasCapabilities = record(input.clientCapabilities);
  add('metadata', '必需 metadata', hasVersion && hasCapabilities, -32602, '每个请求携带 protocolVersion 与 clientCapabilities；空能力对象有效。');
  add('version', '服务端版本支持', hasVersion ? input.supportedVersions.includes(input.protocolVersion) : null, -32022, `服务端声明：${input.supportedVersions.join('、')}。`);
  const matchingHeaders = hasVersion && input.headerVersion === input.protocolVersion
    && input.headerMethod === 'tools/call' && input.headerName === input.toolName;
  add('headers', 'HTTP 请求字段一致性', input.transport === 'http' && hasVersion ? matchingHeaders : null, -32020, input.transport === 'http' ? 'MCP-Protocol-Version、Mcp-Method、Mcp-Name 与对应正文一致。' : 'stdio 不使用 HTTP 请求头。');
  const form = hasCapabilities && record(input.clientCapabilities.elicitation) && record(input.clientCapabilities.elicitation.form);
  add('capability', '本次需要的表单能力', hasCapabilities && input.requiresForm ? form : null, -32021, input.requiresForm ? '本次教学工具要求声明 elicitation.form。' : '当前操作没有请求额外的客户端表单能力。');
  const errors = checks.filter(({ passed }) => passed === false);
  return { accepted: errors.length === 0, checks, errors };
}

export function evaluateDelegatedAccess(input) {
  if (!record(input)) throw new TypeError('权限输入必须为对象');
  transport(input.transport);
  if (!['read', 'export'].includes(input.action)) throw new RangeError('action 必须为 read 或 export');
  if (typeof input.authenticated !== 'boolean') throw new TypeError('authenticated 必须为布尔值');
  for (const field of ['userActions', 'delegatedActions', 'tokenActions']) strings(input[field], field);
  for (const field of ['userTenant', 'resourceTenant', 'resourceId', 'resourceServer', 'tokenAudience']) {
    if (typeof input[field] !== 'string' || (field !== 'tokenAudience' && !input[field].trim())) throw new TypeError(`${field} 必须为有效字符串`);
  }
  if (input.confirmation !== null && !record(input.confirmation)) throw new TypeError('confirmation 必须为对象或 null');
  const checks = [
    { id: 'identity', label: '应用确认的身份', passed: input.authenticated },
    { id: 'user', label: '用户拥有该动作权限', passed: input.userActions.includes(input.action) },
    { id: 'delegation', label: '动作属于本次委托范围', passed: input.delegatedActions.includes(input.action) },
    { id: 'resource', label: '资源属于当前租户', passed: input.userTenant === input.resourceTenant },
    { id: 'audience', label: 'HTTP token 指向当前服务', passed: input.transport === 'http' ? input.tokenAudience === input.resourceServer : null },
    { id: 'scope', label: 'HTTP token 包含所需 scope', passed: input.transport === 'http' ? input.tokenActions.includes(input.action) : null },
    { id: 'confirmation', label: '导出确认绑定当前动作与资源', passed: input.action === 'export' ? input.confirmation?.action === input.action && input.confirmation?.resourceId === input.resourceId : null },
  ];
  return { allowed: checks.every(({ passed }) => passed !== false), checks };
}
