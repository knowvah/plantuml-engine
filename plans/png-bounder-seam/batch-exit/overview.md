# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Docs, memory, issue comments; final gates and survey | orchestrator | `DIVERGENCES.md`, `oracle/README.md`, `planning/mission-guide.md`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `.claude/memory/*`, `plans/png-bounder-seam/{README,decision-journal}.md` | batch 2 | [x] |

## T3

1. Update `DIVERGENCES.md`:
   - The "Not a divergence: rollback atoms are sized by the PNG export" paragraph becomes resolved: seam #5, this
     mission, and the rows now conformant.
   - Each `kebadi`/`rozesu`/`roxita` line drops "the row's other diff is its rollback (#170)" if that diff is gone.
   - Add nothing to `oracle/accepted-divergences.json`.
2. In `planning/mission-guide.md`, update the wire line "`FileFormat.PNG` is outside the deterministic seam (wrp D3)" to
   say seam #5 covers it, and add one line under the factories phase.
3. Memory, under `.claude/memory/`:
   - Add `pbs-status.md` and its `MEMORY.md` line.
   - Update `oracle-seam-via-tmp-clone.md` with the seam-5 sha.
   - Update `instrument-space-width-zero.md`'s sibling facts if needed.
   - The `wrp-status` line keeps its history.
4. Run the final full survey, `verdict-diff.mjs <base>` (0 lost), and `npm run parity:dashboard`. Then run all README
   gates and `npm run format:check`.
5. Comment on #170 with:
   - the counts, and the D1 to D8 auto-confirmed list (link `plans/png-bounder-seam/decisions.md`), flagging D1's
     wire-print consequence for the user's audit;
   - the fork hand-off (D8): the `fetch … && merge --ff-only FETCH_HEAD` command that keeps the recorded sha, and the
     `git am` fallback with its `pin.json#seamCommit` follow-up;
   - the note that `oracle/build-oracle.sh` and `checkDriftGuard` against `~/git/plantuml` fail until it is applied;
   - how to rebuild `oracle/dist` from the fork afterwards (`oracle/build-oracle.sh`).

   Comment on #136 with the row moves. If a comment is denied, put its text in the journal and in
   `.claude/mission-logs/` per the queue's convention, and continue.
6. Fill the README "Summary" (tasks, verdicts, gates) and tick "Done when".
7. Commit `docs(pbs): close the png-bounder-seam mission` (`Refs: #170`).

## Acceptance

- Given the final survey, then 0 conformant rows are lost against `<base>`, and the five #170 rows named in "Done when"
  are conformant.
- Given #170, then it carries the hand-off comment, or the journal holds its text if posting was denied.
- Given all gates, then they exit 0 on the final tree.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
