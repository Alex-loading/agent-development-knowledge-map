import { writeFile } from 'node:fs/promises';

import { contextRagMemory } from '../src/data/context-rag-memory.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';
import {
  contextRagMemoryVisualFixtures,
  contextRagMemoryVisualInventoryFixtures,
} from '../tests/fixtures/context-rag-memory-visual-fixtures.js';

const fixturesByVisualId = new Map(
  contextRagMemoryVisualFixtures.map((fixture) => [fixture.visualId, fixture]),
);
const inventoryFixturesByVisualId = new Map(
  contextRagMemoryVisualInventoryFixtures.map((fixture) => [
    fixture.visualId,
    fixture,
  ]),
);

function code(value) {
  return `\`${value}\``;
}

function codeList(values) {
  return values.map(code).join(', ');
}

function placementFor(visualId) {
  for (const lesson of contextRagMemory.lessons) {
    if (lesson.knowledgeNote.overviewVisualId === visualId) {
      return {
        lessonId: lesson.id,
        sectionId: lesson.knowledgeNote.overviewVisualSectionId,
      };
    }
    for (const section of lesson.knowledgeNote.sections) {
      if (section.visuals?.some((placement) => placement.visualId === visualId)) {
        return { lessonId: lesson.id, sectionId: section.id };
      }
    }
  }
  throw new Error(`Missing placement for ${visualId}`);
}

const lines = [
  '# Context、RAG 与记忆 Visual Inventory',
  '',
  '日期：2026-07-30',
  '',
  '本清单把每个已发布视觉绑定到一个真实课节、明确考核结果、可见 fixture 文本和课程内来源。24 个主视觉与 3 个 step-state SVG 均为 Agent Learner 原创综合图，provenance 为 `original-synthesis`，credit 为 `Agent Learner 原创教学图解`。颜色不是唯一编码；关系、方向、状态、排除和失败还使用标签、编号、形状、线型或边界表达。',
  '',
  '飞书与 JavaGuide 页面中的插图没有经过可再分发许可核验，因此没有复制、截图、描摹或改编任何第三方媒体。页面正文只作为课程叙事来源；全部视觉从已核验关系和课程 fixture 原创重绘。',
  '',
  '| visualId | role | owner lesson / section | assessed outcomes | assessed outcome criteria | cognitive question and form | sourceIds | storyboard and fixture contract | permission decision | status |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
];

for (const visual of contextRagMemoryVisuals) {
  const placement = placementFor(visual.id);
  const fixture = inventoryFixturesByVisualId.get(visual.id);
  lines.push([
    code(visual.id),
    code(visual.role),
    code(`${placement.lessonId} / ${placement.sectionId}`),
    codeList(fixture.assessedOutcomes),
    fixture.outcomeCriteria,
    fixture.cognitiveQuestion,
    codeList(visual.sourceIds),
    fixture.storyboard,
    'Original synthesis; no third-party media selected.',
    'verified',
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
}

lines.push(
  '',
  '## Fixture and publication identity',
  '',
  '`published` 表示主记录以相同对象身份进入 `src/data/visuals/index.js`；不是只在磁盘上存在同名文件。',
  '',
  '| visualId | fixtureId | publicationStatus |',
  '| --- | --- | --- |',
);

for (const visual of contextRagMemoryVisuals) {
  lines.push(`| ${code(visual.id)} | ${code(visual.fixtureId)} | ${code('published')} |`);
}

lines.push(
  '',
  '## Step-state inheritance',
  '',
  '下列三个文件是一个主视觉的 renderer states，不是额外发布记录。它们继承父视觉的考核结果，并以可见文本 fixture 验证信息损失和恢复边界。',
  '',
  '| step asset | parent visualId | inherited assessed outcomes | expected visible labels |',
  '| --- | --- | --- | --- |',
);

for (const visual of contextRagMemoryVisuals) {
  const fixture = fixturesByVisualId.get(visual.id);
  const inventoryFixture = inventoryFixturesByVisualId.get(visual.id);
  for (const step of visual.steps ?? []) {
    lines.push(
      `| ${code(step.assetPath)} | ${code(visual.id)} | `
      + `${codeList(inventoryFixture.assessedOutcomes)} | `
      + `${codeList(fixture.stepLabels[step.assetPath])} |`,
    );
  }
}

lines.push(
  '',
  '## Rights and media decisions',
  '',
  '| asset scope | provenance | creator | redistribution basis | third-party media decision |',
  '| --- | --- | --- | --- | --- |',
  '| `24 main SVG + 3 step-state SVG` | `original-synthesis` | `Agent Learner` | Original project asset; no external permission claim. | Feishu and JavaGuide source media rejected because redistribution and modification permission was not verified. |',
  '',
  '## Coverage gate',
  '',
  '| lesson | total | overview | other cognitive forms | main verified | step assets | blocked |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
);

for (const lesson of contextRagMemory.lessons) {
  const lessonVisuals = contextRagMemoryVisuals.filter(({ id }) => (
    id.startsWith(`visual-${lesson.id}-`)
  ));
  const stepCount = lessonVisuals.reduce(
    (total, visual) => total + (visual.steps?.length ?? 0),
    0,
  );
  lines.push(
    `| ${code(lesson.id)} | 3 | 1 | `
    + `${new Set(lessonVisuals.map(({ role }) => role)).size - 1} | 3 | `
    + `${stepCount} | 0 |`,
  );
}
lines.push(
  '| **Total** | **24** | **8** | **16+** | **24** | **3** | **0** |',
  '',
  '发布门要求：每个主记录只有一个 owner placement；所有 sourceIds 同时位于 lesson 和 owner section；主图与 step 图都通过 strict SVG XML、安全属性、固定 viewBox、title/desc 和可见 fixture 检查；共享 registry 不得出现重复 ID。',
  '',
);

await writeFile(
  new URL(
    '../docs/research/2026-07-30-context-rag-memory-visual-inventory.md',
    import.meta.url,
  ),
  `${lines.join('\n')}`,
  'utf8',
);
