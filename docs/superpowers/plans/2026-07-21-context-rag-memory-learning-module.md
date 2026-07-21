# 上下文、RAG 与记忆学习模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Agent Learner 中开放第四个完整的「上下文、RAG 与记忆」模块，交付八节课程、28 项核验资源、24 道面试题、16 道测验和三项确定性交互实验。

**Architecture:** 保持无框架静态 ES Modules 架构。课程通过现有深度不可变 `courseRegistry` 注册并复用六个通用视图；上下文组装、混合检索/证据打包与记忆生命周期分别作为纯函数实现，DOM renderer 放入独立 UI 文件，现有实验入口只合并 registry。持久进度和按模块隔离的筛选状态继续复用现有协议，不新增迁移或通用视图特判。

**Tech Stack:** HTML、CSS、native ES Modules、Node.js `node:test`、项目 fake DOM、localStorage、Vercel 静态部署

---

## 文件结构

```text
src/data/context-rag-memory.js          课程、28 资源、24 面试题与 16 quiz
src/data/courses.js                     注册第四课程
src/data/modules.js                     将 context-rag-memory 标记为 active
src/core/context-rag-memory.js          context router、retrieval packer、memory lifecycle
src/ui/context-experiments.js           三项 Context/RAG/Memory 实验 DOM
src/ui/experiments.js                   合并新 renderer registry
styles/app.css                          新实验布局与响应式状态样式
tests/context-rag-memory-data.test.js   数据协议、数量、来源边界和引用完整性
tests/context-rag-memory.test.js        三组纯逻辑行为与边界
tests/course-registry.test.js           第四课程注册、路由与全局 ID 唯一
tests/data.test.js                      模块状态与依赖约束
tests/ui-interactions.test.js           实验、四模块隔离和六视图交互
tests/static-app.test.js                安全、README 与发布契约
README.md                               四个完整模块和扩展说明
```

## Task 1：新增完整课程数据

**Files:**
- Create: `tests/context-rag-memory-data.test.js`
- Create: `src/data/context-rag-memory.js`

- [ ] **Step 1：写失败的数据协议测试**

测试导入尚不存在的 `contextRagMemory`，断言模块 ID、标题、八个有序 lesson、16 个 quiz、28 个资源和 24 道面试题。Lesson ID 固定为 `context-01` 至 `context-08`，标题固定为：

```text
信息层次与上下文生命周期
Context Engineering 与预算分配
Conversation State、Transcript 与摘要
Retrieval Corpus、Chunk 与索引
Sparse、Dense 与 Hybrid Retrieval
Reranking、去重与证据打包
长期记忆的写入、召回与遗忘
RAG 与记忆综合设计及故障定位
```

每课断言至少两个 objectives、三个 concepts、两段 explanations、每段至少两个 keyPoints、两步 exercise、两项 completionCriteria、恰好两个 quiz 和三个 interviewQuestionIds。只允许三课绑定实验：`context-02 → context-router`、`context-05 → hybrid-retrieval`、`context-07 → memory-lifecycle`。

继续断言：

```js
assert.equal(contextRagMemory.lessons.length, 8);
assert.equal(contextRagMemory.resources.length, 28);
assert.equal(contextRagMemory.interviewQuestions.length, 24);
assert.equal(contextRagMemory.lessons.flatMap(({ quiz }) => quiz).length, 16);
assert.ok(contextRagMemory.resources.every(({ verifiedAt }) => verifiedAt === '2026-07-21'));
assert.ok(contextRagMemory.resources.every(({ url }) => new URL(url).protocol === 'https:'));
```

验证所有 lesson/resource/quiz/interview/experiment ID 在课程内唯一；资源和面试题双向引用可解析；每个资源至少被一课引用；资源 `value` 同时含“学习用途”和“证据边界”；每题包含 shortAnswer、两个 deepDive、misconceptions、followUps、frequency、difficulty、roles；顶层和嵌套对象均深度冻结。

- [ ] **Step 2：运行数据测试并确认 RED**

Run: `node --test tests/context-rag-memory-data.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/context-rag-memory.js`.

- [ ] **Step 3：实现 28 项核验资源**

资源 URL 固定为：

