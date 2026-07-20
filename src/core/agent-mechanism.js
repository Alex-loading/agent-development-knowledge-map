const TOOL_PROPERTY_TYPES = new Set(['string', 'number', 'boolean']);
const PLAN_STRATEGIES = new Set(['fixed', 'reactive', 'hybrid']);
const PLAN_OBSERVATIONS = new Set(['success', 'timeout', 'empty-result', 'new-constraint']);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertNonNegativeInteger(value, fieldName, { positive = false } = {}) {
  const minimum = positive ? 1 : 0;
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < minimum) {
    throw new RangeError(`${fieldName} 必须是有限${positive ? '正' : '非负'}整数`);
  }
}

export function decideLoopOutcome({ goalSatisfied, blocked, stepsUsed, maxSteps }) {
  if (typeof goalSatisfied !== 'boolean') {
    throw new TypeError('goalSatisfied 必须是 boolean');
  }
  if (typeof blocked !== 'boolean') {
    throw new TypeError('blocked 必须是 boolean');
  }
  assertNonNegativeInteger(stepsUsed, 'stepsUsed');
  assertNonNegativeInteger(maxSteps, 'maxSteps', { positive: true });

  if (goalSatisfied) {
    return {
      status: 'done',
      reason: '目标已有可验证的完成证据',
      shouldContinue: false,
    };
  }
  if (blocked) {
    return {
      status: 'blocked',
      reason: '当前任务已阻塞，需要补充信息或人工介入',
      shouldContinue: false,
    };
  }
  if (stepsUsed >= maxSteps) {
    return {
      status: 'budget-exhausted',
      reason: '已达到最大步骤预算',
      shouldContinue: false,
    };
  }
  return {
    status: 'continue',
    reason: '目标未完成且仍有步骤预算',
    shouldContinue: true,
  };
}

function assertToolCatalog(toolCatalog) {
  if (!Array.isArray(toolCatalog)) {
    throw new TypeError('toolCatalog 必须是数组');
  }

  for (const definition of toolCatalog) {
    if (!isPlainObject(definition)) {
      throw new TypeError('工具定义必须是普通对象');
    }
    if (typeof definition.name !== 'string') {
      throw new TypeError('工具定义的 name 必须是字符串');
    }
    if (!Array.isArray(definition.required)) {
      throw new TypeError(`工具 "${definition.name}" 的 required 必须是数组`);
    }
    if (definition.required.some((field) => typeof field !== 'string')) {
      throw new TypeError(`工具 "${definition.name}" 的 required 字段名必须是字符串`);
    }
    if (!isPlainObject(definition.properties)) {
      throw new TypeError(`工具 "${definition.name}" 的 properties 必须是普通对象`);
    }
    if (!['low', 'high'].includes(definition.risk)) {
      throw new RangeError(`工具 "${definition.name}" 的 risk 必须是 low 或 high`);
    }

    for (const requiredField of definition.required) {
      if (!Object.hasOwn(definition.properties, requiredField)) {
        throw new RangeError(`必填字段 "${requiredField}" 必须在 properties 中定义`);
      }
    }
    for (const [field, property] of Object.entries(definition.properties)) {
      if (!isPlainObject(property)) {
        throw new TypeError(`字段 "${field}" 的定义必须是普通对象`);
      }
      if (!TOOL_PROPERTY_TYPES.has(property.type)) {
        throw new RangeError(`字段 "${field}" 的 type 不受支持`);
      }
      if (property.enum !== undefined) {
        if (!Array.isArray(property.enum)) {
          throw new TypeError(`字段 "${field}" 的 enum 必须是数组`);
        }
        if (property.enum.some((value) => !matchesType(value, property.type))) {
          throw new RangeError(`字段 "${field}" 的 enum 值必须符合 ${property.type} 类型`);
        }
      }
    }
  }
}

function matchesType(value, type) {
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === type;
}

export function validateToolInvocation(toolCatalog, invocation) {
  assertToolCatalog(toolCatalog);

  if (invocation === null || typeof invocation !== 'object' || Array.isArray(invocation)) {
    return {
      status: 'invalid',
      errors: ['invocation 必须是包含 name 与 args 的对象'],
    };
  }
  if (typeof invocation.name !== 'string') {
    return {
      status: 'invalid',
      errors: ['invocation.name 必须是字符串'],
    };
  }

  const tool = toolCatalog.find(({ name }) => name === invocation.name);
  if (!tool) {
    return {
      status: 'invalid',
      errors: [`未知工具 "${invocation.name}"`],
    };
  }
  if (!isPlainObject(invocation.args)) {
    return {
      status: 'invalid',
      errors: ['invocation.args 必须是普通对象'],
    };
  }

  const errors = [];
  for (const field of tool.required) {
    if (!Object.hasOwn(invocation.args, field)) {
      errors.push(`缺少必填字段 "${field}"`);
    }
  }
  for (const field of Object.keys(invocation.args)) {
    if (!Object.hasOwn(tool.properties, field)) {
      errors.push(`不允许额外字段 "${field}"`);
    }
  }
  for (const [field, property] of Object.entries(tool.properties)) {
    if (!Object.hasOwn(invocation.args, field)) continue;

    const value = invocation.args[field];
    if (!matchesType(value, property.type)) {
      errors.push(property.type === 'number'
        ? `字段 "${field}" 应为有限 number 类型`
        : `字段 "${field}" 应为 ${property.type} 类型`);
      continue;
    }
    if (property.enum !== undefined && !property.enum.includes(value)) {
      errors.push(`字段 "${field}" 必须是以下值之一: ${property.enum.join(', ')}`);
    }
  }

  if (errors.length > 0) return { status: 'invalid', errors };
  return {
    status: tool.risk === 'high' ? 'approval-required' : 'ready',
    errors,
  };
}

export function decidePlanRecovery({ strategy, observation, retriesUsed, maxRetries }) {
  if (!PLAN_STRATEGIES.has(strategy)) {
    throw new RangeError('strategy 必须是 fixed、reactive 或 hybrid');
  }
  if (!PLAN_OBSERVATIONS.has(observation)) {
    throw new RangeError('observation 不受支持');
  }
  assertNonNegativeInteger(retriesUsed, 'retriesUsed');
  assertNonNegativeInteger(maxRetries, 'maxRetries');

  if (observation === 'success') {
    return { action: 'continue', reason: '当前步骤已获得成功证据' };
  }
  if (observation === 'timeout') {
    if (retriesUsed < maxRetries) {
      return { action: 'retry', reason: '临时超时且仍有重试预算' };
    }
    return strategy === 'fixed'
      ? { action: 'blocked', reason: '固定计划的重试预算已耗尽' }
      : { action: 'replan', reason: '超时且重试预算耗尽，需要调整计划' };
  }
  if (observation === 'empty-result') {
    if (strategy === 'fixed') {
      return { action: 'blocked', reason: '固定计划无法处理空结果' };
    }
    return strategy === 'reactive'
      ? { action: 'switch-action', reason: '空结果需要尝试另一动作' }
      : { action: 'replace-step', reason: '空结果需要替换当前计划步骤' };
  }
  return strategy === 'fixed'
    ? { action: 'blocked', reason: '新约束使固定计划失效' }
    : { action: 'replan', reason: '新约束要求重新规划' };
}
