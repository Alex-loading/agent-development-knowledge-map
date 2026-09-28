import { eval01Note } from './evals-notes/eval-01.js';
import { eval02Note } from './evals-notes/eval-02.js';
import { eval03Note } from './evals-notes/eval-03.js';
import { eval04Note } from './evals-notes/eval-04.js';
import { eval05Note } from './evals-notes/eval-05.js';
import { eval06Note } from './evals-notes/eval-06.js';
import { eval07Note } from './evals-notes/eval-07.js';
import { eval08Note } from './evals-notes/eval-08.js';
import { deepFreeze } from './evals-shared.js';

export const evalsNotes = deepFreeze({
  'eval-01': eval01Note,
  'eval-02': eval02Note,
  'eval-03': eval03Note,
  'eval-04': eval04Note,
  'eval-05': eval05Note,
  'eval-06': eval06Note,
  'eval-07': eval07Note,
  'eval-08': eval08Note,
});
