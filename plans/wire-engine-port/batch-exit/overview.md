# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/wire-engine-port/measurements/wire-rows.mjs tests/oracle/svg-conformance
npx jiti plans/wire-engine-port/measurements/pin-wire.mts
npx tsx scripts/svg-conformance-census.ts wire --json tests/oracle/svg-conformance/census-wire.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty (D8)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-wire.mts` must print `pins 0`. Rewrite the `wire` note in
`scripts/parity-dashboard-notes.ts` and `wire: 'D12 todo'` in `scripts/parity-dashboard-matrix.ts` from measured numbers.
Name every row left open in `DIVERGENCES.md` or on its issue (D8). Update `planning/next-missions.md` with a
`wire-engine-port (wrp)` section and any follow-ons; correct `planning/mission-guide.md:147,154-156` (wire does not use
`golem/`, D1) and add a Phase 5l done note with its result; update `planning/roadmap.md:125`.

Comment on #128 with the outcome, and on #136 with the counts and any new issue (each new issue also gets its "Blocked
by" line on #136, D8). If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/wrp-T5.md`.

Update `docs/catalog.md` if it drifts (`npm run catalog`). Mark the README status and done-when list, and add a Summary
section: tasks, gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the
CI risk:** read the latest PR run for the slowest shard and the routing/refusal part times
(`.claude/memory/ci-test-durations-from-blobs.md`). Write `.claude/memory/wrp-status.md` with its `MEMORY.md` line, and
note in `.claude/memory/parity-issue-queue.md` that #128 ran. Commit `docs(wrp): close out`, recording the close sha in
the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
