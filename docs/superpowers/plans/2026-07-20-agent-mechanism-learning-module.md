# Agent 机制学习模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Agent Learner 中开放第二个完整的「Agent 机制」模块，交付八节课程、28 项核验资源、24 道面试题、三项交互实验，以及真正互不污染的多模块导航与视图状态。

**Architecture:** 保持无框架静态 ES Modules 架构。新课程通过现有不可变 `courseRegistry` 注册并复用六个通用视图；Agent 专属纯逻辑与实验 DOM 分别放入独立 core/UI 文件，现有实验入口只做注册。持久进度继续使用全局唯一 ID 的 v1 扁平协议，临时筛选与展开状态改为按模块隔离。

**Tech Stack:** HTML、CSS、native ES Modules、Node.js `node:test`、自研 fake DOM、localStorage、Vercel 静态部署

---

## 文件结构

```text
src/data/agent-mechanism.js       Agent 机制课程、28 项资源、24 道面试题
src/data/courses.js               注册第二课程
src/data/modules.js               将 Agent 机制切换为 active
src/core/agent-mechanism.js       控制循环、工具契约、计划恢复纯逻辑
src/ui/agent-experiments.js       三项 Agent 教学实验 DOM
src/ui/experiments.js             实验 renderer 注册入口
src/app.js                        按模块隔离资源/面试临时视图状态
tests/agent-mechanism-data.test.js 课程数据和跨课程唯一性
tests/agent-mechanism.test.js      Agent 纯逻辑
tests/course-registry.test.js      两模块注册和路由
tests/data.test.js                 模块目录状态约束
tests/ui-interactions.test.js      多模块状态与三项实验交互
tests/static-app.test.js           文档、注册和安全静态契约
README.md                          两个完整模块与扩展说明
```

## Task 1：新增完整 Agent 机制课程数据

**Files:**
- Create: `tests/agent-mechanism-data.test.js`
- Create: `src/data/agent-mechanism.js`

- [ ] **Step 1：写课程数据失败测试**

创建测试并导入尚不存在的 `agentMechanism`。测试精确要求：

```js
const expectedLessonIds = Array.from({ length: 8 }, (_, index) =>
  `agent-${String(index + 1).padStart(2, '0')}`,
);

test('Agent mechanism contains eight ordered complete lessons', () => {
  assert.equal(agentMechanism.id, 'agent-mechanism');
  assert.deepEqual(agentMechanism.lessons.map(({ id }) => id), expectedLessonIds);
  assert.deepEqual(agentMechanism.lessons.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const lesson of agentMechanism.lessons) {
    assert.equal(lesson.moduleId, agentMechanism.id);
    assert.ok(lesson.objectives.length >= 2);
    assert.ok(lesson.concepts.length >= 3);
    assert.ok(lesson.explanations.length >= 2);
    assert.ok(lesson.explanations.every(({ body, keyPoints }) => body.length >= 60 && keyPoints.length >= 2));
    assert.ok(lesson.exercise.steps.length >= 2);
    assert.ok(lesson.exercise.deliverable.length >= 10);
    assert.ok(lesson.quiz.length >= 2);
    assert.ok(lesson.completionCriteria.length >= 2);
    assert.equal(lesson.interviewQuestionIds.length, 3);
  }
});
```

继续断言：资源数恰为 28、面试题数恰为 24、每节至少两个资源、所有引用双向解析、URL 为 HTTPS、`verifiedAt === '2026-07-20'`、资源所有元数据完整、面试题短答/深挖/误区/追问/岗位/频率/难度完整、课程内所有 ID 唯一。

- [ ] **Step 2：运行测试并确认 RED**

Run: `node --test tests/agent-mechanism-data.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/agent-mechanism.js`.

- [ ] **Step 3：实现课程对象与八节内容**

创建 `src/data/agent-mechanism.js`，使用：

