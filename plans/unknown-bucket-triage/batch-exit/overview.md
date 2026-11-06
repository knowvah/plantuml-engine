# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T3c | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/unknown-bucket-triage/measurements/scope.mjs tests/oracle/svg-conformance/parity-unknown.json --ubt
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npx tsx scripts/svg-conformance-census.ts unknown --json tests/oracle/svg-conformance/census-unknown.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`scope.mjs --ubt` lists only rows named in `DIVERGENCES.md` (the 2 HCL, 2 sudoku) or on an issue per D7, and no
`??`. `dist/*.d.ts` unchanged against the base, or journaled. The `unknown` note in `docs/parity-report.md` is
generated from the survey (`scripts/parity-dashboard-notes.ts:128`, `unknownDetail`): check it regenerated, and do
not hand-edit it. Add an `unknown-bucket-triage (ubt)` section to `planning/next-missions.md` with any
follow-ons.

Comment on #120, #121, #122, #123, #139, #140 or #145 for any of their rows a shared fix moved (`verdict-diff`
names them). Any new issue gets its "Blocked by" line on #136 (D7).

Update `docs/catalog.md` if the catalog drifts. Mark the README status and done-when list, and add a Summary section:
tasks, gates with counts, verdicts before and after, the rows left and their ends, pins added per ratchet. **Name
the CI risk:** the queue's pins since #146 and these are unmeasured on the runner until the first PR run; the
slowest shard was 506 s of 600 s on #146. Write `.claude/memory/ubt-status.md` with its `MEMORY.md` line, and note
in `.claude/memory/parity-issue-queue.md` that #119 ran. Commit `docs(ubt): close out`, recording the close sha in
the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
