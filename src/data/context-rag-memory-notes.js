import { context01Note } from './context-rag-memory-notes/context-01.js';
import { context02Note } from './context-rag-memory-notes/context-02.js';
import { context03Note } from './context-rag-memory-notes/context-03.js';
import { context04Note } from './context-rag-memory-notes/context-04.js';
import { context05Note } from './context-rag-memory-notes/context-05.js';
import { context06Note } from './context-rag-memory-notes/context-06.js';
import { context07Note } from './context-rag-memory-notes/context-07.js';
import { context08Note } from './context-rag-memory-notes/context-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export const contextRagMemoryNotes = deepFreeze({
  'context-01': context01Note,
  'context-02': context02Note,
  'context-03': context03Note,
  'context-04': context04Note,
  'context-05': context05Note,
  'context-06': context06Note,
  'context-07': context07Note,
  'context-08': context08Note,
});
