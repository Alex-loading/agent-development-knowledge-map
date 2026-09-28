import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleWork, inspectMcpMetadata, evaluateDelegatedAccess } from '../src/core/multi-agent.js';
import { researchWork, requestExample, accessExample } from '../src/data/multi-agent-fixtures.js';

test('dependency scheduling preserves prerequisites and concurrent capacity', () => {
  const before = structuredClone(researchWork);
  const serial = scheduleWork(researchWork, 1);
  const parallel = scheduleWork(researchWork, 2);
  assert.equal(serial.duration, 17);
  assert.equal(parallel.duration, 13);
  assert.equal(parallel.totalWork, 17);
  assert.equal(parallel.criticalPath, 13);
  const byId = new Map(parallel.timeline.map((row) => [row.id, row]));
  for (const task of researchWork) {
    for (const dependency of task.dependencies) assert.ok(byId.get(task.id).start >= byId.get(dependency).end);
  }
  for (let time = 0; time < parallel.duration; time += 1) {
    assert.ok(parallel.timeline.filter((row) => row.start <= time && row.end > time).length <= 2);
  }
  assert.deepEqual(researchWork, before);
  assert.deepEqual(scheduleWork([...researchWork].reverse(), 2), parallel);
});

test('shared writes serialize independent tasks and invalid graphs fail immediately', () => {
  const shared = researchWork.map((task) => ({ ...task, writes: task.id.startsWith('search-') ? ['shared-report'] : task.writes }));
  assert.equal(scheduleWork(shared, 2).duration, 17);
  assert.equal(scheduleWork(researchWork, 8).duration, 13);
  assert.throws(() => scheduleWork(researchWork, 0), RangeError);
  assert.throws(() => scheduleWork([], 2), RangeError);
  assert.throws(() => scheduleWork([...researchWork, researchWork[0]], 2), /重复/);
  assert.throws(() => scheduleWork([{ id: 'a', duration: 1, dependencies: ['missing'], writes: [] }], 2), /依赖/);
  assert.throws(() => scheduleWork([{ id: 'a', duration: 1, dependencies: ['b'], writes: [] }, { id: 'b', duration: 1, dependencies: ['a'], writes: [] }], 2), /循环/);
  assert.throws(() => scheduleWork([{ id: 'a', duration: NaN, dependencies: [], writes: [] }], 2), RangeError);
});

test('current MCP metadata checks distinguish four protocol error categories', () => {
  assert.equal(inspectMcpMetadata(requestExample).accepted, true);
  const missing = inspectMcpMetadata({ ...requestExample, protocolVersion: undefined });
  assert.ok(missing.errors.some(({ code }) => code === -32602));
  const missingCapabilities = inspectMcpMetadata({ ...requestExample, clientCapabilities: undefined });
  assert.ok(missingCapabilities.errors.some(({ code }) => code === -32602));
  const unsupported = inspectMcpMetadata({ ...requestExample, protocolVersion: '2025-11-25', headerVersion: '2025-11-25' });
  assert.deepEqual(unsupported.errors.map(({ code }) => code), [-32022]);
  const mismatch = inspectMcpMetadata({ ...requestExample, headerMethod: 'resources/read' });
  assert.deepEqual(mismatch.errors.map(({ code }) => code), [-32020]);
  const capability = inspectMcpMetadata({ ...requestExample, requiresForm: true });
  assert.deepEqual(capability.errors.map(({ code }) => code), [-32021]);
  assert.equal(inspectMcpMetadata({ ...requestExample, requiresForm: true, clientCapabilities: { elicitation: { form: {} } } }).accepted, true);
});

test('MCP checks retain transport boundaries and do not change their input', () => {
  const before = structuredClone(requestExample);
  assert.equal(inspectMcpMetadata({ ...requestExample, transport: 'stdio', headerVersion: '', headerMethod: '', headerName: '' }).accepted, true);
  assert.equal(inspectMcpMetadata({ ...requestExample, headerName: undefined }).errors[0].code, -32020);
  assert.equal(inspectMcpMetadata({ ...requestExample, clientCapabilities: [] }).errors[0].code, -32602);
  assert.throws(() => inspectMcpMetadata({ ...requestExample, transport: 'udp' }), /transport/);
  assert.deepEqual(requestExample, before);
});

test('delegation requires the intersection of independent permissions', () => {
  assert.equal(evaluateDelegatedAccess(accessExample).allowed, true);
  const exportRequest = { ...accessExample, action: 'export' };
  const denied = evaluateDelegatedAccess(exportRequest);
  assert.equal(denied.allowed, false);
  assert.ok(denied.checks.some(({ id, passed }) => id === 'delegation' && !passed));
  const permittedExport = { ...exportRequest, delegatedActions: ['read', 'export'], confirmation: { action: 'export', resourceId: 'policy-a' } };
  assert.equal(evaluateDelegatedAccess(permittedExport).allowed, true);
  assert.equal(evaluateDelegatedAccess({ ...permittedExport, resourceId: 'policy-b' }).allowed, false);
  assert.equal(evaluateDelegatedAccess({ ...permittedExport, resourceTenant: 'tenant-b' }).allowed, false);
  assert.equal(evaluateDelegatedAccess({ ...permittedExport, tokenAudience: 'https://other.example/mcp' }).allowed, false);
  assert.equal(evaluateDelegatedAccess({ ...permittedExport, tokenActions: ['read'] }).allowed, false);
  assert.equal(evaluateDelegatedAccess({ ...permittedExport, authenticated: false }).allowed, false);
});

test('stdio bypasses HTTP token fields while retaining execution authorization', () => {
  const before = structuredClone(accessExample);
  const local = { ...accessExample, transport: 'stdio', tokenAudience: '', tokenActions: [] };
  assert.equal(evaluateDelegatedAccess(local).allowed, true);
  assert.equal(evaluateDelegatedAccess({ ...local, delegatedActions: [] }).allowed, false);
  assert.equal(evaluateDelegatedAccess({ ...local, authenticated: false }).allowed, false);
  assert.throws(() => evaluateDelegatedAccess({ ...local, userActions: 'read' }), TypeError);
  assert.deepEqual(accessExample, before);
});