```text
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://aclanthology.org/2024.tacl-1.9/
https://developers.openai.com/api/docs/guides/compaction
https://developers.openai.com/api/docs/guides/embeddings
https://aclanthology.org/2020.emnlp-main.550/
https://research.google/pubs/reciprocal-rank-fusion-outperforms-condorcet-and-individual-rank-learning-methods/
https://www.anthropic.com/engineering/contextual-retrieval
https://developers.openai.com/api/docs/guides/retrieval
https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html
https://developers.openai.com/api/docs/guides/citation-formatting
https://aclanthology.org/2023.emnlp-main.398/
https://openreview.net/forum?id=wCu6T5xFjeJ
https://aclanthology.org/2024.eacl-demo.16/
https://docs.langchain.com/oss/python/concepts/memory
https://openreview.net/forum?id=1i6ZCvflQJ
https://arxiv.org/abs/2310.08560
https://ojs.aaai.org/index.php/AAAI/article/view/29946
https://github.com/xiaowu0162/LongMemEval
https://developers.openai.com/api/docs/guides/your-data
https://github.com/langchain-ai/rag-from-scratch
https://github.com/datawhalechina/llm-universe
https://github.com/datawhalechina/all-in-rag
https://github.com/datawhalechina/hello-agents
https://wakeup-jin.github.io/Practical-Guide-to-Context-Engineering/
https://huggingface.co/learn/agents-course/unit3/agentic-rag/agentic-rag
https://ragflow.com.cn/docs
https://www.bilibili.com/video/BV1Sb421E74u/
https://www.youtube.com/watch?v=lVdajtNpaGI
```

每项资源使用 `res-context-*` ID，包含 title、url、source、language、type、difficulty、stage、value、verifiedAt；视频额外包含 platform。不要把厂商实验收益、框架默认值、模型 token 上限或 API 字段写成永久事实。小红书、抖音和普通知乎内容不进入资源数组。

- [ ] **Step 4：实现八节课程、16 道 quiz 和 24 道面试题**

面试题标题固定为：

```text
prompt context、conversation state、corpus、checkpoint、长期记忆有什么区别？
Context engineering 与 prompt engineering 有何区别？
一条知识如何从源文档进入模型上下文？
如何管理有限 context window？
滑窗、摘要和 retrieval 应怎么选？
Context 越长效果一定越好吗？
Transcript、conversation state、summary 的区别？
如何安全压缩长会话？
用户修改了先前事实，状态如何更新？
如何设计 chunking？
Corpus 如何处理版本和失效？
source document、retrieval unit、citation unit 有何不同？
Sparse、dense、hybrid retrieval 怎么选？
top-k、threshold 和 metadata filter 如何配合？
Query rewrite 有什么价值和风险？
为什么需要 reranker？
为什么需要去重和多样性？
RAG 中有引用为什么仍会答错？
什么是长期记忆，什么时候写？
Semantic、episodic、procedural memory 怎么理解？
如何处理冲突、过期和删除？
RAG 答错时如何诊断？
RAG、fine-tuning 和长期记忆如何选？
请设计上下文、RAG 与记忆架构。
```

`src/data/context-rag-memory.js` 使用现有 `deepFreeze` 模式导出：

```js
export const contextRagMemory = deepFreeze({
  id: 'context-rag-memory',
  title: '上下文、RAG 与记忆',
  summary: '把会话状态、检索语料与长期记忆投影成来源清楚、预算有界的模型上下文。',
  lessons,
  resources,
  interviewQuestions,
});
```

解释必须明确：checkpoint 不是长期记忆；summary 是有损派生物；index 不是 corpus 本身；dense 不总优于 sparse；检索到证据不等于生成忠实；引用不自动证明 claim；长期记忆必须可更新、过期和删除。

- [ ] **Step 5：确认 GREEN、回归并提交**

Run: `node --test tests/context-rag-memory-data.test.js`

Expected: PASS with 8 lessons, 28 resources, 24 questions and 16 quiz items.

Run: `npm test`

Expected: all baseline and new data tests pass.

```bash
git add src/data/context-rag-memory.js tests/context-rag-memory-data.test.js
git commit -m "feat: add context RAG and memory curriculum"
```

## Task 2：实现三组确定性纯逻辑

**Files:**
- Create: `tests/context-rag-memory.test.js`
- Create: `src/core/context-rag-memory.js`

- [ ] **Step 1：写 context router 失败测试**

