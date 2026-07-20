# Agent Harness 学习模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Agent Learner 中开放第三个完整的「Agent Harness」模块，交付八节课程、28 项核验资源、24 道面试题、16 道测验和三项确定性交互实验。

**Architecture:** 保持无框架静态 ES Modules 架构。课程通过现有深度不可变 `courseRegistry` 注册并复用六个通用视图；Harness 纯逻辑与 DOM renderer 分别放入独立 core/UI 文件，现有实验入口只负责合并 registry。持久进度和按模块隔离的筛选状态继续复用现有协议，不新增迁移和模块特判。

**Tech Stack:** HTML、CSS、native ES Modules、Node.js `node:test`、项目 fake DOM、localStorage、Vercel 静态部署

---

## 文件结构

```text
src/data/agent-harness.js             课程、28 资源、24 面试题与 16 quiz
src/data/courses.js                   注册第三课程
src/data/modules.js                   将 Agent Harness 标记为 active
src/core/agent-harness.js             lifecycle、resume、queue 三组纯函数
src/ui/harness-experiments.js         三项 Harness 实验 DOM
src/ui/experiments.js                 合并 Harness renderer registry
tests/agent-harness-data.test.js      数据协议、内容数量和引用完整性
tests/agent-harness.test.js           三组纯逻辑行为与边界
tests/course-registry.test.js         第三课程注册、路由与全局 ID 唯一
tests/data.test.js                    模块状态与依赖约束
tests/ui-interactions.test.js         三项实验和模块集成真实 DOM 行为
tests/static-app.test.js              安全、文档与无硬编码契约
README.md                              三个完整模块和扩展说明
```

## Task 1：新增完整 Agent Harness 课程数据

**Files:**
- Create: `tests/agent-harness-data.test.js`
- Create: `src/data/agent-harness.js`

- [ ] **Step 1：写失败的数据协议测试**

测试导入尚不存在的 `agentHarness`，断言模块 ID 为 `agent-harness`，lesson ID 依次为 `harness-01` 至 `harness-08`，order 为 1–8。每课断言 `moduleId`、至少两个 objectives、三个 concepts、两段 explanations、每段至少两个 keyPoints、两步 exercise、两项 completionCriteria、恰好两个 quiz、恰好三个 interviewQuestionIds。

继续写出以下精确数量与引用断言：

```js
assert.equal(agentHarness.lessons.length, 8);
assert.equal(agentHarness.resources.length, 28);
assert.equal(agentHarness.interviewQuestions.length, 24);
assert.equal(agentHarness.lessons.flatMap(({ quiz }) => quiz).length, 16);
assert.ok(agentHarness.resources.every(({ verifiedAt }) => verifiedAt === '2026-07-20'));
assert.ok(agentHarness.resources.every(({ url }) => new URL(url).protocol === 'https:'));
```

验证所有 lesson/resource/quiz/interview ID 在课程内唯一；资源和面试双向引用均可解析；每个资源至少被一课引用；每题包含 shortAnswer、两个 deepDive、misconceptions、followUps、frequency、difficulty、roles；顶层对象、数组和嵌套记录不能被赋值修改。

- [ ] **Step 2：运行测试并确认 RED**

Run: `node --test tests/agent-harness-data.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/agent-harness.js`.

- [ ] **Step 3：实现课程对象**

创建 `src/data/agent-harness.js`，使用 `VERIFIED_AT = '2026-07-20'` 和项目既有 `deepFreeze` 模式，导出：

```js
export const agentHarness = deepFreeze({
  id: 'agent-harness',
  title: 'Agent Harness',
  summary: '把 Agent loop 放进可约束、可暂停、可恢复并能安全处理副作用的宿主执行系统。',
  lessons,
  resources,
  interviewQuestions,
});
```

八课标题固定为：

1. `Harness 与宿主 Runner`
2. `Run State、Event Log 与 Checkpoint`
3. `工具注册、权限与人工审批`
4. `Sandbox、隔离与资源边界`
5. `Budget、Timeout、Retry 与 Cancel`
6. `幂等副作用与安全 Resume`
7. `并发、队列与背压`
8. `Blocked、HITL、Handoff 与运行产物`

实验只映射三课：第 1 课 `run-lifecycle`，第 6 课 `retry-resume`，第 7 课 `queue-backpressure`。课程解释必须覆盖设计文档中的术语与错误边界，不能把 checkpoint 写成长时记忆，不能宣称 durable execution 保证外部副作用 exactly once，不能把 timeout 写成已取消或回滚，也不能把普通容器写成绝对安全 sandbox。

