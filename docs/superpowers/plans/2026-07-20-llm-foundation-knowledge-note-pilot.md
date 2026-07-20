# LLM 基础知识笔记样章 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `llm-01：AI、机器学习与 LLM` 制作为一篇站内可独立学习、带来源依据的 20–30 分钟知识笔记，并沉淀可复用的项目级内容生产 Skill。

**Architecture:** 为 `Lesson` 增加可选 `knowledgeNote`，用独立数据模块保存长文；新增通用 renderer 并对旧 `explanations` 保持 fallback。项目内 Skill 负责来源卡、跨来源综合、教学结构和质量审计；LLM 第一课作为唯一试点，其余课程与模块保持不变。

**Tech Stack:** 原生 ES Modules、DOM API、Node.js `node:test`、项目 fake DOM、项目级 Agent Skill、静态 CSS

---

## 文件结构

```text
.agents/skills/build-learning-module-notes/
  SKILL.md                              内容生产主流程与触发条件
  agents/openai.yaml                    Codex UI 元数据
  references/chapter-standard.md        章节教学结构与写作标准
  references/source-policy.md           来源分级、冲突、引用与版权规则
  references/data-contract.md           knowledgeNote / evidence 数据协议
  references/quality-rubric.md          发布前质量量表
docs/superpowers/skill-tests/
  build-learning-module-notes.md        RED/GREEN/变体测试记录
src/data/llm-foundation-notes.js        llm-01 长篇知识笔记
src/data/llm-foundation.js              接入笔记并补充 7 份来源卡
src/ui/knowledge-note.js                通用知识笔记 DOM renderer
src/ui/curriculum.js                    knowledgeNote 优先、旧解释 fallback
styles/app.css                          目录、正文、依据、提示与移动端样式
tests/data.test.js                      新数据协议、篇幅与引用完整性
tests/guided-ui.test.js                 样章渲染、目录焦点与旧课 fallback
tests/static-app.test.js                安全渲染与响应式样式契约
README.md                               样章状态和 Skill 复用方式
```

## Task 1：为内容生产 Skill 建立 RED 基线

**Files:**
- Create: `docs/superpowers/skill-tests/build-learning-module-notes.md`

- [ ] **Step 1：准备不泄露目标答案的基线任务**

使用 `llm-01` 当前 objectives、concepts、两段 explanations 和 7 项 resource 元数据作为原始材料；提示独立代理“在不访问新资料的情况下，把这些内容整理成一篇约 1200 字、可替代外链的第一课笔记，并说明证据不足处”。不要提供未来 Skill、数据结构、期望章节标题或质量量表。

- [ ] **Step 2：在没有新 Skill 的上下文中运行基线代理**

使用协作代理执行上一步任务，只把原始材料放进提示；不让它读取 `.agents/skills/build-learning-module-notes/`（此时该目录尚不存在）。

Expected: 代理能写出通顺内容，但至少暴露一项真实缺陷，例如按资料/概念平铺、没有逐结论来源、忽略证据边界、未覆盖 quiz/面试要求或把“Agent 应用开发”与“模型训练”混在一起。

- [ ] **Step 3：记录 RED 结果**

创建测试记录，固定以下结构并粘贴代理的原始输出或精确摘录：

```markdown
# build-learning-module-notes Skill Tests

## RED：无 Skill 基线
- 输入：llm-01 当前课程数据与 7 项资源元数据
- 观察到的行为：逐项记录代理实际采用的结构和来源处理方式
- 失败模式：只写实际出现的问题，不预填假设
- 原始摘录：保留能证明失败模式的原句
```

GREEN 与变体结果只在对应测试实际运行后追加，禁止预建空结论。

- [ ] **Step 4：提交 RED 证据**

```bash
git add docs/superpowers/skill-tests/build-learning-module-notes.md
git commit -m "test: capture learning note skill baseline"
```

## Task 2：创建并验证项目级知识笔记 Skill

**Files:**
- Create: `.agents/skills/build-learning-module-notes/SKILL.md`
- Create: `.agents/skills/build-learning-module-notes/agents/openai.yaml`
- Create: `.agents/skills/build-learning-module-notes/references/chapter-standard.md`
- Create: `.agents/skills/build-learning-module-notes/references/source-policy.md`
- Create: `.agents/skills/build-learning-module-notes/references/data-contract.md`
- Create: `.agents/skills/build-learning-module-notes/references/quality-rubric.md`
- Modify: `docs/superpowers/skill-tests/build-learning-module-notes.md`

