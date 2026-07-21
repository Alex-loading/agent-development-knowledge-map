# LLM 基础全模块知识笔记 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `llm-02` 至 `llm-08` 制作为来源可追溯、站内可独立学习的中文知识笔记，使 LLM 基础八课形成统一主教材，并在完整验收后部署到 GitHub Pages。

**Architecture:** 每课笔记保存在独立纯数据模块中，由 `src/data/llm-foundation-notes.js` 统一导入、递归冻结并保持原公共导入路径；`src/data/llm-foundation.js` 只负责课程事实、28 份资源证据卡和八课接线。研究与起草按两轮分配给互不写同一文件的子代理，主代理集中合并资源证据、覆盖审计、跨课术语与最终发布。

**Tech Stack:** 原生 ES Modules、Node.js `node:test`、项目 fake DOM、项目级 `build-learning-module-notes` Skill、官方/原始资料检索、GitHub CLI、GitHub Pages

---

## 文件结构

```text
src/data/llm-foundation-notes/
  llm-01.js                                  原样迁移已发布的第一课笔记
  llm-02.js                                  神经网络与反向传播
  llm-03.js                                  Token、Embedding 与上下文
  llm-04.js                                  Attention 与 Transformer
  llm-05.js                                  预训练、微调与对齐
  llm-06.js                                  推理、采样与 KV Cache
  llm-07.js                                  Prompt 与结构化输出
  llm-08.js                                  能力边界、评测与安全
src/data/llm-foundation-notes.js             八课汇总与递归冻结
src/data/llm-foundation.js                   八课接线与 28 份资源 evidence card
tests/data.test.js                           八课结构、篇幅、引用、证据与冻结契约
tests/guided-ui.test.js                      多课长文渲染、来源与旧模块 fallback
docs/content-audits/
  2026-07-22-llm-foundation-knowledge-notes.md  来源访问、覆盖矩阵、质量与测试审计
README.md                                    把“第一课试点”更新为“LLM 模块已完成”
```

不修改 `src/ui/knowledge-note.js`、`src/ui/curriculum.js` 或 `styles/app.css`，除非真实浏览器验收或现有回归测试证明存在通用缺陷；不得为任何 `llm-*` ID 添加 UI 特判。

## Task 1：先把试点契约改成八课发布契约

**Files:**
- Modify: `tests/data.test.js`
- Modify: `tests/guided-ui.test.js`

- [ ] **Step 1：抽取八课笔记规格常量**

在 `expectedLessonIds` 后加入实际发布规格：

```js
const noteExpectations = new Map([
  ['llm-01', { minMinutes: 20, maxMinutes: 30, minLength: 3000 }],
  ['llm-02', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['llm-03', { minMinutes: 25, maxMinutes: 30, minLength: 3600 }],
  ['llm-04', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-05', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-06', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
  ['llm-07', { minMinutes: 35, maxMinutes: 40, minLength: 3600 }],
  ['llm-08', { minMinutes: 30, maxMinutes: 40, minLength: 4800 }],
]);

const validAuthorities = new Set(['official', 'academic', 'expert', 'community']);
const validRoles = new Set(['core', 'cross-check', 'extension']);
```

- [ ] **Step 2：将第一课专用知识笔记测试改为八课循环测试**

测试逐课断言：笔记存在；阅读分钟落入对应区间；实质章节为 5–7；章节 ID 唯一且为 kebab-case；每节有 2–4 个至少 60 字的段落、至少 2 个 key point、至少一个可解析且属于该课的 source ID；正文不短于 `minLength` 且不长于 9000 字符；误区为 4–6 个；recap 至少 5 条；导语和 nextStep 非空。核心循环写成：

