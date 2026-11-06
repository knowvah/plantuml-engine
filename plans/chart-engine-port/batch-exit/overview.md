# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/chart-engine-port/measurements/pin-chart.mts
npx tsx scripts/svg-conformance-census.ts chart --json tests/oracle/svg-conformance/census-chart.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-chart.mts` must print `pins 0`. Rewrite `chart`'s note in `scripts/parity-dashboard-notes.ts:109` from measured numbers. Add a `chart-engine-port (cep)` section to `planning/next-missions.md` with any follow-ons, and strike dss follow-on 21's chart part at line 104 and dbp follow-on 2's chart part at line 119.

Comment on #120, #122, #145 or #136 for anything the shared fixes moved. Any new issue gets its "Blocked by" line on #136 (D8).

Update `docs/catalog.md` if it drifts. Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, the rows left and their ends. **Name the CI risk:** the slowest shard was 506 s of 600 s on #146; read #153's latest run for the current number. Write `.claude/memory/cep-status.md` with its `MEMORY.md` line, and note in `parity-issue-queue.md` that #116 ran. Commit `docs(cep): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
