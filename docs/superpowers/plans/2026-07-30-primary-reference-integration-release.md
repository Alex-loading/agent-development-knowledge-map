# Primary Reference Reconstruction Integration and Vercel Release Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 集成五个模块的主参考源重构与视觉系统，验证 40 节课的来源、ID、进度、渲染和移动端兼容，然后通过 PR 合并并把精确的 `main` merge SHA 部署到唯一生产目标 Vercel。

**Architecture:** 共享 primary-reference registry 保持 canonical source identity；每个课程保留全局唯一 resource ID；共享 visual index 只聚合五个模块 registry。跨模块测试负责来源影响、视觉所有权、稳定 lesson ID 和持久化兼容。部署以 Git SHA 为不可伪造的发布标识。

**Tech Stack:** 原生 ES Modules、Node.js test runner、Fake DOM、真实浏览器、Git/GitHub CLI、Vercel CLI。

---

## File responsibilities

- Modify `src/data/visuals/index.js`: 聚合五个模块的视觉 registry。
- Create `tests/primary-reference-integration.test.js`: 40 课来源、贡献和主张完整性。
- Modify `tests/visual-registry-ownership.test.js`: 从现有 LLM ownership 检查扩展到五模块 registry、placement 和资产全局一致性。
- Modify `tests/course-registry.test.js`: 全局 resource/lesson ID 唯一性。
- Modify `tests/progress.test.js`: 旧进度键和 40 课兼容性。
- Modify `tests/knowledge-visual-ui.test.js`: 五模块视觉 UI、fallback 和交互。
- Modify `README.md`: 课程现状、来源策略、视觉策略和 Vercel-only 发布说明。
- Create `docs/content-audits/2026-07-30-primary-reference-integration-release.md`: 跨模块与最终发布证据。

### Task 1: Write RED cross-module contracts

**Files:**
- Create: `tests/primary-reference-integration.test.js`
- Modify: `tests/visual-registry-ownership.test.js`
- Modify: `tests/course-registry.test.js`
- Modify: `tests/progress.test.js`

- [ ] **Step 1: Freeze all module and lesson IDs**

Assert the active module order and all 40 current lesson IDs exactly. Assert no module route changes, and simulate pre-reconstruction local progress data to prove completed lessons remain completed.

- [ ] **Step 2: Require global resource uniqueness**

Flatten all module resources and assert resource IDs are unique. For every `primary-narrative` binding, require its `canonicalSourceId` to resolve through `getPrimaryReference`; allow different course bindings to share canonical identity but never course resource ID.

- [ ] **Step 3: Require semantic source influence**

Parse all five module audits and the source claim matrix. For each module require:

```text
requested primary families: approximately 60% of material contribution
official/academic verification: approximately 30%
existing/other: approximately 10%
```

Treat percentages as a reviewed contribution classification, not word counts. Tests verify every substantive section has at least one primary narrative or verification source and every audit row has a supported contribution status; human review records the final ratio and rationale.

- [ ] **Step 4: Require global visual ownership**

Assert every placement resolves to exactly one visual, every visual has exactly one module/lesson owner, every local asset exists, every sourced figure has full permission metadata, all 40 lessons meet their module-specific minimum, and no step diagram shares state IDs with another visual.

- [ ] **Step 5: Run RED and commit**

```bash
node --test tests/primary-reference-integration.test.js \
  tests/visual-registry-ownership.test.js \
  tests/course-registry.test.js tests/progress.test.js
git add tests/primary-reference-integration.test.js \
  tests/visual-registry-ownership.test.js \
  tests/course-registry.test.js tests/progress.test.js
git commit -m "test: require cross-module reconstruction integrity"
```

Expected: FAIL until all registries and audits are integrated.

### Task 2: Integrate all visual registries

**Files:**
- Modify: `src/data/visuals/index.js`
- Modify: `tests/visual-registry-ownership.test.js`
- Modify: `tests/knowledge-visual-ui.test.js`

- [ ] **Step 1: Import all module registries**

Add imports for:

```js
llmFoundationVisuals
agentMechanismVisuals
agentHarnessVisuals
contextRagMemoryVisuals
backendEngineeringVisuals
```

Use the existing registry builder; do not create a second lookup path.

- [ ] **Step 2: Fail closed on collisions**

Make registry construction throw on duplicate visual IDs rather than last-write-wins. Keep the exported lookup immutable or expose only query functions.

- [ ] **Step 3: Extend UI tests**

For one lesson per module and for every visual kind, test figure semantics, alt text, caption, long description, step controls, keyboard behavior, image error fallback, reduced-motion behavior and safe SVG rendering.

- [ ] **Step 4: Verify and commit**

```bash
node --test tests/visual-registry-ownership.test.js \
  tests/knowledge-visual-ui.test.js \
  tests/static-app.test.js tests/ui-interactions.test.js
git add src/data/visuals/index.js \
  tests/visual-registry-ownership.test.js \
  tests/knowledge-visual-ui.test.js
git commit -m "feat: integrate module visual registries"
```