```js
test('all LLM lessons provide source-grounded long-form knowledge notes', () => {
  assert.deepEqual(
    llmFoundation.lessons.filter(({ knowledgeNote }) => knowledgeNote).map(({ id }) => id),
    expectedLessonIds,
  );

  for (const lesson of llmFoundation.lessons) {
    const note = lesson.knowledgeNote;
    const expectation = noteExpectations.get(lesson.id);
    const lessonResourceIds = new Set(lesson.resourceIds);
    const sectionIds = note.sections.map(({ id }) => id);
    const bodyLength = note.introduction.length
      + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length
      + note.nextStep.length;

    assert.ok(note.readingMinutes >= expectation.minMinutes, lesson.id);
    assert.ok(note.readingMinutes <= expectation.maxMinutes, lesson.id);
    assert.ok(note.sections.length >= 5 && note.sections.length <= 7, lesson.id);
    assert.equal(new Set(sectionIds).size, sectionIds.length, lesson.id);
    assert.ok(bodyLength >= expectation.minLength && bodyLength <= 9000, `${lesson.id}: ${bodyLength}`);
    assert.ok(note.misconceptions.length >= 4 && note.misconceptions.length <= 6, lesson.id);
    assert.ok(note.recap.length >= 5, lesson.id);

    for (const section of note.sections) {
      assert.match(section.id, /^[a-z0-9-]+$/, lesson.id);
      assert.ok(section.paragraphs.length >= 2 && section.paragraphs.length <= 4, section.id);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 60), section.id);
      assert.ok(section.keyPoints.length >= 2, section.id);
      assert.ok(section.sourceIds.length >= 1, section.id);
      assert.ok(section.sourceIds.every((id) => lessonResourceIds.has(id)), section.id);
    }
  }
});
```

- [ ] **Step 3：将第一课来源卡测试改为 28 份资源全量测试**

逐项断言 `authority`、`role`、非空 `coverage`、至少 15 字的 `limitations`；每课的每个 `sourceId` 同时存在于课程资源表和该课 `resourceIds`。删除“只有 llm-01 有 knowledgeNote”的旧试点测试，保留并加强其他三个 active 模块拥有 `explanations` fallback 且没有 `knowledgeNote` 的检查。

- [ ] **Step 4：扩展递归冻结测试**

遍历八课笔记及其 sections、paragraphs、keyPoints、sourceIds、misconceptions、recap，全部断言 `Object.isFrozen`；尝试修改 `llm-08` 的 recap 和任一 evidence coverage 均应抛出 `TypeError`。

- [ ] **Step 5：增加第二课与第八课 UI 验收测试**

复用 `renderLessonDetail`，分别渲染 `llm-02` 与 `llm-08`，断言存在 `.knowledge-note`、目录按钮数量等于章节数量、来源链接带 `_blank` 和 `noopener noreferrer`、资源区标题为“继续深挖”，且没有 `.data-diagnostic`。再渲染 `agent-01`，断言仍显示旧解释且不存在 `.knowledge-note`。

- [ ] **Step 6：运行 RED 测试**

Run: `node --test tests/data.test.js tests/guided-ui.test.js`

Expected: FAIL；失败原因应是 `llm-02` 至 `llm-08` 尚无 `knowledgeNote`、21 份未迁移资源尚无 evidence card，而不是测试语法或 fixture 错误。

- [ ] **Step 7：提交 RED 契约**

```bash
git add tests/data.test.js tests/guided-ui.test.js
git commit -m "test: require complete LLM knowledge notes"
```

## Task 2：拆分第一课并建立八课汇总入口

**Files:**
- Create: `src/data/llm-foundation-notes/llm-01.js`
- Modify: `src/data/llm-foundation-notes.js`
- Modify: `src/data/llm-foundation.js`

- [ ] **Step 1：原样迁移第一课数据**

把当前 `src/data/llm-foundation-notes.js` 中 `sections`、`misconceptions` 和 `knowledgeNote` 的字段值原样移动到 `src/data/llm-foundation-notes/llm-01.js`，仅把末尾导出改为：

```js
export const llm01Note = {
  readingMinutes: 25,
  introduction,
  sections,
  misconceptions,
  recap,
  nextStep,
};
```