- [ ] **Step 1：用官方脚手架初始化 Skill**

Run:

```bash
python3 /Users/octopus/.codex/skills/.system/skill-creator/scripts/init_skill.py build-learning-module-notes --path .agents/skills --resources references --interface 'display_name=Build Learning Module Notes' --interface 'short_description=将多来源学习资料综合成可独立学习的知识章节' --interface 'default_prompt=Use $build-learning-module-notes to turn this module's resources into a source-grounded Chinese learning chapter.'
```

Expected: 生成 Skill 目录、`SKILL.md`、`agents/openai.yaml` 和 `references/`，不创建 scripts/assets 等未使用目录。

- [ ] **Step 2：写最小但完整的 SKILL.md**

frontmatter 固定为：

```yaml
---
name: build-learning-module-notes
description: Use when creating or revising Agent Learner knowledge notes from multiple learning resources, or when a resource-heavy course outline must become a source-grounded, self-contained Chinese chapter.
---
```

正文必须使用命令式语言，并包含以下不可跳过的流程：

1. 读取目标模块、lesson objectives/concepts/quiz/interview/exercise 和现有资源。
2. 读取 `references/source-policy.md`，为全部关联资料建来源卡；无法取得正文时降级为扩展资料，禁止凭标题补全内容。
3. 先画模块/章节知识依赖与覆盖矩阵，再写正文；禁止按来源顺序逐篇摘要。
4. 按 `references/chapter-standard.md` 从直觉推进到机制、工程意义、例子、误区和总结。
5. 每个实质章节绑定 `sourceIds`；冲突、版本性和不确定性保持可见。
6. 按 `references/data-contract.md` 输出纯数据，不写 HTML；运行项目测试验证引用。
7. 使用 `references/quality-rubric.md` 逐项审计目标覆盖、来源、连贯性、重复、版权和篇幅；未通过不得宣称完成。

明确条件性子技能：OpenAI 产品材料使用 `openai-docs`，PDF/论文使用 `pdf:pdf`；普通官方网页使用浏览工具。禁止要求安装本次检索到的低信任 course-creator/fact-check 包。

- [ ] **Step 3：写四份按需加载的参考文件**

`chapter-standard.md` 固定教学顺序：先修桥接、直觉模型、准确机制、工程意义、具体例子、常见误区、回顾与下一章；每章 4–7 个实质章节，每个章节 2–4 个短段落，术语首次出现即解释。

`source-policy.md` 固定：

```text
authority: official | academic | expert | community
role: core | cross-check | extension
```

官方/原始材料优先；教程只能解释，不能覆盖原始定义；视频无字幕时不能支撑关键事实；时效性实现语义必须带核验日期；冲突不得静默合并；长原文必须转述，单一来源不得大段复制。

`data-contract.md` 给出完整协议：

```js
knowledgeNote: {
  readingMinutes: 25,
  introduction: '章节导语',
  sections: [{
    id: 'stable-section-id',
    title: '章节标题',
    paragraphs: ['段落一', '段落二'],
    keyPoints: ['要点一', '要点二'],
    callout: { kind: 'intuition', title: '提示标题', body: '提示正文' },
    sourceIds: ['res-example'],
  }],
  misconceptions: [{ claim: '错误理解', correction: '准确解释' }],
  recap: ['回顾要点'],
  nextStep: '与下一课的连接',
}

evidence: {
  authority: 'official',
  role: 'core',
  coverage: ['覆盖主题'],
  limitations: '该资料不能证明或未覆盖的边界',
}
```

`quality-rubric.md` 使用 100 分量表：目标/测验/面试覆盖 25，知识结构与跨章衔接 20，来源与不确定性 25，教学可读性与例子 20，版权/数据契约 10；任一来源引用不可解析或总分低于 85 均不发布。

- [ ] **Step 4：验证 Skill 结构**

Run:

```bash
python3 /Users/octopus/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/build-learning-module-notes
```

Expected: `Skill is valid!`

- [ ] **Step 5：运行 GREEN 和变体测试**

