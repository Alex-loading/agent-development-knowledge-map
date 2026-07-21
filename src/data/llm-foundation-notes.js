import { llm01Note } from './llm-foundation-notes/llm-01.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const llmFoundationNotes = deepFreeze({ 'llm-01': llm01Note });
