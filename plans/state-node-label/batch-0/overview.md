# Batch 0: brief, baseline, file the separable row

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts, file the blank-label issue | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/state-node-label/ and .agent-notes/snl-plan.md may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/state-node-label .agent-notes/snl-plan.md
git commit -m "docs(snl): add the state-node-label brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/hidden-note-host/measurements/measure.mts plans/state-node-label/measurements/probes /tmp/snl-t0.json
```

The measurer must print `rows 31 zero 2 open 29 throw 0`, row for row as in `measurements/plan-baseline.txt`, except
the clock-digit id/comment diffs (the planning jar ids are frozen in the committed svgs, so those are stable). If it
differs, journal the live numbers and the rows that moved, and carry on with them.

**File the separable row.** `gh issue list --search "empty label" --state open` first; if none covers it, file a
`queue:ready` + `parity` issue: "State: `A --> B :  ` (empty label after the colon) draws; the jar errors at that
line". Include the two-line repro, the jar's `Error line 4` from `scripts/oracle-render.sh`, and the port's state
transition `LABEL_TAIL` (`src/diagrams/state/state-transitions.ts:63`) against `CommandLinkState.java`'s `LABEL`
leaf, quoted. Journal the issue number.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T7: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/snl-base-dts/`.

Batch 0 closes with the README gates. `npm test` and `npm run lint` ran at planning (decisions.md pre-flight).
`typecheck`, `build` and `format:check` run here for the first time on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the measurer runs, then it reports `plan-baseline.txt`'s numbers, or the journal says why
  not.
- Given the blank-label repro, when T0 finishes, then an open issue covers it and the journal names it.

Observability: N/A. There are no new observable operations. Rollback: Reversible (revert the brief commit).
