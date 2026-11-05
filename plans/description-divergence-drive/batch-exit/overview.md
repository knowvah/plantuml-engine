# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T5e | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance final --write
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npx tsx scripts/svg-conformance-census.ts component --json tests/oracle/svg-conformance/census-component.json
npx tsx scripts/svg-conformance-census.ts usecase --json tests/oracle/svg-conformance/census-usecase.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`dist/*.d.ts` unchanged against the base, or journaled. Rewrite description's note in `scripts/parity-dashboard-notes.ts` from measured numbers. Strike or update codd's open residuals and dss 17, 22 in `planning/next-missions.md`, and add a `description-divergence-drive (ddd)` section with the follow-ons.

Comment on #145, #122 and #120 naming the rows closed (D6); on #114 with what T2a moved in `c4` (D1); on #119 if a row moved. Any new issue gets its "Blocked by" line on #136 (D7).

Update `docs/catalog.md` if the catalog drifts. Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, the rows left and their ends. **Name the CI risk:** the ratchet grows by 77 plus what the mission pins, unmeasured on the runner until the first PR run, and the slowest shard was 506 s of 600 s on #146. Write `.claude/memory/ddd-status.md` with its `MEMORY.md` line, and note in `parity-issue-queue.md` that #113 ran. Commit `docs(ddd): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