为了保证内容语义不变，可以保留文件内局部常量；不要在单课文件中导入 UI、访问 DOM 或发起请求。

- [ ] **Step 2：实现递归冻结的聚合器**

将 `src/data/llm-foundation-notes.js` 改成：

```js
import { llm01Note } from './llm-foundation-notes/llm-01.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const llmFoundationNotes = deepFreeze({
  'llm-01': llm01Note,
});
```

后续任务只在 import 和 map 中追加新课；不得改变 `llm-foundation.js` 的公共导入路径。

- [ ] **Step 3：保持第一课接线并运行现有回归**

确认 `llm-01` 仍使用 `knowledgeNote: llmFoundationNotes['llm-01']`，运行：

Run: `node --test tests/data.test.js --test-name-pattern="LLM first lesson|deeply frozen"`

Expected: 旧第一课内容和冻结行为仍通过；全量八课 RED 仍失败。

- [ ] **Step 4：提交结构迁移**

```bash
git add src/data/llm-foundation-notes.js src/data/llm-foundation-notes/llm-01.js src/data/llm-foundation.js
git commit -m "refactor: split LLM knowledge note data"
```

## Task 3：第一轮研究与制作 `llm-02`、`llm-03`、`llm-04`

**Files:**
- Create: `src/data/llm-foundation-notes/llm-02.js`
- Create: `src/data/llm-foundation-notes/llm-03.js`
- Create: `src/data/llm-foundation-notes/llm-04.js`
- Modify: `src/data/llm-foundation-notes.js`
- Modify: `src/data/llm-foundation.js`
- Create: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`

- [ ] **Step 1：分派三个互斥的子代理任务**

分别让三个子代理只负责一课的研究报告与单课文件，不允许修改 `src/data/llm-foundation.js`、聚合器、测试或共同审计文档。每个代理必须读取该课全部课程字段、面试题和真实 resource registry，逐一访问该课关联来源正文，返回：访问状态、可支撑主题、限制、知识依赖、逐项覆盖矩阵、建议 evidence card、质量自评和文件改动。

三个文件采用以下教学骨架：

- `llm-02`：训练闭环与张量形状；线性层与激活；损失与代理目标；计算图、链式法则与反向传播；优化器、学习率与清梯度；泛化与训练诊断；二分类参数更新练习。
- `llm-03`：token 与 tokenizer；ID 到 embedding；位置表示；上下文窗口与输入/输出共同预算；截断、摘要与检索取舍；客服 Agent token 预算实验。
- `llm-04`：输入表示与目标；Q/K/V 的查询—匹配—聚合；缩放点积和 softmax；多头分工；因果掩码；残差、归一化、前馈层与完整 decoder block；Attention 实验。

每篇使用 6–7 个实质章节、4–6 个误区、至少 5 个 recap；`llm-02`/`03` 为 25–30 分钟，`llm-04` 为 30–40 分钟。

- [ ] **Step 2：主代理核验第一轮来源结果**

逐项检查来源确实访问了正文，视频没有字幕或正文时必须为 `extension`；论文由 PDF/原始论文材料核验，普通机制优先官方教材或原始材料。主代理把三课所有 associated resources 的 evidence card 合并到 `src/data/llm-foundation.js`，只给实际重新访问的资源更新 `verifiedAt: '2026-07-22'`。

- [ ] **Step 3：接入三篇笔记**

聚合器追加：

```js
import { llm02Note } from './llm-foundation-notes/llm-02.js';
import { llm03Note } from './llm-foundation-notes/llm-03.js';
import { llm04Note } from './llm-foundation-notes/llm-04.js';

