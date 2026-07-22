import { agent01Note } from './agent-mechanism-notes/agent-01.js';
import { agent02Note } from './agent-mechanism-notes/agent-02.js';
import { agent03Note } from './agent-mechanism-notes/agent-03.js';
import { agent04Note } from './agent-mechanism-notes/agent-04.js';
import { agent05Note } from './agent-mechanism-notes/agent-05.js';
import { agent06Note } from './agent-mechanism-notes/agent-06.js';
import { agent07Note } from './agent-mechanism-notes/agent-07.js';
import { agent08Note } from './agent-mechanism-notes/agent-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export const agentMechanismNotes = deepFreeze({
  'agent-01': agent01Note,
  'agent-02': agent02Note,
  'agent-03': agent03Note,
  'agent-04': agent04Note,
  'agent-05': agent05Note,
  'agent-06': agent06Note,
  'agent-07': agent07Note,
  'agent-08': agent08Note,
});