```js
const VERIFIED_AT = '2026-07-20';
const quiz = (id, prompt, choices, answerIndex, explanation) => ({
  id, prompt, choices, answerIndex, explanation,
});

export const agentMechanism = {
  id: 'agent-mechanism',
  title: 'Agent 机制',
  summary: '从目标、状态、动作、观察到终止条件，理解单 Agent 如何把模型能力组织成可验证的行动闭环。',
  lessons,
  resources,
  interviewQuestions,
};
```

八节标题固定为：

1. `Agent、Workflow 与普通 LLM 应用`
2. `目标、约束与任务状态`
3. `工具调用与 Agent–Computer Interface`
4. `Agent Loop 与 ReAct`
5. `规划、任务分解与重规划`
6. `失败恢复、反思与外部验证`
7. `上下文与工作记忆`
8. `单 Agent 综合设计与面试压力测试`

实验映射固定为：第 3 节 `tool-contract`，第 4 节 `agent-loop`，第 5 节 `plan-recovery`。其余练习为可执行的手工/代码交付，不伪装成交互实验。

使用以下 28 个全局唯一资源 ID 与已经核验的直接 URL：

```text
res-agent-anthropic-effective     https://www.anthropic.com/engineering/building-effective-agents
res-agent-openai-guide            https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
res-agent-berkeley-course         https://llmagents-learning.org/f24
res-agent-hf-course               https://github.com/huggingface/agents-course
res-agent-ms-course               https://github.com/microsoft/ai-agents-for-beginners
res-agent-hello-agents            https://github.com/datawhalechina/hello-agents
res-agent-dlai-agentic            https://www.deeplearning.ai/courses/agentic-ai
res-agent-lilian-weng             https://lilianweng.github.io/posts/2023-06-23-agent/
res-agent-lihongyi                https://www.youtube.com/watch?v=M2Yg1kwPpts
res-agent-datawhale-bili          https://www.bilibili.com/video/BV1Sb421E74u/
res-agent-disney-planner-bili     https://www.bilibili.com/video/BV1ix4y117zo/
res-agent-ms-tool-video           https://www.youtube.com/watch?v=vieRiPRx-gI
res-agent-ms-plan-video           https://www.youtube.com/watch?v=kPfJ2BrBCMY
res-agent-react-paper             https://arxiv.org/abs/2210.03629
res-agent-tot-paper               https://arxiv.org/abs/2305.10601
res-agent-plan-solve              https://arxiv.org/abs/2305.04091
res-agent-rewoo                   https://arxiv.org/abs/2305.18323
res-agent-toolformer              https://arxiv.org/abs/2302.04761
res-agent-openai-function         https://developers.openai.com/api/docs/guides/function-calling
res-agent-anthropic-tools         https://www.anthropic.com/engineering/writing-tools-for-agents
res-agent-coala                   https://arxiv.org/abs/2309.02427
res-agent-reflexion               https://arxiv.org/abs/2303.11366
res-agent-self-refine             https://arxiv.org/abs/2303.17651
res-agent-no-self-correct         https://arxiv.org/abs/2310.01798
res-agent-critic                  https://arxiv.org/abs/2305.11738
res-agent-agentbench              https://arxiv.org/abs/2308.03688
res-agent-tau-bench               https://arxiv.org/abs/2406.12045
res-agent-douyin-claude-code      https://www.douyin.com/video/7529703060969508130
```

资源 `type` 必须能让现有平台推导器识别 GitHub、YouTube、Bilibili、论文、官方文档/课程和社区补充；抖音资源显式设置 `platform: '抖音'`，`value` 明确其只作实作补充，不作为机制事实依据。每项论文的 `value` 使用“论文在其评测设定中……”等有边界措辞。

按照设计文档的 8×3 题纲写 24 道题，ID 采用 `iq-agent-01-1` 至 `iq-agent-08-3`。所有问题必须能在对应课程解释中找到答案，不能把 Harness、RAG、评测安全或多 Agent 的展开内容提前塞入本模块。

24 道题标题固定为：

