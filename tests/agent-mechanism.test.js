import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decideLoopOutcome,
  decidePlanRecovery,
  validateToolInvocation,
} from '../src/core/agent-mechanism.js';

const toolCatalog = [
  {
    name: 'search_docs',
    required: ['query'],
    properties: {
      query: { type: 'string' },
      scope: { type: 'string', enum: ['docs', 'code'] },
      limit: { type: 'number' },
      exact: { type: 'boolean' },
    },
    risk: 'low',
  },
  {
    name: 'delete_index',
    required: ['exact'],
    properties: {
      exact: { type: 'boolean' },
    },
    risk: 'high',
  },
];

test('loop outcome gives completion evidence priority over blocking and budget exhaustion', () => {
  assert.deepEqual(decideLoopOutcome({
    goalSatisfied: true,
    blocked: true,
    stepsUsed: 5,
    maxSteps: 5,
  }), {
    status: 'done',
    reason: '目标已有可验证的完成证据',
    shouldContinue: false,
  });
});

test('loop outcome gives blocking priority over budget exhaustion', () => {
  assert.deepEqual(decideLoopOutcome({
    goalSatisfied: false,
    blocked: true,
    stepsUsed: 5,
    maxSteps: 5,
  }), {
    status: 'blocked',
    reason: '当前任务已阻塞，需要补充信息或人工介入',
    shouldContinue: false,
  });
});

test('loop outcome stops at and beyond the step budget boundary', () => {
  const expected = {
    status: 'budget-exhausted',
    reason: '已达到最大步骤预算',
    shouldContinue: false,
  };

  assert.deepEqual(decideLoopOutcome({
    goalSatisfied: false,
    blocked: false,
    stepsUsed: 3,
    maxSteps: 3,
  }), expected);
  assert.deepEqual(decideLoopOutcome({
    goalSatisfied: false,
    blocked: false,
    stepsUsed: 4,
    maxSteps: 3,
  }), expected);
});

test('loop outcome continues when the goal is unfinished and budget remains', () => {
  assert.deepEqual(decideLoopOutcome({
    goalSatisfied: false,
    blocked: false,
    stepsUsed: 2,
    maxSteps: 3,
  }), {
    status: 'continue',
    reason: '目标未完成且仍有步骤预算',
    shouldContinue: true,
  });
});

test('loop outcome rejects non-boolean state flags', () => {
  const valid = { goalSatisfied: false, blocked: false, stepsUsed: 0, maxSteps: 1 };

  assert.throws(() => decideLoopOutcome({ ...valid, goalSatisfied: 0 }), TypeError);
  assert.throws(() => decideLoopOutcome({ ...valid, blocked: 'false' }), TypeError);
});

test('loop outcome rejects invalid step counts without changing its input', () => {
  const valid = { goalSatisfied: false, blocked: false, stepsUsed: 0, maxSteps: 1 };
  const input = { ...valid };

  for (const [field, value] of [
    ['stepsUsed', -1],
    ['stepsUsed', 0.5],
    ['stepsUsed', Number.NaN],
    ['stepsUsed', Number.POSITIVE_INFINITY],
    ['maxSteps', 0],
    ['maxSteps', 1.5],
    ['maxSteps', Number.NaN],
    ['maxSteps', Number.POSITIVE_INFINITY],
  ]) {
    assert.throws(() => decideLoopOutcome({ ...valid, [field]: value }), RangeError);
  }
  decideLoopOutcome(input);
  assert.deepEqual(input, valid);
});

test('tool validation returns ready or approval-required based on declared risk', () => {
  assert.deepEqual(validateToolInvocation(toolCatalog, {
    name: 'search_docs',
    args: { query: 'ReAct', scope: 'docs', limit: 3, exact: true },
  }), { status: 'ready', errors: [] });
  assert.deepEqual(validateToolInvocation(toolCatalog, {
    name: 'delete_index',
    args: { exact: true },
  }), { status: 'approval-required', errors: [] });
});

test('tool validation accepts null-prototype args as a plain object', () => {
  const args = Object.assign(Object.create(null), { query: 'planning' });

  assert.deepEqual(validateToolInvocation(toolCatalog, {
    name: 'search_docs',
    args,
  }), { status: 'ready', errors: [] });
});

