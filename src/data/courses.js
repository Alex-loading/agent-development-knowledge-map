import { agentHarness } from './agent-harness.js';
import { agentMechanism } from './agent-mechanism.js';
import { backendEngineering } from './backend-engineering.js';
import { contextRagMemory } from './context-rag-memory.js';
import { llmFoundation } from './llm-foundation.js';
import { evalsObservabilitySecurity } from './evals-observability-security.js';
import { multiAgentMcp } from './multi-agent-mcp.js';

export const courseRegistry = Object.freeze({
  [llmFoundation.id]: llmFoundation,
  [agentMechanism.id]: agentMechanism,
  [agentHarness.id]: agentHarness,
  [contextRagMemory.id]: contextRagMemory,
  [backendEngineering.id]: backendEngineering,
  [evalsObservabilitySecurity.id]: evalsObservabilitySecurity,
  [multiAgentMcp.id]: multiAgentMcp,
});

export function getCourse(moduleId, registry = courseRegistry) {
  if (typeof moduleId !== 'string') return null;
  if (registry instanceof Map) return registry.get(moduleId) ?? null;
  return registry && Object.hasOwn(registry, moduleId) ? registry[moduleId] : null;
}