28 项资源使用全局唯一 `res-harness-*` ID，并从以下已核验直接页面中选择恰好 28 项：

```text
https://openai.github.io/openai-agents-python/running_agents/
https://openai.github.io/openai-agents-python/human_in_the_loop/
https://openai.github.io/openai-agents-python/tools/
https://openai.github.io/openai-agents-python/ref/run_state/
https://docs.langchain.com/oss/python/langgraph/persistence
https://docs.langchain.com/oss/python/langgraph/interrupts
https://docs.langchain.com/oss/python/langgraph/fault-tolerance
https://docs.temporal.io/workflow-execution
https://docs.temporal.io/workflow-execution/event
https://docs.temporal.io/encyclopedia/retry-policies
https://learn.microsoft.com/en-us/azure/azure-functions/durable/programming-model-overview
https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
https://sre.google/sre-book/addressing-cascading-failures/
https://sre.google/sre-book/handling-overload/
https://gvisor.dev/docs/architecture_guide/intro/
https://docs.docker.com/engine/security/seccomp/
https://docs.docker.com/engine/containers/resource_constraints/
https://docs.docker.com/engine/security/rootless/
https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md
https://www.nist.gov/news-events/news/2025/08/lessons-learned-consortium-tool-use-agent-systems
https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
https://github.com/datawhalechina/Agent-Learning-Hub
https://github.com/agentscope-ai/agentscope-runtime
https://huggingface.co/learn/agents-course/zh-CN/unit2/smolagents/code_agents
https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter6/%E7%AC%AC%E5%85%AD%E7%AB%A0%20%E6%A1%86%E6%9E%B6%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5.md
https://www.bilibili.com/video/BV1HfHgzuEPn/
https://jingxuan.douyin.com/m/video/7646732508339457334
```

每项资源写明 source、language、type、difficulty、stage、value 和 verifiedAt；视频显式写 `platform`。`value` 说明学习价值与证据边界，不复制来源宣传文案。

面试题按八课每课三题编写，问题标题固定为：

```text
Agent Harness 与 Agent 本身有什么区别？
请设计一个 Agent run 的生命周期状态机。
Runner 的 lifecycle hooks 应如何设计？
Run state、event log、checkpoint 有什么区别？
Checkpoint 应该多频繁保存？
进程重启后怎样安全恢复一个 run？
如何设计工具注册表？
认证、授权和人工审批分别解决什么？
为什么审批后还要重新验证工具调用？
Container 与 sandbox 是一回事吗？
如何给代码执行 Agent 做最小权限设计？
Sandbox 的资源预算怎么设置？
Timeout、deadline 和 cancellation 有何区别？
哪些错误应该重试？
如何设计运行预算？
什么是幂等，Agent 为什么特别需要它？
副作用成功但 checkpoint 失败，怎样恢复？
能否保证 exactly-once 工具执行？
并发与并行有什么区别，Agent Harness 为什么要限并发？
怎样用队列运行长任务？
什么是背压，队列满了怎么办？
Blocked、failed、cancelled 应如何区分？
如何实现长时间人工审批的 pause/resume？
Handoff bundle 和运行产物应包含什么？
```

- [ ] **Step 4：确认 GREEN 并提交**

Run: `node --test tests/agent-harness-data.test.js`

Expected: PASS with 8 lessons, 28 resources, 24 questions and 16 quiz items.

Run: `npm test`

Expected: all baseline and new data tests pass.

```bash
git add src/data/agent-harness.js tests/agent-harness-data.test.js
git commit -m "feat: add Agent Harness curriculum"
```

## Task 2：实现三组确定性 Harness 纯逻辑

**Files:**
- Create: `tests/agent-harness.test.js`
- Create: `src/core/agent-harness.js`

- [ ] **Step 1：写 lifecycle reducer 失败测试**

定义期望 API `reduceRun(state, event, policy)`。测试 `created + enqueue → queued`、`queued + start → running`、`running + request-approval → awaiting-approval`、`awaiting-approval + approve → running`、`running + complete → succeeded`；terminal 后事件返回 `rejected: true`；重复 `eventId` 不改变状态；sequence 必须严格递增；预算耗尽生成 `timed_out` 或 `failed` 的明确终态。输入对象不得被修改。

- [ ] **Step 2：运行 lifecycle 测试并确认 RED**