test('tool validation reports invocation and tool lookup errors clearly', () => {
  assert.deepEqual(validateToolInvocation(toolCatalog, null), {
    status: 'invalid',
    errors: ['invocation 必须是包含 name 与 args 的对象'],
  });
  assert.deepEqual(validateToolInvocation(toolCatalog, { args: {} }), {
    status: 'invalid',
    errors: ['invocation.name 必须是字符串'],
  });
  assert.deepEqual(validateToolInvocation(toolCatalog, { name: 'missing', args: {} }), {
    status: 'invalid',
    errors: ['未知工具 "missing"'],
  });
});

test('tool validation rejects every non-plain args shape', () => {
  for (const args of [null, [], new Date(0), new Set(), 'query']) {
    assert.deepEqual(validateToolInvocation(toolCatalog, {
      name: 'search_docs',
      args,
    }), {
      status: 'invalid',
      errors: ['invocation.args 必须是普通对象'],
    });
  }
});

test('tool validation aggregates missing and extra fields in stable declared and insertion order', () => {
  const catalog = [{
    name: 'combine',
    required: ['first', 'second'],
    properties: {
      first: { type: 'string' },
      second: { type: 'number' },
    },
    risk: 'low',
  }];
  const args = {};
  args.zeta = true;
  args.alpha = true;

  assert.deepEqual(validateToolInvocation(catalog, { name: 'combine', args }), {
    status: 'invalid',
    errors: [
      '缺少必填字段 "first"',
      '缺少必填字段 "second"',
      '不允许额外字段 "zeta"',
      '不允许额外字段 "alpha"',
    ],
  });
});

test('tool validation aggregates type and enum errors in property declaration order', () => {
  assert.deepEqual(validateToolInvocation(toolCatalog, {
    name: 'search_docs',
    args: {
      query: 42,
      scope: 'web',
      limit: Number.POSITIVE_INFINITY,
      exact: 'yes',
    },
  }), {
    status: 'invalid',
    errors: [
      '字段 "query" 应为 string 类型',
      '字段 "scope" 必须是以下值之一: docs, code',
      '字段 "limit" 应为有限 number 类型',
      '字段 "exact" 应为 boolean 类型',
    ],
  });
});

test('tool validation rejects NaN number arguments', () => {
  assert.deepEqual(validateToolInvocation(toolCatalog, {
    name: 'search_docs',
    args: { query: 'numbers', limit: Number.NaN },
  }), {
    status: 'invalid',
    errors: ['字段 "limit" 应为有限 number 类型'],
  });
});

test('tool validation returns fresh results and does not mutate catalog or invocation', () => {
  const catalog = structuredClone(toolCatalog);
  const invocation = {
    name: 'search_docs',
    args: { query: 'tools', unexpected: true },
  };
  const catalogSnapshot = structuredClone(catalog);
  const invocationSnapshot = structuredClone(invocation);

  const first = validateToolInvocation(catalog, invocation);
  const second = validateToolInvocation(catalog, invocation);

  assert.notEqual(first, second);
  assert.notEqual(first.errors, second.errors);
  assert.deepEqual(catalog, catalogSnapshot);
  assert.deepEqual(invocation, invocationSnapshot);
});

test('tool validation treats malformed catalogs and definitions as programmer errors', () => {
  const invocation = { name: 'anything', args: {} };
  const definition = {
    name: 'anything',
    required: [],
    properties: {},
    risk: 'low',
  };

  assert.throws(() => validateToolInvocation({}, invocation), TypeError);
  assert.throws(() => validateToolInvocation([{ ...definition, name: 1 }], invocation), TypeError);
  assert.throws(() => validateToolInvocation([{ ...definition, required: {} }], invocation), TypeError);
  assert.throws(() => validateToolInvocation([{ ...definition, properties: new Date(0) }], invocation), TypeError);
  assert.throws(() => validateToolInvocation([{ ...definition, risk: 'medium' }], invocation), RangeError);
});

