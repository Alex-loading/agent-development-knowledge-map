import { backend01Note } from './backend-engineering-notes/backend-01.js';
import { backend02Note } from './backend-engineering-notes/backend-02.js';
import { backend03Note } from './backend-engineering-notes/backend-03.js';
import { backend04Note } from './backend-engineering-notes/backend-04.js';
import { backend05Note } from './backend-engineering-notes/backend-05.js';
import { backend06Note } from './backend-engineering-notes/backend-06.js';
import { backend07Note } from './backend-engineering-notes/backend-07.js';
import { backend08Note } from './backend-engineering-notes/backend-08.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const backendEngineeringNotes = deepFreeze({
  'backend-01': backend01Note,
  'backend-02': backend02Note,
  'backend-03': backend03Note,
  'backend-04': backend04Note,
  'backend-05': backend05Note,
  'backend-06': backend06Note,
  'backend-07': backend07Note,
  'backend-08': backend08Note,
});
