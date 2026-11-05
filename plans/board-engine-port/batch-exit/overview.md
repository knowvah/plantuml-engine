# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/board-engine-port/measurements/pin-board.mts
npx tsx scripts/svg-conformance-census.ts board --json tests/oracle/svg-conformance/census-board.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-board.mts` must print `pins 0`. Delete `board`'s note in `scripts/parity-dashboard-notes.ts:96` if every row is conformant, else rewrite it from measured numbers. Add a `board-engine-port (bep)` section to `planning/next-missions.md` with any follow-ons, including the shared `javaStringHashCode` consolidation (D3) if still open.

Comment on #120, #122, #145 or #136 for anything a shared fix moved. Any new issue gets its "Blocked by" line on #136 (D7). If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/bep-T5.md` (pep journal row 35).

Update `docs/catalog.md` if it drifts. Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the CI risk:** the slowest shard was 564 s on #153; read the latest PR run for the current number. Write `.claude/memory/bep-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md` that #118 ran. Commit `docs(bep): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