### Task 3: Perform cross-module editorial reconciliation

**Files:**
- Modify: five module data files and note files only where inconsistencies are found.
- Modify: five module content audits.
- Create: `docs/content-audits/2026-07-30-primary-reference-integration-release.md`

- [ ] **Step 1: Run a concept-boundary review**

Check and reconcile these repeated concepts:

```text
LLM context vs Agent working memory vs long-term memory
Agent loop vs Harness durable loop
tool definition vs tool execution vs MCP
workflow vs orchestration vs queue worker
checkpoint vs transcript summary vs memory
model evaluation vs Agent evaluation vs production observability
retry/idempotency in Agent logic vs backend delivery semantics
```

Choose one canonical definition, link the adjacent module boundary, and avoid copy-pasted explanations.

- [ ] **Step 2: Run a claim-verification review**

For every `volatile` or `contested` row in the claim matrix, either add official/academic evidence, narrow the statement, or mark it excluded. No unresolved claim may appear as a universal fact.

- [ ] **Step 3: Run an asset-rights review**

For every non-original visual, verify asset-level permission and attribution. If permission is absent or ambiguous, replace it with an original redraw before release. Check that downloaded assets are local and no remote hotlinks remain.

- [ ] **Step 4: Record the integration audit**

Include exact source counts, contribution ratios with rationale, all corrected/rejected claims, global ID counts, visual counts by module/provenance, permissions and unresolved limitations.

- [ ] **Step 5: Verify and commit**

```bash
node --test tests/primary-reference-integration.test.js \
  tests/visual-registry-ownership.test.js \
  tests/course-registry.test.js tests/knowledge-notes.test.js
git diff --check
git add src/data docs/content-audits
git commit -m "docs: reconcile reconstructed learning modules"
```

### Task 4: Run the complete automated release gate

- [ ] **Step 1: Run the full suite**

```bash
npm test
```

Expected: every test passes with zero skipped/failing tests unless an existing documented skip is explicitly justified in the audit.

- [ ] **Step 2: Run syntax, SVG and content checks**

```bash
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
find assets/visuals -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
rg -n "https?://[^\"'[:space:]]+\\.(svg|png|jpe?g|webp)" src assets
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]|未[完成]|similar[[:space:]]+to' \
  src/data docs/content-audits/2026-07-30-*.md
git diff --check
```

Expected: syntax and SVG checks pass; remote-media and unfinished-content scans have no matches; diff check has no output.

- [ ] **Step 3: Verify exact inventory**

Record:

```bash
git rev-parse HEAD
node --input-type=module -e "
  import { courseRegistry } from './src/data/courses.js';
  const courses = Object.values(courseRegistry);
  console.log({
    modules: courses.length,
    lessons: courses.reduce((n, course) => n + course.lessons.length, 0),
    resources: courses.reduce((n, course) => n + course.resources.length, 0),
  });
"
find assets/visuals -type f | sort | shasum -a 256
```

Expected: 5 active modules and 40 lessons; record actual resource count and asset manifest hash.

- [ ] **Step 4: Update README and commit**

Document the two primary source families, evidence hierarchy, visual permission rules, stable progress compatibility, local validation and Vercel-only deployment.

```bash
git add README.md docs/content-audits/2026-07-30-primary-reference-integration-release.md
git commit -m "docs: document primary reference learning system"
```

### Task 5: Run the local real-browser acceptance matrix

**Files:**
- Modify: `docs/content-audits/2026-07-30-primary-reference-integration-release.md`

- [ ] **Step 1: Start the no-build site**

Use the repository’s documented local server command and bind to an available localhost port. Record the command, PID/URL and exact Git SHA.

- [ ] **Step 2: Check all 40 lesson routes at desktop**

For every lesson:

```text
open route
confirm title and substantive note render
confirm all lesson visual assets return HTTP 200
confirm no browser console/page errors
confirm source cards and external links render
confirm quiz/interview/exercise tabs still work
```

- [ ] **Step 3: Check responsive widths**

At 390px and 320px, check at least every module overview plus all lessons containing step diagrams, wide comparison figures or dense labels. Require no viewport overflow, clipped controls, illegible text or trapped horizontal scroll; local figure scrolling is allowed only where intentionally designed.

- [ ] **Step 4: Check accessibility and fallback**

Keyboard through interactive step diagrams, enable reduced motion, simulate a failed image request, inspect long descriptions and verify focus visibility.

- [ ] **Step 5: Stop the local server and record evidence**

Add route counts, viewport matrix, console result, asset failures and screenshots/observations to the integration audit. Any failure returns to the owning module plan and requires rerunning Tasks 4–5.

- [ ] **Step 6: Commit browser evidence**

