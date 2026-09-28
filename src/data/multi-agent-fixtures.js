import { deepFreeze } from './multi-agent-shared.js';

export const researchWork = deepFreeze([
  { id: 'prepare', label: '准备任务', duration: 2, dependencies: [], writes: [] },
  { id: 'search-a', label: '检索资料 A', duration: 4, dependencies: ['prepare'], writes: ['evidence-a'] },
  { id: 'search-b', label: '检索资料 B', duration: 6, dependencies: ['prepare'], writes: ['evidence-b'] },
  { id: 'synthesize', label: '汇总证据', duration: 3, dependencies: ['search-a', 'search-b'], writes: ['report'] },
  { id: 'verify', label: '核验结果', duration: 2, dependencies: ['synthesize'], writes: [] },
]);

export const requestExample = deepFreeze({
  protocolVersion: '2026-07-28',
  supportedVersions: ['2026-07-28'],
  clientCapabilities: {},
  transport: 'http',
  headerVersion: '2026-07-28',
  headerMethod: 'tools/call',
  headerName: 'lookup_policy',
  toolName: 'lookup_policy',
  requiresForm: false,
});

export const accessExample = deepFreeze({
  action: 'read',
  authenticated: true,
  userActions: ['read', 'export'],
  delegatedActions: ['read'],
  userTenant: 'tenant-a',
  resourceTenant: 'tenant-a',
  resourceId: 'policy-a',
  transport: 'http',
  resourceServer: 'https://knowledge.example/mcp',
  tokenAudience: 'https://knowledge.example/mcp',
  tokenActions: ['read', 'export'],
  confirmation: null,
});
