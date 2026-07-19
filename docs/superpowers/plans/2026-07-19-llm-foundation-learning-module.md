# LLM Foundation Learning Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file Agent knowledge map with an extensible, data-driven learning site whose first complete module teaches LLM foundations through lessons, experiments, resources, quizzes, progress tracking, and interview review.

**Architecture:** Keep the site framework-free and statically deployable. ES modules separate immutable course data, pure core logic, persistence, and DOM views; the dashboard, curriculum, map, resources, interviews, and progress views derive from the same module data and versioned progress state.

**Tech Stack:** HTML5, CSS, JavaScript ES Modules, browser `localStorage`, Node.js 20 built-in test runner, Python static server for local verification.

---

## File Map

```text
index.html                         semantic application shell
package.json                       scripts for tests and local serving
README.md                          setup, architecture, extension guide
styles/tokens.css                  visual tokens for the paper-lab theme
styles/app.css                     responsive layout and component styles
src/app.js                         startup, hash navigation, event coordination
src/data/modules.js                module catalog and planned-module metadata
src/data/llm-foundation.js         lessons, resources, quizzes, interviews
src/core/progress.js               progress state and aggregate calculations
src/core/storage.js                localStorage adapter and memory fallback
src/core/filters.js                resource/interview filters
src/core/quiz.js                   quiz scoring
src/core/experiments.js            token, attention, temperature/top-p math
src/core/view-models.js            derived models used by DOM views
src/ui/dom.js                      safe DOM creation helpers
src/ui/shell.js                    header, module rail, tab navigation
src/ui/dashboard.js                recommended next step and mini-map
src/ui/curriculum.js               lesson list and lesson detail
src/ui/knowledge-map.js            dependency map
src/ui/resources.js                resource filters and cards
src/ui/interviews.js               reveal, mastery, review queue
src/ui/progress-view.js            progress summaries and reset flow
src/ui/experiments.js              three interactive experiment panels
tests/progress.test.js             progress behavior
tests/storage.test.js              persistence and fallback
tests/data.test.js                 content integrity
tests/learning-logic.test.js       filters, quizzes, experiments, view models
tests/static-app.test.js           HTML/CSS/static integration checks
```

### Task 1: Test Harness and Progress Domain

**Files:**
- Create: `package.json`
- Create: `tests/progress.test.js`
- Create: `src/core/progress.js`

- [ ] **Step 1: Create the test runner configuration**

```json
{
  "name": "agent-development-knowledge-map",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "serve": "python3 -m http.server 4173"
  }
}
```

- [ ] **Step 2: Write failing progress tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultProgress,
  markLessonComplete,
  setInterviewStatus,
  summarizeProgress,
} from '../src/core/progress.js';

test('creates an empty versioned progress state', () => {
  assert.deepEqual(createDefaultProgress('llm-foundation'), {
    version: 1,
    currentModuleId: 'llm-foundation',
    currentLessonId: 'llm-01',
    completedLessonIds: [],
    quizResults: {},
    interviewStatusById: {},
    reviewQueue: [],
    lastVisitedAt: null,
  });
});

test('marks lessons without duplicates and keeps interview progress separate', () => {
  const initial = createDefaultProgress('llm-foundation');
  const learned = markLessonComplete(markLessonComplete(initial, 'llm-01'), 'llm-01');
  const reviewed = setInterviewStatus(learned, 'iq-attention', 'mastered');
  assert.deepEqual(reviewed.completedLessonIds, ['llm-01']);
  assert.equal(reviewed.interviewStatusById['iq-attention'], 'mastered');
});

test('summarizes curriculum and interview mastery independently', () => {
  const state = {
    ...createDefaultProgress('llm-foundation'),
    completedLessonIds: ['llm-01', 'llm-02'],
    interviewStatusById: { q1: 'mastered', q2: 'reviewing' },
  };
  assert.deepEqual(summarizeProgress(state, 8, 4), {
    lessonsCompleted: 2,
    lessonPercent: 25,
    interviewsMastered: 1,
    interviewPercent: 25,
  });
});
```

- [ ] **Step 3: Run the test and confirm RED**

Run: `npm test -- tests/progress.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/core/progress.js`.

- [ ] **Step 4: Implement immutable progress operations**

```js
export const PROGRESS_VERSION = 1;