1. `LLM、Agent、Workflow 有什么区别？`
2. `什么时候不应该使用 Agent？`
3. `最小 Agent 必须有哪些组成部分？`
4. `怎样把模糊用户请求转成 Agent 可执行任务？`
5. `Agent 如何判断任务完成？`
6. `工作状态和聊天历史有什么区别？`
7. `LLM 的 function calling 是怎么工作的？`
8. `如何设计可靠的工具 schema？`
9. `为什么工具返回结果必须带回模型？`
10. `请手写一个最小 Agent loop。`
11. `ReAct 与普通 chain-of-thought 有何区别？`
12. `Agent 为什么会陷入无限工具调用？`
13. `ReAct 和 plan-and-execute 如何选择？`
14. `怎样判断任务分解是否合理？`
15. `为什么不能让 Agent 永远遵循初始计划？`
16. `Agent 的工具调用失败后应该怎么办？`
17. `Reflection 真能提高 Agent 可靠吗？`
18. `如何避免 Agent 反复执行同一失败动作？`
19. `Agent 的 state、memory、context 有什么区别？`
20. `上下文窗口快满时怎么处理？`
21. `为什么要区分 Agent belief 和工具 observation？`
22. `请设计一个能调用工具完成多步任务的 Agent。`
23. `不用框架能否实现 Agent？框架提供了什么？`
24. `Agent 机制与 Harness、RAG、MCP、多 Agent 的边界是什么？`

频率只使用现有 schema 的 `高 / 中 / 补充`，难度只使用 `基础 / 进阶 / 深挖`，岗位只使用站点已有可筛选值。每题的短答先给判断标准，深挖解释机制与权衡，误区指出一个可辨认的错误答案，追问能够继续检验候选人的系统设计能力。

- [ ] **Step 4：运行数据测试并确认 GREEN**

Run: `node --test tests/agent-mechanism-data.test.js`

Expected: PASS, 28 resources and 24 interview questions validated.

- [ ] **Step 5：运行全量回归并提交**

Run: `npm test`

Expected: existing 99 tests plus new data tests all pass.

```bash
git add src/data/agent-mechanism.js tests/agent-mechanism-data.test.js
git commit -m "feat: add Agent mechanism curriculum"
```

## Task 2：注册模块并隔离多模块临时状态

**Files:**
- Modify: `tests/course-registry.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/ui-interactions.test.js`
- Modify: `src/data/courses.js`
- Modify: `src/data/modules.js`
- Modify: `src/app.js`

- [ ] **Step 1：写第二 active 模块与跨课程 ID 失败测试**

在 `tests/course-registry.test.js` 中导入 `agentMechanism` 并断言：

```js
assert.equal(getCourse('llm-foundation'), llmFoundation);
assert.equal(getCourse('agent-mechanism'), agentMechanism);
assert.deepEqual(resolveRoute('#agent-mechanism/dashboard'), {
  hash: '#agent-mechanism/dashboard', moduleId: 'agent-mechanism', view: 'dashboard',
});
assert.deepEqual(resolveRoute('#agent-mechanism/lesson/agent-01'), {
  hash: '#agent-mechanism/lesson/agent-01', moduleId: 'agent-mechanism', view: 'lesson', lessonId: 'agent-01',
});
```

增加注册表所有课程的 lesson/resource/quiz/interview ID 跨课程唯一性断言。在 `tests/data.test.js` 中把“只有第一个 active”改成“前两个模块 active，剩余模块 planned”，同时保持依赖图和 promised content 约束。

- [ ] **Step 2：写模块切换状态隔离失败测试**

在 fake DOM 启动真实 `startApp`，先进入 LLM 资源库选择一个 Agent 资源中不存在的阶段，再切换到 Agent 模块资源库。断言 Agent 模块显示全部 28 项；切回 LLM 模块时原筛选仍恢复。对面试 role/frequency/status filters 做同样检查，并断言揭示答案只在对应模块集合中保存。