export const llmFoundationNotes = deepFreeze({
  'llm-01': llm01Note,
  'llm-02': llm02Note,
  'llm-03': llm03Note,
  'llm-04': llm04Note,
});
```

并在对应 lesson 对象中加入：

```js
knowledgeNote: llmFoundationNotes['llm-02'],
knowledgeNote: llmFoundationNotes['llm-03'],
knowledgeNote: llmFoundationNotes['llm-04'],
```

- [ ] **Step 4：记录第一轮审计**

在审计文档写入每课的来源访问表、全部 assessed outcomes 到 section ID 的覆盖矩阵、量表五项分数、总分、`brokenReferenceCount`、evidence role 修正和剩余限制。三课都必须总分至少 85、断链为 0；项目已发生变更，tests 只能记录实际运行后的 `passed` 或 `failed`。

- [ ] **Step 5：运行第一轮数据测试**

Run: `node --test tests/data.test.js tests/guided-ui.test.js`

Expected: `llm-02` 至 `llm-04` 的结构、引用、证据、冻结和 UI 断言通过；测试套件仍因 `llm-05` 至 `llm-08` 未接入而保持 RED。

- [ ] **Step 6：提交第一轮内容**

```bash
git add src/data/llm-foundation-notes/llm-02.js src/data/llm-foundation-notes/llm-03.js src/data/llm-foundation-notes/llm-04.js src/data/llm-foundation-notes.js src/data/llm-foundation.js docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md
git commit -m "feat: add first wave LLM knowledge notes"
```

## Task 4：交叉审查第一轮内容

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-02.js`
- Modify: `src/data/llm-foundation-notes/llm-03.js`
- Modify: `src/data/llm-foundation-notes/llm-04.js`
- Modify: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`

- [ ] **Step 1：分派未参与写作的规格审查代理**

让新代理只读设计、计划、三篇笔记、课程字段和审计，按 objective、concept、quiz、三道 interview 及 follow-up、exercise、deliverable、completion criteria 逐项找缺口；检查 6–7 节顺序、篇幅和相邻课程边界。代理只报告，不编辑文件。

- [ ] **Step 2：分派未参与写作的内容质量审查代理**

让另一新代理核对正文主张是否由 section `sourceIds` 和 evidence coverage 支撑，检查视频/PDF限制、版本与实现边界、术语首次定义、误区的因果纠正、重复段落和版权风险。代理只报告，不编辑文件。

- [ ] **Step 3：主代理修正所有高、中优先级问题**

高优先级包括断链、关键结论无证据、课程产出缺失、错误机制和来源正文未访问；中优先级包括重复、边界不清、练习无法按正文完成和术语未定义。修正后同步审计分数和限制，不通过降低长度或删除考核项来消除失败。

- [ ] **Step 4：运行第一轮定向检查并提交**

Run: `node --check src/data/llm-foundation-notes/llm-02.js && node --check src/data/llm-foundation-notes/llm-03.js && node --check src/data/llm-foundation-notes/llm-04.js`

Expected: 三条语法检查 exit code 0。

```bash
git add src/data/llm-foundation-notes/llm-02.js src/data/llm-foundation-notes/llm-03.js src/data/llm-foundation-notes/llm-04.js docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md
git commit -m "docs: refine first wave LLM notes"
```

## Task 5：第二轮研究与制作 `llm-05`、`llm-06`

**Files:**
- Create: `src/data/llm-foundation-notes/llm-05.js`
- Create: `src/data/llm-foundation-notes/llm-06.js`
- Modify: `src/data/llm-foundation-notes.js`
- Modify: `src/data/llm-foundation.js`
- Modify: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`

- [ ] **Step 1：并行分派两课研究和单文件起草**

两个代理继续遵守 Task 3 的互斥写入与审计输出规则。章节骨架固定为：

- `llm-05`：预训练目标；SFT；偏好数据与偏好优化边界；全量微调与 LoRA/PEFT；数据质量、切分与回归；RAG、prompt、工具、微调的决策矩阵；三个业务需求练习。
- `llm-06`：logits 与 softmax；temperature；top-p 与组合采样；stop 和结构终止；prefill 与 decode；KV Cache 的复用、内存和并发代价；三类任务采样实验与服务权衡。

