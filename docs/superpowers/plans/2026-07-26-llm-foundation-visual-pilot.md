# LLM Foundation Visual Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an evidence-audited, accessible visual teaching system to all eight LLM foundation knowledge notes, validate it in production, and fold the proven workflow back into the reusable Agent Learner module skills.

**Architecture:** Keep lesson prose as pure data and add stable `visualId` references plus insertion positions. Resolve those references through a deeply frozen visual registry whose records point only to local static assets or an allowlisted generic step-diagram renderer; a dedicated UI component renders semantic figures, attribution, long descriptions, fallbacks, and keyboard-safe step controls. Original diagrams are preferred, while third-party figures are downloaded only after explicit redistribution and modification permissions are recorded.

**Tech Stack:** Native ES modules, plain JavaScript, local SVG/WebP assets, semantic HTML, CSS, Node.js test runner, project Fake DOM, real-browser verification, GitHub PR, Vercel Preview and Production.

---

## File Structure

Create or modify the following units:

```text
assets/visuals/llm-foundation/
  llm-01-*.svg
  llm-02-*.svg
  ...
  llm-08-*.svg

src/data/visuals/visual-contract.js
  Visual enums, record validation and deep-freeze helpers.

src/data/visuals/llm-foundation-visuals.js
  The complete module-1 visual registry and attribution metadata.

src/data/visuals/index.js
  The globally unique, deeply frozen visual registry exposed to renderers.

src/ui/knowledge-visual.js
  Static/source figure rendering, long descriptions, failure fallback and generic step controls.

src/ui/knowledge-note.js
  Overview and paragraph-anchored visual insertion without changing notes that have no visuals.

styles/app.css
  Paper-lab figure styles, responsive layouts, interaction and reduced-motion behavior.

src/data/llm-foundation-notes/llm-01.js ... llm-08.js
  `overviewVisualId` and section-level `visuals` references.

tests/knowledge-visual-contract.test.js
  Unit tests for valid and invalid visual records.

tests/llm-foundation-visual-data.test.js
  Registry, note/file/source/license/coverage and recursive-freeze tests.

tests/knowledge-visual-ui.test.js
  Figure rendering, insertion order, fallback, long-description and step-control tests.

tests/static-app.test.js
  Static safety, CSS, responsive and documentation contracts.

docs/research/2026-07-26-llm-foundation-visual-inventory.md
  Per-figure cognitive question, evidence, license decision and storyboard.

docs/content-audits/2026-07-26-llm-foundation-visuals.md
  Final content, attribution, test, browser and deployment audit.

.agents/skills/build-learning-module-notes/
.agents/skills/build-agent-learner-module/
  Reusable visual inventory, license, data and release gates after the pilot passes.
```

Do not add a generic diagram editor, arbitrary HTML/SVG strings in course data, runtime remote images, or lesson-specific branches in shared views.

### Task 1: Release Preflight, Isolated Worktree and Baseline

**Files:**
- Read: `AGENTS.md`
- Read: `README.md`
- Read: `.vercel/project.json`
- No product files modified

- [ ] **Step 1: Verify the repository and deployment baseline**

Run:

```bash
git status -sb
git rev-parse HEAD origin/main
git log -5 --oneline --decorate
sed -n '1,80p' AGENTS.md
sed -n '170,190p' README.md
```

Expected: the design commit is present, unrelated user changes are absent, and Vercel is the only production provider.

- [ ] **Step 2: Preflight GitHub access before feature work**

Run:

```bash
gh auth status
gh api repos/Alex-loading/agent-development-knowledge-map --jq '{name,private,default_branch}'
```

Expected: authenticated as the intended account and the private repository returns `default_branch: "main"`. If either command fails, repair authentication now; do not wait until release.

- [ ] **Step 3: Preflight the linked Vercel project**

Run:

```bash
test -f .vercel/project.json
sed -n '1,80p' .vercel/project.json
vercel whoami
```

Expected: project `agent-development-knowledge-map`, the established team/project IDs, and an authenticated Vercel account. If the CLI is unavailable, record the existing REST/API authentication path before continuing.

- [ ] **Step 4: Create the implementation worktree**

Use `superpowers:using-git-worktrees` to create branch `feat/llm-foundation-visual-system` from the confirmed design commit. In the new worktree run:

```bash
git status -sb
npm test
git diff --check
```

Expected: clean feature branch and the current full suite passes with zero failures.

- [ ] **Step 5: Record the baseline**

Add the exact branch, SHA, test count, commands, GitHub authentication result, Vercel project identity and current production URL to the opening section of:

```text
docs/content-audits/2026-07-26-llm-foundation-visuals.md
```

Do not call the module visualized or deployed in this baseline entry.

### Task 2: Freeze the Visual Claim, Source and License Inventory

**Files:**
- Create: `docs/research/2026-07-26-llm-foundation-visual-inventory.md`
- Read: `src/data/llm-foundation.js`
- Read: `src/data/llm-foundation-notes/llm-01.js` through `llm-08.js`
- Read: `.agents/skills/build-learning-module-notes/references/source-policy.md`

- [ ] **Step 1: Create the inventory table**

Start the document with this exact schema:

```markdown
| visualId | lesson / section | cognitive question | visual form | assessed coverage | sourceIds | candidate image URL | permission evidence | decision | storyboard | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

Allowed `decision` values are:

- `original-synthesis`
- `licensed-reproduction`
- `licensed-adaptation`
- `official-media`
- `link-only-original-replacement`

Allowed `status` values are `verified` and `blocked`. No row may remain `candidate`, `unknown`, or blank when the inventory is frozen.

- [ ] **Step 2: Populate 32–48 cognitive visuals**

For every lesson add:

- one overview/system visual;
- at least two mechanism/process/relationship visuals;
- one boundary/comparison/failure/decision visual;
- additional visuals only when they answer a different cognitive question.

Use the eight-lesson inventory in the approved design as the minimum cognitive map. Each row must name one note section and at least one objective, quiz, exercise criterion or interview judgment that the visual helps explain.

- [ ] **Step 3: Audit third-party image permissions**

For every promising figure in a paper, official document, open course or third-party learning resource:

1. open the original body, not a search thumbnail;
2. identify the creator and original figure context;
3. open the applicable license or media policy;
4. record whether redistribution and modification are explicitly allowed;
5. choose `licensed-*` only when permission is verified;
6. otherwise choose `link-only-original-replacement`.

Record the actual license/policy URL and quote no more than the minimal permission phrase needed for the audit.

- [ ] **Step 4: Write a complete storyboard for each row**

Each storyboard must state:

```text
Reading order:
Nodes/regions:
Edges or comparison axes:
Color-independent encoding:
One-sentence caption conclusion:
Alt summary:
Long-description outline:
```

Do not write “draw a flowchart” without the nodes, edges and conclusion.

- [ ] **Step 5: Review and commit the frozen inventory**

Run:

```bash
rg -n 'TBD|TODO|unknown|candidate|待定|来源不明' docs/research/2026-07-26-llm-foundation-visual-inventory.md
git diff --check
```

Expected: no unresolved rows or placeholders. Commit:

```bash
git add docs/research/2026-07-26-llm-foundation-visual-inventory.md docs/content-audits/2026-07-26-llm-foundation-visuals.md
git commit -m "docs: freeze LLM visual evidence inventory"
```

### Task 3: Define and Test the Visual Data Contract

**Files:**
- Create: `tests/knowledge-visual-contract.test.js`
- Create: `src/data/visuals/visual-contract.js`

- [ ] **Step 1: Write failing contract tests**

Create tests covering:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deepFreezeVisual,
  validateVisualAsset,
} from '../src/data/visuals/visual-contract.js';

const original = {
  id: 'visual-llm-01-field-map',
  kind: 'diagram',
  role: 'overview',
  title: 'AI 领域关系',
  alt: 'AI 包含机器学习，机器学习包含深度学习，LLM 位于生成式深度学习范围',
  longDescription: '从外到内描述 AI、机器学习、深度学习和 LLM，并标出生成模型交叉范围。',
  caption: 'LLM 是生成式深度学习模型的一类，不等于全部 AI。',
  assetPath: 'assets/visuals/llm-foundation/llm-01-field-map.svg',
  width: 1200,
  height: 675,
  provenance: 'original-synthesis',
  sourceIds: ['res-ms-ai'],
  credit: 'Agent Learner 原创整理',
  permission: null,
  verifiedAt: '2026-07-26',
};

test('accepts a complete original teaching diagram', () => {
  assert.deepEqual(validateVisualAsset(original), []);
});

test('rejects remote assets, HTML and unsafe SVG paths', () => {
  for (const assetPath of [
    'https://example.com/figure.svg',
    '<svg onload="alert(1)">',
    'assets/visuals/../secret.svg',
  ]) {
    assert.ok(validateVisualAsset({ ...original, assetPath }).length > 0);
  }
});

test('requires explicit redistribution and modification permission', () => {
  const sourceFigure = {
    ...original,
    provenance: 'licensed-adaptation',
    creator: 'Example Author',
    sourceUrl: 'https://example.com/article',
    sourceFigure: 'Figure 2',
    permission: {
      basis: 'license',
      name: 'CC BY 4.0',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      allowsRedistribution: true,
      allowsModification: false,
    },
    retrievedAt: '2026-07-26',
    modifications: ['translated labels'],
  };
  assert.match(validateVisualAsset(sourceFigure).join(' '), /modification/i);
});

test('deep-freezes nested step and permission records', () => {
  const frozen = deepFreezeVisual({
    ...original,
    kind: 'step-diagram',
    steps: [{
      id: 'match',
      title: '匹配',
      description: 'Q 与 K 形成相似度分数。',
      assetPath: 'assets/visuals/llm-foundation/llm-04-qkv-step-01.svg',
      alt: 'Q 与三个 K 比较',
    }],
  });
  assert.ok(Object.isFrozen(frozen));
  assert.ok(Object.isFrozen(frozen.steps));
  assert.ok(Object.isFrozen(frozen.steps[0]));
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test tests/knowledge-visual-contract.test.js
```

Expected: FAIL because `visual-contract.js` does not exist.

- [ ] **Step 3: Implement the minimal contract**

Implement:

```js
export const VISUAL_KINDS = Object.freeze([
  'diagram',
  'source-figure',
  'step-diagram',
]);

export const VISUAL_PROVENANCE = Object.freeze([
  'original-synthesis',
  'licensed-reproduction',
  'licensed-adaptation',
  'official-media',
]);

export const VISUAL_ROLES = Object.freeze([
  'overview',
  'mechanism',
  'process',
  'comparison',
  'boundary',
  'decision',
]);

const LOCAL_ASSET = /^assets\/visuals\/[a-z0-9/_-]+\.(svg|webp|png|jpe?g)$/;
const HTTPS_URL = /^https:\/\//;
const PERMISSION_BASES = Object.freeze([
  'license',
  'public-domain',
  'official-media-policy',
]);

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function deepFreezeVisual(value) {
  if (!value || typeof value !== 'object') return value;
  for (const nested of Object.values(value)) deepFreezeVisual(nested);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export function validateVisualAsset(asset) {
  const errors = [];
  for (const field of ['id', 'role', 'title', 'alt', 'caption', 'assetPath', 'provenance', 'verifiedAt']) {
    if (!isText(asset?.[field])) errors.push(`${field} is required`);
  }
  if (!Number.isInteger(asset?.width) || asset.width <= 0) errors.push('width must be a positive integer');
  if (!Number.isInteger(asset?.height) || asset.height <= 0) errors.push('height must be a positive integer');
  if (!/^visual-[a-z0-9-]+$/.test(asset?.id ?? '')) errors.push('id must be stable kebab-case');
  if (!VISUAL_KINDS.includes(asset?.kind)) errors.push('kind is not allowed');
  if (!VISUAL_ROLES.includes(asset?.role)) errors.push('role is not allowed');
  if (!VISUAL_PROVENANCE.includes(asset?.provenance)) errors.push('provenance is not allowed');
  if (!LOCAL_ASSET.test(asset?.assetPath ?? '')) errors.push('assetPath must be a safe local visual asset');
  if (!Array.isArray(asset?.sourceIds) || asset.sourceIds.length === 0) errors.push('sourceIds are required');
  if (asset?.kind !== 'diagram' && !isText(asset?.longDescription)) errors.push('longDescription is required');

  if (asset?.provenance !== 'original-synthesis') {
    if (asset?.kind !== 'source-figure') errors.push('sourced provenance requires source-figure kind');
    for (const field of ['creator', 'sourceUrl', 'sourceFigure', 'retrievedAt']) {
      if (!isText(asset?.[field])) errors.push(`${field} is required for sourced figures`);
    }
    if (!HTTPS_URL.test(asset?.sourceUrl ?? '')) errors.push('sourceUrl must use HTTPS');
    const permission = asset?.permission;
    if (!permission || permission.allowsRedistribution !== true) {
      errors.push('redistribution permission is required');
    }
    if (!PERMISSION_BASES.includes(permission?.basis)) errors.push('permission basis is not allowed');
    if (!isText(permission?.name)) errors.push('permission name is required');
    if (!HTTPS_URL.test(permission?.url ?? '')) errors.push('permission URL must use HTTPS');
    if (!Array.isArray(asset?.modifications)) errors.push('modifications must be recorded');
    if ((asset?.modifications?.length ?? 0) > 0 && permission?.allowsModification !== true) {
      errors.push('modification permission is required');
    }
  }

  if (asset?.kind === 'step-diagram') {
    if (asset?.provenance !== 'original-synthesis') errors.push('step-diagram must be an original synthesis');
    if (!Array.isArray(asset.steps) || asset.steps.length < 2) errors.push('step-diagram requires at least two steps');
    for (const step of asset.steps ?? []) {
      if (!isText(step.id) || !isText(step.title) || !isText(step.description)
        || !isText(step.alt) || !LOCAL_ASSET.test(step.assetPath ?? '')) {
        errors.push('each step requires safe, complete fields');
      }
    }
  }
  return errors;
}
```

- [ ] **Step 4: Run the contract tests**

Run:

```bash
node --test tests/knowledge-visual-contract.test.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/visuals/visual-contract.js tests/knowledge-visual-contract.test.js
git commit -m "feat: define knowledge visual contract"
```

### Task 4: Seed the Frozen Registry and Cross-Reference Tests

**Files:**
- Create: `src/data/visuals/llm-foundation-visuals.js`
- Create: `src/data/visuals/index.js`
- Create: `tests/llm-foundation-visual-data.test.js`
- Create: `assets/visuals/llm-foundation/`

- [ ] **Step 1: Write the failing registry tests**

The tests must:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { llmFoundation } from '../src/data/llm-foundation.js';
import {
  knowledgeVisuals,
  knowledgeVisualsById,
} from '../src/data/visuals/index.js';
import { validateVisualAsset } from '../src/data/visuals/visual-contract.js';

test('publishes a unique and deeply frozen LLM visual registry', () => {
  assert.equal(new Set(knowledgeVisuals.map(({ id }) => id)).size, knowledgeVisuals.length);
  assert.equal(Object.keys(knowledgeVisualsById).length, knowledgeVisuals.length);
  assert.ok(Object.isFrozen(knowledgeVisuals));
  assert.ok(Object.isFrozen(knowledgeVisualsById));
  for (const visual of knowledgeVisuals) {
    assert.deepEqual(validateVisualAsset(visual), [], visual.id);
    assert.ok(Object.isFrozen(visual), visual.id);
  }
});

test('resolves every note visual to a local asset and lesson evidence', async () => {
  for (const lesson of llmFoundation.lessons) {
    const references = [
      lesson.knowledgeNote.overviewVisualId,
      ...lesson.knowledgeNote.sections.flatMap((section) => (
        section.visuals?.map(({ visualId }) => visualId) ?? []
      )),
    ].filter(Boolean);
    for (const visualId of references) {
      const visual = knowledgeVisualsById[visualId];
      assert.ok(visual, `${lesson.id}:${visualId}`);
      for (const assetPath of [
        visual.assetPath,
        ...(visual.steps?.map((step) => step.assetPath) ?? []),
      ]) {
        await access(assetPath);
      }
      for (const sourceId of visual.sourceIds) {
        assert.ok(lesson.resourceIds.includes(sourceId), `${lesson.id}:${visualId}:${sourceId}`);
        assert.ok(lesson.evidence[sourceId], `${lesson.id}:${visualId}:${sourceId}`);
      }
    }
  }
});

