# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/state-note-embed/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/state-note-embed
git commit -m "docs(sne): add the state-note-embed brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/state-note-embed/measurements/measure-rows.mts /tmp/sne-t0.json
```

The measurer must print `rows 10 zero 0 open 10 error 0`, with the per-row numbers in the README table. If it does
not, journal the live numbers and the rows that moved, and carry on with them.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T3: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/sne-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning; this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given the base tree, when `measure-rows.mts` runs, then it reports 10 rows with 0 at zero (or the journal says
  why not).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
