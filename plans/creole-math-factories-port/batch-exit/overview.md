# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/creole-math-factories-port/measurements/factory-rows.mjs tests/oracle/svg-conformance
npx jiti plans/creole-math-factories-port/measurements/pin-factories.mts
npx tsx scripts/svg-conformance-census.ts unknown --json tests/oracle/svg-conformance/census-unknown.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty (D12)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-factories.mts` must print `pins 0`. Update `planning/next-missions.md` with a
`creole-math-factories-port (cmf)` section and any follow-ons; update `planning/mission-guide.md` and `planning/roadmap.md` to mark the five
factories done.

Comment on #129 with the outcome, and on #136 with the counts and any new issue (each new issue also gets its "Blocked by" line on #136,
D8). If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/cmf-T5.md`.

Update `docs/catalog.md` if it drifts (`npm run catalog`). Mark the README status and done-when list, and add a Summary section: tasks, gates
with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the CI risk:** read the latest PR run for the
slowest shard and the routing/refusal part times (`.claude/memory/ci-test-durations-from-blobs.md`). Write `.claude/memory/cmf-status.md` with
its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md` that #129 ran. Commit `docs(cmf): close out`, recording the close
sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