test('keeps static SVG assets free from active content and remote loads', async () => {
  for (const visual of knowledgeVisuals) {
    const assetPaths = [
      visual.assetPath,
      ...(visual.steps?.map((step) => step.assetPath) ?? []),
    ].filter((assetPath) => assetPath.endsWith('.svg'));
    for (const assetPath of assetPaths) {
      const svg = await readFile(assetPath, 'utf8');
      assert.doesNotMatch(svg, /<script|foreignObject|\\son\\w+=|https?:\\/\\//i, `${visual.id}:${assetPath}`);
      assert.match(svg, /<title[ >]/, `${visual.id}:${assetPath}: SVG title`);
      assert.match(svg, /<desc[ >]/, `${visual.id}:${assetPath}: SVG desc`);
    }
  }
});
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
node --test tests/llm-foundation-visual-data.test.js
```

Expected: FAIL because the registry and note references do not yet exist.

- [ ] **Step 3: Create the first safe local SVG**

Create `assets/visuals/llm-foundation/llm-01-field-map.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">AI、机器学习、深度学习与 LLM 的关系</title>
  <desc id="desc">AI 是最外层领域，机器学习位于其中，深度学习位于机器学习中，LLM 是生成式深度学习模型的一类。</desc>
  <rect width="1200" height="675" fill="#f7f2e8"/>
  <rect x="80" y="70" width="1040" height="535" rx="36" fill="#edf4f0" stroke="#315449" stroke-width="6"/>
  <text x="120" y="125" fill="#183d32" font-size="42" font-family="system-ui, sans-serif">人工智能 AI</text>
  <rect x="210" y="165" width="780" height="370" rx="32" fill="#fff8f3" stroke="#9b4b31" stroke-width="6"/>
  <text x="250" y="220" fill="#743b28" font-size="38" font-family="system-ui, sans-serif">机器学习 ML</text>
  <rect x="355" y="255" width="490" height="215" rx="28" fill="#f6f3fb" stroke="#746690" stroke-width="6"/>
  <text x="395" y="310" fill="#50456a" font-size="34" font-family="system-ui, sans-serif">深度学习 DL</text>
  <rect x="495" y="345" width="210" height="82" rx="41" fill="#eee8d8" stroke="#9f8d59" stroke-width="6"/>
  <text x="600" y="397" text-anchor="middle" fill="#5f522f" font-size="34" font-weight="700" font-family="system-ui, sans-serif">LLM</text>
</svg>
```

- [ ] **Step 4: Implement registry composition with the seed record**

Create `llm-foundation-visuals.js` as the only owner of module-1 visual metadata:

```js
import { deepFreezeVisual } from './visual-contract.js';

export const llmFoundationVisuals = deepFreezeVisual([
  {
    id: 'visual-llm-01-field-map',
    kind: 'diagram',
    role: 'overview',
    title: 'AI、机器学习、深度学习与 LLM 的关系',
    alt: 'AI 包含机器学习，机器学习包含深度学习，LLM 位于生成式深度学习范围',
    longDescription: '由外向内依次是人工智能、机器学习和深度学习；LLM 标在深度学习内部，说明它是一类生成式语言模型而不是全部人工智能。',
    caption: 'LLM 是生成式深度学习模型的一类，不等于全部 AI。',
    assetPath: 'assets/visuals/llm-foundation/llm-01-field-map.svg',
    width: 1200,
    height: 675,
    provenance: 'original-synthesis',
    sourceIds: ['res-ms-ai'],
    credit: 'Agent Learner 原创整理',
    permission: null,
    verifiedAt: '2026-07-26',
  },
]);
```

Create `index.js`:

```js
import { deepFreezeVisual } from './visual-contract.js';
import { llmFoundationVisuals } from './llm-foundation-visuals.js';

export const knowledgeVisuals = deepFreezeVisual([
  ...llmFoundationVisuals,
]);

export const knowledgeVisualsById = deepFreezeVisual(Object.fromEntries(
  knowledgeVisuals.map((visual) => [visual.id, visual]),
));
```

- [ ] **Step 5: Add the first real note reference**

Add to `llm-01.js` immediately after `readingMinutes`:

```js
overviewVisualId: 'visual-llm-01-field-map',
```

Tasks 8–11 add the remaining records only after each corresponding local file and frozen inventory row are complete.

- [ ] **Step 6: Run data tests**

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js
```

Expected: all contract and cross-reference tests pass.

- [ ] **Step 7: Commit**

```bash
git add assets/visuals/llm-foundation src/data/visuals src/data/llm-foundation-notes tests/llm-foundation-visual-data.test.js
git commit -m "feat: register LLM foundation visual assets"
```

### Task 5: Render Semantic Static and Source Figures

**Files:**
- Create: `src/ui/knowledge-visual.js`
- Create: `tests/knowledge-visual-ui.test.js`
- Modify: `src/ui/knowledge-note.js`

- [ ] **Step 1: Write failing renderer and insertion tests**

Cover:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderKnowledgeVisual } from '../src/ui/knowledge-visual.js';
import { renderKnowledgeNote } from '../src/ui/knowledge-note.js';
import {
  FakeDocument,
  installFakeDom,
} from './helpers/fake-dom.js';

const visual = {
  id: 'visual-llm-01-field-map',
  kind: 'diagram',
  role: 'overview',
  title: 'AI 领域关系',
  alt: 'AI、机器学习、深度学习与 LLM 的关系',
  longDescription: '从外到内描述领域关系。',
  caption: 'LLM 不等于全部 AI。',
  assetPath: 'assets/visuals/llm-foundation/llm-01-field-map.svg',
  width: 1200,
  height: 675,
  provenance: 'original-synthesis',
  sourceIds: ['res-ms-ai'],
  credit: 'Agent Learner 原创整理',
  verifiedAt: '2026-07-26',
};

test('renders a semantic, lazy local figure with long description', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const figure = renderKnowledgeVisual(visual);
  assert.equal(figure.tagName, 'FIGURE');
  assert.equal(figure.querySelector('img').getAttribute('src'), visual.assetPath);
  assert.equal(figure.querySelector('img').getAttribute('loading'), 'lazy');
  assert.equal(figure.querySelector('img').getAttribute('alt'), visual.alt);
  assert.ok(figure.querySelector('figcaption').textContent.includes(visual.caption));
  assert.ok(figure.querySelector('details').textContent.includes(visual.longDescription));
});

test('interleaves overview and section figures at declared anchors', (t) => {
  const document = new FakeDocument();
  t.after(installFakeDom(document));
  const lesson = {
    id: 'llm-test',
    knowledgeNote: {
      overviewVisualId: visual.id,
      introduction: '导语',
      sections: [{
        id: 'mechanism',
        title: '机制',
        paragraphs: ['第一段', '第二段'],
        keyPoints: ['要点'],
        sourceIds: ['res-ms-ai'],
        visuals: [{ visualId: visual.id, afterParagraph: 0 }],
      }],
      misconceptions: [],
      recap: ['回顾'],
      nextStep: '下一步',
    },
  };
  const note = renderKnowledgeNote(
    { resources: [{ id: 'res-ms-ai', url: 'https://example.com', title: 'source' }] },
    lesson,
    { visualsById: { [visual.id]: visual } },
  );
  assert.equal(note.querySelectorAll('figure').length, 2);
  const section = note.querySelector('.knowledge-note__section');
  const children = section.children;
  assert.equal(children.findIndex((node) => node.tagName === 'FIGURE'),
    children.findIndex((node) => node.textContent === '第一段') + 1);
});
```

Also test that a sourced figure renders one HTTPS original-source link and one HTTPS permission link, and that an unknown `visualId` adds one data diagnostic without removing prose.

- [ ] **Step 2: Run the UI tests and verify RED**

```bash
node --test tests/knowledge-visual-ui.test.js
```

Expected: FAIL because the renderer and injection option do not exist.

- [ ] **Step 3: Implement `renderKnowledgeVisual`**

Use `element()` only; do not use `innerHTML`:

```js
import { button, element, externalLink } from './dom.js';