export function createDefaultProgress(moduleId, firstLessonId = 'llm-01') {
  return {
    version: PROGRESS_VERSION,
    currentModuleId: moduleId,
    currentLessonId: firstLessonId,
    completedLessonIds: [],
    quizResults: {},
    interviewStatusById: {},
    reviewQueue: [],
    lastVisitedAt: null,
  };
}

export function markLessonComplete(state, lessonId) {
  return state.completedLessonIds.includes(lessonId)
    ? state
    : { ...state, completedLessonIds: [...state.completedLessonIds, lessonId] };
}

export function setInterviewStatus(state, questionId, status) {
  return {
    ...state,
    interviewStatusById: { ...state.interviewStatusById, [questionId]: status },
  };
}

export function summarizeProgress(state, lessonTotal, interviewTotal) {
  const interviewsMastered = Object.values(state.interviewStatusById)
    .filter((status) => status === 'mastered').length;
  return {
    lessonsCompleted: state.completedLessonIds.length,
    lessonPercent: lessonTotal === 0 ? 0 : Math.round(state.completedLessonIds.length / lessonTotal * 100),
    interviewsMastered,
    interviewPercent: interviewTotal === 0 ? 0 : Math.round(interviewsMastered / interviewTotal * 100),
  };
}
```

- [ ] **Step 5: Run the progress tests and confirm GREEN**

Run: `npm test -- tests/progress.test.js`

Expected: 3 tests pass, 0 fail.

- [ ] **Step 6: Commit**

```bash
git add package.json tests/progress.test.js src/core/progress.js
git commit -m "feat: add learning progress domain"
```

### Task 2: Versioned Persistence with Memory Fallback

**Files:**
- Create: `tests/storage.test.js`
- Create: `src/core/storage.js`
- Modify: `src/core/progress.js`

- [ ] **Step 1: Write failing storage tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProgress } from '../src/core/progress.js';
import { createProgressStore } from '../src/core/storage.js';

test('persists and reloads valid progress', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const store = createProgressStore(storage);
  const state = { ...createDefaultProgress('llm-foundation'), completedLessonIds: ['llm-01'] };
  store.save(state);
  assert.deepEqual(store.load(), state);
});

test('returns defaults for corrupt storage', () => {
  const storage = { getItem: () => '{broken', setItem() {}, removeItem() {} };
  const store = createProgressStore(storage);
  assert.deepEqual(store.load(), createDefaultProgress('llm-foundation'));
});

test('falls back to memory when storage throws', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} };
  const store = createProgressStore(storage);
  const state = { ...createDefaultProgress('llm-foundation'), currentLessonId: 'llm-03' };
  store.save(state);
  assert.equal(store.load().currentLessonId, 'llm-03');
  assert.equal(store.mode(), 'memory');
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/storage.test.js`

Expected: FAIL because `src/core/storage.js` does not exist.

- [ ] **Step 3: Implement the storage adapter**

Implement `createProgressStore(storage, key = 'agent-learner:progress:v1')` with a closure-held memory value. `load()` parses JSON, validates `version === 1` and array/object fields, otherwise returns `createDefaultProgress('llm-foundation')`; `save()` writes JSON and always updates memory; `reset()` removes only the named key; `mode()` returns `local` until a storage operation throws, then `memory`.

- [ ] **Step 4: Run storage and progress tests**

Run: `npm test -- tests/storage.test.js tests/progress.test.js`

