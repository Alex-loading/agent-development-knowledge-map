# Integration and Release Gates

## 1. Baseline and RED evidence

Before edits, record:

- branch/worktree and clean/dirty status;
- current `main`/`origin/main` relationship;
- current full test command and result;
- active and planned module IDs, canonical routes, registered courses, experiments, and known counts;
- current production provider from `AGENTS.md`.

For each behavior change, write the failing contract test first and confirm it fails because the capability is absent.

## 2. Targeted implementation gates

### Content/data

- dependency order, stable/global unique IDs, complete fields;
- lesson/resource/interview bidirectional references;
- knowledge-note registry identity and recursive freezing;
- source IDs resolve through lesson resources, evidence, and global registry;
- all child-skill coverage, score, and test-audit gates pass.
- for declared visual completion: each overview placement has both `overviewVisualId` and a real `overviewVisualSectionId`, and the visual resolves exactly once;
- each section placement has a resolving `sections[*].visuals[*].visualId` and an integer `afterParagraph` that points to an existing paragraph in that owning section;
- every visual source is contained by its overview or section owner, every published visual has exactly one placement, and no registry visual is orphaned;
- every sourced figure has explicit redistribution permission, every adaptation has explicit modification permission and recorded modifications, and unclear permissions use `link-only-original-replacement` without downloading;
- visual records and nested steps/permission records are deeply frozen; local assets exist and deterministic fixtures agree with every visible quantitative or state claim.

### Core/UI

- normal, boundary, invalid, deterministic-order, and non-mutation tests;
- experiment reset, accessible labels, focus restoration, and live output;
- unknown experiment and invalid route degrade safely;
- shared UI contains no new course-specific branch.
- visual renderer preserves prose on unknown IDs, exposes semantic figure/caption/long-description/fallback content, keeps step controls keyboard-safe, and labels original-source and permission links;
- static SVG contains no `script`, `foreignObject`, event handlers, remote references, external stylesheets, or executable links; reject empty/hidden geometry used as a proxy for learner-visible meaning.

### Integration/regression

- existing modules' dashboard, curriculum, map, resources, interviews, progress, and representative lesson/experiment routes still work;
- progress totals and transient filters remain module-scoped;
- stale storage IDs do not corrupt percentages or routing;
- planned/unregistered/invalid modules remain inaccessible;
- README and tests describe the real registry, not copied counts.

## 3. Command verification

Run fresh from the final candidate state:

```bash
npm test
git diff --check
find src tests -name '*.js' -exec node --check {} \;
git status --short --branch
```

Preserve exact commands, exit codes, and summaries. A previous agent's result or a test run before the final diff is not completion evidence.

When visuals changed, also run the project visual ownership, registry/data, UI, static-SVG, asset existence, and visible-semantics suites. Inspect generated or sourced media itself; passing metadata tests cannot prove visible geometry, text clipping, or teaching accuracy.

## 4. Browser matrix

Serve the repository root and verify `/`, `/styles/app.css`, and `/src/app.js` return 200. Test at desktop and 390px/320px:

- new module: all six views, first/middle/final lessons, every experiment, filters, quiz, interviews, progress, persistence, and confirmed reset;
- existing modules: representative routes plus every shared behavior changed by this work;
- one `h1`, correct heading order, skip link, keyboard navigation, visible focus and meaningful focus restoration;
- `aria-expanded`/`aria-controls`, polite live output, disabled state, roughly 44px targets, readable contrast, no horizontal overflow, reduced motion, and no console errors.
- for visual pages: overview placement before the table of contents, section placement after the declared paragraph, correct caption/long description/credit, HTTPS original and permission links when sourced, useful unknown/missing-asset fallback, and step next/previous controls by keyboard;
- at 390px and 320px, the document must not scroll horizontally; a figure may use its own labeled/local horizontal scroller only when preserving readable geometry requires it.

Do not mistake a scaled full-page screenshot for a narrow layout; inspect viewport geometry and a viewport screenshot before changing CSS.

## 5. Git and Vercel release

1. Re-read `AGENTS.md`; it overrides stale deployment text in old plans.
2. Sync the feature branch with current `main` and resolve conflicts without discarding unrelated user work.
3. Review the actual diff and run all final commands again.
4. Push one coherent branch and create one PR with source limitations, tests, browser coverage, and count rationale.
5. Verify Vercel Preview on representative new and old routes.
6. Merge only after required checks/reviews pass.
7. Deploy `main` to Vercel Production; the repository root is the no-build publish root.
8. Inspect deployment metadata and require `READY`, `target=production`, and `githubCommitSha` equal to the exact current `main` SHA.
9. Verify the canonical public Vercel alias and critical routes in a real browser.
10. Confirm GitHub Pages remains disabled. Never enable it as fallback.

Only then report the module deployed. A Git push, merged PR, build start, preview URL, deployment URL, or `READY` state without exact SHA, canonical route verification, and Pages-disabled confirmation is incomplete and must never be described as a successful deployment.
