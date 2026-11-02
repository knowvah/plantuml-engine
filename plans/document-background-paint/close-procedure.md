# Standard batch close (batches 0–2)

Agent: orchestrator. `N` = batch label, `prev` = the previous close's
measurement (`b0` for batch 1). `$T`/`$M` as in README.

## Steps
1. **Merge.** Commit any pending `plans/` edit first (`merge-one.sh` refuses a
   dirty tree; never chain `git branch -D` on the same line). Then `bash
   $M/merge-one.sh <Tn> "<subject>" <task test paths>`: `--no-ff` merge,
   typecheck, the document-background ratchet, the affected engines' golden
   ratchets, `tests/architecture`, `tests/unit/oracle`, the task's tests.
   Before removing worktrees: `ps -Ao pid,command | grep worktrees/dbp-` and kill leftovers.
2. **Four gates.** `bash $M/gates.sh bN`. Collected = on-disk (stop 11).
   `cmp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt` (stop 6).
3. **All engines** (every close that merged a `src/` change). `bash $M/chain.sh bN-eng`;
   `node $T/verdict-diff.mjs $M/<prev>-eng $M/bN-eng`. A conformant loss is
   stop 5; every mover needs a journal row with its mechanism (a mover whose
   fixture has no `<style>` document background and no skinparam background is a halt).
4. **Extended mode.** `npx tsx $T/extended-baseline.mts --check $M/extended-baseline.json`:
   journal every mover with its mechanism; rebaseline (`--write`) only after.
5. **Document-background rows.** `npx tsx $T/diff-row.mts --all --json $M/bN-dbg.json`;
   lower `oracle/goldens/document-background.json` to the new measure (a rise
   anywhere is stop 5). Re-survey any engine whose conformant count rose and
   re-pin its parity file / golden (memory `repin-script-raises-preexisting-red-pin`:
   diff every baseline JSON before and after — a pin that ROSE is an adopted regression).
6. **Ledger.** `fixtures.md`: counts row for `bN`.
7. **Dashboard.** `npm run parity:dashboard` after any `parity-*.json` re-pin; `npm run catalog` if exports changed.
8. **Brief.** Tick the batch in `README.md` and its `overview.md`.
9. **Commit.** Full gates again if anything under `oracle/` or `tests/` changed
   in steps 4–7, then `chore(dbp-bN): close batch N — <summary>` with explicit
   paths (never `git add plans/` while a chain writes `bN-eng/`).

## Write-set
`$M/bN*`, `$M/bN-eng/`, `$M/extended-baseline.json`, `decision-journal.md`, `fixtures.md`, `README.md`,
`batch-N/overview.md`, `oracle/goldens/document-background.json`, the affected
engines' `oracle/goldens/svg-*/**` and `tests/oracle/svg-conformance/parity-*.json`,
the routing/refusal pins and their count assertions, `docs/parity-report.md`, `docs/catalog.md`.

## Acceptance
- Given the gates on the full suite, then all four pass and collected = on-disk.
- Given the all-engine diff, then every change has a journal row with a mechanism and no engine lost a conformant row.
- Given the document-background measure vs the previous close, then no row rose.

Observability: N/A (measurement task). Rollback: Reversible.
