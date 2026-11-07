# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T7 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory, issue comments | T6a | [x] |

## T7

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/activity-authored-rows/measurements/row-diffs.mts tests/oracle/svg-conformance/parity-activity.json /tmp/aar-final/diffs.json
npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/aar-final/rows.json
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json
npm run build
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

1. Every in-scope row (D1) is conformant, or has a journal row naming its end per D10. List them in the README
   summary, family by family.
2. `oracle/accepted-divergences.json` is unchanged. `dist/*.d.ts` is identical to `/tmp/aar-b0/dts` (stop 4
   otherwise).
3. Every corpus row that turned conformant is pinned in the activity golden ratchet (or the activity `unknown`
   tree for `dijapi-54`); the dss pin holds every row at or under its T0 count. Journal each pin.
4. `docs/parity-report.md` regenerated (drift test green). `docs/catalog.md` regenerated if it drifts.
5. Update `planning/next-missions.md`: strike dss follow-ons 9, 10, 12, 13, 15, 16 and ubt follow-ons 2 and 4 with
   what closed them, strike smc follow-on 2 if T4a closed it, and add an `activity-authored-rows (aar)` section with
   any follow-ons.
6. Comment on #121 with the summary. Comment on any issue whose rows `verdict-diff` shows moving (#123 for legacy
   rows; #138 if a partition row moved). A new `queue:ready` issue gets a "Blocked by" line on #136 (D10). If `gh`
   writes are denied, put each comment's text in the journal for the user.
7. Add a Summary section to the README: tasks, gates with counts, verdicts before and after per engine, rows
   before and after (corpus Σ, `rows N open M`), pins added, decisions flagged for review, and the CI risk (the dss
   ratchet's runtime grew by T0's rows; new goldens are unmeasured on the runner until the first PR run).
8. Write `.claude/memory/aar-status.md` with its `MEMORY.md` line, and note in
   `.claude/memory/parity-issue-queue.md` that #121 ran. Commit `docs(aar): close out`, and record the close sha
   in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences and d.ts diffs are empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