两篇均为 30–40 分钟、6–7 个实质章节、4–6 个误区、至少 5 个 recap。

- [ ] **Step 2：主代理核验并合并来源证据**

`res-openai-cookbook` 必须通过 OpenAI 官方资料路径核验；`res-zomi-bili` 沿用“无正文、不支撑关键事实”的 extension 限制，除非本轮确实取得可核验字幕。其他资料逐正文核验，不能把教程中的服务实现推广成所有模型的保证。

- [ ] **Step 3：接入两课并运行定向测试**

聚合器与 lesson 对象追加 `llm-05`、`llm-06`。运行：

Run: `node --test tests/data.test.js tests/guided-ui.test.js`

Expected: 新增两课通过自己的结构、引用、证据和冻结检查；总契约只剩 `llm-07`、`llm-08` 未完成。

- [ ] **Step 4：写入审计并提交**

两课审计都记录分数至少 85、断链 0、实际测试结果和剩余边界。

```bash
git add src/data/llm-foundation-notes/llm-05.js src/data/llm-foundation-notes/llm-06.js src/data/llm-foundation-notes.js src/data/llm-foundation.js docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md
git commit -m "feat: add training and inference knowledge notes"
```

## Task 6：第二轮研究与制作 `llm-07`、`llm-08`

**Files:**
- Create: `src/data/llm-foundation-notes/llm-07.js`
- Create: `src/data/llm-foundation-notes/llm-08.js`
- Modify: `src/data/llm-foundation-notes.js`
- Modify: `src/data/llm-foundation.js`
- Modify: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`

- [ ] **Step 1：并行分派两课研究和单文件起草**

章节骨架固定为：

- `llm-07`：prompt 是输入契约而非魔法；指令与不可信数据边界；少量代表性示例；Schema 与结构约束；解析、Schema、业务三层校验；有限重试、幂等与降级；工单分类器完整案例。
- `llm-08`：幻觉、非确定性、上下文污染与注入分类；从需求和失败日志建离线集；质量、忠实度、格式、安全指标；线上监控与反馈；prompt injection 纵深防御；成本与 P95 延迟门槛；退款答复发布清单。

`llm-07` 为 35–40 分钟，`llm-08` 为 30–40 分钟；两篇均 6–7 个实质章节、4–6 个误区、至少 5 个 recap。阅读量按复杂度浮动：`llm-07` 需要完整 Schema、三组规则可推导样例、category/priority 业务策略和逐分支控制流，因此不压缩为原先的短篇范围。

- [ ] **Step 2：主代理核验时敏与安全来源**

OpenAI Cookbook 与 OpenAI Evals 只使用官方 OpenAI 材料；OWASP 只支撑其安全指南明确写出的威胁与防御；Anthropic 文章只支撑该文章的 workflow/agent 工程建议；不得把任何厂商的结构化输出、评测框架或模型参数语义推广为通用保证。所有时敏实现语义记录 `verifiedAt: '2026-07-22'`。

- [ ] **Step 3：接入两课并把数据测试转为 GREEN**

聚合器最终包含 `llm-01` 至 `llm-08` 八项；`llm-foundation.js` 的八个 lesson 都显式接入对应笔记。

Run: `node --test tests/data.test.js tests/guided-ui.test.js`

Expected: 两个测试文件全部 PASS；八课笔记、28 份 evidence card、旧模块 fallback 和 UI 来源契约均满足。

- [ ] **Step 4：写入审计并提交**

```bash
git add src/data/llm-foundation-notes/llm-07.js src/data/llm-foundation-notes/llm-08.js src/data/llm-foundation-notes.js src/data/llm-foundation.js docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md
git commit -m "feat: complete LLM knowledge notes"
```

## Task 7：交叉审查第二轮并统一八课术语

**Files:**
- Modify: `src/data/llm-foundation-notes/llm-02.js`
- Modify: `src/data/llm-foundation-notes/llm-03.js`
- Modify: `src/data/llm-foundation-notes/llm-04.js`
- Modify: `src/data/llm-foundation-notes/llm-05.js`
- Modify: `src/data/llm-foundation-notes/llm-06.js`
- Modify: `src/data/llm-foundation-notes/llm-07.js`
- Modify: `src/data/llm-foundation-notes/llm-08.js`
- Modify: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`