- [ ] **Step 3：运行目标测试并确认 RED**

Run: `node --test tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js`

Expected: FAIL because Agent 课程尚未注册、模块仍 planned，且临时 filters 为全局单份。

- [ ] **Step 4：注册并激活第二课程**

`src/data/courses.js`：

```js
import { agentMechanism } from './agent-mechanism.js';
import { llmFoundation } from './llm-foundation.js';

export const courseRegistry = Object.freeze({
  [llmFoundation.id]: llmFoundation,
  [agentMechanism.id]: agentMechanism,
});
```

`src/data/modules.js` 只把 `agent-mechanism.status` 改为 `active`，后续模块保持 planned。

- [ ] **Step 5：按模块隔离临时视图状态**

把 `viewState.resourceFilters` 和 `viewState.interviewFilters` 改为按 `moduleId` 存储的 plain object；revealed interview IDs 也用每模块独立的 `Set`。回调必须闭包传入当前 `route.moduleId`，示意：

```js
const viewState = {
  resourceFiltersByModule: {},
  interviewFiltersByModule: {},
  revealedInterviewIdsByModule: {},
  resetConfirmOpen: false,
};

const filtersFor = (collection, moduleId) => collection[moduleId] ?? {};
```

更新筛选时只复制目标模块记录，切换模块不清除其他模块记录。禁止在通用 UI 文件里判断 `agent-mechanism`。

- [ ] **Step 6：验证 GREEN 并提交**

Run: `node --test tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/data/courses.js src/data/modules.js src/app.js tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js
git commit -m "feat: activate Agent mechanism module"
```

## Task 3：实现 Agent 机制纯逻辑

**Files:**
- Create: `tests/agent-mechanism.test.js`
- Create: `src/core/agent-mechanism.js`

- [ ] **Step 1：写控制循环终止测试**

定义期望 API：

```js
assert.deepEqual(decideLoopOutcome({ goalSatisfied: true, blocked: false, stepsUsed: 2, maxSteps: 5 }), {
  status: 'done', reason: '目标已有可验证的完成证据', shouldContinue: false,
});
assert.equal(decideLoopOutcome({ goalSatisfied: false, blocked: true, stepsUsed: 2, maxSteps: 5 }).status, 'blocked');
assert.equal(decideLoopOutcome({ goalSatisfied: false, blocked: false, stepsUsed: 5, maxSteps: 5 }).status, 'budget-exhausted');
assert.equal(decideLoopOutcome({ goalSatisfied: false, blocked: false, stepsUsed: 2, maxSteps: 5 }).status, 'continue');
assert.throws(() => decideLoopOutcome({ stepsUsed: -1, maxSteps: 5 }), RangeError);
```

规则优先级固定为：完成证据 → 阻塞 → 步数耗尽 → 继续。步数必须是有限非负整数，`maxSteps` 必须是正整数。

- [ ] **Step 2：写工具契约校验测试**

定义 `validateToolInvocation(toolCatalog, invocation)`，工具定义字段为 `name`、`required`、`properties`、`risk`。断言未知工具、非对象 args、缺少必填、额外字段、枚举越界都返回 `status: 'invalid'` 和稳定错误数组；合法低风险调用返回 `ready`；合法高风险调用返回 `approval-required`。输入和 catalog 不得被修改。

- [ ] **Step 3：写计划恢复测试**

定义 `decidePlanRecovery({ strategy, observation, retriesUsed, maxRetries })`，支持 `fixed / reactive / hybrid` 与 `success / timeout / empty-result / new-constraint`。规则：成功继续；临时超时在预算内重试；预算耗尽后 fixed 阻塞、其他策略重规划；空结果 fixed 阻塞、reactive 换动作、hybrid 替换步骤；新约束 fixed 阻塞，其他策略重规划。非法枚举和数值抛 `RangeError`。

- [ ] **Step 4：运行测试并确认 RED**

Run: `node --test tests/agent-mechanism.test.js`