定义 `assembleContext(items, inputLimit, outputReserve, policy)`。测试 required instruction/current turn 先纳入；checkpoint 与未投影 corpus document 返回 `not-projectable`；expired 与 superseded 返回明确原因；`recent-first` 和 `evidence-first` 有稳定不同顺序；刚好装满成功；required 总量超过输入预算返回 `unassemblable: true` 且不静默删除；重复 ID、非法 layer/projection、负数或非安全整数 tokenCost、输出预留大于总上限抛出清晰错误。输入不得被修改。

返回协议：

```js
{
  included: [{ id, originLayer, projectionType, tokenCost, sourceRef }],
  excluded: [{ id, reason }],
  inputBudget,
  used,
  remaining,
  unassemblable,
  reason,
}
```

- [ ] **Step 2：运行 router 测试并确认 RED**

Run: `node --test --test-name-pattern="context router|assembleContext" tests/context-rag-memory.test.js`

Expected: FAIL because `src/core/context-rag-memory.js` does not exist.

- [ ] **Step 3：最小实现 router 并确认 GREEN**

允许 layer：`static-instruction / current-turn / conversation-state / corpus / checkpoint / long-term-memory`；允许 projection：`instruction / current-turn / state-projection / retrieval-evidence / memory-projection / raw`。`raw checkpoint` 与 `raw corpus` 不可直接进入。排序先 required，再按策略、priority、timestamp、ID 稳定决胜。所有数组和对象使用新值返回。

Run: `node --test --test-name-pattern="context router|assembleContext" tests/context-rag-memory.test.js`

Expected: PASS.

- [ ] **Step 4：写 hybrid retrieval 失败测试**

定义 `retrieveAndPack(corpus, query, options)`。每个教学 chunk 含 `id/documentId/version/department/language/tokenCost/terms/denseScore/sourceRef`。测试 query token overlap 产生 sparse score；`alpha=0/1` 分别只使用 sparse/dense；metadata filter 在 top-k 前应用；threshold 和 topK 正确；同分按 ID；`latestVersionOnly` 排除旧版本；dedupe 移除同文档重复；context budget 记录被排除项；citation manifest 可回源；空 query、非法 alpha/topK/threshold/budget、重复 chunk ID 和非有限 denseScore 抛错。输入不得修改。

返回协议：

```js
{
  trace: [{ id, sparseScore, denseScore, hybridScore, filteredReason }],
  ranked: [],
  packed: [],
  excluded: [{ id, reason }],
  citations: [{ chunkId, documentId, version, sourceRef }],
  used,
  remaining,
}
```

- [ ] **Step 5：实现 retrieval packer 并确认 GREEN**

词法分数使用大小写无关的唯一 query term overlap 比例；hybrid 分数为 `alpha * dense + (1 - alpha) * sparse`；所有数值舍入只用于 UI，内部保持 number。过滤、排序、去重、预算打包顺序固定，禁止真实随机和网络调用。

Run: `node --test --test-name-pattern="hybrid retrieval|retrieveAndPack" tests/context-rag-memory.test.js`

Expected: PASS.

- [ ] **Step 6：写 memory lifecycle 失败测试**

定义 `applyMemoryEvent(memoryState, event, policy, now)` 与 `recallMemory(memoryState, query, now)`。测试：显式保存 → `store`；同值重复 → `no-op`；新纠正 supersede 旧值；低置信 observe 拒绝；禁止 sensitivity 拒绝；TTL 到期不再 recall；delete 后不再召回；subject/scope 不匹配不泄漏；同分记录按 observedAt 后 ID 稳定排序；非法事件、倒退时钟、重复 record ID、空 subject/key/sourceRef 抛错。所有时间由输入提供，不读取真实时钟。

- [ ] **Step 7：实现 memory lifecycle、全量验证并提交**

状态协议为 `{ clock, records }`，每条 record 带 `id/subject/key/value/scope/sourceRef/confidence/sensitivity/observedAt/expiresAt/status/supersededBy/deletedAt`。事件只接受 `observe / explicit-save / correct / delete / advance-time`；召回返回 `{ records, projection, excluded }`，projection 与存储记录分开。

Run: `node --test tests/context-rag-memory.test.js`

