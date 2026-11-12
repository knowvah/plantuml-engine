# Decision journal

Append one row per decision, batch close or finding. Cite the commit sha and the evidence (command and count).

| # | When (UTC) | Task | Entry |
|---|---|---|---|
| 0 | 2026-11-12T18:20Z | planning | Baseline on `b7ff5f5da` (tree of `feature/flow-box-order-compare` = `origin/main`), load ~6-7: `npm test -- --maxWorkers=4` exit 0, 2230 files passed / 1 skipped, 48017 passed, 4 expected fail, 7 skipped, 6 todo, 538 s; coverage st 96.94 / br 92.55 / fn 97.46 / ln 97.96. `npm run lint` exit 0. `npm run typecheck` exit 0. Brief diagrams rendered through `renderSync`: 3/3 parse (DESCRIPTION, SEQUENCE ×2). `PENDING` at planning: 132 files. P0 steps 1-6 done interactively the same day (origin → `knowvah/plantuml-engine.git`, `main` = `origin/main`, `.claude/` settings + tools + 7 memory files, old directory removed); step 7 (session restart) is the user's. |
| 1 | 2026-11-12T18:15Z | T0 | P0 verified: `origin` = `https://github.com/knowvah/plantuml-engine.git`, `main` = `origin/main` = `b7ff5f5da`. Branch `chore/rename-plantuml-engine` created off `origin/main`. Baseline gates (load 7.6): `npm test -- --maxWorkers=4` exit 0 — 2230 files passed / 1 skipped (2231), 48017 passed, 4 expected fail, 7 skipped, 6 todo (48034), 525 s; coverage st 96.94 / br 92.55 / fn 97.46 / ln 97.96. typecheck 0, lint 0, build 0, format:check 0. `PENDING` recomputed by `git grep -lIE` outside ALLOWED: 132 files, identical to `batch-1/pending-at-planning.txt`. |