Run: `node --test --test-name-pattern="lifecycle" tests/agent-harness.test.js`

Expected: FAIL because `src/core/agent-harness.js` does not exist.

- [ ] **Step 3：最小实现 reducer 并确认 GREEN**

状态至少包含：

```js
{
  status: 'created',
  sequence: 0,
  processedEventIds: [],
  stepsUsed: 0,
  pendingApproval: null,
}
```

返回 `{ state, emittedEffects, rejected, reason }`。只接受设计中列出的事件与转换；所有数组和对象以新值返回。

Run: `node --test --test-name-pattern="lifecycle" tests/agent-harness.test.js`

Expected: PASS.

- [ ] **Step 4：写 resume planner 失败测试**

定义 `planResume(input)`，测试：已有 completion event → `skip`；瞬态错误、稳定 idempotency key、预算充足 → `retry`；远端显示成功但本地缺 completion → `reconcile`；写调用 outcome unknown 且无远端证据 → `manual`；永久错误或预算耗尽 → `fail`。断言 decision、reason、missingEvidence 和 nextAttemptAt 的确定性，不使用真实时间或随机数。

- [ ] **Step 5：实现 resume planner 并确认 GREEN**

要求输入显式提供 `now`、`attemptsUsed`、`maxAttempts`、`baseDelayMs` 和 `jitterFactor`，采用确定性指数退避；没有 `idempotencyKey` 的写调用不可自动 retry。

Run: `node --test --test-name-pattern="resume" tests/agent-harness.test.js`

Expected: PASS.

- [ ] **Step 6：写 queue simulator 失败测试**

定义 `stepQueue(state, input)`。测试容量 3、2 workers 下 admitted/started/rejected 精确计数；最大 running 不超过 workerCount；`reject-new` 在满队列拒绝；queued cancel 不会启动；每 tick 更新 oldestAge；输入对象不变；负数、非整数和未知 admission policy 抛出清晰错误。

- [ ] **Step 7：实现 queue simulator、全量验证并提交**

模拟只使用离散 tick 和整数 service capacity，返回：

```js
{ state, admitted, started, completed, rejected, cancelled, utilization }
```

Run: `node --test tests/agent-harness.test.js`

Expected: all Harness core tests pass.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/core/agent-harness.js tests/agent-harness.test.js
git commit -m "feat: add Agent Harness simulations"
```

## Task 3：实现三项可访问交互实验

**Files:**
- Create: `src/ui/harness-experiments.js`
- Modify: `src/ui/experiments.js`
- Modify: `tests/ui-interactions.test.js`
- Modify: `src/styles.css`

- [ ] **Step 1：写 renderer 与 DOM 交互失败测试**

在真实 fake DOM 中断言 `renderExperiment('run-lifecycle')`、`renderExperiment('retry-resume')`、`renderExperiment('queue-backpressure')` 均返回自己的 lab；所有结果区具有 `aria-live="polite"`；操作控件会改变 `dataset.status` 或数值文本；点击重置恢复默认值。未知实验现有降级仍保持。

- [ ] **Step 2：运行目标测试并确认 RED**

Run: `node --test --test-name-pattern="Harness experiment|run lifecycle|retry resume|queue backpressure" tests/ui-interactions.test.js`

Expected: FAIL because Harness renderers are not registered.

- [ ] **Step 3：实现 renderer registry 和三项实验**

`src/ui/harness-experiments.js` 导出冻结映射：

```js
export const harnessExperimentRenderers = Object.freeze({
  'run-lifecycle': renderRunLifecycleExperiment,
  'retry-resume': renderRetryResumeExperiment,
  'queue-backpressure': renderQueueBackpressureExperiment,
});
```

生命周期实验用事件按钮驱动同一个 reducer 并展示状态、sequence、pending approval 与拒绝原因；恢复实验用崩溃点、错误类别、幂等记录、远端证据和预算控件展示决策；队列实验用 arrivals、workers、capacity、queue limit 控件和 tick/reset 按钮展示运行、排队、完成、拒绝和利用率。

所有控件有 label，按钮可键盘操作，状态变化进入 live region；标题沿用 `实验 01/02/03` 体系，文案显式说明是确定性模拟。复用现有 CSS token 和 agent experiment 组件，只增加 Harness 状态流、crash window 和 queue meter 所需类，不改变全站主题。

`src/ui/experiments.js` 仅导入并展开新 registry：

```js
import { harnessExperimentRenderers } from './harness-experiments.js';