Expected: all context/RAG/memory core tests pass.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/core/context-rag-memory.js tests/context-rag-memory.test.js
git commit -m "feat: add context RAG and memory simulations"
```

## Task 3：实现三项可访问交互实验

**Files:**
- Create: `src/ui/context-experiments.js`
- Modify: `src/ui/experiments.js`
- Modify: `styles/app.css`
- Modify: `tests/ui-interactions.test.js`

- [ ] **Step 1：写 renderer 与 DOM 交互失败测试**

在 fake DOM 中断言 `renderExperiment('context-router')`、`renderExperiment('hybrid-retrieval')`、`renderExperiment('memory-lifecycle')` 返回各自 lab；所有状态区具有 `aria-live="polite"` 和明确标题；控件都有 label；改变策略/过滤/预算或点击事件按钮会更新结果；reset 恢复默认值；焦点保留在触发控件；未知实验降级行为不变。

- [ ] **Step 2：运行目标测试并确认 RED**

Run: `node --test --test-name-pattern="context router experiment|hybrid retrieval experiment|memory lifecycle experiment" tests/ui-interactions.test.js`

Expected: FAIL because Context/RAG/Memory renderers are not registered.

- [ ] **Step 3：实现 renderer registry 和 Context Router**

`src/ui/context-experiments.js` 导出冻结映射：

```js
export const contextExperimentRenderers = Object.freeze({
  'context-router': renderContextRouterExperiment,
  'hybrid-retrieval': renderHybridRetrievalExperiment,
  'memory-lifecycle': renderMemoryLifecycleExperiment,
});
```

Context Router 提供 recent-first/evidence-first、input limit 和 output reserve 控件，显示 included manifest、excluded reason 与预算；使用固定教学 items，不接受真实敏感内容。

- [ ] **Step 4：实现 Hybrid Retrieval 和 Memory Lifecycle UI**

Hybrid Retrieval 提供 query preset、department/language/latest-version filter、alpha、topK、threshold、dedupe 与 budget，展示 trace、排名、packed evidence 和 citation。Memory Lifecycle 提供预置 observe/save/correct/delete/advance-time 事件，显示 decision、active/superseded/expired/deleted records 和 subject-scoped recall。所有示例文案明确“教学分数/逻辑时钟/非真实隐私存储”。

`src/ui/experiments.js` 只导入并展开 registry：

```js
import { contextExperimentRenderers } from './context-experiments.js';

const experimentRenderers = Object.freeze({
  'token-budget': renderTokenBudgetExperiment,
  attention: renderAttentionExperiment,
  sampling: renderSamplingExperiment,
  ...agentExperimentRenderers,
  ...harnessExperimentRenderers,
  ...contextExperimentRenderers,
});
```

- [ ] **Step 5：补充响应式样式并确认 GREEN**

复用现有 token、`experiment-lab`、`experiment-grid` 和按钮样式；新增 context manifest、retrieval trace/score bar、memory ledger 的必要类。320px/390px 下改为单列，长 ID 与 URL 可断行，控件和按钮最小高度保持 44px；`prefers-reduced-motion` 不新增强制动画。

Run: `node --test tests/ui-interactions.test.js`

Expected: all UI interaction tests pass.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/ui/context-experiments.js src/ui/experiments.js styles/app.css tests/ui-interactions.test.js
git commit -m "feat: add context RAG and memory labs"
```

## Task 4：注册并开放第四模块

**Files:**
- Modify: `tests/course-registry.test.js`
- Modify: `tests/data.test.js`
- Modify: `tests/ui-interactions.test.js`
- Modify: `src/data/courses.js`
- Modify: `src/data/modules.js`

- [ ] **Step 1：写第四课程注册与路由失败测试**

更新 registry 测试为数据驱动的四课程断言，并显式验证：

```js
assert.equal(getCourse('context-rag-memory'), contextRagMemory);
assert.deepEqual(resolveRoute('#context-rag-memory/dashboard'), {
  hash: '#context-rag-memory/dashboard',
  moduleId: 'context-rag-memory',
  view: 'dashboard',
});
assert.deepEqual(resolveRoute('#context-rag-memory/lesson/context-01'), {
  hash: '#context-rag-memory/lesson/context-01',
  moduleId: 'context-rag-memory',
  view: 'lesson',
  lessonId: 'context-01',
});
```

