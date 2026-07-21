import { llm01Note } from './llm-foundation-notes/llm-01.js';
import { llm02Note } from './llm-foundation-notes/llm-02.js';
import { llm03Note } from './llm-foundation-notes/llm-03.js';
import { llm04Note } from './llm-foundation-notes/llm-04.js';
import { llm05Note } from './llm-foundation-notes/llm-05.js';
import { llm06Note } from './llm-foundation-notes/llm-06.js';
import { llm07Note } from './llm-foundation-notes/llm-07.js';
import { llm08Note } from './llm-foundation-notes/llm-08.js';

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
  'llm-05': llm05Note,
  'llm-06': llm06Note,
  'llm-07': llm07Note,
  'llm-08': llm08Note,
});
