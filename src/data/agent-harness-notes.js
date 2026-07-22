import { harness01Note } from './agent-harness-notes/harness-01.js';
import { harness02Note } from './agent-harness-notes/harness-02.js';
import { harness03Note } from './agent-harness-notes/harness-03.js';
import { harness04Note } from './agent-harness-notes/harness-04.js';
import { harness05Note } from './agent-harness-notes/harness-05.js';
import { harness06Note } from './agent-harness-notes/harness-06.js';
import { harness07Note } from './agent-harness-notes/harness-07.js';
import { harness08Note } from './agent-harness-notes/harness-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export const agentHarnessNotes = deepFreeze({
  'harness-01': harness01Note,
  'harness-02': harness02Note,
  'harness-03': harness03Note,
  'harness-04': harness04Note,
  'harness-05': harness05Note,
  'harness-06': harness06Note,
  'harness-07': harness07Note,
  'harness-08': harness08Note,
});
