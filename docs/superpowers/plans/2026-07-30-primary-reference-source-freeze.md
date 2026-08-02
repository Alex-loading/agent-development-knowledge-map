# Primary Reference Source Freeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 冻结飞书 Harness 101 与 JavaGuide `/ai/` 文章的正文、元数据、内容 hash、媒体候选和课程主张，并为五个模块提供可复用的一级参考源绑定契约。

**Architecture:** 原始正文只写入被 Git 忽略的 `.research-cache/primary-references/`；仓库提交 canonical registry、课程绑定工厂、研究清单和主张矩阵。课程仍拥有全局唯一 resource ID，共享 registry 只提供 canonical source identity，避免同一资源 ID 跨课程重复。

**Tech Stack:** 原生 ES Modules、Node.js test runner、`lark-cli`、Fetch API、SHA-256、项目 evidence/visual contracts。

---

## File responsibilities

- Create `scripts/freeze-primary-references.mjs`: 递归抓取 JavaGuide `/ai/`，读取飞书 Wiki 节点和文档，生成本地私有快照。
- Create `src/data/primary-references.js`: 可提交的 canonical source registry 与查询函数。
- Create `src/data/primary-reference-bindings.js`: 把 canonical source 绑定为课程内全局唯一 resource/evidence 对象。
- Create `tests/primary-references.test.js`: registry、hash、来源层级、隐私与课程绑定契约。
- Create `docs/research/2026-07-30-primary-reference-inventory.md`: 页面、访问、时效、媒体与许可清单。
- Create `docs/research/2026-07-30-primary-reference-claim-matrix.md`: 主张到模块/lesson/section 的映射与状态。
- Modify `.gitignore`: 忽略 `.research-cache/`。

### Task 1: Freeze the baseline and write RED source-contract tests

**Files:**
- Create: `tests/primary-references.test.js`
- Test: `tests/course-registry.test.js`

- [ ] **Step 1: Record the clean baseline**

Run:

```bash
git status --short --branch
npm test
git rev-parse HEAD
git rev-parse origin/main
```

Expected: worktree clean; full test suite passes; HEAD and origin/main values are written into the source inventory audit.

- [ ] **Step 2: Write the failing registry test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRIMARY_SOURCE_FAMILIES,
  primaryReferences,
} from '../src/data/primary-references.js';
import { createPrimaryReferenceBinding } from '../src/data/primary-reference-bindings.js';

const SHA256 = /^sha256:[a-f0-9]{64}$/;

test('primary references freeze both requested source families', () => {
  assert.deepEqual(PRIMARY_SOURCE_FAMILIES, Object.freeze([
    'feishu-harness-101',
    'javaguide-ai',
  ]));
  assert.ok(primaryReferences.length >= 16);
  assert.equal(
    new Set(primaryReferences.map(({ id }) => id)).size,
    primaryReferences.length,
  );
  assert.ok(primaryReferences.some(({ canonicalUrl }) => (
    canonicalUrl === 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe'
  )));
  assert.ok(primaryReferences.some(({ canonicalUrl }) => (
    canonicalUrl === 'https://javaguide.cn/ai/'
  )));
});

