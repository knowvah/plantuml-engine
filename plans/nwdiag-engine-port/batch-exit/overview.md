# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/nwdiag-engine-port/measurements/nwdiag-rows.mjs tests/oracle/svg-conformance
npx jiti plans/nwdiag-engine-port/measurements/pin-nwdiag.mts
npx tsx scripts/svg-conformance-census.ts unknown --json tests/oracle/svg-conformance/census-unknown.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-nwdiag.mts` must print `pins 0`. Rewrite the `network`
and `unknown` notes in `scripts/parity-dashboard-notes.ts:63-65` (and wherever the `unknown` shortfall text counts
"no engine yet") from measured numbers. Update `planning/next-missions.md`: a `nwdiag-engine-port (nwp)` section with
any follow-ons, and strike nwdiag from the "Unported engines' document background" item. Correct
`planning/mission-guide.md` Phase 4f: no rackdiag exists upstream, and the layout is `NTetris` columns, not "row-based"
nodes (D11). Leave `planning/roadmap.md` as it is and journal the rackdiag finding there.

Comment on #136, or on any bucket's issue a shared fix moved. Any new issue gets its "Blocked by" line on #136 (D6). If
`gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/nwp-T5.md`.

Update `docs/catalog.md` if it drifts. Mark the README status and done-when list, and add a Summary section: tasks,
gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the CI risk:** read
the latest PR run for the slowest shard and the routing/refusal part times. Write `.claude/memory/nwp-status.md` with
its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md` that #124 ran. Commit `docs(nwp): close out`,
recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
