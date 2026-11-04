# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T7 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T6d | [x] |

## T7

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/state-divergence-drive/measurements/verdict-diff.mjs <base>
npx tsx scripts/svg-conformance-census.ts state --json tests/oracle/svg-conformance/census-state.json
node plans/state-divergence-drive/measurements/pin-state.mjs <yyyy-mm-dd>
node plans/state-divergence-drive/measurements/pins-vs-census.mjs
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`dist/*.d.ts` unchanged against the base, or journaled. Rewrite state's note in `scripts/parity-dashboard-notes.ts` from measured numbers, and strike or update dss 3, 14, 17, 19 in `planning/next-missions.md`, adding a `state-divergence-drive (stdd)` section with its follow-ons. Comment on #120 and #122 which rows this
closed (D7), and on #119 if it moved. Update `docs/catalog.md` if the catalog drifts.

Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, the rows left and their ends. **Name the CI risk:** the ratchet may grow by up to 164 fixtures, unmeasured on the runner until the first PR run. File `.claude/memory/stdd-status.md`,
its `MEMORY.md` line, and note in `parity-issue-queue.md` that #112 ran. Commit `docs(stdd): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