test('tool validation rejects empty tool names', () => {
  const definition = {
    name: 'placeholder',
    required: [],
    properties: {},
    risk: 'low',
  };

  for (const name of ['', '   ']) {
    assert.throws(
      () => validateToolInvocation([{ ...definition, name }], { name: 'anything', args: {} }),
      { name: 'RangeError', message: '工具定义的 name 不能为空' },
    );
  }
});

test('tool validation rejects duplicate tool names regardless of catalog order', () => {
  const invocation = { name: 'same', args: {} };
  const lowRisk = {
    name: 'same',
    required: [],
    properties: {},
    risk: 'low',
  };
  const highRisk = { ...lowRisk, risk: 'high' };

  for (const catalog of [
    [lowRisk, highRisk],
    [highRisk, lowRisk],
  ]) {
    assert.throws(
      () => validateToolInvocation(catalog, invocation),
      { name: 'RangeError', message: '工具名称 "same" 在 catalog 中重复' },
    );
  }
});

test('tool validation rejects duplicate required fields', () => {
  const catalog = [{
    name: 'repeat_required',
    required: ['x', 'x'],
    properties: { x: { type: 'string' } },
    risk: 'low',
  }];

  assert.throws(
    () => validateToolInvocation(catalog, { name: 'repeat_required', args: {} }),
    { name: 'RangeError', message: '工具 "repeat_required" 的 required 字段 "x" 不能重复' },
  );
});

test('tool validation rejects empty enums', () => {
  const definition = {
    name: 'enum_tool',
    required: [],
    properties: {
      scope: { type: 'string', enum: [] },
    },
    risk: 'low',
  };
  const invocation = { name: 'enum_tool', args: {} };

  assert.throws(
    () => validateToolInvocation([definition], invocation),
    { name: 'RangeError', message: '字段 "scope" 的 enum 不能为空' },
  );
});

test('tool validation rejects duplicate enum values', () => {
  const definition = {
    name: 'enum_tool',
    required: [],
    properties: {
      scope: { type: 'string', enum: ['docs', 'docs'] },
    },
    risk: 'low',
  };

  assert.throws(
    () => validateToolInvocation([definition], { name: 'enum_tool', args: {} }),
    { name: 'RangeError', message: '字段 "scope" 的 enum 值 "docs" 不能重复' },
  );
});

test('plan recovery covers the strategy and observation decision matrix', () => {
  const expected = {
    fixed: {
      success: { action: 'continue', reason: '当前步骤已获得成功证据' },
      timeout: { action: 'blocked', reason: '固定计划的重试预算已耗尽' },
      'empty-result': { action: 'blocked', reason: '固定计划无法处理空结果' },
      'new-constraint': { action: 'blocked', reason: '新约束使固定计划失效' },
    },
    reactive: {
      success: { action: 'continue', reason: '当前步骤已获得成功证据' },
      timeout: { action: 'replan', reason: '超时且重试预算耗尽，需要调整计划' },
      'empty-result': { action: 'switch-action', reason: '空结果需要尝试另一动作' },
      'new-constraint': { action: 'replan', reason: '新约束要求重新规划' },
    },
    hybrid: {
      success: { action: 'continue', reason: '当前步骤已获得成功证据' },
      timeout: { action: 'replan', reason: '超时且重试预算耗尽，需要调整计划' },
      'empty-result': { action: 'replace-step', reason: '空结果需要替换当前计划步骤' },
      'new-constraint': { action: 'replan', reason: '新约束要求重新规划' },
    },
  };

  for (const [strategy, outcomes] of Object.entries(expected)) {
    for (const [observation, result] of Object.entries(outcomes)) {
      assert.deepEqual(decidePlanRecovery({
        strategy,
        observation,
        retriesUsed: 0,
        maxRetries: 0,
      }), result, `${strategy}/${observation}`);
    }
  }
});

