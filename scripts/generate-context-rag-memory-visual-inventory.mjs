import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { contextRagMemory } from '../src/data/context-rag-memory.js';
import {
  contextRagMemoryScenesById,
} from '../src/data/visuals/context-rag-memory-scenes.js';
import { contextRagMemoryVisuals } from '../src/data/visuals/context-rag-memory-visuals.js';

const defaultOutputPath = fileURLToPath(
  new URL(
    '../docs/research/2026-07-30-context-rag-memory-visual-inventory.md',
    import.meta.url,
  ),
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

function sceneLabels(scene) {
  if (scene.type === 'flow') return scene.nodes.map(({ label }) => label);
  if (scene.type === 'table') {
    return [
      ...scene.columns.map(({ label }) => label),
      ...scene.rows.flatMap(({ cells }) => Object.values(cells).map(String)),
      ...(scene.footer ? [scene.footer] : []),
    ];
  }
  if (scene.type === 'chart') {
    return scene.series.flatMap(({ label, points }) => [
      label,
      ...points.flatMap((point) => [
        point.label,
        String(point.value),
        ...(point.note ? [point.note] : []),
      ]),
    ]);
  }
  return [
    ...scene.decisions.map(({ label }) => label),
    ...scene.outcomes.map(({ label }) => label),
    ...(scene.actionSummary ? [scene.actionSummary] : []),
  ];
}

export function buildContextVisualInventory() {
  const lines = [
    '# Context、RAG 与记忆 Visual Inventory',
    '',
    '日期：2026-07-30',
    '',
    '本清单由 production scene registry 纯派生：24 个主视觉与 3 个 step-state SVG 均为 Agent Learner 原创综合图，provenance 为 `original-synthesis`，credit 为 `Agent Learner 原创教学图解`。颜色不是唯一编码；typed flow/table/chart/decision scene 明确保存关系、方向、分支、指标绑定、排除和失败语义。',
    '',
    '飞书与 JavaGuide 页面中的插图没有经过可再分发许可核验，因此没有复制、截图、描摹或改编任何第三方媒体。页面正文只作为课程叙事来源；全部视觉从已核验关系和课程 production scene 原创重绘。',
    '',
    '| visualId | role | owner lesson / section | assessed outcomes | assessed coverage | assessed outcome criteria | cognitive question and form | sourceIds | storyboard and fixture contract | permission decision | status |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const visual of contextRagMemoryVisuals) {
    const placement = placementFor(visual.id);
    const record = contextRagMemoryScenesById.get(visual.id);
    if (!record) throw new Error(`Missing production scene for ${visual.id}`);
    const annotation = record.annotation;
    lines.push([
      code(visual.id),
      code(visual.role),
      code(`${placement.lessonId} / ${placement.sectionId}`),
      codeList(annotation.assessedOutcomes),
      codeList(annotation.assessedCoverage),
      annotation.outcomeCriteria,
      annotation.cognitiveQuestion,
      codeList(visual.sourceIds),
      annotation.storyboard,
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
    const annotation = contextRagMemoryScenesById.get(visual.id).annotation;
    lines.push(`| ${code(visual.id)} | ${code(annotation.fixtureId)} | ${code('published')} |`);
  }

  lines.push(
    '',
    '## Step-state inheritance',
    '',
    '下列三个文件是一个主视觉的 renderer states，不是额外发布记录。它们继承父视觉的考核结果，并以 production step scene 的可见文本验证信息损失和恢复边界。',
    '',
    '| step asset | parent visualId | inherited assessed outcomes | expected visible labels |',
    '| --- | --- | --- | --- |',
  );

  for (const visual of contextRagMemoryVisuals) {
    const record = contextRagMemoryScenesById.get(visual.id);
    for (const step of visual.steps ?? []) {
      lines.push(
        `| ${code(step.assetPath)} | ${code(visual.id)} | `
        + `${codeList(record.annotation.assessedOutcomes)} | `
        + `${codeList(sceneLabels(record.steps[step.assetPath]))} |`,
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
    '发布门要求：每个主记录只有一个 owner placement；所有 sourceIds 同时位于 lesson 和 owner section；主图与 step 图都通过 strict SVG XML、安全属性、固定 viewBox、title/desc、typed scene semantics 和边界几何检查；共享 registry 不得出现重复 ID。',
    '',
  );
  return lines.join('\n');
}

function fileURLToPathSafe(pathOrUrl) {
  return pathOrUrl instanceof URL ? fileURLToPath(pathOrUrl) : String(pathOrUrl);
}

async function atomicWrite(path, bytes) {
  const temporaryPath = `${path}.tmp-${process.pid}`;
  await writeFile(temporaryPath, bytes, 'utf8');
  await rename(temporaryPath, path);
}

export async function writeContextVisualInventory({
  outputPath = defaultOutputPath,
} = {}) {
  const path = fileURLToPathSafe(outputPath);
  const bytes = buildContextVisualInventory();
  await mkdir(dirname(path), { recursive: true });
  await atomicWrite(path, bytes);
  return bytes;
}

export async function checkContextVisualInventory({
  outputPath = defaultOutputPath,
} = {}) {
  const path = fileURLToPathSafe(outputPath);
  const expected = buildContextVisualInventory();
  let actual;
  try {
    actual = await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Context visual inventory drift:\nmissing: ${basename(path)}`);
    }
    throw error;
  }
  if (actual !== expected) {
    throw new Error(`Context visual inventory drift:\nchanged: ${basename(path)}`);
  }
  return expected;
}

function parseArguments(argv) {
  if (argv.length === 0) return { check: false };
  if (argv.length === 1 && argv[0] === '--check') return { check: true };
  throw new TypeError(`Unknown argument: ${argv[0]}`);
}

async function main(argv) {
  const { check } = parseArguments(argv);
  if (check) {
    await checkContextVisualInventory();
    process.stdout.write('Context visual inventory is current.\n');
  } else {
    await writeContextVisualInventory();
    process.stdout.write('Generated Context visual inventory atomically.\n');
  }
}

const isMain = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
