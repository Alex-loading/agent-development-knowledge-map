import { llmFoundation } from './llm-foundation.js';

export const courseRegistry = Object.freeze({
  [llmFoundation.id]: llmFoundation,
});

export function getCourse(moduleId, registry = courseRegistry) {
  if (typeof moduleId !== 'string') return null;
  if (registry instanceof Map) return registry.get(moduleId) ?? null;
  return registry && Object.hasOwn(registry, moduleId) ? registry[moduleId] : null;
}
