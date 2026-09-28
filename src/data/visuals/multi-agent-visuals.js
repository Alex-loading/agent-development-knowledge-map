import { deepFreezeVisual } from './visual-contract.js';
import { ma01Visuals } from './multi-agent/ma-01.js';
import { ma02Visuals } from './multi-agent/ma-02.js';
import { ma03Visuals } from './multi-agent/ma-03.js';
import { ma04Visuals } from './multi-agent/ma-04.js';
import { ma05Visuals } from './multi-agent/ma-05.js';
import { ma06Visuals } from './multi-agent/ma-06.js';
import { ma07Visuals } from './multi-agent/ma-07.js';
import { ma08Visuals } from './multi-agent/ma-08.js';

export const multiAgentVisuals = deepFreezeVisual([
  ...ma01Visuals, ...ma02Visuals, ...ma03Visuals, ...ma04Visuals,
  ...ma05Visuals, ...ma06Visuals, ...ma07Visuals, ...ma08Visuals,
]);
