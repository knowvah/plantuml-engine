# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory, issue comments | T4d | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/smc-final/rows.json
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json
npm run build
git diff <base> HEAD --stat -- dist
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

1. Every in-scope row from the README table is conformant, or has a journal row naming its end per D10: a
   `DIVERGENCES.md` entry with its forcing library or ruling, a `needs-ruling` issue, or a separable issue. List them
   in the README summary, family by family.
2. `oracle/accepted-divergences.json` is unchanged. `dist/*.d.ts` is identical to the base build (stop 4 otherwise).
3. The dss pin holds every row at or under its T0 count. `gigefo-15` and `finadu-74` are pinned in the activity
   ratchet, and any other corpus row that went conformant is pinned in its own bucket's ratchet. Journal each pin.
4. `docs/parity-report.md` regenerated (drift test green). `docs/catalog.md` regenerated if it drifts.
5. Update `planning/next-missions.md`: strike dss follow-ons 1-4 with what closed them, and add a
   `style-mode-cascades (smc)` section with any follow-ons.
6. Comment on #120 with the summary. Comment on #121 for `gigefo-15` and `finadu-74`, on #122 if
   `component__probe-cond-root` moved, and on any issue whose rows `verdict-diff` shows moving. A new `queue:ready`
   issue gets a "Blocked by" line on #136 (D10).
7. Add a Summary section to the README: tasks, gates with counts, verdicts before and after per engine, dss rows
   before and after (`rows N open M`), pins added, decisions flagged for review. **Name the CI risk:** the dss
   ratchet's runtime grew by T0's rows (journaled), and the queue's pins since #146 are unmeasured on the runner until
   the first PR run.
8. Write `.claude/memory/smc-status.md` with its `MEMORY.md` line, and note in
   `.claude/memory/parity-issue-queue.md` that #120 ran. Commit `docs(smc): close out`, and record the close sha in
   the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences and d.ts diffs are empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