- [ ] **Step 1：执行与第一轮相同的双重独立审查**

一名未参与写作的代理做规格覆盖审查，一名做来源和教学质量审查；报告必须覆盖第二轮四课，并额外检查 `llm-03`/`04`、`llm-04`/`06`、`llm-05`/`08` 的跨课重复和边界。

- [ ] **Step 2：主代理统一术语与 nextStep 链路**

全模块统一 `token`、`tokenizer`、`embedding`、`logits`、`prefill`、`decode`、`KV Cache`、`SFT`、`LoRA`、`RAG`、`Schema`、`Prompt Injection` 的首次中文解释与后续写法。逐课 `nextStep` 必须指向下一课的真实知识依赖；`llm-08` 的下一步连接 Agent 机制模块，不虚构第四模块资料。

- [ ] **Step 3：执行机械完整性扫描**

Run:

```bash
rg -n "T[B]D|T[O]DO|F[I]XME|待核验|占位|课程字段来源|course-fields-" src/data/llm-foundation-notes src/data/llm-foundation.js
```

Expected: 无输出；若确有仍需保留的不确定性，应写成明确 evidence limitation，而不是正文占位符。

- [ ] **Step 4：更新最终质量审计并提交**

审计文档最终必须列出八课分数均至少 85、`brokenReferenceCount: 0`、28/28 evidence cards、实际测试命令与结果、仍保留的来源限制。

```bash
git add src/data/llm-foundation-notes src/data/llm-foundation.js docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md
git commit -m "docs: audit complete LLM knowledge notes"
```

## Task 8：更新项目状态说明

**Files:**
- Modify: `README.md`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1：先写 README 状态失败测试**

把原来要求“第一课试点”的静态说明断言改成：README 必须说明 LLM 八课均有站内知识笔记、外部资料作为依据与扩展、其他三个 active 模块仍使用解释 fallback；同时禁止继续出现“这个试点目前只覆盖 `llm-01`”。

- [ ] **Step 2：运行 RED**

Run: `node --test tests/static-app.test.js`

Expected: FAIL，因为 README 仍宣称只覆盖第一课。

- [ ] **Step 3：更新 README**

将“LLM 基础第一课当前试点”段落改为：LLM 基础八课均以知识笔记作为站内主教材，学习资料用于依据、交叉核验和扩展；Agent 机制、Agent Harness、上下文/RAG/记忆仍由 `explanations` 提供站内讲解，尚未迁移为同等长文。架构段把单文件说明更新为 `src/data/llm-foundation-notes/` 加聚合入口。

- [ ] **Step 4：运行 GREEN 并提交**

Run: `node --test tests/static-app.test.js`

Expected: PASS。

```bash
git add README.md tests/static-app.test.js
git commit -m "docs: record complete LLM knowledge notes"
```

## Task 9：完整自动化验证与真实浏览器验收

**Files:**
- Modify: `docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md`
- Modify only if a real generic defect is found: `src/ui/knowledge-note.js`
- Modify only if a real generic defect is found: `styles/app.css`

- [ ] **Step 1：运行完整自动化验证**

Run: `npm test`

Expected: 全部测试 PASS，失败数为 0。

Run: `find src tests -name '*.js' -print0 | xargs -0 -n1 node --check`

Expected: 每个 JavaScript 文件 exit code 0，无语法错误。

Run: `git diff --check`

Expected: 无输出、exit code 0。

- [ ] **Step 2：启动本地静态服务器**

Run: `npm run serve`

Expected: `Serving HTTP on ... port 4173`，保持会话供浏览器验收。

