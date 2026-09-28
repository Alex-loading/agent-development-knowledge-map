import { deepFreezeVisual } from './visual-contract.js';
import { evalScenes } from './evals-scenes.js';

export const evalVisuals = deepFreezeVisual(evalScenes.map((scene) => ({
  id: scene.id, kind: 'diagram', role: scene.role, title: scene.title,
  alt: `${scene.title}。${scene.conclusion}`,
  longDescription: [
    scene.question,
    scene.panels ? `从左到右：${scene.panels.map((panel) => panel.join('：')).join('；')}。` : '',
    scene.form === 'table' ? `列从左到右为${scene.columns.join('、')}。${scene.rows.map((row) => row.join('：')).join('；')}。` : '',
    scene.form === 'bars' ? `每行深绿色为基线，赭色为候选。${scene.rows.map(([label, a, b]) => `${label}：${(a * 100).toFixed(1)}% → ${(b * 100).toFixed(1)}%`).join('；')}。` : '',
    scene.conclusion,
  ].filter(Boolean).join(' '),
  caption: `${scene.conclusion} 原创教学图解；示例与门槛仅用于说明课程中的判断。`,
  assetPath: `assets/visuals/evals-observability-security/${scene.id.replace('visual-', '')}.svg`,
  width: 1120, height: 660, provenance: 'original-synthesis',
  sourceIds: scene.sourceIds, credit: 'Agent Learner 原创教学图解', permission: null,
  verifiedAt: '2026-09-18', tags: ['relationship', 'failure-mode'],
})));
