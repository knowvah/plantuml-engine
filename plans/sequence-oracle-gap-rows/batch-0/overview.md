# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/sequence-oracle-gap-rows/ and .agent-notes/sogr-planning.md may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/sequence-oracle-gap-rows .agent-notes/sogr-planning.md
git commit -m "docs(sogr): add the sequence-oracle-gap-rows brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/sequence-oracle-gap-rows/measurements/measure-rows.mts /tmp/sogr-t0.json
```

The measurer must print `rows 94 zero 86 open 7 error 1`. If it does not, journal the new counts and the rows that
moved, and carry on with the live numbers: the plan's tasks are per row, so a row that is already zero just gets pinned.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` for T4: run `npm run build`, then copy
the files to `/tmp/sogr-base-dts/`.

Batch 0 closes with the gates in the README. Typecheck, build and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given the base tree, when `measure-rows.mts` runs, then it reports 94 rows with 86 at zero (or the journal says why
  not).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