- [ ] **Step 3：桌面逐路由验收八课**

依次打开：

```text
http://localhost:4173/#llm-foundation/lesson/llm-01
http://localhost:4173/#llm-foundation/lesson/llm-02
http://localhost:4173/#llm-foundation/lesson/llm-03
http://localhost:4173/#llm-foundation/lesson/llm-04
http://localhost:4173/#llm-foundation/lesson/llm-05
http://localhost:4173/#llm-foundation/lesson/llm-06
http://localhost:4173/#llm-foundation/lesson/llm-07
http://localhost:4173/#llm-foundation/lesson/llm-08
```

每页检查：导语、5–7 项目录、正文、依据链接、误区、回顾、下一步均可见；点击目录后对应标题获得焦点；无 `.data-diagnostic`；控制台无 error。

- [ ] **Step 4：390px 移动端与 fallback 验收**

把视口设为 390px，抽查 `llm-04`、`llm-06`、`llm-08` 无横向溢出，长 URL 和目录按钮可换行。再打开：

```text
http://localhost:4173/#agent-mechanism/lesson/agent-01
http://localhost:4173/#agent-harness/lesson/harness-01
http://localhost:4173/#context-rag-memory/lesson/context-01
```

三页应保留旧解释区、没有知识笔记，且控制台无 error。

- [ ] **Step 5：写入最终测试审计并提交修正**

把自动化命令、exit code、测试数量、浏览器路由与观察结果写入审计文档。若发现通用缺陷，先新增失败测试再修 renderer/CSS，并重跑完整验证。

```bash
git add docs/content-audits/2026-07-22-llm-foundation-knowledge-notes.md tests src styles README.md
git commit -m "test: verify complete LLM learning module"
```

若没有新变更，不创建空提交。

## Task 10：同步主分支、PR、合并与公开部署

**Files:**
- No new product files unless conflict resolution requires scoped edits

- [ ] **Step 1：检查工作树与提交范围**

Run: `git status --short && git log --oneline --decorate origin/main..HEAD`

Expected: 除安装产生且不应提交的 `package-lock.json` 外没有未解释文件；提交只包含规格、计划、知识笔记、证据、测试、审计和 README。

- [ ] **Step 2：同步最新 main**

Run: `git fetch origin && git rebase origin/main`

Expected: rebase 成功；若冲突，仅合并本任务文件并再次运行 `npm test`、语法检查与 `git diff --check`。

- [ ] **Step 3：推送功能分支并创建 PR**

Run: `git push -u origin feat/llm-foundation-knowledge-notes`

Expected: 远端分支创建成功。

PR 标题使用 `feat: complete LLM foundation knowledge notes`；正文列出七篇新笔记、28 份 evidence cards、数据拆分、测试与浏览器验收、来源限制以及 GitHub Pages 部署预期。

- [ ] **Step 4：检查 PR 并合并**

Run: `gh pr checks --watch`

Expected: 所有必需检查通过。

Run: `gh pr merge --merge --delete-branch`

Expected: PR 合并到最新 `main`，远端功能分支删除。

- [ ] **Step 5：等待 GitHub Pages 完成**

轮询：

Run: `gh api repos/Alex-loading/agent-development-knowledge-map/pages/builds/latest`

Expected: `status` 为 `built`，构建提交等于本次 PR 的 merge commit。

- [ ] **Step 6：验证公开站点**

打开 `https://alex-loading.github.io/agent-development-knowledge-map/`，逐一验证 `#llm-foundation/lesson/llm-01` 至 `llm-08`；抽查 `#context-rag-memory/lesson/context-01`。Expected: 八课均渲染知识笔记，第四模块仍可访问，控制台无 error。

- [ ] **Step 7：报告完成证据**

最终交付 PR URL、merge commit、Pages build 状态、公开站点 URL、自动化测试数量、浏览器验收范围和仍保留的资料限制；不得仅凭推送或 PR 创建宣称部署完成。
