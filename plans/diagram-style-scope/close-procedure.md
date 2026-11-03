# Standard batch close (batches 0–4)

Agent: orchestrator. `N` = batch label, `prev` = the previous close's measurement
(`b0` for batch 1). `$T`/`$M` as in README.

## Steps
1. **Merge.** Commit any pending `plans/` edit first (`merge-one.sh` refuses a dirty tree;
   never chain `git branch -D` on the same line). Then `bash $M/merge-one.sh <Tn> "<subject>"
   <task test paths>`: `--no-ff` merge, typecheck, the diagram-style-scope ratchet, every engine's
   golden ratchet, `tests/architecture`, `tests/unit/oracle`, the task's tests. Before removing
   worktrees: `ps -Ao pid,command | grep worktrees/dss-` and kill leftovers.
2. **Measure.** `bash $M/close-measure.sh bN <prev>-eng`: four gates, d.ts `cmp` (stop 7),
   extended check, rows, 28-engine chain, verdict diff. Collected = on-disk (stop 11). A conformant
   loss is stop 4; every mover needs a journal row with its mechanism (stop 5 applies).
3. **Census.** List the attributes moving AWAY from the jar and any element-count growth on movers
   (memory `census-away-from-jar-catches-hidden-regressions`).
4. **Extended mode.** Journal every mover with its mechanism; rebaseline (`--write`) only after.
5. **Rows.** `node $M/repin-rows.mjs $M/bN-rows.json` lowers the pin (a rise is stop 6). Re-survey any
   engine whose conformant count rose and re-pin its parity file / golden (memory
   `repin-script-raises-preexisting-red-pin`: diff every baseline JSON before and after).
6. **Ledger.** `fixtures.md`: counts row for `bN`.
7. **Dashboard.** `npm run parity:dashboard` after any `parity-*.json` re-pin; `npm run catalog` if exports changed.
8. **Brief.** Tick the batch in `README.md` and its `overview.md`.
9. **Commit.** Full gates again if anything under `oracle/` or `tests/` changed in steps 4–7, then
   `chore(dss-bN): close batch N — <summary>` with explicit paths (never `git add plans/` while a
   chain writes `bN-eng/`).

## Write-set
`$M/bN*`, `$M/bN-eng/`, `$M/extended-baseline.json`, `decision-journal.md`, `fixtures.md`, `README.md`,
`batch-N/overview.md`, `oracle/goldens/diagram-style-scope.json`, the affected engines'
`oracle/goldens/svg-*/**` and `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`,
`docs/catalog.md`, `src/core/style-element-scope.ts` (signature additions only, with a citation).

## Acceptance
- Given the gates on the full suite, then all four pass and collected = on-disk.
- Given the all-engine diff, then every change has a journal row with a mechanism and no engine lost a conformant row.
- Given the row measure vs the previous close, then no row rose.

Observability: N/A (measurement task). Rollback: Reversible.
