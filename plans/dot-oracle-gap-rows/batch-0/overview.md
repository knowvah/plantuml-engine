# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/dot-oracle-gap-rows/ and .agent-notes/dogr-planning.md may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/dot-oracle-gap-rows .agent-notes/dogr-planning.md
git commit -m "docs(dogr): add the dot-oracle-gap-rows brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/dot-oracle-gap-rows/measurements/measure-rows.mts /tmp/dogr-t0.json
```

The measurer must print `rows 57 zero 47 open 10 error 0 jar-error-page 8`. If it does not, journal the new counts
and the rows that moved, and carry on with the live numbers.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` for T3: run `npm run build`, then copy
the files to `/tmp/dogr-base-dts/`.

Batch 0 closes with the gates in the README. Typecheck, build and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given the base tree, when `measure-rows.mts` runs, then it reports 57 rows with 47 at zero and 8 jar error pages
  (or the journal says why not).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
