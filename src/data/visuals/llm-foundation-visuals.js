import { deepFreezeVisual } from './visual-contract.js';

export const llmFoundationVisuals = deepFreezeVisual([
  {
    id: 'visual-llm-01-field-map',
    kind: 'diagram',
    role: 'overview',
    tags: ['relationship', 'boundary'],
    title: 'AI、机器学习、深度学习、生成式 AI 与 LLM 的双轴关系',
    alt: '双轴图显示方法包含关系与生成能力分类在 LLM 处交叉，并列出非学习 AI 和非语言深度学习反例。',
    longDescription: '图先定义两条轴：方法轴用嵌套框表示 AI 包含机器学习、机器学习包含深度学习；生成能力轴横向穿过这些方法类别。LLM 位于深度学习与语言生成的交叉处。图末用搜索、规划说明 AI 包含非学习方法，并用视觉、语音说明深度学习或生成模型不只处理语言，因此 AI、深度学习、生成式 AI 与 LLM 不能压成一条同义嵌套链。',
    caption: 'LLM 通常是深度学习实现的语言生成模型，但 AI、深度学习和生成式 AI 不能压成一条同义链。',
    assetPath: 'assets/visuals/llm-foundation/llm-01-field-map.svg',
    width: 1200,
    height: 675,
    provenance: 'original-synthesis',
    sourceIds: ['res-ms-ai', 'res-ms-genai', 'res-hf-llm'],
    credit: 'Agent Learner 原创教学图解',
    permission: null,
    verifiedAt: '2026-07-26',
  },
]);
