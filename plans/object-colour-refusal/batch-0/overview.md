# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/object-colour-refusal/ and .agent-notes/ocr-plan.md may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/object-colour-refusal .agent-notes/ocr-plan.md
git commit -m "docs(ocr): add the object-colour-refusal brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/hidden-note-host/measurements/measure.mts plans/object-colour-refusal/measurements/probes /tmp/ocr-t0.json
```

The measurer must print the summary line in `measurements/plan-baseline.txt` (`rows 31 zero 7 open 24 throw 0`), and
each row must match it. If it differs, journal the live numbers and the rows that moved, and carry on with them.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T4: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/ocr-base-dts/`.

Batch 0 closes with the README gates. `npm test` and `npm run lint` ran at planning (decisions.md pre-flight).
`typecheck`, `build` and `format:check` run here for the first time on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the measurer runs, then it reports `plan-baseline.txt`'s numbers, or the journal says why
  not.

Observability: N/A. There are no new observable operations. Rollback: Reversible (revert the brief commit).
