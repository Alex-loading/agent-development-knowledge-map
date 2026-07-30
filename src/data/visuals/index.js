import { deepFreezeVisual } from './visual-contract.js';
import { agentHarnessVisuals } from './agent-harness-visuals.js';
import { contextRagMemoryVisuals } from './context-rag-memory-visuals.js';
import { llmFoundationVisuals } from './llm-foundation-visuals.js';

export const knowledgeVisuals = deepFreezeVisual([
  ...llmFoundationVisuals,
  ...agentHarnessVisuals,
  ...contextRagMemoryVisuals,
]);

const visualsById = Object.create(null);
for (const visual of knowledgeVisuals) {
  if (Object.hasOwn(visualsById, visual.id)) {
    throw new Error(`Duplicate knowledge visual ID: ${visual.id}`);
  }
  visualsById[visual.id] = visual;
}

export const knowledgeVisualsById = deepFreezeVisual(visualsById);
