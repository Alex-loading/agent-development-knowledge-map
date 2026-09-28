import { deepFreeze } from './multi-agent-shared.js';
import { ma01Note } from './multi-agent-notes/ma-01.js';
import { ma02Note } from './multi-agent-notes/ma-02.js';
import { ma03Note } from './multi-agent-notes/ma-03.js';
import { ma04Note } from './multi-agent-notes/ma-04.js';
import { ma05Note } from './multi-agent-notes/ma-05.js';
import { ma06Note } from './multi-agent-notes/ma-06.js';
import { ma07Note } from './multi-agent-notes/ma-07.js';
import { ma08Note } from './multi-agent-notes/ma-08.js';

export const multiAgentNotes = deepFreeze({
  'ma-01': ma01Note, 'ma-02': ma02Note, 'ma-03': ma03Note, 'ma-04': ma04Note,
  'ma-05': ma05Note, 'ma-06': ma06Note, 'ma-07': ma07Note, 'ma-08': ma08Note,
});
