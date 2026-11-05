# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T4b | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance final --write
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npx tsx scripts/svg-conformance-census.ts c4 --json tests/oracle/svg-conformance/census-c4.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`dist/*.d.ts` unchanged against the base, or journaled. Rewrite `c4`'s note in `scripts/parity-dashboard-notes.ts:102` from measured numbers. Add a `c4-divergence-drive (c4dd)` section to `planning/next-missions.md` with any follow-ons.

Confirm `gikaju-64` still reads `firstDiff: error-page` and its ledger entry is untouched. Comment on #122, #145, #120, #115 or #140 for any row the shared fixes moved. Any new issue gets its "Blocked by" line on #136 (D7).

Update `docs/catalog.md` if the catalog drifts. Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, the rows left and their ends. **Name the CI risk:** #113's 282 pins and these are unmeasured on the runner until the first PR run; the slowest shard was 506 s of 600 s on #146. Write `.claude/memory/c4dd-status.md` with its `MEMORY.md` line, and note in `parity-issue-queue.md` that #114 ran. Commit `docs(c4dd): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
