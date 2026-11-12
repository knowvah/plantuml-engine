# Decisions (pre-made)

Issue #173's maintainer decisions (2026-11-11) are fixed inputs: package `@knowvah/plantuml-engine`; version string
`plantuml-engine version …` (our own string, not a jar mirror — update the pinning tests); workspace packages keep
their names; the domain `plantuml.knowvah.com` is unchanged; `plans/` and `.agent-notes/` are left as written.

D1–D6 approved by the user on 2026-11-12 (interactive `/plan-mission`, "approve all"). Rollback: **Reversible**
for every task (revert the squash commit). No Irreversible change; npm publish is out of scope.

## D1 — rename the identifier variants too

`isPlantumlTsOnly` → `isPlantumlEngineOnly`, `PLANTUML_TS_ONLY` → `PLANTUML_ENGINE_ONLY`,
`plantumlTsOnlyColumns` → `plantumlEngineOnlyColumns`, vite `name: 'PlantUmlTs'` → `'PlantUmlEngine'`, the matrix
label `n/a (plantuml-ts only)` → `n/a (plantuml-engine only)`; regenerate `docs/parity-report.md`.
Why: the label lands in a generated public doc; every identifier is internal, so renaming is free.

## D2 — dated records stay as written

Left untouched: `docs/graphviz-issues/*` (incl. TRACKER.md's dated rows), `docs/upstream-plantuml-issues/*`,
past `CHANGELOG.md` entries, `code-review-tasks.md`, `planning/mission-*/` directories,
`planning/mission-index.md` rows, `planning/next-missions.md`, and the `retired[]` reasons in
`oracle/accepted-divergences.json` (the only mentions in that file; they quote the 0.1.0 output of their date).
Add one dated note at the top of `docs/graphviz-issues/TRACKER.md`; amend the 2026-08-01 note at
`planning/mission-index.md:18-26`.
Why: the 2026-08-01 scope rename set this convention (mission-index.md:22-24), and the issue's own reason for
leaving `plans/` applies: rewriting a dated record makes it disagree with what it describes.

## D3 — `oracle/patches/*` untouched

They are exports of the oracle seam commits pinned on the fork's `dot-output` branch (`oracle/pin.json`
`seamCommit` `eb0f3cff`, `seamCommitCount` 4). Editing them desyncs them from that pin; editing `+` lines would also
demand a jar rebuild for zero behaviour change.

## D4 — a ratchet test enforces the result

`tests/architecture/legacy-name.test.ts` scans `git ls-files` for
`/plantuml-ts|plantuml_ts|PlantumlTs|PlantUmlTs|PLANTUML_TS/` and fails on any match outside `ALLOWED`.
While the sweep runs, a `PENDING` list holds the not-yet-swept files; a stale `PENDING` entry also fails. T8
deletes `PENDING`. Why: rules require invariants as tests; agents working from old memories would reintroduce the
name, and a one-off `git grep` cannot stop that.

## D5 — regenerate the lockfile, then audit the diff

`npm install --package-lock-only --ignore-scripts`; the diff may touch only `name`, workspace `link`/`resolved`
entries for the renamed package, and `file:` specifiers. Any other version movement is STOP 4. Then `npm ci`.

## D6 — interactive before and after; the sweep is autonomous

P0 ([pre-mission.md](pre-mission.md)) runs before execution: `git remote set-url`, `main` = `origin/main`, the
untracked `.claude/` files and 23 memory files (path/URL mentions only), removal of the empty old directory. The
mission never edits `.claude/` (it holds the executor's own permission profile). The user edits `~/.claude/`
after the mission, then signs, pushes and opens the PR.

## Applied at brief time (not new decisions)

- **No push, no PR from the executor.** The installed autonomous profile denies `git push`, and the user signs
  commits. T8 drafts `pr-body.md` instead of opening the PR (the Phase 5 text said "push and open the PR").
- **STOP 2 is scoped to fixtures without the version string.** The version string is wider, so on pages that print
  it the text width can move geometry; that is the ruling's consequence, re-pinned with evidence (T3).
- The PR is ~520 changed lines, over the 400-line guideline: one mechanical rename, justified in the PR body.
