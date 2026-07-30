import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

import { agentHarnessVisuals } from '../src/data/visuals/agent-harness-visuals.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';
import { knowledgeVisuals } from '../src/data/visuals/index.js';
import { llmFoundationVisuals } from '../src/data/visuals/llm-foundation-visuals.js';

test('README derives current per-module visual publication truth from registries and assets', async () => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const harnessSvgFiles = (await readdir(
    new URL('../assets/visuals/agent-harness/', import.meta.url),
  )).filter((name) => name.endsWith('.svg'));
  const contextSvgFiles = (await readdir(
    new URL('../assets/visuals/context-rag-memory/', import.meta.url),
  )).filter((name) => name.endsWith('.svg'));
  const registeredVisuals = [
    ...llmFoundationVisuals,
    ...agentHarnessVisuals,
    ...contextRagMemoryVisuals,
  ];

  assert.equal(llmFoundationVisuals.length, 40);
  assert.equal(agentHarnessVisuals.length, 24);
  assert.equal(contextRagMemoryVisuals.length, 24);
  assert.equal(harnessSvgFiles.length, 27);
  assert.equal(
    harnessSvgFiles.length - agentHarnessVisuals.length,
    3,
    'Harness has three additional step-state SVG files',
  );
  assert.equal(contextSvgFiles.length, 27);
  assert.equal(
    contextSvgFiles.length - contextRagMemoryVisuals.length,
    3,
    'Context has three additional compaction step-state SVG files',
  );
  assert.deepEqual(knowledgeVisuals, registeredVisuals);

  assert.match(
    readme,
    new RegExp(`LLM 基础[^\\n]*${llmFoundationVisuals.length} 张主视觉`),
  );
  assert.match(
    readme,
    new RegExp(
      `Agent Harness[^\\n]*${agentHarnessVisuals.length} 张主视觉`
      + `[^\\n]*${harnessSvgFiles.length} 个 SVG 文件[^\\n]*3 个分步状态`,
    ),
  );
  assert.match(
    readme,
    new RegExp(
      `上下文、RAG 与记忆[^\\n]*${contextRagMemoryVisuals.length} 张主视觉`
      + `[^\\n]*${contextSvgFiles.length} 个 SVG 文件[^\\n]*3 个分步状态`,
    ),
  );
  assert.match(
    readme,
    /Agent 机制与 AI 后端工程[^。\n]*尚未视觉化/,
  );
  assert.doesNotMatch(readme, /视觉教学当前只完成 LLM 基础试点/);
});
