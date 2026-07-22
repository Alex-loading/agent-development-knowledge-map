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

### Core/UI

- normal, boundary, invalid, deterministic-order, and non-mutation tests;
- experiment reset, accessible labels, focus restoration, and live output;
- unknown experiment and invalid route degrade safely;
- shared UI contains no new course-specific branch.

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

## 4. Browser matrix

Serve the repository root and verify `/`, `/styles/app.css`, and `/src/app.js` return 200. Test at desktop and 390px/320px:

- new module: all six views, first/middle/final lessons, every experiment, filters, quiz, interviews, progress, persistence, and confirmed reset;
- existing modules: representative routes plus every shared behavior changed by this work;
- one `h1`, correct heading order, skip link, keyboard navigation, visible focus and meaningful focus restoration;
- `aria-expanded`/`aria-controls`, polite live output, disabled state, roughly 44px targets, readable contrast, no horizontal overflow, reduced motion, and no console errors.

Do not mistake a scaled full-page screenshot for a narrow layout; inspect viewport geometry and a viewport screenshot before changing CSS.

## 5. Git and Vercel release

1. Re-read `AGENTS.md`; it overrides stale deployment text in old plans.
2. Sync the feature branch with current `main` and resolve conflicts without discarding unrelated user work.
3. Review the actual diff and run all final commands again.
4. Push one coherent branch and create one PR with source limitations, tests, browser coverage, and count rationale.
5. Verify Vercel Preview on representative new and old routes.
6. Merge only after required checks/reviews pass.
7. Deploy `main` to Vercel Production; the repository root is the no-build publish root.
8. Inspect deployment metadata and require `READY`, `target=production`, and `githubCommitSha` equal to exact `main` SHA.
9. Verify the canonical public Vercel alias and critical routes in a real browser.
10. Confirm GitHub Pages remains disabled. Never enable it as fallback.

Only then report the module deployed. A Git push, merged PR, deployment URL, or `READY` state without SHA and route verification is incomplete.