test('plan recovery retries timeout only while retry budget remains', () => {
  const expectedRetry = { action: 'retry', reason: '临时超时且仍有重试预算' };

  for (const strategy of ['fixed', 'reactive', 'hybrid']) {
    assert.deepEqual(decidePlanRecovery({
      strategy,
      observation: 'timeout',
      retriesUsed: 1,
      maxRetries: 2,
    }), expectedRetry);
  }

  assert.deepEqual(decidePlanRecovery({
    strategy: 'reactive',
    observation: 'timeout',
    retriesUsed: 2,
    maxRetries: 2,
  }), { action: 'replan', reason: '超时且重试预算耗尽，需要调整计划' });
  assert.deepEqual(decidePlanRecovery({
    strategy: 'fixed',
    observation: 'timeout',
    retriesUsed: 3,
    maxRetries: 2,
  }), { action: 'blocked', reason: '固定计划的重试预算已耗尽' });
});

test('plan recovery reconciles side-effect timeouts before any retry', () => {
  const base = {
    strategy: 'hybrid',
    observation: 'timeout',
    retriesUsed: 0,
    maxRetries: 2,
    operationKind: 'side-effect',
  };

  assert.deepEqual(decidePlanRecovery({
    ...base,
    reconciliationStatus: 'unknown',
  }), {
    action: 'reconcile',
    reason: '副作用终态未知，必须按宿主持久化的稳定 intent 先对账',
  });
  assert.deepEqual(decidePlanRecovery({
    ...base,
    reconciliationStatus: 'cannot-reconcile',
  }), {
    action: 'handoff',
    reason: '副作用终态无法对账，禁止重复执行并转人工处理',
  });
  assert.deepEqual(decidePlanRecovery({
    ...base,
    reconciliationStatus: 'confirmed-not-executed',
  }), {
    action: 'retry',
    reason: '已确认副作用未执行且仍有重试预算',
  });
});

test('plan recovery never retries an unreconciled side effect', () => {
  let actCount = 1;
  const first = decidePlanRecovery({
    strategy: 'hybrid',
    observation: 'timeout',
    retriesUsed: 0,
    maxRetries: 2,
    operationKind: 'side-effect',
    reconciliationStatus: 'unknown',
  });
  if (first.action === 'retry') actCount += 1;

  const second = decidePlanRecovery({
    strategy: 'hybrid',
    observation: 'timeout',
    retriesUsed: 0,
    maxRetries: 2,
    operationKind: 'side-effect',
    reconciliationStatus: 'cannot-reconcile',
  });
  if (second.action === 'retry') actCount += 1;

  assert.deepEqual({ first: first.action, second: second.action, actCount }, {
    first: 'reconcile',
    second: 'handoff',
    actCount: 1,
  });
});

test('plan recovery rejects unsupported strategies and observations', () => {
  const valid = {
    strategy: 'hybrid',
    observation: 'success',
    retriesUsed: 0,
    maxRetries: 0,
  };

  assert.throws(() => decidePlanRecovery({ ...valid, strategy: 'adaptive' }), RangeError);
  assert.throws(() => decidePlanRecovery({ ...valid, observation: 'failure' }), RangeError);
  assert.throws(() => decidePlanRecovery({ ...valid, operationKind: 'write' }), RangeError);
  assert.throws(() => decidePlanRecovery({ ...valid, reconciliationStatus: 'assumed-failed' }), RangeError);
});

test('plan recovery rejects invalid retry counts without changing its input', () => {
  const valid = {
    strategy: 'hybrid',
    observation: 'success',
    retriesUsed: 0,
    maxRetries: 0,
  };
  const input = { ...valid };

  for (const [field, value] of [
    ['retriesUsed', -1],
    ['retriesUsed', 0.5],
    ['retriesUsed', Number.NaN],
    ['retriesUsed', Number.POSITIVE_INFINITY],
    ['maxRetries', -1],
    ['maxRetries', 0.5],
    ['maxRetries', Number.NaN],
    ['maxRetries', Number.POSITIVE_INFINITY],
  ]) {
    assert.throws(() => decidePlanRecovery({ ...valid, [field]: value }), RangeError);
  }
  decidePlanRecovery(input);
  assert.deepEqual(input, valid);

  const trustedInput = {
    ...valid,
    operationKind: 'side-effect',
    reconciliationStatus: 'confirmed-not-executed',
  };
  const trustedSnapshot = { ...trustedInput };
  decidePlanRecovery(trustedInput);
  assert.deepEqual(trustedInput, trustedSnapshot);
});
