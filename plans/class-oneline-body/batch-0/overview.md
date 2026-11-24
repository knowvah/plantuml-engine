# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/class-oneline-body/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/class-oneline-body
git commit -m "docs(ocb): add the class-oneline-body brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/hidden-note-host/measurements/measure.mts plans/class-oneline-body/measurements/probes /tmp/ocb-t0.json
```

The measurer must print the summary line in `measurements/plan-baseline.txt` (`rows 18 zero 6 open 12 throw 0`), and
each row must match it. If it differs, journal the live numbers and the rows that moved, and carry on with them.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T3: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/ocb-base-dts/`.

Batch 0 closes with the README gates. `npm test` and `npm run lint` were run at planning (decisions.md pre-flight);
`typecheck`, `build` and `format:check` run here for the first time on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the measurer runs, then it reports `plan-baseline.txt`'s numbers, or the journal says why
  not.

Observability is N/A: there are no new observable operations. Rollback is Reversible (revert the brief commit).