验证所有课程 lesson/resource/quiz/interview/experiment ID 全局唯一。更新模块目录测试为前四个 active、后四个 planned；第四模块 prerequisites 保持 `llm-foundation` 与 `agent-mechanism`。

- [ ] **Step 2：运行目标测试并确认 RED**

Run: `node --test tests/course-registry.test.js tests/data.test.js`

Expected: FAIL because the new course is not registered and the module is still planned.

- [ ] **Step 3：注册课程并最后激活模块**

在 `src/data/courses.js` 导入 `contextRagMemory` 并追加到冻结 registry；在 `src/data/modules.js` 将 `context-rag-memory.status` 改为 `active`。不要修改通用路由实现。

- [ ] **Step 4：写四模块状态隔离与六视图测试**

把资源筛选、面试展开、lesson/quiz/interview progress、模块切换和六视图测试从“三模块”改为遍历 `Object.values(courseRegistry)`；显式从第四模块切到前三模块再切回，断言每门课程的过滤、展开和进度独立。验证第四模块 dashboard/curriculum/map/resources/interviews/progress 和三个 lesson 实验 route 都只有一个 `h1`，导航后焦点落到 main。

- [ ] **Step 5：确认 GREEN、回归并提交**

Run: `node --test tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js`

Expected: all registry, catalog and UI integration tests pass.

Run: `npm test`

Expected: all tests pass.

```bash
git add src/data/courses.js src/data/modules.js tests/course-registry.test.js tests/data.test.js tests/ui-interactions.test.js
git commit -m "feat: activate context RAG and memory module"
```

## Task 5：更新发布文档与静态契约

**Files:**
- Modify: `tests/static-app.test.js`
- Modify: `README.md`

- [ ] **Step 1：写 README/静态发布失败测试**

扩展现有数据派生契约，断言 README 的完整模块数等于 active registry 数、规划模块数等于 catalog planned 数；每门 active 课程都有数据派生 lesson/resource/interview/quiz 数量和 canonical dashboard/first-lesson route；所有第四模块 lesson 与三个实验有映射；README 提及 `src/data/context-rag-memory.js`、`src/core/context-rag-memory.js`、`src/ui/context-experiments.js`；通用视图不硬编码新 module ID；全项目仍无 `innerHTML` 和 inline event handler。

- [ ] **Step 2：运行静态测试并确认 RED**

Run: `node --test tests/static-app.test.js`

Expected: FAIL because README still describes three active and five planned modules and lacks Context/RAG/Memory files/routes.

- [ ] **Step 3：更新 README**

把发布说明改为四个完整模块和四个规划模块；增加：

```text
#context-rag-memory/dashboard
#context-rag-memory/lesson/context-01
```

记录八节课程、28 资源、24 面试题、16 quiz、三个实验及边界；更新项目树、架构说明、扩展协议、测试说明和模块责任边界。不得把 RAG 写成向量数据库同义词，不得承诺消除幻觉或真实隐私合规。

- [ ] **Step 4：全量验证并提交**

Run: `node --test tests/static-app.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

Run: `find src tests -name '*.js' -exec node --check {} \;`

Expected: exit 0.

Run: `git diff --check origin/main..HEAD`

Expected: no output, exit 0.

```bash
git add README.md tests/static-app.test.js
git commit -m "docs: document context RAG and memory module"
```

## 最终审查、浏览器验收与发布

- [ ] 为整个 `origin/main..HEAD` 分支派发最终规格/代码质量审查；所有 Critical/Important 问题必须修复并复审。
- [ ] 启动本地静态站点，在真实浏览器验收四模块切换、第四模块六视图、资源 28/28、面试 24/24、三个实验和控制台。
- [ ] 在 1280px、390px、320px 验证单一 `h1`、无横向溢出、44px 触控目标、焦点与 live region。
- [ ] 运行 fresh `npm test`、JavaScript syntax check、`git diff --check` 和 `git status -sb`。
- [ ] 审计并行 LLM 知识笔记 worktree；只合并本分支与已明确完成的用户改动，不覆盖或清理其工作区。
- [ ] 按用户既定选择安全合并到 `main`，在合并结果重新运行完整测试，推送 GitHub，执行 Vercel production deployment。
- [ ] 在线验收正式域名 `#context-rag-memory/dashboard`、资源、面试、三个实验和浏览器控制台；最后将生产页面标记为 deliverable。