用独立代理在明确加载新 Skill 的情况下重跑 Task 1 同一输入，验证它会先声明证据限制、按主题综合、保留来源映射并覆盖既有学习产出。再以 `agent-01` 的现有课程数据做变体测试，只要求输出大纲、来源角色和覆盖矩阵，不修改课程文件。

把两次原始结果、量表分数和仍发现的缺口写入 skill-tests 文档；如果 GREEN 仍出现新的绕过方式，先最小修改 Skill，再复测并记录 REFACTOR。

- [ ] **Step 6：提交已验证 Skill**

```bash
git add .agents/skills/build-learning-module-notes docs/superpowers/skill-tests/build-learning-module-notes.md
git commit -m "feat: add source-grounded learning note skill"
```

## Task 3：先写知识笔记数据契约测试

**Files:**
- Modify: `tests/data.test.js`
- Create: `src/data/llm-foundation-notes.js`（仅在 GREEN 步骤创建）

- [ ] **Step 1：写 llm-01 knowledgeNote 失败测试**

在 `tests/data.test.js` 增加测试，要求：

```js
test('LLM first lesson has a source-grounded long-form knowledge note pilot', () => {
  const lesson = llmFoundation.lessons.find(({ id }) => id === 'llm-01');
  const note = lesson.knowledgeNote;
  assert.ok(note);

  const lessonResourceIds = new Set(lesson.resourceIds);
  const sectionIds = note.sections.map(({ id }) => id);
  const bodyLength = note.introduction.length
    + note.sections.flatMap(({ paragraphs }) => paragraphs).join('').length
    + note.nextStep.length;

  assert.ok(note.readingMinutes >= 20 && note.readingMinutes <= 30);
  assert.ok(note.sections.length >= 6 && note.sections.length <= 7);
  assert.equal(new Set(sectionIds).size, sectionIds.length);
  assert.ok(bodyLength >= 3000 && bodyLength <= 5500, bodyLength);
  for (const section of note.sections) {
    assert.match(section.id, /^[a-z0-9-]+$/);
    assert.ok(section.title.length >= 4);
    assert.ok(section.paragraphs.length >= 2);
    assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 60));
    assert.ok(section.keyPoints.length >= 2);
    assert.ok(section.sourceIds.length >= 1);
    assert.ok(section.sourceIds.every((id) => lessonResourceIds.has(id)));
  }
  assert.ok(note.misconceptions.length >= 3);
  assert.ok(note.recap.length >= 5);
});
```

- [ ] **Step 2：写来源卡与 fallback 失败测试**

对 `llm-01.resourceIds` 的 7 份资源断言 `evidence.authority` 属于 `official/academic/expert/community`，`role` 属于 `core/cross-check/extension`，`coverage` 非空且 `limitations` 至少 15 字。断言只有 `llm-01` 具有 `knowledgeNote`，`llm-02` 至 `llm-08` 仍有原 `explanations` 且没有试点笔记。

- [ ] **Step 3：运行测试确认 RED**

Run: `node --test tests/data.test.js`

Expected: FAIL because `lesson.knowledgeNote` and resource `evidence` do not exist.

## Task 4：研究 7 份资料并写第一章

**Files:**
- Create: `src/data/llm-foundation-notes.js`
- Modify: `src/data/llm-foundation.js`

- [ ] **Step 1：按 Skill 核验并分类全部 7 份关联资料**

逐一打开真实页面，确认标题、机构/作者、主题和可访问内容。角色固定为：

```text
res-ms-ai            official / core
res-ms-genai         official / core
res-hf-llm           official / core
res-ms-agents        official / cross-check
res-hello-agents     community / cross-check
res-openai-agents    official / extension
res-zomi-bili        expert / extension
```

深读前三项；其余只用于 Agent 应用边界或扩展。若页面实际内容不支持预定角色，降低为 extension 并在 `limitations` 说明，不得为了满足表格伪造证据。

- [ ] **Step 2：为 7 项资源添加 evidence 来源卡**

在现有资源对象内添加 `evidence`；`coverage` 使用本课真实主题，例如领域层级、训练/推理、生成式 AI 应用或 Agent 衔接；`limitations` 明确它不覆盖的模型原理、生产可靠性或课程范围。保留原 `verifiedAt`，本次打开页面后只把这 7 项更新为当天 `2026-07-20`，并调整测试允许资源各自的真实核验日期而不是全局硬编码旧日期。

