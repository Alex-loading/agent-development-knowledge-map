import { deepFreezeVisual } from './visual-contract.js';

export const llmFoundationVisuals = deepFreezeVisual([
  {
    id: 'visual-llm-01-field-map',
    kind: 'diagram',
    role: 'overview',
    tags: ['relationship', 'boundary'],
    title: 'AI、机器学习、深度学习、生成式 AI 与 LLM 的双轴关系',
    alt: 'AI 外框内有方法轴与生成能力轴两个面板：左侧显示机器学习包含深度学习，并把搜索规划放在机器学习外；右侧并列语言与图像音频生成，LLM 通过连线关联深度学习和语言生成。',
    longDescription: '整张图由人工智能 AI 外框包围。左侧方法轴中，机器学习框位于 AI 内，深度学习框位于机器学习内；搜索与规划位于 AI 内但在机器学习外，说明 AI 还包含非学习方法。右侧生成能力轴中，生成式 AI 虚线框包含语言生成和图像音频生成；LLM 位于语言生成区域，并用明确连线连接左侧深度学习。视觉与语音标签位于深度学习中但不属于 LLM，说明深度学习不只处理语言。底部图例用实线、虚线和斜线阴影分别表示方法包含、生成能力与两轴交叉。',
    caption: 'AI 覆盖两条分类轴：LLM 连接深度学习与语言生成，但 AI、深度学习和生成式 AI 不是一条同义嵌套链。',
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