const experimentRenderers = Object.freeze({
  'token-budget': renderTokenBudgetExperiment,
  attention: renderAttentionExperiment,
  sampling: renderSamplingExperiment,
  ...agentExperimentRenderers,
  ...harnessExperimentRenderers,
});
```

- [ ] **Step 4：确认 GREEN、回归并提交**

Run: `node --test tests/ui-interactions.test.js`

Expected: all UI interaction tests pass.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/ui/harness-experiments.js src/ui/experiments.js src/styles.css tests/ui-interactions.test.js
git commit -m "feat: add Agent Harness interactive labs"
```

## Task 4：注册并激活第三模块

**Files:**
- Modify: `src/data/courses.js`
- Modify: `src/data/modules.js`
- Modify: `tests/course-registry.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/ui-interactions.test.js`

- [ ] **Step 1：写注册、路由和集成失败测试**

断言 `getCourse('agent-harness') === agentHarness`；解析 `#agent-harness/dashboard` 和 `#agent-harness/lesson/harness-01`；前三个模块 active、其余 planned；所有注册课程的 lesson/resource/quiz/interview/experiment ID 跨课程唯一。启动真实 app 后切换到 Harness，断言 dashboard、curriculum、knowledge-map、resources、interviews、progress 六个 hash 均渲染；资源/面试筛选与前两个模块互不污染。

- [ ] **Step 2：运行目标测试并确认 RED**

Run: `node --test tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js`

Expected: FAIL because Agent Harness is not registered and is still planned.

- [ ] **Step 3：注册课程并只激活第三模块**

在 `src/data/courses.js` 导入 `agentHarness` 并追加到冻结 registry。在 `src/data/modules.js` 只把 `agent-harness.status` 改成 `active`；后续模块保持 planned。禁止在 app 或通用视图增加 `agent-harness` 条件分支。

- [ ] **Step 4：确认 GREEN、回归并提交**

Run: `node --test tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/data/courses.js src/data/modules.js tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js
git commit -m "feat: activate Agent Harness module"
```

## Task 5：文档、静态契约与发布前验收

**Files:**
- Modify: `tests/static-app.test.js`
- Modify: `README.md`

- [ ] **Step 1：写 README 与静态契约失败测试**

把静态断言更新为三个完整模块，并要求 README 明确：Agent Harness active；8 课、28 资源、24 面试题、16 quiz、3 实验；后续模块仍 planned；三课程通过通用 registry 驱动。继续扫描 `src` 禁止 `innerHTML`、内联事件、通用视图中的课程标题和模块 ID 特判。

- [ ] **Step 2：运行静态测试并确认 RED**

Run: `node --test tests/static-app.test.js`

Expected: FAIL because README and expected module counts still describe two modules.

- [ ] **Step 3：更新 README**

把产品描述改为三个完整模块，列出 Harness 八课主线、三项实验和资料证据边界；模块路线图中将 Agent Harness 标记为 active，后续五模块仍为 planned；保留本地运行、测试和路由说明。

- [ ] **Step 4：执行自动化验收并提交**

Run: `node --test tests/static-app.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests pass with zero failures.

Run: `node --check src/data/agent-harness.js && node --check src/core/agent-harness.js && node --check src/ui/harness-experiments.js && node --check src/app.js`

Expected: no output and exit 0.

Run: `git diff --check`

Expected: no output and exit 0.

```bash
git add README.md tests/static-app.test.js
git commit -m "docs: document Agent Harness learning module"
```

## Task 6：真实浏览器与发布准备

**Files:**
- Modify only if a browser defect is reproduced with a failing automated test first.

- [ ] **Step 1：启动静态站点并完成桌面验收**

Run: `npm run serve`

Open: `http://localhost:4173/#agent-harness/dashboard`

检查三模块切换、六视图、八课、28 资源筛选、24 面试题筛选/展开/掌握/队列、16 quiz、三实验 reset 与状态变化、进度汇总和模块间状态隔离。控制台不得出现应用错误。

- [ ] **Step 2：完成移动端与可访问性验收**

在 320×800 和 390×844 检查无横向溢出、导航可用、控件不裁切、触控目标可点击；键盘检查 focus、button/select/label、`aria-expanded` 和 live region；确认 reduced-motion 沿用现有样式。

- [ ] **Step 3：最终验证**

Run: `npm test`

Expected: all tests pass with zero failures.

Run: `git status --short && git log --oneline -6`

Expected: worktree clean and the six task commits visible before final review/merge.