- [ ] **Step 3：写独立知识笔记数据**

`src/data/llm-foundation-notes.js` 导出冻结的 `llmFoundationNotes`，唯一键为 `llm-01`，`readingMinutes` 固定为 `25`；`introduction`、`sections`、`misconceptions`、`recap` 和 `nextStep` 必须全部使用本步骤研究后完成的正式中文内容，文件中不得残留占位文本。

章节标题和内容边界固定为：

1. `先画地图：AI 不是某一种模型`：AI/ML/DL 的包含关系，规则/搜索等非学习方法仍属于 AI。
2. `机器如何从数据中学习`：任务、数据、参数、目标/损失、优化与泛化的最小闭环，为第二课埋伏笔。
3. `从生成模型到大语言模型`：判别/生成目标、语言建模、token 序列、LLM 是深度学习生成模型的一类。
4. `训练与推理是两个不同阶段`：参数是否更新、资源/指标、prefill/decode 只作预告，不提前展开 KV Cache。
5. `模型开发与应用开发的职责边界`：数据/架构/训练/对齐对比上下文、工具、验证、成本与延迟。
6. `Agent 开发者应该学到哪一层`：先使用与评测现成模型，按证据选择 RAG、微调或换模型；明确暂缓项。
7. `用一个资料助理串起全章`（可与第六节合并以控制篇幅）：同一业务在模型层和应用层的不同工作，给出具体决策例子。

必须覆盖现有两道 quiz、三道面试题和练习交付；不得把第四课 Attention、第五课微调细节或后续 Harness 机制提前写成主体。

- [ ] **Step 4：把笔记接入 llm-01**

在 `llm-foundation.js` 顶部导入 `llmFoundationNotes`，并只在第一课对象添加：

```js
knowledgeNote: llmFoundationNotes['llm-01'],
```

- [ ] **Step 5：运行数据测试并提交**

Run: `node --test tests/data.test.js`

Expected: PASS; body length 3000–5500, 7 份来源卡完整，其他七课保持旧协议。

```bash
git add src/data/llm-foundation-notes.js src/data/llm-foundation.js tests/data.test.js
git commit -m "feat: add LLM foundation knowledge note pilot"
```

## Task 5：测试并实现通用知识笔记 renderer

**Files:**
- Create: `src/ui/knowledge-note.js`
- Modify: `src/ui/curriculum.js`
- Modify: `tests/guided-ui.test.js`

- [ ] **Step 1：写样章渲染和目录焦点失败测试**

修改现有第一条 lesson detail 测试：断言存在 `.knowledge-note`、`nav[aria-label="本章目录"]`、第一节标题、第一节至少两个正文段落和可解析来源链接；断言旧 `原理札记` 标签不再用于 `llm-01`。点击第一个目录按钮后，断言 `document.activeElement` 是对应带 `tabindex="-1"` 的 `h2`。

- [ ] **Step 2：写旧课程 fallback 与坏引用测试**

新增测试渲染 `llm-02`，断言仍显示其第一项 `explanations.heading`。再用一个最小 synthetic course 渲染带缺失 `sourceIds` 的知识笔记，断言页面显示非阻断诊断且正文仍渲染。

- [ ] **Step 3：运行 UI 测试确认 RED**

Run: `node --test tests/guided-ui.test.js`

Expected: FAIL because `.knowledge-note` and the chapter directory do not exist.

- [ ] **Step 4：实现 `renderKnowledgeNote(course, lesson)`**

在独立文件中使用 `element`、`button`、`externalLink`：

- 创建章节节点与可聚焦 `h2`，ID 采用 `${lesson.id}-note-${section.id}`；
- 目录按钮不修改 hash，点击后调用目标标题的 `.focus()`；
- 每个章节按顺序渲染 paragraphs、keyPoints、可选 callout 和“本节依据”；
- 来源通过 `course.resources` 解析，只展示 HTTPS 外链；缺失引用累计为诊断文本；
- 结尾渲染 misconceptions、recap 和 nextStep；
- 不使用 `innerHTML`、Markdown parser 或模块 ID 特判。

- [ ] **Step 5：在课程详情中启用新旧双路径**

把 `curriculum.js` 当前 explanations 映射提取为 `renderLegacyExplanations(lesson)`；正文位置改为：