test('every primary reference has attributable, dated and hashed metadata', () => {
  for (const source of primaryReferences) {
    assert.match(source.id, /^primary-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(PRIMARY_SOURCE_FAMILIES.includes(source.sourceFamily));
    assert.equal(source.sourceTier, 'primary-narrative');
    assert.match(source.canonicalUrl, /^https:\/\//);
    assert.match(source.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(source.contentHash, SHA256);
    assert.ok(['full', 'partial'].includes(source.bodyAccess));
    assert.ok(source.title.trim().length > 0);
    assert.ok(source.publisherOrAuthor.trim().length > 0);
    assert.ok(Object.isFrozen(source));
  }
});

test('course bindings keep global IDs unique without copying canonical identity', () => {
  const binding = createPrimaryReferenceBinding({
    id: 'res-harness-primary-react-loop',
    canonicalSourceId: 'primary-feishu-react-loop',
    stage: 'Agent Loop',
    difficulty: '入门到进阶',
    value: '用于解释单轮、多轮和停止条件。',
    evidence: {
      authority: 'expert',
      role: 'core',
      coverage: ['单轮与多轮 Agent Loop'],
      limitations: '工程教学材料；产品行为与协议字段需官方资料校验。',
      verifiedAt: '2026-07-30',
    },
  });
  assert.equal(binding.id, 'res-harness-primary-react-loop');
  assert.equal(binding.canonicalSourceId, 'primary-feishu-react-loop');
  assert.equal(binding.sourceFamily, 'feishu-harness-101');
  assert.ok(Object.isFrozen(binding));
  assert.ok(Object.isFrozen(binding.evidence));
});
```

- [ ] **Step 3: Run the RED test**

Run:

```bash
node --test tests/primary-references.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/primary-references.js`.

- [ ] **Step 4: Commit the RED test**

```bash
git add tests/primary-references.test.js
git commit -m "test: require primary reference registry"
```

### Task 2: Build a private, repeatable source snapshot

**Files:**
- Create: `scripts/freeze-primary-references.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Ignore private source bodies**

Append this exact entry:

```gitignore
.research-cache/
```

- [ ] **Step 2: Implement normalization and hashing**

```js
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const outputDir = new URL('../.research-cache/primary-references/', import.meta.url);
const normalize = (value) => value.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
const hash = (value) => `sha256:${createHash('sha256').update(normalize(value)).digest('hex')}`;
```

- [ ] **Step 3: Implement JavaGuide `/ai/` BFS**

Use a queue seeded with `https://javaguide.cn/ai/`. Accept only URLs whose origin is `https://javaguide.cn` and pathname starts with `/ai/`; strip fragments and query parameters; exclude `/ai-coding/`. Save response status, canonical URL, normalized HTML and hash for every successful body.

```js
const allowedJavaGuideUrl = (value) => {
  const url = new URL(value, 'https://javaguide.cn/ai/');
  return url.origin === 'https://javaguide.cn'
    && url.pathname.startsWith('/ai/')
    && !url.pathname.startsWith('/ai-coding/');
};
```

- [ ] **Step 4: Implement Feishu Wiki traversal**

Call these CLI commands with `execFileAsync`, parse their JSON envelopes, and reject any response where `ok !== true`:

```js
await execFileAsync('lark-cli', [
  'wiki', '+node-list',
  '--space-id', '7641116018563255484',
  '--parent-node-token', 'L082wubkdie8uMkRUjgceKYQnIe',
  '--page-all', '--page-limit', '30',
  '--as', 'user', '--format', 'json',
]);
```

For the root and every returned `node_token`, call:

```js
await execFileAsync('lark-cli', [
  'docs', '+fetch',
  '--doc', nodeToken,
  '--detail', 'simple',
  '--format', 'json',
]);
```

Save node token, object token, revision, title, normalized XML, media tags and content hash only under `.research-cache/`.

- [ ] **Step 5: Run the snapshot**

Run:

```bash
node scripts/freeze-primary-references.mjs
```

Expected: `.research-cache/primary-references/manifest.json` exists; it includes the root plus 15 Feishu children and every reachable JavaGuide `/ai/` article; no raw body appears in `git status`.

- [ ] **Step 6: Commit the snapshot tooling**

```bash
git add .gitignore scripts/freeze-primary-references.mjs
git commit -m "chore: add private primary source freezer"
```

### Task 3: Publish the canonical registry and binding factory

**Files:**
- Create: `src/data/primary-references.js`
- Create: `src/data/primary-reference-bindings.js`
- Modify: `tests/primary-references.test.js`

- [ ] **Step 1: Add immutable canonical records**

Create one record for the root, 15 Feishu children and every frozen JavaGuide article. Use IDs such as:

```js
Object.freeze({
  id: 'primary-feishu-react-loop',
  title: 'Harness 101：从 ReAct Loop 讲起',
  canonicalUrl: 'https://my.feishu.cn/wiki/N94ZwtUv4iVsUtkvWAYchNKWnhb',
  sourceFamily: 'feishu-harness-101',
  sourceTier: 'primary-narrative',
  publisherOrAuthor: 'Harness 101',
  bodyAccess: 'full',
  retrievedAt: '2026-07-30',
  updatedAt: null,
  contentHash: snapshotHash,
  mediaDecision: 'permission-review-required',
})
```

`snapshotHash` must be copied from the generated manifest rather than invented.

- [ ] **Step 2: Add immutable lookups**

```js
export const PRIMARY_SOURCE_FAMILIES = Object.freeze([
  'feishu-harness-101',
  'javaguide-ai',
]);

export const primaryReferences = Object.freeze(records);
const primaryReferencesById = new Map(
  primaryReferences.map((source) => [source.id, source]),
);

export function getPrimaryReference(id) {
  return primaryReferencesById.get(id) ?? null;
}
```

- [ ] **Step 3: Implement the binding factory**

```js
export function createPrimaryReferenceBinding(input) {
  const source = getPrimaryReference(input.canonicalSourceId);
  if (!source) throw new TypeError(`Unknown primary source: ${input.canonicalSourceId}`);
  const evidence = Object.freeze({ ...input.evidence });
  return Object.freeze({
    id: input.id,
    title: source.title,
    url: source.canonicalUrl,
    source: source.publisherOrAuthor,
    language: '中文',
    type: '一级参考资料',
    difficulty: input.difficulty,
    stage: input.stage,
    value: input.value,
    canonicalSourceId: source.id,
    sourceFamily: source.sourceFamily,
    sourceTier: source.sourceTier,
    evidence,
  });
}
```

- [ ] **Step 4: Add invalid-input and deep-freeze tests**

Assert duplicate canonical IDs, invalid hashes, a missing canonical source, an invented source family, empty limitations and unknown evidence enums all fail.

- [ ] **Step 5: Run targeted tests**

Run:

```bash
node --test tests/primary-references.test.js tests/course-registry.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/primary-references.js src/data/primary-reference-bindings.js tests/primary-references.test.js
git commit -m "feat: add primary reference registry"
```

### Task 4: Freeze the research inventory, claim matrix and media decisions

**Files:**
- Create: `docs/research/2026-07-30-primary-reference-inventory.md`
- Create: `docs/research/2026-07-30-primary-reference-claim-matrix.md`
- Modify: `tests/primary-references.test.js`

- [ ] **Step 1: Write the source inventory**

For every source record, include canonical ID, title, canonical URL, body access, retrieved/updated dates, content hash, module candidates, media count, permission evidence and limitations. Record failed or redirected routes instead of silently deleting them.

- [ ] **Step 2: Write the claim matrix**

Use this exact column set:

```text
claimId | statement | status | primarySourceIds | verificationNeed
moduleId | lessonId | plannedSection | sourceContribution | limitations
```

Allow only `verified`, `contested`, `volatile`, `license-blocked`, and `source-unavailable`. Allow only `adopted`, `corrected`, `deepened`, `rejected`, and `duplicate`.

- [ ] **Step 3: Add document-derived contract tests**

Parse both Markdown tables and assert:

```js
assert.equal(new Set(sourceIds).size, sourceIds.length);
assert.ok(claimRows.every(({ primarySourceIds }) => primarySourceIds.length > 0));
assert.ok(claimRows.every(({ moduleId }) => activeModuleIds.has(moduleId)));
assert.ok(claimRows.every(({ lessonId }) => stableLessonIds.has(lessonId)));
```

- [ ] **Step 4: Run source gates**

Run:

```bash
node --test tests/primary-references.test.js
rg -n -i 'T[O]DO|T[B]D|p[l]aceholder|待[补]' \
  docs/research/2026-07-30-primary-reference-inventory.md \
  docs/research/2026-07-30-primary-reference-claim-matrix.md
git diff --check
```

Expected: tests pass; `rg` has no matches and exits 1; `git diff --check` has no output.

- [ ] **Step 5: Commit**

```bash
git add docs/research/2026-07-30-primary-reference-inventory.md \
  docs/research/2026-07-30-primary-reference-claim-matrix.md \
  tests/primary-references.test.js
git commit -m "docs: freeze primary reference evidence"
```

### Task 5: Verify the source-freeze deliverable

- [ ] **Step 1: Run all data tests**

```bash
node --test tests/primary-references.test.js tests/course-registry.test.js tests/data.test.js
```

Expected: PASS.

- [ ] **Step 2: Run full regression**

```bash
npm test
find src tests scripts \( -name '*.js' -o -name '*.mjs' \) -exec node --check {} \;
git diff --check
git status --short --branch
```

Expected: all tests pass; syntax and diff checks succeed; status contains only intentional plan-tracked changes before the final commit and is clean after it.

- [ ] **Step 3: Record the freeze evidence**

Append exact commands, exit codes, source counts, access failures, license-blocked media count and registry hash to `docs/research/2026-07-30-primary-reference-inventory.md`.

- [ ] **Step 4: Commit final audit**

```bash
git add docs/research/2026-07-30-primary-reference-inventory.md
git commit -m "test: verify primary reference freeze"
```
