# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/timing-engine-port/measurements/timing-rows.mjs tests/oracle/svg-conformance
npx jiti plans/timing-engine-port/measurements/pin-timing.mts
npx tsx scripts/svg-conformance-census.ts timing --json tests/oracle/svg-conformance/census-timing.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty (D8)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-timing.mts` must print `pins 0`. Rewrite the `timing`
note in `scripts/parity-dashboard-notes.ts` from measured numbers. Name every row left open in `DIVERGENCES.md` or on
its issue (D8). Update `planning/next-missions.md` with a `timing-engine-port (tep)` section and any follow-ons; mark
`planning/mission-guide.md` Phase 4b done with its result, as Phase 5m is, and Track SI-2 as replaced by
`src/core/time` + `src/core/decimal`; mark `planning/timing-deepdive.md` superseded by this brief (D1).

Comment on #127 with the outcome, and on #136 with the counts and any new issue (each new issue also gets its
"Blocked by" line on #136, D8). If `gh issue comment` is denied, do not work around it: leave the text in
`.agent-notes/tep-T6.md`.

Update `docs/catalog.md` if it drifts (`npm run catalog`). Mark the README status and done-when list, and add a Summary
section: tasks, gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the
CI risk:** read the latest PR run for the slowest shard and the routing/refusal part times
(`.claude/memory/ci-test-durations-from-blobs.md`). Write `.claude/memory/tep-status.md` with its `MEMORY.md` line, and
note in `.claude/memory/parity-issue-queue.md` that #127 ran. Commit `docs(tep): close out`, recording the close sha in
the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
