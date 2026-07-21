import { llm01Note } from './llm-foundation-notes/llm-01.js';
import { llm02Note } from './llm-foundation-notes/llm-02.js';
import { llm03Note } from './llm-foundation-notes/llm-03.js';
import { llm04Note } from './llm-foundation-notes/llm-04.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export const llmFoundationNotes = deepFreeze({
  'llm-01': llm01Note,
  'llm-02': llm02Note,
  'llm-03': llm03Note,
  'llm-04': llm04Note,
});