function attributionContent(visual) {
  if (visual.provenance === 'original-synthesis') return [visual.credit];
  return [
    `${visual.creator} · ${visual.sourceFigure} · ${visual.permission.name} · `,
    externalLink({ title: '查看原始来源', url: visual.sourceUrl }),
    ' · ',
    externalLink({ title: '查看许可', url: visual.permission.url }),
  ];
}

export function renderKnowledgeVisual(visual) {
  const image = element('img', {
    attrs: {
      src: visual.assetPath,
      alt: visual.alt,
      loading: 'lazy',
      decoding: 'async',
      width: String(visual.width),
      height: String(visual.height),
    },
  });
  const fallback = element('p', {
    className: 'knowledge-visual__fallback',
    text: `图片暂时无法显示。${visual.alt}`,
    attrs: { hidden: true, role: 'status' },
  });
  image.addEventListener('error', () => {
    image.hidden = true;
    fallback.hidden = false;
  }, { once: true });

  return element('figure', {
    className: 'knowledge-visual',
    dataset: { kind: visual.kind, provenance: visual.provenance },
  }, [
    element('div', { className: 'knowledge-visual__label', text: visual.kind === 'source-figure' ? '来源原图' : '原创教学图解' }),
    element('h3', { className: 'knowledge-visual__title', text: visual.title }),
    image,
    fallback,
    element('figcaption', {}, [
      element('p', { text: visual.caption }),
      element('p', { className: 'knowledge-visual__credit' }, attributionContent(visual)),
    ]),
    visual.longDescription
      ? element('details', { className: 'knowledge-visual__description' }, [
        element('summary', { text: '查看详细图解说明' }),
        element('p', { text: visual.longDescription }),
      ])
      : null,
  ]);
}
```

If `FakeElement.addEventListener` does not accept a third argument, omit `{ once: true }` and guard with a local boolean. Keep the production behavior covered by the test rather than modifying Fake DOM unnecessarily.

- [ ] **Step 4: Interleave visuals in `renderKnowledgeNote`**

Change the signature:

```js
export function renderKnowledgeNote(course, lesson, options = {}) {
  const visualsById = options.visualsById ?? knowledgeVisualsById;
```

Create a helper that:

1. groups `section.visuals` by `afterParagraph`;
2. rejects negative, non-integer or out-of-range anchors into diagnostics;
3. resolves each asset with `visualsById[visualId]`;
4. renders paragraphs in order and inserts matching figures immediately afterward;
5. leaves sections without visuals unchanged.

Resolve `overviewVisualId` after the introduction and before the TOC.

- [ ] **Step 5: Run targeted UI and existing note tests**

```bash
node --test tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all tests pass and old note rendering remains unchanged when references are absent.

- [ ] **Step 6: Commit**

```bash
git add src/ui/knowledge-visual.js src/ui/knowledge-note.js tests/knowledge-visual-ui.test.js
git commit -m "feat: render accessible knowledge figures"
```

### Task 6: Add the Generic Step-Diagram Interaction

**Files:**
- Modify: `src/ui/knowledge-visual.js`
- Modify: `tests/knowledge-visual-ui.test.js`

- [ ] **Step 1: Write failing step-control tests**

Add a two-step fixture and assert:

- the first step image, title and description render;
- Previous starts disabled, Next enabled;
- Next changes all three fields and disables at the final step;
- Previous returns to step one;
- Reset returns to step one and focuses the step status heading;
- the live status uses `aria-live="polite"`;
- the complete static long description is present before any click.

Use `FakeEvent` and actual button clicks; do not test private variables.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/knowledge-visual-ui.test.js
```

Expected: step-diagram assertions fail because only static figures are implemented.

- [ ] **Step 3: Implement a single allowlisted step renderer**

Inside `knowledge-visual.js`, route `kind === 'step-diagram'` to a generic stateful renderer. It may only swap fields from `visual.steps`; it must not execute data callbacks or parse HTML.

Use this state transition:

```js
let activeIndex = 0;

function renderStep() {
  const step = visual.steps[activeIndex];
  image.setAttribute('src', step.assetPath);
  image.setAttribute('alt', step.alt);
  status.textContent = `${activeIndex + 1} / ${visual.steps.length} · ${step.title}`;
  description.textContent = step.description;
  previous.disabled = activeIndex === 0;
  next.disabled = activeIndex === visual.steps.length - 1;
}
```

Previous and Next change `activeIndex` by one. Reset sets it to zero, calls `renderStep()`, then focuses the status element with `tabindex="-1"`.

- [ ] **Step 4: Run tests**

```bash
node --test tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/ui/knowledge-visual.js tests/knowledge-visual-ui.test.js
git commit -m "feat: add stepwise knowledge diagrams"
```

### Task 7: Style Figures for Desktop, Mobile and Reduced Motion

**Files:**
- Modify: `styles/app.css`
- Modify: `tests/static-app.test.js`

- [ ] **Step 1: Write failing static style tests**

Assert that CSS defines:

```text
.knowledge-visual
.knowledge-visual__label
.knowledge-visual__title
.knowledge-visual img
.knowledge-visual figcaption
.knowledge-visual__credit
.knowledge-visual__description
.knowledge-visual__fallback
.knowledge-visual__steps
.knowledge-visual__controls
.knowledge-visual[data-provenance="licensed-reproduction"]
```

The mobile media block must set images to `max-width: 100%`, controls to a single wrapping row or column, and minimum control height to `44px`. The reduced-motion block must disable visual step transitions.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/static-app.test.js
```

Expected: new selector assertions fail.

- [ ] **Step 3: Implement the paper-lab styles**

Add styles adjacent to `.knowledge-note`:

```css
.knowledge-visual {
  margin: var(--space-6) 0;
  border: 1px solid var(--color-border);
  background: var(--color-paper-raised);
  overflow: hidden;
}

.knowledge-visual__label,
.knowledge-visual__title,
.knowledge-visual figcaption,
.knowledge-visual__description,
.knowledge-visual__fallback,
.knowledge-visual__controls {
  padding-inline: var(--space-4);
}

.knowledge-visual__label {
  padding-block: var(--space-2);
  border-bottom: 1px solid var(--color-border-soft);
  color: var(--color-vermilion);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.knowledge-visual__title {
  margin: var(--space-4) 0;
  font-size: 1.18rem;
}

.knowledge-visual img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  background: var(--color-paper);
}

.knowledge-visual figcaption {
  padding-block: var(--space-3);
  border-top: 1px dashed var(--color-border);
  line-height: 1.6;
}

.knowledge-visual__credit {
  color: var(--color-muted);
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.knowledge-visual__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-block: var(--space-3);
}

.knowledge-visual__controls button {
  min-height: 44px;
}
```

Use provenance-specific accent colors without relying on color alone. Add 390px/320px and reduced-motion rules to the existing media blocks.

- [ ] **Step 4: Run static and UI tests**

```bash
node --test tests/static-app.test.js tests/knowledge-visual-ui.test.js
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add styles/app.css tests/static-app.test.js
git commit -m "style: add responsive knowledge figures"
```

### Task 8: Produce and Integrate Lessons 01–02

**Files:**
- Create: `assets/visuals/llm-foundation/llm-01-*.svg`
- Create: `assets/visuals/llm-foundation/llm-02-*.svg`
- Modify: `src/data/visuals/llm-foundation-visuals.js`
- Modify: `src/data/llm-foundation-notes/llm-01.js`
- Modify: `src/data/llm-foundation-notes/llm-02.js`
- Modify: `tests/llm-foundation-visual-data.test.js`

- [ ] **Step 1: Add exact lesson count and role assertions**

Assert each lesson has 4–6 unique visual references and includes:

```js
const VISUALIZED_LESSON_IDS = ['llm-01', 'llm-02'];
const requiredRoles = new Set(['overview', 'mechanism', 'boundary']);

function coverageRole(role) {
  if (role === 'process') return 'mechanism';
  if (role === 'comparison' || role === 'decision') return 'boundary';
  return role;
}

for (const lessonId of VISUALIZED_LESSON_IDS) {
  const lesson = llmFoundation.lessons.find(({ id }) => id === lessonId);
  const visualIds = [
    lesson.knowledgeNote.overviewVisualId,
    ...lesson.knowledgeNote.sections.flatMap((section) => (
      section.visuals?.map(({ visualId }) => visualId) ?? []
    )),
  ];
  assert.ok(visualIds.length >= 4 && visualIds.length <= 6, lessonId);
  assert.equal(new Set(visualIds).size, visualIds.length, `${lessonId}: unique visual references`);
  const roles = new Set(visualIds.map((id) => coverageRole(knowledgeVisualsById[id].role)));
  for (const role of requiredRoles) assert.ok(roles.has(role), `${lessonId}:${role}`);
}
```

Require the three lesson-level role groups above, treating `process` as mechanism and `comparison`/`decision` as boundary for coverage.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js
```

Expected: fail until roles and lessons 01–02 records are complete.

- [ ] **Step 3: Produce lesson 01 assets**

Create the verified inventory assets for:

```text
visual-llm-01-field-map
visual-llm-01-training-inference-boundary
visual-llm-01-model-vs-application-stack
visual-llm-01-learning-route-decision
```

Each SVG must include `<title>`, `<desc>`, readable text at 320px, non-color labels and no active content.

- [ ] **Step 4: Produce lesson 02 assets**

Create:

```text
visual-llm-02-forward-pass
visual-llm-02-computation-graph
visual-llm-02-gradient-update
visual-llm-02-learning-rate-comparison
visual-llm-02-train-validation-boundary
```

Use explicit arrows for forward and backward paths, label parameter updates separately from activations, and mark illustrative loss curves as conceptual rather than measured.

- [ ] **Step 5: Integrate and test**

Run:

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all pass; lessons 01–02 satisfy count, roles, references and file safety.

- [ ] **Step 6: Commit**

```bash
git add assets/visuals/llm-foundation src/data/visuals src/data/llm-foundation-notes/llm-01.js src/data/llm-foundation-notes/llm-02.js tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js
git commit -m "feat: visualize LLM foundations and backpropagation"
```

### Task 9: Produce and Integrate Lessons 03–04

**Files:**
- Create: `assets/visuals/llm-foundation/llm-03-*.svg`
- Create: `assets/visuals/llm-foundation/llm-04-*.svg`
- Modify: `src/data/visuals/llm-foundation-visuals.js`
- Modify: `src/data/llm-foundation-notes/llm-03.js`
- Modify: `src/data/llm-foundation-notes/llm-04.js`

- [ ] **Step 1: Produce lesson 03**

Create the frozen-inventory visuals for tokenizer differences, embedding space, context budget, context strategy selection and information-loss boundaries. Numeric token counts must come from a recorded tokenizer run; label any invented budget as an illustrative scenario.

- [ ] **Step 2: Produce lesson 04**

Create the Transformer layer overview, Q/K/V flow, scaled-score-to-Value aggregation, causal mask matrix, multi-head combination and residual/normalization comparison.

Use `step-diagram` only for the Q/K/V → scores → mask/softmax → Value sequence. Its steps must be:

```text
1. Project current representations into Q, K and V.
2. Compare Q with all allowed K values.
3. Apply scale, causal mask and softmax.
4. Aggregate V and pass the update onward.
```

- [ ] **Step 3: Integrate and run targeted tests**

Expand `VISUALIZED_LESSON_IDS` in `tests/llm-foundation-visual-data.test.js` to:

```js
['llm-01', 'llm-02', 'llm-03', 'llm-04']
```

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all pass; lessons 03–04 each meet roles and count; every step image resolves.

- [ ] **Step 4: Commit**

```bash
git add assets/visuals/llm-foundation src/data/visuals src/data/llm-foundation-notes/llm-03.js src/data/llm-foundation-notes/llm-04.js tests/llm-foundation-visual-data.test.js
git commit -m "feat: visualize tokens context and attention"
```

### Task 10: Produce and Integrate Lessons 05–06

**Files:**
- Create: `assets/visuals/llm-foundation/llm-05-*.svg`
- Create: `assets/visuals/llm-foundation/llm-06-*.svg`
- Modify: `src/data/visuals/llm-foundation-visuals.js`
- Modify: `src/data/llm-foundation-notes/llm-05.js`
- Modify: `src/data/llm-foundation-notes/llm-06.js`

- [ ] **Step 1: Produce lesson 05**

Create the training-stage chain, direct-objective comparison, LoRA low-rank update, RAG-vs-fine-tuning decision matrix and evaluation feedback loop. Do not imply RLHF is one algorithm or that LoRA stores facts in a guaranteed interpretable subspace.

- [ ] **Step 2: Produce lesson 06**

Create the autoregressive decoding loop, logits-to-probability path, temperature comparison, top-p candidate set, KV Cache time/space tradeoff and latency decomposition.

Use one step diagram for the fixed distribution:

```text
raw logits → temperature scaling → softmax probabilities → top-p nucleus → sampled token
```

All displayed numbers must be recomputable from the data recorded in the visual inventory.

- [ ] **Step 3: Integrate and test**

Expand `VISUALIZED_LESSON_IDS` to:

```js
['llm-01', 'llm-02', 'llm-03', 'llm-04', 'llm-05', 'llm-06']
```

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all pass and lessons 05–06 satisfy visual gates.

- [ ] **Step 4: Commit**

```bash
git add assets/visuals/llm-foundation src/data/visuals src/data/llm-foundation-notes/llm-05.js src/data/llm-foundation-notes/llm-06.js tests/llm-foundation-visual-data.test.js
git commit -m "feat: visualize LLM training and inference"
```

### Task 11: Produce and Integrate Lessons 07–08

**Files:**
- Create: `assets/visuals/llm-foundation/llm-07-*.svg`
- Create: `assets/visuals/llm-foundation/llm-08-*.svg`
- Modify: `src/data/visuals/llm-foundation-visuals.js`
- Modify: `src/data/llm-foundation-notes/llm-07.js`
- Modify: `src/data/llm-foundation-notes/llm-08.js`

- [ ] **Step 1: Produce lesson 07**

Create the instruction hierarchy, prompt contract, generation-to-schema-validation flow, bounded retry state machine and prompt-injection trust boundary. Keep model instructions, untrusted content and tool authorization as separate visual layers.

- [ ] **Step 2: Produce lesson 08**

Create the capability boundary map, evaluation funnel, hallucination cause/mitigation layers, defense-in-depth path and quality/safety/cost/latency tradeoff. Do not imply any one mitigation eliminates hallucination or injection.

- [ ] **Step 3: Integrate and run the complete visual data suite**

Expand `VISUALIZED_LESSON_IDS` to all eight lessons:

```js
['llm-01', 'llm-02', 'llm-03', 'llm-04', 'llm-05', 'llm-06', 'llm-07', 'llm-08']
```

```bash
node --test tests/knowledge-visual-contract.test.js tests/llm-foundation-visual-data.test.js tests/knowledge-visual-ui.test.js tests/guided-ui.test.js
```

Expected: all eight lessons satisfy count, role, evidence, permission, asset and insertion contracts.

- [ ] **Step 4: Commit**

```bash
git add assets/visuals/llm-foundation src/data/visuals src/data/llm-foundation-notes/llm-07.js src/data/llm-foundation-notes/llm-08.js tests/llm-foundation-visual-data.test.js
git commit -m "feat: visualize prompting evaluation and safety"
```

### Task 12: Add the Reusable Skill Gates

**Files:**
- Modify: `.agents/skills/build-learning-module-notes/SKILL.md`
- Modify: `.agents/skills/build-learning-module-notes/references/data-contract.md`
- Modify: `.agents/skills/build-learning-module-notes/references/source-policy.md`
- Modify: `.agents/skills/build-learning-module-notes/references/quality-rubric.md`
- Modify: `.agents/skills/build-agent-learner-module/SKILL.md`
- Modify: `.agents/skills/build-agent-learner-module/references/module-contract.md`
- Modify: `.agents/skills/build-agent-learner-module/references/release-gates.md`
- Modify: `docs/superpowers/skill-tests/build-agent-learner-module.md`
- Modify: `README.md`

- [ ] **Step 1: Write the reusable visual contract**

Add the approved fields and rules verbatim:

```text
overviewVisualId
sections[*].visuals[*].visualId
sections[*].visuals[*].afterParagraph
kind / role / provenance
alt / longDescription / caption
sourceIds / permission / modifications
```

Make visual publication optional for legacy modules until they are explicitly migrated. For a module declaring visual completion, all visual gates become mandatory.

- [ ] **Step 2: Add research and license gates**

Require:

- cognitive question before storyboard;
- original body and license/policy access;
- explicit redistribution;
- explicit modification permission when adapted;
- link-only plus original replacement when permission is unclear;
- no search-image bulk ingestion or remote hotlinking.

- [ ] **Step 3: Add quality and release gates**

Score visual accuracy, evidence boundaries, teaching value, accessibility, responsive rendering and fallback. A broken `visualId`, missing permission, active SVG content, inaccessible complex diagram or false deployment claim blocks publication.

- [ ] **Step 4: Update the skill test scenario and README**

Extend the skill test with a third-party figure whose page is accessible but license is unclear. Expected behavior:

```text
do not download; record link-only-original-replacement; create an original visual from independently supported facts.
```

Document the visual registry and pilot scope in README without claiming modules 2–5 are already visualized.

- [ ] **Step 5: Run documentation/static tests and commit**

```bash
node --test tests/static-app.test.js
git diff --check
git add .agents/skills docs/superpowers/skill-tests README.md
git commit -m "docs: add visual teaching gates to module skills"
```

Expected: tests pass and no stale deployment or five-module visual-completion claim appears.

### Task 13: Complete Automated and Independent Review Gates

**Files:**
- Modify: `docs/content-audits/2026-07-26-llm-foundation-visuals.md`
- Modify as review requires: visual data, assets, UI, CSS and tests

- [ ] **Step 1: Run exact final commands**

```bash
npm test
git diff --check
find src tests -name '*.js' -exec node --check {} \;
find assets/visuals/llm-foundation -type f -maxdepth 1 -print
git status --short --branch
```

Expected: all tests pass, syntax and diff checks are clean, and only intended files differ from the feature base.

- [ ] **Step 2: Audit asset safety and size**

Record for every asset:

```text
file size
format
dimensions/viewBox
source/provenance
license decision
referencing lesson/section
```

Reject SVG active content. Optimize oversized raster derivatives while keeping source attribution and readability. Record both per-asset size and per-lesson total payload.

- [ ] **Step 3: Run three independent reviews**

Using `superpowers:subagent-driven-development` review stages:

1. specification/coverage reviewer;
2. pedagogy/evidence/license reviewer;
3. engineering/accessibility/security reviewer.

Fix every Critical or Important finding and rerun the affected reviewer. Minor findings may remain only when documented with a concrete reason.

- [ ] **Step 4: Complete the local audit**

The audit must include:

- total figures by lesson, kind, role and provenance;
- original vs licensed vs link-only decisions;
- 100% source and permission resolution;
- assessed coverage mapping;
- exact test results;
- current browser and deployment status stated truthfully.

- [ ] **Step 5: Commit**

```bash
git add docs/content-audits/2026-07-26-llm-foundation-visuals.md
git commit -m "docs: audit LLM foundation visuals"
```

### Task 14: Real-Browser Acceptance

**Files:**
- Modify: `docs/content-audits/2026-07-26-llm-foundation-visuals.md`
- Modify implementation only if browser defects are found

- [ ] **Step 1: Serve the exact candidate**

```bash
npm run serve
```

Verify `/`, `/styles/app.css`, `/src/app.js`, every referenced SVG and every locally stored third-party figure return HTTP 200.

- [ ] **Step 2: Verify desktop**

At 1280×720 or larger, inspect all eight LLM lessons:

- overview figure appears after introduction;
- every section figure appears immediately after its declared paragraph;
- captions, credits and long descriptions are readable;
- licensed figures show author and permission;
- no duplicate `h1`, broken image or horizontal overflow;
- existing quiz, resources, experiment and progress behavior still works.

- [ ] **Step 3: Verify mobile and keyboard**

At 390×844 and 320×800:

- all eight lessons have no page-level horizontal overflow;
- SVG labels and matrices remain readable;
- controls are at least 44px;
- step controls support Tab, Enter/Space, Previous, Next and Reset;
- Reset restores the first state and meaningful focus;
- reduced motion disables transitions;
- complex long descriptions are keyboard reachable.

- [ ] **Step 4: Verify failure degradation**

Temporarily request one invalid image path through an injected test fixture, not by corrupting committed production data. Confirm image failure leaves title, caption, alt-derived fallback, long description and prose available.

- [ ] **Step 5: Check console and update audit**

Require zero warnings/errors attributable to the application. Add the exact desktop/mobile routes, interactions, geometry results and console findings to the audit, then commit:

```bash
git add docs/content-audits/2026-07-26-llm-foundation-visuals.md
git commit -m "test: verify LLM visual browser matrix"
```

### Task 15: PR, Vercel Preview, Production and Final Verification

**Files:**
- No new product files unless release validation finds a defect

- [ ] **Step 1: Sync current main**

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
git log --oneline --left-right origin/main...HEAD
```

If main advanced, merge or rebase according to repository policy without discarding unrelated work, then rerun Task 13 commands.

- [ ] **Step 2: Push one coherent branch and create one PR**

```bash
git push -u origin feat/llm-foundation-visual-system
gh pr create \
  --base main \
  --head feat/llm-foundation-visual-system \
  --title "feat: visualize LLM foundation knowledge notes" \
  --body-file /tmp/llm-visual-pr-body.md
```

The PR body must contain visual count rationale, source/license policy, tests, browser matrix, payload summary, known limitations and the statement that modules 2–5 remain unchanged.

- [ ] **Step 3: Verify Vercel Preview**

Inspect the PR deployment and verify:

- first lesson;
- Attention step diagram;
- one licensed figure if the frozen inventory contains one;
- final safety lesson;
- one unchanged module-2 lesson.

If Preview is access protected, use the authenticated Vercel inspection path and record that limitation rather than calling the public route verified.

- [ ] **Step 4: Merge after checks and reviews**

```bash
gh pr checks
gh pr merge --merge
git switch main
git pull --ff-only origin main
```

Record the exact merge SHA:

```bash
git rev-parse HEAD
```

- [ ] **Step 5: Deploy the exact main SHA to Vercel Production**

Deploy through the established Vercel project. Inspect metadata and require:

```text
readyState = READY
target = production
readySubstate = PROMOTED
githubCommitSha = exact main SHA
```

- [ ] **Step 6: Verify canonical production routes**

In a real browser verify:

```text
https://agent-development-knowledge-map.vercel.app/#llm-foundation/lesson/llm-01
https://agent-development-knowledge-map.vercel.app/#llm-foundation/lesson/llm-04
https://agent-development-knowledge-map.vercel.app/#llm-foundation/lesson/llm-08
```

Require correct figures, captions, step controls, no overflow and no console warnings/errors.

- [ ] **Step 7: Confirm Pages remains disabled and report**

```bash
gh api repos/Alex-loading/agent-development-knowledge-map/pages --include
```

Expected: HTTP 404 because Pages is not configured. Only after SHA, routes and Pages state are verified report the visual pilot deployed.
