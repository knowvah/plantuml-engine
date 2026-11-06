# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T4b | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/object-divergence-drive/measurements/pin-object.mts
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npx tsx scripts/svg-conformance-census.ts object --json tests/oracle/svg-conformance/census-object.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-object.mts` must print `pins 0`. Rewrite `object`'s note in `scripts/parity-dashboard-notes.ts:121` from measured numbers: its "not yet diagnosed row by row" stops being true. Add an `object-divergence-drive (odd)` section to `planning/next-missions.md` with any follow-ons, and strike dss follow-on 22's `0.167 px map/object stereotype y offset` at line 105 and `planning/next-missions.md:936`'s `MaximumWidth` if fixed.

Comment on #122, #145, #120, #140 or #144 for any row the shared fixes moved. Any new issue gets its "Blocked by" line on #136 (D8).

Update `docs/catalog.md` if the catalog drifts. Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, the rows left and their ends. **Name the CI risk:** #113's 282 pins, c4dd's 7 and these are unmeasured on the runner until the first PR run; the slowest shard was 506 s of 600 s on #146. Write `.claude/memory/odd-status.md` with its `MEMORY.md` line, and note in `parity-issue-queue.md` that #115 ran. Commit `docs(odd): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