Expected: FAIL with missing module.

- [ ] **Step 5：实现最小纯函数并验证 GREEN**

创建 `src/core/agent-mechanism.js`，仅导出三个函数。返回新对象和新错误数组，不依赖 DOM、时间或随机数。所有中文 reason 文案必须稳定，供 UI 和测试复用。

Run: `node --test tests/agent-mechanism.test.js`

Expected: PASS.

- [ ] **Step 6：全量回归并提交**

Run: `npm test`

```bash
git add src/core/agent-mechanism.js tests/agent-mechanism.test.js
git commit -m "feat: add Agent mechanism teaching logic"
```

## Task 4：实现三项可访问交互实验

**Files:**
- Create: `src/ui/agent-experiments.js`
- Modify: `src/ui/experiments.js`
- Modify: `styles/app.css`
- Modify: `tests/ui-interactions.test.js`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1：写实验注册与真实 DOM 失败测试**

在 `tests/ui-interactions.test.js` 中通过 `renderExperiment` 真实创建三项实验：

- `agent-loop`：切换完成/阻塞，改变 steps/max steps，断言 status 文案与 `aria-live` 实时更新；重置恢复 `continue`。
- `tool-contract`：选择合法、缺参、非法枚举和高风险预设，断言 `ready / invalid / approval-required` 及错误列表；重置恢复合法低风险调用。
- `plan-recovery`：改变 strategy、observation、retry budget，断言 retry / switch-action / replace-step / replan / blocked；重置恢复默认。

继续断言每项实验只有一个可访问标题、所有 label 关联输入、按钮/选择器可键盘操作、未知 ID 仍降级为已有可访问提示。

- [ ] **Step 2：运行目标测试并确认 RED**

Run: `node --test tests/ui-interactions.test.js tests/static-app.test.js`

Expected: FAIL because the three renderer IDs are unavailable.

- [ ] **Step 3：实现独立 Agent 实验渲染器**

`src/ui/agent-experiments.js` 导出：

```js
export function renderAgentLoopExperiment() {}
export function renderToolContractExperiment() {}
export function renderPlanRecoveryExperiment() {}
export const agentExperimentRenderers = Object.freeze({
  'agent-loop': renderAgentLoopExperiment,
  'tool-contract': renderToolContractExperiment,
  'plan-recovery': renderPlanRecoveryExperiment,
});
```

每个实验维护局部状态，调用 Task 3 纯函数得出结果，使用 `textContent`/`replaceChildren` 渲染；不用 innerHTML。结果容器使用 `aria-live="polite"` 和 `aria-atomic="true"`，错误列表真实使用 `<ul>`。重置按钮必须恢复控件值、结果和有意义的焦点。

`src/ui/experiments.js` 导入 `agentExperimentRenderers`，与已有三个 renderer 合并为冻结注册表；不要把 Agent DOM 继续写进现有 400+ 行文件。

- [ ] **Step 4：扩展 Paper Lab 样式**

复用 `.experiment-lab`、`.experiment-grid`、`.experiment-control` 和已有 tokens。只新增 Agent 实验需要的状态 chip、决策表与错误列表样式；ready 使用 deep green，approval 使用 ochre，invalid/blocked 使用 vermilion。`@media (max-width: 40rem)` 与 `22rem` 必须把新网格降为单列且不产生最小内容溢出。

- [ ] **Step 5：验证 GREEN、全量回归并提交**

Run: `node --test tests/ui-interactions.test.js tests/static-app.test.js`

Run: `npm test`

Expected: all pass.

```bash
git add src/ui/agent-experiments.js src/ui/experiments.js styles/app.css tests/ui-interactions.test.js tests/static-app.test.js
git commit -m "feat: add interactive Agent mechanism labs"
```

## Task 5：文档、发布契约与全站硬化

**Files:**
- Modify: `README.md`
- Modify: `tests/static-app.test.js`
- Modify: `tests/course-registry.test.js`

