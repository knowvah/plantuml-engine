# rename-plantuml-engine (rpe)

**Read these first, at every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #173 (maintainer decisions 2026-11-11). Planned interactively on 2026-11-12 against
`origin/main` `b7ff5f5da`. Precursor to #172.

## Objective

Rename the library from `plantuml-ts` to `plantuml-engine` on every live surface of the tracked tree:
- the npm name `@knowvah/plantuml-ts` → `@knowvah/plantuml-engine`, and the `/image-providers` subpath;
- the `dist/plantuml-ts.{js,cjs,d.ts}` filenames;
- our version string → `plantuml-engine version …` (`src/core/version.ts:38`, `PSystemVersion.ts`);
- every workspace package's peer/dev reference (the workspace packages keep their own names);
- prose, comments, message prefixes, temp-file prefixes and the `PlantumlTs` identifier variants (D1).

Dated records stay as written (D2, D3). A ratchet test (D4) makes the result permanent.

## Starting state, measured 2026-11-12 on `b7ff5f5da`

- The GitHub repo is already `knowvah/plantuml-engine`, and the local checkout is already
  `~/git/knowvah/plantuml-engine`. [pre-mission.md](pre-mission.md) (P0, interactive) fixes the remote, the
  untracked `.claude/` files and memory **before** this brief runs.
- 132 tracked files match `plantuml-ts|plantuml_ts|PlantumlTs|PlantUmlTs|PLANTUML_TS` outside the D2/D3 records
  ([batch-1/pending-at-planning.txt](batch-1/pending-at-planning.txt)).
- `scripts/__pycache__/compile-themes.cpython-313.pyc` is tracked junk (T0).
- The vite lib builds `es` + `cjs` only, so `name: 'PlantUmlTs'` is unused (renamed anyway, D1).

## Branch

`chore/rename-plantuml-engine`, created by T0 off `origin/main` (P0 pulled it).
- T0 commits this brief.
- One unsigned commit per task, in the main checkout, serially, no worktrees (batch 2 shares `PENDING` and
  `docs/catalog.md`).
- **Never push and never open a PR**: the autonomous profile denies `git push`. The user signs, pushes and opens
  the PR with the body T8 drafts. GitHub squash-merges it (chore convention).

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- A `src/` docstring the catalog quotes needs `npm run catalog`, which is drift-gated.
- T2 and T8 also run `npm ci`. T7a and T8 also run `npm run docs:build`. T8 runs `npm run test:e2e`.

## Constraints

**STOP and ask the user when:**
1. The same gate check fails twice in a row (2-fix cap). The journal row carries the diagnosis artifact.
2. A pinned value changes on a fixture whose output does **not** contain the version string. (Rows whose output does
   contain it: re-measure, journal before/after, re-pin citing the 2026-11-11 ruling — see T3.)
3. A file outside both `PENDING` and `ALLOWED` starts matching, or a D2/D3 record seems to need an edit.
4. The lockfile regeneration changes anything but name, link and `file:` entries (D5).
5. A write would land outside this repository, or in the untracked `.claude/` files P0 owns.
6. Any step would push, open a PR, or comment on GitHub.

**PUSH FORWARD (journal it):** wording after the rename (including "a"/"an"); regenerate a report vs co-edit
generator and output; 1-3 line fixes in a file already being edited; adding a `PENDING` entry T1 missed; re-running
`npm run catalog`; moving an occurrence to an adjacent task when sequencing is cleaner. The project CLAUDE.md
(2026-11-03) makes a task's write-set a plan, not a limit: edit another tracked file when the work needs it, and
journal why.

## Batches

| Batch | Tasks | Status |
|---|---|---|
| [batch-0](batch-0/overview.md) | T0 branch, brief, pycache | [x] |
| [batch-1](batch-1/overview.md) | T1 ratchet test | [x] |
| [batch-2](batch-2/overview.md) | T2 package · T3 version · T4 src · T5 scripts · T6 tests · T7a user docs · T7b internal docs | [ ] |
| [batch-3](batch-3/overview.md) | T8 close ratchet, verify, draft PR body | [ ] |

## Other docs

- [pre-mission.md](pre-mission.md) — P0 (done interactively before execution) and the post-mission user steps
- [diagrams/component-map.md](diagrams/component-map.md), [diagrams/data-flow.md](diagrams/data-flow.md)
- [settings.autonomous.json](settings.autonomous.json) — installed into `.claude/` by P0
- [decision-journal.md](decision-journal.md)