```js
lesson.knowledgeNote
  ? renderKnowledgeNote(course, lesson)
  : renderLegacyExplanations(lesson)
```

当 `knowledgeNote` 存在时，把资料区标题从“精选资料”改为“继续深挖”，并在资源说明后追加来源卡的角色与 `limitations`；没有来源卡时维持原展示。

- [ ] **Step 6：运行 UI 与安全测试并提交**

Run:

```bash
node --test tests/guided-ui.test.js tests/static-app.test.js
```

Expected: PASS; llm-01 使用新 renderer，llm-02 和其他模块继续使用旧解释。

```bash
git add src/ui/knowledge-note.js src/ui/curriculum.js tests/guided-ui.test.js
git commit -m "feat: render structured learning notes"
```

## Task 6：增加 Paper Lab 阅读样式与静态契约

**Files:**
- Modify: `styles/app.css`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1：写样式失败测试**

在静态测试中要求以下 selector 存在：

```text
.knowledge-note
.knowledge-note__toc
.knowledge-note__section
.knowledge-note__sources
.knowledge-note__callout
.knowledge-note__misconceptions
.knowledge-note__recap
```

同时断言 `@media (max-width: 40rem)` 内包含 `.knowledge-note__section`，并把 `src/ui/knowledge-note.js` 加入禁止 `innerHTML`、内联事件和模块硬编码的源文件集合。

- [ ] **Step 2：运行静态测试确认 RED**

Run: `node --test tests/static-app.test.js`

Expected: FAIL on missing knowledge-note selectors.

- [ ] **Step 3：实现阅读样式**

沿用现有纸张、深绿、朱红、赭色 token：目录使用纸张账簿边界；正文行宽控制在约 72ch；章节采用窄索引栏 + 正文的桌面网格；依据使用较小字号但保持颜色对比；callout 用左边框和暖黄底；误区使用“错误理解/准确解释”双列定义列表；回顾区使用深绿浅底。

在 `max-width: 40rem` 下把章节、误区改为单列，目录按钮保持至少约 44px 触控高度，任何长 URL/术语允许换行。尊重现有 `prefers-reduced-motion`，目录聚焦不增加滚动动画。

- [ ] **Step 4：运行静态测试并提交**

Run: `node --test tests/static-app.test.js`

Expected: PASS.

```bash
git add styles/app.css tests/static-app.test.js
git commit -m "style: add long-form knowledge note layout"
```

## Task 7：文档、全量验证和样章评审交付

**Files:**
- Modify: `README.md`

- [ ] **Step 1：更新 README**

说明 LLM 第一课正在试点“知识笔记主教材”，其余课程仍是原课程解释；列出 `knowledgeNote` 和 `Resource.evidence` 可选协议；在“添加新模块”前加入 Skill 使用方式：先调用 `$build-learning-module-notes` 研究与审计内容，再通过数据/UI 测试接入，不得直接批量扩写链接摘要。

- [ ] **Step 2：运行自动化验证**

Run:

```bash
npm test
find src -name '*.js' -print0 | xargs -0 -n1 node --check
python3 /Users/octopus/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/build-learning-module-notes
git diff --check
```

Expected: 全部测试通过；所有 JS 语法检查通过；Skill 输出 `Skill is valid!`；`git diff --check` 无输出。

- [ ] **Step 3：真实浏览器验收**

Run: `npm run serve`

Open: `http://localhost:4173/#llm-foundation/lesson/llm-01`

检查 1440px、390px、320px：一个 `h1`；目录可用键盘聚焦各章节；正文、提示、误区、依据和“继续深挖”顺序正确；无横向溢出；外链安全；quiz、完成按钮和进度仍工作。再打开 `llm-02`、`agent-01`、`harness-01` 确认旧解释 fallback 正常。

- [ ] **Step 4：提交文档与最终修正**

```bash
git add README.md
git commit -m "docs: document knowledge note pilot workflow"
```

- [ ] **Step 5：交付用户评审**

提供第一课页面、Skill、设计文档和测试结果；请用户只评审四项：知识是否足够自包含、语气是否适合连续学习、引用是否过密/过稀、20–30 分钟体量是否合适。未获样章认可前，不迁移 `llm-02` 至 `llm-08`。