- [ ] **Step 1：写 README 发布契约失败测试**

断言 README 明确包含：两个完整模块、Agent 机制八节/28 资源/24 面试题/3 实验、两模块路由示例、跨课程全局唯一 ID、按模块临时筛选状态，以及后续模块边界。把旧的“只有 LLM 基础完整、其他全部 planned”断言改为“LLM 基础与 Agent 机制完整，其余模块 planned”。

- [ ] **Step 2：运行静态测试并确认 RED**

Run: `node --test tests/static-app.test.js tests/course-registry.test.js`

Expected: FAIL because README still describes only one complete module.

- [ ] **Step 3：更新 README**

首页说明改为两个可学习模块；补充 Agent 机制课程地图、三项实验、资源证据标签和模块切换说明。保留现有架构、隐私、无构建部署与添加新模块契约，并把“正式开放第二模块前”改成已经完成的多模块事实：ID 全局唯一、汇总按当前课程过滤、重置清空整个专用键、临时筛选按模块隔离。

- [ ] **Step 4：执行发布前静态和自动化检查**

Run:

```bash
npm test
find src -name '*.js' -exec node --check {} \;
git diff --check 11ca3c3..HEAD
git status -sb
```

Expected: zero failures, zero syntax errors, clean diff whitespace, only intended committed changes.

- [ ] **Step 5：提交发布文档**

```bash
git add README.md tests/static-app.test.js tests/course-registry.test.js
git commit -m "docs: publish Agent mechanism learning guide"
```

## Task 6：最终集成、浏览器验收与审查闭环

**Files:**
- No production changes expected. Any discovered defect must first receive a focused failing regression test, then a minimal fix commit before review resumes.

- [ ] **Step 1：由独立 reviewer 做全分支规格审查**

审查基线 `11ca3c3` 到当前 HEAD，逐项核对设计文档和本计划。任何缺失或超范围由对应 implementer 修复，重新审查直到 approved。

- [ ] **Step 2：由独立 reviewer 做代码质量审查**

重点检查：课程事实准确性与来源措辞、跨课程 ID、注册/路由、视图状态隔离、纯函数边界、DOM 安全、焦点恢复、移动端布局和测试是否真实走生产路径。Important/Minor 问题均回到 implementer 修复并复审。

- [ ] **Step 3：本地 HTTP 冒烟**

Run: `npm run serve`

验证 `/`、`/styles/app.css`、`/src/app.js`、`/src/data/agent-mechanism.js` 为 HTTP 200 和正确 content type。完成后停止服务器。

- [ ] **Step 4：真实浏览器桌面验收**

在 Agent 机制模块依次验证 dashboard、curriculum、map、resources、interviews、progress；打开三节带实验课程并改变控件；提交一份 quiz；展开/掌握/加入复习队列；切回 LLM 再返回 Agent，确认各模块筛选与进度正确。

- [ ] **Step 5：320px 与 390px 验收**

确认模块选择器可用、view tabs 可横向滚动、正文有效宽度、三项实验单列、无文档横向溢出、触控目标和焦点可见。截图使用 viewport 而非整页缩放预览判断可用性。

- [ ] **Step 6：清理浏览器验收状态并最终验证**

通过页面内“确认重置”清空验收产生的学习记录，恢复临时 viewport，关闭或交付预览标签，停止服务器。重新运行：

```bash
npm test
find src -name '*.js' -exec node --check {} \;
git diff --check 11ca3c3..HEAD
git status -sb
```

Expected: all green and worktree clean.

- [ ] **Step 7：按已确认的第一模块发布选择收尾**

使用 `superpowers:finishing-a-development-branch` 核验分支与目标分支。用户已明确“所有需要我做选择的地方保持与第一个模块一致”，因此沿用第一次的发布路径：合并到 `main`、推送远端并更新生产部署；不要重复询问同一选择。部署完成后再做一次线上冒烟，并保留可追溯的提交与部署地址。