```bash
git add docs/content-audits/2026-07-30-primary-reference-integration-release.md
git commit -m "test: verify reconstructed modules in browser"
```

### Task 6: Synchronize with `main` and resolve conflicts

- [ ] **Step 1: Confirm branch and clean intent**

```bash
git status --short --branch
git branch --show-current
git log --oneline --decorate -8
```

Use the implementation feature branch. Do not discard unrelated user changes.

- [ ] **Step 2: Fetch and merge current `origin/main`**

```bash
git fetch origin main
git merge origin/main
```

Resolve conflicts by preserving stable IDs, canonical source bindings, five visual registries and Vercel-only instructions. Never accept a conflict resolution that enables GitHub Pages.

- [ ] **Step 3: Re-run all release gates**

```bash
npm test
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
find assets/visuals -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
git diff --check
git status --short --branch
```

- [ ] **Step 4: Commit conflict resolution if needed**

```bash
git add <resolved-files>
git commit
```

Do not create an empty conflict commit.

### Task 7: Push, create PR and verify Vercel Preview

- [ ] **Step 1: Push the implementation branch**

```bash
git push -u origin HEAD
```

Record:

```bash
BRANCH_SHA=$(git rev-parse HEAD)
echo "$BRANCH_SHA"
```

- [ ] **Step 2: Create the PR**

```bash
gh pr create \
  --base main \
  --title "Reconstruct learning modules from primary references" \
  --body-file docs/content-audits/2026-07-30-primary-reference-integration-release.md
```

The PR body must summarize sources, 40-lesson compatibility, visuals, permissions, tests and browser results.

- [ ] **Step 3: Inspect checks and Preview**

```bash
gh pr checks --watch
npx vercel@latest inspect <preview-deployment-url>
```

Require Preview state `READY` and deployment Git metadata `githubCommitSha` exactly equal to `$BRANCH_SHA`. Open representative routes for all five modules on the Preview URL and verify assets, console and mobile layout.

- [ ] **Step 4: Address failures**

If checks, Preview, or review fail, diagnose and fix on the branch, rerun all proportional gates, push again and verify the new exact SHA. Do not promote a stale Preview.

### Task 8: Merge and deploy the exact `main` SHA to Vercel Production

- [ ] **Step 1: Merge only after all gates are green**

```bash
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
MERGE_SHA=$(git rev-parse HEAD)
test "$MERGE_SHA" = "$(git rev-parse origin/main)"
echo "$MERGE_SHA"
```

- [ ] **Step 2: Re-run post-merge validation**

```bash
npm test
git status --short --branch
```

Expected: PASS and clean `main`.

- [ ] **Step 3: Deploy from the linked canonical project**

Confirm `.vercel/project.json` contains project name `agent-development-knowledge-map`, then:

```bash
npx vercel@latest deploy --prod --yes
```

Use repository root as the publish root. Do not create, enable or use GitHub Pages.

- [ ] **Step 4: Verify Vercel state and exact SHA**

```bash
npx vercel@latest inspect <production-deployment-url>
```

Require:

```text
state/status = READY
target = production
project = agent-development-knowledge-map
githubCommitSha = $MERGE_SHA
canonical alias includes https://agent-development-knowledge-map.vercel.app
```

If a direct CLI deployment lacks verifiable Git metadata, deploy/promote the Git-integrated build for `$MERGE_SHA`; do not claim completion until exact SHA is visible.

- [ ] **Step 5: Verify the public production site**

Open `https://agent-development-knowledge-map.vercel.app`, all five module dashboards, and representative lesson/visual routes. Require HTTP 200, no console errors, correct assets and 390px/320px usability.

- [ ] **Step 6: Confirm GitHub Pages remains disabled**

```bash
gh api repos/Alex-loading/agent-development-knowledge-map/pages --include
```

Expected: HTTP 404. Any configured Pages site is a release blocker and must be disabled before reporting completion.

- [ ] **Step 7: Record and commit release evidence**

Append PR number, merge SHA, Vercel deployment ID/URL/state/target/Git SHA, canonical alias checks, public route checks and Pages 404 to the integration audit. If this produces a documentation-only commit after deployment, push it and deploy that new exact `main` SHA as well; the final production SHA must always match final `main`.

```bash
git add docs/content-audits/2026-07-30-primary-reference-integration-release.md
git commit -m "docs: record primary reference production release"
git push origin main
FINAL_SHA=$(git rev-parse HEAD)
npx vercel@latest deploy --prod --yes
npx vercel@latest inspect <final-production-deployment-url>
```

- [ ] **Step 8: Final completion gate**

Report complete only when all conditions are true:

```text
40 lessons preserve IDs/routes/progress
all source, visual, test and browser gates pass
PR merged
local main = origin/main = final Vercel githubCommitSha
Vercel production READY
canonical public alias reachable
GitHub Pages disabled
worktree clean
```