Expected: 6 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add tests/storage.test.js src/core/storage.js src/core/progress.js
git commit -m "feat: persist learning progress safely"
```

### Task 3: Module Catalog and Complete LLM Content

**Files:**
- Create: `tests/data.test.js`
- Create: `src/data/modules.js`
- Create: `src/data/llm-foundation.js`

- [ ] **Step 1: Write failing content-integrity tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { modules } from '../src/data/modules.js';
import { llmFoundation } from '../src/data/llm-foundation.js';

test('publishes one active module and extensible planned modules', () => {
  assert.equal(modules[0].id, 'llm-foundation');
  assert.equal(modules[0].status, 'active');
  assert.ok(modules.slice(1).every((module) => module.status === 'planned'));
  assert.ok(modules.every((module) => Array.isArray(module.prerequisites)));
});

test('contains eight ordered, self-contained LLM lessons', () => {
  assert.equal(llmFoundation.lessons.length, 8);
  assert.deepEqual(llmFoundation.lessons.map((lesson) => lesson.id),
    ['llm-01','llm-02','llm-03','llm-04','llm-05','llm-06','llm-07','llm-08']);
  for (const lesson of llmFoundation.lessons) {
    assert.ok(lesson.objectives.length >= 2);
    assert.ok(lesson.concepts.length >= 3);
    assert.ok(lesson.exercise.steps.length >= 2);
    assert.ok(lesson.quiz.length >= 2);
    assert.ok(lesson.completionCriteria.length >= 2);
  }
});

test('keeps resources verifiable and all cross references valid', () => {
  const resourceIds = new Set(llmFoundation.resources.map((resource) => resource.id));
  const lessonIds = new Set(llmFoundation.lessons.map((lesson) => lesson.id));
  for (const resource of llmFoundation.resources) {
    assert.match(resource.url, /^https:\/\//);
    assert.match(resource.verifiedAt, /^2026-/);
  }
  for (const lesson of llmFoundation.lessons) {
    assert.ok(lesson.resourceIds.every((id) => resourceIds.has(id)));
  }
  for (const question of llmFoundation.interviewQuestions) {
    assert.ok(lessonIds.has(question.lessonId));
    assert.ok(question.shortAnswer.length > 20);
    assert.ok(question.deepDive.length >= 2);
    assert.ok(question.misconceptions.length >= 1);
    assert.ok(question.followUps.length >= 1);
    assert.ok(question.roles.length >= 1);
  }
});
```

- [ ] **Step 2: Run the data test and confirm RED**

Run: `npm test -- tests/data.test.js`

Expected: FAIL because both data modules are missing.

- [ ] **Step 3: Create the module catalog**

Define ordered modules for `llm-foundation`, `agent-mechanism`, `agent-harness`, `context-rag-memory`, `backend-engineering`, `evals-observability-security`, `multi-agent-mcp`, and `career-delivery`. Only `llm-foundation` is active. Every planned module includes a concise description, prerequisites, estimated hours, and the four promised content categories.

- [ ] **Step 4: Create the eight LLM lessons**

Implement the exact eight lessons and completion outputs from the approved design. Each lesson must include substantive Chinese explanations, at least two quiz questions with `id`, `prompt`, `choices`, `answerIndex`, and `explanation`, plus one concrete exercise. Do not use filler text or unverified numerical claims.

- [ ] **Step 5: Add curated resources**

Include the verified core resources from Microsoft, Hugging Face, Karpathy, Sebastian Raschka, Datawhale, OpenAI, Anthropic, Stanford/Google/fast.ai, Bilibili, and YouTube. Each resource includes source, language, type, difficulty, stage, value, and `verifiedAt: '2026-07-15'`.

- [ ] **Step 6: Add the LLM interview bank**

Create at least 24 questions: three per lesson. Every question includes a 30-second answer, deep-dive bullets, misconception bullets, follow-ups, frequency, difficulty, roles, and its lesson ID. Cover Attention/Transformer, token/embedding/context, pretraining/SFT/alignment, inference/sampling/KV cache, Prompt/JSON Schema, hallucination/evals/security, and application-vs-model-development tradeoffs.

- [ ] **Step 7: Run the data integrity test**

Run: `npm test -- tests/data.test.js`

Expected: 3 tests pass, 0 fail.

- [ ] **Step 8: Commit**

```bash
git add tests/data.test.js src/data/modules.js src/data/llm-foundation.js
git commit -m "feat: add LLM curriculum and interview bank"
```

### Task 4: Learning Logic and Experiments

**Files:**
- Create: `tests/learning-logic.test.js`
- Create: `src/core/filters.js`
- Create: `src/core/quiz.js`
- Create: `src/core/experiments.js`
- Create: `src/core/view-models.js`

- [ ] **Step 1: Write failing tests for filters, quizzes, and experiments**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterResources, filterInterviewQuestions } from '../src/core/filters.js';
import { scoreQuiz } from '../src/core/quiz.js';
import { estimateContextBudget, normalizeAttention, sampleDistribution } from '../src/core/experiments.js';

test('combines resource filters without mutating input', () => {
  const items = [
    { id: 'a', language: 'zh', type: 'video', difficulty: 'beginner' },
    { id: 'b', language: 'en', type: 'course', difficulty: 'beginner' },
  ];
  assert.deepEqual(filterResources(items, { language: 'zh', type: 'video' }).map((item) => item.id), ['a']);
  assert.equal(items.length, 2);
});

