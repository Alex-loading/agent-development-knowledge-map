# AI 后端工程学习模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Every production change starts with a failing test and receives specification review followed by quality review.

**Goal:** 从零开放第五个完整的「AI 后端工程」模块，交付八节系统课程、29 项核验资源、24 道面试题、16 道测验、八篇可独立学习的知识笔记和三项确定性交互实验。

**Architecture:** 保持当前无框架静态 ES Modules。课程与笔记通过深度冻结数据注册并复用六个通用视图；流式生命周期、服务准入和任务投递作为独立纯函数；DOM renderer 位于模块 UI 文件，通用实验入口只合并 renderer registry。模块在全部质量门禁通过后才从 planned 激活。

**Tech Stack:** HTML、CSS、native ES Modules、Node.js `node:test`、项目 fake DOM、localStorage、Vercel 静态部署。

---

## Task 1：课程数据、资源证据和八篇知识笔记

**Create:**

- `tests/backend-engineering-data.test.js`
- `src/data/backend-engineering.js`
- `src/data/backend-engineering-notes.js`
- `src/data/backend-engineering-notes/backend-01.js` 至 `backend-08.js`

1. 先写失败测试，断言 8 lessons、29 resources、24 interviews、16 quiz、8 notes、稳定 ID、双向引用、evidence card、资源使用率、深度冻结和知识笔记数据契约。
2. 运行 `node --test tests/backend-engineering-data.test.js`，确认因模块不存在而 RED。
3. 实现 29 项资源与 evidence card；实现八节课程的 objectives、concepts、explanations、exercise、quiz、interview IDs、completion criteria。
4. 逐课撰写 20–30 分钟知识笔记。每篇 4–7 个实质 section，每段 2–4 个短段落，包含可操作例子、误区、recap 和 nextStep；所有 `sourceIds` 解析到课程资源。
5. 运行目标测试和 `npm test`，修复后提交 `feat: add AI backend engineering curriculum`。
6. 规格审查课程覆盖与证据，质量审查教学结构、边界、版权和数据契约；Important 问题回到作者修复。

## Task 2：三组确定性核心模拟

**Create:**

- `tests/backend-engineering.test.js`
- `src/core/backend-engineering.js`

1. 先为 `simulateStreamLifecycle(input)` 写失败测试：同步/流式模式、typed events、断线、应用取消、上游是否可取消、唯一终态、资源清理与非法输入。
2. RED 后最小实现并 GREEN。
3. 先为 `evaluateServiceAdmission(input)` 写失败测试：安全整数、到达率、服务时间、并发槽、队列上限、deadline；输出容量、利用率、排队、accepted/queued/rejected/timedOut 和原因。明确均值模型不是 p99 预测。
4. RED 后最小实现并 GREEN。
5. 先为 `advanceJobDelivery(state, event)` 写失败测试：submit/enqueue/lease/start/commit/ack/crash/redeliver/cancel/reconcile；稳定幂等键、重复事件、未知结果、合法状态转换、账本和输入不变性。
6. RED 后最小实现并 GREEN。
7. 运行 `node --test tests/backend-engineering.test.js` 与 `npm test`，提交 `feat: add AI backend service simulations`。
8. 规格审查三个协议和边界，质量审查不变式、错误处理、可维护性和复杂度。

## Task 3：三项可访问交互实验

**Create/modify:**

- `src/ui/backend-experiments.js`
- `src/ui/experiments.js`
- `styles/app.css`
- `tests/ui-interactions.test.js`
- `tests/static-app.test.js`

1. 先写 renderer 与真实 DOM 交互失败测试，断言三个实验可注册、控件有 label、状态有 `aria-live`、操作更新结果、reset 恢复默认、未知实验行为不回归。
2. RED 后实现 `backendExperimentRenderers`，只通过 DOM helper 创建节点，不使用 `innerHTML` 或内联事件。
3. 流式实验展示事件轨迹、客户端状态、上游状态和清理动作；容量实验展示容量预算、队列/拒绝/超时和模型边界；投递实验展示客户端状态、消息状态、effect/幂等账本和 reconcile 项。
4. CSS 复用既有视觉 token，新增必要 ledger/timeline/capacity 类；320px/390px 单列、长 ID 可断行、控件至少 44px、无强制动画。
5. 运行 UI/静态目标测试与 `npm test`，提交 `feat: add AI backend engineering labs`。
6. 规格审查实验是否真正教授课程产出，质量审查 DOM 安全、无障碍和移动端样式。

## Task 4：注册第五课程并激活模块

**Modify:**

- `src/data/courses.js`
- `src/data/modules.js`
- `tests/course-registry.test.js`
- `tests/data.test.js`
- `tests/ui-interactions.test.js`
- `README.md`

1. 先写失败测试：第五课程 registry、`#backend-engineering/*` canonical route、五课程全局 ID 唯一、前五模块 active、第五模块六视图与独立进度。
2. RED 后注册 `backendEngineering`，仅此时将 `backend-engineering` 切为 active；保持现有 prerequisites 和 `estimatedHours`，更新 README 为五个完整模块。
3. 运行目标测试、`npm test`、`node --check` 和 `git diff --check`，提交 `feat: activate AI backend engineering module`。
4. 规格审查 activation gate，质量审查共享 registry、路由、状态和 README。

## Task 5：内容审计、全量验证与浏览器验收

**Create:**

- `docs/content-audits/2026-07-24-ai-backend-engineering-knowledge-notes.md`

1. 建立逐课 outcome/quiz/interview/exercise/section/evidence coverage matrix。
2. 对八篇笔记按 100 分 rubric 评分；每篇必须至少 85 分，broken reference 为 0，记录 evidence-role 修正、时效限制、版权与测试审计。
3. 运行全量 `npm test`、全部新增/修改 JS `node --check`、`git diff --check`。
4. 启动本地静态服务器，在桌面、390px 和 320px 验收第五模块六视图、三项实验、quiz、资源、面试、进度与 reset；检查 console、单一 `h1`、横向溢出、键盘与可读性。
5. 修复全部发现并重复验证，提交 `test: verify AI backend engineering module`。
6. 请求独立最终代码审查，所有 Critical/Important 必须解决。

## Task 6：PR、合并与 Vercel Production

1. 获取最新 `origin/main`，将 feature branch 同步到当前 main，解决冲突并重跑全量验证。
2. 推送 `feat/ai-backend-engineering`，创建 PR，检查 GitHub CI 与 Vercel Preview；必要时修复并重新验证。
3. 合并 PR 后切回 main、拉取 merge commit、运行 `npm test`。
4. 使用已有 Vercel 项目链接部署 Production；等待状态 READY。
5. 核验 `https://agent-development-knowledge-map.vercel.app`、`#backend-engineering/dashboard` 和至少一节 lesson；核验部署 metadata Git SHA 等于 merge SHA。
6. 核验 GitHub Pages 保持关闭。
7. 最终交付只报告实际通过的测试数量、PR、merge SHA、Production URL/SHA、Pages 状态和已知剩余限制。

