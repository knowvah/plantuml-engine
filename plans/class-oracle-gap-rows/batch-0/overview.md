# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/class-oracle-gap-rows/ and .agent-notes/cogr-planning.md may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/class-oracle-gap-rows .agent-notes/cogr-planning.md
git commit -m "docs(cogr): add the class-oracle-gap-rows brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/class-oracle-gap-rows/measurements/measure-rows.mts /tmp/cogr-t0.json
```

The measurer must print `rows 151 zero 111 open 40 error 0`. If it does not, journal the new counts and the rows that
moved, and carry on with the live numbers. The tasks are per row, so a row that is already zero just gets pinned.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` for T5: run `npm run build`, then copy
the files to `/tmp/cogr-base-dts/`.

Batch 0 closes with the gates in the README. Typecheck, build and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given the base tree, when `measure-rows.mts` runs, then it reports 151 rows with 111 at zero (or the journal says
  why not).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