test('filters interviews by role, frequency, and status', () => {
  const items = [{ id: 'q1', roles: ['agent'], frequency: 'high' }, { id: 'q2', roles: ['backend'], frequency: 'medium' }];
  assert.deepEqual(filterInterviewQuestions(items, { role: 'agent', frequency: 'high' }, { q1: 'reviewing' }).map((item) => item.id), ['q1']);
});

test('scores quiz answers and returns explanations', () => {
  const quiz = [{ answerIndex: 1, explanation: 'because attention normalizes scores' }];
  assert.deepEqual(scoreQuiz(quiz, [1]), { correct: 1, total: 1, percent: 100, results: [{ correct: true, explanation: 'because attention normalizes scores' }] });
});

test('estimates a transparent teaching context budget', () => {
  assert.deepEqual(estimateContextBudget({ system: 100, history: 300, retrieval: 500, output: 200, limit: 1200 }), { used: 1100, remaining: 100, percent: 92, overflow: false });
});

test('normalizes attention and applies temperature/top-p', () => {
  assert.deepEqual(normalizeAttention([1, 1, 2]).map((n) => Number(n.toFixed(2))), [0.25, 0.25, 0.5]);
  const distribution = sampleDistribution([{ token: 'A', logit: 2 }, { token: 'B', logit: 1 }, { token: 'C', logit: 0 }], 1, 0.8);
  assert.equal(distribution[0].token, 'A');
  assert.ok(distribution.filter((item) => item.inNucleus).reduce((sum, item) => sum + item.probability, 0) >= 0.8);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/learning-logic.test.js`

Expected: FAIL because the four core modules do not exist.

- [ ] **Step 3: Implement filters and quiz scoring**

Implement inclusive `all` defaults, role membership via `roles.includes(role)`, and immutable array filtering. `scoreQuiz` compares selected indices, returns per-question correctness and explanations, and rounds percent to an integer.

- [ ] **Step 4: Implement experiment math**

`estimateContextBudget` sums named non-negative budgets. `normalizeAttention` clamps negative values to zero and returns equal weights when the sum is zero. `sampleDistribution` uses numerically stable softmax on `logit / temperature`, sorts descending, and marks the smallest prefix whose cumulative probability reaches top-p.

- [ ] **Step 5: Implement view models**

Add `getNextLesson(lessons, progress)`, `buildKnowledgeNodes(lessons, progress)`, `getDueInterviewQuestions(questions, progress)`, and `getRecentActivity(progress)`. These functions contain no DOM calls and always return new arrays/objects.

- [ ] **Step 6: Run the learning logic tests**

Run: `npm test -- tests/learning-logic.test.js`

Expected: 5 or more tests pass, 0 fail.

- [ ] **Step 7: Commit**

```bash
git add tests/learning-logic.test.js src/core/filters.js src/core/quiz.js src/core/experiments.js src/core/view-models.js
git commit -m "feat: add learning interactions and experiments"
```

### Task 5: Static Application Shell and Paper-Lab Theme

**Files:**
- Replace: `index.html`
- Create: `styles/tokens.css`
- Create: `styles/app.css`
- Create: `src/ui/dom.js`
- Create: `src/ui/shell.js`
- Create: `src/app.js`
- Create: `tests/static-app.test.js`

- [ ] **Step 1: Write failing static shell tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('serves a semantic ES-module application without the legacy iframe', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<main[^>]+id="app-main"/);
  assert.match(html, /<nav[^>]+aria-label="学习模块"/);
  assert.match(html, /<script type="module" src="\.\/src\/app\.js"><\/script>/);
  assert.doesNotMatch(html, /<iframe/);
});

test('declares responsive and reduced-motion styles', async () => {
  const css = await readFile(new URL('../styles/app.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/static-app.test.js`

Expected: FAIL because the old HTML contains an iframe and `styles/app.css` is missing.

- [ ] **Step 3: Replace the HTML shell**

Create a semantic page with skip link, header, `nav[aria-label="学习模块"]`, tab navigation, storage-mode notice, `main#app-main`, and a polite live region. Link `tokens.css`, `app.css`, and `src/app.js`; use no inline event handlers.

- [ ] **Step 4: Implement theme tokens and responsive layout**

Define paper, ink, forest, vermilion, ochre, muted, border, focus, font, spacing, and motion tokens. Use an editorial grid, paper-rule separators, strong typographic hierarchy, visible focus rings, a mobile breakpoint, and reduced-motion overrides. Avoid generic purple gradients and excessive floating rounded cards.

- [ ] **Step 5: Implement safe DOM helpers and shell rendering**

`dom.js` exposes `element(tag, options, children)`, `button(label, options)`, and `externalLink(resource)`, assigning text with `textContent`. `shell.js` renders modules and tabs with `aria-current`, disables planned modules access without hiding their descriptions, and emits callback events through `addEventListener`.

- [ ] **Step 6: Implement startup and hash navigation**

`app.js` loads data and progress, normalizes routes such as `#llm-foundation/dashboard` and `#llm-foundation/lesson/llm-04`, renders the shell, and updates the active view. Unknown hashes fall back to the LLM dashboard without throwing.

- [ ] **Step 7: Run static and core tests**

Run: `npm test`

Expected: all current tests pass, 0 fail.

- [ ] **Step 8: Commit**

```bash
git add index.html styles src/ui/dom.js src/ui/shell.js src/app.js tests/static-app.test.js
git commit -m "feat: build the paper-lab application shell"
```

### Task 6: Dashboard, Curriculum, and Knowledge Map

**Files:**
- Create: `src/ui/dashboard.js`
- Create: `src/ui/curriculum.js`
- Create: `src/ui/knowledge-map.js`
- Modify: `src/app.js`
- Modify: `tests/learning-logic.test.js`

- [ ] **Step 1: Add failing view-model tests**

Add assertions that `getNextLesson` returns the first incomplete lesson, returns the final lesson when all are complete, and that `buildKnowledgeNodes` marks nodes `complete`, `current`, or `locked` from lesson order and progress.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test -- tests/learning-logic.test.js`

Expected: FAIL on the new completion/locking assertions.

- [ ] **Step 3: Update view models to pass**

Implement the exact status rules: completed IDs are `complete`; the first incomplete lesson is `current`; later lessons are `available` when their `prerequisites` are complete, otherwise `locked`.

- [ ] **Step 4: Render the dashboard**

Show recommended next lesson, separate curriculum/interview progress, a compact map, last-visited timestamp, and up to three review questions. The primary action navigates to the recommended lesson.

- [ ] **Step 5: Render curriculum and lesson detail**

The curriculum lists eight ordered lessons with duration and completion state. A lesson detail renders objectives, concept explanations, resource links, exercise steps, quiz form, related interviews, completion criteria, and a completion button that persists state.

- [ ] **Step 6: Render the knowledge map**

Use an accessible ordered dependency path rather than a canvas. Nodes are buttons with visible state, prerequisite labels, and click navigation; locked nodes remain inspectable but explain their prerequisite.

- [ ] **Step 7: Run tests and manually smoke-test navigation**

Run: `npm test`

Run: `npm run serve`

Expected: tests pass; dashboard, lesson list, lesson detail, and map routes load without console errors.

- [ ] **Step 8: Commit**

```bash
git add src/ui/dashboard.js src/ui/curriculum.js src/ui/knowledge-map.js src/app.js tests/learning-logic.test.js
git commit -m "feat: add guided curriculum and knowledge map"
```

### Task 7: Resources, Interviews, and Progress Views

**Files:**
- Create: `src/ui/resources.js`
- Create: `src/ui/interviews.js`
- Create: `src/ui/progress-view.js`
- Modify: `src/app.js`
- Modify: `src/core/progress.js`
- Modify: `tests/progress.test.js`

- [ ] **Step 1: Write failing review-queue and reset tests**

Add tests for `toggleReviewQueue(state, questionId)`, `recordQuizResult(state, lessonId, result)`, and `resetModuleProgress(state, moduleId)` ensuring unrelated application keys are never touched by progress logic.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test -- tests/progress.test.js`

Expected: FAIL because the three operations are missing.

- [ ] **Step 3: Implement progress operations**

All operations return new state. Review IDs are unique; quiz results are keyed by lesson ID; reset returns `createDefaultProgress(moduleId)`.

- [ ] **Step 4: Render the resource library**

Provide select controls for language, platform/source, type, and difficulty. Show active filter count, empty state, verified date, learning value, and safe HTTPS links opened in a new tab.

- [ ] **Step 5: Render the interview system**

Provide role/frequency/difficulty/status filters. Cards initially show only the question and metadata; reveal answer on demand. Render 30-second answer, deep-dive points, misconceptions, follow-ups, linked lesson, mastery controls, and review-queue toggle.

- [ ] **Step 6: Render progress and reset**

Show separate lesson and interview statistics, completed lessons, queued reviews, last visit, and storage mode. Reset uses a native confirmation step inside the page and calls only `progressStore.reset()` after explicit confirmation.

- [ ] **Step 7: Run tests and smoke-test persistence**

Run: `npm test`

Expected: all tests pass. In the browser, completing a lesson and mastering an interview survives reload; reset clears only Agent Learner progress.

- [ ] **Step 8: Commit**

```bash
git add src/ui/resources.js src/ui/interviews.js src/ui/progress-view.js src/app.js src/core/progress.js tests/progress.test.js
git commit -m "feat: add resources interviews and progress views"
```

### Task 8: Interactive Experiment Panels

**Files:**
- Create: `src/ui/experiments.js`
- Modify: `src/ui/curriculum.js`
- Modify: `styles/app.css`
- Modify: `tests/learning-logic.test.js`

- [ ] **Step 1: Add failing edge-case tests**

Test zero attention weights, temperature clamping at a safe minimum, top-p bounds, negative budget rejection, and deterministic ordering for equal logits.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test -- tests/learning-logic.test.js`

Expected: at least one new edge-case assertion fails.

- [ ] **Step 3: Harden experiment functions**

Clamp Temperature to `0.05..2`, Top-p to `0.05..1`, reject negative budgets with `RangeError`, preserve original token order for equal probabilities, and return equal attention weights when every input is zero.

- [ ] **Step 4: Build the Token budget panel**

Use range/number controls for system, history, retrieval, output, and limit. Label the calculation as a teaching approximation and show used, remaining, percent, and overflow state.

- [ ] **Step 5: Build the Attention panel**

Render a short sentence as selectable token buttons and weight sliders. Show normalized weights as bars and a concise explanation of which tokens the selected token reads most strongly.

- [ ] **Step 6: Build the sampling panel**

Render fixed candidates, Temperature and Top-p controls, probability bars, and nucleus inclusion. Include stable-answer and creative-writing presets without making model-quality claims.

- [ ] **Step 7: Integrate experiments into lessons 3, 4, and 6**

Map experiment IDs from lesson data to render functions. All controls use labels, keyboard-accessible inputs, live output regions, and reset buttons.

- [ ] **Step 8: Run tests and commit**

Run: `npm test`

Expected: all tests pass.

```bash
git add src/ui/experiments.js src/ui/curriculum.js styles/app.css src/core/experiments.js tests/learning-logic.test.js
git commit -m "feat: add interactive LLM concept labs"
```

### Task 9: Accessibility, Documentation, and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `styles/app.css`
- Modify: `index.html`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1: Expand failing static checks**

Add assertions for a skip link, live region, viewport meta, Chinese page language, no inline event attributes, `rel="noopener noreferrer"` support in the external-link helper, and descriptive document title.

- [ ] **Step 2: Run the static test and confirm RED**

Run: `npm test -- tests/static-app.test.js`

Expected: one or more new checks fail before final accessibility fixes.

- [ ] **Step 3: Apply accessibility and responsive fixes**

Ensure heading order, landmark labels, focus management after route changes, 44px touch targets on mobile, non-color state indicators, and no horizontal overflow at 320px. Preserve the paper-lab design at desktop and mobile sizes.

- [ ] **Step 4: Rewrite README**

Document `npm test`, `npm run serve`, static deployment, file responsibilities, progress privacy/local-only behavior, how to add a module using the four content categories, resource verification rules, and current module status.

- [ ] **Step 5: Run fresh automated verification**

Run: `npm test`

Expected: all tests pass, 0 fail.

Run: `git diff --check`

Expected: no output, exit 0.

- [ ] **Step 6: Run the site and perform visual verification**

Run: `npm run serve`

Inspect at desktop and mobile widths. Verify all six views, three experiments, resource filters, quiz feedback, interview reveal/mastery/review, persistence, reset, external links, keyboard focus, and reduced-motion behavior. Capture screenshots for review.

- [ ] **Step 7: Commit**

```bash
git add README.md index.html styles/app.css tests/static-app.test.js
git commit -m "docs: finalize Agent Learner module guide"
```

- [ ] **Step 8: Final status audit**

Run: `git status --short`

Expected: clean worktree; if user-owned files exist, report them without modifying them.

Run: `git log --oneline -10`

Expected: the design commit plus implementation commits for progress, storage, content, learning logic, shell, curriculum/map, resources/interviews/progress, experiments, and documentation.
